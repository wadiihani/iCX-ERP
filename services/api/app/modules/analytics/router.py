from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.identity.models import User
from app.modules.identity.permissions import get_current_user
from app.modules.analytics.schemas import (
    FunnelReport,
    SLAComplianceReport,
    FinancialSummary,
    DashboardOverviewResponse
)
from app.modules.analytics import service

router = APIRouter(prefix="/analytics", tags=["Analytics & Reporting"])


@router.get("/overview", response_model=DashboardOverviewResponse)
def get_command_center_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_dashboard_overview(db)


@router.get("/funnel", response_model=FunnelReport)
def get_ep_funnel_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_funnel_report(db)


@router.get("/sla", response_model=SLAComplianceReport)
def get_sla_compliance_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_sla_compliance_report(db)


@router.get("/finance", response_model=FinancialSummary)
def get_financial_summary_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_financial_summary(db)
