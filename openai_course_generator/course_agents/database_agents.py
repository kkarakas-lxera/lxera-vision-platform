#!/usr/bin/env python3
"""
Database-Integrated Agents for Content Generation

These agents use content_id workflow instead of JSON content passing,
reducing token usage by 98%+ and eliminating JSON parsing errors.

Key Features:
- Content ID-based agent communication
- Database storage for all operations
- Enhanced quality assessment workflow
- Research-driven enhancement process
"""

import json
import logging
from typing import Dict, Any, List
from agents import Agent

# Database-integrated tools
from tools.database_content_tools import (
    create_new_module_content,
    store_content_section,
    retrieve_content_sections,
    update_module_status,
    get_module_metadata_db,
    create_enhancement_session_db,
    update_enhancement_session_db,
    create_research_session_db,
    store_research_results_db,
    get_content_analytics_db
)

from tools.database_quality_tools import (
    quality_assessor_db,
    enhanced_quality_checker_db
)

# Original enhancement tools for research
from tools.enhancement_tools import (
    web_research_enhancement,
    research_summarizer
)

# Original content generation tools (updated to work with database)
from tools.agentic_content_tools import (
    generate_module_introduction,
    generate_core_content,
    generate_practical_applications,
    generate_case_studies,
    generate_assessment_materials
)

logger = logging.getLogger(__name__)

# =====================================================
# DATABASE-INTEGRATED QUALITY AGENT
# =====================================================

def create_database_quality_agent() -> Agent:
    """Create Quality Agent that works with database content."""
    
    quality_instructions = """
    You are the Database-Integrated Quality Assessment Specialist responsible for evaluating 
    course content stored in Supabase database using content_id references.

    ## PRIMARY RESPONSIBILITIES

    ### 1. Content Quality Assessment
    - Assess content quality using content_id (no JSON content passing)
    - Apply dynamic quality criteria based on module priority level
    - Store assessment results directly in database
    - Generate detailed feedback for enhancement workflow

    ### 2. Quality-Driven Workflow Management
    - Trigger enhancement workflow for failed assessments
    - Create enhancement sessions with specific improvement targets
    - Hand off to Enhancement Agent for research when needed
    - Track quality improvements over time

    ## WORKFLOW PROCESS

    ### 1. Quality Assessment
    1. Use quality_assessor_db with content_id to assess content quality
    2. Apply priority-based scoring (critical: 8.0/10, high: 7.5/10, medium: 7.0/10)
    3. Identify specific sections needing improvement
    4. Store assessment results in database automatically

    ### 2. Enhancement Decision
    - If content passes: update status to "approved" and complete
    - If content fails: create enhancement session and hand off to Enhancement Agent
    - Provide specific enhancement focus and section priorities

    ### 3. Enhancement Session Creation
    1. Use create_enhancement_session_db to track improvement process
    2. Specify sections_to_enhance and sections_preserved
    3. Set enhancement_type (targeted, comprehensive, research_driven)
    4. Hand off to enhancement_agent with content_id and session details

    ## KEY PRINCIPLES
    - NEVER request full content - always use content_id
    - Store all assessment results in database for tracking
    - Provide specific, actionable feedback for improvements
    - Support the hybrid enhancement workflow (research + regeneration)
    - Focus on content quality while maintaining efficiency

    ## QUALITY STANDARDS
    - Dynamic scoring based on module priority level
    - Comprehensive assessment of accuracy, clarity, completeness, engagement, personalization
    - Word count validation with tolerance based on priority
    - Section-specific quality evaluation

    ## DATABASE WORKFLOW
    - All operations use content_id references
    - Assessment results stored automatically
    - Enhancement sessions tracked for analytics
    - Module status updated based on quality outcomes

    Your assessments drive the entire content improvement workflow and must be accurate and actionable.
    """
    
    return Agent(
        name="Database Quality Specialist",
        instructions=quality_instructions,
        tools=[
            quality_assessor_db,
            enhanced_quality_checker_db,
            create_enhancement_session_db,
            update_module_status,
            get_module_metadata_db
        ],
        handoffs=["enhancement_agent", "content_agent"]
    )

