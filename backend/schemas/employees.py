from typing import Optional
from pydantic import BaseModel, ConfigDict


class EmployeesByHashesRequest(BaseModel):
    hashesMd5: list[str]
    includePhoto: Optional[bool] = False


class EmployeePhotoResponse(BaseModel):
    model_config = ConfigDict(extra="allow")

    photoWebp50: Optional[str] = None
    photoWebp50sha256: Optional[str] = None
    photoWebp300: Optional[str] = None
    photoJpg300sha256: Optional[str] = None
    photoWebp200: Optional[str] = None
    photoWebp200Sha256: Optional[str] = None


class EmployeeResponse(BaseModel):
    model_config = ConfigDict(extra="allow")

    hashMd5: str
    fullName: Optional[str] = None
    jobTitle: Optional[str] = None
    department: Optional[str] = None
    division: Optional[str] = None
    login: Optional[str] = None
    workingNowStatus: Optional[str] = None
    employeePhoto: Optional[EmployeePhotoResponse] = None
