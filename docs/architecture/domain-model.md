# Domain Model & Entity Relationships

## 1. Domain Entities & Bounded Contexts

The system is partitioned into explicit bounded domains with strict foreign-key integrity and separation of concerns:

### 1.1 Identity & Access Control
- `User`: Internal AIESEC members and system actors.
- `Role`: System roles (`BD_MEMBER`, `IR_MEMBER`, `EP_MANAGER`, `CX_MEMBER`, `TEAM_LEADER`, `LCVP_ICX`, `LCVP_FNL`, `LCP_ADMIN`).
- `Permission`: Atomic operational permissions (e.g. `ep.document.read`, `contract.approve`, `finance.payment.approve`).
- `Team`: Operational pods within the LC.
- `AuditLog`: Immutable, append-only log of every mutation.

### 1.2 Local Supply & PRM (Partner Relationship Management)
- `Organization`: Local company, NGO, school, or institution offering hosting capacity.
- `OrganizationContact`: Individuals associated with the hosting organization.
- `PartnerLead`: Sales pipeline tracking (`Suspect` to `Contract Signed`).
- `QualificationAssessment`: BANT qualification framework records.
- `Contract`: Legal hosting agreement authorizing opportunities, with version history.

### 1.3 Opportunities & Products
- `Opportunity`: Host-provided exchange project.
- `OpportunityIgvDetail`: SDG alignment, Global Project parameters, unpaid volunteer rules.
- `OpportunityIgtDetail`: Work fields (BA, BD, MKT, IT, ENG, FIN), duration tiers, compensation rules.
- `OpportunitySlot`: Discrete openings with start/end date windows and concurrency-safe capacity locks.

### 1.4 Global Demand, IRM & CRM
- `Country`: International MC/Country metadata.
- `LocalCommittee`: Foreign Sending Entity LCs.
- `IrPartnership`: Relationship history, SnD clusters (Upscale, Grow, Invest, Understand), and weekly meeting notes.
- `VisaFeasibility`: Dated visa research and advisory notes.
- `ExchangeParticipant`: EP demographic details, language skills, masked PII, home LC link.
- `EpDocument`: CVs, passport copies, police/medical records stored in private object storage.

### 1.5 Applications & Matching
- `EpApplication`: Link between an EP and a specific Opportunity Slot.
- `ApplicationScreening`: Eligibility verification, prescreening Q&A, and resume score.
- `ApplicationInterview`: OP interview schedule, interviewer notes, and candidate recommendation.
- `Match`: Approved connection between EP and Slot; holds Acceptance Note and SE payment proof.

### 1.6 Exchange Operations & CXP
- `Exchange`: Active lifecycle tracking post-approval.
- `ArrivalRecord`: Flight number, pickup driver assignment, arrival confirmation.
- `Accommodation`: Bed/room allocation in host family or apartment.
- `ExchangeStandard`: 18 standards tracking with 13 mandatory gates.
- `StandardEvidence`: Sourced proof files, timestamps, and verification audit.
- `PartnerStandard`: 10 partner delivery standards.
- `ExchangeCase`: Incident, break, early finish, or complaint investigation.

### 1.7 Operational Finance & Legalities
- `PricingRuleSet`: Versioned pricing matrices and discount formulas.
- `PaymentObligation`: Payment milestones, invoices, receipts, and outstanding amounts.
- `ApprovalRequest`: Human-in-the-loop gate for financial waivers, status changes, and communications.
- `IacAuditItem`: Internal Audit Committee compliance artifacts and legal documents.
