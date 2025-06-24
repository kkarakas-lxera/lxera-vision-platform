#!/usr/bin/env python3
"""
Audio Generation Processor
Handles audio generation from course content using existing audio pipeline
"""

import sys
import os
import json
import tempfile
import shutil
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List

# Add the refactored_nodes audio generation to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "refactored_nodes" / "audio_generation"))

# Import existing audio generation functions
try:
    from summarizer import generate_audio_script
    from tts_generator import generate_multilingual_audio, list_available_voices, detect_language
    AUDIO_AVAILABLE = True
    logger = logging.getLogger(__name__)
    logger.info("Audio generation modules loaded successfully")
except ImportError as e:
    AUDIO_AVAILABLE = False
    logger = logging.getLogger(__name__)
    logger.warning(f"Audio generation modules not available: {e}")

class AudioProcessor:
    """Processes course content into audio files"""
    
    def __init__(self, config):
        self.config = config
        self.audio_config = config.audio
        
        if not AUDIO_AVAILABLE:
            raise ImportError("Audio generation modules are not available")
        
        logger.info("Audio processor initialized")
        logger.info(f"Voice: {self.audio_config.default_voice}")
        logger.info(f"Language: {self.audio_config.default_language}")
        logger.info(f"Style: {self.audio_config.summary_style}")
    
    def generate_course_audio(self, 
                             course_content: Dict[str, Any],
                             output_dir: Path,
                             progress_callback=None) -> List[Path]:
        """
        Generate audio files from course content
        
        Args:
            course_content: Complete course data
            output_dir: Directory to save audio files
            progress_callback: Optional callback for progress updates
            
        Returns:
            List of generated audio file paths
        """
        
        logger.info("🔄 Starting audio generation...")
        
        if progress_callback:
            progress_callback("audio", 10, "Preparing audio generation")
        
        try:
            # Create audio output directory
            audio_dir = output_dir / "audio"
            audio_dir.mkdir(parents=True, exist_ok=True)
            
            generated_files = []
            
            # Get course content structure
            course_data = course_content.get("course_content", {})
            modules = course_data.get("modules", [])
            
            if not modules:
                logger.warning("No modules found in course content")
                return generated_files
            
            if progress_callback:
                progress_callback("audio", 20, "Analyzing course content")
            
            # Generate different types of audio content
            
            # 1. Course Overview Audio
            if progress_callback:
                progress_callback("audio", 30, "Generating course overview audio")
            
            overview_audio = self._generate_course_overview_audio(
                course_content, audio_dir
            )
            if overview_audio:
                generated_files.append(overview_audio)
            
            # 2. Module-by-Module Audio (if enabled)
            if self.audio_config.enable_podcast_mode:
                if progress_callback:
                    progress_callback("audio", 50, "Generating comprehensive podcast")
                
                podcast_audio = self._generate_comprehensive_podcast(
                    course_content, audio_dir
                )
                if podcast_audio:
                    generated_files.append(podcast_audio)
            
            # 3. Quick Summary Audio
            if progress_callback:
                progress_callback("audio", 70, "Generating quick summary audio")
            
            summary_audio = self._generate_quick_summary_audio(
                course_content, audio_dir
            )
            if summary_audio:
                generated_files.append(summary_audio)
            
            if progress_callback:
                progress_callback("audio", 90, "Finalizing audio files")
            
            # 4. Generate audio scripts for reference
            self._save_audio_scripts(course_content, audio_dir)
            
            if progress_callback:
                progress_callback("audio", 100, "Audio generation complete")
            
            logger.info(f"✅ Audio generation completed: {len(generated_files)} files")
            return generated_files
            
        except Exception as e:
            error_msg = f"Audio generation failed: {str(e)}"
            logger.error(error_msg, exc_info=True)
            
            if progress_callback:
                progress_callback("audio", 0, f"Error: {str(e)}")
            
            raise RuntimeError(error_msg) from e
    
    def _generate_course_overview_audio(self, 
                                       course_content: Dict[str, Any], 
                                       output_dir: Path) -> Optional[Path]:
        """Generate overview audio for the entire course"""
        
        try:
            logger.info("Generating course overview audio...")
            
            # Prepare course data for audio script generation
            audio_data = self._prepare_audio_data(course_content)
            
            # Generate script
            script = generate_audio_script(
                audio_data,
                target_duration=self.audio_config.target_duration_minutes,
                summary_style="detailed",  # Always detailed for overview
                target_language=self.audio_config.default_language,
                podcast_mode=False
            )
            
            if script.startswith("Error:"):
                logger.error(f"Script generation failed: {script}")
                return None
            
            # Generate audio
            course_name = course_content.get("course_content", {}).get("courseName", "course")
            sanitized_name = self._sanitize_filename(course_name)
            audio_filename = f"{sanitized_name}_overview.mp3"
            audio_path = output_dir / audio_filename
            
            result_path = generate_multilingual_audio(
                script_text=script,
                output_path=str(audio_path),
                target_language=self.audio_config.default_language,
                voice_preference=self.audio_config.default_voice,
                speed=self.audio_config.speech_speed
            )
            
            if result_path.startswith("Error:"):
                logger.error(f"Audio generation failed: {result_path}")
                return None
            
            logger.info(f"✅ Course overview audio generated: {audio_path}")
            return audio_path
            
        except Exception as e:
            logger.error(f"Course overview audio generation failed: {e}")
            return None
    
    def _generate_comprehensive_podcast(self, 
                                       course_content: Dict[str, Any], 
                                       output_dir: Path) -> Optional[Path]:
        """Generate comprehensive podcast including all course content"""
        
        try:
            logger.info("Generating comprehensive podcast...")
            
            # Prepare course data for podcast generation
            audio_data = self._prepare_audio_data(course_content, include_all_modules=True)
            
            # Generate comprehensive script
            script = generate_audio_script(
                audio_data,
                target_language=self.audio_config.default_language,
                podcast_mode=True
            )
            
            if script.startswith("Error:"):
                logger.error(f"Podcast script generation failed: {script}")
                return None
            
            # Generate audio
            course_name = course_content.get("course_content", {}).get("courseName", "course")
            sanitized_name = self._sanitize_filename(course_name)
            audio_filename = f"{sanitized_name}_comprehensive_podcast.mp3"
            audio_path = output_dir / audio_filename
            
            result_path = generate_multilingual_audio(
                script_text=script,
                output_path=str(audio_path),
                target_language=self.audio_config.default_language,
                voice_preference=self.audio_config.default_voice,
                speed=self.audio_config.speech_speed
            )
            
            if result_path.startswith("Error:"):
                logger.error(f"Podcast generation failed: {result_path}")
                return None
            
            logger.info(f"✅ Comprehensive podcast generated: {audio_path}")
            return audio_path
            
        except Exception as e:
            logger.error(f"Comprehensive podcast generation failed: {e}")
            return None
    
    def _generate_quick_summary_audio(self, 
                                     course_content: Dict[str, Any], 
                                     output_dir: Path) -> Optional[Path]:
        """Generate quick summary audio"""
        
        try:
            logger.info("Generating quick summary audio...")
            
            # Prepare course data for summary
            audio_data = self._prepare_audio_data(course_content)
            
            # Generate concise script
            script = generate_audio_script(
                audio_data,
                target_duration="3-5",  # Short summary
                summary_style="concise",
                target_language=self.audio_config.default_language,
                podcast_mode=False
            )
            
            if script.startswith("Error:"):
                logger.error(f"Summary script generation failed: {script}")
                return None
            
            # Generate audio
            course_name = course_content.get("course_content", {}).get("courseName", "course")
            sanitized_name = self._sanitize_filename(course_name)
            audio_filename = f"{sanitized_name}_quick_summary.mp3"
            audio_path = output_dir / audio_filename
            
            result_path = generate_multilingual_audio(
                script_text=script,
                output_path=str(audio_path),
                target_language=self.audio_config.default_language,
                voice_preference=self.audio_config.default_voice,
                speed=self.audio_config.speech_speed
            )
            
            if result_path.startswith("Error:"):
                logger.error(f"Summary audio generation failed: {result_path}")
                return None
            
            logger.info(f"✅ Quick summary audio generated: {audio_path}")
            return audio_path
            
        except Exception as e:
            logger.error(f"Quick summary audio generation failed: {e}")
            return None
    
    def _prepare_audio_data(self, 
                           course_content: Dict[str, Any], 
                           include_all_modules: bool = False) -> Dict[str, Any]:
        """Prepare course data in format expected by audio generation"""
        
        course_data = course_content.get("course_content", {})
        metadata = course_content.get("metadata", {})
        
        # Extract basic info
        course_name = course_data.get("courseName", "Unknown Course")
        course_description = course_data.get("courseDescription", "")
        modules = course_data.get("modules", [])
        
        # Prepare audio data structure
        audio_data = {
            "module_name": course_name,
            "course_name": course_name,
            "course_description": course_description,
            "total_modules": len(modules),
            "employee_context": course_content.get("employee_context", {}),
            "generated_content": "",
            "modules": []
        }
        
        # Combine content from modules
        combined_content = []
        
        if include_all_modules:
            # Include content from all modules for comprehensive podcast
            for i, module in enumerate(modules[:5]):  # Limit to first 5 modules to manage length
                module_name = module.get("moduleName", f"Module {i+1}")
                module_content = module.get("content", "")
                
                if module_content:
                    combined_content.append(f"## {module_name}\n\n{module_content}\n")
                    
                    audio_data["modules"].append({
                        "moduleName": module_name,
                        "content": module_content[:2000],  # Limit length
                        "keyConceptsToCover": module.get("keyConceptsToCover", [])
                    })
        else:
            # Include summary content from first few modules
            for i, module in enumerate(modules[:3]):  # First 3 modules for overview
                module_name = module.get("moduleName", f"Module {i+1}")
                module_content = module.get("content", "")
                
                if module_content:
                    # Extract first paragraph or first 500 chars for overview
                    summary_content = module_content.split('\n\n')[0] if '\n\n' in module_content else module_content[:500]
                    combined_content.append(f"**{module_name}**: {summary_content}\n")
        
        # Set the combined content
        audio_data["generated_content"] = "\n".join(combined_content)
        
        return audio_data
    
    def _save_audio_scripts(self, course_content: Dict[str, Any], output_dir: Path):
        """Save generated audio scripts for reference"""
        
        try:
            scripts_dir = output_dir / "scripts"
            scripts_dir.mkdir(exist_ok=True)
            
            course_name = course_content.get("course_content", {}).get("courseName", "course")
            sanitized_name = self._sanitize_filename(course_name)
            
            # Save overview script
            audio_data = self._prepare_audio_data(course_content)
            overview_script = generate_audio_script(
                audio_data,
                target_duration=self.audio_config.target_duration_minutes,
                summary_style="detailed",
                target_language=self.audio_config.default_language,
                podcast_mode=False
            )
            
            if not overview_script.startswith("Error:"):
                script_path = scripts_dir / f"{sanitized_name}_overview_script.txt"
                with open(script_path, 'w', encoding='utf-8') as f:
                    f.write(overview_script)
                logger.debug(f"Saved overview script: {script_path}")
            
            # Save summary script
            summary_script = generate_audio_script(
                audio_data,
                target_duration="3-5",
                summary_style="concise",
                target_language=self.audio_config.default_language,
                podcast_mode=False
            )
            
            if not summary_script.startswith("Error:"):
                script_path = scripts_dir / f"{sanitized_name}_summary_script.txt"
                with open(script_path, 'w', encoding='utf-8') as f:
                    f.write(summary_script)
                logger.debug(f"Saved summary script: {script_path}")
                
        except Exception as e:
            logger.warning(f"Failed to save audio scripts: {e}")
    
    def _sanitize_filename(self, filename: str) -> str:
        """Sanitize filename for safe file operations"""
        import re
        # Remove special characters and replace spaces with underscores
        sanitized = re.sub(r'[^\w\s-]', '', filename)
        sanitized = re.sub(r'[-\s]+', '_', sanitized)
        return sanitized.lower()
    
    def get_available_voices(self) -> Dict[str, str]:
        """Get available voice options"""
        if AUDIO_AVAILABLE:
            return list_available_voices()
        return {}
    
    def validate_audio_files(self, audio_files: List[Path]) -> bool:
        """Validate generated audio files"""
        
        try:
            valid_files = 0
            for audio_file in audio_files:
                if audio_file.exists() and audio_file.stat().st_size > 1000:  # At least 1KB
                    valid_files += 1
                    logger.debug(f"Valid audio file: {audio_file} ({audio_file.stat().st_size:,} bytes)")
                else:
                    logger.warning(f"Invalid or small audio file: {audio_file}")
            
            success_rate = valid_files / len(audio_files) if audio_files else 0
            
            if success_rate >= 0.5:  # At least 50% success
                logger.info(f"✅ Audio validation passed: {valid_files}/{len(audio_files)} files valid")
                return True
            else:
                logger.error(f"❌ Audio validation failed: {valid_files}/{len(audio_files)} files valid")
                return False
                
        except Exception as e:
            logger.error(f"Audio validation error: {e}")
            return False