#!/usr/bin/env python3
"""
File Manager Utility
Handles all file operations for the content generation pipeline
"""

import os
import json
import shutil
from pathlib import Path
from typing import Dict, Any, Optional, List
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class FileManager:
    """Centralized file management for the pipeline"""
    
    def __init__(self, base_dir: Path):
        self.base_dir = Path(base_dir)
        self.ensure_directories()
    
    def ensure_directories(self):
        """Ensure all required directories exist"""
        required_dirs = [
            "input_data/employee_profiles",
            "input_data/course_templates", 
            "input_data/requirements",
            "output/courses",
            "output/logs",
            "templates/slide_templates",
            "templates/audio_templates"
        ]
        
        for dir_path in required_dirs:
            full_path = self.base_dir / dir_path
            full_path.mkdir(parents=True, exist_ok=True)
    
    def load_employee_data(self, employee_file: str) -> Dict[str, Any]:
        """Load employee data from JSON file"""
        employee_path = self.base_dir / "input_data" / "employee_profiles" / employee_file
        
        if not employee_path.exists():
            # Try without extension
            employee_path = self.base_dir / "input_data" / "employee_profiles" / f"{employee_file}.json"
        
        if not employee_path.exists():
            raise FileNotFoundError(f"Employee file not found: {employee_file}")
        
        logger.info(f"Loading employee data: {employee_path}")
        with open(employee_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def save_course_content(self, 
                           course_data: Dict[str, Any], 
                           output_path: Path,
                           filename: str = "course_content.json") -> Path:
        """Save course content to JSON file"""
        output_path.mkdir(parents=True, exist_ok=True)
        file_path = output_path / filename
        
        logger.info(f"Saving course content: {file_path}")
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(course_data, f, indent=2, ensure_ascii=False)
        
        return file_path
    
    def save_audio_file(self, 
                       audio_data: bytes, 
                       output_path: Path,
                       filename: str) -> Path:
        """Save audio file"""
        audio_dir = output_path / "audio"
        audio_dir.mkdir(parents=True, exist_ok=True)
        file_path = audio_dir / filename
        
        logger.info(f"Saving audio file: {file_path}")
        with open(file_path, 'wb') as f:
            f.write(audio_data)
        
        return file_path
    
    def save_video_file(self, 
                       video_path: str, 
                       output_path: Path,
                       filename: str) -> Path:
        """Move/copy video file to output location"""
        video_dir = output_path / "video" 
        video_dir.mkdir(parents=True, exist_ok=True)
        destination = video_dir / filename
        
        logger.info(f"Saving video file: {video_path} -> {destination}")
        shutil.copy2(video_path, destination)
        
        return destination
    
    def save_slides(self, 
                   slides_dir: str, 
                   output_path: Path) -> Path:
        """Copy slides to output location"""
        slides_output = output_path / "slides"
        
        if slides_output.exists():
            shutil.rmtree(slides_output)
        
        logger.info(f"Copying slides: {slides_dir} -> {slides_output}")
        shutil.copytree(slides_dir, slides_output)
        
        return slides_output
    
    def create_course_package(self, 
                             output_path: Path,
                             course_data: Dict[str, Any],
                             audio_files: List[Path] = None,
                             video_files: List[Path] = None,
                             slides_path: Path = None) -> Dict[str, Path]:
        """Create complete course package with all assets"""
        
        logger.info(f"Creating course package: {output_path}")
        
        package_info = {
            "output_path": output_path,
            "created_at": datetime.now().isoformat()
        }
        
        # Save course content
        content_path = self.save_course_content(course_data, output_path)
        package_info["course_content"] = content_path
        
        # Copy audio files
        if audio_files:
            audio_dir = output_path / "audio"
            audio_dir.mkdir(exist_ok=True)
            package_info["audio_files"] = []
            
            for audio_file in audio_files:
                if isinstance(audio_file, str):
                    audio_file = Path(audio_file)
                
                if audio_file.exists():
                    dest = audio_dir / audio_file.name
                    shutil.copy2(audio_file, dest)
                    package_info["audio_files"].append(dest)
        
        # Copy video files  
        if video_files:
            video_dir = output_path / "video"
            video_dir.mkdir(exist_ok=True)
            package_info["video_files"] = []
            
            for video_file in video_files:
                if isinstance(video_file, str):
                    video_file = Path(video_file)
                
                if video_file.exists():
                    dest = video_dir / video_file.name
                    shutil.copy2(video_file, dest)
                    package_info["video_files"].append(dest)
        
        # Copy slides
        if slides_path and slides_path.exists():
            package_info["slides_path"] = self.save_slides(str(slides_path), output_path)
        
        # Save package manifest
        manifest_path = output_path / "package_manifest.json"
        with open(manifest_path, 'w', encoding='utf-8') as f:
            json.dump({k: str(v) if isinstance(v, Path) else v 
                      for k, v in package_info.items()}, f, indent=2)
        
        logger.info(f"Course package created successfully: {output_path}")
        return package_info
    
    def get_latest_course_output(self) -> Optional[Path]:
        """Get the most recently created course output"""
        courses_dir = self.base_dir / "output" / "courses"
        
        if not courses_dir.exists():
            return None
        
        course_dirs = [d for d in courses_dir.iterdir() if d.is_dir()]
        if not course_dirs:
            return None
        
        # Sort by modification time
        latest = max(course_dirs, key=os.path.getmtime)
        return latest
    
    def cleanup_temp_files(self, temp_dirs: List[str] = None):
        """Clean up temporary files and directories"""
        if temp_dirs:
            for temp_dir in temp_dirs:
                temp_path = Path(temp_dir)
                if temp_path.exists():
                    logger.info(f"Cleaning up temp directory: {temp_path}")
                    shutil.rmtree(temp_path)
    
    def log_file_operation(self, operation: str, file_path: Path, success: bool = True):
        """Log file operations for debugging"""
        status = "SUCCESS" if success else "FAILED"
        logger.info(f"FILE_OP [{status}]: {operation} - {file_path}")