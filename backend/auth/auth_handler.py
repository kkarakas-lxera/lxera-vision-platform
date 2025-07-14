#!/usr/bin/env python3
"""
Authentication handler for JWT tokens and user management.
Handles 3-tier user roles: Super Admin, Company Admin, Learner.
"""

import os
import jwt
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
from passlib.context import CryptContext
from fastapi import HTTPException, status
from database.connection import get_supabase_client
import logging

logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("JWT_SECRET_KEY environment variable must be set in production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours


class UserRoles:
    """User role constants."""
    SUPER_ADMIN = "super_admin"
    COMPANY_ADMIN = "company_admin"
    LEARNER = "learner"


def hash_password(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: User data to encode in token
        expires_delta: Optional custom expiration time
        
    Returns:
        str: JWT token
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt


def verify_token(token: str) -> Dict[str, Any]:
    """
    Verify and decode a JWT token.
    
    Args:
        token: JWT token to verify
        
    Returns:
        Dict: Decoded user data
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID"
            )
        
        # Get user data from database
        supabase = get_supabase_client()
        result = supabase.table('users').select('*').eq('id', user_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        user_data = result.data[0]
        return user_data
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """
    Authenticate a user with email and password.
    
    Args:
        email: User email
        password: Plain text password
        
    Returns:
        Dict: User data if authentication successful, None otherwise
    """
    try:
        supabase = get_supabase_client()
        
        # Get user by email
        result = supabase.table('users').select('*').eq('email', email).execute()
        
        if not result.data:
            logger.warning(f"Authentication failed: User not found for email {email}")
            return None
        
        user = result.data[0]
        
        # Verify password
        if not verify_password(password, user['password_hash']):
            logger.warning(f"Authentication failed: Invalid password for email {email}")
            return None
        
        # Check if user is active
        if not user.get('is_active', True):
            logger.warning(f"Authentication failed: Inactive user {email}")
            return None
        
        logger.info(f"Authentication successful for user {email}")
        return user
        
    except Exception as e:
        logger.error(f"Authentication error for email {email}: {e}")
        return None


def require_role(required_role: str):
    """
    Decorator to require specific user role.
    
    Args:
        required_role: Required user role (super_admin, company_admin, learner)
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            # This would be used with FastAPI dependencies
            # Implementation depends on how you structure your endpoints
            pass
        return wrapper
    return decorator


def has_permission(user: Dict[str, Any], action: str, resource_company_id: Optional[str] = None) -> bool:
    """
    Check if user has permission for an action.
    
    Args:
        user: User data
        action: Action to check (create_course, manage_employees, etc.)
        resource_company_id: Company ID for resource-specific checks
        
    Returns:
        bool: True if user has permission
    """
    user_role = user.get('role')
    user_company_id = user.get('company_id')
    
    # Super admin has all permissions
    if user_role == UserRoles.SUPER_ADMIN:
        return True
    
    # Company admin permissions
    if user_role == UserRoles.COMPANY_ADMIN:
        # Can manage resources within their company
        if resource_company_id and resource_company_id != user_company_id:
            return False
        
        company_admin_actions = [
            'create_course', 'manage_employees', 'view_analytics', 
            'upload_files', 'manage_company_settings'
        ]
        return action in company_admin_actions
    
    # Learner permissions
    if user_role == UserRoles.LEARNER:
        # Can only access their own resources
        learner_actions = ['view_courses', 'download_files', 'view_progress']
        return action in learner_actions
    
    return False