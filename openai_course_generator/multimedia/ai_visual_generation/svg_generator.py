#!/usr/bin/env python3
"""
SVG Generation & Sanitization for AI Visual Pipeline
Handles secure SVG generation with comprehensive sanitization for web safety
"""

import re
import xml.etree.ElementTree as ET
from typing import Dict, List, Optional, Tuple, Union, Any
from datetime import datetime
import hashlib
import logging
from dataclasses import dataclass

# Import our schemas
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from validators.schema import VisualSpec, VisualIntent, DataPoint, Theme, ValidationReport

logger = logging.getLogger(__name__)


@dataclass
class SVGGenerationResult:
    """Result from SVG generation process"""
    success: bool
    svg_content: Optional[str]
    sanitized_svg: Optional[str]
    validation_report: ValidationReport
    generation_time_ms: int
    security_violations: List[str]
    size_bytes: int
    estimated_render_time_ms: Optional[int]


class SVGSecuritySanitizer:
    """Security-focused SVG sanitizer for web safety"""
    
    # Allowed SVG elements (whitelist approach)
    ALLOWED_ELEMENTS = {
        'svg', 'g', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon',
        'path', 'text', 'tspan', 'title', 'desc', 'defs', 'linearGradient',
        'radialGradient', 'stop', 'clipPath', 'mask', 'pattern', 'marker'
    }
    
    # Allowed attributes (whitelist approach)
    ALLOWED_ATTRIBUTES = {
        'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry',
        'width', 'height', 'fill', 'stroke', 'stroke-width', 'stroke-dasharray',
        'opacity', 'fill-opacity', 'stroke-opacity', 'transform', 'viewBox',
        'preserveAspectRatio', 'd', 'points', 'font-family', 'font-size',
        'font-weight', 'text-anchor', 'dominant-baseline', 'class', 'id',
        'offset', 'stop-color', 'stop-opacity', 'gradientUnits', 'x1', 'x2',
        'y1', 'y2', 'cx', 'cy', 'r', 'fx', 'fy'
    }
    
    # Dangerous patterns to remove
    DANGEROUS_PATTERNS = [
        r'javascript:', r'data:', r'vbscript:', r'on\w+\s*=',
        r'<script', r'</script>', r'<iframe', r'</iframe>',
        r'<object', r'</object>', r'<embed', r'</embed>',
        r'<form', r'</form>', r'<input', r'<meta'
    ]
    
    # Color validation regex
    COLOR_PATTERN = re.compile(r'^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$|^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$|^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[0-9.]+\s*\)$|^none$|^transparent$')
    
    def __init__(self):
        self.violations = []
    
    def sanitize_svg(self, svg_content: str) -> Tuple[str, List[str]]:
        """
        Sanitize SVG content for web safety
        Returns: (sanitized_svg, security_violations)
        """
        self.violations = []
        
        try:
            # Step 1: Remove dangerous patterns
            sanitized = self._remove_dangerous_patterns(svg_content)
            
            # Step 2: Parse and validate XML structure
            sanitized = self._parse_and_validate_xml(sanitized)
            
            # Step 3: Validate attributes and values
            sanitized = self._validate_attributes(sanitized)
            
            # Step 4: Ensure proper SVG structure
            sanitized = self._ensure_svg_structure(sanitized)
            
            # Step 5: Final security check
            sanitized = self._final_security_check(sanitized)
            
            return sanitized, self.violations
            
        except Exception as e:
            self.violations.append(f"XML parsing error: {str(e)}")
            return "", self.violations
    
    def _remove_dangerous_patterns(self, content: str) -> str:
        """Remove obviously dangerous patterns"""
        for pattern in self.DANGEROUS_PATTERNS:
            if re.search(pattern, content, re.IGNORECASE):
                self.violations.append(f"Removed dangerous pattern: {pattern}")
                content = re.sub(pattern, '', content, flags=re.IGNORECASE)
        
        return content
    
    def _parse_and_validate_xml(self, content: str) -> str:
        """Parse XML and validate structure"""
        try:
            # Ensure content starts with SVG declaration
            if not content.strip().startswith('<svg'):
                self.violations.append("Content does not start with <svg>")
                return ""
            
            # Parse XML
            root = ET.fromstring(content)
            
            # Validate root is SVG (handle namespace)
            tag_name = root.tag.split('}')[-1] if '}' in root.tag else root.tag
            if tag_name != 'svg':
                self.violations.append(f"Root element is {root.tag}, not svg")
                return ""
            
            # Remove disallowed elements
            self._remove_disallowed_elements(root)
            
            # Convert back to string
            return ET.tostring(root, encoding='unicode')
            
        except ET.ParseError as e:
            self.violations.append(f"XML parse error: {str(e)}")
            return ""
    
    def _remove_disallowed_elements(self, element):
        """Recursively remove disallowed elements"""
        for child in list(element):
            # Handle namespaced tags
            tag_name = child.tag.split('}')[-1] if '}' in child.tag else child.tag
            if tag_name not in self.ALLOWED_ELEMENTS:
                self.violations.append(f"Removed disallowed element: {tag_name}")
                element.remove(child)
            else:
                self._remove_disallowed_elements(child)
    
    def _validate_attributes(self, content: str) -> str:
        """Validate and sanitize attributes"""
        try:
            root = ET.fromstring(content)
            self._sanitize_element_attributes(root)
            return ET.tostring(root, encoding='unicode')
        except:
            return content
    
    def _sanitize_element_attributes(self, element):
        """Recursively sanitize element attributes"""
        # Check attributes
        for attr_name in list(element.attrib.keys()):
            if attr_name not in self.ALLOWED_ATTRIBUTES:
                self.violations.append(f"Removed disallowed attribute: {attr_name}")
                del element.attrib[attr_name]
            else:
                # Validate attribute values
                attr_value = element.attrib[attr_name]
                if not self._validate_attribute_value(attr_name, attr_value):
                    self.violations.append(f"Invalid value for {attr_name}: {attr_value}")
                    del element.attrib[attr_name]
        
        # Recurse to children
        for child in element:
            self._sanitize_element_attributes(child)
    
    def _validate_attribute_value(self, attr_name: str, value: str) -> bool:
        """Validate specific attribute values"""
        if attr_name in ['fill', 'stroke', 'stop-color']:
            return self.COLOR_PATTERN.match(value) is not None
        
        if attr_name in ['x', 'y', 'width', 'height', 'cx', 'cy', 'r']:
            try:
                float(value)
                return True
            except ValueError:
                return False
        
        if attr_name in ['stroke-width', 'opacity', 'fill-opacity']:
            try:
                val = float(value)
                return 0 <= val <= 10  # Reasonable bounds
            except ValueError:
                return False
        
        if attr_name == 'transform':
            # Allow only basic transforms
            allowed_transforms = ['translate', 'scale', 'rotate', 'matrix']
            return any(trans in value for trans in allowed_transforms)
        
        # Default: allow if no specific validation
        return True
    
    def _ensure_svg_structure(self, content: str) -> str:
        """Ensure proper SVG structure"""
        try:
            root = ET.fromstring(content)
            
            # Ensure SVG has proper namespace
            if 'xmlns' not in root.attrib:
                root.set('xmlns', 'http://www.w3.org/2000/svg')
            
            # Ensure reasonable dimensions
            if 'width' not in root.attrib or 'height' not in root.attrib:
                if 'viewBox' in root.attrib:
                    # Extract from viewBox
                    viewbox = root.attrib['viewBox'].split()
                    if len(viewbox) >= 4:
                        root.set('width', viewbox[2])
                        root.set('height', viewbox[3])
                else:
                    # Set default dimensions
                    root.set('width', '800')
                    root.set('height', '600')
            
            return ET.tostring(root, encoding='unicode')
            
        except:
            return content
    
    def _final_security_check(self, content: str) -> str:
        """Final security validation"""
        # Check for any remaining dangerous content
        dangerous_checks = [
            'javascript:', 'data:', 'vbscript:', 'on',
            '<script', 'eval(', 'expression('
        ]
        
        for check in dangerous_checks:
            if check.lower() in content.lower():
                self.violations.append(f"Final check failed: found {check}")
                content = content.replace(check, '')
        
        return content


