#!/usr/bin/env python3
"""
Standalone Planning Storage Tools - No lxera-agents dependency
Direct Supabase integration for storing course plans and metadata.
"""

import json
import logging
import os
import uuid
from datetime import datetime
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

def get_supabase_client():
    """Get Supabase client for database operations."""
    from supabase import create_client
    
    supabase_url = os.getenv('SUPABASE_URL', 'https://xwfweumeryrgbguwrocr.supabase.co')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_key:
        raise Exception("SUPABASE_SERVICE_ROLE_KEY not found in environment")
    
    return create_client(supabase_url, supabase_key)


def store_course_plan(
    employee_id: str,
    employee_name: str, 
    session_id: str,
    course_structure: str,
    prioritized_gaps: str,
    research_strategy: str,
    learning_path: str,
    research_queries: str,
    company_id: Optional[str] = None
) -> str:
    """
    Store the course plan with research queries in cm_course_plans.
    
    Returns status string containing plan_id.
    """
    try:
        logger.info(f"💾 Storing course plan for {employee_name}...")
        
        supabase = get_supabase_client()
        plan_id = str(uuid.uuid4())
        
        # Parse JSON strings for validation
        try:
            structure_data = json.loads(course_structure) if isinstance(course_structure, str) else course_structure
            gaps_data = json.loads(prioritized_gaps) if isinstance(prioritized_gaps, str) else prioritized_gaps
            strategy_data = json.loads(research_strategy) if isinstance(research_strategy, str) else research_strategy
            path_data = json.loads(learning_path) if isinstance(learning_path, str) else learning_path
            queries_data = json.loads(research_queries) if isinstance(research_queries, str) else research_queries
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error in course plan data: {e}")
            return json.dumps({"error": f"Invalid JSON in course plan data: {e}", "success": False})
        
        # Extract course metadata
        course_title = structure_data.get("course_title", "Personalized Learning Course")
        total_modules = len(structure_data.get("modules", []))
        duration_weeks = structure_data.get("total_duration_weeks", 4)
        
        # Prepare course plan record
        course_plan_record = {
            "plan_id": plan_id,
            "employee_id": employee_id,
            "employee_name": employee_name,
            "session_id": session_id,
            "company_id": company_id,
            "course_title": course_title,
            "course_structure": structure_data,
            "prioritized_gaps": gaps_data,
            "research_strategy": strategy_data,
            "learning_path": path_data,
            "research_queries": queries_data,
            "total_modules": total_modules,
            "course_duration_weeks": duration_weeks,
            "status": "completed",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        # Insert into database
        result = supabase.table('cm_course_plans').insert(course_plan_record).execute()
        
        if result.data:
            logger.info(f"✅ Course plan stored successfully with ID: {plan_id}")
            return f"Course plan stored successfully with ID: {plan_id}"
        else:
            logger.error(f"❌ Failed to store course plan: {result}")
            return json.dumps({"error": "Failed to store course plan in database", "success": False})
            
    except Exception as e:
        logger.error(f"❌ Course plan storage failed: {e}")
        return json.dumps({"error": str(e), "success": False})


def store_planning_metadata(
    plan_id: str,
    employee_profile: str,
    tool_calls: str,
    execution_time: float,
    agent_turns: int
) -> str:
    """
    Store planning metadata for a plan.
    
    Returns status string.
    """
    try:
        logger.info(f"📊 Storing planning metadata for plan: {plan_id}")
        
        supabase = get_supabase_client()
        metadata_id = str(uuid.uuid4())
        
        # Parse tool calls data
        try:
            tool_calls_data = json.loads(tool_calls) if isinstance(tool_calls, str) else tool_calls
        except json.JSONDecodeError:
            tool_calls_data = {"tool_calls": tool_calls}
        
        # Prepare metadata record
        metadata_record = {
            "metadata_id": metadata_id,
            "plan_id": plan_id,
            "employee_profile": employee_profile,
            "tool_calls": tool_calls_data,
            "execution_time": execution_time,
            "agent_turns": agent_turns,
            "performance_metrics": {
                "avg_time_per_turn": execution_time / max(agent_turns, 1),
                "tools_used_count": len(tool_calls_data.get("tool_calls", [])) if isinstance(tool_calls_data, dict) else 0
            },
            "created_at": datetime.now().isoformat()
        }
        
        # Insert into database
        result = supabase.table('cm_planning_metadata').insert(metadata_record).execute()
        
        if result.data:
            logger.info(f"✅ Planning metadata stored with ID: {metadata_id}")
            return f"Planning metadata stored successfully with ID: {metadata_id}"
        else:
            logger.error(f"❌ Failed to store planning metadata: {result}")
            return json.dumps({"error": "Failed to store planning metadata", "success": False})
            
    except Exception as e:
        logger.error(f"❌ Planning metadata storage failed: {e}")
        return json.dumps({"error": str(e), "success": False})
