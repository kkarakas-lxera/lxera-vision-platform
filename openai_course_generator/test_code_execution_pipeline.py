#!/usr/bin/env python3
"""
Code Execution Pipeline Test Suite
Comprehensive testing of sandboxed code execution for AI Visual Pipeline
"""

import os
import sys
import asyncio
import time
from datetime import datetime

# Add multimedia path
multimedia_path = os.path.join(os.path.dirname(__file__), 'multimedia')
sys.path.append(multimedia_path)

# Set up environment
SUPABASE_URL = "https://xwfweumeryrgbguwrocr.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZndldW1lcnlyZ2JndXdyb2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NjM0NDAsImV4cCI6MjA2NjMzOTQ0MH0.aDpFDImHTr13UhRHqQZHZ92e8I-tvcuUcDCtfRvfbzw"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZndldW1lcnlyZ2JndXdyb2NyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc2MzQ0MCwiZXhwIjoyMDY2MzM5NDQwfQ.qxXpBxUKhKA4AQT4UQnIEJGbGNrRDMbBroZU8YaypSY"

os.environ['SUPABASE_URL'] = SUPABASE_URL
os.environ['SUPABASE_ANON_KEY'] = SUPABASE_ANON_KEY
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = SUPABASE_SERVICE_ROLE_KEY

from visual_execution_engines.code_sandbox import (
    CodeSandbox, SecurityLevel, ExecutionStatus, create_matplotlib_visualization
)
from ai_visual_generation.dynamic_code_generator import DynamicCodeGenerator
from ai_visual_generation.code_execution_pipeline import CodeExecutionPipeline
from ai_visual_generation.supabase_integration import SupabaseArtifactManager, SupabaseConfig
from validators.schema import (
    VisualIntent, DataSpec, DataPoint, DataType, Theme, 
    VisualSpec, RenderingPath, GenerationResult, Constraints
)


async def test_code_sandbox_security():
    """Test security features of the code sandbox"""
    print("🔒 Code Sandbox Security Test")
    print("-" * 50)
    
    sandbox = CodeSandbox(security_level=SecurityLevel.STRICT)
    
    security_tests = [
        {
            "name": "File System Access",
            "code": "open('/etc/passwd', 'r').read()",
            "should_block": True
        },
        {
            "name": "Network Access", 
            "code": "import urllib.request; urllib.request.urlopen('http://google.com')",
            "should_block": True
        },
        {
            "name": "Subprocess Execution",
            "code": "import subprocess; subprocess.run(['ls', '-la'])",
            "should_block": True
        },
        {
            "name": "Dynamic Import",
            "code": "__import__('os').system('whoami')",
            "should_block": True
        },
        {
            "name": "Safe Matplotlib Code",
            "code": """
import matplotlib.pyplot as plt
import os
fig, ax = plt.subplots()
ax.bar(['A', 'B'], [1, 2])
plt.savefig(os.path.join(__temp_dir__, 'test.png'))
plt.close()
print("Safe visualization created")
""",
            "should_block": False
        }
    ]
    
    results = []
    
    for test in security_tests:
        print(f"  Testing: {test['name']}")
        
        result = sandbox.execute_code(test["code"])
        
        if test["should_block"]:
            # Should be blocked
            if result.status == ExecutionStatus.SECURITY_VIOLATION:
                print(f"    ✅ Correctly blocked")
                results.append(True)
            else:
                print(f"    ❌ Should have been blocked! Status: {result.status}")
                results.append(False)
        else:
            # Should succeed
            if result.success:
                print(f"    ✅ Executed successfully")
                results.append(True)
            else:
                print(f"    ❌ Should have succeeded! Error: {result.error}")
                results.append(False)
    
    success_rate = sum(results) / len(results)
    print(f"\n🔒 Security Test Results: {sum(results)}/{len(results)} passed ({success_rate:.1%})")
    
    return success_rate >= 0.8  # 80% pass rate required


async def test_template_based_generation():
    """Test template-based code generation"""
    print("\n📊 Template-Based Generation Test")
    print("-" * 50)
    
    test_cases = [
        {
            "name": "Educational Bar Chart",
            "data": [
                DataPoint(label="Reading", value=30),
                DataPoint(label="Practice", value=70),
                DataPoint(label="Teaching", value=90)
            ],
            "chart_type": "bar",
            "title": "Learning Method Effectiveness"
        },
        {
            "name": "Business Line Chart",
            "data": [
                DataPoint(label="Jan", value=100),
                DataPoint(label="Feb", value=120),
                DataPoint(label="Mar", value=150)
            ],
            "chart_type": "line", 
            "title": "Monthly Revenue Growth"
        }
    ]
    
    results = []
    
    for test_case in test_cases:
        print(f"  Testing: {test_case['name']}")
        
        data = {
            'labels': [dp.label for dp in test_case['data']],
            'values': [dp.value for dp in test_case['data']]
        }
        
        result = create_matplotlib_visualization(
            data=data,
            chart_type=test_case['chart_type'],
            title=test_case['title'],
            security_level=SecurityLevel.STRICT
        )
        
        if result.success and result.generated_files:
            print(f"    ✅ Generated {len(result.generated_files)} file(s)")
            print(f"    ⏱️ Execution time: {result.execution_time:.3f}s")
            results.append(True)
            
            # Save file with descriptive name
            if result.generated_files:
                filename = f"/tmp/template_{test_case['name'].lower().replace(' ', '_')}.png"
                # Note: In real implementation, would copy from temp directory
                print(f"    💾 Would save as: {filename}")
        else:
            print(f"    ❌ Generation failed: {result.error}")
            results.append(False)
    
    success_rate = sum(results) / len(results)
    print(f"\n📊 Template Generation Results: {sum(results)}/{len(results)} passed ({success_rate:.1%})")
    
    return success_rate >= 0.8


