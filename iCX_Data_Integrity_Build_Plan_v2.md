# iCX Data Integrity System — Fix and Build Plan v2.0 (A to Z)

**Owner:** Wadii Hani (Na9ach), LCVP iGV, AIESEC in Rabat
**Live site audited:** https://icx-erp.vercel.app/ — on 2026-11-03
**Hand to the agent together with:** `iCX_Data_Integrity_Tracking_Spec.md` (v1.0)
**Precedence:** if v1.0 and this file disagree, **this file wins**. v1.0 stays the reference for the data model (§3), rule seeds (§3.4), status machine (§4), request checklists (§7), DQ rules (§13.2), dashboards (§14) and tests T-01 to T-20.

---

## 0. Rules for the agent (read first)

| # | Rule |
|---|---|
| R1 | **Do not start any work package after WP-A until Section 3 (blocking questions) is answered or the owner approves the stated defaults in writing.** |
| R2 | **Empty is not green.** No data, not configured, or 0 of 0 must display as "No data" or "Not set up" (grey). Never "Compliant", "On track", "100%", "Complete", "Passing". |
| R3 | **No hard-coded business data or status in the UI.** Every number, status, name, table row, badge and "SLA" text comes from the database or the rule registry. CI fails on literals (see WP-V, test T-22). |
| R4 | **No invented rules.** Every rule, number, standard name and deadline must trace to a source code (S0–S9 in v1.0 §1) or be marked `CONFIG` or `OWNER-DECISION`. If you can't trace it, ask. |
| R5 | **No claims the system can't back.** No "cryptographically recorded", "automated snapshots", "restore test passing", "Moroccan statutory law" text unless the feature exists and is tested. |
| R6 | **Demo data lives only in a separate demo environment**, every row flagged `is_demo = true`, with a permanent banner "DEMO DATA". Production starts empty. |
| R7 | **Ask before guessing.** Anything unclear goes to the owner as a numbered question with a proposed default. |
| R8 | **Ship per work package** with tests green and a short change note. No big-bang merge. |
| R9 | Use IANA timezone `Africa/Casablanca` for all deadline maths (Morocco shifts offset during Ramadan; never hard-code "GMT+1"). |

---

## 1. Audit of the live site

**Method and limits:** I read the server-rendered text of 7 routes. The home page (`/`) returned only "Initializing iCX Data Integrity Workspace…", so its KPIs and health score are **unverified**. `/admin` and `/admin/roles-and-access` were **not** checked. I cannot judge visual design or interactions, only text and structure.

**Verdict:** the site is a **front-end shell with pre-written "all good" text and no working backend behind it.** Navigation and page structure follow the spec; the content and claims do not. For a tool whose purpose is to prevent data flux, fake green statuses are the most serious defect.

### 1.1 Findings by route

| Sev | Route | Observed | Problem | Fix in |
|---|---|---|---|---|
| **Critical** | `/standards` | 16-row table fully filled: "Delivered", "Yes (Fulfilled)", "MATCH (100%)" while the selected exchange is "N/A" | Hard-coded fake data; parallel-truth view shows a perfect match that doesn't exist | WP-E, H |
| **Critical** | `/standards` | Standard names/numbers differ from the Drive deck (see §2) | Wrong standards: e.g. #3 "Expectation Setting" (Drive: #3 Insurance), #13 "Lead Space", #14 "Opportunity Closing", #16 "Return Transportation" don't exist in the Drive. Missing: Insurance, Expectations (#4), Incoming preparation (#8), Duration (#13) | WP-E |
| **Critical** | `/handoff` | All 10 packet sections "Complete"; "T-14 Passing — Zero data corruption"; "30 daily and 12 weekly snapshots, SHA-256"; "Pending incoming ack" | Fake assurance. No evidence any of it exists | WP-M, Q |
| **Critical** | `/quality-cases` | "100% On-Time", "average acknowledgment 4.2 hours", then "delivered < 24h" in another card | Invented metrics, internally contradictory | WP-K |
| **Critical** | `/quality-cases` | CS Minimums "24H response / 48H statement / 10D settlement" and "Under Moroccan statutory law… cryptographically recorded" | Time limits and legal claim not in any Drive source; Drive lists **4** CS minimums, site shows **3** | WP-K |
| **High** | `/status-governance` | "All EPs on Track", "Zero visa breaches" with 0 exchanges | Green by default | WP-I |
| **High** | `/status-governance` vs `/partners` | "All 3 B2B partners contacted in last 14 days" vs "B2B Operational Partners (0)" | Direct contradiction | WP-I, J |
| **High** | `/status-governance` | "Approval-to-RE timer (48H)" | Not in any source | Remove (WP-I) |
| **High** | `/status-governance` | "Required 4-item checklist" | v1.0 §7 defines 7 items (early FI/extension 9, breaks 7) | WP-I |
| **High** | `/compliance` | "0 documents cataloged · Overall compliance rate: 100%" and "Annex 4 Fully Audited" | 0 of 0 shown as 100%; 13-document list is empty (must be seeded) | WP-L |
| **High** | `/handoff` | RACI rows with invented roles (Project Managers, Logistics Officers, Host Landlord, Partner Director, MC IM Manager…) and hard-coded names | Not the real structure; must come from the member table | WP-C, M |
| **Medium** | Nav | "7. 18 Exchange Standards" next to "16 Stds" | 18 vs 16 | WP-E |
| **Medium** | Nav | Modules 10–12 (AFPM finance, member engagement, 360° comm), "CSR sponsors" | Outside v1.0 scope | Question Q5 |
| **Medium** | Header | Persona "VP Customer Experience", badge "3 overdue" while all tables are empty | Wrong title for LCVP iGV; hard-coded badge | WP-C, R |
| **Medium** | Header | "Casablanca (GMT+1)" | Hard-coded offset | R9 |
| **Medium** | All pages | Test/invariant IDs differ from v1.0 (site: INV-04 = parallel truth; v1.0: INV-05; site "T-07…T-15" mapped differently) | Traceability broken | WP-V |
| **Medium** | `/tracker` | "Gate Validations (G0..G4)" | Gates not defined in v1.0 | Define in WP-G or remove |
| **Low** | `/partners` | Cluster named "Scale"/"Upscale" mixed; description "volume and conversion" | v1.0 §9.3 uses supply vs market readiness | WP-J |
| **Low** | `/tracker` | Empty state says "No exchanges in all stage." | Copy error | WP-S |

