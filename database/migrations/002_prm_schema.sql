-- Migration 002: PRM Schema (Organizations, Contacts, Leads, Activities, Contracts, Operational Risks)

-- Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    sector VARCHAR(100) NOT NULL DEFAULT 'Other', -- NGO, School/Education, Startup, Corporate, Tech, Healthcare, Public, Other
    org_type VARCHAR(100) NOT NULL DEFAULT 'Company', -- Company, NGO, School, University, Foundation, Other
    website VARCHAR(255),
    location VARCHAR(255) NOT NULL DEFAULT 'Rabat, Morocco',
    address TEXT,
    tax_id VARCHAR(100),
    verification_status VARCHAR(50) NOT NULL DEFAULT 'UNVERIFIED', -- UNVERIFIED, VERIFIED, REJECTED, PROHIBITED
    is_prohibited BOOLEAN NOT NULL DEFAULT FALSE,
    prohibition_reason TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'LEAD', -- LEAD, ACTIVE_PARTNER, CHURNED, BLACKLISTED
    relationship_health VARCHAR(50) NOT NULL DEFAULT 'GOOD', -- EXCELLENT, GOOD, AT_RISK, CRITICAL
    account_manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_organizations_name ON organizations(name);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);
CREATE INDEX IF NOT EXISTS idx_organizations_verification ON organizations(verification_status);

-- Organization Contacts Table
CREATE TABLE IF NOT EXISTS organization_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    job_title VARCHAR(150),
    department VARCHAR(100),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_org_contacts_org_id ON organization_contacts(organization_id);

-- PRM Leads Table
CREATE TABLE IF NOT EXISTS prm_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    stage VARCHAR(50) NOT NULL DEFAULT 'SUSPECT', 
    -- SUSPECT, QUALIFIED, CONTACTED, MEETING_SCHEDULED, MEETING_HELD, PROPOSAL, NEGOTIATION, CONTRACT_SIGNED, ACTIVE_ACCOUNT, UNQUALIFIED, NO_RESPONSE, ON_HOLD, LOST
    source VARCHAR(100) NOT NULL DEFAULT 'Cold Outreach',
    territory VARCHAR(100) NOT NULL DEFAULT 'Rabat',
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    
    -- BANT Framework
    bant_budget VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN', -- UNKNOWN, NO_BUDGET, ADEQUATE, HIGH
    bant_budget_notes TEXT,
    bant_authority VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN', -- UNKNOWN, NO_DECISION_POWER, INFLUENCER, DECISION_MAKER
    bant_authority_notes TEXT,
    bant_need VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN', -- UNKNOWN, LOW, CLEAR_NEED, CRITICAL_PAIN
    bant_need_notes TEXT,
    bant_timeline VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN', -- UNKNOWN, GREATER_6_MONTHS, WITHIN_3_6_MONTHS, IMMEDIATE_1_3_MONTHS
    bant_timeline_notes TEXT,
    bant_score INT NOT NULL DEFAULT 0,
    is_qualified BOOLEAN NOT NULL DEFAULT FALSE,

    estimated_value NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    target_products JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g. ["iGV", "iGTa", "iGTe"]
    target_openings INT NOT NULL DEFAULT 1,
    lost_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_prm_leads_org_id ON prm_leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_prm_leads_stage ON prm_leads(stage);
CREATE INDEX IF NOT EXISTS idx_prm_leads_owner ON prm_leads(owner_id);

-- PRM Activities Table
CREATE TABLE IF NOT EXISTS prm_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES prm_leads(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- CALL, MEETING, EMAIL, NOTE, FOLLOW_UP, STATUS_CHANGE
    summary VARCHAR(255) NOT NULL,
    details TEXT,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    next_step TEXT,
    next_step_due TIMESTAMPTZ,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_prm_activities_org ON prm_activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_prm_activities_lead ON prm_activities(lead_id);

-- Contracts Table
CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_number VARCHAR(100) NOT NULL UNIQUE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES prm_leads(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- DRAFT, UNDER_REVIEW, SIGNED, ACTIVE, EXPIRED, TERMINATED
    version INT NOT NULL DEFAULT 1,
    product_types JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g. ["iGTa", "iGV"]
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_slots INT NOT NULL DEFAULT 1,
    financial_terms JSONB NOT NULL DEFAULT '{}'::jsonb,
    special_clauses TEXT,
    document_url VARCHAR(500),
    signed_at TIMESTAMPTZ,
    signed_by_partner VARCHAR(255),
    signed_by_aiesec_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    iac_audit_ready BOOLEAN NOT NULL DEFAULT FALSE,
    iac_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contracts_org ON contracts(organization_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);

-- Operational Risks Table (FNL-05)
CREATE TABLE IF NOT EXISTS operational_risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'OPERATIONAL', -- LEGAL, FINANCIAL, REPUTATIONAL, OPERATIONAL, SAFETY
    probability INT NOT NULL DEFAULT 1, -- 1 to 5
    impact INT NOT NULL DEFAULT 1, -- 1 to 5
    score INT NOT NULL DEFAULT 1, -- probability * impact (1 to 25)
    mitigation_plan TEXT NOT NULL,
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN', -- OPEN, MITIGATED, ACCEPTED, CLOSED
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_risks_org ON operational_risks(organization_id);