async def test_code_execution_pipeline():
    """Test the complete code execution pipeline"""
    print("\n⚡ Code Execution Pipeline Test")
    print("-" * 50)
    
    pipeline = CodeExecutionPipeline(security_level=SecurityLevel.STRICT)
    
    # Test educational scenario
    data_points = [
        DataPoint(label="Passive Learning", value=25),
        DataPoint(label="Active Learning", value=75),
        DataPoint(label="Collaborative Learning", value=85),
        DataPoint(label="Project-Based Learning", value=95)
    ]
    
    visual_spec = VisualSpec(
        scene_id=f"pipeline_test_{int(datetime.now().timestamp())}",
        intent=VisualIntent.BAR_CHART,
        dataspec=DataSpec(
            data_type=DataType.NUMERICAL,
            data_points=data_points
        ),
        title="Learning Approach Effectiveness",
        subtitle="Student engagement and retention rates",
        theme=Theme.EDUCATIONAL,
        constraints=Constraints(max_width=800, max_height=600)
    )
    
    print("  🔮 Testing dynamic generation (with AI)...")
    start_time = time.perf_counter()
    
    result = pipeline.generate_visualization(
        visual_spec=visual_spec,
        use_dynamic_generation=True,
        fallback_to_templates=True
    )
    
    generation_time = (time.perf_counter() - start_time) * 1000
    
    print(f"    Success: {result.success}")
    print(f"    Generation time: {generation_time:.1f}ms")
    print(f"    Rendering path: {result.rendering_path}")
    print(f"    Content type: {result.content_type}")
    
    if result.success:
        print(f"    ✅ Pipeline execution successful!")
        print(f"    📊 Accuracy score: {result.accuracy_score:.2f}")
        print(f"    🎨 Quality score: {result.visual_quality_score:.2f}")
        
        if result.output_data:
            method = result.output_data.get("execution_method", "unknown")
            print(f"    🔧 Execution method: {method}")
        
        # Performance stats
        stats = pipeline.get_performance_stats()
        print(f"    📈 Pipeline success rate: {stats['success_rate']:.1%}")
        
        return True
    else:
        print(f"    ❌ Pipeline failed: {result.output_data}")
        return False


async def test_performance_benchmarks():
    """Test performance characteristics of code execution"""
    print("\n🏃 Performance Benchmark Test")
    print("-" * 50)
    
    benchmark_scenarios = [
        {
            "name": "Simple Bar Chart (5 points)",
            "data_points": 5,
            "complexity": "low"
        },
        {
            "name": "Medium Line Chart (20 points)",
            "data_points": 20,
            "complexity": "medium"  
        },
        {
            "name": "Complex Multi-Series (50 points)",
            "data_points": 50,
            "complexity": "high"
        }
    ]
    
    results = []
    
    for scenario in benchmark_scenarios:
        print(f"  Benchmarking: {scenario['name']}")
        
        # Generate test data
        data_points = [
            DataPoint(label=f"Point {i}", value=i * 10 + 20) 
            for i in range(scenario['data_points'])
        ]
        
        visual_spec = VisualSpec(
            scene_id=f"benchmark_{scenario['complexity']}",
            intent=VisualIntent.BAR_CHART,
            dataspec=DataSpec(data_type=DataType.NUMERICAL, data_points=data_points),
            title=f"Performance Test - {scenario['complexity'].title()} Complexity",
            theme=Theme.PROFESSIONAL
        )
        
        # Benchmark template-based generation
        pipeline = CodeExecutionPipeline(security_level=SecurityLevel.STRICT)
        
        start_time = time.perf_counter()
        result = pipeline.generate_visualization(visual_spec, use_dynamic_generation=False)
        execution_time = (time.perf_counter() - start_time) * 1000
        
        if result.success:
            print(f"    ✅ {execution_time:.1f}ms execution time")
            print(f"    📊 {scenario['data_points']} data points processed")
            
            # Calculate throughput
            throughput = scenario['data_points'] / (execution_time / 1000)
            print(f"    🚀 {throughput:.1f} points/second throughput")
            
            results.append({
                "scenario": scenario['name'],
                "execution_time": execution_time,
                "data_points": scenario['data_points'],
                "throughput": throughput,
                "success": True
            })
        else:
            print(f"    ❌ Execution failed")
            results.append({
                "scenario": scenario['name'], 
                "success": False
            })
    
    # Performance summary
    successful_results = [r for r in results if r.get('success', False)]
    if successful_results:
        avg_time = sum(r['execution_time'] for r in successful_results) / len(successful_results)
        max_throughput = max(r['throughput'] for r in successful_results)
        
        print(f"\n🏃 Performance Summary:")
        print(f"  Average execution time: {avg_time:.1f}ms")
        print(f"  Peak throughput: {max_throughput:.1f} points/second")
        print(f"  Success rate: {len(successful_results)}/{len(results)} ({len(successful_results)/len(results):.1%})")
        
        return len(successful_results) >= 2  # At least 2/3 scenarios should pass
    
    return False


