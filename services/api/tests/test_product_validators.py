import pytest
from datetime import date, timedelta
from app.modules.opportunities.validators import ProductValidators
from app.modules.opportunities.schemas import (
    OpportunityCreate,
    IGVDetailsCreate,
    IGTDetailsCreate,
)


def get_base_opp_payload():
    today = date.today()
    return {
        "opportunity_code": "OPP-TEST-VAL",
        "contract_id": "dummy-contract-id",
        "organization_id": "dummy-org-id",
        "title": "Validation Test Opportunity",
        "start_date": today,
        "end_date": today + timedelta(weeks=6),
        "location": "Rabat, Morocco",
        "description": "Standard comprehensive test description.",
        "role_description": "Standard comprehensive test role description.",
        "openings_capacity": 1,
    }


# ==================== iGV Invariants ====================

def test_igv_valid_payload():
    payload = get_base_opp_payload()
    payload.update({
        "product_type": "iGV",
        "modality": "PHYSICAL",
        "duration_weeks": 6,
        "working_hours_per_week": 30,
        "igv_details": IGVDetailsCreate(
            sdg_number=4,
            global_project_name="Education for All",
            housing_provided=True,
        ),
    })
    opp = OpportunityCreate(**payload)
    res = ProductValidators.validate_igv(opp)
    assert res.is_valid is True
    assert len(res.issues) == 0


def test_igv_rejects_remote_modality():
    payload = get_base_opp_payload()
    payload.update({
        "product_type": "iGV",
        "modality": "FULLY_REMOTE",  # Prohibited for iGV
        "duration_weeks": 6,
        "working_hours_per_week": 30,
        "igv_details": IGVDetailsCreate(sdg_number=4, global_project_name="Prohibited"),
    })
    opp = OpportunityCreate(**payload)
    res = ProductValidators.validate_igv(opp)
    assert res.is_valid is False
    assert any("modality must be physical only" in i.lower() for i in res.issues)


def test_igv_rejects_invalid_duration():
    payload = get_base_opp_payload()
    payload.update({
        "product_type": "iGV",
        "modality": "PHYSICAL",
        "duration_weeks": 12,  # iGV must be 4 to 8 weeks
        "working_hours_per_week": 30,
        "igv_details": IGVDetailsCreate(sdg_number=4, global_project_name="Invalid Duration"),
    })
    opp = OpportunityCreate(**payload)
    res = ProductValidators.validate_igv(opp)
    assert res.is_valid is False
    assert any("duration must be between 4 and 8 weeks" in i.lower() for i in res.issues)


# ==================== iGTa Invariants ====================

def test_igta_valid_short_duration():
    payload = get_base_opp_payload()
    payload.update({
        "product_type": "iGTa",
        "modality": "PHYSICAL",
        "duration_weeks": 8,
        "working_hours_per_week": 40,
        "igt_details": IGTDetailsCreate(
            work_field="IT",
            duration_tier="SHORT",
            monthly_salary=0,
            accommodation_covered=True,  # Accommodation allowed for <= 8 weeks
        ),
    })
    opp = OpportunityCreate(**payload)
    res = ProductValidators.validate_igta(opp)
    assert res.is_valid is True
    assert res.duration_tier == "SHORT"


def test_igta_rejects_unpaid_long_duration():
    payload = get_base_opp_payload()
    payload.update({
        "product_type": "iGTa",
        "modality": "PHYSICAL",
        "duration_weeks": 26,  # Medium/Long tier (> 8 weeks)
        "working_hours_per_week": 40,
        "igt_details": IGTDetailsCreate(
            work_field="MKT",
            duration_tier="MEDIUM",
            monthly_salary=0,  # Prohibited beyond 8 weeks!
            accommodation_covered=True,
            salary_covers_living_costs=False,
        ),
    })
    opp = OpportunityCreate(**payload)
    res = ProductValidators.validate_igta(opp)
    assert res.is_valid is False
    assert any("monthly salary covering living costs is mandatory" in i.lower() for i in res.issues)


# ==================== iGTe Invariants ====================

def test_igte_valid_payload():
    payload = get_base_opp_payload()
    payload.update({
        "product_type": "iGTe",
        "modality": "PHYSICAL",
        "duration_weeks": 16,
        "working_hours_per_week": 35,
        "igt_details": IGTDetailsCreate(
            work_field="Other",
            sub_field="English Language Teaching",
            duration_tier="MEDIUM",
            monthly_salary=5000.00,
            salary_covers_living_costs=True,
            is_teaching_role=True,
            accredited_institution=True,
            accreditation_details="Ministry of National Education accredited school.",
        ),
    })
    opp = OpportunityCreate(**payload)
    res = ProductValidators.validate_igte(opp)
    assert res.is_valid is True
    assert res.duration_tier == "MEDIUM"


def test_igte_rejects_unaccredited_or_unpaid():
    payload = get_base_opp_payload()
    payload.update({
        "product_type": "iGTe",
        "modality": "PHYSICAL",
        "duration_weeks": 10,
        "working_hours_per_week": 35,
        "igt_details": IGTDetailsCreate(
            work_field="Other",
            monthly_salary=0,  # Unpaid prohibited for iGTe
            is_teaching_role=True,
            accredited_institution=False,  # Unaccredited prohibited
        ),
    })
    opp = OpportunityCreate(**payload)
    res = ProductValidators.validate_igte(opp)
    assert res.is_valid is False
    assert any("mandatory monthly salary" in i.lower() for i in res.issues)
    assert any("accredited educational institution" in i.lower() for i in res.issues)
