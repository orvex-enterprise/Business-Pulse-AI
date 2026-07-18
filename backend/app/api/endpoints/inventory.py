from fastapi import APIRouter
from app.agents.inventory_agent import run_inventory_analysis

router = APIRouter()

@router.get("/recommendations")
async def get_recommendations():
    return await run_inventory_analysis()

@router.get("/alerts")
def get_alerts():
    return [
        {
            "severity": "critical",
            "message": "Stock will finish within 2 days.",
            "recommendation": "Order 500 units."
        }
    ]
