#!/usr/bin/env python3
"""
Standalone Research Tools - No lxera-agents dependency
Direct Supabase and Firecrawl integration with Ollama for LLM calls.
"""

import json
import logging
import os
import uuid
from datetime import datetime
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

def get_supabase_client():
    """Get Supabase client for database operations."""
    try:
        from supabase import create_client
    except Exception:
        import site, sys
        site_paths = []
        try:
            site_paths = site.getsitepackages()
        except Exception:
            try:
                site_paths = [site.getusersitepackages()]
            except Exception:
                site_paths = []
        for p in site_paths:
            if p in sys.path:
                sys.path.remove(p)
            sys.path.insert(0, p)
        from supabase import create_client
    
    supabase_url = os.getenv('SUPABASE_URL', 'https://xwfweumeryrgbguwrocr.supabase.co')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_key:
        raise Exception("SUPABASE_SERVICE_ROLE_KEY not found in environment")
    
    return create_client(supabase_url, supabase_key)


def fetch_course_plan(plan_id: str) -> str:
    """
    Fetch course plan details from database using plan_id.
    
    Returns course structure, employee info, and skill gaps to guide research.
    """
    try:
        logger.info(f"📋 Fetching course plan: {plan_id}")
        
        supabase = get_supabase_client()
        result = supabase.table('cm_course_plans').select('*').eq('plan_id', plan_id).single().execute()
        
        if result.data:
            plan = result.data
            
            # Extract key information for research
            course_info = {
                "plan_id": plan.get('plan_id'),
                "employee_name": plan.get('employee_name'),
                "course_title": plan.get('course_title'),
                "course_structure": plan.get('course_structure'),
                "prioritized_gaps": plan.get('prioritized_gaps'),
                "research_strategy": plan.get('research_strategy'),
                "research_queries": plan.get('research_queries'),
                "total_modules": plan.get('total_modules'),
                "course_duration_weeks": plan.get('course_duration_weeks')
            }
            
            logger.info(f"✅ Course plan loaded: {course_info['course_title']}")
            return json.dumps(course_info)
        else:
            logger.error(f"❌ No course plan found with ID: {plan_id}")
            return json.dumps({"error": f"Course plan not found: {plan_id}"})
            
    except Exception as e:
        logger.error(f"❌ Failed to fetch course plan: {e}")
        return json.dumps({"error": str(e)})


def fetch_research_results(plan_id: str) -> str:
    """
    Fetch research results and content library for a course plan.
    
    Returns comprehensive research findings, content library, and module mappings.
    """
    try:
        logger.info(f"🔍 Fetching research results for plan: {plan_id}")
        
        supabase = get_supabase_client()
        result = supabase.table('cm_research_results').select('*').eq('plan_id', plan_id).single().execute()
        
        if result.data:
            research = result.data
            
            # Extract research information for content generation
            research_info = {
                "research_id": research.get('research_id'),
                "plan_id": research.get('plan_id'),
                "research_findings": research.get('research_findings'),
                "content_library": research.get('content_library'),
                "module_mappings": research.get('module_mappings'),
                "total_topics": research.get('total_topics'),
                "total_sources": research.get('total_sources'),
                "status": research.get('status')
            }
            
            logger.info(f"✅ Research results loaded: {research_info['total_topics']} topics, {research_info['total_sources']} sources")
            return json.dumps(research_info)
        else:
            logger.warning(f"⚠️ No research results found for plan: {plan_id} - using basic research context")
            return json.dumps({
                "research_id": None,
                "plan_id": plan_id,
                "research_findings": {"topics": [], "overall_synthesis": "Basic research context"},
                "content_library": {"primary_sources": [], "supplementary_materials": []},
                "module_mappings": {"mappings": []},
                "total_topics": 0,
                "total_sources": 0,
                "status": "not_found"
            })
            
    except Exception as e:
        logger.error(f"❌ Failed to fetch research results: {e}")
        return json.dumps({"error": str(e)})


