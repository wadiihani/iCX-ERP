from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.modules.identity.models import User
from app.modules.identity.permissions import get_current_user, require_permission, require_role
from app.modules.finance.schemas import (
    PricingRuleSetCreate,
    PricingRuleSetResponse,
    PricingCalculationRequest,
    PricingCalculationResponse,
    PaymentObligationCreate,
    PaymentObligationResponse,
    PaymentCreate,
    PaymentResponse,
    FinancialCaseCreate,
    FinancialCaseResponse,
    FinancialCaseReview
)
from app.modules.finance import service

router = APIRouter(prefix="/finance", tags=["Finance & Pricing"])


@router.get("/rulesets", response_model=List[PricingRuleSetResponse])
def list_pricing_rulesets(
    product_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_rule_sets(db, product_type)


@router.post("/rulesets", response_model=PricingRuleSetResponse, status_code=status.HTTP_201_CREATED)
def create_pricing_ruleset(
    payload: PricingRuleSetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["LCP_ADMIN", "LCVP_ICX", "LCVP_FINANCE", "ADMIN", "LCP"]))
):
    return service.create_rule_set(db, payload)


@router.post("/calculate", response_model=PricingCalculationResponse)
def calculate_opportunity_pricing(
    payload: PricingCalculationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.calculate_pricing(db, payload, user_id=current_user.id)


@router.get("/obligations", response_model=List[PaymentObligationResponse])
def list_payment_obligations(
    contract_id: Optional[str] = None,
    exchange_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_payment_obligations(db, contract_id, exchange_id)


@router.post("/obligations", response_model=PaymentObligationResponse, status_code=status.HTTP_201_CREATED)
def create_payment_obligation(
    payload: PaymentObligationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["LCP_ADMIN", "LCVP_ICX", "LCVP_FINANCE", "ADMIN", "LCP"]))
):
    return service.create_payment_obligation(db, payload)


@router.post("/payments", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def record_incoming_payment(
    payload: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.record_payment(db, payload, user_id=current_user.id)


@router.get("/cases", response_model=List[FinancialCaseResponse])
def list_financial_cases(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_financial_cases(db, status)


@router.post("/cases", response_model=FinancialCaseResponse, status_code=status.HTTP_201_CREATED)
def submit_financial_case(
    payload: FinancialCaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.create_financial_case(db, payload, user_id=current_user.id)


@router.put("/cases/{case_id}/review", response_model=FinancialCaseResponse)
def review_financial_approval(
    case_id: str,
    payload: FinancialCaseReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["LCP_ADMIN", "LCVP_ICX", "LCVP_FINANCE", "ADMIN", "LCP"]))
):
    return service.review_financial_case(db, case_id, payload, user_id=current_user.id)
