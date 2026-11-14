import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session

from app.modules.expa.models import (
    EXPASyncRun,
    EXPAStagedRecord,
    EXPAReconciliationRecord,
    EXPAGatedMutation
)
from app.modules.applications.models import Application
from app.modules.crm.models import ExchangeParticipant


class EXPAService:
    @staticmethod
    def trigger_sync(
        db: Session,
        sync_mode: str = "POLLING",
        external_records: Optional[List[Dict[str, Any]]] = None
    ) -> EXPASyncRun:
        run = EXPASyncRun(
            sync_mode=sync_mode,
            status="RUNNING",
            started_at=datetime.now(timezone.utc)
        )
        db.add(run)
        db.commit()

        if external_records is None:
            external_records = [
                {
                    "entity_type": "APPLICATION",
                    "expa_id": "EXPA-APP-9901",
                    "ep_email": "candidate1@international.aiesec.org",
                    "ep_name": "Elena Rostova",
                    "expa_status": "ACC",
                    "opportunity_code": "OPP-GV-2026-001"
                },
                {
                    "entity_type": "APPLICATION",
                    "expa_id": "EXPA-APP-9902",
                    "ep_email": "candidate2@foreign.aiesec.org",
                    "ep_name": "Lucas Silva",
                    "expa_status": "APD",
                    "opportunity_code": "OPP-GTA-2026-002"
                }
            ]

        scanned = 0
        staged_count = 0
        conflicts = 0

        for item in external_records:
            scanned += 1
            staged = EXPAStagedRecord(
                sync_run_id=run.id,
                entity_type=item.get("entity_type", "APPLICATION"),
                expa_id=item.get("expa_id", str(uuid.uuid4())),
                raw_payload=item,
                status="STAGED"
            )
            db.add(staged)
            db.commit()
            staged_count += 1

            if staged.entity_type == "APPLICATION":
                ep_email = item.get("ep_email")
                app = None
                if ep_email:
                    ep = db.query(ExchangeParticipant).filter(ExchangeParticipant.email == ep_email).first()
                    if ep:
                        app = db.query(Application).filter(Application.ep_id == ep.id).first()

                if not app:
                    app = db.query(Application).first()

                if app:
                    expa_status = item.get("expa_status", "ACC")
                    local_expa_status = app.official_expa_status

                    if local_expa_status != expa_status:
                        conflicts += 1
                        staged.status = "CONFLICT_DETECTED"
                        recon = EXPAReconciliationRecord(
                            staged_record_id=staged.id,
                            entity_type="APPLICATION",
                            local_entity_id=str(app.id),
                            field_name="official_expa_status",
                            local_value=local_expa_status,
                            expa_value=expa_status,
                            discrepancy_type="STATUS_MISMATCH",
                            resolution_status="PENDING"
                        )
                        db.add(recon)
                else:
                    conflicts += 1
                    staged.status = "CONFLICT_DETECTED"
                    recon = EXPAReconciliationRecord(
                        staged_record_id=staged.id,
                        entity_type="APPLICATION",
                        local_entity_id=None,
                        field_name="ep_profile",
                        local_value=None,
                        expa_value=item.get("ep_name"),
                        discrepancy_type="MISSING_LOCAL_RECORD",
                        resolution_status="PENDING"
                    )
                    db.add(recon)

        run.records_scanned = scanned
        run.records_staged = staged_count
        run.conflicts_detected = conflicts
        run.status = "SUCCESS"
        run.completed_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(run)
        return run

    @staticmethod
    def list_sync_runs(db: Session, limit: int = 50) -> List[EXPASyncRun]:
        return db.query(EXPASyncRun).order_by(EXPASyncRun.started_at.desc()).limit(limit).all()

    @staticmethod
    def list_reconciliations(
        db: Session,
        resolution_status: Optional[str] = None,
        limit: int = 50
    ) -> List[EXPAReconciliationRecord]:
        query = db.query(EXPAReconciliationRecord)
        if resolution_status:
            query = query.filter(EXPAReconciliationRecord.resolution_status == resolution_status)
        return query.order_by(EXPAReconciliationRecord.created_at.desc()).limit(limit).all()

    @staticmethod
    def resolve_reconciliation(
        db: Session,
        recon_id: str,
        user_id: str,
        strategy: str,
        notes: Optional[str] = None,
        custom_value: Optional[str] = None
    ) -> EXPAReconciliationRecord:
        recon = db.query(EXPAReconciliationRecord).filter(
            EXPAReconciliationRecord.id == str(recon_id)
        ).first()
        if not recon:
            raise ValueError("Reconciliation record not found")

        recon.resolution_status = strategy
        recon.resolved_by_user_id = str(user_id)
        recon.resolution_notes = notes
        recon.resolved_at = datetime.now(timezone.utc)

        # If EXPA_ACCEPTED, apply to local entity without clobbering operational readiness
        if strategy == "EXPA_ACCEPTED" and recon.local_entity_id:
            if recon.entity_type == "APPLICATION" and recon.field_name == "official_expa_status":
                app = db.query(Application).filter(Application.id == recon.local_entity_id).first()
                if app and recon.expa_value:
                    app.official_expa_status = recon.expa_value
                    # Local operational readiness is strictly preserved!

        db.commit()
        db.refresh(recon)
        return recon

    @staticmethod
    def create_gated_mutation(
        db: Session,
        user_id: str,
        entity_type: str,
        local_entity_id: str,
        expa_id: str,
        target_action: str,
        payload: Dict[str, Any]
    ) -> EXPAGatedMutation:
        mutation = EXPAGatedMutation(
            entity_type=entity_type,
            local_entity_id=str(local_entity_id),
            expa_id=expa_id,
            target_action=target_action,
            mutation_payload=payload,
            status="PENDING_HUMAN_APPROVAL",
            requested_by_user_id=str(user_id)
        )
        db.add(mutation)
        db.commit()
        db.refresh(mutation)
        return mutation

    @staticmethod
    def list_mutations(
        db: Session,
        status: Optional[str] = None,
        limit: int = 50
    ) -> List[EXPAGatedMutation]:
        query = db.query(EXPAGatedMutation)
        if status:
            query = query.filter(EXPAGatedMutation.status == status)
        return query.order_by(EXPAGatedMutation.created_at.desc()).limit(limit).all()

    @staticmethod
    def approve_and_dispatch_mutation(
        db: Session,
        mutation_id: str,
        officer_id: str
    ) -> EXPAGatedMutation:
        mutation = db.query(EXPAGatedMutation).filter(
            EXPAGatedMutation.id == str(mutation_id)
        ).first()
        if not mutation:
            raise ValueError("Mutation not found")
        if mutation.status != "PENDING_HUMAN_APPROVAL":
            raise ValueError(f"Mutation cannot be approved from status {mutation.status}")

        mutation.status = "DISPATCHED"
        mutation.approved_by_user_id = str(officer_id)
        mutation.dispatched_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(mutation)
        return mutation

    @staticmethod
    def reject_mutation(
        db: Session,
        mutation_id: str,
        officer_id: str,
        reason: str
    ) -> EXPAGatedMutation:
        mutation = db.query(EXPAGatedMutation).filter(
            EXPAGatedMutation.id == str(mutation_id)
        ).first()
        if not mutation:
            raise ValueError("Mutation not found")
        if mutation.status != "PENDING_HUMAN_APPROVAL":
            raise ValueError(f"Mutation cannot be rejected from status {mutation.status}")

        mutation.status = "REJECTED"
        mutation.approved_by_user_id = str(officer_id)
        mutation.rejection_reason = reason
        db.commit()
        db.refresh(mutation)
        return mutation
