#!/usr/bin/env python3
"""
Video Content Validation Test
Ensures generated videos have actual visual content (not black screens)
"""

import os
import subprocess
import tempfile
from pathlib import Path
import numpy as np
from PIL import Image
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VideoValidator:
    """Validates that videos contain actual visual content"""
    
    def __init__(self):
        self.ffmpeg_path = "ffmpeg"
        self.ffprobe_path = "ffprobe"
    
    def validate_video(self, video_path: str) -> dict:
        """
        Validate video has visual content
        
        Returns:
            dict with validation results
        """
        results = {
            'valid': False,
            'exists': False,
            'has_video_stream': False,
            'has_audio_stream': False,
            'duration': 0,
            'resolution': None,
            'frames_analyzed': 0,
            'black_frames': 0,
            'content_frames': 0,
            'average_brightness': 0,
            'errors': []
        }
        
        try:
            # Check file exists
            if not os.path.exists(video_path):
                results['errors'].append(f"Video file not found: {video_path}")
                return results
            
            results['exists'] = True
            
            # Get video info with ffprobe
            probe_cmd = [
                self.ffprobe_path,
                '-v', 'error',
                '-select_streams', 'v:0',
                '-show_entries', 'stream=width,height,duration,codec_type',
                '-of', 'json',
                video_path
            ]
            
            probe_result = subprocess.run(probe_cmd, capture_output=True, text=True)
            if probe_result.returncode == 0:
                import json
                probe_data = json.loads(probe_result.stdout)
                if probe_data.get('streams'):
                    stream = probe_data['streams'][0]
                    results['has_video_stream'] = stream.get('codec_type') == 'video'
                    results['resolution'] = f"{stream.get('width')}x{stream.get('height')}"
                    results['duration'] = float(stream.get('duration', 0))
            
            # Check for audio stream
            audio_cmd = probe_cmd.copy()
            audio_cmd[4] = 'a:0'  # Select audio stream
            audio_result = subprocess.run(audio_cmd, capture_output=True, text=True)
            if audio_result.returncode == 0:
                audio_data = json.loads(audio_result.stdout)
                results['has_audio_stream'] = bool(audio_data.get('streams'))
            
            # Extract and analyze frames
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_path = Path(temp_dir)
                
                # Extract frames at different timestamps
                timestamps = [0.5, 2.0, 5.0, 10.0, 15.0]  # Sample at these seconds
                brightness_values = []
                
                for i, timestamp in enumerate(timestamps):
                    if timestamp >= results['duration']:
                        continue
                    
                    frame_path = temp_path / f"frame_{i:03d}.png"
                    
                    # Extract frame
                    extract_cmd = [
                        self.ffmpeg_path,
                        '-ss', str(timestamp),
                        '-i', video_path,
                        '-vframes', '1',
                        '-y',
                        str(frame_path)
                    ]
                    
                    extract_result = subprocess.run(
                        extract_cmd, 
                        capture_output=True
                    )
                    
                    if extract_result.returncode == 0 and frame_path.exists():
                        # Analyze frame
                        try:
                            img = Image.open(frame_path)
                            img_array = np.array(img)
                            
                            # Calculate average brightness
                            brightness = np.mean(img_array)
                            brightness_values.append(brightness)
                            
                            results['frames_analyzed'] += 1
                            
                            # Check if frame is black (brightness < 5)
                            if brightness < 5:
                                results['black_frames'] += 1
                                logger.warning(f"Black frame detected at {timestamp}s")
                            else:
                                results['content_frames'] += 1
                                
                            # Log frame info
                            unique_colors = len(np.unique(img_array.reshape(-1, img_array.shape[-1]), axis=0))
                            logger.info(f"Frame at {timestamp}s: brightness={brightness:.2f}, colors={unique_colors}")
                            
                        except Exception as e:
                            logger.error(f"Failed to analyze frame at {timestamp}s: {e}")
                
                # Calculate average brightness
                if brightness_values:
                    results['average_brightness'] = float(np.mean(brightness_values))
                
                # Determine if video is valid
                if results['frames_analyzed'] > 0:
                    # Video is valid if:
                    # 1. Most frames have content (not black)
                    # 2. Average brightness is reasonable
                    content_ratio = results['content_frames'] / results['frames_analyzed']
                    results['valid'] = (
                        content_ratio >= 0.5 and 
                        results['average_brightness'] > 10
                    )
                    
                    if not results['valid']:
                        results['errors'].append(
                            f"Video appears to be mostly black: "
                            f"{results['black_frames']}/{results['frames_analyzed']} frames are black"
                        )
            
            return results
            
        except Exception as e:
            results['errors'].append(f"Validation error: {str(e)}")
            return results
    
    def print_validation_report(self, video_path: str, results: dict):
        """Print a formatted validation report"""
        print(f"\n{'='*60}")
        print(f"Video Validation Report")
        print(f"{'='*60}")
        print(f"File: {video_path}")
        print(f"Exists: {'✓' if results['exists'] else '✗'}")
        print(f"Valid: {'✓' if results['valid'] else '✗'}")
        print(f"")
        print(f"Video Properties:")
        print(f"  Duration: {results['duration']:.1f}s")
        print(f"  Resolution: {results['resolution']}")
        print(f"  Has Video: {'✓' if results['has_video_stream'] else '✗'}")
        print(f"  Has Audio: {'✓' if results['has_audio_stream'] else '✗'}")
        print(f"")
        print(f"Content Analysis:")
        print(f"  Frames Analyzed: {results['frames_analyzed']}")
        print(f"  Content Frames: {results['content_frames']}")
        print(f"  Black Frames: {results['black_frames']}")
        print(f"  Average Brightness: {results['average_brightness']:.1f}")
        print(f"")
        
        if results['errors']:
            print(f"Errors:")
            for error in results['errors']:
                print(f"  - {error}")
        
        print(f"{'='*60}\n")


def test_latest_video():
    """Test the most recently generated video"""
    # Find the latest video in temp directory
    import glob
    
    video_patterns = [
        "/tmp/video_gen_*/9619c6da-5969-4837-a7dd-7237c9c47ee6_*.mp4",
        "/tmp/test_slide_video.mp4"
    ]
    
    latest_video = None
    latest_time = 0
    
    for pattern in video_patterns:
        for video_path in glob.glob(pattern):
            mtime = os.path.getmtime(video_path)
            if mtime > latest_time:
                latest_time = mtime
                latest_video = video_path
    
    if not latest_video:
        print("No video files found to test")
        return
    
    print(f"Testing video: {latest_video}")
    
    validator = VideoValidator()
    results = validator.validate_video(latest_video)
    validator.print_validation_report(latest_video, results)
    
    return results['valid']


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        # Test specific video
        video_path = sys.argv[1]
        validator = VideoValidator()
        results = validator.validate_video(video_path)
        validator.print_validation_report(video_path, results)
        
        # Exit with error code if invalid
        sys.exit(0 if results['valid'] else 1)
    else:
        # Test latest video
        valid = test_latest_video()
        sys.exit(0 if valid else 1)