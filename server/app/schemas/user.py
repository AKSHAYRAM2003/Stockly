from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    name: Optional[str] = None
    avatar_url: Optional[str] = None

class User(UserBase):
    id: str
    user_id: str
    google_id: Optional[str] = None
    is_verified: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class OAuthCallbackRequest(BaseModel):
    code: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    sub: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
