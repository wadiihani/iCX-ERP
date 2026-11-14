-- Migration 003: Opportunities, Products (iGV, iGTa, iGTe), Slots & IRM Schema

-- Opportunities Table
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_code VARCHAR(100) NOT NULL UNIQUE,
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE RESTRICT,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    product_type VARCHAR(50) NOT NULL, -- 'iGV', 'iGTa', 'iGTe'
    modality VARCHAR(50) NOT NULL DEFAULT 'PHYSICAL', -- 'PHYSICAL', 'PARTLY_REMOTE', 'FULLY_REMOTE'
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- 'DRAFT', 'INTERNAL_REVIEW', 'VERIFIED', 'PUBLISHED', 'CLOSED'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_weeks INT NOT NULL,
    working_hours_per_week INT NOT NULL,
    location VARCHAR(255) NOT NULL DEFAULT 'Rabat, Morocco',
    description TEXT NOT NULL,
    role_description TEXT NOT NULL,
    required_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    required_languages JSONB NOT NULL DEFAULT '[]'::jsonb,
    openings_capacity INT NOT NULL DEFAULT 1,
    filled_openings INT NOT NULL DEFAULT 0,
    line_manager_name VARCHAR(150),
    line_manager_contact VARCHAR(150),
    publication_checklist JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_opportunities_contract ON opportunities(contract_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_org ON opportunities(organization_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_product ON opportunities(product_type);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);

-- Opportunity iGV Details Sub-Table
CREATE TABLE IF NOT EXISTS opportunity_igv_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL UNIQUE REFERENCES opportunities(id) ON DELETE CASCADE,
    sdg_number INT NOT NULL, -- 1 to 17
    sdg_target VARCHAR(100),
    global_project_name VARCHAR(150) NOT NULL,
    housing_provided BOOLEAN NOT NULL DEFAULT TRUE,
    food_provided BOOLEAN NOT NULL DEFAULT FALSE,
    transport_provided BOOLEAN NOT NULL DEFAULT FALSE,
    project_fee_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Opportunity iGT / iGTe Details Sub-Table
CREATE TABLE IF NOT EXISTS opportunity_igt_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL UNIQUE REFERENCES opportunities(id) ON DELETE CASCADE,
    work_field VARCHAR(100) NOT NULL, -- 'BA', 'BD', 'MKT', 'IT', 'ENG', 'FIN', 'Other'
    sub_field VARCHAR(150),
    duration_tier VARCHAR(50) NOT NULL DEFAULT 'SHORT', -- 'SHORT', 'MEDIUM', 'LONG'
    monthly_salary NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(20) NOT NULL DEFAULT 'MAD',
    salary_covers_living_costs BOOLEAN NOT NULL DEFAULT FALSE,
    accommodation_covered BOOLEAN NOT NULL DEFAULT FALSE,
    is_teaching_role BOOLEAN NOT NULL DEFAULT FALSE,
    accredited_institution BOOLEAN NOT NULL DEFAULT FALSE,
    accreditation_details TEXT,
    icb_audit_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Opportunity Slots Table (Protected with lock_version for concurrency)
CREATE TABLE IF NOT EXISTS opportunity_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    slot_number VARCHAR(100) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN', -- 'OPEN', 'RESERVED', 'FILLED', 'CANCELLED'
    current_application_id UUID,
    lock_version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_slots_opp ON opportunity_slots(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_slots_status ON opportunity_slots(status);

-- Sending Entities Table (IRM)
CREATE TABLE IF NOT EXISTS sending_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country VARCHAR(100) NOT NULL,
    mc_name VARCHAR(150) NOT NULL,
    lc_name VARCHAR(150) NOT NULL,
    region VARCHAR(50) NOT NULL DEFAULT 'Europe', -- 'MEA', 'Europe', 'Americas', 'Asia-Pacific'
    expa_id VARCHAR(50),
    snd_cluster VARCHAR(50) NOT NULL DEFAULT 'GROW', -- 'UPSCALE', 'GROW', 'INVEST', 'UNDERSTAND'
    primary_contact_name VARCHAR(150),
    primary_contact_email VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_se_country ON sending_entities(country);
CREATE INDEX IF NOT EXISTS idx_se_cluster ON sending_entities(snd_cluster);

-- Visa Feasibility Assessments Table (IRM)
CREATE TABLE IF NOT EXISTS visa_feasibility_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country VARCHAR(100) NOT NULL,
    assessment_status VARCHAR(50) NOT NULL DEFAULT 'FEASIBLE', -- 'FEASIBLE', 'CONDITIONAL', 'HIGH_RISK', 'RESTRICTED'
    estimated_processing_days INT NOT NULL DEFAULT 30,
    visa_category VARCHAR(100) NOT NULL DEFAULT 'Internship / Volunteer',
    source_citation VARCHAR(255) NOT NULL,
    effective_date DATE NOT NULL,
    advisory_disclaimer TEXT NOT NULL DEFAULT 'Operational assessment for planning purposes only; does not constitute official legal advice.',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_visa_country ON visa_feasibility_assessments(country);

-- IRM Partnerships Table
CREATE TABLE IF NOT EXISTS irm_partnerships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sending_entity_id UUID NOT NULL REFERENCES sending_entities(id) ON DELETE CASCADE,
    product_type VARCHAR(50) NOT NULL DEFAULT 'ALL',
    target_pipeline_eps INT NOT NULL DEFAULT 0,
    delivered_eps INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- 'PROSPECT', 'ACTIVE', 'STALLED', 'COMPLETED'
    weekly_sync_cadence VARCHAR(50) NOT NULL DEFAULT 'Weekly',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_irm_se ON irm_partnerships(sending_entity_id);
