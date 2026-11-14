import pytest
from datetime import date, timedelta


def get_auth_token(client):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@aiesec.org.ma", "password": "AdminSecret123"},
    )
    return res.json()["access_token"]


def setup_approved_application(client, headers):
    today = date.today()
    # Org
    org_res = client.post(
        "/api/v1/organizations",
        json={"name": "Morocco Tech Academy", "sector": "Education"},
        headers=headers,
    )
    org_id = org_res.json()["id"]

    # Contract
    ctr_res = client.post(
        "/api/v1/contracts",
        json={
            "contract_number": f"CTR-EXC-{org_id[:8]}",
            "organization_id": org_id,
            "title": "iGTa Developer Contract",
            "product_types": ["iGTa"],
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=180)).isoformat(),
            "total_slots": 2,
        },
        headers=headers,
    )
    ctr_id = ctr_res.json()["id"]
    client.post(f"/api/v1/contracts/{ctr_id}/sign", json={"signed_by_partner": "CEO"}, headers=headers)

    # Opp
    opp_res = client.post(
        "/api/v1/opportunities",
        json={
            "opportunity_code": f"OPP-EXC-{org_id[:6]}",
            "contract_id": ctr_id,
            "organization_id": org_id,
            "title": "Frontend Engineer",
            "product_type": "iGTa",
            "modality": "PHYSICAL",
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(weeks=12)).isoformat(),
            "duration_weeks": 12,
            "working_hours_per_week": 40,
            "location": "Rabat, Morocco",
            "description": "Full stack and web development.",
            "role_description": "Build Svelte interfaces.",
            "openings_capacity": 2,
            "line_manager_name": "Salma Bennani",
            "igt_details": {"work_field": "IT", "monthly_salary": 5000, "currency": "MAD", "salary_covers_living_costs": True},
        },
        headers=headers,
    )
    opp_id = opp_res.json()["id"]

    # EP
    ep_res = client.post(
        "/api/v1/crm/eps",
        json={
            "first_name": "Klaus",
            "last_name": "Weber",
            "email": f"klaus.{org_id[:6]}@aiesec.net",
            "country_of_residence": "Germany",
            "nationality": "German",
        },
        headers=headers,
    )
    ep_id = ep_res.json()["id"]

    # Application
    app_res = client.post(
        "/api/v1/applications",
        json={"ep_id": ep_id, "opportunity_id": opp_id},
        headers=headers,
    )
    app_id = app_res.json()["id"]

    # Upload & verify Acceptance Note so it can be approved
    client.post(
        f"/api/v1/applications/{app_id}/acceptance-note",
        json={
            "document_url": "https://storage.aiesec.org/an/an.pdf",
            "ep_signature_date": today.isoformat(),
            "partner_signature_date": today.isoformat(),
            "is_verified": True,
        },
        headers=headers,
    )

    # Approve Match
    client.post(f"/api/v1/applications/{app_id}/match-approve", json={}, headers=headers)

    return app_id


def test_spawn_exchange_and_checklists_and_incidents(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    app_id = setup_approved_application(client, headers)

    # 1. Spawn Exchange from Approved Application
    spawn_res = client.post(f"/api/v1/exchanges/spawn-from-app/{app_id}", headers=headers)
    assert spawn_res.status_code == 201
    ex_data = spawn_res.json()
    ex_id = ex_data["id"]
    assert ex_data["delivery_status"] == "PRE_ARRIVAL"
    assert ex_data["modality"] == "PHYSICAL"
    assert len(ex_data["checklists"]) == 13  # 13 physical templates

    # 2. Toggle a checklist item
    checklist_item = ex_data["checklists"][0]
    chk_id = checklist_item["id"]
    update_chk = client.put(
        f"/api/v1/exchanges/{ex_id}/checklists/{chk_id}",
        json={"is_completed": True, "notes": "Verified Moroccan consular visa stamp."},
        headers=headers,
    )
    assert update_chk.status_code == 200
    assert update_chk.json()["is_completed"] is True
    assert update_chk.json()["completed_by"] is not None

    # 3. Report an incident
    incident_res = client.post(
        f"/api/v1/exchanges/{ex_id}/incidents",
        json={
            "incident_type": "HEALTH",
            "severity": "HIGH",
            "description": "EP experienced mild food intolerance on day 2.",
        },
        headers=headers,
    )
    assert incident_res.status_code == 201
    inc_data = incident_res.json()
    inc_id = inc_data["id"]
    assert inc_data["status"] == "OPEN"

    # 4. Resolve the incident
    resolve_res = client.put(
        f"/api/v1/exchanges/incidents/{inc_id}/resolve",
        json={"resolution_notes": "Consulted with local partner clinic in Agdal; EP fully recovered."},
        headers=headers,
    )
    assert resolve_res.status_code == 200
    assert resolve_res.json()["status"] == "RESOLVED"
    assert resolve_res.json()["resolved_at"] is not None
