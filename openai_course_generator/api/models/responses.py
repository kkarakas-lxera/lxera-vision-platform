"""
Pydantic response models for the Lxera Agent Pipeline API.

These models define the structure of responses returned by the
planning, research, and content generation endpoints.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum


class ExecutionStatus(str, Enum):
    """Execution status values."""
    SUCCESS = "success"
    FAILED = "failed"
    PARTIAL = "partial"


class AgentType(str, Enum):
    """Agent type identifiers."""
    PLANNING = "planning"
    RESEARCH = "research"
    CONTENT = "content"


class TraceInfo(BaseModel):
    """OpenAI trace information."""
    
    openai_trace_url: Optional[str] = None
    visible_in_traces: bool = True
    trace_id: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "openai_trace_url": "https://platform.openai.com/traces/tr_abc123",
                "visible_in_traces": True,
                "trace_id": "tr_abc123"
            }
        }


class ExecutionSummary(BaseModel):
    """Summary of agent execution metrics."""
    
    execution_time_seconds: float = Field(..., ge=0)
    agent_turns: int = Field(..., ge=0)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: ExecutionStatus
    
    class Config:
        schema_extra = {
            "example": {
                "execution_time_seconds": 45.2,
                "agent_turns": 6,
                "timestamp": "2024-12-30T10:30:00Z",
                "status": "success"
            }
        }


class NextStep(BaseModel):
    """Information about the next step in the pipeline."""
    
    endpoint: str
    required_params: List[str]
    description: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "endpoint": "/api/v1/research/execute",
                "required_params": ["plan_id"],
                "description": "Execute research phase using the generated plan"
            }
        }


class PlanningExecutionSummary(ExecutionSummary):
    """Planning-specific execution summary."""
    
    course_title: str
    total_modules: int = Field(..., ge=0)
    duration_weeks: int = Field(..., ge=1, le=52)
    skill_gaps_addressed: int = Field(..., ge=0)
    
    class Config:
        schema_extra = {
            "example": {
                "course_title": "Python for AI/ML Professionals",
                "total_modules": 12,
                "duration_weeks": 4,
                "skill_gaps_addressed": 3,
                "execution_time_seconds": 45.2,
                "agent_turns": 6,
                "timestamp": "2024-12-30T10:30:00Z",
                "status": "success"
            }
        }


class PlanningResponse(BaseModel):
    """Response from planning agent execution."""
    
    success: bool
    plan_id: str = Field(..., regex=r'^[a-f0-9\-]{36}$')
    execution_summary: PlanningExecutionSummary
    traces: TraceInfo
    next_step: NextStep
    error: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "plan_id": "9ef315d4-df40-4caa-bff0-99833ccef993",
                "execution_summary": {
                    "course_title": "Python for AI/ML Professionals",
                    "total_modules": 12,
                    "duration_weeks": 4,
                    "skill_gaps_addressed": 3,
                    "execution_time_seconds": 45.2,
                    "agent_turns": 6,
                    "timestamp": "2024-12-30T10:30:00Z",
                    "status": "success"
                },
                "traces": {
                    "openai_trace_url": "https://platform.openai.com/traces/tr_abc123",
                    "visible_in_traces": True
                },
                "next_step": {
                    "endpoint": "/api/v1/research/execute",
                    "required_params": ["plan_id"]
                }
            }
        }


class ResearchTopic(BaseModel):
    """Individual research topic summary."""
    
    topic: str
    sources_found: int = Field(..., ge=0)
    quality_score: float = Field(..., ge=0.0, le=10.0)
    key_insights: List[str] = Field(default_factory=list)
    
    class Config:
        schema_extra = {
            "example": {
                "topic": "Python Programming Fundamentals",
                "sources_found": 4,
                "quality_score": 8.5,
                "key_insights": [
                    "Modern Python features for ML workflows",
                    "Best practices for production Python code"
                ]
            }
        }


class ResearchPreview(BaseModel):
    """Preview of research findings."""
    
    topics_covered: List[str]
    key_insights: List[str] = Field(default_factory=list)
    total_sources: int = Field(..., ge=0)
    research_quality: float = Field(..., ge=0.0, le=10.0)
    topics_detail: List[ResearchTopic] = Field(default_factory=list)
    
    class Config:
        schema_extra = {
            "example": {
                "topics_covered": [
                    "Python Programming Fundamentals",
                    "Python for Machine Learning",
                    "LangChain Integration with Python"
                ],
                "key_insights": [
                    "Python foundations critical for AI/ML professionals",
                    "Modern Python patterns for ML workflows"
                ],
                "total_sources": 12,
                "research_quality": 8.5
            }
        }


class ResearchExecutionSummary(ExecutionSummary):
    """Research-specific execution summary."""
    
    total_topics: int = Field(..., ge=0)
    total_sources: int = Field(..., ge=0)
    synthesis_quality: float = Field(..., ge=0.0, le=10.0)
    
    class Config:
        schema_extra = {
            "example": {
                "total_topics": 3,
                "total_sources": 12,
                "synthesis_quality": 8.5,
                "execution_time_seconds": 120.4,
                "agent_turns": 8,
                "timestamp": "2024-12-30T10:35:00Z",
                "status": "success"
            }
        }


class ResearchResponse(BaseModel):
    """Response from research agent execution."""
    
    success: bool
    research_id: str = Field(..., regex=r'^[a-f0-9\-]{36}$')
    plan_id: str = Field(..., regex=r'^[a-f0-9\-]{36}$')
    execution_summary: ResearchExecutionSummary
    research_preview: ResearchPreview
    traces: TraceInfo
    next_step: NextStep
    error: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "research_id": "bd87f0db-bbb0-41ca-bd11-c06b33e61e43",
                "plan_id": "9ef315d4-df40-4caa-bff0-99833ccef993",
                "execution_summary": {
                    "total_topics": 3,
                    "total_sources": 12,
                    "synthesis_quality": 8.5,
                    "execution_time_seconds": 120.4,
                    "agent_turns": 8,
                    "timestamp": "2024-12-30T10:35:00Z",
                    "status": "success"
                },
                "research_preview": {
                    "topics_covered": ["Python Programming", "ML Integration"],
                    "total_sources": 12,
                    "research_quality": 8.5
                },
                "traces": {
                    "openai_trace_url": "https://platform.openai.com/traces/tr_def456",
                    "visible_in_traces": True
                },
                "next_step": {
                    "endpoint": "/api/v1/content/execute",
                    "required_params": ["plan_id", "research_id"]
                }
            }
        }


class SectionQualityAssessment(BaseModel):
    """Quality assessment for a content section."""
    
    section: str
    score: float = Field(..., ge=0.0, le=10.0)
    passed: bool
    enhancement_attempts: int = Field(..., ge=0)
    word_count: int = Field(..., ge=0)
    feedback: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "section": "introduction",
                "score": 8.6,
                "passed": True,
                "enhancement_attempts": 0,
                "word_count": 546,
                "feedback": "High quality introduction with good engagement"
            }
        }


class ContentPreview(BaseModel):
    """Preview of generated content."""
    
    module_name: str
    sections: List[str]
    total_word_count: int = Field(..., ge=0)
    status: str
    quality_summary: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "module_name": "Introduction to Python Programming",
                "sections": ["introduction", "core_content", "practical_applications", "case_studies", "assessments"],
                "total_word_count": 3357,
                "status": "ready_for_multimedia",
                "quality_summary": "All sections passed quality assessment"
            }
        }


class ContentExecutionSummary(ExecutionSummary):
    """Content-specific execution summary."""
    
    total_word_count: int = Field(..., ge=0)
    sections_generated: int = Field(..., ge=0)
    quality_assessments: List[SectionQualityAssessment] = Field(default_factory=list)
    enhancement_sessions: int = Field(..., ge=0)
    
    class Config:
        schema_extra = {
            "example": {
                "total_word_count": 3357,
                "sections_generated": 5,
                "quality_assessments": [
                    {
                        "section": "introduction",
                        "score": 8.6,
                        "passed": True,
                        "enhancement_attempts": 0,
                        "word_count": 546
                    }
                ],
                "enhancement_sessions": 2,
                "execution_time_seconds": 180.7,
                "agent_turns": 13,
                "timestamp": "2024-12-30T10:40:00Z",
                "status": "success"
            }
        }


class ContentResponse(BaseModel):
    """Response from content agent execution."""
    
    success: bool
    content_id: str = Field(..., regex=r'^[a-f0-9\-]{36}$')
    plan_id: str = Field(..., regex=r'^[a-f0-9\-]{36}$')
    research_id: str = Field(..., regex=r'^[a-f0-9\-]{36}$')
    execution_summary: ContentExecutionSummary
    content_preview: ContentPreview
    traces: TraceInfo
    next_steps: List[str] = Field(default_factory=list)
    error: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "content_id": "eafa1937-1353-4f6d-b08c-c42a420b9d75",
                "plan_id": "9ef315d4-df40-4caa-bff0-99833ccef993",
                "research_id": "bd87f0db-bbb0-41ca-bd11-c06b33e61e43",
                "execution_summary": {
                    "total_word_count": 3357,
                    "sections_generated": 5,
                    "enhancement_sessions": 2,
                    "execution_time_seconds": 180.7,
                    "agent_turns": 13,
                    "timestamp": "2024-12-30T10:40:00Z",
                    "status": "success"
                },
                "content_preview": {
                    "module_name": "Introduction to Python Programming",
                    "sections": ["introduction", "core_content", "practical_applications"],
                    "total_word_count": 3357,
                    "status": "ready_for_multimedia"
                },
                "traces": {
                    "openai_trace_url": "https://platform.openai.com/traces/tr_ghi789",
                    "visible_in_traces": True
                },
                "next_steps": [
                    "multimedia_generation",
                    "final_review",
                    "deployment"
                ]
            }
        }


class ErrorResponse(BaseModel):
    """Error response model."""
    
    success: bool = False
    error_code: str
    message: str
    details: Optional[str] = None
    request_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        schema_extra = {
            "example": {
                "success": False,
                "error_code": "PLANNING_FAILED",
                "message": "Failed to generate course structure",
                "details": "OpenAI API timeout during planning phase",
                "request_id": "req_123456789",
                "timestamp": "2024-12-30T10:30:00Z"
            }
        }


class StatusResponse(BaseModel):
    """Status check response for any agent execution."""
    
    agent_type: AgentType
    execution_id: str = Field(..., regex=r'^[a-f0-9\-]{36}$')
    status: ExecutionStatus
    progress: float = Field(..., ge=0.0, le=100.0)
    current_step: Optional[str] = None
    estimated_completion: Optional[datetime] = None
    error: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "agent_type": "content",
                "execution_id": "eafa1937-1353-4f6d-b08c-c42a420b9d75",
                "status": "success",
                "progress": 100.0,
                "current_step": "completed",
                "estimated_completion": None
            }
        }