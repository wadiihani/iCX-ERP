# AIESEC iCX ERP — KPI Dashboard & Analytics Specification

**Purpose:** Define the KPIs, formulas, chart types, filters, and decision logic for the iCX ERP dashboard, with Global Volunteer (iGV) as the primary use case and a structure that can later support iGT.

**Audience:** iCX LCVP/VP, team leaders, members, operations/CXP owners, finance, and the developer/AI coding agent.

**Status:** Implementation proposal. Confirm official definitions and minimum requirements against the latest internal AIESEC standards before presenting any metric as an official AIESEC KPI.

---

## 1. Source alignment and important limitation

Use the AIESEC Hub as the source of operational context:

- Exchange Hub: https://www.hub.aiesec.org/exchange-hub
  - Lists GV dashboard, project portfolio/SDG resources, APIP & AEPP, Exchange Standards, Partner Standards, EXPA support, Visa Hub, service evaluation, and GV learning resources.
- IM Hub / EXPA guidance: https://www.hub.aiesec.org/im-hub
  - Provides EXPA guides, status guidance, application processes, and data/analytics resources.
- AIESEC Way: https://www.hub.aiesec.org/aiesec-way
  - Frames AIESEC's impact around leadership development, cross-cultural understanding, leadership opportunities, membership, and partners.
- ICB Hub: https://www.hub.aiesec.org/icb-hub
  - Provides the governance and exchange-quality context for standards and customer centricity.
- Finance Academy: https://www.hub.aiesec.org/finance-academy-2023
  - Covers financial reporting, budgeting, audit, investment, risk, and related finance standards.
- Partners Hub: https://www.hub.aiesec.org/partners-hub
  - Provides partner program, partner coordination, and partnership context.
- MX Hub: https://www.hub.aiesec.org/mxknowledge
  - Explicitly points to an MX KPI resource with metric formulas; this is a useful example of how AIESEC metrics should have documented definitions.

**Do not claim that the KPI formulas below are official AIESEC formulas unless verified in the current internal resources.** The public Hub pages confirm relevant domains and resources, but not every detailed metric definition or threshold. Treat the definitions below as proposed local management KPIs. Where Exchange Standards, Partner Standards, APIP/AEPP, or the current GV Dashboard define a mandatory metric, use the official definition and retain its source/version in the ERP.

---

## 2. Dashboard design principles

1. **Every KPI must answer a question.** Avoid displaying metrics only because they are easy to count.
2. **Use source records, not manually typed dashboard numbers.** KPIs must be computed from database records and refresh when those records change.
3. **Show result + target + trend + explanation.** A number without a target, time comparison, or drill-down rarely helps a manager decide what to do.
4. **Distinguish volume, conversion, speed, quality, and impact.** High volume does not automatically mean good delivery.
5. **Use cohort-aware conversion.** Do not divide this month's completed exchanges by this month's applicants if those people belong to different cohorts. Track conversion by application cohort and/or opportunity cohort.
6. **Display counts with percentages.** “75% conversion” is not meaningful without the numerator and denominator (e.g., 15/20).
7. **Make the next action visible.** Each red/amber KPI should link to the affected records and show the likely bottleneck, owner, and next action.
8. **Use clear date ranges and filters.** Show the selected period, comparison period, last refresh time, and whether data is live or imported.
9. **Avoid vanity metrics.** Page views, raw contacts, and total opportunities matter only when connected to conversion, quality, capacity, or impact.
10. **Keep charts simple.** Prefer a small number of readable charts and detailed tables over a crowded wall of graphs.

---

## 3. Recommended dashboard hierarchy

### A. Executive overview (LCVP/VP view)

Place 6–8 high-signal KPI cards at the top:

1. Realized exchanges (actual arrivals/starts according to the locally approved definition)
2. Completed exchanges
3. Application-to-realization conversion rate, by cohort
4. Available, valid opportunity slots
5. Partner pipeline value or qualified pipeline count
6. Partner-to-opportunity conversion
7. Exchange quality / standards compliance
8. Revenue collected and overdue receivables, if the local model includes fees

