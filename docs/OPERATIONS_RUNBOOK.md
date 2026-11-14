# AIESEC iCX Command Center — Operations & Production Runbook

## 1. System Overview & Architecture

The **AIESEC iCX Command Center** is an operational single source of truth and command platform built specifically for the incoming exchange operations of **AIESEC in Rabat, Morocco** across its three core exchange products:
- **iGV (Global Volunteer)**: Community impact, NGO partnerships, SDG 13 alignment, volunteer stipends, and physical hosting.
- **iGTa (Global Talent)**: Corporate business development, tech talent acquisition (medium/long tiers), living cost stipends, and B2B contracts.
- **iGTe (Global Teacher)**: Teaching fellow placements at accredited educational institutions with professional salary tiers.

### Technical Architecture
- **Backend**: Python 3.14 + FastAPI Modular Monolith with SQLAlchemy 2.0 ORM and Pydantic V2 schemas.
- **Frontend**: SvelteKit 2 + Svelte 5 Runes (`$state`, `$derived`, `$props`) + TypeScript + Tailwind CSS (Strictly Zero React).
- **Primary Data Store**: PostgreSQL 16 with `pgvector` extension for embeddings and full ACID relational persistence.
- **Cache & Queue**: Redis 7 Alpine for fast key-value caching and operational counters.
- **Durable Workflows**: Temporal Workflow Engine with idempotent activity logs and durable SLA timers.
- **AI Copilots & Governance**: LangGraph multi-agent architecture with grounded policy RAG and mandatory Human Approval Center for consequential mutations.

---

## 2. Environment Variables Reference

| Variable | Scope | Default Value | Description |
|----------|-------|---------------|-------------|
| `DATABASE_URL` | Backend | `postgresql://icx_user:...@localhost:5432/icx_command_center` | PostgreSQL connection string |
| `REDIS_URL` | Backend | `redis://localhost:6379/0` | Redis instance connection URI |
| `TEMPORAL_HOST` | Backend | `localhost:7233` | Temporal server gRPC address |
| `SECRET_KEY` | Backend | (Required in production) | HMAC-SHA256 JWT signing secret |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Backend | `720` | JWT access token lifespan (12 hours) |
| `ENVIRONMENT` | Backend | `production` | Execution environment (`development`, `test`, `production`) |
| `PUBLIC_API_URL` | Frontend | `http://localhost:8000/api/v1` | Public API endpoint for frontend client |
| `PORT` | Frontend | `3000` | SvelteKit HTTP server listening port |

---

## 3. Quickstart & Local Development

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 16+ (or Docker)

### Backend Setup
```bash
# 1. Navigate to backend directory
cd services/api

# 2. Set PYTHONPATH
$env:PYTHONPATH="."  # PowerShell
export PYTHONPATH="." # Unix / macOS

# 3. Run database migrations or synthetic seeder
python -m app.seed

# 4. Launch FastAPI development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup
```bash
# 1. Navigate to frontend directory
cd apps/web

# 2. Install dependencies
npm install

# 3. Launch Vite dev server
npm run dev
# Accessible at http://localhost:5173
```

---

## 4. Production Deployment with Docker Compose

To deploy the complete multi-service stack in isolated production containers:

```bash
# 1. Ensure docker-compose.yml is configured with production secrets
# 2. Build and launch all services in detached mode
docker compose up -d --build

# 3. Verify service health
docker compose ps

# 4. View real-time logs
docker compose logs -f api web
```

### Deployed Services & Ports
- **Frontend App**: `http://localhost:3000`
- **Backend API Docs**: `http://localhost:8000/docs`
- **Temporal UI Console**: `http://localhost:8088`
- **PostgreSQL Database**: `localhost:5432`
- **Redis Cache**: `localhost:6379`

---

## 5. Synthetic Demo Seeding

To populate the system with realistic operational records across all 18 modules (partners, B2B contracts, opportunities, candidates, applications, exchanges, 18 standards, pricing, risk register, AI knowledge base, and EXPA staging records):

```bash
docker compose exec api python -m app.seed
```

### Pre-configured Demo Accounts
- **LCP / Executive Admin**: `admin@aiesec.org.ma` / `AdminSecret123`
- **LCVP iCX**: `lcvp.icx@aiesec.org.ma` / `IcxLeader2026!`
- **LCVP Finance & Legalities**: `lcvp.fnl@aiesec.org.ma` / `FinanceSafe2026!`
- **Team Leader iGV**: `tl.igv@aiesec.org.ma` / `VolunteerLead2026!`
- **BD Member**: `bd.member@aiesec.org.ma` / `PartnerBiz2026!`
- **Operations Member**: `cx.member@aiesec.org.ma` / `Delivery2026!`

---

## 6. Security, Authorization & AI Governance

### Role-Based Access Control (RBAC)
The system enforces 8 distinct operational roles:
1. `LCP_ADMIN`: Full governance, user role assignment, mutation authorization, and system administration.
2. `LCVP_ICX`: Overall iCX portfolio ownership, contract approval, match sign-off, and completion verification.
3. `LCVP_FNL`: Finance & legalities oversight, fee waiver reviews, refund execution, and IAC audit checklists.
4. `TEAM_LEADER`: Operational sub-team leadership (iGV, iGTa, iGTe), SLA escalation monitoring.
5. `BD_MEMBER`: PRM lead outreach, BANT qualification, partner meeting logs, and draft contracts.
6. `IR_MEMBER`: International relations, sending entity partnerships, and visa feasibility tracking.
7. `EP_MANAGER`: Candidate directory screening, interview coordination, and acceptance note collection.
8. `CX_MEMBER`: Exchange operations, airport pickups (CMN/RBA), accommodation bed management, and 18 standards verification.

### AI Multi-Agent Governance
AI Copilots operate under strict, audited boundaries:
- **Permitted**: Policy retrieval from Grounded Compendium RAG, applicant skill matching, interview feedback summarization, risk identification.
- **Strictly Prohibited**: Agents **cannot** mutate exchange statuses, approve matches, waive financial fees, or dispatch external communications directly.
- **Human Approval Center**: Any consequential action drafted by an agent generates an `ApprovalProposal` in status `PENDING_HUMAN_REVIEW` requiring explicit cryptographic sign-off by an authorized human officer.

---

## 7. EXPA Reconciliation & Outbound Gated Mutations

### Dual-Status Architecture
Official EXPA exchange status (`APP`, `ACC`, `APD`, `RE`, `FI`, `CO`) is decoupled from local operational readiness (`DRAFT`, `READY`, `AT_RISK`, `BLOCKED`, `DONE`).

### Discrepancy Matrix
External webhooks and polling cycles stage incoming EXPA payloads without blindly overwriting local operational readiness. Operators review mismatches in the `/expa` Reconciliation Console:
- **EXPA Accepted**: Accepts the external status update while maintaining local operational checklists.
- **Local Kept**: Preserves local data when local operational evidence is superior.

### Gated Outbound Mutations
Mutations targeted at EXPA (e.g. marking an EP approved or matched externally) are staged in `expa_gated_mutations` in status `PENDING_HUMAN_APPROVAL`. Only an `LCVP_ICX` or `LCP_ADMIN` can authorize outbound dispatch.

---

## 8. Backup, Recovery & Maintenance

### Database Backup
```bash
docker compose exec postgres pg_dump -U icx_user icx_command_center > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Database Restore
```bash
docker compose exec -T postgres psql -U icx_user icx_command_center < backup_20261114_230000.sql
```
