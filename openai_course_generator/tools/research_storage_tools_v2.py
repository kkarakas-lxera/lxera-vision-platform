"""
Research Agent Storage Tools V2

Properly configured storage tools for the Research Agent that work with OpenAI SDK's strict schema requirements.
Uses manual FunctionTool creation similar to planning_storage_tools_v2 for better JSON handling.
"""

import os
import uuid
import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from supabase import create_client
from lxera_agents import FunctionTool

logger = logging.getLogger(__name__)

# Initialize Supabase client
SUPABASE_URL = 'https://xwfweumeryrgbguwrocr.supabase.co'
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZndldW1lcnlyZ2JndXdyb2NyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc2MzQ0MCwiZXhwIjoyMDY2MzM5NDQwfQ.qxXpBxUKhKA4AQT4UQnIEJGbGNrRDMbBroZU8YaypSY')
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# JSON Schema for store_research_results with complex types
STORE_RESEARCH_RESULTS_SCHEMA = {
    "type": "object",
    "properties": {
        "plan_id": {
            "type": "string",
            "description": "UUID of the course plan this research belongs to"
        },
        "session_id": {
            "type": "string",
            "description": "Session identifier for this course generation"
        },
        "research_findings": {
            "type": "object",
            "description": "Comprehensive research findings organized by topic",
            "properties": {
                "topics": {
                    "type": "array",
                    "description": "Research topics and their findings",
                    "items": {
                        "type": "object",
                        "properties": {
                            "topic": {"type": "string"},
                            "key_findings": {
                                "type": "array",
                                "items": {"type": "string"}
                            },
                            "sources": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "title": {"type": "string"},
                                        "url": {"type": "string"},
                                        "type": {"type": "string"},
                                        "credibility": {"type": "string"},
                                        "relevance_score": {"type": "number"}
                                    },
                                    "required": ["title", "url", "type", "credibility", "relevance_score"],
                                    "additionalProperties": False
                                }
                            },
                            "synthesis": {"type": "string"}
                        },
                        "required": ["topic", "key_findings", "sources", "synthesis"],
                        "additionalProperties": False
                    }
                },
                "overall_synthesis": {"type": "string"},
                "key_insights": {
                    "type": "array",
                    "items": {"type": "string"}
                },
                "recommended_resources": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string"},
                            "url": {"type": "string"},
                            "type": {"type": "string"},
                            "reason": {"type": "string"}
                        },
                        "required": ["title", "url", "type", "reason"],
                        "additionalProperties": False
                    }
                }
            },
            "required": ["topics", "overall_synthesis", "key_insights", "recommended_resources"],
            "additionalProperties": False
        },
        "content_library": {
            "type": "object",
            "description": "Organized library of content for course creation",
            "properties": {
                "primary_sources": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "content_id": {"type": "string"},
                            "title": {"type": "string"},
                            "content_type": {"type": "string"},
                            "summary": {"type": "string"},
                            "key_points": {
                                "type": "array",
                                "items": {"type": "string"}
                            },
                            "url": {"type": "string"}
                        },
                        "required": ["content_id", "title", "content_type", "summary", "key_points", "url"],
                        "additionalProperties": False
                    }
                },
                "supplementary_materials": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string"},
                            "type": {"type": "string"},
                            "description": {"type": "string"},
                            "url": {"type": "string"}
                        },
                        "required": ["title", "type", "description", "url"],
                        "additionalProperties": False
                    }
                },
                "practice_resources": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string"},
                            "type": {"type": "string"},
                            "difficulty": {"type": "string"},
                            "description": {"type": "string"}
                        },
                        "required": ["title", "type", "difficulty", "description"],
                        "additionalProperties": False
                    }
                }
            },
            "required": ["primary_sources", "supplementary_materials", "practice_resources"],
            "additionalProperties": False
        },
        "module_mappings": {
            "type": "object",
            "description": "Mapping of research to course modules",
            "properties": {
                "mappings": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "module_title": {"type": "string"},
                            "research_topics": {
                                "type": "array",
                                "items": {"type": "string"}
                            },
                            "primary_resources": {
                                "type": "array",
                                "items": {"type": "string"}
                            },
                            "supplementary_resources": {
                                "type": "array",
                                "items": {"type": "string"}
                            }
                        },
                        "required": ["module_title", "research_topics", "primary_resources", "supplementary_resources"],
                        "additionalProperties": False
                    }
                }
            },
            "required": ["mappings"],
            "additionalProperties": False
        }
    },
    "required": ["plan_id", "session_id", "research_findings", "content_library", "module_mappings"],
    "additionalProperties": False
}

