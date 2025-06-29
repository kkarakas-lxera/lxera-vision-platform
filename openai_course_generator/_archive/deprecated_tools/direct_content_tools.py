#!/usr/bin/env python3
"""
Direct Content Tools for Simplified Pipeline

These are standalone versions of the content tools without the @function_tool decorator,
allowing direct synchronous calls from the simplified pipeline.
"""

import json
import time
import logging
from datetime import datetime
from typing import Dict, Any, List
from openai import OpenAI

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# OpenAI client for content generation
# Import settings
from config.settings import get_settings
settings = get_settings()
OPENAI_API_KEY = settings.openai_api_key
openai_client = OpenAI(api_key=OPENAI_API_KEY)

def generate_section_with_structured_subsections(section_name: str, module_outline: str, module_spec: str, research_context: str = None) -> str:
    """
    Generate a specific section using structured sub-section approach for better word count adherence.
    
    This function breaks down sections into mandatory sub-sections to ensure proper word count.
    """
    try:
        logger.info(f"📝 Generating {section_name} section with structured sub-sections...")
        
        # Parse inputs
        outline = json.loads(module_outline) if isinstance(module_outline, str) else module_outline
        spec = json.loads(module_spec) if isinstance(module_spec, str) else module_spec
        research = json.loads(research_context) if research_context and isinstance(research_context, str) else {}
        
        # Get section outline
        section_outline = outline.get("module_outline", {}).get(section_name, {})
        word_target = section_outline.get("word_target", 1000)
        
        # Define sub-section structure based on section type
        subsection_structures = {
            "introduction": [
                {"name": "hook_and_relevance", "words": int(word_target * 0.25), "description": "Engaging opening and why this matters"},
                {"name": "learning_objectives", "words": int(word_target * 0.25), "description": "Clear learning objectives and outcomes"},
                {"name": "module_overview", "words": int(word_target * 0.30), "description": "Module structure and what to expect"},
                {"name": "prerequisites", "words": int(word_target * 0.20), "description": "Prerequisites and preparation"}
            ],
            "core_content": [
                {"name": "foundational_concepts", "words": int(word_target * 0.30), "description": "Core theoretical foundations"},
                {"name": "detailed_explanations", "words": int(word_target * 0.35), "description": "In-depth explanations with examples"},
                {"name": "advanced_topics", "words": int(word_target * 0.25), "description": "Advanced concepts and nuances"},
                {"name": "summary_connections", "words": int(word_target * 0.10), "description": "Summary and connections"}
            ],
            "practical_applications": [
                {"name": "overview_context", "words": int(word_target * 0.15), "description": "Overview and real-world context"},
                {"name": "tool_setup", "words": int(word_target * 0.20), "description": "Tool setup and prerequisites"},
                {"name": "tutorial_one", "words": int(word_target * 0.30), "description": "First detailed tutorial"},
                {"name": "tutorial_two", "words": int(word_target * 0.25), "description": "Second detailed tutorial"},
                {"name": "best_practices", "words": int(word_target * 0.10), "description": "Best practices and tips"}
            ],
            "case_studies": [
                {"name": "case_introduction", "words": int(word_target * 0.20), "description": "Case background and context"},
                {"name": "case_analysis", "words": int(word_target * 0.40), "description": "Detailed case analysis"},
                {"name": "solution_discussion", "words": int(word_target * 0.30), "description": "Solution approach and discussion"},
                {"name": "lessons_learned", "words": int(word_target * 0.10), "description": "Key takeaways and lessons"}
            ],
            "assessments": [
                {"name": "knowledge_checks", "words": int(word_target * 0.40), "description": "Multiple choice and short answer questions"},
                {"name": "practical_exercises", "words": int(word_target * 0.40), "description": "Hands-on exercises"},
                {"name": "reflection_questions", "words": int(word_target * 0.20), "description": "Reflection and application questions"}
            ]
        }
        
        # Get subsections for this section type
        subsections = subsection_structures.get(section_name, [])
        
        # Generate each subsection
        generated_content = []
        total_words = 0
        
        # Extract context once for all subsections
        module_name = spec.get("module_name", "Module")
        employee_name = spec.get("personalization_context", {}).get("employee_name", "Learner")
        current_role = spec.get("personalization_context", {}).get("current_role", "Analyst")
        tools = spec.get("tool_integration", [])
        
        for subsection in subsections:
            subsection_content = _generate_subsection(
                section_name=section_name,
                subsection=subsection,
                section_outline=section_outline,
                module_name=module_name,
                employee_name=employee_name,
                current_role=current_role,
                tools=tools,
                research=research
            )
            
            if subsection_content:
                generated_content.append(subsection_content)
                words = len(subsection_content.split())
                total_words += words
                logger.info(f"   ✅ Generated {subsection['name']}: {words} words")
        
        # Combine all subsections
        full_content = "\n\n".join(generated_content)
        
        # Validate total word count
        min_words = int(word_target * 0.9)
        max_words = int(word_target * 1.1)
        
        if total_words >= min_words and total_words <= max_words:
            result = {
                "success": True,
                "section_name": section_name,
                "content": full_content,
                "word_count": total_words,
                "validation": {
                    "validation_status": "passed",
                    "word_count": total_words,
                    "target_words": word_target,
                    "variance_percentage": abs(total_words - word_target) / word_target * 100,
                    "subsections_generated": len(subsections)
                },
                "generation_metadata": {
                    "method": "structured_subsections",
                    "model": "gpt-4-turbo",
                    "timestamp": datetime.now().isoformat()
                }
            }
            logger.info(f"✅ {section_name} generated successfully: {total_words} words")
        else:
            # If still short, use continuation strategy
            shortage = word_target - total_words
            if shortage > 100:  # Only if significantly short
                continuation = _generate_continuation(
                    section_name=section_name,
                    current_content=full_content,
                    shortage=shortage,
                    section_outline=section_outline,
                    module_name=module_name
                )
                if continuation:
                    full_content += f"\n\n{continuation}"
                    total_words = len(full_content.split())
            
            result = {
                "success": total_words >= min_words,
                "section_name": section_name,
                "content": full_content,
                "word_count": total_words,
                "validation": {
                    "validation_status": "passed" if total_words >= min_words else "failed",
                    "word_count": total_words,
                    "target_words": word_target,
                    "variance_percentage": abs(total_words - word_target) / word_target * 100
                }
            }
        
        return json.dumps(result)
        
    except Exception as e:
        logger.error(f"❌ Section generation failed: {e}")
        return json.dumps({
            "success": False,
            "section_name": section_name,
            "error": str(e)
        })

