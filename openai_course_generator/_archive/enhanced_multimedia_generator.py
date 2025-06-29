#!/usr/bin/env python3
"""
Enhanced Multimedia Generator with Scene-Based Generation
Extends the standalone generator with dynamic scene capabilities
"""

import os
import sys
import json
import logging
import asyncio
import shutil
import subprocess
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
import tempfile

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from standalone_multimedia_generator import StandaloneMultimediaGenerator
from multimedia.scene_based import (
    DynamicSceneAnalyzer, SceneDefinition,
    SceneGenerator, SceneAssets,
    SceneSynchronizer, SynchronizedScene, SceneTransition
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class EnhancedMultimediaGenerator(StandaloneMultimediaGenerator):
    """Enhanced multimedia generator with scene-based capabilities"""
    
    def __init__(self):
        """Initialize enhanced generator"""
        super().__init__()
        
        # Initialize scene-based components
        self.scene_analyzer = DynamicSceneAnalyzer(self.openai)
        self.scene_synchronizer = SceneSynchronizer()
        
        # Scene generation settings
        self.scene_mode = 'dynamic'  # 'dynamic', 'fixed', or 'hybrid'
        self.target_scene_count = 5
        self.enable_scene_transitions = True
        self.enable_parallel_generation = True
        
        logger.info("✅ Enhanced multimedia generator initialized with scene support")
    
    def generate_multimedia_scene_based(self, content_id: str, 
                                      employee_context: Dict[str, Any],
                                      module_content: Optional[str] = None,
                                      module_metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generate multimedia using dynamic scene-based approach
        
        Args:
            content_id: Module content ID
            employee_context: Employee personalization context
            module_content: Optional pre-loaded module content
            module_metadata: Optional module metadata
            
        Returns:
            Dictionary with generation results and file paths
        """
        self.log_progress("SCENE-BASED GENERATION", "Starting", f"Content ID: {content_id}")
        start_time = datetime.now()
        
        # Create output directory
        output_dir = Path("enhanced_multimedia_output") / employee_context.get('name', 'unknown').lower().replace(' ', '_')
        output_dir.mkdir(parents=True, exist_ok=True)
        
        try:
            # Step 1: Retrieve content if not provided
            if not module_content:
                self.log_progress("CONTENT RETRIEVAL", "Starting", f"ID: {content_id[:8]}...")
                response = self.supabase.table("cm_module_content").select("*").eq("content_id", content_id).execute()
                
                if not response.data:
                    raise ValueError(f"No content found for ID: {content_id}")
                
                content_data = response.data[0]
                
                # Combine all content sections
                content_sections = []
                for section in ['introduction', 'core_content', 'practical_applications', 'case_studies']:
                    section_content = content_data.get(section, '')
                    if section_content and section_content.strip():
                        # Add markdown header to help scene detection
                        content_sections.append(f"## {section.replace('_', ' ').title()}\n\n{section_content}")
                
                module_content = '\n\n'.join(content_sections)
                
                module_metadata = {
                    'name': content_data.get('module_name', 'Unknown Module'),
                    'objectives': content_data.get('learning_objectives', []),
                    'complexity': content_data.get('complexity_level', 'intermediate')
                }
                self.log_progress("CONTENT RETRIEVAL", "Success", module_metadata['name'])
            
            # Step 2: Create multimedia session
            session_id = self.create_multimedia_session(
                content_id, employee_context, mode='dynamic'
            )
            
            # Step 3: Analyze content and create scenes
            self.log_progress("SCENE ANALYSIS", "Starting")
            scenes = self.scene_analyzer.analyze_module_content(
                module_content, module_metadata
            )
            self.log_progress("SCENE ANALYSIS", "Complete", f"{len(scenes)} scenes identified")
            
            # Step 4: Generate scene components
            module_dir = output_dir / self._sanitize_filename(module_metadata['name'])
            module_dir.mkdir(exist_ok=True)
            
            scene_generator = SceneGenerator(self.openai, module_dir)
            
            if self.enable_parallel_generation:
                # Parallel generation
                scene_assets = asyncio.run(
                    scene_generator.generate_scenes_parallel(
                        scenes, employee_context, session_id
                    )
                )
            else:
                # Sequential generation
                scene_assets = []
                for scene in scenes:
                    assets = scene_generator.generate_scene_components_sync(
                        scene, employee_context, session_id
                    )
                    scene_assets.append(assets)
                    self.log_progress("SCENE GENERATION", f"Scene {scene.scene_number}", "Complete")
            
            # Step 5: Synchronize scenes
            self.log_progress("SCENE SYNCHRONIZATION", "Starting")
            synchronized_scenes = []
            for assets in scene_assets:
                if assets.status == 'completed' and assets.audio_path:
                    sync_scene = self.scene_synchronizer.synchronize_scene_elements(assets)
                    synchronized_scenes.append(sync_scene)
                else:
                    logger.warning(f"Skipping failed scene {assets.scene_number}")
            
            # Step 6: Create scene transitions
            transitions = self.scene_synchronizer.create_scene_transitions(synchronized_scenes)
            
            # Step 7: Merge scenes into final video
            self.log_progress("SCENE MERGING", "Starting")
            final_video_path = self._merge_scenes_to_video(
                synchronized_scenes, transitions, module_dir
            )
            
            # Step 8: Upload to storage
            if self.storage_bucket:
                self.log_progress("STORAGE UPLOAD", "Starting")
                storage_urls = self._upload_scene_based_content(
                    session_id, content_id, employee_context,
                    module_metadata['name'], synchronized_scenes,
                    final_video_path, module_dir
                )
            else:
                storage_urls = {}
            
            # Step 9: Update database
            self._update_scene_database(
                session_id, synchronized_scenes, final_video_path
            )
            
            # Calculate metrics
            total_duration = sum(s.timing_data.total_duration for s in synchronized_scenes)
            total_time = (datetime.now() - start_time).total_seconds()
            
            # Prepare results
            results = {
                'success': True,
                'session_id': session_id,
                'scene_count': len(synchronized_scenes),
                'total_duration': total_duration,
                'generation_time': total_time,
                'output_dir': str(module_dir),
                'final_video': str(final_video_path) if final_video_path else None,
                'storage_urls': storage_urls,
                'scenes': [
                    {
                        'number': s.scene_assets.scene_number,
                        'duration': s.timing_data.total_duration,
                        'sync_quality': s.sync_quality_score,
                        'slides': len(s.scene_assets.slide_paths)
                    }
                    for s in synchronized_scenes
                ]
            }
            
            self.log_progress("SCENE-BASED GENERATION", "Complete", 
                            f"{len(synchronized_scenes)} scenes, {total_duration:.1f}s total")
            
            return results
            
        except Exception as e:
            logger.error(f"Scene-based generation failed: {e}", exc_info=True)
            return {
                'success': False,
                'error': str(e),
                'session_id': session_id if 'session_id' in locals() else None
            }
    
    def _merge_scenes_to_video(self, scenes: List[SynchronizedScene],
                              transitions: List[SceneTransition],
                              output_dir: Path) -> Optional[Path]:
        """Merge individual scenes into final video with transitions"""
        
        self.log_progress("VIDEO MERGE", "Preparing")
        
        video_dir = output_dir / "final"
        video_dir.mkdir(exist_ok=True)
        
        try:
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_path = Path(temp_dir)
                
                # Step 1: Generate scene videos
                scene_videos = []
                for i, scene in enumerate(scenes):
                    scene_video = temp_path / f"scene_{scene.scene_assets.scene_number:03d}.mp4"
                    if self._create_scene_video(scene, scene_video):
                        scene_videos.append(scene_video)
                    else:
                        logger.error(f"Failed to create video for scene {scene.scene_assets.scene_number}")
                
                if not scene_videos:
                    raise RuntimeError("No scene videos generated")
                
                # Step 2: Apply transitions between scenes
                transitioned_videos = []
                for i, (video, transition) in enumerate(zip(scene_videos, transitions[1:-1])):
                    if i < len(scene_videos) - 1 and self.enable_scene_transitions:
                        # Apply transition to end of current video
                        transitioned = temp_path / f"transitioned_{i:03d}.mp4"
                        self._apply_scene_transition(
                            video, scene_videos[i + 1], transition, transitioned
                        )
                        transitioned_videos.append(transitioned)
                    else:
                        transitioned_videos.append(video)
                
                # Step 3: Concatenate all videos
                final_video = video_dir / f"{self._sanitize_filename(output_dir.name)}_complete.mp4"
                self._concatenate_videos(transitioned_videos, final_video)
                
                # Step 4: Add chapter markers
                self._add_chapter_markers(final_video, scenes)
                
                self.log_progress("VIDEO MERGE", "Complete", f"{final_video.name}")
                return final_video
                
        except Exception as e:
            logger.error(f"Video merge failed: {e}")
            return None
    
    def _create_scene_video(self, scene: SynchronizedScene, output_path: Path) -> bool:
        """Create video for a single scene"""
        
        try:
            # Get scene assets
            audio_path = scene.scene_assets.audio_path
            slide_paths = scene.scene_assets.slide_paths
            slide_transitions = scene.slide_transitions
            
            if not audio_path or not slide_paths:
                return False
            
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_path = Path(temp_dir)
                
                # Create video segments for each slide
                segments = []
                for i, (slide_path, transition) in enumerate(zip(slide_paths, slide_transitions)):
                    segment_path = temp_path / f"segment_{i:02d}.mp4"
                    
                    # Calculate duration for this slide
                    duration = transition['duration']
                    
                    # Create video from image
                    cmd = [
                        'ffmpeg', '-y', '-loop', '1', '-i', str(slide_path),
                        '-c:v', 'libx264', '-t', str(duration), '-pix_fmt', 'yuv420p',
                        '-vf', 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2',
                        str(segment_path)
                    ]
                    
                    result = subprocess.run(cmd, capture_output=True, text=True)
                    if result.returncode == 0:
                        segments.append(segment_path)
                    else:
                        logger.error(f"Failed to create segment: {result.stderr}")
                
                # Concatenate segments
                if segments:
                    concat_file = temp_path / "concat.txt"
                    with open(concat_file, 'w') as f:
                        for segment in segments:
                            f.write(f"file '{segment}'\n")
                    
                    video_only = temp_path / "video_only.mp4"
                    cmd = [
                        'ffmpeg', '-y', '-f', 'concat', '-safe', '0',
                        '-i', str(concat_file), '-c', 'copy', str(video_only)
                    ]
                    subprocess.run(cmd, capture_output=True, check=True)
                    
                    # Add audio
                    cmd = [
                        'ffmpeg', '-y', '-i', str(video_only), '-i', str(audio_path),
                        '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
                        '-map', '0:v:0', '-map', '1:a:0', '-shortest',
                        str(output_path)
                    ]
                    result = subprocess.run(cmd, capture_output=True, text=True)
                    
                    return result.returncode == 0
                
            return False
            
        except Exception as e:
            logger.error(f"Scene video creation failed: {e}")
            return False
    
    def _apply_scene_transition(self, video1: Path, video2: Path,
                               transition: SceneTransition, output: Path) -> bool:
        """Apply transition effect between two videos"""
        
        try:
            # For now, use simple concatenation with crossfade
            # In production, implement various transition effects
            
            duration_sec = transition.duration_ms / 1000.0
            
            cmd = [
                'ffmpeg', '-y', '-i', str(video1), '-i', str(video2),
                '-filter_complex',
                f'[0:v][1:v]xfade=transition={transition.transition_type}:duration={duration_sec}:offset=0[v];'
                f'[0:a][1:a]acrossfade=d={duration_sec}[a]',
                '-map', '[v]', '-map', '[a]',
                '-c:v', 'libx264', '-c:a', 'aac',
                str(output)
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode != 0:
                logger.warning(f"Transition failed, using simple concat: {result.stderr}")
                # Fallback to simple concatenation
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Transition application failed: {e}")
            return False
    
    def _concatenate_videos(self, videos: List[Path], output: Path) -> bool:
        """Concatenate multiple videos into one"""
        
        try:
            # Create concat file
            concat_file = output.parent / "concat.txt"
            with open(concat_file, 'w') as f:
                for video in videos:
                    f.write(f"file '{video.absolute()}'\n")
            
            cmd = [
                'ffmpeg', '-y', '-f', 'concat', '-safe', '0',
                '-i', str(concat_file), '-c', 'copy', str(output)
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            concat_file.unlink()  # Clean up
            
            if result.returncode != 0:
                logger.error(f"Video concatenation failed: {result.stderr}")
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Concatenation failed: {e}")
            return False
    
    def _add_chapter_markers(self, video_path: Path, scenes: List[SynchronizedScene]):
        """Add chapter markers to video file"""
        
        try:
            # Create WebVTT file for chapters
            vtt_path = video_path.with_suffix('.vtt')
            
            with open(vtt_path, 'w') as f:
                f.write("WEBVTT\n\n")
                
                current_time = 0
                for scene in scenes:
                    start_time = self._format_vtt_time(current_time)
                    end_time = self._format_vtt_time(
                        current_time + scene.timing_data.total_duration
                    )
                    
                    f.write(f"{start_time} --> {end_time}\n")
                    f.write(f"Chapter {scene.scene_assets.scene_number}: ")
                    f.write(f"{scene.scene_assets.metadata.get('scene_definition', {}).get('title', 'Scene')}\n\n")
                    
                    current_time += scene.timing_data.total_duration
            
            logger.info(f"Created chapter markers: {vtt_path}")
            
        except Exception as e:
            logger.error(f"Failed to add chapter markers: {e}")
    
    def _format_vtt_time(self, seconds: float) -> str:
        """Format time for WebVTT"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = seconds % 60
        return f"{hours:02d}:{minutes:02d}:{secs:06.3f}"
    
    def _upload_scene_based_content(self, session_id: str, content_id: str,
                                  employee_context: Dict[str, Any],
                                  module_name: str,
                                  scenes: List[SynchronizedScene],
                                  final_video: Optional[Path],
                                  output_dir: Path) -> Dict[str, str]:
        """Upload scene-based content to storage"""
        
        storage_urls = {}
        base_path = f"mm_{content_id}/{employee_context.get('name', 'unknown').lower().replace(' ', '_')}/{self._sanitize_filename(module_name)}"
        
        try:
            # Upload scene assets
            for scene in scenes:
                scene_num = scene.scene_assets.scene_number
                scene_base = f"{base_path}/scenes/scene_{scene_num:03d}"
                
                # Upload audio
                if scene.scene_assets.audio_path:
                    audio_url = self.upload_to_storage(
                        scene.scene_assets.audio_path,
                        f"{scene_base}/audio/narration.mp3",
                        "audio/mpeg"
                    )
                    if audio_url:
                        storage_urls[f"scene_{scene_num}_audio"] = audio_url
                
                # Upload slides
                for i, slide_path in enumerate(scene.scene_assets.slide_paths):
                    slide_url = self.upload_to_storage(
                        slide_path,
                        f"{scene_base}/slides/slide_{i+1:02d}.png",
                        "image/png"
                    )
                    if slide_url:
                        storage_urls[f"scene_{scene_num}_slide_{i+1}"] = slide_url
                
                # Upload scene manifest
                manifest_path = output_dir / "scenes" / f"scene_{scene_num:03d}_manifest.json"
                with open(manifest_path, 'w') as f:
                    json.dump(scene.scene_manifest, f, indent=2)
                
                manifest_url = self.upload_to_storage(
                    manifest_path,
                    f"{scene_base}/manifest.json",
                    "application/json"
                )
                if manifest_url:
                    storage_urls[f"scene_{scene_num}_manifest"] = manifest_url
            
            # Upload final video
            if final_video and final_video.exists():
                video_url = self.upload_to_storage(
                    final_video,
                    f"{base_path}/final/complete_video.mp4",
                    "video/mp4"
                )
                if video_url:
                    storage_urls['final_video'] = video_url
                
                # Upload chapters if they exist
                vtt_path = final_video.with_suffix('.vtt')
                if vtt_path.exists():
                    vtt_url = self.upload_to_storage(
                        vtt_path,
                        f"{base_path}/final/chapters.vtt",
                        "text/vtt"
                    )
                    if vtt_url:
                        storage_urls['chapters'] = vtt_url
            
            self.log_progress("STORAGE UPLOAD", "Complete", 
                            f"{len(storage_urls)} files uploaded")
            
        except Exception as e:
            logger.error(f"Storage upload failed: {e}")
        
        return storage_urls
    
    def _update_scene_database(self, session_id: str,
                             scenes: List[SynchronizedScene],
                             final_video: Optional[Path]):
        """Update database with scene information"""
        
        try:
            # Update session with scene data
            session_update = {
                'actual_scene_count': len(scenes),
                'scene_analysis_data': {
                    'scenes': [
                        {
                            'number': s.scene_assets.scene_number,
                            'type': s.scene_assets.metadata.get('scene_definition', {}).get('type'),
                            'duration': s.timing_data.total_duration,
                            'sync_quality': s.sync_quality_score
                        }
                        for s in scenes
                    ],
                    'total_duration': sum(s.timing_data.total_duration for s in scenes),
                    'average_sync_quality': sum(s.sync_quality_score for s in scenes) / len(scenes) if scenes else 0
                },
                'status': 'completed',
                'completed_at': datetime.now().isoformat()
            }
            
            response = self.supabase.table('mm_multimedia_sessions').update(
                session_update
            ).eq('session_id', session_id).execute()
            
            self.log_progress("DATABASE UPDATE", "Session updated")
            
            # Insert scene definitions
            for scene in scenes:
                scene_data = {
                    'session_id': session_id,
                    'scene_number': scene.scene_assets.scene_number,
                    'scene_type': scene.scene_assets.metadata.get('scene_definition', {}).get('type', 'concept'),
                    'scene_title': scene.scene_assets.metadata.get('scene_definition', {}).get('title', f'Scene {scene.scene_assets.scene_number}'),
                    'scene_slug': f"scene-{scene.scene_assets.scene_number}",
                    'scene_script': scene.scene_assets.script_personalized,
                    'slide_content': json.dumps(scene.slide_transitions),
                    'planned_duration_seconds': scene.scene_assets.metadata.get('scene_definition', {}).get('planned_duration', 60),
                    'actual_audio_duration': scene.timing_data.total_duration,
                    'generation_quality_score': scene.sync_quality_score,
                    'sync_accuracy_score': scene.sync_quality_score,
                    'status': 'completed'
                }
                
                self.supabase.table('mm_scene_definitions').insert(scene_data).execute()
            
            self.log_progress("DATABASE UPDATE", "Scenes recorded")
            
        except Exception as e:
            logger.error(f"Database update failed: {e}")
    
    def create_multimedia_session(self, content_id: str, 
                                employee_context: Dict[str, Any],
                                mode: str = 'dynamic') -> str:
        """Create multimedia session with scene support"""
        
        output_dir = f"enhanced_multimedia_output/{employee_context.get('name', 'unknown').lower().replace(' ', '_')}"
        
        session_data = {
            'course_id': employee_context.get('course_id', 'unknown'),
            'employee_name': employee_context.get('name', 'Unknown'),
            'employee_id': employee_context.get('id', 'unknown'),
            'course_title': employee_context.get('course_title', 'Training Course'),
            'total_modules': 1,
            'scene_generation_mode': mode,
            'target_scene_count': self.target_scene_count,
            'pipeline_used': 'enhanced_scene_based',
            'output_directory': output_dir,
            'status': 'processing'
        }
        
        response = self.supabase.table('mm_multimedia_sessions').insert(
            session_data
        ).execute()
        
        session_id = response.data[0]['session_id']
        self.log_progress("SESSION", "Created", f"ID: {session_id[:8]}...")
        
        return session_id
    
    def _sanitize_filename(self, name: str) -> str:
        """Sanitize filename for filesystem"""
        import re
        # Remove invalid characters
        sanitized = re.sub(r'[<>:"/\\|?*]', '_', name)
        # Limit length
        return sanitized[:100]

def test_enhanced_generator():
    """Test the enhanced multimedia generator"""
    
    generator = EnhancedMultimediaGenerator()
    
    # Test content
    test_content = """
    # Financial Forecasting Fundamentals
    
    ## Introduction
    Financial forecasting is a critical skill for business professionals. It involves predicting future financial outcomes based on historical data and market trends.
    
    ## Key Concepts
    
    ### Time Series Analysis
    Time series analysis examines data points collected over time to identify patterns and trends. This includes:
    - Trend analysis
    - Seasonal patterns
    - Cyclical variations
    
    ### Regression Models
    Regression models help establish relationships between variables:
    - Linear regression for simple relationships
    - Multiple regression for complex scenarios
    - Logistic regression for probability outcomes
    
    ## Practical Applications
    
    In your role as a financial analyst, you'll use forecasting for:
    1. Budget planning and allocation
    2. Revenue projections
    3. Cost management strategies
    4. Investment decisions
    
    ## Summary
    Mastering financial forecasting will enhance your analytical capabilities and support data-driven decision making in your organization.
    """
    
    employee_context = {
        'name': 'Test User',
        'role': 'Financial Analyst',
        'level': 'Intermediate',
        'goal': 'Senior Financial Analyst',
        'course_id': 'test-course',
        'course_title': 'Financial Analysis Mastery'
    }
    
    module_metadata = {
        'name': 'Financial Forecasting Fundamentals',
        'objectives': [
            'Understand time series analysis',
            'Apply regression models',
            'Create accurate financial forecasts'
        ],
        'complexity': 'intermediate'
    }
    
    # Run scene-based generation
    results = generator.generate_multimedia_scene_based(
        content_id='test-content-001',
        employee_context=employee_context,
        module_content=test_content,
        module_metadata=module_metadata
    )
    
    print("\nGeneration Results:")
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    test_enhanced_generator()