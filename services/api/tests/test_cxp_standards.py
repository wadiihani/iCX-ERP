import pytest
from datetime import date
from services.api.tests.test_exchange_ops import setup_approved_application, get_auth_token


def test_18_standards_fulfillment_and_completion_gates(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    app_id = setup_approved_application(client, headers)

    # Spawn Exchange
    spawn_res = client.post(f"/api/v1/exchanges/spawn-from-app/{app_id}", headers=headers)
    ex_id = spawn_res.json()["id"]

    # 1. Fetch standards -> exactly 18 standards initialized
    std_res = client.get(f"/api/v1/cxp/exchanges/{ex_id}/standards", headers=headers)
    assert std_res.status_code == 200
    standards = std_res.json()
    assert len(standards) == 18
    mandatory_standards = [s for s in standards if s["is_mandatory"]]
    assert len(mandatory_standards) == 13

    # 2. Evaluate completion before standards are fulfilled -> eligible = False
    eval_pre = client.get(f"/api/v1/cxp/exchanges/{ex_id}/completion/evaluation", headers=headers)
    assert eval_pre.status_code == 200
    report_pre = eval_pre.json()
    assert report_pre["is_eligible_for_completion"] is False
    assert report_pre["mandatory_standards_fulfilled"] == 0
    assert len(report_pre["missing_mandatory_standards"]) == 13

    # 3. Attempt approve completion prematurely -> fails with 400 Bad Request
    fail_approve = client.post(f"/api/v1/cxp/exchanges/{ex_id}/completion/approve", json={}, headers=headers)
    assert fail_approve.status_code == 400
    assert "standards threshold" in fail_approve.json()["detail"].lower()

    # 4. Fulfill all 13 mandatory standards + 3 optional (Total: 16 standards)
    today = date.today().isoformat()
    for num in range(1, 17):  # Standards 1 through 16
        client.put(
            f"/api/v1/cxp/exchanges/{ex_id}/standards/{num}",
            json={
                "is_fulfilled": True,
                "fulfillment_date": today,
                "evidence_doc_url": f"https://storage.aiesec.org/evidence/std_{num}.pdf",
                "verification_notes": f"Standard {num} evidence reviewed and validated.",
            },
            headers=headers,
        )

    # 5. Evaluate completion now -> eligible = True!
    eval_post = client.get(f"/api/v1/cxp/exchanges/{ex_id}/completion/evaluation", headers=headers)
    assert eval_post.status_code == 200
    report_post = eval_post.json()
    assert report_post["mandatory_standards_fulfilled"] == 13
    assert report_post["total_standards_fulfilled"] == 16
    assert report_post["is_eligible_for_completion"] is True

    # 6. Human Approval Gate: Approve completion
    approve_res = client.post(
        f"/api/v1/cxp/exchanges/{ex_id}/completion/approve",
        json={"notes": "All mandatory standards verified with document evidence."},
        headers=headers,
    )
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "APPROVED"

    # 7. Verify Exchange delivery status is now COMPLETED, EXPA is CO, and Local readiness is DONE
    ex_completed = client.get(f"/api/v1/exchanges/{ex_id}", headers=headers).json()
    assert ex_completed["delivery_status"] == "COMPLETED"

    app_completed = client.get(f"/api/v1/applications/{app_id}", headers=headers).json()
    assert app_completed["official_expa_status"] == "CO"
    assert app_completed["operational_readiness"] == "DONE"
