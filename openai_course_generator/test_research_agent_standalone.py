#!/usr/bin/env python3
"""
Test Research Agent independently with plan_id from Planning Agent.

This script tests only the Research Agent to ensure it:
1. Fetches the course plan using plan_id
2. Performs comprehensive research on the topics
3. Stores research results in the database
4. Returns a research_id for next phase
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

# Import research agent
from lxera_agents import Runner, trace
from course_agents.research_agent import create_research_agent

# Use the plan_id from our successful Planning Agent test
# You can update this with a new plan_id if running fresh tests
DEFAULT_PLAN_ID = "9ef315d4-df40-4caa-bff0-99833ccef993"

async def test_research_agent_only(plan_id: str = None):
    """Test Research Agent in isolation with a plan_id."""
    
    if not plan_id:
        plan_id = DEFAULT_PLAN_ID
        logger.info(f"Using default plan_id: {plan_id}")
    
    logger.info("🧪 Testing Research Agent Independently")
    logger.info(f"📝 Plan ID: {plan_id}")
    logger.info("=" * 60)
    
    # First, verify the plan exists
    plan_details = await verify_plan_exists(plan_id)
    if not plan_details:
        logger.error(f"❌ Plan {plan_id} not found in database")
        return {'success': False, 'error': 'Plan not found'}
    
    logger.info(f"✅ Found plan: {plan_details['course_title']}")
    logger.info(f"   Employee: {plan_details['employee_name']}")
    logger.info(f"   Modules: {plan_details['total_modules']}")
    
    try:
        # Create research agent
        research_agent = create_research_agent()
        
        # Generate unique session ID
        session_id = f"test-research-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        
        # Create research request message
        research_message = f"""
        Execute comprehensive research for course plan_id: {plan_id}
        
        SESSION ID: {session_id}
        
        Follow this exact workflow:
        1. fetch_course_plan - Load the course plan details using plan_id: {plan_id}
        2. tavily_search - Search for relevant content for each module topic
           - Focus on Python fundamentals for AI/ML professionals
           - Include practical examples with LangChain, OpenAI SDKs
           - Find resources on Python best practices for production AI systems
        3. firecrawl_extract - Extract detailed content from authoritative sources
           - Python official documentation
           - Real Python articles
           - AI/ML specific Python tutorials
        4. research_synthesizer - Synthesize findings into structured insights
           - Group by module topics
           - Highlight practical applications
        5. store_research_results - Save your research findings with proper structure
        
        Focus on finding practical, industry-relevant content that bridges the gap between
        AI/ML expertise and Python fundamentals. The learner already knows advanced AI concepts
        but needs Python programming foundations.
        """
        
        logger.info("🚀 Starting Research Agent execution...")
        
        # Run with tracing
        with trace("test_research_standalone"):
            result = await Runner.run(
                research_agent,
                research_message,
                max_turns=15  # Research typically needs fewer turns than planning
            )
        
        logger.info("✅ Research Agent execution completed")
        
        # Extract research_id from result
        research_id = extract_research_id(result)
        
        # If extraction fails, try querying the database for the latest research result
        if not research_id:
            logger.info("Trying to find research_id from database...")
            research_id = await find_latest_research_for_plan(plan_id, session_id)
        
        if research_id:
            logger.info(f"✅ SUCCESS: Research completed with ID: {research_id}")
            logger.info(f"🔍 Use this research_id for testing Content Agent: {research_id}")
            
            # Verify in database
            await verify_research_in_database(research_id, plan_id)
            
            return {
                'success': True,
                'research_id': research_id,
                'plan_id': plan_id,
                'session_id': session_id
            }
        else:
            logger.error("❌ FAILED: No research_id found in result")
            return {
                'success': False,
                'error': 'No research_id generated'
            }
        
    except Exception as e:
        logger.error(f"❌ Research Agent test failed: {e}")
        import traceback
        traceback.print_exc()
        return {
            'success': False,
            'error': str(e)
        }

def extract_research_id(result) -> str:
    """Extract research_id from agent result."""
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
                                    # Check if this contains our research_id
                                    if "Research results stored successfully" in tool_result:
                                        logger.info(f"Found store_research_results result: {tool_result}")
                                elif content_block.type == 'tool_use':
                                    tool_name = getattr(content_block, 'name', 'unknown')
                                    logger.debug(f"Tool use {i}.{j}: {tool_name}")
                                    if tool_name == 'store_research_results':
                                        logger.info("Found store_research_results tool call")
                            elif hasattr(content_block, 'text'):
                                # Check text content too
                                text_content = str(content_block.text)
                                output_text += text_content + " "
        
        # Look for research_id patterns
        import re
        patterns = [
            r'Research results stored successfully with ID:\s*([a-f0-9\-]{36})',
            r'research[_-]id[:\s]*([a-f0-9\-]{36})',
            r'Research phase completed.*?([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, output_text, re.IGNORECASE)
            if match:
                research_id = match.group(1)
                logger.info(f"✅ Found research_id: {research_id}")
                return research_id
        
        logger.warning(f"❌ No research_id found in output")
        logger.debug(f"Output text searched: {output_text[:500]}...")
        return None
        
    except Exception as e:
        logger.error(f"Error extracting research_id: {e}")
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

async def verify_research_in_database(research_id: str, plan_id: str):
    """Verify the research was stored in database."""
    from supabase import create_client
    import os
    
    supabase = create_client(
        'https://xwfweumeryrgbguwrocr.supabase.co',
        os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    )
    
    logger.info(f"🔍 Verifying research in database: {research_id}")
    
    try:
        result = supabase.table('cm_research_results').select('*').eq('research_id', research_id).single().execute()
        
        if result.data:
            research = result.data
            logger.info("✅ Research results verified in database:")
            logger.info(f"   - Research ID: {research['research_id']}")
            logger.info(f"   - Plan ID: {research['plan_id']}")
            logger.info(f"   - Topics: {research.get('total_topics', 0)}")
            logger.info(f"   - Sources: {research.get('total_sources', 0)}")
            logger.info(f"   - Status: {research.get('status', 'unknown')}")
            logger.info(f"   - Created: {research.get('created_at', 'N/A')}")
            
            # Check if research findings exist
            if research.get('research_findings'):
                findings = research['research_findings']
                if isinstance(findings, dict) and 'topics' in findings:
                    logger.info(f"   - Research topics found: {len(findings['topics'])}")
                    for topic in findings['topics'][:3]:  # Show first 3 topics
                        logger.info(f"     • {topic.get('topic', 'Unknown topic')}")
        else:
            logger.error(f"❌ Research {research_id} not found in database")
            
    except Exception as e:
        logger.error(f"Error verifying research: {e}")

async def find_latest_research_for_plan(plan_id: str, session_id: str) -> Optional[str]:
    """Find the latest research result for a plan and session."""
    from supabase import create_client
    import os
    
    supabase = create_client(
        'https://xwfweumeryrgbguwrocr.supabase.co',
        os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    )
    
    try:
        # Query for the latest research result for this plan and session
        result = supabase.table('cm_research_results')\
            .select('research_id')\
            .eq('plan_id', plan_id)\
            .eq('session_id', session_id)\
            .order('created_at', desc=True)\
            .limit(1)\
            .execute()
        
        if result.data and len(result.data) > 0:
            research_id = result.data[0]['research_id']
            logger.info(f"✅ Found research_id from database: {research_id}")
            return research_id
        else:
            logger.warning(f"No research found for plan_id={plan_id}, session_id={session_id}")
            return None
            
    except Exception as e:
        logger.error(f"Error finding latest research: {e}")
        return None

if __name__ == "__main__":
    import sys
    
    # Set Firecrawl API key
    os.environ['FIRECRAWL_API_KEY'] = 'fc-7262516226444c878aa16b03d570f3c7'
    logger.info(f"✅ Firecrawl API key set")
    
    # Allow passing plan_id as command line argument
    plan_id = sys.argv[1] if len(sys.argv) > 1 else None
    
    # Run the test
    result = asyncio.run(test_research_agent_only(plan_id))
    
    if result['success']:
        print("\n" + "="*60)
        print("✅ RESEARCH AGENT TEST PASSED")
        print(f"📝 Plan ID: {result['plan_id']}")
        print(f"🔍 Research ID: {result['research_id']}")
        print(f"📋 Session ID: {result['session_id']}")
        print("\n🎯 Next Step: Use plan_id and research_id to test Content Agent")
        print("="*60)
    else:
        print("\n" + "="*60)
        print("❌ RESEARCH AGENT TEST FAILED")
        print(f"Error: {result.get('error', 'Unknown error')}")
        print("="*60)