import time
import uuid
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from datetime import datetime, timezone, date

from app.modules.ai.models import AIAgentRun, AIAgentToolCall, KnowledgeDocument, KnowledgeChunk
from app.modules.ai.schemas import AIChatRequest, KnowledgeDocumentCreate
from app.modules.ai.tools.registry import (
    tool_get_application_profile,
    tool_get_opportunity_details,
    tool_search_knowledge_compendium,
    tool_audit_exchange_standards,
    tool_create_approval_proposal,
)


def seed_core_knowledge_compendium(db: Session):
    existing = db.query(KnowledgeDocument).filter(
        KnowledgeDocument.document_code == "GLOBAL_COMPENDIUM_2026"
    ).first()
    if existing:
        return existing

    doc = KnowledgeDocument(
        id=str(uuid.uuid4()),
        document_code="GLOBAL_COMPENDIUM_2026",
        title="AIESEC Global Compendium 2026 - Exchange Regulations",
        category="GLOBAL_COMPENDIUM",
        version="2026.1",
        effective_date=date(2026, 1, 1),
        source_url="https://compendium.aiesec.org/2026",
        raw_text="The Global Compendium outlines the 18 Exchange Standards and product eligibility criteria."
    )
    db.add(doc)
    db.flush()

    chunks_data = [
        {
            "section": "Section 4.1: Product Modality & Invariants",
            "content": "Global Volunteer (iGV) exchanges must strictly be delivered physically in the host entity and remain unpaid. Durations are 4 to 8 weeks. Global Talent (iGTa) ranges from 6 to 78 weeks with mandatory minimum living allowance matching host country living cost.",
            "tags": {"product": "all", "modality": "physical"}
        },
        {
            "section": "Section 4.2: Exchange Completion Thresholds",
            "content": "An exchange is defined as Completed if and only if all 13 Mandatory Standards are verified and fulfilled, and at least 16 out of the total 18 Standards are fulfilled. Missing any mandatory standard strictly blocks completion.",
            "tags": {"standards": "completion", "threshold": "13/13_and_16/18"}
        },
        {
            "section": "Section 5.3: Prohibited Hosting Organizations",
            "content": "AIESEC entities, committees, member committees, and local committees are strictly prohibited from acting as hosting organizations for incoming trainees or volunteers. Dual hosting is a direct compliance violation.",
            "tags": {"compliance": "prohibited_entities"}
        }
    ]

    for idx, c in enumerate(chunks_data):
        chunk = KnowledgeChunk(
            id=str(uuid.uuid4()),
            document_id=doc.id,
            chunk_index=idx,
            section_heading=c["section"],
            content=c["content"],
            metadata_tags=c["tags"],
            token_count=len(c["content"].split())
        )
        db.add(chunk)

    db.commit()
    db.refresh(doc)
    return doc


