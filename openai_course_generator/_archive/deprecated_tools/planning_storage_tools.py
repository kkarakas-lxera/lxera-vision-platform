"""
Planning Agent Storage Tools

Tools for storing planning agent outputs in the database.
"""

import os
import uuid
import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from supabase import create_client
from agents import function_tool
from .storage_models import (
    CourseStructure, PrioritizedGaps, ResearchStrategy, LearningPath,
    EmployeeProfile, ToolCall,
    course_structure_to_dict, prioritized_gaps_to_dict
)

logger = logging.getLogger(__name__)

# Initialize Supabase client
SUPABASE_URL = 'https://xwfweumeryrgbguwrocr.supabase.co'
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZndldW1lcnlyZ2JndXdyb2NyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc2MzQ0MCwiZXhwIjoyMDY2MzM5NDQwfQ.qxXpBxUKhKA4AQT4UQnIEJGbGNrRDMbBroZU8YaypSY')
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

@function_tool
def store_course_plan(
    employee_id: str,
    employee_name: str,
    session_id: str,
    course_structure: CourseStructure,
    prioritized_gaps: PrioritizedGaps,
    research_strategy: Optional[ResearchStrategy] = None,
    learning_path: Optional[LearningPath] = None
) -> str:
    """
    Store course plan in the cm_course_plans table.
    
    Args:
        employee_id: UUID of the employee
        employee_name: Full name of the employee
        session_id: Session identifier for this course generation
        course_structure: The planned course structure with modules and timeline
        prioritized_gaps: Skills gaps prioritized by criticality
        research_strategy: Optional research strategy for content creation
        learning_path: Optional personalized learning path details
        
    Returns:
        plan_id: UUID of the created course plan
    """
    try:
        logger.info(f"📝 Storing course plan for {employee_name}")
        
        # Convert models to dictionaries
        course_structure_dict = course_structure_to_dict(course_structure)
        prioritized_gaps_dict = prioritized_gaps_to_dict(prioritized_gaps)
        
        # Extract metadata from course structure
        course_title = course_structure.title
        total_modules = len(course_structure.modules)
        course_duration_weeks = course_structure.duration_weeks
        
        # Prepare plan data
        plan_data = {
            'employee_id': employee_id,
            'employee_name': employee_name,
            'session_id': session_id,
            'course_structure': course_structure_dict,
            'prioritized_gaps': prioritized_gaps_dict,
            'research_strategy': research_strategy.model_dump() if research_strategy else None,
            'learning_path': learning_path.model_dump() if learning_path else None,
            'course_title': course_title,
            'total_modules': total_modules,
            'course_duration_weeks': course_duration_weeks,
            'planning_agent_version': 'v1',
            'status': 'completed'
        }
        
        # Insert into database
        result = supabase.table('cm_course_plans').insert(plan_data).execute()
        
        if result.data and len(result.data) > 0:
            plan_id = result.data[0]['plan_id']
            logger.info(f"✅ Course plan stored successfully with ID: {plan_id}")
            return plan_id
        else:
            raise Exception("No data returned from insert")
            
    except Exception as e:
        logger.error(f"❌ Failed to store course plan: {e}")
        raise Exception(f"Failed to store course plan: {str(e)}")

@function_tool
def store_planning_metadata(
    plan_id: str,
    employee_profile: EmployeeProfile,
    tool_calls: List[ToolCall],
    execution_time: float,
    agent_turns: int
) -> bool:
    """
    Store planning agent metadata and execution details.
    
    Args:
        plan_id: UUID of the course plan
        employee_profile: Analyzed employee profile data
        tool_calls: List of tool calls made during planning
        execution_time: Time taken for planning in seconds
        agent_turns: Number of turns the agent took
        
    Returns:
        success: Boolean indicating if metadata was stored successfully
    """
    try:
        logger.info(f"📊 Storing planning metadata for plan {plan_id}")
        
        # Update the course plan with metadata
        update_data = {
            'employee_profile': employee_profile.model_dump(),
            'tool_calls': [tc.model_dump() for tc in tool_calls],
            'execution_time_seconds': execution_time,
            'agent_turns': agent_turns,
            'updated_at': datetime.utcnow().isoformat()
        }
        
        result = supabase.table('cm_course_plans').update(update_data).eq('plan_id', plan_id).execute()
        
        if result.data:
            logger.info("✅ Planning metadata stored successfully")
            return True
        else:
            logger.warning("⚠️ No rows updated when storing metadata")
            return False
            
    except Exception as e:
        logger.error(f"❌ Failed to store planning metadata: {e}")
        return False

@function_tool
def get_course_plan(plan_id: str) -> Dict[str, Any]:
    """
    Retrieve a course plan by ID.
    
    Args:
        plan_id: UUID of the course plan
        
    Returns:
        Course plan data including structure and metadata
    """
    try:
        result = supabase.table('cm_course_plans').select('*').eq('plan_id', plan_id).single().execute()
        
        if result.data:
            logger.info(f"✅ Retrieved course plan: {result.data['course_title']}")
            return result.data
        else:
            raise Exception("Course plan not found")
            
    except Exception as e:
        logger.error(f"❌ Failed to retrieve course plan: {e}")
        raise Exception(f"Failed to retrieve course plan: {str(e)}")

@function_tool  
def update_course_plan_status(plan_id: str, status: str) -> bool:
    """
    Update the status of a course plan.
    
    Args:
        plan_id: UUID of the course plan
        status: New status (planning, completed, failed)
        
    Returns:
        success: Boolean indicating if update was successful
    """
    try:
        valid_statuses = ['planning', 'completed', 'failed']
        if status not in valid_statuses:
            raise ValueError(f"Invalid status. Must be one of: {valid_statuses}")
            
        result = supabase.table('cm_course_plans').update({
            'status': status,
            'updated_at': datetime.utcnow().isoformat()
        }).eq('plan_id', plan_id).execute()
        
        if result.data:
            logger.info(f"✅ Updated course plan status to: {status}")
            return True
        else:
            return False
            
    except Exception as e:
        logger.error(f"❌ Failed to update course plan status: {e}")
        return False