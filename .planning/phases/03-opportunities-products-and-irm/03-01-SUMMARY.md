# Plan Summary: 03-01 - Opportunity and Slot Schema & Core CRUD

## Execution Results
- **Schema Migration**: Created `database/migrations/003_opportunities_and_irm_schema.sql` defining:
  - `opportunities` (with codes, title, product_type, modality, duration, hours, capacity, line manager).
  - `opportunity_igv_details` (SDG 1-17, global project name, logistics, fees).
  - `opportunity_igt_details` (work field, duration tier, salary, currency, housing, ICB audit).
  - `opportunity_slots` (slot numbers `OPP-XXX-SLOT-N`, start/end dates, status, lock_version for concurrency).
- **Domain Models & Schemas**: Implemented in `services/api/app/modules/opportunities/models.py` and `schemas.py`.
- **Contract Linkage Rule**: Enforced in `service.py`: an opportunity cannot be created against a draft, expired, or prohibited contract; must link to an active signed partner contract.
- **Capacity Slot Generator**: Automatically provisions N discrete capacity slots upon opportunity creation with unique sequential identifiers.
- **REST Endpoints**: CRUD endpoints registered under `/api/v1/opportunities`.
- **Automated Tests**: Verified with `services/api/tests/test_opportunities.py` (4/4 tests passing).
