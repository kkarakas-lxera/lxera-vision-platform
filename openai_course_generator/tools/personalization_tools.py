"""Personalization tools for employee analysis and context building."""

import json
import logging
from typing import Dict, Any, List
from datetime import datetime
from agents import function_tool
from openai import OpenAI

from ..config.settings import get_settings
from ..models.employee_models import EmployeeProfile, PersonalizationContext

logger = logging.getLogger(__name__)


@function_tool
def employee_analyzer(employee_data: str) -> str:
    """
    Analyze employee data to extract personalization insights.
    
    Replaces personalization_levers_node from refactored_nodes.
    """
    try:
        settings = get_settings()
        openai_client = OpenAI(api_key=settings.openai_api_key)
        
        # Parse JSON string to dictionary
        if isinstance(employee_data, str):
            employee_dict = json.loads(employee_data)
        else:
            employee_dict = employee_data
        
        # Extract key employee information
        employee_name = employee_dict.get("full_name", "Employee")
        current_role = employee_dict.get("job_title_specific", employee_dict.get("job_title_current", "Professional"))
        career_goal = employee_dict.get("career_aspirations_next_role", "")
        skills = employee_dict.get("skills", [])
        skill_gaps = employee_dict.get("skill_gaps", [])
        tools_used = employee_dict.get("tools_software_used_regularly", [])
        responsibilities = employee_dict.get("key_responsibilities_tasks", [])
        company_priorities = employee_dict.get("company_strategic_priorities", [])
        
        analysis_prompt = f"""
        Analyze this employee profile to create personalization insights for course generation:
        
        EMPLOYEE PROFILE:
        - Name: {employee_name}
        - Current Role: {current_role}
        - Career Goal: {career_goal}
        - Current Skills: {', '.join(skills[:5])}
        - Skill Gaps: {', '.join(skill_gaps[:5])}
        - Primary Tools: {', '.join(tools_used[:5])}
        - Key Responsibilities: {', '.join(responsibilities[:3])}
        - Company Priorities: {', '.join(company_priorities[:3])}
        
        ANALYSIS REQUIREMENTS:
        1. Identify key skill to anchor learning on
        2. Find connections between responsibilities and financial concepts
        3. Create aspiration connectors linking current role to career goals
        4. Suggest tool integration opportunities
        5. Recommend role-specific scenarios and examples
        6. Determine appropriate complexity level
        7. Suggest personalization strategies
        
        Provide a comprehensive analysis that will guide personalized course content creation.
        Format as structured JSON.
        """
        
        response = openai_client.chat.completions.create(
            model=settings.default_model,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert in learning personalization and employee development analysis."
                },
                {"role": "user", "content": analysis_prompt}
            ],
            temperature=0.4,
            max_tokens=2000,
            response_format={"type": "json_object"}
        )
        
        analysis_result = response.choices[0].message.content
        
        result_data = {
            "employee_analysis": analysis_result,
            "employee_name": employee_name,
            "current_role": current_role,
            "career_goal": career_goal,
            "personalization_ready": True,
            "analysis_timestamp": datetime.now().isoformat(),
            "success": True
        }

        
        return json.dumps(result_data)
        
    except Exception as e:
        logger.error(f"Employee analysis failed: {e}")
        result_data = {
            "error": str(e),
            "employee_analysis": "{}",
            "personalization_ready": False,
            "success": False
        }
        return json.dumps(result_data)


