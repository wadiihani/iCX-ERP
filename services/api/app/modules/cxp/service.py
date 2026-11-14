from datetime import datetime, timezone, date
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.modules.cxp.models import (
    ExchangeStandardsFulfillment,
    PartnerStandardsEvaluation,
    ExchangeCompletion,
)
from app.modules.cxp.schemas import (
    StandardFulfillmentUpdate,
    CompletionEvaluationReport,
)
from app.modules.exchanges.models import Exchange


AIESEC_18_STANDARDS: List[Tuple[int, str, bool]] = [
    (1, "Personal Goal Setting", True),
    (2, "Outgoing Preparation", True),
    (3, "Expectation Setting", True),
    (4, "Visa and Work Permit", True),
    (5, "Arrival Pickup", True),
    (6, "Departure Support", False),
    (7, "Job Description", True),
    (8, "Working Hours", True),
    (9, "Duration", True),
    (10, "Opportunity Provider / Line Manager", True),
    (11, "Basic Living Conditions", True),
    (12, "Compensation / Salary", True),
    (13, "Health Insurance", True),
    (14, "First Day of Work", True),
    (15, "Alignment Space with OP", False),
    (16, "Leadership Development (LDA)", False),
    (17, "Incoming Preparation Seminar (IPS)", False),
    (18, "Debrief with AIESEC", False),
]


class CXPService:
    @staticmethod
    def ensure_standards_initialized(db: Session, exchange_id: str) -> List[ExchangeStandardsFulfillment]:
        existing = (
            db.query(ExchangeStandardsFulfillment)
            .filter(ExchangeStandardsFulfillment.exchange_id == exchange_id)
            .all()
        )
        if len(existing) == 18:
            return sorted(existing, key=lambda s: s.standard_number)

        existing_numbers = {s.standard_number for s in existing}
        for num, name, mandatory in AIESEC_18_STANDARDS:
            if num not in existing_numbers:
                item = ExchangeStandardsFulfillment(
                    exchange_id=exchange_id,
                    standard_number=num,
                    standard_name=name,
                    is_mandatory=mandatory,
                    is_fulfilled=False,
                )
                db.add(item)
        db.commit()

        return (
            db.query(ExchangeStandardsFulfillment)
            .filter(ExchangeStandardsFulfillment.exchange_id == exchange_id)
            .order_by(ExchangeStandardsFulfillment.standard_number.asc())
            .all()
        )

    @staticmethod
    def get_standards(db: Session, exchange_id: str) -> List[ExchangeStandardsFulfillment]:
        ex = db.query(Exchange).filter(Exchange.id == exchange_id).first()
        if not ex:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Exchange {exchange_id} not found")
        return CXPService.ensure_standards_initialized(db, exchange_id)

    @staticmethod
    def update_standard(
        db: Session,
        exchange_id: str,
        standard_number: int,
        reviewer_id: Optional[str],
        payload: StandardFulfillmentUpdate,
    ) -> ExchangeStandardsFulfillment:
        CXPService.ensure_standards_initialized(db, exchange_id)
        item = (
            db.query(ExchangeStandardsFulfillment)
            .filter(
                ExchangeStandardsFulfillment.exchange_id == exchange_id,
                ExchangeStandardsFulfillment.standard_number == standard_number,
            )
            .first()
        )
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Standard #{standard_number} not found for exchange {exchange_id}",
            )

        item.is_fulfilled = payload.is_fulfilled
        item.fulfillment_date = payload.fulfillment_date or (date.today() if payload.is_fulfilled else None)
        item.verified_by = reviewer_id if payload.is_fulfilled else None
        if payload.evidence_doc_url:
            item.evidence_doc_url = payload.evidence_doc_url
        if payload.verification_notes:
            item.verification_notes = payload.verification_notes

        db.commit()
        db.refresh(item)
        return item

    @staticmethod
    def evaluate_completion(db: Session, exchange_id: str) -> CompletionEvaluationReport:
        standards = CXPService.ensure_standards_initialized(db, exchange_id)

        total_fulfilled = sum(1 for s in standards if s.is_fulfilled)
        mandatory_fulfilled = sum(1 for s in standards if s.is_mandatory and s.is_fulfilled)

        missing_mandatory = [s.standard_name for s in standards if s.is_mandatory and not s.is_fulfilled]
        missing_optional = [s.standard_name for s in standards if not s.is_mandatory and not s.is_fulfilled]

        # Invariant: 13/13 Mandatory standards + at least 16/18 total standards
        is_eligible = (mandatory_fulfilled == 13) and (total_fulfilled >= 16)

        completion = db.query(ExchangeCompletion).filter(ExchangeCompletion.exchange_id == exchange_id).first()
        status_val = completion.completion_status if completion else "PENDING"

        return CompletionEvaluationReport(
            exchange_id=exchange_id,
            total_standards_fulfilled=total_fulfilled,
            mandatory_standards_fulfilled=mandatory_fulfilled,
            total_mandatory_required=13,
            overall_threshold_required=16,
            is_eligible_for_completion=is_eligible,
            missing_mandatory_standards=missing_mandatory,
            missing_optional_standards=missing_optional,
            completion_status=status_val,
        )

    @staticmethod
    def approve_completion(
        db: Session, exchange_id: str, user_id: Optional[str], notes: Optional[str] = None
    ) -> ExchangeCompletion:
        ex = db.query(Exchange).filter(Exchange.id == exchange_id).first()
        if not ex:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Exchange {exchange_id} not found")

        report = CXPService.evaluate_completion(db, exchange_id)
        if not report.is_eligible_for_completion:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot approve completion: Exchange fails deterministic standards threshold. "
                f"Mandatory fulfilled: {report.mandatory_standards_fulfilled}/13. Total fulfilled: {report.total_standards_fulfilled}/18. "
                f"Missing mandatory gates: {report.missing_mandatory_standards}",
            )

        now = datetime.now(timezone.utc)

        # Update or create completion record
        completion = db.query(ExchangeCompletion).filter(ExchangeCompletion.exchange_id == exchange_id).first()
        if not completion:
            completion = ExchangeCompletion(
                exchange_id=exchange_id,
                total_standards_fulfilled=report.total_standards_fulfilled,
                mandatory_standards_fulfilled=report.mandatory_standards_fulfilled,
                is_eligible_for_completion=True,
                completion_status="APPROVED",
                calculated_at=now,
                approved_by=user_id,
                approved_at=now,
            )
            db.add(completion)
        else:
            completion.total_standards_fulfilled = report.total_standards_fulfilled
            completion.mandatory_standards_fulfilled = report.mandatory_standards_fulfilled
            completion.is_eligible_for_completion = True
            completion.completion_status = "APPROVED"
            completion.approved_by = user_id
            completion.approved_at = now

        # Update Exchange Delivery Status to COMPLETED
        ex.delivery_status = "COMPLETED"
        if notes:
            ex.notes = f"{ex.notes or ''}\nCompletion Note: {notes}".strip()

        # Update linked Application statuses: EXPA -> CO, Local -> DONE
        if ex.application:
            ex.application.official_expa_status = "CO"
            ex.application.operational_readiness = "DONE"

        db.commit()
        db.refresh(completion)
        return completion
