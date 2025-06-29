#!/usr/bin/env python3
"""
Test Planning Agent independently with real employee data from database.

This script tests only the Planning Agent to ensure it:
1. Properly processes real employee data
2. Identifies actual skill gaps
3. Creates a course plan in the database
4. Returns a plan_id for next phase
"""

import asyncio
import logging
import json
from datetime import datetime
from typing import Dict, Any

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Import planning agent
from lxera_agents import Runner, trace
from course_agents.planning_agent import create_planning_agent

# Kubilay Cenk Karakas - Real employee data from database
EMPLOYEE_DATA = {
    'id': 'bbe12b3c-b305-4fdf-8c17-de7296cce3a9',
    'full_name': 'Kubilay Cenk Karakas',
    'email': 'kubilaycenkkarakas@gmail.com',
    'job_title_current': 'Senior Software Engineer',
    'job_title_specific': 'Senior Software Engineer - AI/ML Systems',
    'department': 'Engineering',
    'company_id': '67d7bff4-1149-4f37-952e-af1841fb67fa',
    'current_industry': 'Technology - AI Product Development',
    'years_in_current_position': 1,
    'career_aspirations_next_role': 'Staff Software Engineer / Technical Lead',
    'career_goals_5_years': 'Engineering Manager or Principal Engineer',
    'learning_style': 'Hands-on practical application with real-world projects',
    'tools_software_used_regularly': ['LangChain', 'OpenAI/Anthropic SDKs', 'Supabase', 'Vercel'],
    'key_tools': ['LangChain', 'OpenAI/Anthropic SDKs', 'Supabase', 'Vercel'],
    'skills': [
        'Retrieval Augmented Generation (RAG) (Expert)',
        'Reinforcement Learning Human Feedback (RLHF) (Expert)',
        'Supervised Fine-Tuning (SFT) (Expert)',
        'LangChain (Expert)',
        'OpenAI/Anthropic SDKs (Expert)',
        'Supabase (Expert)',
        'Vercel (Expert)',
        'Amazon Web Services (Expert)',
        'Project Management (Expert)',
        'Effective Communication (Expert)',
        'Client Management (Expert)',
        'Team and Capacity Building (Expert)'
    ],
    'certifications': ['Project Management (Google Certified)']
}

# Real skills gaps based on position requirements vs employee skills
SKILLS_GAPS = {
    'Critical Skill Gaps': {
        'gaps': [
            {
                'skill': 'Python',
                'skill_name': 'Python',
                'importance': 'Critical',
                'current_level': 0,  # Not found in employee's skills
                'required_level': 4,
                'gap_size': 4,
                'gap_severity': 'critical',
                'skill_type': 'technical',
                'is_mandatory': True,
                'description': 'Python programming is essential for AI/ML development'
            }
        ]
    },
    'High Priority Gaps': {
        'gaps': [
            {
                'skill': 'Machine Learning',
                'skill_name': 'Machine Learning',
                'importance': 'High',
                'current_level': 0,  # Not found in employee's skills
                'required_level': 3,
                'gap_size': 3,
                'gap_severity': 'moderate',
                'skill_type': 'technical',
                'is_mandatory': False,
                'description': 'Machine Learning fundamentals for advanced AI systems'
            }
        ]
    },
    'Development Gaps': {
        'gaps': []  # No other significant gaps - employee is highly skilled
    }
}

async def test_planning_agent_only():
    """Test Planning Agent in isolation with real employee data."""
    
    logger.info("🧪 Testing Planning Agent with real employee data")
    logger.info(f"👤 Employee: {EMPLOYEE_DATA['full_name']}")
    logger.info(f"💼 Position: {EMPLOYEE_DATA['job_title_current']}")
    logger.info(f"🎯 Critical Gaps: Python (0→4), Machine Learning (0→3)")
    logger.info("=" * 60)
    
    try:
        # Create planning agent
        planning_agent = create_planning_agent()
        
        # Generate unique session ID
        session_id = f"test-planning-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        
        # Create planning request message
        planning_message = f"""
        Create a comprehensive personalized course plan for {EMPLOYEE_DATA['full_name']}.
        
        EMPLOYEE PROFILE:
        - Name: {EMPLOYEE_DATA['full_name']}
        - Current Role: {EMPLOYEE_DATA['job_title_specific']}
        - Department: {EMPLOYEE_DATA['department']}
        - Career Goal: {EMPLOYEE_DATA['career_aspirations_next_role']}
        - 5-Year Goal: {EMPLOYEE_DATA['career_goals_5_years']}
        - Learning Style: {EMPLOYEE_DATA['learning_style']}
        - Current Tools: {', '.join(EMPLOYEE_DATA['tools_software_used_regularly'])}
        - Strong Skills: RAG, RLHF, SFT, LangChain, Supabase (all at expert level)
        
        EMPLOYEE DATA:
        {json.dumps(EMPLOYEE_DATA, indent=2)}
        
        SKILLS GAP ANALYSIS:
        {json.dumps(SKILLS_GAPS, indent=2)}
        
        KEY INSIGHTS:
        - Employee is highly skilled in AI/ML implementation but lacks Python fundamentals
        - Has expert-level knowledge in advanced AI concepts but missing core programming language
        - This creates an unusual but critical learning need
        
        SESSION ID: {session_id}
        
        Execute your complete planning workflow:
        1. Analyze employee profile
        2. Prioritize the critical Python gap and ML fundamentals
        3. Generate course structure focusing on Python for AI/ML professionals
        4. Create research queries for Python in AI/ML context
        5. Design personalized learning path
        6. Store the course plan and get plan_id
        
        Focus on bridging the Python gap while leveraging existing AI/ML expertise.
        """
        
        logger.info("🚀 Starting Planning Agent execution...")
        
        # Run with tracing
        with trace("test_planning_standalone"):
            result = await Runner.run(
                planning_agent,
                planning_message,
                max_turns=15  # Enough for complete planning workflow
            )
        
        logger.info("✅ Planning Agent execution completed")
        
        # Extract plan_id from result
        plan_id = extract_plan_id(result)
        
        if plan_id:
            logger.info(f"✅ SUCCESS: Course plan created with ID: {plan_id}")
            logger.info(f"📝 Use this plan_id for testing Research Agent: {plan_id}")
            
            # Verify in database
            await verify_plan_in_database(plan_id)
            
            return {
                'success': True,
                'plan_id': plan_id,
                'session_id': session_id
            }
        else:
            logger.error("❌ FAILED: No plan_id found in result")
            return {
                'success': False,
                'error': 'No plan_id generated'
            }
        
    except Exception as e:
        logger.error(f"❌ Planning Agent test failed: {e}")
        import traceback
        traceback.print_exc()
        return {
            'success': False,
            'error': str(e)
        }

