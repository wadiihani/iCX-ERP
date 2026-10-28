# AIESEC in Rabat — ICX ERP
## Module 1 Companion Spec: Graph Instruments per KPI (Minimalist Visual Layer)

- **Companion to**: `Aiesec_Icx_Erp_Dashboard_Kpis_And_Graph_Architecture.md` (KPI definitions, formulas, RAG thresholds stay there; this file only says **how each KPI is drawn**)
- **Goal**: every KPI gets exactly one instrument, chosen for fast reading, with a clean/minimal rule and a hint on what the user should decide when they see it
- **Scope**: 9 cards x (1 collapsed micro-visual + scorecard rows + 2-4 expanded graphs)

---

## 0. The 8 Minimalism Rules (apply to every chart)

| # | Rule | In practice |
|:-:|:--|:--|
| 1 | **One chart = one question** | Title is the question ("Where do we lose EPs?"), not a noun ("Funnel") |
| 2 | **Max 4 graphs per expanded card** | Anything beyond goes in a table or the exceptions list |
| 3 | **Ink budget** | No gridlines, no borders, no 3D, no shadows, no gradients. Light axis only when values are not labeled |
| 4 | **Direct labels, no legends** | Label the bar/line end with `24 RE (68.6%)`. Legend only if >1 color meaning cannot be labeled in place |
| 5 | **Color = meaning only** | Max 3 colors per chart: one neutral (slate), one signal (blue), RAG only for status. Never decorative |
| 6 | **Target is always visible** | Dashed slate line or marker at target. Actual vs target must be readable without hovering |
| 7 | **Sort by value** | Bars sorted desc (except funnels/time). Worst item first in exception lists |
| 8 | **Empty state is explicit** | "No data for 26.2 / iGTa" in muted text, never an empty axis |

### Anti-patterns (banned)
Pie/donut with more than 3 slices, gauges/speedometers, 3D, dual-axis lines, radar charts (replaced by dot matrix, see Card 9), rainbow palettes, truncated bar axes (bars always start at 0).

---

## 1. Instrument Catalogue (the only 12 chart types the dashboard uses)

| Code | Instrument | Use it for | Encoding | Clean rule |
|:-:|:--|:--|:--|:--|
| **NT** | Number Tile | Any single KPI | Big value + WoW delta arrow + RAG dot | 3 elements only. No chart inside |
| **SP** | Sparkline | Trend behind a tile, last 8 weeks | Thin line, last point dotted + labeled | No axes, no grid |
| **BU** | Bullet Bar | Actual vs target vs SLA | Bar = actual, tick = target, faint RAG zones | Stack up to 6 in one row group |
| **FU** | Horizontal Funnel | Stage-to-stage leakage | Bar length = count, badge between bars = CR% | Dashed marker for stage target |
| **SB** | 100% Stacked Bar | Part-to-whole (tiers, slots, visa stages) | One row per entity, segments sum to 100% | Max 4 segments, ordered best to worst |
| **HM** | Heatmap Grid | Many entities x many periods/standards | Cell color = RAG/intensity, number inside cell | Fixed 3-step color scale, no gradient |
| **QD** | 2x2 Quadrant Scatter | Decide scale / coach / fix / drop | X = effort/volume, Y = result, dot = entity | Only 4 quadrant labels, faint divider lines |
| **SC** | S-Curve (cumulative line) | Ahead or behind pace | Solid = actual, dashed = plan | Max 2 lines, label the gap at the last week |
| **PA** | Pareto Bar | Rank causes of a problem | Sorted horizontal bars + cumulative % marker | Top 5 + "Other" |
| **WF** | Waterfall | Money in vs out to net result | Floating bars: inflows up, costs down, net at end | Green up, slate down, net bar bold |
| **GT** | Gantt Timeline | Occupancy / countdown over time | Rows = resource, x = date, bar = booking | Empty gaps shown as faint hatch |
| **AL** | Alert List | Things needing action now (not trends) | Sorted rows: item, owner, days overdue, 1 action | Max 5 visible, "+N more" opens drawer |

> If a KPI is a pure count with a target (e.g., "Unreachable EPs"), it is an **NT or AL, never a chart**.

---

## 2. Global Design Tokens

