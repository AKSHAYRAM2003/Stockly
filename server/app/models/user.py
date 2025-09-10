from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True)
    google_id = Column(String, unique=True, index=True, nullable=True)
    email = Column(String, unique=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    name = Column(String)  # Keep for backward compatibility
    password_hash = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    images = relationship("GeneratedImage", back_populates="user")
