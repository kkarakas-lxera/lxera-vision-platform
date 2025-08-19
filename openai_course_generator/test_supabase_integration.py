#!/usr/bin/env python3
"""
Test Supabase Integration for AI Visual Generation
Validates database tables, caching, and edge function integration
"""

import os
import sys
import asyncio
import json
from datetime import datetime

# Add multimedia path
multimedia_path = os.path.join(os.path.dirname(__file__), 'multimedia')
sys.path.append(multimedia_path)

from ai_visual_generation.supabase_integration import SupabaseArtifactManager, SupabaseConfig
from ai_visual_generation.canvas_instruction_generator import CanvasInstructionGenerator
from validators.schema import (
    VisualIntent, DataSpec, DataPoint, DataType, Theme, 
    VisualSpec, CanvasInstructions, RenderingPath, GenerationResult
)


def test_supabase_config():
    """Test Supabase configuration loading"""
    print("🔧 Testing Supabase Configuration")
    print("=" * 50)
    
    # Test from environment
    config = SupabaseConfig.from_env()
    
    print(f"Supabase URL: {config.url[:50]}..." if config.url else "❌ No URL")
    print(f"Service Role Key: {'✅ Set' if config.service_role_key else '❌ Missing'}")
    print(f"Anon Key: {'✅ Set' if config.anon_key else '❌ Missing'}")
    print(f"Storage Bucket: {config.storage_bucket}")
    
    # Check required fields
    if not config.url or not config.service_role_key:
        print("⚠️ Missing required Supabase configuration")
        print("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables")
        return False
    
    print("✅ Supabase configuration valid")
    return True


async def test_artifact_manager_initialization():
    """Test SupabaseArtifactManager initialization"""
    print("\n🏗️ Testing Artifact Manager Initialization")
    print("=" * 50)
    
    try:
        async with SupabaseArtifactManager() as manager:
            print("✅ Artifact manager initialized successfully")
            print(f"Config URL: {manager.config.url[:50]}...")
            print(f"Storage bucket: {manager.config.storage_bucket}")
            return True
    except Exception as e:
        print(f"❌ Failed to initialize artifact manager: {str(e)}")
        return False


async def test_content_hashing():
    """Test content hash generation for caching"""
    print("\n🔐 Testing Content Hash Generation")
    print("=" * 50)
    
    # Create test visual specs
    data_points = [
        DataPoint(label="Q1", value=120),
        DataPoint(label="Q2", value=150),
        DataPoint(label="Q3", value=180),
        DataPoint(label="Q4", value=200)
    ]
    
    data_spec = DataSpec(
        data_type=DataType.NUMERICAL,
        data_points=data_points
    )
    
    visual_spec1 = VisualSpec(
        scene_id="test_scene_001",
        intent=VisualIntent.BAR_CHART,
        dataspec=data_spec,
        title="Test Chart",
        theme=Theme.PROFESSIONAL
    )
    
    visual_spec2 = VisualSpec(
        scene_id="test_scene_002",  # Different scene ID
        intent=VisualIntent.BAR_CHART,
        dataspec=data_spec,
        title="Test Chart",
        theme=Theme.PROFESSIONAL
    )
    
    visual_spec3 = VisualSpec(
        scene_id="test_scene_003",
        intent=VisualIntent.LINE_CHART,  # Different intent
        dataspec=data_spec,
        title="Test Chart",
        theme=Theme.PROFESSIONAL
    )
    
    try:
        async with SupabaseArtifactManager() as manager:
            hash1 = manager._generate_content_hash(visual_spec1)
            hash2 = manager._generate_content_hash(visual_spec2)
            hash3 = manager._generate_content_hash(visual_spec3)
            
            print(f"Hash 1 (BAR_CHART): {hash1[:16]}...")
            print(f"Hash 2 (BAR_CHART, diff scene): {hash2[:16]}...")
            print(f"Hash 3 (LINE_CHART): {hash3[:16]}...")
            
            # Hashes 1 and 2 should be the same (scene_id not in hash)
            # Hash 3 should be different (different intent)
            if hash1 == hash2:
                print("✅ Same visual spec produces same hash (scene_id ignored)")
            else:
                print("❌ Same visual spec produces different hashes")
                return False
            
            if hash1 != hash3:
                print("✅ Different visual intent produces different hash")
            else:
                print("❌ Different visual specs produce same hash")
                return False
            
            # Test cache key generation
            cache_key1 = manager._generate_cache_key(visual_spec1, hash1)
            cache_key3 = manager._generate_cache_key(visual_spec3, hash3)
            
            print(f"Cache key 1: {cache_key1}")
            print(f"Cache key 3: {cache_key3}")
            
            if cache_key1 != cache_key3:
                print("✅ Different cache keys for different specs")
                return True
            else:
                print("❌ Same cache key for different specs")
                return False
                
    except Exception as e:
        print(f"❌ Content hashing test failed: {str(e)}")
        return False


