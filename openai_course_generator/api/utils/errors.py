"""
Error handling utilities for the Lxera Agent Pipeline API.

Provides custom exception classes and error response formatting.
"""

import logging
import traceback
import uuid
from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional

from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


class ErrorCode(Enum):
    """Standard error codes for the API."""
    
    # Planning errors
    PLANNING_FAILED = "PLANNING_FAILED"
    INVALID_EMPLOYEE_DATA = "INVALID_EMPLOYEE_DATA"
    INVALID_SKILLS_GAPS = "INVALID_SKILLS_GAPS"
    
    # Research errors
    RESEARCH_FAILED = "RESEARCH_FAILED"
    INVALID_PLAN_ID = "INVALID_PLAN_ID"
    RESEARCH_TIMEOUT = "RESEARCH_TIMEOUT"
    
    # Content errors
    CONTENT_FAILED = "CONTENT_FAILED"
    INVALID_RESEARCH_ID = "INVALID_RESEARCH_ID"
    QUALITY_ASSESSMENT_FAILED = "QUALITY_ASSESSMENT_FAILED"
    
    # Infrastructure errors
    DATABASE_ERROR = "DATABASE_ERROR"
    OPENAI_API_ERROR = "OPENAI_API_ERROR"
    AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR"
    AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR"
    
    # General errors
    VALIDATION_ERROR = "VALIDATION_ERROR"
    INTERNAL_ERROR = "INTERNAL_ERROR"
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"


class AgentExecutionError(HTTPException):
    """Custom exception for agent execution failures."""
    
    def __init__(
        self,
        error_code: ErrorCode,
        details: str,
        agent_type: str = None,
        session_id: str = None,
        status_code: int = status.HTTP_422_UNPROCESSABLE_ENTITY
    ):
        self.error_code = error_code
        self.agent_type = agent_type
        self.session_id = session_id
        self.request_id = str(uuid.uuid4())
        self.timestamp = datetime.utcnow()
        
        detail = {
            "error_code": error_code.value,
            "message": self._get_error_message(error_code),
            "details": details,
            "agent_type": agent_type,
            "session_id": session_id,
            "request_id": self.request_id,
            "timestamp": self.timestamp.isoformat()
        }
        
        super().__init__(status_code=status_code, detail=detail)
        
        # Log the error
        logger.error(
            f"Agent execution error: {error_code.value} - {details} "
            f"(agent: {agent_type}, session: {session_id}, request: {self.request_id})"
        )
    
    def _get_error_message(self, error_code: ErrorCode) -> str:
        """Get human-readable error message for error code."""
        messages = {
            ErrorCode.PLANNING_FAILED: "Failed to generate course plan",
            ErrorCode.INVALID_EMPLOYEE_DATA: "Invalid employee data provided",
            ErrorCode.INVALID_SKILLS_GAPS: "Invalid skills gap data provided",
            ErrorCode.RESEARCH_FAILED: "Failed to conduct research",
            ErrorCode.INVALID_PLAN_ID: "Invalid or missing plan ID",
            ErrorCode.RESEARCH_TIMEOUT: "Research execution timed out",
            ErrorCode.CONTENT_FAILED: "Failed to generate content",
            ErrorCode.INVALID_RESEARCH_ID: "Invalid or missing research ID",
            ErrorCode.QUALITY_ASSESSMENT_FAILED: "Quality assessment failed",
            ErrorCode.DATABASE_ERROR: "Database operation failed",
            ErrorCode.OPENAI_API_ERROR: "OpenAI API error",
            ErrorCode.AUTHENTICATION_ERROR: "Authentication failed",
            ErrorCode.AUTHORIZATION_ERROR: "Access denied",
            ErrorCode.VALIDATION_ERROR: "Request validation failed",
            ErrorCode.INTERNAL_ERROR: "Internal server error",
            ErrorCode.RATE_LIMIT_EXCEEDED: "Rate limit exceeded"
        }
        return messages.get(error_code, "An error occurred")


class ValidationError(HTTPException):
    """Custom exception for validation errors."""
    
    def __init__(self, field: str, message: str, value: Any = None):
        self.field = field
        self.value = value
        self.request_id = str(uuid.uuid4())
        
        detail = {
            "error_code": ErrorCode.VALIDATION_ERROR.value,
            "message": "Request validation failed",
            "details": {
                "field": field,
                "message": message,
                "value": str(value) if value is not None else None
            },
            "request_id": self.request_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)
        
        logger.warning(f"Validation error: {field} - {message} (request: {self.request_id})")


