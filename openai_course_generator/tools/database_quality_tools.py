#!/usr/bin/env python3
"""
Database-Integrated Quality Assessment Tools

Enhanced quality assessment tools that integrate with Supabase database,
replacing JSON content passing with efficient database operations.

Features:
- Content ID-based quality assessment
- Database storage of assessment results
- Dynamic scoring based on module specifications
- Integration with enhancement workflow
"""

import re
import json
import logging
from typing import Dict, Any, List
from agents import function_tool

# Database integration
from database.content_manager import ContentManager
from tools.database_content_tools import get_content_manager

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@function_tool
def quality_assessor_db(
    content_id: str,
    criteria: str = "accuracy,clarity,completeness,engagement,personalization",
    module_context: str = "{}"
) -> str:
    """
    Comprehensive content quality assessment using database content.
    
    Args:
        content_id: Module content identifier in database
        criteria: Quality criteria to assess (comma-separated)
        module_context: JSON string with module specifications
        
    Returns:
        JSON string with assessment results and database storage
    """
    try:
        logger.info(f"📊 Assessing quality for content {content_id[:8]}")
        
        cm = get_content_manager()
        
        # Get content from database
        content_data = cm.get_module_content(content_id)
        if not content_data:
            return json.dumps({
                "success": False,
                "error": "Content not found in database",
                "content_id": content_id
            })
        
        # Extract all content sections
        sections = {
            'introduction': content_data.get('introduction', ''),
            'core_content': content_data.get('core_content', ''),
            'practical_applications': content_data.get('practical_applications', ''),
            'case_studies': content_data.get('case_studies', ''),
            'assessments': content_data.get('assessments', '')
        }
        
        # Combine all content for assessment
        full_content = '\n\n'.join([content for content in sections.values() if content])
        
        if not full_content or len(full_content.strip()) < 100:
            return json.dumps({
                "success": False,
                "error": "Content too short for quality assessment",
                "content_id": content_id,
                "overall_score": 0.0
            })
        
        # Parse module context for priority-based scoring
        try:
            context = json.loads(module_context) if isinstance(module_context, str) else module_context
            priority_level = context.get("priority_level", content_data.get('priority_level', 'high'))
            word_count_target = context.get("word_count_target", 5000)
        except:
            priority_level = content_data.get('priority_level', 'high')
            word_count_target = 5000
        
        # Real content analysis
        word_count = len(full_content.split())
        sentence_count = len([s for s in full_content.split('.') if s.strip()])
        paragraph_count = len([p for p in full_content.split('\n\n') if p.strip()])
        
        # Calculate quality dimensions
        quality_scores = {}
        
        # 1. Accuracy Score (content coherence and structure)
        accuracy_score = _calculate_accuracy_score(full_content, word_count)
        quality_scores["accuracy"] = accuracy_score
        
        # 2. Clarity Score (readability and sentence structure)
        clarity_score = _calculate_clarity_score(full_content, sentence_count, word_count)
        quality_scores["clarity"] = clarity_score
        
        # 3. Completeness Score (content depth and coverage)
        completeness_score = _calculate_completeness_score(full_content, word_count, paragraph_count, word_count_target)
        quality_scores["completeness"] = completeness_score
        
        # 4. Engagement Score (examples, questions, interactive elements)
        engagement_score = _calculate_engagement_score(full_content)
        quality_scores["engagement"] = engagement_score
        
        # 5. Personalization Score (role-specific content)
        personalization_score = _calculate_personalization_score(full_content, content_data.get('employee_name', ''))
        quality_scores["personalization"] = personalization_score
        
        # Calculate overall weighted score
        weights = {"accuracy": 0.25, "clarity": 0.20, "completeness": 0.25, "engagement": 0.15, "personalization": 0.15}
        overall_score = sum(quality_scores[dim] * weights[dim] for dim in quality_scores)
        
        # Dynamic minimum score based on priority
        priority_thresholds = {
            "critical": 8.0,
            "high": 7.5,
            "medium": 7.0,
            "low": 6.5
        }
        minimum_score = priority_thresholds.get(priority_level, 7.5)
        
        # Determine pass/fail
        passed = overall_score >= minimum_score
        requires_revision = not passed or completeness_score < 7.0
        
        # Identify sections needing work
        sections_needing_work = []
        section_scores = {}
        
        for section_name, section_content in sections.items():
            if section_content:
                section_score = _assess_section_quality(section_content, section_name)
                section_scores[section_name] = section_score
                if section_score < minimum_score:
                    sections_needing_work.append(section_name)
        
        # Generate feedback
        critical_issues = []
        improvement_suggestions = []
        
        if word_count < word_count_target * 0.8:
            critical_issues.append(f"Content word count ({word_count}) is significantly below target ({word_count_target})")
            improvement_suggestions.append(f"Add approximately {word_count_target - word_count} words of substantive content")
        
        if accuracy_score < 7.0:
            critical_issues.append("Content structure and organization needs improvement")
            improvement_suggestions.append("Improve logical flow and section organization")
        
        if engagement_score < 7.0:
            critical_issues.append("Content lacks engaging elements and practical examples")
            improvement_suggestions.append("Add more real-world examples, case studies, and interactive elements")
        
        if personalization_score < 7.0:
            critical_issues.append("Content not sufficiently personalized for learner")
            improvement_suggestions.append("Add more role-specific examples and scenarios")
        
        # Generate quality feedback
        quality_feedback = f"""
Quality Assessment Results for {content_data.get('module_name', 'Module')}:

Overall Score: {overall_score:.1f}/10.0 (Target: {minimum_score:.1f})
Word Count: {word_count}/{word_count_target} words

Section Scores:
{chr(10).join([f"- {name.title()}: {score:.1f}/10.0" for name, score in section_scores.items()])}

Quality Dimensions:
- Accuracy: {accuracy_score:.1f}/10.0
- Clarity: {clarity_score:.1f}/10.0  
- Completeness: {completeness_score:.1f}/10.0
- Engagement: {engagement_score:.1f}/10.0
- Personalization: {personalization_score:.1f}/10.0

Status: {"PASSED" if passed else "REQUIRES REVISION"}
Priority Level: {priority_level.upper()}
"""
        
        # Store assessment in database
        try:
            assessment_id = cm.store_quality_assessment(
                content_id=content_id,
                overall_score=overall_score,
                section_scores=section_scores,
                quality_feedback=quality_feedback,
                assessment_criteria=criteria,
                module_context={"priority_level": priority_level, "word_count_target": word_count_target},
                passed=passed,
                requires_revision=requires_revision,
                sections_needing_work=sections_needing_work,
                critical_issues=critical_issues,
                improvement_suggestions=improvement_suggestions
            )
            
            # Update module status
            new_status = "approved" if passed else "quality_check"
            cm.update_module_status(content_id, new_status)
            
            result = {
                "assessment_id": assessment_id,
                "content_id": content_id,
                "overall_score": overall_score,
                "section_scores": section_scores,
                "quality_feedback": quality_feedback,
                "passed": passed,
                "requires_revision": requires_revision,
                "sections_needing_work": sections_needing_work,
                "critical_issues": critical_issues,
                "improvement_suggestions": improvement_suggestions,
                "word_count": word_count,
                "word_count_target": word_count_target,
                "priority_level": priority_level,
                "minimum_score": minimum_score,
                "success": True,
                "stored_in_database": True
            }
            
            logger.info(f"✅ Quality assessment completed: {overall_score:.1f}/10.0 ({'PASSED' if passed else 'FAILED'})")
            return json.dumps(result)
            
        except Exception as db_error:
            logger.error(f"❌ Failed to store assessment in database: {db_error}")
            # Return assessment results even if storage failed
            result = {
                "content_id": content_id,
                "overall_score": overall_score,
                "section_scores": section_scores,
                "quality_feedback": quality_feedback,
                "passed": passed,
                "requires_revision": requires_revision,
                "sections_needing_work": sections_needing_work,
                "critical_issues": critical_issues,
                "improvement_suggestions": improvement_suggestions,
                "success": True,
                "stored_in_database": False,
                "storage_error": str(db_error)
            }
            return json.dumps(result)
        
    except Exception as e:
        logger.error(f"❌ Quality assessment failed: {e}")
        return json.dumps({
            "success": False,
            "error": str(e),
            "content_id": content_id
        })