def firecrawl_search(query: str, context: str = "general") -> str:
    """
    Web search using Firecrawl API - SEARCH ONLY, returns URLs.
    
    Use this to find relevant URLs, then use firecrawl_scrape to get content.
    """
    try:
        import requests
        
        # Get API key from environment  
        firecrawl_api_key = os.getenv('FIRECRAWL_API_KEY')
        if not firecrawl_api_key:
            logger.error("❌ FIRECRAWL_API_KEY not found in environment")
            return json.dumps({"error": "Firecrawl API key not configured"})
        
        # Configure search parameters - SEARCH ONLY, no scraping
        search_params = {
            "query": query,
            "limit": 8,  # Get more URLs for scraping
        }
        
        # Add context-specific domain filtering
        if context == "academic":
            search_params["includeDomains"] = ["edu", "org", "scholar.google.com", "researchgate.net"]
        elif context == "technical":
            search_params["includeDomains"] = ["github.com", "stackoverflow.com", "docs.", "developer."]
        elif context == "business":
            search_params["includeDomains"] = ["hbr.org", "mckinsey.com", "deloitte.com", "forbes.com"]
        
        logger.info(f"🔍 Firecrawl search: {query} (context: {context})")
        
        # Execute Firecrawl search - SEARCH ONLY
        headers = {
            "Authorization": f"Bearer {firecrawl_api_key}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            "https://api.firecrawl.dev/v1/search",
            headers=headers,
            json=search_params,
            timeout=30
        )
        
        if response.status_code == 200:
            results = response.json()
            
            # Extract URLs for scraping
            urls = []
            if 'data' in results:
                for item in results['data']:
                    if 'url' in item:
                        urls.append({
                            'url': item['url'],
                            'title': item.get('title', ''),
                            'description': item.get('description', '')
                        })
            
            result_data = {
                "urls": urls,
                "query": query,
                "url_count": len(urls),
                "search_timestamp": datetime.now().isoformat(),
                "context": context,
                "success": True
            }
            
            logger.info(f"✅ Found {len(urls)} URLs for scraping")
            return json.dumps(result_data)
        else:
            logger.error(f"❌ Firecrawl search failed: {response.status_code}")
            return json.dumps({"error": f"Search failed: {response.status_code}", "success": False})
        
    except Exception as e:
        logger.error(f"❌ Firecrawl search error: {e}")
        return json.dumps({"error": str(e), "success": False})


def firecrawl_scrape(url: str, extraction_type: str = "full") -> str:
    """
    Extract content from URLs using Firecrawl API.
    
    Use this after firecrawl_search to get actual content from the URLs.
    """
    try:
        import requests
        
        # Get Firecrawl API key from environment
        firecrawl_api_key = os.getenv('FIRECRAWL_API_KEY')
        if not firecrawl_api_key:
            logger.error("❌ FIRECRAWL_API_KEY not found in environment")
            return json.dumps({"error": "Firecrawl API key not configured"})
        
        logger.info(f"🔥 Scraping URL with Firecrawl: {url}")
        
        # Configure Firecrawl scraping parameters
        scrape_params = {
            "url": url,
            "formats": ["markdown"],  # Get clean markdown content
            "onlyMainContent": True,   # Filter out navigation, ads, etc.
            "waitFor": 3000 if extraction_type == "full" else 1000,  # Wait for dynamic content
        }
        
        # Add extraction type specific parameters
        if extraction_type == "summary":
            scrape_params["extract"] = {
                "schema": {
                    "type": "object",
                    "properties": {
                        "title": {"type": "string"},
                        "summary": {"type": "string"}, 
                        "key_points": {"type": "array", "items": {"type": "string"}}
                    }
                }
            }
        
        # Execute Firecrawl scrape request
        headers = {
            "Authorization": f"Bearer {firecrawl_api_key}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            "https://api.firecrawl.dev/v1/scrape",
            headers=headers,
            json=scrape_params,
            timeout=60  # Scraping can take longer
        )
        
        if response.status_code == 200:
            result = response.json()
            
            # Extract content from Firecrawl response
            content = ""
            title = ""
            
            if result.get("success") and result.get("data"):
                data = result["data"]
                content = data.get("markdown", "") or data.get("content", "")
                title = data.get("metadata", {}).get("title", "") or data.get("title", "")
                
                # If we used structured extraction
                if extraction_type == "summary" and data.get("extract"):
                    extract_data = data["extract"]
                    title = extract_data.get("title", title)
                    summary = extract_data.get("summary", "")
                    key_points = extract_data.get("key_points", [])
                    
                    # Format structured content
                    content = f"# {title}\n\n## Summary\n{summary}\n\n## Key Points\n"
                    for i, point in enumerate(key_points, 1):
                        content += f"{i}. {point}\n"
            
            # Limit content to prevent context overflow (max 5000 words)
            if content:
                words = content.split()
                if len(words) > 5000:
                    content = ' '.join(words[:5000]) + "\n\n[Content truncated at 5000 words for context management]"
            
            result_data = {
                "content": content,
                "title": title,
                "url": url,
                "word_count": len(content.split()) if content else 0,
                "extraction_type": extraction_type,
                "extraction_timestamp": datetime.now().isoformat(),
                "success": bool(content)
            }
            
            logger.info(f"✅ Scraped {len(content.split())} words from {url}")
            return json.dumps(result_data)
        else:
            logger.error(f"❌ Firecrawl failed: {response.status_code} - {response.text}")
            return json.dumps({"error": f"Scraping failed: {response.status_code}", "success": False})
        
    except Exception as e:
        logger.error(f"❌ Firecrawl error for {url}: {e}")
        error_data = {
            "error": str(e),
            "content": "",
            "url": url,
            "word_count": 0,
            "success": False
        }
        return json.dumps(error_data)


