#!/usr/bin/env python3
"""
Enhancement Tools for Content Improvement

These tools are specifically designed for the Enhancement Agent to improve
existing content based on quality feedback.
"""

import json
import logging
from typing import Dict, Any
from datetime import datetime
from lxera_agents import function_tool
from openai import OpenAI

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# OpenAI client
# Import settings
from config.settings import get_settings
settings = get_settings()
OPENAI_API_KEY = settings.openai_api_key
openai_client = OpenAI(api_key=OPENAI_API_KEY)


@function_tool
def section_quality_analyzer(module_content: str, quality_feedback: str) -> str:
    """
    Analyze which sections of the module need the most enhancement.
    
    Args:
        module_content: The current module content with sections
        quality_feedback: The quality assessment feedback
        
    Returns:
        JSON string with section-by-section analysis and priorities
    """
    try:
        logger.info("🔍 Analyzing sections for quality improvement needs...")
        
        analysis_prompt = f"""
        Analyze this module content to identify which sections need enhancement based on quality feedback.
        
        MODULE CONTENT:
        {module_content[:8000]}  # Limit for context
        
        QUALITY FEEDBACK:
        {quality_feedback}
        
        Provide a detailed analysis in JSON format:
        {{
            "section_analysis": {{
                "introduction": {{
                    "current_word_count": <number>,
                    "quality_issues": ["list of specific issues"],
                    "enhancement_priority": "high|medium|low",
                    "suggested_additions": ["specific suggestions"]
                }},
                "core_content": {{...}},
                "practical_applications": {{...}},
                "case_studies": {{...}},
                "assessments": {{...}}
            }},
            "overall_recommendations": ["prioritized list of enhancements"],
            "word_count_strategy": "how to distribute additional words"
        }}
        """
        
        response = openai_client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "You are an expert content analyzer specializing in educational content quality assessment."},
                {"role": "user", "content": analysis_prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        analysis = json.loads(response.choices[0].message.content)
        
        result = {
            "analysis": analysis,
            "timestamp": datetime.now().isoformat(),
            "success": True
        }
        
        logger.info("✅ Section analysis completed")
        return json.dumps(result)
        
    except Exception as e:
        logger.error(f"Section analysis failed: {e}")
        return json.dumps({"error": str(e), "success": False})


@function_tool
def targeted_content_expansion(
    section_content: str, 
    section_name: str, 
    target_word_increase: int,
    expansion_focus: str
) -> str:
    """
    Expand a specific section with targeted content based on quality needs.
    
    Args:
        section_content: Current content of the section
        section_name: Name of the section (e.g., "core_content")
        target_word_increase: How many words to add
        expansion_focus: What to focus on (e.g., "examples", "depth", "clarity")
        
    Returns:
        JSON string with expanded section content
    """
    try:
        logger.info(f"📈 Expanding {section_name} by {target_word_increase} words...")
        
        expansion_prompt = f"""
        Expand this section by approximately {target_word_increase} words while maintaining quality and coherence.
        
        SECTION: {section_name}
        CURRENT CONTENT:
        {section_content}
        
        EXPANSION FOCUS: {expansion_focus}
        
        REQUIREMENTS:
        1. Add approximately {target_word_increase} words of valuable content
        2. Maintain the original structure and voice
        3. Focus on {expansion_focus}
        4. Ensure smooth integration with existing content
        5. Add specific examples, explanations, or details as appropriate
        6. Keep content relevant to business performance reporting role
        
        Provide the expanded section content.
        """
        
        response = openai_client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "You are an expert content enhancer who expands educational content while maintaining quality."},
                {"role": "user", "content": expansion_prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        expanded_content = response.choices[0].message.content
        original_words = len(section_content.split())
        new_words = len(expanded_content.split())
        
        result = {
            "section_name": section_name,
            "expanded_content": expanded_content,
            "original_word_count": original_words,
            "new_word_count": new_words,
            "words_added": new_words - original_words,
            "expansion_focus": expansion_focus,
            "success": True
        }
        
        logger.info(f"✅ Section expanded: {original_words} → {new_words} words (+{new_words - original_words})")
        return json.dumps(result)
        
    except Exception as e:
        logger.error(f"Content expansion failed: {e}")
        return json.dumps({"error": str(e), "success": False})


@function_tool
def web_research_enhancement(topic: str, enhancement_type: str, current_context: str) -> str:
    """
    Perform targeted web research to find content for enhancement.
    
    Args:
        topic: Specific topic to research
        enhancement_type: Type of enhancement needed (examples, trends, statistics)
        current_context: Current content context to ensure relevance
        
    Returns:
        JSON string with research findings formatted for integration
    """
    try:
        logger.info(f"🔍 Researching {enhancement_type} for topic: {topic}")
        
        # Use Tavily API directly
        from tavily import TavilyClient
        
        # Initialize Tavily client
        # Import settings for API key
        from config.settings import get_settings
        settings = get_settings()
        tavily_api_key = settings.tavily_api_key
        tavily_client = TavilyClient(api_key=tavily_api_key)
        
        # Craft specific search query based on enhancement type
        if enhancement_type == "examples":
            query = f"{topic} real world examples 2024 business case studies"
        elif enhancement_type == "trends":
            query = f"{topic} latest trends 2024 industry insights"
        elif enhancement_type == "statistics":
            query = f"{topic} statistics data 2024 research findings"
        else:
            query = f"{topic} {enhancement_type} 2024"
        
        # Perform search
        search_params = {
            "query": query,
            "search_depth": "basic",
            "max_results": 3,
            "include_images": False,
            "include_answer": True,
            "include_raw_content": False
        }
        
        tavily_results = tavily_client.search(**search_params)
        
        # Format results
        search_data = {
            "search_results": tavily_results.get("results", []),
            "answer": tavily_results.get("answer", ""),
            "success": True
        }
        
        if search_data.get("success") and search_data.get("search_results"):
            # Process results for enhancement
            enhancement_data = {
                "topic": topic,
                "enhancement_type": enhancement_type,
                "findings": [],
                "key_insights": []
            }
            
            for result in search_data["search_results"][:3]:
                enhancement_data["findings"].append({
                    "source": result.get("url", ""),
                    "title": result.get("title", ""),
                    "content": result.get("content", "")[:500],
                    "relevance": "high" if topic.lower() in result.get("content", "").lower() else "medium"
                })
            
            # Extract key insights
            if search_data.get("answer"):
                enhancement_data["key_insights"].append(search_data["answer"])
            
            result = {
                "research_data": enhancement_data,
                "query_used": query,
                "success": True
            }
        else:
            result = {
                "research_data": {},
                "query_used": query,
                "success": False,
                "message": "No relevant research findings"
            }
        
        logger.info(f"✅ Web research completed: {len(result.get('research_data', {}).get('findings', []))} findings")
        return json.dumps(result)
        
    except Exception as e:
        logger.error(f"Web research enhancement failed: {e}")
        return json.dumps({"error": str(e), "success": False})


@function_tool
def expand_section_with_examples(
    section_content: str,
    section_name: str,
    example_type: str,
    web_research_data: str = "{}"
) -> str:
    """
    Expand a section by adding relevant examples based on web research.
    
    Args:
        section_content: Current section content
        section_name: Name of the section
        example_type: Type of examples needed (practical, industry, tool-specific)
        web_research_data: JSON string with web research findings
        
    Returns:
        JSON string with section expanded with examples
    """
    try:
        logger.info(f"📚 Adding {example_type} examples to {section_name}")
        
        research_data = json.loads(web_research_data) if web_research_data else {}
        
        expansion_prompt = f"""
        Enhance this section by adding relevant {example_type} examples.
        
        CURRENT SECTION CONTENT:
        {section_content}
        
        WEB RESEARCH FINDINGS:
        {json.dumps(research_data.get('research_data', {}), indent=2)}
        
        REQUIREMENTS:
        1. Add 2-3 concrete, relevant examples
        2. Each example should be detailed and practical
        3. Include specific scenarios relevant to business performance reporting
        4. If web research provided current examples, integrate them
        5. Make examples specific to tools like Excel, SAP BPC, or PowerBI
        6. Ensure examples flow naturally with existing content
        
        Provide the enhanced section with integrated examples.
        """
        
        response = openai_client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "You are an expert at creating practical, relevant examples for educational content."},
                {"role": "user", "content": expansion_prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        enhanced_content = response.choices[0].message.content
        
        result = {
            "section_name": section_name,
            "enhanced_content": enhanced_content,
            "examples_added": True,
            "example_type": example_type,
            "web_research_integrated": bool(research_data),
            "word_count": len(enhanced_content.split()),
            "success": True
        }
        
        logger.info(f"✅ Examples added to {section_name}")
        return json.dumps(result)
        
    except Exception as e:
        logger.error(f"Example expansion failed: {e}")
        return json.dumps({"error": str(e), "success": False})


@function_tool
def add_current_industry_insights(
    section_content: str,
    industry_focus: str,
    web_research_data: str = "{}"
) -> str:
    """
    Add current industry insights and trends to make content more relevant.
    
    Args:
        section_content: Current section content
        industry_focus: Specific industry area (e.g., "financial forecasting")
        web_research_data: JSON string with current industry research
        
    Returns:
        JSON string with content enhanced with industry insights
    """
    try:
        logger.info(f"💡 Adding current industry insights for {industry_focus}")
        
        research_data = json.loads(web_research_data) if web_research_data else {}
        
        enhancement_prompt = f"""
        Enhance this content with current industry insights and trends for {industry_focus}.
        
        CURRENT CONTENT:
        {section_content}
        
        CURRENT RESEARCH DATA:
        {json.dumps(research_data.get('research_data', {}), indent=2)}
        
        ADD:
        1. Latest industry trends (2024/2025)
        2. Current best practices
        3. Emerging technologies or methodologies
        4. Industry challenges and solutions
        5. Future outlook or predictions
        
        Ensure insights are:
        - Specific to business performance reporting
        - Based on current data from research
        - Practical and actionable
        - Seamlessly integrated into existing content
        
        Provide the enhanced content with industry insights.
        """
        
        response = openai_client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "You are an industry expert who stays current with latest trends and best practices."},
                {"role": "user", "content": enhancement_prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        enhanced_content = response.choices[0].message.content
        
        result = {
            "enhanced_content": enhanced_content,
            "industry_focus": industry_focus,
            "insights_added": True,
            "word_count": len(enhanced_content.split()),
            "success": True
        }
        
        logger.info(f"✅ Industry insights added for {industry_focus}")
        return json.dumps(result)
        
    except Exception as e:
        logger.error(f"Industry insights enhancement failed: {e}")
        return json.dumps({"error": str(e), "success": False})


@function_tool
def deepen_technical_explanations(
    section_content: str,
    technical_concepts: str,
    depth_level: str = "intermediate"
) -> str:
    """
    Deepen technical explanations to improve content quality and understanding.
    
    Args:
        section_content: Current section content
        technical_concepts: Comma-separated list of concepts to expand
        depth_level: Level of depth needed (basic, intermediate, advanced)
        
    Returns:
        JSON string with deepened technical content
    """
    try:
        logger.info(f"🔬 Deepening technical explanations for: {technical_concepts}")
        
        enhancement_prompt = f"""
        Deepen the technical explanations in this content at {depth_level} level.
        
        CURRENT CONTENT:
        {section_content}
        
        TECHNICAL CONCEPTS TO EXPAND:
        {technical_concepts}
        
        ENHANCEMENTS NEEDED:
        1. Add more detailed explanations of how things work
        2. Include step-by-step processes where appropriate
        3. Explain the "why" behind concepts, not just the "what"
        4. Add technical details appropriate for {depth_level} level
        5. Include formulas, calculations, or algorithms if relevant
        6. Connect concepts to practical applications
        
        Maintain clarity while adding depth. The audience is a Junior Financial Analyst.
        
        Provide the enhanced content with deeper technical explanations.
        """
        
        response = openai_client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "You are a technical education expert who can explain complex concepts clearly."},
                {"role": "user", "content": enhancement_prompt}
            ],
            temperature=0.6,
            max_tokens=2000
        )
        
        enhanced_content = response.choices[0].message.content
        
        result = {
            "enhanced_content": enhanced_content,
            "concepts_deepened": technical_concepts.split(","),
            "depth_level": depth_level,
            "word_count": len(enhanced_content.split()),
            "success": True
        }
        
        logger.info(f"✅ Technical explanations deepened")
        return json.dumps(result)
        
    except Exception as e:
        logger.error(f"Technical deepening failed: {e}")
        return json.dumps({"error": str(e), "success": False})


