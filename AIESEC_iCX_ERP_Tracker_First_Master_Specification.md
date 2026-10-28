# AIESEC iCX ERP --- Tracker-First Master Specification

**Product:** Integrated ICX ERP for AIESEC in Rabat, designed for
controlled future multi-LC use\
**Operating model:** CRM + PRM + EP lifecycle tracker + opportunity
tracker + IRM + delivery/quality tracker + finance tracker +
task/workload tracker + analytics\
**Primary rule:** This is an operational tracking application, not a
blog, knowledge portal, or long-form article website.\
**Specification status:** Consolidated functional and engineering
baseline. Implementation and policy readiness must be demonstrated
through tests and approvals; this document alone is not proof of
production readiness.

------------------------------------------------------------------------

## 0. Binding product direction: build a working tracker, not a blog

### 0.1 What users must see when they open the app

The default experience must be a **dashboard and data workspace**.
Explanatory text is secondary and should be short, contextual, and
attached to the relevant record or action.

  -------------------------------------------------------------------------
  Screen                  Primary content         Required interactions
  ----------------------- ----------------------- -------------------------
  Executive dashboard     KPI cards, trend        Filter by date, product,
                          charts, funnel charts,  owner, team, stage,
                          overdue queues, risks,  partner, and LC
                          recent activity         

  EP tracker              Searchable/filterable   Open dossier, assign
                          table of individual EPs owner, update permitted
                          and applications        fields, log touchpoint,
                                                  create task, view
                                                  timeline

  Partner CRM / PRM       Organization table plus Add/edit organization and
                          contacts, deals,        contacts, log outreach,
                          contracts,              change deal stage, assign
                          opportunities, and      account owner
                          history                 

  Opportunity tracker     Opportunities and slots Create/update
                          in a table/board with   opportunity, map partner
                          readiness indicators    and IR supply, manage
                                                  slots, validate required
                                                  fields

  IRM tracker             IR/LC partner directory Record IR call,
                          and supply pipeline     relationship owner,
                                                  available supply,
                                                  response status, matching
                                                  actions

  Exchange delivery       EP-by-EP checklist,     Assign actions,
                          standards evidence,     upload/link evidence,
                          arrival, accommodation, mark complete with
                          pickup, touchpoints,    actor/time, escalate
                          departure               blockers

  Case-solving tracker    Case register with      Restrict sensitive
                          severity, stage, owner, access, record decisions,
                          deadlines, evidence,    escalate, audit every
                          and next action         change

  Finance tracker         Invoices, payments,     Filter by stakeholder and
                          expenses, balances,     status; create approved
                          approvals, and aging    transactions; export
                                                  permission-controlled
                                                  reports

  Task & workload tracker Tasks by owner, team,   Reassign with handoff,
                          due date, priority,     bulk-update safe fields,
                          linked record, and      escalate overdue tasks
                          status                  

  Analytics               Interactive charts and  Drill from chart segment
                          pivot-like summaries    to the underlying
                          based on live           filtered records
                          structured data         

  Data quality &          Missing fields,         Resolve/retry/reconcile
  integrations            duplicates, sync        with a logged reason
                          failures, conflicts,    
                          failed jobs,            
                          backup/restore evidence 

  Admin & configuration   Users, roles, teams,    Controlled access,
                          reference lists, policy effective dates,
                          versions, thresholds,   approvals, audit trail
                          integrations            
  -------------------------------------------------------------------------

### 0.2 Required table-first interface

Every core module must have a **real record table**. A card-only
interface is insufficient for operational work.

Minimum table behaviour: - Global search plus column-level filters;
multi-filter combinations must work together. - Sortable columns,
pagination or virtualized rows, saved views, and clear
empty/loading/error states. - Column chooser for optional fields;
user-specific views must not change the underlying data. - Show record
name and stable ID; show owner, stage/status, last update, next action,
and due date wherever relevant. - Row click opens a full record detail
page or side panel, not a blog article. - Bulk actions must be
permission-checked, previewed, and audited; destructive bulk actions
require explicit confirmation. - Inline editing only for fields that are
safe to edit inline; critical status changes must use validated
transitions. - Export respects the same permissions and filters as the
visible table and is logged. - Preserve filters when returning from a
record to its table. - Use human-readable status labels and distinguish
official EXPA status from internal ERP workflow status.

### 0.3 Record detail pages: names, details, ownership, history

Each EP, partner organization, contact, opportunity, IR relationship,
case, invoice, and task needs a dedicated detail view with:

  -----------------------------------------------------------------------
  Panel                               Required information
  ----------------------------------- -----------------------------------
  Identity                            Human-readable name, stable
                                      internal ID, external ID if
                                      applicable, record type, LC/tenant

  Current state                       Status/stage, product, owner, team,
                                      priority/risk, last-updated
                                      timestamp

  Key details                         Fields specific to the record type,
                                      with required fields visibly marked

  Relationships                       Linked EPs, organizations,
                                      contacts, opportunities, slots,
                                      IRs, contracts, cases, invoices,
                                      and tasks

  Timeline                            Chronological calls,
                                      emails/WhatsApp summaries,
                                      meetings, stage changes,
                                      assignments, approvals, uploads,
                                      and integration events

  Next actions                        Open tasks, owner, due date,
                                      blocker, SLA countdown, escalation
                                      level

  Evidence                            Approved document links, checklist
                                      evidence, source references,
                                      verification state

  Audit                               Who changed what and when;
                                      changed-field summary; reason for
                                      sensitive/critical transitions

  Actions                             Role-appropriate actions only;
                                      unavailable actions must explain
                                      the permission or validation
                                      blocker
  -----------------------------------------------------------------------

The detail page must never display passport scans, medical information,
or sensitive case evidence to users who lack explicit permission.

### 0.4 Dashboards and charts are derived from records, not manually typed numbers

  ----------------------------------------------------------------------------
  Dashboard widget        Visualisation                Drill-down target
  ----------------------- ---------------------------- -----------------------
  EP lifecycle            Funnel: Applied → Accepted → EP table filtered to
                          Approved → Realized →        selected stage/date
                          Finished → Completed         range

  Partner sales           Funnel: Lead → Contacted →   Deal table filtered to
                          Meeting → Proposal →         selected stage
                          Negotiation → Agreement →    
                          Live                         

  Opportunity supply      Bar chart by product,        Opportunity/slot table
                          status, partner, and         
                          realization period           

  IR supply and           Table + trend chart by       IRM records and
  responsiveness          IR/LC, response time,        interaction history
                          available EPs, matching      
                          outcomes                     

  Exchange delivery       Completion chart for         EP delivery checklist
  health                  standards/checklists;        
                          red/amber/green overdue      
                          counts                       

  Workload                Tasks by owner/team, overdue Task table
                          tasks, unassigned work,      
                          workload distribution        

  Finance                 Receivables/payables, paid   Transaction/invoice
                          vs outstanding, aging        table
                          buckets, revenue/cost by     
                          product                      

  Quality and case        Cases by severity/stage,     Restricted case list
  solving                 time-to-first-response,      
                          overdue clocks, outcome      

  Data quality            Missing required fields,     Data-quality queue
                          duplicate candidates, orphan 
                          records, failed sync,        
                          unresolved conflicts         

  Partner retention       Active/at-risk/renewal-due   Partner CRM
                          partners, repeat             
                          opportunities, delivery      
                          quality                      

  Department scorecard    Approved KPIs by department, KPI evidence and
                          owner, target, actual,       underlying records
                          trend, reporting period      
  ----------------------------------------------------------------------------

Every chart must display its metric definition, period, last refresh
time, and applied filters. Clicking a chart segment must open the exact
records that contributed to that number. Never present a chart number
that cannot be reconciled to source records.

### 0.5 Department tracking and accountability

The system tracks **work and outcomes across departments**, not just EP
and partner records. Department names and roles are configurable; the
initial workspace must support at least:

  -----------------------------------------------------------------------
  Workstream / department Objects tracked         Minimum accountability
                                                  fields
  ----------------------- ----------------------- -----------------------
  Business Development /  Leads, organizations,   Owner, stage, next
  Sales                   contacts, deals,        action, last contact,
                          meetings, proposals,    follow-up date,
                          contracts               conversion outcome

  Partner Relationship    Partner health,         Account owner, partner
  Management              contacts, renewals,     stage, health, renewal
                          satisfaction, delivery  date, open issues
                          issues                  

  IR / Supply             IR relationships,       IR owner, partner LC,
                          calls, supply promises, last interaction,
                          available slots,        supply state, next
                          response follow-ups     follow-up

  EP Management /         EP dossiers,            EP owner, status,
  Matching                applications,           missing items, match
                          eligibility,            owner, next milestone
                          interviews, matches,    
                          approvals               

  Exchange Operations /   Visa milestones,        Operations owner,
  CXP                     accommodation, pickup,  deadline, evidence,
                          arrival, standards,     blocker, escalation
                          touchpoints, departure  

  Quality / Case Solving  Cases, incidents,       Restricted owner,
                          standards gaps,         severity, stage, due
                          corrective actions      clock, decision
                                                  authority

  Finance & Legal         Invoices, payments,     Initiator, approver,
  coordination            expenses, contract      due date,
                          review, approvals       amount/status, evidence

  Marketing /             Campaigns, leads by     Campaign owner,
  Communications          source,                 channel, deadline,
                          content/collateral      outcome metric
                          requests, partner       
                          visibility deliverables 

  Talent Management /     Users, onboarding,      Manager, role,
  People                  training, role          onboarding state,
                          assignment, workload,   workload, review date
                          O2O and governance      
                          actions                 

  LC leadership /         KPI reviews, decisions, Decision owner, due
  governance              risks, meeting actions, date, status, evidence,
                          escalations             approver
  -----------------------------------------------------------------------

Each task and KPI must be linked to a department, an accountable owner,
and (where relevant) a stakeholder or workflow record. A dashboard must
distinguish **owner**, **contributor**, **approver**, and **watcher**
rather than assigning responsibility ambiguously.

### 0.6 Non-negotiable stakeholder handoff contract

A record must not become "owned by everyone" or "owned by nobody."
Handoffs are explicit transactions.

**Required handoff fields:** `handoff_id`, `record_type`, `record_id`,
`from_owner_id`, `to_owner_id`, `from_team`, `to_team`, `reason`,
`created_at`, `accepted_at`, `handoff_status`, `open_task_count`,
`blocking_items`, `required_context_confirmed`, `due_at`,
`escalation_owner_id`, `audit_event_id`.

  -----------------------------------------------------------------------
  Step                    System behaviour        Completion condition
  ----------------------- ----------------------- -----------------------
  1\. Initiate            Current owner selects   Valid target owner/team
                          new owner/team, reason, exists and has
                          effective date, and     permission
                          relevant open tasks     

  2\. Prepare             System compiles record  Handoff packet is
                          summary, history, open  generated from linked
                          tasks, deadlines,       records
                          documents/evidence      
                          links, blockers, and    
                          next actions            

  3\. Validate            System checks required  Missing items are
                          fields, open critical   shown; policy-sensitive
                          tasks, missing          blockers cannot be
                          evidence, and access    silently bypassed
                          rights                  

  4\. Transfer            In one database         Record keeps the same
                          transaction, update     stable ID and all
                          owner/team and create   relationships
                          the handoff event; do   
                          not duplicate the       
                          underlying stakeholder  
                          or EP                   

  5\. Acknowledge         New owner confirms      Accepted or rejected
                          receipt and context;    status and timestamp
                          can reject with a       recorded
                          reason                  

  6\. Reconcile tasks     Open tasks stay linked  No task becomes
                          to the same record;     orphaned or silently
                          ownership is either     closed
                          retained or explicitly  
                          reassigned according to 
                          the handoff decision    

  7\. Escalate            Unaccepted handoffs     Escalation is visible
                          alert the current       in dashboards and audit
                          manager after a         history
                          configured interval     

  8\. Verify              Both owners can view    Handoff appears in
                          the handoff summary     record timeline and
                          subject to permissions; department reports
                          leadership can see      
                          stalled handoffs        
  -----------------------------------------------------------------------

Rules: - Never create a new EP/partner record merely because ownership
changes. - Never erase previous ownership; keep a history of owner/team
assignment intervals. - Handoff does not itself change official EXPA
status or bypass approvals. - Do not transfer sensitive case files to a
new owner unless the target role is authorised. - If the previous owner
leaves the LC, use a controlled reassignment queue and preserve all
historical actions. - A handoff can be rejected, but rejection must
include a reason and trigger a visible resolution task. - Handoffs must
be tested for concurrent edits, duplicate requests, permission changes,
and network failure.

### 0.7 Data continuity: prevent loss, duplication, and orphaned work

**Canonical system of record:** the ERP database is authoritative for
internal workflow, task ownership, notes, handoffs, evidence metadata,
internal CRM/PRM relationships, and audit history. EXPA remains
authoritative for official EXPA-owned identifiers and statuses where the
approved field-level ownership matrix says so. No field should have two
silent masters.

  -----------------------------------------------------------------------------------------------------------
  Control                             Required implementation
  ----------------------------------- -----------------------------------------------------------------------
  Stable identity                     Generate immutable internal UUIDs; retain external IDs separately with
                                      uniqueness constraints

  Referential integrity               Use foreign keys for linked records; prevent deletion that would orphan
                                      critical history

  Duplicate prevention                Exact-match rules plus a duplicate-candidate queue; merge records only
                                      through an audited merge workflow

  Change history                      Append-only audit events for
                                      create/update/transition/assignment/merge/export/approval/integration

  Safe deletion                       Prefer archive/soft-delete only where permitted; implement retention
                                      and erasure separately; never cascade-delete operational history by
                                      default

  Concurrent editing                  Version number or optimistic locking; show conflict and allow
                                      deliberate resolution instead of last-write-wins silently

  Transactions                        Multi-record actions such as owner transfer, status change plus task
                                      creation, and financial approval must be atomic where the platform
                                      supports it

  Integration idempotency             Every sync/event has an idempotency key; replay must not create
                                      duplicate EPs, contacts, tasks, invoices, or communications

  Sync checkpointing                  Persist cursor/checkpoint, run ID, start/end time, records
                                      read/written/skipped, and failure details

  Retry and dead-letter queue         Retry transient errors with bounded backoff; send repeated failures to
                                      a visible queue; allow safe retry after correction

  Reconciliation                      Scheduled comparison of expected external/internal mappings; flag
                                      missing, duplicated, stale, or conflicting records

  Backups                             Automated encrypted backups, defined retention, access restrictions,
                                      and separate recovery credentials

  Restore tests                       Restore to an isolated environment on a schedule; record evidence,
                                      duration, and data-integrity checks

  Export                              Full controlled export of business data, relationships, attachments
                                      metadata, configuration, and audit history; document restore/import
                                      procedure

  Migration                           Versioned schema migrations, preflight checks, backup, rollback plan,
                                      row counts, checksum/reconciliation, and post-migration verification

  Departing users                     Reassign open work, revoke access, retain authored history, and keep
                                      records owned by a valid person/team

  Failure visibility                  No silent failure; failed jobs and data-quality problems appear in a
                                      monitored operations queue
  -----------------------------------------------------------------------------------------------------------

Set approved recovery objectives before production: **RPO** (maximum
acceptable data loss window), **RTO** (maximum acceptable recovery
time), backup retention, restore-test frequency, and incident owner.
These are required decisions, not numbers to invent.

### 0.8 Canonical data model and relationship rules

Use normalized entities with stable primary keys. A person may have
multiple roles and relationships, but the system must not create
multiple copies of the same person just because they appear as an EP,
partner contact, IR contact, mentor, or internal member.

  -----------------------------------------------------------------------------
  Core entity             One-to-many / many-to-many    Key continuity rule
                          relationships                 
  ----------------------- ----------------------------- -----------------------
  `people`                EP profiles, partner          One canonical person
                          contacts, IR contacts,        identity; restrict
                          internal users where          cross-context data
                          appropriate                   visibility

  `organizations`         Contacts, deals, agreements,  Organization persists
                          opportunities, invoices,      across contacts and
                          cases                         mandate changes

  `contacts`              Organization, communication   Multiple contacts per
                          logs, meetings, tasks         organization; contact
                                                        role is time-bound
                                                        where needed

  `deals`                 Organization, contacts,       Stage history retained;
                          tasks, proposals, agreements  closed-lost reason
                                                        required where
                                                        applicable

  `opportunities`         Organization, slots, product, Opportunity ID remains
                          IR sourcing, applications     stable through status
                                                        and owner changes

  `slots`                 Opportunity, applications,    Prevent overbooking and
                          accommodation capacity, dates conflicting allocations

  `EP profiles` /         Person, opportunity/slot, IR  Separate person
  `applications`          source, owner, delivery,      identity from each
                          finance                       application/exchange
                                                        lifecycle

  `IR relationships`      Partner LC, contacts, supply  Record relationship and
                          commitments, applications     each supply commitment
                                                        separately

  `agreements`            Organization, funder,         Signed version is
                          opportunities, finance        retained; amendments
                          records, documents            are versioned

  `delivery records`      Application, standards        Each evidence item
                          evidence, accommodation,      records who, when,
                          pickup, touchpoints,          source, and
                          departure                     verification status

  `cases`                 EP/application, partner,      Sensitive permissions
                          evidence, actions, decisions, independent of ordinary
                          compensation review           EP/partner access

  `tasks`                 Owner/team, linked record,    Task always has one
                          dependencies, SLA, handoff    accountable owner or an
                                                        explicitly owned queue

  `financial records`     Stakeholder, agreement,       Ledger entries are
                          application, approval,        corrected by
                          payment evidence              reversal/adjustment,
                                                        not silent overwrites

  `communications`        Stakeholder,                  Communication log can
                          deal/application/case/task,   link to multiple
                          user, next action             relevant entities
                                                        without duplicating
                                                        them

  `audit events`          Actor, entity, changed        Append-only for
                          fields, correlation ID        ordinary application
                                                        use

  `handoffs`              Record, previous/new owner,   Handoff changes
                          tasks, acceptance, escalation assignment, not record
                                                        identity

  `sync jobs`             Source, mapping, external ID, Every sync run is
                          checkpoint, errors,           observable and
                          reconciliation                replay-safe

  `KPI definitions` /     Department, period, filters,  Historical KPI results
  `snapshots`             metric version, source query  are reproducible and
                                                        not manually
                                                        overwritten
  -----------------------------------------------------------------------------

The existing normalized dictionary and field-by-field blueprint below
remain the detailed source for domain fields. If a field is not
justified by a clear operational purpose, minimise or omit it pending
owner review.

### 0.9 Workflow status, task status, and source status are separate

Do not collapse unrelated statuses into one generic "Status" field.

  -----------------------------------------------------------------------
  Status family           Example fields          Rule
  ----------------------- ----------------------- -----------------------
  Official external       `expa_status`, external Read from the approved
  status                  record ID               external source; write
                                                  only through explicitly
                                                  authorised and verified
                                                  capabilities

  Internal lifecycle      `internal_stage`,       Owned by ERP, with
  status                  `delivery_state`,       validated transition
                          `partner_health`        rules

  Task status             `task_status`,          Independent from
                          `assignee`, `due_at`    stakeholder lifecycle
                                                  status

  Handoff status          `handoff_status`,       Tracks transfer
                          `accepted_at`           acceptance; does not
                                                  change lifecycle

  Verification status     `verification_state`,   Distinguishes
                          `verified_by`,          self-reported data from
                          `verified_at`           checked evidence

  Sync status             `sync_state`,           Tracks data exchange
                          `last_synced_at`,       reliability
                          `sync_error`            

  Approval status         `approval_state`,       Approval and
                          `approver_id`,          separation-of-duties
                          `decision_at`           controls

  Risk status             `risk_level`,           Derived from documented
                          `risk_owner`,           criteria or reviewed
                          `mitigation_due_at`     manually
  -----------------------------------------------------------------------

Every state transition must specify: permitted source states, target
state, actor role, preconditions, required fields/evidence, side
effects, task creation, notification, audit event, rollback/compensation
path, and test ID.

### 0.10 Analytics definitions and data quality

Every KPI needs a versioned definition containing: - `kpi_id`, name,
purpose, owner, department, formula, unit, numerator/denominator,
inclusion/exclusion rules, source entities, filters, time zone,
reporting period, refresh cadence, and effective date. - Data-quality
rules: missingness, duplicates, invalid dates, stale ownership, unlinked
records, and impossible transitions. - Metric status: `DRAFT`,
`APPROVED`, `DEPRECATED`; only approved metrics appear in official
leadership scorecards. - Historical reproducibility: retain the
definition version and source snapshot/query version used for a
published report. - Visual drill-down: every number resolves to the
records behind it, subject to access permissions. - Data caveat:
incomplete or stale source data must be visibly marked rather than
displayed as definitive.

### 0.11 Required implementation sequence

  -------------------------------------------------------------------------
  Phase                   Deliverable               Gate to proceed
  ----------------------- ------------------------- -----------------------
  0\. Validate            Requirements conflict     Blocking ambiguities
                          report, policy/source     assigned; owners and
                          evidence register,        approvers named
                          decision log, screen      
                          inventory                 

  1\. Data foundation     Auth, roles, core         Integrity, access,
                          entities, audit log,      restore, and migration
                          import/export,            tests pass
                          migrations, backups       

  2\. Tracker workspace   Global search, table      Users can find,
                          views, detail pages,      inspect, edit permitted
                          saved filters, record     fields, and export
                          timeline                  records

  3\. CRM/PRM + tasks     Sales pipeline,           Handoff and task
                          organizations/contacts,   continuity tests pass
                          partner accounts, tasks,  
                          department ownership      

  4\. EP/IR/opportunity   EP dossiers,              Lifecycle and duplicate
                          opportunities/slots, IR   prevention tests pass
                          relationships, matching   
                          and status histories      

  5\. Delivery/quality    Visa/logistics checklist, Safety, privacy,
                          standards evidence,       permissions, and
                          cases, escalations        exception tests pass

  6\. Finance + analytics Finance controls, KPI     Totals reconcile to
                          definitions, charts,      underlying records and
                          drill-down and exports    approvals

  7\. Integration         EXPA/GIS read/sync,       API scopes verified;
                          action outbox,            sync/replay/recovery
                          reconciliation and retry  tests pass
                          queue                     

  8\. Rabat pilot         Limited approved users,   Pilot exit criteria
                          monitored workflows, user signed
                          acceptance and restore    
                          drill                     

  9\. Multi-LC rollout    Tenant isolation,         Explicit national
                          configuration, support,   approval; no automatic
                          national governance       rollout
  -------------------------------------------------------------------------

Do not promise a calendar estimate before the team, scope, dependencies,
and first vertical slice are validated.

### 0.12 What "100%" means for this specification

"100%" means **all applicable requirements have an owner, a source or
explicit design rationale, an implementation location, an acceptance
test, and recorded approval/evidence**. It does not mean that policy
claims are automatically correct, that code exists, that the app has
been deployed, or that data can never be lost.

A release cannot be declared ready while any critical issue remains
unresolved in: - data loss, corruption, orphaned records, or failed
recovery; - unauthorised access, sensitive data exposure, or cross-LC
leakage; - unverified high-impact policy/financial/legal automation; -
official EXPA status mutation without authority; - broken
EP/partner/task handoff; - untested backup restoration or migration
rollback.

------------------------------------------------------------------------

## Specification precedence and how to use the remainder of this document

1.  This **tracker-first product contract** defines the user experience,
    data continuity, handoff behaviour, analytics, and implementation
    gates.
2.  The detailed original specification that follows supplies the ICX
    process catalogue, modules, fields, policy/source references, data
    dictionary, status catalogues, SLA proposals, permissions,
    integration research, dashboards, tests, and field-by-field input
    blueprint.
3.  The **Quality-Gate Addendum** at the end supplies binding
    engineering, security, evidence, and release controls.
4.  If a detailed section conflicts with this tracker-first contract or
    the quality gate, follow the stricter safety/data-integrity
    requirement and record a decision to resolve the conflict.
5.  A cited source URL is not, by itself, proof that every nearby claim
    has been verified. Use claim-level evidence records and current
    owner approval.
6.  Any unverified policy, legal, financial, API, or operational
    threshold must be configurable and marked `OPEN / BLOCKING` for the
    affected automation. Do not hard-block, charge, reject, blacklist,
    or make another irreversible decision solely from an unverified
    claim.
7.  The product must render records, tables, charts, forms, timelines,
    task queues, and drill-downs as working UI. Markdown documentation
    is for the build team; it is not the product UI.

------------------------------------------------------------------------

# Detailed ICX Domain Specification (Reference Catalogue)

**Primary Deployment Target:** AIESEC in Rabat, Morocco (`LC Rabat` ·
`MC Morocco`) --- Extensible Multi-LC Architecture\
**Products Covered:** Incoming Global Volunteer (**iGV**), Incoming
Global Talent (**iGTa**), Incoming Global Teacher (**iGTe**), including
Physical, Partly Remote, and Fully Remote modalities\
**Evidence caution:** The sources and policy statements listed below
require claim-level verification and current owner approval before they
are used to trigger irreversible automation. This document is not legal
advice or proof that a source remains current. **Reference policy
baseline (verify before production):** AIESEC Global Compendium (EVLM
Oct 2024), AIESEC Exchange Program Policies (AEPP --- IPM 2024), AIESEC
Portfolio Internal Policies (APIP --- EVLM Oct 2024), Exchange Standards
Refreshment (2024 --- 18 Standards), Global Volunteer Portfolio
(2024/2026), AIESEC Financial Procedures Manual (AFPM --- Aug 2022), and
AIESEC in Rabat Local Operational Framework (*RIBAT / Amana* Vision
26.2)

------------------------------------------------------------------------

## TABLE OF CONTENTS

1.  [Executive Summary & Epistemic Classification](#section-0)
2.  [Iterative Research Loops (Iterations 1 to 5)](#section-iterations)
3.  [Deliverable 1: ICX Knowledge Map & Authoritative Source
    Index](#deliverable-1)
4.  [Deliverable 2: End-to-End ICX Process Catalogue](#deliverable-2)
5.  [Deliverable 3: Detailed End-to-End Process Maps & Traceability
    Matrix](#deliverable-3)
6.  [Deliverable 4: Complete Stakeholder & CRM Relationship
    Specification](#deliverable-4)
7.  [Deliverable 5: Atomic Requirements Register (Modules
    A--L)](#deliverable-5)
8.  [Deliverable 6: Normalized Relational Data Dictionary & System
    Integrity Model](#deliverable-6)
9.  [Deliverable 7: Official Status & Transition State Machine
    Catalogue](#deliverable-7)
10. [Deliverable 8: SLA, Deadline & Escalation Automation
    Catalogue](#deliverable-8)
11. [Deliverable 9: Role-Based Access Control (RBAC) & Permission
    Matrix](#deliverable-9)
12. [Deliverable 10: EXPA / GIS API Integration Specification & Research
    Evidence Register](#deliverable-10)
13. [Deliverable 11: Analytics, Dashboards & KPI
    Specification](#deliverable-11)
14. [Deliverable 12: ERP System Architecture Proposal (Dual-Tier
    GAS/React + PostgreSQL)](#deliverable-12)
15. [Deliverable 13: Validation, Compliance & Test
    Catalogue](#deliverable-13)
16. [Deliverable 14: Phased Implementation Roadmap (AIESEC in Rabat MVP
    to National Scale)](#deliverable-14)
17. [Deliverable 15: Research Gap Register & Open Verification
    Backlog](#deliverable-15)
18. [Complete Multi-Stakeholder Data Input ("Put Data") & Field-by-Field
    Tracking Blueprint](#section-18)

------------------------------------------------------------------------

\<a id=\"section-0\"\>\</a\> \## 1. EXECUTIVE SUMMARY & EPISTEMIC
CLASSIFICATION

### 1.1 Architectural Mandate

This specification defines an all-in-one, domain-native **Incoming
Exchange Enterprise Resource Planning (ICX ERP)** system tailored
initially for **AIESEC in Rabat, Morocco**, and architected for
multi-entity scalability across AIESEC Local Committees (LCs) and Member
Committees (MCs). Unlike generic CRMs that treat youth exchanges as
simple sales deals, this ERP encodes AIESEC's exact statutory rules,
product constraints, 18 customer-facing Exchange Standards, multi-tier
Case Solving escalation clocks, financial reserve models, and dual-sided
B2B/B2C supply-demand matching.

### 1.2 Strict Epistemic Separation: Global Policy vs. Local Practice vs. Proposed ERP Design

In compliance with the research mandate, every rule, entity, and
workflow in this specification is strictly classified into one of three
epistemic tiers:

  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Tier Code               Classification    Definition & Authority                                                                                                 Examples in This Specification
  ----------------------- ----------------- ---------------------------------------------------------------------------------------------------------------------- ------------------------------------------------------------
  **`[GLOBAL-POLICY]`**   **Claim intended  Mandatory rules verified directly from the [AIESEC Global Compendium (EVLM Oct                                         • **18 Exchange Standards** (13 Mandatory + 5 Non-Mandatory;
                          to represent      2024)](https://drive.google.com/file/d/1_8GdMYoD-UMDJ7cNNshduW_Rca9RIgIB/view?usp=drivesdk), [AEPP (IPM                `CO = RE + 13 Mandatory + ≥3 Non-Mandatory`)`<br>`{=html}•
                          official AIESEC   2024)](https://drive.google.com/file/d/125w_-TIK97RHsHrWvH3jziq8UxPy5w8N/view?usp=drivesdk), [APIP (EVLM Oct           Product durations: **iGV** (6--8 wks, ≥25--40h/wk), **iGTa**
                          Global Policy;    2024)](https://drive.google.com/file/d/1zwQSiWbrSLHPUcCdqkk1KVmK-IBkzOyz/view?usp=drivesdk), [2024 Exchange Standards  (6--78 wks, ≥35--45h/wk), **iGTe** (9--78 wks,
                          verify the        Refreshment](https://docs.google.com/presentation/d/1OKtCK6XHvwKNzKKIUQEdSkGEKhqbspEjQeboA30zq6I/edit?usp=drivesdk),   ≥35--45h/wk)`<br>`{=html}• **14-day post-Approval deadline**
                          specific          [AFPM (Aug 2022)](https://drive.google.com/file/d/1bsZfRTVLj1lpXEho_Trb8Ey1dGvSTQhs/view?usp=drivesdk), or [EXPA / GIS for Visa Invitation Letters & Expectation Setting
                          clause/version    API (`gis-api.aiesec.org`)](https://gis-api.aiesec.org/swagger).                                                       (`AEPP 4.4.3.1`)`<br>`{=html}• **28-day (GV) / 56-day
                          before                                                                                                                                   (GTa/GTe)** pre-Realization cancellation cutoff
                          production**                                                                                                                             (`AEPP 4.4.2.3`)`<br>`{=html}• **Annex 2 Compensation
                                                                                                                                                                   Table** (e.g., 2% daily fine for salary delayed \>30 days;
                                                                                                                                                                   70% internship threshold for unlawful dismissal).

  **`[LOCAL-RABAT]`**     **Local practice  Operational rules, organizational structures, legal constraints, and cultural practices verified from AIESEC in        • **14-Day Pre-Arrival Hard Lock**: Opportunity &
                          claim requiring   Rabat's internal documents in Google Drive ([LCVP iGV                                                                  accommodation must be re-confirmed by provider at least 2
                          confirmation by   Vision](https://drive.google.com/file/d/1g4XOkWmTAh6I80u93NbZg-qRmof-Bavc/view?usp=drivesdk), [iGV MM                  weeks before arrival`<br>`{=html}• **Dual Middle Manager
                          an authorised     Summit](https://drive.google.com/file/d/1bbg6uqktj7h-__X63T7XwEg0ssfgwgBH/view?usp=drivesdk), [MM                      (MM) Engine**: MM External Engine (BD, Sales, Branding) + MM
                          Rabat/Morocco     Selection](https://docs.google.com/presentation/d/1aO702ZjWOpRQ5SdgyyxfCsBt03fj6sSW0WED9e51Lp4/edit?usp=drivesdk),     Internal Engine (Ops, Systems, IR, Matching,
                          owner**           [Morocco Partner                                                                                                       Quality)`<br>`{=html}• **Moroccan Legal Compliance**: Dahir
                                            Analysis](https://docs.google.com/document/d/10B0p6d2MBYWp4bpF13ct4-ABosF4fRCFKu0EglOAbzs/edit?usp=drivesdk)).         n° 1-58-376 (1958), Law 09-08 (CNDP Data Privacy), CGI Art.
                                                                                                                                                                   57 vs. Art. 10-I-B-2° (Sponsorship vs. Mécénat), 90-day
                                                                                                                                                                   visa-free vs. AEVM/Embassy visa tracking`<br>`{=html}•
                                                                                                                                                                   **RIBAT Visual Sanctuary Palette**: Pairing `#037EF3` /
                                                                                                                                                                   `#F85A40` with *Pierre de Salé* sandstone & *Udayas* indigo.

  **`[ERP-DESIGN]`**      **Proposed ERP    Engineered capabilities, normalized relational tables, algorithmic matchmakers, SLA countdown timers, and UI/UX        • **Read-First EXPA Sync Daemon + Outbox Pattern** to
                          Architectural /   workflows designed to enforce `[GLOBAL-POLICY]` and `[LOCAL-RABAT]` rules while eliminating spreadsheet fragmentation. prevent APIP 5.7 violations or silent
                          Workflow                                                                                                                                 overwrites`<br>`{=html}• **Automated SLA Countdown Engine**
                          Improvement**                                                                                                                            (T-28d/T-56d, T+7d, T+14d, 24h/48h/72h ECB case
                                                                                                                                                                   clocks)`<br>`{=html}• **Unified Stakeholder Timeline**
                                                                                                                                                                   linking WhatsApp deep-links, Gmail threads, contracts, and
                                                                                                                                                                   EXPA applications`<br>`{=html}• **Dual-Tier Deployment
                                                                                                                                                                   Architecture** (Tier 1: Google Apps Script V8 +
                                                                                                                                                                   React/Vite/TS + Sheets; Tier 2: Supabase/PostgreSQL +
                                                                                                                                                                   Next.js).
  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

\<a id=\"section-iterations\"\>\</a\> \## 2. ITERATIVE RESEARCH LOOPS
(DISCOVER → READ → EXTRACT → MAP → MODEL → VALIDATE)

### Iteration 1: Hub Architecture, Global Compendium, AEPP / APIP & Product Rules

1.  **What Was Investigated**: Public web portals ([AIESEC
    Hub](https://www.hub.aiesec.org/), [Exchange
    Hub](https://www.hub.aiesec.org/exchange-hub), [IM
    Hub](https://www.hub.aiesec.org/im-hub), [Functional
    Hub](https://www.hub.aiesec.org/functional-hub)) and the
    authoritative AIESEC Global Compendium folder in Google Drive ([EVLM
    October 2024 \|
    Compendium](https://www.google.com/search?q=https://drive.google.com/drive/folders/1RuP6kisMq2u6vbwCEs8x8BQ0wWqIdibn)),
    specifically reading [AEPP IPM
    2024](https://drive.google.com/file/d/125w_-TIK97RHsHrWvH3jziq8UxPy5w8N/view?usp=drivesdk),
    [APIP EVLM Oct
    2024](https://drive.google.com/file/d/1zwQSiWbrSLHPUcCdqkk1KVmK-IBkzOyz/view?usp=drivesdk),
    and [Annex 3 Glossary of
    Terms](https://drive.google.com/file/d/1h5sOL0k2mhJj6VsTPqdJQ0ygxoalfLta/view?usp=drivesdk).
2.  **What Was Verified**:
    -   Confirmed exact product definitions and minimum conditions in
        `AEPP Clause 3.2` and `APIP Section 5.2–5.3`: **iGV** (6--8
        weeks, 25--40 hrs/week, NGO/school/social enterprise OP,
        mandatory accommodation, SDG project alignment), **iGTa** (6--78
        weeks, 35--45 hrs/week,
        Business/Marketing/Finance/IT/Engineering, mandatory
        accommodation or salary for 6--8 wks and mandatory salary for
        \>8 wks, zero EP project/accommodation fees), **iGTe** (9--78
        weeks, 35--45 hrs/week, teaching subjects/languages, mandatory
        salary for full duration, zero EP fees).
    -   Verified **Partly Remote** rules (`AEPP Section 6` &
        `APIP 5.2.3.1`): minimum 3 months (13 weeks) total duration,
        remote portion ≤50% of total duration, mandatory ICB audit via
        `aies.ec/partlyremote-auditform`.
    -   Verified **Fully Remote** rules (`AEPP Section 7`): 6--26 weeks
        duration, 7 applicable Exchange Standards (#1, #2, #4, #8, #9,
        #10, #11, #13, #17, #18).
3.  **Which ERP Requirements Were Added/Changed**: Added `REQ-ICX-021`
    to `REQ-ICX-035` enforcing hard product-specific validation rules on
    Opportunity creation (blocking invalid durations, working hours, or
    illegal EP fee structures on iGTa/iGTe).
4.  **Which Deliverables Were Updated**: Deliverables 1, 2, 3, 5, 6, 7.
5.  **What Remains Unknown**: Exact MC Morocco national fee tariff sheet
    for the 2026.2 term (resolved via configurable `fee_tariffs` table).
6.  **Next Highest-Priority Research Action**: Investigate the 2024
    Exchange Standards Refreshment and Global Volunteer Portfolio
    project specifications.

### Iteration 2: The 2024 Refreshed 18 Exchange Standards & Global Volunteer Portfolio

1.  **What Was Investigated**: Read the official 48-slide deck [\[READ
    ME\] all about exchange standards refreshment \|
    aies.ec/allabout-esrefresh](https://docs.google.com/presentation/d/1OKtCK6XHvwKNzKKIUQEdSkGEKhqbspEjQeboA30zq6I/edit?usp=drivesdk),
    [#17 Regular
    Touchpoints](https://docs.google.com/presentation/d/17RFsau6BVK1loWPXgHcNTyKpEEYWKhH4wlyrHapTpjE/edit?usp=drivesdk),
    [AIESEC Exchange Standards
    101.pdf](https://drive.google.com/file/d/1r_j91I4Jj-0CGZZ2zgK1Xft3dvdMzhFX/view?usp=drivesdk),
    and the [Global Volunteer Portfolio
    (`aies.ec/gv-projects-portfolio`)](https://docs.google.com/spreadsheets/d/1TIooseQqGzmkcg36xQges29KxmJUdEa_nHIBbpywxBQ/edit?usp=drivesdk).
2.  **What Was Verified**:
    -   **Critical Discovery**: Resolved the discrepancy between legacy
        "16 Exchange Standards" trackers and current 2024/2026 policy.
        In 2024, AIESEC officially refreshed Exchange Standards from
        **16 to 18 Standards**:
        -   Added **#15 Value-Driven Leadership Education (LEAD)** (Host
            Entity responsibility, non-mandatory) and **#17 Review
            Checkpoints (Regular Touchpoints)** (Both SE & HE
            responsibility, non-mandatory; minimum bi-weekly for GV and
            monthly for GTa/GTe).
        -   Changed **#3 Insurance** from Mandatory to **Non-Mandatory**
            (while keeping it an AEPP legal requirement so SE isn't
            penalized for third-party provider claims).
        -   Upgraded **#9 First Day of Work** from Non-Mandatory to
            **Mandatory** (HE must physically or virtually accompany EP
            to OP on Day 1).
        -   Merged **#10 Alignment Spaces with OP** to include both
            first-week JD alignment and final-week OP debrief.
        -   Updated **Complete (`CO`) Formula**:
            `13 Mandatory Standards = 100% Yes` AND
            `at least 3 out of 5 Non-Mandatory Standards = Yes` (minimum
            16/18 total), evaluated across the **Middle Survey**
            (#1--#10a) and **Final Survey** (#10b--#18).
    -   Verified all standardized **Global Volunteer Portfolio**
        projects and SDG targets (`3.4 Heartbeat`,
        `4.1/4.2/4.6 Global Classroom`, `4.7 Youth 4 Impact`,
        `5.1/5.5 Raise Your Voice`, `6.b Clean Water`,
        `8.3/8.6 Skill Up!`, `8.9 On The Map`, `10.2 Equify`,
        `11.b Safe Cities Schools/NGO`,
        `12.3/12.5/12.8 Responsible Consumption`, `13.3 Green Leaders`,
        `14.1/14.2 Aquatica`, `15.5 Rooted Schools/NGO`, `16.1 Peace`,
        `17.17 Scale Up!`).
3.  **Which ERP Requirements Were Added/Changed**: Replaced legacy
    16-standard schema with the **18-Standard Delivery & Evidence
    Engine** (`REQ-ICX-061` to `REQ-ICX-078`), differentiating Mandatory
    vs. Non-Mandatory standards and Middle vs. Final survey gates.
4.  **Which Deliverables Were Updated**: Deliverables 1, 2, 3, 5, 6, 7,
    8, 11, 13.
5.  **What Remains Unknown**: None on Exchange Standards---100% verified
    from primary 2024 policy decks.
6.  **Next Highest-Priority Research Action**: Investigate AEPP Annex 1,
    Annex 2, Annex 9, and APIP Section 6.9 for exact legal deadlines,
    cancellation rules, financial liabilities, and ECB/ICB Case Solving
    protocols.

### Iteration 3: Legal Deadlines, Cancellations, Compensation Table (Annex 2) & Case Solving (APIP 6.9)

1.  **What Was Investigated**: Read [Annex 1 Anti-Harassment
    Protocol](https://drive.google.com/file/d/1gMi44u0aCeDXuKdxWtr0zkt-A3J28VP6/view?usp=drivesdk),
    [Annex 2 Compensation Policies &
    Table](https://drive.google.com/file/d/1utNAwjhDPAMUwsuLvErSkTaOyF2yi1nZ/view?usp=drivesdk),
    [Annex 9 Official Case Appeal
    Template](https://drive.google.com/file/d/1LViXJDF_wX47gFufbp-d4p4bjveLIQtU/view?usp=drivesdk),
    and `AEPP Sections 4–5` + `APIP Section 6.9`.
2.  **What Was Verified**:
    -   **Post-Approval Deadlines**: 7 days to assign Account Manager
        (`AEPP 4.4.4.3`); 14 days for HE/OP to issue Visa Invitation
        Documents & Written Expectation Setting (`AEPP 4.4.3.1`,
        `4.4.4.1`); 7 days for EP to update visa status and 14 days to
        apply (`AEPP 4.4.2.1`).
    -   **Cancellation Notice Cutoffs**: **28 days** before Realization
        for GV; **56 days** before Realization for GTa/GTe
        (`AEPP 4.4.2.3`, `4.4.3.5`).
    -   **OP Candidate Rejection Limit**: OP rejecting **\>3 qualified
        candidates** without feedback triggers OP suspension/termination
        (`AEPP 4.2.2.1.7`).
    -   **EP Unreachable Safety Rule**: EP unreachable for **\>2 working
        days** triggers mandatory HE+SE+OP safety localization
        (`AEPP 4.5.4.11`), and crisis reporting within **24 hours**
        (`APIP 5.6.1.12`).
    -   **Annex 2 Financial Penalties**: Replacement windows (2 weeks
        for APD Break; 1 week for RE Break); Salary delay penalties
        (7--30 days = immediate payment; \>30 days = payment + **2%
        daily fine**); Unlawful dismissal (\<70% duration = full
        flight/visa reimbursement; ≥70% duration = remaining 30%
        salary + return flight).
    -   **3-Stage Case Solving Clocks**: Stage 1 LC-to-LC (24h ack / 48h
        reply / 72h escalation), Stage 2 ECB-to-ECB (48h reply / 48h
        counter / 96h max / 7d escalation), Stage 3 ICB OCA/OCCA (48h
        accept / 5d OCA or 3d OCCA / 5d solution / 6m 50% & 12m 100%
        compensation payout), plus Urgency Protocol (48--72h) and
        Harassment Prevention Committee (24h start / 7 working days
        report).
3.  **Which ERP Requirements Were Added/Changed**: Added `REQ-ICX-079`
    to `REQ-ICX-096` and Automations `AUTO-001` to `AUTO-035` encoding
    every statutory timer and compensation calculator.
4.  **Which Deliverables Were Updated**: Deliverables 2, 3, 5, 6, 7, 8,
    13.
5.  **What Remains Unknown**: None on global legal/compensation rules.
6.  **Next Highest-Priority Research Action**: Investigate AIESEC in
    Rabat's local B2B market, organizational structure, existing Google
    Sheets/Apps Script prototypes, and Moroccan legal/financial
    framework.

### Iteration 4: AIESEC in Rabat Local Context, B2B Prospection, Moroccan Law & AFPM Finance

1.  **What Was Investigated**: Read AIESEC in Rabat files in Google
    Drive: [LCVP iGV
    Application](https://docs.google.com/document/d/11K-cTCtDvmBdn_sYELEdboEJKEqXTBrVNWIiH_LsNdE/edit?usp=drivesdk),
    [LCVP iGV Vision
    (RIBAT)](https://drive.google.com/file/d/1g4XOkWmTAh6I80u93NbZg-qRmof-Bavc/view?usp=drivesdk),
    [iGV MM
    Summit](https://drive.google.com/file/d/1bbg6uqktj7h-__X63T7XwEg0ssfgwgBH/view?usp=drivesdk),
    [iGV MM
    Training](https://drive.google.com/file/d/1m9vBmM5yuBr1ecHCNpE84qvNDrLkroaj/view?usp=drivesdk),
    [iGV Middle Management
    Selection](https://docs.google.com/presentation/d/1aO702ZjWOpRQ5SdgyyxfCsBt03fj6sSW0WED9e51Lp4/edit?usp=drivesdk),
    [AIESEC Rabat 26 - iGV S1 Closing
    Report](https://docs.google.com/presentation/d/1_BZFmxtlFvIdiWXOEcEvIczSWxaGym-U6lKFwciJ9Zo/edit?usp=drivesdk),
    [LC Rabat Pre-Replanning Problem
    Analysis](https://docs.google.com/document/d/1Vc59zGjOY4nSZidfaCLcmzsvk_N1WxNmT0cjwYmrCik/edit?usp=drivesdk),
    [Prospection Partenaires iGV - AIESEC in
    Rabat](https://docs.google.com/spreadsheets/d/1kkmiMJXy3pF4_pl063Z6A89qUrLXCFJXe81mQJWfhDM/edit?usp=drivesdk),
    [Morocco Volunteer Partner
    Analysis](https://docs.google.com/document/d/10B0p6d2MBYWp4bpF13ct4-ABosF4fRCFKu0EglOAbzs/edit?usp=drivesdk),
    [Conference Sponsorship
    Strategy](https://docs.google.com/document/d/1NT3X7yLCOa6-kUzpZNUJdzakeWkLAwGWDnY6kIV-8oc/edit?usp=drivesdk),
    and [AFPM Aug
    2022](https://drive.google.com/file/d/1bsZfRTVLj1lpXEho_Trb8Ey1dGvSTQhs/view?usp=drivesdk).
2.  **What Was Verified**:
    -   **Rabat S1 Baseline & Root-Cause Diagnosis**: In S1 26, LC Rabat
        opened 3 opportunities and received 7 applications, but had
        `0 Accepted`, `0 Approved`, `0 Realized`, and `7 Lost EPs` due
        to slow follow-up, fragmented spreadsheets, lack of structured
        IR supply mapping, and unconfirmed accommodation.
    -   **Rabat Local Operational Rules**:
        -   **Philosophy**: *RIBAT / Amana* ("What is entrusted must
            endure"; "3 flawless realizations \> 15 forgettable ones").
        -   **14-Day Pre-Confirmation Hard Gate**: Opportunity and
            accommodation must be explicitly confirmed by the provider
            at least **2 weeks before arrival**.
        -   **Dual MM Engine**: LCVP iGV supported by **MM External
            Engine** (BD, Sales, Partnerships, Branding --- e.g., Omar
            profile) and **MM Internal Engine** (Operations, Systems,
            Data, IR, Matching, Quality --- e.g., Mouatassim profile).
        -   **Governance Rhythm**: Weekly Team Meeting, Weekly Core
            Meeting, Bi-monthly Department Meeting, Monthly LCM, Monthly
            O2O (`TL2TM` and `LCVP2TL`), Monthly LCP Calibration.
        -   **Moroccan Legal & Tax Context**: Governed by **Dahir n°
            1-58-376 (1958)**, **Law 09-08 (CNDP)** for personal data
            privacy, **Law 18-18** for public calls for donations, and
            **CGI Art. 57** (Commercial Sponsorship / *Parrainage* ---
            fully deductible as marketing expense) vs. **CGI Art.
            10-I-B-2°** (Charitable *Mécénat* --- capped at 0.2%
            turnover and restricted to *Utilité Publique* entities).
        -   **AFPM Financial Rules**: Accrual accounting, dual
            signatures for bank accounts, minimum **6 months operational
            reserves** (`1.0 ratio`), Exchange Inflow/Outflow \>= 70% of
            Total Inflow/Outflow, Direct Exchange Revenue \> Direct
            Exchange Costs (`ratio > 1.0`), max 2-week accounts
            receivable overdue tolerance.
3.  **Which ERP Requirements Were Added/Changed**: Added Rabat-specific
    B2B prospecting fields (`ICE`, `RC`, Dahir status, CGI Art. 57
    vs. 10-I-B-2° classification), the **14-Day Pre-Arrival Lock**, the
    **Dual MM Engine** role permissions, and the **AFPM Sustainability
    Ratio** calculators (`REQ-ICX-001` to `REQ-ICX-020`, `REQ-ICX-097`
    to `REQ-ICX-120`).
4.  **Which Deliverables Were Updated**: Deliverables 1, 2, 4, 5, 6, 8,
    9, 11, 14.
5.  **What Remains Unknown**: Exact list of current active Global Host
    families in Rabat/Salé (captured in Research Gap Register).
6.  **Next Highest-Priority Research Action**: Investigate EXPA / GIS
    GraphQL API schema, authentication constraints, and Rabat's existing
    Google Apps Script + React/Vite architecture.

### Iteration 5: EXPA / GIS GraphQL API & Cloud-Native ERP Architecture

1.  **What Was Investigated**: Browsed [GIS API Swagger
    (`https://gis-api.aiesec.org/swagger`)](https://gis-api.aiesec.org/swagger),
    inspected indexed EXPA GraphQL queries
    (`https://gis-api.aiesec.org/graphql`), read
    `APIP Section 5.7 (Internal Digital Ecosystem Regulation)`, and
    reviewed Rabat's technical documents ([React in Apps Script:
    Cloud-Native
    Quality](https://docs.google.com/document/d/1_4_PeIgvftf_nbqhDj1V7yCAnEpl7K8TvJ7GTERpJLU/edit?usp=drivesdk),
    [Elevating AIESEC Rabat CRM to React + Vite within
    GAS](https://docs.google.com/document/d/1D3jzCh4nWoQQwQuIIgk-Rk4GpF10s0BR3JFcDbVglz0/edit?usp=drivesdk),
    [Google Sheets iGV System
    Workflow](https://docs.google.com/document/d/1hojVOuNEive79qU68CnQT_IxFUWfBevvFqlYkwB-QPk/edit?usp=drivesdk)).
2.  **What Was Verified**:
    -   Verified `https://gis-api.aiesec.org/graphql` payload structures
        (`allOpportunity`, `GetAllOpportunitiesQuery`, `Opportunity`
        fragment with `id`, `title`, `applicants_count`,
        `applications_close_date`, `earliest_start_date`, `duration`,
        `programme`, `specifics_info`, `sdg_info`, `branch`, `host_lc`,
        `openings`, `available_openings`, `pre_screen_questions`).
    -   Verified `APIP Section 5.7` rules: Every member must
        authenticate with their personal `@aiesec.net` account, sign an
        NDA, never share credentials, and never generate Fake Statuses
        (`Fake Approval`, `Fake Realized`, `Fake Finished`,
        `Fake Completed`, `Fake Opportunity`).
    -   Evaluated Rabat's existing 8 Google Sheets trackers
        (`iGV Master Hub`, `Partner CRM`, `EP CRM & Value Delivery`,
        `IR Partners PRM`, `Project Slots Registry`, `Enablers B2B CRM`,
        `Matchmaker Interface`, `Logistics & Standards Tracker`) and
        designed a unified architecture that consolidates all 8
        fragmented sheets into a single normalized relational schema
        supporting both **Tier 1 (Zero-Cost Google Workspace: React 18 +
        Vite + TypeScript + Tailwind + GAS V8 + Multi-Tab
        Sheets/LockService)** and **Tier 2 (Enterprise Multi-LC:
        Next.js + PostgreSQL/Supabase + Prisma/Drizzle)**.
3.  **Which ERP Requirements Were Added/Changed**: Added `REQ-ICX-121`
    to `REQ-ICX-135` defining the EXPA Read-Sync Worker, Outbox Action
    Queue, and APIP 5.7 compliance guardrails.
4.  **Which Deliverables Were Updated**: Deliverables 6, 10, 12, 13, 14,
    15.
5.  **What Remains Unknown**: Whether AIESEC International's IT team
    grants write-scope OAuth tokens for local committee ERP apps
    (designed safe fallback: Read-Sync + Deep-Link Action Outbox).
6.  **Next Highest-Priority Research Action**: Compile all 15
    Deliverables into the complete Master Specification.

------------------------------------------------------------------------

\<a id=\"deliverable-1\"\>\</a\> \## 3. DELIVERABLE 1: ICX KNOWLEDGE MAP
& AUTHORITATIVE SOURCE INDEX

The table below indexes the authoritative global and local knowledge
sources governing AIESEC ICX operations, organized by domain.

  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Source ID       Document / Portal Title               Authority &     Verified URL / Location                                                                                                      Primary ICX Domains Governed             Confidence
                                                        Scope                                                                                                                                                                                 
  --------------- ------------------------------------- --------------- ---------------------------------------------------------------------------------------------------------------------------- ---------------------------------------- ------------
  **`SRC-001`**   **AIESEC Hub (Main Portal)**          AIESEC          [hub.aiesec.org](https://www.hub.aiesec.org/)                                                                                Global resource gateway (Exchange Hub,   **Verified
                                                        International                                                                                                                                IM Hub, Functional Hub)                  (100%)**
                                                        (Global)                                                                                                                                                                              

  **`SRC-002`**   **AIESEC Exchange Hub**               AIESEC          [hub.aiesec.org/exchange-hub](https://www.hub.aiesec.org/exchange-hub)                                                       Global Exchange Standards, XPP, Product  **Verified
                                                        International                                                                                                                                Academies (GV, GTa, GTe)                 (100%)**
                                                        (Global)                                                                                                                                                                              

  **`SRC-003`**   **AIESEC IM Hub**                     AIESEC          [hub.aiesec.org/im-hub](https://www.hub.aiesec.org/im-hub)                                                                   Information Management, EXPA guides,     **Verified
                                                        International                                                                                                                                data analytics                           (100%)**
                                                        (Global)                                                                                                                                                                              

  **`SRC-004`**   **AIESEC Functional Hub**             AIESEC          [hub.aiesec.org/functional-hub](https://www.hub.aiesec.org/functional-hub)                                                   Functional Academies (iGV, iGTa, iGTe,   **Verified
                                                        International                                                                                                                                BD, FnL, TM, MKT)                        (100%)**
                                                        (Global)                                                                                                                                                                              

  **`SRC-005`**   **AIESEC Exchange Program Policies    AIESEC          [Drive: 1.1 AEPP IPM 2024.pdf](https://drive.google.com/file/d/125w_-TIK97RHsHrWvH3jziq8UxPy5w8N/view?usp=drivesdk)          Customer-facing exchange rules, 18       **Verified
                  (AEPP --- IPM 2024)**                 International &                                                                                                                              Exchange Standards, EP/OP/SE/HE          (100%)**
                                                        ICB (Global                                                                                                                                  responsibilities, cancellations,         
                                                        Statutory)                                                                                                                                   refunds, complaints                      

  **`SRC-006`**   **AIESEC Portfolio Internal Policies  AIESEC          [Drive: 1. Internal APIP Oct 2024.pdf](https://drive.google.com/file/d/1zwQSiWbrSLHPUcCdqkk1KVmK-IBkzOyz/view?usp=drivesdk)  Entity-to-entity rules, GV/GTa/GTe       **Verified
                  (APIP --- EVLM Oct 2024)**            International &                                                                                                                              operational minimums, EXPA/POP rules,    (100%)**
                                                        ICB (Global                                                                                                                                  APIP 5.7 Digital Ecosystem, ECB/ICB Case 
                                                        Statutory)                                                                                                                                   Solving                                  

  **`SRC-007`**   **AEPP/APIP Annex 1: Anti-Harassment  AIESEC          [Drive: Annex 1.pdf](https://drive.google.com/file/d/1gMi44u0aCeDXuKdxWtr0zkt-A3J28VP6/view?usp=drivesdk)                    Harassment classes, Harassment           **Verified
                  & Violence Protocol**                 International &                                                                                                                              Prevention Committee, 24h investigation  (100%)**
                                                        ICB (Global                                                                                                                                  start, 7-working-day final report        
                                                        Statutory)                                                                                                                                                                            

  **`SRC-008`**   **AEPP/APIP Annex 2: Compensation     AIESEC          [Drive: Annex 2.pdf](https://drive.google.com/file/d/1utNAwjhDPAMUwsuLvErSkTaOyF2yi1nZ/view?usp=drivesdk)                    Financial liabilities, replacement       **Verified
                  Policies & Table**                    International &                                                                                                                              windows (2 wks APD / 1 wk RE), 2% daily  (100%)**
                                                        ICB (Global                                                                                                                                  salary delay fine, 70% dismissal rule    
                                                        Statutory)                                                                                                                                                                            

  **`SRC-009`**   **AEPP/APIP Annex 3: Glossary of      AIESEC          [Drive: Annex 3.pdf](https://drive.google.com/file/d/1h5sOL0k2mhJj6VsTPqdJQ0ygxoalfLta/view?usp=drivesdk)                    Official definitions of EP, OP, SE, HE,  **Verified
                  Terms**                               International &                                                                                                                              EXPA statuses (`OPEN` to `COMPLETED`),   (100%)**
                                                        ICB (Global                                                                                                                                  Break statuses, OCA/OCCA                 
                                                        Statutory)                                                                                                                                                                            

  **`SRC-010`**   **AEPP/APIP Annex 9: Official Case    AIESEC          [Drive: Annex 9.pdf](https://drive.google.com/file/d/1LViXJDF_wX47gFufbp-d4p4bjveLIQtU/view?usp=drivesdk)                    Mandatory appeal format, valid appeal    **Verified
                  Appeal Template**                     International &                                                                                                                              grounds, 48h leave + 72h submission      (100%)**
                                                        ICB (Global                                                                                                                                  window                                   
                                                        Statutory)                                                                                                                                                                            

  **`SRC-011`**   **Global Compendium & Supporting      AIESEC          [Drive: Global Compendium Oct 2024.pdf](https://drive.google.com/file/d/1_8GdMYoD-UMDJ7cNNshduW_Rca9RIgIB/view?usp=drivesdk) Constitutional governance, entity        **Verified
                  Document A (EVLM Oct 2024)**          International                                                                                                                                membership criteria, AIESEC Way          (100%)**
                                                        (Global                                                                                                                                                                               
                                                        Statutory)                                                                                                                                                                            

  **`SRC-012`**   **AIESEC Financial Procedures Manual  AIESEC          [Drive: AFPM August 2022.pdf](https://drive.google.com/file/d/1bsZfRTVLj1lpXEho_Trb8Ey1dGvSTQhs/view?usp=drivesdk)           Chart of accounts, accrual accounting,   **Verified
                  (AFPM --- Aug 2022)**                 International &                                                                                                                              6-month reserve rule, Exchange           (100%)**
                                                        GFB (Global                                                                                                                                  Sustainability Ratio (`>1.0`), budgeting 
                                                        Statutory)                                                                                                                                   & auditing                               

  **`SRC-013`**   **Exchange Standards Refreshment      AIESEC          [Drive:                                                                                                                      Expansion from 16 to **18 Exchange       **Verified
                  Master Deck (2024)**                  International & allabout-esrefresh](https://docs.google.com/presentation/d/1OKtCK6XHvwKNzKKIUQEdSkGEKhqbspEjQeboA30zq6I/edit?usp=drivesdk)   Standards**, Mandatory (13)              (100%)**
                                                        ICB (Global                                                                                                                                  vs. Non-Mandatory (5), Middle vs. Final  
                                                        Operational)                                                                                                                                 Survey questions                         

  **`SRC-014`**   **Standard #17 Regular Touchpoints    AIESEC          [Drive: #17 Regular                                                                                                          Touchpoint cadence (bi-weekly GV,        **Verified
                  Guide**                               International   Touchpoints](https://docs.google.com/presentation/d/17RFsau6BVK1loWPXgHcNTyKpEEYWKhH4wlyrHapTpjE/edit?usp=drivesdk)          monthly GTa/GTe), touchpoint question    (100%)**
                                                        (Global                                                                                                                                      bank                                     
                                                        Operational)                                                                                                                                                                          

  **`SRC-015`**   **Global Volunteer Portfolio          AIESEC          [Drive: GV Portfolio                                                                                                         Standardized GV projects across 16+ SDG  **Verified
                  (`aies.ec/gv-projects-portfolio`)**   International   Sheet](https://docs.google.com/spreadsheets/d/1TIooseQqGzmkcg36xQges29KxmJUdEa_nHIBbpywxBQ/edit?usp=drivesdk)                targets, JDs, KPIs/MoOs, 6--8 week       (100%)**
                                                        (Global                                                                                                                                      timelines                                
                                                        Product)                                                                                                                                                                              

  **`SRC-016`**   **EXPA / GIS API Documentation &      AIESEC          [gis-api.aiesec.org/swagger](https://gis-api.aiesec.org/swagger)                                                             REST & GraphQL                           **Verified
                  GraphQL Endpoint**                    International                                                                                                                                (`https://gis-api.aiesec.org/graphql`)   (Read
                                                        IT / Commutatus                                                                                                                              queries, Opportunity/Application         Schema)**
                                                                                                                                                                                                     fragments                                

  **`SRC-017`**   **LCVP iGV Vision & Application       AIESEC in Rabat [Drive: LCVP iGV Vision.pdf](https://drive.google.com/file/d/1g4XOkWmTAh6I80u93NbZg-qRmof-Bavc/view?usp=drivesdk)            *RIBAT / Amana* vision, "3 flawless      **Verified
                  (RIBAT 26.2)**                        (Local                                                                                                                                       realizations \> 15 forgettable ones",    (100%)**
                                                        Strategic)                                                                                                                                   team structure                           

  **`SRC-018`**   **iGV MM Summit, Training & Selection AIESEC in Rabat [Drive: iGV MM Summit.pdf](https://drive.google.com/file/d/1bbg6uqktj7h-__X63T7XwEg0ssfgwgBH/view?usp=drivesdk)              14-day pre-arrival OP/accommodation      **Verified
                  Decks (Rabat)**                       (Local                                                                                                                                       confirmation lock, External vs. Internal (100%)**
                                                        Operational)                                                                                                                                 MM split, meeting cadence                

  **`SRC-019`**   **Prospection Partenaires iGV &       AIESEC in Rabat [Drive: Prospection Partenaires                                                                                              25+ real Rabat/Salé NGOs, schools,       **Verified
                  Morocco Partner Analysis**            (Local B2B      iGV](https://docs.google.com/spreadsheets/d/1kkmiMJXy3pF4_pl063Z6A89qUrLXCFJXe81mQJWfhDM/edit?usp=drivesdk)                  incubators, French outreach templates,   (100%)**
                                                        Market)                                                                                                                                      Moroccan legal/tax analysis (Dahir 1958, 
                                                                                                                                                                                                     CGI Art. 57)                             

  **`SRC-020`**   **AIESEC Rabat Existing Sheets & GAS  AIESEC in Rabat [Drive: GAS React+Vite                                                                                                       Existing 8 Google Sheets prototypes      **Verified
                  React/Vite Research**                 (Local          Research](https://docs.google.com/document/d/1D3jzCh4nWoQQwQuIIgk-Rk4GpF10s0BR3JFcDbVglz0/edit?usp=drivesdk)                 (`Master Hub`, `Partner CRM`, `EP CRM`,  (100%)**
                                                        Technical)                                                                                                                                   `IR PRM`, `Matchmaker`, etc.) and GAS    
                                                                                                                                                                                                     V8 + React/Vite architecture             
  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

\<a id=\"deliverable-2\"\>\</a\> \## 4. DELIVERABLE 2: END-TO-END ICX
PROCESS CATALOGUE

Every operational process in Incoming Exchange (ICX) is catalogued below
with its Process ID, Epistemic Classification, Purpose, Primary Owner,
Inputs, Outputs, and Upstream/Downstream Dependencies.

  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Process ID          Process Name      Epistemic Tier        Purpose                                Primary Owner    Required Inputs                                                                                                       Verified Outputs                 Dependencies
                                                                                                     (LC Rabat)                                                                                                                                                              
  ------------------- ----------------- --------------------- -------------------------------------- ---------------- --------------------------------------------------------------------------------------------------------------------- -------------------------------- ----------------
  **`PROC-ICX-01`**   **Market Research `[GLOBAL-POLICY]` +   Identify local NGOs, schools,          MM External      Local directories (Tanmia.ma, MCISE, Technopolis), SDG priorities, past partner records                               Qualified Lead records in        None (Entry
                      & Partner         `[LOCAL-RABAT]`       startups, and corporations in          Engine (BD Team)                                                                                                                       `organizations` &                Process)
                      Segmentation**                          Rabat-Salé-Kénitra with talent or                                                                                                                                             `organization_contacts` with     
                                                              social impact needs matching iGV,                                                                                                                                             segment & target product         
                                                              iGTa, or iGTe criteria.                                                                                                                                                                                        

  **`PROC-ICX-02`**   **B2B Outreach,   `[LOCAL-RABAT]`       Execute cold calls, personalized       MM External      Qualified Lead record, French/English outreach templates                                                              Discovery Notes, BANT/Need       `PROC-ICX-01`
                      Discovery &                             French/English outreach emails, and    Engine / BD      ([SRC-019](https://docs.google.com/spreadsheets/d/1kkmiMJXy3pF4_pl063Z6A89qUrLXCFJXe81mQJWfhDM/edit?usp=drivesdk))    Qualification Score, Pipeline    
                      Qualification**                         discovery meetings to diagnose         Members                                                                                                                                transition to                    
                                                              organizational needs before pitching                                                                                                                                          `DISCOVERY_COMPLETED`            
                                                              products.                                                                                                                                                                                                      

  **`PROC-ICX-03`**   **Proposal,       `[GLOBAL-POLICY]` +   Align on project/internship JD, slot   LCVP ICX + LCVP  Discovery Notes, Product Rules (`AEPP 3.2`), Contract Template (French/English), OP Legal ID (`ICE`/`RC`/Dahir        Signed `partner_agreements`      `PROC-ICX-02`
                      Negotiation &     `[LOCAL-RABAT]`       dates, capacity, accommodation         FnL + MM         receipt)                                                                                                              record (valid ≥1 year per        
                      Legal                                   coverage, and fees; execute            External                                                                                                                               `APIP 5.2.4.3.1`), generated     
                      Contracting**                           physical/digital MoU & Opportunity                                                                                                                                            Invoice (`invoices`)             
                                                              Contract within OP's legal                                                                                                                                                                                     
                                                              jurisdiction (Morocco).                                                                                                                                                                                        

  **`PROC-ICX-04`**   **Opportunity     `[GLOBAL-POLICY]`     Draft opportunity on POP/EXPA with     LCVP ICX / MM    Signed Contract, Global Volunteer Portfolio                                                                           Published `opportunities` and    `PROC-ICX-03`
                      Creation,                               exact SDG/Portfolio alignment (iGV) or Internal Engine  ([SRC-015](https://docs.google.com/spreadsheets/d/1TIooseQqGzmkcg36xQges29KxmJUdEa_nHIBbpywxBQ/edit?usp=drivesdk)),   `opportunity_slots` synced with  
                      Validation &                            professional field/salary (iGTa/iGTe),                  Partly Remote Audit approval (if applicable)                                                                          `expa_opportunity_id` (`LIVE`)   
                      Publication**                           assign Account Manager within 7 days,                                                                                                                                                                          
                                                              and publish slots.                                                                                                                                                                                             

  **`PROC-ICX-05`**   **IR Partner      `[GLOBAL-POLICY]` +   Research historical and seasonal       MM Internal      Published Opportunities, Visa regime matrix for Morocco (Visa-Free vs. AEVM vs. Embassy), IR historical performance   Active `ir_partnerships` with    `PROC-ICX-04`
                      Discovery,        `[LOCAL-RABAT]`       supply entities, conduct IR calls,     Engine (IR                                                                                                                             committed `slot_allocations` and 
                      Qualification &                         sign IR partnership commitments, and   Coordinator)                                                                                                                           SLA response rules               
                      Supply                                  distribute Rabat Opportunity Packs &                                                                                                                                                                           
                      Allocation**                            Promotion Trackers.                                                                                                                                                                                            

  **`PROC-ICX-06`**   **EP Application  `[GLOBAL-POLICY]`     Ingest EP applications from EXPA/YOP,  MM Internal      `ep_applications` (`APPLIED`), EP CV/profile, Opportunity Pre-Screen Answers                                          Interview evaluation scorecard,  `PROC-ICX-04`,
                      Intake,                                 verify eligibility (age 18--30,        Engine (Matching                                                                                                                       status transition to             `PROC-ICX-05`
                      Pre-Screening &                         languages, skills, visa feasibility),  Team)                                                                                                                                  `SHORTLISTED` (internal) or      
                      Host Interview**                        conduct Host LC interview within                                                                                                                                              `REJECTED` (with mandatory       
                                                              24--48h, and shortlist for OP.                                                                                                                                                feedback)                        

  **`PROC-ICX-07`**   **OP Selection    `[GLOBAL-POLICY]`     Coordinate interview/review between    MM Internal      Shortlisted EP dossier, OP availability                                                                               OP decision                      `PROC-ICX-06`
                      Interview &                             shortlisted EP and Opportunity         Engine + OP                                                                                                                            (`ACCEPTED_BY_HOST`), EP signs   
                      Candidate                               Provider (for iGTa/iGTe and applicable Representative                                                                                                                         AN (`ACCEPTED`), OP rejection    
                      Acceptance                              iGV), enforce max 3 unjustified                                                                                                                                               counter updated                  
                      (`ACC`)**                               rejections rule (`AEPP 4.2.2.1.7`),                                                                                                                                                                            
                                                              and issue Acceptance Note (`AN`).                                                                                                                                                                              

  **`PROC-ICX-08`**   **EP Approval     `[GLOBAL-POLICY]`     Verify payment/compliance gates,       LCVP ICX + MM    `ACCEPTED` application, signed AN, OP & EP fee verification                                                           Status = `APPROVED`, generated   `PROC-ICX-07`
                      (`APD`) &                               approve application on EXPA            Internal Engine                                                                                                                        Invitation Letter + Expectation  
                      Post-Approval                           (`APPROVED`), assign EP Manager within                                                                                                                                        Setting Doc + Visa Checklist     
                      Legal                                   7 days (`AEPP 4.4.4.3`), and deliver                                                                                                                                          within 14 days                   
                      Onboarding**                            Visa Invitation Pack & Written                                                                                                                                                                                 
                                                              Expectation Setting within 14 days                                                                                                                                                                             
                                                              (`AEPP 4.4.3.1`).                                                                                                                                                                                              

  **`PROC-ICX-09`**   **Visa Tracking,  `[GLOBAL-POLICY]` +   Track EP visa filing (within 14d of    MM Internal      `APPROVED` EP, Passport copy, Insurance policy, Accommodation inventory, Flight/Train itinerary                       Verified Visa                    `PROC-ICX-08`
                      Accommodation     `[LOCAL-RABAT]`       doc receipt), allocate bed in Global   Engine                                                                                                                                 (`GRANTED`/`VISA_FREE`),         
                      Allocation &                            Host family or hostel (`Standard #7`), (Logistics &                                                                                                                           Assigned Bed                     
                      14-Day                                  verify travel insurance                CXP)                                                                                                                                   (`accommodation_allocations`),   
                      Pre-Arrival                             (`Standard #3`), and execute Rabat's                                                                                                                                          Locked Pre-Arrival Gate (T-14d)  
                      Lock**                                  **14-Day Pre-Arrival OP &                                                                                                                                                                                      
                                                              Accommodation Re-Confirmation Lock**.                                                                                                                                                                          

  **`PROC-ICX-10`**   **Arrival Pickup, `[GLOBAL-POLICY]` +   Send written pickup instructions ≥3    MM Internal      Confirmed Arrival Ticket, IPS Curriculum, OP Day-1 Schedule                                                           Status = `REALIZED` (date within `PROC-ICX-09`
                      IPS Delivery &    `[LOCAL-RABAT]`       days prior (`Standard #6`), execute    Engine (CXP /                                                                                                                          ±20 days of slot start for iGV   
                      First Day of Work                       airport/station pickup                 Buddy)                                                                                                                                 per `APIP 5.3.5`), Standards     
                      (`RE`)**                                (`CMN`/`RBA`/Rabat Agdal), deliver                                                                                                                                            #4--#9 & #10a logged for Middle  
                                                              Incoming Preparation Seminar                                                                                                                                                  Survey                           
                                                              (`Standard #8`), accompany EP to OP on                                                                                                                                                                         
                                                              Day 1 (`Standard #9`), and mark                                                                                                                                                                                
                                                              `REALIZED` (`RE`).                                                                                                                                                                                             

  **`PROC-ICX-11`**   **Exchange        `[GLOBAL-POLICY]`     Conduct mandatory bi-weekly (iGV) or   MM Internal      Active `REALIZED` EP, Checkpoint Question Bank                                                                        Logged touchpoints, LEAD session `PROC-ICX-10`
                      Delivery,                               monthly (iGTa/iGTe) Review Checkpoints Engine (EP       ([SRC-014](https://docs.google.com/presentation/d/17RFsau6BVK1loWPXgHcNTyKpEEYWKhH4wlyrHapTpjE/edit?usp=drivesdk)),   attendance, Middle Survey        
                      Checkpoints                             (`Standard #17`), deliver Value-Driven Manager)         GV Portfolio MoO indicators                                                                                           completion chase, 2-day          
                      (#17), LEAD (#15)                       Leadership Education (`Standard #15`),                                                                                                                                        unreachable safety monitoring    
                      & MoO Tracking**                        audit working hours/benefits                                                                                                                                                                                   
                                                              (`#11–#14`), and collect SDG impact                                                                                                                                                                            
                                                              metrics (MoO).                                                                                                                                                                                                 

  **`PROC-ICX-12`**   **Issue           `[GLOBAL-POLICY]`     Handle operational complaints, safety  LCVP ICX + LCP + Issue report, evidence dossier, `Annex 2` Compensation Table                                                          Replacement EP/OP matching       Any Delivery
                      Resolution, Break                       emergencies, salary delays, or Break   ECB Chair        ([SRC-008](https://drive.google.com/file/d/1utNAwjhDPAMUwsuLvErSkTaOyF2yi1nZ/view?usp=drivesdk))                      (within 1--2 wks), Compensation  Process
                      Handling &                              requests (`APD Break`, `RE Break`,                                                                                                                                            Payout Ledger, or ECB/ICB        
                      3-Stage Case                            `Early Finish`) via the statutory LC →                                                                                                                                        Official Case resolution         
                      Solving**                               ECB → ICB escalation protocol                                                                                                                                                                                  
                                                              (`APIP 6.9`) and `Annex 2`                                                                                                                                                                                     
                                                              compensation calculator.                                                                                                                                                                                       

  **`PROC-ICX-13`**   **Departure       `[GLOBAL-POLICY]`     Provide written departure logistics    MM Internal      `REALIZED` EP reaching end date, Standards #1--#18 evidence log, EXPA Survey status                                   Status = `FINISHED` →            `PROC-ICX-11`
                      Support, OP Final                       ≥14 days before end (`Standard #16`),  Engine + Sending                                                                                                                       `COMPLETED` (`CO`), EP           
                      Debrief, `FIN` &                        conduct final OP alignment             Entity                                                                                                                                 Certificate, Testimonials/Media  
                      `CO` Validation**                       (`Standard #10b`), transition to                                                                                                                                              pack                             
                                                              `FINISHED`, ensure Final Survey & SE                                                                                                                                                                           
                                                              Debrief (`Standard #18`), and validate                                                                                                                                                                         
                                                              `COMPLETED`                                                                                                                                                                                                    
                                                              (`13 Mandatory + ≥3 Non-Mandatory`).                                                                                                                                                                           

  **`PROC-ICX-14`**   **Partner         `[LOCAL-RABAT]` +     Conduct closing impact review with OP  LCVP ICX + MM    Project Impact Report, Partner NPS Survey, Historical Delivery Scorecard                                              Renewed `partner_agreements` or  `PROC-ICX-13`
                      Debrief, NPS      `[ ERP-DESIGN]`       within 14 days of project end, present External Engine                                                                                                                        upsell opportunity in B2B        
                      Evaluation,                             SDG Impact Report, collect Partner                                                                                                                                            pipeline                         
                      Renewal &                               NPS, and pitch contract renewal or                                                                                                                                                                             
                      Upselling**                             cross-sell (e.g., iGV partner upsold                                                                                                                                                                           
                                                              to iGTa).                                                                                                                                                                                                      

  **`PROC-ICX-15`**   **Financial       `[GLOBAL-POLICY]` +   Issue partner invoices, track payment  LCVP FnL + LCVP  Signed Contracts, Payment Receipts, Expense Vouchers ([AFPM                                                           Reconciled                       `PROC-ICX-03`,
                      Invoicing,        `[LOCAL-RABAT]`       tranches, enforce \<14-day overdue     ICX              SRC-012](https://drive.google.com/file/d/1bsZfRTVLj1lpXEho_Trb8Ey1dGvSTQhs/view?usp=drivesdk))                        `financial_transactions`,        `PROC-ICX-08`,
                      Collection,                             receivable chasing, log direct                                                                                                                                                Monthly Financial Report (MFR)   `PROC-ICX-13`
                      Expense Auditing                        exchange expenses (accommodation,                                                                                                                                             export, Audit-ready ledger       
                      & AFPM                                  pickup, IPS), and compute AFPM                                                                                                                                                                                 
                      Reporting**                             Exchange Sustainability Ratio                                                                                                                                                                                  
                                                              (`>1.0`).                                                                                                                                                                                                      
  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

\<a id=\"deliverable-3\"\>\</a\> \## 5. DELIVERABLE 3: DETAILED
END-TO-END PROCESS MAPS & TRACEABILITY MATRIX

### 5.1 Product Comparison Matrix: iGV vs. iGTa vs. iGTe vs. Remote Modalities (`[GLOBAL-POLICY]`)

Every workflow in the ERP dynamically adapts its validation gates,
required documents, fee structures, and checklists based on the
opportunity's `product_code` and `modality_code`:

  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Dimension         Incoming Global Volunteer (`iGV`)                                                                                    Incoming Global       Incoming Global      Partly Remote (`iGTa`/`iGTe`)        Fully Remote
                                                                                                                                         Talent (`iGTa`)       Teacher (`iGTe`)                                          (`iGTa`/`iGTe`)
  ----------------- -------------------------------------------------------------------------------------------------------------------- --------------------- -------------------- ------------------------------------ -----------------------
  **Statutory       `AEPP 3.2.1` & `APIP 5.3`                                                                                            `AEPP 3.2.2` &        `AEPP 3.2.3` &       `AEPP Section 6` & `APIP 5.2.3`      `AEPP Section 7`
  Authority**                                                                                                                            `APIP 5.2`            `APIP 5.2`                                                

  **Duration        **6 to 8 weeks** (strict; extensions only up to 8 wks max)                                                           **6 to 78 weeks**     **9 to 78 weeks**    **Min 13 weeks (3 months)** to 78    **6 to 26 weeks** (1.5
  Limits**                                                                                                                               (extensions allowed   (extensions allowed  weeks; remote part **≤50%** of total to 6 months)
                                                                                                                                         up to 78 wks total)   up to 78 wks total)  duration                             

  **Working Hours** **25 to 40 hours / week**                                                                                            **35 to 45 hours /    **35 to 45 hours /   **35 to 45 hours / week**            **35 to 45 hours /
                                                                                                                                         week**                week**                                                    week**

  **Eligible Host   Registered NGOs, charities, schools, foundations, social enterprises (**AIESEC cannot be OP**)                       Registered companies, Registered schools,  Registered companies/schools audited Registered
  OPs**                                                                                                                                  startups, MNCs,       universities,        & approved by **ICB**                companies/schools
                                                                                                                                         institutions, NGOs    language institutes, (`aies.ec/partlyremote-auditform`)   
                                                                                                                                         (for professional     educational centers                                       
                                                                                                                                         roles)                                                                          

  **Permitted       Must use official **Global Volunteer Portfolio** projects & UN SDG targets                                           Business Admin,       Teaching specific    Same as iGTa / iGTe                  Same as iGTa / iGTe
  Fields /          ([SRC-015](https://docs.google.com/spreadsheets/d/1TIooseQqGzmkcg36xQges29KxmJUdEa_nHIBbpywxBQ/edit?usp=drivesdk))   Business Dev,         academic subjects                                         
  Projects**                                                                                                                             Marketing, Finance,   and/or foreign                                            
                                                                                                                                         IT, Engineering       languages                                                 
                                                                                                                                         (`APIP 5.2.3.1.2`)                                                              

  **Supervision     Dedicated OP Project Coordinator                                                                                     **Full-time           **Full-time          Full-time OP employee (remote +      Full-time OP employee
  Rule**                                                                                                                                 employee** of the OP  employee** of the OP physical checkpoints)                (virtual platform
                                                                                                                                         (`AEPP 3.2.2.d`)      (`AEPP 3.2.3.d`)                                          provided)

  **Salary /        Unpaid volunteering (salary prohibited; meals/transport optional or included)                                        • **6--8 wks**:       **Mandatory Salary** During remote phase:                 If \>8 weeks:
  Stipend                                                                                                                                Accommodation         for full duration    optional/negotiated; During physical **Mandatory Salary**
  Requirement**                                                                                                                          provided OR Salary    covering basic       phase: **Mandatory Salary**          (`AEPP 7.2.4`)
                                                                                                                                         covering basic living living costs         (`AEPP 6.3.2.6`)                     
                                                                                                                                         costs`<br>`{=html}•   (`AEPP 3.2.3.g`)                                          
                                                                                                                                         **\>8 wks**:                                                                    
                                                                                                                                         **Mandatory Salary**                                                            
                                                                                                                                         covering basic living                                                           
                                                                                                                                         costs                                                                           

  **Accommodation   **Mandatory (`Obligatory`)**: Covered by OP, 3rd-party funder, or EP Project Fee (`APIP 5.3.2`)                      Mandatory if 6--8 wks Assisted/arranged by Only during physical phase           Not Applicable
  Obligation**                                                                                                                           without salary;       HE or covered by OP  (`Remote Realized` → `Realized`)     (Virtual)
                                                                                                                                         otherwise             per contract                                              
                                                                                                                                         assisted/arranged by                                                            
                                                                                                                                         HE                                                                              

  **Permitted Fees  EP pays oGV fee to SE + optional **Project/Accommodation Fee** to HE (only if explicitly stated on EXPA before       **ZERO (`0 MAD`)      **ZERO (`0 MAD`)     **ZERO (`0 MAD`)**                   **ZERO (`0 MAD`)**
  Charged to EP**   apply)                                                                                                               project or            project or           project/accommodation fees to EP     project/accommodation
                                                                                                                                         accommodation fees    accommodation fees                                        fees to EP
                                                                                                                                         may be charged to     may be charged to                                         
                                                                                                                                         EP**                  EP**                                                      
                                                                                                                                         (`APIP 5.2.3.1.4`)    (`APIP 5.2.3.1.4`)                                        

  **Realization     Actual `RE` date cannot differ by **\>20 days** from EXPA slot start date (`APIP 5.3.5`)                             Must match work       Must match academic  Starts at `Remote Realized` (`RRE`), Starts at
  Date Tolerance**                                                                                                                       permit / visa         calendar / work      transitions to `Realized` (`RE`)     `Remote Realized`
                                                                                                                                         validity and agreed   permit and agreed    upon physical arrival                (`RRE`)
                                                                                                                                         contract start date   start date                                                

  **Applicable      **All 18 Standards** (13 Mandatory + 5 Non-Mandatory)                                                                **All 18 Standards**  **All 18 Standards** **All 18 Standards** (Standards #5,  **10 Standards** (#1,
  Exchange                                                                                                                               (13 Mandatory + 5     (13 Mandatory + 5    #6, #7, #16 apply to physical phase) #2, #4, #8, #9, #10,
  Standards**                                                                                                                            Non-Mandatory)        Non-Mandatory)                                            #11, #13, #17, #18)
  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

### 5.2 Detailed Workflow Specifications (WFL-01 to WFL-08)

#### Workflow 1 (`WFL-01`): B2B Partner Prospecting, Qualification & Contracting (`PROC-ICX-01` to `PROC-ICX-03`)

-   **Trigger & Entry Conditions**: New organization identified via
    market scraping (`iGV NGOs market scraping.ipynb`), referral, or
    incoming POP inquiry.
-   **Responsible Role & Stakeholders**: **MM External Engine** (Owner),
    BD Team Member (Executor), **LCVP ICX** (Approver), **LCVP FnL**
    (Contract/Financial Co-Approver), Organization Representative
    (Decision Maker).
-   **Required Inputs & Records**: Organization legal name, sector
    (`NGO`, `SCHOOL`, `STARTUP`, `CORPORATE`, `INCUBATOR`), city
    (`Rabat`, `Salé`, `Kénitra`, `Temara`), primary contact name, email,
    phone/WhatsApp.
-   **Ordered Steps & Decision Points**:
    1.  **Lead Intake & Deduplication**: System checks normalized name,
        email domain, phone, and Moroccan `ICE` / `RC` number. If
        unique, creates `organizations` record with status `PROSPECT`.
    2.  **Outreach Execution**: Member triggers personalized
        French/English email or WhatsApp outreach sequence
        ([SRC-019](https://docs.google.com/spreadsheets/d/1kkmiMJXy3pF4_pl063Z6A89qUrLXCFJXe81mQJWfhDM/edit?usp=drivesdk)).
        Status → `CONTACTED`. Follow-up task auto-created for
        `T+3 business days`.
    3.  **Discovery Meeting**: Member logs discovery notes:
        organizational pain points, youth capacity, workspace
        availability, supervision capacity, budget/accommodation
        capability, and preferred dates. Status → `DISCOVERY_COMPLETED`.
    4.  **Decision Gate 1 --- Product Routing**:
        -   Need is 6--8 week social impact project with
            NGO/School/Foundation → Route to **iGV**
            (`Global Volunteer Portfolio` project selector).
        -   Need is 6--78 week business/IT/marketing/engineering
            internship with full-time supervisor → Route to **iGTa**.
        -   Need is 9--78 week language/subject teaching role at
            school/institute → Route to **iGTe**.
        -   *Note (`[LOCAL-RABAT]`)*: One partner can spawn multiple
            opportunities across products (e.g., a private school
            hosting both **iGV** summer camp volunteers and **iGTe**
            full-year English teachers).
    5.  **Proposal & Tax Framing (`[LOCAL-RABAT]`)**: Generate tailored
        pitch deck and financial proposal. If corporate funder, classify
        under **Moroccan CGI Art. 57** (*Parrainage Commercial* --- 100%
        deductible marketing invoice with visibility deliverables)
        rather than CGI Art. 10-I-B-2° (*Mécénat*). Status →
        `PROPOSAL_SENT`.
    6.  **Contract Drafting & Legal Verification (`[GLOBAL-POLICY]`:
        `APIP 5.2.4.3.1`)**: Draft bilingual (French/English)
        Contract/MoU valid for ≥1 year in Moroccan jurisdiction,
        specifying: exact JD, working hours, number of openings, EP/OP
        fee breakdown (≥70--100% NGO/third-party funding rule for iGV
        per `APIP 5.3.2.5`), accommodation responsibility, and `Annex 2`
        cancellation liabilities.
    7.  **Dual Signature & FnL Gate**: Contract signed by OP
        Representative + LCVP ICX / LCP, countersigned/verified by LCVP
        FnL (`AFPM`). Status → `CONTRACTED`.
-   **Documents & Evidence**: Signed PDF Contract/MoU, OP Legal
    Registration (`Récépissé de dépôt` for Dahir 1958 NGOs, or
    `RC`/`ICE` certificate for companies), Discovery Notes.
-   **Deadlines, Reminders & Escalations**: Outreach follow-up at
    `T+3d`, `T+7d`, `T+14d`; unsigned contract alert after `7 days` in
    `NEGOTIATION`.
-   **Exception Paths**: Partner lacks budget for iGV accommodation →
    Route to **Tripartite Sponsorship Model** (Company funds NGO slots
    via CSR/Parrainage) or **EP Project Fee Model** (explicitly
    disclosed on EXPA). Partner fails legal verification or is on AIESEC
    blacklist → Status `BLACKLISTED` (hard block on opportunity
    creation).
-   **Completion Conditions**:
    `partner_agreements.status = 'SIGNED_ACTIVE'` and PDF uploaded to
    Drive vault.
-   **Official Source & Confidence**: `APIP 5.2.4.3.1`, `APIP 5.3.2`,
    Rabat BD Tracker
    ([SRC-019](https://docs.google.com/spreadsheets/d/1kkmiMJXy3pF4_pl063Z6A89qUrLXCFJXe81mQJWfhDM/edit?usp=drivesdk))
    --- **100% Verified**.

#### Workflow 2 (`WFL-02`): Opportunity Creation, Validation & Publication (`PROC-ICX-04`)

-   **Trigger & Entry Conditions**:
    `partner_agreements.status = 'SIGNED_ACTIVE'`.
-   **Responsible Role**: **MM Internal Engine** (Opportunity Manager) &
    **LCVP ICX**.
-   **Ordered Steps & Decision Points**:
    1.  **Draft Opportunity in ERP**: Select linked
        `partner_agreement_id` and `product_code` (`iGV`, `iGTa`,
        `iGTe`).
    2.  **Automated Policy Validation Gate (`[GLOBAL-POLICY]`)**:
        -   If `iGV`: Require selection of an official **Global
            Volunteer Portfolio** project (`SDG Target`, `Project Name`,
            `Standardized JD`, `MoO Indicator`), enforce
            `duration_weeks BETWEEN 6 AND 8`,
            `working_hours_per_week BETWEEN 25 AND 40`,
            `accommodation_provided_or_fee = TRUE`, and
            `earliest_start_date <= CURRENT_DATE + 365 days`
            (`APIP 5.3.4`).
        -   If `iGTa`: Require
            `professional_field IN ('Business Admin', 'Business Dev', 'Marketing', 'Finance', 'IT', 'Engineering')`,
            `duration_weeks BETWEEN 6 AND 78`,
            `working_hours_per_week BETWEEN 35 AND 45`,
            `ep_project_fee = 0`, and (`salary >= living_cost_threshold`
            OR (`duration_weeks <= 8` AND
            `accommodation_covered = TRUE`)). If
            `modality = 'PARTLY_REMOTE'`, enforce
            `duration_weeks >= 13`, `remote_percentage <= 50`, and
            require uploaded `icb_partly_remote_audit_approval_url`
            (`APIP 5.2.3.1.8`).
        -   If `iGTe`: Require `duration_weeks BETWEEN 9 AND 78`,
            `working_hours_per_week BETWEEN 35 AND 45`,
            `ep_project_fee = 0`, and `salary >= living_cost_threshold`.
    3.  **Assign Account Manager (`[GLOBAL-POLICY]`:
        `APIP 5.2.2.2.6`)**: Must assign an internal
        `account_manager_member_id` within **7 days** of creation.
    4.  **Publish on EXPA / POP & Link ID**: Opportunity is published on
        EXPA (`expa.aiesec.org`) and its `expa_opportunity_id` +
        `opportunity_slots` are linked via the EXPA GraphQL Read-Sync
        daemon.
-   **Completion Conditions**: `opportunities.status = 'PUBLISHED_LIVE'`
    and `account_manager_member_id IS NOT NULL`.
-   **Official Source & Confidence**: `AEPP 3.2`, `APIP 5.2–5.3`, GV
    Portfolio
    ([SRC-015](https://docs.google.com/spreadsheets/d/1TIooseQqGzmkcg36xQges29KxmJUdEa_nHIBbpywxBQ/edit?usp=drivesdk))
    --- **100% Verified**.

#### Workflow 3 (`WFL-03`): International Relations (IR) Supply Matching & Allocation (`PROC-ICX-05`)

-   **Trigger & Entry Conditions**: Opportunity slots opened
    (`PUBLISHED_LIVE`) for upcoming seasonal peak (Summer Peak or Winter
    Peak).
-   **Responsible Role**: **MM Internal Engine** (IR Coordinator) &
    **LCVP ICX**.
-   **Ordered Steps & Decision Points**:
    1.  **Visa & Supply Feasibility Filtering (`[LOCAL-RABAT]`)**:
        Classify partner entities by Moroccan entry regime:
        -   **Tier A (90-Day Visa-Free Entry)**: EU countries, Turkey,
            Tunisia, Brazil, USA, Canada, UK, etc. (Fast-track
            approvals; can approve up to 3--4 weeks before realization).
        -   **Tier B (Electronic Visa / AEVM --- 24h--72h)**: Eligible
            nationalities or foreign residents of EU/USA/UK/Schengen.
        -   **Tier C (Consular / Embassy Paper Visa --- 3--6 weeks)**:
            Egypt, India, Pakistan, Sub-Saharan African entities
            requiring physical embassy appointment (Must approve ≥6--8
            weeks before slot start date!).
    2.  **IR Discovery & Commitment Call**: Schedule IR alignment call
        with counterpart LCVP oGX, agree on monthly `APP`, `ACC`, `APD`,
        and `RE` targets, and share the **Rabat Opportunity Booklet &
        Pre-Arrival Guide** (covering cost of living in Rabat, safety,
        and accommodation photos).
    3.  **Slot Allocation & SLA Tracking**: Allocate target slot quotas
        in `ir_slot_allocations` and monitor counterpart response time
        (`ir_responsiveness_hours`) and conversion rate (`APP → APD`).

#### Workflow 4 (`WFL-04`): EP Application, Screening, Interview, Acceptance (`ACC`) & Approval (`APD`) (`PROC-ICX-06` to `PROC-ICX-08`)

-   **Trigger & Entry Conditions**: New application ingested from EXPA
    (`APPLIED`) or matched via the ERP Matchmaker Engine.
-   **Responsible Role**: **MM Internal Engine** (EP Manager),
    **Opportunity Provider** (for OP Interview), **LCVP ICX** (Approval
    Gatekeeper).
-   **Ordered Steps & Decision Points**:
    1.  **Application Intake & Matchmaker Scoring (`T+0h`)**: System
        ingests application and calculates a **Match Score (0--100%)**
        based on: Nationality/Visa lead-time compatibility (`30%`),
        Language proficiency (`25%`), SDG/Academic background match
        (`25%`), and Availability vs. Slot dates (`20%`).
    2.  **First Contact & Host LC Screening (`SLA: ≤24h`, Escalation at
        `48h`)**: Assigned member contacts EP via WhatsApp/Email within
        24 hours and conducts Host LC Screening Interview (assessing
        motivation, cultural adaptability to Morocco, financial
        readiness, and expectation alignment).
    3.  **Decision Gate 1 --- Host LC Screening**:
        -   If fail → Transition to `REJECTED`, log mandatory
            constructive feedback (`AEPP 4.2.3.5`).
        -   If pass → Transition to `SHORTLISTED`.
    4.  **OP Review / Interview (`SLA: ≤72h`)**: Share
        anonymized/formatted EP dossier with OP. For iGTa/iGTe (and iGV
        where requested), conduct OP interview.
    5.  **Decision Gate 2 --- OP Selection & 3-Rejection Rule
        (`[GLOBAL-POLICY]`: `AEPP 4.2.2.1.7`)**:
        -   If OP rejects a candidate who meets 100% of posted EXPA
            criteria without valid written feedback, increment
            `opportunities.unjustified_rejections_count`. If count
            reaches `3`, alert LCVP ICX; if `>3`, trigger OP process
            suspension alert!
        -   If OP accepts → Mark `ACCEPTED_BY_HOST` on EXPA, issue
            **Acceptance Note (`AN`)** for EP signature → Status
            `ACCEPTED` (`ACC`).
    6.  **Approval Gate (`ACC → APD`, `SLA: ≤48h–72h`)**: Verify 4
        mandatory pre-Approval checks: (a) Signed Acceptance Note, (b)
        SE oGX Approval confirmation, (c) EP Project Fee payment
        commitment (if iGV with fee), and (d) Passport validity ≥6
        months beyond exchange end date. Both SE and HE click Approve on
        EXPA → Status **`APPROVED` (`APD`)**.
-   **Official Source & Confidence**: `AEPP 4.2–4.3`, `APIP 5.2–5.3`,
    `Annex 3` --- **100% Verified**.

#### Workflow 5 (`WFL-05`): Pre-Arrival Logistics, Visa, Accommodation & Rabat 14-Day Hard Lock (`PROC-ICX-08` to `PROC-ICX-09`)

-   **Trigger & Entry Conditions**: Application transitions to
    `APPROVED` (`APD`).
-   **Ordered Steps & Statutory Deadlines**:
    1.  **Day `APD + 7 Days` Mandatory Gate (`AEPP 4.4.4.3`)**: Confirm
        assigned EP Manager (`he_poc_member_id`) and share contact
        details with EP and SE.
    2.  **Day `APD + 14 Days` Mandatory Legal Gate (`AEPP 4.4.3.1`,
        `4.4.4.1`, `4.4.4.2`)**:
        -   Deliver **Written Expectation Setting Booklet**
            (`Standard #4`: Moroccan laws, cultural norms in Rabat/Salé,
            safety contacts, cost of living, climate, project specifics,
            pickup instructions).
        -   Deliver **Official Visa Invitation Letter & Supporting
            Pack** (`Standard #5`: Legalized NGO/Company Invitation
            Letter, Accommodation Certificate / *Attestation
            d'hébergement*, OP Registration Document) if EP nationality
            requires AEVM or Consular Visa.
        -   *Statutory Consequence*: If HE/OP fails to provide visa
            documents within **14 days** of `APD` and the delay causes
            exchange failure, EP has the legal right to break `APD` with
            **100% reimbursement of EP fees and incurred expenses by
            HE** (`AEPP 4.4.4.1`).
    3.  **EP Visa Filing Tracking (`AEPP 4.4.2.1`)**: EP must update
        visa status within **7 days** of receiving documents and submit
        visa application within **14 days**.
    4.  **Day `RE - 28 Days` (iGV) / `RE - 56 Days` (iGTa/iGTe)
        Cancellation Cutoff (`AEPP 4.4.2.3`, `4.4.3.5`)**: Last legal
        date for EP or OP to declare unavailability under standard
        notice window.
    5.  **Day `RE - 14 Days` Rabat Pre-Arrival Hard Lock
        (`[LOCAL-RABAT]`: `iGV MM Summit`)**:
        -   **OP Re-Confirmation**: OP Coordinator signs/clicks
            confirmation that the project schedule, workspace, and
            supervisor are ready for Day 1.
        -   **Accommodation Allocation & Inspection (`Standard #7`)**:
            Specific bed (`bed_id`) in a vetted Hostel, Apartment, or
            Global Host Family in Rabat/Salé is locked, inspected
            (single bed, clean water, bathroom, electricity verified),
            and address/photos sent to EP.
        -   **Insurance Verification (`Standard #3`)**: EP uploads valid
            travel/medical insurance PDF covering the full stay in
            Morocco.
    6.  **Day `RE - 3 Days` Arrival Support Gate (`Standard #6`:
        `AEPP 1.3.2.6`)**: Written pickup instructions, assigned Pickup
        Buddy name/WhatsApp, emergency phone numbers, and exact transit
        route from `CMN` (Casablanca Mohammed V Airport), `RBA`
        (Rabat-Salé Airport), or `Rabat Agdal / Rabat Ville` train
        station are confirmed with the EP.

#### Workflow 6 (`WFL-06`): Arrival, IPS, First Day of Work (`RE`), Delivery & 18 Standards (`PROC-ICX-10` to `PROC-ICX-11`)

-   **Trigger & Entry Conditions**: EP arrives in Morocco
    (`arrival_timestamp`).
-   **Ordered Steps & Decision Points**:
    1.  **Physical Pickup & Check-in (`Standard #6` & `#7`)**: Buddy
        meets EP at arrival gate/station, assists with local SIM card
        (Maroc Telecom / Inwi / Orange) and currency exchange (`MAD`),
        accompanies EP to accommodation, and completes **Accommodation
        Check-in Sign-off**.
    2.  **Incoming Preparation Seminar (`IPS` --- `Standard #8`:
        `AEPP 1.3.2.8`)**: Delivered in person before or within the
        first days of work. Covers cultural integration in Rabat,
        personal safety, Moroccan laws, transportation (Rabat-Salé
        Tramway, Petit Taxi, ONCF), and leadership development spaces.
        Attendance sheet + photo uploaded.
    3.  **First Day of Work & Initial OP Alignment (`Standard #9` &
        `#10a`: `AEPP 1.3.2.9–10`)**:
        -   HE Member physically accompanies EP to the Opportunity
            Provider on Day 1 (**Mandatory in 2024 Refresh!**).
        -   Facilitates **Initial Alignment Space (`Standard #10a`)**
            between EP and OP Supervisor to align on weekly Job
            Description (`Standard #11`), Working Hours
            (`Standard #12`), and Benefits (`Standard #14`).
        -   Verify actual start date is within **±20 days** of EXPA slot
            start date (for iGV per `APIP 5.3.5`). Transition status to
            **`REALIZED` (`RE`)**!
    4.  **Middle Survey Gate (Standards #1 to #10a)**: Trigger EXPA
        **Middle Survey** notification to EP after Week 1 to capture
        official satisfaction on Standards #1--#10a.
    5.  **Ongoing Delivery Cadence (Weeks 2 to End)**:
        -   **Standard #17 (Review Checkpoints)**: Execute and log
            structured touchpoints **at least bi-weekly for iGV** (Week
            2, Week 4, Week 6) and **at least monthly for iGTa/iGTe**
            ([SRC-014](https://docs.google.com/presentation/d/17RFsau6BVK1loWPXgHcNTyKpEEYWKhH4wlyrHapTpjE/edit?usp=drivesdk)).
        -   **Standard #15 (Value-Driven Leadership Education / LEAD)**:
            Deliver at least 1 structured leadership development
            workshop/space during the exchange.
        -   **MoO / SDG Impact Collection (iGV)**: Collect beneficiary
            counts and pre/post assessments required by the Global
            Volunteer Portfolio.
        -   **Safety Heartbeat (`AEPP 4.5.4.11`)**: If an EP fails to
            respond to messages/calls for **\>2 working days** without
            prior notice, trigger **Red Safety Alert** to LCVP ICX, LCP,
            OP, and SE.

#### Workflow 7 (`WFL-07`): Departure (`#16`), Final Survey, Completion (`FIN` → `CO`) & Partner Retention (`PROC-ICX-13` to `PROC-ICX-14`)

-   **Trigger & Entry Conditions**: Exchange reaches `T - 14 days`
    before scheduled end date.
-   **Ordered Steps & Decision Points**:
    1.  **Day `FIN - 14 Days` Departure Support (`Standard #16`:
        `AEPP 1.3.2.16`)**: Provide written departure instructions
        (airport transit schedule, accommodation check-out procedure,
        visa exit compliance) at least **2 weeks** before the end of the
        exchange.
    2.  **Final Week OP Debrief (`Standard #10b`) & Accommodation
        Check-out**: Facilitate closing alignment space between EP and
        OP Supervisor; inspect accommodation and release any security
        deposit (`AEPP 4.2.1.4`).
    3.  **Transition to `FINISHED` (`FIN`)**: On the final day of the
        exchange (`Duration Standard #13` fulfilled), status transitions
        to **`FINISHED`**.
    4.  **Post-Finish Debrief (`Standard #18`) & Final Survey
        (`FIN → CO`)**:
        -   Coordinate with Sending Entity (`SE`) to ensure **Standard
            #18 (Debrief with AIESEC)** is delivered within 2 weeks of
            return.
        -   EP completes the **Final Survey** on EXPA (covering
            Standards #10b--#18, LDA, NPS, and LPS).
        -   **Automated `CO` Evaluator (`[GLOBAL-POLICY]`: `AEPP 1.3.2`
            & `APIP 2.6.3`)**:
            $$\text{Is Complete (CO)} = \left(\sum_{m \in \text{Mandatory (13)}} S_m == 13\right) \land \left(\sum_{n \in \text{Non-Mandatory (5)}} S_n \ge 3\right)$$
            When satisfied, status transitions to **`COMPLETED`
            (`CO`)**.

#### Workflow 8 (`WFL-08`): Exception Paths, Cancellations, Replacements & 3-Stage Case Solving (`PROC-ICX-12`)

-   **Trigger & Entry Conditions**: Standards breach, visa rejection,
    medical emergency, safety crisis, OP contract breach, or request for
    `Approval Broken`, `Realization Broken`, `Remote Broken`, or
    `Finished Realization Earlier`.
-   **Ordered Steps & Statutory Rules (`AEPP Section 5`,
    `APIP Section 6.9`, `Annex 1`, `Annex 2`, `Annex 9`)**:
    1.  **Verify Valid vs. Invalid Break Grounds (`AEPP 4.4.1`, `4.4.2`,
        `4.5.1`, `4.5.2`)**:
        -   **Valid EP Break Grounds**: Visa rejected (provided EP
            applied on time with accurate docs); life-threatening
            illness/family emergency (with medical certificate);
            destination declared unsafe (war, natural disaster,
            political extremism); HE failed to provide visa docs within
            14 days; OP falsified JD/hours/salary/accommodation; salary
            unpaid for 2 consecutive months; workplace
            harassment/illegal activity.
        -   **Valid OP Break Grounds**: EP falsified CV/skills; EP visa
            rejected; EP broke national laws or company policies (with
            proof); EP absent \>5 consecutive working days without
            notice.
    2.  **Execute Statutory Replacement Window (`Annex 2`)**:
        -   **APD Break by EP/SE**: SE has **14 days (2 weeks)** to
            provide a replacement EP who can realize within **30 days (1
            month)** of original RE date; otherwise SE pays OP contract
            expenses.
        -   **APD Break by OP/HE**: HE has **14 days (2 weeks)** to
            provide a replacement OP with identical JD and start date;
            otherwise HE/OP reimburses 100% of EP fees and travel/visa
            expenses.
        -   **RE Break by OP/HE**: HE has **7 days (1 week)** to provide
            a replacement OP in the same city/project; otherwise HE/OP
            reimburses 100% of EP travel, visa, and fee expenses +
            salary penalties.
    3.  **3-Stage Case Solving Escalation Clocks (`APIP 6.9`)**:
        -   **Stage 1 (LC-to-LC)**: Aggrieved LC files complaint via
            ERP/email → Respondent LC must acknowledge within **24h** →
            Complainant/Respondent negotiate within **48h** → If
            unresolved after **72h (3 days)**, auto-escalate to Stage 2.
        -   **Stage 2 (ECB-to-ECB)**: Complainant ECB contacts
            Respondent ECB → Respondent ECB must reply within **48h** →
            Complainant ECB replies within **48h** → Max **96h**
            negotiation window (escalate to ICB after **7 days**).
        -   **Stage 3 (ICB --- OCA / OCCA)**: Submit Official Case
            Arbitration (`OCA` for standards/refunds) or Official
            Compendium Case Arbitration (`OCCA` for fake statuses/policy
            breaches) → ICB accepts/rejects within **48h** → Respondent
            has **5 days** (`OCA`) or **3 days** (`OCCA`) to submit
            counter-evidence → ICB issues binding ruling within **5
            days** (up to 10 days max).
        -   **Appeal (`Annex 9`)**: Leave to appeal within **48h** of
            decision + completed `Annex 9` Appeal Template within
            **72h**.
        -   **Urgency / Extraordinary Protocol (`APIP 6.9.2`)**: Life in
            danger, EP stranded without accommodation, or unpaid salary
            → Direct escalation to **ECB Chair + ICB Chair** with
            **48h--72h** binding resolution.
        -   **Harassment Protocol (`Annex 1`)**: Immediate physical
            relocation of EP → **Harassment Prevention Committee**
            starts investigation within **24h** and issues signed PDF
            final report within **7 working days**.

------------------------------------------------------------------------

### 5.3 Master End-to-End Traceability Matrix (`Official Requirement → Process → Module → Entity → Action → Automation → KPI → Test`)

  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Trace ID       Official Requirement &   Business Process ERP Module     Core Data Entity              User Action            Automation Rule                                  Linked KPI                               Validation
                 Clause Citation                                                                                                                                                                                         Test
  -------------- ------------------------ ---------------- -------------- ----------------------------- ---------------------- ------------------------------------------------ ---------------------------------------- ------------
  **`TRC-01`**   **Contract Validity &    `PROC-ICX-03`    Module H       `partner_agreements`          LCVP ICX / FnL         `AUTO-004`: Block opportunity creation if        `% Active Contracted Partners`           `TEST-004`
                 Jurisdiction**: OP                        (Contracts) &                                generates & uploads    agreement status != `SIGNED_ACTIVE` or                                                    
                 contract must be valid                    Module F (PRM)                               signed bilingual MoU   `end_date < start_date + 365d`                                                            
                 ≥1 year in OP's legal                                                                                                                                                                                   
                 jurisdiction                                                                                                                                                                                            
                 (`APIP 5.2.4.3.1.2–4`)                                                                                                                                                                                  

  **`TRC-02`**   **iGV Portfolio &        `PROC-ICX-04`    Module C       `opportunities`,              Opportunity Manager    `AUTO-006`: Reject save if                       `% Portfolio-Compliant iGV Openings`     `TEST-006`
                 Duration**: iGV must                      (Opportunity   `gv_portfolio_templates`      creates iGV            `duration_weeks NOT IN 6..8`,                                                             
                 last 6--8 wks,                            Mgmt)                                        opportunity            `hours NOT IN 25..40`, or                                                                 
                 25--40h/wk, and match GV                                                                                      `gv_project_id IS NULL`                                                                   
                 Portfolio SDG target                                                                                                                                                                                    
                 (`AEPP 3.2.1`,                                                                                                                                                                                          
                 `APIP 5.3.2`)                                                                                                                                                                                           

  **`TRC-03`**   **iGTa/iGTe Salary &     `PROC-ICX-04`    Module C       `opportunities`               Opportunity Manager    `AUTO-007`: Hard-lock `ep_project_fee = 0` for   `% Compliant GTa/GTe Slots`              `TEST-007`
                 Zero EP Fee**: iGTa (\>8                  (Opportunity                                 configures iGTa/iGTe   iGTa/iGTe and require                                                                     
                 wks) & iGTe (9--78 wks)                   Mgmt)                                        specifics              `salary_amount >= min_living_cost`                                                        
                 require full salary and                                                                                                                                                                                 
                 0 EP project/accomm fees                                                                                                                                                                                
                 (`AEPP 3.2.2–3`,                                                                                                                                                                                        
                 `APIP 5.2.3.1.4`)                                                                                                                                                                                       

  **`TRC-04`**   **Account Manager        `PROC-ICX-04`    Module C       `opportunities`               LCVP / MM assigns      `AUTO-008`: Alert at `T+5d`; escalate to LCVP    `Avg Account Manager Assignment Time`    `TEST-008`
                 Assignment**: Assign                      (Opportunity                                 `account_manager_id`   ICX at `T+7d` if unassigned                                                               
                 Account Manager within 7                  Mgmt)                                                                                                                                                         
                 days of opening                                                                                                                                                                                         
                 opportunity                                                                                                                                                                                             
                 (`APIP 5.2.2.2.6`)                                                                                                                                                                                      

  **`TRC-05`**   **OP Rejection Limit**:  `PROC-ICX-07`    Module D (EP   `ep_applications`,            Member logs OP         `AUTO-012`: Increment                            `OP Candidate Acceptance Rate`           `TEST-012`
                 OP rejecting \>3                          Mgmt) & Module `opportunities`               rejection without      `unjustified_rejections_count`; freeze OP                                                 
                 qualified EPs without                     F (PRM)                                      valid criteria         pipeline at `>3`                                                                          
                 feedback faces process                                                                 mismatch                                                                                                         
                 suspension                                                                                                                                                                                              
                 (`AEPP 4.2.2.1.7`)                                                                                                                                                                                      

  **`TRC-06`**   **14-Day Post-APD Visa & `PROC-ICX-08`    Module D (EP   `ep_applications`,            Member generates &     `AUTO-015`: Countdown timer from `approved_at`;  `% EPs Receiving Visa & Exp Docs ≤14d`   `TEST-015`
                 Expectation Setting**:                    Mgmt) & Module `ep_standards_evidence`       sends Invitation       Red Alert at `T+10d`; Liability warning at                                                
                 Deliver Visa Invitation                   G (Quality)                                  Letter + Expectation   `T+14d`                                                                                   
                 Pack & Written                                                                         Doc                                                                                                              
                 Expectation Setting                                                                                                                                                                                     
                 within 14 days of `APD`                                                                                                                                                                                 
                 (`AEPP 4.4.3.1`,                                                                                                                                                                                        
                 `4.4.4.1`)                                                                                                                                                                                              

  **`TRC-07`**   **28d / 56d Pre-RE       `PROC-ICX-09`,   Module D (EP   `ep_applications`,            User initiates Break   `AUTO-018`: Flag whether break is inside `<28d`  `APD → RE Conversion Rate (%)`           `TEST-018`
                 Cancellation Window**:   `PROC-ICX-12`    Mgmt) & Module `quality_cases`               Approval request       / `<56d` penalty zone and compute `Annex 2`                                               
                 Unavailability notice                     G (Quality)                                                         liability                                                                                 
                 max 28d (GV) or 56d                                                                                                                                                                                     
                 (GTa/GTe) before `RE`                                                                                                                                                                                   
                 (`AEPP 4.4.2.3`,                                                                                                                                                                                        
                 `4.4.3.5`)                                                                                                                                                                                              

  **`TRC-08`**   **Rabat 14-Day           `PROC-ICX-09`    Module F (PRM) `ep_applications`,            MM Internal confirms   `AUTO-019`: Lock check at `RE - 14d`; escalate   `% Realizations Confirmed ≥14d Out`      `TEST-019`
                 Pre-Arrival Lock**: OP &                  & Module G     `accommodation_allocations`   OP readiness & bed     to LCVP & LCP if unconfirmed                                                              
                 Accommodation must be                     (Quality)                                    assignment                                                                                                       
                 confirmed ≥14 days                                                                                                                                                                                      
                 before arrival                                                                                                                                                                                          
                 (`[LOCAL-RABAT]`:                                                                                                                                                                                       
                 `iGV MM Summit`)                                                                                                                                                                                        

  **`TRC-09`**   **3-Day Arrival Support  `PROC-ICX-10`    Module G       `ep_standards_evidence`,      Pickup Buddy logs      `AUTO-021`: Require #6, #7, #8, #9 evidence      `% On-Time Arrival & Day-1 Delivery`     `TEST-021`
                 & Mandatory Day-1 Work                    (Delivery &    `ep_applications`             arrival & Day-1 OP     before marking `REALIZED`                                                                 
                 Accompaniment**: Written                  Quality)                                     check-in                                                                                                         
                 pickup info ≥3d prior                                                                                                                                                                                   
                 (`#6`); HE accompanies                                                                                                                                                                                  
                 EP on Day 1 (`#9` ---                                                                                                                                                                                   
                 Mandatory in 2024)                                                                                                                                                                                      

  **`TRC-10`**   **iGV 20-Day Realization `PROC-ICX-10`    Module D (EP   `ep_applications`             Member enters actual   `AUTO-022`: Block or flag `REALIZED` transition  `Slot Date Accuracy Rate (%)`            `TEST-022`
                 Tolerance**: Actual `RE`                  Mgmt)                                        `realized_at` date     if                                                                                        
                 date cannot differ by                                                                                         `ABS(realized_at - slot_start_date) > 20 days`                                            
                 \>20 days from EXPA slot                                                                                                                                                                                
                 date (`APIP 5.3.5`)                                                                                                                                                                                     

  **`TRC-11`**   **Regular Checkpoints    `PROC-ICX-11`    Module G       `ep_touchpoints`,             EP Manager logs        `AUTO-024`: Generate recurring touchpoints;      `% Touchpoint Compliance (#17)`          `TEST-024`
                 (#17) & 2-Day                             (Delivery) &   `safety_alerts`               checkpoint or marks    trigger `CRITICAL_SAFETY_ALERT` after 48h                                                 
                 Unreachable Safety                        Module J                                     "No Response"          unreachable                                                                               
                 Rule**: Bi-weekly (GV) /                  (Tasks)                                                                                                                                                       
                 monthly (GT) touchpoints                                                                                                                                                                                
                 (`#17`); locate EP if                                                                                                                                                                                   
                 unreachable \>2 working                                                                                                                                                                                 
                 days (`AEPP 4.5.4.11`)                                                                                                                                                                                  

  **`TRC-12`**   **18 Exchange Standards  `PROC-ICX-13`    Module G       `ep_standards_evidence`,      System evaluates       `AUTO-028`: Compute `CO` eligibility             `RE → CO Conversion Rate (%)`            `TEST-028`
                 Completion Rule                           (Delivery &    `ep_applications`             Middle & Final         (`13/13 Mandatory` AND `≥3/5 Non-Mandatory`)                                              
                 (`CO`)**: All 13                          Quality)                                     Survey + evidence                                                                                                
                 Mandatory + ≥3 of 5                                                                                                                                                                                     
                 Non-Mandatory Standards                                                                                                                                                                                 
                 fulfilled (`AEPP 1.3.2`,                                                                                                                                                                                
                 `APIP 2.6.3`)                                                                                                                                                                                           

  **`TRC-13`**   **3-Stage Case Solving   `PROC-ICX-12`    Module G       `quality_cases`,              LCVP / ECB logs        `AUTO-030`: Run statutory SLA timers;            `Avg Case Resolution Time (Hours)`       `TEST-030`
                 Escalation Clocks**: 24h                  (Delivery &    `case_escalations`            complaint or response  auto-notify ECB/ICB on breach                                                             
                 ack / 48h reply / 72h                     Quality)                                                                                                                                                      
                 ECB escalation; 48h/96h                                                                                                                                                                                 
                 ECB; 48h/5d ICB                                                                                                                                                                                         
                 (`APIP 6.9`)                                                                                                                                                                                            

  **`TRC-14`**   **Annex 2 Salary Delay & `PROC-ICX-12`,   Module G       `quality_cases`,              LCVP / ECB inputs      `AUTO-031`: Calculate exact statutory            `Total Unrecovered Liability (MAD)`      `TEST-031`
                 Dismissal                `PROC-ICX-15`    (Quality) &    `compensation_claims`         delay days or          compensation & fine in `MAD`/`EUR`                                                        
                 Compensation**: \>30d                     Module I                                     dismissal date                                                                                                   
                 salary delay = 2% daily                   (Finance)                                                                                                                                                     
                 fine; dismissal \<70% vs                                                                                                                                                                                
                 ≥70% duration                                                                                                                                                                                           
                 (`Annex 2`)                                                                                                                                                                                             

  **`TRC-15`**   **AFPM Exchange          `PROC-ICX-15`    Module I       `invoices`, `expenses`,       LCVP FnL records       `AUTO-033`: Flag overdue invoices at `T+14d`;    `Exchange Sustainability Ratio (>1.0)`   `TEST-033`
                 Sustainability & AR                       (Finance) &    `financial_ledgers`           invoices & direct      block unprofitable project budgets                                                        
                 Chasing**: Direct                         Module K                                     exchange costs                                                                                                   
                 Exchange Revenue \>                       (Analytics)                                                                                                                                                   
                 Direct Exchange Costs                                                                                                                                                                                   
                 (`ratio > 1.0`); chase                                                                                                                                                                                  
                 overdue AR \>14 days                                                                                                                                                                                    
                 (`AFPM`)                                                                                                                                                                                                
  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

\<a id=\"deliverable-4\"\>\</a\> \## 6. DELIVERABLE 4: COMPLETE
STAKEHOLDER & CRM RELATIONSHIP SPECIFICATION

### 6.1 Stakeholder Category Matrix

The ERP eliminates fragmented WhatsApp chats, personal spreadsheets, and
email silos by modeling **8 distinct stakeholder categories** in a
unified relational graph:

  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Stakeholder         Entity Table(s)               Stored Attributes            Roles & Responsibilities    Unified Relationship Associated Entities             Internal Owner  Follow-Up & Deadlines           Permissions & Access
  Category                                                                                                   & Comm History                                                                                       
  ------------------- ----------------------------- ---------------------------- --------------------------- -------------------- ------------------------------- --------------- ------------------------------- --------------------
  **1. Exchange       `ep_profiles`,                Full name, EXPA Person ID,   Apply to opportunities,     All WhatsApp         `ep_applications`,              **EP Manager**  • 24h First                     Read-only
  Participants (EPs & `ep_applications`,            nationality, residency       attend screening/OP         touchpoints          `opportunities`,                (MM Internal    Contact`<br>`{=html}• 7d/14d    self-portal view
  Prospective EPs)**  `ep_emergency_contacts`       country, passport \# &       interviews, sign AN, pay    (deep-linked &       `opportunity_slots`,            Engine member)  Visa Check`<br>`{=html}•        (optional) or
                                                    expiry, DOB, gender,         fees, apply for visa within logged), Gmail       `accommodation_allocations`,                    Bi-weekly/Monthly               external; sensitive
                                                    languages, skills, CV link,  14d, buy insurance, attend  threads              `ep_standards_evidence`,                        Checkpoints`<br>`{=html}• 48h   health/passport
                                                    dietary/medical notes        OPS/IPS, work 25--45h/wk,   (`threadUrl`),       `quality_cases`,                                Unreachable Safety Alert        fields restricted to
                                                    (encrypted per Law 09-08),   complete Middle & Final     interview notes,     `financial_transactions`.                                                       Assigned Owner, MM
                                                    visa regime tier             Surveys.                    checkpoint logs                                                                                      Internal, LCVP ICX,
                                                    (`VISA_FREE`, `AEVM`,                                    (`#17`), and survey                                                                                  LCP, ECB.
                                                    `EMBASSY`), emergency                                    responses on a                                                                                       
                                                    contact.                                                 single chronological                                                                                 
                                                                                                             timeline.                                                                                            

  **2. Opportunity    `organizations`,              Legal name, trade name, type Define project/internship   Multi-contact B2B    `organization_contacts` (1:N),  **Account       • 3d/7d/14d Sales               Internal BD & ICX
  Providers (OPs) &   `organization_contacts`,      (`NGO`, `SCHOOL`, `COMPANY`, JDs, interview candidates   activity stream      `partner_agreements` (1:N),     Manager** (MM   Follow-up`<br>`{=html}• 7d      team read/write;
  Representatives**   `partner_agreements`          `STARTUP`, `INCUBATOR`),     within 72h, provide safe    (cold calls, emails  `opportunities` (1:N across     External for    Account Manager                 optional external
                                                    Moroccan legal IDs (`ICE`,   workspace & full-time       sent via 1-click     iGV/iGTa/iGTe), `invoices`      Sales → MM      Assignment`<br>`{=html}• 14d    Partner Portal view
                                                    `RC`, `Dahir 1958 Receipt`), supervisor, cover           Gmail integration,   (1:N), `ep_applications` (1:N). Internal for    Pre-Arrival                     limited strictly to
                                                    city/address, GPS            fees/salary/accommodation   discovery notes,                                     Delivery, or    Re-Confirmation`<br>`{=html}•   their own
                                                    coordinates, SDG focus,      per contract, co-host Day 1 contract                                             shared          14d Post-Project Impact Debrief opportunities and
                                                    multiple contact persons     & Final Alignment (`#9`,    negotiations, issue                                  ownership)                                      shortlisted EPs.
                                                    (Decision Maker, HR/Project  `#10`).                     logs, NPS reviews).                                                                                  
                                                    Supervisor, Finance Contact,                                                                                                                                  
                                                    Field Coordinator), tax                                                                                                                                       
                                                    regime                                                                                                                                                        
                                                    (`CGI_ART_57_SPONSORSHIP`,                                                                                                                                    
                                                    `CGI_ART_10_MECENAT`,                                                                                                                                         
                                                    `STANDARD_FEE`).                                                                                                                                              

  **3. International  `ir_entities`, `ir_contacts`, Country/MC name, LC name,    Promote Rabat opportunities Log of IR discovery  `ir_contacts` (1:N),            **IR            • Monthly IR Sync               Internal ICX team
  Relations (IR)      `ir_partnerships`,            EXPA Office ID, Moroccan     to their local EP leads,    calls, joint         `ir_slot_allocations` (1:N),    Coordinator**   Call`<br>`{=html}• 48h          read/write.
  Partner Entities &  `ir_slot_allocations`         visa regime tier, peak       pre-screen applicants,      campaigns, slot      `ep_applications` (1:N as       (MM Internal    Application Approval            
  Contacts**                                        supply months, LCVP oGX / TL deliver Standards #1 (Goal  commitments,         Sending Entity `SE`).           Engine)         SLA`<br>`{=html}• Post-Peak IR  
                                                    contact details (name,       Setting), #2 (OPS), #3      WhatsApp group                                                       Review                          
                                                    `@aiesec.net` email,         (Insurance), and #18        links, and SLA                                                                                       
                                                    WhatsApp, timezone),         (Debrief), co-resolve Stage response speed                                                                                       
                                                    historical performance       1 cases.                    tracking.                                                                                            
                                                    (`APP`, `ACC`, `APD`, `RE`,                                                                                                                                   
                                                    `CO`, SLA breaches, Health                                                                                                                                    
                                                    Score).                                                                                                                                                       

  **4. Local          `internal_users`,             Full name, `@aiesec.net`     Execute B2B sales, IR       Internal task        Owned `organizations`,          **Direct Team   • Weekly Team & Core            Strict RBAC enforced
  Committee (LC       `team_structures`,            email, role (`LCP`,          management, EP matching,    assignments, O2O     `opportunities`,                Leader (MM)**   Meetings`<br>`{=html}• Monthly  via `@aiesec.net`
  Rabat) & Member     `governance_meetings`         `LCVP_ICX`, `LCVP_FNL`,      logistics, and 18 Standards coaching logs,       `ep_applications`, `tasks`,     or **LCVP ICX / O2O & Calibration               Google OAuth
  Committee (MC                                     `LCVP_TM`, `MM_EXTERNAL`,    delivery; attend Weekly     attendance records,  `audit_logs`.                   LCP**                                           (`Deliverable 9`).
  Morocco) Members**                                `MM_INTERNAL`, `MEMBER_BD`,  Team/Core Meetings and      and immutable audit                                                                                  
                                                    `MEMBER_CXP`, `ECB_CHAIR`),  Monthly O2Os (`TL2TM`,      trail of all actions                                                                                 
                                                    functional engine, NDA       `LCVP2TL`, Calibration).    performed in the                                                                                     
                                                    signature status                                         ERP.                                                                                                 
                                                    (`APIP 5.7`), active term                                                                                                                                     
                                                    (`26.2`), workload capacity.                                                                                                                                  

  **5. Accommodation  `accommodation_providers`,    Provider type                Provide safe, clean         Inspection logs, bed `accommodation_units` (1:N),    **Logistics /   • Vet & inspect ≥14d before     Internal ICX & FnL
  Providers (Global   `accommodation_units`,        (`HOST_FAMILY`, `HOSTEL`,    accommodation with a single booking calendar,    `accommodation_beds` (1:N),     Accommodation   arrival`<br>`{=html}• Check-in  team read/write.
  Host Families,      `accommodation_beds`,         `APARTMENT`, `DORM`), host   bed per EP, clean water,    check-in/check-out   `ep_applications` (via          Coordinator**   on Arrival Day`<br>`{=html}•    
  Hostels,            `accommodation_allocations`   name, CIN/ID,                bathroom, and electricity   photos, deposit      `accommodation_allocations`).   (MM Internal)   Check-out & Deposit Return on   
  Landlords)**                                      phone/WhatsApp, Rabat/Salé   (`AEPP 1.3.2.7`); sign      tracking, and EP                                                     Departure                       
                                                    neighborhood (e.g., Agdal,   check-in/check-out          satisfaction ratings                                                                                 
                                                    Hassan, Hay Riad, L'Océan,   condition reports.          on Standard #7.                                                                                      
                                                    Médina, Salé Tabriquet),                                                                                                                                      
                                                    transit time to OP, room/bed                                                                                                                                  
                                                    inventory, gender                                                                                                                                             
                                                    restrictions, house rules,                                                                                                                                    
                                                    cost per night/month                                                                                                                                          
                                                    (`MAD`), safety/hygiene                                                                                                                                       
                                                    audit status                                                                                                                                                  
                                                    (`Standard #7`).                                                                                                                                              

  **6. Transport,     `service_providers`,          Provider type                Execute safe EP             Log of scheduled     `pickup_missions` (1:N),        **Logistics     • Confirm pickup ≥3d before     Internal ICX & FnL
  Pickup & Local      `pickup_missions`             (`AIRPORT_SHUTTLE`,          airport/station transfers   pickup missions,     `expenses` (1:N).               Coordinator /   arrival`<br>`{=html}• Live      team read/write.
  Service Providers**                               `TAXI_PARTNER`, `CATERER`,   (`CMN`, `RBA`,              flight delay                                         Pickup Buddy**  tracking on Arrival Day         
                                                    `PRINT_SHOP`,                `Rabat Agdal`), provide IPS tracking, and                                                                                        
                                                    `SIM_PROVIDER`), contact     venue/catering, supply      expense receipts.                                                                                    
                                                    details, agreed rates        local SIM cards.                                                                                                                 
                                                    (`MAD`), pickup buddy                                                                                                                                         
                                                    assignments.                                                                                                                                                  

  **7. External       `external_institutions`,      Institution type             Provide institutional       Institutional        `sponsorship_deals` (1:N),      **LCVP ICX /    • Sponsorship milestone         Restricted to EB
  Institutions,       `sponsorship_deals`           (`MINISTRY`, `EMBASSY`,      patronage, visa             correspondence log,  `partner_agreements` (as        LCVP BD / LCVP  deliverables`<br>`{=html}•      (`LCP`, `LCVP`) and
  Sponsors, Lawyers &                               `CSR_SPONSOR`,               facilitation, legal review  sponsorship          3rd-party funder), `invoices`   FnL / LCP**     Annual External Audit deadline  MM External.
  Auditors**                                        `LEGAL_ADVISOR`,             of contract templates,      deliverables         (1:N).                                                                          
                                                    `EXTERNAL_AUDITOR`), contact annual external financial   tracker, legal                                                                                       
                                                    persons, legal/sponsorship   audit (`AFPM`), or CSR      opinion archive.                                                                                     
                                                    agreements, tax              funding for NGO slots.                                                                                                           
                                                    classification                                                                                                                                                
                                                    (`CGI Art. 57` vs                                                                                                                                             
                                                    `Art. 10-I-B-2°`).                                                                                                                                            

  **8. Entity Control `ecb_icb_contacts`,           Entity (`ECB Morocco`,       Audit EXPA compliance,      Formal case dockets, `quality_cases` (1:N),          **LCP & LCVP    • 24h / 48h / 72h / 5d Case     ECB Auditor role
  Board (ECB Morocco) `quality_cases`               `ECB Partner Entity`,        grant extension/derogation  evidence packages,   `compensation_claims` (1:N).    ICX**           Solving SLAs                    gets read-only
  & ICB Arbitrators**                               `ICB`), Chair/Case Officer   approvals, adjudicate Stage SLA timestamps,                                                                                      compliance & case
                                                    name, official email         2 (`ECB-to-ECB`) and Stage  binding rulings, and                                                                                 vault access.
                                                    (`ecb@...`,                  3 (`ICB OCA/OCCA`) cases,   compensation                                                                                         
                                                    `icb@aiesec.org`),           oversee Harassment          schedules.                                                                                           
                                                    escalation tier.             Prevention Committee                                                                                                             
                                                                                 (`Annex 1`).                                                                                                                     
  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

### 6.2 Multi-Relationship & Deduplication Rules (`[ERP-DESIGN]`)

1.  **Multi-Contact per Organization (`1:N`)**: An `organizations`
    record (e.g., *Fondation Orient-Occident* or *British Council
    Rabat*) supports unlimited `organization_contacts` with distinct
    roles (`DECISION_MAKER`, `PROJECT_SUPERVISOR`, `HR_MANAGER`,
    `FINANCE_BILLING`, `FIELD_MENTOR`) and primary/secondary flags.
2.  **Multi-Opportunity & Multi-Product per Partner (`1:N`)**: A single
    organization can sign multiple `partner_agreements` and open
    opportunities across **iGV**, **iGTa**, and **iGTe** simultaneously.
3.  **One Stakeholder Connected to Multiple Processes**: A corporate
    partner can act simultaneously as an **iGTa Opportunity Provider**
    (hosting an IT intern) AND a **Third-Party CSR Sponsor**
    (`funder_organization_id`) funding 5 **iGV** slots at a local public
    school (`APIP 5.3.2.5`).
4.  **Shared Ownership (`Account Team`)**: Every organization and EP
    application supports a `primary_owner_id` (accountable for SLAs)
    plus a `secondary_owner_id` (e.g., Sales Owner during B2B closing +
    Delivery Owner during CXP realization, or Pickup Buddy during
    arrival).
5.  **Deterministic & Fuzzy Deduplication Engine**:
    -   **Organizations**: Unique constraint on normalized
        `moroccan_ice_number`, `rc_number`, `dahir_receipt_number`, or
        `expa_company_id`; fuzzy trigram match (`≥0.85` similarity) on
        stripped legal name + city prompts user merge modal before
        insert.
    -   **Contacts & EPs**: Unique constraint on `expa_person_id`,
        lowercase `email`, or normalized E.164 `phone_whatsapp`
        (`+212...`). If an EP applies to 3 different Rabat slots
        (`1 EP : N Applications`), all 3 `ep_applications` link to the
        single canonical `ep_profiles.ep_id` so their interview notes
        and visa documents are never duplicated.

------------------------------------------------------------------------

\<a id=\"deliverable-5\"\>\</a\> \## 7. DELIVERABLE 5: ATOMIC
REQUIREMENTS REGISTER (MODULES A--L)

Every requirement below is atomic, testable, assigned a stable ID
(`REQ-ICX-001` to `REQ-ICX-128`), classified by epistemic tier
(`[GLOBAL-POLICY]`, `[LOCAL-RABAT]`, `[ERP-DESIGN]`), and linked to its
authoritative source.

### Module A: CRM and Stakeholder Management (`REQ-ICX-001` to `REQ-ICX-010`)

-   **`REQ-ICX-001`** `[ERP-DESIGN]` (**Unified 360° Stakeholder
    Profile**): The system SHALL store a single canonical record for
    every Organization, Contact, EP, IR Entity, Accommodation Provider,
    and Service Provider, displaying all linked interactions, WhatsApp
    logs, Gmail threads (`threadUrl`), agreements, opportunities,
    applications, tasks, and financial transactions in a single
    chronological feed without switching tabs. *(Source: Prompt Sec. 5 &
    6.A)*
-   **`REQ-ICX-002`** `[LOCAL-RABAT]` (**Moroccan Legal & Tax
    Metadata**): For Moroccan Opportunity Providers and Sponsors, the
    system SHALL capture `legal_form` (`ASSOCIATION_DAHIR_1958`,
    `FOUNDATION`, `PUBLIC_SCHOOL`, `PRIVATE_SCHOOL`, `SARL`, `SA`,
    `AUTO_ENTREPRENEUR`, `PUBLIC_INSTITUTION`), `ice_number` (15
    digits), `rc_number`, `dahir_receipt_status`,
    `public_utility_decree` (`Utilité Publique`), and
    `tax_sponsorship_regime` (`CGI_ART_57_PARRAINAGE`
    vs. `CGI_ART_10_MECENAT`). *(Source: [SRC-019 Morocco Partner
    Analysis](https://docs.google.com/document/d/10B0p6d2MBYWp4bpF13ct4-ABosF4fRCFKu0EglOAbzs/edit?usp=drivesdk))*
-   **`REQ-ICX-003`** `[ERP-DESIGN]` (**Multi-Contact Hierarchy**): The
    system SHALL support `1:N` contacts per organization, allowing each
    contact to be tagged with a functional role (`DECISION_MAKER`,
    `SUPERVISOR`, `HR`, `FINANCE`, `OPERATIONS`), preferred language
    (`FR`, `AR`, `EN`), and communication channel preference
    (`WHATSAPP`, `EMAIL`, `PHONE`). *(Source: Prompt Sec. 5)*
-   **`REQ-ICX-004`** `[ERP-DESIGN]` (**Pre-Insert Deduplication
    Gate**): Before creating any Organization, Contact, EP, or IR
    Partner, the system SHALL run deterministic matching on external IDs
    (`expa_id`, `ice_number`, `email`, `e164_phone`) and fuzzy matching
    on `normalized_name + city`, blocking exact duplicates and offering
    a 1-click Merge Record wizard for fuzzy matches. *(Source: Prompt
    Sec. 5 & 8)*
-   **`REQ-ICX-005`** `[ERP-DESIGN]` (**Dual/Shared Ownership &
    Handover**): The system SHALL allow assigning both a
    `bd_owner_member_id` (External Engine) and a `cxp_owner_member_id`
    (Internal Engine) to an Organization, logging a formal handover
    record when a partner moves from `CONTRACTED` to `OPPORTUNITY_LIVE`.
    *(Source: [SRC-018 Rabat Dual MM
    Engine](https://docs.google.com/presentation/d/1aO702ZjWOpRQ5SdgyyxfCsBt03fj6sSW0WED9e51Lp4/edit?usp=drivesdk))*
-   **`REQ-ICX-006`** `[ERP-DESIGN]` (**Relationship Health Score**):
    The system SHALL auto-calculate a `relationship_health_score`
    (`0–100`) for every active Partner and IR Entity based on
    interaction recency, SLA compliance, candidate acceptance rate,
    standards fulfillment score, and invoice payment timeliness.
    *(Source: [SRC-020 IR PRM
    Tracker](https://docs.google.com/spreadsheets/d/1eo9D1ZJgmRD1FosocImwZ5xNCpvV-ySX37M9lYR2hAo/edit?usp=drivesdk))*
-   **`REQ-ICX-007`** `[GLOBAL-POLICY]` (**Partner Blacklist &
    Suspension Registry**): The system SHALL allow LCVP ICX / LCP / ECB
    to mark an Organization or Host Family as `SUSPENDED` or
    `BLACKLISTED` with mandatory evidence attachments, immediately
    blocking any new opportunity creation, EP matching, or bed
    allocation for that entity. *(Source: `AEPP 4.2.2.1.7` &
    `APIP 5.2`)*
-   **`REQ-ICX-008`** `[LOCAL-RABAT]` (**Data Privacy & CNDP Law 09-08
    Compliance**): The system SHALL classify fields containing passport
    numbers, national IDs (`CIN`), medical/dietary conditions, and
    emergency contacts as `CONFIDENTIAL_PII`, encrypting them at rest,
    masking them in list views, and logging every read/export event in
    `pii_access_logs`. *(Source: Moroccan Law 09-08 & `APIP 5.7`)*
-   **`REQ-ICX-009`** `[ERP-DESIGN]` (**Soft Delete & Historical
    Preservation**): The system SHALL prohibit hard `DELETE` operations
    on any stakeholder, application, opportunity, contract, or financial
    record; deleted/inactive records SHALL be marked
    `is_archived = TRUE` with `archived_at`, `archived_by`, and
    `archive_reason` while preserving all foreign-key history across
    term transitions (`26.1 → 26.2 → 27.1`). *(Source: Prompt Sec. 8)*
-   **`REQ-ICX-010`** `[LOCAL-RABAT]` (**Pre-Loaded Rabat B2B Lead
    Seed**): The system SHALL support bulk import of AIESEC in Rabat's
    researched B2B partner database (*MCISE, AFEM, Tanmia.ma, IMPACT
    2.0, Enactus Morocco, Injaz Al-Maghrib, Réseau Entreprendre Maroc,
    Global Shapers Rabat, ALC Rabat, AMIDEAST, British Council Rabat,
    Rabat Summer Camp, Chantiers Sociaux Marocains, Caritas Rabat,
    Fondation Orient-Occident, TIBU Maroc, SOS Villages d'Enfants, High
    Atlas Foundation, Education for All*). *(Source: [SRC-019
    Prospection Partenaires
    iGV](https://docs.google.com/spreadsheets/d/1kkmiMJXy3pF4_pl063Z6A89qUrLXCFJXe81mQJWfhDM/edit?usp=drivesdk))*

### Module B: Sales and Business Development (`REQ-ICX-011` to `REQ-ICX-020`)

-   **`REQ-ICX-011`** `[LOCAL-RABAT]` (**B2B Sales Pipeline Stages**):
    The system SHALL manage B2B deals across an explicit 9-stage state
    machine: `NEW_LEAD` → `CONTACTED` → `MEETING_SCHEDULED` →
    `DISCOVERY_COMPLETED` → `PROPOSAL_SENT` → `NEGOTIATION` →
    `CONTRACT_SIGNED` → `ONBOARDED_LIVE` (plus terminal states
    `CLOSED_LOST` and `DISQUALIFIED` requiring a mandatory loss reason).
    *(Source: [SRC-018 iGV MM
    Training](https://drive.google.com/file/d/1m9vBmM5yuBr1ecHCNpE84qvNDrLkroaj/view?usp=drivesdk)
    &
    [SRC-019](https://docs.google.com/spreadsheets/d/1kkmiMJXy3pF4_pl063Z6A89qUrLXCFJXe81mQJWfhDM/edit?usp=drivesdk))*
-   **`REQ-ICX-012`** `[LOCAL-RABAT]` (**1-Click Personalized Outreach
    Engine**): The system SHALL generate personalized French, English,
    and Arabic outreach emails and WhatsApp messages using dynamic merge
    tags (`{{org_name}}`, `{{contact_name}}`, `{{sdg_focus}}`,
    `{{sender_name}}`, `{{sender_role}}`), log the exact send timestamp,
    and schedule an automated `T+3 business days` follow-up task.
    *(Source: [SRC-019 Prospection
    Sheet](https://docs.google.com/spreadsheets/d/1kkmiMJXy3pF4_pl063Z6A89qUrLXCFJXe81mQJWfhDM/edit?usp=drivesdk))*
-   **`REQ-ICX-013`** `[LOCAL-RABAT]` (**Structured Discovery
    Questionnaire**): The system SHALL prevent a deal from moving to
    `PROPOSAL_SENT` until a structured Discovery Form is completed
    capturing: (a) Core organizational need, (b) Target product (`iGV`,
    `iGTa`, `iGTe`), (c) Desired headcount & dates, (d) Supervision
    capacity (full-time employee check for iGTa/iGTe), and (e)
    Accommodation/Salary budget capacity. *(Source: [SRC-018 Slide
    4--6](https://drive.google.com/file/d/1m9vBmM5yuBr1ecHCNpE84qvNDrLkroaj/view?usp=drivesdk))*
-   **`REQ-ICX-014`** `[LOCAL-RABAT]` (**Multi-Product Opportunity
    Spawning**): From a single B2B Discovery or Deal record, the user
    SHALL be able to spawn multiple child opportunity drafts across
    different products (e.g., 1 `iGV` project + 2 `iGTa` internships for
    the same partner). *(Source: [SRC-018 Slide 6: "One Partner Can
    Create Multiple
    Opportunities"](https://drive.google.com/file/d/1m9vBmM5yuBr1ecHCNpE84qvNDrLkroaj/view?usp=drivesdk))*
-   **`REQ-ICX-015`** `[LOCAL-RABAT]` (**Tripartite CSR Sponsorship
    Linking**): For NGOs or public schools in Rabat/Salé that have
    strong social impact projects but lack budget for accommodation/fees
    (`APIP 5.3.2.5`), the system SHALL allow linking a third-party
    Corporate Sponsor (`funder_organization_id`) to underwrite
    ≥70%--100% of the iGV project cost under **Moroccan CGI Art. 57**
    (*Parrainage*). *(Source: `APIP 5.3.2.5` &
    [SRC-019](https://docs.google.com/document/d/10B0p6d2MBYWp4bpF13ct4-ABosF4fRCFKu0EglOAbzs/edit?usp=drivesdk))*
-   **`REQ-ICX-016`** `[ERP-DESIGN]` (**Objection & Playbook
    Repository**): The system SHALL embed an interactive B2B Objection
    Handling Playbook inside the Deal screen (addressing common Moroccan
    NGO/company objections: budget constraints, visa delays, language
    barriers, summer scheduling, and tax deductibility). *(Source:
    Prompt Sec. 4 & 6.B)*
-   **`REQ-ICX-017`** `[ERP-DESIGN]` (**Sales Conversion & Velocity
    Analytics**): The system SHALL track stage-to-stage conversion rates
    (`Lead → Contacted → Meeting → Proposal → Contract`), average sales
    cycle days, and pipeline value in `MAD` per BD member and sector.
    *(Source: Prompt Sec. 6.B)*
-   **`REQ-ICX-018`** `[ERP-DESIGN]` (**Stale Deal Escalation**): If an
    active B2B deal has zero logged interactions for `>7 days`, the
    system SHALL flag the deal `AT_RISK` and notify the MM External
    Engine. *(Source: Prompt Sec. 7 & 8)*
-   **`REQ-ICX-019`** `[GLOBAL-POLICY]` (**POP Lead Sync**): The system
    SHALL support logging and tracking inbound partner registrations
    originating from the AIESEC **Partners Opportunity Portal (POP)**
    (`APIP 5.7.1.2`). *(Source: [SRC-006 APIP
    5.7.1.2](https://drive.google.com/file/d/1zwQSiWbrSLHPUcCdqkk1KVmK-IBkzOyz/view?usp=drivesdk))*
-   **`REQ-ICX-020`** `[LOCAL-RABAT]` (**Partner Retention & Renewal
    Pipeline**): At `T - 30 days` before a partner's contract expiry or
    `T + 7 days` after their last EP finishes, the system SHALL
    automatically open a `RENEWAL_UPSELL` deal card assigned to MM
    External. *(Source: Prompt Sec. 4 & 6.F)*

### Module C: Opportunity Management (`REQ-ICX-021` to `REQ-ICX-035`)

-   **`REQ-ICX-021`** `[GLOBAL-POLICY]` (**iGV Portfolio & SDG
    Enforcement**): When creating an `iGV` opportunity, the system SHALL
    require selecting a project from the official **Global Volunteer
    Portfolio** (`Heartbeat [3.4]`, `Global Classroom [4.1/4.2/4.6]`,
    `Youth 4 Impact [4.7]`, `Raise Your Voice [5.1/5.5]`,
    `Clean Water [6.b]`, `Skill Up! [8.3/8.6]`, `On The Map [8.9]`,
    `Equify [10.2]`, `Safe Cities [11.b]`,
    `Responsible Consumption [12.3/12.5/12.8]`, `Green Leaders [13.3]`,
    `Aquatica [14.1/14.2]`, `Rooted [15.5]`, `Peace [16.1]`,
    `Scale Up! [17.17]`), auto-populating the official SDG target,
    standardized JD activities, and Measurement of Impact (`MoO`)
    indicators. *(Source: `APIP 5.3.2.1` & [SRC-015 GV
    Portfolio](https://docs.google.com/spreadsheets/d/1TIooseQqGzmkcg36xQges29KxmJUdEa_nHIBbpywxBQ/edit?usp=drivesdk))*
-   **`REQ-ICX-022`** `[GLOBAL-POLICY]` (**iGV Duration & Working Hours
    Validation**): The system SHALL enforce that every `iGV` opportunity
    slot has a duration between **6 and 8 weeks** (`42 to 56 days`) and
    working hours between **25 and 40 hours/week**, and that the Hosting
    Entity is NOT an AIESEC entity. *(Source: `AEPP 3.2.1.b–d` &
    `APIP 5.3.2`)*
-   **`REQ-ICX-023`** `[GLOBAL-POLICY]` (**iGTa Duration, Fields,
    Supervision & Remuneration Validation**): For `iGTa` opportunities,
    the system SHALL enforce: (a) duration between **6 and 78
    weeks**, (b) working hours between **35 and 45 hours/week**, (c)
    field restricted to Business Administration, Business Development,
    Marketing, Finance, IT, or Engineering, (d) full-time OP employee
    assigned as supervisor, (e) for 6--8 weeks: either accommodation
    provided OR salary ≥ living cost floor; for \>8 weeks: mandatory
    salary ≥ living cost floor, and (f) `ep_project_fee = 0`. *(Source:
    `AEPP 3.2.2` & `APIP 5.2.3.1`)*
-   **`REQ-ICX-024`** `[GLOBAL-POLICY]` (**iGTe Duration, Supervision &
    Mandatory Salary Validation**): For `iGTe` opportunities, the system
    SHALL enforce: (a) duration between **9 and 78 weeks**, (b) working
    hours between **35 and 45 hours/week**, (c) teaching
    subject/language specification, (d) full-time OP employee
    supervisor, (e) mandatory salary ≥ living cost floor for the full
    duration, and (f) `ep_project_fee = 0`. *(Source: `AEPP 3.2.3` &
    `APIP 5.2.3.1`)*
-   **`REQ-ICX-025`** `[GLOBAL-POLICY]` (**Partly Remote & Fully Remote
    Validation**): For `PARTLY_REMOTE` opportunities (`iGTa`/`iGTe`),
    the system SHALL enforce total duration **≥13 weeks (3 months)**,
    remote duration **≤50%** of total duration, mandatory salary during
    physical realization, and an uploaded ICB Audit Approval proof
    (`aies.ec/partlyremote-auditform`) before publishing. For
    `FULLY_REMOTE` opportunities, the system SHALL enforce duration **6
    to 26 weeks** and mandatory salary if \>8 weeks. *(Source:
    `AEPP Sections 6 & 7` & `APIP 5.2.3.1.8`)*
-   **`REQ-ICX-026`** `[GLOBAL-POLICY]` (**1-Year Advance Opening
    Limit**): The system SHALL block setting an opportunity slot start
    date more than **365 days (1 year)** in the future from the creation
    date. *(Source: `APIP 5.3.4.1`)*
-   **`REQ-ICX-027`** `[GLOBAL-POLICY]` (**7-Day Account Manager
    Assignment Rule**): Every opened opportunity SHALL have an assigned
    internal `account_manager_member_id` on EXPA and in the ERP within
    **7 days (1 week)** of creation (`APIP 5.2.2.2.6`, `5.2.4.3.1.7`).
    *(Source: [SRC-006
    APIP](https://drive.google.com/file/d/1zwQSiWbrSLHPUcCdqkk1KVmK-IBkzOyz/view?usp=drivesdk))*
-   **`REQ-ICX-028`** `[ERP-DESIGN]` (**Slot Capacity & Booking
    Ledger**): Each Opportunity SHALL support multiple date-specific
    `opportunity_slots` tracking `total_openings`, `applied_count`,
    `shortlisted_count`, `accepted_count`, `approved_count`,
    `realized_count`, and
    `available_openings = total_openings - approved_count`,
    automatically closing the slot when `available_openings == 0`.
    *(Source: [SRC-016 EXPA GraphQL
    Schema](https://gis-api.aiesec.org/swagger) & [SRC-020 Slots
    Registry](https://docs.google.com/spreadsheets/d/1s8F0lUWhvwLUMpipgv3guxwivTcK_uYbpJ6Hm7_fDJY/edit?usp=drivesdk))*
-   **`REQ-ICX-029`** `[GLOBAL-POLICY]` (**Immutable Post-Approval
    Benefit & Fee Lock**): Once at least one EP is `ACCEPTED` or
    `APPROVED` on an opportunity slot, the system SHALL lock the slot's
    JD, working hours, salary, accommodation coverage, and EP fee fields
    from downward modification unless a signed mutual variation addendum
    from both the EP and OP is uploaded (`AEPP 4.2.1.4`, `4.4.4.4`).
    *(Source: [SRC-005
    AEPP](https://drive.google.com/file/d/125w_-TIK97RHsHrWvH3jziq8UxPy5w8N/view?usp=drivesdk))*
-   **`REQ-ICX-030`** `[GLOBAL-POLICY]` (**Anti-Fake Opportunity
    Guardrail**): The system SHALL require a valid signed
    `partner_agreement_id` and verified OP contact before allowing an
    opportunity to be marked `PUBLISHED_LIVE`, preventing the creation
    of `Fake Opportunities` (`APIP 5.7` & `Annex 3`). *(Source: [SRC-009
    Annex
    3](https://drive.google.com/file/d/1h5sOL0k2mhJj6VsTPqdJQ0ygxoalfLta/view?usp=drivesdk))*

### Module D: EP Management (`REQ-ICX-031` to `REQ-ICX-048`)

-   **`REQ-ICX-031`** `[GLOBAL-POLICY]` (**Complete EP Lifecycle State
    Machine**): The system SHALL track every EP application across all
    official EXPA statuses (`OPEN`, `APPLIED`, `ACCEPTED_BY_HOST`,
    `ACCEPTED`, `APPROVED`, `REMOTE_REALIZED`, `REALIZED`, `FINISHED`,
    `COMPLETED`) and internal operational sub-statuses
    (`SCREENING_SCHEDULED`, `SHORTLISTED_FOR_OP`, `VISA_IN_PROGRESS`,
    `PRE_ARRIVAL_CONFIRMED`) plus exception states (`REJECTED`,
    `WITHDRAWN`, `APPROVAL_BROKEN`, `REALIZATION_BROKEN`,
    `REMOTE_BROKEN`, `FINISHED_EARLIER`). *(Source: [SRC-009 Annex 3
    Glossary](https://drive.google.com/file/d/1h5sOL0k2mhJj6VsTPqdJQ0ygxoalfLta/view?usp=drivesdk))*
-   **`REQ-ICX-032`** `[LOCAL-RABAT]` (**Algorithmic EP-to-Opportunity
    Matchmaker**): The system SHALL include a Matchmaker Engine that
    ranks candidate EPs against open Rabat slots using a weighted score
    (`0–100%`) combining SDG/Field alignment, required language
    proficiency (`EN`, `FR`, `AR`), slot date overlap, and visa
    lead-time feasibility
    (`days_until_slot_start >= required_visa_processing_days`).
    *(Source: [SRC-020 Matchmaker
    Interface](https://docs.google.com/spreadsheets/d/1coZWrwtD9zZlrZV0r78RgFwnnq7wnE8gepifOl8x-o0/edit?usp=drivesdk))*
-   **`REQ-ICX-033`** `[GLOBAL-POLICY]` (**Mandatory Rejection
    Feedback**): When an EP application is moved to `REJECTED` by the
    Host LC or OP, the system SHALL require entering structured written
    feedback explaining the unmet selection criterion so the EP receives
    actionable feedback (`AEPP 4.2.3.5`). *(Source: [SRC-005 AEPP
    4.2.3.5](https://drive.google.com/file/d/125w_-TIK97RHsHrWvH3jziq8UxPy5w8N/view?usp=drivesdk))*
-   **`REQ-ICX-034`** `[GLOBAL-POLICY]` (**OP 3-Rejection Rule
    Enforcement**): If an OP rejects more than **3 shortlisted
    candidates** who fulfill 100% of the opportunity requirements posted
    on EXPA without valid justification, the system SHALL flag the
    opportunity for suspension/termination under `AEPP 4.2.2.1.7`.
    *(Source: [SRC-005 AEPP
    4.2.2.1.7](https://drive.google.com/file/d/125w_-TIK97RHsHrWvH3jziq8UxPy5w8N/view?usp=drivesdk))*
-   **`REQ-ICX-035`** `[GLOBAL-POLICY]` (**14-Day Post-APD Visa &
    Expectation Pack Delivery**): Upon transition to `APPROVED` (`APD`),
    the system SHALL start a hard **14-calendar-day countdown timer**
    requiring the upload and delivery of: (a) Official Visa Invitation
    Letter & OP Registration docs (`AEPP 4.4.3.1`), (b) Local
    registration procedure rules (`AEPP 4.4.4.2`), and (c) Written
    Expectation Setting guide (`Standard #4`, `AEPP 1.3.2.4`). *(Source:
    [SRC-005 AEPP
    4.4.3--4.4.4](https://drive.google.com/file/d/125w_-TIK97RHsHrWvH3jziq8UxPy5w8N/view?usp=drivesdk))*
-   **`REQ-ICX-036`** `[GLOBAL-POLICY]` (**EP 7-Day / 14-Day Visa
    Application Compliance Tracker**): Once HE delivers the visa
    documents (`visa_docs_sent_at`), the system SHALL track whether the
    EP updates their visa status within **7 days** and submits their
    visa application within **14 days** (`AEPP 4.4.2.1`). If the EP
    delays beyond 14 days, the system SHALL log an
    `EP_VISA_DELAY_EVIDENCE` record protectingLC Rabat from financial
    liability if the visa is later delayed or rejected (`AEPP 4.4.1.b` &
    `Annex 2`). *(Source: [SRC-005 AEPP
    4.4.2.1](https://drive.google.com/file/d/125w_-TIK97RHsHrWvH3jziq8UxPy5w8N/view?usp=drivesdk))*
-   **`REQ-ICX-037`** `[GLOBAL-POLICY]` (**iGV 20-Day Realization Window
    Validation**): For `iGV` applications, the system SHALL verify that
    `actual_realized_date` is within **±20 calendar days** of the EXPA
    opportunity slot start date (`APIP 5.3.5.1`). Any realization
    outside ±20 days SHALL be blocked unless a written variation is
    logged. *(Source: [SRC-006 APIP
    5.3.5.1](https://drive.google.com/file/d/1zwQSiWbrSLHPUcCdqkk1KVmK-IBkzOyz/view?usp=drivesdk))*
-   **`REQ-ICX-038`** `[GLOBAL-POLICY]` (**Internship Extension
    Workflow**): For `iGTa` and `iGTe` EPs requesting an extension
    (`AEPP 4.5.2.3`, `4.5.3.6`, `4.5.4.8`), the system SHALL verify
    that: (a) written notification from both EP and OP is logged at
    least **2 weeks before original end date** (or 4 weeks if visa
    renewal is required), (b) total cumulative duration does not exceed
    **78 weeks**, and (c) ECB approval is uploaded before extending the
    `expected_finish_date`. *(Source: [SRC-005 AEPP
    4.5](https://drive.google.com/file/d/125w_-TIK97RHsHrWvH3jziq8UxPy5w8N/view?usp=drivesdk))*

### Module E: International Relations (IR) Management (`REQ-ICX-049` to `REQ-ICX-055`)

-   **`REQ-ICX-049`** `[LOCAL-RABAT]` (**IR Partner Tiering & Visa
    Compatibility Matrix**): The system SHALL maintain an IR Directory
    classifying partner entities into `TIER_1_STRATEGIC`,
    `TIER_2_GROWTH`, `TIER_3_TACTICAL`, and `PROBATION`, annotated with
    their Moroccan Visa Regime (`VISA_FREE_90D`, `AEVM_EVISA`,
    `EMBASSY_VISA`) and minimum recommended approval lead time.
    *(Source: [SRC-020 IR Partners
    PRM](https://docs.google.com/spreadsheets/d/1eo9D1ZJgmRD1FosocImwZ5xNCpvV-ySX37M9lYR2hAo/edit?usp=drivesdk))*
-   **`REQ-ICX-050`** `[ERP-DESIGN]` (**IR Quota & Funnel Commitment
    Tracker**): For each IR partnership and peak season, the system
    SHALL track committed vs. actual `APP`, `ACC`, `APD`, `RE`, and `CO`
    numbers alongside Sending Entity Standards compliance (#1 Goal
    Setting, #2 OPS, #3 Insurance, #18 Debrief). *(Source: Prompt Sec.
    6.E)*
-   **`REQ-ICX-051`** `[ERP-DESIGN]` (**IR Search Tool & Opportunity
    Pack Generator**): The system SHALL auto-generate a shareable
    **Rabat IR Search Tool / Opportunity Pack link** displaying live
    open slots, SDG targets, accommodation photos, and Rabat
    cost-of-living guides for counterpart oGX VPs. *(Source: [SRC-018
    Slide
    6](https://docs.google.com/presentation/d/1te4shu8Fimeo2rs6wCOj23MtMZJ0VL1cwN1ur5hRa_k/edit?usp=drivesdk))*

### Module F: Partner Relationship Management (`REQ-ICX-056` to `REQ-ICX-060`)

-   **`REQ-ICX-056`** `[LOCAL-RABAT]` (**14-Day Pre-Arrival Partner &
    Accommodation Lock**): At `T - 14 days` before any approved EP's
    arrival date, the system SHALL require the Account Manager to log a
    verified **Partner & Accommodation Readiness Confirmation**
    (confirming supervisor availability, Day-1 schedule, and bed
    assignment). Unconfirmed slots at `T - 13 days` SHALL trigger an
    immediate Red Alert to LCVP ICX and LCP. *(Source: [SRC-018 iGV MM
    Summit: "Opportunity and accommodation must be confirmed by the
    provider at least two weeks
    out"](https://drive.google.com/file/d/1bbg6uqktj7h-__X63T7XwEg0ssfgwgBH/view?usp=drivesdk))*
-   **`REQ-ICX-057`** `[GLOBAL-POLICY]` (**Global Host Family & Hostel
    Bed Inventory**): The system SHALL track every accommodation unit
    and bed in Rabat/Salé, enforcing `AEPP 1.3.2.7` (**Standard #7
    Accommodation**): mandatory single bed per EP (unless
    married/couple), access to clean water, bathroom, and electricity,
    zero overcrowding, and documented security deposit terms
    (`AEPP 4.2.1.4`). *(Source: [SRC-005 AEPP
    1.3.2.7](https://drive.google.com/file/d/125w_-TIK97RHsHrWvH3jziq8UxPy5w8N/view?usp=drivesdk))*

### Module G: Exchange Delivery, 18 Standards & Quality Case Management (`REQ-ICX-061` to `REQ-ICX-085`)

-   **`REQ-ICX-061`** `[GLOBAL-POLICY]` (**The 2024 Refreshed 18
    Exchange Standards Engine**): The system SHALL track all **18
    official Exchange Standards** for every EP, recording the
    responsible entity (`SE`, `HE`, or `BOTH`), mandatory status
    (`MANDATORY` \[13\] vs. `NON_MANDATORY` \[5\]), survey phase
    (`MIDDLE_SURVEY` vs. `FINAL_SURVEY`), internal delivery status,
    timestamp, and verifiable evidence link:
    1.  **#1 Personal Goal Setting** (`SE` · **Mandatory** · Middle
        Survey)
    2.  **#2 Outgoing Preparation Seminar (OPS)** (`SE` · **Mandatory**
        · Middle Survey)
    3.  **#3 Insurance** (`SE` · **Non-Mandatory** in 2024 Survey ·
        Middle Survey; still tracked as a pre-arrival legal check per
        `AEPP 1.3.2.3`)
    4.  **#4 Expectation Setting** (`HE` · **Mandatory** · Middle Survey
        --- delivered within 14d of `APD`)
    5.  **#5 Visa & Work Permit** (`HE` · **Mandatory** · Middle Survey
        --- Invitation docs delivered within 14d of `APD`)
    6.  **#6 Arrival Support** (`HE` · **Mandatory** · Middle Survey ---
        Written instructions ≥3d before arrival + pickup)
    7.  **#7 Accommodation** (`HE` · **Mandatory** · Middle Survey ---
        Single bed, water, bathroom, electricity match EXPA)
    8.  **#8 Incoming Preparation Seminar (IPS)** (`HE` · **Mandatory**
        · Middle Survey --- Delivered upon arrival)
    9.  **#9 First Day of Work** (`HE` · **Mandatory** \[Upgraded in
        2024!\] · Middle Survey --- HE accompanies EP on Day 1)
    10. **#10 Alignment Spaces with OP** (`HE` · **Mandatory** · Split
        across Middle Survey \[#10a Initial Alignment in Week 1\] and
        Final Survey \[#10b Closing Debrief in Final Week\])
    11. **#11 Job Description** (`HE` · **Mandatory** · Final Survey ---
        Actual tasks match EXPA JD)
    12. **#12 Working Hours** (`HE` · **Non-Mandatory** · Final Survey
        --- 25--40h/wk GV; 35--45h/wk GTa/GTe)
    13. **#13 Duration** (`HE` · **Mandatory** · Final Survey --- 6--8
        wks GV; 6--78 wks GTa; 9--78 wks GTe)
    14. **#14 Opportunity Benefits** (`HE` · **Mandatory** · Final
        Survey --- All financial/non-financial benefits on EXPA
        delivered)
    15. **#15 Value-Driven Leadership Education (LEAD)** (`HE` ·
        **Non-Mandatory** \[Added in 2024!\] · Final Survey ---
        Leadership sessions delivered)
    16. **#16 Departure Support** (`HE` · **Non-Mandatory** · Final
        Survey --- Written departure info ≥2 weeks before end)
    17. **#17 Review Checkpoints (Regular Touchpoints)** (`SE & HE` ·
        **Non-Mandatory** \[Added in 2024!\] · Final Survey ---
        Bi-weekly for GV, monthly for GTa/GTe)
    18. **#18 Debrief with AIESEC** (`SE` · **Mandatory** · Final Survey
        --- Reintegration debrief within 2 weeks of finish). *(Source:
        [SRC-013 Exchange Standards Refreshment
        2024](https://docs.google.com/presentation/d/1OKtCK6XHvwKNzKKIUQEdSkGEKhqbspEjQeboA30zq6I/edit?usp=drivesdk)
        & `AEPP 1.3.2`)*
-   **`REQ-ICX-062`** `[GLOBAL-POLICY]` (**Automated Complete (`CO`)
    Qualification Calculator**): The system SHALL evaluate an EP as
    qualified for `COMPLETED` (`CO`) status if and only if: (a) Status
    is `FINISHED`, (b) all **13 Mandatory Standards** are fulfilled
    (`100%`), AND (c) at least **3 of the 5 Non-Mandatory Standards**
    (#3, #12, #15, #16, #17) are fulfilled (total ≥16/18 Standards). For
    Fully Remote internships, the system SHALL apply the 10-Standard
    remote matrix (`AEPP Section 7`). *(Source: [SRC-013 Slide 7 &
    19](https://docs.google.com/presentation/d/1OKtCK6XHvwKNzKKIUQEdSkGEKhqbspEjQeboA30zq6I/edit?usp=drivesdk)
    & `APIP 2.6.3`)*
-   **`REQ-ICX-063`** `[GLOBAL-POLICY]` (**2-Working-Day Unreachable EP
    Safety Protocol**): If an active `REALIZED` EP is marked unreachable
    for **\>2 working days (48 hours)** without prior notification, the
    system SHALL trigger a `CRITICAL_SAFETY_ESCALATION` workflow
    requiring the LCVP ICX and LCP to contact the OP, Host
    Family/Hostel, and Sending Entity immediately (`AEPP 4.5.4.11`), and
    if a crisis is confirmed, submit the AI/ICB crisis report within
    **24 hours** (`APIP 5.6.1.12`). *(Source: [SRC-005 AEPP
    4.5.4.11](https://drive.google.com/file/d/125w_-TIK97RHsHrWvH3jziq8UxPy5w8N/view?usp=drivesdk)
    & [SRC-006 APIP
    5.6.1.12](https://drive.google.com/file/d/1zwQSiWbrSLHPUcCdqkk1KVmK-IBkzOyz/view?usp=drivesdk))*
-   **`REQ-ICX-064`** `[GLOBAL-POLICY]` (**3-Stage Case Solving & Annex
    2 Compensation Engine**): The system SHALL provide a dedicated
    Quality Case & Arbitration workspace enforcing the exact SLA clocks
    of **Stage 1 (LC-to-LC: 24h/48h/72h)**, **Stage 2 (ECB-to-ECB:
    48h/48h/96h/7d)**, **Stage 3 (ICB OCA/OCCA: 48h/5d or 3d/5d)**,
    **Urgency Protocol (48--72h)**, and **Harassment Prevention
    Committee (24h start / 7 working days report)**, and automatically
    computing financial liabilities per **Annex 2** (including the 2%
    daily fine for salary delayed \>30 days and the 70% internship
    completion threshold for unlawful dismissal). *(Source: `APIP 6.9`,
    [SRC-007 Annex
    1](https://drive.google.com/file/d/1gMi44u0aCeDXuKdxWtr0zkt-A3J28VP6/view?usp=drivesdk),
    [SRC-008 Annex
    2](https://drive.google.com/file/d/1utNAwjhDPAMUwsuLvErSkTaOyF2yi1nZ/view?usp=drivesdk),
    [SRC-010 Annex
    9](https://drive.google.com/file/d/1LViXJDF_wX47gFufbp-d4p4bjveLIQtU/view?usp=drivesdk))*

### Module H: Contracts and Document Management (`REQ-ICX-086` to `REQ-ICX-092`)

-   **`REQ-ICX-086`** `[GLOBAL-POLICY]` (**Template & Document
    Completeness Engine**): The system SHALL generate and track
    versioned PDF documents for: (1) B2B Partner MoU/Contract
    (French/English, valid ≥1 year), (2) Tripartite CSR Sponsorship
    Contract (`CGI Art. 57`), (3) EP Acceptance Note (`AN`), (4)
    Official Moroccan Visa Invitation Letter & *Attestation
    d'hébergement*, (5) Global Host Family Agreement, (6) Accommodation
    Check-in/Check-out Report, and (7) `Annex 9` Case Appeal Template,
    blocking downstream workflow transitions if required signatures or
    expiry dates are invalid. *(Source: `APIP 5.2.4.3.1`,
    `AEPP 4.2.1.4`, `Annex 9`)*

### Module I: Finance, Accounting and AFPM Compliance (`REQ-ICX-093` to `REQ-ICX-105`)

-   **`REQ-ICX-093`** `[GLOBAL-POLICY]` (**AFPM Chart of Accounts &
    Product Profit Centers**): The system SHALL categorize all financial
    transactions under the official **AFPM Chart of Accounts** ([SRC-012
    AFPM Section
    1](https://drive.google.com/file/d/1bsZfRTVLj1lpXEho_Trb8Ey1dGvSTQhs/view?usp=drivesdk)):
    Direct Exchange Revenues (`iGV`, `iGTa`, `iGTe` Partner Fees,
    Project/Accommodation Fees, CSR Sponsorships) vs. Direct Exchange
    Costs (EP Accommodation, Airport Pickup, IPS, Visa/Legalization,
    Partner Marketing, Entity Affiliation Fees, Case Compensation
    Reserves).
-   **`REQ-ICX-094`** `[GLOBAL-POLICY]` (**iGV 70%--100% Funding Rule &
    Zero GT EP Fee Rule**): For `iGV` projects, the system SHALL
    validate that at least **70% to 100%** of total project costs are
    covered by the Partner NGO or Third-Party Funder (`APIP 5.3.2.5`).
    For `iGTa` and `iGTe`, the system SHALL block generating any invoice
    or fee charge to an EP for project or accommodation costs
    (`APIP 5.2.3.1.4`).
-   **`REQ-ICX-095`** `[GLOBAL-POLICY]` (**AFPM Sustainability Ratios &
    14-Day AR Chasing**): The system SHALL continuously calculate the
    **Direct Exchange Sustainability Ratio**
    (`Direct Exchange Revenue / Direct Exchange Costs > 1.0`), flag any
    invoice overdue by **\>14 days (2 weeks)** (`AFPM Section 6`), and
    enforce dual approval (`LCVP ICX` + `LCVP FnL`/`LCP`) on all
    disbursements and refunds (`AFPM Section 5`). *(Source: [SRC-012
    AFPM](https://drive.google.com/file/d/1bsZfRTVLj1lpXEho_Trb8Ey1dGvSTQhs/view?usp=drivesdk))*

### Module J: Task, Calendar, Governance & Communication Management (`REQ-ICX-106` to `REQ-ICX-112`)

-   **`REQ-ICX-106`** `[LOCAL-RABAT]` (**Rabat Operational Rhythm &
    Governance Tracker**): The system SHALL schedule, track attendance,
    and log action items for AIESEC in Rabat's mandatory leadership
    cadence: (1) **Weekly Team Meeting** (`MM → Team`), (2) **Weekly
    Core Meeting** (`MM → LC Board`), (3) **Bi-Monthly Department
    Meeting** (`LCVP → Department`), (4) **Monthly LCM**
    (`EB → LC`), (5) **Monthly O2O (`TL2TM` & `LCVP2TL`)**, and (6)
    **Monthly LCP Calibration**. *(Source: [SRC-018 Slide
    8--10](https://docs.google.com/presentation/d/1te4shu8Fimeo2rs6wCOj23MtMZJ0VL1cwN1ur5hRa_k/edit?usp=drivesdk))*
-   **`REQ-ICX-107`** `[ERP-DESIGN]` (**Google Calendar, Gmail &
    WhatsApp Deep-Link Integration**): Every task, interview, pickup
    mission, and checkpoint SHALL sync with Google Calendar
    (`@aiesec.net`) and provide 1-click WhatsApp (`https://wa.me/...`)
    and Gmail compose triggers that automatically log a
    `communication_logs` entry upon execution.

### Module K: Analytics and Dashboards (`REQ-ICX-113` to `REQ-ICX-120`)

-   **`REQ-ICX-113`** `[ERP-DESIGN]` (**Multi-Role Live Dashboards**):
    The system SHALL provide real-time dashboards for: (1) **Executive
    LCP/LCVP Command Center** (`OPEN → APP → ACC → APD → RE → FIN → CO`
    funnel, conversion rates, Average Approval Days, Lost EPs root
    causes), (2) **External Engine (BD & PRM)** (Sales funnel, revenue
    in `MAD`, partner health), (3) **Internal Engine (IR & Matching)**
    (Slot fill rate, IR responsiveness, visa pipeline), (4) **CXP & 18
    Standards Compliance Matrix** (per-standard fulfillment %, Middle
    vs. Final Survey completion, active SLA breaches), and (5) **FnL
    Sustainability Dashboard** (AFPM ratios, AR aging, case
    liabilities). *(Source: [SRC-018 S1 Closing
    Report](https://docs.google.com/presentation/d/1_BZFmxtlFvIdiWXOEcEvIczSWxaGym-U6lKFwciJ9Zo/edit?usp=drivesdk))*

### Module L: Administration, Compliance & Knowledge Base (`REQ-ICX-121` to `REQ-ICX-128`)

-   **`REQ-ICX-121`** `[GLOBAL-POLICY]` (**APIP 5.7 Digital Ecosystem &
    Anti-Fake Status Enforcement**): The system SHALL enforce
    authentication exclusively via personal `@aiesec.net` accounts,
    require digital signature of the AIESEC Non-Disclosure Agreement
    (`NDA`) on first login (`APIP 5.7.2.4`), maintain an immutable
    append-only `audit_logs` table for every create/update/status
    transition, and block any attempt to record `Fake Approvals`,
    `Fake Realizations`, `Fake Finishes`, `Fake Completions`, or
    `Fake Opportunities` (`APIP 5.7.2.7` & `Annex 3`). *(Source:
    [SRC-006 APIP
    5.7](https://drive.google.com/file/d/1zwQSiWbrSLHPUcCdqkk1KVmK-IBkzOyz/view?usp=drivesdk))*

------------------------------------------------------------------------

\<a id=\"deliverable-6\"\>\</a\> \## 8. DELIVERABLE 6: NORMALIZED
RELATIONAL DATA DICTIONARY & SYSTEM INTEGRITY MODEL

### 8.1 Entity-Relationship Architecture Overview (32 Normalized Tables)

The data model is designed in **Third Normal Form (3NF)** for PostgreSQL
/ Supabase, with a 1:1 deterministic tab mapping for the Tier-1 Google
Sheets + Apps Script V8 deployment. Every table includes standard audit
columns (`created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`,
`updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`,
`created_by UUID REFERENCES internal_users(user_id)`,
`is_archived BOOLEAN NOT NULL DEFAULT FALSE`).

    [local_committees] 1───N [internal_users] 1───N [governance_meetings / o2o_logs]
            │
            ├──1:N──► [organizations] 1───N [organization_contacts]
            │                 │
            │                 ├──1:N──► [b2b_deals]
            │                 ├──1:N──► [partner_agreements] 1───N [invoices] 1───N [financial_transactions]
            │                 └──1:N──► [opportunities] ( FK: gv_portfolio_project_id )
            │                                  │
            │                                  └──1:N──► [opportunity_slots]
            │                                                    │
    [ir_entities] 1───N [ir_contacts]                            ├──1:N──► [ir_slot_allocations]
          │                                                      │
          └──1:N──► [ep_profiles] 1───N [ep_applications] ◄──────┘
                          │                    │
                          │                    ├──1:1──► [ep_visa_records]
                          │                    ├──1:N──► [accommodation_allocations] ──► [accommodation_beds] ──► [accommodation_units] ──► [accommodation_providers]
                          │                    ├──1:N──► [pickup_missions] ──► [service_providers]
                          │                    ├──1:18─► [ep_standards_evidence] (FK: standard_code 1..18)
                          │                    ├──1:N──► [ep_touchpoints] (Standard #17 & Safety Heartbeat)
                          │                    ├──1:N──► [quality_cases] 1───N [compensation_claims]
                          │                    └──1:N──► [status_history_logs]
                          │
                          └──1:N──► [communication_logs] & [tasks] & [document_vault]

### 8.2 Complete Data Dictionary (Core Entities, Attributes, PK/FK, Constraints & Sensitivity)

#### Domain 1: Core Governance, Users & Reference Catalogues

  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Table Name                         Primary Key         Key Columns & Data Types    Foreign Keys &              Validation Constraints & Business Rules                                                                              Sensitivity
                                                                                     Cardinalities                                                                                                                                    (Law 09-08)
  ---------------------------------- ------------------- --------------------------- --------------------------- -------------------------------------------------------------------------------------------------------------------- -------------
  **`local_committees`**             `lc_id` (`UUID`)    `expa_office_id`            `1:N` → `internal_users`,   `expa_office_id > 0`                                                                                                 `PUBLIC`
                                                         (`INT UNIQUE`), `lc_name`   `organizations`,                                                                                                                                 
                                                         (`VARCHAR(100)` e.g.,       `opportunities`                                                                                                                                  
                                                         `'AIESEC in Rabat'`),                                                                                                                                                        
                                                         `mc_name` (`VARCHAR(100)`                                                                                                                                                    
                                                         `'AIESEC in Morocco'`),                                                                                                                                                      
                                                         `expa_mc_id` (`INT`),                                                                                                                                                        
                                                         `city` (`VARCHAR(60)`),                                                                                                                                                      
                                                         `currency_code` (`CHAR(3)`                                                                                                                                                   
                                                         `'MAD'`), `timezone`                                                                                                                                                         
                                                         (`VARCHAR(50)`                                                                                                                                                               
                                                         `'Africa/Casablanca'`),                                                                                                                                                      
                                                         `reserve_months_target`                                                                                                                                                      
                                                         (`NUMERIC(4,2)`                                                                                                                                                              
                                                         `DEFAULT 6.0`)                                                                                                                                                               

  **`internal_users`**               `user_id` (`UUID`)  `lc_id` (`UUID`),           `lc_id` →                   `aiesec_email LIKE '%@aiesec.net'` (`APIP 5.7`); `nda_signed_at IS NOT NULL` required before granting read/write     `INTERNAL`
                                                         `expa_person_id`            `local_committees(lc_id)`   access                                                                                                               
                                                         (`INT UNIQUE`), `full_name` (`N:1`);                                                                                                                                         
                                                         (`VARCHAR(120)`),           `reports_to_user_id` →                                                                                                                           
                                                         `aiesec_email`              `internal_users(user_id)`                                                                                                                        
                                                         (`VARCHAR(150) UNIQUE`),    (`N:1`)                                                                                                                                          
                                                         `phone_whatsapp`                                                                                                                                                             
                                                         (`VARCHAR(30)`),                                                                                                                                                             
                                                         `role_code` (`ENUM`:                                                                                                                                                         
                                                         `'LCP'`, `'LCVP_ICX'`,                                                                                                                                                       
                                                         `'LCVP_FNL'`, `'LCVP_TM'`,                                                                                                                                                   
                                                         `'MM_EXTERNAL'`,                                                                                                                                                             
                                                         `'MM_INTERNAL'`,                                                                                                                                                             
                                                         `'MEMBER_BD'`,                                                                                                                                                               
                                                         `'MEMBER_CXP'`,                                                                                                                                                              
                                                         `'ECB_AUDITOR'`,                                                                                                                                                             
                                                         `'ADMIN'`), `engine_type`                                                                                                                                                    
                                                         (`ENUM`: `'EXTERNAL_BD'`,                                                                                                                                                    
                                                         `'INTERNAL_OPS'`,                                                                                                                                                            
                                                         `'EB_BOARD'`,                                                                                                                                                                
                                                         `'GOVERNANCE'`),                                                                                                                                                             
                                                         `term_code` (`VARCHAR(10)`                                                                                                                                                   
                                                         `'26.2'`), `nda_signed_at`                                                                                                                                                   
                                                         (`TIMESTAMPTZ`),                                                                                                                                                             
                                                         `nda_doc_url` (`TEXT`),                                                                                                                                                      
                                                         `is_active` (`BOOLEAN`)                                                                                                                                                      

  **`gv_portfolio_templates`**       `gv_project_id`     `project_name`              `1:N` → `opportunities`     `min_weeks = 6 AND max_weeks = 8` (`AEPP 3.2.1`)                                                                     `PUBLIC`
                                     (`VARCHAR(20)`)     (`VARCHAR(100)` e.g.,                                                                                                                                                        
                                                         `'Heartbeat'`,                                                                                                                                                               
                                                         `'Global Classroom'`,                                                                                                                                                        
                                                         `'Skill Up!'`,                                                                                                                                                               
                                                         `'Green Leaders'`,                                                                                                                                                           
                                                         `'Aquatica'`, `'Rooted'`,                                                                                                                                                    
                                                         `'Scale Up!'`, `'Equify'`,                                                                                                                                                   
                                                         `'Raise Your Voice'`,                                                                                                                                                        
                                                         `'On The Map'`),                                                                                                                                                             
                                                         `sdg_goal_index` (`INT`                                                                                                                                                      
                                                         `1..17`), `sdg_target_code`                                                                                                                                                  
                                                         (`VARCHAR(10)` e.g.,                                                                                                                                                         
                                                         `'3.4'`, `'4.6'`, `'4.7'`,                                                                                                                                                   
                                                         `'5.1'`, `'8.6'`, `'10.2'`,                                                                                                                                                  
                                                         `'13.3'`, `'14.1'`,                                                                                                                                                          
                                                         `'15.5'`, `'17.17'`),                                                                                                                                                        
                                                         `target_org_type` (`ENUM`:                                                                                                                                                   
                                                         `'SCHOOLS'`, `'NGO'`,                                                                                                                                                        
                                                         `'BOTH'`),                                                                                                                                                                   
                                                         `standard_jd_json`                                                                                                                                                           
                                                         (`JSONB`),                                                                                                                                                                   
                                                         `moo_metrics_json`                                                                                                                                                           
                                                         (`JSONB`), `min_weeks`                                                                                                                                                       
                                                         (`INT DEFAULT 6`),                                                                                                                                                           
                                                         `max_weeks`                                                                                                                                                                  
                                                         (`INT DEFAULT 8`)                                                                                                                                                            

  **`exchange_standards_catalog`**   `standard_number`   `standard_code`             `1:N` →                     Exactly 13 rows have `is_mandatory_for_co = TRUE` and 5 rows have `FALSE`                                            `PUBLIC`
                                     (`INT` `1..18`)     (`VARCHAR(30) UNIQUE`),     `ep_standards_evidence`     ([SRC-013](https://docs.google.com/presentation/d/1OKtCK6XHvwKNzKKIUQEdSkGEKhqbspEjQeboA30zq6I/edit?usp=drivesdk))   
                                                         `standard_name`                                                                                                                                                              
                                                         (`VARCHAR(120)`),                                                                                                                                                            
                                                         `responsible_party`                                                                                                                                                          
                                                         (`ENUM`: `'SE'`, `'HE'`,                                                                                                                                                     
                                                         `'BOTH'`),                                                                                                                                                                   
                                                         `is_mandatory_for_co`                                                                                                                                                        
                                                         (`BOOLEAN`), `survey_stage`                                                                                                                                                  
                                                         (`ENUM`: `'MIDDLE'`,                                                                                                                                                         
                                                         `'FINAL'`, `'BOTH'`),                                                                                                                                                        
                                                         `applies_to_physical`                                                                                                                                                        
                                                         (`BOOLEAN`),                                                                                                                                                                 
                                                         `applies_to_fully_remote`                                                                                                                                                    
                                                         (`BOOLEAN`),                                                                                                                                                                 
                                                         `sla_rule_description`                                                                                                                                                       
                                                         (`TEXT`),                                                                                                                                                                    
                                                         `survey_question_text`                                                                                                                                                       
                                                         (`TEXT`)                                                                                                                                                                     
  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

#### Domain 2: B2B CRM, Organizations, Contacts, Deals & Contracts

  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Table Name                    Primary Key      Key Columns & Data Types         Foreign Keys &             Validation Constraints & Business Rules                           Sensitivity (Law
                                                                                  Cardinalities                                                                                09-08)
  ----------------------------- ---------------- -------------------------------- -------------------------- ----------------------------------------------------------------- ----------------------
  **`organizations`**           `org_id`         `lc_id` (`UUID`),                `lc_id` →                  Unique index on `(normalized_name, city)`; if                     `INTERNAL`
                                (`UUID`)         `expa_company_id`                `local_committees`;        `partnership_status IN ('SUSPENDED', 'BLACKLISTED')`, block new   
                                                 (`INT UNIQUE NULL`),             `bd_owner_id`,             opportunities                                                     
                                                 `legal_name`                     `cxp_owner_id` →                                                                             
                                                 (`VARCHAR(200) NOT NULL`),       `internal_users`; `1:N` →                                                                    
                                                 `normalized_name`                `organization_contacts`,                                                                     
                                                 (`VARCHAR(200) NOT NULL`),       `b2b_deals`,                                                                                 
                                                 `org_type` (`ENUM`:              `partner_agreements`,                                                                        
                                                 `'NGO_ASSOCIATION'`,             `opportunities`                                                                              
                                                 `'FOUNDATION'`,                                                                                                               
                                                 `'PUBLIC_SCHOOL'`,                                                                                                            
                                                 `'PRIVATE_SCHOOL'`,                                                                                                           
                                                 `'UNIVERSITY'`, `'STARTUP'`,                                                                                                  
                                                 `'SME'`, `'MNC_CORPORATE'`,                                                                                                   
                                                 `'INCUBATOR'`, `'GOVERNMENT'`),                                                                                               
                                                 `legal_status_ma` (`ENUM`:                                                                                                    
                                                 `'DAHIR_1958'`,                                                                                                               
                                                 `'UTILITE_PUBLIQUE'`, `'SARL'`,                                                                                               
                                                 `'SA'`, `'AUTO_ENTREPRENEUR'`,                                                                                                
                                                 `'PUBLIC'`), `ice_number`                                                                                                     
                                                 (`VARCHAR(20) UNIQUE NULL`),                                                                                                  
                                                 `rc_number`                                                                                                                   
                                                 (`VARCHAR(30) NULL`),                                                                                                         
                                                 `dahir_receipt_number`                                                                                                        
                                                 (`VARCHAR(60) NULL`), `city`                                                                                                  
                                                 (`VARCHAR(80)` `'Rabat'`),                                                                                                    
                                                 `neighborhood` (`VARCHAR(100)`),                                                                                              
                                                 `address_line` (`TEXT`),                                                                                                      
                                                 `website_url` (`TEXT`),                                                                                                       
                                                 `primary_sdg_focus` (`INT`),                                                                                                  
                                                 `partnership_status` (`ENUM`:                                                                                                 
                                                 `'PROSPECT'`, `'CONTACTED'`,                                                                                                  
                                                 `'IN_NEGOTIATION'`,                                                                                                           
                                                 `'ACTIVE_PARTNER'`,                                                                                                           
                                                 `'INACTIVE_ALUMNI'`,                                                                                                          
                                                 `'SUSPENDED'`, `'BLACKLISTED'`),                                                                                              
                                                 `bd_owner_id` (`UUID`),                                                                                                       
                                                 `cxp_owner_id` (`UUID`),                                                                                                      
                                                 `health_score` (`NUMERIC(5,2)`                                                                                                
                                                 `0..100`),                                                                                                                    
                                                 `unjustified_rejections_ytd`                                                                                                  
                                                 (`INT DEFAULT 0`)                                                                                                             

  **`organization_contacts`**   `contact_id`     `org_id` (`UUID NOT NULL`),      `org_id` →                 Unique index on `LOWER(email)` and `phone_whatsapp` where not     `CONFIDENTIAL_PII`
                                (`UUID`)         `full_name`                      `organizations(org_id)`    null; `is_full_time_employee = TRUE` required if assigned as      
                                                 (`VARCHAR(150) NOT NULL`),       (`N:1`)                    `iGTa`/`iGTe` supervisor (`AEPP 3.2.2.d`)                         
                                                 `job_title` (`VARCHAR(120)`),                                                                                                 
                                                 `contact_role` (`ENUM`:                                                                                                       
                                                 `'DECISION_MAKER'`,                                                                                                           
                                                 `'PROJECT_SUPERVISOR'`,                                                                                                       
                                                 `'HR_MANAGER'`,                                                                                                               
                                                 `'FINANCE_CONTACT'`,                                                                                                          
                                                 `'FIELD_COORDINATOR'`), `email`                                                                                               
                                                 (`VARCHAR(150)`),                                                                                                             
                                                 `phone_whatsapp`                                                                                                              
                                                 (`VARCHAR(30)`),                                                                                                              
                                                 `preferred_language` (`ENUM`:                                                                                                 
                                                 `'FR'`, `'EN'`, `'AR'`),                                                                                                      
                                                 `is_full_time_employee`                                                                                                       
                                                 (`BOOLEAN DEFAULT TRUE`),                                                                                                     
                                                 `is_primary`                                                                                                                  
                                                 (`BOOLEAN DEFAULT FALSE`)                                                                                                     

  **`b2b_deals`**               `deal_id`        `org_id` (`UUID NOT NULL`),      `org_id` →                 If                                                                `INTERNAL`
                                (`UUID`)         `primary_contact_id` (`UUID`),   `organizations`;           `stage IN ('PROPOSAL_SENT', 'NEGOTIATION', 'CONTRACT_SIGNED')`,   
                                                 `owner_user_id`                  `primary_contact_id` →     `discovery_notes_json` must be non-empty; if                      
                                                 (`UUID NOT NULL`), `deal_title`  `organization_contacts`;   `stage = 'CLOSED_LOST'`, `loss_reason IS NOT NULL`                
                                                 (`VARCHAR(200)`),                `owner_user_id` →                                                                            
                                                 `target_product` (`ENUM`:        `internal_users`                                                                             
                                                 `'iGV'`, `'iGTa'`, `'iGTe'`,                                                                                                  
                                                 `'MULTI_PRODUCT'`,                                                                                                            
                                                 `'CSR_SPONSORSHIP'`), `stage`                                                                                                 
                                                 (`ENUM`: `'NEW_LEAD'`,                                                                                                        
                                                 `'CONTACTED'`,                                                                                                                
                                                 `'MEETING_SCHEDULED'`,                                                                                                        
                                                 `'DISCOVERY_COMPLETED'`,                                                                                                      
                                                 `'PROPOSAL_SENT'`,                                                                                                            
                                                 `'NEGOTIATION'`,                                                                                                              
                                                 `'CONTRACT_SIGNED'`,                                                                                                          
                                                 `'ONBOARDED_LIVE'`,                                                                                                           
                                                 `'CLOSED_LOST'`,                                                                                                              
                                                 `'DISQUALIFIED'`),                                                                                                            
                                                 `expected_slots` (`INT`),                                                                                                     
                                                 `expected_revenue_mad`                                                                                                        
                                                 (`NUMERIC(12,2)`), `tax_framing`                                                                                              
                                                 (`ENUM`:                                                                                                                      
                                                 `'CGI_ART_57_PARRAINAGE'`,                                                                                                    
                                                 `'CGI_ART_10_MECENAT'`,                                                                                                       
                                                 `'STANDARD_OP_FEE'`),                                                                                                         
                                                 `discovery_notes_json`                                                                                                        
                                                 (`JSONB`), `objections_logged`                                                                                                
                                                 (`TEXT[]`), `loss_reason`                                                                                                     
                                                 (`TEXT`), `last_activity_at`                                                                                                  
                                                 (`TIMESTAMPTZ`),                                                                                                              
                                                 `next_followup_due_at`                                                                                                        
                                                 (`TIMESTAMPTZ`)                                                                                                               

  **`partner_agreements`**      `agreement_id`   `org_id` (`UUID NOT NULL`),      `org_id`, `funder_org_id`  `expiration_date >= effective_start_date + INTERVAL '365 days'`   `CONFIDENTIAL_LEGAL`
                                (`UUID`)         `funder_org_id` (`UUID NULL` for → `organizations`;         (`APIP 5.2.4.3.1.2`); if `product_scope = 'iGV'`,                 
                                                 Tripartite CSR), `deal_id`       `deal_id` → `b2b_deals`;   `ngo_funder_coverage_pct >= 70.0` OR                              
                                                 (`UUID`),                        `lc_signatory_user_id`,    `accommodation_provider_party = 'HE_ARRANGED_EP_FEE'`             
                                                 `contract_reference_code`        `fnl_approver_user_id` →   (`APIP 5.3.2.5`)                                                  
                                                 (`VARCHAR(50) UNIQUE`),          `internal_users`                                                                             
                                                 `product_scope` (`ENUM`:                                                                                                      
                                                 `'iGV'`, `'iGTa'`, `'iGTe'`,                                                                                                  
                                                 `'MULTI'`),                                                                                                                   
                                                 `jurisdiction_country`                                                                                                        
                                                 (`VARCHAR(60)` `'Morocco'`),                                                                                                  
                                                 `signed_date` (`DATE NOT NULL`),                                                                                              
                                                 `effective_start_date`                                                                                                        
                                                 (`DATE NOT NULL`),                                                                                                            
                                                 `expiration_date`                                                                                                             
                                                 (`DATE NOT NULL`),                                                                                                            
                                                 `contracted_slots_count`                                                                                                      
                                                 (`INT NOT NULL`),                                                                                                             
                                                 `total_contract_value_mad`                                                                                                    
                                                 (`NUMERIC(12,2)`),                                                                                                            
                                                 `ngo_funder_coverage_pct`                                                                                                     
                                                 (`NUMERIC(5,2)`),                                                                                                             
                                                 `accommodation_provider_party`                                                                                                
                                                 (`ENUM`: `'OP_PROVIDED'`,                                                                                                     
                                                 `'HE_ARRANGED_OP_FUNDED'`,                                                                                                    
                                                 `'HE_ARRANGED_CSR_FUNDED'`,                                                                                                   
                                                 `'HE_ARRANGED_EP_FEE'`),                                                                                                      
                                                 `signed_pdf_drive_url`                                                                                                        
                                                 (`TEXT NOT NULL`),                                                                                                            
                                                 `op_signatory_name`                                                                                                           
                                                 (`VARCHAR(150)`),                                                                                                             
                                                 `lc_signatory_user_id` (`UUID`),                                                                                              
                                                 `fnl_approver_user_id` (`UUID`),                                                                                              
                                                 `status` (`ENUM`: `'DRAFT'`,                                                                                                  
                                                 `'PENDING_SIGNATURE'`,                                                                                                        
                                                 `'SIGNED_ACTIVE'`, `'EXPIRED'`,                                                                                               
                                                 `'TERMINATED_BREACH'`)                                                                                                        
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

#### Domain 3: Opportunities, Slots & International Relations (IR)

  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Table Name                  Primary Key        Key Columns & Data Types                       Foreign Keys & Cardinalities      Validation Constraints & Business Rules                          Sensitivity
                                                                                                                                                                                                   (Law 09-08)
  --------------------------- ------------------ ---------------------------------------------- --------------------------------- ---------------------------------------------------------------- -------------
  **`opportunities`**         `opportunity_id`   `expa_opportunity_id` (`INT UNIQUE NULL`),     `org_id` → `organizations`;       • `iGV`: `duration_weeks BETWEEN 6 AND 8`,                       `PUBLIC`
                              (`UUID`)           `org_id` (`UUID NOT NULL`), `agreement_id`     `agreement_id` →                  `working_hours_per_week BETWEEN 25 AND 40`,                      
                                                 (`UUID NOT NULL`), `supervisor_contact_id`     `partner_agreements`;             `gv_project_id IS NOT NULL`,                                     
                                                 (`UUID NOT NULL`), `account_manager_user_id`   `supervisor_contact_id` →         `accommodation_provided = TRUE``<br>`{=html}• `iGTa`:            
                                                 (`UUID NOT NULL`), `product_code` (`ENUM`:     `organization_contacts`;          `duration_weeks BETWEEN 6 AND 78`,                               
                                                 `'iGV'`, `'iGTa'`, `'iGTe'`), `modality_code`  `account_manager_user_id` →       `working_hours_per_week BETWEEN 35 AND 45`,                      
                                                 (`ENUM`: `'PHYSICAL'`, `'PARTLY_REMOTE'`,      `internal_users`; `gv_project_id` `ep_project_fee_mad = 0`, (`salary_amount_mad >= 3500` OR        
                                                 `'FULLY_REMOTE'`), `gv_project_id`             → `gv_portfolio_templates`        (`duration_weeks <= 8` AND                                       
                                                 (`VARCHAR(20) NULL`), `gt_professional_field`                                    `accommodation_provided = TRUE`))`<br>`{=html}• `iGTe`:          
                                                 (`VARCHAR(80) NULL`), `title`                                                    `duration_weeks BETWEEN 9 AND 78`,                               
                                                 (`VARCHAR(200) NOT NULL`), `jd_tasks_json`                                       `working_hours_per_week BETWEEN 35 AND 45`,                      
                                                 (`JSONB NOT NULL`), `duration_weeks`                                             `ep_project_fee_mad = 0`,                                        
                                                 (`INT NOT NULL`), `remote_duration_weeks`                                        `salary_amount_mad >= 3500``<br>`{=html}• `PARTLY_REMOTE`:       
                                                 (`INT DEFAULT 0`), `working_hours_per_week`                                      `duration_weeks >= 13`,                                          
                                                 (`NUMERIC(4,1) NOT NULL`),                                                       `remote_duration_weeks <= duration_weeks * 0.5`,                 
                                                 `work_days_per_week` (`INT DEFAULT 5`),                                          `partly_remote_icb_audit_url IS NOT NULL``<br>`{=html}•          
                                                 `salary_amount_mad`                                                              `account_manager_assigned_at <= opened_at + INTERVAL '7 days'`   
                                                 (`NUMERIC(10,2) DEFAULT 0`),                                                                                                                      
                                                 `ep_project_fee_mad`                                                                                                                              
                                                 (`NUMERIC(10,2) DEFAULT 0`),                                                                                                                      
                                                 `accommodation_provided` (`BOOLEAN NOT NULL`),                                                                                                    
                                                 `meals_provided_per_day` (`INT DEFAULT 0`),                                                                                                       
                                                 `transport_provided`                                                                                                                              
                                                 (`BOOLEAN DEFAULT FALSE`),                                                                                                                        
                                                 `required_languages_json` (`JSONB`),                                                                                                              
                                                 `required_skills_json` (`JSONB`),                                                                                                                 
                                                 `partly_remote_icb_audit_url` (`TEXT NULL`),                                                                                                      
                                                 `status` (`ENUM`: `'DRAFT'`,                                                                                                                      
                                                 `'PENDING_VALIDATION'`, `'PUBLISHED_LIVE'`,                                                                                                       
                                                 `'PAUSED_SUSPENDED'`, `'CLOSED'`,                                                                                                                 
                                                 `'EXPIRED'`), `opened_at` (`TIMESTAMPTZ`),                                                                                                        
                                                 `account_manager_assigned_at` (`TIMESTAMPTZ`),                                                                                                    
                                                 `is_locked_by_approval`                                                                                                                           
                                                 (`BOOLEAN DEFAULT FALSE`)                                                                                                                         

  **`opportunity_slots`**     `slot_id` (`UUID`) `opportunity_id` (`UUID NOT NULL`),            `opportunity_id` →                `start_date <= CURRENT_DATE + INTERVAL '365 days'`               `PUBLIC`
                                                 `expa_slot_id` (`INT UNIQUE NULL`),            `opportunities(opportunity_id)`   (`APIP 5.3.4`);                                                  
                                                 `slot_title` (`VARCHAR(120)`), `start_date`    (`N:1`); `1:N` →                  `end_date >= start_date + (duration_weeks * 7 - 3)`              
                                                 (`DATE NOT NULL`), `end_date`                  `ep_applications`,                                                                                 
                                                 (`DATE NOT NULL`), `applications_close_date`   `ir_slot_allocations`                                                                              
                                                 (`DATE NOT NULL`), `total_openings`                                                                                                               
                                                 (`INT NOT NULL CHECK (total_openings > 0)`),                                                                                                      
                                                 `approved_count` (`INT DEFAULT 0`),                                                                                                               
                                                 `realized_count` (`INT DEFAULT 0`),                                                                                                               
                                                 `slot_status` (`ENUM`: `'OPEN'`, `'FULL'`,                                                                                                        
                                                 `'REALIZING'`, `'CLOSED'`)                                                                                                                        

  **`ir_entities`**           `ir_entity_id`     `mc_country_name` (`VARCHAR(100) NOT NULL`),   `ir_owner_user_id` →              Unique on `expa_lc_id` or `(mc_country_name, lc_name)`           `INTERNAL`
                              (`UUID`)           `lc_name` (`VARCHAR(120) NOT NULL`),           `internal_users(user_id)`; `1:N`                                                                   
                                                 `expa_lc_id` (`INT UNIQUE`),                   → `ir_contacts`,                                                                                   
                                                 `morocco_visa_regime` (`ENUM`:                 `ir_slot_allocations`,                                                                             
                                                 `'VISA_FREE_90D'`, `'AEVM_EVISA'`,             `ep_applications`                                                                                  
                                                 `'EMBASSY_PAPER_VISA'`),                                                                                                                          
                                                 `min_visa_lead_time_days` (`INT` e.g., `14`,                                                                                                      
                                                 `21`, `45`), `tier_level` (`ENUM`:                                                                                                                
                                                 `'TIER_1_STRATEGIC'`, `'TIER_2_GROWTH'`,                                                                                                          
                                                 `'TIER_3_TACTICAL'`, `'PROBATION'`),                                                                                                              
                                                 `ir_owner_user_id` (`UUID`),                                                                                                                      
                                                 `avg_response_time_hours` (`NUMERIC(5,1)`),                                                                                                       
                                                 `se_standards_compliance_pct`                                                                                                                     
                                                 (`NUMERIC(5,2)`), `health_score`                                                                                                                  
                                                 (`NUMERIC(5,2)`)                                                                                                                                  

  **`ir_slot_allocations`**   `allocation_id`    `ir_entity_id` (`UUID NOT NULL`), `slot_id`    `ir_entity_id` → `ir_entities`;   `target_apd <= target_app AND target_re <= target_apd`           `INTERNAL`
                              (`UUID`)           (`UUID NOT NULL`), `term_code` (`VARCHAR(10)`  `slot_id` → `opportunity_slots`                                                                    
                                                 `'26.2'`), `target_app` (`INT`), `target_apd`                                                                                                     
                                                 (`INT`), `target_re` (`INT`), `actual_app`                                                                                                        
                                                 (`INT DEFAULT 0`), `actual_apd`                                                                                                                   
                                                 (`INT DEFAULT 0`), `actual_re`                                                                                                                    
                                                 (`INT DEFAULT 0`), `shared_search_tool_url`                                                                                                       
                                                 (`TEXT`), `whatsapp_group_url` (`TEXT`)                                                                                                           
  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

#### Domain 4: EPs, Applications, Visa, Accommodation & Delivery Standards

  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Table Name                        Primary Key            Key Columns & Data Types                                     Foreign Keys & Cardinalities        Validation Constraints & Business Rules                                                           Sensitivity (Law
                                                                                                                                                                                                                                                              09-08)
  --------------------------------- ---------------------- ------------------------------------------------------------ ----------------------------------- ------------------------------------------------------------------------------------------------- --------------------
  **`ep_profiles`**                 `ep_id` (`UUID`)       `expa_person_id` (`INT UNIQUE NOT NULL`), `full_name`        `sending_ir_entity_id` →            `AGE(date_of_birth) BETWEEN 18 AND 30` at application time (`AEPP`); `passport_number_encrypted`  `CONFIDENTIAL_PII`
                                                           (`VARCHAR(150) NOT NULL`), `email`                           `ir_entities(ir_entity_id)`; `1:N`  & `medical_dietary_notes_encrypted` encrypted via AES-256                                         
                                                           (`VARCHAR(150) UNIQUE NOT NULL`), `phone_whatsapp`           → `ep_applications`                                                                                                                   
                                                           (`VARCHAR(30) NOT NULL`), `nationality_country`                                                                                                                                                    
                                                           (`VARCHAR(80) NOT NULL`), `residence_country`                                                                                                                                                      
                                                           (`VARCHAR(80) NOT NULL`), `morocco_visa_regime` (`ENUM`:                                                                                                                                           
                                                           `'VISA_FREE_90D'`, `'AEVM_EVISA'`, `'EMBASSY_PAPER_VISA'`),                                                                                                                                        
                                                           `date_of_birth` (`DATE NOT NULL`), `gender` (`VARCHAR(30)`),                                                                                                                                       
                                                           `passport_number_encrypted` (`TEXT`), `passport_expiry_date`                                                                                                                                       
                                                           (`DATE`), `languages_json` (`JSONB`), `skills_json`                                                                                                                                                
                                                           (`JSONB`), `cv_url` (`TEXT`),                                                                                                                                                                      
                                                           `medical_dietary_notes_encrypted` (`TEXT`),                                                                                                                                                        
                                                           `emergency_contact_name` (`VARCHAR(150)`),                                                                                                                                                         
                                                           `emergency_contact_phone` (`VARCHAR(30)`),                                                                                                                                                         
                                                           `emergency_contact_relation` (`VARCHAR(60)`)                                                                                                                                                       

  **`ep_applications`**             `application_id`       `expa_application_id` (`INT UNIQUE NULL`), `ep_id`           `ep_id` → `ep_profiles`;            • For `iGV`, `ABS(DATE(realized_at) - slot.start_date) <= 20` (`APIP 5.3.5`)`<br>`{=html}• Cannot `CONFIDENTIAL_PII`
                                    (`UUID`)               (`UUID NOT NULL`), `opportunity_id` (`UUID NOT NULL`),       `opportunity_id` → `opportunities`; transition to `REJECTED` or `*_BROKEN` without                                                    
                                                           `slot_id` (`UUID NOT NULL`), `sending_ir_entity_id`          `slot_id` → `opportunity_slots`;    `rejection_or_break_reason IS NOT NULL``<br>`{=html}•                                             
                                                           (`UUID NOT NULL`), `se_poc_name` (`VARCHAR(120)`),           `sending_ir_entity_id` →            `is_co_qualified = (mandatory_standards_met_count == 13 AND optional_standards_met_count >= 3)`   
                                                           `se_poc_contact` (`VARCHAR(120)`), `he_manager_user_id`      `ir_entities`;                                                                                                                        
                                                           (`UUID NOT NULL`), `pickup_buddy_user_id` (`UUID NULL`),     `he_manager_user_id`,                                                                                                                 
                                                           `match_score_pct` (`NUMERIC(5,2)`), `expa_status` (`ENUM`:   `pickup_buddy_user_id` →                                                                                                              
                                                           `'OPEN'`, `'APPLIED'`, `'ACCEPTED_BY_HOST'`, `'ACCEPTED'`,   `internal_users`                                                                                                                      
                                                           `'APPROVED'`, `'REMOTE_REALIZED'`, `'REALIZED'`,                                                                                                                                                   
                                                           `'FINISHED'`, `'COMPLETED'`, `'REJECTED'`, `'WITHDRAWN'`,                                                                                                                                          
                                                           `'APPROVAL_BROKEN'`, `'REALIZATION_BROKEN'`,                                                                                                                                                       
                                                           `'REMOTE_BROKEN'`, `'FINISHED_EARLIER'`), `sub_status`                                                                                                                                             
                                                           (`VARCHAR(50)`), `applied_at` (`TIMESTAMPTZ NOT NULL`),                                                                                                                                            
                                                           `first_contacted_at` (`TIMESTAMPTZ`), `host_interviewed_at`                                                                                                                                        
                                                           (`TIMESTAMPTZ`), `op_interviewed_at` (`TIMESTAMPTZ`),                                                                                                                                              
                                                           `accepted_at` (`TIMESTAMPTZ`), `approved_at`                                                                                                                                                       
                                                           (`TIMESTAMPTZ`), `remote_realized_at` (`TIMESTAMPTZ`),                                                                                                                                             
                                                           `expected_arrival_at` (`TIMESTAMPTZ`), `realized_at`                                                                                                                                               
                                                           (`TIMESTAMPTZ`), `expected_finish_at` (`TIMESTAMPTZ`),                                                                                                                                             
                                                           `finished_at` (`TIMESTAMPTZ`), `completed_at`                                                                                                                                                      
                                                           (`TIMESTAMPTZ`), `broken_or_rejected_at` (`TIMESTAMPTZ`),                                                                                                                                          
                                                           `rejection_or_break_reason` (`TEXT`),                                                                                                                                                              
                                                           `is_op_unjustified_rejection` (`BOOLEAN DEFAULT FALSE`),                                                                                                                                           
                                                           `an_signed_pdf_url` (`TEXT`), `insurance_pdf_url` (`TEXT`),                                                                                                                                        
                                                           `op_14d_prearrival_confirmed_at` (`TIMESTAMPTZ`),                                                                                                                                                  
                                                           `accomm_14d_prearrival_confirmed_at` (`TIMESTAMPTZ`),                                                                                                                                              
                                                           `last_ep_contact_at` (`TIMESTAMPTZ`),                                                                                                                                                              
                                                           `mandatory_standards_met_count` (`INT DEFAULT 0`),                                                                                                                                                 
                                                           `optional_standards_met_count` (`INT DEFAULT 0`),                                                                                                                                                  
                                                           `is_co_qualified` (`BOOLEAN DEFAULT FALSE`)                                                                                                                                                        

  **`ep_visa_records`**             `visa_record_id`       `application_id` (`UUID UNIQUE NOT NULL`), `visa_type`       `application_id` →                  `he_14d_sla_breached = (he_docs_sent_at > approved_at + INTERVAL '14 days')`;                     `CONFIDENTIAL_PII`
                                    (`UUID`)               (`ENUM`: `'VISA_FREE_STAMP'`, `'AEVM_EVISA'`,                `ep_applications(application_id)`   `ep_14d_apply_sla_breached = (ep_visa_applied_at > he_docs_sent_at + INTERVAL '14 days')`         
                                                           `'CONSULAR_TOURIST_STAGE'`, `'WORK_VISA_PERMIT'`),           (`1:1`)                             (`AEPP 4.4.2.1`, `4.4.3.1`)                                                                       
                                                           `invitation_letter_pdf_url` (`TEXT`),                                                                                                                                                              
                                                           `accommodation_cert_pdf_url` (`TEXT`),                                                                                                                                                             
                                                           `op_legal_docs_pdf_url` (`TEXT`), `he_docs_sent_at`                                                                                                                                                
                                                           (`TIMESTAMPTZ`), `ep_status_updated_at` (`TIMESTAMPTZ`),                                                                                                                                           
                                                           `ep_visa_applied_at` (`TIMESTAMPTZ`),                                                                                                                                                              
                                                           `embassy_appointment_date` (`DATE`), `visa_decision_status`                                                                                                                                        
                                                           (`ENUM`: `'NOT_REQUIRED'`, `'PREPARING_DOCS'`,                                                                                                                                                     
                                                           `'DOCS_SENT_TO_EP'`, `'SUBMITTED_PENDING'`,                                                                                                                                                        
                                                           `'APPROVED_GRANTED'`, `'REJECTED'`), `visa_copy_pdf_url`                                                                                                                                           
                                                           (`TEXT`), `he_14d_sla_breached` (`BOOLEAN DEFAULT FALSE`),                                                                                                                                         
                                                           `ep_14d_apply_sla_breached` (`BOOLEAN DEFAULT FALSE`)                                                                                                                                              

  **`accommodation_providers`**     `accomm_provider_id`   `lc_id` (`UUID`), `provider_name` (`VARCHAR(150) NOT NULL`), `lc_id` → `local_committees`;       Cannot be `APPROVED_ACTIVE` unless                                                                `CONFIDENTIAL_PII`
                                    (`UUID`)               `provider_type` (`ENUM`: `'GLOBAL_HOST_FAMILY'`,             `inspected_by_user_id` →            `has_single_beds AND has_clean_water AND has_bathroom AND has_electricity` (`Standard #7`,        
                                                           `'PARTNER_HOSTEL'`, `'RENTED_APARTMENT'`, `'OP_DORMITORY'`), `internal_users`; `1:N` →           `AEPP 1.3.2.7`)                                                                                   
                                                           `contact_person` (`VARCHAR(120)`), `phone_whatsapp`          `accommodation_beds`                                                                                                                  
                                                           (`VARCHAR(30)`), `neighborhood` (`VARCHAR(100)`),                                                                                                                                                  
                                                           `full_address` (`TEXT`), `gps_lat_lng` (`VARCHAR(60)`),                                                                                                                                            
                                                           `has_single_beds` (`BOOLEAN NOT NULL`), `has_clean_water`                                                                                                                                          
                                                           (`BOOLEAN NOT NULL`), `has_bathroom` (`BOOLEAN NOT NULL`),                                                                                                                                         
                                                           `has_electricity` (`BOOLEAN NOT NULL`), `vetting_status`                                                                                                                                           
                                                           (`ENUM`: `'PENDING_INSPECTION'`, `'APPROVED_ACTIVE'`,                                                                                                                                              
                                                           `'SUSPENDED'`, `'BLACKLISTED'`), `last_inspected_at`                                                                                                                                               
                                                           (`TIMESTAMPTZ`), `inspected_by_user_id` (`UUID`),                                                                                                                                                  
                                                           `inspection_photos_url` (`TEXT`)                                                                                                                                                                   

  **`accommodation_beds`**          `bed_id` (`UUID`)      `accomm_provider_id` (`UUID NOT NULL`), `room_label`         `accomm_provider_id` →              Unique on `(accomm_provider_id, room_label, bed_code)`                                            `INTERNAL`
                                                           (`VARCHAR(60)`), `bed_code` (`VARCHAR(40)`),                 `accommodation_providers` (`N:1`);                                                                                                    
                                                           `gender_restriction` (`ENUM`: `'FEMALE_ONLY'`,               `1:N` → `accommodation_allocations`                                                                                                   
                                                           `'MALE_ONLY'`, `'COED_PRIVATE'`), `cost_per_month_mad`                                                                                                                                             
                                                           (`NUMERIC(10,2)`), `deposit_required_mad`                                                                                                                                                          
                                                           (`NUMERIC(10,2) DEFAULT 0`), `is_active`                                                                                                                                                           
                                                           (`BOOLEAN DEFAULT TRUE`)                                                                                                                                                                           

  **`accommodation_allocations`**   `accomm_alloc_id`      `application_id` (`UUID NOT NULL`), `bed_id`                 `application_id` →                  Exclusion constraint preventing overlapping `(check_in_date, check_out_date)` on the same         `INTERNAL`
                                    (`UUID`)               (`UUID NOT NULL`), `check_in_date` (`DATE NOT NULL`),        `ep_applications`; `bed_id` →       `bed_id` where `alloc_status IN ('RESERVED_LOCKED', 'CHECKED_IN')`                                
                                                           `check_out_date` (`DATE NOT NULL`), `deposit_paid_mad`       `accommodation_beds`                                                                                                                  
                                                           (`NUMERIC(10,2) DEFAULT 0`), `deposit_returned_mad`                                                                                                                                                
                                                           (`NUMERIC(10,2)`), `checkin_signed_report_url` (`TEXT`),                                                                                                                                           
                                                           `checkout_signed_report_url` (`TEXT`), `alloc_status`                                                                                                                                              
                                                           (`ENUM`: `'RESERVED_LOCKED'`, `'CHECKED_IN'`,                                                                                                                                                      
                                                           `'CHECKED_OUT'`, `'CANCELLED'`)                                                                                                                                                                    

  **`ep_standards_evidence`**       `evidence_id` (`UUID`) `application_id` (`UUID NOT NULL`), `standard_number`        `application_id` →                  Unique on `(application_id, standard_number, checkpoint_phase)`; requires                         `INTERNAL`
                                                           (`INT NOT NULL CHECK (standard_number BETWEEN 1 AND 18)`),   `ep_applications`;                  `proof_document_or_photo_url IS NOT NULL` for HE standards (#4--#16) to be marked                 
                                                           `checkpoint_phase` (`ENUM`: `'PRE_ARRIVAL'`,                 `standard_number` →                 `DELIVERED_VERIFIED`                                                                              
                                                           `'WEEK_1_MIDDLE'`, `'ONGOING_DELIVERY'`,                     `exchange_standards_catalog`;                                                                                                         
                                                           `'FINAL_COMPLETION'`), `internal_status` (`ENUM`:            `verified_by_user_id` →                                                                                                               
                                                           `'PENDING'`, `'DELIVERED_VERIFIED'`, `'BREACHED'`,           `internal_users`                                                                                                                      
                                                           `'NOT_APPLICABLE_REMOTE'`), `ep_survey_response` (`ENUM`:                                                                                                                                          
                                                           `'UNANSWERED'`, `'YES_FULFILLED'`, `'NO_UNFULFILLED'`),                                                                                                                                            
                                                           `delivered_at` (`TIMESTAMPTZ`), `verified_by_user_id`                                                                                                                                              
                                                           (`UUID`), `proof_document_or_photo_url` (`TEXT`), `notes`                                                                                                                                          
                                                           (`TEXT`)                                                                                                                                                                                           

  **`ep_touchpoints`**              `touchpoint_id`        `application_id` (`UUID NOT NULL`), `conducted_by_user_id`   `application_id` →                  Auto-updates `ep_applications.last_ep_contact_at = completed_at`                                  `INTERNAL`
                                    (`UUID`)               (`UUID NOT NULL`), `touchpoint_type` (`ENUM`:                `ep_applications`;                                                                                                                    
                                                           `'BIWEEKLY_GV_CHECKPOINT'`, `'MONTHLY_GT_CHECKPOINT'`,       `conducted_by_user_id` →                                                                                                              
                                                           `'LEAD_SESSION_15'`, `'SAFETY_PING'`, `'FINAL_DEBRIEF'`),    `internal_users`;                                                                                                                     
                                                           `scheduled_date` (`DATE NOT NULL`), `completed_at`           `escalated_to_case_id` →                                                                                                              
                                                           (`TIMESTAMPTZ`), `ep_mood_score`                             `quality_cases`                                                                                                                       
                                                           (`INT CHECK (ep_mood_score BETWEEN 1 AND 5)`),                                                                                                                                                     
                                                           `jd_hours_compliant` (`BOOLEAN`), `accommodation_compliant`                                                                                                                                        
                                                           (`BOOLEAN`), `moo_progress_logged` (`BOOLEAN`),                                                                                                                                                    
                                                           `summary_notes` (`TEXT`), `escalated_to_case_id`                                                                                                                                                   
                                                           (`UUID NULL`)                                                                                                                                                                                      
  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

#### Domain 5: Case Solving, Finance, Tasks, Communications & Audit Trail

  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Table Name                     Primary Key    Key Columns & Data Types                 Foreign Keys &              Validation Constraints & Business Rules                                   Sensitivity (Law
                                                                                         Cardinalities                                                                                         09-08)
  ------------------------------ -------------- ---------------------------------------- --------------------------- ------------------------------------------------------------------------- ----------------------
  **`quality_cases`**            `case_id`      `application_id` (`UUID NOT NULL`),      `application_id` →          Automatically sets SLA timestamps per `APIP 6.9` (`+24h`, `+48h`, `+72h`, `CONFIDENTIAL_LEGAL`
                                 (`UUID`)       `opened_by_user_id` (`UUID`),            `ep_applications`;          `+96h`, `+5d`) upon creation or stage transition                          
                                                `case_category` (`ENUM`:                 `opened_by_user_id` →                                                                                 
                                                `'VISA_DELAY_REJECTION'`,                `internal_users`; `1:N` →                                                                             
                                                `'ACCOMMODATION_SUBSTANDARD'`,           `compensation_claims`                                                                                 
                                                `'JD_HOURS_MISMATCH'`,                                                                                                                         
                                                `'SALARY_DELAY_UNPAID'`,                                                                                                                       
                                                `'UNLAWFUL_DISMISSAL'`,                                                                                                                        
                                                `'HARASSMENT_VIOLENCE_ANNEX1'`,                                                                                                                
                                                `'EP_UNREACHABLE_SAFETY'`,                                                                                                                     
                                                `'FAKE_STATUS_OCCA'`,                                                                                                                          
                                                `'EARLY_FINISH_EXTENSION'`),                                                                                                                   
                                                `current_stage` (`ENUM`:                                                                                                                       
                                                `'STAGE_1_LC_TO_LC'`,                                                                                                                          
                                                `'STAGE_2_ECB_TO_ECB'`,                                                                                                                        
                                                `'STAGE_3_ICB_OCA'`,                                                                                                                           
                                                `'STAGE_3_ICB_OCCA'`,                                                                                                                          
                                                `'URGENCY_PROTOCOL_48H'`,                                                                                                                      
                                                `'HARASSMENT_COMMITTEE'`,                                                                                                                      
                                                `'RESOLVED_CLOSED'`,                                                                                                                           
                                                `'APPEALED_ANNEX9'`), `opened_at`                                                                                                              
                                                (`TIMESTAMPTZ NOT NULL`),                                                                                                                      
                                                `stage_1_ack_due_at` (`TIMESTAMPTZ`),                                                                                                          
                                                `stage_1_escalation_due_at`                                                                                                                    
                                                (`TIMESTAMPTZ`), `stage_2_reply_due_at`                                                                                                        
                                                (`TIMESTAMPTZ`), `stage_3_ruling_due_at`                                                                                                       
                                                (`TIMESTAMPTZ`),                                                                                                                               
                                                `replacement_deadline_date` (`DATE`),                                                                                                          
                                                `evidence_dossier_url` (`TEXT`),                                                                                                               
                                                `resolution_summary` (`TEXT`),                                                                                                                 
                                                `resolved_at` (`TIMESTAMPTZ`)                                                                                                                  

  **`compensation_claims`**      `claim_id`     `case_id` (`UUID NOT NULL`),             `case_id` →                 `fifty_pct_due_date = ruling_date + INTERVAL '6 months'`;                 `CONFIDENTIAL_LEGAL`
                                 (`UUID`)       `liable_party` (`ENUM`:                  `quality_cases(case_id)`    `hundred_pct_due_date = ruling_date + INTERVAL '12 months'`               
                                                `'HOST_ENTITY_RABAT'`,                   (`N:1`)                     (`APIP 6.9.1.3.14`); if `salary_delay_days > 30`,                         
                                                `'OPPORTUNITY_PROVIDER'`,                                            `daily_fine_2pct_mad = salary_amount * 0.02 * (salary_delay_days - 30)`   
                                                `'SENDING_ENTITY'`,                                                  (`Annex 2`)                                                               
                                                `'EXCHANGE_PARTICIPANT'`),                                                                                                                     
                                                `beneficiary_party` (`ENUM`:                                                                                                                   
                                                `'EXCHANGE_PARTICIPANT'`,                                                                                                                      
                                                `'OPPORTUNITY_PROVIDER'`,                                                                                                                      
                                                `'HOST_ENTITY_RABAT'`,                                                                                                                         
                                                `'SENDING_ENTITY'`),                                                                                                                           
                                                `annex_2_clause_code` (`VARCHAR(40)`),                                                                                                         
                                                `internship_completion_pct`                                                                                                                    
                                                (`NUMERIC(5,2)`), `salary_delay_days`                                                                                                          
                                                (`INT DEFAULT 0`),                                                                                                                             
                                                `principal_amount_mad`                                                                                                                         
                                                (`NUMERIC(12,2)`), `daily_fine_2pct_mad`                                                                                                       
                                                (`NUMERIC(12,2) DEFAULT 0`),                                                                                                                   
                                                `total_liability_mad` (`NUMERIC(12,2)`),                                                                                                       
                                                `fifty_pct_due_date` (`DATE`),                                                                                                                 
                                                `hundred_pct_due_date` (`DATE`),                                                                                                               
                                                `paid_amount_mad`                                                                                                                              
                                                (`NUMERIC(12,2) DEFAULT 0`),                                                                                                                   
                                                `claim_status` (`ENUM`: `'CALCULATED'`,                                                                                                        
                                                `'ICB_ORDERED'`,                                                                                                                               
                                                `'PARTIALLY_PAID_50PCT'`,                                                                                                                      
                                                `'FULLY_SETTLED'`, `'APPEALED'`)                                                                                                               

  **`invoices`**                 `invoice_id`   `invoice_number`                         `org_id` → `organizations`; Cannot charge `ep_application_id` if `product_code IN ('iGTa', 'iGTe')`   `CONFIDENTIAL_LEGAL`
                                 (`UUID`)       (`VARCHAR(40) UNIQUE NOT NULL`),         `ep_application_id` →       (`APIP 5.2.3.1.4`); flags `OVERDUE_AR_ALERT` if                           
                                                `org_id` (`UUID NULL`),                  `ep_applications`;          `CURRENT_DATE > due_date + 14` (`AFPM`)                                   
                                                `ep_application_id` (`UUID NULL`),       `agreement_id` →                                                                                      
                                                `agreement_id` (`UUID NULL`),            `partner_agreements`                                                                                  
                                                `afpm_account_code` (`VARCHAR(30)` e.g.,                                                                                                       
                                                `'REV-EXCH-IGV'`, `'REV-EXCH-IGTA'`,                                                                                                           
                                                `'REV-EXCH-IGTE'`, `'REV-CSR-ART57'`),                                                                                                         
                                                `amount_ht_mad`                                                                                                                                
                                                (`NUMERIC(12,2) NOT NULL`),                                                                                                                    
                                                `tax_amount_mad`                                                                                                                               
                                                (`NUMERIC(12,2) DEFAULT 0`),                                                                                                                   
                                                `total_ttc_mad`                                                                                                                                
                                                (`NUMERIC(12,2) NOT NULL`),                                                                                                                    
                                                `paid_amount_mad`                                                                                                                              
                                                (`NUMERIC(12,2) DEFAULT 0`),                                                                                                                   
                                                `issue_date` (`DATE NOT NULL`),                                                                                                                
                                                `due_date` (`DATE NOT NULL`),                                                                                                                  
                                                `invoice_status` (`ENUM`: `'DRAFT'`,                                                                                                           
                                                `'ISSUED_SENT'`, `'PARTIALLY_PAID'`,                                                                                                           
                                                `'PAID_RECONCILED'`,                                                                                                                           
                                                `'OVERDUE_AR_ALERT'`,                                                                                                                          
                                                `'CANCELLED_CREDIT_NOTE'`),                                                                                                                    
                                                `invoice_pdf_url` (`TEXT`)                                                                                                                     

  **`financial_transactions`**   `tx_id`        `lc_id` (`UUID NOT NULL`), `invoice_id`  `lc_id` →                   Dual-control rule (`AFPM Section 5`):                                     `CONFIDENTIAL_LEGAL`
                                 (`UUID`)       (`UUID NULL`), `application_id`          `local_committees`;         `recorded_by_user_id != approved_by_fnl_user_id` for outflows/refunds;    
                                                (`UUID NULL`), `opportunity_id`          `invoice_id` → `invoices`;  `receipt_voucher_url IS NOT NULL`                                         
                                                (`UUID NULL`), `tx_type` (`ENUM`:        `application_id` →                                                                                    
                                                `'INFLOW_REVENUE'`,                      `ep_applications`;                                                                                    
                                                `'OUTFLOW_DIRECT_EXCHANGE_COST'`,        `recorded_by_user_id`,                                                                                
                                                `'OUTFLOW_OVERHEAD'`,                    `approved_by_fnl_user_id` →                                                                           
                                                `'REFUND_COMPENSATION'`),                `internal_users`                                                                                      
                                                `afpm_category` (`ENUM`:                                                                                                                       
                                                `'PARTNER_FEE'`, `'EP_PROJECT_FEE'`,                                                                                                           
                                                `'CSR_SPONSORSHIP'`,                                                                                                                           
                                                `'ACCOMMODATION_COST'`,                                                                                                                        
                                                `'PICKUP_LOGISTICS_COST'`,                                                                                                                     
                                                `'IPS_EVENT_COST'`, `'VISA_LEGAL_COST'`,                                                                                                       
                                                `'AFFILIATION_FEE'`,                                                                                                                           
                                                `'CASE_COMPENSATION'`), `amount_mad`                                                                                                           
                                                (`NUMERIC(12,2) NOT NULL`), `tx_date`                                                                                                          
                                                (`DATE NOT NULL`), `payment_method`                                                                                                            
                                                (`ENUM`: `'BANK_TRANSFER'`, `'CHEQUE'`,                                                                                                        
                                                `'CASH_RECEIPT'`, `'ONLINE_PAYMENT'`),                                                                                                         
                                                `receipt_voucher_url` (`TEXT NOT NULL`),                                                                                                       
                                                `recorded_by_user_id` (`UUID NOT NULL`),                                                                                                       
                                                `approved_by_fnl_user_id`                                                                                                                      
                                                (`UUID NOT NULL`)                                                                                                                              

  **`communication_logs`**       `comm_id`      `stakeholder_type` (`ENUM`:              `logged_by_user_id` →       Auto-updates `b2b_deals.last_activity_at` or                              `INTERNAL`
                                 (`UUID`)       `'ORGANIZATION'`, `'EP'`, `'IR_ENTITY'`, `internal_users`;           `ep_applications.last_ep_contact_at`                                      
                                                `'ACCOMM_PROVIDER'`, `'ECB_ICB'`),       polymorphic                                                                                           
                                                `stakeholder_id` (`UUID NOT NULL`),      `stakeholder_id` + optional                                                                           
                                                `related_application_id` (`UUID NULL`),  FKs to `ep_applications`,                                                                             
                                                `related_deal_id` (`UUID NULL`),         `b2b_deals`                                                                                           
                                                `logged_by_user_id` (`UUID NOT NULL`),                                                                                                         
                                                `channel` (`ENUM`: `'WHATSAPP'`,                                                                                                               
                                                `'EMAIL_GMAIL'`, `'PHONE_CALL'`,                                                                                                               
                                                `'IN_PERSON_MEETING'`, `'GOOGLE_MEET'`),                                                                                                       
                                                `direction` (`ENUM`: `'OUTBOUND'`,                                                                                                             
                                                `'INBOUND'`), `subject_or_topic`                                                                                                               
                                                (`VARCHAR(200)`), `summary_body`                                                                                                               
                                                (`TEXT NOT NULL`), `external_thread_url`                                                                                                       
                                                (`TEXT`), `occurred_at`                                                                                                                        
                                                (`TIMESTAMPTZ NOT NULL DEFAULT NOW()`)                                                                                                         

  **`tasks`**                    `task_id`      `title` (`VARCHAR(200) NOT NULL`),       `assigned_to_user_id`,      Transitions to `OVERDUE_ESCALATED` when                                   `INTERNAL`
                                 (`UUID`)       `description` (`TEXT`),                  `escalate_to_user_id` →     `NOW() > due_at AND completed_at IS NULL`                                 
                                                `assigned_to_user_id` (`UUID NOT NULL`), `internal_users`                                                                                      
                                                `escalate_to_user_id` (`UUID NOT NULL`),                                                                                                       
                                                `automation_code` (`VARCHAR(20) NULL`                                                                                                          
                                                e.g., `'AUTO-015'`),                                                                                                                           
                                                `related_entity_type` (`VARCHAR(40)`),                                                                                                         
                                                `related_entity_id` (`UUID`), `priority`                                                                                                       
                                                (`ENUM`: `'LOW'`, `'MEDIUM'`, `'HIGH'`,                                                                                                        
                                                `'CRITICAL_SLA'`), `due_at`                                                                                                                    
                                                (`TIMESTAMPTZ NOT NULL`), `completed_at`                                                                                                       
                                                (`TIMESTAMPTZ NULL`), `task_status`                                                                                                            
                                                (`ENUM`: `'PENDING'`, `'IN_PROGRESS'`,                                                                                                         
                                                `'COMPLETED'`, `'OVERDUE_ESCALATED'`,                                                                                                          
                                                `'CANCELLED'`), `gcal_event_id`                                                                                                                
                                                (`VARCHAR(120) NULL`)                                                                                                                          

  **`status_history_logs`**      `history_id`   `entity_table` (`VARCHAR(60) NOT NULL`), `changed_by_user_id` →      Append-only immutable table (`UPDATE` and `DELETE` revoked at DB level)   `INTERNAL`
                                 (`UUID`)       `entity_id` (`UUID NOT NULL`),           `internal_users`                                                                                      
                                                `old_status` (`VARCHAR(60)`),                                                                                                                  
                                                `new_status` (`VARCHAR(60) NOT NULL`),                                                                                                         
                                                `changed_by_user_id` (`UUID`),                                                                                                                 
                                                `change_source` (`ENUM`: `'USER_UI'`,                                                                                                          
                                                `'EXPA_SYNC_DAEMON'`,                                                                                                                          
                                                `'SLA_AUTOMATION'`), `reason_notes`                                                                                                            
                                                (`TEXT`), `changed_at`                                                                                                                         
                                                (`TIMESTAMPTZ NOT NULL DEFAULT NOW()`)                                                                                                         
  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

\<a id=\"deliverable-7\"\>\</a\> \## 9. DELIVERABLE 7: OFFICIAL STATUS &
TRANSITION STATE MACHINE CATALOGUE

### 9.1 Exchange Participant (`ep_applications`) Official Status & Transition Catalogue (`[GLOBAL-POLICY]`: `Annex 3`, `AEPP`, `APIP`)

  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  From Status              To Status                Trigger Actor(s)       Mandatory Pre-Conditions & Validation Gates in ERP                   Side-Effects & Automations Triggered             Exception / Rollback Path
  ------------------------ ------------------------ ---------------------- -------------------------------------------------------------------- ------------------------------------------------ ------------------------------
  **`OPEN`** (Draft /      **`APPLIED`** (`APP`)    EP on YOP              • Valid `ep_profiles` record (`AGE 18..30`)`<br>`{=html}•            • Compute Match Score (`0–100%`)`<br>`{=html}•   EP clicks Withdraw →
  Matched)                                          (`aiesec.org`) or EXPA Opportunity Slot `slot_status == 'OPEN'` and                         Trigger `AUTO-010`: Assign EP Manager & set 24h  `WITHDRAWN`
                                                    Sync Daemon            `available_openings > 0`                                             First Contact SLA                                

  **`APPLIED`**            **`SHORTLISTED`**        Host LC Member / MM    • `first_contacted_at IS NOT NULL``<br>`{=html}• Host LC Screening   • Generate anonymized EP Dossier for             Screening failed → `REJECTED`
                           *(Internal Sub-Status)*  Internal               Interview completed & passed (`host_interviewed_at IS NOT NULL`)     OP`<br>`{=html}• Trigger `AUTO-011`: 72h OP      (requires mandatory written
                                                                                                                                                Interview/Review SLA                             feedback per `AEPP 4.2.3.5`)

  **`SHORTLISTED`**        **`ACCEPTED_BY_HOST`**   Host LC / Opportunity  • For `iGTa`/`iGTe`: OP interview logged                             • Issue **Acceptance Note (`AN`)** to            OP rejects → `REJECTED`; if
                                                    Provider (on POP/EXPA) (`op_interviewed_at IS NOT NULL`)`<br>`{=html}• Slot has             EP`<br>`{=html}• Notify SE oGX VP                candidate met 100% of EXPA
                                                                           `available_openings > 0`                                                                                              criteria without valid
                                                                                                                                                                                                 feedback, increment
                                                                                                                                                                                                 `unjustified_rejections_ytd`
                                                                                                                                                                                                 (`AEPP 4.2.2.1.7`)

  **`ACCEPTED_BY_HOST`**   **`ACCEPTED`** (`ACC`)   EP (signs AN on YOP) + • EP digitally signs Acceptance Note                                 • Trigger `AUTO-013`: 48h--72h Approval          EP declines offer before
                                                    Host LC                (`an_signed_pdf_url IS NOT NULL`)                                    (`ACC → APD`) SLA countdown                      signing → `WITHDRAWN`

  **`ACCEPTED`** (`ACC`)   **`APPROVED`** (`APD`)   Sending Entity         • Signed `an_signed_pdf_url``<br>`{=html}• Passport validity         • Lock opportunity benefit/fee fields            Pre-APD cancellation →
                                                    (`SE`) + Hosting       verified (`≥6 months` past slot end date)`<br>`{=html}• SE confirms  (`is_locked_by_approval = TRUE`)`<br>`{=html}•   `WITHDRAWN` or `REJECTED`
                                                    Entity (`HE` LCVP ICX) EP fee paid`<br>`{=html}• OP `partner_agreement` is `SIGNED_ACTIVE`  Decrement `available_openings``<br>`{=html}•     
                                                                                                                                                Start **7-day Account Manager SLA**              
                                                                                                                                                (`AUTO-014`)`<br>`{=html}• Start **14-day Visa & 
                                                                                                                                                Expectation Pack SLA**                           
                                                                                                                                                (`AUTO-015`)`<br>`{=html}• Set **T-28d (GV) /    
                                                                                                                                                T-56d (GT)** cancellation cutoff & **T-14d Rabat 
                                                                                                                                                Pre-Arrival Lock**                               

  **`APPROVED`** (`APD`)   **`REMOTE_REALIZED`**    Host LC (for           • `modality_code IN ('PARTLY_REMOTE', 'FULLY_REMOTE')``<br>`{=html}• • Start remote checkpoint schedule (`AUTO-024`)  Remote break before physical
                           (`RRE`)                  `PARTLY_REMOTE` or     Standards #4 (Expectation Setting), #8 (Virtual IPS), #9 (Virtual                                                     arrival → `REMOTE_BROKEN`
                                                    `FULLY_REMOTE` GTa/GTe First Day), #10a (Initial OP Alignment) verified                                                                      (`AEPP Section 6 & 7`)
                                                    only)                                                                                                                                        

  **`APPROVED`** (`APD`)   **`REALIZED`** (`RE`)    Host LC (`MM Internal` • **Rabat 14d Pre-Arrival Lock** passed                              • Trigger EXPA **Middle Survey** notification    • Pre-arrival valid/invalid
  or **`REMOTE_REALIZED`**                          / `LCVP ICX`)          (`op_14d_prearrival_confirmed_at` &                                  (#1--#10a)`<br>`{=html}• Schedule bi-weekly      break → **`APPROVAL_BROKEN`**
                                                                           `accomm_14d_prearrival_confirmed_at`)`<br>`{=html}• Insurance        (iGV) or monthly (iGTa/iGTe) **Standard #17      (`APD Break`) → Trigger 14-day
                                                                           uploaded (`Standard #3`)`<br>`{=html}• Visa granted                  Checkpoints** (`AUTO-024`)`<br>`{=html}•         replacement window (`Annex 2`)
                                                                           (`Standard #5`)`<br>`{=html}• Pickup & Accommodation Check-in logged Schedule **Standard #15 LEAD**                   
                                                                           (`Standards #6 & #7`)`<br>`{=html}• IPS delivered                    session`<br>`{=html}• Schedule `FIN - 14d`       
                                                                           (`Standard #8`)`<br>`{=html}• **Mandatory Day-1 OP Accompaniment &   Departure Support (`Standard #16`)               
                                                                           Alignment** logged (`Standards #9 & #10a`)`<br>`{=html}• For `iGV`:                                                   
                                                                           `ABS(realized_date - slot.start_date) <= 20 days` (`APIP 5.3.5`)                                                      

  **`REALIZED`** (`RE`)    **`FINISHED`** (`FIN`)   System / EXPA (on      • Exchange duration completed (`Standard #13`: 6--8 wks iGV, 6--78   • Trigger EXPA **Final Survey** notification     • Mid-exchange break →
                                                    `expected_finish_at`   wks iGTa, 9--78 wks iGTe)`<br>`{=html}• Final week OP Debrief        (#10b--#18, LDA, NPS)`<br>`{=html}• Notify SE to **`REALIZATION_BROKEN`**
                                                    date)                  (`Standard #10b`) & Accommodation Check-out logged                   deliver **Standard #18 Debrief** within 14 days  (`RE Break`, 7-day replacement
                                                                                                                                                (`AUTO-027`)                                     window)`<br>`{=html}• Mutual
                                                                                                                                                                                                 early finish with ECB approval
                                                                                                                                                                                                 → **`FINISHED_EARLIER`**
                                                                                                                                                                                                 (`Annex 3`)

  **`FINISHED`** (`FIN`)   **`COMPLETED`** (`CO`)   System / EXPA Survey   • EP submitted Middle & Final Surveys on EXPA`<br>`{=html}• **All 13 • Issue Official AIESEC Exchange                 Survey shows `<13 Mandatory`
                                                    Evaluator              Mandatory Standards = `YES_FULFILLED`** (#1, #2, #4, #5, #6, #7, #8, Certificate`<br>`{=html}• Trigger Partner Impact or `<3 Non-Mandatory` →
                                                                           #9, #10, #11, #13, #14, #18)`<br>`{=html}• **At least 3 of 5         Debrief & Renewal Deal (`AUTO-029`)              Remains **`FINISHED` (`FIN`)**
                                                                           Non-Mandatory Standards = `YES_FULFILLED`** (#3, #12, #15, #16, #17)                                                  (Non-Complete); log root-cause
                                                                                                                                                                                                 in Quality Review
  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

\<a id=\"deliverable-8\"\>\</a\> \## 10. DELIVERABLE 8: SLA, DEADLINE &
ESCALATION AUTOMATION CATALOGUE

The ERP replaces manual spreadsheet checking with **35 deterministic
automation rules (`AUTO-001` to `AUTO-035`)** driven by cron/trigger
workers:

  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Auto ID          Rule Name                 Trigger Event / Condition                                        Statutory / Local Deadline     Automated System Action                                Notification     Escalation Condition & Target        Source Citation
                                                                                                              (`SLA`)                                                                               Recipient                                             
  ---------------- ------------------------- ---------------------------------------------------------------- ------------------------------ ------------------------------------------------------ ---------------- ------------------------------------ --------------------------------------------------------------------------------------------------------------------
  **`AUTO-001`**   **B2B Outreach Follow-Up  `b2b_deals.stage` transitions to `'CONTACTED'`                   **T + 3 Business Days**        Create high-priority follow-up task with pre-filled    Assigned BD      If overdue \>48h → Escalate to **MM  `[LOCAL-RABAT]`
                   Sequence**                                                                                 (Follow-up 1) & **T + 7        French/English follow-up template                      Member           External Engine**                    ([SRC-019](https://docs.google.com/spreadsheets/d/1kkmiMJXy3pF4_pl063Z6A89qUrLXCFJXe81mQJWfhDM/edit?usp=drivesdk))
                                                                                                              Business Days** (Follow-up 2)                                                                                                               

  **`AUTO-002`**   **Stale B2B Deal Alert**  `NOW() - b2b_deals.last_activity_at > 7 days` while deal is      **7 Calendar Days** max        Flag deal card `AT_RISK` (amber badge)                 Assigned BD      If inactive \>14 days → Escalate to  `[ERP-DESIGN]`
                                             active                                                           inactivity                                                                            Member + MM      **LCVP ICX** for reassignment        
                                                                                                                                                                                                    External                                              

  **`AUTO-003`**   **Contract Expiry &       `partner_agreements.expiration_date - CURRENT_DATE == 30 days`   **30 Days before Contract      Auto-create `RENEWAL_UPSELL` deal in B2B pipeline      MM External      If contract expires (`T == 0`) →     `[GLOBAL-POLICY]` (`APIP 5.2.4.3.1.2`)
                   Renewal Trigger**                                                                          Expiry**                                                                              Engine + LCVP    Auto-transition agreement to         
                                                                                                                                                                                                    ICX              `'EXPIRED'` and block new slots      

  **`AUTO-004`**   **Contract Jurisdiction & User attempts to activate `partner_agreements`                   **Immediate (Synchronous       Validate                                               User attempting  Hard block save if invalid           `[GLOBAL-POLICY]` (`APIP 5.2.4.3.1.2`)
                   1-Year Gate**                                                                              Gate)**                        `expiration_date - effective_start_date >= 365 days`   action                                                
                                                                                                                                             and `signed_pdf_drive_url IS NOT NULL`                                                                       

  **`AUTO-005`**   **iGV 70%--100% Funding & User creates/edits `iGV` opportunity                             **Immediate (Synchronous       Validate `gv_project_id IS NOT NULL`,                  Opportunity      Hard block publication if invalid    `[GLOBAL-POLICY]` (`AEPP 3.2.1`, `APIP 5.3.2`)
                   Portfolio Gate**                                                                           Gate)**                        `duration_weeks IN (6..8)`, `hours IN (25..40)`, and   Manager                                               
                                                                                                                                             `ngo_funder_coverage_pct >= 70%` (or explicit EP                                                             
                                                                                                                                             project fee)                                                                                                 

  **`AUTO-006`**   **iGTa/iGTe Salary & Zero User creates/edits `iGTa` or `iGTe` opportunity                  **Immediate (Synchronous       Force `ep_project_fee_mad = 0`; validate               Opportunity      Hard block publication if invalid    `[GLOBAL-POLICY]` (`AEPP 3.2.2–3`, `APIP 5.2.3.1.4`)
                   EP Fee Gate**                                                                              Gate)**                        `hours IN (35..45)`, full-time OP supervisor, and      Manager                                               
                                                                                                                                             mandatory salary floor                                                                                       

  **`AUTO-007`**   **Partly Remote ICB Audit User sets `modality_code = 'PARTLY_REMOTE'`                      **Immediate (Synchronous       Validate `duration_weeks >= 13`,                       Opportunity      Hard block publication until ICB     `[GLOBAL-POLICY]` (`AEPP Sec. 6`, `APIP 5.2.3.1.8`)
                   Gate**                                                                                     Gate)**                        `remote_duration_weeks <= 0.5 * duration_weeks`, and   Manager + LCVP   Audit proof uploaded                 
                                                                                                                                             `partly_remote_icb_audit_url IS NOT NULL`              ICX                                                   

  **`AUTO-008`**   **7-Day Account Manager   `opportunities` created (`opened_at`) with                       **7 Calendar Days (1 Week)**   Create task due at `T + 5d`; check status daily        MM Internal      At `T + 6d` → Alert **LCVP ICX**; at `[GLOBAL-POLICY]` (`APIP 5.2.2.2.6`)
                   Assignment**              `account_manager_user_id IS NULL`                                from opening                                                                          Engine           `T + 7d` → Flag APIP compliance      
                                                                                                                                                                                                                     breach                               

  **`AUTO-009`**   **1-Year Advance Slot     User creates `opportunity_slots`                                 **Immediate (Synchronous       Block slot if `start_date > CURRENT_DATE + 365 days`   Opportunity      Hard block save                      `[GLOBAL-POLICY]` (`APIP 5.3.4.1`)
                   Opening Limit**                                                                            Gate)**                                                                               Manager                                               

  **`AUTO-010`**   **24h EP Application      New `ep_applications` ingested with status `'APPLIED'`           **24 Hours** from `applied_at` Auto-assign EP Manager, compute Match Score, generate  Assigned EP      If `first_contacted_at IS NULL` at   `[LOCAL-RABAT]` ([SRC-018 S1
                   First Contact SLA**                                                                                                       WhatsApp/Email welcome link                            Manager          `T + 24h` → Escalate to **MM         Report](https://docs.google.com/presentation/d/1_BZFmxtlFvIdiWXOEcEvIczSWxaGym-U6lKFwciJ9Zo/edit?usp=drivesdk))
                                                                                                                                                                                                    (CXP/Matching)   Internal**; at `T + 48h` → Escalate  
                                                                                                                                                                                                                     to **LCVP ICX**                      

  **`AUTO-011`**   **72h OP Candidate Review `ep_applications.sub_status` → `'SHORTLISTED'`                   **72 Hours (3 Days)**          Send EP Dossier link to OP Supervisor and create       Account          At `T + 72h` → Escalate to **MM      `[ERP-DESIGN]`
                   SLA**                                                                                                                     follow-up task                                         Manager + OP     Internal & MM External**             
                                                                                                                                                                                                    Supervisor                                            

  **`AUTO-012`**   **OP \>3 Unjustified      OP rejects shortlisted candidate                                 **Max 3 Rejections** per       Increment `unjustified_rejections_ytd`                 Account          When count `== 3` → Warning to OP;   `[GLOBAL-POLICY]` (`AEPP 4.2.2.1.7`)
                   Rejections Freeze**       (`is_op_unjustified_rejection = TRUE`)                           Opportunity                                                                           Manager + LCVP   when `> 3` → Auto-pause opportunity  
                                                                                                                                                                                                    ICX              (`PAUSED_SUSPENDED`) per             
                                                                                                                                                                                                                     `AEPP 4.2.2.1.7`                     

  **`AUTO-013`**   **48h                     `ep_applications.expa_status` → `'ACCEPTED'`                     **48 to 72 Hours**             Trigger Pre-Approval checklist (AN, Passport, Fee, SE  EP Manager + IR  At `T + 48h` → Escalate to **LCVP    `[ERP-DESIGN]`
                   Acceptance-to-Approval                                                                                                    sync)                                                  Coordinator      ICX** & counterpart **LCVP oGX**     
                   (`ACC → APD`) SLA**                                                                                                                                                                                                                    

  **`AUTO-014`**   **7-Day Post-APD EP       `ep_applications.expa_status` → `'APPROVED'`                     **7 Calendar Days (1 Week)**   Verify `he_manager_user_id` contact details sent to EP EP Manager       At `T + 5d` → Escalate to **MM       `[GLOBAL-POLICY]` (`AEPP 4.4.4.3`)
                   Responsible Contact**                                                                      from `approved_at`                                                                                     Internal**                           

  **`AUTO-015`**   **14-Day Post-APD Visa    `ep_applications.expa_status` → `'APPROVED'`                     **14 Calendar Days (2 Weeks)** Generate Visa Invitation Letter, Accommodation Cert,   EP Manager +     At `T + 10d` → Amber Alert to **MM   `[GLOBAL-POLICY]` (`AEPP 4.4.3.1`, `4.4.4.1`, `4.4.4.2`)
                   Pack & Expectation                                                                         from `approved_at`             and Expectation Booklet tasks (`Standards #4 & #5`)    LCVP ICX         Internal**; at `T + 12d` → Red Alert 
                   Setting Gate**                                                                                                                                                                                    to **LCVP ICX & LCP** (warning of    
                                                                                                                                                                                                                     100% refund liability per            
                                                                                                                                                                                                                     `AEPP 4.4.4.1`)                      

  **`AUTO-016`**   **EP 7-Day Visa Update &  `ep_visa_records.he_docs_sent_at IS NOT NULL`                    **7 Days** (EP status update)  Send automated reminder to EP & SE oGX at `T + 5d` and EP + SE POC + EP If `ep_visa_applied_at IS NULL` at   `[GLOBAL-POLICY]` (`AEPP 4.4.2.1`)
                   14-Day Visa Filing                                                                         & **14 Days** (EP visa         `T + 10d`                                              Manager          `T + 14d` → Log                      
                   Tracker**                                                                                  submission)                                                                                            `ep_14d_apply_sla_breached = TRUE`   
                                                                                                                                                                                                                     (exempts HE from visa delay          
                                                                                                                                                                                                                     liability per `AEPP 4.4.2.1`)        

  **`AUTO-017`**   **56-Day (GTa/GTe) &      `slot.start_date - CURRENT_DATE == 56` (GT) or `28` (GV)         **56 Days (GT)** / **28 Days   Send Unavailability Cutoff Notice to EP, SE, and OP;   EP Manager +     Any cancellation after this date     `[GLOBAL-POLICY]` (`AEPP 4.4.2.3`, `4.4.3.5`)
                   28-Day (GV) Cancellation                                                                   (GV)** before Realization      lock standard cancellation window                      Account Manager  auto-triggers `Annex 2` penalty      
                   Cutoff**                                                                                                                                                                                          evaluation                           

  **`AUTO-018`**   **Rabat 14-Day            `expected_arrival_at - NOW() <= 14 days`                         **14 Calendar Days (2 Weeks)** Check `op_14d_prearrival_confirmed_at IS NOT NULL` AND MM Internal +    If unconfirmed at `T - 14d` →        `[LOCAL-RABAT]` ([SRC-018 iGV MM
                   Pre-Arrival OP &                                                                           before arrival                 `accomm_14d_prearrival_confirmed_at IS NOT NULL` AND   Account Manager  **CRITICAL RED ALERT** to **LCVP ICX Summit](https://drive.google.com/file/d/1bbg6uqktj7h-__X63T7XwEg0ssfgwgBH/view?usp=drivesdk))
                   Accommodation Hard Lock**                                                                                                 `insurance_pdf_url IS NOT NULL`                                         & LCP**; block arrival clearance     
                                                                                                                                                                                                                     until resolved                       

  **`AUTO-019`**   **3-Day Pre-Arrival       `expected_arrival_at - NOW() <= 3 days`                          **3 Calendar Days (72 Hours)** Verify `pickup_buddy_user_id` assigned and written     Pickup Buddy +   At `T - 72h` if unsent → Escalate to `[GLOBAL-POLICY]` (`AEPP 1.3.2.6`)
                   Pickup Instructions                                                                        before arrival                 domestic transit/pickup instructions sent to EP        EP Manager       **MM Internal & LCVP ICX**           
                   (`Standard #6`)**                                                                                                         (`Standard #6`)                                                                                              

  **`AUTO-020`**   **Day-1 Work              User transitions `ep_applications` to `'REALIZED'`               **Realization Day (Day 1)**    Verify Standards #6, #7, #8, #9 (HE accompanied EP on  EP Manager       Block `'REALIZED'` transition if     `[GLOBAL-POLICY]` (`AEPP 1.3.2.9`, `APIP 5.3.5`)
                   Accompaniment (`#9`) &                                                                                                    Day 1), #10a logged; for `iGV`, verify                                  mandatory evidence is missing or iGV 
                   20-Day iGV Tolerance                                                                                                      `ABS(realized_at - slot.start_date) <= 20 days`                         date differs by \>20 days            
                   Gate**                                                                                                                                                                                            (`APIP 5.3.5`)                       

  **`AUTO-021`**   **Middle Survey Chase     `NOW() - realized_at == 7 days` (End of Week 1)                  **Week 1--2 of Realization**   Prompt EP to complete EXPA Middle Survey and audit     EP Manager + SE  If Middle Survey uncompleted at      `[GLOBAL-POLICY]` ([SRC-013 Slide
                   (`Standards #1–#10a`)**                                                                                                   Standards #1--#10a                                     POC              `RE + 14d` → Escalate to **MM        19](https://docs.google.com/presentation/d/1OKtCK6XHvwKNzKKIUQEdSkGEKhqbspEjQeboA30zq6I/edit?usp=drivesdk))
                                                                                                                                                                                                                     Internal**                           

  **`AUTO-022`**   **Regular Touchpoints     Application reaches `'REALIZED'` or `'REMOTE_REALIZED'`          **Every 14 Days (iGV)** or     Auto-generate recurring `ep_touchpoints` tasks with    EP Manager       If touchpoint overdue \>72h →        `[GLOBAL-POLICY]` (`AEPP 1.3.2.17`,
                   Generator                                                                                  **Every 30 Days (iGTa/iGTe)**  the official #17 question bank                                          Escalate to **MM Internal**          [SRC-014](https://docs.google.com/presentation/d/17RFsau6BVK1loWPXgHcNTyKpEEYWKhH4wlyrHapTpjE/edit?usp=drivesdk))
                   (`Standard #17`)**                                                                                                                                                                                                                     

  **`AUTO-023`**   **2-Working-Day           `NOW() - last_ep_contact_at > 48 hours` (2 working days) after   **2 Working Days (48 Hours)**  Create `CRITICAL_SAFETY_ALERT`; require immediate      LCVP ICX + LCP + If crisis/missing confirmed →        `[GLOBAL-POLICY]` (`AEPP 4.5.4.11`, `APIP 5.6.1.12`)
                   Unreachable EP Safety     failed ping during `REALIZED`                                    max unreachable                check with OP Supervisor, Host Family/Hostel, and SE   MM Internal      Trigger **24-Hour AI/ICB Crisis      
                   Protocol**                                                                                                                                                                                        Report** (`APIP 5.6.1.12`)           

  **`AUTO-024`**   **14-Day Pre-Finish       `expected_finish_at - NOW() == 14 days`                          **14 Calendar Days (2 Weeks)** Trigger task to send written departure logistics,      EP Manager +     If unsent at `FIN - 10d` → Escalate  `[GLOBAL-POLICY]` (`AEPP 1.3.2.16`)
                   Departure Support                                                                          before finish                  airport transit, and check-out instructions            Logistics        to **MM Internal**                   
                   (`Standard #16`)**                                                                                                        (`Standard #16`)                                       Coordinator                                           

  **`AUTO-025`**   **Internship Extension    User requests slot extension on active `iGTa`/`iGTe`             **≥14 Days before End Date**   Validate cumulative duration `<= 78 weeks`, mutual     Account          Block extension if `<14d` (`<28d`    `[GLOBAL-POLICY]` (`AEPP 4.5.2.3`, `4.5.3.6`)
                   Deadline Gate                                                                              (or **≥28 Days** if visa       EP+OP consent, and ECB approval document               Manager + LCVP   with visa) or `>78 weeks`            
                   (`iGTa`/`iGTe`)**                                                                          renewal needed)                                                                       ICX              (`AEPP 4.5.2.3`)                     

  **`AUTO-026`**   **Final Survey, SE        Application transitions to `'FINISHED'`                          **Within 14 Days of Finish**   Notify SE to deliver **Standard #18 Debrief**; chase   EP Manager + SE  If Final Survey or #18 pending at    `[GLOBAL-POLICY]` (`AEPP 1.3.2.18`, `APIP 2.6.3`)
                   Debrief (`#18`) & `CO`                                                                                                    Final Survey; run `CO` formula                         POC              `FIN + 10d` → Escalate to **LCVP ICX 
                   Evaluator**                                                                                                               (`13/13 Mandatory + ≥3/5 Non-Mandatory`)                                & SE LCVP oGX**                      

  **`AUTO-027`**   **APD / RE Break          Application transitions to `'APPROVAL_BROKEN'` or                **14 Days (2 Weeks)** for      Open high-priority Replacement Matching workflow;      LCVP ICX + MM    On timer expiry without replacement  `[GLOBAL-POLICY]` ([SRC-008 Annex
                   Replacement Window Timer  `'REALIZATION_BROKEN'`                                           `APD Break`; **7 Days (1       start countdown to find replacement EP or OP           Internal         → Auto-calculate `Annex 2` financial 2](https://drive.google.com/file/d/1utNAwjhDPAMUwsuLvErSkTaOyF2yi1nZ/view?usp=drivesdk))
                   (`Annex 2`)**                                                                              Week)** for `RE Break`                                                                                 reimbursement claim                  

  **`AUTO-028`**   **Salary Delay 2% Daily   Case opened with `case_category = 'SALARY_DELAY_UNPAID'`         **7--30 Days** (Immediate      Compute accrued daily fine                             LCVP ICX + LCVP  At `30 days` → Escalate to **ECB**;  `[GLOBAL-POLICY]` ([SRC-008 Annex
                   Fine Calculator                                                                            Payment) / **\>30 Days** (+2%  (`2% * monthly_salary * (days_late - 30)`) and notify  FnL + LCP        at `60 days` (2 months unpaid) →     2](https://drive.google.com/file/d/1utNAwjhDPAMUwsuLvErSkTaOyF2yi1nZ/view?usp=drivesdk))
                   (`Annex 2`)**                                                                              Fine/Day) / **60 Days** (Valid OP & LCVP FnL                                                           Authorize penalty-free EP `RE Break` 
                                                                                                              RE Break)                                                                                              with full reimbursement              

  **`AUTO-029`**   **Stage 1 → Stage 2 →     `quality_cases` created                                          **Stage 1**: 24h Ack / 48h     Track exact hour-by-hour SLA clocks and alert          LCVP ICX + LCP + Auto-generate Stage 2 ECB escalation `[GLOBAL-POLICY]` (`APIP 6.9`, `AEPP 5.2`)
                   Stage 3 Case Solving                                                                       Reply / 72h                    responsible case owner before each deadline            ECB Chair        docket at `72h` and Stage 3 ICB      
                   Clocks**                                                                                   Escalate`<br>`{=html}**Stage 2                                                                         docket at `7d`                       
                                                                                                              (ECB)**: 48h / 48h / 96h                                                                                                                    
                                                                                                              (7d)`<br>`{=html}**Stage 3                                                                                                                  
                                                                                                              (ICB)**: 48h / 5d (OCA) or 3d                                                                                                               
                                                                                                              (OCCA) / 5d Ruling                                                                                                                          

  **`AUTO-030`**   **Harassment Prevention   Case opened with `case_category = 'HARASSMENT_VIOLENCE_ANNEX1'`  **24 Hours** to start          Immediately lock case to confidential access (`LCP`,   LCP + ECB        Direct escalation to **ECB & ICB**   `[GLOBAL-POLICY]` ([SRC-007 Annex
                   Committee 24h / 7-Day                                                                      investigation; **7 Working     `LCVP ICX`, `ECB Chair`), trigger immediate EP         Chair +          if 24h or 7-working-day deadline is  1](https://drive.google.com/file/d/1gMi44u0aCeDXuKdxWtr0zkt-A3J28VP6/view?usp=drivesdk))
                   Clock (`Annex 1`)**                                                                        Days** for signed PDF Final    relocation task, and set 24h/7d timers                 Harassment       at risk                              
                                                                                                              Report                                                                                Committee                                             

  **`AUTO-031`**   **AFPM 14-Day Overdue     `CURRENT_DATE > invoices.due_date + 14 days` and                 **14 Calendar Days (2 Weeks)** Transition invoice to `'OVERDUE_AR_ALERT'` and create  LCVP FnL +       At `due_date + 30d` → Escalate to    `[GLOBAL-POLICY]` ([SRC-012 AFPM Sec.
                   Accounts Receivable       `invoice_status != 'PAID_RECONCILED'`                            past due date                  collection task                                        Account Manager  **LCP** and freeze new slot          6](https://drive.google.com/file/d/1bsZfRTVLj1lpXEho_Trb8Ey1dGvSTQhs/view?usp=drivesdk))
                   Chaser**                                                                                                                                                                                          approvals for that debtor            
  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

\<a id=\"deliverable-9\"\>\</a\> \## 11. DELIVERABLE 9: ROLE-BASED
ACCESS CONTROL (RBAC) & PERMISSION MATRIX

All internal users authenticate via Google OAuth restricted to
`@aiesec.net` accounts and must have `nda_signed_at IS NOT NULL`
(`APIP 5.7.2.4`). Permissions are defined below using: **`C`** (Create),
**`R`** (Read All), **`R-Own`** (Read Assigned/Team Only), **`U`**
(Update All), **`U-Own`** (Update Assigned Only), **`Approve`** (Execute
Gate/Sign-off), **`Export`** (Export CSV/PDF), and **`—`** (No Access).
Hard `DELETE` is disabled system-wide (`Archive` only for Admin/EB).

  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  ERP Module /           Member BD        Member CXP / IR    MM External Engine (TL BD)   MM Internal Engine   LCVP ICX (iGV / iGTa / iGTe)  LCVP FnL (Finance & Legal)      LCP (Local Committee         ECB Chair / Auditor        External OP    System Admin (IM /
  Resource              (External)          (Internal)                                       (TL Ops/CXP)                                                                         President)                                         Portal User           Tech)
  ----------------- ------------------- ------------------- ---------------------------- --------------------- ---------------------------- ---------------------------- ---------------------------- ---------------------------- ---------------- -------------------
  **A.                 `C, R, U-Own`            `R`              `C, R, U, Export`              `R, U`          `C, R, U, Approve, Export`   `R, U` (Legal/Tax fields)    `C, R, U, Approve, Export`          `R, Export`           `R-Own, U-Own`   `C, R, U, Export`
  Organizations &                                                                                                                                                                                                                                   
  Contacts**                                                                                                                                                                                                                                        

  **B. B2B Sales     `C, R-Own, U-Own`          `R`          `C, R, U, Approve, Export`           `R`           `C, R, U, Approve, Export`      `R` (Pricing review)         `R, Approve, Export`                 `R`                    `—`             `C, R, U`
  Pipeline                                                                                                                                                                                                                                          
  (`b2b_deals`)**                                                                                                                                                                                                                                   

  **C.                      `R`            `C, R, U-Own`             `C, R, U`            `C, R, U, Approve`    `C, R, U, Approve, Export`        `R` (Fee check)            `R, Approve, Export`        `R, Approve` (Audits)         `R-Own`           `C, R, U`
  Opportunities &                                                                                                                                                                                                                                   
  Slots**                                                                                                                                                                                                                                           

  **D. EP Profiles          `—`             `R, U-Own`             `R` (Summary)          `C, R, U, Approve`    `C, R, U, Approve, Export`        `R` (Fee check)            `R, Approve, Export`             `R, Export`              `R-Own`           `C, R, U`
  & Applications**                                                                                                                                                                                                                   (Shortlisted   
                                                                                                                                                                                                                                        only)       

  **D.2 Sensitive           `—`           `R-Own, U-Own`                `—`                     `R, U`                    `R, U`                        `—`                          `R`                    `R` (Case audit)             `—`           `—` (Masked)
  EP PII (Passport,                                                                                                                                                                                                                                 
  Medical, CIN)**                                                                                                                                                                                                                                   

  **E. IR Directory         `R`            `C, R, U-Own`                `R`               `C, R, U, Approve`    `C, R, U, Approve, Export`              `R`                      `R, Export`                      `R`                    `—`             `C, R, U`
  & Allocations**                                                                                                                                                                                                                                   

  **F.                      `—`             `R, U-Own`                  `—`               `C, R, U, Approve`    `C, R, U, Approve, Export`     `R, Approve` (Leases)             `R, Approve`           `R` (Standard #7 audit)          `—`             `C, R, U`
  Accommodation &                                                                                                                                                                                                                                   
  Beds Inventory**                                                                                                                                                                                                                                  

  **G. 18 Exchange          `—`            `C, R, U-Own`                `R`               `C, R, U, Approve`    `C, R, U, Approve, Export`              `R`                      `R, Export`              `R, Approve, Export`       `R-Own` (#9,           `R`
  Standards &                                                                                                                                                                                                                         #10, #11)     
  Evidence**                                                                                                                                                                                                                                        

  **G.2 Quality             `—`             `C, R-Own`                  `—`                    `C, R, U`        `C, R, U, Approve, Export`   `R, U, Approve` (Payouts)    `C, R, U, Approve, Export`   `C, R, U, Approve, Export`        `—`          `R` (Metadata)
  Cases & Annex 2                                                                                                                                                                                                                                   
  Claims**                                                                                                                                                                                                                                          

  **G.3 Harassment          `—`                 `—`                     `—`                       `—`          `C, R-Own` (If on Committee)             `—`                   `C, R, U, Approve`           `C, R, U, Approve`            `—`           `—` (Blocked)
  Cases (`Annex 1`                                                                                                                                                                                                                                  
  Vault)**                                                                                                                                                                                                                                          

  **H. Contracts &      `C, R-Own`            `R-Own`                `C, R, U`                  `R, U`          `C, R, U, Approve, Export`   `C, R, U, Approve, Export`   `C, R, U, Approve, Export`          `R, Export`           `R-Own` (Sign           `R`
  Document Vault**                                                                                                                                                                                                                     own MoU)     

  **I. Finance,             `—`                 `—`            `R-Own` (B2B Invoices)    `R-Own` (CXP Budget)   `C, R, Approve` (Co-sign)    `C, R, U, Approve, Export`      `R, Approve, Export`             `R, Export`            `R-Own` (Own           `R`
  Invoices &                                                                                                                                                                      (Co-sign)                                           Invoices)     
  Ledgers                                                                                                                                                                                                                                           
  (`AFPM`)**                                                                                                                                                                                                                                        

  **J. Tasks,        `C, R-Own, U-Own`   `C, R-Own, U-Own`      `C, R-Team, U-Team`       `C, R-Team, U-Team`       `C, R, U, Export`            `C, R-Own, U-Own`            `C, R, U, Export`                   `R`                    `—`             `C, R, U`
  Calendar &                                                                                                                                                                                                                                        
  Governance                                                                                                                                                                                                                                        
  (`O2O`)**                                                                                                                                                                                                                                         

  **L. System               `—`                 `—`                     `—`                       `—`                      `R`                          `R`                      `R, Export`                  `R, Export`                `—`         `C, R, U, Export`
  Config &                                                                                                                                                                                                                                          
  Immutable Audit                                                                                                                                                                                                                                   
  Logs**                                                                                                                                                                                                                                            
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

\<a id=\"deliverable-10\"\>\</a\> \## 12. DELIVERABLE 10: EXPA / GIS API
INTEGRATION SPECIFICATION & RESEARCH EVIDENCE REGISTER

### 12.1 Verified EXPA / GIS API Capabilities vs. Proposed ERP Sync Boundaries

-   **Verified Official Endpoints**:
    -   **GraphQL API**: `https://gis-api.aiesec.org/graphql`
    -   **REST / Swagger Docs**: `https://gis-api.aiesec.org/swagger`
    -   **Authentication**: OAuth2 Bearer Token (`access_token`) tied to
        an authenticated `@aiesec.net` user account (`APIP 5.7.2`).
-   **Verified GraphQL Read Queries**:
    -   `GetAllOpportunitiesQuery` / `allOpportunity`: Retrieves
        paginated opportunities and `Opportunity` fragments including
        `id`, `title`, `description`, `applicants_count`,
        `applications_close_date`, `earliest_start_date`,
        `latest_end_date`, `duration`, `opportunity_duration_type`,
        `programme { id short_name }`, `project_name`,
        `project_description`, `remote_opportunity`, `experience_type`,
        `specifics_info { salary salary_currency { alphabetic_code } salary_periodicity }`,
        `sdg_info { sdg_target { target_id goal_index description } }`,
        `branch { company { id name } }`,
        `host_lc { id name address_detail { country } }`, `openings`,
        `available_openings`, `pre_screen_questions { id question }`.
    -   `allOpportunityApplication`: Retrieves EP applications for the
        host LC (`id`, `status`, `created_at`, `date_matched`,
        `date_approved`, `date_realized`, `experience_end_date`,
        `person { id full_name email phone home_lc { id name country } }`,
        `opportunity { id title }`,
        `slot { id title start_date end_date }`, `standards_Progress`).

### 12.2 Entity-by-Entity Synchronization & Conflict Resolution Matrix (`[ERP-DESIGN]`)

To guarantee **zero silent overwrites of EXPA** and **100% compliance
with `APIP 5.7`**, the ERP enforces a strict **Authoritative Source of
Truth Matrix**:

  ------------------------------------------------------------------------------------------------------------------------------------------------------------
  Data Domain / Field     Authoritative System of Record     Sync Direction   Sync Frequency Conflict Resolution Rule                       Fallback if EXPA
  Group                                                                       & Mechanism                                                   Write Token
                                                                                                                                            Restricted
  ----------------------- ---------------------------------- ---------------- -------------- ---------------------------------------------- ------------------
  **EXPA Opportunity ID,  **EXPA                             **EXPA → ERP     Scheduled Cron **EXPA Always Wins** on `expa_*` columns. If   100% supported via
  Live Status, Slot       (`gis-api.aiesec.org/graphql`)**   (Read-Sync)**    every **15     ERP local sub-status conflicts with EXPA       Read-Only GraphQL
  Dates, Official                                                             minutes** +    official status, ERP logs a                    query token or
  Application Status                                                          Manual "Sync   `SYNC_DISCREPANCY_ALERT` in                    CSV/JSON export
  (`APP`, `ACC`, `APD`,                                                       Now" button    `status_history_logs` and updates              import.
  `RE`, `FIN`, `CO`)**                                                                       `expa_status` to match EXPA without deleting   
                                                                                             local notes.                                   

  **Middle & Final Survey **EXPA / YOP (`aiesec.org`)**      **EXPA → ERP     Scheduled Cron **EXPA Always Wins** on customer survey        Supported via EXPA
  Responses                                                  (Read-Sync)**    every **6      answers (`ep_survey_response`). Internal       Standards CSV
  (`ep_survey_response`                                                       hours**        evidence (`internal_status`,                   export parser
  on Standards #1--#18,                                                                      `proof_document_or_photo_url`) remains         built into ERP.
  NPS, LDA)**                                                                                ERP-authoritative so LCVP/ECB can compare      
                                                                                             internal proof vs. EP survey claims.           

  **B2B Prospecting       **ICX ERP (Native)**               **ERP Native     Real-time      **ERP Wins** (not stored in EXPA).             Native to ERP.
  Pipeline, Discovery                                        Only** (until    inside ERP                                                    
  Notes, Moroccan                                            Partner is                                                                     
  Legal/Tax IDs (`ICE`,                                      Contracted &                                                                   
  `RC`, Dahir), CGI Art.                                     pushed to                                                                      
  57 Sponsorships**                                          POP/EXPA)                                                                      

  **18 Standards Proof    **ICX ERP (Native)**               **ERP Native     Real-time      **ERP Wins** (operational delivery layer       Native to ERP.
  Vault, Rabat 14-Day                                        Only**           inside ERP     missing from EXPA).                            
  Pre-Arrival Lock,                                                                                                                         
  Touchpoint Logs (#17),                                                                                                                    
  Safety Pings, Global                                                                                                                      
  Host Bed Allocations,                                                                                                                     
  AFPM Ledger**                                                                                                                             

  **Triggering `Accept`,  **Human-in-the-Loop Action Outbox  **ERP Gate       Event-driven   User must first pass ERP validation gates      Eliminates shared
  `Approve`, `Realize`,   → EXPA**                           Validation →     upon passing   (e.g., 14d lock, Day-1 proof, signed           service-account
  or `Open Opportunity`                                      Deep-Link to     ERP validation contract). ERP generates an **EXPA Action      violations
  on EXPA**                                                  EXPA → Read-Back gates          Outbox Card** with a 1-click deep-link         (`APIP 5.7.2.2`)
                                                             Confirmation**                  (`https://expa.aiesec.org/opportunities/...`   and prevents
                                                                                             or GraphQL mutation using the logged-in user's unverified API
                                                                                             personal OAuth token) and verifies completion  write failures.
                                                                                             on the next Read-Sync cycle.                   
  ------------------------------------------------------------------------------------------------------------------------------------------------------------

### 12.3 External Workspace & Communication Integrations

1.  **Google Drive Document Vault**: Structured folder hierarchy
    auto-created per Partner
    (`Drive:/ICX_ERP_Vault/Partners/{Org_Name}/Contracts/`) and per EP
    (`Drive:/ICX_ERP_Vault/EPs/{Term}/{EP_Name}_{EXPA_ID}/Visa_and_Standards/`).
2.  **Gmail (`@aiesec.net`)**: 1-click outreach and visa pack emails
    sent via `GmailApp` (Tier 1 GAS) or Gmail API (Tier 2), storing the
    returned `threadId` and `threadUrl` in `communication_logs`.
3.  **Google Calendar**: Automatic event creation with reminders for B2B
    Discovery Meetings, EP Screening Interviews, OP Interviews, Airport
    Pickups, IPS, and Monthly O2Os (`gcal_event_id`).
4.  **WhatsApp Click-to-Chat + Interaction Logger**: Generates
    pre-filled `https://wa.me/{e164_phone}?text={encoded_template}`
    links and opens a 1-click modal to log the outcome into
    `communication_logs` and update `last_ep_contact_at`.

------------------------------------------------------------------------

### 12.4 Research Evidence & Traceability Register (Section 10 Compliance)

Every official source, policy, and artifact inspected during our
autonomous research loops is logged below:

  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Evidence ID     Source Name & Exact Location / URL                                                                                                          Type of Source Date/Version   Key Extracted Facts, Rules & Clauses      Confidence     Unresolved /
                                                                                                                                                                                                                                                     Follow-up
  --------------- ------------------------------------------------------------------------------------------------------------------------------------------- -------------- -------------- ----------------------------------------- -------------- --------------
  **`EVID-01`**   [AIESEC Hub (`hub.aiesec.org`)](https://www.hub.aiesec.org/), [Exchange Hub](https://www.hub.aiesec.org/exchange-hub), [IM                  Official Web   2024--2026     Hub architecture, division into Exchange  **High         Authentic
                  Hub](https://www.hub.aiesec.org/im-hub), [Functional Hub](https://www.hub.aiesec.org/functional-hub)                                        Portal                        Hub (Standards, XPP, Product Academies),  (Verified)**   Drive files
                                                                                                                                                                                            IM Hub, and Functional Hub. Embedded                     accessed
                                                                                                                                                                                            Looker Studio / Google Drive resources                   directly via
                                                                                                                                                                                            require `@aiesec.net` browser session.                   user's Google
                                                                                                                                                                                                                                                     Drive
                                                                                                                                                                                                                                                     (`EVID-02` to
                                                                                                                                                                                                                                                     `EVID-20`).

  **`EVID-02`**   [1.1 AIESEC Exchange Program Policies (AEPP) IPM                                                                                            Official       IPM 2024 (Feb  Full customer-facing policy: 18 Exchange  **100%         None.
                  2024.pdf](https://drive.google.com/file/d/125w_-TIK97RHsHrWvH3jziq8UxPy5w8N/view?usp=drivesdk)                                              Global Policy  2024)          Standards (`1.3.2`), Product Criteria     Verbatim**     
                                                                                                                                                              (Compendium)                  (`3.2`), Selection (`4.2`: \>3 OP                        
                                                                                                                                                                                            rejections rule `4.2.2.1.7`), Approval &                 
                                                                                                                                                                                            Pre-RE (`4.4`: 14d visa/expectation                      
                                                                                                                                                                                            deadline `4.4.3.1`/`4.4.4.1`, 7d/14d EP                  
                                                                                                                                                                                            visa filing `4.4.2.1`, 28d GV / 56d GT                   
                                                                                                                                                                                            cancellation cutoff `4.4.2.3`),                          
                                                                                                                                                                                            Realization (`4.5`: \>2 working days                     
                                                                                                                                                                                            unreachable EP safety rule `4.5.4.11`,                   
                                                                                                                                                                                            extension rules `4.5.2.3`), Complaints                   
                                                                                                                                                                                            (`5.2`), Partly Remote (`Sec. 6`), Fully                 
                                                                                                                                                                                            Remote (`Sec. 7`).                                       

  **`EVID-03`**   [1. Internal AIESEC Portfolio Internal Policies (APIP) Last Update Oct                                                                      Official       EVLM Oct 2024  Full internal policy: Complete (`CO`)     **100%         None.
                  2024.pdf](https://drive.google.com/file/d/1zwQSiWbrSLHPUcCdqkk1KVmK-IBkzOyz/view?usp=drivesdk)                                              Global Policy                 definition (`2.6.3`: 13 Mandatory + ≥3 of Verbatim**     
                                                                                                                                                              (Compendium)                  5 Non-Mandatory), GTa/GTe policies                       
                                                                                                                                                                                            (`5.2`: 7d Account Manager `5.2.2.2.6`,                  
                                                                                                                                                                                            zero EP project/accomm fees `5.2.3.1.4`,                 
                                                                                                                                                                                            Partly Remote ICB audit `5.2.3.1.8`, ≥1                  
                                                                                                                                                                                            yr contract in OP jurisdiction                           
                                                                                                                                                                                            `5.2.4.3.1.2`), GV policies (`5.3`: GV                   
                                                                                                                                                                                            Portfolio mandatory `5.3.2.1`, 70--100%                  
                                                                                                                                                                                            NGO/3rd-party funding `5.3.2.5`, 1 yr max                
                                                                                                                                                                                            advance opening `5.3.4.1`, ±20d RE date                  
                                                                                                                                                                                            tolerance `5.3.5.1`), Crisis reporting                   
                                                                                                                                                                                            within 24h (`5.6.1.12`), Digital                         
                                                                                                                                                                                            Ecosystem & NDA (`5.7`), 3-Stage Case                    
                                                                                                                                                                                            Solving (`6.9`).                                         

  **`EVID-04`**   [Annex 1 - Anti-Harassment and Violence Protocol.pdf](https://drive.google.com/file/d/1gMi44u0aCeDXuKdxWtr0zkt-A3J28VP6/view?usp=drivesdk)  Official       IPM 2024       Harassment categories (A--F), Harassment  **100%         None.
                                                                                                                                                              Policy Annex                  Prevention Committee composition (3--5    Verbatim**     
                                                                                                                                                                                            trained individuals), mandatory 24h                      
                                                                                                                                                                                            investigation start, 7-working-day signed                
                                                                                                                                                                                            PDF final report.                                        

  **`EVID-05`**   [Annex 2 - Compensation Policies & Table.pdf](https://drive.google.com/file/d/1utNAwjhDPAMUwsuLvErSkTaOyF2yi1nZ/view?usp=drivesdk)          Official       IPM 2024       Exact replacement windows (2 wks APD      **100%         None.
                                                                                                                                                              Policy Annex                  Break, 1 wk RE Break), salary delay       Verbatim**     
                                                                                                                                                                                            penalties (7--30d immediate payment,                     
                                                                                                                                                                                            \>30d +2% fine/day, 2 months unpaid =                    
                                                                                                                                                                                            valid RE Break), dismissal compensation                  
                                                                                                                                                                                            (\<70% vs ≥70% duration).                                

  **`EVID-06`**   [Annex 3 - Glossary of Terms.pdf](https://drive.google.com/file/d/1h5sOL0k2mhJj6VsTPqdJQ0ygxoalfLta/view?usp=drivesdk)                      Official       IPM 2024       Official definitions of EXPA statuses     **100%         None.
                                                                                                                                                              Policy Annex                  (`OPEN`, `APPLIED`, `ACCEPTED`,           Verbatim**     
                                                                                                                                                                                            `APPROVED`, `REALIZED`,                                  
                                                                                                                                                                                            `REMOTE_REALIZED`, `FINISHED`,                           
                                                                                                                                                                                            `COMPLETED`), Break statuses                             
                                                                                                                                                                                            (`APPROVAL_BROKEN`, `REALIZATION_BROKEN`,                
                                                                                                                                                                                            `REMOTE_BROKEN`, `FINISHED_EARLIER`),                    
                                                                                                                                                                                            Fake statuses (`Fake Approval`,                          
                                                                                                                                                                                            `Fake Realized`, etc.), and OCA/OCCA.                    

  **`EVID-07`**   [Annex 9 - Official Case Appeal Template.pdf](https://drive.google.com/file/d/1LViXJDF_wX47gFufbp-d4p4bjveLIQtU/view?usp=drivesdk)          Official       IPM 2024       Appeal requirements: 48h leave to         **100%         None.
                                                                                                                                                              Policy Annex                  appeal + 72h appeal template submission;  Verbatim**     
                                                                                                                                                                                            valid grounds for appeal.                                

  **`EVID-08`**   [\[READ ME\] all about exchange standards refreshment                                                                                       Official       2024           Complete 48-slide breakdown of the 2024   **100%         None.
                  (`aies.ec/allabout-esrefresh`)](https://docs.google.com/presentation/d/1OKtCK6XHvwKNzKKIUQEdSkGEKhqbspEjQeboA30zq6I/edit?usp=drivesdk) &    Global         Refreshment    transition from 16 to **18 Exchange       Verbatim**     
                  [#17 Regular Touchpoints](https://docs.google.com/presentation/d/17RFsau6BVK1loWPXgHcNTyKpEEYWKhH4wlyrHapTpjE/edit?usp=drivesdk)            Operational                   Standards**, why #15 (LEAD) and #17                      
                                                                                                                                                              Deck                          (Review Checkpoints) were added, why #3                  
                                                                                                                                                                                            (Insurance) became non-mandatory and #9                  
                                                                                                                                                                                            (First Day of Work) became mandatory, and                
                                                                                                                                                                                            exact Middle vs. Final Survey questions.                 

  **`EVID-09`**   [Global Volunteer Portfolio                                                                                                                 Official       2024--2026     All standardized GV projects across SDG   **100%         None.
                  (`aies.ec/gv-projects-portfolio`)](https://docs.google.com/spreadsheets/d/1TIooseQqGzmkcg36xQges29KxmJUdEa_nHIBbpywxBQ/edit?usp=drivesdk)   Global Product                targets (`3.4`, `4.1`, `4.2`, `4.4`,      Verbatim**     
                                                                                                                                                              Sheet                         `4.6`, `4.7`, `5.1`, `5.5`, `6.b`, `8.3`,                
                                                                                                                                                                                            `8.6`, `8.9`, `10.2`, `11.b`, `12.3`,                    
                                                                                                                                                                                            `12.5`, `12.8`, `13.3`, `14.1`, `14.2`,                  
                                                                                                                                                                                            `15.5`, `16.1`, `17.17`) and EXPA                        
                                                                                                                                                                                            Opportunity Structure.                                   

  **`EVID-10`**   [AIESEC Financial Procedures Manual (AFPM) August                                                                                           Official       Aug 2022       Chart of accounts, accrual accounting,    **100%         None.
                  2022.pdf](https://drive.google.com/file/d/1bsZfRTVLj1lpXEho_Trb8Ey1dGvSTQhs/view?usp=drivesdk)                                              Global Finance                6-month operational reserves              Verbatim**     
                                                                                                                                                              Manual                        (`1.0 ratio`), Direct Exchange                           
                                                                                                                                                                                            Sustainability (`>1.0`), 14-day overdue                  
                                                                                                                                                                                            receivable chasing, dual bank signatures.                

  **`EVID-11`**   [EXPA / GIS API Swagger (`gis-api.aiesec.org/swagger`)](https://gis-api.aiesec.org/swagger) & Indexed GraphQL Queries                       Official       2024--2026     GraphQL endpoint                          **High (Read   Write mutation
                                                                                                                                                              Technical API                 (`https://gis-api.aiesec.org/graphql`),   Schema         permissions
                                                                                                                                                                                            `Opportunity` and `Application`           Verified)**    depend on AI
                                                                                                                                                                                            fragments, OAuth token structure.                        IT OAuth
                                                                                                                                                                                                                                                     scopes
                                                                                                                                                                                                                                                     (`GAP-001`).

  **`EVID-12`**   AIESEC in Rabat Local Strategy, B2B CRM & Technical Prototypes ([LCVP                                                                       Local          2026 (Term     *RIBAT / Amana* philosophy, S1 baseline   **100%         None.
                  Vision](https://drive.google.com/file/d/1g4XOkWmTAh6I80u93NbZg-qRmof-Bavc/view?usp=drivesdk), [MM                                           Committee      26.1 / 26.2)   metrics, 14-day pre-arrival confirmation  Verbatim**     
                  Summit](https://drive.google.com/file/d/1bbg6uqktj7h-__X63T7XwEg0ssfgwgBH/view?usp=drivesdk), [MM                                           Documents                     lock, External vs. Internal MM split, 25+                
                  Selection](https://docs.google.com/presentation/d/1aO702ZjWOpRQ5SdgyyxfCsBt03fj6sSW0WED9e51Lp4/edit?usp=drivesdk), [S1 Closing              (Rabat)                       Rabat/Salé NGO/school leads, Moroccan                    
                  Report](https://docs.google.com/presentation/d/1_BZFmxtlFvIdiWXOEcEvIczSWxaGym-U6lKFwciJ9Zo/edit?usp=drivesdk), [Prospection                                              legal/tax rules (Dahir 1958, Law 09-08,                  
                  Partenaires](https://docs.google.com/spreadsheets/d/1kkmiMJXy3pF4_pl063Z6A89qUrLXCFJXe81mQJWfhDM/edit?usp=drivesdk), [Morocco Partner                                     CGI Art. 57), and GAS V8 + React/Vite                    
                  Analysis](https://docs.google.com/document/d/10B0p6d2MBYWp4bpF13ct4-ABosF4fRCFKu0EglOAbzs/edit?usp=drivesdk), [GAS React+Vite                                             architecture.                                            
                  Research](https://docs.google.com/document/d/1D3jzCh4nWoQQwQuIIgk-Rk4GpF10s0BR3JFcDbVglz0/edit?usp=drivesdk))                                                                                                                      
  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

\<a id=\"deliverable-11\"\>\</a\> \## 13. DELIVERABLE 11: ANALYTICS,
DASHBOARDS & KPI SPECIFICATION

The ERP provides **5 role-specific interactive dashboards** with
explicit mathematical formulas, filters (`Term`,
`Product: iGV/iGTa/iGTe`, `Modality`, `SDG`, `IR Partner`, `Owner`), and
data sources:

  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  KPI Code          Metric Name            Exact Formula / Calculation                                                                                         Target Benchmark (LC Rabat)     Data Source Table(s)          Primary Dashboard
                                                                                                                                                                                                                             & Responsible
                                                                                                                                                                                                                             User
  ----------------- ---------------------- ------------------------------------------------------------------------------------------------------------------- ------------------------------- ----------------------------- -----------------
  **`KPI-EX-01`**   **Full Exchange Funnel `COUNT(DISTINCT application_id)` grouped by `expa_status` (`OPEN`, `APPLIED`, `ACCEPTED`, `APPROVED`, `REALIZED`,   Growth vs. S1 Baseline          `opportunity_slots`,          **Executive
                    Volume (`OPEN → CO`)** `FINISHED`, `COMPLETED`)                                                                                            (`3 OPEN → 15+ OPEN`,           `ep_applications`             Command Center**
                                                                                                                                                               `0 RE → 10+ Flawless RE`)                                     (`LCP`,
                                                                                                                                                                                                                             `LCVP ICX`)

  **`KPI-EX-02`**   **Stage-to-Stage       • `CR(APP→ACC) = COUNT(ACC) / COUNT(APP) * 100``<br>`{=html}•                                                       • `APP→ACC ≥ 35%``<br>`{=html}• `ep_applications`,            **Executive
                    Conversion Rates       `CR(ACC→APD) = COUNT(APD) / COUNT(ACC) * 100``<br>`{=html}•                                                         `ACC→APD ≥ 80%``<br>`{=html}•   `status_history_logs`         Command Center**
                    (`CR%`)**              `CR(APD→RE) = COUNT(RE) / COUNT(APD) * 100``<br>`{=html}• `CR(RE→CO) = COUNT(CO) / COUNT(RE) * 100`                 `APD→RE ≥ 90%``<br>`{=html}•                                  (`LCVP ICX`,
                                                                                                                                                               `RE→CO ≥ 85%`                                                 `MM Internal`)

  **`KPI-EX-03`**   **Average Approval     `AVG(EXTRACT(EPOCH FROM (approved_at - applied_at)) / 86400.0)`                                                     **≤ 7.0 Days** (Visa-Free/AEVM) `ep_applications`             **Internal Engine
                    Velocity                                                                                                                                   / **≤ 10.0 Days** (Embassy)                                   Dashboard**
                    (`Days APP → APD`)**                                                                                                                                                                                     (`MM Internal`)

  **`KPI-EX-04`**   **Lost EPs & Drop-Off  `COUNT(application_id) WHERE expa_status IN ('REJECTED', 'WITHDRAWN', 'APPROVAL_BROKEN')` grouped by                **\< 15% Post-ACC Drop-off**    `ep_applications`             **Internal Engine
                    Root Cause             `rejection_or_break_reason`                                                                                         (Fixing S1's `7/7 Lost EPs`)                                  Dashboard**
                    Distribution**                                                                                                                                                                                           (`LCVP ICX`,
                                                                                                                                                                                                                             `MM Internal`)

  **`KPI-BD-01`**   **B2B Sales Funnel &   `COUNT(deal_id)` per stage; `Win Rate = COUNT(CONTRACT_SIGNED) / COUNT(DISCOVERY_COMPLETED) * 100`                  **Win Rate ≥ 30%**; **≥ 20      `b2b_deals`,                  **External Engine
                    Conversion Rate**                                                                                                                          Outreach/week**                 `communication_logs`          (BD) Dashboard**
                                                                                                                                                                                                                             (`MM External`,
                                                                                                                                                                                                                             `LCVP ICX`)

  **`KPI-BD-02`**   **Partner Slot         `SUM(opportunity_slots.approved_count) / SUM(opportunity_slots.total_openings) * 100`                               **≥ 80% Slot Fill Rate**        `opportunity_slots`,          **External Engine
                    Utilization Rate                                                                                                                                                           `partner_agreements`          & PRM Dashboard**
                    (`%`)**                                                                                                                                                                                                  (`MM External`,
                                                                                                                                                                                                                             `MM Internal`)

  **`KPI-IR-01`**   **IR Partner Supply    `COUNT(RE) per sending_ir_entity_id`; `SLA Score = 100 - (sla_breaches * 10) + (se_standards_compliance_pct * 0.2)` **Top 5 Tier-1 IR Partners      `ir_entities`,                **IR & Matching
                    Contribution & SLA                                                                                                                         supplying ≥ 70% of Approvals**  `ir_slot_allocations`,        Dashboard**
                    Score**                                                                                                                                                                    `ep_applications`             (`MM Internal`)

  **`KPI-CX-01`**   **18 Exchange          Per Standard `s ∈ 1..18`: `COUNT(ep_survey_response == 'YES_FULFILLED') / COUNT(survey_submitted) * 100`            **100% on all 13 Mandatory      `ep_standards_evidence`       **CXP & 18
                    Standards Compliance                                                                                                                       Standards**; **≥ 90% overall**                                Standards
                    Rate (`%`)**                                                                                                                                                                                             Matrix**
                                                                                                                                                                                                                             (`MM Internal`,
                                                                                                                                                                                                                             `LCVP ICX`,
                                                                                                                                                                                                                             `ECB`)

  **`KPI-CX-02`**   **Rabat 14-Day         `COUNT(APD where op_14d_confirmed <= arrival - 14d AND accomm_14d_confirmed <= arrival - 14d) / COUNT(APD) * 100`   **100% (Zero Unconfirmed        `ep_applications`,            **CXP & Logistics
                    Pre-Arrival Lock                                                                                                                           Arrivals)**                     `accommodation_allocations`   Dashboard**
                    Compliance (`%`)**                                                                                                                                                                                       (`MM Internal`,
                                                                                                                                                                                                                             `LCVP ICX`,
                                                                                                                                                                                                                             `LCP`)

  **`KPI-CX-03`**   **14-Day Post-APD Visa `COUNT(APD where he_docs_sent_at <= approved_at + 14d) / COUNT(APD) * 100`                                          **100% (`AEPP 4.4.3.1` Zero     `ep_visa_records`             **CXP & Logistics
                    & Expectation Pack SLA                                                                                                                     Liability)**                                                  Dashboard**
                    (`%`)**                                                                                                                                                                                                  (`MM Internal`,
                                                                                                                                                                                                                             `LCVP ICX`)

  **`KPI-FN-01`**   **AFPM Direct Exchange `SUM(INFLOW_REVENUE where exchange_direct) / SUM(OUTFLOW_DIRECT_EXCHANGE_COST)`                                     **Ratio ≥ 1.25** (Statutory     `financial_transactions`,     **Finance & Legal
                    Sustainability Ratio**                                                                                                                     floor `> 1.0` per `AFPM`)       `invoices`                    (FnL) Dashboard**
                                                                                                                                                                                                                             (`LCVP FnL`,
                                                                                                                                                                                                                             `LCP`,
                                                                                                                                                                                                                             `LCVP ICX`)

  **`KPI-FN-02`**   **Overdue Accounts     `SUM(total_ttc_mad - paid_amount_mad) WHERE CURRENT_DATE > due_date + 14`                                           **0 MAD Overdue \> 14 Days**    `invoices`                    **Finance & Legal
                    Receivable (`>14 Days`                                                                                                                     (`AFPM Sec. 6`)                                               (FnL) Dashboard**
                    MAD)**                                                                                                                                                                                                   (`LCVP FnL`,
                                                                                                                                                                                                                             `LCP`)

  **`KPI-TM-01`**   **Governance & O2O     `Completed Meetings (Team, Core, O2O TL2TM, O2O LCVP2TL, Calibration) / Planned Meetings * 100`                     **≥ 95% Routine Adherence**     `governance_meetings`,        **Team Management
                    Execution Rate (`%`)**                                                                                                                                                     `tasks`                       Dashboard**
                                                                                                                                                                                                                             (`LCVP ICX`,
                                                                                                                                                                                                                             `LCVP TM`, `LCP`)
  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

\<a id=\"deliverable-12\"\>\</a\> \## 14. DELIVERABLE 12: ERP SYSTEM
ARCHITECTURE PROPOSAL

### 14.1 Dual-Tier Architectural Strategy (Tailored to AIESEC in Rabat's Context)

Based on our inspection of AIESEC in Rabat's technical documents ([React
in Apps Script: Cloud-Native
Quality](https://docs.google.com/document/d/1_4_PeIgvftf_nbqhDj1V7yCAnEpl7K8TvJ7GTERpJLU/edit?usp=drivesdk)
and [Elevating AIESEC Rabat CRM to React + Vite within Google Apps
Script](https://docs.google.com/document/d/1D3jzCh4nWoQQwQuIIgk-Rk4GpF10s0BR3JFcDbVglz0/edit?usp=drivesdk)),
we propose a **Shared-Schema Dual-Tier Architecture** where the frontend
(`React 18 + Vite + TypeScript + Tailwind CSS + Zustand + TanStack Query + Zod`)
and domain validation logic are **100% identical**, while the
persistence adapter supports two deployment modes:

    ┌────────────────────────────────────────────────────────────────────────────────────────┐
    │                       PRESENTATION LAYER (CLIENT SPA — MOBILE & DESKTOP)               │
    │   React 18 + TypeScript + Vite + Tailwind CSS ("RIBAT Sanctuary Palette" Design System)│
    │   State & Validation: TanStack Query + Zustand + Shared Zod Domain Schemas (AEPP/APIP) │
    └───────────────────────────────────────────┬────────────────────────────────────────────┘
                                                │ Typed RPC / REST API Client (`apiClient.ts`)
                          ┌─────────────────────┴─────────────────────┐
                          ▼                                           ▼
    ┌───────────────────────────────────────────┐ ┌──────────────────────────────────────────┐
    │ TIER 1: ZERO-COST GOOGLE WORKSPACE MVP    │ │ TIER 2: MULTI-LC NATIONAL SCALE EDITION  │
    │ • Runtime: Google Apps Script (V8 Engine) │ │ • Runtime: Next.js App Router / Node.js  │
    │ • Auth: Session.getActiveUser() (@aiesec) │ │ • Auth: Supabase Auth (Google OAuth)     │
    │ • Concurrency: GAS LockService + Cache    │ │ • Database: PostgreSQL 16 (32 3NF Tables)│
    │ • Database: Normalized Multi-Tab Google   │ │ • Security: Row-Level Security (RLS) +   │
    │   Sheet (32 Tabs matching SQL Schema)     │ │   pgcrypto AES-256 for Law 09-08 PII     │
    │ • Cron: GAS Time-Driven Triggers (15m/1h) │ │ • Cron: pg_cron + Edge Workers           │
    └─────────────────────┬─────────────────────┘ └───────────────────┬──────────────────────┘
                          └─────────────────────┬─────────────────────┘
                                                ▼
    ┌────────────────────────────────────────────────────────────────────────────────────────┐
    │                     EXTERNAL INTEGRATIONS & SYNCHRONIZATION LAYER                      │
    │ • EXPA / GIS GraphQL Read-Sync Worker (`https://gis-api.aiesec.org/graphql`)           │
    │ • Google Drive Vault (Contracts, Visa Packs, 18 Standards Evidence, Annex 1/9 Dockets) │
    │ • Gmail (`@aiesec.net` Outreach & SLA Alerts) + Google Calendar + WhatsApp Deep-Links  │
    └────────────────────────────────────────────────────────────────────────────────────────┘

### 14.2 RIBAT Visual Sanctuary UI Design System (`[LOCAL-RABAT]`)

Incorporating AIESEC in Rabat's [Brand Identity
System](https://docs.google.com/document/d/1_fTL2LRJqllwgfTRAQzlI390-kynKpWO4Am52H3taf4/edit?usp=drivesdk)
and [Calming Color Palette
Research](https://docs.google.com/document/d/1qnHY8rRIi0UhIBuypjjy7vDCWwnRBfXblViToyEkz3c/edit?usp=drivesdk): -
**Primary Brand Accents**: AIESEC Blue (`#037EF3`), iGV Coral
(`#F85A40`), iGTa Teal (`#0CB9C1`), iGTe Orange (`#F48924`). - **RIBAT
Sanctuary Neutrals**: *Kasbah Chaux White* (`#FFFFFF`), *Soft Platinum
Card Backing* (`#F3F4F7`), *Pierre de Salé Sandstone* (`#E6E1D6` ---
used for CXP/Arrival safety panels), *Udayas Indigo* (`#1E3A5F` ---
executive headers), and *Slate Gray Typography* (`#2D3139`, Montserrat
Bold headers + Inter Regular body).

------------------------------------------------------------------------

\<a id=\"deliverable-13\"\>\</a\> \## 15. DELIVERABLE 13: VALIDATION,
COMPLIANCE & TEST CATALOGUE

The table below specifies **25 comprehensive validation and acceptance
test cases (`TEST-001` to `TEST-025`)** covering normal flows, statutory
edge cases, compensation triggers, RBAC security, and data integrity:

  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Test ID          Test Category     Scenario & Input Conditions                       Expected System Behavior & Pass Criteria                               Linked Req /
                                                                                                                                                              Auto
  ---------------- ----------------- ------------------------------------------------- ---------------------------------------------------------------------- ----------------
  **`TEST-001`**   **Auth & APIP 5.7 User logs in with personal `@gmail.com` account   `@gmail.com` login is rejected (`403 Forbidden`); `@aiesec.net` user   `REQ-ICX-121`
                   NDA**             OR `@aiesec.net` account with                     without NDA is redirected to mandatory NDA signature screen before     
                                     `nda_signed_at == NULL`.                          accessing any data.                                                    

  **`TEST-002`**   **Deduplication   BD Member creates a new Organization named        Fuzzy/exact matcher detects existing                                   `REQ-ICX-004`
                   (Org)**           `"M.C.I.S.E Rabat"` or with an existing           `Moroccan Center for Innovation and Social Entrepreneurship (MCISE)`   
                                     `ice_number`.                                     record and prompts merge instead of creating duplicate.                

  **`TEST-003`**   **Discovery       BD Member attempts to move a `b2b_deals` card     Transition blocked with validation error: *"Complete Discovery         `REQ-ICX-013`
                   Gate**            from `MEETING_SCHEDULED` to `PROPOSAL_SENT` with  Questionnaire before sending proposal."*                               
                                     empty `discovery_notes_json`.                                                                                            

  **`TEST-004`**   **Contract 1-Year User uploads a `partner_agreements` record with   System rejects activation (`APIP 5.2.4.3.1.2` requires contract        `REQ-ICX-086`,
                   Validity**        `effective_start_date = 2026-06-01` and           validity ≥365 days) unless an explicit seasonal addendum flag is       `AUTO-004`
                                     `expiration_date = 2026-12-01` (6 months).        approved by LCVP FnL.                                                  

  **`TEST-005`**   **iGV Portfolio & User creates an `iGV` opportunity with            System blocks save and highlights exact `AEPP 3.2.1` violations        `REQ-ICX-021`,
                   Duration**        `duration_weeks = 4` (or `10`),                   (`6–8 weeks`, `25–40h/wk`, mandatory GV Portfolio project).            `REQ-ICX-022`
                                     `working_hours_per_week = 20`, or                                                                                        
                                     `gv_project_id = NULL`.                                                                                                  

  **`TEST-006`**   **iGV 70% Funding User creates an `iGV` agreement where             System blocks activation citing `APIP 5.3.2.5` (minimum 70%--100%      `REQ-ICX-094`,
                   Rule**            `ngo_funder_coverage_pct = 40%` and               covered by NGO/3rd-party funder unless covered by explicit EP project  `AUTO-005`
                                     `ep_project_fee_mad = 0`.                         fee).                                                                  

  **`TEST-007`**   **iGTa/iGTe Zero  User creates an `iGTa` (12 weeks) or `iGTe` (24   System hard-resets `ep_project_fee_mad = 0` (`APIP 5.2.3.1.4`) and     `REQ-ICX-023`,
                   EP Fee & Salary** weeks) opportunity with                           blocks publication until `salary_amount_mad >= living_cost_floor`      `REQ-ICX-024`
                                     `ep_project_fee_mad = 1500` or                    (`AEPP 3.2.2–3`).                                                      
                                     `salary_amount_mad = 0`.                                                                                                 

  **`TEST-008`**   **Partly Remote   User selects `modality_code = 'PARTLY_REMOTE'`    System blocks publication (`AEPP Sec. 6`: min 13 weeks total, remote   `REQ-ICX-025`,
                   ICB Audit**       with `duration_weeks = 8` or                      ≤50%, mandatory ICB audit URL).                                        `AUTO-007`
                                     `remote_duration_weeks = 10` (out of 16) or                                                                              
                                     missing ICB audit proof.                                                                                                 

  **`TEST-009`**   **1-Year Advance  User creates an `opportunity_slots` record with   System blocks save (`APIP 5.3.4.1`: opportunities cannot be opened \>1 `REQ-ICX-026`,
                   Slot Limit**      `start_date = CURRENT_DATE + 400 days`.           year in advance).                                                      `AUTO-009`

  **`TEST-010`**   **7-Day Account   Opportunity remains open for 6 days with          `AUTO-008` fires escalation alert to LCVP ICX on Day 6 and flags APIP  `REQ-ICX-027`,
                   Manager SLA**     `account_manager_user_id = NULL`.                 breach on Day 7.                                                       `AUTO-008`

  **`TEST-011`**   **Post-Approval   Slot has 1 `APPROVED` EP; user tries to lower     Edit is blocked (`AEPP 4.2.1.4` / `4.4.4.4`) unless a signed EP+OP     `REQ-ICX-029`
                   Benefit Lock**    `salary_amount_mad` or set                        variation addendum PDF is uploaded.                                    
                                     `accommodation_provided = FALSE`.                                                                                        

  **`TEST-012`**   **OP \>3          OP rejects a 4th shortlisted candidate who met    `AUTO-012` increments counter to `4`, pauses the opportunity           `REQ-ICX-034`,
                   Rejections        all posted EXPA criteria without valid feedback.  (`PAUSED_SUSPENDED`), and notifies LCVP ICX (`AEPP 4.2.2.1.7`).        `AUTO-012`
                   Suspension**                                                                                                                               

  **`TEST-013`**   **14-Day Post-APD Application is `APPROVED` for 12 days with        `AUTO-015` triggers Red Alert to LCVP ICX & LCP warning that failure   `REQ-ICX-035`,
                   Visa Pack**       `he_docs_sent_at == NULL` (no Invitation Letter   by Day 14 grants EP penalty-free `APD Break` with 100% refund by HE    `AUTO-015`
                                     or Expectation Doc sent).                         (`AEPP 4.4.4.1`).                                                      

  **`TEST-014`**   **EP 14-Day Visa  HE sends visa pack on Day 5 (`he_docs_sent_at`),  `AUTO-016` sets `ep_14d_apply_sla_breached = TRUE`, protecting LC      `REQ-ICX-036`,
                   Filing Breach**   but EP does not apply by Day 20                   Rabat from financial liability if visa is rejected/delayed             `AUTO-016`
                                     (`ep_visa_applied_at == NULL`).                   (`AEPP 4.4.2.1`).                                                      

  **`TEST-015`**   **Rabat 14-Day    Approved EP is at `expected_arrival_at - 13 days` `AUTO-018` triggers Critical Red Alert to LCVP ICX & LCP and blocks    `REQ-ICX-056`,
                   Pre-Arrival       and `accomm_14d_prearrival_confirmed_at == NULL`. Pre-Arrival Clearance.                                                 `AUTO-018`
                   Lock**                                                                                                                                     

  **`TEST-016`**   **Double-Booked   Logistics Coordinator assigns `bed_id = 'BED-01'` Database exclusion constraint rejects allocation (`Standard #7`:       `REQ-ICX-057`,
                   Bed Prevention**  to EP B for `2026-07-01..2026-08-15` when EP A    single bed per EP).                                                    `AUTO-018`
                                     already holds `'BED-01'` for                                                                                             
                                     `2026-06-15..2026-07-30`.                                                                                                

  **`TEST-017`**   **Realization     Member attempts to mark an `iGV` EP `REALIZED`    Transition blocked (`APIP 5.3.5.1` 20-day limit & 2024 Mandatory       `REQ-ICX-037`,
                   Gate & 20-Day iGV when `realized_at` is 25 days after               Standard #9).                                                          `AUTO-020`
                   Rule**            `slot.start_date` OR without Day-1 Accompaniment                                                                         
                                     (`Standard #9`) proof.                                                                                                   

  **`TEST-018`**   **2-Day           Active `REALIZED` EP fails to respond to ping and `AUTO-023` opens `CRITICAL_SAFETY_ALERT` notifying LCVP ICX, LCP, OP,  `REQ-ICX-063`,
                   Unreachable EP    `NOW() - last_ep_contact_at == 49 hours`.         and SE (`AEPP 4.5.4.11`).                                              `AUTO-023`
                   Safety Alert**                                                                                                                             

  **`TEST-019`**   **18 Standards    **Case A**: 13/13 Mandatory = Yes, 3/5            • **Case A** → `is_co_qualified = TRUE` (`COMPLETED`)`<br>`{=html}•    `REQ-ICX-061`,
                   `CO` Formula      Non-Mandatory = Yes.`<br>`{=html}**Case B**:      **Case B** → `FALSE` (missing Mandatory #9)`<br>`{=html}• **Case C** → `REQ-ICX-062`
                   (Pass & Fail)**   12/13 Mandatory = Yes (#9 First Day = No), 5/5    `FALSE` (only 2/5 Non-Mandatory; requires ≥3/5).                       
                                     Non-Mandatory = Yes.`<br>`{=html}**Case C**:                                                                             
                                     13/13 Mandatory = Yes, 2/5 Non-Mandatory = Yes.                                                                          

  **`TEST-020`**   **Annex 2 Salary  `iGTa` EP with `4,000 MAD` monthly salary is      `AUTO-028` computes principal `4,000 MAD` + daily fine                 `REQ-ICX-064`,
                   Delay 2% Fine**   unpaid for `40 days` (`salary_delay_days = 40`).  `4,000 * 0.02 * (40 - 30) = 800 MAD` → Total `4,800 MAD` (`Annex 2`).  `AUTO-028`

  **`TEST-021`**   **Annex 2         **Case A**: EP dismissed without cause at `60%`   • **Case A (`<70%`)**: Calculates 100% reimbursement of flight, visa,  `REQ-ICX-064`
                   Unlawful          of duration.`<br>`{=html}**Case B**: EP dismissed and EP fee.`<br>`{=html}• **Case B (`≥70%`)**: Calculates remaining    
                   Dismissal (60% vs without cause at `80%` of duration.               30% salary + return flight ticket (`Annex 2`).                         
                   80%)**                                                                                                                                     

  **`TEST-022`**   **3-Stage Case    Stage 1 complaint receives no response after      `AUTO-029` transitions case to `STAGE_2_ECB_TO_ECB` and emails ECB     `REQ-ICX-064`,
                   Solving           `72 hours`.                                       Chair with evidence docket (`APIP 6.9`).                               `AUTO-029`
                   Escalation**                                                                                                                               

  **`TEST-023`**   **Harassment      Standard Member or System Admin attempts to view  Access denied (`403 Forbidden`); only LCP, ECB Chair, and designated   `REQ-ICX-064`,
                   Vault RBAC        a `quality_cases` record where                    Harassment Committee members can view; 24h/7d timers active.           `AUTO-030`
                   (`Annex 1`)**     `case_category = 'HARASSMENT_VIOLENCE_ANNEX1'`.                                                                          

  **`TEST-024`**   **AFPM            `LCVP FnL` records an expense voucher and         System blocks self-approval (`AFPM Sec. 5` requires dual control:      `REQ-ICX-095`
                   Dual-Signature &  attempts to self-approve                          e.g., `LCVP ICX` or `LCP` co-approval).                                
                   Ratio Check**     `approved_by_fnl_user_id` with the same                                                                                  
                                     `user_id`.                                                                                                               

  **`TEST-025`**   **Soft Delete &   User attempts to `DELETE` a rejected              Hard delete is blocked (only `is_archived = TRUE` allowed);            `REQ-ICX-009`,
                   Audit             `ep_applications` row or `UPDATE` a row in        `status_history_logs` rejects mutation.                                `REQ-ICX-121`
                   Immutability**    `status_history_logs`.                                                                                                   
  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

\<a id=\"deliverable-14\"\>\</a\> \## 16. DELIVERABLE 14: PHASED
IMPLEMENTATION ROADMAP (AIESEC IN RABAT MVP TO NATIONAL SCALE)

  ------------------------------------------------------------------------------------------------------------------------
  Release Phase  Target         Modules & Capabilities     Dependencies                     Concrete Acceptance Criteria
                 Timeline       Delivered                                                   (Definition of Done)
  -------------- -------------- -------------------------- -------------------------------- ------------------------------
  **Phase 1:     **Weeks 1--3** • **Module L**:            Google Workspace (`@aiesec.net`) 1\. 100% of Rabat's existing
  Foundation,                   `@aiesec.net` Auth, NDA    environment; consolidation of    B2B leads migrated with zero
  B2B Sales                     Gate (`APIP 5.7`), RBAC    existing                         duplicates.`<br>`{=html}2.
  Engine &                      (`MM External`,            `Prospection Partenaires iGV`    System blocks invalid
  Opportunity                   `MM Internal`, `LCVP ICX`, and `Enablers CRM` sheets        iGV/iGTa/iGTe opportunity
  Registry                      `LCVP FnL`, `LCP`),                                         parameters (`TEST-005` to
  (MVP)**                       Immutable Audit                                             `TEST-009`
                                Logs`<br>`{=html}•                                          pass).`<br>`{=html}3. 1-click
                                **Module A & B**: Unified                                   outreach logs directly to
                                Organizations & Contacts                                    `communication_logs` and
                                CRM (pre-loaded with                                        creates `T+3d` tasks.
                                Rabat's 25+ NGO/School                                      
                                leads), Deduplication                                       
                                Engine, 9-Stage B2B                                         
                                Pipeline, 1-Click                                           
                                French/English Outreach,                                    
                                Discovery                                                   
                                Form`<br>`{=html}•                                          
                                **Module H & C**: Contract                                  
                                Vault (≥1 yr check, CGI                                     
                                Art. 57 vs. Mécénat),                                       
                                Opportunity & Slot                                          
                                Registry with hard `iGV`                                    
                                Portfolio / `iGTa` /                                        
                                `iGTe` validation gates                                     

  **Phase 2: IR  **Weeks 4--6** • **Module E**: IR Partner Phase 1 live; EXPA GraphQL       1\. EXPA Read-Sync ingests
  PRM, EP                       Directory (Moroccan Visa   Read-Sync Worker configured      live Rabat applications every
  Matching                      Regime tiers `VISA_FREE`,  (`gis-api.aiesec.org/graphql`)   15 minutes without overwriting
  Funnel &                      `AEVM`, `EMBASSY`), Slot                                    local CRM data.`<br>`{=html}2.
  14-Day                        Allocations, Live Rabat IR                                  14d Visa Pack and 14d
  Pre-Arrival                   Search Tool                                                 Pre-Arrival Lock timers fire
  Locks**                       generator`<br>`{=html}•                                     accurately (`TEST-013` to
                                **Module D**: EP Profiles                                   `TEST-016` pass).
                                (AES-256 encrypted PII per                                  
                                Law 09-08), Full                                            
                                Application State Machine                                   
                                (`OPEN` to `CO`),                                           
                                Matchmaker Engine, 24h                                      
                                Contact SLA, OP \>3                                         
                                Rejections Freeze, 14d                                      
                                Post-APD Visa &                                             
                                Expectation Pack                                            
                                countdown`<br>`{=html}•                                     
                                **Module F**: Global Host                                   
                                Family & Hostel Bed                                         
                                Inventory, **Rabat 14-Day                                   
                                Pre-Arrival Lock**                                          
                                (`AUTO-018`)                                                

  **Phase 3: 18  **Weeks 7--9** • **Module G**: Complete   Phase 2 live; alignment with     1\. `CO` formula accurately
  Exchange                      **2024 Refreshed 18        LCVP FnL and ECB Morocco         distinguishes 13 Mandatory
  Standards                     Exchange Standards**                                        vs. 5 Non-Mandatory standards
  Engine, Case                  tracker (13 Mandatory + 5                                   (`TEST-019`
  Solving & AFPM                Non-Mandatory), Middle &                                    passes).`<br>`{=html}2.
  Finance**                     Final Survey evaluator                                      `Annex 2` calculator and Stage
                                (`CO` formula),                                             1--3 case timers verified
                                Bi-weekly/Monthly #17                                       (`TEST-020` to `TEST-023`
                                Touchpoints, 2-Day                                          pass).`<br>`{=html}3. AFPM
                                Unreachable EP Safety                                       Exchange Sustainability Ratio
                                Alert, 3-Stage Case                                         live on FnL Dashboard.
                                Solving & `Annex 2`                                         
                                Compensation                                                
                                Calculator`<br>`{=html}•                                    
                                **Module I**: AFPM Chart                                    
                                of Accounts, Invoices,                                      
                                14-Day Overdue AR Chaser,                                   
                                Dual-Signature Expense                                      
                                Ledger, Direct Exchange                                     
                                Sustainability                                              
                                Ratio`<br>`{=html}•                                         
                                **Module J & K**:                                           
                                Governance Cadence                                          
                                (`Team`, `Core`, `O2O`,                                     
                                `Calibration`) & 5 Role                                     
                                Dashboards                                                  

  **Phase 4:     **Weeks        • Migration from Tier-1    Phase 3 validated in LC Rabat    1\. Sub-100ms query
  Multi-LC       10--12**       GAS/Sheets adapter to      across at least 1 peak           performance across 10,000+ EP
  National                      **Tier-2                   realization wave                 applications.`<br>`{=html}2.
  Scaling                       Supabase/PostgreSQL 16 +                                    MC Morocco & ECB Morocco can
  (AIESEC in                    Next.js** backend (zero UI                                  audit all LCs from a single
  Morocco)**                    rewrite thanks to shared                                    national command center.
                                TypeScript/Zod                                              
                                client)`<br>`{=html}•                                       
                                Multi-tenancy (`lc_id`                                      
                                Row-Level Security) for                                     
                                all Moroccan LCs (*Rabat,                                   
                                Casablanca, Marrakech,                                      
                                Fès, Tangier, Agadir,                                       
                                Mohammedia, Kenitra*) + MC                                  
                                Morocco & ECB Morocco                                       
                                national rollup views                                       
  ------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

\<a id=\"deliverable-15\"\>\</a\> \## 17. DELIVERABLE 15: RESEARCH GAP
REGISTER & OPEN VERIFICATION BACKLOG

In strict adherence to the research mandate, no rules were invented or
guessed. The table below records the remaining local/technical items
that could not be verified from static files alone, why they remain
open, how the ERP safely handles them today via configuration, and the
exact verification action required:

  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Gap ID          Knowledge Gap / Unresolved    Why It Could Not Be Verified            Safe ERP Design Mitigation           Next Concrete Action to Verify             Priority
                  Question                      Autonomously                            Implemented                                                                     
  --------------- ----------------------------- --------------------------------------- ------------------------------------ ------------------------------------------ ------------
  **`GAP-001`**   **EXPA GraphQL Write Mutation While                                   Implemented the **Read-Sync +        Test an authenticated `@aiesec.net`        **High**
                  Permissions for LC Apps**     `https://gis-api.aiesec.org/graphql`    Human-in-the-Loop Action Outbox      personal token against                     
                                                read queries                            Pattern (`Deliverable 10`)**: ERP    `https://gis-api.aiesec.org/graphql`       
                                                (`GetAllOpportunitiesQuery`,            validates all pre-conditions first,  introspection in the browser console or    
                                                `allOpportunity`) are publicly          provides a 1-click deep-link to      confirm with MC Morocco IM / AI Tech team. 
                                                documented, write mutations             execute the status change on EXPA                                               
                                                (`acceptApplication`,                   under the user's personal                                                       
                                                `approveApplication`,                   `@aiesec.net` session, and verifies                                             
                                                `realizeApplication`) require           the change on the next 15-minute                                                
                                                authenticated OAuth tokens whose write  Read-Sync cycle.                                                                
                                                scopes are controlled by AIESEC                                                                                         
                                                International IT (`APIP 5.7.1.3`).                                                                                      

  **`GAP-002`**   **MC Morocco 2026.2 National  `AFPM` and `APIP` stipulate that exact  Parameterized all fee floors and     Obtain the current                         **High**
                  Exchange Fee Tariff & Entity  EP/OP fee amounts and MC affiliation    splits in a configurable             `MC Morocco 26.2 Financial Tariff Sheet`   
                  Affiliation Fee Split**       splits are annexed to the Member        `mc_fee_tariffs` settings table      from LCVP FnL / MCVP FnL Morocco and       
                                                Committee's national compendium         (editable by `LCVP FnL` and `LCP`    populate `mc_fee_tariffs`.                 
                                                (`MC Morocco Financial Annex`), which   without code changes) while                                                     
                                                was not stored in the local Drive       hard-enforcing the global rules                                                 
                                                folder.                                 (`0 MAD` EP fee on iGTa/iGTe;                                                   
                                                                                        ≥70%--100% NGO/3rd-party coverage on                                            
                                                                                        iGV).                                                                           

  **`GAP-003`**   **Yalla Morocco Portal        External search indexed                 Designed the ERP's IR Search Tool &  Confirm with MCVP iGV / MCVP MKT Morocco   **Low**
                  (`yalla.aiesecmorocco.com`)   `https://yalla.aiesecmorocco.com/`,     Opportunity Pack generator to work   whether `yalla.aiesecmorocco.com` is still 
                  Active Status**               which timed out / blocked automated     standalone (`Deliverable 10`) while  active for 26.2 or superseded by           
                                                crawler access during browsing.         supporting custom external landing   `aiesec.org` (`YOP`).                      
                                                                                        page URLs per opportunity.                                                      

  **`GAP-004`**   **Verified Vetted Inventory   Rabat's prototype sheets (`iGV EP CRM`, Built the `accommodation_providers`, Conduct physical vetting inspections of    **Medium**
                  of Rabat/Salé Global Host     `Logistics & Standards Tracker`)        `accommodation_units`, and           Rabat/Salé hostels (e.g.,                  
                  Families & Partner Hostels**  contained placeholder rows (`Hostel A`, `accommodation_beds` tables with the Médina/Hassan/Agdal) and Global Host       
                                                `Hostel B`, `Apartment 1`) rather than  mandatory `Standard #7` inspection   families and log them into                 
                                                the live vetted address list of         checklist (`single bed`,             `accommodation_providers` before the next  
                                                Rabat/Salé host families and hostels.   `clean water`, `bathroom`,           realization wave.                          
                                                                                        `electricity`) and **14-Day                                                     
                                                                                        Pre-Arrival Lock**.                                                             

  **`GAP-005`**   **Legacy "16 Standards"       Several local Rabat prototype sheets    Upgraded the ERP's entire schema,    Brief the LC Rabat iGV & ICX team during   **Resolved
                  vs. Official "18 Standards"   created in 2026 (`iGV Master Hub`,      checklists, and `CO` evaluator to    the next Department Meeting on the two     in ERP**
                  Local Sheet Alignment**       `EP CRM & Value Delivery`) still had    the authoritative **18 Exchange      added standards (`#15 LEAD` and            
                                                column headers for the old **16         Standards (2024 Refresh)**           `#17 Review Checkpoints`) and the upgraded 
                                                Exchange Standards**, whereas the       (`13 Mandatory + 5 Non-Mandatory`)   Mandatory `#9 First Day of Work`.          
                                                official `EVLM Oct 2024 Compendium`     while providing a                                                               
                                                (`AEPP`/`APIP`) and                     backward-compatible import mapper                                               
                                                `Exchange Standards Refreshment 2024`   for legacy 16-column sheets.                                                    
                                                deck in the user's Drive mandate **18                                                                                   
                                                Exchange Standards**.                                                                                                   
  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

\<a id=\"section-18\"\>\</a\> \## 18. COMPLETE MULTI-STAKEHOLDER DATA
INPUT ("PUT DATA") & FIELD-BY-FIELD TRACKING BLUEPRINT (ZERO MISSING
DETAILS)

### 18.1 Core Design Principle: Multi-Stakeholder Data Input vs. Passive Internal Tracking

A system that only lets internal AIESEC members "track" statuses fails
operationally because critical documents, confirmations, and timestamps
remain trapped in WhatsApp chats, emails, and verbal promises. To ensure
**zero missing details**, the ERP is architected around **8 Stakeholder
Input Channels ("Who Puts What Data & When")**, where every internal and
external stakeholder has structured intake forms, mandatory evidence
uploads, and automated tracking gates:

  -------------------------------------------------------------------------------------------------------------------------
  Stakeholder Category    How They Put Data What They Put Into the System         What the System Tracks & Enforces
                          Into the System                                         Automatically
                          (Input Mechanism)                                       
  ----------------------- ----------------- ------------------------------------- -----------------------------------------
  **1. Exchange           **EP Self-Service Personal identity, passport scan, CV, • Age `18–30` & Passport validity `≥6m`
  Participant (`EP`)**    Onboarding &      emergency contact, dietary/medical    past end date`<br>`{=html}• **7-day**
                          Delivery Portal** conditions, signed Acceptance Note    visa status update & **14-day** visa
                          (Magic-link form  (`AN`), visa application submission   filing timer
                          per stage + EXPA  proof, travel insurance PDF (`#3`),   (`AEPP 4.4.2.1`)`<br>`{=html}•
                          Read-Sync)        flight/train ticket                   **48-hour** unreachable EP safety alarm
                                            (`CMN`/`RBA`/`Agdal`), check-in       (`AEPP 4.5.4.11`)`<br>`{=html}• **18
                                            condition sign-off, bi-weekly/monthly Exchange Standards**
                                            touchpoint answers (`#17`), SDG       (`13/13 Mandatory + ≥3/5 Non-Mandatory`
                                            impact metrics (`MoO`), and issue     for `CO`).
                                            reports.                              

  **2. Opportunity        **B2B Partner     Organization legal registration       • Blocks `>3` unjustified candidate
  Provider (`OP` --- NGO  Portal &          (`Dahir 1958 Récépissé`, `ICE`, `RC`, rejections
  / School / Company)**   Magic-Link Action `Utilité Publique`), multiple contact (`AEPP 4.2.2.1.7`)`<br>`{=html}• Enforces
                          Forms** + BD      persons (`1:N`), Discovery needs,     **≥1-year** contract validity
                          Member Intake     signed Contract/MoU, exact Job        (`APIP 5.2.4.3.1.2`)`<br>`{=html}• Locks
                                            Description (`JD`), candidate         JD, hours, and benefits once an EP is
                                            interview feedback (mandatory if      Approved (`AEPP 4.2.1.4`)`<br>`{=html}•
                                            rejecting an EP per `AEPP 4.2.3.5`),  Fires Red Alert at `T-14d` if OP
                                            **14-Day Pre-Arrival Readiness        readiness is unconfirmed
                                            Sign-off**, Day-1 arrival sign-off    (`[LOCAL-RABAT]`).
                                            (`#9`), weekly EP attendance & hours  
                                            log (`#12`), monthly salary payment   
                                            receipts (`iGTa`/`iGTe`), and Final   
                                            Debrief (`#10b`) + NPS.               

  **3. International      **IR Counterpart  Entity profile, LCVP/TL oGX contacts, • Tracks IR response speed (`hours`) and
  Relations (`IR` /       Portal &          seasonal supply quotas                conversion rate`<br>`{=html}• Enforces
  Sending Entity `SE`)**  Nomination        (`APP / ACC / APD / RE`),             Moroccan visa lead-time compatibility
                          Form** + IR       pre-screened EP nominations, proof of (`14d` Visa-Free vs. `21d` AEVM vs. `45d`
                          Coordinator       **Standard #1 (Personal Goal Setting  Embassy)`<br>`{=html}• Tracks SE
                          Intake            / LDA)**, proof of **Standard #2 (OPS Standards (#1, #2, #3, #18) completion
                                            attendance)**, verification of        rate for `CO`.
                                            **Standard #3 (Insurance)**, SE       
                                            Approval confirmation, and            
                                            post-exchange **Standard #18          
                                            (Reintegration Debrief)** proof.      

  **4. Internal LC Rabat  **Internal        Signed `APIP 5.7` NDA, B2B cold       • Enforces `24h` EP first contact, `7d`
  Team (`BD`, `IR`,       Role-Based ERP    calls/emails, discovery notes,        Account Manager assignment, and `14d`
  `Matching`, `CXP`,      Workspace**       contract approvals, opportunity       post-`APD` Visa Pack
  `FnL`, `TM`, `LCP`)**   (`@aiesec.net`    creation, Host LC interview           delivery`<br>`{=html}• Enforces `AFPM`
                          Google OAuth)     scorecards, Visa Invitation Packs     dual-signature control
                                            (`≤14d`), Expectation Booklets        (`Initiator != Approver`)`<br>`{=html}•
                                            (`#4`), IPS attendance (`#8`), Day-1  Logs every action in an immutable
                                            accompaniment photos (`#9`), LEAD     `audit_logs` table.
                                            session logs (`#15`),                 
                                            bi-weekly/monthly touchpoints         
                                            (`#17`), dual-signed AFPM vouchers,   
                                            and Weekly/Monthly `O2O` coaching     
                                            logs.                                 

  **5. Accommodation      **Host Onboarding Host identity (`CIN`), address, GPS,  • Prevents double-booking the same bed
  Provider                Form &            room & bed inventory, gender rules,   across overlapping dates`<br>`{=html}•
  (`Global Host Family` / Check-In/Out      utility verification photos           Blocks assigning any unvetted or
  `Hostel` /              Digital           (`Single Bed`, `Clean Water`,         non-compliant accommodation`<br>`{=html}•
  `Residence`)**          Sign-Off** +      `Bathroom`, `Electricity` per         Tracks security deposit collection and
                          Logistics         `Standard #7`), house rules, **14-Day refund.
                          Coordinator       Pre-Arrival Bed Lock confirmation**,  
                                            Arrival Check-In Condition & Deposit  
                                            Receipt, and Departure Check-Out &    
                                            Deposit Refund receipt.               

  **6. Transport, Pickup  **Mobile Pickup   Service provider rates (`MAD`),       • Fires alert at `Arrival - 72h` if
  Buddy & Local Service   Mission Checklist Pickup Buddy assignment, written      written pickup instructions are not sent
  Providers**             & Vendor Form**   pickup instructions sent (`≥3d`       (`AEPP 1.3.2.6`)`<br>`{=html}• Links
                                            before arrival per `Standard #6`),    pickup transport receipts directly to
                                            live flight/train tracking            AFPM Direct Exchange Costs.
                                            (`CMN`/`RBA`/`Rabat Agdal`), airport  
                                            pickup photo, Moroccan SIM card       
                                            handover, `MAD` currency exchange     
                                            check, and transport expense voucher. 

  **7. External           **Sponsor &       Corporate CSR sponsor details (`ICE`, • Verifies that `≥70%–100%` of iGV
  Institutions, CSR       Institutional     `RC`), tax regime                     project costs are underwritten when NGO
  Sponsors & Auditors**   Registry Form**   (`CGI Art. 57 Parrainage`             lacks direct budget`<br>`{=html}• Tracks
                          (Managed by EB /  vs. `CGI Art. 10-I-B-2° Mécénat`),    CSR visibility deliverables before
                          MM External)      tripartite sponsored NGO slot mapping issuing final invoice tranche.
                                            (`APIP 5.3.2.5`), sponsorship         
                                            contract & invoice tranches, brand    
                                            visibility deliverables proof, and    
                                            annual external audit reports         
                                            (`AFPM`).                             

  **8. Entity Control     **ECB / ICB       `Partly Remote` opportunity audit     • Runs statutory case clocks
  Board (`ECB Morocco`) & Compliance &      approvals                             (`24h/48h/72h` Stage 1; `48h/96h` Stage
  `ICB`**                 Arbitration       (`aies.ec/partlyremote-auditform`),   2; `48h/5d` Stage 3; `24h/7d`
                          Vault**           internship extension approvals        Harassment)`<br>`{=html}• Tracks 6-month
                                            (`AEPP 4.5.2.3`), Stage 1/2/3 case    (`50%`) and 12-month (`100%`) ICB payout
                                            dockets, `Annex 1` Harassment         deadlines.
                                            Committee investigation reports,      
                                            `Annex 2` compensation calculations,  
                                            and `Annex 9` case appeals.           
  -------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

### 18.2 Exhaustive Field-by-Field Specification for Every Stakeholder & Module

Below is the complete inventory of every field that must be entered
("put") and tracked in the system, grouped by stakeholder module.

#### 1. Opportunity Provider (OP) & B2B Sales Intake Fields (Stakeholder Category #2)

-   **A. Organization Identity & Moroccan Legal Registration**:
    -   `org_id` (System UUID) & `expa_company_id` (EXPA Integer ID,
        optional at lead stage, mandatory once published on POP/EXPA)
    -   `legal_name` (Text, Required) & `trading_brand_name` (Text)
    -   `organization_category` (Dropdown, Required):
        `NGO / Association`, `Foundation`, `Public School`,
        `Private School / Language Institute`, `University / Higher Ed`,
        `Startup`, `SME`, `MNC / Corporate`, `Incubator / Coworking`,
        `Government / Public Agency`
    -   `moroccan_legal_form` (Dropdown, Required):
        `Association Dahir n° 1-58-376 (1958)`,
        `Reconnaissance d'Utilité Publique (Decree)`, `SARL`, `SA`,
        `SAS`, `Auto-Entrepreneur`, `Coopérative`,
        `Public Establishment`
    -   `ice_number` (15-digit Moroccan *Identifiant Commun de
        l'Entreprise* --- Required for companies/schools)
    -   `rc_number` (*Registre de Commerce* number & court city)
    -   `dahir_recepisse_number` (*Récépissé de dépôt définitif /
        provisoire* number & date --- Required for NGOs/Associations)
    -   `legal_registration_doc_url` (File Upload: PDF of *Statuts*,
        *Récépissé Dahir 1958*, or *Modèle J / RC*)
    -   `tax_and_funding_regime` (Dropdown, Required):
        -   `CGI Art. 57 — Commercial Sponsorship / Parrainage (100% Tax Deductible Marketing Invoice)`
        -   `CGI Art. 10-I-B-2° — Charitable Mécénat (Requires Utilité Publique, capped at 0.2% turnover)`
        -   `Standard B2B Partner Service Fee (Contracted OP Fee)`
        -   `Tripartite CSR-Sponsored Host NGO (Funded by 3rd-Party Corporate Partner per APIP 5.3.2.5)`
    -   `city` (`Rabat`, `Salé`, `Temara`, `Kénitra`, `Skhirat`),
        `neighborhood` (e.g., `Agdal`, `Hassan`, `Hay Riad`, `L'Océan`,
        `Médina`, `Souissi`, `Yacoub El Mansour`, `Salé Tabriquet`,
        `Technopolis`), `full_street_address`, `google_maps_pin_url`,
        `nearest_tram_or_bus_stop`
    -   `website_url`, `linkedin_url`, `instagram_url`
    -   `primary_sdg_or_sector` (SDG 1--17 or Professional GTa/GTe
        sector)
    -   `bd_owner_user_id` (Assigned MM External Engine member) &
        `cxp_owner_user_id` (Assigned MM Internal Engine member)
    -   `partnership_health_status` (`Prospect`, `Active Partner`,
        `Renewal Due`, `At Risk`,
        `Suspended — >3 Unjustified Rejections`,
        `Blacklisted — Policy/Safety Breach`)
-   **B. Multi-Contact Directory per Organization (`1:N` Contacts ---
    Never Limited to One Person)**:
    -   `contact_id`, `org_id`
    -   `full_name`, `job_title`, `department`
    -   `stakeholder_role_in_org` (Multi-select):
        `Decision Maker / Signatory`,
        `Direct EP Supervisor / Project Coordinator`,
        `HR / Interviewer`, `Finance & Invoicing Contact`,
        `On-Site Field Mentor`
    -   `is_full_time_employee` (Boolean --- **Hard Gate**: Must be
        `TRUE` for `Direct EP Supervisor` on `iGTa` and `iGTe` per
        `AEPP 3.2.2.d` & `3.2.3.d`)
    -   `direct_email`, `phone_whatsapp_e164` (`+212...`),
        `linkedin_profile`
    -   `preferred_language` (`French`, `English`, `Arabic / Darija`) &
        `preferred_channel` (`WhatsApp`, `Email`, `Phone Call`,
        `In-Person`)
    -   `availability_notes` (Best days/hours to contact)
-   **C. B2B Prospecting, Discovery & Deal Pipeline Fields**:
    -   `deal_id`, `org_id`, `deal_stage` (`NEW_LEAD` → `CONTACTED` →
        `MEETING_SCHEDULED` → `DISCOVERY_COMPLETED` → `PROPOSAL_SENT` →
        `NEGOTIATION` → `CONTRACT_SIGNED` → `ONBOARDED_LIVE` /
        `CLOSED_LOST` / `DISQUALIFIED`)
    -   `lead_source` (`Rabat Market Research Scraping`,
        `Cold Call / Email`, `POP Inbound`, `Partner Referral`,
        `Alumni Network`, `Conference / Event`)
    -   `outreach_log` (Timestamp of First Contact, Outreach Template
        Used, Follow-Up #1 at `T+3d`, Follow-Up #2 at `T+7d`, Follow-Up
        #3 at `T+14d`)
    -   `structured_discovery_notes` (Mandatory before `PROPOSAL_SENT`):
        -   `diagnosed_organizational_need` (What problem are they
            solving?)
        -   `target_products` (`iGV`, `iGTa`, `iGTe`, `Multi-Product`,
            `CSR Sponsor`)
        -   `desired_ep_headcount` & `preferred_realization_window`
            (Summer Peak / Winter Peak / Year-Round)
        -   `workspace_and_equipment_readiness` (Physical desk, Wi-Fi,
            safety verified)
        -   `supervision_plan` (Name & title of full-time supervisor)
        -   `financial_and_accommodation_capacity` (Can OP provide
            accommodation directly, pay OP fee, pay GT salary, or
            require Tripartite CSR funding?)
        -   `objections_raised` (`Budget`, `Visa Lead Time`, `Language`,
            `Accommodation`, `Internal Approval Delay`) &
            `objection_resolution_plan`
        -   `closed_lost_reason` (Mandatory if `CLOSED_LOST` or
            `DISQUALIFIED`)
-   **D. Partner Agreement / Contract (`MoU`) Fields**:
    -   `agreement_id`, `contract_reference_number`
        (`MOU-RBT-YYYY-NNN`), `org_id`, `third_party_funder_org_id` (if
        Tripartite CSR)
    -   `jurisdiction_country` (Fixed: `Morocco` per `APIP 5.2.4.3.1.4`)
        & `contract_language` (`French`, `English`, `Bilingual FR/EN`)
    -   `signed_date`, `effective_start_date`, `expiration_date` (**Hard
        Gate**: `expiration_date >= effective_start_date + 365 days` per
        `APIP 5.2.4.3.1.2`)
    -   `contracted_products_and_slots_breakdown` (Number of `iGV`,
        `iGTa`, `iGTe` openings contracted)
    -   `financial_terms`:
        -   `partner_fee_per_ep_mad`, `total_contract_fee_mad`,
            `payment_schedule_tranches` (e.g.,
            `50% on Signature / Approval`,
            `50% on Arrival / Realization`)
        -   `ngo_or_csr_funding_coverage_pct` (**Hard Gate for iGV**:
            Must be `≥70%–100%` unless covered by explicit EP Project
            Fee per `APIP 5.3.2.5`)
        -   `accommodation_obligation_owner` (`OP Directly Provides`,
            `AIESEC Arranges — Funded by OP`,
            `AIESEC Arranges — Funded by CSR Sponsor`,
            `AIESEC Arranges — Covered by EP Project Fee on EXPA`)
        -   `meals_and_transport_obligation_owner`
        -   `annex_2_cancellation_liability_clause_acknowledged`
            (Boolean --- Mandatory `TRUE`: OP acknowledges 2-week APD
            replacement / 1-week RE replacement and reimbursement
            liability under `AEPP Annex 2`)
    -   `op_signatory_name`, `op_signatory_title`,
        `op_stamp_and_signature_verified` (Boolean)
    -   `lc_signatory_user_id` (`LCVP ICX` or `LCP`) &
        `fnl_co_approver_user_id` (`LCVP FnL` dual control)
    -   `signed_contract_pdf_url` (File Upload Required before any
        Opportunity can be published)

------------------------------------------------------------------------

#### 2. Opportunity & Slot Creation Fields (Module C --- Product-Specific Validation)

-   **A. Core Opportunity Metadata**:
    -   `opportunity_id`, `expa_opportunity_id` (Synced from
        `gis-api.aiesec.org/graphql`), `org_id`, `agreement_id`
    -   `assigned_account_manager_user_id` & `assigned_at` (**Hard
        SLA**: Must be assigned within **7 days** of opening per
        `APIP 5.2.2.2.6`)
    -   `supervisor_contact_id` (Linked to `organization_contacts`;
        verified full-time employee for `iGTa`/`iGTe`)
    -   `product_code` (`iGV`, `iGTa`, `iGTe`) & `modality_code`
        (`PHYSICAL`, `PARTLY_REMOTE`, `FULLY_REMOTE`)
    -   `opportunity_title`, `opportunity_description`
-   **B. Product-Specific Fields & Hard Validation Rules**:
    -   **If `iGV` (Global Volunteer --- `AEPP 3.2.1` & `APIP 5.3`)**:
        -   `gv_portfolio_project_id` (Mandatory selection from the
            official Global Volunteer Portfolio: `Heartbeat [3.4]`,
            `Global Classroom [4.1/4.2/4.6]`, `Youth 4 Impact [4.7]`,
            `Raise Your Voice [5.1/5.5]`, `Clean Water [6.b]`,
            `Skill Up! [8.3/8.6]`, `On The Map [8.9]`, `Equify [10.2]`,
            `Safe Cities [11.b]`,
            `Responsible Consumption [12.3/12.5/12.8]`,
            `Green Leaders [13.3]`, `Aquatica [14.1/14.2]`,
            `Rooted [15.5]`, `Peace [16.1]`, `Scale Up! [17.17]`)
        -   `sdg_goal_number` & `sdg_target_code` (Auto-filled from
            Portfolio)
        -   `moo_impact_indicators_json` (Standardized Measurement of
            Impact metrics to collect during delivery)
        -   `duration_weeks` (**Hard Gate**: `6 to 8 weeks` only)
        -   `working_hours_per_week` (**Hard Gate**:
            `25 to 40 hours/week`)
        -   `ep_project_fee_mad` & `ep_project_fee_breakdown` (Exact
            breakdown of what the fee covers: accommodation, meals,
            pickup)
    -   **If `iGTa` (Global Talent --- `AEPP 3.2.2` & `APIP 5.2`)**:
        -   `gt_professional_field` (Mandatory selection:
            `Business Administration`, `Business Development`,
            `Marketing`, `Finance`, `Information Technology`,
            `Engineering`)
        -   `duration_weeks` (**Hard Gate**: `6 to 78 weeks`)
        -   `working_hours_per_week` (**Hard Gate**:
            `35 to 45 hours/week`)
        -   `ep_project_fee_mad` (**Hard Lock**: Forced to `0 MAD` per
            `APIP 5.2.3.1.4`)
        -   `monthly_salary_mad` & `salary_periodicity` (**Hard Gate**:
            If `duration_weeks > 8`, mandatory salary
            `>= basic_living_cost_mad`; if `6–8 weeks`, either mandatory
            salary OR free accommodation provided)
    -   **If `iGTe` (Global Teacher --- `AEPP 3.2.3` & `APIP 5.2`)**:
        -   `teaching_subject_or_language` (e.g., `English`, `French`,
            `Mathematics`, `Early Childhood`) &
            `target_student_age_group`
        -   `duration_weeks` (**Hard Gate**: `9 to 78 weeks`)
        -   `working_hours_per_week` (**Hard Gate**:
            `35 to 45 hours/week`)
        -   `ep_project_fee_mad` (**Hard Lock**: Forced to `0 MAD`)
        -   `monthly_salary_mad` (**Hard Gate**: Mandatory salary
            `>= basic_living_cost_mad` for full duration)
    -   **If `PARTLY_REMOTE` (`AEPP Section 6` & `APIP 5.2.3.1.8`)**:
        -   `total_duration_weeks` (**Hard Gate**:
            `>= 13 weeks / 3 months`)
        -   `remote_phase_weeks` & `physical_phase_weeks` (**Hard
            Gate**: `remote_phase_weeks <= 0.50 * total_duration_weeks`)
        -   `icb_partly_remote_audit_approval_url` (Mandatory upload of
            ICB approval from `aies.ec/partlyremote-auditform`)
    -   **If `FULLY_REMOTE` (`AEPP Section 7`)**:
        -   `total_duration_weeks` (`6 to 26 weeks`),
            `virtual_workspace_platform` (`Slack`, `Teams`,
            `Google Workspace`), `timezone_overlap_hours`
-   **C. Job Description, Eligibility & Benefits Fields (Locked upon
    First Approval)**:
    -   `job_description_tasks_list` (Minimum 4--6 concrete weekly
        responsibilities)
    -   `required_languages` (Language + CEFR level: `A1`, `A2`, `B1`,
        `B2`, `C1`, `C2`, `Native`)
    -   `required_hard_skills`, `required_academic_background`,
        `preferred_nationalities_or_visa_tiers`
    -   `pre_screen_questions` (3--5 custom screening questions synced
        with EXPA)
    -   `benefits_specification`: `accommodation_provided` (Boolean +
        description), `accommodation_covered_by`,
        `meals_provided_per_working_day` (`0`, `1`, `2`, `3`),
        `transportation_covered` (Boolean), `computer_provided`
        (Boolean)
-   **D. Opportunity Slot Fields (`1:N` Slots per Opportunity)**:
    -   `slot_id`, `expa_slot_id`, `slot_name` (e.g.,
        `Winter Wave 1 — Dec 2026`)
    -   `slot_start_date`, `slot_end_date`, `applications_close_date`
        (**Hard Gate**: `slot_start_date <= CURRENT_DATE + 365 days` per
        `APIP 5.3.4.1`)
    -   `total_openings_count`, `applied_count`, `shortlisted_count`,
        `accepted_count`, `approved_count`, `realized_count`,
        `completed_count`, `available_openings_count`
    -   `unjustified_op_rejections_count` (Counter tracking
        `AEPP 4.2.2.1.7` max 3 unjustified rejections rule)

------------------------------------------------------------------------

#### 3. Exchange Participant (EP) Complete Dossier, Visa & 18 Standards Fields (Stakeholder Category #1)

-   **A. EP Personal Identity, PII & Emergency Contact Fields
    (`ep_profiles`)**:
    -   `ep_id`, `expa_person_id`, `full_legal_name` (as on passport),
        `preferred_name`
    -   `email_address`, `whatsapp_phone_e164`, `secondary_phone`,
        `social_handle`
    -   `date_of_birth` (**Hard Gate**: Age `18 to 30` at application),
        `gender`
    -   `nationality_country` & `country_of_legal_residence` (Crucial
        for Morocco AEVM e-Visa eligibility, which depends on residence
        permits in EU/USA/UK/Schengen as well as nationality!)
    -   `morocco_visa_regime_classification` (Auto-derived +
        adjustable):
        -   `TIER_A_VISA_FREE_90D` (Passport stamp on arrival; min 14d
            prep)
        -   `TIER_B_AEVM_EVISA` (`acces-maroc.ma` electronic visa,
            24h--72h issuance; min 21d prep)
        -   `TIER_C_CONSULAR_EMBASSY_VISA` (Physical embassy appointment
            required; min 45d prep)
    -   `passport_number_encrypted` (**Law 09-08 Confidential PII**),
        `passport_issue_date`, `passport_expiry_date` (**Hard Gate**:
        Must be valid `>= 6 months` after `slot_end_date`),
        `passport_scan_pdf_url`
    -   `cv_resume_pdf_url`, `academic_major_and_university`,
        `languages_spoken_json`, `technical_and_soft_skills_json`
    -   `medical_conditions_allergies_medications_encrypted` (**Law
        09-08 Confidential PII**), `blood_type`, `dietary_restrictions`
        (`Halal`, `Vegetarian`, `Vegan`, `Gluten-Free`, `Nut Allergy`,
        `Lactose Intolerant`, `None`)
    -   `emergency_contact_1_full_name`,
        `emergency_contact_1_relationship`,
        `emergency_contact_1_phone_whatsapp`,
        `emergency_contact_1_email`, `emergency_contact_1_languages`
-   **B. Application, Screening, Interview & Matching Fields
    (`ep_applications`)**:
    -   `application_id`, `expa_application_id`, `ep_id`,
        `opportunity_id`, `slot_id`
    -   `sending_ir_entity_id` (`Home LC` & `Home MC`),
        `se_ogx_poc_name`, `se_ogx_poc_email`, `se_ogx_poc_whatsapp`
    -   `he_ep_manager_user_id` (`Rabat CXP/Matching Owner` --- **Hard
        Gate**: Assigned within `24h` of apply and shared within `7d` of
        `APD` per `AEPP 4.4.4.3`)
    -   `algorithmic_match_score_pct` (`0–100%`)
    -   `expa_status` (`OPEN`, `APPLIED`, `ACCEPTED_BY_HOST`,
        `ACCEPTED`, `APPROVED`, `REMOTE_REALIZED`, `REALIZED`,
        `FINISHED`, `COMPLETED`, `REJECTED`, `WITHDRAWN`,
        `APPROVAL_BROKEN`, `REALIZATION_BROKEN`, `REMOTE_BROKEN`,
        `FINISHED_EARLIER`)
    -   `internal_sub_status` (`AWAITING_FIRST_CONTACT`,
        `CONTACTED_INTERVIEW_BOOKED`, `HOST_SCREENING_PASSED`,
        `SENT_TO_OP_FOR_REVIEW`, `OP_INTERVIEW_COMPLETED`,
        `AWAITING_AN_SIGNATURE`, `AWAITING_PAYMENT_AND_APD`,
        `VISA_DOCS_IN_PREPARATION`, `VISA_SUBMITTED`,
        `14D_PREARRIVAL_LOCKED`, `ARRIVED_IN_RABAT`,
        `ON_PROJECT_ACTIVE`, `DEPARTED_AWAITING_SURVEY`)
    -   `funnel_timestamps`: `applied_at`, `first_contacted_at`
        (`24h SLA`), `host_interview_at`, `shortlisted_at`,
        `op_dossier_sent_at`, `op_interview_at` (`72h SLA`),
        `accepted_by_host_at`, `an_signed_at` (`ACCEPTED`),
        `approved_at` (`APPROVED`), `remote_realized_at`,
        `actual_arrival_at`, `realized_at` (`REALIZED` --- **Hard Gate
        for iGV**: within `±20 days` of `slot_start_date` per
        `APIP 5.3.5.1`), `finished_at` (`FINISHED`), `completed_at`
        (`COMPLETED`)
    -   `host_lc_screening_scorecard_json` (Motivation `1–5`, Cultural
        Adaptability `1–5`, Financial Readiness `1–5`, JD Alignment
        `1–5`, Language Check, Interviewer Notes)
    -   `op_interview_scorecard_json` (OP Supervisor Decision `Accepted`
        / `Rejected`, Technical/Role Fit Notes, Mandatory Written
        Rejection Reason if rejected per `AEPP 4.2.3.5`, Flag:
        `did_ep_meet_all_expa_criteria` for `AEPP 4.2.2.1.7` 3-rejection
        counter)
    -   `signed_acceptance_note_pdf_url` (`AN`),
        `ep_fee_payment_receipt_url` (if applicable)
-   **C. Visa & Post-Approval Legal Pack Fields (`ep_visa_records` ---
    `Standard #5` & `AEPP 4.4`)**:
    -   `visa_pack_deadline_at` (`approved_at + 14 calendar days` per
        `AEPP 4.4.3.1` & `4.4.4.1`)
    -   `official_invitation_letter_pdf_url` (Bilingual FR/EN Invitation
        Letter signed & stamped by OP / AIESEC in Rabat)
    -   `attestation_hebergement_pdf_url` (Official Moroccan
        Accommodation Certificate signed by Host/Hostel/OP)
    -   `op_legal_registration_pack_url` (Copy of OP's Dahir receipt /
        RC attached for embassy/AEVM)
    -   `morocco_registration_procedure_guide_url` (`AEPP 4.4.4.2` local
        police/authority registration instructions)
    -   `written_expectation_setting_booklet_url` (`Standard #4` ---
        Rabat culture, laws, safety, climate, cost of living, dress
        code, project rules)
    -   `he_visa_and_expectation_pack_sent_at` (Timestamp +
        email/WhatsApp proof --- proves HE met the **14-day post-APD
        deadline**)
    -   `ep_visa_status_updated_at` (**Hard Tracker**: Must be
        `<= he_docs_sent_at + 7 days` per `AEPP 4.4.2.1`)
    -   `ep_visa_application_submitted_at` &
        `visa_submission_receipt_url` (**Hard Tracker**: Must be
        `<= he_docs_sent_at + 14 days` per `AEPP 4.4.2.1`; if late, sets
        `ep_visa_delay_liability_shield = TRUE`)
    -   `consular_or_aevm_reference_number`, `embassy_city`,
        `embassy_appointment_date`
    -   `visa_status` (`VISA_FREE_CONFIRMED`, `DOCS_IN_PREP`,
        `PACK_SENT_TO_EP`, `APPLIED_PENDING_DECISION`,
        `ADDITIONAL_DOCS_REQUESTED`, `VISA_GRANTED`, `VISA_REJECTED`)
    -   `granted_visa_or_aevm_pdf_url` &
        `visa_rejection_official_letter_url` (Required to validate a
        penalty-free `APD Break` per `AEPP 4.4.1.b`)
-   **D. Travel, Insurance, Rabat 14-Day Pre-Arrival Lock & Arrival
    Pickup Fields (`Standards #3, #6, #7`)**:
    -   `unavailability_cutoff_date` (`slot_start_date - 28 days` for
        iGV; `slot_start_date - 56 days` for iGTa/iGTe per
        `AEPP 4.4.2.3`)
    -   `travel_insurance_provider`, `insurance_policy_number`,
        `insurance_valid_from`, `insurance_valid_until`,
        `insurance_emergency_hotline`, `insurance_pdf_url`
        (`Standard #3`)
    -   **Rabat 14-Day Pre-Arrival Hard Lock (`[LOCAL-RABAT]`)**:
        -   `op_14d_readiness_confirmed_at`,
            `op_14d_confirmed_by_contact_id`,
            `op_day1_reporting_time_and_location`
        -   `accomm_14d_bed_locked_at`, `assigned_accomm_provider_id`,
            `assigned_bed_id`, `accomm_shared_with_ep_at`
    -   **Arrival & Departure Itinerary (`Standard #6` & `#16`)**:
        -   `arrival_port` (`CMN — Casablanca Mohammed V Airport`,
            `RBA — Rabat-Salé Airport`, `Rabat Agdal Train Station`,
            `Rabat Ville Train Station`, `Tangier Port/Airport`)
        -   `arrival_airline_or_train_carrier`,
            `arrival_flight_or_train_number`,
            `scheduled_arrival_datetime`, `actual_arrival_datetime`
        -   `assigned_pickup_buddy_user_id`,
            `written_pickup_instructions_sent_at` (**Hard Gate**:
            `>= 3 days` before arrival per `AEPP 1.3.2.6`),
            `pickup_completed_at`, `pickup_photo_url`
        -   `moroccan_sim_card_provided` (Boolean + local Moroccan
            number `+212...`), `currency_exchange_assisted` (Boolean)
        -   `departure_flight_or_train_number`,
            `scheduled_departure_datetime`,
            `written_departure_support_sent_at` (**Hard Gate**:
            `>= 14 days` before finish per `AEPP 1.3.2.16`)
-   **E. The 18 Exchange Standards Evidence & Touchpoint Matrix
    (`ep_standards_evidence` & `ep_touchpoints`)**:
    -   For **each of the 18 Standards (`#1` to `#18`)**, the system
        stores:
        -   `standard_number` (`1..18`), `is_mandatory` (`TRUE` for 13
            standards; `FALSE` for 5 standards), `responsible_entity`
            (`SE`, `HE`, `BOTH`), `survey_phase` (`MIDDLE_SURVEY`
            vs. `FINAL_SURVEY`)
        -   `internal_delivery_status` (`NOT_STARTED`, `SCHEDULED`,
            `DELIVERED_VERIFIED`, `BREACHED`, `NOT_APPLICABLE_REMOTE`)
        -   `delivered_datetime`, `delivered_by_user_id`,
            `evidence_file_or_photo_url` (e.g., IPS attendance sheet for
            `#8`, Day-1 photo with OP supervisor for `#9`, Alignment
            minutes for `#10a`/`#10b`, LEAD workshop attendance for
            `#15`)
        -   `expa_survey_answer` (`UNANSWERED`, `YES_FULFILLED`,
            `NO_UNFULFILLED`), `discrepancy_flag` (True if
            `internal_delivery_status == DELIVERED_VERIFIED` but EP
            answered `NO` on EXPA survey)
    -   **Regular Touchpoints & Safety Heartbeat (`Standard #17` &
        `AEPP 4.5.4.11`)**:
        -   `touchpoint_number` (Bi-weekly #1, #2, #3 for iGV; Monthly
            #1..#N for iGTa/iGTe), `touchpoint_date`,
            `conducted_by_user_id`
        -   `ep_wellbeing_and_mood_score` (`1–5`),
            `cultural_integration_notes`
        -   `jd_and_working_hours_check` (`Compliant` /
            `Issue Reported` + actual hours worked this week)
        -   `accommodation_and_living_check` (`Compliant` /
            `Issue Reported`)
        -   `supervision_and_benefits_check` (`Compliant` /
            `Salary/Benefit Delay Reported`)
        -   `moo_sdg_impact_logged` (Number of beneficiaries reached,
            assessments completed, photos uploaded)
        -   `last_verified_ep_contact_timestamp` (**Hard Safety Timer**:
            If
            `NOW() - last_verified_ep_contact_timestamp > 48 hours / 2 working days`
            after a missed ping, triggers
            `CRITICAL_UNREACHABLE_EP_ALERT` per `AEPP 4.5.4.11`)

------------------------------------------------------------------------

#### 4. International Relations (IR) Partner Entity Fields (Stakeholder Category #3)

-   `ir_entity_id`, `expa_lc_id`, `expa_mc_id`, `country_name`,
    `lc_name`, `timezone_utc_offset`
-   `morocco_visa_regime_for_country` (`VISA_FREE_90D`, `AEVM_EVISA`,
    `EMBASSY_PAPER_VISA`) & `minimum_approval_to_realization_lead_days`
    (`14`, `21`, `45`)
-   `partnership_tier` (`TIER_1_STRATEGIC`, `TIER_2_GROWTH`,
    `TIER_3_TACTICAL`, `PROBATION`), `assigned_rabat_ir_owner_user_id`
-   **Multi-Contact IR Directory (`1:N` Contacts per IR LC)**:
    -   `lcvp_ogv_contact` (Name, `@aiesec.net` email, WhatsApp, mandate
        end date)
    -   `lcvp_ogta_ogte_contact` (Name, `@aiesec.net` email, WhatsApp)
    -   `tl_matching_or_ir_manager_contact` (Name, `@aiesec.net` email,
        WhatsApp)
    -   `mcvp_ogx_escalation_contact` (Name, `@aiesec.net` email,
        WhatsApp)
-   **Supply Quota & Performance Fields (Per Term & Peak)**:
    -   `peak_supply_months` (e.g., `June–August`, `December–February`),
        `main_ep_universities_and_profiles`
    -   `committed_quotas`: `target_applications`, `target_acceptances`,
        `target_approvals`, `target_realizations`, `target_completions`
    -   `actual_funnel_counts`: `actual_app`, `actual_acc`,
        `actual_apd`, `actual_re`, `actual_co`, `actual_broken`
    -   `se_standards_delivery_rates`: `% Goal Setting (#1)`,
        `% OPS Delivered (#2)`, `% Insurance Verified (#3)`,
        `% Reintegration Debrief (#18)`
    -   `average_response_time_hours`, `sla_breaches_count`,
        `ir_partnership_health_score` (`0–100%`)
    -   `shared_whatsapp_group_url`, `shared_ir_search_tool_link`,
        `last_ir_call_date`, `next_ir_call_date`,
        `ir_meeting_minutes_log`

------------------------------------------------------------------------

#### 5. Accommodation Providers (Global Host Families, Hostels, Residences) & Bed Inventory Fields (Stakeholder Category #5)

-   **A. Provider & Vetting Checklist Fields (`Standard #7` ---
    `AEPP 1.3.2.7`)**:
    -   `accomm_provider_id`, `provider_name`, `provider_type`
        (`GLOBAL_HOST_FAMILY`, `PARTNER_HOSTEL`,
        `RENTED_AIESEC_APARTMENT`, `OP_DORMITORY`)
    -   `host_primary_contact_name`, `host_cin_or_id_number` (**Law
        09-08 PII**), `host_phone_whatsapp`, `host_email`,
        `host_languages_spoken`, `family_members_and_pets_description`
        (for Global Host Families)
    -   `city` (`Rabat` / `Salé`), `neighborhood`, `full_address`,
        `gps_coordinates`, `commute_distance_and_transit_mode_to_ops`
        (e.g., `10 mins via Tramway L1/L2`)
    -   **Mandatory `Standard #7` Physical Vetting Checklist (Must all
        be `TRUE` + Photo Proof to activate)**:
        -   `has_individual_single_bed_per_ep` (Boolean --- Mandatory
            `TRUE`)
        -   `has_clean_running_water_and_hot_shower` (Boolean ---
            Mandatory `TRUE`)
        -   `has_clean_functional_bathroom` (Boolean --- Mandatory
            `TRUE`)
        -   `has_reliable_electricity_and_lighting` (Boolean ---
            Mandatory `TRUE`)
        -   `has_secure_door_locks_and_safe_neighborhood` (Boolean ---
            Mandatory `TRUE`)
        -   `has_wifi_and_kitchen_or_laundry_access` (Boolean + details)
        -   `inspection_date`, `inspected_by_user_id`,
            `inspection_photos_and_video_folder_url`,
            `signed_host_agreement_pdf_url`
        -   `vetting_status` (`PENDING_INSPECTION`, `VETTED_ACTIVE`,
            `TEMPORARILY_FULL`, `SUSPENDED_QUALITY_ISSUE`,
            `BLACKLISTED`)
-   **B. Room, Bed & Booking Allocation Fields (`accommodation_beds` &
    `accommodation_allocations`)**:
    -   `room_id`, `room_label`, `room_capacity`,
        `gender_allocation_rule` (`FEMALE_ONLY`, `MALE_ONLY`,
        `PRIVATE_SINGLE`), `bed_id`, `bed_code`
    -   `cost_per_night_mad`, `cost_per_month_mad`, `utilities_included`
        (Boolean), `security_deposit_required_mad` (`AEPP 4.2.1.4`)
    -   `house_rules_text` (Curfew, guest policy, quiet hours, kitchen
        usage, smoking/alcohol prohibition)
    -   **Per-EP Bed Allocation Record**:
        -   `accomm_alloc_id`, `application_id` (`ep_id`), `bed_id`,
            `reserved_check_in_date`, `reserved_check_out_date`
        -   `rabat_14d_prearrival_host_confirmation_at` (**Hard Gate**:
            Host confirms bed availability `>= 14 days` before arrival)
        -   `actual_check_in_datetime`,
            `signed_checkin_inventory_and_condition_url`
        -   `deposit_collected_mad`, `deposit_deductions_mad` (with
            damage photo proof if any), `deposit_refunded_mad`,
            `signed_checkout_and_deposit_release_url`

------------------------------------------------------------------------

#### 6. Transport, Pickup Buddies & Local Service Provider Fields (Stakeholder Category #6)

-   **A. Airport / Station Pickup Mission Fields (`Standard #6` ---
    `AEPP 1.3.2.6`)**:
    -   `pickup_mission_id`, `application_id` (`ep_id`), `arrival_port`
        (`CMN`, `RBA`, `Rabat Agdal`, `Rabat Ville`)
    -   `flight_or_train_number`, `scheduled_arrival_datetime`,
        `live_flight_status` (`ON_TIME`, `DELAYED`, `LANDED`)
    -   `assigned_pickup_buddy_user_id`, `backup_pickup_buddy_user_id`,
        `transport_mode` (`ONCF Airport Train + Tram/Taxi`,
        `AIESEC Partner Shuttle`, `Grand Taxi`, `Private Car`)
    -   `written_arrival_guide_sent_to_ep_at` (**Hard Gate**:
        `>= 72 hours / 3 days` before arrival; includes meeting point
        photo, Buddy WhatsApp, emergency numbers, and transit steps)
    -   `ep_picked_up_at`, `sim_card_activated` (Boolean + Moroccan
        phone number), `mad_cash_exchanged` (Boolean),
        `dropped_off_at_accommodation_at`, `arrival_selfie_proof_url`
-   **B. Local Service Providers & Vendors (`service_providers`)**:
    -   `vendor_id`, `vendor_name`, `service_category`
        (`Airport Transfer / Taxi`, `Telecom SIM Partner`,
        `IPS Venue / Coworking`, `Catering / Coffee Break`,
        `Printing & Merchandising`, `Medical Clinic / Doctor on Call`),
        `contact_person`, `phone_whatsapp`, `ice_number`,
        `agreed_unit_rate_mad`, `payment_terms`

------------------------------------------------------------------------

#### 7. External Institutions, CSR Sponsors & ECB/ICB Case Solving Fields (Stakeholder Categories #7 & #8)

-   **A. External Institutions, Sponsors, Legal Advisors & Auditors
    (`external_institutions`)**:
    -   `institution_id`, `organization_name`, `institution_type`
        (`CSR Corporate Sponsor`, `Ministry / Government Authority`,
        `Foreign Embassy / Consulate in Rabat`, `Legal Counsel`,
        `External Chartered Accountant / Auditor`)
    -   `primary_contact_name`, `title`, `email`, `phone_whatsapp`
    -   `sponsorship_tax_classification`
        (`CGI Art. 57 Commercial Sponsorship / Parrainage`
        vs. `CGI Art. 10-I-B-2° Mécénat`), `sponsored_ngo_org_id`,
        `sponsored_slots_count`, `sponsorship_amount_mad`,
        `visibility_deliverables_checklist`, `deliverables_proof_url`
-   **B. Quality Cases, Harassment Vault (`Annex 1`) & `Annex 2`
    Compensation Engine (`quality_cases`)**:
    -   `case_id`, `case_reference_code`, `application_id` (`ep_id`),
        `org_id`, `sending_ir_entity_id`
    -   `complainant_party` (`EP`, `OP`, `HE_RABAT`, `SE_PARTNER`,
        `ECB`) & `respondent_party`
    -   `case_category` (`Visa Delay / Rejection`,
        `Accommodation Substandard (#7)`,
        `Job Description / Hours Breach (#11/#12)`,
        `Salary Delay / Non-Payment (#14)`, `Unlawful Dismissal`,
        `Safety / Unreachable EP >48h`,
        `Harassment / Violence — Annex 1 Confidential`,
        `Fake Status / Compendium Breach — OCCA`,
        `Early Finish / Extension Request`)
    -   `current_escalation_stage` & **Automated Statutory SLA Clocks
        (`APIP 6.9`)**:
        -   `STAGE_1_LC_TO_LC`: `opened_at`, `ack_due_at (+24h)`,
            `solution_reply_due_at (+48h)`,
            `ecb_escalation_due_at (+72h)`
        -   `STAGE_2_ECB_TO_ECB`: `escalated_to_ecb_at`,
            `respondent_ecb_reply_due_at (+48h)`,
            `complainant_ecb_reply_due_at (+48h)`,
            `max_ecb_negotiation_due_at (+96h / 7d)`
        -   `STAGE_3_ICB_OCA_OR_OCCA`: `submitted_to_icb_at`,
            `icb_acceptance_due_at (+48h)`,
            `counter_evidence_due_at (+5d OCA / +3d OCCA)`,
            `icb_binding_ruling_due_at (+5d)`
        -   `URGENCY_EXTRAORDINARY_PROTOCOL`: `48h–72h` direct
            resolution by ECB Chair + ICB Chair (for life in danger, no
            accommodation, or unpaid salary)
        -   `HARASSMENT_COMMITTEE_ANNEX_1`:
            `committee_members_assigned`,
            `investigation_started_at (<=24h)`,
            `ep_relocated_to_safe_housing_at`,
            `signed_final_report_pdf_url (<=7 working days)`
    -   **Replacement & `Annex 2` Financial Compensation Fields
        (`compensation_claims`)**:
        -   `break_type` (`APD_BREAK_BY_EP`, `APD_BREAK_BY_OP`,
            `RE_BREAK_BY_EP`, `RE_BREAK_BY_OP`)
        -   `statutory_replacement_deadline` (`+14 days` for
            `APD Break`; `+7 days` for `RE Break` per `Annex 2`),
            `replacement_ep_or_op_id`, `replacement_offered_at`,
            `replacement_accepted` (Boolean)
        -   `internship_completion_percentage_at_dismissal` (`<70%` =
            100% flight, visa & fee reimbursement; `>=70%` = remaining
            30% salary + return flight ticket per `Annex 2`)
        -   `salary_delay_days` (`7–30 days` = immediate payment;
            `>30 days` = principal + **2% daily fine**
            `salary * 0.02 * (days - 30)`; `>=60 days` = valid
            penalty-free `RE Break`)
        -   `calculated_total_liability_mad`, `liable_entity`,
            `beneficiary_party`,
            `fifty_pct_payment_due_date (+6 months)`,
            `hundred_pct_payment_due_date (+12 months)`,
            `appeal_leave_filed_at (<=48h)`,
            `annex_9_appeal_template_pdf_url (<=72h)`

------------------------------------------------------------------------

#### 8. AFPM Finance, Internal LC Rabat Team & 360° Communication Fields (Stakeholder Category #4 & Modules I, J, L)

-   **A. AFPM Financial Invoicing, Expenses & Sustainability Ledger
    (`invoices` & `financial_transactions`)**:
    -   `invoice_id`, `invoice_number`, `stakeholder_type`
        (`OP_PARTNER`, `CSR_SPONSOR`, `EP_PROJECT_FEE`,
        `SE_COMPENSATION`), `stakeholder_id`, `agreement_id`,
        `application_id`
    -   `afpm_account_code` (`REV-IGV-OP`, `REV-IGV-EP`, `REV-IGTA-OP`,
        `REV-IGTE-OP`, `REV-CSR-ART57`, `COST-ACCOMM`, `COST-PICKUP`,
        `COST-IPS`, `COST-VISA-LEGAL`, `COST-AFFILIATION`,
        `COST-CASE-COMP`)
    -   `amount_ht_mad`, `tva_or_tax_mad`, `total_ttc_mad`,
        `amount_paid_mad`, `balance_due_mad`
    -   `issue_date`, `due_date`, `overdue_days` (**Hard Alert**: Flags
        `OVERDUE_AR_ALERT` at `due_date + 14 days` per `AFPM Section 6`)
    -   `payment_method` (`Bank Wire / Virement`, `Certified Cheque`,
        `Cash Deposit with Receipt`, `International Transfer`),
        `bank_reference_number`, `signed_receipt_or_voucher_pdf_url`
    -   **AFPM Dual-Signature Control (`AFPM Section 5`)**:
        `initiated_by_user_id` (`LCVP ICX` / `MM`) &
        `co_approved_by_fnl_user_id` (`LCVP FnL` / `LCP` --- system
        blocks self-approval)
-   **B. Internal LC Rabat Member Roster & Governance Cadence
    (`internal_users` & `governance_meetings`)**:
    -   `user_id`, `expa_person_id`, `full_name`, `aiesec_email`
        (`@aiesec.net` mandatory), `phone_whatsapp`, `cin_number`
    -   `role_title` (`LCP`, `LCVP iGV`, `LCVP iGTa/iGTe`, `LCVP FnL`,
        `LCVP TM`, `MM External Engine — BD & Partnerships`,
        `MM Internal Engine — Ops, IR & Quality`, `BD Team Member`,
        `IR & Matching Member`, `CXP & Logistics Buddy`,
        `ECB Morocco Auditor`), `mandate_term` (`26.2`)
    -   `apip_5_7_nda_signed_at` & `signed_nda_pdf_url` (**Hard Gate**:
        Zero system access until signed per `APIP 5.7.2.4`)
    -   `assigned_kpis_json` & `active_workload_count`
    -   **Rabat Leadership & Governance Rhythm Logs (`[LOCAL-RABAT]`)**:
        -   `meeting_id`, `meeting_type`
            (`Weekly Team Meeting [MM → Team]`,
            `Weekly Core Meeting [MM → LC Board]`,
            `Bi-Monthly Department Meeting [LCVP → Dept]`,
            `Monthly LCM [EB → LC]`, `Monthly O2O [TL2TM]`,
            `Monthly O2O [LCVP2TL]`,
            `Monthly LCP Calibration [LCP → MMs/EB]`)
        -   `meeting_date`, `leader_user_id`, `attendee_user_ids`,
            `attendance_pct`, `pipeline_and_blockers_notes`,
            `personal_coaching_and_development_goals`,
            `action_items_created_ids`
-   **C. Unified 360° Stakeholder Communication & Audit Feed
    (`communication_logs` & `status_history_logs`)**:
    -   `comm_id`, `stakeholder_category` (`1..8`), `stakeholder_id`,
        `linked_deal_id`, `linked_application_id`, `linked_case_id`
    -   `channel` (`WhatsApp`, `Gmail @aiesec.net`, `Phone Call`,
        `In-Person Meeting`, `Google Meet`, `Standard #17 Touchpoint`,
        `Official Notice`), `direction` (`Outbound` / `Inbound`)
    -   `logged_by_user_id`, `occurred_at`, `subject`,
        `detailed_summary_and_commitments`,
        `gmail_thread_url_or_whatsapp_proof_url`, `next_action_task_id`,
        `next_action_due_date`

------------------------------------------------------------------------

# MASTER SPECIFICATION QUALITY-GATE ADDENDUM

**Purpose:** Close the gaps that prevent this document from being
treated as a fully buildable, testable, secure, and operable ICX ERP
specification.

> **Important interpretation of "100%":** No document can guarantee a
> perfect implementation or a perfect external evaluation. This edition
> defines a measurable **100% specification-completeness target**. The
> target is achieved only when every applicable gate below has evidence,
> an owner, an approval, and passing acceptance tests. Unverified
> policy, legal, API, security, or operational claims must remain
> explicitly open; they must never be marked complete merely because
> they are described here.

## A. Document control and decision log

  -----------------------------------------------------------------------
  Field                               Required value
  ----------------------------------- -----------------------------------
  Document status                     Controlled specification; not proof
                                      of implementation

  Product owner                       LCVP ICX, AIESEC in Rabat

  Business approver                   LCP / delegated LC leadership

  Technical approver                  Named technical lead

  Policy approver                     Named authorised AIESEC policy
                                      owner

  Privacy/legal reviewer              Named qualified reviewer for
                                      Moroccan privacy/legal matters

  Version                             `1.0.0` for the validated baseline;
                                      increment on approved changes

  Review date                         Must be set at approval; do not
                                      infer from file creation

  Source snapshot                     Record source title, owner,
                                      version/date, URL/location,
                                      retrieval date, and checksum where
                                      feasible

  Change control                      Every change records rationale,
                                      impact, author, reviewer, approval,
                                      and effective date
  -----------------------------------------------------------------------

### A.1 Decision register

No unresolved architecture or policy choice may be silently treated as
settled.

  --------------------------------------------------------------------------------
  Decision ID    Decision       Default             Required        Status
                                recommendation      approver        
  -------------- -------------- ------------------- --------------- --------------
  DEC-001        Production     PostgreSQL with     Product +       OPEN until
                 database       managed backups and technical       approved
                                migrations for      owners          
                                production; Sheets                  
                                only as a                           
                                controlled pilot if                 
                                accepted risks are                  
                                documented                          

  DEC-002        System of      EXPA owns official  Product + EXPA  OPEN until
                 record         EXPA statuses and   integration     field matrix
                                IDs; ERP owns       owner           approved
                                internal                            
                                operational                         
                                records; ownership                  
                                is field-level                      

  DEC-003        EXPA write     Human-in-the-loop   Authorised      OPEN pending
                 operations     deep-link/action    AIESEC IT /     evidence
                                outbox unless       policy owner    
                                authorised write                    
                                scopes are                          
                                explicitly approved                 
                                and tested                          

  DEC-004        Personal data  Select only after   Privacy/legal   OPEN
                 hosting        privacy, access,    reviewer        
                                retention,                          
                                transfer, and                       
                                vendor review                       

  DEC-005        National       Disabled until      MC / relevant   OPEN
                 rollout        Rabat pilot release national        
                                gates pass and      authority       
                                national governance                 
                                is approved                         

  DEC-006        Thresholds and Store as versioned  Policy owner    OPEN
                 policy         configuration with                  
                 constants      source and                          
                                effective dates; no                 
                                unreviewed                          
                                hard-coded                          
                                thresholds                          

  DEC-007        Recovery       Define and approve  Product +       OPEN
                 objectives     RPO, RTO,           technical       
                                retention, and      owners          
                                backup frequency                    
                                based on                            
                                operational impact                  
  --------------------------------------------------------------------------------

## B. Epistemic labels: verified facts versus proposed design

Every policy, legal, API, integration, and operational statement must
carry one of these labels in the evidence register:

-   **VERIFIED** --- directly supported by an authoritative source
    captured in the evidence register.
-   **CONFIRMED LOCALLY** --- explicitly confirmed by an authorised
    AIESEC in Rabat owner, with date and evidence.
-   **PROPOSED DESIGN** --- a system design recommendation, not an
    external fact or current capability.
-   **ASSUMPTION** --- temporary premise requiring validation.
-   **OPEN / BLOCKING** --- unresolved and blocks the affected feature
    or release.
-   **NOT APPLICABLE** --- accompanied by a reason and approver.

"Verified" must not be used to describe an entire policy or API merely
because one portion was inspected. Verification applies to the specific
claim and version only. A source URL by itself is not evidence that
every claim in this specification is correct.

### B.1 Evidence record template

Each material rule, threshold, API claim, or legal claim must have a
record containing:

  -----------------------------------------------------------------------
  Field                               Requirement
  ----------------------------------- -----------------------------------
  Evidence ID                         Unique stable identifier

  Claim / rule                        One testable claim per record

  Label                               One of the labels above

  Source                              Exact document, section, endpoint,
                                      or local decision

  Version / effective date            Required where applicable

  Retrieval / confirmation date       Required

  Evidence excerpt or captured        Store a permitted excerpt, export,
  response                            or controlled reference

  Applicability                       Global, national, LC Rabat,
                                      programme, role, or time period

  Owner / reviewer                    Named people or accountable roles

  Test mapping                        Requirement IDs and test IDs that
                                      depend on this claim

  Expiry / review trigger             Policy revision, API schema change,
                                      term transition, or fixed review
                                      date

  Consequence if wrong                Data, safety, legal, financial, or
                                      delivery impact
  -----------------------------------------------------------------------

If a critical claim has no valid evidence record, dependent
functionality must be visibly marked **UNVERIFIED** and must not make
irreversible decisions.

## C. Requirements-to-evidence traceability

Every requirement must be atomic, uniquely identified, testable, and
traceable through design, implementation, testing, and release.

Required fields for each requirement:

`requirement_id`, `title`, `description`, `business_rationale`,
`source/evidence_ids`, `requirement_type`, `priority`, `owner`,
`affected_roles`, `affected_entities`, `preconditions`,
`expected_result`, `failure_behaviour`, `audit_event`, `test_ids`,
`release_phase`, `status`, `approval`.

### C.1 Requirement quality rules

1.  Use **MUST**, **MUST NOT**, **SHOULD**, and **MAY** consistently.
2.  Each requirement describes one behaviour or constraint.
3.  Each requirement has at least one measurable acceptance test.
4.  Each policy-driven requirement links to evidence and a policy owner.
5.  Each integration requirement specifies timeout, retry, idempotency,
    observability, and fallback.
6.  Each personal-data requirement specifies purpose, permitted roles,
    retention, deletion/archival, and audit treatment.
7.  Each blocking validation specifies whether it is an official-policy
    gate, local operational gate, warning, or configurable rule.
8.  Requirements that are not implemented must not be labelled complete.
9.  Conflicting requirements are resolved through the decision log, not
    silently merged.
10. A requirement is "done" only when implementation, tests, evidence,
    documentation, and approval are complete.

### C.2 Definition of specification completeness

A requirement is complete only if all applicable fields above are
populated and reviewed. The specification is at 100% completeness only
if:

-   all in-scope requirements are inventoried;
-   all critical requirements have approved evidence or are explicitly
    excluded from the release;
-   all requirements map to tests;
-   all blocking decisions are resolved for the intended release;
-   all known gaps have owners, due dates, and consequences;
-   no claim of implemented capability is made without implementation
    evidence.

This measures specification completeness, not the quality of a future
implementation.

## D. Explicit system-of-record and data ownership contract

The ERP must maintain a field-level source-of-truth matrix. Ownership is
assigned to a field or field group, not vaguely to an entire record.

  -----------------------------------------------------------------------------
  Data domain       Authoritative     ERP behaviour           Conflict rule
                    source                                    
  ----------------- ----------------- ----------------------- -----------------
  Official EXPA     EXPA              Read, timestamp, retain EXPA value wins
  entity IDs and                      source metadata, expose for the mapped
  official EXPA                       sync health             official field
  statuses                                                    

  Internal EP       ICX ERP           Write with author,      ERP owns internal
  follow-up,                          timestamp, purpose, and fields
  touchpoints,                        audit event             
  local readiness                                             
  and case notes                                              

  Partner           ICX ERP           Manage locally with     ERP owns
  prospecting and                     deduplication and       
  discovery notes                     change history          

  Signed contract   Approved document Store protected         Approved signed
  file and approval repository plus   reference, version,     version is
  metadata          ERP metadata      signer/approval state;  retained;
                                      do not expose public    superseding
                                      links                   versions are
                                                              linked

  Opportunities and Split ownership   Separate official EXPA  Never overwrite
  slots             by field          values from internal    one with the
                                      planning/readiness      other
                                      values                  

  Standards         ERP evidence      Store evidence          Keep claims and
  evidence          record; official  reference, status,      internal proof
                    survey response   reviewer and provenance distinct
                    remains in                                
                    EXPA/YOP where                            
                    applicable                                

  Finance records   ERP only where    Permission-controlled   Finance owner
                    authorised by     ledger and approvals    approval required
                    governance                                

  Integration       ERP integration   Append-only event       Reprocess
  events and sync   subsystem         history and checkpoints idempotently;
  checkpoints                                                 preserve previous
                                                              result
  -----------------------------------------------------------------------------

Every imported field must record, where technically possible:
`source_system`, `source_record_id`, `source_updated_at`, `synced_at`,
`sync_run_id`, `payload_hash`, and `mapping_version`.

### D.1 Conflict and reconciliation rules

-   Never silently overwrite local notes, evidence, contracts, or
    internal statuses during an EXPA sync.
-   Detect stale, missing, duplicate, malformed, and conflicting
    records.
-   Display last successful sync, last attempted sync, current lag, and
    last error.
-   Provide a permission-controlled reconciliation queue.
-   Require a human decision for ambiguous identity matches and
    high-impact conflicts.
-   Preserve the old value, new value, actor/process, timestamp, and
    reason for material corrections.
-   CSV/manual imports must use the same validation, deduplication,
    provenance, and audit rules as API imports.

## E. Architecture and data-integrity contract

### E.1 Environment separation

Maintain separate development, test/staging, and production
environments. Production personal data must not be copied into
development or test unless a specifically approved, minimised, protected
process permits it. Prefer synthetic or irreversibly anonymised
fixtures.

### E.2 Production baseline

For a multi-user, multi-LC production system, use a transactional
relational database (recommended: PostgreSQL) with versioned migrations,
automated backups, monitored restore capability, and server-side
authorization. A Google Sheets / Apps Script pilot is acceptable only
when its constraints are explicitly accepted and the pilot is restricted
to suitable low-risk data and workflows.

Do not claim relational integrity, row-level isolation, transaction
safety, or immutable auditability unless the chosen platform actually
enforces the property and tests demonstrate it.

### E.3 Required integrity constraints

At minimum:

-   Stable primary keys; foreign keys for relationships; unique
    constraints for external IDs and defined business keys.
-   Explicit nullability, valid ranges, controlled enums, timezone-aware
    timestamps, and currency codes.
-   Database-level constraints for critical invariants where supported.
-   Optimistic concurrency/version checks for competing edits.
-   Atomic transactions for multi-record business changes.
-   Idempotency keys for repeatable integration jobs and event handlers.
-   Soft deletion only where retention rules permit it; deletion/erasure
    workflows must be designed separately.
-   A documented migration and rollback strategy.
-   Schema migration tests against a copy of representative data.
-   No direct production database changes outside controlled migrations
    or approved administrative procedures.

### E.4 Tenant and LC isolation

If multiple LCs are enabled, every tenant-scoped record must have a
validated tenant/LC ownership path. Authorization must be enforced
server-side on every read, write, export, file access, search, report,
and background job. Client-side filtering is not a security boundary.

Acceptance tests must attempt cross-LC access through direct API
requests, guessed identifiers, exports, search, file URLs, background
tasks, and cached responses. All unauthorised cross-tenant attempts must
be denied and logged without disclosing the existence of protected
records.

## F. Security, privacy, and document protection

This section is a required engineering and governance baseline, not a
legal opinion or proof of compliance.

### F.1 Identity and access

-   Use an approved identity provider and enforce individual accounts;
    no shared accounts or shared OAuth tokens.
-   Enforce least privilege and server-side RBAC for each action, not
    merely each page.
-   Require appropriate authentication strength for privileged roles;
    define session expiry, revocation, account deactivation, and
    role-change behaviour.
-   Re-authorise sensitive operations at execution time.
-   Use a controlled break-glass procedure with reason, time limit,
    alerting, and review.
-   Review access at each term transition and immediately after role
    departure.
-   Apply separation of duties to financial approval, contract approval,
    policy configuration, and user administration where practical.

### F.2 Secrets and integration credentials

-   Keep secrets out of source code, client bundles, Sheets cells, logs,
    screenshots, and prompts.
-   Use an approved secret manager or platform-native protected
    configuration.
-   Scope credentials narrowly, rotate them, revoke them promptly, and
    document incident handling.
-   Use individual OAuth credentials only when allowed by the relevant
    platform rules.
-   Never attempt unsupported or unauthorised EXPA mutations.
-   Redact tokens, passport details, and other sensitive values from
    logs and error reports.

### F.3 Personal and sensitive data

Before production use, a qualified reviewer must approve a data
inventory and privacy assessment covering purpose, lawful basis where
applicable, minimisation, access, retention, deletion, data-subject
requests, vendor processing, transfers, breach response, and applicable
Moroccan Law 09-08 / CNDP requirements. Do not treat this document as a
substitute for legal review.

-   Collect only fields required for a defined ICX purpose.
-   Avoid collecting passport/visa scans unless a documented process
    requires them.
-   If collected, keep them in a protected document repository with
    short-lived authorised access and access logging.
-   Do not place sensitive personal data in WhatsApp messages,
    general-purpose logs, URLs, analytics tools, or broad team exports.
-   Define retention periods by data category and purpose; legal holds
    and approved exceptions must be explicit.
-   Make exports permission-controlled, logged, minimised, and, where
    appropriate, watermarked.
-   Establish a documented incident triage, containment, notification,
    and recovery procedure.

### F.4 Audit records

Audit events must be append-only to ordinary users and administrators.
Where the platform permits, protect logs from alteration through
separate permissions, immutable/WORM storage or tamper-evident chaining,
and external retention. "Immutable" must not be claimed solely because
the UI does not expose an edit button.

Required audit fields: event ID, timestamp, actor/service identity,
action, object type/ID, tenant/LC, outcome, reason, correlation ID, and
changed-field summary. Avoid logging sensitive field values
unnecessarily.

## G. Complete lifecycle state-machine contract

Every state machine must be specified in a transition table and
implemented as an explicit domain service, not as scattered UI
conditionals.

Required transition fields:

`entity_type`, `from_state`, `to_state`, `trigger`, `actor_role`,
`preconditions`, `required_evidence`, `side_effects`, `notifications`,
`audit_event`, `retry/idempotency`, `reversal/compensation`,
`failure_behaviour`, `test_id`, `policy/evidence_reference`.

### G.1 Required lifecycle coverage

Specify separate state machines, as applicable, for:

-   B2B partner prospecting and contracting.
-   Opportunity and slot creation, review, publication, capacity,
    closure, and archival.
-   IR relationship, eligibility, and opportunity-sharing workflow.
-   EP application and official EXPA status synchronisation.
-   Internal EP readiness, communication, matching, and arrival
    preparation.
-   Accommodation and transport assignment.
-   Exchange delivery and standards evidence.
-   Safety incident and safeguarding case handling.
-   Contract version, review, signature, expiry, and renewal.
-   Finance item, approval, payment evidence, reconciliation, and
    closure.
-   Integration job, failed event, retry, reconciliation, and manual
    recovery.
-   User lifecycle, role assignment, access revocation, and tenant
    membership.

Official EXPA states and internal operational states must remain
separate. The ERP must not create or imply fake official statuses. A
user-facing label must clearly distinguish official status from internal
readiness.

### G.2 Edge cases required in tests

Cover rejection, withdrawal, cancellation, no-show, late arrival, early
finish, remote/partly remote exchange, failed matching, slot change,
host cancellation, accommodation failure, emergency relocation, disputed
survey, missing evidence, duplicate import, out-of-order sync, API
outage, role revocation mid-task, and corrected historical data.

For every irreversible or high-impact transition, define who may approve
it, what evidence is required, whether it can be reversed, and how
compensation is performed if a later step fails.

## H. Integration reliability specification

### H.1 EXPA / GIS adapter

The adapter must treat live API capabilities and permissions as
externally governed. Query names and fields must be checked against
current official documentation and actual authorised test responses
before implementation. API access observed during research does not
prove the production account has the same scopes or rate limits.

Required behaviours:

-   Read-only integration by default until write permissions are
    explicitly authorised.
-   Pagination, rate-limit handling, timeouts, bounded retries with
    exponential backoff and jitter.
-   Idempotent upserts and stable external IDs.
-   Schema-drift detection and alerting.
-   Per-run counts: fetched, created, updated, unchanged, rejected,
    duplicate, and failed.
-   Checkpointing and resumable jobs.
-   Dead-letter/error queue for records that repeatedly fail.
-   Manual sync with permission checks and rate limiting.
-   Last successful sync and lag visible to authorised users.
-   Safe reconciliation of deletes, archived records, missing records,
    and stale records.
-   No automatic destructive action on absence from a partial or failed
    response.
-   Contract tests using approved fixtures and integration tests against
    an authorised non-production account where available.

### H.2 Action outbox

Each proposed EXPA action must record `action_id`, entity, intended
action, requester, validation results, policy/evidence references,
deep-link, created/expiry times, action status, and read-back
confirmation.

Outbox states: `DRAFT`, `BLOCKED`, `READY_FOR_HUMAN`,
`OPENED_EXTERNALLY`, `AWAITING_READBACK`, `CONFIRMED`, `EXPIRED`,
`CANCELLED`, `FAILED`, `NEEDS_REVIEW`.

Opening a deep-link is not proof that an action succeeded. The action
becomes `CONFIRMED` only after an authorised read-back or explicit
reviewed evidence. No service account or automated browser action may
bypass platform policy.

### H.3 Notifications and external services

For email, calendar, messaging links, and file storage, specify
permission scopes, recipient confirmation, template version, delivery
status, provider error handling, retry rules, duplicate suppression, and
audit events. A WhatsApp click-to-chat link is a convenience link, not
an API integration or proof that a message was sent.

## I. Automation and SLA safety

Every automation must define:

-   Trigger event and schedule.
-   Preconditions and source of truth.
-   Owner and affected roles.
-   Due-time calculation, timezone, working-day/calendar rules.
-   Idempotency and duplicate suppression.
-   Retry, cancellation, pause, and resume behaviour.
-   Notification channels and escalation ladder.
-   Human override and reason capture.
-   Audit record and monitoring metric.
-   Test cases for boundaries, daylight/timezone effects where relevant,
    missing dates, changed dates, and duplicate events.

High-impact safety, eligibility, compensation, legal, or financial
outcomes must not rely on an unverified hard-coded threshold. Rules must
be versioned, evidence-linked, configurable by authorised owners, and
reviewed by a human when false positives or false negatives could
materially harm a person or the organisation.

### I.1 Threshold register

Any numeric threshold, including compensation floors, SLA windows,
rejection counts, pre-arrival deadlines, financial ratios, or retention
periods, must have a register entry:

`threshold_id`, `name`, `value`, `unit`, `scope`, `effective_from`,
`effective_to`, `source/evidence_id`, `owner`, `approver`,
`last_reviewed_at`, `change_reason`, `dependent_requirements`,
`dependent_tests`.

If source verification is pending, the threshold must be marked
`PROVISIONAL`; it cannot trigger an irreversible policy decision.

## J. UX, accessibility, and operational adoption

Each module must have a screen inventory and user-flow specification
before being considered build-ready.

For each screen/flow, document:

-   Primary user and task.
-   Entry point, preconditions, and exit condition.
-   Required fields and validation rules.
-   Empty, loading, success, partial-success, and error states.
-   Permission-denied and stale-data states.
-   Mobile/responsive behaviour.
-   Keyboard and screen-reader accessibility expectations.
-   Bulk operations and confirmation requirements.
-   Search, filtering, sorting, pagination, and saved-view behaviour.
-   Audit and undo/compensation behaviour.
-   Help text and onboarding guidance.
-   Acceptance tests tied to requirements.

### J.1 Minimum usability validation

Before a release is accepted, test representative tasks with actual
users from relevant roles: MM External, MM Internal, LCVP ICX, LCVP FnL,
LCP/approver, and other in-scope roles. Include mobile use where
relevant.

Record task completion, critical errors, time-to-complete, user-reported
confusion, and remediation. Do not declare the system usable solely
because developers can complete a demo.

## K. KPI and analytics contract

Each KPI must have a formal definition and a data-quality rule.

Required fields:

`kpi_id`, `name`, `business_question`, `formula`, `numerator`,
`denominator`, `inclusion_rules`, `exclusion_rules`,
`cohort_definition`, `time_window`, `attribution_rule`, `source_fields`,
`refresh_frequency`, `late_data_rule`, `owner`, `target`,
`target_rationale`, `data_quality_checks`.

Examples that require precise definitions include conversion by funnel
stage, time to first contact, time to match, opportunity fill rate,
arrival readiness, standards completion, partner retention, cancellation
rate, EP satisfaction, revenue/cost measures, and workload distribution.

Targets must be based on approved strategy or a measured baseline. If a
baseline is not available, label the target `PROVISIONAL`; do not
present an arbitrary target as an evidence-based benchmark. Dashboards
must expose data freshness, missingness, and denominator changes.

## L. Testing and release acceptance

### L.1 Required test layers

1.  Unit tests for business rules and state transitions.
2.  Database constraint and migration tests.
3.  API contract tests.
4.  Integration tests for EXPA sync, email/calendar/file services, and
    action outbox.
5.  End-to-end tests for critical role workflows.
6.  RBAC and tenant-isolation tests.
7.  Security tests covering authentication, authorization, session
    handling, injection, upload handling, secrets, and exports.
8.  Privacy tests for data minimisation, access, retention, deletion,
    and logs.
9.  Accessibility and responsive UI checks.
10. Backup restore and disaster-recovery exercises.
11. Performance tests using realistic, non-sensitive synthetic data.
12. User acceptance tests signed off by operational owners.

### L.2 Release gates

  -----------------------------------------------------------------------
  Gate                    Required evidence       Pass condition
  ----------------------- ----------------------- -----------------------
  G0 --- Scope and        Approved scope, owners, No unresolved decision
  governance              decisions, risks        blocks the planned
                                                  release

  G1 --- Policy and legal Evidence register and   Critical policy/legal
                          reviewer approvals      claims verified or
                                                  feature disabled

  G2 --- Data and         Schema, ownership       Integrity and isolation
  architecture            matrix, migrations,     tests pass
                          backup plan             

  G3 --- Security and     Threat model, access    No unresolved
  privacy                 matrix, privacy review, critical/high-risk
                          security tests          findings without
                                                  formally approved
                                                  mitigation

  G4 --- Core workflows   State machines,         All critical paths and
                          requirements, test      edge cases pass
                          results                 

  G5 --- Integration      API contract, sync      No silent data loss;
                          observability, recovery failure modes visible
                          tests                   and recoverable

  G6 --- User acceptance  Task-based test records Critical tasks
                          and sign-off            completed without
                                                  unresolved blocking
                                                  usability defects

  G7 --- Production       Monitoring, runbooks,   Operational owner
  readiness               backup/restore,         confirms readiness
                          rollback                

  G8 --- Pilot exit       Pilot metrics, incident Exit criteria met and
                          review, reconciliation  rollout approved
                          report                  

  G9 --- National scale   Tenant-isolation,       Explicit national
                          governance, capacity,   approval; no automatic
                          support and onboarding  expansion
                          plan                    
  -----------------------------------------------------------------------

A failed gate blocks the release or disables the affected capability. A
risk may be accepted only by an authorised owner, with rationale,
mitigation, expiry/review date, and affected release documented.

### L.3 Defect severity

-   **Critical:** safety/security breach, cross-tenant disclosure,
    unauthorised official status mutation, material corruption, or
    inability to recover core records. Block release.
-   **High:** major workflow broken, sensitive data improperly exposed,
    or material reporting/financial error. Block release unless an
    authorised exception and safe workaround are documented.
-   **Medium:** important friction with workaround. Track with owner and
    due date.
-   **Low:** minor visual/content issue. Track in backlog.

## M. Reliability, operations, and support

Before production, publish an operations handbook with:

-   Service ownership and escalation contacts.
-   Availability expectations and maintenance windows.
-   RPO/RTO approved by owners.
-   Backup schedule, retention, encryption, and restore test evidence.
-   Monitoring and alerts for sync lag, failed jobs, queue age,
    notification failure, error rate, latency, storage, and
    authentication anomalies.
-   Incident classification, communication, containment, recovery, and
    post-incident review.
-   Data correction and reconciliation procedure.
-   Migration, rollback, and emergency-disable procedure.
-   Dependency inventory and vendor/API outage fallback.
-   Term handover and access-revocation checklist.
-   User support process, known limitations, and service-status
    communication.
-   Data export and controlled exit plan if a vendor/platform is
    discontinued.

A backup is not proven until a restore has been tested. A retry
mechanism is not proven until repeated failures, duplicate delivery, and
recovery have been tested.

## N. Implementation plan and realistic delivery control

The existing phase roadmap should be treated as a proposed sequencing
model, not a guaranteed calendar. Delivery dates must be estimated after
requirements, dependencies, team capacity, and acceptance tests are
agreed.

For each work item, track:

`work_id`, `requirement_ids`, `owner`, `reviewer`, `dependencies`,
`estimate`, `priority`, `risk`, `environment`, `test_ids`,
`definition_of_done`, `rollback_plan`, `status`.

### N.1 Mandatory delivery practices

-   Build one vertical slice at a time: UI, server logic, data model,
    permissions, audit, tests, monitoring, and documentation.
-   Keep changes in version control with reviewed pull requests.
-   Run automated tests and static checks on every change.
-   Use reviewed database migrations and seeded synthetic test data.
-   Maintain a feature flag or safe-disable mechanism for risky
    integrations.
-   Never claim completion from generated code alone; require tests and
    review.
-   Demo to actual users at each milestone and feed findings into the
    backlog.
-   Re-estimate after the first working slice; do not preserve an
    unrealistic date merely because it appears in the initial roadmap.

## O. Pilot definition and exit criteria

The first production pilot should be limited to AIESEC in Rabat and
explicitly selected users, data categories, and workflows.

### O.1 Pilot success measures

Approve baseline and targets before the pilot. At minimum measure:

-   Percentage of active records with valid owner and required fields.
-   Duplicate rate and reconciliation error rate.
-   EXPA sync success rate and p95 sync lag.
-   Percentage of failed sync records recovered without data loss.
-   Completion rate for critical partner and EP workflows.
-   SLA completion and overdue task rate.
-   Standards evidence completeness.
-   User task completion and critical error rate.
-   Security/privacy incidents and near misses.
-   User adoption by role and weekly active use.
-   Time spent on duplicate manual data entry before versus after the
    pilot.

Do not set unsupported numeric targets. Each target must have a
baseline, measurement window, owner, and approval.

### O.2 Pilot exit criteria

The pilot may expand only when:

1.  All critical and high-severity defects are resolved or formally
    accepted by an authorised owner.
2.  No unresolved cross-LC access path exists.
3.  Core lifecycle and edge-case tests pass.
4.  EXPA sync is observable and reconciliation has been exercised.
5.  Backup restoration and rollback have been demonstrated.
6.  Users complete critical tasks in acceptance testing.
7.  Data ownership, retention, support, and access revocation procedures
    are operational.
8.  Metrics meet approved targets for the agreed observation period.
9.  Product, technical, operational, and policy owners sign the exit
    record.

## P. Risk register

Every risk must have an owner, likelihood, impact, mitigation,
contingency, review date, and residual-risk decision.

Minimum risks to assess:

-   Incorrect or outdated global policy interpretation.
-   Unverified local rule or numeric threshold.
-   API schema, scope, rate-limit, or authentication change.
-   Silent partial sync or duplicate processing.
-   Sensitive data exposure or excessive retention.
-   Incorrect permissions or cross-LC access.
-   Inaccurate or unauthorised official status changes.
-   Host cancellation, accommodation failure, or safety incident.
-   Loss of key staff at term transition.
-   Overreliance on one maintainer or undocumented scripts.
-   Vendor/platform outage or account suspension.
-   Budget, capacity, and timeline overrun.
-   Unreliable KPI definitions or poor source data.
-   Legal/tax classification errors in partner contracts or financial
    workflows.

## Q. Completion scorecard --- the 100% gate

Score each category only from evidence, not from how detailed the prose
looks.

  ------------------------------------------------------------------------
  Category                                    Weight Evidence required for
                                                     full points
  --------------------- ---------------------------- ---------------------
  Business scope and                              10 Approved scope,
  process coverage                                   process inventory,
                                                     exclusions, owners

  Policy/source                                   10 Claim-level evidence,
  traceability                                       versions, reviewers,
                                                     review triggers

  Requirements quality                            10 Atomic requirements
  and traceability                                   linked to tests and
                                                     release phases

  Data model and                                  10 Approved schema,
  ownership                                          constraints,
                                                     ownership matrix,
                                                     migration plan

  State machines and                              10 Complete transitions,
  business rules                                     preconditions, side
                                                     effects, edge-case
                                                     tests

  Security, privacy,                              10 Threat model, access
  and tenant isolation                               tests, privacy
                                                     review, protected
                                                     data lifecycle

  Integrations and                                10 Contract tests,
  recovery                                           retries, idempotency,
                                                     observability,
                                                     reconciliation

  UX and accessibility                             5 Screen flows, error
                                                     states, accessibility
                                                     and usability
                                                     evidence

  KPIs and reporting                               5 Formal definitions,
                                                     data-quality checks,
                                                     approved targets

  Test strategy and                               10 Automated and manual
  release gates                                      evidence, pass/fail
                                                     records, signed gates

  Operations and                                   5 Runbooks,
  resilience                                         restore/rollback
                                                     drills, monitoring
                                                     and support ownership

  Pilot and rollout                                5 Baseline, success
  governance                                         criteria, exit
                                                     review, explicit
                                                     scale approval

  **Total**                                  **100** All evidence complete
                                                     and approved
  ------------------------------------------------------------------------

### Q.1 Scoring rules

-   Full points require evidence and sign-off.
-   Partial points require explicit, reviewable progress; prose alone is
    insufficient.
-   Unknowns must be recorded as unknowns, not converted into
    assumptions presented as facts.
-   Any unresolved critical security, privacy, safety, legal, policy, or
    data-integrity blocker caps the **release-readiness score** below
    100 until mitigated or the affected capability is excluded.
-   A 100/100 score means the specification passed this rubric for a
    defined scope and date. It does **not** mean the built product is
    bug-free or that external systems will never change.

## R. Final pre-build checklist

The specification is ready for implementation only when all applicable
boxes are checked.

-   [ ] Scope, users, roles, modules, and exclusions approved.
-   [ ] Policy and local operational claims have claim-level evidence
    and owners.
-   [ ] Open research gaps are triaged; blocking gaps disable affected
    functionality.
-   [ ] Production architecture and system-of-record matrix approved.
-   [ ] Data model, constraints, migration and rollback plan reviewed.
-   [ ] All state machines and edge cases documented.
-   [ ] RBAC, tenant isolation, personal-data lifecycle and audit design
    reviewed.
-   [ ] EXPA integration capabilities, scopes, and failure behaviour
    verified.
-   [ ] Every requirement maps to acceptance tests.
-   [ ] Screen inventory, critical user flows, and error states
    reviewed.
-   [ ] KPI definitions and targets approved.
-   [ ] Release gates, defect severity, and sign-off owners agreed.
-   [ ] Monitoring, backup/restore, incident, support, and handover
    plans exist.
-   [ ] Pilot baseline, targets, duration, and exit criteria approved.
-   [ ] National expansion is explicitly gated behind pilot approval.

## S. Binding implementation instruction for AI coding agents

When an AI coding agent uses this specification:

1.  Do not begin by generating the entire ERP in one pass.
2.  First produce a **Specification Validation Report** listing
    ambiguous requirements, conflicting rules, unverified claims,
    missing decisions, and proposed test cases.
3.  Do not invent official AIESEC policy, legal advice, API
    capabilities, secrets, IDs, thresholds, or stakeholder approvals.
4.  Ask for human approval on blocking decisions; where interaction is
    unavailable, mark the dependency `BLOCKED` and continue only with
    independent, non-risky work.
5.  Implement one approved vertical slice at a time.
6.  For every slice, produce changed files, migration notes,
    requirement-to-code mapping, test results, known limitations,
    security implications, and rollback instructions.
7.  Run tests and report actual results. Never fabricate a passing test,
    successful API call, policy verification, or deployment.
8.  Keep EXPA official states distinct from local internal states and
    never create fake official statuses.
9.  Use the action outbox and human confirmation unless write operations
    are explicitly authorised and verified.
10. Stop and escalate if implementation would bypass security, privacy,
    policy, or platform constraints.

------------------------------------------------------------------------

# END OF QUALITY-GATE ADDENDUM
