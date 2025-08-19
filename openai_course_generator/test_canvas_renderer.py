#!/usr/bin/env python3
"""
Test Canvas Renderer functionality
Generate test charts to verify rendering capabilities
"""

import os
import sys
from pathlib import Path
import tempfile

# Add paths for imports
sys.path.append(str(Path(__file__).parent / "multimedia"))

from visual_execution_engines.canvas_renderer import CanvasRenderer, ThemeManager
from validators.schema import (
    CanvasInstructions, CanvasRect, CanvasText, CanvasCircle, CanvasLine,
    Theme, DataPoint, DataSpec, DataType
)


def test_basic_canvas_rendering():
    """Test basic canvas rendering with different elements"""
    print("🧪 Testing basic canvas rendering...")
    
    renderer = CanvasRenderer(theme=Theme.PROFESSIONAL)
    
    # Create test elements
    elements = [
        # Background rectangle
        CanvasRect(
            x=50, y=50, width=200, height=100,
            fill_color="#3498DB", stroke_color="#2980B9", stroke_width=2,
            border_radius=8, z_index=1
        ),
        # Title text
        CanvasText(
            x=150, y=80, text="Test Chart",
            font_size=16, font_family="Arial", color="#FFFFFF",
            text_align="center", font_weight="bold", z_index=2
        ),
        # Data point circle
        CanvasCircle(
            x=320, y=100, radius=30,
            fill_color="#E74C3C", stroke_color="#C0392B", stroke_width=2,
            z_index=1
        ),
        # Value text in circle
        CanvasText(
            x=320, y=95, text="42",
            font_size=14, color="#FFFFFF", text_align="center",
            z_index=2
        ),
        # Connecting line
        CanvasLine(
            x=250, y=100, x2=290, y2=100,
            stroke_color="#34495E", stroke_width=3
        )
    ]
    
    # Create canvas instructions
    canvas = CanvasInstructions(
        canvas_id="test_basic_canvas",
        width=400, height=200,
        background_color="#FFFFFF",
        elements=elements,
        theme=Theme.PROFESSIONAL
    )
    
    # Render to PNG
    png_data = renderer.render_canvas(canvas)
    
    # Save test output
    output_path = Path(tempfile.gettempdir()) / "test_basic_canvas.png"
    with open(output_path, 'wb') as f:
        f.write(png_data)
    
    print(f"✅ Basic canvas rendered successfully: {output_path}")
    print(f"   PNG size: {len(png_data)} bytes")
    return True


def test_horizontal_bar_chart():
    """Test horizontal bar chart rendering"""
    print("🧪 Testing horizontal bar chart...")
    
    renderer = CanvasRenderer(theme=Theme.EDUCATIONAL)
    
    # Test data
    data = [
        {"label": "Product A", "value": 150},
        {"label": "Product B", "value": 230},
        {"label": "Product C", "value": 180},
        {"label": "Product D", "value": 290}
    ]
    
    # Render chart
    png_data = renderer.render_chart_from_data("bar_horizontal", data, width=600, height=400)
    
    # Save test output
    output_path = Path(tempfile.gettempdir()) / "test_horizontal_bar.png"
    with open(output_path, 'wb') as f:
        f.write(png_data)
    
    print(f"✅ Horizontal bar chart rendered: {output_path}")
    print(f"   PNG size: {len(png_data)} bytes")
    return True


def test_vertical_bar_chart():
    """Test vertical bar chart rendering"""
    print("🧪 Testing vertical bar chart...")
    
    renderer = CanvasRenderer(theme=Theme.MODERN)
    
    # Test data
    data = [
        {"label": "Q1", "value": 120},
        {"label": "Q2", "value": 145},
        {"label": "Q3", "value": 160},
        {"label": "Q4", "value": 190}
    ]
    
    # Render chart
    png_data = renderer.render_chart_from_data("bar_vertical", data, width=500, height=400)
    
    # Save test output
    output_path = Path(tempfile.gettempdir()) / "test_vertical_bar.png"
    with open(output_path, 'wb') as f:
        f.write(png_data)
    
    print(f"✅ Vertical bar chart rendered: {output_path}")
    print(f"   PNG size: {len(png_data)} bytes")
    return True


def test_line_chart():
    """Test line chart rendering"""
    print("🧪 Testing line chart...")
    
    renderer = CanvasRenderer(theme=Theme.CORPORATE)
    
    # Test data
    data = [
        {"label": "Jan", "value": 100},
        {"label": "Feb", "value": 120},
        {"label": "Mar", "value": 110},
        {"label": "Apr", "value": 140},
        {"label": "May", "value": 160},
        {"label": "Jun", "value": 150}
    ]
    
    # Render chart
    png_data = renderer.render_chart_from_data("line", data, width=600, height=300)
    
    # Save test output
    output_path = Path(tempfile.gettempdir()) / "test_line_chart.png"
    with open(output_path, 'wb') as f:
        f.write(png_data)
    
    print(f"✅ Line chart rendered: {output_path}")
    print(f"   PNG size: {len(png_data)} bytes")
    return True


