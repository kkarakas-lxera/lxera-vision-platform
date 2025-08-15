#!/usr/bin/env python3
"""
Content Essence Extractor
Extracts key educational elements from course content for multimedia generation
"""

import os
import json
import logging
import re
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict
from datetime import datetime

logger = logging.getLogger(__name__)

@dataclass
class ContentEssence:
    """Core essence of educational content for multimedia generation"""
    hook_statement: str
    core_insight: str
    practical_application: str
    reflection_prompt: str
    key_concepts: List[str]
    emotional_tone: str
    visual_metaphor: str
    learning_objective: str

@dataclass
class SlideEssence:
    """Essential elements for slide generation"""
    headline: str
    insight: str
    impact: str
    visual_metaphor: str
    key_points: List[str]
    cognitive_level: str

class ContentEssenceExtractor:
    """Extracts educational essence from content for optimal multimedia generation"""
    
    def __init__(self, enable_nlp: bool = True):
        """Initialize content essence extractor"""
        self.enable_nlp = enable_nlp
        
        # Educational content patterns
        self.concept_indicators = [
            'understand', 'analyze', 'evaluate', 'synthesize', 'integrate',
            'concept', 'principle', 'theory', 'framework', 'approach'
        ]
        
        self.practical_indicators = [
            'apply', 'implement', 'use', 'practice', 'execute',
            'example', 'case', 'scenario', 'situation', 'real-world'
        ]
        
        self.emotional_tones = {
            'excited': ['amazing', 'incredible', 'breakthrough', 'revolutionary'],
            'thoughtful': ['consider', 'reflect', 'think about', 'contemplate'],
            'encouraging': ['achieve', 'succeed', 'improve', 'grow', 'develop'],
            'serious': ['critical', 'important', 'essential', 'vital', 'crucial']
        }
        
        logger.info("Content Essence Extractor initialized")
    
    def extract_content_essence(
        self,
        content: Dict[str, Any],
        employee_context: Optional[Dict[str, Any]] = None
    ) -> ContentEssence:
        """Extract core essence from content for multimedia generation"""
        
        try:
            # Combine all content sections
            full_text = ""
            sections = ['introduction', 'core_content', 'practical_applications', 'case_studies']
            
            for section in sections:
                section_content = content.get(section, '')
                if section_content:
                    full_text += f"{section_content}\n\n"
            
            # Extract key concepts
            key_concepts = self._extract_key_concepts(full_text)
            
            # Generate hook statement
            hook_statement = self._generate_hook_statement(content, employee_context)
            
            # Extract core insight
            core_insight = self._extract_core_insight(full_text)
            
            # Generate practical application
            practical_application = self._extract_practical_application(content)
            
            # Create reflection prompt
            reflection_prompt = self._generate_reflection_prompt(content, employee_context)
            
            # Determine emotional tone
            emotional_tone = self._analyze_emotional_tone(full_text)
            
            # Generate visual metaphor
            visual_metaphor = self._suggest_visual_metaphor(content, key_concepts)
            
            # Extract learning objective
            learning_objective = self._extract_learning_objective(content)
            
            essence = ContentEssence(
                hook_statement=hook_statement,
                core_insight=core_insight,
                practical_application=practical_application,
                reflection_prompt=reflection_prompt,
                key_concepts=key_concepts,
                emotional_tone=emotional_tone,
                visual_metaphor=visual_metaphor,
                learning_objective=learning_objective
            )
            
            logger.info(f"Content essence extracted: {len(key_concepts)} concepts, {emotional_tone} tone")
            return essence
            
        except Exception as e:
            logger.error(f"Content essence extraction failed: {e}")
            return self._create_fallback_essence(content)
    
    def extract_slide_essences(
        self,
        content: Dict[str, Any],
        slide_data: List[Dict[str, Any]]
    ) -> List[SlideEssence]:
        """Extract essence for individual slides"""
        
        slide_essences = []
        
        for i, slide in enumerate(slide_data):
            try:
                # Extract slide-specific content
                slide_text = slide.get('speaker_notes', '') or slide.get('content', '')
                
                # Generate compelling headline (5-7 words)
                headline = self._generate_slide_headline(slide_text, i)
                
                # Extract core insight (15-20 words)
                insight = self._extract_slide_insight(slide_text)
                
                # Generate impact statement
                impact = self._generate_impact_statement(slide_text)
                
                # Suggest visual metaphor
                visual_metaphor = self._suggest_slide_visual(slide_text)
                
                # Extract key points
                key_points = self._extract_slide_key_points(slide_text)
                
                # Determine cognitive level
                cognitive_level = self._determine_cognitive_level(slide_text)
                
                slide_essence = SlideEssence(
                    headline=headline,
                    insight=insight,
                    impact=impact,
                    visual_metaphor=visual_metaphor,
                    key_points=key_points,
                    cognitive_level=cognitive_level
                )
                
                slide_essences.append(slide_essence)
                
            except Exception as e:
                logger.error(f"Slide essence extraction failed for slide {i}: {e}")
                slide_essences.append(self._create_fallback_slide_essence(i))
        
        return slide_essences
    
    def _extract_key_concepts(self, text: str) -> List[str]:
        """Extract key concepts using pattern matching"""
        concepts = []
        
        # Look for concept patterns
        concept_patterns = [
            r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:is|are|means|refers to)',
            r'(?:concept of|principle of|theory of)\s+([a-z\s]+)',
            r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+framework',
            r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+methodology'
        ]
        
        for pattern in concept_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            concepts.extend([match.strip() for match in matches if len(match.strip()) > 3])
        
        # Remove duplicates and limit to top 5
        unique_concepts = list(dict.fromkeys(concepts))[:5]
        
        return unique_concepts if unique_concepts else ['Key Learning Points', 'Practical Skills', 'Application Methods']
    
    def _generate_hook_statement(self, content: Dict[str, Any], employee_context: Optional[Dict[str, Any]]) -> str:
        """Generate compelling hook statement"""
        module_name = content.get('module_name', 'Course Module')
        
        if employee_context:
            name = employee_context.get('name', 'professional')
            role = employee_context.get('role', 'team member')
            return f"Discover how {module_name} can transform your effectiveness as a {role}"
        else:
            return f"Master the essential skills in {module_name} that top professionals use daily"
    
    def _extract_core_insight(self, text: str) -> str:
        """Extract the most important insight from content"""
        # Look for insight patterns
        insight_patterns = [
            r'(?:key insight|main point|important to understand|critical to know)[\s:]+([^.!?]+[.!?])',
            r'(?:remember that|keep in mind|important note)[\s:]+([^.!?]+[.!?])',
            r'(?:the key is|the secret is|what matters most)[\s:]+([^.!?]+[.!?])'
        ]
        
        for pattern in insight_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                return matches[0].strip()
        
        # Fallback: extract first sentence with key words
        sentences = re.split(r'[.!?]+', text)
        for sentence in sentences:
            if any(indicator in sentence.lower() for indicator in self.concept_indicators):
                return sentence.strip()
        
        return "Understanding the core concepts will enhance your professional capabilities"
    
    def _extract_practical_application(self, content: Dict[str, Any]) -> str:
        """Extract practical application from content"""
        practical_content = content.get('practical_applications', '')
        
        if practical_content:
            # Extract first actionable sentence
            sentences = re.split(r'[.!?]+', practical_content)
            for sentence in sentences:
                if any(indicator in sentence.lower() for indicator in ['apply', 'use', 'implement', 'practice']):
                    return sentence.strip()
        
        return "Apply these concepts immediately in your daily work to see measurable results"
    
    def _generate_reflection_prompt(self, content: Dict[str, Any], employee_context: Optional[Dict[str, Any]]) -> str:
        """Generate thought-provoking reflection prompt"""
        module_name = content.get('module_name', 'this topic')
        
        if employee_context:
            role = employee_context.get('role', 'professional')
            return f"How will mastering {module_name} change your approach as a {role}?"
        else:
            return f"What aspects of {module_name} will have the biggest impact on your work?"
    
    def _analyze_emotional_tone(self, text: str) -> str:
        """Analyze emotional tone of content"""
        tone_scores = {}
        
        for tone, keywords in self.emotional_tones.items():
            score = sum(1 for keyword in keywords if keyword.lower() in text.lower())
            tone_scores[tone] = score
        
        if tone_scores:
            dominant_tone = max(tone_scores, key=tone_scores.get)
            return dominant_tone if tone_scores[dominant_tone] > 0 else 'thoughtful'
        
        return 'thoughtful'
    
    def _suggest_visual_metaphor(self, content: Dict[str, Any], key_concepts: List[str]) -> str:
        """Suggest visual metaphor for content"""
        module_name = content.get('module_name', '').lower()
        
        # Common metaphors for different content types
        if any(word in module_name for word in ['data', 'analysis', 'report']):
            return 'building blocks and foundations'
        elif any(word in module_name for word in ['excel', 'spreadsheet', 'calculation']):
            return 'toolkit and precision instruments'
        elif any(word in module_name for word in ['leadership', 'management']):
            return 'compass and navigation'
        elif any(word in module_name for word in ['process', 'workflow']):
            return 'pathway and progression steps'
        else:
            return 'growth and development journey'
    
    def _extract_learning_objective(self, content: Dict[str, Any]) -> str:
        """Extract or generate learning objective"""
        intro = content.get('introduction', '')
        
        # Look for objective patterns
        objective_patterns = [
            r'(?:you will learn|you will understand|you will be able to|by the end)[\s:]+([^.!?]+[.!?])',
            r'(?:objective|goal|aim)[\s:]+([^.!?]+[.!?])',
            r'(?:this module will|this course will)[\s:]+([^.!?]+[.!?])'
        ]
        
        for pattern in objective_patterns:
            matches = re.findall(pattern, intro, re.IGNORECASE)
            if matches:
                return matches[0].strip()
        
        module_name = content.get('module_name', 'course module')
        return f"Master the essential concepts and practical applications of {module_name}"
    
    def _generate_slide_headline(self, slide_text: str, slide_number: int) -> str:
        """Generate compelling 5-7 word headline for slide"""
        # Extract first strong phrase
        sentences = re.split(r'[.!?]+', slide_text)
        if sentences and len(sentences[0].strip()) > 0:
            words = sentences[0].strip().split()
            if len(words) <= 7:
                return sentences[0].strip()
            else:
                return ' '.join(words[:6]) + '...'
        
        return f"Key Learning Point {slide_number + 1}"
    
    def _extract_slide_insight(self, slide_text: str) -> str:
        """Extract 15-20 word insight from slide"""
        sentences = re.split(r'[.!?]+', slide_text)
        for sentence in sentences:
            words = sentence.strip().split()
            if 10 <= len(words) <= 25:
                return sentence.strip()
        
        # Fallback: take first sentence up to 20 words
        if sentences:
            words = sentences[0].strip().split()[:20]
            return ' '.join(words)
        
        return "Essential knowledge that enhances professional performance"
    
    def _generate_impact_statement(self, slide_text: str) -> str:
        """Generate personal relevance statement"""
        # Look for impact patterns
        if 'improve' in slide_text.lower():
            return "Directly improves your daily work efficiency"
        elif 'save' in slide_text.lower() or 'time' in slide_text.lower():
            return "Saves valuable time in routine tasks"
        elif 'accuracy' in slide_text.lower() or 'error' in slide_text.lower():
            return "Reduces errors and increases accuracy"
        else:
            return "Enhances your professional capabilities"
    
    def _suggest_slide_visual(self, slide_text: str) -> str:
        """Suggest visual metaphor for slide"""
        text_lower = slide_text.lower()
        
        if any(word in text_lower for word in ['step', 'process', 'flow']):
            return 'arrow progression'
        elif any(word in text_lower for word in ['compare', 'versus', 'difference']):
            return 'side-by-side comparison'
        elif any(word in text_lower for word in ['data', 'chart', 'graph']):
            return 'visual data representation'
        elif any(word in text_lower for word in ['tool', 'feature', 'function']):
            return 'interface elements'
        else:
            return 'concept illustration'
    
    def _extract_slide_key_points(self, slide_text: str) -> List[str]:
        """Extract key points from slide text"""
        # Look for bullet points or numbered lists
        bullet_patterns = [
            r'[\-\*\•]\s*([^.\n]+)',
            r'\d+[\.\)]\s*([^.\n]+)',
            r'(?:first|second|third|fourth|fifth)[\s:]+([^.\n]+)'
        ]
        
        points = []
        for pattern in bullet_patterns:
            matches = re.findall(pattern, slide_text, re.IGNORECASE)
            points.extend([match.strip() for match in matches])
        
        # If no structured points found, extract sentences
        if not points:
            sentences = re.split(r'[.!?]+', slide_text)
            points = [s.strip() for s in sentences[:3] if len(s.strip()) > 10]
        
        return points[:5]  # Limit to 5 key points
    
    def _determine_cognitive_level(self, slide_text: str) -> str:
        """Determine Bloom's taxonomy cognitive level"""
        text_lower = slide_text.lower()
        
        if any(word in text_lower for word in ['create', 'design', 'develop', 'build']):
            return 'Create'
        elif any(word in text_lower for word in ['evaluate', 'assess', 'critique', 'judge']):
            return 'Evaluate'
        elif any(word in text_lower for word in ['analyze', 'examine', 'compare', 'contrast']):
            return 'Analyze'
        elif any(word in text_lower for word in ['apply', 'use', 'implement', 'execute']):
            return 'Apply'
        elif any(word in text_lower for word in ['explain', 'describe', 'interpret', 'summarize']):
            return 'Understand'
        else:
            return 'Remember'
    
    def _create_fallback_essence(self, content: Dict[str, Any]) -> ContentEssence:
        """Create fallback essence if extraction fails"""
        module_name = content.get('module_name', 'Course Module')
        
        return ContentEssence(
            hook_statement=f"Master essential skills in {module_name}",
            core_insight="Professional growth through structured learning",
            practical_application="Apply concepts immediately in daily work",
            reflection_prompt="How will these skills enhance your performance?",
            key_concepts=['Professional Development', 'Skill Building', 'Performance Enhancement'],
            emotional_tone='encouraging',
            visual_metaphor='growth and progress',
            learning_objective=f"Develop proficiency in {module_name}"
        )
    
    def _create_fallback_slide_essence(self, slide_number: int) -> SlideEssence:
        """Create fallback slide essence"""
        return SlideEssence(
            headline=f"Learning Point {slide_number + 1}",
            insight="Essential knowledge for professional growth",
            impact="Enhances your daily work effectiveness",
            visual_metaphor='concept illustration',
            key_points=['Key concept', 'Practical application', 'Professional benefit'],
            cognitive_level='Understand'
        )
    
    def export_essence_to_json(self, essence: ContentEssence, file_path: str) -> None:
        """Export content essence to JSON file"""
        try:
            essence_dict = asdict(essence)
            essence_dict['extracted_at'] = datetime.now().isoformat()
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(essence_dict, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Content essence exported to: {file_path}")
            
        except Exception as e:
            logger.error(f"Failed to export essence: {e}")