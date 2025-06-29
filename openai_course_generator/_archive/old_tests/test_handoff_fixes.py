#!/usr/bin/env python3
"""
Test the handoff fixes to ensure proper Planning -> Research -> Content flow
"""

import asyncio
import logging
import json
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import coordinator and runner (NOT isolated planning agent)
from lxera_agents import Runner, trace
from course_agents.coordinator import create_course_generation_coordinator

async def test_handoff_fixes():
    """Test that handoffs work with proper UUID handling and mandatory transfers."""
    
    logger.info("🧪 Testing handoff fixes with mandatory transfers...")
    
    # Test data - using real employee ID
    test_employee_data = {
        "employee_id": "bbe12b3c-b305-4fdf-8c17-de7296cce3a9",  # Real employee ID
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
        # Create coordinator agent (this enables proper SDK handoffs)
        coordinator = create_course_generation_coordinator()
        
        # Create comprehensive message that should trigger full pipeline
        session_id = f"handoff-test-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        
        coordinator_message = f"""
        You must immediately use the transfer_to_planning_agent tool to begin course generation.
        
        Call the tool with this data:
        - Employee: Kubilay Cenk Karakas (ID: bbe12b3c-b305-4fdf-8c17-de7296cce3a9)
        - Session: {session_id}
        - Employee profile: {json.dumps(test_employee_data)}
        - Skills gaps: {json.dumps(test_skills_gap_data)}
        
        Use the transfer_to_planning_agent tool RIGHT NOW. Do not provide explanations.
        """
        
        logger.info("🚀 Starting Coordinator with full pipeline handoff flow...")
        
        # Run with tracing enabled
        with trace("test_handoff_fixes"):
            result = await Runner.run(
                coordinator,
                coordinator_message,
                max_turns=50  # Allow enough turns for full pipeline
            )
        
        logger.info("✅ Agent execution completed")
        logger.info(f"Final agent: {result.last_agent if hasattr(result, 'last_agent') else 'unknown'}")
        logger.info(f"Total turns: {len(result.raw_responses) if hasattr(result, 'raw_responses') else 'unknown'}")
        
        # Debug: Check if any tools were called
        if hasattr(result, 'raw_responses') and result.raw_responses:
            logger.info(f"📊 Raw responses count: {len(result.raw_responses)}")
            for i, response in enumerate(result.raw_responses):
                if hasattr(response, 'content') and response.content:
                    for content_block in response.content:
                        if hasattr(content_block, 'type'):
                            logger.info(f"   Response {i}: {content_block.type}")
                            if content_block.type == 'tool_use':
                                logger.info(f"      Tool: {getattr(content_block, 'name', 'unknown')}")
        
        # Check if result indicates handoff
        final_output = str(result.final_output) if hasattr(result, 'final_output') else str(result)
        logger.info(f"Final output preview: {final_output[:300]}...")
        
        # Wait a moment then check database
        await asyncio.sleep(2)
        
        return result
        
    except Exception as e:
        logger.error(f"❌ Handoff test failed: {e}")
        raise

async def verify_database_results():
    """Verify the handoff results are properly stored in database."""
    
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
    
    # Check recent handoffs
    handoffs_result = supabase.table('cm_agent_handoffs').select('*').order('handoff_timestamp', desc=True).limit(5).execute()
    logger.info(f"✅ Recent handoffs: {len(handoffs_result.data)}")
    for handoff in handoffs_result.data:
        logger.info(f"   {handoff['from_agent']} → {handoff['to_agent']} at {handoff['handoff_timestamp']}")
    
    # Check research results
    research_result = supabase.table('cm_research_results').select('*').order('created_at', desc=True).limit(3).execute()
    logger.info(f"✅ Recent research results: {len(research_result.data)}")

if __name__ == "__main__":
    async def main():
        await test_handoff_fixes()
        await verify_database_results()
    
    asyncio.run(main())