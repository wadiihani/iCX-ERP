import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False, index=True)
    legal_name = Column(String(255), nullable=True)
    sector = Column(String(100), nullable=False, default="Other")
    org_type = Column(String(100), nullable=False, default="Company")
    website = Column(String(255), nullable=True)
    location = Column(String(255), nullable=False, default="Rabat, Morocco")
    address = Column(Text, nullable=True)
    tax_id = Column(String(100), nullable=True)
    verification_status = Column(String(50), nullable=False, default="UNVERIFIED")
    is_prohibited = Column(Boolean, nullable=False, default=False)
    prohibition_reason = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="LEAD")
    relationship_health = Column(String(50), nullable=False, default="GOOD")
    account_manager_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    contacts = relationship("OrganizationContact", back_populates="organization", cascade="all, delete-orphan")
    account_manager = relationship("User", foreign_keys=[account_manager_id])
    leads = relationship("PRMLead", back_populates="organization", cascade="all, delete-orphan")
    contracts = relationship("Contract", back_populates="organization", cascade="all, delete-orphan")


class OrganizationContact(Base):
    __tablename__ = "organization_contacts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    job_title = Column(String(150), nullable=True)
    department = Column(String(100), nullable=True)
    is_primary = Column(Boolean, nullable=False, default=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    organization = relationship("Organization", back_populates="contacts")
