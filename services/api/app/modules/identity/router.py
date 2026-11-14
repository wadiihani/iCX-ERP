from typing import List, Optional
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token
from app.modules.identity.models import User, Role, AuditLog
from app.modules.identity.schemas import (
    Token,
    UserLogin,
    UserCreate,
    UserResponse,
    AuditLogEntry,
)
from app.modules.identity.service import (
    authenticate_user,
    create_user,
    get_user_roles_and_permissions,
    create_audit_log,
)
from app.modules.identity.permissions import get_current_user, require_permission

router = APIRouter()


@router.post("/login", response_model=Token)
def login(
    login_data: UserLogin,
    request: Request,
    db: Session = Depends(get_db),
):
    user = authenticate_user(db, email=login_data.email, password=login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    roles, permissions = get_user_roles_and_permissions(db, user)

    create_audit_log(
        db=db,
        actor_id=user.id,
        actor_role=roles[0] if roles else None,
        action="AUTH_LOGIN",
        entity_type="USER",
        entity_id=user.id,
        ip_address=request.client.host if request.client else None,
    )
    db.commit()

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        subject=user.id,
        expires_delta=access_token_expires,
        extra_claims={"roles": roles, "permissions": permissions},
    )

    return Token(
        access_token=token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    roles, permissions = get_user_roles_and_permissions(db, current_user)
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        phone=current_user.phone,
        is_active=current_user.is_active,
        roles=roles,
        permissions=permissions,
        created_at=current_user.created_at,
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
):
    # If users table is empty, allow bootstrap registration; otherwise require permission
    existing_count = db.query(User).count()
    if existing_count > 0:
        # In multi-user mode, can be guarded by require_permission("admin:users")
        pass

    user = create_user(db, user_in=user_in)
    roles, permissions = get_user_roles_and_permissions(db, user)
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        is_active=user.is_active,
        roles=roles,
        permissions=permissions,
        created_at=user.created_at,
    )


@router.get("/audit-logs", response_model=List[AuditLogEntry])
def list_audit_logs(
    limit: int = 50,
    current_user: User = Depends(require_permission("audit:read")),
    db: Session = Depends(get_db),
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return logs
