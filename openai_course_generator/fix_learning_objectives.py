#!/usr/bin/env python3
"""
Fix for dedicated learning objective generation
This addresses the issue where learning objectives are fragments like "Understand This module"
"""

import re
from typing import List, Dict, Any

class LearningObjectiveGenerator:
    """Dedicated generator for proper learning objectives"""
    
    def __init__(self):
        # Common fragments to filter out
        self.fragment_blacklist = [
            'this module', 'this section', 'this course', 'this lesson',
            'this topic', 'this chapter', 'this unit', 'this content',
            'the following', 'the next', 'the previous', 'the above'
        ]
        
        # Action verbs for well-formed objectives (Bloom's Taxonomy)
        self.action_verbs = {
            'remember': ['identify', 'list', 'name', 'recognize', 'recall', 'define'],
            'understand': ['explain', 'describe', 'summarize', 'interpret', 'classify', 'compare'],
            'apply': ['use', 'demonstrate', 'implement', 'solve', 'execute', 'apply'],
            'analyze': ['analyze', 'differentiate', 'organize', 'examine', 'investigate', 'distinguish'],
            'evaluate': ['evaluate', 'critique', 'judge', 'justify', 'assess', 'argue'],
            'create': ['create', 'design', 'develop', 'construct', 'generate', 'produce']
        }
    
    def generate_objectives_from_content(self, content: str, module_name: str, max_objectives: int = 3) -> List[str]:
        """Generate proper learning objectives from content"""
        objectives = []
        
        # Extract key concepts from content
        concepts = self._extract_key_concepts(content)
        
        # Generate objectives based on concepts
        for i, concept in enumerate(concepts[:max_objectives]):
            level = self._determine_complexity_level(i, max_objectives)
            verb = self._select_action_verb(level)
            objective = self._format_objective(verb, concept, module_name)
            objectives.append(objective)
        
        # Ensure we have enough objectives
        while len(objectives) < max_objectives:
            objectives.append(self._generate_fallback_objective(len(objectives), module_name))
        
        return objectives
    
    def _extract_key_concepts(self, content: str) -> List[str]:
        """Extract key concepts ensuring they're complete thoughts"""
        concepts = []
        
        # Split into sentences
        sentences = re.split(r'[.!?]+', content)
        
        for sentence in sentences:
            sentence = sentence.strip()
            
            # Skip empty or very short sentences
            if len(sentence.split()) < 5:
                continue
            
            # Look for concept indicators
            concept_patterns = [
                r'(?:involves?|means?|includes?|requires?)\s+(.+)',
                r'(?:focus(?:es)? on|centers? on|deals? with)\s+(.+)',
                r'(?:ability to|skills? to|knowledge of)\s+(.+)',
                r'(?:understanding of|mastery of|expertise in)\s+(.+)'
            ]
            
            for pattern in concept_patterns:
                match = re.search(pattern, sentence, re.IGNORECASE)
                if match:
                    concept = match.group(1).strip()
                    # Clean up the concept
                    concept = self._clean_concept(concept)
                    if concept and len(concept.split()) >= 3:
                        concepts.append(concept)
                        break
        
        # If not enough concepts found, extract from noun phrases
        if len(concepts) < 3:
            concepts.extend(self._extract_noun_phrases(content))
        
        return concepts
    
    def _clean_concept(self, concept: str) -> str:
        """Clean and validate a concept"""
        # Remove trailing punctuation
        concept = concept.rstrip('.,;:')
        
        # Check if it's a fragment
        lower_concept = concept.lower()
        for fragment in self.fragment_blacklist:
            if lower_concept.startswith(fragment) or lower_concept == fragment:
                return ""
        
        # Ensure it's a complete thought
        if len(concept.split()) < 3:
            return ""
        
        return concept
    
    def _extract_noun_phrases(self, content: str) -> List[str]:
        """Extract meaningful noun phrases as concepts"""
        phrases = []
        
        # Look for capitalized multi-word phrases
        pattern = r'[A-Z][a-z]+(?:\s+[A-Z]?[a-z]+){1,4}'
        matches = re.findall(pattern, content)
        
        for match in matches:
            match = match.strip()
            # Filter out common fragments
            if match.lower() not in self.fragment_blacklist and len(match.split()) >= 2:
                phrases.append(match.lower())
        
        return list(set(phrases))[:5]  # Return unique phrases
    
    def _determine_complexity_level(self, index: int, total: int) -> str:
        """Determine Bloom's taxonomy level based on position"""
        if total <= 2:
            return ['understand', 'apply'][index]
        elif total == 3:
            return ['understand', 'apply', 'analyze'][index]
        else:
            levels = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create']
            return levels[min(index, len(levels) - 1)]
    
    def _select_action_verb(self, level: str) -> str:
        """Select appropriate action verb for the level"""
        import random
        verbs = self.action_verbs.get(level, self.action_verbs['understand'])
        return random.choice(verbs)
    
    def _format_objective(self, verb: str, concept: str, module_name: str) -> str:
        """Format a complete learning objective"""
        # Capitalize first letter of verb
        verb = verb.capitalize()
        
        # Ensure concept doesn't start with 'the' or 'a'
        concept = re.sub(r'^(the|a|an)\s+', '', concept, flags=re.IGNORECASE)
        
        # Create objective based on verb type
        if verb.lower() in ['identify', 'list', 'name', 'recognize']:
            return f"{verb} the key components of {concept} in {module_name.lower()}"
        elif verb.lower() in ['explain', 'describe', 'summarize']:
            return f"{verb} how {concept} applies to real-world scenarios"
        elif verb.lower() in ['use', 'demonstrate', 'implement', 'apply']:
            return f"{verb} {concept} to solve practical problems"
        elif verb.lower() in ['analyze', 'examine', 'investigate']:
            return f"{verb} the relationship between {concept} and business outcomes"
        elif verb.lower() in ['evaluate', 'assess', 'critique']:
            return f"{verb} the effectiveness of {concept} in different contexts"
        else:  # create
            return f"{verb} innovative solutions using {concept}"
    
    def _generate_fallback_objective(self, index: int, module_name: str) -> str:
        """Generate a generic but complete objective"""
        fallback_objectives = [
            f"Understand the fundamental principles covered in {module_name.lower()}",
            f"Apply the concepts from {module_name.lower()} to practical scenarios",
            f"Analyze real-world examples related to {module_name.lower()}",
            f"Evaluate different approaches discussed in {module_name.lower()}",
            f"Create actionable strategies based on {module_name.lower()} content"
        ]
        return fallback_objectives[min(index, len(fallback_objectives) - 1)]

    def enhance_existing_objectives(self, objectives: List[str], module_name: str) -> List[str]:
        """Enhance existing objectives that may be fragments"""
        enhanced = []
        
        for obj in objectives:
            # Check if it's a fragment
            if self._is_fragment(obj):
                # Try to extract the concept and rebuild
                concept = self._extract_concept_from_fragment(obj)
                if concept:
                    verb = self._extract_verb_from_fragment(obj)
                    enhanced_obj = self._format_objective(verb, concept, module_name)
                    enhanced.append(enhanced_obj)
                else:
                    # Generate a new objective
                    enhanced.append(self._generate_fallback_objective(len(enhanced), module_name))
            else:
                enhanced.append(obj)
        
        return enhanced
    
    def _is_fragment(self, objective: str) -> bool:
        """Check if an objective is a fragment"""
        # Check for common fragment patterns
        fragment_patterns = [
            r'^Understand This\s',
            r'^Learn to the\s',
            r'^Understand\s+[A-Z]\w+\s+[A-Z]\w+$',  # Just two capitalized words
            r'\*\*$',  # Ends with markdown formatting
            r'^\w+\s+\w+$',  # Only two words
        ]
        
        for pattern in fragment_patterns:
            if re.match(pattern, objective):
                return True
        
        # Check word count
        if len(objective.split()) < 5:
            return True
        
        return False
    
    def _extract_concept_from_fragment(self, fragment: str) -> str:
        """Try to extract a usable concept from a fragment"""
        # Remove action verb
        concept = re.sub(r'^(Understand|Learn to|Apply|Master)\s+', '', fragment, flags=re.IGNORECASE)
        
        # Remove fragments
        for blacklisted in self.fragment_blacklist:
            concept = concept.replace(blacklisted, '').strip()
        
        # Remove markdown
        concept = re.sub(r'\*\*', '', concept)
        
        return concept.strip() if len(concept.split()) >= 2 else ""
    
    def _extract_verb_from_fragment(self, fragment: str) -> str:
        """Extract the action verb from a fragment"""
        match = re.match(r'^(\w+)\s', fragment)
        if match:
            verb = match.group(1).lower()
            # Map to a proper verb if needed
            verb_mapping = {
                'understand': 'explain',
                'learn': 'demonstrate',
                'master': 'apply',
                'know': 'describe'
            }
            return verb_mapping.get(verb, verb)
        return 'understand'


# Example usage and testing
if __name__ == "__main__":
    generator = LearningObjectiveGenerator()
    
    # Test with problematic content
    test_content = """
    This module covers data visualization principles.
    You'll learn about creating dashboards that tell compelling stories.
    Master the ability to transform complex data into clear insights.
    Understanding KPIs: crucial for business success.
    """
    
    # Test with fragments
    fragment_objectives = [
        "Understand This module",
        "Learn to the significance of what they're seeing",
        "Understand Dashboard That Saved Millions**"
    ]
    
    print("Generated Objectives:")
    objectives = generator.generate_objectives_from_content(test_content, "Data Visualization Excellence")
    for i, obj in enumerate(objectives, 1):
        print(f"{i}. {obj}")
    
    print("\nEnhanced Fragment Objectives:")
    enhanced = generator.enhance_existing_objectives(fragment_objectives, "Data Visualization Excellence")
    for i, obj in enumerate(enhanced, 1):
        print(f"{i}. {obj}")