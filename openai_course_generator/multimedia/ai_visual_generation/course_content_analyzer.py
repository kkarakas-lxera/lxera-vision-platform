#!/usr/bin/env python3
"""
Course Content Analyzer for AI Visual Pipeline
Analyzes educational course content and determines appropriate visualizations for teaching
"""

import logging
import json
import re
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from datetime import datetime
from enum import Enum

# Import schemas
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from validators.schema import (
    VisualSpec, VisualIntent, DataType, Theme, DataPoint, DataSpec,
    Constraints, GenerationResult, RenderingPath
)

logger = logging.getLogger(__name__)


class EducationalContentType(str, Enum):
    """Types of educational content that can be visualized"""
    LEARNING_OBJECTIVES = "learning_objectives"
    MODULE_PROGRESSION = "module_progression"
    CONCEPT_MASTERY = "concept_mastery"
    ASSESSMENT_RESULTS = "assessment_results"
    ENGAGEMENT_METRICS = "engagement_metrics"
    TIME_ALLOCATION = "time_allocation"
    DIFFICULTY_DISTRIBUTION = "difficulty_distribution"
    KNOWLEDGE_GAPS = "knowledge_gaps"


@dataclass
class EducationalDataset:
    """A dataset that can be converted to an educational visualization"""
    content_type: EducationalContentType
    title: str
    subtitle: str
    labels: List[str]
    values: List[float]
    metadata: Dict[str, Any]
    suggested_intent: VisualIntent
    suggested_theme: Theme
    educational_purpose: str  # Why this visualization helps learning
    target_audience: str     # Who this visualization is for
    confidence_score: float  # 0.0-1.0 how confident we are this is useful


