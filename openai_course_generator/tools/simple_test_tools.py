"""Simple test tools with proper schema compliance for testing."""

import json
import logging
from datetime import datetime
from agents import function_tool
from openai import OpenAI

logger = logging.getLogger(__name__)


@function_tool
def simple_tavily_search(query: str, context: str = "general") -> str:
    """
    Simple Tavily search mock for testing schema compliance.
    """
    try:
        # Mock search results 
        result_data = {
            "search_results": [
                {
                    "title": f"Financial Analysis Guide for {query}",
                    "url": "https://example.com/financial-guide",
                    "content": f"Comprehensive guide covering {query} fundamentals, applications, and best practices."
                },
                {
                    "title": f"Practical {query} Examples",
                    "url": "https://example.com/examples",
                    "content": f"Real-world examples and case studies for {query} implementation."
                }
            ],
            "answer": f"{query} is a fundamental concept in financial analysis...",
            "query": query,
            "result_count": 2,
            "search_timestamp": datetime.now().isoformat(),
            "domain_focus": context,
            "success": True
        }
        return json.dumps(result_data)
        
    except Exception as e:
        logger.error(f"Simple Tavily search failed: {e}")
        error_data = {
            "error": str(e),
            "search_results": [],
            "query": query,
            "result_count": 0,
            "success": False
        }
        return json.dumps(error_data)


@function_tool  
def simple_content_generator(module_spec: str, research_data: str, personalization_context: str = None) -> str:
    """
    Simple content generator for testing schema compliance.
    """
    try:
        # Parse JSON inputs
        module_spec_data = json.loads(module_spec) if isinstance(module_spec, str) else module_spec
        research_data_parsed = json.loads(research_data) if isinstance(research_data, str) else research_data
        personalization_data = json.loads(personalization_context) if personalization_context else {}
        
        # Extract information
        module_name = module_spec_data.get("module_name", "Course Module")
        target_word_count = module_spec_data.get("target_word_count", 7500)
        employee_name = personalization_data.get("employee_name", "Learner")
        
        # Generate simple content
        generated_content = f"""
        # {module_name}
        
        Welcome, {employee_name}! This module covers the essential concepts of {module_name}.
        
        ## Learning Objectives
        - Understand key concepts
        - Apply practical knowledge
        - Develop professional skills
        
        ## Core Content
        
        {module_name} is a critical area of study that builds foundational knowledge for your career development.
        Through this comprehensive exploration, you will develop practical skills that directly apply to your role.
        
        ### Key Concepts
        
        The fundamental principles underlying {module_name} include several important areas:
        
        1. **Foundational Theory**: Understanding the basic principles and frameworks
        2. **Practical Application**: Real-world implementation strategies 
        3. **Advanced Techniques**: Professional-level skills and methodologies
        4. **Industry Standards**: Best practices and compliance requirements
        
        ### Real-World Applications
        
        As a professional in your field, {employee_name}, these concepts will help you:
        - Make informed decisions based on solid analysis
        - Implement effective strategies in your daily work
        - Communicate findings clearly to stakeholders
        - Drive organizational success through expertise
        
        ### Practical Examples
        
        Consider these scenarios relevant to your professional context:
        
        **Example 1**: Monthly reporting processes that require systematic analysis
        **Example 2**: Strategic planning sessions where data interpretation is crucial  
        **Example 3**: Performance evaluation meetings with quantitative assessments
        
        ### Implementation Guide
        
        To successfully apply these concepts in your work:
        
        1. Start with fundamental understanding of core principles
        2. Practice with sample data sets and scenarios
        3. Gradually increase complexity as confidence builds
        4. Seek feedback from experienced colleagues
        5. Document lessons learned for future reference
        
        ### Case Study Analysis
        
        Let's examine a practical case study that demonstrates these principles in action.
        This example shows how professional analysts approach complex problems using
        systematic methodologies and structured thinking processes.
        
        The case involves analyzing performance metrics to identify improvement opportunities
        and develop actionable recommendations for management consideration.
        
        ### Tools and Resources
        
        Professional tools that support this work include:
        - Excel for data analysis and modeling
        - PowerBI for visualization and reporting
        - Industry-specific software platforms
        - Professional development resources
        
        ### Summary and Next Steps
        
        This module has provided a comprehensive foundation in {module_name}.
        You now have the knowledge and tools needed to apply these concepts effectively
        in your professional role as you work toward your career objectives.
        
        Continue building expertise through practice, ongoing learning, and application
        of these principles in real-world situations.
        """
        
        word_count = len(generated_content.split())
        
        result_data = {
            "generated_content": generated_content,
            "word_count": word_count,
            "module_name": module_name,
            "personalized_for": employee_name,
            "generation_timestamp": datetime.now().isoformat(),
            "meets_word_count_requirement": 1000 <= word_count <= 10000,
            "quality_indicators": {
                "has_introduction": "welcome" in generated_content.lower(),
                "has_examples": "example" in generated_content.lower(),
                "has_summary": "summary" in generated_content.lower(),
                "personalization_present": employee_name.lower() in generated_content.lower()
            },
            "success": True
        }
        return json.dumps(result_data)
        
    except Exception as e:
        logger.error(f"Simple content generation failed: {e}")
        error_data = {
            "error": str(e),
            "generated_content": "",
            "word_count": 0,
            "success": False
        }
        return json.dumps(error_data)


