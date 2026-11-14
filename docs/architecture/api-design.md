# API Design & REST Conventions

## 1. Routing Principles

All REST endpoints are prefixed under `/api/v1` and return typed JSON envelopes:
- Standard response format:
```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "limit": 25,
    "total": 100
  }
}
```
- Error format:
```json
{
  "success": false,
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "User does not have access to unmasked EP PII",
    "details": []
  }
}
```

## 2. Route Families

- `/api/v1/auth`: Login, logout, refresh, current user profile.
- `/api/v1/users`: User management, team assignments, role management.
- `/api/v1/organizations`: Local B2B organizations, contacts, accounts.
- `/api/v1/leads`: Partner lead pipeline and BANT qualification.
- `/api/v1/contracts`: Partner contracts, versioning, document linking.
- `/api/v1/ir`: Sending Entity countries, LCs, partnerships, and visa feasibility.
- `/api/v1/opportunities`: Opportunity catalog, iGV/iGTa/iGTe validation, slot capacity.
- `/api/v1/eps`: EP directory, document links, masked/unmasked profile views.
- `/api/v1/applications`: Application screening, interview records, matching.
- `/api/v1/exchanges`: Exchange milestones, checklists, and arrival logistics.
- `/api/v1/standards`: 18 Exchange Standards and 10 Partner Standards tracking.
- `/api/v1/finance`: Pricing calculations, payment obligations, receipts.
- `/api/v1/tasks`: Operational tasks, SLA timers, team assignments.
- `/api/v1/analytics`: KPI dashboards, funnel conversion, SLA metrics.
- `/api/v1/ai`: Copilot interaction, agent run history, tool calls.
- `/api/v1/approvals`: Approval request queue, decision recording.
- `/api/v1/integrations`: EXPA sync runs, CSV/XLSX imports, reconciliation.
