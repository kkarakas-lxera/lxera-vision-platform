#!/usr/bin/env python3
"""
SVG Generation & Rendering Pipeline Test
Tests the complete SVG flow: Generation → Sanitization → PNG Rendering
"""

import os
import sys
import tempfile
from datetime import datetime

# Add multimedia path
multimedia_path = os.path.join(os.path.dirname(__file__), 'multimedia')
sys.path.append(multimedia_path)

from ai_visual_generation.svg_generator import AIDirectedSVGGenerator, SVGGenerationResult
from visual_execution_engines.svg_renderer import SVGRenderer
from validators.schema import (
    VisualIntent, DataSpec, DataPoint, DataType, Theme, 
    VisualSpec, Constraints
)


def test_svg_generation_pipeline():
    """Test complete SVG generation and rendering pipeline"""
    print("🎨 SVG Generation & Rendering Pipeline Test")
    print("=" * 60)
    
    # Test data for different chart types
    test_cases = [
        {
            'name': 'Bar Chart',
            'intent': VisualIntent.BAR_CHART,
            'data': [
                DataPoint(label="Q1 2024", value=120),
                DataPoint(label="Q2 2024", value=150),
                DataPoint(label="Q3 2024", value=180),
                DataPoint(label="Q4 2024", value=200)
            ],
            'title': "Quarterly Revenue Growth"
        },
        {
            'name': 'Pie Chart',
            'intent': VisualIntent.PIE_CHART,
            'data': [
                DataPoint(label="Desktop", value=45),
                DataPoint(label="Mobile", value=35),
                DataPoint(label="Tablet", value=20)
            ],
            'title': "Device Usage Distribution"
        },
        {
            'name': 'Line Chart',
            'intent': VisualIntent.LINE_CHART,
            'data': [
                DataPoint(label="Jan", value=100),
                DataPoint(label="Feb", value=110),
                DataPoint(label="Mar", value=95),
                DataPoint(label="Apr", value=130),
                DataPoint(label="May", value=140)
            ],
            'title': "Monthly Active Users"
        }
    ]
    
    generator = AIDirectedSVGGenerator()
    renderer = SVGRenderer()
    
    total_tests = len(test_cases) * 2  # SVG + PNG for each
    passed_tests = 0
    
    print(f"🧪 Running {total_tests} tests...")
    print()
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"📊 Test {i}: {test_case['name']}")
        print("-" * 40)
        
        # Create visual spec
        data_spec = DataSpec(
            data_type=DataType.NUMERICAL,
            data_points=test_case['data']
        )
        
        visual_spec = VisualSpec(
            scene_id=f"svg_test_{test_case['intent'].value}_{int(datetime.now().timestamp())}",
            intent=test_case['intent'],
            dataspec=data_spec,
            title=test_case['title'],
            theme=Theme.PROFESSIONAL,
            constraints=Constraints(max_width=800, max_height=600)
        )
        
        # Test SVG Generation
        print("  🎨 Testing SVG Generation...")
        start_time = datetime.now()
        
        svg_result = generator.generate_svg_visual(visual_spec)
        
        generation_time = int((datetime.now() - start_time).total_seconds() * 1000)
        
        if svg_result.success and svg_result.sanitized_svg:
            passed_tests += 1
            print(f"    ✅ SVG generated: {svg_result.size_bytes} bytes ({generation_time}ms)")
            print(f"    🔒 Security violations: {len(svg_result.security_violations)}")
            print(f"    ⭐ Validation score: {svg_result.validation_report.score:.2f}")
            
            # Save SVG file
            svg_filename = f"/tmp/test_{test_case['intent'].value}.svg"
            with open(svg_filename, 'w') as f:
                f.write(svg_result.sanitized_svg)
            print(f"    💾 Saved: {svg_filename}")
            
            # Test PNG Rendering
            print("  🖼️ Testing PNG Rendering...")
            start_time = datetime.now()
            
            success, png_bytes, error = renderer.render_svg_to_png(
                svg_result.sanitized_svg,
                width=800,
                height=600
            )
            
            render_time = int((datetime.now() - start_time).total_seconds() * 1000)
            
            if success and png_bytes:
                passed_tests += 1
                print(f"    ✅ PNG rendered: {len(png_bytes)} bytes ({render_time}ms)")
                
                # Save PNG file
                png_filename = f"/tmp/test_{test_case['intent'].value}.png"
                with open(png_filename, 'wb') as f:
                    f.write(png_bytes)
                print(f"    💾 Saved: {png_filename}")
                
            else:
                print(f"    ❌ PNG rendering failed: {error}")
            
        else:
            print(f"    ❌ SVG generation failed")
            if svg_result.validation_report.errors:
                print(f"    Errors: {svg_result.validation_report.errors}")
            if svg_result.security_violations:
                print(f"    Security issues: {svg_result.security_violations}")
        
        print()
    
    # Test Security Validation
    print("🔒 Security Validation Tests")
    print("-" * 40)
    
    security_tests = [
        {
            'name': 'JavaScript Injection',
            'svg': '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><script>alert("xss")</script><rect x="0" y="0" width="100" height="100" fill="red"/></svg>',
            'should_fail': True
        },
        {
            'name': 'Data URI',
            'svg': '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><image href="data:image/png;base64,iVBORw0KGgoAAAANS..."/></svg>',
            'should_fail': True
        },
        {
            'name': 'Clean SVG',
            'svg': '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect x="0" y="0" width="100" height="100" fill="#0066CC"/></svg>',
            'should_fail': False
        }
    ]
    
    security_passed = 0
    for test in security_tests:
        print(f"  🛡️ {test['name']}")
        
        sanitized_svg, violations = generator.sanitizer.sanitize_svg(test['svg'])
        
        has_violations = len(violations) > 0
        test_passed = (has_violations and test['should_fail']) or (not has_violations and not test['should_fail'])
        
        if test_passed:
            security_passed += 1
            print(f"    ✅ Security test passed")
        else:
            print(f"    ❌ Security test failed")
        
        if violations:
            print(f"    Violations: {violations}")
        
        print()
    
    # Performance Benchmark
    print("⚡ Performance Benchmark")
    print("-" * 40)
    
    # Create large dataset for performance test
    large_data = [DataPoint(label=f"Item {i}", value=i*10) for i in range(50)]
    large_data_spec = DataSpec(data_type=DataType.NUMERICAL, data_points=large_data)
    
    large_visual_spec = VisualSpec(
        scene_id="performance_test",
        intent=VisualIntent.BAR_CHART,
        dataspec=large_data_spec,
        title="Performance Test Chart (50 data points)",
        theme=Theme.PROFESSIONAL,
        constraints=Constraints(max_width=1200, max_height=800)
    )
    
    print("  📊 Large dataset test (50 bars)...")
    start_time = datetime.now()
    
    perf_result = generator.generate_svg_visual(large_visual_spec)
    
    if perf_result.success:
        generation_time = int((datetime.now() - start_time).total_seconds() * 1000)
        print(f"    ✅ Large SVG: {perf_result.size_bytes} bytes ({generation_time}ms)")
        
        # Test rendering performance
        start_time = datetime.now()
        success, png_bytes, _ = renderer.render_svg_to_png(perf_result.sanitized_svg)
        render_time = int((datetime.now() - start_time).total_seconds() * 1000)
        
        if success:
            print(f"    ✅ Large PNG: {len(png_bytes)} bytes ({render_time}ms)")
            
            # Performance thresholds
            if generation_time < 100:
                print(f"    🚀 Generation performance: Excellent (<100ms)")
            elif generation_time < 500:
                print(f"    ⚡ Generation performance: Good (<500ms)")
            else:
                print(f"    ⚠️ Generation performance: Slow (>{generation_time}ms)")
            
            if render_time < 200:
                print(f"    🚀 Render performance: Excellent (<200ms)")
            elif render_time < 1000:
                print(f"    ⚡ Render performance: Good (<1s)")
            else:
                print(f"    ⚠️ Render performance: Slow (>{render_time}ms)")
        else:
            print(f"    ❌ Large PNG rendering failed")
    else:
        print(f"    ❌ Large SVG generation failed")
    
    print()
    
    # Final Results
    total_security_tests = len(security_tests)
    all_tests = passed_tests + security_passed
    all_total = total_tests + total_security_tests
    
    print("🏁 Final Results")
    print("=" * 60)
    print(f"📊 SVG Pipeline Tests: {passed_tests}/{total_tests} passed")
    print(f"🔒 Security Tests: {security_passed}/{total_security_tests} passed")
    print(f"🎯 Overall: {all_tests}/{all_total} tests passed ({(all_tests/all_total)*100:.1f}%)")
    
    if all_tests == all_total:
        print("🎉 All SVG pipeline tests passed!")
        print()
        print("✅ Step 6 Components Verified:")
        print("  - SVG generation for bar/pie/line charts ✅")
        print("  - Security sanitization & validation ✅")
        print("  - PNG rendering via cairosvg ✅")
        print("  - Performance benchmarking ✅")
        print("  - Multi-format output support ✅")
        print()
        print("🚀 Ready for Step 7: Deterministic Visual Registry")
        return True
    else:
        print("⚠️ Some SVG pipeline tests failed. Check output above.")
        return False


def test_renderer_capabilities():
    """Test SVG renderer capabilities"""
    print("\n🔧 SVG Renderer Capabilities Test")
    print("=" * 50)
    
    renderer = SVGRenderer()
    capabilities = renderer.get_rendering_capabilities()
    
    print(f"Available renderers:")
    print(f"  cairosvg: {'✅' if capabilities['cairo_available'] else '❌'}")
    print(f"  wkhtmltopdf: {'✅' if capabilities['wkhtmltopdf_available'] else '❌'}")
    print(f"  Preferred method: {capabilities['preferred_method']}")
    print(f"  Performance estimate: {capabilities['estimated_performance']}")
    print(f"  Max file size: {capabilities['max_size_mb']}MB")
    print(f"  Supported formats: {', '.join(capabilities['supported_formats'])}")


if __name__ == "__main__":
    # Run capability check first
    test_renderer_capabilities()
    
    # Run main pipeline test
    success = test_svg_generation_pipeline()
    
    exit(0 if success else 1)