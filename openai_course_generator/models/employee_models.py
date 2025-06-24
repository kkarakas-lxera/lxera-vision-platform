"""Employee and personalization data models."""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum


class LearningStyle(str, Enum):
    """Learning style preferences."""
    VISUAL = "visual"
    AUDITORY = "auditory"
    KINESTHETIC = "kinesthetic"
    READING_WRITING = "reading_writing"
    MIXED = "mixed"


class ExperienceLevel(str, Enum):
    """Professional experience levels."""
    ENTRY_LEVEL = "entry_level"
    JUNIOR = "junior"
    MID_LEVEL = "mid_level"
    SENIOR = "senior"
    EXPERT = "expert"


class LearningPreferences(BaseModel):
    """Learning preferences and style information."""
    learning_style: Optional[LearningStyle] = None
    preferred_content_types: List[str] = Field(default_factory=list)
    preferred_activity_types: List[str] = Field(default_factory=list)
    attention_span_minutes: Optional[int] = Field(None, description="Preferred session length")
    prefers_interactive_content: bool = Field(default=True)
    prefers_real_world_examples: bool = Field(default=True)
    prefers_step_by_step_guidance: bool = Field(default=True)
    
    class Config:
        use_enum_values = True


class EmployeeProfile(BaseModel):
    """Complete employee profile for course personalization."""
    
    # Basic Information
    employee_id: str = Field(..., description="Unique employee identifier")
    full_name: str
    email: Optional[str] = None
    
    # Professional Context
    job_title_current: str
    job_title_specific: Optional[str] = None
    department: Optional[str] = None
    team: Optional[str] = None
    reporting_manager: Optional[str] = None
    
    # Experience and Skills
    experience_level: Optional[ExperienceLevel] = None
    years_in_current_role: Optional[int] = None
    years_total_experience: Optional[int] = None
    current_skills: List[str] = Field(default_factory=list)
    skill_gaps: List[str] = Field(default_factory=list)
    
    # Responsibilities and Goals
    key_responsibilities: List[str] = Field(default_factory=list)
    recent_performance_highlights: List[str] = Field(default_factory=list)
    career_aspirations_next_role: Optional[str] = None
    career_development_goals: List[str] = Field(default_factory=list)
    
    # Tools and Technology
    tools_software_used_regularly: List[str] = Field(default_factory=list)
    technology_proficiency_level: Optional[str] = None
    preferred_work_tools: List[str] = Field(default_factory=list)
    
    # Projects and Context
    current_projects: List[str] = Field(default_factory=list)
    upcoming_projects_challenges: List[str] = Field(default_factory=list)
    specific_learning_needs: List[str] = Field(default_factory=list)
    
    # Company Context
    company_name: Optional[str] = None
    company_industry: Optional[str] = None
    company_size: Optional[str] = None
    company_strategic_priorities: List[str] = Field(default_factory=list)
    department_goals_kpis: List[str] = Field(default_factory=list)
    
    # Learning Profile
    learning_preferences: Optional[LearningPreferences] = None
    previous_training_completed: List[str] = Field(default_factory=list)
    learning_time_availability: Optional[str] = None
    preferred_learning_schedule: Optional[str] = None
    
    # Additional Context
    background_education: Optional[str] = None
    certifications: List[str] = Field(default_factory=list)
    languages_spoken: List[str] = Field(default_factory=list)
    timezone: Optional[str] = None
    
    class Config:
        use_enum_values = True
    
    def get_personalization_summary(self) -> str:
        """Get a summary for personalization purposes."""
        summary_parts = [
            f"Employee: {self.full_name}",
            f"Current Role: {self.job_title_current}",
        ]
        
        if self.job_title_specific:
            summary_parts.append(f"Specific Title: {self.job_title_specific}")
        
        if self.career_aspirations_next_role:
            summary_parts.append(f"Career Goal: {self.career_aspirations_next_role}")
        
        if self.tools_software_used_regularly:
            tools_str = ", ".join(self.tools_software_used_regularly[:3])
            summary_parts.append(f"Key Tools: {tools_str}")
        
        if self.current_skills:
            skills_str = ", ".join(self.current_skills[:3])
            summary_parts.append(f"Current Skills: {skills_str}")
        
        return " | ".join(summary_parts)


class PersonalizationContext(BaseModel):
    """Context for personalizing course content."""
    
    employee_profile: EmployeeProfile
    
    # Personalization Levers
    key_skill_to_anchor_on: Optional[str] = None
    responsibility_connections: List[Dict[str, str]] = Field(default_factory=list)
    aspiration_connections: List[Dict[str, str]] = Field(default_factory=list)
    tool_integration_opportunities: List[str] = Field(default_factory=list)
    
    # Course Customization
    preferred_examples_context: List[str] = Field(default_factory=list)
    industry_specific_focus: Optional[str] = None
    role_specific_scenarios: List[str] = Field(default_factory=list)
    company_specific_context: Optional[Dict[str, Any]] = None
    
    # Content Adaptation
    complexity_level: str = Field(default="intermediate")
    content_depth_preference: str = Field(default="comprehensive")
    practical_focus_percentage: int = Field(default=70, description="Percentage of practical vs theoretical content")
    
    # Learning Path Customization
    prerequisite_knowledge_assumed: List[str] = Field(default_factory=list)
    learning_objectives_emphasis: List[str] = Field(default_factory=list)
    assessment_style_preference: List[str] = Field(default_factory=list)
    
    def generate_personalization_prompt(self) -> str:
        """Generate a prompt for content personalization."""
        profile = self.employee_profile
        
        prompt_parts = [
            f"Personalize content for {profile.full_name}, {profile.job_title_current}",
        ]
        
        if profile.career_aspirations_next_role:
            prompt_parts.append(f"Career Goal: {profile.career_aspirations_next_role}")
        
        if profile.key_responsibilities:
            responsibilities = ", ".join(profile.key_responsibilities[:2])
            prompt_parts.append(f"Key Responsibilities: {responsibilities}")
        
        if profile.tools_software_used_regularly:
            tools = ", ".join(profile.tools_software_used_regularly[:3])
            prompt_parts.append(f"Primary Tools: {tools}")
        
        if self.role_specific_scenarios:
            scenarios = ", ".join(self.role_specific_scenarios[:2])
            prompt_parts.append(f"Relevant Scenarios: {scenarios}")
        
        if profile.company_strategic_priorities:
            priorities = ", ".join(profile.company_strategic_priorities[:2])
            prompt_parts.append(f"Company Priorities: {priorities}")
        
        return ". ".join(prompt_parts) + "."
    
    def get_context_for_content_generation(self) -> Dict[str, Any]:
        """Get context dictionary for content generation."""
        return {
            "employee_name": self.employee_profile.full_name,
            "current_role": self.employee_profile.job_title_current,
            "career_aspiration": self.employee_profile.career_aspirations_next_role,
            "key_tools": self.employee_profile.tools_software_used_regularly,
            "responsibilities": self.employee_profile.key_responsibilities,
            "skill_gaps": self.employee_profile.skill_gaps,
            "company_context": self.employee_profile.company_strategic_priorities,
            "complexity_level": self.complexity_level,
            "practical_focus": self.practical_focus_percentage,
            "preferred_examples": self.preferred_examples_context,
            "role_scenarios": self.role_specific_scenarios
        }