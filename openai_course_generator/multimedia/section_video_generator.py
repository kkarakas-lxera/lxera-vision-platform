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
            'max_duration': 900,  # 15 minutes - Realistic tutorial duration
            'max_slides': 5,
            'voice': 'nova',  # Warm and friendly
            'theme': 'professional'
        },
        'practical_applications': {
            'max_duration': 900,  # 15 minutes - Realistic tutorial duration
            'max_slides': 8,
            'voice': 'onyx',  # Authoritative
            'theme': 'modern'
        },
        'case_studies': {
            'max_duration': 900,  # 15 minutes - Realistic tutorial duration
            'max_slides': 6,
            'voice': 'echo',  # Confident
            'theme': 'case_study'
        },
        'assessments': {
            'max_duration': 600,  # 10 minutes - Realistic assessment duration  
            'max_slides': 4,
            'voice': 'alloy',  # Neutral
            'theme': 'quiz'
        }
    }
    
    def __init__(self, educational_video_service):
        """Initialize with reference to main video service for enhanced Remotion generation"""
        self.video_service = educational_video_service
        # Only keep components needed for Remotion-based generation
        self.content_manager = educational_video_service.content_manager
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
        
        # NEW: Use enhanced Remotion video generation for realistic 15-minute tutorials
        logger.info(f"Generating enhanced Remotion video for {section_name}...")
        
        # Initialize Remotion generator
        from multimedia.remotion_video_generator import RemotionVideoGenerator
        remotion_generator = RemotionVideoGenerator()
        
        # Extract relevant content for this section
        section_text = self._get_section_text(section_content)
        
        # Generate enhanced tutorial video using the new pipeline
        video_path = remotion_generator.generate_tutorial_video(
            section_content=section_text,
            section_name=section_name,
            learner_name=employee_context.get('name', 'Learner'),
            learner_role=employee_context.get('position', 'Professional'),
            module_title=content.get('module_name', section_name),
            output_dir=output_dir,
            course_context={
                'title': content.get('module_name', section_name),
                'description': content.get('description', 'Professional training')
            },
            employee_id=employee_context.get('id')
        )
        
        # Get video duration
        duration = remotion_generator._get_audio_duration(video_path) if video_path.exists() else config['max_duration']
        
        # Create section video object
        section_video = SectionVideo(
            section_name=section_name,
            video_path=str(video_path),
            duration=duration,
            slide_count=0,  # Remotion videos don't use traditional slides
            metadata={
                'generation_method': 'remotion_enhanced',
                'voice': config['voice'],
                'theme': config['theme'],
                'word_count': len(section_text.split()) if section_text else 0,
                'generated_at': datetime.now().isoformat(),
                'realistic_duration': True,
                'multi_layer_teaching': True
            }
        )
        
        return section_video
    
    def _get_section_text(self, section_content: Dict[str, Any]) -> str:
        """Extract text content from section for tutorial generation"""
        text_parts = []
        
        # Extract text from various content fields
        if isinstance(section_content, dict):
            # Add description/overview
            if 'description' in section_content:
                text_parts.append(section_content['description'])
            
            # Add detailed content
            if 'content' in section_content:
                content = section_content['content']
                if isinstance(content, str):
                    text_parts.append(content)
                elif isinstance(content, dict):
                    # Extract text from structured content
                    for key, value in content.items():
                        if isinstance(value, str):
                            text_parts.append(value)
            
            # Add objectives if available
            if 'objectives' in section_content:
                objectives = section_content['objectives']
                if isinstance(objectives, list):
                    text_parts.extend(objectives)
                elif isinstance(objectives, str):
                    text_parts.append(objectives)
        
        elif isinstance(section_content, str):
            text_parts.append(section_content)
        
        return " ".join(text_parts) if text_parts else "Professional training content"
    
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