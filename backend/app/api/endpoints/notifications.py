from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class SettingsUpdate(BaseModel):
    whatsapp: bool
    telegram: bool
    email: bool

@router.get("/")
def get_notifications():
    return [
        {"title": "Inventory Critical", "priority": "CRITICAL", "channel": "WhatsApp"}
    ]

@router.post("/settings")
def update_settings(settings: SettingsUpdate):
    return {"status": "success"}
