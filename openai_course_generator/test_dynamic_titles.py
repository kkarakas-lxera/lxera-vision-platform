#!/usr/bin/env python3
"""
Test dynamic slide title generation for Business Performance Reporting
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

async def test_dynamic_titles():
    """Test video generation with dynamic slide titles"""
    
    try:
        generator = CourseVideoGenerator()
        
        # Module details
        module_id = "f7839b56-0239-4b3c-8b5f-798a4030dc4a"
        module_name = "Introduction to Business Performance Reporting"
        employee_name = "Kubilay Cenk Karakas"
        company_id = "67d7bff4-1149-4f37-952e-af1841fb67fa"
        
        logger.info("🎬 Testing dynamic slide title generation")
        logger.info(f"📚 Module: {module_name}")
        
        # Fetch introduction content
        module_result = generator.supabase.table('cm_module_content').select('*').eq(
            'content_id', module_id
        ).single().execute()
        
        if not module_result.data:
            logger.error("Module not found!")
            return
            
        intro_content = module_result.data['introduction']
        
        # Generate video with new dynamic titles
        result = await generator.generate_section_video(
            employee_name=employee_name,
            module_id=module_id,
            section_name='introduction',
            section_content=intro_content,
            module_name=module_name,
            company_id=company_id
        )
        
        if result['success']:
            logger.info("\n✅ VIDEO GENERATION SUCCESSFUL!")
            logger.info(f"📹 Video URL: {result['video_url']}")
            logger.info(f"⏱️  Duration: {result['duration']:.1f} seconds")
            
            # Query the generated slides to see their titles
            slides = generator.supabase.table('mm_multimedia_assets').select(
                'asset_name, slide_number'
            ).eq(
                'session_id', result['session_id']
            ).eq(
                'asset_type', 'slide'
            ).order('slide_number').execute()
            
            logger.info("\n📊 GENERATED SLIDE TITLES:")
            for slide in slides.data:
                logger.info(f"   Slide {slide['slide_number']}: {slide['asset_name']}")
                
        else:
            logger.error(f"❌ Video generation failed: {result['error']}")
            
    except Exception as e:
        logger.error(f"Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_dynamic_titles())