def extract_plan_id(result) -> str:
    """Extract plan_id from agent result."""
    try:
        output_text = ""
        
        # Log the result structure for debugging
        logger.info(f"RunResult attributes: {[attr for attr in dir(result) if not attr.startswith('_')]}")
        
        # Check final_output
        if hasattr(result, 'final_output') and result.final_output:
            output_text = str(result.final_output)
            logger.debug(f"Final output: {output_text[:200]}...")
        
        # Check raw_responses for tool results
        if hasattr(result, 'raw_responses'):
            logger.info(f"Checking {len(result.raw_responses)} raw responses")
            for i, response in enumerate(result.raw_responses):
                if hasattr(response, 'content'):
                    for j, content_block in enumerate(response.content):
                        if hasattr(content_block, 'type'):
                            if content_block.type == 'tool_result':
                                tool_result = str(content_block.content)
                                output_text += tool_result + " "
                                logger.debug(f"Tool result {i}.{j}: {tool_result[:200]}...")
                                # Check if this contains our plan_id
                                if "Course plan stored successfully" in tool_result:
                                    logger.info(f"Found store_course_plan result: {tool_result}")
                            elif content_block.type == 'tool_use':
                                logger.debug(f"Tool use {i}.{j}: {getattr(content_block, 'name', 'unknown')}")
        
        # Look for plan_id patterns
        import re
        patterns = [
            r'Course plan stored successfully with ID:\s*([a-f0-9\-]{36})',
            r'(?:plan[_-]id|ID)[:\s]*([a-f0-9\-]{36})',
            r'([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})'  # Match any UUID
        ]
        
        for pattern in patterns:
            match = re.search(pattern, output_text, re.IGNORECASE)
            if match:
                plan_id = match.group(1)
                logger.info(f"✅ Found plan_id: {plan_id}")
                return plan_id
        
        logger.warning(f"❌ No plan_id found in output")
        logger.debug(f"Output text searched: {output_text[:500]}...")
        return None
        
    except Exception as e:
        logger.error(f"Error extracting plan_id: {e}")
        return None

async def verify_plan_in_database(plan_id: str):
    """Verify the plan was stored in database."""
    from supabase import create_client
    import os
    
    supabase = create_client(
        'https://xwfweumeryrgbguwrocr.supabase.co',
        os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    )
    
    logger.info(f"🔍 Verifying plan in database: {plan_id}")
    
    try:
        result = supabase.table('cm_course_plans').select('*').eq('plan_id', plan_id).single().execute()
        
        if result.data:
            plan = result.data
            logger.info("✅ Course plan verified in database:")
            logger.info(f"   - Title: {plan.get('course_title', 'N/A')}")
            logger.info(f"   - Employee: {plan.get('employee_name', 'N/A')}")
            logger.info(f"   - Modules: {plan.get('total_modules', 0)}")
            logger.info(f"   - Duration: {plan.get('course_duration_weeks', 0)} weeks")
            logger.info(f"   - Created: {plan.get('created_at', 'N/A')}")
        else:
            logger.error(f"❌ Plan {plan_id} not found in database")
            
    except Exception as e:
        logger.error(f"Error verifying plan: {e}")

if __name__ == "__main__":
    # Run the test
    result = asyncio.run(test_planning_agent_only())
    
    if result['success']:
        print("\n" + "="*60)
        print("✅ PLANNING AGENT TEST PASSED")
        print(f"📝 Plan ID: {result['plan_id']}")
        print(f"📋 Session ID: {result['session_id']}")
        print("\n🎯 Next Step: Use this plan_id to test Research Agent")
        print("="*60)
    else:
        print("\n" + "="*60)
        print("❌ PLANNING AGENT TEST FAILED")
        print(f"Error: {result.get('error', 'Unknown error')}")
        print("="*60)