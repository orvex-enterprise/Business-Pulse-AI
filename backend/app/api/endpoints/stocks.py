from fastapi import APIRouter
from app.agents.stock_agent import run_stock_analysis

router = APIRouter()

@router.get("/recommendations")
async def get_stock_recommendations():
    return await run_stock_analysis()
