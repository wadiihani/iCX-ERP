# GSD Project State: AIESEC iCX Data Integrity & Tracking System

## Project Overview

- **Milestone Cycle**: Rebuild v1.0 (from `iCX_Data_Integrity_Tracking_Spec.md`)
- **Active Milestone**: **M2 — Exchange Standards & Proof Vault**
- **Status**: Milestone M2 in progress (Plan 02-01 complete)
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
| **M2** | Exchange Standards & Proof Vault | 3 plans | **IN PROGRESS** (1/3 done) | — |
| **M3** | Status Governance & Deadline Engine | 3 plans | Queued | — |
| **M4** | Partner PRM & IR Ecosystem | 3 plans | Queued | — |
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
| **02-02** | Standards Checklist Validation Engine & Computed Metrics | **Queued** | Detailed checklist item validation for standards #4–#15 (§6.2), checklist completeness calculation, and quality verification |
| **02-03** | Proof Document Vault & Dead Link Detection | **Queued** | `proof_document` table, SHA-256 hash chaining, Google Drive link validator, dead link detection (DQ-083), Acceptance Test T-20 |

---

## Next Action

Execute Plan 02-02: Standards Checklist Validation Engine & Computed Metrics (§6.2).