Each card should include:
- Current value
- Target for selected period
- Progress to target
- Change vs previous comparable period
- Small sparkline or trend
- Numerator/denominator where applicable
- Click-through to filtered records

Below the cards:
- **Main chart:** stage conversion funnel for EPs
- **Main trend:** weekly/monthly APD, accepted, realized, and completed exchanges
- **Capacity chart:** valid available slots vs matched/filled slots
- **Quality panel:** overdue standards/checklist items and customer feedback
- **Action queue:** overdue follow-ups, stale deals, unmatched EPs, upcoming arrivals, incomplete delivery, and overdue payments

### B. Functional views

- **Sales / Partner CRM:** prospects, contact activity, meetings, qualified deals, signed partners, opportunities created, conversion and cycle time.
- **IR / Supply:** active IR partners, usable opportunities, valid slots, response time, supply concentration, and partner reliability.
- **EP funnel:** application stages, stage conversion, stage aging, rejection/withdrawal reasons, and cohort realization.
- **Matching:** eligible EPs, match rate, time to match, unmatched aging, and slot fill rate.
- **Operations / CXP:** pre-arrival readiness, arrival/pickup/accommodation readiness, check-ins, issue resolution, completion, and feedback.
- **Standards & risk:** mandatory checkpoints due/complete/overdue, incidents, escalations, and evidence completeness.
- **Finance:** invoiced, collected, overdue, expenses, margin/contribution, and forecast accuracy, if relevant to local contracts.
- **Membership / execution:** task completion, overdue tasks, ownership coverage, and workload balance. Keep this separate from exchange outcome metrics.

---

## 4. KPI catalogue by workflow

All formulas below are recommended local definitions. Align stage names and event timestamps with the current EXPA configuration and official local process. Never count a status that was later reversed as a successful outcome without an explicit reversal rule.

### Workflow 1 — Market research and partner prospecting

| KPI | Proposed formula | Why it matters | Best display |
|---|---|---|---|
| Target-account coverage | Unique target organizations researched ÷ target organizations planned × 100 | Shows whether the team is covering its chosen market | Progress bar + number |
| Qualified lead rate | Qualified leads ÷ leads researched × 100 | Measures lead-list quality | Horizontal bar by lead source/segment |
| First-contact rate | Leads with a recorded first outreach ÷ qualified leads × 100 | Detects prospecting backlog | Funnel or progress bar |
| First-response rate | Leads that replied ÷ leads contacted × 100 | Indicates relevance of outreach and channel quality | Bar chart by channel/segment |
| Time to first contact | Median time from lead creation to first outreach | Finds slow handoffs | KPI card + trend |
| Lead-source yield | Qualified leads from source ÷ total leads from source | Helps prioritize useful sources | Sorted horizontal bar |

**Interpretation / action:** Low qualified lead rate → revise targeting criteria. High qualified leads but low first-contact rate → workload or ownership issue. Low response rate → test the value proposition, contact person, message, and channel.

### Workflow 2 — Sales and partner CRM

| KPI | Proposed formula | Why it matters | Best display |
|---|---|---|---|
| Meetings booked | Count of meetings booked in period | Measures activity, not success by itself | KPI card + weekly trend |
| Meeting conversion | Meetings held ÷ qualified leads contacted × 100 (cohort-aligned) | Measures ability to generate conversations | Funnel |
| Qualified pipeline | Count or weighted value of deals meeting defined qualification criteria | Shows realistic future potential | KPI card + stage table |
| Stage conversion | Deals entering next stage ÷ eligible deals entering prior stage × 100 | Identifies the weakest sales stage | Funnel or horizontal conversion bars |
| Win rate | Won deals ÷ (won + lost deals) × 100 for closed deals | Measures closing effectiveness | KPI card + trend by segment |
| Sales cycle | Median days from qualified to won/lost | Measures speed and process friction | KPI card + box plot if enough data |
| Follow-up SLA compliance | Follow-ups completed by due date ÷ follow-ups due × 100 | Keeps leads from going cold | Progress bar + overdue table |
| Stale-deal rate | Open deals with no logged activity beyond configured threshold ÷ all open deals × 100 | Finds deals that need action | KPI card + age-bucket bar |
| Partner concentration | Share of active slots or realizations supplied by top partner(s) | Shows dependency risk | Pareto bar chart |

