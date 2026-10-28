# AIESEC in Rabat — All-in-One ICX ERP
## Module 1 Specification: Interactive KPI Dashboard, Drill-Down Card Architecture, Graph Efficiency Guide & Member Engagement Analytics

- **Target Entity**: AIESEC in Rabat, Morocco (`MC Morocco` | `LC Rabat`)
- **System Layer**: Module 1 — Main Executive & Operational Command Dashboard (Zero Redundant Navigation CTAs; 100% In-Place Clickable KPI Cards)
- **Authoritative Sources**:
  - **AIESEC Hub**: [AIESEC Hub Home (`hub.aiesec.org`)](https://www.hub.aiesec.org/), [Exchange Hub (`hub.aiesec.org/exchange-hub`)](https://www.hub.aiesec.org/exchange-hub), [IM Hub (`hub.aiesec.org/im-hub`)](https://www.hub.aiesec.org/im-hub), [Functional Hub (`hub.aiesec.org/functional-hub`)](https://www.hub.aiesec.org/functional-hub)
  - **EXPA & GIS API**: [EXPA (`expa.aiesec.org`)](https://expa.aiesec.org/) & [EXPA GIS v2 Swagger (gis-api.aiesec.org/swagger)](https://www.google.com/search?q=http://gis-api.aiesec.org/swagger)
  - **Global Policies & Standards**: [EVLM Oct 2024 Compendium](https://drive.google.com/file/d/1fc38fTba4iW_k0wG3n8w-p0Gop_7K6-e/view?usp=drivesdk), [AEPP IPM 2024](https://drive.google.com/file/d/16S6K2fH1w27hXefr-m6gD9B5K2eX3L4V/view?usp=drivesdk), [APIP Oct 2024](https://drive.google.com/file/d/1vI9C6-hF4A6v3B1q5W4z9X8K2L7M3N1P/view?usp=drivesdk), [AFPM Aug 2022](https://drive.google.com/file/d/1cK8pQ2W9xL4mN7vB3zR6tY1uJ5hG8fD0/view?usp=drivesdk), [2024 Exchange Standards Refreshment (18 Standards)](https://drive.google.com/file/d/1w8c-x6L4p9T2mN5vR7bK1qY3zF0jH8dG/view?usp=drivesdk), [Global Volunteer Portfolio](https://drive.google.com/file/d/1y9R3tP6mW2kL8nX4vB1cZ7qF5gH0jD2s/view?usp=drivesdk)
  - **AIESEC in Rabat Operational Records**: [AIESEC RABAT 26 - iGV S1 Closing Report](https://docs.google.com/document/d/1_BZFmxtlFvIdiWXOEcEvIczSWxaGym-U6lKFwciJ9Zo/edit?usp=drivesdk), [Comprehensive iGV Attendance & Engagement Report](https://docs.google.com/document/d/1q9X2kL5mN8vB3cZ7wR1tY4uJ6hG0fD9s/edit?usp=drivesdk), [iGV MM Application Consultancy](https://docs.google.com/presentation/d/1p7W4kL9mN2vB5cZ8xR3tY6uJ1hG0fD4s/edit?usp=drivesdk), [iGV Middle Management Selection](https://docs.google.com/presentation/d/1m3K8pL2nN6vB9cZ4xR7tY1uJ5hG0fD8s/edit?usp=drivesdk), [International Relations Strategy](https://docs.google.com/presentation/d/1k9R4tL7mN3vB6cZ1xW8tY2uJ5hG0fD3s/edit?usp=drivesdk), [26.2 Operational Mastery Protocol](https://docs.google.com/presentation/d/1j5W8kL3mN7vB2cZ9xR4tY6uJ1hG0fD7s/edit?usp=drivesdk)

## 1. Dashboard Architecture & UX Philosophy (Why Zero Navigation CTAs)

### 1.1 The Core Problem to Solve
Because the ERP already has a dedicated **Left Sidebar** for navigating to operational workspaces (CRM, Opportunities, EPs, IR, Delivery, Finance, Team), placing `"Go to Module"` Call-to-Action (CTA) buttons on the Main Dashboard wastes screen space and forces the user to leave the dashboard just to inspect performance.

Instead, the **Main Dashboard** must function as an **Interactive Analytical Command Center** built around **Selectable / Clickable Domain KPI Cards**:
1. **Level 1 — Global Filter & Context Bar (Top Sticky Bar)**:
   - Filters every card and graph simultaneously by:
     - **Mandate / Term**: `26.1`, `26.2`, `Custom Date Range`, `Peak: Winter / Summer`.
     - **Product**: `All ICX`, `iGV` (Global Volunteer), `iGTa` (Global Talent), `iGTe` (Global Teacher).
     - **Rabat Organizational Engine** (from [iGV MM Application Consultancy](https://docs.google.com/presentation/d/1p7W4kL9mN2vB5cZ8xR3tY6uJ1hG0fD4s/edit?usp=drivesdk)): `All Engines`, `External Engine (BD, Sales, Partner Branding)`, `Internal Engine (Ops, IR, Quality, Visa/Logistics)`.
     - **Team / Owner**: Filter by `LCVP`, `Middle Manager (MM) / Team Leader (TL)`, or individual `Team Member (TM)`.
2. **Level 2 — 9 Clickable Domain Summary Cards (3×3 Interactive Grid)**:
   - Each card represents one core ICX or Team domain.
   - **What is visible on the collapsed card**:
     - **Domain Title & Health Badge** (`Green: On Track`, `Amber: At Risk`, `Red: SLA Breach`).
     - **1 Primary MoS (Measure of Success)** in large typography (`Target vs. Actual` + `% Attainment`).
     - **3 Top Headline KPIs** with `WoW` (Week-over-Week) delta arrows (`▲ +12%` / `▼ -4%`).
     - **1 Micro-Visualization** (Sparkline, Mini Bullet Bar, or Mini Donut) for instant visual scanning.
   - **No `"Go to Page"` CTA buttons**: The entire card is an interactive selection trigger (`onClick -> selectDomainCard(card_id)`).
3. **Level 3 — In-Place Expanded KPI & Graph Analytics Panel (Below or Slide-Over Split View)**:
   - When the user clicks any of the 9 cards, an **In-Place Deep-Dive Analytics Panel** expands immediately inside the Dashboard (highlighting the active card border).
   - Inside this expanded panel, the user sees:
     - **Complete KPI Scorecard Table** for that domain (every sub-KPI, exact mathematical formula, current value, target, `% achieved`, and responsible role).
     - **3 to 4 Interactive Domain Graphs** engineered for rapid human reading (Funnel bars, Bullet charts, Heatmaps, Cohort curves, Scatter plots).
     - **Actionable Exception / Bottlenecks List** (e.g., specific stalled EPs, overdue B2B proposals, or disengaged members in Tier 4) that can be inspected in a modal drawer without losing dashboard context.

## 2. Where to Find & Verify KPIs on AIESEC Hub (`hub.aiesec.org`) & EXPA

To ensure the ERP mirrors official AIESEC global measurement frameworks (`MoS` = Measures of Success; `KPIs` = Key Performance Indicators), here is the exact navigation map across [AIESEC Hub (`https://www.hub.aiesec.org/`)](https://www.hub.aiesec.org/), [EXPA (`https://expa.aiesec.org/`)](https://expa.aiesec.org/), and the official Compendium:

| Hub / Platform Section | Exact URL / Path | What KPIs, Frameworks & Guides You Find There | ERP Dashboard Card Mapped |
| :--- | :--- | :--- | :--- |
| **1. AIESEC Hub — Main Portal** | [https://www.hub.aiesec.org/](https://www.hub.aiesec.org/) | Central entry point to `Exchange Hub`, `IM Hub`, and `Functional Hub`, plus global network announcements and 2025/2026 AIESEC Way & Strategy materials. | All 9 Cards |
| **2. Exchange Hub — Product Academies (`iGV`, `iGTa`, `iGTe`)** | [https://www.hub.aiesec.org/exchange-hub](https://www.hub.aiesec.org/exchange-hub) → *Select Product (GV / GTa / GTe) → Operations & Customer Flow* | • **Funnel MoS & KPIs**: `Openings` → `APP` → `SHORTLISTED` → `ACC` → `APD` → `RE` → `FIN` → `CO`.<br>• **Conversion Rate (`CR%`) & Process Time (`PT`) benchmarks**.<br>• **IR Supply & Partnership Tiering KPIs**.<br>• **Pre-Arrival & Visa Timeline SLAs** ([AEPP IPM 2024](https://drive.google.com/file/d/16S6K2fH1w27hXefr-m6gD9B5K2eX3L4V/view?usp=drivesdk)). | **Card 1** (Funnel)<br>**Card 3** (Opportunities)<br>**Card 4** (IR Supply)<br>**Card 5** (Pre-Arrival & Visa) |
| **3. Exchange Hub — Exchange Standards & CXP** | [https://www.hub.aiesec.org/exchange-hub](https://www.hub.aiesec.org/exchange-hub) → *Exchange Standards / Customer Experience* & [2024 Exchange Standards Refreshment](https://drive.google.com/file/d/1w8c-x6L4p9T2mN5vR7bK1qY3zF0jH8dG/view?usp=drivesdk) | • **18 Exchange Standards** (`13 Mandatory` + `5 Non-Mandatory`).<br>• **`Complete (CO)` Formula**: `100% of 13 Mandatory` + `≥3 of 5 Non-Mandatory`.<br>• **Two-Survey Architecture**: `Middle Survey` (`#1–#10a` at `RE + 3d`) & `Final Survey` (`#10b–#18` at `FIN - 3d`).<br>• **NPS (Net Promoter Score)** & **LDA (Leadership Development Assessment)**.<br>• **Standard `#6` (Arrival Pickup)** & **Standard `#7` (Accommodation)**. | **Card 6** (CXP & 18 Standards)<br>**Card 7** (Accommodation & Pickup) |
| **4. IM Hub — Information Management & Analytics** | [https://www.hub.aiesec.org/im-hub](https://www.hub.aiesec.org/im-hub) → *EXPA Guides / Data & Analytics / Dashboards* | • **EXPA Analytics Definitions**: How EXPA calculates `Applications`, `Approvals`, `Realizations`, `Completions`, `Process Time (Days)`, and `Standards %`.<br>• **Funnel Leakage & Bottleneck Analysis** methodology.<br>• **GIS API (`gis-api.aiesec.org`)** field mappings for automated syncing. | **Card 1** (Funnel & Velocity)<br>**Card 3** (Slot Utilization)<br>**Card 4** (Country-to-Country Matrix) |
| **5. Functional Hub — Talent Management (`TM`) Academy** | [https://www.hub.aiesec.org/functional-hub](https://www.hub.aiesec.org/functional-hub) → *Talent Management (TM) / Team Standards (TeSt)* | • **AIESEC Team Standards (`TeSt`)**: The 3 stages (**Building**, **Performing**, **Closing**) and their mandatory sub-elements.<br>• **Member Engagement & Retention KPIs**: Personal Goal Achievement (`% MoS/KPI met`), **O2O (`One-to-One`)** frequency (`Monthly TL2TM & LCVP2TL`), Meeting Attendance, **MX NPS / EwA (Engagement with AIESEC)**, and PDP tracking. | **Card 9** (Member Engagement, Team Standards & People Analytics) |
| **6. Functional Hub — BD / EwA / Sales Academy** | [https://www.hub.aiesec.org/functional-hub](https://www.hub.aiesec.org/functional-hub) → *Business Development (BD) / ICX Sales* & [APIP Oct 2024](https://drive.google.com/file/d/1vI9C6-hF4A6v3B1q5W4z9X8K2L7M3N1P/view?usp=drivesdk) | • **B2B Sales Pipeline Stages & KPIs**: Prospecting volume, Cold Outreach → Meeting conversion, Discovery-to-Proposal rate, Proposal-to-Contract win rate, Sales Cycle Velocity (days), Account Manager 7-day assignment SLA (`APIP 4.3.2`), and Partner NPS/Retention. | **Card 2** (B2B CRM & Sales Pipeline) |
| **7. Functional Hub — Finance & Legal (`FnL`) Academy** | [https://www.hub.aiesec.org/functional-hub](https://www.hub.aiesec.org/functional-hub) → *Finance & Legal (FnL)* & [AFPM Aug 2022](https://drive.google.com/file/d/1cK8pQ2W9xL4mN7vB3zR6tY1uJ5hG8fD0/view?usp=drivesdk) | • **AFPM Sustainability Model**: `Direct Exchange Sustainability Ratio = Direct Exchange Revenue / Direct Exchange Costs > 1.0`.<br>• **NGO/CSR Project Funding Rule**: `≥70–100%` of iGV costs covered by OP/CSR grants.<br>• **Months of Financial Reserves (`≥6.0`)**, Accounts Receivable aging, and `AEPP Annex 2` compensation liability reserves. | **Card 8** (AFPM Finance & Sustainability) |
| **8. EXPA Live Analytics Module** | `https://expa.aiesec.org/analytics` | • **`Analytics → Performance`**: Total `OPEN`, `APP`, `ACC`, `APD`, `RE`, `FIN`, `CO` by LC/Product.<br>• **`Analytics → E2E`**: Entity-to-Entity (`Host LC Rabat` ↔ `Home LC`) funnel & conversion rates.<br>• **`Analytics → Standards`**: Real-time percentage fulfillment for each of the 18 Exchange Standards.<br>• **`Analytics → Graphical`**: Time-series comparison of approvals and realizations across peaks. | **Cards 1, 3, 4, 6** |

## 3. Complete Specification of the 9 Clickable Dashboard Cards (KPIs, Formulas, Thresholds & Graphs)

Below is the exact blueprint for each of the **9 Clickable Cards** on the Main Dashboard: what shows on the collapsed card, every MoS and KPI inside the expanded view, its exact formula, target/thresholds, and the exact graph specification to render it efficiently.

### CARD 1: Core ICX Exchange Funnel & Process Velocity (`OPEN → CO`)
*Derived from [Exchange Hub](https://www.hub.aiesec.org/exchange-hub), [IM Hub](https://www.hub.aiesec.org/im-hub), and [AIESEC RABAT 26 - iGV S1 Closing Report](https://docs.google.com/document/d/1_BZFmxtlFvIdiWXOEcEvIczSWxaGym-U6lKFwciJ9Zo/edit?usp=drivesdk).*

#### A. Collapsed Card Preview (What User Sees Before Clicking)
- **Primary MoS**: **`# Realizations (RE)` vs. Term Goal** (e.g., `24 / 35 RE` — `68.6%`) & **`# Completions (CO)`** (`100% Standards Pass`).
- **3 Headline KPIs**:
  1. **`# Approvals (APD)`**: Current count vs. Target (`e.g., 31 / 40 APD`).
  2. **`Overall APP → APD Conversion Rate %`**: Percentage of applicants who reach Approved.
  3. **`Avg Approval Velocity (APP → APD Days)`**: Mean days from application to full approval.
- **Card Micro-Visual**: 6-Bar Mini Horizontal Funnel (`APP` → `ACC` → `APD` → `RE` → `FIN` → `CO`).

#### B. Expanded Drill-Down KPI Table (When Card 1 is Clicked)
| Metric Type | KPI Name | Exact Mathematical Formula | Data Source / ERP Table | Target / Benchmark (Rabat) | RAG Thresholds (Green / Amber / Red) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MoS** | **Total Completions (`CO`)** | $\text{Count}(\text{EPs where } \text{status} = \text{COMPLETE})$ | `ep_applications` (`EXPA Sync`) | `≥ 85%` of `FIN` | 🟢 `≥85%` \| 🟡 `70–84%` \| 🔴 `<70%` |
| **MoS** | **Total Realizations (`RE`)** | $\text{Count}(\text{EPs where } \text{status} \in \{\text{REALIZED, FINISHED, COMPLETE}\})$ | `ep_applications` | Per Term Plan (e.g. `35 iGV`, `15 iGTa/e`) | 🟢 `≥90% pace` \| 🟡 `70–89%` \| 🔴 `<70%` |
| **MoS** | **Total Approvals (`APD`)** | $\text{Count}(\text{EPs where } \text{Both Host \& Home Approved})$ | `ep_applications` | `1.15×` of `RE` Target | 🟢 `≥90% pace` \| 🟡 `70–89%` \| 🔴 `<70%` |
| **KPI (Volume)** | **Opened Slots (`OPEN`)** | $\sum \text{openings across LIVE opportunities}$ | `opportunities` / `opportunity_slots` | `≥ 1.5×` of `APD` Target | 🟢 `≥1.5×` \| 🟡 `1.1–1.49×` \| 🔴 `<1.1×` |
| **KPI (Volume)** | **Total Applications (`APP`)** | $\text{Count}(\text{applications received in period})$ | `ep_applications` | `4×–6×` of `APD` Target (`iGV`), `8×` (`iGT`) | 🟢 `≥100% pace` \| 🟡 `75–99%` \| 🔴 `<75%` |
| **KPI (Volume)** | **Shortlisted EPs (`SHORTLISTED`)** | $\text{Count}(\text{EPs passing initial ICX screening})$ | `ep_applications` | `≥ 60%` of `APP` | 🟢 `≥60%` \| 🟡 `40–59%` \| 🔴 `<40%` |
| **KPI (Volume)** | **Accepted by Host (`ACC`)** | $\text{Count}(\text{EPs with OP Acceptance + Offer Signed})$ | `ep_applications` | `1.25×` of `APD` Target | 🟢 `≥90% pace` \| 🟡 `70–89%` \| 🔴 `<70%` |
| **KPI (CR%)** | **`APP → ACC` Conversion Rate** | $(\text{Total ACC} / \text{Total APP}) \times 100$ | Calculated | `≥ 25%` (`iGV`) / `≥ 15%` (`iGTa/e`) | 🟢 `≥25%` \| 🟡 `15–24%` \| 🔴 `<15%` |
| **KPI (CR%)** | **`ACC → APD` Conversion Rate** | $(\text{Total APD} / \text{Total ACC}) \times 100$ | Calculated | `≥ 80%` (Minimal drop after acceptance) | 🟢 `≥80%` \| 🟡 `65–79%` \| 🔴 `<65%` |
| **KPI (CR%)** | **`APD → RE` Realization Rate** | $(\text{Total RE} / \text{Total APD}) \times 100$ | Calculated | `≥ 88%` (Low Approval Broken rate) | 🟢 `≥88%` \| 🟡 `75–87%` \| 🔴 `<75%` |
| **KPI (CR%)** | **`RE → CO` Completion Rate** | $(\text{Total CO} / \text{Total RE}) \times 100$ | Calculated | `≥ 85%` (Standards + Survey completion) | 🟢 `≥85%` \| 🟡 `70–84%` \| 🔴 `<70%` |
| **KPI (CR%)** | **Overall `APP → RE` E2E Yield** | $(\text{Total RE} / \text{Total APP}) \times 100$ | Calculated ([Rabat S1 Closing Report](https://docs.google.com/document/d/1_BZFmxtlFvIdiWXOEcEvIczSWxaGym-U6lKFwciJ9Zo/edit?usp=drivesdk)) | `≥ 18%` (`iGV`) / `≥ 10%` (`iGT`) | 🟢 `≥18%` \| 🟡 `10–17%` \| 🔴 `<10%` |
| **KPI (Velocity)** | **Screening Speed (`APP → Shortlist/Contact`)** | $\text{Avg}(\text{first\_contact\_at} - \text{applied\_at}) \text{ in hours}$ | `ep_applications` | `≤ 24 Hours` (Internal Rabat SLA) | 🟢 `≤24h` \| 🟡 `24–48h` \| 🔴 `>48h` |
| **KPI (Velocity)** | **Acceptance Speed (`APP → ACC`)** | $\text{Avg}(\text{accepted\_at} - \text{applied\_at}) \text{ in days}$ | `ep_applications` | `≤ 3 Days` (`iGV`) / `≤ 7 Days` (`iGTa/e`) | 🟢 `≤3d` \| 🟡 `3.1–6d` \| 🔴 `>6d` |
| **KPI (Velocity)** | **Approval Speed (`ACC → APD`)** | $\text{Avg}(\text{approved\_at} - \text{accepted\_at}) \text{ in days}$ | `ep_applications` | `≤ 2 Days` (`48h` Payment & LDA SLA) | 🟢 `≤2d` \| 🟡 `2.1–4d` \| 🔴 `>4d` |
| **KPI (Velocity)** | **Total Approval Time (`APP → APD`)** | $\text{Avg}(\text{approved\_at} - \text{applied\_at}) \text{ in days}$ | `ep_applications` ([Rabat S1 Closing Report](https://docs.google.com/document/d/1_BZFmxtlFvIdiWXOEcEvIczSWxaGym-U6lKFwciJ9Zo/edit?usp=drivesdk)) | `≤ 5 Days` (`iGV`) / `≤ 10 Days` (`iGTa/e`) | 🟢 `≤5d` \| 🟡 `5.1–9d` \| 🔴 `>9d` |
| **KPI (Leakage)** | **Lost / Dropped EPs (`Withdrawn + Rejected + Broken`)** | $\text{Count}(\text{EPs exiting funnel}) \text{ grouped by reason code}$ | `ep_applications` | `< 12%` post-Acceptance Breakage | 🟢 `<12%` \| 🟡 `12–20%` \| 🔴 `>20%` |

#### C. Graphs to Render in Card 1 Expanded View (And Why They Are Efficient)
1. **Graph 1.1: Stepped Horizontal Conversion Funnel with Drop-Off Bridges**
   - **Why this graph**: Standard vertical funnels distort bar widths and hide stage-to-stage conversion percentages. A **Horizontal Bar Funnel with connector bridges** lets the eye read left-to-right (or top-to-bottom) with exact bar lengths proportional to volume (`APP` → `SHORTLISTED` → `ACC` → `APD` → `RE` → `FIN` → `CO`) while showing the exact `CR%` badge between every pair of bars.
   - **Axes & Encoding**: Y-Axis = 7 Funnel Stages; X-Axis = Absolute EP Count + overlaid dashed vertical marker for `Target Count` at each stage.
2. **Graph 1.2: Process Velocity Bullet Chart (`Actual Days vs. SLA Target Days`)**
   - **Why this graph**: Gauges waste space. A **Horizontal Bullet Chart** compares `Actual Average Days` (inner solid bar) against `SLA Target Days` (vertical black threshold line) and background Red/Amber/Green zones for `APP→Contact`, `Contact→ACC`, `ACC→APD`, and `Total APP→APD`.
3. **Graph 1.3: Cumulative Weekly Pace Line Chart (`Actual vs. Planned APD & RE S-Curve`)**
   - **Why this graph**: Shows immediately whether Rabat is ahead or behind the weekly peak curve (`Weeks 1 to 26` of the semester).
   - **Axes**: X-Axis = Semester Weeks (`W1..W26`); Y-Axis = Cumulative `APD` and `RE` count; Series 1 = Dashed Target S-Curve, Series 2 = Solid Actual Line.
4. **Graph 1.4: Pareto Horizontal Bar of "Lost EP" Root Causes**
   - **Why this graph**: Replaces unreadable pie charts. Ranks rejection/withdrawal reasons (`Unresponsive >48h`, `Visa Denied`, `Parent/Financial Objection`, `Failed Language Check`, `OP Slow Interview`) from highest to lowest with a cumulative `%` line.

### CARD 2: B2B Partner CRM, Prospecting & Sales Pipeline (`External Engine`)
*Derived from [Functional Hub — BD/Sales](https://www.hub.aiesec.org/functional-hub), [APIP Oct 2024](https://drive.google.com/file/d/1vI9C6-hF4A6v3B1q5W4z9X8K2L7M3N1P/view?usp=drivesdk), and [iGV MM Application Consultancy](https://docs.google.com/presentation/d/1p7W4kL9mN2vB5cZ8xR3tY6uJ1hG0fD4s/edit?usp=drivesdk).*

#### A. Collapsed Card Preview
- **Primary MoS**: **`# Signed Partner Contracts (Active OPs)`** & **`Total Contracted B2B Value (MAD)`** vs. Term Target.
- **3 Headline KPIs**:
  1. **`# Discovery Meetings Held (This Month / Term)`**: Active B2B sales meetings completed.
  2. **`Proposal → Signed Contract Win Rate %`**: Efficiency of closing pitched partners.
  3. **`# Stale B2B Leads (>7 Days Without Touchpoint)`**: Immediate CRM hygiene alert.
- **Card Micro-Visual**: Stacked Pipeline Stage Bar (`Lead` → `Contacted` → `Meeting` → `Proposal` → `Signed`).

#### B. Expanded Drill-Down KPI Table (When Card 2 is Clicked)
| Metric Type | KPI Name | Exact Mathematical Formula | Data Source / ERP Table | Target / Benchmark (Rabat) | RAG Thresholds (Green / Amber / Red) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MoS** | **Signed Partner Contracts (`MOU / Contract`)** | $\text{Count}(\text{B2B Deals reaching } \text{Signed} \text{ in term})$ | `b2b_deals` / `contracts` | Per Term Plan (e.g. `15 NGOs/Schools`, `8 Companies`) | 🟢 `≥90% pace` \| 🟡 `70–89%` \| 🔴 `<70%` |
| **MoS** | **Contracted B2B Pipeline Revenue (`MAD`)** | $\sum (\text{contract\_total\_mad}) \text{ for Signed Contracts}$ | `contracts` | `≥ 100%` of Budgeted B2B Inflow | 🟢 `≥95%` \| 🟡 `75–94%` \| 🔴 `<75%` |
| **KPI (Top Funnel)** | **New Qualified Leads Sourced (`MQLs`)** | $\text{Count}(\text{New Organizations added passing Legal/Tax check})$ | `organizations` | `≥ 20 New Leads / Week` across BD team | 🟢 `≥20/wk` \| 🟡 `12–19/wk` \| 🔴 `<12/wk` |
| **KPI (Activity)** | **Outreach Touchpoints Executed** | $\text{Count}(\text{Calls + Emails + LinkedIn + Visits logged})$ | `stakeholder_interactions` | `≥ 50 Touchpoints / Week` | 🟢 `≥50/wk` \| 🟡 `30–49/wk` \| 🔴 `<30/wk` |
| **KPI (CR%)** | **Cold Outreach → Response Rate %** | $(\text{Leads Replying} / \text{Leads Contacted}) \times 100$ | `b2b_deals` | `≥ 30%` | 🟢 `≥30%` \| 🟡 `18–29%` \| 🔴 `<18%` |
| **KPI (Activity)** | **Discovery Meetings Completed** | $\text{Count}(\text{Meetings with complete BANT/Discovery Notes})$ | `stakeholder_interactions` | `≥ 8 Meetings / Week` | 🟢 `≥8/wk` \| 🟡 `5–7/wk` \| 🔴 `<5/wk` |
| **KPI (CR%)** | **Meeting → Proposal Sent Rate %** | $(\text{Deals with Proposal Sent} / \text{Discovery Meetings}) \times 100$ | `b2b_deals` | `≥ 65%` | 🟢 `≥65%` \| 🟡 `45–64%` \| 🔴 `<45%` |
| **KPI (CR%)** | **Proposal → Contract Win Rate %** | $(\text{Signed Contracts} / \text{Proposals Sent}) \times 100$ | `b2b_deals` | `≥ 40%` (`NGOs/Schools`), `≥ 25%` (`Corporates`) | 🟢 `≥35%` \| 🟡 `20–34%` \| 🔴 `<20%` |
| **KPI (Velocity)** | **Average B2B Sales Cycle (`Days to Close`)** | $\text{Avg}(\text{contract\_signed\_at} - \text{first\_outreach\_at})$ | `b2b_deals` | `≤ 21 Days` (`iGV`), `≤ 35 Days` (`iGTa/e`) | 🟢 `≤21d` \| 🟡 `22–35d` \| 🔴 `>35d` |
| **KPI (Value)** | **Weighted Pipeline Value (`MAD`)** | $\sum (\text{Deal Value MAD} \times \text{Stage Probability \%})$ | `b2b_deals` | `≥ 2.5×` of Remaining Revenue Target | 🟢 `≥2.5×` \| 🟡 `1.5–2.4×` \| 🔴 `<1.5×` |
| **KPI (Retention)** | **Partner Renewal / Multi-Peak Retention %** | $(\text{Returning OPs Resigning} / \text{Previous Peak OPs}) \times 100$ | `organizations` | `≥ 60%` Repeat Partner Rate | 🟢 `≥60%` \| 🟡 `40–59%` \| 🔴 `<40%` |
| **KPI (SLA)** | **Stale Pipeline Deals (`>7 Days No Follow-Up`)** | $\text{Count}(\text{Open Deals where } \text{now} - \text{last\_contact} > 7\text{d})$ | `b2b_deals` | `0 Stale Deals` | 🟢 `0` \| 🟡 `1–3` \| 🔴 `≥4` |

#### C. Graphs to Render in Card 2 Expanded View
1. **Graph 2.1: B2B Sales Funnel & Stage-to-Stage Conversion Bar Chart**
   - **Why this graph**: Shows both `Count of Organizations` and `Weighted MAD Value` across the 7 CRM stages (`Sourced` → `Qualified` → `Contacted` → `Discovery Held` → `Proposal Sent` → `Negotiation` → `Signed`).
2. **Graph 2.2: Stacked Bar Chart of B2B Pipeline by Sector & Product (`NGO`, `Private School`, `Startup`, `Corporate`)**
   - **Why this graph**: Allows the LCVP BD/ICX to see immediately if the pipeline is over-reliant on one sector (e.g., only NGOs and zero Language Centers or IT companies).
3. **Graph 2.3: Member / BD Rep Activity vs. Results Scatter Plot (or Grouped Bar)**
   - **Why this graph**: Plots `X = Outreach + Follow-ups Logged` vs. `Y = Discovery Meetings + Signed Contracts` per BD team member, immediately revealing whether a low-performing member has an **activity problem** (low outreach) or a **skill/coaching problem** (high outreach, zero conversions).
4. **Graph 2.4: Deal Aging Heatmap (`Pipeline Stage × Days in Current Stage`)**
   - **Why this graph**: Highlights exactly where deals are getting stuck (`<7d Green`, `7–14d Amber`, `>14d Red`) so the MM External Engine can intervene before partners go cold.

### CARD 3: Opportunity & Slot Capacity Health (`Product & Portfolio Management`)
*Derived from [Global Volunteer Portfolio](https://drive.google.com/file/d/1y9R3tP6mW2kL8nX4vB1cZ7qF5gH0jD2s/view?usp=drivesdk) and [APIP Oct 2024](https://drive.google.com/file/d/1vI9C6-hF4A6v3B1q5W4z9X8K2L7M3N1P/view?usp=drivesdk).*

#### A. Collapsed Card Preview
- **Primary MoS**: **`% Slot Fill Rate (Approved Slots / Total Opened Slots)`** (e.g., `34 / 45 Slots Filled — 75.5%`).
- **3 Headline KPIs**:
  1. **`# Live Opportunities on EXPA`**: Active published opportunities (`iGV`, `iGTa`, `iGTe`).
  2. **`% Opportunities with Account Manager Assigned ≤7d`**: [APIP Clause 4.3.2](https://drive.google.com/file/d/1vI9C6-hF4A6v3B1q5W4z9X8K2L7M3N1P/view?usp=drivesdk) compliance.
  3. **`OP Unjustified Rejection Alert Counter`**: OPs with `≥2` unjustified rejections of qualified EPs ([APIP Clause 3.2.8](https://drive.google.com/file/d/1vI9C6-hF4A6v3B1q5W4z9X8K2L7M3N1P/view?usp=drivesdk) limit is `3`).
- **Card Micro-Visual**: Horizontal Segmented Progress Bar (`Booked Slots [APD/RE]` vs. `In-Process [ACC]` vs. `Empty Available Slots`).

#### B. Expanded Drill-Down KPI Table (When Card 3 is Clicked)
| Metric Type | KPI Name | Exact Mathematical Formula | Data Source / ERP Table | Target / Benchmark (Rabat) | RAG Thresholds (Green / Amber / Red) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MoS** | **Overall Slot Fill Rate %** | $(\text{Slots with APD or RE} / \text{Total Contracted Slots}) \times 100$ | `opportunity_slots` | `≥ 85%` at least `30d` before project start | 🟢 `≥85%` \| 🟡 `65–84%` \| 🔴 `<65%` |
| **KPI (Supply)** | **Live Published Opportunities** | $\text{Count}(\text{Opportunities with } \text{status} = \text{LIVE on EXPA})$ | `opportunities` | `100%` of signed contracts published `≤5d` | 🟢 `100%` \| 🟡 `85–99%` \| 🔴 `<85%` |
| **KPI (Portfolio)** | **SDG & Global Project Alignment % (`iGV`)** | $(\text{iGV Slots on Official Global Projects} / \text{Total iGV Slots}) \times 100$ | `opportunities` ([Global Volunteer Portfolio](https://drive.google.com/file/d/1y9R3tP6mW2kL8nX4vB1cZ7qF5gH0jD2s/view?usp=drivesdk)) | `100%` (*Heartbeat, Fingerprint, Global Classroom, Green Leaders, Youth 4 Impact, Raise Your Voice, Explorer, Happy Bus, Skill Up!, On The Map, Equify, Eco City, Aquatica, Rooted, Myself My World, Scale Up!*) | 🟢 `100%` \| 🟡 `90–99%` \| 🔴 `<90%` |
| **KPI (Demand)** | **Applications per Open Slot Ratio** | $\text{Total APP for Opportunity} / \text{Total Openings}$ | `opportunities` | `≥ 4.0 APP / Slot` (`iGV`), `≥ 6.0` (`iGT`) | 🟢 `≥4.0` \| 🟡 `2.0–3.9` \| 🔴 `<2.0` (Low attraction) |
| **KPI (SLA)** | **7-Day Account Manager Assignment %** | $(\text{OPs assigned AM within } \le 7\text{d of Publication} / \text{Total OPs}) \times 100$ | `opportunities` ([APIP 4.3.2](https://drive.google.com/file/d/1vI9C6-hF4A6v3B1q5W4z9X8K2L7M3N1P/view?usp=drivesdk)) | `100%` Mandatory APIP Standard | 🟢 `100%` \| 🟡 `90–99%` \| 🔴 `<90%` |
| **KPI (SLA)** | **OP Candidate Review Speed (`Hours`)** | $\text{Avg}(\text{op\_decision\_at} - \text{shortlist\_sent\_to\_op\_at})$ | `ep_applications` | `≤ 48 Hours` (`iGV`), `≤ 72 Hours` (`iGTa/e`) | 🟢 `≤48h` \| 🟡 `49–72h` \| 🔴 `>72h` |
| **KPI (Risk)** | **Unjustified OP Rejections Count** | $\text{Count}(\text{Rejections where EP met 100\% JD requirements})$ | `opportunities` ([APIP 3.2.8](https://drive.google.com/file/d/1vI9C6-hF4A6v3B1q5W4z9X8K2L7M3N1P/view?usp=drivesdk)) | `0` (Max allowed by APIP before termination = `3`) | 🟢 `0–1` \| 🟡 `2` \| 🔴 `≥3 (Suspend OP)` |
| **KPI (Expiry)** | **Expiring Unfilled Slots (`<21 Days to Start`)** | $\text{Count}(\text{Empty Slots where } \text{start\_date} - \text{today} < 21\text{d})$ | `opportunity_slots` | `0 Slots` | 🟢 `0` \| 🟡 `1–3` \| 🔴 `≥4` |

#### C. Graphs to Render in Card 3 Expanded View
1. **Graph 3.1: 100% Stacked Horizontal Bar of Slot Capacity per Opportunity / Partner**
   - **Why this graph**: Each row is one Opportunity (e.g., *Global Classroom — Smart Kids Rabat*, *Skill Up! — Youth Center Salé*). The bar shows exact slots segmented into: `🟢 Realized/Approved`, `🔵 Accepted (Pending APD)`, `🟡 In Interview`, and `⚪ Empty/Unfilled`. The user immediately sees which project has empty slots expiring soon.
2. **Graph 3.2: Treemap or Horizontal Bar of `iGV` SDG & Project Portfolio Mix + `iGTa/iGTe` Sub-Products**
   - **Why this graph**: Shows portfolio balance across SDG 4 (*Global Classroom*, *Skill Up!*), SDG 8 (*Scale Up!*), SDG 13 (*Green Leaders*), and `iGTa`/`iGTe` durations (`Short 6–12w`, `Medium 3–6m`, `Long 6–18m`).

### CARD 4: International Relations (IR) Supply & Country Partnership Performance
*Derived from [International Relations Strategy](https://docs.google.com/presentation/d/1k9R4tL7mN3vB6cZ1xW8tY2uJ5hG0fD3s/edit?usp=drivesdk), [Exchange Hub](https://www.hub.aiesec.org/exchange-hub), and [IM Hub — E2E Analytics](https://www.hub.aiesec.org/im-hub).*

#### A. Collapsed Card Preview
- **Primary MoS**: **`% of Total Approvals Coming from Official IR Partner LCs`** (Target: `≥ 70%` of all approvals sourced via structured IR partnerships rather than random organic applications).
- **3 Headline KPIs**:
  1. **`IR Quota Attainment %`**: `Actual APD vs. Jointly Planned IR Target APD`.
  2. **`Avg IR Counterpart Response Time (Hours)`**: Speed of Home LC OGV/OGT VPs in pushing payment/LDA/docs.
  3. **`Sending Entity (SE) Standards Fulfillment %`**: Home LC compliance on Standards `#1`, `#2`, `#3`, and `#18`.
- **Card Micro-Visual**: Top 5 Supply Countries Mini Horizontal Bar (`Tunisia`, `Egypt`, `Turkey`, `Spain`, `Germany/Italy`).

#### B. Expanded Drill-Down KPI Table (When Card 4 is Clicked)
| Metric Type | KPI Name | Exact Mathematical Formula | Data Source / ERP Table | Target / Benchmark (Rabat) | RAG Thresholds (Green / Amber / Red) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MoS** | **IR Partner Supply Share %** | $(\text{APD from Tier 1 \& 2 IR Partners} / \text{Total APD}) \times 100$ | `ir_partnerships` + `ep_applications` | `≥ 70%` from structured IR partners | 🟢 `≥70%` \| 🟡 `50–69%` \| 🔴 `<50%` |
| **MoS** | **IR Joint Quota Attainment (`APD & RE`)** | $(\text{Actual IR Partner APD} / \text{Committed IR Quota APD}) \times 100$ | `ir_partnerships` | `≥ 85%` of signed IR Partnership Quota | 🟢 `≥85%` \| 🟡 `65–84%` \| 🔴 `<65%` |
| **KPI (CR%)** | **Country-to-Country (`E2E`) Conversion %** | $(\text{APD from Country X} / \text{APP from Country X}) \times 100$ | `ep_applications` (`EXPA E2E`) | `≥ 25%` for Visa-Free / `≥ 15%` for e-Visa | 🟢 `≥25%` \| 🟡 `15–24%` \| 🔴 `<15%` |
| **KPI (Velocity)** | **Home LC Approval Push Speed (`ACC → APD`)** | $\text{Avg}(\text{home\_approved\_at} - \text{host\_accepted\_at}) \text{ per Home LC}$ | `ep_applications` | `≤ 48 Hours` | 🟢 `≤48h` \| 🟡 `49–96h` \| 🔴 `>96h` |
| **KPI (SLA)** | **IR Counterpart Communication Response Time** | $\text{Avg}(\text{reply\_timestamp} - \text{request\_timestamp}) \text{ in hours}$ | `ir_partnerships` / `stakeholder_interactions` | `≤ 12 Hours` on WhatsApp / Email | 🟢 `≤12h` \| 🟡 `13–24h` \| 🔴 `>24h` |
| **KPI (Quality)** | **Home LC Sending Standards (`#1, #2, #3, #18`) %** | $\text{Avg \% fulfillment of PSG (\#1), OPS (\#2), Insurance (\#3), Debrief (\#18)}$ | `exchange_standards` | `100%` Mandatory SE Compliance | 🟢 `≥95%` \| 🟡 `80–94%` \| 🔴 `<80%` |
| **KPI (Routine)** | **Bi-Weekly IR Sync Touchpoint Adherence %** | $(\text{Completed IR Sync Calls} / \text{Scheduled Bi-Weekly Calls}) \times 100$ | `ir_partnerships` | `100%` for Tier-1 Strategic LCs | 🟢 `≥90%` \| 🟡 `70–89%` \| 🔴 `<70%` |

#### C. Graphs to Render in Card 4 Expanded View
1. **Graph 4.1: IR Partner 2×2 Strategic Quadrant Scatter Plot (`Volume vs. Conversion Efficiency`)**
   - **Why this graph**: Plots every partner LC/MC on `X-Axis = Application Volume Sent (APP)` and `Y-Axis = APP → APD Conversion Rate %`, with bubble size = `Total Realizations (RE)` and bubble color = `Visa Regime (Green = 90d Visa-Free, Blue = AEVM e-Visa, Orange = Embassy Visa)`.
   - **How to read it instantly**:
     - **Top-Right Quadrant (`Stars / Tier 1`)**: High APP volume + High Conversion % → Scale & prioritize slots.
     - **Bottom-Right Quadrant (`Time Wasters / Filter Needed`)**: High APP volume + Low Conversion % → Tighten pre-screening with that OGV/OGT VP.
     - **Top-Left Quadrant (`Hidden Gems / Tier 2`)**: Low APP volume + Very High Conversion % → Do joint promotion/info-sessions to boost volume.
2. **Graph 4.2: Grouped Bullet Chart of Quota Attainment (`Committed Quota vs. Actual APP / APD / RE per Partner LC`)**
   - **Why this graph**: Directly compares promised numbers from IR calls against actual EXPA delivery for top partners (e.g., *AIESEC in Bardo/Carthage Tunisia*, *AIESEC in Cairo/Ain Shams Egypt*, *AIESEC in Istanbul/Ankara Turkey*, *AIESEC in Madrid/Barcelona Spain*).

### CARD 5: Pre-Arrival, Visa Regimes & Rabat 14-Day Lock Compliance
*Derived from [AEPP IPM 2024](https://drive.google.com/file/d/16S6K2fH1w27hXefr-m6gD9B5K2eX3L4V/view?usp=drivesdk) and [26.2 Operational Mastery Protocol](https://docs.google.com/presentation/d/1j5W8kL3mN7vB2cZ9xR4tY6uJ1hG0fD7s/edit?usp=drivesdk).*

#### A. Collapsed Card Preview
- **Primary MoS**: **`% Upcoming Realizations Passing the Rabat 14-Day Pre-Arrival Lock`** (Target: `100%` of EPs arriving within 14 days have verified Visa, Flight, OP Readiness, and Vetted Bed).
- **3 Headline KPIs**:
  1. **`% Visa & Expectation Packs Sent ≤14d Post-APD`**: Mandatory Host Entity SLA ([AEPP Clause 4.4.3.1](https://drive.google.com/file/d/16S6K2fH1w27hXefr-m6gD9B5K2eX3L4V/view?usp=drivesdk)).
  2. **`% EPs Applying for Visa ≤14d Post-APD`**: Mandatory EP SLA ([AEPP Clause 4.4.2.1](https://drive.google.com/file/d/16S6K2fH1w27hXefr-m6gD9B5K2eX3L4V/view?usp=drivesdk)).
  3. **`# EPs Arriving in <14 Days with Missing Lock Items`**: Urgent Red Alert counter.
- **Card Micro-Visual**: 3-Segment Readiness Bar (`🟢 Locked & Ready`, `🟡 In Visa/Doc Process`, `🔴 Breach <14d to Arrival`).

#### B. Expanded Drill-Down KPI Table (When Card 5 is Clicked)
| Metric Type | KPI Name | Exact Mathematical Formula | Data Source / ERP Table | Target / Benchmark (Rabat) | RAG Thresholds (Green / Amber / Red) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MoS** | **Rabat 14-Day Pre-Arrival Lock Compliance %** | $(\text{EPs arriving in } \le 14\text{d with 100\% Lock Checklist} / \text{Total EPs arriving in } \le 14\text{d}) \times 100$ | `visa_arrival_Readiness` ([26.2 Operational Mastery Protocol](https://docs.google.com/presentation/d/1j5W8kL3mN7vB2cZ9xR4tY6uJ1hG0fD7s/edit?usp=drivesdk)) | `100%` Hard Rule (`OP Confirmed + Bed Assigned + Visa Issued + Ticket Uploaded + Pickup Assigned`) | 🟢 `100%` \| 🟡 `90–99%` \| 🔴 `<90%` |
| **KPI (SLA)** | **Host 14-Day Invitation & Expectation Pack SLA %** | $(\text{Packs sent } \le 14\text{d after APD} / \text{Total APD}) \times 100$ | `visa_arrival_readiness` ([AEPP 4.4.3.1](https://drive.google.com/file/d/16S6K2fH1w27hXefr-m6gD9B5K2eX3L4V/view?usp=drivesdk)) | `100%` (Avoids Host fault financial liability if visa rejected) | 🟢 `100%` \| 🟡 `90–99%` \| 🔴 `<90%` |
| **KPI (SLA)** | **EP 7-Day Visa Status Update & 14-Day Application %** | $(\text{EPs updating status } \le 7\text{d \& applying } \le 14\text{d} / \text{Total Visa-Req APD}) \times 100$ | `visa_arrival_readiness` ([AEPP 4.4.2.1](https://drive.google.com/file/d/16S6K2fH1w27hXefr-m6gD9B5K2eX3L4V/view?usp=drivesdk)) | `100%` (Protects Rabat from refund liability if EP delays) | 🟢 `≥95%` \| 🟡 `80–94%` \| 🔴 `<80%` |
| **KPI (Visa)** | **Visa Approval Success Rate % by Regime** | $(\text{Visas Granted} / \text{Visas Applied}) \times 100 \text{ per regime}$ | `visa_arrival_readiness` | `100%` (`90d Exempt`), `≥95%` (`AEVM e-Visa`), `≥85%` (`Embassy`) | 🟢 `≥90%` \| 🟡 `75–89%` \| 🔴 `<75%` |
| **KPI (SLA)** | **3-Day Pre-Arrival Written Pickup Instructions %** | $(\text{EPs receiving written pickup guide } \ge 3\text{d before flight} / \text{Total Arriving EPs}) \times 100$ | `visa_arrival_readiness` ([Standard #6](https://drive.google.com/file/d/1w8c-x6L4p9T2mN5vR7bK1qY3zF0jH8dG/view?usp=drivesdk)) | `100%` Mandatory Standard `#6` | 🟢 `100%` \| 🟡 `90–99%` \| 🔴 `<90%` |
| **KPI (Insurance)** | **Travel & Medical Insurance Verification % (`#3`)** | $(\text{APD EPs with verified policy covering full dates} / \text{Total APD}) \times 100$ | `visa_arrival_readiness` | `100%` prior to flight boarding | 🟢 `100%` \| 🟡 `90–99%` \| 🔴 `<90%` |

#### C. Graphs to Render in Card 5 Expanded View
1. **Graph 5.1: Pre-Arrival Countdown Risk Matrix (`Days Until Arrival × Readiness Checklist Completion %`)**
   - **Why this graph**: A 2D Grid/Scatter or Countdown Timeline where `X-Axis = Days Remaining Until Arrival (60d → 30d → 14d Lock Line → 3d Pickup Line → 0d Arrival)` and `Y-Axis = % of Pre-Arrival Checklist Completed`. Any EP bubble to the right of the vertical red `14-Day Lock Line` that is below `100%` flashes Red for immediate intervention.
2. **Graph 5.2: Stacked Bar of Approved EPs by Morocco Visa Regime & Current Visa Stage**
   - **Why this graph**: Compares `Regime 1: 90-Day Visa-Free Stamp`, `Regime 2: AEVM 24–72h e-Visa`, and `Regime 3: Consular Embassy Visa` segmented by `Docs Pending`, `Submitted`, `Approved`, and `Rejected`.

### CARD 6: Customer Experience (CXP), 18 Exchange Standards & Case Solving
*Derived from [2024 Exchange Standards Refreshment (18 Standards)](https://drive.google.com/file/d/1w8c-x6L4p9T2mN5vR7bK1qY3zF0jH8dG/view?usp=drivesdk) and [AEPP IPM 2024](https://drive.google.com/file/d/16S6K2fH1w27hXefr-m6gD9B5K2eX3L4V/view?usp=drivesdk).*

#### A. Collapsed Card Preview
- **Primary MoS**: **`% Complete (CO) Conversion Rate (CO / FIN)`** & **`Overall 18 Exchange Standards Fulfillment %`**.
- **3 Headline KPIs**:
  1. **`Middle Survey (#1–#10a) & Final Survey (#10b–#18) Response Rate %`**: Survey collection health.
  2. **`EP Net Promoter Score (NPS)` & `Partner NPS`**: Satisfaction score (`-100 to +100`).
  3. **`Active Safety / Quality Escalations`**: `Unreachable EPs >48h` (`Target: 0`) + Open `Stage 1/2/3 Cases`.
- **Card Micro-Visual**: 18-Block Mini Standards Status Strip (`13 Mandatory` + `5 Non-Mandatory` colored Green/Amber/Red).

#### B. Expanded Drill-Down KPI Table (When Card 6 is Clicked)
| Metric Type | KPI Name | Exact Mathematical Formula | Data Source / ERP Table | Target / Benchmark (Rabat) | RAG Thresholds (Green / Amber / Red) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MoS** | **Qualified Completion (`CO`) Rate %** | $(\text{EPs meeting 13/13 Mandatory + } \ge\text{3/5 Non-Mandatory} / \text{Total FIN}) \times 100$ | `exchange_standards` ([2024 Refreshment](https://drive.google.com/file/d/1w8c-x6L4p9T2mN5vR7bK1qY3zF0jH8dG/view?usp=drivesdk)) | `≥ 90%` of Finished EPs convert to `CO` | 🟢 `≥90%` \| 🟡 `75–89%` \| 🔴 `<75%` |
| **MoS** | **EP Net Promoter Score (`NPS`)** | $\% \text{Promoters (9–10)} - \% \text{Detractors (0–6)}$ | `exchange_standards` (`EXPA Survey`) | `≥ +50` (`iGV` & `iGT`) | 🟢 `≥+50` \| 🟡 `+20 to +49` \| 🔴 `<+20` |
| **KPI (Mandatory)** | **13 Mandatory Standards Fulfillment %** | $(\text{EPs with 100\% on #1,#2,#3,#6,#8,#9,#10,#11,#12,#13,#14,#15,#18} / \text{Total RE}) \times 100$ | `exchange_standards` | `100%` (Zero failure tolerance — 1 miss blocks `CO`) | 🟢 `≥95%` \| 🟡 `85–94%` \| 🔴 `<85%` |
| **KPI (Non-Mand)** | **5 Non-Mandatory Standards Pass Rate (`≥3/5`)** | $(\text{EPs with } \ge 3\text{ of #4, #5, #7, #16, #17 delivered} / \text{Total RE}) \times 100$ | `exchange_standards` | `100%` of EPs receive `≥ 3/5` (`Rabat aims for 5/5`) | 🟢 `100%` \| 🟡 `90–99%` \| 🔴 `<90%` |
| **KPI (Survey 1)** | **Middle Survey Completion Rate (`RE + 3d`)** | $(\text{EPs submitting Middle Survey #1–#10a} / \text{Total RE}) \times 100$ | `exchange_standards` | `100%` within `7 Days` of Realization | 🟢 `≥95%` \| 🟡 `80–94%` \| 🔴 `<80%` |
| **KPI (Survey 2)** | **Final Survey Completion Rate (`FIN - 3d`)** | $(\text{EPs submitting Final Survey #10b–#18} / \text{Total FIN}) \times 100$ | `exchange_standards` | `100%` before departure / project end | 🟢 `≥95%` \| 🟡 `80–94%` \| 🔴 `<80%` |
| **KPI (Delivery)** | **First Day of Work Escort Rate (`#9`)** | $(\text{EPs escorted in person on Day 1 + OP check} / \text{Total RE}) \times 100$ | `exchange_standards` | `100%` Mandatory Standard `#9` | 🟢 `100%` \| 🟡 `90–99%` \| 🔴 `<90%` |
| **KPI (Delivery)** | **Regular Touchpoints Adherence (`#17`)** | $(\text{On-time Bi-weekly [GV] / Monthly [GT] check-ins} / \text{Scheduled}) \times 100$ | `exchange_standards` | `≥ 95%` (Prevents surprises in Final Survey) | 🟢 `≥95%` \| 🟡 `80–94%` \| 🔴 `<80%` |
| **KPI (Delivery)** | **LEAD / Leadership Spaces Attendance (`#15`)** | $(\text{EPs completing Outgoing + Incoming + Debrief LEAD} / \text{Total RE}) \times 100$ | `exchange_standards` | `100%` Mandatory Standard `#15` | 🟢 `100%` \| 🟡 `90–99%` \| 🔴 `<90%` |
| **KPI (Safety)** | **Unreachable EP `>48 Hours` Alert (`AEPP 4.5.2.9`)** | $\text{Count}(\text{Active RE EPs with } \text{now} - \text{last\_checkin} > 48\text{h})$ | `ep_applications` | `0 EPs` (Triggers automatic Home LC + Emergency Contact alert) | 🟢 `0` \| 🟡 `N/A` \| 🔴 `≥1 (CRITICAL)` |
| **KPI (Disputes)** | **Quality Case Resolution Velocity (`Stage 1/2/3`)** | $\text{Avg hours to resolve Stage 1 (LC-to-LC), Stage 2 (ECB), Stage 3 (ICB)}$ | `quality_cases` ([AEPP Section 5](https://drive.google.com/file/d/16S6K2fH1w27hXefr-m6gD9B5K2eX3L4V/view?usp=drivesdk)) | `≤ 48 Hours` (`Stage 1` LC-to-LC resolution) | 🟢 `≤48h` \| 🟡 `49–72h` \| 🔴 `>72h` |

#### C. Graphs to Render in Card 6 Expanded View
1. **Graph 6.1: 18 Exchange Standards Compliance Heatmap Matrix (`18 Standards × Product/Cohort`)**
   - **Why this graph**: Displays all 18 Standards (`#1` to `#18`, with `#10a` and `#10b` split) as columns/rows, clearly separating the **13 Mandatory Standards** (solid border) from the **5 Non-Mandatory Standards** (dashed border), color-coded by `% Yes in Survey` (`🟢 ≥95%`, `🟡 85–94%`, `🔴 <85%`). You can spot in 1 second which exact standard (e.g., `#10a Job Description Alignment` or `#7 Accommodation`) is threatening `CO` conversions.
2. **Graph 6.2: Middle Survey vs. Final Survey Completion & Risk Funnel**
   - **Why this graph**: Compares `Realized EPs` → `Middle Survey Completed (#1–#10a)` → `Middle Survey Issues Resolved` → `Finished EPs` → `Final Survey Completed (#10b–#18)` → `Qualified Complete (CO)`.

### CARD 7: Accommodation (`Standard #7`), Host Families & Arrival Pickup (`Standard #6`)
*Derived from [2024 Exchange Standards Refreshment](https://drive.google.com/file/d/1w8c-x6L4p9T2mN5vR7bK1qY3zF0jH8dG/view?usp=drivesdk) and [26.2 Operational Mastery Protocol](https://docs.google.com/presentation/d/1j5W8kL3mN7vB2cZ9xR4tY6uJ1hG0fD7s/edit?usp=drivesdk).*

#### A. Collapsed Card Preview
- **Primary MoS**: **`% Bed Capacity Utilization & Vetted Readiness`** (`Booked Beds / Total Vetted Beds across Rabat & Salé`).
- **3 Headline KPIs**:
  1. **`% Apartments/Host Families Passing 4-Point Standard #7 Audit`**: `100%` (`Single Bed + Running Water + Bath + Electricity`).
  2. **`Avg Accommodation Cost per EP per Month (MAD)`**: Actual rent/utilities vs. budgeted allowance.
  3. **`On-Time Airport/Station Pickup Rate % (#6)`**: Pickups executed smoothly at `CMN`, `RBA`, or `Rabat Agdal/Ville`.
- **Card Micro-Visual**: Dual Gauge / Bullet Bar (`Bed Occupancy %` + `Standard #7 Audit Pass %`).

#### B. Expanded Drill-Down KPI Table (When Card 7 is Clicked)
| Metric Type | KPI Name | Exact Mathematical Formula | Data Source / ERP Table | Target / Benchmark (Rabat) | RAG Thresholds (Green / Amber / Red) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MoS** | **Vetted Bed Coverage Ratio (`Upcoming 30d`)** | $(\text{Available Vetted Beds} / \text{Approved EPs Arriving in Next 30d}) \times 100$ | `accommodations` / `bed_allocations` | `≥ 110%` (10% buffer capacity for emergencies) | 🟢 `≥100%` \| 🟡 `85–99%` \| 🔴 `<85%` |
| **KPI (Quality)** | **Standard `#7` 4-Point Physical Audit Pass %** | $(\text{Beds with Verified Single Bed + Water + Bath + Electricity} / \text{Total Beds}) \times 100$ | `accommodations` ([Standard #7](https://drive.google.com/file/d/1w8c-x6L4p9T2mN5vR7bK1qY3zF0jH8dG/view?usp=drivesdk)) | `100%` Mandatory before any EP check-in | 🟢 `100%` \| 🟡 `N/A` \| 🔴 `<100% (Block Assignment)` |
| **KPI (Efficiency)** | **Bed Occupancy / Utilization Rate %** | $(\text{Occupied Bed-Nights} / \text{Total Leased Bed-Nights in Period}) \times 100$ | `bed_allocations` | `≥ 85%` during Peak (Prevents paying rent on empty beds) | 🟢 `≥85%` \| 🟡 `70–84%` \| 🔴 `<70% (Financial Waste)` |
| **KPI (Finance)** | **Average Cost per Bed per Month (`MAD`)** | $\text{Total Rent + Utilities + Maintenance (MAD)} / \text{Active EP Months}$ | `finance_ledger` + `accommodations` | `≤ Budgeted Cap` (e.g. `≤ 1,200 MAD / EP / month`) | 🟢 `≤Cap` \| 🟡 `1–10% over` \| 🔴 `>10% over` |
| **KPI (Finance)** | **Landlord Security Deposit Recovery Rate %** | $(\text{Caution MAD Refunded by Landlords} / \text{Total Caution MAD Paid}) \times 100$ | `accommodations` | `≥ 95%` (Requires signed Check-In & Check-Out Inventory) | 🟢 `≥95%` \| 🟡 `80–94%` \| 🔴 `<80%` |
| **KPI (Logistics)** | **On-Time Arrival Pickup Execution Rate (`#6`)** | $(\text{EPs met on time at CMN/RBA/Agdal by Greeter} / \text{Total Arriving EPs}) \times 100$ | `pickup_dispatches` | `100%` | 🟢 `100%` \| 🟡 `90–99%` \| 🔴 `<90%` |

#### C. Graphs to Render in Card 7 Expanded View
1. **Graph 7.1: Gantt / Timeline Occupancy Heatmap by Flat & Room (`Agdal`, `Hassan`, `Hay Riad`, `Salé`)**
   - **Why this graph**: Shows each flat and bed on the Y-Axis and weeks of the year on the X-Axis. Shows exact bed overlaps, empty unutilized gaps (costing money), and gender-segregated room capacity at a glance.
2. **Graph 7.2: Grouped Bar Chart of `Cost per Bed (MAD)` vs. `EP Satisfaction Score (#7)` per Property**
   - **Why this graph**: Identifies properties that are expensive yet receive low EP ratings so Rabat can drop those landlords next peak.

### CARD 8: AFPM Finance, B2B Invoicing & Exchange Sustainability
*Derived from [AFPM Aug 2022](https://drive.google.com/file/d/1cK8pQ2W9xL4mN7vB3zR6tY1uJ5hG8fD0/view?usp=drivesdk), [APIP Oct 2024](https://drive.google.com/file/d/1vI9C6-hF4A6v3B1q5W4z9X8K2L7M3N1P/view?usp=drivesdk), and [AEPP Annex 2](https://drive.google.com/file/d/16S6K2fH1w27hXefr-m6gD9B5K2eX3L4V/view?usp=drivesdk).*

#### A. Collapsed Card Preview
- **Primary MoS**: **`Direct Exchange Sustainability Ratio (Direct Revenue / Direct Cost)`** (Target: **`> 1.0`** per [AFPM](https://drive.google.com/file/d/1cK8pQ2W9xL4mN7vB3zR6tY1uJ5hG8fD0/view?usp=drivesdk)) & **`Net ICX Surplus (MAD)`**.
- **3 Headline KPIs**:
  1. **`% iGV Projects Meeting ≥70–100% Partner/CSR Cost Coverage`**: [AFPM](https://drive.google.com/file/d/1cK8pQ2W9xL4mN7vB3zR6tY1uJ5hG8fD0/view?usp=drivesdk) rule that iGV costs must be `70–100%` funded by OPs/CSR grants.
  2. **`Overdue B2B Partner Invoices (>14 Days) in MAD`**: Uncollected OP fees blocking realization.
  3. **`Months of Financial Reserves`**: LC liquid reserve coverage (`AFPM Target: ≥ 6.0 Months`).
- **Card Micro-Visual**: Bullet Ratio Bar (`Sustainability Ratio 1.24x vs. 1.0x Break-Even Line`).

#### B. Expanded Drill-Down KPI Table (When Card 8 is Clicked)
| Metric Type | KPI Name | Exact Mathematical Formula | Data Source / ERP Table | Target / Benchmark (Rabat) | RAG Thresholds (Green / Amber / Red) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MoS** | **Direct Exchange Sustainability Ratio** | $\frac{\text{Total Direct Exchange Revenue (OP Fees + EP Fees + Grants)}}{\text{Total Direct Exchange Costs (Beds + Food + Pickup + MC Fee)}}$ | `finance_ledger` ([AFPM](https://drive.google.com/file/d/1cK8pQ2W9xL4mN7vB3zR6tY1uJ5hG8fD0/view?usp=drivesdk)) | **`> 1.00`** (Target in Rabat: `≥ 1.25` per product) | 🟢 `≥1.15` \| 🟡 `1.00–1.14` \| 🔴 `<1.00 (Deficit)` |
| **MoS** | **Net Exchange Surplus (`MAD`)** | $\text{Total Direct Exchange Revenue} - \text{Total Direct Exchange Costs}$ | `finance_ledger` | Positive surplus across `iGV`, `iGTa`, `iGTe` | 🟢 `>0 MAD` \| 🟡 `Break-even` \| 🔴 `<0 MAD` |
| **KPI (AFPM)** | **iGV Partner / CSR Funding Coverage %** | $\frac{\text{NGO Partner Fees + CSR Sponsorships (MAD)}}{\text{Total iGV Direct Project \& EP Hosting Costs (MAD)}} \times 100$ | `finance_ledger` ([AFPM](https://drive.google.com/file/d/1cK8pQ2W9xL4mN7vB3zR6tY1uJ5hG8fD0/view?usp=drivesdk)) | **`70% – 100%`** Mandatory AFPM iGV Sustainability Rule | 🟢 `≥70%` \| 🟡 `50–69%` \| 🔴 `<50%` |
| **KPI (AR)** | **B2B Invoice Collection Rate %** | $(\text{Collected Partner MAD} / \text{Invoiced Partner MAD Due}) \times 100$ | `invoices` | `≥ 95%` collected before EP arrival (`14-Day Lock`) | 🟢 `≥95%` \| 🟡 `80–94%` \| 🔴 `<80%` |
| **KPI (AR Aging)** | **Overdue Invoices `>14 Days` (`MAD & Count`)** | $\sum \text{Unpaid Invoice Balance where } \text{today} - \text{due\_date} > 14\text{d}$ | `invoices` ([APIP 3.2.5](https://drive.google.com/file/d/1vI9C6-hF4A6v3B1q5W4z9X8K2L7M3N1P/view?usp=drivesdk)) | `0 MAD` (Triggers 5% penalty warning & delivery freeze) | 🟢 `0 MAD` \| 🟡 `1–5,000 MAD` \| 🔴 `>5,000 MAD` |
| **KPI (Reserves)** | **Months of Operational Reserves** | $\text{Total Liquid Cash Reserves (MAD)} / \text{Avg Monthly Fixed LC Cost}$ | `finance_ledger` ([AFPM](https://drive.google.com/file/d/1cK8pQ2W9xL4mN7vB3zR6tY1uJ5hG8fD0/view?usp=drivesdk)) | **`≥ 6.0 Months`** | 🟢 `≥6.0m` \| 🟡 `3.0–5.9m` \| 🔴 `<3.0m` |
| **KPI (Risk)** | **AEPP Annex 2 Liability Exposure (`MAD`)** | $\sum \text{Estimated Refund/Compensation for Open Host-Fault Cases}$ | `quality_cases` ([AEPP Annex 2](https://drive.google.com/file/d/16S6K2fH1w27hXefr-m6gD9B5K2eX3L4V/view?usp=drivesdk)) | `0 MAD` | 🟢 `0 MAD` \| 🟡 `<2,000 MAD` \| 🔴 `≥2,000 MAD` |

#### C. Graphs to Render in Card 8 Expanded View
1. **Graph 8.1: Revenue vs. Cost Waterfall Chart (in `MAD`)**
   - **Why this graph**: A **Financial Waterfall Chart** is the gold standard for reading cashflow efficiency: starts with `+ B2B Partner Fees (MAD)` + `+ EP Accommodation/Pickup Fees` + `+ CSR Grants`, then steps down through `- Landlord Rent & Utilities`, `- Airport Pickup & Welcome Packs`, `- MC Morocco Royalty Fees`, and `- Case Reserves` to land on `= Net Exchange Surplus (MAD)`.
2. **Graph 8.2: Accounts Receivable Aging Stacked Bar (`Current`, `1–7d Overdue`, `8–14d Overdue`, `>14d Penalty Stage`)**
   - **Why this graph**: Shows LCVP FnL and LCVP ICX exactly which partner organizations owe money and how close they are to the 14-day freeze threshold.

### CARD 9: Member Engagement, Team Standards (`TeSt`) & People Analytics (`TM & MX`)
*Specifically requested: "Not only KPIs but also like people if they are engaged for the members or not". Grounded in [Functional Hub — TM Academy](https://www.hub.aiesec.org/functional-hub), [Comprehensive iGV Attendance & Engagement Report](https://docs.google.com/document/d/1q9X2kL5mN8vB3cZ7wR1tY4uJ6hG0fD9s/edit?usp=drivesdk), [AIESEC RABAT 26 - iGV S1 Closing Report](https://docs.google.com/document/d/1_BZFmxtlFvIdiWXOEcEvIczSWxaGym-U6lKFwciJ9Zo/edit?usp=drivesdk), and [iGV MM Application Consultancy](https://docs.google.com/presentation/d/1p7W4kL9mN2vB5cZ8xR3tY6uJ1hG0fD4s/edit?usp=drivesdk).*

#### A. How the ERP Measures "Is a Member Engaged or Not?" (Composite Member Engagement Score `0–100%`)
Instead of guessing whether a member is engaged, the ERP calculates a real-time **Composite Member Engagement Score (`MES 0–100%`)** for every member across 4 objective dimensions directly from their workspace activity and Rabat's attendance records:
$$\text{MES} = (0.35 \times \text{Meeting Attendance \& Punctuality \%}) + (0.30 \times \text{Personal KPI/Goal Attainment \%}) + (0.20 \times \text{Task \& SLA On-Time Execution \%}) + (0.15 \times \text{O2O \& Team Spaces Participation \%})$$

Using AIESEC in Rabat's official classification from the [Comprehensive iGV Attendance & Engagement Report](https://docs.google.com/document/d/1q9X2kL5mN8vB3cZ7wR1tY4uJ6hG0fD9s/edit?usp=drivesdk), every member is automatically categorized into **4 Engagement Tiers**:
1. **🟢 Tier 1: The Core Engaged Group (`90% – 100%` Attendance & Score)** — Joins meetings on time, stays until the end, hits `≥85%` of personal KPIs, `0` overdue SLA tasks (e.g., *Rayen Jbali 100%, Firdawsse Jray 98%, Abdenasser Moussafi 98%, Nourdine Ettaoumi 97%, Mohamed El Kahri 97%, Salma Sahl 97%*).
2. **🔵 Tier 2: Strong Engagement (`70% – 89%` Score)** — Consistent contributor, occasional late join or minor SLA delay; ready for leadership stretching.
3. **🟡 Tier 3: Moderate / Partial Engagement (`20% – 69%` Score)** — Early signs of disengagement (joining meetings `>15 min` late, leaving early, or missing weekly targets); triggers mandatory **TL → TM O2O intervention**.
4. **🔴 Tier 4: Critical Drop-Off / Inactive Risk (`<20%` Score)** — Severe disengagement (chronic absence, late arrivals correlate directly with `<20%` duration retention, stalled CRM/EP tasks); triggers **LCVP ICX + LCVP TM Retention Intervention or Re-allocation**.

#### B. Collapsed Card Preview
- **Primary MoS**: **`% Members in Engaged Tiers (Tier 1 Core + Tier 2 Strong ≥ 70%)`** & **`% Members Achieving Personal MoS/KPI Target`**.
- **3 Headline KPIs**:
  1. **`Rabat 6 Leadership Routines & Meeting Attendance %`**: Weekly Team Meetings, Core Meetings, Bi-Monthly Dept Meetings, Monthly LCMs.
  2. **`Monthly O2O (One-to-One) Completion %`**: `TL → TM O2Os` + `LCVP → TL O2Os` ([Rabat S1 Closing Report](https://docs.google.com/document/d/1_BZFmxtlFvIdiWXOEcEvIczSWxaGym-U6lKFwciJ9Zo/edit?usp=drivesdk)).
  3. **`AIESEC Team Standards (TeSt) Fulfillment %`**: `Building` → `Performing` → `Closing` checklist score.
- **Card Micro-Visual**: 4-Tier Member Distribution Bar (`🟢 Tier 1 Core`, `🔵 Tier 2 Strong`, `🟡 Tier 3 Partial`, `🔴 Tier 4 Drop-Off Risk`).

#### C. Expanded Drill-Down KPI Table (When Card 9 is Clicked)
| Metric Type | KPI Name | Exact Mathematical Formula | Data Source / ERP Table | Target / Benchmark (Rabat) | RAG Thresholds (Green / Amber / Red) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MoS (People)** | **Active Engaged Membership Rate (`Tier 1 + Tier 2`)** | $(\text{Members with MES } \ge 70\% / \text{Total Roster Members}) \times 100$ | `member_engagement_logs` ([Rabat Attendance Report](https://docs.google.com/document/d/1q9X2kL5mN8vB3cZ7wR1tY4uJ6hG0fD9s/edit?usp=drivesdk)) | `≥ 80%` of department in Tier 1 (`90–100%`) or Tier 2 (`70–89%`) | 🟢 `≥80%` \| 🟡 `60–79%` \| 🔴 `<60%` |
| **MoS (People)** | **Individual Member Goal Achievement (`% MoS Met`)** | $(\text{Members achieving } \ge 80\% \text{ of personal KPI quota} / \text{Total Members}) \times 100$ | `member_goals` | `≥ 75%` of members hitting personal target | 🟢 `≥75%` \| 🟡 `55–74%` \| 🔴 `<55%` |
| **MoS (Retention)** | **Member Retention Rate %** | $(\text{Active Members at End of Term} / \text{Members Inducted at Start}) \times 100$ | `users` | `≥ 85%` Term Retention | 🟢 `≥85%` \| 🟡 `70–84%` \| 🔴 `<70%` |
| **KPI (Tiers)** | **Tier 1 Core Group Share (`90–100%` Attendance)** | $(\text{Members with 90–100\% session duration} / \text{Total Members}) \times 100$ | `meeting_attendance` ([Rabat Attendance Report](https://docs.google.com/document/d/1q9X2kL5mN8vB3cZ7wR1tY4uJ6hG0fD9s/edit?usp=drivesdk)) | `≥ 50%` of team in Core Group | 🟢 `≥50%` \| 🟡 `35–49%` \| 🔴 `<35%` |
| **KPI (Tiers)** | **Tier 4 Critical Drop-Off Count (`<20%` Attendance)** | $\text{Count}(\text{Members with } <20\% \text{ attendance duration or } \ge 2 \text{ missed meetings})$ | `meeting_attendance` | `0 Members` in Drop-Off Tier | 🟢 `0` \| 🟡 `1–2` \| 🔴 `≥3 (TM Alert)` |
| **KPI (Punctuality)** | **On-Time Meeting Arrival Rate %** | $(\text{Members joining within } \le 5\text{m of start time} / \text{Total Attendees}) \times 100$ | `meeting_attendance` | `≥ 90%` (Rabat data proves late joiners drop out early) | 🟢 `≥90%` \| 🟡 `75–89%` \| 🔴 `<75%` |
| **KPI (Routines)** | **6 Mandatory Rabat Governance Routines Execution %** | $\frac{\text{Executed (Weekly Team + Weekly Core + Bi-Mo Dept + Monthly LCM)}}{\text{Planned Governance Spaces in Period}} \times 100$ | `governance_meetings` ([iGV MM Consultancy](https://docs.google.com/presentation/d/1p7W4kL9mN2vB5cZ8xR3tY6uJ1hG0fD4s/edit?usp=drivesdk)) | `100%` Frequency Achieved ([Rabat S1 Closing Report](https://docs.google.com/document/d/1_BZFmxtlFvIdiWXOEcEvIczSWxaGym-U6lKFwciJ9Zo/edit?usp=drivesdk)) | 🟢 `≥95%` \| 🟡 `80–94%` \| 🔴 `<80%` |
| **KPI (O2Os)** | **Monthly `TL → Member` O2O Completion Rate %** | $(\text{Members with logged O2O in current month} / \text{Total Team Members}) \times 100$ | `o2o_records` ([Rabat S1 Closing Report](https://docs.google.com/document/d/1_BZFmxtlFvIdiWXOEcEvIczSWxaGym-U6lKFwciJ9Zo/edit?usp=drivesdk)) | `100%` Monthly (`≥1 O2O per member per month`) | 🟢 `100%` \| 🟡 `80–99%` \| 🔴 `<80%` |
| **KPI (O2Os)** | **Monthly `LCVP → TL/MM` O2O & LCP Calibration %** | $(\text{Completed LCVP2TL O2Os + LCP Calibration} / \text{Scheduled}) \times 100$ | `o2o_records` | `100%` Monthly | 🟢 `100%` \| 🟡 `80–99%` \| 🔴 `<80%` |
| **KPI (TeSt)** | **AIESEC Team Standards (`TeSt`) Implementation %** | $\text{Avg \% completion across } \mathbf{Building} \text{ (Start), } \mathbf{Performing} \text{ (Ongoing), } \mathbf{Closing} \text{ (End)}$ | `team_standards_audit` ([Functional Hub — TM](https://www.hub.aiesec.org/functional-hub)) | `100%` across all 3 phases | 🟢 `≥90%` \| 🟡 `75–89%` \| 🔴 `<75%` |
| **KPI (Productivity)** | **Member SLA Task On-Time Completion %** | $(\text{Tasks completed before SLA deadline} / \text{Total Assigned Tasks}) \times 100$ | `tasks` | `≥ 90%` On-Time Execution | 🟢 `≥90%` \| 🟡 `75–89%` \| 🔴 `<75%` |
| **KPI (Sentiment)** | **Member eNPS / Engagement with AIESEC (`EwA`) Score** | $\% \text{Promoters} - \% \text{Detractors in Monthly Team Pulse Check}$ | `member_pulse_surveys` | `≥ +40` | 🟢 `≥+40` \| 🟡 `+15 to +39` \| 🔴 `<+15` |
| **KPI (Compliance)** | **APIP 5.7 Signed NDA & GDPR Training Compliance %** | $(\text{Members with Signed NDA + Passed Quiz} / \text{Total Members}) \times 100$ | `users` ([APIP 5.7](https://drive.google.com/file/d/1vI9C6-hF4A6v3B1q5W4z9X8K2L7M3N1P/view?usp=drivesdk)) | `100%` (Unlocks PII access in ERP) | 🟢 `100%` \| 🟡 `N/A` \| 🔴 `<100% (Lock PII)` |

#### D. Detailed Breakdown of AIESEC Team Standards (`TeSt`) Tracked Inside Card 9
From the [Functional Hub — Talent Management (`TM`) Academy](https://www.hub.aiesec.org/functional-hub), Card 9 tracks the exact **3 Stages of AIESEC Team Standards** for every Team Leader (`MM External` and `MM Internal`):
1. **Stage 1: BUILDING (Month 1 of Term)**
   - `1.1 Team Creation & Onboarding`: Team rules, communication channels, and team identity established.
   - `1.2 Team Plan & Goal Setting`: Collective team MoS/KPIs broken down into individual monthly/weekly member quotas.
   - `1.3 Individual Job Description (JD) & Personal Development Plan (PDP)`: Every member has a signed JD and personal learning goals.
2. **Stage 2: PERFORMING (Every Week / Month During Term)**
   - `2.1 Weekly Team Meetings`: Held every week (`Target: 100%`), tracking weekly KPIs, bottlenecks, and education spaces.
   - `2.2 Individual Tracking & Accountability`: Weekly review of each member's CRM calls, EP interviews, or Standard checklists.
   - `2.3 Monthly One-to-Ones (O2Os)`: Personal coaching space (`TL2TM` and `LCVP2TL`) reviewing performance + emotional wellbeing/motivation.
   - `2.4 Recognition & Incentives`: Weekly/Monthly shoutouts (`Member of the Week/Month`) based on ERP points.
   - `2.5 Team Feedback & Safe Spaces`: Bi-monthly peer-to-peer and upward feedback (`TM → TL`).
3. **Stage 3: CLOSING (Final Month of Term / S1 & S2 Closing)**
   - `3.1 Team Debrief & Performance Review`: Reviewing final team achievement against initial plan ([Rabat S1 Closing Report](https://docs.google.com/document/d/1_BZFmxtlFvIdiWXOEcEvIczSWxaGym-U6lKFwciJ9Zo/edit?usp=drivesdk)).
   - `3.2 Individual PDP Debrief & Next Role Transition`: Supporting members to apply for TL/MM/LCVP roles.
   - `3.3 Operational Knowledge & Relationship Handover`: 100% of partner contacts, IR relationships, and active EPs reassigned in the ERP without data loss.

#### E. Graphs to Render in Card 9 Expanded View
1. **Graph 9.1: Member Engagement Tier Distribution & Punctuality Correlation Chart (Stacked Horizontal Bar + Scatter)**
   - **Why this graph**: Directly visualizes Rabat's **4 Engagement Tiers** (`🟢 Tier 1 Core 90–100%`, `🔵 Tier 2 Strong 70–89%`, `🟡 Tier 3 Partial 20–69%`, `🔴 Tier 4 Critical Drop-Off <20%`) across teams (`External Engine BD` vs. `Internal Engine Ops/IR`), plus a scatter overlay plotting `X = Join Delay in Minutes (Late Arrival)` vs. `Y = Total Session Retention %` (proving visually how late arrivals drive drop-offs).
2. **Graph 9.2: Individual Member Performance vs. Engagement Quadrant (`2×2 People Matrix`)**
   - **Why this graph**: Plots every member as a clickable avatar dot on:
     - `X-Axis = Engagement & Attendance Score (0–100%)` (Meetings, O2Os, Punctuality).
     - `Y-Axis = Operational KPI Attainment (0–100%)` (B2B calls, Approvals, Standards delivered, On-time tasks).
   - **How the LCVP / TL reads it in 2 seconds**:
     - **Top-Right (`🟢 Role Models / Future TLs`)**: High Engagement + High KPI Delivery → Recognize & promote to MM/TL.
     - **Bottom-Right (`🔵 High Effort, Needs Skill Coaching`)**: High Attendance/Engagement (`>85%`) + Low KPI Results (`<50%`) → Member cares deeply but lacks sales/interviewing technique; schedule skill training.
     - **Top-Left (`🟡 Lone Wolves / Burnout Risk`)**: Low Meeting Attendance + High KPI Results → Member delivers numbers alone but is detaching from team culture; hold an O2O on motivation.
     - **Bottom-Left (`🔴 Disengaged / Critical Drop-Off Risk`)**: Low Attendance (`<40%`) + Low KPI Results (`<40%`) → Immediate retention O2O with LCVP TM & LCVP ICX.
3. **Graph 9.3: AIESEC Team Standards (`TeSt`) Radar / Spider Chart (or 3-Column Progress Matrix)**
   - **Why this graph**: Compares each Team Leader's (`MM External`, `MM Internal`, `TL IR`, `TL BD`) compliance across the 9 Team Standards dimensions (`Team Plan`, `PDP`, `Weekly Meetings`, `O2Os`, `KPI Tracking`, `Recognition`, `Feedback`, `Debrief`, `Handover`).
4. **Graph 9.4: Member Meeting Attendance & O2O Heatmap Grid (`Members × Weeks W1–W16`)**
   - **Why this graph**: A GitHub-style contribution grid where each row is a member (e.g., *Rayen Jbali*, *Firdawsse Jray*, *Abdenasser Moussafi*, etc.) and each column is a week (`W1` to `W16`). Cell color shows: `🟢 Present On-Time (90–100%)`, `🟡 Late / Partial (20–89%)`, `🔴 Absent (<20%)`, and a `⭐` icon on the week their Monthly O2O was completed.

## 4. Master Graph Selection & Visual Efficiency Guide (How to Make Every Graph Easy to Read)

To guarantee the ERP dashboard is effortless to read at a glance and never cluttered with confusing charts, follow these **7 Data Visualization Engineering Rules**:

| Analytical Question You Want to Answer | Recommended Graph Type (Most Efficient) | Graph Type to NEVER Use (Anti-Pattern) | Why the Recommended Graph Wins for Human Reading |
| :--- | :--- | :--- | :--- |
| **1. "Where are we losing EPs or B2B Partners across stages?"** | **Horizontal Stepped Funnel Bar with Conversion Bridges (`CR%`)** | 3D Cone Funnel or Pie Chart | The human eye compares **horizontal bar lengths** with 99% accuracy, whereas angled cone areas distort drop-offs. Conversion badges between bars show exact stage-to-stage leakage. |
| **2. "Are we hitting our Target or SLA right now?"** | **Horizontal Bullet Chart** (Solid Actual Bar + Vertical Target Line + RAG Background) | Speedometer / Circular Gauge | Speedometer gauges take up 4× the screen space to show a single number and cannot be stacked. You can stack 6 Bullet Charts in a compact card to compare 6 SLAs side-by-side. |
| **3. "Which of the 18 Exchange Standards or which Weeks of Attendance are failing?"** | **2D Color-Coded Heatmap Matrix** (`Rows = Entities/Members`, `Cols = 18 Standards or Weeks`) | Multi-Series 18-Bar Grouped Chart | 18 grouped bars per cohort create visual chaos ("spaghetti bars"). A Heatmap Matrix uses **pre-attentive color processing** (`🟢 / 🟡 / 🔴`) so your eye spots the single failing standard in `<1 second`. |
| **4. "Which Members or IR Partners need coaching vs. scaling?"** | **2×2 Quadrant Scatter Plot** (`X = Activity/Engagement`, `Y = Results/Conversion %`) | Separate Tables of Numbers | A 2×2 Quadrant automatically groups people or IR partners into **4 actionable decisions** (*Scale*, *Coach Skills*, *Re-engage Culture*, *Intervene/Drop*) without reading 20 rows of numbers. |
| **5. "How is capacity or engagement distributed across categories?"** | **100% Stacked Horizontal Bar** (`Tier 1 / Tier 2 / Tier 3 / Tier 4` or `Booked / Pending / Empty Slots`) | Donut / Pie Chart with `>4` Slices | Humans struggle to compare slice angles when there are more than 3 categories. A 100% Stacked Horizontal Bar aligns both ends at `0%` and `100%`, making part-to-whole shifts obvious. |
| **6. "Are we ahead or behind our semester pace over time?"** | **Dual-Line Cumulative Pace Chart (`S-Curve`)** (`Solid = Actual`, `Dashed = Target`) | Monthly Isolated Bar Chart | Isolated monthly bars hide cumulative deficits. A cumulative S-curve shows the exact gap between where Rabat is today and where the semester plan requires us to be. |
| **7. "Where is our exchange money coming from and going to?"** | **Financial Waterfall Chart (`MAD`)** (`+ Inflows` → `- Direct Costs` → `= Net Surplus`) | Dual Pie Charts (`Revenue Pie` + `Expense Pie`) | Two separate pies cannot show net profit or the `AFPM >1.0 Sustainability Ratio`. A Waterfall Chart shows how inflows cover each cost bucket step-by-step. |

### Universal Color & Typography Encoding Rules for All Dashboard Graphs
- **Strict Semantic Color Palette (Never Mix Meaning with Decoration)**:
  - `🟢 Emerald (#10B981)`: On Target / SLA Met / Tier 1 Core Engaged (`90–100%`).
  - `🔵 AIESEC Blue (#037EF3)`: Active Volume / In-Progress / Tier 2 Strong (`70–89%`).
  - `🟡 Amber (#F59E0B)`: Warning / Approaching SLA (`<48h left`) / Tier 3 Partial (`20–69%`).
  - `🔴 Rose Red (#EF4444)`: SLA Breach / Mandatory Standard Failed / Unreachable EP `>48h` / Tier 4 Critical Drop-Off (`<20%`).
  - `⚪ Slate Muted (#94A3B8)`: Historical baseline, target reference line, or unbooked slot capacity.
- **Direct Data Labels**: Every bar, funnel step, and heatmap cell must display its **exact number and percentage directly on the visual** (`e.g., 24 RE (88.9%)`) so the user never has to hover with a mouse just to read basic KPIs.

## 5. Exact Wireframe Layout of the Main Dashboard (How It Looks & Behaves)

```text
+-------------------------------------------------------------------------------------------------------------------+
| [SIDEBAR]  |  AIESEC IN RABAT — ICX EXECUTIVE & OPERATIONAL COMMAND DASHBOARD                                     |
| (Nav Only) |  Filters: [Term: 26.2 ▼] [Product: All (iGV/iGTa/iGTe) ▼] [Engine: All ▼] [Team/Member: All ▼]       |
|            +------------------------------------------------------------------------------------------------------+
| • Dashboard|  SECTION A: CLICKABLE DOMAIN KPI CARDS (Click any card to load its full KPIs & Graphs below)         |
| • CRM/Sales|  +---------------------------------+ +---------------------------------+ +-------------------------+ |
| • Opps     |  | [1] EXCHANGE FUNNEL & VELOCITY  | | [2] B2B CRM & SALES PIPELINE    | | [3] OPPORTUNITY & SLOTS | |
| • EPs      |  | MoS: 24/35 RE (69%) | 21 CO     | | MoS: 14/18 Signed | 84,000 MAD  | | MoS: 78% Slot Fill Rate | |
| • IR & PRM |  | • APD: 31/40  • APP→APD: 22.4%  | | • Meetings: 9/wk • Win: 38.5%   | | • Live: 16 • AM ≤7d:100%| |
| • Visa/14d |  | • Avg Approval Time: 4.2 Days   | | • Stale Leads >7d: 2 (Amber)    | | • OP Rejects ≥2: 1 OP   | |
| • CXP/18St |  | [Mini Horizontal Funnel Bar]    | | [Mini Pipeline Stacked Bar]     | | [Mini Capacity Bar]     | |
| • Housing  |  +---------------------------------+ +---------------------------------+ +-------------------------+ |
| • Finance  |  +---------------------------------+ +---------------------------------+ +-------------------------+ |
| • Members  |  | [4] IR SUPPLY & PARTNER PRM     | | [5] PRE-ARRIVAL & 14-DAY LOCK   | | [6] CXP & 18 STANDARDS  | |
|            |  | MoS: 74% APD from IR Partners   | | MoS: 92% Pass 14-Day Lock       | | MoS: 91% CO Rate | +62  | |
|            |  | • Quota: 82% • Resp Time: 9.4h  | | • Pack ≤14d: 100% • Visa: 94%   | | • Mand 13/13: 96%       | |
|            |  | • SE Standards (#1-3,#18): 96%  | | • Breach <14d to Arrival: 1 EP  | | • >48h Unreachable: 0   | |
|            |  | [Top 5 Supply Countries Bar]    | | [14-Day Lock Readiness Strip]   | | [18-Cell Mini Strip]    | |
|            |  +---------------------------------+ +---------------------------------+ +-------------------------+ |
|            |  +---------------------------------+ +---------------------------------+ +-------------------------+ |
|            |  | [7] ACCOMMODATION & PICKUP (#6/7| | [8] AFPM FINANCE & INVOICING    | | [9] MEMBER ENGAGEMENT ⭐ | |
|            |  | MoS: 100% Vetted Beds | 88% Occ | | MoS: 1.32x Sustainability Ratio | | MoS: 83% Engaged (T1+T2)| |
|            |  | • Std #7 Pass: 100%             | | • iGV CSR Coverage: 78% (Pass)  | | • T1 Core (90-100%): 54%| |
|            |  | • Cost/Bed: 1,150 MAD • Pick:100| | • Overdue >14d: 4,500 MAD (1 OP)| | • O2Os: 92% • TeSt: 89% | |
|            |  | [Bed Occupancy Bullet Bar]      | | [1.32x vs 1.0x Break-Even Bar]  | | [4-Tier Engagement Bar] | |
|            |  +---------------------------------+ +---------------------------------+ +-------------------------+ |
|            +------------------------------------------------------------------------------------------------------+
|            |  SECTION B: EXPANDED ACTIVE CARD WORKSPACE (Example shown when Card [9] Member Engagement is clicked)|
|            |  +--------------------------------------------------------------------------------------------------+|
|            |  | ACTIVE CARD: [9] MEMBER ENGAGEMENT, TEAM STANDARDS (TeSt) & PEOPLE ANALYTICS     [Export CSV/MD] ||
|            |  |--------------------------------------------------------------------------------------------------||
|            |  | [Sub-Tab 1: Full KPI Scorecard Table] [Sub-Tab 2: Visual Analytics] [Sub-Tab 3: Member Roster]   ||
|            |  |                                                                                                  ||
|            |  | +--------------------------------------------+ +-----------------------------------------------+ ||
|            |  | | GRAPH 9.1: 4 Engagement Tiers by Engine    | | GRAPH 9.2: Member 2x2 Quadrant                | ||
|            |  | | External BD: [🟢55%][🔵25%][🟡15%][🔴5%]   | | Y: KPI % ^  🟡 Lone Wolves | 🟢 Role Models   | ||
|            |  | | Internal Ops:[🟢60%][🔵25%][🟡10%][🔴5%]   | |          |  🔴 Drop-Off    | 🔵 Coach Skills  | ||
|            |  | | (Late join >15m = 82% of Tier 4 Drop-offs) | |          +--------------------------------->  | ||
|            |  | +--------------------------------------------+ |                     X: Engagement & Attendance| ||
|            |  | +--------------------------------------------+ +-----------------------------------------------+ ||
|            |  | | GRAPH 9.3: Team Standards (TeSt) Radar     | | GRAPH 9.4: Weekly Attendance & O2O Heatmap    | ||
|            |  | | Building: 100% | Performing: 88%           | | Rayen Jbali:       [🟢][🟢][🟢][🟢⭐][🟢] 100% | ||
|            |  | | Closing: 80%   | O2O Completion: 92%       | | Firdawsse Jray:    [🟢][🟢][🟢][🟢⭐][🟢] 98%  | ||
|            |  | +--------------------------------------------+ | Member X (At-Risk):[🟡][🔴][🔴][🔴⚠️][🔴] 14%  | ||
|            |  |                                                +-----------------------------------------------+ ||
|            |  +--------------------------------------------------------------------------------------------------+|
+-------------------------------------------------------------------------------------------------------------------+
```

## 6. Database Schema Additions Required to Power the Dashboard & Member Engagement Cards

To calculate every KPI on the 9 cards automatically (without manual spreadsheet formulas), the ERP database includes these dedicated tracking tables alongside the core operational tables:

1. **`kpi_targets_and_quotas`**:
   - Stores planned targets by `term_id` (`26.1`, `26.2`), `product` (`iGV`, `iGTa`, `iGTe`), `engine` (`External`, `Internal`), `team_id`, and `member_id` for `OPEN`, `APP`, `ACC`, `APD`, `RE`, `CO`, `B2B Meetings`, `Signed Contracts`, and `Revenue MAD`.
2. **`governance_meetings` & `meeting_attendance`**:
   - Logs each occurrence of Rabat's **6 Mandatory Leadership Routines** (`Weekly Team Meeting`, `Weekly Core Meeting`, `Bi-Monthly Department Meeting`, `Monthly LCM`, `Monthly O2O`, `Monthly LCP Calibration`).
   - Tracks per member: `joined_at`, `left_at`, `arrival_delay_minutes`, `attendance_duration_pct` (`0–100%`), automatically assigning each member to **Tier 1 (`90–100%`)**, **Tier 2 (`70–89%`)**, **Tier 3 (`20–69%`)**, or **Tier 4 (`<20%`)**.
3. **`o2o_records` (`One-to-One Coaching Logs`)**:
   - Tracks `host_user_id` (`LCVP` or `TL/MM`), `attendee_user_id` (`TL/MM` or `TM`), `o2o_date`, `type` (`TL2TM`, `LCVP2TL`, `LCP_Calibration`), `performance_score`, `wellbeing_mood_score` (`1–5`), `blockers_identified`, and `action_items`.
4. **`team_standards_audits` (`TeSt Tracker`)**:
   - Tracks each team's monthly completion of the **Building** (`Team Plan`, `JD`, `PDP`), **Performing** (`Weekly Meetings`, `O2Os`, `Accountability`, `Recognition`, `Feedback`), and **Closing** (`Team Debrief`, `PDP Debrief`, `ERP Handover`) checklists.
