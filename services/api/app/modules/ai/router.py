from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.modules.identity.models import User
from app.modules.identity.permissions import get_current_user
from app.modules.ai.schemas import AIChatRequest, AIAgentRunResponse
from app.modules.ai import service

router = APIRouter(prefix="/ai", tags=["AI Copilots & Governance"])


@router.post("/chat", response_model=AIAgentRunResponse)
def execute_agent_chat_turn(
    payload: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.run_agent_turn(db, payload, user_id=current_user.id)


@router.get("/runs", response_model=List[AIAgentRunResponse])
def list_agent_runs(
    conversation_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_agent_runs(db, conversation_id)
