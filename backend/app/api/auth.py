from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
import google.auth.transport.requests
import requests
import json
from app.core import security
from app.api import deps

router = APIRouter()

SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/userinfo.email',
    'openid'
]

def create_flow():
    # In production, you might load client_config from a file or env vars constructed dict
    # For now, we assume we can construct it or load from a secrets file.
    # To keep it simple, we will use the client_config dict approach if variables are usually available
    # But standard Google library expects a json file. 
    # Let's assume the user has 'client_secrets.json' or we construct it.
    
    # Constructing client config from env vars for 12-factor app compliance
    client_config = {
        "web": {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [settings.GOOGLE_REDIRECT_URI]
        }
    }
    
    flow = Flow.from_client_config(
        client_config,
        scopes=SCOPES,
        redirect_uri=settings.GOOGLE_REDIRECT_URI
    )
    return flow

@router.get("/login")
def login():
    if not settings:
        raise HTTPException(status_code=500, detail="Configuration not loaded")
    
    flow = create_flow()
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    # Store state in session if we had one, for now stateless redirection
    return {"url": authorization_url}

@router.get("/callback")
def callback(code: str, db: Session = Depends(get_db)):
    try:
        flow = create_flow()
        flow.fetch_token(code=code)
        
        creds = flow.credentials
        
        # Fetch User Info
        user_info_service = requests.get(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            headers={'Authorization': f'Bearer {creds.token}'}
        ).json()
        
        email = user_info_service.get('email')
        google_sub = user_info_service.get('id')
        
        if not email:
            raise HTTPException(status_code=400, detail="Could not retrieve email from Google")

        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            user = User(
                email=email,
                google_sub=google_sub,
                access_token=creds.token,
                refresh_token=creds.refresh_token,
            )
            db.add(user)
        else:
            user.access_token = creds.token
            if creds.refresh_token:
                user.refresh_token = creds.refresh_token
        
        db.commit()
        db.refresh(user)
        
        
        access_token = security.create_access_token(subject=user.id)
        
        frontend_url = settings.FRONTEND_URL
        return RedirectResponse(
            url=f"{frontend_url}/auth/callback?token={access_token}&email={user.email}"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Auth Failed: {str(e)}")
