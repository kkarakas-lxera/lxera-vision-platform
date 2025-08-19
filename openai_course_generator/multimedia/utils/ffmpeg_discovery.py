#!/usr/bin/env python3
"""
FFmpeg Discovery Script
Cross-platform FFmpeg detection and validation for video processing
"""

import os
import shutil
import platform
import subprocess
import logging
from pathlib import Path
from typing import Optional, Dict, List

logger = logging.getLogger(__name__)


class FFmpegDiscovery:
    """Cross-platform FFmpeg discovery and validation"""
    
    def __init__(self):
        self.system = platform.system().lower()
        self.ffmpeg_path = None
        self.ffprobe_path = None
        self.version_info = None
    
    def get_search_paths(self) -> List[str]:
        """Get platform-specific search paths for FFmpeg"""
        base_paths = [shutil.which('ffmpeg')]
        
        if self.system == 'darwin':  # macOS
            base_paths.extend([
                '/usr/local/bin/ffmpeg',
                '/opt/homebrew/bin/ffmpeg',
                '/opt/local/bin/ffmpeg',  # MacPorts
                '/usr/bin/ffmpeg'
            ])
        elif self.system == 'linux':
            base_paths.extend([
                '/usr/bin/ffmpeg',
                '/usr/local/bin/ffmpeg',
                '/snap/bin/ffmpeg',
                '/usr/local/ffmpeg/bin/ffmpeg'
            ])
        elif self.system == 'windows':
            base_paths.extend([
                'C:\\ffmpeg\\bin\\ffmpeg.exe',
                'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
                'C:\\Program Files (x86)\\ffmpeg\\bin\\ffmpeg.exe',
                os.path.expanduser('~\\ffmpeg\\bin\\ffmpeg.exe')
            ])
        
        # Filter out None values and return existing paths
        return [path for path in base_paths if path and os.path.isfile(path)]
    
    def test_ffmpeg_functionality(self, ffmpeg_path: str) -> Dict[str, any]:
        """Test FFmpeg functionality and get version info"""
        try:
            # Test version command
            result = subprocess.run(
                [ffmpeg_path, '-version'],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode != 0:
                return {'working': False, 'error': f'FFmpeg returned error code {result.returncode}'}
            
            # Parse version information
            version_output = result.stdout
            version_line = next((line for line in version_output.split('\n') if 'ffmpeg version' in line.lower()), '')
            
            # Test basic encoding capability
            test_result = subprocess.run(
                [ffmpeg_path, '-f', 'lavfi', '-i', 'testsrc=duration=1:size=320x240:rate=1', 
                 '-f', 'null', '-'],
                capture_output=True,
                text=True,
                timeout=15
            )
            
            encoding_works = test_result.returncode == 0
            
            return {
                'working': True,
                'version_line': version_line,
                'encoding_capable': encoding_works,
                'full_output': version_output
            }
            
        except subprocess.TimeoutExpired:
            return {'working': False, 'error': 'FFmpeg test timed out'}
        except FileNotFoundError:
            return {'working': False, 'error': 'FFmpeg executable not found'}
        except Exception as e:
            return {'working': False, 'error': f'FFmpeg test failed: {str(e)}'}
    
    def discover_ffmpeg(self) -> bool:
        """Discover and validate FFmpeg installation"""
        logger.info(f"🔍 Discovering FFmpeg on {self.system}...")
        
        search_paths = self.get_search_paths()
        
        if not search_paths:
            logger.error("❌ No FFmpeg candidates found in standard locations")
            return False
        
        # Test each candidate
        for candidate in search_paths:
            logger.info(f"Testing FFmpeg candidate: {candidate}")
            
            test_result = self.test_ffmpeg_functionality(candidate)
            
            if test_result['working']:
                self.ffmpeg_path = candidate
                self.version_info = test_result
                
                # Also try to find ffprobe
                ffprobe_candidate = candidate.replace('ffmpeg', 'ffprobe')
                if os.path.isfile(ffprobe_candidate):
                    self.ffprobe_path = ffprobe_candidate
                
                logger.info(f"✅ FFmpeg found and working: {candidate}")
                logger.info(f"Version: {test_result.get('version_line', 'Unknown')}")
                logger.info(f"Encoding capable: {test_result.get('encoding_capable', False)}")
                
                return True
            else:
                logger.warning(f"⚠️  FFmpeg candidate failed: {test_result.get('error', 'Unknown error')}")
        
        logger.error("❌ No working FFmpeg installation found")
        return False
    
    def get_installation_instructions(self) -> str:
        """Get platform-specific installation instructions"""
        if self.system == 'darwin':
            return """
FFmpeg Installation for macOS:
1. Using Homebrew (recommended):
   brew install ffmpeg

2. Using MacPorts:
   sudo port install ffmpeg

3. Manual download:
   Download from https://ffmpeg.org/download.html#build-mac
"""
        elif self.system == 'linux':
            return """
FFmpeg Installation for Linux:
1. Ubuntu/Debian:
   sudo apt update && sudo apt install ffmpeg

2. CentOS/RHEL:
   sudo yum install ffmpeg

3. Fedora:
   sudo dnf install ffmpeg

4. Snap (universal):
   sudo snap install ffmpeg
"""
        elif self.system == 'windows':
            return """
FFmpeg Installation for Windows:
1. Download from https://ffmpeg.org/download.html#build-windows
2. Extract to C:\\ffmpeg\\
3. Add C:\\ffmpeg\\bin to your PATH environment variable
4. Or use chocolatey: choco install ffmpeg
"""
        else:
            return "Visit https://ffmpeg.org/download.html for installation instructions"
    
    def validate_for_video_pipeline(self) -> Dict[str, any]:
        """Validate FFmpeg configuration for video pipeline requirements"""
        if not self.ffmpeg_path:
            return {
                'ready': False,
                'error': 'FFmpeg not discovered',
                'instructions': self.get_installation_instructions()
            }
        
        # Check for required codecs/formats
        required_tests = [
            # Test H.264 encoding
            ([self.ffmpeg_path, '-f', 'lavfi', '-i', 'testsrc=duration=1:size=320x240:rate=1',
              '-c:v', 'libx264', '-f', 'mp4', '-'], 'H.264 video encoding'),
            
            # Test AAC audio encoding
            ([self.ffmpeg_path, '-f', 'lavfi', '-i', 'sine=frequency=1000:duration=1',
              '-c:a', 'aac', '-f', 'mp4', '-'], 'AAC audio encoding'),
        ]
        
        capabilities = {}
        all_passed = True
        
        for test_cmd, description in required_tests:
            try:
                result = subprocess.run(test_cmd, capture_output=True, timeout=10)
                success = result.returncode == 0
                capabilities[description] = success
                if not success:
                    all_passed = False
                    logger.warning(f"⚠️  {description} test failed")
                else:
                    logger.info(f"✅ {description} test passed")
            except Exception as e:
                capabilities[description] = False
                all_passed = False
                logger.error(f"❌ {description} test error: {e}")
        
        return {
            'ready': all_passed,
            'ffmpeg_path': self.ffmpeg_path,
            'ffprobe_path': self.ffprobe_path,
            'version_info': self.version_info,
            'capabilities': capabilities,
            'instructions': None if all_passed else self.get_installation_instructions()
        }


def main():
    """Main entry point for FFmpeg discovery"""
    logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
    
    discovery = FFmpegDiscovery()
    
    if discovery.discover_ffmpeg():
        validation = discovery.validate_for_video_pipeline()
        
        print("\n📊 FFmpeg Validation Report:")
        print(f"Ready for video pipeline: {'✅ Yes' if validation['ready'] else '❌ No'}")
        print(f"FFmpeg path: {validation['ffmpeg_path']}")
        print(f"FFprobe path: {validation.get('ffprobe_path', 'Not found')}")
        
        if validation.get('capabilities'):
            print("\nCapabilities:")
            for capability, status in validation['capabilities'].items():
                print(f"  {capability}: {'✅' if status else '❌'}")
        
        if not validation['ready'] and validation.get('instructions'):
            print(f"\n{validation['instructions']}")
        
        return 0 if validation['ready'] else 1
    else:
        print(f"\n{discovery.get_installation_instructions()}")
        return 1


if __name__ == "__main__":
    exit(main())