"""
Enhanced Research Tools v2 - Significantly Improved Tavily/Firecrawl Usage
Leveraging advanced parameters and systematic quality assessment
"""

import os
import json
import logging
import asyncio
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from lxera_agents import function_tool
from openai import OpenAI
from supabase import create_client
import uuid
import re
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

# Use existing LXERA Supabase configuration
SUPABASE_URL = 'https://xwfweumeryrgbguwrocr.supabase.co'
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

class EnhancedResearchEngine:
    """Advanced research engine with significantly improved Tavily/Firecrawl usage"""
    
    def __init__(self):
        self.tavily_api_key = os.getenv('TAVILY_API_KEY', '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')
        self.firecrawl_api_key = os.getenv('FIRECRAWL_API_KEY', 'fc-7262516226444c878aa16b03d570f3c7')
        self.openai_client = OpenAI()
        
        # Advanced domain configurations for different research types
        self.domain_configs = {
            "academic": {
                "include_domains": [
                    "edu", "org", "academia.edu", "researchgate.net", "ieee.org", 
                    "acm.org", "springer.com", "jstor.org", "arxiv.org", "scholar.google.com",
                    "pubmed.ncbi.nlm.nih.gov", "nature.com", "science.org", "wiley.com"
                ],
                "search_depth": "advanced",
                "topic": "general",
                "include_answer": "advanced",
                "include_raw_content": "markdown"
            },
            "industry": {
                "include_domains": [
                    "mckinsey.com", "deloitte.com", "pwc.com", "bcg.com", "accenture.com",
                    "hbr.org", "forbes.com", "bloomberg.com", "reuters.com", "ft.com",
                    "businessinsider.com", "economist.com", "wsj.com", "cnbc.com"
                ],
                "search_depth": "advanced", 
                "topic": "finance",
                "include_answer": "advanced",
                "include_raw_content": "markdown"
            },
            "technical": {
                "include_domains": [
                    "github.com", "stackoverflow.com", "docs.microsoft.com",
                    "developer.mozilla.org", "w3.org", "google.com", "aws.amazon.com",
                    "cloud.google.com", "azure.microsoft.com", "kubernetes.io"
                ],
                "search_depth": "advanced",
                "topic": "general", 
                "include_answer": "basic",
                "include_raw_content": "text"
            },
            "news": {
                "exclude_domains": ["reddit.com", "quora.com", "pinterest.com"],
                "search_depth": "advanced",
                "topic": "news",
                "time_range": "month",
                "include_answer": "advanced",
                "include_raw_content": "markdown"
            }
        }

    async def execute_comprehensive_research(
        self, 
        research_queries: List[str], 
        domain_context: str,
        plan_id: str
    ) -> Dict[str, Any]:
        """Execute comprehensive research with advanced Tavily/Firecrawl features"""
        
        session_id = str(uuid.uuid4())
        logger.info(f"🔬 Starting comprehensive research session: {session_id}")
        
        try:
            # Phase 1: Advanced multi-domain search
            search_results = await self._execute_advanced_searches(research_queries, domain_context)
            
            # Phase 2: Deep content extraction with Firecrawl
            extracted_content = await self._extract_high_quality_content(search_results)
            
            # Phase 3: Source credibility validation
            validated_sources = await self._advanced_source_validation(extracted_content)
            
            # Phase 4: Content synthesis and analysis
            synthesized_research = await self._synthesize_with_quality_analysis(
                validated_sources, domain_context, research_queries
            )
            
            # Phase 5: Comprehensive quality assessment
            quality_assessment = await self._comprehensive_quality_assessment(synthesized_research)
            
            # Store results with enhanced metadata
            await self._store_comprehensive_results(
                session_id, plan_id, synthesized_research, quality_assessment, validated_sources
            )
            
            return {
                "session_id": session_id,
                "research_results": synthesized_research,
                "quality_assessment": quality_assessment,
                "source_breakdown": self._analyze_source_breakdown(validated_sources),
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Comprehensive research failed: {e}")
            raise

    async def _execute_advanced_searches(
        self, 
        queries: List[str], 
        domain_context: str
    ) -> Dict[str, List[Dict]]:
        """Execute advanced searches using Tavily's full parameter set"""
        
        from tavily import TavilyClient
        tavily_client = TavilyClient(api_key=self.tavily_api_key)
        
        all_results = {
            "academic": [],
            "industry": [], 
            "technical": [],
            "news": []
        }
        
        for query in queries:
            logger.info(f"🔍 Executing advanced search for: {query}")
            
            # Execute searches for each domain type
            for search_type, config in self.domain_configs.items():
                try:
                    # Build enhanced search parameters
                    search_params = {
                        "query": self._enhance_query_for_domain(query, search_type, domain_context),
                        "max_results": 8,  # Increased for better coverage
                        "include_images": True,
                        "timeout": 90,  # Longer timeout for thorough search
                        **config
                    }
                    
                    logger.info(f"  📊 {search_type.upper()} search with params: {search_params['query']}")
                    
                    results = tavily_client.search(**search_params)
                    
                    # Enhance results with metadata
                    enhanced_results = self._enhance_search_results(results, search_type, query)
                    all_results[search_type].extend(enhanced_results)
                    
                    logger.info(f"  ✅ Found {len(enhanced_results)} {search_type} sources")
                    
                    # Add delay to respect rate limits
                    await asyncio.sleep(0.5)
                    
                except Exception as e:
                    logger.warning(f"  ⚠️ {search_type} search failed: {e}")
                    continue
        
        return all_results

    def _enhance_query_for_domain(self, base_query: str, search_type: str, domain_context: str) -> str:
        """Enhance queries with domain-specific terms"""
        
        enhancements = {
            "academic": f"research study analysis {base_query} {domain_context} methodology findings",
            "industry": f"best practices case study {base_query} {domain_context} strategy implementation",
            "technical": f"documentation guide tutorial {base_query} {domain_context} implementation",
            "news": f"latest trends {base_query} {domain_context} 2024 2025"
        }
        
        return enhancements.get(search_type, f"{base_query} {domain_context}")

    def _enhance_search_results(self, results: Dict, search_type: str, original_query: str) -> List[Dict]:
        """Enhance search results with additional metadata"""
        
        enhanced = []
        search_results = results.get('results', [])
        
        for result in search_results:
            enhanced_result = {
                **result,
                "search_type": search_type,
                "original_query": original_query,
                "search_timestamp": datetime.now().isoformat(),
                "domain_authority": self._calculate_domain_authority(result.get('url', '')),
                "content_length": len(result.get('content', '')),
                "has_raw_content": bool(result.get('raw_content')),
                "relevance_indicators": self._extract_relevance_indicators(result, original_query)
            }
            enhanced.append(enhanced_result)
        
        return enhanced

    async def _extract_high_quality_content(self, search_results: Dict[str, List[Dict]]) -> List[Dict]:
        """Extract high-quality content using Firecrawl's advanced features"""
        
        from firecrawl import FirecrawlApp
        firecrawl_app = FirecrawlApp(api_key=self.firecrawl_api_key)
        
        extracted_content = []
        
        # Select top URLs for deep extraction
        top_urls = self._select_top_urls_for_extraction(search_results)
        
        for url_data in top_urls:
            try:
                url = url_data['url']
                search_type = url_data['search_type']
                
                logger.info(f"🕷️ Deep extracting: {url}")
                
                # Configure extraction based on content type
                scrape_config = self._get_scrape_config_for_type(search_type)
                
                # Execute advanced scraping
                scrape_result = firecrawl_app.scrape_url(
                    url,
                    **scrape_config
                )
                
                if scrape_result and scrape_result.get('markdown'):
                    enhanced_content = {
                        **url_data,
                        "extracted_markdown": scrape_result['markdown'],
                        "extracted_html": scrape_result.get('html', ''),
                        "extracted_links": scrape_result.get('links', []),
                        "extraction_metadata": scrape_result.get('metadata', {}),
                        "extraction_timestamp": datetime.now().isoformat(),
                        "content_quality_score": self._assess_content_quality(scrape_result['markdown'])
                    }
                    
                    extracted_content.append(enhanced_content)
                    logger.info(f"  ✅ Extracted {len(scrape_result['markdown'])} chars")
                else:
                    logger.warning(f"  ⚠️ No content extracted from {url}")
                
                # Rate limiting
                await asyncio.sleep(1)
                
            except Exception as e:
                logger.warning(f"  ❌ Extraction failed for {url}: {e}")
                continue
        
        return extracted_content

    def _select_top_urls_for_extraction(self, search_results: Dict[str, List[Dict]]) -> List[Dict]:
        """Select top URLs for deep content extraction"""
        
        selected_urls = []
        
        for search_type, results in search_results.items():
            # Sort by domain authority and content length
            sorted_results = sorted(
                results,
                key=lambda x: (x.get('domain_authority', 0), x.get('content_length', 0)),
                reverse=True
            )
            
            # Take top 3 from each search type
            selected_urls.extend(sorted_results[:3])
        
        return selected_urls

    def _get_scrape_config_for_type(self, search_type: str) -> Dict[str, Any]:
        """Get optimized scrape configuration for content type"""
        
        configs = {
            "academic": {
                "formats": ["markdown", "html", "links"],
                "only_main_content": True,
                "exclude_tags": ["nav", "footer", "sidebar", "ads"],
                "include_tags": ["article", "main", "content", "p", "h1", "h2", "h3"],
                "timeout": 30000,
                "remove_base64_images": True,
                "block_ads": True
            },
            "industry": {
                "formats": ["markdown", "html", "links"],
                "only_main_content": True,
                "exclude_tags": ["nav", "footer", "sidebar", "ads", "comments"],
                "timeout": 25000,
                "remove_base64_images": True,
                "block_ads": True
            },
            "technical": {
                "formats": ["markdown", "html", "links"],
                "only_main_content": True,
                "include_tags": ["pre", "code", "article", "main"],
                "exclude_tags": ["nav", "footer", "sidebar"],
                "timeout": 20000,
                "parse_pdf": True
            },
            "news": {
                "formats": ["markdown", "html"],
                "only_main_content": True,
                "exclude_tags": ["nav", "footer", "sidebar", "ads", "related"],
                "timeout": 15000,
                "remove_base64_images": True,
                "block_ads": True
            }
        }
        
        return configs.get(search_type, configs["academic"])

    async def _advanced_source_validation(self, extracted_content: List[Dict]) -> List[Dict]:
        """Advanced source validation with multiple criteria"""
        
        validated_sources = []
        
        for content in extracted_content:
            validation_score = await self._calculate_advanced_validation_score(content)
            
            if validation_score >= 0.6:  # Quality threshold
                content['validation_score'] = validation_score
                content['validation_details'] = await self._get_validation_details(content)
                validated_sources.append(content)
                logger.info(f"✅ Validated source: {content['url']} (score: {validation_score:.2f})")
            else:
                logger.info(f"❌ Rejected source: {content['url']} (score: {validation_score:.2f})")
        
        return validated_sources

    async def _calculate_advanced_validation_score(self, content: Dict) -> float:
        """Calculate comprehensive validation score"""
        
        score = 0.0
        
        # Domain authority (30%)
        score += content.get('domain_authority', 0) * 0.3
        
        # Content quality (25%)
        score += content.get('content_quality_score', 0) * 0.25
        
        # Recency (15%)
        score += self._calculate_recency_score(content) * 0.15
        
        # Content depth (15%)
        markdown_content = content.get('extracted_markdown', '')
        content_depth = min(len(markdown_content) / 2000, 1.0)  # Normalize to 2000 chars
        score += content_depth * 0.15
        
        # Source type diversity (10%)
        search_type = content.get('search_type', '')
        type_scores = {"academic": 1.0, "industry": 0.9, "technical": 0.8, "news": 0.7}
        score += type_scores.get(search_type, 0.5) * 0.1
        
        # Relevance indicators (5%)
        relevance_count = len(content.get('relevance_indicators', []))
        score += min(relevance_count / 5, 1.0) * 0.05
        
        return min(score, 1.0)

    def _calculate_domain_authority(self, url: str) -> float:
        """Calculate domain authority score"""
        
        domain = urlparse(url).netloc.lower()
        
        # High authority domains
        high_authority = {
            'edu': 1.0, 'gov': 1.0, 'org': 0.9,
            'mckinsey.com': 0.95, 'hbr.org': 0.95, 'deloitte.com': 0.9,
            'bloomberg.com': 0.9, 'reuters.com': 0.9, 'ft.com': 0.9,
            'nature.com': 0.95, 'science.org': 0.95, 'ieee.org': 0.9,
            'github.com': 0.85, 'stackoverflow.com': 0.8
        }
        
        # Check exact matches
        if domain in high_authority:
            return high_authority[domain]
        
        # Check domain endings
        for ending, score in high_authority.items():
            if domain.endswith(ending):
                return score
        
        # Default score for unknown domains
        return 0.5

    def _assess_content_quality(self, markdown_content: str) -> float:
        """Assess content quality based on structure and indicators"""
        
        score = 0.0
        
        # Length indicator (up to 0.3)
        length_score = min(len(markdown_content) / 1500, 1.0) * 0.3
        score += length_score
        
        # Structure indicators (up to 0.3)
        headers = len(re.findall(r'^#+\s', markdown_content, re.MULTILINE))
        lists = len(re.findall(r'^\s*[-*+]\s', markdown_content, re.MULTILINE))
        structure_score = min((headers + lists) / 10, 1.0) * 0.3
        score += structure_score
        
        # Quality indicators (up to 0.4)
        quality_keywords = [
            'research', 'study', 'analysis', 'data', 'results', 'findings',
            'methodology', 'framework', 'implementation', 'best practices',
            'strategy', 'approach', 'solution', 'evidence', 'statistics'
        ]
        
        keyword_count = sum(1 for keyword in quality_keywords 
                          if keyword.lower() in markdown_content.lower())
        quality_score = min(keyword_count / 8, 1.0) * 0.4
        score += quality_score
        
        return min(score, 1.0)

    def _extract_relevance_indicators(self, result: Dict, query: str) -> List[str]:
        """Extract relevance indicators from search result"""
        
        indicators = []
        content = result.get('content', '').lower()
        title = result.get('title', '').lower()
        query_words = query.lower().split()
        
        # Check for query words in title and content
        for word in query_words:
            if len(word) > 3:  # Skip short words
                if word in title:
                    indicators.append(f"title_match_{word}")
                if word in content:
                    indicators.append(f"content_match_{word}")
        
        # Check for academic indicators
        academic_terms = ['research', 'study', 'analysis', 'peer-reviewed', 'journal']
        indicators.extend([f"academic_{term}" for term in academic_terms if term in content])
        
        # Check for recent indicators
        recent_terms = ['2024', '2025', 'recent', 'latest', 'current']
        indicators.extend([f"recent_{term}" for term in recent_terms if term in content])
        
        return indicators

    async def _synthesize_with_quality_analysis(
        self, 
        validated_sources: List[Dict], 
        domain_context: str, 
        queries: List[str]
    ) -> Dict[str, Any]:
        """Synthesize research with quality analysis"""
        
        # Group sources by type and quality
        grouped_sources = self._group_sources_by_quality(validated_sources)
        
        # Create comprehensive synthesis prompt
        synthesis_prompt = self._create_comprehensive_synthesis_prompt(
            grouped_sources, domain_context, queries
        )
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system", 
                        "content": "You are an expert research analyst. Create comprehensive, evidence-based synthesis with proper citations and quality assessment."
                    },
                    {"role": "user", "content": synthesis_prompt}
                ],
                temperature=0.2,
                max_tokens=4000
            )
            
            synthesis_content = response.choices[0].message.content
            
            # Parse and structure the synthesis
            try:
                synthesis_data = json.loads(synthesis_content)
            except:
                # Fallback structured format
                synthesis_data = {
                    "synthesis_content": synthesis_content,
                    "key_findings": self._extract_key_findings(synthesis_content),
                    "source_statistics": self._calculate_source_statistics(validated_sources),
                    "quality_indicators": self._identify_quality_indicators(synthesis_content)
                }
            
            return synthesis_data
            
        except Exception as e:
            logger.error(f"Synthesis failed: {e}")
            return {
                "error": str(e),
                "fallback_summary": self._create_fallback_summary(validated_sources)
            }

    async def _comprehensive_quality_assessment(self, synthesized_research: Dict) -> Dict[str, Any]:
        """Comprehensive quality assessment with detailed metrics"""
        
        assessment = {
            "overall_score": 0.0,
            "dimension_scores": {},
            "quality_indicators": [],
            "improvement_suggestions": [],
            "meets_standards": False,
            "assessment_timestamp": datetime.now().isoformat()
        }
        
        # 9-dimensional quality framework
        dimensions = {
            "source_credibility": self._assess_source_credibility(synthesized_research),
            "content_accuracy": self._assess_content_accuracy(synthesized_research),
            "comprehensiveness": self._assess_comprehensiveness(synthesized_research),
            "currency_timeliness": self._assess_currency(synthesized_research),
            "source_diversity": self._assess_source_diversity(synthesized_research),
            "evidence_quality": self._assess_evidence_quality(synthesized_research),
            "practical_relevance": self._assess_practical_relevance(synthesized_research),
            "theoretical_grounding": self._assess_theoretical_grounding(synthesized_research),
            "synthesis_quality": self._assess_synthesis_quality(synthesized_research)
        }
        
        assessment["dimension_scores"] = dimensions
        assessment["overall_score"] = sum(dimensions.values()) / len(dimensions)
        assessment["meets_standards"] = assessment["overall_score"] >= 0.75
        
        # Generate quality indicators
        assessment["quality_indicators"] = self._generate_quality_indicators(dimensions)
        
        # Generate improvement suggestions
        assessment["improvement_suggestions"] = self._generate_improvement_suggestions(dimensions)
        
        return assessment

    # Helper methods for quality assessment
    def _assess_source_credibility(self, research: Dict) -> float:
        stats = research.get("source_statistics", {})
        return min(stats.get("avg_validation_score", 0.5) * 1.2, 1.0)
    
    def _assess_content_accuracy(self, research: Dict) -> float:
        # Check for data points, citations, specific claims
        content = str(research.get("synthesis_content", ""))
        accuracy_indicators = len(re.findall(r'\d+%|\d+\.\d+|according to|study shows|research indicates', content))
        return min(accuracy_indicators / 5, 1.0)
    
    def _assess_comprehensiveness(self, research: Dict) -> float:
        findings = research.get("key_findings", [])
        return min(len(findings) / 8, 1.0)
    
    def _assess_currency(self, research: Dict) -> float:
        # Check for recent dates and current information
        content = str(research)
        recent_indicators = len(re.findall(r'2024|2025|recent|current|latest', content, re.IGNORECASE))
        return min(recent_indicators / 3, 1.0)
    
    def _assess_source_diversity(self, research: Dict) -> float:
        stats = research.get("source_statistics", {})
        source_types = stats.get("search_type_distribution", {})
        return min(len(source_types) / 4, 1.0)
    
    def _assess_evidence_quality(self, research: Dict) -> float:
        # Assess quality of evidence and citations
        stats = research.get("source_statistics", {})
        return stats.get("avg_content_quality", 0.7)
    
    def _assess_practical_relevance(self, research: Dict) -> float:
        content = str(research.get("synthesis_content", ""))
        practical_indicators = len(re.findall(r'implementation|application|practice|example|case study', content, re.IGNORECASE))
        return min(practical_indicators / 4, 1.0)
    
    def _assess_theoretical_grounding(self, research: Dict) -> float:
        content = str(research.get("synthesis_content", ""))
        theory_indicators = len(re.findall(r'theory|framework|model|methodology|approach', content, re.IGNORECASE))
        return min(theory_indicators / 3, 1.0)
    
    def _assess_synthesis_quality(self, research: Dict) -> float:
        # Assess how well sources are synthesized
        content = str(research.get("synthesis_content", ""))
        synthesis_indicators = len(re.findall(r'however|furthermore|in contrast|similarly|additionally', content, re.IGNORECASE))
        return min(synthesis_indicators / 5, 1.0)

    # Additional helper methods...
    def _group_sources_by_quality(self, sources: List[Dict]) -> Dict[str, List[Dict]]:
        """Group sources by quality and type"""
        return {
            "high_quality": [s for s in sources if s.get('validation_score', 0) >= 0.8],
            "medium_quality": [s for s in sources if 0.6 <= s.get('validation_score', 0) < 0.8],
            "by_type": {
                "academic": [s for s in sources if s.get('search_type') == 'academic'],
                "industry": [s for s in sources if s.get('search_type') == 'industry'],
                "technical": [s for s in sources if s.get('search_type') == 'technical'],
                "news": [s for s in sources if s.get('search_type') == 'news']
            }
        }

    def _create_comprehensive_synthesis_prompt(self, sources: Dict, context: str, queries: List[str]) -> str:
        """Create comprehensive synthesis prompt"""
        return f"""
        Synthesize comprehensive research findings for: {context}
        
        Research Queries: {', '.join(queries)}
        
        HIGH QUALITY SOURCES ({len(sources['high_quality'])}):
        {self._format_sources_for_prompt(sources['high_quality'])}
        
        ACADEMIC SOURCES ({len(sources['by_type']['academic'])}):
        {self._format_sources_for_prompt(sources['by_type']['academic'][:3])}
        
        INDUSTRY SOURCES ({len(sources['by_type']['industry'])}):
        {self._format_sources_for_prompt(sources['by_type']['industry'][:3])}
        
        Create a comprehensive synthesis in JSON format with:
        {{
            "executive_summary": "2-3 sentence overview",
            "key_findings": ["finding 1", "finding 2", ...],
            "consensus_points": ["point 1", "point 2", ...],
            "debates_contradictions": ["debate 1", "debate 2", ...],
            "practical_applications": ["application 1", "application 2", ...],
            "data_statistics": ["stat 1", "stat 2", ...],
            "future_trends": ["trend 1", "trend 2", ...],
            "source_citations": ["citation 1", "citation 2", ...],
            "quality_assessment": "assessment of research quality"
        }}
        """

    def _format_sources_for_prompt(self, sources: List[Dict]) -> str:
        """Format sources for synthesis prompt"""
        formatted = []
        for i, source in enumerate(sources[:5], 1):  # Limit to top 5
            content = source.get('extracted_markdown', source.get('content', ''))
            formatted.append(f"""
            Source {i}: {source.get('title', 'Unknown')}
            URL: {source.get('url', 'Unknown')}
            Quality: {source.get('validation_score', 0):.2f}
            Type: {source.get('search_type', 'Unknown')}
            Content: {content[:800]}...
            """)
        return '\n'.join(formatted)

    def _calculate_source_statistics(self, sources: List[Dict]) -> Dict[str, Any]:
        """Calculate comprehensive source statistics"""
        return {
            "total_sources": len(sources),
            "avg_validation_score": sum(s.get('validation_score', 0) for s in sources) / len(sources) if sources else 0,
            "avg_content_quality": sum(s.get('content_quality_score', 0) for s in sources) / len(sources) if sources else 0,
            "search_type_distribution": {
                t: len([s for s in sources if s.get('search_type') == t])
                for t in ['academic', 'industry', 'technical', 'news']
            },
            "domain_authority_avg": sum(s.get('domain_authority', 0) for s in sources) / len(sources) if sources else 0
        }

    async def _store_comprehensive_results(
        self, session_id: str, plan_id: str, research: Dict, quality: Dict, sources: List[Dict]
    ):
        """Store comprehensive research results"""
        try:
            research_data = {
                'research_id': str(uuid.uuid4()),
                'plan_id': plan_id,
                'session_id': session_id,
                'research_findings': research,
                'execution_metrics': {
                    'quality_assessment': quality,
                    'source_breakdown': self._analyze_source_breakdown(sources),
                    'enhanced_features': True,
                    'research_engine_version': 'enhanced_v2'
                },
                'total_sources': len(sources),
                'research_agent_version': 'enhanced_tavily_firecrawl_v2',
                'status': 'completed'
            }
            
            supabase.table('cm_research_results').insert(research_data).execute()
            logger.info(f"✅ Comprehensive research results stored: {session_id}")
            
        except Exception as e:
            logger.error(f"Failed to store results: {e}")

    def _analyze_source_breakdown(self, sources: List[Dict]) -> Dict[str, Any]:
        """Analyze source breakdown for reporting"""
        return {
            "by_type": {
                t: len([s for s in sources if s.get('search_type') == t])
                for t in ['academic', 'industry', 'technical', 'news']
            },
            "quality_distribution": {
                "high": len([s for s in sources if s.get('validation_score', 0) >= 0.8]),
                "medium": len([s for s in sources if 0.6 <= s.get('validation_score', 0) < 0.8]),
                "low": len([s for s in sources if s.get('validation_score', 0) < 0.6])
            },
            "avg_scores": {
                "validation": sum(s.get('validation_score', 0) for s in sources) / len(sources) if sources else 0,
                "content_quality": sum(s.get('content_quality_score', 0) for s in sources) / len(sources) if sources else 0,
                "domain_authority": sum(s.get('domain_authority', 0) for s in sources) / len(sources) if sources else 0
            }
        }

