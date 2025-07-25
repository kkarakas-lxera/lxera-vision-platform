#!/usr/bin/env python3
"""
Educational Script Generator
Transforms course content into engaging narration scripts optimized for educational videos
"""

import re
import json
import logging
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime
import openai
import string

logger = logging.getLogger(__name__)

# Import our new components (optional - graceful fallback if dependencies missing)
try:
    from .content_essence_extractor import ContentEssenceExtractor, SlideEssence
    ESSENCE_EXTRACTOR_AVAILABLE = True
except ImportError as e:
    logger.warning(f"ContentEssenceExtractor not available: {e}")
    ESSENCE_EXTRACTOR_AVAILABLE = False

# HumanNarrationGenerator completely removed - it was creating gibberish transitions

# Import fix modules
try:
    import sys
    import os
    # Add parent directory to path for imports
    parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if parent_dir not in sys.path:
        sys.path.insert(0, parent_dir)
    
    from fix_learning_objectives import LearningObjectiveGenerator
    LEARNING_OBJECTIVE_FIX_AVAILABLE = True
except ImportError as e:
    logger.warning(f"LearningObjectiveGenerator not available: {e}")
    LEARNING_OBJECTIVE_FIX_AVAILABLE = False

try:
    from fix_slide6_enhancement import Slide6EnhancementFix
    SLIDE6_FIX_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Slide6EnhancementFix not available: {e}")
    SLIDE6_FIX_AVAILABLE = False

try:
    from fix_gpt4_trust import GPT4TrustEnhancement
    GPT4_TRUST_FIX_AVAILABLE = True
except ImportError as e:
    logger.warning(f"GPT4TrustEnhancement not available: {e}")
    GPT4_TRUST_FIX_AVAILABLE = False

@dataclass
class SlideContentPlan:
    """Enhanced planning structure for slide content"""
    slide_title: str
    main_content: str
    bullet_points: List[str]
    speaker_notes: str
    visual_context: str
    duration_estimate: float
    
    def to_slide_content(self, slide_number: int) -> 'SlideContent':
        """Convert plan to SlideContent"""
        return SlideContent(
            slide_number=slide_number,
            title=self.slide_title,
            bullet_points=self.bullet_points,
            speaker_notes=self.speaker_notes,
            duration_estimate=self.duration_estimate,
            visual_cues=[self.visual_context] if self.visual_context else [],
            main_content=self.main_content  # Store main content
        )

@dataclass
class ContentDistributionResult:
    """Result of content distribution across slides"""
    slides: List[SlideContentPlan]
    total_duration: float
    content_coverage: float  # Percentage of original content covered
    distribution_quality: str  # 'optimal', 'good', 'acceptable'
    warnings: List[str] = field(default_factory=list)
    
    def validate(self) -> bool:
        """Validate the content distribution"""
        if not self.slides:
            self.warnings.append("No slides generated")
            return False
        
        # Check for duplicate content
        seen_titles = set()
        for slide in self.slides:
            if slide.slide_title in seen_titles:
                self.warnings.append(f"Duplicate slide title: {slide.slide_title}")
                return False
            seen_titles.add(slide.slide_title)
            
        # Check for empty content
        for i, slide in enumerate(self.slides):
            if not slide.main_content or not slide.speaker_notes:
                self.warnings.append(f"Slide {i+1} has empty content")
                return False
                
        return True

@dataclass
class SlideContent:
    """Enhanced content for a single slide with richer content"""
    slide_number: int
    title: str
    bullet_points: List[str]
    speaker_notes: str
    duration_estimate: float  # seconds
    visual_cues: List[str] = field(default_factory=list)
    emphasis_points: List[str] = field(default_factory=list)
    slide_id: str = field(default_factory=lambda: f"slide_{int(datetime.now().timestamp())}")
    timing_cues: List[str] = field(default_factory=list)
    main_content: str = ""  # New field for preserving main content
    visual_context: str = ""  # New field for visual context preservation

@dataclass
class EducationalScript:
    """Complete educational script with slides and narration"""
    module_name: str
    total_duration: float
    slides: List[SlideContent]
    full_narration: str
    learning_objectives: List[str]
    key_takeaways: List[str]
    metadata: Dict[str, Any] = field(default_factory=dict)

class EducationalScriptGenerator:
    """
    Generates educational scripts from course content with GPT-4 enhancement
    
    Key Features:
    - Triple GPT-4 enhancement: content transformation, bullet point extraction, learning objectives
    - Batch processing optimization: reduces API calls from 3 to 1 for better performance
    - Contextual intelligence: analyzes full course context and employee role for personalization
    - Section-based generation: creates focused 3-5 minute microlearning videos
    - Graceful fallbacks: works even without optional dependencies (NLTK, etc.)
    
    Performance Optimizations:
    - Batch GPT-4 calls reduce API latency and costs
    - Intelligent caching and content reuse
    - Error handling with automatic fallbacks
    - Timeout settings for reliability
    """
    
    def __init__(self, openai_api_key: Optional[str] = None):
        """Initialize the script generator"""
        self.openai_api_key = openai_api_key
        if openai_api_key:
            openai.api_key = openai_api_key
        
        # Configuration
        self.words_per_minute = 150  # Average speaking pace
        self.min_slide_duration = 15  # seconds
        self.max_slide_duration = 45  # seconds
        self.max_bullet_points = 5
        
        # Initialize enhanced components (if available)
        self.essence_extractor = ContentEssenceExtractor() if ESSENCE_EXTRACTOR_AVAILABLE else None
        
        # Initialize fix components
        self.learning_objective_generator = None
        if LEARNING_OBJECTIVE_FIX_AVAILABLE:
            self.learning_objective_generator = LearningObjectiveGenerator()
            logger.info("LearningObjectiveGenerator initialized")
        
        self.slide6_enhancer = None
        if SLIDE6_FIX_AVAILABLE:
            self.slide6_enhancer = Slide6EnhancementFix()
            logger.info("Slide6EnhancementFix initialized")
        
        self.gpt4_trust_enhancer = None
        if GPT4_TRUST_FIX_AVAILABLE:
            self.gpt4_trust_enhancer = GPT4TrustEnhancement()
            # Patch validation methods
            self.gpt4_trust_enhancer.patch_validation_methods(self)
            logger.info("GPT4TrustEnhancement initialized and patched")
        
        # Track generated content for validation
        self._generated_content_cache = set()
        self._slide_title_cache = set()
        self._is_processing_gpt4 = False  # Flag for GPT-4 trust enhancement
        
        # Store module name and slides for enhancements
        self.module_name = None
        self.slides = []
        
    def _validate_content_uniqueness_v2(self, content: str, content_type: str = "general") -> bool:
        """
        Validate that content is unique and not duplicate
        
        Args:
            content: Content to validate
            content_type: Type of content (slide_title, narration, etc.)
            
        Returns:
            bool: True if content is unique, False if duplicate
        """
        # Normalize content for comparison
        normalized_content = content.strip().lower()
        
        # Check for empty content
        if not normalized_content:
            logger.warning(f"Empty {content_type} content detected")
            return False
            
        # Check for placeholder content
        placeholder_patterns = [
            "insert content here",
            "add details",
            "to be determined",
            "placeholder",
            "[content]",
            "..."
        ]
        
        for pattern in placeholder_patterns:
            if pattern in normalized_content:
                logger.warning(f"Placeholder content detected in {content_type}: {pattern}")
                return False
        
        # Check uniqueness
        content_hash = f"{content_type}:{normalized_content}"
        if content_hash in self._generated_content_cache:
            logger.warning(f"Duplicate {content_type} content detected: {content[:50]}...")
            return False
            
        # Add to cache if unique
        self._generated_content_cache.add(content_hash)
        return True
        
    def _validate_slide_content_match(self, slide: SlideContent) -> bool:
        """
        Validate that slide content matches its title and is coherent
        
        Args:
            slide: SlideContent object to validate
            
        Returns:
            bool: True if content is valid and matches title
        """
        # Check basic requirements
        if not slide.title or not slide.speaker_notes:
            logger.warning(f"Slide {slide.slide_number} missing title or speaker notes")
            return False
            
        # Check title uniqueness
        if slide.title in self._slide_title_cache:
            logger.warning(f"Duplicate slide title detected: {slide.title}")
            return False
        self._slide_title_cache.add(slide.title)
        
        # Check content length
        if len(slide.speaker_notes.split()) < 20:
            logger.warning(f"Slide {slide.slide_number} speaker notes too short: {len(slide.speaker_notes.split())} words")
            return False
            
        # Check bullet points
        if not slide.bullet_points or len(slide.bullet_points) == 0:
            logger.warning(f"Slide {slide.slide_number} has no bullet points")
            return False
            
        # Validate each bullet point
        for i, bullet in enumerate(slide.bullet_points):
            if len(bullet.strip()) < 5:
                logger.warning(f"Slide {slide.slide_number} bullet {i+1} too short")
                return False
                
        # Check title relevance to content
        title_words = set(slide.title.lower().split())
        content_words = set(slide.speaker_notes.lower().split())
        
        # Remove common words
        common_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were'}
        title_words = title_words - common_words
        
        # Check if at least some title words appear in content
        matching_words = title_words.intersection(content_words)
        if len(matching_words) < min(2, len(title_words) * 0.3):
            logger.warning(f"Slide {slide.slide_number} content doesn't match title well. Title: {slide.title}")
            
        return True
        
    def _validate_narration_quality(self, narration: str, expected_duration: float) -> Dict[str, Any]:
        """
        Validate narration quality and completeness
        
        Args:
            narration: Narration text to validate
            expected_duration: Expected duration in seconds
            
        Returns:
            Dict with validation results and metrics
        """
        validation_result = {
            'is_valid': True,
            'warnings': [],
            'metrics': {}
        }
        
        # Check basic requirements
        if not narration:
            validation_result['is_valid'] = False
            validation_result['warnings'].append("Empty narration")
            return validation_result
            
        # Calculate metrics
        word_count = len(narration.split())
        sentence_count = len([s for s in narration.split('.') if s.strip()])
        estimated_duration = word_count / (self.words_per_minute / 60)
        
        validation_result['metrics'] = {
            'word_count': word_count,
            'sentence_count': sentence_count,
            'estimated_duration': estimated_duration,
            'expected_duration': expected_duration
        }
        
        # Check word count
        if word_count < 50:
            validation_result['is_valid'] = False
            validation_result['warnings'].append(f"Narration too short: {word_count} words")
            
        # Check duration match
        duration_difference = abs(estimated_duration - expected_duration)
        if duration_difference > expected_duration * 0.3:  # More than 30% off
            validation_result['warnings'].append(
                f"Duration mismatch: estimated {estimated_duration:.1f}s vs expected {expected_duration:.1f}s"
            )
            
        # Check for repetitive content
        sentences = [s.strip() for s in narration.split('.') if s.strip()]
        unique_sentences = set(sentences)
        if len(unique_sentences) < len(sentences) * 0.8:
            validation_result['warnings'].append("Repetitive content detected in narration")
            
        # Check for incomplete sentences
        incomplete_patterns = [
            "...",
            "[",
            "]",
            "TODO",
            "FIXME",
            "INSERT",
            "ADD"
        ]
        
        for pattern in incomplete_patterns:
            if pattern in narration:
                validation_result['warnings'].append(f"Incomplete content marker found: {pattern}")
                validation_result['is_valid'] = False
                
        # Check for natural flow
        if sentence_count > 0:
            avg_sentence_length = word_count / sentence_count
            if avg_sentence_length > 30:
                validation_result['warnings'].append("Sentences may be too long for natural narration")
            elif avg_sentence_length < 8:
                validation_result['warnings'].append("Sentences may be too short")
                
        return validation_result
        
    def _log_validation_failure(self, validation_type: str, details: Dict[str, Any]) -> None:
        """
        Log validation failures for monitoring and debugging
        
        Args:
            validation_type: Type of validation that failed
            details: Details about the failure
        """
        logger.error(f"Validation failure - {validation_type}: {json.dumps(details, indent=2)}")
        
        # Also store in metadata for tracking
        if not hasattr(self, '_validation_failures'):
            self._validation_failures = []
            
        self._validation_failures.append({
            'type': validation_type,
            'timestamp': datetime.now().isoformat(),
            'details': details
        })
        
    def _create_validation_fallback(self, content_type: str, original_content: Any) -> Any:
        """
        Create fallback content when validation fails
        
        Args:
            content_type: Type of content that failed validation
            original_content: Original content that failed
            
        Returns:
            Fallback content of appropriate type
        """
        logger.info(f"Creating fallback content for {content_type}")
        
        if content_type == "slide_title":
            return f"Section {datetime.now().timestamp()}"
            
        elif content_type == "speaker_notes":
            return "This section covers important concepts that will help you understand the material better."
            
        elif content_type == "bullet_points":
            return [
                "Key concept overview",
                "Important details to remember",
                "Practical applications"
            ]
            
        elif content_type == "narration":
            return "Let's explore this important topic together. Pay attention to the key concepts presented here."
            
        else:
            return original_content
        
    def generate_educational_script(
        self,
        content: Dict[str, Any],
        employee_context: Dict[str, Any],
        target_duration: Optional[int] = None
    ) -> EducationalScript:
        """
        Generate complete educational script from module content
        
        Args:
            content: Module content from database
            employee_context: Employee information for personalization
            target_duration: Target duration in minutes (optional)
            
        Returns:
            EducationalScript with slides and narration
        """
        logger.info(f"Generating educational script for module: {content.get('module_name', 'Unknown')}")
        
        # Store module name for enhancements
        self.module_name = content.get('module_name', 'Training Module')
        
        # Extract content sections
        sections = self._extract_content_sections(content)
        
        # STEP 1: Summarize content sections into teaching materials
        logger.info("Summarizing content sections into educational materials...")
        educational_summaries = self._summarize_content_for_teaching(sections, employee_context)
        
        # STEP 2: Generate learning objectives based on summaries
        learning_objectives = self._generate_learning_objectives_from_summaries(educational_summaries)
        
        # STEP 3: Create slide structure from educational summaries
        slides = []
        slide_number = 1
        
        # Title slide
        title_slide = self._create_title_slide(
            slide_number,
            content.get('module_name', 'Training Module'),
            employee_context,
            learning_objectives
        )
        slides.append(title_slide)
        slide_number += 1
        
        # Content slides for each educational summary (limit to 3-4 sections)
        for i, summary in enumerate(educational_summaries[:4]):  # Limit to 4 sections max
            section_slides = self._create_section_slides_from_summary(
                summary,
                employee_context,
                slide_number
            )
            slides.extend(section_slides)
            slide_number += len(section_slides)
        
        # Summary slide
        key_takeaways = self._extract_key_takeaways(sections)
        summary_slide = self._create_summary_slide(
            slide_number,
            key_takeaways,
            employee_context
        )
        slides.append(summary_slide)
        
        # Store slides for enhancements (must be before any method that uses self.slides)
        self.slides = slides
        
        # Generate full narration
        full_narration = self._combine_narration(slides, employee_context)
        
        # Calculate total duration
        total_duration = sum(slide.duration_estimate for slide in slides)
        
        # Adjust timing if target duration specified
        if target_duration:
            target_seconds = target_duration * 60
            if total_duration > target_seconds * 1.2:  # Too long
                slides = self._compress_content(slides, target_seconds)
                full_narration = self._combine_narration(slides, employee_context)
                total_duration = sum(slide.duration_estimate for slide in slides)
        
        return EducationalScript(
            module_name=content.get('module_name', 'Training Module'),
            total_duration=total_duration,
            slides=slides,
            full_narration=full_narration,
            learning_objectives=learning_objectives,
            key_takeaways=key_takeaways,
            metadata={
                'content_id': content.get('content_id'),
                'employee_name': employee_context.get('name'),
                'generation_timestamp': datetime.now().isoformat(),
                'word_count': len(full_narration.split()),
                'slide_count': len(slides)
            }
        )
    
    def generate_section_script(
        self,
        section_name: str,
        section_content: str,
        module_name: str,
        employee_context: Dict[str, Any],
        all_sections: Dict[str, str] = None,
        target_duration: Optional[int] = None
    ) -> EducationalScript:
        """
        Generate contextually intelligent educational script for a single section
        
        Args:
            section_name: Name of the section (e.g., 'introduction', 'core_content')
            section_content: Content of the specific section
            module_name: Name of the parent module
            employee_context: Employee information for personalization
            all_sections: All course sections for context analysis
            target_duration: Target duration in minutes (default: 3-5 minutes)
            
        Returns:
            EducationalScript with contextual intelligence and real learning value
        """
        logger.info(f"Generating contextually intelligent script for: {section_name} in {module_name}")
        
        # Store module name for enhancements
        self.module_name = module_name
        
        # STEP 1: Use AI to analyze section purpose and determine optimal parameters
        section_intelligence = self._ai_analyze_section_purpose(
            section_name, section_content, module_name, all_sections or {}
        )
        
        # Use AI-determined duration if not specified
        if target_duration is None:
            target_duration = section_intelligence['optimal_duration']
        
        # STEP 2: Analyze course context and section's role in learning journey
        course_context = self._analyze_full_course_context(all_sections or {}, module_name)
        section_role = section_intelligence['educational_role']
        
        # STEP 2: Deep employee analysis for personalized examples
        employee_insights = self._analyze_employee_for_context(employee_context, section_name, course_context)
        
        # STEP 3: Enhanced batch processing with GPT-4 for better performance
        if self.openai_api_key:
            enhanced_content, learning_objectives = self._batch_enhance_content_with_gpt4(
                section_name, section_content, section_role, employee_insights, course_context
            )
        else:
            # Fallback to individual processing without GPT-4
            enhanced_content = section_content
            learning_objectives = self._fallback_objectives_generation(section_name, section_role, employee_insights)
        
        # STEP 5: Create section-specific educational summary from enhanced content
        section_summary = self._create_section_educational_summary(
            section_name, enhanced_content, module_name, employee_context
        )
        
        # Use AI-determined slide count
        max_slides = section_intelligence.get('recommended_slides', 4)
        
        # STEP 6: Create focused slide structure (3-4 slides for better focus)
        slides = []
        slide_number = 1
        
        # Section title slide
        title_slide = self._create_section_title_slide(
            slide_number,
            section_name,
            module_name,
            employee_context,
            learning_objectives
        )
        slides.append(title_slide)
        slide_number += 1
        
        # Content slides using source headings (AI-determined count for optimal pacing)
        content_slides = self._create_section_content_slides_from_source(
            section_summary,
            employee_context,
            slide_number,
            slide_plan=getattr(self, '_current_slide_plan', []),
            max_slides=max_slides - 1  # Subtract title slide
        )
        slides.extend(content_slides)
        
        # Store slides for enhancements (must be before any method that uses self.slides)
        self.slides = slides
        
        # Generate section-specific narration
        full_narration = self._create_section_narration(slides, section_summary, employee_context)
        
        # Calculate total duration and adjust if needed
        total_duration = sum(slide.duration_estimate for slide in slides)
        
        # Adjust timing for target duration
        if target_duration:
            target_seconds = target_duration * 60
            if abs(total_duration - target_seconds) > 30:  # If more than 30s off target
                slides = self._adjust_section_timing(slides, target_seconds)
                total_duration = sum(slide.duration_estimate for slide in slides)
        
        # Extract key takeaways from section
        key_takeaways = self._extract_section_takeaways(section_content)
        
        return EducationalScript(
            module_name=f"{module_name} - {section_name.replace('_', ' ').title()}",
            total_duration=total_duration,
            slides=slides,
            full_narration=full_narration,
            learning_objectives=learning_objectives,
            key_takeaways=key_takeaways,
            metadata={
                'section_name': section_name,
                'parent_module': module_name,
                'employee_name': employee_context.get('name'),
                'target_duration_minutes': target_duration,
                'section_type': self._classify_section_type(section_name),
                'slide_count': len(slides),
                'generation_timestamp': datetime.now().isoformat()
            }
        )
    
    def _extract_content_sections(self, content: Dict[str, Any]) -> Dict[str, str]:
        """Extract and organize content sections"""
        sections = {}
        
        # Standard content sections
        section_keys = [
            'introduction',
            'core_content',
            'practical_applications',
            'case_studies',
            'assessments'
        ]
        
        for key in section_keys:
            if key in content and content[key]:
                sections[key] = content[key]
        
        return sections
    
    def _generate_learning_objectives(self, sections: Dict[str, str]) -> List[str]:
        """Generate learning objectives from content"""
        objectives = []
        
        # Extract from introduction if available
        intro = sections.get('introduction', '')
        if intro:
            # Look for phrases like "learn", "understand", "master"
            obj_patterns = [
                r'will learn (?:about |to |how to )?([^.]+)',
                r'understand (?:the |how )?([^.]+)',
                r'master (?:the |)?([^.]+)',
                r'objectives?:?\s*([^.]+)'
            ]
            
            for pattern in obj_patterns:
                matches = re.findall(pattern, intro, re.IGNORECASE)
                for match in matches[:3]:  # Limit to 3 objectives
                    objective = match.strip()
                    if len(objective) > 10:
                        objectives.append(f"• {objective.capitalize()}")
        
        # Generate default objectives if none found
        if not objectives:
            if 'core_content' in sections:
                objectives = [
                    "• Understand the key concepts and principles",
                    "• Apply knowledge to practical scenarios",
                    "• Develop skills for real-world application"
                ]
        
        return objectives[:5]  # Maximum 5 objectives
    
    def _create_title_slide(
        self,
        slide_number: int,
        module_name: str,
        employee_context: Dict[str, Any],
        learning_objectives: List[str]
    ) -> SlideContent:
        """Create engaging title slide"""
        
        employee_name = employee_context.get('name', 'Learner')
        role = employee_context.get('role', 'Professional')
        
        # Create simple, direct speaker notes
        speaker_notes = f"{module_name}. Training module for {role}."
        
        bullet_points = learning_objectives[:4]  # Just the objectives, no welcome message
        
        slide = SlideContent(
            slide_number=slide_number,
            title=module_name,
            bullet_points=bullet_points,
            speaker_notes=speaker_notes.strip(),
            duration_estimate=self._estimate_duration(speaker_notes),
            visual_cues=["Professional setting", "Welcoming atmosphere"],
            emphasis_points=["specially designed", "excel in your role"]
        )
        
        # Validate slide content
        if not self._validate_slide_content_match(slide):
            self._log_validation_failure("slide_content", {
                "slide_number": slide_number,
                "title": module_name,
                "reason": "Title slide validation failed"
            })
            # Apply fallback if needed
            slide.speaker_notes = self._create_validation_fallback("speaker_notes", slide.speaker_notes)
            slide.bullet_points = self._create_validation_fallback("bullet_points", slide.bullet_points)
        
        return slide
    
    def _create_section_slides(
        self,
        section_name: str,
        section_content: str,
        start_slide_number: int,
        employee_context: Dict[str, Any]
    ) -> List[SlideContent]:
        """Create slides for a content section"""
        slides = []
        
        # Clean section name for display
        display_name = section_name.replace('_', ' ').title()
        
        # Split content into manageable chunks
        chunks = self._split_content_into_chunks(section_content)
        
        for i, chunk in enumerate(chunks):
            # Extract key points
            key_points = self._extract_key_points(chunk)
            
            # Generate speaker notes
            speaker_notes = self._generate_speaker_notes(
                chunk,
                key_points,
                employee_context,
                is_first_slide=(i == 0),
                section_name=display_name
            )
            
            # Determine visual cues based on content
            visual_cues = self._suggest_visual_cues(section_name, chunk)
            
            # Create slide
            slide = SlideContent(
                slide_number=start_slide_number + i,
                title=f"{display_name}" if i == 0 else f"{display_name} (continued)",
                bullet_points=key_points[:self.max_bullet_points],
                speaker_notes=speaker_notes,
                duration_estimate=self._estimate_duration(speaker_notes),
                visual_cues=visual_cues,
                emphasis_points=self._identify_emphasis_points(speaker_notes)
            )
            
            # Validate slide content before appending
            if self._validate_slide_content_match(slide):
                slides.append(slide)
            else:
                self._log_validation_failure("slide_content", {
                    "slide_number": slide.slide_number,
                    "title": slide.title,
                    "section": section_name,
                    "chunk_index": i
                })
                # Create fallback slide with validated content
                slide.speaker_notes = self._create_validation_fallback("speaker_notes", slide.speaker_notes)
                slide.bullet_points = self._create_validation_fallback("bullet_points", slide.bullet_points) if not slide.bullet_points else slide.bullet_points
                slides.append(slide)
        
        return slides
    
    def _split_content_into_chunks(self, content: str, max_chunk_size: int = 500) -> List[str]:
        """Split content into slide-sized chunks"""
        # Split by paragraphs first
        paragraphs = content.split('\n\n')
        
        chunks = []
        current_chunk = ""
        
        for para in paragraphs:
            if len(current_chunk) + len(para) > max_chunk_size and current_chunk:
                chunks.append(current_chunk.strip())
                current_chunk = para
            else:
                current_chunk += "\n\n" + para if current_chunk else para
        
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        return chunks
    
    def _extract_bullet_points_from_notes(self, speaker_notes: str) -> List[str]:
        """Extract bullet points from speaker notes when not provided separately"""
        if not speaker_notes:
            return []
        
        # Split into sentences and find key points
        sentences = self._smart_sentence_split(speaker_notes)
        bullet_points = []
        
        for sentence in sentences[:6]:  # Look at first 6 sentences
            # Skip very short sentences
            if len(sentence.split()) < 5:
                continue
            
            # Format as bullet point
            formatted = self._format_as_bullet_point(sentence)
            if self._validate_bullet_point(formatted):
                bullet_points.append(formatted)
                if len(bullet_points) >= 4:
                    break
        
        return bullet_points
    
    def _extract_key_points(self, content: str) -> List[str]:
        """Extract meaningful bullet points - now primarily used as fallback"""
        # Check if we have parsed slide content with bullet points
        if hasattr(self, '_parsed_slide_content') and self._parsed_slide_content:
            # Collect all bullet points from parsed slides
            all_bullets = []
            for slide in self._parsed_slide_content:
                all_bullets.extend(slide.get('bullet_points', []))
            
            if all_bullets:
                return all_bullets[:4]  # Return first 4 bullet points
        
        # Original logic as fallback
        if not self.openai_api_key:
            return self._fallback_key_points_extraction(content)
        
        try:
            if not openai.api_key:
                logger.warning("OpenAI API key not set, using fallback")
                return self._fallback_key_points_extraction(content)
            
            # Skip redundant GPT-4 call if we already have slide content
            if hasattr(self, '_current_slide_titles') and self._current_slide_titles:
                # We already have enhanced content, extract from it directly
                return self._enhanced_markdown_extraction(content)
            
            # Set GPT-4 processing flag
            if hasattr(self, 'set_gpt4_processing'):
                self.set_gpt4_processing(True)
            
            # Original GPT-4 extraction logic (now rarely used)
            extraction_prompt = f"""
Extract 3-4 clear, actionable bullet points from this educational content. Each bullet point MUST:
1. Be a complete, grammatically correct sentence ending with a period
2. Start with an action verb (Learn, Understand, Master, Apply, etc.)
3. Focus on practical value for the learner
4. Be 8-15 words long
5. Form a complete thought without fragments or colons

CRITICAL REQUIREMENTS:
- Each bullet point must be a complete sentence with proper grammar
- No fragments like "skills that: crucial for..." 
- No incomplete phrases or dangling clauses
- Every bullet point must end with a period (.)

FORMAT: Return ONLY the bullet points, one per line, with NO symbols or numbers.

CONTENT:
{content[:1500]}

COMPLETE SENTENCE BULLET POINTS:
"""
            
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert instructional designer who creates grammatically perfect, complete sentences for learning points. Every bullet point must be a complete sentence ending with a period. Never create fragments or incomplete phrases."},
                    {"role": "user", "content": extraction_prompt}
                ],
                max_tokens=300,
                temperature=0.3,
                timeout=30
            )
            
            bullet_text = response.choices[0].message.content.strip()
            
            bullet_points = []
            for line in bullet_text.split('\n'):
                line = line.strip()
                if not line:
                    continue
                    
                cleaned = self._clean_bullet_point(line)
                
                if self._validate_bullet_point(cleaned):
                    bullet_points.append(cleaned)
            
            if len(bullet_points) >= 2:
                return bullet_points[:4]
            
            return self._enhanced_markdown_extraction(content)
            
        except Exception as e:
            logger.error(f"Failed to extract key points with GPT-4: {e}")
            return self._enhanced_markdown_extraction(content)
        finally:
            # Reset GPT-4 processing flag
            if hasattr(self, 'set_gpt4_processing'):
                self.set_gpt4_processing(False)
    
    def _clean_bullet_point(self, text: str) -> str:
        """Clean a bullet point of unwanted formatting"""
        # Remove common bullet markers
        text = re.sub(r'^[-•*●◆▪]\s*', '', text)
        text = re.sub(r'^\d+[.)\]]\s*', '', text)
        text = re.sub(r'^[a-zA-Z][.)\]]\s*', '', text)
        
        # Remove quotes if they wrap the entire text
        if text.startswith('"') and text.endswith('"'):
            text = text[1:-1]
        if text.startswith("'") and text.endswith("'"):
            text = text[1:-1]
        
        # Remove common prefixes
        prefixes_to_remove = ['Bullet: ', 'Point: ', 'Item: ', '- ']
        for prefix in prefixes_to_remove:
            if text.startswith(prefix):
                text = text[len(prefix):]
        
        return text.strip()
    
    def _validate_bullet_point(self, text: str) -> bool:
        """Validate if a text is a grammatically complete bullet point"""
        # Check length
        word_count = len(text.split())
        if word_count < 5 or word_count > 35:  # Increased to 35 words for educational content
            return False
        
        # Check character count
        if len(text) < 20 or len(text) > 250:  # Increased to 250 chars for complete educational points
            return False
        
        # Ensure it's not just a single word or phrase
        if not ' ' in text:
            return False
        
        # CRITICAL: Check for grammatical completeness
        # Allow colons if they're part of a complete sentence
        if ':' in text:
            # Check if there's substantial content after the colon
            parts = text.split(':', 1)
            if len(parts) == 2:
                after_colon = parts[1].strip()
                # Reject if content after colon is too short (likely a fragment)
                if len(after_colon.split()) < 3:
                    return False
        
        # Must end with proper punctuation
        if not text.strip().endswith(('.', '!', '?')):
            return False
        
        # Check for complete thought (has a verb or action word)
        action_indicators = ['understand', 'learn', 'master', 'develop', 'apply', 'create', 
                           'analyze', 'implement', 'use', 'build', 'design', 'manage',
                           'improve', 'enhance', 'optimize', 'evaluate', 'assess',
                           'identify', 'demonstrate', 'practice', 'explore', 'discover']
        
        text_lower = text.lower()
        has_action = any(indicator in text_lower for indicator in action_indicators)
        
        # Additional check: must form a complete grammatical sentence
        # Simple heuristic: should have subject-verb structure
        # Check for problematic fragments more intelligently
        is_fragment = False
        if ':' in text:
            # Only consider it a fragment if there's very little content after the colon
            before_colon, after_colon = text.split(':', 1)
            # It's a fragment if: short before colon AND short/missing after colon
            if len(before_colon.split()) <= 2 and len(after_colon.strip().split()) < 5:
                is_fragment = True
        
        has_complete_structure = (
            has_action and 
            len(text.split()) >= 5 and  # Minimum words for complete sentence
            not text.lower().startswith(('that', 'which', 'who', 'when', 'where', 'why')) and  # Avoid sentence fragments
            not is_fragment  # Avoid fragments like "reporting: crucial"
        )
        
        return has_complete_structure
    
    def _enhanced_markdown_extraction(self, content: str) -> List[str]:
        """Enhanced extraction with markdown parsing and complete sentence extraction"""
        bullet_points = []
        
        # First, try to find markdown-style lists
        list_patterns = [
            r'^[-*+]\s+(.+)$',  # Markdown bullets
            r'^\d+\.\s+(.+)$',  # Numbered lists
            r'^\s*•\s+(.+)$',   # Bullet character
        ]
        
        lines = content.split('\n')
        for line in lines:
            line = line.strip()
            for pattern in list_patterns:
                match = re.match(pattern, line)
                if match:
                    point = match.group(1).strip()
                    if self._validate_bullet_point(point):
                        bullet_points.append(point)
                        break
        
        # If we found good markdown points, return them
        if len(bullet_points) >= 2:
            return bullet_points[:4]
        
        # Otherwise, extract key sentences
        return self._extract_key_sentences(content)
    
    def _fallback_key_points_extraction(self, content: str) -> List[str]:
        """Fallback method for extracting key points without GPT-4"""
        return self._extract_key_sentences(content)
    
    def _extract_key_sentences(self, content: str) -> List[str]:
        """Extract key sentences that work well as bullet points"""
        # Split into sentences more carefully
        sentences = self._smart_sentence_split(content)
        
        scored_sentences = []
        for sentence in sentences:
            score = self._score_sentence_importance(sentence)
            if score > 0:
                scored_sentences.append((score, sentence))
        
        # Sort by score and take top sentences
        scored_sentences.sort(reverse=True, key=lambda x: x[0])
        
        bullet_points = []
        for score, sentence in scored_sentences[:6]:  # Get more than needed for filtering
            # Clean and format the sentence
            formatted = self._format_as_bullet_point(sentence)
            if self._validate_bullet_point(formatted):
                bullet_points.append(formatted)
                if len(bullet_points) >= 4:
                    break
        
        # If still not enough, create from key concepts
        if len(bullet_points) < 2:
            bullet_points.extend(self._create_bullets_from_concepts(content))
        
        return bullet_points[:4]
    
    def _smart_sentence_split(self, content: str) -> List[str]:
        """Smart sentence splitting that handles abbreviations and edge cases"""
        # Replace known abbreviations to avoid false splits
        abbreviations = ['Dr.', 'Mr.', 'Mrs.', 'Ms.', 'Prof.', 'Sr.', 'Jr.', 'Ph.D.', 
                        'M.D.', 'B.A.', 'M.A.', 'B.S.', 'M.S.', 'LL.B.', 'LL.M.', 
                        'Inc.', 'Corp.', 'Co.', 'Ltd.', 'e.g.', 'i.e.', 'etc.', 'vs.']
        
        temp_content = content
        for abbr in abbreviations:
            temp_content = temp_content.replace(abbr, abbr.replace('.', '<!DOT!>'))
        
        # Split by sentence endings
        sentences = re.split(r'(?<=[.!?])\s+(?=[A-Z])', temp_content)
        
        # Restore dots and clean
        cleaned_sentences = []
        for sentence in sentences:
            sentence = sentence.replace('<!DOT!>', '.').strip()
            if len(sentence) > 15:  # Minimum viable sentence
                cleaned_sentences.append(sentence)
        
        return cleaned_sentences
    
    def _score_sentence_importance(self, sentence: str) -> float:
        """Score a sentence based on its importance for learning"""
        score = 0.0
        sentence_lower = sentence.lower()
        
        # High-value action words
        action_words = {
            'learn': 3, 'understand': 3, 'master': 3, 'develop': 3,
            'apply': 2.5, 'implement': 2.5, 'create': 2.5, 'build': 2.5,
            'improve': 2, 'enhance': 2, 'optimize': 2, 'analyze': 2,
            'enables': 2, 'allows': 2, 'helps': 2, 'provides': 2,
            'key': 2, 'important': 2, 'essential': 2, 'critical': 2,
            'fundamental': 2, 'core': 2, 'primary': 2, 'main': 1.5
        }
        
        for word, weight in action_words.items():
            if word in sentence_lower:
                score += weight
        
        # Bonus for optimal length (40-80 characters)
        length = len(sentence)
        if 40 <= length <= 80:
            score += 1
        elif 80 < length <= 100:
            score += 0.5
        
        # Penalty for too long or too short
        if length > 120 or length < 20:
            score -= 2
        
        # Bonus for containing practical indicators
        practical_indicators = ['example', 'practice', 'real-world', 'application', 
                               'scenario', 'use case', 'demonstrate', 'hands-on']
        if any(indicator in sentence_lower for indicator in practical_indicators):
            score += 1.5
        
        return score
    
    def _format_as_bullet_point(self, sentence: str) -> str:
        """Format a sentence to work well as a bullet point"""
        # Remove unnecessary starting words
        starters_to_remove = [
            'This means that', 'This is', 'It is', 'There are', 'There is',
            'You will find that', 'You can see that', 'We can see',
            'Furthermore,', 'Moreover,', 'Additionally,', 'Also,',
            'In this section,', 'In this module,', 'Here,'
        ]
        
        formatted = sentence
        for starter in starters_to_remove:
            if formatted.lower().startswith(starter.lower()):
                formatted = formatted[len(starter):].strip()
                # Capitalize first letter
                if formatted:
                    formatted = formatted[0].upper() + formatted[1:]
                break
        
        # Ensure it ends with proper punctuation
        if formatted and not formatted[-1] in '.!?':
            formatted += '.'
        
        return formatted
    
    def _create_bullets_from_concepts(self, content: str) -> List[str]:
        """Create bullet points from key concepts when sentence extraction fails"""
        bullets = []
        
        # Extract key concepts (now returns complete sentences)
        key_concepts = self._extract_key_concepts(content)[:3]
        
        # Key concepts are now complete sentences, so we can use them directly
        for concept in key_concepts:
            if self._validate_bullet_point(concept):
                bullets.append(concept)
        
        # If we still don't have enough, create simple learning objectives
        if len(bullets) < 2:
            topics = self._extract_key_topics(content)[:3]
            for topic in topics:
                bullet = f"Learn about {topic.lower()} and its applications."
                if self._validate_bullet_point(bullet):
                    bullets.append(bullet)
        
        return bullets
    
    def _extract_key_phrase(self, sentence: str) -> str:
        """Extract the key phrase from a sentence"""
        # Remove common starter phrases
        starters = ['this means', 'this is', 'you can', 'you will', 'it is', 
                   'there are', 'there is', 'this will', 'these are']
        
        lower_sentence = sentence.lower()
        for starter in starters:
            if lower_sentence.startswith(starter):
                sentence = sentence[len(starter):].strip()
                break
        
        # Extract core message (first 12 words)
        words = sentence.split()[:12]
        key_phrase = ' '.join(words)
        
        # Ensure it ends properly
        if not key_phrase.endswith(('.', '!', '?')):
            key_phrase += '...'
        
        # Capitalize first letter
        if key_phrase:
            key_phrase = key_phrase[0].upper() + key_phrase[1:]
        
        return key_phrase
    
    def _convert_to_learning_objective(self, text: str) -> str:
        """Convert text to a learning objective format"""
        # Remove technical jargon
        simplified = text
        replacements = {
            "leverage": "use",
            "utilize": "apply",
            "implement": "put into practice",
            "facilitate": "enable",
            "optimize": "improve"
        }
        
        for old, new in replacements.items():
            simplified = re.sub(rf'\b{old}\b', new, simplified, flags=re.IGNORECASE)
        
        return simplified
    
    def _transform_to_learning_point(self, sentence: str) -> str:
        """Transform a sentence into a learning-focused point"""
        # Extract core concept
        core = self._extract_key_phrase(sentence)
        
        # Add learning context
        if 'how' in sentence.lower():
            return f"Master how to {core[0].lower()}{core[1:]}"
        elif 'what' in sentence.lower():
            return f"Understand what {core[0].lower()}{core[1:]}"
        elif 'why' in sentence.lower():
            return f"Discover why {core[0].lower()}{core[1:]}"
        else:
            return f"Learn to {core[0].lower()}{core[1:]}"
    
    def _create_learning_objective(self, paragraph: str, index: int) -> str:
        """Create a learning objective from a paragraph"""
        # Get first sentence as basis
        sentences = re.split(r'[.!?]+', paragraph)
        if not sentences:
            return ""
        
        first_sentence = sentences[0].strip()
        
        # Create objective based on position
        objectives = [
            f"Understand the fundamentals of {self._extract_topic(first_sentence)}",
            f"Apply key principles to {self._extract_action(first_sentence)}",
            f"Master techniques for {self._extract_outcome(first_sentence)}"
        ]
        
        return objectives[index % len(objectives)]
    
    def _extract_topic(self, sentence: str) -> str:
        """Extract the main topic from a sentence"""
        # Remove common words and get key nouns
        words = sentence.split()
        important_words = [w for w in words if len(w) > 4 and w[0].isupper()]
        if important_words:
            return ' '.join(important_words[:2]).lower()
        return "this concept"
    
    def _extract_action(self, sentence: str) -> str:
        """Extract action words from a sentence"""
        action_verbs = ['manage', 'create', 'develop', 'build', 'analyze', 'design']
        for verb in action_verbs:
            if verb in sentence.lower():
                # Find context around verb
                idx = sentence.lower().index(verb)
                words_after = sentence[idx:].split()[:3]
                return ' '.join(words_after).lower()
        return "real-world scenarios"
    
    def _extract_outcome(self, sentence: str) -> str:
        """Extract outcome or result from a sentence"""
        outcome_words = ['success', 'performance', 'efficiency', 'results', 'growth']
        for word in outcome_words:
            if word in sentence.lower():
                return f"better {word}"
        return "improved results"
    
    def _summarize_content_for_teaching(self, sections: Dict[str, str], employee_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Summarize content sections into educational materials for 3-4 videos"""
        logger.info("Creating educational summaries from content sections...")
        
        educational_summaries = []
        
        # Process each section and convert to teaching material
        for section_name, section_content in sections.items():
            if not section_content or len(section_content.strip()) < 50:
                continue
                
            # Create educational summary for this section
            summary = {
                'section_name': section_name,
                'display_name': section_name.replace('_', ' ').title(),
                'teaching_objectives': self._extract_teaching_objectives(section_content),
                'key_concepts': self._extract_key_concepts(section_content),
                'practical_applications': self._extract_practical_applications(section_content),
                'learning_points': self._extract_key_points(section_content),
                'speaker_notes': self._create_educational_narration(section_content, employee_context),
                'duration_estimate': self._estimate_section_duration(section_content)
            }
            
            educational_summaries.append(summary)
            
            # Limit to 4 sections for optimal video length
            if len(educational_summaries) >= 4:
                break
        
        logger.info(f"Created {len(educational_summaries)} educational summaries")
        return educational_summaries
    
    def _extract_teaching_objectives(self, content: str) -> List[str]:
        """Extract teaching objectives from content"""
        # Use enhanced learning objective generator if available
        if self.learning_objective_generator and self.module_name:
            objectives = self.learning_objective_generator.generate_objectives_from_content(
                content, self.module_name, max_objectives=3
            )
            # Check if they're fragments and enhance if needed
            if any(self.learning_objective_generator._is_fragment(obj) for obj in objectives):
                objectives = self.learning_objective_generator.enhance_existing_objectives(
                    objectives, self.module_name
                )
            return objectives
        
        # Fallback to original implementation
        objectives = []
        
        # Look for action-oriented content - use greedy matching to get complete phrases
        action_patterns = [
            r'learn\s+(?:how\s+to\s+)?([^.,]+)',
            r'understand\s+([^.,]+)',
            r'master\s+([^.,]+)',
            r'develop\s+([^.,]+)',
            r'improve\s+([^.,]+)',
            r'apply\s+([^.,]+)'
        ]
        
        for pattern in action_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            for match in matches[:2]:  # Max 2 per pattern
                if len(match.strip()) > 5:
                    objectives.append(f"Learn to {match.strip()}")
        
        # If no objectives found, create from key topics
        if not objectives:
            topics = self._extract_key_topics(content)
            for topic in topics[:3]:
                objectives.append(f"Understand {topic}")
        
        return objectives[:3]  # Max 3 objectives per section
    
    def _extract_key_concepts(self, content: str) -> List[str]:
        """Extract key concepts for teaching as complete sentences (no fragments)"""
        concepts = []
        
        # Find important nouns and noun phrases and create complete sentences
        sentences = re.split(r'[.!?]+', content)
        for sentence in sentences:
            # Look for concepts introduced with "is", "are", "means"
            concept_patterns = [
                r'(\w+(?:\s+\w+)?)\s+is\s+(.+?)(?:\.|,|$)',
                r'(\w+(?:\s+\w+)?)\s+are\s+(.+?)(?:\.|,|$)',
                r'(\w+(?:\s+\w+)?)\s+means\s+(.+?)(?:\.|,|$)'
            ]
            
            for pattern in concept_patterns:
                matches = re.findall(pattern, sentence, re.IGNORECASE)
                for concept, definition in matches:
                    if len(concept.strip()) > 2 and len(definition.strip()) > 10:
                        # Create complete sentences instead of fragments
                        complete_sentence = f"Understand that {concept.strip().lower()} is {definition.strip()}."
                        if len(complete_sentence) <= 120:  # Keep reasonable length
                            concepts.append(complete_sentence)
        
        return concepts[:4]  # Max 4 concepts
    
    def _extract_practical_applications(self, content: str) -> List[str]:
        """Extract practical applications from content"""
        applications = []
        
        # Look for practical application indicators - use greedy matching
        app_patterns = [
            r'(?:can be used|apply|implement|practice|use)\s+([^.,]+)',
            r'(?:example|for instance|such as)\s+([^.,]+)',
            r'(?:in practice|in real|in your)\s+([^.,]+)'
        ]
        
        for pattern in app_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            for match in matches[:3]:
                if len(match.strip()) > 10:
                    applications.append(f"Apply: {match.strip()}")
        
        return applications[:3]  # Max 3 applications
    
    def _extract_key_topics(self, content: str) -> List[str]:
        """Extract key topics from content - improved to avoid overlapping fragments"""
        # Split content into sentences first to maintain context
        sentences = re.split(r'[.!?]+', content)
        topics = []
        used_words = set()  # Track words already used in topics
        
        for sentence in sentences:
            words = sentence.strip().split()
            i = 0
            while i < len(words):
                word = words[i]
                # Skip if word already used in a topic
                if i in used_words or not word or len(word) <= 3:
                    i += 1
                    continue
                    
                if word[0].isupper():
                    # Build a meaningful phrase
                    phrase_words = [word]
                    j = i + 1
                    
                    # Continue phrase while it makes sense
                    while j < len(words) and j < i + 4:  # Max 4-word phrases
                        next_word = words[j]
                        # Include if capitalized, connector word, or continues the thought
                        if (next_word[0].isupper() or 
                            next_word.lower() in ['and', 'of', 'for', 'the', 'to', 'in', 'with'] or
                            (j == i + 1 and len(next_word) > 2)):  # Include immediate next word
                            phrase_words.append(next_word)
                            j += 1
                        else:
                            break
                    
                    phrase = ' '.join(phrase_words)
                    # Only add complete, meaningful phrases
                    if len(phrase_words) >= 2 and len(phrase) > 10:
                        topics.append(phrase)
                        # Mark all words in this phrase as used
                        for k in range(i, j):
                            used_words.add(k)
                    
                    i = j  # Skip to after the phrase
                else:
                    i += 1
        
        # Remove duplicates and filter out fragments
        unique_topics = []
        for topic in topics:
            # Skip if it's a subset of an already added topic
            if not any(topic in existing for existing in unique_topics):
                unique_topics.append(topic)
        
        return unique_topics[:5]
    
    def _create_educational_narration(self, content: str, employee_context: Dict[str, Any]) -> str:
        """Create educational narration from content"""
        # Extract key points for narration
        key_points = self._extract_key_points(content)
        
        # Create direct educational flow without conversational transitions
        narration_parts = []
        
        for point in key_points[:3]:
            # Just present the point directly without transitions
            narration_parts.append(point)
        
        return " ".join(narration_parts)
    
    def _estimate_section_duration(self, content: str) -> float:
        """Estimate duration for a section in seconds with enhanced analysis"""
        word_count = len(content.split())
        
        # Calculate complexity
        complexity = self._calculate_content_complexity(content)
        
        # Adjust reading speed based on complexity
        adjusted_wpm = 150 * (1 - complexity * 0.3)  # Slower for complex content
        
        # Base duration
        duration = (word_count / adjusted_wpm) * 60
        
        # Add pause time
        pause_time = self._calculate_pause_time(content)
        duration += pause_time
        
        # Add buffer for comprehension and transitions
        duration *= 1.2  # 20% buffer
        
        return max(30, min(duration, 90))  # Between 30-90 seconds
    
    def _generate_learning_objectives_from_summaries(self, summaries: List[Dict[str, Any]]) -> List[str]:
        """Generate learning objectives from educational summaries"""
        objectives = []
        
        for summary in summaries:
            teaching_objectives = summary.get('teaching_objectives', [])
            objectives.extend(teaching_objectives[:2])  # Max 2 per summary
        
        # Ensure we have at least 3 objectives
        if len(objectives) < 3:
            objectives.extend([
                "Apply new skills in practical situations",
                "Understand key concepts and principles",
                "Master essential techniques and methods"
            ])
        
        return objectives[:6]  # Max 6 total objectives
    
    def _create_section_slides_from_summary(
        self, 
        summary: Dict[str, Any], 
        employee_context: Dict[str, Any], 
        start_slide_number: int
    ) -> List[SlideContent]:
        """Create slides from educational summary"""
        slides = []
        
        # Create main content slide for this section
        slide = SlideContent(
            slide_number=start_slide_number,
            title=summary['display_name'],
            bullet_points=summary['learning_points'],
            speaker_notes=summary['speaker_notes'],
            duration_estimate=summary['duration_estimate'],
            visual_cues=self._suggest_visual_cues(summary['section_name'], summary['speaker_notes']),
            emphasis_points=summary['key_concepts'][:2]  # Top 2 concepts for emphasis
        )
        
        slides.append(slide)
        return slides
    
    def _create_concise_summary(self, paragraph: str) -> str:
        """Create a concise summary of a paragraph"""
        # Find the most important sentence
        sentences = re.split(r'[.!?]+', paragraph)
        if not sentences:
            return ""
        
        # Look for sentence with action words
        for sentence in sentences:
            if any(action in sentence.lower() for action in 
                  ['learn', 'master', 'understand', 'apply', 'create', 'build', 'develop']):
                return self._extract_key_phrase(sentence.strip())
        
        # Otherwise use first sentence
        return self._extract_key_phrase(sentences[0].strip())
    
    def _create_section_educational_summary(
        self, 
        section_name: str, 
        section_content: str, 
        module_name: str, 
        employee_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create educational summary for a single section"""
        
        # Classify section type for targeted processing
        section_type = self._classify_section_type(section_name)
        
        summary = {
            'section_name': section_name,
            'section_type': section_type,
            'display_name': section_name.replace('_', ' ').title(),
            'module_name': module_name,
            'content_length': len(section_content.split()),
            'learning_points': self._extract_key_points(section_content),
            'key_concepts': self._extract_key_concepts(section_content),
            'practical_applications': self._extract_practical_applications(section_content),
            'speaker_notes': self._create_section_specific_narration(
                section_content, section_type, employee_context
            ),
            'duration_estimate': self._estimate_section_duration(section_content)
        }
        
        return summary
    
    def _classify_section_type(self, section_name: str) -> str:
        """Classify section type for targeted educational approach"""
        section_lower = section_name.lower()
        
        if 'introduction' in section_lower or 'intro' in section_lower:
            return 'introduction'
        elif 'core' in section_lower or 'content' in section_lower or 'concept' in section_lower:
            return 'core_content'
        elif 'practical' in section_lower or 'application' in section_lower:
            return 'practical'
        elif 'case' in section_lower or 'study' in section_lower:
            return 'case_study'
        elif 'assessment' in section_lower or 'quiz' in section_lower or 'test' in section_lower:
            return 'assessment'
        else:
            return 'general'
    
    def _extract_section_learning_objectives(self, section_name: str, section_content: str) -> List[str]:
        """Extract learning objectives specific to section type"""
        section_type = self._classify_section_type(section_name)
        objectives = []
        
        # Section-specific objective patterns
        if section_type == 'introduction':
            objectives = [
                f"Understand the importance of {self._extract_main_topic(section_content)}",
                f"Recognize how this knowledge applies to your role",
                f"Set expectations for the learning journey ahead"
            ]
        elif section_type == 'core_content':
            key_concepts = self._extract_key_concepts(section_content)
            for concept in key_concepts[:3]:
                concept_name = concept.split(':')[0] if ':' in concept else concept
                objectives.append(f"Master the concept of {concept_name.lower()}")
        elif section_type == 'practical':
            objectives = [
                f"Apply theoretical knowledge to real scenarios",
                f"Practice implementation strategies",
                f"Develop practical skills for workplace use"
            ]
        elif section_type == 'case_study':
            objectives = [
                f"Analyze complex real-world situations",
                f"Apply problem-solving methodologies",
                f"Learn from successful implementations"
            ]
        elif section_type == 'assessment':
            objectives = [
                f"Validate understanding of key concepts",
                f"Identify areas for further development",
                f"Demonstrate mastery of learning objectives"
            ]
        else:
            # Fallback to content-based objectives
            objectives = self._extract_teaching_objectives(section_content)
        
        return objectives[:3]  # Max 3 objectives per section
    
    def _create_section_title_slide(
        self,
        slide_number: int,
        section_name: str,
        module_name: str,
        employee_context: Dict[str, Any],
        learning_objectives: List[str]
    ) -> SlideContent:
        """Create title slide for section"""
        
        section_display = section_name.replace('_', ' ').title()
        section_type = self._classify_section_type(section_name)
        
        # Section-specific introductions - direct and professional
        intro_text = {
            'introduction': f"Welcome to {module_name}.",
            'core_content': f"Core concepts and principles.",
            'practical': f"Practical applications and examples.",
            'case_study': f"Real-world scenarios and analysis.",
            'assessment': f"Knowledge assessment."
        }.get(section_type, f"{section_display}.")
        
        return SlideContent(
            slide_number=slide_number,
            title=f"{section_display}",
            bullet_points=learning_objectives,
            speaker_notes=f"{intro_text} This section covers specific objectives relevant to your role.",
            duration_estimate=20,  # 20 seconds for title slide
            visual_cues=[f"{section_type}_intro"],
            emphasis_points=learning_objectives[:2]
        )
    
    def _create_section_content_slides(
        self,
        section_summary: Dict[str, Any],
        employee_context: Dict[str, Any],
        start_slide_number: int,
        max_slides: int = 3
    ) -> List[SlideContent]:
        """Create content slides for section"""
        
        slides = []
        learning_points = section_summary['learning_points']
        key_concepts = section_summary['key_concepts']
        section_type = section_summary['section_type']
        
        # Split content into focused chunks
        content_chunks = self._chunk_section_content(learning_points, key_concepts, max_slides)
        
        for i, chunk in enumerate(content_chunks):
            slide_number = start_slide_number + i
            
            # Use dynamic slide titles if available
            if hasattr(self, '_current_slide_titles') and i < len(self._current_slide_titles):
                slide_title = self._current_slide_titles[i]
            else:
                # Fallback to section-specific slide title
                if section_type == 'practical':
                    slide_title = f"Real-World Application {i + 1}"
                elif section_type == 'case_study':
                    slide_title = f"Case Analysis {i + 1}"
                elif section_type == 'assessment':
                    slide_title = f"Knowledge Check {i + 1}"
                else:
                    slide_title = f"Key Concept {i + 1}"
            
            # Estimate duration based on content complexity
            duration = self._estimate_slide_duration(chunk, section_type)
            
            slide = SlideContent(
                slide_number=slide_number,
                title=slide_title,
                bullet_points=chunk,
                speaker_notes=self._create_slide_specific_narration(
                    chunk, section_type, employee_context
                ),
                duration_estimate=duration,
                visual_cues=[f"{section_type}_content"],
                emphasis_points=chunk[:2]  # Emphasize first 2 points
            )
            
            slides.append(slide)
        
        return slides
    
    def _chunk_section_content(
        self, 
        learning_points: List[str], 
        key_concepts: List[str], 
        max_slides: int
    ) -> List[List[str]]:
        """Split content into digestible chunks for slides"""
        
        all_points = learning_points + key_concepts
        if not all_points:
            return [["This section provides important insights for your learning journey."]]
        
        # Aim for 3-4 points per slide for optimal learning
        points_per_slide = max(2, len(all_points) // max_slides)
        
        chunks = []
        for i in range(0, len(all_points), points_per_slide):
            chunk = all_points[i:i + points_per_slide]
            if chunk:  # Only add non-empty chunks
                chunks.append(chunk[:4])  # Max 4 points per slide
        
        return chunks[:max_slides]  # Respect max_slides limit
    
    def _create_section_content_slides_from_source(
        self,
        section_summary: Dict[str, Any],
        employee_context: Dict[str, Any],
        start_slide_number: int,
        slide_plan: List[Dict[str, str]] = None,
        max_slides: int = 3
    ) -> List[SlideContent]:
        """Create content slides using GPT-4 generated slide-specific content"""
        
        slides = []
        section_type = section_summary['section_type']
        
        # Check if we have parsed slide content from GPT-4
        if hasattr(self, '_parsed_slide_content') and self._parsed_slide_content:
            # Use the enhanced slide-specific content
            for i, slide_data in enumerate(self._parsed_slide_content[1:]):  # Skip title slide
                if i >= max_slides:
                    break
                    
                slide_number = start_slide_number + i
                
                # Use GPT-4 generated content
                slide_title = slide_data.get('title', f"Key Concept {i+1}")
                bullet_points = slide_data.get('bullet_points', [])
                speaker_notes = slide_data.get('speaker_notes', '')
                
                # Validate and clean bullet points
                if not bullet_points:
                    # Fallback to extracting from speaker notes
                    bullet_points = self._extract_bullet_points_from_notes(speaker_notes)
                
                # Ensure we have at least 2 bullet points
                while len(bullet_points) < 2:
                    bullet_points.append(f"Key insight about {slide_title}")
                
                # Estimate duration based on content
                duration = self._estimate_slide_duration(bullet_points, section_type)
                
                slide = SlideContent(
                    slide_number=slide_number,
                    title=slide_title,
                    bullet_points=bullet_points[:4],  # Max 4 points
                    speaker_notes=speaker_notes or self._create_slide_specific_narration(
                        bullet_points, section_type, employee_context
                    ),
                    duration_estimate=duration,
                    visual_cues=[f"{section_type}_content"],
                    emphasis_points=bullet_points[:2]
                )
                
                slides.append(slide)
            
            # Clear the parsed content after use
            self._parsed_slide_content = None
            
        else:
            # Fallback to original logic
            learning_points = section_summary['learning_points']
            key_concepts = section_summary['key_concepts']
            
            if slide_plan and len(slide_plan) > 1:
                content_plan = slide_plan[1:]
            else:
                content_chunks = self._chunk_section_content(learning_points, key_concepts, max_slides)
                content_plan = [{"title": f"Key Concept {i+1}", "source": "content"} for i, _ in enumerate(content_chunks)]
            
            if slide_plan:
                content_chunks = self._chunk_content_by_plan(learning_points, key_concepts, content_plan)
            else:
                content_chunks = self._chunk_section_content(learning_points, key_concepts, max_slides)
            
            for i, (chunk, plan_item) in enumerate(zip(content_chunks, content_plan)):
                slide_number = start_slide_number + i
                slide_title = plan_item["title"]
                duration = self._estimate_slide_duration(chunk, section_type)
                
                slide = SlideContent(
                    slide_number=slide_number,
                    title=slide_title,
                    bullet_points=chunk,
                    speaker_notes=self._create_slide_specific_narration(
                        chunk, section_type, employee_context
                    ),
                    duration_estimate=duration,
                    visual_cues=[f"{section_type}_content"],
                    emphasis_points=chunk[:2]
                )
                
                slides.append(slide)
        
        return slides
    
    def _chunk_content_by_plan(
        self,
        learning_points: List[str],
        key_concepts: List[str],
        content_plan: List[Dict[str, str]]
    ) -> List[List[str]]:
        """Chunk content based on source-derived slide plan with intelligent distribution"""
        
        # Ensure we have valid inputs
        if not content_plan:
            logger.warning("No content plan provided, returning empty list")
            return []
        
        all_points = learning_points + key_concepts
        if not all_points:
            return [["This section provides important insights for your learning journey."] for _ in content_plan]
        
        logger.debug(f"Distributing {len(all_points)} points across {len(content_plan)} slides")
        
        # Track which points have been assigned to avoid duplication
        assigned_points = set()
        chunks = []
        
        # First pass: Try to match content semantically to slide titles
        for plan_item in content_plan:
            slide_title = plan_item.get("title", "")
            matched_points = []
            best_matches = []
            
            # Calculate similarity scores for all unassigned points
            for i, point in enumerate(all_points):
                if i in assigned_points:
                    continue
                
                similarity = self._calculate_semantic_similarity(slide_title, point)
                if similarity > 0:
                    best_matches.append((similarity, i, point))
            
            # Sort by similarity and take the best matches
            best_matches.sort(key=lambda x: x[0], reverse=True)
            
            # Assign the most relevant points to this slide
            for similarity, idx, point in best_matches[:4]:  # Max 4 points per slide
                if similarity > 0.1:  # Minimum similarity threshold
                    matched_points.append(point)
                    assigned_points.add(idx)
            
            chunks.append(matched_points)
        
        # Second pass: Distribute remaining unassigned points
        unassigned = [point for i, point in enumerate(all_points) if i not in assigned_points]
        
        if unassigned:
            # Find slides with fewer points and distribute remaining content
            for i, chunk in enumerate(chunks):
                if len(chunk) < 2 and unassigned:  # Slides should have at least 2 points
                    points_needed = min(4 - len(chunk), len(unassigned))
                    chunk.extend(unassigned[:points_needed])
                    unassigned = unassigned[points_needed:]
            
            # If still have unassigned points, distribute evenly to slides with capacity
            slide_idx = 0
            while unassigned and slide_idx < len(chunks):
                if len(chunks[slide_idx]) < 4:  # Max 4 points per slide
                    chunks[slide_idx].append(unassigned.pop(0))
                slide_idx = (slide_idx + 1) % len(chunks)
        
        # Third pass: Ensure every slide has content (generate if needed)
        for i, chunk in enumerate(chunks):
            if not chunk:
                # Generate contextual placeholder content based on slide title
                slide_title = content_plan[i].get("title", f"Key Concept {i+1}")
                if "introduction" in slide_title.lower():
                    chunk.append(f"Welcome to this important section on {slide_title}")
                    chunk.append("Let's explore the key concepts together")
                elif "summary" in slide_title.lower() or "conclusion" in slide_title.lower():
                    chunk.append(f"Let's review what we've learned about {slide_title}")
                    chunk.append("These concepts will be valuable in your work")
                elif "practical" in slide_title.lower() or "application" in slide_title.lower():
                    chunk.append(f"Here's how to apply {slide_title} in real situations")
                    chunk.append("Consider how this relates to your daily tasks")
                else:
                    chunk.append(f"Understanding {slide_title} is crucial for your development")
                    chunk.append("This knowledge will enhance your capabilities")
            
            # Ensure we don't exceed max points per slide
            chunks[i] = chunk[:4]
        
        # Validate uniqueness before returning
        self._validate_content_uniqueness(chunks)
        
        return chunks
    
    def _validate_content_uniqueness(self, chunks: List[List[str]]) -> None:
        """Validate that no content is duplicated across slides"""
        seen_content = set()
        duplicates = []
        
        for i, chunk in enumerate(chunks):
            for point in chunk:
                if point in seen_content:
                    duplicates.append((i, point))
                    logger.warning(f"Duplicate content found in slide {i}: {point[:50]}...")
                seen_content.add(point)
        
        if duplicates:
            logger.error(f"Content duplication detected in {len(duplicates)} instances")
            # Log details for debugging
            for slide_idx, content in duplicates[:3]:  # Show first 3 duplicates
                logger.debug(f"  - Slide {slide_idx}: {content[:80]}...")
    
    def _calculate_semantic_similarity(self, text1: str, text2: str) -> float:
        """Calculate simple semantic similarity between two texts"""
        # Convert to lowercase and split into words
        words1 = set(word.lower() for word in text1.split() if len(word) > 3)
        words2 = set(word.lower() for word in text2.split() if len(word) > 3)
        
        # Calculate Jaccard similarity
        if not words1 or not words2:
            return 0.0
        
        intersection = words1 & words2
        union = words1 | words2
        
        return len(intersection) / len(union) if union else 0.0
    
    def _create_section_specific_narration(
        self,
        section_content: str,
        section_type: str,
        employee_context: Dict[str, Any]
    ) -> str:
        """Create narration tailored to section type"""
        
        # Extract key narration points
        key_points = self._extract_key_points(section_content)
        narration_flow = []
        
        # Add key points directly without conversational transitions
        for point in key_points[:3]:
            narration_flow.append(point)
        
        return " ".join(narration_flow)
    
    def _create_section_narration(
        self,
        slides: List[SlideContent],
        section_summary: Dict[str, Any],
        employee_context: Dict[str, Any]
    ) -> str:
        """Create complete narration for section"""
        
        # Use simple, direct narration without conversational elements
        return self._combine_narration(slides, employee_context)
    
    def _extract_main_topic(self, content: str) -> str:
        """Extract the main topic from content"""
        # Look for headings or important terms
        lines = content.split('\n')
        for line in lines[:5]:  # Check first few lines
            if line.startswith('#') or line.isupper():
                topic = line.replace('#', '').strip()
                if len(topic) > 5:
                    return topic.lower()
        
        # Fallback: use first meaningful phrase
        words = content.split()[:10]
        important_words = [w for w in words if len(w) > 4 and w[0].isupper()]
        if important_words:
            return ' '.join(important_words[:3]).lower()
        
        return "this topic"
    
    def _estimate_slide_duration(self, content_points: List[str], section_type: str) -> float:
        """Estimate duration for a slide based on content complexity and section type"""
        
        # Combine all content for analysis
        combined_content = ' '.join(content_points)
        
        # Calculate base duration from word count
        total_words = len(combined_content.split())
        
        # Analyze content complexity
        complexity_score = self._calculate_content_complexity(combined_content)
        
        # Dynamic words per minute based on complexity and section type
        base_wpm = {
            'introduction': 140,  # Slower for welcoming tone
            'core_content': 130,  # Slower for comprehension
            'practical': 150,     # Normal pace for examples
            'case_study': 140,    # Moderate for storytelling
            'assessment': 145,    # Clear pace for questions
            'summary': 135        # Reflective pace
        }.get(section_type, 150)
        
        # Adjust WPM based on complexity
        adjusted_wpm = base_wpm * (1 - complexity_score * 0.25)
        
        # Calculate speaking duration
        speaking_duration = (total_words / adjusted_wpm) * 60
        
        # Add pause time
        pause_duration = self._calculate_pause_time(combined_content)
        
        # Add time for visual processing (learners need time to read slides)
        visual_processing_time = len(content_points) * 2  # 2 seconds per bullet point
        
        # Section-specific adjustments
        section_adjustments = {
            'introduction': 1.15,  # Extra time for engagement
            'core_content': 1.2,   # Extra time for understanding
            'practical': 1.1,      # Moderate extra time
            'case_study': 1.15,    # Time for reflection
            'assessment': 1.05,    # Minimal extra time
            'summary': 1.1         # Time for recap
        }
        
        adjustment = section_adjustments.get(section_type, 1.0)
        
        # Calculate total duration
        total_duration = (speaking_duration + pause_duration + visual_processing_time) * adjustment
        
        # Ensure minimum engagement time
        min_duration = {
            'introduction': 35,
            'core_content': 40,
            'practical': 30,
            'case_study': 35,
            'assessment': 25,
            'summary': 30
        }.get(section_type, 30)
        
        final_duration = max(min_duration, total_duration)
        
        # Cap at maximum to maintain engagement
        return min(final_duration, 90)  # Cap at 90 seconds per slide
    
    def _create_slide_specific_narration(
        self,
        content_points: List[str],
        section_type: str,
        employee_context: Dict[str, Any]
    ) -> str:
        """Create narration for specific slide content"""
        
        if not content_points:
            return ""
        
        # No section-specific intros - keep content direct
        intro = ""
        
        # Combine points into flowing narration
        narration_parts = []
        
        # Only add intro if it's not empty
        if intro.strip():
            narration_parts.append(intro)
        
        # Add content points without repetitive connectors
        narration_parts.extend(content_points)
        
        return ". ".join(filter(None, narration_parts)) + "."
    
    def _extract_section_takeaways(self, section_content: str) -> List[str]:
        """Extract key takeaways from section content"""
        
        # Look for conclusion or summary patterns
        takeaway_patterns = [
            r'(?:in conclusion|to summarize|key takeaway|remember|important)\s*:?\s*(.+?)(?:\.|$)',
            r'(?:the main point|most important|crucial|essential)\s*:?\s*(.+?)(?:\.|$)'
        ]
        
        takeaways = []
        for pattern in takeaway_patterns:
            matches = re.findall(pattern, section_content, re.IGNORECASE)
            takeaways.extend(matches[:2])
        
        # Fallback: extract from key points
        if not takeaways:
            key_points = self._extract_key_points(section_content)
            takeaways = key_points[:3]  # Just use the points directly without "Remember:"
        
        return takeaways[:3]  # Max 3 takeaways
    
    def _adjust_section_timing(self, slides: List[SlideContent], target_seconds: float) -> List[SlideContent]:
        """Adjust slide timing to meet target duration"""
        
        current_duration = sum(slide.duration_estimate for slide in slides)
        
        if current_duration == 0:
            return slides  # Avoid division by zero
        
        # Calculate adjustment factor
        adjustment_factor = target_seconds / current_duration
        
        # Apply adjustment while respecting reasonable bounds
        for slide in slides:
            new_duration = slide.duration_estimate * adjustment_factor
            # Keep within reasonable bounds (15-120 seconds per slide)
            slide.duration_estimate = max(15, min(new_duration, 120))
        
        return slides
    
    def _generate_speaker_notes(
        self,
        content: str,
        key_points: List[str],
        employee_context: Dict[str, Any],
        is_first_slide: bool,
        section_name: str
    ) -> str:
        """Generate engaging speaker notes with dynamic pacing, emphasis, and personalization"""
        
        employee_name = employee_context.get('name', 'there')
        role = employee_context.get('role', 'Professional')
        experience_level = self._infer_experience_level(role)
        
        # Analyze content complexity for adaptive pacing
        complexity = self._analyze_content_complexity(content)
        
        # Use essence extractor for better content understanding
        if hasattr(self, 'essence_extractor') and self.essence_extractor is not None:
            try:
                slide_essence = self.essence_extractor.extract_slide_essence(
                    content, section_name
                )
                
                # Build narrative with dynamic pacing
                notes_parts = []
                
                if is_first_slide:
                    # Personalized opening based on section and role
                    opening = self._create_personalized_opening(
                        employee_name, role, section_name, complexity
                    )
                    notes_parts.append(opening)
                    notes_parts.append(f"{slide_essence.headline}.")
                
                # Add core insight without conversational markers
                notes_parts.append(slide_essence.insight)
                
                # Add personal impact with role context
                impact_statement = self._create_impact_statement(
                    slide_essence.impact, role, experience_level
                )
                notes_parts.append(impact_statement)
                
                notes = " ".join(notes_parts)
                
            except Exception as e:
                logger.debug(f"Essence extractor failed, using enhanced fallback: {e}")
                notes = self._generate_enhanced_fallback_notes(
                    content, key_points, employee_context, is_first_slide, 
                    section_name, complexity
                )
        else:
            notes = self._generate_enhanced_fallback_notes(
                content, key_points, employee_context, is_first_slide, 
                section_name, complexity
            )
        
        # Add natural transitions and emphasis
        notes = self._add_natural_flow(notes, key_points, employee_name)
        
        # Add timing cues for complex content
        if complexity == 'high':
            notes = self._add_timing_cues(notes)
        
        return notes.strip()
    
    def _infer_experience_level(self, role: str) -> str:
        """Infer experience level from role title"""
        if not role:
            return 'intermediate'
        
        role_lower = role.lower()
        if any(word in role_lower for word in ['junior', 'associate', 'entry', 'trainee', 'intern']):
            return 'beginner'
        elif any(word in role_lower for word in ['senior', 'lead', 'principal', 'manager', 'director', 'head']):
            return 'advanced'
        else:
            return 'intermediate'
    
    def _analyze_content_complexity(self, content: str) -> str:
        """Analyze content complexity for adaptive pacing"""
        words = content.split()
        word_count = len(words)
        
        # Count complex indicators
        technical_terms = len(re.findall(r'\b[A-Z][a-zA-Z]*[A-Z][a-zA-Z]*\b', content))  # CamelCase
        long_words = len([w for w in words if len(w) > 10])
        acronyms = len(re.findall(r'\b[A-Z]{2,}\b', content))
        
        # Calculate complexity score
        complexity_score = (technical_terms * 2 + long_words + acronyms * 1.5) / max(word_count, 1)
        
        if complexity_score > 0.15:
            return 'high'
        elif complexity_score > 0.08:
            return 'medium'
        else:
            return 'low'
    
    def _create_personalized_opening(
        self, 
        employee_name: str, 
        role: str, 
        section_name: str,
        complexity: str
    ) -> str:
        """Create personalized opening based on context"""
        # Return empty string - no conversational openings
        return ""
    
    def _create_impact_statement(self, impact: str, role: str, experience_level: str) -> str:
        """Create personalized impact statement"""
        impact_lower = impact.lower()
        
        # Add role-specific context
        if experience_level == 'beginner':
            prefix = "As you develop your skills, this will help you"
        elif experience_level == 'advanced':
            prefix = "This advanced knowledge will enable you to"
        else:
            prefix = "This will empower you to"
        
        # Add role-specific benefits
        if 'manager' in role.lower():
            suffix = ", leading to better team outcomes and organizational success."
        elif 'analyst' in role.lower():
            suffix = ", resulting in more insightful analysis and data-driven decisions."
        elif 'developer' in role.lower() or 'engineer' in role.lower():
            suffix = ", improving your technical solutions and code quality."
        else:
            suffix = " in your professional journey."
        
        return f"{prefix} {impact_lower}{suffix}"
    
    def _generate_enhanced_fallback_notes(
        self,
        content: str,
        key_points: List[str],
        employee_context: Dict[str, Any],
        is_first_slide: bool,
        section_name: str,
        complexity: str
    ) -> str:
        """Enhanced fallback note generation with better personalization"""
        employee_name = employee_context.get('name', 'there')
        role = employee_context.get('role', 'Professional')
        
        notes_parts = []
        
        if is_first_slide:
            opening = self._create_personalized_opening(
                employee_name, role, section_name, complexity
            )
            notes_parts.append(opening)
        
        # Create narrative from content
        narrative = self._create_content_narrative(content, section_name, complexity)
        notes_parts.append(narrative)
        
        # Add role-specific examples
        if 'practical' in section_name.lower() or complexity == 'medium':
            example = self._generate_role_example(role, key_points)
            if example:
                notes_parts.append(example)
        
        return " ".join(notes_parts)
    
    def _create_content_narrative(self, content: str, section_name: str, complexity: str) -> str:
        """Create engaging narrative from content"""
        # Clean content first
        cleaned = re.sub(r'\s+', ' ', content).strip()
        
        # Return cleaned content directly without conversational additions
        narrative = cleaned
        
        return narrative
    
    def _generate_role_example(self, role: str, key_points: List[str]) -> str:
        """Generate role-specific example"""
        if not key_points:
            return ""
        
        role_lower = role.lower()
        first_point = key_points[0].lower()
        
        if 'manager' in role_lower:
            return f"For instance, when managing your team, you can {first_point}."
        elif 'analyst' in role_lower:
            return f"In your analysis work, this means you'll {first_point}."
        elif 'developer' in role_lower:
            return f"In your development projects, you'll {first_point}."
        else:
            return f"In practice, this allows you to {first_point}."
    
    def _add_natural_flow(self, notes: str, key_points: List[str], employee_name: str) -> str:
        """Add emphasis to notes without conversational transitions"""
        if not notes.endswith('.'):
            notes += '.'
        
        # Simply return the notes without adding transitions or conversational elements
        return notes
    
    def _get_transition_phrase(self, word_count: int) -> str:
        """DEPRECATED - No longer using transition phrases"""
        return ""
    
    def _add_timing_cues(self, notes: str) -> str:
        """Add timing cues for complex content"""
        # Add pauses after complex explanations
        notes = re.sub(r'\. ([A-Z])', r'. [BRIEF PAUSE] \1', notes)
        
        # Add emphasis markers for key terms
        important_terms = ['critical', 'essential', 'important', 'key', 'fundamental', 'crucial']
        for term in important_terms:
            notes = notes.replace(f' {term} ', f' [EMPHASIZE] {term} ')
        
        return notes
    
    def _suggest_visual_cues(self, section_name: str, content: str) -> List[str]:
        """Suggest appropriate visuals for the content"""
        visual_cues = []
        
        # Section-specific visuals
        if 'introduction' in section_name.lower():
            visual_cues.append("Overview diagram")
        elif 'practical' in section_name.lower():
            visual_cues.append("Hands-on demonstration")
            visual_cues.append("Step-by-step process")
        elif 'case' in section_name.lower():
            visual_cues.append("Real-world scenario")
            visual_cues.append("Success story visual")
        elif 'assessment' in section_name.lower():
            visual_cues.append("Knowledge check")
            visual_cues.append("Interactive quiz visual")
        
        # Content-based visuals
        if 'process' in content.lower() or 'steps' in content.lower():
            visual_cues.append("Process flow diagram")
        if 'compare' in content.lower() or 'versus' in content.lower():
            visual_cues.append("Comparison chart")
        if any(word in content.lower() for word in ['data', 'statistics', 'numbers']):
            visual_cues.append("Data visualization")
        
        return visual_cues[:2]  # Limit to 2 visual cues
    
    def _identify_emphasis_points(self, speaker_notes: str) -> List[str]:
        """Identify words/phrases to emphasize in narration"""
        emphasis_words = []
        
        # Important indicators
        important_patterns = [
            r'(?:most |very |extremely )?important(?:ly)?',
            r'key (?:point|concept|idea)',
            r'remember (?:that|this)',
            r'essential(?:ly)?',
            r'critical(?:ly)?',
            r'must (?:know|understand|remember)'
        ]
        
        for pattern in important_patterns:
            matches = re.findall(pattern, speaker_notes, re.IGNORECASE)
            emphasis_words.extend(matches)
        
        return list(set(emphasis_words))[:5]  # Unique, limited to 5
    
    def _create_summary_slide(
        self,
        slide_number: int,
        key_takeaways: List[str],
        employee_context: Dict[str, Any]
    ) -> SlideContent:
        """Create summary slide"""
        
        # Use enhanced slide 6 generator if available
        if self.slide6_enhancer and hasattr(self, 'slides') and self.module_name:
            enhanced_slide_data = self.slide6_enhancer.create_enhanced_summary_slide(
                self.module_name,
                self.slides,  # Previous slides for context
                key_takeaways,
                employee_context
            )
            
            return SlideContent(
                slide_number=slide_number,
                title=enhanced_slide_data['title'],
                bullet_points=enhanced_slide_data['bullet_points'],
                speaker_notes=enhanced_slide_data['speaker_notes'],
                duration_estimate=enhanced_slide_data['duration_estimate'],
                visual_cues=enhanced_slide_data['visual_cues'],
                emphasis_points=enhanced_slide_data['emphasis_points']
            )
        
        # Fallback to original implementation
        # Simple, direct summary without conversational elements
        speaker_notes = "Key takeaways from this module."
        
        return SlideContent(
            slide_number=slide_number,
            title="Key Takeaways",
            bullet_points=key_takeaways[:5],
            speaker_notes=speaker_notes.strip(),
            duration_estimate=25.0,  # 25 seconds for summary
            visual_cues=["Summary infographic", "Success celebration"],
            emphasis_points=["essential points", "important step"]
        )
    
    def _extract_key_takeaways(self, sections: Dict[str, str]) -> List[str]:
        """Extract key takeaways from all sections"""
        takeaways = []
        
        # Look for summary-like content
        for section_name, content in sections.items():
            if 'summary' in content.lower() or 'conclusion' in content.lower():
                # Extract from summary section
                sentences = re.split(r'[.!?]+', content)
                for sentence in sentences[:3]:
                    if len(sentence.strip()) > 20:
                        takeaways.append(sentence.strip())
        
        # If no explicit summary, extract from each section
        if not takeaways:
            for section_name, content in sections.items():
                # Get first important sentence from each section
                sentences = re.split(r'[.!?]+', content)
                for sentence in sentences:
                    if any(word in sentence.lower() for word in 
                          ['important', 'key', 'remember', 'essential']):
                        takeaways.append(sentence.strip())
                        break
        
        # Generate default takeaways if needed
        if len(takeaways) < 3:
            default_takeaways = [
                "Master the fundamental concepts covered",
                "Apply knowledge to real-world scenarios",
                "Continue developing expertise in this area"
            ]
            takeaways.extend(default_takeaways[len(takeaways):3])
        
        return takeaways[:5]
    
    def _combine_narration(self, slides: List[SlideContent], employee_context: Dict[str, Any]) -> str:
        """Combine all speaker notes into full narration with natural flow"""
        
        # HumanNarrationGenerator completely removed - it creates gibberish
        # Use simple, clean narration only
        narration_parts = []
        name = employee_context.get('name', '')
        
        # No greeting - just start with the content
        
        # Add slide content naturally without duplication
        seen_content = set()
        for i, slide in enumerate(slides):
            # Add speaker notes cleanly, avoiding duplicates
            if slide.speaker_notes:
                clean_notes = self._clean_narration_text(slide.speaker_notes)
                # Skip if we've already seen this exact content
                if clean_notes not in seen_content and len(clean_notes.strip()) > 10:
                    seen_content.add(clean_notes)
                    narration_parts.append(clean_notes)
        
        full_narration = " ".join(narration_parts)
        
        # Validate the complete narration
        total_duration = sum(slide.duration_estimate for slide in slides)
        validation_result = self._validate_narration_quality(full_narration, total_duration)
        
        if not validation_result['is_valid']:
            self._log_validation_failure("narration", {
                "slide_count": len(slides),
                "expected_duration": total_duration,
                "validation_warnings": validation_result['warnings'],
                "metrics": validation_result['metrics']
            })
            # If narration is invalid, create a fallback
            full_narration = self._create_validation_fallback("narration", full_narration)
        elif validation_result['warnings']:
            logger.warning(f"Narration validation warnings: {validation_result['warnings']}")
            
        return full_narration
    
    def _clean_narration_text(self, text: str) -> str:
        """Clean narration text to remove artifacts"""
        if not text:
            return ""
        
        # Remove numbered list artifacts (e.g., "content 3.", "content\n2.")
        text = re.sub(r'\s*\n?\s*\d+\.\s*$', '.', text)
        text = re.sub(r'\s+\d+\.\s*$', '.', text)
        
        # Remove double periods
        text = re.sub(r'\.\.+', '.', text)
        
        # Fix spacing issues
        text = re.sub(r'\s+', ' ', text)
        
        # Remove trailing commas before periods
        text = re.sub(r',\s*\.', '.', text)
        
        # Fix broken grammar patterns like "skills that is crucial"
        text = re.sub(r'\bthat is\b', 'that are', text)
        text = re.sub(r'\bskills that are\b', 'these skills are', text)
        
        # Remove newlines within sentences
        text = re.sub(r'\n+', ' ', text)
        
        # Ensure proper sentence ending
        text = text.strip()
        if text and not text.endswith(('.', '!', '?')):
            text += '.'
        
        return text
    
    def _clean_slide_format_from_content(self, content: str) -> str:
        """Remove 'Slide X:' patterns that create colon fragments in bullet points"""
        import re
        
        # Remove "Slide N: Title" patterns at the beginning of lines
        content = re.sub(r'^Slide\s+\d+:\s*(.+?)$', r'\1', content, flags=re.MULTILINE)
        
        # Remove standalone "Slide N:" patterns
        content = re.sub(r'^Slide\s+\d+:\s*$', '', content, flags=re.MULTILINE)
        
        # Clean up any resulting empty lines
        content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
        
        return content.strip()
    
    def _clean_colon_fragments_from_content(self, content: str) -> str:
        """Remove colon fragments that create broken bullet points"""
        import re
        
        # Fix patterns like "skills that: crucial for" -> "skills that are crucial for"
        content = re.sub(r'\b(\w+(?:\s+\w+)*)\s*:\s*(\w+(?:\s+\w+)*)', r'\1 are \2', content)
        
        # Fix "Understand that X:" patterns specifically
        content = re.sub(r'Understand that ([^:]+):\s*([^.]+)', r'Understand that \1 are \2', content)
        
        return content
    
    def _estimate_duration(self, speaker_notes: str) -> float:
        """Estimate speaking duration in seconds with enhanced complexity analysis"""
        word_count = len(speaker_notes.split())
        
        # Calculate content complexity
        complexity_score = self._calculate_content_complexity(speaker_notes)
        
        # Adjust words per minute based on complexity
        adjusted_wpm = self.words_per_minute * (1 - complexity_score * 0.3)
        
        # Base duration calculation
        duration = (word_count / adjusted_wpm) * 60
        
        # Add time for natural pauses
        pause_time = self._calculate_pause_time(speaker_notes)
        duration += pause_time
        
        # Add time for emphasis and comprehension
        if 'important' in speaker_notes.lower() or 'key' in speaker_notes.lower():
            duration *= 1.1  # 10% slower for important content
        
        # Ensure within bounds
        duration = max(self.min_slide_duration, min(duration, self.max_slide_duration))
        
        return round(duration, 1)
    
    def _calculate_content_complexity(self, text: str) -> float:
        """Calculate complexity score (0-1) based on content analysis"""
        words = text.split()
        sentences = re.split(r'[.!?]+', text)
        
        # Average sentence length
        avg_sentence_length = len(words) / max(len([s for s in sentences if s.strip()]), 1)
        
        # Technical term density
        technical_terms = ['algorithm', 'framework', 'implementation', 'architecture', 
                         'methodology', 'analysis', 'synthesis', 'evaluation', 'integration']
        technical_count = sum(1 for word in words if word.lower() in technical_terms)
        technical_density = technical_count / max(len(words), 1)
        
        # Multi-syllable word ratio (approximation)
        complex_words = sum(1 for word in words if len(word) > 7)
        complex_ratio = complex_words / max(len(words), 1)
        
        # Calculate overall complexity
        complexity = (
            min(avg_sentence_length / 25, 1) * 0.4 +  # Sentence complexity
            technical_density * 0.3 +  # Technical content
            complex_ratio * 0.3  # Word complexity
        )
        
        return min(complexity, 1.0)
    
    def _calculate_pause_time(self, text: str) -> float:
        """Calculate additional time needed for natural pauses"""
        pause_time = 0
        
        # Count punctuation pauses
        pause_time += text.count(',') * 0.3  # Short pause
        pause_time += text.count('.') * 0.5  # Medium pause
        pause_time += text.count('!') * 0.6  # Emphasis pause
        pause_time += text.count('?') * 0.6  # Question pause
        pause_time += text.count(':') * 0.4  # List pause
        pause_time += text.count(';') * 0.4  # Semi-colon pause
        
        # Count transition word pauses
        transition_words = ['however', 'therefore', 'furthermore', 'moreover', 
                          'nevertheless', 'consequently', 'additionally']
        for word in transition_words:
            pause_time += text.lower().count(word) * 0.3
        
        # Count emphasis phrase pauses
        emphasis_phrases = ['pay attention', 'important to note', 'key point', 
                          'remember that', 'for example']
        for phrase in emphasis_phrases:
            pause_time += text.lower().count(phrase) * 0.4
        
        return pause_time
    
    def _compress_content(self, slides: List[SlideContent], target_seconds: float) -> List[SlideContent]:
        """Compress content to fit target duration"""
        current_duration = sum(slide.duration_estimate for slide in slides)
        compression_ratio = target_seconds / current_duration
        
        compressed_slides = []
        for slide in slides:
            # Compress speaker notes
            if compression_ratio < 0.8:  # Significant compression needed
                words = slide.speaker_notes.split()
                target_words = int(len(words) * compression_ratio)
                compressed_notes = ' '.join(words[:target_words]) + "..."
                
                slide.speaker_notes = compressed_notes
                slide.duration_estimate *= compression_ratio
            
            compressed_slides.append(slide)
        
        return compressed_slides
    
    def export_script_to_json(self, script: EducationalScript, output_path: str) -> None:
        """Export script to JSON format"""
        script_data = {
            'module_name': script.module_name,
            'total_duration': script.total_duration,
            'total_duration_minutes': round(script.total_duration / 60, 1),
            'learning_objectives': script.learning_objectives,
            'key_takeaways': script.key_takeaways,
            'full_narration': script.full_narration,
            'metadata': script.metadata,
            'slides': []
        }
        
        for slide in script.slides:
            script_data['slides'].append({
                'slide_number': slide.slide_number,
                'title': slide.title,
                'bullet_points': slide.bullet_points,
                'speaker_notes': slide.speaker_notes,
                'duration_estimate': slide.duration_estimate,
                'visual_cues': slide.visual_cues,
                'emphasis_points': slide.emphasis_points
            })
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(script_data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Script exported to: {output_path}")
    
    # ========== CONTEXTUAL INTELLIGENCE METHODS ==========
    
    def _ai_analyze_section_purpose(
        self, 
        section_name: str, 
        section_content: str, 
        module_name: str,
        all_sections: Dict[str, str]
    ) -> Dict[str, Any]:
        """Use AI to intelligently analyze section purpose and determine optimal parameters"""
        
        # Content analysis
        word_count = len(section_content.split())
        has_learning_objectives = any(phrase in section_content.lower() for phrase in 
            ['learning objective', 'you will learn', 'by the end', 'objectives'])
        has_practical_examples = any(phrase in section_content.lower() for phrase in 
            ['example', 'case study', 'practical', 'real-world', 'application'])
        has_assessments = any(phrase in section_content.lower() for phrase in 
            ['quiz', 'test', 'assessment', 'check your understanding'])
        
        # Analyze section position in course
        section_names = list(all_sections.keys())
        section_index = section_names.index(section_name) if section_name in section_names else 0
        is_first_section = section_index == 0
        is_last_section = section_index == len(section_names) - 1
        
        # Determine section purpose
        section_lower = section_name.lower()
        content_lower = section_content.lower()
        
        # Smart detection based on content, not just name
        if is_first_section or 'welcome' in content_lower or 'overview' in content_lower:
            section_type = 'introduction'
            purpose = 'orientation'
        elif has_assessments:
            section_type = 'assessment'
            purpose = 'evaluation'
        elif has_practical_examples and ('apply' in content_lower or 'implement' in content_lower):
            section_type = 'practical'
            purpose = 'application'
        elif 'case' in section_lower or 'scenario' in content_lower:
            section_type = 'case_study'
            purpose = 'analysis'
        elif is_last_section and ('summary' in content_lower or 'conclusion' in content_lower):
            section_type = 'summary'
            purpose = 'reinforcement'
        else:
            section_type = 'core_content'
            purpose = 'teaching'
        
        # Enhanced dynamic duration logic for better engagement
        content_richness = self._calculate_content_richness(section_content)
        engagement_factor = self._calculate_engagement_factor(section_content, has_practical_examples, has_learning_objectives)
        
        if purpose == 'orientation':
            # Introductions - balance concise with thorough orientation
            base_duration = max(2, min(4, word_count / 250))  # 2-4 minutes
            recommended_slides = min(5, max(3, len(self._extract_markdown_headings(section_content)) or 3))
            pacing = 1.3  # Slightly faster for orientation
        elif purpose == 'evaluation':
            # Assessments need time for reflection and interaction
            base_duration = max(4, min(8, word_count / 180))  # 4-8 minutes
            recommended_slides = min(6, max(4, word_count // 150))
            pacing = 0.8  # Slower for comprehension
        elif purpose == 'application':
            # Practical sections need detailed explanation and examples
            base_duration = max(5, min(10, word_count / 160))  # 5-10 minutes
            recommended_slides = min(8, max(5, word_count // 120))
            pacing = 0.9  # Slightly slower for practical understanding
        elif purpose == 'analysis':
            # Case studies need thorough exploration and discussion
            base_duration = max(6, min(12, word_count / 140))  # 6-12 minutes
            recommended_slides = min(10, max(6, word_count // 100))
            pacing = 0.85  # Slower for analysis
        elif purpose == 'reinforcement':
            # Summaries with adequate review time
            base_duration = max(3, min(6, word_count / 200))  # 3-6 minutes
            recommended_slides = min(5, max(3, word_count // 150))
            pacing = 1.1  # Slightly faster for review
        else:  # teaching
            # Core content with appropriate depth for understanding
            base_duration = max(4, min(8, word_count / 180))  # 4-8 minutes
            # Enhanced slide recommendation based on content structure
            recommended_slides = min(8, max(4, max(word_count // 130, headings_count + 1)))
            pacing = 1.0  # Normal pacing
        
        # Apply engagement and richness factors
        optimal_duration = base_duration * (1 + engagement_factor * 0.3) * (1 + content_richness * 0.2)
        
        # Enhanced duration calculation based on content structure and engagement requirements
        headings_count = len(self._extract_markdown_headings(section_content))
        
        # Base minimum duration on content richness and structure
        if word_count > 500:  # Rich content deserves more time
            min_duration = 4.5  # Increased from 4.0 for substantial content
        else:
            min_duration = 3.5  # Increased from 3.0 for shorter content
            
        # For sections with multiple headings (like our 6-heading introduction), ensure proper coverage
        if headings_count >= 5:
            # Rich structured content needs significant time for proper coverage
            heading_time = headings_count * 0.8  # 48 seconds per heading minimum
            min_duration = max(min_duration, heading_time)
            logger.info(f"📊 Rich content with {headings_count} headings - minimum duration: {min_duration:.1f} minutes")
        elif headings_count >= 3:
            # Moderate structured content
            heading_time = headings_count * 0.7  # 42 seconds per heading
            min_duration = max(min_duration, heading_time)
            
        optimal_duration = max(optimal_duration, min_duration)
        
        # Special handling for introduction sections with comprehensive content
        if purpose == 'orientation' and headings_count >= 4:
            # Introduction sections with many headings need extra time for proper orientation
            comprehensive_time = headings_count * 0.9  # 54 seconds per heading for introductions
            optimal_duration = max(optimal_duration, comprehensive_time)
            logger.info(f"📋 Comprehensive introduction with {headings_count} headings - target duration: {optimal_duration:.1f} minutes")
        
        # Get educational role
        educational_role = self._get_section_role(section_type)
        
        return {
            'type': section_type,
            'purpose': purpose,
            'optimal_duration': optimal_duration,
            'recommended_slides': recommended_slides,
            'pacing': pacing,
            'educational_role': educational_role,
            'content_characteristics': {
                'word_count': word_count,
                'has_objectives': has_learning_objectives,
                'has_examples': has_practical_examples,
                'has_assessments': has_assessments,
                'position': 'beginning' if is_first_section else 'end' if is_last_section else 'middle'
            }
        }
    
    def _analyze_full_course_context(self, all_sections: Dict[str, str], module_name: str) -> Dict[str, Any]:
        """Analyze the complete course to understand learning journey and relationships"""
        context = {
            'module_name': module_name,
            'total_sections': len(all_sections),
            'learning_flow': [],
            'complexity_progression': 'linear',
            'key_themes': [],
            'practical_focus': False
        }
        
        # Analyze learning flow progression
        section_order = ['introduction', 'core_content', 'practical_applications', 'case_studies', 'assessments']
        for section_name in section_order:
            if section_name in all_sections:
                context['learning_flow'].append({
                    'section': section_name,
                    'word_count': len(all_sections[section_name].split()),
                    'complexity': self._assess_content_complexity(all_sections[section_name])
                })
        
        # Extract key themes across all sections
        all_content = ' '.join(all_sections.values())
        context['key_themes'] = self._extract_course_themes(all_content)
        
        # Determine if course has practical focus
        practical_indicators = ['application', 'practice', 'implement', 'use', 'apply', 'example']
        practical_count = sum(all_content.lower().count(word) for word in practical_indicators)
        context['practical_focus'] = practical_count > len(all_content.split()) * 0.02
        
        return context
    
    def _determine_section_role_in_journey(self, section_name: str, section_content: str, course_context: Dict[str, Any]) -> Dict[str, Any]:
        """Determine this section's specific role in the learning journey"""
        role = {
            'type': self._classify_section_type(section_name),
            'position': 'middle',
            'builds_on': [],
            'prepares_for': [],
            'unique_value': '',
            'teaching_approach': 'informational'
        }
        
        # Determine position in learning flow
        flow_positions = [flow['section'] for flow in course_context['learning_flow']]
        if section_name in flow_positions:
            index = flow_positions.index(section_name)
            if index == 0:
                role['position'] = 'foundation'
                role['teaching_approach'] = 'engaging_introduction'
            elif index == len(flow_positions) - 1:
                role['position'] = 'culmination'
                role['teaching_approach'] = 'synthesis_validation'
            else:
                role['position'] = 'building'
                role['teaching_approach'] = 'progressive_development'
        
        # Determine what this section builds on and prepares for
        if role['type'] == 'introduction':
            role['unique_value'] = 'Sets foundation and motivates learning'
            role['prepares_for'] = ['understanding core concepts', 'practical application']
        elif role['type'] == 'core_content':
            role['unique_value'] = 'Develops essential knowledge and skills'
            role['builds_on'] = ['basic understanding from introduction']
            role['prepares_for'] = ['practical application', 'real-world scenarios']
        elif role['type'] == 'practical':
            role['unique_value'] = 'Bridges theory to real-world application'
            role['builds_on'] = ['core concepts and principles']
            role['prepares_for'] = ['independent implementation', 'problem-solving']
        
        return role
    
    def _analyze_employee_for_context(self, employee_context: Dict[str, Any], section_name: str, course_context: Dict[str, Any]) -> Dict[str, Any]:
        """Deep analysis of employee context for personalized content generation"""
        insights = {
            'name': employee_context.get('name', 'Learner'),
            'role': employee_context.get('role', 'Professional'),
            'experience_level': 'intermediate',
            'learning_style_preferences': [],
            'relevant_examples': [],
            'motivation_factors': [],
            'challenge_areas': []
        }
        
        # Infer experience level from role
        role = (insights['role'] or 'Professional').lower()  # Handle None role
        if any(word in role for word in ['junior', 'associate', 'entry', 'trainee']):
            insights['experience_level'] = 'beginner'
        elif any(word in role for word in ['senior', 'lead', 'manager', 'director']):
            insights['experience_level'] = 'advanced'
        
        # Generate role-specific examples based on section and course themes
        insights['relevant_examples'] = self._generate_role_specific_examples(
            insights['role'], section_name, course_context['key_themes']
        )
        
        # Determine motivation factors based on section type and role
        if section_name == 'introduction':
            insights['motivation_factors'] = [
                f"How this directly impacts your success as a {insights['role']}",
                "Real career advancement opportunities",
                "Immediate practical benefits you'll see"
            ]
        elif 'practical' in section_name or 'application' in section_name:
            insights['motivation_factors'] = [
                "Tools you can use immediately in your work",
                "Problems this will help you solve",
                "Ways to stand out in your role"
            ]
        
        return insights
    
    def _generate_contextual_objectives(self, section_name: str, section_content: str, section_role: Dict[str, Any], employee_insights: Dict[str, Any]) -> List[str]:
        """Generate learning objectives that are contextual, progressive, and personally relevant"""
        
        if not self.openai_api_key:
            return self._fallback_objectives_generation(section_name, section_role, employee_insights)
        
        try:
            # Set GPT-4 processing flag
            if hasattr(self, 'set_gpt4_processing'):
                self.set_gpt4_processing(True)
            
            objectives_prompt = f"""
Create 3 specific, actionable learning objectives for this section. Each objective should:
1. Be specific to what the learner will achieve
2. Be relevant to a {employee_insights['role']} in their daily work
3. Use measurable action verbs (understand, apply, analyze, create, etc.)
4. Be concise (10-15 words max)

CONTEXT:
- Section: {section_name} ({section_role['teaching_approach']})
- Employee Role: {employee_insights['role']}
- Experience Level: {employee_insights['experience_level']}

SECTION CONTENT:
{section_content[:800]}

Return exactly 3 learning objectives, one per line:
"""
            
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert instructional designer who creates precise, actionable learning objectives."},
                    {"role": "user", "content": objectives_prompt}
                ],
                max_tokens=200,
                temperature=0.2,
                timeout=30  # Add timeout for reliability
            )
            
            objectives_text = response.choices[0].message.content.strip()
            objectives = [line.strip() for line in objectives_text.split('\n') if line.strip()]
            
            # Clean and validate objectives
            clean_objectives = []
            for obj in objectives[:3]:
                # Remove any numbering or bullet points
                obj = re.sub(r'^\d+\.\s*', '', obj)
                obj = re.sub(r'^[-•*]\s*', '', obj)
                
                # Ensure it starts with an action verb
                if len(obj) > 10 and len(obj) <= 120:
                    clean_objectives.append(obj)
            
            return clean_objectives[:3] if clean_objectives else self._fallback_objectives_generation(section_name, section_role, employee_insights)
            
        except Exception as e:
            logger.error(f"Failed to generate contextual objectives with GPT-4: {e}")
            return self._fallback_objectives_generation(section_name, section_role, employee_insights)
        finally:
            # Reset GPT-4 processing flag
            if hasattr(self, 'set_gpt4_processing'):
                self.set_gpt4_processing(False)
    
    def _fallback_objectives_generation(self, section_name: str, section_role: Dict[str, Any], employee_insights: Dict[str, Any]) -> List[str]:
        """Fallback method for generating objectives without GPT-4"""
        section_type = section_role.get('type', 'general')
        role = employee_insights.get('role', 'Professional')
        
        if section_type == 'introduction':
            return [
                f"Understand the importance of this topic for {role}s",
                f"Recognize key applications in your daily work",
                f"Set expectations for practical implementation"
            ]
        elif section_type == 'core_content':
            return [
                f"Master fundamental concepts and principles",
                f"Apply core knowledge to {role} scenarios",
                f"Build foundation for advanced topics"
            ]
        elif section_type == 'practical':
            return [
                f"Implement strategies in real {role} situations",
                f"Practice hands-on techniques and methods",
                f"Develop confidence through application"
            ]
        else:
            return [
                f"Gain expertise relevant to {role} responsibilities",
                f"Connect learning to workplace challenges",
                f"Prepare for immediate practical use"
            ]
    
    def _assess_content_complexity(self, content: str) -> str:
        """Assess the complexity level of content"""
        word_count = len(content.split())
        technical_terms = len(re.findall(r'\b[A-Z][a-z]*[A-Z][a-z]*\b', content))  # CamelCase words
        
        complexity_ratio = technical_terms / max(word_count, 1)
        
        if complexity_ratio > 0.05:
            return 'high'
        elif complexity_ratio > 0.02:
            return 'medium'
        else:
            return 'low'
    
    def _extract_course_themes(self, all_content: str) -> List[str]:
        """Extract major themes across the entire course"""
        # Find most frequently mentioned important terms
        words = re.findall(r'\b[a-zA-Z]{4,}\b', all_content.lower())
        
        # Filter out common words
        common_words = {'that', 'this', 'with', 'have', 'will', 'your', 'they', 'from', 'were', 'been', 'their', 'said', 'each', 'which', 'them', 'than', 'many', 'some', 'what', 'would', 'make', 'like', 'into', 'time', 'very', 'when', 'much', 'know', 'take', 'just', 'first', 'come', 'work', 'also', 'after', 'back', 'other', 'good', 'well', 'such', 'through', 'should', 'being', 'most', 'over', 'think', 'where', 'only', 'those', 'people', 'could', 'there', 'more', 'these', 'need', 'want', 'going'}
        
        filtered_words = [word for word in words if word not in common_words and len(word) > 4]
        
        # Count frequencies and get top themes
        from collections import Counter
        word_counts = Counter(filtered_words)
        themes = [word.title() for word, count in word_counts.most_common(5) if count > 2]
        
        return themes
    
    def _generate_role_specific_examples(self, role: str, section_name: str, themes: List[str]) -> List[str]:
        """Generate examples relevant to the employee's specific role"""
        examples = []
        role_lower = (role or 'Professional').lower()  # Handle None role
        
        # Role-based example templates
        if 'manager' in role_lower or 'lead' in role_lower:
            examples = [
                f"When leading your team through implementation",
                f"During performance reviews and team development",
                f"While making strategic decisions for your department"
            ]
        elif 'analyst' in role_lower:
            examples = [
                f"When analyzing data and creating reports",
                f"During stakeholder presentations",
                f"While identifying trends and patterns"
            ]
        elif 'sales' in role_lower:
            examples = [
                f"During client presentations and proposals",
                f"When handling customer objections",
                f"While building long-term client relationships"
            ]
        else:
            # Generic professional examples
            examples = [
                f"In your daily {role} responsibilities",
                f"During team collaborations and meetings",
                f"When presenting to stakeholders or clients"
            ]
        
        return examples[:2]  # Keep it focused
    
    # ========== GPT-4 CONTENT ENHANCEMENT ==========
    
    def _enhance_section_content_with_gpt4(
        self, 
        section_name: str, 
        section_content: str, 
        section_role: Dict[str, Any], 
        employee_insights: Dict[str, Any], 
        course_context: Dict[str, Any]
    ) -> str:
        """Use GPT-4 to enhance section content for better educational flow and engagement"""
        
        if not self.openai_api_key:
            logger.warning("No OpenAI API key available for content enhancement")
            return section_content
        
        try:
            logger.info(f"Enhancing content with GPT-4 for section: {section_name}")
            
            # Create section-specific enhancement prompt
            enhancement_prompt = self._create_enhancement_prompt(
                section_name, section_content, section_role, employee_insights, course_context
            )
            
            # Call GPT-4 for content enhancement
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert educational content designer who creates engaging, effective learning materials for corporate training."
                    },
                    {
                        "role": "user", 
                        "content": enhancement_prompt
                    }
                ],
                max_tokens=2000,
                temperature=0.2,  # Low temperature for content accuracy and preservation
                timeout=45  # Longer timeout for content enhancement
            )
            
            enhanced_content = response.choices[0].message.content.strip()
            
            logger.info(f"Content enhanced - Original: {len(section_content)} chars, Enhanced: {len(enhanced_content)} chars")
            return enhanced_content
            
        except Exception as e:
            logger.error(f"Failed to enhance content with GPT-4: {e}")
            # Fallback to original content
            return section_content
    
    def _create_enhancement_prompt(
        self, 
        section_name: str, 
        section_content: str, 
        section_role: Dict[str, Any], 
        employee_insights: Dict[str, Any], 
        course_context: Dict[str, Any]
    ) -> str:
        """Create concise, effective enhancement prompts for better GPT-4 results"""
        
        role = employee_insights['role']
        exp_level = employee_insights['experience_level']
        themes = ', '.join(course_context.get('key_themes', [])[:3])  # Limit themes
        
        # Truncate content if too long to leave room for response
        max_content_length = 1500
        if len(section_content) > max_content_length:
            section_content = section_content[:max_content_length] + "... [content truncated]"
        
        # Section-type-specific prompts (more concise)
        if section_role['teaching_approach'] == 'engaging_introduction':
            enhancement_prompt = f"""CRITICAL: Preserve the original content structure and information. Do NOT create new content.

Your task: Reorganize and clarify the existing content for a {exp_level} {role}, maintaining all original information.

KEY REQUIREMENTS:
- PRESERVE: All original headings, objectives, and key points
- MAINTAIN: Factual accuracy and specific details from source
- ORGANIZE: Content for clear learning flow
- CLARIFY: Complex concepts for {role} understanding
- TONE: Professional and educational

FORBIDDEN:
- Creating new examples not in source
- Adding interpretive content or music cues
- Changing factual information
- Removing original headings or objectives

CONTEXT: {themes}

ORIGINAL CONTENT TO PRESERVE:
{section_content}

REORGANIZED VERSION (preserve all original information):"""

        elif section_role['teaching_approach'] == 'progressive_development':
            enhancement_prompt = f"""Transform this into progressive learning for a {exp_level} {role}.

STRUCTURE:
1. Concept → Clear explanation
2. {role} example → Practical application
3. Building blocks → Each idea connects
4. Transitions → "Now that you understand X..."

TONE: Professional yet friendly, active learning ("You'll notice", "Try this")

CONTENT:
{section_content}

ENHANCED VERSION:"""

        elif section_role['teaching_approach'] == 'synthesis_validation':
            enhancement_prompt = f"""Create a synthesis that validates learning for a {exp_level} {role}.

FOCUS:
- Connect all concepts into unified understanding
- Real {role} scenario showing integrated application
- 3 immediate action steps
- Confidence-building summary of new capabilities

TONE: Empowering, forward-looking

CONTENT:
{section_content}

ENHANCED VERSION:"""

        else:
            # Default for practical/case study sections
            enhancement_prompt = f"""Make this practical and immediately applicable for a {exp_level} {role}.

REQUIREMENTS:
- Real {role} scenario as framework
- Step-by-step implementation guide
- Common pitfalls and solutions
- "What-if" problem-solving
- 3 takeaways for immediate use

CONTENT:
{section_content}

ENHANCED VERSION:"""
        
        return enhancement_prompt
    
    def _batch_enhance_content_with_gpt4(
        self, 
        section_name: str, 
        section_content: str, 
        section_role: Dict[str, Any], 
        employee_insights: Dict[str, Any], 
        course_context: Dict[str, Any]
    ) -> Tuple[str, List[str]]:
        """
        Batch process content enhancement and learning objectives with single GPT-4 call
        This reduces API calls from 3 to 1 for better performance and cost efficiency
        """
        
        try:
            logger.info(f"Batch enhancing content with GPT-4 for section: {section_name}")
            
            # Create comprehensive batch prompt
            batch_prompt = self._create_batch_enhancement_prompt(
                section_name, section_content, section_role, employee_insights, course_context
            )
            
            # Log GPT-4 call details for monitoring
            call_start_time = datetime.now()
            logger.info(f"🤖 GPT-4 Batch Call - Input: {len(batch_prompt)} chars, Employee: {employee_insights['name']}, Section: {section_name}")
            
            # Single GPT-4 call for all enhancements
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert educational content designer who creates engaging, effective learning materials for corporate training. You provide structured output in the exact format requested."
                    },
                    {
                        "role": "user", 
                        "content": batch_prompt
                    }
                ],
                max_tokens=2500,  # Increased for batch processing
                temperature=0.5,  # Balanced for quality and consistency
                timeout=60  # Longer timeout for batch processing
            )
            
            # Parse the structured response
            response_text = response.choices[0].message.content.strip()
            
            # Check for insufficient source content response
            if "INSUFFICIENT_SOURCE_CONTENT" in response_text:
                logger.warning("GPT-4 identified insufficient source content")
                return response_text, []
            
            enhanced_content, learning_objectives, slide_titles = self._parse_batch_response(response_text)
            
            call_duration = (datetime.now() - call_start_time).total_seconds()
            logger.info(f"✅ GPT-4 Batch Call completed in {call_duration:.2f}s")
            logger.info(f"   - Enhanced content: {len(enhanced_content)} chars")
            logger.info(f"   - Learning objectives: {len(learning_objectives)}")
            logger.info(f"   - Slide titles: {len(slide_titles)}")
            logger.info(f"   - Token efficiency: {len(enhanced_content) / len(batch_prompt):.2f} output/input ratio")
            
            # Store slide titles in a format accessible later
            self._current_slide_titles = slide_titles
            
            # Store parsed slide content if available from enhanced format
            if hasattr(self, '_parsed_slide_content') and self._parsed_slide_content:
                logger.info(f"Storing {len(self._parsed_slide_content)} parsed slides for content generation")
            
            # Validate enhanced content uniqueness
            if not self._validate_content_uniqueness_v2(enhanced_content, f"enhanced_{section_name}"):
                self._log_validation_failure("content_uniqueness", {
                    "section": section_name,
                    "content_length": len(enhanced_content),
                    "reason": "Duplicate or placeholder content detected"
                })
                # Don't replace with fallback here, just log the issue
            
            # Validate learning objectives
            valid_objectives = []
            for obj in learning_objectives:
                if self._validate_content_uniqueness_v2(obj, "learning_objective"):
                    valid_objectives.append(obj)
                else:
                    logger.warning(f"Skipping duplicate/invalid objective: {obj[:50]}...")
            
            return enhanced_content, valid_objectives
            
        except Exception as e:
            logger.error(f"Batch enhancement failed, falling back to individual processing: {e}")
            # Fallback to individual processing
            enhanced_content = self._enhance_section_content_with_gpt4(
                section_name, section_content, section_role, employee_insights, course_context
            )
            learning_objectives = self._generate_contextual_objectives(
                section_name, enhanced_content, section_role, employee_insights
            )
            return enhanced_content, learning_objectives
    
    def _preserve_markdown_structure(self, content: str, max_length: int) -> str:
        """Preserve markdown headings when truncating content"""
        if len(content) <= max_length:
            return content
        
        # Find natural break points at section boundaries
        sections = content.split('##')
        preserved_content = sections[0]  # Always keep intro
        
        for section in sections[1:]:
            section_with_header = '##' + section
            if len(preserved_content + section_with_header) <= max_length:
                preserved_content += section_with_header
            else:
                break
        
        if preserved_content == sections[0] and len(preserved_content) > max_length:
            # No sections found, truncate at sentence boundary
            sentences = preserved_content.split('. ')
            truncated = sentences[0]
            for sentence in sentences[1:]:
                if len(truncated + '. ' + sentence) <= max_length:
                    truncated += '. ' + sentence
                else:
                    break
            preserved_content = truncated + ('.' if not truncated.endswith('.') else '')
        
        return preserved_content
    
    def _validate_source_content(self, section_content: str) -> Dict[str, Any]:
        """Validate source has sufficient educational content"""
        validation = {
            'has_headings': bool(re.search(r'##\s+\w+', section_content)),
            'has_objectives': bool(re.search(r'(learning objectives?|you will|by the end)', section_content, re.I)),
            'has_structure': len(section_content.split('\n')) > 5,
            'word_count': len(section_content.split()),
            'markdown_sections': len(section_content.split('##')) - 1
        }
        
        validation['is_sufficient'] = (
            validation['word_count'] > 50 and  # Relaxed from 100 to 50 words
            (validation['has_headings'] or validation['has_objectives'] or validation['has_structure'])
        )
        
        return validation
    
    def _extract_literal_objectives(self, content: str) -> List[str]:
        """Extract actual learning objectives from source content"""
        objectives = []
        
        # Look for explicit objective patterns
        patterns = [
            r'(?:learning objectives?|you will)[:\n]\s*(.+?)(?=\n\n|\n#|$)',
            r'(?:by the end[^:]*)[:\n]\s*(.+?)(?=\n\n|\n#|$)',
            r'(?:^|\n)(?:\d+\.|\*|\-)\s*(.+?)(?=\n\d+\.|\n\*|\n\-|\n\n|$)'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, content, re.I | re.MULTILINE | re.DOTALL)
            for match in matches:
                cleaned = match.strip()
                if len(cleaned) > 10 and ('understand' in cleaned.lower() or 'learn' in cleaned.lower() or 'master' in cleaned.lower()):
                    objectives.append(cleaned)
        
        return objectives[:3] if objectives else []
    
    def _extract_markdown_headings(self, content: str) -> List[str]:
        """Extract ## headings from markdown content"""
        headings = re.findall(r'##\s+(.+)', content)
        return [heading.strip() for heading in headings if len(heading.strip()) > 2]
    
    def _create_slide_plan_from_source(self, source_headings: List[str], content: str) -> List[Dict[str, str]]:
        """Create a slide plan based on source content structure"""
        slide_plan = []
        
        if not source_headings:
            # No headings found, create basic structure
            slide_plan = [
                {"title": "Introduction", "source": "module_title"},
                {"title": "Key Points", "source": "content_summary"},
                {"title": "Summary", "source": "conclusion"}
            ]
        else:
            # Strategy: Use MORE source headings for better content coverage
            slide_plan = []
            
            # Always include intro/title slide first
            slide_plan.append({"title": "Introduction", "source": "module_title"})
            
            # Use intelligent grouping to include more headings
            if len(source_headings) <= 4:
                # Use all headings if we have 4 or fewer
                for heading in source_headings:
                    slide_plan.append({"title": heading, "source": f"## {heading} section"})
            
            elif len(source_headings) <= 6:
                # Use ALL headings for comprehensive coverage - this is optimal for engagement
                logger.info(f"Using all {len(source_headings)} source headings for maximum content coverage")
                
                # Add ALL source headings to maximize content depth and duration
                for heading in source_headings:
                    slide_plan.append({"title": heading, "source": f"## {heading} section"})
                
                logger.info(f"Created slide plan with {len(slide_plan)} slides (intro + {len(source_headings)} content slides)")
            
            else:
                # Many headings (7+): Group related ones and use representative headings
                # Prioritize the most educational headings
                must_include = []
                should_include = []
                optional_include = []
                
                for heading in source_headings:
                    heading_lower = heading.lower()
                    if any(keyword in heading_lower for keyword in ['learning', 'objective']):
                        must_include.append(heading)
                    elif any(keyword in heading_lower for keyword in ['relevance', 'importance', 'overview']):
                        should_include.append(heading)
                    else:
                        optional_include.append(heading)
                
                # Build final slide plan with better representation
                for heading in must_include:
                    slide_plan.append({"title": heading, "source": f"## {heading} section"})
                
                remaining_slots = 6 - len(slide_plan)
                
                for heading in should_include[:remaining_slots]:
                    slide_plan.append({"title": heading, "source": f"## {heading} section"})
                    remaining_slots -= 1
                
                for heading in optional_include[:remaining_slots]:
                    slide_plan.append({"title": heading, "source": f"## {heading} section"})
        
        # Allow up to 8 slides total (intro + 7 content slides) for rich content
        max_slides = 8 if len(source_headings) >= 5 else 7
        final_plan = slide_plan[:max_slides]
        
        logger.info(f"Final slide plan: {len(final_plan)} slides - {[slide['title'] for slide in final_plan]}")
        return final_plan
    
    def _calculate_content_richness(self, content: str) -> float:
        """Calculate content richness based on structure and detail"""
        score = 0.0
        
        # Check for structured content
        headings = len(re.findall(r'##\s+', content))
        if headings > 3:
            score += 0.3
        elif headings > 1:
            score += 0.2
        
        # Check for lists and examples
        lists = len(re.findall(r'(?:^|\n)(?:\d+\.|\*|\-)\s+', content, re.MULTILINE))
        if lists > 5:
            score += 0.3
        elif lists > 2:
            score += 0.2
        
        # Check for detailed explanations
        long_sentences = len([s for s in content.split('.') if len(s.split()) > 15])
        if long_sentences > 3:
            score += 0.2
        
        # Check for technical terms or concepts
        technical_indicators = ['process', 'method', 'approach', 'technique', 'strategy', 'framework']
        technical_count = sum(1 for term in technical_indicators if term in content.lower())
        if technical_count > 3:
            score += 0.3
        
        return min(score, 1.0)
    
    def _calculate_engagement_factor(self, content: str, has_practical: bool, has_objectives: bool) -> float:
        """Calculate engagement factor based on interactive and practical elements"""
        score = 0.0
        
        # Practical examples boost engagement
        if has_practical:
            score += 0.4
        
        # Clear objectives help engagement
        if has_objectives:
            score += 0.3
        
        # Interactive elements
        interactive_terms = ['exercise', 'activity', 'practice', 'try', 'implement', 'apply']
        interactive_count = sum(1 for term in interactive_terms if term in content.lower())
        if interactive_count > 2:
            score += 0.3
        
        # Questions and scenarios
        questions = len(re.findall(r'\?', content))
        scenarios = content.lower().count('scenario') + content.lower().count('example')
        if questions > 2 or scenarios > 1:
            score += 0.2
        
        return min(score, 1.0)
    
    def _create_batch_enhancement_prompt(
        self, 
        section_name: str, 
        section_content: str, 
        section_role: Dict[str, Any], 
        employee_insights: Dict[str, Any], 
        course_context: Dict[str, Any]
    ) -> str:
        """Create enhanced prompt for slide-specific content generation"""
        
        role = employee_insights['role']
        exp_level = employee_insights['experience_level']
        themes = ', '.join(course_context.get('key_themes', [])[:3])
        
        # Enhanced content preservation for comprehensive slide generation
        max_content_length = 5000
        if len(section_content) > max_content_length:
            section_content = self._preserve_markdown_structure(section_content, max_content_length)
            logger.info(f"Content preserved with {len(section_content)} chars after structure preservation")
        
        # Validate content has substance and structure
        validation = self._validate_source_content(section_content)
        if not validation['is_sufficient']:
            logger.warning(f"Source content insufficient: {validation}")
            return f"""INSUFFICIENT_SOURCE_CONTENT
Module: {section_name.replace('_', ' ').title()}
Issues: Word count: {validation['word_count']}, Headings: {validation['has_headings']}, Objectives: {validation['has_objectives']}

The source content lacks sufficient educational structure for video generation.
Required: At least 100 words with clear headings (##) or learning objectives.

Please provide more detailed source content with:
- Clear section headings (## format)
- Explicit learning objectives
- Structured educational content""", []
        
        # Extract headings from content
        original_headings = self._extract_markdown_headings(section_content)
        logger.info(f"ORIGINAL content headings found: {original_headings}")
        
        # Create slide plan based on source structure
        self._current_slide_plan = self._create_slide_plan_from_source(original_headings, section_content)
        logger.info(f"Generated slide plan: {self._current_slide_plan}")
        
        # Enhanced prompt that requests content for EACH specific slide
        batch_prompt = f"""You are creating educational content for a {exp_level} {role} on the topic: {section_name.replace('_', ' ').title()}

IMPORTANT: Generate SPECIFIC content for EACH slide listed below. Do NOT create generic learning objectives.

SLIDE REQUIREMENTS:
{self._create_slide_specific_requirements()}

SOURCE CONTENT:
{section_content}

FORMAT YOUR RESPONSE EXACTLY AS:
===SLIDE_CONTENT===
{self._create_slide_content_template()}

===LEARNING_OBJECTIVES===
1. [Specific objective based on slide content]
2. [Specific objective based on slide content]
3. [Specific objective based on slide content]

===ENHANCED_NARRATION===
[Professional narration that ties all slides together - NO conversational transitions]"""
        
        return batch_prompt
    
    def _parse_batch_response(self, response_text: str) -> Tuple[str, List[str], List[str]]:
        """Parse enhanced batch response with slide-specific content"""
        
        # New markers for enhanced format
        slide_content_marker = "===SLIDE_CONTENT==="
        objectives_marker = "===LEARNING_OBJECTIVES==="
        narration_marker = "===ENHANCED_NARRATION==="
        
        # Fallback to old format if needed
        old_content_marker = "===ENHANCED_CONTENT==="
        old_titles_marker = "===SLIDE_TITLES==="
        
        try:
            # Check which format we received
            if slide_content_marker in response_text:
                # New enhanced format with slide-specific content
                return self._parse_enhanced_slide_response(response_text)
            else:
                # Old format - use existing parsing
                content_start = response_text.find(old_content_marker)
                objectives_start = response_text.find(objectives_marker)
                titles_start = response_text.find(old_titles_marker)
                
                if content_start == -1 or objectives_start == -1:
                    logger.warning("Response markers not found, attempting flexible parsing")
                    content_start = response_text.lower().find(old_content_marker.lower())
                    objectives_start = response_text.lower().find(objectives_marker.lower())
                    titles_start = response_text.lower().find(old_titles_marker.lower())
                    
                    if content_start == -1 or objectives_start == -1:
                        raise ValueError("Response markers not found even with flexible parsing")
                
                # Get enhanced content
                enhanced_content = response_text[
                    content_start + len(old_content_marker):objectives_start
                ].strip()
                
                # Clean enhanced content
                enhanced_content = self._clean_slide_format_from_content(enhanced_content)
                enhanced_content = self._clean_colon_fragments_from_content(enhanced_content)
                enhanced_content = self._validate_enhanced_content(enhanced_content)
                
                # Get learning objectives
                if titles_start == -1:
                    objectives_text = response_text[
                        objectives_start + len(objectives_marker):
                    ].strip()
                else:
                    objectives_text = response_text[
                        objectives_start + len(objectives_marker):titles_start
                    ].strip()
                
                learning_objectives = self._extract_learning_objectives(objectives_text)
                
                # Get slide titles if available
                slide_titles = []
                if titles_start != -1:
                    titles_text = response_text[titles_start + len(old_titles_marker):].strip()
                    slide_titles = self._extract_slide_titles(titles_text)
                
                if not enhanced_content or len(learning_objectives) == 0:
                    raise ValueError("Parsed content is empty or invalid")
                
                logger.info(f"Successfully parsed batch response (old format): {len(enhanced_content)} chars, {len(learning_objectives)} objectives, {len(slide_titles)} titles")
                
                return enhanced_content, learning_objectives[:3], slide_titles
            
        except Exception as e:
            logger.error(f"Failed to parse batch response: {e}")
            logger.debug(f"Response preview: {response_text[:200]}...")
            return self._intelligent_fallback_parsing(response_text)
    
    def _validate_enhanced_content(self, content: str) -> str:
        """Validate and clean enhanced content"""
        # Remove any accidental marker repetitions
        content = re.sub(r'===.*?===', '', content).strip()
        
        # Remove excessive whitespace
        content = re.sub(r'\n{3,}', '\n\n', content)
        content = re.sub(r' {2,}', ' ', content)
        
        # Ensure content has substance
        if len(content) < 100:
            raise ValueError(f"Enhanced content too short: {len(content)} chars")
        
        # Check for common GPT-4 errors
        if content.lower().startswith('[enhanced content here]') or content.lower().startswith('[your enhanced'):
            raise ValueError("GPT-4 returned placeholder text")
        
        return content.strip()
    
    def _extract_slide_titles(self, titles_text: str) -> List[str]:
        """Extract slide titles with flexible parsing"""
        titles = []
        
        # Use same patterns as objectives
        patterns = [
            r'^\d+\.\s*(.+)$',  # 1. Title
            r'^-\s*(.+)$',       # - Title
            r'^•\s*(.+)$',       # • Title
            r'^\*\s*(.+)$',      # * Title
            r'^\[\d+\]\s*(.+)$', # [1] Title
        ]
        
        lines = titles_text.split('\n')
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Try each pattern
            for pattern in patterns:
                match = re.match(pattern, line)
                if match:
                    title = match.group(1).strip()
                    # Clean up title formatting
                    title = self._clean_slide_title(title)
                    # Basic validation - not too long, not too short
                    if 2 <= len(title.split()) <= 10 and len(title) < 60:
                        titles.append(title)
                        break
            else:
                # If no pattern matched but line looks like a title
                if line and not line.startswith('===') and 2 <= len(line.split()) <= 10:
                    titles.append(self._clean_slide_title(line))
        
        return titles
    
    def _get_section_role(self, section_type: str) -> Dict[str, Any]:
        """Get educational role configuration for section type"""
        roles = {
            'introduction': {
                'teaching_approach': 'engaging_introduction',
                'focus': 'orientation_and_motivation',
                'tone': 'welcoming',
                'pacing': 'brisk'
            },
            'core_content': {
                'teaching_approach': 'progressive_development',
                'focus': 'concept_mastery',
                'tone': 'instructional',
                'pacing': 'steady'
            },
            'practical': {
                'teaching_approach': 'application_focused',
                'focus': 'skill_building',
                'tone': 'hands_on',
                'pacing': 'methodical'
            },
            'case_study': {
                'teaching_approach': 'analytical_exploration',
                'focus': 'critical_thinking',
                'tone': 'investigative',
                'pacing': 'deliberate'
            },
            'assessment': {
                'teaching_approach': 'knowledge_validation',
                'focus': 'competency_check',
                'tone': 'evaluative',
                'pacing': 'reflective'
            },
            'summary': {
                'teaching_approach': 'reinforcement_recap',
                'focus': 'consolidation',
                'tone': 'conclusive',
                'pacing': 'rapid'
            }
        }
        return roles.get(section_type, roles['core_content'])
    
    def _clean_slide_title(self, title: str) -> str:
        """Clean up slide title formatting"""
        # Remove surrounding quotes
        title = title.strip('"\'')
        # Remove numbering at start
        title = re.sub(r'^\d+\.\s*', '', title)
        # Remove extra quotes inside
        title = title.replace('""', '"')
        # Trim if too long
        if len(title) > 50:
            words = title.split()
            title = ' '.join(words[:7]) + '...'
        return title
    
    def _extract_learning_objectives(self, objectives_text: str) -> List[str]:
        """Extract learning objectives with flexible parsing"""
        objectives = []
        
        # Try multiple patterns
        patterns = [
            r'^\d+\.\s*(.+)$',  # 1. Objective
            r'^-\s*(.+)$',       # - Objective
            r'^•\s*(.+)$',       # • Objective
            r'^\*\s*(.+)$',      # * Objective
            r'^\[\d+\]\s*(.+)$', # [1] Objective
        ]
        
        lines = objectives_text.split('\n')
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Try each pattern
            objective_found = False
            for pattern in patterns:
                match = re.match(pattern, line)
                if match:
                    objective = match.group(1).strip()
                    if self._validate_learning_objective(objective):
                        # Ensure proper punctuation
                        if not objective.endswith(('.', '!', '?')):
                            objective += '.'
                        objectives.append(objective)
                        objective_found = True
                        break
            
            # If no pattern matched but line looks like objective
            if not objective_found and self._validate_learning_objective(line):
                # Ensure proper punctuation
                if not line.endswith(('.', '!', '?')):
                    line += '.'
                objectives.append(line)
        
        return objectives
    
    def _validate_learning_objective(self, objective: str) -> bool:
        """Validate if text is a proper learning objective"""
        # Check length
        word_count = len(objective.split())
        if word_count < 3 or word_count > 20:
            return False
        
        # Check for action verbs
        action_verbs = ['understand', 'apply', 'create', 'analyze', 'implement', 
                       'develop', 'master', 'demonstrate', 'evaluate', 'design',
                       'build', 'identify', 'explain', 'use', 'perform']
        
        objective_lower = objective.lower()
        has_action = any(verb in objective_lower for verb in action_verbs)
        
        # Check it's not a placeholder
        placeholders = ['[objective', 'first objective', 'second objective', 
                       'third objective', 'your objective', 'here']
        is_placeholder = any(ph in objective_lower for ph in placeholders)
        
        return has_action and not is_placeholder and len(objective) > 15
    
    def _create_slide_specific_requirements(self) -> str:
        """Create specific requirements for each slide based on the plan"""
        requirements = []
        for i, slide in enumerate(self._current_slide_plan):
            slide_num = i + 1
            slide_title = slide['title']
            
            # Create specific requirements based on slide title
            if 'introduction' in slide_title.lower() or i == 0:
                req = f"""Slide {slide_num} - {slide_title}:
- Welcome the learner to this specific topic
- State what they will learn in THIS section
- Create excitement about the practical value
- 3-4 bullet points that preview key concepts
- Speaker notes: 30-45 seconds of welcoming, professional narration"""
            elif 'personal relevance' in slide_title.lower():
                req = f"""Slide {slide_num} - {slide_title}:
- Connect this topic to the learner's daily work
- Show how it impacts their role directly
- Include specific examples relevant to their industry
- 3-4 bullet points about personal benefits
- Speaker notes: 30-45 seconds explaining "why this matters to YOU" """
            elif 'real-world applications' in slide_title.lower():
                req = f"""Slide {slide_num} - {slide_title}:
- Provide concrete examples from actual workplace scenarios
- Show before/after or problem/solution comparisons
- Include metrics or outcomes when possible
- 3-4 bullet points with specific applications
- Speaker notes: 45-60 seconds with detailed examples"""
            elif 'summary' in slide_title.lower() or 'conclusion' in slide_title.lower():
                req = f"""Slide {slide_num} - {slide_title}:
- Recap the main points covered
- Emphasize key takeaways
- Call to action for applying the knowledge
- 3-4 bullet points summarizing core concepts
- Speaker notes: 30-45 seconds reinforcing learning"""
            else:
                # Content slides based on source headings
                req = f"""Slide {slide_num} - {slide_title}:
- Extract and present content SPECIFICALLY about "{slide_title}"
- Use only information from the source related to this topic
- Make it practical and applicable
- 3-4 bullet points with key information
- Speaker notes: 45-60 seconds explaining this specific concept"""
            
            requirements.append(req)
        
        return "\n\n".join(requirements)
    
    def _create_slide_content_template(self) -> str:
        """Create template for slide-specific content in GPT-4 response"""
        templates = []
        for i, slide in enumerate(self._current_slide_plan):
            slide_num = i + 1
            template = f"""[SLIDE_{slide_num}]
Title: {slide['title']}
Bullet Points:
- [Specific point about {slide['title']}]
- [Another specific point]
- [Key insight or application]
- [Final point or example]
Speaker Notes: [45-60 second narration specifically about {slide['title']}]"""
            templates.append(template)
        
        return "\n\n".join(templates)
    
    def _parse_enhanced_slide_response(self, response_text: str) -> Tuple[str, List[str], List[str]]:
        """Parse the enhanced response format with slide-specific content"""
        try:
            # Extract slide content section
            slide_content_start = response_text.find("===SLIDE_CONTENT===")
            objectives_start = response_text.find("===LEARNING_OBJECTIVES===")
            narration_start = response_text.find("===ENHANCED_NARRATION===")
            
            if slide_content_start == -1 or objectives_start == -1:
                raise ValueError("Enhanced format markers not found")
            
            # Extract slide content
            slide_content_text = response_text[
                slide_content_start + len("===SLIDE_CONTENT==="):objectives_start
            ].strip()
            
            # Parse individual slides
            self._parsed_slide_content = self._parse_individual_slides(slide_content_text)
            
            # Extract learning objectives
            if narration_start == -1:
                objectives_text = response_text[objectives_start + len("===LEARNING_OBJECTIVES==="):].strip()
            else:
                objectives_text = response_text[
                    objectives_start + len("===LEARNING_OBJECTIVES==="):narration_start
                ].strip()
            
            learning_objectives = self._extract_learning_objectives(objectives_text)
            
            # Extract enhanced narration if available
            enhanced_narration = ""
            if narration_start != -1:
                enhanced_narration = response_text[narration_start + len("===ENHANCED_NARRATION==="):].strip()
            
            # Extract slide titles from parsed content
            slide_titles = [slide['title'] for slide in self._parsed_slide_content]
            
            # Use enhanced narration as the main content, or combine from slides
            if enhanced_narration:
                enhanced_content = enhanced_narration
            else:
                # Combine speaker notes from all slides
                enhanced_content = " ".join([
                    slide.get('speaker_notes', '') 
                    for slide in self._parsed_slide_content
                ])
            
            logger.info(f"Successfully parsed enhanced response: {len(self._parsed_slide_content)} slides, {len(learning_objectives)} objectives")
            
            return enhanced_content, learning_objectives[:3], slide_titles
            
        except Exception as e:
            logger.error(f"Failed to parse enhanced response: {e}")
            # Fall back to parsing as old format
            return self._parse_batch_response_old_format(response_text)
    
    def _parse_individual_slides(self, slide_content_text: str) -> List[Dict[str, Any]]:
        """Parse individual slide content from the response"""
        slides = []
        
        # Split by slide markers
        slide_pattern = r'\[SLIDE_(\d+)\]'
        slide_sections = re.split(slide_pattern, slide_content_text)
        
        # Process each slide section
        i = 1
        while i < len(slide_sections):
            slide_num = int(slide_sections[i])
            slide_content = slide_sections[i + 1] if i + 1 < len(slide_sections) else ""
            
            # Parse slide content
            slide_data = self._parse_single_slide_content(slide_content, slide_num)
            slides.append(slide_data)
            
            i += 2
        
        return slides
    
    def _parse_single_slide_content(self, content: str, slide_num: int) -> Dict[str, Any]:
        """Parse content for a single slide"""
        slide_data = {
            'slide_number': slide_num,
            'title': '',
            'bullet_points': [],
            'speaker_notes': ''
        }
        
        # Extract title
        title_match = re.search(r'Title:\s*(.+?)\n', content)
        if title_match:
            slide_data['title'] = title_match.group(1).strip()
        
        # Extract bullet points
        bullet_section = re.search(r'Bullet Points?:\s*\n((?:[-•*]\s*.+\n?)+)', content, re.MULTILINE)
        if bullet_section:
            bullet_text = bullet_section.group(1)
            bullets = re.findall(r'[-•*]\s*(.+)', bullet_text)
            slide_data['bullet_points'] = [b.strip() for b in bullets if b.strip()]
        
        # Extract speaker notes
        speaker_match = re.search(r'Speaker Notes?:\s*(.+?)(?=\n\[SLIDE_|\Z)', content, re.DOTALL)
        if speaker_match:
            slide_data['speaker_notes'] = speaker_match.group(1).strip()
        
        return slide_data
    
    def _parse_batch_response_old_format(self, response_text: str) -> Tuple[str, List[str], List[str]]:
        """Fallback parsing for old format responses"""
        # This is the same as the old _parse_batch_response logic
        content_marker = "===ENHANCED_CONTENT==="
        objectives_marker = "===LEARNING_OBJECTIVES==="
        titles_marker = "===SLIDE_TITLES==="
        
        try:
            content_start = response_text.find(content_marker)
            objectives_start = response_text.find(objectives_marker)
            titles_start = response_text.find(titles_marker)
            
            if content_start == -1 or objectives_start == -1:
                content_start = response_text.lower().find(content_marker.lower())
                objectives_start = response_text.lower().find(objectives_marker.lower())
                titles_start = response_text.lower().find(titles_marker.lower())
                
                if content_start == -1 or objectives_start == -1:
                    raise ValueError("Response markers not found")
            
            enhanced_content = response_text[
                content_start + len(content_marker):objectives_start
            ].strip()
            
            enhanced_content = self._clean_slide_format_from_content(enhanced_content)
            enhanced_content = self._clean_colon_fragments_from_content(enhanced_content)
            enhanced_content = self._validate_enhanced_content(enhanced_content)
            
            if titles_start == -1:
                objectives_text = response_text[
                    objectives_start + len(objectives_marker):
                ].strip()
            else:
                objectives_text = response_text[
                    objectives_start + len(objectives_marker):titles_start
                ].strip()
            
            learning_objectives = self._extract_learning_objectives(objectives_text)
            
            slide_titles = []
            if titles_start != -1:
                titles_text = response_text[titles_start + len(titles_marker):].strip()
                slide_titles = self._extract_slide_titles(titles_text)
            
            return enhanced_content, learning_objectives[:3], slide_titles
            
        except Exception as e:
            logger.error(f"Failed to parse old format: {e}")
            return self._intelligent_fallback_parsing(response_text)
    
    def _intelligent_fallback_parsing(self, response_text: str) -> Tuple[str, List[str], List[str]]:
        """Intelligent fallback when structured parsing fails"""
        logger.info("Using intelligent fallback parsing")
        
        # Try to find content section
        content = ""
        objectives = []
        
        # Look for content patterns
        lines = response_text.split('\n')
        in_objectives = False
        
        for line in lines:
            line_lower = line.lower()
            
            # Check for objective section markers
            if 'objective' in line_lower and (':' in line or '===' in line):
                in_objectives = True
                continue
            
            # If we're in objectives section
            if in_objectives:
                cleaned = self._clean_bullet_point(line)
                if self._validate_learning_objective(cleaned):
                    objectives.append(cleaned)
            else:
                # Otherwise it's content
                if line.strip() and not '===' in line:
                    content += line + '\n'
        
        # Clean up content
        content = content.strip()
        
        # If we didn't find much, just use the whole response as content
        if len(content) < 200:
            content = response_text
        
        # Generate default objectives if needed
        if not objectives:
            objectives = [
                "Apply key concepts to improve daily work performance",
                "Master fundamental principles through practical examples",
                "Implement best practices for immediate results"
            ]
        
        # Return empty slide titles in fallback
        return content, objectives[:3], []