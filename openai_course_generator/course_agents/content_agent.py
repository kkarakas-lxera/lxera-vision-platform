"""Content Agent for comprehensive course content generation using agentic tools."""

import json
import logging
import asyncio
import threading
from typing import Dict, Any, List, Optional
from lxera_agents import Agent

def _run_coro_blocking(coro):
    """Safely run async coroutine in sync context, handling existing event loops"""
    try:
        # Check if we're already in an event loop
        asyncio.get_running_loop()
        # If we are, run in a separate thread with new event loop
        result_holder = {}
        
        def _runner():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                result_holder["result"] = loop.run_until_complete(coro)
            finally:
                loop.close()
        
        t = threading.Thread(target=_runner, daemon=True)
        t.start()
        t.join()
        return result_holder["result"]
    except RuntimeError:
        # No event loop running, safe to use asyncio.run
        return asyncio.run(coro)

# Import only content generation tools (following single responsibility)
from tools.agentic_content_tools import (
    generate_module_introduction,
    generate_core_content,
    generate_practical_applications,
    generate_case_studies,
    generate_assessment_materials,
    compile_complete_module
)
# Database content tools for content_id workflow
from tools.database_content_tools import (
    create_new_module_content,
    store_content_section,
    retrieve_content_sections,
    retrieve_content_sections_for_regeneration,
    get_module_metadata_db,
    update_module_status
)
# Course plan fetching tool
from tools.research_tools import fetch_course_plan

logger = logging.getLogger(__name__)

