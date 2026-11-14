from sqlalchemy import Column, String, Integer, Boolean, DateTime, Date, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from app.core.database import Base


class AIAgentRun(Base):
    __tablename__ = "ai_agent_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String(36), nullable=False, index=True)
    agent_name = Column(String(50), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    prompt = Column(Text, nullable=False)
    response_text = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="COMPLETED")
    tokens_used = Column(Integer, nullable=False, default=0)
    latency_ms = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    tool_calls = relationship("AIAgentToolCall", back_populates="run", cascade="all, delete-orphan")


class AIAgentToolCall(Base):
    __tablename__ = "ai_agent_tool_calls"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    run_id = Column(String(36), ForeignKey("ai_agent_runs.id"), nullable=False)
    tool_name = Column(String(100), nullable=False)
    arguments_json = Column(JSON, nullable=False, default=dict)
    result_json = Column(JSON, nullable=False, default=dict)
    is_mutation = Column(Boolean, nullable=False, default=False)
    execution_status = Column(String(20), nullable=False, default="SUCCESS")
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    run = relationship("AIAgentRun", back_populates="tool_calls")


class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_code = Column(String(50), unique=True, nullable=False)
    title = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False)
    version = Column(String(20), nullable=False, default="1.0")
    effective_date = Column(Date, nullable=False)
    source_url = Column(Text, nullable=True)
    raw_text = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    chunks = relationship("KnowledgeChunk", back_populates="document", cascade="all, delete-orphan")


class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("knowledge_documents.id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    section_heading = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    metadata_tags = Column(JSON, nullable=False, default=dict)
    token_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    document = relationship("KnowledgeDocument", back_populates="chunks")
