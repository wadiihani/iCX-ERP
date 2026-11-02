# Requirements Specification: iCX Data Integrity & Tracking System

This document specifies the functional, architectural, and data integrity requirements directly derived from `iCX_Data_Integrity_Tracking_Spec.md` v1.0.

---

## 1. Foundation & Invariants (Milestone 0)

- **REQ-FND-01 (INV-01 Soft-Delete Only)**: No physical deletions permitted on any business record. Deletion requires `deleted_at`, `deleted_reason`, and `actor` ID. Database trigger and API routes must reject `DELETE` operations.
- **REQ-FND-02 (INV-02 Append-Only History)**: `status_history` and `audit_log` tables must be append-only. Triggers must reject any `UPDATE` or `DELETE`.
- **REQ-FND-03 (INV-03 Mandatory Ownership)**: Every operational entity (`op_partner`, `opportunity`, `exchange`, `ep`, `status_request`, `case_quality`, `compliance_item`) must have an active `owner_id`.
- **REQ-FND-04 (INV-05 Immutable EP Responses)**: `ep_reported_answer` and `ep_reported_at` on `standard_check` are write-once and can never be modified by AIESEC once set.
- **REQ-FND-05 (INV-07 ICB Freeze Gate)**: When an entity has `is_frozen = true`, all exchange approvals and processing actions must be hard-blocked in the UI and API.
- **REQ-FND-06 (INV-08 Versioned Rule Registry)**: Business rules (`gv.duration_weeks`, `hours.gv_per_week`, `visa.docs_due_days_after_approval`, etc.) must be stored in `rule_registry` with `effective_from` and `effective_to` dates.
- **REQ-FND-07 (INV-09 Comprehensive Audit Trail)**: All inserts, updates, and soft-deletes must automatically generate an `audit_log` row capturing before/after JSON states and user context.
- **REQ-FND-08 (INV-10 Confidentiality & RBAC)**: Role-based access control protecting EP contact details from non-owners; mandatory logging for all data exports.

---

## 2. Master Tracker & Reconciliation (Milestone 1)

