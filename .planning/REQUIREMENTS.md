# Requirements: AIESEC iCX ERP (Hub-Based Operating Model)

**Source Baseline:** `AIESEC_iCX_ERP_Hub_Based_Improvement_Roadmap.md`  
**Updated:** 2026-10-29  
**Core Value:** One connected operational record from first partner contact to completed exchange, with an accountable owner, reliable evidence, clear next action, and measurable experience quality at every stage.

---

## Priority 0 (P0) — Data Trust & Safe Operations

- [ ] **HUB-DATA-01**: Complete relational separation of `Organization`, `Contact`, `Partner Relationship/Deal`, `Contract`, `Project/Opportunity`, `Slot`, `EP Application`, `Pre-arrival`, `Arrival`, `Delivery/CXP`, and `Completion`.
- [ ] **HUB-DATA-02**: Elimination of concatenated text fields; atomic typed fields for passport/expiry, airport/flight/arrival dates, and numeric IR quotas.
- [ ] **HUB-DATA-03**: Safe record mutation flows: full edit drawer, reassignment, closed-lost with mandatory reasons, withdrawal, rejection, and match-break without deleting histories.
- [ ] **HUB-DATA-04**: Database-enforced exclusion constraints preventing double-booking of accommodation beds and slot overbooking under concurrent requests.
- [ ] **HUB-AUTH-01**: Server-side Row-Level Security (RLS) and server action permission checks; deny-by-default access control for all tables and routes.
- [ ] **HUB-AUDIT-01**: Append-only audit logging recording who changed what, when, previous/new value, and reason across all operational transitions.
- [ ] **HUB-RULE-01**: Administrative Rules & References engine storing policy requirements with confidence labels (`VERIFIED_OFFICIAL`, `CONFIRMED_LOCAL`, `PROPOSED`, `NEEDS_VERIFICATION`, `RETIRED`). Unverified rules never trigger automated rejections.
- [ ] **HUB-KPI-00**: Elimination of hardcoded dashboard values and fake funnel math; every metric reconciles to underlying source records and distinguishes `0`, `N/A`, `not configured`, `insufficient data`.

---

## Priority 1 (P1) — AIESEC-Aligned Exchange Lifecycle

- [ ] **HUB-CRM-01**: Multi-contact and multi-deal support per organization with normalized duplicate warnings (domain, tax ID, phone).
- [ ] **HUB-CRM-02**: Configurable 8-stage sales pipeline (`PROSPECT` → `QUALIFIED` → `DISCOVERY` → `PROPOSAL` → `NEGOTIATION` → `AGREEMENT_SIGNED` → `OPP_SETUP` → `ACTIVE_DELIVERY` / `CLOSED_LOST` / `DISQUALIFIED`).
- [ ] **HUB-CRM-03**: BANT partner qualification fields (need, audience, delivery capacity, decision-maker, ethics fit, risk flags) and discovery notes.
- [ ] **HUB-CRM-04**: Contract and annex versioning with digital signatures, fee terms, renewal dates, and accommodation/transport commitments.
- [ ] **HUB-STD-01**: Partner Standards Register tracking quality checkpoints, evidence types, reviewer roles, and renewal reviews.
- [ ] **HUB-OPP-01**: Separation of Project Template, Opportunity instance, and Slot capacity (`1:N:N`).
- [ ] **HUB-OPP-02**: Official iGV project portfolio mapping each project to primary/secondary SDGs, target beneficiaries, planned activities, and intended output evidence.
- [ ] **HUB-OPP-03**: Product-specific templates for iGTa (internship fields, salary/stipend) and iGTe (teaching deliverables, pedagogy, schedule, learner levels).
- [ ] **HUB-OPP-04**: Capacity and publishing gates: opportunities cannot be activated without signed contract, verified details, dates, and owner.
- [ ] **HUB-IR-01**: IR Partner directory with LC/MC entity, product compatibility, introduction call notes, cooperation stage, and supply quotas.
- [ ] **HUB-IR-02**: Numeric IR quotas by product and period with validity tracking and supply-to-demand coverage.
- [ ] **HUB-SYNC-01**: EXPA alignment: stable internal ID vs external EXPA ID, raw EXPA status vs normalized internal status, last-sync timestamp, read-only sync, and discrepancy report.
- [ ] **HUB-EP-01**: Atomic EP dossier tracking selection criteria, document checklists, matching, and record-level status history.
- [ ] **HUB-EP-02**: Atomic matching engine preventing assignment to filled, expired, or conflicting slots; match-break handling preserving history.
- [ ] **HUB-EP-03**: Live date-math SLA countdowns: 14d visa pack, 14d pre-arrival lock, 3d pickup guide, and 48h safety heartbeat.
- [ ] **HUB-EP-04**: Exception & break modal handling `REJECTED` (with AEPP feedback and rejection counter), `WITHDRAWN`, `APPROVAL_BROKEN`, `REALIZATION_BROKEN`.
- [ ] **HUB-EP-05**: Transition to `REALIZED` validating ±20d slot start date rule and Standards #4–#9 delivery.
- [ ] **HUB-STD-02**: Refreshed Exchange Standards register with exact wording, applicability, and per-EP evidence checklists.
- [ ] **HUB-STD-03**: Standards #10a (Mid-point) and #10b (Closing) tracking, separating internal delivery from EXPA participant survey responses.
- [ ] **HUB-CXP-01**: Customer feedback collection linked to EP, opportunity, and partner; actionable negative feedback creates corrective action tasks.
- [ ] **HUB-VISA-01**: Human-verified visa registry; no AI or stale database entry makes legal travel clearance decisions.
- [ ] **HUB-CASE-01**: Restricted Safeguarding & Case Vault with 3-tier escalation timers (Stage 1 LC, Stage 2 ECB, Stage 3 ICB), Annex 2 financial links, and emergency contacts.
- [ ] **HUB-OPS-01**: Dedicated Accommodation schema tracking individual bed allocations, preventing overlapping reservations, and storing house rules.
- [ ] **HUB-OPS-02**: Airport Pickup operations tracking flight numbers, pickup owners, mobile check-in view, and handover acknowledgment to CXP.

