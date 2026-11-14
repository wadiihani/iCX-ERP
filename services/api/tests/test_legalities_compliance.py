import pytest
from fastapi.testclient import TestClient


def get_auth_token(client):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@aiesec.org.ma", "password": "AdminSecret123"},
    )
    return res.json()["access_token"]


def test_risk_register_and_iac_compliance(client: TestClient):
    admin_token = get_auth_token(client)
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Create Risk Register Entry (5x5 matrix)
    risk_payload = {
        "risk_category": "LEGAL",
        "title": "Delayed Volunteer Visa Renewal at Prefecture",
        "description": "Foreign EP visa extension delays exceeding 30 days due to bureau administrative backlog.",
        "probability": 4,
        "impact": 5,
        "mitigation_plan": "Engage legal liaison at Rabat Prefecture 3 weeks before expiry with certified AIESEC endorsement letter.",
        "contingency_plan": "Re-route EP to border run or temporary accommodation stipend."
    }
    resp = client.post("/api/v1/legalities/risks", json=risk_payload, headers=admin_headers)
    assert resp.status_code == 201, resp.text
    risk_data = resp.json()
    risk_id = risk_data["id"]
    assert risk_data["probability"] == 4
    assert risk_data["impact"] == 5
    # Severity score = 4 * 5 = 20
    assert risk_data["severity_score"] == 20
    assert risk_data["status"] == "IDENTIFIED"

    # Update risk status to MITIGATING
    upd_resp = client.put(f"/api/v1/legalities/risks/{risk_id}", json={
        "status": "MITIGATING",
        "probability": 2 # Mitigation reduced probability
    }, headers=admin_headers)
    assert upd_resp.status_code == 200
    upd_data = upd_resp.json()
    assert upd_data["status"] == "MITIGATING"
    assert upd_data["probability"] == 2
    assert upd_data["severity_score"] == 10 # 2 * 5

    # 2. IAC Audit Item
    iac_payload = {
        "audit_cycle": "2026-Q1-AUDIT",
        "check_item": "Partner Signed Framework Agreement & Annexes",
        "category": "CONTRACTS",
        "description": "Verify that all active organizations have a valid, signed bilateral contract on file.",
        "is_mandatory": True,
        "evidence_url": "https://vault.aiesec.ma/contracts/2026-partner.pdf"
    }
    iac_resp = client.post("/api/v1/legalities/iac", json=iac_payload, headers=admin_headers)
    assert iac_resp.status_code == 201, iac_resp.text
    iac_item = iac_resp.json()
    item_id = iac_item["id"]
    assert iac_item["compliance_status"] == "PENDING_AUDIT"

    # Perform audit
    audit_resp = client.put(f"/api/v1/legalities/iac/{item_id}", json={
        "compliance_status": "VERIFIED",
        "findings": "All required signatures and stamps validated by IAC Inspector."
    }, headers=admin_headers)
    assert audit_resp.status_code == 200
    assert audit_resp.json()["compliance_status"] == "VERIFIED"

    # 3. Legal Document Repository
    doc_payload = {
        "document_category": "INSURANCE",
        "title": "EP Mandatory Repatriation & Medical Insurance Certificate",
        "file_url": "https://vault.aiesec.ma/docs/insurance_ep_123.pdf",
        "valid_from": "2026-06-01",
        "valid_until": "2026-08-01",
        "is_signed": True
    }
    doc_resp = client.post("/api/v1/legalities/documents", json=doc_payload, headers=admin_headers)
    assert doc_resp.status_code == 201
    doc_data = doc_resp.json()
    assert doc_data["document_category"] == "INSURANCE"
    assert doc_data["is_signed"] is True
