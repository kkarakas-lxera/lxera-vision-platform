#!/usr/bin/env python3
"""
Test new orchestrator handoff logic: Planning Agent → Orchestrator → Research Agent
"""

import asyncio
import logging
import json
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import orchestrator for testing new handoff logic
from lxera_database_pipeline import LXERADatabasePipeline

async def test_planning_research_handoff():
    """Test new orchestrator handoff logic: Planning Agent → Orchestrator → Research Agent."""
    
    logger.info("🧪 Testing NEW orchestrator handoff logic...")
    
    # Real employee data from database (Kubilay Cenk Karakas - Senior Software Engineer)
    test_employee_data = {
        "id": "bbe12b3c-b305-4fdf-8c17-de7296cce3a9",
        "full_name": "Kubilay Cenk Karakas",
        "job_title_current": "Senior Software Engineer",
        "department": "Engineering",
        "career_aspirations_next_role": "Staff Software Engineer / Technical Lead",
        "tools_software_used_regularly": ["LangChain", "OpenAI/Anthropic SDKs", "Supabase", "Vercel"],
        "position": "Senior Software Engineer"
    }
    
    # Calculate actual skills gaps based on position requirements vs employee skills
    # Employee has all these skills at level 5, but position requires:
    # - Python: Required level 4 (employee doesn't have it listed)
    # - Machine Learning: Required level 3 (employee doesn't have it listed)
    test_skills_gaps = [
        {
            "skill_name": "Python",
            "gap_severity": "critical",  # Critical because it's mandatory
            "current_level": 0,  # Not found in employee's skills
            "required_level": 4,
            "skill_type": "technical",
            "is_mandatory": True
        },
        {
            "skill_name": "Machine Learning",
            "gap_severity": "moderate",  # Moderate because it's not mandatory
            "current_level": 0,  # Not found in employee's skills
            "required_level": 3,
            "skill_type": "technical",
            "is_mandatory": False
        }
    ]
    
    try:
        # Create orchestrator
        pipeline = LXERADatabasePipeline()
        
        logger.info("🚀 Testing orchestrator's _run_sdk_pipeline method...")
        
        # Test the orchestrator's handoff logic directly
        result = await pipeline._run_sdk_pipeline(
            test_employee_data,
            test_skills_gaps,
            job_id=None
        )
        
        logger.info("✅ Orchestrator pipeline execution completed")
        
        # Analyze the results
        logger.info(f"📊 Pipeline Success: {result.get('pipeline_success', 'Unknown')}")
        logger.info(f"🆔 Content ID: {result.get('content_id', 'None')}")
        logger.info(f"🎯 Final Agent: {result.get('agent_name', 'Unknown')}")
        
        if 'planning_turns' in result:
            logger.info(f"📋 Planning Agent Turns: {result['planning_turns']}")
        
        if 'turns' in result:
            logger.info(f"🔄 Total Pipeline Turns: {result['turns']}")
        
        # Check if handoff worked
        if result.get('pipeline_success'):
            logger.info("✅ ORCHESTRATOR SUCCESS: Pipeline completed successfully")
            
            if result.get('planning_turns', 0) > 0:
                logger.info("✅ PLANNING AGENT: Executed successfully")
            else:
                logger.warning("❌ PLANNING AGENT: Did not execute")
            
            if result.get('agent_name') == 'research_agent':
                logger.info("✅ HANDOFF SUCCESS: Ended with Research Agent")
            else:
                logger.warning(f"❌ HANDOFF ISSUE: Ended with {result.get('agent_name', 'Unknown')}")
        else:
            logger.error("❌ ORCHESTRATOR FAILED: Pipeline did not complete successfully")
            logger.error(f"   Error: {result.get('error', 'Unknown error')}")
        
        return result
        
    except Exception as e:
        logger.error(f"❌ Orchestrator handoff test failed: {e}")
        raise

async def verify_database_results():
    """Verify the results are stored in database."""
    
    from supabase import create_client
    import os
    
    supabase = create_client(
        'https://xwfweumeryrgbguwrocr.supabase.co',
        os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    )
    
    logger.info("🔍 Verifying database results...")
    
    # Check recent course plans
    plans_result = supabase.table('cm_course_plans').select('*').order('created_at', desc=True).limit(3).execute()
    logger.info(f"✅ Recent course plans: {len(plans_result.data)}")
    if plans_result.data:
        latest_plan = plans_result.data[0]
        logger.info(f"   Latest: {latest_plan['course_title']} for {latest_plan['employee_name']}")
        logger.info(f"   Plan ID: {latest_plan['plan_id']}")
    
    # Check research results (THIS IS KEY - should have new ones if handoffs work)
    research_result = supabase.table('cm_research_results').select('*').order('created_at', desc=True).limit(3).execute()
    logger.info(f"✅ Recent research results: {len(research_result.data)}")
    if research_result.data:
        for research in research_result.data:
            logger.info(f"   Research: Plan {research['plan_id'][:8]} - {research.get('total_topics', 0)} topics")
            logger.info(f"   Created: {research['created_at']}")
    else:
        logger.warning("❌ No research results found - Research Agent may not have executed")
    
    # Check if any new research results were created in the last few minutes
    from datetime import datetime, timedelta
    cutoff_time = datetime.utcnow() - timedelta(minutes=5)
    recent_research = supabase.table('cm_research_results').select('*').gte('created_at', cutoff_time.isoformat()).execute()
    
    if recent_research.data:
        logger.info(f"🎉 SUCCESS: {len(recent_research.data)} new research results created in last 5 minutes!")
        for research in recent_research.data:
            logger.info(f"   ✅ Research ID: {research['research_id']}")
    else:
        logger.warning("⚠️ No new research results in last 5 minutes")

if __name__ == "__main__":
    async def main():
        await test_planning_research_handoff()
        await verify_database_results()
    
    asyncio.run(main())