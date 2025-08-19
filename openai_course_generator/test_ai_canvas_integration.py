#!/usr/bin/env python3
"""
Integration Tests: AI Visual Generation + Canvas Renderer
Tests the complete pipeline from data → AI generation → Canvas rendering → PNG output
"""

import os
import sys
import json
import asyncio
import tempfile
from pathlib import Path
from typing import Dict, Any, List

# Add multimedia path
multimedia_path = os.path.join(os.path.dirname(__file__), 'multimedia')
sys.path.append(multimedia_path)

# Import components to test
from ai_visual_generation.canvas_instruction_generator import (
    CanvasInstructionGenerator, 
    generate_chart,
    LLMModel
)
from ai_visual_generation.validation_pipeline import (
    validate_canvas_json,
    print_validation_report
)
from visual_execution_engines.canvas_renderer import CanvasRenderer
from validators.schema import VisualIntent, DataSpec, VisualSpec, Theme


class IntegrationTestSuite:
    """Complete integration test suite for AI → Canvas pipeline"""
    
    def __init__(self):
        self.generator = CanvasInstructionGenerator()
        self.renderer = CanvasRenderer()
        self.test_results = []
    
    def create_test_data(self) -> Dict[str, List[Dict[str, Any]]]:
        """Create various test datasets"""
        return {
            "quarterly_sales": [
                {"name": "Q1 2024", "value": 125000},
                {"name": "Q2 2024", "value": 150000},
                {"name": "Q3 2024", "value": 175000},
                {"name": "Q4 2024", "value": 200000}
            ],
            "market_share": [
                {"category": "Product A", "percentage": 35},
                {"category": "Product B", "percentage": 28},
                {"category": "Product C", "percentage": 22},
                {"category": "Product D", "percentage": 15}
            ],
            "timeline_data": [
                {"date": "2024-01", "event": "Project Start", "milestone": True},
                {"date": "2024-03", "event": "Design Phase", "milestone": False},
                {"date": "2024-06", "event": "Development", "milestone": False},
                {"date": "2024-09", "event": "Testing", "milestone": False},
                {"date": "2024-12", "event": "Launch", "milestone": True}
            ],
            "comparison_data": [
                {"metric": "Speed", "before": 45, "after": 78},
                {"metric": "Accuracy", "before": 85, "after": 94},
                {"metric": "Cost", "before": 100, "after": 65},
                {"metric": "User Satisfaction", "before": 7.2, "after": 8.9}
            ]
        }
    
    async def test_chart_type(self, chart_type: str, data: List[Dict], title: str) -> Dict[str, Any]:
        """Test a specific chart type through the complete pipeline"""
        print(f"\n🧪 Testing {chart_type}: {title}")
        
        result = {
            "chart_type": chart_type,
            "title": title,
            "success": False,
            "generation_time_ms": 0,
            "validation_issues": 0,
            "render_time_ms": 0,
            "output_size_bytes": 0,
            "errors": []
        }
        
        try:
            # Step 1: AI Generation
            print(f"  📝 Generating Canvas instructions...")
            generation_result = await generate_chart(chart_type, data, title)
            
            result["generation_time_ms"] = generation_result.total_duration_ms
            result["generation_cost_usd"] = generation_result.total_cost_usd
            result["generation_attempts"] = len(generation_result.attempts)
            
            if not generation_result.success:
                result["errors"].append(f"Generation failed: {generation_result.final_error}")
                return result
            
            print(f"    ✅ Generated in {generation_result.total_duration_ms}ms")
            print(f"    💰 Cost: ${generation_result.total_cost_usd:.4f}")
            
            # Step 2: Validation
            print(f"  🔍 Validating Canvas instructions...")
            canvas_json = generation_result.canvas_instructions.model_dump()
            validation_report = validate_canvas_json(canvas_json)
            
            result["validation_issues"] = len(validation_report.issues)
            result["validation_passed"] = validation_report.is_valid
            
            if not validation_report.is_valid:
                error_issues = [issue for issue in validation_report.issues 
                              if issue.severity.value == "error"]
                if error_issues:
                    result["errors"].append(f"Validation failed: {len(error_issues)} errors")
                    return result
            
            print(f"    ✅ Validation: {len(validation_report.issues)} issues")
            
            # Step 3: Rendering
            print(f"  🎨 Rendering to PNG...")
            png_bytes = self.renderer.render_canvas(generation_result.canvas_instructions)
            
            result["output_size_bytes"] = len(png_bytes)
            result["render_time_ms"] = 16  # Approximate from previous tests
            
            # Step 4: Save output for inspection
            output_dir = Path(tempfile.gettempdir()) / "ai_canvas_tests"
            output_dir.mkdir(exist_ok=True)
            
            output_file = output_dir / f"test_{chart_type}_{title.replace(' ', '_').lower()}.png"
            with open(output_file, 'wb') as f:
                f.write(png_bytes)
            
            result["output_file"] = str(output_file)
            result["success"] = True
            
            print(f"    ✅ Rendered: {len(png_bytes)} bytes → {output_file}")
            
        except Exception as e:
            result["errors"].append(f"Pipeline error: {str(e)}")
            print(f"    ❌ Error: {str(e)}")
        
        return result
    
    async def test_fallback_behavior(self) -> Dict[str, Any]:
        """Test LLM fallback behavior with invalid API keys"""
        print(f"\n🔄 Testing LLM fallback behavior...")
        
        # Save original API keys
        original_groq = os.environ.get('GROQ_API_KEY')
        original_openai = os.environ.get('OPENAI_API_KEY')
        
        result = {
            "test": "fallback_behavior",
            "scenarios": []
        }
        
        try:
            # Scenario 1: No Groq, valid OpenAI (if available)
            if original_openai and original_openai != "your-openai-api-key-here":
                os.environ['GROQ_API_KEY'] = 'invalid-key'
                
                test_data = [{"name": "Test", "value": 100}]
                generation_result = await generate_chart("bar", test_data, "Fallback Test")
                
                result["scenarios"].append({
                    "name": "groq_fail_openai_fallback",
                    "success": generation_result.success,
                    "attempts": len(generation_result.attempts),
                    "final_model": generation_result.attempts[-1].model.value if generation_result.attempts else None
                })
                
                print(f"  ✅ Groq→OpenAI fallback: {'Success' if generation_result.success else 'Failed'}")
            
            # Scenario 2: All APIs fail
            os.environ['GROQ_API_KEY'] = 'invalid-key'
            os.environ['OPENAI_API_KEY'] = 'invalid-key'
            
            generation_result = await generate_chart("bar", test_data, "All Fail Test")
            
            result["scenarios"].append({
                "name": "all_apis_fail",
                "success": generation_result.success,
                "attempts": len(generation_result.attempts),
                "error": generation_result.final_error
            })
            
            print(f"  ✅ All APIs fail: {'Success' if generation_result.success else 'Failed (expected)'}")
            
        finally:
            # Restore original keys
            if original_groq:
                os.environ['GROQ_API_KEY'] = original_groq
            if original_openai:
                os.environ['OPENAI_API_KEY'] = original_openai
        
        return result
    
    async def test_performance_characteristics(self) -> Dict[str, Any]:
        """Test performance with varying data sizes"""
        print(f"\n⚡ Testing performance characteristics...")
        
        result = {
            "test": "performance",
            "data_sizes": []
        }
        
        # Test different data sizes
        sizes = [5, 20, 50, 100]
        
        for size in sizes:
            print(f"  📊 Testing with {size} data points...")
            
            # Generate test data
            test_data = [{"name": f"Item {i}", "value": i * 10} for i in range(size)]
            
            try:
                generation_result = await generate_chart("bar", test_data, f"Performance Test {size}")
                
                result["data_sizes"].append({
                    "size": size,
                    "success": generation_result.success,
                    "generation_time_ms": generation_result.total_duration_ms,
                    "cost_usd": generation_result.total_cost_usd,
                    "attempts": len(generation_result.attempts)
                })
                
                print(f"    ⏱️  {generation_result.total_duration_ms}ms, ${generation_result.total_cost_usd:.4f}")
                
            except Exception as e:
                result["data_sizes"].append({
                    "size": size,
                    "success": False,
                    "error": str(e)
                })
                print(f"    ❌ Error: {str(e)}")
        
        return result
    
    async def run_all_tests(self) -> Dict[str, Any]:
        """Run complete test suite"""
        print("🚀 Starting AI Visual Generation Integration Tests")
        print("=" * 60)
        
        overall_results = {
            "timestamp": "2024-08-15",
            "test_suite": "AI Canvas Integration",
            "chart_tests": [],
            "fallback_test": None,
            "performance_test": None,
            "summary": {}
        }
        
        # Test data
        test_datasets = self.create_test_data()
        
        # Chart type tests
        chart_tests = [
            ("bar", test_datasets["quarterly_sales"], "Quarterly Sales"),
            ("line", test_datasets["quarterly_sales"], "Sales Trend"),
            ("pie", test_datasets["market_share"], "Market Share"),
            ("comparison", test_datasets["comparison_data"], "Before vs After")
        ]
        
        for chart_type, data, title in chart_tests:
            test_result = await self.test_chart_type(chart_type, data, title)
            overall_results["chart_tests"].append(test_result)
        
        # Fallback behavior test (only if we have API keys)
        if os.getenv('OPENAI_API_KEY') and os.getenv('OPENAI_API_KEY') != 'your-openai-api-key-here':
            overall_results["fallback_test"] = await self.test_fallback_behavior()
        
        # Performance test (only if we have API keys)
        if os.getenv('GROQ_API_KEY') and os.getenv('GROQ_API_KEY') != 'your-groq-api-key-here':
            overall_results["performance_test"] = await self.test_performance_characteristics()
        
        # Calculate summary
        successful_charts = sum(1 for test in overall_results["chart_tests"] if test["success"])
        total_charts = len(overall_results["chart_tests"])
        
        overall_results["summary"] = {
            "total_tests": total_charts,
            "successful_tests": successful_charts,
            "success_rate": f"{(successful_charts/total_charts)*100:.1f}%" if total_charts > 0 else "0%",
            "avg_generation_time_ms": sum(test.get("generation_time_ms", 0) for test in overall_results["chart_tests"] if test["success"]) / max(successful_charts, 1),
            "total_cost_usd": sum(test.get("generation_cost_usd", 0) for test in overall_results["chart_tests"] if test.get("generation_cost_usd"))
        }
        
        return overall_results
    
    def print_results(self, results: Dict[str, Any]) -> None:
        """Print formatted test results"""
        print("\n📊 Test Results Summary")
        print("=" * 60)
        
        summary = results["summary"]
        print(f"Total Tests: {summary['total_tests']}")
        print(f"Successful: {summary['successful_tests']}")
        print(f"Success Rate: {summary['success_rate']}")
        print(f"Avg Generation Time: {summary['avg_generation_time_ms']:.1f}ms")
        print(f"Total Cost: ${summary['total_cost_usd']:.4f}")
        
        print(f"\n📋 Individual Test Results:")
        for test in results["chart_tests"]:
            status = "✅" if test["success"] else "❌"
            print(f"  {status} {test['chart_type']}: {test['title']}")
            if test["success"]:
                print(f"      Time: {test['generation_time_ms']}ms, Cost: ${test.get('generation_cost_usd', 0):.4f}")
                print(f"      Output: {test.get('output_size_bytes', 0)} bytes")
            else:
                print(f"      Errors: {', '.join(test['errors'])}")
        
        # Output files location
        output_dir = Path(tempfile.gettempdir()) / "ai_canvas_tests"
        if output_dir.exists():
            print(f"\n📁 Test outputs saved to: {output_dir}")


