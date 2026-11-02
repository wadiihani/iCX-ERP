# Roadmap: AIESEC iCX Data Integrity & Tracking System

**Governing Specification**: `iCX_Data_Integrity_Tracking_Spec.md` v1.0  
**Build Architecture**: Next.js 14 App Router + Supabase/PostgreSQL + Xenon UI + Nivo Data Visualizations

---

## Milestone Execution Matrix (M0–M8)

| Milestone | Title | Primary Scope | Specialized Skills Assigned |
|---|---|---|---|
| **M0** | **Foundation & Invariants** | Schema DDL, triggers (INV-01/02/05/09), RBAC, versioned `rule_registry` (§3.4), `audit_log`, `import_batch` | `supabase`, `supabase-postgres-best-practices` |
| **M1** | **Master Tracker & Reconciliation** | Partner, Opportunity, Contract, EP, Exchange CRUD, Stage Field Gates (§5.1), EXPA CSV import & reconciliation (DQ-040..042, 080, 082) | `supabase-postgres-best-practices`, `xlsx`, `data-table-engine` |
| **M2** | **Exchange Standards & Proof Vault** | `standard_def` seed #1–#16, checklists (§6.2), SHA-256 proofs, parallel truth tracking (`tracked_status` vs immutable `ep_reported_answer`), DQ-054/055/056 | `pdf`, `emil-design-eng`, `ui-styling` |
| **M3** | **Status Governance & Deadline Engine** | 6 `status_request` kinds, checklist validators, 20d direct break rule for GV, automated nightly deadline engine (§8) | `supabase-postgres-best-practices`, `ask-sonner`, `mobile-native` |
| **M4** | **Partner PRM & IR Ecosystem** | Partner standards #1–#8 (§9.1), monthly touchpoints, NPS prerequisites, IR clustering (upscale/grow/understand/invest), E2E analytics | `ui-ux-pro-max`, `frontend-design`, `nivo` |
| **M5** | **Quality Cases & CS Minimums** | 4 CS minimums (§10), 5 mandatory closing fields, compensation exposure & migration fines, monthly SLA & KPI reporting | `impeccable`, `design-system` |
| **M6** | **Compliance Calendar & ICB Freeze Gate** | 13 ICB audit documents (§11.2), quarterly ECB report schedule, unfreezing submissions, `entity.is_frozen` hard gate (INV-07) | `pdf`, `supabase-postgres-best-practices` |
| **M7** | **Data Quality Engine & Integrity Console** | 25 DQ rules (DQ-001..DQ-084), Issue SLA lifecycle, Data Health Score (0–100), 14-chart Integrity Console (§14) via Nivo | `ui-ux-pro-max`, `nivo`, `design-taste-frontend`, `web-design-guidelines` |
| **M8** | **Ownership Handoff & Disaster Recovery** | Accountability model, auto-generated Handoff Packet (§12.2), term handover, nightly snapshots, scratch DB restore drill (T-14), full ZIP export | `pdf`, `xlsx`, `supabase-postgres-best-practices` |

---

## Milestone Breakdown & Plan Definitions

### Milestone M0: Foundation & Invariants
- **Goal**: Implement the immutable storage backbone, triggers, security policies, and versioned rule registry.
- **Skills**: `supabase`, `supabase-postgres-best-practices`
- **Plans**:
  - `M0-01-PLAN.md`: DDL schema for core entities (`member`, `entity_org`, `op_partner`, `opportunity`, `contract`, `ep`, `exchange`, `status_history`, `audit_log`, `rule_registry`).
  - `M0-02-PLAN.md`: Database triggers enforcing INV-01 (no hard deletes), INV-02 (append-only history), INV-05 (immutable EP responses), and INV-09 (universal audit log).
  - `M0-03-PLAN.md`: Rule registry seed with versioned policy parameters (GV 4–8 vs legacy 6–8, hours, visa deadlines) and RBAC role policies (INV-10).
- **Acceptance Verification**: Tests T-01, T-02, T-03, T-16, T-18, T-19.

---

### Milestone M1: Master Tracker & Reconciliation
- **Goal**: Implement high-reliability operational intake, stage-gated record fields, and idempotent EXPA import reconciliation.
- **Skills**: `supabase-postgres-best-practices`, `xlsx`, `data-table-engine`
- **Plans**:
  - `M1-01-PLAN.md`: Relational CRUD views and forms for Partner, Opportunity, Contract, EP, and Exchange.
  - `M1-02-PLAN.md`: Stage required-field validator gates preventing premature stage advancement (§5.1).
  - `M1-03-PLAN.md`: EXPA CSV/JSON sync engine with row-drop quarantine (>5% drop guard DQ-082) and automated status reconciliation (DQ-040..DQ-042).
- **Acceptance Verification**: Tests T-04, T-05, T-06.

---

