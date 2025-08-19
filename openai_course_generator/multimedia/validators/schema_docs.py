#!/usr/bin/env python3
"""
JSON Schema Documentation Generator for AI Visual Pipeline
Generates comprehensive JSON schema documentation for all data contracts
"""

import json
import os
from pathlib import Path
from typing import Dict, Any
from datetime import datetime

from .schema import (
    VisualSpec, DataSpec, CanvasInstructions, GenerationResult, ValidationReport,
    CanvasRect, CanvasText, CanvasCircle, CanvasLine, CanvasPath
)


def generate_json_schemas() -> Dict[str, Any]:
    """Generate JSON schemas for all models"""
    schemas = {}
    
    # Core models
    schemas['VisualSpec'] = VisualSpec.schema()
    schemas['DataSpec'] = DataSpec.schema()
    schemas['CanvasInstructions'] = CanvasInstructions.schema()
    schemas['GenerationResult'] = GenerationResult.schema()
    schemas['ValidationReport'] = ValidationReport.schema()
    
    # Canvas elements
    schemas['CanvasRect'] = CanvasRect.schema()
    schemas['CanvasText'] = CanvasText.schema()
    schemas['CanvasCircle'] = CanvasCircle.schema()
    schemas['CanvasLine'] = CanvasLine.schema()
    schemas['CanvasPath'] = CanvasPath.schema()
    
    return schemas


def generate_example_data() -> Dict[str, Any]:
    """Generate example data for each schema"""
    examples = {}
    
    # VisualSpec example
    examples['VisualSpec'] = {
        "scene_id": "financial-revenue-chart-001",
        "intent": "bar_chart",
        "dataspec": {
            "data_type": "categorical",
            "data_points": [
                {"label": "Q1 2024", "value": 150000, "category": "revenue"},
                {"label": "Q2 2024", "value": 180000, "category": "revenue"},
                {"label": "Q3 2024", "value": 165000, "category": "revenue"},
                {"label": "Q4 2024", "value": 195000, "category": "revenue"}
            ],
            "group_by": "category",
            "sort_by": "value",
            "sort_order": "asc",
            "total_value": 690000
        },
        "title": "Quarterly Revenue Growth",
        "subtitle": "Financial performance across 2024",
        "theme": "professional",
        "constraints": {
            "max_width": 800,
            "max_height": 600,
            "min_font_size": 12,
            "max_elements": 50
        },
        "path_preferences": [
            "deterministic_registry",
            "canvas_instructions", 
            "svg_generation"
        ],
        "employee_context": {
            "name": "Sarah Johnson",
            "role": "Financial Analyst",
            "level": "intermediate"
        },
        "learning_objectives": [
            "Understand quarterly revenue trends",
            "Identify growth patterns",
            "Analyze seasonal variations"
        ],
        "priority": 7
    }
    
    # CanvasInstructions example
    examples['CanvasInstructions'] = {
        "canvas_id": "revenue-bar-chart-canvas-001",
        "width": 800,
        "height": 600,
        "background_color": "#FFFFFF",
        "theme": "professional",
        "elements": [
            {
                "type": "rect",
                "x": 100,
                "y": 100,
                "width": 80,
                "height": 150,
                "fill_color": "#3498DB",
                "stroke_color": "#2980B9",
                "stroke_width": 1,
                "border_radius": 4,
                "z_index": 1
            },
            {
                "type": "text",
                "x": 140,
                "y": 270,
                "text": "Q1 2024",
                "font_size": 12,
                "font_family": "Arial",
                "color": "#2C3E50",
                "text_align": "center",
                "font_weight": "normal",
                "z_index": 2
            },
            {
                "type": "text",
                "x": 140,
                "y": 90,
                "text": "$150K",
                "font_size": 14,
                "font_family": "Arial",
                "color": "#2C3E50",
                "text_align": "center",
                "font_weight": "bold",
                "z_index": 2
            }
        ],
        "validation_passed": true
    }
    
    # DataSpec example
    examples['DataSpec'] = {
        "data_type": "time_series",
        "data_points": [
            {"label": "Jan", "value": 1200, "metadata": {"month": 1}},
            {"label": "Feb", "value": 1350, "metadata": {"month": 2}},
            {"label": "Mar", "value": 1100, "metadata": {"month": 3}},
            {"label": "Apr", "value": 1480, "metadata": {"month": 4}}
        ],
        "sort_by": "metadata.month",
        "sort_order": "asc",
        "limit": 12,
        "total_value": 5130,
        "min_value": 1100,
        "max_value": 1480
    }
    
    # GenerationResult example
    examples['GenerationResult'] = {
        "success": true,
        "visual_spec": examples['VisualSpec'],
        "rendering_path": "canvas_instructions",
        "output_data": {
            "canvas_instructions": examples['CanvasInstructions']
        },
        "file_path": "/tmp/ai-visuals/revenue-chart-001.png",
        "content_type": "image/png",
        "generation_time_ms": 1250,
        "cache_hit": false,
        "retry_count": 0,
        "accuracy_score": 0.94,
        "visual_quality_score": 0.87,
        "model_used": "llama-3.1-8b-instant",
        "tokens_used": 342
    }
    
    # ValidationReport example
    examples['ValidationReport'] = {
        "valid": true,
        "errors": [],
        "warnings": ["Consider increasing font size for better accessibility"],
        "score": 0.92,
        "schema_valid": true,
        "security_valid": true,
        "performance_valid": true,
        "accessibility_valid": false
    }
    
    return examples