### Color (from the parent spec, unchanged)
| Token | Hex | Meaning |
|:--|:--|:--|
| `--ok` | `#10B981` | On target / SLA met / Tier 1 |
| `--active` | `#037EF3` | Volume, in-progress, Tier 2 |
| `--warn` | `#F59E0B` | Approaching SLA / Tier 3 |
| `--bad` | `#EF4444` | Breach / failed / Tier 4 |
| `--muted` | `#94A3B8` | Target lines, baselines, empty capacity |
| `--ink` | `#0F172A` | Text |
| `--surface` | `#FFFFFF` (dark: `#0B1220`) | Card background |

Dark mode: only swap `--ink` and `--surface`; semantic colors stay identical.

### Typography & spacing
| Element | Spec |
|:--|:--|
| Primary MoS number | 32px semibold, tabular numerals |
| KPI tile value | 20px semibold |
| Labels / axis | 12px regular, `--muted` |
| Chart title (question) | 14px medium |
| Card padding | 16px; gap between charts 16px; radius 12px |
| Number format | `1 234`, `68.6%`, `84 000 MAD`, deltas `▲ +12%` (green) / `▼ -4%` (red), but invert color for metrics where lower is better (days, hours, breaches) |

### Standard interactions
| Action | Behavior |
|:--|:--|
| Hover | Tooltip with exact value + period + formula name. Never the only place a value appears |
| Click a bar / dot / cell | Opens the exception drawer filtered to that item (stays on dashboard) |
| Global filter change | All charts re-query; skeleton loaders, no spinners |
| Export | CSV of the chart's underlying rows |

---

## 3. Card-by-Card Instrument Map

Legend: **NT** number tile, **BU** bullet, **FU** funnel, **SB** stacked bar, **HM** heatmap, **QD** quadrant, **SC** S-curve, **PA** pareto, **WF** waterfall, **GT** gantt, **AL** alert list.

---

### CARD 1 — Exchange Funnel & Process Velocity

**Collapsed micro-visual**: 6-bar mini funnel (`APP > ACC > APD > RE > FIN > CO`), no labels except RE count.

**Scorecard (every KPI, one instrument each)**

| KPI | Instrument | Hint for the viewer |
|:--|:-:|:--|
| Total CO / RE / APD (MoS) | NT + SP | Pace vs term goal; tile shows `24/35` and % |
| OPEN / APP / SHORTLISTED / ACC volumes | FU (inside Graph 1.1) | Ratio vs APD target shown as dashed marker |
| APP>ACC, ACC>APD, APD>RE, RE>CO CR% | FU bridge badges | The lowest badge is the leak; highlight it |
| Overall APP>RE yield | NT | Single headline number |
| Screening / Acceptance / Approval / Total approval speed | BU (Graph 1.2) | Tick = SLA days; bar past tick turns red |
| Lost / dropped EPs | PA (Graph 1.4) | Top reason is the action |

**Expanded graphs (2x2)**

| ID | Question | Instrument | Axes / encoding | Minimal rule | Hint |
|:-:|:--|:-:|:--|:--|:--|
| 1.1 | Where do we lose EPs? | **FU** | Y: 7 stages. X: count. Badge: CR% between bars. Dashed tick: stage target | No gridlines; counts inside bars | Click a stage: drawer lists EPs stuck there |
| 1.2 | Are we within SLA? | **BU** x4 | Rows: APP>Contact, Contact>ACC, ACC>APD, Total. Bar = avg days, tick = SLA | Same x-scale per row group | Red row = which handoff is slow |
| 1.3 | Ahead or behind pace? | **SC** | X: W1-W26. Y: cumulative APD and RE. Solid actual, dashed plan | 2 lines per metric max (toggle APD/RE, not both at once) | Label the gap in EPs at the last week |
| 1.4 | Why do EPs leave? | **PA** | Reasons sorted desc, cumulative % marker | Top 5 + Other | Reason click: filtered EP list |

---

### CARD 2 — B2B CRM & Sales Pipeline

**Collapsed micro-visual**: single stacked bar `Lead > Contacted > Meeting > Proposal > Signed`.