def create_content_agent() -> Agent:
    """Create and configure the Content Generation Agent with agentic tools."""
    
    content_instructions = """
    You are the Content Generation Specialist responsible for creating comprehensive, 
    personalized course content using AI-powered tools and the efficient content_id workflow.

    ## FOCUSED RESPONSIBILITY (Following OpenAI Best Practices)
    You ONLY generate content - quality assessment is handled by the Quality Agent.
    
    ## DATABASE WORKFLOW

    ### Mode 1: Initial Module Creation
    - If content_id is provided in the DATABASE CONTEXT, USE IT - DO NOT create a new one
    - If no content_id is provided, use create_new_module_content() to create one
    - Generate content sections using content generation tools
    - Store each section using store_content_section(content_id, section_name, content)
    - Update module status to "ready_for_quality" when complete
    - Return content_id for Quality Agent assessment

    ### Mode 2: Enhancement from Research (content_id + research_id input)
    - Receive content_id from Enhancement Agent instead of full JSON content
    - Use retrieve_content_sections(content_id) to get existing content efficiently
    - Use research data from Enhancement Agent to improve specific sections
    - Store enhanced sections using store_content_section() to update database
    - Return content_id for quality re-assessment

    ## PRIMARY RESPONSIBILITIES

    ### 1. Initial Module Generation
    - Generate module introductions that are highly personalized and engaging
    - Create comprehensive core content with detailed explanations
    - Develop practical applications with real-world scenarios
    - Write detailed case studies relevant to the learner's role
    - Create assessment materials including quizzes and exercises
    - Compile all sections into complete, cohesive modules

    ### 2. Hybrid Enhancement Workflow (NEW)
    - Receive content_id + research data from Enhancement Agent for targeted improvements
    - Regenerate specific sections using research data while preserving good content
    - Integrate enhanced sections back into structured module format
    - Maintain content quality and coherence throughout enhancement process

    ## SIMPLIFIED WORKFLOW (Following Single Responsibility Principle)

    ### Mode 1: Content Generation (NO Quality Assessment)
    1. Call fetch_course_plan(plan_id) to get course structure
    2. Check if content_id is provided - if yes, USE IT
    3. If no content_id, use create_new_module_content() to get content_id

    **GENERATION WORKFLOW - FOCUS ON CONTENT ONLY:**
    
    For each section, simply:
    1. Generate content using appropriate tool:
       - generate_module_introduction (800-1000 words)
       - generate_core_content (1800-2200 words)
       - generate_practical_applications (1200-1500 words)
       - generate_case_studies (800-1000 words)
       - generate_assessment_materials (600-800 words)
    
    2. Store immediately using store_content_section(content_id, section_name, content)
    
    3. Move to next section
    
    **FINAL STEPS**:
    - Use compile_complete_module with all sections
    - Use update_module_status(content_id, "ready_for_quality")
    - Return: "Content generation complete. Content ID: [content_id] - Ready for quality assessment."
    
    **KEY PRINCIPLE**: You generate content, Quality Agent assesses it

    ### Mode 2: Research-Driven Enhancement (DATABASE)
    1. Receive content_id + research_id from Enhancement Agent
    2. Use retrieve_content_sections_for_regeneration(content_id) to get content in proper format
    3. Use get_latest_quality_assessment_db(content_id) to understand what needs improvement
    4. Use regenerate_section_with_research for each section needing improvement
    5. Use store_content_section() to update improved sections in database
    6. Use update_module_status(content_id, "quality_check") and return content_id

    ## KEY PRINCIPLES
    - Always integrate research findings into content generation
    - Ensure high personalization based on learner profile
    - Focus on practical, immediately applicable knowledge
    - Maintain consistent quality and professional tone
    - Include tool-specific examples for their workplace tools
    - Create progressive difficulty appropriate to experience level
    - PRESERVE good content sections - only regenerate what needs improvement

    ## QUALITY STANDARDS
    - Introduction: 800-1000 words
    - Core Content: 1800-2200 words
    - Practical Applications: 1200-1500 words
    - Case Studies: 800-1000 words
    - Assessments: Complete quiz and exercise materials
    - Total Module: 4000-6000 words (or target specified in module specs)

    ## ENHANCEMENT MODE GUIDELINES
    - When receiving research packages, focus ONLY on regenerating specified sections
    - Use research findings to add current examples, statistics, and industry insights
    - Maintain original voice and structure while improving content quality
    - Ensure enhanced sections integrate seamlessly with preserved content
    - Always return complete structured module format for quality re-assessment

    You must use the available tools for all content generation to ensure visibility 
    in OpenAI Traces and proper monitoring of the generation process.
    
    ## ENHANCEMENT LOOP EXAMPLE:
    
    FOR INTRODUCTION SECTION (COMPLETE WORKFLOW):
    1. **Generate**: Call generate_module_introduction()
    2. **Create Context**: {"word_count_target": "800-1000", "section_name": "introduction"}
    3. **Initial Assess**: Call quality_assessor(intro_content, module_context=intro_context)
    4. **Parse Score**: Extract "overall_score" from JSON result
    
    **IF SCORE ≥ 7.5**: 
    - IMMEDIATELY call store_content_section(content_id, "introduction", intro_content)
    - Wait for success confirmation
    - Then move to next section (core_content)
    
    **IF SCORE < 7.5 (Enhancement Loop)**:
    
    **Attempt 1:**
    - Call enhancement_suggester(quality_result, "{}")
    - Parse suggestions → get highest priority type (e.g., "clarity")  
    - Call enhance_with_current_data(intro_content, "clarity", "add examples and explanations")
    - Call quality_assessor(enhanced_content, intro_context)
    - IF new score ≥ 7.5: Store enhanced content → Next section
    - IF new score < 7.5: Continue to Attempt 2
    
    **Attempt 2:**
    - Call enhancement_suggester(latest_quality, "{}")
    - Apply DIFFERENT enhancement (e.g., "engagement" if clarity was attempted)
    - Call enhance_with_current_data(content, "engagement", "add interactive elements")
    - Call quality_assessor(final_enhanced_content, intro_context)
    - Store final version (regardless of score) → Next section
    
    **MAX 2 ATTEMPTS** - Then move to core_content section
    """
    
    return Agent(
        name="Content Generation Specialist",
        instructions=content_instructions,
        tools=[
            # Database content tools (7 tools)
            create_new_module_content,
            store_content_section,
            retrieve_content_sections,
            retrieve_content_sections_for_regeneration,
            get_module_metadata_db,
            update_module_status,
            # Core content generation tools (6 tools)
            generate_module_introduction,
            generate_core_content,
            generate_practical_applications,
            generate_case_studies,
            generate_assessment_materials,
            compile_complete_module,
            # Course plan fetching tool (1 tool)
            fetch_course_plan
        ],
        # Total: 13 tools (under the 15 tool limit per OpenAI best practices)
        handoffs=["quality_agent"]  # Content agent hands off content_id to quality for validation
    )

