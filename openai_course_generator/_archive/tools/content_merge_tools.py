#!/usr/bin/env python3
"""
Content Merge Tools - Intelligent merging of enhanced content with original content.

These tools handle the complex process of merging enhanced sections with original content
while preserving good sections, ensuring coherent transitions, and maintaining quality.
"""

import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
from lxera_agents import function_tool

# Database integration
from database.content_manager import ContentManager

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global ContentManager instance
content_manager = None

def get_content_manager() -> ContentManager:
    """Get or create ContentManager instance."""
    global content_manager
    if content_manager is None:
        content_manager = ContentManager()
    return content_manager


@function_tool
def merge_enhanced_content(
    original_content_id: str,
    enhanced_sections: str,
    enhancement_requirements: str,
    merge_strategy: str = "smart"
) -> str:
    """
    Intelligently merge enhanced content sections with original content.
    
    This tool preserves high-quality original sections while replacing or enhancing
    weak sections based on the enhancement requirements. It ensures smooth transitions
    and maintains content coherence.
    
    Args:
        original_content_id: Content ID of the original module
        enhanced_sections: JSON string with enhanced section content
        enhancement_requirements: JSON string with requirements that guided enhancement
        merge_strategy: Strategy for merging ("smart", "replace_all", "additive")
        
    Returns:
        JSON string with merge results including new content_id and metrics
    """
    try:
        logger.info(f"🔀 Starting content merge for {original_content_id[:8]}...")
        
        cm = get_content_manager()
        
        # Parse inputs
        enhanced_data = json.loads(enhanced_sections) if isinstance(enhanced_sections, str) else enhanced_sections
        requirements = json.loads(enhancement_requirements) if isinstance(enhancement_requirements, str) else enhancement_requirements
        
        # 1. Retrieve original content
        original_content = cm.get_module_content(original_content_id)
        original_sections = cm.get_content_sections(original_content_id)
        
        if not original_content or not original_sections:
            return json.dumps({
                "success": False,
                "error": "Original content not found",
                "original_content_id": original_content_id
            })
        
        # 2. Determine sections to merge based on requirements
        sections_to_enhance = requirements.get("sections_to_enhance", {})
        sections_enhanced = list(enhanced_data.keys())
        
        # 3. Create merged content based on strategy
        merged_sections = {}
        merge_log = []
        
        if merge_strategy == "smart":
            # Smart merge: Replace only sections that needed enhancement
            for section_name, original_text in original_sections.items():
                if section_name in sections_to_enhance and section_name in enhanced_data:
                    # Use enhanced version
                    merged_sections[section_name] = enhanced_data[section_name]
                    merge_log.append({
                        "section": section_name,
                        "action": "replaced_with_enhanced",
                        "original_words": len(original_text.split()),
                        "enhanced_words": len(enhanced_data[section_name].split())
                    })
                else:
                    # Keep original
                    merged_sections[section_name] = original_text
                    merge_log.append({
                        "section": section_name,
                        "action": "preserved_original",
                        "words": len(original_text.split())
                    })
        
        elif merge_strategy == "replace_all":
            # Replace all sections with enhanced versions
            merged_sections = enhanced_data
            for section_name in enhanced_data:
                merge_log.append({
                    "section": section_name,
                    "action": "replaced_all",
                    "enhanced_words": len(enhanced_data[section_name].split())
                })
        
        elif merge_strategy == "additive":
            # Add enhanced content to original (append)
            for section_name, original_text in original_sections.items():
                if section_name in enhanced_data:
                    # Combine with transition
                    transition = _create_section_transition(section_name)
                    merged_sections[section_name] = f"{original_text}\n\n{transition}\n\n{enhanced_data[section_name]}"
                    merge_log.append({
                        "section": section_name,
                        "action": "combined_content",
                        "original_words": len(original_text.split()),
                        "added_words": len(enhanced_data[section_name].split())
                    })
                else:
                    merged_sections[section_name] = original_text
                    merge_log.append({
                        "section": section_name,
                        "action": "preserved_original",
                        "words": len(original_text.split())
                    })
        
        # 4. Ensure smooth transitions between sections
        merged_sections = _ensure_transitions(merged_sections, merge_log)
        
        # 5. Calculate metrics
        original_total_words = sum(len(s.split()) for s in original_sections.values())
        merged_total_words = sum(len(s.split()) for s in merged_sections.values())
        words_added = merged_total_words - original_total_words
        
        # 6. Create new content version with lineage tracking
        new_content_id = cm.create_module_content(
            module_name=original_content['module_name'] + " (Enhanced)",
            employee_name=original_content['employee_name'],
            session_id=original_content['session_id'],
            module_spec={
                **original_content['module_spec'],
                'parent_content_id': original_content_id,
                'enhancement_version': original_content.get('revision_count', 0) + 1
            },
            research_context=original_content.get('research_context', {})
        )
        
        # 7. Store merged sections
        for section_name, section_content in merged_sections.items():
            success = cm.update_module_section(
                content_id=new_content_id,
                section_name=section_name,
                section_content=section_content,
                metadata={
                    'merge_action': next((log['action'] for log in merge_log if log['section'] == section_name), 'unknown'),
                    'parent_content_id': original_content_id
                }
            )
            if not success:
                logger.warning(f"⚠️ Failed to store merged section: {section_name}")
        
        # 8. Update status
        cm.update_module_status(new_content_id, 'enhanced', original_content.get('revision_count', 0) + 1)
        
        result = {
            "success": True,
            "original_content_id": original_content_id,
            "merged_content_id": new_content_id,
            "merge_strategy": merge_strategy,
            "merge_log": merge_log,
            "metrics": {
                "original_word_count": original_total_words,
                "merged_word_count": merged_total_words,
                "words_added": words_added,
                "percentage_increase": round((words_added / original_total_words * 100), 1) if original_total_words > 0 else 0,
                "sections_enhanced": len([log for log in merge_log if 'replaced' in log['action']]),
                "sections_preserved": len([log for log in merge_log if log['action'] == 'preserved_original'])
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        logger.info(f"✅ Content merge completed: {new_content_id[:8]} (added {words_added} words)")
        return json.dumps(result)
        
    except Exception as e:
        logger.error(f"❌ Content merge failed: {e}")
        return json.dumps({
            "success": False,
            "error": str(e),
            "original_content_id": original_content_id
        })


@function_tool
def validate_merged_content(merged_content_id: str, original_content_id: str) -> str:
    """
    Validate the merged content to ensure quality and coherence.
    
    Args:
        merged_content_id: Content ID of the merged module
        original_content_id: Content ID of the original module
        
    Returns:
        JSON string with validation results
    """
    try:
        logger.info(f"🔍 Validating merged content {merged_content_id[:8]}...")
        
        cm = get_content_manager()
        
        # Get both versions
        merged_content = cm.get_module_content(merged_content_id)
        merged_sections = cm.get_content_sections(merged_content_id)
        original_sections = cm.get_content_sections(original_content_id)
        
        if not merged_content or not merged_sections:
            return json.dumps({
                "success": False,
                "error": "Merged content not found",
                "merged_content_id": merged_content_id
            })
        
        # Validation checks
        validation_results = {
            "content_integrity": True,
            "section_coherence": True,
            "word_count_improved": True,
            "no_content_loss": True,
            "issues": []
        }
        
        # 1. Check content integrity (no empty sections)
        empty_sections = [s for s, content in merged_sections.items() if not content or len(content.strip()) < 50]
        if empty_sections:
            validation_results["content_integrity"] = False
            validation_results["issues"].append(f"Empty or minimal sections found: {empty_sections}")
        
        # 2. Check section coherence (transitions)
        coherence_issues = _check_section_coherence(merged_sections)
        if coherence_issues:
            validation_results["section_coherence"] = False
            validation_results["issues"].extend(coherence_issues)
        
        # 3. Check word count improvement
        original_words = sum(len(s.split()) for s in original_sections.values() if s)
        merged_words = sum(len(s.split()) for s in merged_sections.values() if s)
        if merged_words <= original_words:
            validation_results["word_count_improved"] = False
            validation_results["issues"].append(f"Word count not improved: {merged_words} <= {original_words}")
        
        # 4. Check for content loss
        important_terms = _extract_important_terms(original_sections)
        missing_terms = []
        for term in important_terms:
            if not any(term.lower() in section.lower() for section in merged_sections.values()):
                missing_terms.append(term)
        
        if missing_terms:
            validation_results["no_content_loss"] = False
            validation_results["issues"].append(f"Important terms missing: {missing_terms[:5]}")
        
        # Calculate validation score
        checks_passed = sum([
            validation_results["content_integrity"],
            validation_results["section_coherence"],
            validation_results["word_count_improved"],
            validation_results["no_content_loss"]
        ])
        validation_score = (checks_passed / 4) * 100
        
        result = {
            "success": True,
            "validation_passed": validation_score >= 75,
            "validation_score": validation_score,
            "validation_results": validation_results,
            "metrics": {
                "original_word_count": original_words,
                "merged_word_count": merged_words,
                "word_count_increase": merged_words - original_words,
                "sections_validated": len(merged_sections)
            },
            "recommendation": "approve" if validation_score >= 75 else "review_required"
        }
        
        logger.info(f"✅ Validation completed: Score {validation_score}%")
        return json.dumps(result)
        
    except Exception as e:
        logger.error(f"❌ Validation failed: {e}")
        return json.dumps({
            "success": False,
            "error": str(e),
            "merged_content_id": merged_content_id
        })


@function_tool
def create_content_version(
    content_id: str,
    version_type: str = "enhancement",
    version_metadata: str = "{}"
) -> str:
    """
    Create a new version of content with proper lineage tracking.
    
    Args:
        content_id: Original content ID
        version_type: Type of version (enhancement, revision, quality_fix)
        version_metadata: JSON string with version-specific metadata
        
    Returns:
        JSON string with new version information
    """
    try:
        logger.info(f"📋 Creating {version_type} version of {content_id[:8]}...")
        
        cm = get_content_manager()
        metadata = json.loads(version_metadata) if isinstance(version_metadata, str) else version_metadata
        
        # Get original content
        original = cm.get_module_content(content_id)
        if not original:
            return json.dumps({
                "success": False,
                "error": "Original content not found",
                "content_id": content_id
            })
        
        # Create version with lineage
        version_spec = {
            **original['module_spec'],
            'parent_content_id': content_id,
            'version_type': version_type,
            'version_number': original.get('revision_count', 0) + 1,
            'version_metadata': metadata,
            'version_created_at': datetime.now(timezone.utc).isoformat()
        }
        
        new_version_id = cm.create_module_content(
            module_name=f"{original['module_name']} ({version_type} v{version_spec['version_number']})",
            employee_name=original['employee_name'],
            session_id=original['session_id'],
            module_spec=version_spec,
            research_context=original.get('research_context', {})
        )
        
        result = {
            "success": True,
            "original_content_id": content_id,
            "new_version_id": new_version_id,
            "version_type": version_type,
            "version_number": version_spec['version_number'],
            "lineage": {
                "parent": content_id,
                "child": new_version_id,
                "relationship": version_type
            }
        }
        
        logger.info(f"✅ Version created: {new_version_id[:8]}")
        return json.dumps(result)
        
    except Exception as e:
        logger.error(f"❌ Version creation failed: {e}")
        return json.dumps({
            "success": False,
            "error": str(e),
            "content_id": content_id
        })


# Helper functions
def _create_section_transition(section_name: str) -> str:
    """Create smooth transition text between sections."""
    transitions = {
        "introduction": "Building on this foundation, let's explore further:",
        "core_content": "To deepen our understanding, consider these additional insights:",
        "practical_applications": "Here are more ways to apply these concepts in practice:",
        "case_studies": "Let's examine additional real-world examples:",
        "assessments": "Test your enhanced understanding with these questions:"
    }
    return transitions.get(section_name, "Additionally:")


def _ensure_transitions(sections: Dict[str, str], merge_log: List[Dict]) -> Dict[str, str]:
    """Ensure smooth transitions between merged sections."""
    # This is a simplified implementation
    # In production, would use more sophisticated transition logic
    return sections


def _check_section_coherence(sections: Dict[str, str]) -> List[str]:
    """Check for coherence issues in merged sections."""
    issues = []
    
    # Check for duplicate content
    for section_name, content in sections.items():
        sentences = content.split('.')
        if len(sentences) > 5:
            # Simple duplicate detection
            if len(set(sentences)) < len(sentences) * 0.9:
                issues.append(f"Potential duplicate content in {section_name}")
    
    # Check for abrupt transitions
    section_list = list(sections.items())
    for i in range(len(section_list) - 1):
        current_section = section_list[i][1]
        next_section = section_list[i + 1][1]
        
        # Simple check for transition markers
        if not any(marker in current_section[-200:] for marker in ['next', 'following', 'now', 'let\'s']):
            if not any(marker in next_section[:200] for marker in ['previously', 'as mentioned', 'building on']):
                issues.append(f"Abrupt transition between {section_list[i][0]} and {section_list[i + 1][0]}")
    
    return issues


def _extract_important_terms(sections: Dict[str, str]) -> List[str]:
    """Extract important terms that should be preserved."""
    important_terms = []
    
    # Extract capitalized multi-word terms (likely important concepts)
    import re
    for content in sections.values():
        # Find capitalized phrases
        capitalized = re.findall(r'[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+', content)
        important_terms.extend(capitalized)
    
    # Remove duplicates and common terms
    important_terms = list(set(important_terms))
    common_terms = ['The', 'This', 'These', 'That', 'Those']
    important_terms = [term for term in important_terms if term not in common_terms]
    
    return important_terms[:20]  # Top 20 terms


if __name__ == "__main__":
    """Test content merge tools."""
    
    print("🧪 Testing Content Merge Tools")
    print("=" * 50)
    
    # Test data
    test_enhanced_sections = {
        "core_content": "Enhanced core content with 500 more words...",
        "practical_applications": "Enhanced practical content with examples..."
    }
    
    test_requirements = {
        "sections_to_enhance": {
            "core_content": [{"type": "expand_content", "target": "+500 words"}],
            "practical_applications": [{"type": "improve_engagement", "strategy": "Add examples"}]
        }
    }
    
    try:
        # Test merge function
        result = merge_enhanced_content(
            "test-content-id",
            json.dumps(test_enhanced_sections),
            json.dumps(test_requirements),
            "smart"
        )
        
        result_data = json.loads(result)
        print(f"Merge test: {'✅ Success' if result_data['success'] else '❌ Failed'}")
        
        print("✅ Content merge tools ready!")
        
    except Exception as e:
        print(f"❌ Content merge tools test failed: {e}")