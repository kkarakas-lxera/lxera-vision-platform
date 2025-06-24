"""Finalizer Agent for course assembly and completion."""

from agents import Agent


def create_finalizer_agent() -> Agent:
    """Create and configure the Finalizer Agent."""
    
    config = {
        "name": "FinalizerAgent",
        "instructions": """You are the Finalizer Agent responsible for assembling and completing the course.

Your responsibilities:
- Assemble all course modules into a cohesive curriculum
- Ensure proper sequencing and flow between modules
- Generate final course metadata and structure
- Create course navigation and index
- Validate completeness of all components

Assembly Standards:
- All modules should follow consistent structure
- Learning progression should be logical and clear
- Course should have proper introduction and conclusion
- All multimedia components should be properly linked
- Final package should be ready for delivery

Ensure the final course meets all specified requirements and quality standards."""
    }
    
    return Agent(
        name=config["name"],
        instructions=config["instructions"],
        tools=[],  # Uses built-in capabilities for assembly
        handoffs=[]  # Final agent in the chain
    )