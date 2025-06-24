#!/usr/bin/env python3
"""
Employee management API endpoints.
Handles employee CRUD operations and CSV bulk import.
"""

from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
import uuid
import csv
import io
from datetime import datetime, timezone

from database.connection import get_supabase_client
from auth.auth_handler import UserRoles, has_permission, hash_password
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


# Pydantic models
class EmployeeCreate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: str = Field(..., min_length=1, max_length=100)
    employee_id: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    current_role: Optional[str] = None
    career_goal: Optional[str] = None
    skill_level: str = Field(default="beginner", regex="^(beginner|intermediate|advanced)$")
    key_tools: List[str] = Field(default_factory=list)
    hired_date: Optional[str] = None  # ISO date string


class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    current_role: Optional[str] = None
    career_goal: Optional[str] = None
    skill_level: Optional[str] = Field(None, regex="^(beginner|intermediate|advanced)$")
    key_tools: Optional[List[str]] = None
    learning_style: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class BulkImportResult(BaseModel):
    total_processed: int
    successful: int
    failed: int
    errors: List[str]
    created_employee_ids: List[str]


# Dependency placeholder
async def get_current_user():
    return {
        "id": "test-user-id",
        "role": UserRoles.COMPANY_ADMIN,
        "company_id": "test-company-id"
    }


