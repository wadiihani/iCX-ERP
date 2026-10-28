# Requirements: AIESEC iCX ERP (Tracker-First Baseline)

**Defined:** 2026-10-27  
**Core Value:** A reliable, table-first operational data workspace where every number reconciles to live underlying records, every stakeholder transition is bound by an explicit handoff contract, and no exchange participant or delivery deadline is lost.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### 1. Data Foundation & Persistence (DATA)
- [ ] **DATA-01**: PostgreSQL schema implementing 54 normalized tables with UUID primary keys and `Africa/Casablanca` timezone handling.
- [ ] **DATA-02**: Tenant isolation enforced at database layer via Supabase Row-Level Security (RLS) on all tables using `lc_id`.
- [ ] **DATA-03**: Append-only tamper-evident audit logs on `audit_events` and `status_transitions` with SHA-256 hash chaining (`prev_hash` → `hash`).
- [ ] **DATA-04**: Database exclusion constraints (`btree_gist`) preventing double-booking of accommodation beds across overlapping date intervals.
- [ ] **DATA-05**: Encrypted PII storage for Law 09-08 sensitive fields (passports, national ID, emergency contacts) with audited access logging.

### 2. Table-First Tracker Workspace (UI)
- [ ] **UI-01**: Core Table Component featuring global search, multi-column filters, column visibility chooser, and sticky column headers.
- [ ] **UI-02**: Record Detail Layout featuring 8 standardized panels: Identity, Current State, Key Details, Relationships, Timeline, Next Actions, Evidence, and Audit.
- [ ] **UI-03**: Fast client-side and server-side navigation with preserved filter query state upon navigating back from record details.
- [ ] **UI-04**: AIESEC brand design system tokens (Blue `#037EF3`, Coral `#F85A40`, Teal `#0CB9C1`, Orange `#F48924`) meeting WCAG 2.2 AA contrast standards.
- [ ] **UI-05**: Responsive operational layouts accessible on desktop and mobile viewports down to 375px for airport/field operations.

### 3. B2B Partner CRM, Deals & Workload Tracking (CRM)
- [ ] **CRM-01**: Organizations and Contacts directory with relationship timeline, communication touchpoints, and health indicators.
- [ ] **CRM-02**: B2B Deal Pipeline supporting the 9 stages of State Machine `SM-01` (`LEAD` → `DISCOVERY` → `PROPOSAL` → `CONTRACT_SIGNED` / `CLOSED_LOST`).
- [ ] **CRM-03**: Explicit Stakeholder Handoff protocol (`handoff_id`, `from_owner`, `to_owner`, open task counts, acceptance/rejection flow).
- [ ] **CRM-04**: Task & Workload Tracker with department assignments, SLA countdowns, escalation alerts, and zero orphaned tasks.

### 4. Opportunities, Slots & EP Lifecycle Matching (EP)
- [ ] **EP-01**: Opportunity and Slot inventory management preventing overbooking and displaying real-time readiness indicators.
- [ ] **EP-02**: International Relations (IRM) partner LC pipeline tracking supply commitments and communication velocity.
- [ ] **EP-03**: EP Dossier table and detail views tracking full lifecycle (`APPLIED` → `HOST_SCREENING` → `OP_REVIEW` → `APPROVED` → `REALIZED` → `COMPLETED`).
- [ ] **EP-04**: Multi-criteria matching engine linking qualified applicants to open opportunity slots with prerequisite validation.

### 5. Exchange Delivery Operations & Case Solving (OPS)
- [ ] **OPS-01**: 18 Exchange Standards delivery matrix (13 mandatory + 5 non-mandatory) with evidence attachment and verification timestamps.
- [ ] **OPS-02**: Logistics and Arrival board tracking flight details, pickup assignments, and Day-1 host accompaniment.
- [ ] **OPS-03**: Accommodation inventory and bed allocation board enforcing non-overlapping reservations.
- [ ] **OPS-04**: Confidential Case Solving Vault with role-restricted access, 3-tier escalation clocks, and audit logging.

### 6. Finance Controls & Reconciled KPI Dashboards (FIN)
- [ ] **FIN-01**: Operational invoice and payment tracking with dual-approval workflow (`SM-08`) and aging buckets.
- [ ] **FIN-02**: Product-specific revenue, direct expense, and sustainability margin tracking for iGV, iGTa, and iGTe.
- [ ] **FIN-03**: Executive and Department KPI Dashboards with 100% reconciliation drill-down to underlying filtered records.
- [ ] **FIN-04**: Controlled data exports (CSV/Excel) respecting role permissions and active table filters with export audit logging.

