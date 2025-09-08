#!/usr/bin/env python3
"""
Test script for Stockly API authentication
Run this to test the OAuth and JWT functionality
"""

import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Health Check: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_google_auth_url():
    """Test getting Google auth URL"""
    try:
        response = requests.get(f"{BASE_URL}/api/auth/google/url")
        if response.status_code == 200:
            print("Google Auth URL endpoint working")
            print(f"Auth URL: {response.json()['auth_url']}")
            return True
        else:
            print(f"Google Auth URL failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"Google Auth URL test failed: {e}")
        return False

def test_docs():
    """Test API documentation"""
    try:
        response = requests.get(f"{BASE_URL}/docs")
        print(f"API Docs: {response.status_code}")
        return response.status_code == 200
    except Exception as e:
        print(f"API Docs test failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing Stockly API...")
    print("=" * 50)
    
    health_ok = test_health()
    auth_url_ok = test_google_auth_url()
    docs_ok = test_docs()
    
    print("=" * 50)
    print("Test Results:")
    print(f"Health Check: {'✅' if health_ok else '❌'}")
    print(f"Google Auth URL: {'✅' if auth_url_ok else '❌'}")
    print(f"API Docs: {'✅' if docs_ok else '❌'}")
    
    if all([health_ok, auth_url_ok, docs_ok]):
        print("\n🎉 All basic tests passed! Your API is ready.")
        print("\nNext steps:")
        print("1. Set up Google OAuth credentials in .env")
        print("2. Configure PostgreSQL database")
        print("3. Test full OAuth flow with frontend")
    else:
        print("\n❌ Some tests failed. Check your server logs.")
