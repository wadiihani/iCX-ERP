from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal


class PricingRuleSetCreate(BaseModel):
    rule_name: str
    product_type: str = Field(..., pattern="^(iGV|iGTa|iGTe)$")
    version: int = 1
    currency: str = "MAD"
    base_fee: Decimal
    min_duration_weeks: int = 6
    max_duration_weeks: int = 78
    weekly_additional_rate: Decimal = Decimal("0.00")
    administrative_fee: Decimal = Decimal("0.00")
    discount_tier_percentage: Decimal = Decimal("0.00")


class PricingRuleSetResponse(PricingRuleSetCreate):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PricingCalculationRequest(BaseModel):
    rule_set_id: str
    opportunity_id: Optional[str] = None
    duration_weeks: int = Field(..., ge=1, le=78)
    modality: str = Field("PHYSICAL", pattern="^(PHYSICAL|PARTLY_REMOTE|FULLY_REMOTE)$")
    num_trainees: int = Field(1, ge=1)
    notes: Optional[str] = None


class PricingCalculationResponse(BaseModel):
    id: str
    rule_set_id: str
    product_type: str
    duration_weeks: int
    modality: str
    num_trainees: int
    base_subtotal: Decimal
    additional_duration_cost: Decimal
    administrative_fee: Decimal
    discount_applied: Decimal
    total_calculated_fee: Decimal
    currency: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PaymentObligationCreate(BaseModel):
    contract_id: Optional[str] = None
    opportunity_id: Optional[str] = None
    exchange_id: Optional[str] = None
    obligation_title: str
    milestone_trigger: str
    expected_amount: Decimal
    currency: str = "MAD"
    due_date: date
    notes: Optional[str] = None


class PaymentObligationResponse(BaseModel):
    id: str
    contract_id: Optional[str] = None
    opportunity_id: Optional[str] = None
    exchange_id: Optional[str] = None
    obligation_title: str
    milestone_trigger: str
    expected_amount: Decimal
    paid_amount: Decimal
    currency: str
    due_date: date
    status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaymentCreate(BaseModel):
    obligation_id: str
    amount_paid: Decimal = Field(..., gt=0)
    currency: str = "MAD"
    payment_method: str = "BANK_TRANSFER"
    transaction_reference: str
    receipt_doc_url: Optional[str] = None
    notes: Optional[str] = None


class PaymentResponse(BaseModel):
    id: str
    obligation_id: str
    amount_paid: Decimal
    currency: str
    payment_method: str
    transaction_reference: str
    receipt_doc_url: Optional[str] = None
    paid_at: datetime
    recorded_by: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class FinancialCaseCreate(BaseModel):
    case_type: str = Field(..., pattern="^(FEE_WAIVER|DISCOUNT_REQUEST|REFUND|ANNEX_2_PENALTY)$")
    obligation_id: Optional[str] = None
    contract_id: Optional[str] = None
    exchange_id: Optional[str] = None
    requested_amount: Decimal = Field(..., ge=0)
    currency: str = "MAD"
    reason: str


class FinancialCaseResponse(BaseModel):
    id: str
    case_type: str
    obligation_id: Optional[str] = None
    contract_id: Optional[str] = None
    exchange_id: Optional[str] = None
    requested_amount: Decimal
    currency: str
    reason: str
    requested_by: str
    status: str
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    review_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class FinancialCaseReview(BaseModel):
    status: str = Field(..., pattern="^(APPROVED|REJECTED)$")
    review_notes: Optional[str] = None
