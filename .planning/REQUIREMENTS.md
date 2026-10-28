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

## v2.0 Requirements: Vercel Audit & Core Architectural Overhaul

Based on authoritative audit specification: `aiesec_icx_erp_vercel_audit_and_complete_changes_blueprint.md`.

### Phase 11: Global Layout, Sidebar Navigation & Zero-CTA Command Dashboard
- [ ] **CHG-01**: Consolidate navigation into 4-group Left Sidebar (Command, External Engine BD, Internal Engine Ops/CXP, Finance & People FnL/TM).
- [ ] **CHG-02**: Remove permanent 8-button launchpad banner from `<main>`; add contextual actions and compact `+ Quick Add (⌘K)`.
- [ ] **CHG-03**: Context-aware Quick Add dropdown menu for 8 stakeholder intake drawers.
- [ ] **CHG-04**: Sticky Global Context Filter Bar (Term, Peak, Product, Rabat Engine, Owner) reactive across all views.
- [ ] **CHG-05**: Relocate Export JSON/CSV, Import, and Reset to dedicated `⚙️ Data & Settings` modal at bottom of sidebar.
- [ ] **CHG-06**: Eliminate all redundant `switchTab(...)` and `"Manage All EPs →"` navigation buttons from Dashboard.
- [ ] **CHG-07**: 9 Clickable Domain KPI Cards (3×3 Grid) displaying Primary MoS and 3 headline KPIs.
- [ ] **CHG-08**: In-Place Expanded KPI Scorecard, Domain Graphs, and Inline Exception Drawer upon clicking cards.
- [ ] **CHG-09**: Remove fake `+ 3` math; calculate real cumulative funnel volumes, stage-to-stage CR% bridges, and approval velocity.
- [ ] **CHG-10**: 18-cell Exchange Standards compliance heatmap matrix with RAG color coding.
- [ ] **CHG-11**: Dynamic subtitles on all KPI cards driven by live calculated data.
- [ ] **CHG-12**: Unified Cross-ERP SLA Exception Center with filter pills.

### Phase 12: Dedicated Member Engagement, Attendance Tiers & Team Standards (`TeSt`)
- [ ] **CHG-40**: Dedicated `/members` module with Rabat roster, Composite MES formula (0-100%), and 4-tier classification (Tier 1 Core to Tier 4 Drop-Off).
- [ ] **CHG-41**: Rabat 6 Governance Routines weekly attendance grid (GitHub-style heatmap) and Monthly O2O coaching logger drawer.
- [ ] **CHG-42**: Interactive AIESEC Team Standards (`TeSt`) Scorecard per Team Leader across Building, Performing, Closing stages.

### Phase 13: B2B Partner CRM, Multi-Contacts, 8-Stage Stepper & Kanban View
- [ ] **CHG-13**: Normalize partner entity: `db.organizations` (Master Partner Profile, Moroccan Legal/Tax IDs) and `db.b2bDeals` (1 Org : N Deals).
- [ ] **CHG-14**: Full Edit/Update drawer for Partners, Deals, and Contacts with archive actions.
- [ ] **CHG-15**: 8-Stage Deal Stepper with `CLOSED_LOST` / `DISQUALIFIED` and mandatory `lossReason`.
- [ ] **CHG-16**: Enforce BANT/Discovery gate before `PROPOSAL_SENT` and Contract gate before `CONTRACT_SIGNED`.
- [ ] **CHG-17**: Top view switcher: Kanban Board, Master CRM Table, Detailed Cards.
- [ ] **CHG-18**: Render OP Candidate Rejection Counter badge (`X / 3 Max`) per AEPP 4.2.2.1.7.
- [ ] **CHG-19**: Pre-select partner when clicking `+ Add Contact` or `+ Spawn Opportunity`.

