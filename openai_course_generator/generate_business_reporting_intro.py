#!/usr/bin/env python3
"""
Generate video for Introduction section of Business Performance Reporting module
With real-time monitoring
"""

import os
import asyncio
import logging
from datetime import datetime
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

from generate_course_video import CourseVideoGenerator
from supabase import create_client

logger = logging.getLogger(__name__)

async def monitor_session(supabase_client, session_id, stop_event):
    """Monitor session progress in real-time"""
    logger.info(f"📊 Starting real-time monitoring for session: {session_id}")
    
    last_progress = -1
    last_stage = ""
    
    while not stop_event.is_set():
        try:
            # Query session status
            result = supabase_client.table('mm_multimedia_sessions').select('*').eq(
                'session_id', session_id
            ).single().execute()
            
            if result.data:
                session = result.data
                current_progress = session.get('progress_percentage', 0)
                current_stage = session.get('current_stage', '')
                status = session.get('status', '')
                
                # Log progress changes
                if current_progress != last_progress or current_stage != last_stage:
                    logger.info(f"📈 Progress: {current_progress}% | Stage: {current_stage} | Status: {status}")
                    
                    # Log asset counts if available
                    slides = session.get('slides_generated', 0)
                    audio = session.get('audio_files_generated', 0)
                    videos = session.get('video_files_generated', 0)
                    if slides or audio or videos:
                        logger.info(f"   📊 Assets: Slides={slides}, Audio={audio}, Videos={videos}")
                    
                    last_progress = current_progress
                    last_stage = current_stage
                
                # Check if completed or failed
                if status in ['completed', 'failed']:
                    logger.info(f"🏁 Session {status}!")
                    if status == 'failed':
                        error = session.get('error_details', 'Unknown error')
                        logger.error(f"❌ Error: {error}")
                    stop_event.set()
                    break
                    
        except Exception as e:
            logger.warning(f"Monitor query error: {e}")
        
        # Wait before next check
        await asyncio.sleep(2)  # Check every 2 seconds

async def generate_intro_video():
    """Generate video for Introduction section with monitoring"""
    
    try:
        # Initialize generator
        generator = CourseVideoGenerator()
        
        # Module details
        module_id = "f7839b56-0239-4b3c-8b5f-798a4030dc4a"
        module_name = "Introduction to Business Performance Reporting"
        employee_name = "Kubilay Cenk Karakas"
        company_id = "67d7bff4-1149-4f37-952e-af1841fb67fa"
        
        logger.info("🎬 Starting video generation for Business Performance Reporting - Introduction")
        logger.info(f"📚 Module: {module_name}")
        logger.info(f"👤 Employee: {employee_name}")
        logger.info(f"🏢 Company ID: {company_id}")
        
        # Fetch introduction content
        module_result = generator.supabase.table('cm_module_content').select('*').eq(
            'content_id', module_id
        ).single().execute()
        
        if not module_result.data:
            logger.error("Module not found!")
            return
            
        intro_content = module_result.data['introduction']
        word_count = len(intro_content.split())
        
        logger.info(f"📝 Introduction content: {word_count} words")
        logger.info(f"⏱️  Estimated video duration: {word_count / 150:.1f} minutes")
        
        # Create monitoring event
        stop_monitoring = asyncio.Event()
        
        # Start generation task
        generation_task = asyncio.create_task(
            generator.generate_section_video(
                employee_name=employee_name,
                module_id=module_id,
                section_name='introduction',
                section_content=intro_content,
                module_name=module_name,
                company_id=company_id
            )
        )
        
        # Wait a moment for session to be created
        await asyncio.sleep(2)
        
        # Get session ID from the database (most recent)
        session_query = generator.supabase.table('mm_multimedia_sessions').select('session_id').eq(
            'content_id', module_id
        ).order('created_at', desc=True).limit(1).execute()
        
        if session_query.data:
            session_id = session_query.data[0]['session_id']
            
            # Start monitoring task
            monitor_task = asyncio.create_task(
                monitor_session(generator.supabase, session_id, stop_monitoring)
            )
            
            # Wait for generation to complete
            result = await generation_task
            
            # Stop monitoring
            stop_monitoring.set()
            await monitor_task
            
            # Display results
            if result['success']:
                logger.info("\n✅ VIDEO GENERATION SUCCESSFUL!")
                logger.info(f"📹 Video URL: {result['video_url']}")
                logger.info(f"⏱️  Duration: {result['duration']:.1f} seconds ({result['duration']/60:.1f} minutes)")
                logger.info(f"💾 File size: {result['file_size'] / 1024 / 1024:.1f} MB")
                logger.info(f"🎯 Section type: {result.get('section_type', 'N/A')}")
                logger.info(f"📚 Learning objectives: {len(result.get('learning_objectives', []))}")
                logger.info(f"📊 Assets generated:")
                logger.info(f"   - Slides: {result['assets']['slides']}")
                logger.info(f"   - Audio segments: {result['assets']['audio_segments']}")
                logger.info(f"   - Videos: {result['assets']['video']}")
                
                # Query and display storage paths
                assets = generator.supabase.table('mm_multimedia_assets').select('*').eq(
                    'session_id', result['session_id']
                ).execute()
                
                logger.info(f"\n📦 STORAGE LOCATIONS:")
                for asset in assets.data:
                    if asset['public_url']:
                        logger.info(f"   - {asset['asset_type']}: {asset['public_url']}")
                        
            else:
                logger.error(f"❌ Video generation failed: {result['error']}")
                
        else:
            # No monitoring, just wait for result
            result = await generation_task
            
            if result['success']:
                logger.info("\n✅ VIDEO GENERATION SUCCESSFUL!")
                logger.info(f"📹 Video URL: {result['video_url']}")
            else:
                logger.error(f"❌ Video generation failed: {result['error']}")
                
    except Exception as e:
        logger.error(f"Generation failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(generate_intro_video())