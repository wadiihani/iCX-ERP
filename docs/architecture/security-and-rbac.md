# Security, Authentication & Role-Based Access Control (RBAC)

## 1. Authentication Architecture

The system uses stateless JWT sessions backed by secure HTTP-only cookies, combined with CSRF token verification:
- Access tokens expire in 15 minutes; refresh tokens persist for 7 days.
- In-memory/Redis revocation blocklist for immediate session revocation upon logout.
- Password hashing with Argon2id / bcrypt.

## 2. Role Taxonomy & Responsibility Matrix

The system maps operational responsibilities to 8 explicit roles:

| Role Code | Role Name | Primary Responsibilities | Data Access Scope |
|---|---|---|---|
| `BD_MEMBER` | BD / B2B Member | Lead generation, partner outreach, meeting logs, contract drafts. | Assigned organizations, leads, and contracts. |
| `IR_MEMBER` | IR Member | Sending Entity outreach, IR meetings, opportunity promotion. | International LCs, IR partnerships, promotional material. |
| `EP_MANAGER` | EP Manager | Candidate attraction, screening, interview scheduling, matching. | Assigned EPs, applications, candidate documents. Masked PII. |
| `CX_MEMBER` | Operations / CX Member | Arrival logistics, accommodation board, exchange delivery, standards. | Assigned exchanges, standards evidence, arrival records. |
| `TEAM_LEADER` | Team Leader | Pod supervision, assignment distribution, review approval. | Team-wide operational records, performance metrics. |
| `LCVP_ICX` | LCVP iCX | Portfolio governance, opportunity approval, break cases, EXPA requests. | Full operational visibility across iGV, iGTa, and iGTe. |
| `LCVP_FNL` | LCVP FnL | Pricing configuration, payment validation, refunds, IAC compliance. | Financial obligations, pricing calculators, legal repository. |
| `LCP_ADMIN` | LCP / Executive Admin | System administration, role assignment, policy configuration, audit inspection. | Full global access across all tenants and audit logs. |

## 3. Atomic Permission Matrix

Every endpoint and tool call checks granular atomic permissions:

```text
partner:read:assigned / partner:read:all / partner:write / partner:delete
contract:read / contract:draft / contract:approve
opportunity:read / opportunity:create / opportunity:validate / opportunity:publish
ep:read:assigned / ep:read:all / ep:document:read / ep:pii:view / ep:export
application:read / application:screen / application:interview / application:match
exchange:read / exchange:standards:verify / exchange:complete:propose
finance:pricing:read / finance:pricing:edit / finance:payment:approve
approval:request / approval:decide
ai:execute:read_tool / ai:execute:write_tool
audit:read
```

## 4. Sensitive Data Protection & PII Masking

- **Passports & Dates of Birth**: Masked by default (`XX-XXXX-1234`). Only users with `ep:pii:view` or during active visa preparation can unmask with logged access.
- **Document Storage**: Stored in private S3/MinIO buckets; served via short-lived (15-minute) presigned URLs generated on demand.
- **Audit Logging**: An immutable, append-only table records every read of sensitive data and every state mutation.
