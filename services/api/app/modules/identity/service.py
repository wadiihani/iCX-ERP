from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from app.core.security import verify_password, get_password_hash
from app.modules.identity.models import User, Role, Permission, UserRoleAssignment, AuditLog
from app.modules.identity.schemas import UserCreate


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email.lower()).first()


def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def get_user_roles_and_permissions(db: Session, user: User) -> Tuple[List[str], List[str]]:
    role_ids = []
    permissions_set = set()
    
    for assignment in user.roles:
        role = assignment.role
        if role:
            role_ids.append(role.id)
            for perm in role.permissions:
                permissions_set.add(perm.id)
                
    return role_ids, sorted(list(permissions_set))


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def create_user(db: Session, user_in: UserCreate, actor_id: Optional[str] = None) -> User:
    user = User(
        email=user_in.email.lower(),
        password_hash=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        phone=user_in.phone,
        is_active=True,
    )
    db.add(user)
    db.flush()

    for role_id in user_in.roles:
        role = db.query(Role).filter(Role.id == role_id).first()
        if role:
            assignment = UserRoleAssignment(user_id=user.id, role_id=role.id)
            db.add(assignment)

    create_audit_log(
        db=db,
        actor_id=actor_id,
        actor_role="SYSTEM" if not actor_id else None,
        action="CREATE_USER",
        entity_type="USER",
        entity_id=user.id,
        after_state={"email": user.email, "full_name": user.full_name, "roles": user_in.roles},
    )

    db.commit()
    db.refresh(user)
    return user


def create_audit_log(
    db: Session,
    action: str,
    entity_type: str,
    entity_id: str,
    actor_id: Optional[str] = None,
    actor_role: Optional[str] = None,
    before_state: Optional[dict] = None,
    after_state: Optional[dict] = None,
    ip_address: Optional[str] = None,
    correlation_id: Optional[str] = None,
) -> AuditLog:
    log = AuditLog(
        actor_id=actor_id,
        actor_role=actor_role,
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id),
        before_state=before_state,
        after_state=after_state,
        ip_address=ip_address,
        correlation_id=correlation_id,
    )
    db.add(log)
    db.flush()
    return log
