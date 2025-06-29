#!/usr/bin/env python3
"""
Test the upgraded pipeline with coordinator
"""

import asyncio
import logging
import os
from datetime import datetime

# Use the new pipeline
from lxera_pipeline import LXERADatabasePipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_pipeline():
    """Test the upgraded pipeline."""
    try:
        # Initialize pipeline
        logger.info("🚀 Initializing upgraded pipeline...")
        pipeline = LXERADatabasePipeline(verbose=True)
        
        # Test data
        employee_id = "bbe12b3c-b305-4fdf-8c17-de7296cce3a9"  # Kubilay
        employee_name = "Kubilay Cenk Karakas"
        company_id = "67d7bff4-1149-4f37-952e-af1841fb67fa"
        
        # Progress callback
        def progress_callback(stage: str, message: str):
            logger.info(f"[{stage}] {message}")
        
        logger.info(f"📋 Testing with employee: {employee_name}")
        logger.info("🔗 This will use the coordinator with agent handoffs")
        
        # Run pipeline
        result = await pipeline.run_pipeline(
            employee_id=employee_id,
            employee_name=employee_name,
            company_id=company_id,
            progress_callback=progress_callback
        )
        
        # Check results
        logger.info("\n📊 Pipeline Results:")
        if result.get('success'):
            logger.info(f"✅ Success: {result.get('message')}")
            logger.info(f"📄 Content ID: {result.get('content_id')}")
            logger.info(f"🔖 Session ID: {result.get('session_id')}")
        else:
            logger.error(f"❌ Failed: {result.get('error')}")
        
        return result.get('success', False)
        
    except Exception as e:
        logger.error(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Run the test."""
    logger.info("🧪 TESTING UPGRADED PIPELINE WITH COORDINATOR")
    logger.info(f"Timestamp: {datetime.now().isoformat()}")
    logger.info("=" * 60)
    
    # Run test
    success = await test_pipeline()
    
    if success:
        logger.info("\n✅ PIPELINE TEST SUCCESSFUL")
        logger.info("Check the following:")
        logger.info("1. https://platform.openai.com/traces - for agent execution")
        logger.info("2. Database tables - for stored data")
        logger.info("3. Logs above - for handoff events")
    else:
        logger.error("\n❌ PIPELINE TEST FAILED")

if __name__ == "__main__":
    # Check environment
    if not os.getenv('OPENAI_API_KEY'):
        logger.error("❌ OPENAI_API_KEY not set")
        exit(1)
    
    # Run test
    success = asyncio.run(main())
    exit(0 if success else 1)