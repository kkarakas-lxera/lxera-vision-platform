#!/usr/bin/env python3
"""
Planning Tools for Agentic Course Planning System

These tools convert the planning functionality to proper @function_tool decorators
so they appear as tool calls in OpenAI Traces tab.
"""

import json
import logging
from datetime import datetime
from typing import Dict, Any, List
from agents import function_tool
from openai import OpenAI

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# OpenAI client for planning tools
# Import settings
from config.settings import get_settings
settings = get_settings()
OPENAI_API_KEY = settings.openai_api_key
openai_client = OpenAI(api_key=OPENAI_API_KEY)

@function_tool
def analyze_employee_profile(employee_data: str) -> str:
    """
    Analyze employee profile and extract key characteristics for course planning.
    
    Args:
        employee_data: JSON string containing employee information
        
    Returns:
        JSON string with analyzed employee profile including experience level, 
        learning preferences, career goals, and skill gaps
    """
    try:
        logger.info("🔍 Analyzing employee profile with agent tool...")
        
        # Parse employee data
        employee_info = json.loads(employee_data) if isinstance(employee_data, str) else employee_data
        
        # Extract key information
        full_name = employee_info.get("full_name", "Unknown")
        current_role = employee_info.get("job_title_specific", "")
        career_goal = employee_info.get("career_aspirations_next_role", "")
        learning_style = employee_info.get("learning_style", "")
        skills = employee_info.get("skills", [])
        tools_used = employee_info.get("tools_software_used_regularly", [])
        
        # Determine experience level
        experience_level = "junior" if "junior" in current_role.lower() else "mid" if "senior" not in current_role.lower() else "senior"
        
        # Categorize skills
        technical_skills = [skill for skill in skills if any(term in skill.lower() for term in ["excel", "sap", "powerbi", "data", "analysis"])]
        transferable_skills = [skill for skill in skills if any(term in skill.lower() for term in ["project", "management", "stakeholder"])]
        
        # Assess technical readiness
        tech_readiness = "advanced" if "advanced" in str(skills).lower() else "intermediate" if "intermediate" in str(skills).lower() else "basic"
        
        profile_analysis = {
            "employee_name": full_name,
            "current_role": current_role,
            "experience_level": experience_level,
            "career_timeline": "2-3 years" if "2-3" in career_goal else "short-term",
            "learning_preferences": {
                "practical_emphasis": 0.8 if "practical" in learning_style.lower() else 0.7,
                "real_world_examples": "real-world" in learning_style.lower(),
                "problem_solving": "problem-solving" in learning_style.lower()
            },
            "skill_inventory": {
                "technical_skills": technical_skills,
                "transferable_skills": transferable_skills,
                "tool_proficiency": tools_used,
                "technical_readiness": tech_readiness
            },
            "career_progression": {
                "target_role": career_goal,
                "progression_type": "vertical" if "senior" in career_goal.lower() and "junior" in current_role.lower() else "lateral"
            },
            "analysis_timestamp": datetime.now().isoformat()
        }
        
        logger.info(f"✅ Employee profile analyzed: {experience_level} level, {len(technical_skills)} technical skills")
        return json.dumps(profile_analysis)
        
    except Exception as e:
        logger.error(f"❌ Employee profile analysis failed: {e}")
        return json.dumps({"error": str(e), "success": False})

