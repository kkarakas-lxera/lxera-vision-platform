#!/usr/bin/env python3
"""
SVG Renderer for AI Visual Pipeline
Converts SVG content to PNG using cairosvg with security validation
"""

import io
import logging
from typing import Optional, Tuple, Dict, Any
from datetime import datetime
import tempfile
import os

# Import our schemas
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from validators.schema import ValidationReport

logger = logging.getLogger(__name__)


class SVGRenderer:
    """SVG to PNG renderer with security validation"""
    
    def __init__(self):
        self.cairo_available = self._check_cairo_availability()
        self.wkhtmltopdf_available = self._check_wkhtmltopdf_availability()
        
    def _check_cairo_availability(self) -> bool:
        """Check if cairosvg is available"""
        try:
            import cairosvg
            return True
        except ImportError:
            logger.warning("cairosvg not available, falling back to alternative rendering")
            return False
    
    def _check_wkhtmltopdf_availability(self) -> bool:
        """Check if wkhtmltopdf is available as fallback"""
        try:
            import subprocess
            result = subprocess.run(['which', 'wkhtmltopdf'], capture_output=True)
            return result.returncode == 0
        except:
            return False
    
    def render_svg_to_png(
        self, 
        svg_content: str,
        width: Optional[int] = None,
        height: Optional[int] = None,
        scale: float = 1.0
    ) -> Tuple[bool, Optional[bytes], str]:
        """
        Render SVG to PNG bytes
        Returns: (success, png_bytes, error_message)
        """
        
        if not svg_content.strip():
            return False, None, "Empty SVG content"
        
        # Try different rendering methods in order of preference
        methods = [
            self._render_with_cairo,
            self._render_with_pillow,
            self._render_with_subprocess
        ]
        
        for method in methods:
            try:
                success, png_bytes, error = method(svg_content, width, height, scale)
                if success and png_bytes:
                    return True, png_bytes, ""
            except Exception as e:
                logger.warning(f"Rendering method {method.__name__} failed: {str(e)}")
                continue
        
        return False, None, "All rendering methods failed"
    
    def _render_with_cairo(
        self, 
        svg_content: str, 
        width: Optional[int], 
        height: Optional[int], 
        scale: float
    ) -> Tuple[bool, Optional[bytes], str]:
        """Render using cairosvg (preferred method)"""
        if not self.cairo_available:
            return False, None, "cairosvg not available"
        
        try:
            import cairosvg
            
            # Configure rendering options
            render_options = {
                'bytestring': svg_content.encode('utf-8')
            }
            
            if width:
                render_options['output_width'] = int(width * scale)
            if height:
                render_options['output_height'] = int(height * scale)
            
            # Render to PNG bytes
            png_bytes = cairosvg.svg2png(**render_options)
            
            if png_bytes and len(png_bytes) > 100:  # Sanity check
                return True, png_bytes, ""
            else:
                return False, None, "Invalid PNG output from cairosvg"
                
        except Exception as e:
            return False, None, f"cairosvg error: {str(e)}"
    
    def _render_with_pillow(
        self, 
        svg_content: str, 
        width: Optional[int], 
        height: Optional[int], 
        scale: float
    ) -> Tuple[bool, Optional[bytes], str]:
        """Render using Pillow with svg support (if available)"""
        try:
            from PIL import Image
            from io import BytesIO
            
            # This is a fallback - Pillow doesn't natively support SVG
            # but some environments might have plugins
            
            # Try to use PIL-SIMD or other SVG-capable PIL variants
            img = Image.open(BytesIO(svg_content.encode('utf-8')))
            
            if width and height:
                img = img.resize((int(width * scale), int(height * scale)), Image.Resampling.LANCZOS)
            
            output = BytesIO()
            img.save(output, format='PNG')
            png_bytes = output.getvalue()
            
            return True, png_bytes, ""
            
        except Exception as e:
            return False, None, f"Pillow SVG error: {str(e)}"
    
    def _render_with_subprocess(
        self, 
        svg_content: str, 
        width: Optional[int], 
        height: Optional[int], 
        scale: float
    ) -> Tuple[bool, Optional[bytes], str]:
        """Render using subprocess commands (last resort)"""
        try:
            import subprocess
            
            # Create temporary files
            with tempfile.NamedTemporaryFile(mode='w', suffix='.svg', delete=False) as svg_file:
                svg_file.write(svg_content)
                svg_path = svg_file.name
            
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as png_file:
                png_path = png_file.name
            
            try:
                # Try different command-line SVG converters
                commands = [
                    # ImageMagick convert
                    ['convert', svg_path, png_path],
                    # rsvg-convert
                    ['rsvg-convert', '--format=png', '--output', png_path, svg_path],
                    # inkscape
                    ['inkscape', '--export-png', png_path, svg_path]
                ]
                
                for cmd in commands:
                    try:
                        # Add size parameters if specified
                        if 'convert' in cmd[0] and width and height:
                            cmd.insert(-1, f'-resize')
                            cmd.insert(-1, f'{int(width * scale)}x{int(height * scale)}')
                        elif 'rsvg-convert' in cmd[0] and width and height:
                            cmd.insert(-1, f'--width={int(width * scale)}')
                            cmd.insert(-1, f'--height={int(height * scale)}')
                        
                        result = subprocess.run(cmd, capture_output=True, timeout=10)
                        
                        if result.returncode == 0 and os.path.exists(png_path):
                            with open(png_path, 'rb') as f:
                                png_bytes = f.read()
                            
                            if len(png_bytes) > 100:  # Sanity check
                                return True, png_bytes, ""
                    
                    except (subprocess.TimeoutExpired, FileNotFoundError):
                        continue
                
                return False, None, "No working subprocess renderer found"
                
            finally:
                # Cleanup temporary files
                try:
                    os.unlink(svg_path)
                    os.unlink(png_path)
                except:
                    pass
                    
        except Exception as e:
            return False, None, f"Subprocess rendering error: {str(e)}"
    
    def validate_svg_content(self, svg_content: str) -> ValidationReport:
        """Validate SVG content for rendering"""
        errors = []
        warnings = []
        score = 1.0
        
        # Basic structure checks
        if not svg_content.strip():
            errors.append("Empty SVG content")
            score = 0
        elif not svg_content.strip().startswith('<svg'):
            errors.append("Content does not start with <svg>")
            score -= 0.3
        elif not svg_content.strip().endswith('</svg>'):
            errors.append("Content does not end with </svg>")
            score -= 0.3
        
        # Size checks
        size_bytes = len(svg_content.encode('utf-8'))
        if size_bytes > 1000000:  # 1MB limit
            warnings.append(f"SVG is very large: {size_bytes} bytes")
            score -= 0.1
        elif size_bytes > 100000:  # 100KB warning
            warnings.append(f"SVG is large: {size_bytes} bytes")
            score -= 0.05
        
        # XML validity check
        try:
            import xml.etree.ElementTree as ET
            ET.fromstring(svg_content)
        except ET.ParseError as e:
            errors.append(f"Invalid XML structure: {str(e)}")
            score -= 0.5
        except Exception as e:
            warnings.append(f"XML validation warning: {str(e)}")
            score -= 0.1
        
        # Security checks (basic)
        dangerous_patterns = ['javascript:', 'data:', 'vbscript:', '<script', 'eval(']
        for pattern in dangerous_patterns:
            if pattern.lower() in svg_content.lower():
                errors.append(f"Dangerous pattern found: {pattern}")
                score -= 0.4
        
        return ValidationReport(
            valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            score=max(0, score),
            schema_valid=len(errors) == 0,
            security_valid='javascript:' not in svg_content.lower(),
            performance_valid=size_bytes < 100000,
            accessibility_valid=True  # SVG is generally accessible
        )
    
    def get_svg_dimensions(self, svg_content: str) -> Tuple[Optional[int], Optional[int]]:
        """Extract dimensions from SVG content"""
        try:
            import xml.etree.ElementTree as ET
            import re
            
            root = ET.fromstring(svg_content)
            
            # Try to get width and height attributes
            width_attr = root.get('width')
            height_attr = root.get('height')
            
            width = height = None
            
            if width_attr:
                # Extract numeric value (remove units like 'px', 'em', etc.)
                width_match = re.search(r'(\d+(?:\.\d+)?)', width_attr)
                if width_match:
                    width = int(float(width_match.group(1)))
            
            if height_attr:
                height_match = re.search(r'(\d+(?:\.\d+)?)', height_attr)
                if height_match:
                    height = int(float(height_match.group(1)))
            
            # If no width/height, try viewBox
            if width is None or height is None:
                viewbox = root.get('viewBox')
                if viewbox:
                    # viewBox format: "min-x min-y width height"
                    parts = viewbox.split()
                    if len(parts) >= 4:
                        try:
                            if width is None:
                                width = int(float(parts[2]))
                            if height is None:
                                height = int(float(parts[3]))
                        except ValueError:
                            pass
            
            return width, height
            
        except Exception as e:
            logger.warning(f"Could not extract SVG dimensions: {str(e)}")
            return None, None
    
    def estimate_render_time(self, svg_content: str) -> int:
        """Estimate rendering time in milliseconds"""
        # Simple heuristic based on content complexity
        size_kb = len(svg_content.encode('utf-8')) / 1024
        element_count = svg_content.count('<')
        
        # Base time varies by available renderer
        if self.cairo_available:
            base_time = 50  # cairosvg is fast
        elif self.wkhtmltopdf_available:
            base_time = 200  # subprocess calls are slower
        else:
            base_time = 500  # fallback methods are slowest
        
        # Add complexity factors
        complexity_time = (element_count * 5) + (size_kb * 10)
        
        estimated_ms = base_time + complexity_time
        
        return int(min(estimated_ms, 5000))  # Cap at 5 seconds
    
    def get_rendering_capabilities(self) -> Dict[str, Any]:
        """Get information about available rendering capabilities"""
        return {
            'cairo_available': self.cairo_available,
            'wkhtmltopdf_available': self.wkhtmltopdf_available,
            'preferred_method': 'cairosvg' if self.cairo_available else 'subprocess',
            'max_size_mb': 1,
            'supported_formats': ['PNG'],
            'estimated_performance': 'fast' if self.cairo_available else 'medium'
        }


