#!/usr/bin/env python3
"""
Simple test to verify agent handoffs are working
Uses minimal input to test the flow
"""

import asyncio
import logging
import os
from datetime import datetime

from lxera_agents import Runner
from course_agents.coordinator import create_course_generation_coordinator

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_handoffs():
    """Test basic agent handoffs."""
    try:
        # Create coordinator
        logger.info("🤖 Creating Course Generation Coordinator...")
        coordinator = create_course_generation_coordinator()
        
        # Prepare simple test input
        test_input = """
        Test the agent handoff flow with this simple request:
        
        Employee: Test User
        Skills Gap: Python (Critical)
        
        Just verify that:
        1. Planning Agent receives this and creates a simple plan
        2. Planning Agent hands off to Research Agent
        3. Research Agent receives the plan and acknowledges it
        
        Keep responses brief for testing purposes.
        """
        
        logger.info("🚀 Starting coordinator with test input...")
        logger.info("📍 Watch for handoffs in the output")
        
        # Run coordinator with limited turns
        result = await Runner.run(
            coordinator,
            test_input,
            max_turns=15  # Limited turns for quick test
        )
        
        # Check result
        logger.info("\n📊 Test Results:")
        if hasattr(result, 'final_output'):
            logger.info(f"✅ Coordinator completed execution")
            logger.info(f"Final output type: {type(result.final_output)}")
            
            # Try to see if handoffs occurred
            if hasattr(result, 'raw_responses'):
                logger.info(f"Total responses: {len(result.raw_responses)}")
                
                # Look for agent mentions in responses
                agents_mentioned = set()
                for response in result.raw_responses:
                    content = str(response).lower()
                    if 'planning' in content:
                        agents_mentioned.add('planning')
                    if 'research' in content:
                        agents_mentioned.add('research')
                    if 'content' in content:
                        agents_mentioned.add('content')
                
                logger.info(f"Agents mentioned: {agents_mentioned}")
        else:
            logger.warning("⚠️ No final output from coordinator")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Run the handoff test."""
    logger.info("🔗 TESTING AGENT HANDOFFS")
    logger.info(f"Timestamp: {datetime.now().isoformat()}")
    
    # Run test
    success = await test_handoffs()
    
    if success:
        logger.info("\n✅ Handoff test completed")
        logger.info("Check https://platform.openai.com/traces to see the agent execution")
    else:
        logger.error("\n❌ Handoff test failed")

if __name__ == "__main__":
    # Check environment
    if not os.getenv('OPENAI_API_KEY'):
        logger.error("❌ OPENAI_API_KEY not set")
        exit(1)
    
    # Run test
    asyncio.run(main())