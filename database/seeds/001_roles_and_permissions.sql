-- 001_roles_and_permissions.sql: Default Roles & Core Permissions

INSERT INTO roles (id, name, description) VALUES
('BD_MEMBER', 'BD / B2B Member', 'Local partner sourcing, qualification, meetings, and contract drafting'),
('IR_MEMBER', 'IR Member', 'Foreign Sending Entity research, international relations, and promo tracking'),
('EP_MANAGER', 'EP Manager', 'Candidate screening, interview coordination, and slot matching'),
('CX_MEMBER', 'Operations / CX Member', 'Arrival pickup, accommodation, exchange delivery, and standards tracking'),
('TEAM_LEADER', 'Team Leader', 'Pod supervisor with review approval and team workload allocation'),
('LCVP_ICX', 'LCVP iCX', 'Executive portfolio head with opportunity and break-case approval authority'),
('LCVP_FNL', 'LCVP FnL', 'Finance & legalities vice-president with pricing and payment approval rights'),
('LCP_ADMIN', 'LCP / Executive Admin', 'Full system and governance administrative access')
ON CONFLICT (id) DO NOTHING;

INSERT INTO permissions (id, name, module, description) VALUES
-- PRM
('partner:read', 'View Partner Directory', 'PRM', 'View local hosting organizations and contacts'),
('partner:write', 'Create/Edit Partner', 'PRM', 'Create or update organization profiles and leads'),
('contract:read', 'View Contracts', 'PRM', 'View partner contracts and terms'),
('contract:draft', 'Draft Contract', 'PRM', 'Create draft contracts and upload versions'),
('contract:approve', 'Approve Contract', 'PRM', 'Formally approve partner contracts'),

-- Opportunities
('opportunity:read', 'View Opportunities', 'OPPORTUNITIES', 'View opportunity catalog and slot openings'),
('opportunity:create', 'Create Opportunity', 'OPPORTUNITIES', 'Draft new iGV, iGTa, or iGTe opportunities'),
('opportunity:publish', 'Publish Opportunity', 'OPPORTUNITIES', 'Publish verified opportunities to active state'),

-- CRM & Applications
('ep:read', 'View EPs', 'CRM', 'View EP profiles with masked PII'),
('ep:pii:view', 'View Sensitive EP Data', 'CRM', 'Unmask passport, phone, and identity documents'),
('application:screen', 'Screen Applications', 'APPLICATIONS', 'Conduct screening and interview evaluations'),
('application:match', 'Approve Match', 'APPLICATIONS', 'Execute formal match and assign slot capacity'),

-- Exchange Ops & CXP
('exchange:read', 'View Exchange Operations', 'EXCHANGE', 'View active exchange deliveries and logistics'),
('exchange:logistics:edit', 'Update Logistics', 'EXCHANGE', 'Manage airport pickup and bed allocation'),
('standards:verify', 'Verify Standards Evidence', 'CXP', 'Verify submitted proof for the 18 standards'),

-- Finance
('finance:pricing:read', 'View Pricing', 'FINANCE', 'View pricing calculators and fee schedules'),
('finance:payment:approve', 'Approve Payments', 'FINANCE', 'Approve received funds, waivers, or refunds'),

-- Governance & Admin
('approval:decide', 'Decide Pending Approvals', 'GOVERNANCE', 'Authorize or reject pending consequential actions'),
('ai:invoke', 'Use AI Copilots', 'AI', 'Query specialized AI copilots and RAG knowledge vault'),
('audit:read', 'Inspect Audit Logs', 'SECURITY', 'View immutable audit trail and security events'),
('admin:users', 'Manage Users & Roles', 'ADMIN', 'Assign roles, teams, and user statuses')
ON CONFLICT (id) DO NOTHING;

-- Assign permissions to LCP_ADMIN (all permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'LCP_ADMIN', id FROM permissions
ON CONFLICT DO NOTHING;

-- Assign permissions to LCVP_ICX
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'LCVP_ICX', id FROM permissions WHERE id IN (
    'partner:read', 'partner:write', 'contract:read', 'contract:approve',
    'opportunity:read', 'opportunity:create', 'opportunity:publish',
    'ep:read', 'ep:pii:view', 'application:screen', 'application:match',
    'exchange:read', 'exchange:logistics:edit', 'standards:verify',
    'approval:decide', 'ai:invoke', 'audit:read'
)
ON CONFLICT DO NOTHING;

-- Assign permissions to LCVP_FNL
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'LCVP_FNL', id FROM permissions WHERE id IN (
    'partner:read', 'contract:read', 'contract:approve',
    'finance:pricing:read', 'finance:payment:approve',
    'approval:decide', 'ai:invoke', 'audit:read'
)
ON CONFLICT DO NOTHING;