def _generate_subsection(section_name, subsection, section_outline, module_name, employee_name, current_role, tools, research):
    """Helper function to generate individual subsections."""
    try:
        target_words = subsection["words"]
        
        # Build subsection-specific prompt
        if section_name == "practical_applications" and subsection["name"] == "tutorial_one":
            prompt = f"""
            Write a detailed step-by-step tutorial for {module_name}.
            
            STRICT REQUIREMENTS:
            - EXACTLY {target_words} words (tolerance: ±10%)
            - Focus: {subsection["description"]}
            - Tools: {', '.join(tools[:2]) if tools else 'Excel'}
            
            STRUCTURE:
            1. Brief introduction (50 words)
            2. Step-by-step instructions with screenshots descriptions (at least 5 steps, 50+ words each)
            3. Common pitfalls and solutions ({int(target_words * 0.2)} words)
            4. Practice exercise ({int(target_words * 0.15)} words)
            
            Be specific, detailed, and practical. Include exact menu paths, button names, and formulas.
            """
        else:
            # Generic subsection prompt
            prompt = f"""
            Write the {subsection['name'].replace('_', ' ')} section for {module_name}.
            
            STRICT REQUIREMENTS:
            - EXACTLY {target_words} words (tolerance: ±10%)
            - Focus: {subsection['description']}
            - Personalized for: {employee_name} ({current_role})
            
            CONTENT REQUIREMENTS:
            - Start with a clear topic sentence
            - Include at least {max(3, target_words // 100)} detailed paragraphs
            - Each paragraph should be {target_words // max(3, target_words // 100)} words
            - Use specific examples relevant to financial analysis
            - Be comprehensive and detailed
            
            {f"Key concepts to cover: {', '.join(section_outline.get('key_concepts', [])[:3])}" if section_outline.get('key_concepts') else ""}
            """
        
        # Generate with higher temperature for more content
        response = openai_client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": f"You are an expert course writer. You MUST generate EXACTLY {target_words} words. Be detailed, comprehensive, and specific."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,  # Higher for more verbose output
            max_tokens=int(target_words * 1.8)  # More room for generation
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        logger.error(f"❌ Subsection generation failed: {e}")
        return None

