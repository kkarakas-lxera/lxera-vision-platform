#!/usr/bin/env python3
"""
Core Pydantic schemas for AI Visual Pipeline validation
Defines all data contracts for visual generation, canvas instructions, and processing
"""

from enum import Enum
from typing import Dict, List, Optional, Union, Any, Literal
from pydantic import BaseModel, Field, field_validator, model_validator
from datetime import datetime


class VisualIntent(str, Enum):
    """Supported visual intent types for deterministic registry"""
    # Flow and Process Visuals
    PROCESS_FLOW = "process_flow"
    WORKFLOW = "workflow"  
    DECISION_TREE = "decision_tree"
    FUNNEL = "funnel"
    
    # Data and Analytics
    BAR_CHART = "bar_chart"
    LINE_CHART = "line_chart"
    PIE_CHART = "pie_chart"
    SCATTER_PLOT = "scatter_plot"
    HEATMAP = "heatmap"
    WATERFALL = "waterfall"
    
    # Structural and Organizational
    MATRIX = "matrix"
    TIMELINE = "timeline"
    HIERARCHY = "hierarchy"
    COMPARISON_TABLE = "comparison_table"
    
    # Strategic and Business
    FRAMEWORK = "framework"
    QUADRANT = "quadrant"
    PYRAMID = "pyramid"
    
    # Fallback for AI generation
    CUSTOM_DIAGRAM = "custom_diagram"
    AI_GENERATED = "ai_generated"


class DataType(str, Enum):
    """Data types for visual generation"""
    CATEGORICAL = "categorical"
    NUMERICAL = "numerical"
    TIME_SERIES = "time_series"
    HIERARCHICAL = "hierarchical"
    RELATIONAL = "relational"
    TEXT = "text"


class RenderingPath(str, Enum):
    """Available rendering paths in decision tree"""
    DETERMINISTIC_REGISTRY = "deterministic_registry"
    CANVAS_INSTRUCTIONS = "canvas_instructions"
    SVG_GENERATION = "svg_generation"
    CODE_EXECUTION = "code_execution"
    FALLBACK = "fallback"


class Theme(str, Enum):
    """Visual themes for consistency"""
    PROFESSIONAL = "professional"
    EDUCATIONAL = "educational" 
    CORPORATE = "corporate"
    MODERN = "modern"
    MINIMAL = "minimal"


class DataPoint(BaseModel):
    """Individual data point for visualizations"""
    label: str = Field(..., description="Label for this data point")
    value: Union[float, int, str] = Field(..., description="Value for this data point")
    category: Optional[str] = Field(None, description="Category grouping")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata")


class DataSpec(BaseModel):
    """Data specification for visual generation"""
    data_type: DataType = Field(..., description="Type of data being visualized")
    data_points: List[DataPoint] = Field(..., min_items=1, description="Data points to visualize")
    
    # Aggregation and grouping
    group_by: Optional[str] = Field(None, description="Field to group data by")
    sort_by: Optional[str] = Field(None, description="Field to sort data by")
    sort_order: Literal["asc", "desc"] = Field("asc", description="Sort order")
    
    # Filtering and limits
    limit: Optional[int] = Field(None, ge=1, le=100, description="Maximum number of data points")
    filters: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Data filters")
    
    # Statistical info
    total_value: Optional[float] = Field(None, description="Total value for percentage calculations")
    min_value: Optional[float] = Field(None, description="Minimum value in dataset")
    max_value: Optional[float] = Field(None, description="Maximum value in dataset")
    
    @field_validator('data_points')
    @classmethod
    def validate_data_points(cls, v):
        """Validate data points are not empty"""
        if not v:
            raise ValueError("At least one data point is required")
        return v


class Constraints(BaseModel):
    """Constraints for visual generation"""
    max_width: int = Field(800, ge=200, le=2000, description="Maximum width in pixels")
    max_height: int = Field(600, ge=200, le=1500, description="Maximum height in pixels")
    min_font_size: int = Field(10, ge=8, le=20, description="Minimum font size")
    max_elements: int = Field(50, ge=5, le=200, description="Maximum visual elements")
    
    # Performance constraints
    render_timeout_ms: int = Field(5000, ge=1000, le=30000, description="Render timeout in milliseconds")
    memory_limit_mb: int = Field(256, ge=64, le=1024, description="Memory limit in MB")
    
    # Content constraints
    max_text_length: int = Field(500, ge=10, le=2000, description="Maximum text length per element")
    allow_animations: bool = Field(True, description="Allow animated elements")
    require_accessibility: bool = Field(True, description="Require accessibility features")


