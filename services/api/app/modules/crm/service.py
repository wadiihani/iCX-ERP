import csv
import io
import re
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.modules.crm.models import ExchangeParticipant, EPDocument
from app.modules.crm.schemas import EPCreate, EPUpdate, BulkImportReport


def mask_string(val: Optional[str], show_last: int = 4) -> Optional[str]:
    if not val:
        return val
    cleaned = str(val).strip()
    if len(cleaned) <= show_last:
        return "*" * len(cleaned)
    masked_len = len(cleaned) - show_last
    return ("*" * masked_len) + cleaned[-show_last:]


def mask_phone(phone: Optional[str]) -> Optional[str]:
    if not phone:
        return phone
    # Preserve country code prefix e.g. +212, mask middle digits
    cleaned = str(phone).strip()
    if len(cleaned) < 6:
        return "******"
    if cleaned.startswith("+"):
        prefix = cleaned[:4]
        suffix = cleaned[-2:]
        return f"{prefix} *** *** {suffix}"
    return f"*** *** {cleaned[-2:]}"


def sanitize_ep_for_role(ep_dict: Dict[str, Any], has_pii_permission: bool) -> Dict[str, Any]:
    if has_pii_permission:
        return ep_dict

    sanitized = dict(ep_dict)
    if sanitized.get("passport_number"):
        sanitized["passport_number"] = mask_string(sanitized["passport_number"], show_last=4)
    if sanitized.get("phone"):
        sanitized["phone"] = mask_phone(sanitized["phone"])
    return sanitized


