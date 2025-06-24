#!/usr/bin/env python3
"""
Dynamic Scene Analyzer for Content-Aware Multimedia Generation
Intelligently analyzes module content and creates optimal scene boundaries
"""

import re
import json
import logging
from typing import List, Dict, Any, Tuple, Optional
from dataclasses import dataclass, field
from datetime import datetime
import tiktoken
from openai import OpenAI

# Configure logging
logger = logging.getLogger(__name__)

@dataclass
class SceneDefinition:
    """Definition of a single scene"""
    scene_number: int
    scene_type: str  # intro, concept, example, practice, summary, transition
    scene_title: str
    scene_slug: str
    source_content: str
    estimated_duration: float  # seconds
    key_points: List[str] = field(default_factory=list)
    learning_objectives: List[str] = field(default_factory=list)
    complexity_score: float = 0.5  # 0-1, affects pacing
    requires_visual_aid: bool = False
    personalization_hooks: Dict[str, Any] = field(default_factory=dict)

class DynamicSceneAnalyzer:
    """Analyzes content and creates intelligent scene boundaries"""
    
    def __init__(self, openai_client: Optional[OpenAI] = None):
        """Initialize the scene analyzer"""
        self.openai = openai_client
        self.encoding = tiktoken.encoding_for_model("gpt-4")
        
        # Scene duration targets (in seconds)
        self.MIN_SCENE_DURATION = 30
        self.MAX_SCENE_DURATION = 120
        self.TARGET_SCENE_DURATION = 60
        
        # Content markers for scene boundaries
        self.section_markers = [
            r'\n#{1,3}\s+',  # Markdown headers
            r'\n\d+\.\s+',    # Numbered lists
            r'\n\*{3,}',      # Horizontal rules
            r'\n[A-Z][^.!?]*:$',  # Section titles ending with colon
        ]
        
        # Keywords indicating scene types
        self.scene_type_indicators = {
            'intro': ['introduction', 'overview', 'welcome', 'objectives', 'goals'],
            'concept': ['concept', 'theory', 'principle', 'fundamental', 'understanding'],
            'example': ['example', 'case study', 'scenario', 'demonstration', 'practice'],
            'practice': ['exercise', 'activity', 'hands-on', 'try', 'implement'],
            'summary': ['summary', 'recap', 'conclusion', 'key takeaways', 'remember'],
            'deep_dive': ['advanced', 'detailed', 'in-depth', 'technical', 'complex']
        }
    
    def analyze_module_content(self, content: str, module_metadata: Dict[str, Any]) -> List[SceneDefinition]:
        """
        Analyze module content and create optimal scene definitions
        
        Args:
            content: The module content text
            module_metadata: Metadata about the module (name, objectives, etc.)
            
        Returns:
            List of scene definitions
        """
        logger.info(f"Analyzing content for module: {module_metadata.get('name', 'Unknown')}")
        
        # Step 1: Extract natural sections from content
        sections = self._extract_content_sections(content)
        logger.info(f"Extracted {len(sections)} natural sections from content")
        
        # Step 2: Analyze each section's characteristics
        analyzed_sections = []
        for i, section in enumerate(sections):
            analysis = self._analyze_section(section, i, len(sections))
            analyzed_sections.append(analysis)
        
        # Step 3: Create initial scene boundaries
        scenes = self._create_scene_boundaries(analyzed_sections, module_metadata)
        logger.info(f"Created {len(scenes)} initial scenes")
        
        # Step 4: Optimize scene flow and timing
        optimized_scenes = self._optimize_scene_flow(scenes)
        logger.info(f"Optimized to {len(optimized_scenes)} final scenes")
        
        # Step 5: Add personalization hooks
        final_scenes = self._add_personalization_hooks(optimized_scenes, module_metadata)
        
        return final_scenes
    
    def _extract_content_sections(self, content: str) -> List[Dict[str, Any]]:
        """Extract natural sections from content"""
        sections = []
        
        # Try to find natural section breaks
        combined_pattern = '|'.join(self.section_markers)
        potential_breaks = list(re.finditer(combined_pattern, content, re.MULTILINE))
        
        if not potential_breaks:
            # No clear sections, split by paragraphs
            paragraphs = content.split('\n\n')
            current_section = []
            current_tokens = 0
            
            for para in paragraphs:
                para_tokens = len(self.encoding.encode(para))
                if current_tokens + para_tokens > 300 and current_section:  # ~300 tokens per section
                    sections.append({
                        'content': '\n\n'.join(current_section),
                        'type': 'paragraph_group',
                        'token_count': current_tokens
                    })
                    current_section = [para]
                    current_tokens = para_tokens
                else:
                    current_section.append(para)
                    current_tokens += para_tokens
            
            if current_section:
                sections.append({
                    'content': '\n\n'.join(current_section),
                    'type': 'paragraph_group',
                    'token_count': current_tokens
                })
        else:
            # Use natural section breaks
            last_pos = 0
            for i, match in enumerate(potential_breaks):
                section_content = content[last_pos:match.start()].strip()
                if section_content:
                    sections.append({
                        'content': section_content,
                        'type': self._identify_section_type(match.group()),
                        'header': match.group().strip(),
                        'token_count': len(self.encoding.encode(section_content))
                    })
                last_pos = match.end()
            
            # Don't forget the last section
            if last_pos < len(content):
                remaining = content[last_pos:].strip()
                if remaining:
                    sections.append({
                        'content': remaining,
                        'type': 'final',
                        'token_count': len(self.encoding.encode(remaining))
                    })
        
        return sections
    
    def _identify_section_type(self, marker: str) -> str:
        """Identify section type from marker"""
        if re.match(r'#{1,3}', marker):
            return 'header'
        elif re.match(r'\d+\.', marker):
            return 'numbered'
        elif re.match(r'\*{3,}', marker):
            return 'separator'
        else:
            return 'titled'
    
    def _analyze_section(self, section: Dict[str, Any], index: int, total_sections: int) -> Dict[str, Any]:
        """Analyze a section's characteristics"""
        content = section['content']
        
        # Determine scene type based on content
        scene_type = self._determine_scene_type(content, index, total_sections)
        
        # Calculate complexity score
        complexity = self._calculate_complexity(content)
        
        # Estimate reading time (words per minute for narration)
        word_count = len(content.split())
        narration_wpm = 150  # Typical narration speed
        estimated_duration = (word_count / narration_wpm) * 60  # seconds
        
        # Check if visual aids would help
        requires_visual = self._check_visual_requirements(content)
        
        # Extract key points
        key_points = self._extract_key_points(content)
        
        return {
            **section,
            'scene_type': scene_type,
            'complexity': complexity,
            'estimated_duration': estimated_duration,
            'requires_visual': requires_visual,
            'key_points': key_points,
            'word_count': word_count
        }
    
    def _determine_scene_type(self, content: str, index: int, total: int) -> str:
        """Determine the type of scene based on content and position"""
        content_lower = content.lower()
        
        # Check position-based hints
        if index == 0:
            return 'intro'
        elif index >= total - 1:
            return 'summary'
        
        # Check content-based indicators
        scores = {}
        for scene_type, keywords in self.scene_type_indicators.items():
            score = sum(1 for keyword in keywords if keyword in content_lower)
            if score > 0:
                scores[scene_type] = score
        
        if scores:
            return max(scores, key=scores.get)
        
        # Default based on content characteristics
        if '?' in content and len(content.split('?')) > 2:
            return 'practice'  # Multiple questions suggest practice
        elif any(word in content_lower for word in ['for example', 'consider', 'imagine']):
            return 'example'
        else:
            return 'concept'
    
    def _calculate_complexity(self, content: str) -> float:
        """Calculate content complexity score (0-1)"""
        factors = {
            'sentence_length': 0,
            'technical_terms': 0,
            'concept_density': 0
        }
        
        sentences = re.split(r'[.!?]+', content)
        if sentences:
            # Average sentence length
            avg_length = sum(len(s.split()) for s in sentences) / len(sentences)
            factors['sentence_length'] = min(avg_length / 30, 1.0)  # Normalize to 0-1
        
        # Technical term density (simple heuristic)
        technical_patterns = r'\b[A-Z]{2,}\b|\b\w+ization\b|\b\w+ility\b'
        technical_matches = len(re.findall(technical_patterns, content))
        factors['technical_terms'] = min(technical_matches / 50, 1.0)
        
        # Concept density (colons, definitions, enumerations)
        concept_indicators = len(re.findall(r':|means|defined as|refers to|\d+\)', content))
        factors['concept_density'] = min(concept_indicators / 20, 1.0)
        
        # Weighted average
        complexity = (
            factors['sentence_length'] * 0.3 +
            factors['technical_terms'] * 0.4 +
            factors['concept_density'] * 0.3
        )
        
        return round(complexity, 2)
    
    def _check_visual_requirements(self, content: str) -> bool:
        """Check if content would benefit from visual aids"""
        visual_indicators = [
            r'\bdiagram\b', r'\bchart\b', r'\bgraph\b', r'\bprocess\b',
            r'\bsteps?\b', r'\bflow\b', r'\bstructure\b', r'\bcomponents?\b',
            r'\d+\s*[:\-]\s*\w+',  # Numbered lists
            r'first.*second.*third',  # Sequential items
        ]
        
        for pattern in visual_indicators:
            if re.search(pattern, content, re.IGNORECASE):
                return True
        
        return False
    
    def _extract_key_points(self, content: str) -> List[str]:
        """Extract key points from content"""
        key_points = []
        
        # Look for explicitly marked key points
        bullet_points = re.findall(r'[•\-\*]\s*([^•\-\*\n]+)', content)
        if bullet_points:
            key_points.extend([point.strip() for point in bullet_points[:5]])
        
        # Look for numbered points
        numbered_points = re.findall(r'\d+[.)\]]\s*([^.!?\n]+)', content)
        if numbered_points and not key_points:
            key_points.extend([point.strip() for point in numbered_points[:5]])
        
        # If no explicit points, extract important sentences
        if not key_points:
            sentences = re.split(r'[.!?]+', content)
            # Simple importance heuristic: sentences with "is", "are", "means"
            important_sentences = [
                s.strip() for s in sentences
                if any(word in s.lower() for word in ['is', 'are', 'means', 'important', 'key'])
            ][:3]
            key_points.extend(important_sentences)
        
        return key_points
    
    def _create_scene_boundaries(self, sections: List[Dict[str, Any]], module_metadata: Dict[str, Any]) -> List[SceneDefinition]:
        """Create scene boundaries from analyzed sections"""
        scenes = []
        scene_number = 1
        
        # Always start with an intro scene
        intro_scene = self._create_intro_scene(module_metadata, scene_number)
        scenes.append(intro_scene)
        scene_number += 1
        
        # Group sections into scenes based on duration and content
        current_scene_sections = []
        current_duration = 0
        
        for section in sections:
            section_duration = section['estimated_duration']
            
            # Check if adding this section would exceed max duration
            if current_duration + section_duration > self.MAX_SCENE_DURATION and current_scene_sections:
                # Create scene from current sections
                scene = self._create_scene_from_sections(
                    current_scene_sections, scene_number, module_metadata
                )
                scenes.append(scene)
                scene_number += 1
                
                # Start new scene
                current_scene_sections = [section]
                current_duration = section_duration
            else:
                current_scene_sections.append(section)
                current_duration += section_duration
                
                # Create scene if we hit the target duration
                if current_duration >= self.TARGET_SCENE_DURATION:
                    scene = self._create_scene_from_sections(
                        current_scene_sections, scene_number, module_metadata
                    )
                    scenes.append(scene)
                    scene_number += 1
                    current_scene_sections = []
                    current_duration = 0
        
        # Don't forget remaining sections
        if current_scene_sections:
            scene = self._create_scene_from_sections(
                current_scene_sections, scene_number, module_metadata
            )
            scenes.append(scene)
            scene_number += 1
        
        # Always end with a summary scene
        summary_scene = self._create_summary_scene(scenes, module_metadata, scene_number)
        scenes.append(summary_scene)
        
        return scenes
    
    def _create_intro_scene(self, module_metadata: Dict[str, Any], scene_number: int) -> SceneDefinition:
        """Create an introduction scene"""
        module_name = module_metadata.get('name', 'this module')
        objectives = module_metadata.get('objectives', [])
        
        intro_content = f"""Welcome to {module_name}. In this module, we'll explore key concepts that will enhance your professional skills.
        
Our learning objectives include:
{chr(10).join(f'• {obj}' for obj in objectives[:3]) if objectives else '• Understanding core concepts\n• Applying knowledge practically\n• Building expertise'}

Let's begin this learning journey together."""
        
        return SceneDefinition(
            scene_number=scene_number,
            scene_type='intro',
            scene_title='Welcome & Introduction',
            scene_slug='welcome-introduction',
            source_content=intro_content,
            estimated_duration=30,
            key_points=objectives[:3] if objectives else ['Core concepts', 'Practical application'],
            learning_objectives=objectives,
            complexity_score=0.2,
            requires_visual_aid=True
        )
    
    def _create_scene_from_sections(self, sections: List[Dict[str, Any]], 
                                   scene_number: int, 
                                   module_metadata: Dict[str, Any]) -> SceneDefinition:
        """Create a scene from one or more sections"""
        # Combine content
        combined_content = '\n\n'.join(s['content'] for s in sections)
        
        # Determine scene type (use most common or highest complexity)
        scene_types = [s['scene_type'] for s in sections]
        scene_type = max(set(scene_types), key=scene_types.count)
        
        # Calculate combined metrics
        total_duration = sum(s['estimated_duration'] for s in sections)
        avg_complexity = sum(s['complexity'] for s in sections) / len(sections)
        requires_visual = any(s['requires_visual'] for s in sections)
        
        # Combine key points
        all_key_points = []
        for s in sections:
            all_key_points.extend(s.get('key_points', []))
        key_points = all_key_points[:5]  # Limit to 5 key points
        
        # Generate scene title
        if sections[0].get('header'):
            scene_title = sections[0]['header'].strip('#-*: ')
        else:
            scene_title = self._generate_scene_title(scene_type, scene_number)
        
        scene_slug = re.sub(r'[^a-z0-9]+', '-', scene_title.lower()).strip('-')
        
        return SceneDefinition(
            scene_number=scene_number,
            scene_type=scene_type,
            scene_title=scene_title,
            scene_slug=scene_slug,
            source_content=combined_content,
            estimated_duration=total_duration,
            key_points=key_points,
            complexity_score=avg_complexity,
            requires_visual_aid=requires_visual
        )
    
    def _generate_scene_title(self, scene_type: str, scene_number: int) -> str:
        """Generate a title for a scene based on its type"""
        titles = {
            'concept': f'Core Concept {scene_number - 1}',
            'example': f'Practical Example {scene_number - 1}',
            'practice': f'Practice Exercise {scene_number - 1}',
            'deep_dive': f'Deep Dive {scene_number - 1}',
            'transition': f'Moving Forward',
        }
        return titles.get(scene_type, f'Section {scene_number}')
    
    def _create_summary_scene(self, scenes: List[SceneDefinition], 
                             module_metadata: Dict[str, Any], 
                             scene_number: int) -> SceneDefinition:
        """Create a summary scene"""
        # Extract key points from all scenes
        all_key_points = []
        for scene in scenes[1:]:  # Skip intro
            all_key_points.extend(scene.key_points[:2])  # Top 2 from each
        
        # Limit to most important
        summary_points = all_key_points[:5]
        
        summary_content = f"""Let's recap what we've learned in {module_metadata.get('name', 'this module')}.

Key takeaways:
{chr(10).join(f'• {point}' for point in summary_points)}

Remember to apply these concepts in your daily work for maximum benefit."""
        
        return SceneDefinition(
            scene_number=scene_number,
            scene_type='summary',
            scene_title='Module Summary & Next Steps',
            scene_slug='module-summary-next-steps',
            source_content=summary_content,
            estimated_duration=45,
            key_points=summary_points,
            complexity_score=0.3,
            requires_visual_aid=True
        )
    
    def _optimize_scene_flow(self, scenes: List[SceneDefinition]) -> List[SceneDefinition]:
        """Optimize scene flow for better pacing and engagement"""
        optimized = []
        
        for i, scene in enumerate(scenes):
            # Check if scene is too short
            if scene.estimated_duration < self.MIN_SCENE_DURATION and i > 0 and i < len(scenes) - 1:
                # Try to merge with adjacent scene
                if i + 1 < len(scenes) and scenes[i + 1].scene_type == scene.scene_type:
                    # Merge with next scene
                    next_scene = scenes[i + 1]
                    merged = self._merge_scenes(scene, next_scene)
                    optimized.append(merged)
                    scenes[i + 1] = None  # Mark as merged
                    continue
            
            # Check if scene is too long
            elif scene.estimated_duration > self.MAX_SCENE_DURATION:
                # Split into multiple scenes
                split_scenes = self._split_scene(scene)
                optimized.extend(split_scenes)
                continue
            
            # Scene is good as is
            if scene is not None:
                optimized.append(scene)
        
        # Renumber scenes
        for i, scene in enumerate(optimized):
            scene.scene_number = i + 1
        
        return optimized
    
    def _merge_scenes(self, scene1: SceneDefinition, scene2: SceneDefinition) -> SceneDefinition:
        """Merge two scenes"""
        return SceneDefinition(
            scene_number=scene1.scene_number,
            scene_type=scene1.scene_type,
            scene_title=scene1.scene_title,
            scene_slug=scene1.scene_slug,
            source_content=f"{scene1.source_content}\n\n{scene2.source_content}",
            estimated_duration=scene1.estimated_duration + scene2.estimated_duration,
            key_points=scene1.key_points + scene2.key_points[:2],
            learning_objectives=scene1.learning_objectives,
            complexity_score=(scene1.complexity_score + scene2.complexity_score) / 2,
            requires_visual_aid=scene1.requires_visual_aid or scene2.requires_visual_aid
        )
    
    def _split_scene(self, scene: SceneDefinition) -> List[SceneDefinition]:
        """Split a long scene into multiple scenes"""
        # Simple split by paragraphs
        paragraphs = scene.source_content.split('\n\n')
        mid_point = len(paragraphs) // 2
        
        scene1 = SceneDefinition(
            scene_number=scene.scene_number,
            scene_type=scene.scene_type,
            scene_title=f"{scene.scene_title} - Part 1",
            scene_slug=f"{scene.scene_slug}-part-1",
            source_content='\n\n'.join(paragraphs[:mid_point]),
            estimated_duration=scene.estimated_duration / 2,
            key_points=scene.key_points[:3],
            learning_objectives=scene.learning_objectives,
            complexity_score=scene.complexity_score,
            requires_visual_aid=scene.requires_visual_aid
        )
        
        scene2 = SceneDefinition(
            scene_number=scene.scene_number + 0.5,  # Will be renumbered
            scene_type=scene.scene_type,
            scene_title=f"{scene.scene_title} - Part 2",
            scene_slug=f"{scene.scene_slug}-part-2",
            source_content='\n\n'.join(paragraphs[mid_point:]),
            estimated_duration=scene.estimated_duration / 2,
            key_points=scene.key_points[3:],
            learning_objectives=scene.learning_objectives,
            complexity_score=scene.complexity_score,
            requires_visual_aid=scene.requires_visual_aid
        )
        
        return [scene1, scene2]
    
    def _add_personalization_hooks(self, scenes: List[SceneDefinition], 
                                  module_metadata: Dict[str, Any]) -> List[SceneDefinition]:
        """Add personalization hooks to scenes"""
        for scene in scenes:
            scene.personalization_hooks = {
                'employee_name_slots': self._find_name_slots(scene.source_content),
                'role_context_slots': self._find_role_slots(scene.source_content),
                'experience_level_adjustments': scene.complexity_score,
                'industry_examples_needed': scene.scene_type in ['example', 'practice'],
                'career_goal_references': scene.scene_type in ['intro', 'summary']
            }
        
        return scenes
    
    def _find_name_slots(self, content: str) -> List[int]:
        """Find positions where employee name could be inserted"""
        slots = []
        patterns = [
            r'Welcome to',
            r'As you',
            r'Remember that',
            r'You will',
            r'In your role'
        ]
        
        for pattern in patterns:
            for match in re.finditer(pattern, content):
                slots.append(match.start())
        
        return slots
    
    def _find_role_slots(self, content: str) -> List[int]:
        """Find positions where role context could be inserted"""
        slots = []
        patterns = [
            r'professionals',
            r'in practice',
            r'your work',
            r'daily activities',
            r'responsibilities'
        ]
        
        for pattern in patterns:
            for match in re.finditer(pattern, content, re.IGNORECASE):
                slots.append(match.start())
        
        return slots
    
    def analyze_content_with_ai(self, content: str, module_metadata: Dict[str, Any]) -> List[SceneDefinition]:
        """
        Use AI to enhance scene analysis (optional method if OpenAI client is available)
        """
        if not self.openai:
            logger.warning("OpenAI client not available, using rule-based analysis only")
            return self.analyze_module_content(content, module_metadata)
        
        # First do rule-based analysis
        initial_scenes = self.analyze_module_content(content, module_metadata)
        
        # Then enhance with AI
        try:
            prompt = f"""Analyze this module content and suggest optimal scene boundaries for a multimedia learning experience.

Module: {module_metadata.get('name', 'Unknown')}
Current scene count: {len(initial_scenes)}
Target duration per scene: 30-120 seconds

Content preview:
{content[:1000]}...

Current scenes:
{json.dumps([{'number': s.scene_number, 'type': s.scene_type, 'title': s.scene_title, 'duration': s.estimated_duration} for s in initial_scenes], indent=2)}

Suggest any improvements to the scene structure for better learning outcomes. Consider:
1. Natural content breaks
2. Cognitive load management
3. Engagement and pacing
4. Visual aid opportunities

Return suggestions in JSON format."""

            response = self.openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert in instructional design and multimedia learning."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            # Parse AI suggestions and apply if valid
            suggestions = response.choices[0].message.content
            logger.info(f"AI scene suggestions: {suggestions[:200]}...")
            
            # For now, return the initial scenes
            # In production, we would parse and apply the AI suggestions
            return initial_scenes
            
        except Exception as e:
            logger.error(f"AI scene analysis failed: {e}")
            return initial_scenes