from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.modules.logistics.models import (
    ArrivalLogistics,
    AccommodationUnit,
    ExchangeAccommodation,
)
from app.modules.logistics.schemas import (
    ArrivalLogisticsCreate,
    PickupStatusUpdate,
    AccommodationUnitCreate,
    AccommodationAssignPayload,
)
from app.modules.exchanges.models import Exchange


class LogisticsService:
    @staticmethod
    def record_arrival(db: Session, payload: ArrivalLogisticsCreate) -> ArrivalLogistics:
        ex = db.query(Exchange).filter(Exchange.id == payload.exchange_id).first()
        if not ex:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Exchange {payload.exchange_id} not found")

        existing = db.query(ArrivalLogistics).filter(ArrivalLogistics.exchange_id == payload.exchange_id).first()
        if existing:
            # Update existing
            existing.flight_number = payload.flight_number
            existing.airline = payload.airline
            existing.arrival_airport = payload.arrival_airport
            existing.arrival_datetime = payload.arrival_datetime
            existing.terminal = payload.terminal
            existing.transport_mode = payload.transport_mode
            existing.driver_name = payload.driver_name
            existing.driver_contact = payload.driver_contact
            existing.notes = payload.notes
            db.commit()
            db.refresh(existing)
            return existing

        logistics = ArrivalLogistics(
            exchange_id=payload.exchange_id,
            flight_number=payload.flight_number,
            airline=payload.airline,
            arrival_airport=payload.arrival_airport,
            arrival_datetime=payload.arrival_datetime,
            terminal=payload.terminal,
            transport_mode=payload.transport_mode,
            driver_name=payload.driver_name,
            driver_contact=payload.driver_contact,
            pickup_status="PENDING",
            notes=payload.notes,
        )
        db.add(logistics)
        db.commit()
        db.refresh(logistics)
        return logistics

    @staticmethod
    def get_arrivals(db: Session, pickup_status: Optional[str] = None) -> List[Dict[str, Any]]:
        query = db.query(ArrivalLogistics)
        if pickup_status:
            query = query.filter(ArrivalLogistics.pickup_status == pickup_status)

        items = query.order_by(ArrivalLogistics.arrival_datetime.asc()).all()
        results = []
        for it in items:
            ex = it.exchange
            app = ex.application if ex else None
            ep = app.ep if app else None
            results.append(
                {
                    "id": it.id,
                    "exchange_id": it.exchange_id,
                    "flight_number": it.flight_number,
                    "airline": it.airline,
                    "arrival_airport": it.arrival_airport,
                    "arrival_datetime": it.arrival_datetime,
                    "terminal": it.terminal,
                    "transport_mode": it.transport_mode,
                    "pickup_status": it.pickup_status,
                    "assigned_driver_id": it.assigned_driver_id,
                    "driver_name": it.driver_name,
                    "driver_contact": it.driver_contact,
                    "notes": it.notes,
                    "created_at": it.created_at,
                    "exchange_code": ex.exchange_code if ex else None,
                    "ep_name": f"{ep.first_name} {ep.last_name}" if ep else None,
                }
            )
        return results

    @staticmethod
    def update_pickup_status(db: Session, logistics_id: str, payload: PickupStatusUpdate) -> ArrivalLogistics:
        it = db.query(ArrivalLogistics).filter(ArrivalLogistics.id == logistics_id).first()
        if not it:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Logistics record {logistics_id} not found")

        it.pickup_status = payload.pickup_status
        if payload.driver_name:
            it.driver_name = payload.driver_name
        if payload.driver_contact:
            it.driver_contact = payload.driver_contact
        if payload.notes:
            it.notes = payload.notes

        # If PICKED_UP, advance exchange delivery status to ARRIVED
        if payload.pickup_status == "PICKED_UP":
            ex = it.exchange
            if ex and ex.delivery_status == "PRE_ARRIVAL":
                ex.delivery_status = "ARRIVED"
                ex.actual_arrival_date = it.arrival_datetime.date()

        db.commit()
        db.refresh(it)
        return it

    @staticmethod
    def create_accommodation_unit(db: Session, payload: AccommodationUnitCreate) -> AccommodationUnit:
        unit = AccommodationUnit(
            unit_name=payload.unit_name,
            address=payload.address,
            neighborhood=payload.neighborhood,
            unit_type=payload.unit_type,
            capacity_beds=payload.capacity_beds,
            occupied_beds=0,
            monthly_rent_mad=payload.monthly_rent_mad,
            landlord_name=payload.landlord_name,
            landlord_phone=payload.landlord_phone,
            safety_inspection_passed=payload.safety_inspection_passed,
            last_inspected_at=datetime.now(timezone.utc) if payload.safety_inspection_passed else None,
        )
        db.add(unit)
        db.commit()
        db.refresh(unit)
        return unit

    @staticmethod
    def get_accommodation_units(db: Session) -> List[AccommodationUnit]:
        return db.query(AccommodationUnit).order_by(AccommodationUnit.unit_name.asc()).all()

    @staticmethod
    def assign_accommodation(db: Session, payload: AccommodationAssignPayload) -> ExchangeAccommodation:
        unit = db.query(AccommodationUnit).filter(AccommodationUnit.id == payload.accommodation_unit_id).first()
        if not unit:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Unit {payload.accommodation_unit_id} not found")

        ex = db.query(Exchange).filter(Exchange.id == payload.exchange_id).first()
        if not ex:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Exchange {payload.exchange_id} not found")

        # Capacity Check
        if unit.occupied_beds >= unit.capacity_beds:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Accommodation unit '{unit.unit_name}' is at full capacity ({unit.occupied_beds}/{unit.capacity_beds} beds occupied).",
            )

        assignment = ExchangeAccommodation(
            exchange_id=payload.exchange_id,
            accommodation_unit_id=payload.accommodation_unit_id,
            check_in_date=payload.check_in_date,
            check_out_date=payload.check_out_date,
            bed_number=payload.bed_number,
            key_deposit_mad=payload.key_deposit_mad,
            notes=payload.notes,
            status="PLANNED",
        )
        db.add(assignment)
        unit.occupied_beds += 1

        db.commit()
        db.refresh(assignment)
        return assignment