def research_synthesizer(research_results: str, synthesis_focus: str = "comprehensive") -> str:
    """
    Synthesize multiple research sources into structured knowledge base using Ollama.
    """
    try:
        logger.info("🧠 Synthesizing research results with Ollama...")
        
        # Parse research data from JSON string
        try:
            parsed_results = json.loads(research_results) if isinstance(research_results, str) else research_results
            if not isinstance(parsed_results, list):
                parsed_results = [parsed_results]
        except:
            parsed_results = [{"content": research_results, "source": "text_input"}]
        
        # Prepare research data for synthesis
        synthesis_data = {
            "firecrawl_search_results": [],
            "scrape_do_content": [],
            "other_sources": []
        }
        
        for result in parsed_results:
            if isinstance(result, dict):
                if "urls" in result:  # Firecrawl search data
                    synthesis_data["firecrawl_search_results"].append(result)
                elif "content" in result and "url" in result:  # Scrape.do data
                    synthesis_data["scrape_do_content"].append(result)
                else:
                    synthesis_data["other_sources"].append(result)
        
        synthesis_prompt = f"""
        Synthesize the following research findings into a comprehensive knowledge base.
        
        Research Data:
        {json.dumps(synthesis_data, indent=2)[:8000]}
        
        Create a structured synthesis including:
        1. Executive Summary (300 words)
        2. Key Concepts and Definitions
        3. Important Facts and Statistics
        4. Real-World Examples and Case Studies
        5. Best Practices and Methodologies
        6. Recent Developments and Trends
        7. Practical Applications
        8. Source Credibility Assessment
        
        Focus: {synthesis_focus}
        
        Provide comprehensive, well-organized content suitable for course development.
        Format as structured JSON.
        
        OUTPUT FORMAT (JSON ONLY):
        {{
            "executive_summary": "300 word summary",
            "key_concepts": ["concept1", "concept2"],
            "important_facts": ["fact1", "fact2"],
            "real_world_examples": ["example1", "example2"],
            "best_practices": ["practice1", "practice2"],
            "recent_developments": ["trend1", "trend2"],
            "practical_applications": ["application1", "application2"],
            "source_credibility": {{"high": 5, "medium": 3, "low": 1}}
        }}
        """
        
        # Use Ollama service for synthesis
        from ..services.ollama_service import get_chat_ollama
        from langchain_core.messages import SystemMessage, HumanMessage
        
        llm = get_chat_ollama("qwen3:14b")
        
        messages = [
            SystemMessage(content="You are an expert research analyst who synthesizes multiple sources into structured knowledge. ALWAYS return valid JSON only."),
            HumanMessage(content=synthesis_prompt + "\n\nReturn ONLY valid JSON, no additional text.")
        ]
        
        response = llm.invoke(messages)
        response_content = response.content
        
        # Extract JSON from response
        def extract_json_from_response(content: str) -> dict:
            if '<think>' in content and '</think>' in content:
                json_start = content.find('</think>') + len('</think>')
                content = content[json_start:].strip()
            
            if '```json' in content:
                start = content.find('```json') + len('```json')
                end = content.find('```', start)
                if end != -1:
                    content = content[start:end].strip()
            elif '```' in content:
                start = content.find('```') + 3
                end = content.find('```', start)
                if end != -1:
                    content = content[start:end].strip()
            
            import re
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                content = json_match.group(0)
            
            return json.loads(content.strip())
        
        synthesis = extract_json_from_response(response_content)
        
        result_data = {
            "synthesized_knowledge": synthesis,
            "source_count": len(parsed_results),
            "synthesis_focus": synthesis_focus,
            "synthesis_timestamp": datetime.now().isoformat(),
            "word_count": len(str(synthesis).split()),
            "success": True
        }
        
        logger.info(f"✅ Research synthesis completed: {result_data['word_count']} words from {result_data['source_count']} sources")
        return json.dumps(result_data)
        
    except Exception as e:
        logger.error(f"❌ Research synthesis failed: {e}")
        error_data = {
            "error": str(e),
            "synthesized_knowledge": {},
            "source_count": 0,
            "success": False
        }
        return json.dumps(error_data)


