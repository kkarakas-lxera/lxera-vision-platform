"""Enhanced quality assessment tools for OpenAI Agents Course Generator."""

import re
import json
from typing import Dict, Any, List
from lxera_agents import function_tool


@function_tool
def quality_assessor(content: str, criteria: str = "accuracy,clarity,completeness,engagement,personalization", module_context: str = "{}") -> str:
    """Comprehensive content quality assessment with real analysis and dynamic scoring."""
    
    if not content or len(content.strip()) < 100:
        return json.dumps({
            "success": False,
            "error": "Content too short for quality assessment",
            "overall_score": 0.0
        })
    
    # Parse module context for priority-based scoring
    try:
        context = json.loads(module_context) if isinstance(module_context, str) else module_context
        priority_level = context.get("priority_level", "high")
        word_count_target = context.get("word_count_target", 7500)
    except:
        priority_level = "high"
        word_count_target = 7500
    
    # Real content analysis
    word_count = len(content.split())
    sentence_count = len([s for s in content.split('.') if s.strip()])
    paragraph_count = len([p for p in content.split('\n\n') if p.strip()])
    
    # DIAGNOSTIC: Log content size for debugging word count discrepancy
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"🔍 Quality Assessor received content: {len(content)} chars, {word_count} words")
    
    # Calculate quality dimensions
    quality_scores = {}
    
    # 1. Accuracy Score (content coherence and structure)
    accuracy_score = _calculate_accuracy_score(content, word_count)
    quality_scores["accuracy"] = accuracy_score
    
    # 2. Clarity Score (readability and sentence structure)
    clarity_score = _calculate_clarity_score(content, sentence_count, word_count)
    quality_scores["clarity"] = clarity_score
    
    # 3. Completeness Score (content depth and coverage)
    completeness_score = _calculate_completeness_score(content, word_count, paragraph_count)
    quality_scores["completeness"] = completeness_score
    
    # 4. Engagement Score (examples, questions, interactive elements)
    engagement_score = _calculate_engagement_score(content)
    quality_scores["engagement"] = engagement_score
    
    # 5. Personalization Score (employee-specific content)
    personalization_score = _calculate_personalization_score(content)
    quality_scores["personalization"] = personalization_score
    
    # Overall score calculation
    criteria_list = criteria.split(",") if isinstance(criteria, str) else ["accuracy", "clarity", "completeness", "engagement", "personalization"]
    relevant_scores = [quality_scores.get(c.strip(), 0) for c in criteria_list if c.strip() in quality_scores]
    overall_score = sum(relevant_scores) / len(relevant_scores) if relevant_scores else 0
    
    # Dynamic word count tolerance based on priority
    tolerance = 0.15 if priority_level == "high" else 0.20 if priority_level == "medium" else 0.10
    min_words = int(word_count_target * (1 - tolerance))
    max_words = int(word_count_target * (1 + tolerance))
    
    # Enhanced quality indicators with dynamic thresholds
    quality_indicators = {
        "meets_word_count_minimum": word_count >= min_words,
        "within_word_count_range": min_words <= word_count <= max_words,
        "above_quality_threshold": overall_score >= (8.0 if priority_level == "critical" else 7.5 if priority_level == "high" else 7.0),
        "ready_for_publication": overall_score >= 8.0,
        "has_sufficient_structure": paragraph_count >= 8,
        "has_personalization": personalization_score >= 6.0,
        "has_examples": "example" in content.lower() or "for instance" in content.lower(),
        "has_clear_sections": content.count("#") >= 3 or content.count("**") >= 6
    }
    
    # Enhancement suggestions with dynamic parameters
    suggestions = _generate_enhancement_suggestions(quality_scores, quality_indicators, word_count, word_count_target, priority_level)
    
    result_data = {
        "success": True,
        "overall_score": round(overall_score, 1),
        "individual_scores": {k: round(v, 1) for k, v in quality_scores.items()},
        "word_count": word_count,
        "content_metrics": {
            "sentence_count": sentence_count,
            "paragraph_count": paragraph_count,
            "avg_words_per_sentence": round(word_count / sentence_count, 1) if sentence_count > 0 else 0,
            "avg_sentences_per_paragraph": round(sentence_count / paragraph_count, 1) if paragraph_count > 0 else 0
        },
        "quality_indicators": quality_indicators,
        "enhancement_suggestions": suggestions,
        "quality_level": _determine_quality_level(overall_score),
        "module_context": {
            "priority_level": priority_level,
            "word_count_target": word_count_target,
            "min_required": min_words,
            "max_allowed": max_words,
            "quality_threshold": 8.0 if priority_level == "critical" else 7.5 if priority_level == "high" else 7.0
        }
    }
    
    return json.dumps(result_data)


def _calculate_accuracy_score(content: str, word_count: int) -> float:
    """Calculate accuracy score based on content structure and coherence."""
    score = 5.0  # Base score
    
    # Reward good structure
    if "##" in content or "**" in content:  # Has headings
        score += 1.0
    if content.count("\n\n") >= 5:  # Well-paragraphed
        score += 0.5
    if any(word in content.lower() for word in ["therefore", "however", "moreover", "furthermore"]):  # Logical flow
        score += 0.5
    
    # Reward comprehensive content
    if word_count >= 7000:
        score += 1.0
    elif word_count >= 5000:
        score += 0.5
    
    # Check for financial/professional terminology
    financial_terms = ["analysis", "financial", "ratio", "statement", "performance", "metric", "calculation"]
    term_count = sum(1 for term in financial_terms if term in content.lower())
    score += min(1.0, term_count * 0.2)
    
    return min(10.0, score)


def _calculate_clarity_score(content: str, sentence_count: int, word_count: int) -> float:
    """Calculate clarity score based on readability."""
    score = 6.0  # Base score
    
    # Sentence length analysis
    avg_words_per_sentence = word_count / sentence_count if sentence_count > 0 else 0
    if 15 <= avg_words_per_sentence <= 25:  # Optimal range
        score += 1.5
    elif 10 <= avg_words_per_sentence <= 30:
        score += 1.0
    else:
        score += 0.5
    
    # Check for clear explanations
    explanation_indicators = ["this means", "in other words", "for example", "specifically", "that is"]
    explanation_count = sum(1 for indicator in explanation_indicators if indicator in content.lower())
    score += min(1.0, explanation_count * 0.3)
    
    # Reward bullet points and lists
    if content.count("\n-") >= 3 or content.count("\n*") >= 3:
        score += 0.5
    
    # Check for jargon explanation
    if any(phrase in content.lower() for phrase in ["defined as", "refers to", "means that"]):
        score += 0.5
    
    return min(10.0, score)


def _calculate_completeness_score(content: str, word_count: int, paragraph_count: int) -> float:
    """Calculate completeness score based on content depth."""
    score = 5.0  # Base score
    
    # Word count assessment
    if word_count >= 7500:
        score += 2.0
    elif word_count >= 6000:
        score += 1.5
    elif word_count >= 4000:
        score += 1.0
    else:
        score += 0.5
    
    # Content depth indicators
    depth_indicators = ["analysis", "methodology", "approach", "framework", "model", "theory", "principle"]
    depth_count = sum(1 for indicator in depth_indicators if indicator in content.lower())
    score += min(1.5, depth_count * 0.2)
    
    # Section variety
    if paragraph_count >= 12:
        score += 1.0
    elif paragraph_count >= 8:
        score += 0.5
    
    # Check for comprehensive coverage
    coverage_terms = ["introduction", "conclusion", "summary", "overview", "background"]
    coverage_count = sum(1 for term in coverage_terms if term in content.lower())
    score += min(0.5, coverage_count * 0.1)
    
    return min(10.0, score)


def _calculate_engagement_score(content: str) -> float:
    """Calculate engagement score based on interactive and engaging elements."""
    score = 6.0  # Base score
    
    # Examples and illustrations
    example_count = content.lower().count("example") + content.lower().count("for instance")
    score += min(1.5, example_count * 0.3)
    
    # Questions and interactive elements
    question_count = content.count("?") + content.lower().count("consider") + content.lower().count("think about")
    score += min(1.0, question_count * 0.2)
    
    # Practical applications
    practical_terms = ["apply", "practice", "exercise", "activity", "task", "assignment"]
    practical_count = sum(1 for term in practical_terms if term in content.lower())
    score += min(1.0, practical_count * 0.2)
    
    # Varied content types
    if any(term in content.lower() for term in ["chart", "graph", "table", "figure", "diagram"]):
        score += 0.5
    
    # Real-world connections
    if any(term in content.lower() for term in ["real-world", "industry", "workplace", "professional"]):
        score += 0.5
    
    return min(10.0, score)


def _calculate_personalization_score(content: str) -> float:
    """Calculate personalization score based on employee-specific content."""
    score = 4.0  # Base score
    
    # Check for employee names or roles
    if any(name in content for name in ["Sarah", "John", "Maria", "Alex", "Employee", "you", "your"]):
        score += 2.0
    
    # Role-specific content
    role_terms = ["analyst", "manager", "director", "coordinator", "specialist", "professional"]
    role_count = sum(1 for term in role_terms if term in content.lower())
    score += min(1.5, role_count * 0.3)
    
    # Tool and software mentions
    tool_terms = ["excel", "powerbi", "tableau", "sap", "sql", "python", "software", "tool"]
    tool_count = sum(1 for term in tool_terms if term in content.lower())
    score += min(1.5, tool_count * 0.3)
    
    # Career development language
    if any(term in content.lower() for term in ["career", "advancement", "growth", "development", "progression"]):
        score += 1.0
    
    return min(10.0, score)


def _generate_enhancement_suggestions(quality_scores: Dict[str, float], indicators: Dict[str, bool], word_count: int, word_count_target: int = 7500, priority_level: str = "high") -> List[str]:
    """Generate specific enhancement suggestions based on quality analysis with dynamic targets."""
    suggestions = []
    
    # Dynamic word count tolerance
    tolerance = 0.15 if priority_level == "high" else 0.20 if priority_level == "medium" else 0.10
    min_words = int(word_count_target * (1 - tolerance))
    max_words = int(word_count_target * (1 + tolerance))
    
    # Word count suggestions
    if word_count < min_words:
        suggestions.append(f"Expand content by {min_words - word_count} words to meet {priority_level} priority module requirement (target: {word_count_target} ±{int(tolerance*100)}%)")
    elif word_count > max_words:
        suggestions.append(f"Consider condensing content by {word_count - max_words} words to stay within optimal range for {priority_level} priority")
    
    # Quality-specific suggestions
    if quality_scores.get("accuracy", 0) < 7.0:
        suggestions.append("Improve content structure with clear headings and logical flow")
    
    if quality_scores.get("clarity", 0) < 7.0:
        suggestions.append("Add more explanations and examples to improve clarity")
    
    if quality_scores.get("completeness", 0) < 7.0:
        suggestions.append("Expand content depth with more detailed analysis and concepts")
    
    if quality_scores.get("engagement", 0) < 7.0:
        suggestions.append("Add more practical examples, questions, and interactive elements")
    
    if quality_scores.get("personalization", 0) < 6.0:
        suggestions.append("Increase personalization with employee names, roles, and specific tools")
    
    # Indicator-based suggestions
    if not indicators.get("has_examples", False):
        suggestions.append("Include more concrete examples and case studies")
    
    if not indicators.get("has_clear_sections", False):
        suggestions.append("Improve content organization with clear section headings")
    
    return suggestions[:5]  # Limit to top 5 suggestions


def _determine_quality_level(score: float) -> str:
    """Determine quality level based on score."""
    if score >= 9.0:
        return "Excellent"
    elif score >= 8.0:
        return "Very Good"
    elif score >= 7.5:
        return "Good"
    elif score >= 6.5:
        return "Acceptable"
    elif score >= 5.0:
        return "Needs Improvement"
    else:
        return "Poor"


@function_tool
def blueprint_validator(content: str, blueprint: str) -> str:
    """Validate content against course blueprint requirements with real analysis."""
    
    if not content or not blueprint:
        return json.dumps({
            "success": False,
            "error": "Content or blueprint missing",
            "blueprint_compliance": 0.0
        })
    
    try:
        # Parse blueprint (assume JSON format)
        if isinstance(blueprint, str):
            try:
                blueprint_data = json.loads(blueprint)
            except json.JSONDecodeError:
                # If not JSON, treat as plain text requirements
                blueprint_data = {"requirements": blueprint}
        else:
            blueprint_data = blueprint
        
        # Validation metrics
        compliance_score = 0.0
        max_score = 0.0
        missing_elements = []
        covered_elements = []
        
        # 1. Learning Objectives Validation
        learning_objectives = blueprint_data.get("learning_objectives", [])
        if learning_objectives:
            max_score += 25
            objectives_covered = 0
            for objective in learning_objectives:
                if isinstance(objective, str):
                    # Check if objective concepts are mentioned in content
                    objective_words = objective.lower().split()
                    key_words = [word for word in objective_words if len(word) > 3]
                    covered = any(word in content.lower() for word in key_words)
                    if covered:
                        objectives_covered += 1
                        covered_elements.append(f"Learning objective: {objective[:50]}...")
                    else:
                        missing_elements.append(f"Learning objective not covered: {objective}")
            
            objective_score = (objectives_covered / len(learning_objectives)) * 25
            compliance_score += objective_score
        
        # 2. Key Concepts Validation
        key_concepts = blueprint_data.get("key_concepts", [])
        if key_concepts:
            max_score += 20
            concepts_covered = 0
            for concept in key_concepts:
                if isinstance(concept, str) and concept.lower() in content.lower():
                    concepts_covered += 1
                    covered_elements.append(f"Key concept: {concept}")
                else:
                    missing_elements.append(f"Key concept missing: {concept}")
            
            concept_score = (concepts_covered / len(key_concepts)) * 20 if key_concepts else 0
            compliance_score += concept_score
        
        # 3. Required Topics Validation
        required_topics = blueprint_data.get("required_topics", [])
        if required_topics:
            max_score += 20
            topics_covered = 0
            for topic in required_topics:
                if isinstance(topic, str):
                    topic_words = topic.lower().split()
                    covered = any(word in content.lower() for word in topic_words if len(word) > 3)
                    if covered:
                        topics_covered += 1
                        covered_elements.append(f"Required topic: {topic}")
                    else:
                        missing_elements.append(f"Required topic missing: {topic}")
            
            topic_score = (topics_covered / len(required_topics)) * 20 if required_topics else 0
            compliance_score += topic_score
        
        # 4. Content Structure Validation
        max_score += 15
        structure_score = 0
        
        # Check for introduction
        if any(word in content.lower() for word in ["introduction", "overview", "welcome"]):
            structure_score += 5
            covered_elements.append("Introduction section present")
        else:
            missing_elements.append("Introduction section missing")
        
        # Check for main content sections
        if content.count("##") >= 3 or content.count("**") >= 6:
            structure_score += 5
            covered_elements.append("Clear section structure")
        else:
            missing_elements.append("Clear section structure needed")
        
        # Check for conclusion/summary
        if any(word in content.lower() for word in ["conclusion", "summary", "recap"]):
            structure_score += 5
            covered_elements.append("Conclusion/summary section present")
        else:
            missing_elements.append("Conclusion/summary section missing")
        
        compliance_score += structure_score
        
        # 5. Assessment Elements Validation
        max_score += 20
        assessment_score = 0
        
        # Check for questions or assessments
        question_indicators = ["?", "question", "exercise", "activity", "assessment", "quiz"]
        has_questions = any(indicator in content.lower() for indicator in question_indicators)
        if has_questions:
            assessment_score += 10
            covered_elements.append("Assessment elements present")
        else:
            missing_elements.append("Assessment elements missing")
        
        # Check for practical applications
        practical_indicators = ["apply", "practice", "example", "case study", "scenario"]
        has_practical = any(indicator in content.lower() for indicator in practical_indicators)
        if has_practical:
            assessment_score += 10
            covered_elements.append("Practical applications present")
        else:
            missing_elements.append("Practical applications missing")
        
        compliance_score += assessment_score
        
        # Calculate final compliance percentage
        final_compliance = (compliance_score / max_score) * 100 if max_score > 0 else 0
        
        # Generate recommendations
        recommendations = []
        if final_compliance < 80:
            recommendations.append("Address missing blueprint elements to improve compliance")
        if len(missing_elements) > 0:
            recommendations.append(f"Focus on {len(missing_elements)} missing elements for better alignment")
        if final_compliance >= 90:
            recommendations.append("Excellent blueprint compliance - ready for review")
        
        # Dynamic word count validation based on module specifications
        word_count = len(content.split())
        word_count_target = blueprint_data.get("word_count_target", 7500)  # Default fallback
        priority_level = blueprint_data.get("priority_level", "high")
        
        # Set tolerance based on priority
        tolerance = 0.15 if priority_level == "high" else 0.20 if priority_level == "medium" else 0.10
        min_words = int(word_count_target * (1 - tolerance))
        max_words = int(word_count_target * (1 + tolerance))
        
        # Calculate word count score based on proximity to target
        if min_words <= word_count <= max_words:
            word_count_score = 10.0
        else:
            # Gradual score reduction based on distance from target
            if word_count < min_words:
                word_count_score = max(0, 10 * (word_count / min_words))
            else:
                word_count_score = max(0, 10 * (max_words / word_count))
        
        overall_quality = (final_compliance / 10) + (word_count_score * 0.3)
        
        result_data = {
            "success": True,
            "blueprint_compliance": round(final_compliance, 1),
            "compliance_score": round(compliance_score, 1),
            "max_possible_score": max_score,
            "covered_elements": covered_elements,
            "missing_elements": missing_elements,
            "quality_score": round(min(10.0, overall_quality), 1),
            "recommendations": recommendations,
            "compliance_level": _determine_compliance_level(final_compliance),
            "word_count_analysis": {
                "current_word_count": word_count,
                "target_word_count": word_count_target,
                "min_acceptable": min_words,
                "max_acceptable": max_words,
                "within_range": min_words <= word_count <= max_words,
                "priority_level": priority_level,
                "tolerance_percentage": int(tolerance * 100)
            }
        }
        
        return json.dumps(result_data)
        
    except Exception as e:
        return json.dumps({
            "success": False,
            "error": f"Blueprint validation failed: {str(e)}",
            "blueprint_compliance": 0.0
        })


def _determine_compliance_level(compliance_score: float) -> str:
    """Determine compliance level based on score."""
    if compliance_score >= 95:
        return "Excellent"
    elif compliance_score >= 85:
        return "Very Good"
    elif compliance_score >= 75:
        return "Good"
    elif compliance_score >= 65:
        return "Acceptable"
    else:
        return "Needs Improvement"


@function_tool
def word_counter(content: str) -> str:
    """Advanced word counting with detailed metrics."""
    if not content:
        return json.dumps({
            "success": False,
            "error": "No content provided",
            "word_count": 0
        })
    
    # Detailed word analysis
    words = content.split()
    sentences = [s.strip() for s in content.split('.') if s.strip()]
    paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
    
    # Character analysis
    total_chars = len(content)
    chars_no_spaces = len(content.replace(' ', ''))
    
    # Reading time estimation (average 200 words per minute)
    reading_time_minutes = len(words) / 200
    
    result_data = {
        "success": True,
        "word_count": len(words),
        "character_count": total_chars,
        "character_count_no_spaces": chars_no_spaces,
        "sentence_count": len(sentences),
        "paragraph_count": len(paragraphs),
        "avg_words_per_sentence": round(len(words) / len(sentences), 1) if sentences else 0,
        "avg_words_per_paragraph": round(len(words) / len(paragraphs), 1) if paragraphs else 0,
        "estimated_reading_time_minutes": round(reading_time_minutes, 1),
        "word_count_status": {
            "meets_minimum": len(words) >= 6750,
            "within_target_range": 6750 <= len(words) <= 8250,
            "exceeds_maximum": len(words) > 8250,
            "target_range": "6,750-8,250 words"
        }
    }
    
    return json.dumps(result_data)


@function_tool
def personalization_checker(content: str, employee_context: str) -> str:
    """Check content personalization against employee context."""
    if not content:
        return json.dumps({
            "success": False,
            "error": "No content provided",
            "personalization_score": 0.0
        })
    
    try:
        # Parse employee context
        if isinstance(employee_context, str):
            try:
                context_data = json.loads(employee_context)
            except json.JSONDecodeError:
                context_data = {"general_context": employee_context}
        else:
            context_data = employee_context
        
        personalization_score = 0.0
        max_score = 100.0
        found_elements = []
        missing_elements = []
        
        # 1. Employee Name Check (20 points)
        employee_name = context_data.get("employee_name", "")
        if employee_name and employee_name.lower() in content.lower():
            personalization_score += 20
            found_elements.append(f"Employee name '{employee_name}' mentioned")
        elif employee_name:
            missing_elements.append(f"Employee name '{employee_name}' not mentioned")
        
        # 2. Current Role Check (20 points)
        current_role = context_data.get("current_role", "")
        if current_role:
            role_words = current_role.lower().split()
            role_mentioned = any(word in content.lower() for word in role_words if len(word) > 3)
            if role_mentioned:
                personalization_score += 20
                found_elements.append(f"Current role '{current_role}' referenced")
            else:
                missing_elements.append(f"Current role '{current_role}' not referenced")
        
        # 3. Career Goals Check (15 points)
        career_goal = context_data.get("career_goal", "")
        if career_goal:
            goal_words = career_goal.lower().split()
            goal_mentioned = any(word in content.lower() for word in goal_words if len(word) > 3)
            if goal_mentioned:
                personalization_score += 15
                found_elements.append(f"Career goal '{career_goal}' mentioned")
            else:
                missing_elements.append(f"Career goal '{career_goal}' not mentioned")
        
        # 4. Tools and Software Check (25 points)
        key_tools = context_data.get("key_tools", [])
        if key_tools:
            tools_mentioned = []
            for tool in key_tools:
                if tool.lower() in content.lower():
                    tools_mentioned.append(tool)
                    found_elements.append(f"Tool '{tool}' mentioned")
            
            tools_score = (len(tools_mentioned) / len(key_tools)) * 25
            personalization_score += tools_score
            
            if len(tools_mentioned) < len(key_tools):
                missing_tools = [tool for tool in key_tools if tool not in tools_mentioned]
                missing_elements.append(f"Tools not mentioned: {', '.join(missing_tools)}")
        
        # 5. Industry/Context Check (20 points)
        industry = context_data.get("industry", "")
        if industry and industry.lower() in content.lower():
            personalization_score += 20
            found_elements.append(f"Industry '{industry}' mentioned")
        elif industry:
            missing_elements.append(f"Industry '{industry}' not mentioned")
        
        # Calculate final percentage
        final_percentage = (personalization_score / max_score) * 100
        
        # Generate recommendations
        recommendations = []
        if final_percentage < 60:
            recommendations.append("Significantly increase personalization elements")
        if len(missing_elements) > 2:
            recommendations.append("Address multiple missing personalization elements")
        if final_percentage >= 80:
            recommendations.append("Excellent personalization level achieved")
        
        result_data = {
            "success": True,
            "personalization_score": round(final_percentage, 1),
            "raw_score": round(personalization_score, 1),
            "max_possible_score": max_score,
            "found_elements": found_elements,
            "missing_elements": missing_elements,
            "recommendations": recommendations,
            "personalization_level": _determine_personalization_level(final_percentage)
        }
        
        return json.dumps(result_data)
        
    except Exception as e:
        return json.dumps({
            "success": False,
            "error": f"Personalization check failed: {str(e)}",
            "personalization_score": 0.0
        })


def _determine_personalization_level(score: float) -> str:
    """Determine personalization level based on score."""
    if score >= 90:
        return "Highly Personalized"
    elif score >= 75:
        return "Well Personalized"
    elif score >= 60:
        return "Moderately Personalized"
    elif score >= 40:
        return "Lightly Personalized"
    else:
        return "Generic Content"


@function_tool
def enhancement_suggester(quality_data: str, blueprint_data: str) -> str:
    """Generate specific enhancement suggestions based on quality and blueprint analysis."""
    try:
        # Parse input data
        quality_info = json.loads(quality_data) if isinstance(quality_data, str) else quality_data
        blueprint_info = json.loads(blueprint_data) if isinstance(blueprint_data, str) else blueprint_data
        
        suggestions = []
        priority_scores = {}
        
        # Quality-based suggestions
        if quality_info.get("overall_score", 0) < 7.5:
            if quality_info.get("individual_scores", {}).get("accuracy", 0) < 7.0:
                suggestions.append({
                    "type": "accuracy",
                    "suggestion": "Improve content structure with clear headings and logical flow between concepts",
                    "priority": "high",
                    "estimated_effort": "medium"
                })
                priority_scores["accuracy"] = 10
            
            if quality_info.get("individual_scores", {}).get("clarity", 0) < 7.0:
                suggestions.append({
                    "type": "clarity",
                    "suggestion": "Add more explanations, definitions, and examples to clarify complex concepts",
                    "priority": "high",
                    "estimated_effort": "medium"
                })
                priority_scores["clarity"] = 9
            
            if quality_info.get("individual_scores", {}).get("engagement", 0) < 7.0:
                suggestions.append({
                    "type": "engagement",
                    "suggestion": "Include more interactive elements, questions, and real-world scenarios",
                    "priority": "medium",
                    "estimated_effort": "high"
                })
                priority_scores["engagement"] = 7
        
        # Blueprint compliance suggestions
        if blueprint_info.get("blueprint_compliance", 0) < 85:
            missing_elements = blueprint_info.get("missing_elements", [])
            for element in missing_elements[:3]:  # Top 3 missing elements
                suggestions.append({
                    "type": "blueprint_compliance",
                    "suggestion": f"Add missing blueprint element: {element}",
                    "priority": "high",
                    "estimated_effort": "low"
                })
                priority_scores["blueprint"] = 8
        
        # Word count suggestions
        word_count = quality_info.get("word_count", 0)
        if word_count < 6750:
            suggestions.append({
                "type": "word_count",
                "suggestion": f"Expand content by approximately {6750 - word_count} words to meet minimum requirement",
                "priority": "high",
                "estimated_effort": "high"
            })
            priority_scores["word_count"] = 10
        elif word_count > 8250:
            suggestions.append({
                "type": "word_count",
                "suggestion": f"Condense content by approximately {word_count - 8250} words to stay within optimal range",
                "priority": "medium",
                "estimated_effort": "medium"
            })
            priority_scores["word_count"] = 6
        
        # Personalization suggestions
        if quality_info.get("individual_scores", {}).get("personalization", 0) < 6.0:
            suggestions.append({
                "type": "personalization",
                "suggestion": "Increase personalization with specific employee references, role-based examples, and tool mentions",
                "priority": "medium",
                "estimated_effort": "low"
            })
            priority_scores["personalization"] = 5
        
        # Sort suggestions by priority
        priority_order = {"high": 3, "medium": 2, "low": 1}
        suggestions.sort(key=lambda x: priority_order.get(x["priority"], 0), reverse=True)
        
        # Generate action plan
        action_plan = {
            "immediate_actions": [s for s in suggestions if s["priority"] == "high"][:3],
            "secondary_actions": [s for s in suggestions if s["priority"] == "medium"][:2],
            "optional_improvements": [s for s in suggestions if s["priority"] == "low"][:2]
        }
        
        # Extract revision attempt count if provided in quality_data
        revision_attempt = quality_info.get("revision_attempt", 0)
        
        result_data = {
            "success": True,
            "total_suggestions": len(suggestions),
            "enhancement_suggestions": suggestions[:3],  # Top 3 specific improvements
            "action_plan": action_plan,
            "priority_scores": priority_scores,
            "overall_enhancement_needed": len([s for s in suggestions if s["priority"] == "high"]) > 0,
            "revision_attempt": revision_attempt,
            "max_revisions_reached": revision_attempt >= 2
        }
        
        return json.dumps(result_data)
        
    except Exception as e:
        return json.dumps({
            "success": False,
            "error": f"Enhancement suggestion generation failed: {str(e)}",
            "enhancement_suggestions": []
        })


@function_tool
def generate_enhancement_requirements(quality_assessment: str, blueprint_validation: str, module_spec: str) -> str:
    """
    Generate specific enhancement requirements based on quality gaps.
    
    This tool creates actionable enhancement requirements that the Enhancement Agent
    can use to improve specific sections of content. It maps quality issues to
    sections and calculates exact word count needs.
    
    Args:
        quality_assessment: JSON string with quality assessment results
        blueprint_validation: JSON string with blueprint validation results  
        module_spec: JSON string with original module specification
        
    Returns:
        JSON string with detailed enhancement requirements including:
        - Sections to enhance with specific improvements needed
        - Word count targets per section
        - Quality improvements mapped to sections
        - Blueprint gaps to address
        - Priority order for enhancements
    """
    try:
        # Parse inputs
        quality_data = json.loads(quality_assessment) if isinstance(quality_assessment, str) else quality_assessment
        blueprint_data = json.loads(blueprint_validation) if isinstance(blueprint_validation, str) else blueprint_validation
        spec_data = json.loads(module_spec) if isinstance(module_spec, str) else module_spec
        
        # Extract key metrics
        overall_score = quality_data.get('overall_score', 0)
        word_count = quality_data.get('word_count', 0)
        individual_scores = quality_data.get('individual_scores', {})
        quality_indicators = quality_data.get('quality_indicators', {})
        content_metrics = quality_data.get('content_metrics', {})
        module_context = quality_data.get('module_context', {})
        
        # Blueprint metrics
        blueprint_compliance = blueprint_data.get('blueprint_compliance', 0)
        missing_elements = blueprint_data.get('missing_elements', [])
        word_count_analysis = blueprint_data.get('word_count_analysis', {})
        
        # Module specifications
        priority_level = spec_data.get('priority_level', 'high')
        word_count_target = spec_data.get('word_count_target', 7500)
        
        # Initialize enhancement requirements
        enhancement_requirements = {
            "sections_to_enhance": {},
            "word_count_targets": {},
            "quality_improvements": {},
            "blueprint_gaps": [],
            "enhancement_priority": []
        }
        
        # 1. Calculate word count requirements
        min_words = word_count_analysis.get('min_acceptable', 6750)
        if word_count < min_words:
            words_needed = min_words - word_count
            
            # Smart distribution based on content balance
            section_distribution = _calculate_section_distribution(words_needed, content_metrics)
            enhancement_requirements["word_count_targets"] = section_distribution
            
            # Map to sections that need enhancement
            for section, word_target in section_distribution.items():
                if section not in enhancement_requirements["sections_to_enhance"]:
                    enhancement_requirements["sections_to_enhance"][section] = []
                enhancement_requirements["sections_to_enhance"][section].append({
                    "type": "expand_content",
                    "target": word_target,
                    "reason": "below_minimum_word_count"
                })
        
        # 2. Map quality issues to sections
        quality_threshold = 8.0 if priority_level == "critical" else 7.5 if priority_level == "high" else 7.0
        
        for dimension, score in individual_scores.items():
            if score < quality_threshold:
                sections = _map_quality_dimension_to_sections(dimension, score)
                improvement = _get_specific_improvement(dimension, score, content_metrics)
                
                enhancement_requirements["quality_improvements"][dimension] = {
                    "current_score": score,
                    "target_score": quality_threshold,
                    "improvement_strategy": improvement,
                    "affected_sections": sections
                }
                
                # Add to sections that need enhancement
                for section in sections:
                    if section not in enhancement_requirements["sections_to_enhance"]:
                        enhancement_requirements["sections_to_enhance"][section] = []
                    enhancement_requirements["sections_to_enhance"][section].append({
                        "type": f"improve_{dimension}",
                        "strategy": improvement,
                        "reason": f"{dimension}_score_below_threshold"
                    })
        
        # 3. Address blueprint gaps
        if blueprint_compliance < 85:
            # Prioritize top missing elements
            top_gaps = missing_elements[:5]
            enhancement_requirements["blueprint_gaps"] = top_gaps
            
            # Map gaps to sections
            for gap in top_gaps:
                section = _map_blueprint_gap_to_section(gap)
                if section not in enhancement_requirements["sections_to_enhance"]:
                    enhancement_requirements["sections_to_enhance"][section] = []
                enhancement_requirements["sections_to_enhance"][section].append({
                    "type": "add_missing_element",
                    "element": gap,
                    "reason": "blueprint_compliance"
                })
        
        # 4. Create enhancement priority order
        priority_order = []
        
        # High priority: Word count and critical quality issues
        if word_count < min_words:
            priority_order.append({
                "priority": 1,
                "type": "word_count_expansion",
                "sections": list(enhancement_requirements["word_count_targets"].keys()),
                "urgency": "critical"
            })
        
        # Medium priority: Quality improvements
        for dimension, improvement in enhancement_requirements["quality_improvements"].items():
            if improvement["current_score"] < 6.0:
                priority_order.append({
                    "priority": 2,
                    "type": f"quality_{dimension}",
                    "sections": improvement["affected_sections"],
                    "urgency": "high"
                })
        
        # Lower priority: Blueprint gaps
        if enhancement_requirements["blueprint_gaps"]:
            priority_order.append({
                "priority": 3,
                "type": "blueprint_alignment",
                "sections": ["core_content", "practical_applications"],
                "urgency": "medium"
            })
        
        enhancement_requirements["enhancement_priority"] = sorted(priority_order, key=lambda x: x["priority"])
        
        # 5. Generate specific instructions for Enhancement Agent
        enhancement_instructions = _generate_enhancement_instructions(enhancement_requirements)
        
        # 6. Calculate estimated effort
        estimated_effort = _calculate_enhancement_effort(enhancement_requirements)
        
        result = {
            "success": True,
            "needs_enhancement": len(enhancement_requirements["sections_to_enhance"]) > 0,
            "enhancement_requirements": enhancement_requirements,
            "enhancement_instructions": enhancement_instructions,
            "estimated_effort": estimated_effort,
            "current_metrics": {
                "overall_score": overall_score,
                "word_count": word_count,
                "blueprint_compliance": blueprint_compliance
            },
            "target_metrics": {
                "overall_score": quality_threshold,
                "word_count": min_words,
                "blueprint_compliance": 85
            }
        }
        
        return json.dumps(result)
        
    except Exception as e:
        return json.dumps({
            "success": False,
            "error": f"Enhancement requirements generation failed: {str(e)}",
            "needs_enhancement": False
        })


def _calculate_section_distribution(words_needed: int, content_metrics: Dict[str, Any]) -> Dict[str, str]:
    """Calculate intelligent word distribution across sections."""
    distribution = {}
    
    # Base distribution percentages
    if words_needed > 1500:
        # Major expansion needed
        distribution = {
            "core_content": f"+{int(words_needed * 0.50)} words",
            "practical_applications": f"+{int(words_needed * 0.25)} words",
            "case_studies": f"+{int(words_needed * 0.15)} words",
            "assessments": f"+{int(words_needed * 0.10)} words"
        }
    elif words_needed > 800:
        # Moderate expansion
        distribution = {
            "core_content": f"+{int(words_needed * 0.60)} words",
            "practical_applications": f"+{int(words_needed * 0.30)} words",
            "case_studies": f"+{int(words_needed * 0.10)} words"
        }
    else:
        # Minor expansion
        distribution = {
            "core_content": f"+{int(words_needed * 0.70)} words",
            "practical_applications": f"+{int(words_needed * 0.30)} words"
        }
    
    return distribution


def _map_quality_dimension_to_sections(dimension: str, score: float) -> List[str]:
    """Map quality dimensions to content sections that need improvement."""
    section_mapping = {
        "accuracy": ["core_content", "assessments"],
        "clarity": ["introduction", "core_content"],
        "completeness": ["core_content", "practical_applications"],
        "engagement": ["practical_applications", "case_studies"],
        "personalization": ["introduction", "practical_applications", "case_studies"]
    }
    
    return section_mapping.get(dimension, ["core_content"])


def _get_specific_improvement(dimension: str, score: float, metrics: Dict[str, Any]) -> str:
    """Get specific improvement strategy for a quality dimension."""
    improvement_strategies = {
        "accuracy": {
            "low": "Add precise financial terminology, verify all calculations, include authoritative sources",
            "medium": "Enhance technical accuracy and add more specific examples"
        },
        "clarity": {
            "low": "Simplify complex concepts, add step-by-step explanations, include visual descriptions",
            "medium": "Improve explanations and add clarifying examples"
        },
        "completeness": {
            "low": "Significantly expand content depth, add missing concepts, include comprehensive coverage",
            "medium": "Add more detail to existing concepts and fill content gaps"
        },
        "engagement": {
            "low": "Add interactive exercises, real-world scenarios, thought-provoking questions",
            "medium": "Include more examples and practical applications"
        },
        "personalization": {
            "low": "Add employee name references, role-specific examples, career progression elements",
            "medium": "Enhance with more personalized content and tool references"
        }
    }
    
    severity = "low" if score < 6.0 else "medium"
    return improvement_strategies.get(dimension, {}).get(severity, "Improve content quality")


def _map_blueprint_gap_to_section(gap: str) -> str:
    """Map blueprint gaps to appropriate content sections."""
    gap_lower = gap.lower()
    
    if any(term in gap_lower for term in ["introduction", "overview", "foundation"]):
        return "introduction"
    elif any(term in gap_lower for term in ["practice", "application", "exercise", "activity"]):
        return "practical_applications"
    elif any(term in gap_lower for term in ["example", "case", "scenario", "story"]):
        return "case_studies"
    elif any(term in gap_lower for term in ["quiz", "test", "assessment", "question"]):
        return "assessments"
    else:
        return "core_content"  # Default


def _generate_enhancement_instructions(requirements: Dict[str, Any]) -> List[str]:
    """Generate specific instructions for the Enhancement Agent."""
    instructions = []
    
    # Word count instructions
    if requirements["word_count_targets"]:
        instructions.append("WORD COUNT EXPANSION:")
        for section, target in requirements["word_count_targets"].items():
            instructions.append(f"  - {section}: Expand by {target}")
    
    # Quality improvement instructions
    if requirements["quality_improvements"]:
        instructions.append("\nQUALITY IMPROVEMENTS:")
        for dimension, improvement in requirements["quality_improvements"].items():
            instructions.append(f"  - {dimension.capitalize()}: {improvement['improvement_strategy']}")
    
    # Blueprint gap instructions
    if requirements["blueprint_gaps"]:
        instructions.append("\nBLUEPRINT GAPS TO ADDRESS:")
        for gap in requirements["blueprint_gaps"]:
            instructions.append(f"  - Add: {gap}")
    
    return instructions


def _calculate_enhancement_effort(requirements: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate estimated effort for enhancements."""
    total_sections = len(requirements["sections_to_enhance"])
    total_word_additions = sum(
        int(target.replace("+", "").replace(" words", ""))
        for target in requirements["word_count_targets"].values()
    )
    
    # Estimate time based on complexity
    estimated_minutes = 5 * total_sections + (total_word_additions // 100) * 2
    
    return {
        "sections_to_modify": total_sections,
        "words_to_add": total_word_additions,
        "estimated_time_minutes": estimated_minutes,
        "complexity": "high" if total_word_additions > 1500 else "medium" if total_word_additions > 500 else "low"
    }