#!/usr/bin/env python3
"""
Test script for improved slide generation
"""
import asyncio
import os
import sys
import logging
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from multimedia.section_video_generator import SectionVideoGenerator
from multimedia.educational_video_service import EducationalVideoService
from database.content_manager import ContentManager

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def test_improved_slides():
    """Test the improved slide generation"""
    try:
        # Content ID for testing
        content_id = "f7839b56-0239-4b3c-8b5f-798a4030dc4a"
        
        # Employee context for personalization
        employee_context = {
            "name": "Kubilay Cenk Karakas",
            "role": "Business Analyst",
            "skill_gaps": ["data_analysis", "reporting"]
        }
        
        # Initialize content manager to fetch content
        content_manager = ContentManager()
        
        # Fetch content from database
        logger.info(f"Fetching content for ID: {content_id}")
        content = content_manager.get_module_content(content_id)
        if not content:
            raise Exception(f"Content not found for ID: {content_id}")
        
        logger.info(f"Content loaded: {content.get('module_name', 'Unknown')}")
        
        # Initialize educational video service
        video_service = EducationalVideoService()
        
        # Initialize generator
        generator = SectionVideoGenerator(video_service)
        
        # Generate introduction section with improved slides
        logger.info("Testing improved slide generation for introduction section...")
        
        section_videos = await generator.generate_section_videos(
            content=content,
            sections_to_generate=["introduction"],
            employee_context=employee_context
        )
        
        # Get the first (and only) section video
        section_video = section_videos[0] if section_videos else None
        if not section_video:
            raise Exception("No section video generated")
        
        logger.info(f"✅ Section video generated successfully!")
        logger.info(f"   Video path: {section_video.video_path}")
        logger.info(f"   Duration: {section_video.duration:.2f}s")
        logger.info(f"   Slide count: {section_video.slide_count}")
        
        # Check if files exist
        video_path = Path(section_video.video_path)
        if video_path.exists():
            logger.info(f"   Video file size: {video_path.stat().st_size / 1024 / 1024:.2f}MB")
            
            # Check for slide files
            slides_dir = video_path.parent / "slides"
            if slides_dir.exists():
                slide_files = list(slides_dir.glob("*.png"))
                logger.info(f"   Generated {len(slide_files)} slide files")
                
                # Log first slide for inspection
                if slide_files:
                    logger.info(f"   First slide: {slide_files[0]}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🎯 Testing Improved Slide Generation")
    print("=" * 50)
    
    success = asyncio.run(test_improved_slides())
    
    if success:
        print("\n✅ Test completed successfully!")
        print("Check the generated slides for improved visuals:")
        print("- Enhanced font sizes and layout")
        print("- Better gradients and backgrounds") 
        print("- Improved content density")
        print("- Professional headers and footers")
    else:
        print("\n❌ Test failed!")