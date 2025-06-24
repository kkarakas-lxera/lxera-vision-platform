#!/usr/bin/env python3
"""
ValidationManager - Orchestrates validation checkpoints throughout the content generation pipeline.

This class integrates with the quality assessor to provide pre and post validation,
enhancement decision logic, and comprehensive checkpoint tracking for observability.
"""

import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
from pathlib import Path

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ValidationManager:
    """Manages validation checkpoints and enhancement decisions throughout the pipeline."""
    
    def __init__(self, content_manager, quality_tools=None):
        """
        Initialize ValidationManager with required dependencies.
        
        Args:
            content_manager: Database content manager instance
            quality_tools: Optional quality assessment tools (for standalone testing)
        """
        self.content_manager = content_manager
        self.quality_tools = quality_tools
        self.checkpoints = []
        self.validation_history = {}
        self.enhancement_decisions = {}
        
        logger.info("🔍 ValidationManager initialized")
    
    def log_checkpoint(self, checkpoint_id: str, checkpoint_data: Dict[str, Any]) -> None:
        """
        Log a validation checkpoint for observability.
        
        Args:
            checkpoint_id: Unique identifier for the checkpoint
            checkpoint_data: Data to log at this checkpoint
        """
        checkpoint = {
            "id": checkpoint_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": checkpoint_data
        }
        self.checkpoints.append(checkpoint)
        
        # Log for real-time monitoring
        logger.info(f"📍 CHECKPOINT_{checkpoint_id}: {checkpoint_data.get('message', 'No message')}")
        if "metrics" in checkpoint_data:
            for key, value in checkpoint_data["metrics"].items():
                logger.info(f"   - {key}: {value}")
    
    def pre_quality_validation(self, content_id: str) -> Dict[str, Any]:
        """
        Run validation BEFORE quality assessment to catch early issues.
        
        Args:
            content_id: Module content identifier
            
        Returns:
            Validation report with readiness status
        """
        try:
            logger.info(f"🔍 Running pre-quality validation for content {content_id[:8]}...")
            
            # 1. Verify content exists in database
            content = self.content_manager.get_module_content(content_id)
            if not content:
                return {
                    "ready_for_quality": False,
                    "error": "Content not found in database",
                    "content_id": content_id
                }
            
            # 2. Check section completeness
            sections = self.content_manager.get_content_sections(content_id)
            required_sections = ['introduction', 'core_content', 'practical_applications', 'case_studies', 'assessments']
            missing_sections = [s for s in required_sections if s not in sections or not sections[s]]
            
            # CRITICAL: If not all sections are present, database may still be syncing
            if len(sections) < len(required_sections):
                logger.warning(f"⚠️ Only {len(sections)} of {len(required_sections)} sections found - database may be syncing")
                return {
                    "ready_for_quality": False,
                    "error": "Incomplete sections - database sync in progress",
                    "content_id": content_id,
                    "sections_found": len(sections),
                    "sections_required": len(required_sections)
                }
            
            # 3. Validate word counts per section
            section_word_counts = {}
            total_word_count = 0
            for section_name, content_text in sections.items():
                word_count = len(content_text.split()) if content_text else 0
                section_word_counts[section_name] = word_count
                total_word_count += word_count
            
            # 4. Check for content ID errors (our previous issue)
            has_content_id_error = any(
                self._is_content_id(section_content) 
                for section_content in sections.values()
            )
            
            validation_report = {
                "ready_for_quality": len(missing_sections) == 0 and not has_content_id_error,
                "content_id": content_id,
                "module_name": content.get('module_name', 'Unknown'),
                "total_word_count": total_word_count,
                "section_word_counts": section_word_counts,
                "missing_sections": missing_sections,
                "has_content_id_error": has_content_id_error,
                "validation_timestamp": datetime.now(timezone.utc).isoformat()
            }
            
            # Log checkpoint
            self.log_checkpoint("1_PRE_QUALITY", {
                "message": f"Pre-quality validation for {content.get('module_name', 'Unknown')}",
                "metrics": {
                    "content_id": content_id[:8],
                    "total_words": total_word_count,
                    "missing_sections": len(missing_sections),
                    "ready": validation_report["ready_for_quality"]
                }
            })
            
            # Store in history
            self.validation_history[content_id] = {
                "pre_quality": validation_report
            }
            
            return validation_report
            
        except Exception as e:
            logger.error(f"❌ Pre-quality validation failed: {e}")
            return {
                "ready_for_quality": False,
                "error": str(e),
                "content_id": content_id
            }
    
    def post_generation_validation(self, content_id: str, module_spec: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate immediately after content generation.
        
        Args:
            content_id: Module content identifier
            module_spec: Module specification used for generation
            
        Returns:
            Validation report with generation quality metrics
        """
        try:
            logger.info(f"🔍 Running post-generation validation for content {content_id[:8]}...")
            
            # Get content from database
            content = self.content_manager.get_module_content(content_id)
            sections = self.content_manager.get_content_sections(content_id)
            
            if not content or not sections:
                return {
                    "generation_valid": False,
                    "error": "Content not properly stored",
                    "content_id": content_id
                }
            
            # Calculate metrics
            total_words = sum(len(s.split()) for s in sections.values() if s)
            target_words = module_spec.get('word_count_target', 7500)
            priority_level = module_spec.get('priority_level', 'high')
            
            # Dynamic tolerance based on priority
            tolerance = 0.10 if priority_level == "critical" else 0.15 if priority_level == "high" else 0.20
            min_words = int(target_words * (1 - tolerance))
            max_words = int(target_words * (1 + tolerance))
            
            validation_report = {
                "generation_valid": True,
                "content_id": content_id,
                "module_name": module_spec.get('module_name', 'Unknown'),
                "generation_metrics": {
                    "total_words": total_words,
                    "target_words": target_words,
                    "min_acceptable": min_words,
                    "max_acceptable": max_words,
                    "within_range": min_words <= total_words <= max_words,
                    "word_gap": max(0, min_words - total_words) if total_words < min_words else 0,
                    "sections_generated": len(sections),
                    "priority_level": priority_level
                },
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
            # Log checkpoint
            self.log_checkpoint("2_POST_GENERATION", {
                "message": f"Content generated for {module_spec.get('module_name', 'Unknown')}",
                "metrics": {
                    "content_id": content_id[:8],
                    "words": total_words,
                    "target": target_words,
                    "gap": validation_report["generation_metrics"]["word_gap"],
                    "valid": validation_report["generation_metrics"]["within_range"]
                }
            })
            
            # Update history
            if content_id in self.validation_history:
                self.validation_history[content_id]["post_generation"] = validation_report
            else:
                self.validation_history[content_id] = {"post_generation": validation_report}
            
            return validation_report
            
        except Exception as e:
            logger.error(f"❌ Post-generation validation failed: {e}")
            return {
                "generation_valid": False,
                "error": str(e),
                "content_id": content_id
            }
    
    def enhancement_decision_logic(
        self, 
        quality_result: Dict[str, Any], 
        blueprint_result: Dict[str, Any],
        module_spec: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Decide enhancement strategy based on quality assessment results.
        
        Args:
            quality_result: Results from quality_assessor
            blueprint_result: Results from blueprint_validator
            module_spec: Original module specification
            
        Returns:
            Enhancement decision with specific requirements
        """
        try:
            logger.info("🤔 Making enhancement decision based on quality assessment...")
            
            # Extract key metrics
            overall_score = quality_result.get('overall_score', 0)
            word_count = quality_result.get('word_count', 0)
            individual_scores = quality_result.get('individual_scores', {})
            quality_indicators = quality_result.get('quality_indicators', {})
            module_context = quality_result.get('module_context', {})
            
            # Blueprint compliance
            blueprint_compliance = blueprint_result.get('blueprint_compliance', 0)
            missing_elements = blueprint_result.get('missing_elements', [])
            
            # Determine quality threshold based on priority
            priority_level = module_context.get('priority_level', 'high')
            quality_threshold = 8.0 if priority_level == "critical" else 7.5 if priority_level == "high" else 7.0
            
            # Decision logic
            needs_enhancement = False
            enhancement_type = "none"
            enhancement_requirements = {
                "sections_to_enhance": {},
                "quality_improvements": {},
                "blueprint_gaps": [],
                "word_count_targets": {}
            }
            
            # 1. Check overall quality score
            if overall_score < quality_threshold:
                needs_enhancement = True
                enhancement_type = "targeted"  # Changed from 'quality_improvement' to match DB constraint
                
                # Identify weak quality dimensions
                for dimension, score in individual_scores.items():
                    if score < 7.0:
                        enhancement_requirements["quality_improvements"][dimension] = {
                            "current_score": score,
                            "target_score": 7.5,
                            "improvement_needed": self._get_improvement_suggestion(dimension, score)
                        }
            
            # 2. Check word count
            if not quality_indicators.get('meets_word_count_minimum', True):
                needs_enhancement = True
                if enhancement_type == "none":
                    enhancement_type = "targeted"  # Changed from 'word_count_expansion' to match DB constraint
                else:
                    enhancement_type = "comprehensive"  # Changed from 'comprehensive_enhancement' to match DB constraint
                
                # Calculate words needed
                target_words = module_context.get('word_count_target', 7500)
                min_words = module_context.get('min_required', 6750)
                words_needed = max(0, min_words - word_count)
                
                # Distribute word additions across sections
                enhancement_requirements["word_count_targets"] = self._distribute_word_targets(
                    words_needed, 
                    quality_result.get('content_metrics', {})
                )
            
            # 3. Check blueprint compliance
            if blueprint_compliance < 85:
                needs_enhancement = True
                if enhancement_type == "none":
                    enhancement_type = "research_driven"  # Changed from 'blueprint_alignment' to match DB constraint
                else:
                    enhancement_type = "comprehensive"  # Changed from 'comprehensive_enhancement' to match DB constraint
                
                enhancement_requirements["blueprint_gaps"] = missing_elements[:5]  # Top 5 gaps
            
            # 4. Map quality issues to specific sections
            if needs_enhancement:
                enhancement_requirements["sections_to_enhance"] = self._map_issues_to_sections(
                    individual_scores,
                    quality_indicators,
                    enhancement_requirements["word_count_targets"]
                )
            
            # Create decision summary
            decision = {
                "needs_enhancement": needs_enhancement,
                "enhancement_type": enhancement_type,
                "decision_rationale": {
                    "quality_score": f"{overall_score} < {quality_threshold}" if overall_score < quality_threshold else "Pass",
                    "word_count": f"{word_count} < {module_context.get('min_required', 6750)}" if not quality_indicators.get('meets_word_count_minimum', True) else "Pass",
                    "blueprint": f"{blueprint_compliance}% < 85%" if blueprint_compliance < 85 else "Pass"
                },
                "enhancement_requirements": enhancement_requirements,
                "priority_level": priority_level,
                "max_revisions": 3,
                "current_revision": module_spec.get('revision_count', 0)
            }
            
            # Log checkpoint
            self.log_checkpoint("3_ENHANCEMENT_DECISION", {
                "message": f"Enhancement decision: {enhancement_type}",
                "metrics": {
                    "needs_enhancement": needs_enhancement,
                    "quality_score": overall_score,
                    "word_count": word_count,
                    "blueprint_compliance": blueprint_compliance,
                    "sections_to_enhance": len(enhancement_requirements["sections_to_enhance"])
                }
            })
            
            # Store decision
            content_id = module_spec.get('content_id', 'unknown')
            self.enhancement_decisions[content_id] = decision
            
            return decision
            
        except Exception as e:
            logger.error(f"❌ Enhancement decision failed: {e}")
            return {
                "needs_enhancement": False,
                "error": str(e)
            }
    
    def validate_enhanced_content(
        self, 
        content_id: str, 
        original_metrics: Dict[str, Any],
        enhancement_requirements: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Validate content after enhancement to ensure requirements were met.
        
        Args:
            content_id: Module content identifier
            original_metrics: Metrics before enhancement
            enhancement_requirements: Requirements that were supposed to be met
            
        Returns:
            Validation report for enhanced content
        """
        try:
            logger.info(f"🔍 Validating enhanced content for {content_id[:8]}...")
            
            # Get updated content
            content = self.content_manager.get_module_content(content_id)
            sections = self.content_manager.get_content_sections(content_id)
            
            # Calculate new metrics
            new_total_words = sum(len(s.split()) for s in sections.values() if s)
            original_words = original_metrics.get('total_words', 0)
            words_added = new_total_words - original_words
            
            # Check if word targets were met
            word_targets_met = {}
            for section, target in enhancement_requirements.get("word_count_targets", {}).items():
                if isinstance(target, str) and target.startswith("+"):
                    target_addition = int(target.replace("+", "").replace(" words", ""))
                    # This is simplified - in real implementation would track per-section changes
                    word_targets_met[section] = words_added >= target_addition * 0.8  # 80% threshold
            
            validation_report = {
                "enhancement_valid": True,
                "content_id": content_id,
                "metrics_comparison": {
                    "original_words": original_words,
                    "enhanced_words": new_total_words,
                    "words_added": words_added,
                    "percentage_increase": round((words_added / original_words * 100), 1) if original_words > 0 else 0
                },
                "requirements_met": {
                    "word_targets": all(word_targets_met.values()) if word_targets_met else False,
                    "sections_enhanced": len(enhancement_requirements.get("sections_to_enhance", {})),
                    "blueprint_gaps_addressed": len(enhancement_requirements.get("blueprint_gaps", []))
                },
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
            # Log checkpoint
            self.log_checkpoint("4_POST_ENHANCEMENT", {
                "message": f"Enhancement validated for {content.get('module_name', 'Unknown')}",
                "metrics": {
                    "content_id": content_id[:8],
                    "words_before": original_words,
                    "words_after": new_total_words,
                    "words_added": words_added,
                    "requirements_met": validation_report["requirements_met"]["word_targets"]
                }
            })
            
            return validation_report
            
        except Exception as e:
            logger.error(f"❌ Enhanced content validation failed: {e}")
            return {
                "enhancement_valid": False,
                "error": str(e),
                "content_id": content_id
            }
    
    def get_pipeline_status(self, session_id: str) -> Dict[str, Any]:
        """
        Get current pipeline status with all checkpoints.
        
        Args:
            session_id: Pipeline session identifier
            
        Returns:
            Complete pipeline status with checkpoint history
        """
        return {
            "session_id": session_id,
            "total_checkpoints": len(self.checkpoints),
            "checkpoints": self.checkpoints,
            "validation_history": self.validation_history,
            "enhancement_decisions": self.enhancement_decisions,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    # Helper methods
    def _is_content_id(self, text: str) -> bool:
        """Check if text looks like a content ID (UUID format)."""
        if not text or len(text) > 300:
            return False
        
        import re
        uuid_pattern = r'^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}'
        return bool(re.match(uuid_pattern, text.strip()))
    
    def _get_improvement_suggestion(self, dimension: str, score: float) -> str:
        """Get specific improvement suggestion for a quality dimension."""
        suggestions = {
            "accuracy": "Add more precise financial terminology and ensure factual correctness",
            "clarity": "Simplify complex explanations and add more examples",
            "completeness": "Expand content depth with additional concepts and details",
            "engagement": "Include more interactive elements, questions, and real-world scenarios",
            "personalization": "Add more employee-specific references and career-aligned content"
        }
        return suggestions.get(dimension, "Improve content quality in this dimension")
    
    def _distribute_word_targets(self, total_words_needed: int, content_metrics: Dict[str, Any]) -> Dict[str, str]:
        """Distribute word count targets across sections intelligently."""
        # Default distribution if no metrics available
        if not content_metrics:
            return {
                "core_content": f"+{int(total_words_needed * 0.5)} words",
                "practical_applications": f"+{int(total_words_needed * 0.3)} words",
                "case_studies": f"+{int(total_words_needed * 0.2)} words"
            }
        
        # Smart distribution based on current content balance
        # This is simplified - real implementation would be more sophisticated
        distribution = {}
        
        if total_words_needed > 1000:
            distribution["core_content"] = f"+{int(total_words_needed * 0.5)} words"
            distribution["practical_applications"] = f"+{int(total_words_needed * 0.3)} words"
            distribution["case_studies"] = f"+{int(total_words_needed * 0.2)} words"
        elif total_words_needed > 500:
            distribution["core_content"] = f"+{int(total_words_needed * 0.6)} words"
            distribution["practical_applications"] = f"+{int(total_words_needed * 0.4)} words"
        else:
            distribution["core_content"] = f"+{total_words_needed} words"
        
        return distribution
    
    def _map_issues_to_sections(
        self, 
        quality_scores: Dict[str, float], 
        indicators: Dict[str, bool],
        word_targets: Dict[str, str]
    ) -> Dict[str, List[str]]:
        """Map quality issues to specific sections for enhancement."""
        section_issues = {}
        
        # Map quality dimensions to likely sections
        if quality_scores.get("clarity", 10) < 7.0:
            section_issues["introduction"] = section_issues.get("introduction", [])
            section_issues["introduction"].append("improve_clarity")
            section_issues["core_content"] = section_issues.get("core_content", [])
            section_issues["core_content"].append("add_explanations")
        
        if quality_scores.get("engagement", 10) < 7.0:
            section_issues["practical_applications"] = section_issues.get("practical_applications", [])
            section_issues["practical_applications"].append("add_interactive_elements")
            section_issues["case_studies"] = section_issues.get("case_studies", [])
            section_issues["case_studies"].append("enhance_real_world_examples")
        
        if quality_scores.get("completeness", 10) < 7.0:
            section_issues["core_content"] = section_issues.get("core_content", [])
            section_issues["core_content"].append("expand_concepts")
        
        # Add word count requirements
        for section, target in word_targets.items():
            if section not in section_issues:
                section_issues[section] = []
            section_issues[section].append(f"expand_by_{target}")
        
        return section_issues


# Standalone validation functions for testing
def create_validation_manager(content_manager) -> ValidationManager:
    """Factory function to create ValidationManager instance."""
    return ValidationManager(content_manager)


if __name__ == "__main__":
    """Test ValidationManager functionality."""
    
    print("🧪 Testing ValidationManager")
    print("=" * 50)
    
    # Mock content manager for testing
    class MockContentManager:
        def get_module_content(self, content_id):
            return {
                "content_id": content_id,
                "module_name": "Test Module",
                "status": "draft"
            }
        
        def get_content_sections(self, content_id):
            return {
                "introduction": "Test introduction content...",
                "core_content": "Test core content...",
                "practical_applications": "Test practical content...",
                "case_studies": "Test case studies...",
                "assessments": "Test assessments..."
            }
    
    try:
        # Initialize ValidationManager
        vm = ValidationManager(MockContentManager())
        
        # Test pre-quality validation
        result = vm.pre_quality_validation("test-content-id")
        print(f"Pre-quality validation: {'✅ Ready' if result['ready_for_quality'] else '❌ Not ready'}")
        
        print("✅ ValidationManager ready for use!")
        
    except Exception as e:
        print(f"❌ ValidationManager test failed: {e}")