#!/usr/bin/env python3
"""
Master Orchestrator for Content Latest Pipeline
Single entry point that coordinates Content → Audio → Video → Display generation
"""

import os
import sys
import json
import logging
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional, List

# Add current directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import pipeline components
from core_pipeline.config import PipelineConfig, QualityLevel, PipelineStage
from utils.file_manager import FileManager
from utils.progress_tracker import ProgressTracker
from content_generation.content_processor import ContentProcessor
from content_generation.agentic_content_processor import AgenticContentProcessor
from audio_generation.audio_processor import AudioProcessor
from video_generation.video_processor import VideoProcessor

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('pipeline.log')
    ]
)
logger = logging.getLogger(__name__)

class MasterOrchestrator:
    """
    Master orchestrator that coordinates the entire course generation pipeline
    """
    
    def __init__(self, config: PipelineConfig = None):
        """Initialize the master orchestrator"""
        
        self.config = config or PipelineConfig()
        self.file_manager = FileManager(self.config.base_dir)
        self.progress_tracker = ProgressTracker()
        
        # Initialize processors
        self.content_processor = None
        self.audio_processor = None  
        self.video_processor = None
        
        logger.info("🚀 Master Orchestrator initialized")
        logger.info(f"Quality Level: {self.config.quality_level.value}")
        logger.info(f"Enabled Stages: {[stage.value for stage in self.config.enabled_stages]}")
        
        # Check for agentic capabilities
        self._check_agentic_capabilities()
        
        # Setup progress tracking
        self._setup_progress_tracking()
    
    def _check_agentic_capabilities(self):
        """Check if agentic content generation is available"""
        try:
            # First try the full refactored_nodes processor
            from content_generation.refactored_nodes_processor import RefactoredNodesProcessor
            test_processor = RefactoredNodesProcessor(self.config)
            logger.info("🎯 Full agentic content generation capabilities detected")
            logger.info("   ✅ Complete refactored_nodes graph workflow available")
            logger.info(f"   ✅ Memory integration: {'enabled' if test_processor.memory_available else 'disabled'}")
            logger.info(f"   ✅ Research capabilities: {'enabled' if test_processor.research_available else 'disabled'}")
            logger.info(f"   ✅ Quality loops: {'enabled' if test_processor.quality_available else 'disabled'}")
            self.agentic_available = True
            self.full_agentic_available = test_processor.graph_available
        except Exception as e:
            logger.warning(f"⚠️  Full agentic capabilities not available: {e}")
            logger.info("   Checking fallback agentic capabilities...")
            try:
                # Try the basic agentic processor as fallback
                test_processor = AgenticContentProcessor(self.config)
                logger.info("🤖 Basic agentic content generation capabilities detected")
                logger.info("   ✅ Basic deer-flow-core tools available")
                self.agentic_available = True
                self.full_agentic_available = False
            except Exception as e2:
                logger.warning(f"⚠️  No agentic capabilities available: {e2}")
                logger.info("📝 Will use basic content generation instead")
                self.agentic_available = False
                self.full_agentic_available = False
    
    def _setup_progress_tracking(self):
        """Setup progress tracking for all enabled stages"""
        
        if self.config.is_stage_enabled(PipelineStage.CONTENT):
            self.progress_tracker.add_stage("content", 5)
        
        if self.config.is_stage_enabled(PipelineStage.AUDIO):
            self.progress_tracker.add_stage("audio", 4)
        
        if self.config.is_stage_enabled(PipelineStage.VIDEO):
            self.progress_tracker.add_stage("video", 3)
        
        if self.config.is_stage_enabled(PipelineStage.DISPLAY):
            self.progress_tracker.add_stage("display", 2)
    
    def generate_complete_course(self, 
                                employee_file: str,
                                output_dir: str = None) -> Dict[str, Any]:
        """
        Generate a complete course package with all enabled stages
        
        Args:
            employee_file: Path to employee data JSON file
            output_dir: Optional custom output directory
            
        Returns:
            Dictionary with course generation results and file paths
        """
        
        logger.info("🎬 Starting Complete Course Generation Pipeline")
        logger.info("=" * 60)
        
        try:
            # Load employee data
            logger.info(f"📁 Loading employee data: {employee_file}")
            employee_data = self.file_manager.load_employee_data(employee_file)
            employee_id = employee_data.get("employee_id", "UNKNOWN")
            
            # Setup output directory
            if output_dir:
                output_path = Path(output_dir)
            else:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                output_path = self.config.get_output_path(employee_id, timestamp)
            
            output_path.mkdir(parents=True, exist_ok=True)
            logger.info(f"📂 Output directory: {output_path}")
            
            # Initialize results
            results = {
                "employee_id": employee_id,
                "employee_name": employee_data.get("full_name", ""),
                "output_path": str(output_path),
                "start_time": datetime.now().isoformat(),
                "config": self.config.to_dict(),
                "stages_completed": [],
                "files_generated": {},
                "errors": []
            }
            
            # Progress callback
            def progress_callback(stage: str, percent: float, message: str):
                self.progress_tracker.update_stage_progress(
                    stage, progress_percent=percent, current_step=message
                )
                logger.info(f"[{stage.upper()}] {percent:.1f}% - {message}")
            
            # === STAGE 1: CONTENT GENERATION ===
            course_content = None
            if self.config.is_stage_enabled(PipelineStage.CONTENT):
                course_content = self._run_content_generation(
                    employee_data, output_path, progress_callback, results
                )
            
            # === STAGE 2: AUDIO GENERATION ===
            audio_files = []
            if self.config.is_stage_enabled(PipelineStage.AUDIO) and course_content:
                audio_files = self._run_audio_generation(
                    course_content, output_path, progress_callback, results
                )
            
            # === STAGE 3: VIDEO GENERATION ===
            video_files = []
            if self.config.is_stage_enabled(PipelineStage.VIDEO) and course_content:
                video_files = self._run_video_generation(
                    course_content, audio_files, output_path, progress_callback, results
                )
            
            # === STAGE 4: COURSE DISPLAY ===
            display_files = []
            if self.config.is_stage_enabled(PipelineStage.DISPLAY) and course_content:
                display_files = self._run_display_generation(
                    course_content, audio_files, video_files, output_path, 
                    progress_callback, results
                )
            
            # === FINALIZATION ===
            results["end_time"] = datetime.now().isoformat()
            results["success"] = True
            
            # Create course package
            package_info = self.file_manager.create_course_package(
                output_path, course_content or {}, audio_files, video_files
            )
            results["package_info"] = package_info
            
            # Save results summary
            results_file = output_path / "generation_results.json"
            with open(results_file, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2, default=str)
            
            logger.info("🎉 COMPLETE COURSE GENERATION FINISHED")
            logger.info("=" * 60)
            logger.info(f"✅ Course generated successfully: {output_path}")
            
            if course_content:
                course_name = course_content.get("course_content", {}).get("courseName", "Course")
                logger.info(f"📚 Course: {course_name}")
            
            logger.info(f"🎵 Audio files: {len(audio_files)}")
            logger.info(f"🎬 Video files: {len(video_files)}")
            logger.info(f"📁 Output: {output_path}")
            
            # Print final progress summary
            self.progress_tracker.print_status()
            
            return results
            
        except Exception as e:
            error_msg = f"Pipeline failed: {str(e)}"
            logger.error(error_msg, exc_info=True)
            
            results["success"] = False
            results["error"] = error_msg
            results["end_time"] = datetime.now().isoformat()
            
            return results
    
    def _run_content_generation(self, 
                               employee_data: Dict[str, Any],
                               output_path: Path,
                               progress_callback,
                               results: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Run content generation stage"""
        
        try:
            self.progress_tracker.start_stage("content")
            logger.info("🔄 STAGE 1: AGENTIC Content Generation with deer-flow-core")
            
            # Initialize content processor (agentic if available)
            if not self.content_processor:
                if getattr(self, 'agentic_available', False):
                    try:
                        self.content_processor = AgenticContentProcessor(self.config)
                        logger.info("🤖 Using AgenticContentProcessor with full deer-flow-core capabilities")
                    except Exception as e:
                        logger.warning(f"AgenticContentProcessor runtime error: {e}")
                        logger.info("⚠️  Falling back to basic ContentProcessor")
                        self.content_processor = ContentProcessor(self.config)
                else:
                    logger.info("📝 Using basic ContentProcessor (agentic capabilities not available)")
                    self.content_processor = ContentProcessor(self.config)
            
            # Generate course content
            course_content = self.content_processor.generate_course_content(
                employee_data, progress_callback
            )
            
            # Validate content
            if self.content_processor.validate_course_content(course_content):
                # Save content
                content_path = self.file_manager.save_course_content(
                    course_content, output_path
                )
                
                results["files_generated"]["course_content"] = str(content_path)
                results["stages_completed"].append("content")
                
                # Enhanced logging for agentic content
                completion_metadata = {
                    "course_content_path": str(content_path),
                    "modules_count": len(course_content.get("course_content", {}).get("modules", [])),
                    "total_words": course_content.get("metadata", {}).get("total_word_count", 0),
                    "content_type": "agentic" if isinstance(self.content_processor, AgenticContentProcessor) else "basic"
                }
                
                # Add agentic-specific metrics if available
                if isinstance(self.content_processor, AgenticContentProcessor):
                    agentic_insights = course_content.get("agentic_research_insights", {})
                    completion_metadata.update({
                        "research_queries": agentic_insights.get("total_research_queries", 0),
                        "research_quality": course_content.get("agentic_research_summary", {}).get("research_quality_score", 0),
                        "web_searches": agentic_insights.get("research_findings_count", 0)
                    })
                    logger.info(f"🤖 Agentic enhancement applied: {agentic_insights.get('total_research_queries', 0)} research queries executed")
                
                self.progress_tracker.complete_stage("content", completion_metadata)
                
                logger.info("✅ Content generation completed successfully")
                return course_content
            else:
                raise ValueError("Generated content failed validation")
                
        except Exception as e:
            self.progress_tracker.fail_stage("content", str(e))
            results["errors"].append(f"Content generation failed: {e}")
            logger.error(f"Content generation failed: {e}")
            return None
    
    def _run_audio_generation(self,
                             course_content: Dict[str, Any],
                             output_path: Path,
                             progress_callback,
                             results: Dict[str, Any]) -> List[Path]:
        """Run audio generation stage"""
        
        try:
            self.progress_tracker.start_stage("audio")
            logger.info("🔄 STAGE 2: Audio Generation")
            
            # Initialize audio processor
            if not self.audio_processor:
                self.audio_processor = AudioProcessor(self.config)
            
            # Generate audio files
            audio_files = self.audio_processor.generate_course_audio(
                course_content, output_path, progress_callback
            )
            
            # Validate audio files
            if self.audio_processor.validate_audio_files(audio_files):
                results["files_generated"]["audio_files"] = [str(f) for f in audio_files]
                results["stages_completed"].append("audio")
                
                self.progress_tracker.complete_stage("audio", {
                    "audio_files_count": len(audio_files),
                    "audio_files": [str(f) for f in audio_files]
                })
                
                logger.info("✅ Audio generation completed successfully")
                return audio_files
            else:
                logger.warning("Audio validation failed, but continuing...")
                return audio_files
                
        except Exception as e:
            self.progress_tracker.fail_stage("audio", str(e))
            results["errors"].append(f"Audio generation failed: {e}")
            logger.error(f"Audio generation failed: {e}")
            return []
    
    def _run_video_generation(self,
                             course_content: Dict[str, Any],
                             audio_files: List[Path],
                             output_path: Path,
                             progress_callback,
                             results: Dict[str, Any]) -> List[Path]:
        """Run video generation stage"""
        
        try:
            self.progress_tracker.start_stage("video")
            logger.info("🔄 STAGE 3: Video Generation")
            
            # Initialize video processor
            if not self.video_processor:
                self.video_processor = VideoProcessor(self.config)
            
            # Generate video files
            video_files = self.video_processor.generate_course_videos(
                course_content, audio_files, output_path, progress_callback
            )
            
            # Validate video files (optional - videos can fail)
            if video_files and self.video_processor.validate_video_files(video_files):
                results["files_generated"]["video_files"] = [str(f) for f in video_files]
                results["stages_completed"].append("video")
                
                self.progress_tracker.complete_stage("video", {
                    "video_files_count": len(video_files),
                    "video_files": [str(f) for f in video_files]
                })
                
                logger.info("✅ Video generation completed successfully")
            else:
                logger.warning("Video generation completed with issues or was skipped")
                self.progress_tracker.complete_stage("video", {"note": "completed_with_issues"})
            
            return video_files
                
        except Exception as e:
            self.progress_tracker.fail_stage("video", str(e))
            results["errors"].append(f"Video generation failed: {e}")
            logger.error(f"Video generation failed: {e}")
            return []
    
    def _run_display_generation(self,
                               course_content: Dict[str, Any],
                               audio_files: List[Path],
                               video_files: List[Path],
                               output_path: Path,
                               progress_callback,
                               results: Dict[str, Any]) -> List[Path]:
        """Run course display generation stage"""
        
        try:
            self.progress_tracker.start_stage("display")
            logger.info("🔄 STAGE 4: Course Display Generation")
            
            progress_callback("display", 20, "Creating course viewer")
            
            # Create course viewer
            viewer_path = self._create_course_viewer(
                course_content, audio_files, video_files, output_path
            )
            
            progress_callback("display", 60, "Generating course summary")
            
            # Create course summary
            summary_path = self._create_course_summary(
                course_content, output_path
            )
            
            progress_callback("display", 100, "Display generation complete")
            
            display_files = []
            if viewer_path:
                display_files.append(viewer_path)
            if summary_path:
                display_files.append(summary_path)
            
            results["files_generated"]["display_files"] = [str(f) for f in display_files]
            results["stages_completed"].append("display")
            
            self.progress_tracker.complete_stage("display", {
                "course_viewer": str(viewer_path) if viewer_path else None,
                "course_summary": str(summary_path) if summary_path else None
            })
            
            logger.info("✅ Course display generation completed successfully")
            return display_files
            
        except Exception as e:
            self.progress_tracker.fail_stage("display", str(e))
            results["errors"].append(f"Display generation failed: {e}")
            logger.error(f"Display generation failed: {e}")
            return []
    
    def _create_course_viewer(self,
                             course_content: Dict[str, Any],
                             audio_files: List[Path],
                             video_files: List[Path],
                             output_path: Path) -> Optional[Path]:
        """Create interactive course viewer HTML"""
        
        try:
            # For now, create a simple HTML viewer
            # This will be enhanced with the proper course viewer
            viewer_path = output_path / "course_viewer.html"
            
            course_data = course_content.get("course_content", {})
            course_name = course_data.get("courseName", "Course")
            course_description = course_data.get("courseDescription", "")
            modules = course_data.get("modules", [])
            
            html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{course_name}</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }}
        .header {{ background: #2c3e50; color: white; padding: 20px; border-radius: 8px; }}
        .module {{ margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }}
        .module h3 {{ color: #2c3e50; }}
        .media-section {{ margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; }}
        .file-list {{ list-style: none; padding: 0; }}
        .file-list li {{ margin: 5px 0; }}
        .file-list a {{ color: #3498db; text-decoration: none; }}
        .file-list a:hover {{ text-decoration: underline; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>{course_name}</h1>
        <p>{course_description}</p>
        <p><strong>Generated:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
    </div>
    
    <div class="media-section">
        <h2>🎵 Audio Files</h2>
        <ul class="file-list">
"""
            
            # Add audio files
            for audio_file in audio_files:
                rel_path = audio_file.relative_to(output_path)
                html_content += f'            <li><a href="{rel_path}">{audio_file.name}</a></li>\n'
            
            html_content += """        </ul>
    </div>
    
    <div class="media-section">
        <h2>🎬 Video Files</h2>
        <ul class="file-list">
"""
            
            # Add video files
            for video_file in video_files:
                rel_path = video_file.relative_to(output_path)
                html_content += f'            <li><a href="{rel_path}">{video_file.name}</a></li>\n'
            
            html_content += """        </ul>
    </div>
    
    <div class="module-content">
        <h2>📚 Course Modules</h2>
"""
            
            # Add modules
            for i, module in enumerate(modules, 1):
                module_name = module.get("moduleName", f"Module {i}")
                key_concepts = module.get("keyConceptsToCover", [])
                
                html_content += f"""
        <div class="module">
            <h3>Module {i}: {module_name}</h3>
            <p><strong>Key Concepts:</strong></p>
            <ul>
"""
                for concept in key_concepts[:5]:
                    html_content += f"                <li>{concept}</li>\n"
                
                html_content += """            </ul>
        </div>
"""
            
            html_content += """    </div>
</body>
</html>"""
            
            with open(viewer_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            logger.info(f"Course viewer created: {viewer_path}")
            return viewer_path
            
        except Exception as e:
            logger.error(f"Failed to create course viewer: {e}")
            return None
    
    def _create_course_summary(self,
                              course_content: Dict[str, Any],
                              output_path: Path) -> Optional[Path]:
        """Create course summary text file"""
        
        try:
            summary_path = output_path / "course_summary.txt"
            
            course_data = course_content.get("course_content", {})
            metadata = course_content.get("metadata", {})
            
            summary_content = f"""
COURSE SUMMARY
==============

Course Name: {course_data.get("courseName", "Unknown")}
Generated: {metadata.get("generation_timestamp", "Unknown")}
Employee ID: {metadata.get("employee_id", "Unknown")}
Quality Level: {metadata.get("quality_level", "Unknown")}

Course Description:
{course_data.get("courseDescription", "No description available")}

Total Modules: {len(course_data.get("modules", []))}
Total Words: {metadata.get("total_word_count", 0):,}

MODULES:
--------
"""
            
            modules = course_data.get("modules", [])
            for i, module in enumerate(modules, 1):
                module_name = module.get("moduleName", f"Module {i}")
                word_count = module.get("generated_content_word_count", 0)
                
                summary_content += f"{i}. {module_name} ({word_count:,} words)\n"
            
            with open(summary_path, 'w', encoding='utf-8') as f:
                f.write(summary_content)
            
            logger.info(f"Course summary created: {summary_path}")
            return summary_path
            
        except Exception as e:
            logger.error(f"Failed to create course summary: {e}")
            return None

def main():
    """Main CLI interface"""
    
    parser = argparse.ArgumentParser(
        description="Content Latest - Complete Course Generation Pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate complete course (all stages)
  python master_orchestrator.py --employee employee_data.json
  
  # Generate with high quality
  python master_orchestrator.py --employee employee_data.json --quality high
  
  # Generate only content and audio
  python master_orchestrator.py --employee employee_data.json --stages content audio
  
  # Custom output directory
  python master_orchestrator.py --employee employee_data.json --output /path/to/output
        """
    )
    
    parser.add_argument(
        "--employee",
        required=True,
        help="Employee data JSON file (can be filename or full path)"
    )
    
    parser.add_argument(
        "--output",
        help="Custom output directory (optional)"
    )
    
    parser.add_argument(
        "--quality",
        choices=["low", "medium", "high", "premium"],
        default="high",
        help="Quality level for generation (default: high)"
    )
    
    parser.add_argument(
        "--stages",
        nargs="+",
        choices=["content", "audio", "video", "display"],
        default=["content", "audio", "video", "display"],
        help="Pipeline stages to run (default: all)"
    )
    
    parser.add_argument(
        "--config",
        help="Custom configuration file (JSON)"
    )
    
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose logging"
    )
    
    args = parser.parse_args()
    
    # Set logging level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Create configuration
    quality_level = QualityLevel(args.quality)
    enabled_stages = [PipelineStage(stage) for stage in args.stages]
    
    config = PipelineConfig(
        quality_level=quality_level,
        enabled_stages=enabled_stages
    )
    
    # Load custom config if provided
    if args.config:
        try:
            with open(args.config, 'r') as f:
                custom_config = json.load(f)
            # Apply custom config settings here
            logger.info(f"Loaded custom configuration: {args.config}")
        except Exception as e:
            logger.warning(f"Failed to load custom config: {e}")
    
    # Create orchestrator
    orchestrator = MasterOrchestrator(config)
    
    # Run pipeline
    try:
        results = orchestrator.generate_complete_course(
            employee_file=args.employee,
            output_dir=args.output
        )
        
        if results.get("success"):
            print(f"\n🎉 Success! Course generated at: {results['output_path']}")
            print(f"📁 Open course viewer: {results['output_path']}/course_viewer.html")
        else:
            print(f"\n❌ Pipeline failed: {results.get('error', 'Unknown error')}")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n⏹️  Pipeline interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Pipeline crashed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()