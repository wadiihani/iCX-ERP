from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict, Field


class ContactBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    job_title: Optional[str] = Field(None, max_length=150)
    department: Optional[str] = Field(None, max_length=100)
    is_primary: bool = False
    notes: Optional[str] = None


class ContactCreate(ContactBase):
    pass


class ContactUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    job_title: Optional[str] = Field(None, max_length=150)
    department: Optional[str] = Field(None, max_length=100)
    is_primary: Optional[bool] = None
    notes: Optional[str] = None


class ContactResponse(ContactBase):
    id: str
    organization_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrganizationBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    legal_name: Optional[str] = Field(None, max_length=255)
    sector: str = Field("Other", max_length=100)
    org_type: str = Field("Company", max_length=100)
    website: Optional[str] = Field(None, max_length=255)
    location: str = Field("Rabat, Morocco", max_length=255)
    address: Optional[str] = None
    tax_id: Optional[str] = Field(None, max_length=100)
    verification_status: str = Field("UNVERIFIED", max_length=50)
    is_prohibited: bool = False
    prohibition_reason: Optional[str] = None
    status: str = Field("LEAD", max_length=50)
    relationship_health: str = Field("GOOD", max_length=50)
    account_manager_id: Optional[str] = None


class OrganizationCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    legal_name: Optional[str] = None
    sector: str = "Other"
    org_type: str = "Company"
    website: Optional[str] = None
    location: str = "Rabat, Morocco"
    address: Optional[str] = None
    tax_id: Optional[str] = None
    status: str = "LEAD"
    account_manager_id: Optional[str] = None
    contacts: Optional[List[ContactCreate]] = None


class OrganizationUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    legal_name: Optional[str] = None
    sector: Optional[str] = None
    org_type: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    tax_id: Optional[str] = None
    verification_status: Optional[str] = None
    is_prohibited: Optional[bool] = None
    prohibition_reason: Optional[str] = None
    status: Optional[str] = None
    relationship_health: Optional[str] = None
    account_manager_id: Optional[str] = None


class OrganizationResponse(OrganizationBase):
    id: str
    created_at: datetime
    updated_at: datetime
    contacts: List[ContactResponse] = []

    model_config = ConfigDict(from_attributes=True)
