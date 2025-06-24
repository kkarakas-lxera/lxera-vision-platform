#!/usr/bin/env python3
"""
Configuration System for Content Latest Pipeline
Centralized settings for all pipeline stages
"""

import os
from pathlib import Path
from typing import Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum

class QualityLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    PREMIUM = "premium"

class PipelineStage(Enum):
    CONTENT = "content"
    AUDIO = "audio"
    VIDEO = "video"
    DISPLAY = "display"

@dataclass
class APIConfig:
    """API configuration with hardcoded keys for testing"""
    openai_api_key: str = os.getenv('OPENAI_API_KEY', '')
    anthropic_api_key: str = ""  # Add if needed
    elevenlabs_api_key: str = ""  # Add if needed
    
    # No fallbacks - fail fast if APIs unavailable
    use_fallbacks: bool = False

@dataclass 
class ContentConfig:
    """Content generation configuration"""
    max_modules: int = 15
    target_words_per_module: int = 1500
    research_queries_limit: int = 5  # Reduced from 10
    quality_retries: int = 3
    enable_memory_enhancement: bool = True
    
@dataclass
class AudioConfig:
    """Audio generation configuration"""
    default_voice: str = "female"
    default_language: str = "en"
    speech_speed: float = 1.0
    target_duration_minutes: str = "5-7"
    summary_style: str = "detailed"  # concise, detailed, extensive
    enable_podcast_mode: bool = False

@dataclass
class VideoConfig:
    """Video generation configuration"""
    resolution: tuple = (1920, 1080)
    fps: int = 30
    video_codec: str = "libx264"
    audio_codec: str = "aac"
    enable_ai_backgrounds: bool = True
    animation_style: str = "professional"  # basic, professional, premium

@dataclass
class DisplayConfig:
    """Course display configuration"""
    enable_interactive_viewer: bool = True
    include_progress_tracking: bool = True
    enable_print_mode: bool = True
    responsive_design: bool = True

class PipelineConfig:
    """Main pipeline configuration"""
    
    def __init__(self, 
                 quality_level: QualityLevel = QualityLevel.HIGH,
                 enabled_stages: list = None):
        
        # Base paths
        self.base_dir = Path(__file__).parent.parent
        self.input_dir = self.base_dir / "input_data"
        self.output_dir = self.base_dir / "output"
        self.templates_dir = self.base_dir / "templates"
        
        # Quality level
        self.quality_level = quality_level
        
        # Enabled stages (all by default)
        self.enabled_stages = enabled_stages or [
            PipelineStage.CONTENT,
            PipelineStage.AUDIO, 
            PipelineStage.VIDEO,
            PipelineStage.DISPLAY
        ]
        
        # Component configurations
        self.api = APIConfig()
        self.content = self._get_content_config()
        self.audio = self._get_audio_config()
        self.video = self._get_video_config()
        self.display = DisplayConfig()
        
        # Logging
        self.log_level = "INFO"
        self.enable_progress_bar = True
        self.save_intermediate_files = True
        
    def _get_content_config(self) -> ContentConfig:
        """Get content config based on quality level"""
        config = ContentConfig()
        
        if self.quality_level == QualityLevel.LOW:
            config.max_modules = 8
            config.target_words_per_module = 800
            config.research_queries_limit = 3
        elif self.quality_level == QualityLevel.MEDIUM:
            config.max_modules = 12
            config.target_words_per_module = 1200
            config.research_queries_limit = 4
        elif self.quality_level == QualityLevel.HIGH:
            config.max_modules = 15
            config.target_words_per_module = 1500
            config.research_queries_limit = 5
        elif self.quality_level == QualityLevel.PREMIUM:
            config.max_modules = 20
            config.target_words_per_module = 2000
            config.research_queries_limit = 7
            
        return config
    
    def _get_audio_config(self) -> AudioConfig:
        """Get audio config based on quality level"""
        config = AudioConfig()
        
        if self.quality_level == QualityLevel.LOW:
            config.summary_style = "concise"
            config.target_duration_minutes = "3-5"
        elif self.quality_level == QualityLevel.MEDIUM:
            config.summary_style = "detailed"
            config.target_duration_minutes = "5-7"
        elif self.quality_level in [QualityLevel.HIGH, QualityLevel.PREMIUM]:
            config.summary_style = "extensive"
            config.target_duration_minutes = "8-10"
            config.enable_podcast_mode = True
            
        return config
    
    def _get_video_config(self) -> VideoConfig:
        """Get video config based on quality level"""
        config = VideoConfig()
        
        if self.quality_level == QualityLevel.LOW:
            config.fps = 24
            config.animation_style = "basic"
            config.enable_ai_backgrounds = False
        elif self.quality_level == QualityLevel.MEDIUM:
            config.fps = 30
            config.animation_style = "professional"
            config.enable_ai_backgrounds = True
        elif self.quality_level in [QualityLevel.HIGH, QualityLevel.PREMIUM]:
            config.fps = 30
            config.animation_style = "premium"
            config.enable_ai_backgrounds = True
            
        return config
    
    def get_output_path(self, employee_id: str, timestamp: str = None) -> Path:
        """Get output path for course"""
        if timestamp is None:
            from datetime import datetime
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
        return self.output_dir / "courses" / f"{employee_id}_{timestamp}"
    
    def is_stage_enabled(self, stage: PipelineStage) -> bool:
        """Check if a pipeline stage is enabled"""
        return stage in self.enabled_stages
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert config to dictionary"""
        return {
            "quality_level": self.quality_level.value,
            "enabled_stages": [stage.value for stage in self.enabled_stages],
            "api": {
                "openai_api_key": self.api.openai_api_key[:20] + "..." if self.api.openai_api_key else "",
                "use_fallbacks": self.api.use_fallbacks
            },
            "content": {
                "max_modules": self.content.max_modules,
                "target_words_per_module": self.content.target_words_per_module,
                "research_queries_limit": self.content.research_queries_limit
            },
            "audio": {
                "voice": self.audio.default_voice,
                "language": self.audio.default_language,
                "summary_style": self.audio.summary_style,
                "target_duration": self.audio.target_duration_minutes
            },
            "video": {
                "resolution": self.video.resolution,
                "fps": self.video.fps,
                "animation_style": self.video.animation_style,
                "enable_ai_backgrounds": self.video.enable_ai_backgrounds
            }
        }

# Default configuration instance
default_config = PipelineConfig()