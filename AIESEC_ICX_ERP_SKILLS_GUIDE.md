# AIESEC iCX ERP — Agent Skills Architecture & Implementation Guide (v2.0.0 Baseline)
**Target Product:** Incoming Exchange (iCX) ERP — iGV, iGTa, iGTe (Physical, Partly Remote, Fully Remote)  
**First Deployment:** AIESEC in Rabat (`LC Rabat` · `MC Morocco`)  
**Authoritative Baseline:** [AIESEC_iCX_ERP_Master_Specification_v2.md](file:///c:/Users/HP/Desktop/ERP/AIESEC_iCX_ERP_Master_Specification_v2.md) (`v2.0.0 Consolidated Master Specification`)  
**Skills Discovery Ecosystem:** Open Agent Skills (`skills.sh` / `npx skills`)

---

## 1. Specification v2.0.0 Architectural Shift & Skills Mapping

The **Consolidated Master Specification v2.0.0** introduces critical architectural corrections over v1:
1. **Definitive Production Database (`DEC-001`):** Google Sheets as a production store is **strictly eliminated**. PostgreSQL 16 (managed, versioned migrations, transactional integrity, exclusion constraints, RLS) is mandatory from Day 1. Google Sheets is restricted solely to read-only exports and CSV import sources.
2. **Strict Verification & Epistemic Separation (§3):** Every threshold (`THR-001` to `THR-048`) and rule carries explicit status (`VERIFIED`, `CONFIRMED-LOCAL`, `SPEC-CLAIM`, `PROPOSED-DESIGN`, or `OPEN-BLOCKING`). Unverified thresholds warn or create tasks but **MUST NOT** trigger irreversible decisions (`REQ-009`).
3. **Controlled Scope & Scale:**
   - **116 Atomic Requirements** (`REQ-001` to `REQ-116`) across 15 Modules (A to O).
   - **54 Normalized Tables** in 3NF with tenant-level isolation (`lc_id`).
   - **10 Formal State Machines** (`SM-01` to `SM-10`).
   - **35 Automations** (`AUTO-001` to `AUTO-035`) with strict idempotency keys and timezone support (`Africa/Casablanca`).
   - **117 Rigorous Acceptance Tests** (`TEST-001` to `TEST-117`).
   - **6 Vertical Delivery Slices** (`S1` to `S6`) governed by Gates `G0` to `G9`.
   - **Zero Direct EXPA Mutations (`DEC-003`):** Read-only sync + Human-in-the-Loop Action Outbox (`SM-09`, `REQ-105`).

### High-Level Skills Matrix

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│             AIESEC iCX ERP v2.0.0: COMPONENT-TO-SKILL ARCHITECTURE                     │
├────────────────────────────────┬───────────────────────────────────────────────────────┤
│ ARCHITECTURAL SUBSYSTEM        │ SPECIALIZED AGENT SKILL                               │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ 1. Database & Persistence      │ • supabase/agent-skills@supabase-postgres-best-practices│
│    (54 Tables, RLS, Audit Chain)│ • supabase/agent-skills@supabase                       │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ 2. Frontend & State Machines   │ • vercel-labs/agent-skills@vercel-composition-patterns │
│    (10 SMs, 37 Screens SCR-01..37)• vercel-labs/agent-skills@vercel-react-best-practices │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ 3. Design System & WCAG 2.2 AA │ • anthropics/skills@frontend-design                    │
│    (Rabat Tokens, Contrast, UX) │ • vercel-labs/agent-skills@web-design-guidelines       │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ 4. Verification & Testing      │ • anthropics/skills@webapp-testing (Playwright)        │
│    (117 Tests: TEST-001 to 117)│                                                       │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ 5. Protected Documents & Vault │ • anthropics/skills@pdf                                │
│    (Signed MoUs, Visa, Cases)  │                                                       │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ 6. Data Migration & CSV Engine │ • anthropics/skills@xlsx                               │
│    (Rabat Leads, EXPA Fallback)│                                                       │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ 7. Ecosystem Package Manager   │ • vercel-labs/skills@find-skills (Installed)          │
└────────────────────────────────┴───────────────────────────────────────────────────────┘
```

---

## 2. In-Depth Skill Roles & Requirement Alignment

### 2.1 Database & Persistence Subsystem (PostgreSQL 16)

#### Skill 1: `supabase-postgres-best-practices`
- **Package Source:** `supabase/agent-skills@supabase-postgres-best-practices`
- **Installation:**
  ```bash
  npx skills add supabase/agent-skills --skill supabase-postgres-best-practices -y
  ```
- **Domain:** PostgreSQL 16 schema design, versioned declarative migrations, exclusion constraints, indexing, query execution planning, RLS security, and append-only tamper-evident logs.
- **Direct Role in v2.0.0 Specification:**
  - **Enforcing `DEC-001` (PostgreSQL from Day 1):** Eliminates fragile spreadsheet persistence in favor of robust ACID transactions, UUID primary keys, and `TIMESTAMPTZ` with `Africa/Casablanca` timezone handling.
  - **54 Normalized Tables (§8.2):** Guides relational integrity across all 54 tables spanning Core Governance (1–15), Stakeholders & CRM (16–23), IR & Applications (24–34), Logistics (35–40), Quality & Finance (41–46), Tasks & Integrations (47–54).
  - **Invariant `INV-01` (Bed Exclusion Constraints):** Implements PostgreSQL `btree_gist` exclusion constraints on `accommodation_allocations` to mathematically prevent overlapping check-in/check-out dates for the same bed (`TEST-057`, `REQ-060`).
  - **Invariant `INV-02` & `REQ-005` (Tamper-Evident Audit Chain):** Enforces append-only permissions on `audit_events` and `status_transitions` (revoking `UPDATE` and `DELETE` at the database level) and builds SHA-256 hash chaining (`prev_hash` → `hash`) tested in `TEST-005`.
  - **Tenant Isolation (`REQ-004`, `INV-05`):** Configures Row-Level Security (RLS) guaranteeing that queries and jobs strictly filter by validated `lc_id`, with cross-LC access attempts denied and logged without leaking entity existence (`TEST-004`).
  - **Law 09-08 Sensitive PII Protection (`REQ-006`, `REQ-050`):** Guides column-level encryption for restricted fields (`ep_profiles`, `accommodation_providers.full_address`) and logs access in `pii_access_events`.

#### Skill 2: `supabase`
- **Package Source:** `supabase/agent-skills@supabase`
- **Installation:**
  ```bash
  npx skills add supabase/agent-skills --skill supabase -y
  ```
- **Domain:** Managed backend runtime, Supabase Auth (Google OAuth `@aiesec.net`), Edge Functions, `pg_cron` scheduling, Realtime subscriptions, and storage policies.
- **Direct Role in v2.0.0 Specification:**
  - **Server-Side Authentication & NDA Gate (`REQ-001`, `REQ-002`):** Validates `@aiesec.net` Google OAuth logins and blocks all API functions until `nda_acceptances` is signed (`TEST-001`, `TEST-002`).
  - **Scheduled Automations Engine (`§12`):** Implements `pg_cron` jobs executing the 35 automations (`AUTO-001` to `AUTO-035`) with mandatory idempotency keys (`idempotency_key`) to eliminate duplicate alerts and tasks.
  - **Realtime Dashboard Updates (`§16`, `SCR-35`):** Pushes live updates to the 5 role dashboards (`Executive`, `External BD`, `Internal CXP`, `IR PRM`, `Finance`) when EXPA Read-Sync runs complete or deals change stage.
  - **Feature Flags Subsystem (`REQ-115`, `DEC-005`):** Provides dynamic switches (`feature_flags.multi_lc = false`, integration cut-offs) allowing immediate emergency disabling without redeploying code (`TEST-111`).

---

### 2.2 Frontend Architecture, State Machines & Screen Flows

#### Skill 3: `vercel-composition-patterns`
- **Package Source:** `vercel-labs/agent-skills@vercel-composition-patterns`
- **Installation:**
  ```bash
  npx skills add vercel-labs/agent-skills --skill vercel-composition-patterns -y
  ```
- **Domain:** Scalable React composition, compound component architecture, context boundaries, render props, and strict state decoupling.
- **Direct Role in v2.0.0 Specification:**
  - **10 Core State Machines (`§10`, `SM-01` to `SM-10`):** Implements compound components enforcing valid transitions and explicit error handling:
    - `SM-01`: B2B Deal Pipeline (9 stages: `LEAD` → `DISCOVERY` → `PROPOSAL` → `CONTRACT_SIGNED` / `CLOSED_LOST`).
    - `SM-02` & `SM-03`: Opportunity & Slot Lifecycles (read-only EXPA mirrors vs internal planning fields per `REQ-042`).
    - `SM-04` & `SM-05`: EP Internal Readiness (`APPLIED` → `HOST_SCREENING` → `OP_REVIEW` → `READY_FOR_APPROVAL` → `ARRIVAL_CLEARED` → `DAY1_DONE` → `FINISHED_DEBRIEFED`).
    - `SM-06`: Quality Cases (3-Stage escalation clocks).
    - `SM-07`: Partner Agreements (reviewers distinct from authors per `INV-06`).
    - `SM-08`: Operational Invoices (dual approval requirement per `REQ-087`).
    - `SM-09`: Integration Sync Runs & Action Outbox.
    - `SM-10`: User Onboarding & Term Role Lifecycle.
  - **37 Standardized Screens (`§16`, `SCR-01` to `SCR-37`):** Powers clean component isolation for screens including `Organization 360 Timeline` (`SCR-03`), `Arrival Readiness Board` (`SCR-23`), `18 Standards Evidence Matrix` (`SCR-27`), and `Harassment Vault` (`SCR-30`).
  - **Action Outbox Card Component (`REQ-105`, `SM-09`):** Builds human-in-the-loop action cards generating deep-links to EXPA with expiry (`THR-044`), awaiting read-back confirmation before advancing state.

#### Skill 4: `vercel-react-best-practices`
- **Package Source:** `vercel-labs/agent-skills@vercel-react-best-practices`
- **Installation:**
  ```bash
  npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices -y
  ```
- **Domain:** Next.js App Router performance, Server Components vs Client Components, bundle splitting, TanStack Query caching, and runtime latency.
- **Direct Role in v2.0.0 Specification:**
  - **Sub-100ms Executive Dashboard Performance:** Ensures fast server-side aggregation for the 16 KPIs (`KPI-01` to `KPI-16`) across thousands of synchronized application rows.
  - **Universal Screen States (`§16`):** Enforces standard states across all 37 screens: empty, loading, success, partial success, error, permission denied, and stale data (displaying last-sync timestamp and drift alerts per `REQ-096`).
  - **Optimistic UI with Conflict Detection (`REQ-104`):** Uses optimistic mutations for task snoozing, touchpoint logging, and deal movements with automatic rollback if reconciliation detects a conflict.

---

### 2.3 Visual Design System, Contrast & Accessibility

#### Skill 5: `frontend-design` & `web-design-guidelines`
- **Package Sources:** `anthropics/skills@frontend-design` & `vercel-labs/agent-skills@web-design-guidelines`
- **Installation:**
  ```bash
  npx skills add anthropics/skills --skill frontend-design -y
  npx skills add vercel-labs/agent-skills --skill web-design-guidelines -y
  ```
- **Domain:** Design token architecture, typography hierarchy, responsive mobile design, WCAG 2.2 AA accessibility audit, and intentional aesthetics.
- **Direct Role in v2.0.0 Specification:**
  - **AIESEC Brand Tokens & Rabat Local Aesthetics (`§16`):** Encodes official design tokens:
    - Primary Accents: AIESEC Blue (`#037EF3`), iGV Coral (`#F85A40`), iGTa Teal (`#0CB9C1`), iGTe Orange (`#F48924`).
    - Neutrals: Kasbah White (`#FFFFFF`), Soft Platinum (`#F3F4F7`), Slate Typography (`#2D3139`), Indigo (`#1E3A5F`).
  - **WCAG 2.2 AA Compliance (`TEST-113`):** Audits contrast ratios across all buttons, status badges, and chart legends; ensures full keyboard navigation and screen-reader accessibility.
  - **Responsive Layouts:** Guarantees every screen from `SCR-01` to `SCR-37` operates seamlessly down to standard mobile viewport widths (375px) for field volunteers conducting airport pickups or Day-1 OP accompaniment.

---

### 2.4 End-to-End Verification & Test Automation (117 Tests)

#### Skill 6: `webapp-testing`
- **Package Source:** `anthropics/skills@webapp-testing`
- **Installation:**
  ```bash
  npx skills add anthropics/skills --skill webapp-testing -y
  ```
- **Domain:** Playwright E2E browser automation, headless verification, responsive viewport testing, console log monitoring, and network mock/assertion.
- **Direct Role in v2.0.0 Specification:**
  - **Automating the 117 Test Catalogue (`TEST-001` to `TEST-117`):**
    - `TEST-001` & `TEST-002`: Google OAuth domain filtering and mandatory NDA acceptance.
    - `TEST-003` & `TEST-004`: Server-side RBAC matrix validation and cross-LC tenant isolation attempts.
    - `TEST-005`: Hash-chained audit log tampering detection.
    - `TEST-033` to `TEST-037`: Product boundary gates (iGV 6–8 wks, 25–40h, 70% funding; iGTa/iGTe zero EP fees; partly remote 13 wks & ≤50% remote).
    - `TEST-057`: Database rejection of overlapping bed reservations.
    - `TEST-059`: Pre-arrival lock blocking `ARRIVAL_CLEARED` if unconfirmed at T-14 days (`REQ-062`).
    - `TEST-065`: 18 Exchange Standards advisory `CO` evaluation (`13 Mandatory = Yes` AND `≥3 of 5 Non-Mandatory = Yes`).
    - `TEST-075`: Annex 2 draft salary delay fine calculation (2% daily fine after Day 30) and dismissal branch verification.
    - `TEST-076`: Harassment Vault RBAC isolation (blocking admin/member access).
    - `TEST-101`: Action Outbox expiry (`72h`) and read-back confirmation.
    - `TEST-113`: Automated WCAG 2.2 AA accessibility and mobile layout testing.

---

### 2.5 Document Repository, Legal Seals & Data Migration

#### Skill 7: `pdf`
- **Package Source:** `anthropics/skills@pdf`
- **Installation:**
  ```bash
  npx skills add anthropics/skills --skill pdf -y
  ```
- **Domain:** Programmatic PDF assembly, template merging, digital seal verification, text extraction, and form generation.
- **Direct Role in v2.0.0 Specification:**
  - **Protected Document Store (`REQ-028` to `REQ-033`):** Manages formal documents stored with SHA-256 integrity hashes (`hash`), version numbers, and signer evidence.
  - **Statutory Document Generators:**
    - 14-Day Post-APD Legal Pack (`AUTO-015`, `THR-014`): Official Visa Invitation Letter, Accommodation Attestation, and Expectation Setting Booklet.
    - Pre-filled Acceptance Note (`AN`) for EP digital sign-off (`REQ-056`).
    - Moroccan Partnership Agreements under Dahir 1958 and CGI Art. 57 / Art. 10-I-B-2°.
    - Annex 1 Harassment Committee signed 7-working-day final reports and Annex 9 Case Appeal dockets.

#### Skill 8: `xlsx`
- **Package Source:** `anthropics/skills@xlsx`
- **Installation:**
  ```bash
  npx skills add anthropics/skills --skill xlsx -y
  ```
- **Domain:** Spreadsheet workbook parsing, tabular schema mapping, CSV generation, data deduplication, and export generation.
- **Direct Role in v2.0.0 Specification:**
  - **Phase 1 Legacy Lead Migration (`REQ-020`, `TEST-020`):** Ingests Rabat's historical spreadsheets (`Prospection Partenaires iGV`, `Enablers CRM`) with dry-run previews, fuzzy deduplication, and rejection reports before committing to PostgreSQL.
  - **EXPA Bulk CSV Import / Fallback (`REQ-108`, `TEST-104`):** Ingests official EXPA CSV exports through the identical staging and reconciliation pipeline used by the GraphQL sync daemon.
  - **Full Data Export Exit Plan (`REQ-116`, `TEST-112`):** Generates complete, open-format tabular archives of all LC business data ensuring zero vendor lock-in.

---

### 2.6 Dynamic Discovery Subsystem (Installed)

#### Skill 9: `find-skills`
- **Package Source:** `vercel-labs/skills@find-skills` (Installed at `c:/Users/HP/Desktop/ERP/.agents/skills/find-skills`)
- **Direct Role in v2.0.0 Specification:**
  - Serves as the package discovery manager to search, evaluate, and install future community skills as new integration requirements emerge (e.g., official WhatsApp Cloud API, CNDP automated compliance scanners).

---

## 3. Recommended Installation Command Set

Run the following commands in the workspace root to install all required skills:

```bash
# 1. Database, Schema & Runtime (PostgreSQL 16 & Supabase)
npx skills add supabase/agent-skills --skill supabase-postgres-best-practices supabase -y

# 2. Frontend Component Architecture & Next.js Performance
npx skills add vercel-labs/agent-skills --skill vercel-composition-patterns vercel-react-best-practices -y

# 3. Visual Design System & Accessibility Compliance (WCAG 2.2 AA)
npx skills add anthropics/skills --skill frontend-design -y
npx skills add vercel-labs/agent-skills --skill web-design-guidelines -y

# 4. End-to-End Verification (117 Acceptance Tests)
npx skills add anthropics/skills --skill webapp-testing -y

# 5. Protected Documents & Tabular Data Migration Engine
npx skills add anthropics/skills --skill pdf xlsx -y
```

---

## 4. Delivery Slice Roadmap & Skill Utilization

In compliance with **Section 5 (Delivery Slices)** and **Section 21 (Rules for AI Coding Agents)**:

| Slice | Scope & Deliverables | Primary Skills Leveraged | Release Gate & Key Test Coverage |
| :--- | :--- | :--- | :--- |
| **S1: Foundation + iGV Partner-to-Opportunity** | Modules A, B, C, D (core), E (iGV); 54 tables schema; RBAC; audit log hash-chaining; CSV import wizard; B2B deal pipeline. | `supabase-postgres-best-practices`, `supabase`, `vercel-composition-patterns`, `xlsx` | **G0–G3 Passed**; `TEST-001` to `TEST-040`, `TEST-105`, `TEST-111`. |
| **S2: EXPA Read-Sync, EP Funnel & SLA Engine** | Modules N, F, G (funnel), L (tasks); Action Outbox; 35 automations; IR directory; 5 role dashboards. | `supabase`, `vercel-react-best-practices`, `vercel-composition-patterns` | **G4–G5 Passed**; `TEST-041` to `TEST-055`, `TEST-086` to `TEST-104`. |
| **S3: Arrival Readiness, Accommodation & 18 Standards** | Modules H, I; Bed exclusion constraints; 14-day pre-arrival lock; 18 standards evidence matrix; touchpoint generator. | `supabase-postgres-best-practices`, `webapp-testing`, `pdf` | **G6 Passed**; `TEST-056` to `TEST-071`, `TEST-113` (WCAG AA). |
| **Pilot: LC Rabat iGV** | Live pilot run in AIESEC in Rabat with synthetic and controlled pilot data. | `webapp-testing` (Drills), `supabase` (Backups) | **G7–G8 Passed**; RPO/RTO restore drills (`TEST-106`). |
| **S4: Cases, Compensation & Operational Finance** | Modules J, K; Annex 2 draft calculators; 3-stage case solving; harassment vault; AFPM chart of accounts; dual approvals. | `supabase-postgres-best-practices`, `pdf`, `vercel-composition-patterns` | `TEST-072` to `TEST-085`. |
| **S5: iGTa, iGTe & Remote Modalities** | Modules E (GT), I (remote); professional JDs; mandatory salary floors; partly remote ICB audit gates. | `vercel-composition-patterns`, `webapp-testing` | `TEST-034` to `TEST-037`. |
| **S6: Multi-LC National Scale** | Multi-tenancy RLS activation (`feature_flags.multi_lc = true`); MC Morocco national rollups. | `supabase-postgres-best-practices`, `supabase` | **G9 Passed**; Multi-tenant cross-LC isolation drills. |