def store_research_results(
    plan_id: str,
    session_id: str,
    research_findings: str,
    content_library: str,
    module_mappings: str
) -> str:
    """
    Store comprehensive research results in cm_research_results.
    
    Returns status string with research_id.
    """
    try:
        logger.info(f"💾 Storing research results for plan: {plan_id}")
        
        supabase = get_supabase_client()
        research_id = str(uuid.uuid4())
        
        # Parse JSON strings for validation
        try:
            findings_data = json.loads(research_findings) if isinstance(research_findings, str) else research_findings
            library_data = json.loads(content_library) if isinstance(content_library, str) else content_library
            mappings_data = json.loads(module_mappings) if isinstance(module_mappings, str) else module_mappings
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error in research data: {e}")
            return json.dumps({"error": f"Invalid JSON in research data: {e}", "success": False})
        
        # Calculate metrics
        topics_count = len(findings_data.get("topics", [])) if isinstance(findings_data, dict) else 0
        sources_count = len(library_data.get("primary_sources", [])) if isinstance(library_data, dict) else 0
        
        # Prepare research record
        research_record = {
            "research_id": research_id,
            "plan_id": plan_id,
            "session_id": session_id,
            "research_findings": findings_data,
            "content_library": library_data,
            "module_mappings": mappings_data,
            "total_topics": topics_count,
            "total_sources": sources_count,
            "status": "completed",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        # Insert into database
        result = supabase.table('cm_research_results').insert(research_record).execute()
        
        if result.data:
            logger.info(f"✅ Research results stored with ID: {research_id}")
            return f"Research results stored successfully with ID: {research_id}"
        else:
            logger.error(f"❌ Failed to store research results: {result}")
            return json.dumps({"error": "Failed to store research results", "success": False})
            
    except Exception as e:
        logger.error(f"❌ Research results storage failed: {e}")
        return json.dumps({"error": str(e), "success": False})


def store_research_session(
    research_id: str,
    search_queries: str,
    sources_analyzed: str,
    synthesis_sessions: str,
    tool_calls: str,
    execution_metrics: str
) -> str:
    """
    Store session metadata for research.
    
    Returns status string.
    """
    try:
        logger.info(f"📊 Storing research session metadata for: {research_id}")
        
        supabase = get_supabase_client()
        session_id = str(uuid.uuid4())
        
        # Parse metadata
        try:
            queries_data = json.loads(search_queries) if isinstance(search_queries, str) else search_queries
            sources_data = json.loads(sources_analyzed) if isinstance(sources_analyzed, str) else sources_analyzed
            synthesis_data = json.loads(synthesis_sessions) if isinstance(synthesis_sessions, str) else synthesis_sessions
            calls_data = json.loads(tool_calls) if isinstance(tool_calls, str) else tool_calls
            metrics_data = json.loads(execution_metrics) if isinstance(execution_metrics, str) else execution_metrics
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error in session data: {e}")
            return json.dumps({"error": f"Invalid JSON in session data: {e}", "success": False})
        
        # Prepare session record
        session_record = {
            "session_id": session_id,
            "research_id": research_id,
            "search_queries": queries_data,
            "sources_analyzed": sources_data,
            "synthesis_sessions": synthesis_data,
            "tool_calls": calls_data,
            "execution_metrics": metrics_data,
            "created_at": datetime.now().isoformat()
        }
        
        # Insert into database
        result = supabase.table('cm_research_sessions').insert(session_record).execute()
        
        if result.data:
            logger.info(f"✅ Research session stored with ID: {session_id}")
            return f"Research session metadata stored successfully with ID: {session_id}"
        else:
            logger.error(f"❌ Failed to store research session: {result}")
            return json.dumps({"error": "Failed to store research session", "success": False})
            
    except Exception as e:
        logger.error(f"❌ Research session storage failed: {e}")
        return json.dumps({"error": str(e), "success": False})
