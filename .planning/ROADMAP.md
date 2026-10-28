# Roadmap: AIESEC iCX ERP (Tracker-First Baseline)

## Overview

A phased journey from clean database foundations to a fully operational, multi-module Incoming Exchange ERP tailored for AIESEC in Rabat. Every phase directly advances the tracker-first contract defined in `AIESEC_iCX_ERP_Tracker_First_Master_Specification.md`, ensuring 100% data continuity, strict role-based access, and zero reliance on blogs or untracked spreadsheets.

## Execution Matrix & Specialized Skills

| Phase | Title | Primary Objective | Specialized Skills Used |
|---|---|---|---|
| **Phase 0** | Workspace Wipe & Baseline Architecture | Clean slate, establish project structure & design tokens | `gsd-core`, `design-system` |
| **Phase 1** | PostgreSQL Schema & Security Foundations | 54 tables, multi-tenant RLS, tamper-evident audit logs | `supabase-postgres-best-practices`, `supabase` |
| **Phase 2** | Table-First Workspace & Record Detail Engine | Universal data tables, fast filters, 8-panel detail views | `vercel-composition-patterns`, `vercel-react-best-practices`, `frontend-design`, `ui-styling` |
| **Phase 3** | B2B Partner CRM, Deals & Workload Tracking | 9-stage deal pipeline, contact CRM, explicit handoff protocol | `vercel-composition-patterns`, `impeccable`, `ask-sonner`, `xlsx` |
| **Phase 4** | Opportunities, Slots & EP Dossier Matching | Opportunity/slot capacity, IRM pipeline, EP lifecycle tracker | `vercel-composition-patterns`, `vercel-react-best-practices`, `ui-ux-pro-max` |
| **Phase 5** | Exchange Delivery (18 Standards) & Case Vault | Airport logistics, bed exclusion validation, case escalation | `supabase-postgres-best-practices`, `pdf`, `mobile-native`, `impeccable` |
| **Phase 6** | Finance Controls & Live KPI Dashboards | Dual-approval ledger, receivables/aging, 100% drill-down charts | `supabase-postgres-best-practices`, `ui-ux-pro-max`, `xlsx` |
| **Phase 7** | EXPA/GIS Read Sync & Action Outbox | Idempotent sync engine, checkpointing, human-in-the-loop outbox | `supabase`, `vercel-composition-patterns`, `ask-sonner` |
| **Phase 8** | End-to-End Verification & Pilot Readiness | 117 automated acceptance tests, backup/restore drills | `webapp-testing`, `animation-performance` |
| **Phase 9** | Multi-LC Tenancy & National Release | Tenant isolation verification, MC Moroccan governance | `supabase-postgres-best-practices`, `webapp-testing` |
| **Phase 10** | Module 1 Interactive Command Dashboard & Graph Analytics | 9 Clickable Domain Cards, in-place analytics, 7 graph archetypes, Member Engagement & TeSt | `frontend-design`, `ui-ux-pro-max`, `ui-styling`, `vercel-composition-patterns` |

---

## Phase Details

### Phase 0: Workspace Wipe & Baseline Architecture
**Goal**: Clean outdated legacy code, establish clean Next.js 14 App Router layout, design tokens, and TypeScript interfaces derived from the Master Specification.
**Depends on**: Nothing (initial bootstrap phase)
**Requirements**: Foundational setup
**Target Skills**: `frontend-design`, `ui-styling`
**Success Criteria**:
  1. Old divergent code is cleanly removed while preserving specification and configuration assets.
  2. Next.js 14 layout boots cleanly with AIESEC Brand design tokens (AIESEC Blue, iGV Coral, iGTa Teal, iGTe Orange, Kasbah White).
  3. Shared navigation shell (Top navigation + collapsible operational sidebar) renders smoothly.
**Plans**: 2 plans
- [x] 00-01: Clean legacy code, install/verify clean Tailwind design tokens and base typography. (Completed 2026-10-27)
- [x] 00-02: Build high-performance App Router shell with top navigation, breadcrumbs, and role switcher. (Completed 2026-10-27)

