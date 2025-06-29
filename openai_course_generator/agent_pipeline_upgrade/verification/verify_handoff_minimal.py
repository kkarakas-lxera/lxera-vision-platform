#!/usr/bin/env python3
"""
Minimal Handoff Verification

Quick test to verify basic handoff functionality without full pipeline execution.
"""

import asyncio
import logging
import os
from datetime import datetime

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import SDK and agents
from lxera_agents import OFFICIAL_SDK, Runner
from course_agents.planning_agent import create_planning_agent

async def verify_sdk_and_handoff():
    """Verify SDK is loaded and handoff function exists."""
    logger.info("🔍 Verifying SDK and handoff setup...")
    
    # Check SDK status
    logger.info(f"Official SDK available: {OFFICIAL_SDK}")
    
    if OFFICIAL_SDK:
        logger.info("✅ Official OpenAI SDK is loaded")
        
        # Check for handoff function
        try:
            from lxera_agents import handoff
            logger.info("✅ Handoff function imported successfully")
        except ImportError:
            logger.error("❌ Could not import handoff function")
            return False
    else:
        logger.warning("⚠️ Using fallback implementation (no official SDK)")
    
    # Check Planning Agent setup
    try:
        planning_agent = create_planning_agent()
        logger.info(f"✅ Planning Agent created: {planning_agent.name}")
        logger.info(f"   Tools: {len(planning_agent.tools)} configured")
        logger.info(f"   Handoffs: {len(planning_agent.handoffs)} configured")
        
        # List tools
        tool_names = []
        for tool in planning_agent.tools:
            if hasattr(tool, 'name'):
                tool_names.append(tool.name)
            elif hasattr(tool, '__name__'):
                tool_names.append(tool.__name__)
            else:
                tool_names.append(str(type(tool).__name__))
        logger.info(f"   Tool names: {', '.join(tool_names)}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to create Planning Agent: {e}")
        return False

async def test_minimal_planning():
    """Test minimal planning agent execution."""
    logger.info("\n🧪 Testing minimal Planning Agent execution...")
    
    planning_agent = create_planning_agent()
    
    # Very simple test message
    test_message = """
    Analyze this employee and create a simple course structure:
    
    Employee: Test User
    Role: Junior Analyst
    Gap: Needs to learn Financial Modeling
    
    Just use analyze_employee_profile and generate_course_structure_plan tools.
    Keep it minimal for testing.
    """
    
    try:
        result = await Runner.run(
            planning_agent,
            test_message,
            max_turns=3  # Very limited turns
        )
        
        if result.get('success'):
            logger.info("✅ Minimal execution successful")
            return True
        else:
            logger.error(f"❌ Execution failed: {result.get('error', 'Unknown')}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Test failed: {e}")
        return False

async def check_database_tables():
    """Verify required database tables exist."""
    logger.info("\n🔍 Checking database tables...")
    
    from supabase import create_client
    
    SUPABASE_URL = 'https://xwfweumeryrgbguwrocr.supabase.co'
    SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if not SUPABASE_KEY:
        logger.error("❌ SUPABASE_SERVICE_ROLE_KEY not set")
        return False
    
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    required_tables = [
        'cm_course_plans',
        'cm_research_results',
        'cm_agent_handoffs',
        'cm_module_content'
    ]
    
    all_exist = True
    
    for table in required_tables:
        try:
            # Try to query the table
            result = supabase.table(table).select("*").limit(1).execute()
            logger.info(f"✅ Table '{table}' exists")
        except Exception as e:
            logger.error(f"❌ Table '{table}' not found or accessible: {e}")
            all_exist = False
    
    return all_exist

async def main():
    """Run minimal verification tests."""
    logger.info("=" * 60)
    logger.info("🔍 MINIMAL HANDOFF VERIFICATION")
    logger.info("=" * 60)
    
    # Test 1: Verify SDK and handoff setup
    sdk_ok = await verify_sdk_and_handoff()
    
    # Test 2: Check database tables
    db_ok = await check_database_tables()
    
    # Test 3: Minimal planning execution
    planning_ok = await test_minimal_planning()
    
    # Summary
    logger.info("\n" + "=" * 60)
    logger.info("📊 VERIFICATION SUMMARY")
    logger.info("=" * 60)
    
    if sdk_ok:
        logger.info("✅ SDK and Handoff Setup: OK")
    else:
        logger.error("❌ SDK and Handoff Setup: FAILED")
    
    if db_ok:
        logger.info("✅ Database Tables: OK")
    else:
        logger.error("❌ Database Tables: MISSING")
    
    if planning_ok:
        logger.info("✅ Agent Execution: OK")
    else:
        logger.error("❌ Agent Execution: FAILED")
    
    all_ok = sdk_ok and db_ok and planning_ok
    
    if all_ok:
        logger.info("\n🎉 All verifications passed! System ready for testing.")
    else:
        logger.warning("\n⚠️ Some verifications failed. Check logs for details.")
    
    return all_ok

if __name__ == "__main__":
    # Ensure we're in the right directory
    import sys
    sys.path.insert(0, '/Users/kubilaycenk/Lxera Stable/lxera-vision-platform/openai_course_generator')
    
    # Run verification
    success = asyncio.run(main())
    exit(0 if success else 1)