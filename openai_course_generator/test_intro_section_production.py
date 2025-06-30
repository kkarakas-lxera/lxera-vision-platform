#!/usr/bin/env python3
"""
Production Test - Introduction Section Video Generation
Full pipeline with real TTS and video assembly
"""

import asyncio
import sys
import os
import json
import logging
from datetime import datetime
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [%(levelname)s] %(name)s - %(message)s'
)
logger = logging.getLogger('INTRO_PRODUCTION')

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

async def test_introduction_production():
    """Test full production pipeline for introduction section"""
    
    content_id = 'f7839b56-0239-4b3c-8b5f-798a4030dc4a'
    module_name = 'Introduction to Business Performance Reporting'
    employee_name = 'Kubilay Cenk Karakas'
    employee_role = 'Junior Financial Analyst'
    
    logger.info('='*100)
    logger.info('PRODUCTION TEST - INTRODUCTION SECTION VIDEO')
    logger.info('='*100)
    logger.info(f'Content ID: {content_id}')
    logger.info(f'Module: {module_name}')
    logger.info(f'Employee: {employee_name}')
    logger.info(f'Role: {employee_role}')
    logger.info('='*100)
    
    start_time = time.time()
    
    try:
        # Import service
        logger.info('\n[SETUP] Initializing Educational Video Service...')
        from multimedia.educational_video_service import EducationalVideoService
        
        # Initialize service
        service = EducationalVideoService()
        logger.info('✓ Service initialized with OpenAI API key')
        
        # Employee context with more details for personalization
        employee_context = {
            'name': employee_name,
            'role': employee_role,
            'skill_gaps': ['financial analysis', 'data visualization', 'KPI development'],
            'learning_style': 'visual',
            'experience_level': 'junior',
            'goals': 'Become proficient in creating impactful business reports'
        }
        
        # Progress callback with detailed logging
        def progress_callback(percent, message):
            elapsed = time.time() - start_time
            logger.info(f'[PROGRESS {percent:3d}%] [{elapsed:6.1f}s] {message}')
        
        # Output directory for results
        output_dir = f'/tmp/intro_video_production_{datetime.now().strftime("%Y%m%d_%H%M%S")}'
        
        logger.info(f'\n[CONFIG] Production settings:')
        logger.info(f'  - Section: introduction')
        logger.info(f'  - Max duration: 3 minutes')
        logger.info(f'  - Voice: nova (warm and friendly)')
        logger.info(f'  - Design theme: professional')
        logger.info(f'  - Output directory: {output_dir}')
        
        logger.info('\n[PRODUCTION] Starting full video generation pipeline...')
        logger.info('This will include:')
        logger.info('  1. Educational script generation with learning objectives')
        logger.info('  2. Slide content extraction with speaker notes')
        logger.info('  3. Professional slide creation (PNG images)')
        logger.info('  4. OpenAI TTS narration generation')
        logger.info('  5. Audio-slide synchronization')
        logger.info('  6. Video assembly with ffmpeg')
        
        # Generate video for introduction section only
        result = await service.generate_section_videos(
            content_id=content_id,
            employee_context=employee_context,
            sections=['introduction'],  # Only introduction section
            options={
                'session_id': f'prod_test_{datetime.now().strftime("%Y%m%d_%H%M%S")}',
                'voice': 'nova',  # Explicitly set voice
                'speed': 1.0,
                'design_theme': 'professional'
            },
            output_dir=output_dir,
            progress_callback=progress_callback
        )
        
        elapsed_total = time.time() - start_time
        
        if result['success']:
            logger.info('\n' + '='*100)
            logger.info('✅ PRODUCTION VIDEO GENERATED SUCCESSFULLY!')
            logger.info('='*100)
            
            for video in result['section_videos']:
                logger.info(f"\n[VIDEO DETAILS]")
                logger.info(f"  Section: {video['section']}")
                logger.info(f"  Duration: {video['duration']:.1f} seconds ({video['duration']/60:.1f} minutes)")
                logger.info(f"  Slides: {video['slide_count']}")
                logger.info(f"  Video Path: {video['video_path']}")
                logger.info(f"  Video URL: {video.get('video_url', 'Not uploaded')}")
                
                # Check file size
                if os.path.exists(video['video_path']):
                    file_size = os.path.getsize(video['video_path']) / (1024 * 1024)  # MB
                    logger.info(f"  File Size: {file_size:.1f} MB")
                
                # Metadata
                metadata = video.get('metadata', {})
                logger.info(f"\n[METADATA]")
                logger.info(f"  Voice: {metadata.get('voice', 'N/A')}")
                logger.info(f"  Theme: {metadata.get('theme', 'N/A')}")
                logger.info(f"  Word Count: {metadata.get('word_count', 0)}")
                logger.info(f"  Generated At: {metadata.get('generated_at', 'N/A')}")
            
            logger.info(f"\n[PERFORMANCE]")
            logger.info(f"  Total Generation Time: {elapsed_total:.1f} seconds ({elapsed_total/60:.1f} minutes)")
            logger.info(f"  Output Directory: {output_dir}")
            
            # List all generated files
            logger.info(f"\n[GENERATED FILES]")
            if os.path.exists(output_dir):
                for root, dirs, files in os.walk(output_dir):
                    level = root.replace(output_dir, '').count(os.sep)
                    indent = ' ' * 2 * level
                    logger.info(f"{indent}{os.path.basename(root)}/")
                    subindent = ' ' * 2 * (level + 1)
                    for file in files:
                        file_path = os.path.join(root, file)
                        file_size = os.path.getsize(file_path) / 1024  # KB
                        logger.info(f"{subindent}{file} ({file_size:.1f} KB)")
            
            logger.info('\n[NEXT STEPS]')
            logger.info('1. Review the generated video')
            logger.info('2. Check audio quality and timing')
            logger.info('3. Verify slide transitions')
            logger.info('4. Upload to learning platform')
            
        else:
            logger.error(f"\n❌ PRODUCTION FAILED: {result.get('error', 'Unknown error')}")
            logger.error(f"Output directory: {output_dir}")
            
        logger.info('\n' + '='*100)
        logger.info('PRODUCTION TEST COMPLETE')
        logger.info('='*100)
        
        return result
        
    except Exception as e:
        logger.error(f'\n[CRITICAL ERROR] Production test failed: {str(e)}', exc_info=True)
        return {'success': False, 'error': str(e)}

# Run the test
if __name__ == '__main__':
    logger.info("Starting Introduction Section Production Test")
    logger.info("This will generate a real video with TTS narration")
    logger.info("Expected duration: 2-3 minutes for processing\n")
    
    result = asyncio.run(test_introduction_production())
    
    if result.get('success'):
        logger.info("\n🎉 Production test completed successfully!")
        logger.info("Check the output directory for your video file.")
    else:
        logger.info("\n❌ Production test failed. Check logs for details.")