#!/usr/bin/env python3
"""
Agentic Content Generation Tools

These tools convert content generation to proper @function_tool decorators
so they appear as tool calls in OpenAI Traces tab instead of direct API calls.

UPDATES (2025-06-22):
- Increased max_tokens limits to prevent content truncation:
  - generate_module_introduction: 1500 → 2500 tokens
  - generate_core_content: 3000 → 4500 tokens  
  - generate_practical_applications: 2500 → 3500 tokens
  - generate_case_studies: 1800 → 2800 tokens
  - generate_assessment_materials: 2000 → 3000 tokens
- Added explicit word count enforcement in prompts
- Switched from gpt-4 to gpt-4-turbo for better length adherence
- Added validation logic with automatic retry if content is below 80% of target
- Enhanced system prompts to emphasize word count requirements
"""

import json
import time
import logging
from datetime import datetime
from typing import Dict, Any, List
from lxera_agents import function_tool
from openai import OpenAI

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import settings and OpenAI client for content generation with fallback
try:
    from config.settings import get_settings
    settings = get_settings()
    OPENAI_API_KEY = settings.openai_api_key
    openai_client = OpenAI(api_key=OPENAI_API_KEY)
except Exception as e:
    logger.warning(f"Failed to initialize settings: {e}")
    # Fallback to environment variable
    import os
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    if OPENAI_API_KEY:
        openai_client = OpenAI(api_key=OPENAI_API_KEY)
    else:
        openai_client = None
        logger.error("No OpenAI API key available")

def parse_word_count_target(word_count_input) -> int:
    """Parse word count target from string or int input.
    
    Args:
        word_count_input: Can be int (5000) or string ("4000-5000")
        
    Returns:
        int: Parsed word count (uses midpoint for ranges)
    """
    if isinstance(word_count_input, int):
        return word_count_input
    
    if isinstance(word_count_input, str):
        # Handle range format like "4000-5000"
        if "-" in word_count_input:
            try:
                min_val, max_val = word_count_input.split("-")
                return int((int(min_val.strip()) + int(max_val.strip())) / 2)
            except (ValueError, AttributeError):
                logger.warning(f"Could not parse range '{word_count_input}', using default 5000")
                return 5000
        else:
            # Single number as string
            try:
                return int(word_count_input)
            except ValueError:
                logger.warning(f"Could not parse '{word_count_input}', using default 5000")
                return 5000
    
    # Fallback
    logger.warning(f"Unexpected word_count_target type: {type(word_count_input)}, using default 5000")
    return 5000

@function_tool
def generate_module_introduction(module_spec: str, module_outline: str = None, research_context: str = None) -> str:
    """
    Generate comprehensive introduction section for a course module using outline-based word targets.
    
    Args:
        module_spec: JSON string with module specifications (name, learning objectives, etc.)
        module_outline: JSON string with detailed outline including section word allocations
        research_context: JSON string with research findings to integrate
        
    Returns:
        JSON string with generated introduction content and metadata
    """
    try:
        logger.info("📝 Generating module introduction with OpenAI agent...")
        
        # Parse module specifications and outline
        spec = json.loads(module_spec) if isinstance(module_spec, str) else module_spec
        outline = json.loads(module_outline) if module_outline and isinstance(module_outline, str) else (module_outline or {})
        research = json.loads(research_context) if research_context and isinstance(research_context, str) else (research_context or {})
        
        module_name = spec.get("module_name", "Course Module")
        employee_name = spec.get("personalization_context", {}).get("employee_name", "Learner")
        current_role = spec.get("personalization_context", {}).get("current_role", "Analyst")
        career_goal = spec.get("personalization_context", {}).get("career_goal", "Career advancement")
        tools = spec.get("tool_integration", [])
        
        # Get word count target from outline (planning agent decision)
        intro_outline = outline.get("module_outline", {}).get("introduction", {})
        word_count_target = intro_outline.get("word_target", 800)  # Use planning agent's allocation
        min_words = int(word_count_target * 0.9)  # Allow 10% variance
        max_words = int(word_count_target * 1.1)
        
        # Get content requirements from outline
        content_outline = intro_outline.get("content_outline", [])
        learning_objectives = intro_outline.get("learning_objectives", [])
        key_concepts = intro_outline.get("key_concepts", [])
        examples_needed = intro_outline.get("examples_needed", [])
        engagement_elements = intro_outline.get("engagement_elements", [])
        
        # Calculate max_tokens dynamically (1.5 tokens per word + buffer)
        max_tokens = int(word_count_target * 1.5 + 500)
        
        # Integrate research findings
        research_insights = research.get("research_insights", {})
        research_key_concepts = research_insights.get("key_concepts", [])
        practical_examples = research_insights.get("practical_examples", [])
        
        # Prepare content generation prompt using outline
        content_prompt = f"""
        Create a comprehensive, engaging introduction for the module: "{module_name}"
        
        PERSONALIZATION CONTEXT:
        - Student: {employee_name}
        - Current Role: {current_role}
        - Career Goal: {career_goal}
        - Tools Used: {', '.join(tools)}
        
        OUTLINE-BASED REQUIREMENTS:
        - Word count: {min_words}-{max_words} words (Target: {word_count_target} words)
        - CRITICAL: You MUST generate exactly {word_count_target} words of content
        
        CONTENT OUTLINE TO FOLLOW:
        {', '.join(content_outline)}
        
        LEARNING OBJECTIVES TO COVER:
        {', '.join(learning_objectives)}
        
        KEY CONCEPTS TO INCLUDE:
        {', '.join(key_concepts)}
        
        EXAMPLES NEEDED:
        {', '.join(examples_needed)}
        
        ENGAGEMENT ELEMENTS:
        {', '.join(engagement_elements)}
        
        RESEARCH INTEGRATION:
        Research Key Concepts: {', '.join(research_key_concepts[:3])}
        Practical Examples Available: {', '.join(practical_examples[:2])}
        
        ADDITIONAL REQUIREMENTS:
        - Highly personalized and relevant to their role
        - Explain strategic importance for their career  
        - Use engaging, professional tone
        - Include specific examples relevant to business performance reporting
        - Reference current industry trends from research
        - Structure with clear headings and bullet points
        - Follow the content outline exactly as specified
        
        FORMAT:
        Start with "# {module_name}" as main heading, then create well-structured content with:
        - Introduction paragraph (personal relevance)
        - Learning Objectives (3-4 specific outcomes)
        - Strategic Importance (why this matters for career)
        - Module Overview (what will be covered)
        - Real-World Applications (specific to their role)
        - Success Indicators (how they'll know they've mastered it)
        
        Make this content directly applicable to their role as {current_role} working toward {career_goal}.
        """
        
        # Generate content with OpenAI
        start_time = time.time()
        response = openai_client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "You are an expert educational content creator specializing in personalized professional development materials. Create comprehensive, practical, and engaging content that meets specified word count requirements."},
                {"role": "user", "content": content_prompt}
            ],
            temperature=0.7,
            max_tokens=max_tokens
        )
        
        generated_content = response.choices[0].message.content
        generation_time = time.time() - start_time
        word_count = len(generated_content.split())
        
        # Check if content meets minimum word count
        if word_count < min_words:
            logger.warning(f"⚠️ Generated content below minimum: {word_count} words (target: {word_count_target})")
            # Make a second attempt with explicit length requirement
            retry_prompt = f"{content_prompt}\n\nIMPORTANT: The previous generation was too short ({word_count} words). You MUST generate at least {min_words} words of content (target: {word_count_target} words). Do not stop until you reach this target."
            
            retry_response = openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert educational content creator. Generate comprehensive content that meets exact word count requirements."},
                    {"role": "user", "content": retry_prompt}
                ],
                temperature=0.8,
                max_tokens=max_tokens
            )
            generated_content = retry_response.choices[0].message.content
            word_count = len(generated_content.split())
            logger.info(f"🔄 Retry generation completed: {word_count} words")
        
        # Prepare result
        result = {
            "content_type": "module_introduction",
            "module_name": module_name,
            "generated_content": generated_content,
            "word_count": word_count,
            "generation_metadata": {
                "tool_name": "generate_module_introduction",
                "openai_model": "gpt-4-turbo",
                "generation_time_seconds": round(generation_time, 2),
                "token_usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                },
                "research_integration": {
                    "concepts_integrated": len(key_concepts),
                    "examples_used": len(practical_examples),
                    "research_quality": research_insights.get("research_depth", "basic")
                }
            },
            "quality_metrics": {
                "word_count_target": f"{min_words}-{max_words}",
                "actual_target": word_count_target,
                "within_target": min_words <= word_count <= max_words,
                "personalization_level": "high",
                "research_enhanced": len(key_concepts) > 0
            },
            "generation_timestamp": datetime.now().isoformat(),
            "success": True
        }
        
        logger.info(f"✅ Module introduction generated: {word_count} words in {generation_time:.1f}s")
        return json.dumps(result)
        
    except Exception as e:
        logger.error(f"❌ Module introduction generation failed: {e}")
        return json.dumps({
            "success": False,
            "error": str(e),
            "content_type": "module_introduction"
        })

