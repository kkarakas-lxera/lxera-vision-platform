#!/usr/bin/env python3
"""
Content Monitoring Utilities

Provides comprehensive monitoring at all content handoff points to track
word counts, content integrity, and prevent corruption during pipeline execution.
"""

import json
import logging
import time
from datetime import datetime
from typing import Dict, Any, List, Optional
try:
    from utils.word_count_utils import standardized_word_count, count_module_words
except ImportError:
    # Handle running from utils directory
    from word_count_utils import standardized_word_count, count_module_words

logger = logging.getLogger(__name__)

class ContentHandoffMonitor:
    """Monitor content integrity at all handoff points."""
    
    def __init__(self):
        self.handoffs = []
        self.current_session = None
        
    def start_session(self, session_id: str, description: str):
        """Start a new monitoring session."""
        self.current_session = {
            "session_id": session_id,
            "description": description,
            "start_time": datetime.now().isoformat(),
            "handoffs": []
        }
        logger.info(f"📊 MONITORING SESSION STARTED: {session_id} - {description}")
        
    def monitor_handoff(
        self,
        from_agent: str,
        to_agent: str,
        content_id: str,
        content_preview: str = None,
        metadata: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Monitor a content handoff between agents.
        
        Args:
            from_agent: Source agent name
            to_agent: Destination agent name  
            content_id: Content identifier being passed
            content_preview: Preview of content (first 200 chars)
            metadata: Additional handoff metadata
            
        Returns:
            Handoff monitoring result
        """
        handoff_id = f"handoff_{len(self.handoffs) + 1}_{int(time.time())}"
        
        handoff_data = {
            "handoff_id": handoff_id,
            "timestamp": datetime.now().isoformat(),
            "from_agent": from_agent,
            "to_agent": to_agent,
            "content_id": content_id,
            "content_preview": content_preview[:200] if content_preview else None,
            "metadata": metadata or {},
            "validation_status": "pending"
        }
        
        # Validate content_id format
        validation_result = self._validate_content_handoff(content_id, content_preview)
        handoff_data["validation_status"] = validation_result["status"]
        handoff_data["validation_details"] = validation_result["details"]
        
        if self.current_session:
            self.current_session["handoffs"].append(handoff_data)
        self.handoffs.append(handoff_data)
        
        # Log handoff with status
        status_emoji = "✅" if validation_result["status"] == "valid" else "⚠️" if validation_result["status"] == "warning" else "❌"
        logger.info(f"{status_emoji} HANDOFF: {from_agent} → {to_agent} | ID: {content_id[:8]} | {validation_result['status'].upper()}")
        
        if validation_result["status"] == "error":
            logger.error(f"   HANDOFF ERROR: {validation_result['details']['error_reason']}")
        elif validation_result["status"] == "warning":
            logger.warning(f"   HANDOFF WARNING: {validation_result['details']['warning_reason']}")
            
        return handoff_data
        
    def _validate_content_handoff(self, content_id: str, content_preview: str = None) -> Dict[str, Any]:
        """Validate content handoff for integrity."""
        
        # Check 1: Content ID format validation
        import uuid
        try:
            uuid.UUID(content_id)
            content_id_valid = True
        except ValueError:
            return {
                "status": "error",
                "details": {
                    "error_reason": f"Invalid content_id format: {content_id}",
                    "corruption_detected": content_id in ["1234", "12345", "test", "demo", "", None]
                }
            }
        
        # Check 2: Content preview validation (if provided)
        warnings = []
        if content_preview:
            # Check for error indicators
            if any(indicator in content_preview.lower() for indicator in ["error", "failed", "corruption"]):
                warnings.append("Content preview contains error indicators")
            
            # Check for suspiciously short content
            if len(content_preview.strip()) < 50:
                warnings.append("Content preview is very short")
                
            # Check for content_id in preview (indicates content/ID confusion)
            if content_id[:8] in content_preview:
                warnings.append("Content ID found in content preview - possible content/ID confusion")
        
        if warnings:
            return {
                "status": "warning",
                "details": {
                    "warning_reason": "; ".join(warnings),
                    "warnings": warnings
                }
            }
        
        return {
            "status": "valid",
            "details": {
                "content_id_format": "valid_uuid",
                "preview_length": len(content_preview) if content_preview else 0
            }
        }
    
    def monitor_content_integrity(
        self,
        content_id: str,
        content_data: Dict[str, Any],
        checkpoint_name: str,
        agent_name: str = None
    ) -> Dict[str, Any]:
        """
        Monitor content integrity at specific checkpoints.
        
        Args:
            content_id: Content identifier
            content_data: Full content data structure
            checkpoint_name: Name of checkpoint (e.g., "after_generation", "before_enhancement")
            agent_name: Agent performing the checkpoint
            
        Returns:
            Integrity monitoring result
        """
        checkpoint_id = f"checkpoint_{checkpoint_name}_{int(time.time())}"
        
        # Analyze content structure and word counts
        integrity_analysis = self._analyze_content_integrity(content_data)
        
        checkpoint_data = {
            "checkpoint_id": checkpoint_id,
            "timestamp": datetime.now().isoformat(),
            "content_id": content_id,
            "checkpoint_name": checkpoint_name,
            "agent_name": agent_name,
            "integrity_analysis": integrity_analysis,
            "status": integrity_analysis["overall_status"]
        }
        
        # Log checkpoint with detailed analysis
        status_emoji = "✅" if integrity_analysis["overall_status"] == "healthy" else "⚠️" if integrity_analysis["overall_status"] == "warning" else "❌"
        total_words = integrity_analysis["word_analysis"]["total_words"]
        section_count = integrity_analysis["structure_analysis"]["sections_count"]
        
        logger.info(f"{status_emoji} CHECKPOINT: {checkpoint_name} | ID: {content_id[:8]} | {total_words} words, {section_count} sections")
        
        if integrity_analysis["overall_status"] == "error":
            for issue in integrity_analysis["critical_issues"]:
                logger.error(f"   CRITICAL: {issue}")
        elif integrity_analysis["overall_status"] == "warning":
            for warning in integrity_analysis["warnings"]:
                logger.warning(f"   WARNING: {warning}")
                
        return checkpoint_data
    
    def _analyze_content_integrity(self, content_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze content for integrity issues."""
        
        analysis = {
            "overall_status": "healthy",
            "critical_issues": [],
            "warnings": [],
            "word_analysis": {},
            "structure_analysis": {},
            "quality_indicators": {}
        }
        
        try:
            # Word count analysis
            word_result = count_module_words(content_data)
            analysis["word_analysis"] = word_result
            
            # Structure analysis
            sections = content_data.get("sections", {})
            analysis["structure_analysis"] = {
                "sections_count": len(sections),
                "sections_present": list(sections.keys()),
                "empty_sections": [name for name, content in sections.items() if not content or len(str(content).strip()) < 50]
            }
            
            # Critical issue detection
            if word_result["total_words"] < 100:
                analysis["critical_issues"].append(f"Extremely low word count: {word_result['total_words']}")
                analysis["overall_status"] = "error"
            
            if len(sections) == 0:
                analysis["critical_issues"].append("No content sections found")
                analysis["overall_status"] = "error"
            
            if len(analysis["structure_analysis"]["empty_sections"]) > 2:
                analysis["critical_issues"].append(f"Too many empty sections: {analysis['structure_analysis']['empty_sections']}")
                analysis["overall_status"] = "error"
            
            # Warning detection
            if word_result["total_words"] < 1000:
                analysis["warnings"].append(f"Low word count: {word_result['total_words']}")
                if analysis["overall_status"] == "healthy":
                    analysis["overall_status"] = "warning"
            
            if len(analysis["structure_analysis"]["empty_sections"]) > 0:
                analysis["warnings"].append(f"Empty sections detected: {analysis['structure_analysis']['empty_sections']}")
                if analysis["overall_status"] == "healthy":
                    analysis["overall_status"] = "warning"
            
            # Quality indicators
            analysis["quality_indicators"] = {
                "word_distribution_balance": self._calculate_word_distribution_balance(word_result),
                "content_density": word_result["total_words"] / len(sections) if sections else 0,
                "structure_completeness": len(sections) >= 4  # Expected: intro, core, practical, assessments
            }
            
        except Exception as e:
            analysis["critical_issues"].append(f"Content analysis failed: {str(e)}")
            analysis["overall_status"] = "error"
            
        return analysis
    
    def _calculate_word_distribution_balance(self, word_result: Dict[str, Any]) -> float:
        """Calculate how balanced the word distribution is across sections."""
        section_counts = word_result.get("section_breakdown", {})
        if len(section_counts) < 2:
            return 0.0
            
        counts = list(section_counts.values())
        mean_count = sum(counts) / len(counts)
        variance = sum((count - mean_count) ** 2 for count in counts) / len(counts)
        coefficient_of_variation = (variance ** 0.5) / mean_count if mean_count > 0 else 0
        
        # Convert to balance score (lower variation = higher balance)
        balance_score = max(0, 1 - coefficient_of_variation)
        return balance_score
    
    def get_session_summary(self) -> Dict[str, Any]:
        """Get summary of current monitoring session."""
        if not self.current_session:
            return {"error": "No active monitoring session"}
            
        handoffs = self.current_session["handoffs"]
        
        summary = {
            "session_id": self.current_session["session_id"],
            "description": self.current_session["description"],
            "start_time": self.current_session["start_time"],
            "duration": (datetime.now() - datetime.fromisoformat(self.current_session["start_time"])).total_seconds(),
            "total_handoffs": len(handoffs),
            "handoff_status_breakdown": {
                "valid": len([h for h in handoffs if h["validation_status"] == "valid"]),
                "warning": len([h for h in handoffs if h["validation_status"] == "warning"]),
                "error": len([h for h in handoffs if h["validation_status"] == "error"])
            },
            "agent_activity": self._summarize_agent_activity(handoffs)
        }
        
        return summary
    
    def _summarize_agent_activity(self, handoffs: List[Dict]) -> Dict[str, Any]:
        """Summarize agent activity from handoffs."""
        activity = {}
        
        for handoff in handoffs:
            from_agent = handoff["from_agent"]
            to_agent = handoff["to_agent"]
            
            if from_agent not in activity:
                activity[from_agent] = {"handoffs_out": 0, "handoffs_in": 0}
            if to_agent not in activity:
                activity[to_agent] = {"handoffs_out": 0, "handoffs_in": 0}
                
            activity[from_agent]["handoffs_out"] += 1
            activity[to_agent]["handoffs_in"] += 1
        
        return activity

# Global monitor instance
content_monitor = ContentHandoffMonitor()

def start_monitoring_session(session_id: str, description: str):
    """Start a new content monitoring session."""
    content_monitor.start_session(session_id, description)

def monitor_handoff(from_agent: str, to_agent: str, content_id: str, content_preview: str = None, metadata: Dict[str, Any] = None):
    """Monitor a content handoff between agents."""
    return content_monitor.monitor_handoff(from_agent, to_agent, content_id, content_preview, metadata)

def monitor_content_integrity(content_id: str, content_data: Dict[str, Any], checkpoint_name: str, agent_name: str = None):
    """Monitor content integrity at specific checkpoints.""" 
    return content_monitor.monitor_content_integrity(content_id, content_data, checkpoint_name, agent_name)

def get_monitoring_summary():
    """Get summary of current monitoring session."""
    return content_monitor.get_session_summary()

if __name__ == "__main__":
    """Test content monitoring utilities."""
    
    print("🧪 Testing Content Monitoring Utilities")
    print("=" * 50)
    
    # Test monitoring session
    start_monitoring_session("test_session_123", "Testing content monitoring system")
    
    # Test handoff monitoring
    test_content_id = "59a9357f-4927-4e71-beba-1c5937ac75f3"
    handoff_result = monitor_handoff("Planning Agent", "Content Agent", test_content_id, "This is test content for validation...")
    print(f"Handoff result: {handoff_result['validation_status']}")
    
    # Test content integrity monitoring
    test_content = {
        "sections": {
            "introduction": "This is a test introduction with sufficient content length for validation purposes.",
            "core_content": "This is the core content section with detailed information and comprehensive coverage of the topic."
        }
    }
    
    integrity_result = monitor_content_integrity(test_content_id, test_content, "test_checkpoint", "Test Agent")
    print(f"Integrity status: {integrity_result['status']}")
    
    # Test session summary
    summary = get_monitoring_summary()
    print(f"Session summary: {summary}")
    
    print("✅ Content monitoring utilities ready!")