@function_tool
def create_additional_exercises(
    current_exercises: str,
    learning_objectives: str,
    exercise_types: str = "practical,conceptual"
) -> str:
    """
    Create additional exercises to expand the assessment section.
    
    Args:
        current_exercises: Current exercise content
        learning_objectives: Learning objectives to assess
        exercise_types: Types of exercises to create
        
    Returns:
        JSON string with additional exercises
    """
    try:
        logger.info(f"✏️ Creating additional {exercise_types} exercises")
        
        creation_prompt = f"""
        Create additional exercises to supplement the current assessment materials.
        
        CURRENT EXERCISES:
        {current_exercises}
        
        LEARNING OBJECTIVES TO ASSESS:
        {learning_objectives}
        
        CREATE:
        1. 3-4 additional exercises of type: {exercise_types}
        2. Include clear instructions and expected outcomes
        3. Vary difficulty levels
        4. Make exercises specific to business performance reporting
        5. Include Excel, SAP BPC, or PowerBI tasks where relevant
        6. Provide solution hints or guidelines
        
        Format each exercise clearly with:
        - Exercise title
        - Objective
        - Instructions
        - Expected outcome
        - Difficulty level
        - Estimated time
        
        Provide the additional exercises.
        """
        
        response = openai_client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "You are an expert in creating educational assessments and practical exercises."},
                {"role": "user", "content": creation_prompt}
            ],
            temperature=0.7,
            max_tokens=1500
        )
        
        additional_exercises = response.choices[0].message.content
        
        result = {
            "additional_exercises": additional_exercises,
            "exercise_types": exercise_types.split(","),
            "word_count": len(additional_exercises.split()),
            "success": True
        }
        
        logger.info(f"✅ Additional exercises created")
        return json.dumps(result)
        
    except Exception as e:
        logger.error(f"Exercise creation failed: {e}")
        return json.dumps({"error": str(e), "success": False})


