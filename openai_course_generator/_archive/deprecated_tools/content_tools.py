"""Content generation tools wrapping existing content functionality."""

import os
import json
import logging
from typing import Dict, Any, List
from datetime import datetime
from lxera_agents import function_tool
from openai import OpenAI

try:
    from config.settings import get_settings
except ImportError:
    # Fallback for different import paths
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.dirname(__file__)))
    from config.settings import get_settings

# Optional imports - handle gracefully if not available
try:
    from models.course_models import LearningActivity, Assessment, ActivityType, AssessmentType
except ImportError:
    # Define basic fallback classes if models not available
    class LearningActivity:
        pass
    class Assessment:
        pass
    class ActivityType:
        pass
    class AssessmentType:
        pass

logger = logging.getLogger(__name__)


@function_tool
def content_generator(
    module_spec: str, 
    research_data: str,
    personalization_context: str = None
) -> str:
    """
    Generate comprehensive course content based on research and specifications.
    
    Wraps existing content generation logic from refactored_nodes system.
    Target: 6750-8250 words per module with 65% focus on reading content.
    """
    try:
        settings = get_settings()
        openai_client = OpenAI(api_key=settings.openai_api_key)
        
        # Parse JSON inputs
        module_spec_data = json.loads(module_spec) if isinstance(module_spec, str) else module_spec
        research_data_parsed = json.loads(research_data) if isinstance(research_data, str) else research_data
        personalization_data = json.loads(personalization_context) if personalization_context else {}
        
        # Extract module information
        module_name = module_spec_data.get("module_name", "Course Module")
        learning_objectives = module_spec_data.get("learning_objectives", [])
        key_concepts = module_spec_data.get("key_concepts", [])
        target_word_count = module_spec_data.get("target_word_count", 7500)
        
        # Extract personalization context
        if personalization_data:
            employee_name = personalization_data.get("employee_name", "Learner")
            current_role = personalization_data.get("current_role", "Professional")
            career_goal = personalization_data.get("career_aspiration", "")
            tools_used = personalization_data.get("key_tools", [])
        else:
            employee_name = "Learner"
            current_role = "Professional"
            career_goal = ""
            tools_used = []
        
        # Build comprehensive content generation prompt
        content_prompt = f"""
        Generate comprehensive course content for: {module_name}
        
        CONTENT REQUIREMENTS:
        - Target word count: {target_word_count} words (range: 6750-8250)
        - Focus: 65% reading content, 35% activities and assessments
        - Professional, engaging writing style
        - Progressive difficulty and clear structure
        
        LEARNING OBJECTIVES:
        {chr(10).join(f"- {obj}" for obj in learning_objectives)}
        
        KEY CONCEPTS TO COVER:
        {chr(10).join(f"- {concept}" for concept in key_concepts)}
        
        PERSONALIZATION CONTEXT:
        - Employee: {employee_name}
        - Current Role: {current_role}
        - Career Goal: {career_goal}
        - Primary Tools: {', '.join(tools_used[:3]) if tools_used else 'Standard business tools'}
        
        RESEARCH FINDINGS:
        {json.dumps(research_data_parsed.get("synthesized_knowledge", {}), indent=2)[:8000]}
        
        CONTENT STRUCTURE:
        1. Module Introduction and Objectives (300 words)
        2. Comprehensive Reading Content (5500-6000 words):
           - Theoretical foundations with clear explanations
           - Real-world applications and examples
           - Industry-specific contexts and scenarios
           - Step-by-step procedures and methodologies
           - Best practices and common pitfalls
           - Integration with {employee_name}'s role and tools
        3. Key Takeaways and Summary (400-500 words)
        4. Practical Applications for {current_role} (300-400 words)
        5. Connection to Career Goals (200-300 words)
        
        PERSONALIZATION REQUIREMENTS:
        - Use {employee_name}'s name throughout for engagement
        - Reference {current_role} responsibilities and challenges
        - Include examples relevant to their tools: {', '.join(tools_used)}
        - Connect concepts to career progression toward {career_goal}
        - Use industry-appropriate language and examples
        
        QUALITY STANDARDS:
        - Professional, authoritative tone
        - Clear, logical progression of concepts
        - Rich examples and practical applications
        - Proper citations where appropriate
        - Engaging and interactive elements
        
        Generate comprehensive, high-quality content that meets all requirements.
        """
        
        response = openai_client.chat.completions.create(
            model=settings.default_model,
            messages=[
                {
                    "role": "system", 
                    "content": "You are an expert instructional designer creating comprehensive, personalized course content."
                },
                {"role": "user", "content": content_prompt}
            ],
            temperature=0.7,
            max_tokens=8000
        )
        
        generated_content = response.choices[0].message.content
        word_count = len(generated_content.split())
        
        result_data = {
            "generated_content": generated_content,
            "word_count": word_count,
            "module_name": module_name,
            "personalized_for": employee_name,
            "generation_timestamp": datetime.now().isoformat(),
            "meets_word_count_requirement": 6750 <= word_count <= 8250,
            "quality_indicators": {
                "has_introduction": "introduction" in generated_content.lower(),
                "has_examples": "example" in generated_content.lower(),
                "has_summary": "summary" in generated_content.lower(),
                "personalization_present": employee_name.lower() in generated_content.lower()
            },
            "success": True
        }
        return json.dumps(result_data)
        
    except Exception as e:
        logger.error(f"Content generation failed: {e}")
        error_data = {
            "error": str(e),
            "generated_content": "",
            "word_count": 0,
            "success": False
        }
        return json.dumps(error_data)