@function_tool
def simple_employee_analyzer(employee_data: str) -> str:
    """
    Simple employee analyzer for testing schema compliance.
    """
    try:
        # Parse employee data
        employee_data_parsed = json.loads(employee_data) if isinstance(employee_data, str) else employee_data
        
        # Extract key information
        employee_name = employee_data_parsed.get("full_name", "Employee")
        current_role = employee_data_parsed.get("job_title_specific", "Professional") 
        career_goal = employee_data_parsed.get("career_aspirations_next_role", "Advanced Professional")
        
        # Create simple analysis
        analysis_result = {
            "key_skill_to_anchor_on": "Financial Analysis",
            "complexity_level": "intermediate",
            "personalization_strategy": "role_based_examples",
            "learning_style": "mixed_interactive",
            "tool_integration": ["Excel", "PowerBI"],
            "career_progression_focus": career_goal
        }
        
        result_data = {
            "employee_profile": {
                "name": employee_name,
                "current_role": current_role,
                "career_goal": career_goal
            },
            "personalization_levers": analysis_result,
            "employee_name": employee_name,
            "current_role": current_role,
            "career_goal": career_goal,
            "personalization_ready": True,
            "analysis_timestamp": datetime.now().isoformat(),
            "success": True
        }
        return json.dumps(result_data)
        
    except Exception as e:
        logger.error(f"Simple employee analysis failed: {e}")
        error_data = {
            "error": str(e),
            "employee_profile": {},
            "personalization_levers": {},
            "personalization_ready": False,
            "success": False
        }
        return json.dumps(error_data)


@function_tool
def simple_quality_assessor(content: str, criteria: str = "accuracy,clarity,completeness,engagement") -> str:
    """
    Simple quality assessor for testing schema compliance.
    """
    try:
        word_count = len(content.split())
        
        # Calculate simple quality metrics
        has_structure = content.count('#') >= 2
        has_examples = 'example' in content.lower()
        has_summary = 'summary' in content.lower()
        proper_length = 500 <= word_count <= 10000
        
        # Calculate overall score
        score_components = [
            8.0 if has_structure else 6.0,
            8.5 if has_examples else 6.5,
            8.0 if has_summary else 6.0,
            9.0 if proper_length else 5.0
        ]
        overall_score = sum(score_components) / len(score_components)
        
        result_data = {
            "overall_score": round(overall_score, 1),
            "quality_assessment": {
                "structure_score": 8.0 if has_structure else 6.0,
                "content_score": 8.5 if has_examples else 6.5,
                "completeness_score": 8.0 if has_summary else 6.0,
                "engagement_score": 9.0 if proper_length else 5.0
            },
            "word_count": word_count,
            "criteria_met": {
                "has_clear_structure": has_structure,
                "includes_examples": has_examples,
                "has_summary": has_summary,
                "appropriate_length": proper_length
            },
            "assessment_timestamp": datetime.now().isoformat(),
            "success": True
        }
        return json.dumps(result_data)
        
    except Exception as e:
        logger.error(f"Simple quality assessment failed: {e}")
        error_data = {
            "error": str(e),
            "overall_score": 0,
            "quality_assessment": {},
            "success": False
        }
        return json.dumps(error_data)