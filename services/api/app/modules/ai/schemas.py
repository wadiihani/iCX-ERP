from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class AIChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    agent_name: str = Field("POLICY_ASSISTANT", pattern="^(POLICY_ASSISTANT|EP_SCREENING_COPILOT|PARTNER_INTEL_COPILOT|RISK_AUDITOR_COPILOT)$")
    prompt: str
    target_id: Optional[str] = None # e.g. application_id, opportunity_id, exchange_id
    propose_action: bool = False
    proposed_action_type: Optional[str] = None


class AIAgentRunResponse(BaseModel):
    id: str
    conversation_id: str
    agent_name: str
    prompt: str
    response_text: str
    status: str
    tokens_used: int
    latency_ms: int
    created_at: datetime
    citations: List[str] = []
    proposals_created: List[Dict[str, Any]] = []

    class Config:
        from_attributes = True


class KnowledgeDocumentCreate(BaseModel):
    document_code: str
    title: str
    category: str = Field(..., pattern="^(GLOBAL_COMPENDIUM|ICX_SOP|LOCAL_MOROCCO_POLICY|EXCHANGE_STANDARDS)$")
    version: str = "1.0"
    effective_date: str
    source_url: Optional[str] = None
    raw_text: str
    sections: List[Dict[str, Any]] = []


class KnowledgeDocumentResponse(BaseModel):
    id: str
    document_code: str
    title: str
    category: str
    version: str
    effective_date: datetime
    source_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
