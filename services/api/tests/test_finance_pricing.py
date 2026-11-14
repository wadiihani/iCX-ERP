import pytest
from decimal import Decimal
from fastapi.testclient import TestClient


def get_auth_token(client):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@aiesec.org.ma", "password": "AdminSecret123"},
    )
    return res.json()["access_token"]


def test_pricing_calculation_and_obligations(client: TestClient):
    admin_token = get_auth_token(client)
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Create a versioned pricing rule set for iGTa
    rule_payload = {
        "rule_name": "Rabat iGTa Corporate 2026 Tier",
        "product_type": "iGTa",
        "version": 1,
        "currency": "MAD",
        "base_fee": 4500.00,
        "min_duration_weeks": 6,
        "max_duration_weeks": 78,
        "weekly_additional_rate": 350.00,
        "administrative_fee": 500.00,
        "discount_tier_percentage": 10.00 # 10% discount for >= 12 weeks
    }
    resp = client.post("/api/v1/finance/rulesets", json=rule_payload, headers=admin_headers)
    assert resp.status_code == 201, resp.text
    rule_data = resp.json()
    rule_id = rule_data["id"]
    assert rule_data["rule_name"] == "Rabat iGTa Corporate 2026 Tier"

    # 2. Test deterministic calculation: 6 weeks (no extra weeks, no discount)
    calc_payload_6w = {
        "rule_set_id": rule_id,
        "duration_weeks": 6,
        "modality": "PHYSICAL",
        "num_trainees": 1
    }
    calc_resp = client.post("/api/v1/finance/calculate", json=calc_payload_6w, headers=admin_headers)
    assert calc_resp.status_code == 200, calc_resp.text
    calc_6w = calc_resp.json()
    # base 4500 + admin 500 = 5000
    assert float(calc_6w["base_subtotal"]) == 4500.00
    assert float(calc_6w["additional_duration_cost"]) == 0.00
    assert float(calc_6w["administrative_fee"]) == 500.00
    assert float(calc_6w["discount_applied"]) == 0.00
    assert float(calc_6w["total_calculated_fee"]) == 5000.00

    # 3. Test calculation for 14 weeks (14 - 6 = 8 extra weeks * 350 = 2800; discount = 10% on (4500+2800)=730; admin 500)
    # Total = 4500 + 2800 + 500 - 730 = 7070.00
    calc_payload_14w = {
        "rule_set_id": rule_id,
        "duration_weeks": 14,
        "modality": "PHYSICAL",
        "num_trainees": 1
    }
    calc_14w_resp = client.post("/api/v1/finance/calculate", json=calc_payload_14w, headers=admin_headers)
    assert calc_14w_resp.status_code == 200
    calc_14w = calc_14w_resp.json()
    assert float(calc_14w["additional_duration_cost"]) == 2800.00
    assert float(calc_14w["discount_applied"]) == 730.00
    assert float(calc_14w["total_calculated_fee"]) == 7070.00

    # 4. Create Payment Obligation
    ob_payload = {
        "obligation_title": "First Tranche - 30% on Match",
        "milestone_trigger": "MATCH_APPROVED",
        "expected_amount": 2121.00,
        "currency": "MAD",
        "due_date": "2026-06-01"
    }
    ob_resp = client.post("/api/v1/finance/obligations", json=ob_payload, headers=admin_headers)
    assert ob_resp.status_code == 201, ob_resp.text
    obligation = ob_resp.json()
    ob_id = obligation["id"]
    assert obligation["status"] == "PENDING"
    assert float(obligation["paid_amount"]) == 0.00

    # 5. Record Partial Payment
    pay_payload = {
        "obligation_id": ob_id,
        "amount_paid": 1000.00,
        "currency": "MAD",
        "payment_method": "BANK_TRANSFER",
        "transaction_reference": "BMCE-TRX-987654",
        "receipt_doc_url": "https://vault.aiesec.ma/receipts/987654.pdf"
    }
    pay_resp = client.post("/api/v1/finance/payments", json=pay_payload, headers=admin_headers)
    assert pay_resp.status_code == 201, pay_resp.text

    # Re-fetch obligations to verify PARTIALLY_PAID
    obs = client.get("/api/v1/finance/obligations", headers=admin_headers).json()
    target_ob = next(o for o in obs if o["id"] == ob_id)
    assert target_ob["status"] == "PARTIALLY_PAID"
    assert float(target_ob["paid_amount"]) == 1000.00

    # 6. Record Second Payment to complete obligation
    pay_payload_2 = {
        "obligation_id": ob_id,
        "amount_paid": 1121.00,
        "currency": "MAD",
        "payment_method": "BANK_TRANSFER",
        "transaction_reference": "BMCE-TRX-987655"
    }
    client.post("/api/v1/finance/payments", json=pay_payload_2, headers=admin_headers)
    obs = client.get("/api/v1/finance/obligations", headers=admin_headers).json()
    target_ob = next(o for o in obs if o["id"] == ob_id)
    assert target_ob["status"] == "PAID"
    assert float(target_ob["paid_amount"]) == 2121.00

    # 7. Test Financial Case (Fee Waiver / Discount Request)
    # Create a 2nd obligation
    ob2_resp = client.post("/api/v1/finance/obligations", json={
        "obligation_title": "Second Tranche - 70% on Arrival",
        "milestone_trigger": "ARRIVAL",
        "expected_amount": 4949.00,
        "currency": "MAD",
        "due_date": "2026-07-01"
    }, headers=admin_headers)
    ob2_id = ob2_resp.json()["id"]

    case_payload = {
        "case_type": "FEE_WAIVER",
        "obligation_id": ob2_id,
        "requested_amount": 4949.00,
        "currency": "MAD",
        "reason": "Host NGO partner negotiated subsidy waiver per MC partnership agreement"
    }
    case_resp = client.post("/api/v1/finance/cases", json=case_payload, headers=admin_headers)
    assert case_resp.status_code == 201
    case_id = case_resp.json()["id"]
    assert case_resp.json()["status"] == "PENDING_APPROVAL"

    # Human review: Approve waiver
    rev_payload = {
        "status": "APPROVED",
        "review_notes": "Approved by LCP following National Board concurrence."
    }
    rev_resp = client.put(f"/api/v1/finance/cases/{case_id}/review", json=rev_payload, headers=admin_headers)
    assert rev_resp.status_code == 200
    assert rev_resp.json()["status"] == "APPROVED"

    # Check obligation is now WAIVED
    obs = client.get("/api/v1/finance/obligations", headers=admin_headers).json()
    ob2 = next(o for o in obs if o["id"] == ob2_id)
    assert ob2["status"] == "WAIVED"
