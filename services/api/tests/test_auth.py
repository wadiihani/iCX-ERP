import pytest
from app.modules.identity.models import AuditLog


def test_user_registration_and_login(client):
    # 1. Register a test user
    reg_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "rabat.admin@aiesec.net",
            "password": "SecurePassword123!",
            "full_name": "Rabat Admin",
            "phone": "+212600000000",
            "roles": ["LCP_ADMIN"],
        },
    )
    assert reg_response.status_code == 201
    user_data = reg_response.json()
    assert user_data["email"] == "rabat.admin@aiesec.net"
    assert "LCP_ADMIN" in user_data["roles"]

    # 2. Login with valid credentials
    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "rabat.admin@aiesec.net",
            "password": "SecurePassword123!",
        },
    )
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    access_token = token_data["access_token"]

    # 3. Access /me endpoint with Bearer token
    me_response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["email"] == "rabat.admin@aiesec.net"
    assert "LCP_ADMIN" in me_data["roles"]


def test_login_invalid_password(client):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "rabat.admin@aiesec.net",
            "password": "WrongPassword123!",
        },
    )
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


def test_unauthorized_access(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_audit_log_recorded_on_registration(client, db):
    email = "audit.test@aiesec.net"
    reg_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": "SecurePassword123!",
            "full_name": "Audit Test",
            "phone": "+212600000001",
            "roles": ["BD_MEMBER"],
        },
    )
    assert reg_response.status_code == 201
    user_id = reg_response.json()["id"]

    logs = db.query(AuditLog).filter(AuditLog.entity_id == user_id, AuditLog.action == "CREATE_USER").all()
    assert len(logs) >= 1
    assert logs[0].entity_type == "USER"