### Phase 1: PostgreSQL Persistence Foundation & Security
**Goal**: Implement complete database persistence layer covering 54 normalized tables, Row-Level Security, and append-only audit chains.
**Depends on**: Phase 0
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, DATA-05
**Target Skills**: `supabase-postgres-best-practices`, `supabase`
**Success Criteria**:
  1. Complete PostgreSQL schema generated with UUID primary keys, foreign key constraints, and Casablanca timezone handling.
  2. Supabase RLS policies guarantee strict `lc_id` multi-tenant isolation.
  3. Audit trigger enforces append-only immutability with SHA-256 hash chaining on all operational transitions.
  4. PostgreSQL `btree_gist` exclusion constraint prevents double-booking of accommodation beds.
**Plans**: 3 plans
- [x] 01-01: Generate Supabase database migrations for Core Governance (1-15) and CRM/PRM (16-23) tables. (Completed 2026-10-27)
- [x] 01-02: Generate migrations for IR, EP, Logistics, Finance, and Task tables (24-54) with exclusion constraints. (Completed 2026-10-27)
- [x] 01-03: Implement RLS policies, audit triggers, and cryptographic hashing verification functions. (Completed 2026-10-27)

### Phase 2: Table-First Workspace & Record Detail Engine
**Goal**: Build the operational core interface: high-density, searchable, sortable tables and standardized 8-panel record detail views.
**Depends on**: Phase 1
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05
**Target Skills**: `vercel-composition-patterns`, `vercel-react-best-practices`, `impeccable`, `ui-styling`
**Success Criteria**:
  1. Reusable DataTable component supports multi-column filtering, quick search, sort, and column visibility chooser.
  2. Standardized RecordDetailLayout renders all 8 canonical panels (Identity, State, Details, Relationships, Timeline, Next Actions, Evidence, Audit).
  3. Preserved query parameters allow seamless return from record detail back to filtered table state.
**Plans**: 3 plans
- [x] 02-01: Build generic high-performance Table component with virtualized rows and sticky headers. (Completed 2026-10-28)
- [x] 02-02: Implement compound RecordDetail layout with timeline feed and audit inspect drawer. (Completed 2026-10-28)
- [x] 02-03: Build Global Search overlay and saved views local storage manager. (Completed 2026-10-28)

### Phase 3: B2B Partner CRM, Deals & Workload Tracking
**Goal**: Deliver operational B2B CRM for organizations, contacts, deal pipeline (`SM-01`), and the atomic stakeholder handoff engine.
**Depends on**: Phase 2
**Requirements**: CRM-01, CRM-02, CRM-03, CRM-04
**Target Skills**: `vercel-composition-patterns`, `impeccable`, `ask-sonner`, `xlsx`
**Success Criteria**:
  1. Account managers can create, update, and inspect Organizations and associated Contacts with touchpoint logging.
  2. 9-stage Deal Pipeline board and table enforce stage progression rules and closed-lost reason capture.
  3. Stakeholder Handoff flow executes atomically with transfer packet generation and acceptance/rejection flow.
  4. Workload tracker displays tasks by department and owner with overdue SLA visual alarms.
**Plans**: 3 plans
- [x] 03-01: Build Organizations and Contacts directory tables with detail timeline and touchpoint modal. (Completed 2026-10-28)
- [x] 03-02: Implement B2B Deal Pipeline board/table with stage validation and contract linking. (Completed 2026-10-28)
- [x] 03-03: Implement Stakeholder Handoff modal, notification dispatch, and Workload Task manager. (Completed 2026-10-28)

### Phase 4: Opportunities, Slots & EP Dossier Matching
**Goal**: Operationalize supply and demand tracking: Opportunity inventory, bed-aware slot scheduling, IR relationships, and EP dossiers.
**Depends on**: Phase 3
**Requirements**: EP-01, EP-02, EP-03, EP-04
**Target Skills**: `vercel-composition-patterns`, `vercel-react-best-practices`, `ui-ux-pro-max`
**Success Criteria**:
  1. Opportunities and Slots inventory displays real-time capacity and prevents over-allocation.
  2. IRM partner tracker monitors partner LC communication, response time, and allocated supply.
  3. EP Tracker table and EP Dossier track application milestones from `APPLIED` to `FINISHED`.
  4. Matching engine filters applicants against open opportunity slot criteria.
**Plans**: 3 plans
- [x] 04-01: Build Opportunity and Slot capacity boards with real-time slot status counters. (Completed 2026-10-28)
- [x] 04-02: Implement IR Partner Directory and IR communication tracking interface. (Completed 2026-10-28)
- [x] 04-03: Implement EP Master Tracker table and interactive EP Dossier detail screen. (Completed 2026-10-28)

