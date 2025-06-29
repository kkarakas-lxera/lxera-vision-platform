#!/usr/bin/env python3
"""
Test direct Planning Agent execution with SDK handoffs
"""

import asyncio
import logging
import json
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import planning agent directly
from lxera_agents import Runner, trace
from course_agents.planning_agent import create_planning_agent

async def test_planning_agent_handoffs():
    """Test Planning Agent with SDK handoffs directly."""
    
    logger.info("🧪 Testing Planning Agent with SDK handoffs...")
    
    # Test data - using real employee ID
    test_employee_data = {
        "employee_id": "bbe12b3c-b305-4fdf-8c17-de7296cce3a9",
        "full_name": "Kubilay Cenk Karakas",
        "job_title_specific": "Junior Financial Analyst - Business Performance Reporting",
        "department": "Finance",
        "current_industry": "Corporate Finance - Media & Entertainment",
        "years_in_current_position": 2,
        "career_aspirations_next_role": "Senior Financial Analyst within 2-3 years",
        "career_goals_5_years": "Finance Manager or FP&A Lead",
        "learning_style": "Prefers practical application and real-world examples",
        "skills": [
            "Project Management (Advanced)",
            "Data Analysis (Conceptual - Non-Financial)",
            "Microsoft Office Suite (Excel - Intermediate)"
        ]
    }
    
    test_skills_gap_data = {
        "Critical Skill Gaps": {
            "gaps": [
                {
                    "skill": "Forecasting and Budgeting",
                    "importance": "Critical",
                    "current_level": 2,
                    "required_level": 4,
                    "gap_size": 2
                },
                {
                    "skill": "Financial Data Analysis", 
                    "importance": "Critical",
                    "current_level": 2,
                    "required_level": 5,
                    "gap_size": 3
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
                    "gap_size": 3
                }
            ]
        },
        "Development Gaps": {
            "gaps": [
                {
                    "skill": "Data Visualization",
                    "importance": "Medium", 
                    "current_level": 2,
                    "required_level": 3,
                    "gap_size": 1
                }
            ]
        }
    }
    
    try:
        # Create planning agent directly
        planning_agent = create_planning_agent()
        
        # Create session
        session_id = f"direct-test-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        
        planning_message = f"""
        Create a comprehensive personalized course plan for {test_employee_data['full_name']}.
        
        EMPLOYEE PROFILE:
        {json.dumps(test_employee_data, indent=2)}
        
        SKILLS GAP ANALYSIS:
        {json.dumps(test_skills_gap_data, indent=2)}
        
        SESSION ID: {session_id}
        
        Execute your complete planning workflow and then transfer to the Research Agent.
        """
        
        logger.info("🚀 Starting Planning Agent directly...")
        
        # Run with tracing enabled
        with trace("test_direct_planning"):
            result = await Runner.run(
                planning_agent,
                planning_message,
                max_turns=30  # Allow enough turns for full flow including handoff
            )
        
        logger.info("✅ Planning Agent execution completed")
        logger.info(f"Final agent: {getattr(result, 'last_agent', 'unknown')}")
        
        # Debug: Check agent transitions
        if hasattr(result, 'raw_responses') and result.raw_responses:
            logger.info(f"📊 Total responses: {len(result.raw_responses)}")
            
            # Look for tool calls in responses
            for i, response in enumerate(result.raw_responses):
                if hasattr(response, 'content') and response.content:
                    for content_block in response.content:
                        if hasattr(content_block, 'type') and content_block.type == 'tool_use':
                            tool_name = getattr(content_block, 'name', 'unknown')
                            logger.info(f"   Response {i}: Tool call = {tool_name}")
                            if 'transfer' in tool_name.lower():
                                logger.info(f"   🔄 Found handoff tool: {tool_name}")
        
        return result
        
    except Exception as e:
        logger.error(f"❌ Direct planning test failed: {e}")
        raise

async def verify_handoff_results():
    """Verify the handoff results in database."""
    
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
    
    # Check research results (should have new ones if handoffs work)
    research_result = supabase.table('cm_research_results').select('*').order('created_at', desc=True).limit(3).execute()
    logger.info(f"✅ Recent research results: {len(research_result.data)}")
    if research_result.data:
        for research in research_result.data:
            logger.info(f"   Research: Plan {research['plan_id'][:8]} - {research.get('total_topics', 0)} topics")
    else:
        logger.warning("❌ No research results found - handoffs may not be working")

if __name__ == "__main__":
    async def main():
        await test_planning_agent_handoffs()
        await verify_handoff_results()
    
    asyncio.run(main())