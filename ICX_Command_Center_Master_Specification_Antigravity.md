# AIESEC iCX Command Center

## Master Product, Architecture & Implementation Specification for Antigravity

**Document type:** Master project framing / implementation brief\
**Target organization:** AIESEC in Rabat, Morocco\
**Initial products:** Incoming Global Volunteer (iGV), Incoming Global
Talent (iGTa), Incoming Global Teacher (iGTe)\
**Primary audience:** Antigravity, product/engineering contributors, iCX
process owners\
**Status:** Architecture baseline --- validate policy-dependent rules
before enforcement\
**Version:** 1.0\
**Date:** 14 November 2026

------------------------------------------------------------------------

# 0. Instructions to Antigravity --- Read First

You are building a real operational platform, not a landing page, static
dashboard, or generic CRUD application.

Your responsibility is to translate this specification into a coherent,
secure, maintainable, AI-enabled iCX operating system. Treat this
document as the primary product and architecture brief. Do not silently
omit requirements, invent AIESEC rules, or replace the specified
architecture with a simpler unrelated stack.

## 0.1 Non-negotiable constraints

1.  **Do not use React.** The frontend must use SvelteKit, Svelte 5, and
    TypeScript.
2.  Build an application with a real backend, relational database,
    authentication, authorization, migrations, tests, and operational
    workflows. Do not simulate core functionality with local arrays or
    browser-only state.
3.  PostgreSQL is the local system of record for Rabat's operational
    data. EXPA remains authoritative for official global exchange
    records and statuses where the source research identifies it as
    authoritative.
4.  iGV, iGTa, and iGTe share platform foundations but must have
    distinct product-specific rules, forms, validations, and workflows.
5.  Keep **official EXPA status** separate from **local operational
    readiness**. A local task being complete must not automatically
    mutate an EXPA status.
6.  Deterministic rules must be implemented in tested code, not
    delegated to an LLM. AI may explain, summarize, classify, recommend,
    and prepare actions; it must not make unapproved consequential
    decisions.
7.  Every consequential AI action must have an explicit approval
    boundary. Financial actions, eligibility decisions,
    acceptance/rejection, EXPA mutations, external communications,
    legal/compliance decisions, and Zendesk submissions require human
    approval.
8.  Preserve evidence provenance for business rules. Do not convert
    `[INFERRED]`, `[RECOMMENDED]`, or `[UNKNOWN]` into enforced policy.
9.  Build a modular monolith first. Do not introduce microservices,
    Kubernetes, Kafka, or distributed infrastructure without a
    demonstrated need.
10. Make the system responsive and usable on desktop, tablet, and
    mobile. Support graceful network interruption and retry for field
    workflows.
11. Use secure private file storage. Do not expose passports, CVs,
    contracts, medical/police records, or other sensitive documents
    through public URLs.
12. Do not claim an integration works until its credentials, scopes, API
    behavior, and failure modes have been verified.

## 0.2 How to work with this specification

Before writing large amounts of code:

-   Inspect the existing repository and preserve useful working
    functionality.
-   Produce a short implementation plan and identify any conflicts with
    the existing codebase.
-   Establish the domain model, API contracts, permissions, and design
    tokens before implementing many screens.
-   Implement vertical slices that run end-to-end rather than building
    disconnected screens.
-   Keep a living `docs/` folder. Update it when architecture, schemas,
    workflows, or decisions change.
-   Record assumptions and unresolved questions in `docs/decisions/` and
    `docs/policy-validation/`.
-   If an important requirement is ambiguous, implement a configurable
    placeholder or raise a decision. Do not guess.

## 0.3 Required deliverables

The project is not complete when the UI merely looks finished. The
implementation must include:

-   Working authentication and role-based access control.
-   PostgreSQL schema and versioned migrations.
-   Core CRM, PRM, IRM, Opportunity, Application, Exchange, CXP,
    Finance/Legalities, Tasks, and Analytics modules.
-   Auditable workflow and status history.
-   Product-specific validation for iGV, iGTa, and iGTe.
-   Human-in-the-loop AI workspace with traceable runs and approvals.
-   EXPA integration adapter with a safe CSV/manual fallback if API
    access is unavailable.
-   Document and knowledge ingestion with source/version tracking.
-   Automated tests for domain rules, API permissions, and critical
    workflows.
-   Seed/demo data clearly marked as synthetic.
-   Deployment configuration, environment template, setup instructions,
    and operational documentation.

------------------------------------------------------------------------

# 1. Product Vision

## 1.1 Product definition

Build the **AIESEC iCX Command Center**: a unified operational platform
that connects local partner acquisition, international relations,
opportunity management, EP attraction and screening, matching, exchange
delivery, customer experience, finance/legalities, and performance
management.

It should replace fragmented spreadsheets, disconnected conversations,
manual reminders, duplicated records, and fragile handovers with a
shared operational source of truth.

The system must help the LC answer, at any moment:

-   Which local partners are being developed, and what is the next
    action?
-   Which contracts are active, expiring, or missing?
-   Which opportunities are valid, published, underfilled, or at risk?
-   Which international entities can supply relevant EPs?
-   Which EPs need contact, screening, matching, preparation, or
    support?
-   Which exchanges are at risk of failing a standard or deadline?
-   What is blocking progression through the funnel?
-   Which actions should the team take next?
-   What can AI safely prepare or automate, and what requires approval?

## 1.2 Business model: two-sided marketplace

iCX is modeled as two connected sides that meet at the EP application
and matching process.

### Local supply side --- B2B

Local organizations in Rabat provide hosting capacity:

`Prospect → Qualified Lead → Contacted → Meeting → Negotiation → Contract → Account → Opportunity → Slot`

These organizations may include NGOs, schools, educational institutions,
startups, companies, and other eligible hosts, depending on the
product's rules.

### Global demand side --- B2C through IR

Foreign Sending Entities (SEs), represented by Local Committees (LCs) or
other authorized entities, connect eligible EPs to local opportunities:

`Target SE → IR Research → IR Outreach → IR Partnership → Opportunity Promotion → EP Pipeline`

### Junction

`Local Opportunity Slot + EP from Sending Entity → EP Application → Matching → Exchange → CXP → Completion`

**Important relationship rule:** the Opportunity Provider (OP) and the
Local Hosting Partner are the same local B2B organization in the
operational model. The international Sending Entity does not own the
local opportunity. Do not model an international entity as the parent of
a local opportunity.

## 1.3 Product outcomes

The platform should optimize for:

-   Higher quality applications and better application-to-acceptance
    conversion.
-   Reliable, compliant, and well-prepared exchanges.
-   Strong local partner relationships and repeat opportunities.
-   Better IR alignment and more qualified EP supply.
-   Fewer missed SLAs, incomplete standards, and preventable
    cancellations.
-   Transparent accountability and smooth member handovers.
-   Evidence-based management decisions.
-   Reduced repetitive administrative work through controlled
    automation.

The local strategic context in the discovery research emphasizes quality
of realization and partner trust. Do not optimize solely for raw
application volume.

------------------------------------------------------------------------

# 2. Evidence, Authority & Policy Governance

The operational discovery file supplied for this project uses five
evidence labels. Preserve them in the knowledge base, rule registry, and
documentation.

  -----------------------------------------------------------------------
  Label                   Meaning                 Implementation
                                                  treatment
  ----------------------- ----------------------- -----------------------
  `[VERIFIED]`            Directly supported by   Candidate for
                          an identified           implementation after
                          authoritative AIESEC    source/version review
                          source                  

  `[OBSERVED]`            Directly observed in    Implement only within
                          EXPA/GIS documentation  the observed scope
                          or local Rabat files    

  `[INFERRED]`            Derived by connecting   Advisory until
                          sources                 validated

  `[RECOMMENDED]`         Proposed system or      Product/technical
                          architecture design     decision, not AIESEC
                                                  policy

  `[UNKNOWN]`             Not sufficiently        Do not enforce; surface
                          documented or           as an open question
                          accessible              
  -----------------------------------------------------------------------

## 2.1 Authority hierarchy

Implement a configurable knowledge-source hierarchy, not a hard-coded
assumption that every uploaded file has equal authority.

The initial source inventory includes:

-   AIESEC Portfolio Internal Policies (APIP).
-   AIESEC Exchange Program Policies (AEPP).
-   Annex 2 / compensation and financial policy material.
-   Financial Procedures Manual.
-   Exchange Standards refreshment material.
-   Partner Standards.
-   ECBA 2026 policy/update training.
-   ICB eligibility audit material.
-   iGV Hub training and portfolio.
-   iGT Hub training, SOPs, and pricing.
-   EXPA/GIS API documentation.
-   AIESEC in Rabat local strategy, sales, operational workspaces, and
    reports.

Store for every knowledge item:

-   Title and source URL/file ID.
-   Issuing authority and product scope.
-   Publication/effective date and version.
-   Ingestion date and checksum.
-   Supersedes/superseded-by relationship where known.
-   Evidence label.
-   Extracted sections and citations.
-   Review status and reviewer.
-   Whether it is approved for operational rule enforcement.

## 2.2 Conflicts that must remain visible

The discovery file identifies unresolved or version-sensitive questions,
including:

1.  Exchange Standards: legacy material references 16, while the 2024
    refreshment describes 18 and a 16-of-18 completion threshold with
    mandatory standards.
2.  iGV and iGTe duration updates between older AEPP material and ECBA
    2026 updates.
3.  EAR audit deadline differences (21st vs 28th).
4.  Partner Standard #10 debrief window differences (14 days vs up to
    one month).
5.  An outdated GV portfolio tab.
6.  Moroccan internship/contract and work-permit requirements.
7.  Rabat iGV fees and iGT base pricing.
8.  Availability of authorized GIS/EXPA OAuth/API access, private
    mutations, and rate limits.

Create a **Policy & Decisions Register**. Each conflict must have:
question, sources, source dates, product scope, impact, decision owner,
current decision, effective date, and status. Until resolved, affected
rules must be non-enforcing/configurable and visibly marked.

Never silently select one side of a conflict.

------------------------------------------------------------------------

# 3. Product Scope & Domain Modules

The application is one connected ecosystem with modular ownership.
Modules may have their own navigation, dashboards, permissions, and
workflows, but must use shared entities and consistent identifiers.

## 3.1 Command Center

Purpose: role-aware operational home.

Core capabilities:

-   Personal task queue and overdue items.
-   Team workload and ownership.
-   EP funnel overview.
-   Partner and opportunity pipeline.
-   Exchange delivery and standards risk.
-   Upcoming arrivals, departures, deadlines, meetings, and contract
    renewals.
-   AI-generated operational brief with citations and confidence.
-   Alerts requiring approval or human intervention.
-   Filters by product, team, owner, stage, date, and risk.
-   Drill-through from KPI to the underlying records.

The dashboard must never display a KPI without a clear definition,
calculation period, and source.

## 3.2 CRM --- Exchange Participant Management

Owns EP profiles, application-related information, screening, and EP
communications.

Capabilities:

-   EP profile and contact details.
-   Sending Entity / home LC relationship.
-   Product interest and preferences.
-   Application history.
-   CV and required document metadata.
-   Prescreening questions and answers.
-   Eligibility review and evidence.
-   Screening calls and notes.
-   Communication timeline.
-   Application-to-opportunity fit.
-   Follow-up tasks and SLA timers.
-   Consent, data access, retention, and export controls.
-   Duplicate detection and record merge workflow.

Sensitive EP data must be access-controlled and masked by default where
appropriate.

## 3.3 PRM --- Local Partner Relationship Management

Owns local B2B organization development and account management.

Capabilities:

-   Organization directory and deduplication.
-   Organization legal identity, sector, type, website, location, and
    eligibility attributes.
-   Multiple contacts per organization.
-   Lead owner, team, source, and territory.
-   Qualification framework including BANT: Budget, Authority, Needs,
    Timeline.
-   Buyer persona and needs.
-   Outreach and communication history.
-   Calls, meetings, notes, next steps, and follow-up reminders.
-   Proposal and negotiation tracking.
-   Contract repository and version history.
-   Account plans and relationship health.
-   Partner standards tracking.
-   Renewal, expansion, cross-selling, and closure.
-   Lead aging and conversion analytics.

The discovery file describes a local partner pipeline from suspect/new
lead through contract signed. Use configurable stage definitions rather
than assuming every local team uses identical labels.

## 3.4 IRM --- International Relations Management

Owns relationships with foreign Sending Entities and the international
EP supply pipeline.

Capabilities:

-   Country and Local Committee directory.
-   MC/LC hierarchy where available.
-   IR owner and relationship history.
-   SnD cluster/segment (e.g. Upscale, Grow, Invest, Understand) as
    configurable labels.
-   Visa feasibility notes and source.
-   Product/background alignment.
-   Opportunity promotion history.
-   IR calls, meeting minutes, commitments, and follow-ups.
-   EP pipeline commitments and actual conversion.
-   Relationship health and engagement.
-   Country/LC performance analytics.
-   Active iGT weekly call tracking where applicable and validated.

Do not infer visa eligibility from nationality alone. Visa feasibility
must be a sourced, dated operational assessment and should not be
presented as legal advice.

## 3.5 Opportunity Management

Owns the local product catalog, opportunities, slots, requirements, and
promotion readiness.

Capabilities:

-   Opportunity linked to a local hosting organization/account.
-   Contract and authorization prerequisite.
-   Product type: iGV, iGTa, iGTe.
-   Opportunity title, description, location, language, skills,
    background, and SDG/project alignment where relevant.
-   Modality.
-   Start/end dates and duration.
-   Weekly hours.
-   Job description and measurable responsibilities/KPIs.
-   Line manager and contact details.
-   Compensation/benefits/logistics.
-   Covered vs provided logistics.
-   Required documents and screening questions.
-   Slots/openings and date windows.
-   Capacity, filled count, and availability.
-   Internal validation checklist.
-   EXPA reference and synchronization status.
-   Publication status and promotion assets.
-   Opportunity performance and closure.

An opportunity should not be publishable until required prerequisites
are satisfied. The exact checklist must be product-specific and
configurable.

## 3.6 Application & Matching Management

Owns the relationship between an EP and an opportunity slot.

Capabilities:

-   Application record with EP, opportunity, slot, and Sending Entity.
-   Application screening checklist.
-   Eligibility and document review.
-   Fit assessment.
-   Interview scheduling and outcome.
-   OP decision and reason.
-   Acceptance Note tracking.
-   SE payment evidence tracking.
-   Matching and approval readiness.
-   Slot capacity checks.
-   Duplicate and conflicting application detection.
-   Status history and audit trail.
-   Withdrawal, rejection, break, and exception handling.

Do not merge an EP profile, an application, a proposed match, an
approved match, and an exchange into one entity. They are different
business concepts.

## 3.7 Exchange Operations

Owns preparation, arrival, realization, delivery, support, and
departure.

Capabilities:

-   Exchange record linked to approved application.
-   Preparation plan and milestones.
-   Passport/visa/insurance document checklist where relevant.
-   Travel and arrival information.
-   Accommodation details and checks.
-   Airport pickup / local transport.
-   IPS / first-day onboarding.
-   Line manager and worksite readiness.
-   Standards checklist and evidence.
-   Working-hours, JD, benefit, and salary monitoring.
-   LEAD and cultural experience sessions.
-   Review checkpoints.
-   Complaint and incident handling.
-   Departure support.
-   Early FI, late FI, and break case workflows.
-   Exchange completion readiness.

Physical, partly remote, and fully remote exchanges require different
operational checklists. Fully remote should not be forced through visa,
pickup, or accommodation steps that do not apply.

## 3.8 CXP --- Customer Experience & Partner Standards

Owns experience quality, partner obligations, feedback, and case
management.

Capabilities:

-   Exchange Standards checklist (18 standards in the 2024 refreshment
    source; validate active policy version).
-   Mandatory/non-mandatory classification from approved policy data.
-   Evidence uploads and verification.
-   Partner Standards checklist (10 standards in the source inventory).
-   OP alignment spaces and review checkpoints.
-   Partner NPS and EP survey tracking.
-   Debrief and partner closing meeting.
-   Complaints, incidents, and escalation timelines.
-   Corrective/preventive actions.
-   Completion readiness.
-   Partner renewal/closure insight.

