from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal


class FunnelStageCount(BaseModel):
    stage_code: str
    stage_name: str
    count: int
    conversion_rate_percentage: float
    avg_hours_in_stage: Optional[float] = None


class FunnelReport(BaseModel):
    stages: List[FunnelStageCount]
    total_applications: int
    small_sample_warning: bool
    warning_message: Optional[str] = None


class SLAComplianceItem(BaseModel):
    metric_name: str
    target_hours: int
    total_evaluated: int
    within_sla_count: int
    compliance_rate_percentage: float


class SLAComplianceReport(BaseModel):
    items: List[SLAComplianceItem]
    overall_compliance_percentage: float


class FinancialSummary(BaseModel):
    total_expected: Decimal
    total_collected: Decimal
    total_overdue: Decimal
    total_waived: Decimal
    currency: str


class DashboardOverviewResponse(BaseModel):
    funnel: FunnelReport
    sla: SLAComplianceReport
    finance: FinancialSummary
    active_exchanges_count: int
    pending_approvals_count: int
    active_leads_count: int
