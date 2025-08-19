#!/usr/bin/env python3
"""
Canvas Renderer - Python Implementation
Executes Canvas JSON instructions to generate PNG images with theme enforcement
"""

import os
import io
import logging
from typing import Dict, Any, Optional, List, Tuple
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from dataclasses import dataclass

# Import our schemas
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from validators.schema import (
    CanvasInstructions, CanvasElement, CanvasRect, CanvasCircle, 
    CanvasText, CanvasLine, CanvasPath, Theme
)

logger = logging.getLogger(__name__)


@dataclass
class ThemeConfig:
    """Theme configuration for consistent visual styling"""
    # Color palette
    primary_color: str
    secondary_color: str
    accent_color: str
    background_color: str
    text_color: str
    border_color: str
    
    # Typography
    font_family: str
    font_size_base: int
    font_size_title: int
    font_size_small: int
    
    # Spacing and sizing
    padding: int
    margin: int
    border_width: int
    border_radius: int


class ThemeManager:
    """Manages theme configurations and enforcement"""
    
    THEMES = {
        Theme.PROFESSIONAL: ThemeConfig(
            primary_color="#2C3E50",
            secondary_color="#3498DB", 
            accent_color="#E74C3C",
            background_color="#FFFFFF",
            text_color="#2C3E50",
            border_color="#BDC3C7",
            font_family="Arial",
            font_size_base=12,
            font_size_title=16,
            font_size_small=10,
            padding=8,
            margin=12,
            border_width=1,
            border_radius=4
        ),
        Theme.EDUCATIONAL: ThemeConfig(
            primary_color="#34495E",
            secondary_color="#9B59B6",
            accent_color="#F39C12", 
            background_color="#FDFEFE",
            text_color="#2C3E50",
            border_color="#D5DBDB",
            font_family="Arial",
            font_size_base=14,
            font_size_title=18,
            font_size_small=11,
            padding=10,
            margin=15,
            border_width=2,
            border_radius=6
        ),
        Theme.CORPORATE: ThemeConfig(
            primary_color="#1B2631",
            secondary_color="#5D6D7E",
            accent_color="#D4EDDA",
            background_color="#F8F9FA",
            text_color="#1B2631",
            border_color="#AEB6BF",
            font_family="Arial",
            font_size_base=11,
            font_size_title=15,
            font_size_small=9,
            padding=6,
            margin=10,
            border_width=1,
            border_radius=2
        ),
        Theme.MODERN: ThemeConfig(
            primary_color="#212529",
            secondary_color="#6C757D",
            accent_color="#007BFF",
            background_color="#FFFFFF",
            text_color="#212529", 
            border_color="#DEE2E6",
            font_family="Arial",
            font_size_base=13,
            font_size_title=17,
            font_size_small=10,
            padding=12,
            margin=16,
            border_width=1,
            border_radius=8
        ),
        Theme.MINIMAL: ThemeConfig(
            primary_color="#000000",
            secondary_color="#666666",
            accent_color="#333333",
            background_color="#FFFFFF",
            text_color="#000000",
            border_color="#CCCCCC",
            font_family="Arial",
            font_size_base=12,
            font_size_title=16,
            font_size_small=10,
            padding=4,
            margin=8,
            border_width=1,
            border_radius=0
        )
    }
    
    @classmethod
    def get_theme(cls, theme: Theme) -> ThemeConfig:
        """Get theme configuration"""
        return cls.THEMES.get(theme, cls.THEMES[Theme.PROFESSIONAL])