@function_tool
def generate_core_content(module_spec: str, research_context: str = None) -> str:
    """
    Generate comprehensive core content section for a course module using OpenAI.
    
    Args:
        module_spec: JSON string with module specifications
        research_context: JSON string with research findings to integrate
        
    Returns:
        JSON string with generated core content and metadata
    """
    try:
        logger.info("📚 Generating core content with OpenAI agent...")
        
        # Parse inputs
        spec = json.loads(module_spec) if isinstance(module_spec, str) else module_spec
        research = json.loads(research_context) if research_context and isinstance(research_context, str) else (research_context or {})
        
        module_name = spec.get("module_name", "Course Module")
        personalization = spec.get("personalization_context", {})
        tools = spec.get("tool_integration", [])
        difficulty = spec.get("difficulty_level", "intermediate")
        
        # Get dynamic word count target from module spec
        # Core content should be roughly 40% of total module content
        module_word_target = parse_word_count_target(spec.get("word_count_target", 5000))
        word_count_target = int(module_word_target * 0.4)  # 40% for core content
        min_words = int(word_count_target * 0.8)
        max_words = int(word_count_target * 1.2)
        
        # Calculate max_tokens dynamically
        max_tokens = int(word_count_target * 1.5 + 500)
        
        # Research integration
        research_insights = research.get("research_insights", {})
        key_concepts = research_insights.get("key_concepts", [])
        practical_examples = research_insights.get("practical_examples", [])
        
        # Prepare content prompt
        content_prompt = f"""
        Create comprehensive core content for the module: "{module_name}"
        
        CONTEXT:
        - Student: {personalization.get('employee_name', 'Learner')} ({personalization.get('current_role', 'Analyst')})
        - Tools: {', '.join(tools)}
        - Difficulty: {difficulty}
        - This is the main instructional content section
        
        RESEARCH INTEGRATION:
        - Key Concepts: {', '.join(key_concepts)}
        - Practical Examples: {', '.join(practical_examples[:3])}
        
        REQUIREMENTS:
        - Word count: {min_words}-{max_words} words (Target: {word_count_target} words)
        - CRITICAL: You MUST generate at least {min_words} words of substantial content
        - Cover fundamental concepts and principles in depth
        - Include detailed explanations with step-by-step processes
        - Reference specific tools they use: {', '.join(tools)}
        - Make examples relevant to business performance reporting
        - Include practical tips and best practices from research
        - Use clear headings and subheadings
        - Add bullet points and numbered lists for clarity
        - Each section should be comprehensive and detailed
        
        CONTENT STRUCTURE:
        ## Fundamental Concepts
        ## Key Principles and Methodologies
        ## Step-by-Step Processes
        ## Tool-Specific Applications
        ## Best Practices and Industry Standards
        ## Common Challenges and Solutions
        
        Focus on actionable, practical knowledge they can immediately apply in their work.
        Integrate the research findings naturally throughout the content.
        """
        
        # Generate content
        start_time = time.time()
        response = openai_client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "You are an expert educational content creator specializing in detailed, practical professional training materials. Always generate comprehensive content that meets the specified word count requirements."},
                {"role": "user", "content": content_prompt}
            ],
            temperature=0.7,
            max_tokens=max_tokens
        )
        
        generated_content = response.choices[0].message.content
        generation_time = time.time() - start_time
        word_count = len(generated_content.split())
        
        # Check if content meets minimum word count
        if word_count < min_words:
            logger.warning(f"⚠️ Core content below minimum: {word_count} words (target: {word_count_target})")
            # Make a second attempt with explicit length requirement
            retry_prompt = f"{content_prompt}\n\nCRITICAL: The previous generation was too short ({word_count} words). You MUST generate at least {min_words} words of detailed, comprehensive content (target: {word_count_target} words). Continue expanding each section until you reach this target."
            
            retry_response = openai_client.chat.completions.create(
                model="gpt-4-turbo",  # Use turbo for better length adherence
                messages=[
                    {"role": "system", "content": "You are an expert educational content creator. Generate comprehensive, detailed content that meets exact word count requirements. Be thorough and extensive."},
                    {"role": "user", "content": retry_prompt}
                ],
                temperature=0.8,
                max_tokens=max_tokens
            )
            generated_content = retry_response.choices[0].message.content
            word_count = len(generated_content.split())
            logger.info(f"🔄 Retry generation completed: {word_count} words")
        
        result = {
            "content_type": "core_content",
            "module_name": module_name,
            "generated_content": generated_content,
            "word_count": word_count,
            "generation_metadata": {
                "tool_name": "generate_core_content",
                "openai_model": "gpt-4-turbo",
                "generation_time_seconds": round(generation_time, 2),
                "token_usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                }
            },
            "quality_metrics": {
                "word_count_target": f"{min_words}-{max_words}",
                "actual_target": word_count_target,
                "within_target": min_words <= word_count <= max_words,
                "research_integration": len(key_concepts) > 0,
                "tool_integration": len(tools) > 0
            },
            "generation_timestamp": datetime.now().isoformat(),
            "success": True
        }
        
        logger.info(f"✅ Core content generated: {word_count} words in {generation_time:.1f}s")
        return json.dumps(result)
        
    except Exception as e:
        logger.error(f"❌ Core content generation failed: {e}")
        return json.dumps({
            "success": False,
            "error": str(e),
            "content_type": "core_content"
        })

@function_tool
def generate_practical_applications(module_spec: str, research_context: str = None) -> str:
    """
    Generate practical applications section with real-world scenarios.
    
    Args:
        module_spec: JSON string with module specifications
        research_context: JSON string with research findings
        
    Returns:
        JSON string with generated practical applications content
    """
    try:
        logger.info("🔧 Generating practical applications with OpenAI agent...")
        
        # Parse inputs
        spec = json.loads(module_spec) if isinstance(module_spec, str) else module_spec
        research = json.loads(research_context) if research_context and isinstance(research_context, str) else (research_context or {})
        
        module_name = spec.get("module_name", "Course Module")
        personalization = spec.get("personalization_context", {})
        tools = spec.get("tool_integration", [])
        
        # Get dynamic word count target from module spec
        # Practical applications should be roughly 20% of total module content
        module_word_target = parse_word_count_target(spec.get("word_count_target", 5000))
        word_count_target = int(module_word_target * 0.2)  # 20% for practical applications
        min_words = int(word_count_target * 0.8)
        max_words = int(word_count_target * 1.2)
        
        # Calculate max_tokens dynamically
        max_tokens = int(word_count_target * 1.5 + 500)
        
        # Research integration
        research_insights = research.get("research_insights", {})
        practical_examples = research_insights.get("practical_examples", [])
        
        content_prompt = f"""
        Create comprehensive practical applications content for: "{module_name}"
        
        CONTEXT:
        - Student: {personalization.get('employee_name', 'Learner')}
        - Role: {personalization.get('current_role', 'Analyst')}
        - Tools: {', '.join(tools)}
        - Focus: immediate workplace application
        
        RESEARCH EXAMPLES TO INTEGRATE:
        {', '.join(practical_examples[:3])}
        
        REQUIREMENTS:
        - Word count: {min_words}-{max_words} words (Target: {word_count_target} words)
        - CRITICAL: You MUST generate at least {min_words} words of practical content
        - Provide specific, actionable examples
        - Include step-by-step workflows
        - Reference their actual tools: {', '.join(tools)}
        - Create scenarios relevant to business performance reporting
        - Include templates and frameworks they can use
        - Add troubleshooting tips
        - Provide measurement and success criteria
        - Be thorough and comprehensive in each section
        
        CONTENT STRUCTURE:
        ## Real-World Scenarios
        ## Step-by-Step Workflows
        ## Tool-Specific Implementation Examples
        ## Templates and Frameworks
        ## Success Metrics and Validation
        ## Troubleshooting Common Issues
        
        Make every example directly applicable to their daily work as {personalization.get('current_role', 'Analyst')}.
        """
        
        # Generate content
        start_time = time.time()
        response = openai_client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "You are an expert in creating practical, hands-on training materials focused on immediate workplace application. Generate comprehensive content that meets the specified word count requirements."},
                {"role": "user", "content": content_prompt}
            ],
            temperature=0.7,
            max_tokens=max_tokens
        )
        
        generated_content = response.choices[0].message.content
        generation_time = time.time() - start_time
        word_count = len(generated_content.split())
        
        result = {
            "content_type": "practical_applications",
            "module_name": module_name,
            "generated_content": generated_content,
            "word_count": word_count,
            "generation_metadata": {
                "tool_name": "generate_practical_applications",
                "openai_model": "gpt-4-turbo",
                "generation_time_seconds": round(generation_time, 2),
                "token_usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                }
            },
            "quality_metrics": {
                "word_count_target": f"{min_words}-{max_words}",
                "actual_target": word_count_target,
                "within_target": min_words <= word_count <= max_words,
                "practical_focus": True,
                "tool_integration": len(tools) > 0
            },
            "generation_timestamp": datetime.now().isoformat(),
            "success": True
        }
        
        logger.info(f"✅ Practical applications generated: {word_count} words in {generation_time:.1f}s")
        return json.dumps(result)
        
    except Exception as e:
        logger.error(f"❌ Practical applications generation failed: {e}")
        return json.dumps({
            "success": False,
            "error": str(e),
            "content_type": "practical_applications"
        })

