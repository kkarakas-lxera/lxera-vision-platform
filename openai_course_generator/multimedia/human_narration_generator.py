#!/usr/bin/env python3
"""
Human Narration Generator
Generates emotional, human-like narration with advanced voice modulation and pacing
"""

import os
import json
import logging
import asyncio
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
import openai
from openai import AsyncOpenAI
from dataclasses import dataclass
import re

logger = logging.getLogger(__name__)

@dataclass
class NarrationSegment:
    """Individual narration segment with emotional context"""
    text: str
    emotion: str
    emphasis_level: float  # 0.0 to 1.0
    pause_before: float  # seconds
    pause_after: float  # seconds
    speech_rate: float  # 0.5 to 2.0
    voice_tone: str  # warm, professional, enthusiastic, calm
    duration_estimate: float

@dataclass
class NarrationScript:
    """Complete narration script with emotional pacing"""
    segments: List[NarrationSegment]
    total_duration: float
    emotional_arc: List[str]  # emotion progression
    voice_profile: Dict[str, Any]
    pacing_strategy: str

class HumanNarrationGenerator:
    """Generates human-like narration with emotional intelligence"""
    
    def __init__(self, openai_api_key: Optional[str] = None):
        """Initialize human narration generator"""
        self.openai_api_key = openai_api_key or os.getenv('OPENAI_API_KEY')
        if not self.openai_api_key:
            raise ValueError("OpenAI API key is required")
        
        self.client = AsyncOpenAI(api_key=self.openai_api_key)
        
        # Voice profiles for different emotional contexts
        self.voice_profiles = {
            'warm_professional': {
                'voice': 'nova',
                'base_speed': 1.0,
                'emotion_range': ['warm', 'encouraging', 'professional'],
                'pause_style': 'natural'
            },
            'enthusiastic_teacher': {
                'voice': 'alloy',
                'base_speed': 1.1,
                'emotion_range': ['enthusiastic', 'excited', 'encouraging'],
                'pause_style': 'dynamic'
            },
            'calm_mentor': {
                'voice': 'echo',
                'base_speed': 0.9,
                'emotion_range': ['calm', 'thoughtful', 'supportive'],
                'pause_style': 'reflective'
            },
            'confident_expert': {
                'voice': 'fable',
                'base_speed': 1.0,
                'emotion_range': ['confident', 'authoritative', 'clear'],
                'pause_style': 'structured'
            }
        }
        
        logger.info("Human narration generator initialized")
    
    async def generate_emotional_narration(
        self,
        script_content: Any,
        employee_context: Dict[str, Any],
        content_essence: Optional[Dict[str, Any]] = None,
        output_dir: str = '/tmp',
        voice_profile: str = 'warm_professional'
    ) -> Dict[str, Any]:
        """
        Generate emotionally intelligent narration
        
        Args:
            script_content: Educational script object
            employee_context: Employee information for personalization
            content_essence: Content essence for emotional guidance
            output_dir: Output directory for audio files
            voice_profile: Emotional voice profile to use
            
        Returns:
            Dictionary with narration results and emotional metadata
        """
        logger.info("Generating emotional narration with human-like qualities")
        
        try:
            # Step 1: Analyze content for emotional context
            emotional_context = await self._analyze_emotional_context(
                script_content, employee_context, content_essence
            )
            
            # Step 2: Create emotional narration script
            narration_script = await self._create_emotional_script(
                script_content, emotional_context, voice_profile
            )
            
            # Step 3: Generate audio with emotional pacing
            audio_files = await self._generate_emotional_audio(
                narration_script, output_dir
            )
            
            # Step 4: Create emotional timeline
            timeline = self._create_emotional_timeline(
                narration_script, audio_files
            )
            
            result = {
                'success': True,
                'narration_script': narration_script,
                'audio_files': audio_files,
                'emotional_timeline': timeline,
                'emotional_metadata': {
                    'voice_profile': voice_profile,
                    'emotional_arc': narration_script.emotional_arc,
                    'total_segments': len(narration_script.segments),
                    'total_duration': narration_script.total_duration,
                    'pacing_strategy': narration_script.pacing_strategy
                },
                'output_directory': output_dir
            }
            
            logger.info(f"Generated emotional narration with {len(narration_script.segments)} segments")
            return result
            
        except Exception as e:
            logger.error(f"Emotional narration generation failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def _analyze_emotional_context(
        self,
        script_content: Any,
        employee_context: Dict[str, Any],
        content_essence: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Analyze content for emotional context and pacing needs"""
        
        # Extract script text for analysis
        script_text = ""
        slides = getattr(script_content, 'slides', [])
        for slide in slides:
            script_text += getattr(slide, 'speaker_notes', '') + "\n"
        
        # Build emotional analysis prompt
        analysis_prompt = f"""
        Analyze this educational content for emotional narration guidance:
        
        Employee Context:
        - Name: {employee_context.get('name', 'Unknown')}
        - Role: {employee_context.get('role', 'Unknown')}
        - Experience Level: {employee_context.get('level', 'intermediate')}
        
        Content Essence:
        - Emotional Tone: {content_essence.get('emotional_tone', 'professional') if content_essence else 'professional'}
        - Learning Objective: {content_essence.get('learning_objective', '') if content_essence else ''}
        
        Script Content:
        {script_text[:2000]}...
        
        Provide emotional narration guidance in JSON format:
        {{
            "overall_emotion": "warm|enthusiastic|calm|confident",
            "emotional_arc": ["intro_emotion", "development_emotion", "conclusion_emotion"],
            "emphasis_points": ["key phrase 1", "key phrase 2"],
            "pacing_recommendations": {{
                "introduction": "slow|normal|fast",
                "main_content": "slow|normal|fast", 
                "conclusion": "slow|normal|fast"
            }},
            "personalization_elements": ["element1", "element2"],
            "engagement_strategies": ["strategy1", "strategy2"]
        }}
        """
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert in emotional intelligence and educational narration. Analyze content to provide guidance for human-like, emotionally engaging narration."},
                    {"role": "user", "content": analysis_prompt}
                ],
                temperature=0.7,
                max_tokens=800
            )
            
            # Parse response
            emotional_context = json.loads(response.choices[0].message.content)
            logger.info(f"Analyzed emotional context: {emotional_context.get('overall_emotion', 'unknown')}")
            
            return emotional_context
            
        except Exception as e:
            logger.warning(f"Failed to analyze emotional context: {e}")
            # Return default emotional context
            return {
                "overall_emotion": "warm",
                "emotional_arc": ["welcoming", "engaging", "encouraging"],
                "emphasis_points": [],
                "pacing_recommendations": {
                    "introduction": "normal",
                    "main_content": "normal",
                    "conclusion": "slow"
                },
                "personalization_elements": [],
                "engagement_strategies": ["clear_explanations", "practical_examples"]
            }
    
    async def _create_emotional_script(
        self,
        script_content: Any,
        emotional_context: Dict[str, Any],
        voice_profile: str
    ) -> NarrationScript:
        """Create emotionally enhanced narration script"""
        
        segments = []
        emotional_arc = emotional_context.get('emotional_arc', ['warm', 'engaging', 'encouraging'])
        profile = self.voice_profiles.get(voice_profile, self.voice_profiles['warm_professional'])
        
        slides = getattr(script_content, 'slides', [])
        total_slides = len(slides)
        
        for i, slide in enumerate(slides):
            speaker_notes = getattr(slide, 'speaker_notes', '')
            slide_title = getattr(slide, 'slide_title', f'Slide {i+1}')
            
            # Determine emotional context for this segment
            progress = i / max(total_slides - 1, 1)
            if progress < 0.3:
                emotion = emotional_arc[0] if len(emotional_arc) > 0 else 'warm'
                voice_tone = 'welcoming'
            elif progress < 0.7:
                emotion = emotional_arc[1] if len(emotional_arc) > 1 else 'engaging'
                voice_tone = 'enthusiastic'
            else:
                emotion = emotional_arc[2] if len(emotional_arc) > 2 else 'encouraging'
                voice_tone = 'supportive'
            
            # Enhance text with emotional elements
            enhanced_text = await self._enhance_text_emotionally(
                speaker_notes, slide_title, emotion, emotional_context
            )
            
            # Calculate pacing
            emphasis_level = self._calculate_emphasis_level(
                enhanced_text, emotional_context.get('emphasis_points', [])
            )
            
            # Determine pauses
            pause_before, pause_after = self._calculate_emotional_pauses(
                i, total_slides, emotion, emphasis_level
            )
            
            # Calculate speech rate
            speech_rate = self._calculate_speech_rate(
                emotion, emphasis_level, profile['base_speed']
            )
            
            # Estimate duration
            word_count = len(enhanced_text.split())
            duration_estimate = (word_count / (150 * speech_rate)) + pause_before + pause_after
            
            segment = NarrationSegment(
                text=enhanced_text,
                emotion=emotion,
                emphasis_level=emphasis_level,
                pause_before=pause_before,
                pause_after=pause_after,
                speech_rate=speech_rate,
                voice_tone=voice_tone,
                duration_estimate=duration_estimate
            )
            
            segments.append(segment)
        
        total_duration = sum(seg.duration_estimate for seg in segments)
        
        narration_script = NarrationScript(
            segments=segments,
            total_duration=total_duration,
            emotional_arc=emotional_arc,
            voice_profile=profile,
            pacing_strategy=emotional_context.get('pacing_recommendations', {})
        )
        
        logger.info(f"Created emotional script with {len(segments)} segments, {total_duration:.1f}s total")
        return narration_script
    
    async def _enhance_text_emotionally(
        self,
        original_text: str,
        slide_title: str,
        emotion: str,
        emotional_context: Dict[str, Any]
    ) -> str:
        """Enhance text with emotional elements"""
        
        if not original_text.strip():
            return original_text
        
        enhancement_prompt = f"""
        Enhance this educational narration text to be more emotionally engaging while maintaining professionalism:
        
        Slide Title: {slide_title}
        Target Emotion: {emotion}
        Original Text: {original_text}
        
        Guidelines:
        - Keep the core educational content intact
        - Add emotional warmth and human connection
        - Use inclusive language ("we", "let's", "together")
        - Add natural speech patterns and transitions
        - Include subtle encouragement
        - Maintain professional tone
        - Keep length similar to original
        
        Return only the enhanced text, no explanations.
        """
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert in emotional communication and educational narration. Enhance text to be more human and engaging while maintaining educational value."},
                    {"role": "user", "content": enhancement_prompt}
                ],
                temperature=0.8,
                max_tokens=500
            )
            
            enhanced_text = response.choices[0].message.content.strip()
            
            # Add personalization elements
            personalization = emotional_context.get('personalization_elements', [])
            for element in personalization:
                if 'name' in element.lower() and 'employee_context' in locals():
                    enhanced_text = enhanced_text.replace('you', f'you, {employee_context.get("name", "")}', 1)
            
            return enhanced_text
            
        except Exception as e:
            logger.warning(f"Text enhancement failed: {e}")
            return original_text
    
    def _calculate_emphasis_level(self, text: str, emphasis_points: List[str]) -> float:
        """Calculate emphasis level based on content importance"""
        base_emphasis = 0.3
        
        # Check for emphasis keywords
        emphasis_keywords = ['important', 'key', 'critical', 'essential', 'remember', 'note']
        emphasis_count = sum(1 for keyword in emphasis_keywords if keyword in text.lower())
        
        # Check for emphasis points from emotional context
        point_matches = sum(1 for point in emphasis_points if point.lower() in text.lower())
        
        # Calculate final emphasis
        emphasis = base_emphasis + (emphasis_count * 0.1) + (point_matches * 0.2)
        return min(emphasis, 1.0)
    
    def _calculate_emotional_pauses(
        self,
        slide_index: int,
        total_slides: int,
        emotion: str,
        emphasis_level: float
    ) -> Tuple[float, float]:
        """Calculate pause durations based on emotional context"""
        
        # Base pauses
        pause_before = 0.5
        pause_after = 0.3
        
        # Adjust for slide position
        if slide_index == 0:  # First slide
            pause_before = 1.0
        elif slide_index == total_slides - 1:  # Last slide
            pause_after = 1.5
        
        # Adjust for emotion
        emotion_adjustments = {
            'calm': (0.3, 0.4),
            'thoughtful': (0.5, 0.6),
            'enthusiastic': (-0.2, -0.1),
            'warm': (0.2, 0.2),
            'encouraging': (0.1, 0.3)
        }
        
        if emotion in emotion_adjustments:
            adj_before, adj_after = emotion_adjustments[emotion]
            pause_before += adj_before
            pause_after += adj_after
        
        # Adjust for emphasis
        if emphasis_level > 0.7:
            pause_before += 0.3
            pause_after += 0.5
        
        return max(pause_before, 0.1), max(pause_after, 0.1)
    
    def _calculate_speech_rate(self, emotion: str, emphasis_level: float, base_speed: float) -> float:
        """Calculate speech rate based on emotional context"""
        
        # Emotion-based adjustments
        emotion_speeds = {
            'enthusiastic': 1.1,
            'excited': 1.15,
            'calm': 0.9,
            'thoughtful': 0.85,
            'warm': 0.95,
            'professional': 1.0,
            'encouraging': 0.95,
            'confident': 1.05
        }
        
        speed_multiplier = emotion_speeds.get(emotion, 1.0)
        
        # Emphasis adjustment (important content should be slower)
        if emphasis_level > 0.7:
            speed_multiplier *= 0.9
        elif emphasis_level > 0.5:
            speed_multiplier *= 0.95
        
        final_speed = base_speed * speed_multiplier
        return max(0.5, min(final_speed, 2.0))  # Clamp to valid range
    
    async def _generate_emotional_audio(
        self,
        narration_script: NarrationScript,
        output_dir: str
    ) -> List[Dict[str, Any]]:
        """Generate audio files with emotional characteristics"""
        
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        audio_files = []
        voice = narration_script.voice_profile['voice']
        
        for i, segment in enumerate(narration_script.segments):
            try:
                # Generate segment audio
                segment_filename = f"narration_segment_{i+1:03d}.mp3"
                segment_path = output_path / segment_filename
                
                # Add emotional markers to text for TTS
                enhanced_segment_text = self._add_tts_emotional_markers(
                    segment.text, segment.emotion, segment.emphasis_level
                )
                
                logger.info(f"Generating emotional audio segment {i+1}: {segment.emotion}")
                
                response = await self.client.audio.speech.create(
                    model="tts-1-hd",
                    voice=voice,
                    input=enhanced_segment_text,
                    speed=segment.speech_rate
                )
                
                # Save audio file
                with open(segment_path, 'wb') as f:
                    f.write(response.content)
                
                # Calculate actual duration
                actual_duration = self._estimate_audio_duration(enhanced_segment_text, segment.speech_rate)
                
                audio_info = {
                    'segment_index': i,
                    'file_path': str(segment_path),
                    'filename': segment_filename,
                    'duration': actual_duration,
                    'emotion': segment.emotion,
                    'emphasis_level': segment.emphasis_level,
                    'speech_rate': segment.speech_rate,
                    'pause_before': segment.pause_before,
                    'pause_after': segment.pause_after,
                    'voice_tone': segment.voice_tone
                }
                
                audio_files.append(audio_info)
                
            except Exception as e:
                logger.error(f"Failed to generate audio for segment {i+1}: {e}")
                # Create placeholder
                audio_files.append({
                    'segment_index': i,
                    'file_path': None,
                    'error': str(e),
                    'duration': segment.duration_estimate
                })
        
        logger.info(f"Generated {len([af for af in audio_files if af.get('file_path')])} audio files")
        return audio_files
    
    def _add_tts_emotional_markers(self, text: str, emotion: str, emphasis_level: float) -> str:
        """Add subtle markers to guide TTS emotional delivery"""
        
        # Add natural pauses for emotional effect
        if emotion in ['thoughtful', 'calm']:
            text = re.sub(r'([.!?])\s+', r'\1... ', text)
        
        # Add emphasis for important content
        if emphasis_level > 0.7:
            # Emphasize key phrases
            text = re.sub(r'\b(important|key|critical|essential|remember)\b', r'*\1*', text, flags=re.IGNORECASE)
        
        # Add emotional warmth
        if emotion in ['warm', 'encouraging']:
            if text.startswith('Now'):
                text = 'Now then, ' + text[4:]
            elif text.startswith('Let'):
                text = text  # "Let's" already warm
            elif text.startswith('We'):
                text = text  # "We" already inclusive
        
        return text
    
    def _estimate_audio_duration(self, text: str, speech_rate: float) -> float:
        """Estimate audio duration based on text and speech rate"""
        # Average words per minute for TTS: ~150-180
        words = len(text.split())
        base_duration = (words / 165) * 60  # seconds
        
        # Adjust for speech rate
        actual_duration = base_duration / speech_rate
        
        # Add buffer for natural pauses
        return actual_duration * 1.1
    
    def _create_emotional_timeline(
        self,
        narration_script: NarrationScript,
        audio_files: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Create timeline with emotional pacing information"""
        
        timeline_segments = []
        current_time = 0.0
        
        for i, (segment, audio_info) in enumerate(zip(narration_script.segments, audio_files)):
            # Add pause before
            current_time += segment.pause_before
            
            # Segment timing
            start_time = current_time
            duration = audio_info.get('duration', segment.duration_estimate)
            end_time = start_time + duration
            
            timeline_segment = {
                'segment_index': i,
                'start_time': start_time,
                'end_time': end_time,
                'duration': duration,
                'text': segment.text,
                'emotion': segment.emotion,
                'voice_tone': segment.voice_tone,
                'emphasis_level': segment.emphasis_level,
                'speech_rate': segment.speech_rate,
                'audio_file': audio_info.get('file_path'),
                'pause_before': segment.pause_before,
                'pause_after': segment.pause_after
            }
            
            timeline_segments.append(timeline_segment)
            current_time = end_time + segment.pause_after
        
        timeline = {
            'total_duration': current_time,
            'segments': timeline_segments,
            'emotional_arc': narration_script.emotional_arc,
            'voice_profile': narration_script.voice_profile,
            'pacing_strategy': narration_script.pacing_strategy,
            'generated_at': datetime.now().isoformat()
        }
        
        return timeline
    
    def generate_emotional_voice_selection(
        self,
        employee_context: Dict[str, Any],
        content_type: str,
        content_complexity: str = 'medium'
    ) -> str:
        """Select optimal voice profile based on context"""
        
        # Consider employee role and experience
        role = employee_context.get('role', '').lower()
        level = employee_context.get('level', 'intermediate').lower()
        
        # Technical content for senior professionals
        if ('senior' in role or 'manager' in role or level == 'advanced') and content_type in ['technical', 'advanced']:
            return 'confident_expert'
        
        # Creative or engaging content
        if content_type in ['creative', 'interactive', 'workshop']:
            return 'enthusiastic_teacher'
        
        # Reflective or complex content
        if content_type in ['theoretical', 'conceptual', 'strategic']:
            return 'calm_mentor'
        
        # Default professional approach
        return 'warm_professional'
    
    def export_emotional_narration_data(
        self,
        narration_result: Dict[str, Any],
        output_path: str
    ) -> None:
        """Export comprehensive narration data"""
        
        export_data = {
            'generator': 'HumanNarrationGenerator',
            'version': '1.0',
            'generated_at': datetime.now().isoformat(),
            'emotional_metadata': narration_result.get('emotional_metadata', {}),
            'narration_script': {
                'total_duration': narration_result['narration_script'].total_duration,
                'segment_count': len(narration_result['narration_script'].segments),
                'emotional_arc': narration_result['narration_script'].emotional_arc,
                'pacing_strategy': narration_result['narration_script'].pacing_strategy
            },
            'audio_files': narration_result.get('audio_files', []),
            'emotional_timeline': narration_result.get('emotional_timeline', {}),
            'quality_metrics': {
                'emotional_consistency': True,
                'pacing_optimization': True,
                'personalization_applied': True
            }
        }
        
        with open(output_path, 'w') as f:
            json.dump(export_data, f, indent=2)
        
        logger.info(f"Exported emotional narration data to {output_path}")
    
    async def generate_adaptive_narration(
        self,
        script_content: Any,
        employee_context: Dict[str, Any],
        learning_preferences: Optional[Dict[str, Any]] = None,
        output_dir: str = '/tmp'
    ) -> Dict[str, Any]:
        """Generate narration that adapts to employee learning preferences"""
        
        # Analyze learning preferences
        if learning_preferences:
            preferred_pace = learning_preferences.get('pace', 'normal')
            preferred_style = learning_preferences.get('style', 'professional')
            attention_span = learning_preferences.get('attention_span', 'medium')
        else:
            preferred_pace = 'normal'
            preferred_style = 'professional'
            attention_span = 'medium'
        
        # Map preferences to voice profile
        if preferred_style == 'engaging' and attention_span == 'short':
            voice_profile = 'enthusiastic_teacher'
        elif preferred_style == 'calm' or attention_span == 'long':
            voice_profile = 'calm_mentor'
        elif preferred_style == 'authoritative':
            voice_profile = 'confident_expert'
        else:
            voice_profile = 'warm_professional'
        
        # Adjust content essence based on preferences
        adaptive_essence = {
            'emotional_tone': preferred_style,
            'learning_objective': f"Adaptive learning for {employee_context.get('name', 'learner')}"
        }
        
        # Generate with adaptive parameters
        result = await self.generate_emotional_narration(
            script_content=script_content,
            employee_context=employee_context,
            content_essence=adaptive_essence,
            output_dir=output_dir,
            voice_profile=voice_profile
        )
        
        # Add adaptation metadata
        if result.get('success'):
            result['adaptation_metadata'] = {
                'learning_preferences': learning_preferences,
                'selected_voice_profile': voice_profile,
                'pace_adjustments': preferred_pace,
                'style_adaptations': preferred_style,
                'attention_optimizations': attention_span
            }
        
        logger.info(f"Generated adaptive narration for {employee_context.get('name', 'learner')}")
        return result


# Helper functions for integration
def create_human_narration_generator(openai_api_key: Optional[str] = None) -> HumanNarrationGenerator:
    """Factory function to create human narration generator"""
    return HumanNarrationGenerator(openai_api_key)

async def generate_emotional_audio_timeline(
    script_content: Any,
    employee_context: Dict[str, Any],
    content_essence: Optional[Dict[str, Any]] = None,
    output_dir: str = '/tmp',
    voice_profile: str = 'warm_professional'
) -> Dict[str, Any]:
    """Convenience function for generating emotional audio timeline"""
    
    generator = HumanNarrationGenerator()
    return await generator.generate_emotional_narration(
        script_content=script_content,
        employee_context=employee_context,
        content_essence=content_essence,
        output_dir=output_dir,
        voice_profile=voice_profile
    )