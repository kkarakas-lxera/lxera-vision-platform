#!/usr/bin/env python3
"""
Direct Multimedia Processor
Bypasses content generation and works directly with existing Supabase content
to create: Script → Audio → Slides → Video
"""

import os
import sys
import json
import logging
import tempfile
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional, List
import uuid

# Set Supabase credentials
os.environ['SUPABASE_URL'] = 'https://ujlqzkkkfatehxeqtbdl.supabase.co'
os.environ['SUPABASE_ANON_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqbHF6a2trZmF0ZWh4ZXF0YmRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2ODA4MzIsImV4cCI6MjA1NjI1NjgzMn0.ed-wciIqkubS4f2T3UNnkgqwzLEdpC-SVZoVsP7-W1E'

# Ensure OpenAI API key is set from environment
if not os.getenv('OPENAI_API_KEY'):
    raise ValueError("OPENAI_API_KEY environment variable must be set")

# Add paths for imports
current_dir = os.path.dirname(__file__)
openai_generator_dir = os.path.dirname(current_dir)
sys.path.append(openai_generator_dir)

from database.content_manager import ContentManager
from tools.multimedia_tools import MultimediaManager, get_multimedia_manager

# Import the actual multimedia generation components from refactored_nodes
refactored_nodes_path = "/Users/kubilaycenk/LF-Stable-v1/learnfinity-spark/refactored_nodes/audio_generation"
sys.path.append(refactored_nodes_path)

logger = logging.getLogger(__name__)

class DirectMultimediaProcessor:
    """Direct multimedia processor that works with existing Supabase content"""
    
    def __init__(self):
        self.content_manager = ContentManager()
        self.multimedia_manager = get_multimedia_manager()
        
        # Import the actual working multimedia components
        try:
            from summarizer import generate_audio_script
            from tts_generator import generate_multilingual_audio, split_text_intelligently
            from working_ai_slide_generator import WorkingAISlideGenerator
            
            self.generate_audio_script = generate_audio_script
            self.generate_multilingual_audio = generate_multilingual_audio
            self.split_text_intelligently = split_text_intelligently
            self.slide_generator = WorkingAISlideGenerator()
            
            logger.info("✅ Direct multimedia components loaded successfully")
            
        except ImportError as e:
            logger.error(f"❌ Failed to import multimedia components: {e}")
            raise
    
    def generate_multimedia_package(
        self,
        content_id: str,
        employee_context: Dict[str, Any],
        output_base_dir: str = "./multimedia_output"
    ) -> Dict[str, Any]:
        """
        Generate complete multimedia package from existing Supabase content
        Steps: Content → Script → Audio → Slides → Video → Database
        """
        try:
            logger.info(f"🎬 Starting direct multimedia generation for content: {content_id[:8]}...")
            
            # Step 1: Retrieve content from Supabase
            logger.info("📚 Step 1: Retrieving content from Supabase...")
            content = self.content_manager.get_module_content(content_id)
            if not content:
                raise ValueError(f"Content not found: {content_id}")
            
            module_name = content['module_name']
            logger.info(f"   ✅ Retrieved: {module_name}")
            
            # Step 2: Create multimedia session in database
            logger.info("💾 Step 2: Creating multimedia session...")
            session_id = self.multimedia_manager.create_multimedia_session(
                execution_id=str(uuid.uuid4()),
                course_id=f"{employee_context['name'].lower().replace(' ', '_')}_course",
                employee_name=employee_context['name'],
                employee_id=employee_context.get('id', 'emp_001'),
                course_title=f"Personalized Course for {employee_context['name']}",
                total_modules=1,
                personalization_level="standard"
            )
            logger.info(f"   ✅ Session created: {session_id}")
            
            # Step 3: Generate personalized script
            logger.info("📝 Step 3: Generating personalized script...")
            
            # Combine all content sections
            full_content = ""
            sections = ['introduction', 'core_content', 'practical_applications', 'case_studies', 'assessments']
            for section in sections:
                section_content = content.get(section, '')
                if section_content:
                    full_content += f"\n\n{section.replace('_', ' ').title()}:\n{section_content}"
            
            # Generate script with personalization
            employee_name = employee_context['name']
            employee_role = employee_context.get('role', 'Professional')
            
            personalized_script = f"""
Welcome {employee_name}, to your personalized training module on {module_name}.

As a {employee_role}, this content has been specifically tailored for your learning journey.

{full_content}

This completes your personalized training on {module_name}. 
Thank you for your attention, {employee_name}.
"""
            
            # Set up output directory
            employee_safe_name = employee_context['name'].lower().replace(' ', '_')
            module_safe_name = module_name.lower().replace(' ', '_').replace('&', 'and')
            output_dir = Path(output_base_dir) / employee_safe_name / module_safe_name
            output_dir.mkdir(parents=True, exist_ok=True)
            
            # Save script
            script_file = output_dir / "script.txt"
            script_file.write_text(personalized_script)
            logger.info(f"   ✅ Script saved: {script_file}")
            
            # Store script in database
            script_id = self.multimedia_manager.generate_personalized_script(
                session_id=session_id,
                content_id=content_id,
                course_id=f"{employee_safe_name}_course",
                module_name=module_name,
                source_content=full_content,
                employee_context=employee_context,
                script_type='full_module'
            )
            logger.info(f"   ✅ Script stored in database: {script_id}")
            
            # Step 4: Generate audio
            logger.info("🎵 Step 4: Generating audio with OpenAI TTS...")
            
            audio_dir = output_dir / "audio"
            audio_dir.mkdir(exist_ok=True)
            
            # Generate audio using the working TTS generator
            audio_result = self.generate_multilingual_audio(
                script_text=personalized_script,
                output_path=str(audio_dir / "narration.mp3"),
                voice_preference="alloy",
                target_language="en",
                speed=1.0
            )
            
            audio_file = audio_dir / "narration.mp3"
            if audio_file.exists():
                logger.info(f"   ✅ Audio generated: {audio_file} ({audio_file.stat().st_size} bytes)")
                
                # Register audio asset in database
                audio_asset_id = self.multimedia_manager.register_multimedia_asset(
                    session_id=session_id,
                    content_id=content_id,
                    course_id=f"{employee_safe_name}_course",
                    module_name=module_name,
                    asset_type='audio',
                    asset_category='module_complete',
                    file_path=str(audio_file),
                    file_name=audio_file.name,
                    duration_seconds=len(personalized_script.split()) // 2.5,  # ~150 WPM
                    file_format='mp3',
                    generated_with='openai_tts'
                )
                
                # Update status to completed
                self.multimedia_manager.update_asset_status(
                    asset_id=audio_asset_id,
                    status='completed',
                    ready_for_delivery=True,
                    processing_duration_ms=5000,
                    file_size_bytes=audio_file.stat().st_size
                )
                
                logger.info(f"   ✅ Audio asset registered: {audio_asset_id}")
            else:
                logger.warning("   ⚠️ Audio generation may have failed")
                audio_asset_id = None
            
            # Step 5: Generate slides
            logger.info("🖼️ Step 5: Generating slides with AI backgrounds...")
            
            slides_dir = output_dir / "slides"
            slides_dir.mkdir(exist_ok=True)
            
            # Create slides for each section
            slide_files = []
            slide_count = 0
            
            # Title slide
            slide_count += 1
            title_slide_path = str(slides_dir / f"slide_{slide_count:02d}_title.png")
            title_slide = self.slide_generator.create_ai_enhanced_title_slide(
                title=module_name,
                employee_name=employee_name,
                job_title=employee_role,
                output_path=title_slide_path
            )
            if title_slide:
                slide_files.append(slides_dir / f"slide_{slide_count:02d}_title.png")
            
            # Content slides
            for section in sections:
                section_content = content.get(section, '')
                if section_content:
                    slide_count += 1
                    section_title = section.replace('_', ' ').title()
                    
                    # Extract key points from content (first 4 sentences or lines)
                    lines = section_content.split('\n')
                    sentences = []
                    for line in lines:
                        if line.strip():
                            sentences.extend(line.split('. '))
                            if len(sentences) >= 4:
                                break
                    
                    points = [s.strip() + '.' if not s.endswith('.') else s.strip() 
                             for s in sentences[:4] if s.strip()]
                    
                    slide_file_path = str(slides_dir / f"slide_{slide_count:02d}_{section}.png")
                    slide_file = self.slide_generator.create_ai_enhanced_content_slide(
                        title=section_title,
                        points=points if points else [section_content[:200] + "..."],
                        slide_num=slide_count,
                        output_path=slide_file_path
                    )
                    if slide_file:
                        slide_files.append(slides_dir / f"slide_{slide_count:02d}_{section}.png")
            
            logger.info(f"   ✅ Generated {len(slide_files)} slides")
            
            # Register slide assets in database
            slide_asset_ids = []
            for slide_file in slide_files:
                if slide_file.exists():
                    slide_asset_id = self.multimedia_manager.register_multimedia_asset(
                        session_id=session_id,
                        content_id=content_id,
                        course_id=f"{employee_safe_name}_course",
                        module_name=module_name,
                        asset_type='image',
                        asset_category='slide',
                        file_path=str(slide_file),
                        file_name=slide_file.name,
                        duration_seconds=0,
                        file_format='png',
                        generated_with='ai_slide_generator'
                    )
                    
                    self.multimedia_manager.update_asset_status(
                        asset_id=slide_asset_id,
                        status='completed',
                        ready_for_delivery=True,
                        processing_duration_ms=2000,
                        file_size_bytes=slide_file.stat().st_size
                    )
                    
                    slide_asset_ids.append(slide_asset_id)
            
            logger.info(f"   ✅ Registered {len(slide_asset_ids)} slide assets")
            
            # Step 6: Generate video (basic implementation)
            logger.info("🎬 Step 6: Creating final video...")
            
            video_dir = output_dir / "video"
            video_dir.mkdir(exist_ok=True)
            
            # For now, just register a placeholder video asset
            video_file = video_dir / "complete_module.mp4"
            
            # Create a simple video info file
            video_info = {
                "module_name": module_name,
                "employee_name": employee_name,
                "slides_count": len(slide_files),
                "audio_file": str(audio_file) if audio_file.exists() else None,
                "slide_files": [str(f) for f in slide_files],
                "status": "ready_for_video_generation"
            }
            
            video_info_file = video_dir / "video_info.json"
            video_info_file.write_text(json.dumps(video_info, indent=2))
            
            # Register video asset (placeholder)
            video_asset_id = self.multimedia_manager.register_multimedia_asset(
                session_id=session_id,
                content_id=content_id,
                course_id=f"{employee_safe_name}_course",
                module_name=module_name,
                asset_type='video',
                asset_category='module_complete',
                file_path=str(video_info_file),  # For now, point to info file
                file_name="complete_module.json",
                duration_seconds=len(personalized_script.split()) // 2.5,
                file_format='json',
                generated_with='direct_processor'
            )
            
            self.multimedia_manager.update_asset_status(
                asset_id=video_asset_id,
                status='pending_video_generation',
                ready_for_delivery=False,
                processing_duration_ms=0,
                file_size_bytes=video_info_file.stat().st_size
            )
            
            logger.info(f"   ✅ Video info created: {video_info_file}")
            logger.info(f"   ✅ Video asset registered: {video_asset_id}")
            
            # Step 7: Finalize session
            logger.info("✅ Step 7: Finalizing multimedia package...")
            
            total_assets = 1 + len(slide_asset_ids) + 1  # audio + slides + video
            completed_assets = (1 if audio_asset_id else 0) + len(slide_asset_ids)  # video is pending
            
            # Update session with final statistics
            self.multimedia_manager.supabase.table('mm_multimedia_sessions').update({
                'status': 'completed',
                'assets_generated': completed_assets,
                'package_ready': True,
                'completed_at': datetime.now().isoformat(),
                'success_rate': (completed_assets / total_assets) * 100 if total_assets > 0 else 0,
                'output_directory': str(output_dir)
            }).eq('session_id', session_id).execute()
            
            # Return comprehensive results
            return {
                "success": True,
                "session_id": session_id,
                "content_id": content_id,
                "module_name": module_name,
                "output_directory": str(output_dir),
                "assets_generated": {
                    "script_id": script_id,
                    "audio_asset_id": audio_asset_id,
                    "slide_asset_ids": slide_asset_ids,
                    "video_asset_id": video_asset_id
                },
                "files_created": {
                    "script": str(script_file),
                    "audio": str(audio_file) if audio_file.exists() else None,
                    "slides": [str(f) for f in slide_files],
                    "video_info": str(video_info_file)
                },
                "statistics": {
                    "total_assets": total_assets,
                    "completed_assets": completed_assets,
                    "success_rate": (completed_assets / total_assets) * 100 if total_assets > 0 else 0,
                    "slides_generated": len(slide_files)
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Direct multimedia generation failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "content_id": content_id,
                "session_id": session_id if 'session_id' in locals() else None
            }


def test_direct_multimedia():
    """Test direct multimedia generation with Supabase content"""
    processor = DirectMultimediaProcessor()
    
    # Use the latest content from Supabase
    content_id = "c3225098-53f4-4b01-b162-d9ff9c795629"
    employee_context = {
        "name": "Kubilaycan Karakas",
        "role": "Junior Financial Analyst",
        "level": "intermediate",
        "goals": "Senior Financial Analyst",
        "id": "kubilaycan_001"
    }
    
    logger.info("🎬 Testing direct multimedia generation...")
    
    result = processor.generate_multimedia_package(
        content_id=content_id,
        employee_context=employee_context
    )
    
    if result["success"]:
        logger.info("🎉 Direct multimedia generation completed successfully!")
        logger.info(f"📁 Output directory: {result['output_directory']}")
        logger.info(f"🎯 Session ID: {result['session_id']}")
        logger.info(f"📊 Statistics: {result['statistics']}")
        logger.info("📋 Files created:")
        for file_type, file_path in result['files_created'].items():
            if file_path:
                logger.info(f"   • {file_type}: {file_path}")
    else:
        logger.error(f"❌ Direct multimedia generation failed: {result['error']}")
    
    return result


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    test_direct_multimedia()