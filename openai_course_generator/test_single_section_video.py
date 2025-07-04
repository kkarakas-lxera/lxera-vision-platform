#!/usr/bin/env python3
"""
Test single section video generation for Kubilay's course content
"""

import os
import asyncio
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

from generate_course_video import CourseVideoGenerator

logger = logging.getLogger(__name__)

async def test_single_section():
    """Test video generation for a single section"""
    
    try:
        generator = CourseVideoGenerator()
        
        # Use Kubilay's "Foundations of Software Engineering" module
        employee_name = "Kubilay Cenk Karakas"
        module_id = "f98a0e25-888f-4559-8e83-207a3bc9bf95"  # Foundations of Software Engineering
        
        logger.info(f"🎬 Testing single section video generation")
        logger.info(f"👤 Employee: {employee_name}")
        logger.info(f"📚 Module ID: {module_id}")
        
        # First fetch the module content to get a section
        module_result = generator.supabase.table('cm_module_content').select('*').eq(
            'content_id', module_id
        ).single().execute()
        
        if not module_result.data:
            logger.error("Module not found!")
            return
            
        module = module_result.data
        module_name = module['module_name']
        
        # Get introduction section content
        intro_content = module.get('introduction')
        if not intro_content:
            logger.error("No introduction content found!")
            return
            
        logger.info(f"📖 Module: {module_name}")
        logger.info(f"📝 Section: Introduction ({len(intro_content.split())} words)")
        
        # Generate video for introduction section
        result = await generator.generate_section_video(
            employee_name=employee_name,
            module_id=module_id,
            section_name='introduction',
            section_content=intro_content,
            module_name=module_name,
            company_id=module.get('company_id')
        )
        
        if result['success']:
            logger.info("✅ Video generation successful!")
            logger.info(f"📹 Video URL: {result['video_url']}")
            logger.info(f"⏱️  Duration: {result['duration']:.1f} seconds")
            logger.info(f"💾 File size: {result['file_size'] / 1024 / 1024:.1f} MB")
            logger.info(f"🎯 Learning objectives: {result.get('learning_objectives', [])}")
            logger.info(f"📊 Assets generated:")
            logger.info(f"   - Slides: {result['assets']['slides']}")
            logger.info(f"   - Audio segments: {result['assets']['audio_segments']}")
            logger.info(f"   - Videos: {result['assets']['video']}")
        else:
            logger.error(f"❌ Video generation failed: {result['error']}")
            
    except Exception as e:
        logger.error(f"Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_single_section())