async def store_research_results_impl(tool_context, args) -> str:
    """Implementation of store_research_results function."""
    try:
        # Parse args if it's a string
        if isinstance(args, str):
            try:
                args = json.loads(args)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse args as JSON: {e}")
                logger.error(f"Raw args: {args[:500]}...")
                # Try to fix common JSON issues
                fixed_args = args.replace('\n', ' ').replace('\r', '')
                args = json.loads(fixed_args)
        
        # Extract arguments from the args dictionary
        plan_id = args.get('plan_id')
        session_id = args.get('session_id')
        research_findings = args.get('research_findings', {})
        content_library = args.get('content_library', {})
        module_mappings = args.get('module_mappings', {})
        
        # Validate required fields
        if not plan_id or not session_id:
            raise ValueError("plan_id and session_id are required")
        
        logger.info(f"📚 Storing research results for plan {plan_id}")
        
        # Generate unique research ID
        research_id = str(uuid.uuid4())
        
        # Parse nested JSON if they're strings
        if isinstance(research_findings, str):
            try:
                research_findings = json.loads(research_findings)
            except:
                logger.warning("Failed to parse research_findings, using as-is")
                research_findings = {"error": "Failed to parse", "raw": research_findings[:1000]}
        
        if isinstance(content_library, str):
            try:
                content_library = json.loads(content_library)
            except:
                content_library = {}
        
        if isinstance(module_mappings, str):
            try:
                module_mappings = json.loads(module_mappings)
            except:
                module_mappings = {}
        
        # Extract metadata safely
        total_topics = 0
        total_sources = 0
        
        if isinstance(research_findings, dict) and 'topics' in research_findings:
            topics = research_findings.get('topics', [])
            if isinstance(topics, list):
                total_topics = len(topics)
                for topic in topics:
                    if isinstance(topic, dict) and 'sources' in topic:
                        sources = topic.get('sources', [])
                        if isinstance(sources, list):
                            total_sources += len(sources)
        
        # Prepare research data
        research_data = {
            'research_id': research_id,
            'plan_id': plan_id,
            'session_id': session_id,
            'research_findings': research_findings,
            'content_library': content_library or {},
            'module_mappings': module_mappings or {},
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
        # Return a graceful error message instead of raising
        return f"❌ Failed to store research results: {str(e)}. Please check the JSON format and try again."

# Create the FunctionTool manually
store_research_results = FunctionTool(
    name="store_research_results",
    description="Store comprehensive research results in the cm_research_results table with findings, content library, and module mappings",
    params_json_schema=STORE_RESEARCH_RESULTS_SCHEMA,
    on_invoke_tool=store_research_results_impl
)

# JSON Schema for store_research_session
STORE_RESEARCH_SESSION_SCHEMA = {
    "type": "object",
    "properties": {
        "research_id": {
            "type": "string",
            "description": "UUID of the research results"
        },
        "search_queries": {
            "type": "array",
            "description": "List of search queries executed",
            "items": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "results_count": {"type": "integer"},
                    "quality_score": {"type": "number"},
                    "timestamp": {"type": "string"}
                },
                "required": ["query", "results_count", "quality_score", "timestamp"],
                "additionalProperties": False
            }
        },
        "sources_analyzed": {
            "type": "array",
            "description": "List of sources analyzed during research",
            "items": {
                "type": "object",
                "properties": {
                    "url": {"type": "string"},
                    "domain": {"type": "string"},
                    "content_type": {"type": "string"},
                    "extraction_method": {"type": "string"},
                    "word_count": {"type": "integer"},
                    "quality_assessment": {"type": "string"}
                },
                "required": ["url", "domain", "content_type", "extraction_method", "word_count", "quality_assessment"],
                "additionalProperties": False
            }
        },
        "synthesis_sessions": {
            "type": "array",
            "description": "Research synthesis sessions",
            "items": {
                "type": "object",
                "properties": {
                    "topic": {"type": "string"},
                    "sources_used": {"type": "integer"},
                    "synthesis_quality": {"type": "string"},
                    "key_insights": {"type": "integer"}
                },
                "required": ["topic", "sources_used", "synthesis_quality", "key_insights"],
                "additionalProperties": False
            }
        },
        "tool_calls": {
            "type": "array",
            "description": "List of tool calls made during research",
            "items": {
                "type": "object",
                "properties": {
                    "tool_name": {"type": "string"},
                    "timestamp": {"type": "string"},
                    "parameters": {"type": "string"},
                    "result_summary": {"type": "string"}
                },
                "required": ["tool_name", "timestamp", "parameters", "result_summary"],
                "additionalProperties": False
            }
        },
        "execution_metrics": {
            "type": "object",
            "description": "Metrics about the research execution",
            "properties": {
                "total_time_seconds": {"type": "number"},
                "total_searches": {"type": "integer"},
                "total_extractions": {"type": "integer"},
                "total_synthesis": {"type": "integer"},
                "agent_turns": {"type": "integer"}
            },
            "required": ["total_time_seconds", "total_searches", "total_extractions", "total_synthesis", "agent_turns"],
            "additionalProperties": False
        }
    },
    "required": ["research_id", "search_queries", "sources_analyzed", "synthesis_sessions", "tool_calls", "execution_metrics"],
    "additionalProperties": False
}

async def store_research_session_impl(tool_context, args) -> str:
    """Implementation of store_research_session function."""
    try:
        # Parse args if it's a string
        if isinstance(args, str):
            args = json.loads(args)
        
        # Extract arguments from the args dictionary
        research_id = args.get('research_id')
        search_queries = args.get('search_queries', [])
        sources_analyzed = args.get('sources_analyzed', [])
        synthesis_sessions = args.get('synthesis_sessions', [])
        tool_calls = args.get('tool_calls', [])
        execution_metrics = args.get('execution_metrics', {})
        
        if not research_id:
            raise ValueError("research_id is required")
        
        logger.info(f"📊 Storing research session metadata for research {research_id}")
        
        # Update the research results with session metadata
        update_data = {
            'search_queries': search_queries,
            'sources_analyzed': sources_analyzed,
            'synthesis_sessions': synthesis_sessions,
            'tool_calls': tool_calls,
            'execution_metrics': execution_metrics,
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

# Create the FunctionTool manually
store_research_session = FunctionTool(
    name="store_research_session",
    description="Store research agent session metadata and execution details",
    params_json_schema=STORE_RESEARCH_SESSION_SCHEMA,
    on_invoke_tool=store_research_session_impl
)

# Export the tools
__all__ = ['store_research_results', 'store_research_session']