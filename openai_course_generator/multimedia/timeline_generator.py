#!/usr/bin/env python3
"""
Timeline Generator
Handles audio generation via OpenAI TTS and creates synchronized timelines for video assembly
"""

import os
import json
import logging
import asyncio
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime
import openai
from openai import OpenAI
import numpy as np
import wave
import struct
import re
import string

logger = logging.getLogger(__name__)

@dataclass
class AudioSegment:
    """Represents an audio segment with timing"""
    segment_id: str
    text: str
    start_time: float
    end_time: float
    audio_file: Optional[str] = None
    voice: str = "alloy"
    speed: float = 1.0

@dataclass
class SlideTransition:
    """Represents a slide transition point"""
    slide_id: str
    slide_number: int
    timestamp: float
    transition_type: str = "fade"
    duration: float = 0.5

@dataclass
class VideoTimeline:
    """Complete timeline for video assembly"""
    timeline_id: str
    total_duration: float
    audio_segments: List[AudioSegment]
    slide_transitions: List[SlideTransition]
    narration_file: str
    metadata: Dict[str, Any] = field(default_factory=dict)

class TimelineGenerator:
    """Generates audio narration and synchronized timeline for educational videos"""
    
    def __init__(self, openai_api_key: Optional[str] = None):
        """Initialize the timeline generator"""
        self.openai_api_key = openai_api_key or os.getenv('OPENAI_API_KEY')
        if not self.openai_api_key:
            raise ValueError("OpenAI API key is required for audio generation")
        
        # Initialize OpenAI client
        self.client = OpenAI(api_key=self.openai_api_key)
        
        # Audio settings
        self.sample_rate = 24000  # OpenAI TTS sample rate
        
        # Enhanced voice mappings for different content types
        self.voice_profiles = {
            'introduction': {'voice': 'nova', 'speed': 0.95, 'description': 'warm and welcoming'},
            'core_content': {'voice': 'alloy', 'speed': 0.9, 'description': 'clear and measured'},
            'practical': {'voice': 'echo', 'speed': 1.0, 'description': 'confident and engaging'},
            'case_study': {'voice': 'fable', 'speed': 0.95, 'description': 'storytelling tone'},
            'assessment': {'voice': 'nova', 'speed': 0.9, 'description': 'supportive and clear'},
            'summary': {'voice': 'shimmer', 'speed': 0.95, 'description': 'reflective and calm'},
            'default': {'voice': 'nova', 'speed': 1.0, 'description': 'balanced and friendly'}
        }
        
        self.voices = {
            'alloy': 'neutral and fast',
            'echo': 'smooth and confident', 
            'fable': 'expressive and dramatic',
            'onyx': 'deep and authoritative',
            'nova': 'warm and friendly',
            'shimmer': 'soft and pleasant'
        }
        self.default_voice = 'nova'  # Best for educational content
        self.default_speed = 1.0
        
        # Timing settings
        self.words_per_minute = 150
        self.pause_between_slides = 0.5  # seconds
        
        # Content complexity metrics
        self.complexity_factors = {
            'technical_terms': ['algorithm', 'framework', 'architecture', 'implementation', 'infrastructure'],
            'concept_indicators': ['understand', 'analyze', 'evaluate', 'synthesize', 'integrate'],
            'pause_triggers': ['however', 'therefore', 'importantly', 'remember', 'note that']
        }
        
    def analyze_content_complexity(self, text: str) -> Dict[str, Any]:
        """
        Analyze content complexity to adjust speech rate and timing
        
        Returns:
            Dictionary with complexity metrics
        """
        words = text.split()
        sentences = re.split(r'[.!?]+', text)
        
        # Calculate basic metrics
        word_count = len(words)
        sentence_count = len([s for s in sentences if s.strip()])
        avg_sentence_length = word_count / max(sentence_count, 1)
        
        # Count syllables (approximation)
        syllable_count = sum(self._count_syllables(word) for word in words)
        avg_syllables_per_word = syllable_count / max(word_count, 1)
        
        # Count technical terms
        technical_count = sum(1 for word in words 
                            if word.lower() in self.complexity_factors['technical_terms'])
        
        # Count concept indicators
        concept_count = sum(1 for word in words 
                          if word.lower() in self.complexity_factors['concept_indicators'])
        
        # Calculate complexity score (0-1)
        complexity_score = min(1.0, (
            (avg_sentence_length / 20) * 0.3 +  # Sentence length factor
            (avg_syllables_per_word / 3) * 0.3 +  # Word complexity factor
            (technical_count / word_count) * 0.2 +  # Technical density
            (concept_count / word_count) * 0.2  # Conceptual density
        ))
        
        # Recommended adjustments
        recommended_speed = 1.0 - (complexity_score * 0.3)  # Slower for complex content
        recommended_wpm = self.words_per_minute * (1 - complexity_score * 0.2)
        
        # Calculate pause points
        pause_points = self._identify_pause_points(text)
        
        return {
            'word_count': word_count,
            'sentence_count': sentence_count,
            'avg_sentence_length': avg_sentence_length,
            'avg_syllables_per_word': avg_syllables_per_word,
            'technical_density': technical_count / max(word_count, 1),
            'concept_density': concept_count / max(word_count, 1),
            'complexity_score': complexity_score,
            'recommended_speed': recommended_speed,
            'recommended_wpm': recommended_wpm,
            'pause_points': pause_points,
            'estimated_duration': (word_count / recommended_wpm) * 60 * 1.2  # Add 20% for pauses
        }
    
    def _count_syllables(self, word: str) -> int:
        """Estimate syllable count for a word"""
        word = word.lower().strip(string.punctuation)
        
        # Simple syllable counting heuristic
        count = 0
        vowels = 'aeiouy'
        previous_was_vowel = False
        
        for char in word:
            is_vowel = char in vowels
            if is_vowel and not previous_was_vowel:
                count += 1
            previous_was_vowel = is_vowel
        
        # Adjust for silent e
        if word.endswith('e') and count > 1:
            count -= 1
        
        # Ensure at least one syllable
        return max(1, count)
    
    def _identify_pause_points(self, text: str) -> List[Dict[str, Any]]:
        """Identify natural pause points in text"""
        pause_points = []
        
        # Find punctuation-based pauses
        for match in re.finditer(r'[.,;:!?]', text):
            pause_type = 'short' if match.group() in ',' else 'long'
            pause_duration = 0.3 if pause_type == 'short' else 0.6
            pause_points.append({
                'position': match.start(),
                'type': pause_type,
                'duration': pause_duration
            })
        
        # Find trigger word pauses
        for trigger in self.complexity_factors['pause_triggers']:
            pattern = rf'\b{trigger}\b'
            for match in re.finditer(pattern, text, re.IGNORECASE):
                pause_points.append({
                    'position': match.start(),
                    'type': 'emphasis',
                    'duration': 0.4
                })
        
        # Sort by position
        pause_points.sort(key=lambda x: x['position'])
        
        return pause_points
    
    def select_voice_for_content(self, section_type: str, content: str) -> Tuple[str, float]:
        """
        Select appropriate voice and speed based on content type and analysis
        
        Returns:
            Tuple of (voice_name, speed)
        """
        # Get base profile for section type
        profile = self.voice_profiles.get(section_type, self.voice_profiles['default'])
        
        # Analyze content complexity
        complexity = self.analyze_content_complexity(content)
        
        # Adjust speed based on complexity
        adjusted_speed = profile['speed'] * complexity['recommended_speed']
        
        # Ensure speed is within OpenAI's limits (0.25 to 4.0)
        adjusted_speed = max(0.25, min(4.0, adjusted_speed))
        
        logger.info(f"Selected voice '{profile['voice']}' with speed {adjusted_speed:.2f} for {section_type} content")
        
        return profile['voice'], adjusted_speed
    
    async def generate_educational_timeline(
        self,
        script: Any,  # EducationalScript from script generator
        extracted_content: Any,  # ExtractedSlideContent from content extractor
        output_dir: str,
        voice: Optional[str] = None,
        speed: Optional[float] = None
    ) -> VideoTimeline:
        """
        Generate complete timeline with audio and slide transitions
        
        Args:
            script: Educational script with narration
            extracted_content: Extracted slide content with timing
            output_dir: Directory to save audio files
            voice: OpenAI TTS voice to use
            speed: Speech speed (0.25 to 4.0)
            
        Returns:
            VideoTimeline with all synchronization data
        """
        logger.info(f"Generating educational timeline for {script.module_name}")
        
        # Create output directory
        output_path = Path(output_dir)
        audio_dir = output_path / 'audio'
        audio_dir.mkdir(parents=True, exist_ok=True)
        
        # Set voice and speed
        voice = voice or self.default_voice
        speed = speed or self.default_speed
        
        # Check if we have a complete narration for continuous flow
        if hasattr(script, 'full_narration') and script.full_narration and len(script.full_narration.strip()) > 100:
            logger.info("🎙️ Using continuous narration mode for natural flow")
            return await self._generate_continuous_timeline(
                script, extracted_content, output_path, audio_dir, voice, speed
            )
        
        # Fallback to individual slide segments (legacy mode)
        logger.info("📑 Using individual slide segments (legacy mode)")
        # Generate audio segments for each slide
        audio_segments = []
        current_time = 0.0
        
        for i, slide in enumerate(script.slides):
            logger.info(f"Processing slide {i+1}/{len(script.slides)}")
            
            # Determine section type from slide context
            section_type = self._determine_section_type(slide, i, len(script.slides))
            
            # Select voice and speed based on content analysis
            selected_voice, selected_speed = self.select_voice_for_content(
                section_type, 
                slide.speaker_notes
            )
            
            # Override with user preference if specified
            if voice and voice != 'auto':
                selected_voice = voice
            if speed and speed != 'auto':
                selected_speed = speed
            
            # Create audio segment with enhanced processing
            segment = await self._generate_audio_segment(
                slide_id=f"slide_{slide.slide_number}",
                text=slide.speaker_notes,
                voice=selected_voice,
                speed=selected_speed,
                audio_dir=audio_dir,
                segment_number=i+1,
                section_type=section_type
            )
            
            # Calculate timing based on actual audio duration if available
            if segment.audio_file:
                actual_duration = self.calculate_audio_duration(segment.audio_file)
                if actual_duration > 0:
                    segment.start_time = current_time
                    segment.end_time = current_time + actual_duration
                    current_time = segment.end_time + self.pause_between_slides
                else:
                    # Fallback to estimate
                    segment.start_time = current_time
                    segment.end_time = current_time + slide.duration_estimate
                    current_time = segment.end_time + self.pause_between_slides
            else:
                # Use estimate if no audio file
                segment.start_time = current_time
                segment.end_time = current_time + slide.duration_estimate
                current_time = segment.end_time + self.pause_between_slides
            
            audio_segments.append(segment)
        
        # Merge audio segments into single narration file
        narration_file = await self._merge_audio_segments(
            audio_segments,
            audio_dir / f"{script.module_name.lower().replace(' ', '_')}_narration.mp3"
        )
        
        # Create slide transitions based on audio timing
        slide_transitions = self._create_slide_transitions(
            script.slides,
            audio_segments,
            extracted_content.timing_map
        )
        
        # Calculate total duration
        total_duration = audio_segments[-1].end_time if audio_segments else 0
        
        # Create timeline
        timeline = VideoTimeline(
            timeline_id=f"timeline_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            total_duration=total_duration,
            audio_segments=audio_segments,
            slide_transitions=slide_transitions,
            narration_file=str(narration_file),
            metadata={
                'module_name': script.module_name,
                'voice_used': voice,
                'speed_used': speed,
                'slide_count': len(script.slides),
                'generation_timestamp': datetime.now().isoformat()
            }
        )
        
        # Export timeline to JSON
        self._export_timeline(timeline, output_path / 'timeline.json')
        
        logger.info(f"Timeline generation complete: {total_duration:.2f} seconds")
        return timeline
    
    async def _generate_continuous_timeline(
        self,
        script: Any,
        extracted_content: Any,
        output_path: Path,
        audio_dir: Path,
        voice: str,
        speed: float
    ) -> "VideoTimeline":
        """
        Generate timeline with continuous narration for natural flow
        
        This creates one seamless audio track and calculates slide transition
        points within that continuous narration for a natural learning experience.
        """
        logger.info(f"Generating continuous narration: {len(script.full_narration)} characters")
        
        # Generate single continuous audio file
        narration_file = audio_dir / f"{script.module_name.lower().replace(' ', '_')}_continuous_narration.mp3"
        
        # Select optimal voice and speed for the content
        selected_voice, selected_speed = self.select_voice_for_content(
            'introduction', script.full_narration
        )
        
        # Override with user preferences if specified
        if voice and voice != 'auto':
            selected_voice = voice
        if speed and speed != 'auto':
            selected_speed = speed
            
        logger.info(f"Generating continuous audio with voice '{selected_voice}' at {selected_speed:.2f}x speed")
        
        # Generate the complete audio file
        try:
            client = OpenAI()
            response = client.audio.speech.create(
                model="tts-1",
                voice=selected_voice,
                input=script.full_narration,
                speed=selected_speed
            )
            
            # Save the audio file
            with open(narration_file, "wb") as f:
                f.write(response.content)
                
            logger.info(f"Continuous narration saved: {narration_file}")
            
        except Exception as e:
            logger.error(f"Failed to generate continuous audio: {e}")
            raise
        
        # Calculate actual audio duration
        total_duration = self.calculate_audio_duration(str(narration_file))
        logger.info(f"Continuous audio duration: {total_duration:.2f} seconds")
        
        # Calculate slide transition timing based on content distribution
        slide_transitions = self._calculate_slide_transitions_from_content(
            script.slides,
            script.full_narration,
            total_duration
        )
        
        # Create unified audio segments for compatibility
        audio_segments = self._create_unified_audio_segments(
            script.slides,
            slide_transitions,
            str(narration_file)
        )
        
        # Create timeline with continuous narration
        timeline = VideoTimeline(
            timeline_id=f"continuous_timeline_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            total_duration=total_duration,
            audio_segments=audio_segments,
            slide_transitions=slide_transitions,
            narration_file=str(narration_file),
            metadata={
                'module_name': script.module_name,
                'voice_used': selected_voice,
                'speed_used': selected_speed,
                'slide_count': len(script.slides),
                'narration_mode': 'continuous',
                'generation_timestamp': datetime.now().isoformat(),
                'full_narration_length': len(script.full_narration)
            }
        )
        
        # Export timeline to JSON
        self._export_timeline(timeline, output_path / 'timeline.json')
        
        logger.info(f"Continuous timeline generated: {total_duration:.2f} seconds with natural flow")
        return timeline
    
    def _determine_section_type(self, slide: Any, index: int, total_slides: int) -> str:
        """Determine the section type based on slide position and content"""
        if index == 0:
            return 'introduction'
        elif index == total_slides - 1:
            return 'summary'
        elif 'case' in slide.title.lower() or 'example' in slide.title.lower():
            return 'case_study'
        elif 'practice' in slide.title.lower() or 'apply' in slide.title.lower():
            return 'practical'
        elif 'assess' in slide.title.lower() or 'test' in slide.title.lower():
            return 'assessment'
        else:
            return 'core_content'
    
    def _calculate_slide_transitions_from_content(
        self,
        slides: List[Any],
        full_narration: str,
        total_duration: float
    ) -> List[Any]:
        """
        Calculate when to transition slides based on content analysis
        
        This analyzes the full narration to determine natural transition points
        that align with slide content for smooth visual progression.
        """
        if not slides:
            return []
        
        transitions = []
        
        # Calculate timing based on content distribution
        # Each slide gets proportional time based on its content complexity
        slide_weights = []
        
        for slide in slides:
            # Calculate content weight based on bullet points and speaker notes
            weight = 1.0  # Base weight
            
            if hasattr(slide, 'bullet_points') and slide.bullet_points:
                weight += len(slide.bullet_points) * 0.3
            
            if hasattr(slide, 'speaker_notes') and slide.speaker_notes:
                # More complex slides need more time
                words = len(slide.speaker_notes.split())
                weight += words / 100  # Roughly 100 words = +1 weight
            
            slide_weights.append(weight)
        
        # Normalize weights to total duration
        total_weight = sum(slide_weights)
        cumulative_time = 0.0
        
        for i, (slide, weight) in enumerate(zip(slides, slide_weights)):
            # Calculate start time for this slide
            start_time = cumulative_time
            
            # Calculate duration for this slide
            slide_duration = (weight / total_weight) * total_duration
            end_time = start_time + slide_duration
            
            # Ensure minimum slide duration
            min_duration = 8.0  # Minimum 8 seconds per slide
            if slide_duration < min_duration and len(slides) > 1:
                slide_duration = min_duration
                end_time = start_time + slide_duration
            
            transition = SlideTransition(
                slide_id=getattr(slide, 'slide_id', f'slide_{i+1}'),
                slide_number=getattr(slide, 'slide_number', i+1),
                timestamp=start_time,
                transition_type='natural_flow',
                duration=slide_duration
            )
            # Add custom attributes for our enhanced functionality
            transition.start_time = start_time
            transition.end_time = end_time
            transition.slide_title = getattr(slide, 'title', f'Slide {i+1}')
            transition.content_weight = weight
            
            transitions.append(transition)
            cumulative_time = end_time
            
            logger.info(f"Slide {i+1} '{transition.slide_title}': {start_time:.1f}s - {end_time:.1f}s (weight: {weight:.2f})")
        
        # Adjust final slide to match total duration
        if transitions:
            transitions[-1].end_time = total_duration
        
        return transitions
    
    def _create_unified_audio_segments(
        self,
        slides: List[Any],
        slide_transitions: List[Any],
        narration_file_path: str
    ) -> List[Any]:
        """
        Create audio segments that reference the continuous audio file
        
        This maintains compatibility with the existing video assembly system
        while using the continuous narration approach.
        """
        segments = []
        
        for i, (slide, transition) in enumerate(zip(slides, slide_transitions)):
            segment = AudioSegment(
                segment_id=f"continuous_segment_{i+1}",
                text=getattr(slide, 'speaker_notes', ''),
                start_time=getattr(transition, 'start_time', transition.timestamp),
                end_time=getattr(transition, 'end_time', transition.timestamp + transition.duration),
                audio_file=narration_file_path,  # All segments use the same continuous file
                voice='continuous',
                speed=1.0
            )
            # Add metadata as custom attributes
            segment.slide_id = transition.slide_id
            segment.metadata = {
                'segment_type': 'continuous_narration',
                'slide_number': transition.slide_number,
                'slide_title': getattr(transition, 'slide_title', f'Slide {i+1}'),
                'natural_flow': True,
                'audio_start_offset': getattr(transition, 'start_time', transition.timestamp),
                'audio_end_offset': getattr(transition, 'end_time', transition.timestamp + transition.duration)
            }
            segments.append(segment)
        
        logger.info(f"Created {len(segments)} unified audio segments for continuous narration")
        return segments
    
    async def _generate_audio_segment(
        self,
        slide_id: str,
        text: str,
        voice: str,
        speed: float,
        audio_dir: Path,
        segment_number: int,
        section_type: str = 'default'
    ) -> AudioSegment:
        """Generate audio for a single segment using OpenAI TTS"""
        
        try:
            logger.info(f"Generating audio for slide {slide_id}")
            
            # Clean and enhance text for TTS
            cleaned_text = self._clean_text_for_tts(text)
            enhanced_text = self._enhance_text_with_ssml_markers(cleaned_text, section_type)
            
            # Analyze complexity for final adjustments
            complexity = self.analyze_content_complexity(cleaned_text)
            
            # Fine-tune speed based on complexity
            final_speed = speed * complexity['recommended_speed']
            final_speed = max(0.25, min(4.0, final_speed))  # Keep within OpenAI limits
            
            logger.info(f"Generating audio for {section_type} section with complexity score: {complexity['complexity_score']:.2f}")
            
            # Use more expressive voice options for human-like speech
            voice_mapping = {
                'nova': 'nova',      # Original clear voice
                'alloy': 'alloy',    # Neutral and balanced (default)
                'echo': 'echo',      # Warm and engaging
                'fable': 'fable',    # Expressive British accent
                'onyx': 'onyx',      # Deep and authoritative
                'shimmer': 'shimmer' # Soft and gentle
            }
            
            # Select appropriate voice
            selected_voice = voice_mapping.get(voice, 'alloy')
            
            # Generate audio using OpenAI TTS with HD quality
            response = self.client.audio.speech.create(
                model="tts-1-hd",  # High quality model for better expression
                voice=selected_voice,
                input=enhanced_text,
                speed=final_speed
            )
            
            # Save audio file
            audio_filename = f"segment_{segment_number:03d}_{slide_id}.mp3"
            audio_path = audio_dir / audio_filename
            
            # Write the response content to file
            response.write_to_file(str(audio_path))
            
            logger.info(f"Audio segment saved: {audio_path}")
            
            # Calculate actual duration if possible
            actual_duration = self.calculate_audio_duration(str(audio_path))
            if actual_duration <= 0:
                # Fallback to enhanced estimation based on complexity
                actual_duration = complexity['estimated_duration']
            
            return AudioSegment(
                segment_id=slide_id,
                text=cleaned_text,
                start_time=0,  # Will be set later
                end_time=actual_duration,  # Will be adjusted
                audio_file=str(audio_path),
                voice=voice,
                speed=final_speed
            )
            
        except Exception as e:
            logger.error(f"Failed to generate audio segment: {e}")
            # Return segment without audio file
            return AudioSegment(
                segment_id=slide_id,
                text=text,
                start_time=0,
                end_time=10,  # Default duration
                audio_file=None,
                voice=voice,
                speed=speed
            )
    
    def _clean_text_for_tts(self, text: str) -> str:
        """Clean and prepare text for TTS"""
        # Remove markdown formatting
        text = text.replace('**', '').replace('*', '')
        text = text.replace('##', '').replace('#', '')
        
        # Replace bullet points with pauses
        text = text.replace('•', ',').replace('-', ',')
        
        # Ensure proper punctuation for pauses
        text = text.replace('\n\n', '. ').replace('\n', '. ')
        
        # Remove excessive spaces
        text = ' '.join(text.split())
        
        # Add pauses for emphasis (using SSML-like markers)
        text = text.replace('Pay special attention', 'Pay... special attention')
        text = text.replace('Remember,', 'Remember...')
        
        return text.strip()
    
    def _enhance_text_with_ssml_markers(self, text: str, section_type: str) -> str:
        """
        Enhance text with SSML-like markers for better expression
        Note: OpenAI doesn't support SSML, but we can use punctuation for similar effects
        """
        enhanced_text = text
        
        # Add emphasis pauses for key phrases
        emphasis_phrases = [
            ('important to note', 'important... to note'),
            ('key point', 'key point...'),
            ('pay attention', 'pay attention...'),
            ('remember that', 'remember... that'),
            ('for example', 'for example...'),
            ('in other words', 'in other words...'),
            ('however', 'however...'),
            ('therefore', 'therefore...'),
            ('furthermore', 'furthermore...'),
            ('in conclusion', 'in conclusion...')
        ]
        
        for original, replacement in emphasis_phrases:
            enhanced_text = enhanced_text.replace(original, replacement)
        
        # Add section-specific enhancements
        if section_type == 'introduction':
            # Add welcoming pauses
            enhanced_text = enhanced_text.replace('Welcome', 'Welcome...')
            enhanced_text = enhanced_text.replace('Let\'s begin', 'Let\'s... begin')
        
        elif section_type == 'core_content':
            # Add pauses for complex concepts
            enhanced_text = re.sub(r'(\b(?:concept|principle|theory|method)\b)', r'\1...', enhanced_text)
        
        elif section_type == 'practical':
            # Add pauses for steps
            enhanced_text = re.sub(r'(First,|Second,|Third,|Next,|Finally,)', r'\1...', enhanced_text)
        
        elif section_type == 'summary':
            # Add reflective pauses
            enhanced_text = enhanced_text.replace('learned', 'learned...')
            enhanced_text = enhanced_text.replace('covered', 'covered...')
        
        # Add natural breathing pauses at long sentences
        sentences = enhanced_text.split('. ')
        processed_sentences = []
        
        for sentence in sentences:
            words = sentence.split()
            if len(words) > 15:  # Long sentence
                # Find a good breaking point around the middle
                middle = len(words) // 2
                for i in range(middle - 2, middle + 3):
                    if i < len(words) and words[i].lower() in ['and', 'but', 'which', 'that', 'when', 'where', 'while']:
                        words[i] = words[i] + '...'
                        break
            processed_sentences.append(' '.join(words))
        
        enhanced_text = '. '.join(processed_sentences)
        
        # Ensure we don't have multiple consecutive pauses
        enhanced_text = re.sub(r'\.{3,}', '...', enhanced_text)
        
        return enhanced_text
    
    async def _merge_audio_segments(
        self,
        segments: List[AudioSegment],
        output_path: Path
    ) -> Path:
        """Merge audio segments into a single narration file"""
        
        logger.info(f"Merging {len(segments)} audio segments")
        
        # For now, we'll use ffmpeg via subprocess
        # In production, you might want to use pydub or similar
        
        try:
            # Create a list file for ffmpeg
            list_file = output_path.parent / 'segments.txt'
            with open(list_file, 'w') as f:
                for segment in segments:
                    if segment.audio_file and Path(segment.audio_file).exists():
                        f.write(f"file '{segment.audio_file}'\n")
                        # Add silence between segments
                        silence_file = await self._generate_silence(
                            self.pause_between_slides,
                            output_path.parent / 'silence.mp3'
                        )
                        f.write(f"file '{silence_file}'\n")
            
            # Use ffmpeg to concatenate
            import subprocess
            cmd = [
                'ffmpeg', '-y',
                '-f', 'concat',
                '-safe', '0',
                '-i', str(list_file),
                '-c', 'copy',
                str(output_path)
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                logger.error(f"ffmpeg error: {result.stderr}")
                # Fallback: just use the first segment
                if segments and segments[0].audio_file:
                    import shutil
                    shutil.copy(segments[0].audio_file, output_path)
            
            # Clean up list file
            list_file.unlink()
            
            logger.info(f"Narration file created: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Failed to merge audio segments: {e}")
            # Return first segment as fallback
            if segments and segments[0].audio_file:
                return Path(segments[0].audio_file)
            raise
    
    async def _generate_silence(self, duration: float, output_path: Path) -> Path:
        """Generate silence audio file"""
        
        # Check if silence file already exists
        if output_path.exists():
            return output_path
        
        try:
            # Generate silence using OpenAI TTS with empty text
            # Alternative: use ffmpeg or generate programmatically
            import subprocess
            cmd = [
                'ffmpeg', '-y',
                '-f', 'lavfi',
                '-i', f'anullsrc=r={self.sample_rate}:cl=mono',
                '-t', str(duration),
                '-b:a', '128k',
                str(output_path)
            ]
            
            subprocess.run(cmd, capture_output=True, check=True)
            return output_path
            
        except:
            # Fallback: create very quiet audio
            response = self.client.audio.speech.create(
                model="tts-1",
                voice=self.default_voice,
                input=".",  # Single period for minimal audio
                speed=0.25  # Slowest speed
            )
            response.write_to_file(str(output_path))
            return output_path
    
    def _create_slide_transitions(
        self,
        slides: List[Any],
        audio_segments: List[AudioSegment],
        timing_map: Dict[str, float]
    ) -> List[SlideTransition]:
        """Create slide transition points based on audio timing"""
        
        transitions = []
        
        for i, (slide, segment) in enumerate(zip(slides, audio_segments)):
            # Create transition at the start of each audio segment
            transition = SlideTransition(
                slide_id=f"slide_{slide.slide_number}",
                slide_number=slide.slide_number,
                timestamp=segment.start_time,
                transition_type='fade',  # Default fade transition
                duration=0.5
            )
            transitions.append(transition)
            
            # Add intermediate transitions for emphasis points
            if hasattr(slide, 'timing_cues'):
                for cue in slide.timing_cues:
                    if 'Display point' in cue.get('text', ''):
                        # Add micro-transition for bullet point appearance
                        emphasis_time = segment.start_time + cue['start']
                        if emphasis_time < segment.end_time:
                            transitions.append(SlideTransition(
                                slide_id=f"slide_{slide.slide_number}_point",
                                slide_number=slide.slide_number,
                                timestamp=emphasis_time,
                                transition_type='highlight',
                                duration=0.2
                            ))
        
        # Sort transitions by timestamp
        transitions.sort(key=lambda x: x.timestamp)
        
        return transitions
    
    def _export_timeline(self, timeline: VideoTimeline, output_path: Path) -> None:
        """Export timeline to JSON format"""
        
        timeline_data = {
            'timeline_id': timeline.timeline_id,
            'total_duration': timeline.total_duration,
            'total_duration_formatted': f"{int(timeline.total_duration // 60)}:{int(timeline.total_duration % 60):02d}",
            'narration_file': timeline.narration_file,
            'metadata': timeline.metadata,
            'audio_segments': [
                {
                    'segment_id': seg.segment_id,
                    'text': seg.text[:100] + '...' if len(seg.text) > 100 else seg.text,
                    'start_time': seg.start_time,
                    'end_time': seg.end_time,
                    'duration': seg.end_time - seg.start_time,
                    'audio_file': seg.audio_file,
                    'voice': seg.voice,
                    'speed': seg.speed
                }
                for seg in timeline.audio_segments
            ],
            'slide_transitions': [
                {
                    'slide_id': trans.slide_id,
                    'slide_number': trans.slide_number,
                    'timestamp': trans.timestamp,
                    'transition_type': trans.transition_type,
                    'duration': trans.duration
                }
                for trans in timeline.slide_transitions
            ]
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(timeline_data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Timeline exported to: {output_path}")
    
    def calculate_audio_duration(self, audio_file: str) -> float:
        """Calculate actual duration of an audio file"""
        try:
            # Try using wave for WAV files
            if audio_file.endswith('.wav'):
                with wave.open(audio_file, 'rb') as wav_file:
                    frames = wav_file.getnframes()
                    rate = wav_file.getframerate()
                    return frames / float(rate)
            
            # For MP3, use ffprobe
            import subprocess
            cmd = [
                'ffprobe', '-v', 'error',
                '-show_entries', 'format=duration',
                '-of', 'default=noprint_wrappers=1:nokey=1',
                audio_file
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode == 0:
                return float(result.stdout.strip())
            
        except Exception as e:
            logger.warning(f"Could not determine audio duration: {e}")
        
        # Fallback to estimate
        return 10.0  # Default 10 seconds
    
    def optimize_timing_for_engagement(
        self,
        timeline: VideoTimeline,
        target_duration: Optional[float] = None
    ) -> VideoTimeline:
        """Optimize timeline for better engagement"""
        
        # Adjust pacing based on content
        for i, segment in enumerate(timeline.audio_segments):
            # Speed up introduction slightly
            if i == 0:
                segment.speed = min(segment.speed * 1.1, 1.5)
            
            # Slow down key points
            if 'key' in segment.text.lower() or 'important' in segment.text.lower():
                segment.speed = max(segment.speed * 0.9, 0.8)
        
        # Ensure smooth transitions
        for i, transition in enumerate(timeline.slide_transitions[:-1]):
            next_transition = timeline.slide_transitions[i + 1]
            min_gap = 3.0  # Minimum 3 seconds between transitions
            
            if next_transition.timestamp - transition.timestamp < min_gap:
                next_transition.timestamp = transition.timestamp + min_gap
        
        return timeline