"""
Authentication utilities for the Lxera Agent Pipeline API.

Handles JWT token verification and user authentication.
"""

import jwt
import os
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24


def verify_jwt_token(token: str) -> Dict[str, Any]:
    """
    Verify JWT token and return user information.
    
    Args:
        token: JWT token string
        
    Returns:
        Dict containing user information
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        # Decode the JWT token
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        
        # Check if token is expired
        exp = payload.get("exp")
        if exp and datetime.utcfromtimestamp(exp) < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Extract user information
        user_info = {
            "user_id": payload.get("user_id"),
            "company_id": payload.get("company_id"),
            "email": payload.get("email"),
            "permissions": payload.get("permissions", []),
            "exp": exp
        }
        
        # Validate required fields
        if not user_info["user_id"] or not user_info["company_id"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token - missing required user information",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        logger.debug(f"Token verified for user {user_info['user_id']}")
        return user_info
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token verification failed",
            headers={"WWW-Authenticate": "Bearer"},
        )


def create_jwt_token(user_id: str, company_id: str, email: str, permissions: list = None) -> str:
    """
    Create a JWT token for a user.
    
    Args:
        user_id: Unique user identifier
        company_id: Company identifier
        email: User email
        permissions: List of user permissions
        
    Returns:
        JWT token string
    """
    if permissions is None:
        permissions = ["course_generation"]
    
    # Token payload
    payload = {
        "user_id": user_id,
        "company_id": company_id,
        "email": email,
        "permissions": permissions,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    
    # Create token
    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    
    logger.debug(f"Token created for user {user_id}")
    return token


def get_current_user(token_payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract current user information from verified token payload.
    
    This function is used as a dependency in FastAPI routes.
    """
    return {
        "user_id": token_payload.get("user_id"),
        "company_id": token_payload.get("company_id"),
        "email": token_payload.get("email"),
        "permissions": token_payload.get("permissions", [])
    }


def check_permission(user: Dict[str, Any], required_permission: str) -> bool:
    """
    Check if user has a specific permission.
    
    Args:
        user: User information dict
        required_permission: Permission to check for
        
    Returns:
        True if user has permission, False otherwise
    """
    permissions = user.get("permissions", [])
    return required_permission in permissions or "admin" in permissions


def require_permission(required_permission: str):
    """
    Decorator to require specific permission for endpoint access.
    
    Args:
        required_permission: Permission required to access the endpoint
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Get current user from kwargs (injected by FastAPI dependency)
            current_user = kwargs.get("current_user")
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required"
                )
            
            if not check_permission(current_user, required_permission):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Permission '{required_permission}' required"
                )
            
            return func(*args, **kwargs)
        return wrapper
    return decorator


# For development/testing - create a test token
def create_test_token() -> str:
    """Create a test JWT token for development/testing purposes."""
    return create_jwt_token(
        user_id="test-user-123",
        company_id="67d7bff4-1149-4f37-952e-af1841fb67fa",
        email="test@example.com",
        permissions=["course_generation", "admin"]
    )


if __name__ == "__main__":
    # Test token creation and verification
    test_token = create_test_token()
    print(f"Test token: {test_token}")
    
    try:
        user_info = verify_jwt_token(test_token)
        print(f"Token verified: {user_info}")
    except Exception as e:
        print(f"Token verification failed: {e}")