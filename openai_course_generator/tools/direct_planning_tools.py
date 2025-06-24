#!/usr/bin/env python3
"""
Direct Planning Tools for Simplified Pipeline

These are standalone versions of the planning tools without the @function_tool decorator,
allowing direct synchronous calls from the simplified pipeline.
"""

import json
import logging
from datetime import datetime
from typing import Dict, Any, List
from openai import OpenAI

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# OpenAI client for planning tools
# Import settings
from config.settings import get_settings
settings = get_settings()
OPENAI_API_KEY = settings.openai_api_key
openai_client = OpenAI(api_key=OPENAI_API_KEY)

def generate_module_outline_with_allocations(module_spec: str, employee_profile: str) -> str:
    """
    Generate detailed module outline with section-specific word allocations and content requirements.
    
    This is a direct copy of the planning_tools function without the @function_tool decorator.
    """
    try:
        logger.info("📋 Generating detailed module outline with word allocations...")
        
        # Parse input data
        module = json.loads(module_spec) if isinstance(module_spec, str) else module_spec
        profile = json.loads(employee_profile) if isinstance(employee_profile, str) else employee_profile
        
        # Extract module details
        module_name = module.get("module_name", "")
        total_words = module.get("word_count_target", 4000)
        priority_level = module.get("priority_level", "medium")
        section_allocations = module.get("section_word_allocation", {})
        complexity_factors = module.get("complexity_factors", {})
        
        # Get learner characteristics
        experience_level = profile.get("experience_level", "junior")
        practical_emphasis = profile.get("learning_preferences", {}).get("practical_emphasis", 0.7)
        tools_used = profile.get("skill_inventory", {}).get("tool_proficiency", [])
        
        # Generate outline prompt
        outline_prompt = f"""
        Create a detailed content outline for module: {module_name}
        
        LEARNER CONTEXT:
        - Experience: {experience_level}
        - Practical Emphasis: {practical_emphasis*100:.0f}%
        - Tools: {', '.join(tools_used)}
        - Priority Level: {priority_level}
        
        MODULE SPECIFICATIONS:
        - Total Word Target: {total_words}
        - Complexity: {complexity_factors.get('conceptual_depth', 'medium')}
        - Tool Integration: {complexity_factors.get('tool_specific_content', 0.5)*100:.0f}%
        
        SECTION ALLOCATIONS:
        {json.dumps(section_allocations, indent=2)}
        
        For each section, provide:
        1. Detailed content outline (bullet points)
        2. Specific learning objectives
        3. Key concepts to cover
        4. Examples/case studies needed
        5. Tool-specific applications
        6. Assessment/practice elements
        
        OUTPUT FORMAT (JSON):
        {{
            "module_outline": {{
                "introduction": {{
                    "word_target": {section_allocations.get('introduction', 800)},
                    "content_outline": ["point1", "point2", ...],
                    "learning_objectives": ["objective1", "objective2"],
                    "key_concepts": ["concept1", "concept2"],
                    "examples_needed": ["example1", "example2"],
                    "engagement_elements": ["hook", "relevance_statement"]
                }},
                "core_content": {{
                    "word_target": {section_allocations.get('core_content', 2000)},
                    "content_outline": ["main_topic1", "subtopic1a", "subtopic1b"],
                    "learning_objectives": ["master concept X", "understand Y"],
                    "key_concepts": ["fundamental1", "fundamental2"],
                    "depth_level": "foundational|intermediate|advanced",
                    "theoretical_framework": ["theory1", "model1"]
                }},
                "practical_applications": {{
                    "word_target": {section_allocations.get('practical_applications', 1200)},
                    "content_outline": ["tool_application1", "workflow1"],
                    "tool_specific_content": {tools_used},
                    "hands_on_exercises": ["exercise1", "exercise2"],
                    "real_world_scenarios": ["scenario1", "scenario2"],
                    "step_by_step_guides": ["guide1", "guide2"]
                }},
                "case_studies": {{
                    "word_target": {section_allocations.get('case_studies', 700)},
                    "content_outline": ["case1", "case2"],
                    "industry_context": "finance/business performance",
                    "complexity_level": "{experience_level}_appropriate",
                    "analysis_frameworks": ["framework1", "framework2"],
                    "discussion_points": ["point1", "point2"]
                }},
                "assessments": {{
                    "word_target": {section_allocations.get('assessments', 300)},
                    "content_outline": ["quiz_questions", "practical_exercises"],
                    "assessment_types": ["knowledge_check", "application"],
                    "success_criteria": ["criteria1", "criteria2"],
                    "feedback_mechanisms": ["immediate", "explanatory"]
                }}
            }},
            "content_requirements": {{
                "total_word_target": {total_words},
                "section_distribution": {section_allocations},
                "personalization_factors": {{
                    "experience_level": "{experience_level}",
                    "practical_emphasis": {practical_emphasis},
                    "tool_integration": {tools_used}
                }}
            }}
        }}
        
        Make the outline highly specific to their role in business performance reporting.
        """
        
        # Call OpenAI to generate detailed outline
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert instructional designer who creates detailed content outlines. ALWAYS return your response as valid JSON only, no additional text."},
                {"role": "user", "content": outline_prompt + "\n\nIMPORTANT: Return ONLY valid JSON in your response, no additional text or explanations."}
            ],
            temperature=0.2,
            max_tokens=4000
        )
        
        outline_data = json.loads(response.choices[0].message.content)
        
        # Add metadata
        outline_data["generation_metadata"] = {
            "tool_name": "generate_module_outline_with_allocations",
            "openai_model": "gpt-4",
            "generation_timestamp": datetime.now().isoformat(),
            "module_name": module_name,
            "token_usage": {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens
            }
        }
        
        # Add success flag
        outline_data["success"] = True
        
        logger.info(f"✅ Module outline generated: {module_name} with {total_words} word target")
        return json.dumps(outline_data)
        
    except Exception as e:
        logger.error(f"❌ Module outline generation failed: {e}")
        return json.dumps({"error": str(e), "success": False})