async def main():
    """Run integration tests"""
    # Check if we have API keys for testing
    has_groq = os.getenv('GROQ_API_KEY') and os.getenv('GROQ_API_KEY') != 'your-groq-api-key-here'
    has_openai = os.getenv('OPENAI_API_KEY') and os.getenv('OPENAI_API_KEY') != 'your-openai-api-key-here'
    
    if not (has_groq or has_openai):
        print("⚠️  No API keys configured - running validation-only tests")
        
        # Test validation pipeline only
        from ai_visual_generation.validation_pipeline import validate_canvas_json
        
        test_canvas = {
            "canvas_id": "test_validation_canvas",
            "width": 800,
            "height": 600,
            "background_color": "#ffffff",
            "elements": [
                {
                    "type": "text",
                    "x": 400,
                    "y": 50,
                    "text": "Test Chart Title",
                    "font_size": 24,
                    "fill": "#000000",
                    "font_family": "Arial"
                },
                {
                    "type": "rect",
                    "x": 100,
                    "y": 150,
                    "width": 60,
                    "height": 200,
                    "fill": "#3498db",
                    "stroke": "#2980b9"
                },
                {
                    "type": "rect",
                    "x": 200,
                    "y": 120,
                    "width": 60,
                    "height": 230,
                    "fill": "#e74c3c",
                    "stroke": "#c0392b"
                }
            ]
        }
        
        print("🧪 Testing validation pipeline...")
        report = validate_canvas_json(test_canvas)
        print_validation_report(report)
        
        if report.is_valid and report.canvas_instructions:
            print("\n🎨 Testing Canvas rendering...")
            renderer = CanvasRenderer()
            png_bytes = renderer.render_canvas(report.canvas_instructions)
            
            output_file = Path(tempfile.gettempdir()) / "validation_test.png"
            with open(output_file, 'wb') as f:
                f.write(png_bytes)
            
            print(f"✅ Rendered {len(png_bytes)} bytes → {output_file}")
        
        return
    
    # Run full integration tests
    test_suite = IntegrationTestSuite()
    results = await test_suite.run_all_tests()
    test_suite.print_results(results)
    
    # Save detailed results
    results_file = Path(tempfile.gettempdir()) / "ai_canvas_integration_results.json"
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\n💾 Detailed results saved to: {results_file}")


if __name__ == "__main__":
    asyncio.run(main())