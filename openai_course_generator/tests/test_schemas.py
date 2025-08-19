#!/usr/bin/env python3
"""
Test suite for AI Visual Pipeline schemas
Comprehensive validation tests for all Pydantic models
"""

import pytest
import json
from datetime import datetime
from typing import Dict, Any

# Import the schemas
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from multimedia.validators.schema import (
    VisualIntent, DataType, RenderingPath, Theme,
    DataPoint, DataSpec, Constraints, VisualSpec,
    CanvasRect, CanvasCircle, CanvasText, CanvasLine, CanvasPath,
    CanvasInstructions, GenerationResult, ValidationReport
)


class TestDataPoint:
    """Test DataPoint model"""
    
    def test_valid_data_point(self):
        """Test valid data point creation"""
        dp = DataPoint(
            label="Revenue",
            value=100000,
            category="Financial",
            metadata={"quarter": "Q1"}
        )
        assert dp.label == "Revenue"
        assert dp.value == 100000
        assert dp.category == "Financial"
        assert dp.metadata["quarter"] == "Q1"
    
    def test_data_point_string_value(self):
        """Test data point with string value"""
        dp = DataPoint(label="Status", value="Active")
        assert dp.value == "Active"
    
    def test_data_point_float_value(self):
        """Test data point with float value"""
        dp = DataPoint(label="Score", value=85.5)
        assert dp.value == 85.5
    
    def test_data_point_minimal(self):
        """Test minimal data point without optional fields"""
        dp = DataPoint(label="Test", value=42)
        assert dp.category is None
        assert dp.metadata == {}


class TestDataSpec:
    """Test DataSpec model"""
    
    def test_valid_data_spec(self):
        """Test valid data spec creation"""
        data_points = [
            DataPoint(label="A", value=10),
            DataPoint(label="B", value=20),
            DataPoint(label="C", value=30)
        ]
        
        ds = DataSpec(
            data_type=DataType.CATEGORICAL,
            data_points=data_points,
            group_by="category",
            sort_by="value",
            sort_order="desc",
            limit=50
        )
        
        assert ds.data_type == DataType.CATEGORICAL
        assert len(ds.data_points) == 3
        assert ds.group_by == "category"
        assert ds.sort_order == "desc"
        assert ds.limit == 50
    
    def test_data_spec_empty_points_fails(self):
        """Test that empty data points list fails validation"""
        with pytest.raises(ValueError, match="At least one data point is required"):
            DataSpec(data_type=DataType.NUMERICAL, data_points=[])
    
    def test_data_spec_statistical_info(self):
        """Test data spec with statistical information"""
        data_points = [DataPoint(label="Test", value=100)]
        
        ds = DataSpec(
            data_type=DataType.NUMERICAL,
            data_points=data_points,
            total_value=500,
            min_value=0,
            max_value=100
        )
        
        assert ds.total_value == 500
        assert ds.min_value == 0
        assert ds.max_value == 100
    
    def test_data_spec_limit_validation(self):
        """Test data spec limit validation"""
        data_points = [DataPoint(label="Test", value=100)]
        
        # Valid limit
        ds = DataSpec(data_type=DataType.NUMERICAL, data_points=data_points, limit=50)
        assert ds.limit == 50
        
        # Invalid limits should raise validation error
        with pytest.raises(ValueError):
            DataSpec(data_type=DataType.NUMERICAL, data_points=data_points, limit=0)
        
        with pytest.raises(ValueError):
            DataSpec(data_type=DataType.NUMERICAL, data_points=data_points, limit=101)


class TestConstraints:
    """Test Constraints model"""
    
    def test_default_constraints(self):
        """Test default constraint values"""
        c = Constraints()
        assert c.max_width == 800
        assert c.max_height == 600
        assert c.min_font_size == 10
        assert c.max_elements == 50
        assert c.render_timeout_ms == 5000
        assert c.memory_limit_mb == 256
        assert c.allow_animations is True
        assert c.require_accessibility is True
    
    def test_custom_constraints(self):
        """Test custom constraint values"""
        c = Constraints(
            max_width=1200,
            max_height=800,
            min_font_size=12,
            render_timeout_ms=10000,
            allow_animations=False
        )
        assert c.max_width == 1200
        assert c.max_height == 800
        assert c.min_font_size == 12
        assert c.render_timeout_ms == 10000
        assert c.allow_animations is False
    
    def test_constraint_validation(self):
        """Test constraint value validation"""
        # Valid constraints
        c = Constraints(max_width=400, max_height=300)
        assert c.max_width == 400
        
        # Invalid constraints should raise validation error
        with pytest.raises(ValueError):
            Constraints(max_width=100)  # Below minimum
        
        with pytest.raises(ValueError):
            Constraints(max_height=2000)  # Above maximum


