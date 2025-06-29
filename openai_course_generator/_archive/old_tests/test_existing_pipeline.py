#!/usr/bin/env python3
"""
Test the existing pipeline to verify it still works
"""

import asyncio
import logging
import os
from datetime import datetime

# Use the existing pipeline
from lxera_database_pipeline import LXERADatabasePipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_existing_pipeline():
    """Test the existing pipeline."""
    try:
        # Initialize pipeline
        logger.info("🚀 Initializing existing pipeline...")
        pipeline = LXERADatabasePipeline()
        
        # Test data
        employee_id = "bbe12b3c-b305-4fdf-8c17-de7296cce3a9"  # Kubilay
        company_id = "67d7bff4-1149-4f37-952e-af1841fb67fa"
        assigned_by_id = "abdf7f2e-a462-440e-80b8-5f02e7ad4468"  # First admin user
        
        logger.info(f"📋 Testing with employee ID: {employee_id}")
        logger.info("🔗 This will use the existing orchestrator approach")
        
        # Run pipeline
        result = await pipeline.generate_course_for_employee(
            employee_id=employee_id,
            company_id=company_id,
            assigned_by_id=assigned_by_id
        )
        
        # Check results
        logger.info("\n📊 Pipeline Results:")
        if result.get('pipeline_success'):
            logger.info(f"✅ Success!")
            logger.info(f"📄 Content ID: {result.get('content_id')}")
            logger.info(f"🔖 Session ID: {result.get('session_id')}")
            logger.info(f"📋 Assignment ID: {result.get('assignment_id')}")
        else:
            logger.error(f"❌ Failed: {result.get('error')}")
        
        return result.get('pipeline_success', False)
        
    except Exception as e:
        logger.error(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Run the test."""
    logger.info("🧪 TESTING EXISTING PIPELINE")
    logger.info(f"Timestamp: {datetime.now().isoformat()}")
    logger.info("=" * 60)
    
    # Run test
    success = await test_existing_pipeline()
    
    if success:
        logger.info("\n✅ EXISTING PIPELINE TEST SUCCESSFUL")
    else:
        logger.error("\n❌ EXISTING PIPELINE TEST FAILED")

if __name__ == "__main__":
    # Check environment
    if not os.getenv('OPENAI_API_KEY'):
        logger.error("❌ OPENAI_API_KEY not set")
        exit(1)
    
    # Run test
    success = asyncio.run(main())
    exit(0 if success else 1)