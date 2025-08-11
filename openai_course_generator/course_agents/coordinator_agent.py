"""Coordinator Agent - Main orchestration agent for course generation using SDK handoffs."""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from lxera_agents import Agent, OFFICIAL_SDK
import logging

logger = logging.getLogger(__name__)


def create_coordinator_agent() -> Agent:
    """Create coordinator agent with proper SDK handoffs following OpenAI best practices."""
    
    # Import agent creation functions
    from .planning_agent import create_planning_agent
    from .research_agent import create_research_agent
    from .content_agent import create_content_agent
    from .quality_agent import create_quality_agent
    from .enhancement_agent import create_enhancement_agent
    from .multimedia_agent import create_multimedia_agent
    
    # Create specialized agents
    planning_agent = create_planning_agent()
    research_agent = create_research_agent()
    content_agent = create_content_agent()
    quality_agent = create_quality_agent()
    enhancement_agent = create_enhancement_agent()
    multimedia_agent = create_multimedia_agent()
    
    # If using official SDK, we need to access the internal SDK agents for handoffs
    if OFFICIAL_SDK:
        from agents import handoff
        # Extract the SDK agents from the wrappers
        planning_sdk = planning_agent._sdk_agent if hasattr(planning_agent, '_sdk_agent') else planning_agent
        research_sdk = research_agent._sdk_agent if hasattr(research_agent, '_sdk_agent') else research_agent
        content_sdk = content_agent._sdk_agent if hasattr(content_agent, '_sdk_agent') else content_agent
        quality_sdk = quality_agent._sdk_agent if hasattr(quality_agent, '_sdk_agent') else quality_agent
        enhancement_sdk = enhancement_agent._sdk_agent if hasattr(enhancement_agent, '_sdk_agent') else enhancement_agent
        multimedia_sdk = multimedia_agent._sdk_agent if hasattr(multimedia_agent, '_sdk_agent') else multimedia_agent
    
    coordinator_instructions = """
    You are the Course Generation Coordinator responsible for orchestrating the entire
    course creation pipeline using specialized agents.
    
    ## WORKFLOW ORCHESTRATION
    
    You coordinate a 6-agent pipeline:
    1. Planning Agent - Creates course structure from skills gap
    2. Research Agent - Gathers authoritative content sources  
    3. Content Agent - Generates course content (14 tools)
    4. Quality Agent - Assesses content quality (11 tools)
    5. Enhancement Agent - Improves content if needed
    6. Multimedia Agent - Creates videos and audio
    
    ## HANDOFF DECISION LOGIC
    
    ### Initial Flow:
    - Start with Planning Agent for new courses
    - Planning → Research → Content → Quality (standard flow)
    
    ### Quality-Based Routing:
    - If Quality score ≥ 7.5 → Multimedia Agent
    - If Quality score 6.0-7.4 → Enhancement Agent → Content Agent
    - If Quality score < 6.0 → Research Agent (needs more research)
    
    ### Preview Mode:
    - For preview generation, instruct Content Agent to generate first module only
    - After approval, resume from module 2
    
    ## HANDOFF BEST PRACTICES
    
    When handing off:
    1. Always provide content_id, plan_id, or research_id as applicable
    2. Include clear reason for handoff
    3. Set priority based on course importance
    4. Use structured HandoffData for consistency
    
    ## KEY PRINCIPLES
    - Each agent has single responsibility (OpenAI best practice)
    - Agents have <15 tools each (prevents confusion)
    - Use database IDs for 98% token reduction
    - Quality gates ensure professional output
    
    You make intelligent decisions about which agent to engage based on the
    current state and requirements of the course generation process.
    """
    
    # Build handoffs based on SDK availability
    handoffs = []
    if OFFICIAL_SDK:
        # Use SDK handoffs with the internal SDK agents
        handoffs = [
            handoff(
                planning_sdk,
                tool_name_override="start_course_planning"
            ),
            handoff(
                research_sdk,
                tool_name_override="gather_research"
            ),
            handoff(
                content_sdk,
                tool_name_override="generate_content"
            ),
            handoff(
                quality_sdk,
                tool_name_override="assess_quality"
            ),
            handoff(
                enhancement_sdk,
                tool_name_override="enhance_content"
            ),
            handoff(
                multimedia_sdk,
                tool_name_override="create_multimedia"
            )
        ]
    else:
        # Fallback to simple agent list for manual coordination
        handoffs = [
            "planning_agent",
            "research_agent", 
            "content_agent",
            "quality_agent",
            "enhancement_agent",
            "multimedia_agent"
        ]
    
    return Agent(
        name="Course Generation Coordinator",
        instructions=coordinator_instructions,
        handoffs=handoffs
    )