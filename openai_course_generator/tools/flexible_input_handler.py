"""
Flexible Input Handler for LangChain Tools (2025 Best Practices)

Solves the fundamental challenge of LLM tools receiving parameters as either strings or objects.
Based on industry research and production patterns from 2025.
"""

import json
import logging
from typing import Dict, Any, Union, List, Optional
from pydantic import BaseModel, field_validator, ValidationError

logger = logging.getLogger(__name__)

class FlexibleCourseStructure(BaseModel):
    """Robust input handler for course structure parameters"""
    course_structure: Dict[str, Any]
    
    @field_validator('course_structure', mode='before')
    @classmethod
    def parse_course_structure(cls, v: Any) -> Dict[str, Any]:
        """Handle both string and object inputs from LLMs with comprehensive error handling"""
        if isinstance(v, str):
            # Handle empty string case
            if not v.strip():
                logger.warning("Empty string provided for course_structure, using default")
                return {"error": "empty_input", "modules": []}
            
            try:
                parsed = json.loads(v)
                # Ensure parsed result is appropriate type
                if isinstance(parsed, dict):
                    return parsed
                elif isinstance(parsed, list):
                    # Some LLMs return lists instead of dicts
                    logger.info("Converting list to dict format for course_structure")
                    return {"modules": parsed}
                else:
                    raise ValueError(f"Parsed JSON must be object or array, got {type(parsed).__name__}")
            except json.JSONDecodeError as e:
                logger.warning(f"Invalid JSON string for course_structure: {e}")
                # Fallback: treat as plain text description
                return {"error": "invalid_json", "description": v[:500], "raw": v}
        elif isinstance(v, dict):
            return v
        elif isinstance(v, list):
            # Handle direct list input
            logger.info("Converting direct list to dict format")
            return {"modules": v}
        else:
            logger.error(f"Unexpected type for course_structure: {type(v).__name__}")
            return {"error": "unexpected_type", "type": type(v).__name__, "value": str(v)[:100]}

class FlexibleResearchFindings(BaseModel):
    """Robust input handler for research findings parameters"""
    research_findings: Dict[str, Any]
    
    @field_validator('research_findings', mode='before')
    @classmethod
    def parse_research_findings(cls, v: Any) -> Dict[str, Any]:
        """Handle both string and object inputs for research findings"""
        if isinstance(v, str):
            if not v.strip():
                return {"topics": [], "overall_synthesis": "", "key_insights": []}
            
            try:
                parsed = json.loads(v)
                if isinstance(parsed, dict):
                    return parsed
                else:
                    return {"error": "invalid_structure", "raw": str(parsed)[:1000]}
            except json.JSONDecodeError as e:
                logger.warning(f"Invalid JSON for research_findings: {e}")
                return {"error": "parse_failed", "raw_text": v[:1000]}
        elif isinstance(v, dict):
            return v
        else:
            return {"error": "unexpected_type", "type": type(v).__name__}

class FlexibleStringArray(BaseModel):
    """Handler for arrays that might come as strings"""
    value: List[str]
    
    @field_validator('value', mode='before')
    @classmethod
    def parse_string_array(cls, v: Any) -> List[str]:
        """Parse string arrays with multiple fallback strategies"""
        if isinstance(v, str):
            if not v.strip():
                return []
            
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return [str(item) for item in parsed]
                else:
                    # Single string value
                    return [str(parsed)]
            except json.JSONDecodeError:
                # Fallback: split by common delimiters
                for delimiter in ['\n', ';', ',']:
                    if delimiter in v:
                        return [item.strip() for item in v.split(delimiter) if item.strip()]
                # Single value
                return [v.strip()]
        elif isinstance(v, list):
            return [str(item) for item in v]
        else:
            return [str(v)]

def safe_json_parse(value: Any, default_type: str = "dict") -> Union[Dict[str, Any], List[Any], str]:
    """
    Ultra-robust JSON parsing with comprehensive fallback strategies.
    
    Args:
        value: Input value from LLM (could be string, dict, list, etc.)
        default_type: What to return on failure ("dict", "list", "string")
    
    Returns:
        Parsed value with appropriate fallback
    """
    # Already correct type
    if default_type == "dict" and isinstance(value, dict):
        return value
    elif default_type == "list" and isinstance(value, list):
        return value
    elif default_type == "string" and isinstance(value, str):
        return value
    
    # Try JSON parsing if string
    if isinstance(value, str):
        if not value.strip():
            return {} if default_type == "dict" else [] if default_type == "list" else ""
        
        try:
            parsed = json.loads(value)
            # Type conversion if needed
            if default_type == "dict" and isinstance(parsed, list):
                return {"items": parsed}
            elif default_type == "list" and isinstance(parsed, dict):
                return list(parsed.values()) if parsed else []
            return parsed
        except json.JSONDecodeError:
            # Fallback based on default_type
            if default_type == "dict":
                return {"error": "parse_failed", "raw": value[:500]}
            elif default_type == "list":
                return [value]
            else:
                return value
    
    # Type conversion for non-strings
    if default_type == "dict":
        if isinstance(value, list):
            return {"items": value}
        else:
            return {"value": str(value)}
    elif default_type == "list":
        if isinstance(value, dict):
            return list(value.values())
        else:
            return [str(value)]
    else:
        return str(value)

