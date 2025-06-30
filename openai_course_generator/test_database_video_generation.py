#!/usr/bin/env python3
"""
Test Database-Integrated Video Generation
Uses real employee data and stores videos in Supabase storage
"""

import os
import asyncio
import logging
from pathlib import Path
from datetime import datetime
from supabase import create_client, Client

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Import all components
from multimedia.educational_script_generator import EducationalScriptGenerator
from multimedia.educational_slide_generator import EducationalSlideGenerator
from multimedia.timeline_generator import TimelineGenerator
from multimedia.video_assembly_service import VideoAssemblyService

logger = logging.getLogger(__name__)

class DatabaseVideoGenerator:
    """Generates educational videos using data from Supabase"""
    
    def __init__(self):
        # Initialize Supabase client
        url = os.getenv('VITE_SUPABASE_URL')
        key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')  # Use service role for full access
        if not url or not key:
            raise ValueError("Missing Supabase credentials")
        
        self.supabase: Client = create_client(url, key)
        
        # Initialize multimedia components
        api_key = os.getenv('OPENAI_API_KEY')
        self.script_generator = EducationalScriptGenerator(api_key)
        self.slide_generator = EducationalSlideGenerator(api_key)
        self.timeline_generator = TimelineGenerator(api_key)
        self.video_service = VideoAssemblyService()
        
    async def generate_video_for_employee(
        self, 
        employee_name: str,
        module_id: str,
        output_bucket: str = 'multimedia-assets'
    ):
        """Generate educational video for specific employee and module"""
        
        logger.info(f"Generating video for {employee_name} - Module: {module_id}")
        
        try:
            # 1. Fetch employee data (join with users table for name)
            employee_result = self.supabase.table('employees').select(
                '*, users!employees_user_id_fkey(id, full_name, email)'
            ).execute()
            
            # Filter by name
            employee = None
            for emp in employee_result.data:
                if emp.get('users') and employee_name.lower() in emp['users']['full_name'].lower():
                    employee = emp
                    break
            
            if not employee:
                raise ValueError(f"Employee not found: {employee_name}")
            
            logger.info(f"Found employee: {employee['users']['full_name']} (ID: {employee['id']})")
            
            # 2. Fetch module content
            content_result = self.supabase.table('cm_module_content').select('*').eq(
                'content_id', module_id
            ).execute()
            
            if not content_result.data:
                raise ValueError(f"Module content not found: {module_id}")
            
            content = content_result.data[0]
            logger.info(f"Found module: {content.get('module_name', 'Unknown')}")
            
            # Ensure all required fields exist
            if not all(key in content for key in ['introduction', 'core_content', 'practical_applications']):
                logger.warning("Module content missing required sections, using a different module...")
                # Try the second module which is more complete
                content_result = self.supabase.table('cm_module_content').select('*').eq(
                    'content_id', 'f7839b56-0239-4b3c-8b5f-798a4030dc4a'
                ).execute()
                if content_result.data:
                    content = content_result.data[0]
                    module_id = content['content_id']
                    logger.info(f"Using alternate module: {content.get('module_name')}")
            
            # 3. Create employee context
            employee_context = {
                'id': employee['id'],
                'name': employee['users']['full_name'],
                'role': employee.get('employee_role', 'Professional'),
                'department': employee.get('department', ''),
                'position': employee.get('position', ''),
                'skill_level': employee.get('skill_level', 'intermediate')
            }
            
            # 4. Create temporary working directory
            temp_dir = Path(f'/tmp/video_gen_{datetime.now().strftime("%Y%m%d_%H%M%S")}')
            temp_dir.mkdir(parents=True, exist_ok=True)
            
            # 5. Generate educational script
            logger.info("Generating educational script...")
            script = self.script_generator.generate_educational_script(
                content,
                employee_context,
                target_duration=5  # 5 minute video
            )
            
            # Export script for debugging
            script_path = temp_dir / 'script.json'
            self.script_generator.export_script_to_json(script, str(script_path))
            
            # 6. Generate slides
            logger.info(f"Creating {len(script.slides)} slides...")
            slides_dir = temp_dir / 'slides'
            slides_dir.mkdir(exist_ok=True)
            
            slide_metadata = []
            for slide in script.slides:
                slide_path = slides_dir / f"slide_{slide.slide_number:03d}.png"
                
                metadata = self.slide_generator.create_slide_from_script(
                    slide_number=slide.slide_number,
                    title=slide.title,
                    bullet_points=slide.bullet_points,
                    output_path=str(slide_path),
                    theme='educational',  # Lxera colors
                    speaker_notes=slide.speaker_notes
                )
                
                metadata['animations'] = False  # Disable Ken Burns for stability
                slide_metadata.append(metadata)
            
            # 7. Generate narration timeline
            logger.info("Generating narration with expressive voice...")
            
            # Mock extracted content for timeline compatibility
            class MockExtractedContent:
                def __init__(self):
                    self.timing_map = {f"slide_{i+1}": i * 10.0 for i in range(len(script.slides))}
            
            timeline = await self.timeline_generator.generate_educational_timeline(
                script,
                MockExtractedContent(),
                str(temp_dir),
                voice='fable',  # Expressive voice
                speed=0.95
            )
            
            # 8. Assemble video
            logger.info("Assembling video...")
            # Add random suffix to avoid caching
            import random
            random_suffix = random.randint(1000, 9999)
            video_filename = f"{employee['id']}_{module_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{random_suffix}.mp4"
            video_path = temp_dir / video_filename
            
            result = await self.video_service.assemble_educational_video(
                timeline,
                slide_metadata,
                str(video_path)
            )
            
            if not result.success:
                raise RuntimeError(f"Video assembly failed: {result.error_message}")
            
            logger.info(f"Video created: {result.duration:.1f}s, {result.file_size / 1024 / 1024:.1f}MB")
            
            # Validate video locally before upload
            logger.info("Validating video content...")
            from test_video_validation import VideoValidator
            validator = VideoValidator()
            validation = validator.validate_video(str(video_path))
            
            if not validation['valid']:
                logger.error(f"Video validation failed: {validation['errors']}")
                logger.error(f"Black frames: {validation['black_frames']}/{validation['frames_analyzed']}")
                # Continue anyway to see what happens
            else:
                logger.info(f"Video validation passed! Brightness: {validation['average_brightness']:.1f}")
            
            # 9. Upload to Supabase storage
            logger.info("Uploading to Supabase storage...")
            
            # Read video file
            with open(video_path, 'rb') as f:
                video_data = f.read()
            
            # Upload to storage with organized folder structure
            storage_path = f"{employee['id']}/videos/{video_filename}"
            
            # Ensure the upload overwrites if file exists
            try:
                # Try to delete existing file first
                self.supabase.storage.from_(output_bucket).remove([storage_path])
            except:
                pass  # File might not exist
            
            storage_result = self.supabase.storage.from_(output_bucket).upload(
                storage_path,
                video_data,
                {'content-type': 'video/mp4'}
            )
            
            # Get public URL
            public_url = self.supabase.storage.from_(output_bucket).get_public_url(storage_path)
            
            # 10. Optionally upload slides to storage
            if os.getenv('UPLOAD_SLIDES', 'false').lower() == 'true':
                logger.info("Uploading slides to storage...")
                for slide in slide_metadata:
                    slide_path = slide['file_path']
                    slide_name = os.path.basename(slide_path)
                    with open(slide_path, 'rb') as f:
                        slide_data = f.read()
                    
                    slide_storage_path = f"{employee['id']}/slides/{module_id}/{slide_name}"
                    try:
                        self.supabase.storage.from_(output_bucket).remove([slide_storage_path])
                    except:
                        pass
                    
                    self.supabase.storage.from_(output_bucket).upload(
                        slide_storage_path,
                        slide_data,
                        {'content-type': 'image/png'}
                    )
                logger.info(f"Uploaded {len(slide_metadata)} slides")
            
            # 11. Save video metadata to database
            video_record = {
                'employee_id': employee['id'],
                'module_id': module_id,
                'module_name': content.get('module_name'),
                'video_url': public_url,
                'duration_seconds': result.duration,
                'file_size_bytes': result.file_size,
                'resolution': result.metadata.get('resolution'),
                'voice_used': timeline.metadata.get('voice_used'),
                'slide_count': len(slide_metadata),
                'generated_at': datetime.now().isoformat()
            }
            
            # Insert into educational_videos table (create if doesn't exist)
            try:
                self.supabase.table('educational_videos').insert(video_record).execute()
                logger.info("Video metadata saved to database")
            except Exception as e:
                logger.warning(f"Could not save video metadata: {e}")
            
            # 12. Clean up temporary files
            import shutil
            shutil.rmtree(temp_dir)
            
            logger.info(f"✅ Video successfully generated and uploaded!")
            logger.info(f"📹 Video URL: {public_url}")
            
            return {
                'success': True,
                'video_url': public_url,
                'duration': result.duration,
                'file_size': result.file_size,
                'employee': employee['users']['full_name'],
                'module': content.get('module_name')
            }
            
        except Exception as e:
            logger.error(f"Video generation failed: {e}")
            import traceback
            traceback.print_exc()
            return {
                'success': False,
                'error': str(e)
            }

