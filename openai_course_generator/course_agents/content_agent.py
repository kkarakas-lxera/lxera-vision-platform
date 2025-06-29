"""Content Agent for comprehensive course content generation using agentic tools."""

import json
import logging
from typing import Dict, Any, List, Optional
from lxera_agents import Agent

# Import agentic content generation tools
from tools.agentic_content_tools import (
    generate_module_introduction,
    generate_core_content,
    generate_practical_applications,
    generate_case_studies,
    generate_assessment_materials,
    compile_complete_module,
    revise_section_with_research,
    enhance_with_current_data,
    regenerate_section_with_research,
    integrate_enhanced_sections
)
# Database content tools for content_id workflow
from tools.database_content_tools import (
    create_new_module_content, store_content_section,
    retrieve_content_sections, retrieve_content_sections_for_regeneration,
    get_module_metadata_db, update_module_status, get_latest_quality_assessment_db
)
# Quality assessment tools for inline validation
from tools.quality_tools import (
    quality_assessor, blueprint_validator, word_counter, 
    personalization_checker, enhancement_suggester,
    generate_enhancement_requirements
)
# Database quality tools for storage integration
from tools.database_quality_tools import quality_assessor_with_storage
# Research tools for enhancement context
from tools.research_tools import tavily_search, fetch_course_plan

logger = logging.getLogger(__name__)

def create_content_agent() -> Agent:
    """Create and configure the Content Generation Agent with agentic tools."""
    
    content_instructions = """
    You are the Content Generation Specialist responsible for creating comprehensive, 
    personalized course content using AI-powered tools and the efficient content_id workflow.

    ## DATABASE WORKFLOW (NEW)

    ### Mode 1: Initial Module Creation
    - If content_id is provided in the DATABASE CONTEXT, USE IT - DO NOT create a new one
    - If no content_id is provided, use create_new_module_content() to create one
    - Generate content sections using agentic tools
    - Store each section using store_content_section(content_id, section_name, content)
    - Update module status using update_module_status() as you progress
    - Return content_id to next agent (98% token reduction vs JSON passing)

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

    ## WORKFLOW MODES

    ### Mode 1: Enhanced Generation with Mandatory Quality Validation (DATABASE)
    1. ALWAYS call fetch_course_plan(plan_id) first to get complete course structure and module details
    2. CHECK if content_id is provided in the DATABASE CONTEXT section - if yes, USE IT
    3. If no content_id provided, use create_new_module_content() to create module and get content_id

    **MANDATORY WORKFLOW - MUST FOLLOW FOR EACH SECTION:**
    
    **Step 1: Generate Section**
    - Use appropriate generate_* tool for section (introduction, core_content, practical_applications, case_studies, assessments)
    
    **Step 2: REQUIRED Quality Assessment with Database Storage**
    - Create section-specific context with appropriate word count target:
      * Introduction: {"word_count_target": "800-1000", "section_name": "introduction"}
      * Core Content: {"word_count_target": "1800-2200", "section_name": "core_content"}  
      * Practical Applications: {"word_count_target": "1200-1500", "section_name": "practical_applications"}
      * Case Studies: {"word_count_target": "800-1000", "section_name": "case_studies"}
      * Assessments: {"word_count_target": "600-800", "section_name": "assessments"}
    - ALWAYS call quality_assessor_with_storage(section_content, content_id, section_name, section_context)
    - This tool automatically stores assessment results in database
    - Extract overall_score from result (look for "overall_score": number)
    
    **Step 3: BLOCKING Quality Decision (MANDATORY)**
    - WAIT for quality_assessor response - DO NOT proceed until you have the result
    - Parse the JSON response to extract "overall_score" number
    - DECISION GATE:
      * If overall_score ≥ 7.5: APPROVED → Go directly to Step 4 (Store)
      * If overall_score < 7.5: REJECTED → Enter Enhancement Loop
    
    **Enhancement Loop (when quality < 7.5) - EXACTLY 2 ATTEMPTS MAX:**
    
    **Attempt 1:**
    1. Call enhancement_suggester(quality_result, "{}")
    2. Parse enhancement suggestions to get highest priority improvement type
    3. Call enhance_with_current_data(section_content, improvement_type, targeted_query)
    4. WAIT for enhanced content result
    5. Call quality_assessor(enhanced_content, section_context) 
    6. Parse new overall_score:
       - If ≥ 7.5: APPROVED → Store enhanced content and proceed
       - If < 7.5: Continue to Attempt 2
    
    **Attempt 2 (if still < 7.5):**
    1. Call enhancement_suggester(latest_quality_result, "{}")
    2. Apply DIFFERENT enhancement type from highest priority suggestions
    3. Call enhance_with_current_data() with new improvement focus
    4. Call quality_assessor(final_enhanced_content, section_context)
    5. Store final version regardless of score (best effort achieved)
    
    **CRITICAL**: Never exceed 2 enhancement attempts per section
    
    **Step 4: Store Final Content (MANDATORY - DO NOT SKIP)**
    - MUST call store_content_section(content_id, section_name, content) after:
      * Quality score ≥ 7.5 (use original or enhanced content) OR
      * Maximum enhancement attempts reached (2) (use best version)
    - NEVER store without quality assessment
    - ALWAYS store approved content before moving to next section
    
    **REPEAT FOR ALL 5 SECTIONS**: introduction → core_content → practical_applications → case_studies → assessments
    
    **FINAL STEPS**:
    - Use compile_complete_module with all sections
    - Use update_module_status(content_id, "approved") 
    - Return a final message: "Module generation complete. Content ID: [content_id]"
    
    **ABSOLUTE REQUIREMENTS**:
    - EVERY section MUST be assessed with quality_assessor before storage
    - NO section can be stored without quality validation
    - If quality_assessor fails, treat as score = 6.0 and enhance

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
            # Database content tools (PRIMARY - for content_id workflow)
            create_new_module_content,
            store_content_section,
            retrieve_content_sections,
            retrieve_content_sections_for_regeneration,
            get_module_metadata_db,
            update_module_status,
            get_latest_quality_assessment_db,
            # Agentic content generation tools (SECONDARY - for actual content creation)
            generate_module_introduction,
            generate_core_content,
            generate_practical_applications,
            generate_case_studies,
            generate_assessment_materials,
            compile_complete_module,
            revise_section_with_research,
            enhance_with_current_data,
            regenerate_section_with_research,
            integrate_enhanced_sections,
            # Quality assessment tools (NEW - for inline validation)
            quality_assessor,
            quality_assessor_with_storage,
            blueprint_validator,
            word_counter,
            personalization_checker,
            enhancement_suggester,
            generate_enhancement_requirements,
            # Research tool for enhancement context
            tavily_search,
            # Course plan fetching tool
            fetch_course_plan
        ],
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
        import asyncio
        return asyncio.run(self.generate_complete_module(module_spec, research_context, content_id))

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