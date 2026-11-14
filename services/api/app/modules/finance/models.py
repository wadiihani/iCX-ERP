from sqlalchemy import Column, String, Integer, Numeric, Boolean, DateTime, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from app.core.database import Base


class PricingRuleSet(Base):
    __tablename__ = "pricing_rule_sets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    rule_name = Column(String(100), nullable=False)
    product_type = Column(String(10), nullable=False)  # 'iGV', 'iGTa', 'iGTe'
    version = Column(Integer, nullable=False, default=1)
    is_active = Column(Boolean, nullable=False, default=True)
    currency = Column(String(5), nullable=False, default="MAD")
    base_fee = Column(Numeric(10, 2), nullable=False, default=0.00)
    min_duration_weeks = Column(Integer, nullable=False, default=6)
    max_duration_weeks = Column(Integer, nullable=False, default=78)
    weekly_additional_rate = Column(Numeric(10, 2), nullable=False, default=0.00)
    administrative_fee = Column(Numeric(10, 2), nullable=False, default=0.00)
    discount_tier_percentage = Column(Numeric(5, 2), nullable=False, default=0.00)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))


class PricingCalculation(Base):
    __tablename__ = "pricing_calculations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    rule_set_id = Column(String(36), ForeignKey("pricing_rule_sets.id"), nullable=False)
    opportunity_id = Column(String(36), ForeignKey("opportunities.id"), nullable=True)
    calculated_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    product_type = Column(String(10), nullable=False)
    duration_weeks = Column(Integer, nullable=False)
    modality = Column(String(20), nullable=False)
    num_trainees = Column(Integer, nullable=False, default=1)
    base_subtotal = Column(Numeric(10, 2), nullable=False)
    additional_duration_cost = Column(Numeric(10, 2), nullable=False, default=0.00)
    administrative_fee = Column(Numeric(10, 2), nullable=False, default=0.00)
    discount_applied = Column(Numeric(10, 2), nullable=False, default=0.00)
    total_calculated_fee = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(5), nullable=False, default="MAD")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))


class PaymentObligation(Base):
    __tablename__ = "payment_obligations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    contract_id = Column(String(36), ForeignKey("contracts.id"), nullable=True)
    opportunity_id = Column(String(36), ForeignKey("opportunities.id"), nullable=True)
    exchange_id = Column(String(36), ForeignKey("exchanges.id"), nullable=True)
    obligation_title = Column(String(150), nullable=False)
    milestone_trigger = Column(String(50), nullable=False)
    expected_amount = Column(Numeric(10, 2), nullable=False)
    paid_amount = Column(Numeric(10, 2), nullable=False, default=0.00)
    currency = Column(String(5), nullable=False, default="MAD")
    due_date = Column(Date, nullable=False)
    status = Column(String(20), nullable=False, default="PENDING")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    payments = relationship("Payment", back_populates="obligation", cascade="all, delete-orphan")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    obligation_id = Column(String(36), ForeignKey("payment_obligations.id"), nullable=False)
    amount_paid = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(5), nullable=False, default="MAD")
    payment_method = Column(String(30), nullable=False, default="BANK_TRANSFER")
    transaction_reference = Column(String(100), nullable=False)
    receipt_doc_url = Column(Text, nullable=True)
    paid_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    recorded_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    obligation = relationship("PaymentObligation", back_populates="payments")


class FinancialCase(Base):
    __tablename__ = "financial_cases"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    case_type = Column(String(30), nullable=False)  # 'FEE_WAIVER', 'DISCOUNT_REQUEST', 'REFUND', 'ANNEX_2_PENALTY'
    obligation_id = Column(String(36), ForeignKey("payment_obligations.id"), nullable=True)
    contract_id = Column(String(36), ForeignKey("contracts.id"), nullable=True)
    exchange_id = Column(String(36), ForeignKey("exchanges.id"), nullable=True)
    requested_amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(5), nullable=False, default="MAD")
    reason = Column(Text, nullable=False)
    requested_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    status = Column(String(20), nullable=False, default="PENDING_APPROVAL")
    reviewed_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    review_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
