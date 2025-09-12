# Pydantic schemas

from pydantic import BaseModel, field_validator
from typing import List, Optional
from datetime import datetime
import json

# Import from user.py
from .user import UserBase, UserCreate, UserUpdate, User, Token, TokenData, LoginRequest, OAuthCallbackRequest

class GeneratedImageBase(BaseModel):
    original_prompt: str
    enhanced_prompt: Optional[str] = None
    image_urls: List[str]
    category: Optional[str] = None

class GeneratedImageCreate(GeneratedImageBase):
    user_id: str

class GeneratedImage(GeneratedImageBase):
    id: str
    user_id: str
    created_at: datetime
    is_deleted: bool

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

    @field_validator('image_urls', mode='before')
    @classmethod
    def parse_image_urls(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return []
        return v if isinstance(v, list) else []

class GoogleAuthRequest(BaseModel):
    code: str