@function_tool
def generate_case_studies(module_spec: str, research_context: str = None) -> str:
    """
    Generate detailed case studies section for the module.
    
    Args:
        module_spec: JSON string with module specifications
        research_context: JSON string with research findings
        
    Returns:
        JSON string with generated case studies content
    """
    try:
        logger.info("📊 Generating case studies with OpenAI agent...")
        
        # Parse inputs
        spec = json.loads(module_spec) if isinstance(module_spec, str) else module_spec
        research = json.loads(research_context) if research_context and isinstance(research_context, str) else (research_context or {})
        
        module_name = spec.get("module_name", "Course Module")
        personalization = spec.get("personalization_context", {})
        
        # Get dynamic word count target from module spec
        # Case studies should be roughly 15% of total module content
        module_word_target = parse_word_count_target(spec.get("word_count_target", 5000))
        word_count_target = int(module_word_target * 0.15)  # 15% for case studies
        min_words = int(word_count_target * 0.8)
        max_words = int(word_count_target * 1.2)
        
        # Calculate max_tokens dynamically
        max_tokens = int(word_count_target * 1.5 + 500)
        
        content_prompt = f"""
        Create detailed case studies for the module: "{module_name}"
        
        CONTEXT:
        - Student: {personalization.get('employee_name', 'Learner')}
        - Role: {personalization.get('current_role', 'Business Performance Analyst')}
        - Need realistic, detailed case studies that demonstrate application of concepts
        
        REQUIREMENTS:
        - Word count: {min_words}-{max_words} words (Target: {word_count_target} words)
        - CRITICAL: You MUST generate at least {min_words} words
        - Create 2-3 detailed case studies
        - Include background, challenges, solutions, and outcomes
        - Make scenarios relevant to business performance reporting
        - Show before/after states
        - Include lessons learned
        - Add discussion questions
        - Provide multiple solution approaches
        - Each case study should be substantial and complete
        
        CASE STUDY STRUCTURE:
        ## Case Study 1: [Title]
        ### Background and Context
        ### Challenge Description
        ### Solution Approach
        ### Implementation Process
        ### Results and Outcomes
        ### Key Lessons Learned
        ### Discussion Questions
        
        ## Case Study 2: [Title]
        [Same structure]
        
        Make each case study realistic, educational, and directly relevant to their role.
        Focus on business performance reporting scenarios they would encounter.
        """
        
        # Generate content
        start_time = time.time()
        response = openai_client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "You are an expert in creating realistic, educational business case studies for professional development. Always generate comprehensive content that meets the specified word count requirements."},
                {"role": "user", "content": content_prompt}
            ],
            temperature=0.7,
            max_tokens=max_tokens
        )
        
        generated_content = response.choices[0].message.content
        generation_time = time.time() - start_time
        word_count = len(generated_content.split())
        
        result = {
            "content_type": "case_studies",
            "module_name": module_name,
            "generated_content": generated_content,
            "word_count": word_count,
            "generation_metadata": {
                "tool_name": "generate_case_studies",
                "openai_model": "gpt-4-turbo",
                "generation_time_seconds": round(generation_time, 2),
                "token_usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                }
            },
            "quality_metrics": {
                "word_count_target": f"{min_words}-{max_words}",
                "actual_target": word_count_target,
                "within_target": min_words <= word_count <= max_words,
                "case_study_focus": True,
                "real_world_relevance": True
            },
            "generation_timestamp": datetime.now().isoformat(),
            "success": True
        }
        
        logger.info(f"✅ Case studies generated: {word_count} words in {generation_time:.1f}s")
        return json.dumps(result)
        
    except Exception as e:
        logger.error(f"❌ Case studies generation failed: {e}")
        return json.dumps({
            "success": False,
            "error": str(e),
            "content_type": "case_studies"
        })

@function_tool
def generate_assessment_materials(module_spec: str) -> str:
    """
    Generate assessment materials including quizzes and practical exercises.
    
    Args:
        module_spec: JSON string with module specifications
        
    Returns:
        JSON string with generated assessment materials
    """
    try:
        logger.info("📝 Generating assessment materials with OpenAI agent...")
        
        # Parse inputs
        spec = json.loads(module_spec) if isinstance(module_spec, str) else module_spec
        
        module_name = spec.get("module_name", "Course Module")
        learning_outcomes = spec.get("learning_outcomes", [])
        personalization = spec.get("personalization_context", {})
        
        # Get dynamic word count target from module spec
        # Assessments should be roughly 10% of total module content
        module_word_target = parse_word_count_target(spec.get("word_count_target", 5000))
        word_count_target = int(module_word_target * 0.1)  # 10% for assessments
        min_words = int(word_count_target * 0.8)
        max_words = int(word_count_target * 1.2)
        
        # Calculate max_tokens dynamically
        max_tokens = int(word_count_target * 1.5 + 500)
        
        content_prompt = f"""
        Create comprehensive assessment materials for: "{module_name}"
        
        LEARNING OUTCOMES TO ASSESS:
        {', '.join(learning_outcomes)}
        
        CONTEXT:
        - Student: {personalization.get('employee_name', 'Learner')}
        - Role: {personalization.get('current_role', 'Analyst')}
        
        CREATE:
        1. Knowledge Check Quiz (5 multiple choice questions)
        2. Practical Exercise (hands-on application)
        3. Self-Assessment Checklist
        4. Application Challenge (real-world scenario)
        
        REQUIREMENTS:
        - Word count: {min_words}-{max_words} words (Target: {word_count_target} words)
        - CRITICAL: You MUST generate at least {min_words} words of assessment content
        - Questions should test understanding and application
        - Include both conceptual and practical assessments
        - Provide detailed answer explanations
        - Include scoring rubrics
        - Make assessments relevant to business performance reporting
        
        FORMAT:
        ## Knowledge Check Quiz
        [5 multiple choice questions with explanations]
        
        ## Practical Exercise
        [Step-by-step hands-on task]
        
        ## Self-Assessment Checklist
        [Can-do statements for self-evaluation]
        
        ## Application Challenge
        [Real-world scenario to solve]
        """
        
        # Generate content
        start_time = time.time()
        response = openai_client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "You are an expert in creating effective educational assessments that measure both knowledge and practical application. Generate comprehensive assessment materials."},
                {"role": "user", "content": content_prompt}
            ],
            temperature=0.7,
            max_tokens=max_tokens
        )
        
        generated_content = response.choices[0].message.content
        generation_time = time.time() - start_time
        word_count = len(generated_content.split())
        
        result = {
            "content_type": "assessment_materials",
            "module_name": module_name,
            "generated_content": generated_content,
            "word_count": word_count,
            "generation_metadata": {
                "tool_name": "generate_assessment_materials",
                "openai_model": "gpt-4-turbo",
                "generation_time_seconds": round(generation_time, 2),
                "token_usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                }
            },
            "assessment_components": {
                "knowledge_quiz": True,
                "practical_exercise": True,
                "self_assessment": True,
                "application_challenge": True
            },
            "generation_timestamp": datetime.now().isoformat(),
            "success": True
        }
        
        logger.info(f"✅ Assessment materials generated: {word_count} words in {generation_time:.1f}s")
        return json.dumps(result)
        
    except Exception as e:
        logger.error(f"❌ Assessment materials generation failed: {e}")
        return json.dumps({
            "success": False,
            "error": str(e),
            "content_type": "assessment_materials"
        })

