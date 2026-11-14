# AIESEC iCX Policy & Decisions Register

**Target Organization:** AIESEC in Rabat, Morocco  
**Status:** Living Governance Document  
**Version:** 1.0  
**Effective Date:** 2026-11-14

---

## 1. Evidence Classification Hierarchy

Every rule, validation constraint, and knowledge artifact in the iCX Command Center is explicitly tagged with one of five evidence classifications:

| Label | Meaning | Operational Implementation Treatment |
|---|---|---|
| `[VERIFIED]` | Directly supported by an identified authoritative AIESEC source (e.g. current AEPP, APIP, FPM). | Candidate for automated rule enforcement after source/version validation. |
| `[OBSERVED]` | Directly observed in live EXPA/GIS schemas or local Rabat operational spreadsheets. | Enforced only within observed scope; does not extend to global assumptions. |
| `[INFERRED]` | Derived by connecting disparate sources or operational deductions. | Advisory only; warning state in UI, non-blocking for operations. |
| `[RECOMMENDED]` | Proposed engineering or architecture design pattern (e.g. SvelteKit, FastAPI, PostgreSQL). | Product/technical standard, not an AIESEC organizational policy. |
| `[UNKNOWN]` | Not sufficiently documented or inaccessible in current discovery artifacts. | Never enforced as a blocking rule; surfaced as an explicit open question. |

---

## 2. Policy Conflicts & Open Decisions Register

The following table catalogs all unresolved, version-sensitive, or local policy variances identified during discovery. Under no circumstance may the system silently choose one side of a conflict.

| Decision ID | Conflict / Question | Relevant Sources | Product Scope | Impact | Decision Owner | Current System Behavior (Until Resolved) | Status |
|---|---|---|---|---|---|---|---|
| `POL-01` | Exchange Standards Count: Legacy material cites 16 standards; 2024 Refreshment defines 18 standards with a 16/18 threshold and 13 mandatory standards. | AEPP v2022 vs Exchange Standards Refreshment 2024 | All (iGV, iGTa, iGTe) | Completion readiness calculation (`CO`) | MC Morocco / LCVP CXP | Configurable standards engine defaulting to 18 standards, 13 mandatory gates, and 16/18 completion threshold. Overrides require LCVP approval. | `[VERIFIED]` in 2024 source, pending LC sign-off |
| `POL-02` | iGV Duration & Hours: Historical AEPP allows 6-8 weeks; ECBA 2026 updates reference 4-8 weeks and 25-40 hours/week. | AEPP legacy vs ECBA 2026 training | iGV | Opportunity duration validation | LCVP iGV | Validates duration between 4 and 8 weeks; working hours between 25 and 40 hrs/wk. | `[VERIFIED]` in ECBA 2026, advisory check |
| `POL-03` | iGTa / iGTe Duration Tiers: Short (6-12w), Medium (13-26w), Long (27-78w). Salary requirement on iGTa 6-8w (accommodation or salary) vs >8w (mandatory salary). | iGT Portfolio SOPs & Pricing 2026 | iGTa, iGTe | Opportunity validation & salary compliance | LCVP iGT | Enforces 35-45 hrs/wk; 6-8w allows accommodation or salary; >8w mandates living salary; iGTe mandates salary for all durations. | `[VERIFIED]` in 2026 SOPs |
| `POL-04` | EAR Audit Submission Deadline: Conflicting references between the 21st and 28th of each month. | ICB Audit Guidelines vs Local Calendar | All | Compliance calendar & reminder cascade | LCVP FnL / ICB Chair | Configurable audit calendar setting (defaulting to 21st with warning grace period to 28th). | `[INFERRED]`, configurable |
| `POL-05` | Partner Standard #10 Debrief Window: 14 days post-exchange vs up to 1 month. | Partner Standards 2024 vs Local SOP | PRM / CXP | Account closing & NPS tracking | LCVP PRM / B2B | 14-day SLA reminder with escalation warning at 30 days. | `[INFERRED]`, non-blocking SLA |
| `POL-06` | Moroccan Legal Internship & Work Permit Requirements: Exact conventions for convention de stage, visa touristique vs affaires for unpaid iGV volunteers and paid iGT interns. | Morocco Labor Law / MC Morocco Legal Counsel | iGV, iGTa, iGTe | Legal document checklist & visa feasibility | LCP / Legal Advisor | Advisory document checklist only. No automated legal determination is made by AI or system. | `[UNKNOWN]`, requires local legal sign-off |
| `POL-07` | Rabat Local Pricing & Project Fees: Specific opportunity fees and host organization contribution formulas. | Local Budget 2026 / LCVP FnL | iGV, iGTa, iGTe | Pricing calculator & contract generation | LCVP FnL / LCP | Deterministic pricing calculator accepts configurable formula parameters. No hardcoded currency defaults. | `[RECOMMENDED]`, requires LCVP FnL configuration |
| `POL-08` | EXPA/GIS API Access & Mutation Scopes: Whether MC Morocco grants direct OAuth write scopes to the LC. | GIS API Documentation | All | EXPA sync adapter write capabilities | MC Morocco Digital Systems | Read synchronization and manual CSV import enabled; direct mutation methods disabled pending credential validation. | `[UNKNOWN]`, fallback active |

---

## 3. Governance Invariants

1. **Deterministic Execution**: Business policies, financial math, and standard eligibility must execute through deterministic TypeScript/Python code, never ungrounded LLM inference.
2. **Approval Boundaries**: Any action altering official EXPA status, disbursing funds, granting standards waivers, or transmitting legal notices requires explicit, authenticated human approval in the Approval Center.
3. **Audit Trail**: Every policy evaluation, rule override, and configuration update is permanently recorded in the append-only `audit_logs` table.
