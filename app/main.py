from fastapi import FastAPI

# TODO: Import routers from modules once they are created
# from app.identity.router import router as identity_router
# from app.assets.router import router as assets_router
# from app.operations.router import router as operations_router
# from app.insights.router import router as insights_router

app = FastAPI(
    title="AssetFlow API",
    description="Backend API for AssetFlow project",
    version="1.0.0",
)

# app.include_router(identity_router, prefix="/api/v1/identity", tags=["Identity"])
# app.include_router(assets_router, prefix="/api/v1/assets", tags=["Assets"])
# app.include_router(operations_router, prefix="/api/v1/operations", tags=["Operations"])
# app.include_router(insights_router, prefix="/api/v1/insights", tags=["Insights"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
