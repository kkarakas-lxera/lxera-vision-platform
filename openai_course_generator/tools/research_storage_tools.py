"""
Research Agent Storage Tools

Tools for storing research agent outputs in the database.
"""

import os
import uuid
import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from supabase import create_client
from agents import function_tool

logger = logging.getLogger(__name__)

# Initialize Supabase client
SUPABASE_URL = 'https://xwfweumeryrgbguwrocr.supabase.co'
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZndldW1lcnlyZ2JndXdyb2NyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc2MzQ0MCwiZXhwIjoyMDY2MzM5NDQwfQ.qxXpBxUKhKA4AQT4UQnIEJGbGNrRDMbBroZU8YaypSY')
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

@function_tool
def store_research_results(
    session_id: str,
    content_id: str,
    research_findings: Dict[str, Any],
    sources: List[Dict[str, Any]],
    synthesis: str
) -> str:
    """
    Store research results in the cm_research_sessions table.
    
    Args:
        session_id: Session identifier for this course generation
        content_id: UUID of the associated module content
        research_findings: Dictionary of research findings by topic
        sources: List of source documents with metadata
        synthesis: Synthesized summary of all research
        
    Returns:
        research_id: UUID of the created research session
    """
    try:
        logger.info(f"📚 Storing research results for session {session_id}")
        
        # Prepare research data
        research_data = {
            'session_id': session_id,
            'content_id': content_id,
            'research_type': 'comprehensive',
            'research_status': 'completed',
            'research_findings': research_findings,
            'sources_metadata': sources,
            'synthesis_result': synthesis,
            'total_sources': len(sources),
            'research_agent_version': 'v1'
        }
        
        # Insert into database
        result = supabase.table('cm_research_sessions').insert(research_data).execute()
        
        if result.data and len(result.data) > 0:
            research_id = result.data[0]['research_id']
            logger.info(f"✅ Research results stored successfully with ID: {research_id}")
            return research_id
        else:
            raise Exception("No data returned from insert")
            
    except Exception as e:
        logger.error(f"❌ Failed to store research results: {e}")
        raise Exception(f"Failed to store research results: {str(e)}")

@function_tool
def store_research_session(
    research_id: str,
    search_queries: List[str],
    tool_calls: List[Dict[str, Any]],
    execution_time: float
) -> bool:
    """
    Store research session metadata and execution details.
    
    Args:
        research_id: UUID of the research session
        search_queries: List of search queries executed
        tool_calls: List of tool calls made during research
        execution_time: Time taken for research in seconds
        
    Returns:
        success: Boolean indicating if metadata was stored successfully
    """
    try:
        logger.info(f"📊 Storing research session metadata for {research_id}")
        
        # Update the research session with metadata
        update_data = {
            'search_queries': search_queries,
            'tool_execution_log': tool_calls,
            'execution_time_seconds': execution_time,
            'research_completed_at': datetime.utcnow().isoformat()
        }
        
        result = supabase.table('cm_research_sessions').update(update_data).eq('research_id', research_id).execute()
        
        if result.data:
            logger.info("✅ Research session metadata stored successfully")
            return True
        else:
            logger.warning("⚠️ No rows updated when storing metadata")
            return False
            
    except Exception as e:
        logger.error(f"❌ Failed to store research session metadata: {e}")
        return False

@function_tool
def store_research_source(
    research_id: str,
    source_url: str,
    source_title: str,
    source_content: str,
    relevance_score: float
) -> bool:
    """
    Store individual research source details.
    
    Args:
        research_id: UUID of the research session
        source_url: URL of the source
        source_title: Title of the source document
        source_content: Extracted content from the source
        relevance_score: Relevance score (0-1) for the source
        
    Returns:
        success: Boolean indicating if source was stored successfully
    """
    try:
        logger.info(f"🔗 Storing research source: {source_title}")
        
        # Get existing sources
        result = supabase.table('cm_research_sessions').select('sources_metadata').eq('research_id', research_id).single().execute()
        
        if result.data:
            sources = result.data.get('sources_metadata', [])
            
            # Add new source
            sources.append({
                'url': source_url,
                'title': source_title,
                'content_preview': source_content[:500] if source_content else '',
                'relevance_score': relevance_score,
                'added_at': datetime.utcnow().isoformat()
            })
            
            # Update sources
            update_result = supabase.table('cm_research_sessions').update({
                'sources_metadata': sources,
                'total_sources': len(sources)
            }).eq('research_id', research_id).execute()
            
            if update_result.data:
                logger.info("✅ Research source stored successfully")
                return True
        
        return False
        
    except Exception as e:
        logger.error(f"❌ Failed to store research source: {e}")
        return False

@function_tool
def get_research_session(research_id: str) -> Dict[str, Any]:
    """
    Retrieve a research session by ID.
    
    Args:
        research_id: UUID of the research session
        
    Returns:
        Research session data including findings and sources
    """
    try:
        result = supabase.table('cm_research_sessions').select('*').eq('research_id', research_id).single().execute()
        
        if result.data:
            logger.info(f"✅ Retrieved research session with {result.data.get('total_sources', 0)} sources")
            return result.data
        else:
            raise Exception("Research session not found")
            
    except Exception as e:
        logger.error(f"❌ Failed to retrieve research session: {e}")
        raise Exception(f"Failed to retrieve research session: {str(e)}")

@function_tool
def link_research_to_content(research_id: str, content_id: str) -> bool:
    """
    Link research session to module content.
    
    Args:
        research_id: UUID of the research session
        content_id: UUID of the module content
        
    Returns:
        success: Boolean indicating if linking was successful
    """
    try:
        result = supabase.table('cm_research_sessions').update({
            'content_id': content_id,
            'updated_at': datetime.utcnow().isoformat()
        }).eq('research_id', research_id).execute()
        
        if result.data:
            logger.info(f"✅ Linked research to content {content_id}")
            return True
        else:
            return False
            
    except Exception as e:
        logger.error(f"❌ Failed to link research to content: {e}")
        return False