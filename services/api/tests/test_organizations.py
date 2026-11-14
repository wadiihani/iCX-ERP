import pytest
from app.modules.identity.models import AuditLog


def get_auth_token(client):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "bd@aiesec.org.ma", "password": "PartnerSecret123"},
    )
    return res.json()["access_token"]


def test_create_and_list_organization(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create a valid hosting partner (NGO)
    payload = {
        "name": "Association Al Amal pour le Developpement",
        "legal_name": "Association Al Amal",
        "sector": "NGO",
        "org_type": "NGO",
        "website": "https://alamal.org.ma",
        "location": "Rabat, Morocco",
        "address": "12 Avenue Hassan II, Agdal, Rabat",
        "contacts": [
            {
                "first_name": "Yasmine",
                "last_name": "Benkirane",
                "email": "yasmine@alamal.org.ma",
                "phone": "+212600112233",
                "job_title": "Executive Director",
                "is_primary": True,
            }
        ],
    }

    create_res = client.post("/api/v1/organizations", json=payload, headers=headers)
    assert create_res.status_code == 201
    data = create_res.json()
    assert data["name"] == "Association Al Amal pour le Developpement"
    assert data["is_prohibited"] is False
    assert data["verification_status"] == "UNVERIFIED"
    assert len(data["contacts"]) == 1
    assert data["contacts"][0]["first_name"] == "Yasmine"
    org_id = data["id"]

    # 2. List organizations
    list_res = client.get("/api/v1/organizations", headers=headers)
    assert list_res.status_code == 200
    orgs = list_res.json()
    assert len(orgs) >= 1
    assert any(o["id"] == org_id for o in orgs)


def test_prohibited_entity_detection(client):
    """
    AIESEC entities cannot serve as hosting organizations for exchange participants.
    System must flag them as prohibited.
    """
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "name": "AIESEC in Rabat Host Hub",
        "legal_name": "AIESEC Morocco",
        "sector": "NGO",
        "org_type": "NGO",
    }

    create_res = client.post("/api/v1/organizations", json=payload, headers=headers)
    assert create_res.status_code == 201
    data = create_res.json()
    assert data["is_prohibited"] is True
    assert data["verification_status"] == "PROHIBITED"
    assert "cannot serve as hosting organizations" in data["prohibition_reason"]


def test_contacts_lifecycle_and_primary_toggle(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create org
    create_org = client.post(
        "/api/v1/organizations",
        json={"name": "Tech Corp Maroc", "sector": "Tech"},
        headers=headers,
    )
    org_id = create_org.json()["id"]

    # 2. Add first contact (primary)
    c1_res = client.post(
        f"/api/v1/organizations/{org_id}/contacts",
        json={
            "first_name": "Omar",
            "last_name": "Alami",
            "email": "omar@techcorp.ma",
            "is_primary": True,
        },
        headers=headers,
    )
    assert c1_res.status_code == 201
    c1_id = c1_res.json()["id"]
    assert c1_res.json()["is_primary"] is True

    # 3. Add second contact as new primary -> should demote c1
    c2_res = client.post(
        f"/api/v1/organizations/{org_id}/contacts",
        json={
            "first_name": "Sara",
            "last_name": "Tahiri",
            "email": "sara@techcorp.ma",
            "is_primary": True,
        },
        headers=headers,
    )
    assert c2_res.status_code == 201
    assert c2_res.json()["is_primary"] is True

    # 4. Fetch org and verify c1 is no longer primary
    get_org = client.get(f"/api/v1/organizations/{org_id}", headers=headers)
    contacts = get_org.json()["contacts"]
    assert len(contacts) == 2
    for c in contacts:
        if c["id"] == c1_id:
            assert c["is_primary"] is False
        else:
            assert c["is_primary"] is True


def test_audit_log_recorded(client, db):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    create_res = client.post(
        "/api/v1/organizations",
        json={"name": "StartUp Rabat", "sector": "Startup"},
        headers=headers,
    )
    assert create_res.status_code == 201
    org_id = create_res.json()["id"]

    logs = db.query(AuditLog).filter(AuditLog.entity_id == org_id).all()
    assert len(logs) >= 1
    assert logs[0].action == "CREATE_ORGANIZATION"