Do not infer that all standards are equivalent. Each standard needs a
definition, product applicability, owner, deadline, evidence
requirement, and policy version.

## 3.9 Finance & Legalities

Owns operational financial visibility and compliance documentation. It
is not a replacement for the LC's external accounting system.

Capabilities:

-   Contract financial terms.
-   Opportunity fee and pricing configuration.
-   iGT pricing calculator as a configurable ruleset.
-   Payment milestones, expected amounts, due dates, and proof.
-   Invoice/receipt references.
-   Refund, penalty, and Annex 2 case tracking.
-   Outstanding receivables and payment status.
-   Financial approval queue.
-   Contract templates and signed versions.
-   Legal document checklist.
-   IAC document repository/checklist.
-   Risk register and audit readiness.
-   Exportable finance reports with permission checks.

All calculations must be deterministic and versioned. No LLM may
calculate or approve money movement. Do not encode unconfirmed Rabat
pricing or Moroccan legal requirements as defaults.

## 3.10 Tasks, Workflow & Notifications

Shared operational layer used by every module.

Capabilities:

-   Tasks with owner, creator, due date, priority, status, related
    entity, and source workflow.
-   Recurring and generated tasks.
-   SLA timers and escalation rules.
-   Checklists and dependencies.
-   Team workload.
-   Comments and activity timeline.
-   In-app notifications.
-   Email/calendar integration only after authorization.
-   Notification preferences and digest settings.
-   Retry and failure visibility.
-   Assignment and reassignment with audit trail.

A task must have a clear action, owner, due date or reason for no due
date, and related business context.

## 3.11 Analytics & Reporting

Provide role-specific analytics with transparent definitions.

Required analytics:

-   EP funnel: APP → ACC → APD → RE → FI → CO, plus exceptions.
-   Conversion by stage, product, opportunity, country, Sending Entity,
    owner, and cohort.
-   Time in stage and SLA compliance.
-   Application-to-contact and application-to-acceptance time.
-   Opportunity fill rate and aging.
-   Partner pipeline conversion and lead aging.
-   IR engagement and EP delivery.
-   Exchange standards completion and risk.
-   Partner standards and NPS.
-   Realization/completion quality.
-   Financial milestones and outstanding payments.
-   Team ownership and workload.
-   Forecasts with confidence intervals only when enough data exists.

Show small-sample warnings. Do not present correlation as causation or
AI-generated diagnosis as a verified fact.

------------------------------------------------------------------------

# 4. Product-Specific Operating Rules

The following are the product characteristics reported in the supplied
discovery research. Treat them as source-derived requirements requiring
confirmation against the active official policy version before
enforcement.

## 4.1 Shared foundations

-   Shared EXPA funnel:
    `Open → Applied → Accepted → Approved → Realized → Finished → Completed`.
-   Shared Exchange Standards and Partner Standards frameworks, with
    current version and applicability stored explicitly.
-   Separate product workflows and validators.
-   Opportunity and exchange records must retain product identity
    throughout their lifecycle.

## 4.2 iGV --- Incoming Global Volunteer

Discovery-reported characteristics:

-   Social impact projects aligned to Global Projects and SDGs.
-   Physical modality only.
-   Duration reported as 4--8 weeks under the 2026 update.
-   Working hours reported as 25--40 per week.
-   Unpaid; housing, food, and transport may be optional benefits.
-   Host types may include NGOs, schools, government bodies, or eligible
    AIESEC entities under the stated model.
-   Local project fees and sponsorships may apply.

System requirements:

-   SDG/project catalog and project alignment.
-   Physical-only modality validator.
-   Duration and weekly-hours validator.
-   Unpaid remuneration validator with optional benefit fields.
-   Host eligibility checklist.
-   Project fee/sponsorship configuration.
-   Arrival, accommodation, and cultural experience workflows.

## 4.3 iGTa --- Incoming Global Talent

Discovery-reported characteristics:

-   Professional internships across work fields: BA, BD, MKT, IT, ENG,
    FIN, Other.
-   Physical, partly remote, or fully remote modalities.
-   Short: 6--12 weeks; medium: 13--26 weeks; long: 27--78 weeks.
-   35--45 working hours per week.
-   For 6--8 weeks: salary OR accommodation is reported as acceptable;
    beyond 8 weeks, salary covering living costs is reported as
    mandatory.
-   Registered organizations; AIESEC entities are reported as prohibited
    hosts.
-   Weekly ICB eligibility audit is reported for physical and fully
    remote cases.
-   2026 value-based pricing is referenced.

System requirements:

-   Work-field taxonomy.
-   Modality-aware operations.
-   Duration tier classification.
-   Compensation/benefit validator with policy version.
-   Host registration and AIESEC-entity exclusion.
-   ICB audit checklist where applicable.
-   Pricing calculator as a versioned, configurable ruleset.
-   Skills and role requirements.

## 4.4 iGTe --- Incoming Global Teacher

Discovery-reported characteristics:

-   Teaching roles in schools and language centers.
-   Physical, partly remote, or fully remote modalities.
-   Short: 6--12 weeks; medium: 13--26 weeks; long: 27--78 weeks.
-   35--45 working hours per week.
-   Mandatory salary is reported for all durations.
-   Accredited educational institution; AIESEC entities are reported as
    prohibited hosts.
-   Weekly ICB eligibility audit and additional legality research are
    reported, including qualifications and other required documents.

System requirements:

-   Institution accreditation checklist.
-   Teaching role and qualification requirements.
-   Modality-aware operations.
-   Duration and hours validator.
-   Mandatory salary validator.
-   ICB audit and qualification/legal-document checklist.
-   Country/local legal review status and evidence.

## 4.5 Rules engine design

Never scatter business rules across frontend components.

Create a versioned rules engine with:

-   Rule ID and human-readable title.
-   Product and workflow scope.
-   Condition/expression.
-   Severity: informational, warning, blocking.
-   Evidence source and policy version.
-   Effective-from/effective-to dates.
-   Approval status.
-   Test cases.
-   Rule owner.
-   Override permission and mandatory override reason.
-   Audit record for every evaluation and override.

A rule with unresolved evidence must be advisory or disabled. A blocking
rule must be backed by an approved source and explicit product-owner
sign-off.

------------------------------------------------------------------------

# 5. Lifecycle & Workflow Architecture

## 5.1 Official EXPA status vs local operational status

Maintain two independent state dimensions:

### A. Official exchange status

The discovery file identifies these EXPA status codes:

-   `APP` --- Applied
-   `ACC` --- Accepted
-   `APD` --- Approved
-   `RE` --- Realized
-   `FI` --- Finished
-   `CO` --- Completed
-   `REJ` --- Rejected
-   `WDR` --- Withdrawn
-   `BRK_APD` --- Break from Approved
-   `BRK_RE` --- Break from Realized
-   `EARLY_FI` --- Early Finished
-   `LATE_FI` --- Late Finished

The exact allowed transitions and commands must be verified against the
active EXPA API/policy. Do not assume every transition can be made
through an available public endpoint.

### B. Local operational readiness

Examples:

-   `INCOMPLETE`
-   `READY_FOR_REVIEW`
-   `BLOCKED`
-   `AT_RISK`
-   `READY`
-   `IN_PROGRESS`
-   `DONE`
-   `WAIVED_WITH_APPROVAL`

Each local checklist/task has its own state. An exchange can be
officially `APD` while local preparation is `AT_RISK`. This distinction
is essential.

## 5.2 Partner acquisition workflow

Suggested configurable stages:

`Suspect → Qualified → Contacted → Meeting Scheduled → Meeting Held → Proposal → Negotiation → Contract Signed → Active Account`

Possible terminal/holding states:

`Unqualified`, `No Response`, `On Hold`, `Lost`, `Renewal Due`.

Required events:

-   Lead created.
-   Contact added.
-   Outreach logged.
-   Meeting scheduled/held.
-   Qualification updated.
-   Proposal issued.
-   Contract draft created.
-   Contract approved/signed.
-   Account activated.
-   Owner handover completed.

## 5.3 International relations workflow

Suggested stages:

`Target Identified → Researched → Prioritized → Contacted → Meeting/Call → Partnership Active → Opportunity Promoted → EP Pipeline Committed`

Include:

