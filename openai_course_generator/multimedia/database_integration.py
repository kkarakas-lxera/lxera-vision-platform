#!/usr/bin/env python3
"""
Database Integration for Multimedia Pipeline
Bridge between multimedia generation and Supabase database
"""

import os
import json
import logging
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
from pathlib import Path
from supabase import create_client, Client

logger = logging.getLogger(__name__)

class DatabaseMultimediaIntegrator:
    """Bridge between multimedia pipeline and Supabase database"""
    
    def __init__(self, supabase_url: Optional[str] = None, supabase_key: Optional[str] = None):
        """Initialize database connection"""
        self.supabase_url = supabase_url or os.getenv('SUPABASE_URL')
        self.supabase_key = supabase_key or os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Supabase URL and service role key are required")
        
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        logger.info("Database multimedia integrator initialized")
    
    def create_multimedia_session(
        self,
        content_id: str,
        employee_name: str,
        company_id: str,
        session_type: str = 'full_generation',
        content_sections: Optional[List[str]] = None
    ) -> str:
        """Create multimedia session in database"""
        
        try:
            session_id = str(uuid.uuid4())
            
            # Get content details
            content_result = self.supabase.table('cm_module_content').select('module_name').eq('content_id', content_id).single().execute()
            module_name = content_result.data.get('module_name', 'Unknown Module') if content_result.data else 'Unknown Module'
            
            # Create session record
            session_data = {
                'session_id': session_id,
                'content_id': content_id,
                'company_id': company_id,
                'course_id': content_id,  # Using content_id as course_id for compatibility
                'employee_name': employee_name,
                'course_title': module_name,
                'status': 'initializing',
                'session_type': session_type,
                'content_sections': content_sections or ['introduction', 'core_content', 'practical_applications', 'case_studies'],
                'personalization_level': 'standard',
                'voice_settings': {'voice': 'alloy', 'speed': 1.0},
                'generation_config': {
                    'session_type': session_type,
                    'content_sections': content_sections,
                    'created_at': datetime.now().isoformat()
                },
                'created_at': datetime.now().isoformat()
            }
            
            result = self.supabase.table('mm_multimedia_sessions').insert(session_data).execute()
            
            if result.data:
                logger.info(f"Created multimedia session: {session_id}")
                return session_id
            else:
                raise Exception("Failed to create session in database")
                
        except Exception as e:
            logger.error(f"Failed to create multimedia session: {e}")
            raise
    
    def register_multimedia_asset(
        self,
        session_id: str,
        content_id: str,
        asset_type: str,
        file_path: str,
        section_name: str,
        asset_category: str = 'module_complete',
        duration_seconds: Optional[float] = None,
        file_size_bytes: Optional[int] = None,
        mime_type: Optional[str] = None,
        generation_settings: Optional[Dict[str, Any]] = None
    ) -> str:
        """Register multimedia asset in database"""
        
        try:
            asset_id = str(uuid.uuid4())
            file_name = Path(file_path).name
            
            # Get file size if not provided
            if file_size_bytes is None and os.path.exists(file_path):
                file_size_bytes = os.path.getsize(file_path)
            
            asset_data = {
                'asset_id': asset_id,
                'session_id': session_id,
                'content_id': content_id,
                'asset_type': asset_type,
                'asset_category': asset_category,
                'asset_name': file_name,
                'file_path': file_path,
                'section_name': section_name,
                'file_size_bytes': file_size_bytes or 0,
                'duration_seconds': duration_seconds,
                'mime_type': mime_type,
                'generation_settings': generation_settings or {},
                'status': 'completed',
                'created_at': datetime.now().isoformat()
            }
            
            result = self.supabase.table('mm_multimedia_assets').insert(asset_data).execute()
            
            if result.data:
                logger.info(f"Registered asset: {asset_id} ({asset_type})")
                return asset_id
            else:
                raise Exception("Failed to register asset in database")
                
        except Exception as e:
            logger.error(f"Failed to register asset: {e}")
            raise
    
    def update_session_status(
        self,
        session_id: str,
        status: str,
        current_stage: Optional[str] = None,
        progress_percentage: Optional[int] = None,
        error_message: Optional[str] = None,
        **kwargs
    ) -> None:
        """Update multimedia session status"""
        
        try:
            update_data = {
                'status': status,
                'updated_at': datetime.now().isoformat()
            }
            
            if current_stage:
                update_data['current_stage'] = current_stage
            if progress_percentage is not None:
                update_data['progress_percentage'] = progress_percentage
            if error_message:
                update_data['error_message'] = error_message
            
            # Add any additional fields
            for key, value in kwargs.items():
                if key in ['video_files_generated', 'audio_files_generated', 'slides_generated', 'total_assets_generated']:
                    update_data[key] = value
            
            self.supabase.table('mm_multimedia_sessions').update(update_data).eq('session_id', session_id).execute()
            
            logger.info(f"Updated session {session_id}: {status}")
            
        except Exception as e:
            logger.error(f"Failed to update session status: {e}")
            raise
    
    def get_content_for_multimedia(self, content_id: str) -> Dict[str, Any]:
        """Retrieve content optimized for multimedia generation"""
        
        try:
            result = self.supabase.table('cm_module_content').select('*').eq('content_id', content_id).single().execute()
            
            if not result.data:
                raise ValueError(f"Content not found: {content_id}")
            
            content = result.data
            
            # Structure content for multimedia processing
            multimedia_content = {
                'content_id': content_id,
                'module_name': content.get('module_name', 'Unknown Module'),
                'employee_name': content.get('employee_name', 'Unknown Employee'),
                'sections': {
                    'introduction': content.get('introduction', ''),
                    'core_content': content.get('core_content', ''),
                    'practical_applications': content.get('practical_applications', ''),
                    'case_studies': content.get('case_studies', ''),
                    'assessments': content.get('assessments', '')
                },
                'metadata': {
                    'total_word_count': content.get('total_word_count', 0),
                    'section_word_counts': content.get('section_word_counts', {}),
                    'created_at': content.get('created_at'),
                    'updated_at': content.get('updated_at')
                }
            }
            
            logger.info(f"Retrieved content for multimedia: {content_id}")
            return multimedia_content
            
        except Exception as e:
            logger.error(f"Failed to retrieve content: {e}")
            raise
    
    def store_content_essence(
        self,
        content_id: str,
        session_id: str,
        essence_data: Dict[str, Any]
    ) -> str:
        """Store content essence for multimedia generation"""
        
        try:
            essence_id = str(uuid.uuid4())
            
            essence_record = {
                'essence_id': essence_id,
                'content_id': content_id,
                'session_id': session_id,
                'hook_statement': essence_data.get('hook_statement', ''),
                'core_insight': essence_data.get('core_insight', ''),
                'practical_application': essence_data.get('practical_application', ''),
                'reflection_prompt': essence_data.get('reflection_prompt', ''),
                'key_concepts': essence_data.get('key_concepts', []),
                'emotional_tone': essence_data.get('emotional_tone', 'thoughtful'),
                'visual_metaphor': essence_data.get('visual_metaphor', ''),
                'learning_objective': essence_data.get('learning_objective', ''),
                'created_at': datetime.now().isoformat()
            }
            
            # Try to insert (table may not exist yet)
            try:
                result = self.supabase.table('mm_content_essence').insert(essence_record).execute()
                if result.data:
                    logger.info(f"Stored content essence: {essence_id}")
                    return essence_id
            except Exception as db_error:
                logger.warning(f"Content essence table not available: {db_error}")
                # Store in session metadata as fallback
                self._store_essence_in_session_metadata(session_id, essence_data)
                return essence_id
                
        except Exception as e:
            logger.error(f"Failed to store content essence: {e}")
            raise
    
    def _store_essence_in_session_metadata(self, session_id: str, essence_data: Dict[str, Any]) -> None:
        """Store essence data in session metadata as fallback"""
        try:
            # Get current session
            session_result = self.supabase.table('mm_multimedia_sessions').select('generation_config').eq('session_id', session_id).single().execute()
            
            if session_result.data:
                current_config = session_result.data.get('generation_config', {})
                current_config['content_essence'] = essence_data
                
                self.supabase.table('mm_multimedia_sessions').update({
                    'generation_config': current_config
                }).eq('session_id', session_id).execute()
                
                logger.info(f"Stored essence in session metadata: {session_id}")
                
        except Exception as e:
            logger.error(f"Failed to store essence in session metadata: {e}")
    
    def get_multimedia_assets(self, session_id: str) -> List[Dict[str, Any]]:
        """Get all multimedia assets for a session"""
        
        try:
            result = self.supabase.table('mm_multimedia_assets').select('*').eq('session_id', session_id).execute()
            
            if result.data:
                logger.info(f"Retrieved {len(result.data)} assets for session: {session_id}")
                return result.data
            else:
                return []
                
        except Exception as e:
            logger.error(f"Failed to retrieve multimedia assets: {e}")
            return []
    
    def cleanup_session(self, session_id: str, remove_files: bool = False) -> None:
        """Clean up multimedia session and optionally remove files"""
        
        try:
            if remove_files:
                # Get all asset file paths
                assets = self.get_multimedia_assets(session_id)
                for asset in assets:
                    file_path = asset.get('file_path')
                    if file_path and os.path.exists(file_path):
                        try:
                            os.remove(file_path)
                            logger.info(f"Removed file: {file_path}")
                        except Exception as file_error:
                            logger.warning(f"Failed to remove file {file_path}: {file_error}")
            
            # Delete database records
            self.supabase.table('mm_multimedia_assets').delete().eq('session_id', session_id).execute()
            self.supabase.table('mm_multimedia_sessions').delete().eq('session_id', session_id).execute()
            
            logger.info(f"Cleaned up session: {session_id}")
            
        except Exception as e:
            logger.error(f"Failed to cleanup session: {e}")
            raise
    
    def get_session_progress(self, session_id: str) -> Dict[str, Any]:
        """Get current session progress"""
        
        try:
            result = self.supabase.table('mm_multimedia_sessions').select('*').eq('session_id', session_id).single().execute()
            
            if result.data:
                session = result.data
                
                # Get asset count
                assets_result = self.supabase.table('mm_multimedia_assets').select('asset_id').eq('session_id', session_id).execute()
                asset_count = len(assets_result.data) if assets_result.data else 0
                
                progress = {
                    'session_id': session_id,
                    'status': session.get('status', 'unknown'),
                    'current_stage': session.get('current_stage', ''),
                    'progress_percentage': session.get('progress_percentage', 0),
                    'assets_generated': asset_count,
                    'total_assets_expected': session.get('total_assets_generated', 0),
                    'error_message': session.get('error_message'),
                    'created_at': session.get('created_at'),
                    'updated_at': session.get('updated_at')
                }
                
                return progress
            else:
                raise ValueError(f"Session not found: {session_id}")
                
        except Exception as e:
            logger.error(f"Failed to get session progress: {e}")
            raise
    
    def update_asset_status(self, asset_id: str, status: str, **kwargs) -> None:
        """Update individual asset status"""
        
        try:
            update_data = {
                'status': status,
                'updated_at': datetime.now().isoformat()
            }
            
            # Add any additional fields
            for key, value in kwargs.items():
                if key in ['processing_duration_seconds', 'quality_score', 'file_size_bytes']:
                    update_data[key] = value
            
            self.supabase.table('mm_multimedia_assets').update(update_data).eq('asset_id', asset_id).execute()
            
            logger.info(f"Updated asset {asset_id}: {status}")
            
        except Exception as e:
            logger.error(f"Failed to update asset status: {e}")
            raise
    
    def get_content_sections(self, content_id: str) -> Dict[str, str]:
        """Get content sections for multimedia processing"""
        
        try:
            result = self.supabase.table('cm_module_content').select(
                'introduction, core_content, practical_applications, case_studies, assessments'
            ).eq('content_id', content_id).single().execute()
            
            if result.data:
                return {
                    'introduction': result.data.get('introduction', ''),
                    'core_content': result.data.get('core_content', ''),
                    'practical_applications': result.data.get('practical_applications', ''),
                    'case_studies': result.data.get('case_studies', ''),
                    'assessments': result.data.get('assessments', '')
                }
            else:
                raise ValueError(f"Content sections not found: {content_id}")
                
        except Exception as e:
            logger.error(f"Failed to get content sections: {e}")
            raise
    
    def register_video_timeline(
        self,
        session_id: str,
        content_id: str,
        timeline_data: Dict[str, Any]
    ) -> str:
        """Register video timeline in database"""
        
        try:
            timeline_id = str(uuid.uuid4())
            
            timeline_record = {
                'timeline_id': timeline_id,
                'session_id': session_id,
                'content_id': content_id,
                'total_duration': timeline_data.get('total_duration', 0),
                'narration_file_path': timeline_data.get('narration_file', ''),
                'slide_count': timeline_data.get('slide_count', 0),
                'voice_used': timeline_data.get('voice', 'nova'),
                'speech_speed': timeline_data.get('speed', 1.0),
                'audio_segments': timeline_data.get('audio_segments', []),
                'slide_transitions': timeline_data.get('slide_transitions', []),
                'video_file_path': timeline_data.get('video_path', ''),
                'generation_status': 'completed',
                'created_at': datetime.now().isoformat()
            }
            
            # Try to insert (table may not exist yet)
            try:
                result = self.supabase.table('mm_video_timelines').insert(timeline_record).execute()
                if result.data:
                    logger.info(f"Registered video timeline: {timeline_id}")
                    return timeline_id
            except Exception as db_error:
                logger.warning(f"Video timelines table not available: {db_error}")
                # Store in session metadata as fallback
                self._store_timeline_in_session_metadata(session_id, timeline_data)
                return timeline_id
                
        except Exception as e:
            logger.error(f"Failed to register video timeline: {e}")
            raise
    
    def _store_timeline_in_session_metadata(self, session_id: str, timeline_data: Dict[str, Any]) -> None:
        """Store timeline data in session metadata as fallback"""
        try:
            # Get current session
            session_result = self.supabase.table('mm_multimedia_sessions').select('generation_config').eq('session_id', session_id).single().execute()
            
            if session_result.data:
                current_config = session_result.data.get('generation_config', {})
                current_config['video_timeline'] = timeline_data
                
                self.supabase.table('mm_multimedia_sessions').update({
                    'generation_config': current_config
                }).eq('session_id', session_id).execute()
                
                logger.info(f"Stored timeline in session metadata: {session_id}")
                
        except Exception as e:
            logger.error(f"Failed to store timeline in session metadata: {e}")
    
    def get_employee_multimedia_preferences(self, employee_id: str) -> Dict[str, Any]:
        """Get employee multimedia preferences"""
        
        try:
            result = self.supabase.table('mm_employee_preferences').select('*').eq('employee_id', employee_id).execute()
            
            if result.data and len(result.data) > 0:
                preferences = result.data[0]
                return {
                    'preferred_voice': preferences.get('preferred_voice', 'nova'),
                    'preferred_speed': preferences.get('preferred_speed', 1.0),
                    'personalization_level': preferences.get('personalization_level', 'standard'),
                    'visual_preferences': preferences.get('visual_preferences', {}),
                    'content_preferences': preferences.get('content_preferences', {})
                }
            else:
                # Return defaults
                return {
                    'preferred_voice': 'nova',
                    'preferred_speed': 1.0,
                    'personalization_level': 'standard',
                    'visual_preferences': {},
                    'content_preferences': {}
                }
                
        except Exception as e:
            logger.warning(f"Failed to get employee preferences: {e}")
            # Return defaults on error
            return {
                'preferred_voice': 'nova',
                'preferred_speed': 1.0,
                'personalization_level': 'standard',
                'visual_preferences': {},
                'content_preferences': {}
            }
    
    def update_employee_multimedia_preferences(
        self,
        employee_id: str,
        preferences: Dict[str, Any]
    ) -> None:
        """Update employee multimedia preferences"""
        
        try:
            # Check if preferences exist
            existing_result = self.supabase.table('mm_employee_preferences').select('employee_id').eq('employee_id', employee_id).execute()
            
            preference_data = {
                'employee_id': employee_id,
                'preferred_voice': preferences.get('preferred_voice', 'nova'),
                'preferred_speed': preferences.get('preferred_speed', 1.0),
                'personalization_level': preferences.get('personalization_level', 'standard'),
                'visual_preferences': preferences.get('visual_preferences', {}),
                'content_preferences': preferences.get('content_preferences', {}),
                'updated_at': datetime.now().isoformat()
            }
            
            if existing_result.data and len(existing_result.data) > 0:
                # Update existing
                self.supabase.table('mm_employee_preferences').update(preference_data).eq('employee_id', employee_id).execute()
                logger.info(f"Updated multimedia preferences for employee: {employee_id}")
            else:
                # Insert new
                preference_data['created_at'] = datetime.now().isoformat()
                self.supabase.table('mm_employee_preferences').insert(preference_data).execute()
                logger.info(f"Created multimedia preferences for employee: {employee_id}")
                
        except Exception as e:
            logger.error(f"Failed to update employee preferences: {e}")
            raise
    
    def get_multimedia_analytics(self, company_id: str, days: int = 30) -> Dict[str, Any]:
        """Get multimedia analytics for company"""
        
        try:
            # Get sessions in date range
            sessions_result = self.supabase.table('mm_multimedia_sessions').select('*').eq('company_id', company_id).execute()
            
            if not sessions_result.data:
                return {'total_sessions': 0, 'total_assets': 0}
            
            sessions = sessions_result.data
            
            # Get assets for these sessions
            session_ids = [s['session_id'] for s in sessions]
            assets_result = self.supabase.table('mm_multimedia_assets').select('*').in_('session_id', session_ids).execute()
            
            assets = assets_result.data if assets_result.data else []
            
            # Calculate analytics
            analytics = {
                'total_sessions': len(sessions),
                'total_assets': len(assets),
                'assets_by_type': {},
                'average_duration': 0,
                'total_file_size': 0,
                'status_breakdown': {}
            }
            
            # Process assets
            total_duration = 0
            total_file_size = 0
            
            for asset in assets:
                asset_type = asset.get('asset_type', 'unknown')
                analytics['assets_by_type'][asset_type] = analytics['assets_by_type'].get(asset_type, 0) + 1
                
                if asset.get('duration_seconds'):
                    total_duration += asset['duration_seconds']
                if asset.get('file_size_bytes'):
                    total_file_size += asset['file_size_bytes']
            
            analytics['average_duration'] = total_duration / len(assets) if assets else 0
            analytics['total_file_size'] = total_file_size
            
            # Process sessions
            for session in sessions:
                status = session.get('status', 'unknown')
                analytics['status_breakdown'][status] = analytics['status_breakdown'].get(status, 0) + 1
            
            logger.info(f"Generated multimedia analytics for company: {company_id}")
            return analytics
            
        except Exception as e:
            logger.error(f"Failed to get multimedia analytics: {e}")
            return {'error': str(e)}