### Phase 5: Exchange Delivery Operations & Case Solving
**Goal**: Deliver customer experience tracking: 18 Exchange Standards evidence matrix, logistics/pickup board, bed booking, and Case Solving Vault.
**Depends on**: Phase 4
**Requirements**: OPS-01, OPS-02, OPS-03, OPS-04
**Target Skills**: `supabase-postgres-best-practices`, `pdf`, `mobile-native`, `impeccable`
**Success Criteria**:
  1. 18 Exchange Standards matrix tracks compliance per EP with timestamped evidence links.
  2. Arrival Logistics board tracks flight arrivals, driver/pickup assignments, and Day-1 host accompaniment.
  3. Accommodation allocation view visually manages beds while preventing overlapping reservations.
  4. Restricted Case Solving Vault locks confidential case evidence with 3-tier escalation countdowns.
**Plans**: 3 plans
- [x] 05-01: Build 18 Exchange Standards evidence checklist with upload/link verification modal. (Completed 2026-10-28)
- [x] 05-02: Implement Arrival & Pickup logistics board with mobile-friendly check-in view. (Completed 2026-10-28)
- [x] 05-03: Build Accommodation Bed Allocation calendar and confidential Case Solving Vault. (Completed 2026-10-28)

### Phase 6: Finance Controls & Reconciled KPI Dashboards
**Goal**: Implement dual-approval financial transaction tracking, invoice aging, and live KPI dashboards with 100% drill-down reconciliation.
**Depends on**: Phase 5
**Requirements**: FIN-01, FIN-02, FIN-03, FIN-04
**Target Skills**: `supabase-postgres-best-practices`, `ui-ux-pro-max`, `xlsx`
**Success Criteria**:
  1. Financial ledger records invoices, EP deposits, partner realization fees, and expense reimbursements.
  2. Dual-approval state machine (`SM-08`) prevents single-member payout release.
  3. Executive & Department dashboards render 16 live KPIs; clicking any chart segment drills down to source records.
  4. Permission-controlled CSV/Excel exports function accurately and record audit events.
**Plans**: 3 plans
- [x] 06-01: Build Invoices and Payments ledger with dual-approval workflow and aging buckets. (Completed 2026-10-28)
- [x] 06-02: Implement Executive Dashboard with live funnel, supply, delivery, and workload charts. (Completed 2026-10-28)
- [x] 06-03: Implement Department Scorecards, drill-down filtering, and permissioned data export engine. (Completed 2026-10-28)

### Phase 7: Integrations & Action Outbox
**Goal**: Deliver EXPA/GIS read synchronization engine and the human-in-the-loop Action Outbox.
**Depends on**: Phase 6
**Requirements**: SYNC-01, SYNC-02, SYNC-03
**Target Skills**: `supabase`, `vercel-composition-patterns`, `ask-sonner`
**Success Criteria**:
  1. Background sync pulls EXPA applications and statuses with checkpoint cursors and idempotency keys.
  2. Action Outbox cards display pending outbound actions with deep-links to EXPA and expiry countdowns.
  3. Sync monitoring workbench visualizes sync health, errors, and manual reconciliation actions.
**Plans**: 2 plans
- [x] 07-01: Build EXPA sync cursor engine and reconciliation difference detector. (Completed 2026-10-28)
- [x] 07-02: Implement Human-in-the-Loop Action Outbox interface and sync status banner. (Completed 2026-10-28)

### Phase 8: End-to-End Verification & Pilot Readiness
**Goal**: Execute comprehensive automated test suite (117 acceptance tests) and validate pilot exit criteria for AIESEC in Rabat.
**Depends on**: Phase 7
**Requirements**: Verification of all DATA, UI, CRM, EP, OPS, FIN, SYNC requirements
**Target Skills**: `webapp-testing`, `animation-performance`
**Success Criteria**:
  1. Automated test suite runs with 100% passing results across unit, integration, and E2E flows.
  2. Backup and restore drill executed and verified with zero data corruption.
  3. Pilot sign-off checklist completed for AIESEC in Rabat.
