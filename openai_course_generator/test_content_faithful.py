#!/usr/bin/env python3
"""
Test content-faithful video generation
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

async def test_content_faithful():
    """Test video generation that stays faithful to source content"""
    
    try:
        generator = CourseVideoGenerator()
        
        # Module details
        module_id = "f7839b56-0239-4b3c-8b5f-798a4030dc4a"
        module_name = "Introduction to Business Performance Reporting"
        employee_name = "Kubilay Cenk Karakas"
        company_id = "67d7bff4-1149-4f37-952e-af1841fb67fa"
        
        logger.info("🎬 Testing content-faithful video generation")
        logger.info(f"📚 Module: {module_name}")
        logger.info("🎯 Expected: Video content should match source introduction about Business Performance Reporting")
        
        # Fetch all sections to provide context
        module_result = generator.supabase.table('cm_module_content').select('*').eq(
            'content_id', module_id
        ).single().execute()
        
        if not module_result.data:
            logger.error("Module not found!")
            return
            
        # Get all sections for context
        all_sections = {}
        for field in ['introduction', 'core_content', 'practical_applications', 'case_studies', 'assessments']:
            if field in module_result.data and module_result.data[field]:
                all_sections[field] = module_result.data[field]
        
        intro_content = module_result.data['introduction']
        
        logger.info("📋 Source content topics:")
        logger.info("   - Business Performance Reporting")
        logger.info("   - Advanced analytical techniques")
        logger.info("   - Industry trends")
        logger.info("   - Strategic recommendations")
        logger.info("   - Data visualization and storytelling")
        
        # Generate video with content-faithful approach
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
            
            # Query the generated slides to check content alignment
            slides = generator.supabase.table('mm_multimedia_assets').select(
                'asset_name, slide_number'
            ).eq(
                'session_id', result['session_id']
            ).eq(
                'asset_type', 'slide'
            ).order('slide_number').execute()
            
            logger.info("\n📊 CONTENT ALIGNMENT CHECK:")
            for slide in slides.data:
                slide_title = slide['asset_name']
                logger.info(f"   Slide {slide['slide_number']}: {slide_title}")
                
                # Check if titles reflect actual content
                if 'business performance' in slide_title.lower():
                    logger.info("     ✅ Contains 'business performance' - ALIGNED")
                elif 'reporting' in slide_title.lower():
                    logger.info("     ✅ Contains 'reporting' - ALIGNED")
                elif 'strategic' in slide_title.lower():
                    logger.info("     ✅ Contains 'strategic' - ALIGNED") 
                elif 'analytical' in slide_title.lower() and 'business' in slide_title.lower():
                    logger.info("     ✅ Contains 'analytical' + business context - ALIGNED")
                elif slide['slide_number'] == 1 and 'introduction' in slide_title.lower():
                    logger.info("     ✅ Title slide - APPROPRIATE")
                else:
                    logger.info("     ❌ Generic title, not specific to content - MISALIGNED")
                
        else:
            logger.error(f"❌ Video generation failed: {result['error']}")
            
    except Exception as e:
        logger.error(f"Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_content_faithful())