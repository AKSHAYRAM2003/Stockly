#!/usr/bin/env python3
"""
Database initialization script for Stockly
Creates all database tables
"""

from app.database import engine, Base
from app.models.user import User
from app.models.generated_image import GeneratedImage
from sqlalchemy import text

def init_database():
    """Initialize database tables"""
    try:
        print("Creating database tables...")
        
        # Drop existing tables if they exist (for development)
        print("Dropping existing tables...")
        with engine.connect() as conn:
            conn.execute(text("DROP TABLE IF EXISTS generated_images"))
            conn.execute(text("DROP TABLE IF EXISTS users"))
            conn.commit()
        
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        print("\nCreated tables:")
        print("- users")
        print("- generated_images")
    except Exception as e:
        print(f"❌ Failed to create database tables: {e}")
        print("\nMake sure:")
        print("1. Your database is running")
        print("2. DATABASE_URL in .env is correct")
        print("3. Database user has create permissions")

if __name__ == "__main__":
    init_database()
