import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Text,
    DateTime,
    Date,
    ForeignKey,
    BigInteger,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class ExchangeParticipant(Base):
    __tablename__ = "exchange_participants"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    expa_person_id = Column(String(50), unique=True, nullable=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    phone = Column(String(50), nullable=True)
    country_of_residence = Column(String(100), nullable=False, index=True)
    nationality = Column(String(100), nullable=False)
    home_mc = Column(String(150), nullable=True)
    home_lc = Column(String(150), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(20), nullable=True)
    passport_number = Column(String(100), nullable=True)
    cv_url = Column(String(500), nullable=True)
    status = Column(String(50), default="ACTIVE", nullable=False)
    product_interests = Column(String(255), default="iGV,iGTa,iGTe", nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    documents = relationship("EPDocument", back_populates="ep", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="ep")


class EPDocument(Base):
    __tablename__ = "ep_documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ep_id = Column(String(36), ForeignKey("exchange_participants.id", ondelete="CASCADE"), nullable=False, index=True)
    doc_type = Column(String(50), nullable=False)  # CV, PASSPORT_COPY, LANGUAGE_CERT, STUDENT_PROOF, ACCEPTANCE_NOTE
    file_name = Column(String(255), nullable=False)
    file_size_bytes = Column(BigInteger, default=0, nullable=False)
    mime_type = Column(String(100), nullable=False)
    storage_path = Column(String(500), nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    uploaded_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    ep = relationship("ExchangeParticipant", back_populates="documents")