class CourseContentAnalyzer:
    """Analyzes course content and creates educational visualizations"""
    
    def __init__(self):
        # Educational visualization patterns
        self.progression_keywords = {
            'progress', 'completion', 'mastery', 'achievement', 'advancement',
            'learning', 'understanding', 'skill', 'knowledge', 'competency'
        }
        
        self.assessment_keywords = {
            'quiz', 'test', 'exam', 'assessment', 'evaluation', 'score',
            'grade', 'performance', 'result', 'feedback'
        }
        
        self.engagement_keywords = {
            'participation', 'engagement', 'interaction', 'activity',
            'time spent', 'attention', 'focus', 'completion rate'
        }
        
        logger.info("Course Content Analyzer initialized for educational visualizations")
    
    def analyze_course_content(self, course_data: Dict[str, Any]) -> List[EducationalDataset]:
        """
        Analyze course content and extract educational visualizations
        
        Args:
            course_data: Course structure with modules, objectives, assessments, or raw content
            
        Returns:
            List of educational datasets for visualization
        """
        datasets = []
        
        # Handle structured course data with modules
        if 'modules' in course_data and course_data['modules']:
            # Analyze course modules for progression
            datasets.extend(self._analyze_module_progression(course_data['modules']))
            datasets.extend(self._analyze_learning_objectives(course_data['modules']))
            datasets.extend(self._analyze_assessment_distribution(course_data['modules']))
            datasets.extend(self._analyze_time_allocation(course_data['modules']))
        
        # Handle raw content from Supabase (Ali's format)
        elif any(key in course_data for key in ['introduction', 'core_content', 'practical_applications', 'case_studies', 'assessments']):
            datasets.extend(self._analyze_raw_content_structure(course_data))
        
        # Handle nested raw_content structure
        elif 'raw_content' in course_data:
            datasets.extend(self._analyze_raw_content_structure(course_data['raw_content']))
        
        # Sort by educational value (confidence score)
        datasets.sort(key=lambda x: x.confidence_score, reverse=True)
        
        return datasets
    
    def _analyze_raw_content_structure(self, content: Dict[str, Any]) -> List[EducationalDataset]:
        """Analyze raw content structure from Ali's course data"""
        datasets = []
        
        # Extract all content sections
        content_sections = {}
        for section_name in ['introduction', 'core_content', 'practical_applications', 'case_studies', 'assessments']:
            section_content = content.get(section_name, '')
            if section_content and section_content.strip():
                content_sections[section_name] = section_content
        
        if not content_sections:
            return datasets
        
        # Analyze content distribution across sections
        section_names = []
        word_counts = []
        
        for section_name, section_content in content_sections.items():
            word_count = len(section_content.split())
            if word_count > 0:
                section_names.append(section_name.replace('_', ' ').title())
                word_counts.append(word_count)
        
        if len(section_names) >= 2:
            datasets.append(EducationalDataset(
                content_type=EducationalContentType.MODULE_PROGRESSION,
                title="Course Content Distribution",
                subtitle="Word count across content sections",
                labels=section_names,
                values=word_counts,
                metadata={
                    'total_words': sum(word_counts),
                    'section_count': len(section_names),
                    'content_source': 'real_supabase_data'
                },
                suggested_intent=VisualIntent.BAR_CHART,
                suggested_theme=Theme.EDUCATIONAL,
                educational_purpose="Shows content balance and helps students understand course structure",
                target_audience="Students and instructors",
                confidence_score=0.8
            ))
        
        # Analyze core content complexity
        core_content = content.get('core_content', '')
        if core_content:
            datasets.extend(self._analyze_core_content_complexity(core_content))
        
        # Analyze practical vs theoretical balance
        practical_content = content.get('practical_applications', '')
        if practical_content and core_content:
            datasets.extend(self._analyze_practical_theoretical_balance(core_content, practical_content))
        
        return datasets
    
    def _analyze_core_content_complexity(self, core_content: str) -> List[EducationalDataset]:
        """Analyze complexity patterns in core content"""
        datasets = []
        
        if not core_content:
            return datasets
        
        # Analyze concept density by paragraph
        paragraphs = [p.strip() for p in core_content.split('\n') if p.strip()]
        
        if len(paragraphs) >= 3:
            paragraph_lengths = []
            paragraph_labels = []
            
            for i, paragraph in enumerate(paragraphs[:8]):  # Limit to 8 paragraphs
                word_count = len(paragraph.split())
                if word_count > 20:  # Only include substantial paragraphs
                    paragraph_labels.append(f"Section {i+1}")
                    paragraph_lengths.append(word_count)
            
            if len(paragraph_lengths) >= 3:
                datasets.append(EducationalDataset(
                    content_type=EducationalContentType.CONCEPT_MASTERY,
                    title="Content Complexity Distribution",
                    subtitle="Information density across content sections",
                    labels=paragraph_labels,
                    values=paragraph_lengths,
                    metadata={
                        'avg_paragraph_length': sum(paragraph_lengths) / len(paragraph_lengths),
                        'total_paragraphs': len(paragraphs)
                    },
                    suggested_intent=VisualIntent.LINE_CHART,
                    suggested_theme=Theme.EDUCATIONAL,
                    educational_purpose="Helps students pace their learning through content complexity",
                    target_audience="Students planning study sessions",
                    confidence_score=0.7
                ))
        
        # Analyze key term frequency
        key_terms = self._extract_key_terms_from_content(core_content)
        if len(key_terms) >= 3:
            term_names = list(key_terms.keys())[:6]  # Top 6 terms
            term_frequencies = [key_terms[term] for term in term_names]
            
            datasets.append(EducationalDataset(
                content_type=EducationalContentType.LEARNING_OBJECTIVES,
                title="Key Concepts Frequency",
                subtitle="Most emphasized concepts in the content",
                labels=term_names,
                values=term_frequencies,
                metadata={
                    'total_key_terms': len(key_terms),
                    'content_analysis': 'frequency_based'
                },
                suggested_intent=VisualIntent.PIE_CHART,
                suggested_theme=Theme.EDUCATIONAL,
                educational_purpose="Highlights the most important concepts for focused study",
                target_audience="Students identifying core learning priorities",
                confidence_score=0.8
            ))
        
        return datasets
    
    def _analyze_practical_theoretical_balance(self, core_content: str, practical_content: str) -> List[EducationalDataset]:
        """Analyze balance between theoretical and practical content"""
        datasets = []
        
        core_words = len(core_content.split())
        practical_words = len(practical_content.split())
        
        if core_words > 0 and practical_words > 0:
            total_words = core_words + practical_words
            theoretical_percentage = (core_words / total_words) * 100
            practical_percentage = (practical_words / total_words) * 100
            
            datasets.append(EducationalDataset(
                content_type=EducationalContentType.ENGAGEMENT_METRICS,
                title="Learning Approach Balance",
                subtitle="Theoretical vs Practical content distribution",
                labels=["Theoretical Content", "Practical Applications"],
                values=[theoretical_percentage, practical_percentage],
                metadata={
                    'theoretical_words': core_words,
                    'practical_words': practical_words,
                    'balance_ratio': practical_words / core_words if core_words > 0 else 0
                },
                suggested_intent=VisualIntent.PIE_CHART,
                suggested_theme=Theme.EDUCATIONAL,
                educational_purpose="Shows learning style balance for optimal knowledge retention",
                target_audience="Students and curriculum designers",
                confidence_score=0.9
            ))
        
        return datasets
    
    def _extract_key_terms_from_content(self, content: str) -> Dict[str, int]:
        """Extract key terms and their frequencies from content"""
        import re
        from collections import Counter
        
        # Find key terms (capitalized phrases, technical terms)
        key_terms = {}
        
        # Look for terms in bold or with specific formatting
        bold_terms = re.findall(r'\*\*(.*?)\*\*', content)
        for term in bold_terms:
            term = term.strip()
            if len(term) > 3 and term not in key_terms:
                key_terms[term] = content.lower().count(term.lower())
        
        # Look for capitalized technical terms
        technical_terms = re.findall(r'\b[A-Z][a-z]*(?:\s+[A-Z][a-z]*){1,2}\b', content)
        for term in technical_terms:
            if len(term) > 5 and term not in key_terms:
                frequency = content.lower().count(term.lower())
                if frequency >= 2:  # Only include terms mentioned multiple times
                    key_terms[term] = frequency
        
        # Sort by frequency
        sorted_terms = dict(sorted(key_terms.items(), key=lambda x: x[1], reverse=True))
        
        return sorted_terms
    
    def _analyze_module_progression(self, modules: List[Dict[str, Any]]) -> List[EducationalDataset]:
        """Analyze module structure for progression visualization"""
        datasets = []
        
        if len(modules) < 2:
            return datasets
        
        # Module complexity progression (word count as proxy)
        module_names = []
        word_counts = []
        weeks = []
        
        for module in modules:
            name = module.get('module_name', f"Module {len(module_names) + 1}")
            word_count = module.get('word_count', 0)
            week = module.get('week_number', 1)
            
            if word_count > 0:
                module_names.append(name[:25])  # Truncate long names
                word_counts.append(word_count)
                weeks.append(week)
        
        if len(word_counts) >= 3:
            datasets.append(EducationalDataset(
                content_type=EducationalContentType.MODULE_PROGRESSION,
                title="Course Content Progression",
                subtitle="Content complexity across modules",
                labels=module_names,
                values=word_counts,
                metadata={
                    'weeks': weeks,
                    'total_modules': len(modules),
                    'avg_word_count': sum(word_counts) / len(word_counts)
                },
                suggested_intent=VisualIntent.LINE_CHART,
                suggested_theme=Theme.EDUCATIONAL,
                educational_purpose="Shows students how course complexity builds over time",
                target_audience="Students planning their study schedule",
                confidence_score=0.8
            ))
        
        # Weekly module distribution
        week_counts = {}
        for module in modules:
            week = module.get('week_number', 1)
            week_counts[f"Week {week}"] = week_counts.get(f"Week {week}", 0) + 1
        
        if len(week_counts) >= 2:
            datasets.append(EducationalDataset(
                content_type=EducationalContentType.TIME_ALLOCATION,
                title="Weekly Module Distribution",
                subtitle="Number of modules per week",
                labels=list(week_counts.keys()),
                values=list(week_counts.values()),
                metadata={
                    'total_weeks': len(week_counts),
                    'avg_modules_per_week': sum(week_counts.values()) / len(week_counts)
                },
                suggested_intent=VisualIntent.BAR_CHART,
                suggested_theme=Theme.EDUCATIONAL,
                educational_purpose="Helps students understand course pacing and workload",
                target_audience="Students and instructors",
                confidence_score=0.7
            ))
        
        return datasets
    
    def _analyze_learning_objectives(self, modules: List[Dict[str, Any]]) -> List[EducationalDataset]:
        """Analyze learning objectives distribution"""
        datasets = []
        
        # Count objectives per module
        objective_counts = []
        module_names = []
        
        for module in modules:
            objectives = module.get('learning_objectives', [])
            if objectives:
                module_names.append(module.get('module_name', f"Module {len(module_names) + 1}")[:20])
                objective_counts.append(len(objectives))
        
        if len(objective_counts) >= 3:
            datasets.append(EducationalDataset(
                content_type=EducationalContentType.LEARNING_OBJECTIVES,
                title="Learning Objectives Distribution",
                subtitle="Number of learning objectives per module",
                labels=module_names,
                values=objective_counts,
                metadata={
                    'total_objectives': sum(objective_counts),
                    'avg_objectives_per_module': sum(objective_counts) / len(objective_counts)
                },
                suggested_intent=VisualIntent.BAR_CHART,
                suggested_theme=Theme.EDUCATIONAL,
                educational_purpose="Shows learning density and helps students focus study efforts",
                target_audience="Students tracking their learning goals",
                confidence_score=0.9
            ))
        
        # Analyze cognitive levels in objectives (Bloom's taxonomy approximation)
        cognitive_levels = {
            'Remember': 0, 'Understand': 0, 'Apply': 0, 
            'Analyze': 0, 'Evaluate': 0, 'Create': 0
        }
        
        bloom_keywords = {
            'Remember': ['recall', 'recognize', 'list', 'describe', 'identify', 'name'],
            'Understand': ['explain', 'interpret', 'summarize', 'understand', 'comprehend'],
            'Apply': ['apply', 'use', 'implement', 'demonstrate', 'practice'],
            'Analyze': ['analyze', 'compare', 'contrast', 'examine', 'break down'],
            'Evaluate': ['evaluate', 'judge', 'critique', 'assess', 'justify'],
            'Create': ['create', 'design', 'develop', 'build', 'construct', 'generate']
        }
        
        for module in modules:
            objectives = module.get('learning_objectives', [])
            for objective in objectives:
                objective_lower = objective.lower()
                for level, keywords in bloom_keywords.items():
                    if any(keyword in objective_lower for keyword in keywords):
                        cognitive_levels[level] += 1
                        break
        
        # Only include levels with objectives
        active_levels = {k: v for k, v in cognitive_levels.items() if v > 0}
        
        if len(active_levels) >= 2:
            datasets.append(EducationalDataset(
                content_type=EducationalContentType.CONCEPT_MASTERY,
                title="Cognitive Complexity Distribution",
                subtitle="Learning objectives by Bloom's taxonomy level",
                labels=list(active_levels.keys()),
                values=list(active_levels.values()),
                metadata={
                    'taxonomy': 'Blooms',
                    'total_categorized': sum(active_levels.values())
                },
                suggested_intent=VisualIntent.PIE_CHART,
                suggested_theme=Theme.EDUCATIONAL,
                educational_purpose="Shows cognitive complexity and helps students prepare for different thinking levels",
                target_audience="Students and curriculum designers",
                confidence_score=0.8
            ))
        
        return datasets
    
    def _analyze_assessment_distribution(self, modules: List[Dict[str, Any]]) -> List[EducationalDataset]:
        """Analyze assessment structure across modules"""
        datasets = []
        
        # Count assessments per module
        assessment_counts = []
        module_names = []
        
        for module in modules:
            assessments = module.get('assessments', [])
            if len(module_names) < 10:  # Limit to prevent overcrowding
                module_names.append(module.get('module_name', f"Module {len(module_names) + 1}")[:20])
                assessment_counts.append(len(assessments))
        
        if len(assessment_counts) >= 2 and any(count > 0 for count in assessment_counts):
            datasets.append(EducationalDataset(
                content_type=EducationalContentType.ASSESSMENT_RESULTS,
                title="Assessment Distribution",
                subtitle="Number of assessments per module",
                labels=module_names,
                values=assessment_counts,
                metadata={
                    'total_assessments': sum(assessment_counts),
                    'modules_with_assessments': sum(1 for count in assessment_counts if count > 0)
                },
                suggested_intent=VisualIntent.BAR_CHART,
                suggested_theme=Theme.PROFESSIONAL,
                educational_purpose="Helps students prepare for assessment load and plan study time",
                target_audience="Students planning their assessment schedule",
                confidence_score=0.7
            ))
        
        # Assessment types distribution
        assessment_types = {}
        for module in modules:
            assessments = module.get('assessments', [])
            for assessment in assessments:
                assessment_type = assessment.get('assessment_type', 'Unknown')
                assessment_types[assessment_type] = assessment_types.get(assessment_type, 0) + 1
        
        if len(assessment_types) >= 2:
            datasets.append(EducationalDataset(
                content_type=EducationalContentType.ASSESSMENT_RESULTS,
                title="Assessment Types Distribution",
                subtitle="Variety of assessment methods used",
                labels=list(assessment_types.keys()),
                values=list(assessment_types.values()),
                metadata={
                    'total_assessment_instances': sum(assessment_types.values()),
                    'unique_types': len(assessment_types)
                },
                suggested_intent=VisualIntent.PIE_CHART,
                suggested_theme=Theme.PROFESSIONAL,
                educational_purpose="Shows assessment variety and helps students understand evaluation methods",
                target_audience="Students and instructors",
                confidence_score=0.6
            ))
        
        return datasets
    
    def _analyze_time_allocation(self, modules: List[Dict[str, Any]]) -> List[EducationalDataset]:
        """Analyze time allocation across course components"""
        datasets = []
        
        # Estimated study time per module (from activities)
        study_times = []
        module_names = []
        
        for module in modules:
            total_time = 0
            activities = module.get('activities', [])
            
            for activity in activities:
                duration = activity.get('estimated_duration_minutes', 0)
                total_time += duration
            
            if total_time > 0:
                module_names.append(module.get('module_name', f"Module {len(module_names) + 1}")[:20])
                study_times.append(total_time)
        
        if len(study_times) >= 3:
            datasets.append(EducationalDataset(
                content_type=EducationalContentType.TIME_ALLOCATION,
                title="Estimated Study Time per Module",
                subtitle="Time investment required (minutes)",
                labels=module_names,
                values=study_times,
                metadata={
                    'total_study_hours': sum(study_times) / 60,
                    'avg_module_time': sum(study_times) / len(study_times)
                },
                suggested_intent=VisualIntent.BAR_CHART,
                suggested_theme=Theme.EDUCATIONAL,
                educational_purpose="Helps students plan study schedule and time management",
                target_audience="Students planning their learning schedule",
                confidence_score=0.8
            ))
        
        # Activity types distribution
        activity_types = {}
        for module in modules:
            activities = module.get('activities', [])
            for activity in activities:
                activity_type = activity.get('activity_type', 'Unknown')
                duration = activity.get('estimated_duration_minutes', 30)  # Default 30 min
                activity_types[activity_type] = activity_types.get(activity_type, 0) + duration
        
        if len(activity_types) >= 2:
            datasets.append(EducationalDataset(
                content_type=EducationalContentType.ENGAGEMENT_METRICS,
                title="Learning Activity Time Distribution",
                subtitle="Time allocation by activity type (minutes)",
                labels=list(activity_types.keys()),
                values=list(activity_types.values()),
                metadata={
                    'total_activity_time': sum(activity_types.values()),
                    'activity_variety': len(activity_types)
                },
                suggested_intent=VisualIntent.PIE_CHART,
                suggested_theme=Theme.EDUCATIONAL,
                educational_purpose="Shows learning method variety and time investment per activity type",
                target_audience="Students and curriculum designers",
                confidence_score=0.7
            ))
        
        return datasets
    
    def convert_to_visual_spec(self, dataset: EducationalDataset, scene_id: str) -> VisualSpec:
        """Convert an educational dataset to a complete visual specification"""
        
        # Create data points
        data_points = []
        for label, value in zip(dataset.labels, dataset.values):
            data_points.append(DataPoint(label=label, value=value))
        
        # Determine data type based on content
        data_type = DataType.NUMERICAL
        if dataset.content_type in [EducationalContentType.MODULE_PROGRESSION, EducationalContentType.TIME_ALLOCATION]:
            data_type = DataType.TIME_SERIES
        
        return VisualSpec(
            scene_id=scene_id,
            intent=dataset.suggested_intent,
            dataspec=DataSpec(
                data_type=data_type,
                data_points=data_points
            ),
            title=dataset.title,
            subtitle=dataset.subtitle,
            theme=dataset.suggested_theme,
            constraints=Constraints(max_width=1000, max_height=700)
        )


