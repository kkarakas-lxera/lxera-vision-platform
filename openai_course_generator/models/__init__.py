"""Data models for OpenAI Agents Course Generator."""

from .course_models import (
    CourseModule,
    CourseWeek, 
    CourseStructure,
    LearningActivity,
    Assessment,
    MultimediaAsset
)
from .employee_models import (
    EmployeeProfile,
    PersonalizationContext,
    LearningPreferences
)
from .workflow_models import (
    ResearchResult,
    ContentGenerationResult,
    QualityAssessment,
    MultimediaResult,
    CourseGenerationStatus
)

__all__ = [
    "CourseModule",
    "CourseWeek", 
    "CourseStructure",
    "LearningActivity",
    "Assessment",
    "MultimediaAsset",
    "EmployeeProfile",
    "PersonalizationContext", 
    "LearningPreferences",
    "ResearchResult",
    "ContentGenerationResult",
    "QualityAssessment",
    "MultimediaResult",
    "CourseGenerationStatus"
]