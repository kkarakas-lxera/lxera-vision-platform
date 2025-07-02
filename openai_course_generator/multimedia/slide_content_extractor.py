#!/usr/bin/env python3
"""
Slide Content Extractor
Extracts structured content for slides with synchronized notes from course modules
Enhanced with GPT-4 Turbo for richer slide content generation
"""

import os
import re
import json
import logging
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime
import nltk
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    from nltk.tokenize import sent_tokenize, word_tokenize
    from nltk.corpus import stopwords
    NLTK_AVAILABLE = True
except:
    NLTK_AVAILABLE = False
    logging.warning("NLTK not available, using basic text processing")

# Import OpenAI for content enrichment
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
    openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
except:
    OPENAI_AVAILABLE = False
    openai_client = None
    logging.warning("OpenAI not available, using basic extraction")

logger = logging.getLogger(__name__)

@dataclass
class SlideNote:
    """Detailed notes for a slide including timing information"""
    slide_id: str
    content_section: str
    main_points: List[str]
    detailed_notes: str
    timing_cues: List[Dict[str, Any]]  # [{"start": 0, "end": 5, "text": "..."}]
    visual_elements: List[str]
    transitions: Dict[str, str]

@dataclass
class ExtractedSlideContent:
    """Complete extracted content for slide generation"""
    module_name: str
    total_slides: int
    slide_notes: List[SlideNote]
    content_hierarchy: Dict[str, Any]
    timing_map: Dict[str, float]  # slide_id -> duration
    metadata: Dict[str, Any] = field(default_factory=dict)

