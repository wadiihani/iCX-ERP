# Roadmap: AIESEC iCX Command Center

## Overview

The AIESEC iCX Command Center roadmap establishes a structured engineering path from foundational monorepo setup to a complete, tested, and deployable enterprise operational platform. Built on SvelteKit + Svelte 5 (strictly no React) and Python FastAPI with PostgreSQL, each phase delivers a coherent, verified vertical slice with complete frontend, backend, database persistence, domain validation, and test coverage.

## Phases

- [ ] **Phase 1: Foundation, Application Shell & Authentication** - Monorepo architecture, FastAPI backend foundation, PostgreSQL schema, SvelteKit + Svelte 5 application shell with dark/light theme, RBAC, and audit trail.
- [ ] **Phase 2: Organizations, PRM & Contracts** - B2B partner acquisition pipeline, organization directory, BANT qualification, contact management, and versioned contract repository.
- [ ] **Phase 3: Opportunities, Products (iGV/iGTa/iGTe) & IRM** - Opportunity builder, product-specific validators, capacity-controlled slots, IR Sending Entity directory, and visa feasibility register.
- [ ] **Phase 4: CRM, Applications & Matching Engine** - EP directory with PII masking, 9-stage application screening workflow, OP interview recording, dual-status state machine, and CSV/XLSX import engine.
- [ ] **Phase 5: Exchange Operations & Customer Experience (CXP)** - Exchange operational milestones, accommodation & arrival logistics board, 18 Exchange Standards with 13 mandatory gates, 10 Partner Standards, and deterministic completion calculation.
- [ ] **Phase 6: Operational Finance, Legalities & Command Center Analytics** - Deterministic pricing calculators, payment milestone tracking, financial approval queue, IAC audit readiness, and dense operational analytics dashboards.
- [ ] **Phase 7: LangGraph AI Architecture & Approval Center** - Multi-agent LangGraph system, pgvector RAG knowledge vault, specialized copilots (EP screening, partner/IR intelligence, risk auditing), and human-in-the-loop Approval Center.
- [ ] **Phase 8: Temporal Durable Workflows & EXPA Sync Adapter** - Temporal workflows for SLA timers and cascades, isolated EXPA sync adapter, and data reconciliation console.
- [ ] **Phase 9: End-to-End Verification, Security Hardening & Production Deployment** - Full acceptance test suite, synthetic data seeding, security audits, Docker deployment configuration, and operational handover documentation.

---

## Phase Details

### Phase 1: Foundation, Application Shell & Authentication
**Goal**: Establish the monorepo, FastAPI backend core, PostgreSQL migrations, SvelteKit + Svelte 5 frontend with Tailwind CSS and Bits UI, JWT/session authentication, RBAC, and append-only audit logging.
**Depends on**: Nothing
**Requirements**: [AUTH-01, AUTH-02, AUTH-03, AUTH-04, UIX-01, UIX-02, UIX-03, UIX-04]
**Success Criteria**:
  1. Frontend (SvelteKit + Svelte 5) and backend (FastAPI) start cleanly in development mode with zero React dependencies.
  2. PostgreSQL connection and baseline migrations execute successfully with UUID keys and audit tables.
  3. User can sign in, receive a secure session/JWT, and access role-gated routes based on their assigned role.
  4. Application shell renders a modern dark-first theme with a functional light mode toggle, collapsible navigation, and responsive mobile layout.
**Plans**: 3 plans
- [ ] 01-01: Monorepo scaffolding, FastAPI backend setup, database migration engine, and base schema.
- [ ] 01-02: Authentication system, JWT/session middleware, RBAC engine, and append-only audit logging.
- [ ] 01-03: SvelteKit + Svelte 5 application shell, Tailwind tokens, Bits UI primitives, navigation, and theme provider.

### Phase 2: Organizations, PRM & Contracts
**Goal**: Deliver the B2B partner relationship management system for local hosting companies and NGOs, including pipeline tracking, BANT qualification, contact management, and contracts.
**Depends on**: Phase 1
**Requirements**: [PRM-01, PRM-02, PRM-03, PRM-04, PRM-05, FNL-04, FNL-05]
**Success Criteria**:
  1. BD members can create organizations, manage multiple contacts, and track leads through all 8 pipeline stages.
  2. BANT qualification framework calculates lead qualification status and highlights missing parameters.
  3. Contracts can be drafted, linked to organizations, versioned with terms, and monitored for expiration.
  4. All partner mutations produce immutable audit log entries and update team workload views.
**Plans**: 3 plans
- [ ] 02-01: Organization and contact data models, repositories, and FastAPI REST endpoints.
- [ ] 02-02: PRM pipeline management, BANT qualification logic, meeting notes, and follow-up task generator.
- [ ] 02-03: Contract repository, document metadata linking, versioning, and Svelte 5 PRM dashboard views.