@function_tool
def content_integration(
    original_content: str,
    enhancements: str,
    integration_strategy: str = "seamless"
) -> str:
    """
    Integrate enhancements into original content seamlessly.
    
    Args:
        original_content: The original module content
        enhancements: JSON string with all enhancements to integrate
        integration_strategy: How to integrate (seamless, marked, structured)
        
    Returns:
        JSON string with fully integrated content
    """
    try:
        logger.info(f"🔗 Integrating enhancements using {integration_strategy} strategy")
        
        enhancements_data = json.loads(enhancements) if isinstance(enhancements, str) else enhancements
        
        integration_prompt = f"""
        Integrate these enhancements into the original content using a {integration_strategy} approach.
        
        ORIGINAL CONTENT:
        {original_content[:4000]}  # Limit for context
        
        ENHANCEMENTS TO INTEGRATE:
        {json.dumps(enhancements_data, indent=2)}
        
        INTEGRATION REQUIREMENTS:
        1. Maintain the original structure and flow
        2. Ensure smooth transitions between original and new content
        3. Preserve the original voice and tone
        4. Avoid redundancy - merge similar content
        5. Keep all valuable content from both sources
        6. Ensure logical progression of ideas
        
        Provide the fully integrated content.
        """
        
        response = openai_client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "You are an expert content editor who seamlessly integrates new content into existing materials."},
                {"role": "user", "content": integration_prompt}
            ],
            temperature=0.4,
            max_tokens=4000
        )
        
        integrated_content = response.choices[0].message.content
        
        result = {
            "integrated_content": integrated_content,
            "word_count": len(integrated_content.split()),
            "integration_strategy": integration_strategy,
            "success": True
        }
        
        logger.info(f"✅ Content integration completed")
        return json.dumps(result)
        
    except Exception as e:
        logger.error(f"Content integration failed: {e}")
        return json.dumps({"error": str(e), "success": False})