def _generate_continuation(section_name, current_content, shortage, section_outline, module_name):
    """Generate additional content to meet word count requirements."""
    try:
        prompt = f"""
        The {section_name} section for "{module_name}" needs {shortage} more words.
        
        Current content ends with: ...{current_content[-200:]}
        
        Continue with {shortage} words of additional relevant content:
        - Add more detailed examples
        - Expand on practical applications
        - Include additional tips or best practices
        - Provide more context or background
        
        Make it flow naturally from the existing content.
        """
        
        response = openai_client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": f"Continue the content naturally. Generate EXACTLY {shortage} words."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
            max_tokens=int(shortage * 1.5)
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        logger.error(f"❌ Continuation generation failed: {e}")
        return None

def generate_section_with_outline(section_name: str, module_outline: str, module_spec: str, research_context: str = None) -> str:
    """
    Generate a specific section - tries structured subsections first for better word count adherence.
    
    This wrapper function attempts the new structured approach first, then falls back to original if needed.
    """
    # Try structured subsections approach first (better for word count adherence)
    try:
        logger.info(f"🔄 Attempting structured subsection generation for {section_name}...")
        result = generate_section_with_structured_subsections(section_name, module_outline, module_spec, research_context)
        result_data = json.loads(result)
        
        if result_data.get("success"):
            logger.info(f"✅ Structured approach succeeded for {section_name}")
            return result
    except Exception as e:
        logger.warning(f"⚠️ Structured approach failed for {section_name}: {e}, falling back to original method")
    
    # Fallback to original generation method
    try:
        logger.info(f"📝 Generating {section_name} section with original outline-based method...")
        
        # Parse inputs
        outline = json.loads(module_outline) if isinstance(module_outline, str) else module_outline
        spec = json.loads(module_spec) if isinstance(module_spec, str) else module_spec
        research = json.loads(research_context) if research_context and isinstance(research_context, str) else {}
        
        # Get section outline
        section_outline = outline.get("module_outline", {}).get(section_name, {})
        word_target = section_outline.get("word_target", 1000)
        min_words = int(word_target * 0.9)  # Allow 10% variance
        max_words = int(word_target * 1.1)
        
        # Extract personalization context
        module_name = spec.get("module_name", "Module")
        employee_name = spec.get("personalization_context", {}).get("employee_name", "Learner")
        current_role = spec.get("personalization_context", {}).get("current_role", "Analyst")
        tools = spec.get("tool_integration", [])
        
        # Get section-specific requirements
        content_outline = section_outline.get("content_outline", [])
        learning_objectives = section_outline.get("learning_objectives", [])
        key_concepts = section_outline.get("key_concepts", [])
        
        # Prepare content prompt based on section type
        if section_name == "introduction":
            system_prompt = "You are an expert course writer creating engaging, personalized introductions."
            content_prompt = f"""
            Create an engaging introduction for "{module_name}" module.
            
            REQUIREMENTS:
            - Word count: {min_words}-{max_words} words (Target: {word_target})
            - Personalized for: {employee_name} ({current_role})
            
            CONTENT OUTLINE:
            {chr(10).join(f"- {item}" for item in content_outline)}
            
            LEARNING OBJECTIVES:
            {chr(10).join(f"- {obj}" for obj in learning_objectives)}
            
            KEY CONCEPTS TO INTRODUCE:
            {chr(10).join(f"- {concept}" for concept in key_concepts)}
            
            ENGAGEMENT ELEMENTS:
            {chr(10).join(f"- {elem}" for elem in section_outline.get("engagement_elements", []))}
            
            Write a compelling introduction that hooks the learner and clearly explains what they'll gain.
            """
            
        elif section_name == "core_content":
            system_prompt = "You are an expert instructional designer creating comprehensive educational content."
            content_prompt = f"""
            Create comprehensive core content for "{module_name}" module.
            
            REQUIREMENTS:
            - Word count: {min_words}-{max_words} words (Target: {word_target})
            - Depth level: {section_outline.get("depth_level", "intermediate")}
            
            CONTENT OUTLINE:
            {chr(10).join(f"- {item}" for item in content_outline)}
            
            KEY CONCEPTS TO COVER:
            {chr(10).join(f"- {concept}" for concept in key_concepts)}
            
            THEORETICAL FRAMEWORK:
            {chr(10).join(f"- {theory}" for theory in section_outline.get("theoretical_framework", []))}
            
            Create clear, structured content that builds understanding progressively.
            """
            
        elif section_name == "practical_applications":
            system_prompt = "You are an expert in creating hands-on, practical learning content."
            content_prompt = f"""
            Create practical applications section for "{module_name}" module.
            
            REQUIREMENTS:
            - Word count: {min_words}-{max_words} words (Target: {word_target})
            - Tools to integrate: {', '.join(tools)}
            
            CONTENT OUTLINE:
            {chr(10).join(f"- {item}" for item in content_outline)}
            
            HANDS-ON EXERCISES:
            {chr(10).join(f"- {exercise}" for exercise in section_outline.get("hands_on_exercises", []))}
            
            REAL-WORLD SCENARIOS:
            {chr(10).join(f"- {scenario}" for scenario in section_outline.get("real_world_scenarios", []))}
            
            Create practical, immediately applicable content with step-by-step guidance.
            """
            
        elif section_name == "case_studies":
            system_prompt = "You are an expert case study writer for business education."
            content_prompt = f"""
            Create relevant case studies for "{module_name}" module.
            
            REQUIREMENTS:
            - Word count: {min_words}-{max_words} words (Target: {word_target})
            - Industry context: {section_outline.get("industry_context", "business")}
            - Complexity: {section_outline.get("complexity_level", "intermediate")}
            
            CONTENT OUTLINE:
            {chr(10).join(f"- {item}" for item in content_outline)}
            
            ANALYSIS FRAMEWORKS:
            {chr(10).join(f"- {framework}" for framework in section_outline.get("analysis_frameworks", []))}
            
            Create realistic case studies that demonstrate practical application of concepts.
            """
            
        else:  # assessments
            system_prompt = "You are an expert in creating effective learning assessments."
            content_prompt = f"""
            Create assessment materials for "{module_name}" module.
            
            REQUIREMENTS:
            - Word count: {min_words}-{max_words} words (Target: {word_target})
            - Assessment types: {', '.join(section_outline.get("assessment_types", ["quiz"]))}
            
            CONTENT OUTLINE:
            {chr(10).join(f"- {item}" for item in content_outline)}
            
            SUCCESS CRITERIA:
            {chr(10).join(f"- {criteria}" for criteria in section_outline.get("success_criteria", []))}
            
            Create varied assessments that test understanding and application.
            """
        
        # Add research context if available
        if research and section_name in ["core_content", "practical_applications", "case_studies"]:
            research_insights = research.get("research_insights", {})
            if research_insights:
                content_prompt += f"""
                
                RESEARCH INSIGHTS TO INTEGRATE:
                - Key findings: {', '.join(research_insights.get("key_findings", [])[:3])}
                - Industry trends: {', '.join(research_insights.get("industry_trends", [])[:2])}
                """
        
        # Generate content with retry logic
        max_retries = 2
        for attempt in range(max_retries):
            try:
                # Calculate dynamic max_tokens
                max_tokens = int(word_target * 1.5 + 500)
                
                response = openai_client.chat.completions.create(
                    model="gpt-4-turbo",
                    messages=[
                        {"role": "system", "content": system_prompt + f" You MUST generate {word_target} words of content."},
                        {"role": "user", "content": content_prompt}
                    ],
                    temperature=0.7,
                    max_tokens=max_tokens
                )
                
                content = response.choices[0].message.content
                word_count = len(content.split())
                
                # Validate word count
                if word_count >= min_words and word_count <= max_words:
                    # Success - content meets requirements
                    validation_result = {
                        "validation_status": "passed",
                        "word_count": word_count,
                        "target_words": word_target,
                        "variance_percentage": abs(word_count - word_target) / word_target * 100
                    }
                    
                    result = {
                        "success": True,
                        "section_name": section_name,
                        "content": content,
                        "word_count": word_count,
                        "validation": validation_result,
                        "generation_metadata": {
                            "model": "gpt-4-turbo",
                            "attempt": attempt + 1,
                            "timestamp": datetime.now().isoformat(),
                            "token_usage": {
                                "prompt_tokens": response.usage.prompt_tokens,
                                "completion_tokens": response.usage.completion_tokens,
                                "total_tokens": response.usage.total_tokens
                            }
                        }
                    }
                    
                    logger.info(f"✅ {section_name} generated successfully: {word_count} words")
                    return json.dumps(result)
                    
                elif attempt < max_retries - 1:
                    # Retry with adjusted prompt
                    logger.warning(f"⚠️ {section_name} word count {word_count} outside range [{min_words}, {max_words}], retrying...")
                    shortfall = word_target - word_count
                    content_prompt += f"\n\nIMPORTANT: The content MUST be exactly {word_target} words. You are currently {abs(shortfall)} words {'short' if shortfall > 0 else 'over'}."
                    
            except Exception as e:
                logger.error(f"❌ Generation attempt {attempt + 1} failed: {e}")
                if attempt == max_retries - 1:
                    raise
        
        # All retries failed
        result = {
            "success": False,
            "section_name": section_name,
            "error": f"Failed to generate content within word limits after {max_retries} attempts",
            "last_word_count": word_count,
            "target_range": [min_words, max_words]
        }
        
        return json.dumps(result)
        
    except Exception as e:
        logger.error(f"❌ Section generation failed: {e}")
        return json.dumps({
            "success": False,
            "section_name": section_name,
            "error": str(e)
        })