-   Target rationale.
-   Country/LC.
-   Product and background fit.
-   Visa research source/date.
-   Contact history.
-   Commitment vs actual EPs.
-   Relationship owner.
-   Next action and review date.

## 5.4 Opportunity workflow

Suggested stages:

`Draft → Validation → Approved Internally → Published/Live → Paused → Filled/Closed → Archived`

Prerequisites may include:

-   Eligible host organization.
-   Contract signed and valid.
-   Product-specific fields complete.
-   JD and line manager confirmed.
-   Slots configured.
-   Compensation/logistics verified.
-   Screening questions complete.
-   Required internal approvals.
-   EXPA reference/sync status.

## 5.5 EP application workflow

Use a distinct application record for each EP-to-slot application.

Core flow:

`Applied → Contacted → Screening → Shortlisted → Sent to OP → Interview → OP Decision → Accepted → Approved`

Possible outcomes include rejection, withdrawal, timeout, and other
approved exception states.

Track the discovery-reported operational SLAs (for example, first
contact within 24--48 hours and forwarding shortlisted profiles within
three working days) as **configurable policy timers** pending
validation. SLA breach should generate an alert and audit event, not
silently change an EXPA status.

## 5.6 Matching and approval

Keep these concepts separate:

1.  Application submitted.
2.  Candidate screened.
3.  Candidate shortlisted.
4.  Candidate sent to OP.
5.  Interview completed.
6.  OP selection recorded.
7.  Acceptance Note signed.
8.  Required SE payment evidence recorded.
9.  Match approved / EXPA `APD` confirmed.

Slot capacity must be protected against concurrent approvals. Use
database transactions and unique/locking strategies to prevent
overbooking.

## 5.7 Preparation and arrival

Preparation tasks depend on product and modality:

-   Passport and visa requirements.
-   Insurance.
-   Flight and arrival details.
-   Accommodation.
-   Pickup and local transport.
-   Emergency contacts.
-   IPS and first-day agenda.
-   Line manager readiness.
-   Remote onboarding and payment setup for fully remote cases.

For partly remote cases, model remote preparation and physical arrival
as separate milestones.

The discovery file reports a local two-week pre-arrival confirmation
practice for opportunity and accommodation. Implement it as a
configurable Rabat operational rule only after local owner confirmation.

## 5.8 Exchange delivery

Track:

-   Actual start and end dates.
-   Working hours and attendance evidence where appropriate.
-   JD and KPI alignment.
-   Salary/benefit obligations.
-   LEAD and cultural experience.
-   Review checkpoints.
-   Standards evidence.
-   Partner/EP feedback.
-   Incidents and complaint cases.
-   Departure support.

Create reminders based on configured policy and actual exchange dates.

## 5.9 Completion

Completion readiness must be calculated by deterministic code against
the approved standards configuration. The discovery research reports 18
Exchange Standards, with at least 16 of 18 and all 13 mandatory
standards required for CO. Treat the threshold and mandatory list as a
versioned policy configuration requiring validation.

Do not allow an AI agent to mark an exchange completed. The system may
calculate readiness and prepare the action; an authorized human confirms
any EXPA mutation.

## 5.10 Exception workflows

Build explicit case workflows for:

-   Rejection and withdrawal.
-   Break before realization.
-   Break after realization.
-   Early finish.
-   Late finish.
-   Unpaid/delayed salary.
-   Unfair dismissal.
-   Complaint and escalation.
-   Missing standards evidence.
-   Visa or arrival failure.
-   Accommodation failure.
-   Partner non-compliance.
-   Slot cancellation or opportunity closure.

Each case needs: type, severity, linked EP/application/exchange/partner,
chronology, evidence, responsible owner, due dates, proposed resolution,
approval, external submission reference, and final outcome.

The discovery file contains detailed thresholds for some exceptions. Do
not enforce these thresholds until the exact active policy source is
confirmed.

------------------------------------------------------------------------

# 6. Data Architecture

## 6.1 Database principles

-   PostgreSQL as primary relational database.
-   UUID primary keys.
-   Foreign keys and database constraints for integrity.
-   Explicit created/updated timestamps and actor IDs.
-   Soft deletion only where legally and operationally appropriate;
    preserve audit history.
-   Append-only records for status changes, financial events, contract
    versions, approvals, and audit logs.
-   Use JSONB only for genuinely flexible metadata, not as a substitute
    for relational modeling.
-   Store files in private object storage; store metadata, access
    policy, checksum, and references in PostgreSQL.
-   Use transactions for multi-record state changes.
-   Use an outbox pattern for reliable event publication.
-   Add indexes for common filters and reporting paths.
-   Use tenant/organization scoping in the model if expansion beyond
    Rabat is expected.

## 6.2 Core entities

The following is the conceptual baseline, not a claim that every column
is finalized. Produce a reviewed ERD and migrations before broad feature
development.

### Identity and organization

-   `users`
-   `roles`
-   `permissions`
-   `user_role_assignments`
-   `teams`
-   `team_memberships`
-   `organizations`
-   `organization_contacts`
-   `countries`
-   `local_committees`
-   `organization_relationships`

### PRM and contracts

-   `partner_leads`
-   `accounts`
-   `account_owners`
-   `qualification_assessments`
-   `meetings`
-   `communications`
-   `proposals`
-   `contracts`
-   `contract_versions`
-   `contract_signatures`
-   `partner_standard_tracking`

### IRM

-   `ir_partnerships`
-   `ir_interactions`
-   `ir_commitments`
-   `visa_feasibility_assessments`
-   `opportunity_promotions`

### Opportunity

-   `opportunities`
-   `opportunity_igv_details`
-   `opportunity_igt_details`
-   `opportunity_slots`
-   `opportunity_requirements`
-   `opportunity_documents`
-   `opportunity_publication_events`

Use product-specific subtype tables or equivalent validated structures.
Do not create one oversized table with dozens of irrelevant nullable
fields.

### EP and application

-   `exchange_participants`
-   `ep_documents`
-   `ep_preferences`
-   `ep_applications`
-   `application_screenings`
-   `application_interviews`
-   `application_decisions`
-   `matches`
-   `acceptance_notes`

### Exchange operations

-   `exchanges`
-   `exchange_milestones`
-   `exchange_checklists`
-   `exchange_standards`
-   `exchange_standard_evidence`
-   `accommodations`
-   `travel_arrangements`
-   `arrival_records`
-   `line_manager_assignments`
-   `review_checkpoints`
-   `exchange_incidents`
-   `exchange_cases`
-   `departure_records`

### Finance and legalities

-   `pricing_rule_sets`
-   `pricing_calculations`
-   `payment_obligations`
-   `payments`
-   `refunds`
-   `financial_cases`
-   `legal_documents`
-   `iac_audit_items`
-   `risk_register_entries`

### Shared operations

-   `tasks`
-   `task_dependencies`
-   `notifications`
-   `comments`
-   `attachments`
-   `process_status_history`
-   `domain_events`
-   `audit_logs`
-   `approval_requests`
-   `approval_decisions`
-   `integration_connections`
-   `integration_sync_runs`
-   `integration_sync_items`

### AI and knowledge

-   `knowledge_sources`
-   `knowledge_documents`
-   `knowledge_chunks`
-   `knowledge_versions`
-   `ai_agents`
-   `ai_runs`
-   `ai_run_steps`
-   `ai_tool_calls`
-   `ai_recommendations`
-   `ai_approvals`
-   `ai_evaluations`
-   `prompt_versions`

## 6.3 Key relationships

-   One organization has many contacts.
-   An organization may become an account.
-   An account has contracts and opportunities.
-   A contract may authorize one or more opportunities, subject to
    configured terms.
-   An opportunity has one or more slots.
-   A local committee has IR partnerships and sends EPs.
-   An EP can submit multiple applications.
-   An application targets one opportunity slot and has one current
    application lifecycle.
-   A successful approved application may create an exchange.
-   An exchange has standards, milestones, tasks, evidence, payments,
    feedback, and cases.
-   An opportunity has partner-standard tracking.
-   Every mutable business entity has an audit/activity history.

## 6.4 Data dictionary minimums

For each field, document:

-   Field name and meaning.
-   Type, nullability, and default.
-   Source of truth.
-   Data classification (public/internal/confidential/sensitive).
-   Product applicability.
-   Validation rule and evidence.
-   Who may view/edit.
-   Retention/deletion requirement.
-   Whether it is synchronized with EXPA or another system.

## 6.5 Data protection

-   Classify EP personal data and sensitive documents.
-   Encrypt data in transit and at rest.
-   Use private object storage with short-lived signed URLs.
-   Apply least-privilege access.
-   Mask passport numbers and sensitive fields in list views.
-   Restrict bulk exports and log every export.
-   Do not send CVs or sensitive EP documents to unauthorized
    recipients.
-   Define retention, deletion, correction, and access-request
    workflows.
-   Avoid putting sensitive personal data in AI prompts unless
    necessary, authorized, and protected.
-   Do not use production personal data in development or evaluation
    fixtures.

------------------------------------------------------------------------

# 7. Technical Architecture

## 7.1 Recommended stack

  -----------------------------------------------------------------------
  Layer                   Technology              Responsibility
  ----------------------- ----------------------- -----------------------
  Web application         SvelteKit + Svelte 5 +  Frontend, routing, SSR
                          TypeScript              where useful

  UI styling              Tailwind CSS            Design tokens and
                                                  responsive styling

  UI primitives           Bits UI                 Accessible headless
                                                  components

  Motion                  GSAP, selectively       Meaningful transitions
                                                  and storytelling

  3D                      Three.js + Threlte,     Limited hero/visual
                          selectively             elements only

  Charts                  Apache ECharts          Dense operational
                                                  analytics

  API                     Python + FastAPI        Typed REST API and
                                                  domain services

  Validation              Pydantic                API/domain boundary
                                                  validation

  Database                PostgreSQL              Operational source of
                                                  truth

  Vector search           pgvector                Knowledge retrieval

  Cache/queue support     Redis                   Cache, rate limiting,
                                                  ephemeral coordination

  AI orchestration        LangGraph               Stateful agent
                                                  workflows and HITL

  Durable workflows       Temporal                Long-running business
                                                  workflows and retries

  Auth                    Supabase Auth or        Identity and session
                          equivalent              management

  Observability           OpenTelemetry +         Traces, metrics, AI run
                          Langfuse                observability

  Packaging               Docker                  Reproducible
                                                  local/deployment
                                                  environment
  -----------------------------------------------------------------------

Technology versions should be selected from stable, supported releases
at implementation time. Pin dependencies and document upgrade policy.

## 7.2 Architecture style

Start with a **modular monolith**:

-   One frontend application.
-   One FastAPI backend organized by domain.
-   One PostgreSQL database with clear domain boundaries.
-   Separate worker processes for Temporal activities and AI runs where
    useful.
-   Shared typed contracts.
-   Event-driven internal communication using domain events and an
    outbox.

Do not prematurely split every module into a microservice.

## 7.3 Repository structure

Use or adapt this structure after inspecting the existing repository:

``` text
icx-command-center/
├── apps/
│   └── web/                         # SvelteKit + Svelte 5 frontend
├── services/
│   ├── api/                         # FastAPI modular monolith
│   │   ├── app/
│   │   │   ├── core/                # config, auth, permissions, errors
│   │   │   ├── modules/
│   │   │   │   ├── identity/
│   │   │   │   ├── organizations/
│   │   │   │   ├── prm/
│   │   │   │   ├── irm/
│   │   │   │   ├── opportunities/
│   │   │   │   ├── crm/
│   │   │   │   ├── applications/
│   │   │   │   ├── exchanges/
│   │   │   │   ├── cxp/
│   │   │   │   ├── finance/
│   │   │   │   ├── tasks/
│   │   │   │   ├── analytics/
│   │   │   │   ├── documents/
│   │   │   │   ├── approvals/
│   │   │   │   └── integrations/
│   │   │   └── main.py
│   │   ├── migrations/
│   │   └── tests/
│   ├── ai/                          # LangGraph agents, tools, RAG, evals
│   └── workers/                     # Temporal workflows and activities
├── packages/
│   ├── contracts/                   # API schemas / generated types
│   ├── design-system/               # shared UI components and tokens
│   └── shared-types/
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── diagrams/
├── infrastructure/
│   ├── docker/
│   ├── deployment/
│   └── monitoring/
├── docs/
│   ├── architecture/
│   ├── domain/
│   ├── api/
│   ├── workflows/
│   ├── ai-governance/
│   ├── security/
│   ├── policy-validation/
│   └── decisions/
├── scripts/
├── tests/
├── .env.example
├── docker-compose.yml
└── README.md
```

## 7.4 Backend module conventions

Each domain module should separate:

-   `models.py` --- persistence models.
-   `schemas.py` --- request/response contracts.
-   `repository.py` --- database access.
-   `service.py` --- domain logic.
-   `router.py` --- HTTP routes.
-   `policies.py` or `rules.py` --- deterministic domain rules.
-   `events.py` --- emitted domain events.
-   `permissions.py` --- domain-specific authorization.
-   `tests/` --- unit and integration tests.

Do not place business logic in route handlers or frontend components.

## 7.5 API conventions

Use versioned REST routes under `/api/v1`.

Suggested route families:

``` text
/api/v1/auth
/api/v1/users
/api/v1/teams
/api/v1/organizations
/api/v1/contacts
/api/v1/partners
/api/v1/accounts
/api/v1/contracts
/api/v1/ir-partnerships
/api/v1/opportunities
/api/v1/opportunity-slots
/api/v1/eps
/api/v1/applications
/api/v1/matches
/api/v1/exchanges
/api/v1/standards
/api/v1/tasks
/api/v1/cases
/api/v1/payments
/api/v1/documents
/api/v1/analytics
/api/v1/ai
/api/v1/approvals
/api/v1/integrations
```

API requirements:

-   Typed request and response schemas.
-   Pagination, filtering, sorting, and search.
-   Consistent error envelope.
-   Idempotency for retryable mutations.
-   Optimistic concurrency/version checks where appropriate.
-   Rate limiting for sensitive endpoints.
-   Audit logging for important mutations.
-   No unrestricted generic database CRUD endpoint.

## 7.6 Frontend architecture

Organize by feature/domain:

``` text
apps/web/src/
├── lib/
│   ├── api/
│   ├── auth/
│   ├── components/
│   ├── design-system/
│   ├── stores/
│   ├── utils/
│   └── types/
├── routes/
│   ├── (auth)/
│   └── (app)/
│       ├── dashboard/
│       ├── crm/
│       ├── prm/
│       ├── irm/
│       ├── opportunities/
│       ├── applications/
│       ├── exchanges/
│       ├── cxp/
│       ├── finance/
│       ├── analytics/
│       ├── tasks/
│       ├── ai/
│       ├── approvals/
│       ├── knowledge/
│       └── settings/
└── app.html
```

Use server-side data loading where appropriate, typed API clients,
reusable table/filter/form primitives, and clear loading/empty/error
states.

------------------------------------------------------------------------

# 8. AI Architecture & Agent System

## 8.1 AI philosophy

AI is an operational copilot and controlled agent layer, not an
invisible administrator.

AI should:

-   Read authorized context.
-   Retrieve approved knowledge with citations.
-   Analyze structured data through controlled tools.
-   Draft recommendations and communications.
-   Detect missing information and risk.
-   Create draft tasks or proposed updates.
-   Execute low-risk, explicitly permitted actions.
-   Request human approval for consequential actions.
-   Record every run, tool call, source, result, and approval.

AI must not:

-   Bypass permissions.
-   Access arbitrary database tables.
-   invent policy or legal requirements.
-   make final hiring/eligibility/acceptance/rejection decisions.
-   issue payments, refunds, penalties, or financial approvals.
-   mutate official EXPA records without explicit authorization and
    approval.
-   send external communications without approval.
-   submit Zendesk or other formal escalation cases without approval.
-   conceal uncertainty or fabricate citations.

## 8.2 Agent architecture

Use LangGraph for stateful, observable agent workflows. Use a model
gateway so providers can be changed without rewriting business logic.

Recommended agents:

### 1. EP Screening Assistant

Inputs: - EP profile and permitted documents. - Opportunity
requirements/JD. - Product and eligibility rules. - Approved policy
snippets.

