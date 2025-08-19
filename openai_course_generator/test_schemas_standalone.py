#!/usr/bin/env python3
"""
Standalone test for AI Visual Pipeline schemas
Tests schemas without importing the main application
"""

import sys
import os
from pathlib import Path

# Add multimedia directory to path
multimedia_path = Path(__file__).parent / "multimedia"
sys.path.insert(0, str(multimedia_path))

# Import schemas directly
from validators.schema import (
    VisualSpec, DataSpec, DataPoint, VisualIntent, DataType, 
    CanvasInstructions, CanvasRect, CanvasText, CanvasCircle,
    GenerationResult, ValidationReport, RenderingPath
)

def test_basic_functionality():
    """Test basic schema functionality"""
    print("🧪 Testing basic schema functionality...")
    
    # Test 1: Create basic visual spec
    data_points = [DataPoint(label="Test A", value=100), DataPoint(label="Test B", value=200)]
    data_spec = DataSpec(data_type=DataType.CATEGORICAL, data_points=data_points)
    visual_spec = VisualSpec(
        scene_id="test-001",
        intent=VisualIntent.BAR_CHART,
        dataspec=data_spec,
        title="Test Chart"
    )
    
    assert visual_spec.scene_id == "test-001"
    assert visual_spec.intent == VisualIntent.BAR_CHART
    assert len(visual_spec.dataspec.data_points) == 2
    print("✅ VisualSpec creation working")
    
    # Test 2: Create canvas instructions
    elements = [
        CanvasRect(x=10, y=10, width=100, height=50, fill_color="#FF0000"),
        CanvasText(x=60, y=35, text="Test", font_size=14, color="#000000"),
        CanvasCircle(x=200, y=100, radius=25, fill_color="#00FF00")
    ]
    canvas = CanvasInstructions(
        canvas_id="test-canvas",
        width=800, height=600,
        elements=elements
    )
    
    assert canvas.canvas_id == "test-canvas"
    assert len(canvas.elements) == 3
    assert canvas.width == 800
    print("✅ CanvasInstructions creation working")

def test_validation_edge_cases():
    """Test validation edge cases"""
    print("🧪 Testing validation edge cases...")
    
    # Test 1: Empty data points should fail
    try:
        DataSpec(data_type=DataType.CATEGORICAL, data_points=[])
        assert False, "Should have failed"
    except Exception:
        print("✅ Empty data points correctly rejected")
    
    # Test 2: Invalid color should fail
    try:
        CanvasRect(x=0, y=0, width=10, height=10, fill_color="invalid-color")
        assert False, "Should have failed"
    except Exception:
        print("✅ Invalid color correctly rejected")
    
    # Test 3: Element outside bounds should fail
    try:
        elements = [CanvasRect(x=1000, y=10, width=100, height=50, fill_color="#FF0000")]
        CanvasInstructions(canvas_id="test", width=800, height=600, elements=elements)
        assert False, "Should have failed"
    except Exception:
        print("✅ Bounds validation working")
    
    # Test 4: Empty path preferences should fail
    try:
        data_points = [DataPoint(label="Test", value=100)]
        data_spec = DataSpec(data_type=DataType.CATEGORICAL, data_points=data_points)
        VisualSpec(
            scene_id="test",
            intent=VisualIntent.BAR_CHART, 
            dataspec=data_spec,
            path_preferences=[]
        )
        assert False, "Should have failed"
    except Exception:
        print("✅ Empty path preferences correctly rejected")

def test_enum_values():
    """Test enum values are correct"""
    print("🧪 Testing enum values...")
    
    assert VisualIntent.BAR_CHART == "bar_chart"
    assert VisualIntent.PROCESS_FLOW == "process_flow"
    assert DataType.CATEGORICAL == "categorical"
    assert RenderingPath.CANVAS_INSTRUCTIONS == "canvas_instructions"
    print("✅ Enum values correct")

def test_json_serialization():
    """Test JSON serialization"""
    print("🧪 Testing JSON serialization...")
    
    data_points = [DataPoint(label="Test", value=100)]
    data_spec = DataSpec(data_type=DataType.CATEGORICAL, data_points=data_points)
    visual_spec = VisualSpec(
        scene_id="json-test",
        intent=VisualIntent.PIE_CHART,
        dataspec=data_spec
    )
    
    # Test serialization
    json_str = visual_spec.model_dump_json()
    assert "json-test" in json_str
    assert "pie_chart" in json_str
    print("✅ JSON serialization working")

def test_advanced_features():
    """Test advanced schema features"""
    print("🧪 Testing advanced features...")
    
    # Test with all optional fields
    data_points = [
        DataPoint(label="Q1", value=150000, category="revenue", metadata={"quarter": 1}),
        DataPoint(label="Q2", value=180000, category="revenue", metadata={"quarter": 2})
    ]
    
    data_spec = DataSpec(
        data_type=DataType.TIME_SERIES,
        data_points=data_points,
        group_by="category",
        sort_by="value", 
        sort_order="desc",
        total_value=330000,
        min_value=150000,
        max_value=180000
    )
    
    visual_spec = VisualSpec(
        scene_id="advanced-test",
        intent=VisualIntent.LINE_CHART,
        dataspec=data_spec,
        title="Advanced Test",
        subtitle="With all features",
        employee_context={"name": "John", "role": "Analyst"},
        learning_objectives=["Learn trends", "Understand growth"],
        priority=8
    )
    
    assert visual_spec.dataspec.total_value == 330000
    assert visual_spec.employee_context["name"] == "John"
    assert len(visual_spec.learning_objectives) == 2
    assert visual_spec.priority == 8
    print("✅ Advanced features working")

def run_all_tests():
    """Run all standalone tests"""
    print("🚀 Running standalone schema validation tests...")
    print("=" * 50)
    
    test_functions = [
        test_basic_functionality,
        test_validation_edge_cases,
        test_enum_values,
        test_json_serialization,
        test_advanced_features
    ]
    
    passed = 0
    total = len(test_functions)
    
    for test_func in test_functions:
        try:
            test_func()
            passed += 1
        except Exception as e:
            print(f"❌ {test_func.__name__} failed: {e}")
    
    print("=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed ({passed/total*100:.0f}%)")
    
    if passed == total:
        print("🎉 All standalone schema tests PASSED!")
        return True
    else:
        print("❌ Some tests failed")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)