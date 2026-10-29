# Roadmap: AIESEC iCX ERP (Hub-Based Operating Model)

## Overview

A phased engineering journey connecting business development, partner commitments, international relations (IR), project portfolio management, opportunity and slot capacity, exchange participant (EP) processing, exchange delivery, customer experience (CXP), quality standards, finance, and team execution into one auditable, high-reliability workflow.

Governed by:
- `AIESEC_iCX_ERP_Hub_Based_Improvement_Roadmap.md` (29 October 2026)
- `https://www.hub.aiesec.org/` (Exchange, IM, ICB, and Functional Hubs)
- `AIESEC_iCX_ERP_Tracker_First_Master_Specification.md`

---

## Execution Matrix (Milestone 2 & 3: Hub-Based Operational Integrity)

| Phase | Title | Primary Objective | Specialized Skills Used |
|---|---|---|---|
| **Phase 11** | Global Layout, Sidebar Navigation & Zero-CTA Dashboard | 4-group Left Sidebar, clean top header, sticky context filter bar, 9-card zero-CTA dashboard | `frontend-design`, `ui-styling`, `impeccable`, `vercel-composition-patterns` |
| **Phase 12** | Member Management, Team Handovers & Team Standards (`TeSt`) | `/members` module, Composite MES (0-100%), 4 tiers, Rabat 6 routines heatmap, O2O logger, TeSt scorecard, mandate handover pack | `ui-ux-pro-max`, `frontend-design`, `impeccable`, `vercel-composition-patterns` |
| **Phase 13** | Data Integrity, B2B Partner CRM & Partner Standards Register | Split Org & Deals, full edit drawer, 8-stage sales stepper, closed-lost reasons, BANT discovery gate, Partner Standards Register | `vercel-composition-patterns`, `impeccable`, `ask-sonner`, `ui-styling` |
| **Phase 14** | Project Portfolio (iGV/iGTa/iGTe), Opportunities & Capacity Waves | 1 Contract : N Opps : N Slots, official 16 GV projects linked to SDGs, product rules (iGTa/e), partly-remote ICB audit check, capacity waves | `vercel-composition-patterns`, `supabase-postgres-best-practices`, `ui-ux-pro-max` |
| **Phase 15** | IR Supply Pipeline, EXPA Alignment & EP Funnel Lifecycle | Numeric IR quotas, EXPA status mapping & discrepancy report, atomic typed EP fields, live date-math SLAs, exception/break modal, Â±20d rule | `supabase-postgres-best-practices`, `impeccable`, `mobile-native`, `pdf` |
| **Phase 16** | Refreshed Exchange Standards, CXP, Human-Verified Visa & Case Vault | Exact Refreshed Standards register, per-EP checklists, Standards #10a/#10b, human-verified visa registry, restricted Case Vault with 3-tier timers, bed exclusion & pickups | `supabase-postgres-best-practices`, `pdf`, `mobile-native`, `impeccable` |
| **Phase 17** | AFPM Finance Controls, Unified Task Engine & KPI Dictionary | AFPM finance ledger (>14d overdue warning), cross-module unified task engine, non-fictional KPI Dictionary, validated CSV import/export, restore drill | `supabase-postgres-best-practices`, `xlsx`, `ui-ux-pro-max`, `ask-sonner` |

---

## Progress

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
| Phase 11: Global Layout, Sidebar Navigation & Zero-CTA Dashboard | Hub Milestone | 3/3 | Complete | 2026-10-29 |
| Phase 12: Member Management, Team Handovers & Team Standards (`TeSt`) | Hub Milestone | 2/2 | Complete | 2026-10-29 |
| Phase 13: Data Integrity, B2B Partner CRM & Partner Standards Register | Hub Milestone | 3/3 | Complete | 2026-10-29 |
| Phase 14: Project Portfolio, Opportunities & Capacity Waves | Hub Milestone | 2/2 | Complete | 2026-10-29 |
| Phase 15: IR Supply Pipeline, EXPA Alignment & EP Funnel Lifecycle | Hub Milestone | 3/3 | Complete | 2026-10-29 |
| Phase 16: Refreshed Exchange Standards, CXP, Human Visa & Case Vault | Hub Milestone | 3/3 | Complete | 2026-10-29 |
| Phase 17: AFPM Finance Controls, Unified Task Engine & KPI Dictionary | Hub Milestone | 0/3 | Queued | - |