Outputs: - Structured profile summary. - Requirement-by-requirement
evidence. - Skill alignment and gaps. - Missing document checklist. -
Suggested interview questions. - Explainable fit assessment with
uncertainty.

Restrictions: - No autonomous acceptance or rejection. - No
protected-attribute inference. - Human reviewer must decide.

### 2. Partner Intelligence Assistant

Inputs: - Organization record. - Approved public research sources. -
Product needs and local strategy. - Existing CRM history.

Outputs: - Organization summary with source links. - Potential iGV/iGT
fit. - Possible needs and buyer personas. - BANT hypotheses clearly
labeled as hypotheses. - Draft outreach in French or English. -
Recommended next action.

Restrictions: - Research must be dated and sourced. - Do not invent
contacts or claims. - Outreach is draft-only until approved.

### 3. IR Intelligence Assistant

Inputs: - Country/LC record. - Opportunity and slot demand. - Prior IR
activity. - Visa feasibility research and source date.

Outputs: - Prioritized IR target suggestions. - Opportunity-to-market
fit. - Draft IR message and call agenda. - Commitment vs actual pipeline
summary.

Restrictions: - Do not make legal visa determinations. - Do not send
messages autonomously unless a separately approved low-risk automation
is configured.

### 4. Exchange Risk & Standards Auditor

Inputs: - Exchange record. - Standards configuration. - Evidence
metadata. - Tasks, deadlines, and incidents.

Outputs: - Missing evidence. - Overdue tasks. - At-risk standards. -
Risk explanation and source. - Suggested remediation tasks. - Draft case
packet.

Restrictions: - No automatic standard waiver. - No automatic
completion. - No Zendesk submission without approval.

### 5. Policy & Legal Knowledge Assistant

Inputs: - Approved knowledge base. - Policy source/version metadata. -
User question and access scope.

Outputs: - Direct answer. - Citations to document, section, version, and
page/slide where available. - Product applicability. - Evidence label. -
Conflicts and uncertainty. - Clear statement when sources do not support
an answer.

Restrictions: - Not legal counsel. - Cannot turn unknown or inferred
rules into policy. - Cannot execute business mutations.

### 6. KPI & Operations Analyst

Inputs: - Authorized analytics views. - Funnel/status history. - Tasks,
SLAs, partner and exchange metrics.

Outputs: - Weekly operational summary. - Funnel bottleneck analysis. -
Cohort comparisons. - Anomaly alerts. - Suggested questions/actions.

Restrictions: - Use approved query tools/views only. - Include
definitions and date ranges. - Warn about low sample sizes. -
Distinguish observed metrics from causal explanations.

### 7. Operations Assistant / Orchestrator

Purpose: - Understand user requests. - Route work to specialist
agents. - Collect results. - Create draft tasks or actions. - Present
approval requests. - Maintain run history.

It must not become a superuser with unrestricted tools.

## 8.3 Tool registry

Agents call typed, permission-checked tools only.

Example tool groups:

-   `search_organizations`
-   `get_partner_account`
-   `get_opportunity`
-   `get_ep_profile`
-   `get_application`
-   `get_exchange`
-   `get_standards_status`
-   `search_knowledge`
-   `get_analytics_metric`
-   `draft_task`
-   `draft_communication`
-   `request_approval`
-   `propose_record_update`

Each tool must define:

-   Input/output schema.
-   User and agent permission checks.
-   Read/write classification.
-   Data sensitivity.
-   Rate limits.
-   Idempotency behavior.
-   Audit event.
-   Approval requirement.
-   Error behavior.

Never expose a raw SQL tool or unrestricted ORM session to an LLM.

## 8.4 Human-in-the-loop approval

Create a dedicated approval center.

Approval request fields:

-   Request ID.
-   Requesting user/agent.
-   Action type.
-   Target entity.
-   Proposed changes or exact communication content.
-   Reason and supporting evidence.
-   Policy/rule references.
-   Risk level.
-   Expiry.
-   Required approver role.
-   Decision, reviewer, timestamp, and comment.

Approval states:

`DRAFT → PENDING → APPROVED / REJECTED / EXPIRED / CANCELLED`

Approval must be bound to the exact action payload. If the payload
changes, invalidate the previous approval and request a new one.

## 8.5 RAG / knowledge system

-   Ingest approved Drive files and other authorized sources.
-   Preserve source title, URL, version, date, authority, product scope,
    and evidence label.
-   Chunk by meaningful headings/slides/pages.
-   Store embeddings in pgvector.
-   Retrieve with metadata filters and access controls.
-   Cite sources in every policy answer.
-   Prefer current authoritative material while showing conflicting
    older material when relevant.
-   Detect stale or superseded documents.
-   Keep ingestion and review status visible.
-   Never index private documents into a public or unprotected vector
    store.

## 8.6 AI observability and evaluation

Record:

-   Agent and prompt version.
-   Model/provider.
-   User request.
-   Retrieved source IDs.
-   Tool calls and results.
-   Latency and token/cost metadata where available.
-   Output and structured validation.
-   Approval outcome.
-   User feedback.
-   Evaluation score.

Create evaluation sets for: - Policy answer citation correctness. -
Product rule classification. - EP screening consistency and bias
checks. - Partner research factuality. - Tool permission enforcement. -
Hallucination and uncertainty handling.

------------------------------------------------------------------------

# 9. Integrations & System Boundaries

## 9.1 EXPA / GIS

The discovery research identifies EXPA as authoritative for:

-   Global EP registration.
-   Official exchange statuses.
-   Global opportunity search.
-   Official exchange and partner surveys.

Integration strategy:

1.  Verify whether MC Morocco or the LC has authorized credentials and
    scopes.
2.  Inspect official API documentation and current authentication
    requirements.
3.  Verify rate limits, available read endpoints, mutation support, and
    webhook/polling options.
4.  Build an adapter layer; do not couple business services directly to
    API details.
5.  Begin with read-only sync if write access is uncertain.
6.  Provide CSV import/export and manual reconciliation fallback.
7.  Store external IDs, sync timestamps, payload checksums, and sync
    errors.
8.  Use idempotency and conflict-resolution rules.
9.  Require human approval for consequential EXPA mutations.
10. Never scrape or bypass access controls.

Suggested adapter methods:

``` text
fetch_opportunities()
fetch_applications()
fetch_exchange_status()
fetch_surveys()
propose_status_change()
execute_approved_status_change()
reconcile_external_record()
```

The last two methods must remain disabled until authorized mutation
access is confirmed.

## 9.2 Google Drive

Use Drive for contracts, legal templates, IAC documents, sales assets,
and knowledge sources.

-   Use authorized OAuth scopes and least privilege.
-   Store document metadata and Drive file IDs.
-   Do not duplicate sensitive binaries unnecessarily.
-   Maintain version/checksum metadata.
-   Use controlled ingestion into RAG.
-   Do not assume every file is readable or accessible.

## 9.3 Email and calendar

Potential integrations:

-   Email drafting and sending.
-   Meeting scheduling.
-   Calendar reminders.
-   Shared team calendars.

Start with draft creation and user-authorized sending. Record
communication metadata and linked entity. Do not store full mailbox
content unless required and authorized.

## 9.4 WhatsApp

Treat WhatsApp integration as optional and subject to approved Business
API access. Do not automate personal WhatsApp accounts or use unofficial
scraping.

## 9.5 File import/export

Support controlled CSV/XLSX imports for legacy sheets:

-   Column mapping.
-   Preview and validation.
-   Duplicate detection.
-   Row-level errors.
-   Dry-run mode.
-   Import audit record.
-   Rollback strategy where possible.

Exports must respect RBAC, field masking, and audit logging.

------------------------------------------------------------------------

# 10. UX, Visual Design & Interaction System

## 10.1 Design direction

Create a premium, modern, high-clarity enterprise command center. It
should feel like a carefully designed operations product, not a generic
admin template.

Visual direction:

-   Dark-first interface with a complete light theme.
-   Deep charcoal/navy surfaces with restrained accent colors.
-   Strong typography and clear hierarchy.
-   High-quality spacing and alignment.
-   Subtle borders, layered surfaces, and purposeful depth.
-   Crisp data tables and rich detail panels.
-   Refined charts and timeline visualizations.
-   Motion used to clarify state and hierarchy.
-   Minimal decorative clutter.