class ContentAgentOrchestrator:
    """Orchestrates content generation using the agentic content agent."""
    
    def __init__(self):
        self.content_agent = create_content_agent()
        logger.info("🎨 Content Agent Orchestrator initialized with agentic tools")
    
    async def generate_complete_module(
        self,
        module_spec: Dict[str, Any],
        research_context: Dict[str, Any] = None,
        content_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate complete module using agent with tool calls visible in OpenAI Traces.
        
        Args:
            module_spec: Module specifications
            research_context: Research context (optional)
            content_id: Existing content_id to use (optional) - FIXES THE MISMATCH ISSUE
        """
        try:
            logger.info(f"🚀 Starting agentic content generation for {module_spec.get('module_name', 'Module')}")
            if content_id:
                logger.info(f"📌 Using provided content_id: {content_id}")
            
            from lxera_agents import Runner
            
            # Prepare content generation request as a message string
            module_name = module_spec.get('module_name', 'Module')
            personalization = module_spec.get('personalization_context', {})
            
            # Include content_id in the message if provided
            database_context = ""
            if content_id:
                database_context = f"""
            DATABASE CONTEXT:
            - Content ID: {content_id}
            - USE THIS CONTENT_ID - DO NOT CREATE A NEW ONE
            """
            
            content_message = f"""
            Generate a complete course module: "{module_name}"
            {database_context}
            MODULE SPECIFICATIONS:
            {json.dumps(module_spec, indent=2)}
            
            RESEARCH CONTEXT:
            {json.dumps(research_context, indent=2) if research_context else "No research context provided"}
            
            MANDATORY QUALITY WORKFLOW:
            1. {"Use the provided content_id above" if content_id else "Use create_new_module_content to get content_id"}
            
            COMPLETE ONE SECTION BEFORE STARTING NEXT - NO PARALLEL PROCESSING:
            
            2. INTRODUCTION (COMPLETE BEFORE MOVING TO NEXT):
               A) generate_module_introduction (800-1000 words)
               B) quality_assessor_with_storage(content, content_id, "introduction", {{"word_count_target": "800-1000", "section_name": "introduction"}})
               C) WAIT for quality result - parse "overall_score" from JSON (automatically stored in database)
               D) **ENHANCEMENT LOOP (if score < 7.5):**
                  - Attempt 1: enhancement_suggester → enhance_with_current_data → quality_assessor_with_storage
                  - If still < 7.5: Attempt 2 with DIFFERENT enhancement type → quality_assessor_with_storage
                  - MAX 2 attempts, then store best version (all assessments stored in database)
               E) store_content_section (ONLY after quality approval OR max attempts)
            
            3. CORE CONTENT (START ONLY AFTER INTRODUCTION STORED):
               A) generate_core_content (1800-2200 words)
               B) quality_assessor_with_storage(content, content_id, "core_content", {{"word_count_target": "1800-2200", "section_name": "core_content"}})
               C) **ENHANCEMENT LOOP (if score < 7.5):** Max 2 attempts with quality_assessor_with_storage → store best version
            
            4. PRACTICAL APPLICATIONS (START ONLY AFTER CORE CONTENT STORED):
               A) generate_practical_applications (1200-1500 words)
               B) quality_assessor_with_storage → **ENHANCEMENT LOOP (if < 7.5):** Max 2 attempts → store
            
            5. CASE STUDIES (START ONLY AFTER PRACTICAL APPS STORED):
               A) generate_case_studies (800-1000 words)
               B) quality_assessor_with_storage → **ENHANCEMENT LOOP (if < 7.5):** Max 2 attempts → store
            
            6. ASSESSMENTS (START ONLY AFTER CASE STUDIES STORED):
               A) generate_assessment_materials (600-800 words)
               B) quality_assessor_with_storage → **ENHANCEMENT LOOP (if < 7.5):** Max 2 attempts → store
            
            7. FINAL: compile_complete_module and update_module_status
            
            CRITICAL: NO section can be stored without quality_assessor validation first!
            
            TARGET: {module_spec.get('word_count_target', '4000-6000')} words total with high personalization for {personalization.get('current_role', 'the learner')}.
            
            Execute each tool call in sequence with the module specifications and research context.
            """
            
            # Execute content generation workflow with agent
            content_result = await Runner.run(
                self.content_agent,
                input=content_message,
                max_turns=15  # Allow multiple tool calls for complete module
            )
            
            logger.info("✅ Agentic content generation workflow completed")
            
            # Debug the return type
            logger.info(f"🔍 DEBUG - Runner.run returned type: {type(content_result)}")
            logger.info(f"🔍 DEBUG - Has messages attr: {hasattr(content_result, 'messages')}")
            if hasattr(content_result, '__dict__'):
                logger.info(f"🔍 DEBUG - Attributes: {list(content_result.__dict__.keys())[:10]}")
            if isinstance(content_result, dict):
                logger.info(f"🔍 DEBUG - Dict keys: {list(content_result.keys())}")
            
            return content_result
            
        except Exception as e:
            logger.error(f"❌ Content generation workflow failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "content_stage": "agent_workflow_execution"
            }
    
    def generate_module_sync(
        self,
        module_spec: Dict[str, Any],
        research_context: Dict[str, Any] = None,
        content_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Synchronous wrapper for module generation."""
        return _run_coro_blocking(self.generate_complete_module(module_spec, research_context, content_id))