### 1.2 What is correct and should be kept

| Keep | Why |
|---|---|
| Route structure (`/tracker`, `/standards`, `/status-governance`, `/partners`, `/quality-cases`, `/compliance`, `/handoff`, `/admin/roles-and-access`) | Matches v1.0 modules |
| 5-stage flow on the tracker | Matches v1.0 §4.1 |
| Table-first layout, "Quick Add", ⌘K search | Matches your "tables, graphs, data views" preference |
| 5 mandatory case-closure fields | Matches Drive (S4) |
| 13 ICB document slots, proof vault concept, freeze switch concept | Matches v1.0 §11 (but see Q6, Q15) |
| 8 partner standards, 2×2 IR board | Matches Drive (S5, S6) |

### 1.3 My own errors in v1.0 that contributed

| Error in v1.0 | Fix |
|---|---|
| Said each milestone ships "with a seed/demo dataset" without isolating it → likely caused the hard-coded demo content | Rule R6 |
| No route-by-route UI specification | §4 below |
| Left standards #1–#3, #16 mandatory flags and YOP answers as `UNKNOWN` without a visible owner question | Q7 |
| Didn't say how Vercel hosting limits affect nightly jobs and hashing Drive files | Q13, Q15 |

---

## 2. Correct Exchange Standards (source: S1, Drive "3.8 iCX Standards Delivery")

Replace the site's list with exactly this. A test (T-23) must compare the seed with this table.

| # | Name | Phase | Delivered by | Mandatory for COMPLETE |
|---|---|---|---|---|
| 1 | Personal goal setting | Preparation | Home entity (tracked by LC Rabat) | **Yes** (Q7 answered) |
| 2 | Outgoing preparation | Preparation | Home entity (tracked by LC Rabat) | **Yes** |
| 3 | Insurance | Preparation | Home entity (tracked by LC Rabat) | **Yes** |
| 4 | Expectations setting | Preparation | Host | Yes |
| 5 | Visa and work permit | Preparation | Host | Yes |
| 6 | Arrival pickup | Preparation | Host | No |
| 7 | Accommodation | Preparation | Host | Yes |
| 8 | Incoming preparation | Preparation | Host | Yes |
| 9 | First day of work | Experience | Host | No |
| 10 | Alignment spaces with opportunity provider | Experience | Host | Yes |
| 11 | Job description | Experience | Host | Yes |
| 12 | Working hours | Experience | Host | No |
| 13 | Duration | Experience | Host | Yes |
| 14 | Opportunity benefits | Experience | Host | Yes |
| 15 | Departure support | Experience | Host | No |
| 16 | Debrief with AIESEC | Post-experience | Home entity (tracked by LC Rabat) | **Yes** |

**Site → correct mapping (for the fix):** site #3 "Expectation Setting" → #4 · #4 "Visa and Work Validity" → #5 · #5 "Arrival Pickup" → #6 (phase Preparation, not Experience) · #6 "Departure Support" → #15 (phase Experience) · #7 "Job Description" → #11 · #8 "Working Hours" → #12 · #10 "Individual Goal Strategy" → delete (closest: #10 Alignment spaces) · #11 "Accommodation" → #7 (phase Preparation) · #12 "Basic Living Costs / Benefits" → #14 · #13 "Lead Space" → delete · #14 "Opportunity Closing" → delete · #15 "Debriefing" → #16 · #16 "Return Transportation" → delete. **Add missing:** #3, #8, #13.

---

## 3. Blocking questions for the owner

The agent sends these to you (or you answer here in chat). **Default** = what the agent uses if you say "use defaults". **Blocks** = first work package that can't safely start without the answer.

| # | Question | Default | Blocks |
|---|---|---|---|
| Q1 | **Backend and database?** The site is on Vercel with no backend. | Supabase (PostgreSQL + Auth + Row Level Security + Storage) with Next.js on Vercel | WP-B |
| Q2 | **Login method?** | Google sign-in, limited to an allow-list of emails you approve | WP-C |
| Q3 | **How do we get EXPA data?** CSV export, API access, or manual entry only? Can you share an anonymised sample export (headers + 5 rows)? | CSV upload with column mapping | WP-F |
| Q4 | **Where does your data live today?** (Google Sheets CRM, iGV tool sheets, EXPA only…) Do we migrate it? | Migrate by CSV import, one-time, with a reconciliation report | WP-U |
| Q5 | **Scope:** are AFPM finance, CSR sponsors, member engagement and 360° comm part of v1? | **No.** Hide behind feature flags; v1 = the 8 integrity modules | WP-A |
| Q6 | **Freeze switch:** the Drive says ICB audits and freezes at national level. Should the LCVP **record** a freeze received from MC (with reference link), or can the LC **impose** one? | Record only; blocks processing while active | WP-L |
| Q7 | **Standards #1, #2, #3, #16:** mandatory for COMPLETE or not? What are the EP answer options in the YOP survey? | Non-mandatory; answers Yes/No | WP-E |
| Q8 | **GV duration:** from what date does 4–8 weeks replace 6–8? | ECBA 2026 update date; legacy rule before it | WP-D |
| Q9 | **Real roles and people:** who gets access, with which role (LCVP, MM, TL, member, ECB, LCP, finance, auditor)? The site shows invented roles. | Roles in v1.0 §12.4; you list the people | WP-C |
| Q10 | **Language of the interface:** English, French, or both? | English; text in a translation file so French can be added | WP-S |
| Q11 | **Alerts:** in-app only, or also email / WhatsApp / Slack? | In-app + email | WP-R |
| Q12 | **CS minimum time limits:** the site shows 24h / 48h / 10d. Are those official? Where is the source? | No time limits enforced; fields only, limits as `CONFIG` | WP-K |
| Q13 | **Domain and hosting plan:** keep `icx-erp.vercel.app`? Vercel free plan only runs scheduled jobs once a day. | Run scheduled jobs in the database (Supabase) instead | WP-B, N |
| Q14 | **Personal data:** do you need a privacy notice / consent text (Moroccan personal-data law 09-08, CNDP)? Check with ECB or LC legal. | Minimise PII, add a consent field and notice placeholder | WP-T |
| Q15 | **Proof files:** upload into the system (hash computed at upload) or only link to Google Drive? A hash can't be computed from a Drive link without Drive access. | Upload to Storage + optional Drive link; hash at upload | WP-H |
| Q16 | **iGT (GTa/GTe) in v1?** | No; schema ready, UI hidden | WP-B |
| Q17 | **Persona switcher:** keep for testing? | Dev environment only; removed in production | WP-C |
| Q18 | **Deletion requests:** an EP asks to be forgotten, but v1.0 forbids hard deletes. | Anonymise personal fields; keep history with a hashed ID | WP-T |
| Q19 | **Stage gates G0–G4** on the tracker: what are they? | Remove until defined | WP-G |
| Q20 | **Who is the backup admin** if the LCVP is unavailable? | Named by you before go-live | WP-Y |

