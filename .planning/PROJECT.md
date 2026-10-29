# AIESEC iCX ERP — Hub-Based Operational Integrity Platform

## What This Is

An all-in-one operational tracking and enterprise resource planning application tailored for **AIESEC in Rabat** (`LC Rabat` · `MC Morocco`) and extensible across all Moroccan and international Local Committees. It connects business development, partner commitments, international relations (IR), project portfolio management, opportunity and slot capacity, exchange participant (EP) processing, exchange delivery, customer experience (CXP), quality standards, finance, and team execution into one auditable, high-reliability workflow.

## Central Operating Principle

> **One connected operational record from first partner contact to completed exchange, with an accountable owner, reliable evidence, clear next action, and measurable experience quality at every stage.**

## Primary Knowledge Sources

1. **AIESEC Hub Core** (`https://www.hub.aiesec.org/`): The AIESEC Way, Leadership Development Model, AIESEC 2030, Global Academies, and functional hubs.
2. **Exchange Hub** (`https://www.hub.aiesec.org/exchange-hub`): Refreshed Exchange Standards, Global Exchange Summit guidance (Exchange Planning, SnD, Delivery, MX, EwA, Sales), IR Bootcamp, GT & GV Academies.
3. **GV Hub Resources**: Project Portfolio linking projects to SDGs, activities, intended outputs, and delivery evidence.
4. **IM Hub** (`https://www.hub.aiesec.org/im-hub`): EXPA process guides, status definitions, application flows, EXPA permissions, UTM source tracking, and analytics.
5. **ICB Hub** (`https://www.hub.aiesec.org/icb-hub`): Portfolio integrity, customer centricity, ECB performance, and governance resources.
6. **Functional Hub**: BD, MX, Finance (AFPM), OD, EwA, IM, and ICB knowledge.

## Engineering & Policy Guardrails (The 12 Coding Agent Rules)

1. **Inspect before editing**: Read actual code, migrations, RLS policies, and tests; do not assume prior audit items are defects without verification.
2. **No whole-app rewrite by default**: Preserve the Next.js 14 App Router, TypeScript, Tailwind, and Supabase architecture.
3. **Reconcile specification conflicts**: Explicitly document and resolve discrepancies between master spec, skills guide, old blueprint, and live code.
4. **No fictional AIESEC policy**: Store rules with confidence classifications (`VERIFIED_OFFICIAL`, `CONFIRMED_LOCAL`, `PROPOSED`, `NEEDS_VERIFICATION`, `RETIRED`). Unverified rules never trigger automated rejections.
5. **No hardcoded live metrics**: Every KPI must be computed from source database records and support full drill-down.
6. **No fake functionality**: Every button or affordance must perform its advertised action or be explicitly disabled with an explanation.
7. **Protect current data**: Migrations must be reversible, preserve existing records, and include rollback plans.
8. **Enforce security on the server/database**: RLS and server action authorization; client-side hiding is not security.
9. **Test each vertical slice**: Unit, integration, and E2E tests before marking work complete.
10. **Show evidence**: For every completed task, report files changed, migration changes, test results, limitations, and verification steps.
11. **Keep tasks small**: Vertical phase execution with strict P0 exit gates.
12. **Do not mutate EXPA unofficially**: Use the read-sync engine and Human-in-the-Loop Action Outbox; no unofficial automated scraping.

## Delivery Phases Overview

- **Phase 11**: Global Layout, 4-Group Sidebar Navigation & Zero-CTA Dashboard (Completed 2026-10-29)
- **Phase 12**: Member Management, Team Handovers & Team Standards (`TeSt`)
- **Phase 13**: Data Integrity, B2B Partner CRM & Partner Standards Register
- **Phase 14**: Project Portfolio (iGV/iGTa/iGTe), Opportunities & Capacity Waves
- **Phase 15**: IR Supply Pipeline, EXPA Alignment & EP Funnel Lifecycle
- **Phase 16**: Refreshed Exchange Standards, CXP, Human-Verified Visa & Case Vault
- **Phase 17**: AFPM Finance Controls, Unified Task Engine & KPI Dictionary

---
*Updated: 2026-10-29 from `AIESEC_iCX_ERP_Hub_Based_Improvement_Roadmap.md`*
