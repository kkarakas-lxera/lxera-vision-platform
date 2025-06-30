#!/usr/bin/env python3
"""
Test FFmpeg slide to video conversion
"""

import subprocess
import os
import sys
from pathlib import Path

def test_slide_to_video(slide_path: str, output_path: str, duration: float = 5.0):
    """Test converting a slide image to video"""
    
    print(f"Testing slide to video conversion:")
    print(f"  Input: {slide_path}")
    print(f"  Output: {output_path}")
    print(f"  Duration: {duration}s")
    
    # Check input exists
    if not os.path.exists(slide_path):
        print(f"ERROR: Input file not found: {slide_path}")
        return False
    
    # FFmpeg command
    cmd = [
        'ffmpeg',
        '-y',  # Overwrite
        '-loop', '1',  # Loop image
        '-i', slide_path,  # Input
        '-c:v', 'libx264',  # Video codec
        '-t', str(duration),  # Duration
        '-pix_fmt', 'yuv420p',  # Pixel format
        '-vf', 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2',
        '-r', '30',  # Frame rate
        '-b:v', '4M',  # Bitrate
        '-preset', 'medium',
        '-crf', '23',
        output_path
    ]
    
    print(f"\nCommand: {' '.join(cmd)}")
    
    # Run with detailed output
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"\nERROR: FFmpeg failed with code {result.returncode}")
            print(f"STDERR:\n{result.stderr}")
            return False
        
        # Check output exists
        if not os.path.exists(output_path):
            print(f"\nERROR: Output file was not created")
            return False
        
        # Check file size
        size = os.path.getsize(output_path)
        print(f"\nSuccess! Output file: {size / 1024:.1f} KB")
        
        # Validate content
        validate_cmd = [
            'ffprobe',
            '-v', 'error',
            '-select_streams', 'v:0',
            '-show_entries', 'stream=width,height,duration',
            '-of', 'json',
            output_path
        ]
        
        probe_result = subprocess.run(validate_cmd, capture_output=True, text=True)
        if probe_result.returncode == 0:
            import json
            info = json.loads(probe_result.stdout)
            if info.get('streams'):
                stream = info['streams'][0]
                print(f"Video info: {stream.get('width')}x{stream.get('height')}, duration={stream.get('duration')}s")
        
        return True
        
    except Exception as e:
        print(f"\nEXCEPTION: {e}")
        return False


def find_test_slide():
    """Find a slide to test with"""
    patterns = [
        "/tmp/video_gen_*/slides/slide_001.png",
        "/tmp/enhanced_video_production_*/*/slides/slide_001.png"
    ]
    
    import glob
    for pattern in patterns:
        files = glob.glob(pattern)
        if files:
            # Return most recent
            return max(files, key=os.path.getmtime)
    
    return None


if __name__ == "__main__":
    if len(sys.argv) > 1:
        slide_path = sys.argv[1]
    else:
        slide_path = find_test_slide()
        if not slide_path:
            print("No slide found to test. Please provide a slide path.")
            sys.exit(1)
    
    output_path = "/tmp/test_slide_conversion.mp4"
    
    success = test_slide_to_video(slide_path, output_path)
    
    if success:
        # Test frame extraction
        print("\nExtracting test frame...")
        extract_cmd = [
            'ffmpeg',
            '-i', output_path,
            '-ss', '2',
            '-vframes', '1',
            '-y',
            '/tmp/test_frame_extract.png'
        ]
        
        subprocess.run(extract_cmd, capture_output=True)
        
        if os.path.exists('/tmp/test_frame_extract.png'):
            # Analyze frame
            from PIL import Image
            import numpy as np
            
            img = Image.open('/tmp/test_frame_extract.png')
            arr = np.array(img)
            
            print(f"\nFrame analysis:")
            print(f"  Mean brightness: {arr.mean():.1f}")
            print(f"  Unique colors: {len(np.unique(arr.reshape(-1, arr.shape[-1]), axis=0))}")
            
            if arr.mean() < 5:
                print("  WARNING: Frame appears to be BLACK!")
            else:
                print("  Frame has visual content ✓")
    
    sys.exit(0 if success else 1)