#!/usr/bin/env python3
"""
Test JSON argument parsing in storage tools
"""

import asyncio
import json
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import our tools
from tools.planning_storage_tools_v2 import store_course_plan_impl

async def test_json_args():
    """Test that our tools can handle both string and dict arguments"""
    
    # Test data
    test_args_dict = {
        "employee_id": "test-123",
        "employee_name": "Test User",
        "session_id": "test-session",
        "course_structure": {
            "title": "Test Course",
            "duration_weeks": 4,
            "modules": [],
            "learning_objectives": []
        },
        "prioritized_gaps": {
            "critical_gaps": [],
            "high_priority_gaps": [],
            "development_gaps": []
        },
        "research_strategy": {
            "primary_topics": [],
            "search_queries": [],
            "source_types": []
        },
        "learning_path": {
            "sequence": [],
            "adaptive_elements": [],
            "practice_components": []
        }
    }
    
    # Test 1: Dict arguments (what we expect normally)
    logger.info("Test 1: Dict arguments")
    try:
        result = await store_course_plan_impl(None, test_args_dict)
        logger.info(f"✅ Dict args worked! Result: {result}")
    except Exception as e:
        logger.error(f"❌ Dict args failed: {e}")
    
    # Test 2: JSON string arguments (what SDK might send)
    logger.info("\nTest 2: JSON string arguments")
    test_args_string = json.dumps(test_args_dict)
    try:
        result = await store_course_plan_impl(None, test_args_string)
        logger.info(f"✅ String args worked! Result: {result}")
    except Exception as e:
        logger.error(f"❌ String args failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_json_args())