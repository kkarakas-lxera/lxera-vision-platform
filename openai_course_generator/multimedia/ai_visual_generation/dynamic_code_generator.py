#!/usr/bin/env python3
"""
Dynamic Code Generator for AI Visual Pipeline
Generates Python visualization code using LLM for custom charts
"""

import logging
import time
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from datetime import datetime

# Import schemas and utilities
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from validators.schema import (
    VisualSpec, VisualIntent, DataType, Theme, GenerationResult,
    RenderingPath, ValidationReport
)
from visual_execution_engines.code_sandbox import (
    CodeSandbox, SecurityLevel, ExecutionResult, ExecutionStatus
)

logger = logging.getLogger(__name__)


@dataclass
class CodeGenerationConfig:
    """Configuration for code generation"""
    security_level: SecurityLevel = SecurityLevel.STRICT
    max_code_length: int = 2000  # Maximum characters in generated code
    include_comments: bool = True
    prefer_matplotlib: bool = True  # Prefer matplotlib over plotly
    include_styling: bool = True  # Include professional styling
    target_dpi: int = 150  # Target image resolution


class DynamicCodeGenerator:
    """Generates Python visualization code using AI"""
    
    def __init__(self, config: Optional[CodeGenerationConfig] = None):
        self.config = config or CodeGenerationConfig()
        self.sandbox = CodeSandbox(security_level=self.config.security_level)
        
        # LLM import (same pattern as other generators)
        try:
            from tools.multimedia_tools import get_llm_client, LLMConfig, LLMModel
            self.get_llm_client = get_llm_client
            self.LLMConfig = LLMConfig
            self.LLMModel = LLMModel
            self.llm_available = True
        except ImportError as e:
            logger.error(f"LLM tools not available: {e}")
            self.llm_available = False
    
    def generate_visualization_code(self, visual_spec: VisualSpec) -> Tuple[bool, str, List[str]]:
        """
        Generate Python code for visualization based on visual specification
        
        Returns:
            (success, generated_code, warnings)
        """
        if not self.llm_available:
            return False, "", ["LLM tools not available"]
        
        try:
            # Build the prompt for code generation
            prompt = self._build_code_generation_prompt(visual_spec)
            
            # Get LLM client (start with efficient model)
            client = self.get_llm_client(
                config=self.LLMConfig(
                    model=self.LLMModel.LLAMA_8B,
                    temperature=0.1,
                    max_tokens=1500
                )
            )
            
            # Generate code
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {
                        "role": "system",
                        "content": self._get_system_prompt()
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                temperature=0.1,
                max_tokens=1500
            )
            
            generated_code = response.choices[0].message.content.strip()
            
            # Extract code from markdown if present
            if "```python" in generated_code:
                start = generated_code.find("```python") + 9
                end = generated_code.find("```", start)
                if end != -1:
                    generated_code = generated_code[start:end].strip()
            elif "```" in generated_code:
                start = generated_code.find("```") + 3
                end = generated_code.find("```", start)
                if end != -1:
                    generated_code = generated_code[start:end].strip()
            
            # Validate code length
            if len(generated_code) > self.config.max_code_length:
                return False, "", [f"Generated code too long: {len(generated_code)} chars"]
            
            return True, generated_code, []
            
        except Exception as e:
            logger.error(f"Code generation failed: {e}")
            return False, "", [f"Code generation error: {str(e)}"]
    
    def generate_and_execute_visualization(self, visual_spec: VisualSpec) -> GenerationResult:
        """
        Generate Python code and execute it to create visualization
        
        Returns:
            GenerationResult with execution status and output
        """
        start_time = time.time()
        
        # Generate the code
        success, code, warnings = self.generate_visualization_code(visual_spec)
        
        if not success:
            return GenerationResult(
                success=False,
                visual_spec=visual_spec,
                rendering_path=RenderingPath.CODE_EXECUTION,
                output_data={"error": "Code generation failed", "warnings": warnings},
                file_path=None,
                content_type="text/plain",
                generation_time_ms=int((time.time() - start_time) * 1000),
                cache_hit=False,
                retry_count=0,
                accuracy_score=0.0,
                visual_quality_score=0.0,
                generated_at=datetime.now(),
                model_used="llama-3.1-8b-instant",
                tokens_used=0  # TODO: Track tokens
            )
        
        # Execute the code
        execution_result = self.sandbox.execute_code(code)
        
        generation_time = int((time.time() - start_time) * 1000)
        
        if execution_result.success and execution_result.generated_files:
            # Successful execution with generated files
            return GenerationResult(
                success=True,
                visual_spec=visual_spec,
                rendering_path=RenderingPath.CODE_EXECUTION,
                output_data={
                    "generated_code": code,
                    "execution_output": execution_result.output,
                    "generated_files": execution_result.generated_files,
                    "execution_time": execution_result.execution_time
                },
                file_path=execution_result.generated_files[0] if execution_result.generated_files else None,
                content_type="image/png",
                generation_time_ms=generation_time,
                cache_hit=False,
                retry_count=0,
                accuracy_score=0.9,  # High accuracy for successful code execution
                visual_quality_score=0.85,  # Good quality from matplotlib
                generated_at=datetime.now(),
                model_used="llama-3.1-8b-instant",
                tokens_used=0  # TODO: Track tokens
            )
        else:
            # Execution failed
            return GenerationResult(
                success=False,
                visual_spec=visual_spec,
                rendering_path=RenderingPath.CODE_EXECUTION,
                output_data={
                    "generated_code": code,
                    "execution_error": execution_result.error,
                    "execution_status": execution_result.status.value,
                    "security_warnings": execution_result.security_warnings
                },
                file_path=None,
                content_type="text/plain",
                generation_time_ms=generation_time,
                cache_hit=False,
                retry_count=0,
                accuracy_score=0.0,
                visual_quality_score=0.0,
                generated_at=datetime.now(),
                model_used="llama-3.1-8b-instant",
                tokens_used=0
            )
    
    def _get_system_prompt(self) -> str:
        """Get the system prompt for code generation"""
        
        return f"""You are an expert Python data visualization developer. Generate secure, professional matplotlib code for educational and business visualizations.

SECURITY REQUIREMENTS:
- Only use allowed imports: matplotlib.pyplot, numpy, pandas, math, datetime
- NO file system access except saving to __temp_dir__
- NO network requests, subprocess calls, or system commands
- NO eval, exec, or dynamic imports

CODING REQUIREMENTS:
- Use matplotlib.pyplot with 'Agg' backend for file output
- Save images to: os.path.join(__temp_dir__, 'chart.png')
- Include plt.close() after saving to free memory
- Use professional styling with colors: #3498db, #e74c3c, #2ecc71, #f39c12, #9b59b6
- Set figure size to (10, 6) for good proportions
- Use DPI={self.config.target_dpi} for crisp output
- Add grid, labels, and titles for professional appearance

OUTPUT FORMAT:
- Return only Python code, no markdown or explanations
- Include brief comments if helpful
- Ensure code is complete and executable
- Maximum {self.config.max_code_length} characters

CHART REQUIREMENTS:
- Bar charts: Add value labels on top of bars
- Line charts: Use markers and appropriate line width
- Pie charts: Include percentage labels and legend
- All charts: Professional typography and spacing"""

    def _build_code_generation_prompt(self, visual_spec: VisualSpec) -> str:
        """Build the specific prompt for the visual specification"""
        
        # Extract data information
        data_points = visual_spec.dataspec.data_points
        labels = [dp.label for dp in data_points]
        values = [dp.value for dp in data_points if isinstance(dp.value, (int, float))]
        
        # Build data context
        data_context = f"""
Data:
- Labels: {labels}
- Values: {values}
- Data type: {visual_spec.dataspec.data_type.value}
- Number of points: {len(data_points)}
"""
        
        # Chart specifications
        chart_specs = f"""
Chart Requirements:
- Type: {visual_spec.intent.value}
- Title: {visual_spec.title or 'Data Visualization'}
- Theme: {visual_spec.theme.value}
- Subtitle: {visual_spec.subtitle or ''}
"""
        
        # Specific requirements based on chart type
        if visual_spec.intent == VisualIntent.BAR_CHART:
            specific_req = """
Specific Requirements:
- Create a vertical bar chart
- Use distinct colors for each bar
- Add value labels on top of each bar
- Include grid lines for easy reading
- Rotate x-axis labels if they're long
"""
        elif visual_spec.intent == VisualIntent.LINE_CHART:
            specific_req = """
Specific Requirements:
- Create a line chart with markers
- Use a single color theme
- Add data point markers (circles)
- Include grid lines
- Connect all points with smooth line
"""
        elif visual_spec.intent == VisualIntent.PIE_CHART:
            specific_req = """
Specific Requirements:
- Create a pie chart with percentage labels
- Use distinct colors for each slice
- Include a legend
- Add shadow for depth
- Ensure labels don't overlap
"""
        else:
            specific_req = """
Specific Requirements:
- Create an appropriate visualization for the data
- Use professional styling
- Include proper labels and formatting
"""
        
        # Theme-specific styling
        if visual_spec.theme == Theme.EDUCATIONAL:
            theme_style = """
Theme Styling:
- Use bright, engaging colors
- Large, clear fonts
- Educational-friendly layout
- Emphasize clarity over complexity
"""
        elif visual_spec.theme == Theme.PROFESSIONAL:
            theme_style = """
Theme Styling:
- Use corporate color scheme
- Clean, minimal design
- Professional typography
- Business-appropriate styling
"""
        else:
            theme_style = """
Theme Styling:
- Use modern, clean design
- Balanced color palette
- Clear typography
- Visually appealing layout
"""
        
        return f"""{data_context}

{chart_specs}

{specific_req}

{theme_style}

Generate Python matplotlib code that creates this visualization and saves it as 'chart.png' in the temp directory."""

    def get_supported_chart_types(self) -> List[VisualIntent]:
        """Get list of supported chart types for code generation"""
        return [
            VisualIntent.BAR_CHART,
            VisualIntent.LINE_CHART,
            VisualIntent.PIE_CHART,
            VisualIntent.SCATTER_PLOT,
            VisualIntent.HISTOGRAM
        ]
    
    def estimate_generation_cost(self, visual_spec: VisualSpec) -> Dict[str, Any]:
        """Estimate the cost and time for generating this visualization"""
        
        complexity_factors = {
            "data_points": len(visual_spec.dataspec.data_points),
            "chart_type": visual_spec.intent.value,
            "theme_complexity": 1.0 if visual_spec.theme == Theme.MINIMAL else 1.5
        }
        
        # Base estimates
        base_tokens = 800  # Base prompt tokens
        complexity_multiplier = min(complexity_factors["data_points"] / 10.0, 2.0)
        estimated_tokens = int(base_tokens * complexity_multiplier * complexity_factors["theme_complexity"])
        
        estimated_time_ms = 2000 + (complexity_factors["data_points"] * 50)  # 2s base + 50ms per point
        estimated_cost_usd = estimated_tokens * 0.00002  # Approximate LLM cost
        
        return {
            "estimated_tokens": estimated_tokens,
            "estimated_time_ms": estimated_time_ms,
            "estimated_cost_usd": estimated_cost_usd,
            "complexity_score": complexity_multiplier,
            "supported": visual_spec.intent in self.get_supported_chart_types()
        }


