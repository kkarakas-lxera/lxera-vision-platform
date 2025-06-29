"""
OpenAI tracing utilities for the Lxera Agent Pipeline API.

Provides utilities for extracting and managing OpenAI trace information
from agent executions.
"""

import logging
import re
from typing import Any, Dict, Optional
from datetime import datetime

from api.models.responses import TraceInfo

logger = logging.getLogger(__name__)


def extract_trace_info(result: Any, agent_type: str, session_id: str) -> TraceInfo:
    """
    Extract OpenAI trace information from agent execution result.
    
    Args:
        result: Agent execution result from Runner.run()
        agent_type: Type of agent (planning, research, content)
        session_id: Session identifier
        
    Returns:
        TraceInfo object with trace details
    """
    try:
        # Try to extract trace URL from result
        trace_url = _extract_trace_url(result)
        trace_id = _extract_trace_id(trace_url) if trace_url else None
        
        # If no trace URL found, create a placeholder
        if not trace_url:
            # Generate expected trace URL pattern
            # Note: This is a placeholder - actual trace URLs come from OpenAI
            trace_url = f"https://platform.openai.com/traces/{agent_type}_{session_id}"
            logger.warning(f"No trace URL found in result, using placeholder: {trace_url}")
        
        return TraceInfo(
            openai_trace_url=trace_url,
            visible_in_traces=True,
            trace_id=trace_id
        )
        
    except Exception as e:
        logger.error(f"Failed to extract trace info: {e}")
        
        # Return basic trace info even if extraction fails
        return TraceInfo(
            openai_trace_url=None,
            visible_in_traces=True,
            trace_id=None
        )


def _extract_trace_url(result: Any) -> Optional[str]:
    """
    Extract trace URL from agent execution result.
    
    The actual implementation depends on how the OpenAI SDK
    provides trace information in the result object.
    """
    try:
        # Method 1: Check if result has trace information directly
        if hasattr(result, 'trace_url'):
            return result.trace_url
        
        if hasattr(result, 'metadata') and isinstance(result.metadata, dict):
            if 'trace_url' in result.metadata:
                return result.metadata['trace_url']
        
        # Method 2: Check if it's in the result dict
        if isinstance(result, dict):
            if 'trace_url' in result:
                return result['trace_url']
            
            if 'metadata' in result and isinstance(result['metadata'], dict):
                if 'trace_url' in result['metadata']:
                    return result['metadata']['trace_url']
        
        # Method 3: Try to extract from response headers or content
        # This would need to be implemented based on actual OpenAI SDK behavior
        
        logger.debug("No trace URL found in result")
        return None
        
    except Exception as e:
        logger.error(f"Error extracting trace URL: {e}")
        return None


def _extract_trace_id(trace_url: str) -> Optional[str]:
    """Extract trace ID from trace URL."""
    try:
        if not trace_url:
            return None
        
        # Extract trace ID from URL pattern
        # Example: https://platform.openai.com/traces/tr_abc123
        match = re.search(r'/traces/([^/\?]+)', trace_url)
        if match:
            return match.group(1)
        
        return None
        
    except Exception as e:
        logger.error(f"Error extracting trace ID: {e}")
        return None


def create_trace_context(agent_type: str, session_id: str) -> str:
    """
    Create trace context string for agent execution.
    
    This is used with the lxera_agents trace context manager.
    
    Args:
        agent_type: Type of agent (planning, research, content)
        session_id: Session identifier
        
    Returns:
        Trace context string
    """
    timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
    return f"{agent_type}_{session_id}_{timestamp}"


def log_trace_started(agent_type: str, session_id: str, trace_context: str):
    """Log that trace has started for an agent execution."""
    logger.info(
        f"🔍 OpenAI trace started: {trace_context} "
        f"(agent: {agent_type}, session: {session_id})"
    )


def log_trace_completed(
    agent_type: str, 
    session_id: str, 
    trace_context: str, 
    trace_url: Optional[str] = None
):
    """Log that trace has completed for an agent execution."""
    if trace_url:
        logger.info(
            f"✅ OpenAI trace completed: {trace_context} "
            f"(agent: {agent_type}, session: {session_id}, url: {trace_url})"
        )
    else:
        logger.info(
            f"✅ OpenAI trace completed: {trace_context} "
            f"(agent: {agent_type}, session: {session_id})"
        )


def get_trace_dashboard_url(company_id: str) -> str:
    """
    Get URL for OpenAI traces dashboard for a company.
    
    Args:
        company_id: Company identifier
        
    Returns:
        URL to OpenAI traces dashboard
    """
    # This would be the actual OpenAI dashboard URL
    # The exact format depends on OpenAI's implementation
    return f"https://platform.openai.com/traces?filter=company:{company_id}"


def format_trace_summary(trace_info: TraceInfo, agent_type: str, execution_time: float) -> Dict[str, Any]:
    """
    Format trace information for response inclusion.
    
    Args:
        trace_info: TraceInfo object
        agent_type: Type of agent
        execution_time: Execution time in seconds
        
    Returns:
        Formatted trace summary
    """
    return {
        "trace_url": trace_info.openai_trace_url,
        "trace_id": trace_info.trace_id,
        "agent_type": agent_type,
        "execution_time_seconds": execution_time,
        "visible_in_traces": trace_info.visible_in_traces,
        "dashboard_note": "All tool calls and agent interactions are visible in OpenAI traces"
    }


# Context manager for trace logging
class TraceLogger:
    """Context manager for logging trace information."""
    
    def __init__(self, agent_type: str, session_id: str):
        self.agent_type = agent_type
        self.session_id = session_id
        self.trace_context = create_trace_context(agent_type, session_id)
        self.start_time = None
    
    def __enter__(self):
        self.start_time = datetime.utcnow()
        log_trace_started(self.agent_type, self.session_id, self.trace_context)
        return self.trace_context
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        execution_time = (datetime.utcnow() - self.start_time).total_seconds()
        
        if exc_type is None:
            log_trace_completed(self.agent_type, self.session_id, self.trace_context)
            logger.info(f"⏱️ Trace execution time: {execution_time:.2f}s")
        else:
            logger.error(
                f"❌ Trace failed: {self.trace_context} "
                f"(agent: {self.agent_type}, session: {self.session_id}, "
                f"error: {exc_type.__name__}: {exc_val})"
            )


# Example usage functions
def trace_planning_execution(session_id: str):
    """Create trace logger for planning execution."""
    return TraceLogger("planning", session_id)


def trace_research_execution(session_id: str):
    """Create trace logger for research execution."""
    return TraceLogger("research", session_id)


def trace_content_execution(session_id: str):
    """Create trace logger for content execution."""
    return TraceLogger("content", session_id)