class FontManager:
    """Manages font loading and caching"""
    
    def __init__(self):
        self.font_cache: Dict[Tuple[str, int], ImageFont.FreeTypeFont] = {}
        self.fallback_font = None
        self._load_fallback_font()
    
    def _load_fallback_font(self):
        """Load fallback font"""
        try:
            # Try to load a default font
            self.fallback_font = ImageFont.load_default()
        except Exception as e:
            logger.warning(f"Could not load fallback font: {e}")
            self.fallback_font = None
    
    def get_font(self, family: str, size: int) -> ImageFont.FreeTypeFont:
        """Get font with caching"""
        cache_key = (family, size)
        
        if cache_key in self.font_cache:
            return self.font_cache[cache_key]
        
        font = self._load_font(family, size)
        self.font_cache[cache_key] = font
        return font
    
    def _load_font(self, family: str, size: int) -> ImageFont.FreeTypeFont:
        """Load font from system or fallback"""
        
        # Common font paths by family name
        font_paths = {
            "Arial": [
                "/System/Library/Fonts/Arial.ttf",  # macOS
                "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",  # Linux
                "C:/Windows/Fonts/arial.ttf"  # Windows
            ],
            "Helvetica": [
                "/System/Library/Fonts/Helvetica.ttc",  # macOS
                "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",  # Linux fallback
                "C:/Windows/Fonts/arial.ttf"  # Windows fallback
            ]
        }
        
        # Try to load the requested font
        if family in font_paths:
            for font_path in font_paths[family]:
                if os.path.exists(font_path):
                    try:
                        return ImageFont.truetype(font_path, size)
                    except Exception as e:
                        logger.debug(f"Failed to load font {font_path}: {e}")
        
        # Fallback to system font
        try:
            return ImageFont.truetype("arial.ttf", size)
        except:
            try:
                return ImageFont.load_default()
            except:
                logger.warning(f"Could not load any font for {family} at size {size}")
                return self.fallback_font