### 7. Integrations & Action Outbox (SYNC)
- [ ] **SYNC-01**: EXPA / GIS read-only synchronization engine with cursor checkpoints and idempotency keys.
- [ ] **SYNC-02**: Human-in-the-Loop Action Outbox (`SM-09`) generating deep-links to EXPA with expiry timers and verification callbacks.
- [ ] **SYNC-03**: Sync error monitoring, dead-letter queue, and manual reconciliation workbench.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Public Blog / Articles Portal | Explicitly prohibited by Specification §0. System is an operational tracker. |
| Automated EXPA API Direct Writes | Prohibited by `DEC-003` to prevent untracked status mutation and API breakages. |
| Google Sheets Production Store | Prohibited by `DEC-001` due to absence of ACID guarantees and security RLS. |
| Unverified Automated Penalties | Prohibited by §0.7; financial or status penalties require human confirmation. |

## Traceability

| Requirement | Phase | Target Skill(s) | Status |
|-------------|-------|-----------------|--------|
| DATA-01 | Phase 1 | `supabase-postgres-best-practices`, `supabase` | Pending |
| DATA-02 | Phase 1 | `supabase-postgres-best-practices`, `supabase` | Pending |
| DATA-03 | Phase 1 | `supabase-postgres-best-practices` | Pending |
| DATA-04 | Phase 1 | `supabase-postgres-best-practices` | Pending |
| DATA-05 | Phase 1 | `supabase-postgres-best-practices`, `supabase` | Pending |
| UI-01 | Phase 2 | `vercel-composition-patterns`, `ui-styling` | Pending |
| UI-02 | Phase 2 | `vercel-composition-patterns`, `impeccable` | Pending |
| UI-03 | Phase 2 | `vercel-react-best-practices` | Pending |
| UI-04 | Phase 2 | `frontend-design`, `ui-styling` | Pending |
| UI-05 | Phase 2 | `mobile-native`, `impeccable` | Pending |
| CRM-01 | Phase 3 | `vercel-composition-patterns`, `impeccable` | Pending |
| CRM-02 | Phase 3 | `vercel-composition-patterns`, `ui-ux-pro-max` | Pending |
| CRM-03 | Phase 3 | `vercel-composition-patterns`, `ask-sonner` | Pending |
| CRM-04 | Phase 3 | `vercel-composition-patterns`, `impeccable` | Pending |
| EP-01 | Phase 4 | `vercel-composition-patterns`, `ui-styling` | Pending |
| EP-02 | Phase 4 | `vercel-composition-patterns`, `ui-ux-pro-max` | Pending |
| EP-03 | Phase 4 | `vercel-composition-patterns`, `impeccable` | Pending |
| EP-04 | Phase 4 | `vercel-react-best-practices` | Pending |
| OPS-01 | Phase 5 | `impeccable`, `pdf` | Pending |
| OPS-02 | Phase 5 | `mobile-native`, `ui-styling` | Pending |
| OPS-03 | Phase 5 | `supabase-postgres-best-practices`, `impeccable` | Pending |
| OPS-04 | Phase 5 | `supabase-postgres-best-practices`, `pdf` | Pending |
| FIN-01 | Phase 6 | `supabase-postgres-best-practices`, `ask-sonner` | Pending |
| FIN-02 | Phase 6 | `ui-ux-pro-max`, `xlsx` | Pending |
| FIN-03 | Phase 6 | `ui-ux-pro-max`, `vercel-react-best-practices` | Pending |
| FIN-04 | Phase 6 | `xlsx`, `supabase-postgres-best-practices` | Pending |
| SYNC-01 | Phase 7 | `supabase` | Pending |
| SYNC-02 | Phase 7 | `vercel-composition-patterns`, `ask-sonner` | Pending |
| SYNC-03 | Phase 7 | `vercel-composition-patterns`, `impeccable` | Pending |

**Coverage:**
- v1 requirements: 26 total
- Mapped to phases: 26
- Unmapped: 0 ✓

---
*Requirements defined: 2026-10-27*  
*Last updated: 2026-10-27 after baseline creation*
