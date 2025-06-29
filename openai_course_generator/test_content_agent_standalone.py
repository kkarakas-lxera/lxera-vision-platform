#!/usr/bin/env python3
"""
Test Content Agent independently with plan_id and research_id.

This script tests only the Content Agent to ensure it:
1. Fetches the course plan and research results
2. Generates comprehensive course content
3. Stores content modules in the database
4. Returns a content_id for next phase
"""

import asyncio
import logging
import json
import os
from datetime import datetime
from typing import Dict, Any, Optional

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Import content agent
from lxera_agents import Runner, trace
from course_agents.content_agent import create_content_agent

# Use the IDs from our successful tests
DEFAULT_PLAN_ID = "9ef315d4-df40-4caa-bff0-99833ccef993"
DEFAULT_RESEARCH_ID = "bd87f0db-bbb0-41ca-bd11-c06b33e61e43"

async def test_content_agent_only(plan_id: str = None, research_id: str = None):
    """Test Content Agent in isolation with plan_id and research_id."""
    
    if not plan_id:
        plan_id = DEFAULT_PLAN_ID
        logger.info(f"Using default plan_id: {plan_id}")
    
    if not research_id:
        research_id = DEFAULT_RESEARCH_ID
        logger.info(f"Using default research_id: {research_id}")
    
    logger.info("🧪 Testing Content Agent Independently")
    logger.info(f"📝 Plan ID: {plan_id}")
    logger.info(f"🔍 Research ID: {research_id}")
    logger.info("=" * 60)
    
    # First, verify the plan and research exist
    plan_details = await verify_plan_exists(plan_id)
    if not plan_details:
        logger.error(f"❌ Plan {plan_id} not found in database")
        return {'success': False, 'error': 'Plan not found'}
    
    research_details = await verify_research_exists(research_id)
    if not research_details:
        logger.error(f"❌ Research {research_id} not found in database")
        return {'success': False, 'error': 'Research not found'}
    
    logger.info(f"✅ Found plan: {plan_details['course_title']}")
    logger.info(f"✅ Found research: {research_details['total_topics']} topics, {research_details['total_sources']} sources")
    
    try:
        # Create content agent
        content_agent = create_content_agent()
        
        # Generate unique session ID
        session_id = f"test-content-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        
        # Extract employee info and module details from plan
        employee_name = plan_details.get('employee_name', 'Unknown Employee')
        course_structure = plan_details.get('course_structure', {})
        modules = course_structure.get('modules', [])
        
        # Get the first module from the plan
        if modules:
            first_module = modules[0]
            module_name = first_module.get('title', 'Module 1')
            topics = first_module.get('topics', [])
            priority = first_module.get('priority', 'high')
        else:
            logger.error("No modules found in course plan")
            return {'success': False, 'error': 'No modules in plan'}
        
        # Get employee profile from plan
        employee_profile = plan_details.get('employee_profile', {})
        current_role = employee_profile.get('current_role', 'Professional')
        career_goal = employee_profile.get('career_goals', 'Career advancement')
        
        # Create content request message matching the actual agent workflow
        content_message = f"""
        Generate comprehensive course content based on the plan and research.
        
        SESSION ID: {session_id}
        PLAN ID: {plan_id}
        RESEARCH ID: {research_id}
        
        MODULE TO GENERATE: {module_name}
        
        MODULE SPECIFICATIONS:
        {{
            "module_name": "{module_name}",
            "personalization_context": {{
                "employee_name": "{employee_name}",
                "current_role": "{current_role}",
                "career_goal": "{career_goal}",
                "plan_id": "{plan_id}",
                "research_id": "{research_id}"
            }},
            "module_topics": {json.dumps(topics)},
            "difficulty_level": "foundational",
            "priority_level": "{priority}",
            "session_id": "{session_id}",
            "word_count_target": "4000-5000"
        }}
        
        RESEARCH CONTEXT:
        Use the research findings from research_id: {research_id} to inform content creation.
        
        GENERATION SEQUENCE:
        1. Use create_new_module_content to create module and get content_id
        2. Use generate_module_introduction to create personalized introduction (800-1000 words)
        3. Use store_content_section to save the introduction
        4. Use generate_core_content to develop comprehensive instructional content (1800-2200 words)
        5. Use store_content_section to save the core content
        6. Use generate_practical_applications for workplace-relevant examples (1200-1500 words)
        7. Use store_content_section to save the practical applications
        8. Use generate_case_studies for realistic scenarios (800-1000 words)
        9. Use store_content_section to save the case studies
        10. Use generate_assessment_materials for knowledge validation
        11. Use store_content_section to save the assessments
        12. Use compile_complete_module to integrate all sections
        13. Use update_module_status to mark module as ready for quality check
        
        Generate content that addresses the specific skill gaps identified in the plan,
        using insights from the research phase to create targeted, effective learning materials.
        """
        
        logger.info("🚀 Starting Content Agent execution...")
        
        # Run with tracing
        with trace("test_content_standalone"):
            result = await Runner.run(
                content_agent,
                content_message,
                max_turns=15  # Content generation may need several turns
            )
        
        logger.info("✅ Content Agent execution completed")
        
        # Extract content_id from result
        content_id = extract_content_id(result)
        
        # If extraction fails, try querying the database for the latest content
        if not content_id:
            logger.info("Trying to find content_id from database...")
            content_id = await find_latest_content_for_plan(plan_id, session_id)
        
        if content_id:
            logger.info(f"✅ SUCCESS: Content generated with ID: {content_id}")
            logger.info(f"📚 Use this content_id for testing Quality Agent: {content_id}")
            
            # Verify in database
            await verify_content_in_database(content_id, plan_id, research_id)
            
            return {
                'success': True,
                'content_id': content_id,
                'plan_id': plan_id,
                'research_id': research_id,
                'session_id': session_id
            }
        else:
            logger.error("❌ FAILED: No content_id found in result")
            return {
                'success': False,
                'error': 'No content_id generated'
            }
        
    except Exception as e:
        logger.error(f"❌ Content Agent test failed: {e}")
        import traceback
        traceback.print_exc()
        return {
            'success': False,
            'error': str(e)
        }

def extract_content_id(result) -> str:
    """Extract content_id from agent result."""
    try:
        output_text = ""
        
        # Log the result structure - check if it's the new dict structure
        if isinstance(result, dict):
            logger.info(f"RunResult is dict with keys: {list(result.keys())}")
            # Try to extract from dict directly
            if 'raw_responses' in result:
                responses = result['raw_responses']
                logger.info(f"Found raw_responses in dict: {type(responses)}")
                if isinstance(responses, list):
                    for resp in responses:
                        if isinstance(resp, dict) and 'content' in resp:
                            for content in resp['content']:
                                if isinstance(content, dict):
                                    if content.get('type') == 'tool_result':
                                        output_text += str(content.get('content', '')) + " "
        else:
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
                                    # Check if this contains our content_id
                                    if "Content modules stored successfully" in tool_result:
                                        logger.info(f"Found store_content_modules result: {tool_result}")
                                elif content_block.type == 'tool_use':
                                    tool_name = getattr(content_block, 'name', 'unknown')
                                    logger.debug(f"Tool use {i}.{j}: {tool_name}")
                                    if tool_name == 'store_content_modules':
                                        logger.info("Found store_content_modules tool call")
                            elif hasattr(content_block, 'text'):
                                # Check text content too
                                text_content = str(content_block.text)
                                output_text += text_content + " "
        
        # Look for content_id patterns
        import re
        patterns = [
            r'Content modules stored successfully with ID:\s*([a-f0-9\-]{36})',
            r'content[_-]id[:\s]*([a-f0-9\-]{36})',
            r'Content generation completed.*?([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})',
            r'Module created with content_id:\s*([a-f0-9\-]{36})',
            r'content_id:\s*([a-f0-9\-]{36})'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, output_text, re.IGNORECASE)
            if match:
                content_id = match.group(1)
                logger.info(f"✅ Found content_id: {content_id}")
                return content_id
        
        logger.warning(f"❌ No content_id found in output")
        logger.debug(f"Output text searched: {output_text[:500]}...")
        return None
        
    except Exception as e:
        logger.error(f"Error extracting content_id: {e}")
        return None

async def verify_plan_exists(plan_id: str) -> Optional[Dict[str, Any]]:
    """Verify the plan exists in database."""
    from supabase import create_client
    import os
    
    supabase = create_client(
        'https://xwfweumeryrgbguwrocr.supabase.co',
        os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    )
    
    try:
        result = supabase.table('cm_course_plans').select('*').eq('plan_id', plan_id).single().execute()
        
        if result.data:
            return result.data
        else:
            return None
            
    except Exception as e:
        logger.error(f"Error verifying plan: {e}")
        return None

async def verify_research_exists(research_id: str) -> Optional[Dict[str, Any]]:
    """Verify the research exists in database."""
    from supabase import create_client
    import os
    
    supabase = create_client(
        'https://xwfweumeryrgbguwrocr.supabase.co',
        os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    )
    
    try:
        result = supabase.table('cm_research_results').select('*').eq('research_id', research_id).single().execute()
        
        if result.data:
            return result.data
        else:
            return None
            
    except Exception as e:
        logger.error(f"Error verifying research: {e}")
        return None

async def verify_content_in_database(content_id: str, plan_id: str, research_id: str):
    """Verify the content was stored in database."""
    from supabase import create_client
    import os
    
    supabase = create_client(
        'https://xwfweumeryrgbguwrocr.supabase.co',
        os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    )
    
    logger.info(f"🔍 Verifying content in database: {content_id}")
    
    try:
        # Check cm_module_content table
        result = supabase.table('cm_module_content').select('*').eq('content_id', content_id).single().execute()
        
        if result.data:
            module = result.data
            logger.info(f"✅ Content module verified in database:")
            logger.info(f"   - Content ID: {content_id}")
            logger.info(f"   - Module: {module.get('module_name', 'Unknown')}")
            logger.info(f"   - Employee: {module.get('employee_name', 'Unknown')}")
            logger.info(f"   - Status: {module.get('status', 'unknown')}")
            logger.info(f"   - Total word count: {module.get('total_word_count', 0)}")
            
            # Check content sections
            sections = supabase.table('cm_content_sections').select('*').eq('content_id', content_id).execute()
            
            if sections.data:
                logger.info(f"   - Content sections: {len(sections.data)}")
                for section in sections.data:
                    logger.info(f"     • {section.get('section_name', 'Unknown')}: {section.get('word_count', 0)} words")
        else:
            logger.error(f"❌ Content {content_id} not found in database")
            
    except Exception as e:
        logger.error(f"Error verifying content: {e}")

async def find_latest_content_for_plan(plan_id: str, session_id: str) -> Optional[str]:
    """Find the latest content for a plan and session."""
    from supabase import create_client
    import os
    
    supabase = create_client(
        'https://xwfweumeryrgbguwrocr.supabase.co',
        os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    )
    
    try:
        # Query for the latest content in cm_module_content table
        result = supabase.table('cm_module_content')\
            .select('content_id')\
            .eq('session_id', session_id)\
            .order('created_at', desc=True)\
            .limit(1)\
            .execute()
        
        if result.data and len(result.data) > 0:
            content_id = result.data[0]['content_id']
            logger.info(f"✅ Found content_id from database: {content_id}")
            return content_id
        else:
            logger.warning(f"No content found for session_id={session_id}")
            return None
            
    except Exception as e:
        logger.error(f"Error finding latest content: {e}")
        return None

if __name__ == "__main__":
    import sys
    
    # Allow passing plan_id and research_id as command line arguments
    plan_id = sys.argv[1] if len(sys.argv) > 1 else None
    research_id = sys.argv[2] if len(sys.argv) > 2 else None
    
    # Run the test
    result = asyncio.run(test_content_agent_only(plan_id, research_id))
    
    if result['success']:
        print("\n" + "="*60)
        print("✅ CONTENT AGENT TEST PASSED")
        print(f"📝 Plan ID: {result['plan_id']}")
        print(f"🔍 Research ID: {result['research_id']}")
        print(f"📚 Content ID: {result['content_id']}")
        print(f"📋 Session ID: {result['session_id']}")
        print("\n🎯 Next Step: Use plan_id, research_id, and content_id to test Quality Agent")
        print("="*60)
    else:
        print("\n" + "="*60)
        print("❌ CONTENT AGENT TEST FAILED")
        print(f"Error: {result.get('error', 'Unknown error')}")
        print("="*60)