# Convenience function for quick code generation
def generate_dynamic_visualization(visual_spec: VisualSpec, 
                                 security_level: SecurityLevel = SecurityLevel.STRICT) -> GenerationResult:
    """
    Generate a dynamic visualization using AI-generated Python code
    
    Args:
        visual_spec: Specification for the visualization
        security_level: Security level for code execution
        
    Returns:
        GenerationResult with success status and generated content
    """
    config = CodeGenerationConfig(security_level=security_level)
    generator = DynamicCodeGenerator(config)
    
    return generator.generate_and_execute_visualization(visual_spec)


if __name__ == "__main__":
    # Test the dynamic code generator
    def test_dynamic_code_generator():
        print("🔮 Testing Dynamic Code Generator")
        print("=" * 50)
        
        from validators.schema import DataPoint, DataSpec, Constraints
        
        # Test data - learning method effectiveness
        data_points = [
            DataPoint(label="Passive Reading", value=25),
            DataPoint(label="Highlighting", value=30),
            DataPoint(label="Note Taking", value=60),
            DataPoint(label="Practice Testing", value=85),
            DataPoint(label="Spaced Repetition", value=90)
        ]
        
        visual_spec = VisualSpec(
            scene_id="dynamic_test",
            intent=VisualIntent.BAR_CHART,
            dataspec=DataSpec(
                data_type=DataType.NUMERICAL,
                data_points=data_points
            ),
            title="Learning Method Effectiveness Study",
            subtitle="Retention rates after 1 week",
            theme=Theme.EDUCATIONAL,
            constraints=Constraints()
        )
        
        generator = DynamicCodeGenerator()
        
        # Test 1: Cost estimation
        print("📊 Test 1: Cost Estimation")
        cost_estimate = generator.estimate_generation_cost(visual_spec)
        print(f"  Estimated tokens: {cost_estimate['estimated_tokens']}")
        print(f"  Estimated time: {cost_estimate['estimated_time_ms']}ms")
        print(f"  Estimated cost: ${cost_estimate['estimated_cost_usd']:.4f}")
        print(f"  Complexity score: {cost_estimate['complexity_score']:.2f}")
        print(f"  Supported: {cost_estimate['supported']}")
        print()
        
        # Test 2: Code generation (if LLM available)
        print("🔮 Test 2: Dynamic Code Generation")
        if generator.llm_available:
            result = generator.generate_and_execute_visualization(visual_spec)
            
            print(f"  Success: {result.success}")
            print(f"  Generation time: {result.generation_time_ms}ms")
            print(f"  File path: {result.file_path}")
            print(f"  Content type: {result.content_type}")
            print(f"  Accuracy score: {result.accuracy_score}")
            
            if result.success:
                print("  ✅ Dynamic visualization generated successfully!")
                if result.output_data and 'generated_code' in result.output_data:
                    code_lines = result.output_data['generated_code'].count('\n') + 1
                    print(f"  📝 Generated code: {code_lines} lines")
            else:
                print(f"  ❌ Generation failed: {result.output_data}")
        else:
            print("  ⚠️ LLM not available - skipping generation test")
        
        print()
        print("🔮 Dynamic Code Generator Test Complete")
    
    test_dynamic_code_generator()