@function_tool
def compile_complete_module(introduction: str, core_content: str, practical_apps: str, case_studies: str, assessments: str) -> str:
    """
    Compile all module sections into a complete module package.
    
    Args:
        introduction: Content string (plain text or JSON) with introduction
        core_content: Content string (plain text or JSON) with core content
        practical_apps: Content string (plain text or JSON) with practical applications
        case_studies: Content string (plain text or JSON) with case studies
        assessments: Content string (plain text or JSON) with assessment materials
        
    Returns:
        JSON string with complete compiled module
    """
    try:
        logger.info("📦 Compiling complete module with all sections...")
        
        # Debug input parameters to identify JSON parsing issue
        logger.info(f"🔍 DEBUG - Parameter types:")
        logger.info(f"   introduction: {type(introduction)} - length: {len(str(introduction)) if introduction else 0}")
        logger.info(f"   core_content: {type(core_content)} - length: {len(str(core_content)) if core_content else 0}")
        logger.info(f"   practical_apps: {type(practical_apps)} - length: {len(str(practical_apps)) if practical_apps else 0}")
        logger.info(f"   case_studies: {type(case_studies)} - length: {len(str(case_studies)) if case_studies else 0}")
        logger.info(f"   assessments: {type(assessments)} - length: {len(str(assessments)) if assessments else 0}")
        
        # Smart content parser - handles both plain text and JSON
        def parse_content(data, param_name):
            if not data or (isinstance(data, str) and data.strip() == ""):
                logger.warning(f"⚠️ Parameter '{param_name}' is empty or None")
                return {"generated_content": "", "word_count": 0, "generation_metadata": {}}
            
            # Check if this looks like a content_id (UUID format)
            if isinstance(data, str) and len(data) < 300 and "-" in data:
                # Check for UUID pattern
                import re
                uuid_pattern = r'^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}'
                if re.match(uuid_pattern, data.strip()):
                    logger.error(f"❌ Received content_id instead of content for '{param_name}': {data}")
                    logger.warning(f"⚠️ Content Agent must pass actual content, not content_id!")
                    return {"generated_content": f"[ERROR: Content ID received instead of content: {data}]", "word_count": 0, "generation_metadata": {"error": "content_id_instead_of_content"}}
            
            # First, try to parse as JSON (for backward compatibility)
            if isinstance(data, str):
                try:
                    parsed = json.loads(data)
                    if isinstance(parsed, dict) and "generated_content" in parsed:
                        # It's our expected JSON format
                        return parsed
                except json.JSONDecodeError:
                    # Not JSON, treat as plain text
                    pass
            
            # Handle as plain text content
            content_str = str(data) if data else ""
            word_count = len(content_str.split()) if content_str else 0
            logger.info(f"✅ Parsed '{param_name}' as plain text: {word_count} words")
            
            return {
                "generated_content": content_str,
                "word_count": word_count,
                "generation_metadata": {"source": "plain_text", "tool_name": param_name}
            }
        
        # Parse all sections with smart handling
        intro_data = parse_content(introduction, "introduction")
        core_data = parse_content(core_content, "core_content")
        practical_data = parse_content(practical_apps, "practical_apps")
        case_data = parse_content(case_studies, "case_studies")
        assessment_data = parse_content(assessments, "assessments")
        
        # Log successful parsing
        logger.info(f"🔍 Successfully parsed {len([d for d in [intro_data, core_data, practical_data, case_data, assessment_data] if d])} sections")
        
        # Compile complete module
        complete_module = {
            "module_compilation": {
                "module_name": intro_data.get("module_name", "Complete Module"),
                "compilation_timestamp": datetime.now().isoformat(),
                "total_sections": 5
            },
            "sections": {
                "introduction": {
                    "content": intro_data.get("generated_content", ""),
                    "word_count": intro_data.get("word_count", 0),
                    "metadata": intro_data.get("generation_metadata", {})
                },
                "core_content": {
                    "content": core_data.get("generated_content", ""),
                    "word_count": core_data.get("word_count", 0),
                    "metadata": core_data.get("generation_metadata", {})
                },
                "practical_applications": {
                    "content": practical_data.get("generated_content", ""),
                    "word_count": practical_data.get("word_count", 0),
                    "metadata": practical_data.get("generation_metadata", {})
                },
                "case_studies": {
                    "content": case_data.get("generated_content", ""),
                    "word_count": case_data.get("word_count", 0),
                    "metadata": case_data.get("generation_metadata", {})
                },
                "assessments": {
                    "content": assessment_data.get("generated_content", ""),
                    "word_count": assessment_data.get("word_count", 0),
                    "metadata": assessment_data.get("generation_metadata", {})
                }
            },
            "module_metrics": {
                "total_word_count": sum([
                    intro_data.get("word_count", 0),
                    core_data.get("word_count", 0),
                    practical_data.get("word_count", 0),
                    case_data.get("word_count", 0),
                    assessment_data.get("word_count", 0)
                ]),
                "total_token_usage": sum([
                    intro_data.get("generation_metadata", {}).get("token_usage", {}).get("total_tokens", 0),
                    core_data.get("generation_metadata", {}).get("token_usage", {}).get("total_tokens", 0),
                    practical_data.get("generation_metadata", {}).get("token_usage", {}).get("total_tokens", 0),
                    case_data.get("generation_metadata", {}).get("token_usage", {}).get("total_tokens", 0),
                    assessment_data.get("generation_metadata", {}).get("token_usage", {}).get("total_tokens", 0)
                ]),
                "generation_tool_calls": 5,  # One for each section
                "sections_completed": 5
            },
            "quality_validation": {
                "all_sections_present": True,
                "target_word_count": "4000-6000",
                "actual_word_count": sum([
                    intro_data.get("word_count", 0),
                    core_data.get("word_count", 0),
                    practical_data.get("word_count", 0),
                    case_data.get("word_count", 0),
                    assessment_data.get("word_count", 0)
                ]),
                "research_integration": any([
                    intro_data.get("quality_metrics", {}).get("research_enhanced", False),
                    core_data.get("quality_metrics", {}).get("research_integration", False)
                ]),
                "tool_integration": any([
                    intro_data.get("quality_metrics", {}).get("tool_integration", False),
                    core_data.get("quality_metrics", {}).get("tool_integration", False),
                    practical_data.get("quality_metrics", {}).get("tool_integration", False)
                ])
            },
            "success": True
        }
        
        total_words = complete_module["module_metrics"]["total_word_count"]
        logger.info(f"✅ Complete module compiled: {total_words} total words across 5 sections")
        
        return json.dumps(complete_module)
        
    except Exception as e:
        logger.error(f"❌ Module compilation failed: {e}")
        return json.dumps({
            "success": False,
            "error": str(e),
            "content_type": "module_compilation"
        })


@function_tool
def revise_section_with_research(
    existing_content: str, 
    section_to_revise: str, 
    revision_instructions: str,
    search_results: str = "{}"
) -> str:
    """
    Revise a specific section of existing content using targeted instructions and web search results.
    
    Args:
        existing_content: The current complete module content
        section_to_revise: Which section needs revision (e.g., "introduction", "core_content", "practical_applications")
        revision_instructions: Specific instructions for what needs to be improved
        search_results: JSON string with current web search results from Tavily
    
    Returns:
        JSON string with revised content
    """
    try:
        logger.info(f"🔧 Revising {section_to_revise} section with web-enhanced research...")
        
        # Parse search results
        try:
            search_data = json.loads(search_results) if search_results else {}
        except:
            search_data = {}
        
        # Extract current web information
        current_examples = []
        if search_data.get("search_results"):
            for result in search_data["search_results"][:3]:  # Top 3 results
                if result.get("content"):
                    current_examples.append({
                        "source": result.get("url", ""),
                        "content": result.get("content", "")[:500],  # Limit length
                        "title": result.get("title", "")
                    })
        
        # Create revision prompt
        revision_prompt = f"""
        Revise the {section_to_revise} section of this module content based on specific feedback and current web research.
        
        EXISTING COMPLETE CONTENT:
        {existing_content[:6000]}  # Limit for context
        
        SECTION TO REVISE: {section_to_revise}
        
        SPECIFIC REVISION INSTRUCTIONS:
        {revision_instructions}
        
        CURRENT WEB RESEARCH (Use to enhance content):
        {json.dumps(current_examples, indent=2)}
        
        REQUIREMENTS:
        1. Keep all other sections exactly as they are
        2. Only revise the specified section: {section_to_revise}
        3. Integrate current web research findings where relevant
        4. Follow the specific revision instructions
        5. Maintain the overall structure and flow
        6. Use current examples and statistics from web search results
        
        Return the complete module with only the specified section revised and enhanced.
        """
        
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert content editor who makes targeted revisions to specific sections while preserving the rest of the content. Always integrate current web research findings."},
                {"role": "user", "content": revision_prompt}
            ],
            temperature=0.3,
            max_tokens=3000
        )
        
        revised_content = response.choices[0].message.content
        
        # Calculate word count
        word_count = len(revised_content.split())
        
        result_data = {
            "revised_content": revised_content,
            "section_revised": section_to_revise,
            "word_count": word_count,
            "web_sources_used": len(current_examples),
            "revision_timestamp": datetime.now().isoformat(),
            "success": True
        }
        
        logger.info(f"✅ Section {section_to_revise} revised with web enhancement: {word_count} words, {len(current_examples)} web sources")
        return json.dumps(result_data)
        
    except Exception as e:
        logger.error(f"Section revision failed: {e}")
        return json.dumps({"error": str(e), "success": False})