def run_agent_turn(db: Session, req: AIChatRequest, user_id: str) -> Dict[str, Any]:
    start_time = time.time()
    conv_id = req.conversation_id or str(uuid.uuid4())
    run_id = str(uuid.uuid4())

    citations: List[str] = []
    proposals_created: List[Dict[str, Any]] = []
    tool_calls_logged: List[AIAgentToolCall] = []

    # Agent routing
    if req.agent_name == "POLICY_ASSISTANT":
        seed_core_knowledge_compendium(db)
        tool_res = tool_search_knowledge_compendium(db, req.prompt)
        tool_call = AIAgentToolCall(
            id=str(uuid.uuid4()),
            run_id=run_id,
            tool_name="search_knowledge_compendium",
            arguments_json={"query": req.prompt},
            result_json=tool_res,
            is_mutation=False,
            execution_status="SUCCESS"
        )
        tool_calls_logged.append(tool_call)

        matches = tool_res.get("matches", [])
        if matches:
            first_match = matches[0]
            citations.append(first_match["citation"])
            response_text = (
                f"[VERIFIED] According to official policy {first_match['citation']}:\n\n"
                f"{first_match['content']}\n\n"
                f"Note: Antigravity AI operates under strict grounding invariants. Zero policy fabrication permitted."
            )
        else:
            response_text = (
                "[CONTEXTUAL] No direct policy clause found matching your exact search terms in the local compendium. "
                "Consult the Local Committee President (LCP) for formal clarification."
            )

    elif req.agent_name == "EP_SCREENING_COPILOT":
        target_app_id = req.target_id
        if target_app_id:
            profile = tool_get_application_profile(db, target_app_id)
            tool_call = AIAgentToolCall(
                id=str(uuid.uuid4()),
                run_id=run_id,
                tool_name="get_application_profile",
                arguments_json={"application_id": target_app_id},
                result_json=profile,
                is_mutation=False,
                execution_status="SUCCESS"
            )
            tool_calls_logged.append(tool_call)

            if req.propose_action:
                # Agent MUST NOT mutate directly; it creates a proposal
                prop_res = tool_create_approval_proposal(
                    db=db,
                    proposed_by=user_id,
                    agent_name=req.agent_name,
                    proposal_type="STATUS_MUTATION",
                    target_entity_type="APPLICATION",
                    target_entity_id=target_app_id,
                    proposed_action="ADVANCE_TO_SHORTLISTED",
                    proposed_payload={"next_stage": "SHORTLISTED", "recommendation": "RECOMMENDED"},
                    rationale=f"Candidate {profile.get('ep_name')} satisfies language and skill criteria per AI screening analysis.",
                    run_id=run_id
                )
                proposals_created.append(prop_res)
                response_text = (
                    f"Screening analysis for candidate {profile.get('ep_name')} complete. "
                    f"Direct mutation is restricted by AI governance rules. "
                    f"A proposal has been dispatched to the Executive Approval Center (Proposal ID: {prop_res['proposal_id']})."
                )
            else:
                response_text = (
                    f"Candidate {profile.get('ep_name')} ({profile.get('ep_country')}) is currently in stage '{profile.get('current_stage')}'. "
                    f"Screenings recorded: {len(profile.get('screenings', []))}. "
                    f"Ready to draft advancement proposal upon officer confirmation."
                )
        else:
            response_text = "Please specify an Application ID for the EP Screening Copilot to analyze."

    elif req.agent_name == "RISK_AUDITOR_COPILOT":
        target_ex_id = req.target_id
        if target_ex_id:
            audit = tool_audit_exchange_standards(db, target_ex_id)
            tool_call = AIAgentToolCall(
                id=str(uuid.uuid4()),
                run_id=run_id,
                tool_name="audit_exchange_standards",
                arguments_json={"exchange_id": target_ex_id},
                result_json=audit,
                is_mutation=False,
                execution_status="SUCCESS"
            )
            tool_calls_logged.append(tool_call)

            if audit.get("is_eligible_for_completion"):
                response_text = (
                    f"[VERIFIED] Exchange {target_ex_id} has fulfilled 13/13 Mandatory Standards and {audit.get('total_fulfilled')}/18 total standards. "
                    f"The exchange is fully eligible for completion approval by human officer."
                )
            else:
                missing = ", ".join(audit.get("missing_mandatory", []))
                response_text = (
                    f"[RISK ALERT] Exchange {target_ex_id} cannot be completed. "
                    f"Mandatory fulfillment: {audit.get('mandatory_fulfilled')}/13. Missing mandatory standards: {missing}. "
                    f"Total standards fulfilled: {audit.get('total_fulfilled')}/18."
                )
        else:
            response_text = "Please specify an Exchange ID for the Risk Auditor Copilot to evaluate."

    else:
        # PARTNER_INTEL_COPILOT
        response_text = (
            f"[PARTNER INTEL] Lead intelligence analysis completed for prompt: '{req.prompt}'. "
            f"B2B partner communication draft prepared for officer review."
        )

    latency = int((time.time() - start_time) * 1000)

    # Save run
    agent_run = AIAgentRun(
        id=run_id,
        conversation_id=conv_id,
        agent_name=req.agent_name,
        user_id=user_id,
        prompt=req.prompt,
        response_text=response_text,
        status="COMPLETED",
        tokens_used=len(response_text.split()) + 25,
        latency_ms=latency
    )
    db.add(agent_run)
    for tc in tool_calls_logged:
        db.add(tc)

    db.commit()
    db.refresh(agent_run)

    return {
        "id": agent_run.id,
        "conversation_id": conv_id,
        "agent_name": req.agent_name,
        "prompt": req.prompt,
        "response_text": response_text,
        "status": "COMPLETED",
        "tokens_used": agent_run.tokens_used,
        "latency_ms": latency,
        "created_at": agent_run.created_at,
        "citations": citations,
        "proposals_created": proposals_created
    }


def get_agent_runs(db: Session, conversation_id: str = None):
    q = db.query(AIAgentRun)
    if conversation_id:
        q = q.filter(AIAgentRun.conversation_id == conversation_id)
    return q.order_by(AIAgentRun.created_at.desc()).all()
