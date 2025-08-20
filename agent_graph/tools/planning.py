#!/usr/bin/env python3
"""
Standalone Planning Tools - No lxera-agents dependency
1:1 replacement using Ollama service for LLM calls.
"""

import json
import logging
from datetime import datetime
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

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
        
        # Parse employee data with JSON fixing for malformed LLM output
        if isinstance(employee_data, str):
            try:
                employee_info = json.loads(employee_data)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse employee_data: {e}")
                logger.error(f"Raw employee_data: {repr(employee_data[:200])}...")
                return json.dumps({
                    "error": "Invalid employee data format",
                    "raw_data_preview": employee_data[:100] if len(employee_data) > 100 else employee_data
                })
        else:
            employee_info = employee_data
        
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


def generate_course_structure_plan(profile_data: str, skills_gaps: str) -> str:
    """
    Generate intelligent course structure plan using Ollama.
    
    Args:
        profile_data: JSON string with analyzed employee profile
        skills_gaps: JSON string with prioritized skill gaps
        
    Returns:
        JSON string with complete course structure plan including modules,
        weekly themes, and learning progression
    """
    try:
        logger.info("🎯 Generating course structure plan with Ollama...")
        
        # Parse input data with JSON fixing
        if isinstance(profile_data, str):
            try:
                profile = json.loads(profile_data)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse profile_data: {e}")
                profile = {"error": "Invalid profile data"}
        else:
            profile = profile_data
            
        if isinstance(skills_gaps, str):
            try:
                gaps = json.loads(skills_gaps)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse skills_gaps: {e}")
                gaps = {"error": "Invalid gaps data"}
        else:
            gaps = skills_gaps
        
        # Extract rich professional context
        professional_bg = profile.get('professional_background', {})
        work_experience = professional_bg.get('work_experience', [])
        educational_foundation = professional_bg.get('educational_foundation', [])
        key_achievements = professional_bg.get('key_achievements', [])
        personalization_context = profile.get('personalization_context', {})
        
        # Prepare enhanced planning prompt for Ollama
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
        
        OUTPUT FORMAT (JSON ONLY):
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
                }}
            ]
        }}
        
        Make this highly personalized for their role in business performance reporting.
        """
        
        # Use Ollama service for generation
        from ..services.ollama_service import get_chat_ollama
        from langchain_core.messages import SystemMessage, HumanMessage
        
        llm = get_chat_ollama("qwen3:14b")
        
        messages = [
            SystemMessage(content="You are an expert learning designer who creates highly personalized course structures. ALWAYS return your response as valid JSON only, no additional text."),
            HumanMessage(content=planning_prompt + "\n\nIMPORTANT: Return ONLY valid JSON in your response, no additional text or explanations.")
        ]
        
        response = llm.invoke(messages)
        response_content = response.content
        
        # Extract JSON from response (handle thinking mode)
        def extract_json_from_response(content: str) -> dict:
            # Handle thinking mode
            if '<think>' in content and '</think>' in content:
                json_start = content.find('</think>') + len('</think>')
                content = content[json_start:].strip()
            
            # Try to find JSON block markers
            if '```json' in content:
                start = content.find('```json') + len('```json')
                end = content.find('```', start)
                if end != -1:
                    content = content[start:end].strip()
            elif '```' in content:
                start = content.find('```') + 3
                end = content.find('```', start)
                if end != -1:
                    content = content[start:end].strip()
            
            # Find JSON object boundaries
            import re
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                content = json_match.group(0)
            
            return json.loads(content.strip())
        
        course_structure = extract_json_from_response(response_content)
        
        # Ensure course_structure is a dictionary, not a list
        if isinstance(course_structure, list):
            dict_item = next((item for item in course_structure if isinstance(item, dict)), None)
            if dict_item:
                course_structure = dict_item
                logger.info("🔧 Converted list response to dictionary structure")
            else:
                logger.error(f"❌ course_structure is a list without dictionary elements")
                raise Exception("Course structure response is a list, not a dictionary")
        
        # Add metadata
        course_structure["generation_metadata"] = {
            "tool_name": "generate_course_structure_plan",
            "model": "qwen3:14b",
            "generation_timestamp": datetime.now().isoformat()
        }
        
        total_modules = len(course_structure.get("modules", []))
        logger.info(f"✅ Course structure generated: {total_modules} modules across {course_structure.get('total_duration_weeks', 0)} weeks")
        
        return json.dumps(course_structure)
        
    except Exception as e:
        logger.error(f"❌ Course structure generation failed: {e}")
        return json.dumps({"error": str(e), "success": False})


def generate_research_queries(course_structure: str, employee_profile: str) -> str:
    """
    Generate targeted research queries for course modules using Ollama.
    
    Args:
        course_structure: JSON string with course structure plan
        employee_profile: JSON string with employee profile data
        
    Returns:
        JSON string with comprehensive research query strategy for each module
    """
    try:
        logger.info("🔍 Generating research queries with Ollama...")
        
        # Parse input data with enhanced error handling
        try:
            structure = json.loads(course_structure) if isinstance(course_structure, str) else course_structure
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse course_structure: {e}")
            # Use minimal structure
            structure = {
                "modules": [
                    {"module_name": "Foundation Module", "week": 1},
                    {"module_name": "Advanced Module", "week": 2}
                ]
            }
            
        try:
            profile = json.loads(employee_profile) if isinstance(employee_profile, str) else employee_profile
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse employee_profile: {e}")
            profile = {"employee_name": "Learner", "current_role": "Analyst"}
        
        # Extract modules from structure
        all_modules = structure.get("modules", [])
        
        # Prepare query generation prompt
        query_prompt = f"""
        Generate targeted research queries for course modules for employee: {profile.get('employee_name', 'Learner')}
        
        EMPLOYEE CONTEXT:
        - Role: {profile.get('current_role', '')}
        - Experience: {profile.get('experience_level', 'junior')}
        - Tools: {', '.join(profile.get('skill_inventory', {}).get('tool_proficiency', []))}
        
        MODULES TO RESEARCH:
        {json.dumps(all_modules[:5], indent=2)}
        
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
        """
        
        # Use Ollama service for generation
        from ..services.ollama_service import get_chat_ollama
        from langchain_core.messages import SystemMessage, HumanMessage
        
        llm = get_chat_ollama("qwen3:14b")
        
        messages = [
            SystemMessage(content="You are an expert research strategist who creates targeted search queries for personalized learning. ALWAYS return your response as valid JSON only, no additional text."),
            HumanMessage(content=query_prompt + "\n\nIMPORTANT: Return ONLY valid JSON in your response, no additional text or explanations.")
        ]
        
        response = llm.invoke(messages)
        response_content = response.content
        
        # Extract JSON from response (same function as above)
        def extract_json_from_response(content: str) -> dict:
            if '<think>' in content and '</think>' in content:
                json_start = content.find('</think>') + len('</think>')
                content = content[json_start:].strip()
            
            if '```json' in content:
                start = content.find('```json') + len('```json')
                end = content.find('```', start)
                if end != -1:
                    content = content[start:end].strip()
            elif '```' in content:
                start = content.find('```') + 3
                end = content.find('```', start)
                if end != -1:
                    content = content[start:end].strip()
            
            import re
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                content = json_match.group(0)
            
            return json.loads(content.strip())
        
        research_strategy = extract_json_from_response(response_content)
        
        # Add metadata
        if isinstance(research_strategy, dict):
            research_strategy["generation_metadata"] = {
                "tool_name": "generate_research_queries",
                "model": "qwen3:14b",
                "generation_timestamp": datetime.now().isoformat(),
                "modules_processed": len(all_modules[:5])
            }
        
        # Count queries correctly
        total_queries = len(research_strategy.get("queries", []))
        logger.info(f"✅ Research queries generated: {total_queries} queries for {len(all_modules[:5])} modules")
        
        return json.dumps(research_strategy)
        
    except Exception as e:
        logger.error(f"❌ Research query generation failed: {e}")
        return json.dumps({"error": str(e), "success": False})
