"""Research tools with schema-compliant function definitions."""

import json
import logging
from typing import List, Optional
from datetime import datetime
from lxera_agents import function_tool
from openai import OpenAI
from pydantic import BaseModel, Field

from ..config.settings import get_settings

logger = logging.getLogger(__name__)


class SearchContext(BaseModel):
    """Search context parameters."""
    domain_focus: Optional[str] = Field(None, description="Domain to focus search on (educational, financial, business)")
    max_results: Optional[int] = Field(10, description="Maximum number of results")
    include_answer: Optional[bool] = Field(True, description="Include AI-generated answer")


class SearchResult(BaseModel):
    """Search result structure."""
    title: str
    url: str
    content: str
    published_date: Optional[str] = None


class TavilySearchResponse(BaseModel):
    """Tavily search response schema."""
    search_results: List[SearchResult]
    answer: str
    query: str
    result_count: int
    search_timestamp: str
    domain_focus: str
    success: bool = True
    error: Optional[str] = None


@function_tool
def tavily_search_schema_compliant(query: str, context: Optional[SearchContext] = None) -> TavilySearchResponse:
    """
    Comprehensive web search using Tavily API with strict schema compliance.
    
    Args:
        query: Search query string
        context: Optional search context parameters
        
    Returns:
        TavilySearchResponse with search results and metadata
    """
    try:
        settings = get_settings()
        
        # Import Tavily client
        from tavily import TavilyClient
        tavily_client = TavilyClient(api_key=settings.tavily_api_key)
        
        # Configure search parameters
        search_params = {
            "query": query,
            "search_depth": "advanced",
            "max_results": context.max_results if context else 10,
            "include_images": False,
            "include_answer": context.include_answer if context else True,
            "include_raw_content": True
        }
        
        # Add domain filtering
        domain_focus = context.domain_focus if context else "general"
        if domain_focus == "educational":
            search_params["include_domains"] = [
                "edu", "coursera.org", "edx.org", "khanacademy.org",
                "mit.edu", "stanford.edu", "harvard.edu"
            ]
        elif domain_focus == "financial":
            search_params["include_domains"] = [
                "investopedia.com", "morningstar.com", "bloomberg.com",
                "sec.gov", "federalreserve.gov", "cfa.org"
            ]
        
        # Execute search
        results = tavily_client.search(**search_params)
        
        # Convert to schema-compliant format
        search_results = []
        for result in results.get("results", []):
            search_results.append(SearchResult(
                title=result.get("title", ""),
                url=result.get("url", ""),
                content=result.get("content", ""),
                published_date=result.get("published_date")
            ))
        
        return TavilySearchResponse(
            search_results=search_results,
            answer=results.get("answer", ""),
            query=query,
            result_count=len(search_results),
            search_timestamp=datetime.now().isoformat(),
            domain_focus=domain_focus,
            success=True
        )
        
    except Exception as e:
        logger.error(f"Tavily search failed: {e}")
        return TavilySearchResponse(
            search_results=[],
            answer="",
            query=query,
            result_count=0,
            search_timestamp=datetime.now().isoformat(),
            domain_focus="general",
            success=False,
            error=str(e)
        )


class ContentGenerationRequest(BaseModel):
    """Content generation request schema."""
    module_title: str
    learning_objectives: List[str]
    target_word_count: int = Field(7500, description="Target word count for module")
    employee_name: str
    current_role: str
    career_aspiration: str


class QualityIndicators(BaseModel):
    """Quality indicators for generated content."""
    personalization_present: bool
    has_examples: bool
    meets_objectives: bool
    appropriate_length: bool


class ContentGenerationResponse(BaseModel):
    """Content generation response schema."""
    content: str
    word_count: int
    module_title: str
    quality_indicators: QualityIndicators
    generation_timestamp: str
    success: bool = True
    error: Optional[str] = None


@function_tool
def content_generator_schema_compliant(request: ContentGenerationRequest) -> ContentGenerationResponse:
    """
    Generate educational content with strict schema compliance.
    
    Args:
        request: Content generation request with all parameters
        
    Returns:
        ContentGenerationResponse with generated content and metadata
    """
    try:
        settings = get_settings()
        openai_client = OpenAI(api_key=settings.openai_api_key)
        
        # Create comprehensive prompt
        content_prompt = f"""
        Create a comprehensive educational module on "{request.module_title}" for {request.employee_name}.
        
        Employee Context:
        - Current Role: {request.current_role}
        - Career Aspiration: {request.career_aspiration}
        - Target Word Count: {request.target_word_count} words
        
        Learning Objectives:
        {chr(10).join(f"- {obj}" for obj in request.learning_objectives)}
        
        Requirements:
        1. Personalize content with employee's name and role context
        2. Include practical examples relevant to their work
        3. Provide actionable insights they can apply immediately
        4. Structure with clear sections and subsections
        5. Include real-world case studies
        6. Add interactive elements and reflection questions
        
        Generate comprehensive, engaging content that meets the word count target.
        """
        
        response = openai_client.chat.completions.create(
            model=settings.default_model,
            messages=[{"role": "user", "content": content_prompt}],
            temperature=settings.default_temperature,
            max_tokens=4000
        )
        
        generated_content = response.choices[0].message.content
        word_count = len(generated_content.split())
        
        # Assess quality indicators
        quality_indicators = QualityIndicators(
            personalization_present=request.employee_name.lower() in generated_content.lower(),
            has_examples="example" in generated_content.lower() or "case study" in generated_content.lower(),
            meets_objectives=len(request.learning_objectives) > 0,
            appropriate_length=6000 <= word_count <= 9000
        )
        
        return ContentGenerationResponse(
            content=generated_content,
            word_count=word_count,
            module_title=request.module_title,
            quality_indicators=quality_indicators,
            generation_timestamp=datetime.now().isoformat(),
            success=True
        )
        
    except Exception as e:
        logger.error(f"Content generation failed: {e}")
        return ContentGenerationResponse(
            content="",
            word_count=0,
            module_title=request.module_title,
            quality_indicators=QualityIndicators(
                personalization_present=False,
                has_examples=False,
                meets_objectives=False,
                appropriate_length=False
            ),
            generation_timestamp=datetime.now().isoformat(),
            success=False,
            error=str(e)
        )