| KPI | Instrument | Hint for the viewer |
|:--|:-:|:--|
| Signed contracts, Contracted MAD (MoS) | NT + BU | Bullet vs term plan |
| New qualified leads / week | NT + SP | 8-week trend shows prospecting rhythm |
| Outreach touchpoints / week | NT + SP | Activity KPI, compare with results in 2.3 |
| Discovery meetings / week | NT | |
| Cold > Response, Meeting > Proposal, Proposal > Contract | FU bridge badges (Graph 2.1) | Weakest badge = sales skill gap |
| Avg sales cycle (days) | BU | Tick = 21d |
| Weighted pipeline value (MAD) | NT vs remaining target (shown as x multiple) | `2.5x` coverage is the green line |
| Partner renewal % | NT | |
| Stale deals >7d | **AL** | List with owner and days idle |

| ID | Question | Instrument | Axes / encoding | Minimal rule | Hint |
|:-:|:--|:-:|:--|:--|:--|
| 2.1 | Where do deals die? | **FU** | 7 CRM stages; bar = count; secondary label = weighted MAD | No dual axis: MAD as text label, not second bar | Biggest drop is the focus |
| 2.2 | Are we over-reliant on one sector? | **SB** | Rows: NGO, School, Startup, Corporate; segments by stage | Sort by total desc | One dominant row = diversify |
| 2.3 | Activity or skill problem? | **QD** | X: outreach logged. Y: meetings + signed. Dot = BD member | Median lines as quadrant dividers | Low X = activity; high X low Y = coaching |
| 2.4 | Where are deals stuck? | **HM** | Rows: stages. Cols: 0-7d, 7-14d, 14d+. Cell = # deals | 3 colors only | Red cell click: deal list |

---

### CARD 3 — Opportunity & Slot Capacity

**Collapsed micro-visual**: one segmented bar `Booked | In process | Empty`.

| KPI | Instrument | Hint for the viewer |
|:--|:-:|:--|
| Overall slot fill % (MoS) | NT + BU | Tick = 85% |
| Live opportunities | NT | |
| SDG / global project alignment % | NT | Anything under 100% needs a fix list |
| Applications per open slot | NT per opportunity (inside 3.1 row as text) | Under 2.0 = weak listing |
| AM assigned <=7d % | NT | Compliance, binary |
| OP review speed (h) | BU | Tick = 48h |
| Unjustified OP rejections | **AL** | Name the OP; 3 = suspend |
| Expiring unfilled slots <21d | **AL** | Most urgent project first |

| ID | Question | Instrument | Axes / encoding | Minimal rule | Hint |
|:-:|:--|:-:|:--|:--|:--|
| 3.1 | Which project has empty slots? | **SB** (one row per opportunity) | Segments: Realized/Approved, Accepted, In interview, Empty (muted) | Sort by days-to-start asc; show start date at row end | Empty segment on a near date = push promotion |
| 3.2 | Is the portfolio balanced? | **Sorted horizontal bar** (not treemap) | One bar per SDG/project, `iGTa/iGTe` durations as a second small group | One color; label with slots | Treemaps are harder to compare; bars win |

---

### CARD 4 — IR Supply & Country Partnerships

**Collapsed micro-visual**: Top 5 supply countries as horizontal bars.

| KPI | Instrument | Hint for the viewer |
|:--|:-:|:--|
| IR partner supply share % (MoS) | NT + BU | Tick = 70% |
| IR joint quota attainment | BU per partner (Graph 4.2) | |
| E2E conversion % per country | QD Y-axis (Graph 4.1) | |
| Home LC approval push speed (h) | BU | Tick = 48h |
| IR response time (h) | NT + SP | Tick = 12h |
| SE standards #1,#2,#3,#18 | HM mini-row (4 cells) | Which standard fails per partner |
| Bi-weekly sync adherence | NT | |

| ID | Question | Instrument | Axes / encoding | Minimal rule | Hint |
|:-:|:--|:-:|:--|:--|:--|
| 4.1 | Which partners do we scale or filter? | **QD** | X: APP sent. Y: APP>APD %. Bubble size: RE. Color: visa regime (3 colors) | Label only top 5 + outliers; rest unlabeled until hover | Top-right scale, bottom-right tighten screening |
| 4.2 | Did partners deliver what they promised? | **BU** grouped | One row per partner; bar = actual APD, tick = committed quota | Max 8 partners, rest in "Other" | Short bar = call the partner |

---

### CARD 5 — Pre-Arrival, Visa & 14-Day Lock

**Collapsed micro-visual**: 3-segment readiness bar (Locked, In process, Breach).

