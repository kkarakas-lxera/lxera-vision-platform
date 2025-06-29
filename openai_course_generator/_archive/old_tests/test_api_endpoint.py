#!/usr/bin/env python3
"""
Test script for the /api/generate-course endpoint
Tests the fixed handoff logic with the employee mentioned in the plan.
"""

import requests
import json
import logging
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_generate_course_endpoint():
    """Test the course generation endpoint with the employee from the plan."""
    
    # Test employee data from the plan
    test_data = {
        "employee_id": "bbe12b3c-b305-4fdf-8c17-de7296cce3a9",  # Kubilay Cenk Karakas
        "company_id": "test-company-id",
        "assigned_by_id": "test-user-id",
        "job_id": f"test-job-{int(time.time())}"
    }
    
    # For local testing, use localhost
    local_url = "http://localhost:10000/api/generate-course"
    
    # For production testing, use the deployed URL
    production_url = "https://lxera-course-generator.onrender.com/api/generate-course"
    
    # Try local first, then production
    urls_to_try = [local_url, production_url]
    
    for url in urls_to_try:
        try:
            logger.info(f"🧪 Testing course generation endpoint: {url}")
            logger.info(f"📋 Employee ID: {test_data['employee_id']}")
            
            # Make the request
            response = requests.post(
                url,
                json=test_data,
                headers={'Content-Type': 'application/json'},
                timeout=300  # 5 minute timeout for course generation
            )
            
            logger.info(f"📊 Response Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                logger.info("✅ Course generation successful!")
                logger.info(f"📝 Pipeline Success: {result.get('pipeline_success', 'Unknown')}")
                logger.info(f"🆔 Content ID: {result.get('content_id', 'None')}")
                logger.info(f"📊 Agent: {result.get('agent_name', 'Unknown')}")
                logger.info(f"🔄 Turns: {result.get('turns', 'Unknown')}")
                
                if 'planning_turns' in result:
                    logger.info(f"📋 Planning Turns: {result['planning_turns']}")
                
                if result.get('assignment_id'):
                    logger.info(f"📚 Assignment ID: {result['assignment_id']}")
                
                return result
                
            else:
                logger.error(f"❌ Request failed with status {response.status_code}")
                logger.error(f"📄 Response: {response.text[:500]}")
                
        except requests.exceptions.ConnectionError:
            logger.warning(f"⚠️ Could not connect to {url}")
            continue
        except requests.exceptions.Timeout:
            logger.error(f"⏰ Request timed out for {url}")
            continue
        except Exception as e:
            logger.error(f"❌ Error testing {url}: {e}")
            continue
    
    logger.error("❌ All endpoint tests failed")
    return None

def test_health_endpoint():
    """Test the health endpoint to verify service status."""
    
    urls_to_try = [
        "http://localhost:10000/health",
        "https://lxera-course-generator.onrender.com/health"
    ]
    
    for url in urls_to_try:
        try:
            logger.info(f"🏥 Testing health endpoint: {url}")
            
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                health_data = response.json()
                logger.info("✅ Health check successful!")
                logger.info(f"📊 Status: {health_data.get('status', 'Unknown')}")
                logger.info(f"🔧 Pipeline Available: {health_data.get('pipeline_available', 'Unknown')}")
                
                env_check = health_data.get('environment_check', {})
                logger.info(f"🔑 OpenAI Key Set: {env_check.get('openai_key_set', 'Unknown')}")
                logger.info(f"🔑 Supabase URL Set: {env_check.get('supabase_url_set', 'Unknown')}")
                logger.info(f"🔑 Supabase Key Set: {env_check.get('supabase_key_set', 'Unknown')}")
                
                if health_data.get('pipeline_error'):
                    logger.error(f"❌ Pipeline Error: {health_data['pipeline_error']}")
                
                return health_data
                
        except requests.exceptions.ConnectionError:
            logger.warning(f"⚠️ Could not connect to {url}")
            continue
        except Exception as e:
            logger.error(f"❌ Error testing {url}: {e}")
            continue
    
    logger.error("❌ All health endpoint tests failed")
    return None

if __name__ == "__main__":
    print("🧪 Testing LXERA Course Generation API")
    print("=" * 50)
    
    # Test health first
    print("\n1. Testing Health Endpoint")
    print("-" * 30)
    health_result = test_health_endpoint()
    
    if health_result and health_result.get('pipeline_available'):
        print("\n2. Testing Course Generation Endpoint")
        print("-" * 40)
        course_result = test_generate_course_endpoint()
        
        if course_result:
            print("\n✅ All tests passed!")
            print(f"🎯 Final Result: {json.dumps(course_result, indent=2)}")
        else:
            print("\n❌ Course generation test failed")
    else:
        print("\n⚠️ Skipping course generation test - service not healthy")
    
    print("\n🏁 Test completed")