def reallocate_word_budget(module_outline: str, failed_sections: str, available_sections: str) -> str:
    """
    Intelligently reallocate word budget when sections fail to meet targets.
    """
    try:
        logger.info("📊 Reallocating word budget from failed sections...")
        
        # Parse inputs
        outline = json.loads(module_outline) if isinstance(module_outline, str) else module_outline
        failed = json.loads(failed_sections) if isinstance(failed_sections, str) else failed_sections
        available = json.loads(available_sections) if isinstance(available_sections, str) else available_sections
        
        # Calculate total deficit
        total_deficit = sum(section.get("deficit", 0) for section in failed)
        
        if total_deficit == 0 or not available:
            return json.dumps({
                "reallocation_applied": False,
                "reason": "No deficit to reallocate or no available sections"
            })
        
        # Distribute deficit proportionally among available sections
        reallocation_plan = {}
        for section in available:
            section_name = section["section_name"]
            current_allocation = section["current_allocation"]
            # Allocate proportionally based on current size
            additional_words = int(total_deficit * (current_allocation / sum(s["current_allocation"] for s in available)))
            reallocation_plan[section_name] = {
                "original": current_allocation,
                "additional": additional_words,
                "new_target": current_allocation + additional_words
            }
        
        result = {
            "reallocation_applied": True,
            "total_deficit_redistributed": total_deficit,
            "reallocation_plan": reallocation_plan,
            "timestamp": datetime.now().isoformat()
        }
        
        logger.info(f"✅ Reallocated {total_deficit} words across {len(available)} sections")
        return json.dumps(result)
        
    except Exception as e:
        logger.error(f"❌ Word budget reallocation failed: {e}")
        return json.dumps({
            "reallocation_applied": False,
            "error": str(e)
        })