def safe_course_structure_handler(course_structure: Any) -> Dict[str, Any]:
    """
    Handle course_structure that arrives as list but code expects dict.
    Addresses: 'list' object has no attribute 'get'
    """
    if isinstance(course_structure, list):
        # Convert list to dict with proper structure
        if len(course_structure) > 0 and isinstance(course_structure[0], dict):
            # If list of dicts, wrap in structure
            return {
                "modules": course_structure,
                "total_modules": len(course_structure),
                "structure_type": "module_list"
            }
        else:
            # If list of strings/other, convert to basic structure
            return {
                "items": course_structure,
                "total_items": len(course_structure),
                "structure_type": "item_list"
            }
    elif isinstance(course_structure, dict):
        # Already correct format
        return course_structure
    elif isinstance(course_structure, str):
        # Try to parse JSON string
        try:
            parsed = json.loads(course_structure)
            return safe_course_structure_handler(parsed)  # Recursive call
        except json.JSONDecodeError:
            # If not JSON, wrap in basic structure
            return {
                "content": course_structure,
                "structure_type": "text_content"
            }
    else:
        # Fallback for any other type
        return {
            "raw_data": str(course_structure),
            "structure_type": "unknown"
        }

def generate_valid_plan_id() -> str:
    """Generate proper UUID for Supabase compatibility"""
    import uuid
    return str(uuid.uuid4())

def validate_and_fix_uuid(plan_id: Union[str, int]) -> str:
    """
    Fix UUID validation issues.
    Addresses: 'invalid input syntax for type uuid: "plan_123"'
    """
    import uuid
    
    if isinstance(plan_id, int):
        plan_id = str(plan_id)
    
    # Check if already valid UUID
    try:
        uuid.UUID(plan_id)
        return plan_id
    except ValueError:
        # Not a valid UUID, generate new one
        new_uuid = str(uuid.uuid4())
        logger.warning(f"Invalid UUID '{plan_id}' replaced with '{new_uuid}'")
        return new_uuid

def robust_json_parse(value: Any, default_type: str = "dict") -> Any:
    """
    Enhanced version of safe_json_parse with better error handling.
    Addresses: JSONDecodeError - Expecting value: line 1 column 1 (char 0)
    """
    if value is None or value == "":
        # Handle empty/null responses
        return {} if default_type == "dict" else []
    
    if isinstance(value, (dict, list)):
        return value
    
    if isinstance(value, str):
        # Handle empty string
        if value.strip() == "":
            return {} if default_type == "dict" else []
        
        # Try to parse JSON
        try:
            return json.loads(value)
        except json.JSONDecodeError as e:
            logger.warning(f"JSON Parse Error: {e}")
            logger.warning(f"Raw value: '{value[:100]}...' (truncated)")
            
            # Try to extract JSON from mixed content
            import re
            json_match = re.search(r'\{.*\}|\[.*\]', value, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except json.JSONDecodeError:
                    pass
            
            # Fallback: return structured error info
            return {
                "error": "json_parse_failed",
                "raw_content": value[:200],  # First 200 chars
                "error_details": str(e)
            }
    
    # For any other type, convert to string and wrap
    return {
        "raw_data": str(value),
        "data_type": type(value).__name__
    }

def log_parameter_metrics(tool_name: str, param_name: str, input_type: str, success: bool, error: Optional[str] = None):
    """Log metrics for monitoring tool parameter parsing success rates"""
    logger.info(f"TOOL_METRICS: {tool_name}.{param_name} | input_type={input_type} | success={success} | error={error}")

# Export commonly used patterns
__all__ = [
    'FlexibleCourseStructure',
    'FlexibleResearchFindings', 
    'FlexibleStringArray',
    'safe_json_parse',
    'safe_course_structure_handler',
    'generate_valid_plan_id',
    'validate_and_fix_uuid',
    'robust_json_parse',
    'log_parameter_metrics'
]