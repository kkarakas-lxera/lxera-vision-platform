"""Research tools wrapping existing research functionality."""

import os
import json
import logging
from typing import Dict, Any, List
from datetime import datetime
from lxera_agents import function_tool
from openai import OpenAI

# Remove problematic relative imports for now - use direct values
# from ..config.settings import get_settings
# from ..models.workflow_models import ResearchResult

# Remove hardcoded paths - use environment-based configuration instead

logger = logging.getLogger(__name__)

# Initialize Supabase client for fetching course plans
from supabase import create_client
SUPABASE_URL = 'https://xwfweumeryrgbguwrocr.supabase.co'
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZndldW1lcnlyZ2JndXdyb2NyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc2MzQ0MCwiZXhwIjoyMDY2MzM5NDQwfQ.qxXpBxUKhKA4AQT4UQnIEJGbGNrRDMbBroZU8YaypSY')
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


@function_tool
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


@function_tool
def tavily_search(query: str, context: str = "general") -> str:
    """
    Comprehensive web search using Tavily API.
    
    Wraps existing Tavily integration from refactored_nodes system.
    """
    try:
        # Get API key from environment or use hardcoded for testing
        tavily_api_key = os.getenv('TAVILY_API_KEY', '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')
        if not tavily_api_key:
            try:
                from config.settings import get_settings
                settings = get_settings()
                tavily_api_key = settings.tavily_api_key
            except ImportError:
                logger.warning("Could not import settings, using hardcoded API key for testing")
        
        # Import and use existing Tavily client setup
        from tavily import TavilyClient
        
        tavily_client = TavilyClient(api_key=tavily_api_key)
        
        # Configure search parameters based on context (reduced for context management)
        search_params = {
            "query": query,
            "search_depth": "basic",
            "max_results": 3,
            "include_images": False,
            "include_answer": True,
            "include_raw_content": False  # Reduce content size
        }
        
        # Add domain filtering for educational content
        if context == "educational":
            search_params["include_domains"] = [
                "edu", "coursera.org", "edx.org", "khanacademy.org",
                "mit.edu", "stanford.edu", "harvard.edu"
            ]
        elif context == "financial":
            search_params["include_domains"] = [
                "investopedia.com", "morningstar.com", "bloomberg.com",
                "sec.gov", "federalreserve.gov", "cfa.org"
            ]
        
        # Execute search
        results = tavily_client.search(**search_params)
        
        result_data = {
            "search_results": results.get("results", []),
            "answer": results.get("answer", ""),
            "query": query,
            "result_count": len(results.get("results", [])),
            "search_timestamp": datetime.now().isoformat(),
            "domain_focus": context,
            "success": True
        }
        return json.dumps(result_data)
        
    except Exception as e:
        logger.error(f"Tavily search failed: {e}")
        error_data = {
            "error": str(e),
            "search_results": [],
            "query": query,
            "result_count": 0,
            "success": False
        }
        return json.dumps(error_data)


@function_tool  
def firecrawl_extract(url: str, extraction_type: str = "full") -> str:
    """
    Extract detailed content from specific URLs using Firecrawl.
    
    Wraps existing Firecrawl integration for deep content extraction.
    """
    try:
        # Import and use existing Firecrawl setup
        from firecrawl import FirecrawlApp
        
        # Get API key from environment or use hardcoded for testing
        firecrawl_api_key = os.getenv('FIRECRAWL_API_KEY', 'fc-7262516226444c878aa16b03d570f3c7')
        if not firecrawl_api_key:
            try:
                from config.settings import get_settings
                settings = get_settings()
                firecrawl_api_key = settings.firecrawl_api_key
            except ImportError:
                logger.warning("Could not import settings, using hardcoded API key for testing")
        
        firecrawl_client = FirecrawlApp(api_key=firecrawl_api_key)
        
        # Configure extraction parameters
        if extraction_type == "full":
            result = firecrawl_client.scrape_url(
                url,
                formats=["markdown", "html"],
                only_main_content=True,
                include_tags=["h1", "h2", "h3", "p", "li", "table", "blockquote"],
                exclude_tags=["nav", "footer", "aside", "advertisement"],
                wait_for=2000
            )
        else:
            result = firecrawl_client.extract(
                url,
                schema={
                    "type": "object",
                    "properties": {
                        "title": {"type": "string"},
                        "main_content": {"type": "string"},
                        "key_points": {"type": "array", "items": {"type": "string"}}
                    }
                }
            )
        
        # Extract content from response
        if hasattr(result, 'success') and result.success:
            content = result.markdown or getattr(result, 'content', '') or ''
            title = result.title or (result.metadata.get('title') if result.metadata else '') or ''
        else:
            content = ""
            title = ""
        
        result_data = {
            "content": content,
            "title": title,
            "url": url,
            "word_count": len(content.split()) if content else 0,
            "extraction_type": extraction_type,
            "extraction_timestamp": datetime.now().isoformat(),
            "success": bool(content)
        }
        return json.dumps(result_data)
        
    except Exception as e:
        logger.error(f"Firecrawl extraction failed for {url}: {e}")
        error_data = {
            "error": str(e),
            "content": "",
            "url": url,
            "word_count": 0,
            "success": False
        }
        return json.dumps(error_data)



@function_tool
def jina_processor(text_content: str, processing_type: str = "comprehensive") -> str:
    """
    Process and analyze text content using Jina API.
    
    Wraps existing Jina integration for document processing and embeddings.
    """
    try:
        from config.settings import get_settings
        settings = get_settings()
        
        # Import and use existing Jina setup (simplified for now)
        # Note: This would integrate with actual Jina API in production
        
        # For now, provide a structured analysis using OpenAI
        openai_client = OpenAI(api_key=settings.openai_api_key)
        
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
        
        response = openai_client.chat.completions.create(
            model=settings.default_model,
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


@function_tool
def research_synthesizer(research_results: str, synthesis_focus: str = "comprehensive") -> str:
    """
    Synthesize multiple research sources into structured knowledge base.
    
    Uses OpenAI to create comprehensive synthesis of research findings.
    """
    try:
        from config.settings import get_settings
        settings = get_settings()
        openai_client = OpenAI(api_key=settings.openai_api_key)
        
        # Parse research data from JSON string
        try:
            parsed_results = json.loads(research_results) if isinstance(research_results, str) else research_results
            if not isinstance(parsed_results, list):
                parsed_results = [parsed_results]
        except:
            parsed_results = [{"content": research_results, "source": "text_input"}]
        
        # Prepare research data for synthesis
        synthesis_data = {
            "tavily_results": [],
            "firecrawl_content": [],
            "exa_semantic": [],
            "other_sources": []
        }
        
        for result in parsed_results:
            if isinstance(result, dict):
                if "search_results" in result:  # Tavily data
                    synthesis_data["tavily_results"].extend(result["search_results"])
                elif "content" in result and "url" in result:  # Firecrawl data
                    synthesis_data["firecrawl_content"].append(result)
                elif "semantic_results" in result:  # EXA data
                    synthesis_data["exa_semantic"].extend(result["semantic_results"])
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
        
        response = openai_client.chat.completions.create(
            model=settings.default_model,
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


@function_tool
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