### Phase 3: Opportunities, Products (iGV/iGTa/iGTe) & IRM
**Goal**: Implement the opportunity builder with distinct product-specific validations, capacity-locked slots, and the International Relations Management (IRM) subsystem.
**Depends on**: Phase 2
**Requirements**: [OPP-01, OPP-02, OPP-03, OPP-04, OPP-05, OPP-06, IRM-01, IRM-02, IRM-03, IRM-04]
**Success Criteria**:
  1. Opportunities can only be created against active, valid partner contracts.
  2. Distinct validation rules prevent cross-product leakage: iGV enforces unpaid/physical, iGTa enforces salary/accommodation tiers, iGTe enforces accredited education institutions and mandatory salary.
  3. Opportunity slots prevent overbooking under concurrent access via database locking.
  4. IR directory catalogs foreign Sending Entities (MC/LCs), SnD clusters, and sourced visa feasibility notes.
**Plans**: 3 plans
- [ ] 03-01: Opportunity and slot database models with product sub-type tables and concurrency controls.
- [ ] 03-02: Product rules engine enforcing iGV, iGTa, and iGTe validation invariants.
- [ ] 03-03: IRM module for Sending Entities, SnD clustering, visa feasibility, and opportunity promotion tracking.

### Phase 4: CRM, Applications & Matching Engine
**Goal**: Build the EP directory with privacy protection, the 9-stage application screening workflow, OP interview feedback, and the dual-status state machine.
**Depends on**: Phase 3
**Requirements**: [CRM-01, CRM-02, CRM-03, CRM-04, CRM-05, APP-01, APP-02, APP-03, APP-04, APP-05, APP-06, EXP-02]
**Success Criteria**:
  1. EP profiles display masked sensitive fields (passports, phones) to unauthorized roles, with short-lived signed URLs for CVs.
  2. Candidate applications advance through the 9 screening stages with SLA timer tracking.
  3. Acceptance Notes and Sending Entity payment proofs can be verified and approved.
  4. Official EXPA status remains strictly decoupled from local operational readiness.
  5. Bulk CSV/XLSX import engine parses legacy sheets and EXPA exports with dry-run validation.
**Plans**: 3 plans
- [ ] 04-01: EP data models, PII masking service, document storage, and CSV/XLSX import engine.
- [ ] 04-02: Application workflow, 9-stage screening engine, SLA timers, and OP interview portal.
- [ ] 04-03: Matching engine, Acceptance Note tracking, and dual-status state machine.

### Phase 5: Exchange Operations & Customer Experience (CXP)
**Goal**: Deliver operational exchange delivery management, arrival and accommodation boards, 18 Exchange Standards tracking, 10 Partner Standards, and completion readiness calculations.
**Depends on**: Phase 4
**Requirements**: [EXC-01, EXC-02, EXC-03, EXC-04, EXC-05, EXC-06, CXP-01, CXP-02, CXP-03, CXP-04, CXP-05]
**Success Criteria**:
  1. Approved matches automatically instantiate an operational Exchange record with modality-specific checklists.
  2. Arrival logistics and accommodation boards provide real-time status of pickups and bed assignments.
  3. Exchange Standards tracking verifies evidence for all 18 standards and enforces 13 mandatory standards gates.
  4. Completion readiness is deterministically calculated; AI is prevented from marking completion autonomously.
  5. Exception workflows handle early/late finishes, break requests, and partner non-compliance.
**Plans**: 3 plans
- [ ] 05-01: Exchange lifecycle records, modality checklists, and incident/break case workflows.
- [ ] 05-02: Logistics boards for airport pickups, transport, and accommodation inventory management.
- [ ] 05-03: CXP standards engine (18 Exchange Standards, 10 Partner Standards), evidence vault, and completion calculator.

### Phase 6: Operational Finance, Legalities & Command Center Analytics
**Goal**: Build deterministic pricing calculators, payment milestone tracking, financial approval controls, and role-specific Command Center analytics dashboards.
**Depends on**: Phase 5
**Requirements**: [FNL-01, FNL-02, FNL-03, ANA-01, ANA-02, ANA-03, ANA-04]
**Success Criteria**:
  1. Pricing calculator accurately computes iGV fees and iGT duration-tiered pricing formulas without LLM involvement.
  2. Payment milestones track expected vs received amounts with receipt logging and overdue alerts.
  3. Financial approval queue prevents unauthorized fee waivers or refund disbursements.
  4. Role-specific dashboards display personal tasks, EP funnel conversion (`APP → CO`), and SLA compliance with small-sample warnings.
