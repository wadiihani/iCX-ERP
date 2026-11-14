from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from decimal import Decimal
from datetime import datetime, timezone, date
import uuid

from app.modules.finance.models import (
    PricingRuleSet,
    PricingCalculation,
    PaymentObligation,
    Payment,
    FinancialCase
)
from app.modules.finance.schemas import (
    PricingRuleSetCreate,
    PricingCalculationRequest,
    PaymentObligationCreate,
    PaymentCreate,
    FinancialCaseCreate,
    FinancialCaseReview
)


def get_rule_sets(db: Session, product_type: str = None):
    q = db.query(PricingRuleSet).filter(PricingRuleSet.is_active == True)
    if product_type:
        q = q.filter(PricingRuleSet.product_type == product_type)
    return q.all()


def create_rule_set(db: Session, payload: PricingRuleSetCreate) -> PricingRuleSet:
    rule_set = PricingRuleSet(
        id=str(uuid.uuid4()),
        rule_name=payload.rule_name,
        product_type=payload.product_type,
        version=payload.version,
        currency=payload.currency,
        base_fee=payload.base_fee,
        min_duration_weeks=payload.min_duration_weeks,
        max_duration_weeks=payload.max_duration_weeks,
        weekly_additional_rate=payload.weekly_additional_rate,
        administrative_fee=payload.administrative_fee,
        discount_tier_percentage=payload.discount_tier_percentage
    )
    db.add(rule_set)
    db.commit()
    db.refresh(rule_set)
    return rule_set


def calculate_pricing(db: Session, req: PricingCalculationRequest, user_id: str = None) -> PricingCalculation:
    rule = db.query(PricingRuleSet).filter(PricingRuleSet.id == req.rule_set_id).first()
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pricing rule set '{req.rule_set_id}' not found"
        )

    if req.duration_weeks < rule.min_duration_weeks or req.duration_weeks > rule.max_duration_weeks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Duration {req.duration_weeks} weeks is outside allowed range for {rule.product_type} ({rule.min_duration_weeks}-{rule.max_duration_weeks} weeks)"
        )

    # Deterministic pricing formula
    trainees = Decimal(str(req.num_trainees))
    base_subtotal = Decimal(str(rule.base_fee)) * trainees

    additional_weeks = max(0, req.duration_weeks - rule.min_duration_weeks)
    additional_duration_cost = Decimal(str(additional_weeks)) * Decimal(str(rule.weekly_additional_rate)) * trainees

    admin_fee = Decimal(str(rule.administrative_fee)) * trainees

    discount_applied = Decimal("0.00")
    if req.duration_weeks >= 12 and Decimal(str(rule.discount_tier_percentage)) > 0:
        subtotal_for_disc = base_subtotal + additional_duration_cost
        discount_applied = subtotal_for_disc * (Decimal(str(rule.discount_tier_percentage)) / Decimal("100.00"))

    total_fee = base_subtotal + additional_duration_cost + admin_fee - discount_applied

    calc = PricingCalculation(
        id=str(uuid.uuid4()),
        rule_set_id=rule.id,
        opportunity_id=req.opportunity_id,
        calculated_by=user_id,
        product_type=rule.product_type,
        duration_weeks=req.duration_weeks,
        modality=req.modality,
        num_trainees=req.num_trainees,
        base_subtotal=base_subtotal,
        additional_duration_cost=additional_duration_cost,
        administrative_fee=admin_fee,
        discount_applied=discount_applied,
        total_calculated_fee=total_fee,
        currency=rule.currency,
        notes=req.notes
    )
    db.add(calc)
    db.commit()
    db.refresh(calc)
    return calc


def create_payment_obligation(db: Session, payload: PaymentObligationCreate) -> PaymentObligation:
    obligation = PaymentObligation(
        id=str(uuid.uuid4()),
        contract_id=payload.contract_id,
        opportunity_id=payload.opportunity_id,
        exchange_id=payload.exchange_id,
        obligation_title=payload.obligation_title,
        milestone_trigger=payload.milestone_trigger,
        expected_amount=payload.expected_amount,
        currency=payload.currency,
        due_date=payload.due_date,
        status="PENDING",
        notes=payload.notes
    )
    db.add(obligation)
    db.commit()
    db.refresh(obligation)
    return obligation