### Phase 14: Contracts (`MoUs`), Dynamic Product Opportunities & Multi-Slot Waves
- [ ] **CHG-20**: Normalize into `db.contracts` (1) → `db.opportunities` (N) → `db.opportunitySlots` (N) with `+ Add Slot Wave`.
- [ ] **CHG-21**: Dynamic product rules: 16 official GV projects for iGV (lock salary = 0, weeks 6-8); 6 iGTa fields (lock fee = 0, full-time supervisor); iGTe teaching subjects (fee = 0, weeks >= 9, salary >= 3000).
- [ ] **CHG-22**: `PARTLY_REMOTE` validation (`remoteWeeks`, ICB Audit URL) and 1-year advance slot validation.
- [ ] **CHG-23**: Dynamically compute applicant and approval counts from linked EPs.
- [ ] **CHG-24**: Edit Opportunity drawer locking salary, hours, accommodation, and fee once approved EPs exist.

### Phase 15: EP Lifecycle, Relational Foreign Keys, Live Date-Math SLAs & 18 Standards Split
- [ ] **CHG-25**: Split 6 concatenated strings into atomic typed fields (`dob`, `email`, `whatsappPhone`, `passportNumber`, `passportExpiryDate`, `arrivalPort`, `flightNumber`, `accommProviderId`, `bedId`, etc.).
- [ ] **CHG-26**: Searchable nationality + residence country + Morocco visa regime (`VISA_FREE_90D`, `AEVM_EVISA`, `CONSULAR_EMBASSY_VISA`).
- [ ] **CHG-27**: Live date-math SLA timers (14d post-APD visa pack SLA, 7d/14d visa application, 14d pre-arrival lock, 3d pickup guide, 48h unreachable safety heartbeat).
- [ ] **CHG-28**: Exception modal supporting `REJECTED`, `WITHDRAWN`, `APPROVAL_BROKEN`, `REALIZATION_BROKEN`, `REMOTE_BROKEN`, `FINISHED_EARLIER` with Annex 2 timer.
- [ ] **CHG-29**: `REALIZED` validation gate (±20d iGV rule and Standards #4-#9 verified).
- [ ] **CHG-30**: 18 Standards drawer split into #10a (Week 1 Middle) and #10b (Final Week), internal delivery vs EXPA survey discrepancy, and #17 regular touchpoints log.
- [ ] **CHG-31**: Matchmaker Score badge (Visa lead time 30% + Language 25% + SDG 25% + Dates 20%).

### Phase 16: IR Supply Quotas, Housing Bed Allocations, Airport Logistics, ECB Cases (`Annex 2`) & AFPM Invoicing
- [ ] **CHG-32**: Replace string quotas with numeric `targetApp/Acc/Apd/Re/Co` and live computed actuals, CR%, and SE standards fulfillment.
- [ ] **CHG-33**: IR card action buttons: Edit IR Partner & Quotas, Log Bi-Weekly Sync Call, Generate Rabat IR Opportunity Pack.
- [ ] **CHG-34**: Dedicated `db.accommodations` schema with beds array and vetting checkboxes; dedicated `db.pickups` schema with port, flight, buddy, 3d guide sent, SIM, MAD exchanged.
- [ ] **CHG-35**: Housing & Pickup card action buttons: Inspect/Edit, Assign Bed, Log Check-In/Out & Deposit, Mark Pickup Completed.
- [ ] **CHG-36**: Separate CSR Sponsors from Quality Cases. Quality Case cards with live Stage 1 (24h/48h/72h), Stage 2 (48h/96h), Stage 3 (48h/5d) countdowns, 14d/7d replacement timer, confidentiality mask on Annex 1 harassment.
- [ ] **CHG-37**: Save Annex 2 calculation as Case Claim & AFPM Liability Reserve.
- [ ] **CHG-38**: Completely separate Finance (`db.finance`) from Team Members (`db.teamMembers`).
- [ ] **CHG-39**: Invoices & Accounts Receivable Table (`db.invoices`) with >14d overdue tracking and iGV partner/CSR coverage gauge.

---
*Requirements defined: 2026-10-27*  
*Milestone 2 added: 2026-10-29 via aiesec_icx_erp_vercel_audit_and_complete_changes_blueprint.md*
