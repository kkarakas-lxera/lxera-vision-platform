#!/usr/bin/env python3
"""
Scene Synchronizer for Perfect Audio-Visual Alignment
Analyzes audio timing and synchronizes visual elements
"""

import os
import json
import logging
import subprocess
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime
import wave
import numpy as np
try:
    from scipy.io import wavfile
    import librosa
    AUDIO_LIBS_AVAILABLE = True
except ImportError:
    AUDIO_LIBS_AVAILABLE = False
    logger = logging.getLogger(__name__)
    logger.warning("Audio processing libraries not available. Using fallback timing.")

from .scene_generator import SceneAssets

# Configure logging
logger = logging.getLogger(__name__)

@dataclass
class TimingData:
    """Audio timing analysis results"""
    total_duration: float
    speech_segments: List[Tuple[float, float]]  # [(start, end), ...]
    pause_points: List[float]  # Timestamps of natural pauses
    emphasis_points: List[float]  # Timestamps of emphasized speech
    average_pace: float  # Words per minute
    suggested_transitions: List[float]  # Optimal slide transition points

@dataclass
class SynchronizedScene:
    """Scene with synchronized audio-visual elements"""
    scene_assets: SceneAssets
    timing_data: TimingData
    slide_transitions: List[Dict[str, Any]]  # Detailed transition timing
    scene_manifest: Dict[str, Any]
    sync_quality_score: float = 0.0

@dataclass
class SceneTransition:
    """Transition between scenes"""
    from_scene: Optional[int]
    to_scene: int
    transition_type: str = 'fade'
    duration_ms: int = 500
    audio_crossfade: bool = True
    gap_ms: int = 0