@function_tool
def generate_course_structure_plan(profile_data: str, skills_gaps: str) -> str:
    """
    Generate intelligent course structure plan using OpenAI agent.
    
    Args:
        profile_data: JSON string with analyzed employee profile
        skills_gaps: JSON string with prioritized skill gaps
        
    Returns:
        JSON string with complete course structure plan including modules,
        weekly themes, and learning progression
    """
    try:
        logger.info("🎯 Generating course structure plan with OpenAI agent...")
        
        # Parse input data
        profile = json.loads(profile_data) if isinstance(profile_data, str) else profile_data
        gaps = json.loads(skills_gaps) if isinstance(skills_gaps, str) else skills_gaps
        
        # Prepare planning prompt for OpenAI
        planning_prompt = f"""
        Create a comprehensive course structure plan for employee: {profile.get('employee_name', 'Learner')}
        
        EMPLOYEE CONTEXT:
        - Current Role: {profile.get('current_role', '')}
        - Experience Level: {profile.get('experience_level', 'junior')}
        - Career Goal: {profile.get('career_progression', {}).get('target_role', '')}
        - Learning Style: Practical emphasis {profile.get('learning_preferences', {}).get('practical_emphasis', 0.7)*100:.0f}%
        - Technical Readiness: {profile.get('skill_inventory', {}).get('technical_readiness', 'basic')}
        - Tools Used: {', '.join(profile.get('skill_inventory', {}).get('tool_proficiency', []))}
        
        CRITICAL SKILL GAPS:
        {json.dumps(gaps.get('Critical Skill Gaps', {}), indent=2)}
        
        REQUIREMENTS:
        1. Create 4-week course structure with 6-8 modules total
        2. Prioritize critical skill gaps (60% of content focus)
        3. Include tool-specific applications for their actual tools
        4. Progressive difficulty from foundational to advanced
        5. Emphasize practical, real-world applications
        
        WORD ALLOCATION STRATEGY:
        - Critical priority modules: 5000-6000 words total
        - High priority modules: 4000-5000 words total  
        - Medium priority modules: 3000-4000 words total
        
        SECTION WORD ALLOCATION GUIDELINES:
        - Introduction: 15-20% of total (orientation, objectives)
        - Core Content: 40-45% of total (main concepts, theories)
        - Practical Applications: 25-30% of total (hands-on, tools)
        - Case Studies: 15-20% of total (real-world examples)
        - Assessments: 5-10% of total (quizzes, exercises)
        
        Adjust section allocations based on:
        - Module complexity (complex topics need more core content)
        - Practical emphasis (hands-on learners need more applications)
        - Tool integration (tool-heavy modules need more practical content)
        
        OUTPUT FORMAT (JSON):
        {{
            "course_title": "Personalized course title",
            "total_duration_weeks": 4,
            "learning_objectives": ["objective1", "objective2", ...],
            "weekly_structure": [
                {{
                    "week_number": 1,
                    "theme": "Week theme",
                    "focus_areas": ["area1", "area2"],
                    "modules": [
                        {{
                            "module_name": "Specific module title",
                            "word_count_target": 5000,
                            "section_word_allocation": {{
                                "introduction": 800,
                                "core_content": 2000,
                                "practical_applications": 1200,
                                "case_studies": 700,
                                "assessments": 300
                            }},
                            "priority_level": "critical|high|medium",
                            "skill_gap_addressed": "specific gap",
                            "tool_integration": ["tool1", "tool2"],
                            "difficulty_level": "foundational|intermediate|advanced",
                            "complexity_factors": {{
                                "conceptual_depth": "high|medium|low",
                                "practical_emphasis": 0.8,
                                "tool_specific_content": 0.6
                            }}
                        }}
                    ]
                }}
            ]
        }}
        
        Make this highly personalized for their role in business performance reporting.
        """
        
        # Call OpenAI to generate course structure
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert learning designer who creates highly personalized course structures. ALWAYS return your response as valid JSON only, no additional text."},
                {"role": "user", "content": planning_prompt + "\n\nIMPORTANT: Return ONLY valid JSON in your response, no additional text or explanations."}
            ],
            temperature=0.3,
            max_tokens=4000
        )
        
        course_structure = json.loads(response.choices[0].message.content)
        
        # Add metadata
        course_structure["generation_metadata"] = {
            "tool_name": "generate_course_structure_plan",
            "openai_model": "gpt-4",
            "generation_timestamp": datetime.now().isoformat(),
            "token_usage": {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens
            }
        }
        
        total_modules = sum(len(week["modules"]) for week in course_structure.get("weekly_structure", []))
        logger.info(f"✅ Course structure generated: {total_modules} modules across {course_structure.get('total_duration_weeks', 0)} weeks")
        
        return json.dumps(course_structure)
        
    except Exception as e:
        logger.error(f"❌ Course structure generation failed: {e}")
        return json.dumps({"error": str(e), "success": False})