# Global engine instance
_research_engine = None

def get_enhanced_research_engine():
    """Get singleton enhanced research engine"""
    global _research_engine
    if _research_engine is None:
        _research_engine = EnhancedResearchEngine()
    return _research_engine


@function_tool
def enhanced_comprehensive_research(
    plan_id: str,
    research_queries: str,
    domain_context: str = "general"
) -> str:
    """
    Execute comprehensive research with significantly enhanced Tavily/Firecrawl usage.
    Uses advanced search parameters, deep content extraction, and systematic quality assessment.
    """
    try:
        logger.info(f"🔬 Starting enhanced comprehensive research for: {plan_id}")
        
        # Parse queries
        queries = json.loads(research_queries) if isinstance(research_queries, str) else [research_queries]
        
        # Execute comprehensive research
        engine = get_enhanced_research_engine()
        result = asyncio.run(engine.execute_comprehensive_research(
            queries, domain_context, plan_id
        ))
        
        logger.info(f"✅ Enhanced research completed with {result.get('source_breakdown', {}).get('avg_scores', {}).get('validation', 0):.2f} avg quality")
        return json.dumps(result)
        
    except Exception as e:
        logger.error(f"❌ Enhanced comprehensive research failed: {e}")
        return json.dumps({"success": False, "error": str(e)})


