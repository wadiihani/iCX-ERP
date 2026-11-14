-- ==============================================================================
-- 005_exchange_ops_and_cxp_schema.sql
-- Migration 005: Exchange Operations, Logistics, Accommodation & CXP Standards (18)
-- AIESEC iCX Command Center
-- ==============================================================================

-- 1. Operational Exchange Records
CREATE TABLE IF NOT EXISTS exchanges (
    id VARCHAR(36) PRIMARY KEY,
    application_id VARCHAR(36) NOT NULL UNIQUE REFERENCES applications(id) ON DELETE RESTRICT,
    exchange_code VARCHAR(100) NOT NULL UNIQUE,
    modality VARCHAR(50) NOT NULL DEFAULT 'PHYSICAL', -- PHYSICAL, PARTLY_REMOTE, FULLY_REMOTE
    delivery_status VARCHAR(50) NOT NULL DEFAULT 'PRE_ARRIVAL',
    -- PRE_ARRIVAL, ARRIVED, REALIZED, FINISHED, COMPLETED, EARLY_FINISH, BROKEN
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    actual_arrival_date DATE,
    actual_departure_date DATE,
    ips_completed BOOLEAN NOT NULL DEFAULT FALSE,
    worksite_verified BOOLEAN NOT NULL DEFAULT FALSE,
    first_day_attended BOOLEAN NOT NULL DEFAULT FALSE,
    lead_manager_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_exchanges_app_id ON exchanges(application_id);
CREATE INDEX IF NOT EXISTS idx_exchanges_status ON exchanges(delivery_status);

-- 2. Modality-Specific Checklists
CREATE TABLE IF NOT EXISTS exchange_checklists (
    id VARCHAR(36) PRIMARY KEY,
    exchange_id VARCHAR(36) NOT NULL REFERENCES exchanges(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- PRE_ARRIVAL, ARRIVAL, IPS, WORKSITE, LEGAL, DEPARTURE
    item_key VARCHAR(100) NOT NULL,
    item_title VARCHAR(255) NOT NULL,
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_exchange_checklists_ex_id ON exchange_checklists(exchange_id);

-- 3. Incident & Break Case Escalations
CREATE TABLE IF NOT EXISTS exchange_incidents (
    id VARCHAR(36) PRIMARY KEY,
    exchange_id VARCHAR(36) NOT NULL REFERENCES exchanges(id) ON DELETE CASCADE,
    incident_type VARCHAR(50) NOT NULL, -- HEALTH, SAFETY, HARASSMENT, LEGAL, CONTRACT_BREACH, BREAK_REQUEST
    severity VARCHAR(50) NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    description TEXT NOT NULL,
    reported_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN', -- OPEN, INVESTIGATING, ESCALATED, RESOLVED
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. Arrival Logistics (Flight Tracking & Pickups)
CREATE TABLE IF NOT EXISTS arrival_logistics (
    id VARCHAR(36) PRIMARY KEY,
    exchange_id VARCHAR(36) NOT NULL UNIQUE REFERENCES exchanges(id) ON DELETE CASCADE,
    flight_number VARCHAR(50),
    airline VARCHAR(100),
    arrival_airport VARCHAR(50) NOT NULL DEFAULT 'RBA_RABAT', -- RBA_RABAT, CMN_CASABLANCA, RAK_MARRAKECH
    arrival_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    terminal VARCHAR(50),
    pickup_status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, ASSIGNED, EN_ROUTE, PICKED_UP, NO_SHOW
    assigned_driver_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    driver_name VARCHAR(150),
    driver_contact VARCHAR(50),
    transport_mode VARCHAR(50) NOT NULL DEFAULT 'CAR', -- CAR, TRAIN, TAXI
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. Accommodation Units & Assignments
CREATE TABLE IF NOT EXISTS accommodation_units (
    id VARCHAR(36) PRIMARY KEY,
    unit_name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    neighborhood VARCHAR(100) NOT NULL DEFAULT 'Agdal', -- Agdal, Hassan, Hay_Riad, Medina, Ocean
    unit_type VARCHAR(50) NOT NULL DEFAULT 'AIESEC_APARTMENT', -- HOST_FAMILY, AIESEC_APARTMENT, DORMITORY, HOTEL
    capacity_beds INTEGER NOT NULL DEFAULT 1,
    occupied_beds INTEGER NOT NULL DEFAULT 0,
    monthly_rent_mad NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    landlord_name VARCHAR(150),
    landlord_phone VARCHAR(50),
    safety_inspection_passed BOOLEAN NOT NULL DEFAULT FALSE,
    last_inspected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS exchange_accommodations (
    id VARCHAR(36) PRIMARY KEY,
    exchange_id VARCHAR(36) NOT NULL REFERENCES exchanges(id) ON DELETE CASCADE,
    accommodation_unit_id VARCHAR(36) NOT NULL REFERENCES accommodation_units(id) ON DELETE RESTRICT,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PLANNED', -- PLANNED, CHECKED_IN, CHECKED_OUT
    bed_number VARCHAR(20) DEFAULT 'Bed 1',
    key_deposit_mad NUMERIC(10, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. CXP 18 Exchange Standards Fulfillment Engine
CREATE TABLE IF NOT EXISTS exchange_standards_fulfillment (
    id VARCHAR(36) PRIMARY KEY,
    exchange_id VARCHAR(36) NOT NULL REFERENCES exchanges(id) ON DELETE CASCADE,
    standard_number INTEGER NOT NULL, -- 1 to 18
    standard_name VARCHAR(150) NOT NULL,
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    is_fulfilled BOOLEAN NOT NULL DEFAULT FALSE,
    fulfillment_date DATE,
    verified_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    evidence_doc_url VARCHAR(500),
    verification_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (exchange_id, standard_number)
);

CREATE INDEX IF NOT EXISTS idx_std_ex_id ON exchange_standards_fulfillment(exchange_id);

-- 7. Partner Standards & Completion Readiness
CREATE TABLE IF NOT EXISTS partner_standards_evaluations (
    id VARCHAR(36) PRIMARY KEY,
    exchange_id VARCHAR(36) NOT NULL REFERENCES exchanges(id) ON DELETE CASCADE,
    standard_number INTEGER NOT NULL, -- 1 to 10
    standard_name VARCHAR(150) NOT NULL,
    is_fulfilled BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (exchange_id, standard_number)
);

CREATE TABLE IF NOT EXISTS exchange_completions (
    id VARCHAR(36) PRIMARY KEY,
    exchange_id VARCHAR(36) NOT NULL UNIQUE REFERENCES exchanges(id) ON DELETE CASCADE,
    total_standards_fulfilled INTEGER NOT NULL DEFAULT 0,
    mandatory_standards_fulfilled INTEGER NOT NULL DEFAULT 0,
    is_eligible_for_completion BOOLEAN NOT NULL DEFAULT FALSE,
    completion_status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    approved_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT
);
