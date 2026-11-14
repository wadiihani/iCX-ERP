-- Migration 007: LangGraph AI Agent Runs, Knowledge Base RAG & Human-in-the-Loop Approvals
-- AIESEC iCX Command Center

-- 1. AI Agent Execution Runs
CREATE TABLE IF NOT EXISTS ai_agent_runs (
    id VARCHAR(36) PRIMARY KEY,
    conversation_id VARCHAR(36) NOT NULL,
    agent_name VARCHAR(50) NOT NULL, -- 'POLICY_ASSISTANT', 'EP_SCREENING_COPILOT', 'PARTNER_INTEL_COPILOT', 'RISK_AUDITOR_COPILOT'
    user_id VARCHAR(36) NOT NULL REFERENCES users(id),
    prompt TEXT NOT NULL,
    response_text TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED', -- 'RUNNING', 'COMPLETED', 'FAILED'
    tokens_used INT NOT NULL DEFAULT 0,
    latency_ms INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. AI Agent Tool Calls (Audit trail of every tool invoked)
CREATE TABLE IF NOT EXISTS ai_agent_tool_calls (
    id VARCHAR(36) PRIMARY KEY,
    run_id VARCHAR(36) NOT NULL REFERENCES ai_agent_runs(id) ON DELETE CASCADE,
    tool_name VARCHAR(100) NOT NULL,
    arguments_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    result_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_mutation BOOLEAN NOT NULL DEFAULT FALSE,
    execution_status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS', -- 'SUCCESS', 'BLOCKED', 'ERROR'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Human Approval Proposals (Strict containment: Consequential AI proposals require human sign-off)
CREATE TABLE IF NOT EXISTS approval_proposals (
    id VARCHAR(36) PRIMARY KEY,
    run_id VARCHAR(36) NULL REFERENCES ai_agent_runs(id) ON DELETE SET NULL,
    proposed_by VARCHAR(36) NOT NULL REFERENCES users(id),
    agent_name VARCHAR(50) NOT NULL,
    proposal_type VARCHAR(50) NOT NULL, -- 'STATUS_MUTATION', 'FEE_WAIVER', 'EMAIL_DISPATCH', 'EXCHANGE_COMPLETION', 'STANDARD_OVERRIDE'
    target_entity_type VARCHAR(50) NOT NULL, -- 'APPLICATION', 'OBLIGATION', 'EXCHANGE', 'CONTRACT'
    target_entity_id VARCHAR(36) NOT NULL,
    proposed_action VARCHAR(50) NOT NULL, -- e.g. 'ADVANCE_TO_SHORTLISTED', 'WAIVE_FEES', 'APPROVE_COMPLETION'
    proposed_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    rationale TEXT NOT NULL,
    status VARCHAR(25) NOT NULL DEFAULT 'PENDING_HUMAN_REVIEW', -- 'PENDING_HUMAN_REVIEW', 'APPROVED_EXECUTED', 'REJECTED'
    reviewed_by VARCHAR(36) NULL REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE NULL,
    rejection_reason TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Knowledge Documents (Official AIESEC Policies & SOPs)
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id VARCHAR(36) PRIMARY KEY,
    document_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'GLOBAL_COMPENDIUM_2026', 'ICX_SOP_V3'
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'GLOBAL_COMPENDIUM', 'ICX_SOP', 'LOCAL_MOROCCO_POLICY', 'EXCHANGE_STANDARDS'
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    effective_date DATE NOT NULL,
    source_url TEXT NULL,
    raw_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Knowledge Chunks (For semantic retrieval with source grounding)
CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id VARCHAR(36) PRIMARY KEY,
    document_id VARCHAR(36) NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    section_heading VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    metadata_tags JSONB NOT NULL DEFAULT '{}'::jsonb,
    token_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
