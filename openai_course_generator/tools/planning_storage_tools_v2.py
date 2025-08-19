"""
Planning Agent Storage Tools V2

Properly configured storage tools for the Planning Agent that work with OpenAI SDK's strict schema requirements.
Uses manual FunctionTool creation to handle complex types without simplification.
"""

import os
import uuid
import json
import logging
from typing import Dict, Any, Optional, List, Union
from datetime import datetime
from supabase import create_client
from lxera_agents import FunctionTool

def safe_json_loads(value: Union[str, dict, list], default: Union[dict, list] = None) -> Union[dict, list]:
    """Safely parse JSON string, handling empty strings and already-parsed objects."""
    if default is None:
        default = {}
    
    # Already parsed object - return as-is
    if isinstance(value, (dict, list)):
        return value
    
    # String parsing with empty check
    if isinstance(value, str):
        if not value.strip():
            return default
        try:
            return json.loads(value)
        except (json.JSONDecodeError, ValueError) as e:
            logger.warning(f"Invalid JSON string: {value[:100]}... Error: {e}")
            return default
    
    # Other types - return default
    logger.warning(f"Unexpected type for JSON parsing: {type(value)}")
    return default

logger = logging.getLogger(__name__)

# Initialize Supabase client
SUPABASE_URL = 'https://xwfweumeryrgbguwrocr.supabase.co'
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZndldW1lcnlyZ2JndXdyb2NyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc2MzQ0MCwiZXhwIjoyMDY2MzM5NDQwfQ.qxXpBxUKhKA4AQT4UQnIEJGbGNrRDMbBroZU8YaypSY')
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# JSON Schema for store_course_plan with complex types
STORE_COURSE_PLAN_SCHEMA = {
    "type": "object",
    "properties": {
        "employee_id": {
            "type": "string",
            "description": "UUID of the employee"
        },
        "employee_name": {
            "type": "string",
            "description": "Full name of the employee"
        },
        "session_id": {
            "type": "string",
            "description": "Session identifier for this course generation"
        },
        "company_id": {
            "type": "string",
            "description": "Company ID (optional - will be fetched from employee record if not provided)"
        },
        "course_structure": {
            "type": "object",
            "description": "The planned course structure with modules and timeline",
            "properties": {
                "title": {
                    "type": "string",
                    "description": "Course title"
                },
                "duration_weeks": {
                    "type": "integer",
                    "description": "Total course duration in weeks"
                },
                "modules": {
                    "type": "array",
                    "description": "List of course modules",
                    "items": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string"},
                            "duration": {"type": "string"},
                            "topics": {
                                "type": "array",
                                "items": {"type": "string"}
                            },
                            "priority": {"type": "string"},
                            "week": {"type": "integer"}
                        },
                        "required": ["title", "duration", "topics", "priority", "week"],
                        "additionalProperties": False
                    }
                },
                "learning_objectives": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Course learning objectives"
                }
            },
            "required": ["title", "duration_weeks", "modules", "learning_objectives"],
            "additionalProperties": False
        },
        "prioritized_gaps": {
            "type": "object",
            "description": "Skills gaps prioritized by criticality",
            "properties": {
                "critical_gaps": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "skill": {"type": "string"},
                            "importance": {"type": "string"},
                            "current_level": {"type": "integer"},
                            "required_level": {"type": "integer"}
                        },
                        "required": ["skill", "importance", "current_level", "required_level"],
                        "additionalProperties": False
                    }
                },
                "high_priority_gaps": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "skill": {"type": "string"},
                            "importance": {"type": "string"},
                            "current_level": {"type": "integer"},
                            "required_level": {"type": "integer"}
                        },
                        "required": ["skill", "importance", "current_level", "required_level"],
                        "additionalProperties": False
                    }
                },
                "development_gaps": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "skill": {"type": "string"},
                            "importance": {"type": "string"},
                            "current_level": {"type": "integer"},
                            "required_level": {"type": "integer"}
                        },
                        "required": ["skill", "importance", "current_level", "required_level"],
                        "additionalProperties": False
                    }
                }
            },
            "required": ["critical_gaps", "high_priority_gaps", "development_gaps"],
            "additionalProperties": False
        },
        "research_strategy": {
            "type": "object",
            "description": "Optional research strategy for content creation",
            "properties": {
                "primary_topics": {
                    "type": "array",
                    "items": {"type": "string"}
                },
                "search_queries": {
                    "type": "array",
                    "items": {"type": "string"}
                },
                "source_types": {
                    "type": "array",
                    "items": {"type": "string"}
                }
            },
            "required": ["primary_topics", "search_queries", "source_types"],
            "additionalProperties": False
        },
        "learning_path": {
            "type": "object",
            "description": "Optional personalized learning path details",
            "properties": {
                "sequence": {
                    "type": "array",
                    "items": {"type": "string"}
                },
                "adaptive_elements": {
                    "type": "array",
                    "items": {"type": "string"}
                },
                "practice_components": {
                    "type": "array",
                    "items": {"type": "string"}
                }
            },
            "required": ["sequence", "adaptive_elements", "practice_components"],
            "additionalProperties": False
        }
    },
    "required": ["employee_id", "employee_name", "session_id", "course_structure", "prioritized_gaps", "research_strategy", "learning_path"],
    "additionalProperties": False
}

