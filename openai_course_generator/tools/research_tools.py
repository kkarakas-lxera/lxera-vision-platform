"""Research tools wrapping existing research functionality."""

import os
import json
import logging
from typing import Dict, Any, List
from datetime import datetime
from lxera_agents import FunctionTool
from openai import OpenAI

# Remove problematic relative imports for now - use direct values
# from ..config.settings import get_settings
# from ..models.workflow_models import ResearchResult

# Remove hardcoded paths - use environment-based configuration instead

logger = logging.getLogger(__name__)

# Initialize Supabase client for fetching course plans
from supabase import create_client
SUPABASE_URL = 'https://xwfweumeryrgbguwrocr.supabase.co'
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def fetch_course_plan(plan_id: str) -> str:
    """
    Fetch course plan details from database using plan_id.
    
    Returns course structure, employee info, and skill gaps to guide research.
    """
    try:
        logger.info(f"📋 Fetching course plan: {plan_id}")
        
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
                "research_queries": plan.get('research_queries'),  # Include research queries for research agent
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
    
    Use this to find relevant URLs, then use scrape_do_extract to get content.
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


# TODO: Convert to FunctionTool pattern  
def firecrawl_scrape(url: str, extraction_type: str = "full") -> str:
    """
    Extract content from URLs using Firecrawl API - much more reliable than Scrape.do.
    
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



# TODO: Convert to FunctionTool pattern
def jina_processor(text_content: str, processing_type: str = "comprehensive") -> str:
    """
    Process and analyze text content using Groq LLM for structured analysis.
    
    Analyzes content and provides structured insights for course development.
    """
    try:
        from groq import Groq
        
        # Get Groq API key from environment
        groq_api_key = os.getenv('GROQ_API_KEY')
        if not groq_api_key:
            logger.error("❌ GROQ_API_KEY not found in environment")
            return json.dumps({"error": "Groq API key not configured"})
        
        groq_client = Groq(api_key=groq_api_key)
        
        analysis_prompt = f"""
        Analyze the following text content and provide:
        1. Key concepts and definitions
        2. Main themes and topics
        3. Important facts and statistics
        4. Practical insights and applications
        5. Overall summary (max 500 words)
        
        Text Content:
        {text_content[:8000]}  # Limit for token constraints
        
        Provide a structured JSON response.
        """
        
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": analysis_prompt}],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        analysis = json.loads(response.choices[0].message.content)
        
        result_data = {
            "analysis": analysis,
            "content_length": len(text_content),
            "word_count": len(text_content.split()),
            "processing_type": processing_type,
            "processing_timestamp": datetime.now().isoformat(),
            "success": True
        }
        return json.dumps(result_data)
        
    except Exception as e:
        logger.error(f"Jina processing failed: {e}")
        error_data = {
            "error": str(e),
            "analysis": {},
            "content_length": len(text_content) if text_content else 0,
            "success": False
        }
        return json.dumps(error_data)


# TODO: Convert to FunctionTool pattern
def research_synthesizer(research_results: str, synthesis_focus: str = "comprehensive") -> str:
    """
    Synthesize multiple research sources into structured knowledge base.
    
    Uses Groq LLM to create comprehensive synthesis of research findings.
    """
    try:
        from groq import Groq
        
        # Get Groq API key from environment
        groq_api_key = os.getenv('GROQ_API_KEY')
        if not groq_api_key:
            logger.error("❌ GROQ_API_KEY not found in environment")
            return json.dumps({"error": "Groq API key not configured"})
        
        groq_client = Groq(api_key=groq_api_key)
        
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
        {json.dumps(synthesis_data, indent=2)[:8000]}  # Limit for token constraints
        
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
        """
        
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": synthesis_prompt}],
            temperature=0.3,
            max_tokens=4000,
            response_format={"type": "json_object"}
        )
        
        synthesis = json.loads(response.choices[0].message.content)
        
        result_data = {
            "synthesized_knowledge": synthesis,
            "source_count": len(parsed_results),
            "synthesis_focus": synthesis_focus,
            "synthesis_timestamp": datetime.now().isoformat(),
            "word_count": len(str(synthesis).split()),
            "success": True
        }
        return json.dumps(result_data)
        
    except Exception as e:
        logger.error(f"Research synthesis failed: {e}")
        error_data = {
            "error": str(e),
            "synthesized_knowledge": {},
            "source_count": 0,
            "success": False
        }
        return json.dumps(error_data)


# TODO: Convert to FunctionTool pattern
def citation_manager(research_sources: str) -> str:
    """
    Generate citations and manage source references.
    
    Creates properly formatted citations for research sources.
    """
    try:
        # Parse sources from JSON string
        try:
            parsed_sources = json.loads(research_sources) if isinstance(research_sources, str) else research_sources
            if not isinstance(parsed_sources, list):
                parsed_sources = [parsed_sources]
        except:
            parsed_sources = [{"url": research_sources, "title": "Source", "content": research_sources}]
        
        citations = []
        citation_count = 1
        
        for source in parsed_sources:
            if "url" in source:
                citation = {
                    "citation_id": f"[{citation_count}]",
                    "url": source["url"],
                    "title": source.get("title", "Unknown Title"),
                    "access_date": datetime.now().strftime("%Y-%m-%d"),
                    "source_type": "web"
                }
                
                # Add published date if available
                if "published_date" in source:
                    citation["published_date"] = source["published_date"]
                
                # Format citation string
                citation_string = f"[{citation_count}] {citation['title']}. Retrieved {citation['access_date']} from {citation['url']}"
                citation["formatted_citation"] = citation_string
                
                citations.append(citation)
                citation_count += 1
        
        result_data = {
            "citations": citations,
            "citation_count": len(citations),
            "citation_style": "APA",
            "generated_timestamp": datetime.now().isoformat()
        }
        return json.dumps(result_data)
        
    except Exception as e:
        logger.error(f"Citation generation failed: {e}")
        error_data = {
            "error": str(e),
            "citations": [],
            "citation_count": 0
        }
        return json.dumps(error_data)