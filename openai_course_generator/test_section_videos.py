#!/usr/bin/env python3
"""
Test Section-Based Video Generation
Tests generating individual videos for each content section
"""

import asyncio
import sys
import os
import json
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [%(levelname)s] %(name)s - %(message)s'
)
logger = logging.getLogger('SECTION_TEST')

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

async def test_section_videos():
    """Test section-based video generation"""
    
    content_id = 'f7839b56-0239-4b3c-8b5f-798a4030dc4a'
    module_name = 'Introduction to Business Performance Reporting'
    employee_name = 'Kubilay Cenk Karakas'
    employee_role = 'Junior Financial Analyst'
    
    logger.info('='*100)
    logger.info('SECTION-BASED VIDEO GENERATION TEST')
    logger.info('='*100)
    logger.info(f'Content ID: {content_id}')
    logger.info(f'Module: {module_name}')
    logger.info(f'Employee: {employee_name}')
    logger.info(f'Role: {employee_role}')
    
    try:
        # Import service
        logger.info('\n[IMPORT] Loading Educational Video Service...')
        from multimedia.educational_video_service import EducationalVideoService
        
        # Initialize service
        service = EducationalVideoService()
        logger.info('✓ Service initialized')
        
        # Employee context
        employee_context = {
            'name': employee_name,
            'role': employee_role,
            'skill_gaps': ['financial analysis', 'data visualization'],
            'learning_style': 'visual'
        }
        
        # Progress callback
        def progress_callback(percent, message):
            logger.info(f'[PROGRESS {percent}%] {message}')
        
        # Test 1: Generate only introduction video
        logger.info('\n[TEST 1] Generating introduction section video only...')
        result = await service.generate_section_videos(
            content_id=content_id,
            employee_context=employee_context,
            sections=['introduction'],  # Only introduction
            options={'session_id': 'test_session_001'},
            progress_callback=progress_callback
        )
        
        if result['success']:
            logger.info('✅ Introduction video generated successfully!')
            for video in result['section_videos']:
                logger.info(f"  - Section: {video['section']}")
                logger.info(f"  - Duration: {video['duration']:.1f}s")
                logger.info(f"  - Slides: {video['slide_count']}")
                logger.info(f"  - Path: {video['video_path']}")
        else:
            logger.error(f"❌ Failed: {result['error']}")
            
        # Test 2: Check section durations
        logger.info('\n[TEST 2] Checking section configurations...')
        from multimedia.section_video_generator import SectionVideoGenerator
        
        logger.info('Section time limits:')
        for section, config in SectionVideoGenerator.SECTION_CONFIGS.items():
            max_duration = config['max_duration']
            max_slides = config['max_slides']
            logger.info(f"  - {section}: max {max_duration}s ({max_duration/60:.1f} min), {max_slides} slides")
            
        # Test 3: Generate all sections (mock)
        logger.info('\n[TEST 3] Testing all sections (dry run)...')
        
        # Get content to check available sections
        content = service.content_manager.get_module_content(content_id)
        if content:
            available_sections = []
            for section in ['introduction', 'practical_applications', 'case_studies', 'assessments']:
                if content.get(section):
                    word_count = len(content[section].split())
                    available_sections.append(section)
                    logger.info(f"  ✓ {section}: {word_count} words")
                else:
                    logger.info(f"  ✗ {section}: No content")
                    
            logger.info(f'\nTotal available sections: {len(available_sections)}')
            total_words = content.get('total_word_count', 0)
            logger.info(f'Total module word count: {total_words}')
            
            # Estimate total video duration
            estimated_duration = 0
            for section in available_sections:
                config = SectionVideoGenerator.SECTION_CONFIGS.get(section, {})
                estimated_duration += config.get('max_duration', 180)
            
            logger.info(f'\nEstimated total video duration: {estimated_duration}s ({estimated_duration/60:.1f} minutes)')
            logger.info(f'vs. Single video duration: ~19 minutes')
            logger.info(f'Time savings: ~{19 - (estimated_duration/60):.1f} minutes')
            
        logger.info('\n' + '='*100)
        logger.info('SECTION VIDEO TEST COMPLETE')
        logger.info('='*100)
        
        return result
        
    except Exception as e:
        logger.error(f'\n[CRITICAL ERROR] Test failed: {str(e)}', exc_info=True)
        return {'success': False, 'error': str(e)}

# Run the test
if __name__ == '__main__':
    result = asyncio.run(test_section_videos())
    logger.info(f"\nFinal result: {'SUCCESS' if result.get('success') else 'FAILED'}")