| KPI | Instrument | Hint for the viewer |
|:--|:-:|:--|
| 14-day lock compliance % (MoS) | NT (big) + 3-segment bar | Must be 100%; anything else is an alert |
| Host pack sent <=14d % | NT | |
| EP visa update/apply SLA % | NT | |
| Visa success rate by regime | BU x3 (one per regime, tick = regime target) | |
| 3-day pickup instructions % | NT | |
| Insurance verified % | NT | |
| EPs arriving <14d with missing items | **AL** (top of the card) | Show missing item as chip: Visa / Bed / Ticket / Pickup / OP |

| ID | Question | Instrument | Axes / encoding | Minimal rule | Hint |
|:-:|:--|:-:|:--|:--|:--|
| 5.1 | Who is at risk before arrival? | **Countdown timeline** (GT variant) | X: days to arrival (60 > 0) with vertical lines at 14d and 3d. Y: one row per EP. Cell chips: 5 lock items (filled/empty) | Only EPs <=30d shown by default; red row if right of the 14d line and incomplete | The row itself is the action: click to open drawer |
| 5.2 | Where is each visa stuck? | **SB** | Rows: 3 regimes. Segments: Docs pending, Submitted, Approved, Rejected | Fixed segment order | Rejected share per regime |

---

### CARD 6 — CXP, 18 Standards & Case Solving

**Collapsed micro-visual**: 18-cell strip (13 solid, 5 dashed outline), each cell RAG.

| KPI | Instrument | Hint for the viewer |
|:--|:-:|:--|
| Qualified CO rate (MoS) | NT + BU | Tick = 90% |
| EP NPS (MoS) | NT + **diverging bar** (detractor / passive / promoter) | One bar shows why the score moved |
| 13 mandatory fulfillment, 5 non-mand >=3/5 | HM (Graph 6.1) | One failing column = the cause |
| Middle / Final survey completion | FU (Graph 6.2) | |
| #9 escort, #17 touchpoints, #15 LEAD | HM cells (same grid as 6.1) | Do not duplicate as separate charts |
| Unreachable EP >48h | **AL** (red, top) | Target 0; any row = critical |
| Case resolution velocity (Stage 1/2/3) | BU x3 | Tick = 48h |

| ID | Question | Instrument | Axes / encoding | Minimal rule | Hint |
|:-:|:--|:-:|:--|:--|:--|
| 6.1 | Which standard is failing? | **HM** | Cols: 18 standards (13 solid border, 5 dashed). Rows: product (iGV/iGTa/iGTe) or cohort. Cell: % yes | 3-step color, number in cell | Failing column drives action |
| 6.2 | Where do EPs fall out of the survey chain? | **FU** | Realized > Middle survey > Issues resolved > Finished > Final survey > CO | Counts + CR% badges | Biggest drop = fix reminder timing |

---

### CARD 7 — Accommodation & Pickup

**Collapsed micro-visual**: two stacked bullets (occupancy, audit pass).

| KPI | Instrument | Hint for the viewer |
|:--|:-:|:--|
| Vetted bed coverage next 30d (MoS) | NT + BU | Tick = 110% |
| Standard #7 audit pass % | NT (binary, red under 100%) | Block assignment if red |
| Bed occupancy % | BU | Tick = 85%; under 70% = wasted rent |
| Cost per bed / month | BU vs cap | Over cap turns amber then red |
| Deposit recovery % | NT | |
| On-time pickup % | NT | |

| ID | Question | Instrument | Axes / encoding | Minimal rule | Hint |
|:-:|:--|:-:|:--|:--|:--|
| 7.1 | Where are beds empty or overlapping? | **GT** | Y: flat > room > bed (grouped by neighborhood). X: weeks. Bar: occupied; hatched gap: empty | Collapse neighborhoods by default | Long gaps = money lost |
| 7.2 | Which property costs too much for its rating? | **Scatter** (QD style) | X: cost per bed (MAD). Y: EP #7 satisfaction. Dot = property | Quadrant lines at budget cap and rating threshold | Top-left expensive & low rated = drop landlord |

---

### CARD 8 — AFPM Finance & Sustainability

**Collapsed micro-visual**: bullet of ratio vs 1.0x break-even line.

| KPI | Instrument | Hint for the viewer |
|:--|:-:|:--|
| Sustainability ratio (MoS) | BU (tick 1.0x, target 1.25x) | Red under 1.0 |
| Net exchange surplus (MAD) | NT + WF final bar | |
| iGV partner/CSR coverage % | BU (70% to 100% band) | |
| Invoice collection rate % | NT | |
| Overdue invoices >14d (MAD, count) | **AL** + NT | Name the OP, amount, days late |
| Months of reserves | BU (tick 6.0) | |
| AEPP Annex 2 liability exposure | NT (red if >0) | |

