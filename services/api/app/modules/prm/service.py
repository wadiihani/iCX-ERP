from datetime import datetime, timezone
from typing import List, Optional, Tuple, Dict, Any
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from app.modules.prm.models import PRMLead, PRMActivity
from app.modules.organizations.models import Organization
from app.modules.identity.models import AuditLog
from app.modules.prm.schemas import (
    LeadCreate,
    LeadUpdate,
    LeadStageUpdate,
    BANTUpdate,
    ActivityCreate,
    PipelineSummaryResponse,
    PipelineSummaryItem,
    VALID_STAGES,
    BANT_BUDGET_SCORES,
    BANT_AUTHORITY_SCORES,
    BANT_NEED_SCORES,
    BANT_TIMELINE_SCORES,
)


class PRMService:
    @staticmethod
    def calculate_bant(
        budget: str,
        authority: str,
        need: str,
        timeline: str,
    ) -> Tuple[int, bool]:
        """
        Deterministic BANT scoring engine:
        - Budget: 0-25
        - Authority: 0-25
        - Need: 0-25
        - Timeline: 0-25
        Total score: 0-100.
        Qualified threshold: Score >= 60 and Budget >= ADEQUATE, Authority in (INFLUENCER, DECISION_MAKER), Need in (CLEAR_NEED, CRITICAL_PAIN).
        """
        b_score = BANT_BUDGET_SCORES.get(budget, 0)
        a_score = BANT_AUTHORITY_SCORES.get(authority, 0)
        n_score = BANT_NEED_SCORES.get(need, 0)
        t_score = BANT_TIMELINE_SCORES.get(timeline, 0)
        total_score = b_score + a_score + n_score + t_score

        is_qualified = (
            total_score >= 60
            and budget in ("ADEQUATE", "HIGH")
            and authority in ("INFLUENCER", "DECISION_MAKER")
            and need in ("CLEAR_NEED", "CRITICAL_PAIN")
        )
        return total_score, is_qualified

    @staticmethod
    def get_leads(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        stage: Optional[str] = None,
        organization_id: Optional[str] = None,
        owner_id: Optional[str] = None,
    ) -> List[PRMLead]:
        query = db.query(PRMLead)
        if stage:
            query = query.filter(PRMLead.stage == stage)
        if organization_id:
            query = query.filter(PRMLead.organization_id == organization_id)
        if owner_id:
            query = query.filter(PRMLead.owner_id == owner_id)
        return query.order_by(PRMLead.updated_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_lead_by_id(db: Session, lead_id: str) -> Optional[PRMLead]:
        return db.query(PRMLead).filter(PRMLead.id == lead_id).first()

    @staticmethod
    def create_lead(db: Session, data: LeadCreate, user_id: str) -> PRMLead:
        org = db.query(Organization).filter(Organization.id == data.organization_id).first()
        if not org:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

        # Evaluate BANT
        budget = "UNKNOWN"
        authority = "UNKNOWN"
        need = "UNKNOWN"
        timeline = "UNKNOWN"
        b_notes, a_notes, n_notes, t_notes = None, None, None, None

        if data.bant:
            budget = data.bant.bant_budget or budget
            authority = data.bant.bant_authority or authority
            need = data.bant.bant_need or need
            timeline = data.bant.bant_timeline or timeline
            b_notes = data.bant.bant_budget_notes
            a_notes = data.bant.bant_authority_notes
            n_notes = data.bant.bant_need_notes
            t_notes = data.bant.bant_timeline_notes

        bant_score, is_qualified = PRMService.calculate_bant(budget, authority, need, timeline)

        initial_stage = data.stage
        if initial_stage == "QUALIFIED" and not is_qualified:
            # Stage remains SUSPECT if BANT not satisfied
            initial_stage = "SUSPECT"

        lead = PRMLead(
            organization_id=data.organization_id,
            title=data.title,
            stage=initial_stage,
            source=data.source,
            territory=data.territory,
            owner_id=data.owner_id or user_id,
            team_id=data.team_id,
            bant_budget=budget,
            bant_budget_notes=b_notes,
            bant_authority=authority,
            bant_authority_notes=a_notes,
            bant_need=need,
            bant_need_notes=n_notes,
            bant_timeline=timeline,
            bant_timeline_notes=t_notes,
            bant_score=bant_score,
            is_qualified=is_qualified,
            estimated_value=data.estimated_value,
            target_products=data.target_products,
            target_openings=data.target_openings,
        )
        db.add(lead)
        db.flush()

        # Log lead creation in audit logs
        audit = AuditLog(
            actor_id=user_id,
            action="CREATE_PRM_LEAD",
            entity_type="prm_lead",
            entity_id=lead.id,
            after_state={
                "title": lead.title,
                "organization_id": lead.organization_id,
                "stage": lead.stage,
                "bant_score": lead.bant_score,
            },
        )
        db.add(audit)
        db.commit()
        db.refresh(lead)
        return lead

    @staticmethod
    def update_lead(db: Session, lead_id: str, data: LeadUpdate, user_id: str) -> PRMLead:
        lead = PRMService.get_lead_by_id(db, lead_id)
        if not lead:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

        update_dict = data.model_dump(exclude_unset=True, exclude={"bant"})

        for field, value in update_dict.items():
            setattr(lead, field, value)

        if data.bant:
            bant_data = data.bant.model_dump(exclude_unset=True)
            for field, value in bant_data.items():
                setattr(lead, field, value)

            # Recalculate score
            bant_score, is_qualified = PRMService.calculate_bant(
                lead.bant_budget,
                lead.bant_authority,
                lead.bant_need,
                lead.bant_timeline,
            )
            lead.bant_score = bant_score
            lead.is_qualified = is_qualified

        audit = AuditLog(
            actor_id=user_id,
            action="UPDATE_PRM_LEAD",
            entity_type="prm_lead",
            entity_id=lead.id,
            after_state={
                "stage": lead.stage,
                "bant_score": lead.bant_score,
                "is_qualified": lead.is_qualified,
            },
        )
        db.add(audit)
        db.commit()
        db.refresh(lead)
        return lead

    @staticmethod
    def update_lead_stage(db: Session, lead_id: str, stage_data: LeadStageUpdate, user_id: str) -> PRMLead:
        lead = PRMService.get_lead_by_id(db, lead_id)
        if not lead:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

        prev_stage = lead.stage
        new_stage = stage_data.stage

        # Stage validation rules
        if new_stage == "LOST" and not stage_data.lost_reason:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A lost reason is required when transitioning a lead to LOST",
            )

        lead.stage = new_stage
        if stage_data.lost_reason:
            lead.lost_reason = stage_data.lost_reason

        # Record activity entry for stage change
        activity = PRMActivity(
            organization_id=lead.organization_id,
            lead_id=lead.id,
            user_id=user_id,
            activity_type="STATUS_CHANGE",
            summary=f"Stage changed: {prev_stage} → {new_stage}",
            details=stage_data.notes or (f"Reason: {stage_data.lost_reason}" if stage_data.lost_reason else None),
            occurred_at=datetime.now(timezone.utc),
        )
        db.add(activity)

        # Audit log
        audit = AuditLog(
            actor_id=user_id,
            action="TRANSITION_LEAD_STAGE",
            entity_type="prm_lead",
            entity_id=lead.id,
            before_state={"stage": prev_stage},
            after_state={"stage": new_stage, "notes": stage_data.notes, "lost_reason": stage_data.lost_reason},
        )
        db.add(audit)
        db.commit()
        db.refresh(lead)
        return lead

    @staticmethod
    def add_activity(db: Session, data: ActivityCreate, user_id: str) -> PRMActivity:
        org = db.query(Organization).filter(Organization.id == data.organization_id).first()
        if not org:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

        occurred_at = data.occurred_at or datetime.now(timezone.utc)
        activity = PRMActivity(
            organization_id=data.organization_id,
            lead_id=data.lead_id,
            user_id=user_id,
            activity_type=data.activity_type,
            summary=data.summary,
            details=data.details,
            occurred_at=occurred_at,
            next_step=data.next_step,
            next_step_due=data.next_step_due,
            is_completed=False,
        )
        db.add(activity)

        # Update lead's updated_at timestamp if associated
        if data.lead_id:
            lead = db.query(PRMLead).filter(PRMLead.id == data.lead_id).first()
            if lead:
                lead.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(activity)
        return activity

    @staticmethod
    def get_activities(
        db: Session,
        organization_id: Optional[str] = None,
        lead_id: Optional[str] = None,
        limit: int = 50,
    ) -> List[PRMActivity]:
        query = db.query(PRMActivity)
        if organization_id:
            query = query.filter(PRMActivity.organization_id == organization_id)
        if lead_id:
            query = query.filter(PRMActivity.lead_id == lead_id)
        return query.order_by(PRMActivity.occurred_at.desc()).limit(limit).all()

    @staticmethod
    def get_pending_follow_ups(db: Session, user_id: Optional[str] = None) -> List[PRMActivity]:
        query = db.query(PRMActivity).filter(
            PRMActivity.next_step != None,
            PRMActivity.is_completed == False,
        )
        if user_id:
            query = query.filter(PRMActivity.user_id == user_id)
        return query.order_by(PRMActivity.next_step_due.asc()).all()

    @staticmethod
    def complete_follow_up(db: Session, activity_id: str, user_id: str) -> PRMActivity:
        activity = db.query(PRMActivity).filter(PRMActivity.id == activity_id).first()
        if not activity:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")

        activity.is_completed = True
        db.commit()
        db.refresh(activity)
        return activity

    @staticmethod
    def get_pipeline_summary(db: Session) -> PipelineSummaryResponse:
        results = (
            db.query(
                PRMLead.stage,
                func.count(PRMLead.id).label("count"),
                func.coalesce(func.sum(PRMLead.estimated_value), 0).label("total_value"),
                func.coalesce(func.sum(PRMLead.target_openings), 0).label("total_openings"),
            )
            .group_by(PRMLead.stage)
            .all()
        )

        stage_map = {r.stage: r for r in results}
        summary_items: List[PipelineSummaryItem] = []
        total_leads = 0
        total_val = Decimal("0.00")

        for stage in VALID_STAGES:
            if stage in stage_map:
                r = stage_map[stage]
                count = r.count
                val = Decimal(str(r.total_value))
                openings = r.total_openings
            else:
                count = 0
                val = Decimal("0.00")
                openings = 0

            summary_items.append(
                PipelineSummaryItem(
                    stage=stage,
                    count=count,
                    total_value=val,
                    total_openings=openings,
                )
            )
            total_leads += count
            total_val += val

        return PipelineSummaryResponse(
            stages=summary_items,
            total_leads=total_leads,
            total_pipeline_value=total_val,
        )