@function_tool
def activity_creator(
    content_context: str,
    activity_requirements: str = None
) -> str:
    """
    Create interactive learning activities based on content context.
    
    Generates various types of activities including scenarios, exercises, and reflections.
    """
    try:
        settings = get_settings()
        openai_client = OpenAI(api_key=settings.openai_api_key)
        
        # Extract context information
        module_name = content_context.get("module_name", "Course Module")
        key_concepts = content_context.get("key_concepts", [])
        learning_objectives = content_context.get("learning_objectives", [])
        employee_context = content_context.get("personalization_context", {})
        
        # Define activity requirements
        if activity_requirements:
            num_activities = activity_requirements.get("num_activities", 4)
            activity_types = activity_requirements.get("preferred_types", [
                "Interactive_Scenario", "Practical_Exercise", "Reflection_Prompt", "Quiz"
            ])
        else:
            num_activities = 4
            activity_types = ["Interactive_Scenario", "Practical_Exercise", "Reflection_Prompt", "Quiz"]
        
        activity_prompt = f"""
        Create {num_activities} interactive learning activities for: {module_name}
        
        LEARNING OBJECTIVES:
        {chr(10).join(f"- {obj}" for obj in learning_objectives)}
        
        KEY CONCEPTS:
        {chr(10).join(f"- {concept}" for concept in key_concepts)}
        
        ACTIVITY TYPES TO INCLUDE:
        {chr(10).join(f"- {activity_type}" for activity_type in activity_types)}
        
        PERSONALIZATION:
        - Employee: {employee_context.get('employee_name', 'Learner')}
        - Role: {employee_context.get('current_role', 'Professional')}
        - Tools: {', '.join(employee_context.get('key_tools', []))}
        
        ACTIVITY REQUIREMENTS:
        1. Interactive Scenario: Real-world business scenario requiring decision-making
        2. Practical Exercise: Hands-on application using tools and concepts
        3. Reflection Prompt: Personal reflection connecting to role and goals
        4. Quiz: Knowledge check with 5-7 questions
        
        For each activity, provide:
        - Activity title and description
        - Estimated duration (10-30 minutes)
        - Detailed instructions
        - Expected outcomes
        - Assessment criteria
        
        Format as structured JSON array.
        """
        
        response = openai_client.chat.completions.create(
            model=settings.default_model,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert learning activity designer creating engaging, practical exercises."
                },
                {"role": "user", "content": activity_prompt}
            ],
            temperature=0.8,
            max_tokens=3000,
            response_format={"type": "json_object"}
        )
        
        activities_data = json.loads(response.choices[0].message.content)
        activities = activities_data.get("activities", [])
        
        # Convert to LearningActivity objects
        learning_activities = []
        for i, activity in enumerate(activities):
            learning_activity = LearningActivity(
                activity_id=f"activity_{i+1}_{module_name.lower().replace(' ', '_')}",
                activity_type=ActivityType(activity.get("type", "Practical_Exercise")),
                title=activity.get("title", f"Activity {i+1}"),
                description=activity.get("description", ""),
                estimated_duration_minutes=activity.get("duration_minutes", 20),
                content_details=activity.get("details", {})
            )
            learning_activities.append(learning_activity)
        
        result_data = {
            "activities": [activity.dict() for activity in learning_activities],
            "activity_count": len(learning_activities),
            "total_estimated_minutes": sum(
                activity.estimated_duration_minutes or 0 for activity in learning_activities
            ),
            "module_name": module_name,
            "creation_timestamp": datetime.now().isoformat(),
            "success": True
        }

        
        return json.dumps(result_data)
        
    except Exception as e:
        logger.error(f"Activity creation failed: {e}")
        result_data = {
            "error": str(e),
            "activities": [],
            "activity_count": 0,
            "success": False
        }

        return json.dumps(result_data)