class SlideContentExtractor:
    """Extracts and structures content for educational slides with optional GPT-4 enrichment"""
    
    def __init__(self, enable_gpt_enrichment: bool = True, employee_context: Dict[str, Any] = None):
        """Initialize the content extractor with optional GPT enrichment"""
        # Configuration
        self.max_points_per_slide = 5
        self.min_points_per_slide = 2
        self.ideal_note_length = 150  # words
        self.max_note_length = 200   # words
        
        # GPT enrichment settings
        self.enable_gpt_enrichment = enable_gpt_enrichment and OPENAI_AVAILABLE
        self.employee_context = employee_context or {}
        
        # Text processing
        if NLTK_AVAILABLE:
            self.stop_words = set(stopwords.words('english'))
        else:
            self.stop_words = set()
        
        if self.enable_gpt_enrichment:
            logger.info("🚀 Slide Content Extractor initialized with GPT-4 Turbo enrichment")
        else:
            logger.info("📝 Slide Content Extractor initialized with basic extraction")
    
    def extract_slide_content(
        self,
        content: Dict[str, Any],
        script_data: Optional[Dict[str, Any]] = None,
        course_plan: Optional[Dict[str, Any]] = None,
        employee_context: Optional[Dict[str, Any]] = None
    ) -> ExtractedSlideContent:
        """
        Extract structured content for slides from module content
        
        Args:
            content: Module content from database
            script_data: Optional script data from EducationalScriptGenerator
            course_plan: Optional complete course plan for context
            employee_context: Optional employee information for personalization
            
        Returns:
            ExtractedSlideContent with all slide information
        """
        logger.info(f"Extracting slide content for module: {content.get('module_name', 'Unknown')}")
        
        # Update employee context if provided
        if employee_context:
            self.employee_context = employee_context
        
        # Store course plan for context
        self.course_plan = course_plan or {}
        
        # Build content hierarchy
        content_hierarchy = self._build_content_hierarchy(content)
        
        # Extract slide notes for each section
        slide_notes = []
        slide_id_counter = 1
        timing_map = {}
        
        # Title slide
        title_note = self._create_title_slide_note(
            f"slide_{slide_id_counter}",
            content.get('module_name', 'Training Module'),
            content_hierarchy
        )
        slide_notes.append(title_note)
        timing_map[title_note.slide_id] = 20.0  # 20 seconds for title
        slide_id_counter += 1
        
        # Process each content section
        for section_name, section_data in content_hierarchy.items():
            if section_name == 'metadata':
                continue
                
            section_notes = self._extract_section_slides(
                section_name,
                section_data,
                slide_id_counter,
                script_data
            )
            
            for note in section_notes:
                slide_notes.append(note)
                # Estimate timing based on content
                timing_map[note.slide_id] = self._estimate_slide_duration(note)
                slide_id_counter += 1
        
        # Summary slide
        summary_note = self._create_summary_slide_note(
            f"slide_{slide_id_counter}",
            content_hierarchy,
            slide_notes
        )
        slide_notes.append(summary_note)
        timing_map[summary_note.slide_id] = 25.0  # 25 seconds for summary
        
        return ExtractedSlideContent(
            module_name=content.get('module_name', 'Training Module'),
            total_slides=len(slide_notes),
            slide_notes=slide_notes,
            content_hierarchy=content_hierarchy,
            timing_map=timing_map,
            metadata={
                'content_id': content.get('content_id'),
                'extraction_timestamp': datetime.now().isoformat(),
                'has_script_data': script_data is not None
            }
        )
    
    def _build_content_hierarchy(self, content: Dict[str, Any]) -> Dict[str, Any]:
        """Build hierarchical structure of content"""
        hierarchy = {}
        
        # Standard sections
        sections = [
            'introduction',
            'core_content',
            'practical_applications',
            'case_studies',
            'assessments'
        ]
        
        for section in sections:
            if section in content and content[section]:
                section_content = content[section]
                
                # Parse section into structured data
                hierarchy[section] = {
                    'raw_content': section_content,
                    'paragraphs': self._split_into_paragraphs(section_content),
                    'key_points': self._extract_key_points(section_content),
                    'examples': self._extract_examples(section_content),
                    'definitions': self._extract_definitions(section_content),
                    'action_items': self._extract_action_items(section_content)
                }
        
        # Add metadata
        hierarchy['metadata'] = {
            'module_name': content.get('module_name'),
            'content_id': content.get('content_id'),
            'total_word_count': content.get('total_word_count', 0)
        }
        
        return hierarchy
    
    def _split_into_paragraphs(self, text: str) -> List[str]:
        """Split text into clean paragraphs"""
        # Split by double newlines or single newlines with proper sentences
        paragraphs = re.split(r'\n\s*\n|\n(?=[A-Z])', text)
        
        # Clean and filter
        cleaned = []
        for para in paragraphs:
            para = para.strip()
            if len(para) > 50:  # Minimum paragraph length
                cleaned.append(para)
        
        return cleaned
    
    def _extract_key_points(self, text: str) -> List[str]:
        """Extract key points from text, with optional GPT-4 enrichment"""
        
        # First, try basic extraction
        basic_points = self._extract_basic_key_points(text)
        
        # If GPT enrichment is enabled and we have meaningful content, enhance it
        if self.enable_gpt_enrichment and text and len(text) > 100:
            try:
                enriched_points = self._enrich_key_points_with_gpt(text, basic_points)
                return enriched_points
            except Exception as e:
                logger.warning(f"GPT enrichment failed, falling back to basic extraction: {e}")
                return basic_points
        
        return basic_points
    
    def _extract_basic_key_points(self, text: str) -> List[str]:
        """Basic key point extraction (original method)"""
        key_points = []
        
        # Look for explicit lists
        list_patterns = [
            r'(?:^|\n)[-•*]\s*(.+?)(?=\n|$)',
            r'(?:^|\n)\d+[.)]\s*(.+?)(?=\n|$)',
            r'(?:^|\n)(?:[a-z][.)]\s*)?(.+?)(?=\n|$)'
        ]
        
        for pattern in list_patterns:
            matches = re.findall(pattern, text, re.MULTILINE)
            for match in matches:
                point = match.strip()
                if 20 < len(point) < 200:
                    key_points.append(point)
        
        # Look for key sentences if no lists found
        if not key_points:
            sentences = self._split_into_sentences(text)
            for sentence in sentences:
                if self._is_key_sentence(sentence):
                    key_points.append(sentence)
        
        # Remove duplicates while preserving order
        seen = set()
        unique_points = []
        for point in key_points:
            if point.lower() not in seen:
                seen.add(point.lower())
                unique_points.append(point)
        
        return unique_points
    
    def _enrich_key_points_with_gpt(self, text: str, basic_points: List[str]) -> List[str]:
        """Enrich key points using GPT-4 Turbo with full context"""
        try:
            # Build context for GPT
            employee_name = self.employee_context.get('name', 'Learner')
            employee_role = self.employee_context.get('role', 'Professional')
            current_role = self.employee_context.get('current_role', employee_role)
            target_role = self.employee_context.get('target_role', 'Advanced ' + current_role)
            
            # Get course context
            course_title = self.course_plan.get('course_title', 'Professional Development Course')
            module_number = self.course_plan.get('current_module', 1)
            total_modules = self.course_plan.get('total_modules', 1)
            
            # Create enrichment prompt
            prompt = f"""
You are creating rich, comprehensive slide content for an educational presentation.

LEARNER CONTEXT:
- Name: {employee_name}
- Current Role: {current_role}
- Target Role: {target_role}
- Course: {course_title} (Module {module_number} of {total_modules})

SECTION CONTENT:
{text[:1000]}... [content continues]

BASIC POINTS EXTRACTED:
{json.dumps(basic_points, indent=2)}

TASK: Transform these basic points into rich, comprehensive slide content that:

1. EXPANDS each point into 2-3 detailed sentences (40-60 words each)
2. ADDS specific examples relevant to {current_role}
3. INCLUDES actionable insights and practical applications
4. INCORPORATES statistics, data, or industry standards where relevant
5. PERSONALIZES content for {employee_name}'s journey from {current_role} to {target_role}
6. ENSURES each point teaches a concrete skill or concept
7. MAKES points memorable with analogies or real-world connections

OUTPUT FORMAT:
Return a JSON array of enriched points. Each point should be:
- 40-60 words long
- Self-contained and meaningful
- Directly applicable to their role
- Engaging and educational

Example format:
[
  "Master financial forecasting by leveraging Excel's advanced functions like FORECAST.ETS for time-series predictions. This skill transforms raw data into strategic insights, enabling you to predict quarterly revenues with 85% accuracy and support executive decision-making.",
  "Implement variance analysis workflows that compare actual vs. budgeted performance across departments. Use PowerBI dashboards to visualize deviations exceeding 10%, creating actionable reports that help managers course-correct within the same quarter."
]

Generate 4-6 rich, detailed points that transform this content into an engaging learning experience.
"""
            
            # Call GPT-4 Turbo
            response = openai_client.chat.completions.create(
                model="gpt-4-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert instructional designer creating rich, detailed slide content for professional education. Transform basic points into comprehensive, engaging learning content."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                response_format={"type": "json_object"},
                max_tokens=1000
            )
            
            # Parse response
            result = json.loads(response.choices[0].message.content)
            
            # Extract points from various possible formats
            if isinstance(result, list):
                enriched_points = result
            elif isinstance(result, dict):
                # Handle different possible keys
                enriched_points = (
                    result.get('points', []) or 
                    result.get('enriched_points', []) or 
                    result.get('content', []) or
                    []
                )
            else:
                enriched_points = []
            
            # Validate and clean points
            valid_points = []
            for point in enriched_points:
                if isinstance(point, str) and 20 < len(point) < 500:
                    valid_points.append(point.strip())
            
            # If we got good enriched content, use it; otherwise fall back
            if len(valid_points) >= 2:
                logger.info(f"✅ GPT enriched {len(basic_points)} basic points into {len(valid_points)} rich points")
                return valid_points[:6]  # Limit to 6 points max
            else:
                logger.warning("GPT enrichment produced insufficient points, using basic extraction")
                return basic_points
                
        except Exception as e:
            logger.error(f"GPT enrichment failed: {e}")
            return basic_points
    
    def _extract_examples(self, text: str) -> List[Dict[str, str]]:
        """Extract examples from text"""
        examples = []
        
        # Look for example indicators
        example_patterns = [
            r'(?:for example|e\.g\.|for instance)[,:]?\s*(.+?)(?=\.|$)',
            r'(?:such as|like)\s*(.+?)(?=\.|$)',
            r'(?:example|case|scenario):\s*(.+?)(?=\n|$)'
        ]
        
        for pattern in example_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE | re.MULTILINE)
            for match in matches:
                example_text = match.strip()
                if len(example_text) > 20:
                    examples.append({
                        'text': example_text,
                        'type': 'inline_example'
                    })
        
        # Look for structured examples
        example_blocks = re.findall(
            r'Example.*?:\s*\n(.+?)(?=\n\n|\n[A-Z]|$)',
            text,
            re.IGNORECASE | re.DOTALL
        )
        
        for block in example_blocks:
            examples.append({
                'text': block.strip(),
                'type': 'block_example'
            })
        
        return examples[:5]  # Limit to 5 examples
    
    def _extract_definitions(self, text: str) -> List[Dict[str, str]]:
        """Extract definitions from text"""
        definitions = []
        
        # Look for definition patterns
        def_patterns = [
            r'(\w+)\s+(?:is|are|means|refers to)\s+(.+?)(?=\.|$)',
            r'(\w+):\s*(.+?)(?=\.|$)',
            r'(?:define|definition of)\s+(\w+).*?[:-]\s*(.+?)(?=\.|$)'
        ]
        
        for pattern in def_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for term, definition in matches:
                if len(definition) > 20 and len(term) > 2:
                    definitions.append({
                        'term': term.strip(),
                        'definition': definition.strip()
                    })
        
        return definitions[:5]  # Limit to 5 definitions
    
    def _extract_action_items(self, text: str) -> List[str]:
        """Extract action items or tasks from text"""
        action_items = []
        
        # Look for action-oriented language
        action_patterns = [
            r'(?:you should|you must|you need to|make sure to)\s+(.+?)(?=\.|$)',
            r'(?:remember to|don\'t forget to|be sure to)\s+(.+?)(?=\.|$)',
            r'(?:action|task|todo):\s*(.+?)(?=\.|$)'
        ]
        
        for pattern in action_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                item = match.strip()
                if len(item) > 10:
                    action_items.append(item)
        
        return action_items[:5]  # Limit to 5 items
    
    def _create_title_slide_note(
        self,
        slide_id: str,
        module_name: str,
        content_hierarchy: Dict[str, Any]
    ) -> SlideNote:
        """Create notes for title slide"""
        
        # Extract learning objectives from introduction
        main_points = ["Welcome to Your Training"]
        
        if 'introduction' in content_hierarchy:
            intro_points = content_hierarchy['introduction']['key_points']
            main_points.extend(intro_points[:3])
        
        # Create detailed notes
        detailed_notes = f"""
This module on {module_name} will provide you with essential knowledge and practical skills.
We'll cover key concepts, real-world applications, and actionable insights that you can 
immediately apply in your professional role.
"""
        
        # Timing cues for title slide
        timing_cues = [
            {"start": 0, "end": 5, "text": "Display title and welcome message"},
            {"start": 5, "end": 15, "text": "Present learning objectives"},
            {"start": 15, "end": 20, "text": "Transition to first content slide"}
        ]
        
        return SlideNote(
            slide_id=slide_id,
            content_section="title",
            main_points=main_points,
            detailed_notes=detailed_notes.strip(),
            timing_cues=timing_cues,
            visual_elements=["Module title", "Professional backdrop", "Learning objectives list"],
            transitions={"entry": "fade_in", "exit": "slide_left"}
        )
    
    def _extract_section_slides(
        self,
        section_name: str,
        section_data: Dict[str, Any],
        start_slide_id: int,
        script_data: Optional[Dict[str, Any]]
    ) -> List[SlideNote]:
        """Extract slides for a content section"""
        slides = []
        
        # Get section content
        paragraphs = section_data.get('paragraphs', [])
        key_points = section_data.get('key_points', [])
        examples = section_data.get('examples', [])
        
        # Determine number of slides needed
        content_length = len(' '.join(paragraphs).split())
        num_slides = max(1, min(3, content_length // 300))  # 1-3 slides per section
        
        # Distribute content across slides
        points_per_slide = len(key_points) // num_slides if num_slides > 0 else len(key_points)
        
        for i in range(num_slides):
            slide_id = f"slide_{start_slide_id + i}"
            
            # Get points for this slide
            start_idx = i * points_per_slide
            end_idx = start_idx + points_per_slide if i < num_slides - 1 else len(key_points)
            slide_points = key_points[start_idx:end_idx]
            
            # Ensure minimum points
            if len(slide_points) < self.min_points_per_slide and paragraphs:
                # Extract additional points from paragraphs
                para_idx = i % len(paragraphs)
                additional_points = self._extract_key_sentences(paragraphs[para_idx])
                slide_points.extend(additional_points[:self.min_points_per_slide - len(slide_points)])
            
            # Limit points
            slide_points = slide_points[:self.max_points_per_slide]
            
            # Create detailed notes from corresponding paragraph
            para_idx = min(i, len(paragraphs) - 1)
            detailed_notes = self._create_slide_notes(
                paragraphs[para_idx] if para_idx < len(paragraphs) else "",
                slide_points,
                section_name
            )
            
            # Add example if available
            if examples and i == 0:  # Add example to first slide of section
                example = examples[0]
                detailed_notes += f"\n\nFor example: {example['text']}"
            
            # Create timing cues
            timing_cues = self._generate_timing_cues(slide_points, detailed_notes)
            
            # Determine visual elements
            visual_elements = self._suggest_visuals(section_name, slide_points, examples)
            
            # Create slide note
            slide_note = SlideNote(
                slide_id=slide_id,
                content_section=section_name,
                main_points=slide_points,
                detailed_notes=detailed_notes,
                timing_cues=timing_cues,
                visual_elements=visual_elements,
                transitions={
                    "entry": "slide_left" if i > 0 else "fade_in",
                    "exit": "slide_left" if i < num_slides - 1 else "fade_out"
                }
            )
            
            slides.append(slide_note)
        
        return slides
    
    def _create_slide_notes(
        self,
        paragraph: str,
        points: List[str],
        section_name: str
    ) -> str:
        """Create detailed speaker notes for a slide, with optional GPT enrichment"""
        
        # If GPT enrichment is enabled, generate comprehensive speaker notes
        if self.enable_gpt_enrichment and points:
            try:
                enriched_notes = self._generate_enriched_speaker_notes(
                    paragraph, points, section_name
                )
                if enriched_notes:
                    return enriched_notes
            except Exception as e:
                logger.warning(f"Failed to generate enriched speaker notes: {e}")
        
        # Fallback to basic notes generation
        # Start with context
        section_intro = {
            'introduction': "Let's begin by understanding",
            'core_content': "Now, let's dive into the core concepts",
            'practical_applications': "Here's how you can apply this knowledge",
            'case_studies': "Let's look at a real-world example",
            'assessments': "Let's check your understanding"
        }
        
        notes = section_intro.get(section_name, "Let's explore") + ". "
        
        # Add main content, avoiding repetition of bullet points
        # Remove content that's already in points
        cleaned_paragraph = paragraph
        for point in points:
            cleaned_paragraph = cleaned_paragraph.replace(point, '')
        
        # Add remaining content
        sentences = self._split_into_sentences(cleaned_paragraph)
        relevant_sentences = [s for s in sentences if len(s) > 30][:3]
        
        if relevant_sentences:
            notes += ' '.join(relevant_sentences)
        
        # Ensure proper length
        words = notes.split()
        if len(words) > self.max_note_length:
            notes = ' '.join(words[:self.max_note_length]) + "..."
        elif len(words) < 50:
            notes += " This is a key concept that will help you in your role."
        
        return notes.strip()
    
    def _generate_enriched_speaker_notes(
        self,
        paragraph: str,
        points: List[str],
        section_name: str
    ) -> Optional[str]:
        """Generate rich speaker notes using GPT-4 Turbo"""
        try:
            employee_name = self.employee_context.get('name', 'Learner')
            employee_role = self.employee_context.get('role', 'Professional')
            
            prompt = f"""
Generate comprehensive speaker notes for presenting this slide to {employee_name} ({employee_role}).

SLIDE SECTION: {section_name.replace('_', ' ').title()}

SLIDE POINTS:
{json.dumps(points, indent=2)}

CONTEXT PARAGRAPH:
{paragraph[:500]}...

CREATE SPEAKER NOTES THAT:
1. Welcome and engage {employee_name} personally
2. Explain each point with practical context for their role as {employee_role}
3. Include 1-2 specific examples or anecdotes
4. Add transitions between points
5. Suggest when to pause for emphasis
6. Include a question to engage the learner
7. End with a connection to the next concept

Target length: 150-200 words
Style: Conversational, engaging, educational

The notes should guide the presenter to deliver an engaging, personalized learning experience.
"""
            
            response = openai_client.chat.completions.create(
                model="gpt-4-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert instructional designer creating engaging speaker notes for educational presentations. Make the notes conversational and focused on the learner's journey."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8,
                max_tokens=400
            )
            
            speaker_notes = response.choices[0].message.content.strip()
            
            # Validate length
            word_count = len(speaker_notes.split())
            if 100 < word_count < 250:
                logger.info(f"✅ Generated enriched speaker notes: {word_count} words")
                return speaker_notes
            else:
                logger.warning(f"Generated speaker notes outside target length: {word_count} words")
                return None
                
        except Exception as e:
            logger.error(f"Failed to generate enriched speaker notes: {e}")
            return None
    
    def _generate_timing_cues(
        self,
        points: List[str],
        notes: str
    ) -> List[Dict[str, Any]]:
        """Generate timing cues for slide animation"""
        
        timing_cues = []
        total_duration = self._estimate_speaking_duration(notes)
        
        # Entry animation
        timing_cues.append({
            "start": 0,
            "end": 2,
            "text": "Slide transition and title display"
        })
        
        # Points appear one by one
        if points:
            point_duration = (total_duration - 4) / len(points)  # Reserve 4s for intro/outro
            current_time = 2
            
            for i, point in enumerate(points):
                timing_cues.append({
                    "start": current_time,
                    "end": current_time + point_duration,
                    "text": f"Display point {i+1}: {point[:30]}..."
                })
                current_time += point_duration
        
        # Exit preparation
        timing_cues.append({
            "start": total_duration - 2,
            "end": total_duration,
            "text": "Prepare for next slide"
        })
        
        return timing_cues
    
    def _suggest_visuals(
        self,
        section_name: str,
        points: List[str],
        examples: List[Dict[str, str]]
    ) -> List[str]:
        """Suggest appropriate visuals for slide"""
        
        visuals = []
        
        # Section-specific visuals
        section_visuals = {
            'introduction': ["Overview diagram", "Concept map"],
            'core_content': ["Key concepts illustration", "Process flow"],
            'practical_applications': ["Step-by-step guide", "Best practices checklist"],
            'case_studies': ["Scenario illustration", "Success metrics"],
            'assessments': ["Quiz interface", "Knowledge check"]
        }
        
        visuals.extend(section_visuals.get(section_name, ["Content illustration"])[:1])
        
        # Content-based visuals
        content_text = ' '.join(points).lower()
        
        if 'process' in content_text or 'step' in content_text:
            visuals.append("Process diagram")
        elif 'compare' in content_text or 'difference' in content_text:
            visuals.append("Comparison chart")
        elif any(word in content_text for word in ['data', 'number', 'statistic']):
            visuals.append("Data visualization")
        elif examples:
            visuals.append("Example illustration")
        
        # Icons for bullet points
        visuals.append("Bullet point icons")
        
        return visuals[:3]  # Limit to 3 visuals
    
    def _create_summary_slide_note(
        self,
        slide_id: str,
        content_hierarchy: Dict[str, Any],
        all_slides: List[SlideNote]
    ) -> SlideNote:
        """Create notes for summary slide"""
        
        # Extract key takeaways from all sections
        key_takeaways = []
        
        for section_name, section_data in content_hierarchy.items():
            if section_name != 'metadata' and section_data.get('key_points'):
                # Get most important point from each section
                points = section_data['key_points']
                if points:
                    key_takeaways.append(points[0])
        
        # Limit and enhance takeaways
        key_takeaways = key_takeaways[:5]
        
        # Add default takeaways if needed
        if len(key_takeaways) < 3:
            defaults = [
                "Apply these concepts in your daily work",
                "Continue practicing for mastery",
                "Reach out if you need support"
            ]
            key_takeaways.extend(defaults[:3-len(key_takeaways)])
        
        # Create detailed notes
        detailed_notes = """
Congratulations on completing this module! Let's recap the key takeaways that will 
help you succeed. Remember, learning is an ongoing journey, and you now have valuable 
knowledge to apply in your role. Keep these points in mind as you move forward.
"""
        
        # Timing cues
        timing_cues = [
            {"start": 0, "end": 5, "text": "Display summary title"},
            {"start": 5, "end": 20, "text": "Present key takeaways"},
            {"start": 20, "end": 25, "text": "Closing message and encouragement"}
        ]
        
        return SlideNote(
            slide_id=slide_id,
            content_section="summary",
            main_points=key_takeaways,
            detailed_notes=detailed_notes.strip(),
            timing_cues=timing_cues,
            visual_elements=["Summary infographic", "Success celebration", "Next steps"],
            transitions={"entry": "fade_in", "exit": "fade_out"}
        )
    
    def _split_into_sentences(self, text: str) -> List[str]:
        """Split text into sentences"""
        if NLTK_AVAILABLE:
            return sent_tokenize(text)
        else:
            # Basic sentence splitting
            sentences = re.split(r'[.!?]+', text)
            return [s.strip() for s in sentences if s.strip()]
    
    def _is_key_sentence(self, sentence: str) -> bool:
        """Determine if a sentence is key/important"""
        key_indicators = [
            'important', 'key', 'essential', 'critical', 'must',
            'remember', 'note that', 'significant', 'primary',
            'fundamental', 'crucial', 'vital'
        ]
        
        sentence_lower = sentence.lower()
        return any(indicator in sentence_lower for indicator in key_indicators)
    
    def _extract_key_sentences(self, text: str) -> List[str]:
        """Extract key sentences from text"""
        sentences = self._split_into_sentences(text)
        key_sentences = []
        
        for sentence in sentences:
            if self._is_key_sentence(sentence) or len(sentence.split()) < 20:
                key_sentences.append(sentence)
        
        return key_sentences[:3]  # Limit to 3
    
    def _estimate_slide_duration(self, slide_note: SlideNote) -> float:
        """Estimate duration for a slide in seconds"""
        # Base on speaker notes length
        word_count = len(slide_note.detailed_notes.split())
        speaking_duration = (word_count / 150) * 60  # 150 WPM
        
        # Add time for visual processing
        visual_time = len(slide_note.main_points) * 2  # 2 seconds per point
        
        # Total duration
        duration = speaking_duration + visual_time
        
        # Ensure reasonable bounds
        return max(15, min(45, duration))
    
    def _estimate_speaking_duration(self, text: str) -> float:
        """Estimate speaking duration for text"""
        word_count = len(text.split())
        return max(10, (word_count / 150) * 60)  # 150 WPM, minimum 10 seconds
    
    def export_to_json(self, extracted_content: ExtractedSlideContent, output_path: str) -> None:
        """Export extracted content to JSON"""
        export_data = {
            'module_name': extracted_content.module_name,
            'total_slides': extracted_content.total_slides,
            'timing_map': extracted_content.timing_map,
            'metadata': extracted_content.metadata,
            'slides': []
        }
        
        for slide_note in extracted_content.slide_notes:
            export_data['slides'].append({
                'slide_id': slide_note.slide_id,
                'content_section': slide_note.content_section,
                'main_points': slide_note.main_points,
                'detailed_notes': slide_note.detailed_notes,
                'timing_cues': slide_note.timing_cues,
                'visual_elements': slide_note.visual_elements,
                'transitions': slide_note.transitions,
                'estimated_duration': extracted_content.timing_map.get(slide_note.slide_id, 20)
            })
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Extracted content exported to: {output_path}")