async def test_cache_operations():
    """Test Canvas cache operations"""
    print("\n💾 Testing Canvas Cache Operations")
    print("=" * 50)
    
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
        scene_id=f"cache_test_{int(datetime.now().timestamp())}",
        intent=VisualIntent.BAR_CHART,
        dataspec=data_spec,
        title="Cache Test Chart",
        theme=Theme.PROFESSIONAL
    )
    
    # Create mock Canvas instructions
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
            },
            {
                "type": "text",
                "x": 150,
                "y": 150,
                "text": "Test Cache",
                "font_size": 16,
                "color": "#FFFFFF"
            }
        ],
        "theme": "professional"
    }
    
    try:
        canvas_instructions = CanvasInstructions.model_validate(test_canvas)
        
        async with SupabaseArtifactManager() as manager:
            # Test 1: Check for non-existent cache
            print("🔍 Checking for existing cache...")
            cached = await manager.check_canvas_cache(visual_spec)
            if cached:
                print(f"ℹ️ Found existing cache: {cached.cache_key}")
            else:
                print("✅ No existing cache found (expected)")
            
            # Test 2: Store in cache
            print("💾 Storing Canvas instructions in cache...")
            store_success = await manager.store_canvas_cache(
                visual_spec=visual_spec,
                canvas_instructions=canvas_instructions,
                generation_time_ms=1500,
                rendered_image_path=f"cache_test_{visual_spec.scene_id}.png",
                validation_passed=True
            )
            
            if store_success:
                print("✅ Canvas instructions cached successfully")
            else:
                print("❌ Failed to cache Canvas instructions")
                return False
            
            # Test 3: Retrieve from cache
            print("🔍 Retrieving from cache...")
            cached = await manager.check_canvas_cache(visual_spec)
            
            if cached:
                print(f"✅ Retrieved cached Canvas: {cached.cache_key}")
                print(f"Generation time: {cached.generation_time_ms}ms")
                print(f"Hit count: {cached.hit_count}")
                print(f"Validation passed: {cached.validation_passed}")
                
                # Verify content matches
                if cached.canvas_instructions.canvas_id == test_canvas["canvas_id"]:
                    print("✅ Cached content matches original")
                else:
                    print("❌ Cached content doesn't match")
                    return False
                
                return True
            else:
                print("❌ Failed to retrieve cached Canvas")
                return False
                
    except Exception as e:
        print(f"❌ Cache operations test failed: {str(e)}")
        return False


