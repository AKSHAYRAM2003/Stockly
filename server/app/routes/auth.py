from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas import UserCreate, Token, User as UserSchema, LoginRequest
from app.utils.auth import create_access_token, create_refresh_token, verify_access_token, verify_refresh_token, hash_password, verify_password
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import requests
import os
from dotenv import load_dotenv
from typing import Dict
import uuid

load_dotenv()

router = APIRouter()
security = HTTPBearer()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:3000/auth/callback")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    user_id = verify_access_token(token)  # Use access token for user verification
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user_id

@router.get("/google/url")
async def get_google_auth_url():
    """Get Google OAuth authorization URL"""
    auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={GOOGLE_CLIENT_ID}&"
        "response_type=code&"
        "scope=openid%20email%20profile&"
        f"redirect_uri={GOOGLE_REDIRECT_URI}&"
        "access_type=offline&"
        "prompt=consent"
    )
    return {"auth_url": auth_url}

@router.post("/google/callback", response_model=Dict[str, str])
async def google_oauth_callback(code: str, db: Session = Depends(get_db)):
    """Handle Google OAuth callback"""
    try:
        # Exchange authorization code for access token
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": GOOGLE_REDIRECT_URI
        }
        
        token_response = requests.post(token_url, data=data)
        token_response.raise_for_status()
        token_data = token_response.json()
        
        # Get user info from Google
        user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        headers = {"Authorization": f"Bearer {token_data['access_token']}"}
        
        user_response = requests.get(user_info_url, headers=headers)
        user_response.raise_for_status()
        user_data = user_response.json()
        
        # Check if user exists, create if not
        user = db.query(User).filter(User.google_id == user_data["id"]).first()
        if not user:
            # Parse name into first and last name
            full_name = user_data["name"]
            name_parts = full_name.split(" ", 1)
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ""
            
            user = User(
                id=user_data["id"],
                google_id=user_data["id"],
                email=user_data["email"],
                first_name=first_name,
                last_name=last_name,
                name=full_name,
                avatar_url=user_data.get("picture")
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Create tokens
        access_token = create_access_token(data={"sub": user.id})
        refresh_token = create_refresh_token(data={"sub": user.id})
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
        
    except requests.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"OAuth authentication failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication error: {str(e)}"
        )

@router.post("/refresh", response_model=Dict[str, str])
async def refresh_access_token(refresh_token: str, db: Session = Depends(get_db)):
    """Refresh access token using refresh token"""
    user_id = verify_refresh_token(refresh_token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Verify user still exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Create new access token
    access_token = create_access_token(data={"sub": user_id})
    new_refresh_token = create_refresh_token(data={"sub": user_id})
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserSchema)
async def get_current_user_profile(current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get current user profile"""
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.post("/register", response_model=UserSchema)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user with email and password"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash the password
    hashed_password = hash_password(user_data.password)
    
    # Create new user
    new_user = User(
        id=str(uuid.uuid4()),
        email=user_data.email,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        name=f"{user_data.first_name} {user_data.last_name}",
        password_hash=hashed_password,
        avatar_url=user_data.avatar_url
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/login", response_model=Token)
async def login_user(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login user with email and password"""
    # Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create tokens
    access_token = create_access_token(data={"sub": user.id})
    refresh_token = create_refresh_token(data={"sub": user.id})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/logout")
async def logout():
    """Logout endpoint (client should discard tokens)"""
    return {"message": "Successfully logged out"}
