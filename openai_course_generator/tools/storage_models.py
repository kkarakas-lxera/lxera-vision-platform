"""
Storage Models for Agent Tools

Defines typed models for use with OpenAI agents SDK to ensure strict schema compliance.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class SkillGap(BaseModel):
    """Model for a skill gap."""
    skill: str = Field(description="Name of the skill")
    importance: str = Field(description="Importance level: Critical, High, or Important")
    current_level: Optional[int] = Field(default=None, description="Current proficiency level (1-5)")
    required_level: Optional[int] = Field(default=None, description="Required proficiency level (1-5)")

class CourseModule(BaseModel):
    """Model for a course module."""
    title: str = Field(description="Module title")
    duration: str = Field(description="Module duration (e.g., '2 hours')")
    topics: List[str] = Field(description="List of topics covered")
    priority: str = Field(description="Priority level: High, Medium, or Low")
    week: Optional[int] = Field(default=None, description="Week number in the course")

class CourseStructure(BaseModel):
    """Model for course structure."""
    title: str = Field(description="Course title")
    duration_weeks: int = Field(description="Total course duration in weeks")
    modules: List[CourseModule] = Field(description="List of course modules")
    learning_objectives: Optional[List[str]] = Field(default=None, description="Course learning objectives")

class PrioritizedGaps(BaseModel):
    """Model for prioritized skill gaps."""
    critical_gaps: List[SkillGap] = Field(description="Critical skill gaps to address immediately")
    high_priority_gaps: List[SkillGap] = Field(description="High priority skill gaps")
    development_gaps: List[SkillGap] = Field(description="Development skill gaps for growth")

class ResearchStrategy(BaseModel):
    """Model for research strategy."""
    primary_topics: List[str] = Field(description="Primary topics to research")
    search_queries: List[str] = Field(description="Specific search queries to use")
    source_types: List[str] = Field(description="Types of sources to prioritize")

class LearningPath(BaseModel):
    """Model for personalized learning path."""
    sequence: List[str] = Field(description="Sequence of modules or topics")
    adaptive_elements: List[str] = Field(description="Adaptive learning elements")
    practice_components: List[str] = Field(description="Hands-on practice components")

class EmployeeProfile(BaseModel):
    """Model for employee profile analysis."""
    learning_style: str = Field(description="Preferred learning style")
    experience_level: str = Field(description="Experience level: Junior, Mid, Senior")
    career_goals: str = Field(description="Career aspirations")
    strengths: List[str] = Field(description="Current strengths")
    improvement_areas: List[str] = Field(description="Areas for improvement")

class ToolCall(BaseModel):
    """Model for tool call tracking."""
    tool_name: str = Field(description="Name of the tool called")
    timestamp: str = Field(description="ISO timestamp of the call")
    parameters: Optional[str] = Field(default=None, description="JSON string of parameters")
    result: Optional[str] = Field(default=None, description="Result summary")

class ResearchSource(BaseModel):
    """Model for research source."""
    url: str = Field(description="Source URL")
    title: str = Field(description="Source title")
    relevance_score: float = Field(description="Relevance score (0-1)")
    content_preview: Optional[str] = Field(default=None, description="Content preview (first 500 chars)")

class ResearchFindings(BaseModel):
    """Model for research findings."""
    topic: str = Field(description="Research topic")
    key_insights: List[str] = Field(description="Key insights discovered")
    sources_count: int = Field(description="Number of sources analyzed")
    confidence_score: float = Field(description="Confidence score (0-1)")

# For backward compatibility with existing code
def course_structure_to_dict(cs: CourseStructure) -> Dict[str, Any]:
    """Convert CourseStructure to dictionary."""
    return {
        "title": cs.title,
        "duration_weeks": cs.duration_weeks,
        "modules": [
            {
                "title": m.title,
                "duration": m.duration,
                "topics": m.topics,
                "priority": m.priority,
                "week": m.week
            }
            for m in cs.modules
        ],
        "learning_objectives": cs.learning_objectives
    }

def prioritized_gaps_to_dict(pg: PrioritizedGaps) -> Dict[str, Any]:
    """Convert PrioritizedGaps to dictionary."""
    return {
        "Critical Skill Gaps": {
            "gaps": [
                {
                    "skill": g.skill,
                    "importance": g.importance,
                    "current_level": g.current_level,
                    "required_level": g.required_level
                }
                for g in pg.critical_gaps
            ]
        },
        "High Priority Gaps": {
            "gaps": [
                {
                    "skill": g.skill,
                    "importance": g.importance,
                    "current_level": g.current_level,
                    "required_level": g.required_level
                }
                for g in pg.high_priority_gaps
            ]
        },
        "Development Gaps": {
            "gaps": [
                {
                    "skill": g.skill,
                    "importance": g.importance,
                    "current_level": g.current_level,
                    "required_level": g.required_level
                }
                for g in pg.development_gaps
            ]
        }
    }