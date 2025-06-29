"""Course Agents module for OpenAI Agents Course Generator."""

# Import only the agents we can test without relative import issues
try:
    from .planning_agent import create_planning_agent, PlanningAgentOrchestrator
    from .research_agent import create_research_agent, ResearchAgentOrchestrator
    from .content_agent import create_content_agent, ContentAgentOrchestrator
except ImportError as e:
    print(f"Warning: Could not import lxera_agents: {e}")
    create_planning_agent = None
    PlanningAgentOrchestrator = None
    create_research_agent = None
    ResearchAgentOrchestrator = None
    create_content_agent = None
    ContentAgentOrchestrator = None

__all__ = [
    "create_planning_agent",
    "PlanningAgentOrchestrator",
    "create_research_agent", 
    "ResearchAgentOrchestrator",
    "create_content_agent",
    "ContentAgentOrchestrator"
]