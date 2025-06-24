#!/usr/bin/env python3
"""
Personalized Course Structure - Dynamic course outline generation

This module creates adaptive, personalized course structures based on:
- Individual skill gaps and learning priorities
- Career progression requirements and timelines
- Tool proficiency levels and workplace context
- Learning style preferences and difficulty progression
- Real-world application scenarios and company goals
"""

import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Tuple
from openai import OpenAI

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PersonalizedCourseStructure:
    """Generates dynamic, adaptive course structures tailored to individual learners."""
    
    def __init__(self, openai_api_key: str = None):
        """Initialize the course structure generator."""
        self.openai_api_key = openai_api_key or os.getenv('OPENAI_API_KEY', '')
        self.client = OpenAI(api_key=self.openai_api_key)
        
        # Course structure templates by role and experience level
        self.structure_templates = {
            "junior_analyst": {
                "total_weeks": 4,
                "modules_per_week": 8-10,
                "foundation_emphasis": 0.4,
                "practical_emphasis": 0.6,
                "progression_rate": "gradual"
            },
            "mid_analyst": {
                "total_weeks": 4,
                "modules_per_week": 9-11,
                "foundation_emphasis": 0.3,
                "practical_emphasis": 0.7,
                "progression_rate": "moderate"
            },
            "senior_analyst": {
                "total_weeks": 3,
                "modules_per_week": 10-12,
                "foundation_emphasis": 0.2,
                "practical_emphasis": 0.8,
                "progression_rate": "accelerated"
            }
        }
        
        logger.info("🏗️ Personalized Course Structure Generator initialized")

    def generate_adaptive_course_outline(
        self,
        employee_profile: Dict[str, Any],
        prioritized_gaps: Dict[str, Any],
        learning_objectives: List[str],
        constraints: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Generate a complete adaptive course outline."""
        
        logger.info(f"🏗️ Generating adaptive course outline for {employee_profile.get('full_name')}")
        
        # Analyze learner requirements
        learner_analysis = self._analyze_learner_requirements(employee_profile, prioritized_gaps)
        
        # Generate course framework
        course_framework = self._generate_course_framework(learner_analysis, learning_objectives, constraints)
        
        # Create detailed week-by-week structure
        weekly_structure = self._create_weekly_structure(course_framework, learner_analysis)
        
        # Generate module specifications
        module_specifications = self._generate_module_specifications(weekly_structure, learner_analysis)
        
        # Create learning path optimization
        learning_path = self._optimize_learning_path(module_specifications, learner_analysis)
        
        # Compile comprehensive course outline
        course_outline = {
            "course_metadata": {
                "generated_for": employee_profile.get("full_name", "Unknown"),
                "generation_timestamp": datetime.now().isoformat(),
                "structure_version": "personalized_course_structure_v1",
                "adaptation_level": "comprehensive"
            },
            "learner_analysis": learner_analysis,
            "course_framework": course_framework,
            "weekly_structure": weekly_structure,
            "module_specifications": module_specifications,
            "learning_path_optimization": learning_path,
            "assessment_strategy": self._design_assessment_strategy(module_specifications, learner_analysis),
            "personalization_features": self._define_personalization_features(learner_analysis),
            "success_tracking": self._design_success_tracking(learner_analysis)
        }
        
        logger.info(f"✅ Adaptive course outline generated with {len(module_specifications)} modules")
        return course_outline

    def _analyze_learner_requirements(
        self,
        employee_profile: Dict[str, Any],
        prioritized_gaps: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze learner requirements for personalized course design."""
        
        # Extract key learner characteristics
        experience_level = employee_profile.get("experience_level", "junior")
        learning_style = employee_profile.get("learning_style", "")
        career_timeline = employee_profile.get("career_path", {}).get("timeline", "2-3 years")
        current_role = employee_profile.get("current_role", "")
        tool_proficiency = employee_profile.get("skill_inventory", {}).get("tool_proficiency", {})
        
        # Analyze skill gap priorities
        critical_gaps = prioritized_gaps.get("critical_priority", [])
        high_priority_gaps = prioritized_gaps.get("high_priority", [])
        
        # Determine learning preferences
        learning_preferences = self._extract_learning_preferences(learning_style, experience_level)
        
        # Calculate time constraints
        time_constraints = self._calculate_time_constraints(career_timeline, len(critical_gaps))
        
        # Assess complexity requirements
        complexity_requirements = self._assess_complexity_requirements(experience_level, critical_gaps)
        
        learner_analysis = {
            "learner_profile": {
                "experience_level": experience_level,
                "role_context": current_role,
                "career_urgency": self._assess_career_urgency(career_timeline),
                "technical_readiness": self._assess_technical_readiness(tool_proficiency)
            },
            "gap_analysis": {
                "critical_skill_count": len(critical_gaps),
                "high_priority_count": len(high_priority_gaps),
                "total_gap_score": sum(gap.get("priority_score", 0) for gap in critical_gaps + high_priority_gaps),
                "focus_distribution": self._calculate_focus_distribution(prioritized_gaps)
            },
            "learning_requirements": {
                "preferred_style": learning_preferences,
                "complexity_level": complexity_requirements,
                "time_constraints": time_constraints,
                "practical_emphasis": learning_preferences.get("practical_weight", 0.7)
            },
            "contextual_factors": {
                "workplace_tools": list(tool_proficiency.keys()),
                "immediate_applications": employee_profile.get("contextual_factors", {}).get("upcoming_projects", []),
                "company_priorities": employee_profile.get("contextual_factors", {}).get("company_priorities", [])
            }
        }
        
        return learner_analysis

    def _extract_learning_preferences(self, learning_style: str, experience_level: str) -> Dict[str, Any]:
        """Extract learning preferences from profile data."""
        
        preferences = {
            "delivery_method": "mixed",
            "practical_weight": 0.7,
            "theoretical_weight": 0.3,
            "example_preference": "real_world",
            "progression_pace": "moderate"
        }
        
        if learning_style:
            style_lower = learning_style.lower()
            
            if "practical" in style_lower:
                preferences["practical_weight"] = 0.8
                preferences["theoretical_weight"] = 0.2
                preferences["example_preference"] = "hands_on"
            
            if "real-world" in style_lower or "examples" in style_lower:
                preferences["example_preference"] = "case_studies"
            
            if "problem-solving" in style_lower:
                preferences["delivery_method"] = "problem_based"
        
        # Adjust based on experience level
        if experience_level in ["junior", "junior_plus"]:
            preferences["progression_pace"] = "gradual"
            preferences["theoretical_weight"] = min(0.4, preferences["theoretical_weight"] + 0.1)
        elif experience_level == "senior":
            preferences["progression_pace"] = "accelerated"
            preferences["practical_weight"] = min(0.9, preferences["practical_weight"] + 0.1)
        
        return preferences

    def _calculate_time_constraints(self, career_timeline: str, gap_count: int) -> Dict[str, Any]:
        """Calculate time constraints based on career goals and skill gaps."""
        
        # Parse timeline
        if "1-2" in career_timeline or "within 2" in career_timeline:
            urgency = "high"
            available_weeks = 3
        elif "2-3" in career_timeline:
            urgency = "moderate"
            available_weeks = 4
        else:
            urgency = "low"
            available_weeks = 5
        
        # Adjust based on gap count
        if gap_count > 5:
            intensity = "high"
            hours_per_week = 8-10
        elif gap_count > 3:
            intensity = "moderate"
            hours_per_week = 6-8
        else:
            intensity = "low"
            hours_per_week = 4-6
        
        return {
            "urgency": urgency,
            "available_weeks": available_weeks,
            "intensity": intensity,
            "hours_per_week": hours_per_week,
            "total_hours": available_weeks * (hours_per_week + 2) / 2  # Average
        }

    def _assess_complexity_requirements(self, experience_level: str, critical_gaps: List[Dict]) -> str:
        """Assess appropriate complexity level for the learner."""
        
        gap_complexity = sum(1 for gap in critical_gaps if "advanced" in gap.get("skill", "").lower())
        
        if experience_level == "junior" and gap_complexity == 0:
            return "foundational"
        elif experience_level == "junior" and gap_complexity > 0:
            return "foundational_to_intermediate"
        elif experience_level == "mid":
            return "intermediate"
        elif experience_level == "senior":
            return "intermediate_to_advanced"
        else:
            return "foundational"

    def _assess_career_urgency(self, career_timeline: str) -> str:
        """Assess career advancement urgency."""
        
        if "1" in career_timeline or "immediate" in career_timeline.lower():
            return "immediate"
        elif "2" in career_timeline:
            return "short_term"
        elif "3" in career_timeline:
            return "medium_term"
        else:
            return "long_term"

    def _assess_technical_readiness(self, tool_proficiency: Dict[str, Any]) -> str:
        """Assess technical readiness level."""
        
        if not tool_proficiency:
            return "basic"
        
        proficiency_levels = [tools.get("proficiency", "basic") for tools in tool_proficiency.values()]
        
        if "advanced" in proficiency_levels:
            return "advanced"
        elif "intermediate" in proficiency_levels:
            return "intermediate"
        else:
            return "basic"

    def _calculate_focus_distribution(self, prioritized_gaps: Dict[str, Any]) -> Dict[str, float]:
        """Calculate how to distribute focus across different gap types."""
        
        critical_count = len(prioritized_gaps.get("critical_priority", []))
        high_count = len(prioritized_gaps.get("high_priority", []))
        medium_count = len(prioritized_gaps.get("medium_priority", []))
        
        total_gaps = critical_count + high_count + medium_count
        
        if total_gaps == 0:
            return {"critical": 1.0, "high": 0.0, "medium": 0.0}
        
        return {
            "critical": critical_count / total_gaps,
            "high": high_count / total_gaps,
            "medium": medium_count / total_gaps
        }

    def _generate_course_framework(
        self,
        learner_analysis: Dict[str, Any],
        learning_objectives: List[str],
        constraints: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Generate the overall course framework."""
        
        experience_level = learner_analysis["learner_profile"]["experience_level"]
        time_constraints = learner_analysis["learning_requirements"]["time_constraints"]
        gap_analysis = learner_analysis["gap_analysis"]
        
        # Select appropriate template
        template_key = self._select_structure_template(experience_level)
        template = self.structure_templates.get(template_key, self.structure_templates["junior_analyst"])
        
        # Adjust template based on constraints
        if constraints:
            max_weeks = constraints.get("max_weeks", template["total_weeks"])
            template["total_weeks"] = min(template["total_weeks"], max_weeks)
        
        # Adapt to time constraints
        if time_constraints["urgency"] == "high":
            template["total_weeks"] = min(3, template["total_weeks"])
            template["modules_per_week"] = "10-12"
        
        course_framework = {
            "structure_template": template_key,
            "course_duration": {
                "total_weeks": template["total_weeks"],
                "modules_per_week": template["modules_per_week"],
                "estimated_hours_per_week": time_constraints["hours_per_week"],
                "total_estimated_hours": template["total_weeks"] * time_constraints["hours_per_week"]
            },
            "content_distribution": {
                "foundation_percentage": template["foundation_emphasis"],
                "practical_percentage": template["practical_emphasis"],
                "critical_gaps_focus": gap_analysis["focus_distribution"]["critical"],
                "high_priority_focus": gap_analysis["focus_distribution"]["high"]
            },
            "learning_progression": {
                "progression_rate": template["progression_rate"],
                "difficulty_curve": self._define_difficulty_curve(template["total_weeks"]),
                "skill_building_sequence": self._define_skill_sequence(learner_analysis)
            },
            "personalization_factors": {
                "tool_integration_emphasis": 0.3 if learner_analysis["learner_profile"]["technical_readiness"] == "advanced" else 0.5,
                "real_world_application_weight": learner_analysis["learning_requirements"]["practical_emphasis"],
                "career_alignment_factor": 0.8 if learner_analysis["learner_profile"]["career_urgency"] == "immediate" else 0.6
            }
        }
        
        return course_framework

    def _select_structure_template(self, experience_level: str) -> str:
        """Select appropriate structure template based on experience level."""
        
        if experience_level in ["junior", "junior_plus"]:
            return "junior_analyst"
        elif experience_level == "mid":
            return "mid_analyst"
        elif experience_level == "senior":
            return "senior_analyst"
        else:
            return "junior_analyst"

    def _define_difficulty_curve(self, total_weeks: int) -> List[str]:
        """Define difficulty progression curve."""
        
        if total_weeks == 3:
            return ["foundational", "intermediate", "advanced"]
        elif total_weeks == 4:
            return ["foundational", "foundational_plus", "intermediate", "advanced"]
        else:
            return ["foundational", "foundational_plus", "intermediate", "intermediate_plus", "advanced"]

    def _define_skill_sequence(self, learner_analysis: Dict[str, Any]) -> List[str]:
        """Define optimal skill building sequence."""
        
        technical_readiness = learner_analysis["learner_profile"]["technical_readiness"]
        
        if technical_readiness == "basic":
            return [
                "tool_familiarity",
                "basic_concepts",
                "foundational_skills",
                "intermediate_skills",
                "practical_applications",
                "advanced_techniques"
            ]
        elif technical_readiness == "intermediate":
            return [
                "concept_reinforcement",
                "skill_gap_focus",
                "intermediate_skills",
                "practical_applications",
                "advanced_techniques",
                "expert_applications"
            ]
        else:
            return [
                "skill_gap_focus",
                "advanced_concepts",
                "expert_techniques",
                "strategic_applications",
                "leadership_skills"
            ]

    def _create_weekly_structure(
        self,
        course_framework: Dict[str, Any],
        learner_analysis: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Create detailed week-by-week structure."""
        
        total_weeks = course_framework["course_duration"]["total_weeks"]
        difficulty_curve = course_framework["learning_progression"]["difficulty_curve"]
        skill_sequence = course_framework["learning_progression"]["skill_building_sequence"]
        
        weekly_structure = []
        
        for week_num in range(1, total_weeks + 1):
            week_difficulty = difficulty_curve[week_num - 1] if week_num <= len(difficulty_curve) else "advanced"
            
            week_structure = {
                "week_number": week_num,
                "week_theme": self._generate_week_theme(week_num, week_difficulty, learner_analysis),
                "difficulty_level": week_difficulty,
                "focus_areas": self._determine_week_focus_areas(week_num, total_weeks, learner_analysis),
                "learning_objectives": self._generate_week_objectives(week_num, week_difficulty, learner_analysis),
                "skill_progression": skill_sequence[week_num - 1] if week_num <= len(skill_sequence) else "expert_applications",
                "module_count": self._calculate_module_count(week_num, course_framework, learner_analysis),
                "assessment_approach": self._determine_week_assessment(week_num, week_difficulty),
                "practical_emphasis": self._calculate_practical_emphasis(week_num, total_weeks, learner_analysis)
            }
            
            weekly_structure.append(week_structure)
        
        return weekly_structure

    def _generate_week_theme(self, week_num: int, difficulty: str, learner_analysis: Dict[str, Any]) -> str:
        """Generate thematic focus for each week."""
        
        role_context = learner_analysis["learner_profile"]["role_context"]
        critical_gaps = learner_analysis["gap_analysis"]["critical_skill_count"]
        
        if week_num == 1:
            if "junior" in role_context.lower():
                return "Financial Analysis Foundations for Business Reporting"
            else:
                return "Advanced Financial Analysis Methodologies"
        elif week_num == 2:
            return "Forecasting, Budgeting, and Performance Metrics"
        elif week_num == 3:
            return "Advanced Data Analysis and Financial Modeling"
        elif week_num == 4:
            return "Strategic Analysis and Professional Application"
        else:
            return "Expert-Level Financial Analysis and Leadership"

    def _determine_week_focus_areas(self, week_num: int, total_weeks: int, learner_analysis: Dict[str, Any]) -> List[str]:
        """Determine focus areas for each week."""
        
        critical_gaps = [gap.get("skill", "") for gap in learner_analysis.get("gap_analysis", {}).get("critical_priority", [])]
        workplace_tools = learner_analysis.get("contextual_factors", {}).get("workplace_tools", [])
        
        week_focuses = {
            1: ["fundamental_concepts", "tool_familiarization", "basic_terminology"],
            2: ["forecasting_techniques", "budgeting_processes", "variance_analysis"],
            3: ["data_analysis_methods", "financial_modeling", "trend_analysis"],
            4: ["strategic_analysis", "decision_support", "professional_presentation"]
        }
        
        base_focus = week_focuses.get(week_num, ["advanced_techniques", "expert_applications"])
        
        # Add tool-specific focus
        if workplace_tools:
            for tool in workplace_tools:
                if tool.lower() in ["excel", "powerbi", "sap"]:
                    base_focus.append(f"{tool.lower()}_integration")
        
        # Add critical gap focus
        if week_num <= 2 and critical_gaps:
            base_focus.extend(gap.lower().replace(" ", "_") for gap in critical_gaps[:2])
        
        return base_focus

    def _generate_week_objectives(self, week_num: int, difficulty: str, learner_analysis: Dict[str, Any]) -> List[str]:
        """Generate specific learning objectives for each week."""
        
        role_context = learner_analysis["learner_profile"]["role_context"]
        
        objectives_by_week = {
            1: [
                "Master fundamental financial analysis concepts and terminology",
                "Understand financial statements and their interrelationships",
                "Apply basic ratio analysis techniques",
                "Navigate primary analysis tools effectively"
            ],
            2: [
                "Develop forecasting and budgeting skills",
                "Master variance analysis methodologies",
                "Create accurate financial projections",
                "Implement budget monitoring processes"
            ],
            3: [
                "Advanced data analysis for financial insights",
                "Sophisticated financial modeling techniques",
                "Trend identification and analysis",
                "Performance metrics development"
            ],
            4: [
                "Strategic financial analysis for decision making",
                "Professional presentation of findings",
                "Integration of multiple analysis methods",
                "Leadership in financial reporting processes"
            ]
        }
        
        base_objectives = objectives_by_week.get(week_num, ["Expert-level financial analysis capabilities"])
        
        # Personalize objectives based on role
        if "business performance" in role_context.lower():
            if week_num == 1:
                base_objectives.append("Apply concepts specifically to business performance reporting")
            elif week_num == 2:
                base_objectives.append("Develop performance-focused forecasting models")
        
        return base_objectives

    def _calculate_module_count(
        self,
        week_num: int,
        course_framework: Dict[str, Any],
        learner_analysis: Dict[str, Any]
    ) -> int:
        """Calculate optimal module count for each week."""
        
        modules_per_week = course_framework["course_duration"]["modules_per_week"]
        
        # Parse module range (e.g., "8-10" -> average of 9)
        if "-" in str(modules_per_week):
            min_modules, max_modules = map(int, modules_per_week.split("-"))
            base_modules = (min_modules + max_modules) // 2
        else:
            base_modules = int(modules_per_week)
        
        # Adjust based on week priority and critical gaps
        critical_gap_count = learner_analysis["gap_analysis"]["critical_skill_count"]
        
        if week_num <= 2 and critical_gap_count > 3:
            # More modules for critical weeks
            return min(base_modules + 2, max_modules if "-" in str(modules_per_week) else base_modules + 2)
        elif week_num == course_framework["course_duration"]["total_weeks"]:
            # Fewer modules for final week (synthesis and application)
            return max(base_modules - 1, min_modules if "-" in str(modules_per_week) else base_modules - 1)
        else:
            return base_modules

    def _determine_week_assessment(self, week_num: int, difficulty: str) -> str:
        """Determine assessment approach for each week."""
        
        if week_num == 1:
            return "knowledge_check"
        elif difficulty == "foundational":
            return "practical_exercise"
        elif difficulty in ["intermediate", "intermediate_plus"]:
            return "case_study_analysis"
        else:
            return "comprehensive_project"

    def _calculate_practical_emphasis(self, week_num: int, total_weeks: int, learner_analysis: Dict[str, Any]) -> float:
        """Calculate practical emphasis percentage for each week."""
        
        base_practical = learner_analysis["learning_requirements"]["practical_emphasis"]
        
        # Increase practical emphasis as course progresses
        progression_factor = week_num / total_weeks
        
        return min(0.9, base_practical + (progression_factor * 0.2))

    def _generate_module_specifications(
        self,
        weekly_structure: List[Dict[str, Any]],
        learner_analysis: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate detailed module specifications."""
        
        logger.info("📋 Generating detailed module specifications...")
        
        module_specifications = []
        module_id_counter = 1
        
        for week in weekly_structure:
            week_num = week["week_number"]
            module_count = week["module_count"]
            week_theme = week["week_theme"]
            focus_areas = week["focus_areas"]
            difficulty = week["difficulty_level"]
            
            # Generate modules for this week
            for module_index in range(module_count):
                module_spec = self._create_individual_module_spec(
                    module_id_counter, week_num, module_index, module_count,
                    week_theme, focus_areas, difficulty, learner_analysis
                )
                module_specifications.append(module_spec)
                module_id_counter += 1
        
        logger.info(f"✅ Generated {len(module_specifications)} module specifications")
        return module_specifications

    def _create_individual_module_spec(
        self,
        module_id: int,
        week_num: int,
        module_index: int,
        total_modules_in_week: int,
        week_theme: str,
        focus_areas: List[str],
        difficulty: str,
        learner_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create specification for an individual module."""
        
        # Determine module focus based on position in week
        focus_area = focus_areas[module_index % len(focus_areas)] if focus_areas else "general"
        
        # Generate module name based on focus and theme
        module_name = self._generate_module_name(week_theme, focus_area, module_index, difficulty)
        
        # Calculate word count based on priority and difficulty
        word_count = self._calculate_module_word_count(focus_area, difficulty, learner_analysis)
        
        # Determine tool integration
        tool_integration = self._determine_module_tools(focus_area, learner_analysis)
        
        # Set priority level
        priority_level = self._determine_module_priority(focus_area, week_num, learner_analysis)
        
        module_spec = {
            "module_id": f"M{module_id:02d}",
            "module_name": module_name,
            "week_number": week_num,
            "module_position": module_index + 1,
            "focus_area": focus_area,
            "difficulty_level": difficulty,
            "word_count_target": word_count,
            "priority_level": priority_level,
            "tool_integration": tool_integration,
            "learning_outcomes": self._generate_module_learning_outcomes(module_name, focus_area, difficulty),
            "skill_gap_addressed": self._map_focus_to_skill_gap(focus_area, learner_analysis),
            "personalization_context": {
                "employee_name": learner_analysis.get("learner_profile", {}).get("employee_name", "Learner"),
                "role_context": learner_analysis["learner_profile"]["role_context"],
                "experience_level": learner_analysis["learner_profile"]["experience_level"],
                "practical_emphasis": learner_analysis["learning_requirements"]["practical_emphasis"]
            },
            "content_requirements": {
                "theoretical_percentage": 30 if difficulty == "foundational" else 20,
                "practical_percentage": 70 if difficulty == "foundational" else 80,
                "case_study_required": difficulty in ["intermediate", "advanced"],
                "tool_tutorial_required": len(tool_integration) > 0,
                "real_world_examples": 3 if difficulty == "foundational" else 5
            }
        }
        
        return module_spec

    def _generate_module_name(self, week_theme: str, focus_area: str, module_index: int, difficulty: str) -> str:
        """Generate descriptive module names based on context."""
        
        # Map focus areas to module name components
        focus_mapping = {
            "fundamental_concepts": "Introduction to Financial Analysis Concepts",
            "tool_familiarization": "Mastering Essential Financial Analysis Tools",
            "forecasting_techniques": "Financial Forecasting Methodologies",
            "budgeting_processes": "Budget Planning and Management",
            "variance_analysis": "Variance Analysis and Performance Monitoring",
            "data_analysis_methods": "Advanced Data Analysis for Finance",
            "financial_modeling": "Financial Modeling and Scenario Analysis",
            "strategic_analysis": "Strategic Financial Analysis and Decision Making",
            "excel_integration": "Excel for Advanced Financial Analysis",
            "powerbi_integration": "PowerBI Dashboard Development for Finance",
            "sap_integration": "SAP BPC for Business Performance Reporting"
        }
        
        base_name = focus_mapping.get(focus_area, f"Financial Analysis Module {module_index + 1}")
        
        # Add difficulty modifier for advanced modules
        if difficulty == "advanced" and "Advanced" not in base_name:
            base_name = f"Advanced {base_name}"
        elif difficulty == "foundational" and "Introduction" not in base_name:
            base_name = f"Introduction to {base_name}"
        
        return base_name

    def _calculate_module_word_count(self, focus_area: str, difficulty: str, learner_analysis: Dict[str, Any]) -> int:
        """Calculate appropriate word count for modules."""
        
        # Base word counts by difficulty
        base_counts = {
            "foundational": 800,
            "foundational_plus": 900,
            "intermediate": 1000,
            "intermediate_plus": 1100,
            "advanced": 1200
        }
        
        base_count = base_counts.get(difficulty, 900)
        
        # Adjust based on focus area importance
        if any(critical in focus_area for critical in ["forecasting", "budgeting", "variance", "modeling"]):
            base_count += 200  # Critical skills get more content
        
        # Adjust based on practical emphasis
        practical_emphasis = learner_analysis["learning_requirements"]["practical_emphasis"]
        if practical_emphasis > 0.8:
            base_count += 100  # More practical content needs more words
        
        return base_count

    def _determine_module_tools(self, focus_area: str, learner_analysis: Dict[str, Any]) -> List[str]:
        """Determine which tools to integrate in each module."""
        
        workplace_tools = learner_analysis.get("contextual_factors", {}).get("workplace_tools", [])
        
        # Tool mapping based on focus area
        if "excel" in focus_area:
            return ["Excel"]
        elif "powerbi" in focus_area:
            return ["PowerBI"]
        elif "sap" in focus_area:
            return ["SAP BPC"]
        elif focus_area in ["financial_modeling", "forecasting_techniques", "budgeting_processes"]:
            return ["Excel"] if "Excel" in workplace_tools else []
        elif focus_area in ["data_analysis_methods", "strategic_analysis"]:
            available_tools = [tool for tool in ["Excel", "PowerBI"] if tool in workplace_tools]
            return available_tools[:2]  # Max 2 tools per module
        else:
            return []

    def _determine_module_priority(self, focus_area: str, week_num: int, learner_analysis: Dict[str, Any]) -> str:
        """Determine priority level for modules."""
        
        critical_skills = [gap.get("skill", "").lower() for gap in learner_analysis.get("gap_analysis", {}).get("critical_priority", [])]
        
        # High priority for critical skill areas
        if any(skill in focus_area for skill in critical_skills):
            return "critical"
        
        # High priority for early foundational modules
        if week_num <= 2:
            return "high"
        
        # Medium priority for later modules
        return "medium"

    def _generate_module_learning_outcomes(self, module_name: str, focus_area: str, difficulty: str) -> List[str]:
        """Generate specific learning outcomes for each module."""
        
        # Base outcomes by focus area
        outcomes_map = {
            "fundamental_concepts": [
                "Understand core financial analysis principles",
                "Apply basic analytical techniques",
                "Interpret financial data accurately"
            ],
            "forecasting_techniques": [
                "Develop accurate financial forecasts",
                "Apply multiple forecasting methodologies",
                "Validate forecast accuracy"
            ],
            "budgeting_processes": [
                "Create comprehensive budget models",
                "Monitor budget performance",
                "Conduct variance analysis"
            ],
            "financial_modeling": [
                "Build robust financial models",
                "Perform scenario analysis",
                "Validate model assumptions"
            ],
            "excel_integration": [
                "Master advanced Excel functions for finance",
                "Create automated financial templates",
                "Develop interactive financial dashboards"
            ]
        }
        
        base_outcomes = outcomes_map.get(focus_area, [
            f"Apply {module_name.lower()} in professional context",
            f"Demonstrate proficiency in {focus_area.replace('_', ' ')}",
            "Integrate learning with workplace applications"
        ])
        
        # Adjust outcomes based on difficulty
        if difficulty == "advanced":
            advanced_outcomes = [outcome.replace("Apply", "Master").replace("Understand", "Analyze") for outcome in base_outcomes]
            return advanced_outcomes
        
        return base_outcomes

    def _map_focus_to_skill_gap(self, focus_area: str, learner_analysis: Dict[str, Any]) -> str:
        """Map module focus areas to specific skill gaps."""
        
        critical_gaps = [gap.get("skill", "") for gap in learner_analysis.get("gap_analysis", {}).get("critical_priority", [])]
        
        # Direct mapping for common areas
        gap_mapping = {
            "forecasting_techniques": "Forecasting and Budgeting",
            "budgeting_processes": "Budget Management",
            "financial_modeling": "Financial Modeling",
            "data_analysis_methods": "Financial Data Analysis",
            "variance_analysis": "Variance Analysis"
        }
        
        mapped_gap = gap_mapping.get(focus_area, "")
        
        # If direct mapping exists in critical gaps, use it
        if mapped_gap in critical_gaps:
            return mapped_gap
        
        # Otherwise, find best match from critical gaps
        for gap in critical_gaps:
            if any(word in gap.lower() for word in focus_area.split("_")):
                return gap
        
        return "General Financial Analysis"

    def _optimize_learning_path(
        self,
        module_specifications: List[Dict[str, Any]],
        learner_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Optimize the learning path for maximum effectiveness."""
        
        return {
            "path_optimization": {
                "sequencing_strategy": "skill_dependency_based",
                "difficulty_progression": "gradual_with_accelerated_practical",
                "tool_integration_strategy": "progressive_complexity",
                "assessment_frequency": "weekly_with_cumulative"
            },
            "personalization_adjustments": {
                "accelerated_modules": self._identify_accelerated_modules(module_specifications, learner_analysis),
                "reinforcement_modules": self._identify_reinforcement_modules(module_specifications, learner_analysis),
                "extension_opportunities": self._identify_extension_opportunities(module_specifications, learner_analysis)
            },
            "success_predictors": {
                "engagement_factors": ["practical_application", "real_world_relevance", "tool_mastery"],
                "risk_mitigation": ["prerequisite_review", "additional_support", "peer_collaboration"],
                "performance_indicators": ["skill_demonstration", "knowledge_application", "confidence_building"]
            }
        }

    def _identify_accelerated_modules(self, modules: List[Dict], learner_analysis: Dict) -> List[str]:
        """Identify modules that can be accelerated based on existing skills."""
        
        technical_readiness = learner_analysis["learner_profile"]["technical_readiness"]
        
        accelerated = []
        
        if technical_readiness == "advanced":
            for module in modules:
                if "tool" in module["focus_area"] and module["difficulty_level"] == "foundational":
                    accelerated.append(module["module_id"])
        
        return accelerated

    def _identify_reinforcement_modules(self, modules: List[Dict], learner_analysis: Dict) -> List[str]:
        """Identify modules needing additional reinforcement."""
        
        critical_gaps = learner_analysis.get("gap_analysis", {}).get("critical_skill_count", 0)
        
        reinforcement = []
        
        if critical_gaps > 3:
            for module in modules:
                if module["priority_level"] == "critical" and module["week_number"] <= 2:
                    reinforcement.append(module["module_id"])
        
        return reinforcement

    def _identify_extension_opportunities(self, modules: List[Dict], learner_analysis: Dict) -> List[str]:
        """Identify opportunities for learning extensions."""
        
        experience_level = learner_analysis["learner_profile"]["experience_level"]
        
        extensions = []
        
        if experience_level in ["mid", "senior"]:
            for module in modules:
                if module["difficulty_level"] == "advanced" and module["week_number"] >= 3:
                    extensions.append(module["module_id"])
        
        return extensions

    def _design_assessment_strategy(
        self,
        module_specifications: List[Dict[str, Any]],
        learner_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Design comprehensive assessment strategy."""
        
        return {
            "assessment_philosophy": "competency_based_with_practical_application",
            "assessment_types": {
                "formative": "weekly_knowledge_checks",
                "practical": "hands_on_exercises",
                "summative": "comprehensive_projects",
                "peer": "collaborative_case_studies"
            },
            "assessment_schedule": self._create_assessment_schedule(module_specifications),
            "success_criteria": {
                "minimum_competency": "70% on all assessments",
                "practical_demonstration": "successful completion of 3 real-world scenarios",
                "tool_proficiency": "demonstrated improvement in workplace tool usage"
            }
        }

    def _create_assessment_schedule(self, modules: List[Dict]) -> List[Dict]:
        """Create assessment schedule aligned with modules."""
        
        schedule = []
        
        # Group modules by week
        weeks = {}
        for module in modules:
            week = module["week_number"]
            if week not in weeks:
                weeks[week] = []
            weeks[week].append(module)
        
        # Create weekly assessments
        for week_num, week_modules in weeks.items():
            assessment = {
                "week": week_num,
                "assessment_type": "practical_exercise",
                "modules_covered": [m["module_id"] for m in week_modules],
                "focus_areas": list(set(m["focus_area"] for m in week_modules)),
                "weight": 0.2 if week_num < max(weeks.keys()) else 0.4  # Final week worth more
            }
            schedule.append(assessment)
        
        return schedule

    def _define_personalization_features(self, learner_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Define personalization features for the course."""
        
        return {
            "adaptive_content": {
                "difficulty_adjustment": "based_on_performance",
                "pace_modification": "learner_controlled_with_guidance",
                "content_emphasis": "skill_gap_prioritized"
            },
            "individual_preferences": {
                "learning_style_accommodation": learner_analysis["learning_requirements"]["preferred_style"],
                "tool_focus": learner_analysis.get("contextual_factors", {}).get("workplace_tools", []),
                "career_alignment": learner_analysis["learner_profile"]["career_urgency"]
            },
            "support_mechanisms": {
                "prerequisite_reinforcement": "automatic_when_needed",
                "additional_resources": "context_sensitive",
                "peer_collaboration": "skills_based_matching"
            }
        }

    def _design_success_tracking(self, learner_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Design success tracking and analytics."""
        
        return {
            "progress_metrics": {
                "skill_acquisition_rate": "modules_completed_per_week",
                "competency_development": "assessment_score_trends",
                "practical_application": "tool_usage_improvement",
                "confidence_building": "self_assessment_scores"
            },
            "milestone_tracking": {
                "week_1": "foundational_concepts_mastery",
                "week_2": "critical_skills_development",
                "week_3": "advanced_application_skills",
                "week_4": "professional_readiness"
            },
            "outcome_indicators": {
                "immediate": "course_completion_with_proficiency",
                "short_term": "workplace_application_success",
                "medium_term": "career_progression_alignment",
                "long_term": "professional_competency_achievement"
            }
        }

if __name__ == "__main__":
    """Test the personalized course structure generator."""
    
    print("🏗️ Testing Personalized Course Structure Generator")
    print("=" * 60)
    
    generator = PersonalizedCourseStructure()
    
    # Sample data
    sample_profile = {
        "full_name": "Kubilaycan Karakas",
        "current_role": "Junior Financial Analyst - Business Performance Reporting",
        "experience_level": "junior_plus",
        "learning_style": "Prefers practical application and real-world examples",
        "career_path": {
            "target_position": "Senior Financial Analyst",
            "timeline": "2-3 years"
        },
        "skill_inventory": {
            "tool_proficiency": {
                "Excel": {"proficiency": "intermediate"},
                "SAP BPC": {"proficiency": "basic"},
                "PowerBI": {"proficiency": "intermediate"}
            }
        },
        "contextual_factors": {
            "workplace_tools": ["Excel", "SAP BPC", "PowerBI"],
            "upcoming_projects": ["Q3 financial reporting", "Budget recalibration"],
            "company_priorities": ["Improve profitability", "Enhance data utilization"]
        }
    }
    
    sample_gaps = {
        "critical_priority": [
            {"skill": "Forecasting and Budgeting", "priority_score": 10},
            {"skill": "Financial Data Analysis", "priority_score": 10}
        ],
        "high_priority": [
            {"skill": "Budget Management", "priority_score": 7}
        ]
    }
    
    sample_objectives = [
        "Master financial analysis fundamentals",
        "Develop forecasting and budgeting expertise",
        "Apply data analysis skills to financial reporting",
        "Achieve readiness for senior analyst role"
    ]
    
    # Generate course outline
    course_outline = generator.generate_adaptive_course_outline(
        sample_profile, sample_gaps, sample_objectives
    )
    
    print(f"✅ Generated adaptive course outline")
    print(f"📚 Course duration: {course_outline['course_framework']['course_duration']['total_weeks']} weeks")
    print(f"📝 Total modules: {len(course_outline['module_specifications'])}")
    print(f"🎯 Weekly structure: {len(course_outline['weekly_structure'])} weeks")
    
    # Show sample week structure
    if course_outline['weekly_structure']:
        week1 = course_outline['weekly_structure'][0]
        print(f"\n📅 Week 1 Example:")
        print(f"   Theme: {week1['week_theme']}")
        print(f"   Modules: {week1['module_count']}")
        print(f"   Focus: {', '.join(week1['focus_areas'][:3])}...")
    
    # Save results
    output_file = "sample_personalized_course_structure.json"
    with open(output_file, 'w') as f:
        json.dump(course_outline, f, indent=2)
    
    print(f"\n💾 Results saved to: {output_file}")