**Plans**: 2 plans
- [x] 08-01: Implement Playwright and Vitest test suites for all 10 state machines and RLS policies. (Completed 2026-10-28)
- [x] 08-02: Run full reconciliation, performance audit, and create operational pilot handoff documentation. (Completed 2026-10-28)

### Phase 9: Multi-LC Tenancy & National Release
**Goal**: Verify multi-tenant isolation, national MC Morocco consolidation reporting, and production release hardening.
**Depends on**: Phase 8
**Requirements**: Multi-entity scalability
**Target Skills**: `supabase-postgres-best-practices`, `webapp-testing`
**Success Criteria**:
  1. Strict cross-LC data isolation verified under high concurrency.
  2. Consolidated national scorecard view operational for MC Morocco leadership.
**Plans**: 1 plan
- [x] 09-01: Verify multi-LC tenant isolation, MC consolidated views, and production security hardening. (Completed 2026-10-28)

### Phase 10: Module 1 Interactive Command Dashboard & Graph Analytics
**Goal**: Build the operational command dashboard defined in `Aiesec Icx Erp Dashboard Kpis And Graph Architecture.md`: zero redundant navigation CTAs, 100% in-place interactive 9-card domain architecture, 7 specialized graph archetypes, and Member Engagement & Team Standards analytics.
**Depends on**: Phase 0..9 (full data & operational foundation)
**Requirements**: Module 1 Specification (Sections 1..6)
**Target Skills**: `frontend-design`, `ui-ux-pro-max`, `ui-styling`, `vercel-composition-patterns`, `impeccable`, `animate`
**Success Criteria**:
  1. Top sticky Filter Bar allows simultaneous filtering across Term (`26.1`, `26.2`), Product (`All`, `iGV`, `iGTa`, `iGTe`), Engine (`External`, `Internal`), and Roles.
  2. 9 Clickable Domain Summary Cards render in a 3x3 grid with primary MoS, 3 headline KPIs, WoW deltas, and card micro-visuals with zero navigation buttons.
  3. Clicking any card activates an In-Place Expanded Analytics Workspace featuring 3 tabs: Full KPI Scorecard Table, Visual Domain Analytics, and Actionable Exceptions Drawer.
  4. Card 9 (Member Engagement) computes Composite Member Engagement Score (`MES`), 4 Engagement Tiers, Rabat 6 Governance Routines, O2O logs, and Team Standards (Building, Performing, Closing).
  5. The 7 visual efficiency graph types (Stepped Funnel, Bullet Chart, Heatmap Matrix, 2x2 Quadrant, 100% Stacked Bar, S-Curve Pace Line, Waterfall Chart) render with high fidelity, direct data labels, and semantic color encoding.
**Plans**: 4 plans
- [x] 10-01: Build Dashboard Domain Data Engine & KPI Calculation Core (`src/lib/dashboard/`). (Completed 2026-10-28)
- [x] 10-02: Implement Interactive Visual Component & Domain Graphs Engine (`src/components/dashboard/graphs/`). (Completed 2026-10-28)
- [x] 10-03: Deliver Level 1 Global Filters & Level 2 Clickable 3x3 Cards Grid (`src/components/dashboard/`). (Completed 2026-10-28)
- [x] 10-04: Deliver Level 3 In-Place Expanded Analytics Workspace & Root Route Assembly (`src/app/page.tsx`) with verification. (Completed 2026-10-28)

---

## Progress

**Execution Order:**
Phases execute in numeric order: 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

| Phase | Milestone | Plans Complete | Status | Completed |
|---|---|---|---|---|
| Phase 0: Workspace Wipe & Baseline Architecture | MVP Foundation | 2/2 | Complete | 2026-10-27 |
| Phase 1: PostgreSQL Persistence Foundation & Security | MVP Foundation | 3/3 | Complete | 2026-10-27 |
| Phase 2: Table-First Workspace & Record Detail Engine | MVP Core | 3/3 | Complete | 2026-10-28 |
| Phase 3: B2B Partner CRM, Deals & Workload Tracking | MVP Core | 3/3 | Complete | 2026-10-28 |
| Phase 4: Opportunities, Slots & EP Dossier Matching | MVP Operations | 3/3 | Complete | 2026-10-28 |
| Phase 5: Exchange Delivery (18 Standards) & Case Vault | MVP Operations | 3/3 | Complete | 2026-10-28 |
| Phase 6: Finance Controls & Reconciled KPI Dashboards | MVP Analytics | 3/3 | Complete | 2026-10-28 |
| Phase 7: Integrations & Action Outbox | MVP Sync | 2/2 | Complete | 2026-10-28 |
| Phase 8: End-to-End Verification & Pilot Readiness | Rabat Pilot | 2/2 | Complete | 2026-10-28 |
| Phase 9: Multi-LC Tenancy & National Release | Scale | 1/1 | Complete | 2026-10-28 |
| Phase 10: Module 1 Interactive Command Dashboard & Graph Analytics | Command Center | 4/4 | Complete | 2026-10-28 |

