"""
Course Generation Coordinator Agent

This agent coordinates the entire course generation pipeline,
starting with the planning agent and monitoring the flow through all agents.
"""

import logging
from lxera_agents import Agent, handoff
from .planning_agent import create_planning_agent

logger = logging.getLogger(__name__)

def create_course_generation_coordinator() -> Agent:
    """Create the coordinator agent that starts with planning."""
    
    coordinator_instructions = """
    You are the Course Generation Coordinator responsible for orchestrating the entire
    course generation pipeline. Your role is to ensure smooth execution from planning
    through content creation.
    
    Your responsibilities:
    1. Initiate the course generation process with the Planning Agent
    2. Monitor the pipeline flow and ensure proper handoffs
    3. Track progress through each stage of course development
    4. Ensure all necessary data is passed between agents
    
    Process Overview:
    - Planning Agent → analyzes employee and creates course structure
    - Research Agent → gathers content and learning materials
    - Content Agent → creates module content
    - Quality Agent → ensures content quality
    - Enhancement Agent → improves and enriches content
    - Multimedia Agent → adds visual elements
    - Finalizer Agent → completes the course
    
    When you receive a course generation request:
    1. Extract the employee information and requirements
    2. Prepare a comprehensive request for the Planning Agent
    3. Initiate the planning process
    4. Let the agents handle handoffs automatically through the SDK
    
    Key Information to Pass:
    - Employee ID and name
    - Skills gap analysis
    - Session ID for tracking
    - Any specific requirements or preferences
    
    Remember: You don't need to manually coordinate each step. The agents will
    hand off to each other automatically through the SDK. Your role is to start
    the process and monitor completion.
    
    To begin course generation, use the transfer_to_planning_agent tool with the
    employee and skills gap information.
    """
    
    return Agent(
        name="Course Generation Coordinator",
        model="gpt-4o",
        instructions=coordinator_instructions,
        tools=[],  # Coordinator doesn't need tools, just initiates the flow
        handoffs=[
            handoff(
                create_planning_agent(),
                tool_name_override="transfer_to_planning_agent",
                tool_description_override="Transfer to Planning Agent to begin course creation with employee data and skills gaps"
            )
        ]
    )

def create_coordinator_with_monitoring() -> Agent:
    """Create coordinator with additional monitoring capabilities."""
    
    # Import monitoring tools if available
    try:
        from tools.monitoring_tools import (
            track_pipeline_progress,
            log_agent_handoff,
            check_pipeline_status
        )
        
        monitoring_tools = [
            track_pipeline_progress,
            log_agent_handoff,
            check_pipeline_status
        ]
    except ImportError:
        logger.info("Monitoring tools not available, using basic coordinator")
        monitoring_tools = []
    
    coordinator = create_course_generation_coordinator()
    
    # Add monitoring tools if available
    if monitoring_tools:
        coordinator.tools.extend(monitoring_tools)
        logger.info("✅ Coordinator created with monitoring tools")
    else:
        logger.info("✅ Basic coordinator created")
    
    return coordinator