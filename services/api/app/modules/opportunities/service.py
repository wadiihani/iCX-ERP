from datetime import datetime, timezone
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException, status
from app.modules.opportunities.models import (
    Opportunity,
    OpportunityIGVDetails,
    OpportunityIGTDetails,
    OpportunitySlot,
)
from app.modules.contracts.models import Contract
from app.modules.organizations.models import Organization
from app.modules.identity.models import AuditLog
from app.modules.opportunities.schemas import (
    OpportunityCreate,
    OpportunityUpdate,
    OpportunityResponse,
    OpportunitySlotResponse,
    PublicationChecklistResponse,
)
from app.modules.opportunities.validators import ProductValidators


class OpportunityService:
    @staticmethod
    def get_opportunities(
        db: Session,
        skip: int = 0,
        limit: int = 50,
        product_type: Optional[str] = None,
        status_filter: Optional[str] = None,
        organization_id: Optional[str] = None,
    ) -> List[Opportunity]:
        query = db.query(Opportunity)
        if product_type:
            query = query.filter(Opportunity.product_type == product_type)
        if status_filter:
            query = query.filter(Opportunity.status == status_filter)
        if organization_id:
            query = query.filter(Opportunity.organization_id == organization_id)
        return query.order_by(Opportunity.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_opportunity_by_id(db: Session, opp_id: str) -> Optional[Opportunity]:
        return db.query(Opportunity).filter(Opportunity.id == opp_id).first()

    @staticmethod
    def create_opportunity(db: Session, data: OpportunityCreate, user_id: str) -> Opportunity:
        # Invariant 1: Contract must exist and be SIGNED or ACTIVE
        contract = db.query(Contract).filter(Contract.id == data.contract_id).first()
        if not contract:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Linked contract not found")
        if contract.status not in ("SIGNED", "ACTIVE"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Opportunities can only be created against active signed contracts (current contract status: {contract.status})",
            )

        # Invariant 2: Organization must match contract's organization
        if contract.organization_id != data.organization_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Organization does not match contract organization",
            )

        # Invariant 3: Product validation invariants
        val_result = ProductValidators.validate(data)
        if not val_result.is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product validation failed: {'; '.join(val_result.issues)}",
            )

        # Unique code check
        existing = db.query(Opportunity).filter(Opportunity.opportunity_code == data.opportunity_code).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Opportunity code {data.opportunity_code} already exists",
            )

        opp = Opportunity(
            opportunity_code=data.opportunity_code,
            contract_id=data.contract_id,
            organization_id=data.organization_id,
            title=data.title,
            product_type=data.product_type,
            modality=data.modality,
            status="DRAFT",
            start_date=data.start_date,
            end_date=data.end_date,
            duration_weeks=data.duration_weeks,
            working_hours_per_week=data.working_hours_per_week,
            location=data.location,
            description=data.description,
            role_description=data.role_description,
            required_skills=data.required_skills,
            required_languages=data.required_languages,
            openings_capacity=data.openings_capacity,
            filled_openings=0,
            line_manager_name=data.line_manager_name,
            line_manager_contact=data.line_manager_contact,
            is_published=False,
        )
        db.add(opp)
        db.flush()

        # Product-specific details
        if data.product_type == "iGV" and data.igv_details:
            igv = OpportunityIGVDetails(
                opportunity_id=opp.id,
                sdg_number=data.igv_details.sdg_number,
                sdg_target=data.igv_details.sdg_target,
                global_project_name=data.igv_details.global_project_name,
                housing_provided=data.igv_details.housing_provided,
                food_provided=data.igv_details.food_provided,
                transport_provided=data.igv_details.transport_provided,
                project_fee_amount=data.igv_details.project_fee_amount,
            )
            db.add(igv)

        elif data.product_type in ("iGTa", "iGTe") and data.igt_details:
            igt = OpportunityIGTDetails(
                opportunity_id=opp.id,
                work_field=data.igt_details.work_field,
                sub_field=data.igt_details.sub_field,
                duration_tier=val_result.duration_tier or data.igt_details.duration_tier,
                monthly_salary=data.igt_details.monthly_salary,
                currency=data.igt_details.currency,
                salary_covers_living_costs=data.igt_details.salary_covers_living_costs,
                accommodation_covered=data.igt_details.accommodation_covered,
                is_teaching_role=data.igt_details.is_teaching_role,
                accredited_institution=data.igt_details.accredited_institution,
                accreditation_details=data.igt_details.accreditation_details,
                icb_audit_status=data.igt_details.icb_audit_status,
            )
            db.add(igt)

        # Generate capacity slots
        for i in range(1, data.openings_capacity + 1):
            slot = OpportunitySlot(
                opportunity_id=opp.id,
                slot_number=f"{opp.opportunity_code}-SLOT-{i}",
                start_date=opp.start_date,
                end_date=opp.end_date,
                status="OPEN",
                lock_version=1,
            )
            db.add(slot)

        # Audit log
        audit = AuditLog(
            actor_id=user_id,
            action="CREATE_OPPORTUNITY",
            entity_type="opportunity",
            entity_id=opp.id,
            after_state={
                "code": opp.opportunity_code,
                "product_type": opp.product_type,
                "contract_id": opp.contract_id,
                "openings_capacity": opp.openings_capacity,
            },
        )
        db.add(audit)
        db.commit()
        db.refresh(opp)
        return opp

    @staticmethod
    def get_publication_checklist(db: Session, opp_id: str) -> PublicationChecklistResponse:
        opp = OpportunityService.get_opportunity_by_id(db, opp_id)
        if not opp:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")

        issues: List[str] = []

        contract_active = opp.contract is not None and opp.contract.status in ("SIGNED", "ACTIVE")
        if not contract_active:
            issues.append("Contract is not in SIGNED or ACTIVE status")

        slots_generated = len(opp.slots) == opp.openings_capacity and opp.openings_capacity > 0
        if not slots_generated:
            issues.append(f"Expected {opp.openings_capacity} slots, but found {len(opp.slots)}")

        line_manager_confirmed = bool(opp.line_manager_name and len(opp.line_manager_name.strip()) > 0)
        if not line_manager_confirmed:
            issues.append("Line manager contact name is missing")

        jd_complete = bool(len(opp.description.strip()) >= 10 and len(opp.role_description.strip()) >= 10)
        if not jd_complete:
            issues.append("Job description and role requirements are incomplete")

        product_rules_passed = True
        if opp.product_type == "iGV":
            if not opp.igv_details or not (1 <= opp.igv_details.sdg_number <= 17):
                product_rules_passed = False
                issues.append("iGV SDG details are missing or invalid")
        elif opp.product_type == "iGTa":
            if not opp.igt_details:
                product_rules_passed = False
                issues.append("iGTa details are missing")
            elif opp.duration_weeks > 8 and not opp.igt_details.salary_covers_living_costs:
                product_rules_passed = False
                issues.append("Salary covering living costs is mandatory for iGTa > 8 weeks")
        elif opp.product_type == "iGTe":
            if not opp.igt_details or not opp.igt_details.accredited_institution or not opp.igt_details.is_teaching_role:
                product_rules_passed = False
                issues.append("iGTe institution accreditation or teaching confirmation is missing")

        ready = (
            contract_active
            and slots_generated
            and line_manager_confirmed
            and jd_complete
            and product_rules_passed
        )

        return PublicationChecklistResponse(
            opportunity_id=opp.id,
            contract_active=contract_active,
            product_rules_passed=product_rules_passed,
            slots_generated=slots_generated,
            line_manager_confirmed=line_manager_confirmed,
            jd_complete=jd_complete,
            ready_to_publish=ready,
            issues=issues,
        )

    @staticmethod
    def publish_opportunity(db: Session, opp_id: str, user_id: str) -> Opportunity:
        opp = OpportunityService.get_opportunity_by_id(db, opp_id)
        if not opp:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")

        checklist = OpportunityService.get_publication_checklist(db, opp_id)
        if not checklist.ready_to_publish:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot publish opportunity: {'; '.join(checklist.issues)}",
            )

        opp.status = "PUBLISHED"
        opp.is_published = True
        opp.publication_checklist = checklist.model_dump()

        audit = AuditLog(
            actor_id=user_id,
            action="PUBLISH_OPPORTUNITY",
            entity_type="opportunity",
            entity_id=opp.id,
            after_state={"status": "PUBLISHED", "is_published": True},
        )
        db.add(audit)
        db.commit()
        db.refresh(opp)
        return opp

    @staticmethod
    def reserve_slot_concurrency_safe(
        db: Session,
        slot_id: str,
        application_id: str,
        user_id: str,
    ) -> OpportunitySlot:
        """
        Concurrency-safe slot reservation using optimistic lock_version control.
        Prevents race conditions / overbooking when multiple matching approvals occur.
        """
        slot = db.query(OpportunitySlot).filter(OpportunitySlot.id == slot_id).first()
        if not slot:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Slot not found")

        if slot.status != "OPEN":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Slot {slot.slot_number} is already {slot.status}",
            )

        # Optimistic concurrency check
        current_lock = slot.lock_version
        updated_rows = (
            db.query(OpportunitySlot)
            .filter(
                OpportunitySlot.id == slot_id,
                OpportunitySlot.lock_version == current_lock,
                OpportunitySlot.status == "OPEN",
            )
            .update(
                {
                    "status": "RESERVED",
                    "current_application_id": application_id,
                    "lock_version": current_lock + 1,
                    "updated_at": datetime.now(timezone.utc),
                }
            )
        )

        if updated_rows == 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Slot capacity conflict: Slot was concurrently reserved or modified by another transaction",
            )

        # Increment filled openings in parent opportunity
        opp = db.query(Opportunity).filter(Opportunity.id == slot.opportunity_id).first()
        if opp:
            opp.filled_openings += 1

        audit = AuditLog(
            actor_id=user_id,
            action="RESERVE_OPPORTUNITY_SLOT",
            entity_type="opportunity_slot",
            entity_id=slot.id,
            after_state={"slot_number": slot.slot_number, "application_id": application_id, "status": "RESERVED"},
        )
        db.add(audit)
        db.commit()
        db.refresh(slot)
        return slot
