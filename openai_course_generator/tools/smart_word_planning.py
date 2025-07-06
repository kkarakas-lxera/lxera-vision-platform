"""
Smart Word Count Planning System
Intelligently distributes word counts based on content complexity, module type, and learning objectives
"""

import json
import logging
from typing import Dict, Any, List, Tuple
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class SectionPlan:
    """Smart planning for individual content sections"""
    section_name: str
    word_target: int
    min_words: int
    max_words: int
    complexity_level: str
    content_density: str
    reasoning: str

@dataclass
class ModuleWordPlan:
    """Complete module word distribution plan"""
    total_words: int
    sections: Dict[str, SectionPlan]
    distribution_reasoning: str
    complexity_analysis: Dict[str, Any]

class SmartWordPlanner:
    """Intelligent word count planning based on content analysis"""
    
    def __init__(self):
        # Evidence-based word distribution patterns for effective learning
        self.base_distributions = {
            "introductory": {
                "introduction": 0.15,      # 15% - Brief overview
                "core_content": 0.45,      # 45% - Main learning
                "practical_applications": 0.25,  # 25% - Practice
                "case_studies": 0.10,      # 10% - Examples
                "assessments": 0.05        # 5% - Testing
            },
            "intermediate": {
                "introduction": 0.12,      # 12% - Focused intro
                "core_content": 0.50,      # 50% - Deep concepts
                "practical_applications": 0.23,  # 23% - Implementation
                "case_studies": 0.12,      # 12% - Complex scenarios
                "assessments": 0.03        # 3% - Advanced testing
            },
            "advanced": {
                "introduction": 0.10,      # 10% - Brief context
                "core_content": 0.55,      # 55% - Advanced concepts
                "practical_applications": 0.20,  # 20% - Expert application
                "case_studies": 0.12,      # 12% - Expert scenarios
                "assessments": 0.03        # 3% - Mastery testing
            }
        }
        
        # Content complexity indicators
        self.complexity_indicators = {
            "high": ["advanced", "expert", "complex", "sophisticated", "comprehensive", "detailed analysis"],
            "medium": ["intermediate", "detailed", "thorough", "systematic", "structured"],
            "low": ["basic", "introduction", "overview", "fundamentals", "beginner"]
        }

    def analyze_content_complexity(self, module_spec: Dict[str, Any], research_context: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze content complexity to inform word planning"""
        
        complexity_score = 0
        analysis = {
            "factors": [],
            "complexity_level": "intermediate",
            "content_density": "medium",
            "learning_curve": "moderate"
        }
        
        # Factor 1: Difficulty level
        difficulty = module_spec.get("difficulty_level", "intermediate").lower()
        if difficulty in ["advanced", "expert"]:
            complexity_score += 3
            analysis["factors"].append(f"Advanced difficulty level (+3)")
        elif difficulty in ["intermediate", "medium"]:
            complexity_score += 2
            analysis["factors"].append(f"Intermediate difficulty (+2)")
        else:
            complexity_score += 1
            analysis["factors"].append(f"Basic difficulty (+1)")
        
        # Factor 2: Number of learning objectives
        objectives = module_spec.get("learning_outcomes", [])
        if len(objectives) > 5:
            complexity_score += 2
            analysis["factors"].append(f"Many objectives ({len(objectives)}) (+2)")
        elif len(objectives) > 3:
            complexity_score += 1
            analysis["factors"].append(f"Multiple objectives ({len(objectives)}) (+1)")
        
        # Factor 3: Tool integration complexity
        tools = module_spec.get("tool_integration", [])
        if len(tools) > 3:
            complexity_score += 2
            analysis["factors"].append(f"Complex tool integration ({len(tools)} tools) (+2)")
        elif len(tools) > 1:
            complexity_score += 1
            analysis["factors"].append(f"Multi-tool integration ({len(tools)} tools) (+1)")
        
        # Factor 4: Research quality and depth
        if "research_findings" in research_context:
            research_quality = research_context.get("quality_assessment", {}).get("overall_score", 0.0)
            if research_quality > 0.8:
                complexity_score += 2
                analysis["factors"].append(f"High-quality research (score: {research_quality:.2f}) (+2)")
            elif research_quality > 0.6:
                complexity_score += 1
                analysis["factors"].append(f"Good quality research (score: {research_quality:.2f}) (+1)")
        
        # Factor 5: Content keywords complexity analysis
        module_name = module_spec.get("module_name", "").lower()
        description = str(module_spec.get("description", "")).lower()
        full_text = f"{module_name} {description}"
        
        for complexity_level, keywords in self.complexity_indicators.items():
            matches = sum(1 for keyword in keywords if keyword in full_text)
            if matches > 0:
                if complexity_level == "high":
                    complexity_score += matches
                    analysis["factors"].append(f"High complexity keywords ({matches}) (+{matches})")
                elif complexity_level == "medium":
                    complexity_score += matches * 0.5
                    analysis["factors"].append(f"Medium complexity keywords ({matches}) (+{matches * 0.5})")
        
        # Determine final complexity level
        if complexity_score >= 8:
            analysis["complexity_level"] = "advanced"
            analysis["content_density"] = "high"
            analysis["learning_curve"] = "steep"
        elif complexity_score >= 5:
            analysis["complexity_level"] = "intermediate"
            analysis["content_density"] = "medium"
            analysis["learning_curve"] = "moderate"
        else:
            analysis["complexity_level"] = "introductory"
            analysis["content_density"] = "low"
            analysis["learning_curve"] = "gentle"
        
        analysis["total_complexity_score"] = complexity_score
        return analysis

    def calculate_smart_distribution(
        self, 
        total_words: int, 
        module_spec: Dict[str, Any], 
        research_context: Dict[str, Any]
    ) -> ModuleWordPlan:
        """Calculate intelligent word distribution"""
        
        # Analyze content complexity
        complexity_analysis = self.analyze_content_complexity(module_spec, research_context)
        complexity_level = complexity_analysis["complexity_level"]
        
        # Get base distribution pattern
        base_dist = self.base_distributions[complexity_level]
        
        # Apply smart adjustments based on module characteristics
        adjusted_dist = self._apply_smart_adjustments(
            base_dist, module_spec, research_context, complexity_analysis
        )
        
        # Calculate section plans
        sections = {}
        distribution_reasoning = []
        
        for section_name, percentage in adjusted_dist.items():
            word_target = int(total_words * percentage)
            min_words = int(word_target * 0.85)  # 15% tolerance
            max_words = int(word_target * 1.25)  # 25% upper limit
            
            # Determine section complexity
            section_complexity = self._determine_section_complexity(
                section_name, complexity_analysis, module_spec
            )
            
            # Generate reasoning
            reasoning = f"{percentage:.1%} of total ({word_target} words) - {section_complexity}"
            distribution_reasoning.append(f"{section_name}: {reasoning}")
            
            sections[section_name] = SectionPlan(
                section_name=section_name,
                word_target=word_target,
                min_words=min_words,
                max_words=max_words,
                complexity_level=section_complexity,
                content_density=complexity_analysis["content_density"],
                reasoning=reasoning
            )
        
        return ModuleWordPlan(
            total_words=total_words,
            sections=sections,
            distribution_reasoning="; ".join(distribution_reasoning),
            complexity_analysis=complexity_analysis
        )

    def _apply_smart_adjustments(
        self, 
        base_dist: Dict[str, float], 
        module_spec: Dict[str, Any], 
        research_context: Dict[str, Any],
        complexity_analysis: Dict[str, Any]
    ) -> Dict[str, float]:
        """Apply intelligent adjustments to base distribution"""
        
        adjusted = base_dist.copy()
        
        # Adjustment 1: Research-heavy modules need more practical applications
        if "research_findings" in research_context:
            research_quality = research_context.get("quality_assessment", {}).get("overall_score", 0.0)
            if research_quality > 0.8:
                # High-quality research -> more practical applications
                adjustment = 0.05
                adjusted["practical_applications"] += adjustment
                adjusted["introduction"] -= adjustment * 0.5
                adjusted["case_studies"] -= adjustment * 0.5
        
        # Adjustment 2: Tool-heavy modules need more practical content
        tools = module_spec.get("tool_integration", [])
        if len(tools) > 2:
            adjustment = min(0.08, len(tools) * 0.02)
            adjusted["practical_applications"] += adjustment
            adjusted["introduction"] -= adjustment * 0.6
            adjusted["case_studies"] += adjustment * 0.4
            adjusted["core_content"] -= adjustment * 0.4
        
        # Adjustment 3: Many learning objectives need more core content
        objectives = module_spec.get("learning_outcomes", [])
        if len(objectives) > 4:
            adjustment = 0.05
            adjusted["core_content"] += adjustment
            adjusted["introduction"] -= adjustment * 0.4
            adjusted["assessments"] -= adjustment * 0.6
        
        # Adjustment 4: Complex modules need less introduction, more core
        if complexity_analysis["complexity_level"] == "advanced":
            adjusted["introduction"] = max(0.08, adjusted["introduction"] - 0.02)
            adjusted["core_content"] += 0.02
        
        # Adjustment 5: Ensure practical balance (min 20% for applications)
        if adjusted["practical_applications"] < 0.20:
            deficit = 0.20 - adjusted["practical_applications"]
            adjusted["practical_applications"] = 0.20
            # Take from introduction first, then core content
            if adjusted["introduction"] > 0.12:
                take_from_intro = min(deficit, adjusted["introduction"] - 0.12)
                adjusted["introduction"] -= take_from_intro
                deficit -= take_from_intro
            if deficit > 0:
                adjusted["core_content"] -= deficit
        
        # Normalize to ensure total = 1.0
        total = sum(adjusted.values())
        for section in adjusted:
            adjusted[section] /= total
        
        return adjusted

    def _determine_section_complexity(
        self, 
        section_name: str, 
        complexity_analysis: Dict[str, Any], 
        module_spec: Dict[str, Any]
    ) -> str:
        """Determine complexity level for specific section"""
        
        base_complexity = complexity_analysis["complexity_level"]
        
        # Section-specific adjustments
        if section_name == "introduction":
            # Introduction is always one level simpler
            if base_complexity == "advanced":
                return "intermediate"
            elif base_complexity == "intermediate":
                return "introductory"
            else:
                return "introductory"
        
        elif section_name == "core_content":
            # Core content matches module complexity
            return base_complexity
        
        elif section_name == "practical_applications":
            # Practical is application-focused
            tools = module_spec.get("tool_integration", [])
            if len(tools) > 2:
                return "intermediate" if base_complexity == "introductory" else base_complexity
            else:
                return base_complexity
        
        elif section_name == "case_studies":
            # Case studies can be one level higher for engagement
            if base_complexity == "introductory":
                return "intermediate"
            else:
                return base_complexity
        
        elif section_name == "assessments":
            # Assessments match or are simpler
            return base_complexity
        
        return base_complexity

    def get_section_plan(self, section_name: str, word_plan: ModuleWordPlan) -> SectionPlan:
        """Get planning details for a specific section"""
        return word_plan.sections.get(section_name, SectionPlan(
            section_name=section_name,
            word_target=500,
            min_words=400,
            max_words=600,
            complexity_level="intermediate",
            content_density="medium",
            reasoning="Default fallback plan"
        ))

# Global instance for use in content tools
smart_planner = SmartWordPlanner()

def get_smart_word_plan(
    total_words: int,
    module_spec: Dict[str, Any], 
    research_context: Dict[str, Any]
) -> ModuleWordPlan:
    """Get smart word distribution plan for a module"""
    return smart_planner.calculate_smart_distribution(total_words, module_spec, research_context)

def log_word_plan(word_plan: ModuleWordPlan):
    """Log the word distribution plan for monitoring"""
    logger.info("📊 SMART WORD DISTRIBUTION PLAN")
    logger.info(f"   Total Words: {word_plan.total_words}")
    logger.info(f"   Complexity: {word_plan.complexity_analysis['complexity_level']}")
    logger.info(f"   Content Density: {word_plan.complexity_analysis['content_density']}")
    
    for section_name, section_plan in word_plan.sections.items():
        percentage = (section_plan.word_target / word_plan.total_words) * 100
        logger.info(f"   📝 {section_name}: {section_plan.word_target} words ({percentage:.1f}%) - {section_plan.complexity_level}")
    
    logger.info(f"   🧠 Complexity Analysis: {word_plan.complexity_analysis['factors'][:3]}")