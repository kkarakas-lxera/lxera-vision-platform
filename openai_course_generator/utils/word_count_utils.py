#!/usr/bin/env python3
"""
Unified Word Count Utilities

Provides standardized word counting across all pipeline agents to fix
discrepancies between ValidationManager and Quality Agent reporting.
"""

import re
import logging
from typing import Dict, Any, Union

logger = logging.getLogger(__name__)

def standardized_word_count(text: str) -> int:
    """
    Standardized word counting method used across all agents.
    
    Args:
        text: Text content to count
        
    Returns:
        Integer word count using consistent methodology
    """
    if not text or not isinstance(text, str):
        return 0
    
    # Remove extra whitespace and normalize
    cleaned_text = text.strip()
    if not cleaned_text:
        return 0
    
    # Split on whitespace and filter empty strings
    words = [word for word in cleaned_text.split() if word.strip()]
    return len(words)

def count_section_words(section_content: Union[str, Dict[str, Any]]) -> int:
    """
    Count words in a section, handling different content formats.
    
    Args:
        section_content: Section content (string or dict with 'content' key)
        
    Returns:
        Word count for the section
    """
    if isinstance(section_content, str):
        return standardized_word_count(section_content)
    elif isinstance(section_content, dict):
        # Handle nested content structure
        content = section_content.get("content", "")
        return standardized_word_count(content)
    else:
        logger.warning(f"Unexpected section content type: {type(section_content)}")
        return 0

def count_module_words(module_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Count words for a complete module with detailed breakdown.
    
    Args:
        module_data: Module structure with sections
        
    Returns:
        Dictionary with word count breakdown
    """
    sections = module_data.get("sections", {})
    section_counts = {}
    total_words = 0
    
    for section_name, section_content in sections.items():
        word_count = count_section_words(section_content)
        section_counts[section_name] = word_count
        total_words += word_count
    
    return {
        "total_words": total_words,
        "section_breakdown": section_counts,
        "sections_count": len(sections),
        "average_words_per_section": total_words / len(sections) if sections else 0
    }

def validate_word_count_targets(
    actual_counts: Dict[str, int], 
    target_counts: Dict[str, int],
    tolerance_percent: float = 20.0
) -> Dict[str, Any]:
    """
    Validate actual word counts against targets with tolerance.
    
    Args:
        actual_counts: Actual word counts by section
        target_counts: Target word counts by section  
        tolerance_percent: Acceptable deviation percentage
        
    Returns:
        Validation results with pass/fail status
    """
    results = {
        "overall_pass": True,
        "section_results": {},
        "total_actual": sum(actual_counts.values()),
        "total_target": sum(target_counts.values())
    }
    
    for section, target in target_counts.items():
        actual = actual_counts.get(section, 0)
        
        # Calculate tolerance range
        min_acceptable = target * (1 - tolerance_percent / 100)
        max_acceptable = target * (1 + tolerance_percent / 100)
        
        section_pass = min_acceptable <= actual <= max_acceptable
        
        results["section_results"][section] = {
            "actual": actual,
            "target": target,
            "min_acceptable": int(min_acceptable),
            "max_acceptable": int(max_acceptable),
            "pass": section_pass,
            "deviation_percent": ((actual - target) / target * 100) if target > 0 else 0
        }
        
        if not section_pass:
            results["overall_pass"] = False
    
    return results

def normalize_content_structure(content_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalize content structure to consistent format for word counting.
    
    Args:
        content_data: Content in various formats
        
    Returns:
        Normalized structure with consistent format
    """
    # Handle different input formats
    if "sections" in content_data:
        # Already has sections structure
        sections = content_data["sections"]
    else:
        # Treat entire content as sections
        sections = content_data
    
    normalized_sections = {}
    
    for section_name, section_content in sections.items():
        if isinstance(section_content, str):
            # Convert string content to dict format
            normalized_sections[section_name] = {
                "content": section_content,
                "word_count": standardized_word_count(section_content)
            }
        elif isinstance(section_content, dict) and "content" in section_content:
            # Already in dict format
            content = section_content["content"]
            normalized_sections[section_name] = {
                "content": content,
                "word_count": standardized_word_count(content)
            }
        else:
            logger.warning(f"Could not normalize section '{section_name}' with type {type(section_content)}")
            normalized_sections[section_name] = {
                "content": str(section_content),
                "word_count": standardized_word_count(str(section_content))
            }
    
    return {
        "sections": normalized_sections,
        "total_word_count": sum(s["word_count"] for s in normalized_sections.values()),
        "normalized": True
    }

if __name__ == "__main__":
    """Test word counting utilities."""
    
    print("🧪 Testing Word Count Utilities")
    print("=" * 50)
    
    # Test basic word counting
    test_text = "This is a test with exactly ten words total count."
    count = standardized_word_count(test_text)
    print(f"Basic count test: {count} words (expected: 10)")
    
    # Test module structure
    test_module = {
        "sections": {
            "introduction": "This is an introduction with some words here for testing purposes.",
            "core_content": {
                "content": "This is core content with more words for comprehensive testing of the system."
            }
        }
    }
    
    result = count_module_words(test_module)
    print(f"Module count: {result}")
    
    # Test normalization
    normalized = normalize_content_structure(test_module)
    print(f"Normalized structure: {normalized}")
    
    print("✅ Word count utilities ready!")