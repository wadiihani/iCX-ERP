# iCX Data Integrity & Tracking System — Build Spec v1.0

**Owner:** Wadii Hani (Na9ach) — LCVP iGV, AIESEC in Rabat (EB 26.2)
**Audience:** coding agent. Build exactly what is here. Do not invent rules; every rule must trace to a source code (S0–S9) or be marked `CONFIG` / `ASSUMPTION`.
**Scope:** iGV first (programme = `GV`). `GTa`/`GTe` are supported by the same schema behind a feature flag.
**Format rule:** tables, charts and concrete data views over prose.

---

## 0. Goal and definition of "data flux"

**Data flux** = any silent change, loss, duplication, or drift of a record between people, systems, or time.

Build a **tracker + CRM + PRM** that makes flux impossible to miss and hard to cause:

| # | Outcome | How it is proven |
|---|---|---|
| G1 | No record is ever lost | Soft-delete only, append-only history, daily snapshots, import row-count guard |
| G2 | Every record has exactly one accountable owner | DQ-010 / DQ-011 are blockers |
| G3 | Tracker agrees with EXPA on status and dates | Reconciliation job + DQ-040..042 |
| G4 | Every deadline from AIESEC policy is computed, not remembered | Deadline engine (§8) |
| G5 | Handoff between stakeholders loses nothing | Handoff packet + acknowledgement (§12) |
| G6 | Rule changes do not corrupt old data | Versioned rule registry (§3.4) |
| G7 | Leadership sees data health at a glance | Integrity Console (§14) |

---

## 1. Source map (what the Drive gave us)

Drive root: *iCX – AIESEC Hub (Global Academy & Exchange Hub)*

| Code | Drive file | Used for |
|---|---|---|
| S0 | 00. iCX Master Resource Directory | Folder map, resource index, tool links |
| S1 | 3.8 iCX Standards Delivery | Exchange Standards #1–#16, mandatory flags, YOP questions, tracking logic |
| S2 | ECBA 2026 · EP Status: Breaks, Early FI, Late FI | Break / early-finish / extension conditions and deadlines |
| S3 | ECBA 2026 · Executing the ICB Audit Check & Unfreezing | Audit calendar, 13 documents, freeze/unfreeze |
| S4 | ECBA 2026 · Setting the Bar: CS Minimums & Extramiles | 4 CS minimums, case fields, KPIs, benchmarking |
| S5 | 4.3 Partner Management | Partner Standards #1–#8, NPS, touchpoints, retention |
| S6 | 2.5 Supply & Demand | IR partner clustering, IR plan fields, E2E analytics |
| S7 | 3.5 iGV Sales | Funnel metrics, buyer personas, GV programme criteria |
| S8 | 3.7 iCX Synergy Management | Ownership / RACI between functions |
| S9 | ECBA 2026 · Navigating APIP & AEPP | Updated minimums, ECB report deadlines, data-protection and freeze clauses |

### 1.1 Not readable when this spec was written (agent must NOT assume their content)

| Item | Why it matters | Handling |
|---|---|---|
| Data Management folder (DAAL files explanation videos, §4.6 of S0) | Likely defines official data fields | `ASSUMPTION`: schema in §3 is derived from S1–S9 only. Owner to supply DAAL fields later → add as columns via migration |
| 3.6 iCX Responsibilities on Customer Flow (Hub link) | Official stage ↔ status mapping | Mapping in §4 is `ASSUMPTION` and stored as editable config |
| Exchange Standards tracker (link inside S1) | Official tracker layout | Our Module B replaces it; keep column names compatible where possible |
| GV Dashboard (Looker), GV Global Projects Portfolio, iGT decks, APIP / AEPP PDFs | Extra fields / rules | Out of v1; extension points marked |

---

## 2. Non-negotiable integrity invariants

| ID | Invariant | Enforcement |
|---|---|---|
| INV-01 | **No hard deletes.** Delete = set `deleted_at` + `deleted_reason` + actor | DB trigger blocks `DELETE`; API has no delete route |
| INV-02 | **Append-only history** for status changes and audit log | Triggers block `UPDATE`/`DELETE` on `status_history`, `audit_log` |
| INV-03 | **Every record has `owner_id`** (active member) | `NOT NULL` + FK + DQ-010/011 |
| INV-04 | **EXPA is source of truth for `status` and dates**; tracker is source of truth for proofs, standards tracking, partner relationship, cases | Sync overwrites status fields only; never overwrites tracker-owned fields |
| INV-05 | **EP-reported answers are immutable** (EP's own YOP / Exchange Survey answers must not be influenced by AIESEC — S1) | Separate column set, write-once, import-only |
| INV-06 | **One EP per request/ticket** (S2) | Unique constraint on `status_request.exchange_id` per open request; checklist item |
| INV-07 | **Frozen entity cannot process exchange operations** (S9 clause 8.4.3.3.3.5.3) | `entity.is_frozen` blocks APD-processing actions; banner; no override in UI |
| INV-08 | **Rules are versioned** — never hard-code numbers (e.g. GV 4–8 vs 6–8 weeks) | `rule_registry` with `effective_from` |
| INV-09 | **Every change is attributable** (who, when, before, after, source) | `audit_log` trigger on all tables |
| INV-10 | **Customer data is confidential** — leakage is a *severe* violation (S9 clause 8.3.6.3.1) | Role-based access, PII minimisation, export logging |
| INV-11 | **No scattered sheets / no WhatsApp-only cases** (S4 worst practices) | Cases and requests exist only if logged with timestamp |

---

## 3. Data model

### 3.1 Backbone (matches the iGV flow: Partner → Opportunity → Contract → Match → Experience)

```
op_partner ──< opportunity ──< contract
                    │
                    └──< exchange >── ep
                            │
        ┌───────────┬───────┼────────────┬───────────────┐
 status_history  standard_check  status_request  case_quality  proof_document
```

### 3.2 Entity catalogue

| Table | Purpose | Key fields (abridged) | System of record |
|---|---|---|---|
| `member` | People who own records | id, name, role, active, team_id | Tracker |
| `entity_org` | LCs / MCs / home entities | id, name, kind, country, is_frozen, frozen_since | Tracker (freeze flag from ICB) |
| `op_partner` | Opportunity provider (B2B customer) | id, name, type, city, expa_org_id, owner_id, stage, last_touchpoint_at | Tracker |
| `opportunity` | A posted project/slot set | id, op_id, programme, expa_opp_id, slots, duration_weeks, hours_per_week, benefits, accommodation_provided | EXPA + Tracker |
| `contract` | Agreement with partner | id, opportunity_id, signed_at, payment_terms, key_deadlines, document_id | Tracker |
| `ep` | Exchange participant | id, expa_ep_id (unique), full_name, home_entity_id, contact (restricted), owner_id | EXPA + Tracker |
| `exchange` | One EP × one opportunity (central record) | id, ep_id, opportunity_id, programme, status, break_type, dates, owner_id, expa_hash, expa_synced_at | EXPA (status/dates) |
| `status_history` | Every status change | exchange_id, from_status, to_status, break_type, at, by, source, reason, proof_id | Tracker (append-only) |
| `standard_def` | Seed: Exchange Standards #1–#16 | std_no, name, phase, delivered_by, mandatory, yop_question, answer_options | Seed |
| `standard_check` | Per exchange × standard | exchange_id, std_no, tracked_status, tracked_at, tracked_by, proof_id, **ep_reported_answer**, **ep_reported_at** | Tracker / EP |
| `status_request` | Early FI, extension, 4 break types | see §7 | Tracker |
| `case_quality` | Quality case + compensation | see §10 | Tracker |
| `partner_standard_check` | Partner Standards #1–#8 per opportunity | opportunity_id, std_no, due_at, done_at, evidence_id | Tracker |
| `partner_touchpoint` | Calls, visits, newsletters, reviews | op_id, type, occurred_at, owner_id, notes, next_action_due | Tracker |
| `partner_nps` | Partner NPS | op_id, opportunity_id, score, collected_at | EXPA/partners portal |
| `ir_partner` | Home-entity partnership + IR plan | see §9 | Tracker |
| `proof_document` | Evidence index | subject_type, subject_id, type, drive_url, sha256, uploaded_by, uploaded_at | Tracker |
| `compliance_item` | Calendar of audits/reports | see §11 | Tracker |
| `rule_registry` | Versioned rules | key, value, effective_from, effective_to, source, note | Tracker |
| `dq_issue` | Open data-quality problems | rule_id, subject, severity, detected_at, resolved_at, owner_id | Engine |
| `handoff` | Ownership transfers | from_member, to_member, scope, packet, acknowledged_at | Tracker |
| `audit_log` | Every change | ts, actor, action, table, record_id, before, after, request_id | Tracker (append-only) |
| `import_batch` | Every sync/import | source, file_sha256, rows_in, rows_ok, rows_rejected, schema_version | Engine |

### 3.3 Reference DDL (PostgreSQL, abridged — agent completes remaining columns)

```sql
CREATE TYPE programme   AS ENUM ('GV','GTa','GTe');
CREATE TYPE flow_stage  AS ENUM ('attraction','consideration','preparation','experience','post_experience');
CREATE TYPE ex_status   AS ENUM ('APL','ACP','APD','RE','FI','CO','REJECTED','WITHDRAWN');  -- ASSUMPTION: names per EXPA
CREATE TYPE break_type  AS ENUM ('APD','RE','FI','CO');                                     -- S2: APD/REA/FI/CO breaks

CREATE TABLE exchange (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ep_id           uuid NOT NULL REFERENCES ep(id),
  opportunity_id  uuid NOT NULL REFERENCES opportunity(id),
  programme       programme NOT NULL,
  status          ex_status NOT NULL,
  break_type      break_type,                       -- NULL = not in break
  approved_at     date, re_date date, fi_date date, co_date date,
  owner_id        uuid NOT NULL REFERENCES member(id),
  expa_hash       text, expa_synced_at timestamptz,
  deleted_at      timestamptz, deleted_reason text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ep_id, opportunity_id)
);

CREATE TABLE status_history (                       -- append-only
  id bigserial PRIMARY KEY,
  exchange_id uuid NOT NULL REFERENCES exchange(id),
  from_status ex_status, to_status ex_status NOT NULL, break_type break_type,
  at timestamptz NOT NULL DEFAULT now(),
  by_member uuid REFERENCES member(id),
  source text NOT NULL CHECK (source IN ('expa_sync','manual','system')),
  reason text, proof_id uuid
);

CREATE TABLE standard_check (
  exchange_id uuid NOT NULL REFERENCES exchange(id),
  std_no smallint NOT NULL REFERENCES standard_def(std_no),
  tracked_status text NOT NULL DEFAULT 'not_started'
      CHECK (tracked_status IN ('not_started','in_progress','delivered','not_delivered','n_a')),
  tracked_at timestamptz, tracked_by uuid, proof_id uuid,
  ep_reported_answer text,                          -- WRITE-ONCE (INV-05)
  ep_reported_at timestamptz,
  PRIMARY KEY (exchange_id, std_no)
);

CREATE TABLE rule_registry (
  key text NOT NULL, value jsonb NOT NULL,
  effective_from date NOT NULL, effective_to date,
  source text NOT NULL, note text,
  PRIMARY KEY (key, effective_from)
);

CREATE TABLE audit_log (
  id bigserial PRIMARY KEY, ts timestamptz NOT NULL DEFAULT now(),
  actor uuid, action text NOT NULL, table_name text NOT NULL, record_id text NOT NULL,
  before jsonb, after jsonb, request_id text
);

-- Required triggers
-- 1) BEFORE DELETE on every business table  -> RAISE EXCEPTION (INV-01)
-- 2) BEFORE UPDATE/DELETE on status_history, audit_log -> RAISE EXCEPTION (INV-02)
-- 3) BEFORE UPDATE on standard_check: reject change to ep_reported_* once set (INV-05)
-- 4) AFTER INSERT/UPDATE on every table -> write audit_log row (INV-09)
-- 5) AFTER UPDATE OF status on exchange -> insert status_history row; reject if no matching history row (DQ-080)
```

> **If the agent must stay in Google Sheets + Apps Script** (existing iGV tool system): one sheet per table, identical column names, `ID` columns as UUIDs, protected ranges for `ep_reported_*` and history sheets, `onEdit` writes to an `audit_log` sheet, nightly `Utilities`-based snapshot to Drive. Constraints that Sheets cannot enforce must be enforced in script and tested (§16).

### 3.4 Rule registry seed (versioned — INV-08)

| key | value | source | note |
|---|---|---|---|
| `gv.duration_weeks` | `{min:4, max:8}` effective **2026 (ECBA update)** | S9 | **Conflict:** older decks S1/S7 say 6–8. Keep legacy row `{min:6,max:8}` with `effective_to` = update date. **Owner must confirm the exact effective date** |
| `gte.short_experience_weeks` | `{min:6, max:12}` | S9 | Previously 9–12 |
| `gta.duration_weeks` | `null` | S1 | Source text is garbled (min 6 / 9, max 78). **Do not enforce until owner confirms** |
| `hours.gv_per_week` | `{min:25, max:45}` | S1, S5 | |
| `hours.gta_gte_per_week` | `{min:35, max:45}` | S1, S5 | |
| `visa.docs_due_days_after_approval` | `14` | S9 | Host entity must deliver within 2 weeks of approval |
| `departure_support.days_before_fi` | `14` | S1 | Written, legal + logistic |
| `early_fi.request_min_days_before_new_finish` | `7` | S2 | |
| `extension_fi.request_min_days_before_finish` | `14` | S2 | |
| `apd_re_passed.gv_direct_break_after_days` | `20` | S2 | GV: RE date passed > 20 days → direct extraordinary break allowed |
| `apd_re_passed.auto_violation_level` | `5` | S2 | APD left after RE date = "fake status" → L5 |
| `partner.closing_meeting_max_days_after_fi` | `30` | S5 | Cannot coincide with final review |
| `partner.nps_reminder_months_after_start` | `1` | S5 | |
| `ecb.report_deadlines` | `{Q1:"04-28",Q2:"07-28",Q3:"10-28",Q4:"01-28"}` | S9 | Changed from the 21st to the 28th |
| `icb.audit_check_months` | `[3, 9]` | S3 | March and September |
| `partner.touchpoint_max_gap_days` | `35` | S5 (monthly calls) | `CONFIG` |
| `sync.max_age_hours` | `24` | — | `CONFIG` |
| `import.max_row_drop_pct` | `5` | — | `CONFIG` |

---

## 4. Status machine

### 4.1 Stage ↔ status mapping (`ASSUMPTION` — editable config, verify against S0 §3.6)

| Flow stage (S5) | EXPA statuses | Tracker focus |
|---|---|---|
| Attraction | lead / Open (call → open) | B2B pipeline (§8) |
| Consideration | APL, ACP | Selection, matching, partner standards #1–#4 |
| Preparation | APD → RE | Standards #1–#8, visa, expectations |
| Experience | RE → FI | Standards #9–#15, mid/final review |
| Post-experience | FI → CO | Debrief #16, EP Exchange Survey, partner closing |

### 4.2 Transition guards

| Transition | Guard (all must hold) | Hard / Soft | Source |
|---|---|---|---|
| any → APD / RE processing | `entity.is_frozen = false` | **Hard** | S9 |
| APD → RE | Owner set; visa docs delivered or `visa_not_required`; mandatory preparation standards tracked | Soft (warn) | S1, S9 |
| RE → FI (early) | `early_fi` request ready (§7.1) | **Hard** for tracker-initiated change | S2 |
| RE → FI (extension) | `extension_fi` request ready (§7.2) | **Hard** | S2 |
| any → Break | `break_*` request ready (§7.3), EP currently in the same status | **Hard** | S2 |
| FI → CO | EP's Exchange Survey imported; **completion is the EP's confirmation, never set by AIESEC** | **Hard** (system-only, via import) | S1 |
| any → any (EXPA sync) | Always accepted from EXPA, logged with `source='expa_sync'`; if tracker disagrees → DQ-040 | — | INV-04 |

---

## 5. Module A — Master tracker (EP · Partner · Opportunity · Exchange)

### 5.1 Required fields by stage ("no empty records")

| Field | Attraction | Consideration | Preparation | Experience | Post-exp |
|---|---|---|---|---|---|
| `owner_id` | ✔ | ✔ | ✔ | ✔ | ✔ |
| Partner: name, type, city, contact person, channel, EXPA org id | ✔ | ✔ | ✔ | ✔ | ✔ |
| Opportunity: title, programme, slots, duration, hours/week, benefits, accommodation | | ✔ | ✔ | ✔ | ✔ |
| Contract: signed_at, payment terms, key deadlines, document | | | ✔ | ✔ | ✔ |
| EP: EXPA id, name, home entity, contact | | ✔ | ✔ | ✔ | ✔ |
| Dates: approved_at, re_date | | | ✔ | ✔ | ✔ |
| Dates: fi_date | | | | ✔ | ✔ |
| Standards rows created (#1–#16) | | | ✔ | ✔ | ✔ |
| Mid & final review dates | | | | ✔ | ✔ |
| Survey / debrief outcome | | | | | ✔ |

### 5.2 Buyer-persona tags on partners (S7)

| Field | Type |
|---|---|
| `persona` | enum: NGO Project Manager · NGO Founder · School Director · Other |
| `preferred_channel` | enum: call · WhatsApp · email · Facebook/Instagram · meeting |
| `objection_tags` | multi: payment-before-value · bad past experience · no budget · no accommodation/food · low priority |
| `funnel_stage` | enum: lead · called · meeting · open created · contract signed · hosting · retained · lost |

### 5.3 Funnel conversions tracked (S7)

| Metric | Definition |
|---|---|
| Call → Open | partners called → opportunities opened |
| Open → APL | applications received per open |
| APL → APD | approval rate |
| Process time per stage | days between consecutive stage dates |

---

## 6. Module B — Exchange Standards tracker (S1)

Two parallel truths per standard — **never merge them**:
`tracked_status` (what iCX tracked with proof) vs `ep_reported_answer` (what the EP said in YOP/Exchange Survey).

### 6.1 Seed — `standard_def`

| # | Name | Phase | Delivered by | Mandatory for COMPLETE | EP answer options (YOP) |
|---|---|---|---|---|---|
| 1 | Personal goal setting | Preparation | Home entity (oGX) | `UNKNOWN — verify` | Yes / No (`ASSUMPTION`) |
| 2 | Outgoing preparation | Preparation | Home entity | `UNKNOWN — verify` | Yes / No (`ASSUMPTION`) |
| 3 | Insurance | Preparation | Home entity | `UNKNOWN — verify` | Yes / No (`ASSUMPTION`) |
| 4 | Expectations setting | Preparation | Host (us) | **Yes** | Yes / No |
| 5 | Visa & work permit | Preparation | Host | **Yes** | Yes / No / Visa not required / Work permit not required (multi) |
| 6 | Arrival pickup | Preparation | Host | No | Yes / No |
| 7 | Accommodation | Preparation | Host | **Yes** | Yes / No |
| 8 | Incoming preparation | Preparation | Host | **Yes** | Yes & attended / Yes & didn't attend / No |
| 9 | First day of work | Experience | Host | No | Yes / No |
| 10 | Alignment spaces with opportunity provider | Experience | Host | **Yes** | Yes / No |
| 11 | Job description | Experience | Host | **Yes** | Same JD / Changed but agreed / Changed, not agreed |
| 12 | Working hours | Experience | Host | No | Yes / No |
| 13 | Duration | Experience | Host | **Yes** | Same / Changed but agreed / Changed, not agreed |
| 14 | Opportunity benefits | Experience | Host | **Yes** | Yes / No / No benefits specified |
| 15 | Departure support | Experience | Host | No | Yes / No |
| 16 | Debrief with AIESEC | Post-experience | Home entity | `UNKNOWN — verify` | Yes / No (`ASSUMPTION`) |

### 6.2 Delivery definitions to encode as checklist items

| # | Checklist (all required to mark `delivered`) |
|---|---|
| 4 | Written onboarding covering: culture, political situation, safety, living standards, home & host contacts, accommodation conditions |
| 5 | Invitation letter + supporting docs issued (if visa needed) |
| 6 | Pickup point agreed before travel + written info on domestic transport; pickup done by AIESEC rep |
| 7 | Matches opportunity conditions/costs; at least: single bed, clean water, bathroom, electricity |
| 8 | Seminar on arrival before work starts, including: follow-up of personal goals, culture, living standards |
| 9 | AIESEC rep brings EP physically to workplace on day 1 |
| 10 | ≥1 alignment space at start (JD ↔ goals) **and** ≥1 debrief space at end |
| 11 | JD executed = JD posted; any change communicated and agreed |
| 12 | Hours as posted; within `hours.*` rule |
| 13 | Duration as posted (first to last working day); within `*.duration_weeks` rule |
| 14 | All posted benefits delivered (financial / food / transport) |
| 15 | Written legal + logistic departure procedure sent ≥ 14 days before end |

### 6.3 Computed fields

| Field | Formula |
|---|---|
| `std_delivery_pct` | delivered mandatory host standards ÷ total mandatory host standards |
| `completion_readiness` | `true` if all mandatory host standards `delivered` **and** proofs attached |
| `std_mismatch` | `tracked_status = 'delivered'` AND `ep_reported_answer` negative (or reverse) → DQ-055 (review only; never auto-edit EP answer) |

### 6.4 Rules

| Rule | Detail |
|---|---|
| Tracking starts at approval | iCX tracks from APD with frequent touchpoints with EP and home entity (S1) |
| Proof required | `delivered` without `proof_id` stays `delivered_unproven` (shown amber) |
| Co-delivery log | Per `ir_partner`, record how each home-entity standard (#1, #2, #3, #16) is delivered/tracked/reported (S1 "align how each standard is delivered, tracked, audited and reported") |
| Post-peak review | After each peak, prompt a co-delivery review note per IR partner |

---

## 7. Module C — Status-change governance (S2)

One table, `status_request`, six `kind`s. A request cannot move to `submitted` until every checklist field is true.

### 7.1 `early_fi`

| Checklist field | Rule |
|---|---|
| `ep_in_required_status` | EP status = RE in EXPA |
| `valid_reason_apip` | Reason is covered by APIP (free-text + APIP clause ref) |
| `proof_lc2lc_email_pdf` | PDF attached |
| `proof_ep_opp_agreement` | Attached |
| `email_min_info` | Contains EP details, opportunity details, reason |
| `timing_ok` | `submitted_at ≤ desired_new_finish − 7 days` |
| `duration_min_ok` | New duration ≥ programme minimum (rule registry) |
| `zendesk_form_ok` | All required fields + attachments |
| `single_ep` | Ticket covers exactly one EP |

### 7.2 `extension_fi` (late FI)

Same as 7.1 except `timing_ok`: `submitted_at ≤ opportunity_finish − 14 days`. Note: if EP and OP continue independently after the official end, it is outside AIESEC responsibility — show a warning banner when `fi_date` has passed with no approved extension.

### 7.3 `break_apd` · `break_re` · `break_fi` · `break_co`

| Checklist field | Rule |
|---|---|
| `ep_same_status` | EP's EXPA status equals the break's stage |
| `valid_reason_apip` | APIP-covered reason |
| `proof_lc2lc_email_pdf_en` | PDF, **English** |
| `proof_ecb2ecb_email_pdf_en` | PDF, **English** |
| `email_min_info` | EP details, opportunity details, reason |
| `zendesk_form_ok` | Complete + attachments |
| `single_request_per_ep` | One break-status request per EP per ticket |

### 7.4 APD with RE date passed (special case)

| Condition | System action |
|---|---|
| APD and `re_date < today` | Create **urgent** DQ-052 issue; show "fake status risk — Violation L5" |
| GV and `today − re_date > 20` | Enable **direct extraordinary break (APD)** without proof requirement |
| GTa/GTe | Normally must be RE same day; if passed, direct submission also allowed |
| `ASSUMPTION` | Exact day the L5 triggers is not stated in S2 → make configurable, default alert from day 1 |

### 7.5 Request lifecycle

`draft → ready (checklist complete) → submitted (ticket ref required) → approved | rejected → applied_in_expa (confirmed by sync)`

Rejected requests stay in history (INV-01).

---

## 8. Deadline engine

All deadlines computed nightly into a `deadline` view; every row has `owner_id`, `due_at`, `rule_key`, `source`.

| Deadline | Formula | Source |
|---|---|---|
| Visa documents delivered | `approved_at + 14 d` (if visa required) | S9 |
| Departure support sent | `fi_date − 14 d` | S1 |
| Early FI request cutoff | `new_finish − 7 d` | S2 |
| Extension request cutoff | `finish − 14 d` | S2 |
| APD past RE date | `re_date` (urgent), `re_date + 20 d` (direct break eligible, GV) | S2 |
| Partner NPS reminder | `re_date + 1 month` | S5 |
| Partner closing meeting | `≤ fi_date + 1 month`, and ≠ final-review date | S5 |
| Partner monthly touchpoint | `last_touchpoint + 35 d` (`CONFIG`) | S5 |
| Partner quarterly review | quarter end (`CONFIG`) | S5 |
| ECB quarterly audit report | Apr 28 / Jul 28 / Oct 28 / Jan 28 | S9 |
| ICB Audit Check | March, September (3 submissions; L5/L4 first two, L3–L1 added third) | S3 |
| Unfreezing submissions | Weekly Monday; feedback following Thursday (after 2nd official unfreezing; Jan–Feb and Jul–Aug) | S3 |
| Master-sheet freshness | ≤ 7 days since last update (best practice) | S4 |
| CS KPI report | Monthly to MC & LCs (best practice) | S4 |

**Alert ladder (default, `CONFIG`):** T-7 d notice → T-2 d warning → T-0 urgent → overdue (daily until closed; escalates to LCVP then LCP).

---

## 9. Module D — Partner (PRM) & IR

### 9.1 Partner standards per opportunity (S5)

| # | Name | Stage | Rule to encode |
|---|---|---|---|
| 1 | Expectations setting | Consideration | Meeting logged covering: LDM, exchange elements, contract & payment, deadlines, timeline, required profile, JD minimums, EP types, comms channel/frequency, visa timeline |
| 2 | Selection process | Consideration | Selection mode recorded (partner selects on partners portal **or** AIESEC shortlists), timeline, comms agreement |
| 3 | Job description | Consideration | Duration, activities/KPIs/objectives, skills, working conditions |
| 4 | Working hours | Consideration | Within `hours.*` rule |
| 5 | Partner preparation meeting | Preparation | Goal-setting meeting with EP logged; KPIs/targets; review date |
| 6 | Visa & work-permit support | Preparation | Doc list, deadline agreed, update frequency |
| 7 | Experience evaluation | Experience | **Mid review + final review** logged; NPS reminder sent |
| 8 | Partner closing meeting | Post-exp | ≤ 1 month after FI; separate from final review; includes renewal/extension offer |

**Tracked per opportunity inside account-management routines — no per-opportunity partner survey** (S5).
Partner NPS prerequisites: organisation exists in EXPA with linked employees **or** partner signed up on partners portal → DQ-062.

### 9.2 Partner touchpoints

| `type` | Source |
|---|---|
| monthly_call · site_visit · lc_touchpoint · newsletter · quarterly_review | S5 |

### 9.3 IR partner record (`ir_partner`) and clustering (S6)

| Field group | Fields |
|---|---|
| Define | home_entity_id, purpose, partnership_goals |
| Analyze | supply = **applicants received from them** (iCX), market_readiness = **our opportunities available** (iCX), persona, timeline, result_history |
| Promote | physical_content, digital_content, comms_channels |
| Deliver | RE growth target, process-time target, standards co-delivery notes, strategy |
| Track | tracker status, routines, review_frequency, network_touchpoints, investment, last_review_at |

| Cluster | Rule (thresholds `CONFIG`) | Meaning (S6) |
|---|---|---|
| **upscale** | high supply, high market readiness | Innovate together |
| **grow** | low supply, high market readiness | Potential to grow |
| **understand** | low supply, low market readiness | New cooperation, explore |
| **invest** | high supply, low market readiness | Fix bottlenecks / attraction |

Per-partnership analytics (S6): **E2E analytics** (results by customer-flow stage) and **E2E standards** (% standards delivered) — both computed from Modules A/B, filtered by `home_entity_id`.
Also: list EPs **stuck in the funnel** per IR partner; track every approval/rejection decision (S6).

---

## 10. Module E — Quality cases & compensation (S4)

The four CS Minimums are the acceptance contract for this module.

| CS Minimum (S4) | Implemented as |
|---|---|
| 1. Centralised handling of support requests, response-time tracking | `case_quality` + `first_response_at`; no case exists outside the tool |
| 2. EP & exchange tracking (status, case history, break requests, financial) | Joins of `exchange`, `case_quality`, `status_request`, `compensation` |
| 3. KPI reporting | Monthly KPI view (below) |
| 4. Quality case storage | Mandatory fields below |

### 10.1 `case_quality` mandatory fields (cannot close without all five)

| Field | Notes |
|---|---|
| `description` | |
| `classification` | enum: policy_breach · expectation_gap · other (extensible; S4 says "etc.") |
| `resolution_steps` | ordered list with timestamps |
| `financial_proof_id` | required if `compensation_amount > 0` (DQ-071) |
| `final_agreement_id` | signed/confirmed agreement |

Other fields: `opened_at`, `first_response_at`, `closed_at`, `compensation_amount`, `currency`, `recurrence_of` (links to earlier similar case), `owner_id`.
Migration fines/penalties are a recognised compensation expense (S9) → `compensation_type` enum includes `migration_fine`.

### 10.2 KPI view (S4)

| KPI | Formula | Chart (see §14) |
|---|---|---|
| Avg resolution time | mean(`closed_at − opened_at`) | line by month |
| Open cases | count where `closed_at is null` | KPI card |
| Compensation amount | sum by month / by classification | stacked bar |
| Case recurrence | share of cases with `recurrence_of` set | line |

---

## 11. Module F — Compliance calendar (S3, S9)

Lightweight: stores evidence links and deadlines, not the national audit itself.

### 11.1 `compliance_item`

| Field | Notes |
|---|---|
| `kind` | `icb_audit_doc` · `ecb_quarterly_report` · `unfreezing_submission` · `internal_audit` |
| `due_at`, `submitted_at`, `result`, `pass_pct`, `evidence_ids`, `owner_id` | |
| `violation_level` | 1–5 where known |

### 11.2 ICB Audit Check — 13 documents (S3)

Audited sections of the compliance matrix (APIP Annex 4): 3.1.1 Legal Support, 3.1.2 Risk Management, 3.1.3 Educational, 3.1.4 Quality Management.

| # | Document | Section |
|---|---|---|
| 1 | Programmes statement | General |
| 2 | Lawyer / PR establishment letter | 3.1.1 |
| 3 | Contract explanation | 3.1.1 |
| 4 | PHAVC establishment letter | 3.1.2 |
| 5 | ECB establishment letter | 3.1.2 |
| 6 | Contacts updated in ECB global contact list | 3.1.2 |
| 7 | ESC establishment letter | 3.1.2 |
| 8 | Risk management plan | 3.1.2 |
| 9 | Email template of health & safety measures | 3.1.2 |
| 10 | Education plan (L4 + L3) | 3.1.3 |
| 11 | SOPs updated to external national context | 3.1.3 |
| 12 | Management tool for quality cases | 3.1.4 |
| 13 | ECB audit system | 3.1.4 |

Freeze logic: `entity.is_frozen` is set manually by owner from ICB results, with source link; INV-07 then applies.

---

## 12. Module G — Ownership & handoff (G2, G5)

### 12.1 Ownership model

| Rule | Detail |
|---|---|
| One accountable owner per record | `owner_id` mandatory on partner, opportunity, exchange, case, request, IR partner, compliance item |
| Optional RACI | `raci` jsonb: Responsible / Accountable / Consulted / Informed (S8: "never decide without understanding your RACI") |
| Synergy interfaces | Tag items needing other functions: `marketing`, `b2b`, `tm_mxp`, `finance_legal` (S8) |
| Orphan detection | Owner set to inactive member → DQ-011 → auto-created handoff task to their manager |

### 12.2 Handoff packet (auto-generated JSON + printable view)

| Section | Content |
|---|---|
| Open exchanges | grouped by stage, with next deadline |
| Overdue / due in 14 d | from deadline engine |
| Open requests | breaks / FI / extensions with checklist state |
| Open cases | with compensation exposure |
| Partners | stage, last touchpoint, next action, open standards |
| IR partners | cluster, last review |
| Open DQ issues | by severity |
| Proof index | all linked documents with checksum status |
| Change log | last 30 days from `audit_log` |
| Access list | roles and who has them (no secrets) |

### 12.3 Handoff workflow

`initiated → packet generated → reviewed by outgoing → acknowledged by incoming → ownership transferred (bulk, logged) → 7-day watch (any DQ-010/011 raised → reopens)`

**Definition of done:** zero records without an active owner, incoming owner acknowledged, packet archived to Drive.
**Term handover (EB → next EB):** same workflow, scope = whole department, plus full export (§13.3).

### 12.4 Roles and access (least privilege — INV-10)

| Role | Read | Write | Special |
|---|---|---|---|
| LCVP iGV | all | all | approve handoffs, set freeze flag, manage rules |
| MM | own team | own team | reassign within team |
| TL / member | own records | own records | cannot touch `ep_reported_*`, history, rules |
| ECB | all cases, requests, compliance | cases, requests | read-only elsewhere |
| LCP | all (aggregate by default) | none | |
| Finance | cases (financial fields) | compensation fields | |
| Auditor | all | none | export logged |

EP contact data visible only to owner, MM, LCVP, ECB. Every export writes an `audit_log` row.

---

## 13. Flux-prevention engine

### 13.1 Integration and reconciliation

| Flow | Method | Guard |
|---|---|---|
| EXPA → tracker | Scheduled import (CSV export, or API if the owner provides access) | `import_batch` row; schema-drift check; DQ-082 row-drop guard; idempotent upsert on `expa_ep_id` |
| YOP / Exchange Survey → `ep_reported_*` | Import | Write-once |
| Tracker → Drive | Nightly snapshot (CSV per table + checksums) and weekly full export | Keep last 30 daily + 12 weekly (`CONFIG`) |
| Proofs | Drive URL + `sha256` stored | DQ-083 detects dead link / checksum change |

Sync merge rule (INV-04):

| Field class | On conflict |
|---|---|
| `status`, `break_type`, approval/RE/FI/CO dates | EXPA wins; log history; raise DQ-040/041 if tracker had a pending request that disagrees |
| `standard_check.tracked_*`, partner, case, request fields | Tracker wins; sync never touches |
| Missing in EXPA but present in tracker | Keep, flag DQ-042 (never delete) |

### 13.2 Data-quality rules (run nightly; blockers also run on write)

| ID | Check | Severity |
|---|---|---|
| DQ-001 | Duplicate `expa_ep_id` | Blocker (constraint) |
| DQ-002 | Fuzzy duplicate EP (normalised name + home entity) | Warn |
| DQ-003 | Fuzzy duplicate partner (normalised name + city / email domain) | Warn |
| DQ-010 | Record without owner | Blocker |
| DQ-011 | Owner is inactive | Blocker → handoff task |
| DQ-020 | Required fields missing for current stage (§5.1) | Warn; Blocker at stage transition |
| DQ-021 | Exchange without opportunity, or opportunity without partner | Blocker |
| DQ-030 | Record not updated within stage SLA (`CONFIG`, default 14 d active stages) | Warn |
| DQ-031 | Last EXPA sync older than `sync.max_age_hours` | Blocker (global banner) |
| DQ-040 | Tracker status ≠ EXPA status | Blocker (EXPA wins) |
| DQ-041 | Date mismatch (approved / RE / FI / CO) | Warn |
| DQ-042 | EP in EXPA missing from tracker / reverse | Blocker / Warn |
| DQ-050 | Duration outside current rule | Warn |
| DQ-051 | Weekly hours outside current rule | Warn |
| DQ-052 | APD with RE date passed | Urgent |
| DQ-053 | Visa docs not delivered within 14 d of approval | Urgent |
| DQ-054 | Mandatory host standard untracked after approval (per stage timing) | Warn |
| DQ-055 | Tracked vs EP-reported standard mismatch | Review |
| DQ-056 | Departure support not sent by `fi_date − 14 d` | Warn |
| DQ-057 | Status request submitted with incomplete checklist or past cutoff | Blocker |
| DQ-058 | Request covers more than one EP | Blocker |
| DQ-060 | Partner without touchpoint within `partner.touchpoint_max_gap_days` | Warn |
| DQ-061 | Partner closing meeting not held ≤ 1 month after FI | Warn |
| DQ-062 | Partner not linked for NPS (no EXPA org / linked employee) | Warn |
| DQ-070 | Case closed with any of the 5 mandatory fields missing | Blocker |
| DQ-071 | Compensation > 0 without financial proof | Blocker |
| DQ-080 | `exchange.status` ≠ last `status_history.to_status` | Blocker |
| DQ-081 | Hard-delete attempted | Blocker (logged) |
| DQ-082 | Import row count dropped > `import.max_row_drop_pct` vs previous batch | Blocker (quarantine batch) |
| DQ-083 | Proof link dead or checksum changed | Warn |
| DQ-084 | PII pattern (phone/email/ID) found in free-text notes | Warn |

Each `dq_issue` has: owner, detected_at, SLA by severity (Urgent 1 d · Blocker 2 d · Warn 7 d · Review 7 d — `CONFIG`), resolved_at, resolution note. Auto-resolves when the rule stops firing; the resolution is logged.

### 13.3 Backup and export

| Item | Spec |
|---|---|
| Snapshot | Nightly, per-table CSV + manifest (row counts, sha256) |
| Restore test | Scripted restore into a scratch DB monthly; test must pass (§16 T-14) |
| Full export | One ZIP: CSVs + proofs index + handoff packet + rule registry state |

---

## 14. Integrity Console (dashboards)

Minimalist. Cards on top, one chart per question, filters: owner · programme · stage · date range · partner · IR partner.

| View | Question | KPI / measure | Chart type |
|---|---|---|---|
| **Data Health Score** | Are we safe? | Weighted score 0–100 (defaults: completeness 35 · freshness 25 · EXPA consistency 25 · ownership 15 — `CONFIG`) | KPI card + sparkline |
| Open DQ issues | What is broken? | Count by severity × owner | Stacked bar |
| Staleness | Where are we stale? | % records past SLA by stage | Horizontal bar |
| Completeness | Which fields are empty? | % complete per required field × stage | Heatmap |
| Reconciliation | Do we match EXPA? | Mismatch count per sync (DQ-040..042) | Line (per sync) |
| Orphans | Who owns nothing? | Records without active owner | Table (drill to handoff) |
| Deadline radar | What is due? | Next 14 days by deadline type | Timeline / table with countdown |
| Request queue | Breaks / FI / extensions | By state and age | Kanban-style table |
| Standards delivery | Are standards delivered? | `std_delivery_pct` per standard #, per IR partner | Bar (per #), table (per partner) |
| Standards mismatch | Tracked vs EP-reported | DQ-055 count | Table |
| Partner health | Who is drifting? | Days since last touchpoint, NPS, open standards | Scatter (gap vs NPS) + table |
| IR clusters | Where to invest? | Supply vs market readiness per IR partner | 2×2 scatter with quadrants |
| Funnel | Where do we lose people? | Call→Open, Open→APL, APL→APD, process time | Funnel + bar |
| Cases | Cost & speed of quality | §10.2 KPIs | Line + stacked bar |
| Sync log | Did every import land? | Rows in / ok / rejected per batch | Table + bar |
| Handoff | Is anything in transit? | Handoffs pending ack | Table |

Each chart/table has a **“show the records”** drill-down and **CSV export** (logged).

---

## 15. Build order (milestones)

| M | Deliverable | Contains |
|---|---|---|
| **M0** | Foundation | Schema, triggers (INV-01/02/05/09), roles, rule registry + seed (§3.4), audit log, import_batch |
| **M1** | Master tracker | Partner / opportunity / contract / EP / exchange CRUD, stage required-field gates, EXPA import + reconciliation (DQ-040..042, 080, 082) |
| **M2** | Standards | `standard_def` seed, checklists, proofs, tracked vs EP-reported, DQ-054/055/056 |
| **M3** | Status governance | `status_request` kinds, checklist validators, lifecycle, deadline engine core |
| **M4** | Partner & IR | Partner standards, touchpoints, NPS prerequisites, IR plan + clustering |
| **M5** | Cases | Case storage, compensation, KPI view |
| **M6** | Compliance calendar | Items, ECB report deadlines, audit calendar, freeze flag + INV-07 |
| **M7** | DQ engine + Console | All DQ rules, issue SLAs, dashboards (§14) |
| **M8** | Handoff + backup | Handoff workflow/packet, snapshot/restore, full export |

Each milestone ships with its tests (§16) passing and a seed/demo dataset.

---

## 16. Acceptance tests (Given / When / Then)

| ID | Test |
|---|---|
| T-01 | **Given** any business row, **when** `DELETE` is attempted (SQL or API), **then** it fails and DQ-081 is logged |
| T-02 | **Given** a status change, **when** saved, **then** `status_history` has a matching row; manual `UPDATE` of history fails |
| T-03 | **Given** `ep_reported_answer` set, **when** anyone updates it, **then** rejected |
| T-04 | **Given** EXPA import with 10% fewer rows than previous batch, **then** batch is quarantined, nothing applied, DQ-082 raised |
| T-05 | **Given** EXPA says RE and tracker says APD, **when** sync runs, **then** tracker adopts RE, history logged `expa_sync`, DQ-040 raised then auto-resolved |
| T-06 | **Given** a record owner is deactivated, **then** DQ-011 fires and a handoff task is created for their manager within one nightly run |
| T-07 | **Given** early-FI request missing the LC2LC PDF, **when** moved to `submitted`, **then** blocked with the missing item named |
| T-08 | **Given** early-FI desired finish in 5 days, **then** `timing_ok = false` (needs ≥ 7 days) |
| T-09 | **Given** extension with finish in 10 days, **then** `timing_ok = false` (needs ≥ 14 days) |
| T-10 | **Given** an APD whose `re_date` passed 21 days ago (GV), **then** DQ-052 is urgent and direct-break path is offered |
| T-11 | **Given** entity `is_frozen`, **when** a user tries to process an approval, **then** blocked with ICB reference |
| T-12 | **Given** approval on day 0 with visa required and no visa docs on day 15, **then** DQ-053 urgent |
| T-13 | **Given** case with compensation > 0 and no financial proof, **when** closing, **then** blocked (DQ-071) |
| T-14 | **Given** last night's snapshot, **when** restored to a scratch DB, **then** row counts and checksums match the manifest |
| T-15 | **Given** a handoff, **when** incoming owner hasn't acknowledged, **then** ownership does not transfer |
| T-16 | **Given** GV opportunity of 5 weeks, **then** passes under the 4–8 rule; **given** legacy rule version selected for a historical date, **then** fails (6–8) — proves versioned rules |
| T-17 | **Given** partner with no touchpoint for 36 days, **then** DQ-060 warns |
| T-18 | **Given** a viewer with role `member`, **then** EP contact fields of others' records are not returned by API |
| T-19 | **Given** any CSV export, **then** an `audit_log` row records actor, scope, row count |
| T-20 | **Given** a Drive proof link that returns 404, **then** DQ-083 flags it within one nightly run |

---

## 17. Decisions the owner must provide (agent: ask before M1, use defaults meanwhile)

| # | Decision | Default if unanswered |
|---|---|---|
| D1 | Stack | PostgreSQL + web app; fallback Google Sheets + Apps Script (§3.3) |
| D2 | EXPA access: CSV export vs API | CSV export, manual upload with schema check |
| D3 | Effective date of the GV 4–8 week rule | Date of the ECBA 2026 update; legacy 6–8 before it |
| D4 | Mandatory-for-complete flag for standards #1, #2, #3, #16 | Treated as non-mandatory until confirmed |
| D5 | Stage ↔ EXPA status mapping | §4.1 |
| D6 | Cluster thresholds (high/low supply and readiness) | Median of own data, recalculated monthly |
| D7 | Stage SLAs for staleness | 14 days in active stages |
| D8 | UI language | English |
| D9 | iGT (GTa/GTe) in v1? | Schema ready, UI hidden |
| D10 | Who can set `is_frozen` | LCVP iGV only |

---

## 18. Definition of Done (whole system)

| Check | Pass condition |
|---|---|
| All 20 tests in §16 | Green in CI |
| Data Health Score | Computed and displayed, with drill-down for every component |
| Zero unowned records after seed + simulated handoff | ✔ |
| Full export restores into a clean environment | ✔ |
| Every rule number in code | Read from `rule_registry`, never hard-coded |
| Every business rule in this file | Traceable via its source code in the UI tooltip |
