from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timezone
import uuid

from app.modules.legalities.models import RiskRegisterEntry, IACAuditItem, LegalDocument
from app.modules.legalities.schemas import (
    RiskRegisterCreate,
    RiskRegisterUpdate,
    IACAuditItemCreate,
    IACAuditItemUpdate,
    LegalDocumentCreate
)


def get_risk_entries(db: Session, status_filter: str = None, category_filter: str = None):
    q = db.query(RiskRegisterEntry)
    if status_filter:
        q = q.filter(RiskRegisterEntry.status == status_filter)
    if category_filter:
        q = q.filter(RiskRegisterEntry.risk_category == category_filter)
    return q.order_by(RiskRegisterEntry.severity_score.desc()).all()


def create_risk_entry(db: Session, payload: RiskRegisterCreate) -> RiskRegisterEntry:
    entry = RiskRegisterEntry(
        id=str(uuid.uuid4()),
        risk_category=payload.risk_category,
        title=payload.title,
        description=payload.description,
        probability=payload.probability,
        impact=payload.impact,
        severity_score=payload.probability * payload.impact,
        mitigation_plan=payload.mitigation_plan,
        contingency_plan=payload.contingency_plan,
        owner_id=payload.owner_id,
        status="IDENTIFIED"
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def update_risk_entry(db: Session, risk_id: str, payload: RiskRegisterUpdate) -> RiskRegisterEntry:
    entry = db.query(RiskRegisterEntry).filter(RiskRegisterEntry.id == risk_id).first()
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Risk entry '{risk_id}' not found"
        )

    if payload.title is not None:
        entry.title = payload.title
    if payload.description is not None:
        entry.description = payload.description
    if payload.probability is not None:
        entry.probability = payload.probability
    if payload.impact is not None:
        entry.impact = payload.impact
    if payload.probability is not None or payload.impact is not None:
        entry.severity_score = entry.probability * entry.impact
    if payload.mitigation_plan is not None:
        entry.mitigation_plan = payload.mitigation_plan
    if payload.contingency_plan is not None:
        entry.contingency_plan = payload.contingency_plan
    if payload.status is not None:
        entry.status = payload.status

    entry.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(entry)
    return entry


def get_iac_items(db: Session, audit_cycle: str = None):
    q = db.query(IACAuditItem)
    if audit_cycle:
        q = q.filter(IACAuditItem.audit_cycle == audit_cycle)
    return q.order_by(IACAuditItem.created_at.asc()).all()


def create_iac_item(db: Session, payload: IACAuditItemCreate) -> IACAuditItem:
    item = IACAuditItem(
        id=str(uuid.uuid4()),
        audit_cycle=payload.audit_cycle,
        check_item=payload.check_item,
        category=payload.category,
        description=payload.description,
        is_mandatory=payload.is_mandatory,
        compliance_status="PENDING_AUDIT",
        evidence_url=payload.evidence_url
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def audit_iac_item(db: Session, item_id: str, payload: IACAuditItemUpdate, user_id: str) -> IACAuditItem:
    item = db.query(IACAuditItem).filter(IACAuditItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"IAC audit item '{item_id}' not found"
        )

    item.compliance_status = payload.compliance_status
    if payload.evidence_url:
        item.evidence_url = payload.evidence_url
    if payload.findings:
        item.findings = payload.findings
    item.audited_by = user_id
    item.audited_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(item)
    return item


def get_legal_documents(db: Session, category: str = None, entity_id: str = None):
    q = db.query(LegalDocument)
    if category:
        q = q.filter(LegalDocument.document_category == category)
    if entity_id:
        q = q.filter(LegalDocument.entity_id == entity_id)
    return q.order_by(LegalDocument.valid_from.desc()).all()


def upload_legal_document(db: Session, payload: LegalDocumentCreate, user_id: str = None) -> LegalDocument:
    doc = LegalDocument(
        id=str(uuid.uuid4()),
        document_category=payload.document_category,
        title=payload.title,
        entity_id=payload.entity_id,
        file_url=payload.file_url,
        valid_from=payload.valid_from,
        valid_until=payload.valid_until,
        is_signed=payload.is_signed,
        uploaded_by=user_id
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc
