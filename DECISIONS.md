# Architectural & Governance Decisions Log (DECISIONS.md)

**System:** AIESEC iCX Data Integrity & Tracking System  
**Entity:** AIESEC in Rabat, Morocco — Mandate 26.2  
**Owner:** Wadii Hani (Na9ach), LCVP iGV  
**Governing Documents:** `iCX_Data_Integrity_Tracking_Spec.md` v1.0 & `iCX_Data_Integrity_Build_Plan_v2.md` v2.0  
**Last Updated:** 2026-11-03  

---

## 1. Statutory & Architectural Decisions (Q1–Q20)

| Question ID | Scope / Topic | Decision & Value | Rationale & Authority |
|---|---|---|---|
| **Q1** | **Backend & Database** | Next.js on Vercel + Supabase (PostgreSQL 15+, Auth, RLS, Storage) | Closed. Cloud relational model with ACID guarantees, triggers, and append-only audit tables. |
| **Q2** | **Authentication Method** | Google Sign-In with `@aiesec.net` allowlist | Closed. Official AIESEC single sign-on; restricts unauthorized access with strict email verification. |
| **Q3** | **EXPA Data Channel** | CSV export upload with automated column mapping | Closed. EXPA has no open programmatic REST API for LCs. CSV is the sole external ingest channel. |
| **Q4** | **Data Migration Scope** | Single initial EXPA CSV import; no separate sheet migrations | Closed. Real exchange data resides only in EXPA. |
| **Q5** | **v1 Feature Scope** | 8 canonical integrity modules. Hide AFPM finance, CSR sponsors, member engagement, and 360° comm behind feature flags. | Closed. Eliminates out-of-scope clutter to focus 100% on statutory iCX compliance. |
| **Q6** | **ICB Freeze Gate** | Record-and-pause: LCVP records freeze received with audit link; blocks write processing while active (INV-07). | Closed. Aligns with national/international ICB authority structure. |
| **Q7** | **16 Standards & Completeness** | All 16 standards tracked by LC Rabat. Standards #1, #2, #3, and #16 delivered by Home entity, but tracked by Host LC Rabat and **mandatory** for COMPLETE. | Closed. Home standards are mandatory for exchange completion. |
| **Q8** | **GV Duration Rule** | Allowed duration values: `[4, 6, 8]` weeks. No legacy row. Values 5 and 7 are invalid. | Closed. Clarified by owner; dropdown enforces exactly 4, 6, or 8 weeks. |
| **Q9** | **User Roles & Onboarding** | Owner starts as Wadii Hani (LCVP iGV). Other members invited by email later per v1.0 §12.4. | Closed. RBAC roles: LCVP iGV, LCP, Team Leader, Member, ECB Auditor. |
| **Q10** | **Language** | English interface; UI copy structured in translation tokens for future French localization. | Closed. English is the official operational language of AIESEC international exchange. |
| **Q11** | **Alerts & Notifications** | In-app notification inbox + daily email digests for critical deadlines. | Closed. Proactive escalations for 14d visa SLAs and 35d partner touchpoints. |
| **Q12** | **CS Minimum Time Limits** | 4 CS Minimums from Drive (S4). No unverified time limits enforced; fields only, time limits as CONFIG. | Closed. Avoids invented SLA claims without ICB policy backing. |
| **Q13** | **Hosting & Scheduled Jobs** | Database-level scheduled jobs (Supabase `pg_cron`) instead of Vercel serverless cron limits. | Closed. Guarantees nightly execution of deadline scans (T-12) and dead link checks (T-20). |
| **Q14** | **Personal Data Privacy** | PII minimization, role-restricted contact redaction (INV-10), Moroccan Law 09-08 compliance. | Closed. Email relay masking, anonymization procedure for deletion requests. |
| **Q15** | **Proof Document Storage** | Google Drive storage for file binaries; Supabase records metadata and SHA-256 hash. | Closed. Zero binary storage in database; tamper-evident SHA-256 verification. |
| **Q16** | **iGT Scope in v1** | Unified schema ready for GV and GTe; UI filtered to iGV for v1 launch. | Closed. Focus on primary LC Rabat exchange product. |
| **Q17** | **Role Persona Switcher** | Development environment only; strictly disabled in production. | Closed. Production derives identity exclusively from authenticated session. |
| **Q18** | **Data Deletion Protocol** | Anonymize personal fields (name, email, phone) to hashed token; preserve statutory transaction history. | Closed. Satisfies privacy requests without violating append-only invariant INV-01. |
| **Q19** | **Stage Gates G0–G4** | Removed from UI until formalized by national compendium. | Closed. Replaced with 5 Customer Flow Stages (§5.1). |
| **Q20** | **Disaster Recovery Admin** | Named backup admin prior to mandate turnover. | Closed. Documented in the 10-section mandate turnover packet. |

---

## 2. Technical Operational Decisions (Q21–Q33)

| Question ID | Scope / Topic | Decision & Implementation |
|---|---|---|
| **Q21** | **Proof Drive Folder** | Dedicated shared Google Drive folder owned by LC Rabat institutional account, VP account as editor. |
| **Q22** | **Proof File Size Limit** | Maximum 25 MB for PDF and image proofs; uploaded with pre-computed browser SHA-256 checksum. |
| **Q23** | **Dead Link Recovery** | Nightly scan flags inaccessible Drive links as `DQ-083`; preserves metadata and checksum; prompts re-attachment. |
| **Q24** | **EXPA Status Vocabulary** | Strict enum mapping (`open`, `accepted`, `approved`, `realized`, `finished`, `completed`, `break_approval`); unknown status quarantined. |
| **Q25** | **YOP Survey Answers** | Stored once in write-only `ep_reported_answer` (INV-05); never overwritten by manual tracking. |
| **Q26** | **Timezone Handling** | All timestamps stored in UTC and rendered in IANA timezone `Africa/Casablanca`. |
| **Q27** | **Realization Date** | Planned RE date = `planned_start` (`Experience Start Date`). |
| **Q28** | **GTe Import Mode** | Imported with `programme = GTe`; filtered from GV-only dashboards. |
| **Q29** | **Partner De-duplication** | Normalized text matching (lowercase, trimmed whitespace) + manual merge interface. |
| **Q30** | **Applicant Attributes** | Store Name, Email, Nationality. Drop unstructured skills, backgrounds, and languages to minimize PII. |
| **Q31** | **Application Intake Scope** | Import rejected and withdrawn applications for funnel conversion metrics; filter from active exchange board. |
| **Q32** | **Opportunity Slots** | Maintained manually on the opportunity record; EXPA `Slot` free text stored as `slot_label`. |
| **Q33** | **Institutional Ownership** | Drive folder ownership transferred to incoming LCVP during term turnover drill (T-15). |
