# Requirements: AIESEC iCX Command Center

**Defined:** 2026-11-14  
**Core Value:** A zero-leakage, role-enforced operational single source of truth that powers the two-sided incoming exchange lifecycle—guaranteeing strict data protection, auditable human-in-the-loop AI governance, distinct product-specific workflows, and deterministic adherence to AIESEC Exchange Standards and local host legalities.

## v1 Requirements

Requirements for initial release. Each maps directly to roadmap execution phases.

### Foundation & Authentication

- [ ] **AUTH-01**: User authentication via session/JWT with secure cookie storage and CSRF protection.
- [ ] **AUTH-02**: Role-Based Access Control (RBAC) supporting 8 roles: BD Member, IR Member, EP Manager, CX Member, Team Leader, LCVP iCX, LCVP FnL, and LCP/Admin.
- [ ] **AUTH-03**: Record-level access controls restricting sensitive EP fields (passport, contact) and external partner accounts.
- [ ] **AUTH-04**: Immutable append-only audit log tracking actor, timestamp, before/after values, and request correlation IDs.

### Partner Relationship Management (PRM)

- [ ] **PRM-01**: Organization directory with deduplication, legal entity types, sector, and contact directory.
- [ ] **PRM-02**: B2B partner lead pipeline (`Suspect → Qualified → Contacted → Meeting → Proposal → Negotiation → Contract Signed → Active Account`).
- [ ] **PRM-03**: BANT qualification framework (Budget, Authority, Needs, Timeline) with lead scoring.
- [ ] **PRM-04**: Meeting records, call logs, notes, and automated next-step follow-up tasks.
- [ ] **PRM-05**: Contract repository with versioning, document linking, signature tracking, and expiry alerts.

### International Relations Management (IRM)

- [ ] **IRM-01**: Global Sending Entity directory of Member Committees (MCs) and Local Committees (LCs).
- [ ] **IRM-02**: Supply & Demand (SnD) cluster categorization (Upscale, Grow, Invest, Understand) as configurable labels.
- [ ] **IRM-03**: Visa feasibility assessment registry with source citations, effective dates, and advisory disclaimers.
- [ ] **IRM-04**: IR partnership engagement logs, weekly active meeting notes, and EP pipeline commitments vs actual delivery.

### Opportunity & Slot Management

- [ ] **OPP-01**: Opportunity catalog tied to active authorized partner contracts with product discrimination (iGV, iGTa, iGTe).
- [ ] **OPP-02**: iGV validator: social impact project alignment, SDGs, strictly physical modality, 4-8 weeks duration, 25-40 hours/week, unpaid remuneration.
- [ ] **OPP-03**: iGTa validator: work-field taxonomy (BA, BD, MKT, IT, ENG, FIN, Other), modality tiers, 6-78 weeks duration, 35-45 hours/week, compensation validator.
- [ ] **OPP-04**: iGTe validator: educational institution accreditation check, teaching roles, mandatory salary validator for all durations.
- [ ] **OPP-05**: Opportunity slot and opening management with concurrency-safe capacity locks.
- [ ] **OPP-06**: Internal opportunity validation checklist required before publication readiness.

### CRM & Exchange Participant (EP) Management

- [ ] **CRM-01**: EP directory with masked PII view, home LC link, and product interest preferences.
- [ ] **CRM-02**: CV and sensitive document storage using private storage with short-lived signed URLs.
- [ ] **CRM-03**: Prescreening questionnaire engine and eligibility review verification.
- [ ] **CRM-04**: Duplicate EP candidate detection and record merge workflows.
- [ ] **CRM-05**: Communication timeline and SLA timers (e.g. 24-48h first-contact clock).

### Application & Matching Lifecycle

- [ ] **APP-01**: Decoupled application records linking EP to specific opportunity slot.
- [ ] **APP-02**: 9-stage screening flow: `Applied → Contacted → Screening → Shortlisted → Sent to OP → Interview → OP Decision → Accepted → Approved`.
- [ ] **APP-03**: OP candidate forwarding and interview feedback recording.
- [ ] **APP-04**: Acceptance Note upload and Sending Entity (SE) payment proof verification.
- [ ] **APP-05**: Dual status separation: Official EXPA status (`APP`, `ACC`, `APD`, etc.) vs Local Operational Readiness (`READY`, `AT_RISK`, `DONE`).
- [ ] **APP-06**: Exception handling for applicant withdrawals, rejections, and break requests.

### Exchange Operations & Delivery

- [ ] **EXC-01**: Exchange operational record spawned upon approved match.
- [ ] **EXC-02**: Modality-aware pre-arrival checklists (physical arrival logistics vs remote onboarding setup).
- [ ] **EXC-03**: Arrival coordination board: flight details, airport pickup, and local transport.
- [ ] **EXC-04**: Accommodation management board: host assignment, inventory, and safety checks.
- [ ] **EXC-05**: Worksite readiness verification, Incoming Preparation Seminar (IPS), and line manager onboarding.
- [ ] **EXC-06**: Incident reporting, early finish, late finish, and break case escalation workflows.

### Customer Experience & Standards (CXP)

- [ ] **CXP-01**: 18 Exchange Standards tracking engine with 13 mandatory standards gates.
- [ ] **CXP-02**: Standards evidence vault with document uploads, verification timestamps, and reviewer notes.
- [ ] **CXP-03**: 10 Partner Standards tracking and alignment review checkpoints.
- [ ] **CXP-04**: Partner closing debrief and EP satisfaction / Net Promoter Score (NPS) tracking.
- [ ] **CXP-05**: Deterministic completion readiness calculator requiring 16/18+ standards and 100% mandatory compliance.

### Operational Finance & Legalities

- [ ] **FNL-01**: Deterministic pricing rulesets and fee calculator for iGV project fees and iGT pricing tiers.
- [ ] **FNL-02**: Payment milestone tracker with expected amounts, due dates, proof of payment, and receipt logging.
- [ ] **FNL-03**: Financial approval queue requiring authorized role sign-off for fee waivers, refunds, and Annex 2 cases.
- [ ] **FNL-04**: Internal Audit Committee (IAC) legal compliance document repository and audit readiness checklist.
- [ ] **FNL-05**: Operational risk register with probability, impact scoring, and mitigation owners.

### AI Architecture & Human-in-the-Loop Governance

- [ ] **AI-01**: LangGraph multi-agent orchestration infrastructure with typed tools and model gateway.
- [ ] **AI-02**: EP Screening Assistant: summarizes candidate profiles, evaluates JD fit, suggests interview questions, zero autonomous accept/reject.
- [ ] **AI-03**: Partner & IR Intelligence Assistants: drafts outreach messages, summarizes public company data, highlights market opportunities.
- [ ] **AI-04**: Exchange Risk & Standards Auditor: flags missing standards evidence, overdue SLA tasks, and preparation risks.
- [ ] **AI-05**: Policy & Legal Knowledge Assistant: RAG knowledge search with mandatory document/version citations and evidence labeling (`[VERIFIED]`, etc.).
- [ ] **AI-06**: Approval Center: explicit human approval gate for all consequential actions (status mutations, communications, financial changes).

### Durable Workflows & Automation

- [ ] **TEM-01**: Temporal workflows for operational SLA timers (first contact, OP feedback, pre-arrival confirmation).
- [ ] **TEM-02**: Automated milestone reminders and deadline warning cascades.
- [ ] **TEM-03**: Idempotent activity execution ensuring zero duplicated notifications on retries.

### Integrations & External Synchronization

- [ ] **EXP-01**: EXPA/GIS sync adapter with read synchronization for opportunities, applications, and statuses.
- [ ] **EXP-02**: CSV and XLSX bulk import engine with column mapping, duplicate detection, and dry-run validation.
- [ ] **EXP-03**: Manual data reconciliation console for resolving EXPA vs local discrepancy mismatches.
- [ ] **EXP-04**: Gated mutation adapter requiring human approval before pushing changes to EXPA.

### Analytics, Dashboards & UI/UX

- [ ] **ANA-01**: Role-specific Command Center home with personal task queues, priority alerts, and team workload board.
- [ ] **ANA-02**: Full EP funnel analytics (`APP → ACC → APD → RE → FI → CO`) with conversion rates and stage durations.
- [ ] **ANA-03**: High-density operational data tables with sorting, filtering, saved views, and column customization.
- [ ] **ANA-04**: Small-sample warnings and clear metric definitions on all charts and KPI cards.
- [ ] **UIX-01**: SvelteKit + Svelte 5 frontend with Tailwind CSS and accessible Bits UI primitives.
- [ ] **UIX-02**: Premium dark-first enterprise visual design with a complete light mode toggle.
- [ ] **UIX-03**: Responsive layout optimized for desktop, tablet, and mobile field operations.
- [ ] **UIX-04**: WCAG 2.1 AA accessibility compliance, keyboard navigation, and reduced-motion support.

---

## v2 Requirements

Deferred to future releases:
- **WHATSAPP-01**: Official WhatsApp Business API messaging integration.
- **CAL-01**: Two-way Google Calendar synchronization for interview scheduling.
- **DOCUSIGN-01**: Automated e-signature provider integration for B2B contracts.

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| React / Next.js Components | Strictly prohibited by architecture contract; SvelteKit is mandatory |
| Microservices / Kafka | Prohibited in v1; Modular monolith fulfills all performance and reliability requirements |
| Autonomous AI Mutations | AI must never autonomously accept/reject EPs, alter EXPA statuses, or execute financial transactions |
| Direct Scraping of EXPA | Violation of security and platform governance; only sanctioned API or CSV fallback is permitted |
| Hardcoded Unverified Policies | Policy conflicts must remain configurable with evidence labeling |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01..04, UIX-01..04 | Phase 1: Foundation & Application Shell | Pending |
| PRM-01..05, FNL-04..05 | Phase 2: Organizations, PRM & Contracts | Pending |
| OPP-01..06, IRM-01..04 | Phase 3: Opportunities, Products & IRM | Pending |
| CRM-01..05, APP-01..06, EXP-02 | Phase 4: CRM, Applications & Matching | Pending |
| EXC-01..06, CXP-01..05 | Phase 5: Exchange Operations & CXP | Pending |
| FNL-01..03, ANA-01..04 | Phase 6: Finance & Operational Analytics | Pending |
| AI-01..06 | Phase 7: LangGraph AI & Approval Center | Pending |
| TEM-01..03, EXP-01..04 | Phase 8: Temporal & EXPA Integration | Pending |
| System Verification & Rollout | Phase 9: E2E Verification & Deployment | Pending |

**Coverage:**
- v1 requirements: 60 total
- Mapped to phases: 60 (100%)
- Unmapped: 0

---
*Requirements defined: 2026-11-14*