async def test_artifact_storage():
    """Test visual artifact storage"""
    print("\n📦 Testing Visual Artifact Storage")
    print("=" * 50)
    
    # Create test data
    data_points = [
        DataPoint(label="Artifact A", value=300),
        DataPoint(label="Artifact B", value=400)
    ]
    
    data_spec = DataSpec(
        data_type=DataType.NUMERICAL,
        data_points=data_points
    )
    
    visual_spec = VisualSpec(
        scene_id=f"artifact_test_{int(datetime.now().timestamp())}",
        intent=VisualIntent.PIE_CHART,
        dataspec=data_spec,
        title="Artifact Test Chart",
        theme=Theme.EDUCATIONAL
    )
    
    # Create mock generation result
    generation_result = GenerationResult(
        success=True,
        visual_spec=visual_spec,
        rendering_path=RenderingPath.CANVAS_INSTRUCTIONS,
        output_data={"test": "canvas_data"},
        file_path=f"artifacts/{visual_spec.scene_id}.png",
        content_type="image/png",
        generation_time_ms=2000,
        cache_hit=False,
        retry_count=1,
        accuracy_score=0.95,
        visual_quality_score=0.88,
        generated_at=datetime.now(),
        model_used="groq_8b",
        tokens_used=150
    )
    
    try:
        async with SupabaseArtifactManager() as manager:
            # Store artifact
            print("📦 Storing visual artifact...")
            artifact_id = await manager.store_visual_artifact(
                visual_spec=visual_spec,
                generation_result=generation_result,
                session_id="test_session_001",
                content_id="test_content_001",
                employee_id="test_user_001"
            )
            
            if artifact_id:
                print(f"✅ Artifact stored with ID: {artifact_id}")
            else:
                print("❌ Failed to store artifact")
                return False
            
            # Retrieve artifacts
            print("🔍 Retrieving artifacts...")
            artifacts = await manager.get_visual_artifacts(
                scene_id=visual_spec.scene_id,
                limit=10
            )
            
            if artifacts:
                print(f"✅ Retrieved {len(artifacts)} artifacts")
                for artifact in artifacts:
                    print(f"  - {artifact['artifact_id']}: {artifact['visual_intent']} ({artifact['status']})")
                return True
            else:
                print("❌ No artifacts retrieved")
                return False
                
    except Exception as e:
        print(f"❌ Artifact storage test failed: {str(e)}")
        return False


async def test_usage_tracking():
    """Test usage tracking functionality"""
    print("\n📊 Testing Usage Tracking")
    print("=" * 50)
    
    try:
        async with SupabaseArtifactManager() as manager:
            # Track successful generation
            success = await manager.track_usage(
                request_id=f"usage_test_{int(datetime.now().timestamp())}",
                visual_intent="bar_chart",
                rendering_path="canvas_instructions",
                generation_time_ms=1200,
                success=True,
                session_id="test_session_usage",
                employee_id="test_user_usage",
                company_id="test_company_001",
                model_used="groq_8b",
                tokens_used=125,
                cost_usd=0.0012,
                cache_hit=False,
                retry_count=0,
                validation_score=0.92
            )
            
            if success:
                print("✅ Usage tracking successful")
            else:
                print("❌ Usage tracking failed")
                return False
            
            # Track failed generation
            success = await manager.track_usage(
                request_id=f"usage_test_fail_{int(datetime.now().timestamp())}",
                visual_intent="complex_diagram",
                rendering_path="canvas_instructions",
                generation_time_ms=3000,
                success=False,
                session_id="test_session_usage",
                employee_id="test_user_usage",
                model_used="groq_70b",
                tokens_used=250,
                cost_usd=0.0025,
                cache_hit=False,
                retry_count=2,
                error_code="VALIDATION_FAILED"
            )
            
            if success:
                print("✅ Failed generation tracking successful")
                return True
            else:
                print("❌ Failed generation tracking failed")
                return False
                
    except Exception as e:
        print(f"❌ Usage tracking test failed: {str(e)}")
        return False