class TestVisualSpec:
    """Test VisualSpec model"""
    
    def get_valid_visual_spec(self) -> VisualSpec:
        """Get a valid visual spec for testing"""
        data_points = [DataPoint(label="Test", value=100)]
        data_spec = DataSpec(data_type=DataType.NUMERICAL, data_points=data_points)
        
        return VisualSpec(
            scene_id="test-scene-001",
            intent=VisualIntent.BAR_CHART,
            dataspec=data_spec,
            title="Test Chart",
            theme=Theme.PROFESSIONAL
        )
    
    def test_valid_visual_spec(self):
        """Test valid visual spec creation"""
        vs = self.get_valid_visual_spec()
        
        assert vs.scene_id == "test-scene-001"
        assert vs.intent == VisualIntent.BAR_CHART
        assert vs.title == "Test Chart"
        assert vs.theme == Theme.PROFESSIONAL
        assert len(vs.path_preferences) == 4
        assert vs.path_preferences[0] == RenderingPath.DETERMINISTIC_REGISTRY
    
    def test_visual_spec_default_path_preferences(self):
        """Test default path preferences order"""
        vs = self.get_valid_visual_spec()
        
        expected_order = [
            RenderingPath.DETERMINISTIC_REGISTRY,
            RenderingPath.CANVAS_INSTRUCTIONS,
            RenderingPath.SVG_GENERATION,
            RenderingPath.CODE_EXECUTION
        ]
        
        assert vs.path_preferences == expected_order
    
    def test_visual_spec_custom_path_preferences(self):
        """Test custom path preferences"""
        data_points = [DataPoint(label="Test", value=100)]
        data_spec = DataSpec(data_type=DataType.NUMERICAL, data_points=data_points)
        
        custom_paths = [RenderingPath.CANVAS_INSTRUCTIONS, RenderingPath.SVG_GENERATION]
        
        vs = VisualSpec(
            scene_id="test-custom",
            intent=VisualIntent.PIE_CHART,
            dataspec=data_spec,
            path_preferences=custom_paths
        )
        
        assert vs.path_preferences == custom_paths
    
    def test_visual_spec_empty_path_preferences_fails(self):
        """Test that empty path preferences fails validation"""
        data_points = [DataPoint(label="Test", value=100)]
        data_spec = DataSpec(data_type=DataType.NUMERICAL, data_points=data_points)
        
        with pytest.raises(ValueError, match="At least one rendering path must be specified"):
            VisualSpec(
                scene_id="test-fail",
                intent=VisualIntent.BAR_CHART,
                dataspec=data_spec,
                path_preferences=[]
            )
    
    def test_visual_spec_with_context(self):
        """Test visual spec with employee context and learning objectives"""
        vs = self.get_valid_visual_spec()
        vs.employee_context = {"name": "John Doe", "role": "Analyst"}
        vs.learning_objectives = ["Understand data trends", "Identify patterns"]
        
        assert vs.employee_context["name"] == "John Doe"
        assert len(vs.learning_objectives) == 2


