#!/usr/bin/env python3
"""
Database Integration for Content_Latest Multimedia Pipeline
Connects the proven working content_latest system with our database workflow
"""

import os
import sys
import json
import logging
import tempfile
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional, List
import uuid

# Set Supabase credentials
os.environ['SUPABASE_URL'] = 'https://ujlqzkkkfatehxeqtbdl.supabase.co'
os.environ['SUPABASE_ANON_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqbHF6a2trZmF0ZWh4ZXF0YmRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2ODA4MzIsImV4cCI6MjA1NjI1NjgzMn0.ed-wciIqkubS4f2T3UNnkgqwzLEdpC-SVZoVsP7-W1E'

# Add paths for imports
current_dir = os.path.dirname(__file__)
openai_generator_dir = os.path.dirname(current_dir)
sys.path.append(openai_generator_dir)

from database.content_manager import ContentManager
from tools.multimedia_tools import MultimediaManager, get_multimedia_manager

# Import content_latest components
sys.path.append(current_dir)
from core_pipeline.master_orchestrator import MasterOrchestrator
from core_pipeline.config import PipelineConfig

logger = logging.getLogger(__name__)

class DatabaseMultimediaIntegrator:
    """Integrates content_latest multimedia pipeline with database workflow"""
    
    def __init__(self):
        self.content_manager = ContentManager()
        self.multimedia_manager = get_multimedia_manager()
        
        # Set up content_latest config
        self.config = PipelineConfig()
        self.orchestrator = MasterOrchestrator(self.config)
        
        logger.info("Database multimedia integrator initialized")
    
    def generate_multimedia_for_module(
        self,
        content_id: str,
        employee_context: Dict[str, Any],
        output_base_dir: str = "./multimedia_output"
    ) -> Dict[str, Any]:
        """
        Generate complete multimedia package for a module using content_latest pipeline
        with database integration
        """
        try:
            logger.info(f"🎬 Starting multimedia generation for content: {content_id[:8]}...")
            
            # 1. Retrieve content from Supabase
            content = self.content_manager.get_module_content(content_id)
            if not content:
                raise ValueError(f"Content not found: {content_id}")
            
            module_name = content['module_name']
            logger.info(f"📚 Retrieved module: {module_name}")
            
            # 2. Create multimedia session in database
            session_id = self.multimedia_manager.create_multimedia_session(
                execution_id=str(uuid.uuid4()),
                course_id=f"{employee_context['name'].lower().replace(' ', '_')}_financial_course",
                employee_name=employee_context['name'],
                employee_id=employee_context.get('id', 'emp_001'),
                course_title=f"Personalized Course for {employee_context['name']}",
                total_modules=1,
                personalization_level="standard"
            )
            
            logger.info(f"✅ Created session: {session_id}")
            
            # 3. Prepare content for content_latest pipeline
            module_content = {
                "module_metadata": {
                    "module_name": module_name,
                    "content_id": content_id,
                    "employee_name": employee_context['name'],
                    "total_words": sum(len(section.split()) for section in [
                        content.get('introduction', ''),
                        content.get('core_content', ''),
                        content.get('practical_applications', ''),
                        content.get('case_studies', ''),
                        content.get('assessments', '')
                    ] if section)
                },
                "content": {
                    "introduction": content.get('introduction', ''),
                    "core_content": content.get('core_content', ''),
                    "practical_applications": content.get('practical_applications', ''),
                    "case_studies": content.get('case_studies', ''),
                    "assessments": content.get('assessments', '')
                },
                "personalization": employee_context
            }
            
            # 4. Set up output directory
            employee_safe_name = employee_context['name'].lower().replace(' ', '_')
            module_safe_name = module_name.lower().replace(' ', '_')
            output_dir = Path(output_base_dir) / employee_safe_name / module_safe_name
            output_dir.mkdir(parents=True, exist_ok=True)
            
            # 5. Run content_latest multimedia generation
            logger.info("🎬 Running content_latest multimedia pipeline...")
            
            # Create temporary JSON file for content_latest pipeline
            with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as temp_file:
                json.dump(module_content, temp_file, indent=2)
                temp_json_path = temp_file.name
            
            try:
                # Run the content_latest orchestrator
                result = self.orchestrator.generate_complete_course(
                    employee_file=temp_json_path,
                    output_dir=str(output_dir)
                )
                
                logger.info(f"✅ Content_latest pipeline completed: {result.get('employee_name', 'unknown')}")
                
            finally:
                # Clean up temp file
                if os.path.exists(temp_json_path):
                    os.remove(temp_json_path)
            
            # 6. Register generated assets in database
            assets_registered = []
            
            # Register audio asset
            audio_files = list(output_dir.glob("**/narration_audio.mp3"))
            if audio_files:
                audio_file = audio_files[0]
                audio_asset_id = self.multimedia_manager.register_multimedia_asset(
                    session_id=session_id,
                    content_id=content_id,
                    course_id=f"{employee_safe_name}_financial_course",
                    module_name=module_name,
                    asset_type='audio',
                    asset_category='module_complete',
                    file_path=str(audio_file),
                    file_name=audio_file.name,
                    duration_seconds=module_content['module_metadata']['total_words'] // 2.5,  # ~150 WPM
                    file_format='mp3',
                    generated_with='openai_tts'
                )
                
                # Update status to completed
                self.multimedia_manager.update_asset_status(
                    asset_id=audio_asset_id,
                    status='completed',
                    ready_for_delivery=True,
                    processing_duration_ms=5000,
                    file_size_bytes=audio_file.stat().st_size if audio_file.exists() else 0
                )
                
                assets_registered.append({'type': 'audio', 'asset_id': audio_asset_id, 'file': str(audio_file)})
                logger.info(f"✅ Registered audio asset: {audio_asset_id}")
            
            # Register video asset
            video_files = list(output_dir.glob("**/*.mp4"))
            if video_files:
                video_file = video_files[0]
                video_asset_id = self.multimedia_manager.register_multimedia_asset(
                    session_id=session_id,
                    content_id=content_id,
                    course_id=f"{employee_safe_name}_financial_course",
                    module_name=module_name,
                    asset_type='video',
                    asset_category='module_complete',
                    file_path=str(video_file),
                    file_name=video_file.name,
                    duration_seconds=module_content['module_metadata']['total_words'] // 2.5,  # Same as audio
                    file_format='mp4',
                    generated_with='content_latest_pipeline'
                )
                
                # Update status to completed
                self.multimedia_manager.update_asset_status(
                    asset_id=video_asset_id,
                    status='completed',
                    ready_for_delivery=True,
                    processing_duration_ms=15000,
                    file_size_bytes=video_file.stat().st_size if video_file.exists() else 0
                )
                
                assets_registered.append({'type': 'video', 'asset_id': video_asset_id, 'file': str(video_file)})
                logger.info(f"✅ Registered video asset: {video_asset_id}")
            
            # Register slide assets
            slide_files = list(output_dir.glob("**/*.png"))
            for slide_file in slide_files:
                slide_asset_id = self.multimedia_manager.register_multimedia_asset(
                    session_id=session_id,
                    content_id=content_id,
                    course_id=f"{employee_safe_name}_financial_course",
                    module_name=module_name,
                    asset_type='image',
                    asset_category='slide',
                    file_path=str(slide_file),
                    file_name=slide_file.name,
                    duration_seconds=0,
                    file_format='png',
                    generated_with='content_latest_slide_generator'
                )
                
                # Update status to completed
                self.multimedia_manager.update_asset_status(
                    asset_id=slide_asset_id,
                    status='completed',
                    ready_for_delivery=True,
                    processing_duration_ms=2000,
                    file_size_bytes=slide_file.stat().st_size if slide_file.exists() else 0
                )
                
                assets_registered.append({'type': 'slide', 'asset_id': slide_asset_id, 'file': str(slide_file)})
            
            logger.info(f"✅ Registered {len(slide_files)} slide assets")
            
            # 7. Generate and store personalized script
            script_content = ""
            script_files = list(output_dir.glob("**/audio_script.txt"))
            if script_files:
                script_content = script_files[0].read_text()
            
            script_id = self.multimedia_manager.generate_personalized_script(
                session_id=session_id,
                content_id=content_id,
                course_id=f"{employee_safe_name}_financial_course",
                module_name=module_name,
                source_content=json.dumps(module_content['content']),
                employee_context=employee_context,
                script_type='full_module'
            )
            
            logger.info(f"✅ Generated script: {script_id}")
            
            # 8. Finalize session
            total_assets = len(assets_registered)
            completed_assets = len([a for a in assets_registered if a])
            
            # Update session with final statistics
            self.multimedia_manager.supabase.table('mm_multimedia_sessions').update({
                'status': 'completed',
                'assets_generated': completed_assets,
                'package_ready': True,
                'completed_at': datetime.now().isoformat(),
                'success_rate': (completed_assets / total_assets) * 100 if total_assets > 0 else 0,
                'output_directory': str(output_dir)
            }).eq('session_id', session_id).execute()
            
            # Return comprehensive results
            return {
                "success": True,
                "session_id": session_id,
                "content_id": content_id,
                "module_name": module_name,
                "output_directory": str(output_dir),
                "assets_generated": assets_registered,
                "script_id": script_id,
                "pipeline_used": "content_latest",
                "verification": {
                    "total_assets": total_assets,
                    "completed_assets": completed_assets,
                    "success_rate": (completed_assets / total_assets) * 100 if total_assets > 0 else 0
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Multimedia generation failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "content_id": content_id,
                "session_id": session_id if 'session_id' in locals() else None
            }


def test_single_module_multimedia():
    """Test multimedia generation with a single module"""
    integrator = DatabaseMultimediaIntegrator()
    
    # Use the latest content from Supabase
    content_id = "c3225098-53f4-4b01-b162-d9ff9c795629"
    employee_context = {
        "name": "Kubilaycan Karakas",
        "role": "Junior Financial Analyst",
        "level": "intermediate",
        "goals": "Senior Financial Analyst",
        "id": "kubilaycan_001"
    }
    
    logger.info("🎬 Testing multimedia generation with content_latest pipeline...")
    
    result = integrator.generate_multimedia_for_module(
        content_id=content_id,
        employee_context=employee_context
    )
    
    if result["success"]:
        logger.info("🎉 Multimedia generation completed successfully!")
        logger.info(f"📁 Output directory: {result['output_directory']}")
        logger.info(f"🎯 Session ID: {result['session_id']}")
        logger.info(f"📊 Assets generated: {len(result['assets_generated'])}")
        for asset in result['assets_generated']:
            logger.info(f"   • {asset['type']}: {asset['file']}")
    else:
        logger.error(f"❌ Multimedia generation failed: {result['error']}")
    
    return result


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    test_single_module_multimedia()