@function_tool
def validate_research_comprehensively(research_data: str) -> str:
    """
    Validate research using comprehensive 9-dimensional quality framework.
    """
    try:
        data = json.loads(research_data) if isinstance(research_data, str) else research_data
        
        engine = get_enhanced_research_engine()
        quality_assessment = asyncio.run(engine._comprehensive_quality_assessment(data))
        
        logger.info(f"✅ Research validated: {quality_assessment['overall_score']:.2f}/1.0")
        return json.dumps(quality_assessment)
        
    except Exception as e:
        logger.error(f"❌ Research validation failed: {e}")
        return json.dumps({"success": False, "error": str(e), "overall_score": 0.0})


@function_tool
def store_enhanced_research_v2(
    plan_id: str,
    research_data: str,
    quality_assessment: str
) -> str:
    """
    Store enhanced research results with comprehensive metadata.
    """
    try:
        research_dict = json.loads(research_data) if isinstance(research_data, str) else research_data
        quality_dict = json.loads(quality_assessment) if isinstance(quality_assessment, str) else quality_assessment
        
        research_id = str(uuid.uuid4())
        
        # Store with enhanced metadata
        research_entry = {
            'research_id': research_id,
            'plan_id': plan_id,
            'research_findings': research_dict,
            'execution_metrics': {
                'quality_assessment': quality_dict,
                'enhanced_features': True,
                'research_engine_version': 'enhanced_tavily_firecrawl_v2'
            },
            'research_agent_version': 'enhanced_v2',
            'status': 'completed',
            'created_at': datetime.now().isoformat()
        }
        
        supabase.table('cm_research_results').insert(research_entry).execute()
        
        success_message = f"Enhanced research v2 stored successfully with ID: {research_id}"
        logger.info(f"✅ {success_message}")
        
        return json.dumps({
            "success": True,
            "research_id": research_id,
            "message": success_message,
            "quality_score": quality_dict.get('overall_score', 0.0),
            "quality_level": quality_dict.get('quality_level', 'unknown')
        })
        
    except Exception as e:
        logger.error(f"❌ Failed to store enhanced research v2: {e}")
        return json.dumps({"success": False, "error": str(e)})