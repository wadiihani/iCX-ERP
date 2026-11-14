import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.core.database import Base, get_db
from app.core.security import get_password_hash
from app.modules.identity.models import User, Role, Permission, UserRoleAssignment, Team

# In-memory SQLite with StaticPool so all connections share the same memory DB
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def initialize_database():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    # Seed all core roles
    roles_data = [
        ("BD_MEMBER", "BD / B2B Member"),
        ("IR_MEMBER", "IR Member"),
        ("EP_MANAGER", "EP Manager"),
        ("CX_MEMBER", "Operations / CX Member"),
        ("TEAM_LEADER", "Team Leader"),
        ("LCVP_ICX", "LCVP iCX"),
        ("LCVP_FNL", "LCVP FnL"),
        ("LCP_ADMIN", "LCP / Executive Admin"),
    ]
    for role_id, role_name in roles_data:
        if not db.query(Role).filter(Role.id == role_id).first():
            db.add(Role(id=role_id, name=role_name))

    # Seed core permissions
    perms_data = [
        ("partner:read", "View Partners", "PRM"),
        ("partner:write", "Manage Partners", "PRM"),
        ("contract:read", "View Contracts", "PRM"),
        ("contract:draft", "Draft Contract", "PRM"),
        ("contract:approve", "Approve Contract", "PRM"),
        ("opportunity:read", "View Opportunities", "OPPORTUNITIES"),
        ("opportunity:create", "Create Opportunity", "OPPORTUNITIES"),
        ("opportunity:publish", "Publish Opportunity", "OPPORTUNITIES"),
        ("ep:read", "View EPs", "CRM"),
        ("ep:pii:view", "View Sensitive EP Data", "CRM"),
        ("application:screen", "Screen Applications", "APPLICATIONS"),
        ("application:match", "Approve Match", "APPLICATIONS"),
        ("exchange:read", "View Exchange Operations", "EXCHANGE"),
        ("exchange:logistics:edit", "Update Logistics", "EXCHANGE"),
        ("standards:verify", "Verify Standards Evidence", "CXP"),
        ("finance:pricing:read", "View Pricing", "FINANCE"),
        ("finance:payment:approve", "Approve Payments", "FINANCE"),
        ("approval:decide", "Decide Pending Approvals", "GOVERNANCE"),
        ("ai:invoke", "Use AI Copilots", "AI"),
        ("audit:read", "Inspect Audit Logs", "SECURITY"),
        ("admin:users", "Manage Users & Roles", "ADMIN"),
    ]
    for perm_id, perm_name, module in perms_data:
        if not db.query(Permission).filter(Permission.id == perm_id).first():
            db.add(Permission(id=perm_id, name=perm_name, module=module))

    db.commit()

    # Assign all permissions to LCP_ADMIN
    admin_role = db.query(Role).filter(Role.id == "LCP_ADMIN").first()
    all_perms = db.query(Permission).all()
    admin_role.permissions = all_perms

    # Assign PRM permissions to BD_MEMBER
    bd_role = db.query(Role).filter(Role.id == "BD_MEMBER").first()
    bd_perms = [p for p in all_perms if p.id in ["partner:read", "partner:write", "contract:read", "contract:draft"]]
    bd_role.permissions = bd_perms

    # Create default test admin user
    if not db.query(User).filter(User.email == "admin@aiesec.org.ma").first():
        admin_user = User(
            email="admin@aiesec.org.ma",
            password_hash=get_password_hash("AdminSecret123"),
            full_name="Admin Rabat",
            is_active=True,
        )
        db.add(admin_user)
        db.flush()
        db.add(UserRoleAssignment(user_id=admin_user.id, role_id="LCP_ADMIN"))

    # Create default test BD user
    if not db.query(User).filter(User.email == "bd@aiesec.org.ma").first():
        bd_user = User(
            email="bd@aiesec.org.ma",
            password_hash=get_password_hash("PartnerSecret123"),
            full_name="BD Specialist",
            is_active=True,
        )
        db.add(bd_user)
        db.flush()
        db.add(UserRoleAssignment(user_id=bd_user.id, role_id="BD_MEMBER"))

    db.commit()
    db.close()

    yield

    Base.metadata.drop_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
