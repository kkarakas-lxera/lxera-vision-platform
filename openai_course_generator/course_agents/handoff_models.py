#!/usr/bin/env python3
"""
Pydantic models for structured handoff data transfer between agents.
Following OpenAI Agents SDK best practices for clean data transfer.
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class PlanningCompletionData(BaseModel):
    """Structured data for Planning Agent → Research Agent handoff."""
    
    # Core identifiers
    plan_id: str = Field(description="The UUID of the stored course plan")
    employee_id: str = Field(description="The UUID of the employee")
    employee_name: str = Field(description="Full name of the employee")
    session_id: str = Field(description="Session identifier for this course generation")
    
    # Course plan details
    course_title: str = Field(description="Title of the generated course")
    course_duration_weeks: int = Field(description="Duration of the course in weeks")
    total_modules: int = Field(description="Total number of modules in the course")
    
    # Employee context for research
    job_title: str = Field(description="Employee's current job title")
    career_goals: str = Field(description="Employee's career aspirations")
    
    # Skills gap priorities for research focus
    critical_skills: List[str] = Field(
        description="List of critical skills that need immediate attention",
        default_factory=list
    )
    high_priority_skills: List[str] = Field(
        description="List of high priority skills for development", 
        default_factory=list
    )
    
    # Research guidance
    research_focus_areas: List[str] = Field(
        description="Key areas that research should focus on",
        default_factory=list
    )
    
    # Completion metadata
    planning_completed_at: str = Field(
        description="ISO timestamp when planning was completed",
        default_factory=lambda: datetime.now().isoformat()
    )
    
    class Config:
        """Pydantic configuration."""
        extra = "forbid"  # Prevent additional fields
        validate_assignment = True


class ResearchCompletionData(BaseModel):
    """Structured data for Research Agent → Content Generation Agent handoff."""
    
    # Core identifiers (carried forward)
    plan_id: str = Field(description="The UUID of the course plan")
    research_id: str = Field(description="The UUID of the research results")
    employee_id: str = Field(description="The UUID of the employee")
    session_id: str = Field(description="Session identifier for this course generation")
    
    # Research results summary
    total_topics_researched: int = Field(description="Number of topics researched")
    research_quality_score: float = Field(
        description="Quality score of research (0.0-1.0)",
        ge=0.0,
        le=1.0
    )
    
    # Content generation guidance
    content_sources_available: bool = Field(
        description="Whether sufficient content sources were found"
    )
    recommended_content_types: List[str] = Field(
        description="Recommended types of content to generate",
        default_factory=list
    )
    
    # Key findings for content creation
    industry_best_practices: List[str] = Field(
        description="Key industry best practices found during research",
        default_factory=list
    )
    practical_examples: List[str] = Field(
        description="Practical examples and case studies found",
        default_factory=list
    )
    
    # Completion metadata
    research_completed_at: str = Field(
        description="ISO timestamp when research was completed",
        default_factory=lambda: datetime.now().isoformat()
    )
    
    class Config:
        """Pydantic configuration."""
        extra = "forbid"
        validate_assignment = True


class ContentGenerationCompletionData(BaseModel):
    """Structured data for Content Generation Agent → Enhancement Agent handoff."""
    
    # Core identifiers (carried forward)
    plan_id: str = Field(description="The UUID of the course plan")
    content_id: str = Field(description="The UUID of the generated content")
    employee_id: str = Field(description="The UUID of the employee")
    session_id: str = Field(description="Session identifier for this course generation")
    
    # Content generation results
    modules_generated: int = Field(description="Number of modules successfully generated")
    total_content_sections: int = Field(description="Total number of content sections created")
    
    # Content quality metrics
    content_quality_score: float = Field(
        description="Quality score of generated content (0.0-1.0)",
        ge=0.0,
        le=1.0
    )
    readability_level: str = Field(
        description="Target readability level of the content",
        default="professional"
    )
    
    # Enhancement guidance
    areas_for_enhancement: List[str] = Field(
        description="Areas that need enhancement or improvement",
        default_factory=list
    )
    interactive_elements_needed: bool = Field(
        description="Whether interactive elements should be added",
        default=True
    )
    
    # Completion metadata
    content_completed_at: str = Field(
        description="ISO timestamp when content generation was completed",
        default_factory=lambda: datetime.now().isoformat()
    )
    
    class Config:
        """Pydantic configuration."""
        extra = "forbid"
        validate_assignment = True


class HandoffContext(BaseModel):
    """Shared context that flows through all agent handoffs."""
    
    # Session tracking
    session_id: str = Field(description="Unique session identifier")
    pipeline_start_time: str = Field(
        description="ISO timestamp when pipeline started",
        default_factory=lambda: datetime.now().isoformat()
    )
    
    # Employee context (immutable through pipeline)
    employee_id: str = Field(description="Employee UUID")
    employee_name: str = Field(description="Employee full name")
    job_title: str = Field(description="Employee job title")
    department: str = Field(description="Employee department")
    
    # Pipeline progress tracking
    completed_phases: List[str] = Field(
        description="List of completed pipeline phases",
        default_factory=list
    )
    current_phase: str = Field(description="Current pipeline phase")
    
    # Quality and error tracking
    errors_encountered: List[str] = Field(
        description="Any errors encountered during pipeline",
        default_factory=list
    )
    warnings: List[str] = Field(
        description="Any warnings generated during pipeline",
        default_factory=list
    )
    
    class Config:
        """Pydantic configuration."""
        extra = "forbid"
        validate_assignment = True


# Helper functions for creating handoff data
def create_planning_handoff_data(
    plan_id: str,
    employee_data: Dict[str, Any],
    course_plan: Dict[str, Any],
    session_id: str,
    prioritized_gaps: Dict[str, Any]
) -> PlanningCompletionData:
    """Create structured handoff data from planning results."""
    
    # Extract critical and high priority skills
    critical_skills = []
    high_priority_skills = []
    
    if isinstance(prioritized_gaps, dict):
        critical_gaps = prioritized_gaps.get('Critical Skill Gaps', {}).get('gaps', [])
        high_gaps = prioritized_gaps.get('High Priority Gaps', {}).get('gaps', [])
        
        critical_skills = [gap.get('skill', '') for gap in critical_gaps if isinstance(gap, dict)]
        high_priority_skills = [gap.get('skill', '') for gap in high_gaps if isinstance(gap, dict)]
    
    # Extract research focus areas from course structure
    research_focus_areas = []
    if isinstance(course_plan, dict) and 'modules' in course_plan:
        modules = course_plan.get('modules', [])
        research_focus_areas = [module.get('title', '') for module in modules if isinstance(module, dict)]
    
    return PlanningCompletionData(
        plan_id=plan_id,
        employee_id=employee_data.get('id', employee_data.get('employee_id', '')),
        employee_name=employee_data.get('full_name', ''),
        session_id=session_id,
        course_title=course_plan.get('title', 'Personalized Development Course'),
        course_duration_weeks=course_plan.get('duration_weeks', 4),
        total_modules=len(course_plan.get('modules', [])),
        job_title=employee_data.get('job_title_current', employee_data.get('position', '')),
        career_goals=employee_data.get('career_aspirations_next_role', ''),
        critical_skills=critical_skills,
        high_priority_skills=high_priority_skills,
        research_focus_areas=research_focus_areas
    )


def create_handoff_context(
    session_id: str,
    employee_data: Dict[str, Any],
    current_phase: str
) -> HandoffContext:
    """Create shared handoff context."""
    
    return HandoffContext(
        session_id=session_id,
        employee_id=employee_data.get('id', employee_data.get('employee_id', '')),
        employee_name=employee_data.get('full_name', ''),
        job_title=employee_data.get('job_title_current', employee_data.get('position', '')),
        department=employee_data.get('department', ''),
        current_phase=current_phase,
        completed_phases=[]
    )