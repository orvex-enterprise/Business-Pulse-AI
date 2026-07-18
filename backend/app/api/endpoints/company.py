from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class CompanyCreate(BaseModel):
    name: str
    industry: str
    country: str

@router.post("/create")
def create_company(company: CompanyCreate):
    return {"status": "success", "data": company}

@router.put("/update")
def update_company(company: CompanyCreate):
    return {"status": "success", "data": company}
