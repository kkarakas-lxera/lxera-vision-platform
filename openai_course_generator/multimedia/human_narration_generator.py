#!/usr/bin/env python3
"""
Human Narration Generator
Creates natural, conversational narration with emotional expression and SSML markup
"""

import re
import logging
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime

logger = logging.getLogger(__name__)

@dataclass
class NarrationSegment:
    """A segment of narration with emotional context"""
    text: str
    emotion: str  # excited, thoughtful, encouraging, serious
    pace: str     # slow, normal, fast
    emphasis_words: List[str]
    pauses: List[Tuple[int, float]]  # (position, duration)
    
@dataclass 
class ConversationalScript:
    """Complete conversational script with natural flow"""
    greeting: str
    introduction: str
    main_content: List[NarrationSegment]
    transitions: List[str]
    conclusion: str
    total_duration: float

class HumanNarrationGenerator:
    """Generates human-like narration with emotional expression"""
    
    def __init__(self):
        """Initialize the narration generator"""
        # Emotional templates for different contexts
        self.emotion_templates = {
            'excited': {
                'pitch': '+10%',
                'rate': '105%',
                'volume': '+5dB'
            },
            'thoughtful': {
                'pitch': '-5%',
                'rate': '90%',
                'volume': 'medium'
            },
            'encouraging': {
                'pitch': '+5%',
                'rate': '95%',
                'volume': '+3dB'
            },
            'serious': {
                'pitch': '-10%',
                'rate': '85%',
                'volume': 'medium'
            }
        }
        
        # Natural speech patterns
        self.filler_phrases = [
            "Now, ",
            "So, ",
            "Actually, ",
            "You know, ",
            "Here's the thing - ",
            "What's interesting is ",
            "Let me tell you ",
            "Think about this - "
        ]
        
        # Transition phrases
        self.transitions = {
            'introduction': [
                "Let's dive right in.",
                "I'm excited to share this with you.",
                "This is going to be fascinating.",
                "You're going to love what we'll discover."
            ],
            'between_points': [
                "Moving on to something equally important...",
                "Now, here's where it gets really interesting...",
                "Building on that idea...",
                "Let's shift our focus to...",
                "Another key point to consider..."
            ],
            'conclusion': [
                "And there you have it!",
                "Pretty amazing, right?",
                "I hope this was as enlightening for you as it was for me.",
                "Remember, this is just the beginning of your journey."
            ]
        }
    
    def generate_conversational_script(
        self,
        content: Dict[str, Any],
        employee_context: Dict[str, Any],
        script_data: Dict[str, Any]
    ) -> ConversationalScript:
        """
        Generate a conversational script with natural speech patterns
        
        Args:
            content: Module content
            employee_context: Employee information
            script_data: Base script data
            
        Returns:
            ConversationalScript with natural flow
        """
        logger.info("Generating conversational script with human touch")
        
        # Create personalized greeting
        greeting = self._create_warm_greeting(employee_context)
        
        # Create engaging introduction
        introduction = self._create_engaging_introduction(
            content.get('module_name', ''),
            employee_context
        )
        
        # Transform main content into conversational segments
        main_content = []
        for slide in script_data.get('slides', []):
            segment = self._transform_to_conversational(slide, employee_context)
            main_content.append(segment)
        
        # Add natural transitions
        transitions = self._select_transitions(len(main_content))
        
        # Create inspiring conclusion
        conclusion = self._create_inspiring_conclusion(
            content.get('module_name', ''),
            employee_context
        )
        
        # Calculate total duration (accounting for pauses and pacing)
        total_duration = self._calculate_natural_duration(
            greeting, introduction, main_content, transitions, conclusion
        )
        
        return ConversationalScript(
            greeting=greeting,
            introduction=introduction,
            main_content=main_content,
            transitions=transitions,
            conclusion=conclusion,
            total_duration=total_duration
        )
    
    def _create_warm_greeting(self, employee_context: Dict[str, Any]) -> str:
        """Create a warm, personalized greeting"""
        name = employee_context.get('name', 'there')
        role = employee_context.get('role', '')
        
        greetings = [
            f"Hey {name}! <break time='500ms'/> Great to see you here.",
            f"Welcome back, {name}. <break time='300ms'/> I've been looking forward to this.",
            f"Hi {name}! <break time='400ms'/> Ready for an exciting learning journey?",
            f"{name}, <break time='300ms'/> so glad you're here with me today."
        ]
        
        # Select based on hash of name for consistency
        index = hash(name) % len(greetings)
        greeting = greetings[index]
        
        # Add role-specific touch (handle None or empty role)
        if role and isinstance(role, str):
            if 'analyst' in role.lower():
                greeting += " <break time='500ms'/> As an analyst, you're going to love the insights we'll uncover."
            elif 'manager' in role.lower():
                greeting += " <break time='500ms'/> This will give you powerful tools for your leadership toolkit."
        
        return self._add_ssml_markup(greeting, 'encouraging')
    
    def _create_engaging_introduction(self, module_name: str, employee_context: Dict[str, Any]) -> str:
        """Create an engaging introduction that hooks the learner"""
        
        intro_templates = [
            f"Today, we're exploring {module_name}. <break time='600ms'/> "
            f"But here's what makes this special - <break time='400ms'/> "
            f"we're not just learning concepts, we're building skills that will transform how you work.",
            
            f"Have you ever wondered what separates good professionals from great ones? "
            f"<break time='500ms'/> It's mastery of {module_name}. <break time='400ms'/> "
            f"And today, that's exactly what we're going to build together.",
            
            f"I'm excited to share something powerful with you - {module_name}. "
            f"<break time='500ms'/> This isn't just theory. <break time='300ms'/> "
            f"It's practical knowledge you can use immediately."
        ]
        
        # Select template
        intro = intro_templates[hash(module_name) % len(intro_templates)]
        
        return self._add_ssml_markup(intro, 'excited')
    
    def _transform_to_conversational(self, slide: Dict[str, Any], employee_context: Dict[str, Any]) -> NarrationSegment:
        """Transform slide content into conversational narration"""
        
        # Determine emotion based on content
        emotion = self._determine_emotion(slide)
        
        # Start with natural opener
        opener = self._select_natural_opener()
        
        # Build conversational narrative
        speaker_notes = slide.get('speaker_notes', '')
        
        # Add breathing pauses
        conversational_text = self._add_natural_pauses(speaker_notes)
        
        # Add emphasis to key words
        emphasis_words = self._identify_emphasis_words(speaker_notes)
        conversational_text = self._add_emphasis_markup(conversational_text, emphasis_words)
        
        # Add personal touches
        if employee_context.get('name'):
            conversational_text = self._add_personal_touches(
                conversational_text, 
                employee_context['name']
            )
        
        # Combine with opener
        full_text = f"{opener} {conversational_text}"
        
        # Determine pacing
        pace = self._determine_pace(slide)
        
        # Extract pause positions
        pauses = self._extract_pause_positions(full_text)
        
        return NarrationSegment(
            text=full_text,
            emotion=emotion,
            pace=pace,
            emphasis_words=emphasis_words,
            pauses=pauses
        )
    
    def _add_ssml_markup(self, text: str, emotion: str) -> str:
        """Add SSML markup for emotional expression"""
        emotion_config = self.emotion_templates.get(emotion, {})
        
        ssml = f'<prosody pitch="{emotion_config.get("pitch", "medium")}" '
        ssml += f'rate="{emotion_config.get("rate", "medium")}" '
        ssml += f'volume="{emotion_config.get("volume", "medium")}">'
        ssml += text
        ssml += '</prosody>'
        
        return ssml
    
    def _add_natural_pauses(self, text: str) -> str:
        """Add natural breathing pauses to text"""
        # Add pauses after sentences
        text = re.sub(r'\. ', '. <break time="400ms"/> ', text)
        text = re.sub(r'\? ', '? <break time="500ms"/> ', text)
        text = re.sub(r'! ', '! <break time="600ms"/> ', text)
        
        # Add pauses at commas
        text = re.sub(r', ', ', <break time="200ms"/> ', text)
        
        # Add pauses before important transitions
        text = re.sub(r'(However|Therefore|Moreover|Furthermore)', 
                     r'<break time="300ms"/> \1', text)
        
        # Add thoughtful pauses
        text = re.sub(r'(think about|consider|imagine|remember)', 
                     r'\1 <break time="300ms"/>', text, flags=re.IGNORECASE)
        
        return text
    
    def _add_emphasis_markup(self, text: str, emphasis_words: List[str]) -> str:
        """Add emphasis markup to key words"""
        for word in emphasis_words:
            # Create pattern that matches whole words only
            pattern = r'\b' + re.escape(word) + r'\b'
            replacement = f'<emphasis level="strong">{word}</emphasis>'
            text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
        
        return text
    
    def _identify_emphasis_words(self, text: str) -> List[str]:
        """Identify words that should be emphasized"""
        emphasis_patterns = [
            'important', 'critical', 'essential', 'key', 'remember',
            'powerful', 'transform', 'breakthrough', 'innovative',
            'never', 'always', 'must', 'vital', 'crucial'
        ]
        
        found_words = []
        text_lower = text.lower()
        
        for pattern in emphasis_patterns:
            if pattern in text_lower:
                # Find the actual word in original case
                matches = re.finditer(r'\b' + pattern + r'\b', text, re.IGNORECASE)
                for match in matches:
                    found_words.append(match.group())
        
        return list(set(found_words))
    
    def _determine_emotion(self, slide: Dict[str, Any]) -> str:
        """Determine appropriate emotion for slide content"""
        content = slide.get('speaker_notes', '').lower()
        
        if any(word in content for word in ['exciting', 'amazing', 'breakthrough', 'innovative']):
            return 'excited'
        elif any(word in content for word in ['think', 'consider', 'reflect', 'analyze']):
            return 'thoughtful'
        elif any(word in content for word in ['you can', 'you will', 'achieve', 'succeed']):
            return 'encouraging'
        else:
            return 'serious'
    
    def _determine_pace(self, slide: Dict[str, Any]) -> str:
        """Determine appropriate pace for slide content"""
        bullet_points = slide.get('bullet_points', [])
        
        if len(bullet_points) > 4:
            return 'fast'  # More content to cover
        elif any('think' in bp.lower() or 'consider' in bp.lower() for bp in bullet_points):
            return 'slow'  # Give time to reflect
        else:
            return 'normal'
    
    def _select_natural_opener(self) -> str:
        """Select a natural conversation opener"""
        import random
        return random.choice(self.filler_phrases)
    
    def _add_personal_touches(self, text: str, name: str) -> str:
        """Add personal touches to make it more conversational"""
        personal_phrases = [
            f", {name},",
            f" - and {name}, this is important - ",
            f". {name}, think about",
            f", and here's what I want you to remember, {name}:"
        ]
        
        # Add occasional personal touches (not too many)
        sentences = text.split('.')
        if len(sentences) > 3:
            # Add personal touch to middle sentence
            mid_point = len(sentences) // 2
            if sentences[mid_point]:
                sentences[mid_point] = sentences[mid_point] + personal_phrases[0]
        
        return '.'.join(sentences)
    
    def _select_transitions(self, num_segments: int) -> List[str]:
        """Select appropriate transitions between segments"""
        transitions = []
        
        # Introduction transition
        transitions.append(self.transitions['introduction'][0])
        
        # Between segments
        for i in range(num_segments - 1):
            transition_options = self.transitions['between_points']
            transitions.append(transition_options[i % len(transition_options)])
        
        return transitions
    
    def _create_inspiring_conclusion(self, module_name: str, employee_context: Dict[str, Any]) -> str:
        """Create an inspiring conclusion"""
        name = employee_context.get('name', 'there')
        
        conclusion = f"{name}, <break time='500ms'/> we've covered incredible ground today. "
        conclusion += f"<break time='400ms'/> You now have the tools to excel at {module_name}. "
        conclusion += f"<break time='600ms'/> But remember, <emphasis level='strong'>knowledge</emphasis> "
        conclusion += f"becomes <emphasis level='strong'>power</emphasis> only when you apply it. "
        conclusion += f"<break time='500ms'/> I believe in you. <break time='400ms'/> "
        conclusion += f"Now go out there and show the world what you can do!"
        
        return self._add_ssml_markup(conclusion, 'encouraging')
    
    def _calculate_natural_duration(self, *segments) -> float:
        """Calculate duration accounting for pauses and pacing"""
        total_words = 0
        total_pauses = 0
        
        for segment in segments:
            if isinstance(segment, str):
                # Count words
                words = len(segment.split())
                total_words += words
                
                # Count pause durations
                pause_matches = re.findall(r'<break time="(\d+)ms"/>', segment)
                for pause in pause_matches:
                    total_pauses += int(pause) / 1000.0
            elif isinstance(segment, list):
                for item in segment:
                    if isinstance(item, NarrationSegment):
                        words = len(item.text.split())
                        total_words += words
                        
                        # Account for pace
                        if item.pace == 'slow':
                            total_words *= 1.2
                        elif item.pace == 'fast':
                            total_words *= 0.9
        
        # Calculate duration (150 words per minute baseline)
        speaking_duration = (total_words / 150) * 60
        
        return speaking_duration + total_pauses
    
    def _extract_pause_positions(self, text: str) -> List[Tuple[int, float]]:
        """Extract pause positions from text"""
        pauses = []
        
        # Find all break tags
        for match in re.finditer(r'<break time="(\d+)ms"/>', text):
            position = match.start()
            duration = int(match.group(1)) / 1000.0
            pauses.append((position, duration))
        
        return pauses