**Interpretation / action:** A large prospect count with few qualified deals is not necessarily a success. If meetings are healthy but signed deals are low, review qualification, proposal fit, decision-maker access, objections, and follow-up discipline.

**Data requirement:** Model `Partner Organization`, `Partner Contact`, and `Sales Deal` as separate entities. One organization may have multiple contacts and multiple deals/opportunities over time.

### Workflow 3 — Contracts and opportunity creation

| KPI | Proposed formula | Why it matters | Best display |
|---|---|---|---|
| Signed partner count | Unique partners with valid signed agreement in period | Measures formalized partnerships | KPI card |
| Contract turnaround | Median days from draft sent to fully signed | Finds contracting delays | KPI card + trend |
| Contract completeness | Active contracts with all required fields/documents ÷ active contracts × 100 | Reduces delivery ambiguity | Progress bar + exceptions table |
| Opportunity creation rate | Signed/qualified partners that produce at least one valid opportunity ÷ eligible partners × 100 | Tests whether partnerships become usable supply | Funnel |
| Opportunity activation time | Median days from agreement/commitment to valid published opportunity | Measures time to operationalize a partnership | KPI card + trend |
| Opportunity validity rate | Opportunities passing all required validation checks ÷ active opportunities × 100 | Avoids unusable or incomplete supply | Progress bar |
| Slot availability | Sum of valid, open, unfilled slots for eligible opportunities | Measures usable capacity | KPI card + table by project |
| Slot fill rate | Filled slots ÷ total valid slots available to the cohort × 100 | Measures supply utilization | Stacked bar / bullet chart |
| Opportunity expiry risk | Open opportunities due to expire within chosen horizon with unfilled slots | Prompts renewal or recruitment action | Alert list + bar by expiry week |

**Interpretation / action:** Signed contracts without valid opportunities indicate a conversion gap after sales. Many opportunities but few usable slots may indicate quality/validation issues, not a demand problem.

### Workflow 4 — International Relations (IR) and supply management

| KPI | Proposed formula | Why it matters | Best display |
|---|---|---|---|
| Active IR partners | Unique IR entities with a verified, current relationship and recent valid activity | Distinguishes usable IR relationships from an address book | KPI card + table |
| IR response rate | IRs responding within defined window ÷ IRs contacted × 100 | Measures partner engagement | Bar by country/entity |
| IR response time | Median time from request to first response | Supports predictable coordination | KPI card + trend |
| Opportunity request fulfillment | Requests resulting in at least one valid opportunity ÷ eligible requests × 100 | Measures whether IR sourcing produces usable supply | Funnel |
| Valid opportunity yield per IR | Valid opportunities received ÷ active IR partners | Measures productive supply relationships | Sorted horizontal bar |
| IR-to-realization yield | Realized EPs attributed to IR ÷ eligible EPs sourced through IR (cohort-aligned) | Finds IR sources that convert to actual exchanges | Bar by IR/country |
| IR concentration | Share of active valid slots from the top IR sources | Shows sourcing dependency | Pareto chart |
| IR data freshness | Active IR records reviewed within configured interval ÷ active IR records × 100 | Prevents stale contacts and opportunity information | Progress bar |

**Interpretation / action:** Do not rank IRs only by number of opportunities sent. Include validity, response time, EP eligibility, realization, quality, and reliability.

### Workflow 5 — EP application and funnel

Define a canonical local stage map that corresponds to actual EXPA statuses. Keep the original EXPA status and map it to an ERP reporting stage; do not silently replace or invent official statuses.

