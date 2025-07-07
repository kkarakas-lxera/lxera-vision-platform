#!/usr/bin/env python3
"""
Fix for enhancing GPT-4 prompt for better slide 6 (Key Takeaways) content
This addresses the issue where slide 6 has minimal speaker notes
"""

import re
from typing import Dict, List, Any

class Slide6EnhancementFix:
    """Enhanced generation for Key Takeaways slide"""
    
    def create_enhanced_summary_slide(
        self,
        module_name: str,
        all_slides: List[Dict[str, Any]],
        takeaways: List[str],
        employee_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create an enhanced summary slide with rich content"""
        
        # Extract key points from all previous slides
        key_concepts = self._extract_key_concepts_from_slides(all_slides)
        
        # Generate comprehensive speaker notes
        speaker_notes = self._generate_comprehensive_speaker_notes(
            module_name, key_concepts, takeaways, employee_context
        )
        
        # Enhance takeaways if they're incomplete
        enhanced_takeaways = self._enhance_takeaways(takeaways, key_concepts, module_name)
        
        # Create the enhanced slide
        summary_slide = {
            'slide_number': len(all_slides) + 1,
            'title': 'Key Takeaways',
            'bullet_points': enhanced_takeaways[:4],  # Max 4 takeaways
            'speaker_notes': speaker_notes,
            'duration_estimate': self._calculate_duration(speaker_notes),
            'visual_cues': ['Summary infographic', 'Success celebration', 'Action items checklist'],
            'emphasis_points': ['Remember', 'Apply these concepts', 'Take action', 'Continue learning']
        }
        
        return summary_slide
    
    def _extract_key_concepts_from_slides(self, slides: List[Dict[str, Any]]) -> List[str]:
        """Extract the most important concepts from all slides"""
        concepts = []
        
        for slide in slides:
            # Skip title slide
            if slide.get('slide_number', 0) == 1:
                continue
            
            # Extract from bullet points
            for bullet in slide.get('bullet_points', []):
                if isinstance(bullet, str) and len(bullet) > 20:
                    # Extract the core message safely
                    bullet_lower = bullet.lower()
                    concept = None
                    
                    if 'understand' in bullet_lower:
                        parts = bullet.split('understand', 1)
                        if len(parts) > 1:
                            concept = parts[1].strip()
                    elif 'learn' in bullet_lower:
                        parts = bullet.split('learn', 1)
                        if len(parts) > 1:
                            concept = parts[1].strip()
                    elif 'master' in bullet_lower:
                        parts = bullet.split('master', 1)
                        if len(parts) > 1:
                            concept = parts[1].strip()
                    else:
                        concept = bullet
                    
                    if concept:
                        concepts.append(concept[:100])  # Limit length
        
        return concepts[:5]  # Top 5 concepts
    
    def _generate_comprehensive_speaker_notes(
        self,
        module_name: str,
        key_concepts: List[str],
        takeaways: List[str],
        employee_context: Dict[str, Any]
    ) -> str:
        """Generate rich speaker notes for the summary slide"""
        
        role = employee_context.get('role', 'professional')
        name = employee_context.get('name', 'learner')
        
        # Build comprehensive speaker notes
        notes_parts = []
        
        # Opening
        notes_parts.append(
            f"As we conclude {module_name}, let's recap the essential insights "
            f"that will transform how you approach your work as a {role}."
        )
        
        # Key concepts summary
        if key_concepts:
            notes_parts.append(
                f"We've explored {len(key_concepts)} critical concepts, including "
                f"{self._format_concept_list(key_concepts[:3])}."
            )
        
        # Practical application
        notes_parts.append(
            f"These principles aren't just theoretical—they're practical tools "
            f"you can implement immediately in your daily responsibilities."
        )
        
        # Personal relevance
        notes_parts.append(
            f"Remember, {name}, mastering these concepts will enhance your "
            f"ability to make data-driven decisions and communicate insights effectively."
        )
        
        # Call to action
        notes_parts.append(
            f"Your next step is to identify one specific area where you can "
            f"apply these techniques this week. Start small, measure the impact, "
            f"and gradually expand your implementation."
        )
        
        # Closing encouragement
        notes_parts.append(
            f"You now have the knowledge and tools to excel. "
            f"The journey to mastery begins with your first application of these concepts."
        )
        
        return " ".join(notes_parts)
    
    def _enhance_takeaways(
        self,
        original_takeaways: List[str],
        key_concepts: List[str],
        module_name: str
    ) -> List[str]:
        """Enhance takeaways to ensure they're complete and meaningful"""
        enhanced = []
        
        for takeaway in original_takeaways:
            # Check if takeaway is incomplete (like ending with "1")
            if self._is_incomplete_takeaway(takeaway):
                # Generate a complete version
                enhanced_takeaway = self._complete_takeaway(takeaway, key_concepts)
                enhanced.append(enhanced_takeaway)
            else:
                enhanced.append(takeaway)
        
        # Ensure we have enough quality takeaways
        while len(enhanced) < 3:
            enhanced.append(self._generate_takeaway(len(enhanced), module_name, key_concepts))
        
        return enhanced
    
    def _is_incomplete_takeaway(self, takeaway: str) -> bool:
        """Check if a takeaway is incomplete"""
        # Check for common incomplete patterns
        incomplete_patterns = [
            r':\s*\n\s*\d+$',  # Ends with just a number
            r':\s*$',  # Ends with just a colon
            r'\.\.\.$',  # Ends with ellipsis
            r'^[A-Z]\w+\s+\w+$',  # Just two words
        ]
        
        for pattern in incomplete_patterns:
            if re.search(pattern, takeaway):
                return True
        
        # Check if it's too short
        if len(takeaway.split()) < 5:
            return True
        
        return False
    
    def _complete_takeaway(self, incomplete: str, concepts: List[str]) -> str:
        """Complete an incomplete takeaway"""
        # If it mentions "three pillars" or similar, complete it
        if 'three' in incomplete.lower() and 'pillar' in incomplete.lower():
            return (
                "Master the three pillars of effective data visualization: "
                "1) Clarity - Remove noise to highlight insights, "
                "2) Context - Provide meaningful comparisons and benchmarks, "
                "3) Connection - Create emotional engagement through storytelling"
            )
        
        # For other incomplete takeaways, create a new one
        return self._generate_takeaway(0, "this module", concepts)
    
    def _generate_takeaway(self, index: int, module_name: str, concepts: List[str]) -> str:
        """Generate a complete takeaway"""
        templates = [
            f"Apply the {module_name.lower()} principles to transform raw data into actionable insights that drive strategic decisions",
            f"Leverage your new understanding of {concepts[0] if concepts else 'these concepts'} to enhance communication with stakeholders",
            f"Implement a systematic approach to {module_name.lower()} that ensures consistency and professional quality",
            f"Continue developing your expertise through regular practice and experimentation with different techniques",
            f"Share your knowledge with colleagues to foster a data-driven culture in your organization"
        ]
        
        return templates[min(index, len(templates) - 1)]
    
    def _format_concept_list(self, concepts: List[str]) -> str:
        """Format a list of concepts grammatically"""
        if not concepts:
            return "key principles"
        elif len(concepts) == 1:
            return concepts[0]
        elif len(concepts) == 2:
            return f"{concepts[0]} and {concepts[1]}"
        else:
            return f"{', '.join(concepts[:-1])}, and {concepts[-1]}"
    
    def _calculate_duration(self, speaker_notes: str) -> float:
        """Calculate speaking duration based on word count"""
        word_count = len(speaker_notes.split())
        # Assume 150 words per minute for summary (slightly slower for emphasis)
        return (word_count / 150) * 60  # Convert to seconds

    def generate_enhanced_gpt4_prompt_for_slide6(self, module_name: str, content_summary: str) -> str:
        """Generate an enhanced GPT-4 prompt specifically for slide 6"""
        prompt = f"""Create a comprehensive Key Takeaways slide for the module "{module_name}".

Based on the content covered: {content_summary}

Generate the following:

1. **3-4 Powerful Takeaways** (each 15-25 words):
   - Synthesize the most important insights
   - Make them actionable and memorable
   - Include specific benefits or outcomes
   - Avoid generic statements

2. **Rich Speaker Notes** (60-80 words):
   - Recap the journey through the module
   - Emphasize transformation and growth
   - Include a specific call to action
   - End with inspiration and encouragement
   - Make it personal and engaging

3. **Visual Cues**:
   - Suggest 3 visual elements that reinforce the takeaways
   - Consider infographics, icons, or metaphors

Format:
===TAKEAWAYS===
1. [Specific, actionable takeaway with clear benefit]
2. [Another powerful insight with practical application]
3. [Third key learning with measurable outcome]

===SPEAKER_NOTES===
[Engaging, comprehensive summary that ties everything together and motivates action]

===VISUAL_CUES===
- [Visual element 1]
- [Visual element 2]
- [Visual element 3]
"""
        return prompt


# Integration function to modify the existing code
def integrate_slide6_enhancement(educational_script_generator_instance):
    """Integrate the enhancement into the existing EducationalScriptGenerator"""
    
    # Save the original _create_summary_slide method
    original_create_summary_slide = educational_script_generator_instance._create_summary_slide
    
    # Create enhancer instance
    enhancer = Slide6EnhancementFix()
    
    # Define enhanced method
    def enhanced_create_summary_slide(takeaways: List[str]) -> Dict[str, Any]:
        # Get basic slide from original method
        basic_slide = original_create_summary_slide(takeaways)
        
        # Enhance it
        enhanced_slide = enhancer.create_enhanced_summary_slide(
            educational_script_generator_instance.module_name,
            educational_script_generator_instance.slides,  # Assuming slides are stored
            takeaways,
            educational_script_generator_instance.employee_context
        )
        
        # Merge enhancements with basic slide
        basic_slide.update(enhanced_slide)
        
        return basic_slide
    
    # Replace method
    educational_script_generator_instance._create_summary_slide = enhanced_create_summary_slide
    
    print("✓ Slide 6 enhancement integrated successfully")


if __name__ == "__main__":
    import re
    
    # Test the enhancement
    enhancer = Slide6EnhancementFix()
    
    # Test data
    test_slides = [
        {
            'slide_number': 2,
            'bullet_points': [
                "Master the ability to transform complex information into compelling visual stories.",
                "Understand the importance of data visualization in today's data-driven world."
            ]
        },
        {
            'slide_number': 3,
            'bullet_points': [
                "Learn that providing context in data visualization means offering reference points."
            ]
        }
    ]
    
    test_takeaways = [
        "The Foundation of Great Visualizations\n    \n    Every powerful data visualization rests on three essential pillars:\n    \n    1",
        "Apply knowledge to real-world scenarios",
        "Continue developing expertise in this area"
    ]
    
    employee_context = {
        'name': 'Sarah',
        'role': 'Data Analyst'
    }
    
    # Generate enhanced slide
    enhanced_slide = enhancer.create_enhanced_summary_slide(
        "Data Visualization Excellence",
        test_slides,
        test_takeaways,
        employee_context
    )
    
    print("Enhanced Slide 6:")
    print(f"Title: {enhanced_slide['title']}")
    print(f"\nBullet Points:")
    for i, bullet in enumerate(enhanced_slide['bullet_points'], 1):
        print(f"{i}. {bullet}")
    print(f"\nSpeaker Notes ({len(enhanced_slide['speaker_notes'].split())} words):")
    print(enhanced_slide['speaker_notes'])
    print(f"\nDuration: {enhanced_slide['duration_estimate']:.1f} seconds")