def store_course_plan_impl(tool_context, args) -> str:
    """Implementation of store_course_plan function."""
    # Parse args if it's a string
    if isinstance(args, str):
        args = json.loads(args)
    
    # Extract arguments from the args dictionary
    employee_id = args['employee_id']
    employee_name = args['employee_name']
    session_id = args['session_id']
    
    # Parse JSON strings safely, handling empty strings and type mismatches
    course_structure = safe_json_loads(args['course_structure'], default={})
    prioritized_gaps = safe_json_loads(args['prioritized_gaps'], default={})
    research_strategy = safe_json_loads(args.get('research_strategy', {}), default={})
    learning_path = safe_json_loads(args.get('learning_path', {}), default={})
    
    company_id = args.get('company_id')  # Optional - will fetch if not provided
    
    try:
        logger.info(f"📝 Storing course plan for {employee_name}")
        
        # Extract metadata from course structure
        # CRITICAL: Check list FIRST to prevent .get() calls on lists
        if isinstance(course_structure, list):
            # Raw list of modules from agent - convert to standard format
            logger.info(f"📋 Course structure is list with {len(course_structure)} modules")
            course_title = 'Personalized Development Course'
            total_modules = len(course_structure)
            course_duration_weeks = 4  # Default
            # Convert list to dict format for storage
            course_structure = {
                'title': course_title,
                'modules': course_structure,
                'duration_weeks': course_duration_weeks
            }
        elif isinstance(course_structure, dict):
            # Standard dict format from agent
            logger.info(f"📋 Course structure is dict: {list(course_structure.keys())}")
            course_title = course_structure.get('title', 'Personalized Development Course')
            total_modules = len(course_structure.get('modules', []))
            course_duration_weeks = course_structure.get('duration_weeks', 4)
        else:
            logger.warning(f"⚠️ Unexpected course_structure type: {type(course_structure)} - {course_structure}")
            course_title = 'Personalized Development Course'
            total_modules = 0
            course_duration_weeks = 4
            course_structure = {
                'title': course_title,
                'modules': [],
                'duration_weeks': course_duration_weeks
            }
        
        # Convert prioritized gaps to expected format
        # CRITICAL: Check list FIRST to prevent .get() calls on lists
        if isinstance(prioritized_gaps, list):
            # Raw list of gaps from agent - assume high priority
            logger.info(f"📊 Prioritized gaps is list with {len(prioritized_gaps)} items")
            gaps_formatted = {
                "Critical Skill Gaps": {"gaps": []},
                "High Priority Gaps": {"gaps": prioritized_gaps},
                "Development Gaps": {"gaps": []}
            }
        elif isinstance(prioritized_gaps, dict):
            # Standard dict format from agent
            logger.info(f"📊 Prioritized gaps is dict: {list(prioritized_gaps.keys())}")
            gaps_formatted = {
                "Critical Skill Gaps": {
                    "gaps": prioritized_gaps.get("critical_gaps", [])
                },
                "High Priority Gaps": {
                    "gaps": prioritized_gaps.get("high_priority_gaps", [])
                },
                "Development Gaps": {
                    "gaps": prioritized_gaps.get("development_gaps", [])
                }
            }
        else:
            logger.warning(f"⚠️ Unexpected prioritized_gaps type: {type(prioritized_gaps)} - {prioritized_gaps}")
            gaps_formatted = {
                "Critical Skill Gaps": {"gaps": []},
                "High Priority Gaps": {"gaps": []},
                "Development Gaps": {"gaps": []}
            }
        
        # Get company_id if not provided
        if not company_id:
            employee_data = supabase.table('employees').select('company_id').eq('id', employee_id).single().execute()
            if not employee_data.data:
                raise Exception(f"Employee {employee_id} not found")
            company_id = employee_data.data['company_id']
        
        # Prepare plan data
        plan_data = {
            'employee_id': employee_id,
            'employee_name': employee_name,
            'session_id': session_id,
            'company_id': company_id,  # Add the missing company_id
            'course_structure': course_structure,
            'prioritized_gaps': gaps_formatted,
            'research_strategy': research_strategy,
            'learning_path': learning_path,
            'course_title': course_title,
            'total_modules': total_modules,
            'course_duration_weeks': course_duration_weeks,
            'planning_agent_version': 'v2',
            'status': 'completed',
            'employee_profile': {},  # Add empty profile for now - will be updated by store_planning_metadata
            'is_preview_mode': True,  # Mark as preview mode plan requiring approval
            'approval_status': 'pending_review'  # Set initial approval status
        }
        
        # Insert into database
        result = supabase.table('cm_course_plans').insert(plan_data).execute()
        
        if result.data and len(result.data) > 0:
            plan_id = result.data[0]['plan_id']
            logger.info(f"✅ Course plan stored successfully with ID: {plan_id}")
            
            # Signal for automatic handoff (will be handled by agent)
            logger.info("🔄 Planning complete - ready for handoff to Research Agent")
            
            # Return structured completion message that triggers handoff
            return (f"✅ Course plan stored successfully with ID: {plan_id}. "
                   f"Planning phase completed. "
                   f"HANDOFF REQUIRED: You must now call transfer_to_research_agent immediately. "
                   f"Do not call store_course_plan again. Use plan_id: {plan_id} for handoff data.")
        else:
            raise Exception("No data returned from insert")
            
    except Exception as e:
        logger.error(f"❌ Failed to store course plan: {e}")
        raise Exception(f"Failed to store course plan: {str(e)}")