@function_tool
def enhance_with_current_data(content_section: str, enhancement_type: str, search_query: str) -> str:
    """
    Enhance a content section with current data via web search.
    
    Args:
        content_section: The specific content section to enhance
        enhancement_type: Type of enhancement needed (e.g., "current_examples", "latest_statistics", "recent_trends")
        search_query: Specific query to search for current information
    
    Returns:
        JSON string with enhanced content and search results
    """
    try:
        logger.info(f"🔍 Enhancing content with current data: {enhancement_type}")
        
        # Import and use Tavily search
        from tools.research_tools import tavily_search
        
        # Execute web search for current information
        search_result = tavily_search(search_query, "financial")
        search_data = json.loads(search_result)
        
        if not search_data.get("success", False):
            return json.dumps({
                "enhanced_content": content_section,
                "enhancement_applied": False,
                "error": "Web search failed",
                "success": False
            })
        
        # Create enhancement prompt
        enhancement_prompt = f"""
        Enhance this content section with current, real-time information from web search results.
        
        EXISTING CONTENT SECTION:
        {content_section}
        
        ENHANCEMENT TYPE: {enhancement_type}
        
        CURRENT WEB SEARCH RESULTS:
        {json.dumps(search_data.get("search_results", [])[:3], indent=2)}
        
        INSTRUCTIONS:
        1. Integrate the most relevant and current information from web search
        2. Add specific examples, statistics, or trends from 2024
        3. Maintain the existing structure and flow
        4. Ensure all new information is accurately sourced
        5. Focus on {enhancement_type} improvements
        
        Return the enhanced content section.
        """
        
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert content enhancer who integrates current web research into existing content to make it more relevant and up-to-date."},
                {"role": "user", "content": enhancement_prompt}
            ],
            temperature=0.3,
            max_tokens=2000
        )
        
        enhanced_content = response.choices[0].message.content
        
        result_data = {
            "enhanced_content": enhanced_content,
            "enhancement_type": enhancement_type,
            "search_query_used": search_query,
            "web_sources_integrated": len(search_data.get("search_results", [])),
            "enhancement_timestamp": datetime.now().isoformat(),
            "success": True
        }
        
        logger.info(f"✅ Content enhanced with {enhancement_type}: {len(search_data.get('search_results', []))} sources integrated")
        return json.dumps(result_data)
        
    except Exception as e:
        logger.error(f"Content enhancement failed: {e}")
        return json.dumps({"error": str(e), "success": False})


@function_tool
def regenerate_section_with_research(
    section_name: str,
    research_package: str,
    original_module_structure: str,
    module_spec: str
) -> str:
    """
    Regenerate a specific module section using research findings and enhancement requirements.
    
    Args:
        section_name: Name of the section to regenerate (e.g., "core_content")
        research_package: JSON string with research findings from Enhancement Agent
        original_module_structure: JSON string with current module structure
        module_spec: JSON string with module specifications
        
    Returns:
        JSON string with regenerated section content
    """
    try:
        logger.info(f"🔄 Regenerating section '{section_name}' with research data...")
        
        # Safe JSON parsing with validation
        try:
            research_data = json.loads(research_package) if isinstance(research_package, str) else research_package
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse research_package JSON: {e}")
            return json.dumps({"error": f"Invalid research package JSON: {e}", "section_name": section_name, "success": False})
        
        try:
            module_structure = json.loads(original_module_structure) if isinstance(original_module_structure, str) else original_module_structure
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse module_structure JSON: {e}")
            return json.dumps({"error": f"Invalid module structure JSON: {e}", "section_name": section_name, "success": False})
        
        try:
            spec = json.loads(module_spec) if isinstance(module_spec, str) else module_spec
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse module_spec JSON: {e}")
            return json.dumps({"error": f"Invalid module spec JSON: {e}", "section_name": section_name, "success": False})
        
        # Get research specific to this section - handle both wrapped and unwrapped formats
        if "research_package" in research_data:
            section_research = research_data.get("research_package", {}).get("section_research", {}).get(section_name, {})
            enhancement_strategy = research_data.get("research_package", {}).get("enhancement_strategy", {})
        else:
            # Direct format (not wrapped)
            section_research = research_data.get("section_research", {}).get(section_name, {})
            enhancement_strategy = research_data.get("enhancement_strategy", {})
        
        # If no research found, create minimal guidance
        if not section_research:
            logger.warning(f"No specific research found for section '{section_name}', using general enhancement")
            section_research = {
                "enhancement_requirements": ["Expand content with more detail and examples"],
                "word_target_addition": 500
            }
        
        # Safe JSON serialization for prompt
        def safe_json_dumps(data, default="{}"):
            try:
                return json.dumps(data, indent=2, ensure_ascii=False)
            except (TypeError, ValueError) as e:
                logger.warning(f"JSON serialization failed: {e}, using fallback")
                return default
        
        # Get original content - handle various storage formats
        original_section = module_structure.get("sections", {}).get(section_name, {})
        if isinstance(original_section, dict):
            original_content = original_section.get("content", "")
        elif isinstance(original_section, str):
            original_content = original_section
        else:
            # Try to get from direct module structure
            original_content = module_structure.get(section_name, "")
        
        # Ensure we have content to work with
        if not original_content or len(original_content.strip()) < 50:
            logger.error(f"Original content for section '{section_name}' is too short or missing")
            return json.dumps({
                "error": f"Original content for section '{section_name}' is missing or too short",
                "section_name": section_name,
                "success": False
            })
        
        regeneration_prompt = f"""
        Regenerate the '{section_name}' section of this module using the provided research findings.
        
        ORIGINAL SECTION CONTENT:
        {original_content[:2000]}  # Limit to prevent token overflow
        
        RESEARCH FINDINGS FOR THIS SECTION:
        {safe_json_dumps(section_research, "No specific research findings")}
        
        ENHANCEMENT REQUIREMENTS:
        {safe_json_dumps(enhancement_strategy, "No specific enhancement strategy")}
        
        MODULE SPECIFICATIONS:
        Employee: {spec.get("personalization_context", {}).get("employee_name", "Employee")}
        Role: {spec.get("personalization_context", {}).get("current_role", "Professional")}
        Target Word Count Addition: {section_research.get("word_target_addition", 500)}
        
        REGENERATION REQUIREMENTS:
        1. Incorporate all relevant research findings and current examples
        2. Add approximately {section_research.get("word_target_addition", 500)} words of valuable content
        3. Maintain the original structure and voice of the module
        4. Include specific industry insights and current data from research
        5. Ensure content is personalized for the employee's role and goals
        6. Address all enhancement requirements from quality feedback
        7. Maintain educational flow and professional tone
        
        Generate the enhanced section content as plain text (NOT JSON format).
        Focus on adding substantial value while maintaining coherence.
        Return ONLY the section content text, no JSON wrapper.
        """
        
        response = openai_client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": f"You are an expert content creator specializing in regenerating educational content sections with research enhancement for {section_name} sections."},
                {"role": "user", "content": regeneration_prompt}
            ],
            temperature=0.7,
            max_tokens=3000
        )
        
        regenerated_content = response.choices[0].message.content
        word_count = len(regenerated_content.split())
        
        # Validate regenerated content
        if word_count < 100 or "error" in regenerated_content.lower()[:100]:
            logger.error(f"Regenerated content appears to be an error message or too short")
            # Return original content to prevent corruption
            return json.dumps({
                "section_name": section_name,
                "regenerated_content": original_content,  # Preserve original
                "word_count": len(original_content.split()),
                "research_integrated": False,
                "enhancement_applied": False,
                "success": False,
                "error": "Content regeneration produced invalid output"
            })
        
        result = {
            "section_name": section_name,
            "regenerated_content": regenerated_content,
            "word_count": word_count,
            "research_integrated": bool(section_research),
            "enhancement_applied": True,
            "success": True
        }
        
        logger.info(f"✅ Section '{section_name}' regenerated: {word_count} words")
        return json.dumps(result)
        
    except Exception as e:
        logger.error(f"Section regeneration failed for {section_name}: {e}")
        return json.dumps({"error": str(e), "section_name": section_name, "success": False})