| KPI | Proposed formula | Why it matters | Best display |
|---|---|---|---|
| Applications (APD) | Count of unique applications created in selected cohort | Top-of-funnel demand | KPI card + trend |
| Eligible application rate | Eligible applications ÷ applications reviewed × 100 | Indicates fit and screening quality | Funnel |
| Acceptance rate | Accepted applications ÷ eligible applications from same cohort × 100 | Measures progression into accepted stage | Funnel |
| Contact coverage | Applications with documented first contact ÷ applications requiring contact × 100 | Detects uncontacted EPs | Progress bar + overdue list |
| Stage conversion | Cohort members reaching next stage ÷ cohort members reaching previous stage × 100 | Locates funnel leakage | Funnel |
| Stage aging | Median days in current stage; also show count above SLA | Finds stuck applications | Horizontal bar by stage + aging table |
| Withdrawal rate | Withdrawn EPs ÷ applications in cohort × 100, with reasons | Reveals preventable loss | Trend + reason bar |
| Rejection rate | Rejected applications ÷ applications reviewed × 100, with reasons | Tests eligibility and targeting | Stacked bar by reason |
| Application-to-realization rate | Realized EPs from application cohort ÷ applications in that cohort × 100 | Measures actual funnel outcome | Cohort funnel / trend |
| Application-to-completion rate | Completed EPs from application cohort ÷ applications in that cohort × 100 | Connects recruitment to delivered experience | Cohort chart |

**Important:** Keep APD, accepted, approved, realized/started, and completed definitions aligned with current EXPA reporting. Store timestamped stage history, not just the current status, so historical conversion and time-in-stage remain correct.

### Workflow 6 — Matching and opportunity capacity

| KPI | Proposed formula | Why it matters | Best display |
|---|---|---|---|
| Eligible unmatched EPs | Count of EPs eligible to match and not yet matched | Immediate workload | KPI card + queue |
| Match rate | Eligible EPs matched within cohort ÷ eligible EPs in cohort × 100 | Measures matching effectiveness | KPI card + trend |
| Time to match | Median days from match-ready date to confirmed match | Measures speed | KPI card + trend |
| Match acceptance rate | Matches accepted by EP ÷ matches offered × 100 | Indicates match fit | Funnel |
| Slot fill rate | Filled valid slots ÷ valid slots offered for the same cohort | Measures capacity utilization | Bullet chart / stacked bar |
| Overbooking count | Confirmed matches above valid available capacity | Prevents delivery failures | Alert card; target zero |
| Unmatched aging | Unmatched eligible EPs grouped by days waiting | Prioritizes intervention | Age-bucket horizontal bar |
| Match-to-realization rate | Realized EPs ÷ matched EPs in same cohort | Finds post-match fallout | Funnel + reason breakdown |

**Interpretation / action:** A low fill rate can result from insufficient EP demand, poor opportunity fit, expired opportunities, incomplete opportunity data, or matching delays. Break it down by project, SDG, language, dates, country, and eligibility—not just globally.

### Workflow 7 — Visa, documents, and pre-arrival readiness

| KPI | Proposed formula | Why it matters | Best display |
|---|---|---|---|
| Document completeness | EPs with all required documents for their case ÷ EPs requiring documents × 100 | Measures readiness | Progress bar |
| Visa readiness | EPs with required visa steps completed by deadline ÷ EPs requiring those steps × 100 | Reduces preventable arrival risk | Progress bar + risk table |
| Pre-arrival readiness | Confirmed arrivals with all mandatory pre-arrival checkpoints complete ÷ confirmed arrivals × 100 | Ensures delivery preparation | Progress bar |
| Deadline risk | Cases with a required action due within risk window or already overdue | Makes urgent work visible | Prioritized exception queue |
| Missing-evidence rate | Records missing required evidence ÷ records audited × 100 | Supports compliance | KPI card + checklist table |

**Privacy:** Do not show passport numbers, document images, visa details, or sensitive personal information in dashboard charts. Use aggregated counts and permission-controlled case records. Visa requirements must be maintained from authorized, current sources and must not be inferred automatically from nationality alone.

### Workflow 8 — Arrival, accommodation, pickup, and delivery