# Create the FunctionTool manually
store_course_plan = FunctionTool(
    name="store_course_plan",
    description="Store course plan in the cm_course_plans table with full course structure and prioritized skill gaps",
    params_json_schema=STORE_COURSE_PLAN_SCHEMA,
    on_invoke_tool=store_course_plan_impl
)

# JSON Schema for store_planning_metadata
STORE_PLANNING_METADATA_SCHEMA = {
    "type": "object",
    "properties": {
        "plan_id": {
            "type": "string",
            "description": "UUID of the course plan"
        },
        "employee_profile": {
            "type": "object",
            "description": "Analyzed employee profile data",
            "properties": {
                "learning_style": {"type": "string"},
                "experience_level": {"type": "string"},
                "career_goals": {"type": "string"},
                "strengths": {
                    "type": "array",
                    "items": {"type": "string"}
                },
                "improvement_areas": {
                    "type": "array",
                    "items": {"type": "string"}
                }
            },
            "required": ["learning_style", "experience_level", "career_goals", "strengths", "improvement_areas"],
            "additionalProperties": False
        },
        "tool_calls": {
            "type": "array",
            "description": "List of tool calls made during planning",
            "items": {
                "type": "object",
                "properties": {
                    "tool_name": {"type": "string"},
                    "timestamp": {"type": "string"},
                    "parameters": {"type": "string"},
                    "result": {"type": "string"}
                },
                "required": ["tool_name", "timestamp", "parameters", "result"],
                "additionalProperties": False
            }
        },
        "execution_time": {
            "type": "number",
            "description": "Time taken for planning in seconds"
        },
        "agent_turns": {
            "type": "integer",
            "description": "Number of turns the agent took"
        }
    },
    "required": ["plan_id", "employee_profile", "tool_calls", "execution_time", "agent_turns"],
    "additionalProperties": False
}

def store_planning_metadata_impl(tool_context, args) -> bool:
    """Implementation of store_planning_metadata function."""
    # Parse args if it's a string
    if isinstance(args, str):
        args = json.loads(args)
    
    # Extract arguments from the args dictionary
    plan_id = args['plan_id']
    
    # Parse JSON strings to dictionaries if needed
    employee_profile = args['employee_profile']
    if isinstance(employee_profile, str):
        employee_profile = json.loads(employee_profile) if employee_profile else {}
    
    tool_calls = args['tool_calls']
    if isinstance(tool_calls, str):
        tool_calls = json.loads(tool_calls) if tool_calls else []
    
    execution_time = args['execution_time']
    agent_turns = args['agent_turns']
    
    try:
        logger.info(f"📊 Storing planning metadata for plan {plan_id}")
        
        # Update the course plan with metadata
        update_data = {
            'employee_profile': employee_profile,
            'tool_calls': tool_calls,
            'execution_time_seconds': execution_time,
            'agent_turns': agent_turns,
            'updated_at': datetime.utcnow().isoformat()
        }
        
        result = supabase.table('cm_course_plans').update(update_data).eq('plan_id', plan_id).execute()
        
        if result.data:
            logger.info("✅ Planning metadata stored successfully")
            return "✅ Planning metadata stored successfully"
        else:
            logger.warning("⚠️ No rows updated when storing metadata")
            return "❌ Failed to store planning metadata - no rows updated"
            
    except Exception as e:
        logger.error(f"❌ Failed to store planning metadata: {e}")
        return f"❌ Failed to store planning metadata: {str(e)}"

# Create the FunctionTool manually
store_planning_metadata = FunctionTool(
    name="store_planning_metadata",
    description="Store planning agent metadata and execution details",
    params_json_schema=STORE_PLANNING_METADATA_SCHEMA,
    on_invoke_tool=store_planning_metadata_impl
)

# Export the tools
__all__ = ['store_course_plan', 'store_planning_metadata']