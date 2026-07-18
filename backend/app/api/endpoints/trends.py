from fastapi import APIRouter
from app.agents.trend_agent import run_trend_analysis

router = APIRouter()

@router.get("/")
def get_trends():
    return [
        {
            "trend": "Protein Coffee",
            "confidence": 92,
            "recommendation": "Add to inventory."
        }
    ]

@router.get("/recommendations")
async def get_trend_recommendations():
    return await run_trend_analysis()
