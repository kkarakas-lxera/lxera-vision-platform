"""
OpenAI Agents Course Generator

A sophisticated course generation system using OpenAI Agents SDK that replaces 
complex LangGraph orchestration with intelligent agent workflows.

Migration Benefits:
- 80% complexity reduction: 15 nodes → 6 agents  
- Maintained capabilities: All research, content, and multimedia features preserved
- Better orchestration: Agent handoffs replace complex routing logic
- Enhanced debugging: Conversation logs replace graph state tracking

Key Features:
- Comprehensive web research using Tavily, EXA, Firecrawl APIs
- Personalized content generation (6750-8250 words per module)
- Quality assurance with blueprint validation
- Professional multimedia with video animations and audio narration
- Multi-module course generation (up to 16 modules)

Quick Start:
    from openai_course_generator.workflow.course_runner import generate_course_sync
    
    result = generate_course_sync(
        employee_data=employee_profile,
        course_requirements=course_specs
    )
"""

from .workflow.course_runner import (
    CourseRunner,
    generate_course,
    generate_course_sync,
    create_course_runner
)

from .course_agents import (
    create_coordinator_agent,
    create_research_agent,
    create_content_agent,
    create_quality_agent,
    create_multimedia_agent,
    create_finalizer_agent
)

from .models import (
    CourseModule,
    CourseWeek,
    CourseStructure,
    EmployeeProfile,
    PersonalizationContext,
    ResearchResult,
    ContentGenerationResult,
    QualityAssessment,
    MultimediaResult,
    CourseGenerationStatus
)

from .config import Settings, get_settings

__version__ = "1.0.0"
__author__ = "Course Generation Team"
__email__ = "team@learnfinity.com"

__all__ = [
    # Main workflow
    "CourseRunner",
    "generate_course", 
    "generate_course_sync",
    "create_course_runner",
    
    # Agents
    "create_coordinator_agent",
    "create_research_agent",
    "create_content_agent",
    "create_quality_agent", 
    "create_multimedia_agent",
    "create_finalizer_agent",
    
    # Models
    "CourseModule",
    "CourseWeek",
    "CourseStructure",
    "EmployeeProfile",
    "PersonalizationContext",
    "ResearchResult",
    "ContentGenerationResult",
    "QualityAssessment",
    "MultimediaResult",
    "CourseGenerationStatus",
    
    # Configuration
    "Settings",
    "get_settings"
]