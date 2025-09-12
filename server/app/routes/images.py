from fastapi import APIRouter, HTTPException, Depends, Form, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.generated_image import GeneratedImage as GeneratedImageModel
from app.models.user import User
from app.schemas import GeneratedImageCreate, GeneratedImage as GeneratedImageSchema
from app.services.image_service import generate_images, enhance_prompt
from app.utils.auth import verify_access_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uuid
import json
from datetime import datetime

router = APIRouter()
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """Get current user from access token"""
    token = credentials.credentials
    user_id = verify_access_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get the user object to return the user_id field
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user.user_id

@router.post("/generate", response_model=GeneratedImageSchema)
async def generate_image(
    prompt: str = Form(...),
    category: str = Form(None),
    force: bool = Form(False),  # Add force parameter
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Only check for existing images if not forcing regeneration
        if not force:
            existing_image = db.query(GeneratedImageModel).filter(
                GeneratedImageModel.user_id == user_id,
                GeneratedImageModel.original_prompt == prompt,
                GeneratedImageModel.is_deleted == False
            ).first()
            
            if existing_image:
                print(f"Returning existing images for prompt: {prompt}")
                return existing_image
        
        # Generate new images (limit to 4 images)
        image_urls, enhanced_prompt = await generate_images(prompt, num_images=4)
        
        # Create database entry
        image_data = GeneratedImageCreate(
            user_id=user_id,
            original_prompt=prompt,
            enhanced_prompt=enhanced_prompt,  # Save the enhanced prompt
            image_urls=image_urls,
            category=category
        )
        
        db_image = GeneratedImageModel(
            id=str(uuid.uuid4()),
            **image_data.dict(),
            created_at=datetime.utcnow(),  # Explicitly set created_at
            is_deleted=False  # Explicitly set is_deleted
        )
        db.add(db_image)
        db.commit()
        db.refresh(db_image)
        
        print(f"Created new images for prompt: {prompt}")
        return db_image
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image generation failed: {str(e)}"
        )

@router.get("/history", response_model=list[GeneratedImageSchema])
async def get_image_history(
    user_id: str = Depends(get_current_user),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get user's image generation history"""
    images = db.query(GeneratedImageModel).filter(
        GeneratedImageModel.user_id == user_id,
        GeneratedImageModel.is_deleted == False
    ).order_by(GeneratedImageModel.created_at.desc()).offset(skip).limit(limit).all()
    return images

@router.delete("/{image_id}")
async def delete_generated_image(
    image_id: str,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Soft delete a generated image"""
    image = db.query(GeneratedImageModel).filter(
        GeneratedImageModel.id == image_id,
        GeneratedImageModel.user_id == user_id
    ).first()
    
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    image.is_deleted = True
    db.commit()
    
    return {"message": "Image deleted successfully"}