@function_tool
def assessment_builder(
    content_context: str,
    assessment_requirements: str = None
) -> str:
    """
    Build assessments and evaluations for course content.
    
    Creates various types of assessments including quizzes, exercises, and case studies.
    """
    try:
        settings = get_settings()
        openai_client = OpenAI(api_key=settings.openai_api_key)
        
        # Extract context
        module_name = content_context.get("module_name", "Course Module")
        learning_objectives = content_context.get("learning_objectives", [])
        key_concepts = content_context.get("key_concepts", [])
        
        # Assessment requirements
        if assessment_requirements:
            num_assessments = assessment_requirements.get("num_assessments", 2)
            assessment_types = assessment_requirements.get("types", ["Quiz", "Case_Study_Analysis"])
        else:
            num_assessments = 2
            assessment_types = ["Quiz", "Case_Study_Analysis"]
        
        assessment_prompt = f"""
        Create {num_assessments} comprehensive assessments for: {module_name}
        
        LEARNING OBJECTIVES TO ASSESS:
        {chr(10).join(f"- {obj}" for obj in learning_objectives)}
        
        KEY CONCEPTS TO EVALUATE:
        {chr(10).join(f"- {concept}" for concept in key_concepts)}
        
        ASSESSMENT TYPES:
        {chr(10).join(f"- {assessment_type}" for assessment_type in assessment_types)}
        
        ASSESSMENT REQUIREMENTS:
        1. Quiz: 8-10 multiple choice and short answer questions
        2. Case Study Analysis: Real business scenario requiring analysis and recommendations
        
        For each assessment, provide:
        - Assessment title and description
        - Detailed questions or scenario
        - Estimated completion time
        - Grading criteria and rubric
        - Weight in overall module grade
        - Expected learning outcomes
        
        Format as structured JSON.
        """
        
        response = openai_client.chat.completions.create(
            model=settings.default_model,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert assessment designer creating comprehensive evaluations."
                },
                {"role": "user", "content": assessment_prompt}
            ],
            temperature=0.6,
            max_tokens=3000,
            response_format={"type": "json_object"}
        )
        
        assessments_data = json.loads(response.choices[0].message.content)
        assessments = assessments_data.get("assessments", [])
        
        # Convert to Assessment objects
        assessment_objects = []
        for i, assessment in enumerate(assessments):
            assessment_obj = Assessment(
                assessment_id=f"assessment_{i+1}_{module_name.lower().replace(' ', '_')}",
                assessment_type=AssessmentType(assessment.get("type", "Quiz")),
                title=assessment.get("title", f"Assessment {i+1}"),
                description=assessment.get("description", ""),
                weight_in_module_grade=assessment.get("weight", 0.5),
                criteria=assessment.get("criteria", []),
                content_details=assessment.get("details", {}),
                estimated_duration_minutes=assessment.get("duration_minutes", 30)
            )
            assessment_objects.append(assessment_obj)
        
        result_data = {
            "assessments": [assessment.dict() for assessment in assessment_objects],
            "assessment_count": len(assessment_objects),
            "total_estimated_minutes": sum(
                assessment.estimated_duration_minutes or 0 for assessment in assessment_objects
            ),
            "total_weight": sum(
                assessment.weight_in_module_grade or 0 for assessment in assessment_objects
            ),
            "module_name": module_name,
            "creation_timestamp": datetime.now().isoformat(),
            "success": True
        }

        
        return json.dumps(result_data)
        
    except Exception as e:
        logger.error(f"Assessment creation failed: {e}")
        result_data = {
            "error": str(e),
            "assessments": [],
            "assessment_count": 0,
            "success": False
        }

        return json.dumps(result_data)


