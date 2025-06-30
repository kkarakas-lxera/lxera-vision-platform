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
        
        # Generate audio segments for each slide
        audio_segments = []
        current_time = 0.0
        
        for i, slide in enumerate(script.slides):
            logger.info(f"Processing slide {i+1}/{len(script.slides)}")
            
            # Create audio segment
            segment = await self._generate_audio_segment(
                slide_id=slide.slide_id,
                text=slide.speaker_notes,
                voice=voice,
                speed=speed,
                audio_dir=audio_dir,
                segment_number=i+1
            )
            
            # Calculate timing
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
    
    async def _generate_audio_segment(
        self,
        slide_id: str,
        text: str,
        voice: str,
        speed: float,
        audio_dir: Path,
        segment_number: int
    ) -> AudioSegment:
        """Generate audio for a single segment using OpenAI TTS"""
        
        try:
            logger.info(f"Generating audio for slide {slide_id}")
            
            # Clean text for TTS
            cleaned_text = self._clean_text_for_tts(text)
            
            # Generate audio using OpenAI TTS
            response = self.client.audio.speech.create(
                model="tts-1-hd",  # High quality model
                voice=voice,
                input=cleaned_text,
                speed=speed
            )
            
            # Save audio file
            audio_filename = f"segment_{segment_number:03d}_{slide_id}.mp3"
            audio_path = audio_dir / audio_filename
            
            # Write the response content to file
            response.write_to_file(str(audio_path))
            
            logger.info(f"Audio segment saved: {audio_path}")
            
            # Estimate duration (will be refined when merging)
            estimated_duration = len(cleaned_text.split()) / self.words_per_minute * 60
            
            return AudioSegment(
                segment_id=slide_id,
                text=cleaned_text,
                start_time=0,  # Will be set later
                end_time=estimated_duration,  # Will be adjusted
                audio_file=str(audio_path),
                voice=voice,
                speed=speed
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
                slide_id=slide.slide_id,
                slide_number=slide.slide_number,
                timestamp=segment.start_time,
                transition_type=slide.transitions.get('entry', 'fade'),
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
                                slide_id=f"{slide.slide_id}_point",
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