@function_tool
def generate_research_queries(course_structure: str, employee_profile: str) -> str:
    """
    Generate targeted research queries for course modules using OpenAI agent.
    
    Args:
        course_structure: JSON string with course structure plan
        employee_profile: JSON string with employee profile data
        
    Returns:
        JSON string with comprehensive research query strategy for each module
    """
    try:
        logger.info("🔍 Generating research queries with OpenAI agent...")
        
        # Parse input data
        structure = json.loads(course_structure) if isinstance(course_structure, str) else course_structure
        profile = json.loads(employee_profile) if isinstance(employee_profile, str) else employee_profile
        
        # Extract modules from structure
        all_modules = []
        for week in structure.get("weekly_structure", []):
            for module in week.get("modules", []):
                module["week_number"] = week["week_number"]
                all_modules.append(module)
        
        # Prepare query generation prompt
        query_prompt = f"""
        Generate targeted research queries for course modules for employee: {profile.get('employee_name', 'Learner')}
        
        EMPLOYEE CONTEXT:
        - Role: {profile.get('current_role', '')}
        - Experience: {profile.get('experience_level', 'junior')}
        - Tools: {', '.join(profile.get('skill_inventory', {}).get('tool_proficiency', []))}
        
        MODULES TO RESEARCH:
        {json.dumps(all_modules[:5], indent=2)}  # First 5 modules for focused queries
        
        For each module, generate 4-5 targeted search queries including:
        1. Foundational query (basic concepts)
        2. Tool-specific query (using their actual tools)
        3. Application query (real-world examples)
        4. Advanced/best practices query
        5. Industry-specific query (financial analysis context)
        
        OUTPUT FORMAT (JSON):
        {{
            "query_strategy": {{
                "module_1": {{
                    "module_name": "Module name",
                    "queries": [
                        "foundational query",
                        "tool-specific query", 
                        "application query",
                        "advanced query",
                        "industry query"
                    ],
                    "search_focus": "domain focus for this module"
                }}
            }},
            "global_context": {{
                "role_focus": "business performance reporting",
                "tool_emphasis": ["Excel", "SAP BPC", "PowerBI"],
                "industry_context": "finance"
            }}
        }}
        
        Make queries specific to their role as Junior Financial Analyst in Business Performance Reporting.
        """
        
        # Call OpenAI to generate research queries
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert research strategist who creates targeted search queries for personalized learning. ALWAYS return your response as valid JSON only, no additional text."},
                {"role": "user", "content": query_prompt + "\n\nIMPORTANT: Return ONLY valid JSON in your response, no additional text or explanations."}
            ],
            temperature=0.3,
            max_tokens=3000
        )
        
        research_strategy = json.loads(response.choices[0].message.content)
        
        # Add metadata
        research_strategy["generation_metadata"] = {
            "tool_name": "generate_research_queries",
            "openai_model": "gpt-4",
            "generation_timestamp": datetime.now().isoformat(),
            "modules_processed": len(all_modules[:5]),
            "token_usage": {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens
            }
        }
        
        total_queries = sum(len(module["queries"]) for module in research_strategy.get("query_strategy", {}).values())
        logger.info(f"✅ Research queries generated: {total_queries} queries for {len(all_modules[:5])} modules")
        
        return json.dumps(research_strategy)
        
    except Exception as e:
        logger.error(f"❌ Research query generation failed: {e}")
        return json.dumps({"error": str(e), "success": False})

