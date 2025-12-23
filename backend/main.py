from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.models import user # Import models to register them
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AutoGmail SaaS API", version="0.1.0")

# CORS Setup
# Allow origins from environment variable or use defaults
cors_origins_env = os.getenv("CORS_ORIGINS", "")
if cors_origins_env:
    origins = [origin.strip() for origin in cors_origins_env.split(",")]
else:
    origins = [
        "http://localhost:3000",
        "http://localhost:5173", # Vite default
        "http://localhost:8080", # Frontend port
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "AutoGmail API is running"}

from app.api import auth, gmail, documents, generate
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(gmail.router, prefix="/api/v1/gmail", tags=["gmail"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["documents"])
app.include_router(generate.router, prefix="/api/v1/generate", tags=["generate"])