class SceneSynchronizer:
    """Synchronizes audio and visual elements for perfect multimedia experience"""
    
    def __init__(self):
        """Initialize the synchronizer"""
        # Audio analysis settings
        self.sample_rate = 22050  # Standard for speech
        self.hop_length = 512
        self.frame_length = 2048
        
        # Timing thresholds
        self.min_pause_duration = 0.3  # Minimum pause to consider
        self.emphasis_threshold = 1.5  # Energy threshold for emphasis
        self.min_slide_duration = 3.0  # Minimum seconds per slide
        
        # Transition settings
        self.default_transition_duration = 500  # ms
        self.audio_fade_duration = 200  # ms
    
    def analyze_audio_timing(self, audio_path: Path) -> TimingData:
        """
        Extract precise timing information from audio file
        
        Args:
            audio_path: Path to audio file
            
        Returns:
            TimingData with detailed timing analysis
        """
        logger.info(f"Analyzing audio timing: {audio_path}")
        
        try:
            if not AUDIO_LIBS_AVAILABLE:
                logger.warning("Audio libraries not available, using fallback timing")
                return self._get_fallback_timing(audio_path)
                
            # Load audio file
            audio_data, sr = librosa.load(str(audio_path), sr=self.sample_rate)
            total_duration = len(audio_data) / sr
            
            # Detect speech segments and pauses
            speech_segments, pause_points = self._detect_speech_segments(audio_data, sr)
            
            # Detect emphasis points
            emphasis_points = self._detect_emphasis_points(audio_data, sr)
            
            # Calculate speaking pace
            average_pace = self._calculate_speaking_pace(speech_segments, audio_path)
            
            # Suggest optimal transition points
            suggested_transitions = self._suggest_transition_points(
                speech_segments, pause_points, total_duration
            )
            
            return TimingData(
                total_duration=total_duration,
                speech_segments=speech_segments,
                pause_points=pause_points,
                emphasis_points=emphasis_points,
                average_pace=average_pace,
                suggested_transitions=suggested_transitions
            )
            
        except Exception as e:
            logger.error(f"Audio timing analysis failed: {e}")
            # Return basic timing data as fallback
            return self._get_fallback_timing(audio_path)
    
    def _detect_speech_segments(self, audio: np.ndarray, sr: int) -> Tuple[List[Tuple[float, float]], List[float]]:
        """Detect speech segments and pauses using energy-based VAD"""
        
        # Calculate short-term energy
        energy = librosa.feature.rms(y=audio, frame_length=self.frame_length, 
                                     hop_length=self.hop_length)[0]
        
        # Dynamic threshold based on energy statistics
        threshold = np.mean(energy) * 0.5
        
        # Convert to binary speech/silence
        speech_frames = energy > threshold
        
        # Find segment boundaries
        segments = []
        pauses = []
        in_speech = False
        start_time = 0
        
        for i, is_speech in enumerate(speech_frames):
            time = i * self.hop_length / sr
            
            if is_speech and not in_speech:
                # Speech starts
                start_time = time
                in_speech = True
            elif not is_speech and in_speech:
                # Speech ends
                segments.append((start_time, time))
                in_speech = False
                
                # Check if pause is significant
                if i + 1 < len(speech_frames):
                    next_speech = np.where(speech_frames[i+1:])[0]
                    if len(next_speech) > 0:
                        pause_duration = next_speech[0] * self.hop_length / sr
                        if pause_duration >= self.min_pause_duration:
                            pauses.append(time + pause_duration / 2)
        
        # Handle case where audio ends during speech
        if in_speech:
            segments.append((start_time, len(audio) / sr))
        
        return segments, pauses
    
    def _detect_emphasis_points(self, audio: np.ndarray, sr: int) -> List[float]:
        """Detect points of emphasis in speech"""
        
        # Calculate spectral features
        spectral_centroid = librosa.feature.spectral_centroid(
            y=audio, sr=sr, hop_length=self.hop_length
        )[0]
        
        # Calculate energy
        energy = librosa.feature.rms(y=audio, frame_length=self.frame_length,
                                     hop_length=self.hop_length)[0]
        
        # Combine features for emphasis detection
        # High energy + high spectral centroid = emphasis
        normalized_energy = energy / np.max(energy) if np.max(energy) > 0 else energy
        normalized_centroid = spectral_centroid / np.max(spectral_centroid) if np.max(spectral_centroid) > 0 else spectral_centroid
        
        emphasis_score = normalized_energy * 0.7 + normalized_centroid * 0.3
        
        # Find peaks
        emphasis_threshold = np.mean(emphasis_score) + np.std(emphasis_score) * self.emphasis_threshold
        emphasis_frames = np.where(emphasis_score > emphasis_threshold)[0]
        
        # Convert to timestamps and filter nearby points
        emphasis_points = []
        last_emphasis = -1
        
        for frame in emphasis_frames:
            time = frame * self.hop_length / sr
            if time - last_emphasis > 1.0:  # At least 1 second apart
                emphasis_points.append(time)
                last_emphasis = time
        
        return emphasis_points
    
    def _calculate_speaking_pace(self, speech_segments: List[Tuple[float, float]], 
                                audio_path: Path) -> float:
        """Estimate speaking pace in words per minute"""
        
        # Calculate total speech duration
        total_speech_duration = sum(end - start for start, end in speech_segments)
        
        if total_speech_duration == 0:
            return 150  # Default pace
        
        # Estimate words based on audio file size and speech duration
        # This is a rough estimate: ~150 words per minute is average
        minutes = total_speech_duration / 60
        estimated_words = minutes * 150  # Base estimate
        
        # Adjust based on pause density
        pause_ratio = len(speech_segments) / (total_speech_duration / 10)  # Segments per 10 seconds
        if pause_ratio > 2:  # Many pauses = slower pace
            estimated_words *= 0.9
        elif pause_ratio < 0.5:  # Few pauses = faster pace
            estimated_words *= 1.1
        
        return estimated_words / minutes if minutes > 0 else 150
    
    def _suggest_transition_points(self, speech_segments: List[Tuple[float, float]],
                                  pause_points: List[float],
                                  total_duration: float) -> List[float]:
        """Suggest optimal points for slide transitions"""
        
        suggestions = []
        
        # Start with natural pause points
        for pause in pause_points:
            suggestions.append(pause)
        
        # Add regular intervals if not enough pauses
        target_transitions = int(total_duration / 15)  # Roughly every 15 seconds
        
        if len(suggestions) < target_transitions:
            # Add transitions at speech segment boundaries
            for i, (start, end) in enumerate(speech_segments[:-1]):
                if len(suggestions) >= target_transitions:
                    break
                
                # Add transition at end of segment if it's far from existing transitions
                min_distance = min(abs(end - s) for s in suggestions) if suggestions else float('inf')
                if min_distance > 5:  # At least 5 seconds from other transitions
                    suggestions.append(end)
        
        # Sort and filter too-close transitions
        suggestions.sort()
        filtered = []
        last_time = -self.min_slide_duration
        
        for time in suggestions:
            if time - last_time >= self.min_slide_duration:
                filtered.append(time)
                last_time = time
        
        return filtered
    
    def _get_fallback_timing(self, audio_path: Path) -> TimingData:
        """Get basic timing data using ffprobe as fallback"""
        try:
            cmd = [
                'ffprobe', '-v', 'error', '-show_entries',
                'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1',
                str(audio_path)
            ]
            result = subprocess.run(cmd, capture_output=True, text=True)
            duration = float(result.stdout.strip()) if result.stdout else 30.0
            
            # Create evenly spaced transitions
            num_transitions = max(1, int(duration / 15))
            transitions = [i * duration / (num_transitions + 1) for i in range(1, num_transitions + 1)]
            
            return TimingData(
                total_duration=duration,
                speech_segments=[(0, duration)],
                pause_points=[],
                emphasis_points=[],
                average_pace=150,
                suggested_transitions=transitions
            )
        except:
            # Ultimate fallback
            return TimingData(
                total_duration=30.0,
                speech_segments=[(0, 30.0)],
                pause_points=[],
                emphasis_points=[],
                average_pace=150,
                suggested_transitions=[15.0]
            )
    
    def synchronize_scene_elements(self, scene_assets: SceneAssets) -> SynchronizedScene:
        """
        Synchronize all elements of a scene
        
        Args:
            scene_assets: Generated scene assets
            
        Returns:
            SynchronizedScene with perfect timing alignment
        """
        logger.info(f"Synchronizing scene {scene_assets.scene_number}")
        
        # Analyze audio timing
        timing_data = self.analyze_audio_timing(scene_assets.audio_path)
        
        # Create slide transitions based on timing analysis
        slide_transitions = self._create_slide_transitions(
            scene_assets, timing_data
        )
        
        # Create scene manifest
        scene_manifest = self._create_scene_manifest(
            scene_assets, timing_data, slide_transitions
        )
        
        # Calculate sync quality score
        sync_quality = self._calculate_sync_quality(
            scene_assets, timing_data, slide_transitions
        )
        
        return SynchronizedScene(
            scene_assets=scene_assets,
            timing_data=timing_data,
            slide_transitions=slide_transitions,
            scene_manifest=scene_manifest,
            sync_quality_score=sync_quality
        )
    
    def _create_slide_transitions(self, scene_assets: SceneAssets,
                                timing_data: TimingData) -> List[Dict[str, Any]]:
        """Create detailed slide transition timing"""
        
        transitions = []
        num_slides = len(scene_assets.slide_paths)
        
        if num_slides == 0:
            return transitions
        
        if num_slides == 1:
            # Single slide for entire scene
            transitions.append({
                'slide_index': 0,
                'start_time': 0.0,
                'end_time': timing_data.total_duration,
                'duration': timing_data.total_duration,
                'entry_effect': 'fade_in',
                'exit_effect': 'fade_out',
                'emphasis_points': [p for p in timing_data.emphasis_points 
                                  if 0 <= p <= timing_data.total_duration]
            })
        else:
            # Multiple slides - use suggested transitions
            transition_points = [0.0] + timing_data.suggested_transitions + [timing_data.total_duration]
            
            # Ensure we have enough transition points
            while len(transition_points) - 1 < num_slides:
                # Add evenly spaced transitions
                avg_duration = timing_data.total_duration / num_slides
                transition_points = [i * avg_duration for i in range(num_slides + 1)]
                break
            
            # Create transitions for each slide
            for i in range(num_slides):
                start_time = transition_points[i] if i < len(transition_points) - 1 else 0
                end_time = transition_points[i + 1] if i + 1 < len(transition_points) else timing_data.total_duration
                
                # Find emphasis points within this slide's duration
                slide_emphasis = [p for p in timing_data.emphasis_points 
                                if start_time <= p <= end_time]
                
                transitions.append({
                    'slide_index': i,
                    'start_time': start_time,
                    'end_time': end_time,
                    'duration': end_time - start_time,
                    'entry_effect': 'slide_in' if i > 0 else 'fade_in',
                    'exit_effect': 'slide_out' if i < num_slides - 1 else 'fade_out',
                    'emphasis_points': slide_emphasis,
                    'has_speech_pause': any(start_time <= p <= end_time for p in timing_data.pause_points)
                })
        
        return transitions
    
    def _create_scene_manifest(self, scene_assets: SceneAssets,
                             timing_data: TimingData,
                             slide_transitions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Create comprehensive scene manifest"""
        
        return {
            'scene_id': scene_assets.scene_id,
            'scene_number': scene_assets.scene_number,
            'duration': timing_data.total_duration,
            'assets': {
                'audio': {
                    'path': str(scene_assets.audio_path),
                    'duration': scene_assets.audio_duration,
                    'format': 'mp3'
                },
                'slides': [
                    {
                        'path': str(path),
                        'index': i,
                        'transition': slide_transitions[i] if i < len(slide_transitions) else None
                    }
                    for i, path in enumerate(scene_assets.slide_paths)
                ]
            },
            'timing': {
                'speech_segments': timing_data.speech_segments,
                'pause_points': timing_data.pause_points,
                'emphasis_points': timing_data.emphasis_points,
                'average_pace': timing_data.average_pace
            },
            'script': {
                'original': scene_assets.script,
                'personalized': scene_assets.script_personalized,
                'word_count': len(scene_assets.script_personalized.split())
            },
            'metadata': scene_assets.metadata,
            'sync_quality': 0.0  # Will be updated
        }
    
    def _calculate_sync_quality(self, scene_assets: SceneAssets,
                              timing_data: TimingData,
                              slide_transitions: List[Dict[str, Any]]) -> float:
        """Calculate quality score for synchronization"""
        
        scores = []
        
        # Score 1: Slide duration consistency
        if slide_transitions:
            durations = [t['duration'] for t in slide_transitions]
            avg_duration = np.mean(durations)
            std_duration = np.std(durations)
            consistency_score = 1.0 - min(std_duration / avg_duration, 1.0) if avg_duration > 0 else 0
            scores.append(consistency_score)
        
        # Score 2: Alignment with pauses
        if timing_data.pause_points and slide_transitions:
            aligned_pauses = 0
            for pause in timing_data.pause_points:
                for trans in slide_transitions[:-1]:  # Check all but last
                    if abs(trans['end_time'] - pause) < 0.5:  # Within 0.5 seconds
                        aligned_pauses += 1
                        break
            
            pause_score = aligned_pauses / len(timing_data.pause_points) if timing_data.pause_points else 0.5
            scores.append(pause_score)
        
        # Score 3: Appropriate slide count
        ideal_slide_count = max(1, int(timing_data.total_duration / 15))
        actual_slide_count = len(scene_assets.slide_paths)
        count_diff = abs(ideal_slide_count - actual_slide_count)
        count_score = 1.0 - (count_diff / ideal_slide_count) if ideal_slide_count > 0 else 0.5
        scores.append(count_score)
        
        # Score 4: Speech coverage
        if timing_data.speech_segments:
            total_speech = sum(end - start for start, end in timing_data.speech_segments)
            coverage = total_speech / timing_data.total_duration
            scores.append(coverage)
        
        # Calculate weighted average
        if scores:
            weights = [0.25, 0.35, 0.2, 0.2]  # Emphasize pause alignment
            weighted_scores = [s * w for s, w in zip(scores, weights[:len(scores)])]
            quality = sum(weighted_scores) / sum(weights[:len(scores)])
        else:
            quality = 0.5
        
        return round(quality, 2)
    
    def create_scene_transitions(self, scenes: List[SynchronizedScene]) -> List[SceneTransition]:
        """
        Create transitions between scenes
        
        Args:
            scenes: List of synchronized scenes
            
        Returns:
            List of scene transitions
        """
        transitions = []
        
        for i in range(len(scenes)):
            if i == 0:
                # First scene
                transition = SceneTransition(
                    from_scene=None,
                    to_scene=scenes[i].scene_assets.scene_number,
                    transition_type='fade_in',
                    duration_ms=1000,  # Longer fade for start
                    audio_crossfade=False
                )
            else:
                # Determine transition type based on scene types
                from_scene = scenes[i-1]
                to_scene = scenes[i]
                
                transition_type = self._determine_transition_type(
                    from_scene.scene_assets.metadata.get('scene_definition', {}).get('type'),
                    to_scene.scene_assets.metadata.get('scene_definition', {}).get('type')
                )
                
                # Check if we need a gap
                gap_ms = 0
                if any(from_scene.timing_data.pause_points):
                    # Natural pause at end of previous scene
                    gap_ms = 200
                
                transition = SceneTransition(
                    from_scene=from_scene.scene_assets.scene_number,
                    to_scene=to_scene.scene_assets.scene_number,
                    transition_type=transition_type,
                    duration_ms=self.default_transition_duration,
                    audio_crossfade=True,
                    gap_ms=gap_ms
                )
            
            transitions.append(transition)
        
        # Add final transition
        if scenes:
            transitions.append(SceneTransition(
                from_scene=scenes[-1].scene_assets.scene_number,
                to_scene=None,
                transition_type='fade_out',
                duration_ms=1000,
                audio_crossfade=False
            ))
        
        return transitions
    
    def _determine_transition_type(self, from_type: str, to_type: str) -> str:
        """Determine transition type based on scene types"""
        
        # Special transitions for certain combinations
        if from_type == 'intro' and to_type == 'concept':
            return 'zoom_in'
        elif from_type == 'concept' and to_type == 'example':
            return 'slide_left'
        elif from_type == 'example' and to_type == 'practice':
            return 'dissolve'
        elif to_type == 'summary':
            return 'fade'
        
        # Default transitions
        return 'fade'