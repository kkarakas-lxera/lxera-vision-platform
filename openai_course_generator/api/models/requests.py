"""
Pydantic request models for the Lxera Agent Pipeline API.

These models define the structure and validation for incoming requests
to the planning, research, and content generation endpoints.
"""

from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional
from enum import Enum
import uuid


class Priority(str, Enum):
    """Priority levels for skills and modules."""
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class LearningStyle(str, Enum):
    """Learning style preferences."""
    HANDS_ON = "Hands-on practical application"
    VISUAL = "Visual and diagram-based learning"
    THEORETICAL = "Theoretical and conceptual"
    MIXED = "Mixed approach"


class EmployeeData(BaseModel):
    """Employee profile data for course planning."""
    
    full_name: str = Field(..., min_length=2, max_length=100)
    job_title_specific: str = Field(..., min_length=5, max_length=200)
    career_aspirations_next_role: str = Field(..., min_length=5, max_length=200)
    learning_style: str = Field(default="Hands-on practical application")
    tools_software_used_regularly: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    
    # Optional fields
    department: Optional[str] = None
    years_in_current_position: Optional[int] = Field(None, ge=0, le=50)
    career_goals_5_years: Optional[str] = None
    certifications: Optional[List[str]] = Field(default_factory=list)
    
    @validator('tools_software_used_regularly')
    def validate_tools(cls, v):
        if len(v) > 20:
            raise ValueError('Too many tools listed (max 20)')
        return v
    
    @validator('skills')
    def validate_skills(cls, v):
        if len(v) > 50:
            raise ValueError('Too many skills listed (max 50)')
        return v


class SkillGap(BaseModel):
    """Individual skill gap definition."""
    
    skill: str = Field(..., min_length=2, max_length=100)
    skill_name: Optional[str] = None
    importance: Priority
    current_level: int = Field(..., ge=0, le=10)
    required_level: int = Field(..., ge=0, le=10)
    gap_size: int = Field(..., ge=0, le=10)
    gap_severity: Optional[str] = None
    skill_type: Optional[str] = None
    is_mandatory: bool = False
    description: Optional[str] = None
    
    @validator('gap_size')
    def validate_gap_size(cls, v, values):
        if 'required_level' in values and 'current_level' in values:
            expected_gap = values['required_level'] - values['current_level']
            if v != expected_gap:
                raise ValueError('gap_size must equal required_level - current_level')
        return v


class SkillGapCategory(BaseModel):
    """Category of skill gaps."""
    gaps: List[SkillGap] = Field(default_factory=list)


class SkillsGaps(BaseModel):
    """Complete skills gap analysis."""
    
    Critical_Skill_Gaps: SkillGapCategory = Field(default_factory=SkillGapCategory)
    High_Priority_Gaps: SkillGapCategory = Field(default_factory=SkillGapCategory)
    Development_Gaps: SkillGapCategory = Field(default_factory=SkillGapCategory)
    
    @validator('Critical_Skill_Gaps', 'High_Priority_Gaps', 'Development_Gaps')
    def validate_gap_categories(cls, v):
        if len(v.gaps) > 20:
            raise ValueError('Too many gaps in category (max 20)')
        return v


class SessionMetadata(BaseModel):
    """Session and context metadata."""
    
    session_id: str = Field(..., regex=r'^[a-f0-9\-]{36}$')
    company_id: str = Field(..., regex=r'^[a-f0-9\-]{36}$')
    user_id: Optional[str] = Field(None, regex=r'^[a-f0-9\-]{36}$')
    
    @validator('session_id', 'company_id', 'user_id')
    def validate_uuids(cls, v):
        if v is not None:
            try:
                uuid.UUID(v)
            except ValueError:
                raise ValueError('Must be a valid UUID')
        return v


class PlanningRequest(BaseModel):
    """Request for planning agent execution."""
    
    employee_data: EmployeeData
    skills_gaps: SkillsGaps
    session_metadata: SessionMetadata
    
    # Optional planning parameters
    planning_parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    class Config:
        schema_extra = {
            "example": {
                "employee_data": {
                    "full_name": "Kubilay Cenk Karakas",
                    "job_title_specific": "Senior Software Engineer - AI/ML Systems",
                    "career_aspirations_next_role": "Staff Software Engineer / Technical Lead",
                    "learning_style": "Hands-on practical application with real-world projects",
                    "tools_software_used_regularly": ["LangChain", "OpenAI/Anthropic SDKs", "Supabase"],
                    "skills": ["RAG (Expert)", "RLHF (Expert)", "LangChain (Expert)"]
                },
                "skills_gaps": {
                    "Critical_Skill_Gaps": {
                        "gaps": [
                            {
                                "skill": "Python",
                                "importance": "Critical",
                                "current_level": 0,
                                "required_level": 4,
                                "gap_size": 4,
                                "is_mandatory": True,
                                "description": "Python programming is essential for AI/ML development"
                            }
                        ]
                    },
                    "High_Priority_Gaps": {"gaps": []},
                    "Development_Gaps": {"gaps": []}
                },
                "session_metadata": {
                    "session_id": "123e4567-e89b-12d3-a456-426614174000",
                    "company_id": "67d7bff4-1149-4f37-952e-af1841fb67fa"
                }
            }
        }


