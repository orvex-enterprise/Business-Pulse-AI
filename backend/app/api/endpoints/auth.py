from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import jwt
from datetime import datetime, timedelta
import os

router = APIRouter()

SECRET_KEY = os.getenv("JWT_SECRET", "supersecretkey")
ALGORITHM = "HS256"

class LoginRequest(BaseModel):
    email: str

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/login")
def login(request: LoginRequest):
    allowed_domains = ["admin.com", "company.com"]
    domain = request.email.split("@")[-1]
    
    if domain in allowed_domains or request.email == "admin@pulse.ai":
        role = "Super Admin" if "admin" in request.email else "Company Admin"
        token = create_access_token({"sub": request.email, "role": role})
        return {
            "token": token,
            "user": {
                "email": request.email,
                "role": role,
                "name": request.email.split("@")[0]
            }
        }
    raise HTTPException(status_code=403, detail="Unauthorized")
