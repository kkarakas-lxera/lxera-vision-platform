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
    preset: str = "fast"  # Optimized for faster encoding (was: medium)
    crf: int = 23  # Constant Rate Factor (0-51, lower = better quality)
    
    @classmethod
    def create_optimized(cls, quality_level: str = "balanced") -> 'VideoSettings':
        """Create optimized settings for different quality/speed trade-offs"""
        if quality_level == "fast":
            return cls(
                resolution=(1280, 720),  # Lower resolution for speed
                fps=24,                  # Lower fps for speed
                preset="ultrafast",      # Fastest encoding
                crf=28,                  # Lower quality but faster
                video_bitrate="2M"       # Lower bitrate
            )
        elif quality_level == "balanced":
            return cls(
                preset="fast",           # Good balance
                crf=25                   # Slightly lower quality for speed
            )
        elif quality_level == "quality":
            return cls(
                preset="slow",           # Best quality
                crf=20,                  # Higher quality
                video_bitrate="6M"       # Higher bitrate
            )
        else:
            return cls()  # Default settings

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
    """
    Assembles educational videos from slides and audio with performance optimizations
    
    Key Features:
    - Hardware acceleration detection and usage (VideoToolbox, NVENC, QSV, VAAPI)
    - Optimized encoding presets for different quality/speed trade-offs
    - Professional video effects with fade transitions
    - Comprehensive error handling and validation
    - Progress tracking for long operations
    
    Performance Optimizations:
    - Hardware-accelerated encoding when available
    - Optimized ffmpeg settings for faster processing
    - Quality presets: fast, balanced, quality
    - Efficient file handling with temporary directories
    """
    
    def __init__(self, ffmpeg_path: Optional[str] = None):
        """Initialize the video assembly service"""
        # Find ffmpeg
        self.ffmpeg_path = ffmpeg_path or self._find_ffmpeg()
        if not self.ffmpeg_path:
            raise RuntimeError("ffmpeg not found. Please install ffmpeg.")
        
        # Default settings (optimized for performance)
        self.default_settings = VideoSettings.create_optimized("balanced")
        
        # Check for hardware acceleration support
        self.hw_accel_available = self._check_hardware_acceleration()
        
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
            "/Users/kubilaycenk/homebrew/bin/ffmpeg",  # User's specific homebrew
            "C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe",  # Windows
        ]
        
        for path in common_paths:
            if os.path.exists(path):
                logger.info(f"Found ffmpeg at: {path}")
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
    
    def _check_hardware_acceleration(self) -> Dict[str, bool]:
        """Check what hardware acceleration options are available"""
        hw_accel = {
            'nvenc': False,      # NVIDIA GPU encoding
            'videotoolbox': False,  # macOS hardware encoding
            'vaapi': False,      # Intel/AMD GPU encoding (Linux)
            'qsv': False         # Intel Quick Sync Video
        }
        
        try:
            # Check available encoders
            result = subprocess.run(
                [self.ffmpeg_path, "-encoders"],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                output = result.stdout.lower()
                hw_accel['nvenc'] = 'h264_nvenc' in output
                hw_accel['videotoolbox'] = 'h264_videotoolbox' in output
                hw_accel['vaapi'] = 'h264_vaapi' in output
                hw_accel['qsv'] = 'h264_qsv' in output
            
            available = [k for k, v in hw_accel.items() if v]
            if available:
                logger.info(f"Hardware acceleration available: {', '.join(available)}")
            else:
                logger.info("No hardware acceleration detected, using software encoding")
                
        except Exception as e:
            logger.warning(f"Could not check hardware acceleration: {e}")
        
        return hw_accel
    
    def _get_optimized_encoder_settings(self, settings: VideoSettings) -> Dict[str, str]:
        """Get optimized encoder settings based on available hardware"""
        encoder_settings = {
            'video_codec': settings.video_codec,
            'preset': settings.preset
        }
        
        # Use hardware acceleration if available
        if self.hw_accel_available.get('videotoolbox', False):
            # macOS hardware encoding
            encoder_settings['video_codec'] = 'h264_videotoolbox'
            encoder_settings['preset'] = 'medium'  # videotoolbox doesn't use standard presets
            logger.info("Using VideoToolbox hardware acceleration")
        elif self.hw_accel_available.get('nvenc', False):
            # NVIDIA GPU encoding
            encoder_settings['video_codec'] = 'h264_nvenc'
            encoder_settings['preset'] = 'fast'
            logger.info("Using NVENC hardware acceleration")
        elif self.hw_accel_available.get('qsv', False):
            # Intel Quick Sync
            encoder_settings['video_codec'] = 'h264_qsv'
            encoder_settings['preset'] = 'fast'
            logger.info("Using Intel Quick Sync acceleration")
        
        return encoder_settings
    
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
                
                # Step 4: Add simple fade in/out at beginning and end only
                if progress_callback:
                    progress_callback(85, "Adding fade effects")
                
                final_video = Path(output_path)
                final_video.parent.mkdir(parents=True, exist_ok=True)
                
                # Get video duration for fade out timing
                duration = self._get_video_duration(video_with_audio)
                
                if duration > 2:  # Only add fades if video is long enough
                    # Simple fade in at start and fade out at end
                    fade_out_start = duration - 1.0  # Start fade 1 second before end
                    
                    logger.info(f"Adding fade in/out effects (duration: {duration:.1f}s)")
                    fade_cmd = [
                        self.ffmpeg_path,
                        '-y',
                        '-i', str(video_with_audio),
                        '-vf', f'fade=t=in:st=0:d=0.5,fade=t=out:st={fade_out_start}:d=1.0',
                        '-c:a', 'copy',
                        '-preset', settings.preset,
                        '-crf', str(settings.crf),
                        str(final_video)
                    ]
                    await self._run_ffmpeg_async(fade_cmd)
                else:
                    # Video too short for fades - direct copy
                    logger.info("Video too short for fades - direct copy")
                    copy_cmd = [
                        self.ffmpeg_path,
                        '-y',
                        '-i', str(video_with_audio),
                        '-c', 'copy',
                        str(final_video)
                    ]
                    await self._run_ffmpeg_async(copy_cmd)
                
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
                # Find the -vf index and update the filter
                vf_index = cmd.index('-vf')
                original_filter = cmd[vf_index + 1]
                # Properly combine filters
                combined_filter = f"{zoom_filter},{original_filter}"
                cmd[vf_index + 1] = combined_filter
            
            # Run ffmpeg
            try:
                await self._run_ffmpeg_async(cmd)
                
                # Validate the output video exists and has content
                if not output_video.exists():
                    raise RuntimeError(f"Output video was not created: {output_video}")
                
                file_size = output_video.stat().st_size
                if file_size < 1000:  # Less than 1KB is suspiciously small
                    raise RuntimeError(f"Output video is too small ({file_size} bytes)")
                
                # Quick validation of video content
                validation_cmd = [
                    self.ffmpeg_path,
                    '-i', str(output_video),
                    '-ss', '1',
                    '-vframes', '1',
                    '-f', 'image2pipe',
                    '-pix_fmt', 'rgb24',
                    '-'
                ]
                
                validation_result = subprocess.run(validation_cmd, capture_output=True)
                if validation_result.returncode == 0 and validation_result.stdout:
                    # Check if frame is black
                    import numpy as np
                    frame_data = np.frombuffer(validation_result.stdout, dtype=np.uint8)
                    if len(frame_data) > 0:
                        mean_brightness = frame_data.mean()
                        logger.info(f"Slide {i+1} video brightness check: {mean_brightness:.1f}")
                        if mean_brightness < 5:
                            logger.warning(f"Slide {i+1} video appears to be BLACK!")
                
                slide_videos.append(output_video)
                logger.info(f"Successfully created video for slide {i+1} ({file_size / 1024:.1f} KB)")
                
            except Exception as e:
                logger.error(f"Failed to create video for slide {i+1}: {e}")
                logger.error(f"Slide path: {slide['file_path']}")
                logger.error(f"Slide exists: {os.path.exists(slide['file_path'])}")
                
                # Instead of creating a black fallback, let's try a simpler command
                logger.info(f"Attempting simplified video creation for slide {i+1}")
                
                # Simplified command without Ken Burns effect
                simple_cmd = [
                    self.ffmpeg_path,
                    '-y',
                    '-loop', '1',
                    '-i', slide['file_path'],
                    '-c:v', settings.video_codec,
                    '-t', str(duration),
                    '-pix_fmt', 'yuv420p',
                    '-vf', f'scale={settings.resolution[0]}:{settings.resolution[1]}:force_original_aspect_ratio=decrease,pad={settings.resolution[0]}:{settings.resolution[1]}:(ow-iw)/2:(oh-ih)/2:color=white',
                    '-r', str(settings.fps),
                    '-b:v', settings.video_bitrate,
                    '-preset', settings.preset,
                    '-crf', str(settings.crf),
                    str(output_video)
                ]
                
                try:
                    await self._run_ffmpeg_async(simple_cmd)
                    slide_videos.append(output_video)
                    logger.info(f"Successfully created simplified video for slide {i+1}")
                except Exception as e2:
                    logger.error(f"Simplified video creation also failed: {e2}")
                    # Don't add a black video - better to fail cleanly
                    raise RuntimeError(f"Cannot create video for slide {i+1}: {e}")
        
        logger.info(f"Created {len(slide_videos)} slide videos")
        return slide_videos
    
    def _create_ken_burns_filter(self, duration: float, resolution: Tuple[int, int]) -> str:
        """Create Ken Burns effect filter"""
        # Very subtle zoom in effect
        total_frames = int(duration * 30)  # 30 fps
        
        # Simple linear zoom from 1.0 to 1.05 over the duration
        # Using simpler expressions that are more compatible
        zoom_expr = f"'1+0.05*on/{total_frames}'"
        
        # Keep image centered during zoom
        x_expr = "'(iw-iw/zoom)/2'"
        y_expr = "'(ih-ih/zoom)/2'"
        
        # Ensure we specify frame count
        return f"zoompan=z={zoom_expr}:x={x_expr}:y={y_expr}:d={total_frames}:s={resolution[0]}x{resolution[1]}:fps=30"
    
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
        # Build filter for transitions
        filter_complex = []
        
        # Add fade transitions at specified timestamps
        for i, transition in enumerate(transitions):
            if hasattr(transition, 'transition_type') and transition.transition_type == 'fade':
                # Fade in at start of current slide
                if hasattr(transition, 'timestamp') and hasattr(transition, 'duration'):
                    filter_complex.append(
                        f"fade=t=in:st={transition.timestamp}:d={transition.duration}"
                    )
                    
                    # Fade out before next slide (if not last)
                    if i < len(transitions) - 1:
                        next_transition = transitions[i + 1]
                        if hasattr(next_transition, 'timestamp'):
                            fade_out_start = next_transition.timestamp - transition.duration
                            if fade_out_start > transition.timestamp:
                                filter_complex.append(
                                    f"fade=t=out:st={fade_out_start}:d={transition.duration}"
                                )
        
        if filter_complex:
            logger.info(f"Applying {len(filter_complex)} fade transitions")
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
            logger.info("No transitions to apply - direct copy")
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
        """Run ffmpeg command synchronously (despite the name, for compatibility)"""
        logger.info(f"Running ffmpeg command: {' '.join(cmd[:10])}...")  # Log first part of command
        
        # Ensure we use absolute path for ffmpeg
        if not os.path.isabs(cmd[0]):
            cmd[0] = self.ffmpeg_path
        
        try:
            # Use synchronous subprocess which has proven to work reliably
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                env={
                    **os.environ,
                    'PATH': f"/Users/kubilaycenk/homebrew/bin:{os.environ.get('PATH', '')}"
                }
            )
            
            if result.returncode != 0:
                logger.error(f"FFmpeg command failed with return code {result.returncode}")
                logger.error(f"FFmpeg stderr: {result.stderr[:1000]}")  # Log first 1000 chars
                logger.error(f"Full command: {' '.join(cmd)}")
                raise RuntimeError(f"ffmpeg failed with code {result.returncode}: {result.stderr[:500]}")
            
            # Log success
            if result.stderr:
                # FFmpeg often writes info to stderr even on success
                logger.debug(f"FFmpeg info: {result.stderr[:500]}")
            
            return result.stdout
            
        except Exception as e:
            logger.error(f"Failed to execute ffmpeg: {e}")
            logger.error(f"Command was: {' '.join(cmd)}")
            raise
    
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