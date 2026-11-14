import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Text,
    DateTime,
    Date,
    Numeric,
    Integer,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class ArrivalLogistics(Base):
    __tablename__ = "arrival_logistics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    exchange_id = Column(String(36), ForeignKey("exchanges.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    flight_number = Column(String(50), nullable=True)
    airline = Column(String(100), nullable=True)
    arrival_airport = Column(String(50), default="RBA_RABAT", nullable=False)  # RBA_RABAT, CMN_CASABLANCA, RAK_MARRAKECH
    arrival_datetime = Column(DateTime(timezone=True), nullable=False)
    terminal = Column(String(50), nullable=True)
    pickup_status = Column(String(50), default="PENDING", nullable=False)  # PENDING, ASSIGNED, EN_ROUTE, PICKED_UP, NO_SHOW
    assigned_driver_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    driver_name = Column(String(150), nullable=True)
    driver_contact = Column(String(50), nullable=True)
    transport_mode = Column(String(50), default="CAR", nullable=False)  # CAR, TRAIN, TAXI
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    exchange = relationship("Exchange", back_populates="logistics")


class AccommodationUnit(Base):
    __tablename__ = "accommodation_units"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    unit_name = Column(String(150), nullable=False)
    address = Column(String(255), nullable=False)
    neighborhood = Column(String(100), default="Agdal", nullable=False)  # Agdal, Hassan, Hay_Riad, Medina, Ocean
    unit_type = Column(String(50), default="AIESEC_APARTMENT", nullable=False)  # HOST_FAMILY, AIESEC_APARTMENT, DORMITORY, HOTEL
    capacity_beds = Column(Integer, default=1, nullable=False)
    occupied_beds = Column(Integer, default=0, nullable=False)
    monthly_rent_mad = Column(Numeric(10, 2), default=0.00, nullable=False)
    landlord_name = Column(String(150), nullable=True)
    landlord_phone = Column(String(50), nullable=True)
    safety_inspection_passed = Column(Boolean, default=False, nullable=False)
    last_inspected_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    assignments = relationship("ExchangeAccommodation", back_populates="unit")


class ExchangeAccommodation(Base):
    __tablename__ = "exchange_accommodations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    exchange_id = Column(String(36), ForeignKey("exchanges.id", ondelete="CASCADE"), nullable=False, index=True)
    accommodation_unit_id = Column(String(36), ForeignKey("accommodation_units.id", ondelete="RESTRICT"), nullable=False, index=True)
    check_in_date = Column(Date, nullable=False)
    check_out_date = Column(Date, nullable=False)
    status = Column(String(50), default="PLANNED", nullable=False)  # PLANNED, CHECKED_IN, CHECKED_OUT
    bed_number = Column(String(20), default="Bed 1", nullable=True)
    key_deposit_mad = Column(Numeric(10, 2), default=0.00, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    exchange = relationship("Exchange", back_populates="accommodations")
    unit = relationship("AccommodationUnit", back_populates="assignments")
