# Stockly Backend API

FastAPI backend for Stockly - AI Image Generation platform with Google OAuth and JWT authentication.

## Features

- 🔐 **Google OAuth 2.0 Authentication**
- 🎫 **JWT Token-based Authorization** (Access + Refresh tokens)
- 🖼️ **AI Image Generation** (Google Imagen API integration)
- 📊 **User Gallery & History**
- 🔒 **Secure API** with proper authentication middleware
- 📚 **Auto-generated API Documentation** (/docs)

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: Google OAuth + JWT
- **AI Service**: Google Cloud Imagen API
- **Documentation**: Swagger/OpenAPI

## Quick Start

### 1. Environment Setup

```bash
# Clone and navigate to backend
cd server/

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Variables

Create `.env` file:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/stockly

# JWT Secrets (Generate secure random strings)
SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
REFRESH_SECRET_KEY=your-super-secret-refresh-key-change-this-in-production

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback

# Google Cloud (for Imagen API)
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
GOOGLE_CLOUD_PROJECT=your-project-id

# Server Configuration
ENVIRONMENT=development
DEBUG=True
```

### 3. Database Setup

```bash
# Install PostgreSQL and create database
createdb stockly

# Run database migrations (if using Alembic)
alembic upgrade head
```

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs: `http://localhost:3000/auth/callback`
6. Update `.env` with client ID and secret

### 5. Run the Server

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## API Endpoints

### Authentication
- `GET /api/auth/google/url` - Get Google OAuth URL
- `POST /api/auth/google/callback` - Handle OAuth callback
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout

### Images
- `POST /api/images/generate` - Generate images
- `GET /api/images/history` - Get user's image history
- `DELETE /api/images/{image_id}` - Delete generated image

## Testing

```bash
# Run basic tests
python test_auth.py

# View API documentation
open http://localhost:8000/docs

# Health check
curl http://localhost:8000/health
```

## Authentication Flow

### OAuth + JWT Flow:

1. **Frontend** → `GET /api/auth/google/url` → **Google OAuth URL**
2. **User** → Authenticates with Google → **Authorization Code**
3. **Frontend** → `POST /api/auth/google/callback` → **Access + Refresh Tokens**
4. **Frontend** → Stores tokens → **Authenticated Requests**
5. **API** → Validates JWT tokens → **Protected Resources**

### Token Usage:

```javascript
// Include in request headers
Authorization: Bearer <access_token>

// Refresh token when expired
POST /api/auth/refresh
{
  "refresh_token": "<refresh_token>"
}
```

## Security Features

- ✅ JWT access tokens (30min expiry)
- ✅ JWT refresh tokens (7 days expiry)
- ✅ CORS protection
- ✅ Security headers middleware
- ✅ Input validation with Pydantic
- ✅ SQL injection protection
- ✅ HTTPS enforcement (production)

## Project Structure

```
server/
├── app/
│   ├── main.py              # FastAPI application
│   ├── database.py          # Database configuration
│   ├── models/              # SQLAlchemy models
│   ├── routes/              # API endpoints
│   ├── schemas/             # Pydantic models
│   ├── services/            # Business logic
│   └── utils/               # Utilities (auth, etc.)
├── .env                     # Environment variables
├── requirements.txt         # Python dependencies
└── test_auth.py            # Basic API tests
```

## Deployment

### Docker (Recommended)

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables for Production

```env
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=<secure-random-key>
REFRESH_SECRET_KEY=<secure-random-key>
DATABASE_URL=<production-db-url>
GOOGLE_REDIRECT_URI=<production-frontend-url>/auth/callback
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Run tests
5. Submit pull request

## License

MIT License - see LICENSE file for details.
