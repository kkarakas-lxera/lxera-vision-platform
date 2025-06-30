#!/usr/bin/env python3
"""
Test Enhanced Video Generation with All Improvements
Tests Lxera colors, fixed spacing, human narration, and video assembly
"""

import os
import json
import asyncio
import logging
from pathlib import Path
from datetime import datetime

# Configure logging to see debug messages
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Import all components
from multimedia.educational_script_generator import EducationalScriptGenerator
from multimedia.content_essence_extractor import ContentEssenceExtractor
from multimedia.human_narration_generator import HumanNarrationGenerator
from multimedia.educational_slide_generator import EducationalSlideGenerator
from multimedia.timeline_generator import TimelineGenerator
from multimedia.video_assembly_service import VideoAssemblyService

# Test content that showcases the improvements
TEST_CONTENT = {
    'content_id': 'test_enhanced_001',
    'module_name': 'Mastering Data Visualization',
    'introduction': """
    Welcome to an exciting journey into the world of data visualization! 
    
    In today's data-driven world, the ability to transform complex information into 
    clear, compelling visual stories is not just a skill—it's a superpower. 
    
    This module will equip you with the knowledge and techniques to create 
    visualizations that not only inform but inspire action.
    """,
    'core_content': """
    The Foundation of Great Visualizations
    
    Every powerful data visualization rests on three essential pillars:
    
    1. **Clarity**: Your message must be immediately apparent. Remove all unnecessary 
    elements that don't serve your core narrative. Think of each pixel as precious 
    real estate that must earn its place.
    
    2. **Context**: Numbers without context are meaningless. Always provide reference 
    points, comparisons, and benchmarks that help your audience understand the 
    significance of what they're seeing.
    
    3. **Connection**: The best visualizations create an emotional connection with 
    the viewer. They tell a story that resonates on both intellectual and visceral levels.
    
    Remember: You're not just presenting data—you're revealing insights that can 
    transform decisions and drive meaningful change.
    """,
    'practical_applications': """
    Putting Theory Into Practice
    
    Let's explore how to apply these principles in real-world scenarios:
    
    **Scenario 1: Executive Dashboard**
    When creating dashboards for senior leadership, focus on KPIs that directly 
    tie to strategic objectives. Use color strategically—red for critical issues, 
    green for on-track metrics, and amber for areas needing attention.
    
    **Scenario 2: Public Communication**
    When visualizing data for public consumption, simplicity is paramount. 
    Use familiar chart types, clear labels, and annotations that guide the 
    viewer through your narrative.
    
    **Scenario 3: Technical Analysis**
    For technical audiences, you can include more complexity, but always 
    provide a clear hierarchy of information. Start with the big picture, 
    then allow drill-down into details.
    """,
    'case_studies': """
    Success Stories That Inspire
    
    **The Dashboard That Saved Millions**
    A Fortune 500 company implemented a real-time supply chain visualization 
    that revealed inefficiencies invisible in traditional reports. Within six 
    months, they reduced costs by 23% and improved delivery times by 40%.
    
    **The Chart That Changed Policy**
    A simple line graph showing the correlation between education funding and 
    student outcomes influenced legislative decisions in multiple states, 
    leading to increased investment in public education.
    
    These examples demonstrate that great data visualization isn't just about 
    aesthetics—it's about impact.
    """
}

EMPLOYEE_CONTEXT = {
    'name': 'Sarah',
    'role': 'Senior Data Analyst',
    'department': 'Business Intelligence',
    'skill_level': 'intermediate'
}

