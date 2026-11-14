import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient


def get_auth_token(client):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@aiesec.org.ma", "password": "AdminSecret123"},
    )
    return res.json()["access_token"]


def test_ai_governance_and_approval_workflow(client: TestClient):
    admin_token = get_auth_token(client)
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    today = date.today()

    # 1. Test Policy Assistant RAG retrieval with verified citations
    chat_payload = {
        "agent_name": "POLICY_ASSISTANT",
        "prompt": "What are the rules for iGV product modality and duration?"
    }
    resp = client.post("/api/v1/ai/chat", json=chat_payload, headers=admin_headers)
    assert resp.status_code == 200, resp.text
    run_data = resp.json()
    assert run_data["agent_name"] == "POLICY_ASSISTANT"
    assert "[VERIFIED]" in run_data["response_text"]
    assert len(run_data["citations"]) > 0
    assert "Global Compendium 2026" in run_data["citations"][0]

    # 2. Test EP Screening Copilot Proposal Creation (Strict AI Boundary: Agent cannot mutate status directly)
    # First create an application to screen
    ep_res = client.post("/api/v1/crm/eps", json={
        "first_name": "Fatima",
        "last_name": "Zahra",
        "email": "fatima.zahra@ai-test.ma",
        "country_of_residence": "Tunisia",
        "nationality": "Tunisian"
    }, headers=admin_headers)
    ep_id = ep_res.json()["id"]

    org_res = client.post("/api/v1/organizations", json={"name": "AI Corp Partner", "sector": "Tech"}, headers=admin_headers)
    org_id = org_res.json()["id"]
    ctr_res = client.post("/api/v1/contracts", json={
        "contract_number": f"CTR-AI-{org_id[:6]}",
        "organization_id": org_id,
        "title": "AI Partner Agreement",
        "product_types": ["iGTa"],
        "start_date": today.isoformat(),
        "end_date": (today + timedelta(days=180)).isoformat(),
        "total_slots": 1
    }, headers=admin_headers)
    ctr_id = ctr_res.json()["id"]
    client.post(f"/api/v1/contracts/{ctr_id}/sign", json={"signed_by_partner": "CEO"}, headers=admin_headers)

    opp_res = client.post("/api/v1/opportunities", json={
        "opportunity_code": f"OPP-AI-{org_id[:6]}",
        "contract_id": ctr_id,
        "organization_id": org_id,
        "title": "Machine Learning Associate",
        "product_type": "iGTa",
        "modality": "PHYSICAL",
        "start_date": today.isoformat(),
        "end_date": (today + timedelta(weeks=12)).isoformat(),
        "duration_weeks": 12,
        "working_hours_per_week": 40,
        "location": "Rabat, Morocco",
        "description": "Full stack and web development.",
        "role_description": "Build Svelte interfaces.",
        "openings_capacity": 1,
        "line_manager_name": "Salma Bennani",
        "igt_details": {"work_field": "IT", "monthly_salary": 5000, "currency": "MAD", "salary_covers_living_costs": True},
    }, headers=admin_headers)
    assert opp_res.status_code == 201, opp_res.text
    opp_id = opp_res.json()["id"]

    app_res = client.post("/api/v1/applications", json={
        "ep_id": ep_id,
        "opportunity_id": opp_id
    }, headers=admin_headers)
    assert app_res.status_code == 201, app_res.text
    app_id = app_res.json()["id"]

    # Copilot called with propose_action=True
    copilot_payload = {
        "agent_name": "EP_SCREENING_COPILOT",
        "prompt": "Evaluate Fatima Zahra and advance her to SHORTLISTED if criteria are satisfied.",
        "target_id": app_id,
        "propose_action": True
    }
    copilot_resp = client.post("/api/v1/ai/chat", json=copilot_payload, headers=admin_headers)
    assert copilot_resp.status_code == 200, copilot_resp.text
    copilot_data = copilot_resp.json()
    assert len(copilot_data["proposals_created"]) == 1
    proposal_info = copilot_data["proposals_created"][0]
    proposal_id = proposal_info["proposal_id"]

    # Verify that Application status did NOT mutate yet (strictly pending human approval)
    curr_app = client.get(f"/api/v1/applications/{app_id}", headers=admin_headers).json()
    assert curr_app["current_stage"] == "APPLIED"

    # 3. Check Approval Proposals list
    props_resp = client.get("/api/v1/approvals?status=PENDING_HUMAN_REVIEW", headers=admin_headers)
    assert props_resp.status_code == 200
    props = props_resp.json()
    assert any(p["id"] == proposal_id for p in props)

    # 4. Human Officer reviews and APPROVES proposal
    rev_resp = client.put(f"/api/v1/approvals/{proposal_id}/review", json={
        "decision": "APPROVED",
        "review_notes": "Verified candidate CV and language skills manually."
    }, headers=admin_headers)
    assert rev_resp.status_code == 200
    assert rev_resp.json()["status"] == "APPROVED_EXECUTED"

    # Verify that Application is now moved to SHORTLISTED
    updated_app = client.get(f"/api/v1/applications/{app_id}", headers=admin_headers).json()
    assert updated_app["current_stage"] == "SHORTLISTED"
