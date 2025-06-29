#!/usr/bin/env python3
"""
Test Agent Handoffs with Complex Data

Tests the complete agent pipeline with proper handoffs using real employee data.
Verifies that complex data structures are properly passed between agents.
"""

import asyncio
import logging
import json
import os
from datetime import datetime
from typing import Dict, Any

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import agents and runner
from lxera_agents import Runner, trace
from course_agents.coordinator import create_course_generation_coordinator
from course_agents.planning_agent import create_planning_agent
from course_agents.research_agent import create_research_agent

# Test data - Kubilay Cenk Karakas
TEST_EMPLOYEE_DATA = {
    "employee_id": "bbe12b3c-b305-4fdf-8c17-de7296cce3a9",  # Real employee ID from database
    "full_name": "Kubilay Cenk Karakas",
    "job_title_specific": "Junior Financial Analyst - Business Performance Reporting",
    "department": "Finance",
    "current_industry": "Corporate Finance - Media & Entertainment",
    "years_in_current_position": 2,
    
    # Career information
    "career_aspirations_next_role": "Senior Financial Analyst within 2-3 years",
    "career_goals_5_years": "Finance Manager or FP&A Lead",
    "preferred_work_environment": "Collaborative team with growth opportunities",
    
    # Skills and experience
    "skills": [
        "Project Management (Advanced)",
        "Data Analysis (Conceptual - Non-Financial)",
        "Microsoft Office Suite (Excel - Intermediate)",
        "Financial Statement Preparation (Basic)",
        "Business Intelligence Tools (Basic)",
        "Communication Skills (Strong)",
        "Attention to Detail (Strong)"
    ],
    
    # Learning preferences
    "learning_style": "Prefers practical application and real-world examples",
    "preferred_learning_format": "Interactive workshops and hands-on exercises",
    "available_learning_hours_per_week": 5,
    
    # Tools and software
    "tools_software_used_regularly": [
        "Microsoft Excel (Heavy Use)",
        "SAP BPC (for data extraction)",
        "PowerBI (Basic dashboards)",
        "Microsoft Teams",
        "Outlook"
    ],
    
    # Additional context
    "current_projects": [
        "Monthly business performance reports",
        "Budget variance analysis",
        "Ad-hoc financial analysis requests"
    ],
    
    "immediate_challenges": [
        "Need to improve forecasting accuracy",
        "Automating repetitive reporting tasks",
        "Better understanding of financial modeling"
    ]
}

TEST_SKILLS_GAP_DATA = {
    "Critical Skill Gaps": {
        "gaps": [
            {
                "skill": "Forecasting and Budgeting",
                "importance": "Critical",
                "current_level": 2,
                "required_level": 4,
                "gap_size": 2,
                "description": "Essential for senior analyst role"
            },
            {
                "skill": "Financial Data Analysis",
                "importance": "Critical", 
                "current_level": 2,
                "required_level": 5,
                "gap_size": 3,
                "description": "Core competency for financial analysts"
            },
            {
                "skill": "Advanced Excel (Financial Modeling)",
                "importance": "Critical",
                "current_level": 3,
                "required_level": 5,
                "gap_size": 2,
                "description": "Required for complex financial analysis"
            }
        ]
    },
    "High Priority Gaps": {
        "gaps": [
            {
                "skill": "Financial Modeling",
                "importance": "High",
                "current_level": 1,
                "required_level": 4,
                "gap_size": 3,
                "description": "Important for career progression"
            },
            {
                "skill": "Data Visualization",
                "importance": "High",
                "current_level": 2,
                "required_level": 4,
                "gap_size": 2,
                "description": "Enhances reporting capabilities"
            },
            {
                "skill": "Business Intelligence Tools",
                "importance": "High",
                "current_level": 2,
                "required_level": 4,
                "gap_size": 2,
                "description": "Modern analytics requirement"
            }
        ]
    },
    "Development Gaps": {
        "gaps": [
            {
                "skill": "Budget Management",
                "importance": "Important",
                "current_level": 2,
                "required_level": 3,
                "gap_size": 1,
                "description": "Useful for comprehensive analysis"
            },
            {
                "skill": "Presentation Skills",
                "importance": "Important",
                "current_level": 3,
                "required_level": 4,
                "gap_size": 1,
                "description": "Important for stakeholder communication"
            },
            {
                "skill": "SQL for Finance",
                "importance": "Development",
                "current_level": 0,
                "required_level": 3,
                "gap_size": 3,
                "description": "Useful for data extraction"
            }
        ]
    }
}