---

## Milestone 2: Vercel Audit & Core Architectural Overhaul (v2.0)

Governed by `aiesec_icx_erp_vercel_audit_and_complete_changes_blueprint.md`.

### Execution Matrix (Milestone 2)

| Phase | Title | Primary Objective | Specialized Skills Used |
|---|---|---|---|
| **Phase 11** | Global Layout, Sidebar Navigation & Zero-CTA Dashboard | 4-group Left Sidebar, clean top header, sticky context filter bar, 9-card zero-CTA dashboard | `frontend-design`, `ui-styling`, `impeccable`, `vercel-composition-patterns` |
| **Phase 12** | Dedicated Member Engagement & Team Standards (`TeSt`) | `/members` module, composite MES (0-100%), 4 tiers, Rabat 6 routines heatmap, O2O logger, TeSt checklist | `ui-ux-pro-max`, `frontend-design`, `impeccable`, `vercel-composition-patterns` |
| **Phase 13** | B2B Partner CRM, Multi-Contacts & Kanban Pipeline | Split org & deals, full edit drawer, 8-stage stepper with closed-lost reasons, BANT & contract gates, Kanban/table switcher | `vercel-composition-patterns`, `impeccable`, `ask-sonner`, `ui-styling` |
| **Phase 14** | Contracts, Product Opportunities & Multi-Slot Waves | 1 Contract : N Opps : N Slots, official 16 GV projects, iGTa/e rules, partly-remote ICB audit check, dynamic count aggregation | `vercel-composition-patterns`, `supabase-postgres-best-practices`, `ui-ux-pro-max` |
| **Phase 15** | EP Lifecycle, Relational Fields, Live SLAs & 18 Standards | Atomic typed fields & foreign keys, live date-math SLA countdowns, exception modal, ±20d rule, Standards #10a/#10b split | `supabase-postgres-best-practices`, `impeccable`, `mobile-native`, `pdf` |
| **Phase 16** | IR Quotas, Vetted Housing, Pickups, ECB Cases & Invoicing | Numeric IR quotas, dedicated housing & pickups schemas, case SLA clocks, Annex 2 calculator save, invoice aging >14d | `supabase-postgres-best-practices`, `xlsx`, `ui-ux-pro-max`, `ask-sonner` |

---

### Phase 11: Global Layout, Sidebar Navigation & Zero-CTA Command Dashboard
**Goal**: Consolidate navigation into a 4-group Left Sidebar, eliminate top launchpad clutter, add sticky global context filter bar, move settings to sidebar bottom, and ensure Dashboard contains zero redundant CTAs with real cumulative funnel math and dynamic subtitles.
**Depends on**: Phase 10
**Requirements**: CHG-01, CHG-02, CHG-03, CHG-04, CHG-05, CHG-06, CHG-07, CHG-08, CHG-09, CHG-10, CHG-11, CHG-12
**Target Skills**: `frontend-design`, `ui-styling`, `impeccable`, `vercel-composition-patterns`
**Success Criteria**:
  1. Left Sidebar groups all 12 modules into Command, External Engine (BD), Internal Engine (Ops/CXP), and Finance & People (FnL/TM).
  2. No horizontal `<nav>` bar in header; permanent 8-button launchpad banner deleted; top header contains contextual actions and `+ Quick Add (⌘K)` menu.
  3. Sticky Global Filter Bar (`Term`, `Peak`, `Product`, `Engine`, `Owner`) synchronizes reactively with workspace context.
  4. `⚙️ Data & Settings` modal at bottom of sidebar handles Export JSON, Export CSV/MD, Import, and Reset Seed.
  5. Dashboard contains 0 redundant `switchTab(...)` or `"Manage All EPs →"` buttons; cards expand in place into Scorecard Table, Domain Graphs, and Inline Exceptions.
  6. Cumulative funnel calculates real volumes without `+ 3` math, showing stage-to-stage CR% bridges and approval velocity.