class CRMService:
    @staticmethod
    def get_eps(
        db: Session,
        has_pii_permission: bool,
        country: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        query = db.query(ExchangeParticipant)
        if country:
            query = query.filter(ExchangeParticipant.country_of_residence.ilike(f"%{country}%"))
        if search:
            query = query.filter(
                (ExchangeParticipant.first_name.ilike(f"%{search}%"))
                | (ExchangeParticipant.last_name.ilike(f"%{search}%"))
                | (ExchangeParticipant.email.ilike(f"%{search}%"))
                | (ExchangeParticipant.expa_person_id.ilike(f"%{search}%"))
            )

        eps = query.order_by(ExchangeParticipant.created_at.desc()).offset(offset).limit(limit).all()
        results = []
        for ep in eps:
            d = {
                "id": ep.id,
                "expa_person_id": ep.expa_person_id,
                "first_name": ep.first_name,
                "last_name": ep.last_name,
                "email": ep.email,
                "phone": ep.phone,
                "country_of_residence": ep.country_of_residence,
                "nationality": ep.nationality,
                "home_mc": ep.home_mc,
                "home_lc": ep.home_lc,
                "date_of_birth": ep.date_of_birth,
                "gender": ep.gender,
                "passport_number": ep.passport_number,
                "cv_url": ep.cv_url,
                "status": ep.status,
                "product_interests": ep.product_interests,
                "notes": ep.notes,
                "created_at": ep.created_at,
                "updated_at": ep.updated_at,
                "documents": [
                    {
                        "id": doc.id,
                        "ep_id": doc.ep_id,
                        "doc_type": doc.doc_type,
                        "file_name": doc.file_name,
                        "file_size_bytes": doc.file_size_bytes,
                        "mime_type": doc.mime_type,
                        "storage_path": doc.storage_path,
                        "is_verified": doc.is_verified,
                        "uploaded_by": doc.uploaded_by,
                        "created_at": doc.created_at,
                    }
                    for doc in ep.documents
                ],
            }
            results.append(sanitize_ep_for_role(d, has_pii_permission))
        return results

    @staticmethod
    def get_ep_by_id(db: Session, ep_id: str, has_pii_permission: bool) -> Dict[str, Any]:
        ep = db.query(ExchangeParticipant).filter(ExchangeParticipant.id == ep_id).first()
        if not ep:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"EP with id {ep_id} not found")

        d = {
            "id": ep.id,
            "expa_person_id": ep.expa_person_id,
            "first_name": ep.first_name,
            "last_name": ep.last_name,
            "email": ep.email,
            "phone": ep.phone,
            "country_of_residence": ep.country_of_residence,
            "nationality": ep.nationality,
            "home_mc": ep.home_mc,
            "home_lc": ep.home_lc,
            "date_of_birth": ep.date_of_birth,
            "gender": ep.gender,
            "passport_number": ep.passport_number,
            "cv_url": ep.cv_url,
            "status": ep.status,
            "product_interests": ep.product_interests,
            "notes": ep.notes,
            "created_at": ep.created_at,
            "updated_at": ep.updated_at,
            "documents": [
                {
                    "id": doc.id,
                    "ep_id": doc.ep_id,
                    "doc_type": doc.doc_type,
                    "file_name": doc.file_name,
                    "file_size_bytes": doc.file_size_bytes,
                    "mime_type": doc.mime_type,
                    "storage_path": doc.storage_path,
                    "is_verified": doc.is_verified,
                    "uploaded_by": doc.uploaded_by,
                    "created_at": doc.created_at,
                }
                for doc in ep.documents
            ],
        }
        return sanitize_ep_for_role(d, has_pii_permission)

    @staticmethod
    def check_duplicate(
        db: Session, email: str, expa_person_id: Optional[str] = None
    ) -> Optional[ExchangeParticipant]:
        # Check email
        existing = db.query(ExchangeParticipant).filter(ExchangeParticipant.email.ilike(email)).first()
        if existing:
            return existing
        if expa_person_id:
            existing_expa = (
                db.query(ExchangeParticipant)
                .filter(ExchangeParticipant.expa_person_id == expa_person_id)
                .first()
            )
            if existing_expa:
                return existing_expa
        return None

    @staticmethod
    def create_ep(db: Session, payload: EPCreate) -> ExchangeParticipant:
        dup = CRMService.check_duplicate(db, email=payload.email, expa_person_id=payload.expa_person_id)
        if dup:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Duplicate EP candidate detected: existing profile with email '{payload.email}' or EXPA ID '{payload.expa_person_id}' (ID: {dup.id})",
            )

        ep = ExchangeParticipant(
            expa_person_id=payload.expa_person_id,
            first_name=payload.first_name,
            last_name=payload.last_name,
            email=payload.email.lower().strip(),
            phone=payload.phone,
            country_of_residence=payload.country_of_residence,
            nationality=payload.nationality,
            home_mc=payload.home_mc,
            home_lc=payload.home_lc,
            date_of_birth=payload.date_of_birth,
            gender=payload.gender,
            passport_number=payload.passport_number,
            cv_url=payload.cv_url,
            product_interests=payload.product_interests,
            notes=payload.notes,
        )
        db.add(ep)
        db.commit()
        db.refresh(ep)
        return ep

    @staticmethod
    def parse_and_validate_csv(
        db: Session, csv_content: str, is_dry_run: bool = True
    ) -> BulkImportReport:
        f = io.StringIO(csv_content)
        reader = csv.DictReader(f)
        
        # Check header normalization
        headers = [h.strip() for h in (reader.fieldnames or [])]
        
        total_rows = 0
        valid_rows: List[Dict[str, Any]] = []
        errors: List[Dict[str, Any]] = []
        warnings: List[str] = []
        duplicate_count = 0

        # Mapping variations for standard EXPA or spreadsheet exports
        field_mappings = {
            "first_name": ["first_name", "first name", "firstname", "given name"],
            "last_name": ["last_name", "last name", "lastname", "surname", "family name"],
            "email": ["email", "email address", "e-mail"],
            "phone": ["phone", "mobile", "telephone", "phone number"],
            "country_of_residence": ["country_of_residence", "country", "residence country", "current country"],
            "nationality": ["nationality", "citizenship"],
            "home_mc": ["home_mc", "mc", "home mc", "member committee"],
            "home_lc": ["home_lc", "lc", "home lc", "local committee"],
            "expa_person_id": ["expa_person_id", "expa id", "person id", "expa_id"],
            "passport_number": ["passport_number", "passport", "passport no"],
        }

        def resolve_col(row: Dict[str, str], target_field: str) -> Optional[str]:
            for candidate in field_mappings.get(target_field, []):
                for k, v in row.items():
                    if k and k.strip().lower() == candidate:
                        return v.strip() if v else None
            return None

        seen_emails_in_batch = set()

        for idx, row in enumerate(reader, start=1):
            total_rows += 1
            first_name = resolve_col(row, "first_name")
            last_name = resolve_col(row, "last_name")
            email = resolve_col(row, "email")
            country = resolve_col(row, "country_of_residence")
            nationality = resolve_col(row, "nationality") or country

            row_errors = []
            if not first_name:
                row_errors.append("Missing required 'first_name'")
            if not last_name:
                row_errors.append("Missing required 'last_name'")
            if not email or "@" not in email:
                row_errors.append("Missing or invalid 'email'")
            if not country:
                row_errors.append("Missing required 'country_of_residence'")

            if email:
                norm_email = email.lower().strip()
                if norm_email in seen_emails_in_batch:
                    row_errors.append(f"Duplicate email '{norm_email}' within the import file")
                    duplicate_count += 1
                else:
                    seen_emails_in_batch.add(norm_email)

                # Check against database
                expa_id = resolve_col(row, "expa_person_id")
                dup_in_db = CRMService.check_duplicate(db, email=norm_email, expa_person_id=expa_id)
                if dup_in_db:
                    row_errors.append(f"Candidate already exists in database (ID: {dup_in_db.id})")
                    duplicate_count += 1

            if row_errors:
                errors.append({"row": idx, "email": email or "N/A", "errors": row_errors})
            else:
                valid_rows.append(
                    {
                        "first_name": first_name,
                        "last_name": last_name,
                        "email": email.lower().strip(),
                        "phone": resolve_col(row, "phone"),
                        "country_of_residence": country,
                        "nationality": nationality,
                        "home_mc": resolve_col(row, "home_mc"),
                        "home_lc": resolve_col(row, "home_lc"),
                        "expa_person_id": resolve_col(row, "expa_person_id"),
                        "passport_number": resolve_col(row, "passport_number"),
                    }
                )

        if not is_dry_run and valid_rows:
            # Commit valid rows to DB
            for item in valid_rows:
                ep = ExchangeParticipant(
                    first_name=item["first_name"],
                    last_name=item["last_name"],
                    email=item["email"],
                    phone=item["phone"],
                    country_of_residence=item["country_of_residence"],
                    nationality=item["nationality"],
                    home_mc=item["home_mc"],
                    home_lc=item["home_lc"],
                    expa_person_id=item["expa_person_id"],
                    passport_number=item["passport_number"],
                )
                db.add(ep)
            db.commit()

        return BulkImportReport(
            total_rows=total_rows,
            valid_count=len(valid_rows),
            invalid_count=len(errors),
            duplicate_count=duplicate_count,
            errors=errors,
            warnings=warnings,
            sample_preview=valid_rows[:5],
            is_dry_run=is_dry_run,
        )