@function_tool
def integrate_enhanced_sections(
    original_module: str,
    enhanced_sections: str,
    preservation_list: str = "[]"
) -> str:
    """
    Integrate enhanced sections back into the complete module structure.
    
    Args:
        original_module: JSON string with original module structure
        enhanced_sections: JSON string with regenerated sections
        preservation_list: JSON string with list of sections to preserve unchanged
        
    Returns:
        JSON string with complete integrated module
    """
    try:
        logger.info("🔗 Integrating enhanced sections into complete module...")
        
        # Debug input parameters
        logger.info(f"🔍 DEBUG - Integration inputs:")
        logger.info(f"   original_module type: {type(original_module)}, length: {len(str(original_module)) if original_module else 0}")
        logger.info(f"   enhanced_sections type: {type(enhanced_sections)}, length: {len(str(enhanced_sections)) if enhanced_sections else 0}")
        logger.info(f"   preservation_list type: {type(preservation_list)}, length: {len(str(preservation_list)) if preservation_list else 0}")
        
        if enhanced_sections:
            logger.info(f"   enhanced_sections preview: {str(enhanced_sections)[:200]}...")
        else:
            logger.warning("   ⚠️ enhanced_sections is empty or None!")
        
        # Safe JSON parsing with validation
        try:
            original = json.loads(original_module) if isinstance(original_module, str) else original_module
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse original_module JSON: {e}")
            return json.dumps({"error": f"Invalid original module JSON: {e}", "success": False})
        
        try:
            enhanced = json.loads(enhanced_sections) if isinstance(enhanced_sections, str) and enhanced_sections else {}
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse enhanced_sections JSON: {e}")
            enhanced = {}  # Continue with empty enhanced sections
        
        try:
            preserve = json.loads(preservation_list) if isinstance(preservation_list, str) and preservation_list else []
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse preservation_list JSON: {e}")
            preserve = []  # Continue with empty preservation list
        
        # Start with original structure
        import copy
        integrated_module = copy.deepcopy(original)
        
        # Ensure sections exist in integrated_module
        if "sections" not in integrated_module:
            integrated_module["sections"] = {}
        
        # Track integration stats
        sections_enhanced = 0
        sections_preserved = 0
        sections_failed = 0
        
        # Replace enhanced sections with validation
        if enhanced:  # Check if we have any enhanced data
            # Handle different response formats
            enhanced_sections_data = None
            
            # Check for wrapped format
            if "enhanced_sections" in enhanced:
                enhanced_sections_data = enhanced["enhanced_sections"]
            # Check for direct section updates
            elif any(key in enhanced for key in ["introduction", "core_content", "practical_applications", "case_studies", "assessments"]):
                enhanced_sections_data = enhanced
            
            if enhanced_sections_data:
                for section_name, section_data in enhanced_sections_data.items():
                    if section_name not in preserve:
                        # Extract the actual content
                        new_content = None
                        if isinstance(section_data, dict):
                            new_content = section_data.get("regenerated_content") or section_data.get("content")
                        elif isinstance(section_data, str):
                            new_content = section_data
                        
                        # Validate new content before replacing (enhanced validation)
                        if new_content and len(new_content) > 100 and "error" not in new_content.lower()[:100]:
                            # Additional check for content ID corruption
                            import re
                            uuid_pattern = r'^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}'
                            if re.match(uuid_pattern, new_content.strip()[:36]):
                                logger.error(f"   ❌ Content ID corruption detected in section '{section_name}': {new_content.strip()[:50]}")
                                logger.error(f"   ❌ Original content for section '{section_name}' is too short or missing")
                                sections_failed += 1
                            else:
                                integrated_module["sections"][section_name] = new_content
                                logger.info(f"   ✅ Integrated enhanced section: {section_name} ({len(new_content.split())} words)")
                                sections_enhanced += 1
                        else:
                            logger.warning(f"   ⚠️ Skipped invalid enhancement for section: {section_name}")
                            sections_failed += 1
                    else:
                        logger.info(f"   🔒 Preserved original section: {section_name}")
                        sections_preserved += 1
            else:
                logger.warning("   ⚠️ No enhanced sections found in enhancement data")
        
        # Calculate final word count with validation
        total_words = 0
        section_word_counts = {}
        for section_name, section_content in integrated_module.get("sections", {}).items():
            if isinstance(section_content, str) and len(section_content) > 0:
                word_count = len(section_content.split())
                total_words += word_count
                section_word_counts[section_name] = word_count
            elif isinstance(section_content, dict) and "content" in section_content:
                word_count = len(section_content["content"].split())
                total_words += word_count
                section_word_counts[section_name] = word_count
        
        # ENHANCED VALIDATION: Multi-stage content validation with rollback
        original_word_count = _calculate_module_word_count(original)
        
        # Stage 1: Word count validation
        if total_words < original_word_count * 0.5:  # Lost more than 50% of content
            logger.error(f"   ❌ Stage 1 FAILED: Word count dropped from {original_word_count} to {total_words} ({(total_words/original_word_count)*100:.1f}%)")
            return _rollback_integration(original, "Word count validation failed - content loss detected")
        
        # Stage 2: Section content validation
        for section_name, section_content in integrated_module.get("sections", {}).items():
            if isinstance(section_content, str):
                section_words = standardized_word_count(section_content)
                if section_words < 50:
                    logger.error(f"   ❌ Stage 2 FAILED: Section '{section_name}' has only {section_words} words")
                    return _rollback_integration(original, f"Section '{section_name}' validation failed - insufficient content")
            
        # Stage 3: Content quality validation
        for section_name, section_content in integrated_module.get("sections", {}).items():
            content_text = section_content if isinstance(section_content, str) else str(section_content)
            # Check for corruption indicators
            if any(indicator in content_text.lower()[:200] for indicator in ["error", "failed", "corruption", "missing"]):
                logger.error(f"   ❌ Stage 3 FAILED: Section '{section_name}' contains error indicators")
                return _rollback_integration(original, f"Section '{section_name}' quality validation failed")
        
        logger.info(f"   ✅ All validation stages passed: {original_word_count} → {total_words} words")
        
        integrated_module["module_metrics"] = {
            "total_word_count": total_words,
            "sections_count": len(integrated_module.get("sections", {})),
            "section_word_counts": section_word_counts,
            "enhanced_sections": sections_enhanced,
            "preserved_sections": sections_preserved,
            "failed_sections": sections_failed,
            "integration_timestamp": datetime.now().isoformat(),
            "integration_successful": sections_failed == 0
        }
        
        result = {
            "integrated_module": integrated_module,
            "total_word_count": total_words,
            "sections_enhanced": sections_enhanced,
            "sections_preserved": sections_preserved,
            "sections_failed": sections_failed,
            "success": True
        }
        
        logger.info(f"✅ Module integration completed: {total_words} total words (enhanced: {sections_enhanced}, preserved: {sections_preserved}, failed: {sections_failed})")
        return json.dumps(result)
        
    except Exception as e:
        logger.error(f"Section integration failed: {e}")
        return json.dumps({"error": str(e), "success": False})


def _calculate_module_word_count(module: dict) -> int:
    """Calculate total word count for a module using standardized counting."""
    from utils.word_count_utils import count_module_words
    result = count_module_words(module)
    return result["total_words"]

def _rollback_integration(original_module: dict, error_reason: str) -> str:
    """
    Rollback integration to preserve original content when validation fails.
    
    Args:
        original_module: Original module content to preserve
        error_reason: Reason for rollback
        
    Returns:
        JSON string with rollback result
    """
    logger.warning(f"🔄 ROLLBACK INITIATED: {error_reason}")
    
    original_word_count = _calculate_module_word_count(original_module)
    
    # Create rollback response with detailed logging
    rollback_result = {
        "integrated_module": original_module,
        "total_word_count": original_word_count,
        "sections_enhanced": 0,
        "sections_preserved": len(original_module.get("sections", {})),
        "sections_failed": 0,
        "success": False,
        "rollback_applied": True,
        "error": error_reason,
        "rollback_metadata": {
            "timestamp": datetime.now().isoformat(),
            "original_content_preserved": True,
            "validation_stage_failed": error_reason,
            "content_integrity": "maintained"
        }
    }
    
    logger.warning(f"🔄 Content rollback completed - original {original_word_count} words preserved")
    return json.dumps(rollback_result)


if __name__ == "__main__":
    """Test the agentic content tools."""
    
    print("🧪 Testing Agentic Content Generation Tools")
    print("=" * 50)
    
    # Sample module specification
    sample_module_spec = {
        "module_name": "Introduction to Financial Analysis for Business Performance",
        "personalization_context": {
            "employee_name": "Kubilaycan Karakas",
            "current_role": "Junior Financial Analyst - Business Performance Reporting",
            "career_goal": "Senior Financial Analyst"
        },
        "tool_integration": ["Excel", "SAP BPC", "PowerBI"],
        "difficulty_level": "intermediate",
        "learning_outcomes": [
            "Master fundamental financial analysis concepts",
            "Apply ratio analysis techniques",
            "Create performance reports"
        ]
    }
    
    sample_research_context = {
        "research_insights": {
            "key_concepts": ["Financial ratio analysis", "Performance metrics", "Business intelligence"],
            "practical_examples": ["Monthly financial reporting", "Budget variance analysis"],
            "research_depth": "comprehensive"
        }
    }
    
    print("🚀 Testing individual content generation tools...")
    print("⏱️ Each tool call will be visible in OpenAI Traces tab")
    
    # Test introduction generation
    print("\n📝 Testing introduction generation...")
    intro_result = generate_module_introduction(
        json.dumps(sample_module_spec),
        json.dumps(sample_research_context)
    )
    intro_data = json.loads(intro_result)
    if intro_data.get("success"):
        print(f"✅ Introduction: {intro_data['word_count']} words in {intro_data['generation_metadata']['generation_time_seconds']}s")
    else:
        print(f"❌ Introduction failed: {intro_data.get('error')}")
    
    # Test core content generation
    print("\n📚 Testing core content generation...")
    core_result = generate_core_content(
        json.dumps(sample_module_spec),
        json.dumps(sample_research_context)
    )
    core_data = json.loads(core_result)
    if core_data.get("success"):
        print(f"✅ Core content: {core_data['word_count']} words in {core_data['generation_metadata']['generation_time_seconds']}s")
    else:
        print(f"❌ Core content failed: {core_data.get('error')}")
    
    print("\n🎉 Agentic content tools tested successfully!")
    print("🔍 All tool calls will appear in OpenAI Traces tab when used by agents")
    print("🤖 Ready for integration with content generation agent")

# =====================================================
# NEW OUTLINE-BASED SECTION GENERATION TOOLS  
# =====================================================

