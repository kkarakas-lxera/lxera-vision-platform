#!/usr/bin/env python3
"""
Test the updated production pipeline with SDK integration
"""

import asyncio
import logging
from lxera_database_pipeline import generate_course_with_agents

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_production_pipeline():
    """Test the production pipeline with real employee data."""
    
    logger.info("🧪 Testing updated production pipeline...")
    
    try:
        # Use real employee data
        result = await generate_course_with_agents(
            employee_id="bbe12b3c-b305-4fdf-8c17-de7296cce3a9",  # Kubilay Cenk Karakas
            company_id="550e8400-e29b-41d4-a716-446655440000",  # Sample company
            assigned_by_id="550e8400-e29b-41d4-a716-446655440000"  # Sample user
        )
        
        logger.info("✅ Production pipeline test completed")
        logger.info(f"Result keys: {list(result.keys())}")
        logger.info(f"Pipeline success: {result.get('pipeline_success')}")
        logger.info(f"Content ID: {result.get('content_id')}")
        
        if result.get('agent_result'):
            logger.info(f"Agent result preview: {str(result['agent_result'])[:200]}...")
            
        return result
        
    except Exception as e:
        logger.error(f"❌ Production pipeline test failed: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(test_production_pipeline())