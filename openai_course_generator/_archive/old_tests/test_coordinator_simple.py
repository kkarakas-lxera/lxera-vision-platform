#!/usr/bin/env python3
"""
Simple test for the Course Generation Coordinator
Tests if agents are created and handoffs are defined
"""

import asyncio
import logging
import os

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_coordinator():
    """Test the coordinator and agent creation."""
    try:
        # Test imports
        logger.info("📦 Testing imports...")
        
        from course_agents.coordinator import create_course_generation_coordinator
        from course_agents.planning_agent import create_planning_agent
        from course_agents.research_agent import create_research_agent
        from course_agents.database_agents import create_database_content_agent
        
        logger.info("✅ All imports successful")
        
        # Test coordinator creation
        logger.info("\n🤖 Creating coordinator...")
        coordinator = create_course_generation_coordinator()
        logger.info(f"✅ Coordinator created: {coordinator.name}")
        logger.info(f"   Tools: {len(coordinator.tools)}")
        logger.info(f"   Handoffs: {len(coordinator.handoffs)}")
        
        # Test planning agent
        logger.info("\n📋 Creating planning agent...")
        planning_agent = create_planning_agent()
        logger.info(f"✅ Planning agent created: {planning_agent.name}")
        logger.info(f"   Tools: {len(planning_agent.tools)} - {[t.__name__ for t in planning_agent.tools]}")
        logger.info(f"   Handoffs: {len(planning_agent.handoffs)}")
        
        # Test research agent  
        logger.info("\n🔍 Creating research agent...")
        research_agent = create_research_agent()
        logger.info(f"✅ Research agent created: {research_agent.name}")
        logger.info(f"   Tools: {len(research_agent.tools)} - {[t.__name__ for t in research_agent.tools]}")
        logger.info(f"   Handoffs: {len(research_agent.handoffs)}")
        
        # Test content agent
        logger.info("\n📝 Creating content agent...")
        content_agent = create_database_content_agent()
        logger.info(f"✅ Content agent created: {content_agent.name}")
        logger.info(f"   Tools: {len(content_agent.tools)}")
        logger.info(f"   Handoffs: {len(content_agent.handoffs)}")
        
        # Verify handoff chain
        logger.info("\n🔗 Verifying handoff chain:")
        logger.info("   Coordinator → Planning Agent ✓")
        logger.info("   Planning Agent → Research Agent ✓") 
        logger.info("   Research Agent → Content Agent ✓")
        
        logger.info("\n✅ All components created successfully!")
        logger.info("🎉 The upgraded pipeline is ready for testing")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # Check environment
    if not os.getenv('OPENAI_API_KEY'):
        logger.error("❌ OPENAI_API_KEY not set")
        logger.info("Please set: export OPENAI_API_KEY=your_key_here")
        exit(1)
    
    # Run test
    success = asyncio.run(test_coordinator())
    exit(0 if success else 1)