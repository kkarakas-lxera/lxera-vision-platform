#!/usr/bin/env python3
"""
Scene Generator for Dynamic Multimedia Creation
Generates individual scene components including script, audio, and slides
"""

import os
import json
import logging
import asyncio
import tempfile
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime
import concurrent.futures

from openai import OpenAI
from PIL import Image, ImageDraw, ImageFont
import numpy as np

from .dynamic_scene_analyzer import SceneDefinition

# Configure logging
logger = logging.getLogger(__name__)

@dataclass
class SceneAssets:
    """Container for all assets generated for a scene"""
    scene_id: str
    scene_number: int
    script: str
    script_personalized: str
    audio_path: Optional[Path] = None
    audio_duration: float = 0.0
    slide_paths: List[Path] = field(default_factory=list)
    slide_timings: List[float] = field(default_factory=list)  # When each slide should appear
    metadata: Dict[str, Any] = field(default_factory=dict)
    generation_time_ms: int = 0
    status: str = 'pending'
    error: Optional[str] = None

class SceneGenerator:
    """Generates individual scene components with perfect synchronization"""
    
    def __init__(self, openai_client: OpenAI, output_dir: Path):
        """Initialize the scene generator"""
        self.openai = openai_client
        self.output_dir = output_dir
        
        # Audio settings
        self.voice_settings = {
            'default': {'voice': 'alloy', 'speed': 1.0},
            'intro': {'voice': 'alloy', 'speed': 0.95},  # Slightly slower for intro
            'concept': {'voice': 'alloy', 'speed': 1.0},
            'example': {'voice': 'nova', 'speed': 1.05},  # Different voice for variety
            'summary': {'voice': 'alloy', 'speed': 0.95}
        }
        
        # Slide settings
        self.slide_width = 1920
        self.slide_height = 1080
        self.slide_templates = self._load_slide_templates()
        
        # Performance settings
        self.max_parallel_scenes = 3
        self.audio_chunk_size = 4000  # Max characters per audio generation
    
    def _load_slide_templates(self) -> Dict[str, Any]:
        """Load slide design templates"""
        return {
            'intro': {
                'bg_color': '#1a1a2e',
                'accent_color': '#4FFFB0',
                'layout': 'centered_title'
            },
            'concept': {
                'bg_color': '#0f0f1e',
                'accent_color': '#00D9FF',
                'layout': 'header_content'
            },
            'example': {
                'bg_color': '#1e1e2e',
                'accent_color': '#FFB74D',
                'layout': 'split_screen'
            },
            'practice': {
                'bg_color': '#2e1e2e',
                'accent_color': '#FF6B6B',
                'layout': 'interactive'
            },
            'summary': {
                'bg_color': '#1a1a2e',
                'accent_color': '#4FFFB0',
                'layout': 'bullet_list'
            }
        }
    
    async def generate_scenes_parallel(self, scenes: List[SceneDefinition], 
                                     employee_context: Dict[str, Any],
                                     session_id: str) -> List[SceneAssets]:
        """
        Generate multiple scenes in parallel for performance
        
        Args:
            scenes: List of scene definitions to generate
            employee_context: Employee personalization context
            session_id: Multimedia session ID
            
        Returns:
            List of generated scene assets
        """
        logger.info(f"Starting parallel generation of {len(scenes)} scenes")
        start_time = datetime.now()
        
        # Create scene output directories
        scenes_dir = self.output_dir / "scenes"
        scenes_dir.mkdir(exist_ok=True)
        
        # Generate scenes in batches to avoid overwhelming the API
        scene_assets = []
        
        for i in range(0, len(scenes), self.max_parallel_scenes):
            batch = scenes[i:i + self.max_parallel_scenes]
            batch_tasks = []
            
            # Create async tasks for each scene in batch
            for scene in batch:
                task = self.generate_scene_components(
                    scene, employee_context, session_id, scenes_dir
                )
                batch_tasks.append(task)
            
            # Wait for batch to complete
            batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)
            
            # Process results
            for j, result in enumerate(batch_results):
                if isinstance(result, Exception):
                    logger.error(f"Scene {batch[j].scene_number} generation failed: {result}")
                    # Create failed scene asset
                    scene_assets.append(SceneAssets(
                        scene_id=f"{session_id}_scene_{batch[j].scene_number}",
                        scene_number=batch[j].scene_number,
                        script=batch[j].source_content,
                        script_personalized=batch[j].source_content,
                        status='failed',
                        error=str(result)
                    ))
                else:
                    scene_assets.append(result)
        
        total_time = (datetime.now() - start_time).total_seconds()
        logger.info(f"Generated {len(scene_assets)} scenes in {total_time:.1f} seconds")
        
        return scene_assets
    
    async def generate_scene_components(self, scene_def: SceneDefinition,
                                      employee_context: Dict[str, Any],
                                      session_id: str,
                                      output_dir: Path) -> SceneAssets:
        """
        Generate all components for a single scene
        
        Args:
            scene_def: Scene definition
            employee_context: Employee personalization context
            session_id: Multimedia session ID
            output_dir: Output directory for scene files
            
        Returns:
            SceneAssets object with all generated components
        """
        start_time = datetime.now()
        scene_id = f"{session_id}_scene_{scene_def.scene_number}"
        
        # Create scene directory
        scene_dir = output_dir / f"scene_{scene_def.scene_number:03d}_{scene_def.scene_slug}"
        scene_dir.mkdir(exist_ok=True)
        
        logger.info(f"Generating scene {scene_def.scene_number}: {scene_def.scene_title}")
        
        try:
            # Step 1: Generate personalized script
            script, personalized_script = await self._generate_scene_script(
                scene_def, employee_context
            )
            
            # Step 2: Generate audio narration
            audio_path, audio_duration = await self._generate_scene_audio(
                personalized_script, scene_def, scene_dir
            )
            
            # Step 3: Generate slides based on content and timing
            slide_paths, slide_timings = await self._generate_scene_slides(
                scene_def, personalized_script, audio_duration, scene_dir
            )
            
            # Step 4: Create scene metadata
            metadata = self._create_scene_metadata(
                scene_def, employee_context, audio_duration, len(slide_paths)
            )
            
            # Calculate generation time
            generation_time_ms = int((datetime.now() - start_time).total_seconds() * 1000)
            
            return SceneAssets(
                scene_id=scene_id,
                scene_number=scene_def.scene_number,
                script=script,
                script_personalized=personalized_script,
                audio_path=audio_path,
                audio_duration=audio_duration,
                slide_paths=slide_paths,
                slide_timings=slide_timings,
                metadata=metadata,
                generation_time_ms=generation_time_ms,
                status='completed'
            )
            
        except Exception as e:
            logger.error(f"Failed to generate scene {scene_def.scene_number}: {e}")
            return SceneAssets(
                scene_id=scene_id,
                scene_number=scene_def.scene_number,
                script=scene_def.source_content,
                script_personalized=scene_def.source_content,
                status='failed',
                error=str(e),
                generation_time_ms=int((datetime.now() - start_time).total_seconds() * 1000)
            )
    
    async def _generate_scene_script(self, scene_def: SceneDefinition,
                                   employee_context: Dict[str, Any]) -> Tuple[str, str]:
        """Generate scene script with personalization"""
        
        # Build personalization prompt
        personalization_prompt = f"""Transform this content into a personalized narration script for a {scene_def.scene_type} scene.

Employee Context:
- Name: {employee_context.get('name', 'Learner')}
- Role: {employee_context.get('role', 'Professional')}
- Experience Level: {employee_context.get('level', 'Intermediate')}
- Career Goal: {employee_context.get('goal', 'Career advancement')}

Scene Information:
- Type: {scene_def.scene_type}
- Title: {scene_def.scene_title}
- Target Duration: {scene_def.estimated_duration} seconds
- Complexity: {scene_def.complexity_score}

Source Content:
{scene_def.source_content}

Requirements:
1. Make it conversational and engaging
2. Include the employee's name naturally 1-2 times
3. Reference their role and career goals where relevant
4. Adjust complexity based on their experience level
5. For {scene_def.scene_type} scenes, focus on {self._get_scene_focus(scene_def.scene_type)}
6. Aim for {int(scene_def.estimated_duration * 2.5)} words (150 words per minute narration)

Return ONLY the narration script, no meta-commentary."""

        try:
            response = await asyncio.to_thread(
                self.openai.chat.completions.create,
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert instructional designer creating engaging educational content."},
                    {"role": "user", "content": personalization_prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            personalized_script = response.choices[0].message.content.strip()
            
            # Validate and adjust script length
            word_count = len(personalized_script.split())
            target_words = int(scene_def.estimated_duration * 2.5)
            
            if abs(word_count - target_words) > target_words * 0.2:  # More than 20% off
                logger.warning(f"Scene {scene_def.scene_number} script length mismatch: {word_count} words vs {target_words} target")
            
            return scene_def.source_content, personalized_script
            
        except Exception as e:
            logger.error(f"Script generation failed: {e}")
            # Fallback to source content
            return scene_def.source_content, scene_def.source_content
    
    def _get_scene_focus(self, scene_type: str) -> str:
        """Get focus description for scene type"""
        focus_map = {
            'intro': 'setting context and building motivation',
            'concept': 'explaining core ideas clearly',
            'example': 'demonstrating practical applications',
            'practice': 'encouraging hands-on engagement',
            'summary': 'reinforcing key takeaways',
            'deep_dive': 'exploring advanced details',
            'transition': 'connecting ideas smoothly'
        }
        return focus_map.get(scene_type, 'delivering valuable insights')
    
    async def _generate_scene_audio(self, script: str, scene_def: SceneDefinition,
                                  output_dir: Path) -> Tuple[Optional[Path], float]:
        """Generate audio narration for scene"""
        
        # Get voice settings for scene type
        voice_settings = self.voice_settings.get(
            scene_def.scene_type, 
            self.voice_settings['default']
        )
        
        audio_dir = output_dir / "audio"
        audio_dir.mkdir(exist_ok=True)
        audio_path = audio_dir / "narration.mp3"
        
        try:
            # Handle long scripts by chunking
            if len(script) > self.audio_chunk_size:
                audio_chunks = await self._generate_audio_chunks(
                    script, voice_settings, audio_dir
                )
                # Combine chunks
                audio_path, duration = await self._combine_audio_chunks(
                    audio_chunks, audio_path
                )
            else:
                # Generate single audio file
                response = await asyncio.to_thread(
                    self.openai.audio.speech.create,
                    model="tts-1-hd",
                    voice=voice_settings['voice'],
                    input=script,
                    speed=voice_settings['speed']
                )
                
                # Save audio
                audio_content = response.content
                with open(audio_path, 'wb') as f:
                    f.write(audio_content)
                
                # Calculate duration (approximate)
                duration = len(script.split()) / 150 * 60  # 150 wpm
            
            logger.info(f"Generated audio for scene {scene_def.scene_number}: {duration:.1f}s")
            return audio_path, duration
            
        except Exception as e:
            logger.error(f"Audio generation failed: {e}")
            return None, scene_def.estimated_duration
    
    async def _generate_audio_chunks(self, script: str, voice_settings: Dict[str, Any],
                                   output_dir: Path) -> List[Path]:
        """Generate audio in chunks for long scripts"""
        chunks = self._split_script_into_chunks(script, self.audio_chunk_size)
        chunk_paths = []
        
        tasks = []
        for i, chunk in enumerate(chunks):
            chunk_path = output_dir / f"chunk_{i:02d}.mp3"
            task = self._generate_single_audio_chunk(
                chunk, voice_settings, chunk_path
            )
            tasks.append(task)
        
        chunk_paths = await asyncio.gather(*tasks)
        return chunk_paths
    
    def _split_script_into_chunks(self, script: str, max_size: int) -> List[str]:
        """Split script into chunks at sentence boundaries"""
        sentences = script.split('. ')
        chunks = []
        current_chunk = []
        current_size = 0
        
        for sentence in sentences:
            sentence_size = len(sentence) + 2  # +2 for ". "
            if current_size + sentence_size > max_size and current_chunk:
                chunks.append('. '.join(current_chunk) + '.')
                current_chunk = [sentence]
                current_size = sentence_size
            else:
                current_chunk.append(sentence)
                current_size += sentence_size
        
        if current_chunk:
            chunks.append('. '.join(current_chunk) + '.')
        
        return chunks
    
    async def _generate_single_audio_chunk(self, text: str, voice_settings: Dict[str, Any],
                                         output_path: Path) -> Path:
        """Generate a single audio chunk"""
        response = await asyncio.to_thread(
            self.openai.audio.speech.create,
            model="tts-1-hd",
            voice=voice_settings['voice'],
            input=text,
            speed=voice_settings['speed']
        )
        
        with open(output_path, 'wb') as f:
            f.write(response.content)
        
        return output_path
    
    async def _combine_audio_chunks(self, chunk_paths: List[Path], 
                                  output_path: Path) -> Tuple[Path, float]:
        """Combine audio chunks into single file"""
        import subprocess
        
        # Create concat file
        concat_file = output_path.parent / "concat.txt"
        with open(concat_file, 'w') as f:
            for chunk_path in chunk_paths:
                f.write(f"file '{chunk_path.absolute()}'\n")
        
        # Use FFmpeg to concatenate
        cmd = [
            'ffmpeg', '-y', '-f', 'concat', '-safe', '0',
            '-i', str(concat_file),
            '-acodec', 'copy', str(output_path)
        ]
        
        result = await asyncio.to_thread(
            subprocess.run, cmd, capture_output=True, text=True
        )
        
        if result.returncode != 0:
            raise RuntimeError(f"FFmpeg concat failed: {result.stderr}")
        
        # Get duration
        probe_cmd = [
            'ffprobe', '-v', 'error', '-show_entries',
            'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1',
            str(output_path)
        ]
        
        duration_result = await asyncio.to_thread(
            subprocess.run, probe_cmd, capture_output=True, text=True
        )
        
        duration = float(duration_result.stdout.strip()) if duration_result.stdout else 0
        
        # Clean up
        concat_file.unlink()
        for chunk_path in chunk_paths:
            chunk_path.unlink()
        
        return output_path, duration
    
    async def _generate_scene_slides(self, scene_def: SceneDefinition,
                                   script: str, audio_duration: float,
                                   output_dir: Path) -> Tuple[List[Path], List[float]]:
        """Generate slides for scene with proper timing"""
        
        # Skip slide generation for practice and quiz scenes
        if scene_def.scene_type in ['practice', 'quiz']:
            logger.info(f"Skipping slide generation for {scene_def.scene_type} scene")
            return [], []
        
        slides_dir = output_dir / "slides"
        slides_dir.mkdir(exist_ok=True)
        
        # Determine number of slides based on duration and content
        slides_count = self._calculate_slides_count(scene_def, audio_duration)
        
        # Extract slide content from script and scene definition
        slide_contents = self._extract_slide_contents(
            scene_def, script, slides_count
        )
        
        # Generate slides
        slide_paths = []
        slide_timings = []
        time_per_slide = audio_duration / slides_count
        
        for i, content in enumerate(slide_contents):
            slide_path = slides_dir / f"slide_{i+1:02d}.png"
            
            # Generate slide image
            await self._create_slide_image(
                content, scene_def, i + 1, slides_count, slide_path
            )
            
            slide_paths.append(slide_path)
            slide_timings.append(i * time_per_slide)
        
        return slide_paths, slide_timings
    
    def _calculate_slides_count(self, scene_def: SceneDefinition, 
                               audio_duration: float) -> int:
        """Calculate optimal number of slides for scene"""
        # Skip slides for practice and quiz scenes
        if scene_def.scene_type in ['practice', 'quiz']:
            return 0
            
        # Base calculation: one slide per 15-20 seconds
        base_count = max(1, int(audio_duration / 17))
        
        # Adjust based on scene type
        if scene_def.scene_type == 'intro':
            return min(2, base_count)  # Intro scenes need fewer slides
        elif scene_def.scene_type == 'example':
            return max(3, base_count)  # Examples benefit from more visuals
        elif scene_def.scene_type == 'summary':
            return min(3, base_count)  # Summary should be concise
        
        # Adjust based on visual requirements
        if scene_def.requires_visual_aid:
            base_count = max(base_count, 2)
        
        # Cap at reasonable limits
        return min(max(1, base_count), 5)
    
    def _extract_slide_contents(self, scene_def: SceneDefinition,
                               script: str, slides_count: int) -> List[Dict[str, Any]]:
        """Extract content for each slide"""
        slide_contents = []
        
        # Use predefined slide content if available
        if hasattr(scene_def, 'slide_content') and scene_def.slide_content:
            # Scene definition already has slide content
            return scene_def.slide_content[:slides_count]
        
        # Otherwise, extract from script and key points
        if slides_count == 1:
            # Single slide with title and key points
            slide_contents.append({
                'title': scene_def.scene_title,
                'content': scene_def.key_points[:4],
                'type': 'title_bullets'
            })
        else:
            # Multiple slides
            # First slide: Title
            slide_contents.append({
                'title': scene_def.scene_title,
                'subtitle': f"Part {scene_def.scene_number} of your learning journey",
                'type': 'title_only'
            })
            
            # Middle slides: Content
            points_per_slide = max(1, len(scene_def.key_points) // (slides_count - 1))
            for i in range(1, slides_count):
                start_idx = (i - 1) * points_per_slide
                end_idx = start_idx + points_per_slide
                
                slide_contents.append({
                    'title': f"{scene_def.scene_title}",
                    'content': scene_def.key_points[start_idx:end_idx],
                    'type': 'content_bullets',
                    'page': f"{i}/{slides_count}"
                })
        
        return slide_contents
    
    async def _create_slide_image(self, content: Dict[str, Any],
                                scene_def: SceneDefinition,
                                slide_num: int, total_slides: int,
                                output_path: Path):
        """Create a slide image"""
        
        # Get template for scene type
        template = self.slide_templates.get(
            scene_def.scene_type,
            self.slide_templates['concept']
        )
        
        # Create base image
        img = Image.new('RGB', (self.slide_width, self.slide_height), template['bg_color'])
        draw = ImageDraw.Draw(img)
        
        # Try to load fonts
        try:
            title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 72)
            subtitle_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 48)
            content_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 36)
            small_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
        except:
            # Fallback to default
            title_font = ImageFont.load_default()
            subtitle_font = title_font
            content_font = title_font
            small_font = title_font
        
        # Add decorative elements
        self._add_slide_decorations(draw, template, scene_def.scene_type)
        
        # Add content based on type
        if content['type'] == 'title_only':
            # Center title
            draw.text((self.slide_width // 2, self.slide_height // 2 - 50),
                     content['title'], font=title_font, fill="#FFFFFF", anchor="mm")
            if 'subtitle' in content:
                draw.text((self.slide_width // 2, self.slide_height // 2 + 50),
                         content['subtitle'], font=subtitle_font, 
                         fill=template['accent_color'], anchor="mm")
        
        elif content['type'] == 'title_bullets':
            # Title at top
            draw.text((100, 150), content['title'], font=title_font, fill="#FFFFFF")
            
            # Bullets
            y_pos = 300
            for item in content.get('content', []):
                draw.text((150, y_pos), f"• {item}", font=content_font, fill="#FFFFFF")
                y_pos += 80
        
        elif content['type'] == 'content_bullets':
            # Header
            draw.text((100, 100), content['title'], font=subtitle_font, fill="#FFFFFF")
            
            # Content
            y_pos = 250
            for item in content.get('content', []):
                # Word wrap if needed
                if len(item) > 60:
                    lines = self._wrap_text(item, 60)
                    for line in lines:
                        draw.text((150, y_pos), f"• {line}", font=content_font, fill="#FFFFFF")
                        y_pos += 60
                else:
                    draw.text((150, y_pos), f"• {item}", font=content_font, fill="#FFFFFF")
                    y_pos += 80
            
            # Page indicator
            if 'page' in content:
                draw.text((self.slide_width - 150, self.slide_height - 100),
                         content['page'], font=small_font, fill="#888888")
        
        # Add footer
        self._add_slide_footer(draw, scene_def, slide_num, total_slides, small_font)
        
        # Save slide
        img.save(output_path, "PNG", quality=95)
    
    def _add_slide_decorations(self, draw: ImageDraw, template: Dict[str, Any], 
                              scene_type: str):
        """Add decorative elements to slide"""
        accent_color = template['accent_color']
        
        if scene_type == 'intro':
            # Add accent lines
            draw.rectangle([(0, 0), (self.slide_width, 10)], fill=accent_color)
            draw.rectangle([(0, self.slide_height - 10), (self.slide_width, self.slide_height)], 
                          fill=accent_color)
        
        elif scene_type == 'concept':
            # Add side accent
            draw.rectangle([(0, 0), (10, self.slide_height)], fill=accent_color)
        
        elif scene_type == 'example':
            # Add corner accents
            draw.polygon([(0, 0), (200, 0), (0, 200)], fill=accent_color)
            draw.polygon([(self.slide_width, self.slide_height), 
                         (self.slide_width - 200, self.slide_height),
                         (self.slide_width, self.slide_height - 200)], 
                        fill=accent_color)
    
    def _add_slide_footer(self, draw: ImageDraw, scene_def: SceneDefinition,
                         slide_num: int, total_slides: int, font):
        """Add footer to slide"""
        # Footer background
        footer_y = self.slide_height - 80
        draw.rectangle([(0, footer_y), (self.slide_width, self.slide_height)], 
                      fill="#000000", outline=None)
        
        # Footer text
        footer_text = f"Scene {scene_def.scene_number} • {scene_def.scene_title}"
        draw.text((60, footer_y + 30), footer_text, font=font, fill="#CCCCCC")
        
        # Progress indicator
        if total_slides > 1:
            progress_text = f"Slide {slide_num} of {total_slides}"
            draw.text((self.slide_width - 200, footer_y + 30), 
                     progress_text, font=font, fill="#CCCCCC")
    
    def _wrap_text(self, text: str, max_length: int) -> List[str]:
        """Simple text wrapping"""
        words = text.split()
        lines = []
        current_line = []
        current_length = 0
        
        for word in words:
            if current_length + len(word) + 1 > max_length and current_line:
                lines.append(' '.join(current_line))
                current_line = [word]
                current_length = len(word)
            else:
                current_line.append(word)
                current_length += len(word) + 1
        
        if current_line:
            lines.append(' '.join(current_line))
        
        return lines
    
    def _create_scene_metadata(self, scene_def: SceneDefinition,
                              employee_context: Dict[str, Any],
                              audio_duration: float,
                              slide_count: int) -> Dict[str, Any]:
        """Create metadata for scene"""
        return {
            'scene_definition': {
                'number': scene_def.scene_number,
                'type': scene_def.scene_type,
                'title': scene_def.scene_title,
                'complexity': scene_def.complexity_score,
                'planned_duration': scene_def.estimated_duration,
                'actual_duration': audio_duration
            },
            'personalization': {
                'employee_name': employee_context.get('name'),
                'employee_role': employee_context.get('role'),
                'personalization_level': employee_context.get('level', 'standard')
            },
            'assets': {
                'audio_generated': True,
                'slide_count': slide_count,
                'total_duration': audio_duration
            },
            'generation': {
                'timestamp': datetime.now().isoformat(),
                'model_version': 'scene_based_v1'
            }
        }
    
    def generate_scene_components_sync(self, scene_def: SceneDefinition,
                                     employee_context: Dict[str, Any],
                                     session_id: str) -> SceneAssets:
        """Synchronous wrapper for scene generation"""
        scenes_dir = self.output_dir / "scenes"
        scenes_dir.mkdir(exist_ok=True)
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(
                self.generate_scene_components(
                    scene_def, employee_context, session_id, scenes_dir
                )
            )
        finally:
            loop.close()