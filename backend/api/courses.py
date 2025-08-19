#!/usr/bin/env python3
"""
Course management API endpoints.
Handles course generation, assignment, and progress tracking.
"""

from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone

from database.connection import get_supabase_client
from auth.auth_handler import UserRoles, has_permission
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


# Pydantic models
class CourseGenerationRequest(BaseModel):
    module_name: str = Field(..., min_length=1, max_length=200)
    employee_name: str = Field(..., min_length=1, max_length=100)
    current_role: str = Field(..., min_length=1, max_length=100)
    career_goal: str = Field(..., min_length=1, max_length=100)
    key_tools: List[str] = Field(default_factory=list)
    personalization_level: str = Field(default="standard", regex="^(basic|standard|advanced)$")
    priority_level: str = Field(default="medium", regex="^(critical|high|medium|low)$")


class CourseAssignmentRequest(BaseModel):
    employee_ids: List[str] = Field(..., min_items=1)
    course_id: str
    due_date: Optional[datetime] = None
    priority: str = Field(default="medium", regex="^(low|medium|high)$")


class CourseProgressUpdate(BaseModel):
    assignment_id: str
    progress_percentage: float = Field(..., ge=0, le=100)
    status: str = Field(..., regex="^(assigned|in_progress|completed|overdue)$")
    feedback: Optional[Dict[str, Any]] = None


# Dependency to get current user (placeholder - implement in main.py)
async def get_current_user():
    # This should be implemented as a dependency in main.py
    # For now, return a mock user for development
    return {
        "id": "test-user-id",
        "role": UserRoles.COMPANY_ADMIN,
        "company_id": "test-company-id"
    }


@router.post("/generate")
async def generate_course(
    request: CourseGenerationRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a new course using the OpenAI course generator pipeline.
    
    Args:
        request: Course generation parameters
        background_tasks: FastAPI background tasks
        current_user: Current authenticated user
        
    Returns:
        dict: Course generation status and ID
    """
    try:
        # Check permissions
        if not has_permission(current_user, 'create_course'):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to create courses"
            )
        
        supabase = get_supabase_client()
        
        # Create initial course record
        content_id = str(uuid.uuid4())
        session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{content_id[:8]}"
        
        course_data = {
            'content_id': content_id,
            'company_id': current_user['company_id'],
            'module_name': request.module_name,
            'employee_name': request.employee_name,
            'session_id': session_id,
            'module_spec': {
                'current_role': request.current_role,
                'career_goal': request.career_goal,
                'key_tools': request.key_tools,
                'personalization_level': request.personalization_level,
                'priority_level': request.priority_level
            },
            'status': 'draft',
            'priority_level': request.priority_level,
            'created_by': current_user['id']
        }
        
        result = supabase.table('cm_module_content').insert(course_data).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create course record"
            )
        
        # Queue background course generation task
        background_tasks.add_task(
            run_course_generation_pipeline,
            content_id,
            current_user['company_id'],
            request.dict()
        )
        
        logger.info(f"Course generation started: {content_id}")
        
        return {
            "message": "Course generation started",
            "content_id": content_id,
            "session_id": session_id,
            "status": "processing",
            "estimated_completion_minutes": 15
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Course generation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Course generation failed"
        )


@router.get("/")
async def list_courses(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    List courses accessible to the current user.
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        status: Optional status filter
        current_user: Current authenticated user
        
    Returns:
        List[dict]: List of courses
    """
    try:
        supabase = get_supabase_client()
        
        # Build query based on user role
        query = supabase.table('cm_module_content').select('*')
        
        if current_user['role'] != UserRoles.SUPER_ADMIN:
            query = query.eq('company_id', current_user['company_id'])
        
        if status:
            query = query.eq('status', status)
        
        # Apply pagination
        query = query.range(skip, skip + limit - 1).order('created_at', desc=True)
        
        result = query.execute()
        
        return {
            "courses": result.data,
            "total": len(result.data),
            "skip": skip,
            "limit": limit
        }
        
    except Exception as e:
        logger.error(f"List courses error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve courses"
        )


@router.get("/{course_id}")
async def get_course(
    course_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get detailed course information.
    
    Args:
        course_id: Course ID (content_id)
        current_user: Current authenticated user
        
    Returns:
        dict: Course details
    """
    try:
        supabase = get_supabase_client()
        
        # Get course with company check
        query = supabase.table('cm_module_content').select('*').eq('content_id', course_id)
        
        if current_user['role'] != UserRoles.SUPER_ADMIN:
            query = query.eq('company_id', current_user['company_id'])
        
        result = query.execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        
        course = result.data[0]
        
        # Get associated quality assessments
        quality_result = supabase.table('cm_quality_assessments').select('*').eq('content_id', course_id).execute()
        course['quality_assessments'] = quality_result.data
        
        # Get multimedia sessions
        multimedia_result = supabase.table('mm_multimedia_sessions').select('*').eq('content_id', course_id).execute()
        course['multimedia_sessions'] = multimedia_result.data
        
        return course
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get course error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve course"
        )


@router.post("/assign")
async def assign_courses(
    request: CourseAssignmentRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Assign courses to employees.
    
    Args:
        request: Course assignment details
        current_user: Current authenticated user
        
    Returns:
        dict: Assignment results
    """
    try:
        # Check permissions
        if not has_permission(current_user, 'manage_employees'):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to assign courses"
            )
        
        supabase = get_supabase_client()
        
        # Verify course exists and belongs to company
        course_query = supabase.table('cm_module_content').select('content_id').eq('content_id', request.course_id)
        
        if current_user['role'] != UserRoles.SUPER_ADMIN:
            course_query = course_query.eq('company_id', current_user['company_id'])
        
        course_result = course_query.execute()
        
        if not course_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        
        # Verify employees exist and belong to company
        employees_query = supabase.table('employees').select('id').in_('id', request.employee_ids)
        
        if current_user['role'] != UserRoles.SUPER_ADMIN:
            employees_query = employees_query.eq('company_id', current_user['company_id'])
        
        employees_result = employees_query.execute()
        
        if len(employees_result.data) != len(request.employee_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Some employees not found or not accessible"
            )
        
        # Create assignments
        assignments = []
        for employee_id in request.employee_ids:
            assignment = {
                'id': str(uuid.uuid4()),
                'employee_id': employee_id,
                'course_id': request.course_id,
                'company_id': current_user['company_id'],
                'assigned_by': current_user['id'],
                'due_date': request.due_date.isoformat() if request.due_date else None,
                'priority': request.priority,
                'status': 'assigned',
                'progress_percentage': 0
            }
            assignments.append(assignment)
        
        # Insert assignments
        result = supabase.table('course_assignments').insert(assignments).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create assignments"
            )
        
        logger.info(f"Created {len(assignments)} course assignments")
        
        return {
            "message": f"Course assigned to {len(assignments)} employees",
            "assignments_created": len(assignments),
            "assignment_ids": [a['id'] for a in assignments]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Course assignment error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Course assignment failed"
        )


