import pytest
from datetime import datetime, timezone, timedelta, date


def get_auth_token(client):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@aiesec.org.ma", "password": "AdminSecret123"},
    )
    return res.json()["access_token"]


def setup_matching_fixtures(client, headers):
    # 1. Org
    org_res = client.post(
        "/api/v1/organizations",
        json={"name": "Maroc Social Innovation", "sector": "NGO"},
        headers=headers,
    )
    org_id = org_res.json()["id"]

    # 2. Signed Contract
    today = date.today()
    ctr_res = client.post(
        "/api/v1/contracts",
        json={
            "contract_number": f"CTR-MATCH-{org_id[:8]}",
            "organization_id": org_id,
            "title": "iGV Annual Partnership",
            "product_types": ["iGV"],
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=180)).isoformat(),
            "total_slots": 2,
        },
        headers=headers,
    )
    ctr_id = ctr_res.json()["id"]
    client.post(f"/api/v1/contracts/{ctr_id}/sign", json={"signed_by_partner": "Director"}, headers=headers)

    # 3. Opportunity with 2 slots
    opp_res = client.post(
        "/api/v1/opportunities",
        json={
            "opportunity_code": f"OPP-MATCH-{org_id[:6]}",
            "contract_id": ctr_id,
            "organization_id": org_id,
            "title": "Clean Water Volunteer",
            "product_type": "iGV",
            "modality": "PHYSICAL",
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(weeks=6)).isoformat(),
            "duration_weeks": 6,
            "working_hours_per_week": 30,
            "location": "Rabat, Morocco",
            "description": "Access to clean water initiatives.",
            "role_description": "Water testing and public awareness.",
            "openings_capacity": 2,
            "line_manager_name": "Driss Bennani",
            "igv_details": {"sdg_number": 6, "global_project_name": "Aquasafe"},
        },
        headers=headers,
    )
    opp_id = opp_res.json()["id"]

    # 4. EP
    ep_res = client.post(
        "/api/v1/crm/eps",
        json={
            "first_name": "Sophie",
            "last_name": "Muller",
            "email": f"sophie.{org_id[:6]}@aiesec.net",
            "country_of_residence": "Germany",
            "nationality": "German",
            "phone": "+491701234567",
        },
        headers=headers,
    )
    ep_id = ep_res.json()["id"]

    # 5. Application
    app_res = client.post(
        "/api/v1/applications",
        json={"ep_id": ep_id, "opportunity_id": opp_id},
        headers=headers,
    )
    app_id = app_res.json()["id"]

    return opp_id, ep_id, app_id


def test_acceptance_note_and_match_approval_with_decoupled_readiness(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    opp_id, ep_id, app_id = setup_matching_fixtures(client, headers)

    # 1. Attempt to approve match prematurely -> 400 Bad Request
    fail_approve = client.post(f"/api/v1/applications/{app_id}/match-approve", json={}, headers=headers)
    assert fail_approve.status_code == 400
    assert "acceptance note" in fail_approve.json()["detail"].lower()

    # 2. Upload and verify Acceptance Note
    today = date.today()
    note_res = client.post(
        f"/api/v1/applications/{app_id}/acceptance-note",
        json={
            "document_url": "https://storage.aiesec.org/an/AN-10029.pdf",
            "ep_signature_date": today.isoformat(),
            "partner_signature_date": today.isoformat(),
            "is_verified": True,
            "verification_notes": "Both signatures and dates verified.",
        },
        headers=headers,
    )
    assert note_res.status_code == 200
    assert note_res.json()["is_verified"] is True

    # Check that stage progressed to ACCEPTED and official EXPA status to ACC
    app_accepted = client.get(f"/api/v1/applications/{app_id}", headers=headers).json()
    assert app_accepted["current_stage"] == "ACCEPTED"
    assert app_accepted["official_expa_status"] == "ACC"

    # 3. Record SE payment proof
    payment_res = client.post(
        f"/api/v1/applications/{app_id}/se-payment",
        json={
            "payment_reference": "SE-WIRE-2027-01",
            "amount_eur": 350.0,
            "proof_document_url": "https://storage.aiesec.org/receipts/SE-WIRE-2027-01.pdf",
            "is_verified": True,
        },
        headers=headers,
    )
    assert payment_res.status_code == 200
    assert payment_res.json()["payment_reference"] == "SE-WIRE-2027-01"

    # 4. Finalize Match Approval
    approve_res = client.post(
        f"/api/v1/applications/{app_id}/match-approve",
        json={"notes": "All standards acknowledged, visa checklist shared."},
        headers=headers,
    )
    assert approve_res.status_code == 200
    app_approved = approve_res.json()
    assert app_approved["current_stage"] == "APPROVED"
    assert app_approved["official_expa_status"] == "APD"
    assert app_approved["operational_readiness"] == "READY"
    assert app_approved["slot_id"] is not None

    # Check slot is now ALLOCATED
    slots = client.get(f"/api/v1/opportunities/{opp_id}/slots", headers=headers).json()
    allocated_slot = next(s for s in slots if s["id"] == app_approved["slot_id"])
    assert allocated_slot["status"] == "ALLOCATED"
    assert allocated_slot["current_application_id"] == app_id

    # 5. Core Invariant Test: Decoupled Operational Readiness Mutation
    # Local operator flags operational readiness as AT_RISK (e.g. flight delay or visa appointment backlog)
    readiness_res = client.put(
        f"/api/v1/applications/{app_id}/readiness",
        json={"operational_readiness": "AT_RISK", "notes": "Consulate appointment delayed by 2 weeks"},
        headers=headers,
    )
    assert readiness_res.status_code == 200
    updated_app = readiness_res.json()
    assert updated_app["operational_readiness"] == "AT_RISK"
    # CRITICAL: Official EXPA status MUST REMAIN 'APD' — NEVER MUTATED TO AT_RISK!
    assert updated_app["official_expa_status"] == "APD"
