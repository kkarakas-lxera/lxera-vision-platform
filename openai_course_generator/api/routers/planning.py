"""
Planning agent router for the Lxera Agent Pipeline API.

This router wraps the standalone planning agent functionality
in FastAPI endpoints with proper request/response handling.
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import logging
import time
from datetime import datetime
from typing import Dict, Any

from api.models.requests import PlanningRequest
from api.models.responses import PlanningResponse, PlanningExecutionSummary, TraceInfo, NextStep, ErrorResponse
from api.services.planning_service import PlanningService
from api.utils.auth import get_current_user
from api.utils.errors import AgentExecutionError, ErrorCode
from api.utils.tracing import extract_trace_info

logger = logging.getLogger(__name__)
security = HTTPBearer()

router = APIRouter()

# Initialize planning service
planning_service = PlanningService()


@router.post("/execute", response_model=PlanningResponse)
async def execute_planning(
    request: PlanningRequest,
    background_tasks: BackgroundTasks,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Execute the planning agent to create a comprehensive course plan.
    
    This endpoint wraps the standalone planning agent functionality,
    providing the same OpenAI trace visibility while returning structured
    API responses.
    
    **Process:**
    1. Validates employee data and skills gaps
    2. Executes planning agent with tool calls visible in OpenAI traces
    3. Generates course structure with prioritized modules
    4. Stores plan in database and returns plan_id
    
    **Returns:**
    - plan_id: UUID for the generated course plan
    - execution_summary: Metrics about the planning process
    - traces: OpenAI trace information for observability
    - next_step: Information about the research phase
    """
    
    logger.info(f"📝 Planning execution requested by user {current_user.get('user_id')}")
    logger.info(f"   Employee: {request.employee_data.full_name}")
    logger.info(f"   Session: {request.session_metadata.session_id}")
    
    start_time = time.time()
    
    try:
        # Validate company_id matches authenticated user
        if current_user.get('company_id') != request.session_metadata.company_id:
            raise HTTPException(
                status_code=403,
                detail="Company ID mismatch - user cannot access this company's data"
            )
        
        # Execute planning agent
        logger.info("🚀 Starting planning agent execution...")
        result = await planning_service.execute_planning(request)
        
        execution_time = time.time() - start_time
        logger.info(f"✅ Planning completed in {execution_time:.2f}s")
        
        # Extract execution metrics
        agent_turns = getattr(result, 'agent_turns', 0)
        plan_id = result.plan_id
        
        # Get course details from the result
        course_details = await planning_service.get_plan_details(plan_id)
        
        # Create execution summary
        execution_summary = PlanningExecutionSummary(
            course_title=course_details.get('course_title', 'Personalized Development Course'),
            total_modules=course_details.get('total_modules', 0),
            duration_weeks=course_details.get('course_duration_weeks', 4),
            skill_gaps_addressed=len(request.skills_gaps.Critical_Skill_Gaps.gaps) + 
                              len(request.skills_gaps.High_Priority_Gaps.gaps),
            execution_time_seconds=execution_time,
            agent_turns=agent_turns,
            timestamp=datetime.utcnow(),
            status="success"
        )
        
        # Extract trace information
        traces = extract_trace_info(result, "planning", request.session_metadata.session_id)
        
        # Create next step information
        next_step = NextStep(
            endpoint="/api/v1/research/execute",
            required_params=["plan_id"],
            description="Execute research phase using the generated course plan"
        )
        
        # Add background task for analytics
        background_tasks.add_task(
            _log_planning_analytics,
            request.session_metadata.session_id,
            plan_id,
            execution_time,
            agent_turns,
            current_user.get('company_id')
        )
        
        response = PlanningResponse(
            success=True,
            plan_id=plan_id,
            execution_summary=execution_summary,
            traces=traces,
            next_step=next_step
        )
        
        logger.info(f"📊 Planning response prepared: plan_id={plan_id}")
        return response
        
    except Exception as e:
        execution_time = time.time() - start_time
        logger.error(f"❌ Planning execution failed after {execution_time:.2f}s: {e}")
        
        # Determine error type and create appropriate response
        if "OpenAI" in str(e):
            error_code = ErrorCode.OPENAI_API_ERROR
        elif "database" in str(e).lower():
            error_code = ErrorCode.DATABASE_ERROR
        else:
            error_code = ErrorCode.PLANNING_FAILED
        
        raise AgentExecutionError(
            error_code=error_code,
            details=str(e),
            agent_type="planning",
            session_id=request.session_metadata.session_id
        )


@router.get("/status/{plan_id}")
async def get_planning_status(
    plan_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get the status of a planning execution.
    
    **Parameters:**
    - plan_id: UUID of the course plan to check
    
    **Returns:**
    - Plan details and current status
    - Execution metrics if available
    """
    
    logger.info(f"📊 Planning status requested for plan_id: {plan_id}")
    
    try:
        # Get plan details from database
        plan_details = await planning_service.get_plan_details(plan_id)
        
        if not plan_details:
            raise HTTPException(
                status_code=404,
                detail=f"Plan {plan_id} not found"
            )
        
        # Verify user has access to this plan
        plan_company_id = plan_details.get('company_id')
        if plan_company_id and plan_company_id != current_user.get('company_id'):
            raise HTTPException(
                status_code=403,
                detail="Access denied - plan belongs to different company"
            )
        
        return {
            "plan_id": plan_id,
            "status": plan_details.get('status', 'unknown'),
            "course_title": plan_details.get('course_title'),
            "employee_name": plan_details.get('employee_name'),
            "total_modules": plan_details.get('total_modules', 0),
            "duration_weeks": plan_details.get('course_duration_weeks', 0),
            "created_at": plan_details.get('created_at'),
            "ready_for_research": plan_details.get('status') == 'completed'
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to get planning status: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve planning status"
        )


@router.get("/plans")
async def list_user_plans(
    limit: int = 10,
    offset: int = 0,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    List course plans for the authenticated user's company.
    
    **Parameters:**
    - limit: Maximum number of plans to return (default: 10)
    - offset: Number of plans to skip (default: 0)
    
    **Returns:**
    - List of course plans with basic information
    """
    
    logger.info(f"📋 Plans list requested by user {current_user.get('user_id')}")
    
    try:
        plans = await planning_service.list_plans(
            company_id=current_user.get('company_id'),
            limit=limit,
            offset=offset
        )
        
        return {
            "plans": plans,
            "total": len(plans),
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to list plans: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve plans"
        )


async def _log_planning_analytics(
    session_id: str,
    plan_id: str, 
    execution_time: float,
    agent_turns: int,
    company_id: str
):
    """Background task to log planning analytics."""
    try:
        # Log to analytics system (could be database, external service, etc.)
        analytics_data = {
            "event": "planning_completed",
            "session_id": session_id,
            "plan_id": plan_id,
            "execution_time_seconds": execution_time,
            "agent_turns": agent_turns,
            "company_id": company_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        logger.info(f"📈 Planning analytics logged: {analytics_data}")
        
        # Here you could send to analytics service:
        # await analytics_service.log_event(analytics_data)
        
    except Exception as e:
        logger.error(f"❌ Failed to log planning analytics: {e}")