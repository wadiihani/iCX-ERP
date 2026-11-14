from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.modules.organizations.models import Organization, OrganizationContact
from app.modules.organizations.schemas import OrganizationCreate, OrganizationUpdate, ContactCreate, ContactUpdate
from app.modules.identity.models import AuditLog


class OrganizationService:
    @staticmethod
    def _check_prohibited_entity(name: str, legal_name: Optional[str] = None) -> tuple[bool, Optional[str]]:
        """
        Master specification invariant: AIESEC entities are strictly prohibited
        from serving as local hosting organizations.
        """
        check_str = f"{name} {legal_name or ''}".lower()
        if "aiesec" in check_str:
            return True, "AIESEC entities cannot serve as hosting organizations for exchange participants."
        return False, None

    @staticmethod
    def get_organizations(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        status_filter: Optional[str] = None,
        sector_filter: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Organization]:
        query = db.query(Organization)
        if status_filter:
            query = query.filter(Organization.status == status_filter)
        if sector_filter:
            query = query.filter(Organization.sector == sector_filter)
        if search:
            query = query.filter(Organization.name.ilike(f"%{search}%"))
        return query.order_by(Organization.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_organization_by_id(db: Session, org_id: str) -> Optional[Organization]:
        return db.query(Organization).filter(Organization.id == org_id).first()

    @staticmethod
    def create_organization(db: Session, data: OrganizationCreate, user_id: str) -> Organization:
        is_prohibited, reason = OrganizationService._check_prohibited_entity(data.name, data.legal_name)
        verification_status = "PROHIBITED" if is_prohibited else "UNVERIFIED"

        org = Organization(
            name=data.name,
            legal_name=data.legal_name,
            sector=data.sector,
            org_type=data.org_type,
            website=data.website,
            location=data.location,
            address=data.address,
            tax_id=data.tax_id,
            verification_status=verification_status,
            is_prohibited=is_prohibited,
            prohibition_reason=reason,
            status=data.status,
            relationship_health="GOOD",
            account_manager_id=data.account_manager_id or user_id,
        )
        db.add(org)
        db.flush()

        # Add initial contacts if provided
        if data.contacts:
            for c in data.contacts:
                contact = OrganizationContact(
                    organization_id=org.id,
                    first_name=c.first_name,
                    last_name=c.last_name,
                    email=str(c.email) if c.email else None,
                    phone=c.phone,
                    job_title=c.job_title,
                    department=c.department,
                    is_primary=c.is_primary,
                    notes=c.notes,
                )
                db.add(contact)

        # Audit log
        audit = AuditLog(
            actor_id=user_id,
            action="CREATE_ORGANIZATION",
            entity_type="organization",
            entity_id=org.id,
            after_state={
                "name": org.name,
                "sector": org.sector,
                "is_prohibited": org.is_prohibited,
                "status": org.status,
            },
        )
        db.add(audit)
        db.commit()
        db.refresh(org)
        return org

    @staticmethod
    def update_organization(db: Session, org_id: str, data: OrganizationUpdate, user_id: str) -> Organization:
        org = OrganizationService.get_organization_by_id(db, org_id)
        if not org:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

        update_dict = data.model_dump(exclude_unset=True)
        if "name" in update_dict or "legal_name" in update_dict:
            name = update_dict.get("name", org.name)
            legal_name = update_dict.get("legal_name", org.legal_name)
            is_prohibited, reason = OrganizationService._check_prohibited_entity(name, legal_name)
            if is_prohibited:
                update_dict["is_prohibited"] = True
                update_dict["verification_status"] = "PROHIBITED"
                update_dict["prohibition_reason"] = reason

        for field, value in update_dict.items():
            setattr(org, field, value)

        audit = AuditLog(
            actor_id=user_id,
            action="UPDATE_ORGANIZATION",
            entity_type="organization",
            entity_id=org.id,
            after_state=update_dict,
        )
        db.add(audit)
        db.commit()
        db.refresh(org)
        return org

    @staticmethod
    def add_contact(db: Session, org_id: str, data: ContactCreate, user_id: str) -> OrganizationContact:
        org = OrganizationService.get_organization_by_id(db, org_id)
        if not org:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

        if data.is_primary:
            # Set existing contacts to not primary
            db.query(OrganizationContact).filter(
                OrganizationContact.organization_id == org_id,
                OrganizationContact.is_primary == True,
            ).update({"is_primary": False})

        contact = OrganizationContact(
            organization_id=org_id,
            first_name=data.first_name,
            last_name=data.last_name,
            email=str(data.email) if data.email else None,
            phone=data.phone,
            job_title=data.job_title,
            department=data.department,
            is_primary=data.is_primary,
            notes=data.notes,
        )
        db.add(contact)
        db.flush()

        audit = AuditLog(
            actor_id=user_id,
            action="ADD_ORGANIZATION_CONTACT",
            entity_type="organization_contact",
            entity_id=contact.id,
            after_state={"organization_id": org_id, "name": f"{contact.first_name} {contact.last_name}"},
        )
        db.add(audit)
        db.commit()
        db.refresh(contact)
        return contact

    @staticmethod
    def update_contact(db: Session, contact_id: str, data: ContactUpdate, user_id: str) -> OrganizationContact:
        contact = db.query(OrganizationContact).filter(OrganizationContact.id == contact_id).first()
        if not contact:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")

        update_dict = data.model_dump(exclude_unset=True)
        if update_dict.get("is_primary"):
            db.query(OrganizationContact).filter(
                OrganizationContact.organization_id == contact.organization_id,
                OrganizationContact.is_primary == True,
            ).update({"is_primary": False})

        for field, value in update_dict.items():
            if field == "email" and value:
                value = str(value)
            setattr(contact, field, value)

        audit = AuditLog(
            actor_id=user_id,
            action="UPDATE_ORGANIZATION_CONTACT",
            entity_type="organization_contact",
            entity_id=contact.id,
            after_state=update_dict,
        )
        db.add(audit)
        db.commit()
        db.refresh(contact)
        return contact

    @staticmethod
    def delete_contact(db: Session, contact_id: str, user_id: str) -> None:
        contact = db.query(OrganizationContact).filter(OrganizationContact.id == contact_id).first()
        if not contact:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")

        org_id = contact.organization_id
        db.delete(contact)
        audit = AuditLog(
            actor_id=user_id,
            action="DELETE_ORGANIZATION_CONTACT",
            entity_type="organization_contact",
            entity_id=contact_id,
            after_state={"organization_id": org_id},
        )
        db.add(audit)
        db.commit()