@function_tool
def requirement_validator(course_requirements: str) -> str:
    """
    Validate course requirements and specifications.
    
    Ensures all necessary information is available for course generation.
    """
    try:
        # Check required fields
        required_fields = [
            "employee_data",
            "course_objectives", 
            "target_modules",
            "learning_time_target"
        ]
        
        missing_fields = []
        for field in required_fields:
            if field not in course_requirements:
                missing_fields.append(field)
        
        # Validate employee data completeness
        employee_data = course_requirements.get("employee_data", {})
        required_employee_fields = ["full_name", "job_title_current", "skills"]
        missing_employee_fields = []
        
        for field in required_employee_fields:
            if field not in employee_data:
                missing_employee_fields.append(field)
        
        # Check course specifications
        target_modules = course_requirements.get("target_modules", 0)
        learning_time = course_requirements.get("learning_time_target", 0)
        
        validation_results = {
            "validation_passed": len(missing_fields) == 0 and len(missing_employee_fields) == 0,
            "missing_fields": missing_fields,
            "missing_employee_fields": missing_employee_fields,
            "target_modules": target_modules,
            "target_learning_hours": learning_time / 60 if learning_time else 0,
            "has_employee_data": bool(employee_data),
            "has_course_objectives": bool(course_requirements.get("course_objectives")),
            "validation_timestamp": datetime.now().isoformat()
        }
        
        # Add recommendations if validation fails
        if not validation_results["validation_passed"]:
            recommendations = []
            if missing_fields:
                recommendations.append(f"Provide missing course fields: {', '.join(missing_fields)}")
            if missing_employee_fields:
                recommendations.append(f"Complete employee profile: {', '.join(missing_employee_fields)}")
            validation_results["recommendations"] = recommendations
        
        return json.dumps(validation_results)
        
    except Exception as e:
        logger.error(f"Requirement validation failed: {e}")
        result_data = {
            "error": str(e),
            "validation_passed": False,
            "validation_timestamp": datetime.now().isoformat()
        }

        return json.dumps(result_data)


@function_tool
def context_builder(
    employee_analysis: str,
    course_requirements: str
) -> str:
    """
    Build comprehensive context for course personalization.
    
    Creates the context that will be used throughout course generation.
    """
    try:
        settings = get_settings()
        
        # Extract employee information
        employee_data = course_requirements.get("employee_data", {})
        
        # Build personalization context
        personalization_context = {
            "employee_name": employee_data.get("full_name", "Learner"),
            "current_role": employee_data.get("job_title_specific", employee_data.get("job_title_current", "Professional")),
            "career_aspiration": employee_data.get("career_aspirations_next_role", ""),
            "key_tools": employee_data.get("tools_software_used_regularly", []),
            "responsibilities": employee_data.get("key_responsibilities_tasks", []),
            "skill_gaps": employee_data.get("skill_gaps", []),
            "company_context": employee_data.get("company_strategic_priorities", []),
            "department_goals": employee_data.get("department_goals_kpis", [])
        }
        
        # Extract course context
        course_context = {
            "course_objectives": course_requirements.get("course_objectives", []),
            "target_modules": course_requirements.get("target_modules", 16),
            "learning_time_target": course_requirements.get("learning_time_target", 960),  # 16 hours default
            "complexity_level": course_requirements.get("complexity_level", "intermediate"),
            "focus_areas": course_requirements.get("focus_areas", [])
        }
        
        # Create complete context
        complete_context = {
            "personalization": personalization_context,
            "course": course_context,
            "employee_analysis": employee_analysis,
            "generation_settings": {
                "words_per_module_target": 7500,
                "words_per_module_range": [6750, 8250],
                "reading_content_percentage": 65,
                "activity_content_percentage": 35,
                "quality_score_minimum": 7.5
            },
            "context_timestamp": datetime.now().isoformat(),
            "context_version": "1.0"
        }
        
        result_data = {
            "complete_context": complete_context,
            "personalization_summary": f"Course for {personalization_context['employee_name']} ({personalization_context['current_role']}) targeting {personalization_context['career_aspiration']}",
            "context_ready": True,
            "success": True
        }
        
        return json.dumps(result_data)
        
    except Exception as e:
        logger.error(f"Context building failed: {e}")
        result_data = {
            "error": str(e),
            "complete_context": {},
            "context_ready": False,
            "success": False
        }
        return json.dumps(result_data)