| KPI | Proposed formula | Why it matters | Best display |
|---|---|---|---|
| Arrival readiness | Arrivals with confirmed arrival details, contact, and assigned owner ÷ expected arrivals × 100 | Prevents missed arrivals | Progress bar |
| Pickup coverage | Arrivals requiring pickup with confirmed pickup plan ÷ arrivals requiring pickup × 100 | Operational readiness | Progress bar + arrival schedule |
| Accommodation coverage | Arrivals requiring accommodation with confirmed compliant arrangement ÷ arrivals requiring accommodation × 100 | Prevents housing gaps | Progress bar + exception list |
| On-time task completion | Required delivery tasks completed by deadline ÷ required tasks due × 100 | Shows execution reliability | Trend + owner table |
| Issue incidence | Number of logged delivery issues ÷ realized EPs (also show raw count) | Makes service problems comparable | Trend + category bar |
| Issue resolution time | Median time from issue opened to resolved | Measures responsiveness | KPI card + age buckets |
| Overdue unresolved issues | Count of open issues beyond severity-specific SLA | Highlights risk requiring escalation | Alert card + queue |
| Project completion rate | Completed exchanges ÷ exchanges expected to complete in cohort × 100 | Measures delivery outcome | Cohort trend |
| Early termination rate | Exchanges ended before planned completion ÷ realized exchanges in cohort × 100, with reasons | Detects serious delivery problems | Trend + reason breakdown |

**Interpretation / action:** A high completion rate should not hide poor experience or unresolved issues. Always read completion alongside standards compliance, issue resolution, and feedback.

### Workflow 9 — Exchange standards, partner standards, and customer experience

| KPI | Proposed formula | Why it matters | Best display |
|---|---|---|---|
| Standards compliance | Applicable mandatory checkpoints completed with valid evidence ÷ applicable checkpoints due × 100 | Measures process compliance | Progress bar + domain heatmap |
| Overdue mandatory checkpoints | Count of applicable required checkpoints overdue | Immediate risk signal | Alert card + case table |
| Evidence completeness | Completed checklist items with accepted evidence ÷ checklist items marked complete × 100 | Prevents unsupported “complete” statuses | Progress bar |
| EP feedback response rate | EPs submitting evaluation ÷ EPs invited and eligible × 100 | Shows feedback coverage | KPI card |
| EP satisfaction | Average score using a defined survey scale; show response count and distribution | Tracks experience sentiment | Distribution bar; trend |
| NPS (only if the survey uses the standard 0–10 question) | % promoters (9–10) − % detractors (0–6) | Measures recommendation likelihood | KPI card + trend; show sample size |
| Partner feedback response rate | Partner responses ÷ partner invitations × 100 | Shows partner feedback coverage | KPI card |
| Partner satisfaction | Average score on a consistent survey question/scale | Measures partnership experience | Trend + distribution |
| Complaints / incidents | Count by severity and category; normalize per realized EP where appropriate | Supports risk detection | Severity bar + trend |
| Repeat-partner rate | Eligible partners returning with a new valid opportunity in a later period ÷ eligible partners × 100 | Indicates sustained partner value | KPI card + cohort trend |

**Critical:** Use the current Exchange Standards and Partner Standards as the authoritative checklist source. Store standard name, version, applicability rule, required evidence, owner, due date, and completion state. Never invent mandatory checkpoints or mark an exchange compliant merely because fields are populated.

### Workflow 10 — Finance and partnership economics

Only enable metrics that reflect the real local contract and fee model. Do not assume every iGV partner pays AIESEC or that every opportunity has revenue.

| KPI | Proposed formula | Why it matters | Best display |
|---|---|---|---|
| Invoiced amount | Sum of valid invoices issued in period | Measures billing | KPI card + trend |
| Cash collected | Sum of payments received in period | Measures actual cash receipts | KPI card + trend |
| Collection rate | Payments allocated to invoices ÷ amounts due for the selected invoice cohort × 100 | Measures collections | Bullet chart |
| Overdue receivables | Outstanding invoice balance past due date | Makes follow-up actionable | Alert card + aging table |
| Expense per realized EP | Eligible delivery expenses ÷ realized EPs in cohort | Supports unit economics | KPI card + trend |
| Contribution margin | Recognized revenue − eligible direct costs; state accounting basis | Shows economic contribution | KPI card + trend |
| Budget variance | Actual spend − budgeted spend; also show percentage variance | Controls spending | Diverging bar / bullet chart |
| Revenue forecast accuracy | Compare forecast against actual using a documented error formula | Improves planning | Trend + variance table |

**Controls:** Use an approved accounting basis, currency, period, tax treatment, and invoice/payment allocation rules. Restrict financial details by role and keep a traceable audit log.