### 3.1 Answers received (2026-11-03, dictated — wording interpreted, confirm if wrong)

| Q | Answer | Effect on the plan |
|---|---|---|
| Q1 | Supabase (PostgreSQL); site stays on Vercel | **Closed.** Stack = Next.js on Vercel + Supabase |
| Q2 | Login: answer unclear in the dictation | **Still open.** Needed before C1 and before inviting members |
| Q3 | EXPA data comes by **CSV export** only; no live data outside EXPA | **Closed.** CSV is the only import channel (no API). An anonymised sample file is still required before WP-F |
| Q4 | No other data source; real data exists only in EXPA | **Closed.** Nothing to migrate except the first EXPA CSV import (WP-U reduced) |
| Q6 | Freeze = **record it and pause** processing | **Closed.** Matches default: record with reference link, blocks processing while active |
| Q7 (UI part) | Each EP gets a **pop-up card with a table: every standard checked or not** | Added as task H9. Mandatory flags for #1, #2, #3, #16 are **still open** |
| Q8 | GV duration options are **4, 6 or 8 weeks** (clarified) | **Closed.** One rule with allowed values `[4, 6, 8]`; no legacy row; 5 and 7 weeks are invalid |
| Q9 | Members are added **later, by email**, after the project is complete | **Closed.** Start with the owner only; build the invite flow; roles per v1.0 §12.4 |
| Q15 | Upload inside the system; **system forwards the file to Google Drive**; files are not stored in the database | **Closed.** Drive-only storage; database keeps metadata and hash only (see H5). New questions Q21–Q23 below |

**New questions raised by these answers**

| # | Question | Default | Blocks |
|---|---|---|---|
| Q21 | Which Google account and Drive folder should hold the proofs? A shared folder owned by an AIESEC account that survives term changes is safest | One shared Drive folder owned by an organisation account, accessed through a service account | WP-H |
| Q22 | Maximum proof file size? Vercel serverless functions limit request size (about 4.5 MB; the agent must verify the current limit) | PDFs and images up to 25 MB, uploaded from the browser straight to Drive in a resumable session started by the server | WP-H |
| Q23 | If a Drive file is deleted or access is lost, how should the system react? | Flag DQ-083, keep the metadata and hash, ask the owner to re-attach | WP-H |

### 3.1b Answers received, second round (2026-11-03)

| Q | Answer | Effect |
|---|---|---|
| Q2 | Google sign-in with AIESEC Google accounts | **Closed** (task C1) |
| Q5 | Yes, hide finance, CSR, member engagement, 360° comm for v1 | **Closed** (feature flags, task A4) |
| Q7 | Home-entity standards #1, #2, #3 and #16 **are mandatory** for "complete", and LC Rabat tracks them too, even though the home entity delivers them | **Closed.** All 16 standards are tracked here; "Delivered by" stays Home, "Tracked by" = LC Rabat. Table in §2 updated |
| Q3 | EXPA sample received: `OpportunityApplication` export, 17 rows × 32 columns | **Partly closed.** Findings in §3.2; gaps need more exports (Q24, Q25, Q29) |
| Q21 | Proofs folder on "the VP's Google account" | **Needs a check (see Q33).** A personal account usually ends with the term |
| Q22 | Not answered yet | Default 25 MB applies |

### 3.2 What the EXPA sample shows (facts from the file, not assumptions)