---

## Phase Details

### Phase 11: Global Layout, Sidebar Navigation & Zero-CTA Command Dashboard
**Status**: Completed 2026-10-29  
**Accomplished**:
- 4-group Left Sidebar (`Command`, `External Engine BD`, `Internal Engine Ops`, `Finance & People`).
- Clean top header with `+ Quick Add` (8 universal intake types) and `âŒ˜K` command bar.
- Sticky Context Filter Bar (`Term`, `Peak`, `Product`, `Engine`, `Role`).
- `âš™ï¸ Data & Settings` modal for JSON backup, CSV export, restore, and seed reset.
- Zero-CTA Dashboard verification and cumulative funnel mathematics.
**Plans**:
- [x] 11-01: Global 4-group Left Sidebar and Top Header clean action dropdown overhaul.
- [x] 11-02: Sticky Global Context Filter Bar & Data Settings modal integration.
- [x] 11-03: Zero-CTA 9-card interactive Dashboard verification and real cumulative funnel math.

---

### Phase 12: Member Management, Team Handovers & Team Standards (`TeSt`)
**Goal**: Build dedicated `/members` module with Rabat roster, Composite MES formula (0-100%), 4-tier classification, Rabat 6 governance routines heatmap, monthly O2O coaching logger, Team Standards (TeSt) scorecard, and Mandate Handover Pack generator.
**Depends on**: Phase 11
**Requirements**: HUB-TM-01, HUB-TM-02, HUB-TM-03, HUB-TM-04
**Target Skills**: `ui-ux-pro-max`, `frontend-design`, `impeccable`, `vercel-composition-patterns`
**Success Criteria**:
  1. `/members` route displays Rabat roster with Composite MES score and 4-tier badges (`ðŸŸ¢ Tier 1 Core`, `ðŸ”µ Tier 2 Strong`, `ðŸŸ¡ Tier 3 Moderate`, `ðŸ”´ Tier 4 Drop-Off Risk`).
  2. Rabat 6 governance routines weekly attendance grid displays meeting attendance heatmap.
  3. Monthly O2O coaching logger drawer captures wellbeing scores, KPI reviews, blockers, and action items.
  4. Team Standards (TeSt) scorecard allows Team Leaders to assess Building, Performing, and Closing deliverables.
  5. Mandate Handover Pack generator compiles active partners, deals, opportunities, IR commitments, EPs, tasks, risks, and open cases.
**Exit Gate**: Team assignments, member tiers, O2O logs, and mandate handover generation are operational and verified.
**Plans**: 2 plans
- [x] 12-01: Member roster, MES 0-100% calculation engine, and 4-tier classification UI. (Completed 2026-10-29)
- [x] 12-02: Rabat 6 governance routines attendance heatmap, O2O coaching logger, TeSt scorecard, and Mandate Handover Pack. (Completed 2026-10-29)

---

### Phase 13: Data Integrity, B2B Partner CRM & Partner Standards Register
**Goal**: Separate Organizations and Deals (`1:N`), build full slide-over edit drawer, 8-stage sales stepper with closed-lost reasons, BANT discovery gate, contract gate, and versioned Partner Standards Register.
**Depends on**: Phase 11
**Requirements**: HUB-DATA-01, HUB-DATA-02, HUB-DATA-03, HUB-CRM-01, HUB-CRM-02, HUB-CRM-03, HUB-CRM-04, HUB-STD-01
**Target Skills**: `vercel-composition-patterns`, `impeccable`, `ask-sonner`, `ui-styling`
**Success Criteria**:
  1. `db.organizations` cleanly links to `db.b2bDeals` (1 Org : N Deals) and multiple contacts.
  2. Slide-over drawer allows full editing of all partner, contact, and deal fields without deleting history.
  3. 8-stage stepper enables selecting stages with mandatory `lossReason` when marking `CLOSED_LOST` or `DISQUALIFIED`.
  4. BANT discovery fields must be complete before `PROPOSAL`; signed contract must exist before `OPP_SETUP`.
  5. Partner Standards Register tracks evidence-based checkpoints with source URLs and reviewer roles.
  6. Top switcher toggles Kanban Board, Master CRM Table, and Detailed Cards.
