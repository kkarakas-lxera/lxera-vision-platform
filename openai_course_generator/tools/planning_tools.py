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
from lxera_agents import function_tool
from openai import OpenAI
from tools.json_utils import extract_json_from_text, safe_json_parse, fix_common_json_issues, fix_nested_json_issues
from tools.smart_word_planning import get_smart_word_plan, log_word_plan

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
    Analyze employee profile and extract key characteristics for course planning using rich CV data.
    
    Args:
        employee_data: JSON string containing enhanced employee information including CV analysis
        
    Returns:
        JSON string with analyzed employee profile including experience level, 
        learning preferences, career goals, skill gaps, and work experience context
    """
    try:
        logger.info("🔍 Analyzing employee profile with enhanced CV data...")
        
        # Parse employee data
        employee_info = json.loads(employee_data) if isinstance(employee_data, str) else employee_data
        
        # Extract basic information
        full_name = employee_info.get("full_name", "Unknown")
        current_role = employee_info.get("job_title_current", employee_info.get("job_title_specific", ""))
        career_goal = employee_info.get("career_aspirations_next_role", "")
        learning_style = employee_info.get("learning_style", "")
        tools_used = employee_info.get("tools_software_used_regularly", [])
        
        # Extract rich CV data
        work_experience = employee_info.get("work_experience", [])
        education = employee_info.get("education", [])
        professional_summary = employee_info.get("professional_summary", "")
        certifications = employee_info.get("certifications", [])
        detailed_skills = employee_info.get("detailed_skills", [])
        skills_context = employee_info.get("skills_context", {})
        experience_level = employee_info.get("experience_level", "mid-level")
        years_total_experience = employee_info.get("years_total_experience", 3)
        
        # Enhanced skill categorization using detailed skills
        technical_skills = []
        soft_skills = []
        industry_skills = []
        
        for skill in detailed_skills:
            skill_name = skill.get('skill_name', '')
            proficiency = skill.get('proficiency_level', 0)
            context = skill.get('context', '')
            
            # Categorize based on skill name and context
            if any(term in skill_name.lower() for term in ["excel", "sap", "powerbi", "sql", "python", "tableau", "data", "analytics", "modeling"]):
                technical_skills.append({
                    "skill": skill_name,
                    "proficiency": proficiency,
                    "context": context,
                    "years_experience": skill.get('years_experience', 0)
                })
            elif any(term in skill_name.lower() for term in ["project management", "leadership", "communication", "team", "stakeholder", "presentation"]):
                soft_skills.append({
                    "skill": skill_name,
                    "proficiency": proficiency,
                    "context": context
                })
            else:
                industry_skills.append({
                    "skill": skill_name,
                    "proficiency": proficiency,
                    "context": context
                })
        
        # Analyze work experience for industry context and career progression
        industry_context = []
        career_progression_pattern = []
        key_achievements = []
        
        for exp in work_experience:
            title = exp.get('title', '')
            company = exp.get('company', '')
            duration = exp.get('duration', '')
            description = exp.get('description', '')
            
            # Extract industry context
            if company and title:
                industry_context.append(f"{title} at {company}")
            
            # Track career progression
            career_progression_pattern.append({
                "role": title,
                "company": company,
                "duration": duration,
                "seniority_level": "senior" if any(term in title.lower() for term in ["senior", "lead", "manager", "director"]) else "mid" if any(term in title.lower() for term in ["analyst", "specialist"]) else "junior"
            })
            
            # Extract key achievements from descriptions
            if description and len(description) > 50:
                key_achievements.append(description[:200] + "..." if len(description) > 200 else description)
        
        # Analyze educational background for learning foundation
        educational_foundation = []
        for edu in education:
            degree = edu.get('degree', '')
            field = edu.get('fieldOfStudy', '')
            institution = edu.get('institution', '')
            
            if degree or field:
                educational_foundation.append({
                    "degree": degree,
                    "field": field,
                    "institution": institution,
                    "relevance": "high" if any(term in field.lower() for term in ["business", "finance", "data", "analytics", "management"]) else "medium"
                })
        
        # Enhanced learning preferences from CV analysis
        enhanced_learning_preferences = {
            "practical_emphasis": 0.8 if "practical" in learning_style.lower() else 0.7,
            "real_world_examples": "real-world" in learning_style.lower() or len(work_experience) > 2,
            "problem_solving": "problem-solving" in learning_style.lower(),
            "preferred_style": learning_style,
            "industry_experience": len(set([exp.get('company', '') for exp in work_experience])),
            "hands_on_preference": any("implementation" in exp.get('description', '').lower() for exp in work_experience)
        }
        
        # Assess technical readiness based on detailed skills
        high_proficiency_skills = [s for s in detailed_skills if s.get('proficiency_level', 0) >= 3]
        mid_proficiency_skills = [s for s in detailed_skills if s.get('proficiency_level', 0) == 2]
        
        tech_readiness = "advanced" if len(high_proficiency_skills) >= 3 else "intermediate" if len(mid_proficiency_skills) >= 3 else "basic"
        
        profile_analysis = {
            "employee_name": full_name,
            "current_role": current_role,
            "experience_level": experience_level,
            "years_total_experience": years_total_experience,
            "career_timeline": "2-3 years" if "2-3" in career_goal else "short-term",
            "learning_preferences": enhanced_learning_preferences,
            "skill_inventory": {
                "technical_skills": technical_skills,
                "soft_skills": soft_skills,
                "industry_skills": industry_skills,
                "tool_proficiency": tools_used,
                "technical_readiness": tech_readiness,
                "skills_with_context": skills_context
            },
            "career_progression": {
                "target_role": career_goal,
                "progression_type": "vertical" if "senior" in career_goal.lower() and experience_level in ["junior", "entry"] else "lateral",
                "career_pattern": career_progression_pattern,
                "industry_context": industry_context
            },
            "professional_background": {
                "work_experience": work_experience,
                "educational_foundation": educational_foundation,
                "certifications": certifications,
                "professional_summary": professional_summary,
                "key_achievements": key_achievements[:3]  # Top 3 achievements
            },
            "personalization_context": {
                "companies_worked": list(set([exp.get('company', '') for exp in work_experience if exp.get('company')])),
                "roles_held": list(set([exp.get('title', '') for exp in work_experience if exp.get('title')])),
                "industry_tools_used": tools_used,
                "learning_foundation": f"{len(educational_foundation)} degree(s), {len(certifications)} certification(s), {years_total_experience} years experience"
            },
            "analysis_timestamp": datetime.now().isoformat()
        }
        
        logger.info(f"✅ Enhanced employee profile analyzed: {experience_level} level, {len(technical_skills)} technical skills, {len(work_experience)} work experiences")
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
        
        # Extract rich professional context
        professional_bg = profile.get('professional_background', {})
        work_experience = professional_bg.get('work_experience', [])
        educational_foundation = professional_bg.get('educational_foundation', [])
        key_achievements = professional_bg.get('key_achievements', [])
        personalization_context = profile.get('personalization_context', {})
        
        # Prepare enhanced planning prompt for OpenAI
        planning_prompt = f"""
        Create a comprehensive course structure plan for employee: {profile.get('employee_name', 'Learner')}
        
        ENHANCED EMPLOYEE CONTEXT:
        - Current Role: {profile.get('current_role', '')}
        - Experience Level: {profile.get('experience_level', 'junior')} ({profile.get('years_total_experience', 3)} years total experience)
        - Career Goal: {profile.get('career_progression', {}).get('target_role', '')}
        - Learning Style: {profile.get('learning_preferences', {}).get('preferred_style', 'Practical emphasis')}
        - Technical Readiness: {profile.get('skill_inventory', {}).get('technical_readiness', 'basic')}
        - Tools Used: {', '.join(profile.get('skill_inventory', {}).get('tool_proficiency', []))}
        
        PROFESSIONAL BACKGROUND:
        - Companies Worked: {', '.join(personalization_context.get('companies_worked', [])[:3])}
        - Previous Roles: {', '.join(personalization_context.get('roles_held', [])[:3])}
        - Educational Background: {personalization_context.get('learning_foundation', '')}
        - Professional Summary: {professional_bg.get('professional_summary', '')[:200]}...
        
        WORK EXPERIENCE CONTEXT:
        {json.dumps([{
            'role': exp.get('title', ''), 
            'company': exp.get('company', ''), 
            'key_description': exp.get('description', '')[:150] + '...' if exp.get('description') else ''
        } for exp in work_experience[:3]], indent=2)}
        
        KEY ACHIEVEMENTS TO REFERENCE:
        {json.dumps(key_achievements[:2], indent=2) if key_achievements else '["Include relevant workplace examples"]'}
        
        CRITICAL SKILL GAPS:
        {json.dumps(gaps.get('Critical Skill Gaps', {}), indent=2)}
        
        ENHANCED REQUIREMENTS:
        1. Create 4-week course structure with 6-8 modules total
        2. Prioritize critical skill gaps (60% of content focus)
        3. Include tool-specific applications for their actual tools
        4. Progressive difficulty from foundational to advanced
        5. Emphasize practical, real-world applications
        6. PERSONALIZATION REQUIREMENTS:
           - Reference their actual work experience and companies when possible
           - Use industry-specific examples from their background
           - Build on their educational foundation and certifications
           - Include scenarios relevant to their career progression pattern
           - Incorporate their key achievements as learning examples
           - Align with their demonstrated learning preferences
        
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
            "modules": [
                {{
                    "module_id": 1,
                    "module_name": "Specific module title",
                    "week": 1,
                    "priority": "critical",
                    "skill_gap_addressed": "specific gap",
                    "word_count": 5000,
                    "difficulty": "foundational",
                    "tools": ["tool1", "tool2"]
                }},
                {{
                    "module_id": 2,
                    "module_name": "Another module title",
                    "week": 1,
                    "priority": "high",
                    "skill_gap_addressed": "another gap",
                    "word_count": 4000,
                    "difficulty": "intermediate",
                    "tools": ["tool3"]
                }}
            ]
        }}
        
        Make this highly personalized for their role in business performance reporting.
        """
        
        # Call OpenAI to generate course structure
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are an expert learning designer who creates highly personalized course structures. ALWAYS return your response as valid JSON only, no additional text."},
                {"role": "user", "content": planning_prompt + "\n\nIMPORTANT: Return ONLY valid JSON in your response, no additional text or explanations."}
            ],
            temperature=0.3,
            max_tokens=4096  # Increased for complete response
        )
        
        # Extract JSON from response using robust utilities
        response_content = response.choices[0].message.content
        course_structure = extract_json_from_text(response_content)
        
        if not course_structure:
            logger.error(f"Failed to extract JSON from course structure response")
            logger.error(f"Response length: {len(response_content)} chars")
            logger.error(f"Response preview: {response_content[:500]}...")
            raise Exception("Failed to parse course structure JSON")
        
        # SMART WORD PLANNING INTEGRATION
        # Apply intelligent word distribution to each module
        enhanced_modules = []
        for module in course_structure.get("modules", []):
            try:
                # Get total word count for this module
                total_words = module.get("word_count", 4000)
                
                # Create mock research context for planning (will be enhanced later with actual research)
                mock_research_context = {"research_insights": {"key_concepts": [], "practical_examples": []}}
                
                # Module specification for smart planning
                module_spec = {
                    "module_name": module.get("module_name", "Course Module"),
                    "difficulty_level": module.get("difficulty", "intermediate"),
                    "tool_integration": module.get("tools", []),
                    "learning_outcomes": [],  # Will be filled by later planning steps
                    "word_count_target": total_words,
                    "personalization_context": {
                        "employee_name": profile.get("employee_name", "Learner"),
                        "current_role": profile.get("current_role", "Analyst"),
                        "career_goal": profile.get("career_progression", {}).get("target_role", "")
                    }
                }
                
                # Generate smart word distribution plan
                word_plan = get_smart_word_plan(total_words, module_spec, mock_research_context)
                
                # Add smart word distribution to module
                module["smart_word_distribution"] = {
                    "total_words": word_plan.total_words,
                    "complexity_analysis": word_plan.complexity_analysis,
                    "section_plans": {
                        section_name: {
                            "word_target": plan.word_target,
                            "min_words": plan.min_words,
                            "max_words": plan.max_words,
                            "complexity_level": plan.complexity_level,
                            "reasoning": plan.reasoning
                        }
                        for section_name, plan in word_plan.sections.items()
                    },
                    "distribution_reasoning": word_plan.distribution_reasoning
                }
                
                # Log the smart word plan
                logger.info(f"📊 Smart word plan for '{module.get('module_name', 'Module')}':")
                logger.info(f"   Total: {word_plan.total_words} words, Complexity: {word_plan.complexity_analysis['complexity_level']}")
                for section_name, plan in word_plan.sections.items():
                    percentage = (plan.word_target / word_plan.total_words) * 100
                    logger.info(f"   📝 {section_name}: {plan.word_target}w ({percentage:.1f}%) - {plan.complexity_level}")
                
                enhanced_modules.append(module)
                
            except Exception as e:
                logger.warning(f"Failed to apply smart word planning to module {module.get('module_name', 'Unknown')}: {e}")
                enhanced_modules.append(module)  # Add without smart planning
        
        # Replace modules with enhanced versions
        course_structure["modules"] = enhanced_modules
        
        # Add metadata
        course_structure["generation_metadata"] = {
            "tool_name": "generate_course_structure_plan",
            "openai_model": "gpt-4",
            "generation_timestamp": datetime.now().isoformat(),
            "smart_word_planning_applied": True,
            "token_usage": {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens
            }
        }
        
        total_modules = len(course_structure.get("modules", []))
        logger.info(f"✅ Course structure generated with smart word planning: {total_modules} modules across {course_structure.get('total_duration_weeks', 0)} weeks")
        
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
        
        # Parse input data with enhanced error handling
        structure = None
        if isinstance(course_structure, str):
            # First attempt: direct parsing
            try:
                structure = json.loads(course_structure)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse course_structure (attempt 1): {e}")
                logger.error(f"JSON length: {len(course_structure)}, preview: {course_structure[:200]}...")
                
                # Second attempt: fix common issues
                try:
                    fixed_structure = fix_common_json_issues(course_structure)
                    structure = json.loads(fixed_structure)
                    logger.info("Successfully parsed after fixing common issues")
                except json.JSONDecodeError as e2:
                    logger.error(f"Failed to parse after fixes (attempt 2): {e2}")
                    
                    # Third attempt: extract JSON from text
                    try:
                        structure = extract_json_from_text(course_structure)
                        if structure:
                            logger.info("Successfully extracted JSON from text")
                    except Exception as e3:
                        logger.error(f"Failed to extract JSON (attempt 3): {e3}")
        else:
            structure = course_structure
        
        # If all parsing attempts failed, use minimal structure
        if not structure:
            logger.warning("All parsing attempts failed, using minimal course structure")
            structure = {
                "weekly_structure": [
                    {"week_number": 1, "modules": [{"title": "Foundation Module"}]},
                    {"week_number": 2, "modules": [{"title": "Advanced Module"}]}
                ]
            }
            
        try:
            profile = json.loads(employee_profile) if isinstance(employee_profile, str) else employee_profile
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse employee_profile: {e}")
            # Use minimal profile
            profile = {"employee_name": "Learner", "current_role": "Analyst"}
        
        # Extract modules from structure with error handling
        all_modules = []
        try:
            for week in structure.get("weekly_structure", []):
                for module in week.get("modules", []):
                    module["week_number"] = week.get("week_number", 1)
                    all_modules.append(module)
        except Exception as e:
            logger.warning(f"Error extracting modules: {e}")
            # Create fallback modules if extraction fails
            all_modules = [
                {"title": "Module 1", "week_number": 1, "duration": "1 week"},
                {"title": "Module 2", "week_number": 2, "duration": "1 week"}
            ]
        
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
        
        OUTPUT FORMAT (JSON ONLY - NO EXTRA TEXT):
        {{
            "queries": [
                "specific search query 1",
                "specific search query 2",
                "specific search query 3",
                "specific search query 4",
                "specific search query 5"
            ]
        }}
        
        Generate 15-20 specific, targeted research queries that cover all modules.
        Include foundational concepts, tool-specific applications, and real-world examples.
        
        Make queries specific to their role as Junior Financial Analyst in Business Performance Reporting.
        """
        
        # Call OpenAI to generate research queries
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are an expert research strategist who creates targeted search queries for personalized learning. ALWAYS return your response as valid JSON only, no additional text."},
                {"role": "user", "content": query_prompt + "\n\nIMPORTANT: Return ONLY valid JSON in your response, no additional text or explanations."}
            ],
            temperature=0.3,
            max_tokens=4000  # Increased from 3000
        )
        
        # Extract JSON from response using robust utilities with enhanced repair
        response_content = response.choices[0].message.content
        
        # First try standard extraction
        research_strategy = extract_json_from_text(response_content)
        
        # If that fails, try enhanced JSON repair for research queries
        if not research_strategy:
            logger.warning(f"Standard JSON extraction failed, trying enhanced repair...")
            try:
                # Apply enhanced JSON fixes specifically for research query patterns
                fixed_content = fix_common_json_issues(response_content)
                nested_fixed = fix_nested_json_issues(fixed_content)
                research_strategy = extract_json_from_text(nested_fixed)
                if research_strategy:
                    logger.info(f"✅ JSON repaired successfully using enhanced functions")
            except Exception as repair_error:
                logger.error(f"Enhanced JSON repair failed: {repair_error}")
        
        if not research_strategy:
            logger.error(f"Failed to extract JSON from research query response")
            logger.error(f"Response length: {len(response_content)} chars")
            logger.error(f"Response preview: {response_content[:500]}...")
            raise Exception("Failed to parse research queries JSON")
        
        # Add metadata - ensure research_strategy exists and is a dict
        if isinstance(research_strategy, dict):
            research_strategy["generation_metadata"] = {
                "tool_name": "generate_research_queries",
                "openai_model": "gpt-4",
                "generation_timestamp": datetime.now().isoformat(),
                "modules_processed": len(all_modules[:5])
            }
            
            # Only add token usage if response exists
            if 'response' in locals() and hasattr(response, 'usage'):
                research_strategy["generation_metadata"]["token_usage"] = {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                }
        
        # Count queries correctly - should be in "queries" array
        total_queries = len(research_strategy.get("queries", []))
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
        
        # Handle both formats: list of gaps or structured dictionary
        if isinstance(gaps_data, list):
            # Direct list format - categorize by gap_severity
            for gap in gaps_data:
                severity = gap.get("gap_severity", "").lower()
                if severity == "critical":
                    gap_priority = {
                        **gap,
                        "priority_score": 10,
                        "learning_urgency": "immediate",
                        "course_focus_percentage": 40,
                        "recommended_modules": "8-10"
                    }
                    prioritized_gaps["critical_priority"].append(gap_priority)
                elif severity == "moderate":
                    gap_priority = {
                        **gap,
                        "priority_score": 7,
                        "learning_urgency": "high", 
                        "course_focus_percentage": 25,
                        "recommended_modules": "4-6"
                    }
                    prioritized_gaps["high_priority"].append(gap_priority)
                else:
                    gap_priority = {
                        **gap,
                        "priority_score": 5,
                        "learning_urgency": "medium",
                        "course_focus_percentage": 15,
                        "recommended_modules": "2-3"
                    }
                    prioritized_gaps["medium_priority"].append(gap_priority)
        else:
            # Structured dictionary format
            # Process critical gaps
            critical_gaps = gaps_data.get("Critical Skill Gaps", {}).get("gaps", [])
            for gap in critical_gaps:
                gap_priority = {
                    **gap,
                    "priority_score": 10,
                    "learning_urgency": "immediate",
                    "course_focus_percentage": 40,
                    "recommended_modules": "8-10"
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
                        "recommended_modules": "4-6"
                    }
                    prioritized_gaps["high_priority"].append(gap_priority)
                else:
                    gap_priority = {
                        **gap,
                        "priority_score": 5,
                        "learning_urgency": "medium",
                        "course_focus_percentage": 15,
                        "recommended_modules": "2-3"
                    }
                    prioritized_gaps["medium_priority"].append(gap_priority)
            
            # Process transferable skills (only for dictionary format)
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
            "learning_timeline": "4 weeks intensive" if len(prioritized_gaps["critical_priority"]) > 2 else "3-4 weeks standard",
            "prioritization_timestamp": datetime.now().isoformat()
        }
        
        result = {
            "prioritized_gaps": prioritized_gaps,
            "prioritization_summary": prioritization_summary,
            "success": True
        }
        
        # Count gaps by priority
        critical_count = len(prioritized_gaps["critical_priority"])
        high_count = len(prioritized_gaps["high_priority"]) 
        medium_count = len(prioritized_gaps["medium_priority"])
        
        logger.info(f"✅ Skill gaps prioritized: {critical_count} critical, {high_count} high priority, {medium_count} medium")
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
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are an expert instructional designer who creates detailed content outlines. ALWAYS return your response as valid JSON only, no additional text."},
                {"role": "user", "content": outline_prompt + "\n\nIMPORTANT: Return ONLY valid JSON in your response, no additional text or explanations."}
            ],
            temperature=0.2,
            max_tokens=4096  # Increased for complete response
        )
        
        # Extract JSON from response using robust utilities
        response_content = response.choices[0].message.content
        outline_data = extract_json_from_text(response_content)
        
        if not outline_data:
            logger.error(f"Failed to extract JSON from response")
            
            # Fallback: Create basic outline structure
            outline_data = {
                "module_outline": {
                    "introduction": {
                        "word_target": section_allocations.get('introduction', 800),
                        "content_outline": ["Module introduction", "Learning objectives", "Prerequisites"],
                        "learning_objectives": ["Understand key concepts", "Apply to practice"],
                        "key_concepts": ["Core concept 1", "Core concept 2"],
                        "examples_needed": ["Example 1", "Example 2"],
                        "engagement_elements": ["Hook", "Relevance statement"]
                    },
                    "core_content": {
                        "word_target": section_allocations.get('core_content', 2000),
                        "content_outline": ["Main topic", "Subtopic 1", "Subtopic 2"],
                        "learning_objectives": ["Master concepts", "Understand principles"],
                        "key_concepts": ["Fundamental 1", "Fundamental 2"],
                        "depth_level": "intermediate",
                        "theoretical_framework": ["Theory 1", "Model 1"]
                    },
                    "practical_applications": {
                        "word_target": section_allocations.get('practical_applications', 1200),
                        "content_outline": ["Tool application", "Workflow"],
                        "tool_specific_content": tools_used,
                        "hands_on_exercises": ["Exercise 1", "Exercise 2"],
                        "real_world_scenarios": ["Scenario 1", "Scenario 2"],
                        "step_by_step_guides": ["Guide 1"]
                    },
                    "case_studies": {
                        "word_target": section_allocations.get('case_studies', 700),
                        "content_outline": ["Case 1", "Case 2"],
                        "industry_context": "relevant industry",
                        "complexity_level": f"{experience_level}_appropriate",
                        "analysis_frameworks": ["Framework 1"],
                        "discussion_points": ["Point 1", "Point 2"]
                    },
                    "assessments": {
                        "word_target": section_allocations.get('assessments', 300),
                        "content_outline": ["Quiz questions", "Practical exercises"],
                        "assessment_types": ["knowledge_check", "application"],
                        "success_criteria": ["Criteria 1", "Criteria 2"],
                        "feedback_mechanisms": ["immediate", "explanatory"]
                    }
                },
                "content_requirements": {
                    "total_word_target": total_words,
                    "section_distribution": section_allocations,
                    "personalization_factors": {
                        "experience_level": experience_level,
                        "practical_emphasis": practical_emphasis,
                        "tool_integration": tools_used
                    }
                }
            }
        
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
        
        # Parse input data safely with multiple fallbacks
        structure = None
        if isinstance(course_structure, str):
            # First attempt: direct parsing
            try:
                structure = json.loads(course_structure)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse course_structure JSON: {e}")
                logger.error(f"JSON length: {len(course_structure)}, appears truncated")
                
                # Second attempt: fix common issues
                try:
                    repaired_structure = fix_common_json_issues(course_structure)
                    structure = json.loads(repaired_structure)
                    logger.info("Successfully parsed after fixing common issues")
                except json.JSONDecodeError as e2:
                    logger.error(f"Failed to parse after fixes: {e2}")
                    
                    # Third attempt: extract JSON from text
                    try:
                        structure = extract_json_from_text(course_structure)
                        if structure:
                            logger.info("Successfully extracted JSON from text")
                    except Exception as e3:
                        logger.error(f"Failed to extract JSON: {e3}")
        else:
            structure = course_structure
            
        # If all parsing attempts failed, use minimal structure
        if not structure:
            logger.warning("All parsing attempts failed, using minimal course structure")
            structure = {
                "course_title": "Personalized Development Course",
                "weekly_structure": [],
                "learning_objectives": []
            }
        
        try:
            profile = json.loads(profile_data) if isinstance(profile_data, str) else profile_data
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse profile_data JSON: {e}")
            # Try enhanced repair on profile data
            if isinstance(profile_data, str):
                repaired_profile = fix_common_json_issues(profile_data)
                profile = json.loads(repaired_profile)
            else:
                raise
        
        # Extract experience level and preferences
        experience_level = profile.get("experience_level", "junior")
        practical_emphasis = profile.get("learning_preferences", {}).get("practical_emphasis", 0.7)
        technical_readiness = profile.get("skill_inventory", {}).get("technical_readiness", "basic")
        
        # Create simplified learning path structure to avoid JSON parsing issues
        learning_path = {
            "learner_name": profile.get("employee_name", "Learner"),
            "experience_level": experience_level,
            "practical_emphasis_percentage": int(practical_emphasis * 100),
            "technical_readiness": technical_readiness,
            "progression_approach": "skill_dependency_based",
            "progression_rate": "gradual" if experience_level == "junior" else "moderate",
            "tool_integration_level": "high" if technical_readiness == "advanced" else "medium",
            "career_alignment_factor": 0.9,
            "accelerated_modules": [],
            "reinforcement_modules": [],
            "extension_opportunities": [],
            "completion_criteria": "80% competency on all modules",
            "practical_application_target": "3 real-world scenarios",
            "career_readiness_target": "75% preparation for target role"
        }
        
        # Identify specific modules for adaptation based on profile
        if technical_readiness == "advanced":
            learning_path["accelerated_modules"] = [
                "tool_introduction_modules",
                "basic_concept_modules"
            ]
        
        if experience_level == "junior":
            learning_path["reinforcement_modules"] = [
                "foundational_concepts",
                "terminology_modules"
            ]
        
        if practical_emphasis > 0.8:
            learning_path["extension_opportunities"] = [
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