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

logger = logging.getLogger(__name__)

# Import our new components (optional - graceful fallback if dependencies missing)
try:
    from .content_essence_extractor import ContentEssenceExtractor, SlideEssence
    ESSENCE_EXTRACTOR_AVAILABLE = True
except ImportError as e:
    logger.warning(f"ContentEssenceExtractor not available: {e}")
    ESSENCE_EXTRACTOR_AVAILABLE = False

try:
    from .human_narration_generator import HumanNarrationGenerator
    HUMAN_NARRATION_AVAILABLE = True
except ImportError as e:
    logger.warning(f"HumanNarrationGenerator not available: {e}")
    HUMAN_NARRATION_AVAILABLE = False

@dataclass
class SlideContent:
    """Content for a single slide"""
    slide_number: int
    title: str
    bullet_points: List[str]
    speaker_notes: str
    duration_estimate: float  # seconds
    visual_cues: List[str] = field(default_factory=list)
    emphasis_points: List[str] = field(default_factory=list)

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
        self.narration_generator = HumanNarrationGenerator() if HUMAN_NARRATION_AVAILABLE else None
        
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
        
        # Default to 4 minutes for section-based videos (optimal for microlearning)
        target_duration = target_duration or 4
        
        # STEP 1: Analyze course context and section's role in learning journey
        course_context = self._analyze_full_course_context(all_sections or {}, module_name)
        section_role = self._determine_section_role_in_journey(section_name, section_content, course_context)
        
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
        
        # Content slides (2-3 slides max for focus)
        content_slides = self._create_section_content_slides(
            section_summary,
            employee_context,
            slide_number,
            max_slides=3
        )
        slides.extend(content_slides)
        
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
        
        # Content slides for each educational summary (limit to 3-4 videos)
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
        
        # Create personalized greeting
        speaker_notes = f"""
Welcome {employee_name}! I'm excited to guide you through this module on {module_name}.

As a {role}, this training has been specially designed to enhance your skills and knowledge 
in this important area. Over the next few minutes, we'll explore key concepts, practical 
applications, and real-world examples that will help you excel in your role.

Let's begin by looking at what you'll learn today.
"""
        
        bullet_points = ["Welcome to Your Training"] + learning_objectives[:3]
        
        return SlideContent(
            slide_number=slide_number,
            title=module_name,
            bullet_points=bullet_points,
            speaker_notes=speaker_notes.strip(),
            duration_estimate=20.0,  # 20 seconds for introduction
            visual_cues=["Professional setting", "Welcoming atmosphere"],
            emphasis_points=["specially designed", "excel in your role"]
        )
    
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
    
    def _extract_key_points(self, content: str) -> List[str]:
        """Extract meaningful bullet points from GPT-4 enhanced content"""
        if not self.openai_api_key:
            return self._fallback_key_points_extraction(content)
        
        try:
            # Use GPT-4 to extract meaningful bullet points from enhanced content
            extraction_prompt = f"""
Extract 3-4 clear, actionable bullet points from this educational content. Each bullet point should:
1. Be concise (8-12 words max)
2. Focus on what the learner will gain
3. Use action-oriented language
4. Be immediately understandable

CONTENT:
{content[:1500]}

Return only the bullet points, one per line, without bullets or numbers:
"""
            
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert at creating clear, educational bullet points."},
                    {"role": "user", "content": extraction_prompt}
                ],
                max_tokens=200,
                temperature=0.3,
                timeout=30  # Add timeout for reliability
            )
            
            bullet_text = response.choices[0].message.content.strip()
            bullet_points = [line.strip() for line in bullet_text.split('\n') if line.strip()]
            
            # Clean and validate bullet points
            clean_points = []
            for point in bullet_points[:4]:
                # Remove any bullet markers that might have been added
                point = re.sub(r'^[-•*]\s*', '', point)
                point = re.sub(r'^\d+\.\s*', '', point)
                
                # Ensure reasonable length
                if 5 <= len(point) <= 80:
                    clean_points.append(point)
            
            return clean_points[:4] if clean_points else self._fallback_key_points_extraction(content)
            
        except Exception as e:
            logger.error(f"Failed to extract key points with GPT-4: {e}")
            return self._fallback_key_points_extraction(content)
    
    def _fallback_key_points_extraction(self, content: str) -> List[str]:
        """Fallback method for extracting key points without GPT-4"""
        # Simple sentence extraction approach
        sentences = re.split(r'[.!?]+', content)
        good_sentences = []
        
        for sentence in sentences:
            sentence = sentence.strip()
            # Look for sentences with key educational indicators
            if (len(sentence) > 20 and len(sentence) < 100 and 
                any(word in sentence.lower() for word in ['will', 'can', 'learn', 'understand', 'help', 'enable'])):
                good_sentences.append(sentence)
        
        # If we found good sentences, return them
        if good_sentences:
            return good_sentences[:4]
        
        # Last resort: take first few sentences
        return [s.strip() for s in sentences[:4] if len(s.strip()) > 20]
    
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
        objectives = []
        
        # Look for action-oriented content
        action_patterns = [
            r'learn\s+(?:how\s+to\s+)?(.+?)(?:\.|,|$)',
            r'understand\s+(.+?)(?:\.|,|$)',
            r'master\s+(.+?)(?:\.|,|$)',
            r'develop\s+(.+?)(?:\.|,|$)',
            r'improve\s+(.+?)(?:\.|,|$)',
            r'apply\s+(.+?)(?:\.|,|$)'
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
        """Extract key concepts for teaching"""
        concepts = []
        
        # Find important nouns and noun phrases
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
                        concepts.append(f"{concept.strip()}: {definition.strip()[:60]}...")
        
        return concepts[:4]  # Max 4 concepts
    
    def _extract_practical_applications(self, content: str) -> List[str]:
        """Extract practical applications from content"""
        applications = []
        
        # Look for practical application indicators
        app_patterns = [
            r'(?:can be used|apply|implement|practice|use)\s+(.+?)(?:\.|,|$)',
            r'(?:example|for instance|such as)\s+(.+?)(?:\.|,|$)',
            r'(?:in practice|in real|in your)\s+(.+?)(?:\.|,|$)'
        ]
        
        for pattern in app_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            for match in matches[:3]:
                if len(match.strip()) > 10:
                    applications.append(f"Apply: {match.strip()}")
        
        return applications[:3]  # Max 3 applications
    
    def _extract_key_topics(self, content: str) -> List[str]:
        """Extract key topics from content"""
        # Find capitalized words and phrases (likely topics)
        words = content.split()
        topics = []
        
        for i, word in enumerate(words):
            if word[0].isupper() and len(word) > 3:
                # Check if it's part of a phrase
                phrase = word
                j = i + 1
                while j < len(words) and j < i + 3:  # Max 3-word phrases
                    if words[j][0].isupper() or words[j].lower() in ['and', 'of', 'for']:
                        phrase += f" {words[j]}"
                        j += 1
                    else:
                        break
                
                if len(phrase.split()) >= 1:
                    topics.append(phrase)
        
        # Remove duplicates and return top topics
        unique_topics = list(dict.fromkeys(topics))
        return unique_topics[:5]
    
    def _create_educational_narration(self, content: str, employee_context: Dict[str, Any]) -> str:
        """Create educational narration from content"""
        employee_name = employee_context.get('name', 'learner')
        
        # Create engaging introduction
        intro = f"Hello {employee_name}, let's explore this important topic together."
        
        # Extract key points for narration
        key_points = self._extract_key_points(content)
        
        # Create educational flow
        narration_parts = [intro]
        
        for i, point in enumerate(key_points[:3]):
            if i == 0:
                narration_parts.append(f"First, we'll {point[0].lower()}{point[1:]}")
            elif i == 1:
                narration_parts.append(f"Next, we'll focus on {point[0].lower()}{point[1:]}")
            else:
                narration_parts.append(f"Finally, we'll {point[0].lower()}{point[1:]}")
        
        narration_parts.append("This knowledge will help you excel in your role and contribute to your organization's success.")
        
        return " ".join(narration_parts)
    
    def _estimate_section_duration(self, content: str) -> float:
        """Estimate duration for a section in seconds"""
        word_count = len(content.split())
        # Assume 150 words per minute for educational content
        duration = (word_count / 150) * 60
        # Add time for pauses and emphasis
        return max(30, min(duration * 1.3, 90))  # Between 30-90 seconds
    
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
        
        # Section-specific introductions
        intro_text = {
            'introduction': f"Welcome to {module_name}. Let's begin your learning journey.",
            'core_content': f"Now let's dive into the core concepts and principles.",
            'practical': f"Time to put your knowledge into practice with real examples.",
            'case_study': f"Let's analyze real-world scenarios and learn from them.",
            'assessment': f"Ready to test your understanding? Let's validate your learning."
        }.get(section_type, f"Let's explore {section_display.lower()}.")
        
        return SlideContent(
            slide_number=slide_number,
            title=f"{section_display}",
            bullet_points=learning_objectives,
            speaker_notes=f"{intro_text} In this section, we'll focus on specific objectives that will help you excel in your role.",
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
            
            # Create section-specific slide title
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
    
    def _create_section_specific_narration(
        self,
        section_content: str,
        section_type: str,
        employee_context: Dict[str, Any]
    ) -> str:
        """Create narration tailored to section type"""
        
        employee_name = employee_context.get('name', 'learner')
        
        # Section-specific narration approaches
        if section_type == 'introduction':
            intro = f"Hello {employee_name}, welcome to this important learning module."
            body = "Let's start by understanding why this knowledge is crucial for your professional growth."
        elif section_type == 'core_content':
            intro = f"Now {employee_name}, let's dive deep into the fundamental concepts."
            body = "Pay close attention to these core principles - they form the foundation of everything else."
        elif section_type == 'practical':
            intro = f"Great work so far, {employee_name}! Now let's see how to apply this knowledge."
            body = "These practical examples will help you implement what you've learned in real situations."
        elif section_type == 'case_study':
            intro = f"Let's analyze some real-world scenarios together, {employee_name}."
            body = "These case studies show how others have successfully applied these concepts."
        elif section_type == 'assessment':
            intro = f"Time to test your understanding, {employee_name}."
            body = "These questions will help validate your learning and identify areas to review."
        else:
            intro = f"Let's continue learning, {employee_name}."
            body = "This section contains valuable insights for your development."
        
        # Extract key narration points
        key_points = self._extract_key_points(section_content)
        narration_flow = []
        
        narration_flow.append(intro)
        narration_flow.append(body)
        
        # Add content-specific narration
        for i, point in enumerate(key_points[:3]):
            if i == 0:
                narration_flow.append(f"First, we'll focus on {point[0].lower()}{point[1:]}")
            elif i == 1:
                narration_flow.append(f"Next, we'll explore {point[0].lower()}{point[1:]}")
            else:
                narration_flow.append(f"Finally, we'll examine {point[0].lower()}{point[1:]}")
        
        narration_flow.append("This knowledge will directly benefit your work and career advancement.")
        
        return " ".join(narration_flow)
    
    def _create_section_narration(
        self,
        slides: List[SlideContent],
        section_summary: Dict[str, Any],
        employee_context: Dict[str, Any]
    ) -> str:
        """Create complete narration for section"""
        
        narration_parts = []
        
        for slide in slides:
            narration_parts.append(slide.speaker_notes)
            
        return " ".join(narration_parts)
    
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
        """Estimate duration for a slide based on content and section type"""
        
        base_duration = 30  # Base 30 seconds per slide
        
        # Adjust based on content complexity
        total_words = sum(len(point.split()) for point in content_points)
        content_duration = (total_words / 150) * 60  # 150 words per minute
        
        # Section-specific adjustments
        multipliers = {
            'introduction': 1.2,  # Slower for context setting
            'core_content': 1.3,  # Slower for complex concepts
            'practical': 1.1,    # Moderate for examples
            'case_study': 1.2,   # Slower for analysis
            'assessment': 1.0    # Standard for questions
        }
        
        multiplier = multipliers.get(section_type, 1.0)
        final_duration = max(base_duration, content_duration * multiplier)
        
        return min(final_duration, 90)  # Cap at 90 seconds per slide
    
    def _create_slide_specific_narration(
        self,
        content_points: List[str],
        section_type: str,
        employee_context: Dict[str, Any]
    ) -> str:
        """Create narration for specific slide content"""
        
        if not content_points:
            return "This slide contains important information for your learning."
        
        # Section-specific narration style
        if section_type == 'practical':
            intro = "Let's see how this works in practice."
        elif section_type == 'case_study':
            intro = "Here's what happened in this real situation."
        elif section_type == 'assessment':
            intro = "Consider these questions carefully."
        else:
            intro = "Pay attention to these key points."
        
        # Combine points into flowing narration
        narration_parts = [intro]
        
        for i, point in enumerate(content_points):
            if i == 0:
                narration_parts.append(point)
            elif i == len(content_points) - 1:
                narration_parts.append(f"Most importantly, {point[0].lower()}{point[1:]}")
            else:
                narration_parts.append(f"Additionally, {point[0].lower()}{point[1:]}")
        
        return " ".join(narration_parts)
    
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
            takeaways = [f"Remember: {point}" for point in key_points[:3]]
        
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
        """Generate engaging speaker notes with human touch"""
        
        employee_name = employee_context.get('name', 'there')
        
        # Use essence extractor for better content understanding
        if hasattr(self, 'essence_extractor') and self.essence_extractor is not None:
            slide_essence = self.essence_extractor.extract_slide_essence(
                content, section_name
            )
            
            # Build narrative around the essence
            notes = ""
            
            if is_first_slide:
                notes += f"Now, {employee_name}, let's dive into {section_name.lower()}. "
                notes += f"{slide_essence.headline}. "
            
            # Add the core insight
            notes += f"{slide_essence.insight} "
            
            # Add personal impact
            notes += f"This will help you {slide_essence.impact.lower()}. "
            
        else:
            # Fallback to original approach
            notes = ""
            
            if is_first_slide:
                notes += f"Now let's explore {section_name.lower()}. "
            
            # Add personalized context
            if 'practical' in section_name.lower():
                notes += f"These practical applications will be especially relevant to your work. "
            elif 'case' in section_name.lower():
                notes += f"Let's look at some real-world examples that demonstrate these concepts. "
        
        # Incorporate the content naturally
        # Remove duplicate information from key points
        content_for_notes = content
        for point in key_points:
            content_for_notes = content_for_notes.replace(point, '')
        
        # Clean and enhance the content
        content_for_notes = re.sub(r'\s+', ' ', content_for_notes).strip()
        
        # Make it conversational
        notes += content_for_notes
        
        # Add natural transitions
        if not notes.endswith('.'):
            notes += '.'
        
        # Add emphasis on key points with more natural language
        if key_points:
            notes += f" Now, {employee_name}, these are the key points I want you to remember."
        
        return notes.strip()
    
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
        
        employee_name = employee_context.get('name', 'there')
        
        speaker_notes = f"""
Excellent work, {employee_name}! Let's recap the key takeaways from this module.

These are the essential points to remember as you apply this knowledge in your role. 
Each of these concepts will help you perform more effectively and confidently.

Remember, learning is a continuous journey, and you've taken an important step today. 
Feel free to revisit this material whenever you need a refresher.

Thank you for your attention and commitment to professional development!
"""
        
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
        """Combine all speaker notes into full narration with human touch"""
        
        # Use human narration generator if available
        if hasattr(self, 'narration_generator') and self.narration_generator is not None:
            # Convert slides to format expected by narration generator
            script_data = {
                'slides': [
                    {
                        'speaker_notes': slide.speaker_notes,
                        'bullet_points': slide.bullet_points,
                        'title': slide.title
                    }
                    for slide in slides
                ]
            }
            
            # Generate conversational script
            conversational_script = self.narration_generator.generate_conversational_script(
                {'module_name': slides[0].title if slides else 'Training'},
                employee_context,
                script_data
            )
            
            # Combine all parts
            parts = [
                conversational_script.greeting,
                conversational_script.introduction
            ]
            
            # Add main content with transitions
            for i, segment in enumerate(conversational_script.main_content):
                if i < len(conversational_script.transitions):
                    parts.append(conversational_script.transitions[i])
                parts.append(segment.text)
            
            parts.append(conversational_script.conclusion)
            
            return ' '.join(parts)
        
        else:
            # Fallback to original approach
            narration_parts = []
            
            for i, slide in enumerate(slides):
                # Add slide transition if not first slide
                if i > 0:
                    narration_parts.append(" ")  # Natural pause
                
                narration_parts.append(slide.speaker_notes)
            
            return " ".join(narration_parts)
    
    def _estimate_duration(self, speaker_notes: str) -> float:
        """Estimate speaking duration in seconds"""
        word_count = len(speaker_notes.split())
        duration = (word_count / self.words_per_minute) * 60
        
        # Ensure within bounds
        duration = max(self.min_slide_duration, min(duration, self.max_slide_duration))
        
        return round(duration, 1)
    
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
                temperature=0.7,  # Some creativity for engaging content
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
        """Create a specific enhancement prompt based on section type and context"""
        
        base_context = f"""
CONTEXT:
- Employee Role: {employee_insights['role']}
- Experience Level: {employee_insights['experience_level']}
- Course: {course_context['module_name']}
- Section: {section_name} ({section_role['type']})
- Learning Position: {section_role['position']} in learning journey
- Teaching Approach: {section_role['teaching_approach']}
- Course Themes: {', '.join(course_context.get('key_themes', []))}

ORIGINAL CONTENT:
{section_content}
"""
        
        # Section-type-specific prompts
        if section_role['teaching_approach'] == 'engaging_introduction':
            enhancement_prompt = f"""{base_context}

TASK: Transform this introduction content into an engaging, motivational learning experience.

REQUIREMENTS:
1. Start with a compelling hook that connects to the {employee_insights['role']}'s daily work
2. Clearly explain WHY this knowledge matters for their career success
3. Use conversational, encouraging tone that builds excitement for learning
4. Include 1-2 specific examples relevant to their role
5. Set clear expectations for what they'll achieve
6. Create smooth flow that naturally leads to core learning
7. Keep it concise but impactful (aim for 3-4 minutes of narration)

ENHANCED CONTENT:"""

        elif section_role['teaching_approach'] == 'progressive_development':
            enhancement_prompt = f"""{base_context}

TASK: Transform this core content into a clear, progressive learning experience.

REQUIREMENTS:
1. Structure content in logical learning sequence (concept → explanation → example → application)
2. Use "building block" approach - each concept builds on the previous
3. Include {employee_insights['role']}-specific examples and scenarios
4. Add smooth transitions between concepts ("Now that you understand X, let's explore Y")
5. Use active learning language ("You'll notice", "Try this", "Consider when")
6. Break complex ideas into digestible chunks
7. Maintain professional but friendly teaching tone

ENHANCED CONTENT:"""

        elif section_role['teaching_approach'] == 'synthesis_validation':
            enhancement_prompt = f"""{base_context}

TASK: Transform this content into a powerful synthesis and validation experience.

REQUIREMENTS:
1. Begin by connecting all previous learning together
2. Show how concepts work together in real {employee_insights['role']} scenarios
3. Provide concrete action steps they can take immediately
4. Include validation of their learning journey progress
5. End with confidence-building summary of their new capabilities
6. Create sense of achievement and readiness for implementation
7. Use empowering, forward-looking language

ENHANCED CONTENT:"""

        else:
            # Default enhancement for practical/case study sections
            enhancement_prompt = f"""{base_context}

TASK: Transform this content into engaging, practical learning material.

REQUIREMENTS:
1. Focus on real-world application for {employee_insights['role']}s
2. Use story-telling approach with relatable scenarios
3. Include step-by-step guidance and best practices
4. Add "what-if" scenarios and problem-solving approaches
5. Connect to their daily work challenges and opportunities
6. Use encouraging, supportive tone that builds confidence
7. End with clear takeaways they can use immediately

ENHANCED CONTENT:"""
        
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
            enhanced_content, learning_objectives = self._parse_batch_response(response_text)
            
            call_duration = (datetime.now() - call_start_time).total_seconds()
            logger.info(f"✅ GPT-4 Batch Call completed in {call_duration:.2f}s")
            logger.info(f"   - Enhanced content: {len(enhanced_content)} chars")
            logger.info(f"   - Learning objectives: {len(learning_objectives)}")
            logger.info(f"   - Token efficiency: {len(enhanced_content) / len(batch_prompt):.2f} output/input ratio")
            
            return enhanced_content, learning_objectives
            
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
    
    def _create_batch_enhancement_prompt(
        self, 
        section_name: str, 
        section_content: str, 
        section_role: Dict[str, Any], 
        employee_insights: Dict[str, Any], 
        course_context: Dict[str, Any]
    ) -> str:
        """Create comprehensive batch prompt for content enhancement and objectives"""
        
        base_context = f"""
CONTEXT:
- Employee Role: {employee_insights['role']}
- Experience Level: {employee_insights['experience_level']}
- Course: {course_context['module_name']}
- Section: {section_name} ({section_role['type']})
- Learning Position: {section_role['position']} in learning journey
- Teaching Approach: {section_role['teaching_approach']}
- Course Themes: {', '.join(course_context.get('key_themes', []))}

ORIGINAL CONTENT:
{section_content}
"""
        
        # Section-specific batch prompt
        if section_role['teaching_approach'] == 'engaging_introduction':
            batch_prompt = f"""{base_context}

TASK: Transform this introduction content and create learning objectives in a single response.

REQUIREMENTS:
1. ENHANCED CONTENT: Create engaging, motivational introduction (3-4 minutes of narration)
   - Start with compelling hook connecting to {employee_insights['role']}'s daily work
   - Explain WHY this knowledge matters for career success
   - Use conversational, encouraging tone
   - Include 1-2 role-specific examples
   - Set clear expectations for achievements

2. LEARNING OBJECTIVES: Create 3 specific, actionable objectives
   - Specific to what the learner will achieve
   - Relevant to {employee_insights['role']} daily work
   - Use measurable action verbs
   - 10-15 words max each

OUTPUT FORMAT:
===ENHANCED_CONTENT===
[Enhanced content here]

===LEARNING_OBJECTIVES===
1. [First objective]
2. [Second objective]
3. [Third objective]
"""
        
        elif section_role['teaching_approach'] == 'progressive_development':
            batch_prompt = f"""{base_context}

TASK: Transform core content into progressive learning experience with objectives.

REQUIREMENTS:
1. ENHANCED CONTENT: Create clear, progressive learning experience
   - Structure: concept → explanation → example → application
   - Building block approach - each concept builds on previous
   - Include {employee_insights['role']}-specific examples
   - Smooth transitions between concepts
   - Active learning language
   - Professional but friendly tone

2. LEARNING OBJECTIVES: Create 3 specific objectives for this core content
   - Focus on mastering fundamental concepts
   - Relevant to {employee_insights['role']} scenarios
   - Progressive skill building
   - 10-15 words max each

OUTPUT FORMAT:
===ENHANCED_CONTENT===
[Enhanced content here]

===LEARNING_OBJECTIVES===
1. [First objective]
2. [Second objective]
3. [Third objective]
"""
        
        else:
            # Default for practical/case study sections
            batch_prompt = f"""{base_context}

TASK: Transform content into engaging practical learning with objectives.

REQUIREMENTS:
1. ENHANCED CONTENT: Create practical, application-focused content
   - Real-world application for {employee_insights['role']}s
   - Story-telling with relatable scenarios
   - Step-by-step guidance and best practices
   - "What-if" scenarios and problem-solving
   - Connect to daily work challenges
   - Encouraging, confidence-building tone

2. LEARNING OBJECTIVES: Create 3 implementation-focused objectives
   - Emphasize practical application
   - Relevant to {employee_insights['role']} responsibilities
   - Action-oriented outcomes
   - 10-15 words max each

OUTPUT FORMAT:
===ENHANCED_CONTENT===
[Enhanced content here]

===LEARNING_OBJECTIVES===
1. [First objective]
2. [Second objective]
3. [Third objective]
"""
        
        return batch_prompt
    
    def _parse_batch_response(self, response_text: str) -> Tuple[str, List[str]]:
        """Parse the structured batch response from GPT-4"""
        
        # Split by sections
        content_marker = "===ENHANCED_CONTENT==="
        objectives_marker = "===LEARNING_OBJECTIVES==="
        
        try:
            # Extract enhanced content
            content_start = response_text.find(content_marker)
            objectives_start = response_text.find(objectives_marker)
            
            if content_start == -1 or objectives_start == -1:
                raise ValueError("Response markers not found")
            
            # Get enhanced content
            enhanced_content = response_text[
                content_start + len(content_marker):objectives_start
            ].strip()
            
            # Get learning objectives
            objectives_text = response_text[
                objectives_start + len(objectives_marker):
            ].strip()
            
            # Parse objectives
            learning_objectives = []
            for line in objectives_text.split('\n'):
                line = line.strip()
                if line and (line.startswith('1.') or line.startswith('2.') or line.startswith('3.')):
                    # Remove numbering and clean
                    objective = re.sub(r'^\d+\.\s*', '', line).strip()
                    if objective:
                        learning_objectives.append(objective)
            
            # Validate
            if not enhanced_content or len(learning_objectives) == 0:
                raise ValueError("Parsed content is empty")
            
            return enhanced_content, learning_objectives[:3]  # Ensure max 3 objectives
            
        except Exception as e:
            logger.error(f"Failed to parse batch response: {e}")
            # Fallback parsing - just return the response as content
            return response_text, ["Apply key concepts to daily work", "Understand fundamental principles", "Implement best practices"]