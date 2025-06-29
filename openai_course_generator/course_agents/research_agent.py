"""Research Agent for comprehensive content research and knowledge gathering."""

import json
import logging
from typing import Dict, Any, List
from lxera_agents import Agent, handoff

# Import research tools
from tools.research_tools import (
    fetch_course_plan,
    tavily_search,
    firecrawl_extract,
    research_synthesizer
)

# Import storage tools v2 with manual FunctionTool creation
from tools.research_storage_tools_v2 import (
    store_research_results,
    store_research_session
)

# Import handoff models
from .handoff_models import PlanningCompletionData, ResearchCompletionData

logger = logging.getLogger(__name__)

def create_research_agent() -> Agent:
    """Create and configure the Research Agent with proper SDK handoffs."""
    
    research_instructions = """
    You are the Research Specialist Agent responsible for comprehensive knowledge gathering 
    and content research using AI-powered tools that will appear as tool calls in OpenAI Traces.

    INPUT: You will receive a plan_id for a course plan that was created by the Planning Agent.

    Your responsibilities:
    1. First, fetch the course plan details using the provided plan_id
    2. Execute comprehensive web searches using tavily_search for topic discovery
    3. Extract detailed content from authoritative sources using firecrawl_extract
    4. Synthesize research findings using research_synthesizer
    5. Validate information credibility and source authority
    6. Create structured knowledge bases for course content development
    7. Store the research results

    Process Flow for Research Tasks:
    1. Load the course plan to understand research requirements
    2. Use tavily_search to find authoritative sources for ONLY the first 2-3 modules
    3. Use firecrawl_extract on MAXIMUM 3-4 key sources (prioritize official docs)
    4. Use research_synthesizer IMMEDIATELY after gathering content for each module
    5. Store research results using store_research_results with synthesized insights
    
    IMPORTANT: To avoid context overflow:
    - Research only 2-3 modules at a time
    - Extract from maximum 3-4 sources total
    - Synthesize immediately after extraction
    - Keep findings concise and focused
    
    COMPLETION: When store_research_session returns successfully, your research work is DONE.

    Research Quality Standards:
    - Prefer authoritative domains (.edu, .gov, .org, established industry sites)
    - Focus on recent information (last 3 years preferred)
    - Ensure mix of academic, industry, and practical sources
    - Create comprehensive citation library
    - Validate information credibility and source authority

    You must use the available research tools for all knowledge gathering tasks to ensure 
    visibility in OpenAI Traces and proper monitoring of the research process.
    """
    
    # No handoffs needed - sequential execution
    
    return Agent(
        name="Research Specialist Agent",
        instructions=research_instructions,
        tools=[
            fetch_course_plan,
            tavily_search,
            firecrawl_extract,
            research_synthesizer,
            store_research_results
            # store_research_session  # Temporarily disabled due to schema issues
        ]
    )

class ResearchAgentOrchestrator:
    """Orchestrates research workflows using the agentic research agent."""
    
    def __init__(self):
        self.research_agent = create_research_agent()
        logger.info("🔍 Research Agent Orchestrator initialized with agentic tools")
    
    async def execute_comprehensive_research(
        self,
        research_queries: List[str],
        research_context: str = "financial"
    ) -> Dict[str, Any]:
        """
        Execute comprehensive research workflow using agent with tool calls visible in OpenAI Traces.
        """
        try:
            logger.info(f"🚀 Starting agentic research workflow for {len(research_queries)} queries...")
            
            from lxera_agents import Runner
            
            # Limit research queries to prevent context overflow
            limited_queries = research_queries[:5]  # Limit to first 5 queries
            
            # Prepare research request as message string
            research_message = f"""
            Execute focused research for course content development.
            
            RESEARCH QUERIES TO EXECUTE:
            {json.dumps(limited_queries, indent=2)}
            
            RESEARCH CONTEXT: {research_context}
            
            RESEARCH WORKFLOW (Process efficiently to avoid context limits):
            1. For each query, use tavily_search to find 3-5 authoritative sources
            2. Use research_synthesizer immediately after every 2-3 searches to consolidate
            3. Focus on authoritative sources (.edu, .gov, industry leaders)
            4. Keep research focused and concise
            
            QUALITY REQUIREMENTS:
            - 3-5 sources per query topic
            - Focus on practical, actionable information for course content
            - Synthesize findings into clear, structured insights (max 2000 words per synthesis)
            
            Execute this research workflow systematically, synthesizing frequently to manage context.
            """
            
            # Execute research workflow with agent
            research_result = await Runner.run(
                self.research_agent,
                input=research_message,
                max_turns=20  # Allow multiple tool calls for comprehensive research
            )
            
            logger.info("✅ Agentic research workflow completed")
            return research_result
            
        except Exception as e:
            logger.error(f"❌ Research workflow failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "research_stage": "agent_workflow_execution"
            }
    
    def execute_research_sync(
        self,
        research_queries: List[str],
        research_context: str = "financial"
    ) -> Dict[str, Any]:
        """Synchronous wrapper for research workflow."""
        import asyncio
        return asyncio.run(self.execute_comprehensive_research(research_queries, research_context))