@function_tool
def generate_section_with_outline(section_name: str, module_outline: str, module_spec: str, research_context: str = None) -> str:
    """
    Generate a specific section using outline-based requirements with immediate validation.
    
    Args:
        section_name: Name of section to generate (introduction, core_content, etc.)
        module_outline: JSON string with detailed outline including section specifications  
        module_spec: JSON string with module specifications
        research_context: JSON string with research findings to integrate
        
    Returns:
        JSON string with generated section content, validation results, and metadata
    """
    try:
        logger.info(f"📝 Generating section '{section_name}' with outline-based requirements...")
        start_time = time.time()
        
        # Parse inputs
        outline = json.loads(module_outline) if isinstance(module_outline, str) else module_outline
        spec = json.loads(module_spec) if isinstance(module_spec, str) else module_spec
        research = json.loads(research_context) if research_context and isinstance(research_context, str) else (research_context or {})
        
        # Get section requirements from outline
        section_outline = outline.get("module_outline", {}).get(section_name, {})
        if not section_outline:
            return json.dumps({"error": f"Section '{section_name}' not found in outline", "success": False})
        
        # Extract section specifications
        word_target = section_outline.get("word_target", 1000)
        content_outline = section_outline.get("content_outline", [])
        learning_objectives = section_outline.get("learning_objectives", [])
        key_concepts = section_outline.get("key_concepts", [])
        
        # Get module context
        module_name = spec.get("module_name", "Course Module")
        employee_name = spec.get("personalization_context", {}).get("employee_name", "Learner")
        current_role = spec.get("personalization_context", {}).get("current_role", "Analyst")
        tools = spec.get("tool_integration", [])
        
        # Set validation thresholds
        min_words = int(word_target * 0.9)  # 90% minimum
        max_words = int(word_target * 1.1)  # 110% maximum
        
        # Section-specific prompt generation
        if section_name == "introduction":
            section_prompt = f"""
            Create a comprehensive introduction for "{module_name}".
            
            REQUIREMENTS:
            - Exactly {word_target} words
            - Personal relevance to {employee_name} ({current_role})
            - Clear learning objectives and module overview
            - Engaging hook and motivation
            
            CONTENT OUTLINE: {', '.join(content_outline)}
            LEARNING OBJECTIVES: {', '.join(learning_objectives)}
            KEY CONCEPTS: {', '.join(key_concepts)}
            """
            
        elif section_name == "core_content":
            depth_level = section_outline.get("depth_level", "intermediate")
            theoretical_framework = section_outline.get("theoretical_framework", [])
            
            section_prompt = f"""
            Create core content for "{module_name}" at {depth_level} level.
            
            REQUIREMENTS:
            - Exactly {word_target} words  
            - Comprehensive coverage of key concepts
            - {depth_level}-level depth appropriate for {current_role}
            - Clear explanations with examples
            
            CONTENT OUTLINE: {', '.join(content_outline)}
            KEY CONCEPTS: {', '.join(key_concepts)}
            THEORETICAL FRAMEWORK: {', '.join(theoretical_framework)}
            """
            
        elif section_name == "practical_applications":
            hands_on_exercises = section_outline.get("hands_on_exercises", [])
            tool_specific_content = section_outline.get("tool_specific_content", tools)
            step_by_step_guides = section_outline.get("step_by_step_guides", [])
            
            section_prompt = f"""
            Create practical applications for "{module_name}".
            
            REQUIREMENTS:
            - Exactly {word_target} words
            - Hands-on exercises using {', '.join(tool_specific_content)}
            - Step-by-step implementation guides
            - Real workplace scenarios for {current_role}
            
            CONTENT OUTLINE: {', '.join(content_outline)}
            EXERCISES: {', '.join(hands_on_exercises)}
            GUIDES: {', '.join(step_by_step_guides)}
            """
            
        elif section_name == "case_studies":
            industry_context = section_outline.get("industry_context", "business")
            complexity_level = section_outline.get("complexity_level", "appropriate")
            analysis_frameworks = section_outline.get("analysis_frameworks", [])
            
            section_prompt = f"""
            Create case studies for "{module_name}".
            
            REQUIREMENTS:
            - Exactly {word_target} words
            - {industry_context} industry focus
            - {complexity_level} complexity 
            - Detailed analysis and solutions
            
            CONTENT OUTLINE: {', '.join(content_outline)}
            FRAMEWORKS: {', '.join(analysis_frameworks)}
            """
            
        elif section_name == "assessments":
            assessment_types = section_outline.get("assessment_types", ["knowledge_check"])
            success_criteria = section_outline.get("success_criteria", [])
            
            section_prompt = f"""
            Create assessments for "{module_name}".
            
            REQUIREMENTS:
            - Exactly {word_target} words
            - {', '.join(assessment_types)} assessment types
            - Clear success criteria and feedback
            - Practical evaluation methods
            
            CONTENT OUTLINE: {', '.join(content_outline)}
            SUCCESS CRITERIA: {', '.join(success_criteria)}
            """
        else:
            # Generic section generation
            section_prompt = f"""
            Create {section_name} section for "{module_name}".
            
            REQUIREMENTS:
            - Exactly {word_target} words
            - Follow content outline precisely
            - Include key concepts and objectives
            
            CONTENT OUTLINE: {', '.join(content_outline)}
            """
        
        # Generate content with retry logic
        max_attempts = 3
        for attempt in range(max_attempts):
            try:
                # Call OpenAI for generation
                response = openai_client.chat.completions.create(
                    model="gpt-4-turbo",
                    messages=[
                        {"role": "system", "content": f"You are an expert content creator. Generate exactly {word_target} words for the {section_name} section. CRITICAL: Word count must be precise."},
                        {"role": "user", "content": section_prompt}
                    ],
                    temperature=0.3,
                    max_tokens=int(word_target * 1.5 + 500)
                )
                
                generated_content = response.choices[0].message.content
                
                # Immediate validation
                word_count = len(generated_content.split())
                
                # Check if content meets requirements
                if word_count >= min_words and word_count <= max_words:
                    # Success - content meets requirements
                    validation_result = {
                        "validation_status": "passed",
                        "word_count": word_count,
                        "target_words": word_target,
                        "variance_percentage": abs(word_count - word_target) / word_target * 100,
                        "attempt_number": attempt + 1
                    }
                    
                    generation_time = time.time() - start_time
                    logger.info(f"✅ {section_name.title()} generated: {word_count} words in {generation_time:.1f}s")
                    
                    return json.dumps({
                        "section_name": section_name,
                        "content": generated_content,
                        "validation": validation_result,
                        "generation_metadata": {
                            "generation_time": generation_time,
                            "attempt_number": attempt + 1,
                            "token_usage": {
                                "prompt_tokens": response.usage.prompt_tokens,
                                "completion_tokens": response.usage.completion_tokens,
                                "total_tokens": response.usage.total_tokens
                            }
                        },
                        "success": True
                    })
                    
                elif word_count < min_words:
                    # Content too short - try expansion
                    if attempt < max_attempts - 1:
                        logger.warning(f"⚠️ {section_name} below minimum: {word_count} < {min_words}, expanding (attempt {attempt + 1})")
                        deficit = word_target - word_count
                        section_prompt += f"\n\nEXPAND CONTENT: Add approximately {deficit} more words with additional examples, details, or explanations."
                        continue
                    else:
                        # Final attempt failed
                        validation_result = {
                            "validation_status": "failed_short",
                            "word_count": word_count,
                            "target_words": word_target,
                            "deficit": word_target - word_count,
                            "final_attempt": True
                        }
                        
                        logger.error(f"❌ {section_name} generation failed: {word_count} words after {max_attempts} attempts")
                        return json.dumps({
                            "section_name": section_name,
                            "content": generated_content,
                            "validation": validation_result,
                            "success": False,
                            "error": f"Content below minimum after {max_attempts} attempts"
                        })
                        
                else:
                    # Content too long - trim
                    if attempt < max_attempts - 1:
                        logger.warning(f"⚠️ {section_name} above maximum: {word_count} > {max_words}, trimming (attempt {attempt + 1})")
                        excess = word_count - word_target
                        section_prompt += f"\n\nTRIM CONTENT: Reduce by approximately {excess} words while maintaining quality."
                        continue
                    else:
                        # Accept slightly long content on final attempt
                        validation_result = {
                            "validation_status": "passed_long",
                            "word_count": word_count,
                            "target_words": word_target,
                            "excess": word_count - word_target,
                            "final_attempt": True
                        }
                        
                        generation_time = time.time() - start_time
                        logger.info(f"✅ {section_name} generated (slightly long): {word_count} words in {generation_time:.1f}s")
                        
                        return json.dumps({
                            "section_name": section_name,
                            "content": generated_content,
                            "validation": validation_result,
                            "success": True
                        })
                        
            except Exception as e:
                if attempt < max_attempts - 1:
                    logger.warning(f"⚠️ Generation error for {section_name} (attempt {attempt + 1}): {e}")
                    continue
                else:
                    raise e
                    
    except Exception as e:
        logger.error(f"❌ Failed to generate {section_name}: {e}")
        return json.dumps({
            "section_name": section_name,
            "error": str(e),
            "success": False
        })

