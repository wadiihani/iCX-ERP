# GSD Project State: AIESEC iCX Data Integrity & Tracking System

## Project Overview

- **Milestone Cycle**: Rebuild v1.0 (from `iCX_Data_Integrity_Tracking_Spec.md`)
- **Active Milestone**: **M4 — Partner PRM & IR Ecosystem**
- **Status**: Milestone M3 complete; ready for Milestone M4 execution
- **Last Updated**: 2026-11-03

---

## Architectural & Governance Decisions (D1–D10)

| ID | Decision Item | Selected Configuration / Value |
|---|---|---|
| **D1** | Target Stack | PostgreSQL + Supabase + Next.js 14 App Router + Xenon UI Kit + Nivo |
| **D2** | EXPA Integration Mode | CSV export upload with automated schema drift check & >5% row-drop quarantine guard |
| **D3** | GV Duration Rule Effective Date | ECBA 2026 update date (`4–8 weeks`); legacy versions (`6–8 weeks`) archived in `rule_registry` |
| **D4** | Home Entity Standards Mandatory Flag | Standards #1, #2, #3, #16 treated as non-mandatory until officially confirmed by ICB |
| **D5** | Customer Flow Stage ↔ Status Mapping | Attraction (Open), Consideration (APL/ACP), Preparation (APD→RE), Experience (RE→FI), Post-Exp (FI→CO) |
| **D6** | IR Cluster Thresholds | Calculated from median supply & market readiness of LC historical data, recomputed monthly |
| **D7** | Stage Staleness SLA | 14 days maximum idle time in active operational stages |
| **D8** | UI Language | English (official AIESEC international operational language) |
| **D9** | iGT (GTa / GTe) Scope | Unified schema support enabled; UI filtered to iGV for v1 |
| **D10** | Freeze Authority | LCVP iGV only, with mandatory ICB audit reference link |

---

## Milestone Status Overview

| Milestone | Title | Plans | Status | Completion Date |
|---|---|---|---|---|
| **M0** | Foundation & Invariants | 3 plans | **COMPLETED** (3/3 done) | 2026-11-02 |
| **M1** | Master Tracker & Reconciliation | 3 plans | **COMPLETED** (3/3 done) | 2026-11-03 |
| **M2** | Exchange Standards & Proof Vault | 3 plans | **COMPLETED** (3/3 done) | 2026-11-03 |
| **M3** | Status Governance & Deadline Engine | 3 plans | **COMPLETED** (3/3 done) | 2026-11-03 |
| **M4** | Partner PRM & IR Ecosystem | 3 plans | **IN PROGRESS** (1/3 done) | — |
| **M5** | Quality Cases & CS Minimums | 3 plans | Queued | — |
| **M6** | Compliance Calendar & ICB Freeze Gate | 2 plans | Queued | — |
| **M7** | Data Quality Engine & Integrity Console | 3 plans | Queued | — |
| **M8** | Ownership Handoff & Disaster Recovery | 4 plans | Queued | — |

---

## Phase M0 Execution Status

| Plan | Title | Status | Details |
|---|---|---|---|
| **00-01** | Core Schema DDL, Enums & Relational Tables | **COMPLETED** | Migration `20261102000001_icx_data_integrity_tracking_v1.sql` + TS types `src/lib/types/data-integrity.ts` + 34 unit tests |
| **00-02** | Database Integrity Triggers & Append-Only Guarantees | **COMPLETED** | Migration `20261102000002_icx_data_integrity_triggers_v1.sql` + `src/lib/data-integrity/invariants.ts` + 15 unit tests (INV-01, INV-02, INV-05, INV-09, DQ-080) |
| **00-03** | Rule Registry Seed, RBAC & Acceptance Test Harness | **COMPLETED** | Migration `20261102000003_icx_rule_registry_seed_and_rbac_v1.sql` + `src/lib/data-integrity/rules.ts` + `src/lib/data-integrity/rbac.ts` + 13 acceptance tests (T-01, T-02, T-03, T-16, T-18, T-19) |

---

## Phase M1 Execution Status

