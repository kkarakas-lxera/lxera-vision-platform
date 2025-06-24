#!/usr/bin/env python3
"""
Authentication API endpoints.
Handles login, registration, and token management.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid
from datetime import datetime, timezone

from auth.auth_handler import (
    authenticate_user, create_access_token, hash_password, 
    UserRoles, has_permission
)
from database.connection import get_supabase_client, get_service_role_client
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


# Pydantic models
class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = UserRoles.LEARNER
    company_id: Optional[str] = None


class CompanyCreate(BaseModel):
    name: str
    domain: str
    admin_email: EmailStr
    admin_password: str
    admin_name: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


@router.post("/login", response_model=TokenResponse)
async def login(user_credentials: UserLogin):
    """
    Authenticate user and return JWT token.
    
    Args:
        user_credentials: Email and password
        
    Returns:
        TokenResponse: JWT token and user data
    """
    # Authenticate user
    user = authenticate_user(user_credentials.email, user_credentials.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user["id"]})
    
    # Remove sensitive data
    user_safe = {k: v for k, v in user.items() if k != 'password_hash'}
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_safe
    )


@router.post("/register")
async def register(user_data: UserRegister):
    """
    Register a new user (learners only, admins created separately).
    
    Args:
        user_data: User registration data
        
    Returns:
        dict: Success message
    """
    try:
        supabase = get_supabase_client()
        
        # Check if user already exists
        existing_user = supabase.table('users').select('id').eq('email', user_data.email).execute()
        if existing_user.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Only allow learner registration through public endpoint
        if user_data.role != UserRoles.LEARNER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only learner accounts can be created through registration"
            )
        
        # Verify company exists if provided
        if user_data.company_id:
            company = supabase.table('companies').select('id').eq('id', user_data.company_id).execute()
            if not company.data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid company ID"
                )
        
        # Create user
        user_id = str(uuid.uuid4())
        hashed_password = hash_password(user_data.password)
        
        new_user = {
            'id': user_id,
            'email': user_data.email,
            'password_hash': hashed_password,
            'full_name': user_data.full_name,
            'role': user_data.role,
            'company_id': user_data.company_id,
            'is_active': True,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
        
        result = supabase.table('users').insert(new_user).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )
        
        logger.info(f"User registered successfully: {user_data.email}")
        
        return {"message": "User registered successfully", "user_id": user_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@router.post("/companies")
async def create_company(company_data: CompanyCreate):
    """
    Create a new company with admin user (Super Admin only).
    
    Args:
        company_data: Company and admin user data
        
    Returns:
        dict: Created company and admin user IDs
    """
    try:
        # Use service role client for admin operations
        supabase = get_service_role_client()
        
        # Check if company domain already exists
        existing_company = supabase.table('companies').select('id').eq('domain', company_data.domain).execute()
        if existing_company.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company with this domain already exists"
            )
        
        # Check if admin email already exists
        existing_user = supabase.table('users').select('id').eq('email', company_data.admin_email).execute()
        if existing_user.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Create company
        company_id = str(uuid.uuid4())
        new_company = {
            'id': company_id,
            'name': company_data.name,
            'domain': company_data.domain,
            'is_active': True,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
        
        company_result = supabase.table('companies').insert(new_company).execute()
        
        if not company_result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create company"
            )
        
        # Create admin user
        user_id = str(uuid.uuid4())
        hashed_password = hash_password(company_data.admin_password)
        
        new_admin = {
            'id': user_id,
            'email': company_data.admin_email,
            'password_hash': hashed_password,
            'full_name': company_data.admin_name,
            'role': UserRoles.COMPANY_ADMIN,
            'company_id': company_id,
            'is_active': True,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
        
        user_result = supabase.table('users').insert(new_admin).execute()
        
        if not user_result.data:
            # Rollback company creation
            supabase.table('companies').delete().eq('id', company_id).execute()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create admin user"
            )
        
        logger.info(f"Company created successfully: {company_data.name}")
        
        return {
            "message": "Company and admin user created successfully",
            "company_id": company_id,
            "admin_user_id": user_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Company creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Company creation failed"
        )


@router.get("/me")
async def get_current_user_info(current_user: dict = Depends()):
    """
    Get current user information.
    Note: This requires the auth dependency to be implemented in main.py
    """
    # Remove sensitive data
    user_safe = {k: v for k, v in current_user.items() if k != 'password_hash'}
    return user_safe


@router.post("/logout")
async def logout():
    """
    Logout endpoint (client-side token removal).
    """
    return {"message": "Successfully logged out"}