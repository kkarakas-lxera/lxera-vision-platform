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
    slide_id: str = field(default_factory=lambda: f"slide_{int(datetime.now().timestamp())}")
    timing_cues: List[str] = field(default_factory=list)

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
            duration_estimate=self._estimate_duration(speaker_notes),
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
        """Extract meaningful bullet points from GPT-4 enhanced content with improved parsing"""
        if not self.openai_api_key:
            return self._fallback_key_points_extraction(content)
        
        try:
            # First, check if API key is actually set
            if not openai.api_key:
                logger.warning("OpenAI API key not set, using fallback")
                return self._fallback_key_points_extraction(content)
            
            # Use GPT-4 to extract meaningful bullet points from enhanced content
            extraction_prompt = f"""
Extract 3-4 clear, actionable bullet points from this educational content. Each bullet point should:
1. Be a complete, self-contained idea (10-15 words)
2. Start with an action verb or key concept
3. Focus on practical value for the learner
4. Be specific and concrete, not generic

IMPORTANT: Return ONLY the bullet points, one per line. Do not include:
- Bullet symbols (•, -, *)
- Numbers (1., 2., etc.)
- Quotation marks
- Any prefixes or labels

CONTENT:
{content[:1500]}

BULLET POINTS:
"""
            
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert instructional designer who creates clear, actionable learning points. Output only the requested bullet points without any formatting."},
                    {"role": "user", "content": extraction_prompt}
                ],
                max_tokens=300,
                temperature=0.3,
                timeout=30  # Add timeout for reliability
            )
            
            bullet_text = response.choices[0].message.content.strip()
            
            # Parse bullet points with improved validation
            bullet_points = []
            for line in bullet_text.split('\n'):
                line = line.strip()
                if not line:
                    continue
                    
                # Remove any formatting that might have been added
                cleaned = self._clean_bullet_point(line)
                
                # Validate the bullet point
                if self._validate_bullet_point(cleaned):
                    bullet_points.append(cleaned)
            
            # If we got good bullet points, return them
            if len(bullet_points) >= 2:
                return bullet_points[:4]
            
            # Otherwise, try enhanced markdown parsing
            return self._enhanced_markdown_extraction(content)
            
        except Exception as e:
            logger.error(f"Failed to extract key points with GPT-4: {e}")
            return self._enhanced_markdown_extraction(content)
    
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
        """Validate if a text is a good bullet point"""
        # Check length
        word_count = len(text.split())
        if word_count < 3 or word_count > 20:
            return False
        
        # Check character count
        if len(text) < 15 or len(text) > 120:
            return False
        
        # Ensure it's not just a single word or phrase
        if not ' ' in text:
            return False
        
        # Check for complete thought (has a verb or action word)
        action_indicators = ['understand', 'learn', 'master', 'develop', 'apply', 'create', 
                           'analyze', 'implement', 'use', 'build', 'design', 'manage',
                           'improve', 'enhance', 'optimize', 'evaluate', 'assess',
                           'techniques', 'strategies', 'methods', 'approaches', 'tools',
                           'skills', 'knowledge', 'expertise', 'competency', 'ability']
        
        text_lower = text.lower()
        has_action = any(indicator in text_lower for indicator in action_indicators)
        
        return has_action
    
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
        
        # Extract key noun phrases
        key_phrases = self._extract_key_concepts(content)[:3]
        
        for phrase in key_phrases:
            # Create action-oriented bullet from concept
            if len(phrase.split()) > 1:
                bullets.append(f"Master the concepts of {phrase.lower()}")
            else:
                bullets.append(f"Understand {phrase.lower()} principles and applications")
        
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
        """Create content slides using source-based slide plan"""
        
        slides = []
        learning_points = section_summary['learning_points']
        key_concepts = section_summary['key_concepts']
        section_type = section_summary['section_type']
        
        # Use slide plan if available, otherwise fall back to chunking
        if slide_plan and len(slide_plan) > 1:  # Skip first slide (already created as title)
            content_plan = slide_plan[1:]  # Skip title slide
        else:
            # Fallback to generic chunking
            content_chunks = self._chunk_section_content(learning_points, key_concepts, max_slides)
            content_plan = [{"title": f"Key Concept {i+1}", "source": "content"} for i, _ in enumerate(content_chunks)]
        
        # Split content into focused chunks based on plan
        if slide_plan:
            content_chunks = self._chunk_content_by_plan(learning_points, key_concepts, content_plan)
        else:
            content_chunks = self._chunk_section_content(learning_points, key_concepts, max_slides)
        
        for i, (chunk, plan_item) in enumerate(zip(content_chunks, content_plan)):
            slide_number = start_slide_number + i
            
            # Use source-based slide title
            slide_title = plan_item["title"]
            
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
    
    def _chunk_content_by_plan(
        self,
        learning_points: List[str],
        key_concepts: List[str],
        content_plan: List[Dict[str, str]]
    ) -> List[List[str]]:
        """Chunk content based on source-derived slide plan"""
        
        all_points = learning_points + key_concepts
        if not all_points:
            return [["This section provides important insights for your learning journey."] for _ in content_plan]
        
        # Distribute content across planned slides
        points_per_slide = max(1, len(all_points) // len(content_plan))
        chunks = []
        
        for i, plan_item in enumerate(content_plan):
            start_idx = i * points_per_slide
            end_idx = start_idx + points_per_slide if i < len(content_plan) - 1 else len(all_points)
            
            chunk = all_points[start_idx:end_idx]
            if not chunk and all_points:  # Ensure we have some content
                chunk = [all_points[0]]
                
            chunks.append(chunk[:4])  # Max 4 points per slide
        
        return chunks
    
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
                
                # Add core insight with pacing markers
                if complexity == 'high':
                    notes_parts.append(f"[PAUSE] Let me break this down for you. {slide_essence.insight}")
                else:
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
        section_type = self._classify_section_type(section_name)
        
        openings = {
            'introduction': {
                'low': f"Welcome, {employee_name}! Let's start with the fundamentals that will transform how you work as a {role}.",
                'medium': f"Hello {employee_name}, as a {role}, you'll find these concepts particularly valuable for your daily challenges.",
                'high': f"Alright {employee_name}, we're going to tackle some advanced concepts that will elevate your expertise as a {role}."
            },
            'core_content': {
                'low': f"Great progress, {employee_name}! Now let's build on what we've learned.",
                'medium': f"Excellent, {employee_name}. Let's dive deeper into the core principles that drive success in your {role} position.",
                'high': f"Now {employee_name}, let's explore the sophisticated techniques that distinguish exceptional {role}s."
            },
            'practical': {
                'low': f"Time to put theory into practice, {employee_name}!",
                'medium': f"Let's see how this applies to your work as a {role}, {employee_name}.",
                'high': f"Ready for advanced implementation strategies, {employee_name}? These will set you apart as a {role}."
            }
        }
        
        default = f"Let's continue your learning journey, {employee_name}."
        return openings.get(section_type, {}).get(complexity, default)
    
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
        
        # Add narrative elements based on complexity
        if complexity == 'high':
            # Break down complex content
            sentences = self._smart_sentence_split(cleaned)
            if len(sentences) > 2:
                narrative = sentences[0]
                narrative += " [PAUSE] Let me explain this further. "
                narrative += " ".join(sentences[1:3])
            else:
                narrative = cleaned
        else:
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
        """Add natural transitions and emphasis to notes"""
        if not notes.endswith('.'):
            notes += '.'
        
        # Add key points emphasis with variety
        if key_points:
            transition = self._get_transition_phrase(len(notes.split()))
            emphasis = f" {transition}, {employee_name}, "
            
            if len(key_points) == 1:
                emphasis += f"the key takeaway here is to {key_points[0].lower()}."
            elif len(key_points) == 2:
                emphasis += f"remember these two critical points: {key_points[0].lower()}, and {key_points[1].lower()}."
            else:
                emphasis += "let me highlight the essential points you'll want to remember."
            
            notes += emphasis
        
        return notes
    
    def _get_transition_phrase(self, word_count: int) -> str:
        """Get varied transition phrases based on position in narration"""
        if word_count < 50:
            return "Now"
        elif word_count < 100:
            return "Moving forward"
        elif word_count < 150:
            return "Most importantly"
        else:
            return "To summarize"
    
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
            enhancement_prompt = f"""Transform this introduction into an engaging 3-4 minute learning experience for a {exp_level} {role}.

KEY REQUIREMENTS:
- Hook: Connect immediately to {role}'s daily challenges
- Why: Clear career benefits in first 30 seconds
- Tone: Conversational, building excitement
- Examples: 2 specific to {role} work
- Flow: Natural progression to main content

CONTEXT: {themes}

CONTENT:
{section_content}

ENHANCED VERSION:"""

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
            validation['word_count'] > 100 and 
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
        """Create concise batch prompt for better GPT-4 performance"""
        
        role = employee_insights['role']
        exp_level = employee_insights['experience_level']
        themes = ', '.join(course_context.get('key_themes', [])[:3])
        
        # Enhanced content preservation for comprehensive slide generation
        # Allow larger content to preserve all source headings for complete coverage
        max_content_length = 5000  # Increased to accommodate content with 6+ headings
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
        
        # CRITICAL: Extract headings from ORIGINAL content before any processing
        # This ensures we preserve all source structure regardless of GPT modifications
        original_headings = self._extract_markdown_headings(section_content)
        logger.info(f"DEBUG: Section content length: {len(section_content)} chars")
        logger.info(f"DEBUG: First 200 chars: {section_content[:200]}...")
        logger.info(f"ORIGINAL content headings found: {original_headings}")
        
        # Use original headings for slide planning to ensure all content is preserved
        source_headings = original_headings
        logger.info(f"Using {len(source_headings)} original headings for slide planning")
        
        # Create slide plan based on source structure
        self._current_slide_plan = self._create_slide_plan_from_source(source_headings, section_content)
        logger.info(f"Generated slide plan: {self._current_slide_plan}")
        
        # Section-specific batch prompt (content-faithful approach)
        if section_role['teaching_approach'] == 'engaging_introduction':
            batch_prompt = f"""CRITICAL: You must ONLY use content from the source material provided. 
Do NOT create new interpretive content or generic business analysis terms.

Your task is to EXTRACT and STRUCTURE the existing content, not interpret or expand it.

Role: {exp_level} {role}
Module: {section_name.replace('_', ' ').title()}

SOURCE STRUCTURE ANALYSIS:
Found {len(source_headings)} headings: {', '.join(source_headings)}

SLIDE PLANNING (create exactly {len(self._current_slide_plan)} slides):
{chr(10).join([f'{i+1}. {slide["title"]} (Source: {slide["source"]})' for i, slide in enumerate(self._current_slide_plan)])}

EXTRACTION REQUIREMENTS:
1. FIND actual learning objectives in source (look for "By the end", "You will", "Learning Objectives", numbered lists)
2. USE the exact ## headings found in source as slide titles
3. PRESERVE exact terminology and concepts mentioned in source
4. CREATE slides that match the source content structure

FORBIDDEN:
- Generic titles like "Key Concept 1", "Overview", "Introduction" 
- Creating new interpretive content
- Using business jargon not in source

REQUIRED: Use the exact ## headings as slide titles: {', '.join(source_headings)}

SOURCE CONTENT:
{section_content}

FORMAT YOUR RESPONSE EXACTLY AS:
===ENHANCED_CONTENT===
[Restructured source content for narration - no new interpretations]

===LEARNING_OBJECTIVES===
1. [Actual objective from source, or "None explicitly stated"]
2. [Actual objective from source, or "None explicitly stated"] 
3. [Actual objective from source, or "None explicitly stated"]

===SLIDE_TITLES===
{chr(10).join([f'{i+1}. {slide["title"]}' for i, slide in enumerate(self._current_slide_plan)])}"""
        
        elif section_role['teaching_approach'] == 'progressive_development':
            batch_prompt = f"""Role: {exp_level} {role}
Section: Core Content

Transform into progressive learning:
1. ENHANCED CONTENT:
   - Structure: Concept → Explanation → {role} Example → Application
   - Each idea builds on previous
   - Transitions: "Now that you understand X..."
   - Active voice: "You'll discover", "Let's explore"

2. OBJECTIVES (3 total, action-focused):
   - Master core concepts
   - Apply to {role} scenarios
   - Build progressive skills

3. SLIDE TITLES (3-4 specific titles):
   - Based on actual concepts covered
   - Progressive difficulty
   - Clear and professional

CONTENT:
{section_content}

FORMAT YOUR RESPONSE EXACTLY AS:
===ENHANCED_CONTENT===
[Your enhanced content here]

===LEARNING_OBJECTIVES===
1. [Objective]
2. [Objective]
3. [Objective]

===SLIDE_TITLES===
1. [Title 1]
2. [Title 2]
3. [Title 3]
4. [Title 4 if needed]"""
        
        else:
            # Practical/case study sections
            batch_prompt = f"""Role: {exp_level} {role}
Section: Practical Application

Create immediately applicable content:
1. ENHANCED CONTENT:
   - Real {role} scenario framework
   - Step-by-step implementation
   - Common pitfalls + solutions
   - 3 immediate takeaways

2. OBJECTIVES (3 action-oriented):
   - Implement specific techniques
   - Solve {role} challenges
   - Achieve measurable results

3. SLIDE TITLES (3-4 practical titles):
   - Action-oriented
   - Specific to techniques covered
   - Results-focused

CONTENT:
{section_content}

FORMAT YOUR RESPONSE EXACTLY AS:
===ENHANCED_CONTENT===
[Your enhanced content here]

===LEARNING_OBJECTIVES===
1. [Objective]
2. [Objective]
3. [Objective]

===SLIDE_TITLES===
1. [Title 1]
2. [Title 2]
3. [Title 3]
4. [Title 4 if needed]"""
        
        return batch_prompt
    
    def _parse_batch_response(self, response_text: str) -> Tuple[str, List[str], List[str]]:
        """Parse the structured batch response from GPT-4 with validation"""
        
        # Split by sections
        content_marker = "===ENHANCED_CONTENT==="
        objectives_marker = "===LEARNING_OBJECTIVES==="
        titles_marker = "===SLIDE_TITLES==="
        
        try:
            # Extract enhanced content
            content_start = response_text.find(content_marker)
            objectives_start = response_text.find(objectives_marker)
            titles_start = response_text.find(titles_marker)
            
            if content_start == -1 or objectives_start == -1:
                logger.warning("Response markers not found, attempting flexible parsing")
                # Try case-insensitive search
                content_start = response_text.lower().find(content_marker.lower())
                objectives_start = response_text.lower().find(objectives_marker.lower())
                titles_start = response_text.lower().find(titles_marker.lower())
                
                if content_start == -1 or objectives_start == -1:
                    raise ValueError("Response markers not found even with flexible parsing")
            
            # Get enhanced content
            enhanced_content = response_text[
                content_start + len(content_marker):objectives_start
            ].strip()
            
            # Validate enhanced content
            enhanced_content = self._validate_enhanced_content(enhanced_content)
            
            # Get learning objectives
            if titles_start == -1:
                # Old format without slide titles
                objectives_text = response_text[
                    objectives_start + len(objectives_marker):
                ].strip()
            else:
                # New format with slide titles
                objectives_text = response_text[
                    objectives_start + len(objectives_marker):titles_start
                ].strip()
            
            # Parse objectives with improved extraction
            learning_objectives = self._extract_learning_objectives(objectives_text)
            
            # Get slide titles if available
            slide_titles = []
            if titles_start != -1:
                titles_text = response_text[titles_start + len(titles_marker):].strip()
                slide_titles = self._extract_slide_titles(titles_text)
            
            # Final validation
            if not enhanced_content or len(learning_objectives) == 0:
                raise ValueError("Parsed content is empty or invalid")
            
            # Log success metrics
            logger.info(f"Successfully parsed batch response: {len(enhanced_content)} chars, {len(learning_objectives)} objectives, {len(slide_titles)} titles")
            
            return enhanced_content, learning_objectives[:3], slide_titles  # Return with slide titles
            
        except Exception as e:
            logger.error(f"Failed to parse batch response: {e}")
            logger.debug(f"Response preview: {response_text[:200]}...")
            
            # Intelligent fallback - try to extract something useful
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
                        objectives.append(objective)
                        objective_found = True
                        break
            
            # If no pattern matched but line looks like objective
            if not objective_found and self._validate_learning_objective(line):
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