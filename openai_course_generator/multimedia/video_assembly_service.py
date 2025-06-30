#!/usr/bin/env python3
"""
Video Assembly Service
Merges slides and audio into professional educational videos using ffmpeg
"""

import os
import json
import logging
import subprocess
import shutil
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import tempfile
import asyncio

logger = logging.getLogger(__name__)

@dataclass
class VideoSettings:
    """Video output settings"""
    resolution: Tuple[int, int] = (1920, 1080)
    fps: int = 30
    video_codec: str = "libx264"
    audio_codec: str = "aac"
    video_bitrate: str = "4M"
    audio_bitrate: str = "192k"
    preset: str = "medium"  # ultrafast, fast, medium, slow, veryslow
    crf: int = 23  # Constant Rate Factor (0-51, lower = better quality)

@dataclass
class AssembledVideo:
    """Result of video assembly"""
    video_path: str
    duration: float
    file_size: int
    metadata: Dict[str, Any]
    success: bool
    error_message: Optional[str] = None

class VideoAssemblyService:
    """Assembles educational videos from slides and audio"""
    
    def __init__(self, ffmpeg_path: Optional[str] = None):
        """Initialize the video assembly service"""
        # Find ffmpeg
        self.ffmpeg_path = ffmpeg_path or self._find_ffmpeg()
        if not self.ffmpeg_path:
            raise RuntimeError("ffmpeg not found. Please install ffmpeg.")
        
        # Default settings
        self.default_settings = VideoSettings()
        
        # Verify ffmpeg works
        self._verify_ffmpeg()
        
    def _find_ffmpeg(self) -> Optional[str]:
        """Find ffmpeg executable"""
        # Check if ffmpeg is in PATH
        ffmpeg_cmd = "ffmpeg"
        if shutil.which(ffmpeg_cmd):
            return ffmpeg_cmd
        
        # Check common locations
        common_paths = [
            "/usr/local/bin/ffmpeg",
            "/usr/bin/ffmpeg",
            "/opt/homebrew/bin/ffmpeg",  # macOS with Homebrew
            "C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe",  # Windows
        ]
        
        for path in common_paths:
            if os.path.exists(path):
                return path
        
        return None
    
    def _verify_ffmpeg(self):
        """Verify ffmpeg is working"""
        try:
            result = subprocess.run(
                [self.ffmpeg_path, "-version"],
                capture_output=True,
                text=True
            )
            if result.returncode != 0:
                raise RuntimeError(f"ffmpeg verification failed: {result.stderr}")
            
            # Extract version
            version_line = result.stdout.split('\n')[0]
            logger.info(f"ffmpeg verified: {version_line}")
            
        except Exception as e:
            raise RuntimeError(f"Failed to verify ffmpeg: {e}")
    
    async def assemble_educational_video(
        self,
        timeline: Any,  # VideoTimeline from TimelineGenerator
        slide_metadata: List[Dict[str, Any]],  # From EducationalSlideGenerator
        output_path: str,
        settings: Optional[VideoSettings] = None,
        progress_callback: Optional[callable] = None
    ) -> AssembledVideo:
        """
        Assemble slides and audio into a video
        
        Args:
            timeline: Timeline with audio and transitions
            slide_metadata: List of slide information with file paths
            output_path: Path for output video
            settings: Video encoding settings
            progress_callback: Optional progress callback
            
        Returns:
            AssembledVideo with result information
        """
        logger.info(f"Assembling educational video: {output_path}")
        
        settings = settings or self.default_settings
        
        try:
            # Validate inputs
            self._validate_inputs(timeline, slide_metadata)
            
            if progress_callback:
                progress_callback(10, "Preparing video assembly")
            
            # Create working directory
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_path = Path(temp_dir)
                
                # Step 1: Create slide video segments
                if progress_callback:
                    progress_callback(20, "Creating slide sequences")
                
                slide_videos = await self._create_slide_videos(
                    slide_metadata,
                    timeline,
                    temp_path,
                    settings
                )
                
                # Step 2: Concatenate slide videos
                if progress_callback:
                    progress_callback(50, "Combining slides")
                
                slides_video = temp_path / "slides_combined.mp4"
                await self._concatenate_videos(slide_videos, slides_video, settings)
                
                # Step 3: Add audio track
                if progress_callback:
                    progress_callback(70, "Adding narration audio")
                
                video_with_audio = temp_path / "video_with_audio.mp4"
                await self._add_audio_track(
                    slides_video,
                    timeline.narration_file,
                    video_with_audio,
                    settings
                )
                
                # Step 4: Add transitions and effects
                if progress_callback:
                    progress_callback(85, "Adding transitions")
                
                final_video = Path(output_path)
                final_video.parent.mkdir(parents=True, exist_ok=True)
                
                await self._add_transitions(
                    video_with_audio,
                    timeline.slide_transitions,
                    final_video,
                    settings
                )
                
                # Step 5: Verify output
                if progress_callback:
                    progress_callback(95, "Verifying video")
                
                if not final_video.exists():
                    raise RuntimeError("Video generation failed - output file not created")
                
                # Get video info
                duration = self._get_video_duration(final_video)
                file_size = final_video.stat().st_size
                
                if progress_callback:
                    progress_callback(100, "Video assembly complete")
                
                logger.info(f"Video assembled successfully: {final_video}")
                logger.info(f"Duration: {duration:.2f}s, Size: {file_size / 1024 / 1024:.2f}MB")
                
                return AssembledVideo(
                    video_path=str(final_video),
                    duration=duration,
                    file_size=file_size,
                    metadata={
                        'resolution': f"{settings.resolution[0]}x{settings.resolution[1]}",
                        'fps': settings.fps,
                        'video_codec': settings.video_codec,
                        'audio_codec': settings.audio_codec,
                        'slide_count': len(slide_metadata),
                        'total_transitions': len(timeline.slide_transitions)
                    },
                    success=True
                )
                
        except Exception as e:
            logger.error(f"Video assembly failed: {e}")
            return AssembledVideo(
                video_path=output_path,
                duration=0,
                file_size=0,
                metadata={},
                success=False,
                error_message=str(e)
            )
    
    def _validate_inputs(self, timeline: Any, slide_metadata: List[Dict[str, Any]]):
        """Validate inputs before processing"""
        # Check timeline
        if not timeline.narration_file or not os.path.exists(timeline.narration_file):
            raise ValueError(f"Narration file not found: {timeline.narration_file}")
        
        # Check slides
        if not slide_metadata:
            raise ValueError("No slides provided")
        
        for slide in slide_metadata:
            if not slide.get('file_path') or not os.path.exists(slide['file_path']):
                raise ValueError(f"Slide file not found: {slide.get('file_path')}")
    
    async def _create_slide_videos(
        self,
        slide_metadata: List[Dict[str, Any]],
        timeline: Any,
        temp_dir: Path,
        settings: VideoSettings
    ) -> List[Path]:
        """Create video segments for each slide"""
        slide_videos = []
        
        logger.info(f"Creating slide videos for {len(slide_metadata)} slides")
        logger.info(f"Timeline has {len(timeline.slide_transitions)} transitions")
        
        # Debug: Log the structure
        if slide_metadata:
            logger.info(f"Sample slide metadata keys: {list(slide_metadata[0].keys())}")
        if timeline.slide_transitions:
            logger.info(f"Sample transition: slide_id={getattr(timeline.slide_transitions[0], 'slide_id', 'N/A')}, slide_number={getattr(timeline.slide_transitions[0], 'slide_number', 'N/A')}")
        
        for i, slide in enumerate(slide_metadata):
            logger.info(f"Processing slide {i+1}/{len(slide_metadata)}")
            
            # Multiple strategies to find corresponding transition
            transition = None
            
            # Strategy 1: Match by slide_number
            if 'slide_number' in slide:
                transition = next(
                    (t for t in timeline.slide_transitions if getattr(t, 'slide_number', None) == slide['slide_number']),
                    None
                )
            
            # Strategy 2: Match by index (i+1 = slide number)
            if not transition:
                slide_num = i + 1
                transition = next(
                    (t for t in timeline.slide_transitions if getattr(t, 'slide_number', None) == slide_num),
                    None
                )
            
            # Strategy 3: Match by slide_id pattern
            if not transition and 'slide_id' in slide:
                transition = next(
                    (t for t in timeline.slide_transitions if getattr(t, 'slide_id', None) == slide['slide_id']),
                    None
                )
            
            # Strategy 4: Use transition by index
            if not transition and i < len(timeline.slide_transitions):
                transition = timeline.slide_transitions[i]
                logger.info(f"Using transition by index {i}")
            
            if not transition:
                logger.error(f"No transition found for slide {i+1}, skipping")
                continue
            
            # Calculate duration for this slide
            if i + 1 < len(timeline.slide_transitions):
                next_transition = timeline.slide_transitions[i + 1]
                duration = getattr(next_transition, 'timestamp', 0) - getattr(transition, 'timestamp', 0)
            else:
                # Last slide - use remaining time
                duration = timeline.total_duration - getattr(transition, 'timestamp', 0)
            
            # Ensure minimum duration
            duration = max(duration, 1.0)
            
            logger.info(f"Slide {i+1} duration: {duration:.2f}s")
            
            # Create video from image
            output_video = temp_dir / f"slide_{i+1:03d}.mp4"
            
            # Build ffmpeg command
            cmd = [
                self.ffmpeg_path,
                '-y',  # Overwrite output
                '-loop', '1',  # Loop image
                '-i', slide['file_path'],  # Input image
                '-c:v', settings.video_codec,
                '-t', str(duration),  # Duration
                '-pix_fmt', 'yuv420p',  # Pixel format for compatibility
                '-vf', f'scale={settings.resolution[0]}:{settings.resolution[1]}:force_original_aspect_ratio=decrease,pad={settings.resolution[0]}:{settings.resolution[1]}:(ow-iw)/2:(oh-ih)/2',
                '-r', str(settings.fps),  # Frame rate
                '-b:v', settings.video_bitrate,
                '-preset', settings.preset,
                '-crf', str(settings.crf),
                str(output_video)
            ]
            
            # Add Ken Burns effect for visual interest
            if slide.get('animations'):
                # Add subtle zoom/pan effect
                zoom_filter = self._create_ken_burns_filter(duration, settings.resolution)
                cmd[cmd.index('-vf') + 1] = zoom_filter + ',' + cmd[cmd.index('-vf') + 1]
            
            # Run ffmpeg
            try:
                await self._run_ffmpeg_async(cmd)
                slide_videos.append(output_video)
                logger.info(f"Successfully created video for slide {i+1}")
            except Exception as e:
                logger.error(f"Failed to create video for slide {i+1}: {e}")
                # Create a black slide as fallback
                fallback_cmd = [
                    self.ffmpeg_path,
                    '-y',
                    '-f', 'lavfi',
                    '-i', f'color=black:size={settings.resolution[0]}x{settings.resolution[1]}:duration={duration}',
                    '-c:v', settings.video_codec,
                    '-pix_fmt', 'yuv420p',
                    str(output_video)
                ]
                await self._run_ffmpeg_async(fallback_cmd)
                slide_videos.append(output_video)
        
        logger.info(f"Created {len(slide_videos)} slide videos")
        return slide_videos
    
    def _create_ken_burns_filter(self, duration: float, resolution: Tuple[int, int]) -> str:
        """Create Ken Burns effect filter"""
        # Subtle zoom in effect
        start_zoom = 1.0
        end_zoom = 1.1
        
        # Calculate zoom expression
        zoom_expr = f"'min(zoom,pzoom)+{(end_zoom - start_zoom) / duration / 30}'"
        
        # Center the zoom
        x_expr = "'iw/2-(iw/zoom/2)'"
        y_expr = "'ih/2-(ih/zoom/2)'"
        
        return f"zoompan=z={zoom_expr}:x={x_expr}:y={y_expr}:d={int(duration * 30)}:s={resolution[0]}x{resolution[1]}"
    
    async def _concatenate_videos(
        self,
        video_files: List[Path],
        output_path: Path,
        settings: VideoSettings
    ):
        """Concatenate multiple videos into one"""
        # Create concat file
        concat_file = output_path.parent / "concat.txt"
        with open(concat_file, 'w') as f:
            for video in video_files:
                f.write(f"file '{video.absolute()}'\n")
        
        # Build ffmpeg command
        cmd = [
            self.ffmpeg_path,
            '-y',
            '-f', 'concat',
            '-safe', '0',
            '-i', str(concat_file),
            '-c', 'copy',  # Copy codec for speed
            str(output_path)
        ]
        
        await self._run_ffmpeg_async(cmd)
        
        # Clean up
        concat_file.unlink()
    
    async def _add_audio_track(
        self,
        video_path: Path,
        audio_path: str,
        output_path: Path,
        settings: VideoSettings
    ):
        """Add audio track to video"""
        cmd = [
            self.ffmpeg_path,
            '-y',
            '-i', str(video_path),  # Video input
            '-i', audio_path,  # Audio input
            '-c:v', 'copy',  # Copy video codec
            '-c:a', settings.audio_codec,
            '-b:a', settings.audio_bitrate,
            '-shortest',  # End when shortest stream ends
            '-map', '0:v:0',  # Map video from first input
            '-map', '1:a:0',  # Map audio from second input
            str(output_path)
        ]
        
        await self._run_ffmpeg_async(cmd)
    
    async def _add_transitions(
        self,
        video_path: Path,
        transitions: List[Any],
        output_path: Path,
        settings: VideoSettings
    ):
        """Add transition effects between slides"""
        # For now, we'll just copy the video
        # In a full implementation, you would add fade transitions
        
        # Build filter for transitions
        filter_complex = []
        
        # Add fade transitions at specified timestamps
        for i, transition in enumerate(transitions):
            if transition.transition_type == 'fade':
                # Fade out at end of previous slide
                if i > 0:
                    fade_start = transition.timestamp - transition.duration
                    filter_complex.append(
                        f"fade=t=out:st={fade_start}:d={transition.duration}"
                    )
                
                # Fade in at start of current slide
                filter_complex.append(
                    f"fade=t=in:st={transition.timestamp}:d={transition.duration}"
                )
        
        if filter_complex:
            # Apply transitions
            cmd = [
                self.ffmpeg_path,
                '-y',
                '-i', str(video_path),
                '-vf', ','.join(filter_complex),
                '-c:a', 'copy',  # Copy audio
                '-preset', settings.preset,
                '-crf', str(settings.crf),
                str(output_path)
            ]
        else:
            # No transitions, just copy
            cmd = [
                self.ffmpeg_path,
                '-y',
                '-i', str(video_path),
                '-c', 'copy',
                str(output_path)
            ]
        
        await self._run_ffmpeg_async(cmd)
    
    async def _run_ffmpeg_async(self, cmd: List[str]):
        """Run ffmpeg command asynchronously"""
        logger.debug(f"Running ffmpeg: {' '.join(cmd)}")
        
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await process.communicate()
        
        if process.returncode != 0:
            error_msg = stderr.decode() if stderr else "Unknown error"
            raise RuntimeError(f"ffmpeg failed: {error_msg}")
        
        return stdout.decode() if stdout else ""
    
    def _get_video_duration(self, video_path: Path) -> float:
        """Get duration of video file"""
        cmd = [
            'ffprobe',
            '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            str(video_path)
        ]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            return float(result.stdout.strip())
        except:
            return 0.0
    
    def create_thumbnail(
        self,
        video_path: str,
        output_path: str,
        timestamp: float = 5.0
    ) -> bool:
        """Create thumbnail from video"""
        try:
            cmd = [
                self.ffmpeg_path,
                '-y',
                '-i', video_path,
                '-ss', str(timestamp),  # Seek to timestamp
                '-vframes', '1',  # Extract one frame
                '-vf', 'scale=480:270',  # Thumbnail size
                output_path
            ]
            
            subprocess.run(cmd, capture_output=True, check=True)
            return True
            
        except Exception as e:
            logger.error(f"Failed to create thumbnail: {e}")
            return False
    
    def add_watermark(
        self,
        video_path: str,
        watermark_path: str,
        output_path: str,
        position: str = "bottom-right"
    ) -> bool:
        """Add watermark to video"""
        try:
            # Position mapping
            positions = {
                'top-left': '10:10',
                'top-right': 'W-w-10:10',
                'bottom-left': '10:H-h-10',
                'bottom-right': 'W-w-10:H-h-10',
                'center': '(W-w)/2:(H-h)/2'
            }
            
            overlay_position = positions.get(position, positions['bottom-right'])
            
            cmd = [
                self.ffmpeg_path,
                '-y',
                '-i', video_path,
                '-i', watermark_path,
                '-filter_complex', f'overlay={overlay_position}',
                '-c:a', 'copy',
                output_path
            ]
            
            subprocess.run(cmd, capture_output=True, check=True)
            return True
            
        except Exception as e:
            logger.error(f"Failed to add watermark: {e}")
            return False
    
    def extract_audio(self, video_path: str, output_path: str) -> bool:
        """Extract audio track from video"""
        try:
            cmd = [
                self.ffmpeg_path,
                '-y',
                '-i', video_path,
                '-q:a', '0',  # Best quality
                '-map', 'a',  # Map audio only
                output_path
            ]
            
            subprocess.run(cmd, capture_output=True, check=True)
            return True
            
        except Exception as e:
            logger.error(f"Failed to extract audio: {e}")
            return False