| # | Finding | Consequence |
|---|---|---|
| 1 | It is an **application** export: one row per application, key `Id`; person key `Applicant Id` | Exchange key = `Id`; EP key = `Applicant Id`. v1.0's `expa_ep_id` was wrong (see §3.3) |
| 2 | `Status` has only **open (7), rejected (8), withdrawn (2)** | Full status vocabulary unknown; approved / realized / finished / completed / break values never seen (Q24) |
| 3 | 10 of 32 columns are **empty in the sample**: Date Marked Approved, Realized, Ep Accepted Offer, Accepted By Host; Experience Start/End Date; Nps Score; Shortlisted; Has Standards Survey; SDG; SDG Target; Work Field | Date formats for approved/realized rows are unverified (Q24) |
| 4 | **No organisation ID, contact, phone, slot count or opportunity dates**; only `Organization` text, with trailing spaces in 2 rows | Partner dedupe by normalised name + manual merge screen (Q29); slot count entered by hand |
| 5 | `Slot` is **free text** ("marketing digital", "ENGLISH TEACHER", "May") | Not a number. Keep as `slot_label`; flag garbage values |
| 6 | **Duration is only in the title**: "Scale Up! [4 weeks]", "Explorer [6 weeks]", "Global Classroom [6 weeks]", "[8 weeks]". `Opportunity Duration Type` is "short" for all of these, so it can't give weeks | Parse weeks from the title with a regex; fallback to Experience Start/End dates; titles without it (e.g. "English teaching") raise a warning. The 4, 6, 8 rule matches the data |
| 7 | **2 of 17 rows are GTe**, 15 are GV | GTe exists in your data, so Q16 (hide iGT) needs a decision (Q28) |
| 8 | Applicant email is a **relay address** (`p_<hash>@inbound.aiesec.org`) for all rows | Treat as contact, restricted by role (INV-10); don't assume it identifies a person across systems |
| 9 | `Host MC` = Morocco and `Host LC` = Rabat on all rows; `Home MC`/`Home LC` vary (8 and 11 values) | Validate host on import; IR partner key = Home MC + Home LC |
| 10 | `Applicant Nationalities` is a JSON-text list; Languages, Skills, Backgrounds are comma lists with repeats ("Education, Education"; Skills contains the nationality) | Parse and de-duplicate; skills and backgrounds not needed by any module |
| 11 | Timestamps carry milliseconds and **no timezone**; file name ends `20_55_28_00_00` | Assume UTC and convert to `Africa/Casablanca` (Q26) |
| 12 | No standards answers in the file (`Has Standards Survey` empty) | EP-reported answers need a different export (Q25) |
| 13 | Applications span 2026-03-19 to 2026-11-02, sorted newest first | Don't rely on order; sort on import |

### 3.3 Schema changes forced by the export (override v1.0 §3)

| Change | Why |
|---|---|
| `ep.expa_applicant_id` (unique) replaces `ep.expa_ep_id` | EP = `Applicant Id` |
| `exchange.expa_application_id` (unique) added; upsert key for imports | Application = `Id` |
| `exchange.accepted_by_ep_at`, `accepted_by_host_at`, `realized_marked_at`, `planned_start`, `planned_end` added | Columns exist in EXPA and v1.0 had no place for them |
| `exchange.slot_label` (text) | `Slot` is text |
| `opportunity.title_duration_weeks` derived from title; `opportunity.slots_count` entered manually | Not in export |
| `exchange.has_standards_survey` boolean | Present in export |
| `import_batch.exported_at` from the file name; `source_file_name` stored | Sync-age check (DQ-031) |
| Normalised text fields: trim, collapse spaces, case-fold for matching, original kept | Trailing spaces found |
| `exchange.status_raw` stores EXPA's original text; `status` is mapped through a `status_map` table (editable, audited) | Vocabulary incomplete |

### 3.4 Column mapping (target of WP-F)

| EXPA column | Goes to | Rule |
|---|---|---|
| Id | `exchange.expa_application_id` | Unique key |
| Applicant Id | `ep.expa_applicant_id` | Unique key |
| Applicant Name | `ep.full_name` | Restricted |
| Applicant Email | `ep.contact_email` | Restricted relay address |
| Applicant Nationalities | `ep.nationalities` | Parse JSON text |
| Applicant Languages / Skills / Backgrounds | not stored in v1 | Q30 |
| Opportunity Id | `opportunity.expa_opp_id` | |
| Opportunity Title | `opportunity.title` + derived weeks | Trim; regex `\[(\d+) weeks?\]` |
| Organization | `op_partner.name` | Normalise; no ID (Q29) |
| Opportunity Product | `exchange.programme` | GV or GTe |
| Opportunity Duration Type | stored raw only | Not used for rules |
| Status | `status_raw` → `status` | Via `status_map`; unknown ⇒ quarantine row |
| Applied At | `exchange.applied_at` | Timezone Q26 |
| Date Marked Approved | `exchange.approved_at` | |
| Date Ep Accepted Offer / Date Marked Accepted By Host | `accepted_by_ep_at` / `accepted_by_host_at` | |
| Date Marked Realized | `realized_marked_at` | Which column is the "RE date" for the APD rule: Q27 |
| Experience Start / End Date | `planned_start` / `planned_end` | |
| Slot | `slot_label` | Free text |
| Host MC / Host LC | validation | Must equal Morocco / Rabat, else flag |
| Home MC / Home LC | `ir_partner` link | Key = both |
| Nps Score | `exchange.ep_nps` | |
| Has Standards Survey | `has_standards_survey` | |
| Shortlisted, SDG, SDG Target, Work Field | raw JSON column | Kept, unused |

### 3.5 New questions from the sample

| # | Question | Default | Blocks |
|---|---|---|---|
| Q24 | Send a **second export containing approved, realized, finished and completed** rows (and any break statuses). What are all the status words EXPA uses? | Map by name; unknown status ⇒ row quarantined | WP-F, G |
| Q25 | Can you export the EP's **standards survey (YOP) answers**? If yes, send a sample | Without it, "EP-reported" stays empty and the mismatch check is off | WP-H |
| Q26 | Are the timestamps in UTC? | UTC, shown in `Africa/Casablanca` | WP-I |
| Q27 | For the "APD past RE date" rule, is the RE date `Experience Start Date` or `Date Marked Realized`? | `Experience Start Date` = planned RE date | WP-I |
| Q28 | GTe rows exist. Import them? | Import as `GTe`, same board, GV-only rules not applied | WP-F |
| Q29 | Is there an **organisations export** with ID, contact person, phone, email? | Dedupe by normalised name + merge screen | WP-F, J |
| Q30 | Keep only name, relay email and nationality? Drop skills, languages, backgrounds? | Yes, drop them (less personal data) | WP-T |
| Q31 | Import rejected and withdrawn applications? | Yes, for funnel metrics; hidden from the exchange board | WP-F |
| Q32 | Slot count per opportunity: where do you get it? | Manual field on the opportunity | WP-G |
| Q33 | **Drive owner:** an individual AIESEC account usually ends with the term. Use a shared folder owned by an account that stays (LC-level), with the VP account as editor? | Shared folder, service account for the system, VP account as editor; ownership documented in the handoff packet | WP-H |