class CollisionDetector:
    """Low-resolution collision detection for element placement"""
    
    def __init__(self, width: int, height: int, resolution: int = 20):
        """Initialize collision grid"""
        self.width = width
        self.height = height
        self.resolution = resolution
        self.grid_width = width // resolution + 1
        self.grid_height = height // resolution + 1
        self.grid = [[False] * self.grid_width for _ in range(self.grid_height)]
    
    def mark_occupied(self, x: float, y: float, width: float, height: float):
        """Mark area as occupied in collision grid"""
        start_x = max(0, int(x // self.resolution))
        start_y = max(0, int(y // self.resolution))
        end_x = min(self.grid_width - 1, int((x + width) // self.resolution))
        end_y = min(self.grid_height - 1, int((y + height) // self.resolution))
        
        for gy in range(start_y, end_y + 1):
            for gx in range(start_x, end_x + 1):
                self.grid[gy][gx] = True
    
    def check_collision(self, x: float, y: float, width: float, height: float) -> bool:
        """Check if area collides with existing elements"""
        start_x = max(0, int(x // self.resolution))
        start_y = max(0, int(y // self.resolution))
        end_x = min(self.grid_width - 1, int((x + width) // self.resolution))
        end_y = min(self.grid_height - 1, int((y + height) // self.resolution))
        
        for gy in range(start_y, end_y + 1):
            for gx in range(start_x, end_x + 1):
                if self.grid[gy][gx]:
                    return True
        return False


class CanvasRenderer:
    """Main Canvas renderer for converting CanvasInstructions to PNG images"""
    
    def __init__(self, theme: Theme = Theme.PROFESSIONAL):
        self.theme_config = ThemeManager.get_theme(theme)
        self.font_manager = FontManager()
        self.collision_detector: Optional[CollisionDetector] = None
        
    def render_canvas(self, instructions: CanvasInstructions) -> bytes:
        """Render canvas instructions to PNG bytes"""
        logger.info(f"Rendering canvas: {instructions.canvas_id}")
        
        # Validate instructions first
        validation = self.validate_instructions(instructions)
        if not validation['valid']:
            raise ValueError(f"Invalid canvas instructions: {validation['errors']}")
        
        # Create image and drawing context
        image = Image.new('RGB', (instructions.width, instructions.height), instructions.background_color)
        draw = ImageDraw.Draw(image)
        
        # Initialize collision detection
        self.collision_detector = CollisionDetector(instructions.width, instructions.height)
        
        # Sort elements by z_index for proper layering
        sorted_elements = sorted(instructions.elements, key=lambda e: getattr(e, 'z_index', 0))
        
        # Render each element
        for element in sorted_elements:
            try:
                self._render_element(draw, element, instructions)
            except Exception as e:
                logger.error(f"Failed to render element {type(element).__name__}: {e}")
                # Continue rendering other elements
        
        # Convert to PNG bytes
        png_bytes = io.BytesIO()
        image.save(png_bytes, format='PNG', optimize=True)
        return png_bytes.getvalue()
    
    def validate_instructions(self, instructions: CanvasInstructions) -> Dict[str, Any]:
        """Validate canvas instructions for rendering"""
        errors = []
        warnings = []
        
        # Check canvas dimensions
        if instructions.width <= 0 or instructions.height <= 0:
            errors.append("Canvas dimensions must be positive")
        
        if instructions.width > 4000 or instructions.height > 3000:
            warnings.append("Large canvas dimensions may impact performance")
        
        # Check elements
        if not instructions.elements:
            errors.append("Canvas must have at least one element")
        
        # Validate each element
        for i, element in enumerate(instructions.elements):
            element_errors = self._validate_element(element, instructions)
            for error in element_errors:
                errors.append(f"Element {i}: {error}")
        
        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings,
            'element_count': len(instructions.elements)
        }
    
    def _validate_element(self, element: CanvasElement, instructions: CanvasInstructions) -> List[str]:
        """Validate individual element"""
        errors = []
        
        # Check coordinates are within canvas
        if hasattr(element, 'x') and (element.x < 0 or element.x > instructions.width):
            errors.append(f"X coordinate {element.x} outside canvas bounds")
        
        if hasattr(element, 'y') and (element.y < 0 or element.y > instructions.height):
            errors.append(f"Y coordinate {element.y} outside canvas bounds")
        
        # Element-specific validation
        if isinstance(element, CanvasRect):
            if element.width <= 0 or element.height <= 0:
                errors.append("Rectangle dimensions must be positive")
            if element.x + element.width > instructions.width:
                errors.append("Rectangle extends beyond canvas width")
            if element.y + element.height > instructions.height:
                errors.append("Rectangle extends beyond canvas height")
        
        elif isinstance(element, CanvasCircle):
            if element.radius <= 0:
                errors.append("Circle radius must be positive")
            if element.x + element.radius > instructions.width or element.x - element.radius < 0:
                errors.append("Circle extends beyond canvas width")
            if element.y + element.radius > instructions.height or element.y - element.radius < 0:
                errors.append("Circle extends beyond canvas height")
        
        elif isinstance(element, CanvasText):
            if not element.text.strip():
                errors.append("Text content cannot be empty")
            if element.font_size <= 0:
                errors.append("Font size must be positive")
        
        return errors
    
    def _render_element(self, draw: ImageDraw.Draw, element: CanvasElement, instructions: CanvasInstructions):
        """Render individual canvas element"""
        
        if isinstance(element, CanvasRect):
            self._render_rectangle(draw, element)
        elif isinstance(element, CanvasCircle):
            self._render_circle(draw, element)
        elif isinstance(element, CanvasText):
            self._render_text(draw, element)
        elif isinstance(element, CanvasLine):
            self._render_line(draw, element)
        elif isinstance(element, CanvasPath):
            self._render_path(draw, element)
        else:
            logger.warning(f"Unknown element type: {type(element)}")
    
    def _render_rectangle(self, draw: ImageDraw.Draw, rect: CanvasRect):
        """Render rectangle element"""
        x1, y1 = rect.x, rect.y
        x2, y2 = rect.x + rect.width, rect.y + rect.height
        
        # Handle border radius
        if rect.border_radius > 0:
            # For rounded rectangles, we'll approximate with regular rectangle for now
            # Full rounded rectangle support would require more complex path drawing
            logger.debug(f"Border radius {rect.border_radius} approximated")
        
        # Draw filled rectangle
        draw.rectangle([x1, y1, x2, y2], fill=rect.fill_color)
        
        # Draw border if specified
        if rect.stroke_color and rect.stroke_width > 0:
            draw.rectangle([x1, y1, x2, y2], outline=rect.stroke_color, width=int(rect.stroke_width))
        
        # Mark collision area
        if self.collision_detector:
            self.collision_detector.mark_occupied(x1, y1, rect.width, rect.height)
    
    def _render_circle(self, draw: ImageDraw.Draw, circle: CanvasCircle):
        """Render circle element"""
        x1 = circle.x - circle.radius
        y1 = circle.y - circle.radius
        x2 = circle.x + circle.radius
        y2 = circle.y + circle.radius
        
        # Draw filled circle
        draw.ellipse([x1, y1, x2, y2], fill=circle.fill_color)
        
        # Draw border if specified
        if circle.stroke_color and circle.stroke_width > 0:
            draw.ellipse([x1, y1, x2, y2], outline=circle.stroke_color, width=int(circle.stroke_width))
        
        # Mark collision area
        if self.collision_detector:
            self.collision_detector.mark_occupied(x1, y1, circle.radius * 2, circle.radius * 2)
    
    def _render_text(self, draw: ImageDraw.Draw, text: CanvasText):
        """Render text element"""
        # Get font
        font = self.font_manager.get_font(text.font_family, text.font_size)
        
        # Calculate text dimensions for alignment
        bbox = draw.textbbox((0, 0), text.text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # Adjust position based on alignment
        x = text.x
        if text.text_align == "center":
            x = text.x - text_width // 2
        elif text.text_align == "right":
            x = text.x - text_width
        
        # Draw text
        draw.text((x, text.y), text.text, fill=text.color, font=font)
        
        # Mark collision area
        if self.collision_detector:
            self.collision_detector.mark_occupied(x, text.y, text_width, text_height)
    
    def _render_line(self, draw: ImageDraw.Draw, line: CanvasLine):
        """Render line element"""
        coords = [(line.x, line.y), (line.x2, line.y2)]
        
        # Handle dashed lines
        if line.stroke_dash:
            # PIL doesn't directly support dashed lines, so we'll draw a solid line for now
            logger.debug(f"Dashed line pattern {line.stroke_dash} rendered as solid")
        
        draw.line(coords, fill=line.stroke_color, width=int(line.stroke_width))
    
    def _render_path(self, draw: ImageDraw.Draw, path: CanvasPath):
        """Render SVG path element (basic support)"""
        # SVG path parsing is complex - for now we'll log and skip
        logger.warning(f"SVG path rendering not fully implemented: {path.path_data[:50]}...")
        # In a full implementation, this would parse the SVG path data and draw accordingly
    
    def render_chart_from_data(self, chart_type: str, data: List[Dict], **kwargs) -> bytes:
        """Render common chart types from data (convenience method)"""
        
        if chart_type == "bar_horizontal":
            return self._render_horizontal_bar_chart(data, **kwargs)
        elif chart_type == "bar_vertical":
            return self._render_vertical_bar_chart(data, **kwargs)
        elif chart_type == "line":
            return self._render_line_chart(data, **kwargs)
        else:
            raise ValueError(f"Unsupported chart type: {chart_type}")
    
    def _render_horizontal_bar_chart(self, data: List[Dict], width: int = 800, height: int = 600, **kwargs) -> bytes:
        """Render horizontal bar chart"""
        
        # Create canvas instructions
        elements = []
        
        # Calculate dimensions
        margin = self.theme_config.margin * 2
        chart_width = width - margin * 2
        chart_height = height - margin * 2
        bar_height = chart_height // len(data) - self.theme_config.padding
        
        max_value = max(item['value'] for item in data)
        
        # Create bars
        for i, item in enumerate(data):
            bar_width = (item['value'] / max_value) * chart_width * 0.7  # 70% of chart width
            y_pos = margin + i * (bar_height + self.theme_config.padding)
            
            # Bar rectangle
            elements.append(CanvasRect(
                x=margin,
                y=y_pos,
                width=bar_width,
                height=bar_height,
                fill_color=self.theme_config.secondary_color,
                stroke_color=self.theme_config.border_color,
                stroke_width=1
            ))
            
            # Label text
            elements.append(CanvasText(
                x=margin + bar_width + self.theme_config.padding,
                y=y_pos + bar_height // 2 - self.theme_config.font_size_base // 2,
                text=f"{item['label']}: {item['value']}",
                font_size=self.theme_config.font_size_base,
                color=self.theme_config.text_color,
                font_family=self.theme_config.font_family
            ))
        
        # Create canvas instructions
        canvas = CanvasInstructions(
            canvas_id="horizontal_bar_chart",
            width=width,
            height=height,
            background_color=self.theme_config.background_color,
            elements=elements
        )
        
        return self.render_canvas(canvas)
    
    def _render_vertical_bar_chart(self, data: List[Dict], width: int = 800, height: int = 600, **kwargs) -> bytes:
        """Render vertical bar chart"""
        
        elements = []
        margin = self.theme_config.margin * 2
        chart_width = width - margin * 2
        chart_height = height - margin * 2 - 40  # Space for labels
        bar_width = chart_width // len(data) - self.theme_config.padding
        
        max_value = max(item['value'] for item in data)
        
        for i, item in enumerate(data):
            bar_height = (item['value'] / max_value) * chart_height
            x_pos = margin + i * (bar_width + self.theme_config.padding)
            y_pos = margin + chart_height - bar_height
            
            # Bar rectangle
            elements.append(CanvasRect(
                x=x_pos,
                y=y_pos,
                width=bar_width,
                height=bar_height,
                fill_color=self.theme_config.secondary_color,
                stroke_color=self.theme_config.border_color,
                stroke_width=1
            ))
            
            # Label text
            elements.append(CanvasText(
                x=x_pos + bar_width // 2,
                y=margin + chart_height + 10,
                text=item['label'],
                font_size=self.theme_config.font_size_small,
                color=self.theme_config.text_color,
                font_family=self.theme_config.font_family,
                text_align="center"
            ))
        
        canvas = CanvasInstructions(
            canvas_id="vertical_bar_chart",
            width=width,
            height=height,
            background_color=self.theme_config.background_color,
            elements=elements
        )
        
        return self.render_canvas(canvas)
    
    def _render_line_chart(self, data: List[Dict], width: int = 800, height: int = 600, **kwargs) -> bytes:
        """Render line chart"""
        
        elements = []
        margin = self.theme_config.margin * 2
        chart_width = width - margin * 2
        chart_height = height - margin * 2 - 40
        
        max_value = max(item['value'] for item in data)
        min_value = min(item['value'] for item in data)
        value_range = max_value - min_value or 1
        
        # Plot points and lines
        points = []
        for i, item in enumerate(data):
            x = margin + (i / (len(data) - 1)) * chart_width
            y = margin + chart_height - ((item['value'] - min_value) / value_range) * chart_height
            points.append((x, y))
            
            # Data point circle
            elements.append(CanvasCircle(
                x=x,
                y=y,
                radius=4,
                fill_color=self.theme_config.accent_color,
                stroke_color=self.theme_config.primary_color,
                stroke_width=2
            ))
        
        # Connect points with lines
        for i in range(len(points) - 1):
            elements.append(CanvasLine(
                x=points[i][0],
                y=points[i][1],
                x2=points[i + 1][0],
                y2=points[i + 1][1],
                stroke_color=self.theme_config.primary_color,
                stroke_width=2
            ))
        
        canvas = CanvasInstructions(
            canvas_id="line_chart",
            width=width,
            height=height,
            background_color=self.theme_config.background_color,
            elements=elements
        )
        
        return self.render_canvas(canvas)


# Export main class
__all__ = ['CanvasRenderer', 'ThemeManager', 'FontManager']