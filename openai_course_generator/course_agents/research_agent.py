"""Research Agent for comprehensive content research and knowledge gathering."""

import json
import logging
from typing import Dict, Any, List
from agents import Agent

# Import research tools
from tools.research_tools import (
    tavily_search,
    firecrawl_extract,
    research_synthesizer
)

logger = logging.getLogger(__name__)

def create_research_agent() -> Agent:
    """Create and configure the Research Agent with agentic tools."""
    
    research_instructions = """
    You are the Research Specialist Agent responsible for comprehensive knowledge gathering 
    and content research using AI-powered tools that will appear as tool calls in OpenAI Traces.

    Your responsibilities:
    1. Execute comprehensive web searches using tavily_search for topic discovery
    2. Extract detailed content from authoritative sources using firecrawl_extract
    3. Synthesize research findings using research_synthesizer
    4. Validate information credibility and source authority
    5. Create structured knowledge bases for course content development

    Process Flow for Research Tasks:
    1. Use tavily_search to find authoritative sources on given topics
    2. Use firecrawl_extract to extract detailed content from top sources
    3. Use research_synthesizer to consolidate findings into structured insights
    4. Ensure comprehensive coverage with minimum 5 high-quality sources per topic

    Research Quality Standards:
    - Prefer authoritative domains (.edu, .gov, .org, established industry sites)
    - Focus on recent information (last 3 years preferred)
    - Ensure mix of academic, industry, and practical sources
    - Create comprehensive citation library
    - Validate information credibility and source authority

    You must use the available research tools for all knowledge gathering tasks to ensure 
    visibility in OpenAI Traces and proper monitoring of the research process.
    """
    
    return Agent(
        name="Research Specialist Agent",
        instructions=research_instructions,
        tools=[
            tavily_search,
            firecrawl_extract,
            research_synthesizer
        ],
        handoffs=[]  # Research agent provides comprehensive findings to content agents
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
            
            from agents import Runner
            
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