@function_tool
def personalization_engine(
    content: str,
    personalization_context: str
) -> str:
    """
    Enhance content with personalization elements.
    
    Adds employee-specific context, examples, and connections.
    """
    try:
        settings = get_settings()
        openai_client = OpenAI(api_key=settings.openai_api_key)
        
        # Extract personalization details
        employee_name = personalization_context.get("employee_name", "Learner")
        current_role = personalization_context.get("current_role", "Professional")
        career_goal = personalization_context.get("career_aspiration", "")
        tools_used = personalization_context.get("key_tools", [])
        responsibilities = personalization_context.get("responsibilities", [])
        
        personalization_prompt = f"""
        Enhance the following content with personalization for {employee_name}.
        
        PERSONALIZATION CONTEXT:
        - Name: {employee_name}
        - Current Role: {current_role}
        - Career Goal: {career_goal}
        - Primary Tools: {', '.join(tools_used)}
        - Key Responsibilities: {', '.join(responsibilities[:3])}
        
        ORIGINAL CONTENT:
        {content[:8000]}  # Limit for token constraints
        
        ENHANCEMENT REQUIREMENTS:
        1. Replace generic references with {employee_name}'s name
        2. Add role-specific examples relevant to {current_role}
        3. Include scenarios using their tools: {', '.join(tools_used)}
        4. Connect concepts to their responsibilities
        5. Reference career progression toward {career_goal}
        6. Add practical applications for their context
        
        PERSONALIZATION STYLE:
        - Natural, conversational tone
        - Direct relevance to their work
        - Specific, actionable examples
        - Career-focused connections
        
        Return the enhanced content maintaining the original structure and word count.
        """
        
        response = openai_client.chat.completions.create(
            model=settings.default_model,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert in personalizing educational content for individual learners."
                },
                {"role": "user", "content": personalization_prompt}
            ],
            temperature=0.6,
            max_tokens=8000
        )
        
        personalized_content = response.choices[0].message.content
        
        result_data = {
            "personalized_content": personalized_content,
            "personalization_elements": {
                "employee_name_mentions": personalized_content.count(employee_name),
                "role_specific_examples": True,
                "tool_references": any(tool.lower() in personalized_content.lower() for tool in tools_used),
                "career_connections": career_goal.lower() in personalized_content.lower() if career_goal else False
            },
            "original_word_count": len(content.split()),
            "personalized_word_count": len(personalized_content.split()),
            "personalized_for": employee_name,
            "enhancement_timestamp": datetime.now().isoformat(),
            "success": True
        }
        
        return json.dumps(result_data)
        
    except Exception as e:
        logger.error(f"Personalization failed: {e}")
        result_data = {
            "error": str(e),
            "personalized_content": content,  # Return original on failure
            "success": False
        }

        return json.dumps(result_data)


@function_tool
def structure_optimizer(
    content: str,
    structural_requirements: str = None
) -> str:
    """
    Optimize content structure for better learning flow.
    
    Improves organization, readability, and learning progression.
    """
    try:
        settings = get_settings()
        openai_client = OpenAI(api_key=settings.openai_api_key)
        
        # Define structural requirements
        if structural_requirements:
            target_sections = structural_requirements.get("target_sections", 6)
            include_summaries = structural_requirements.get("include_summaries", True)
            add_learning_checks = structural_requirements.get("add_learning_checks", True)
        else:
            target_sections = 6
            include_summaries = True
            add_learning_checks = True
        
        optimization_prompt = f"""
        Optimize the structure and organization of the following content for better learning flow.
        
        CONTENT TO OPTIMIZE:
        {content[:8000]}  # Limit for token constraints
        
        STRUCTURAL REQUIREMENTS:
        - Organize into {target_sections} logical sections
        - Add clear section headings and subheadings
        - Include section summaries: {include_summaries}
        - Add learning check questions: {add_learning_checks}
        - Ensure logical progression of concepts
        - Improve readability and flow
        
        OPTIMIZATION GOALS:
        1. Clear, logical structure with smooth transitions
        2. Progressive difficulty and concept building
        3. Consistent formatting and style
        4. Enhanced readability with bullet points and lists
        5. Strategic placement of examples and applications
        6. Improved engagement with varied content types
        
        STRUCTURAL ELEMENTS TO INCLUDE:
        - Section introductions and objectives
        - Key concept highlighting
        - Practical examples in each section
        - Section summaries with key takeaways
        - Learning check questions
        - Smooth transitions between sections
        
        Return the optimized content with improved structure while maintaining the core information and word count.
        """
        
        response = openai_client.chat.completions.create(
            model=settings.default_model,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert instructional designer optimizing content structure for effective learning."
                },
                {"role": "user", "content": optimization_prompt}
            ],
            temperature=0.4,
            max_tokens=8000
        )
        
        optimized_content = response.choices[0].message.content
        
        # Analyze structure improvements
        section_count = optimized_content.count('#')
        has_summaries = 'summary' in optimized_content.lower()
        has_learning_checks = 'question:' in optimized_content.lower() or 'check:' in optimized_content.lower()
        
        result_data = {
            "optimized_content": optimized_content,
            "structural_improvements": {
                "section_count": section_count,
                "has_clear_headings": section_count >= target_sections,
                "includes_summaries": has_summaries,
                "includes_learning_checks": has_learning_checks,
                "improved_readability": True
            },
            "original_word_count": len(content.split()),
            "optimized_word_count": len(optimized_content.split()),
            "optimization_timestamp": datetime.now().isoformat(),
            "success": True
        }
        
        return json.dumps(result_data)
        
    except Exception as e:
        logger.error(f"Structure optimization failed: {e}")
        result_data = {
            "error": str(e),
            "optimized_content": content,  # Return original on failure
            "success": False
        }

        return json.dumps(result_data)