### Workflow 11 — Team execution and ownership

| KPI | Proposed formula | Why it matters | Best display |
|---|---|---|---|
| Task completion rate | Tasks completed by due date ÷ tasks due × 100 | Measures execution discipline | Progress bar + weekly trend |
| Overdue task count | Open tasks past due date | Immediate action queue | Alert card |
| Follow-up coverage | Required follow-ups completed ÷ follow-ups due × 100 | Prevents stakeholder neglect | Progress bar |
| Record ownership coverage | Active records with a valid accountable owner ÷ active records × 100 | Prevents orphaned work | Progress bar |
| Handover completeness | Handoffs with receiving owner, required data, next action, and acknowledgement ÷ handoffs due × 100 | Measures transfer quality | Progress bar + exception table |
| Workload distribution | Open priority tasks per owner, segmented by type and urgency | Helps rebalance work | Sorted horizontal bar |
| Data freshness | Active records updated/reviewed within the agreed interval ÷ active records × 100 | Keeps reports trustworthy | Progress bar |

Do not use raw login counts or task counts as a proxy for member performance. Interpret workload in context and avoid incentives that reward unnecessary activity.

---

## 5. Best chart for each question

| Analytical question | Recommended visual | Avoid |
|---|---|---|
| How much progress have we made toward a target? | KPI card with target, progress bar, and trend | Donut as the default |
| Where are EPs/leads dropping out? | Funnel with stage counts and conversion rates | Pie chart |
| How has performance changed over time? | Line chart or weekly/monthly column chart | Donut |
| Which stage, owner, country, source, or project performs best? | Sorted horizontal bar chart | Many tiny pie slices |
| How much capacity is available vs filled? | Stacked bar or bullet chart | A standalone percentage without counts |
| What makes up a total? | Donut only for 2–5 mutually exclusive categories with clear labels | Donut with many categories or similar values |
| Are there overdue items by age? | Horizontal bars by age bucket + drill-down table | Pie chart |
| Which issue types are increasing? | Stacked bar over time or sorted category bar | 3D chart |
| Are actuals above/below target? | Bullet chart or actual-vs-target bar | Gauge for every metric |
| What is the relationship between volume and conversion? | Scatter plot only when there are enough comparable entities and a clear decision | Scatter with too few points |
| Which cohort eventually completes? | Cohort table/heatmap or aligned cohort line | Mixing different months' denominators |
| Where are standards weak across domains? | Heatmap of domain × compliance state, with clickable exceptions | One aggregate score hiding failures |
| What needs action today? | Prioritized table/queue with owner, deadline, severity, next action | Chart without record-level drill-down |

### Donut chart rules

Use a donut only when the user asks “what share of this total belongs to each category?” For example, completed / in progress / withdrawn for one clearly defined cohort. Show labels, counts, and percentages. Keep categories mutually exclusive and the total denominator visible.

Do **not** use a donut for:
- A funnel
- A trend over time
- Target achievement when a progress bar is clearer
- Dozens of countries, partners, or status values
- Multiple categories that can overlap

### Funnel chart rules

Use a funnel when stages are sequential and each stage is a subset of the prior stage. Display stage count, conversion from previous stage, and drop-off. If stages can be skipped, repeated, or entered out of order, use a stage transition table or Sankey only if it remains readable. Make cohort and date range explicit.

### Line vs column chart

- **Line:** daily/weekly/monthly trend, especially when direction and rate of change matter.
- **Column:** compare a small number of discrete periods or categories.
- **Horizontal bar:** compare ranked categories or owners; better for long labels.
- **Stacked column:** show category composition over time only when segment comparison remains readable.
- **Table:** best for exact action, filtering, record-level details, and auditability.

---

## 6. How to make every KPI actionable

Each KPI must have a detail view with:

1. **Definition:** exact meaning, unit, and formula.
2. **Numerator and denominator:** when it is a rate.
3. **Cohort and date basis:** application date, stage-entry date, realization date, completion date, invoice date, etc.
4. **Target:** configurable by period and responsible entity/owner; do not invent a target and present it as official.
5. **Trend:** current period vs comparable prior period.
6. **Breakdowns:** stage, project, SDG, partner, IR, owner, country, source, and relevant eligibility segments.
7. **Exception records:** exact records driving the result.
8. **Reason codes:** standardized reasons for rejection, withdrawal, lost deals, failed matches, and early termination.
9. **Suggested diagnostic:** rule-based explanation of possible bottleneck, not an unsupported claim of causation.
10. **Next action:** action owner, due date, and status.

Example:

> **Match rate is below target**
>
> Show the rate and numerator/denominator, then split eligible unmatched EPs by project, required dates, language, country, and days waiting. If most are blocked by expired opportunities, show the affected opportunities and owners. If most are waiting for IR responses, show overdue requests. The dashboard should expose the evidence needed to choose a response rather than merely display “match rate low.”

Use rule-based explanations such as “12 eligible EPs have waited more than 7 days” rather than generative text that guesses causes. If AI-generated analysis is added later, cite the records and label hypotheses as hypotheses.

---

## 7. Global filters and drill-down behavior

Provide consistent filters across analytics:
- Date range and comparison period
- Program: iGV / iGT (where enabled)
- Exchange cohort
- EP stage/status
- Project / SDG
- Partner organization
- IR entity/country
- Opportunity
- Owner / team
- Risk / overdue state

Rules:
- Filters must affect all related cards and charts consistently.
- Each chart should show the applied filters and selected date basis.
- Clicking a stage, bar, or KPI opens the matching filtered record table.
- Provide “clear filters” and sensible defaults.
- Show a data freshness timestamp.
- Distinguish zero from missing/unknown data.
- Never silently combine iGV and iGT definitions if their workflows or requirements differ.

---

## 8. KPI data model and formula governance

Create a KPI registry in code or database, rather than scattering formulas through UI components. For each KPI store:

- Stable `kpi_key`
- Name and description
- Workflow/domain
- Formula/aggregation definition
- Numerator and denominator definitions
- Unit and format
- Date/cohort basis
- Official vs local classification
- Official source URL, document title, version, and review date where applicable
- Target and target period
- Allowed filters/breakdowns
- Data-quality requirements
- Owner responsible for definition
- Last validation date

Use one shared analytics/query layer so the dashboard, exports, and reports use the same definitions. Avoid separate hardcoded calculations in different pages.

### Minimum data requirements

- Immutable internal IDs for partners, contacts, deals, contracts, opportunities, IR requests, EPs, applications, matches, delivery cases, issues, invoices, and tasks.
- Timestamped status history (`from_status`, `to_status`, `changed_at`, `changed_by`, `reason`).
- Explicit relationships between records; avoid concatenating multiple EP names or IDs into a single field.
- Separate event dates for application, acceptance, match, realization/start, completion, withdrawal, and cancellation.
- Soft archive/deactivation where records must remain auditable.
- Server-side validation and database constraints for critical relationships.
- Role-based access control and audit logging for sensitive records.
- Idempotent imports/syncs so repeated data ingestion does not duplicate records.

### Data-quality checks that should be visible

- Duplicate applications or contacts
- Opportunities with no valid partner/IR relationship
- Filled slots exceeding valid capacity
- Realized EPs without a valid match/opportunity relationship
- Completed exchanges missing required completion data
- Status transitions with missing required evidence
- KPIs whose numerator or denominator data is incomplete
- Imported data that has not been refreshed recently

---

## 9. Dashboard layout recommendation

### Executive dashboard

**Row 1 — Outcomes**
- Realized exchanges
- Completed exchanges
- Application-to-realization rate
- Standards compliance

**Row 2 — Growth and supply**
- Qualified pipeline
- Signed partners
- Valid opportunities / available slots
- Slot fill rate

**Row 3 — Trends**
- Monthly APD → accepted → realized → completed, aligned by cohort where possible
- Weekly sales activity and stage conversion
- Capacity by project / SDG

**Row 4 — Risks and actions**
- Overdue mandatory checkpoints
- Unmatched eligible EPs beyond SLA
- Stale deals and overdue follow-ups
- Arrivals missing readiness items
- Unresolved high-severity issues
- Overdue receivables, if applicable