**Plans**: 3 plans
- [ ] 06-01: Financial pricing engine, payment milestone tracking, and role-protected approval queue.
- [ ] 06-02: Operational risk register, IAC compliance audit checklists, and legal document tracking.
- [ ] 06-03: Command Center home, dense operational tables, funnel analytics, and Apache ECharts integration.

### Phase 7: LangGraph AI Architecture & Approval Center
**Goal**: Implement the multi-agent LangGraph system with pgvector RAG, typed tool registry, and a dedicated human-in-the-loop Approval Center.
**Depends on**: Phase 6
**Requirements**: [AI-01, AI-02, AI-03, AI-04, AI-05, AI-06]
**Success Criteria**:
  1. LangGraph orchestrator routes requests to specialized agents (EP Screening, Partner Intel, IR Intel, Risk Auditor, Policy Assistant, KPI Analyst).
  2. Policy Assistant retrieves official documents with citations, version tags, and evidence labels (`[VERIFIED]`, etc.).
  3. Agents call typed, permission-checked tools; raw SQL or unrestricted ORM access is strictly blocked.
  4. Approval Center captures all consequential AI proposals (status changes, emails, financial waivers) and requires explicit human sign-off.
**Plans**: 3 plans
- [ ] 07-01: LangGraph infrastructure, model gateway, typed tool registry, and run observability.
- [ ] 07-02: pgvector RAG knowledge ingestion pipeline and Policy Assistant with citation grounding.
- [ ] 07-03: Specialist copilot agents (EP screening, partner/IR intel, risk auditor) and the human-in-the-loop Approval Center UI.

### Phase 8: Temporal Durable Workflows & EXPA Sync Adapter
**Goal**: Implement Temporal durable workflows for reliable timers and cascades, and build the isolated EXPA sync adapter with reconciliation console.
**Depends on**: Phase 7
**Requirements**: [TEM-01, TEM-02, TEM-03, EXP-01, EXP-03, EXP-04]
**Success Criteria**:
  1. Temporal workflows manage SLA clocks (first contact 24-48h, OP review 3 days) with idempotent activity retries.
  2. Pre-arrival and standards checkpoint reminder cascades fire reliably across system restarts.
  3. EXPA sync adapter fetches external records into local staging tables with conflict detection.
  4. Data reconciliation console allows operators to review and resolve local vs EXPA mismatches.
  5. Direct EXPA write mutations remain strictly gated by human approval.
**Plans**: 2 plans
- [ ] 08-01: Temporal workflow engine, activity definitions, SLA timers, and automated reminder cascades.
- [ ] 08-02: EXPA sync adapter, webhook/polling ingestion, reconciliation console, and gated mutation handler.

### Phase 9: End-to-End Verification, Security Hardening & Production Deployment
**Goal**: Execute comprehensive automated testing across all 12 master specification journeys, seed realistic synthetic data, perform security audits, and package with Docker Compose.
**Depends on**: Phase 8
**Requirements**: [All requirements verification]
**Success Criteria**:
  1. All 12 end-to-end operational journeys pass automated verification using synthetic fixtures.
  2. Security audit confirms PII masking, authorization denial on restricted resources, and audit logging.
  3. Realistic synthetic seed data populates all modules for demonstration and testing.
  4. Production-ready Docker Compose configuration builds and runs web, API, PostgreSQL, Redis, and Temporal.
  5. Operational documentation, policy registers, and API references are complete in `docs/`.
**Plans**: 2 plans
- [ ] 09-01: Master E2E acceptance test suite covering all 12 operational journeys with synthetic data.
- [ ] 09-02: Docker containerization, security hardening, documentation generation, and release packaging.

---

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation, Application Shell & Authentication | 0/3 | In progress | - |
| 2. Organizations, PRM & Contracts | 0/3 | Not started | - |
| 3. Opportunities, Products (iGV/iGTa/iGTe) & IRM | 0/3 | Not started | - |
| 4. CRM, Applications & Matching Engine | 0/3 | Not started | - |
| 5. Exchange Operations & Customer Experience (CXP) | 0/3 | Not started | - |
| 6. Operational Finance, Legalities & Command Center Analytics | 0/3 | Not started | - |
| 7. LangGraph AI Architecture & Approval Center | 0/3 | Not started | - |
| 8. Temporal Durable Workflows & EXPA Sync Adapter | 0/2 | Not started | - |
| 9. End-to-End Verification, Security Hardening & Production Deployment | 0/2 | Not started | - |

### Phase 10: foundation application shell and authentication

**Goal:** [To be planned]
**Requirements**: TBD
**Depends on:** Phase 9
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 10 to break down)

---
*Roadmap defined: 2026-11-14*
