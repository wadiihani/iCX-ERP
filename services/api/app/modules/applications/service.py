import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.modules.applications.models import (
    Application,
    ApplicationScreening,
    OPInterview,
    AcceptanceNote,
    SEPaymentProof,
)
from app.modules.applications.schemas import (
    ApplicationCreate,
    ApplicationScreeningCreate,
    OPInterviewCreate,
    AcceptanceNoteCreate,
    SEPaymentProofCreate,
    ALLOWED_TRANSITIONS,
)
from app.modules.crm.models import ExchangeParticipant
from app.modules.opportunities.models import Opportunity, OpportunitySlot


class ApplicationService:
    @staticmethod
    def get_applications(
        db: Session,
        stage: Optional[str] = None,
        opportunity_id: Optional[str] = None,
        ep_id: Optional[str] = None,
        is_breached: Optional[bool] = None,
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        query = db.query(Application)
        if stage:
            query = query.filter(Application.current_stage == stage)
        if opportunity_id:
            query = query.filter(Application.opportunity_id == opportunity_id)
        if ep_id:
            query = query.filter(Application.ep_id == ep_id)
        if search:
            query = query.join(ExchangeParticipant).filter(
                (ExchangeParticipant.first_name.ilike(f"%{search}%"))
                | (ExchangeParticipant.last_name.ilike(f"%{search}%"))
                | (ExchangeParticipant.email.ilike(f"%{search}%"))
                | (Application.application_code.ilike(f"%{search}%"))
            )

        apps = query.order_by(Application.created_at.desc()).offset(offset).limit(limit).all()
        now = datetime.now(timezone.utc)
        results = []

        for app in apps:
            # Check SLA Breach
            sla_breached = False
            if app.current_stage == "APPLIED" and app.first_contact_deadline:
                f_deadline = (
                    app.first_contact_deadline.replace(tzinfo=timezone.utc)
                    if app.first_contact_deadline.tzinfo is None
                    else app.first_contact_deadline
                )
                if now > f_deadline:
                    sla_breached = True
            elif app.current_stage == "SENT_TO_OP" and app.op_feedback_deadline:
                op_deadline = (
                    app.op_feedback_deadline.replace(tzinfo=timezone.utc)
                    if app.op_feedback_deadline.tzinfo is None
                    else app.op_feedback_deadline
                )
                if now > op_deadline:
                    sla_breached = True

            if is_breached is not None and sla_breached != is_breached:
                continue

            results.append(
                {
                    "id": app.id,
                    "application_code": app.application_code,
                    "expa_application_id": app.expa_application_id,
                    "ep_id": app.ep_id,
                    "opportunity_id": app.opportunity_id,
                    "slot_id": app.slot_id,
                    "current_stage": app.current_stage,
                    "official_expa_status": app.official_expa_status,
                    "operational_readiness": app.operational_readiness,
                    "assigned_manager_id": app.assigned_manager_id,
                    "first_contact_deadline": app.first_contact_deadline,
                    "first_contacted_at": app.first_contacted_at,
                    "op_feedback_deadline": app.op_feedback_deadline,
                    "applied_at": app.applied_at,
                    "accepted_at": app.accepted_at,
                    "approved_at": app.approved_at,
                    "rejection_reason": app.rejection_reason,
                    "withdrawal_reason": app.withdrawal_reason,
                    "notes": app.notes,
                    "is_sla_breached": sla_breached,
                    "created_at": app.created_at,
                    "updated_at": app.updated_at,
                    "ep_name": f"{app.ep.first_name} {app.ep.last_name}" if app.ep else None,
                    "ep_email": app.ep.email if app.ep else None,
                    "ep_country": app.ep.country_of_residence if app.ep else None,
                    "opportunity_title": app.opportunity.title if app.opportunity else None,
                    "opportunity_code": app.opportunity.opportunity_code if app.opportunity else None,
                    "product_type": app.opportunity.product_type if app.opportunity else None,
                    "screenings": app.screenings,
                    "op_interviews": app.op_interviews,
                    "acceptance_notes": app.acceptance_notes,
                    "se_payment_proofs": app.se_payment_proofs,
                }
            )

        return results

    @staticmethod
    def get_application_by_id(db: Session, app_id: str) -> Dict[str, Any]:
        app = db.query(Application).filter(Application.id == app_id).first()
        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Application {app_id} not found")

        now = datetime.now(timezone.utc)
        sla_breached = False
        if app.current_stage == "APPLIED" and app.first_contact_deadline:
            f_deadline = (
                app.first_contact_deadline.replace(tzinfo=timezone.utc)
                if app.first_contact_deadline.tzinfo is None
                else app.first_contact_deadline
            )
            if now > f_deadline:
                sla_breached = True
        elif app.current_stage == "SENT_TO_OP" and app.op_feedback_deadline:
            op_deadline = (
                app.op_feedback_deadline.replace(tzinfo=timezone.utc)
                if app.op_feedback_deadline.tzinfo is None
                else app.op_feedback_deadline
            )
            if now > op_deadline:
                sla_breached = True

        return {
            "id": app.id,
            "application_code": app.application_code,
            "expa_application_id": app.expa_application_id,
            "ep_id": app.ep_id,
            "opportunity_id": app.opportunity_id,
            "slot_id": app.slot_id,
            "current_stage": app.current_stage,
            "official_expa_status": app.official_expa_status,
            "operational_readiness": app.operational_readiness,
            "assigned_manager_id": app.assigned_manager_id,
            "first_contact_deadline": app.first_contact_deadline,
            "first_contacted_at": app.first_contacted_at,
            "op_feedback_deadline": app.op_feedback_deadline,
            "applied_at": app.applied_at,
            "accepted_at": app.accepted_at,
            "approved_at": app.approved_at,
            "rejection_reason": app.rejection_reason,
            "withdrawal_reason": app.withdrawal_reason,
            "notes": app.notes,
            "is_sla_breached": sla_breached,
            "created_at": app.created_at,
            "updated_at": app.updated_at,
            "ep_name": f"{app.ep.first_name} {app.ep.last_name}" if app.ep else None,
            "ep_email": app.ep.email if app.ep else None,
            "ep_country": app.ep.country_of_residence if app.ep else None,
            "opportunity_title": app.opportunity.title if app.opportunity else None,
            "opportunity_code": app.opportunity.opportunity_code if app.opportunity else None,
            "product_type": app.opportunity.product_type if app.opportunity else None,
            "screenings": app.screenings,
            "op_interviews": app.op_interviews,
            "acceptance_notes": app.acceptance_notes,
            "se_payment_proofs": app.se_payment_proofs,
        }

    @staticmethod
    def create_application(db: Session, payload: ApplicationCreate) -> Application:
        # Check EP
        ep = db.query(ExchangeParticipant).filter(ExchangeParticipant.id == payload.ep_id).first()
        if not ep:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"EP with id {payload.ep_id} not found")

        # Check Opportunity
        opp = db.query(Opportunity).filter(Opportunity.id == payload.opportunity_id).first()
        if not opp:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Opportunity {payload.opportunity_id} not found")

        # Prevent duplicate active application for same EP on same opportunity
        existing = (
            db.query(Application)
            .filter(
                Application.ep_id == payload.ep_id,
                Application.opportunity_id == payload.opportunity_id,
                Application.current_stage.notin_(["REJECTED", "WITHDRAWN"]),
            )
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Candidate already has active application {existing.application_code} for this opportunity.",
            )

        now = datetime.now(timezone.utc)
        app_code = f"APP-{opp.product_type}-{uuid.uuid4().hex[:6].upper()}"

        app = Application(
            application_code=app_code,
            ep_id=payload.ep_id,
            opportunity_id=payload.opportunity_id,
            slot_id=payload.slot_id,
            assigned_manager_id=payload.assigned_manager_id,
            current_stage="APPLIED",
            official_expa_status="APP",
            operational_readiness="DRAFT",
            first_contact_deadline=now + timedelta(hours=48),
            applied_at=now,
            notes=payload.notes,
        )
        db.add(app)
        db.commit()
        db.refresh(app)
        return app

    @staticmethod
    def transition_stage(
        db: Session, app_id: str, target_stage: str, reason: Optional[str] = None
    ) -> Application:
        app = db.query(Application).filter(Application.id == app_id).first()
        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Application {app_id} not found")

        current = app.current_stage
        allowed = ALLOWED_TRANSITIONS.get(current, [])

        if target_stage not in allowed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid stage transition: cannot move from '{current}' to '{target_stage}'. Valid options: {allowed}",
            )

        now = datetime.now(timezone.utc)
        app.current_stage = target_stage

        if target_stage == "CONTACTED":
            app.first_contacted_at = now
        elif target_stage == "SENT_TO_OP":
            app.op_feedback_deadline = now + timedelta(hours=72)
        elif target_stage == "ACCEPTED":
            app.accepted_at = now
            app.official_expa_status = "ACC"
        elif target_stage == "APPROVED":
            app.approved_at = now
            app.official_expa_status = "APD"
        elif target_stage == "REJECTED":
            app.rejection_reason = reason
        elif target_stage == "WITHDRAWN":
            app.withdrawal_reason = reason

        db.commit()
        db.refresh(app)
        return app

    @staticmethod
    def record_screening(
        db: Session, app_id: str, reviewer_id: Optional[str], payload: ApplicationScreeningCreate
    ) -> ApplicationScreening:
        app = db.query(Application).filter(Application.id == app_id).first()
        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Application {app_id} not found")

        screening = ApplicationScreening(
            application_id=app_id,
            reviewer_id=reviewer_id,
            language_proficiency=payload.language_proficiency,
            background_check_passed=payload.background_check_passed,
            cultural_fit_rating=payload.cultural_fit_rating,
            skills_match_rating=payload.skills_match_rating,
            motivation_notes=payload.motivation_notes,
            recommendation=payload.recommendation,
        )
        db.add(screening)

        # Advance stage if currently in CONTACTED or SCREENING
        if payload.recommendation == "RECOMMENDED":
            if app.current_stage in ["APPLIED", "CONTACTED", "SCREENING"]:
                app.current_stage = "SHORTLISTED"
        elif payload.recommendation == "REJECTED":
            app.current_stage = "REJECTED"
            app.rejection_reason = "Failed internal eligibility / prescreening criteria"

        db.commit()
        db.refresh(screening)
        return screening

    @staticmethod
    def record_op_interview(
        db: Session, app_id: str, payload: OPInterviewCreate
    ) -> OPInterview:
        app = db.query(Application).filter(Application.id == app_id).first()
        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Application {app_id} not found")

        interview = OPInterview(
            application_id=app_id,
            interviewer_name=payload.interviewer_name,
            interview_type=payload.interview_type,
            scheduled_at=payload.scheduled_at,
            conducted_at=payload.conducted_at or datetime.now(timezone.utc),
            op_decision=payload.op_decision,
            feedback_notes=payload.feedback_notes,
            questions_asked=payload.questions_asked,
        )
        db.add(interview)

        if payload.op_decision == "ACCEPTED":
            app.current_stage = "OP_DECISION"
        elif payload.op_decision == "REJECTED":
            app.current_stage = "REJECTED"
            app.rejection_reason = "Opportunity Provider did not select candidate"

        db.commit()
        db.refresh(interview)
        return interview

    @staticmethod
    def record_acceptance_note(
        db: Session, app_id: str, reviewer_id: Optional[str], payload: AcceptanceNoteCreate
    ) -> AcceptanceNote:
        app = db.query(Application).filter(Application.id == app_id).first()
        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Application {app_id} not found")

        note = AcceptanceNote(
            application_id=app_id,
            document_url=payload.document_url,
            ep_signature_date=payload.ep_signature_date,
            partner_signature_date=payload.partner_signature_date,
            is_verified=payload.is_verified,
            verified_by=reviewer_id,
            verification_notes=payload.verification_notes,
        )
        db.add(note)

        # If verified, promote stage to ACCEPTED and EXPA status to ACC
        if payload.is_verified:
            app.current_stage = "ACCEPTED"
            app.official_expa_status = "ACC"
            app.accepted_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(note)
        return note

    @staticmethod
    def record_se_payment(
        db: Session, app_id: str, reviewer_id: Optional[str], payload: SEPaymentProofCreate
    ) -> SEPaymentProof:
        app = db.query(Application).filter(Application.id == app_id).first()
        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Application {app_id} not found")

        proof = SEPaymentProof(
            application_id=app_id,
            sending_entity_id=payload.sending_entity_id,
            payment_reference=payload.payment_reference,
            amount_eur=payload.amount_eur,
            proof_document_url=payload.proof_document_url,
            is_verified=payload.is_verified,
            verified_by=reviewer_id,
        )
        db.add(proof)
        db.commit()
        db.refresh(proof)
        return proof

    @staticmethod
    def approve_match(
        db: Session, app_id: str, slot_id: Optional[str] = None, notes: Optional[str] = None
    ) -> Application:
        app = db.query(Application).filter(Application.id == app_id).first()
        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Application {app_id} not found")

        # 1. Verify Acceptance Note exists and is verified
        verified_note = (
            db.query(AcceptanceNote)
            .filter(AcceptanceNote.application_id == app_id, AcceptanceNote.is_verified == True)
            .first()
        )
        if not verified_note:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot approve match: A verified Acceptance Note signed by both EP and partner is mandatory prior to approval.",
            )

        # 2. Reserve / assign slot with concurrency safety
        target_slot_id = slot_id or app.slot_id
        if not target_slot_id:
            # Find next open slot for this opportunity
            open_slot = (
                db.query(OpportunitySlot)
                .filter(
                    OpportunitySlot.opportunity_id == app.opportunity_id,
                    OpportunitySlot.status == "OPEN",
                )
                .first()
            )
            if not open_slot:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Cannot approve match: No available capacity slots remaining for this opportunity.",
                )
            target_slot_id = open_slot.id

        slot = db.query(OpportunitySlot).filter(OpportunitySlot.id == target_slot_id).first()
        if not slot:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Slot {target_slot_id} not found")

        if slot.status != "OPEN" and slot.current_application_id != app_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Slot {slot.slot_number} is already {slot.status} by application {slot.current_application_id}",
            )

        # Allocate slot
        slot.status = "ALLOCATED"
        slot.current_application_id = app_id
        slot.lock_version += 1
        app.slot_id = slot.id

        # Update opportunity filled counter if not already accounted
        opp = db.query(Opportunity).filter(Opportunity.id == app.opportunity_id).first()
        if opp:
            opp.filled_openings = (
                db.query(OpportunitySlot)
                .filter(OpportunitySlot.opportunity_id == opp.id, OpportunitySlot.status.in_(["RESERVED", "ALLOCATED"]))
                .count()
            )

        now = datetime.now(timezone.utc)
        app.current_stage = "APPROVED"
        app.official_expa_status = "APD"
        app.operational_readiness = "READY"  # Ready for pre-arrival and exchange ops handover
        app.approved_at = now
        if notes:
            app.notes = f"{app.notes or ''}\nApproval Note: {notes}".strip()

        db.commit()
        db.refresh(app)
        return app

    @staticmethod
    def update_operational_readiness(
        db: Session, app_id: str, new_readiness: str, notes: Optional[str] = None
    ) -> Application:
        app = db.query(Application).filter(Application.id == app_id).first()
        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Application {app_id} not found")

        app.operational_readiness = new_readiness
        if notes:
            app.notes = f"{app.notes or ''}\nReadiness Note ({new_readiness}): {notes}".strip()

        db.commit()
        db.refresh(app)
        return app
