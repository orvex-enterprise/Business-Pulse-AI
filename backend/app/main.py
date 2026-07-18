from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import auth, inventory, trends, stocks, notifications, company

app = FastAPI(title="Business Pulse AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(company.router, prefix="/api/company", tags=["Company"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["Inventory"])
app.include_router(trends.router, prefix="/api/trends", tags=["Trends"])
app.include_router(stocks.router, prefix="/api/stocks", tags=["Stocks"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])

@app.get("/health")
def health_check():
    return {"status": "healthy"}
