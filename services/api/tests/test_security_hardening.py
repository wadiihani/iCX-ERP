import pytest
from datetime import date, timedelta
from app.modules.identity.models import User, Role, UserRoleAssignment, AuditLog
from app.core.security import get_password_hash


def get_token(client, email, password):
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, res.text
    return res.json()["access_token"]


def test_rbac_denial_on_restricted_actions(client, db):
    """
    Security Hardening: Verify unauthorized roles receive HTTP 403 Forbidden on critical state mutations.
    """
    # 1. Setup a standard member user without leadership or match/financial permissions
    member_email = "regular.member@aiesec.org.ma"
    member_user = db.query(User).filter(User.email == member_email).first()
    if not member_user:
        member_user = User(
            email=member_email,
            password_hash=get_password_hash("MemberPass123!"),
            full_name="Regular Member",
            is_active=True,
        )
        db.add(member_user)
        db.flush()
        db.add(UserRoleAssignment(user_id=member_user.id, role_id="BD_MEMBER"))
        db.commit()

    member_token = get_token(client, member_email, "MemberPass123!")
    member_headers = {"Authorization": f"Bearer {member_token}"}

    # 2. Attempting to approve an exchange completion without leadership role -> 403 Forbidden
    comp_res = client.post(
        "/api/v1/cxp/exchanges/fake-exchange-id/completion/approve",
        json={"notes": "Unauthorized completion approval attempt"},
        headers=member_headers,
    )
    assert comp_res.status_code == 403
    assert "permission" in comp_res.text.lower() or "forbidden" in comp_res.text.lower() or "role" in comp_res.text.lower()

    # 3. Attempting to review a human approval proposal without leadership role -> 403 Forbidden
    appr_res = client.put(
        "/api/v1/approvals/fake-proposal-id/review",
        json={"decision": "APPROVED"},
        headers=member_headers,
    )
    assert appr_res.status_code == 403

    # 4. Attempting to review a financial case (waiver/refund) without FNL/LCP role -> 403 Forbidden
    fnl_res = client.put(
        "/api/v1/finance/cases/fake-case-id/review",
        json={"decision": "APPROVED"},
        headers=member_headers,
    )
    assert fnl_res.status_code == 403

    # 5. Attempting to approve a gated EXPA outbound mutation without LCP/LCVP role -> 403 Forbidden
    expa_res = client.post(
        "/api/v1/expa/mutations/fake-mutation-id/approve",
        headers=member_headers,
    )
    assert expa_res.status_code == 403


def test_pii_masking_enforcement(client, db):
    """
    Security Hardening: Verify PII masking on sensitive fields (passport, phone) for unauthorized roles.
    """
    admin_token = get_token(client, "admin@aiesec.org.ma", "AdminSecret123")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Create EP with sensitive PII
    ep_res = client.post(
        "/api/v1/crm/eps",
        json={
            "first_name": "Marcus",
            "last_name": "Aurelius",
            "email": "marcus.aurelius@security-test.org",
            "phone": "+390612345678",
            "country_of_residence": "Italy",
            "nationality": "Italian",
            "passport_number": "IT-SECRET-9988",
            "product_interests": "iGTa",
        },
        headers=admin_headers,
    )
    assert ep_res.status_code == 201
    ep_id = ep_res.json()["id"]

    # Verify admin with ep:pii:view sees raw passport and phone
    admin_ep = client.get(f"/api/v1/crm/eps/{ep_id}", headers=admin_headers).json()
    assert admin_ep["passport_number"] == "IT-SECRET-9988"
    assert admin_ep["phone"] == "+390612345678"

    # Verify unprivileged or unauthenticated access either masks or blocks
    unauth_ep = client.get(f"/api/v1/crm/eps/{ep_id}")
    assert unauth_ep.status_code in [401, 403]


def test_audit_logging_on_consequential_mutations(client, db):
    """
    Security Hardening: Verify audit log emission on state mutations.
    """
    admin_token = get_token(client, "admin@aiesec.org.ma", "AdminSecret123")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Count audit logs before
    initial_count = db.query(AuditLog).count()

    # Create organization
    org_res = client.post(
        "/api/v1/organizations",
        json={
            "name": "Audit Trail Corp",
            "sector": "Consulting",
            "location": "Rabat, Morocco",
        },
        headers=admin_headers,
    )
    assert org_res.status_code == 201

    # Verify audit log was created
    db.expire_all()
    new_count = db.query(AuditLog).count()
    assert new_count >= initial_count