def get_payment_obligations(db: Session, contract_id: str = None, exchange_id: str = None):
    q = db.query(PaymentObligation)
    if contract_id:
        q = q.filter(PaymentObligation.contract_id == contract_id)
    if exchange_id:
        q = q.filter(PaymentObligation.exchange_id == exchange_id)
    return q.order_by(PaymentObligation.due_date.asc()).all()


def record_payment(db: Session, payload: PaymentCreate, user_id: str = None) -> Payment:
    obligation = db.query(PaymentObligation).filter(PaymentObligation.id == payload.obligation_id).first()
    if not obligation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payment obligation '{payload.obligation_id}' not found"
        )

    payment = Payment(
        id=str(uuid.uuid4()),
        obligation_id=obligation.id,
        amount_paid=payload.amount_paid,
        currency=payload.currency,
        payment_method=payload.payment_method,
        transaction_reference=payload.transaction_reference,
        receipt_doc_url=payload.receipt_doc_url,
        paid_at=datetime.now(timezone.utc),
        recorded_by=user_id,
        notes=payload.notes
    )
    db.add(payment)

    # Update obligation paid amount and status
    new_paid = Decimal(str(obligation.paid_amount)) + Decimal(str(payload.amount_paid))
    obligation.paid_amount = new_paid
    if new_paid >= Decimal(str(obligation.expected_amount)):
        obligation.status = "PAID"
    elif new_paid > Decimal("0.00"):
        obligation.status = "PARTIALLY_PAID"

    obligation.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(payment)
    return payment


def create_financial_case(db: Session, payload: FinancialCaseCreate, user_id: str) -> FinancialCase:
    fin_case = FinancialCase(
        id=str(uuid.uuid4()),
        case_type=payload.case_type,
        obligation_id=payload.obligation_id,
        contract_id=payload.contract_id,
        exchange_id=payload.exchange_id,
        requested_amount=payload.requested_amount,
        currency=payload.currency,
        reason=payload.reason,
        requested_by=user_id,
        status="PENDING_APPROVAL"
    )
    db.add(fin_case)
    db.commit()
    db.refresh(fin_case)
    return fin_case


def review_financial_case(db: Session, case_id: str, review: FinancialCaseReview, user_id: str) -> FinancialCase:
    fin_case = db.query(FinancialCase).filter(FinancialCase.id == case_id).first()
    if not fin_case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Financial case '{case_id}' not found"
        )

    if fin_case.status != "PENDING_APPROVAL":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Financial case is already {fin_case.status}"
        )

    fin_case.status = review.status
    fin_case.reviewed_by = user_id
    fin_case.reviewed_at = datetime.now(timezone.utc)
    fin_case.review_notes = review.review_notes

    # If approved, apply actions to related obligation
    if review.status == "APPROVED" and fin_case.obligation_id:
        obligation = db.query(PaymentObligation).filter(PaymentObligation.id == fin_case.obligation_id).first()
        if obligation:
            if fin_case.case_type == "FEE_WAIVER":
                obligation.status = "WAIVED"
            elif fin_case.case_type == "DISCOUNT_REQUEST":
                new_expected = max(Decimal("0.00"), Decimal(str(obligation.expected_amount)) - Decimal(str(fin_case.requested_amount)))
                obligation.expected_amount = new_expected
                if Decimal(str(obligation.paid_amount)) >= new_expected:
                    obligation.status = "PAID"
            obligation.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(fin_case)
    return fin_case


def get_financial_cases(db: Session, status_filter: str = None):
    q = db.query(FinancialCase)
    if status_filter:
        q = q.filter(FinancialCase.status == status_filter)
    return q.order_by(FinancialCase.created_at.desc()).all()