class TestCanvasElements:
    """Test Canvas element models"""
    
    def test_canvas_rect(self):
        """Test canvas rectangle element"""
        rect = CanvasRect(
            x=10, y=20, width=100, height=50,
            fill_color="#FF0000", stroke_color="#000000",
            stroke_width=2, border_radius=5
        )
        
        assert rect.type == "rect"
        assert rect.x == 10
        assert rect.y == 20
        assert rect.width == 100
        assert rect.height == 50
        assert rect.fill_color == "#FF0000"
        assert rect.stroke_color == "#000000"
        assert rect.border_radius == 5
    
    def test_canvas_circle(self):
        """Test canvas circle element"""
        circle = CanvasCircle(
            x=50, y=50, radius=25,
            fill_color="#00FF00", stroke_width=1
        )
        
        assert circle.type == "circle"
        assert circle.radius == 25
        assert circle.fill_color == "#00FF00"
    
    def test_canvas_text(self):
        """Test canvas text element"""
        text = CanvasText(
            x=0, y=0, text="Hello World",
            font_size=16, font_family="Arial",
            color="#333333", text_align="center",
            font_weight="bold"
        )
        
        assert text.type == "text"
        assert text.text == "Hello World"
        assert text.font_size == 16
        assert text.text_align == "center"
        assert text.font_weight == "bold"
    
    def test_canvas_line(self):
        """Test canvas line element"""
        line = CanvasLine(
            x=0, y=0, x2=100, y2=100,
            stroke_color="#0000FF", stroke_width=2,
            stroke_dash=[5, 5]
        )
        
        assert line.type == "line"
        assert line.x2 == 100
        assert line.y2 == 100
        assert line.stroke_dash == [5, 5]
    
    def test_canvas_path(self):
        """Test canvas path element"""
        path = CanvasPath(
            x=0, y=0, path_data="M10,10 L50,50 L10,90 Z",
            fill_color="#FFFF00", stroke_color="#FF0000"
        )
        
        assert path.type == "path"
        assert path.path_data == "M10,10 L50,50 L10,90 Z"
        assert path.fill_color == "#FFFF00"
    
    def test_invalid_color_formats(self):
        """Test that invalid color formats fail validation"""
        with pytest.raises(ValueError):
            CanvasRect(x=0, y=0, width=10, height=10, fill_color="red")  # Not hex
        
        with pytest.raises(ValueError):
            CanvasRect(x=0, y=0, width=10, height=10, fill_color="#FF")  # Too short
        
        with pytest.raises(ValueError):
            CanvasText(x=0, y=0, text="Test", color="#GGGGGG")  # Invalid hex


class TestCanvasInstructions:
    """Test CanvasInstructions model"""
    
    def get_valid_canvas_instructions(self) -> CanvasInstructions:
        """Get valid canvas instructions for testing"""
        elements = [
            CanvasRect(x=10, y=10, width=100, height=50, fill_color="#FF0000"),
            CanvasText(x=60, y=35, text="Test", font_size=14, color="#000000")
        ]
        
        return CanvasInstructions(
            canvas_id="test-canvas-001",
            width=800, height=600,
            background_color="#FFFFFF",
            elements=elements,
            theme=Theme.PROFESSIONAL
        )
    
    def test_valid_canvas_instructions(self):
        """Test valid canvas instructions creation"""
        ci = self.get_valid_canvas_instructions()
        
        assert ci.canvas_id == "test-canvas-001"
        assert ci.width == 800
        assert ci.height == 600
        assert ci.background_color == "#FFFFFF"
        assert len(ci.elements) == 2
        assert ci.theme == Theme.PROFESSIONAL
        assert ci.validation_passed is False  # Default
    
    def test_canvas_instructions_empty_elements_fails(self):
        """Test that empty elements list fails validation"""
        with pytest.raises(ValueError, match="At least one canvas element is required"):
            CanvasInstructions(
                canvas_id="test-fail",
                width=800, height=600,
                elements=[]
            )
    
    def test_canvas_instructions_bounds_validation(self):
        """Test element bounds validation"""
        # Element within bounds - should pass
        elements = [CanvasRect(x=10, y=10, width=100, height=50, fill_color="#FF0000")]
        ci = CanvasInstructions(
            canvas_id="test-bounds",
            width=800, height=600,
            elements=elements
        )
        assert ci.width == 800
        
        # Element outside bounds - should fail
        with pytest.raises(ValueError, match="exceeds canvas width"):
            elements = [CanvasRect(x=900, y=10, width=100, height=50, fill_color="#FF0000")]
            CanvasInstructions(
                canvas_id="test-fail",
                width=800, height=600,
                elements=elements
            )


class TestGenerationResult:
    """Test GenerationResult model"""
    
    def test_successful_generation_result(self):
        """Test successful generation result"""
        data_points = [DataPoint(label="Test", value=100)]
        data_spec = DataSpec(data_type=DataType.NUMERICAL, data_points=data_points)
        visual_spec = VisualSpec(
            scene_id="test", intent=VisualIntent.BAR_CHART, dataspec=data_spec
        )
        
        result = GenerationResult(
            success=True,
            visual_spec=visual_spec,
            rendering_path=RenderingPath.CANVAS_INSTRUCTIONS,
            output_data={"type": "canvas", "data": "..."},
            file_path="/tmp/output.png",
            content_type="image/png",
            generation_time_ms=1500,
            cache_hit=False,
            accuracy_score=0.95
        )
        
        assert result.success is True
        assert result.rendering_path == RenderingPath.CANVAS_INSTRUCTIONS
        assert result.generation_time_ms == 1500
        assert result.accuracy_score == 0.95
        assert result.cache_hit is False
    
    def test_failed_generation_result(self):
        """Test failed generation result"""
        data_points = [DataPoint(label="Test", value=100)]
        data_spec = DataSpec(data_type=DataType.NUMERICAL, data_points=data_points)
        visual_spec = VisualSpec(
            scene_id="test", intent=VisualIntent.BAR_CHART, dataspec=data_spec
        )
        
        result = GenerationResult(
            success=False,
            visual_spec=visual_spec,
            rendering_path=RenderingPath.FALLBACK,
            generation_time_ms=500,
            error_message="Rendering failed",
            error_code="RENDER_ERROR",
            fallback_used=True
        )
        
        assert result.success is False
        assert result.error_message == "Rendering failed"
        assert result.fallback_used is True


