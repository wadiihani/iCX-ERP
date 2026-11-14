from datetime import datetime, date, timezone
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.modules.contracts.models import Contract, OperationalRisk
from app.modules.organizations.models import Organization
from app.modules.prm.models import PRMLead
from app.modules.identity.models import AuditLog
from app.modules.contracts.schemas import (
    ContractCreate,
    ContractUpdate,
    ContractSignRequest,
    ContractResponse,
    OperationalRiskCreate,
    OperationalRiskUpdate,
    OperationalRiskResponse,
)


class ContractService:
    @staticmethod
    def _compute_expiry_metadata(contract: Contract) -> Tuple[int, bool, bool]:
        today = date.today()
        days_to_expiry = (contract.end_date - today).days
        is_expired = days_to_expiry < 0
        is_expiring_soon = 0 <= days_to_expiry <= 30
        return days_to_expiry, is_expiring_soon, is_expired

    @staticmethod
    def to_response(contract: Contract) -> ContractResponse:
        days, soon, expired = ContractService._compute_expiry_metadata(contract)
        resp = ContractResponse.model_validate(contract)
        resp.days_to_expiry = days
        resp.is_expiring_soon = soon
        resp.is_expired = expired
        if contract.organization:
            resp.organization_name = contract.organization.name
        return resp

    @staticmethod
    def get_contracts(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        status_filter: Optional[str] = None,
        organization_id: Optional[str] = None,
    ) -> List[ContractResponse]:
        query = db.query(Contract)
        if status_filter:
            query = query.filter(Contract.status == status_filter)
        if organization_id:
            query = query.filter(Contract.organization_id == organization_id)
        contracts = query.order_by(Contract.created_at.desc()).offset(skip).limit(limit).all()
        return [ContractService.to_response(c) for c in contracts]

    @staticmethod
    def get_contract_by_id(db: Session, contract_id: str) -> Optional[Contract]:
        return db.query(Contract).filter(Contract.id == contract_id).first()

    @staticmethod
    def create_contract(db: Session, data: ContractCreate, user_id: str) -> ContractResponse:
        org = db.query(Organization).filter(Organization.id == data.organization_id).first()
        if not org:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

        # Invariant: Prohibited organizations cannot sign contracts
        if org.is_prohibited:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot create contract for prohibited entity: {org.prohibition_reason}",
            )

        # Invariant: Start date must be before or equal to end date
        if data.start_date > data.end_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Contract start_date must be before or equal to end_date",
            )

        # Unique contract number check
        existing = db.query(Contract).filter(Contract.contract_number == data.contract_number).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Contract number {data.contract_number} already exists",
            )

        contract = Contract(
            contract_number=data.contract_number,
            organization_id=data.organization_id,
            lead_id=data.lead_id,
            title=data.title,
            status="DRAFT",
            version=1,
            product_types=data.product_types,
            start_date=data.start_date,
            end_date=data.end_date,
            total_slots=data.total_slots,
            financial_terms=data.financial_terms,
            special_clauses=data.special_clauses,
            document_url=data.document_url,
            iac_audit_ready=data.iac_audit_ready,
            iac_notes=data.iac_notes,
        )
        db.add(contract)
        db.flush()

        audit = AuditLog(
            actor_id=user_id,
            action="CREATE_CONTRACT",
            entity_type="contract",
            entity_id=contract.id,
            after_state={
                "contract_number": contract.contract_number,
                "organization_id": contract.organization_id,
                "total_slots": contract.total_slots,
            },
        )
        db.add(audit)
        db.commit()
        db.refresh(contract)
        return ContractService.to_response(contract)

    @staticmethod
    def update_contract(db: Session, contract_id: str, data: ContractUpdate, user_id: str) -> ContractResponse:
        contract = ContractService.get_contract_by_id(db, contract_id)
        if not contract:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found")

        update_dict = data.model_dump(exclude_unset=True)

        start = update_dict.get("start_date", contract.start_date)
        end = update_dict.get("end_date", contract.end_date)
        if start > end:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="start_date must be before or equal to end_date")

        for field, value in update_dict.items():
            setattr(contract, field, value)

        audit = AuditLog(
            actor_id=user_id,
            action="UPDATE_CONTRACT",
            entity_type="contract",
            entity_id=contract.id,
            after_state=update_dict,
        )
        db.add(audit)
        db.commit()
        db.refresh(contract)
        return ContractService.to_response(contract)

    @staticmethod
    def sign_contract(db: Session, contract_id: str, data: ContractSignRequest, user_id: str) -> ContractResponse:
        contract = ContractService.get_contract_by_id(db, contract_id)
        if not contract:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found")

        signed_at = data.signed_at or datetime.now(timezone.utc)
        contract.status = "SIGNED"
        contract.signed_at = signed_at
        contract.signed_by_partner = data.signed_by_partner
        contract.signed_by_aiesec_user_id = user_id

        # If linked to a lead, update lead stage to CONTRACT_SIGNED
        if contract.lead_id:
            lead = db.query(PRMLead).filter(PRMLead.id == contract.lead_id).first()
            if lead:
                lead.stage = "CONTRACT_SIGNED"

        # Update organization status to ACTIVE_PARTNER
        if contract.organization:
            contract.organization.status = "ACTIVE_PARTNER"

        audit = AuditLog(
            actor_id=user_id,
            action="SIGN_CONTRACT",
            entity_type="contract",
            entity_id=contract.id,
            after_state={
                "signed_by_partner": data.signed_by_partner,
                "signed_by_aiesec_user_id": user_id,
                "signed_at": signed_at.isoformat(),
                "status": "SIGNED",
            },
        )
        db.add(audit)
        db.commit()
        db.refresh(contract)
        return ContractService.to_response(contract)

    @staticmethod
    def create_contract_version(db: Session, contract_id: str, user_id: str) -> ContractResponse:
        contract = ContractService.get_contract_by_id(db, contract_id)
        if not contract:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found")

        contract.version += 1
        audit = AuditLog(
            actor_id=user_id,
            action="VERSION_CONTRACT",
            entity_type="contract",
            entity_id=contract.id,
            after_state={"version": contract.version},
        )
        db.add(audit)
        db.commit()
        db.refresh(contract)
        return ContractService.to_response(contract)

    @staticmethod
    def get_expiring_contracts(db: Session) -> List[ContractResponse]:
        contracts = db.query(Contract).filter(Contract.status.in_(["ACTIVE", "SIGNED"])).all()
        expiring = []
        for c in contracts:
            resp = ContractService.to_response(c)
            if resp.is_expiring_soon or resp.is_expired:
                expiring.append(resp)
        return expiring

    # ==================== Operational Risk Register (FNL-05) ====================
    @staticmethod
    def create_risk(db: Session, data: OperationalRiskCreate, user_id: str) -> OperationalRiskResponse:
        score = data.probability * data.impact
        risk = OperationalRisk(
            organization_id=data.organization_id,
            contract_id=data.contract_id,
            title=data.title,
            category=data.category,
            probability=data.probability,
            impact=data.impact,
            score=score,
            mitigation_plan=data.mitigation_plan,
            owner_id=data.owner_id or user_id,
            status=data.status,
        )
        db.add(risk)
        db.flush()

        audit = AuditLog(
            actor_id=user_id,
            action="CREATE_OPERATIONAL_RISK",
            entity_type="operational_risk",
            entity_id=risk.id,
            after_state={"title": risk.title, "score": risk.score, "category": risk.category},
        )
        db.add(audit)
        db.commit()
        db.refresh(risk)
        return OperationalRiskResponse.model_validate(risk)

    @staticmethod
    def get_risks(
        db: Session,
        organization_id: Optional[str] = None,
        category: Optional[str] = None,
        status_filter: Optional[str] = None,
    ) -> List[OperationalRiskResponse]:
        query = db.query(OperationalRisk)
        if organization_id:
            query = query.filter(OperationalRisk.organization_id == organization_id)
        if category:
            query = query.filter(OperationalRisk.category == category)
        if status_filter:
            query = query.filter(OperationalRisk.status == status_filter)
        risks = query.order_by(OperationalRisk.score.desc()).all()
        return [OperationalRiskResponse.model_validate(r) for r in risks]

    @staticmethod
    def update_risk(db: Session, risk_id: str, data: OperationalRiskUpdate, user_id: str) -> OperationalRiskResponse:
        risk = db.query(OperationalRisk).filter(OperationalRisk.id == risk_id).first()
        if not risk:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk not found")

        update_dict = data.model_dump(exclude_unset=True)
        prob = update_dict.get("probability", risk.probability)
        imp = update_dict.get("impact", risk.impact)
        risk.score = prob * imp

        for field, value in update_dict.items():
            setattr(risk, field, value)

        audit = AuditLog(
            actor_id=user_id,
            action="UPDATE_OPERATIONAL_RISK",
            entity_type="operational_risk",
            entity_id=risk.id,
            after_state=update_dict,
        )
        db.add(audit)
        db.commit()
        db.refresh(risk)
        return OperationalRiskResponse.model_validate(risk)