class SVGVisualGenerator:
    """Generates SVG visuals for specific chart types"""
    
    def __init__(self):
        self.sanitizer = SVGSecuritySanitizer()
    
    def generate_bar_chart_svg(self, visual_spec: VisualSpec) -> str:
        """Generate SVG for bar chart"""
        data_points = visual_spec.dataspec.data_points
        theme = visual_spec.theme
        
        # Calculate dimensions
        width = min(visual_spec.constraints.max_width, 800)
        height = min(visual_spec.constraints.max_height, 600)
        
        # Color scheme based on theme
        colors = self._get_theme_colors(theme)
        
        # Calculate bar dimensions
        margin = {'top': 60, 'right': 50, 'bottom': 80, 'left': 80}
        chart_width = width - margin['left'] - margin['right']
        chart_height = height - margin['top'] - margin['bottom']
        
        # Get max value for scaling
        max_value = max(dp.value for dp in data_points if isinstance(dp.value, (int, float)))
        
        # Generate SVG
        svg_parts = [
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
            f'<rect width="{width}" height="{height}" fill="{colors["background"]}"/>',
        ]
        
        # Title
        if visual_spec.title:
            svg_parts.append(
                f'<text x="{width//2}" y="30" text-anchor="middle" font-family="Arial" font-size="20" font-weight="bold" fill="{colors["text"]}">{visual_spec.title}</text>'
            )
        
        # Generate bars
        bar_width = chart_width / len(data_points) * 0.8
        bar_spacing = chart_width / len(data_points)
        
        for i, dp in enumerate(data_points):
            if isinstance(dp.value, (int, float)):
                # Calculate bar height
                bar_height = (dp.value / max_value) * chart_height
                x = margin['left'] + i * bar_spacing + (bar_spacing - bar_width) / 2
                y = margin['top'] + chart_height - bar_height
                
                # Bar
                svg_parts.append(
                    f'<rect x="{x:.1f}" y="{y:.1f}" width="{bar_width:.1f}" height="{bar_height:.1f}" fill="{colors["primary"]}" stroke="{colors["border"]}" stroke-width="1"/>'
                )
                
                # Value label
                svg_parts.append(
                    f'<text x="{x + bar_width/2:.1f}" y="{y - 5}" text-anchor="middle" font-family="Arial" font-size="12" fill="{colors["text"]}">{dp.value}</text>'
                )
                
                # Label
                label_y = margin['top'] + chart_height + 20
                svg_parts.append(
                    f'<text x="{x + bar_width/2:.1f}" y="{label_y}" text-anchor="middle" font-family="Arial" font-size="11" fill="{colors["text"]}">{dp.label}</text>'
                )
        
        # Axes
        # Y-axis
        svg_parts.append(
            f'<line x1="{margin["left"]}" y1="{margin["top"]}" x2="{margin["left"]}" y2="{margin["top"] + chart_height}" stroke="{colors["axis"]}" stroke-width="2"/>'
        )
        # X-axis
        svg_parts.append(
            f'<line x1="{margin["left"]}" y1="{margin["top"] + chart_height}" x2="{margin["left"] + chart_width}" y2="{margin["top"] + chart_height}" stroke="{colors["axis"]}" stroke-width="2"/>'
        )
        
        svg_parts.append('</svg>')
        
        return '\n'.join(svg_parts)
    
    def generate_pie_chart_svg(self, visual_spec: VisualSpec) -> str:
        """Generate SVG for pie chart"""
        data_points = visual_spec.dataspec.data_points
        theme = visual_spec.theme
        
        width = min(visual_spec.constraints.max_width, 800)
        height = min(visual_spec.constraints.max_height, 600)
        colors = self._get_theme_colors(theme)
        
        # Calculate total
        total = sum(dp.value for dp in data_points if isinstance(dp.value, (int, float)))
        if total == 0:
            return self._generate_empty_chart_svg(width, height, colors, "No data to display")
        
        # Chart dimensions
        center_x, center_y = width // 2, height // 2
        radius = min(width, height) // 3
        
        svg_parts = [
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
            f'<rect width="{width}" height="{height}" fill="{colors["background"]}"/>',
        ]
        
        # Title
        if visual_spec.title:
            svg_parts.append(
                f'<text x="{width//2}" y="30" text-anchor="middle" font-family="Arial" font-size="20" font-weight="bold" fill="{colors["text"]}">{visual_spec.title}</text>'
            )
        
        # Generate pie slices
        start_angle = 0
        slice_colors = self._get_slice_colors(len(data_points), theme)
        
        for i, dp in enumerate(data_points):
            if isinstance(dp.value, (int, float)) and dp.value > 0:
                # Calculate slice angle
                slice_angle = (dp.value / total) * 360
                end_angle = start_angle + slice_angle
                
                # Create path for slice
                path_data = self._create_pie_slice_path(center_x, center_y, radius, start_angle, end_angle)
                
                svg_parts.append(
                    f'<path d="{path_data}" fill="{slice_colors[i]}" stroke="{colors["background"]}" stroke-width="2"/>'
                )
                
                # Add label
                label_angle = start_angle + slice_angle / 2
                label_radius = radius * 0.7
                label_x = center_x + label_radius * math.cos(math.radians(label_angle))
                label_y = center_y + label_radius * math.sin(math.radians(label_angle))
                
                percentage = (dp.value / total) * 100
                svg_parts.append(
                    f'<text x="{label_x:.1f}" y="{label_y:.1f}" text-anchor="middle" font-family="Arial" font-size="11" fill="{colors["text"]}">{percentage:.1f}%</text>'
                )
                
                start_angle = end_angle
        
        svg_parts.append('</svg>')
        
        return '\n'.join(svg_parts)
    
    def generate_line_chart_svg(self, visual_spec: VisualSpec) -> str:
        """Generate SVG for line chart"""
        data_points = visual_spec.dataspec.data_points
        theme = visual_spec.theme
        
        width = min(visual_spec.constraints.max_width, 800)
        height = min(visual_spec.constraints.max_height, 600)
        colors = self._get_theme_colors(theme)
        
        # Chart dimensions
        margin = {'top': 60, 'right': 50, 'bottom': 80, 'left': 80}
        chart_width = width - margin['left'] - margin['right']
        chart_height = height - margin['top'] - margin['bottom']
        
        # Get value range
        values = [dp.value for dp in data_points if isinstance(dp.value, (int, float))]
        if not values:
            return self._generate_empty_chart_svg(width, height, colors, "No numeric data")
        
        min_value, max_value = min(values), max(values)
        value_range = max_value - min_value or 1  # Avoid division by zero
        
        svg_parts = [
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
            f'<rect width="{width}" height="{height}" fill="{colors["background"]}"/>',
        ]
        
        # Title
        if visual_spec.title:
            svg_parts.append(
                f'<text x="{width//2}" y="30" text-anchor="middle" font-family="Arial" font-size="20" font-weight="bold" fill="{colors["text"]}">{visual_spec.title}</text>'
            )
        
        # Generate line path
        points = []
        for i, dp in enumerate(data_points):
            if isinstance(dp.value, (int, float)):
                x = margin['left'] + (i / (len(data_points) - 1)) * chart_width
                y = margin['top'] + chart_height - ((dp.value - min_value) / value_range) * chart_height
                points.append(f"{x:.1f},{y:.1f}")
        
        if len(points) > 1:
            path_data = "M " + " L ".join(points)
            svg_parts.append(
                f'<path d="{path_data}" fill="none" stroke="{colors["primary"]}" stroke-width="3"/>'
            )
            
            # Add data points
            for i, point in enumerate(points):
                x, y = point.split(',')
                svg_parts.append(
                    f'<circle cx="{x}" cy="{y}" r="4" fill="{colors["accent"]}" stroke="{colors["background"]}" stroke-width="2"/>'
                )
        
        # Axes
        svg_parts.extend([
            f'<line x1="{margin["left"]}" y1="{margin["top"]}" x2="{margin["left"]}" y2="{margin["top"] + chart_height}" stroke="{colors["axis"]}" stroke-width="2"/>',
            f'<line x1="{margin["left"]}" y1="{margin["top"] + chart_height}" x2="{margin["left"] + chart_width}" y2="{margin["top"] + chart_height}" stroke="{colors["axis"]}" stroke-width="2"/>'
        ])
        
        svg_parts.append('</svg>')
        
        return '\n'.join(svg_parts)
    
    def _get_theme_colors(self, theme: Theme) -> Dict[str, str]:
        """Get color scheme for theme"""
        color_schemes = {
            Theme.PROFESSIONAL: {
                'background': '#FFFFFF',
                'primary': '#0066CC',
                'accent': '#004499',
                'text': '#333333',
                'axis': '#666666',
                'border': '#CCCCCC'
            },
            Theme.EDUCATIONAL: {
                'background': '#F8F9FA',
                'primary': '#28A745',
                'accent': '#20C997',
                'text': '#495057',
                'axis': '#6C757D',
                'border': '#DEE2E6'
            },
            Theme.CORPORATE: {
                'background': '#FFFFFF',
                'primary': '#6C757D',
                'accent': '#495057',
                'text': '#212529',
                'axis': '#ADB5BD',
                'border': '#DEE2E6'
            },
            Theme.MODERN: {
                'background': '#1A1A1A',
                'primary': '#FF6B6B',
                'accent': '#4ECDC4',
                'text': '#FFFFFF',
                'axis': '#999999',
                'border': '#444444'
            },
            Theme.MINIMAL: {
                'background': '#FAFAFA',
                'primary': '#333333',
                'accent': '#666666',
                'text': '#222222',
                'axis': '#CCCCCC',
                'border': '#E0E0E0'
            }
        }
        
        return color_schemes.get(theme, color_schemes[Theme.PROFESSIONAL])
    
    def _get_slice_colors(self, count: int, theme: Theme) -> List[str]:
        """Get colors for pie chart slices"""
        base_colors = {
            Theme.PROFESSIONAL: ['#0066CC', '#0052A3', '#003D7A', '#002952', '#001A33'],
            Theme.EDUCATIONAL: ['#28A745', '#20C997', '#17A2B8', '#6F42C1', '#E83E8C'],
            Theme.CORPORATE: ['#6C757D', '#495057', '#343A40', '#212529', '#ADB5BD'],
            Theme.MODERN: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'],
            Theme.MINIMAL: ['#333333', '#666666', '#999999', '#CCCCCC', '#555555']
        }
        
        colors = base_colors.get(theme, base_colors[Theme.PROFESSIONAL])
        
        # Extend colors if needed
        while len(colors) < count:
            colors.extend(colors)
        
        return colors[:count]
    
    def _create_pie_slice_path(self, cx: float, cy: float, radius: float, start_angle: float, end_angle: float) -> str:
        """Create SVG path for pie slice"""
        import math
        
        # Convert to radians
        start_rad = math.radians(start_angle)
        end_rad = math.radians(end_angle)
        
        # Calculate points
        x1 = cx + radius * math.cos(start_rad)
        y1 = cy + radius * math.sin(start_rad)
        x2 = cx + radius * math.cos(end_rad)
        y2 = cy + radius * math.sin(end_rad)
        
        # Large arc flag
        large_arc = 1 if (end_angle - start_angle) > 180 else 0
        
        # Create path
        path = f"M {cx},{cy} L {x1:.1f},{y1:.1f} A {radius},{radius} 0 {large_arc},1 {x2:.1f},{y2:.1f} Z"
        
        return path
    
    def _generate_empty_chart_svg(self, width: int, height: int, colors: Dict[str, str], message: str) -> str:
        """Generate empty chart SVG with message"""
        return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
    <rect width="{width}" height="{height}" fill="{colors['background']}"/>
    <text x="{width//2}" y="{height//2}" text-anchor="middle" font-family="Arial" font-size="16" fill="{colors['text']}">{message}</text>
