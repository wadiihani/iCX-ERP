import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.modules.exchanges.models import Exchange, ExchangeChecklist, ExchangeIncident
from app.modules.exchanges.schemas import (
    ExchangeIncidentCreate,
    ChecklistUpdatePayload,
)
from app.modules.applications.models import Application
from app.modules.opportunities.models import Opportunity
from app.modules.crm.models import ExchangeParticipant


PHYSICAL_CHECKLIST_TEMPLATES = [
    # Category, Item Key, Title, Mandatory
    ("PRE_ARRIVAL", "visa_permit_confirmed", "Visa / Entry Permit Confirmed", True),
    ("PRE_ARRIVAL", "flight_tickets_logged", "Flight Tickets & Arrival Time Logged", True),
    ("PRE_ARRIVAL", "health_insurance_verified", "International Health Insurance Verified", True),
    ("PRE_ARRIVAL", "emergency_contact_registered", "Emergency Contact & Medical Details Registered", True),
    ("PRE_ARRIVAL", "arrival_pickup_assigned", "Arrival Pickup Host / Driver Assigned", True),
    ("ARRIVAL", "airport_pickup_completed", "Airport / Station Pickup Executed", True),
    ("ARRIVAL", "accommodation_checkin", "Accommodation Safely Checked-In", True),
    ("ARRIVAL", "local_sim_provided", "Local Moroccan SIM Card & Connectivity Provided", False),
    ("IPS", "ips_conference_attended", "Incoming Preparation Seminar (IPS) Attended", True),
    ("WORKSITE", "first_day_accompanied", "First Day of Work Accompanied by AIESECer", True),
    ("WORKSITE", "workplace_mentor_aligned", "Line Manager & JD Alignment Space Held", True),
    ("DEPARTURE", "departure_transport_aligned", "Departure Logistics & Airport Transport Aligned", False),
    ("DEPARTURE", "closing_debrief_conducted", "Closing Debrief & Standards Evaluation Done", True),
]

REMOTE_CHECKLIST_TEMPLATES = [
    ("PRE_ARRIVAL", "remote_contract_signed", "Remote Working Agreement Signed", True),
    ("PRE_ARRIVAL", "virtual_tools_provisioned", "Access to Company Workspace / Virtual Tools Provisioned", True),
    ("PRE_ARRIVAL", "timezone_overlap_confirmed", "Timezone Working Hours Overlap Confirmed", True),
    ("IPS", "virtual_ips_attended", "Virtual Incoming Preparation Seminar Attended", True),
    ("WORKSITE", "digital_kickoff_held", "Digital Kickoff & First Day Team Call Held", True),
    ("DEPARTURE", "closing_debrief_conducted", "Remote Debrief & Standards Review Held", True),
]