@function_tool
def enhanced_quality_checker_db(content_id: str, enhancement_focus: str = "comprehensive") -> str:
    """
    Enhanced quality checker that provides specific enhancement recommendations.
    
    Args:
        content_id: Module content identifier
        enhancement_focus: Focus area (comprehensive, targeted, research_driven)
        
    Returns:
        JSON string with detailed enhancement recommendations
    """
    try:
        logger.info(f"🔍 Enhanced quality check for content {content_id[:8]}")
        
        cm = get_content_manager()
        
        # Get content and latest assessment
        content_data = cm.get_module_content(content_id)
        assessment = cm.get_latest_quality_assessment(content_id)
        
        if not content_data or not assessment:
            return json.dumps({
                "success": False,
                "error": "Content or assessment not found",
                "content_id": content_id
            })
        
        # Analyze each section individually
        sections = cm.get_content_sections(content_id)
        section_analysis = {}
        
        for section_name, section_content in sections.items():
            if section_content:
                analysis = _analyze_section_for_enhancement(section_content, section_name, assessment)
                section_analysis[section_name] = analysis
        
        # Generate enhancement strategy
        enhancement_strategy = _generate_enhancement_strategy(
            section_analysis, 
            assessment, 
            content_data,
            enhancement_focus
        )
        
        result = {
            "content_id": content_id,
            "enhancement_focus": enhancement_focus,
            "overall_assessment": {
                "score": assessment['overall_score'],
                "passed": assessment['passed'],
                "requires_revision": assessment['requires_revision']
            },
            "section_analysis": section_analysis,
            "enhancement_strategy": enhancement_strategy,
            "recommended_actions": enhancement_strategy.get('recommended_actions', []),
            "priority_sections": enhancement_strategy.get('priority_sections', []),
            "research_needed": enhancement_strategy.get('research_needed', False),
            "success": True
        }
        
        logger.info(f"✅ Enhanced quality check completed")
        return json.dumps(result)
        
    except Exception as e:
        logger.error(f"❌ Enhanced quality check failed: {e}")
        return json.dumps({
            "success": False,
            "error": str(e),
            "content_id": content_id
        })