**Plans**: 3 plans
- [x] 11-01: Global 4-group Left Sidebar and Top Header clean action dropdown overhaul. (Completed 2026-10-29)
- [x] 11-02: Sticky Global Context Filter Bar & Data Settings modal integration. (Completed 2026-10-29)
- [x] 11-03: Zero-CTA 9-card interactive Dashboard verification and real cumulative funnel math. (Completed 2026-10-29)

### Phase 12: Dedicated Member Engagement, Attendance Tiers & Team Standards (`TeSt`)
**Goal**: Build dedicated `/members` module with Rabat roster, Composite MES formula (0-100%), 4-tier classification, Rabat 6 governance routines heatmap, monthly O2O coaching logger, and Team Standards (TeSt) scorecard.
**Depends on**: Phase 11
**Requirements**: CHG-40, CHG-41, CHG-42
**Target Skills**: `ui-ux-pro-max`, `frontend-design`, `impeccable`, `vercel-composition-patterns`
**Success Criteria**:
  1. `/members` route displays Rabat roster with Composite MES score and 4-tier badges (`🟢 Tier 1 Core`, `🔵 Tier 2 Strong`, `🟡 Tier 3 Moderate`, `🔴 Tier 4 Drop-Off Risk`).
  2. Rabat 6 governance routines weekly attendance grid displays GitHub-style meeting attendance heatmap.
  3. Monthly O2O coaching logger drawer captures wellbeing scores, KPI reviews, blockers, and action items.
  4. Team Standards (TeSt) scorecard allows Team Leaders to assess Building, Performing, and Closing deliverables.
**Plans**: 2 plans
- [ ] 12-01: Member roster, MES 0-100% calculation engine, and 4-tier classification UI.
- [ ] 12-02: Rabat 6 governance routines attendance heatmap, O2O coaching logger, and TeSt scorecard.

### Phase 13: B2B Partner CRM, Multi-Contacts, 8-Stage Stepper & Kanban View
**Goal**: Normalize partner data into Organizations and Deals, build full slide-over edit drawer, 8-stage deal stepper with closed-lost reasons, BANT discovery gate, contract gate, and Kanban/Table view toggle.
**Depends on**: Phase 11
**Requirements**: CHG-13, CHG-14, CHG-15, CHG-16, CHG-17, CHG-18, CHG-19
**Target Skills**: `vercel-composition-patterns`, `impeccable`, `ask-sonner`, `ui-styling`
**Success Criteria**:
  1. `db.organizations` (master profile, Moroccan tax IDs, rejection counter) cleanly links to `db.b2bDeals` (1 Org : N Deals).
  2. Slide-over drawer allows full editing of all partner, contact, and deal fields.
  3. 8-stage stepper enables selecting stages with mandatory `lossReason` when marking `CLOSED_LOST` or `DISQUALIFIED`.
  4. BANT discovery fields must be complete before `PROPOSAL_SENT`; contract must exist before `CONTRACT_SIGNED`.
  5. Top switcher toggles Kanban Board, Master CRM Table, and Detailed Cards.
**Plans**: 3 plans
- [ ] 13-01: Organization & Deal relational split and slide-over edit drawer.
- [ ] 13-02: 8-stage deal stepper, BANT discovery gate, and contract attachment gate.
- [ ] 13-03: Kanban board and master CRM table view switcher with OP rejection badges.

### Phase 14: Contracts (`MoUs`), Dynamic Product Opportunities & Multi-Slot Waves
**Goal**: Normalize contracts, opportunities, and multi-slot waves (`1:N:N`), implement official 16 GV projects and iGTa/e product rules, enforce partly-remote ICB audit check, and compute live capacity metrics.
**Depends on**: Phase 13
**Requirements**: CHG-20, CHG-21, CHG-22, CHG-23, CHG-24
**Target Skills**: `vercel-composition-patterns`, `supabase-postgres-best-practices`, `ui-ux-pro-max`
**Success Criteria**:
  1. Opportunities support multiple slot waves with `+ Add Slot Wave`.
  2. `iGV` populates 16 official Global Volunteer projects with salary locked at 0; `iGTa` provides 6 functional fields with fee locked at 0; `iGTe` validates teaching criteria.
  3. `PARTLY_REMOTE` modality requires remote weeks validation and ICB audit URL.
  4. Opportunity capacity counts (applied, accepted, approved, realized) aggregate dynamically from linked EPs.
  5. Edit drawer locks core benefits and fee once an EP is approved.