def generate_usage_guides() -> Dict[str, str]:
    """Generate usage guides for each model"""
    guides = {}
    
    guides['VisualSpec'] = """
# VisualSpec Usage Guide

VisualSpec is the primary interface for requesting visual generation in the AI Visual Pipeline.

## Basic Usage

```python
from multimedia.validators.schema import VisualSpec, DataSpec, DataPoint, VisualIntent, DataType

# Create data points
data_points = [
    DataPoint(label="Revenue", value=150000),
    DataPoint(label="Costs", value=120000),
    DataPoint(label="Profit", value=30000)
]

# Create data specification
data_spec = DataSpec(
    data_type=DataType.CATEGORICAL,
    data_points=data_points
)

# Create visual specification
visual_spec = VisualSpec(
    scene_id="financial-overview-001",
    intent=VisualIntent.BAR_CHART,
    dataspec=data_spec,
    title="Financial Overview",
    theme="professional"
)
```

## Advanced Features

### Custom Rendering Path Preferences
```python
from multimedia.validators.schema import RenderingPath

visual_spec = VisualSpec(
    scene_id="custom-001",
    intent=VisualIntent.HEATMAP,
    dataspec=data_spec,
    path_preferences=[
        RenderingPath.CANVAS_INSTRUCTIONS,
        RenderingPath.SVG_GENERATION
    ]
)
```

### Employee Context and Personalization
```python
visual_spec = VisualSpec(
    scene_id="personalized-001",
    intent=VisualIntent.PROCESS_FLOW,
    dataspec=data_spec,
    employee_context={
        "name": "John Doe",
        "role": "Manager",
        "experience_level": "senior"
    },
    learning_objectives=[
        "Understand process efficiency",
        "Identify bottlenecks"
    ]
)
```
"""
    
    guides['CanvasInstructions'] = """
# CanvasInstructions Usage Guide

CanvasInstructions define how to render visual elements programmatically.

## Basic Canvas Creation

```python
from multimedia.validators.schema import CanvasInstructions, CanvasRect, CanvasText

elements = [
    CanvasRect(
        x=50, y=50,
        width=200, height=100,
        fill_color="#3498DB",
        border_radius=8
    ),
    CanvasText(
        x=150, y=100,
        text="Sample Chart",
        font_size=16,
        color="#FFFFFF",
        text_align="center"
    )
]

canvas = CanvasInstructions(
    canvas_id="sample-canvas",
    width=800, height=600,
    elements=elements
)
```

## Element Types

### Rectangle
- `x, y`: Position coordinates
- `width, height`: Dimensions
- `fill_color`: Background color (hex)
- `stroke_color`: Border color (optional)
- `border_radius`: Rounded corners

### Text
- `text`: Content to display
- `font_size`: Text size (8-72)
- `font_family`: Font name
- `text_align`: left, center, right
- `font_weight`: normal, bold

### Line
- `x, y`: Start coordinates
- `x2, y2`: End coordinates
- `stroke_color`: Line color
- `stroke_width`: Line thickness
- `stroke_dash`: Dash pattern (optional)
"""
    
    guides['DataSpec'] = """
# DataSpec Usage Guide

DataSpec describes the data to be visualized and how it should be processed.

## Data Types

### Categorical Data
```python
data_spec = DataSpec(
    data_type=DataType.CATEGORICAL,
    data_points=[
        DataPoint(label="Product A", value=100),
        DataPoint(label="Product B", value=150),
        DataPoint(label="Product C", value=80)
    ]
)
```

### Time Series Data
```python
data_spec = DataSpec(
    data_type=DataType.TIME_SERIES,
    data_points=[
        DataPoint(label="2024-01", value=1200, metadata={"timestamp": "2024-01-01"}),
        DataPoint(label="2024-02", value=1350, metadata={"timestamp": "2024-02-01"})
    ],
    sort_by="metadata.timestamp"
)
```

### Numerical Data with Statistics
```python
data_spec = DataSpec(
    data_type=DataType.NUMERICAL,
    data_points=data_points,
    total_value=sum(dp.value for dp in data_points),
    min_value=min(dp.value for dp in data_points),
    max_value=max(dp.value for dp in data_points)
)
```
"""
    
    return guides


