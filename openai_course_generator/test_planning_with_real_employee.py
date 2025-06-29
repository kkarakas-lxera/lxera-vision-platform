#!/usr/bin/env python3
"""
Test Planning Agent with Real Employee Data from Database
This script verifies that the planning agent works correctly with real employee data.
"""

import os
import json
import asyncio
import logging
from datetime import datetime
from supabase import create_client
from intelligent_course_planner import IntelligentCoursePlanner

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def test_planning_with_database():
    """Test the planning agent with real employee data from Supabase."""
    
    try:
        logger.info("🚀 Starting Planning Agent Test with Real Employee Data")
        
        # 1. Connect to Supabase
        supabase_url = os.getenv('SUPABASE_URL', 'https://xwfweumeryrgbguwrocr.supabase.co')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not supabase_key:
            logger.error("❌ SUPABASE_SERVICE_ROLE_KEY not set in environment")
            logger.info("Please set: export SUPABASE_SERVICE_ROLE_KEY='your-key-here'")
            return None
            
        supabase = create_client(supabase_url, supabase_key)
        logger.info("✅ Connected to Supabase")
        
        # 2. Retrieve real employee (using the ID from your query)
        employee_id = "635676b4-97af-4e66-9c1d-4fedc714ca52"
        logger.info(f"📋 Retrieving employee: {employee_id}")
        
        # Get employee with user data
        result = supabase.table('employees').select("""
            id,
            position,
            department,
            career_goal,
            key_tools,
            company_id,
            skill_level,
            users!inner (
                full_name,
                email
            )
        """).eq('id', employee_id).single().execute()
        
        if not result.data:
            logger.error("❌ Employee not found")
            return None
            
        logger.info(f"✅ Retrieved employee: {result.data['users']['full_name']}")
        
        # 3. Transform to planning format
        employee_data = {
            'employee_id': result.data['id'],
            'full_name': result.data['users']['full_name'],
            'email': result.data['users']['email'],
            'job_title_specific': result.data['position'] or 'Software Developer',
            'department': result.data['department'],
            'career_aspirations_next_role': result.data['career_goal'] or 'Senior Developer within 2-3 years',
            'learning_style': 'Prefers practical application and real-world examples',
            'skills': [
                'Programming (Intermediate)',
                'Problem Solving (Advanced)',
                'Team Collaboration (Intermediate)'
            ],
            'tools_software_used_regularly': result.data['key_tools'] or ['VS Code', 'Git', 'Docker'],
            'background': f"{result.data['skill_level'] or 'intermediate'} level professional"
        }
        
        logger.info("📝 Employee Data Prepared:")
        logger.info(f"  - Name: {employee_data['full_name']}")
        logger.info(f"  - Position: {employee_data['job_title_specific']}")
        logger.info(f"  - Department: {employee_data['department']}")
        logger.info(f"  - Career Goal: {employee_data['career_aspirations_next_role']}")
        
        # 4. Create mock skills gaps (since employee has no skills profile yet)
        # In production, this would come from st_employee_skills_profile
        skills_gaps = {
            "Critical Skill Gaps": {
                "gaps": [
                    {"skill": "Advanced Python Programming", "importance": "Critical", "description": "Deep understanding of Python internals and advanced patterns"},
                    {"skill": "System Architecture Design", "importance": "Critical", "description": "Ability to design scalable distributed systems"}
                ]
            },
            "Development Gaps": {
                "gaps": [
                    {"skill": "Cloud Technologies (AWS/Azure)", "importance": "Important", "description": "Hands-on experience with cloud services"},
                    {"skill": "DevOps Practices", "importance": "Important", "description": "CI/CD pipelines and infrastructure as code"}
                ]
            },
            "Transferable Skills": {
                "skills": [
                    {"skill": "Problem Solving", "relevance": "high", "description": "Strong analytical skills applicable to architecture"},
                    {"skill": "Team Collaboration", "relevance": "medium", "description": "Experience working in cross-functional teams"}
                ]
            }
        }
        
        logger.info("📊 Skills Gap Analysis:")
        logger.info(f"  - Critical Gaps: {len(skills_gaps['Critical Skill Gaps']['gaps'])}")
        logger.info(f"  - Development Gaps: {len(skills_gaps['Development Gaps']['gaps'])}")
        logger.info(f"  - Transferable Skills: {len(skills_gaps['Transferable Skills']['skills'])}")
        
        # 5. Initialize and run the IntelligentCoursePlanner
        logger.info("\n🎯 Starting Intelligent Course Planning...")
        planner = IntelligentCoursePlanner()
        
        # Generate the personalized course plan
        course_plan = planner.generate_personalized_course_plan(
            employee_data, 
            skills_gaps
        )
        
        # 6. Display results
        logger.info("\n✅ Course Plan Generated Successfully!")
        logger.info(f"📚 Course Title: {course_plan['course_structure'].get('course_title', 'N/A')}")
        logger.info(f"📅 Duration: {course_plan['course_structure'].get('total_duration', 'N/A')}")
        logger.info(f"📝 Total Modules: {len(course_plan['detailed_modules'])}")
        logger.info(f"🔍 Research Queries Generated: {len(course_plan['research_strategy'])} modules")
        
        # Display learning objectives
        logger.info("\n🎯 Learning Objectives:")
        for i, objective in enumerate(course_plan['course_structure'].get('learning_objectives', [])[:5], 1):
            logger.info(f"  {i}. {objective}")
        
        # Display first few modules
        logger.info("\n📑 First 3 Modules:")
        for module in course_plan['detailed_modules'][:3]:
            logger.info(f"  - {module['module_id']}: {module['module_name']}")
            logger.info(f"    Week: {module['week_number']}, Priority: {module['priority_level']}")
            logger.info(f"    Skills Addressed: {module['skill_gap_addressed']}")
            logger.info(f"    Tools: {', '.join(module['tool_integration'])}")
        
        # Display research strategy summary
        research_summary = planner.generate_research_strategy_summary(course_plan)
        logger.info(f"\n🔍 Research Strategy Summary:")
        logger.info(f"  - Total Research Queries: {research_summary['total_research_queries']}")
        logger.info(f"  - Tool-Specific Queries: {research_summary['query_categories']['tool_specific']}")
        logger.info(f"  - Role-Specific Queries: {research_summary['query_categories']['role_specific']}")
        logger.info(f"  - Industry-Specific Queries: {research_summary['query_categories']['industry_specific']}")
        
        # Save results to file
        output_file = 'test_course_plan_output.json'
        with open(output_file, 'w') as f:
            json.dump(course_plan, f, indent=2)
        logger.info(f"\n💾 Full course plan saved to: {output_file}")
        
        # Save a summary file for easier reading
        summary = {
            "test_metadata": {
                "test_date": datetime.now().isoformat(),
                "employee_id": employee_id,
                "employee_name": employee_data['full_name'],
                "test_status": "SUCCESS"
            },
            "course_overview": {
                "title": course_plan['course_structure'].get('course_title'),
                "duration": course_plan['course_structure'].get('total_duration'),
                "total_modules": len(course_plan['detailed_modules']),
                "total_research_queries": research_summary['total_research_queries']
            },
            "skills_addressed": {
                "critical": [gap['skill'] for gap in skills_gaps['Critical Skill Gaps']['gaps']],
                "development": [gap['skill'] for gap in skills_gaps['Development Gaps']['gaps']]
            },
            "first_module": course_plan['detailed_modules'][0] if course_plan['detailed_modules'] else None,
            "research_queries_sample": list(course_plan['research_strategy'].values())[0] if course_plan['research_strategy'] else []
        }
        
        summary_file = 'test_planning_summary.json'
        with open(summary_file, 'w') as f:
            json.dump(summary, f, indent=2)
        logger.info(f"📄 Test summary saved to: {summary_file}")
        
        return course_plan
        
    except Exception as e:
        logger.error(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return None

def main():
    """Run the test."""
    logger.info("=" * 60)
    logger.info("PLANNING AGENT TEST WITH REAL EMPLOYEE DATA")
    logger.info("=" * 60)
    
    # Run the async test
    result = asyncio.run(test_planning_with_database())
    
    if result:
        logger.info("\n✅ TEST PASSED: Planning agent successfully generated course plan")
        logger.info("Next step: Test the Research Agent with the generated course plan")
    else:
        logger.info("\n❌ TEST FAILED: Please check the errors above")
    
    logger.info("=" * 60)

if __name__ == "__main__":
    main()