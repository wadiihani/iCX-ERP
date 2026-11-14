# AIESEC iCX Command Center

> **Operational Command Platform & Single Source of Truth for Incoming Exchange Operations**  
> Tailored for **AIESEC in Rabat, Morocco** across **iGV**, **iGTa**, and **iGTe** exchange products.

---

## 🏛️ System Architecture

The iCX Command Center is an engineered modular monolith guaranteeing deterministic business compliance, dual-status lifecycle decoupling, and human-in-the-loop AI governance.

```
                    ┌──────────────────────────────────────────────┐
                    │      SvelteKit Frontend (Svelte 5 Runes)     │
                    │  Tailwind CSS · Lucide Icons · Zero React    │
                    └──────────────────────┬───────────────────────┘
                                           │ HTTP / JSON
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │       FastAPI Modular Monolith Backend       │
                    │  18 Modular Domains · SQLAlchemy · Pydantic  │
                    └───┬──────────────────┬──────────────────┬────┘
                        │                  │                  │
                        ▼                  ▼                  ▼
              ┌──────────────────┐  ┌─────────────┐  ┌─────────────────┐
              │  PostgreSQL 16   │  │   Redis 7   │  │ Temporal Server │
              │   (w/ pgvector)  │  │   (Cache)   │  │ (Durable SLAs)  │
              └──────────────────┘  └─────────────┘  └─────────────────┘
```

---

## 🔒 Core Invariants & Governance

1. **Zero React Policy**: The frontend is built 100% in **SvelteKit** with **Svelte 5 runes** (`$state`, `$derived`, `$props`), TypeScript, and Tailwind CSS.
2. **Dual-Status Decoupling**: Official EXPA exchange statuses (`APP`, `ACC`, `APD`, `RE`, `FI`, `CO`) are strictly separated from local operational readiness (`DRAFT`, `READY`, `AT_RISK`, `BLOCKED`, `DONE`). Official EXPA data never clobbers local operational truth.
3. **Strict AI Governance**: LangGraph multi-agent copilots (EP Screening, Partner/IR Intel, Risk Auditor) operate under strict bounds. They can retrieve policy with verified citations, analyze data, and prepare proposals, but **cannot directly execute status mutations, financial waivers, or external dispatches**. All consequential mutations generate an `ApprovalProposal` in status `PENDING_HUMAN_REVIEW` for human sign-off.
4. **Prohibited Host Rejection**: Internal AIESEC entities are prohibited by international compendium from being exchange hosting organizations. Violations are automatically detected and blocked at contract creation.
5. **Deterministic Rules Engines**:
   - **BANT Qualification**: Scores budget, authority, need, and timeline deterministically (0–100 scale, `>= 70` qualified).
   - **Product Rules**: iGV (unpaid physical SDG alignment), iGTa (tiered duration and mandatory living-cost compensation), iGTe (accredited educational institution verification).
   - **18 Standards Completion**: Strict formula requiring `mandatory_fulfilled == 13` AND `total_fulfilled >= 16` before completion approval is unlocked.

---

## 📦 Directory Structure

```
ERP/
├── apps/
│   └── web/                   # SvelteKit + Svelte 5 runes frontend
│       ├── src/
│       │   ├── lib/           # Stores ($state), API client, UI components
│       │   └── routes/        # 16 operational routes (+page.svelte)
│       ├── Dockerfile         # Multi-stage production container
│       └── package.json
├── services/
│   └── api/                   # Python FastAPI modular monolith
│       ├── app/
│       │   ├── core/          # Database, security, JWT auth, base config
│       │   ├── modules/       # 18 domain modules (PRM, CRM, CXP, Finance, etc.)
│       │   ├── seed.py        # Realistic synthetic database seeder
│       │   └── main.py        # FastAPI entrypoint & router aggregation
│       ├── tests/             # Automated test suite (50+ pytest tests)
│       └── Dockerfile         # Hardened multi-stage non-root container
├── docs/
│   └── OPERATIONS_RUNBOOK.md  # Production operations, backup, and runbook
├── docker-compose.yml         # Multi-container production deployment
└── README.md
```

---

## 🚀 Quickstart

### 1. Run with Docker Compose
```bash
docker compose up -d --build
```
- Web UI: [http://localhost:3000](http://localhost:3000)
- API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Temporal UI: [http://localhost:8088](http://localhost:8088)

### 2. Populate Synthetic Demonstration Data
```bash
docker compose exec api python -m app.seed
```

### 3. Pre-configured Demonstration Credentials
- **LCP Admin**: `admin@aiesec.org.ma` / `AdminSecret123`
- **LCVP iCX**: `lcvp.icx@aiesec.org.ma` / `IcxLeader2026!`
- **LCVP FnL**: `lcvp.fnl@aiesec.org.ma` / `FinanceSafe2026!`
- **Team Leader**: `tl.igv@aiesec.org.ma` / `VolunteerLead2026!`
- **BD Member**: `bd.member@aiesec.org.ma` / `PartnerBiz2026!`
- **CX Member**: `cx.member@aiesec.org.ma` / `Delivery2026!`

---

## 🧪 Testing & Verification

Run the comprehensive automated test suite (including the master 12-journey simulation and security hardening):
```bash
$env:PYTHONPATH="services/api"
pytest services/api/tests -v
```

Run frontend production build verification:
```bash
cd apps/web
npm run build
```
