#!/usr/bin/env python3
"""
Canvas JSON Validation Pipeline
Comprehensive validation for AI-generated Canvas instructions
"""

import logging
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

# Import schemas
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from validators.schema import CanvasInstructions, CanvasElement, Theme

logger = logging.getLogger(__name__)


class ValidationSeverity(Enum):
    """Validation issue severity levels"""
    ERROR = "error"      # Breaks rendering
    WARNING = "warning"  # May affect quality
    INFO = "info"        # Optimization suggestion


@dataclass
class ValidationIssue:
    """Individual validation issue"""
    severity: ValidationSeverity
    category: str
    message: str
    element_index: Optional[int] = None
    suggested_fix: Optional[str] = None


@dataclass
class ValidationReport:
    """Complete validation report"""
    is_valid: bool
    issues: List[ValidationIssue]
    canvas_instructions: Optional[CanvasInstructions]
    auto_fixes_applied: int = 0


class CanvasValidator:
    """Comprehensive Canvas instruction validator"""
    
    def __init__(self, auto_fix: bool = True):
        self.auto_fix = auto_fix
        self.max_canvas_size = 4000
        self.min_canvas_size = 100
        self.max_elements = 200
        self.min_font_size = 8
        self.max_font_size = 72
    
    def validate(self, canvas_data: Dict[str, Any]) -> ValidationReport:
        """Main validation entry point"""
        issues = []
        fixes_applied = 0
        
        try:
            # Step 1: Basic schema validation with Pydantic
            canvas_instructions = CanvasInstructions.model_validate(canvas_data)
            
            # Step 2: Business logic validation
            canvas_issues, canvas_fixes = self._validate_canvas_properties(canvas_instructions)
            issues.extend(canvas_issues)
            fixes_applied += canvas_fixes
            
            # Step 3: Element validation
            element_issues, element_fixes = self._validate_elements(canvas_instructions)
            issues.extend(element_issues)
            fixes_applied += element_fixes
            
            # Step 4: Layout and overlap validation
            layout_issues = self._validate_layout(canvas_instructions)
            issues.extend(layout_issues)
            
            # Step 5: Accessibility validation
            a11y_issues = self._validate_accessibility(canvas_instructions)
            issues.extend(a11y_issues)
            
            # Step 6: Performance validation
            perf_issues = self._validate_performance(canvas_instructions)
            issues.extend(perf_issues)
            
            # Determine overall validity
            has_errors = any(issue.severity == ValidationSeverity.ERROR for issue in issues)
            
            return ValidationReport(
                is_valid=not has_errors,
                issues=issues,
                canvas_instructions=canvas_instructions,
                auto_fixes_applied=fixes_applied
            )
            
        except Exception as e:
            logger.error(f"Schema validation failed: {str(e)}")
            return ValidationReport(
                is_valid=False,
                issues=[ValidationIssue(
                    severity=ValidationSeverity.ERROR,
                    category="schema",
                    message=f"Schema validation failed: {str(e)}",
                    suggested_fix="Check JSON structure and required fields"
                )],
                canvas_instructions=None
            )
    
    def _validate_canvas_properties(self, canvas: CanvasInstructions) -> Tuple[List[ValidationIssue], int]:
        """Validate canvas-level properties"""
        issues = []
        fixes_applied = 0
        
        # Canvas size validation
        if canvas.width < self.min_canvas_size or canvas.width > self.max_canvas_size:
            issues.append(ValidationIssue(
                severity=ValidationSeverity.ERROR,
                category="canvas",
                message=f"Canvas width {canvas.width} outside valid range ({self.min_canvas_size}-{self.max_canvas_size})",
                suggested_fix=f"Set width between {self.min_canvas_size} and {self.max_canvas_size}"
            ))
        
        if canvas.height < self.min_canvas_size or canvas.height > self.max_canvas_size:
            issues.append(ValidationIssue(
                severity=ValidationSeverity.ERROR,
                category="canvas",
                message=f"Canvas height {canvas.height} outside valid range ({self.min_canvas_size}-{self.max_canvas_size})",
                suggested_fix=f"Set height between {self.min_canvas_size} and {self.max_canvas_size}"
            ))
        
        # Element count validation
        if len(canvas.elements) > self.max_elements:
            issues.append(ValidationIssue(
                severity=ValidationSeverity.WARNING,
                category="performance",
                message=f"High element count ({len(canvas.elements)}) may impact performance",
                suggested_fix=f"Consider reducing elements to under {self.max_elements}"
            ))
        
        if len(canvas.elements) == 0:
            issues.append(ValidationIssue(
                severity=ValidationSeverity.ERROR,
                category="content",
                message="Canvas contains no elements",
                suggested_fix="Add at least one visual element"
            ))
        
        return issues, fixes_applied
    
    def _validate_elements(self, canvas: CanvasInstructions) -> Tuple[List[ValidationIssue], int]:
        """Validate individual elements"""
        issues = []
        fixes_applied = 0
        
        for i, element in enumerate(canvas.elements):
            # Position validation
            if element.x < 0 or element.x > canvas.width:
                issues.append(ValidationIssue(
                    severity=ValidationSeverity.WARNING,
                    category="layout",
                    message=f"Element {i} x-position ({element.x}) outside canvas bounds",
                    element_index=i,
                    suggested_fix="Adjust x position to be within canvas"
                ))
            
            if element.y < 0 or element.y > canvas.height:
                issues.append(ValidationIssue(
                    severity=ValidationSeverity.WARNING,
                    category="layout",
                    message=f"Element {i} y-position ({element.y}) outside canvas bounds",
                    element_index=i,
                    suggested_fix="Adjust y position to be within canvas"
                ))
            
            # Element-specific validation
            if element.type == "text":
                text_issues, text_fixes = self._validate_text_element(element, i)
                issues.extend(text_issues)
                fixes_applied += text_fixes
            
            elif element.type == "rect":
                rect_issues = self._validate_rect_element(element, i, canvas)
                issues.extend(rect_issues)
            
            elif element.type == "circle":
                circle_issues = self._validate_circle_element(element, i, canvas)
                issues.extend(circle_issues)
        
        return issues, fixes_applied
    
    def _validate_text_element(self, element: CanvasElement, index: int) -> Tuple[List[ValidationIssue], int]:
        """Validate text-specific properties"""
        issues = []
        fixes_applied = 0
        
        # Text content
        text = getattr(element, 'text', '')
        if not text or text.strip() == '':
            issues.append(ValidationIssue(
                severity=ValidationSeverity.WARNING,
                category="content",
                message=f"Text element {index} has empty content",
                element_index=index,
                suggested_fix="Add meaningful text content"
            ))
        
        # Font size validation
        font_size = getattr(element, 'font_size', 14)
        if font_size < self.min_font_size:
            issues.append(ValidationIssue(
                severity=ValidationSeverity.WARNING,
                category="accessibility",
                message=f"Text element {index} font size ({font_size}) may be too small",
                element_index=index,
                suggested_fix=f"Increase font size to at least {self.min_font_size}"
            ))
            
            if self.auto_fix:
                element.font_size = self.min_font_size
                fixes_applied += 1
        
        if font_size > self.max_font_size:
            issues.append(ValidationIssue(
                severity=ValidationSeverity.WARNING,
                category="layout",
                message=f"Text element {index} font size ({font_size}) may be too large",
                element_index=index,
                suggested_fix=f"Reduce font size to under {self.max_font_size}"
            ))
        
        return issues, fixes_applied
    
    def _validate_rect_element(self, element: CanvasElement, index: int, canvas: CanvasInstructions) -> List[ValidationIssue]:
        """Validate rectangle-specific properties"""
        issues = []
        
        width = getattr(element, 'width', 0)
        height = getattr(element, 'height', 0)
        
        # Size validation
        if width <= 0 or height <= 0:
            issues.append(ValidationIssue(
                severity=ValidationSeverity.ERROR,
                category="geometry",
                message=f"Rectangle element {index} has invalid dimensions ({width}x{height})",
                element_index=index,
                suggested_fix="Set positive width and height values"
            ))
        
        # Bounds checking
        if element.x + width > canvas.width:
            issues.append(ValidationIssue(
                severity=ValidationSeverity.WARNING,
                category="layout",
                message=f"Rectangle element {index} extends beyond canvas width",
                element_index=index,
                suggested_fix="Reduce width or adjust x position"
            ))
        
        if element.y + height > canvas.height:
            issues.append(ValidationIssue(
                severity=ValidationSeverity.WARNING,
                category="layout",
                message=f"Rectangle element {index} extends beyond canvas height",
                element_index=index,
                suggested_fix="Reduce height or adjust y position"
            ))
        
        return issues
    
    def _validate_circle_element(self, element: CanvasElement, index: int, canvas: CanvasInstructions) -> List[ValidationIssue]:
        """Validate circle-specific properties"""
        issues = []
        
        radius = getattr(element, 'radius', 0)
        
        # Radius validation
        if radius <= 0:
            issues.append(ValidationIssue(
                severity=ValidationSeverity.ERROR,
                category="geometry",
                message=f"Circle element {index} has invalid radius ({radius})",
                element_index=index,
                suggested_fix="Set positive radius value"
            ))
        
        # Bounds checking
        if element.x - radius < 0 or element.x + radius > canvas.width:
            issues.append(ValidationIssue(
                severity=ValidationSeverity.WARNING,
                category="layout",
                message=f"Circle element {index} extends beyond canvas width",
                element_index=index,
                suggested_fix="Reduce radius or adjust x position"
            ))
        
        if element.y - radius < 0 or element.y + radius > canvas.height:
            issues.append(ValidationIssue(
                severity=ValidationSeverity.WARNING,
                category="layout",
                message=f"Circle element {index} extends beyond canvas height",
                element_index=index,
                suggested_fix="Reduce radius or adjust y position"
            ))
        
        return issues
    
    def _validate_layout(self, canvas: CanvasInstructions) -> List[ValidationIssue]:
        """Validate layout and element overlaps"""
        issues = []
        
        # Simple overlap detection for text elements
        text_elements = [
            (i, elem) for i, elem in enumerate(canvas.elements) 
            if elem.type == "text"
        ]
        
        for i in range(len(text_elements)):
            for j in range(i + 1, len(text_elements)):
                idx1, elem1 = text_elements[i]
                idx2, elem2 = text_elements[j]
                
                # Simple distance-based overlap check
                distance = ((elem1.x - elem2.x) ** 2 + (elem1.y - elem2.y) ** 2) ** 0.5
                min_distance = 30  # Minimum distance between text elements
                
                if distance < min_distance:
                    issues.append(ValidationIssue(
                        severity=ValidationSeverity.WARNING,
                        category="layout",
                        message=f"Text elements {idx1} and {idx2} may overlap",
                        suggested_fix="Increase spacing between text elements"
                    ))
        
        return issues
    
    def _validate_accessibility(self, canvas: CanvasInstructions) -> List[ValidationIssue]:
        """Validate accessibility considerations"""
        issues = []
        
        # Color contrast validation (simplified)
        text_elements = [elem for elem in canvas.elements if elem.type == "text"]
        
        if len(text_elements) > 0:
            # Check for light text on light background
            light_colors = ['#ffffff', '#f0f0f0', '#e0e0e0', 'white', 'lightgray']
            dark_colors = ['#000000', '#333333', '#666666', 'black', 'darkgray']
            
            for i, elem in enumerate(text_elements):
                text_color = getattr(elem, 'fill', '#000000').lower()
                bg_color = canvas.background_color.lower() if canvas.background_color else '#ffffff'
                
                if (text_color in light_colors and bg_color in light_colors) or \
                   (text_color in dark_colors and bg_color in dark_colors):
                    issues.append(ValidationIssue(
                        severity=ValidationSeverity.WARNING,
                        category="accessibility",
                        message=f"Text element {i} may have poor color contrast",
                        element_index=i,
                        suggested_fix="Use contrasting colors for text and background"
                    ))
        
        return issues
    
    def _validate_performance(self, canvas: CanvasInstructions) -> List[ValidationIssue]:
        """Validate performance considerations"""
        issues = []
        
        # Complex element count
        complex_elements = [
            elem for elem in canvas.elements 
            if elem.type in ["path", "polygon"]
        ]
        
        if len(complex_elements) > 20:
            issues.append(ValidationIssue(
                severity=ValidationSeverity.INFO,
                category="performance",
                message=f"High number of complex elements ({len(complex_elements)}) may slow rendering",
                suggested_fix="Consider simplifying or reducing complex elements"
            ))
        
        return issues