---

## 4. Route-by-route target (keep the existing routes)

| Route | Purpose | Main data | Must show (real data only) | WP |
|---|---|---|---|---|
| `/` | Integrity Console | DQ issues, deadlines, sync log, health score | Health score, unowned records, blockers, due in 14 days, issues by severity, deadline radar, sync status; **"No data" when empty** | O |
| `/tracker` | Master tracker | exchanges, EPs, opportunities | 5-stage board + table, filters, quick add, row drawer with history | G |
| `/tracker/[id]` | Exchange record | exchange, standards, requests, proofs, cases | Stage bar, standards, history, proofs, next deadlines | G, H |
| `/partners` | B2B partner PRM | partners, touchpoints, partner standards | Table, per-opportunity 8 standards, touchpoint log, NPS prerequisites | J |
| `/partners/ir` | IR partners and clusters | IR partners | 2×2 scatter (supply vs market readiness), plan fields, E2E analytics | J |
| `/standards` | Standards and proof vault | standard_check, proofs | Per-exchange parallel-truth table (tracked vs EP-reported), mismatches | H |
| `/status-governance` | Requests and deadlines | status_request, deadline view | Request queue by state/age, checklist, deadline radar | I |
| `/quality-cases` | Cases and compensation | case_quality | Case ledger, 5 closure fields, KPI view | K |
| `/compliance` | Calendar and freeze record | compliance_item, entity | 13 docs, ECB report deadlines, audit calendar, freeze record | L |
| `/handoff` | Ownership and handoff | handoff, member | Real RACI from data, packet generator, acknowledgement | M |
| `/imports` | Sync and import log | import_batch | Batches, rows in/ok/rejected, quarantine, re-run | F |
| `/dq` | Data-quality issues | dq_issue | Issue list, filters, owner, SLA, resolve notes | N |
| `/audit` | Audit log viewer | audit_log | Search by record/actor/date; export logged | P |
| `/admin/roles-and-access` | Users and roles | member, roles | Invite, role change, deactivate (triggers handoff) | C |
| `/settings/rules` | Rule registry | rule_registry | View/edit with effective dates and source | D |

---

## 5. Work packages A to Z

Order of execution: **A → B → C → D → E**, then **F, G** in parallel, then **H → I → J → K → L → M**, then **N, O, P**, then **Q–U**, **V–X**, **Y**, **Z**. Each package ends with its "Done when".

### A — Project setup and governance
| # | Task |
|---|---|
| A1 | Create repo, branch rules (main protected, PR required), conventional commits |
| A2 | Environments: `dev`, `demo`, `prod` with separate databases and keys; secrets in Vercel/Supabase, never in code |
| A3 | CI: lint, type-check, unit, integration, E2E, and the **no-hard-coded-data check** (T-22) |
| A4 | Feature flags: `finance_afpm`, `csr_sponsors`, `member_engagement`, `comm_360`, `igt` (all off) |
| A5 | Decision log file (`DECISIONS.md`) recording every answer to Q1–Q20 |
| A6 | Remove all hard-coded statuses and demo rows from the current front-end (inventory from §1.1) |
**Done when:** CI is green on an empty app; nav hides out-of-scope modules; decision log exists.

### B — Backend and database
| # | Task |
|---|---|
| B1 | Create migrations from v1.0 §3 (all tables in §3.2, enums, FKs) **with the key changes in §3.3 of this file**: `ep.expa_applicant_id` unique, `exchange.expa_application_id` unique (not `expa_ep_id`), plus the new date and source columns |
| B2 | Triggers: no hard delete (INV-01); append-only `status_history` and `audit_log` (INV-02); write-once `ep_reported_*` (INV-05); audit on every table (INV-09); status change ⇒ history row (DQ-080) |
| B3 | `programme` supports GV/GTa/GTe; GTa/GTe hidden (Q16) |
| B4 | Row Level Security per role (v1.0 §12.4) |
| B5 | Scheduled jobs inside the database for nightly work (Q13) |
| B6 | Seed script is idempotent and **only seeds reference data** (not demo data) |
**Done when:** T-01, T-02, T-03 pass against a real database.

### C — Authentication, roles and people
| # | Task |
|---|---|
| C1 | **Google sign-in with AIESEC Google accounts only** (Q2 answered), through Supabase Auth. Access = email on the allow-list you maintain; an optional domain check is a setting. No anonymous access to any route or API |
| C2 | `member` table starts with the owner only; other members are **invited by email later** (Q9) with a role from v1.0 §12.4; an invite creates the member, deactivation triggers handoff |
| C3 | Route guards + API guards + RLS (defence in depth) |
| C4 | Deactivating a member triggers DQ-011 and a handoff task for their manager |
| C5 | Replace the persona dropdown: dev-only (Q17); header shows the real user and real role |
| C6 | `/admin/roles-and-access`: invite, change role, deactivate; every change audited |
**Done when:** T-06, T-18, T-27 pass; a member can't open `/admin`.

### D — Rule registry
| # | Task |
|---|---|
| D1 | Seed every row of v1.0 §3.4 with its source code; GV duration = **one rule with allowed values `[4, 6, 8]` weeks, no legacy row** (Q8 answered). Store as a list, not a min/max range, so 5 and 7 weeks are invalid; the opportunity form uses a dropdown with these three options. This replaces `{min:4, max:8}` in v1.0 §3.4, DQ-050 and the 5-week example in test T-16 (new example: 4, 6, 8 pass; 5 and 7 fail) |
| D2 | `/settings/rules`: view, add new version with `effective_from`; old versions never edited |
| D3 | Code helper `rule(key, date)`; **no number hard-coded** anywhere else |
| D4 | Mark `OWNER-DECISION` rules as inactive until answered (e.g. GTa duration) |
**Done when:** T-16 passes using a test-only fixture rule version (production has no legacy GV row); a grep for literals like `14`, `35`, `20` in business code finds none.