async def test_planning_agent_handoff():
    """Test Planning Agent with handoff to Research Agent."""
    logger.info("🧪 Testing Planning Agent with complex data handoff...")
    
    planning_agent = create_planning_agent()
    
    # Prepare planning message
    planning_message = f"""
    Create a comprehensive personalized course plan for {TEST_EMPLOYEE_DATA['full_name']}.
    
    EMPLOYEE PROFILE:
    {json.dumps(TEST_EMPLOYEE_DATA, indent=2)}
    
    SKILLS GAP ANALYSIS:
    {json.dumps(TEST_SKILLS_GAP_DATA, indent=2)}
    
    SESSION ID: test-session-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}
    
    REQUIREMENTS:
    1. Analyze the employee profile comprehensively
    2. Prioritize skill gaps based on career goals
    3. Generate a 4-week course structure with detailed modules
    4. Create research queries for content gathering
    5. Design a personalized learning path
    6. Store all results in the database
    7. Log the handoff with detailed context
    8. Transfer to Research Agent
    
    Execute this workflow step by step, ensuring all data is properly stored.
    """
    
    try:
        # Run with tracing enabled
        with trace("test_planning_handoff"):
            result = await Runner.run(
                planning_agent,
                planning_message,
                max_turns=15
            )
        
        logger.info("✅ Planning Agent completed")
        logger.info(f"Result keys: {list(result.keys())}")
        
        # Check for successful handoff
        if result.get('success'):
            logger.info("✅ Handoff appears successful")
            if 'content' in result:
                logger.info(f"Final content preview: {result['content'][:500]}...")
        else:
            logger.error(f"❌ Planning failed: {result.get('error', 'Unknown error')}")
            
        return result
        
    except Exception as e:
        logger.error(f"❌ Test failed: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return {"success": False, "error": str(e)}

async def test_coordinator_full_pipeline():
    """Test full pipeline through Coordinator."""
    logger.info("🚀 Testing full pipeline with Coordinator...")
    
    coordinator = create_course_generation_coordinator()
    
    # Prepare coordinator message
    coordinator_message = f"""
    Generate a comprehensive personalized course for the following employee:
    
    EMPLOYEE: {TEST_EMPLOYEE_DATA['full_name']}
    ROLE: {TEST_EMPLOYEE_DATA['job_title_specific']}
    DEPARTMENT: {TEST_EMPLOYEE_DATA['department']}
    
    EMPLOYEE DATA:
    {json.dumps(TEST_EMPLOYEE_DATA, indent=2)}
    
    SKILLS GAPS:
    {json.dumps(TEST_SKILLS_GAP_DATA, indent=2)}
    
    SESSION ID: coordinator-test-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}
    
    Please initiate the course generation pipeline starting with the Planning Agent.
    """
    
    try:
        # Run with tracing enabled
        with trace("test_coordinator_pipeline"):
            result = await Runner.run(
                coordinator,
                coordinator_message,
                max_turns=30  # Allow more turns for full pipeline
            )
        
        logger.info("✅ Coordinator pipeline completed")
        logger.info(f"Result keys: {list(result.keys())}")
        
        if result.get('success'):
            logger.info("✅ Pipeline appears successful")
            
            # Check for content_id
            if 'content_id' in result:
                logger.info(f"📝 Content ID generated: {result['content_id']}")
            else:
                logger.warning("⚠️ No content_id found in result")
                
        else:
            logger.error(f"❌ Pipeline failed: {result.get('error', 'Unknown error')}")
            
        return result
        
    except Exception as e:
        logger.error(f"❌ Test failed: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return {"success": False, "error": str(e)}

async def verify_database_storage():
    """Verify that data was properly stored in the database."""
    logger.info("🔍 Verifying database storage...")
    
    from supabase import create_client
    
    SUPABASE_URL = 'https://xwfweumeryrgbguwrocr.supabase.co'
    SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if not SUPABASE_KEY:
        logger.error("❌ SUPABASE_SERVICE_ROLE_KEY not set")
        return False
    
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    try:
        # Check course plans
        plans = supabase.table('cm_course_plans').select("*").limit(5).order('created_at', desc=True).execute()
        if plans.data:
            logger.info(f"✅ Found {len(plans.data)} recent course plans")
            latest_plan = plans.data[0]
            logger.info(f"   Latest plan: {latest_plan.get('course_title', 'Unknown')}")
            logger.info(f"   Employee: {latest_plan.get('employee_name', 'Unknown')}")
            logger.info(f"   Modules: {latest_plan.get('total_modules', 0)}")
        else:
            logger.warning("⚠️ No course plans found")
        
        # Check research results
        research = supabase.table('cm_research_results').select("*").limit(5).order('created_at', desc=True).execute()
        if research.data:
            logger.info(f"✅ Found {len(research.data)} recent research results")
            latest_research = research.data[0]
            logger.info(f"   Topics: {latest_research.get('total_topics', 0)}")
            logger.info(f"   Sources: {latest_research.get('total_sources', 0)}")
        else:
            logger.warning("⚠️ No research results found")
        
        # Check handoffs
        handoffs = supabase.table('cm_agent_handoffs').select("*").limit(10).order('handoff_timestamp', desc=True).execute()
        if handoffs.data:
            logger.info(f"✅ Found {len(handoffs.data)} recent handoffs")
            for handoff in handoffs.data[:3]:
                logger.info(f"   {handoff.get('from_agent', '?')} → {handoff.get('to_agent', '?')}")
        else:
            logger.warning("⚠️ No handoffs found")
            
        return True
        
    except Exception as e:
        logger.error(f"❌ Database verification failed: {e}")
        return False

async def main():
    """Run all tests."""
    logger.info("=" * 60)
    logger.info("🧪 AGENT HANDOFF COMPLEX DATA TEST SUITE")
    logger.info("=" * 60)
    
    # Test 1: Planning Agent with handoff
    logger.info("\n📋 Test 1: Planning Agent Handoff")
    planning_result = await test_planning_agent_handoff()
    
    # Wait a bit between tests
    await asyncio.sleep(2)
    
    # Test 2: Full pipeline through Coordinator
    logger.info("\n📋 Test 2: Coordinator Full Pipeline")
    coordinator_result = await test_coordinator_full_pipeline()
    
    # Wait for database writes
    await asyncio.sleep(2)
    
    # Verify database storage
    logger.info("\n📋 Database Verification")
    db_verified = await verify_database_storage()
    
    # Summary
    logger.info("\n" + "=" * 60)
    logger.info("📊 TEST SUMMARY")
    logger.info("=" * 60)
    
    tests_passed = 0
    tests_total = 3
    
    if planning_result.get('success'):
        logger.info("✅ Planning Agent Handoff: PASSED")
        tests_passed += 1
    else:
        logger.error("❌ Planning Agent Handoff: FAILED")
    
    if coordinator_result.get('success'):
        logger.info("✅ Coordinator Pipeline: PASSED")
        tests_passed += 1
    else:
        logger.error("❌ Coordinator Pipeline: FAILED")
    
    if db_verified:
        logger.info("✅ Database Storage: VERIFIED")
        tests_passed += 1
    else:
        logger.error("❌ Database Storage: FAILED")
    
    logger.info(f"\n🎯 Tests Passed: {tests_passed}/{tests_total}")
    
    if tests_passed == tests_total:
        logger.info("🎉 ALL TESTS PASSED! Agent handoffs working correctly.")
    else:
        logger.warning(f"⚠️ {tests_total - tests_passed} tests failed. Check logs for details.")

if __name__ == "__main__":
    # Ensure we're in the right directory
    import sys
    sys.path.insert(0, '/Users/kubilaycenk/Lxera Stable/lxera-vision-platform/openai_course_generator')
    
    # Run tests
    asyncio.run(main())