import pytest
from datetime import datetime, timezone, timedelta
from app.modules.identity.models import AuditLog
from app.modules.prm.models import PRMLead, PRMActivity


def get_auth_token(client):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "bd@aiesec.org.ma", "password": "PartnerSecret123"},
    )
    return res.json()["access_token"]


def create_test_org(client, headers):
    res = client.post(
        "/api/v1/organizations",
        json={"name": "Atlas Ventures Tech", "sector": "Tech"},
        headers=headers,
    )
    return res.json()["id"]


def test_create_lead_and_bant_qualification(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    org_id = create_test_org(client, headers)

    # 1. Create a lead with incomplete BANT
    lead_payload = {
        "organization_id": org_id,
        "title": "iGT Software Engineering Lead 2027",
        "stage": "SUSPECT",
        "source": "Cold Outreach",
        "territory": "Rabat",
        "estimated_value": 15000.00,
        "target_products": ["iGTa"],
        "target_openings": 2,
        "bant": {
            "bant_budget": "NO_BUDGET",
            "bant_authority": "INFLUENCER",
            "bant_need": "LOW",
            "bant_timeline": "UNKNOWN",
        },
    }

    create_res = client.post("/api/v1/prm/leads", json=lead_payload, headers=headers)
    assert create_res.status_code == 201
    lead_data = create_res.json()
    assert lead_data["stage"] == "SUSPECT"
    assert lead_data["bant_score"] == 20  # Influencer=15, Low need=5 -> 20
    assert lead_data["is_qualified"] is False
    lead_id = lead_data["id"]

    # 2. Update BANT to fully qualified status
    update_payload = {
        "bant": {
            "bant_budget": "ADEQUATE",       # 25
            "bant_authority": "DECISION_MAKER", # 25
            "bant_need": "CLEAR_NEED",        # 20
            "bant_timeline": "WITHIN_3_6_MONTHS", # 20
            "bant_budget_notes": "Stipend 4000 MAD approved",
        }
    }
    update_res = client.put(f"/api/v1/prm/leads/{lead_id}", json=update_payload, headers=headers)
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["bant_score"] == 90
    assert updated_data["is_qualified"] is True


def test_lead_stage_transitions_and_lost_validation(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    org_id = create_test_org(client, headers)

    create_res = client.post(
        "/api/v1/prm/leads",
        json={
            "organization_id": org_id,
            "title": "Marketing Trainee Host",
            "stage": "SUSPECT",
        },
        headers=headers,
    )
    lead_id = create_res.json()["id"]

    # 1. Advance stage to CONTACTED
    res1 = client.post(
        f"/api/v1/prm/leads/{lead_id}/stage",
        json={"stage": "CONTACTED", "notes": "Emailed HR director"},
        headers=headers,
    )
    assert res1.status_code == 200
    assert res1.json()["stage"] == "CONTACTED"

    # 2. Try to transition to LOST without lost_reason -> must be rejected (400)
    res_bad = client.post(
        f"/api/v1/prm/leads/{lead_id}/stage",
        json={"stage": "LOST"},
        headers=headers,
    )
    assert res_bad.status_code == 400
    assert "lost reason is required" in res_bad.json()["detail"].lower()

    # 3. Transition to LOST with reason -> succeeds
    res_lost = client.post(
        f"/api/v1/prm/leads/{lead_id}/stage",
        json={"stage": "LOST", "lost_reason": "Partner hiring locally instead"},
        headers=headers,
    )
    assert res_lost.status_code == 200
    assert res_lost.json()["stage"] == "LOST"
    assert res_lost.json()["lost_reason"] == "Partner hiring locally instead"


def test_activities_and_follow_up_tasks(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    org_id = create_test_org(client, headers)

    create_lead = client.post(
        "/api/v1/prm/leads",
        json={"organization_id": org_id, "title": "FinTech Lead"},
        headers=headers,
    )
    lead_id = create_lead.json()["id"]

    # 1. Log a meeting activity with a scheduled follow-up
    due_date = (datetime.now(timezone.utc) + timedelta(days=2)).isoformat()
    act_res = client.post(
        "/api/v1/prm/activities",
        json={
            "organization_id": org_id,
            "lead_id": lead_id,
            "activity_type": "MEETING",
            "summary": "First Discovery Meeting with CEO",
            "details": "Discussed 2 iGT software developer profiles",
            "next_step": "Send proposal and draft contract terms",
            "next_step_due": due_date,
        },
        headers=headers,
    )
    assert act_res.status_code == 201
    act_id = act_res.json()["id"]
    assert act_res.json()["is_completed"] is False
    assert act_res.json()["next_step"] == "Send proposal and draft contract terms"

    # 2. Query pending follow-ups
    pending_res = client.get("/api/v1/prm/follow-ups", headers=headers)
    assert pending_res.status_code == 200
    pending_tasks = pending_res.json()
    assert any(t["id"] == act_id for t in pending_tasks)

    # 3. Complete follow-up task
    comp_res = client.post(f"/api/v1/prm/follow-ups/{act_id}/complete", headers=headers)
    assert comp_res.status_code == 200
    assert comp_res.json()["is_completed"] is True


def test_pipeline_summary_aggregation(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    summary_res = client.get("/api/v1/prm/pipeline/summary", headers=headers)
    assert summary_res.status_code == 200
    data = summary_res.json()
    assert "stages" in data
    assert data["total_leads"] >= 0
    assert len(data["stages"]) == 13  # All 13 PRM stages represented
