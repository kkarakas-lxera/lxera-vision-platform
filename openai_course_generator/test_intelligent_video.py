#!/usr/bin/env python3
"""
Test intelligent video generation with AI-driven section analysis
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

async def test_intelligent_generation():
    """Test video generation with AI-driven parameters"""
    
    try:
        generator = CourseVideoGenerator()
        
        # Module details
        module_id = "f7839b56-0239-4b3c-8b5f-798a4030dc4a"
        module_name = "Introduction to Business Performance Reporting"
        employee_name = "Kubilay Cenk Karakas"
        company_id = "67d7bff4-1149-4f37-952e-af1841fb67fa"
        
        logger.info("🎬 Testing AI-driven intelligent video generation")
        logger.info(f"📚 Module: {module_name}")
        
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
        
        logger.info(f"📊 Found {len(all_sections)} sections in module")
        logger.info("🤖 AI will analyze section purpose and determine optimal parameters...")
        
        # Generate video with AI-determined parameters
        result = await generator.generate_section_video(
            employee_name=employee_name,
            module_id=module_id,
            section_name='introduction',
            section_content=intro_content,
            module_name=module_name,
            company_id=company_id
            # Note: NOT specifying target_duration - let AI decide
        )
        
        if result['success']:
            logger.info("\n✅ VIDEO GENERATION SUCCESSFUL!")
            logger.info(f"📹 Video URL: {result['video_url']}")
            logger.info(f"⏱️  Duration: {result['duration']:.1f} seconds ({result['duration']/60:.1f} minutes)")
            logger.info(f"💾 File size: {result['file_size'] / 1024 / 1024:.1f} MB")
            
            # Query the generated slides to see their titles
            slides = generator.supabase.table('mm_multimedia_assets').select(
                'asset_name, slide_number'
            ).eq(
                'session_id', result['session_id']
            ).eq(
                'asset_type', 'slide'
            ).order('slide_number').execute()
            
            logger.info("\n📊 AI-OPTIMIZED SLIDE STRUCTURE:")
            for slide in slides.data:
                logger.info(f"   Slide {slide['slide_number']}: {slide['asset_name']}")
                
        else:
            logger.error(f"❌ Video generation failed: {result['error']}")
            
    except Exception as e:
        logger.error(f"Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_intelligent_generation())