#!/usr/bin/env python3
"""
Debug Video Assembly
"""

import os
import asyncio
import logging
from pathlib import Path

# Configure logging for debug
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

from multimedia.video_assembly_service import VideoAssemblyService

async def debug_video_assembly():
    """Debug video assembly with existing files"""
    
    # Use the most recent test output
    test_dir = Path("/tmp/enhanced_video_test_20250630_131414")
    
    if not test_dir.exists():
        print(f"Test directory not found: {test_dir}")
        return
    
    # Load timeline
    import json
    timeline_path = test_dir / "timeline.json"
    with open(timeline_path) as f:
        timeline_data = json.load(f)
    
    # Create timeline object
    class Timeline:
        def __init__(self, data):
            self.narration_file = data['narration_file']
            self.total_duration = data['total_duration']
            self.slide_transitions = []
            for trans in data['slide_transitions']:
                self.slide_transitions.append(type('obj', (object,), trans))
    
    timeline = Timeline(timeline_data)
    
    # Create slide metadata
    slide_metadata = []
    slides_dir = test_dir / "slides"
    for slide_file in sorted(slides_dir.glob("slide_*.png")):
        slide_num = int(slide_file.stem.split('_')[1])
        slide_metadata.append({
            'slide_number': slide_num,
            'slide_id': f"slide_{slide_num}",
            'file_path': str(slide_file),
            'animations': False
        })
    
    print(f"Found {len(slide_metadata)} slides")
    print(f"Timeline has {len(timeline.slide_transitions)} transitions")
    print(f"Narration file: {timeline.narration_file}")
    
    # Initialize video service
    video_service = VideoAssemblyService()
    
    # Assemble video
    output_path = test_dir / "debug_video.mp4"
    
    def progress_callback(percent, message):
        print(f"{percent}% - {message}")
    
    result = await video_service.assemble_educational_video(
        timeline,
        slide_metadata,
        str(output_path),
        progress_callback=progress_callback
    )
    
    if result.success:
        print(f"\nVideo created successfully: {result.video_path}")
        print(f"Duration: {result.duration:.1f}s")
        print(f"Size: {result.file_size / 1024 / 1024:.1f}MB")
    else:
        print(f"\nVideo creation failed: {result.error_message}")

if __name__ == "__main__":
    asyncio.run(debug_video_assembly())