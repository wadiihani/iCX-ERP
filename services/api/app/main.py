from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.modules.identity.models import User, Role, Permission, UserRoleAssignment, AuditLog
from app.modules.organizations.models import Organization, OrganizationContact
from app.modules.prm.models import PRMLead, PRMActivity
from app.modules.contracts.models import Contract, OperationalRisk
from app.modules.opportunities.models import (
    Opportunity,
    OpportunityIGVDetails,
    OpportunityIGTDetails,
    OpportunitySlot,
)
from app.modules.irm.models import (
    SendingEntity,
    VisaFeasibilityAssessment,
    IRMPartnership,
)
from app.modules.crm.models import ExchangeParticipant, EPDocument
from app.modules.applications.models import (
    Application,
    ApplicationScreening,
    OPInterview,
    AcceptanceNote,
    SEPaymentProof,
)
from app.modules.exchanges.models import (
    Exchange,
    ExchangeChecklist,
    ExchangeIncident,
)
from app.modules.logistics.models import (
    ArrivalLogistics,
    AccommodationUnit,
    ExchangeAccommodation,
)
from app.modules.cxp.models import (
    ExchangeStandardsFulfillment,
    PartnerStandardsEvaluation,
    ExchangeCompletion,
)
from app.modules.finance.models import (
    PricingRuleSet,
    PricingCalculation,
    PaymentObligation,
    Payment,
    FinancialCase,
)
from app.modules.legalities.models import (
    RiskRegisterEntry,
    IACAuditItem,
    LegalDocument,
)
from app.modules.ai.models import (
    AIAgentRun,
    AIAgentToolCall,
    KnowledgeDocument,
    KnowledgeChunk,
)
from app.modules.approvals.models import ApprovalProposal
from app.modules.identity.router import router as identity_router
from app.modules.organizations.router import router as organizations_router
from app.modules.prm.router import router as prm_router
from app.modules.contracts.router import router as contracts_router
from app.modules.opportunities.router import router as opportunities_router
from app.modules.irm.router import router as irm_router
from app.modules.crm.router import router as crm_router
from app.modules.applications.router import router as applications_router
from app.modules.exchanges.router import router as exchanges_router
from app.modules.logistics.router import router as logistics_router
from app.modules.cxp.router import router as cxp_router
from app.modules.finance.router import router as finance_router
from app.modules.legalities.router import router as legalities_router
from app.modules.analytics.router import router as analytics_router
from app.modules.ai.router import router as ai_router
from app.modules.approvals.router import router as approvals_router

# Ensure tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Operational ERP and Command Center API for AIESEC in Rabat",
    docs_url=f"{settings.API_V1_STR}/docs",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.get(f"{settings.API_V1_STR}/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }


# Register Identity and Authentication Router
app.include_router(identity_router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication & Identity"])
app.include_router(organizations_router, prefix=f"{settings.API_V1_STR}", tags=["Organizations & PRM"])
app.include_router(prm_router, prefix=f"{settings.API_V1_STR}", tags=["PRM & Partner Leads"])
app.include_router(contracts_router, prefix=f"{settings.API_V1_STR}", tags=["Contracts & Legal Compliance"])
app.include_router(opportunities_router, prefix=f"{settings.API_V1_STR}", tags=["Opportunities & Products"])
app.include_router(irm_router, prefix=f"{settings.API_V1_STR}", tags=["International Relations Management (IRM)"])
app.include_router(crm_router, prefix=f"{settings.API_V1_STR}", tags=["CRM & EP Directory"])
app.include_router(applications_router, prefix=f"{settings.API_V1_STR}", tags=["Applications & Screening Pipeline"])
app.include_router(exchanges_router, prefix=f"{settings.API_V1_STR}", tags=["Exchange Operations"])
app.include_router(logistics_router, prefix=f"{settings.API_V1_STR}", tags=["Arrivals & Accommodation Logistics"])
app.include_router(cxp_router, prefix=f"{settings.API_V1_STR}", tags=["Customer Experience & Standards (18)"])
app.include_router(finance_router, prefix=f"{settings.API_V1_STR}", tags=["Operational Finance & Pricing"])
app.include_router(legalities_router, prefix=f"{settings.API_V1_STR}", tags=["Legalities & Compliance"])
app.include_router(analytics_router, prefix=f"{settings.API_V1_STR}", tags=["Command Center Analytics"])
app.include_router(ai_router, prefix=f"{settings.API_V1_STR}", tags=["AI Copilots & Governance"])
app.include_router(approvals_router, prefix=f"{settings.API_V1_STR}", tags=["Human Approval Center"])