| ID | Question | Instrument | Axes / encoding | Minimal rule | Hint |
|:-:|:--|:-:|:--|:--|:--|
| 8.1 | Where does money come in and go out? | **WF** | Inflows (partner fees, EP fees, grants) > costs (rent, pickup, MC fee, reserves) > net | Green up, slate down, bold net; labels in MAD | Largest down-step is the cost lever |
| 8.2 | Who owes us money and for how long? | **SB** (one row per partner, or total) | Segments: Current, 1-7d, 8-14d, >14d | Sort by >14d desc | Red segment = freeze risk |

---

### CARD 9 — Member Engagement, TeSt & People Analytics

**Collapsed micro-visual**: single 4-tier bar (T1 green, T2 blue, T3 amber, T4 red).

| KPI | Instrument | Hint for the viewer |
|:--|:-:|:--|
| Active engaged rate T1+T2 (MoS) | NT + 4-tier bar | Tick = 80% |
| Personal goal achievement % | NT + BU | Tick = 75% |
| Retention rate | NT | |
| Tier 1 share, Tier 4 count | In the 4-tier bar; Tier 4 count as red NT | Any Tier 4 member needs an O2O |
| On-time arrival rate | NT + scatter in 9.1 | |
| 6 governance routines execution | BU | |
| TL>Member O2O, LCVP>TL O2O | BU x2 | Monthly; 100% target |
| TeSt completion | Dot matrix (9.3) | |
| Task on-time % | NT | |
| eNPS / EwA | NT + diverging bar | |
| NDA & GDPR compliance | NT (binary, red under 100%) | Locks PII |

| ID | Question | Instrument | Axes / encoding | Minimal rule | Hint |
|:-:|:--|:-:|:--|:--|:--|
| 9.1 | How engaged is each team and why do people drop? | **SB** (Tiers by engine) + small **scatter** (join delay vs retention %) | SB rows: External, Internal. Scatter: X late minutes, Y retention % | Scatter secondary, smaller | Late joiners map to Tier 4 |
| 9.2 | Who do we coach, recognize, or re-engage? | **QD** | X: engagement score. Y: KPI attainment. Dot = member (initials, not full names in the chart) | Four quadrant labels only | Bottom-left = O2O this week |
| 9.3 | Which team skips which standard? | **Dot matrix** (replaces radar) | Rows: 9 TeSt elements. Cols: MM External, MM Internal, TL IR, TL BD. Dot color = RAG, number = % | No polygon, no fill | Radar areas are hard to compare; this is exact |
| 9.4 | Who is attending, who is fading? | **HM** | Rows: members. Cols: W1-W16. Cell: 3 states (on time, partial, absent); star for O2O done | Cap 20 rows visible, sort by lowest engagement first | A red streak of 3 = proactive outreach |

> **Privacy note**: Card 9 shows individuals. Gate it by role (LCVP, TL for their own team only) and the APIP 5.7 NDA/GDPR flag. Charts show initials by default; full names only in the drawer.

---

## 4. Data Contract: One Endpoint per Graph (proposed)

Pattern: `GET /api/dashboard/{card}/{graph}?term=&product=&engine=&team=&member=`
All responses: `{ meta: {term, updated_at}, data: [...], target: {...} }`