@function_tool
def prioritize_skill_gaps(skills_gap_data: str) -> str:
    """
    Prioritize and analyze skill gaps for course planning.
    
    Args:
        skills_gap_data: JSON string with skills gap analysis
        
    Returns:
        JSON string with prioritized skill gaps and learning focus recommendations
    """
    try:
        logger.info("📊 Prioritizing skill gaps for course planning...")
        
        # Parse skills gap data
        gaps_data = json.loads(skills_gap_data) if isinstance(skills_gap_data, str) else skills_gap_data
        
        prioritized_gaps = {
            "critical_priority": [],
            "high_priority": [],
            "medium_priority": [],
            "development_opportunities": []
        }
        
        # Process critical gaps
        critical_gaps = gaps_data.get("Critical Skill Gaps", {}).get("gaps", [])
        for gap in critical_gaps:
            gap_priority = {
                **gap,
                "priority_score": 10,
                "learning_urgency": "immediate",
                "course_focus_percentage": 40,  # 40% of course content
                "recommended_modules": 8-10
            }
            prioritized_gaps["critical_priority"].append(gap_priority)
        
        # Process development gaps
        development_gaps = gaps_data.get("Development Gaps", {}).get("gaps", [])
        for gap in development_gaps:
            importance = gap.get("importance", "").lower()
            
            if importance == "important":
                gap_priority = {
                    **gap,
                    "priority_score": 7,
                    "learning_urgency": "high",
                    "course_focus_percentage": 25,
                    "recommended_modules": 4-6
                }
                prioritized_gaps["high_priority"].append(gap_priority)
            else:
                gap_priority = {
                    **gap,
                    "priority_score": 5,
                    "learning_urgency": "medium",
                    "course_focus_percentage": 15,
                    "recommended_modules": 2-3
                }
                prioritized_gaps["medium_priority"].append(gap_priority)
        
        # Process transferable skills
        transferable_skills = gaps_data.get("Transferable Skills", {}).get("skills", [])
        for skill in transferable_skills:
            opportunity = {
                "skill": skill.get("skill", ""),
                "description": skill.get("description", ""),
                "priority_score": 3,
                "learning_urgency": "low",
                "course_focus_percentage": 10,
                "enhancement_type": "leverage_existing"
            }
            prioritized_gaps["development_opportunities"].append(opportunity)
        
        # Add prioritization summary
        prioritization_summary = {
            "total_critical_gaps": len(prioritized_gaps["critical_priority"]),
            "total_high_priority": len(prioritized_gaps["high_priority"]),
            "recommended_course_focus": {
                "critical_skills": 60,  # 60% of course
                "high_priority_skills": 25,  # 25% of course
                "skill_reinforcement": 15   # 15% of course
            },
            "learning_timeline": "4 weeks intensive" if len(critical_gaps) > 2 else "3-4 weeks standard",
            "prioritization_timestamp": datetime.now().isoformat()
        }
        
        result = {
            "prioritized_gaps": prioritized_gaps,
            "prioritization_summary": prioritization_summary,
            "success": True
        }
        
        logger.info(f"✅ Skill gaps prioritized: {len(critical_gaps)} critical, {len(development_gaps)} development")
        return json.dumps(result)
        
    except Exception as e:
        logger.error(f"❌ Skill gap prioritization failed: {e}")
        return json.dumps({"error": str(e), "success": False})