# =====================================================
# HELPER FUNCTIONS (same as original quality_tools.py)
# =====================================================

def _calculate_accuracy_score(content: str, word_count: int) -> float:
    """Calculate accuracy score based on content structure and coherence."""
    score = 5.0  # Base score
    
    # Check for proper headings and structure
    headings = re.findall(r'^#{1,6}\s+.+$', content, re.MULTILINE)
    if len(headings) >= 3:
        score += 1.5
    elif len(headings) >= 1:
        score += 0.5
    
    # Check for bullet points and lists
    bullets = re.findall(r'^\s*[-*+]\s+.+$', content, re.MULTILINE)
    if len(bullets) >= 5:
        score += 1.0
    elif len(bullets) >= 2:
        score += 0.5
    
    # Check for proper paragraph structure
    paragraphs = [p for p in content.split('\n\n') if len(p.strip()) > 50]
    if len(paragraphs) >= 8:
        score += 1.0
    elif len(paragraphs) >= 4:
        score += 0.5
    
    # Check for transitional phrases
    transitions = ['however', 'therefore', 'furthermore', 'additionally', 'consequently', 'meanwhile']
    transition_count = sum(content.lower().count(phrase) for phrase in transitions)
    if transition_count >= 5:
        score += 1.0
    elif transition_count >= 2:
        score += 0.5
    
    return min(score, 10.0)

def _calculate_clarity_score(content: str, sentence_count: int, word_count: int) -> float:
    """Calculate clarity score based on readability metrics."""
    score = 5.0  # Base score
    
    # Average sentence length (optimal: 15-20 words)
    avg_sentence_length = word_count / max(sentence_count, 1)
    if 15 <= avg_sentence_length <= 20:
        score += 2.0
    elif 12 <= avg_sentence_length <= 25:
        score += 1.0
    elif avg_sentence_length > 30:
        score -= 1.0
    
    # Check for clear explanations
    explanation_patterns = [r'this means', r'in other words', r'for example', r'specifically', r'that is']
    explanation_count = sum(len(re.findall(pattern, content, re.IGNORECASE)) for pattern in explanation_patterns)
    if explanation_count >= 5:
        score += 1.5
    elif explanation_count >= 2:
        score += 0.5
    
    # Check for jargon explanations
    if '(' in content and ')' in content:
        parenthetical_count = content.count('(')
        if parenthetical_count >= 3:
            score += 1.0
    
    # Avoid excessive repetition
    words = content.lower().split()
    word_freq = {}
    for word in words:
        if len(word) > 4:  # Only check longer words
            word_freq[word] = word_freq.get(word, 0) + 1
    
    repetitive_words = [word for word, freq in word_freq.items() if freq > word_count * 0.02]
    if len(repetitive_words) > 3:
        score -= 0.5
    
    return min(score, 10.0)