The system is an operational tool: legibility, speed, and information
density are more important than visual spectacle.

## 10.2 Application shell

Core shell:

-   Collapsible left navigation.
-   Top bar with global search, command palette, notifications, and
    profile.
-   Breadcrumbs and contextual page actions.
-   Main content workspace.
-   Optional right-side AI copilot/context panel.
-   Responsive mobile navigation.

Navigation should adapt to user permissions and responsibilities.

## 10.3 Key screens

1.  **Command Center:** KPI overview, alerts, tasks, activity, AI
    briefing.
2.  **CRM:** EP directory, profile, application history, screening
    workspace.
3.  **PRM:** partner pipeline, organization detail, account plan,
    meetings, contracts.
4.  **IRM:** LC directory, relationship detail, country view, promotion
    and commitment tracking.
5.  **Opportunities:** opportunity list, builder, validation checklist,
    slots, performance.
6.  **Applications:** application queue, screening, interview, matching,
    decision history.
7.  **Exchanges:** exchange timeline, preparation, arrival, delivery,
    standards, incidents.
8.  **CXP:** standards dashboard, evidence review, NPS, cases,
    completion readiness.
9.  **Finance & Legalities:** pricing, payment milestones, contracts,
    IAC checklist, risk register.
10. **Analytics:** dashboards, filters, drill-downs, saved reports.
11. **AI Workspace:** conversations, agent runs, cited answers, drafts,
    action proposals.
12. **Approval Center:** pending approvals, payload review,
    approve/reject with reason.
13. **Knowledge Center:** documents, versions, ingestion status, policy
    conflicts.
14. **Settings:** users, roles, teams, integrations, product rules,
    workflow configuration.

## 10.4 Data-heavy UX patterns

-   Advanced tables with filters, sort, column selection, saved views,
    and pagination.
-   Clear status chips with text labels (never color alone).
-   Side panels for quick review without losing list context.
-   Full detail pages for complex entities.
-   Timeline/activity feed.
-   Bulk actions only where permission-safe and reversible.
-   Empty, loading, error, and offline states.
-   Confirmations for destructive or consequential actions.
-   Clear distinction between AI suggestion, draft, approved action, and
    completed action.

## 10.5 Motion and 3D

Use GSAP and Three.js/Threlte selectively:

-   Smooth page transitions where useful.
-   Subtle chart and metric reveal.
-   Timeline progression.
-   Focus/hover feedback.
-   Limited 3D visualization for a specific overview or brand moment
    only.

Do not add 3D to tables, forms, or every dashboard. Respect
`prefers-reduced-motion`, provide low-motion alternatives, and protect
performance.

## 10.6 Accessibility

-   Keyboard navigation.
-   Visible focus states.
-   Semantic HTML.
-   Accessible labels and validation messages.
-   Sufficient contrast.
-   Screen-reader-friendly status updates.
-   Reduced motion.
-   Accessible dialogs and menus.
-   Do not rely on color alone.

------------------------------------------------------------------------

# 11. Security, Governance & Reliability

## 11.1 Authentication and authorization

Use secure authentication with session management and protected routes.

Implement RBAC plus record-level authorization. Roles in the discovery
research include:

-   BD / B2B Member.
-   IR Member.
-   EP Manager.
-   Operations / CX Member.
-   Team Leader.
-   LCVP iCX.
-   LCVP FnL.
-   LCP / Admin.

Separate organizational responsibility from technical permissions. A job
title does not automatically grant every permission.

Permission examples:

-   `partner.read.assigned`
-   `partner.update.assigned`
-   `contract.read`
-   `contract.approve`
-   `ep.read.assigned`
-   `ep.document.read`
-   `ep.export`
-   `exchange.standards.update`
-   `finance.payment.approve`
-   `expa.status.propose`
-   `expa.status.execute`
-   `user.role.manage`
-   `audit.read`

Use least privilege and explicit approval scopes. Consider PostgreSQL
Row-Level Security as defense in depth.

## 11.2 Audit

Audit events should capture:

-   Actor (user, system, agent).
-   Action.
-   Entity and record ID.
-   Before/after values or safe diff.
-   Timestamp.
-   Request/run/correlation ID.
-   Source (UI/API/automation/integration).
-   Approval reference if applicable.
-   Reason where required.

Audit records must be append-only for normal application users.

## 11.3 Reliability

-   Database backups and tested restoration.
-   Health checks and structured logs.
-   Retry with exponential backoff for transient integration failures.
-   Dead-letter/failure queue visibility.
-   Idempotent workflow activities.
-   Transactional outbox.
-   Explicit integration sync status.
-   Graceful degraded mode when EXPA/Drive/AI providers are unavailable.
-   No silent data loss.

## 11.4 Secrets and environment

-   Never commit secrets.
-   Provide `.env.example` with names and descriptions only.
-   Use deployment secret management.
-   Separate development, staging, and production credentials.
-   Rotate API keys.
-   Restrict CORS and trusted origins.
-   Enforce HTTPS in production.

------------------------------------------------------------------------

# 12. Workflow Automation & Temporal

Use Temporal for long-running workflows with retries, timers, human
waits, and durable execution. Do not use a background task that
disappears when a server restarts for critical business processes.

Potential workflows:

-   EP first-contact SLA.
-   Partner follow-up sequence.
-   Contract expiry reminder.
-   Opportunity readiness and approval.
-   Application screening and OP response timer.
-   Pre-arrival preparation.
-   Arrival checklist.
-   Standards checkpoint reminders.
-   Salary/payment reminders.
-   Departure support reminder.
-   Completion readiness review.
-   IAC audit preparation.
-   Integration sync and reconciliation.
-   AI approval timeout/escalation.

Workflow design requirements:

-   Explicit state and version.
-   Idempotent activities.
-   Retry policy.
-   Timeout policy.
-   Human approval/wait state.
-   Cancellation/compensation behavior.
-   Audit trail.
-   Monitoring and manual recovery.

Never send repeated external messages because a workflow retried.
External actions need idempotency keys and delivery tracking.

------------------------------------------------------------------------

# 13. Development Plan & Milestones

Build in vertical slices. The following is a suggested sequence, not a
rigid calendar commitment.

## Phase 0 --- Repository and product foundation

Deliver:

-   Existing repository audit.
-   Architecture decision records.
-   Domain glossary.
-   ERD draft.
-   Evidence/policy register.
-   Monorepo setup.
-   Docker development environment.
-   CI and formatting/linting.
-   Design tokens and application shell.

Exit criteria: - Frontend and backend run locally. - Database migrations
run. - Auth strategy selected. - No React dependency. - Architecture and
policy questions documented.

## Phase 1 --- Identity, organizations, PRM foundation

Deliver:

-   Authentication and roles.
-   Teams and assignments.
-   Organization/contact directory.
-   Partner lead pipeline.
-   BANT/qualification.
-   Meetings and communication log.
-   Contract metadata and document links.
-   Audit trail and tasks.

Exit criteria: - A member can create and manage an assigned lead. - A TL
can review team pipeline. - Permission tests prevent unauthorized
access. - Lead history is auditable.

## Phase 2 --- Opportunities and product rules

Deliver:

-   iGV/iGTa/iGTe product catalog.
-   Product-specific forms and validators.
-   Contracts-to-opportunities relationship.
-   Opportunity slots and capacity.
-   Validation/approval flow.
-   EXPA reference fields and sync status.

Exit criteria: - An opportunity cannot be approved while required
validated prerequisites are missing. - Product-specific fields do not
leak across irrelevant products. - Capacity is consistent under
concurrent updates.

## Phase 3 --- CRM, IRM, applications and matching

Deliver:

-   EP records and document metadata.
-   IR partner directory and interactions.
-   Application records.
-   Screening and interview workflow.
-   Match and acceptance tracking.
-   Application status history.
-   CSV import fallback.

Exit criteria: - EP profile, application, match, and exchange are
separate entities. - A full application-to-approved-match flow works
with synthetic data. - Official EXPA status is separate from local
readiness.

## Phase 4 --- Exchange operations and CXP

Deliver:

-   Exchange record.
-   Preparation/arrival/delivery timelines.
-   Modality-specific checklists.
-   Standards and evidence.
-   Partner standards.
-   Incidents and cases.
-   Completion readiness calculation.