- **REQ-TRK-01 (Relational Backbone)**: Enforce the relational hierarchy: `op_partner` → `opportunity` → `contract` → `exchange` ← `ep`.
- **REQ-TRK-02 (Stage Gating)**: Enforce required fields per stage (§5.1):
  - *Attraction*: Partner details, owner.
  - *Consideration*: Opportunity details, EP profile.
  - *Preparation*: Signed contract, approved dates, standards rows initialized (#1–#16).
  - *Experience*: Realized dates, mid/final review dates.
  - *Post-Experience*: Debrief status, survey outcomes.
- **REQ-TRK-03 (EXPA Import & Reconciliation)**: Automated reconciliation against EXPA status/dates. EXPA wins on status and dates; Tracker wins on proofs, standards, and case history (INV-04).
- **REQ-TRK-04 (Batch Quarantine Guard)**: If an EXPA import has >5% fewer rows than the previous batch, quarantine the import batch and raise `DQ-082` (INV-01).

---

## 3. Exchange Standards & Proof Vault (Milestone 2)

- **REQ-STD-01 (16 Standards Register)**: Seed `standard_def` with Exchange Standards #1 through #16, categorized by phase (Preparation, Experience, Post-Experience) and delivering entity (Host vs Home).
- **REQ-STD-02 (Parallel Truth Tracking)**: Maintain two distinct truths per standard: `tracked_status` (AIESEC tracked with proof) and `ep_reported_answer` (EP survey answer).
- **REQ-STD-03 (Delivery Checklists)**: Encode concrete delivery checklists for Host Standards #4, #5, #6, #7, #8, #9, #10, #11, #12, #13, #14, and #15 (§6.2).
- **REQ-STD-04 (Proof Integrity)**: Proofs stored with Drive URL and SHA-256 checksums. Standards marked `delivered` without a valid proof remain in `delivered_unproven` status.
- **REQ-STD-05 (Standards Mismatch Detection)**: Automatically flag `DQ-055` when `tracked_status` disagrees with `ep_reported_answer`.

---

## 4. Status Governance & Deadline Engine (Milestone 3)

- **REQ-GOV-01 (6 Status Request Types)**: Support 6 formal status change requests (`early_fi`, `extension_fi`, `break_apd`, `break_re`, `break_fi`, `break_co`) via `status_request`.
- **REQ-GOV-02 (Checklist Validation Gates)**: Prevent requests moving to `submitted` until all required documents and criteria (LC2LC PDF, ECB2ECB PDF, single EP check, timing gates) are fulfilled.
- **REQ-GOV-03 (Timing Cutoffs)**: Early FI requires submission ≥7 days before new finish; Extension requires submission ≥14 days before original finish.
- **REQ-GOV-04 (20-Day GV Direct Break)**: For iGV, when an EP remains in APD status >20 days after scheduled `re_date`, enable direct extraordinary break without proof requirement (§7.4).
- **REQ-GOV-05 (Deadline Calculation Engine)**: Nightly deadline computation engine evaluating T-7 notice, T-2 warning, T-0 urgent, and overdue escalation ladders (§8).

---

## 5. Partner PRM & IR Ecosystem (Milestone 4)

- **REQ-PRM-01 (Partner Standards #1–#8)**: Track the 8 Partner Standards per opportunity within account management routines (§9.1).
- **REQ-PRM-02 (Touchpoint Cadence)**: Log monthly calls, site visits, and reviews. Raise `DQ-060` warning when touchpoint gap exceeds 35 days.
- **REQ-PRM-03 (Partner NPS Prerequisites)**: Verify EXPA organization links and employee linkage prior to NPS collection (`DQ-062`).
- **REQ-PRM-04 (IR Partner Clustering)**: Categorize IR partners into 4 quadrants based on supply and market readiness: `upscale`, `grow`, `understand`, and `invest` (§9.3).
- **REQ-PRM-05 (E2E IR Analytics)**: Real-time calculation of stage conversion rates and standards delivery percentages broken down by IR partner.

---

## 6. Quality Cases & CS Minimums (Milestone 5)

- **REQ-QCS-01 (4 Customer Support Minimums)**: Implement centralized handling, exchange linkage, monthly KPI reporting, and mandatory case storage (§10).
- **REQ-QCS-02 (5 Mandatory Closing Fields)**: Prevent case closure unless description, classification, timestamped resolution steps, financial proof (if compensation > 0), and final agreement are present (`DQ-070`, `DQ-071`).
- **REQ-QCS-03 (Compensation & Fine Tracking)**: Track financial settlements and migration fines/penalties with proof verification.
- **REQ-QCS-04 (Case Analytics)**: Aggregate average resolution time, recurrence rate, and compensation sums by month and category.

---

## 7. Compliance Calendar & Freeze Protocol (Milestone 6)

- **REQ-CMP-01 (13 ICB Audit Documents)**: Track establishment letters, legal support, risk management, and education plans per ICB guidelines (§11.2).
- **REQ-CMP-02 (Statutory Deadlines)**: Compute ECB quarterly report dates (Apr 28, Jul 28, Oct 28, Jan 28) and unfreezing submission calendars.
- **REQ-CMP-03 (Freeze Protocol Enforcement)**: Manual toggle of `entity.is_frozen` restricted to LCVP iGV with mandatory ICB source link.

---

## 8. Data Quality Engine & Integrity Console (Milestone 7)

- **REQ-DQE-01 (25 Data Quality Rules)**: Execute nightly scans covering `DQ-001` through `DQ-084` with severity classification (Blocker, Urgent, Warn, Review).
- **REQ-DQE-02 (Data Health Score)**: Compute weighted composite health index (0–100): Completeness (35%), Freshness (25%), EXPA Consistency (25%), Ownership (15%).
- **REQ-DQE-03 (Integrity Console)**: 14 dedicated data views and Nivo charts covering open issues, staleness, funnel velocity, IR quadrants, and standards delivery (§14).
- **REQ-DQE-04 (Drill-Down & Export)**: Every visual instrument supports row-level record inspection and auditable CSV export.

---

## 9. Ownership Handoff & Disaster Recovery (Milestone 8)

- **REQ-HND-01 (Handoff Workflow)**: Formal ownership transfer protocol: `initiated → packet generated → reviewed → acknowledged → transferred → 7-day watch` (§12.3).
- **REQ-HND-02 (Handoff Packet)**: Auto-generate comprehensive JSON and printable summary of open exchanges, deadlines, cases, partners, and open DQ issues (§12.2).
- **REQ-HND-03 (Disaster Recovery & Snapshots)**: Nightly per-table CSV export with SHA-256 manifests; automated test simulating restore into a scratch DB.
- **REQ-HND-04 (Full Department Archive)**: Single ZIP export encompassing all database tables, handoff packets, proofs index, and rule registry state.

---

## 10. Traceability Matrix: Acceptance Tests (T-01..T-20)

| Test ID | Requirement | Given / When / Then Summary |
|---|---|---|
| **T-01** | REQ-FND-01 | Given business row, when DELETE attempted, then fails & DQ-081 logged |
| **T-02** | REQ-FND-02 | Given status change, when saved, then status_history row created; manual UPDATE fails |
| **T-03** | REQ-FND-04 | Given ep_reported_answer set, when update attempted, then rejected |
| **T-04** | REQ-TRK-04 | Given import with >5% row drop, then batch quarantined & DQ-082 raised |
| **T-05** | REQ-TRK-03 | Given EXPA status mismatch, when sync runs, then EXPA adopted & DQ-040 handled |
| **T-06** | REQ-FND-03 | Given owner deactivated, then DQ-011 fires & handoff task generated |
| **T-07** | REQ-GOV-02 | Given early-FI missing LC2LC PDF, when submitted, then blocked |
| **T-08** | REQ-GOV-03 | Given early-FI with desired finish <7 days, then timing_ok = false |
| **T-09** | REQ-GOV-03 | Given extension with finish <14 days, then timing_ok = false |
| **T-10** | REQ-GOV-04 | Given GV APD past RE date >20 days, then DQ-052 urgent & direct break enabled |
| **T-11** | REQ-FND-05 | Given entity is_frozen, when processing approval, then blocked with ICB notice |
| **T-12** | REQ-GOV-05 | Given approval on day 0 and no visa docs on day 15, then DQ-053 urgent |
| **T-13** | REQ-QCS-02 | Given case with compensation > 0 and no proof, when closing, then blocked (DQ-071) |
| **T-14** | REQ-HND-03 | Given nightly snapshot, when restored to scratch DB, then counts/hashes match manifest |
| **T-15** | REQ-HND-01 | Given handoff, when incoming owner hasn't acknowledged, ownership does not transfer |
| **T-16** | REQ-FND-06 | Given 5-week GV opportunity, passes under 4–8 rule, fails under legacy 6–8 rule |
| **T-17** | REQ-PRM-02 | Given partner with no touchpoint for 36 days, then DQ-060 warns |
| **T-18** | REQ-FND-08 | Given viewer role 'member', EP contacts of others are redacted/hidden |
| **T-19** | REQ-FND-07 | Given CSV export, audit_log records actor, scope, and row count |
| **T-20** | REQ-STD-04 | Given dead Drive proof link, DQ-083 flags within one run |