# Convenience function
def analyze_educational_content(course_data: Dict[str, Any]) -> List[EducationalDataset]:
    """Analyze course content and return educational datasets"""
    analyzer = CourseContentAnalyzer()
    return analyzer.analyze_course_content(course_data)


if __name__ == "__main__":
    # Test the course content analyzer
    def test_course_analyzer():
        print("📚 Testing Course Content Analyzer")
        print("=" * 50)
        
        # Sample course data structure
        test_course = {
            'course_name': 'Introduction to Data Science',
            'modules': [
                {
                    'module_name': 'Python Fundamentals',
                    'week_number': 1,
                    'word_count': 2500,
                    'learning_objectives': [
                        'Understand Python syntax and basic programming concepts',
                        'Apply variables and data types in Python programs',
                        'Create simple Python scripts for data manipulation'
                    ],
                    'activities': [
                        {'activity_type': 'Reading', 'estimated_duration_minutes': 45},
                        {'activity_type': 'Coding_Exercise', 'estimated_duration_minutes': 90}
                    ],
                    'assessments': [
                        {'assessment_type': 'Quiz', 'title': 'Python Basics Quiz'}
                    ]
                },
                {
                    'module_name': 'Data Analysis with Pandas',
                    'week_number': 2,
                    'word_count': 3200,
                    'learning_objectives': [
                        'Analyze datasets using pandas library',
                        'Create data visualizations from analysis results',
                        'Evaluate data quality and cleaning techniques'
                    ],
                    'activities': [
                        {'activity_type': 'Reading', 'estimated_duration_minutes': 60},
                        {'activity_type': 'Practical_Exercise', 'estimated_duration_minutes': 120},
                        {'activity_type': 'Video_Summary', 'estimated_duration_minutes': 30}
                    ],
                    'assessments': [
                        {'assessment_type': 'Practical_Exercise', 'title': 'Data Cleaning Project'},
                        {'assessment_type': 'Quiz', 'title': 'Pandas Mastery Quiz'}
                    ]
                },
                {
                    'module_name': 'Machine Learning Basics',
                    'week_number': 3,
                    'word_count': 4100,
                    'learning_objectives': [
                        'Design machine learning pipelines for common problems',
                        'Evaluate model performance using appropriate metrics',
                        'Create predictive models using scikit-learn'
                    ],
                    'activities': [
                        {'activity_type': 'Reading', 'estimated_duration_minutes': 75},
                        {'activity_type': 'Interactive_Scenario', 'estimated_duration_minutes': 45},
                        {'activity_type': 'Coding_Exercise', 'estimated_duration_minutes': 150}
                    ],
                    'assessments': [
                        {'assessment_type': 'Project_Milestone', 'title': 'ML Model Building'},
                        {'assessment_type': 'Peer_Review_Submission', 'title': 'Model Evaluation Report'}
                    ]
                }
            ]
        }
        
        analyzer = CourseContentAnalyzer()
        datasets = analyzer.analyze_course_content(test_course)
        
        print(f"Found {len(datasets)} educational visualizations:")
        
        for i, dataset in enumerate(datasets, 1):
            print(f"\n{i}. {dataset.title}")
            print(f"   Type: {dataset.content_type}")
            print(f"   Intent: {dataset.suggested_intent}")
            print(f"   Theme: {dataset.suggested_theme}")
            print(f"   Purpose: {dataset.educational_purpose}")
            print(f"   Audience: {dataset.target_audience}")
            print(f"   Confidence: {dataset.confidence_score:.1%}")
            print(f"   Data points: {len(dataset.labels)}")
        
        print(f"\n📚 Course Content Analyzer Test Complete")
        return len(datasets) > 0
    
    test_course_analyzer()