| Graph | Endpoint | Minimal payload (per row) | Source table | Refresh |
|:-:|:--|:--|:--|:--|
| 1.1 | `/c1/funnel` | `stage, count, target, cr_to_next` | `ep_applications` (EXPA sync) | 15 min |
| 1.2 | `/c1/velocity` | `segment, avg_days, sla_days` | `ep_applications` | 15 min |
| 1.3 | `/c1/pace` | `week, actual_apd, plan_apd, actual_re, plan_re` | `ep_applications`, `kpi_targets_and_quotas` | daily |
| 1.4 | `/c1/lost-reasons` | `reason, count` | `ep_applications` | daily |
| 2.1 | `/c2/pipeline` | `stage, count, weighted_mad` | `b2b_deals` | 15 min |
| 2.2 | `/c2/sector-mix` | `sector, stage, count` | `organizations`, `b2b_deals` | daily |
| 2.3 | `/c2/rep-activity` | `member_id, outreach, meetings, signed` | `stakeholder_interactions` | daily |
| 2.4 | `/c2/aging` | `stage, bucket, count` | `b2b_deals` | 15 min |
| 3.1 | `/c3/slots` | `opportunity, booked, accepted, interview, empty, start_date` | `opportunity_slots` | 15 min |
| 3.2 | `/c3/portfolio` | `project, sdg, slots` | `opportunities` | daily |
| 4.1 | `/c4/partners` | `lc, app, cr_pct, re, visa_regime` | `ir_partnerships`, `ep_applications` | daily |
| 4.2 | `/c4/quota` | `lc, quota_apd, actual_apd` | `ir_partnerships` | daily |
| 5.1 | `/c5/countdown` | `ep_id, days_to_arrival, lock_items{}` | `visa_arrival_readiness` | hourly |
| 5.2 | `/c5/visa-stage` | `regime, stage, count` | `visa_arrival_readiness` | hourly |
| 6.1 | `/c6/standards` | `standard_id, cohort, pct_yes` | `exchange_standards` | daily |
| 6.2 | `/c6/survey-funnel` | `step, count` | `exchange_standards` | daily |
| 7.1 | `/c7/occupancy` | `flat, room, bed, from, to` | `bed_allocations` | hourly |
| 7.2 | `/c7/cost-vs-rating` | `property, cost_per_bed, rating` | `accommodations`, `finance_ledger` | weekly |
| 8.1 | `/c8/waterfall` | `item, type(in/out), mad` | `finance_ledger` | daily |
| 8.2 | `/c8/ar-aging` | `partner, bucket, mad` | `invoices` | daily |
| 9.1 | `/c9/tiers` | `engine, tier, count` + `member_id, late_min, retention_pct` | `meeting_attendance` | daily |
| 9.2 | `/c9/quadrant` | `member_id, engagement, kpi_pct` | `member_engagement_logs` | daily |
| 9.3 | `/c9/test` | `team, element, pct` | `team_standards_audits` | weekly |
| 9.4 | `/c9/attendance-grid` | `member_id, week, state, o2o_done` | `meeting_attendance`, `o2o_records` | daily |

Alert lists share one endpoint: `GET /api/dashboard/alerts?card=&severity=` returning `{item, owner, metric, value, threshold, age_days, action}`.

---

## 5. Card Layout Template (same for all 9, so users learn it once)

```text
+---------------------------------------------------------------+
| ACTIVE CARD TITLE                       [Term][Export CSV]    |
+---------------------------------------------------------------+
| ALERTS (AL, max 5)  ........................................  |   <- only if any red
+---------------------------------------------------------------+
| Scorecard: NT/BU rows (all KPIs, with formula tooltip)        |
+------------------------------+--------------------------------+
| Graph X.1 (hero question)    | Graph X.2                      |
+------------------------------+--------------------------------+
| Graph X.3                    | Graph X.4                      |
+------------------------------+--------------------------------+
```

Order rule: alerts first (action), scorecard second (status), graphs third (diagnosis).

---

## 6. Build Priority (suggested)

| Phase | Build | Why first |
|:-:|:--|:--|
| 1 | Tokens, NT, SP, BU components + card shell + filter bar | Powers all 9 collapsed cards |
| 2 | FU, SB, AL | Covers Cards 1, 2, 3, 5 graphs and all exception lists |
| 3 | HM, SC, PA | Cards 1, 6, 9 |
| 4 | QD, WF, GT | Cards 2, 4, 7, 8, 9 (most custom work) |
| 5 | Polish: dark mode, empty states, drawer, role gating | |

Reusable components needed in total: **12** (the catalogue in section 1). Every one of the 23 graphs is a configuration of those.

---

## 7. QA Checklist per Chart (before shipping)

| Check | Pass condition |
|:--|:--|
| Question is in the title | Yes |
| Target visible | Yes, without hover |
| Colors | <=3, all semantic |
| Labels | Direct; no legend unless unavoidable |
| Axis starts at 0 (bars) | Yes |
| Worst item first | Yes |
| Empty / loading / error state | All three designed |
| Mobile (<=380px) | Falls back to single column; heatmaps scroll horizontally |
| Click opens drawer with filtered rows | Yes |