**Exit Gate**: A lead progresses to qualified partner, signed agreement, and approved opportunity with zero duplicate records and intact loss histories.
**Plans**: 3 plans
- [x] 13-01: Organization, Contact & Deal relational separation with slide-over edit drawer. (Completed 2026-10-29)
- [x] 13-02: 8-stage sales stepper, BANT discovery gate, and contract attachment gate. (Completed 2026-10-29)
- [x] 13-03: Kanban board/table switcher and versioned Partner Standards Register. (Completed 2026-10-29)

---

### Phase 14: Project Portfolio (iGV/iGTa/iGTe), Opportunities & Capacity Waves
**Goal**: Normalize contracts, opportunities, and multi-slot waves (`1:N:N`), implement official 16 GV projects linked to SDGs with output evidence, product rules for iGTa/e, enforce partly-remote ICB audit checks, and compute live capacity metrics.
**Depends on**: Phase 13
**Requirements**: HUB-OPP-01, HUB-OPP-02, HUB-OPP-03, HUB-OPP-04
**Target Skills**: `vercel-composition-patterns`, `supabase-postgres-best-practices`, `ui-ux-pro-max`
**Success Criteria**:
  1. Opportunities support multiple slot waves with `+ Add Slot Wave`.
  2. `iGV` populates 16 official Global Volunteer projects with primary/secondary SDGs, target beneficiaries, planned activities, and output evidence.
  3. `iGTa` provides 6 functional fields with fee locked at 0; `iGTe` validates teaching deliverables, pedagogy, schedule, and learner levels.
  4. `PARTLY_REMOTE` modality requires remote weeks validation and ICB audit URL.
  5. Opportunity capacity counts (applied, accepted, approved, realized) aggregate dynamically from linked EPs.
**Exit Gate**: Opportunities cannot be published without signed agreement, verified details, dates, and owner; project deliverables are tied to real activity evidence.
**Plans**: 2 plans
- [x] 14-01: Contract to Opportunity to Multi-Slot relational normalization and wave manager. (Completed 2026-10-29)
- [x] 14-02: Dynamic product rules (`iGV/iGTa/iGTe`), SDG activity/output evidence, partly-remote ICB audit gate, and post-approval benefit locking. (Completed 2026-10-29)

---

### Phase 15: IR Supply Pipeline, EXPA Alignment & EP Funnel Lifecycle
**Goal**: Replace string quotas with numeric targets and live metrics, implement EXPA status mapping and discrepancy reporting, split concatenated EP strings into typed atomic fields, implement live date-math SLA countdowns, exception modal, and Â±20d realization rule.
**Depends on**: Phase 14
**Requirements**: HUB-IR-01, HUB-IR-02, HUB-SYNC-01, HUB-EP-01, HUB-EP-02, HUB-EP-03, HUB-EP-04, HUB-EP-05
**Target Skills**: `supabase-postgres-best-practices`, `impeccable`, `mobile-native`, `pdf`
**Success Criteria**:
  1. IR Partner cards feature numeric quotas with live computed actuals, CR%, validity periods, and sync call logger.
  2. Stable internal ID vs external EXPA ID, raw EXPA status vs normalized internal status, and EXPA discrepancy report.
  3. Atomic typed fields replace concatenated strings; relational foreign keys connect to accommodations, buddies, and managers.
  4. Live date-math SLA countdowns track 14d visa pack, 14d pre-arrival lock, 3d pickup guide, and 48h safety heartbeat.
  5. Exception modal handles `REJECTED` (with AEPP feedback and rejection counter), `WITHDRAWN`, `APPROVAL_BROKEN`, `REALIZATION_BROKEN`.
  6. Transition to `REALIZED` validates Â±20d slot start rule for iGV and Standards #4â€“#9 delivery.
**Exit Gate**: An EP can be traced from application through matching and exception/completion states with external and local statuses fully reconcilable.
**Plans**: 3 plans
- [x] 15-01: IR Partner numeric supply quotas, live performance rollups, and EXPA status mapping with discrepancy reporting. (Completed 2026-10-29)
- [x] 15-02: Atomic typed EP fields, relational foreign keys, and live date-math SLA countdowns. (Completed 2026-10-29)
- [x] 15-03: AEPP exception/break/rejection modal, realization validation gates (Â±20d rule), and touchpoint log. (Completed 2026-10-29)

