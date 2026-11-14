from datetime import datetime, date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field, EmailStr


class EPDocumentBase(BaseModel):
    doc_type: str = Field(..., pattern="^(CV|PASSPORT_COPY|LANGUAGE_CERT|STUDENT_PROOF|ACCEPTANCE_NOTE)$")
    file_name: str
    file_size_bytes: int = 0
    mime_type: str
    storage_path: str
    is_verified: bool = False


class EPDocumentCreate(EPDocumentBase):
    pass


class EPDocumentResponse(EPDocumentBase):
    id: str
    ep_id: str
    uploaded_by: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EPBase(BaseModel):
    expa_person_id: Optional[str] = None
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    country_of_residence: str = Field(..., min_length=2, max_length=100)
    nationality: str = Field(..., min_length=2, max_length=100)
    home_mc: Optional[str] = None
    home_lc: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    passport_number: Optional[str] = None
    cv_url: Optional[str] = None
    product_interests: str = "iGV,iGTa,iGTe"
    notes: Optional[str] = None


class EPCreate(EPBase):
    pass


class EPUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    country_of_residence: Optional[str] = None
    nationality: Optional[str] = None
    home_mc: Optional[str] = None
    home_lc: Optional[str] = None
    passport_number: Optional[str] = None
    cv_url: Optional[str] = None
    product_interests: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class EPResponse(EPBase):
    id: str
    status: str
    created_at: datetime
    updated_at: datetime
    documents: List[EPDocumentResponse] = []

    model_config = ConfigDict(from_attributes=True)


class BulkImportReport(BaseModel):
    total_rows: int
    valid_count: int
    invalid_count: int
    duplicate_count: int
    errors: List[Dict[str, Any]]
    warnings: List[str]
    sample_preview: List[Dict[str, Any]]
    is_dry_run: bool