class ResearchParameters(BaseModel):
    """Parameters for research execution."""
    
    max_topics: int = Field(default=3, ge=1, le=10)
    max_sources_per_topic: int = Field(default=4, ge=1, le=10)
    focus_areas: Optional[List[str]] = Field(default_factory=list)
    source_preferences: Optional[List[str]] = Field(default_factory=list)
    research_depth: str = Field(default="comprehensive", regex=r'^(basic|comprehensive|deep)$')
    
    @validator('focus_areas')
    def validate_focus_areas(cls, v):
        if len(v) > 10:
            raise ValueError('Too many focus areas (max 10)')
        return v


class ResearchRequest(BaseModel):
    """Request for research agent execution."""
    
    plan_id: str = Field(..., regex=r'^[a-f0-9\-]{36}$')
    session_metadata: SessionMetadata
    research_parameters: Optional[ResearchParameters] = Field(default_factory=ResearchParameters)
    
    @validator('plan_id')
    def validate_plan_id(cls, v):
        try:
            uuid.UUID(v)
        except ValueError:
            raise ValueError('plan_id must be a valid UUID')
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "plan_id": "9ef315d4-df40-4caa-bff0-99833ccef993",
                "session_metadata": {
                    "session_id": "123e4567-e89b-12d3-a456-426614174000",
                    "company_id": "67d7bff4-1149-4f37-952e-af1841fb67fa"
                },
                "research_parameters": {
                    "max_topics": 3,
                    "max_sources_per_topic": 4,
                    "focus_areas": ["Python fundamentals", "AI/ML integration"],
                    "source_preferences": ["official_docs", "industry_guides"]
                }
            }
        }


class ContentParameters(BaseModel):
    """Parameters for content generation."""
    
    target_module: Optional[str] = None
    word_count_target: str = Field(default="4000-5000", regex=r'^\d+-\d+$')
    quality_threshold: float = Field(default=7.5, ge=0.0, le=10.0)
    enhancement_enabled: bool = Field(default=True)
    max_enhancement_attempts: int = Field(default=2, ge=0, le=5)
    priority_level: Priority = Field(default=Priority.HIGH)
    
    @validator('word_count_target')
    def validate_word_count_target(cls, v):
        try:
            min_words, max_words = v.split('-')
            min_val, max_val = int(min_words), int(max_words)
            if min_val >= max_val:
                raise ValueError('Minimum word count must be less than maximum')
            if max_val > 20000:
                raise ValueError('Maximum word count too high (max 20000)')
        except (ValueError, AttributeError):
            raise ValueError('word_count_target must be in format "min-max" (e.g., "4000-5000")')
        return v


class ContentRequest(BaseModel):
    """Request for content agent execution."""
    
    plan_id: str = Field(..., regex=r'^[a-f0-9\-]{36}$')
    research_id: str = Field(..., regex=r'^[a-f0-9\-]{36}$')
    session_metadata: SessionMetadata
    content_parameters: Optional[ContentParameters] = Field(default_factory=ContentParameters)
    
    @validator('plan_id', 'research_id')
    def validate_ids(cls, v):
        try:
            uuid.UUID(v)
        except ValueError:
            raise ValueError('ID must be a valid UUID')
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "plan_id": "9ef315d4-df40-4caa-bff0-99833ccef993",
                "research_id": "bd87f0db-bbb0-41ca-bd11-c06b33e61e43",
                "session_metadata": {
                    "session_id": "123e4567-e89b-12d3-a456-426614174000",
                    "company_id": "67d7bff4-1149-4f37-952e-af1841fb67fa"
                },
                "content_parameters": {
                    "target_module": "Introduction to Python Programming",
                    "word_count_target": "4000-5000",
                    "quality_threshold": 7.5,
                    "enhancement_enabled": True,
                    "max_enhancement_attempts": 2
                }
            }
        }