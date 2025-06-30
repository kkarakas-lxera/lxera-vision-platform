#!/usr/bin/env python3
"""
Section-Based Video Generator
Generates individual videos for each content section (introduction, practical, etc.)
"""

import os
import json
import logging
import asyncio
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from datetime import datetime
import tempfile
from pathlib import Path

logger = logging.getLogger(__name__)

@dataclass
class SectionVideo:
    """Represents a video for a single section"""
    section_name: str
    video_path: str
    duration: float
    slide_count: int
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    slides_urls: Optional[List[str]] = None
    audio_url: Optional[str] = None
    metadata: Dict[str, Any] = None

class SectionVideoGenerator:
    """Generates videos for individual content sections"""
    
    SECTION_CONFIGS = {
        'introduction': {
            'max_duration': 180,  # 3 minutes
            'max_slides': 5,
            'voice': 'nova',  # Warm and friendly
            'theme': 'professional'
        },
        'practical_applications': {
            'max_duration': 300,  # 5 minutes
            'max_slides': 8,
            'voice': 'onyx',  # Authoritative
            'theme': 'modern'
        },
        'case_studies': {
            'max_duration': 240,  # 4 minutes
            'max_slides': 6,
            'voice': 'echo',  # Confident
            'theme': 'case_study'
        },
        'assessments': {
            'max_duration': 120,  # 2 minutes
            'max_slides': 4,
            'voice': 'alloy',  # Neutral
            'theme': 'quiz'
        }
    }
    
    def __init__(self, educational_video_service):
        """Initialize with reference to main video service"""
        self.video_service = educational_video_service
        self.script_generator = educational_video_service.script_generator
        self.content_extractor = educational_video_service.content_extractor
        self.slide_generator = educational_video_service.slide_generator
        self.timeline_generator = educational_video_service.timeline_generator
        self.video_assembler = educational_video_service.video_assembler
        self.multimedia_manager = educational_video_service.multimedia_manager
        
    async def generate_section_videos(
        self,
        content: Dict[str, Any],
        employee_context: Dict[str, Any],
        sections_to_generate: Optional[List[str]] = None,
        output_dir: Optional[str] = None,
        progress_callback: Optional[callable] = None
    ) -> List[SectionVideo]:
        """
        Generate videos for each content section
        
        Args:
            content: Module content dictionary
            employee_context: Employee information
            sections_to_generate: List of sections to process (default: all)
            output_dir: Output directory
            progress_callback: Progress callback function
            
        Returns:
            List of SectionVideo objects
        """
        logger.info(f"Starting section-based video generation for: {content['module_name']}")
        
        # Create output directory
        if not output_dir:
            output_dir = tempfile.mkdtemp(prefix='section_videos_')
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Determine which sections to generate
        available_sections = self._get_available_sections(content)
        if sections_to_generate:
            sections = [s for s in sections_to_generate if s in available_sections]
        else:
            sections = available_sections
            
        logger.info(f"Will generate videos for sections: {sections}")
        
        # Generate video for each section
        section_videos = []
        total_sections = len(sections)
        
        for idx, section_name in enumerate(sections):
            if progress_callback:
                progress = int((idx / total_sections) * 90) + 5
                progress_callback(progress, f"Generating video for {section_name}")
                
            try:
                section_video = await self._generate_single_section_video(
                    content=content,
                    section_name=section_name,
                    employee_context=employee_context,
                    output_dir=output_path / section_name
                )
                section_videos.append(section_video)
                logger.info(f"✓ Generated video for section: {section_name}")
                
            except Exception as e:
                logger.error(f"Failed to generate video for section {section_name}: {e}")
                # Continue with other sections
                
        if progress_callback:
            progress_callback(95, "Uploading videos to storage")
            
        # Upload all videos and assets to Supabase Storage
        for video in section_videos:
            if os.path.exists(video.video_path):
                # Get content_id and employee info from the content
                content_id = content.get('content_id', 'default')
                employee_name = employee_context.get('name', 'default')
                
                # Upload complete section (video, slides, audio)
                from multimedia.supabase_storage_service import SupabaseStorageService
                storage_service = SupabaseStorageService(self.multimedia_manager.supabase)
                
                # Upload all section assets
                upload_result = await storage_service.upload_complete_section(
                    output_dir=str(output_path),
                    content_id=content_id,
                    section_name=video.section_name,
                    employee_name=employee_name
                )
                
                if upload_result['success']:
                    # Update video with Supabase Storage URLs
                    video.video_url = upload_result['uploads'].get('video', {}).get('public_url')
                    video.slides_urls = [
                        slide['public_url'] for slide in 
                        upload_result['uploads'].get('slides', {}).get('slides', [])
                    ]
                    video.audio_url = upload_result['uploads'].get('audio', {}).get('public_url')
                    
                    logger.info(f"✅ Complete section uploaded to Supabase Storage: {video.section_name}")
                else:
                    logger.error(f"Failed to upload section to storage: {upload_result.get('error')}")
                    video.video_url = None
                
        if progress_callback:
            progress_callback(100, "Section videos generated successfully")
            
        return section_videos
    
    async def _generate_single_section_video(
        self,
        content: Dict[str, Any],
        section_name: str,
        employee_context: Dict[str, Any],
        output_dir: Path
    ) -> SectionVideo:
        """Generate video for a single section"""
        logger.info(f"Generating video for section: {section_name}")
        
        # Get section config
        config = self.SECTION_CONFIGS.get(section_name, self.SECTION_CONFIGS['introduction'])
        
        # Create section-specific content
        section_content = self._extract_section_content(content, section_name)
        if not section_content:
            raise ValueError(f"No content found for section: {section_name}")
            
        # Create output directory
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # 1. Generate educational script for this section only
        logger.info(f"Generating script for {section_name}...")
        script = self.script_generator.generate_educational_script(
            content=section_content,
            employee_context=employee_context,
            target_duration=config['max_duration']
        )
        
        # Limit slides to max for section
        if len(script.slides) > config['max_slides']:
            script.slides = script.slides[:config['max_slides']]
            
        # 2. Extract slide content
        logger.info(f"Extracting slide content for {section_name}...")
        extracted_content = self.content_extractor.extract_slide_content(
            content=section_content,
            script_data={
                'slides': [s.__dict__ for s in script.slides],
                'learning_objectives': script.learning_objectives
            }
        )
        
        # 3. Generate slides
        logger.info(f"Generating slides for {section_name}...")
        slides_dir = output_dir / 'slides'
        slides_dir.mkdir(exist_ok=True)
        
        slide_metadata = self.slide_generator.generate_slide_deck(
            slide_notes=extracted_content.slide_notes,
            output_dir=str(slides_dir),
            design_theme=config['theme'],
            include_animations=True,
            employee_context=employee_context
        )
        
        # 4. Generate timeline with audio
        logger.info(f"Generating audio timeline for {section_name}...")
        timeline = await self.timeline_generator.generate_educational_timeline(
            script=script,
            extracted_content=extracted_content,
            output_dir=str(output_dir),
            voice=config['voice'],
            speed=1.0
        )
        
        # 5. Assemble video
        logger.info(f"Assembling video for {section_name}...")
        video_path = output_dir / f"{section_name}_video.mp4"
        
        video_result = await self.video_assembler.assemble_educational_video(
            timeline=timeline,
            slide_metadata=slide_metadata,
            output_path=str(video_path)
        )
        
        # Create section video object
        section_video = SectionVideo(
            section_name=section_name,
            video_path=str(video_path),
            duration=video_result.duration,
            slide_count=len(slide_metadata),
            metadata={
                'voice': config['voice'],
                'theme': config['theme'],
                'word_count': section_content.get('total_word_count', 0),
                'generated_at': datetime.now().isoformat()
            }
        )
        
        return section_video
    
    def _get_available_sections(self, content: Dict[str, Any]) -> List[str]:
        """Get list of available sections in content"""
        sections = []
        
        # Check for standard sections
        for section in ['introduction', 'practical_applications', 'case_studies', 'assessments']:
            if content.get(section) and len(content[section].strip()) > 50:  # Min content length
                sections.append(section)
                
        return sections
    
    def _extract_section_content(self, content: Dict[str, Any], section_name: str) -> Dict[str, Any]:
        """Extract content for a specific section"""
        section_text = content.get(section_name, '')
        if not section_text:
            return None
            
        # Create section-specific content dictionary
        section_content = {
            'content_id': f"{content['content_id']}_{section_name}",
            'module_name': f"{content['module_name']} - {section_name.replace('_', ' ').title()}",
            'module_number': content.get('module_number', 1),
            section_name: section_text,
            'sections': [{
                'section_name': section_name,
                'word_count': len(section_text.split())
            }],
            'total_word_count': len(section_text.split())
        }
        
        # Add metadata
        if 'metadata' in content:
            section_content['metadata'] = content['metadata']
            
        return section_content
    
    async def _upload_video(self, video_path: str, section_name: str, content_id: str = None, employee_name: str = "default") -> str:
        """Upload video to Supabase Storage and return URL"""
        try:
            # Import storage service
            from multimedia.supabase_storage_service import SupabaseStorageService
            
            storage_service = SupabaseStorageService(self.multimedia_manager.supabase)
            
            # Upload video to Supabase Storage
            result = await storage_service.upload_video(
                video_path=video_path,
                content_id=content_id or "default",
                section_name=section_name,
                employee_name=employee_name
            )
            
            if result['success']:
                logger.info(f"✅ Video uploaded to Supabase Storage: {result['public_url']}")
                return result['public_url']
            else:
                logger.error(f"Failed to upload video: {result.get('error')}")
                return None
                
        except Exception as e:
            logger.error(f"Failed to upload video: {e}")
            return None