---

### Phase 16: Refreshed Exchange Standards, CXP, Human-Verified Visa & Case Vault
**Goal**: Import exact Refreshed Exchange Standards register, per-EP evidence checklist, split Standards #10a/#10b, human-verified visa registry, restricted Case Vault with 3-tier escalation timers, accommodation bed exclusion, and airport pickup operations.
**Depends on**: Phase 15
**Requirements**: HUB-STD-02, HUB-STD-03, HUB-CXP-01, HUB-VISA-01, HUB-CASE-01, HUB-OPS-01, HUB-OPS-02
**Target Skills**: `supabase-postgres-best-practices`, `pdf`, `mobile-native`, `impeccable`
**Success Criteria**:
  1. Refreshed Exchange Standards register tracks version, applicability, and per-EP evidence checklists with reviewer roles.
  2. Standards modal splits #10a (Mid-point) and #10b (Closing), tracking internal delivery vs EXPA survey.
  3. Human-verified visa registry prevents automated or unverified travel clearance.
  4. Restricted Case Vault features 3-tier escalation countdowns (Stage 1 LC, Stage 2 ECB, Stage 3 ICB), Annex 2 financial links, and verified emergency contacts.
  5. Dedicated Accommodation schema with individual beds array preventing overlapping reservations via database constraints.
  6. Dedicated Airport Pickups schema with flight details, pickup owner, mobile view, and handover acknowledgment.
**Exit Gate**: An upcoming exchange can be prepared, delivered, monitored, and closed with evidence, responsible owners, and safe exception handling.
**Plans**: 3 plans
- [x] 16-01: Refreshed Exchange Standards evidence checklist, Standards #10a/#10b split, and customer feedback action loop. (Completed 2026-10-29)
- [x] 16-02: Human-verified visa registry, expiry reminders, and restricted Case Solving Vault with 3-tier timers and Annex 2 links. (Completed 2026-10-29)
- [x] 16-03: Dedicated Accommodation bed allocation board (with PostgreSQL exclusion constraints) and Airport Pickup logistics tracker. (Completed 2026-10-29)

---

### Phase 17: AFPM Finance Controls, Unified Task Engine & KPI Dictionary
**Goal**: Implement AFPM finance ledger separating budget/revenue/receivables/inflows/payables/outflows/refunds, dual approvals, invoice aging warning (>14d), cross-module unified task engine, non-fictional KPI Dictionary, validated CSV import/export, and disaster recovery restore drill.
**Depends on**: Phase 16
**Requirements**: HUB-FIN-01, HUB-FIN-02, HUB-TASK-01, HUB-TASK-02, HUB-KPI-00, HUB-KPI-01, HUB-KPI-02, HUB-UI-01, HUB-MIG-01, HUB-MIG-02
**Target Skills**: `supabase-postgres-best-practices`, `xlsx`, `ui-ux-pro-max`, `ask-sonner`
**Success Criteria**:
  1. Finance ledger separated from team roster; invoices table tracks receivables with automatic `>14 DAYS OVERDUE` warning and iGV partner/CSR coverage gauge.
  2. Dual-approval state machine on payments with mandatory receipts.
  3. Unified task engine feeds from sales follow-ups, IR messages, visa checks, accommodation confirmations, and overdue invoices with idempotent automation in `Africa/Casablanca`.
  4. Agreed KPI Dictionary documenting formula, source tables, grain, exclusions, and freshness; 100% drill-down from charts to filtered records.
  5. Validated CSV import with dry-run preview; permission-aware exports; documented and tested backup/restore recovery drill.
**Exit Gate**: All operational KPIs are trustworthy, explainable, and actionable; daily work is managed from a reliable unified action queue.
**Plans**: 3 plans
- [ ] 17-01: AFPM finance ledger, dual-approval payments, invoice aging (>14d overdue), and Annex 2 financial claims.
- [ ] 17-02: Cross-module unified task engine and idempotent background automation in `Africa/Casablanca`.
- [ ] 17-03: KPI Dictionary implementation, 100% drill-down scorecards, validated CSV import dry-run, and disaster recovery drill.

---
*Roadmap updated: 2026-10-29*
