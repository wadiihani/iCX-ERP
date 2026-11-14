import pytest
from datetime import datetime, timezone, timedelta, date


def get_auth_token(client):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@aiesec.org.ma", "password": "AdminSecret123"},
    )
    return res.json()["access_token"]


def setup_fixtures(client, headers):
    # 1. Create Organization
    org_res = client.post(
        "/api/v1/organizations",
        json={"name": "Tech Partners Rabat", "sector": "Technology"},
        headers=headers,
    )
    org_id = org_res.json()["id"]

    # 2. Create Signed Contract
    today = date.today()
    ctr_res = client.post(
        "/api/v1/contracts",
        json={
            "contract_number": f"CTR-APP-{org_id[:8]}",
            "organization_id": org_id,
            "title": "iGTa Partner Contract",
            "product_types": ["iGTa"],
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=180)).isoformat(),
            "total_slots": 2,
        },
        headers=headers,
    )
    ctr_id = ctr_res.json()["id"]
    client.post(
        f"/api/v1/contracts/{ctr_id}/sign",
        json={"signed_by_partner": "CTO"},
        headers=headers,
    )

    # 3. Create Opportunity
    opp_res = client.post(
        "/api/v1/opportunities",
        json={
            "opportunity_code": f"OPP-TEST-{org_id[:6]}",
            "contract_id": ctr_id,
            "organization_id": org_id,
            "title": "Junior Python Developer",
            "product_type": "iGTa",
            "modality": "PHYSICAL",
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(weeks=12)).isoformat(),
            "duration_weeks": 12,
            "working_hours_per_week": 40,
            "location": "Rabat, Morocco",
            "description": "FastAPI and backend software engineering.",
            "role_description": "Build high-performance REST APIs.",
            "openings_capacity": 2,
            "line_manager_name": "Hamza Berrada",
            "igt_details": {
                "work_field": "IT",
                "monthly_salary": 4500,
                "currency": "MAD",
                "salary_covers_living_costs": True,
            },
        },
        headers=headers,
    )
    opp_id = opp_res.json()["id"]

    # 4. Create EP
    ep_res = client.post(
        "/api/v1/crm/eps",
        json={
            "first_name": "Tariq",
            "last_name": "Al-Mansoor",
            "email": f"tariq.{org_id[:6]}@aiesec.net",
            "country_of_residence": "Jordan",
            "nationality": "Jordanian",
            "phone": "+962791234567",
        },
        headers=headers,
    )
    ep_id = ep_res.json()["id"]

    return opp_id, ep_id


def test_application_lifecycle_and_screening(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    opp_id, ep_id = setup_fixtures(client, headers)

    # 1. Create Application
    create_res = client.post(
        "/api/v1/applications",
        json={"ep_id": ep_id, "opportunity_id": opp_id, "notes": "Strong GitHub portfolio"},
        headers=headers,
    )
    assert create_res.status_code == 201
    app_data = create_res.json()
    app_id = app_data["id"]
    assert app_data["current_stage"] == "APPLIED"
    assert app_data["official_expa_status"] == "APP"
    assert app_data["operational_readiness"] == "DRAFT"
    assert app_data["first_contact_deadline"] is not None
    assert app_data["is_sla_breached"] is False

    # 2. Prevent invalid jump: APPLIED -> APPROVED directly fails
    invalid_jump = client.post(
        f"/api/v1/applications/{app_id}/transition",
        json={"target_stage": "APPROVED"},
        headers=headers,
    )
    assert invalid_jump.status_code == 400
    assert "invalid stage transition" in invalid_jump.json()["detail"].lower()

    # 3. Transition to CONTACTED
    c_res = client.post(
        f"/api/v1/applications/{app_id}/transition",
        json={"target_stage": "CONTACTED"},
        headers=headers,
    )
    assert c_res.status_code == 200
    assert c_res.json()["current_stage"] == "CONTACTED"
    assert c_res.json()["first_contacted_at"] is not None

    # 4. Record internal screening -> RECOMMENDED auto-advances to SHORTLISTED
    screen_res = client.post(
        f"/api/v1/applications/{app_id}/screening",
        json={
            "language_proficiency": "ADVANCED",
            "background_check_passed": True,
            "cultural_fit_rating": 5,
            "skills_match_rating": 4,
            "motivation_notes": "Very motivated, strong experience with Python/FastAPI",
            "recommendation": "RECOMMENDED",
        },
        headers=headers,
    )
    assert screen_res.status_code == 200

    # Verify stage advanced to SHORTLISTED
    app_after_screen = client.get(f"/api/v1/applications/{app_id}", headers=headers).json()
    assert app_after_screen["current_stage"] == "SHORTLISTED"

    # 5. Forward to OP -> sets stage to SENT_TO_OP and initiates 72h OP feedback clock
    forward_res = client.post(f"/api/v1/applications/{app_id}/op-forward", headers=headers)
    assert forward_res.status_code == 200
    assert forward_res.json()["current_stage"] == "SENT_TO_OP"
    assert forward_res.json()["op_feedback_deadline"] is not None

    # 6. Move to INTERVIEW
    int_stage = client.post(
        f"/api/v1/applications/{app_id}/transition",
        json={"target_stage": "INTERVIEW"},
        headers=headers,
    )
    assert int_stage.status_code == 200

    # 7. Record OP Interview with ACCEPTED decision -> stage becomes OP_DECISION
    op_interview_res = client.post(
        f"/api/v1/applications/{app_id}/op-interview",
        json={
            "interviewer_name": "Hamza Berrada",
            "interview_type": "ONLINE",
            "scheduled_at": datetime.now(timezone.utc).isoformat(),
            "op_decision": "ACCEPTED",
            "feedback_notes": "Candidate passed coding challenge with flying colors.",
            "questions_asked": "Architecture design, async programming, Docker.",
        },
        headers=headers,
    )
    assert op_interview_res.status_code == 200
    assert op_interview_res.json()["op_decision"] == "ACCEPTED"

    app_final = client.get(f"/api/v1/applications/{app_id}", headers=headers).json()
    assert app_final["current_stage"] == "OP_DECISION"


def test_duplicate_active_application_rejection(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    opp_id, ep_id = setup_fixtures(client, headers)

    # 1. Create first application
    app1 = client.post(
        "/api/v1/applications",
        json={"ep_id": ep_id, "opportunity_id": opp_id},
        headers=headers,
    )
    assert app1.status_code == 201

    # 2. Second application for same EP on same opportunity -> 409 Conflict
    app2 = client.post(
        "/api/v1/applications",
        json={"ep_id": ep_id, "opportunity_id": opp_id},
        headers=headers,
    )
    assert app2.status_code == 409
    assert "already has active application" in app2.json()["detail"].lower()