### Milestone M2: Exchange Standards & Proof Vault
- **Goal**: Establish the parallel-truth standards engine and verified evidence repository.
- **Skills**: `pdf`, `emil-design-eng`, `ui-styling`
- **Plans**:
  - `M2-01-PLAN.md`: `standard_def` seed (#1–#16) and parallel tracking data model (`tracked_status` vs write-once `ep_reported_answer`).
  - `M2-02-PLAN.md`: Delivery checklist UI for Host Standards #4 through #15 with proof upload, SHA-256 calculation, and unproven warning states.
  - `M2-03-PLAN.md`: Standards mismatch detection engine (`DQ-055`) and IR co-delivery alignment logging.
- **Acceptance Verification**: Tests T-03, T-20.

---

### Milestone M3: Status Governance & Deadline Engine
- **Goal**: Enforce formal status transitions and automated policy-driven deadlines.
- **Skills**: `supabase-postgres-best-practices`, `ask-sonner`, `mobile-native`
- **Plans**:
  - `M3-01-PLAN.md`: Status change request engine supporting early_fi, extension_fi, and the 4 break kinds with strict checklist validators.
  - `M3-02-PLAN.md`: Timing cutoff gates (early FI ≥7d, extension ≥14d) and the GV 20-day direct break protocol (§7.4).
  - `M3-03-PLAN.md`: Nightly deadline engine computing proactive notifications (T-7, T-2, T-0, overdue) across all exchange commitments.
- **Acceptance Verification**: Tests T-07, T-08, T-09, T-10, T-12.

---

### Milestone M4: Partner PRM & IR Ecosystem
- **Goal**: Modernize partner account management, touchpoint cadence, and international partner clustering.
- **Skills**: `ui-ux-pro-max`, `frontend-design`, `nivo`
- **Plans**:
  - `M4-01-PLAN.md`: Partner Standards #1–#8 tracking inside opportunity account management routines with buyer persona tagging.
  - `M4-02-PLAN.md`: Partner touchpoint log with 35-day staleness alerts (`DQ-060`) and NPS prerequisite validation (`DQ-062`).
  - `M4-03-PLAN.md`: IR partner portfolio with dynamic 4-quadrant clustering (`upscale`, `grow`, `understand`, `invest`) and E2E conversion analytics.
- **Acceptance Verification**: Test T-17.

---

### Milestone M5: Quality Cases & CS Minimums
- **Goal**: Deliver centralized quality case management fulfilling the 4 Customer Support minimums.
- **Skills**: `impeccable`, `design-system`
- **Plans**:
  - `M5-01-PLAN.md`: Centralized `case_quality` intake linked to exchange records with first-response timer and SLA tracking.
  - `M5-02-PLAN.md`: Case closure validation requiring all 5 mandatory fields, agreement documents, and financial proof (`DQ-070`, `DQ-071`).
  - `M5-03-PLAN.md`: Compensation tracking (including migration fines) and monthly executive CS KPI reporting.
- **Acceptance Verification**: Test T-13.

---

### Milestone M6: Compliance Calendar & ICB Freeze Gate
- **Goal**: Automate national and international compliance tracking and enforce operational freeze gates.
- **Skills**: `pdf`, `supabase-postgres-best-practices`
- **Plans**:
  - `M6-01-PLAN.md`: Compliance item calendar tracking the 13 ICB audit documents and ECB quarterly submission cycles.
  - `M6-02-PLAN.md`: Statutory freeze protocol: `entity.is_frozen` hard gate blocking all APD and RE processing across the application (INV-07).
- **Acceptance Verification**: Test T-11.

---

### Milestone M7: Data Quality Engine & Integrity Console
- **Goal**: Build the real-time operational radar and data health visualization console.
- **Skills**: `ui-ux-pro-max`, `nivo`, `design-taste-frontend`, `web-design-guidelines`
- **Plans**:
  - `M7-01-PLAN.md`: Nightly automated execution of all 25 data quality rules (`DQ-001` through `DQ-084`) with SLA tracking.
  - `M7-02-PLAN.md`: Composite Data Health Score calculation (0–100) combining completeness, freshness, EXPA consistency, and ownership.
  - `M7-03-PLAN.md`: Integrity Console presenting 14 interactive Nivo charts with row-level inspection drill-downs and audited CSV exports (§14).
- **Acceptance Verification**: Tests T-04, T-05, T-19.

---

### Milestone M8: Ownership Handoff & Disaster Recovery
- **Goal**: Guarantee zero record loss across leadership transitions and prove disaster recovery.
- **Skills**: `pdf`, `xlsx`, `supabase-postgres-best-practices`
- **Plans**:
  - `M8-01-PLAN.md`: Ownership handoff workflow with auto-generated Handoff Packet JSON and printable handover summary (§12.2).
  - `M8-02-PLAN.md`: Term handover protocol transferring entire entity responsibilities with mandatory incoming acknowledgment.
  - `M8-03-PLAN.md`: Automated disaster recovery snapshot pipeline and scratch DB restore verification drill (T-14).
  - `M8-04-PLAN.md`: Single-click full department ZIP archive export with cryptographic SHA-256 manifests.
- **Acceptance Verification**: Tests T-14, T-15.