class ExchangeService:
    @staticmethod
    def spawn_from_application(db: Session, application_id: str) -> Exchange:
        app = db.query(Application).filter(Application.id == application_id).first()
        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Application {application_id} not found")

        # Verify application is approved
        if app.current_stage != "APPROVED" and app.official_expa_status != "APD":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot spawn exchange: Application is in stage '{app.current_stage}' (EXPA: {app.official_expa_status}). Must be APPROVED.",
            )

        # Check existing exchange
        existing = db.query(Exchange).filter(Exchange.application_id == application_id).first()
        if existing:
            return existing

        opp = app.opportunity
        modality = opp.modality if opp else "PHYSICAL"
        start_date = opp.start_date
        end_date = opp.end_date

        ex_code = f"EXC-{opp.product_type}-{uuid.uuid4().hex[:6].upper()}"

        exchange = Exchange(
            application_id=application_id,
            exchange_code=ex_code,
            modality=modality,
            delivery_status="PRE_ARRIVAL",
            start_date=start_date,
            end_date=end_date,
            lead_manager_id=app.assigned_manager_id,
        )
        db.add(exchange)
        db.flush()

        # Provision modality checklists
        templates = PHYSICAL_CHECKLIST_TEMPLATES if modality == "PHYSICAL" else REMOTE_CHECKLIST_TEMPLATES
        for cat, key, title, mandatory in templates:
            item = ExchangeChecklist(
                exchange_id=exchange.id,
                category=cat,
                item_key=key,
                item_title=title,
                is_mandatory=mandatory,
                is_completed=False,
            )
            db.add(item)

        db.commit()
        db.refresh(exchange)
        return exchange

    @staticmethod
    def get_exchanges(
        db: Session,
        delivery_status: Optional[str] = None,
        modality: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        query = db.query(Exchange)
        if delivery_status:
            query = query.filter(Exchange.delivery_status == delivery_status)
        if modality:
            query = query.filter(Exchange.modality == modality)

        exchanges = query.order_by(Exchange.created_at.desc()).offset(offset).limit(limit).all()
        results = []

        for ex in exchanges:
            app = ex.application
            ep = app.ep if app else None
            opp = app.opportunity if app else None

            if search:
                s = search.lower()
                matches = (
                    ex.exchange_code.lower().find(s) != -1
                    or (ep and (ep.first_name.lower().find(s) != -1 or ep.last_name.lower().find(s) != -1))
                    or (opp and opp.title.lower().find(s) != -1)
                )
                if not matches:
                    continue

            results.append(
                {
                    "id": ex.id,
                    "application_id": ex.application_id,
                    "exchange_code": ex.exchange_code,
                    "modality": ex.modality,
                    "delivery_status": ex.delivery_status,
                    "start_date": ex.start_date,
                    "end_date": ex.end_date,
                    "actual_arrival_date": ex.actual_arrival_date,
                    "actual_departure_date": ex.actual_departure_date,
                    "ips_completed": ex.ips_completed,
                    "worksite_verified": ex.worksite_verified,
                    "first_day_attended": ex.first_day_attended,
                    "lead_manager_id": ex.lead_manager_id,
                    "notes": ex.notes,
                    "created_at": ex.created_at,
                    "updated_at": ex.updated_at,
                    "ep_name": f"{ep.first_name} {ep.last_name}" if ep else None,
                    "ep_country": ep.country_of_residence if ep else None,
                    "opportunity_title": opp.title if opp else None,
                    "product_type": opp.product_type if opp else None,
                    "checklists": ex.checklists,
                    "incidents": ex.incidents,
                }
            )

        return results

    @staticmethod
    def get_exchange_by_id(db: Session, exchange_id: str) -> Dict[str, Any]:
        ex = db.query(Exchange).filter(Exchange.id == exchange_id).first()
        if not ex:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Exchange {exchange_id} not found")

        app = ex.application
        ep = app.ep if app else None
        opp = app.opportunity if app else None

        return {
            "id": ex.id,
            "application_id": ex.application_id,
            "exchange_code": ex.exchange_code,
            "modality": ex.modality,
            "delivery_status": ex.delivery_status,
            "start_date": ex.start_date,
            "end_date": ex.end_date,
            "actual_arrival_date": ex.actual_arrival_date,
            "actual_departure_date": ex.actual_departure_date,
            "ips_completed": ex.ips_completed,
            "worksite_verified": ex.worksite_verified,
            "first_day_attended": ex.first_day_attended,
            "lead_manager_id": ex.lead_manager_id,
            "notes": ex.notes,
            "created_at": ex.created_at,
            "updated_at": ex.updated_at,
            "ep_name": f"{ep.first_name} {ep.last_name}" if ep else None,
            "ep_country": ep.country_of_residence if ep else None,
            "opportunity_title": opp.title if opp else None,
            "product_type": opp.product_type if opp else None,
            "checklists": ex.checklists,
            "incidents": ex.incidents,
        }

    @staticmethod
    def update_checklist_item(
        db: Session, exchange_id: str, checklist_id: str, user_id: Optional[str], payload: ChecklistUpdatePayload
    ) -> ExchangeChecklist:
        item = (
            db.query(ExchangeChecklist)
            .filter(
                ExchangeChecklist.id == checklist_id,
                ExchangeChecklist.exchange_id == exchange_id,
            )
            .first()
        )
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Checklist item {checklist_id} not found")

        item.is_completed = payload.is_completed
        if payload.is_completed:
            item.completed_at = datetime.now(timezone.utc)
            item.completed_by = user_id
        else:
            item.completed_at = None
            item.completed_by = None
        if payload.notes:
            item.notes = payload.notes

        db.commit()
        db.refresh(item)
        return item

    @staticmethod
    def report_incident(
        db: Session, exchange_id: str, user_id: Optional[str], payload: ExchangeIncidentCreate
    ) -> ExchangeIncident:
        ex = db.query(Exchange).filter(Exchange.id == exchange_id).first()
        if not ex:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Exchange {exchange_id} not found")

        incident = ExchangeIncident(
            exchange_id=exchange_id,
            incident_type=payload.incident_type,
            severity=payload.severity,
            description=payload.description,
            reported_by=user_id,
            status="OPEN",
        )
        db.add(incident)

        # If critical or break request, update exchange notes
        if payload.severity in ["HIGH", "CRITICAL"]:
            ex.notes = f"{ex.notes or ''}\nCRITICAL INCIDENT REPORTED ({payload.incident_type}): {payload.description}".strip()

        db.commit()
        db.refresh(incident)
        return incident

    @staticmethod
    def resolve_incident(
        db: Session, incident_id: str, user_id: Optional[str], resolution_notes: str
    ) -> ExchangeIncident:
        incident = db.query(ExchangeIncident).filter(ExchangeIncident.id == incident_id).first()
        if not incident:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Incident {incident_id} not found")

        incident.status = "RESOLVED"
        incident.resolution_notes = resolution_notes
        incident.resolved_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(incident)
        return incident
