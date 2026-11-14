import pytest
from datetime import date, timedelta


def get_auth_token(client):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@aiesec.org.ma", "password": "AdminSecret123"},
    )
    return res.json()["access_token"]


def setup_org_and_contract(client, headers, contract_status="SIGNED"):
    # Create Org
    org_res = client.post(
        "/api/v1/organizations",
        json={"name": "Al Akhawayn NGO", "sector": "NGO"},
        headers=headers,
    )
    org_id = org_res.json()["id"]

    today = date.today()
    ctr_res = client.post(
        "/api/v1/contracts",
        json={
            "contract_number": f"CTR-OPP-{org_id[:8]}",
            "organization_id": org_id,
            "title": "iGV Partner Agreement",
            "product_types": ["iGV"],
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=180)).isoformat(),
            "total_slots": 5,
        },
        headers=headers,
    )
    ctr_id = ctr_res.json()["id"]

    if contract_status == "SIGNED":
        client.post(
            f"/api/v1/contracts/{ctr_id}/sign",
            json={"signed_by_partner": "NGO Director"},
            headers=headers,
        )

    return org_id, ctr_id


def test_contract_prerequisite_for_opportunity(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # Setup contract that is only in DRAFT status
    org_id, draft_ctr_id = setup_org_and_contract(client, headers, contract_status="DRAFT")

    today = date.today()
    payload = {
        "opportunity_code": "OPP-DRAFT-FAIL",
        "contract_id": draft_ctr_id,
        "organization_id": org_id,
        "title": "Global Volunteer Climate Action",
        "product_type": "iGV",
        "modality": "PHYSICAL",
        "start_date": today.isoformat(),
        "end_date": (today + timedelta(weeks=6)).isoformat(),
        "duration_weeks": 6,
        "working_hours_per_week": 30,
        "location": "Rabat, Morocco",
        "description": "Engage local community in climate action and recycling education.",
        "role_description": "Deliver interactive youth workshops on sustainability.",
        "openings_capacity": 2,
        "igv_details": {
            "sdg_number": 13,
            "global_project_name": "Climate Champions",
            "housing_provided": True,
        },
    }

    # Attempt to create against DRAFT contract -> must be rejected
    res = client.post("/api/v1/opportunities", json=payload, headers=headers)
    assert res.status_code == 400
    assert "active signed contracts" in res.json()["detail"].lower()


def test_opportunity_creation_and_slots_generation(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    org_id, signed_ctr_id = setup_org_and_contract(client, headers, contract_status="SIGNED")

    today = date.today()
    payload = {
        "opportunity_code": "OPP-IGV-2027",
        "contract_id": signed_ctr_id,
        "organization_id": org_id,
        "title": "Youth Literacy Mentor",
        "product_type": "iGV",
        "modality": "PHYSICAL",
        "start_date": today.isoformat(),
        "end_date": (today + timedelta(weeks=6)).isoformat(),
        "duration_weeks": 6,
        "working_hours_per_week": 30,
        "location": "Rabat, Morocco",
        "description": "Literacy development program for youth in Rabat public schools.",
        "role_description": "Facilitate reading clubs and English communication sessions.",
        "openings_capacity": 3,
        "line_manager_name": "Fatima Zahra",
        "line_manager_contact": "+212611223344",
        "igv_details": {
            "sdg_number": 4,
            "global_project_name": "Global Classroom",
            "housing_provided": True,
        },
    }

    create_res = client.post("/api/v1/opportunities", json=payload, headers=headers)
    assert create_res.status_code == 201
    opp_data = create_res.json()
    assert opp_data["opportunity_code"] == "OPP-IGV-2027"
    assert opp_data["openings_capacity"] == 3
    assert opp_data["filled_openings"] == 0
    opp_id = opp_data["id"]

    # Verify 3 distinct capacity slots were auto-generated
    slots_res = client.get(f"/api/v1/opportunities/{opp_id}/slots", headers=headers)
    assert slots_res.status_code == 200
    slots = slots_res.json()
    assert len(slots) == 3
    slot_numbers = [s["slot_number"] for s in slots]
    assert "OPP-IGV-2027-SLOT-1" in slot_numbers
    assert "OPP-IGV-2027-SLOT-2" in slot_numbers
    assert "OPP-IGV-2027-SLOT-3" in slot_numbers


def test_slot_reservation_concurrency_control(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    org_id, signed_ctr_id = setup_org_and_contract(client, headers, contract_status="SIGNED")

    today = date.today()
    opp_res = client.post(
        "/api/v1/opportunities",
        json={
            "opportunity_code": "OPP-SLOT-TEST",
            "contract_id": signed_ctr_id,
            "organization_id": org_id,
            "title": "Summer Camp Host",
            "product_type": "iGV",
            "modality": "PHYSICAL",
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(weeks=6)).isoformat(),
            "duration_weeks": 6,
            "working_hours_per_week": 30,
            "location": "Rabat, Morocco",
            "description": "Summer camp volunteering project.",
            "role_description": "Organize sports and arts activities.",
            "openings_capacity": 1,
            "igv_details": {"sdg_number": 3, "global_project_name": "Health Camp"},
        },
        headers=headers,
    )
    opp_id = opp_res.json()["id"]

    # Fetch slot
    slots = client.get(f"/api/v1/opportunities/{opp_id}/slots", headers=headers).json()
    slot_id = slots[0]["id"]
    assert slots[0]["status"] == "OPEN"

    # Reserve slot for Application 1
    res1 = client.post(
        f"/api/v1/opportunities/slots/{slot_id}/reserve?application_id=APP-001",
        headers=headers,
    )
    assert res1.status_code == 200
    assert res1.json()["status"] == "RESERVED"
    assert res1.json()["current_application_id"] == "APP-001"

    # Attempt to reserve the same slot again -> 409 Conflict (prevents double-booking)
    res2 = client.post(
        f"/api/v1/opportunities/slots/{slot_id}/reserve?application_id=APP-002",
        headers=headers,
    )
    assert res2.status_code == 409
    assert "already" in res2.json()["detail"].lower()


def test_publication_checklist_and_publish(client, db):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    org_id, signed_ctr_id = setup_org_and_contract(client, headers, contract_status="SIGNED")

    today = date.today()
    # 1. Create opportunity missing line manager
    payload = {
        "opportunity_code": "OPP-PUB-TEST",
        "contract_id": signed_ctr_id,
        "organization_id": org_id,
        "title": "Community Center Leader",
        "product_type": "iGV",
        "modality": "PHYSICAL",
        "start_date": today.isoformat(),
        "end_date": (today + timedelta(weeks=8)).isoformat(),
        "duration_weeks": 8,
        "working_hours_per_week": 35,
        "location": "Rabat, Morocco",
        "description": "Comprehensive community leadership volunteer program.",
        "role_description": "Direct outreach to underprivileged neighborhoods.",
        "openings_capacity": 2,
        "line_manager_name": None,  # Missing line manager
        "igv_details": {"sdg_number": 1, "global_project_name": "No Poverty Rabat"},
    }
    opp_res = client.post("/api/v1/opportunities", json=payload, headers=headers)
    opp_id = opp_res.json()["id"]

    # 2. Check publication checklist -> not ready because of missing line manager
    check_res = client.get(f"/api/v1/opportunities/{opp_id}/checklist", headers=headers)
    assert check_res.status_code == 200
    checklist = check_res.json()
    assert checklist["ready_to_publish"] is False
    assert any("line manager" in issue.lower() for issue in checklist["issues"])

    # 3. Attempt publish -> fails with 400
    pub_res = client.post(f"/api/v1/opportunities/{opp_id}/publish", headers=headers)
    assert pub_res.status_code == 400

    # 4. Supply line manager directly in DB and publish
    from app.modules.opportunities.models import Opportunity
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    opp.line_manager_name = "Karim Idrissi"
    db.commit()

    # Now publish succeeds
    pub_ok = client.post(f"/api/v1/opportunities/{opp_id}/publish", headers=headers)
    assert pub_ok.status_code == 200
    assert pub_ok.json()["status"] == "PUBLISHED"
    assert pub_ok.json()["is_published"] is True