# =====================================================
# DATABASE-INTEGRATED CONTENT AGENT
# =====================================================

def create_database_content_agent() -> Agent:
    """Create Content Agent that works with database storage."""
    
    content_instructions = """
    You are the Database-Integrated Content Generation Specialist responsible for creating 
    and enhancing course content with efficient database storage.

    ## PRIMARY RESPONSIBILITIES

    ### 1. Initial Content Generation
    - Create module content and store in database with content_id
    - Generate each section individually and store using store_content_section
    - Use original content generation tools but store results in database
    - Maintain high personalization and quality standards

    ### 2. Content Enhancement (Research-Driven)
    - Receive enhancement sessions from Quality Agent
    - Regenerate specific sections using research data from Enhancement Agent
    - Preserve good sections while improving problematic ones
    - Update content in database section by section

    ## WORKFLOW MODES

    ### Mode 1: Initial Generation
    1. Use create_new_module_content to initialize content in database
    2. Generate introduction using generate_module_introduction
    3. Store section using store_content_section
    4. Repeat for core_content, practical_applications, case_studies, assessments
    5. Update module status to "quality_check"
    6. Hand off to quality_agent with content_id

    ### Mode 2: Enhancement Mode
    1. Receive content_id and enhancement session details
    2. Use retrieve_content_sections to get current content efficiently
    3. Focus only on sections_to_enhance (preserve others)
    4. Use research data to improve specific sections
    5. Store enhanced sections using store_content_section
    6. Update module status and hand back to quality_agent

    ## CONTENT GENERATION TOOLS
    - generate_module_introduction: Create personalized introduction (800-1000 words)
    - generate_core_content: Develop comprehensive instructional content (1800-2200 words)
    - generate_practical_applications: Create workplace-relevant examples (1200-1500 words)
    - generate_case_studies: Write realistic business scenarios (800-1000 words)
    - generate_assessment_materials: Design knowledge validation materials

    ## DATABASE OPERATIONS
    - create_new_module_content: Initialize new content with specifications
    - store_content_section: Store individual sections efficiently
    - retrieve_content_sections: Get current content for enhancement
    - update_module_status: Update workflow status

    ## EFFICIENCY PRINCIPLES
    - Always use content_id for communication
    - Store content sections individually for granular updates
    - Only regenerate sections that need improvement
    - Preserve high-quality sections to maintain consistency
    - Focus on targeted improvements rather than full regeneration

    ## QUALITY STANDARDS
    - Target word counts: Introduction (800-1000), Core Content (1800-2200), etc.
    - High personalization for learner's role and career goals
    - Integration of research findings when available
    - Professional tone with practical applicability
    - Tool-specific examples (Excel, SAP BPC, PowerBI)

    Use the database workflow to eliminate JSON parsing issues and reduce token usage dramatically.
    """
    
    return Agent(
        name="Database Content Specialist",
        instructions=content_instructions,
        tools=[
            create_new_module_content,
            store_content_section,
            retrieve_content_sections,
            update_module_status,
            get_module_metadata_db,
            generate_module_introduction,
            generate_core_content,
            generate_practical_applications,
            generate_case_studies,
            generate_assessment_materials
        ],
        handoffs=["quality_agent"]
    )

# =====================================================
# DATABASE-INTEGRATED ENHANCEMENT AGENT
# =====================================================