def create_content_generation_message(
    module_spec: Dict[str, Any],
    research_context: Dict[str, Any] = None
) -> str:
    """Create a workflow message for the content generation agent."""
    
    module_name = module_spec.get("module_name", "Course Module")
    personalization = module_spec.get("personalization_context", {})
    tools = module_spec.get("tool_integration", [])
    
    workflow_message = f"""
    Generate a complete, comprehensive course module: "{module_name}"
    
    LEARNER CONTEXT:
    - Student: {personalization.get('employee_name', 'Learner')}
    - Role: {personalization.get('current_role', 'Analyst')}
    - Career Goal: {personalization.get('career_goal', 'Career advancement')}
    - Tools Used: {', '.join(tools)}
    
    CONTENT REQUIREMENTS:
    - Target Word Count: 4000-6000 words total
    - High personalization for business performance reporting role
    - Integration of research findings throughout content
    - Practical, immediately applicable knowledge
    - Progressive difficulty with clear learning objectives
    
    GENERATION SEQUENCE:
    1. generate_module_introduction - Create engaging, personalized introduction (800-1000 words)
    2. generate_core_content - Develop comprehensive instructional content (1800-2200 words)
    3. generate_practical_applications - Create workplace-relevant examples (1200-1500 words)
    4. generate_case_studies - Write realistic business scenarios (800-1000 words)
    5. generate_assessment_materials - Design knowledge validation materials
    6. compile_complete_module - Integrate all sections into final module
    
    Please execute each tool call in sequence, ensuring high quality and consistency across all sections.
    All tool calls will be visible in OpenAI Traces for monitoring and analysis.
    """
    
    return workflow_message

if __name__ == "__main__":
    """Test the updated content agent."""
    
    print("🎨 Testing Updated Content Agent with Agentic Tools")
    print("=" * 60)
    
    # Sample module specification
    sample_module_spec = {
        "module_name": "Advanced Financial Forecasting for Business Performance",
        "personalization_context": {
            "employee_name": "Kubilaycan Karakas",
            "current_role": "Junior Financial Analyst - Business Performance Reporting",
            "career_goal": "Senior Financial Analyst"
        },
        "tool_integration": ["Excel", "SAP BPC", "PowerBI"],
        "difficulty_level": "intermediate",
        "priority_level": "critical",
        "learning_outcomes": [
            "Master forecasting methodologies",
            "Apply advanced Excel forecasting functions",
            "Create comprehensive forecast models"
        ]
    }
    
    sample_research_context = {
        "research_insights": {
            "key_concepts": ["Time series forecasting", "Business performance indicators", "Financial modeling"],
            "practical_examples": ["Quarterly revenue forecasting", "Budget variance prediction"],
            "research_depth": "comprehensive"
        }
    }
    
    # Test content orchestrator
    orchestrator = ContentAgentOrchestrator()
    
    print("🚀 Content agent configured with agentic tools")
    print("🔍 Tool calls will be visible in OpenAI Traces tab")
    
    # Create workflow message
    workflow_msg = create_content_generation_message(sample_module_spec, sample_research_context)
    print(f"📝 Workflow message prepared for {sample_module_spec['module_name']}")
    
    print("✅ Content agent ready for execution with Runner.run()")
    print("🎨 All content generation will use proper tool calls")