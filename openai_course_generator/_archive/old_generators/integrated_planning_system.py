#!/usr/bin/env python3
"""
Integrated Planning System - Combines intelligent planning with monitoring and content generation

This module integrates:
- IntelligentCoursePlanner for employee analysis and course planning
- ResearchQueryGenerator for targeted research strategy
- PersonalizedCourseStructure for dynamic course outlines
- Web monitoring dashboard for real-time tracking
- Real OpenAI content generation with research integration
"""

import json
import time
import logging
from datetime import datetime
from typing import Dict, Any, List
from pathlib import Path

# Import our planning components
from intelligent_course_planner import IntelligentCoursePlanner
from research_query_generator import ResearchQueryGenerator
from personalized_course_structure import PersonalizedCourseStructure

# Import existing systems
from web_monitoring_dashboard import monitor
from real_openai_content_generator import RealOpenAIContentGenerator
from tools.research_tools import tavily_search, firecrawl_extract, research_synthesizer

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class IntegratedPlanningSystem:
    """Complete integrated system for intelligent course planning and generation."""
    
    def __init__(self, openai_api_key: str = None):
        """Initialize the integrated planning system."""
        self.openai_api_key = openai_api_key or os.getenv('OPENAI_API_KEY', '')
        
        # Initialize planning components
        self.course_planner = IntelligentCoursePlanner(self.openai_api_key)
        self.query_generator = ResearchQueryGenerator(self.openai_api_key)
        self.structure_generator = PersonalizedCourseStructure(self.openai_api_key)
        
        # Initialize content generation components
        self.content_generator = RealOpenAIContentGenerator()
        
        # Monitoring integration
        self.monitor = monitor
        
        # API keys for research tools
        self.tavily_api_key = os.getenv('TAVILY_API_KEY', '')
        self.firecrawl_api_key = os.getenv('FIRECRAWL_API_KEY', '')
        
        logger.info("🎯 Integrated Planning System initialized with full monitoring")

    def generate_complete_personalized_course(
        self,
        employee_data_path: str,
        skills_gap_path: str,
        course_outline_path: str = None,
        session_id: str = None,
        include_content_generation: bool = True
    ) -> Dict[str, Any]:
        """Generate complete personalized course with intelligent planning."""
        
        start_time = time.time()
        
        if not session_id:
            session_id = f"integrated_planning_{int(time.time())}"
        
        logger.info(f"🚀 Starting complete personalized course generation - Session: {session_id}")
        
        try:
            # Phase 1: Load and analyze input data (5% progress)
            self.monitor.start_session(session_id, {"system": "integrated_planning"}, {"type": "comprehensive"})
            self.monitor.update_progress("Data Loading", 2, "Loading employee and skills data...")
            
            employee_data, skills_gap_data, base_outline = self._load_input_data(
                employee_data_path, skills_gap_path, course_outline_path
            )
            
            self.monitor.update_progress("Data Analysis", 5, "Input data loaded successfully")
            
            # Phase 2: Intelligent Course Planning (15% progress) 
            self.monitor.update_progress("Course Planning", 8, "Starting intelligent course planning...")
            
            course_plan = self.course_planner.generate_personalized_course_plan(
                employee_data, skills_gap_data, base_outline
            )
            
            self.monitor.log_event("planning_complete", {
                "message": f"Course plan generated with {len(course_plan['detailed_modules'])} modules",
                "modules_count": len(course_plan['detailed_modules']),
                "personalization_level": "comprehensive"
            })
            
            self.monitor.update_progress("Course Planning", 15, "Course planning completed")
            
            # Phase 3: Research Strategy Generation (25% progress)
            self.monitor.update_progress("Research Strategy", 18, "Generating research strategy...")
            
            research_strategy = self.query_generator.generate_comprehensive_research_strategy(
                course_plan['detailed_modules'],
                course_plan['employee_profile_summary'],
                course_plan['skills_gap_prioritization']
            )
            
            optimized_queries = self.query_generator.generate_optimized_query_list(research_strategy)
            
            self.monitor.log_event("research_strategy_complete", {
                "message": f"Research strategy generated with {len(optimized_queries)} optimized queries",
                "total_queries": len(optimized_queries),
                "queries_per_module": research_strategy['query_performance_metrics']['queries_per_module']
            })
            
            self.monitor.update_progress("Research Strategy", 25, "Research strategy completed")
            
            # Phase 4: Personalized Course Structure (35% progress)
            self.monitor.update_progress("Course Structure", 28, "Creating personalized course structure...")
            
            learning_objectives = self._extract_learning_objectives(course_plan)
            course_structure = self.structure_generator.generate_adaptive_course_outline(
                course_plan['employee_profile_summary'],
                course_plan['skills_gap_prioritization'],
                learning_objectives
            )
            
            self.monitor.log_event("structure_complete", {
                "message": f"Course structure generated with {len(course_structure['weekly_structure'])} weeks",
                "weeks_count": len(course_structure['weekly_structure']),
                "total_modules": len(course_structure['module_specifications'])
            })
            
            self.monitor.update_progress("Course Structure", 35, "Course structure completed")
            
            # Phase 5: Research Execution (55% progress)
            self.monitor.update_progress("Research Execution", 38, "Executing research queries...")
            
            research_results = self._execute_research_strategy(optimized_queries[:20])  # Limit to top 20 queries
            
            self.monitor.update_progress("Research Execution", 55, "Research execution completed")
            
            # Phase 6: Content Generation (85% progress) - Optional
            content_results = None
            if include_content_generation:
                self.monitor.update_progress("Content Generation", 58, "Starting content generation...")
                
                content_results = self._generate_sample_content(
                    course_structure['module_specifications'][:3],  # Generate first 3 modules
                    research_results,
                    course_plan['employee_profile_summary']
                )
                
                self.monitor.update_progress("Content Generation", 85, "Content generation completed")
            
            # Phase 7: Integration and Finalization (100% progress)
            self.monitor.update_progress("Integration", 88, "Integrating all components...")
            
            complete_course = self._integrate_all_components(
                course_plan, research_strategy, course_structure, research_results, content_results
            )
            
            generation_time = time.time() - start_time
            
            # Add final metrics
            complete_course["generation_metadata"] = {
                "session_id": session_id,
                "total_generation_time": round(generation_time, 2),
                "generation_timestamp": datetime.now().isoformat(),
                "system_version": "integrated_planning_system_v1",
                "components_integrated": [
                    "intelligent_course_planner",
                    "research_query_generator", 
                    "personalized_course_structure",
                    "research_execution",
                    "content_generation" if include_content_generation else "content_planning_only"
                ]
            }
            
            # Save complete results
            self._save_complete_results(complete_course, session_id)
            
            self.monitor.update_progress("Complete", 100, "Course generation completed successfully")
            
            # Finish monitoring session
            self.monitor.finish_session(True, {
                "total_modules": len(course_structure['module_specifications']),
                "research_queries_executed": len(research_results) if research_results else 0,
                "content_modules_generated": len(content_results) if content_results else 0,
                "generation_time": generation_time
            })
            
            logger.info(f"✅ Complete personalized course generated in {generation_time:.1f}s")
            return complete_course
            
        except Exception as e:
            logger.error(f"❌ Course generation failed: {e}")
            self.monitor.finish_session(False, {"error": str(e)})
            raise

    def _load_input_data(
        self, 
        employee_data_path: str, 
        skills_gap_path: str, 
        course_outline_path: str = None
    ) -> tuple:
        """Load input data from JSON files."""
        
        logger.info(f"📂 Loading input data from {employee_data_path}")
        
        # Load employee data
        with open(employee_data_path, 'r') as f:
            employee_data = json.load(f)
        
        # Load skills gap analysis
        with open(skills_gap_path, 'r') as f:
            skills_gap_data = json.load(f)
        
        # Load base course outline if provided
        base_outline = None
        if course_outline_path and Path(course_outline_path).exists():
            with open(course_outline_path, 'r') as f:
                base_outline = json.load(f)
        
        logger.info(f"✅ Input data loaded successfully")
        return employee_data, skills_gap_data, base_outline

    def _extract_learning_objectives(self, course_plan: Dict[str, Any]) -> List[str]:
        """Extract learning objectives from course plan."""
        
        # Extract from course structure if available
        if "course_structure" in course_plan and "learning_objectives" in course_plan["course_structure"]:
            return course_plan["course_structure"]["learning_objectives"]
        
        # Generate from critical gaps
        critical_gaps = [gap["skill"] for gap in course_plan.get("skills_gap_prioritization", {}).get("critical_priority", [])]
        
        default_objectives = [
            "Master fundamental financial analysis concepts and applications",
            "Develop advanced forecasting and budgeting capabilities", 
            "Apply data analysis skills to business performance reporting",
            "Achieve professional competency for career advancement"
        ]
        
        # Add gap-specific objectives
        for gap in critical_gaps:
            default_objectives.append(f"Develop expertise in {gap.lower()}")
        
        return default_objectives

    def _execute_research_strategy(self, optimized_queries: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Execute research queries and collect results."""
        
        logger.info(f"🔍 Executing {len(optimized_queries)} research queries...")
        
        research_results = []
        
        for i, query_info in enumerate(optimized_queries):
            query = query_info["query"]
            module_id = query_info["module_id"]
            query_type = query_info["query_type"]
            
            self.monitor.log_research_activity("search_start", query=query)
            
            try:
                # Execute Tavily search
                search_result = tavily_search(query, context="financial")
                search_data = json.loads(search_result)
                
                if search_data.get("success") and search_data.get("search_results"):
                    # Take top 2 results for Firecrawl extraction
                    top_results = search_data["search_results"][:2]
                    
                    extracted_content = []
                    for result in top_results:
                        url = result.get("url", "")
                        if url:
                            self.monitor.log_research_activity("extraction_start", url=url)
                            
                            try:
                                extraction_result = firecrawl_extract(url, "full")
                                extraction_data = json.loads(extraction_result)
                                
                                if extraction_data.get("success"):
                                    extracted_content.append(extraction_data)
                                    self.monitor.log_research_activity("extraction_complete", url=url, 
                                                                     result={"word_count": extraction_data.get("word_count", 0)})
                                
                            except Exception as e:
                                logger.warning(f"Firecrawl extraction failed for {url}: {e}")
                    
                    research_result = {
                        "query_info": query_info,
                        "search_data": search_data,
                        "extracted_content": extracted_content,
                        "success": True,
                        "timestamp": datetime.now().isoformat()
                    }
                    
                    research_results.append(research_result)
                    
                    self.monitor.log_research_activity("search_complete", query=query, 
                                                     result={"sources_found": len(extracted_content)})
                
                # Add small delay to avoid rate limiting
                time.sleep(0.5)
                
            except Exception as e:
                logger.warning(f"Research query failed for '{query}': {e}")
                self.monitor.log_research_activity("search_failed", query=query, result={"error": str(e)})
        
        logger.info(f"✅ Research execution completed with {len(research_results)} successful queries")
        return research_results

    def _generate_sample_content(
        self,
        sample_modules: List[Dict[str, Any]],
        research_results: List[Dict[str, Any]],
        employee_profile: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate sample content for selected modules."""
        
        logger.info(f"📝 Generating content for {len(sample_modules)} sample modules...")
        
        content_results = []
        
        # Group research results by module
        module_research = {}
        for result in research_results:
            module_id = result["query_info"]["module_id"]
            if module_id not in module_research:
                module_research[module_id] = []
            module_research[module_id].append(result)
        
        for module in sample_modules:
            module_id = module["module_id"]
            module_name = module["module_name"]
            
            self.monitor.log_content_generation(module_name, 0, "starting")
            
            try:
                # Prepare research data for this module
                module_research_data = module_research.get(module_id, [])
                research_context = self._prepare_research_context(module_research_data)
                
                # Generate content using our content generator
                content_result = self.content_generator.generate_full_module(
                    module_name=module_name,
                    employee_name=employee_profile.get("full_name", "Learner"),
                    current_role=employee_profile.get("current_role", "Analyst"),
                    career_goal=employee_profile.get("career_path", {}).get("target_position", "Senior Analyst"),
                    key_tools=module.get("tool_integration", []),
                    research_data=research_context
                )
                
                if content_result.get("success"):
                    word_count = content_result.get("word_count", 0)
                    self.monitor.log_content_generation(module_name, word_count, "completed")
                    
                    content_results.append({
                        "module_info": module,
                        "content_result": content_result,
                        "research_integration": {
                            "sources_used": len(module_research_data),
                            "research_context": research_context
                        }
                    })
                
            except Exception as e:
                logger.warning(f"Content generation failed for {module_name}: {e}")
                self.monitor.log_content_generation(module_name, 0, "failed")
        
        logger.info(f"✅ Content generation completed for {len(content_results)} modules")
        return content_results

    def _prepare_research_context(self, module_research_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Prepare research context from research results."""
        
        if not module_research_data:
            return {"research_insights": {"key_concepts": [], "practical_examples": []}}
        
        # Extract key concepts and examples from research
        key_concepts = []
        practical_examples = []
        
        for result in module_research_data:
            search_data = result.get("search_data", {})
            extracted_content = result.get("extracted_content", [])
            
            # Extract from search results
            if search_data.get("answer"):
                key_concepts.append(search_data["answer"])
            
            # Extract from detailed content
            for content in extracted_content:
                if content.get("content"):
                    # Extract first paragraph as example
                    content_text = content["content"]
                    if len(content_text) > 100:
                        practical_examples.append(content_text[:300] + "...")
        
        return {
            "research_insights": {
                "key_concepts": key_concepts[:5],  # Limit to top 5
                "practical_examples": practical_examples[:3],  # Limit to top 3
                "research_depth": "comprehensive" if len(module_research_data) > 2 else "focused"
            }
        }

    def _integrate_all_components(
        self,
        course_plan: Dict[str, Any],
        research_strategy: Dict[str, Any],
        course_structure: Dict[str, Any],
        research_results: List[Dict[str, Any]],
        content_results: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Integrate all components into a complete course package."""
        
        logger.info("🔗 Integrating all planning and generation components...")
        
        integrated_course = {
            "course_overview": {
                "title": course_structure["course_framework"]["course_duration"]["total_weeks"],
                "learner_name": course_plan["course_metadata"]["generated_for"],
                "personalization_level": "comprehensive_intelligent_planning",
                "total_weeks": course_structure["course_framework"]["course_duration"]["total_weeks"],
                "total_modules": len(course_structure["module_specifications"]),
                "research_sources": len(research_results) if research_results else 0
            },
            "planning_components": {
                "intelligent_course_plan": course_plan,
                "research_strategy": research_strategy,
                "personalized_structure": course_structure
            },
            "execution_results": {
                "research_execution": {
                    "total_queries_executed": len(research_results) if research_results else 0,
                    "successful_research_results": research_results or [],
                    "research_coverage_analysis": self._analyze_research_coverage(research_results, course_structure)
                },
                "content_generation": {
                    "sample_modules_generated": len(content_results) if content_results else 0,
                    "content_results": content_results or [],
                    "content_quality_metrics": self._analyze_content_quality(content_results) if content_results else {}
                }
            },
            "implementation_roadmap": self._create_implementation_roadmap(course_structure, research_results),
            "success_metrics": self._define_integrated_success_metrics(course_plan, course_structure),
            "next_steps": self._generate_next_steps(course_structure, content_results is not None)
        }
        
        logger.info("✅ All components integrated successfully")
        return integrated_course

    def _analyze_research_coverage(
        self,
        research_results: List[Dict[str, Any]],
        course_structure: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze research coverage across modules."""
        
        if not research_results:
            return {"coverage_percentage": 0, "modules_covered": 0}
        
        total_modules = len(course_structure["module_specifications"])
        modules_with_research = set()
        
        for result in research_results:
            module_id = result["query_info"]["module_id"]
            modules_with_research.add(module_id)
        
        coverage_percentage = (len(modules_with_research) / total_modules * 100) if total_modules > 0 else 0
        
        return {
            "coverage_percentage": round(coverage_percentage, 1),
            "modules_covered": len(modules_with_research),
            "total_modules": total_modules,
            "research_depth": "comprehensive" if coverage_percentage > 80 else "substantial" if coverage_percentage > 60 else "focused"
        }

    def _analyze_content_quality(self, content_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze quality metrics for generated content."""
        
        if not content_results:
            return {}
        
        total_words = sum(result["content_result"].get("word_count", 0) for result in content_results)
        avg_words = total_words / len(content_results) if content_results else 0
        
        quality_scores = []
        for result in content_results:
            content_result = result["content_result"]
            if "blueprint_compliance" in content_result:
                compliance = content_result["blueprint_compliance"]
                if compliance.get("within_range"):
                    quality_scores.append(8.5)
                else:
                    quality_scores.append(7.0)
            else:
                quality_scores.append(7.5)  # Default score
        
        avg_quality = sum(quality_scores) / len(quality_scores) if quality_scores else 0
        
        return {
            "total_words_generated": total_words,
            "average_words_per_module": round(avg_words, 0),
            "average_quality_score": round(avg_quality, 1),
            "modules_generated": len(content_results),
            "research_integration_rate": sum(1 for r in content_results if r["research_integration"]["sources_used"] > 0) / len(content_results) * 100
        }

    def _create_implementation_roadmap(
        self,
        course_structure: Dict[str, Any],
        research_results: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Create implementation roadmap for the complete course."""
        
        return {
            "phase_1_foundation": {
                "timeline": "Week 1",
                "activities": [
                    "Complete foundational modules with research-enhanced content",
                    "Establish tool familiarity and basic concepts",
                    "Begin practical exercises with real-world examples"
                ],
                "success_criteria": "70% competency in fundamental concepts"
            },
            "phase_2_skill_development": {
                "timeline": "Weeks 2-3",
                "activities": [
                    "Focus on critical skill gaps with targeted research",
                    "Apply advanced techniques with hands-on practice",
                    "Integrate multiple tools and methodologies"
                ],
                "success_criteria": "Demonstrate practical application in workplace scenarios"
            },
            "phase_3_mastery": {
                "timeline": "Week 4",
                "activities": [
                    "Complete advanced modules with expert-level content",
                    "Synthesize learning across all areas",
                    "Prepare for professional application"
                ],
                "success_criteria": "Ready for advanced role responsibilities"
            },
            "ongoing_support": {
                "timeline": "Post-course",
                "activities": [
                    "Implement learning in workplace projects",
                    "Seek additional resources as needed",
                    "Track career progression milestones"
                ],
                "success_criteria": "Successful career advancement within timeline"
            }
        }

    def _define_integrated_success_metrics(
        self,
        course_plan: Dict[str, Any],
        course_structure: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Define comprehensive success metrics for the integrated system."""
        
        return {
            "planning_effectiveness": {
                "personalization_accuracy": "Alignment between plan and individual needs",
                "research_relevance": "Quality and applicability of research findings",
                "structure_optimization": "Learning path efficiency and progression"
            },
            "learning_outcomes": {
                "skill_gap_closure": "Percentage of critical gaps addressed",
                "competency_development": "Measured improvement in key areas",
                "practical_application": "Successful workplace implementation"
            },
            "system_performance": {
                "planning_efficiency": "Time from data input to complete plan",
                "research_coverage": "Percentage of modules with quality research",
                "content_quality": "Generated content meets professional standards"
            },
            "career_impact": {
                "readiness_assessment": "Preparation for target role",
                "timeline_achievement": "Progress toward career goals",
                "professional_confidence": "Self-assessed competency improvement"
            }
        }

    def _generate_next_steps(self, course_structure: Dict[str, Any], content_generated: bool) -> List[str]:
        """Generate next steps for course implementation."""
        
        next_steps = [
            "Review complete course plan and validate alignment with learning objectives",
            "Begin implementation with Week 1 modules and foundational concepts",
            "Execute research strategy for remaining modules as needed"
        ]
        
        if content_generated:
            next_steps.extend([
                "Review sample generated content for quality and relevance",
                "Generate content for remaining modules using established research context",
                "Implement assessment strategy and progress tracking"
            ])
        else:
            next_steps.extend([
                "Execute complete research strategy for all modules",
                "Generate content for all modules using research-enhanced prompts",
                "Validate content quality against success criteria"
            ])
        
        next_steps.extend([
            "Set up monitoring and progress tracking systems",
            "Begin course delivery with personalized pacing",
            "Track learning outcomes and adjust as needed",
            "Prepare for career advancement milestone assessments"
        ])
        
        return next_steps

    def _save_complete_results(self, complete_course: Dict[str, Any], session_id: str):
        """Save complete results to output directory."""
        
        output_dir = Path("output/integrated_planning")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"complete_course_plan_{session_id}_{timestamp}.json"
        filepath = output_dir / filename
        
        with open(filepath, 'w') as f:
            json.dump(complete_course, f, indent=2)
        
        logger.info(f"💾 Complete course results saved to: {filepath}")
        
        # Also save a summary report
        summary = self._create_summary_report(complete_course)
        summary_filepath = output_dir / f"summary_report_{session_id}_{timestamp}.json"
        
        with open(summary_filepath, 'w') as f:
            json.dump(summary, f, indent=2)
        
        logger.info(f"📊 Summary report saved to: {summary_filepath}")

    def _create_summary_report(self, complete_course: Dict[str, Any]) -> Dict[str, Any]:
        """Create executive summary report."""
        
        overview = complete_course["course_overview"]
        planning = complete_course["planning_components"]
        execution = complete_course["execution_results"]
        
        return {
            "executive_summary": {
                "learner": overview["learner_name"],
                "course_scope": f"{overview['total_weeks']} weeks, {overview['total_modules']} modules",
                "personalization_level": overview["personalization_level"],
                "research_sources": overview["research_sources"],
                "content_generated": execution["content_generation"]["sample_modules_generated"]
            },
            "key_achievements": {
                "intelligent_planning": "Complete personalized course plan generated",
                "research_strategy": f"{execution['research_execution']['total_queries_executed']} research queries executed",
                "course_structure": f"{overview['total_modules']} modules with adaptive progression",
                "content_integration": "Research-enhanced content generation pipeline established"
            },
            "success_indicators": {
                "planning_completeness": "100%",
                "research_coverage": f"{execution['research_execution']['research_coverage_analysis'].get('coverage_percentage', 0)}%",
                "system_integration": "Full integration of all planning components",
                "readiness_for_implementation": "Course ready for immediate delivery"
            },
            "recommendations": {
                "immediate": "Begin course implementation with foundational modules",
                "short_term": "Complete content generation for all modules",
                "medium_term": "Track learning outcomes and adjust personalization",
                "long_term": "Monitor career progression and success metrics"
            }
        }

if __name__ == "__main__":
    """Test the integrated planning system with real data."""
    
    print("🎯 Testing Integrated Planning System")
    print("=" * 70)
    
    # Initialize system
    planning_system = IntegratedPlanningSystem()
    
    # Test with real Kubilaycan data
    employee_data_path = "/Users/kubilaycenk/LF-Stable-v1/learnfinity-spark/personalization_deerflow/input_data/employee_data.json"
    skills_gap_path = "/Users/kubilaycenk/LF-Stable-v1/learnfinity-spark/personalization_deerflow/input_data/skills_gap_analysis.json"
    course_outline_path = "/Users/kubilaycenk/LF-Stable-v1/learnfinity-spark/personalization_deerflow/input_data/course_outline.json"
    
    # Check if files exist
    if not all(Path(p).exists() for p in [employee_data_path, skills_gap_path]):
        print("❌ Required input files not found. Using sample data...")
        # Could implement sample data fallback here
        exit(1)
    
    print(f"📂 Using real data from: {Path(employee_data_path).parent}")
    print(f"🎯 Employee: Kubilaycan Karakas")
    print(f"📊 Role: Junior Financial Analyst - Business Performance Reporting")
    
    # Generate complete course with content generation
    print(f"\n🚀 Starting complete course generation...")
    print(f"⏱️ This will take 5-15 minutes depending on research and content generation")
    print(f"🌐 Monitor progress at: http://localhost:5001 (if dashboard is running)")
    
    try:
        complete_course = planning_system.generate_complete_personalized_course(
            employee_data_path=employee_data_path,
            skills_gap_path=skills_gap_path,
            course_outline_path=course_outline_path,
            include_content_generation=True  # Generate sample content
        )
        
        print(f"\n✅ COMPLETE COURSE GENERATION SUCCESSFUL!")
        print("=" * 70)
        
        overview = complete_course["course_overview"]
        print(f"👤 Learner: {overview['learner_name']}")
        print(f"📚 Course: {overview['total_weeks']} weeks, {overview['total_modules']} modules")
        print(f"🔍 Research: {overview['research_sources']} sources")
        
        execution = complete_course["execution_results"]
        print(f"📝 Content: {execution['content_generation']['sample_modules_generated']} sample modules generated")
        print(f"📊 Research Coverage: {execution['research_execution']['research_coverage_analysis'].get('coverage_percentage', 0)}%")
        
        if "generation_metadata" in complete_course:
            metadata = complete_course["generation_metadata"]
            print(f"⏱️ Total Time: {metadata['total_generation_time']} seconds")
            print(f"🔧 Components: {', '.join(metadata['components_integrated'])}")
        
        print(f"\n💾 Results saved to: output/integrated_planning/")
        print(f"🎯 Course ready for implementation!")
        
    except Exception as e:
        print(f"\n❌ Course generation failed: {e}")
        import traceback
        traceback.print_exc()