def _calculate_completeness_score(content: str, word_count: int, paragraph_count: int, target_word_count: int = 5000) -> float:
    """Calculate completeness score based on content depth and coverage."""
    score = 3.0  # Base score
    
    # Word count adequacy
    word_ratio = word_count / target_word_count
    if word_ratio >= 0.9:
        score += 3.0
    elif word_ratio >= 0.7:
        score += 2.0
    elif word_ratio >= 0.5:
        score += 1.0
    else:
        score += 0.0  # Significantly under target
    
    # Content depth indicators
    depth_indicators = ['methodology', 'approach', 'strategy', 'process', 'technique', 'analysis', 'implementation']
    depth_count = sum(content.lower().count(term) for term in depth_indicators)
    if depth_count >= 10:
        score += 2.0
    elif depth_count >= 5:
        score += 1.0
    
    # Examples and case studies
    example_patterns = [r'for example', r'case study', r'real[- ]world', r'practical example', r'scenario']
    example_count = sum(len(re.findall(pattern, content, re.IGNORECASE)) for pattern in example_patterns)
    if example_count >= 5:
        score += 1.5
    elif example_count >= 2:
        score += 0.5
    
    # Coverage breadth (paragraph diversity)
    if paragraph_count >= 10:
        score += 0.5
    
    return min(score, 10.0)

def _calculate_engagement_score(content: str) -> float:
    """Calculate engagement score based on interactive and engaging elements."""
    score = 4.0  # Base score
    
    # Questions and interactive elements
    question_count = content.count('?')
    if question_count >= 8:
        score += 2.0
    elif question_count >= 4:
        score += 1.0
    
    # Direct address to reader
    direct_address = ['you will', 'you can', 'you should', 'your', 'consider', 'imagine', 'think about']
    address_count = sum(content.lower().count(phrase) for phrase in direct_address)
    if address_count >= 10:
        score += 1.5
    elif address_count >= 5:
        score += 0.5
    
    # Action-oriented language
    action_verbs = ['create', 'develop', 'implement', 'analyze', 'evaluate', 'design', 'build', 'establish']
    action_count = sum(content.lower().count(verb) for verb in action_verbs)
    if action_count >= 8:
        score += 1.0
    elif action_count >= 4:
        score += 0.5
    
    # Visual elements references
    visual_refs = ['chart', 'graph', 'diagram', 'table', 'figure', 'illustration', 'visual']
    visual_count = sum(content.lower().count(ref) for ref in visual_refs)
    if visual_count >= 3:
        score += 1.0
    elif visual_count >= 1:
        score += 0.5
    
    # Practical exercises or activities
    exercise_patterns = [r'exercise', r'activity', r'practice', r'try this', r'hands[- ]on']
    exercise_count = sum(len(re.findall(pattern, content, re.IGNORECASE)) for pattern in exercise_patterns)
    if exercise_count >= 3:
        score += 1.0
    elif exercise_count >= 1:
        score += 0.5
    
    return min(score, 10.0)

def _calculate_personalization_score(content: str, employee_name: str = '') -> float:
    """Calculate personalization score based on role-specific content."""
    score = 5.0  # Base score
    
    # Check for employee name usage
    if employee_name and employee_name.lower() in content.lower():
        score += 1.0
    
    # Role-specific terminology
    business_terms = ['roi', 'kpi', 'budget', 'forecast', 'analysis', 'reporting', 'performance', 'metrics', 'dashboard']
    business_count = sum(content.lower().count(term) for term in business_terms)
    if business_count >= 10:
        score += 2.0
    elif business_count >= 5:
        score += 1.0
    
    # Tool-specific content
    tools = ['excel', 'powerbi', 'sap', 'sql', 'python', 'tableau', 'power bi']
    tool_count = sum(content.lower().count(tool) for tool in tools)
    if tool_count >= 5:
        score += 1.5
    elif tool_count >= 2:
        score += 0.5
    
    # Career progression relevance
    career_terms = ['skill', 'competency', 'advancement', 'growth', 'development', 'expertise', 'professional']
    career_count = sum(content.lower().count(term) for term in career_terms)
    if career_count >= 5:
        score += 1.0
    elif career_count >= 2:
        score += 0.5
    
    # Industry-specific examples
    finance_terms = ['financial', 'revenue', 'profit', 'cost', 'variance', 'budget', 'forecasting']
    finance_count = sum(content.lower().count(term) for term in finance_terms)
    if finance_count >= 8:
        score += 0.5
    
    return min(score, 10.0)