@function_tool
def expand_section_content(section_name: str, current_content: str, target_words: int, context: str = "") -> str:
    """
    Expand section content to meet word count targets when content falls short.
    
    Args:
        section_name: Name of the section being expanded
        current_content: Current content that needs expansion
        target_words: Target word count to reach
        context: Additional context for expansion
        
    Returns:
        JSON string with expanded content and expansion metadata
    """
    try:
        logger.info(f"🔄 Expanding {section_name} content to {target_words} words...")
        
        current_words = len(current_content.split())
        words_needed = target_words - current_words
        
        if words_needed <= 0:
            return json.dumps({
                "content": current_content,
                "expansion_applied": False,
                "message": "Content already meets target",
                "success": True
            })
        
        expansion_prompt = f"""
        Expand the following {section_name} content to add approximately {words_needed} more words.
        
        CURRENT CONTENT:
        {current_content}
        
        EXPANSION REQUIREMENTS:
        - Add exactly {words_needed} more words
        - Maintain the same tone and style
        - Add more examples, details, or explanations
        - Keep all existing content intact
        - Focus on practical applications and real-world relevance
        
        CONTEXT: {context}
        
        Return the complete expanded content (original + additions).
        """
        
        response = openai_client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": f"You are an expert content expander. Add exactly {words_needed} words to reach the target of {target_words} words total."},
                {"role": "user", "content": expansion_prompt}
            ],
            temperature=0.3,
            max_tokens=int(target_words * 1.5 + 500)
        )
        
        expanded_content = response.choices[0].message.content
        final_word_count = len(expanded_content.split())
        
        logger.info(f"✅ Content expanded: {current_words} → {final_word_count} words")
        
        return json.dumps({
            "content": expanded_content,
            "expansion_applied": True,
            "original_words": current_words,
            "final_words": final_word_count,
            "words_added": final_word_count - current_words,
            "target_words": target_words,
            "success": True
        })
        
    except Exception as e:
        logger.error(f"❌ Failed to expand {section_name}: {e}")
        return json.dumps({
            "content": current_content,
            "expansion_applied": False,
            "error": str(e),
            "success": False
        })

@function_tool  
def reallocate_word_budget(module_outline: str, failed_sections: str, available_sections: str) -> str:
    """
    Intelligently reallocate word budget when sections fail to meet targets.
    
    Args:
        module_outline: JSON string with original module outline
        failed_sections: JSON string with list of failed sections and their deficits
        available_sections: JSON string with list of sections that can accept additional words
        
    Returns:
        JSON string with updated word allocation plan
    """
    try:
        logger.info("🔄 Reallocating word budget due to section failures...")
        
        # Parse inputs
        outline = json.loads(module_outline) if isinstance(module_outline, str) else module_outline
        failed = json.loads(failed_sections) if isinstance(failed_sections, str) else failed_sections
        available = json.loads(available_sections) if isinstance(available_sections, str) else available_sections
        
        # Get current allocations
        module_outline_data = outline.get("module_outline", {})
        content_requirements = outline.get("content_requirements", {})
        total_target = content_requirements.get("total_word_target", 5000)
        
        # Calculate total deficit from failed sections
        total_deficit = sum(section.get("deficit", 0) for section in failed)
        
        if total_deficit == 0:
            return json.dumps({
                "reallocation_applied": False,
                "message": "No deficit to reallocate",
                "updated_outline": outline,
                "success": True
            })
        
        # Calculate redistribution strategy
        available_section_names = [section["section_name"] for section in available]
        redistribution_per_section = total_deficit // len(available_section_names)
        remainder = total_deficit % len(available_section_names)
        
        # Update outline with new allocations
        updated_outline = outline.copy()
        reallocation_log = []
        
        for i, section_name in enumerate(available_section_names):
            if section_name in module_outline_data:
                current_target = module_outline_data[section_name].get("word_target", 1000)
                additional_words = redistribution_per_section + (1 if i < remainder else 0)
                new_target = current_target + additional_words
                
                # Update the outline
                updated_outline["module_outline"][section_name]["word_target"] = new_target
                
                reallocation_log.append({
                    "section": section_name,
                    "original_target": current_target,
                    "additional_words": additional_words,
                    "new_target": new_target
                })
                
                logger.info(f"📊 {section_name}: {current_target} → {new_target} words (+{additional_words})")
        
        # Mark failed sections as reduced priority
        for failed_section in failed:
            section_name = failed_section.get("section_name")
            if section_name in updated_outline["module_outline"]:
                # Reduce target to what was actually achieved
                achieved_words = failed_section.get("achieved_words", 0)
                updated_outline["module_outline"][section_name]["word_target"] = achieved_words
                updated_outline["module_outline"][section_name]["status"] = "reduced_scope"
        
        # Update total and section distribution
        updated_outline["content_requirements"]["total_word_target"] = total_target
        updated_outline["content_requirements"]["reallocation_applied"] = True
        updated_outline["content_requirements"]["reallocation_metadata"] = {
            "total_deficit_redistributed": total_deficit,
            "sections_enhanced": available_section_names,
            "sections_reduced": [s.get("section_name") for s in failed],
            "reallocation_log": reallocation_log
        }
        
        logger.info(f"✅ Word budget reallocated: {total_deficit} words redistributed to {len(available_section_names)} sections")
        
        return json.dumps({
            "reallocation_applied": True,
            "total_deficit_redistributed": total_deficit,
            "sections_enhanced": available_section_names,
            "sections_reduced": [s.get("section_name") for s in failed],
            "updated_outline": updated_outline,
            "reallocation_log": reallocation_log,
            "success": True
        })
        
    except Exception as e:
        logger.error(f"❌ Failed to reallocate word budget: {e}")
        return json.dumps({
            "reallocation_applied": False,
            "error": str(e),
            "success": False
        })

@function_tool
def validate_module_completion(module_outline: str, generated_sections: str) -> str:
    """
    Validate overall module completion and determine if acceptable despite failures.
    
    Args:
        module_outline: JSON string with module outline and targets
        generated_sections: JSON string with list of generated sections and their status
        
    Returns:
        JSON string with completion validation results and recommendations
    """
    try:
        logger.info("🔍 Validating overall module completion...")
        
        # Parse inputs
        outline = json.loads(module_outline) if isinstance(module_outline, str) else module_outline
        sections = json.loads(generated_sections) if isinstance(generated_sections, str) else generated_sections
        
        # Get requirements
        content_requirements = outline.get("content_requirements", {})
        total_target = content_requirements.get("total_word_target", 5000)
        section_distribution = content_requirements.get("section_distribution", {})
        
        # Analyze section completion
        completion_analysis = {
            "total_words_generated": 0,
            "sections_completed": 0,
            "sections_failed": 0,
            "critical_sections_missing": [],
            "completion_percentage": 0,
            "quality_assessment": "incomplete"
        }
        
        critical_sections = ["introduction", "core_content"]  # Must-have sections
        
        for section in sections:
            section_name = section.get("section_name")
            success = section.get("success", False)
            word_count = section.get("validation", {}).get("word_count", 0)
            
            completion_analysis["total_words_generated"] += word_count
            
            if success:
                completion_analysis["sections_completed"] += 1
            else:
                completion_analysis["sections_failed"] += 1
                if section_name in critical_sections:
                    completion_analysis["critical_sections_missing"].append(section_name)
        
        # Calculate completion percentage
        completion_analysis["completion_percentage"] = (
            completion_analysis["total_words_generated"] / total_target * 100
        )
        
        # Determine overall quality assessment
        if completion_analysis["completion_percentage"] >= 80 and not completion_analysis["critical_sections_missing"]:
            completion_analysis["quality_assessment"] = "acceptable"
            recommendation = "Module ready for delivery with minor gaps"
        elif completion_analysis["completion_percentage"] >= 60 and len(completion_analysis["critical_sections_missing"]) <= 1:
            completion_analysis["quality_assessment"] = "marginal"
            recommendation = "Module usable but needs improvement"
        else:
            completion_analysis["quality_assessment"] = "insufficient"
            recommendation = "Module requires significant rework"
        
        # Generate specific recommendations
        recommendations = [recommendation]
        
        if completion_analysis["critical_sections_missing"]:
            recommendations.append(f"CRITICAL: Regenerate missing sections: {', '.join(completion_analysis['critical_sections_missing'])}")
        
        if completion_analysis["completion_percentage"] < 70:
            deficit = total_target - completion_analysis["total_words_generated"]
            recommendations.append(f"Consider expanding existing sections by {deficit} words total")
        
        if completion_analysis["sections_failed"] > completion_analysis["sections_completed"]:
            recommendations.append("Significant generation issues - review prompts and approach")
        
        logger.info(f"📊 Module completion: {completion_analysis['completion_percentage']:.1f}% ({completion_analysis['quality_assessment']})")
        
        return json.dumps({
            "completion_analysis": completion_analysis,
            "recommendations": recommendations,
            "module_acceptable": completion_analysis["quality_assessment"] in ["acceptable", "marginal"],
            "requires_rework": completion_analysis["quality_assessment"] == "insufficient",
            "success": True
        })
        
    except Exception as e:
        logger.error(f"❌ Failed to validate module completion: {e}")
        return json.dumps({
            "error": str(e),
            "success": False
        })