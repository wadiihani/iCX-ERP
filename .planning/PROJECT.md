# AIESEC iCX Data Integrity & Tracking System

## Project Context & Charter

- **Owner**: Wadii Hani (Na9ach) — LCVP iGV, AIESEC in Rabat (EB 26.2)
- **Specification**: `iCX_Data_Integrity_Tracking_Spec.md` v1.0
- **Primary Mission**: Build a production enterprise **Tracker + CRM + PRM** that eliminates "data flux" (any silent change, loss, duplication, or drift of a record between people, systems, or time).
- **Scope**: iGV first (programme = `GV`). `GTa`/`GTe` supported by the same unified schema behind a feature flag.
- **Governing Sources**:
  - `S0`: iCX Master Resource Directory
  - `S1`: 3.8 iCX Standards Delivery (Exchange Standards #1–#16)
  - `S2`: ECBA 2026 · EP Status: Breaks, Early FI, Late FI
  - `S3`: ECBA 2026 · Executing the ICB Audit Check & Unfreezing (13 audit documents)
  - `S4`: ECBA 2026 · Setting the Bar: CS Minimums & Extramiles
  - `S5`: 4.3 Partner Management (Partner Standards #1–#8)
  - `S6`: 2.5 Supply & Demand (IR clustering, IR plan, E2E analytics)
  - `S7`: 3.5 iGV Sales (Funnel conversions, buyer personas, GV criteria)
  - `S8`: 3.7 iCX Synergy Management (RACI matrices & cross-functional handoffs)
  - `S9`: ECBA 2026 · Navigating APIP & AEPP (Freeze clauses, ECB report deadlines)

---

## High-Level Outcomes (G1–G7)

| ID | Outcome | How Proven |
|---|---|---|
| **G1** | **No record is ever lost** | Soft-delete only (`deleted_at`), append-only history, nightly snapshots, import row-count drop guard |
| **G2** | **Every record has an accountable owner** | `owner_id` mandatory; DQ-010/DQ-011 blockers prevent unowned records |
| **G3** | **Tracker agrees with EXPA on status and dates** | Automated reconciliation job + DQ-040..042 discrepancy handlers |
| **G4** | **Every deadline is computed from policy, not memory** | Nightly deadline engine (§8) computing T-7, T-2, T-0, and overdue alerts |
| **G5** | **Handoff between stakeholders loses nothing** | Auto-generated Handoff Packet JSON + printable view + acknowledgement gate (§12) |
| **G6** | **Rule changes do not corrupt historical data** | Versioned rule registry (§3.4) with `effective_from` / `effective_to` dates |
| **G7** | **Leadership sees data health at a glance** | Integrity Console (§14) with Data Health Score (0–100) and 14 drill-down charts |

---

## Non-Negotiable Integrity Invariants (INV-01–INV-11)

- **INV-01**: **No hard deletes.** Delete sets `deleted_at` + `deleted_reason` + actor. Trigger/API blocks physical `DELETE`.
- **INV-02**: **Append-only history.** Status changes and audit events write only new immutable rows (`status_history`, `audit_log`).
- **INV-03**: **Every record has an active `owner_id`.** Mandatory foreign key; deactivated owners trigger auto-handoff tasks.
- **INV-04**: **EXPA is source of truth for status and dates; Tracker is source of truth for operations.** Tracker owns proofs, standards tracking, partner relations, and quality cases.
- **INV-05**: **EP-reported answers are immutable.** Write-once, import-only YOP/survey responses (never altered by AIESEC).
- **INV-06**: **One EP per request/ticket.** Hard constraint on status change requests.
- **INV-07**: **Frozen entity cannot process exchange operations.** `entity.is_frozen` blocks APD processing; ICB reference required.
- **INV-08**: **Rules are versioned.** No hard-coded business policy numbers; all read from `rule_registry`.
- **INV-09**: **Every change is attributable.** Comprehensive `audit_log` capturing actor, table, before/after JSON, and timestamp.
- **INV-10**: **Customer data is confidential.** Strict RBAC, PII redaction for non-owners, and mandatory export logging.
- **INV-11**: **No scattered sheets / no WhatsApp-only cases.** All customer issues exist only when timestamped in `case_quality`.

---

## System Architecture & Technical Stack

- **Frontend & App Framework**: Next.js 14 App Router, TypeScript, React 18, Tailwind CSS.
- **UI Kit & Design Language**: Xenon UI Kit (`@xenon-kit/web` + `@phosphor-icons/react`) adhering to [AGENTS.md](file:///c:/Users/HP/Desktop/ERP/AGENTS.md): 1px hairlines, no artificial drop-shadows or gradients, high-contrast tabular typography (`tabular-nums`), and restrained styling.
- **Data Visualizations**: High-performance interactive Nivo chart library (`@nivo/bar`, `@nivo/line`, `@nivo/funnel`).
- **Backend & Database**: PostgreSQL / Supabase, Row Level Security (RLS), triggers, automated backups.
- **Validation & Integrity**: Zod schemas, automated nightly DQ scan engine (DQ-001..DQ-084).
- **Test Infrastructure**: Vitest test suites (ensuring 100% pass on all 20 acceptance tests T-01..T-20) and Playwright E2E.