def validate_canvas_json(canvas_data: Dict[str, Any], auto_fix: bool = True) -> ValidationReport:
    """Convenience function for validating Canvas JSON"""
    validator = CanvasValidator(auto_fix=auto_fix)
    return validator.validate(canvas_data)


def print_validation_report(report: ValidationReport) -> None:
    """Pretty print validation report for debugging"""
    print(f"\n📊 Canvas Validation Report")
    print(f"{'='*50}")
    print(f"Valid: {'✅' if report.is_valid else '❌'} {report.is_valid}")
    print(f"Issues: {len(report.issues)}")
    print(f"Auto-fixes applied: {report.auto_fixes_applied}")
    
    if report.issues:
        print(f"\n🔍 Issues Found:")
        for i, issue in enumerate(report.issues, 1):
            severity_icon = {
                ValidationSeverity.ERROR: "🚨",
                ValidationSeverity.WARNING: "⚠️",
                ValidationSeverity.INFO: "ℹ️"
            }[issue.severity]
            
            print(f"\n{i}. {severity_icon} {issue.severity.value.upper()}")
            print(f"   Category: {issue.category}")
            print(f"   Message: {issue.message}")
            if issue.element_index is not None:
                print(f"   Element: {issue.element_index}")
            if issue.suggested_fix:
                print(f"   Fix: {issue.suggested_fix}")
    
    print(f"\n{'='*50}")


if __name__ == "__main__":
    # Test validation
    test_canvas = {
        "width": 800,
        "height": 600,
        "background_color": "#ffffff",
        "elements": [
            {
                "type": "text",
                "x": 10,
                "y": 30,
                "text": "Test Title",
                "font_size": 24,
                "fill": "#000000"
            },
            {
                "type": "rect",
                "x": 50,
                "y": 100,
                "width": 200,
                "height": 150,
                "fill": "#3498db",
                "stroke": "#2980b9"
            }
        ]
    }
    
    report = validate_canvas_json(test_canvas)
    print_validation_report(report)