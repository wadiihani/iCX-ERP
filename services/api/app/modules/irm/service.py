from typing import List, Optional
from datetime import date
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.modules.irm.models import SendingEntity, VisaFeasibilityAssessment, IRMPartnership
from app.modules.irm.schemas import (
    SendingEntityCreate,
    SendingEntityResponse,
    VisaFeasibilityCreate,
    VisaFeasibilityResponse,
    IRMPartnershipCreate,
    IRMPartnershipResponse,
)
from app.modules.identity.models import AuditLog


class IRMService:
    @staticmethod
    def get_sending_entities(
        db: Session,
        region: Optional[str] = None,
        cluster: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[SendingEntity]:
        query = db.query(SendingEntity)
        if region:
            query = query.filter(SendingEntity.region == region)
        if cluster:
            query = query.filter(SendingEntity.snd_cluster == cluster)
        if search:
            query = query.filter(
                (SendingEntity.country.ilike(f"%{search}%"))
                | (SendingEntity.lc_name.ilike(f"%{search}%"))
                | (SendingEntity.mc_name.ilike(f"%{search}%"))
            )
        return query.order_by(SendingEntity.country.asc()).all()

    @staticmethod
    def create_sending_entity(db: Session, data: SendingEntityCreate, user_id: str) -> SendingEntity:
        entity = SendingEntity(
            country=data.country,
            mc_name=data.mc_name,
            lc_name=data.lc_name,
            region=data.region,
            expa_id=data.expa_id,
            snd_cluster=data.snd_cluster,
            primary_contact_name=data.primary_contact_name,
            primary_contact_email=str(data.primary_contact_email) if data.primary_contact_email else None,
            status=data.status,
        )
        db.add(entity)
        db.flush()

        audit = AuditLog(
            actor_id=user_id,
            action="CREATE_SENDING_ENTITY",
            entity_type="sending_entity",
            entity_id=entity.id,
            after_state={"country": entity.country, "lc_name": entity.lc_name, "cluster": entity.snd_cluster},
        )
        db.add(audit)
        db.commit()
        db.refresh(entity)
        return entity

    @staticmethod
    def get_visa_assessments(db: Session, country: Optional[str] = None) -> List[VisaFeasibilityAssessment]:
        query = db.query(VisaFeasibilityAssessment)
        if country:
            query = query.filter(VisaFeasibilityAssessment.country.ilike(f"%{country}%"))
        return query.order_by(VisaFeasibilityAssessment.country.asc()).all()

    @staticmethod
    def create_or_update_visa_assessment(
        db: Session,
        data: VisaFeasibilityCreate,
        user_id: str,
    ) -> VisaFeasibilityAssessment:
        existing = db.query(VisaFeasibilityAssessment).filter(VisaFeasibilityAssessment.country == data.country).first()
        if existing:
            existing.assessment_status = data.assessment_status
            existing.estimated_processing_days = data.estimated_processing_days
            existing.visa_category = data.visa_category
            existing.source_citation = data.source_citation
            existing.effective_date = data.effective_date
            existing.notes = data.notes
            action = "UPDATE_VISA_FEASIBILITY"
            target = existing
        else:
            target = VisaFeasibilityAssessment(
                country=data.country,
                assessment_status=data.assessment_status,
                estimated_processing_days=data.estimated_processing_days,
                visa_category=data.visa_category,
                source_citation=data.source_citation,
                effective_date=data.effective_date,
                notes=data.notes,
            )
            db.add(target)
            action = "CREATE_VISA_FEASIBILITY"

        db.flush()
        audit = AuditLog(
            actor_id=user_id,
            action=action,
            entity_type="visa_feasibility",
            entity_id=target.id,
            after_state={"country": target.country, "status": target.assessment_status},
        )
        db.add(audit)
        db.commit()
        db.refresh(target)
        return target

    @staticmethod
    def get_partnerships(db: Session) -> List[IRMPartnershipResponse]:
        partnerships = db.query(IRMPartnership).all()
        responses = []
        for p in partnerships:
            resp = IRMPartnershipResponse.model_validate(p)
            if p.sending_entity:
                resp.sending_entity_country = p.sending_entity.country
                resp.sending_entity_lc = p.sending_entity.lc_name
            responses.append(resp)
        return responses

    @staticmethod
    def create_partnership(db: Session, data: IRMPartnershipCreate, user_id: str) -> IRMPartnershipResponse:
        se = db.query(SendingEntity).filter(SendingEntity.id == data.sending_entity_id).first()
        if not se:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sending entity not found")

        partnership = IRMPartnership(
            sending_entity_id=data.sending_entity_id,
            product_type=data.product_type,
            target_pipeline_eps=data.target_pipeline_eps,
            delivered_eps=data.delivered_eps,
            status=data.status,
            weekly_sync_cadence=data.weekly_sync_cadence,
            notes=data.notes,
        )
        db.add(partnership)
        db.flush()

        audit = AuditLog(
            actor_id=user_id,
            action="CREATE_IRM_PARTNERSHIP",
            entity_type="irm_partnership",
            entity_id=partnership.id,
            after_state={"sending_entity_id": se.id, "product": partnership.product_type},
        )
        db.add(audit)
        db.commit()
        db.refresh(partnership)

        resp = IRMPartnershipResponse.model_validate(partnership)
        resp.sending_entity_country = se.country
        resp.sending_entity_lc = se.lc_name
        return resp
