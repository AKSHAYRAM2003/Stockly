from fastapi import APIRouter, HTTPException, Depends, Form, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.generated_image import GeneratedImage
from app.schemas import GeneratedImageCreate, GeneratedImage
from app.services.image_service import generate_images
from app.utils.auth import verify_access_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uuid

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
    return user_id

@router.post("/generate", response_model=GeneratedImage)
async def generate_image(
    prompt: str = Form(...),
    category: str = Form(None),
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Generate images using Google Imagen
        image_urls = await generate_images(prompt)
        
        # Create database entry
        image_data = GeneratedImageCreate(
            user_id=user_id,
            original_prompt=prompt,
            enhanced_prompt=None,  # TODO: Implement prompt enhancement
            image_urls=image_urls,
            category=category
        )
        
        db_image = GeneratedImage(
            id=str(uuid.uuid4()),
            **image_data.dict()
        )
        db.add(db_image)
        db.commit()
        db.refresh(db_image)
        
        return db_image
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image generation failed: {str(e)}"
        )

@router.get("/history", response_model=list[GeneratedImage])
async def get_image_history(
    user_id: str = Depends(get_current_user),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get user's image generation history"""
    images = db.query(GeneratedImage).filter(
        GeneratedImage.user_id == user_id,
        GeneratedImage.is_deleted == False
    ).order_by(GeneratedImage.created_at.desc()).offset(skip).limit(limit).all()
    return images

@router.delete("/{image_id}")
async def delete_generated_image(
    image_id: str,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Soft delete a generated image"""
    image = db.query(GeneratedImage).filter(
        GeneratedImage.id == image_id,
        GeneratedImage.user_id == user_id
    ).first()
    
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    image.is_deleted = True
    db.commit()
    
    return {"message": "Image deleted successfully"}
