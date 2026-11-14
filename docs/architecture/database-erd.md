# Database Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ USER_ROLE_ASSIGNMENTS : has
    ROLES ||--o{ USER_ROLE_ASSIGNMENTS : grants
    USERS ||--o{ TEAMS : leads
    USERS ||--o{ AUDIT_LOGS : performs

    ORGANIZATIONS ||--o{ ORGANIZATION_CONTACTS : contains
    ORGANIZATIONS ||--o{ PARTNER_LEADS : generates
    ORGANIZATIONS ||--o{ CONTRACTS : executes
    CONTRACTS ||--o{ OPPORTUNITIES : authorizes

    OPPORTUNITIES ||--o| OPPORTUNITY_IGV_DETAILS : specializes
    OPPORTUNITIES ||--o| OPPORTUNITY_IGT_DETAILS : specializes
    OPPORTUNITIES ||--o{ OPPORTUNITY_SLOTS : provides

    COUNTRIES ||--o{ LOCAL_COMMITTEES : contains
    LOCAL_COMMITTEES ||--o{ IR_PARTNERSHIPS : establishes
    LOCAL_COMMITTEES ||--o{ EXCHANGE_PARTICIPANTS : sends

    EXCHANGE_PARTICIPANTS ||--o{ EP_DOCUMENTS : owns
    EXCHANGE_PARTICIPANTS ||--o{ EP_APPLICATIONS : submits
    OPPORTUNITY_SLOTS ||--o{ EP_APPLICATIONS : receives

    EP_APPLICATIONS ||--o| APPLICATION_SCREENINGS : evaluates
    EP_APPLICATIONS ||--o| APPLICATION_INTERVIEWS : schedules
    EP_APPLICATIONS ||--o| MATCHES : formalizes

    MATCHES ||--o| EXCHANGES : spawns
    EXCHANGES ||--o{ EXCHANGE_STANDARDS : verifies
    EXCHANGES ||--o| ARRIVAL_RECORDS : coordinates
    EXCHANGES ||--o| ACCOMMODATIONS : allocates
    EXCHANGES ||--o{ EXCHANGE_CASES : investigates

    OPPORTUNITIES ||--o{ PARTNER_STANDARDS : evaluates
    CONTRACTS ||--o{ PAYMENT_OBLIGATIONS : defines
    EXCHANGES ||--o{ PAYMENT_OBLIGATIONS : links

    APPROVAL_REQUESTS ||--o{ APPROVAL_DECISIONS : receives
    APPROVAL_REQUESTS ||--o{ AUDIT_LOGS : triggers
```

## Schema Invariants & Conventions

1. **Primary Keys**: UUID v4 (`id UUID PRIMARY KEY DEFAULT gen_random_uuid()`).
2. **Timestamps**: All tables include `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` and `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`.
3. **Actor Tracking**: Mutable tables include `created_by UUID REFERENCES users(id)` and `updated_by UUID REFERENCES users(id)`.
4. **Soft Deletion**: Applied via `deleted_at TIMESTAMPTZ` where operational auditing requires history retention.
5. **PII Masking**: EP passports, dates of birth, and personal phone numbers stored in restricted columns; access gated by RBAC.
6. **Optimistic Locking**: Critical concurrent tables (`opportunity_slots`, `payment_obligations`) use an integer `version` column for optimistic locking.