async def test_enhanced_video_generation():
    """Test the complete enhanced video generation pipeline"""
    
    # Initialize components
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("Error: OPENAI_API_KEY not set")
        return
    
    script_generator = EducationalScriptGenerator(api_key)
    slide_generator = EducationalSlideGenerator(api_key)
    timeline_generator = TimelineGenerator(api_key)
    video_service = VideoAssemblyService()
    
    # Create output directory
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_dir = Path(f'/tmp/enhanced_video_test_{timestamp}')
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Output directory: {output_dir}")
    
    try:
        # Step 1: Generate educational script with essence extraction
        print("\n1. Generating educational script with content essence...")
        script = script_generator.generate_educational_script(
            TEST_CONTENT,
            EMPLOYEE_CONTEXT,
            target_duration=5  # 5 minute video
        )
        
        # Export script for debugging
        script_generator.export_script_to_json(
            script, 
            output_dir / 'educational_script.json'
        )
        print(f"✓ Generated script with {len(script.slides)} slides")
        
        # Step 2: Generate slides with Lxera colors and fixed spacing
        print("\n2. Creating slides with Lxera branding...")
        slide_metadata = []
        slides_dir = output_dir / 'slides'
        slides_dir.mkdir(exist_ok=True)
        
        for slide in script.slides:
            print(f"  Creating slide {slide.slide_number}: {slide.title}")
            
            # Use educational theme with Lxera colors
            slide_path = slides_dir / f"slide_{slide.slide_number:03d}.png"
            
            slide_generator.create_slide_from_content(
                slide_number=slide.slide_number,
                title=slide.title,
                bullet_points=slide.bullet_points,
                output_path=str(slide_path),
                theme='educational',  # Uses Lxera colors
                animations=True,
                speaker_notes=slide.speaker_notes
            )
            
            slide_metadata.append({
                'slide_number': slide.slide_number,
                'slide_id': f"slide_{slide.slide_number}",
                'file_path': str(slide_path),
                'title': slide.title,
                'duration': slide.duration_estimate,
                'animations': True
            })
        
        print(f"✓ Created {len(slide_metadata)} slides with Lxera branding")
        
        # Step 3: Generate human-like narration with emotion
        print("\n3. Generating human-like narration...")
        
        # Create a mock extracted content for timeline
        class MockExtractedContent:
            def __init__(self):
                self.timing_map = {f"slide_{i+1}": i * 10.0 for i in range(len(script.slides))}
        
        extracted_content = MockExtractedContent()
        
        # Generate timeline with expressive voice
        timeline = await timeline_generator.generate_educational_timeline(
            script,
            extracted_content,
            str(output_dir),
            voice='fable',  # Expressive British accent
            speed=0.95      # Slightly slower for clarity
        )
        
        print(f"✓ Generated narration: {timeline.total_duration:.1f} seconds")
        
        # Step 4: Assemble video
        print("\n4. Assembling final video...")
        video_path = output_dir / f"{TEST_CONTENT['module_name'].lower().replace(' ', '_')}.mp4"
        
        def progress_callback(percent, message):
            print(f"  {percent}% - {message}")
        
        result = await video_service.assemble_educational_video(
            timeline,
            slide_metadata,
            str(video_path),
            progress_callback=progress_callback
        )
        
        if result.success:
            print(f"\n✓ Video created successfully!")
            print(f"  Path: {result.video_path}")
            print(f"  Duration: {result.duration:.1f} seconds")
            print(f"  Size: {result.file_size / 1024 / 1024:.1f} MB")
            print(f"  Resolution: {result.metadata['resolution']}")
            
            # Create thumbnail
            thumbnail_path = output_dir / 'thumbnail.jpg'
            video_service.create_thumbnail(
                result.video_path,
                str(thumbnail_path),
                timestamp=5.0
            )
            print(f"  Thumbnail: {thumbnail_path}")
            
            # Verify video has both audio and video streams
            import subprocess
            probe_cmd = [
                'ffprobe', '-v', 'error',
                '-show_streams',
                '-print_format', 'json',
                result.video_path
            ]
            
            probe_result = subprocess.run(probe_cmd, capture_output=True, text=True)
            if probe_result.returncode == 0:
                streams = json.loads(probe_result.stdout)
                video_streams = [s for s in streams['streams'] if s['codec_type'] == 'video']
                audio_streams = [s for s in streams['streams'] if s['codec_type'] == 'audio']
                
                print(f"\n✓ Video verification:")
                print(f"  Video streams: {len(video_streams)}")
                if video_streams:
                    print(f"    - Codec: {video_streams[0]['codec_name']}")
                    print(f"    - Resolution: {video_streams[0]['width']}x{video_streams[0]['height']}")
                print(f"  Audio streams: {len(audio_streams)}")
                if audio_streams:
                    print(f"    - Codec: {audio_streams[0]['codec_name']}")
                    print(f"    - Sample rate: {audio_streams[0]['sample_rate']} Hz")
            
        else:
            print(f"\n✗ Video creation failed: {result.error_message}")
            
    except Exception as e:
        print(f"\n✗ Error during video generation: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # Run the test
    asyncio.run(test_enhanced_video_generation())