### Workflow page layout

For every workflow:
1. 3–5 KPI cards
2. One primary chart answering the main question
3. One breakdown chart explaining where the issue occurs
4. One prioritized record table
5. A definition/help panel with formula, date basis, and target

Do not put every KPI on one page. Use drill-down pages so the executive view stays readable.

---

## 10. Implementation phases

### Phase 0 — Validate definitions and data
- Review current EXPA statuses and local iGV/iCX SOPs.
- Review the latest Exchange Standards, Partner Standards, APIP/AEPP, and GV Dashboard materials in the Hub.
- Mark each metric `official`, `local-management`, or `proposed`.
- Map database entities and event timestamps to KPI definitions.
- Identify missing data before implementing charts.

**Acceptance:** Every displayed KPI has an approved definition, source, date basis, and known limitations.

### Phase 1 — Build the analytics foundation
- Implement a shared KPI registry and query/service layer.
- Add cohort-aware queries and stage-history events.
- Add global filters, refresh timestamps, and drill-down navigation.
- Add unit tests for formulas and edge cases: zero denominator, missing dates, duplicate imports, reopened stages, reversed statuses, and date boundaries.

**Acceptance:** KPI values match independently calculated test fixtures and filtered record lists.

### Phase 2 — Deliver the executive view
- Implement outcome, growth/supply, trend, and risk/action sections.
- Add funnel, line/column, horizontal bar, and progress/bullet visuals where appropriate.
- Ensure every KPI card links to source records.

**Acceptance:** A VP can identify what is below target, which records drive it, who owns the issue, and what should happen next without manually assembling spreadsheets.

### Phase 3 — Deliver workflow analytics
- Sales/Partner CRM
- Contract/opportunity supply
- IR management
- EP funnel and matching
- Pre-arrival and delivery/CXP
- Standards and risk
- Finance and membership execution

**Acceptance:** Each workflow has actionable metrics, breakdowns, and a prioritized exception table.

### Phase 4 — Governance and continuous improvement
- Add target management and metric ownership.
- Version official definitions and review changes.
- Monitor data freshness and quality.
- Compare cohorts and periods without mixing denominators.
- Collect feedback from VP, TL, members, and operations owners.

**Acceptance:** Metric changes are reviewed, traceable, tested, and communicated.

---

## 11. Instructions for the AI coding agent

Implement this document against the existing iCX-ERP repository. Do not rebuild the application or change frameworks without evidence that it is necessary.

1. Inspect the current database schema, API/service layer, dashboard components, and tests first.
2. Produce a mapping of each proposed KPI to actual tables, fields, status events, and date columns.
3. Identify which KPIs can be computed correctly now and which require schema/data changes.
4. Do not fabricate values, targets, official KPI formulas, or AIESEC requirements.
5. Implement the shared KPI definition/query layer before creating chart components.
6. Use the chart type recommended for the analytical question; do not default to donuts.
7. Keep all charts accessible, responsive, labeled, and readable on mobile.
8. Include counts and denominators, date ranges, targets, comparison periods, and data freshness.
9. Make chart interactions filter/drill down into the same source records.
10. Add tests for formula correctness, cohort alignment, filters, permissions, empty states, and regression.
11. Preserve existing working features and use small, reviewable changes.
12. For official standards, link each mandatory KPI/checkpoint to the current authorized source and version. If the source cannot be verified, label the definition as local/proposed and request review instead of assuming.

**Required deliverables:**
- KPI-to-schema mapping
- List of data gaps
- Dashboard wireframe/structure
- Shared KPI registry and calculation layer
- Charts and drill-down tables
- Unit/integration tests
- Short implementation report listing completed work, assumptions, unresolved definitions, and verification evidence

---

## 12. Final principle

The dashboard is successful only if it answers these four questions quickly:

1. **Are we achieving the intended exchange outcomes?**
2. **Where exactly are we losing people, partners, capacity, quality, or time?**
3. **Which records and root-cause signals explain the gap?**
4. **Who needs to do what, by when?**

Use the AIESEC Hub to validate official exchange and partner standards. Use this specification as the local analytics design, and make every metric traceable to real operational records.