---

## Priority 2 (P2) — Management, Finance & Team Execution

- [ ] **HUB-FIN-01**: AFPM finance ledger separating budget, expected revenue, invoices/receivables, confirmed inflows, expenses/payables, outflows, refunds, and reconciliation.
- [ ] **HUB-FIN-02**: Dual-approval state machine on payments/reimbursements; mandatory receipts and invoice aging warning (>14 days overdue).
- [ ] **HUB-TM-01**: Dedicated `/members` module with Rabat roster, Composite MES formula (0-100%), and 4 engagement tiers.
- [ ] **HUB-TM-02**: Rabat 6 governance routines weekly attendance heatmap and monthly O2O coaching logger.
- [ ] **HUB-TM-03**: Team Standards (TeSt) scorecard (Building, Performing, Closing) for Team Leaders.
- [ ] **HUB-TM-04**: Structured Mandate Handover Pack generator compiling active partners, deals, opportunities, IR commitments, EPs, tasks, risks, and open cases.
- [ ] **HUB-TASK-01**: Unified task engine across all modules (sales follow-ups, IR messages, visa checks, pickup confirmations, overdue invoices).
- [ ] **HUB-TASK-02**: Idempotent background task automation and reminders evaluated in `Africa/Casablanca` timezone.
- [ ] **HUB-KPI-01**: Formally agreed KPI Dictionary documenting owner, formula, source tables, grain, exclusions, reporting window, and freshness.
- [ ] **HUB-KPI-02**: 100% drill-down scorecards allowing users to click any metric to inspect the exact filtered source records.

---

## Priority 3 (P3) — Usability, Scale & Disaster Recovery

- [ ] **HUB-UI-01**: Universal table-first interface with multi-column filtering, quick search, sort, and saved views.
- [ ] **HUB-MIG-01**: Validated CSV import with dry-run preview, row errors, duplicate warnings, and summary of changes.
- [ ] **HUB-MIG-02**: Permission-aware JSON/CSV exports and tested disaster recovery backup/restore drills.
- [ ] **HUB-OPT-01**: Slot capacity and supply forecasting based on historical cohort conversion rates.

---

## Traceability Matrix

| Requirement | Phase | Primary Objective | Status |
|---|---|---|---|
| HUB-TM-01..04 | Phase 12 | Member Management, Handovers & Team Standards (`TeSt`) | Ready to Plan |
| HUB-DATA-01..04, HUB-CRM-01..04, HUB-STD-01 | Phase 13 | B2B Partner CRM, Multi-Contacts & Partner Standards Register | Queued |
| HUB-OPP-01..04 | Phase 14 | Project Portfolio (iGV/iGTa/iGTe), Opportunities & Capacity Waves | Queued |
| HUB-IR-01..02, HUB-SYNC-01, HUB-EP-01..05 | Phase 15 | IR Supply Pipeline, EXPA Alignment & EP Funnel Lifecycle | Queued |
| HUB-STD-02..03, HUB-CXP-01, HUB-VISA-01, HUB-CASE-01, HUB-OPS-01..02 | Phase 16 | Refreshed Exchange Standards, CXP, Human-Verified Visa & Case Vault | Queued |
| HUB-FIN-01..02, HUB-TASK-01..02, HUB-KPI-00..02, HUB-UI-01, HUB-MIG-01..02 | Phase 17 | AFPM Finance Controls, Unified Task Engine & KPI Dictionary | Queued |