### E — Reference data: standards, partner standards, compliance docs
| # | Task |
|---|---|
| E1 | Seed `standard_def` with exactly the table in §2 (Q7 answers applied) |
| E2 | Seed 8 partner standards (v1.0 §9.1) |
| E3 | Seed the 13 ICB documents with section (v1.0 §11.2) |
| E4 | Seed the 6 request kinds and their checklist items (v1.0 §7) |
| E5 | Nav label and every page text read counts from the database (16, not 18) |
**Done when:** T-23 (seed equals §2 table) passes.

### F — Import and sync
| # | Task |
|---|---|
| F1 | Upload screen for EXPA CSV with column mapping saved per source. **CSV is the only channel; there is no API or live feed** (Q3 answered). Start from the anonymised sample file; each export type (EPs, opportunities, partners, YOP) gets its own mapping |
| F2 | Validate: required columns, data types, schema drift → reject whole batch |
| F3 | Idempotent upsert on `expa_ep_id`; status and dates from EXPA win, tracker fields never overwritten (v1.0 §13.1) |
| F4 | Row-count guard: drop > `import.max_row_drop_pct` ⇒ quarantine batch, DQ-082 |
| F5 | YOP / Exchange Survey import writes `ep_reported_*` once |
| F6 | `import_batch` log with file hash, rows in/ok/rejected, who, when; `/imports` page |
| F7 | Reconciliation job: DQ-040, 041, 042 |
| F8 | Sync-age banner when last import is older than `sync.max_age_hours` (DQ-031), using `exported_at` read from the file name |
| F9 | Follow §3.3 and §3.4: keys `Id` and `Applicant Id`; `status_raw` kept and mapped through an editable `status_map`; unknown status ⇒ row quarantined, batch continues |
| F10 | Parse duration weeks from the opportunity title; if absent, derive from Experience Start/End; neither ⇒ DQ-050 warning "duration unknown" |
| F11 | Normalise text (trim, collapse spaces, case-fold for matching, keep original); partner dedupe suggestions and a manual merge screen (no organisation ID in the export) |
| F12 | Validate Host MC = Morocco and Host LC = Rabat; any other value ⇒ flag and exclude from boards |
| F13 | Parse list-like columns (nationalities JSON text); de-duplicate repeated values |
| F14 | Convert timestamps from UTC (Q26) to `Africa/Casablanca` for display and deadline maths; store the original UTC |
| F15 | Use the supplied sample (`OpportunityApplication-2026-11-03T20_55_28_00_00.xlsx`) as the first test fixture; add a second fixture once Q24 export arrives. **Never commit real names or emails: anonymise fixtures** |
**Done when:** T-04, T-05, T-28 (re-import changes nothing) pass.

### G — Master tracker (Module A)
| # | Task |
|---|---|
| G1 | CRUD: partner, opportunity, contract, EP, exchange with owner mandatory |
| G2 | Stage board (5 stages) and table view; filters owner, programme, stage, partner, date |
| G3 | Required-field gates by stage (v1.0 §5.1); transition blocked with named missing fields |
| G4 | Status machine and guards (v1.0 §4.2), including frozen-entity block (INV-07) |
| G5 | Exchange record page with history timeline |
| G6 | Buyer-persona and funnel-stage fields on partners (v1.0 §5.2) |
| G7 | Funnel metrics: Call→Open, Open→APL, APL→APD, process time (v1.0 §5.3) |
| G8 | Gates G0–G4: define with owner (Q19) or remove |
**Done when:** T-02, T-05, T-11, T-15 pass; board shows real counts.

### H — Standards tracker and proof vault (Module B)
| # | Task |
|---|---|
| H1 | Create the 16 `standard_check` rows when an exchange is approved |
| H2 | Checklist items per standard (v1.0 §6.2); `delivered` needs all items |
| H3 | Two parallel columns: tracked (with proof) vs EP-reported (read-only); mismatch ⇒ DQ-055 review |
| H4 | `delivered` without proof shows amber "unproven" |
| H5 | Proof upload (Q15): the user uploads in the system and the file goes **straight to Google Drive**; **no file bytes are stored in the database or Supabase Storage**. The browser computes SHA-256 before sending; the server records it. Database keeps only: Drive file ID, link, name, size, type, language, SHA-256, uploader, time. Respect the Vercel request-size limit (Q22): use a resumable Drive upload started by the server and finished by the browser for larger files |
| H5b | Also allow pasting an existing Drive link: stored with hash "not verified" (amber) |
| H6 | Dead-link / checksum change detection nightly (DQ-083) |
| H7 | Co-delivery log per IR partner for standards #1, #2, #3, #16 |
| H8 | Computed `std_delivery_pct` and `completion_readiness` |
| H9 | **Per-EP pop-up card** (opens from any EP row in `/tracker` and `/standards`): a table of all 16 standards with columns Standard · Delivered by · Tracked (checked / not checked / unproven) · EP-reported answer (read-only) · Proof link · Date · Owner. Mandatory standards marked. Checking a row requires its checklist and a proof; unchecking requires a reason (logged) |
| H10 | H6 (nightly check) uses Drive-reported checksum, size, trashed flag and access; any change raises DQ-083 (Q23) |
**Done when:** T-03, T-20, T-29 (hash matches uploaded file) pass; empty exchange shows "not started", never "match".