def validate_module_completion(module_outline: str, generated_sections: str) -> str:
    """
    Validate overall module completion and determine if acceptable despite failures.
    """
    try:
        logger.info("🔍 Validating module completion...")
        
        # Parse inputs
        outline = json.loads(module_outline) if isinstance(module_outline, str) else module_outline
        sections = json.loads(generated_sections) if isinstance(generated_sections, str) else generated_sections
        
        # Get total target
        total_target = outline.get("content_requirements", {}).get("total_word_target", 5000)
        
        # Calculate completion metrics
        total_words_generated = 0
        sections_completed = 0
        sections_failed = 0
        
        for section in sections:
            if section.get("success"):
                total_words_generated += section.get("word_count", 0)
                sections_completed += 1
            else:
                sections_failed += 1
        
        completion_percentage = (total_words_generated / total_target * 100) if total_target > 0 else 0
        
        # Determine quality assessment
        if completion_percentage >= 90:
            quality_assessment = "excellent"
            module_acceptable = True
        elif completion_percentage >= 80:
            quality_assessment = "good"
            module_acceptable = True
        elif completion_percentage >= 70:
            quality_assessment = "acceptable"
            module_acceptable = True
        elif completion_percentage >= 60:
            quality_assessment = "marginal"
            module_acceptable = True  # Still acceptable with warnings
        else:
            quality_assessment = "insufficient"
            module_acceptable = False
        
        result = {
            "module_acceptable": module_acceptable,
            "completion_analysis": {
                "total_words_generated": total_words_generated,
                "total_word_target": total_target,
                "completion_percentage": round(completion_percentage, 1),
                "sections_completed": sections_completed,
                "sections_failed": sections_failed,
                "quality_assessment": quality_assessment
            },
            "recommendation": "Proceed with module" if module_acceptable else "Module requires regeneration",
            "timestamp": datetime.now().isoformat()
        }
        
        logger.info(f"✅ Module validation complete: {quality_assessment} ({completion_percentage:.1f}%)")
        return json.dumps(result)
        
    except Exception as e:
        logger.error(f"❌ Module validation failed: {e}")
        return json.dumps({
            "module_acceptable": False,
            "error": str(e)
        })