class DatabaseError(HTTPException):
    """Custom exception for database errors."""
    
    def __init__(self, operation: str, details: str):
        self.operation = operation
        self.request_id = str(uuid.uuid4())
        
        detail = {
            "error_code": ErrorCode.DATABASE_ERROR.value,
            "message": "Database operation failed",
            "details": f"Operation '{operation}' failed: {details}",
            "request_id": self.request_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)
        
        logger.error(f"Database error: {operation} - {details} (request: {self.request_id})")


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """General exception handler for unhandled exceptions."""
    
    request_id = str(uuid.uuid4())
    
    # Log the full traceback
    logger.error(
        f"Unhandled exception: {type(exc).__name__}: {str(exc)} "
        f"(request: {request_id}, path: {request.url.path})"
    )
    logger.error(f"Traceback: {traceback.format_exc()}")
    
    # Return structured error response
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error_code": ErrorCode.INTERNAL_ERROR.value,
            "message": "Internal server error",
            "details": "An unexpected error occurred. Please try again later.",
            "request_id": request_id,
            "timestamp": datetime.utcnow().isoformat()
        }
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Enhanced HTTP exception handler with structured responses."""
    
    # If it's already our custom exception, return as-is
    if isinstance(exc.detail, dict) and "error_code" in exc.detail:
        return JSONResponse(
            status_code=exc.status_code,
            content=exc.detail
        )
    
    # Convert standard HTTPException to our format
    request_id = str(uuid.uuid4())
    
    # Determine error code based on status
    if exc.status_code == status.HTTP_401_UNAUTHORIZED:
        error_code = ErrorCode.AUTHENTICATION_ERROR
    elif exc.status_code == status.HTTP_403_FORBIDDEN:
        error_code = ErrorCode.AUTHORIZATION_ERROR
    elif exc.status_code == status.HTTP_400_BAD_REQUEST:
        error_code = ErrorCode.VALIDATION_ERROR
    else:
        error_code = ErrorCode.INTERNAL_ERROR
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error_code": error_code.value,
            "message": str(exc.detail),
            "details": None,
            "request_id": request_id,
            "timestamp": datetime.utcnow().isoformat()
        }
    )


async def validation_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handler for Pydantic validation errors."""
    
    request_id = str(uuid.uuid4())
    
    # Extract validation details
    if hasattr(exc, 'errors'):
        validation_errors = []
        for error in exc.errors():
            validation_errors.append({
                "field": ".".join(str(x) for x in error.get("loc", [])),
                "message": error.get("msg", "Validation error"),
                "type": error.get("type", "value_error")
            })
    else:
        validation_errors = [{"message": str(exc)}]
    
    logger.warning(f"Validation error: {validation_errors} (request: {request_id})")
    
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error_code": ErrorCode.VALIDATION_ERROR.value,
            "message": "Request validation failed",
            "details": {
                "validation_errors": validation_errors
            },
            "request_id": request_id,
            "timestamp": datetime.utcnow().isoformat()
        }
    )


def setup_error_handlers(app):
    """Setup custom error handlers for the FastAPI app."""
    
    from fastapi.exceptions import RequestValidationError
    from pydantic import ValidationError as PydanticValidationError
    
    # Add exception handlers
    app.add_exception_handler(Exception, general_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(PydanticValidationError, validation_exception_handler)
    
    logger.info("✅ Error handlers configured")


# Utility functions for creating common errors
def create_planning_error(details: str, session_id: str = None) -> AgentExecutionError:
    """Create a planning execution error."""
    return AgentExecutionError(
        error_code=ErrorCode.PLANNING_FAILED,
        details=details,
        agent_type="planning",
        session_id=session_id
    )


def create_research_error(details: str, session_id: str = None) -> AgentExecutionError:
    """Create a research execution error."""
    return AgentExecutionError(
        error_code=ErrorCode.RESEARCH_FAILED,
        details=details,
        agent_type="research",
        session_id=session_id
    )


def create_content_error(details: str, session_id: str = None) -> AgentExecutionError:
    """Create a content execution error."""
    return AgentExecutionError(
        error_code=ErrorCode.CONTENT_FAILED,
        details=details,
        agent_type="content",
        session_id=session_id
    )


def create_database_error(operation: str, details: str) -> DatabaseError:
    """Create a database operation error."""
    return DatabaseError(operation=operation, details=details)


def create_validation_error(field: str, message: str, value: Any = None) -> ValidationError:
    """Create a validation error."""
    return ValidationError(field=field, message=message, value=value)