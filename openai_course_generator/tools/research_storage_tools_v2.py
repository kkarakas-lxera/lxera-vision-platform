"""
Research Agent Storage Tools V2

Properly configured storage tools for the Research Agent using @function_tool decorator.
"""

import os
import uuid
import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from supabase import create_client
from lxera_agents import function_tool

logger = logging.getLogger(__name__)

# Initialize Supabase client
SUPABASE_URL = 'https://xwfweumeryrgbguwrocr.supabase.co'
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZndldW1lcnlyZ2JndXdyb2NyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc2MzQ0MCwiZXhwIjoyMDY2MzM5NDQwfQ.qxXpBxUKhKA4AQT4UQnIEJGbGNrRDMbBroZU8YaypSY')
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

@function_tool
def store_research_results(plan_id: str, session_id: str, research_findings: str, content_library: str = None, module_mappings: str = None) -> str:
    """
    Store comprehensive research results in the cm_research_results table with findings, content library, and module mappings.
    
    Args:
        plan_id: UUID of the course plan this research belongs to
        session_id: Session identifier for this course generation
        research_findings: JSON string of comprehensive research findings organized by topic
        content_library: JSON string of organized library of content for course creation
        module_mappings: JSON string of mapping of research to course modules
        
    Returns:
        Success message with research_id
    """
    try:
        logger.info(f"📚 Storing research results for plan {plan_id}")
        
        # Parse JSON strings
        findings = json.loads(research_findings) if isinstance(research_findings, str) else research_findings
        library = json.loads(content_library) if content_library and isinstance(content_library, str) else content_library
        mappings = json.loads(module_mappings) if module_mappings and isinstance(module_mappings, str) else module_mappings
        
        # Generate unique research ID
        research_id = str(uuid.uuid4())
        
        # Extract metadata
        total_topics = len(findings.get('topics', []))
        total_sources = sum(len(topic.get('sources', [])) for topic in findings.get('topics', []))
        
        # Prepare research data
        research_data = {
            'research_id': research_id,
            'plan_id': plan_id,
            'session_id': session_id,
            'research_findings': findings,
            'content_library': library or {},
            'module_mappings': mappings or {},
            'total_topics': total_topics,
            'total_sources': total_sources,
            'research_agent_version': 'v2',
            'status': 'completed',
            'created_at': datetime.utcnow().isoformat()
        }
        
        # Insert into database
        result = supabase.table('cm_research_results').insert(research_data).execute()
        
        if result.data and len(result.data) > 0:
            logger.info(f"✅ Research results stored successfully with ID: {research_id}")
            return f"✅ Research results stored successfully with ID: {research_id}. Research phase completed for plan_id: {plan_id}."
        else:
            raise Exception("No data returned from insert")
            
    except Exception as e:
        logger.error(f"❌ Failed to store research results: {e}")
        raise Exception(f"Failed to store research results: {str(e)}")

@function_tool
def store_research_session(research_id: str, search_queries: str, sources_analyzed: str, synthesis_sessions: str = None, tool_calls: str = None, execution_metrics: str = None) -> str:
    """
    Store research agent session metadata and execution details.
    
    Args:
        research_id: UUID of the research results
        search_queries: JSON string of list of search queries executed
        sources_analyzed: JSON string of list of sources analyzed during research
        synthesis_sessions: JSON string of research synthesis sessions
        tool_calls: JSON string of list of tool calls made during research
        execution_metrics: JSON string of metrics about the research execution
        
    Returns:
        Success or failure message
    """
    try:
        logger.info(f"📊 Storing research session metadata for research {research_id}")
        
        # Parse JSON strings
        queries = json.loads(search_queries) if isinstance(search_queries, str) else search_queries
        sources = json.loads(sources_analyzed) if isinstance(sources_analyzed, str) else sources_analyzed
        sessions = json.loads(synthesis_sessions) if synthesis_sessions and isinstance(synthesis_sessions, str) else synthesis_sessions
        calls = json.loads(tool_calls) if tool_calls and isinstance(tool_calls, str) else tool_calls
        metrics = json.loads(execution_metrics) if execution_metrics and isinstance(execution_metrics, str) else execution_metrics
        
        # Update the research results with session metadata
        update_data = {
            'search_queries': queries,
            'sources_analyzed': sources,
            'synthesis_sessions': sessions,
            'tool_calls': calls,
            'execution_metrics': metrics,
            'updated_at': datetime.utcnow().isoformat()
        }
        
        result = supabase.table('cm_research_results').update(update_data).eq('research_id', research_id).execute()
        
        if result.data:
            logger.info("✅ Research session metadata stored successfully")
            return "✅ Research session metadata stored successfully"
        else:
            logger.warning("⚠️ No rows updated when storing session metadata")
            return "⚠️ No rows updated when storing session metadata"
            
    except Exception as e:
        logger.error(f"❌ Failed to store research session: {e}")
        return f"❌ Failed to store research session: {str(e)}"

# Export the tools
__all__ = ['store_research_results', 'store_research_session']