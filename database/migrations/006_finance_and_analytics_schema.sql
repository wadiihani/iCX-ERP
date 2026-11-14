-- Migration 006: Operational Finance, Legalities & Compliance Checklists
-- AIESEC iCX Command Center

-- 1. Pricing Rule Sets (Versioned, deterministic pricing rules)
CREATE TABLE IF NOT EXISTS pricing_rule_sets (
    id VARCHAR(36) PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL,
    product_type VARCHAR(10) NOT NULL, -- 'iGV', 'iGTa', 'iGTe'
    version INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    currency VARCHAR(5) NOT NULL DEFAULT 'MAD',
    base_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    min_duration_weeks INT NOT NULL DEFAULT 6,
    max_duration_weeks INT NOT NULL DEFAULT 78,
    weekly_additional_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    administrative_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_tier_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00, -- discount if >= 12 weeks
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Pricing Calculations (Audit log of evaluations)
CREATE TABLE IF NOT EXISTS pricing_calculations (
    id VARCHAR(36) PRIMARY KEY,
    rule_set_id VARCHAR(36) NOT NULL REFERENCES pricing_rule_sets(id),
    opportunity_id VARCHAR(36) NULL REFERENCES opportunities(id),
    calculated_by VARCHAR(36) NULL REFERENCES users(id),
    product_type VARCHAR(10) NOT NULL,
    duration_weeks INT NOT NULL,
    modality VARCHAR(20) NOT NULL, -- 'PHYSICAL', 'PARTLY_REMOTE', 'FULLY_REMOTE'
    num_trainees INT NOT NULL DEFAULT 1,
    base_subtotal NUMERIC(10, 2) NOT NULL,
    additional_duration_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    administrative_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_applied NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_calculated_fee NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(5) NOT NULL DEFAULT 'MAD',
    notes TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Payment Obligations (Tranches / Milestones)
CREATE TABLE IF NOT EXISTS payment_obligations (
    id VARCHAR(36) PRIMARY KEY,
    contract_id VARCHAR(36) NULL REFERENCES contracts(id),
    opportunity_id VARCHAR(36) NULL REFERENCES opportunities(id),
    exchange_id VARCHAR(36) NULL REFERENCES exchanges(id),
    obligation_title VARCHAR(150) NOT NULL, -- e.g. "Initial Match Deposit (30%)"
    milestone_trigger VARCHAR(50) NOT NULL, -- 'CONTRACT_SIGNING', 'MATCH_APPROVED', 'ARRIVAL', 'COMPLETION'
    expected_amount NUMERIC(10, 2) NOT NULL,
    paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(5) NOT NULL DEFAULT 'MAD',
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'WAIVED'
    notes TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Payments (Receipts & Transactions)
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY,
    obligation_id VARCHAR(36) NOT NULL REFERENCES payment_obligations(id),
    amount_paid NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(5) NOT NULL DEFAULT 'MAD',
    payment_method VARCHAR(30) NOT NULL DEFAULT 'BANK_TRANSFER', -- 'BANK_TRANSFER', 'CASH', 'CHEQUE', 'ONLINE'
    transaction_reference VARCHAR(100) NOT NULL,
    receipt_doc_url TEXT NULL,
    paid_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    recorded_by VARCHAR(36) NULL REFERENCES users(id),
    notes TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Financial Cases & Refunds (Waivers, disputes, refunds)
CREATE TABLE IF NOT EXISTS financial_cases (
    id VARCHAR(36) PRIMARY KEY,
    case_type VARCHAR(30) NOT NULL, -- 'FEE_WAIVER', 'DISCOUNT_REQUEST', 'REFUND', 'ANNEX_2_PENALTY'
    obligation_id VARCHAR(36) NULL REFERENCES payment_obligations(id),
    contract_id VARCHAR(36) NULL REFERENCES contracts(id),
    exchange_id VARCHAR(36) NULL REFERENCES exchanges(id),
    requested_amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(5) NOT NULL DEFAULT 'MAD',
    reason TEXT NOT NULL,
    requested_by VARCHAR(36) NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING_APPROVAL', -- 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'
    reviewed_by VARCHAR(36) NULL REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE NULL,
    review_notes TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Operational Risk Register
CREATE TABLE IF NOT EXISTS risk_register_entries (
    id VARCHAR(36) PRIMARY KEY,
    risk_category VARCHAR(30) NOT NULL, -- 'FINANCIAL', 'LEGAL', 'HEALTH_SAFETY', 'PARTNER_RELATIONS', 'REPUTATION'
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    probability INT NOT NULL CHECK (probability BETWEEN 1 AND 5),
    impact INT NOT NULL CHECK (impact BETWEEN 1 AND 5),
    severity_score INT GENERATED ALWAYS AS (probability * impact) STORED,
    mitigation_plan TEXT NOT NULL,
    contingency_plan TEXT NULL,
    owner_id VARCHAR(36) NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'IDENTIFIED', -- 'IDENTIFIED', 'MITIGATING', 'MONITORED', 'CLOSED'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. IAC Compliance Audit Checklists
CREATE TABLE IF NOT EXISTS iac_audit_items (
    id VARCHAR(36) PRIMARY KEY,
    audit_cycle VARCHAR(50) NOT NULL, -- e.g. "2026-Q1-AUDIT"
    check_item VARCHAR(150) NOT NULL,
    category VARCHAR(30) NOT NULL, -- 'CONTRACTS', 'FINANCE', 'HEALTH_SAFETY', 'STANDARDS', 'LEGAL'
    description TEXT NOT NULL,
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    compliance_status VARCHAR(25) NOT NULL DEFAULT 'PENDING_AUDIT', -- 'PENDING_AUDIT', 'VERIFIED', 'FLAGGED_NON_COMPLIANT'
    evidence_url TEXT NULL,
    audited_by VARCHAR(36) NULL REFERENCES users(id),
    audited_at TIMESTAMP WITH TIME ZONE NULL,
    findings TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. Legal Document Vault
CREATE TABLE IF NOT EXISTS legal_documents (
    id VARCHAR(36) PRIMARY KEY,
    document_category VARCHAR(30) NOT NULL, -- 'CONTRACT', 'AGREEMENT_MOU', 'INSURANCE', 'VISA_LETTER', 'EMERGENCY_CONTACT_FORM'
    title VARCHAR(150) NOT NULL,
    entity_id VARCHAR(36) NULL, -- Related Organization, Contract, or Exchange ID
    file_url TEXT NOT NULL,
    valid_from DATE NOT NULL,
    valid_until DATE NULL,
    is_signed BOOLEAN NOT NULL DEFAULT FALSE,
    uploaded_by VARCHAR(36) NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
