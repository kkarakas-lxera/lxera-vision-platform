"""Course-related data models."""

from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum


class ActivityType(str, Enum):
    """Types of learning activities."""
    READING = "Reading"
    QUIZ = "Quiz"
    INTERACTIVE_SCENARIO = "Interactive_Scenario"
    VIDEO_SUMMARY = "Video_Summary"
    CODING_EXERCISE = "Coding_Exercise"
    REFLECTION_PROMPT = "Reflection_Prompt"
    PRACTICAL_EXERCISE = "Practical_Exercise"


class AssessmentType(str, Enum):
    """Types of assessments."""
    QUIZ = "Quiz"
    GRADED_EXERCISE = "Graded_Exercise"
    PEER_REVIEW_SUBMISSION = "Peer_Review_Submission"
    PROJECT_MILESTONE = "Project_Milestone"
    CASE_STUDY_ANALYSIS = "Case_Study_Analysis"


class MultimediaType(str, Enum):
    """Types of multimedia assets."""
    AUDIO = "Audio"
    VIDEO = "Video"
    ANIMATION = "Animation"
    CHART = "Chart"
    INFOGRAPHIC = "Infographic"


class LearningActivity(BaseModel):
    """Represents a single learning activity within a module."""
    activity_id: str = Field(..., description="Unique identifier for the activity")
    activity_type: ActivityType
    title: str
    description: Optional[str] = None
    estimated_duration_minutes: Optional[int] = None
    content_details: Optional[Dict[str, Any]] = None
    word_count: Optional[int] = Field(None, description="Word count for reading activities")
    
    class Config:
        use_enum_values = True


class Assessment(BaseModel):
    """Represents an assessment within a module."""
    assessment_id: str = Field(..., description="Unique identifier for the assessment")
    assessment_type: AssessmentType
    title: str
    description: Optional[str] = None
    weight_in_module_grade: Optional[float] = None
    criteria: List[str] = Field(default_factory=list)
    content_details: Optional[Dict[str, Any]] = None
    estimated_duration_minutes: Optional[int] = None
    
    class Config:
        use_enum_values = True


class MultimediaAsset(BaseModel):
    """Represents a multimedia asset."""
    asset_id: str = Field(..., description="Unique identifier for the asset")
    asset_type: MultimediaType
    title: str
    description: Optional[str] = None
    file_path: str
    file_size_mb: Optional[float] = None
    duration_seconds: Optional[float] = None
    resolution: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    
    class Config:
        use_enum_values = True


class CourseModule(BaseModel):
    """Represents a single module within the course."""
    module_id: str = Field(..., description="Unique identifier for the module")
    module_name: str
    module_description: Optional[str] = None
    week_number: int = Field(..., description="Which week this module belongs to")
    module_number_in_week: int = Field(..., description="Position within the week")
    
    # Learning structure
    learning_objectives: List[str] = Field(default_factory=list)
    key_concepts: List[str] = Field(default_factory=list)
    
    # Content
    content: Optional[str] = Field(None, description="Main textual content")
    word_count: Optional[int] = Field(None, description="Word count of main content")
    
    # Activities and assessments
    activities: List[LearningActivity] = Field(default_factory=list)
    assessments: List[Assessment] = Field(default_factory=list)
    
    # Multimedia
    multimedia_assets: List[MultimediaAsset] = Field(default_factory=list)
    
    # Time estimates
    target_minutes: Optional[int] = Field(None, description="Target learning time")
    estimated_reading_minutes: Optional[float] = None
    estimated_activity_minutes: Optional[float] = None
    estimated_assessment_minutes: Optional[float] = None
    total_estimated_minutes: Optional[float] = None
    
    # Research and citations
    research_sources: List[Dict[str, Any]] = Field(default_factory=list)
    citations: List[str] = Field(default_factory=list)
    
    # Quality metrics
    quality_score: Optional[float] = None
    quality_feedback: Optional[Dict[str, Any]] = None
    
    # Generation metadata
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None
    generated_by_agent: Optional[str] = None


class CourseWeek(BaseModel):
    """Represents a week within the course."""
    week_number: int
    week_title: str
    week_description: Optional[str] = None
    week_theme: Optional[str] = None
    
    modules: List[CourseModule] = Field(default_factory=list)
    
    # Week-level assessments
    weekly_quiz: Optional[Dict[str, Any]] = None
    week_project: Optional[Dict[str, Any]] = None
    
    # Time estimates
    target_minutes: Optional[int] = None
    total_estimated_minutes: Optional[float] = None
    
    # Week objectives
    week_objectives: List[str] = Field(default_factory=list)


class CourseStructure(BaseModel):
    """Represents the complete course structure."""
    course_id: str = Field(..., description="Unique identifier for the course")
    course_title: str
    course_description: Optional[str] = None
    
    # Course metadata
    target_audience: Optional[str] = None
    difficulty_level: Optional[str] = None
    estimated_duration_hours: Optional[float] = None
    
    # Structure
    weeks: List[CourseWeek] = Field(default_factory=list)
    total_weeks: int = Field(default=4)
    total_modules: int = Field(default=16)
    
    # Course-level objectives and skills
    course_objectives: List[str] = Field(default_factory=list)
    skills_covered: List[str] = Field(default_factory=list)
    prerequisites: List[str] = Field(default_factory=list)
    
    # Personalization
    personalized_for_employee: Optional[str] = None
    personalization_context: Optional[Dict[str, Any]] = None
    
    # Quality and completion
    overall_quality_score: Optional[float] = None
    completion_status: str = Field(default="in_progress")
    
    # Generation metadata
    created_at: datetime = Field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    generated_by_system: str = Field(default="OpenAI Agents Course Generator")
    
    def get_total_modules(self) -> int:
        """Get total number of modules across all weeks."""
        return sum(len(week.modules) for week in self.weeks)
    
    def get_total_estimated_time(self) -> float:
        """Get total estimated learning time in minutes."""
        total = 0.0
        for week in self.weeks:
            for module in week.modules:
                if module.total_estimated_minutes:
                    total += module.total_estimated_minutes
        return total
    
    def get_completion_percentage(self) -> float:
        """Get percentage of modules completed."""
        if not self.weeks:
            return 0.0
        
        total_modules = self.get_total_modules()
        completed_modules = sum(
            1 for week in self.weeks 
            for module in week.modules 
            if module.quality_score and module.quality_score >= 7.5
        )
        
        return (completed_modules / total_modules) * 100.0 if total_modules > 0 else 0.0