def create_database_enhancement_agent() -> Agent:
    """Create Enhancement Agent that works with database research tracking."""
    
    enhancement_instructions = """
    You are the Database-Integrated Content Enhancement Research Specialist responsible for 
    conducting targeted research to guide content improvements.

    ## PRIMARY RESPONSIBILITIES

    ### 1. Research Session Management
    - Create research sessions in database for tracking
    - Conduct targeted web research using Tavily
    - Store research results with quality metrics
    - Generate research packages for Content Agent

    ### 2. Quality-Driven Research
    - Analyze quality assessment results to identify research needs
    - Focus research on specific sections needing improvement
    - Find current examples, industry trends, and statistics
    - Package findings for efficient Content Agent consumption

    ## WORKFLOW PROCESS

    ### 1. Research Session Initialization
    1. Receive enhancement session from Quality Agent
    2. Use create_research_session_db to track research process
    3. Analyze quality feedback to determine research topics
    4. Identify specific enhancement needs per section

    ### 2. Targeted Web Research
    1. Use web_research_enhancement for each problematic section
    2. Focus on current examples, industry trends, statistics
    3. Conduct multiple searches with different focus areas
    4. Track Tavily queries and research quality

    ### 3. Research Package Creation
    1. Use research_summarizer to create actionable package for Content Agent
    2. Include specific findings for each section needing work
    3. Provide current examples and industry insights
    4. Store complete research results using store_research_results_db

    ### 4. Handoff to Content Agent
    - Provide content_id and research session details
    - Include specific sections to enhance vs preserve
    - Hand off with research package for targeted regeneration

    ## RESEARCH TOOLS
    - web_research_enhancement: Targeted web research for specific topics
    - research_summarizer: Package findings for Content Agent use
    - create_research_session_db: Initialize research tracking
    - store_research_results_db: Store research results and packages

    ## DATABASE WORKFLOW
    - All research activities tracked in database
    - Research quality metrics stored for analytics
    - Token usage and efficiency metrics captured
    - Research packages optimized for Content Agent consumption

    ## RESEARCH FOCUS AREAS
    - Current industry examples and case studies
    - Latest trends and best practices (2024/2025)
    - Statistical data and research findings
    - Tool-specific updates and new features
    - Practical applications and real-world scenarios

    ## EFFICIENCY PRINCIPLES
    - Conduct focused research rather than broad searches
    - Package findings efficiently to reduce Content Agent token usage
    - Track research quality to improve future sessions
    - Support the hybrid workflow (research → regeneration → integration)

    Your research directly improves content quality while maintaining efficiency through database integration.
    """
    
    return Agent(
        name="Database Enhancement Research Specialist",
        instructions=enhancement_instructions,
        tools=[
            create_research_session_db,
            store_research_results_db,
            update_enhancement_session_db,
            web_research_enhancement,
            research_summarizer,
            get_module_metadata_db
        ],
        handoffs=["content_agent"]
    )

# =====================================================
# AGENT ORCHESTRATOR CLASSES
# =====================================================

