#!/usr/bin/env python3
"""
Content Essence Extractor
Extracts the educational spirit and core insights from content for compelling slides
"""

import re
import logging
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass
import nltk
from collections import Counter

logger = logging.getLogger(__name__)

# Download required NLTK data
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('averaged_perceptron_tagger', quiet=True)
except:
    logger.warning("NLTK download failed, using basic extraction")

@dataclass
class ContentEssence:
    """The distilled essence of educational content"""
    hook_statement: str          # Attention-grabbing opening
    core_insight: str           # Main teaching point
    practical_application: str   # How to use it
    reflection_prompt: str      # Thought-provoking question
    key_concepts: List[str]     # 3-5 core concepts
    emotional_tone: str         # excited, thoughtful, empowering
    
@dataclass
class SlideEssence:
    """Essence for a single slide"""
    headline: str               # 5-7 word compelling statement
    insight: str               # 15-20 word explanation
    impact: str                # Personal relevance
    visual_metaphor: str       # Suggested visual representation

class ContentEssenceExtractor:
    """Extracts the educational essence from content"""
    
    def __init__(self):
        """Initialize the essence extractor"""
        # Keywords that indicate important concepts
        self.importance_indicators = [
            'essential', 'critical', 'key', 'fundamental', 'core',
            'important', 'vital', 'crucial', 'primary', 'main',
            'significant', 'powerful', 'transform', 'enable', 'drive'
        ]
        
        # Action words that indicate practical application
        self.action_indicators = [
            'implement', 'apply', 'use', 'develop', 'create',
            'analyze', 'evaluate', 'design', 'build', 'optimize',
            'improve', 'enhance', 'leverage', 'utilize', 'execute'
        ]
        
        # Emotional tone mapping
        self.tone_keywords = {
            'excited': ['breakthrough', 'innovative', 'revolutionary', 'amazing', 'powerful'],
            'thoughtful': ['consider', 'reflect', 'analyze', 'understand', 'explore'],
            'empowering': ['achieve', 'master', 'excel', 'succeed', 'transform']
        }
        
        # Visual metaphor suggestions
        self.visual_metaphors = {
            'growth': 'plant growing into tree',
            'journey': 'pathway with milestones',
            'building': 'construction blocks',
            'connection': 'network of nodes',
            'transformation': 'butterfly metamorphosis',
            'discovery': 'treasure map',
            'collaboration': 'puzzle pieces fitting',
            'innovation': 'lightbulb with gears'
        }
    
    def extract_content_essence(self, content: Dict[str, Any]) -> ContentEssence:
        """
        Extract the educational essence from module content
        
        Args:
            content: Module content dictionary
            
        Returns:
            ContentEssence with distilled insights
        """
        logger.info(f"Extracting essence from: {content.get('module_name', 'Unknown')}")
        
        # Combine all content sections
        full_text = self._combine_content_sections(content)
        
        # Extract key concepts
        key_concepts = self._extract_key_concepts(full_text)
        
        # Generate hook statement
        hook_statement = self._generate_hook_statement(
            content.get('module_name', ''),
            key_concepts
        )
        
        # Extract core insight
        core_insight = self._extract_core_insight(full_text, key_concepts)
        
        # Find practical application
        practical_application = self._extract_practical_application(full_text)
        
        # Create reflection prompt
        reflection_prompt = self._create_reflection_prompt(
            core_insight,
            content.get('module_name', '')
        )
        
        # Determine emotional tone
        emotional_tone = self._determine_emotional_tone(full_text)
        
        return ContentEssence(
            hook_statement=hook_statement,
            core_insight=core_insight,
            practical_application=practical_application,
            reflection_prompt=reflection_prompt,
            key_concepts=key_concepts[:5],  # Limit to 5
            emotional_tone=emotional_tone
        )
    
    def extract_slide_essence(self, section_content: str, section_name: str) -> SlideEssence:
        """
        Extract essence for a single slide
        
        Args:
            section_content: Content for this section
            section_name: Name of the section
            
        Returns:
            SlideEssence with compelling summary
        """
        # Generate compelling headline
        headline = self._generate_compelling_headline(section_content, section_name)
        
        # Extract key insight
        insight = self._extract_section_insight(section_content)
        
        # Determine personal impact
        impact = self._determine_personal_impact(section_content)
        
        # Suggest visual metaphor
        visual_metaphor = self._suggest_visual_metaphor(section_content, section_name)
        
        return SlideEssence(
            headline=headline,
            insight=insight,
            impact=impact,
            visual_metaphor=visual_metaphor
        )
    
    def _combine_content_sections(self, content: Dict[str, Any]) -> str:
        """Combine all content sections into single text"""
        sections = ['introduction', 'core_content', 'practical_applications', 
                   'case_studies', 'assessments']
        
        combined = []
        for section in sections:
            if section in content and content[section]:
                combined.append(content[section])
        
        return ' '.join(combined)
    
    def _extract_key_concepts(self, text: str) -> List[str]:
        """Extract key concepts using NLP techniques"""
        try:
            # Tokenize and tag parts of speech
            tokens = nltk.word_tokenize(text.lower())
            tagged = nltk.pos_tag(tokens)
            
            # Extract noun phrases (likely to be concepts)
            concepts = []
            current_chunk = []
            
            for word, pos in tagged:
                if pos in ['NN', 'NNS', 'NNP', 'NNPS']:  # Nouns
                    current_chunk.append(word)
                elif current_chunk:
                    if len(current_chunk) <= 3:  # Keep reasonable length
                        concepts.append(' '.join(current_chunk))
                    current_chunk = []
            
            # Count frequency and importance
            concept_scores = {}
            for concept in concepts:
                score = concepts.count(concept)
                
                # Boost score if concept contains importance indicators
                for indicator in self.importance_indicators:
                    if indicator in concept:
                        score *= 2
                
                concept_scores[concept] = score
            
            # Return top concepts
            sorted_concepts = sorted(concept_scores.items(), 
                                   key=lambda x: x[1], reverse=True)
            
            return [concept for concept, _ in sorted_concepts[:10]]
            
        except Exception as e:
            logger.warning(f"NLP extraction failed: {e}, using fallback")
            # Fallback to simple extraction
            return self._fallback_concept_extraction(text)
    
    def _fallback_concept_extraction(self, text: str) -> List[str]:
        """Simple fallback for concept extraction"""
        # Look for capitalized phrases
        concepts = re.findall(r'[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*', text)
        
        # Filter and clean
        filtered = []
        for concept in concepts:
            if 2 <= len(concept.split()) <= 3:
                filtered.append(concept.lower())
        
        # Count and return most common
        concept_counts = Counter(filtered)
        return [concept for concept, _ in concept_counts.most_common(10)]
    
    def _generate_hook_statement(self, module_name: str, key_concepts: List[str]) -> str:
        """Generate an attention-grabbing hook statement"""
        templates = [
            f"What if mastering {key_concepts[0] if key_concepts else module_name} could transform your career?",
            f"The secret to {module_name}: It's simpler than you think.",
            f"Every expert in {key_concepts[0] if key_concepts else 'this field'} knows this one truth...",
            f"Here's what nobody tells you about {module_name}.",
            f"Master {key_concepts[0] if key_concepts else 'this'}, and everything else falls into place."
        ]
        
        # Select based on content
        return templates[hash(module_name) % len(templates)]
    
    def _extract_core_insight(self, text: str, key_concepts: List[str]) -> str:
        """Extract the core insight from content"""
        # Look for sentences with importance indicators
        sentences = nltk.sent_tokenize(text) if hasattr(nltk, 'sent_tokenize') else text.split('.')
        
        insight_candidates = []
        for sentence in sentences:
            sentence_lower = sentence.lower()
            score = 0
            
            # Score based on importance indicators
            for indicator in self.importance_indicators:
                if indicator in sentence_lower:
                    score += 2
            
            # Score based on key concepts
            for concept in key_concepts[:3]:
                if concept.lower() in sentence_lower:
                    score += 1
            
            if score > 0:
                insight_candidates.append((sentence.strip(), score))
        
        # Return highest scoring sentence
        if insight_candidates:
            insight_candidates.sort(key=lambda x: x[1], reverse=True)
            return insight_candidates[0][0]
        
        # Fallback
        return f"Understanding {key_concepts[0] if key_concepts else 'this concept'} is the foundation of professional excellence."
    
    def _extract_practical_application(self, text: str) -> str:
        """Extract practical application from content"""
        sentences = text.split('.') if '.' in text else [text]
        
        for sentence in sentences:
            sentence_lower = sentence.lower()
            
            # Look for action-oriented sentences
            for action in self.action_indicators:
                if action in sentence_lower:
                    return sentence.strip()
        
        # Fallback
        return "Apply these concepts immediately in your daily work for maximum impact."
    
    def _create_reflection_prompt(self, core_insight: str, module_name: str) -> str:
        """Create a thought-provoking reflection prompt"""
        prompts = [
            f"How could {module_name} change the way you approach your work?",
            f"What would mastery of this skill mean for your career?",
            f"Where in your current role could you apply this immediately?",
            f"What's one thing you'll do differently after learning this?",
            f"How might this knowledge set you apart from your peers?"
        ]
        
        return prompts[hash(core_insight) % len(prompts)]
    
    def _determine_emotional_tone(self, text: str) -> str:
        """Determine the emotional tone of content"""
        text_lower = text.lower()
        
        tone_scores = {}
        for tone, keywords in self.tone_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            tone_scores[tone] = score
        
        # Return tone with highest score
        if tone_scores:
            return max(tone_scores.items(), key=lambda x: x[1])[0]
        
        return 'thoughtful'  # Default
    
    def _generate_compelling_headline(self, content: str, section_name: str) -> str:
        """Generate a compelling 5-7 word headline"""
        # Extract the most impactful phrase
        sentences = content.split('.') if '.' in content else [content]
        
        # Look for short, punchy phrases
        for sentence in sentences:
            words = sentence.strip().split()
            if 5 <= len(words) <= 10:
                # Check if it contains important words
                if any(indicator in sentence.lower() for indicator in self.importance_indicators):
                    # Trim to 5-7 words
                    return ' '.join(words[:7])
        
        # Fallback headlines based on section
        fallbacks = {
            'introduction': "Your Journey Starts Here",
            'core_content': "Master These Essential Concepts",
            'practical_applications': "Transform Theory Into Practice",
            'case_studies': "Real Success Stories Revealed",
            'assessments': "Test Your New Skills"
        }
        
        return fallbacks.get(section_name, "Unlock Your Potential Today")
    
    def _extract_section_insight(self, content: str) -> str:
        """Extract a 15-20 word insight"""
        sentences = content.split('.') if '.' in content else [content]
        
        for sentence in sentences:
            words = sentence.strip().split()
            if 15 <= len(words) <= 25:
                # Clean and return
                return ' '.join(words[:20]) + "..."
        
        # Create from first sentence
        if sentences:
            words = sentences[0].strip().split()
            if len(words) > 20:
                return ' '.join(words[:20]) + "..."
            else:
                return sentences[0].strip()
        
        return "Discover powerful insights that will enhance your professional capabilities."
    
    def _determine_personal_impact(self, content: str) -> str:
        """Determine how this impacts the learner personally"""
        content_lower = content.lower()
        
        if any(word in content_lower for word in ['career', 'promotion', 'advance']):
            return "Accelerate your career progression"
        elif any(word in content_lower for word in ['skill', 'capability', 'competence']):
            return "Build in-demand expertise"
        elif any(word in content_lower for word in ['efficiency', 'productivity', 'performance']):
            return "Boost your daily productivity"
        elif any(word in content_lower for word in ['team', 'leadership', 'manage']):
            return "Become a more effective leader"
        else:
            return "Gain competitive advantage"
    
    def _suggest_visual_metaphor(self, content: str, section_name: str) -> str:
        """Suggest appropriate visual metaphor"""
        content_lower = content.lower()
        
        # Check for keywords that suggest specific metaphors
        for concept, metaphor in self.visual_metaphors.items():
            if concept in content_lower:
                return metaphor
        
        # Section-based defaults
        section_metaphors = {
            'introduction': 'journey pathway with milestones',
            'core_content': 'interconnected knowledge network',
            'practical_applications': 'tools in action',
            'case_studies': 'success summit mountain',
            'assessments': 'progress dashboard'
        }
        
        return section_metaphors.get(section_name, 'ascending stairway to success')