class VisualSpec(BaseModel):
    """Complete visual specification for AI pipeline"""
    scene_id: str = Field(..., description="Unique scene identifier")
    intent: VisualIntent = Field(..., description="Visual type intent")
    dataspec: DataSpec = Field(..., description="Data specification")
    
    # Generation preferences
    title: Optional[str] = Field(None, max_length=100, description="Visual title")
    subtitle: Optional[str] = Field(None, max_length=200, description="Visual subtitle")
    theme: Theme = Field(Theme.PROFESSIONAL, description="Visual theme")
    constraints: Constraints = Field(default_factory=Constraints, description="Generation constraints")
    
    # Rendering path preferences (ordered by priority)
    path_preferences: List[RenderingPath] = Field(
        default=[
            RenderingPath.DETERMINISTIC_REGISTRY,
            RenderingPath.CANVAS_INSTRUCTIONS, 
            RenderingPath.SVG_GENERATION,
            RenderingPath.CODE_EXECUTION
        ],
        description="Ordered list of preferred rendering paths"
    )
    
    # Context and personalization
    employee_context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Employee context for personalization")
    learning_objectives: Optional[List[str]] = Field(default_factory=list, description="Learning objectives this visual supports")
    
    # Cache and performance
    cache_key: Optional[str] = Field(None, description="Cache key for this visual spec")
    priority: int = Field(5, ge=1, le=10, description="Generation priority (1=low, 10=urgent)")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.now, description="Creation timestamp")
    content_hash: Optional[str] = Field(None, description="Hash of content for caching")
    
    @field_validator('path_preferences')
    @classmethod
    def validate_path_preferences(cls, v):
        """Ensure at least one rendering path is specified"""
        if not v:
            raise ValueError("At least one rendering path must be specified")
        return v


# Canvas Instructions Schema
class CanvasElement(BaseModel):
    """Base canvas element"""
    type: str = Field(..., description="Element type")
    x: float = Field(..., ge=0, description="X coordinate")
    y: float = Field(..., ge=0, description="Y coordinate")
    z_index: int = Field(0, description="Z-index for layering")


class CanvasRect(CanvasElement):
    """Rectangle element"""
    type: Literal["rect"] = "rect"
    width: float = Field(..., gt=0, description="Rectangle width")
    height: float = Field(..., gt=0, description="Rectangle height")
    fill_color: str = Field("#000000", pattern=r"^#[0-9A-Fa-f]{6}$", description="Fill color (hex)")
    stroke_color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$", description="Stroke color (hex)")
    stroke_width: float = Field(0, ge=0, description="Stroke width")
    border_radius: float = Field(0, ge=0, description="Border radius")


class CanvasCircle(CanvasElement):
    """Circle element"""
    type: Literal["circle"] = "circle"
    radius: float = Field(..., gt=0, description="Circle radius")
    fill_color: str = Field("#000000", pattern=r"^#[0-9A-Fa-f]{6}$", description="Fill color (hex)")
    stroke_color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$", description="Stroke color (hex)")
    stroke_width: float = Field(0, ge=0, description="Stroke width")


class CanvasText(CanvasElement):
    """Text element"""
    type: Literal["text"] = "text"
    text: str = Field(..., max_length=500, description="Text content")
    font_size: int = Field(12, ge=8, le=72, description="Font size")
    font_family: str = Field("Arial", description="Font family")
    color: str = Field("#000000", pattern=r"^#[0-9A-Fa-f]{6}$", description="Text color (hex)")
    text_align: Literal["left", "center", "right"] = Field("left", description="Text alignment")
    font_weight: Literal["normal", "bold"] = Field("normal", description="Font weight")


class CanvasLine(CanvasElement):
    """Line element"""
    type: Literal["line"] = "line"
    x2: float = Field(..., description="End X coordinate")
    y2: float = Field(..., description="End Y coordinate")
    stroke_color: str = Field("#000000", pattern=r"^#[0-9A-Fa-f]{6}$", description="Line color (hex)")
    stroke_width: float = Field(1, gt=0, description="Line width")
    stroke_dash: Optional[List[float]] = Field(None, description="Dash pattern")


class CanvasPath(CanvasElement):
    """SVG Path element"""
    type: Literal["path"] = "path"
    path_data: str = Field(..., description="SVG path data")
    fill_color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$", description="Fill color (hex)")
    stroke_color: str = Field("#000000", pattern=r"^#[0-9A-Fa-f]{6}$", description="Stroke color (hex)")
    stroke_width: float = Field(1, ge=0, description="Stroke width")


