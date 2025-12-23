import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AutoGmail SaaS"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str
    
    # GROQ
    GROQ_API_KEY: str

    # Google Auth
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str = "https://hardikjain0083-email-rag.hf.space/api/v1/auth/callback"
    FRONTEND_URL: str = "https://email-rag-gilt.vercel.app"  # Frontend URL for OAuth callback
    
    # Database
    DATABASE_URL: str = "sqlite:///./autogmail.db"

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(__file__), "../../.env"), 
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