| Plan | Title | Status | Details |
|---|---|---|---|
| **01-01** | Master Tracker Relational CRUD Data Layer & Services | **COMPLETED** | `src/lib/data-integrity/master-tracker.ts` + 11 unit tests (`tests/master-tracker-crud.test.ts`) enforcing INV-01, INV-03, INV-06, INV-08, INV-10, DQ-001, DQ-080 |
| **01-02** | Stage Required-Field Validator Gates | **COMPLETED** | `src/lib/data-integrity/stage-gates.ts` + 8 unit tests (`tests/stage-gates.test.ts`) enforcing §5.1 required field matrix, INV-07 ICB freeze gate, S1 completion rule, DQ-020 issue generation |
| **01-03** | EXPA CSV/JSON Sync & Reconciliation Engine | **COMPLETED** | Migration `20261102000004_icx_import_batch_v1.sql` + `src/lib/data-integrity/expa-sync.ts` + 6 unit tests (`tests/expa-sync-reconciliation.test.ts`) enforcing >5% row drop quarantine (DQ-082, T-04), EXPA status reconciliation (INV-04, DQ-040, T-05), and inactive owner scan (DQ-011, T-06) |

---

## Phase M2 Execution Status

| Plan | Title | Status | Details |
|---|---|---|---|
| **02-01** | Exchange Standards Parallel-Truth Service | **COMPLETED** | `src/lib/data-integrity/standards-service.ts` + 10 unit tests (`tests/exchange-standards-service.test.ts`) enforcing parallel truth, INV-05 write-once EP survey answers, `std_delivery_pct`, `completion_readiness`, and DQ-055 mismatch detection |
| **02-02** | Standards Checklist Validation Engine & Computed Metrics | **COMPLETED** | `src/lib/data-integrity/standards-checklist.ts` + 8 unit tests (`tests/standards-checklist.test.ts`) enforcing §6.2 statutory checklist items for standards #4–#15, checklist completeness delivery gate, and §6.4 home entity co-delivery tracking |
| **02-03** | Proof Document Vault & Dead Link Detection | **COMPLETED** | Migration `20261102000005_icx_proof_vault_v1.sql` + `src/lib/data-integrity/proof-vault.ts` + 8 unit tests (`tests/proof-vault-integrity.test.ts`) enforcing SHA-256 tamper detection, amber unproven clearance, and Acceptance Test T-20 (DQ-083 dead link scanner) |

---

## Phase M3 Execution Status

| Plan | Title | Status | Details |
|---|---|---|---|
| **03-01** | Status Request Schema & Lifecycle State Machine | **COMPLETED** | Migration `20261102000006_icx_status_request_v1.sql` + `src/lib/data-integrity/status-governance.ts` + 8 unit tests (`tests/status-governance-lifecycle.test.ts`) enforcing 6 statutory request kinds, single EP isolation (INV-06), ticket reference gate, and lifecycle finite state machine |
| **03-02** | Statutory Request Checklist Validators & Timing Engine | **COMPLETED** | `src/lib/data-integrity/status-validators.ts` + 5 unit tests (`tests/status-request-validators.test.ts`) enforcing early FI checklist & T-07/T-08, extension timing T-09, APD aged overdue T-10, and English PDF proof requirements |
| **03-03** | Deadline Engine & Radar Escalations | **COMPLETED** | Migration `20261102000007_icx_deadline_radar_v1.sql` + `src/lib/data-integrity/deadline-engine.ts` + 7 unit tests (`tests/deadline-engine.test.ts`) enforcing visa delivery SLA (T-12, DQ-053), partner touchpoint gap (T-17, DQ-060), departure support SLA (DQ-056), Alert Ladder escalations, and ECB/ICB compliance radar |

---

## Phase M4 Execution Status

| Plan | Title | Status | Details |
|---|---|---|---|
| **04-01** | Partner Standards per Opportunity & Account Management | **COMPLETED** | Migration `20261102000008_icx_partner_standards_v1.sql` + `src/lib/data-integrity/partner-standards.ts` + 12 unit tests (`tests/partner-standards.test.ts`) enforcing 8 statutory partner standards (#1–#8), review separation, closing timing, and DQ-062 NPS prerequisites |
| **04-02** | Partner Touchpoint Logging & Buyer Personas | **Queued** | Touchpoint logging (monthly call, site visit, lc touchpoint, newsletter, quarterly review), §5.2 buyer persona tags, objection tags, and funnel conversions |
| **04-03** | IR Partner Record, 2×2 Clustering & E2E Analytics | **Queued** | Define/Analyze/Promote/Deliver/Track, 2×2 clustering matrix (upscale/grow/understand/invest), E2E customer flow analytics and standards delivery |

---

## Next Action

Execute Plan 04-02: Partner Touchpoint Logging & Buyer Personas (§5.2, §9.2).
