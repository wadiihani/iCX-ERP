import pytest
from datetime import date, timedelta
from app.modules.identity.models import AuditLog


def get_auth_token(client):
    # Admin has all permissions including contract:draft, contract:approve, partner:read, partner:write
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@aiesec.org.ma", "password": "AdminSecret123"},
    )
    return res.json()["access_token"]


def create_test_org(client, headers, name="Partner School Rabat"):
    res = client.post(
        "/api/v1/organizations",
        json={"name": name, "sector": "School/Education"},
        headers=headers,
    )
    return res.json()["id"]


def test_contract_creation_and_versioning(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    org_id = create_test_org(client, headers)

    today = date.today()
    start = today.isoformat()
    end = (today + timedelta(days=180)).isoformat()

    payload = {
        "contract_number": "CTR-2027-001",
        "organization_id": org_id,
        "title": "iGTe Hosting Agreement 2027",
        "product_types": ["iGTe"],
        "start_date": start,
        "end_date": end,
        "total_slots": 3,
        "financial_terms": {"fee_per_slot": 2500, "currency": "MAD"},
        "special_clauses": "Teaching accreditation verified.",
        "iac_audit_ready": True,
    }

    create_res = client.post("/api/v1/contracts", json=payload, headers=headers)
    assert create_res.status_code == 201
    contract_data = create_res.json()
    assert contract_data["contract_number"] == "CTR-2027-001"
    assert contract_data["status"] == "DRAFT"
    assert contract_data["version"] == 1
    assert contract_data["iac_audit_ready"] is True
    assert contract_data["is_expiring_soon"] is False
    assert contract_data["is_expired"] is False
    contract_id = contract_data["id"]

    # Version increment
    ver_res = client.post(f"/api/v1/contracts/{contract_id}/version", headers=headers)
    assert ver_res.status_code == 200
    assert ver_res.json()["version"] == 2


def test_prohibited_host_contract_blocked(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # Create prohibited entity
    org_res = client.post(
        "/api/v1/organizations",
        json={"name": "AIESEC Partner Division", "sector": "Other"},
        headers=headers,
    )
    org_id = org_res.json()["id"]
    assert org_res.json()["is_prohibited"] is True

    # Try creating contract for prohibited entity -> must fail
    today = date.today()
    payload = {
        "contract_number": "CTR-PROHIBITED-001",
        "organization_id": org_id,
        "title": "Invalid Contract",
        "product_types": ["iGV"],
        "start_date": today.isoformat(),
        "end_date": (today + timedelta(days=90)).isoformat(),
    }
    create_res = client.post("/api/v1/contracts", json=payload, headers=headers)
    assert create_res.status_code == 400
    assert "cannot create contract for prohibited entity" in create_res.json()["detail"].lower()


def test_contract_signing_and_lead_advancement(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    org_id = create_test_org(client, headers, name="NGO Solidarite Rabat")

    # Create lead
    lead_res = client.post(
        "/api/v1/prm/leads",
        json={"organization_id": org_id, "title": "iGV NGO Partnership", "stage": "NEGOTIATION"},
        headers=headers,
    )
    lead_id = lead_res.json()["id"]

    today = date.today()
    contract_res = client.post(
        "/api/v1/contracts",
        json={
            "contract_number": "CTR-2027-002",
            "organization_id": org_id,
            "lead_id": lead_id,
            "title": "Solidarite Partnership Agreement",
            "product_types": ["iGV"],
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=365)).isoformat(),
        },
        headers=headers,
    )
    contract_id = contract_res.json()["id"]

    # Formally sign contract
    sign_res = client.post(
        f"/api/v1/contracts/{contract_id}/sign",
        json={"signed_by_partner": "Dr. Amina Benali (President)"},
        headers=headers,
    )
    assert sign_res.status_code == 200
    signed_data = sign_res.json()
    assert signed_data["status"] == "SIGNED"
    assert signed_data["signed_by_partner"] == "Dr. Amina Benali (President)"
    assert signed_data["signed_by_aiesec_user_id"] is not None

    # Verify lead was automatically advanced to CONTRACT_SIGNED
    get_lead = client.get(f"/api/v1/prm/leads/{lead_id}", headers=headers)
    assert get_lead.json()["stage"] == "CONTRACT_SIGNED"

    # Verify organization is now ACTIVE_PARTNER
    get_org = client.get(f"/api/v1/organizations/{org_id}", headers=headers)
    assert get_org.json()["status"] == "ACTIVE_PARTNER"


def test_expiring_contract_alerts(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    org_id = create_test_org(client, headers, name="Expiring Host Co")

    today = date.today()
    # Contract ending in 15 days (expiring soon)
    c1_res = client.post(
        "/api/v1/contracts",
        json={
            "contract_number": "CTR-EXPIRING-SOON",
            "organization_id": org_id,
            "title": "Expiring Soon Host",
            "start_date": (today - timedelta(days=100)).isoformat(),
            "end_date": (today + timedelta(days=15)).isoformat(),
        },
        headers=headers,
    )
    c1_id = c1_res.json()["id"]

    # Sign it so status is SIGNED
    client.post(f"/api/v1/contracts/{c1_id}/sign", json={"signed_by_partner": "Manager"}, headers=headers)

    alerts_res = client.get("/api/v1/contracts/expiring/alerts", headers=headers)
    assert alerts_res.status_code == 200
    alerts = alerts_res.json()
    assert any(c["id"] == c1_id and c["is_expiring_soon"] for c in alerts)


def test_operational_risk_register(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    org_id = create_test_org(client, headers, name="High Tech Risk Corp")

    payload = {
        "organization_id": org_id,
        "title": "Partner Payment Default Risk",
        "category": "FINANCIAL",
        "probability": 4,
        "impact": 5,
        "mitigation_plan": "Require 50% advance deposit before opportunity slot confirmation.",
        "status": "OPEN",
    }

    create_res = client.post("/api/v1/risks", json=payload, headers=headers)
    assert create_res.status_code == 201
    risk_data = create_res.json()
    assert risk_data["score"] == 20  # 4 * 5 = 20
    assert risk_data["category"] == "FINANCIAL"
    risk_id = risk_data["id"]

    # List risks
    list_res = client.get("/api/v1/risks", headers=headers)
    assert list_res.status_code == 200
    risks = list_res.json()
    assert len(risks) >= 1
    assert risks[0]["id"] == risk_id  # Sorted by score descending