def save_documentation(output_dir: str = None):
    """Save all documentation to files"""
    if output_dir is None:
        output_dir = Path(__file__).parent / "docs"
    
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Generate all documentation
    schemas = generate_json_schemas()
    examples = generate_example_data()
    guides = generate_usage_guides()
    
    # Save JSON schemas
    schemas_path = output_path / "schemas.json"
    with open(schemas_path, 'w') as f:
        json.dump(schemas, f, indent=2, default=str)
    
    # Save examples
    examples_path = output_path / "examples.json"
    with open(examples_path, 'w') as f:
        json.dump(examples, f, indent=2, default=str)
    
    # Save usage guides
    for model_name, guide_content in guides.items():
        guide_path = output_path / f"{model_name}_guide.md"
        with open(guide_path, 'w') as f:
            f.write(guide_content)
    
    # Create comprehensive README
    readme_content = f"""
# AI Visual Pipeline Schema Documentation

This directory contains comprehensive documentation for all data contracts in the AI Visual Pipeline.

## Files

- `schemas.json` - Complete JSON schemas for all models
- `examples.json` - Example data for each schema
- `*_guide.md` - Usage guides for each model

## Quick Reference

### Core Models
- **VisualSpec**: Main interface for requesting visual generation
- **DataSpec**: Describes data to be visualized
- **CanvasInstructions**: Programmatic rendering instructions
- **GenerationResult**: Results from visual generation process
- **ValidationReport**: Validation results and quality metrics

### Canvas Elements
- **CanvasRect**: Rectangle shapes
- **CanvasText**: Text elements
- **CanvasCircle**: Circle shapes
- **CanvasLine**: Line elements
- **CanvasPath**: SVG path elements

## Usage

```python
from multimedia.validators.schema import VisualSpec, DataSpec, DataPoint

# Create a simple visual specification
visual_spec = VisualSpec(
    scene_id="example-001",
    intent="bar_chart",
    dataspec=DataSpec(
        data_type="categorical",
        data_points=[DataPoint(label="A", value=100)]
    )
)
```

Generated on: {str(datetime.now())}
"""
    
    readme_path = output_path / "README.md" 
    with open(readme_path, 'w') as f:
        f.write(readme_content)
    
    print(f"✅ Documentation saved to {output_path}")
    print(f"   - JSON schemas: {schemas_path}")
    print(f"   - Examples: {examples_path}")
    print(f"   - Usage guides: {len(guides)} files")
    print(f"   - README: {readme_path}")


if __name__ == "__main__":
    save_documentation()