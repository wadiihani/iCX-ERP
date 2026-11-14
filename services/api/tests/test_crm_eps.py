import pytest
from app.modules.identity.models import User, Role, Permission, UserRoleAssignment
from app.core.security import get_password_hash


def get_auth_token(client, email="admin@aiesec.org.ma", password="AdminSecret123"):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    return res.json()["access_token"]


def test_ep_creation_and_duplicate_detection(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "expa_person_id": "EXPA-EP-1001",
        "first_name": "Elena",
        "last_name": "Rostova",
        "email": "elena.rostova@aiesec.net",
        "phone": "+393451234567",
        "country_of_residence": "Italy",
        "nationality": "Italian",
        "home_mc": "AIESEC in Italy",
        "home_lc": "AIESEC Milan",
        "passport_number": "YA1234567",
        "product_interests": "iGV,iGTa",
        "notes": "Interested in educational development projects.",
    }

    # 1. Create EP
    res = client.post("/api/v1/crm/eps", json=payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["first_name"] == "Elena"
    assert data["email"] == "elena.rostova@aiesec.net"
    assert data["passport_number"] == "YA1234567"  # Admin sees unmasked
    assert data["phone"] == "+393451234567"  # Admin sees unmasked
    ep_id = data["id"]

    # 2. Duplicate email check -> 409
    dup_payload = dict(payload)
    dup_payload["expa_person_id"] = "EXPA-EP-DIFF"
    res_dup = client.post("/api/v1/crm/eps", json=dup_payload, headers=headers)
    assert res_dup.status_code == 409
    assert "duplicate" in res_dup.json()["detail"].lower()

    # 3. Duplicate EXPA ID check -> 409
    dup_expa = dict(payload)
    dup_expa["email"] = "other.email@aiesec.net"
    res_expa = client.post("/api/v1/crm/eps", json=dup_expa, headers=headers)
    assert res_expa.status_code == 409
    assert "duplicate" in res_expa.json()["detail"].lower()


def test_ep_pii_masking_for_unauthorized_user(client, db):
    admin_token = get_auth_token(client)
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Create unprivileged operational user without 'ep:pii:view'
    test_user_email = "member.ops@aiesec.org.ma"
    existing_user = db.query(User).filter(User.email == test_user_email).first()
    if not existing_user:
        new_user = User(
            email=test_user_email,
            password_hash=get_password_hash("MemberPass123"),
            full_name="Operations Member",
            is_active=True,
        )
        db.add(new_user)
        db.flush()
        # Assign CX_MEMBER role (has no ep:pii:view permission)
        role = db.query(Role).filter(Role.id == "CX_MEMBER").first()
        if role:
            db.add(UserRoleAssignment(user_id=new_user.id, role_id=role.id))
        db.commit()

    # Create candidate with admin
    res = client.post(
        "/api/v1/crm/eps",
        json={
            "expa_person_id": "EXPA-PII-99",
            "first_name": "Marc",
            "last_name": "Dubois",
            "email": "marc.dubois@aiesec.net",
            "phone": "+33612345678",
            "country_of_residence": "France",
            "nationality": "French",
            "passport_number": "FR987654321",
        },
        headers=admin_headers,
    )
    assert res.status_code == 201
    ep_id = res.json()["id"]

    # 1. Admin reads profile -> unmasked
    admin_read = client.get(f"/api/v1/crm/eps/{ep_id}", headers=admin_headers)
    assert admin_read.status_code == 200
    assert admin_read.json()["passport_number"] == "FR987654321"
    assert admin_read.json()["phone"] == "+33612345678"

    # 2. Member reads profile -> masked PII
    member_token = get_auth_token(client, email=test_user_email, password="MemberPass123")
    member_headers = {"Authorization": f"Bearer {member_token}"}
    member_read = client.get(f"/api/v1/crm/eps/{ep_id}", headers=member_headers)
    assert member_read.status_code == 200
    masked_data = member_read.json()
    assert masked_data["passport_number"] == "*******4321"  # Masked keeping last 4
    assert masked_data["phone"] == "+336 *** *** 78"  # Masked phone


def test_bulk_csv_import_dry_run_and_commit(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "text/plain"}

    csv_data = """First Name,Last Name,Email,Phone,Country,Nationality,EXPA ID,Passport
Lucas,Silva,lucas.silva@aiesec.net,+551199998888,Brazil,Brazilian,EXPA-BR-01,BR55443322
Amina,Khoury,amina.khoury@aiesec.net,+9613123456,Lebanon,Lebanese,EXPA-LB-02,LB99887766
InvalidCandidate,,bad-email,,France,French,,
"""

    # 1. Dry run
    dry_res = client.post("/api/v1/crm/eps/import/dry-run", data=csv_data, headers=headers)
    assert dry_res.status_code == 200
    report = dry_res.json()
    assert report["total_rows"] == 3
    assert report["valid_count"] == 2
    assert report["invalid_count"] == 1
    assert report["is_dry_run"] is True
    assert len(report["errors"]) == 1
    assert report["errors"][0]["row"] == 3

    # 2. Execute import
    exec_res = client.post("/api/v1/crm/eps/import/execute", data=csv_data, headers=headers)
    assert exec_res.status_code == 200
    exec_report = exec_res.json()
    assert exec_report["is_dry_run"] is False
    assert exec_report["valid_count"] == 2

    # 3. Verify committed candidates in directory
    get_res = client.get(
        "/api/v1/crm/eps?search=Lucas",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert get_res.status_code == 200
    results = get_res.json()
    assert len(results) >= 1
    assert any(ep["email"] == "lucas.silva@aiesec.net" for ep in results)