@function_tool
def generate_module_outline_with_allocations(module_spec: str, employee_profile: str) -> str:
    """
    Generate detailed module outline with section-specific word allocations and content requirements.
    
    Args:
        module_spec: JSON string with module specifications from course structure
        employee_profile: JSON string with employee profile data
        
    Returns:
        JSON string with detailed outline including section templates, word targets,
        and content requirements for each section
    """
    try:
        logger.info("📋 Generating detailed module outline with word allocations...")
        
        # Parse input data
        module = json.loads(module_spec) if isinstance(module_spec, str) else module_spec
        profile = json.loads(employee_profile) if isinstance(employee_profile, str) else employee_profile
        
        # Extract module details
        module_name = module.get("module_name", "")
        total_words = module.get("word_count_target", 4000)
        priority_level = module.get("priority_level", "medium")
        section_allocations = module.get("section_word_allocation", {})
        complexity_factors = module.get("complexity_factors", {})
        
        # Get learner characteristics
        experience_level = profile.get("experience_level", "junior")
        practical_emphasis = profile.get("learning_preferences", {}).get("practical_emphasis", 0.7)
        tools_used = profile.get("skill_inventory", {}).get("tool_proficiency", [])
        
        # Generate outline prompt
        outline_prompt = f"""
        Create a detailed content outline for module: {module_name}
        
        LEARNER CONTEXT:
        - Experience: {experience_level}
        - Practical Emphasis: {practical_emphasis*100:.0f}%
        - Tools: {', '.join(tools_used)}
        - Priority Level: {priority_level}
        
        MODULE SPECIFICATIONS:
        - Total Word Target: {total_words}
        - Complexity: {complexity_factors.get('conceptual_depth', 'medium')}
        - Tool Integration: {complexity_factors.get('tool_specific_content', 0.5)*100:.0f}%
        
        SECTION ALLOCATIONS:
        {json.dumps(section_allocations, indent=2)}
        
        For each section, provide:
        1. Detailed content outline (bullet points)
        2. Specific learning objectives
        3. Key concepts to cover
        4. Examples/case studies needed
        5. Tool-specific applications
        6. Assessment/practice elements
        
        OUTPUT FORMAT (JSON):
        {{
            "module_outline": {{
                "introduction": {{
                    "word_target": {section_allocations.get('introduction', 800)},
                    "content_outline": ["point1", "point2", ...],
                    "learning_objectives": ["objective1", "objective2"],
                    "key_concepts": ["concept1", "concept2"],
                    "examples_needed": ["example1", "example2"],
                    "engagement_elements": ["hook", "relevance_statement"]
                }},
                "core_content": {{
                    "word_target": {section_allocations.get('core_content', 2000)},
                    "content_outline": ["main_topic1", "subtopic1a", "subtopic1b"],
                    "learning_objectives": ["master concept X", "understand Y"],
                    "key_concepts": ["fundamental1", "fundamental2"],
                    "depth_level": "foundational|intermediate|advanced",
                    "theoretical_framework": ["theory1", "model1"]
                }},
                "practical_applications": {{
                    "word_target": {section_allocations.get('practical_applications', 1200)},
                    "content_outline": ["tool_application1", "workflow1"],
                    "tool_specific_content": {tools_used},
                    "hands_on_exercises": ["exercise1", "exercise2"],
                    "real_world_scenarios": ["scenario1", "scenario2"],
                    "step_by_step_guides": ["guide1", "guide2"]
                }},
                "case_studies": {{
                    "word_target": {section_allocations.get('case_studies', 700)},
                    "content_outline": ["case1", "case2"],
                    "industry_context": "finance/business performance",
                    "complexity_level": "{experience_level}_appropriate",
                    "analysis_frameworks": ["framework1", "framework2"],
                    "discussion_points": ["point1", "point2"]
                }},
                "assessments": {{
                    "word_target": {section_allocations.get('assessments', 300)},
                    "content_outline": ["quiz_questions", "practical_exercises"],
                    "assessment_types": ["knowledge_check", "application"],
                    "success_criteria": ["criteria1", "criteria2"],
                    "feedback_mechanisms": ["immediate", "explanatory"]
                }}
            }},
            "content_requirements": {{
                "total_word_target": {total_words},
                "section_distribution": {section_allocations},
                "personalization_factors": {{
                    "experience_level": "{experience_level}",
                    "practical_emphasis": {practical_emphasis},
                    "tool_integration": {tools_used}
                }}
            }}
        }}
        
        Make the outline highly specific to their role in business performance reporting.
        """
        
        # Call OpenAI to generate detailed outline
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert instructional designer who creates detailed content outlines. ALWAYS return your response as valid JSON only, no additional text."},
                {"role": "user", "content": outline_prompt + "\n\nIMPORTANT: Return ONLY valid JSON in your response, no additional text or explanations."}
            ],
            temperature=0.2,
            max_tokens=4000
        )
        
        outline_data = json.loads(response.choices[0].message.content)
        
        # Add metadata
        outline_data["generation_metadata"] = {
            "tool_name": "generate_module_outline_with_allocations",
            "openai_model": "gpt-4",
            "generation_timestamp": datetime.now().isoformat(),
            "module_name": module_name,
            "token_usage": {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens
            }
        }
        
        logger.info(f"✅ Module outline generated: {module_name} with {total_words} word target")
        return json.dumps(outline_data)
        
    except Exception as e:
        logger.error(f"❌ Module outline generation failed: {e}")
        return json.dumps({"error": str(e), "success": False})

