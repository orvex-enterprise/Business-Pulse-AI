from typing import Dict, Any

async def run_stock_analysis() -> Dict[str, Any]:
    return {
        "ticker": "AAPL",
        "action": "Hold",
        "reason": "Stable supply chain, awaiting new product cycle.",
        "confidence": 85,
        "risk": "Low",
        "suggested_allocation": "15%"
    }
