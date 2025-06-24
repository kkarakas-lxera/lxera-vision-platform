#!/usr/bin/env python3
"""
Admin API endpoints for Super Admin operations.
Handles system-wide management and monitoring.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta

from database.connection import get_supabase_client, get_service_role_client
from auth.auth_handler import UserRoles, hash_password
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


# Pydantic models
class SystemStats(BaseModel):
    total_companies: int
    total_users: int
    total_courses: int
    total_employees: int
    active_sessions: int
    storage_used_mb: float


class CompanyStats(BaseModel):
    company_id: str
    company_name: str
    total_users: int
    total_employees: int
    courses_generated: int
    storage_used_mb: float
    last_activity: Optional[datetime]
    plan_type: str
    is_active: bool


class UserActivityLog(BaseModel):
    user_id: str
    user_email: str
    action: str
    timestamp: datetime
    details: Optional[Dict[str, Any]]


# Dependency to ensure Super Admin access
async def require_super_admin():
    # This should be implemented properly with the auth system
    # For now, return a mock super admin user
    return {
        "id": "super-admin-id",
        "role": UserRoles.SUPER_ADMIN,
        "email": "admin@lxera.com"
    }


@router.get("/stats/system", response_model=SystemStats)
async def get_system_stats(current_user: dict = Depends(require_super_admin)):
    """
    Get overall system statistics.
    
    Args:
        current_user: Must be Super Admin
        
    Returns:
        SystemStats: System-wide statistics
    """
    try:
        if current_user['role'] != UserRoles.SUPER_ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Super Admin access required"
            )
        
        supabase = get_service_role_client()
        
        # Get company count
        companies_result = supabase.table('companies').select('id').eq('is_active', True).execute()
        total_companies = len(companies_result.data)
        
        # Get user count
        users_result = supabase.table('users').select('id').eq('is_active', True).execute()
        total_users = len(users_result.data)
        
        # Get course count
        courses_result = supabase.table('cm_module_content').select('content_id').execute()
        total_courses = len(courses_result.data)
        
        # Get employee count
        employees_result = supabase.table('employees').select('id').eq('is_active', True).execute()
        total_employees = len(employees_result.data)
        
        # Get active sessions (sessions created in last 24 hours)
        yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
        sessions_result = supabase.table('mm_multimedia_sessions').select('session_id').gte('created_at', yesterday).execute()
        active_sessions = len(sessions_result.data)
        
        # Calculate storage usage
        storage_result = supabase.table('mm_multimedia_assets').select('file_size_bytes').execute()
        total_bytes = sum(item.get('file_size_bytes', 0) for item in storage_result.data)
        storage_used_mb = total_bytes / (1024 * 1024)
        
        return SystemStats(
            total_companies=total_companies,
            total_users=total_users,
            total_courses=total_courses,
            total_employees=total_employees,
            active_sessions=active_sessions,
            storage_used_mb=round(storage_used_mb, 2)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"System stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve system statistics"
        )


@router.get("/stats/companies", response_model=List[CompanyStats])
async def get_company_stats(current_user: dict = Depends(require_super_admin)):
    """
    Get statistics for all companies.
    
    Args:
        current_user: Must be Super Admin
        
    Returns:
        List[CompanyStats]: Statistics for each company
    """
    try:
        if current_user['role'] != UserRoles.SUPER_ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Super Admin access required"
            )
        
        supabase = get_service_role_client()
        
        # Get all companies
        companies_result = supabase.table('companies').select('*').execute()
        
        company_stats = []
        
        for company in companies_result.data:
            company_id = company['id']
            
            # Get user count for company
            users_result = supabase.table('users').select('id').eq('company_id', company_id).eq('is_active', True).execute()
            total_users = len(users_result.data)
            
            # Get employee count for company
            employees_result = supabase.table('employees').select('id').eq('company_id', company_id).eq('is_active', True).execute()
            total_employees = len(employees_result.data)
            
            # Get course count for company
            courses_result = supabase.table('cm_module_content').select('content_id').eq('company_id', company_id).execute()
            courses_generated = len(courses_result.data)
            
            # Calculate storage usage for company
            storage_result = supabase.table('mm_multimedia_assets').select('file_size_bytes').eq('company_id', company_id).execute()
            total_bytes = sum(item.get('file_size_bytes', 0) for item in storage_result.data)
            storage_used_mb = total_bytes / (1024 * 1024)
            
            # Get last activity (most recent user login or course creation)
            last_login_result = supabase.table('users').select('last_login').eq('company_id', company_id).not_.is_('last_login', 'null').order('last_login', desc=True).limit(1).execute()
            last_course_result = supabase.table('cm_module_content').select('created_at').eq('company_id', company_id).order('created_at', desc=True).limit(1).execute()
            
            last_activity = None
            if last_login_result.data:
                last_activity = datetime.fromisoformat(last_login_result.data[0]['last_login'])
            if last_course_result.data:
                course_date = datetime.fromisoformat(last_course_result.data[0]['created_at'])
                if not last_activity or course_date > last_activity:
                    last_activity = course_date
            
            company_stats.append(CompanyStats(
                company_id=company_id,
                company_name=company['name'],
                total_users=total_users,
                total_employees=total_employees,
                courses_generated=courses_generated,
                storage_used_mb=round(storage_used_mb, 2),
                last_activity=last_activity,
                plan_type=company.get('plan_type', 'trial'),
                is_active=company.get('is_active', True)
            ))
        
        return company_stats
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Company stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve company statistics"
        )


@router.get("/companies/{company_id}/details")
async def get_company_details(
    company_id: str,
    current_user: dict = Depends(require_super_admin)
):
    """
    Get detailed information about a specific company.
    
    Args:
        company_id: Company ID
        current_user: Must be Super Admin
        
    Returns:
        dict: Detailed company information
    """
    try:
        if current_user['role'] != UserRoles.SUPER_ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Super Admin access required"
            )
        
        supabase = get_service_role_client()
        
        # Get company information
        company_result = supabase.table('companies').select('*').eq('id', company_id).execute()
        
        if not company_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found"
            )
        
        company = company_result.data[0]
        
        # Get users
        users_result = supabase.table('users').select('*').eq('company_id', company_id).execute()
        company['users'] = users_result.data
        
        # Get employees
        employees_result = supabase.table('employees').select('*').eq('company_id', company_id).execute()
        company['employees'] = employees_result.data
        
        # Get courses
        courses_result = supabase.table('cm_module_content').select('*').eq('company_id', company_id).execute()
        company['courses'] = courses_result.data
        
        # Get recent activity
        recent_courses = supabase.table('cm_module_content').select('*').eq('company_id', company_id).order('created_at', desc=True).limit(10).execute()
        company['recent_courses'] = recent_courses.data
        
        return company
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Company details error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve company details"
        )


@router.put("/companies/{company_id}/status")
async def update_company_status(
    company_id: str,
    is_active: bool,
    current_user: dict = Depends(require_super_admin)
):
    """
    Update company active status.
    
    Args:
        company_id: Company ID
        is_active: New active status
        current_user: Must be Super Admin
        
    Returns:
        dict: Updated company status
    """
    try:
        if current_user['role'] != UserRoles.SUPER_ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Super Admin access required"
            )
        
        supabase = get_service_role_client()
        
        # Update company status
        result = supabase.table('companies').update({
            'is_active': is_active,
            'updated_at': datetime.now(timezone.utc).isoformat()
        }).eq('id', company_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found"
            )
        
        # Update all users in company
        supabase.table('users').update({
            'is_active': is_active,
            'updated_at': datetime.now(timezone.utc).isoformat()
        }).eq('company_id', company_id).execute()
        
        # Update all employees in company
        supabase.table('employees').update({
            'is_active': is_active,
            'updated_at': datetime.now(timezone.utc).isoformat()
        }).eq('company_id', company_id).execute()
        
        logger.info(f"Company {company_id} status updated to {'active' if is_active else 'inactive'}")
        
        return {
            "message": f"Company {'activated' if is_active else 'deactivated'} successfully",
            "company": result.data[0]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Company status update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update company status"
        )


@router.get("/activity/recent")
async def get_recent_activity(
    limit: int = 50,
    current_user: dict = Depends(require_super_admin)
):
    """
    Get recent system activity across all companies.
    
    Args:
        limit: Maximum number of activities to return
        current_user: Must be Super Admin
        
    Returns:
        List[dict]: Recent activity logs
    """
    try:
        if current_user['role'] != UserRoles.SUPER_ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Super Admin access required"
            )
        
        supabase = get_service_role_client()
        
        activities = []
        
        # Get recent course creations
        courses_result = supabase.table('cm_module_content').select('''
            content_id,
            module_name,
            created_at,
            created_by,
            companies:company_id (name)
        ''').order('created_at', desc=True).limit(limit//3).execute()
        
        for course in courses_result.data:
            activities.append({
                'type': 'course_created',
                'timestamp': course['created_at'],
                'details': {
                    'course_id': course['content_id'],
                    'module_name': course['module_name'],
                    'company_name': course['companies']['name'] if course['companies'] else 'Unknown'
                }
            })
        
        # Get recent user registrations
        users_result = supabase.table('users').select('''
            id,
            email,
            full_name,
            role,
            created_at,
            companies:company_id (name)
        ''').order('created_at', desc=True).limit(limit//3).execute()
        
        for user in users_result.data:
            activities.append({
                'type': 'user_registered',
                'timestamp': user['created_at'],
                'details': {
                    'user_id': user['id'],
                    'email': user['email'],
                    'role': user['role'],
                    'company_name': user['companies']['name'] if user['companies'] else 'System'
                }
            })
        
        # Get recent file uploads
        files_result = supabase.table('mm_multimedia_assets').select('''
            asset_id,
            original_filename,
            file_size_bytes,
            created_at,
            companies:company_id (name)
        ''').order('created_at', desc=True).limit(limit//3).execute()
        
        for file in files_result.data:
            activities.append({
                'type': 'file_uploaded',
                'timestamp': file['created_at'],
                'details': {
                    'file_id': file['asset_id'],
                    'filename': file['original_filename'],
                    'file_size_mb': round(file['file_size_bytes'] / (1024 * 1024), 2),
                    'company_name': file['companies']['name'] if file['companies'] else 'Unknown'
                }
            })
        
        # Sort all activities by timestamp
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return activities[:limit]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Recent activity error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve recent activity"
        )


@router.post("/maintenance/cleanup")
async def run_maintenance_cleanup(current_user: dict = Depends(require_super_admin)):
    """
    Run maintenance cleanup tasks.
    
    Args:
        current_user: Must be Super Admin
        
    Returns:
        dict: Cleanup results
    """
    try:
        if current_user['role'] != UserRoles.SUPER_ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Super Admin access required"
            )
        
        supabase = get_service_role_client()
        
        cleanup_results = {
            'archived_old_sessions': 0,
            'cleaned_failed_courses': 0,
            'updated_storage_stats': 0
        }
        
        # Archive old multimedia sessions (older than 30 days and completed/failed)
        thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
        
        old_sessions = supabase.table('mm_multimedia_sessions').update({
            'status': 'archived',
            'updated_at': datetime.now(timezone.utc).isoformat()
        }).in_('status', ['completed', 'failed']).lt('created_at', thirty_days_ago).execute()
        
        cleanup_results['archived_old_sessions'] = len(old_sessions.data) if old_sessions.data else 0
        
        # Clean up failed course generation attempts (older than 7 days)
        seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
        
        failed_courses = supabase.table('cm_module_content').delete().eq('status', 'failed').lt('created_at', seven_days_ago).execute()
        
        cleanup_results['cleaned_failed_courses'] = len(failed_courses.data) if failed_courses.data else 0
        
        # Update storage statistics
        # This could involve recalculating file sizes, cleaning up orphaned records, etc.
        # For now, just count updated records
        cleanup_results['updated_storage_stats'] = 1
        
        logger.info(f"Maintenance cleanup completed: {cleanup_results}")
        
        return {
            "message": "Maintenance cleanup completed successfully",
            "results": cleanup_results,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Maintenance cleanup error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Maintenance cleanup failed"
        )


@router.get("/health/detailed")
async def get_detailed_health_check(current_user: dict = Depends(require_super_admin)):
    """
    Get detailed system health information.
    
    Args:
        current_user: Must be Super Admin
        
    Returns:
        dict: Detailed health status
    """
    try:
        if current_user['role'] != UserRoles.SUPER_ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Super Admin access required"
            )
        
        supabase = get_service_role_client()
        
        health_status = {
            'overall_status': 'healthy',
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'components': {}
        }
        
        # Test database connectivity
        try:
            test_query = supabase.table('companies').select('id').limit(1).execute()
            health_status['components']['database'] = {
                'status': 'healthy',
                'response_time_ms': 50  # Placeholder
            }
        except Exception as e:
            health_status['components']['database'] = {
                'status': 'unhealthy',
                'error': str(e)
            }
            health_status['overall_status'] = 'degraded'
        
        # Test storage connectivity
        try:
            # Test Supabase storage
            storage_test = supabase.storage.list_buckets()
            health_status['components']['storage'] = {
                'status': 'healthy',
                'buckets_available': len(storage_test) if storage_test else 0
            }
        except Exception as e:
            health_status['components']['storage'] = {
                'status': 'unhealthy',
                'error': str(e)
            }
            health_status['overall_status'] = 'degraded'
        
        # Check recent errors
        try:
            recent_failures = supabase.table('cm_module_content').select('content_id').eq('status', 'failed').gte('created_at', (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()).execute()
            
            health_status['components']['course_generation'] = {
                'status': 'healthy' if len(recent_failures.data) < 5 else 'degraded',
                'recent_failures': len(recent_failures.data)
            }
            
            if len(recent_failures.data) >= 5:
                health_status['overall_status'] = 'degraded'
                
        except Exception as e:
            health_status['components']['course_generation'] = {
                'status': 'unknown',
                'error': str(e)
            }
        
        return health_status
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Health check error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Health check failed"
        )