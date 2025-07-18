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
from multimedia.educational_slide_generator import EducationalSlideGenerator
from multimedia.timeline_generator import TimelineGenerator
from multimedia.video_assembly_service import VideoAssemblyService, VideoSettings
from multimedia.section_video_generator import SectionVideoGenerator
from database.content_manager import ContentManager
from tools.multimedia_tools import MultimediaManager, get_multimedia_manager

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
        self.content_extractor = SlideContentExtractor(enable_gpt_enrichment=True)
        self.slide_generator = EducationalSlideGenerator(self.openai_api_key)
        self.timeline_generator = TimelineGenerator(self.openai_api_key)
        self.video_assembler = VideoAssemblyService()
        
        # Database components
        self.content_manager = ContentManager()
        self.multimedia_manager = get_multimedia_manager()
        
        # Section-based generator
        self.section_generator = SectionVideoGenerator(self)
        
        logger.info("Educational Video Service initialized")
    
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
            
            # Progress tracking
            if progress_callback:
                progress_callback(5, "Fetching content from database")
            
            # Step 1: Fetch content from database
            content = self.content_manager.get_module_content(content_id)
            if not content:
                raise ValueError(f"Content not found: {content_id}")
            
            logger.info(f"Processing module: {content['module_name']}")
            
            # Step 2: Generate educational script
            if progress_callback:
                progress_callback(15, "Generating educational script")
            
            script = self.script_generator.generate_educational_script(
                content=content,
                employee_context=employee_context,
                target_duration=target_duration
            )
            
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
            
            # Step 4: Generate slides
            if progress_callback:
                progress_callback(40, "Creating educational slides")
            
            slides_dir = str(output_path / 'slides')
            slide_metadata = self.slide_generator.generate_slide_deck(
                slide_notes=extracted_content.slide_notes,
                output_dir=slides_dir,
                design_theme=design_theme,
                include_animations=include_animations,
                employee_context=employee_context
            )
            
            # Export slide manifest
            slide_manifest_path = output_path / 'slides' / 'manifest.json'
            self.slide_generator.export_slide_manifest(slide_metadata, str(slide_manifest_path))
            
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
            
            # Step 6: Assemble video
            if progress_callback:
                progress_callback(80, "Assembling educational video")
            
            video_filename = f"{content['module_name'].lower().replace(' ', '_')}_educational.mp4"
            video_path = output_path / video_filename
            
            video_settings = VideoSettings(
                resolution=(1920, 1080),
                fps=30,
                video_codec='libx264',
                preset='medium',
                crf=23
            )
            
            assembled_video = await self.video_assembler.assemble_educational_video(
                timeline=timeline,
                slide_metadata=slide_metadata,
                output_path=str(video_path),
                settings=video_settings,
                progress_callback=lambda percent, msg: progress_callback(80 + int(percent * 0.15), msg) if progress_callback else None
            )
            
            if not assembled_video.success:
                raise RuntimeError(f"Video assembly failed: {assembled_video.error_message}")
            
            # Step 7: Create thumbnail
            if progress_callback:
                progress_callback(95, "Creating thumbnail")
            
            thumbnail_path = output_path / 'thumbnail.jpg'
            self.video_assembler.create_thumbnail(
                assembled_video.video_path,
                str(thumbnail_path),
                timestamp=5.0
            )
            
            # Step 8: Store results in database
            if progress_callback:
                progress_callback(98, "Saving to database")
            
            # Register all multimedia assets in database with Supabase storage
            if hasattr(self, 'multimedia_manager') and timeline:
                logger.info("📦 Registering multimedia assets in database...")
                
                # Register main video asset
                video_asset_id = self.multimedia_manager.register_multimedia_asset(
                    session_id=options.get('session_id'),
                    content_id=content_id,
                    course_id=content_id,
                    module_name=content['module_name'],
                    asset_type='video',
                    file_path=assembled_video.video_path,
                    file_name=video_filename,
                    section_name='complete_module',
                    duration_seconds=assembled_video.duration,
                    file_size_bytes=assembled_video.file_size,
                    mime_type='video/mp4',
                    generation_config={
                        'voice': options.get('voice'),
                        'speed': options.get('speed'),
                        'design_theme': options.get('design_theme'),
                        'target_duration': options.get('target_duration'),
                        'use_content_analysis': options.get('use_content_analysis', True),
                        'actual_duration': timeline.total_duration,
                        'complexity_adjusted': True
                    },
                    company_id=options.get('company_id', '67d7bff4-1149-4f37-952e-af1841fb67fa')
                )
                
                # Register audio asset
                if timeline.narration_file and os.path.exists(timeline.narration_file):
                    audio_asset_id = self.multimedia_manager.register_multimedia_asset(
                        session_id=options.get('session_id'),
                        content_id=content_id,
                        asset_type='audio',
                        file_path=timeline.narration_file,
                        file_name=Path(timeline.narration_file).name,
                        section_name='complete_module',
                        duration_seconds=timeline.total_duration,
                        mime_type='audio/mpeg',
                        company_id=options.get('company_id', '67d7bff4-1149-4f37-952e-af1841fb67fa')
                    )
                
                # Register slide assets
                slides_dir = output_path / 'slides'
                if slides_dir.exists():
                    for slide_file in slides_dir.glob('*.png'):
                        slide_asset_id = self.multimedia_manager.register_multimedia_asset(
                            session_id=options.get('session_id'),
                            content_id=content_id,
                            asset_type='slide',
                            file_path=str(slide_file),
                            file_name=slide_file.name,
                            section_name='slides',
                            mime_type='image/png',
                            company_id=options.get('company_id', '67d7bff4-1149-4f37-952e-af1841fb67fa')
                        )
                
                # Register additional assets (script, timeline, etc.)
                additional_assets = [
                    (script_path, 'script', 'application/json'),
                    (extracted_path, 'extracted_content', 'application/json'),
                    (thumbnail_path, 'thumbnail', 'image/jpeg')
                ]
                
                for asset_path, asset_type, mime_type in additional_assets:
                    if asset_path.exists():
                        self.multimedia_manager.register_multimedia_asset(
                            session_id=options.get('session_id'),
                            content_id=content_id,
                            asset_type=asset_type,
                            file_path=str(asset_path),
                            file_name=asset_path.name,
                            section_name='metadata',
                            mime_type=mime_type,
                            company_id=options.get('company_id', '67d7bff4-1149-4f37-952e-af1841fb67fa')
                        )
                
                # Update session status
                if options.get('session_id'):
                    self.multimedia_manager.update_session_status(
                        session_id=options.get('session_id'),
                        status='completed',
                        current_stage='assets_registered',
                        progress_percentage=100,
                        video_files_generated=1,
                        audio_files_generated=1,
                        slides_generated=len(slide_metadata),
                        total_assets_generated=len(slide_metadata) + 4  # video + audio + script + thumbnail
                    )
                
                logger.info(f"✅ Successfully registered {len(slide_metadata) + 4} multimedia assets")
                
                # Log timing accuracy metrics
                if timeline:
                    estimated_total = sum(slide.duration_estimate for slide in script.slides)
                    actual_total = timeline.total_duration
                    accuracy_percentage = (min(estimated_total, actual_total) / max(estimated_total, actual_total)) * 100
                    logger.info(f"Timing accuracy: {accuracy_percentage:.1f}% (Estimated: {estimated_total:.1f}s, Actual: {actual_total:.1f}s)")
            
            # Prepare result
            result = {
                'success': True,
                'content_id': content_id,
                'module_name': content['module_name'],
                'timeline_id': timeline.timeline_id,
                'video_path': assembled_video.video_path,
                'video_url': f"/multimedia/videos/{video_filename}",  # Relative URL
                'audio_url': f"/multimedia/audio/{Path(timeline.narration_file).name}",
                'slides_url': f"/multimedia/slides/",
                'timeline_url': f"/multimedia/timeline.json",
                'thumbnail_path': str(thumbnail_path),
                'total_duration': timeline.total_duration,
                'duration_formatted': f"{int(timeline.total_duration // 60)}:{int(timeline.total_duration % 60):02d}",
                'video_duration': assembled_video.duration,
                'video_file_size': assembled_video.file_size,
                'video_resolution': assembled_video.metadata.get('resolution', '1920x1080'),
                'video_fps': assembled_video.metadata.get('fps', 30),
                'slide_count': len(slide_metadata),
                'narration_file': timeline.narration_file,
                'audio_segments': len(timeline.audio_segments),
                'slide_transitions': len(timeline.slide_transitions),
                'assets_generated': 2 + len(slide_metadata),  # video + audio + slides
                'output_directory': str(output_path),
                'metadata': {
                    'employee_name': employee_context.get('name'),
                    'voice_used': voice,
                    'speech_speed': speed,
                    'design_theme': design_theme,
                    'include_animations': include_animations,
                    'generated_at': datetime.now().isoformat(),
                    'content_analysis_used': use_content_analysis
                },
                'timing_analysis': {
                    'total_duration': timeline.total_duration,
                    'average_slide_duration': timeline.total_duration / len(script.slides) if script.slides else 0,
                    'complexity_adjusted': True
                }
            }
            
            if progress_callback:
                progress_callback(100, "Video generation complete")
            
            logger.info(f"Educational video generated successfully: {video_path}")
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
    
    async def generate_section_videos(
        self,
        content_id: str,
        employee_context: Dict[str, Any],
        sections: Optional[List[str]] = None,
        options: Optional[Dict[str, Any]] = None,
        output_dir: Optional[str] = None,
        progress_callback: Optional[callable] = None
    ) -> Dict[str, Any]:
        """
        Generate individual videos for each content section
        
        Args:
            content_id: ID of the content in cm_module_content
            employee_context: Employee information for personalization
            sections: List of sections to generate (default: all)
            options: Generation options
            output_dir: Output directory
            progress_callback: Progress callback
            
        Returns:
            Dictionary with section video results
        """
        logger.info(f"Starting section-based video generation for content: {content_id}")
        
        try:
            # Fetch content
            content = self.content_manager.get_module_content(content_id)
            if not content:
                raise ValueError(f"Content not found: {content_id}")
            
            # Create multimedia session if session_id provided
            session_id = options.get('session_id') if options else None
            if session_id:
                self.multimedia_manager.create_multimedia_session(
                    session_id=session_id,
                    content_id=content_id,
                    module_name=content['module_name'],
                    employee_name=employee_context['name'],
                    company_id=options.get('company_id', '67d7bff4-1149-4f37-952e-af1841fb67fa'),
                    content_sections=sections or ['introduction', 'practical_applications', 'case_studies', 'assessments']
                )
                
            # Generate section videos
            section_videos = await self.section_generator.generate_section_videos(
                content=content,
                employee_context=employee_context,
                sections_to_generate=sections,
                output_dir=output_dir,
                progress_callback=progress_callback
            )
            
            # Store results in database
            for video in section_videos:
                if hasattr(self, 'multimedia_manager'):
                    # Get file size
                    file_size_bytes = os.path.getsize(video.video_path) if os.path.exists(video.video_path) else 0
                    
                    asset_id = self.multimedia_manager.register_multimedia_asset(
                        session_id=options.get('session_id') if options else None,
                        content_id=content_id,
                        course_id=content_id,
                        module_name=f"{content['module_name']} - {video.section_name}",
                        asset_type='video',
                        asset_category='section_video',
                        file_path=video.video_url or video.video_path,  # Use Supabase URL if available
                        file_name=Path(video.video_path).name,
                        section_name=video.section_name,
                        duration_seconds=video.duration,
                        file_size_bytes=file_size_bytes,
                        mime_type='video/mp4',
                        company_id=options.get('company_id', '67d7bff4-1149-4f37-952e-af1841fb67fa'),
                        generation_config={
                            'voice': video.metadata.get('voice') if video.metadata else None,
                            'theme': video.metadata.get('theme') if video.metadata else None,
                            'slide_count': video.slide_count,
                            'supabase_urls': {
                                'video_url': video.video_url,
                                'audio_url': getattr(video, 'audio_url', None),
                                'slides_urls': getattr(video, 'slides_urls', [])
                            }
                        }
                    )
                    
                    self.multimedia_manager.update_asset_status(
                        asset_id=asset_id,
                        status='processed'
                    )
            
            return {
                'success': True,
                'content_id': content_id,
                'module_name': content['module_name'],
                'section_videos': [
                    {
                        'section': video.section_name,
                        'video_path': video.video_path,
                        'video_url': video.video_url,
                        'audio_url': getattr(video, 'audio_url', None),
                        'slides_urls': getattr(video, 'slides_urls', []),
                        'duration': video.duration,
                        'slide_count': video.slide_count,
                        'metadata': video.metadata,
                        'storage_type': 'supabase' if video.video_url else 'local'
                    }
                    for video in section_videos
                ],
                'total_sections': len(section_videos),
                'output_dir': str(output_dir) if output_dir else None
            }
            
        except Exception as e:
            logger.error(f"Section video generation failed: {e}", exc_info=True)
            return {
                'success': False,
                'error': str(e),
                'content_id': content_id
            }


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
    
    # Generate video
    print("Starting educational video generation...")
    result = await service.generate_educational_video(
        content_id=content_id,
        employee_context=employee_context,
        options=options,
        progress_callback=progress_callback
    )
    
    if result['success']:
        print("\n✅ Educational video generated successfully!")
        print(f"Video path: {result['video_path']}")
        print(f"Duration: {result['duration_formatted']}")
        print(f"Slides: {result['slide_count']}")
        print(f"File size: {result['video_file_size'] / 1024 / 1024:.2f} MB")
        print(f"Output directory: {result['output_directory']}")
    else:
        print(f"\n❌ Video generation failed: {result['error']}")
    
    return result


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Run test
    asyncio.run(test_educational_video_generation())