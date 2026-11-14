from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.modules.identity.models import User, Role, Permission, UserRoleAssignment, AuditLog
from app.modules.organizations.models import Organization, OrganizationContact
from app.modules.prm.models import PRMLead, PRMActivity
from app.modules.contracts.models import Contract, OperationalRisk
from app.modules.identity.router import router as identity_router
from app.modules.organizations.router import router as organizations_router
from app.modules.prm.router import router as prm_router
from app.modules.contracts.router import router as contracts_router

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
