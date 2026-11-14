-- ==============================================================================
-- 004_crm_and_applications_schema.sql
-- Migration 004: CRM, Exchange Participants (EP), Applications & Matching Engine
-- AIESEC iCX Command Center
-- ==============================================================================

-- 1. Exchange Participants (EP Directory)
CREATE TABLE IF NOT EXISTS exchange_participants (
    id VARCHAR(36) PRIMARY KEY,
    expa_person_id VARCHAR(50) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    country_of_residence VARCHAR(100) NOT NULL,
    nationality VARCHAR(100) NOT NULL,
    home_mc VARCHAR(150),
    home_lc VARCHAR(150),
    date_of_birth DATE,
    gender VARCHAR(20),
    passport_number VARCHAR(100),
    cv_url VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    product_interests VARCHAR(255) DEFAULT 'iGV,iGTa,iGTe',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_eps_email ON exchange_participants(email);
CREATE INDEX IF NOT EXISTS idx_eps_expa_id ON exchange_participants(expa_person_id);
CREATE INDEX IF NOT EXISTS idx_eps_country ON exchange_participants(country_of_residence);

-- 2. EP Documents (Secure Document Vault)
CREATE TABLE IF NOT EXISTS ep_documents (
    id VARCHAR(36) PRIMARY KEY,
    ep_id VARCHAR(36) NOT NULL REFERENCES exchange_participants(id) ON DELETE CASCADE,
    doc_type VARCHAR(50) NOT NULL, -- CV, PASSPORT_COPY, LANGUAGE_CERT, STUDENT_PROOF, ACCEPTANCE_NOTE
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    mime_type VARCHAR(100) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    uploaded_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ep_docs_ep_id ON ep_documents(ep_id);

-- 3. Applications Table (Decoupled Dual-Status Lifecycle)
CREATE TABLE IF NOT EXISTS applications (
    id VARCHAR(36) PRIMARY KEY,
    application_code VARCHAR(100) NOT NULL UNIQUE,
    expa_application_id VARCHAR(50) UNIQUE,
    ep_id VARCHAR(36) NOT NULL REFERENCES exchange_participants(id) ON DELETE RESTRICT,
    opportunity_id VARCHAR(36) NOT NULL REFERENCES opportunities(id) ON DELETE RESTRICT,
    slot_id VARCHAR(36) REFERENCES opportunity_slots(id) ON DELETE SET NULL,
    current_stage VARCHAR(50) NOT NULL DEFAULT 'APPLIED',
    -- Stages: APPLIED, CONTACTED, SCREENING, SHORTLISTED, SENT_TO_OP, INTERVIEW, OP_DECISION, ACCEPTED, APPROVED, REJECTED, WITHDRAWN
    official_expa_status VARCHAR(50) NOT NULL DEFAULT 'APP',
    -- EXPA Statuses: APP, ACC, APD, RE, FI, CO
    operational_readiness VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    -- Operational Readiness: DRAFT, READY, AT_RISK, BLOCKED, DONE
    assigned_manager_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    first_contact_deadline TIMESTAMP WITH TIME ZONE,
    first_contacted_at TIMESTAMP WITH TIME ZONE,
    op_feedback_deadline TIMESTAMP WITH TIME ZONE,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason VARCHAR(255),
    withdrawal_reason VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_apps_ep_id ON applications(ep_id);
CREATE INDEX IF NOT EXISTS idx_apps_opp_id ON applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_apps_slot_id ON applications(slot_id);
CREATE INDEX IF NOT EXISTS idx_apps_stage ON applications(current_stage);
CREATE INDEX IF NOT EXISTS idx_apps_expa_status ON applications(official_expa_status);

-- 4. Application Screenings
CREATE TABLE IF NOT EXISTS application_screenings (
    id VARCHAR(36) PRIMARY KEY,
    application_id VARCHAR(36) NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    reviewer_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    language_proficiency VARCHAR(50) NOT NULL DEFAULT 'INTERMEDIATE',
    background_check_passed BOOLEAN NOT NULL DEFAULT TRUE,
    cultural_fit_rating INTEGER NOT NULL DEFAULT 3,
    skills_match_rating INTEGER NOT NULL DEFAULT 3,
    motivation_notes TEXT,
    recommendation VARCHAR(50) NOT NULL DEFAULT 'RECOMMENDED', -- RECOMMENDED, NEUTRAL, REJECTED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. OP Interviews
CREATE TABLE IF NOT EXISTS op_interviews (
    id VARCHAR(36) PRIMARY KEY,
    application_id VARCHAR(36) NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    interviewer_name VARCHAR(150) NOT NULL,
    interview_type VARCHAR(50) NOT NULL DEFAULT 'ONLINE', -- ONLINE, IN_PERSON
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    conducted_at TIMESTAMP WITH TIME ZONE,
    op_decision VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, ACCEPTED, REJECTED, SECOND_ROUND
    feedback_notes TEXT,
    questions_asked TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. Acceptance Notes & SE Payment Proofs
CREATE TABLE IF NOT EXISTS acceptance_notes (
    id VARCHAR(36) PRIMARY KEY,
    application_id VARCHAR(36) NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    document_url VARCHAR(500) NOT NULL,
    ep_signature_date DATE NOT NULL,
    partner_signature_date DATE NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    verification_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS se_payment_proofs (
    id VARCHAR(36) PRIMARY KEY,
    application_id VARCHAR(36) NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    sending_entity_id VARCHAR(36) REFERENCES sending_entities(id) ON DELETE SET NULL,
    payment_reference VARCHAR(100) NOT NULL,
    amount_eur NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    proof_document_url VARCHAR(500) NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
