#!/usr/bin/env python3
"""
Intelligent Course Planner - Analyzes employee data and generates personalized course plans

This module creates detailed, research-driven course plans based on:
- Employee background and skills analysis
- Skills gap identification and prioritization
- Career aspiration alignment
- Tool-specific and role-specific customization
- Progressive learning difficulty scaling
"""

import json
import time
import logging
import os
from datetime import datetime
from typing import Dict, Any, List, Tuple
from pathlib import Path
from openai import OpenAI

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class IntelligentCoursePlanner:
    """Analyzes employee data and generates comprehensive, personalized course plans."""
    
    def __init__(self, openai_api_key: str = None):
        """Initialize the course planner with OpenAI integration."""
        self.openai_api_key = openai_api_key or os.getenv('OPENAI_API_KEY', '')
        self.client = OpenAI(api_key=self.openai_api_key)
        
        logger.info("🎯 Intelligent Course Planner initialized")

    def analyze_employee_profile(self, employee_data: Dict[str, Any]) -> Dict[str, Any]:
        """Comprehensive analysis of employee profile for course planning."""
        
        logger.info(f"🔍 Analyzing employee profile for {employee_data.get('full_name', 'Unknown')}")
        
        # Extract key profile elements
        profile_analysis = {
            "employee_id": employee_data.get("employee_id", ""),
            "full_name": employee_data.get("full_name", ""),
            "current_role": employee_data.get("job_title_specific", ""),
            "experience_level": self._assess_experience_level(employee_data),
            "learning_style": employee_data.get("learning_style", ""),
            "career_path": {
                "current_position": employee_data.get("job_title_specific", ""),
                "target_position": employee_data.get("career_aspirations_next_role", ""),
                "timeline": self._extract_career_timeline(employee_data.get("career_aspirations_next_role", "")),
                "progression_type": self._determine_progression_type(employee_data)
            },
            "skill_inventory": {
                "technical_skills": self._categorize_technical_skills(employee_data.get("skills", [])),
                "transferable_skills": self._identify_transferable_skills(employee_data.get("skills", [])),
                "tool_proficiency": self._analyze_tool_proficiency(employee_data.get("tools_software_used_regularly", []))
            },
            "contextual_factors": {
                "department_goals": employee_data.get("department_goals_kpis", []),
                "company_priorities": employee_data.get("company_strategic_priorities", []),
                "upcoming_projects": employee_data.get("specific_projects_challenges_upcoming", []),
                "performance_highlights": employee_data.get("recent_performance_review_highlights", [])
            }
        }
        
        logger.info(f"✅ Employee profile analysis completed for {profile_analysis['current_role']}")
        return profile_analysis

    def generate_personalized_course_plan(
        self, 
        employee_data: Dict[str, Any], 
        skills_gap_analysis: Dict[str, Any],
        base_course_outline: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Generate a comprehensive, personalized course plan."""
        
        logger.info("🎯 Starting personalized course plan generation...")
        
        # Analyze employee profile
        profile_analysis = self.analyze_employee_profile(employee_data)
        
        # Process skills gaps
        prioritized_gaps = self._prioritize_skill_gaps(skills_gap_analysis)
        
        # Generate using OpenAI for intelligent planning
        course_plan = self._generate_intelligent_course_structure(
            profile_analysis, prioritized_gaps, base_course_outline
        )
        
        # Create detailed module specifications
        detailed_modules = self._create_detailed_module_specs(course_plan, profile_analysis)
        
        # Generate research queries for each module
        research_queries = self._generate_module_research_queries(detailed_modules, profile_analysis)
        
        # Compile comprehensive course plan
        comprehensive_plan = {
            "course_metadata": {
                "generated_for": profile_analysis["full_name"],
                "employee_id": profile_analysis["employee_id"],
                "generation_timestamp": datetime.now().isoformat(),
                "personalization_level": "comprehensive",
                "planning_system": "intelligent_course_planner_v1"
            },
            "employee_profile_summary": profile_analysis,
            "skills_gap_prioritization": prioritized_gaps,
            "course_structure": course_plan,
            "detailed_modules": detailed_modules,
            "research_strategy": research_queries,
            "learning_path_optimization": self._optimize_learning_path(detailed_modules, profile_analysis),
            "success_metrics": self._define_success_metrics(profile_analysis, prioritized_gaps)
        }
        
        logger.info(f"✅ Comprehensive course plan generated with {len(detailed_modules)} modules")
        return comprehensive_plan

    def _assess_experience_level(self, employee_data: Dict[str, Any]) -> str:
        """Assess employee's experience level based on background and role."""
        
        current_role = employee_data.get("job_title_specific", "").lower()
        skills = employee_data.get("skills", [])
        background = employee_data.get("background", "").lower()
        
        # Analyze role indicators
        if "junior" in current_role or "entry" in current_role:
            base_level = "junior"
        elif "senior" in current_role or "lead" in current_role:
            base_level = "senior"
        else:
            base_level = "mid"
        
        # Adjust based on background and skills
        advanced_indicators = [
            "advanced" in skill.lower() for skill in skills
        ]
        
        if sum(advanced_indicators) >= 2:
            if base_level == "junior":
                return "junior_plus"  # Junior with some advanced skills
            else:
                return base_level
        
        return base_level

    def _extract_career_timeline(self, career_aspiration: str) -> str:
        """Extract career timeline from aspiration text."""
        aspiration_lower = career_aspiration.lower()
        
        if "2-3 years" in aspiration_lower:
            return "2-3 years"
        elif "1-2 years" in aspiration_lower:
            return "1-2 years"
        elif "within 2 years" in aspiration_lower:
            return "within 2 years"
        elif "short term" in aspiration_lower:
            return "1 year"
        else:
            return "medium term"

    def _determine_progression_type(self, employee_data: Dict[str, Any]) -> str:
        """Determine the type of career progression (vertical, lateral, specialization)."""
        
        current_role = employee_data.get("job_title_specific", "").lower()
        target_role = employee_data.get("career_aspirations_next_role", "").lower()
        
        if "senior" in target_role and "junior" in current_role:
            return "vertical_progression"
        elif "specialist" in target_role or "expert" in target_role:
            return "specialization"
        elif "manager" in target_role and "analyst" in current_role:
            return "management_track"
        else:
            return "skill_enhancement"

    def _categorize_technical_skills(self, skills: List[str]) -> Dict[str, List[str]]:
        """Categorize technical skills by domain."""
        
        categories = {
            "data_analysis": [],
            "financial_tools": [],
            "project_management": [],
            "technology": [],
            "domain_specific": []
        }
        
        for skill in skills:
            skill_lower = skill.lower()
            
            if any(term in skill_lower for term in ["data", "analysis", "excel", "powerbi"]):
                categories["data_analysis"].append(skill)
            elif any(term in skill_lower for term in ["sap", "financial", "accounting", "budget"]):
                categories["financial_tools"].append(skill)
            elif any(term in skill_lower for term in ["project", "management", "planning"]):
                categories["project_management"].append(skill)
            elif any(term in skill_lower for term in ["ai", "machine learning", "technology", "software"]):
                categories["technology"].append(skill)
            else:
                categories["domain_specific"].append(skill)
        
        return categories

    def _identify_transferable_skills(self, skills: List[str]) -> List[Dict[str, str]]:
        """Identify transferable skills and their relevance to target role."""
        
        transferable = []
        
        for skill in skills:
            skill_lower = skill.lower()
            
            if "project management" in skill_lower:
                transferable.append({
                    "skill": skill,
                    "relevance": "high",
                    "application": "Managing financial analysis projects and reporting timelines"
                })
            elif "data analysis" in skill_lower:
                transferable.append({
                    "skill": skill,
                    "relevance": "very_high",
                    "application": "Analyzing financial data and creating insights"
                })
            elif "stakeholder management" in skill_lower:
                transferable.append({
                    "skill": skill,
                    "relevance": "high",
                    "application": "Collaborating with business units and presenting financial insights"
                })
        
        return transferable

    def _analyze_tool_proficiency(self, tools: List[str]) -> Dict[str, Dict[str, str]]:
        """Analyze tool proficiency levels and gap areas."""
        
        tool_analysis = {}
        
        for tool in tools:
            tool_lower = tool.lower()
            
            if "excel" in tool_lower:
                if "heavy use" in tool_lower or "advanced" in tool_lower:
                    proficiency = "advanced"
                elif "intermediate" in tool_lower:
                    proficiency = "intermediate"
                else:
                    proficiency = "basic"
                
                tool_analysis["Excel"] = {
                    "proficiency": proficiency,
                    "gap_areas": "Advanced financial modeling, VBA automation" if proficiency != "advanced" else "None",
                    "priority": "high"
                }
            
            elif "sap" in tool_lower:
                tool_analysis["SAP BPC"] = {
                    "proficiency": "basic",  # Typically data extraction only
                    "gap_areas": "Advanced reporting, consolidation, planning modules",
                    "priority": "high"
                }
            
            elif "powerbi" in tool_lower or "power bi" in tool_lower:
                tool_analysis["PowerBI"] = {
                    "proficiency": "intermediate",
                    "gap_areas": "Advanced DAX, data modeling, storytelling",
                    "priority": "medium"
                }
        
        return tool_analysis

    def _prioritize_skill_gaps(self, skills_gap_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Prioritize skill gaps based on criticality and career impact."""
        
        prioritized_gaps = {
            "critical_priority": [],
            "high_priority": [],
            "medium_priority": [],
            "development_opportunities": []
        }
        
        # Process critical gaps
        critical_gaps = skills_gap_analysis.get("Critical Skill Gaps", {}).get("gaps", [])
        for gap in critical_gaps:
            gap_with_priority = {
                **gap,
                "priority_score": 10,
                "learning_urgency": "immediate",
                "course_focus_percentage": 40  # 40% of course content
            }
            prioritized_gaps["critical_priority"].append(gap_with_priority)
        
        # Process development gaps
        development_gaps = skills_gap_analysis.get("Development Gaps", {}).get("gaps", [])
        for gap in development_gaps:
            importance = gap.get("importance", "").lower()
            
            if importance == "important":
                gap_with_priority = {
                    **gap,
                    "priority_score": 7,
                    "learning_urgency": "high",
                    "course_focus_percentage": 25
                }
                prioritized_gaps["high_priority"].append(gap_with_priority)
            else:
                gap_with_priority = {
                    **gap,
                    "priority_score": 5,
                    "learning_urgency": "medium",
                    "course_focus_percentage": 15
                }
                prioritized_gaps["medium_priority"].append(gap_with_priority)
        
        # Add transferable skills as development opportunities
        transferable_skills = skills_gap_analysis.get("Transferable Skills", {}).get("skills", [])
        for skill in transferable_skills:
            opportunity = {
                "skill": skill["skill"],
                "priority_score": 3,
                "learning_urgency": "low",
                "course_focus_percentage": 10,
                "enhancement_type": "leverage_existing"
            }
            prioritized_gaps["development_opportunities"].append(opportunity)
        
        logger.info(f"✅ Prioritized {len(critical_gaps)} critical gaps, {len(development_gaps)} development gaps")
        return prioritized_gaps

    def _generate_intelligent_course_structure(
        self, 
        profile_analysis: Dict[str, Any], 
        prioritized_gaps: Dict[str, Any],
        base_outline: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Use OpenAI to generate intelligent course structure."""
        
        logger.info("🤖 Generating intelligent course structure with OpenAI...")
        
        # Prepare context for OpenAI
        planning_prompt = f"""
        Create a personalized financial analyst training course structure for:
        
        EMPLOYEE PROFILE:
        - Name: {profile_analysis['full_name']}
        - Current Role: {profile_analysis['current_role']}
        - Experience Level: {profile_analysis['experience_level']}
        - Career Goal: {profile_analysis['career_path']['target_position']}
        - Timeline: {profile_analysis['career_path']['timeline']}
        - Learning Style: {profile_analysis['learning_style']}
        
        CRITICAL SKILL GAPS (HIGH PRIORITY):
        {json.dumps([gap['skill'] for gap in prioritized_gaps['critical_priority']], indent=2)}
        
        TOOLS USED:
        {json.dumps(list(profile_analysis['skill_inventory']['tool_proficiency'].keys()), indent=2)}
        
        REQUIREMENTS:
        1. Create a 4-week course with 8-10 modules per week
        2. Prioritize critical skill gaps (60% of content)
        3. Include tool-specific applications (Excel, SAP BPC, PowerBI)
        4. Progressive difficulty from basic to advanced
        5. Real-world scenario focus for business performance reporting
        6. Each module should be 800-1200 words (adjust based on priority)
        
        COURSE STRUCTURE FORMAT:
        {{
            "course_title": "Personalized course title",
            "total_duration": "4 weeks",
            "learning_objectives": ["objective1", "objective2", ...],
            "weeks": [
                {{
                    "week_number": 1,
                    "theme": "Week theme",
                    "focus_areas": ["area1", "area2"],
                    "modules": [
                        {{
                            "module_name": "Specific module title",
                            "word_count": 1000,
                            "priority_level": "critical|high|medium",
                            "skill_gap_addressed": "specific gap",
                            "tool_integration": ["Excel", "SAP BPC"],
                            "learning_outcome": "specific outcome"
                        }}
                    ]
                }}
            ]
        }}
        
        Make this highly personalized and directly applicable to their daily work in business performance reporting.
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "You are an expert learning and development specialist who creates highly personalized training programs. Create comprehensive, practical course structures that directly address individual needs. Always respond with valid JSON."},
                    {"role": "user", "content": planning_prompt}
                ],
                temperature=0.3,
                max_tokens=4000,
                response_format={"type": "json_object"}
            )
            
            course_structure = json.loads(response.choices[0].message.content)
            logger.info(f"✅ Intelligent course structure generated with {len(course_structure.get('weeks', []))} weeks")
            return course_structure
            
        except Exception as e:
            logger.error(f"❌ OpenAI course structure generation failed: {e}")
            # Fallback to basic structure
            return self._create_fallback_course_structure(profile_analysis, prioritized_gaps)

    def _create_detailed_module_specs(
        self, 
        course_plan: Dict[str, Any], 
        profile_analysis: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Create detailed specifications for each module."""
        
        logger.info("📋 Creating detailed module specifications...")
        
        detailed_modules = []
        module_id = 1
        
        for week in course_plan.get("weeks", []):
            for module in week.get("modules", []):
                detailed_spec = {
                    "module_id": f"M{module_id:02d}",
                    "module_name": module.get("module_name", f"Module {module_id}"),
                    "week_number": week.get("week_number", 1),
                    "word_count_target": module.get("word_count", 900),
                    "priority_level": module.get("priority_level", "medium"),
                    "skill_gap_addressed": module.get("skill_gap_addressed", ""),
                    "tool_integration": module.get("tool_integration", []),
                    "learning_outcome": module.get("learning_outcome", ""),
                    "personalization_context": {
                        "employee_name": profile_analysis["full_name"],
                        "current_role": profile_analysis["current_role"],
                        "career_goal": profile_analysis["career_path"]["target_position"],
                        "experience_level": profile_analysis["experience_level"],
                        "preferred_tools": list(profile_analysis["skill_inventory"]["tool_proficiency"].keys())
                    },
                    "content_specifications": {
                        "introduction_focus": "Real-world application in business performance reporting",
                        "examples_type": "Specific to financial analysis and business reporting",
                        "difficulty_level": self._determine_module_difficulty(module, profile_analysis),
                        "practical_emphasis": 0.7,  # 70% practical, 30% theoretical
                        "case_study_integration": True
                    }
                }
                
                detailed_modules.append(detailed_spec)
                module_id += 1
        
        logger.info(f"✅ Created detailed specifications for {len(detailed_modules)} modules")
        return detailed_modules

    def _generate_module_research_queries(
        self, 
        detailed_modules: List[Dict[str, Any]], 
        profile_analysis: Dict[str, Any]
    ) -> Dict[str, List[str]]:
        """Generate targeted research queries for each module."""
        
        logger.info("🔍 Generating targeted research queries for modules...")
        
        research_queries = {}
        
        for module in detailed_modules:
            module_id = module["module_id"]
            module_name = module["module_name"]
            tools = module["tool_integration"]
            skill_gap = module["skill_gap_addressed"]
            
            # Generate 4-5 targeted queries per module
            queries = []
            
            # Base query - module fundamentals
            base_query = f"{module_name} fundamentals for financial analysts"
            queries.append(base_query)
            
            # Tool-specific queries
            for tool in tools:
                tool_query = f"{tool} {module_name.lower()} best practices 2024"
                queries.append(tool_query)
            
            # Role-specific query
            role_query = f"{module_name.lower()} for business performance reporting analysts"
            queries.append(role_query)
            
            # Industry-specific query
            industry_query = f"financial analysis {skill_gap.lower()} case studies examples"
            queries.append(industry_query)
            
            # Advanced techniques query
            advanced_query = f"advanced {module_name.lower()} techniques senior analysts"
            queries.append(advanced_query)
            
            research_queries[module_id] = queries
        
        logger.info(f"✅ Generated research queries for {len(detailed_modules)} modules")
        return research_queries

    def _optimize_learning_path(
        self, 
        detailed_modules: List[Dict[str, Any]], 
        profile_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Optimize the learning path based on employee profile."""
        
        learning_optimization = {
            "sequencing_strategy": "progressive_skill_building",
            "difficulty_progression": self._create_difficulty_progression(detailed_modules),
            "skill_dependency_map": self._create_skill_dependencies(detailed_modules),
            "personalization_adjustments": {
                "accelerated_modules": [],  # Modules to fast-track due to existing skills
                "emphasis_modules": [],     # Modules needing extra focus
                "practical_focus": []       # Modules needing more hands-on work
            },
            "success_checkpoints": self._define_learning_checkpoints(detailed_modules)
        }
        
        # Identify modules for acceleration based on transferable skills
        transferable_skills = profile_analysis["skill_inventory"]["transferable_skills"]
        for skill_info in transferable_skills:
            if skill_info["relevance"] in ["high", "very_high"]:
                # Find modules that leverage this skill
                for module in detailed_modules:
                    if any(keyword in module["module_name"].lower() 
                           for keyword in skill_info["skill"].lower().split()):
                        learning_optimization["personalization_adjustments"]["accelerated_modules"].append(
                            module["module_id"]
                        )
        
        return learning_optimization

    def _define_success_metrics(
        self, 
        profile_analysis: Dict[str, Any], 
        prioritized_gaps: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Define success metrics for the personalized course."""
        
        return {
            "skill_acquisition_targets": {
                "critical_skills": len(prioritized_gaps["critical_priority"]),
                "target_proficiency": "intermediate_to_advanced",
                "completion_timeline": profile_analysis["career_path"]["timeline"]
            },
            "practical_application_metrics": {
                "tool_proficiency_improvement": "25% increase in advanced tool usage",
                "real_world_application": "Successfully complete 3 business reporting scenarios",
                "knowledge_retention": "80% retention rate after 30 days"
            },
            "career_progression_indicators": {
                "readiness_for_target_role": "75% skill gap closure",
                "performance_improvement": "Demonstrate advanced analytical capabilities",
                "confidence_building": "Self-assessed competency improvement"
            }
        }

    def _determine_module_difficulty(
        self, 
        module: Dict[str, Any], 
        profile_analysis: Dict[str, Any]
    ) -> str:
        """Determine appropriate difficulty level for a module."""
        
        priority = module.get("priority_level", "medium")
        experience = profile_analysis["experience_level"]
        
        if priority == "critical" and experience in ["junior", "junior_plus"]:
            return "beginner_to_intermediate"
        elif priority == "critical" and experience == "mid":
            return "intermediate"
        elif priority in ["high", "critical"] and experience == "senior":
            return "intermediate_to_advanced"
        else:
            return "beginner"

    def _create_difficulty_progression(self, detailed_modules: List[Dict[str, Any]]) -> List[str]:
        """Create a difficulty progression map for the course."""
        
        progression = []
        
        for i, module in enumerate(detailed_modules):
            week_number = module["week_number"]
            
            if week_number == 1:
                progression.append("foundation")
            elif week_number == 2:
                progression.append("intermediate")
            elif week_number == 3:
                progression.append("advanced")
            else:
                progression.append("expert_application")
        
        return progression

    def _create_skill_dependencies(self, detailed_modules: List[Dict[str, Any]]) -> Dict[str, List[str]]:
        """Create a map of skill dependencies between modules."""
        
        dependencies = {}
        
        for module in detailed_modules:
            module_id = module["module_id"]
            module_name = module["module_name"].lower()
            
            # Basic dependency rules
            if "advanced" in module_name:
                dependencies[module_id] = [f"M{int(module_id[1:]) - 1:02d}"]  # Depends on previous module
            elif "forecasting" in module_name:
                dependencies[module_id] = ["M01", "M02"]  # Depends on basic financial analysis
            else:
                dependencies[module_id] = []
        
        return dependencies

    def _define_learning_checkpoints(self, detailed_modules: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Define learning checkpoints throughout the course."""
        
        checkpoints = []
        
        for i, module in enumerate(detailed_modules):
            if (i + 1) % 5 == 0:  # Every 5 modules
                checkpoint = {
                    "checkpoint_id": f"CP{len(checkpoints) + 1}",
                    "after_module": module["module_id"],
                    "checkpoint_type": "skill_assessment",
                    "validation_method": "practical_exercise",
                    "success_criteria": "80% competency demonstration"
                }
                checkpoints.append(checkpoint)
        
        return checkpoints

    def _create_fallback_course_structure(
        self, 
        profile_analysis: Dict[str, Any], 
        prioritized_gaps: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create a fallback course structure if OpenAI fails."""
        
        logger.warning("🔄 Using fallback course structure generation")
        
        return {
            "course_title": f"Personalized Financial Analysis Training for {profile_analysis['full_name']}",
            "total_duration": "4 weeks",
            "learning_objectives": [
                "Master fundamental financial analysis concepts",
                "Develop advanced forecasting and budgeting skills",
                "Enhance data analysis capabilities for business reporting",
                "Apply tools effectively in professional context"
            ],
            "weeks": [
                {
                    "week_number": 1,
                    "theme": "Financial Analysis Fundamentals",
                    "modules": [
                        {
                            "module_name": "Introduction to Financial Analysis for Business Performance",
                            "word_count": 1000,
                            "priority_level": "critical",
                            "skill_gap_addressed": "Financial Analysis Fundamentals"
                        }
                    ]
                }
            ]
        }

    def generate_research_strategy_summary(self, course_plan: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a summary of the research strategy for the course."""
        
        research_strategy = course_plan.get("research_strategy", {})
        
        strategy_summary = {
            "total_modules": len(research_strategy),
            "total_research_queries": sum(len(queries) for queries in research_strategy.values()),
            "query_categories": {
                "tool_specific": 0,
                "role_specific": 0,
                "industry_specific": 0,
                "advanced_techniques": 0,
                "skill_development": 0
            },
            "search_optimization": {
                "domain_focus": ["finance", "education", "professional_development"],
                "content_types": ["best_practices", "case_studies", "tutorials", "industry_reports"],
                "recency_priority": "2023-2024 content preferred"
            }
        }
        
        # Count query categories
        for queries in research_strategy.values():
            for query in queries:
                query_lower = query.lower()
                if any(tool in query_lower for tool in ["excel", "sap", "powerbi"]):
                    strategy_summary["query_categories"]["tool_specific"] += 1
                elif "analyst" in query_lower or "reporting" in query_lower:
                    strategy_summary["query_categories"]["role_specific"] += 1
                elif "financial" in query_lower or "business" in query_lower:
                    strategy_summary["query_categories"]["industry_specific"] += 1
                elif "advanced" in query_lower or "senior" in query_lower:
                    strategy_summary["query_categories"]["advanced_techniques"] += 1
                elif any(skill in query_lower for skill in ["skill", "development", "learning", "training"]):
                    strategy_summary["query_categories"]["skill_development"] += 1
        
        return strategy_summary

if __name__ == "__main__":
    """Test the intelligent course planner with sample data."""
    
    print("🎯 Testing Intelligent Course Planner")
    print("=" * 50)
    
    planner = IntelligentCoursePlanner()
    
    # Load sample employee data
    sample_employee_data = {
        "employee_id": "KK001",
        "full_name": "Kubilaycan Karakas",
        "job_title_specific": "Junior Financial Analyst - Business Performance Reporting",
        "career_aspirations_next_role": "Senior Financial Analyst within 2-3 years",
        "learning_style": "Prefers practical application and real-world examples",
        "skills": [
            "Project Management (Advanced)",
            "Data Analysis (Conceptual - Non-Financial)",
            "Microsoft Office Suite (Excel - Intermediate)"
        ],
        "tools_software_used_regularly": [
            "Microsoft Excel (Heavy Use: Pivot Tables, Basic Formulas)",
            "SAP BPC (for data extraction)",
            "PowerBI"
        ]
    }
    
    sample_skills_gaps = {
        "Critical Skill Gaps": {
            "gaps": [
                {"skill": "Forecasting and Budgeting", "importance": "Critical"},
                {"skill": "Financial Data Analysis", "importance": "Critical"}
            ]
        },
        "Development Gaps": {
            "gaps": [
                {"skill": "Budget Management", "importance": "Important"}
            ]
        },
        "Transferable Skills": {
            "skills": [
                {"skill": "Project Management", "relevance": "high"}
            ]
        }
    }
    
    # Generate course plan
    course_plan = planner.generate_personalized_course_plan(
        sample_employee_data, sample_skills_gaps
    )
    
    print(f"✅ Generated course plan for {course_plan['course_metadata']['generated_for']}")
    print(f"📚 Course: {course_plan['course_structure']['course_title']}")
    print(f"📝 Modules: {len(course_plan['detailed_modules'])}")
    print(f"🔍 Research queries: {len(course_plan['research_strategy'])}")
    
    # Save results
    output_file = "sample_intelligent_course_plan.json"
    with open(output_file, 'w') as f:
        json.dump(course_plan, f, indent=2)
    
    print(f"💾 Results saved to: {output_file}")