Exit criteria: - A synthetic exchange can progress from approved to
completed readiness. - Missing mandatory evidence blocks readiness
according to approved configuration. - No AI action can mark completion
without authorized human approval.

## Phase 5 --- Finance, legalities and analytics

Deliver:

-   Pricing rulesets and calculator.
-   Payment milestones.
-   Contract financial terms.
-   IAC checklist and risk register.
-   Core funnel and SLA dashboards.
-   Partner, IR, and exchange analytics.

Exit criteria: - Calculations are deterministic, versioned, and
tested. - Financial approvals are role-protected. - KPI definitions and
date ranges are visible.

## Phase 6 --- AI and knowledge

Deliver:

-   Knowledge ingestion pipeline.
-   pgvector retrieval with citations.
-   Policy assistant.
-   EP screening assistant.
-   Partner and IR research assistants.
-   Exchange risk auditor.
-   KPI analyst.
-   AI run logs and evaluations.

Exit criteria: - Every policy answer cites its source/version. - Agent
tools enforce user permissions. - AI recommendations are distinguishable
from verified facts. - No consequential action executes without required
approval.

## Phase 7 --- Workflow automation and integrations

Deliver:

-   Temporal workflows.
-   EXPA read sync if authorized.
-   CSV/manual reconciliation fallback.
-   Drive metadata integration.
-   Email/calendar draft integration.
-   Notifications and retry visibility.

Exit criteria: - Workflow retries do not duplicate external actions. -
Sync errors are visible and recoverable. - Credentials and scopes are
documented. - External writes remain disabled until verified and
approved.

## Phase 8 --- Hardening and rollout

Deliver:

-   Security review.
-   Performance and accessibility testing.
-   Backup/restore test.
-   User acceptance testing.
-   Data migration and reconciliation.
-   Admin/operational documentation.
-   Training and rollout plan.
-   Monitoring and support process.

Exit criteria: - Critical end-to-end tests pass. - No critical
authorization defects. - Backup restoration verified. - Users can
complete core workflows without developer intervention.

------------------------------------------------------------------------

# 14. Testing Strategy

## 14.1 Unit tests

Test:

-   Product validators.
-   Duration and hours rules.
-   Compensation/pricing calculations.
-   Status transition rules.
-   Completion readiness.
-   Permission evaluation.
-   SLA deadline calculation.
-   Slot capacity logic.
-   Idempotency.

## 14.2 Integration tests

Test:

-   API + PostgreSQL.
-   Auth and record-level authorization.
-   File metadata and private access.
-   Outbox event publishing.
-   Temporal workflow activities.
-   CSV import validation.
-   EXPA adapter mocks and reconciliation.

## 14.3 End-to-end tests

Required journeys:

1.  Create a partner lead, qualify it, record a meeting, and create a
    contract draft.
2.  Approve a contract and create an iGV opportunity with slots.
3.  Create an iGTa opportunity and validate its distinct requirements.
4.  Create an iGTe opportunity and validate its distinct requirements.
5.  Import an EP and create an application.
6.  Screen an EP, schedule an interview, record OP decision, and approve
    a match.
7.  Prepare an exchange with product/modality-specific checklists.
8.  Record standards evidence and calculate completion readiness.
9.  Raise an exchange case and route it for approval.
10. Generate an AI recommendation and require human approval before a
    protected action.
11. Attempt unauthorized access and verify denial.
12. Simulate integration failure and verify safe retry/reconciliation.

Use synthetic fixtures only.

------------------------------------------------------------------------

# 15. Definition of Done

A feature is done only when:

-   It solves a documented user/business problem.
-   It has a clear domain owner and permission model.
-   It uses real API/database persistence where required.
-   It has loading, empty, error, and success states.
-   It is responsive and accessible.
-   It has validation and helpful error messages.
-   It has tests for critical rules and permissions.
-   Important changes are audited.
-   It has documentation.
-   It does not violate evidence/policy governance.
-   It does not create an unsafe AI or integration action.
-   It is integrated into navigation and relevant dashboards.
-   It has been reviewed against the design system.

A visually complete screen with nonfunctional buttons is not done.

------------------------------------------------------------------------

# 16. Initial Build Priorities

Do not attempt to build every module at once. Start with the smallest
complete operational loop that proves the architecture.

Recommended first vertical slice:

1.  User authentication and roles.
2.  Organization and contact records.
3.  Partner lead pipeline.
4.  Contract metadata.
5.  Opportunity with product discriminator and slots.
6.  EP profile and application.
7.  Application screening and matching.
8.  Exchange creation.
9.  Status history, tasks, and audit trail.
10. One role-aware dashboard.

Use synthetic data and a mock EXPA adapter initially. Once the model and
workflows are stable, integrate authorized EXPA access.

This first slice must prove the central relationship:

`Local Organization → Account → Contract → Opportunity → Slot`

meets:

`Sending Entity → EP → Application`

at:

`Matching → Exchange → Standards / CXP → Completion`

------------------------------------------------------------------------

# 17. Open Decisions --- Do Not Guess

Maintain this list and update it as stakeholders provide decisions.

  -----------------------------------------------------------------------------
  Decision          Why it matters    Required          Until resolved
                                      owner/evidence    
  ----------------- ----------------- ----------------- -----------------------
  Authorized        Determines sync   MC Morocco /      Mock + CSV/manual
  EXPA/GIS          and mutation      authorized API    fallback
  credentials and   capabilities      owner             
  scopes                                                

  Exact API rate    Prevents unsafe   Official API      Read-only or disabled
  limits and        or unsupported    documentation     
  mutation          integration                         
  endpoints                                             

  Active policy     Determines        Current official  Advisory/configurable
  version for each  validation        policy owner      
  product rule      behavior                            

  18-standard       Completion        Current standards No hard-coded
  definitions and   readiness         source            completion
  mandatory list                                        

  EAR audit         Workflow timers   Current policy    Configurable,
  deadline                            owner             non-blocking

  Partner Standard  Closing reminders Current policy    Configurable
  #10 timing                          owner             

  Morocco iGT       Legal compliance  Qualified local   No legal determination
  contract and                        legal/MC review   
  work-permit                                           
  requirements                                          

  Rabat iGV project Pricing           LCVP iCX / FnL    No assumed default
  fees                                approval          

  Rabat iGT base    Pricing           LCVP iCX / FnL    Configurable draft only
  pricing and                         approval          
  formula                                               
  parameters                                            

  Data retention    Privacy           LC/MC data owner  Conservative restricted
  and deletion      compliance                          access
  schedule                                              

  WhatsApp          Messaging         Authorized        Manual logging
  integration       workflows         Business API      
  availability                        owner             

  Exact local team  RBAC              LCP / LCVP iCX    Least privilege
  role mapping                                          
  -----------------------------------------------------------------------------

------------------------------------------------------------------------

# 18. What Antigravity Must Do First

Before implementing the full system, perform these steps in order:

1.  Inspect the existing repository, branch, current architecture,
    dependencies, and deployed behavior. Do not overwrite working code
    blindly.
2.  Report what exists, what is missing, and what should be reused.
3.  Create `docs/architecture/` with:
    -   `system-overview.md`
    -   `domain-model.md`
    -   `database-erd.md`
    -   `api-design.md`
    -   `security-and-rbac.md`
    -   `ai-architecture.md`
    -   `integration-boundaries.md`
4.  Create `docs/policy-validation/policy-register.md` from Section 2
    and Section 17.
5.  Create an initial ERD and data dictionary. Identify unclear
    cardinalities and fields before migrations.
6.  Create the monorepo and local development environment, respecting
    the no-React requirement.
7.  Implement the design system and application shell with real routing
    and permission-aware navigation.
8.  Implement the first vertical slice from Section 16.
9.  Run tests and demonstrate the complete flow using synthetic data.
10. Only then expand into the remaining modules and AI agents.

## Final instruction

Treat this file as the project contract. Preserve the business model,
product separation, source-of-truth boundaries, evidence labels,
approval controls, and no-React constraint. You may improve
implementation details when justified, but document the change and its
consequences. Never simplify the platform into a generic CRM, never fake
integrations, and never invent AIESEC policy.
