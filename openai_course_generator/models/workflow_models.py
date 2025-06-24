"""Workflow and process data models."""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum


class WorkflowStatus(str, Enum):
    """Status of workflow processes."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    RETRYING = "retrying"


class AgentType(str, Enum):
    """Types of agents in the system."""
    COORDINATOR = "coordinator"
    RESEARCH = "research"
    CONTENT = "content"
    QUALITY = "quality"
    MULTIMEDIA = "multimedia"
    FINALIZER = "finalizer"


class QualityLevel(str, Enum):
    """Quality assessment levels."""
    EXCELLENT = "excellent"
    GOOD = "good"
    SATISFACTORY = "satisfactory"
    NEEDS_IMPROVEMENT = "needs_improvement"
    INADEQUATE = "inadequate"


class ResearchResult(BaseModel):
    """Result from research agent processing."""
    research_id: str = Field(..., description="Unique identifier for research session")
    module_topic: str
    query_count: int = Field(default=0)
    sources_found: int = Field(default=0)
    
    # Research content
    synthesized_knowledge: Dict[str, Any] = Field(default_factory=dict)
    source_citations: List[str] = Field(default_factory=list)
    key_concepts: List[str] = Field(default_factory=list)
    research_summary: Optional[str] = None
    
    # Quality metrics
    source_credibility_score: Optional[float] = None
    content_depth_score: Optional[float] = None
    relevance_score: Optional[float] = None
    
    # Metadata
    research_duration_minutes: Optional[float] = None
    research_timestamp: datetime = Field(default_factory=datetime.now)
    research_agent_version: str = Field(default="1.0")
    
    # Status
    status: WorkflowStatus = WorkflowStatus.PENDING
    error_message: Optional[str] = None


class ContentGenerationResult(BaseModel):
    """Result from content agent processing."""
    content_id: str = Field(..., description="Unique identifier for content generation")
    module_name: str
    
    # Generated content
    main_content: str
    activities: List[Dict[str, Any]] = Field(default_factory=list)
    assessments: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Content metrics
    word_count: int = Field(default=0)
    reading_content_percentage: Optional[float] = None
    estimated_learning_minutes: Optional[float] = None
    
    # Personalization
    personalized_for_employee: Optional[str] = None
    personalization_elements_count: int = Field(default=0)
    
    # Generation metadata
    content_generation_duration_minutes: Optional[float] = None
    generation_timestamp: datetime = Field(default_factory=datetime.now)
    content_agent_version: str = Field(default="1.0")
    
    # Status
    status: WorkflowStatus = WorkflowStatus.PENDING
    error_message: Optional[str] = None
    
    def meets_word_count_requirement(self) -> bool:
        """Check if content meets word count requirement (6750-8250)."""
        return 6750 <= self.word_count <= 8250


class QualityAssessment(BaseModel):
    """Quality assessment result."""
    assessment_id: str = Field(..., description="Unique identifier for quality assessment")
    content_id: str = Field(..., description="Reference to assessed content")
    module_name: str
    
    # Quality scores (0-10 scale)
    overall_quality_score: float = Field(..., ge=0, le=10)
    content_depth_score: float = Field(..., ge=0, le=10)
    personalization_score: float = Field(..., ge=0, le=10)
    structure_clarity_score: float = Field(..., ge=0, le=10)
    learning_objective_coverage_score: float = Field(..., ge=0, le=10)
    
    # Word count validation
    word_count: int
    word_count_compliant: bool
    word_count_variance: float = Field(default=0.0, description="Percentage variance from target")
    
    # Blueprint compliance
    blueprint_compliant: bool = Field(default=False)
    blueprint_compliance_details: Dict[str, Any] = Field(default_factory=dict)
    
    # Quality level
    quality_level: QualityLevel
    
    # Feedback and recommendations
    strengths: List[str] = Field(default_factory=list)
    areas_for_improvement: List[str] = Field(default_factory=list)
    specific_feedback: Optional[str] = None
    enhancement_suggestions: List[str] = Field(default_factory=list)
    
    # Assessment metadata
    assessment_duration_minutes: Optional[float] = None
    assessment_timestamp: datetime = Field(default_factory=datetime.now)
    quality_agent_version: str = Field(default="1.0")
    
    # Decision
    approved_for_next_stage: bool = Field(default=False)
    requires_revision: bool = Field(default=False)
    requires_research_supplement: bool = Field(default=False)
    
    def passes_quality_gates(self) -> bool:
        """Check if content passes all quality gates."""
        return (
            self.overall_quality_score >= 7.5 and
            self.word_count_compliant and
            self.blueprint_compliant and
            self.approved_for_next_stage
        )


class MultimediaResult(BaseModel):
    """Result from multimedia agent processing."""
    multimedia_id: str = Field(..., description="Unique identifier for multimedia generation")
    module_name: str
    
    # Generated assets
    audio_assets: List[Dict[str, Any]] = Field(default_factory=list)
    video_assets: List[Dict[str, Any]] = Field(default_factory=list)
    animation_assets: List[Dict[str, Any]] = Field(default_factory=list)
    chart_assets: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Asset metadata
    total_audio_duration_seconds: Optional[float] = None
    total_video_duration_seconds: Optional[float] = None
    video_resolution: Optional[str] = None
    audio_quality: Optional[str] = None
    
    # File information
    total_file_size_mb: Optional[float] = None
    output_formats: List[str] = Field(default_factory=list)
    asset_file_paths: List[str] = Field(default_factory=list)
    
    # Branding and personalization
    branding_applied: bool = Field(default=False)
    employee_personalization_applied: bool = Field(default=False)
    personalized_for_employee: Optional[str] = None
    
    # Generation metadata
    multimedia_generation_duration_minutes: Optional[float] = None
    generation_timestamp: datetime = Field(default_factory=datetime.now)
    multimedia_agent_version: str = Field(default="1.0")
    
    # Status
    status: WorkflowStatus = WorkflowStatus.PENDING
    error_message: Optional[str] = None


class CourseGenerationStatus(BaseModel):
    """Overall course generation status and progress."""
    generation_id: str = Field(..., description="Unique identifier for course generation")
    course_title: str
    
    # Employee information
    employee_name: str
    employee_role: str
    
    # Progress tracking
    total_modules_planned: int = Field(default=16)
    modules_completed: int = Field(default=0)
    current_module_index: int = Field(default=0)
    current_module_name: Optional[str] = None
    current_agent_processing: Optional[AgentType] = None
    
    # Stage completion status
    research_completed_modules: List[str] = Field(default_factory=list)
    content_completed_modules: List[str] = Field(default_factory=list)
    quality_approved_modules: List[str] = Field(default_factory=list)
    multimedia_completed_modules: List[str] = Field(default_factory=list)
    finalized_modules: List[str] = Field(default_factory=list)
    
    # Overall metrics
    total_content_word_count: int = Field(default=0)
    total_estimated_learning_hours: Optional[float] = None
    average_quality_score: Optional[float] = None
    
    # Timing information
    generation_started_at: datetime = Field(default_factory=datetime.now)
    estimated_completion_time: Optional[datetime] = None
    actual_completion_time: Optional[datetime] = None
    
    # Status
    overall_status: WorkflowStatus = WorkflowStatus.PENDING
    current_stage: str = Field(default="initialization")
    error_messages: List[str] = Field(default_factory=list)
    
    def get_completion_percentage(self) -> float:
        """Calculate overall completion percentage."""
        if self.total_modules_planned == 0:
            return 0.0
        return (self.modules_completed / self.total_modules_planned) * 100.0
    
    def get_current_stage_progress(self) -> Dict[str, float]:
        """Get progress for each stage."""
        if self.total_modules_planned == 0:
            return {stage: 0.0 for stage in ["research", "content", "quality", "multimedia", "finalized"]}
        
        return {
            "research": (len(self.research_completed_modules) / self.total_modules_planned) * 100.0,
            "content": (len(self.content_completed_modules) / self.total_modules_planned) * 100.0,
            "quality": (len(self.quality_approved_modules) / self.total_modules_planned) * 100.0,
            "multimedia": (len(self.multimedia_completed_modules) / self.total_modules_planned) * 100.0,
            "finalized": (len(self.finalized_modules) / self.total_modules_planned) * 100.0
        }
    
    def is_complete(self) -> bool:
        """Check if course generation is complete."""
        return (
            self.overall_status == WorkflowStatus.COMPLETED and
            self.modules_completed >= self.total_modules_planned and
            len(self.finalized_modules) >= self.total_modules_planned
        )


class AgentHandoffContext(BaseModel):
    """Context passed between agents during handoffs."""
    handoff_id: str = Field(..., description="Unique identifier for handoff")
    from_agent: AgentType
    to_agent: AgentType
    
    # Context data
    module_context: Dict[str, Any] = Field(default_factory=dict)
    employee_context: Dict[str, Any] = Field(default_factory=dict)
    previous_results: Dict[str, Any] = Field(default_factory=dict)
    
    # Instructions for receiving agent
    specific_instructions: Optional[str] = None
    priority_requirements: List[str] = Field(default_factory=list)
    quality_expectations: Dict[str, Any] = Field(default_factory=dict)
    
    # Handoff metadata
    handoff_timestamp: datetime = Field(default_factory=datetime.now)
    handoff_reason: Optional[str] = None
    
    class Config:
        use_enum_values = True