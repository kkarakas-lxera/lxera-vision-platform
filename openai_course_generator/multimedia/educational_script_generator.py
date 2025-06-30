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

# Import our new components
from .content_essence_extractor import ContentEssenceExtractor, SlideEssence
from .human_narration_generator import HumanNarrationGenerator

logger = logging.getLogger(__name__)

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
    """Generates educational scripts from course content"""
    
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
        
        # Initialize enhanced components
        self.essence_extractor = ContentEssenceExtractor()
        self.narration_generator = HumanNarrationGenerator()
        
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
        
        # Generate learning objectives
        learning_objectives = self._generate_learning_objectives(sections)
        
        # Create slide structure
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
        
        # Content slides for each section
        for section_name, section_content in sections.items():
            if section_content:
                section_slides = self._create_section_slides(
                    section_name,
                    section_content,
                    slide_number,
                    employee_context
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
        """Extract key bullet points from content"""
        key_points = []
        
        # First try to extract existing bullet points
        bullet_patterns = [
            r'[-•*]\s*(.+)',
            r'\d+\.\s*(.+)',
            r'^\s*(.+):\s*(.+)$'  # Items with descriptions
        ]
        
        for pattern in bullet_patterns:
            matches = re.findall(pattern, content, re.MULTILINE)
            for match in matches:
                if isinstance(match, tuple):
                    # For pattern with groups, combine them
                    point = f"{match[0]}: {match[1]}"
                else:
                    point = match
                
                # Truncate to first sentence if too long
                point = point.strip()
                if '.' in point:
                    point = point.split('.')[0] + '.'
                
                # Ensure concise bullet points (max 15 words)
                words = point.split()
                if len(words) > 15:
                    point = ' '.join(words[:12]) + '...'
                
                if len(point) > 10:
                    key_points.append(point)
        
        # If no bullet points found, create from key sentences
        if not key_points:
            # Extract sentences with important keywords
            sentences = re.split(r'[.!?]+', content)
            important_sentences = []
            
            for sentence in sentences:
                sentence = sentence.strip()
                if any(keyword in sentence.lower() for keyword in 
                      ['important', 'key', 'must', 'essential', 'critical', 
                       'powerful', 'transform', 'enable', 'achieve']):
                    important_sentences.append(sentence)
            
            # Convert sentences to concise bullet points
            for sentence in important_sentences[:5]:
                # Extract the core message
                words = sentence.split()
                if len(words) > 15:
                    # Find the key phrase
                    key_phrase = self._extract_key_phrase(sentence)
                    key_points.append(key_phrase)
                else:
                    key_points.append(sentence)
        
        # If still no points, create from content summary
        if not key_points:
            # Split content into logical chunks
            paragraphs = content.split('\n\n')
            for para in paragraphs[:3]:
                if para.strip():
                    # Create a concise summary
                    summary = self._create_concise_summary(para)
                    if summary:
                        key_points.append(summary)
        
        return key_points[:self.max_bullet_points]
    
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
        if hasattr(self, 'essence_extractor'):
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
        if hasattr(self, 'narration_generator'):
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