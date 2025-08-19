#!/usr/bin/env python3
"""
Direct Supabase Integration Test
Uses Supabase credentials directly to test AI visual generation integration
"""

import os
import sys
import asyncio
import json
import uuid
from datetime import datetime

# Add multimedia path
multimedia_path = os.path.join(os.path.dirname(__file__), 'multimedia')
sys.path.append(multimedia_path)

# Direct credentials (from Supabase MCP)
SUPABASE_URL = "https://xwfweumeryrgbguwrocr.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZndldW1lcnlyZ2JndXdyb2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NjM0NDAsImV4cCI6MjA2NjMzOTQ0MH0.aDpFDImHTr13UhRHqQZHZ92e8I-tvcuUcDCtfRvfbzw"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZndldW1lcnlyZ2JndXdyb2NyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc2MzQ0MCwiZXhwIjoyMDY2MzM5NDQwfQ.qxXpBxUKhKA4AQT4UQnIEJGbGNrRDMbBroZU8YaypSY"

# Set environment variables for the test
os.environ['SUPABASE_URL'] = SUPABASE_URL
os.environ['SUPABASE_ANON_KEY'] = SUPABASE_ANON_KEY
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = SUPABASE_SERVICE_ROLE_KEY

from ai_visual_generation.supabase_integration import SupabaseArtifactManager, SupabaseConfig
from validators.schema import (
    VisualIntent, DataSpec, DataPoint, DataType, Theme, 
    VisualSpec, CanvasInstructions
)


async def test_database_connectivity():
    """Test basic database connectivity"""
    print("🔗 Testing Database Connectivity")
    print("=" * 50)
    
    try:
        config = SupabaseConfig(
            url=SUPABASE_URL,
            service_role_key=SUPABASE_SERVICE_ROLE_KEY,
            anon_key=SUPABASE_ANON_KEY
        )
        
        print(f"✅ Supabase URL: {config.url}")
        print(f"✅ Service Role Key: {'***' + config.service_role_key[-8:]}")
        print(f"✅ Anon Key: {'***' + config.anon_key[-8:]}")
        
        async with SupabaseArtifactManager(config) as manager:
            print("✅ Artifact manager initialized successfully")
            return True
            
    except Exception as e:
        print(f"❌ Database connectivity failed: {str(e)}")
        return False


async def test_table_access():
    """Test that our AI tables exist and are accessible"""
    print("\n📋 Testing Table Access")
    print("=" * 50)
    
    try:
        config = SupabaseConfig(
            url=SUPABASE_URL,
            service_role_key=SUPABASE_SERVICE_ROLE_KEY,
            anon_key=SUPABASE_ANON_KEY
        )
        
        async with SupabaseArtifactManager(config) as manager:
            # Test reading from cache table (should be empty)
            url = f"{config.url}/rest/v1/ai_canvas_cache"
            headers = manager._get_headers()
            
            async with manager.session.get(url, headers=headers, params={'limit': '1'}) as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ ai_canvas_cache table accessible (found {len(data)} entries)")
                else:
                    print(f"❌ ai_canvas_cache table not accessible: {response.status}")
                    return False
            
            # Test reading from artifacts table (should be empty)
            url = f"{config.url}/rest/v1/ai_visual_artifacts"
            async with manager.session.get(url, headers=headers, params={'limit': '1'}) as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ ai_visual_artifacts table accessible (found {len(data)} entries)")
                else:
                    print(f"❌ ai_visual_artifacts table not accessible: {response.status}")
                    return False
            
            # Test reading from usage table (should be empty)
            url = f"{config.url}/rest/v1/ai_visual_usage"
            async with manager.session.get(url, headers=headers, params={'limit': '1'}) as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ ai_visual_usage table accessible (found {len(data)} entries)")
                    return True
                else:
                    print(f"❌ ai_visual_usage table not accessible: {response.status}")
                    return False
                    
    except Exception as e:
        print(f"❌ Table access test failed: {str(e)}")
        return False


