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

- [x] **Milestone 1**: Tracker-First Platform baseline, PostgreSQL schema, core UI tables, initial deal and slot records, and Phase 10 Command Dashboard.

### Active (Milestone 2: Vercel Audit & Core Architectural Overhaul)

- [ ] **CHG-SEC01**: Global 4-Group Left Sidebar Navigation, Clean Top Header, and Sticky Context Filter Bar (`CHG-01` – `CHG-05`).
- [ ] **CHG-SEC02**: 9-Card Clickable Command Dashboard with zero redundant CTAs, dynamic subtitles, and real funnel math (`CHG-06` – `CHG-12`).
- [ ] **CHG-SEC03**: Dedicated Member Engagement, 4-Tier Attendance, Governance Routines & Team Standards (`TeSt`) Module (`CHG-40` – `CHG-42`).
- [ ] **CHG-SEC04**: B2B Partner CRM, Multi-Contacts, 8-Stage Deal Stepper & Kanban/Table View (`CHG-13` – `CHG-19`).
- [ ] **CHG-SEC05**: Contracts (`MoUs`), Multi-Slot Waves, Product Rule Normalization & Dynamic Capacity (`CHG-20` – `CHG-24`).
- [ ] **CHG-SEC06**: EP Lifecycle, Relational Atomic Fields, Live Date-Math SLAs & 18 Standards Split (`CHG-25` – `CHG-31`).
- [ ] **CHG-SEC07**: IR Supply Quotas, Housing Bed Allocations, Airport Logistics, ECB Cases (`Annex 2`) & AFPM Invoicing (`CHG-32` – `CHG-39`).

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