# Union type for all canvas elements
CanvasElementUnion = Union[CanvasRect, CanvasCircle, CanvasText, CanvasLine, CanvasPath]


class CanvasInstructions(BaseModel):
    """Complete canvas rendering instructions"""
    canvas_id: str = Field(..., description="Unique canvas identifier")
    width: int = Field(..., ge=200, le=2000, description="Canvas width")
    height: int = Field(..., ge=200, le=1500, description="Canvas height")
    background_color: str = Field("#FFFFFF", pattern=r"^#[0-9A-Fa-f]{6}$", description="Background color (hex)")
    
    # Elements to render
    elements: List[CanvasElementUnion] = Field(..., min_items=1, description="Canvas elements to render")
    
    # Metadata
    theme: Theme = Field(Theme.PROFESSIONAL, description="Visual theme applied")
    generated_at: datetime = Field(default_factory=datetime.now, description="Generation timestamp")
    estimated_render_time_ms: Optional[int] = Field(None, description="Estimated render time")
    
    # Validation info
    validation_passed: bool = Field(False, description="Whether validation passed")
    validation_errors: List[str] = Field(default_factory=list, description="Validation error messages")
    
    @field_validator('elements')
    @classmethod
    def validate_elements_not_empty(cls, v):
        """Ensure at least one element exists"""
        if not v:
            raise ValueError("At least one canvas element is required")
        return v
    
    @model_validator(mode='after')
    def validate_elements_within_bounds(self):
        """Validate all elements are within canvas bounds"""
        for element in self.elements:
            if hasattr(element, 'x') and element.x > self.width:
                raise ValueError(f"Element x coordinate {element.x} exceeds canvas width {self.width}")
            if hasattr(element, 'y') and element.y > self.height:
                raise ValueError(f"Element y coordinate {element.y} exceeds canvas height {self.height}")
        
        return self


# Generation Results
class GenerationResult(BaseModel):
    """Result from visual generation process"""
    success: bool = Field(..., description="Whether generation succeeded")
    visual_spec: VisualSpec = Field(..., description="Original visual specification")
    rendering_path: RenderingPath = Field(..., description="Path used for rendering")
    
    # Output
    output_data: Optional[Union[Dict[str, Any], str, bytes]] = Field(None, description="Generated output")
    file_path: Optional[str] = Field(None, description="Path to generated file")
    content_type: Optional[str] = Field(None, description="MIME type of generated content")
    
    # Performance metrics
    generation_time_ms: int = Field(..., ge=0, description="Generation time in milliseconds")
    cache_hit: bool = Field(False, description="Whether result came from cache")
    retry_count: int = Field(0, ge=0, description="Number of retries needed")
    
    # Quality metrics
    accuracy_score: Optional[float] = Field(None, ge=0, le=1, description="Accuracy score (0-1)")
    visual_quality_score: Optional[float] = Field(None, ge=0, le=1, description="Visual quality score (0-1)")
    
    # Error info
    error_message: Optional[str] = Field(None, description="Error message if generation failed")
    error_code: Optional[str] = Field(None, description="Error code for debugging")
    fallback_used: bool = Field(False, description="Whether fallback was used")
    
    # Metadata
    generated_at: datetime = Field(default_factory=datetime.now, description="Generation timestamp")
    model_used: Optional[str] = Field(None, description="AI model used for generation")
    tokens_used: Optional[int] = Field(None, description="Tokens consumed")


class ValidationReport(BaseModel):
    """Validation report for generated content"""
    valid: bool = Field(..., description="Whether content is valid")
    errors: List[str] = Field(default_factory=list, description="Validation errors")
    warnings: List[str] = Field(default_factory=list, description="Validation warnings")
    score: float = Field(0, ge=0, le=1, description="Validation score (0-1)")
    
    # Specific checks
    schema_valid: bool = Field(False, description="Schema validation passed")
    security_valid: bool = Field(False, description="Security validation passed")
    performance_valid: bool = Field(False, description="Performance validation passed")
    accessibility_valid: bool = Field(False, description="Accessibility validation passed")
    
    validated_at: datetime = Field(default_factory=datetime.now, description="Validation timestamp")


# Export all models
__all__ = [
    "VisualIntent",
    "DataType", 
    "RenderingPath",
    "Theme",
    "DataPoint",
    "DataSpec",
    "Constraints",
    "VisualSpec",
    "CanvasElement",
    "CanvasRect",
    "CanvasCircle", 
    "CanvasText",
    "CanvasLine",
    "CanvasPath",
    "CanvasElementUnion",
    "CanvasInstructions",
    "GenerationResult",
    "ValidationReport"
]