# AIESEC iCX Command Center

## What This Is

The **AIESEC iCX Command Center** is a unified, high-reliability enterprise operating platform and pipeline management system built for AIESEC in Rabat, Morocco. It manages the complete Incoming Exchange (iCX) ecosystem across Incoming Global Volunteer (iGV), Incoming Global Talent (iGTa), and Incoming Global Teacher (iGTe) products. It integrates local B2B partner acquisition, international relations (IRM), opportunity slot provisioning, EP attraction and screening, matching, exchange preparation and delivery, customer experience standards (CXP), and operational finance/legalities into a role-governed, auditable single source of truth.

## Core Value

A zero-leakage, role-enforced operational single source of truth that powers the two-sided incoming exchange lifecycle—guaranteeing strict data protection, auditable human-in-the-loop AI governance, distinct product-specific workflows, and deterministic adherence to AIESEC Exchange Standards and local host legalities.

## Business Context

- **Customer**: AIESEC in Rabat executive leadership, portfolio managers, team leaders, and operational members across iGV, iGTa, iGTe, B2B/PRM, IRM, CXP, and Finance.
- **Revenue model**: Opportunity fees, local project sponsorships, and enterprise internship partner contributions.
- **Success metric**: 100% data integrity, zero unapproved status/financial mutations, sub-48h SLA response times, and 16/18+ exchange standards delivery with 100% mandatory compliance.
- **Strategy notes**: Master Product Specification: `ICX_Command_Center_Master_Specification_Antigravity.md`.

## Requirements

### Validated

- [x] Clean project workspace prepared with preservation of master spec, GSD runtime, and skill registry.

### Active

- [ ] **FOUNDATION**: SvelteKit + Svelte 5 + TypeScript web application and Python + FastAPI modular monolith with PostgreSQL, pgvector, and Redis.
- [ ] **AUTH & RBAC**: Session/JWT authentication with multi-role access control (BD, IR, EP Manager, CX, TL, LCVP iCX, LCVP FnL, LCP/Admin) and record-level authorization.
- [ ] **PRM**: B2B local partner pipeline (`Suspect → Qualified → Contacted → Meeting → Proposal → Negotiation → Contract → Active Account`), BANT qualification, contacts, proposals, and contract versioning.
- [ ] **IRM**: International Relations directory of foreign Sending Entities (MC/LCs), engagement tracking, visa feasibility registry, and EP pipeline commitments.
- [ ] **OPPORTUNITIES**: Opportunity builder and slot provisioning with distinct product rules (iGV social impact, iGTa professional internships, iGTe accredited teaching).
- [ ] **CRM & APPLICATIONS**: EP profile directory with PII masking, application queue, candidate screening, interview tracking, and slot capacity concurrency controls.
- [ ] **MATCHING & APPROVAL**: Strict 9-stage matching workflow separating local readiness from official EXPA `APD` status.
- [ ] **EXCHANGE OPERATIONS**: Preparation checklists, arrival logistics, accommodation board, worksite onboarding, and exception handling (Break, Early FI, Late FI).
- [ ] **CXP & STANDARDS**: 18 Exchange Standards tracking with 13 mandatory gates, 10 Partner Standards, survey tracking, and NPS.
- [ ] **FINANCE & LEGALITIES**: Deterministic pricing rulesets, payment milestone tracking, IAC audit readiness, and compliance vault.
- [ ] **AI & AGENTS**: LangGraph multi-agent system (EP Screening, Partner Intelligence, IR Intelligence, Risk Auditor, Policy Assistant, KPI Analyst, Orchestrator) with typed tools and strict human-in-the-loop approval gates.
- [ ] **DURABLE WORKFLOWS**: Temporal workflow automation for SLA clocks, reminder cascades, and background reconciliation.
- [ ] **EXPA ADAPTER**: Isolated sync adapter with read synchronization, manual CSV reconciliation fallback, and gated write operations.
- [ ] **ANALYTICS & KPI**: High-density operational dashboards with small-sample warnings, funnel metrics, and SLA monitoring.

### Out of Scope

- **React / React UI Libraries**: Explicitly forbidden by architecture contract; only SvelteKit + Svelte 5 is permitted.
- **Microservices / Kubernetes / Kafka**: Prohibited in v1; modular monolith architecture is mandatory.
- **Autonomous Consequential AI Actions**: AI agents are strictly forbidden from independently accepting/rejecting EPs, modifying EXPA statuses, waiving standards, or approving financial transactions.
- **Direct EXPA Status Mutation without Validation**: Local tasks must never automatically mutate official EXPA records.
- **Hardcoded Policy Conflicts**: Unverified policy differences (16 vs 18 standards, EAR 21st vs 28th, Rabat pricing defaults) must remain configurable and marked `[UNKNOWN]` or `[INFERRED]`.

## Context

- Operates in the context of AIESEC in Rabat (Morocco).
- Technical stack: SvelteKit, Svelte 5, TypeScript, Tailwind CSS, Bits UI, GSAP, Apache ECharts, Python 3.14, FastAPI, Pydantic, PostgreSQL, pgvector, Redis, LangGraph, Temporal.
- Raw EXPA reference datasets preserved in `fixtures/` for schema alignment and synthetic seed fixtures.

## Constraints

- **Tech Stack**: SvelteKit + Svelte 5 + TypeScript frontend; FastAPI + PostgreSQL backend; No React.
- **Security & Privacy**: PII masking for passports/contacts, signed private storage URLs for sensitive documents, append-only audit trail.
- **Policy Governance**: Five evidence tiers (`[VERIFIED]`, `[OBSERVED]`, `[INFERRED]`, `[RECOMMENDED]`, `[UNKNOWN]`). Never enforce inferred policies as hard rules.
- **AI Boundaries**: All consequential mutations require explicit human review in the Approval Center.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Clean Workspace Reset | Remove legacy Next.js / Supabase prototype and align 100% with SvelteKit + FastAPI master spec | ✓ Good |
| Modular Monolith | Prevents distributed microservice complexity while keeping clean domain boundaries | ✓ Good |
| SvelteKit + Svelte 5 | High performance, fine-grained reactivity (runes), clean DX, strict no-React compliance | ✓ Good |
| Dual-Status Architecture | Decouples local operational readiness (`READY`, `AT_RISK`) from official EXPA status (`APD`, `RE`) | ✓ Good |
| Human-in-the-Loop AI | Ensures strict governance: AI drafts and analyzes, humans approve consequential mutations | ✓ Good |

---
*Last updated: 2026-11-14 after workspace cleanup and GSD initialization*
