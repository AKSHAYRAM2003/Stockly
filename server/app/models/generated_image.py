from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import json

class GeneratedImage(Base):
    __tablename__ = "generated_images"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    original_prompt = Column(Text)
    enhanced_prompt = Column(Text, nullable=True)
    image_urls = Column(Text)  # JSON string
    category = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_deleted = Column(Boolean, default=False)

    user = relationship("User", back_populates="images")

    @property
    def image_urls_list(self):
        return json.loads(self.image_urls) if self.image_urls else []

    @image_urls_list.setter
    def image_urls_list(self, value):
        self.image_urls = json.dumps(value)
