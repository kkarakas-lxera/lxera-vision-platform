"""Coordinator Agent - Main orchestration agent for course generation."""

from typing import Dict, Any, List
from lxera_agents import Agent
from config.agent_configs import get_agent_configs
# from tools.personalization_tools import employee_analyzer, requirement_validator
# from tools.database_tools import progress_tracker


class CoordinatorAgent:
    """
    Coordinator Agent manages the overall course generation workflow.
    
    Replaces the complex LangGraph routing and orchestration with intelligent
    agent decision-making and handoffs.
    """
    
    def __init__(self):
        self.agent_configs = get_agent_configs()
        self.agent = self._create_agent()
    
    def _create_agent(self) -> Agent:
        """Create the coordinator agent with proper configuration."""
        config = self.agent_configs.get_coordinator_config()
        
        # Import other agent creation functions
        from .research_agent import create_research_agent
        from .content_agent import create_content_agent
        from .quality_agent import create_quality_agent
        from .multimedia_agent import create_multimedia_agent
        from .finalizer_agent import create_finalizer_agent
        
        # Create agent instances for handoffs
        research_agent = create_research_agent()
        content_agent = create_content_agent()
        quality_agent = create_quality_agent()
        multimedia_agent = create_multimedia_agent()
        finalizer_agent = create_finalizer_agent()
        
        return Agent(
            name=config["name"],
            instructions=config["instructions"],
            tools=[
                # employee_analyzer,
                # progress_tracker,
                # requirement_validator
            ],
            handoffs=[
                research_agent,
                content_agent,
                quality_agent,
                multimedia_agent,
                finalizer_agent
            ]
        )
    
    def get_agent(self) -> Agent:
        """Get the configured coordinator agent."""
        return self.agent


def create_coordinator_agent() -> Agent:
    """Factory function to create coordinator agent."""
    coordinator = CoordinatorAgent()
    return coordinator.get_agent()