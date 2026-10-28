# AIESEC iCX ERP — Tracker-First Platform

## What This Is

An all-in-one operational tracking and enterprise resource planning application tailored for **AIESEC in Rabat** (`LC Rabat` · `MC Morocco`) and extensible across all Moroccan and international Local Committees. It replaces fragmented spreadsheets with an integrated, domain-native system covering B2B Partner CRM/PRM, Opportunity & Slot Capacity, EP Lifecycle & Dossiers, IR Partnerships, Exchange Delivery (18 Standards), Case Solving, Financial Tracking, and Department Task & Workload Management.

## Core Value

A reliable, table-first operational data workspace where every number reconciles to live underlying records, every stakeholder transition is bound by an explicit handoff contract, and no exchange participant or delivery deadline is lost.

## Business Context

- **Customer**: AIESEC in Rabat Executive Body, Team Leaders, and Members managing iGV, iGTa, and iGTe programs (expanding to Moroccan Local Committees).
- **Revenue model**: Non-profit youth leadership exchange operations; partner realization fees, sustainability margins, and compliance cost control.
- **Success metric**: 100% on-time delivery of 18 customer standards, zero double-booked accommodation slots, zero orphaned tasks during owner handoffs, and sub-100ms table-first navigation.
- **Strategy notes**: Governed strictly by the [AIESEC iCX ERP Tracker-First Master Specification](file:///c:/Users/HP/Desktop/ERP/AIESEC_iCX_ERP_Tracker_First_Master_Specification.md), AEPP (IPM 2024), APIP (EVLM Oct 2024), and AFPM (Aug 2022).

## Requirements

### Validated

(None yet — fresh tracker-first build baseline)

### Active

- [ ] **DATA-01**: PostgreSQL 16 schema with 54 normalized tables, multi-tenant `lc_id` isolation, and Row-Level Security (RLS).
- [ ] **DATA-02**: Append-only tamper-evident audit log with hash chaining (`prev_hash` → `hash`) and strict revocation of UPDATE/DELETE.
- [ ] **DATA-03**: PostgreSQL `btree_gist` exclusion constraints mathematically preventing overlapping check-in/out on accommodation beds.
- [ ] **UI-01**: Table-first operational interface across all entities with multi-column filtering, sort, column visibility, and saved views.
- [ ] **UI-02**: Standardized Record Detail Pages featuring Identity, State, Key Details, Relationships, Timeline, Next Actions, Evidence, and Audit.
- [ ] **CRM-01**: B2B Lead and Deal Pipeline tracking with 9 verified stages (`SM-01`), meeting logs, proposals, and contract attachments.
- [ ] **HANDOFF-01**: Atomic, non-negotiable stakeholder handoff protocol (`handoff_id`, dual-owner confirmation, transfer packet, escalation timer).
- [ ] **EP-01**: Comprehensive EP Dossier tracking screening, matching, visa status, realization, and departure milestones.
- [ ] **OPS-01**: 18 Exchange Standards delivery matrix (13 mandatory + 5 non-mandatory) with time-stamped proof links and SLA countdowns.
- [ ] **CASE-01**: Restricted Case Solving Vault with severity-based access, 3-tier escalation clocks, and Morrocan Law 09-08 compliance.
- [ ] **FIN-01**: Dual-approval financial transaction tracking, invoicing, deposit aging, and reserve fund reconciliation.
- [ ] **SYNC-01**: EXPA / GIS read-only background synchronization with idempotency keys and human-in-the-loop Action Outbox (`SM-09`).
- [ ] **ANALYTICS-01**: Live drill-down KPI dashboards where every aggregate metric links directly to its constituent filtered rows.

### Out of Scope

- **Public Blog / Marketing Content Portal**: Explicitly barred by specification §0. The system is an operational tracker, not a blog.
- **Direct Automated EXPA Mutation / API Writes**: Barred by architectural decision `DEC-003`. All external status writes route through the Human-in-the-Loop Action Outbox.
- **Spreadsheets as Production Database**: Barred by architectural decision `DEC-001`. PostgreSQL is the single authoritative system of record.
- **Client-Side Bypasses for Regulatory Rules**: Visa deadlines, dual-signature approvals, and accommodation constraints must be enforced at the database layer.

## Context

- Building from a unified 5,900-line master engineering baseline: `AIESEC_iCX_ERP_Tracker_First_Master_Specification.md`.
- Primary deployment environment: Next.js 14 App Router, TypeScript, PostgreSQL via Supabase, Tailwind CSS, Lucide icons.
- Strict Moroccan Law 09-08 personal data protection requires encrypting national ID, passport scans, and medical emergency details.

## Constraints

- **Tech stack**: Next.js App Router (React 18/19), TypeScript, Tailwind CSS, Supabase / PostgreSQL 16.
- **Aesthetics**: Premium, modern table-first interface with AIESEC Brand Palette (AIESEC Blue `#037EF3`, iGV Coral `#F85A40`, iGTa Teal `#0CB9C1`, iGTe Orange `#F48924`, Kasbah White, Slate `#2D3139`).
- **Data Integrity**: Zero tolerance for silent overwrites, unhandled race conditions, or orphaned tasks.
- **Security**: Strict Row-Level Security (RLS) enforcing `lc_id` tenancy and role-based permissions (Member, Team Leader, VP, LC President, Finance, Admin).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| `DEC-001`: PostgreSQL 16 over Google Sheets | Spreadsheets lack ACID transactions, exclusion constraints, and tamper-evident audit chains needed for international compliance. | ✓ Good |
| `DEC-002`: Tracker-First UI Architecture | Users are operations teams executing daily actions; card-only or blog-like UI degrades productivity. | ✓ Good |
| `DEC-003`: Human-in-the-Loop Action Outbox | EXPA API changes and unofficial write-endpoints present risk of unverified status desynchronization. | ✓ Good |
| `DEC-004`: Explicit Stakeholder Handoffs | Prevents the "owned by everybody = owned by nobody" trap during LC rotation and leadership turnover. | ✓ Good |

---
*Last updated: 2026-10-27 after baseline planning initialization*