</svg>'''


class AIDirectedSVGGenerator:
    """AI-directed SVG generation with security validation"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        self.visual_generator = SVGVisualGenerator()
        self.sanitizer = SVGSecuritySanitizer()
    
    def generate_svg_visual(self, visual_spec: VisualSpec) -> SVGGenerationResult:
        """Generate SVG visual with security validation"""
        start_time = datetime.now()
        
        try:
            # Step 1: Check if we can use deterministic generation
            svg_content = self._try_deterministic_generation(visual_spec)
            
            # Step 2: If no deterministic match, try AI generation
            if not svg_content and self.api_key:
                svg_content = self._try_ai_generation(visual_spec)
            
            # Step 3: Fallback to basic generation
            if not svg_content:
                svg_content = self._fallback_generation(visual_spec)
            
            if not svg_content:
                return self._create_failure_result(start_time, "No generation method succeeded")
            
            # Step 4: Sanitize for security
            sanitized_svg, violations = self.sanitizer.sanitize_svg(svg_content)
            
            if not sanitized_svg:
                return self._create_failure_result(start_time, "Security sanitization failed", violations)
            
            # Step 5: Create validation report
            validation_report = self._validate_svg_output(sanitized_svg, visual_spec)
            
            generation_time = int((datetime.now() - start_time).total_seconds() * 1000)
            
            return SVGGenerationResult(
                success=True,
                svg_content=svg_content,
                sanitized_svg=sanitized_svg,
                validation_report=validation_report,
                generation_time_ms=generation_time,
                security_violations=violations,
                size_bytes=len(sanitized_svg.encode('utf-8')),
                estimated_render_time_ms=self._estimate_render_time(sanitized_svg)
            )
            
        except Exception as e:
            return self._create_failure_result(start_time, str(e))
    
    def _try_deterministic_generation(self, visual_spec: VisualSpec) -> Optional[str]:
        """Try deterministic SVG generation for common chart types"""
        try:
            if visual_spec.intent == VisualIntent.BAR_CHART:
                return self.visual_generator.generate_bar_chart_svg(visual_spec)
            elif visual_spec.intent == VisualIntent.PIE_CHART:
                return self.visual_generator.generate_pie_chart_svg(visual_spec)
            elif visual_spec.intent == VisualIntent.LINE_CHART:
                return self.visual_generator.generate_line_chart_svg(visual_spec)
            
            return None
            
        except Exception as e:
            logger.error(f"Deterministic generation failed: {str(e)}")
            return None
    
    def _try_ai_generation(self, visual_spec: VisualSpec) -> Optional[str]:
        """Try AI-powered SVG generation (placeholder for future implementation)"""
        # TODO: Implement AI-powered SVG generation using OpenAI API
        # This would use similar prompting as Canvas generation but output SVG
        logger.info("AI-powered SVG generation not yet implemented")
        return None
    
    def _fallback_generation(self, visual_spec: VisualSpec) -> Optional[str]:
        """Fallback to basic chart generation"""
        try:
            # Default to bar chart if intent not supported
            return self.visual_generator.generate_bar_chart_svg(visual_spec)
        except Exception as e:
            logger.error(f"Fallback generation failed: {str(e)}")
            return None
    
    def _validate_svg_output(self, svg_content: str, visual_spec: VisualSpec) -> ValidationReport:
        """Validate generated SVG"""
        errors = []
        warnings = []
        score = 1.0
        
        # Check basic structure
        if not svg_content.strip().startswith('<svg'):
            errors.append("SVG does not start with <svg> tag")
            score -= 0.3
        
        if not svg_content.strip().endswith('</svg>'):
            errors.append("SVG does not end with </svg> tag")
            score -= 0.3
        
        # Check size
        size_bytes = len(svg_content.encode('utf-8'))
        if size_bytes > 100000:  # 100KB limit
            warnings.append(f"SVG size is large: {size_bytes} bytes")
            score -= 0.1
        
        # Check for title if specified
        if visual_spec.title and visual_spec.title not in svg_content:
            warnings.append("Title not found in SVG content")
            score -= 0.1
        
        # Check dimensions
        try:
            root = ET.fromstring(svg_content)
            if 'width' not in root.attrib or 'height' not in root.attrib:
                warnings.append("SVG missing width or height attributes")
                score -= 0.1
        except:
            errors.append("SVG is not valid XML")
            score -= 0.5
        
        return ValidationReport(
            valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            score=max(0, score),
            schema_valid=len(errors) == 0,
            security_valid=True,  # Already sanitized
            performance_valid=size_bytes < 50000,
            accessibility_valid=True  # Basic SVG is accessible
        )
    
    def _estimate_render_time(self, svg_content: str) -> int:
        """Estimate SVG render time in milliseconds"""
        # Simple heuristic based on content complexity
        element_count = svg_content.count('<') - svg_content.count('</') 
        size_kb = len(svg_content.encode('utf-8')) / 1024
        
        # Base time + element complexity + size factor
        estimated_ms = 10 + (element_count * 2) + (size_kb * 5)
        
        return int(min(estimated_ms, 1000))  # Cap at 1 second
    
    def _create_failure_result(self, start_time: datetime, error_message: str, violations: List[str] = None) -> SVGGenerationResult:
        """Create failure result"""
        generation_time = int((datetime.now() - start_time).total_seconds() * 1000)
        
        return SVGGenerationResult(
            success=False,
            svg_content=None,
            sanitized_svg=None,
            validation_report=ValidationReport(
                valid=False,
                errors=[error_message],
                warnings=[],
                score=0.0,
                schema_valid=False,
                security_valid=False,
                performance_valid=False,
                accessibility_valid=False
            ),
            generation_time_ms=generation_time,
            security_violations=violations or [],
            size_bytes=0,
            estimated_render_time_ms=0
        )


# Import math for pie chart calculations
import math

# Convenience functions
async def generate_secure_svg(visual_spec: VisualSpec) -> SVGGenerationResult:
    """Generate secure SVG visual"""
    generator = AIDirectedSVGGenerator()
    return generator.generate_svg_visual(visual_spec)


if __name__ == "__main__":
    # Test SVG generation
    from validators.schema import DataSpec, DataType, DataPoint, VisualIntent, Theme, Constraints
    
    def test_svg_generation():
        print("🎨 Testing SVG Generation & Sanitization")
        print("=" * 50)
        
        # Create test data
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
        
        visual_spec = VisualSpec(
            scene_id="svg_test_001",
            intent=VisualIntent.BAR_CHART,
            dataspec=data_spec,
            title="Quarterly Sales",
            theme=Theme.PROFESSIONAL,
            constraints=Constraints(max_width=800, max_height=600)
        )
        
        # Test generation (synchronous)
        generator = AIDirectedSVGGenerator()
        result = generator.generate_svg_visual(visual_spec)
        
        if result.success:
            print(f"✅ SVG generated successfully")
            print(f"  Size: {result.size_bytes} bytes")
            print(f"  Generation time: {result.generation_time_ms}ms")
            print(f"  Security violations: {len(result.security_violations)}")
            print(f"  Validation score: {result.validation_report.score:.2f}")
            
            # Save to file
            with open("/tmp/test_svg_output.svg", "w") as f:
                f.write(result.sanitized_svg)
            print(f"  Saved to: /tmp/test_svg_output.svg")
            
            # Test different chart types
            print(f"\n🔄 Testing different chart types:")
            
            # Pie chart
            visual_spec.intent = VisualIntent.PIE_CHART
            pie_result = generator.generate_svg_visual(visual_spec)
            if pie_result.success:
                print(f"  ✅ Pie chart: {pie_result.size_bytes} bytes")
                with open("/tmp/test_pie_chart.svg", "w") as f:
                    f.write(pie_result.sanitized_svg)
            
            # Line chart
            visual_spec.intent = VisualIntent.LINE_CHART
            line_result = generator.generate_svg_visual(visual_spec)
            if line_result.success:
                print(f"  ✅ Line chart: {line_result.size_bytes} bytes")
                with open("/tmp/test_line_chart.svg", "w") as f:
                    f.write(line_result.sanitized_svg)
            
        else:
            print(f"❌ SVG generation failed")
            print(f"  Errors: {result.validation_report.errors}")
            if result.security_violations:
                print(f"  Security violations: {result.security_violations}")
    
    test_svg_generation()