@router.post("/", response_model=dict)
async def create_employee(
    employee_data: EmployeeCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new employee record.
    
    Args:
        employee_data: Employee information
        current_user: Current authenticated user
        
    Returns:
        dict: Created employee record
    """
    try:
        # Check permissions
        if not has_permission(current_user, 'manage_employees'):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to create employees"
            )
        
        supabase = get_supabase_client()
        
        # Create employee record
        employee_id = str(uuid.uuid4())
        employee_record = {
            'id': employee_id,
            'company_id': current_user['company_id'],
            'employee_id': employee_data.employee_id,
            'department': employee_data.department,
            'position': employee_data.position,
            'current_role': employee_data.current_role,
            'career_goal': employee_data.career_goal,
            'skill_level': employee_data.skill_level,
            'key_tools': employee_data.key_tools,
            'hired_date': employee_data.hired_date,
            'is_active': True
        }
        
        # Create user account if email provided
        user_id = None
        if employee_data.email:
            # Check if user already exists
            existing_user = supabase.table('users').select('id').eq('email', employee_data.email).execute()
            
            if existing_user.data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User with this email already exists"
                )
            
            # Create user account
            user_id = str(uuid.uuid4())
            default_password = "TempPass123!"  # Should be changed on first login
            
            user_record = {
                'id': user_id,
                'email': employee_data.email,
                'password_hash': hash_password(default_password),
                'full_name': employee_data.full_name,
                'role': UserRoles.LEARNER,
                'company_id': current_user['company_id'],
                'is_active': True,
                'email_verified': False
            }
            
            user_result = supabase.table('users').insert(user_record).execute()
            
            if not user_result.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create user account"
                )
        
        # Add user_id to employee record
        employee_record['user_id'] = user_id
        
        # Insert employee record
        result = supabase.table('employees').insert(employee_record).execute()
        
        if not result.data:
            # Rollback user creation if employee creation fails
            if user_id:
                supabase.table('users').delete().eq('id', user_id).execute()
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create employee record"
            )
        
        logger.info(f"Employee created: {employee_id}")
        
        response = result.data[0]
        if employee_data.email:
            response['email'] = employee_data.email
            response['temporary_password'] = default_password
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Employee creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Employee creation failed"
        )


@router.get("/")
async def list_employees(
    skip: int = 0,
    limit: int = 100,
    department: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    List employees in the company.
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        department: Optional department filter
        is_active: Optional active status filter
        current_user: Current authenticated user
        
    Returns:
        dict: List of employees
    """
    try:
        supabase = get_supabase_client()
        
        # Build query
        query = supabase.table('employees').select('''
            *,
            users:user_id (
                email,
                full_name,
                last_login,
                is_active
            )
        ''')
        
        # Apply company filter for non-super admins
        if current_user['role'] != UserRoles.SUPER_ADMIN:
            query = query.eq('company_id', current_user['company_id'])
        
        # Apply filters
        if department:
            query = query.eq('department', department)
        
        if is_active is not None:
            query = query.eq('is_active', is_active)
        
        # Apply pagination
        query = query.range(skip, skip + limit - 1).order('created_at', desc=True)
        
        result = query.execute()
        
        return {
            "employees": result.data,
            "total": len(result.data),
            "skip": skip,
            "limit": limit
        }
        
    except Exception as e:
        logger.error(f"List employees error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve employees"
        )


@router.get("/{employee_id}")
async def get_employee(
    employee_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get detailed employee information.
    
    Args:
        employee_id: Employee ID
        current_user: Current authenticated user
        
    Returns:
        dict: Employee details
    """
    try:
        supabase = get_supabase_client()
        
        # Build query with user information
        query = supabase.table('employees').select('''
            *,
            users:user_id (
                email,
                full_name,
                last_login,
                is_active,
                learning_preferences
            )
        ''').eq('id', employee_id)
        
        # Apply company filter for non-super admins
        if current_user['role'] != UserRoles.SUPER_ADMIN:
            query = query.eq('company_id', current_user['company_id'])
        
        result = query.execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee not found"
            )
        
        employee = result.data[0]
        
        # Get course assignments
        assignments_result = supabase.table('course_assignments').select('''
            *,
            cm_module_content:course_id (
                module_name,
                status,
                total_word_count
            )
        ''').eq('employee_id', employee_id).execute()
        
        employee['course_assignments'] = assignments_result.data
        
        # Get learning statistics
        completed_courses = len([a for a in assignments_result.data if a.get('status') == 'completed'])
        in_progress_courses = len([a for a in assignments_result.data if a.get('status') == 'in_progress'])
        
        employee['learning_stats'] = {
            'completed_courses': completed_courses,
            'in_progress_courses': in_progress_courses,
            'total_assigned_courses': len(assignments_result.data)
        }
        
        return employee
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get employee error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve employee"
        )


@router.put("/{employee_id}")
async def update_employee(
    employee_id: str,
    employee_data: EmployeeUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update employee information.
    
    Args:
        employee_id: Employee ID
        employee_data: Updated employee information
        current_user: Current authenticated user
        
    Returns:
        dict: Updated employee record
    """
    try:
        # Check permissions
        if not has_permission(current_user, 'manage_employees'):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to update employees"
            )
        
        supabase = get_supabase_client()
        
        # Verify employee exists and belongs to company
        query = supabase.table('employees').select('*').eq('id', employee_id)
        
        if current_user['role'] != UserRoles.SUPER_ADMIN:
            query = query.eq('company_id', current_user['company_id'])
        
        existing_result = query.execute()
        
        if not existing_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee not found"
            )
        
        # Prepare update data
        update_data = {k: v for k, v in employee_data.dict().items() if v is not None}
        update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
        
        # Update employee record
        result = supabase.table('employees').update(update_data).eq('id', employee_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update employee"
            )
        
        logger.info(f"Employee updated: {employee_id}")
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Employee update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Employee update failed"
        )


