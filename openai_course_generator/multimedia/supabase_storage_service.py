#!/usr/bin/env python3
"""
Supabase Storage Service
Handles file uploads to Supabase Storage for multimedia assets
"""

import os
import logging
from pathlib import Path
from typing import Optional, Dict, Any
from datetime import datetime
import mimetypes

logger = logging.getLogger(__name__)

class SupabaseStorageService:
    """Service for uploading multimedia files to Supabase Storage"""
    
    def __init__(self, supabase_client=None):
        """Initialize with Supabase client"""
        if supabase_client:
            self.supabase = supabase_client
        else:
            # Import and initialize if not provided
            from database.content_manager import ContentManager
            content_manager = ContentManager()
            self.supabase = content_manager.supabase
        
        # Storage bucket name for multimedia assets
        self.bucket_name = "multimedia-assets"
        
        logger.info("Supabase Storage Service initialized")
    
    async def upload_video(
        self, 
        video_path: str, 
        content_id: str, 
        section_name: str,
        employee_name: str = "default",
        session_id: str = None
    ) -> Dict[str, Any]:
        """
        Upload video file to Supabase Storage
        
        Args:
            video_path: Local path to video file
            content_id: Content ID for organization
            section_name: Section name (introduction, practical_applications, etc.)
            employee_name: Employee name for personalized paths
            session_id: Session ID for tracking
            
        Returns:
            Dictionary with upload results including public URL
        """
        try:
            if not os.path.exists(video_path):
                raise FileNotFoundError(f"Video file not found: {video_path}")
            
            # Create organized storage path
            clean_employee_name = employee_name.lower().replace(' ', '_').replace('-', '_')
            storage_path = f"videos/{clean_employee_name}/{content_id}/{section_name}/{Path(video_path).name}"
            
            logger.info(f"Uploading video to Supabase Storage: {storage_path}")
            
            # Read file content
            with open(video_path, 'rb') as file:
                file_content = file.read()
            
            # Get file info
            file_size = len(file_content)
            mime_type = mimetypes.guess_type(video_path)[0] or 'video/mp4'
            
            # Upload to Supabase Storage
            result = self.supabase.storage.from_(self.bucket_name).upload(
                path=storage_path,
                file=file_content,
                file_options={
                    "content-type": mime_type,
                    "upsert": "true"  # String instead of boolean
                }
            )
            
            # Get public URL
            public_url = self.supabase.storage.from_(self.bucket_name).get_public_url(storage_path)
            
            logger.info(f"✅ Video uploaded successfully: {public_url}")
            
            return {
                'success': True,
                'storage_path': storage_path,
                'public_url': public_url,
                'file_size': file_size,
                'mime_type': mime_type,
                'bucket': self.bucket_name
            }
            
        except Exception as e:
            logger.error(f"Failed to upload video: {e}")
            return {
                'success': False,
                'error': str(e),
                'storage_path': None,
                'public_url': None
            }
    
    async def upload_slides(
        self, 
        slides_dir: str, 
        content_id: str, 
        section_name: str,
        employee_name: str = "default"
    ) -> Dict[str, Any]:
        """
        Upload slide images to Supabase Storage
        
        Args:
            slides_dir: Directory containing slide PNG files
            content_id: Content ID for organization
            section_name: Section name
            employee_name: Employee name for personalized paths
            
        Returns:
            Dictionary with upload results for all slides
        """
        try:
            slides_path = Path(slides_dir)
            if not slides_path.exists():
                raise FileNotFoundError(f"Slides directory not found: {slides_dir}")
            
            # Find all PNG slide files
            slide_files = list(slides_path.glob("*.png"))
            if not slide_files:
                raise FileNotFoundError(f"No PNG slides found in: {slides_dir}")
            
            clean_employee_name = employee_name.lower().replace(' ', '_').replace('-', '_')
            uploaded_slides = []
            
            for slide_file in sorted(slide_files):
                # Create storage path for each slide
                storage_path = f"slides/{clean_employee_name}/{content_id}/{section_name}/{slide_file.name}"
                
                logger.info(f"Uploading slide: {storage_path}")
                
                # Read and upload slide
                with open(slide_file, 'rb') as file:
                    file_content = file.read()
                
                result = self.supabase.storage.from_(self.bucket_name).upload(
                    path=storage_path,
                    file=file_content,
                    file_options={
                        "content-type": "image/png",
                        "upsert": "true"
                    }
                )
                
                # Get public URL
                public_url = self.supabase.storage.from_(self.bucket_name).get_public_url(storage_path)
                
                uploaded_slides.append({
                    'file_name': slide_file.name,
                    'storage_path': storage_path,
                    'public_url': public_url,
                    'file_size': len(file_content)
                })
            
            logger.info(f"✅ Uploaded {len(uploaded_slides)} slides successfully")
            
            return {
                'success': True,
                'slides': uploaded_slides,
                'total_slides': len(uploaded_slides)
            }
            
        except Exception as e:
            logger.error(f"Failed to upload slides: {e}")
            return {
                'success': False,
                'error': str(e),
                'slides': []
            }
    
    async def upload_audio(
        self, 
        audio_path: str, 
        content_id: str, 
        section_name: str,
        employee_name: str = "default"
    ) -> Dict[str, Any]:
        """
        Upload audio narration to Supabase Storage
        
        Args:
            audio_path: Local path to audio file
            content_id: Content ID for organization
            section_name: Section name
            employee_name: Employee name for personalized paths
            
        Returns:
            Dictionary with upload results
        """
        try:
            if not os.path.exists(audio_path):
                raise FileNotFoundError(f"Audio file not found: {audio_path}")
            
            clean_employee_name = employee_name.lower().replace(' ', '_').replace('-', '_')
            storage_path = f"audio/{clean_employee_name}/{content_id}/{section_name}/{Path(audio_path).name}"
            
            logger.info(f"Uploading audio to Supabase Storage: {storage_path}")
            
            # Read and upload audio
            with open(audio_path, 'rb') as file:
                file_content = file.read()
            
            result = self.supabase.storage.from_(self.bucket_name).upload(
                path=storage_path,
                file=file_content,
                file_options={
                    "content-type": "audio/mpeg",
                    "upsert": "true"
                }
            )
            
            # Get public URL
            public_url = self.supabase.storage.from_(self.bucket_name).get_public_url(storage_path)
            
            logger.info(f"✅ Audio uploaded successfully: {public_url}")
            
            return {
                'success': True,
                'storage_path': storage_path,
                'public_url': public_url,
                'file_size': len(file_content),
                'mime_type': 'audio/mpeg'
            }
            
        except Exception as e:
            logger.error(f"Failed to upload audio: {e}")
            return {
                'success': False,
                'error': str(e),
                'storage_path': None,
                'public_url': None
            }
    
    async def upload_complete_section(
        self,
        output_dir: str,
        content_id: str,
        section_name: str,
        employee_name: str = "default",
        session_id: str = None
    ) -> Dict[str, Any]:
        """
        Upload all files for a complete section (video, slides, audio)
        
        Args:
            output_dir: Local directory containing all section files
            content_id: Content ID
            section_name: Section name
            employee_name: Employee name
            session_id: Session ID for tracking
            
        Returns:
            Dictionary with all upload results
        """
        try:
            output_path = Path(output_dir)
            section_path = output_path / section_name
            
            if not section_path.exists():
                raise FileNotFoundError(f"Section directory not found: {section_path}")
            
            logger.info(f"Uploading complete section: {section_name}")
            
            results = {
                'section_name': section_name,
                'content_id': content_id,
                'employee_name': employee_name,
                'uploads': {}
            }
            
            # Upload video
            video_files = list(section_path.glob("*.mp4"))
            if video_files:
                video_result = await self.upload_video(
                    str(video_files[0]), content_id, section_name, employee_name, session_id
                )
                results['uploads']['video'] = video_result
            
            # Upload slides
            slides_dir = section_path / "slides"
            if slides_dir.exists():
                slides_result = await self.upload_slides(
                    str(slides_dir), content_id, section_name, employee_name
                )
                results['uploads']['slides'] = slides_result
            
            # Upload audio
            audio_dir = section_path / "audio"
            if audio_dir.exists():
                # Upload main narration file
                narration_files = list(audio_dir.glob("*_narration.mp3"))
                if narration_files:
                    audio_result = await self.upload_audio(
                        str(narration_files[0]), content_id, section_name, employee_name
                    )
                    results['uploads']['audio'] = audio_result
            
            # Check if all uploads succeeded
            all_success = all(
                upload.get('success', False) 
                for upload in results['uploads'].values()
            )
            
            results['success'] = all_success
            
            if all_success:
                logger.info(f"✅ Complete section uploaded successfully: {section_name}")
            else:
                logger.warning(f"⚠️ Some uploads failed for section: {section_name}")
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to upload complete section: {e}")
            return {
                'success': False,
                'error': str(e),
                'section_name': section_name,
                'uploads': {}
            }
    
    def create_storage_bucket_if_not_exists(self) -> bool:
        """Create the multimedia-assets bucket if it doesn't exist"""
        try:
            # List buckets to check if it exists
            buckets = self.supabase.storage.list_buckets()
            bucket_names = [bucket.name for bucket in buckets]
            
            if self.bucket_name not in bucket_names:
                # Create the bucket
                self.supabase.storage.create_bucket(
                    self.bucket_name,
                    options={"public": True}  # Make bucket public for easy access
                )
                logger.info(f"✅ Created storage bucket: {self.bucket_name}")
            else:
                logger.info(f"✓ Storage bucket already exists: {self.bucket_name}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to create/check storage bucket: {e}")
            return False