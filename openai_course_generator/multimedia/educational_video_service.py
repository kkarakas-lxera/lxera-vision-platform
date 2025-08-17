#!/usr/bin/env python3
"""
Educational Video Service
Main service that orchestrates the educational video generation pipeline
"""

import os
import sys
import json
import logging
import asyncio
from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime
import tempfile
import shutil

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from multimedia.educational_script_generator import EducationalScriptGenerator
from multimedia.slide_content_extractor import SlideContentExtractor
from multimedia.timeline_generator import TimelineGenerator
from multimedia.content_essence_extractor import ContentEssenceExtractor
from multimedia.database_integration import DatabaseMultimediaIntegrator
from database.content_manager import ContentManager
from tools.multimedia_tools import MultimediaManager, get_multimedia_manager
# Webhook notifier removed - unused
get_webhook_notifier = lambda: None  # Stub for compatibility

logger = logging.getLogger(__name__)

class EducationalVideoService:
    """Orchestrates the complete educational video generation pipeline"""
    
    def __init__(self, openai_api_key: Optional[str] = None):
        """Initialize the educational video service"""
        self.openai_api_key = openai_api_key or os.getenv('OPENAI_API_KEY')
        if not self.openai_api_key:
            raise ValueError("OpenAI API key is required")
        
        # Initialize components
        self.script_generator = EducationalScriptGenerator(self.openai_api_key)
        self.content_extractor = SlideContentExtractor(enable_gpt_enrichment=False)  # Disable GPT enrichment for speed
        self.timeline_generator = TimelineGenerator(self.openai_api_key)
        
        # Restored components
        self.essence_extractor = ContentEssenceExtractor()
        self.db_integrator = DatabaseMultimediaIntegrator()
        
        logger.info("✅ Educational Video Service initialized")
        
        # Database components
        self.content_manager = ContentManager()
        self.multimedia_manager = get_multimedia_manager()
        
        
        # Webhook notifier for progress tracking
        self.webhook_notifier = get_webhook_notifier()
        
        logger.info("Educational Video Service initialized with restored components")
    
    
    async def generate_educational_video(
        self,
        content_id: str,
        employee_context: Dict[str, Any],
        options: Optional[Dict[str, Any]] = None,
        output_dir: Optional[str] = None,
        progress_callback: Optional[callable] = None
    ) -> Dict[str, Any]:
        """
        Generate complete educational video from course content
        
        Args:
            content_id: ID of the content in cm_module_content
            employee_context: Employee information for personalization
            options: Generation options (voice, speed, theme, etc.)
            output_dir: Output directory for generated files
            progress_callback: Optional callback for progress updates
            
        Returns:
            Dictionary with video generation results
        """
        logger.info(f"Starting educational video generation for content: {content_id}")
        
        try:
            # Set default options
            options = options or {}
            # Support 'auto' for intelligent voice/speed selection
            voice = options.get('voice', 'auto')
            speed = options.get('speed', 'auto')
            design_theme = options.get('design_theme', 'professional')
            target_duration = options.get('target_duration')
            include_animations = options.get('include_animations', True)
            use_content_analysis = options.get('use_content_analysis', True)
            
            # Create output directory
            if not output_dir:
                output_dir = tempfile.mkdtemp(prefix='edu_video_')
            output_path = Path(output_dir)
            output_path.mkdir(parents=True, exist_ok=True)
            
            # Set session ID for webhook tracking
            if options.get('session_id'):
                self.webhook_notifier.set_session(options.get('session_id'))
            
            # Progress tracking
            if progress_callback:
                progress_callback(5, "Fetching content from database")
            
            # Webhook notification
            self.webhook_notifier.notify('initialization', 5, 'Starting video generation pipeline')
            
            # Step 1: Fetch content from database
            content = self.content_manager.get_module_content(content_id)
            if not content:
                raise ValueError(f"Content not found: {content_id}")
            
            logger.info(f"Processing module: {content['module_name']}")
            
            # Step 2: Generate educational script
            if progress_callback:
                progress_callback(15, "Generating educational script")
            
            self.webhook_notifier.notify_script_generation(15, 0)
            
            script = self.script_generator.generate_educational_script(
                content=content,
                employee_context=employee_context,
                target_duration=target_duration
            )
            
            self.webhook_notifier.notify_script_generation(20, len(script.slides))
            
            # Export script for reference
            script_path = output_path / 'script.json'
            self.script_generator.export_script_to_json(script, str(script_path))
            
            # Step 3: Extract slide content
            if progress_callback:
                progress_callback(25, "Extracting slide content")
            
            extracted_content = self.content_extractor.extract_slide_content(
                content=content,
                script_data={
                    'slides': [
                        {
                            'slide_id': slide.slide_id,
                            'speaker_notes': slide.speaker_notes,
                            'timing_cues': slide.timing_cues
                        }
                        for slide in script.slides
                    ]
                },
                course_plan=None,  # TODO: Fetch from database if available
                employee_context=employee_context
            )
            
            # Export extracted content
            extracted_path = output_path / 'extracted_content.json'
            self.content_extractor.export_to_json(extracted_content, str(extracted_path))
            
            
            # Step 5: Generate audio and timeline
            if progress_callback:
                progress_callback(60, "Generating narration audio")
            
            # Use enhanced timeline generation with content analysis
            if use_content_analysis:
                logger.info("Using enhanced audio generation with content analysis")
            
            timeline = await self.timeline_generator.generate_educational_timeline(
                script=script,
                extracted_content=extracted_content,
                output_dir=str(output_path),
                voice=voice,
                speed=speed
            )
            
            
            # Prepare simplified result with available components
            result = {
                'success': True,
                'content_id': content_id,
                'module_name': content['module_name'],
                'script_generated': True,
                'content_extracted': True,
                'audio_generated': timeline is not None,
                'total_duration': timeline.total_duration if timeline else 0,
                'duration_formatted': f"{int((timeline.total_duration if timeline else 0) // 60)}:{int((timeline.total_duration if timeline else 0) % 60):02d}",
                'output_directory': str(output_path),
                'audio_file': timeline.narration_file if timeline else None,
                'script_file': str(script_path),
                'extracted_content_file': str(extracted_path),
                'metadata': {
                    'employee_name': employee_context.get('name'),
                    'voice_used': voice,
                    'speech_speed': speed,
                    'generated_at': datetime.now().isoformat(),
                    'content_analysis_used': use_content_analysis
                }
            }
            
            if progress_callback:
                progress_callback(100, "Content processing complete")
            
            logger.info(f"Educational content processed successfully for: {content['module_name']}")
            return result
            
        except Exception as e:
            logger.error(f"Educational video generation failed: {e}", exc_info=True)
            return {
                'success': False,
                'error': str(e),
                'content_id': content_id,
                'module_name': content.get('module_name') if 'content' in locals() else 'Unknown'
            }
    
    def cleanup_temp_files(self, output_dir: str):
        """Clean up temporary files"""
        try:
            if output_dir and os.path.exists(output_dir) and 'edu_video_' in output_dir:
                shutil.rmtree(output_dir)
                logger.info(f"Cleaned up temporary directory: {output_dir}")
        except Exception as e:
            logger.warning(f"Failed to clean up temporary files: {e}")
    


