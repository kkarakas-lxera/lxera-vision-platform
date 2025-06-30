#!/usr/bin/env python3
"""
Generate Course Video for Real Employee
Integrates with the multimedia management system
"""

import os
import asyncio
import logging
from pathlib import Path
from datetime import datetime
from supabase import create_client, Client
from typing import Optional, Dict, Any
import uuid

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Import multimedia components
from multimedia.educational_script_generator import EducationalScriptGenerator
from multimedia.educational_slide_generator import EducationalSlideGenerator
from multimedia.timeline_generator import TimelineGenerator
from multimedia.video_assembly_service import VideoAssemblyService

logger = logging.getLogger(__name__)

class CourseVideoGenerator:
    """Generates course videos integrated with multimedia management system"""
    
    def __init__(self):
        # Initialize Supabase client
        url = os.getenv('VITE_SUPABASE_URL')
        key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        if not url or not key:
            raise ValueError("Missing Supabase credentials")
        
        self.supabase: Client = create_client(url, key)
        
        # Initialize multimedia components
        api_key = os.getenv('OPENAI_API_KEY')
        self.script_generator = EducationalScriptGenerator(api_key)
        self.slide_generator = EducationalSlideGenerator(api_key)
        self.timeline_generator = TimelineGenerator(api_key)
        self.video_service = VideoAssemblyService()
        
    async def generate_course_video(
        self, 
        employee_name: str,
        module_id: str,
        company_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate course video with full multimedia management integration (DEPRECATED - use generate_section_video)"""
        # This method is kept for backward compatibility
        # New implementations should use generate_section_video for focused learning
        pass

    async def generate_all_section_videos(
        self, 
        employee_name: str,
        module_id: str,
        company_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate videos for all sections in a module"""
        
        logger.info(f"Generating section-based videos for {employee_name} - Module: {module_id}")
        
        try:
            # 1. Fetch employee data
            employee_result = self.supabase.table('employees').select(
                '*, users!employees_user_id_fkey(id, full_name, email)'
            ).execute()
            
            employee = None
            for emp in employee_result.data:
                if emp.get('users') and employee_name.lower() in emp['users']['full_name'].lower():
                    employee = emp
                    break
            
            if not employee:
                raise ValueError(f"Employee not found: {employee_name}")
            
            # Get company_id from employee if not provided
            if not company_id:
                company_id = employee.get('company_id')
            
            logger.info(f"Found employee: {employee['users']['full_name']} (Company: {company_id})")
            
            # 2. Fetch module content
            content_result = self.supabase.table('cm_module_content').select('*').eq(
                'content_id', module_id
            ).execute()
            
            if not content_result.data:
                raise ValueError(f"Module content not found: {module_id}")
            
            content = content_result.data[0]
            module_name = content.get('module_name', 'Unknown Module')
            
            # 3. Extract content sections with actual content
            content_sections = []
            section_fields = ['introduction', 'core_content', 'practical_applications', 'case_studies', 'assessments']
            
            for section_field in section_fields:
                section_content = content.get(section_field)
                if section_content and isinstance(section_content, str) and len(section_content.strip()) > 100:
                    content_sections.append({
                        'name': section_field,
                        'content': section_content,
                        'word_count': len(section_content.split())
                    })
            
            logger.info(f"Found {len(content_sections)} sections with content:")
            for section in content_sections:
                logger.info(f"  - {section['name']}: {section['word_count']} words")
            
            # 4. Generate videos for each section
            section_results = []
            
            for section in content_sections:
                try:
                    logger.info(f"\n=== Generating video for section: {section['name']} ===")
                    
                    section_result = await self.generate_section_video(
                        employee_name,
                        module_id,
                        section['name'],
                        section['content'],
                        module_name,
                        company_id
                    )
                    
                    section_results.append({
                        'section_name': section['name'],
                        'success': section_result['success'],
                        'session_id': section_result.get('session_id'),
                        'video_url': section_result.get('video_url'),
                        'duration': section_result.get('duration'),
                        'assets': section_result.get('assets')
                    })
                    
                    logger.info(f"✅ Section '{section['name']}' completed successfully")
                    
                except Exception as e:
                    logger.error(f"❌ Section '{section['name']}' failed: {e}")
                    section_results.append({
                        'section_name': section['name'],
                        'success': False,
                        'error': str(e)
                    })
            
            # 5. Summary
            successful_sections = [r for r in section_results if r['success']]
            failed_sections = [r for r in section_results if not r['success']]
            
            logger.info(f"\n=== SECTION VIDEO GENERATION SUMMARY ===")
            logger.info(f"Total sections processed: {len(section_results)}")
            logger.info(f"Successful: {len(successful_sections)}")
            logger.info(f"Failed: {len(failed_sections)}")
            
            return {
                'success': len(successful_sections) > 0,
                'employee': employee['users']['full_name'],
                'module': module_name,
                'company_id': company_id,
                'sections_processed': len(section_results),
                'sections_successful': len(successful_sections),
                'sections_failed': len(failed_sections),
                'section_results': section_results
            }
            
        except Exception as e:
            logger.error(f"Section-based video generation failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def generate_section_video(
        self, 
        employee_name: str,
        module_id: str,
        section_name: str,
        section_content: str,
        module_name: str,
        company_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate video for a single section"""
        
        logger.info(f"Generating section video: {section_name} for {employee_name}")
        
        try:
            # 1. Get employee context (simplified since already passed in)
            employee_context = {
                'name': employee_name,
                'role': 'Professional',
                'department': '',
                'position': '',
                'company_id': company_id
            }
            
            # 2. Create multimedia session for this section
            session_data = {
                'content_id': module_id,
                'company_id': company_id,
                'session_type': 'full_generation',  # Use valid session type
                'module_name': f"{module_name} - {section_name.replace('_', ' ').title()}",
                'employee_name': employee_name,
                'generation_config': {
                    'voice': 'fable',
                    'theme': 'educational',
                    'animations': False,
                    'transitions': True,
                    'section_name': section_name
                },
                'content_sections': [section_name],
                'status': 'started',
                'current_stage': 'initialization'
            }
            
            session_result = self.supabase.table('mm_multimedia_sessions').insert(session_data).execute()
            session_id = session_result.data[0]['session_id']
            logger.info(f"Created section multimedia session: {session_id}")
            
            # 3. Create temporary working directory
            temp_dir = Path(f'/tmp/section_video_{session_id}')
            temp_dir.mkdir(parents=True, exist_ok=True)
            
            try:
                # 4. Generate section-based educational script (NEW)
                logger.info(f"Generating section script for: {section_name}")
                script = self.script_generator.generate_section_script(
                    section_name=section_name,
                    section_content=section_content,
                    module_name=module_name,
                    employee_context=employee_context,
                    target_duration=4  # 4 minutes for optimal microlearning
                )
                
                # Export script
                script_path = temp_dir / 'section_script.json'
                self.script_generator.export_script_to_json(script, str(script_path))
                
                # 5. Generate slides
                slides_dir = temp_dir / 'slides'
                slides_dir.mkdir(exist_ok=True)
                
                slide_assets = []
                for slide in script.slides:
                    slide_path = slides_dir / f"slide_{slide.slide_number:03d}.png"
                    
                    metadata = self.slide_generator.create_slide_from_script(
                        slide_number=slide.slide_number,
                        title=slide.title,
                        bullet_points=slide.bullet_points,
                        output_path=str(slide_path),
                        theme='educational',
                        speaker_notes=slide.speaker_notes
                    )
                    
                    # Save slide asset to database
                    asset_data = {
                        'session_id': session_id,
                        'content_id': module_id,
                        'company_id': company_id,
                        'asset_type': 'slide',
                        'asset_name': f"Slide {slide.slide_number}: {slide.title}",
                        'file_path': str(slide_path),
                        'file_size_bytes': slide_path.stat().st_size,
                        'mime_type': 'image/png',
                        'section_name': section_name,
                        'slide_number': slide.slide_number,
                        'generation_config': metadata,
                        'status': 'generated'
                    }
                    
                    asset_result = self.supabase.table('mm_multimedia_assets').insert(asset_data).execute()
                    slide_assets.append(asset_result.data[0])
                
                # 6. Generate narration timeline
                audio_dir = temp_dir / 'audio'
                audio_dir.mkdir(exist_ok=True)
                
                class MockExtractedContent:
                    def __init__(self):
                        self.timing_map = {f"slide_{i+1}": i * 10.0 for i in range(len(script.slides))}
                
                timeline = await self.timeline_generator.generate_educational_timeline(
                    script,
                    MockExtractedContent(),
                    str(temp_dir),
                    voice='fable',
                    speed=0.95
                )
                
                # 7. Assemble video
                video_filename = f"{session_id}_{section_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp4"
                video_path = temp_dir / video_filename
                
                # Prepare slide metadata for assembly
                slide_metadata = []
                for slide in script.slides:
                    slide_path = slides_dir / f"slide_{slide.slide_number:03d}.png"
                    slide_metadata.append({
                        'slide_number': slide.slide_number,
                        'file_path': str(slide_path),
                        'title': slide.title,
                        'theme': 'educational',
                        'animations': False
                    })
                
                result = await self.video_service.assemble_educational_video(
                    timeline,
                    slide_metadata,
                    str(video_path)
                )
                
                if not result.success:
                    raise RuntimeError(f"Video assembly failed: {result.error_message}")
                
                # 8. Save video asset
                video_asset_data = {
                    'session_id': session_id,
                    'content_id': module_id,
                    'company_id': company_id,
                    'asset_type': 'video',
                    'asset_name': f"{module_name} - {section_name.replace('_', ' ').title()} Video",
                    'file_path': str(video_path),
                    'file_size_bytes': result.file_size,
                    'mime_type': 'video/mp4',
                    'section_name': section_name,
                    'duration_seconds': result.duration,
                    'generation_config': {
                        'resolution': result.metadata.get('resolution'),
                        'fps': result.metadata.get('fps'),
                        'codec': result.metadata.get('video_codec'),
                        'section_type': script.metadata.get('section_type')
                    },
                    'quality_metrics': {
                        'duration': result.duration,
                        'file_size': result.file_size,
                        'slide_count': len(slide_metadata)
                    },
                    'status': 'generated'
                }
                
                video_asset_result = self.supabase.table('mm_multimedia_assets').insert(video_asset_data).execute()
                video_asset_id = video_asset_result.data[0]['asset_id']
                
                # 9. Upload to storage with section-based organization
                logger.info("Uploading section assets to multimedia-assets...")
                
                # Upload slides
                for i, slide_asset in enumerate(slide_assets):
                    slide_path = slides_dir / f"slide_{i+1:03d}.png"
                    if slide_path.exists():
                        with open(slide_path, 'rb') as f:
                            slide_data = f.read()
                        
                        # Section-based storage path
                        slide_storage_path = f"{company_id}/{employee_context['name'].replace(' ', '_')}/sections/{module_id}/{section_name}/slides/slide_{i+1:03d}.png"
                        
                        try:
                            self.supabase.storage.from_('multimedia-assets').upload(
                                slide_storage_path,
                                slide_data,
                                {'content-type': 'image/png'}
                            )
                        except Exception as e:
                            if 'already exists' in str(e):
                                self.supabase.storage.from_('multimedia-assets').update(
                                    slide_storage_path,
                                    slide_data,
                                    {'content-type': 'image/png'}
                                )
                            else:
                                raise
                        
                        slide_url = self.supabase.storage.from_('multimedia-assets').get_public_url(slide_storage_path)
                        
                        # Update slide asset with URL
                        self.supabase.table('mm_multimedia_assets').update({
                            'storage_bucket': 'multimedia-assets',
                            'storage_path': slide_storage_path,
                            'public_url': slide_url
                        }).eq('asset_id', slide_asset['asset_id']).execute()
                
                # Upload audio segments
                for segment in timeline.audio_segments:
                    if Path(segment.audio_file).exists():
                        with open(segment.audio_file, 'rb') as f:
                            audio_data = f.read()
                        
                        audio_storage_path = f"{company_id}/{employee_context['name'].replace(' ', '_')}/sections/{module_id}/{section_name}/audio/{Path(segment.audio_file).name}"
                        
                        try:
                            self.supabase.storage.from_('multimedia-assets').upload(
                                audio_storage_path,
                                audio_data,
                                {'content-type': 'audio/mpeg'}
                            )
                        except Exception as e:
                            if 'already exists' in str(e):
                                self.supabase.storage.from_('multimedia-assets').update(
                                    audio_storage_path,
                                    audio_data,
                                    {'content-type': 'audio/mpeg'}
                                )
                            else:
                                raise
                
                # Upload final video
                with open(video_path, 'rb') as f:
                    video_data = f.read()
                
                # Section-based video storage
                video_storage_path = f"{company_id}/{employee_context['name'].replace(' ', '_')}/sections/{module_id}/{section_name}/videos/{video_filename}"
                
                try:
                    self.supabase.storage.from_('multimedia-assets').upload(
                        video_storage_path,
                        video_data,
                        {'content-type': 'video/mp4'}
                    )
                except Exception as e:
                    if 'already exists' in str(e):
                        self.supabase.storage.from_('multimedia-assets').update(
                            video_storage_path,
                            video_data,
                            {'content-type': 'video/mp4'}
                        )
                    else:
                        raise
                
                public_url = self.supabase.storage.from_('multimedia-assets').get_public_url(video_storage_path)
                
                # Update asset with public URL
                self.supabase.table('mm_multimedia_assets').update({
                    'storage_bucket': 'multimedia-assets',
                    'storage_path': video_storage_path,
                    'public_url': public_url,
                    'status': 'processed'
                }).eq('asset_id', video_asset_id).execute()
                
                # 10. Update session as completed
                self.supabase.table('mm_multimedia_sessions').update({
                    'status': 'completed',
                    'current_stage': 'completed',
                    'progress_percentage': 100
                }).eq('session_id', session_id).execute()
                
                logger.info(f"✅ Section video successfully generated!")
                logger.info(f"📹 Video URL: {public_url}")
                logger.info(f"⏱️  Duration: {result.duration:.1f}s")
                logger.info(f"📊 Section: {section_name} ({len(section_content.split())} words)")
                
                return {
                    'success': True,
                    'session_id': session_id,
                    'video_url': public_url,
                    'duration': result.duration,
                    'file_size': result.file_size,
                    'section_name': section_name,
                    'section_type': script.metadata.get('section_type'),
                    'learning_objectives': script.learning_objectives,
                    'assets': {
                        'slides': len(slide_assets),
                        'audio_segments': len(timeline.audio_segments),
                        'video': 1
                    }
                }
                
            finally:
                # Clean up temporary files
                import shutil
                shutil.rmtree(temp_dir)
                
        except Exception as e:
            logger.error(f"Section video generation failed: {e}")
            
            # Update session as failed
            if 'session_id' in locals():
                self.supabase.table('mm_multimedia_sessions').update({
                    'status': 'failed',
                    'error_details': str(e)
                }).eq('session_id', session_id).execute()
            
            return {
                'success': False,
                'error': str(e)
            }
            
            session_result = self.supabase.table('mm_multimedia_sessions').insert(session_data).execute()
            session_id = session_result.data[0]['session_id']
            logger.info(f"Created multimedia session: {session_id}")
            
            # 4. Create temporary working directory
            temp_dir = Path(f'/tmp/course_video_{session_id}')
            temp_dir.mkdir(parents=True, exist_ok=True)
            
            try:
                # 5. Update session progress
                self._update_session(session_id, {
                    'current_stage': 'script_generation',
                    'progress_percentage': 10
                })
                
                # 6. Generate educational script
                employee_context = {
                    'id': employee['id'],
                    'name': employee['users']['full_name'],
                    'role': employee.get('employee_role', 'Professional'),
                    'department': employee.get('department', ''),
                    'position': employee.get('position', ''),
                    'company_id': company_id
                }
                
                script = self.script_generator.generate_educational_script(
                    content,
                    employee_context,
                    target_duration=5
                )
                
                # Export script
                script_path = temp_dir / 'script.json'
                self.script_generator.export_script_to_json(script, str(script_path))
                
                # 7. Update session progress - slides
                self._update_session(session_id, {
                    'current_stage': 'slide_generation',
                    'progress_percentage': 30
                })
                
                # 8. Generate slides
                slides_dir = temp_dir / 'slides'
                slides_dir.mkdir(exist_ok=True)
                
                slide_assets = []
                for slide in script.slides:
                    slide_path = slides_dir / f"slide_{slide.slide_number:03d}.png"
                    
                    metadata = self.slide_generator.create_slide_from_script(
                        slide_number=slide.slide_number,
                        title=slide.title,
                        bullet_points=slide.bullet_points,
                        output_path=str(slide_path),
                        theme='educational',
                        speaker_notes=slide.speaker_notes
                    )
                    
                    # Save slide asset to database
                    asset_data = {
                        'session_id': session_id,
                        'content_id': module_id,
                        'company_id': company_id,
                        'asset_type': 'slide',
                        'asset_name': f"Slide {slide.slide_number}: {slide.title}",
                        'file_path': str(slide_path),
                        'file_size_bytes': slide_path.stat().st_size,
                        'mime_type': 'image/png',
                        'section_name': 'full_module',
                        'slide_number': slide.slide_number,
                        'generation_config': metadata,
                        'status': 'generated'
                    }
                    
                    asset_result = self.supabase.table('mm_multimedia_assets').insert(asset_data).execute()
                    slide_assets.append(asset_result.data[0])
                    
                    metadata['animations'] = False
                    metadata['asset_id'] = asset_result.data[0]['asset_id']
                
                # 9. Update session progress - audio
                self._update_session(session_id, {
                    'current_stage': 'audio_generation',
                    'progress_percentage': 50,
                    'slides_generated': len(slide_assets)
                })
                
                # 10. Generate narration timeline
                audio_dir = temp_dir / 'audio'
                audio_dir.mkdir(exist_ok=True)
                
                class MockExtractedContent:
                    def __init__(self):
                        self.timing_map = {f"slide_{i+1}": i * 10.0 for i in range(len(script.slides))}
                
                timeline = await self.timeline_generator.generate_educational_timeline(
                    script,
                    MockExtractedContent(),
                    str(temp_dir),
                    voice='fable',
                    speed=0.95
                )
                
                # Save audio assets
                for segment in timeline.audio_segments:
                    # Calculate duration from start and end time
                    duration = segment.end_time - segment.start_time
                    
                    audio_asset_data = {
                        'session_id': session_id,
                        'content_id': module_id,
                        'company_id': company_id,
                        'asset_type': 'audio',
                        'asset_name': f"Audio segment: {segment.segment_id}",
                        'file_path': segment.audio_file,
                        'file_size_bytes': Path(segment.audio_file).stat().st_size,
                        'mime_type': 'audio/mpeg',
                        'section_name': segment.segment_id,
                        'duration_seconds': duration,
                        'generation_config': {
                            'voice': segment.voice,
                            'speed': segment.speed
                        },
                        'status': 'generated'
                    }
                    
                    self.supabase.table('mm_multimedia_assets').insert(audio_asset_data).execute()
                
                # 11. Update session progress - video assembly
                self._update_session(session_id, {
                    'current_stage': 'video_assembly',
                    'progress_percentage': 70,
                    'audio_files_generated': len(timeline.audio_segments)
                })
                
                # 12. Assemble video
                video_filename = f"{session_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp4"
                video_path = temp_dir / video_filename
                
                # Prepare slide metadata for assembly
                slide_metadata = []
                for slide in script.slides:
                    slide_path = slides_dir / f"slide_{slide.slide_number:03d}.png"
                    slide_metadata.append({
                        'slide_number': slide.slide_number,
                        'file_path': str(slide_path),
                        'title': slide.title,
                        'theme': 'educational',
                        'animations': False
                    })
                
                result = await self.video_service.assemble_educational_video(
                    timeline,
                    slide_metadata,
                    str(video_path)
                )
                
                if not result.success:
                    raise RuntimeError(f"Video assembly failed: {result.error_message}")
                
                # 13. Save video asset
                video_asset_data = {
                    'session_id': session_id,
                    'content_id': module_id,
                    'company_id': company_id,
                    'asset_type': 'video',
                    'asset_name': f"{module_name} - Educational Video",
                    'file_path': str(video_path),
                    'file_size_bytes': result.file_size,
                    'mime_type': 'video/mp4',
                    'section_name': 'full_module',
                    'duration_seconds': result.duration,
                    'generation_config': {
                        'resolution': result.metadata.get('resolution'),
                        'fps': result.metadata.get('fps'),
                        'codec': result.metadata.get('video_codec')
                    },
                    'quality_metrics': {
                        'duration': result.duration,
                        'file_size': result.file_size,
                        'slide_count': len(slide_metadata)
                    },
                    'status': 'generated'
                }
                
                video_asset_result = self.supabase.table('mm_multimedia_assets').insert(video_asset_data).execute()
                video_asset_id = video_asset_result.data[0]['asset_id']
                
                # 14. Upload to storage
                self._update_session(session_id, {
                    'current_stage': 'uploading',
                    'progress_percentage': 85
                })
                
                # Upload slides to storage
                logger.info("Uploading slides to multimedia-assets...")
                for i, slide_asset in enumerate(slide_assets):
                    slide_path = slides_dir / f"slide_{i+1:03d}.png"
                    if slide_path.exists():
                        with open(slide_path, 'rb') as f:
                            slide_data = f.read()
                        
                        slide_storage_path = f"{company_id}/{employee['id']}/slides/{module_id}/slide_{i+1:03d}.png"
                        
                        # Try to upload, handle if file exists
                        try:
                            self.supabase.storage.from_('multimedia-assets').upload(
                                slide_storage_path,
                                slide_data,
                                {'content-type': 'image/png'}
                            )
                        except Exception as e:
                            if 'already exists' in str(e):
                                # File exists, update it instead
                                logger.info(f"File exists, updating: {slide_storage_path}")
                                self.supabase.storage.from_('multimedia-assets').update(
                                    slide_storage_path,
                                    slide_data,
                                    {'content-type': 'image/png'}
                                )
                            else:
                                raise
                        
                        slide_url = self.supabase.storage.from_('multimedia-assets').get_public_url(slide_storage_path)
                        
                        # Update slide asset with URL
                        self.supabase.table('mm_multimedia_assets').update({
                            'storage_bucket': 'multimedia-assets',
                            'storage_path': slide_storage_path,
                            'public_url': slide_url
                        }).eq('asset_id', slide_asset['asset_id']).execute()
                
                # Upload audio segments to storage
                logger.info("Uploading audio to multimedia-assets...")
                for segment in timeline.audio_segments:
                    if Path(segment.audio_file).exists():
                        with open(segment.audio_file, 'rb') as f:
                            audio_data = f.read()
                        
                        audio_storage_path = f"{company_id}/{employee['id']}/audio/{module_id}/{Path(segment.audio_file).name}"
                        
                        # Try to upload, handle if file exists
                        try:
                            self.supabase.storage.from_('multimedia-assets').upload(
                                audio_storage_path,
                                audio_data,
                                {'content-type': 'audio/mpeg'}
                            )
                        except Exception as e:
                            if 'already exists' in str(e):
                                logger.info(f"Audio exists, updating: {audio_storage_path}")
                                self.supabase.storage.from_('multimedia-assets').update(
                                    audio_storage_path,
                                    audio_data,
                                    {'content-type': 'audio/mpeg'}
                                )
                            else:
                                raise
                
                # Upload final video
                logger.info("Uploading video to multimedia-assets...")
                with open(video_path, 'rb') as f:
                    video_data = f.read()
                
                # Use multimedia-assets bucket with proper organization
                storage_path = f"{company_id}/{employee['id']}/videos/{video_filename}"
                
                # Upload to multimedia-assets bucket
                try:
                    self.supabase.storage.from_('multimedia-assets').upload(
                        storage_path,
                        video_data,
                        {'content-type': 'video/mp4'}
                    )
                except Exception as e:
                    if 'already exists' in str(e):
                        logger.info(f"Video exists, updating: {storage_path}")
                        self.supabase.storage.from_('multimedia-assets').update(
                            storage_path,
                            video_data,
                            {'content-type': 'video/mp4'}
                        )
                    else:
                        raise
                
                public_url = self.supabase.storage.from_('multimedia-assets').get_public_url(storage_path)
                
                # Update asset with public URL
                self.supabase.table('mm_multimedia_assets').update({
                    'storage_bucket': 'multimedia-assets',
                    'storage_path': storage_path,
                    'public_url': public_url,
                    'status': 'processed'
                }).eq('asset_id', video_asset_id).execute()
                
                # 15. Create slide presentation record
                presentation_data = {
                    'session_id': session_id,
                    'content_id': module_id,
                    'company_id': company_id,
                    'presentation_name': f"{module_name} - Slide Deck",
                    'presentation_type': 'module_slides',
                    'total_slides': len(slide_assets),
                    'slide_order': [asset['asset_id'] for asset in slide_assets],
                    'theme_config': {
                        'theme': 'educational',
                        'brand_colors': True
                    },
                    'status': 'generated'
                }
                
                self.supabase.table('mm_slide_presentations').insert(presentation_data).execute()
                
                # 16. Create audio narration record
                narration_data = {
                    'session_id': session_id,
                    'content_id': module_id,
                    'company_id': company_id,
                    'narration_name': f"{module_name} - Full Narration",
                    'narration_type': 'full_module',
                    'total_duration_seconds': timeline.total_duration,
                    'audio_segments': [
                        {
                            'segment_id': seg.segment_id,
                            'start_time': seg.start_time,
                            'end_time': seg.end_time,
                            'duration': seg.end_time - seg.start_time
                        }
                        for seg in timeline.audio_segments
                    ],
                    'voice_config': {
                        'voice': 'fable',
                        'speed': 0.95
                    },
                    'master_audio_id': video_asset_id,
                    'synthesis_completed': True,
                    'segments_merged': True,
                    'status': 'processed'
                }
                
                self.supabase.table('mm_audio_narrations').insert(narration_data).execute()
                
                # 17. Update session as completed
                self._update_session(session_id, {
                    'status': 'completed',
                    'current_stage': 'completed',
                    'progress_percentage': 100,
                    'total_assets_generated': len(slide_assets) + len(timeline.audio_segments) + 1,
                    'video_files_generated': 1,
                    'processing_duration_seconds': int((datetime.now().timestamp() - datetime.fromisoformat(session_result.data[0]['started_at'].replace('Z', '+00:00')).timestamp())),
                    'completed_at': datetime.now().isoformat()
                })
                
                logger.info(f"✅ Course video successfully generated!")
                logger.info(f"📹 Video URL: {public_url}")
                
                return {
                    'success': True,
                    'session_id': session_id,
                    'video_url': public_url,
                    'duration': result.duration,
                    'file_size': result.file_size,
                    'employee': employee['users']['full_name'],
                    'module': module_name,
                    'company_id': company_id,
                    'assets': {
                        'slides': len(slide_assets),
                        'audio_segments': len(timeline.audio_segments),
                        'video': 1
                    }
                }
                
            finally:
                # Clean up temporary files
                import shutil
                shutil.rmtree(temp_dir)
                
        except Exception as e:
            logger.error(f"Video generation failed: {e}")
            
            # Update session as failed
            if 'session_id' in locals():
                self._update_session(session_id, {
                    'status': 'failed',
                    'error_details': str(e)
                })
            
            return {
                'success': False,
                'error': str(e)
            }
    
    def _update_session(self, session_id: str, updates: Dict[str, Any]):
        """Update multimedia session status"""
        try:
            self.supabase.table('mm_multimedia_sessions').update(updates).eq(
                'session_id', session_id
            ).execute()
        except Exception as e:
            logger.warning(f"Failed to update session: {e}")


async def main():
    """Test section-based video generation with real data"""
    
    generator = CourseVideoGenerator()
    
    # Test with Kubilay Cenk Karakas
    employee_name = "Kubilay Cenk Karakas"
    
    # Get the Business Performance Reporting module (has actual content)
    logger.info("Fetching available modules...")
    modules = generator.supabase.table('cm_module_content').select(
        'content_id, module_name'
    ).limit(5).execute()
    
    if modules.data:
        logger.info("Available modules:")
        for module in modules.data:
            logger.info(f"  - {module['content_id']}: {module['module_name']}")
        
        # Use the Business Performance Reporting module (has rich content)
        test_module_id = 'f7839b56-0239-4b3c-8b5f-798a4030dc4a'  # Business Performance Reporting
        
        # Generate section-based videos (NEW APPROACH)
        result = await generator.generate_all_section_videos(
            employee_name=employee_name,
            module_id=test_module_id
        )
        
        if result['success']:
            print("\n🎉 Section-Based Video Generation Successful!")
            print(f"Employee: {result['employee']}")
            print(f"Module: {result['module']}")
            print(f"Company ID: {result['company_id']}")
            print(f"Total Sections Processed: {result['sections_processed']}")
            print(f"Successful Sections: {result['sections_successful']}")
            print(f"Failed Sections: {result['sections_failed']}")
            print("\n📹 Section Results:")
            
            for section_result in result['section_results']:
                if section_result['success']:
                    print(f"  ✅ {section_result['section_name']}: {section_result['duration']:.1f}s")
                    print(f"     URL: {section_result['video_url']}")
                    print(f"     Assets: {section_result['assets']['slides']} slides, {section_result['assets']['video']} video")
                else:
                    print(f"  ❌ {section_result['section_name']}: {section_result.get('error', 'Unknown error')}")
        else:
            print(f"\n❌ Section Video Generation Failed: {result['error']}")
    else:
        print("No modules found in database")


if __name__ == "__main__":
    asyncio.run(main())