### I — Status governance and deadlines (Module C)
| # | Task |
|---|---|
| I1 | `status_request` for early FI, extension, and 4 break types with checklists exactly as v1.0 §7 |
| I2 | Lifecycle draft → ready → submitted (ticket ref required) → approved/rejected → applied in EXPA |
| I3 | Timing rules: early FI ≥ 7 d, extension ≥ 14 d before the date (from the rule registry) |
| I4 | APD past RE date logic (v1.0 §7.4), urgent alert, GV direct-break after 20 d |
| I5 | One EP per request/ticket enforced |
| I6 | Deadline engine (v1.0 §8) computing nightly with `Africa/Casablanca` (R9) |
| I7 | Alert ladder T-7 / T-2 / T-0 / overdue with escalation to LCVP then LCP |
| I8 | Radar shows only computed deadlines; **remove "48H Approval-to-RE" and any hard-coded SLA card** |
**Done when:** T-07, T-08, T-09, T-10, T-12, T-25 (Ramadan offset) pass.

### J — Partners (PRM) and IR (Module D)
| # | Task |
|---|---|
| J1 | Partner standards 1–8 per opportunity with due dates and evidence |
| J2 | Touchpoint log (monthly call, site visit, LC touchpoint, newsletter, quarterly review) with next-action date |
| J3 | DQ-060 (gap), DQ-061 (closing meeting), DQ-062 (NPS prerequisites) |
| J4 | Partner NPS capture and link to opportunity |
| J5 | IR partner records with plan fields (Define, Analyze, Promote, Deliver, Track) |
| J6 | Cluster calculation: upscale / grow / understand / invest from supply (applicants) vs market readiness (our opportunities); thresholds `CONFIG` |
| J7 | IR scatter chart; E2E analytics and E2E standards per IR partner; "stuck in funnel" list |
**Done when:** T-17 passes; partners page and radar agree on counts.

### K — Quality cases and compensation (Module E)
| # | Task |
|---|---|
| K1 | Case ledger with 5 mandatory closure fields (v1.0 §10.1) |
| K2 | Financial proof required if compensation > 0 (DQ-071) |
| K3 | Recurrence link, first-response time, resolution time |
| K4 | **4** CS minimums as defined in the Drive (S4) mapped to features (v1.0 §10 table); remove the 3-card layout |
| K5 | Time limits only if Q12 supplies an official source; otherwise `CONFIG` and unset |
| K6 | KPI view: avg resolution time, open cases, compensation by month and class, recurrence |
| K7 | Remove "100% On-Time", "4.2 hours" and the "Moroccan statutory law" sentence |
**Done when:** T-13 passes; with 0 cases KPI cards read "No data".

### L — Compliance calendar and freeze record (Module F)
| # | Task |
|---|---|
| L1 | `compliance_item` for 13 ICB docs, ECB quarterly reports (Apr/Jul/Oct/Jan 28), audit months (Mar, Sep), unfreezing submissions |
| L2 | Score = documents done ÷ documents required; **0 of 13 shows "0%"**, never 100% |
| L3 | Freeze = **record and pause** (Q6 answered): the LCVP records a freeze with a mandatory reference link, who and when; while active, approvals and processing are paused (INV-07); lifting it also needs a reference link and is logged |
| L4 | Evidence links and results; violation level where known |
| L5 | Remove "Annex 4 Fully Audited" and any claim without data |
**Done when:** T-11, T-24 (0/0 and 0/13) pass.

### M — Ownership and handoff (Module G)
| # | Task |
|---|---|
| M1 | RACI matrix **generated from real members and owner fields** (not hard-coded) |
| M2 | Orphan detection (DQ-010/011) with one-click bulk reassign (logged) |
| M3 | Handoff packet with the 10 sections of v1.0 §12.2 built from live queries; each section shows real counts, or "empty" |
| M4 | Workflow: initiated → packet → outgoing review → incoming acknowledgement → transfer → 7-day watch |
| M5 | Term handover (EB to EB) = whole-department scope + full export |
| M6 | Remove all "Complete" labels; a section is complete only when its query ran and the outgoing owner confirmed |
**Done when:** T-06, T-15 pass.

### N — Data-quality engine
| # | Task |
|---|---|
| N1 | Implement every rule in v1.0 §13.2 (DQ-001 to DQ-084) as SQL or functions with unit tests |
| N2 | Run nightly and on write for blockers |
| N3 | `dq_issue` lifecycle: detect → assign → SLA → auto-resolve with note |
| N4 | SLA by severity (Urgent 1 d, Blocker 2 d, Warn 7 d, Review 7 d, `CONFIG`) |
| N5 | `/dq` page with filters and drill-down to the record |
| N6 | Rule enable/disable only via registry, audited |
**Done when:** each DQ rule has a failing and a passing fixture.

### O — Integrity Console and dashboards
| # | Task |
|---|---|
| O1 | Data Health Score with documented weights (`CONFIG`); show components |
| O2 | All 16 views of v1.0 §14 with the chart type listed there |
| O3 | Every chart has an empty state ("No data yet") and a "show the records" drill-down |
| O4 | CSV export from each view, logged (T-19) |
| O5 | Mobile layout: max two columns of cards, tables scroll inside their container |
| O6 | Charts follow the data-viz rules: one y-axis, no rainbow palettes, status colours always with icon and label |
**Done when:** the home page works with an empty database and with the demo database; numbers equal SQL counts.

### P — Audit log and history
| # | Task |
|---|---|
| P1 | `/audit` page: filter by record, table, actor, date; before/after diff |
| P2 | History tab on every record |
| P3 | Export logged; no edit or delete UI exists |
**Done when:** T-01, T-02, T-19 pass.

### Q — Backup and disaster recovery (make it real)
| # | Task |
|---|---|
| Q1 | Nightly snapshot per table (CSV + manifest with row counts and SHA-256) |
| Q2 | Retention 30 daily + 12 weekly (`CONFIG`) |
| Q3 | Scripted restore into a scratch database; result stored in `restore_test` table |
| Q4 | Monthly restore test scheduled; UI shows the **last real result with date**, or "never run" |
| Q5 | Full export ZIP (CSVs, proofs index, handoff packet, rule registry state) |
**Done when:** T-14 passes; UI never shows "passing" without a stored result.

