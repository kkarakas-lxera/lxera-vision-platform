#!/usr/bin/env python3
"""
LXERA SaaS Platform - FastAPI Backend
Main application entry point with authentication and API routing.
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import uvicorn
import os
from typing import Optional

from api.auth import router as auth_router
from api.courses import router as courses_router
from api.employees import router as employees_router
from api.files import router as files_router
from api.admin import router as admin_router
from auth.auth_handler import verify_token
from database.connection import get_supabase_client


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    print("🚀 LXERA SaaS Platform starting up...")
    
    # Verify database connection
    try:
        supabase = get_supabase_client()
        # Test connection with a simple query
        result = supabase.table('companies').select('id').limit(1).execute()
        print("✅ Database connection verified")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        raise
    
    yield
    
    # Shutdown
    print("🛑 LXERA SaaS Platform shutting down...")


# Initialize FastAPI app
app = FastAPI(
    title="LXERA SaaS Platform API",
    description="Multi-tenant SaaS platform for AI-powered course generation",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# Security
security = HTTPBearer()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(courses_router, prefix="/api/courses", tags=["Courses"])
app.include_router(employees_router, prefix="/api/employees", tags=["Employees"])
app.include_router(files_router, prefix="/api/files", tags=["Files"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "message": "LXERA SaaS Platform API",
        "version": "1.0.0",
        "status": "healthy"
    }


@app.get("/api/health")
async def health_check():
    """Detailed health check with database status."""
    try:
        # Test database connection
        supabase = get_supabase_client()
        result = supabase.table('companies').select('id').limit(1).execute()
        
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": "2024-06-24T00:00:00Z"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "timestamp": "2024-06-24T00:00:00Z"
        }


# Global dependency for authentication
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Extract and verify user from JWT token."""
    try:
        token = credentials.credentials
        user_data = verify_token(token)
        return user_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )