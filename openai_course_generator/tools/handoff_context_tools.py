"""
Handoff Context Tools

Provides utilities for passing context between agents during handoffs.
Uses the OpenAI SDK's handoff mechanism with proper context management.
"""

import os
import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from supabase import create_client
from agents import FunctionTool

logger = logging.getLogger(__name__)

# Initialize Supabase client
SUPABASE_URL = 'https://xwfweumeryrgbguwrocr.supabase.co'
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZndldW1lcnlyZ2JndXdyb2NyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc2MzQ0MCwiZXhwIjoyMDY2MzM5NDQwfQ.qxXpBxUKhKA4AQT4UQnIEJGbGNrRDMbBroZU8YaypSY')
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

class HandoffContext:
    """Manages context for agent handoffs."""
    
    def __init__(self):
        self.context_store = {}
    
    def prepare_planning_to_research_context(
        self,
        plan_id: str,
        course_structure: Dict[str, Any],
        research_queries: List[str],
        prioritized_gaps: Dict[str, Any],
        employee_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Prepare context for Planning Agent to Research Agent handoff."""
        
        # Extract key information for Research Agent
        context = {
            "plan_id": plan_id,
            "employee_name": employee_data.get("full_name", "Learner"),
            "current_role": employee_data.get("job_title_specific", "Professional"),
            "course_title": course_structure.get("title", "Professional Development Course"),
            "total_modules": len(course_structure.get("modules", [])),
            "research_queries": research_queries[:10],  # Limit to prevent context overflow
            "critical_skills": [
                gap.get("skill") for gap in 
                prioritized_gaps.get("critical_gaps", [])[:5]
            ],
            "research_focus": {
                "primary_topics": [
                    module.get("title") for module in 
                    course_structure.get("modules", [])[:5]
                ],
                "skill_areas": list(set([
                    gap.get("skill") for gap_list in prioritized_gaps.values()
                    if isinstance(gap_list, list) 
                    for gap in gap_list[:3]
                ])),
                "industry_context": employee_data.get("current_industry", "General")
            },
            "handoff_timestamp": datetime.utcnow().isoformat()
        }
        
        # Store in context store
        self.context_store[f"planning_to_research_{plan_id}"] = context
        
        return context
    
    def prepare_research_to_content_context(
        self,
        research_id: str,
        plan_id: str,
        research_findings: Dict[str, Any],
        content_library: Dict[str, Any],
        module_mappings: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Prepare context for Research Agent to Content Agent handoff."""
        
        # Extract key information for Content Agent
        context = {
            "research_id": research_id,
            "plan_id": plan_id,
            "total_sources": len(content_library.get("primary_sources", [])),
            "key_insights": research_findings.get("key_insights", [])[:10],
            "module_content_map": {
                mapping.get("module_title"): {
                    "primary_resources": mapping.get("primary_resources", [])[:3],
                    "topics": mapping.get("research_topics", [])[:5]
                }
                for mapping in module_mappings.get("mappings", [])[:10]
            },
            "content_types_available": list(set([
                source.get("content_type") for source in 
                content_library.get("primary_sources", [])
            ])),
            "recommended_resources": [
                {
                    "title": res.get("title"),
                    "type": res.get("type"),
                    "url": res.get("url")
                }
                for res in research_findings.get("recommended_resources", [])[:5]
            ],
            "handoff_timestamp": datetime.utcnow().isoformat()
        }
        
        # Store in context store
        self.context_store[f"research_to_content_{research_id}"] = context
        
        return context
    
    def log_handoff(
        self,
        session_id: str,
        from_agent: str,
        to_agent: str,
        context: Dict[str, Any],
        plan_id: Optional[str] = None,
        content_id: Optional[str] = None
    ) -> bool:
        """Log agent handoff in the database."""
        try:
            handoff_data = {
                'session_id': session_id,
                'from_agent': from_agent,
                'to_agent': to_agent,
                'handoff_context': context,
                'plan_id': plan_id,
                'content_id': content_id,
                'success': True
            }
            
            result = supabase.table('cm_agent_handoffs').insert(handoff_data).execute()
            
            if result.data:
                logger.info(f"✅ Handoff logged: {from_agent} → {to_agent}")
                return True
            else:
                logger.warning(f"⚠️ Failed to log handoff: {from_agent} → {to_agent}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error logging handoff: {e}")
            return False
    
    def get_handoff_context(self, key: str) -> Optional[Dict[str, Any]]:
        """Retrieve stored handoff context."""
        return self.context_store.get(key)

# Global context manager instance
handoff_context_manager = HandoffContext()

# JSON Schema for log_agent_handoff tool
LOG_AGENT_HANDOFF_SCHEMA = {
    "type": "object",
    "properties": {
        "session_id": {
            "type": "string",
            "description": "Session ID for the course generation"
        },
        "from_agent": {
            "type": "string",
            "description": "Name of the agent initiating the handoff"
        },
        "to_agent": {
            "type": "string",
            "description": "Name of the agent receiving the handoff"
        },
        "key_context": {
            "type": "object",
            "description": "Key context data being passed",
            "properties": {
                "summary": {"type": "string"},
                "next_steps": {
                    "type": "array",
                    "items": {"type": "string"}
                },
                "important_data": {
                    "type": "object",
                    "properties": {
                        "plan_id": {"type": "string"},
                        "research_id": {"type": "string"},
                        "content_ids": {
                            "type": "array",
                            "items": {"type": "string"}
                        },
                        "additional_info": {"type": "string"}
                    },
                    "required": ["plan_id", "research_id", "content_ids", "additional_info"],
                    "additionalProperties": False
                }
            },
            "required": ["summary", "next_steps", "important_data"],
            "additionalProperties": False
        }
    },
    "required": ["session_id", "from_agent", "to_agent", "key_context"],
    "additionalProperties": False
}

async def log_agent_handoff_impl(tool_context, args) -> bool:
    """Implementation of log_agent_handoff tool."""
    # Parse args if it's a string
    if isinstance(args, str):
        args = json.loads(args)
    
    # Extract arguments from the args dictionary
    session_id = args['session_id']
    from_agent = args['from_agent']
    to_agent = args['to_agent']
    key_context = args['key_context']
    
    # Try to extract plan_id and research_id from key_context
    plan_id = key_context.get('important_data', {}).get('plan_id')
    research_id = key_context.get('important_data', {}).get('research_id')
    
    # Prepare full context
    full_context = {
        "key_context": key_context,
        "plan_id": plan_id,
        "research_id": research_id,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Ensure plan_id is a valid UUID or None
    import uuid as uuid_module
    valid_plan_id = None
    if plan_id:
        try:
            # Try to parse as UUID
            uuid_module.UUID(plan_id)
            valid_plan_id = plan_id
        except ValueError:
            # If not a valid UUID, set to None and log warning
            logger.warning(f"⚠️ Invalid UUID for plan_id: {plan_id}, setting to None")
            valid_plan_id = None
    
    return handoff_context_manager.log_handoff(
        session_id=session_id,
        from_agent=from_agent,
        to_agent=to_agent,
        context=full_context,
        plan_id=valid_plan_id
    )

# Create the FunctionTool manually
log_agent_handoff = FunctionTool(
    name="log_agent_handoff",
    description="Log agent handoff with context for tracking and debugging",
    params_json_schema=LOG_AGENT_HANDOFF_SCHEMA,
    on_invoke_tool=log_agent_handoff_impl
)

# Export utilities and tools
__all__ = [
    'handoff_context_manager',
    'log_agent_handoff',
    'HandoffContext'
]