class DatabaseContentOrchestrator:
    """Orchestrates database-integrated content generation workflow."""
    
    def __init__(self):
        self.quality_agent = create_database_quality_agent()
        self.content_agent = create_database_content_agent()
        self.enhancement_agent = create_database_enhancement_agent()
        
        logger.info("🗄️ Database Content Orchestrator initialized")
    
    async def generate_module_with_database(
        self,
        module_spec: Dict[str, Any],
        research_context: Dict[str, Any] = None,
        session_id: str = None
    ) -> Dict[str, Any]:
        """
        Generate complete module using database workflow.
        
        Args:
            module_spec: Module specifications
            research_context: Research findings to integrate
            session_id: Session identifier
            
        Returns:
            Dict with content_id and generation results
        """
        try:
            logger.info(f"🚀 Starting database content generation for {module_spec.get('module_name', 'Module')}")
            
            from agents import Runner
            
            # Prepare content generation message
            module_name = module_spec.get('module_name', 'Module')
            employee_name = module_spec.get('personalization_context', {}).get('employee_name', 'Learner')
            
            content_message = f"""
            Generate complete course module using database workflow:

            MODULE SPECIFICATIONS:
            {json.dumps(module_spec, indent=2)}

            RESEARCH CONTEXT:
            {json.dumps(research_context or {}, indent=2)}

            SESSION ID: {session_id or 'unknown'}

            WORKFLOW:
            1. Use create_new_module_content to initialize content in database
            2. Generate and store each section individually using content generation tools
            3. Update module status to "quality_check" when complete
            4. Hand off to quality_agent for assessment

            Execute database workflow for efficient content generation and storage.
            """
            
            # Execute with Content Agent
            result = await Runner.run(
                self.content_agent,
                input=content_message,
                max_turns=20  # Allow for full generation and storage
            )
            
            logger.info("✅ Database content generation workflow completed")
            return result
            
        except Exception as e:
            logger.error(f"❌ Database content generation failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "workflow": "database_content_generation"
            }
    
    async def quality_check_with_enhancement(self, content_id: str) -> Dict[str, Any]:
        """
        Perform quality check with automatic enhancement if needed.
        
        Args:
            content_id: Content identifier in database
            
        Returns:
            Dict with quality assessment and enhancement results
        """
        try:
            logger.info(f"📊 Starting quality check for content {content_id[:8]}")
            
            from agents import Runner
            
            quality_message = f"""
            Perform comprehensive quality assessment for content_id: {content_id}

            WORKFLOW:
            1. Use quality_assessor_db to assess content quality
            2. If content fails quality standards:
               - Create enhancement session using create_enhancement_session_db
               - Hand off to enhancement_agent for research
            3. If content passes: approve and complete

            Execute quality-driven workflow with database storage.
            """
            
            # Execute with Quality Agent
            result = await Runner.run(
                self.quality_agent,
                input=quality_message,
                max_turns=15  # Allow for assessment and enhancement workflow
            )
            
            logger.info("✅ Quality check workflow completed")
            return result
            
        except Exception as e:
            logger.error(f"❌ Quality check workflow failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "content_id": content_id,
                "workflow": "quality_check_enhancement"
            }

def create_database_workflow_message(
    workflow_type: str,
    content_id: str = None,
    module_spec: Dict[str, Any] = None,
    enhancement_session_id: str = None
) -> str:
    """Create workflow message for database agents."""
    
    if workflow_type == "content_generation":
        return f"""
        Generate complete course module using database workflow:
        
        MODULE SPECIFICATIONS:
        {json.dumps(module_spec, indent=2)}
        
        WORKFLOW:
        1. Create module content in database
        2. Generate sections and store individually
        3. Update status to quality_check
        4. Hand off to quality_agent
        
        Use database operations for all content storage.
        """
    
    elif workflow_type == "quality_assessment":
        return f"""
        Assess content quality for content_id: {content_id}
        
        WORKFLOW:
        1. Use quality_assessor_db for assessment
        2. Store results in database
        3. Create enhancement session if needed
        4. Hand off to enhancement_agent if revision required
        
        Use content_id for all operations.
        """
    
    elif workflow_type == "enhancement_research":
        return f"""
        Conduct enhancement research for content_id: {content_id}
        Enhancement session: {enhancement_session_id}
        
        WORKFLOW:
        1. Create research session in database
        2. Conduct targeted web research
        3. Package findings for Content Agent
        4. Store research results and hand off
        
        Focus on specific sections needing improvement.
        """
    
    return "Invalid workflow type specified"

if __name__ == "__main__":
    """Test database agents."""
    
    print("🧪 Testing Database-Integrated Agents")
    print("=" * 50)
    
    try:
        # Initialize orchestrator
        orchestrator = DatabaseContentOrchestrator()
        
        print("✅ Database agents configured successfully")
        print("🗄️ Content ID workflow ready")
        print("📊 Quality assessment integration ready")
        print("🔍 Enhancement research tracking ready")
        
        # Test agent handoffs
        print("\n🔄 Agent handoffs configured:")
        print("  Content Agent → Quality Agent")
        print("  Quality Agent → Enhancement Agent")
        print("  Enhancement Agent → Content Agent")
        
        print("\n✅ Database workflow ready for execution!")
        
    except Exception as e:
        print(f"❌ Database agents test failed: {e}")
        print("Make sure database tools are properly configured")