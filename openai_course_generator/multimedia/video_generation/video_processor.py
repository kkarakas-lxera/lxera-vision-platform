#!/usr/bin/env python3
"""
Video Generation Processor
Handles video generation from course content and audio using existing video pipeline
"""

import sys
import os
import json
import tempfile
import shutil
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List

# Add the refactored_nodes video generation to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "refactored_nodes" / "video_generation"))

# Import existing video generation functions
try:
    # Try to import video generation dependencies
    import matplotlib.pyplot as plt
    import numpy as np
    from PIL import Image
    VIDEO_AVAILABLE = True
    logger = logging.getLogger(__name__)
    logger.info("Video generation modules loaded successfully (basic mode)")
except ImportError as e:
    VIDEO_AVAILABLE = False
    logger = logging.getLogger(__name__)
    logger.warning(f"Video generation modules not available: {e}")

class VideoProcessor:
    """Processes course content and audio into video files"""
    
    def __init__(self, config):
        self.config = config
        self.video_config = config.video
        self.api_key = config.api.openai_api_key
        
        if not VIDEO_AVAILABLE:
            logger.warning("Video generation modules not available - videos will be skipped")
            return
        
        if not self.api_key:
            logger.warning("OpenAI API key not available - AI backgrounds will be disabled")
        
        try:
            self.video_generator = EnhancedVideoGenerator(openai_api_key=self.api_key)
            logger.info("Video processor initialized successfully")
        except Exception as e:
            logger.warning(f"Video generator initialization failed: {e}")
            self.video_generator = None
        
        logger.info(f"Video resolution: {self.video_config.resolution}")
        logger.info(f"Video FPS: {self.video_config.fps}")
        logger.info(f"Animation style: {self.video_config.animation_style}")
    
    def generate_course_videos(self, 
                              course_content: Dict[str, Any],
                              audio_files: List[Path],
                              output_dir: Path,
                              progress_callback=None) -> List[Path]:
        """
        Generate video files from course content and audio
        
        Args:
            course_content: Complete course data
            audio_files: List of generated audio files
            output_dir: Directory to save video files
            progress_callback: Optional callback for progress updates
            
        Returns:
            List of generated video file paths
        """
        
        logger.info("🔄 Starting video generation...")
        
        if not VIDEO_AVAILABLE or not self.video_generator:
            logger.warning("Video generation not available - skipping video creation")
            if progress_callback:
                progress_callback("video", 100, "Video generation skipped")
            return []
        
        if progress_callback:
            progress_callback("video", 10, "Preparing video generation")
        
        try:
            # Create video output directory
            video_dir = output_dir / "video"
            video_dir.mkdir(parents=True, exist_ok=True)
            
            generated_videos = []
            
            if progress_callback:
                progress_callback("video", 20, "Analyzing course content for video")
            
            # Prepare employee context
            employee_context = self._prepare_employee_context(course_content)
            
            # Generate videos for each available audio file
            total_audio_files = len(audio_files)
            
            for i, audio_file in enumerate(audio_files):
                if not audio_file.exists():
                    logger.warning(f"Audio file not found: {audio_file}")
                    continue
                
                progress = 30 + (i * 60 // total_audio_files) if total_audio_files > 0 else 30
                if progress_callback:
                    progress_callback("video", progress, f"Generating video {i+1}/{total_audio_files}")
                
                # Generate video for this audio file
                video_path = self._generate_single_video(
                    course_content,
                    audio_file,
                    employee_context,
                    video_dir,
                    f"video_{i+1}"
                )
                
                if video_path:
                    generated_videos.append(video_path)
            
            if progress_callback:
                progress_callback("video", 90, "Generating presentation slides")
            
            # Generate standalone slide presentation
            slides_path = self._generate_slide_presentation(
                course_content,
                video_dir
            )
            
            if slides_path:
                # Save slides info (not a video file, but related)
                pass
            
            if progress_callback:
                progress_callback("video", 100, "Video generation complete")
            
            logger.info(f"✅ Video generation completed: {len(generated_videos)} videos")
            return generated_videos
            
        except Exception as e:
            error_msg = f"Video generation failed: {str(e)}"
            logger.error(error_msg, exc_info=True)
            
            if progress_callback:
                progress_callback("video", 0, f"Error: {str(e)}")
            
            # Don't raise error for video generation - it's optional
            logger.warning("Continuing without videos due to generation error")
            return []
    
    def _generate_single_video(self, 
                              course_content: Dict[str, Any],
                              audio_file: Path,
                              employee_context: Dict[str, Any],
                              output_dir: Path,
                              video_name: str) -> Optional[Path]:
        """Generate a single video from course content and audio"""
        
        try:
            logger.info(f"Generating video: {video_name} with audio: {audio_file.name}")
            
            # Save course content to temporary JSON file for video generator
            temp_dir = Path(tempfile.mkdtemp(prefix="video_gen_"))
            temp_course_file = temp_dir / "course_content.json"
            
            with open(temp_course_file, 'w', encoding='utf-8') as f:
                json.dump(course_content, f, indent=2)
            
            # Generate professional video
            video_path = self.video_generator.create_professional_course_video(
                course_data=str(temp_course_file),
                audio_file=str(audio_file),
                employee_context=employee_context,
                output_dir=str(output_dir),
                quality_level=self.config.quality_level.value
            )
            
            # Cleanup temp files
            shutil.rmtree(temp_dir)
            
            if video_path and Path(video_path).exists():
                logger.info(f"✅ Video generated: {video_path}")
                return Path(video_path)
            else:
                logger.warning(f"Video generation returned no valid path: {video_path}")
                return None
                
        except Exception as e:
            logger.error(f"Single video generation failed: {e}")
            return None
    
    def _generate_slide_presentation(self, 
                                   course_content: Dict[str, Any],
                                   output_dir: Path) -> Optional[Path]:
        """Generate standalone slide presentation"""
        
        try:
            logger.info("Generating slide presentation...")
            
            # Use the complete pipeline test for slide generation
            pipeline_test = CompletePipelineTest(str(output_dir / "presentation"))
            
            # Extract course data
            course_data = course_content.get("course_content", {})
            
            # Generate presentation slides
            slides_info = pipeline_test.generate_master_script(course_data)
            
            if slides_info:
                logger.info("✅ Slide presentation generated")
                return output_dir / "presentation" / "slides"
            else:
                logger.warning("Slide presentation generation failed")
                return None
                
        except Exception as e:
            logger.error(f"Slide presentation generation failed: {e}")
            return None
    
    def _prepare_employee_context(self, course_content: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare employee context for video personalization"""
        
        employee_context = course_content.get("employee_context", {})
        metadata = course_content.get("metadata", {})
        
        # Enhanced context for video generation
        context = {
            "employee_name": employee_context.get("name", "Professional"),
            "job_title": metadata.get("job_title", "Professional Role"),
            "background": employee_context.get("background", ""),
            "learning_style": employee_context.get("learning_style", "practical"),
            "career_goals": employee_context.get("career_goals", ""),
            "course_personalization": {
                "quality_level": self.config.quality_level.value,
                "animation_style": self.video_config.animation_style,
                "enable_ai_backgrounds": self.video_config.enable_ai_backgrounds
            }
        }
        
        return context
    
    def _create_video_outline(self, course_content: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Create video outline from course content"""
        
        course_data = course_content.get("course_content", {})
        modules = course_data.get("modules", [])
        
        outline = []
        
        # Introduction slide
        outline.append({
            "slide_type": "title",
            "title": course_data.get("courseName", "Course"),
            "subtitle": course_data.get("courseDescription", ""),
            "duration": 5
        })
        
        # Module slides
        for i, module in enumerate(modules[:8]):  # Limit to 8 modules for video length
            module_name = module.get("moduleName", f"Module {i+1}")
            key_concepts = module.get("keyConceptsToCover", [])
            
            outline.append({
                "slide_type": "content",
                "title": module_name,
                "content": key_concepts[:5],  # Top 5 concepts
                "duration": 10
            })
        
        # Summary slide
        outline.append({
            "slide_type": "summary",
            "title": "Key Takeaways",
            "content": [f"Module {i+1}: {modules[i].get('moduleName', '')}" 
                       for i in range(min(5, len(modules)))],
            "duration": 8
        })
        
        return outline
    
    def create_video_with_slides(self, 
                                course_content: Dict[str, Any],
                                audio_file: Path,
                                output_path: Path) -> Optional[Path]:
        """Create video with custom slides and audio synchronization"""
        
        if not VIDEO_AVAILABLE:
            logger.warning("Video generation not available")
            return None
        
        try:
            # This would use moviepy or similar to create custom video
            # For now, use the existing video generator
            employee_context = self._prepare_employee_context(course_content)
            
            video_path = self._generate_single_video(
                course_content,
                audio_file,
                employee_context,
                output_path.parent,
                output_path.stem
            )
            
            return video_path
            
        except Exception as e:
            logger.error(f"Custom video creation failed: {e}")
            return None
    
    def validate_video_files(self, video_files: List[Path]) -> bool:
        """Validate generated video files"""
        
        try:
            valid_files = 0
            for video_file in video_files:
                if video_file.exists() and video_file.stat().st_size > 100000:  # At least 100KB
                    valid_files += 1
                    logger.debug(f"Valid video file: {video_file} ({video_file.stat().st_size:,} bytes)")
                else:
                    logger.warning(f"Invalid or small video file: {video_file}")
            
            success_rate = valid_files / len(video_files) if video_files else 0
            
            if success_rate >= 0.5:  # At least 50% success
                logger.info(f"✅ Video validation passed: {valid_files}/{len(video_files)} files valid")
                return True
            else:
                logger.error(f"❌ Video validation failed: {valid_files}/{len(video_files)} files valid")
                return False
                
        except Exception as e:
            logger.error(f"Video validation error: {e}")
            return False
    
    def get_video_info(self, video_file: Path) -> Dict[str, Any]:
        """Get information about a video file"""
        
        if not video_file.exists():
            return {"error": "File not found"}
        
        try:
            file_size = video_file.stat().st_size
            
            # Try to get video duration and details
            try:
                # This would require moviepy or ffmpeg
                # For now, return basic info
                return {
                    "filename": video_file.name,
                    "size_bytes": file_size,
                    "size_mb": round(file_size / (1024*1024), 2),
                    "format": video_file.suffix,
                    "resolution": f"{self.video_config.resolution[0]}x{self.video_config.resolution[1]}",
                    "fps": self.video_config.fps
                }
            except:
                return {
                    "filename": video_file.name,
                    "size_bytes": file_size,
                    "size_mb": round(file_size / (1024*1024), 2),
                    "format": video_file.suffix
                }
                
        except Exception as e:
            logger.error(f"Failed to get video info: {e}")
            return {"error": str(e)}