#!/usr/bin/env python3
"""
Research Query Generator - Creates targeted, contextual search queries for personalized learning

This module generates intelligent search queries based on:
- Employee-specific context (role, tools, experience level)
- Module learning objectives and content requirements
- Industry-specific terminology and best practices
- Progressive difficulty and real-world applications
- Multi-source research strategy optimization
"""

import json
import logging
from datetime import datetime
from typing import Dict, Any, List, Tuple
from openai import OpenAI

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ResearchQueryGenerator:
    """Generates intelligent, contextual research queries for personalized course content."""
    
    def __init__(self, openai_api_key: str = None):
        """Initialize the research query generator."""
        self.openai_api_key = openai_api_key or os.getenv('OPENAI_API_KEY', '')
        self.client = OpenAI(api_key=self.openai_api_key)
        
        # Domain-specific query templates
        self.query_templates = {
            "financial_analysis": {
                "fundamentals": "{topic} fundamentals for {role}",
                "best_practices": "{topic} best practices {industry} 2024",
                "case_studies": "{topic} case studies {industry} examples",
                "tools": "{tool} {topic} tutorial advanced techniques",
                "industry_specific": "{role} {topic} {industry} reporting standards"
            },
            "tool_specific": {
                "excel": "Excel {topic} financial modeling {role}",
                "sap_bpc": "SAP BPC {topic} business planning consolidation",
                "powerbi": "PowerBI {topic} financial dashboard {role}",
                "general": "{tool} {topic} professional {industry} applications"
            },
            "skill_development": {
                "beginner": "{topic} introduction guide {role} beginners",
                "intermediate": "{topic} intermediate techniques {industry}",
                "advanced": "advanced {topic} strategies {role} professionals",
                "expert": "{topic} expert methodologies {industry} leaders"
            }
        }
        
        logger.info("🔍 Research Query Generator initialized")

    def generate_comprehensive_research_strategy(
        self, 
        detailed_modules: List[Dict[str, Any]], 
        employee_profile: Dict[str, Any],
        prioritized_gaps: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate comprehensive research strategy for entire course."""
        
        logger.info("🎯 Generating comprehensive research strategy...")
        
        research_strategy = {
            "strategy_metadata": {
                "generated_for": employee_profile.get("full_name", "Unknown"),
                "employee_role": employee_profile.get("current_role", ""),
                "generation_timestamp": datetime.now().isoformat(),
                "total_modules": len(detailed_modules),
                "strategy_version": "research_query_generator_v1"
            },
            "global_research_context": self._build_global_research_context(employee_profile, prioritized_gaps),
            "module_research_plans": {},
            "cross_module_themes": self._identify_cross_module_themes(detailed_modules),
            "source_optimization": self._optimize_source_strategy(employee_profile),
            "query_performance_metrics": {}
        }
        
        # Generate research plan for each module
        for module in detailed_modules:
            module_research_plan = self._generate_module_research_plan(
                module, employee_profile, research_strategy["global_research_context"]
            )
            research_strategy["module_research_plans"][module["module_id"]] = module_research_plan
        
        # Generate performance metrics
        research_strategy["query_performance_metrics"] = self._calculate_research_metrics(
            research_strategy["module_research_plans"]
        )
        
        logger.info(f"✅ Comprehensive research strategy generated for {len(detailed_modules)} modules")
        return research_strategy

    def _build_global_research_context(
        self, 
        employee_profile: Dict[str, Any], 
        prioritized_gaps: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Build global research context for consistent query generation."""
        
        return {
            "employee_context": {
                "role": employee_profile.get("current_role", "Financial Analyst"),
                "experience_level": employee_profile.get("experience_level", "junior"),
                "industry": "finance",
                "department": "business_performance_reporting",
                "tools": employee_profile.get("skill_inventory", {}).get("tool_proficiency", {}).keys()
            },
            "learning_context": {
                "critical_gaps": [gap["skill"] for gap in prioritized_gaps.get("critical_priority", [])],
                "career_goal": employee_profile.get("career_path", {}).get("target_position", ""),
                "timeline": employee_profile.get("career_path", {}).get("timeline", "2-3 years"),
                "learning_style": employee_profile.get("learning_style", "")
            },
            "content_preferences": {
                "practical_focus": 0.8,  # 80% practical, 20% theoretical
                "real_world_examples": True,
                "case_study_emphasis": True,
                "tool_integration": True,
                "current_trends": True
            },
            "quality_filters": {
                "recency": "2023-2024 preferred",
                "authority": "professional, academic, industry sources",
                "relevance": "business performance reporting context",
                "depth": "intermediate to advanced level"
            }
        }

    def _generate_module_research_plan(
        self, 
        module: Dict[str, Any], 
        employee_profile: Dict[str, Any],
        global_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate detailed research plan for a specific module."""
        
        module_id = module["module_id"]
        module_name = module["module_name"]
        
        logger.info(f"🔍 Generating research plan for {module_id}: {module_name}")
        
        # Generate different types of queries
        research_plan = {
            "module_info": {
                "module_id": module_id,
                "module_name": module_name,
                "priority_level": module.get("priority_level", "medium"),
                "word_count_target": module.get("word_count_target", 900),
                "skill_gap_addressed": module.get("skill_gap_addressed", "")
            },
            "query_sets": {
                "foundational_queries": self._generate_foundational_queries(module, global_context),
                "tool_specific_queries": self._generate_tool_specific_queries(module, global_context),
                "application_queries": self._generate_application_queries(module, global_context),
                "advanced_queries": self._generate_advanced_queries(module, global_context),
                "validation_queries": self._generate_validation_queries(module, global_context)
            },
            "search_strategy": {
                "primary_sources": self._identify_primary_sources(module),
                "query_prioritization": self._prioritize_queries(module),
                "domain_focus": self._determine_domain_focus(module),
                "depth_requirements": self._determine_depth_requirements(module)
            },
            "expected_outcomes": {
                "content_coverage": "comprehensive",
                "practical_examples": 3-5,
                "case_studies": 2-3,
                "tool_tutorials": len(module.get("tool_integration", [])),
                "current_practices": "latest industry standards"
            }
        }
        
        return research_plan

    def _generate_foundational_queries(
        self, 
        module: Dict[str, Any], 
        global_context: Dict[str, Any]
    ) -> List[str]:
        """Generate foundational knowledge queries for the module."""
        
        module_name = module["module_name"]
        role = global_context["employee_context"]["role"]
        industry = global_context["employee_context"]["industry"]
        
        # Extract key topic from module name
        topic_keywords = self._extract_topic_keywords(module_name)
        main_topic = topic_keywords[0] if topic_keywords else module_name
        
        foundational_queries = [
            f"{main_topic} fundamentals for financial analysts",
            f"{main_topic} definition concepts {industry}",
            f"introduction to {main_topic} business reporting",
            f"{main_topic} basic principles {role}",
            f"what is {main_topic} finance fundamentals"
        ]
        
        return foundational_queries

    def _generate_tool_specific_queries(
        self, 
        module: Dict[str, Any], 
        global_context: Dict[str, Any]
    ) -> List[str]:
        """Generate tool-specific application queries."""
        
        module_name = module["module_name"]
        tools = module.get("tool_integration", [])
        topic_keywords = self._extract_topic_keywords(module_name)
        main_topic = topic_keywords[0] if topic_keywords else module_name
        
        tool_queries = []
        
        for tool in tools:
            tool_lower = tool.lower()
            
            if "excel" in tool_lower:
                tool_queries.extend([
                    f"Excel {main_topic} formulas financial modeling",
                    f"Excel {main_topic} templates business reporting",
                    f"Excel pivot tables {main_topic} analysis tutorial"
                ])
            elif "sap" in tool_lower:
                tool_queries.extend([
                    f"SAP BPC {main_topic} business planning",
                    f"SAP BPC {main_topic} data extraction reporting",
                    f"SAP BPC {main_topic} consolidation best practices"
                ])
            elif "powerbi" in tool_lower or "power bi" in tool_lower:
                tool_queries.extend([
                    f"PowerBI {main_topic} dashboard financial reporting",
                    f"Power BI {main_topic} DAX formulas calculations",
                    f"PowerBI {main_topic} visualization best practices"
                ])
        
        # Add general tool integration queries
        if tools:
            tool_queries.append(f"{main_topic} tool integration {' '.join(tools)} workflow")
            tool_queries.append(f"best tools for {main_topic} financial analysis 2024")
        
        return tool_queries

    def _generate_application_queries(
        self, 
        module: Dict[str, Any], 
        global_context: Dict[str, Any]
    ) -> List[str]:
        """Generate real-world application and case study queries."""
        
        module_name = module["module_name"]
        role = global_context["employee_context"]["role"]
        department = global_context["employee_context"]["department"]
        topic_keywords = self._extract_topic_keywords(module_name)
        main_topic = topic_keywords[0] if topic_keywords else module_name
        
        application_queries = [
            f"{main_topic} case studies financial analysis examples",
            f"{main_topic} real world application business reporting",
            f"{main_topic} practical examples {role}",
            f"{main_topic} business performance reporting scenarios",
            f"how to apply {main_topic} in finance department",
            f"{main_topic} use cases financial planning analysis",
            f"{main_topic} step by step process business analysts"
        ]
        
        return application_queries

    def _generate_advanced_queries(
        self, 
        module: Dict[str, Any], 
        global_context: Dict[str, Any]
    ) -> List[str]:
        """Generate advanced techniques and best practices queries."""
        
        module_name = module["module_name"]
        experience_level = global_context["employee_context"]["experience_level"]
        topic_keywords = self._extract_topic_keywords(module_name)
        main_topic = topic_keywords[0] if topic_keywords else module_name
        
        # Adjust complexity based on experience level
        if experience_level in ["senior", "expert"]:
            complexity_terms = ["advanced", "expert", "sophisticated"]
        elif experience_level in ["mid", "intermediate"]:
            complexity_terms = ["intermediate", "advanced", "professional"]
        else:
            complexity_terms = ["intermediate", "practical", "professional"]
        
        advanced_queries = []
        for term in complexity_terms:
            advanced_queries.extend([
                f"{term} {main_topic} techniques financial analysis",
                f"{term} {main_topic} strategies senior analysts",
                f"{main_topic} {term} methodologies 2024"
            ])
        
        # Add industry best practices queries
        advanced_queries.extend([
            f"{main_topic} best practices finance industry 2024",
            f"{main_topic} industry standards financial reporting",
            f"{main_topic} expert tips professional analysts"
        ])
        
        return advanced_queries

    def _generate_validation_queries(
        self, 
        module: Dict[str, Any], 
        global_context: Dict[str, Any]
    ) -> List[str]:
        """Generate validation and quality assurance queries."""
        
        module_name = module["module_name"]
        topic_keywords = self._extract_topic_keywords(module_name)
        main_topic = topic_keywords[0] if topic_keywords else module_name
        
        validation_queries = [
            f"{main_topic} common mistakes avoid financial analysis",
            f"{main_topic} quality control financial reporting",
            f"{main_topic} validation checklist analysts",
            f"{main_topic} accuracy verification methods",
            f"how to validate {main_topic} results finance"
        ]
        
        return validation_queries

    def _extract_topic_keywords(self, module_name: str) -> List[str]:
        """Extract key topic keywords from module name."""
        
        # Common financial analysis topics
        financial_keywords = [
            "financial analysis", "forecasting", "budgeting", "variance analysis",
            "ratio analysis", "financial modeling", "cash flow", "profit analysis",
            "performance metrics", "financial statements", "budget management",
            "data analysis", "reporting", "dashboard", "excel", "modeling"
        ]
        
        module_lower = module_name.lower()
        extracted_keywords = []
        
        for keyword in financial_keywords:
            if keyword in module_lower:
                extracted_keywords.append(keyword)
        
        # If no specific keywords found, extract general terms
        if not extracted_keywords:
            words = module_name.split()
            # Filter out common words
            common_words = {"to", "the", "and", "or", "for", "in", "on", "with", "introduction", "advanced"}
            extracted_keywords = [word.lower() for word in words if word.lower() not in common_words]
        
        return extracted_keywords

    def _identify_primary_sources(self, module: Dict[str, Any]) -> List[str]:
        """Identify primary source types for the module."""
        
        priority_level = module.get("priority_level", "medium")
        module_name = module["module_name"].lower()
        
        primary_sources = ["professional_websites", "educational_content"]
        
        if priority_level == "critical":
            primary_sources.extend(["industry_reports", "academic_sources"])
        
        if "excel" in module_name or "modeling" in module_name:
            primary_sources.append("tutorial_sites")
        
        if "case study" in module_name or "application" in module_name:
            primary_sources.append("case_study_databases")
        
        return primary_sources

    def _prioritize_queries(self, module: Dict[str, Any]) -> Dict[str, int]:
        """Assign priority scores to different query types."""
        
        priority_level = module.get("priority_level", "medium")
        word_count = module.get("word_count_target", 900)
        
        if priority_level == "critical":
            return {
                "foundational_queries": 10,
                "application_queries": 9,
                "tool_specific_queries": 8,
                "advanced_queries": 7,
                "validation_queries": 6
            }
        elif priority_level == "high":
            return {
                "foundational_queries": 8,
                "application_queries": 9,
                "tool_specific_queries": 7,
                "advanced_queries": 6,
                "validation_queries": 5
            }
        else:
            return {
                "foundational_queries": 7,
                "application_queries": 6,
                "tool_specific_queries": 8,
                "advanced_queries": 5,
                "validation_queries": 4
            }

    def _determine_domain_focus(self, module: Dict[str, Any]) -> List[str]:
        """Determine domain focus for search optimization."""
        
        module_name = module["module_name"].lower()
        tools = module.get("tool_integration", [])
        
        domains = ["finance", "business"]
        
        if any(tool.lower() in ["excel", "powerbi"] for tool in tools):
            domains.append("technology")
        
        if "case study" in module_name or "application" in module_name:
            domains.append("case_studies")
        
        if "advanced" in module_name or "expert" in module_name:
            domains.append("professional_development")
        
        return domains

    def _determine_depth_requirements(self, module: Dict[str, Any]) -> Dict[str, Any]:
        """Determine content depth requirements for the module."""
        
        priority_level = module.get("priority_level", "medium")
        word_count = module.get("word_count_target", 900)
        
        if priority_level == "critical" and word_count > 1000:
            return {
                "research_depth": "comprehensive",
                "source_count_target": 15-20,
                "content_types": ["fundamentals", "applications", "case_studies", "best_practices"],
                "detail_level": "high"
            }
        elif priority_level in ["critical", "high"] or word_count > 1000:
            return {
                "research_depth": "substantial",
                "source_count_target": 10-15,
                "content_types": ["fundamentals", "applications", "case_studies"],
                "detail_level": "medium_high"
            }
        else:
            return {
                "research_depth": "focused",
                "source_count_target": 8-12,
                "content_types": ["fundamentals", "applications"],
                "detail_level": "medium"
            }

    def _identify_cross_module_themes(self, detailed_modules: List[Dict[str, Any]]) -> Dict[str, List[str]]:
        """Identify themes that span across multiple modules."""
        
        cross_themes = {
            "excel_integration": [],
            "business_reporting": [],
            "data_analysis": [],
            "financial_modeling": [],
            "performance_metrics": []
        }
        
        for module in detailed_modules:
            module_id = module["module_id"]
            module_name = module["module_name"].lower()
            tools = module.get("tool_integration", [])
            
            if any("excel" in tool.lower() for tool in tools):
                cross_themes["excel_integration"].append(module_id)
            
            if "reporting" in module_name or "performance" in module_name:
                cross_themes["business_reporting"].append(module_id)
            
            if "data" in module_name or "analysis" in module_name:
                cross_themes["data_analysis"].append(module_id)
            
            if "modeling" in module_name or "forecasting" in module_name:
                cross_themes["financial_modeling"].append(module_id)
            
            if "metrics" in module_name or "kpi" in module_name:
                cross_themes["performance_metrics"].append(module_id)
        
        return cross_themes

    def _optimize_source_strategy(self, employee_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize source selection strategy based on employee profile."""
        
        experience_level = employee_profile.get("experience_level", "junior")
        learning_style = employee_profile.get("learning_style", "")
        
        strategy = {
            "preferred_source_types": [],
            "content_format_preferences": [],
            "authority_requirements": "",
            "recency_weighting": 0.7  # 70% weight to recent content
        }
        
        # Adjust based on experience level
        if experience_level in ["junior", "junior_plus"]:
            strategy["preferred_source_types"] = [
                "educational_websites", "tutorial_sites", "professional_guides"
            ]
            strategy["content_format_preferences"] = [
                "step_by_step_guides", "illustrated_examples", "beginner_tutorials"
            ]
            strategy["authority_requirements"] = "educational_or_professional"
        else:
            strategy["preferred_source_types"] = [
                "industry_reports", "professional_websites", "case_study_databases"
            ]
            strategy["content_format_preferences"] = [
                "case_studies", "best_practices", "industry_analysis"
            ]
            strategy["authority_requirements"] = "professional_or_academic"
        
        # Adjust based on learning style
        if "practical" in learning_style.lower():
            strategy["content_format_preferences"].extend([
                "real_world_examples", "hands_on_exercises", "practical_applications"
            ])
        
        return strategy

    def _calculate_research_metrics(self, module_research_plans: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate metrics for the research strategy."""
        
        total_queries = 0
        query_type_distribution = {
            "foundational_queries": 0,
            "tool_specific_queries": 0,
            "application_queries": 0,
            "advanced_queries": 0,
            "validation_queries": 0
        }
        
        for module_id, plan in module_research_plans.items():
            query_sets = plan.get("query_sets", {})
            for query_type, queries in query_sets.items():
                query_count = len(queries)
                total_queries += query_count
                if query_type in query_type_distribution:
                    query_type_distribution[query_type] += query_count
        
        metrics = {
            "total_queries": total_queries,
            "queries_per_module": round(total_queries / len(module_research_plans), 1),
            "query_type_distribution": query_type_distribution,
            "estimated_research_time": f"{total_queries * 0.5:.1f} hours",  # 30 sec per query
            "coverage_analysis": {
                "foundational_coverage": query_type_distribution["foundational_queries"] / total_queries * 100,
                "practical_coverage": query_type_distribution["application_queries"] / total_queries * 100,
                "tool_coverage": query_type_distribution["tool_specific_queries"] / total_queries * 100
            }
        }
        
        return metrics

    def generate_optimized_query_list(self, research_strategy: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate an optimized, prioritized list of all research queries."""
        
        optimized_queries = []
        
        module_plans = research_strategy.get("module_research_plans", {})
        
        for module_id, plan in module_plans.items():
            module_info = plan.get("module_info", {})
            query_sets = plan.get("query_sets", {})
            prioritization = plan.get("search_strategy", {}).get("query_prioritization", {})
            
            for query_type, queries in query_sets.items():
                priority_score = prioritization.get(query_type, 5)
                
                for query in queries:
                    optimized_query = {
                        "query": query,
                        "module_id": module_id,
                        "module_name": module_info.get("module_name", ""),
                        "query_type": query_type,
                        "priority_score": priority_score,
                        "search_context": {
                            "domain_focus": plan.get("search_strategy", {}).get("domain_focus", []),
                            "expected_content_type": self._classify_expected_content(query),
                            "depth_requirement": plan.get("search_strategy", {}).get("depth_requirements", {}).get("detail_level", "medium")
                        }
                    }
                    optimized_queries.append(optimized_query)
        
        # Sort by priority score (descending)
        optimized_queries.sort(key=lambda x: x["priority_score"], reverse=True)
        
        return optimized_queries

    def _classify_expected_content(self, query: str) -> str:
        """Classify the expected content type for a query."""
        
        query_lower = query.lower()
        
        if any(term in query_lower for term in ["tutorial", "guide", "how to", "step by step"]):
            return "tutorial"
        elif any(term in query_lower for term in ["case study", "example", "application"]):
            return "case_study"
        elif any(term in query_lower for term in ["best practices", "standards", "methodology"]):
            return "best_practices"
        elif any(term in query_lower for term in ["fundamentals", "definition", "introduction"]):
            return "foundational"
        elif any(term in query_lower for term in ["advanced", "expert", "sophisticated"]):
            return "advanced"
        else:
            return "general"

if __name__ == "__main__":
    """Test the research query generator with sample data."""
    
    print("🔍 Testing Research Query Generator")
    print("=" * 50)
    
    generator = ResearchQueryGenerator()
    
    # Sample module data
    sample_modules = [
        {
            "module_id": "M01",
            "module_name": "Introduction to Financial Analysis for Business Performance",
            "priority_level": "critical",
            "word_count_target": 1200,
            "tool_integration": ["Excel", "SAP BPC"],
            "skill_gap_addressed": "Financial Analysis Fundamentals"
        },
        {
            "module_id": "M02", 
            "module_name": "Excel-Based Financial Modeling and Forecasting",
            "priority_level": "critical",
            "word_count_target": 1100,
            "tool_integration": ["Excel"],
            "skill_gap_addressed": "Forecasting and Budgeting"
        }
    ]
    
    # Sample employee profile
    sample_profile = {
        "full_name": "Kubilaycan Karakas",
        "current_role": "Junior Financial Analyst - Business Performance Reporting",
        "experience_level": "junior_plus",
        "learning_style": "Prefers practical application and real-world examples",
        "career_path": {
            "target_position": "Senior Financial Analyst",
            "timeline": "2-3 years"
        },
        "skill_inventory": {
            "tool_proficiency": {
                "Excel": {"proficiency": "intermediate"},
                "SAP BPC": {"proficiency": "basic"},
                "PowerBI": {"proficiency": "intermediate"}
            }
        }
    }
    
    # Sample prioritized gaps
    sample_gaps = {
        "critical_priority": [
            {"skill": "Forecasting and Budgeting", "priority_score": 10},
            {"skill": "Financial Data Analysis", "priority_score": 10}
        ]
    }
    
    # Generate research strategy
    research_strategy = generator.generate_comprehensive_research_strategy(
        sample_modules, sample_profile, sample_gaps
    )
    
    print(f"✅ Generated research strategy for {len(sample_modules)} modules")
    print(f"🔍 Total queries: {research_strategy['query_performance_metrics']['total_queries']}")
    print(f"📊 Queries per module: {research_strategy['query_performance_metrics']['queries_per_module']}")
    
    # Generate optimized query list
    optimized_queries = generator.generate_optimized_query_list(research_strategy)
    
    print(f"📋 Generated {len(optimized_queries)} optimized queries")
    print("\n🔍 Top 5 Priority Queries:")
    for i, query in enumerate(optimized_queries[:5]):
        print(f"{i+1}. [{query['module_id']}] {query['query']} (Priority: {query['priority_score']})")
    
    # Save results
    output_file = "sample_research_strategy.json"
    with open(output_file, 'w') as f:
        json.dump(research_strategy, f, indent=2)
    
    print(f"\n💾 Results saved to: {output_file}")