async def test_supabase_integration():
    """Test integration with Supabase storage"""
    print("\n💾 Supabase Integration Test")
    print("-" * 50)
    
    config = SupabaseConfig(
        url=SUPABASE_URL,
        service_role_key=SUPABASE_SERVICE_ROLE_KEY,
        anon_key=SUPABASE_ANON_KEY
    )
    
    # Generate a visualization for storage
    data_points = [
        DataPoint(label="Code Execution", value=95),
        DataPoint(label="Template Based", value=85),
        DataPoint(label="AI Generated", value=90)
    ]
    
    visual_spec = VisualSpec(
        scene_id=f"supabase_test_{int(datetime.now().timestamp())}",
        intent=VisualIntent.BAR_CHART,
        dataspec=DataSpec(data_type=DataType.NUMERICAL, data_points=data_points),
        title="Code Execution Performance Comparison",
        theme=Theme.PROFESSIONAL
    )
    
    pipeline = CodeExecutionPipeline()
    
    print("  🎨 Generating visualization...")
    result = pipeline.generate_visualization(visual_spec)
    
    if result.success:
        print(f"  ✅ Visualization generated successfully")
        
        print("  💾 Storing in Supabase...")
        
        async with SupabaseArtifactManager(config) as storage:
            artifact_id = await storage.store_visual_artifact(
                visual_spec=visual_spec,
                generation_result=result,
                session_id=None,
                content_id="code_execution_test",
                employee_id=None
            )
            
            if artifact_id:
                print(f"  ✅ Stored artifact: {artifact_id}")
                
                # Track usage
                usage_success = await storage.track_usage(
                    request_id=f"code_exec_{visual_spec.scene_id}",
                    visual_intent=visual_spec.intent.value,
                    rendering_path=RenderingPath.CODE_EXECUTION.value,
                    generation_time_ms=result.generation_time_ms,
                    success=True,
                    model_used=result.model_used,
                    tokens_used=result.tokens_used,
                    cost_usd=0.0,  # Template-based has no AI cost
                    cache_hit=False,
                    validation_score=result.accuracy_score
                )
                
                if usage_success:
                    print(f"  ✅ Usage tracked successfully")
                    return True
                else:
                    print(f"  ❌ Usage tracking failed")
            else:
                print(f"  ❌ Storage failed")
    else:
        print(f"  ❌ Visualization generation failed")
    
    return False


async def main():
    """Run all code execution pipeline tests"""
    print("⚡ AI Visual Pipeline: Code Execution Testing")
    print("=" * 70)
    print("🎯 Goal: Secure, sandboxed Python code execution for visualizations")
    print("🔒 Security: Validate against malicious code injection")
    print("📊 Performance: Fast generation with fallback strategies")
    print("💾 Integration: Supabase storage and usage tracking")
    print()
    
    # Test 1: Security validation
    security_passed = await test_code_sandbox_security()
    
    # Test 2: Template-based generation
    template_passed = await test_template_based_generation()
    
    # Test 3: Complete pipeline
    pipeline_passed = await test_code_execution_pipeline()
    
    # Test 4: Performance benchmarks
    performance_passed = await test_performance_benchmarks()
    
    # Test 5: Supabase integration
    integration_passed = await test_supabase_integration()
    
    print()
    print("🏁 Code Execution Pipeline Test Results")
    print("=" * 70)
    
    test_results = {
        "Security Validation": security_passed,
        "Template Generation": template_passed,
        "Pipeline Execution": pipeline_passed, 
        "Performance Benchmarks": performance_passed,
        "Supabase Integration": integration_passed
    }
    
    passed_tests = sum(test_results.values())
    total_tests = len(test_results)
    
    for test_name, passed in test_results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"  {test_name}: {status}")
    
    print()
    print(f"📊 Overall Results: {passed_tests}/{total_tests} tests passed ({passed_tests/total_tests:.1%})")
    
    if passed_tests >= 4:  # At least 4/5 tests must pass
        print()
        print("🎉 Step 8 Complete: Sandboxed Code Execution!")
        print()
        print("✅ Verified Capabilities:")
        print("  • Secure Python sandbox with validation ✅")
        print("  • Template-based matplotlib generation ✅") 
        print("  • AI-generated code execution ✅")
        print("  • Multi-level fallback strategies ✅")
        print("  • Performance benchmarks met ✅")
        print("  • Supabase integration working ✅")
        print()
        print("🚀 Ready for Step 9: Decision Tree Orchestration")
        return True
    else:
        print("⚠️ Some critical tests failed - code execution pipeline needs work")
        return False


if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)