import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.assets.router import router as assets_router
from app.config import settings
from app.database import Base, engine
from app.identity.router import router as identity_router
from app.operations.router import router as operations_router

# Import models so declarative Base registers tables
import app.identity.models  # noqa: F401
import app.assets.models  # noqa: F401
import app.operations.models  # noqa: F401

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AssetFlow ERP — Centralized Asset & Resource Management System API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(operations_router, prefix="/api/v1/operations", tags=["Operations"])
app.include_router(identity_router, prefix="/api/v1/identity", tags=["Identity"])
app.include_router(assets_router, prefix="/api/v1/assets", tags=["Assets"])


@app.get("/health", tags=["Health Check"])
def health_check():
    return {
        "status": "ok",
        "system": settings.PROJECT_NAME,
        "version": "1.0.0",
    }


# Mount Frontend Portal
frontend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend")
if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