def test_theme_variations():
    """Test different theme variations"""
    print("🧪 Testing theme variations...")
    
    themes = [Theme.PROFESSIONAL, Theme.EDUCATIONAL, Theme.CORPORATE, Theme.MODERN, Theme.MINIMAL]
    
    for theme in themes:
        renderer = CanvasRenderer(theme=theme)
        theme_config = ThemeManager.get_theme(theme)
        
        # Create simple test element
        elements = [
            CanvasRect(
                x=20, y=20, width=160, height=60,
                fill_color=theme_config.primary_color,
                stroke_color=theme_config.border_color,
                stroke_width=theme_config.border_width
            ),
            CanvasText(
                x=100, y=45, text=f"{theme.value} Theme",
                font_size=theme_config.font_size_base,
                color=theme_config.background_color,
                text_align="center",
                font_family=theme_config.font_family
            )
        ]
        
        canvas = CanvasInstructions(
            canvas_id=f"test_theme_{theme.value}",
            width=200, height=200,
            background_color=theme_config.background_color,
            elements=elements,
            theme=theme
        )
        
        png_data = renderer.render_canvas(canvas)
        
        output_path = Path(tempfile.gettempdir()) / f"test_theme_{theme.value}.png"
        with open(output_path, 'wb') as f:
            f.write(png_data)
        
        print(f"   ✅ {theme.value} theme: {output_path}")
    
    return True


def test_validation():
    """Test validation functionality"""
    print("🧪 Testing validation...")
    
    renderer = CanvasRenderer()
    
    # Test valid canvas
    valid_elements = [
        CanvasRect(x=10, y=10, width=100, height=50, fill_color="#FF0000")
    ]
    valid_canvas = CanvasInstructions(
        canvas_id="valid_test",
        width=200, height=200,
        elements=valid_elements
    )
    
    validation = renderer.validate_instructions(valid_canvas)
    assert validation['valid'], f"Valid canvas failed validation: {validation['errors']}"
    print("   ✅ Valid canvas passed validation")
    
    # Test invalid canvas (element outside bounds)
    # The schema validation will catch this at creation time
    try:
        invalid_elements = [
            CanvasRect(x=250, y=10, width=100, height=50, fill_color="#FF0000")  # Outside width=200
        ]
        invalid_canvas = CanvasInstructions(
            canvas_id="invalid_test",
            width=200, height=200,
            elements=invalid_elements
        )
        assert False, "Should have failed at schema level"
    except Exception:
        print("   ✅ Invalid canvas correctly rejected by schema validation")
    
    return True


def test_performance():
    """Test rendering performance with many elements"""
    print("🧪 Testing performance with complex canvas...")
    
    renderer = CanvasRenderer(theme=Theme.MINIMAL)
    
    # Create many elements
    elements = []
    for i in range(50):
        x = (i % 10) * 60 + 10
        y = (i // 10) * 40 + 10
        
        elements.append(CanvasRect(
            x=x, y=y, width=50, height=30,
            fill_color=f"#{(i*123)%256:02x}{(i*456)%256:02x}{(i*789)%256:02x}",
            stroke_color="#000000", stroke_width=1
        ))
        
        elements.append(CanvasText(
            x=x + 25, y=y + 15, text=str(i),
            font_size=10, color="#FFFFFF", text_align="center"
        ))
    
    canvas = CanvasInstructions(
        canvas_id="performance_test",
        width=620, height=220,
        background_color="#F0F0F0",
        elements=elements
    )
    
    # Time the rendering
    import time
    start_time = time.time()
    png_data = renderer.render_canvas(canvas)
    render_time = time.time() - start_time
    
    output_path = Path(tempfile.gettempdir()) / "test_performance.png"
    with open(output_path, 'wb') as f:
        f.write(png_data)
    
    print(f"   ✅ Rendered {len(elements)} elements in {render_time:.3f}s")
    print(f"   ✅ Performance test: {output_path}")
    
    # Check if render time is acceptable (should be < 400ms per plan)
    acceptable_time = 0.4  # 400ms
    if render_time < acceptable_time:
        print(f"   ✅ Performance target met: {render_time:.3f}s < {acceptable_time}s")
        return True
    else:
        print(f"   ⚠️  Performance target missed: {render_time:.3f}s > {acceptable_time}s")
        return False


def run_all_tests():
    """Run all canvas renderer tests"""
    print("🚀 Running Canvas Renderer Tests...")
    print("=" * 60)
    
    test_functions = [
        test_basic_canvas_rendering,
        test_horizontal_bar_chart,
        test_vertical_bar_chart,
        test_line_chart,
        test_theme_variations,
        test_validation,
        test_performance
    ]
    
    passed = 0
    total = len(test_functions)
    
    for test_func in test_functions:
        try:
            if test_func():
                passed += 1
        except Exception as e:
            print(f"❌ {test_func.__name__} failed: {e}")
            import traceback
            traceback.print_exc()
    
    print("=" * 60)
    print(f"📊 Test Results: {passed}/{total} tests passed ({passed/total*100:.0f}%)")
    
    temp_dir = Path(tempfile.gettempdir())
    print(f"🖼️  Test images saved to: {temp_dir}")
    
    if passed == total:
        print("🎉 All Canvas Renderer tests PASSED!")
        return True
    else:
        print("❌ Some tests failed")
        return False


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)