async def test_integration_with_canvas_generator():
    """Test integration with Canvas instruction generator"""
    print("\n🔗 Testing Integration with Canvas Generator")
    print("=" * 50)
    
    # Create test data
    data_points = [
        DataPoint(label="Integration A", value=150),
        DataPoint(label="Integration B", value=200),
        DataPoint(label="Integration C", value=175)
    ]
    
    data_spec = DataSpec(
        data_type=DataType.NUMERICAL,
        data_points=data_points
    )
    
    visual_spec = VisualSpec(
        scene_id=f"integration_test_{int(datetime.now().timestamp())}",
        intent=VisualIntent.LINE_CHART,
        dataspec=data_spec,
        title="Integration Test Chart",
        theme=Theme.MODERN
    )
    
    try:
        # Generate Canvas instructions
        print("🎨 Generating Canvas instructions...")
        generator = CanvasInstructionGenerator()
        generation_result = await generator.generate(visual_spec, title="Integration Test")
        
        if not generation_result.success:
            print(f"❌ Canvas generation failed: {generation_result.final_error}")
            return False
        
        print(f"✅ Canvas generated in {generation_result.total_duration_ms}ms")
        print(f"Cost: ${generation_result.total_cost_usd:.4f}")
        print(f"Attempts: {len(generation_result.attempts)}")
        
        # Store in Supabase
        print("💾 Storing generation result in Supabase...")
        async with SupabaseArtifactManager() as manager:
            # Create GenerationResult compatible object
            supabase_result = GenerationResult(
                success=generation_result.success,
                visual_spec=visual_spec,
                rendering_path=RenderingPath.CANVAS_INSTRUCTIONS,
                output_data=generation_result.canvas_instructions.model_dump() if generation_result.canvas_instructions else None,
                generation_time_ms=generation_result.total_duration_ms,
                cache_hit=False,
                retry_count=len(generation_result.attempts) - 1,
                accuracy_score=0.9,  # Mock score
                generated_at=datetime.now(),
                model_used=generation_result.attempts[-1].model.value if generation_result.attempts else None,
                tokens_used=sum(a.prompt_tokens + a.completion_tokens for a in generation_result.attempts)
            )
            
            artifact_id = await manager.store_visual_artifact(
                visual_spec=visual_spec,
                generation_result=supabase_result,
                session_id="integration_test_session",
                content_id="integration_test_content",
                employee_id="integration_test_user"
            )
            
            if artifact_id:
                print(f"✅ Integration test successful - Artifact ID: {artifact_id}")
                return True
            else:
                print("❌ Failed to store generation result")
                return False
                
    except Exception as e:
        print(f"❌ Integration test failed: {str(e)}")
        return False


async def main():
    """Run all Supabase integration tests"""
    print("🧪 AI Visual Generation - Supabase Integration Tests")
    print("=" * 60)
    
    # Test configuration first
    if not test_supabase_config():
        print("\n❌ Supabase configuration test failed")
        print("Please check your environment variables:")
        print("- SUPABASE_URL")
        print("- SUPABASE_SERVICE_ROLE_KEY")
        print("- SUPABASE_ANON_KEY (optional)")
        return
    
    # Run async tests
    tests = [
        ("Artifact Manager Initialization", test_artifact_manager_initialization),
        ("Content Hash Generation", test_content_hashing),
        ("Canvas Cache Operations", test_cache_operations),
        ("Visual Artifact Storage", test_artifact_storage),
        ("Usage Tracking", test_usage_tracking),
        ("Canvas Generator Integration", test_integration_with_canvas_generator)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            success = await test_func()
            if success:
                passed += 1
            else:
                print(f"\n❌ {test_name} test failed")
        except Exception as e:
            print(f"\n💥 {test_name} test crashed: {str(e)}")
    
    print(f"\n🏁 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All Supabase integration tests passed!")
        print("\n✅ Step 5 Implementation Complete:")
        print("  - AI artifact tables created")
        print("  - Canvas caching system working") 
        print("  - Usage tracking functional")
        print("  - Integration with Canvas generator verified")
    else:
        print("⚠️ Some tests failed. Check the output above for details.")


if __name__ == "__main__":
    asyncio.run(main())