import pytest
from tests.test_exchange_ops import setup_approved_application, get_auth_token
from app.modules.applications.models import Application


def test_expa_sync_staging_and_conflict_detection(client, db):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    app_id = setup_approved_application(client, headers)

    # 1. Trigger EXPA Sync
    sync_res = client.post("/api/v1/expa/sync/trigger?sync_mode=POLLING", headers=headers)
    assert sync_res.status_code == 200
    sync_data = sync_res.json()
    assert sync_data["status"] == "SUCCESS"
    assert sync_data["records_scanned"] > 0
    assert sync_data["records_staged"] > 0

    # 2. List Reconciliations
    recon_res = client.get("/api/v1/expa/reconciliations", headers=headers)
    assert recon_res.status_code == 200
    reconciliations = recon_res.json()
    assert len(reconciliations) > 0

    # Find status mismatch discrepancy
    status_discrepancy = next(
        (r for r in reconciliations if r["discrepancy_type"] == "STATUS_MISMATCH"),
        None
    )
    assert status_discrepancy is not None
    recon_id = status_discrepancy["id"]
    target_app_id = status_discrepancy["local_entity_id"]

    # 3. Resolve with EXPA_ACCEPTED -> should update official_expa_status but preserve operational readiness
    resolve_res = client.post(
        f"/api/v1/expa/reconciliations/{recon_id}/resolve",
        headers=headers,
        json={
            "resolution_strategy": "EXPA_ACCEPTED",
            "resolution_notes": "Officer verified match on GIS portal."
        }
    )
    assert resolve_res.status_code == 200
    assert resolve_res.json()["resolution_status"] == "EXPA_ACCEPTED"

    # Verify local application state
    app = db.query(Application).filter(Application.id == target_app_id).first()
    assert app is not None
    db.refresh(app)
    assert app.official_expa_status == status_discrepancy["expa_value"]
    assert app.operational_readiness in ("READY", "DONE", "DRAFT", "AT_RISK")


def test_expa_gated_mutation_workflow(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    app_id = setup_approved_application(client, headers)

    # 1. Create Outbound Gated Mutation
    mutation_payload = {
        "entity_type": "APPLICATION",
        "local_entity_id": app_id,
        "expa_id": "EXPA-APP-12345",
        "target_action": "APPROVE_APPLICATION",
        "mutation_payload": {"notes": "Approved with signed contract"}
    }
    create_res = client.post("/api/v1/expa/mutations", headers=headers, json=mutation_payload)
    assert create_res.status_code == 200
    mut_data = create_res.json()
    assert mut_data["status"] == "PENDING_HUMAN_APPROVAL"
    mutation_id = mut_data["id"]

    # 2. List Mutations
    list_res = client.get("/api/v1/expa/mutations?status=PENDING_HUMAN_APPROVAL", headers=headers)
    assert list_res.status_code == 200
    assert any(m["id"] == mutation_id for m in list_res.json())

    # 3. Approve and Dispatch Mutation (human officer authorization)
    appr_res = client.post(f"/api/v1/expa/mutations/{mutation_id}/approve", headers=headers)
    assert appr_res.status_code == 200
    assert appr_res.json()["status"] == "DISPATCHED"
    assert appr_res.json()["dispatched_at"] is not None