def _assess_section_quality(section_content: str, section_name: str) -> float:
    """Assess quality of individual section."""
    if not section_content:
        return 0.0
    
    word_count = len(section_content.split())
    
    # Base score based on word count expectations
    expected_words = {
        'introduction': 800,
        'core_content': 1800,
        'practical_applications': 1200,
        'case_studies': 800,
        'assessments': 600
    }
    
    expected = expected_words.get(section_name, 800)
    word_ratio = word_count / expected
    
    if word_ratio >= 0.8:
        base_score = 7.0
    elif word_ratio >= 0.6:
        base_score = 6.0
    elif word_ratio >= 0.4:
        base_score = 5.0
    else:
        base_score = 3.0
    
    # Add quality bonuses
    if section_name == 'core_content':
        # Check for depth and examples
        if 'example' in section_content.lower():
            base_score += 0.5
        if section_content.count('?') >= 2:
            base_score += 0.5
    
    elif section_name == 'practical_applications':
        # Check for hands-on content
        practical_terms = ['step', 'process', 'method', 'technique', 'practice']
        if sum(section_content.lower().count(term) for term in practical_terms) >= 3:
            base_score += 1.0
    
    return min(base_score, 10.0)

def _analyze_section_for_enhancement(section_content: str, section_name: str, assessment: Dict) -> Dict:
    """Analyze individual section for enhancement opportunities."""
    word_count = len(section_content.split())
    section_score = _assess_section_quality(section_content, section_name)
    
    analysis = {
        "section_name": section_name,
        "current_word_count": word_count,
        "quality_score": section_score,
        "issues": [],
        "recommendations": [],
        "enhancement_priority": "low"
    }
    
    # Identify issues
    if section_score < 7.0:
        analysis["enhancement_priority"] = "high"
        if word_count < 500:
            analysis["issues"].append("Content too brief")
            analysis["recommendations"].append("Expand with more detailed explanations")
        
        if 'example' not in section_content.lower():
            analysis["issues"].append("Lacks practical examples")
            analysis["recommendations"].append("Add real-world examples and scenarios")
        
        if section_content.count('?') < 1:
            analysis["issues"].append("Not engaging enough")
            analysis["recommendations"].append("Add interactive questions and exercises")
    
    elif section_score < 8.0:
        analysis["enhancement_priority"] = "medium"
        analysis["recommendations"].append("Could benefit from additional examples or current industry insights")
    
    return analysis

def _generate_enhancement_strategy(section_analysis: Dict, assessment: Dict, content_data: Dict, focus: str) -> Dict:
    """Generate comprehensive enhancement strategy."""
    
    # Determine sections needing work
    high_priority_sections = [name for name, analysis in section_analysis.items() 
                            if analysis["enhancement_priority"] == "high"]
    medium_priority_sections = [name for name, analysis in section_analysis.items() 
                              if analysis["enhancement_priority"] == "medium"]
    
    strategy = {
        "enhancement_focus": focus,
        "sections_to_enhance": high_priority_sections + medium_priority_sections[:2],  # Limit scope
        "sections_to_preserve": [name for name in section_analysis.keys() 
                               if name not in (high_priority_sections + medium_priority_sections)],
        "research_needed": len(high_priority_sections) > 0,
        "recommended_actions": [],
        "priority_sections": high_priority_sections,
        "estimated_word_addition": 0
    }
    
    # Generate specific actions
    for section_name in strategy["sections_to_enhance"]:
        analysis = section_analysis[section_name]
        strategy["recommended_actions"].extend([
            f"{section_name}: {rec}" for rec in analysis["recommendations"]
        ])
        
        # Estimate word addition needed
        current_words = analysis["current_word_count"]
        if current_words < 800:
            strategy["estimated_word_addition"] += (800 - current_words)
    
    # Add research recommendations
    if strategy["research_needed"]:
        strategy["recommended_actions"].append("Conduct web research for current examples and industry trends")
        strategy["recommended_actions"].append("Find recent statistics and case studies")
    
    return strategy

if __name__ == "__main__":
    """Test database quality tools."""
    
    print("🧪 Testing Database Quality Tools")
    print("=" * 50)
    
    try:
        # Test database connection
        from tools.database_content_tools import get_content_manager
        cm = get_content_manager()
        health = cm.health_check()
        
        print(f"Database Health: {health['status']}")
        
        print("✅ Database quality tools ready!")
        
    except Exception as e:
        print(f"❌ Database quality tools test failed: {e}")
        print("Make sure Supabase credentials are configured")