**Plans**: 2 plans
- [ ] 14-01: Contract to Opportunity to Multi-Slot relational normalization and wave manager.
- [ ] 14-02: Dynamic product rules (`iGV/iGTa/iGTe`), partly-remote audit gate, and post-approval benefit locking.

### Phase 15: EP Lifecycle, Relational Foreign Keys, Live Date-Math SLAs & 18 Standards Split
**Goal**: Split concatenated EP strings into typed atomic fields, add searchable country & visa regime, implement live date-math SLA countdowns, build exception/break modal, ±20d rule, and split Standards #10a/#10b.
**Depends on**: Phase 14
**Requirements**: CHG-25, CHG-26, CHG-27, CHG-28, CHG-29, CHG-30, CHG-31
**Target Skills**: `supabase-postgres-best-practices`, `impeccable`, `mobile-native`, `pdf`
**Success Criteria**:
  1. Atomic typed fields replace all 6 concatenated strings; relational foreign keys connect to accommodations, buddies, and managers.
  2. Searchable country selector computes Morocco visa regime (`VISA_FREE_90D`, `AEVM_EVISA`, `CONSULAR_EMBASSY_VISA`).
  3. Live date-math SLA countdowns track 14d visa pack, 14d pre-arrival lock, 3d pickup guide, and 48h safety heartbeat.
  4. Exception modal handles `REJECTED` (with AEPP feedback and unjustified rejection counter), `WITHDRAWN`, `APPROVAL_BROKEN`, `REALIZATION_BROKEN`.
  5. Transition to `REALIZED` validates ±20d slot start rule for iGV and Standards #4-#9 delivery.
  6. Standards modal splits #10a (Week 1 Middle) and #10b (Closing Final), tracking internal delivery vs EXPA survey.
**Plans**: 3 plans
- [ ] 15-01: Atomic typed EP fields, relational foreign keys, and searchable visa regime engine.
- [ ] 15-02: Live date-math SLA countdowns and AEPP exception/break/rejection modal.
- [ ] 15-03: Realization validation gates, Standards #10a/#10b split, touchpoints log, and Matchmaker Score.

### Phase 16: IR Supply Quotas, Housing Bed Allocations, Airport Logistics, ECB Cases (`Annex 2`) & AFPM Invoicing
**Goal**: Replace string quotas with numeric targets and live metrics, split housing beds from airport pickups, separate CSR sponsors from quality cases with SLA clocks, link Annex 2 claims to AFPM, and track invoice aging >14d.
**Depends on**: Phase 15
**Requirements**: CHG-32, CHG-33, CHG-34, CHG-35, CHG-36, CHG-37, CHG-38, CHG-39
**Target Skills**: `supabase-postgres-best-practices`, `xlsx`, `ui-ux-pro-max`, `ask-sonner`
**Success Criteria**:
  1. IR Partner cards feature numeric quotas with live computed actuals, CR%, and sync call logger.
  2. Dedicated `db.accommodations` schema with individual beds array and vetting checks; dedicated `db.pickups` schema with flight details, buddy, and guide sent confirmation.
  3. Quality Cases separate from CSR sponsors with live Stage 1 (24h/48h/72h), Stage 2 (48h/96h), Stage 3 (48h/5d) timers and Annex 2 claim link.
  4. Finance ledger completely separated from Team Members roster.
  5. Invoices table tracks receivables with automatic `>14 DAYS OVERDUE` warning and iGV partner/CSR coverage gauge.
**Plans**: 3 plans
- [ ] 16-01: IR Partner numeric supply quotas, live performance rollups, and sync call logger.
- [ ] 16-02: Dedicated Accommodation bed allocation board and Airport Pickup logistics tracker.
- [ ] 16-03: ECB/ICB Case escalation clocks, Annex 2 financial claim link, and AFPM invoice aging ledger.

---
*Roadmap defined: 2026-10-27*  
*Milestone 2 added: 2026-10-29*