@router.put("/progress")
async def update_course_progress(
    request: CourseProgressUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update course progress for an assignment.
    
    Args:
        request: Progress update details
        current_user: Current authenticated user
        
    Returns:
        dict: Updated assignment
    """
    try:
        supabase = get_supabase_client()
        
        # Get assignment with proper access control
        query = supabase.table('course_assignments').select('*').eq('id', request.assignment_id)
        
        if current_user['role'] == UserRoles.LEARNER:
            # Learners can only update their own assignments
            query = query.eq('employee_id', current_user.get('employee_id'))
        elif current_user['role'] != UserRoles.SUPER_ADMIN:
            # Company admins can update assignments in their company
            query = query.eq('company_id', current_user['company_id'])
        
        result = query.execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assignment not found or not accessible"
            )
        
        assignment = result.data[0]
        
        # Prepare update data
        update_data = {
            'progress_percentage': request.progress_percentage,
            'status': request.status,
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
        
        # Add timestamps based on status
        if request.status == 'in_progress' and not assignment.get('started_at'):
            update_data['started_at'] = datetime.now(timezone.utc).isoformat()
        elif request.status == 'completed' and not assignment.get('completed_at'):
            update_data['completed_at'] = datetime.now(timezone.utc).isoformat()
        
        # Add feedback if provided
        if request.feedback:
            current_feedback = assignment.get('feedback', {})
            if isinstance(current_feedback, dict):
                current_feedback.update(request.feedback)
            else:
                current_feedback = request.feedback
            update_data['feedback'] = current_feedback
        
        # Update assignment
        update_result = supabase.table('course_assignments').update(update_data).eq('id', request.assignment_id).execute()
        
        if not update_result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update progress"
            )
        
        logger.info(f"Updated progress for assignment {request.assignment_id}: {request.progress_percentage}%")
        
        return {
            "message": "Progress updated successfully",
            "assignment": update_result.data[0]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Progress update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Progress update failed"
        )


# Background task function
async def run_course_generation_pipeline(content_id: str, company_id: str, generation_params: dict):
    """
    Background task to run the course generation pipeline by calling the Render service.
    
    Args:
        content_id: Course content ID
        company_id: Company ID
        generation_params: Generation parameters from CourseGenerationRequest
    """
    try:
        import httpx
        
        logger.info(f"Starting course generation pipeline for {content_id}")
        
        # Update status to processing
        supabase = get_supabase_client()
        supabase.table('cm_module_content').update({
            'status': 'processing',
            'updated_at': datetime.now(timezone.utc).isoformat()
        }).eq('content_id', content_id).execute()
        
        # Get Render service URL from environment
        import os
        render_service_url = os.getenv('RENDER_SERVICE_URL', 'https://lxera-agent-pipeline.onrender.com')
        
        # Prepare request payload for Render service
        # Note: This FastAPI endpoint is designed for direct course generation
        # but the Render service expects employee_id. For now, we'll create a placeholder
        payload = {
            'employee_id': 'placeholder-employee',  # This should be updated to use actual employee_id
            'company_id': company_id,
            'assigned_by_id': 'system',  # This should be updated to use actual user_id
            'generation_mode': 'full',
            'enable_multimedia': False
        }
        
        # Call the Render service
        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.post(
                f"{render_service_url}/api/generate-course",
                json=payload,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('pipeline_success'):
                    # Update status to completed
                    supabase.table('cm_module_content').update({
                        'status': 'completed',
                        'updated_at': datetime.now(timezone.utc).isoformat(),
                        'core_content': result.get('content', 'Generated content'),
                        'total_word_count': result.get('word_count', 0)
                    }).eq('content_id', content_id).execute()
                    
                    logger.info(f"Course generation pipeline completed for {content_id}")
                else:
                    raise Exception(f"Pipeline failed: {result.get('error', 'Unknown error')}")
            else:
                raise Exception(f"Render service error: {response.status_code} - {response.text}")
        
    except Exception as e:
        logger.error(f"Course generation pipeline failed for {content_id}: {e}")
        
        # Update status to failed
        supabase = get_supabase_client()
        supabase.table('cm_module_content').update({
            'status': 'failed',
            'updated_at': datetime.now(timezone.utc).isoformat()
        }).eq('content_id', content_id).execute()