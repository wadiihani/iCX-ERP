# System Architecture Overview

## 1. High-Level Architecture

The **AIESEC iCX Command Center** is structured as a robust **Modular Monolith**:
- **Frontend Application (`apps/web`)**: SvelteKit + Svelte 5 + TypeScript with Tailwind CSS and Bits UI. Strictly no React.
- **Backend API (`services/api`)**: Python 3.14 + FastAPI structured into domain-bounded modules (`identity`, `organizations`, `prm`, `irm`, `opportunities`, `crm`, `applications`, `exchanges`, `cxp`, `finance`, `tasks`, `analytics`, `ai`, `approvals`, `integrations`).
- **Database (`PostgreSQL`)**: Relational database serving as the local operational source of truth, enhanced with `pgvector` for embedding storage and similarity search.
- **Cache & Event Outbox (`Redis`)**: Fast caching, rate-limiting, and distributed locks for slot capacity allocation.
- **Workflow Automation (`Temporal`)**: Durable execution engine for operational SLA timers, reminder cascades, and background reconciliation.
- **AI Agent Orchestration (`LangGraph`)**: Stateful multi-agent graph with typed tools, provenance tracking, and explicit human approval checkpoints.

```mermaid
flowchart TD
    subgraph Client ["Frontend Layer (apps/web)"]
        UI["SvelteKit + Svelte 5 + TypeScript"]
        Bits["Bits UI + Tailwind CSS"]
        Charts["Apache ECharts + GSAP"]
        UI --> Bits
        UI --> Charts
    end

    subgraph API ["Backend Layer (services/api)"]
        FastAPI["FastAPI Modular Monolith"]
        AuthMiddleware["JWT / Session Auth & RBAC"]
        RulesEngine["Deterministic Business Rules Engine"]
        FastAPI --> AuthMiddleware
        FastAPI --> RulesEngine
    end

    subgraph Data ["Data & Storage Layer"]
        PG[("PostgreSQL\n(Local Operational Source of Truth)")]
        PGV[("pgvector\n(Knowledge & Policies)")]
        Redis[("Redis\n(Cache & Locks)")]
        Storage["Private Document Store\n(Signed URLs)"]
    end

    subgraph Orchestration ["Workflows & AI Agents"]
        LangGraph["LangGraph Multi-Agent System"]
        ApprovalCenter["Human-in-the-Loop Approval Center"]
        Temporal["Temporal Durable Workflows"]
        LangGraph --> ApprovalCenter
    end

    subgraph External ["External Boundaries"]
        EXPA["EXPA / GIS\n(Authoritative for Global Statuses)"]
        GDrive["Google Drive API"]
    end

    Client -- "REST /api/v1 (JSON/HTTPS)" --> FastAPI
    FastAPI --> PG
    FastAPI --> PGV
    FastAPI --> Redis
    FastAPI --> Storage
    FastAPI --> Temporal
    FastAPI --> LangGraph
    FastAPI -- "Sync Adapter (Gated)" --> EXPA
    FastAPI -- "OAuth (Metadata)" --> GDrive
```

## 2. Core Operational Flow & The Two-Sided Marketplace

iCX connects local B2B hosting capacity with international EP demand at the application and matching junction:

```mermaid
flowchart LR
    subgraph Supply ["Local B2B Supply Side (PRM)"]
        Org["Organization"] --> Lead["Lead Pipeline"]
        Lead --> Contract["Contract Signed"]
        Contract --> Opp["Opportunity"]
        Opp --> Slot["Capacity Slot"]
    end

    subgraph Demand ["Global B2C Demand Side (IRM/CRM)"]
        MC["Sending Entity (MC/LC)"] --> IR["IR Partnership"]
        IR --> EP["EP Profile"]
        EP --> App["EP Application"]
    end

    subgraph Junction ["Matching & Operations"]
        Slot & App --> Screening["Screening & Interview"]
        Screening --> Match["Match (APD)"]
        Match --> Exchange["Exchange Operations"]
        Exchange --> CXP["CXP (18 Standards)"]
        CXP --> Comp["Completion Readiness"]
    end
```

## 3. Official EXPA Status vs Local Operational Readiness

The platform enforces a strict boundary between official global status and local operational readiness:
- **Official EXPA Status**: `APP` → `ACC` → `APD` → `RE` → `FI` → `CO` (plus exceptions: `REJ`, `WDR`, `BRK_APD`, `BRK_RE`, `EARLY_FI`, `LATE_FI`). EXPA is the authoritative record.
- **Local Operational Readiness**: `INCOMPLETE`, `READY_FOR_REVIEW`, `BLOCKED`, `AT_RISK`, `READY`, `IN_PROGRESS`, `DONE`, `WAIVED_WITH_APPROVAL`.
- **Invariant**: Local task completion never automatically triggers an EXPA mutation. Consequential status transitions require human review in the Approval Center.
