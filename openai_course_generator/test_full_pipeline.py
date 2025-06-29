#!/usr/bin/env python3
"""
Test script for the full agent pipeline
"""

import asyncio
import json
import logging
from lxera_database_pipeline import LXERADatabasePipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_pipeline():
    """Test the full pipeline with a sample employee."""
    
    # Use real employee data from database
    test_employee_id = "bbe12b3c-b305-4fdf-8c17-de7296cce3a9"  # Kubilay Cenk Karakas
    test_company_id = "67d7bff4-1149-4f37-952e-af1841fb67fa"
    test_user_id = "0499bd60-c174-4427-a6f2-cf61ddd74688"  # Kubilay's user ID
    
    logger.info("🧪 Testing Full Agent Pipeline")
    logger.info("=" * 50)
    
    try:
        # Initialize pipeline
        pipeline = LXERADatabasePipeline()
        
        # Run the pipeline
        result = await pipeline.generate_course_for_employee(
            employee_id=test_employee_id,
            company_id=test_company_id,
            assigned_by_id=test_user_id
        )
        
        # Log results
        logger.info("Pipeline Result:")
        logger.info(json.dumps(result, indent=2))
        
        if result.get('pipeline_success'):
            logger.info("✅ Pipeline test PASSED!")
            logger.info(f"📝 Plan ID: {result.get('plan_id')}")
            logger.info(f"🔍 Research ID: {result.get('research_id')}")
            logger.info(f"📚 Content ID: {result.get('content_id')}")
        else:
            logger.error("❌ Pipeline test FAILED!")
            logger.error(f"Error: {result.get('error')}")
            
    except Exception as e:
        logger.error(f"❌ Test failed with exception: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_pipeline())