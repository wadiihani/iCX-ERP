import pytest
from datetime import datetime, timedelta, timezone
from tests.test_exchange_ops import setup_approved_application, get_auth_token
from app.modules.applications.models import Application
from app.modules.workflows.activities import activity_send_notification
from app.modules.workflows.models import TemporalWorkflowExecution


def test_first_contact_sla_lifecycle_and_idempotency(client, db):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    app_id = setup_approved_application(client, headers)

    # 1. Trigger First Contact SLA workflow
    start_res = client.post(
        f"/api/v1/workflows/sla/first-contact/{app_id}?sla_hours=48",
        headers=headers
    )
    assert start_res.status_code == 200
    wf_data = start_res.json()
    assert wf_data["workflow_type"] == "SLA_FIRST_CONTACT"
    assert wf_data["status"] == "RUNNING"
    exec_id = wf_data["id"]

    # 2. Idempotency verification on activities
    key = f"test-idemp-key-{exec_id}"
    res1 = activity_send_notification(
        db, exec_id, key, "EP_MANAGER", "Test Title", "Test Message"
    )
    assert res1["cached"] is False
    assert res1["status"] == "SUCCESS"

    # Second execution with identical key must return cached without duplicate
    res2 = activity_send_notification(
        db, exec_id, key, "EP_MANAGER", "Test Title", "Test Message"
    )
    assert res2["cached"] is True
    assert res2["status"] == "SUCCESS"

    # 3. Simulate Application advanced to CONTACTED -> SLA evaluation marks COMPLETED
    app = db.query(Application).filter(Application.id == app_id).first()
    assert app is not None
    app.current_stage = "CONTACTED"
    db.commit()

    eval_res = client.post(
        f"/api/v1/workflows/sla/first-contact/evaluate/{exec_id}",
        headers=headers
    )
    assert eval_res.status_code == 200
    assert eval_res.json()["status"] == "COMPLETED"
    assert eval_res.json()["sla_met"] is True


def test_sla_breach_escalation_and_readiness_flag(client, db):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    app_id = setup_approved_application(client, headers)

    # Start SLA workflow
    start_res = client.post(
        f"/api/v1/workflows/sla/first-contact/{app_id}?sla_hours=24",
        headers=headers
    )
    exec_id = start_res.json()["id"]

    # Artificially set due_at in the past to simulate time lapse
    wf = db.query(TemporalWorkflowExecution).filter(TemporalWorkflowExecution.id == exec_id).first()
    assert wf is not None
    wf.due_at = datetime.now(timezone.utc) - timedelta(hours=2)
    # Ensure application remains in APPLIED
    app = db.query(Application).filter(Application.id == app_id).first()
    assert app is not None
    app.current_stage = "APPLIED"
    db.commit()

    # Evaluate SLA check
    eval_res = client.post(
        f"/api/v1/workflows/sla/first-contact/evaluate/{exec_id}",
        headers=headers
    )
    assert eval_res.status_code == 200
    data = eval_res.json()
    assert data["status"] == "TIMED_OUT"
    assert data["escalated"] is True

    # Verify Application readiness updated to AT_RISK
    db.refresh(app)
    assert app.operational_readiness == "AT_RISK"

    # Verify escalation listed in /escalations endpoint
    esc_res = client.get("/api/v1/workflows/escalations?resolved=false", headers=headers)
    assert esc_res.status_code == 200
    escalations = esc_res.json()
    matching = [e for e in escalations if e["entity_id"] == app_id]
    assert len(matching) > 0
    esc_id = matching[0]["id"]

    # Resolve escalation
    resolve_res = client.post(
        f"/api/v1/workflows/escalations/{esc_id}/resolve",
        headers=headers,
        json={"resolution_notes": "EP contacted via phone call. Stage progressed."}
    )
    assert resolve_res.status_code == 200
    assert resolve_res.json()["resolved"] is True