@function_tool
def research_summarizer(
    quality_feedback: str,
    web_research_results: str,
    sections_to_enhance: str,
    module_context: str = "{}"
) -> str:
    """
    Summarize research findings and quality feedback into actionable enhancement package for Content Agent.
    
    Args:
        quality_feedback: Quality assessment feedback from Quality Agent
        web_research_results: JSON string with all web research findings
        sections_to_enhance: Comma-separated list of sections needing work
        module_context: JSON string with module specifications
        
    Returns:
        JSON string with research package for Content Agent
    """
    try:
        logger.info("📦 Summarizing research findings for Content Agent...")
        
        research_data = json.loads(web_research_results) if web_research_results else {}
        context = json.loads(module_context) if module_context else {}
        
        summary_prompt = f"""
        Create a comprehensive research enhancement package for the Content Agent to use for targeted section regeneration.
        
        QUALITY FEEDBACK:
        {quality_feedback}
        
        WEB RESEARCH FINDINGS:
        {json.dumps(research_data, indent=2)}
        
        SECTIONS TO ENHANCE:
        {sections_to_enhance}
        
        MODULE CONTEXT:
        {json.dumps(context, indent=2)}
        
        Create a structured research package in JSON format:
        {{
            "enhancement_strategy": {{
                "sections_to_regenerate": ["list of sections"],
                "sections_to_preserve": ["list of good sections"],
                "total_word_deficit": <number>,
                "priority_order": ["ordered list of sections by priority"]
            }},
            "section_research": {{
                "section_name": {{
                    "research_findings": ["key findings from web research"],
                    "current_examples": ["specific examples to include"],
                    "industry_insights": ["latest trends and data"],
                    "enhancement_requirements": ["specific improvements needed"],
                    "word_target_addition": <number>
                }}
            }},
            "integration_guidelines": {{
                "preserve_voice": true,
                "maintain_structure": true,
                "focus_areas": ["specific areas to enhance"],
                "quality_targets": {{
                    "minimum_score": 7.5,
                    "word_count_target": <number>
                }}
            }}
        }}
        
        Focus on providing actionable, specific guidance for Content Agent regeneration.
        """
        
        # Define structured output schema for research package
        research_package_schema = {
            "type": "object",
            "properties": {
                "enhancement_strategy": {
                    "type": "object",
                    "properties": {
                        "sections_to_regenerate": {"type": "array", "items": {"type": "string"}},
                        "sections_to_preserve": {"type": "array", "items": {"type": "string"}},
                        "total_word_deficit": {"type": "integer"},
                        "priority_order": {"type": "array", "items": {"type": "string"}}
                    },
                    "required": ["sections_to_regenerate", "sections_to_preserve", "total_word_deficit", "priority_order"],
                    "additionalProperties": False
                },
                "section_research": {
                    "type": "object",
                    "patternProperties": {
                        ".*": {
                            "type": "object",
                            "properties": {
                                "research_findings": {"type": "array", "items": {"type": "string"}},
                                "current_examples": {"type": "array", "items": {"type": "string"}},
                                "industry_insights": {"type": "array", "items": {"type": "string"}},
                                "enhancement_requirements": {"type": "array", "items": {"type": "string"}},
                                "word_target_addition": {"type": "integer"}
                            },
                            "required": ["research_findings", "enhancement_requirements", "word_target_addition"],
                            "additionalProperties": False
                        }
                    },
                    "additionalProperties": False
                },
                "integration_guidelines": {
                    "type": "object",
                    "properties": {
                        "preserve_voice": {"type": "boolean"},
                        "maintain_structure": {"type": "boolean"},
                        "focus_areas": {"type": "array", "items": {"type": "string"}},
                        "quality_targets": {
                            "type": "object",
                            "properties": {
                                "minimum_score": {"type": "number"},
                                "word_count_target": {"type": "integer"}
                            },
                            "required": ["minimum_score", "word_count_target"],
                            "additionalProperties": False
                        }
                    },
                    "required": ["preserve_voice", "maintain_structure", "focus_areas", "quality_targets"],
                    "additionalProperties": False
                }
            },
            "required": ["enhancement_strategy", "section_research", "integration_guidelines"],
            "additionalProperties": False
        }

        response = openai_client.chat.completions.create(
            model="gpt-4o-2024-08-06",  # Use model that supports structured outputs
            messages=[
                {"role": "system", "content": "You are a research analyst who packages findings for content regeneration. You must respond with valid JSON that matches the provided schema."},
                {"role": "user", "content": summary_prompt}
            ],
            temperature=0.3,
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "research_package",
                    "schema": research_package_schema,
                    "strict": True
                }
            }
        )
        
        # Structured outputs guarantee valid JSON - no cleaning needed
        try:
            research_package = json.loads(response.choices[0].message.content)
            logger.info("✅ Research package JSON parsed successfully via Structured Outputs")
        except json.JSONDecodeError as e:
            # This should never happen with structured outputs, but keep fallback for safety
            logger.error(f"Unexpected JSON parsing error with Structured Outputs: {e}")
            # Create fallback research package
            research_package = {
                "enhancement_strategy": {
                    "sections_to_regenerate": ["core_content"],
                    "sections_to_preserve": [],
                    "total_word_deficit": 1000,
                    "priority_order": ["core_content"]
                },
                "section_research": {
                    "core_content": {
                        "research_findings": ["Content needs improvement"],
                        "current_examples": [],
                        "industry_insights": [],
                        "enhancement_requirements": ["Add more content"],
                        "word_target_addition": 1000
                    }
                },
                "integration_guidelines": {
                    "preserve_voice": True,
                    "maintain_structure": True,
                    "focus_areas": ["content expansion"],
                    "quality_targets": {
                        "minimum_score": 7.5,
                        "word_count_target": 4000
                    }
                }
            }
        
        result = {
            "research_package": research_package,
            "package_type": "content_agent_enhancement",
            "token_efficient": True,
            "success": True
        }
        
        logger.info("✅ Research package created for Content Agent")
        return json.dumps(result)
        
    except Exception as e:
        logger.error(f"Research summarization failed: {e}")
        return json.dumps({"error": str(e), "success": False})


if __name__ == "__main__":
    """Test the enhancement tools."""
    
    print("🧪 Testing Enhancement Tools")
    print("=" * 50)
    
    # Test section analyzer
    test_content = "This is a test module content..."
    test_feedback = "Content needs more examples and deeper explanations"
    
    print("\n📊 Testing section_quality_analyzer...")
    result = section_quality_analyzer(test_content, test_feedback)
    print(f"Result: {json.loads(result).get('success', False)}")
    
    print("\n✅ Enhancement tools ready for use!")