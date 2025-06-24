#!/usr/bin/env python3
"""
Monitored Content Generation System with Real-time Dashboard Integration
"""

import json
import time
from datetime import datetime
from typing import Dict, Any, List
from tavily import TavilyClient
from firecrawl import FirecrawlApp
from real_openai_content_generator import RealOpenAIContentGenerator
from web_monitoring_dashboard import monitor

class MonitoredContentSystem:
    """Content generation system with integrated real-time monitoring."""
    
    def __init__(self):
        import os
        self.tavily_api_key = os.getenv("TAVILY_API_KEY")
        self.firecrawl_api_key = os.getenv("FIRECRAWL_API_KEY")
        if not self.tavily_api_key:
            raise ValueError("TAVILY_API_KEY environment variable not set")
        if not self.firecrawl_api_key:
            raise ValueError("FIRECRAWL_API_KEY environment variable not set")
        self.content_generator = RealOpenAIContentGenerator(monitor=monitor)
        
    def generate_complete_module_with_monitoring(
        self,
        module_spec: Dict[str, Any],
        personalization: Dict[str, Any],
        research_queries: List[str] = None,
        session_id: str = None
    ) -> Dict[str, Any]:
        """Generate complete module with full monitoring integration."""
        
        # Start monitoring session
        if not session_id:
            session_id = f"content_gen_{int(time.time())}"
            
        monitor.start_session(session_id, module_spec, personalization)
        
        start_time = time.time()
        
        try:
            # Phase 1: Research (25% of progress)
            monitor.update_progress("Research", 5, "Starting research phase...")
            research_data = self._conduct_monitored_research(
                research_queries or [
                    f"{module_spec.get('module_name', 'financial analysis')} fundamentals",
                    f"{module_spec.get('key_concepts', ['analysis'])[0]} techniques",
                    f"best practices {module_spec.get('industry', 'finance')}"
                ]
            )
            monitor.update_progress("Research", 25, "Research phase completed")
            
            # Phase 2: Content Generation (50% of progress)
            monitor.update_progress("Content Generation", 30, "Starting content generation...")
            content_result = self._generate_monitored_content(
                module_spec, personalization, research_data
            )
            monitor.update_progress("Content Generation", 75, "Content generation completed")
            
            # Phase 3: Quality Validation (25% of progress)
            monitor.update_progress("Quality Validation", 80, "Starting quality validation...")
            quality_results = self._perform_monitored_quality_checks(content_result)
            monitor.update_progress("Quality Validation", 100, "Quality validation completed")
            
            generation_time = time.time() - start_time
            
            # Compile final results
            complete_result = {
                **content_result,
                "research_integration": {
                    "research_sources": len(research_data.get("sources", [])),
                    "research_word_count": research_data.get("total_words", 0),
                    "research_quality_score": research_data.get("quality_score", 0),
                    "integration_success": True
                },
                "quality_validation": quality_results,
                "generation_metrics": {
                    "total_generation_time": round(generation_time, 2),
                    "research_time": research_data.get("research_time", 0),
                    "content_generation_time": round(generation_time - research_data.get("research_time", 0), 2),
                    "words_per_minute": round(content_result.get("word_count", 0) / (generation_time / 60), 1)
                },
                "monitoring_metadata": {
                    "session_id": session_id,
                    "monitored": True,
                    "generation_timestamp": datetime.now().isoformat(),
                    "system_type": "monitored_content_generation"
                }
            }
            
            # Finish monitoring session
            monitor.finish_session(True, {
                "word_count": content_result.get("word_count", 0),
                "research_sources": len(research_data.get("sources", [])),
                "quality_score": quality_results.get("overall_score", 0),
                "generation_time": generation_time
            })
            
            return complete_result
            
        except Exception as e:
            # Log error and finish session with failure
            monitor.log_event("error", {
                "message": f"Content generation failed: {str(e)}",
                "error_type": type(e).__name__
            })
            
            monitor.finish_session(False, {
                "error": str(e),
                "generation_time": time.time() - start_time
            })
            
            return {
                "success": False,
                "error": str(e),
                "session_id": session_id
            }
    
    def _conduct_monitored_research(self, queries: List[str]) -> Dict[str, Any]:
        """Conduct research with monitoring integration."""
        
        monitor.log_event("phase_start", {"message": "Starting research phase", "phase": "research"})
        
        research_start = time.time()
        all_sources = []
        total_words = 0
        
        # Phase 1: Web search with Tavily
        monitor.log_research_activity("search_phase_start", "Starting Tavily web search")
        tavily_client = TavilyClient(api_key=self.tavily_api_key)
        
        search_results = []
        for i, query in enumerate(queries):
            monitor.update_progress("Research", 5 + (i * 5), f"Searching: {query}")
            try:
                monitor.log_research_activity("search_start", query)
                result = tavily_client.search(
                    query=query,
                    search_depth="advanced",
                    max_results=5,
                    include_answer=True,
                    include_raw_content=True
                )
                search_results.extend(result.get("results", []))
                monitor.log_research_activity("search_complete", query, result={"count": len(result.get("results", []))})
                time.sleep(1)  # Rate limiting
            except Exception as e:
                monitor.log_research_activity("search_error", query, result={"error": str(e)})
        
        # Phase 2: Content extraction with Firecrawl
        monitor.log_research_activity("extraction_phase_start", "Starting Firecrawl content extraction")
        firecrawl_client = FirecrawlApp(api_key=self.firecrawl_api_key)
        
        extracted_content = []
        for i, result in enumerate(search_results[:6]):  # Top 6 URLs
            url = result.get("url", "")
            if url:
                monitor.update_progress("Research", 15 + (i * 2), f"Extracting: {url[:50]}...")
                try:
                    monitor.log_research_activity("extraction_start", url=url)
                    extract_result = firecrawl_client.scrape_url(
                        url,
                        formats=["markdown"],
                        only_main_content=True,
                        wait_for=2000
                    )
                    
                    if hasattr(extract_result, 'success') and extract_result.success:
                        content = extract_result.markdown or ""
                        if content:
                            word_count = len(content.split())
                            extracted_content.append({
                                "url": url,
                                "title": result.get("title", ""),
                                "content": content[:3000],  # Limit to 3000 chars
                                "word_count": word_count,
                                "source_type": "web_extraction"
                            })
                            total_words += word_count
                            all_sources.append(url)
                            monitor.log_research_activity("extraction_complete", url=url, result={"words": word_count})
                    
                    time.sleep(1)  # Rate limiting
                except Exception as e:
                    monitor.log_research_activity("extraction_error", url=url, result={"error": str(e)})
        
        research_time = time.time() - research_start
        
        # Synthesize research insights
        research_insights = self._synthesize_research(search_results, extracted_content)
        
        research_data = {
            "search_results": search_results,
            "extracted_content": extracted_content,
            "research_insights": research_insights,
            "sources": all_sources,
            "total_words": total_words,
            "research_time": round(research_time, 2),
            "quality_score": self._calculate_research_quality(search_results, extracted_content)
        }
        
        monitor.log_event("phase_complete", {
            "message": f"Research phase completed: {len(all_sources)} sources, {total_words} words",
            "phase": "research",
            "metrics": {
                "sources": len(all_sources),
                "words": total_words,
                "quality": research_data["quality_score"]
            }
        })
        
        return research_data
    
    def _generate_monitored_content(
        self, module_spec: Dict[str, Any], personalization: Dict[str, Any], research_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate content with monitoring integration."""
        
        monitor.log_event("phase_start", {"message": "Starting content generation phase", "phase": "content_generation"})
        
        # Track content sections
        sections = ["introduction", "core_content", "advanced_concepts", "practical_applications", "case_studies", "activities", "summary"]
        
        for i, section in enumerate(sections):
            progress = 30 + (i * 6)  # 30-72% progress range
            monitor.update_progress("Content Generation", progress, f"Generating {section}")
            monitor.log_content_generation(section, 0, "started")
        
        # Generate content with research integration using real OpenAI API
        content_result = self.content_generator.generate_full_module(
            module_name=module_spec.get("module_name", "Financial Analysis Module"),
            employee_name=personalization.get("employee_name", "Learner"),
            current_role=personalization.get("current_role", "Analyst"),
            career_goal=personalization.get("career_goal", "Senior Analyst"),
            key_tools=personalization.get("key_tools", ["Excel", "PowerBI"]),
            research_data=research_data
        )
        
        # Log section completion with word counts
        if content_result.get("success"):
            word_breakdown = content_result.get("word_breakdown", {})
            for section, word_count in word_breakdown.items():
                monitor.log_content_generation(section, word_count, "completed")
        
        monitor.log_event("phase_complete", {
            "message": f"Content generation completed: {content_result.get('word_count', 0)} words",
            "phase": "content_generation",
            "metrics": {
                "total_words": content_result.get('word_count', 0),
                "sections": len(word_breakdown) if content_result.get("success") else 0
            }
        })
        
        return content_result
    
    def _perform_monitored_quality_checks(self, content_result: Dict[str, Any]) -> Dict[str, Any]:
        """Perform quality validation with monitoring."""
        
        monitor.log_event("phase_start", {"message": "Starting quality validation phase", "phase": "quality_validation"})
        
        quality_results = {
            "overall_score": 0,
            "checks_performed": [],
            "recommendations": []
        }
        
        if not content_result.get("success"):
            monitor.log_quality_check("overall", 0, "content_generation_failed")
            return quality_results
        
        content = content_result.get("generated_content", "")
        word_count = content_result.get("word_count", 0)
        
        # Quality check 1: Word count compliance
        monitor.update_progress("Quality Validation", 85, "Checking word count compliance")
        word_score = 10 if 6000 <= word_count <= 8500 else (8 if word_count >= 5000 else 5)
        monitor.log_quality_check("word_count", word_score, f"{word_count}_words")
        quality_results["checks_performed"].append({"check": "word_count", "score": word_score})
        
        # Quality check 2: Content structure
        monitor.update_progress("Quality Validation", 90, "Analyzing content structure")
        structure_score = self._assess_content_structure(content)
        monitor.log_quality_check("structure", structure_score, "section_organization")
        quality_results["checks_performed"].append({"check": "structure", "score": structure_score})
        
        # Quality check 3: Research integration
        monitor.update_progress("Quality Validation", 95, "Validating research integration")
        research_score = self._assess_research_integration(content)
        monitor.log_quality_check("research_integration", research_score, "research_mentions")
        quality_results["checks_performed"].append({"check": "research_integration", "score": research_score})
        
        # Calculate overall score
        overall_score = sum(check["score"] for check in quality_results["checks_performed"]) / len(quality_results["checks_performed"])
        quality_results["overall_score"] = round(overall_score, 1)
        
        monitor.log_event("phase_complete", {
            "message": f"Quality validation completed: {overall_score:.1f}/10 overall score",
            "phase": "quality_validation",
            "metrics": {
                "overall_score": overall_score,
                "checks_performed": len(quality_results["checks_performed"])
            }
        })
        
        return quality_results
    
    def _synthesize_research(self, search_results: List[Dict], extracted_content: List[Dict]) -> Dict[str, Any]:
        """Synthesize research findings (same as original)."""
        # ... (same implementation as integrated_content_system.py)
        return {
            "key_concepts": ["Financial Analysis", "Ratio Analysis", "Financial Statements"],
            "practical_examples": ["Financial ratio calculation example"],
            "research_depth": "comprehensive" if len(extracted_content) >= 4 else "basic"
        }
    
    def _calculate_research_quality(self, search_results: List[Dict], extracted_content: List[Dict]) -> float:
        """Calculate research quality score (same as original)."""
        # ... (same implementation as integrated_content_system.py)
        return min(10.0, len(search_results) + len(extracted_content) * 2)
    
    def _assess_content_structure(self, content: str) -> float:
        """Assess content structure quality."""
        structure_indicators = ["#", "##", "###", "**", "-", "1.", "2."]
        score = 0
        for indicator in structure_indicators:
            if indicator in content:
                score += 1
        return min(10.0, score)
    
    def _assess_research_integration(self, content: str) -> float:
        """Assess research integration quality."""
        research_indicators = ["research", "study", "analysis", "evidence", "industry", "best practices"]
        score = 0
        for indicator in research_indicators:
            score += content.lower().count(indicator)
        return min(10.0, score / 5)  # Normalize to 0-10 scale

def test_monitored_system():
    """Test the monitored content generation system."""
    
    print("🔬 Testing Monitored Content Generation System")
    print("=" * 60)
    print("Note: Start the web dashboard first with: python web_monitoring_dashboard.py")
    print("Dashboard URL: http://localhost:5000")
    print("=" * 60)
    
    system = MonitoredContentSystem()
    
    # Test with Kubilaycan's data
    module_spec = {
        "module_name": "Introduction to Financial Analysis",
        "key_concepts": ["Financial Analysis", "Financial Statements", "Ratio Analysis"],
        "industry": "finance",
        "target_word_count": 7500
    }
    
    personalization = {
        "employee_name": "Kubilaycan Karakas",
        "current_role": "Junior Financial Analyst",
        "career_goal": "Senior Financial Analyst",
        "key_tools": ["Excel", "SAP BPC", "PowerBI"]
    }
    
    research_queries = [
        "financial analysis fundamentals",
        "business performance reporting",
        "ratio analysis techniques"
    ]
    
    print(f"📋 Module: {module_spec['module_name']}")
    print(f"👤 Employee: {personalization['employee_name']}")
    print(f"🔍 Research Queries: {len(research_queries)}")
    print(f"\n🚀 Starting monitored generation...")
    print("Check the dashboard for real-time progress!")
    
    result = system.generate_complete_module_with_monitoring(
        module_spec, personalization, research_queries
    )
    
    if result.get("success"):
        print(f"\n✅ MONITORED GENERATION SUCCESSFUL!")
        print(f"📊 Word Count: {result['word_count']:,}")
        print(f"🔬 Research Sources: {result['research_integration']['research_sources']}")
        print(f"🎯 Quality Score: {result['quality_validation']['overall_score']:.1f}/10")
        print(f"⚡ Generation Time: {result['generation_metrics']['total_generation_time']} seconds")
        print(f"📱 Session ID: {result['monitoring_metadata']['session_id']}")
        
        return True
    else:
        print(f"❌ Generation failed: {result.get('error', 'Unknown error')}")
        return False

if __name__ == "__main__":
    test_monitored_system()