async def test_educational_video_generation():
    """Test the educational video generation pipeline"""
    # Initialize service
    service = EducationalVideoService()
    
    # Test content ID (use a real one from your database)
    content_id = "c3225098-53f4-4b01-b162-d9ff9c795629"
    
    # Employee context
    employee_context = {
        "name": "Sarah Johnson",
        "role": "Financial Analyst",
        "level": "intermediate",
        "goals": "Senior Financial Analyst"
    }
    
    # Generation options
    options = {
        "voice": "nova",
        "speed": 1.0,
        "design_theme": "professional",
        "target_duration": 10,  # 10 minutes
        "include_animations": True
    }
    
    # Progress callback
    def progress_callback(percent, message):
        print(f"[{percent:3d}%] {message}")
    
    # Process content
    print("Starting educational content processing...")
    result = await service.generate_educational_video(
        content_id=content_id,
        employee_context=employee_context,
        options=options,
        progress_callback=progress_callback
    )
    
    if result['success']:
        print("\n✅ Educational content processed successfully!")
        print(f"Script generated: {result['script_generated']}")
        print(f"Content extracted: {result['content_extracted']}")
        print(f"Audio generated: {result['audio_generated']}")
        print(f"Duration: {result['duration_formatted']}")
        print(f"Output directory: {result['output_directory']}")
        if result.get('audio_file'):
            print(f"Audio file: {result['audio_file']}")
    else:
        print(f"\n❌ Content processing failed: {result['error']}")
    
    return result


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Run test
    asyncio.run(test_educational_video_generation())