async def test_cache_insert():
    """Test inserting data into cache table"""
    print("\n💾 Testing Cache Insert")
    print("=" * 50)
    
    try:
        # Create test data
        data_points = [
            DataPoint(label="Test A", value=100),
            DataPoint(label="Test B", value=200)
        ]
        
        data_spec = DataSpec(
            data_type=DataType.NUMERICAL,
            data_points=data_points
        )
        
        visual_spec = VisualSpec(
            scene_id=f"test_cache_{int(datetime.now().timestamp())}",
            intent=VisualIntent.BAR_CHART,
            dataspec=data_spec,
            title="Test Cache Chart",
            theme=Theme.PROFESSIONAL
        )
        
        # Create mock Canvas instructions (without datetime fields)
        test_canvas = {
            "canvas_id": "test_cache_canvas",
            "width": 800,
            "height": 600,
            "background_color": "#FFFFFF",
            "elements": [
                {
                    "type": "rect",
                    "x": 100,
                    "y": 100,
                    "width": 200,
                    "height": 100,
                    "fill_color": "#0066CC"
                }
            ],
            "theme": "professional",
            "validation_passed": False,
            "validation_errors": []
        }
        
        canvas_instructions = CanvasInstructions.model_validate(test_canvas)
        
        config = SupabaseConfig(
            url=SUPABASE_URL,
            service_role_key=SUPABASE_SERVICE_ROLE_KEY,
            anon_key=SUPABASE_ANON_KEY
        )
        
        async with SupabaseArtifactManager(config) as manager:
            # Store in cache
            success = await manager.store_canvas_cache(
                visual_spec=visual_spec,
                canvas_instructions=canvas_instructions,
                generation_time_ms=1500,
                rendered_image_path="test_cache.png",
                validation_passed=True
            )
            
            if success:
                print("✅ Cache insert successful")
                
                # Try to retrieve it
                cached = await manager.check_canvas_cache(visual_spec)
                if cached:
                    print(f"✅ Cache retrieval successful: {cached.cache_key}")
                    print(f"  Generation time: {cached.generation_time_ms}ms")
                    print(f"  Validation passed: {cached.validation_passed}")
                    return True
                else:
                    print("❌ Cache retrieval failed")
                    return False
            else:
                print("❌ Cache insert failed")
                return False
                
    except Exception as e:
        print(f"❌ Cache insert test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


async def test_usage_tracking():
    """Test usage tracking functionality"""
    print("\n📊 Testing Usage Tracking")
    print("=" * 50)
    
    try:
        config = SupabaseConfig(
            url=SUPABASE_URL,
            service_role_key=SUPABASE_SERVICE_ROLE_KEY,
            anon_key=SUPABASE_ANON_KEY
        )
        
        async with SupabaseArtifactManager(config) as manager:
            # Track a usage record
            test_user_id = str(uuid.uuid4())
            success = await manager.track_usage(
                request_id=f"test_usage_{int(datetime.now().timestamp())}",
                visual_intent="bar_chart",
                rendering_path="canvas_instructions",
                generation_time_ms=1200,
                success=True,
                session_id=None,  # No session for this test
                employee_id=test_user_id,
                company_id=None,
                model_used="test_model",
                tokens_used=125,
                cost_usd=0.0012,
                cache_hit=False,
                retry_count=0,
                validation_score=0.92
            )
            
            if success:
                print("✅ Usage tracking successful")
                return True
            else:
                print("❌ Usage tracking failed")
                # Try to get more details about what failed
                url = f"{config.url}/rest/v1/ai_visual_usage"
                headers = manager._get_headers()
                
                test_data = {
                    'request_id': f"test_usage_simple_{int(datetime.now().timestamp())}",
                    'visual_intent': 'bar_chart',
                    'rendering_path': 'canvas_instructions',
                    'generation_time_ms': 1200,
                    'success': True
                }
                
                async with manager.session.post(url, headers=headers, json=test_data) as response:
                    print(f"Direct insert attempt: {response.status}")
                    if response.status != 201:
                        error_text = await response.text()
                        print(f"Error details: {error_text}")
                
                return False
                
    except Exception as e:
        print(f"❌ Usage tracking test failed: {str(e)}")
        return False


async def main():
    """Run all direct Supabase tests"""
    print("🧪 AI Visual Generation - Direct Supabase Integration Tests")
    print("=" * 70)
    
    tests = [
        ("Database Connectivity", test_database_connectivity),
        ("Table Access", test_table_access),
        ("Cache Insert & Retrieval", test_cache_insert),
        ("Usage Tracking", test_usage_tracking)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            success = await test_func()
            if success:
                passed += 1
                print(f"✅ {test_name} - PASSED")
            else:
                print(f"❌ {test_name} - FAILED")
        except Exception as e:
            print(f"💥 {test_name} - CRASHED: {str(e)}")
    
    print(f"\n🏁 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All Supabase integration tests passed!")
        print("\n✅ Step 5 Core Infrastructure Complete:")
        print("  - AI artifact tables ✅")
        print("  - Canvas caching system ✅") 
        print("  - Usage tracking ✅")
        print("  - Database connectivity ✅")
        return True
    else:
        print("⚠️ Some tests failed. Check the output above for details.")
        return False


if __name__ == "__main__":
    asyncio.run(main())