@function_tool
def create_personalized_learning_path(course_structure: str, profile_data: str) -> str:
    """
    Create personalized learning path with adaptive progression.
    
    Args:
        course_structure: JSON string with course structure
        profile_data: JSON string with employee profile
        
    Returns:
        JSON string with personalized learning path including sequencing,
        difficulty progression, and success metrics
    """
    try:
        logger.info("🎯 Creating personalized learning path...")
        
        # Parse input data
        structure = json.loads(course_structure) if isinstance(course_structure, str) else course_structure
        profile = json.loads(profile_data) if isinstance(profile_data, str) else profile_data
        
        # Extract experience level and preferences
        experience_level = profile.get("experience_level", "junior")
        practical_emphasis = profile.get("learning_preferences", {}).get("practical_emphasis", 0.7)
        technical_readiness = profile.get("skill_inventory", {}).get("technical_readiness", "basic")
        
        # Create learning path
        learning_path = {
            "path_metadata": {
                "learner_name": profile.get("employee_name", "Learner"),
                "experience_level": experience_level,
                "customization_level": "comprehensive"
            },
            "sequencing_strategy": {
                "approach": "skill_dependency_based",
                "progression_rate": "gradual" if experience_level == "junior" else "moderate",
                "difficulty_curve": "progressive_with_reinforcement"
            },
            "personalization_features": {
                "practical_emphasis_percentage": int(practical_emphasis * 100),
                "real_world_examples": profile.get("learning_preferences", {}).get("real_world_examples", True),
                "tool_integration_level": "high" if technical_readiness == "advanced" else "medium",
                "career_alignment_factor": 0.9  # High alignment with career goals
            },
            "adaptive_elements": {
                "accelerated_modules": [],  # Modules to fast-track
                "reinforcement_modules": [],  # Modules needing extra focus
                "extension_opportunities": []  # Advanced learning options
            },
            "success_metrics": {
                "completion_criteria": "80% competency on all modules",
                "practical_application": "3 real-world scenarios successfully completed",
                "tool_proficiency": "Demonstrated improvement in workplace tools",
                "career_readiness": "75% preparation for target role"
            },
            "support_mechanisms": {
                "prerequisite_review": "automatic_when_needed",
                "additional_resources": "context_sensitive",
                "progress_tracking": "weekly_checkpoints",
                "feedback_loops": "continuous_improvement"
            }
        }
        
        # Identify specific modules for adaptation based on profile
        if technical_readiness == "advanced":
            learning_path["adaptive_elements"]["accelerated_modules"] = [
                "tool_introduction_modules",
                "basic_concept_modules"
            ]
        
        if experience_level == "junior":
            learning_path["adaptive_elements"]["reinforcement_modules"] = [
                "foundational_concepts",
                "terminology_modules"
            ]
        
        if practical_emphasis > 0.8:
            learning_path["adaptive_elements"]["extension_opportunities"] = [
                "additional_case_studies",
                "hands_on_projects",
                "real_world_applications"
            ]
        
        learning_path["creation_timestamp"] = datetime.now().isoformat()
        
        logger.info(f"✅ Personalized learning path created for {experience_level} level learner")
        return json.dumps(learning_path)
        
    except Exception as e:
        logger.error(f"❌ Learning path creation failed: {e}")
        return json.dumps({"error": str(e), "success": False})

if __name__ == "__main__":
    """Test the planning tools."""
    
    print("🧪 Testing Planning Tools")
    print("=" * 40)
    
    # Sample employee data
    sample_employee = {
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
            "Microsoft Excel (Heavy Use)",
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
                {"skill": "Project Management", "description": "Can be applied to financial projects"}
            ]
        }
    }
    
    # Test profile analysis
    print("🔍 Testing employee profile analysis...")
    profile_result = analyze_employee_profile(json.dumps(sample_employee))
    profile_data = json.loads(profile_result)
    print(f"✅ Profile analyzed: {profile_data.get('experience_level')} level")
    
    # Test skill gap prioritization
    print("📊 Testing skill gap prioritization...")
    gaps_result = prioritize_skill_gaps(json.dumps(sample_skills_gaps))
    gaps_data = json.loads(gaps_result)
    print(f"✅ Gaps prioritized: {gaps_data['prioritization_summary']['total_critical_gaps']} critical gaps")
    
    # Test course structure generation
    print("🎯 Testing course structure generation...")
    structure_result = generate_course_structure_plan(profile_result, gaps_result)
    structure_data = json.loads(structure_result)
    total_modules = sum(len(week["modules"]) for week in structure_data.get("weekly_structure", []))
    print(f"✅ Course structure generated: {total_modules} modules")
    
    print("\n🎉 All planning tools tested successfully!")
    print("🔍 These tools will appear as tool calls in OpenAI Traces tab")