### R — Notifications and alerts
| # | Task |
|---|---|
| R1 | In-app inbox from deadline and DQ engines |
| R2 | Email digest daily (per Q11), urgent items immediately |
| R3 | Header badge = real count of the user's overdue items |
| R4 | Escalation chain and quiet hours (`CONFIG`) |
**Done when:** a seeded overdue item produces an inbox entry and an email in the demo environment.

### S — Interface quality
| # | Task |
|---|---|
| S1 | Global search ⌘K across EPs, partners, opportunities, cases (respecting access rights) |
| S2 | Quick Add for the 5 most common records |
| S3 | Empty states with a clear next action (sentence case, no "Nothing here yet") |
| S4 | Language per Q10; all text in a translation file |
| S5 | Accessibility: keyboard navigation, contrast in light/dark, labels on charts |
| S6 | Fix copy errors (e.g. "No exchanges in all stage") |
**Done when:** a keyboard-only run through the main flow works.

### T — Security and privacy
| # | Task |
|---|---|
| T1 | PII minimisation: store only what each module needs; EP contact fields visible to owner, MM, LCVP, ECB only (INV-10) |
| T2 | DQ-084 PII pattern scan in free-text notes |
| T3 | Anonymisation procedure for deletion requests (Q18) with audit trail |
| T4 | Privacy notice and consent field per Q14 |
| T5 | Security headers, rate limiting, session timeout, no secrets in client bundle |
| T6 | Export controls: role check + audit row |
**Done when:** T-18, T-19, T-26 pass.

### U — Initial data load and cut-over
| # | Task |
|---|---|
| U1 | The only source is EXPA CSV (Q4 answered): write a field-by-field mapping table from the sample export to the schema; no other sheets to migrate |
| U2 | Clean and dedupe (DQ-002, DQ-003) **before** import |
| U3 | Dry-run import into `demo`; reconciliation report: rows in source vs rows loaded vs rejected |
| U4 | Owner review of the report; fix and repeat until zero unexplained rows |
| U5 | Production load; freeze old sheets as read-only archive; date recorded |
**Done when:** reconciliation shows 0 unexplained differences, signed off by you.

### V — Testing
| # | Task |
|---|---|
| V1 | Unit tests for rule helper, deadline maths, status guards, cluster calculation |
| V2 | Integration tests on a real database: all triggers, RLS, imports |
| V3 | E2E (browser) for the 8 main flows |
| V4 | Run all tests T-01 to T-20 from v1.0 §16 **plus** the new ones below |
| V5 | Traceability matrix: every rule in the UI links to its source code |

| ID | New test |
|---|---|
| T-21 | Empty database: no page shows green, "Compliant", "100%", "Complete" or "Passing" |
| T-22 | CI fails if business literals (names, statuses, percentages, SLA numbers) appear in UI code |
| T-23 | Seeded standards equal the §2 table (16 rows, names, phase, delivered by) |
| T-24 | Compliance score with 0 required docs shows "No data"; with 13 required and 0 done shows 0% |
| T-25 | Deadline maths correct across the Ramadan offset change |
| T-26 | Anonymisation removes personal fields, keeps history, logs the action |
| T-27 | A user without the role gets 403 on API and route |
| T-28 | Re-importing the same file changes nothing and logs a no-op batch |
| T-29 | Uploaded proof hash equals the file hash; altering the file is detected |
| T-30 | Handoff cannot complete while orphan records or unacknowledged transfer exist |

### W — Operations and monitoring
| # | Task |
|---|---|
| W1 | Error tracking and structured logs |
| W2 | Uptime check and alert to the owner |
| W3 | Job monitor: nightly jobs report success/failure to the console (DQ-031 style banner) |
| W4 | Cost and quota watch (database size, storage, email) |

### X — Documentation and training
| # | Task |
|---|---|
| X1 | One-page user guide per role |
| X2 | Runbook: restore, rotate keys, add user, change a rule, handle a failed import |
| X3 | Data dictionary generated from the schema |
| X4 | 30-minute training for MMs and TLs using the demo environment |
| X5 | "How to read the Integrity Console" cheat-sheet |

### Y — Pilot and go-live
| # | Task |
|---|---|
| Y1 | Pilot with real data for 2 weeks, 1 team |
| Y2 | Daily check of DQ issues and sync log during the pilot |
| Y3 | Go-live checklist: all Q answered, T-01 to T-30 green, restore test passed, backup admin named (Q20), cut-over done |
| Y4 | Switch old sheets to read-only; announce the single source of truth |

### Z — After go-live
| # | Task |
|---|---|
| Z1 | Weekly 15-minute review of Health Score and open issues |
| Z2 | Rule change procedure: new registry row with `effective_from`, source, announcement; never edit old rows |
| Z3 | Monthly restore test and export |
| Z4 | Quarterly review: unused fields, new policy updates (APIP/AEPP), roles still correct |
| Z5 | Handover at the end of the term using WP-M |
| Z6 | Backlog for out-of-scope modules (finance, CSR, member engagement, comm) only after Q5 re-decision |

---

## 6. Final acceptance (all must be true)

| # | Check |
|---|---|
| 1 | Q1–Q20 answered and recorded in `DECISIONS.md` |
| 2 | T-01 to T-30 green in CI |
| 3 | An empty production database shows no green or "100%" anywhere |
| 4 | Zero hard-coded business data in the UI code (T-22) |
| 5 | Standards equal the Drive source (T-23) |
| 6 | Every claim in the UI about backups, hashing, audits or restore is backed by stored evidence |
| 7 | Data Health Score and every dashboard number equals an SQL count you can reproduce |
| 8 | Reconciliation against EXPA shows 0 unexplained differences |
| 9 | Handoff packet generated from live data and acknowledged in a rehearsal |
| 10 | You (owner) signed off in writing |
