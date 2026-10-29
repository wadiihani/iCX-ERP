# AIESEC iCX ERP — Hub-Based Improvement Roadmap

**Product:** AIESEC in Rabat iCX ERP  
**Scope:** Incoming Global Volunteer (iGV), Global Talent (iGTa), and Global Teacher (iGTe), plus the shared partner, IR, exchange quality, logistics, finance, and team workflows  
**Prepared:** 29 October 2026  
**Repository:** https://github.com/wadiihani/iCX-ERP  
**Deployment:** https://icx-erp.vercel.app/  
**Primary knowledge source:** https://www.hub.aiesec.org/ and its Exchange, IM, ICB, and Functional Hubs

---

## 1. Purpose

Improve the ERP so it supports the real AIESEC iCX operating cycle, not just record keeping. The system should connect business development, partner commitments, international relations, opportunity creation, EP processing, exchange delivery, customer experience, standards, and performance management in one auditable workflow.

The central design principle is:

> **One connected operational record from first partner contact to completed exchange, with an accountable owner, reliable evidence, clear next action, and measurable experience quality at every stage.**

This document is an implementation roadmap and requirements brief. It is not a declaration that all referenced AIESEC policies have been fully verified or that every proposed feature already exists in the current code.

## 2. Research and interpretation notes

### 2.1 Hub material used

The public AIESEC Hub pages point to the following knowledge areas relevant to this ERP:

| Hub resource | What the Hub publicly says it covers | ERP implication |
|---|---|---|
| [AIESEC Hub](https://www.hub.aiesec.org/) | The AIESEC Way, leadership development model, AIESEC 2030, Global Academies, and functional hubs | Ground the ERP in the leadership experience and AIESEC purpose, not only operational throughput. |
| [Exchange Hub](https://www.hub.aiesec.org/exchange-hub) | Refreshed Exchange Standards; Global Exchange Summit material for exchange planning, SnD, delivery, MX, EwA, and Sales; SnD Summit material on market understanding, IR, and sales; IR Bootcamp; GT and GV academies | Structure workflows across sales and delivery, and make IR, quality, and learning processes visible. |
| Exchange Hub — GV resources | A GV dashboard, project portfolio, GV academy, commission-call learnings, and materials relating projects to SDGs and activities | Link each iGV opportunity to a documented project, SDG, activities, intended outputs, and delivery evidence. |
| Exchange Hub — common resources | APIP & AEPP, EXPA support, Exchange Standards, Partner Standards, Visa Hub, Service Evaluation, contacts, and Network Calendar | Provide policy/standards gates, visa verification, platform support links, feedback, and deadline awareness. |
| [IM Hub](https://www.hub.aiesec.org/im-hub) | EXPA process guides, EXPA status explanations, applying for an opportunity, EXPA permissions, custom transactional emails, UTM campaigns, analytics, and developer guides | Keep EXPA terminology/statuses aligned, track source campaigns when relevant, maintain integration permissions, and preserve a support trail. |
| [ICB Hub](https://www.hub.aiesec.org/icb-hub) | Portfolio integrity, customer centricity, ECB performance, and governance resources | Make standards, customer experience, escalation, and evidence review part of everyday operations. |
| [Functional Hub](https://www.hub.aiesec.org/functional-hub) | Centralized access to BD, MX, Finance, OD, EwA, IM, ICB, and other functional knowledge | Connect functions through handovers while preserving ownership, permissions, and clear responsibilities. |
| [The AIESEC Way](https://www.hub.aiesec.org/aiesec-way) | Leadership development, values, cross-cultural understanding, leadership opportunities, membership, and partners aligned with AIESEC values and ethics | Capture purposeful partnership fit and the quality of the EP/member experience, not only sales volume. |

### 2.2 Verification boundary

The public pages above describe the resources available, but several underlying documents/forms are linked externally and are not fully readable through public page extraction. Therefore:

- The latest official APIP, AEPP, Exchange Standards, Partner Standards, visa guidance, product rules, and finance guidance must be checked by an authorized AIESEC owner before implementation.
- Store policy requirements as versioned configuration with a source, effective date, verifier, and review date. Do not bury them as undocumented constants in code.
- Do not treat a proposed KPI, deadline, legal requirement, threshold, or status label in this roadmap as an official AIESEC rule unless it has been validated against the current authoritative resource.
- The public Hub references refreshed Exchange Standards and the repository's existing planning documents refer to an 18-standard matrix. The exact standard list and wording must be imported only after comparing it with the currently approved source.

### 2.3 Existing repository baseline

The public repository README describes a Next.js 14, React, TypeScript, Tailwind, Zod, Supabase, Vitest, and Playwright application for iGV/iGTa/iGTe, including partner CRM, EP dossiers, visa/legal clearances, logistics, finance, compliance gates, JSON backups, and CSV export.

The repository also contains a master specification, a skills guide, KPI/graph specifications, and an older audit/change blueprint. Before implementing old findings, reconcile them with the actual current `src/`, database migrations, and tests. Some findings in the older blueprint refer to a previous HTML-based implementation and may no longer describe the current Next.js build.

## 3. Priorities at a glance

### P0 — Data trust and safe operations

1. Verify production persistence, authentication, database policies, and role permissions.
2. Separate organization, contact, partner relationship, deal, contract, opportunity, IR partner, and EP into linked records.
3. Support editing, reassignment, closure/loss, rejection, withdrawal, cancellation, break, and archive flows with reasons and history.
4. Eliminate fake/hardcoded KPIs and ensure every dashboard metric is traceable to source records.
5. Establish one versioned policy/standards engine before adding more automated compliance decisions.

### P1 — AIESEC-aligned exchange workflow

6. Build the full partner-to-opportunity-to-EP-to-completion lifecycle.
7. Add a configurable Exchange Standards checklist and Partner Standards assessment.
8. Connect iGV projects to the SDGs, intended activities, outputs, and delivery evidence.
9. Establish IR portfolio/quota management and EXPA status mapping.
10. Create a complete pre-arrival, visa verification, safety, housing, pickup, and CXP workflow.

### P2 — Better management and team execution

11. Add contextual task queues, follow-up SLAs, handover acknowledgments, and automated reminders.
12. Add meaningful dashboards and drill-downs for sales, IR supply, EP funnel, quality, finance, and team execution.
13. Add customer feedback, issue/case management, and after-exchange learning loops.
14. Improve imports/exports, communication history, mobile usability, and operational documentation.

### P3 — Optimization after the core is reliable

15. Add opportunity and capacity forecasting, partner scoring, cohort comparisons, and automation recommendations.
16. Integrate external systems only after access rights, API capabilities, synchronization direction, and failure recovery are defined.

---

## 4. Required operating model

### 4.1 Treat the ERP as an operational layer, not a replacement for EXPA

Use EXPA as the authority for its official application/opportunity statuses and records where applicable. The ERP should enrich the local workflow with task ownership, partner context, internal readiness, logistics, local standards evidence, and management analytics.

Requirements:

- Maintain a stable internal ID for every record and store the relevant external EXPA ID separately.
- Store the raw EXPA status, normalized internal status, last-sync timestamp, and sync result.
- Maintain an explicit mapping table between EXPA statuses and ERP statuses; review it against current IM Hub guidance.
- Detect and report discrepancies instead of silently overwriting one system with another.
- Prefer read-only EXPA synchronization unless an officially supported and authorized write flow is confirmed. Do not automate actions against EXPA through browser scraping or unofficial mutations.
- If a write-back action is approved and technically supported, use an auditable action queue with human confirmation, idempotency, retries, and failure reporting.

### 4.2 Use one connected data model

The core relationship should be:

`Organization → Contacts → Partner Relationship/Deal → Contract → Project/Opportunity → Available Slots → EP Application/Matching → Pre-arrival → Arrival → Delivery/CXP → Completion/Feedback`

Cross-cutting records:

- IR entity and IR relationship
- Exchange product and project portfolio
- Standards requirements and evidence
- Tasks, meetings, notes, emails, and handovers
- Finance transactions and supporting documents
- Incidents, concerns, disputes, and escalation cases
- Member roles, assignments, and permissions
- Audit events and integration logs

Do not combine several concepts into one text field. For example, keep name and EXPA ID separate; email and telephone separate; passport expiry and passport number separate; arrival date, airport, and flight number separate; IR quota types as numeric fields or child records rather than a single string.

### 4.3 Make ownership explicit

Every active record must have:

- One accountable owner (member ID)
- Optional supporting members
- Status and status reason when applicable
- Last activity timestamp
- Next action, due date, and priority
- A visible activity timeline
- A clear handover state when ownership changes

A handover is complete only when the receiving owner acknowledges it or an authorized manager resolves the handover. Do not silently move records between departments.

---

## 5. Improvement specifications by module

## 5.1 Executive dashboard and analytics

### Improvements

- Replace decorative counters with calculated KPIs sourced from real database records.
- Each KPI must show definition/formula, reporting period, current value, target, comparison period where meaningful, data freshness, and a drill-down to the filtered source records.
- Clearly distinguish `0`, `N/A`, `not configured`, `insufficient data`, and `data unavailable`.
- Remove any hardcoded metric values, fake conversion-funnel steps, static response-time claims, or success badges not calculated from the database.
- Add filters for date range, product (iGV/iGTa/iGTe), owner, partner segment, opportunity, and status where applicable.
- Show both volume and quality. A rising number of applications is not sufficient if matching, exchange delivery, or participant experience is poor.

### Recommended dashboard sections

1. **Sales:** qualified leads, first meetings, proposals, signed agreements, win/loss rate, stage conversion, stale deals, average time in stage, and next follow-ups.
2. **Opportunity supply:** active opportunities by product, valid available slots, slots already matched, unfilled capacity, expiring opportunities, and partner/project readiness.
3. **IR supply:** active IR relationships, confirmed supply by product and period, response time, IR follow-up overdue, and supply-to-demand coverage.
4. **EP funnel:** applications, contacted, accepted/approved according to the verified EXPA mapping, matched, departure/arrival readiness, realized/completed, broken/rejected/withdrawn cases, and stage conversion.
5. **Experience quality:** standards completion by standard and cohort, unresolved issues, feedback submitted, feedback score when a valid survey exists, debrief/reflection completion, and cases needing escalation.
6. **Logistics and safety:** upcoming arrivals, pickup confirmations, housing capacity conflicts, visa checks pending, incomplete pre-arrival packs, and urgent issues.
7. **Finance:** expected revenue, confirmed inflows, outstanding receivables, cash outflows, committed costs, net position, and reconciliation status. Configure rules from the approved finance guidance; do not invent an official ratio.
8. **Team execution:** overdue tasks, handover backlog, workload by owner, missing ownership, member onboarding/training, and 1:1/engagement tracking where locally approved.

### Acceptance criteria

- Updating or moving a source record updates the relevant KPI after the next successful query/sync.
- Every KPI can be reconciled to a list of source records.
- Dashboard queries respect role permissions and entity/LC scope.
- Empty data never produces fake totals, misleading percentages, or divide-by-zero values.

## 5.2 Partner CRM and Sales & Development

The Exchange Hub surfaces SnD learning around market understanding, IR, sales, and opportunity supply. Reflect that flow in the CRM rather than treating sales as a generic lead list.

### Data model

Separate these entities:

- **Organization:** legal/brand name, entity type, registration details where applicable, industry/segment, locations, website, service area, verification status, and relationship owner.
- **Contact:** name, role, work email, phone, preferred channel, and consent/communication preferences where relevant.
- **Partner relationship:** relationship health, strategic fit, partnership scope, start/end/review date, and overall owner.
- **Deal/opportunity to sell:** product line, need/pain point, stakeholder, potential value, expected decision date, sales stage, next action, and outcome.
- **Contract:** version, effective dates, parties, signatories, annexes, fee terms, accommodation/transport commitments, renewal date, and protected documents.
- **Meeting/activity:** participants, date, notes, agreed next steps, and due dates.

### Recommended pipeline

Use a configurable pipeline such as:

`Prospect → Qualified → Discovery/Needs Assessment → Proposal → Negotiation → Agreement Signed → Opportunity Setup → Active Delivery → Renewal/Closed`

Allow `Closed Lost`, `Disqualified`, `On Hold`, and `Partner Paused` exits with a required reason. Confirm exact names and definitions with the LC's current sales process before rollout.

### Required functionality

- Multiple deals and contacts per organization.
- Duplicate warning based on normalized organization name, email/domain, phone, and registration identifier where available.
- Qualification fields covering partner need, audience served, project/role scope, delivery capacity, decision-maker, fit with AIESEC values/ethics, risk flags, and expected impact.
- Discovery notes and explicit next steps, not just a stage dropdown.
- Follow-up queue sorted by due date, urgency, stage age, and ownership.
- Meeting history and proposal/contract version history.
- Loss analysis by reason, segment, product, owner, and acquisition source.
- Partner health and renewal review reminders.

### Acceptance criteria

- One organization can own multiple contacts, deals, contracts, and opportunities.
- Closing a deal as lost does not delete the organization or unrelated deals.
- Signing/activating an agreement triggers an explicit opportunity-setup checklist rather than assuming the opportunity is ready.

## 5.3 Partner Standards and agreement readiness

The Hub describes Partner Standards as a way to measure the quality of relationships with partners and build purposeful partnerships. Translate this into evidence-based readiness, but verify the current official standard text before claiming formal compliance.

### Recommended design

- Create a **Partner Standards register** with one record per requirement/checkpoint from the verified source.
- Each item should have: standard ID, exact title and wording, official source URL, version/effective date, applicability, evidence type, responsible role, required/optional flag, status, reviewer, review date, and notes.
- Link each applicable requirement to the partner, contract, opportunity, and delivery cohort as appropriate.
- Track `Not Applicable` with a reason and reviewer; do not silently skip requirements.
- Show partner readiness as a transparent checklist with blockers and evidence, not an opaque score alone.
- Add partner feedback and periodic review/renewal tasks.

### Gate behaviour

A missing critical requirement should block only the relevant high-risk transition defined by the approved rule. Unverified or optional rules should create a warning or task—not irreversible automatic rejection.

## 5.4 Opportunity and project portfolio management

### Separate project, opportunity, and slot

- **Project template:** reusable purpose, SDG mapping, target group, planned activities, intended outputs/outcomes, safeguarding considerations, and delivery model.
- **Opportunity:** a specific delivery instance with dates, location/modality, partner, requirements, owner, approved capacity, price/fee model if applicable, and publication status.
- **Slot/position:** a discrete place/capacity record with dates, requirements, and assignment state.

This model is important because an organization can host several opportunities, and an opportunity can have multiple slots without duplicating the legal partner record.

### For iGV

The GV Hub explicitly points to a project portfolio linking projects to SDGs and activities. Each iGV opportunity should therefore include:

- Primary SDG and optional secondary SDGs selected from a controlled catalogue.
- Problem/context, target beneficiaries, planned activities, expected outputs, and expected outcome/impact indicators.
- Host organization's role and delivery commitment.
- Project schedule, working conditions, location, language, skills/eligibility, supervision, and available slots.
- Pre-arrival information and participant responsibilities.
- Evidence of activities delivered, attendance/participation, reflection/debrief, and project feedback.
- Any locally required safeguarding, risk, or host verification checks, with authoritative sources.

Do not present an SDG tag alone as proof of impact. Record the activities and evidence supporting the connection.

### For iGTa and iGTe

Keep a shared opportunity framework but use product-specific fields and checklists. For example, teaching role requirements, language proficiency, timetable, learner level, and teaching deliverables may apply to iGTe but not to a volunteer project. Internships may require a different task, supervision, work arrangement, and deliverable model. Verify the current product portfolio rules and avoid showing irrelevant fields for the selected product.

### Capacity and publishing gates

Do not publish/activate an opportunity until required partner agreement, owner, verified details, dates, slots, role requirements, and applicable standards checks are complete. Track who approved it and when.

## 5.5 IR Partner Relationship Management

The Exchange Hub includes IR Bootcamp content and exchange data resources; the ERP should treat IR relationships as a managed supply pipeline, not only a country list.

### Required IR records

- IR entity/LC/MC and country/territory.
- Main contact(s), relationship owner, communication channel, and last/next contact.
- Product compatibility: iGV, iGTa, iGTe; physical/remote modes only where supported by current product rules.
- Confirmed supply, expected demand, validity period, quota/capacity, and evidence/source.
- Cooperation stage, reliability history, response time, agreed processes, and open issues.
- IR introduction call notes, commitments, and next actions.
- Country-specific operational or visa notes linked to a verified source and review date.

### Quotas and forecasts

- Store applications, approved/accepted, matched, realized/completed and other relevant status counts in separate typed fields or time-stamped aggregates that map to current EXPA definitions.
- Keep historic quota commitments distinct from current active availability.
- Forecast supply by period, product, and opportunity; flag shortfalls against confirmed local targets.
- Never calculate coverage from unverified or stale IR promises without marking the data confidence.

### Acceptance criteria

- An IR handover includes the contact, product, quota commitment, supporting evidence, owner, and next action.
- A cancelled or broken cooperation updates the forecast and alerts the accountable owner without erasing history.

## 5.6 EP lifecycle and EXPA alignment

The IM Hub provides guides about EXPA processes, statuses, permissions, and applying to opportunities. Use it as the reference when mapping the ERP's workflow to EXPA.

### EP dossier structure

Keep separate, permission-controlled fields for:

- Internal EP ID and external EXPA ID.
- Name and contact details.
- Product, opportunity, IR source, application date, and status history.
- Eligibility/selection information appropriate to the product.
- Required documents, verification status, reviewer, and expiry dates.
- Matching record, match confirmation, host/partner confirmation, and relevant dates.
- Pre-arrival readiness, arrival details, emergency contact, local responsible member, and logistics links.
- Exchange activity evidence, check-ins, feedback, reflection/debrief, completion, and exception outcome.

Avoid storing all data as a single concatenated string. Use typed fields and relation IDs.

### Status design

Implement a documented status mapping with at least these conceptual stages; exact EXPA values and transition rules must be confirmed from current IM Hub/EXPA materials:

`Applied → Contacted/Screening → Accepted/Approved → Matched → Pre-Arrival Ready → Arrived/Realized → In Delivery → Completed`

Alternative terminal or exception states must be supported where relevant: `Rejected`, `Withdrawn`, `Match Cancelled`, `Approval Broken`, `Realization Broken`, `No Show`, and `Closed`.

Do not force every record through a linear forward-only button. Each transition must check its requirements, permit authorized exceptions, capture a reason, and append a history event.

### Matching

- A match must reference a real opportunity/slot and a real EP record.
- Prevent assignment to a filled, inactive, expired, ineligible, or time-conflicting slot.
- Record match proposal, acceptance/rejection, approving person, date/time, and related evidence.
- If a match breaks, preserve the previous match and outcome; reopen capacity only when operational rules say it is available.

## 5.7 Exchange Standards and customer experience

The Exchange Hub says the Exchange Standards exist to ensure and measure the quality of participant experiences. The ERP should turn verified standards into operational evidence and follow-up, not a static compliance badge.

### Standards register

- Import the current approved standards and exact wording after verification. The current Hub points to Refreshed Exchange Standards; do not assume an older list is still authoritative.
- If the approved local specification uses an 18-standard matrix, reconcile every item and sub-item with the current official source before seeding production.
- Store version, effective date, product applicability, lifecycle phase, criticality, evidence requirement, responsible role, and approved exceptions.
- Link each EP's checklist to the active standards version for their exchange cohort.

### Per-EP quality workflow

For every applicable standard, track:

- `Not Started`, `In Progress`, `Fulfilled`, `Not Applicable`, `Blocked`, or `Exception Approved` (adjust to the verified standard's definitions).
- Assigned owner and due date.
- Evidence/document/note link.
- Completion timestamp and reviewer if required.
- Blocker, corrective action, and exception approval where relevant.

### Quality analytics

- Compliance by standard and cohort, with numerator, denominator, excluded/N/A count, and data timestamp.
- Identify the standards that are often late or incomplete.
- Display the EP's actual checklist and missing evidence from each chart.
- Separate mandatory gates from improvement indicators; do not average a critical failure into a reassuring high overall score.

### Customer feedback and experience recovery

- Collect feedback at defined points through configurable surveys or documented feedback sessions.
- Link feedback to EP, opportunity, partner, responsible owner, and phase of experience.
- Support confidential concerns and restricted access for sensitive cases.
- Convert actionable negative feedback into a task, corrective action, owner, due date, resolution, and follow-up check.
- Capture learning/debrief/reflection completion where required by the current product/standards source.
- Do not expose personal or sensitive feedback on general dashboards.

## 5.8 Visa, legal readiness, safeguarding, and incidents

The Hub lists a Visa Hub for entity-specific visa information and APIP/AEPP as core policies. These are sources that need to be checked against the active official materials, not replaced by generic assumptions.

### Visa and document register

- Store nationality, document type, expiry date, travel purpose, host country, intended dates, current verification status, verifier, verification date, and official source URL separately.
- Keep a country/route requirement record with source owner, `last_verified_at`, effective dates, and review cycle.
- Mark the result `Needs Verification`, `Verified`, `Not Required (evidence recorded)`, `Blocked`, or another approved status.
- Require human verification before a record is treated as cleared for travel. No AI-generated answer or stale database entry should make a final legal/visa clearance decision.
- Restrict passport and legal document access to authorized roles; encrypt sensitive fields where supported and log access.
- Use expiry and departure dates to create reminders, not to make unsupported legal conclusions.

### Safeguarding and issue management

- Provide a dedicated restricted incident/concern workflow with severity, confidentiality level, date/time, involved exchange/record links, assigned authorized case owner, actions, resolution, and review history.
- Only expose case information to authorized people; executive summaries should use minimized/non-identifying information.
- Use the currently approved APIP/AEPP and anti-harassment escalation pathways. Store links to the source and last verified policy version.
- Record immediate safety escalations separately from ordinary customer service tickets.
- Ensure users know the ERP is not an emergency hotline; provide the verified local emergency/escalation contacts approved by AIESEC leadership.

## 5.9 Accommodation and pickup operations

### Accommodation

- Use separate `Accommodation Provider`, `Property`, `Room`, `Bed`, and `Allocation` records.
- Track availability periods, capacity, suitability, confirmed terms, address privacy, check-in/out, costs/commitments, and responsible member.
- Prevent overlapping allocations for the same bed/date range in the database, not only in the frontend.
- Trigger a conflict warning when dates or capacity overlap.
- Record the EP's accommodation confirmation, directions, house rules, emergency contact, and unresolved issues through access-controlled fields.

### Pickup and arrival

- Store arrival date/time, airport/station, flight/train number, meeting point, pickup owner, backup owner, participant contact channel, confirmation status, and contingency plan separately.
- Include a mobile-friendly pickup view with only the minimum necessary EP details.
- Provide arrival-day task checklists and acknowledge handover from the pickup owner to the assigned CXP/EP owner.
- Support delayed flights, missed pickups, cancellation, no-show, and other exceptions without overwriting the original plan.

## 5.10 Finance and sustainability

The Hub has a Finance functional hub, and the repository describes an AFPM finance/governance area. Finance workflows need to use the currently approved AFPM and local MC/LC guidance.

### Record structure

Separate:

- Budget and forecast
- Expected fee/revenue per contract/opportunity
- Invoices/receivables and due dates
- Confirmed cash inflows
- Expenses/payables and supporting receipts
- Cash outflows
- Refunds, compensation, replacements, and adjustments where approved by applicable policy
- Reconciliation records, financial period, and approver

Each transaction should include amount, currency, date, classification, linked partner/opportunity/EP where appropriate, evidence, responsible person, approval status, and audit history.

### Controls

- Do not treat contracted or expected revenue as cash received.
- Do not treat an expense request as a paid expense.
- Add duplicate transaction warnings and mandatory evidence for configured categories.
- Track overdue invoices and upcoming obligations.
- Use configurable financial rules with source/version and responsible approver; do not hardcode finance ratios or compensation/replacement rules until the authoritative rule is verified.
- Protect financial access separately from general team access.

## 5.11 Member management, handovers, and knowledge retention

The AIESEC Hub positions membership as part of the leadership experience and centralizes functional learning. The ERP can support this by making work and knowledge transferable across mandate changes.

### Improvements

- Separate team members from finance records and unrelated operational entities.
- Manage roles, department, tenure/mandate dates, manager, permissions, active/inactive state, and transition/exit date.
- Assign every active CRM/EP/IR/logistics/case record to an owner; create an unassigned-record queue.
- Create repeatable onboarding paths by role, with links to approved Hub resources and local process guidance.
- Track training completion and operational authorization for sensitive actions.
- Add 1:1s, member check-ins, engagement/attendance, and team standards only if the LC approves the definitions and privacy policy.
- At mandate transition, generate a handover pack of active partners, deals, opportunities, IR commitments, EPs, tasks, risks, finance obligations, and open cases.
- Keep role permissions tied to current assignments and remove access when a member leaves or changes role.

## 5.12 Tasks, communication, and automation

### Unified task engine

All modules should create tasks through the same task engine. A task needs type, related record, owner, creator, due date, priority, status, completion evidence, and escalation path.

Useful task sources include:

- Partner follow-ups and stale sales deals
- Unanswered IR messages or unconfirmed supply
- Missing contract signatures or opportunity fields
- EP documents and selection/matching actions
- Visa verification and pre-arrival readiness
- Upcoming arrivals, pickup confirmations, and accommodation checks
- Incomplete exchange standards, feedback, or open corrective actions
- Overdue invoices, reconciliation, or approvals
- Mandate handovers and member onboarding

### Automations

- Make reminders configurable by product, lifecycle stage, role, and verified local rule.
- Use idempotency keys so retries do not create duplicate tasks, messages, records, or alerts.
- Respect `Africa/Casablanca` for displayed/local deadlines and store timestamps consistently.
- Record automation run time, outcome, errors, retry count, and affected records.
- Provide an admin control to disable a broken automation without redeploying the entire app, if the architecture supports it.
- Do not silently send messages on behalf of a member. Use approved templates, previews, and send logs; maintain opt-out or communication preferences where applicable.
- Provide direct links to EXPA support guidance and the approved Hub process when the problem originates in EXPA or a policy uncertainty.

## 5.13 Search, tables, imports, exports, and record details

### Daily-use interface

- Make searchable, filterable, sortable tables the main interface for operational work.
- Provide contextual `New` actions per module; keep global Quick Add optional and compact.
- Provide a record detail drawer/page with profile, activity timeline, relationships, documents, tasks, status history, audit history, and next action.
- Use bulk actions only where permission checks and confirmation are implemented.
- Provide saved filters/views by role where useful.
- Make forms conditional on product and lifecycle stage so users do not see irrelevant fields.
- Support keyboard navigation, readable mobile views, visible validation errors, and accessible color contrast.

### Data migration and backup

- Validate CSV imports before writing; show a dry-run preview, row errors, duplicate warnings, and a summary of what will change.
- Use stable IDs and explicit duplicate-resolution rules.
- Exports should respect permissions, applied filters, and sensitive-field restrictions.
- Backups must include all relevant related records, schema/version metadata, and integrity checks; document recovery steps and test restore on a non-production environment.
- Do not expose a seed/demo reset in production without a protected administrator-only procedure and confirmation.

---

## 6. Roles and access control

Use role-based permissions on the server/database as well as in the UI. A role selector or hidden navigation item is not a security boundary.

Suggested roles (final permissions must be approved locally):

| Role | Typical scope |
|---|---|
| Member / EP Manager | Assigned EPs, tasks, permitted status updates, and minimum information needed for delivery |
| Team Leader | Team's work queue, records assigned to the team, coaching, handovers, and escalations |
| BD / Partner Manager | Organizations, contacts, deals, proposals, contracts as permitted, and opportunity setup |
| IR Manager | IR relationships, communications, supply commitments, and IR-linked records |
| CXP / Operations | EP readiness, arrival, delivery checklists, feedback actions, housing/pickups as assigned |
| Finance | Transactions, invoices, evidence, reconciliation, and financial reports |
| ECB / Compliance reviewer | Approved standards, evidence, compliance exceptions, review/audit functions, and restricted case access where authorized |
| VP iCX / Executive | Cross-module operational oversight and aggregated KPIs; sensitive details only when specifically authorized |
| System administrator | Technical configuration and account management; business access should still be logged and limited |

### Mandatory permission principles

- Deny access by default and grant minimum required privileges.
- Apply Row-Level Security/record-level access in Supabase/Postgres for scoped data.
- Check permissions on every server action/API route, not only client components.
- Separate viewing, editing, approving, exporting, and deleting/archiving permissions.
- Use append-only audit events for sensitive status changes and policy decisions.
- Log denied access without revealing the existence of records to unauthorized users.
- Define a retention/deletion process and local privacy review, including Morocco's applicable personal-data requirements, before production use.

---

## 7. Data architecture and reliability requirements

The repository's skills guide already describes a normalized PostgreSQL/Supabase architecture, row-level security, versioned migrations, formal state machines, audit logs, and a broad acceptance-test catalogue. Use those as planning targets only after checking that the current code and migration history implement them.

### Required engineering controls

1. **Versioned migrations:** schema changes are committed, ordered, reviewed, and repeatable.
2. **Normalized relationships:** foreign keys for organization, contact, deal, contract, opportunity, slot, EP, IR, task, evidence, and finance records.
3. **Server-side validation:** Zod/schema validation at input boundaries plus database constraints for essential invariants.
4. **Transactions:** multi-record operations such as matching, slot allocation, and accommodation booking must be atomic.
5. **Status state machines:** permitted transitions and prerequisites live in shared/tested business logic, with server/database enforcement for critical invariants.
6. **Audit history:** who changed what, when, why, previous value, new value, related record, and any approval/evidence references.
7. **Timezone handling:** store reliable timestamps (UTC or the database's consistent timezone-aware representation); display and evaluate local business deadlines in `Africa/Casablanca`.
8. **Idempotency:** duplicate submits and retrying failed jobs must not duplicate records, tasks, finance items, or communications.
9. **Observability:** central error logging, failed sync queue, automation logs, data freshness indicators, and administrator diagnostics.
10. **Backups and restore:** documented RPO/RTO targets set by the project owner, automated backups, and tested recovery before high-volume production use.

### High-risk integrity constraints to test

- A slot cannot exceed approved capacity.
- One slot cannot be assigned to incompatible overlapping matches.
- One bed cannot have overlapping active allocations for different EPs over the same date range.
- An archived/expired opportunity cannot receive a new match unless an authorized exception exists.
- A contract cannot be considered signed without the required signature/evidence state.
- An EP cannot be considered ready for arrival when required critical readiness checks remain incomplete.
- A transaction cannot be marked paid without the required payment evidence/approval, as configured by finance policy.
- A policy requirement is evaluated against its effective version for the relevant exchange cohort.
- A permission change immediately affects server/database access, not only menu visibility.

---

## 8. Official-source and policy configuration model

Build a small administrative **AIESEC Rules & References** area instead of scattering standards across code.

Each rule/reference should include:

- `rule_id` / `standard_id`
- Name and exact official wording (where authorized to reproduce it)
- Resource category (APIP, AEPP, Exchange Standard, Partner Standard, Visa, Finance/AFPM, EXPA process, local procedure)
- Official source URL and owner
- Version/revision and effective-from/effective-to dates
- Product applicability and lifecycle scope
- Mandatory/conditional/advisory classification
- Evidence needed and authorized reviewer role
- Enforced action: informational notice, task, warning, block, or human approval
- Last verified date, next review date, and verification status
- Local interpretation/decision record where authorized

### Rule confidence labels

Use explicit labels such as:

- `VERIFIED_OFFICIAL`: checked against the currently approved official source.
- `CONFIRMED_LOCAL`: confirmed in writing by the responsible MC/LC owner.
- `PROPOSED`: a suggested operational control pending approval.
- `NEEDS_VERIFICATION`: source or current rule not confirmed.
- `RETIRED`: no longer active; retain history for prior cohorts where needed.

A `PROPOSED` or `NEEDS_VERIFICATION` rule may generate reminders and show a warning. It must not silently trigger irreversible rejection, cancellation, financial treatment, or legal clearance.

---

## 9. KPI dictionary to create before building more charts

Agree a KPI dictionary with the VP iCX, BD/IR/Ops owners, finance, and local compliance reviewer. Each KPI must document its owner, formula, source tables, grain, exclusions, reporting window, target source, and data freshness.

| Domain | Example metric | Definition/controls required |
|---|---|---|
| Sales | Lead-to-meeting conversion | Qualified leads entering the cohort that reached a first meeting divided by eligible leads in the same cohort/window; define cohort and exclusions. |
| Sales | Deal win rate | Deals marked won divided by won + lost deals in a defined closed cohort; do not count open deals as losses. |
| Sales | Stage aging | Median/average time since entering current stage; use status history, not record creation date. |
| Partner | Active qualified partners | Distinguish a legal organization from an active relationship or an open deal. |
| Opportunity | Usable slot capacity | Only verified, active, date-valid capacity should count; show reserved and available separately. |
| IR | Confirmed supply | Use explicit confirmed commitments with valid period and source; label forecast separately. |
| EP | Stage conversion | Count unique EPs reaching each verified mapped status; document how transfers, duplicates, breaks, and withdrawals are treated. |
| EP | Time to match | Define start/end events and cohort; use timestamps rather than static average labels. |
| Quality | Standard fulfillment | Fulfilled applicable requirements divided by applicable requirements, with approved exceptions and N/A treatment shown separately. |
| CXP | Feedback completion | Completed valid feedback records divided by eligible EPs for the relevant feedback point. |
| Logistics | Arrival readiness | EPs arriving in the configured horizon that meet all verified mandatory pre-arrival checks divided by all expected arrivals in that horizon. |
| Finance | Collected vs. expected | Confirmed cash receipts divided by expected amounts for a defined cohort/period; show receivables separately. |
| Team | Overdue task rate | Active tasks past due divided by active tasks with due dates; segment by owner/module and avoid punishing legitimate paused cases. |
| Impact | Project output evidence | Report actual delivered activity/output measures that the project has defined; do not infer social impact from an SDG label alone. |

Do not deploy sample values as live KPIs. If demo data is intentionally used, mark the entire environment clearly as demo.

---

## 10. Delivery plan

Implement by vertical slices with end-to-end functionality. Avoid rebuilding every screen first and deferring data integrity until later.

### Phase 0 — Audit current build and freeze the baseline

- [ ] Review `src/`, migrations, Supabase policies, server actions/API routes, tests, and current deployed build.
- [ ] Compare current code to `AIESEC_iCX_ERP_Tracker_First_Master_Specification.md`, `AIESEC_ICX_ERP_SKILLS_GUIDE.md`, the KPI architecture, and the older audit blueprint.
- [ ] Mark each existing requirement `Implemented & tested`, `Implemented but untested`, `Partial`, `Missing`, `Conflicting`, or `Obsolete`.
- [ ] Verify real persistence and permissions using test accounts and test data.
- [ ] Identify demo data, hardcoded KPI values, disabled controls, and incomplete forms.
- [ ] Record known bugs before changes; run the current build and test suites.

**Exit gate:** the team knows what code exists, what is live, what is outdated, and which current defects are reproducible.

### Phase 1 — Data integrity, access, and record lifecycle (P0)

- [ ] Repair organization/contact/deal/contract/opportunity/slot/EP/IR relationships.
- [ ] Add edit, reassign, archive, close-lost, reject, withdraw, break, and cancellation flows with mandatory reasons when appropriate.
- [ ] Add status history, record activity timelines, and append-only audit events.
- [ ] Verify RLS and server-side role checks for every table and action.
- [ ] Add integrity constraints and transaction-safe matching/accommodation allocation.
- [ ] Remove hardcoded dashboard math and distinguish demo data from real data.
- [ ] Add backup/restore and import dry-run tests.

**Exit gate:** critical records persist, are related correctly, can be corrected safely, and cannot be accessed or transitioned by unauthorized users.

### Phase 2 — Sales, partner standards, opportunity creation (P1)

- [ ] Implement organization/contact/relationship/deal separation and the approved sales stages.
- [ ] Add meeting history, follow-up tasks, lost reasons, partner qualification, and renewal reviews.
- [ ] Add contract and annex versioning with signature evidence and renewal dates.
- [ ] Add project portfolio and product-specific opportunity templates.
- [ ] Add capacity and slot management; only validated opportunities can be activated.
- [ ] Configure a versioned Partner Standards checklist from the verified official source.

**Exit gate:** a new lead can be progressed into a qualified partner relationship, signed agreement, and approved opportunity without duplicate manual records.

### Phase 3 — IR, EXPA mapping, EP funnel (P1)

- [ ] Add IR contacts, introduction calls, commitments, quota/capacity, and follow-up queue.
- [ ] Define and test the EXPA status mapping against current IM Hub/EXPA guidance.
- [ ] Add EP detail pages, document checklist, matching, rejection/withdrawal/break handling, and record-level histories.
- [ ] Build a discrepancy report for stale/mismatched EXPA data.
- [ ] Prohibit unauthorized direct EXPA mutations; if write-back is officially supported, route through an auditable approval queue.

**Exit gate:** an EP can be followed from application through matching and exception/completion states, while external and local statuses remain reconcilable.

### Phase 4 — Exchange standards, CXP, visa, and logistics (P1)

- [ ] Import the verified current Exchange Standards and applicable product versions.
- [ ] Add per-EP evidence checklists and compliance views by cohort.
- [ ] Add human-verified visa/document checks with sources, expiry reminders, and restricted access.
- [ ] Add arrival readiness, pickup handover, accommodation allocation, and conflict prevention.
- [ ] Add restricted incident/concern handling and verified escalation contacts.
- [ ] Add feedback, corrective action, debrief/reflection, and completion workflow according to current product standards.

**Exit gate:** an upcoming exchange can be prepared, delivered, monitored, and closed with evidence, responsible owners, and safe exception handling.

### Phase 5 — Finance, member operations, task automation (P2)

- [ ] Verify the applicable AFPM/finance policy and configure the corresponding workflow.
- [ ] Separate budget, revenue expectations, invoices/receivables, inflows, expenses/payables, outflows, refunds, and reconciliation.
- [ ] Add team assignments, access lifecycle, onboarding links, and structured mandate handover.
- [ ] Add unified task queues and configurable reminders with idempotent automation.
- [ ] Build a cross-module exception/SLA center based only on approved deadlines and data-supported alerts.

**Exit gate:** daily work can be managed from a reliable action queue without duplicated reminders or undocumented financial states.

### Phase 6 — Analytics, usability, and controlled scale (P2/P3)

- [ ] Agree and implement the KPI dictionary.
- [ ] Build clickable drill-down scorecards and cohort filters.
- [ ] Improve mobile, keyboard, and accessibility support.
- [ ] Add saved views, validated CSV import, permission-aware exports, and tested restore.
- [ ] Add forecasting only after historical data quality is acceptable.
- [ ] Review whether multi-LC support is needed now; do not overbuild it without an approved requirement.

**Exit gate:** each key operational KPI is trustworthy, explainable, and actionable; team members can execute workflows efficiently on desktop and mobile.

---

## 11. Minimum acceptance-test suite

The project should maintain automated unit/integration tests plus Playwright end-to-end tests. The cases below are a minimum baseline, not a claim that the repository's existing test catalogue is complete.

### Persistence and relationships

- [ ] Create, edit, and reload a partner, deal, contract, opportunity, IR, EP, task, and transaction.
- [ ] Ensure one partner can have multiple deals, contacts, contracts, and opportunities.
- [ ] Ensure a closed-lost deal does not erase the partner or unrelated deals.
- [ ] Reject invalid foreign keys and malformed typed fields.
- [ ] Verify transaction rollback on partial matching/slot allocation failure.

### Status transitions

- [ ] Reject unauthorized transitions.
- [ ] Block a transition when a verified mandatory prerequisite is missing.
- [ ] Allow authorized exception transitions with a reason and audit event.
- [ ] Keep previous status and timestamps in history.
- [ ] Verify withdrawn/rejected/broken/cancelled records are not counted incorrectly in funnel metrics.

### Permissions and privacy

- [ ] Member cannot access another team's restricted data without permission.
- [ ] Finance records and sensitive EP/visa/case data are access-controlled.
- [ ] Direct API calls enforce the same rules as the UI.
- [ ] Unauthorized data exports fail safely.
- [ ] Access revocation takes effect immediately.

### Exchange operations

- [ ] Match only to a valid slot with remaining capacity and compatible requirements.
- [ ] Duplicate matching cannot overbook a slot under concurrent requests.
- [ ] Accommodation allocation prevents overlapping bed/date conflicts.
- [ ] The correct version of standards is applied to the cohort.
- [ ] A missing visa verification produces a hold/task; it does not fabricate clearance.
- [ ] Pickup changes notify the correct owner and preserve the previous plan.

### Analytics and integration

- [ ] KPI aggregates equal the underlying filtered records.
- [ ] Empty datasets display `0` or `N/A` appropriately.
- [ ] EXPA mapping handles unknown/new raw statuses without corrupting data.
- [ ] Re-running a sync or automation does not duplicate records/tasks/messages.
- [ ] Sync failures are visible, retryable, and auditable.

### UX and recovery

- [ ] Table search, filters, sorting, pagination, and export work together.
- [ ] Forms have clear validation, cancel, save, and unsaved-change behaviour.
- [ ] Main flows work at 375px width and with keyboard navigation.
- [ ] Backup restore is tested against a non-production environment.
- [ ] Production cannot be reset through ordinary UI access.

---

## 12. Rules for the coding agent implementing this roadmap

Use this section as the execution contract for any AI coding agent.

1. **Inspect before editing.** Read the actual current code, migrations, Supabase policies, and tests. Do not assume that an item in a previous audit is still a defect.
2. **No whole-app rewrite by default.** Preserve the established Next.js/Supabase architecture unless there is a demonstrated technical reason to change it.
3. **Reconcile specification conflicts.** If the master specification, skills guide, old audit blueprint, live behavior, and current code disagree, document the conflict and select the currently approved requirement with the product owner before making a destructive change.
4. **No fictional AIESEC policy.** Never invent APIP/AEPP rules, standards wording, legal/visa requirements, compensation rules, or official deadlines. Link unknown rules as `NEEDS_VERIFICATION` and request an authorized decision in the product's admin workflow.
5. **No hardcoded live metrics.** Metrics must be derived from source data and tested.
6. **No fake functionality.** Buttons and UI affordances must perform the advertised action or be disabled with an explicit reason.
7. **Protect current data.** Migrations must be reversible where practical, preserve production records, and avoid silent destructive rewrites. Include a backup/rollback plan for risky migrations.
8. **Enforce security on the server/database.** Client-side hiding is not authorization.
9. **Test each vertical slice.** Add tests for new behaviour and run relevant tests, type checks, lint, and production build before marking work complete.
10. **Show evidence.** For each completed issue, report files changed, migration changes, tests run/results, known limitations, and manual verification steps.
11. **Keep tasks small.** Implement the roadmap phase by phase. Do not start the next phase while a P0 exit gate is failing.
12. **Do not mutate EXPA unofficially.** Check official developer/API guidance and permissions first. Keep sync failures visible and human-reviewed when action certainty is low.

### Suggested task format

For every implementation task, require:

- `Problem`
- `AIESEC process/source basis`
- `Current implementation confirmed in code`
- `Desired behaviour`
- `Data-model/API changes`
- `Permission and privacy impact`
- `Acceptance tests`
- `Migration/rollback plan`
- `Completion evidence`

---

## 13. Sources and further verification

### Public Hub pages reviewed

1. [AIESEC Hub — main portal](https://www.hub.aiesec.org/)
2. [Exchange Hub](https://www.hub.aiesec.org/exchange-hub)
3. [IM Hub — EXPA guidance](https://www.hub.aiesec.org/im-hub)
4. [ICB Hub — portfolio integrity and customer centricity](https://www.hub.aiesec.org/icb-hub)
5. [Functional Hub](https://www.hub.aiesec.org/functional-hub)
6. [The AIESEC Way](https://www.hub.aiesec.org/aiesec-way)

### Repository documents reviewed

1. [README.md](https://github.com/wadiihani/iCX-ERP/blob/main/README.md)
2. [AIESEC iCX ERP Skills Guide](https://github.com/wadiihani/iCX-ERP/blob/main/AIESEC_ICX_ERP_SKILLS_GUIDE.md)
3. [Tracker First Master Specification](https://github.com/wadiihani/iCX-ERP/blob/main/AIESEC_iCX_ERP_Tracker_First_Master_Specification.md)
4. [Older audit and change blueprint](https://github.com/wadiihani/iCX-ERP/blob/main/aiesec_icx_erp_vercel_audit_and_complete_changes_blueprint.md)
5. [Dashboard KPI and graph architecture](https://github.com/wadiihani/iCX-ERP/blob/main/Aiesec%20Icx%20Erp%20Dashboard%20Kpis%20And%20Graph%20Architecture.md)
6. [Dashboard graph instruments specification](https://github.com/wadiihani/iCX-ERP/blob/main/ICX_ERP_Dashboard_Graph_Instruments_Spec.md)

### Before production implementation, obtain and verify from authorized AIESEC sources

- Current Refreshed Exchange Standards and their definitions/evidence requirements
- Current Partner Standards
- Current APIP and AEPP, including applicable annexes and escalation/compensation provisions
- Current iGV/iGTa/iGTe product portfolio and experience requirements
- Current EXPA status, process, integration, and permission guidance
- Current Visa Hub information relevant to Morocco and the relevant partner countries
- Current AFPM/finance guidance, plus local MC Morocco and LC Rabat approvals
- Local privacy, data retention, incident access, and safeguarding procedures

---

## 14. Definition of success

The ERP is ready for confident operational use when:

- Every active exchange has a traceable journey from partner commitment/opportunity to EP outcome.
- Every active record has an owner and a next action or an explicitly justified terminal state.
- Critical transitions require verified evidence and append an audit record.
- Partner and EP histories remain intact when deals are lost, participants withdraw, matches break, or ownership changes.
- Standards and policy requirements are versioned and traceable to approved sources.
- No executive KPI is hardcoded or detached from its source records.
- Sensitive data is accessible only to authorized roles.
- Operations can be handed over between members and mandates without losing context.
- Automated tests cover both normal flows and exceptional cases.
- Team leaders can use the system to identify the next action, not only inspect what has already happened.
