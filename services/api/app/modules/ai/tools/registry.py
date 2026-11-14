from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import uuid

from app.modules.applications.models import Application, ApplicationScreening, OPInterview
from app.modules.opportunities.models import Opportunity
from app.modules.prm.models import PRMLead
from app.modules.cxp.models import ExchangeStandardsFulfillment
from app.modules.ai.models import KnowledgeDocument, KnowledgeChunk
from app.modules.approvals.models import ApprovalProposal


class ToolExecutionResult(BaseModel):
    tool_name: str
    status: str  # 'SUCCESS', 'BLOCKED', 'ERROR'
    output: Dict[str, Any]
    is_proposal: bool = False
    proposal_id: Optional[str] = None


def tool_get_application_profile(db: Session, application_id: str) -> Dict[str, Any]:
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        return {"error": f"Application '{application_id}' not found"}

    screenings = [
        {
            "recommendation": s.recommendation,
            "language_proficiency": s.language_proficiency,
            "skills_match": s.skills_match_rating,
            "cultural_fit": s.cultural_fit_rating,
            "notes": s.motivation_notes
        }
        for s in app.screenings
    ]

    interviews = [
        {
            "interviewer": i.interviewer_name,
            "scheduled_at": i.scheduled_at.isoformat() if i.scheduled_at else None,
            "decision": i.op_decision,
            "feedback": i.feedback_notes
        }
        for i in app.op_interviews
    ]

    return {
        "id": app.id,
        "application_code": app.application_code,
        "ep_name": f"{app.ep.first_name} {app.ep.last_name}" if app.ep else "Unknown",
        "ep_country": app.ep.country_of_residence if app.ep else None,
        "current_stage": app.current_stage,
        "official_expa_status": app.official_expa_status,
        "operational_readiness": app.operational_readiness,
        "screenings": screenings,
        "interviews": interviews
    }


def tool_get_opportunity_details(db: Session, opportunity_id: str) -> Dict[str, Any]:
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        return {"error": f"Opportunity '{opportunity_id}' not found"}

    return {
        "id": opp.id,
        "title": opp.title,
        "product_type": opp.product_type,
        "duration_weeks": opp.duration_weeks,
        "modality": opp.modality,
        "capacity_slots": opp.capacity_slots,
        "available_slots": opp.available_slots,
        "is_published": opp.is_published,
        "organization_id": opp.organization_id
    }


def tool_search_knowledge_compendium(db: Session, query: str, category: Optional[str] = None) -> Dict[str, Any]:
    q = db.query(KnowledgeChunk).join(KnowledgeDocument)
    if category:
        q = q.filter(KnowledgeDocument.category == category)

    terms = query.lower().split()
    chunks = q.all()

    scored = []
    for c in chunks:
        score = sum(1 for term in terms if term in c.content.lower() or term in c.section_heading.lower())
        if score > 0:
            scored.append((score, c))

    scored.sort(key=lambda x: x[0], reverse=True)
    top_matches = scored[:3]

    results = []
    for _, chunk in top_matches:
        results.append({
            "document_code": chunk.document.document_code,
            "document_title": chunk.document.title,
            "section_heading": chunk.section_heading,
            "content": chunk.content,
            "evidence_tag": "[VERIFIED]" if "COMPENDIUM" in chunk.document.document_code else "[OFFICIAL]",
            "citation": f"[Source: {chunk.document.title}, {chunk.section_heading}]"
        })

    return {
        "query": query,
        "results_count": len(results),
        "matches": results
    }


def tool_audit_exchange_standards(db: Session, exchange_id: str) -> Dict[str, Any]:
    stds = db.query(ExchangeStandardsFulfillment).filter(
        ExchangeStandardsFulfillment.exchange_id == exchange_id
    ).order_by(ExchangeStandardsFulfillment.standard_number.asc()).all()

    if not stds:
        return {"error": f"Exchange '{exchange_id}' has no standards initialized"}

    mandatory = [s for s in stds if s.is_mandatory]
    optional = [s for s in stds if not s.is_mandatory]

    mandatory_fulfilled = sum(1 for s in mandatory if s.is_fulfilled)
    total_fulfilled = sum(1 for s in stds if s.is_fulfilled)

    missing_mandatory = [f"#{s.standard_number} {s.standard_name}" for s in mandatory if not s.is_fulfilled]

    is_eligible = (mandatory_fulfilled == 13) and (total_fulfilled >= 16)

    return {
        "exchange_id": exchange_id,
        "mandatory_fulfilled": mandatory_fulfilled,
        "mandatory_total": 13,
        "total_fulfilled": total_fulfilled,
        "total_required": 16,
        "is_eligible_for_completion": is_eligible,
        "missing_mandatory": missing_mandatory
    }


def tool_create_approval_proposal(
    db: Session,
    proposed_by: str,
    agent_name: str,
    proposal_type: str,
    target_entity_type: str,
    target_entity_id: str,
    proposed_action: str,
    proposed_payload: Dict[str, Any],
    rationale: str,
    run_id: Optional[str] = None
) -> Dict[str, Any]:
    proposal = ApprovalProposal(
        id=str(uuid.uuid4()),
        run_id=run_id,
        proposed_by=proposed_by,
        agent_name=agent_name,
        proposal_type=proposal_type,
        target_entity_type=target_entity_type,
        target_entity_id=target_entity_id,
        proposed_action=proposed_action,
        proposed_payload=proposed_payload,
        rationale=rationale,
        status="PENDING_HUMAN_REVIEW"
    )
    db.add(proposal)
    db.commit()
    db.refresh(proposal)

    return {
        "proposal_id": proposal.id,
        "status": "PENDING_HUMAN_REVIEW",
        "message": f"Proposal of type '{proposal_type}' submitted to Executive Approval Center. Action requires explicit human verification before execution."
    }