class TestValidationReport:
    """Test ValidationReport model"""
    
    def test_valid_validation_report(self):
        """Test validation report creation"""
        report = ValidationReport(
            valid=True,
            errors=[],
            warnings=["Minor formatting issue"],
            score=0.85,
            schema_valid=True,
            security_valid=True,
            performance_valid=True,
            accessibility_valid=False
        )
        
        assert report.valid is True
        assert len(report.errors) == 0
        assert len(report.warnings) == 1
        assert report.score == 0.85
        assert report.accessibility_valid is False
    
    def test_invalid_validation_report(self):
        """Test invalid validation report"""
        report = ValidationReport(
            valid=False,
            errors=["Schema validation failed", "Security check failed"],
            score=0.2,
            schema_valid=False,
            security_valid=False
        )
        
        assert report.valid is False
        assert len(report.errors) == 2
        assert report.score == 0.2


class TestEnumValidation:
    """Test enum validation"""
    
    def test_visual_intent_enum(self):
        """Test VisualIntent enum values"""
        assert VisualIntent.BAR_CHART == "bar_chart"
        assert VisualIntent.PROCESS_FLOW == "process_flow"
        assert VisualIntent.AI_GENERATED == "ai_generated"
    
    def test_data_type_enum(self):
        """Test DataType enum values"""
        assert DataType.CATEGORICAL == "categorical"
        assert DataType.TIME_SERIES == "time_series"
        assert DataType.HIERARCHICAL == "hierarchical"
    
    def test_rendering_path_enum(self):
        """Test RenderingPath enum values"""
        assert RenderingPath.DETERMINISTIC_REGISTRY == "deterministic_registry"
        assert RenderingPath.CANVAS_INSTRUCTIONS == "canvas_instructions"
        assert RenderingPath.CODE_EXECUTION == "code_execution"
    
    def test_theme_enum(self):
        """Test Theme enum values"""
        assert Theme.PROFESSIONAL == "professional"
        assert Theme.EDUCATIONAL == "educational"
        assert Theme.MINIMAL == "minimal"


class TestJSONSerialization:
    """Test JSON serialization/deserialization"""
    
    def test_visual_spec_json_serialization(self):
        """Test VisualSpec JSON serialization"""
        data_points = [DataPoint(label="Test", value=100)]
        data_spec = DataSpec(data_type=DataType.NUMERICAL, data_points=data_points)
        visual_spec = VisualSpec(
            scene_id="test", intent=VisualIntent.BAR_CHART, dataspec=data_spec
        )
        
        # Serialize to JSON
        json_data = visual_spec.json()
        assert isinstance(json_data, str)
        
        # Deserialize from JSON
        parsed_data = json.loads(json_data)
        reconstructed = VisualSpec(**parsed_data)
        
        assert reconstructed.scene_id == visual_spec.scene_id
        assert reconstructed.intent == visual_spec.intent
    
    def test_canvas_instructions_json_serialization(self):
        """Test CanvasInstructions JSON serialization"""
        elements = [
            CanvasRect(x=10, y=10, width=100, height=50, fill_color="#FF0000"),
            CanvasText(x=60, y=35, text="Test", font_size=14, color="#000000")
        ]
        
        ci = CanvasInstructions(
            canvas_id="test", width=800, height=600, elements=elements
        )
        
        # Serialize to JSON
        json_data = ci.json()
        parsed_data = json.loads(json_data)
        reconstructed = CanvasInstructions(**parsed_data)
        
        assert reconstructed.canvas_id == ci.canvas_id
        assert len(reconstructed.elements) == len(ci.elements)


if __name__ == "__main__":
    # Run tests with pytest
    pytest.main([__file__, "-v"])