@router.delete("/{employee_id}")
async def delete_employee(
    employee_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Deactivate an employee (soft delete).
    
    Args:
        employee_id: Employee ID
        current_user: Current authenticated user
        
    Returns:
        dict: Success message
    """
    try:
        # Check permissions
        if not has_permission(current_user, 'manage_employees'):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to delete employees"
            )
        
        supabase = get_supabase_client()
        
        # Verify employee exists and belongs to company
        query = supabase.table('employees').select('user_id').eq('id', employee_id)
        
        if current_user['role'] != UserRoles.SUPER_ADMIN:
            query = query.eq('company_id', current_user['company_id'])
        
        existing_result = query.execute()
        
        if not existing_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee not found"
            )
        
        employee = existing_result.data[0]
        
        # Soft delete employee
        employee_result = supabase.table('employees').update({
            'is_active': False,
            'updated_at': datetime.now(timezone.utc).isoformat()
        }).eq('id', employee_id).execute()
        
        # Deactivate associated user account if exists
        if employee.get('user_id'):
            supabase.table('users').update({
                'is_active': False,
                'updated_at': datetime.now(timezone.utc).isoformat()
            }).eq('id', employee['user_id']).execute()
        
        logger.info(f"Employee deactivated: {employee_id}")
        
        return {"message": "Employee deactivated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Employee deletion error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Employee deletion failed"
        )


@router.post("/bulk-import", response_model=BulkImportResult)
async def bulk_import_employees(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Bulk import employees from CSV file.
    
    Expected CSV columns: full_name, email, department, position, current_role, career_goal, skill_level
    
    Args:
        file: CSV file upload
        current_user: Current authenticated user
        
    Returns:
        BulkImportResult: Import results
    """
    try:
        # Check permissions
        if not has_permission(current_user, 'manage_employees'):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to import employees"
            )
        
        # Validate file type
        if not file.filename.endswith('.csv'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be a CSV"
            )
        
        # Read CSV content
        content = await file.read()
        csv_content = content.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(csv_content))
        
        supabase = get_supabase_client()
        
        total_processed = 0
        successful = 0
        failed = 0
        errors = []
        created_employee_ids = []
        
        for row_num, row in enumerate(csv_reader, start=2):  # Start at 2 for header row
            total_processed += 1
            
            try:
                # Validate required fields
                if not row.get('full_name'):
                    errors.append(f"Row {row_num}: Missing full_name")
                    failed += 1
                    continue
                
                # Create employee data
                employee_data = EmployeeCreate(
                    email=row.get('email') or None,
                    full_name=row['full_name'],
                    employee_id=row.get('employee_id'),
                    department=row.get('department'),
                    position=row.get('position'),
                    current_role=row.get('current_role'),
                    career_goal=row.get('career_goal'),
                    skill_level=row.get('skill_level', 'beginner'),
                    key_tools=row.get('key_tools', '').split(',') if row.get('key_tools') else [],
                    hired_date=row.get('hired_date')
                )
                
                # Create employee (reuse the creation logic)
                employee_id = str(uuid.uuid4())
                employee_record = {
                    'id': employee_id,
                    'company_id': current_user['company_id'],
                    'employee_id': employee_data.employee_id,
                    'department': employee_data.department,
                    'position': employee_data.position,
                    'current_role': employee_data.current_role,
                    'career_goal': employee_data.career_goal,
                    'skill_level': employee_data.skill_level,
                    'key_tools': employee_data.key_tools,
                    'hired_date': employee_data.hired_date,
                    'is_active': True
                }
                
                # Create user account if email provided
                user_id = None
                if employee_data.email:
                    # Check if user already exists
                    existing_user = supabase.table('users').select('id').eq('email', employee_data.email).execute()
                    
                    if existing_user.data:
                        errors.append(f"Row {row_num}: Email {employee_data.email} already exists")
                        failed += 1
                        continue
                    
                    # Create user account
                    user_id = str(uuid.uuid4())
                    default_password = "TempPass123!"
                    
                    user_record = {
                        'id': user_id,
                        'email': employee_data.email,
                        'password_hash': hash_password(default_password),
                        'full_name': employee_data.full_name,
                        'role': UserRoles.LEARNER,
                        'company_id': current_user['company_id'],
                        'is_active': True,
                        'email_verified': False
                    }
                    
                    user_result = supabase.table('users').insert(user_record).execute()
                    
                    if not user_result.data:
                        errors.append(f"Row {row_num}: Failed to create user account")
                        failed += 1
                        continue
                
                # Add user_id to employee record
                employee_record['user_id'] = user_id
                
                # Insert employee record
                result = supabase.table('employees').insert(employee_record).execute()
                
                if result.data:
                    successful += 1
                    created_employee_ids.append(employee_id)
                else:
                    failed += 1
                    errors.append(f"Row {row_num}: Failed to create employee record")
                    # Cleanup user if employee creation failed
                    if user_id:
                        supabase.table('users').delete().eq('id', user_id).execute()
                
            except Exception as e:
                failed += 1
                errors.append(f"Row {row_num}: {str(e)}")
        
        logger.info(f"Bulk import completed: {successful}/{total_processed} successful")
        
        return BulkImportResult(
            total_processed=total_processed,
            successful=successful,
            failed=failed,
            errors=errors,
            created_employee_ids=created_employee_ids
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Bulk import error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Bulk import failed"
        )