# Convenience function
def render_svg_to_png_bytes(
    svg_content: str,
    width: Optional[int] = None,
    height: Optional[int] = None,
    scale: float = 1.0
) -> Tuple[bool, Optional[bytes], str]:
    """
    Convenience function to render SVG to PNG
    Returns: (success, png_bytes, error_message)
    """
    renderer = SVGRenderer()
    return renderer.render_svg_to_png(svg_content, width, height, scale)


if __name__ == "__main__":
    # Test SVG rendering
    def test_svg_rendering():
        print("🖼️ Testing SVG Rendering")
        print("=" * 40)
        
        # Create test SVG
        test_svg = '''<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#FFFFFF"/>
    <rect x="50" y="200" width="60" height="80" fill="#0066CC"/>
    <rect x="120" y="150" width="60" height="130" fill="#0066CC"/>
    <rect x="190" y="100" width="60" height="180" fill="#0066CC"/>
    <rect x="260" y="50" width="60" height="230" fill="#0066CC"/>
    <text x="200" y="30" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold">Test Chart</text>
</svg>'''
        
        renderer = SVGRenderer()
        
        # Test capabilities
        capabilities = renderer.get_rendering_capabilities()
        print(f"Rendering capabilities: {capabilities}")
        
        # Test validation
        validation = renderer.validate_svg_content(test_svg)
        print(f"Validation: valid={validation.valid}, score={validation.score:.2f}")
        
        if validation.errors:
            print(f"Errors: {validation.errors}")
        if validation.warnings:
            print(f"Warnings: {validation.warnings}")
        
        # Test dimensions
        width, height = renderer.get_svg_dimensions(test_svg)
        print(f"Extracted dimensions: {width}x{height}")
        
        # Test rendering
        start_time = datetime.now()
        success, png_bytes, error = renderer.render_svg_to_png(test_svg, width=400, height=300)
        end_time = datetime.now()
        
        render_time = int((end_time - start_time).total_seconds() * 1000)
        estimated_time = renderer.estimate_render_time(test_svg)
        
        if success and png_bytes:
            print(f"✅ SVG rendered successfully")
            print(f"  PNG size: {len(png_bytes)} bytes")
            print(f"  Render time: {render_time}ms (estimated: {estimated_time}ms)")
            
            # Save to file
            with open("/tmp/test_svg_render.png", "wb") as f:
                f.write(png_bytes)
            print(f"  Saved to: /tmp/test_svg_render.png")
            
        else:
            print(f"❌ SVG rendering failed: {error}")
    
    test_svg_rendering()