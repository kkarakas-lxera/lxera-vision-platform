#!/usr/bin/env python3
"""
FastAPI application for Lxera Agent Pipeline.

This application provides sequential API endpoints that wrap the standalone
tested Planning, Research, and Content agents.
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import logging
import os
from typing import Optional

# Import routers
from api.routers import planning, research, content
from api.utils.auth import verify_jwt_token
from api.utils.errors import setup_error_handlers

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Security
security = HTTPBearer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management."""
    logger.info("🚀 Lxera Agent Pipeline API starting up...")
    
    # Verify required environment variables
    required_env_vars = [
        'OPENAI_API_KEY',
        'SUPABASE_URL', 
        'SUPABASE_SERVICE_ROLE_KEY',
        'TAVILY_API_KEY',
        'FIRECRAWL_API_KEY'
    ]
    
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]
    if missing_vars:
        logger.error(f"❌ Missing required environment variables: {missing_vars}")
        raise RuntimeError(f"Missing environment variables: {missing_vars}")
    
    logger.info("✅ All required environment variables found")
    logger.info("✅ Lxera Agent Pipeline API ready")
    
    yield
    
    logger.info("🛑 Lxera Agent Pipeline API shutting down...")

# Create FastAPI app
app = FastAPI(
    title="Lxera Agent Pipeline API",
    description="Sequential execution API for Planning, Research, and Content generation agents",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000,https://yourdomain.com").split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Setup error handlers
setup_error_handlers(app)

# Authentication dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token and return user info."""
    try:
        token = credentials.credentials
        user_info = verify_jwt_token(token)
        return user_info
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "lxera-agent-pipeline",
        "version": "1.0.0"
    }

# API info endpoint
@app.get("/api/v1/info")
async def api_info():
    """API information endpoint."""
    return {
        "service": "Lxera Agent Pipeline API",
        "version": "1.0.0",
        "description": "Sequential execution API for Planning, Research, and Content agents",
        "endpoints": {
            "planning": "/api/v1/planning/execute",
            "research": "/api/v1/research/execute", 
            "content": "/api/v1/content/execute"
        },
        "authentication": "JWT Bearer token required",
        "tracing": "OpenAI traces available for all agent executions"
    }

# Include routers
app.include_router(
    planning.router,
    prefix="/api/v1/planning",
    tags=["Planning Agent"],
    dependencies=[Depends(get_current_user)]
)

app.include_router(
    research.router,
    prefix="/api/v1/research", 
    tags=["Research Agent"],
    dependencies=[Depends(get_current_user)]
)

app.include_router(
    content.router,
    prefix="/api/v1/content",
    tags=["Content Agent"], 
    dependencies=[Depends(get_current_user)]
)

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Lxera Agent Pipeline API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "api_info": "/api/v1/info"
    }

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    uvicorn.run(
        "api.main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )