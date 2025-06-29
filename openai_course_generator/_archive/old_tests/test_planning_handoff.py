#!/usr/bin/env python3
"""
Test Planning Agent handoff to Research Agent directly
"""

import asyncio
import logging
import os
from datetime import datetime

from lxera_agents import Runner
from course_agents.planning_agent import create_planning_agent

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_planning_handoff():
    """Test Planning Agent handoff."""
    try:
        # Create planning agent directly
        logger.info("📋 Creating Planning Agent...")
        planning_agent = create_planning_agent()
        
        # Prepare test input that should trigger handoff
        test_input = """
        Create a course plan for this employee and then hand off to the Research Agent:
        
        Employee: John Doe
        Role: Junior Developer
        Skills Gap: Python Advanced Features (Critical)
        
        Use your tools to:
        1. Analyze the employee profile
        2. Prioritize the skill gap
        3. Generate a simple course structure
        4. Create research queries
        5. Build a learning path
        
        After completing these tasks, explicitly hand off to the Research Agent
        to gather learning materials for the Python Advanced Features topic.
        """
        
        logger.info("🚀 Running Planning Agent with handoff request...")
        
        # Run planning agent
        result = await Runner.run(
            planning_agent,
            test_input,
            max_turns=10
        )
        
        # Check result
        logger.info("\n📊 Results:")
        
        # Check if we got a result
        if hasattr(result, 'final_output'):
            logger.info("✅ Planning Agent completed")
            
            # Check last agent
            if hasattr(result, 'last_agent'):
                logger.info(f"Last agent: {result.last_agent}")
                if result.last_agent != planning_agent:
                    logger.info("🎉 Handoff occurred!")
                else:
                    logger.warning("⚠️ No handoff detected")
            
            # Check for tool calls
            tool_calls = 0
            if hasattr(result, 'raw_responses'):
                for response in result.raw_responses:
                    if hasattr(response, 'tool_calls') and response.tool_calls:
                        tool_calls += len(response.tool_calls)
                logger.info(f"Tool calls made: {tool_calls}")
        else:
            logger.error("❌ No result from Planning Agent")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Run the test."""
    logger.info("🔗 TESTING PLANNING AGENT HANDOFF")
    logger.info(f"Timestamp: {datetime.now().isoformat()}")
    
    # Run test
    success = await test_planning_handoff()
    
    if success:
        logger.info("\n✅ Test completed")
        logger.info("Check https://platform.openai.com/traces for details")
    else:
        logger.error("\n❌ Test failed")

if __name__ == "__main__":
    # Check environment
    if not os.getenv('OPENAI_API_KEY'):
        logger.error("❌ OPENAI_API_KEY not set")
        exit(1)
    
    # Run test
    asyncio.run(main())