async def main():
    """Test video generation with real data"""
    
    # Initialize generator
    generator = DatabaseVideoGenerator()
    
    # Test with Kubilay Cenk Karakas
    employee_name = "Kubilay Cenk Karakas"
    
    # Find a module to test with
    # First, let's list available modules
    logger.info("Fetching available modules...")
    modules = generator.supabase.table('cm_module_content').select(
        'content_id, module_name'
    ).limit(5).execute()
    
    if modules.data:
        logger.info("Available modules:")
        for module in modules.data:
            logger.info(f"  - {module['content_id']}: {module['module_name']}")
        
        # Use the first module
        test_module_id = modules.data[0]['content_id']
        
        # Generate video
        result = await generator.generate_video_for_employee(
            employee_name=employee_name,
            module_id=test_module_id
        )
        
        if result['success']:
            print("\n✅ Video Generation Successful!")
            print(f"Employee: {result['employee']}")
            print(f"Module: {result['module']}")
            print(f"Duration: {result['duration']:.1f} seconds")
            print(f"Size: {result['file_size'] / 1024 / 1024:.1f} MB")
            print(f"URL: {result['video_url']}")
        else:
            print(f"\n❌ Video Generation Failed: {result['error']}")
    else:
        print("No modules found in database")

if __name__ == "__main__":
    asyncio.run(main())