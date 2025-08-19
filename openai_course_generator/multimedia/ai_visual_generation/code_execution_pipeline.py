#!/usr/bin/env python3
"""
Code Execution Pipeline Integration for AI Visual Pipeline
Integrates sandboxed code execution with the main visual generation system
"""

import logging
import time
import tempfile
import shutil
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
from pathlib import Path

# Import schemas and components
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from validators.schema import (
    VisualSpec, VisualIntent, DataType, Theme, GenerationResult,
    RenderingPath, ValidationReport
)
from visual_execution_engines.code_sandbox import (
    CodeSandbox, SecurityLevel, ExecutionResult, ExecutionStatus,
    create_matplotlib_visualization
)
from ai_visual_generation.dynamic_code_generator import (
    DynamicCodeGenerator, CodeGenerationConfig, generate_dynamic_visualization
)

logger = logging.getLogger(__name__)


class CodeExecutionPipeline:
    """
    Integrates code execution capabilities into the AI visual pipeline
    Provides both dynamic AI-generated code and pre-validated code templates
    """
    
    def __init__(self, security_level: SecurityLevel = SecurityLevel.STRICT):
        self.security_level = security_level
        self.sandbox = CodeSandbox(security_level=security_level)
        self.dynamic_generator = DynamicCodeGenerator(
            CodeGenerationConfig(security_level=security_level)
        )
        
        # Performance tracking
        self.execution_stats = {
            "total_executions": 0,
            "successful_executions": 0,
            "failed_executions": 0,
            "avg_execution_time": 0.0,
            "security_violations": 0
        }
    
    def generate_visualization(self, 
                             visual_spec: VisualSpec,
                             use_dynamic_generation: bool = True,
                             fallback_to_templates: bool = True) -> GenerationResult:
        """
        Generate visualization using code execution
        
        Args:
            visual_spec: Visual specification
            use_dynamic_generation: Whether to use AI-generated code
            fallback_to_templates: Whether to fallback to safe templates
            
        Returns:
            GenerationResult with execution status and output
        """
        start_time = time.time()
        self.execution_stats["total_executions"] += 1
        
        # Strategy 1: Try dynamic AI-generated code if enabled
        if use_dynamic_generation and self.dynamic_generator.llm_available:
            logger.info(f"Attempting dynamic code generation for {visual_spec.scene_id}")
            
            result = self.dynamic_generator.generate_and_execute_visualization(visual_spec)
            
            if result.success:
                self._update_stats(success=True, execution_time=time.time() - start_time)
                return result
            
            logger.warning(f"Dynamic generation failed: {result.output_data}")
        
        # Strategy 2: Fallback to safe template-based code
        if fallback_to_templates:
            logger.info(f"Using template-based code generation for {visual_spec.scene_id}")
            
            result = self._generate_with_templates(visual_spec)
            
            if result.success:
                self._update_stats(success=True, execution_time=time.time() - start_time)
                return result
        
        # Strategy 3: Final fallback - simple matplotlib generation
        logger.info(f"Using simple matplotlib fallback for {visual_spec.scene_id}")
        result = self._generate_simple_matplotlib(visual_spec)
        
        execution_time = time.time() - start_time
        if result.success:
            self._update_stats(success=True, execution_time=execution_time)
        else:
            self._update_stats(success=False, execution_time=execution_time)
        
        return result
    
    def _generate_with_templates(self, visual_spec: VisualSpec) -> GenerationResult:
        """Generate visualization using pre-validated code templates"""
        start_time = time.time()
        
        # Extract data for template
        data_points = visual_spec.dataspec.data_points
        data = {
            'labels': [dp.label for dp in data_points],
            'values': [dp.value for dp in data_points if isinstance(dp.value, (int, float))]
        }
        
        # Map intent to chart type
        chart_type_map = {
            VisualIntent.BAR_CHART: "bar",
            VisualIntent.LINE_CHART: "line",
            VisualIntent.PIE_CHART: "pie"
        }
        
        chart_type = chart_type_map.get(visual_spec.intent, "bar")
        title = visual_spec.title or f"{visual_spec.intent.value.replace('_', ' ').title()}"
        
        # Execute template-based generation
        execution_result = create_matplotlib_visualization(
            data=data,
            chart_type=chart_type,
            title=title,
            security_level=self.security_level
        )
        
        generation_time = int((time.time() - start_time) * 1000)
        
        if execution_result.success and execution_result.generated_files:
            return GenerationResult(
                success=True,
                visual_spec=visual_spec,
                rendering_path=RenderingPath.CODE_EXECUTION,
                output_data={
                    "execution_method": "template_based",
                    "chart_type": chart_type,
                    "execution_output": execution_result.output,
                    "generated_files": execution_result.generated_files,
                    "execution_time": execution_result.execution_time
                },
                file_path=execution_result.generated_files[0] if execution_result.generated_files else None,
                content_type="image/png",
                generation_time_ms=generation_time,
                cache_hit=False,
                retry_count=0,
                accuracy_score=0.85,  # Good accuracy for templates
                visual_quality_score=0.80,  # Good quality
                generated_at=datetime.now(),
                model_used="template_based",
                tokens_used=0
            )
        else:
            return GenerationResult(
                success=False,
                visual_spec=visual_spec,
                rendering_path=RenderingPath.CODE_EXECUTION,
                output_data={
                    "execution_method": "template_based",
                    "execution_error": execution_result.error,
                    "execution_status": execution_result.status.value
                },
                file_path=None,
                content_type="text/plain",
                generation_time_ms=generation_time,
                cache_hit=False,
                retry_count=0,
                accuracy_score=0.0,
                visual_quality_score=0.0,
                generated_at=datetime.now(),
                model_used="template_based",
                tokens_used=0
            )
    
    def _generate_simple_matplotlib(self, visual_spec: VisualSpec) -> GenerationResult:
        """Simple matplotlib generation as final fallback"""
        start_time = time.time()
        
        # Create minimal matplotlib code
        data_points = visual_spec.dataspec.data_points
        labels = [dp.label for dp in data_points]
        values = [dp.value for dp in data_points if isinstance(dp.value, (int, float))]
        
        simple_code = f"""
import matplotlib.pyplot as plt
import os

# Data
labels = {labels}
values = {values}

# Create figure
fig, ax = plt.subplots(figsize=(8, 6))

# Create basic chart
if len(values) > 0:
    ax.bar(labels, values, color='#3498db')
    ax.set_title('{visual_spec.title or "Visualization"}')
    ax.set_ylabel('Value')
    ax.grid(True, alpha=0.3)

# Save
plt.tight_layout()
plt.savefig(os.path.join(__temp_dir__, 'chart.png'), dpi=150, bbox_inches='tight')
plt.close()

print(f"Generated simple chart with {{len(labels)}} data points")
"""
        
        execution_result = self.sandbox.execute_code(simple_code)
        generation_time = int((time.time() - start_time) * 1000)
        
        if execution_result.success and execution_result.generated_files:
            return GenerationResult(
                success=True,
                visual_spec=visual_spec,
                rendering_path=RenderingPath.CODE_EXECUTION,
                output_data={
                    "execution_method": "simple_fallback",
                    "generated_code": simple_code,
                    "execution_output": execution_result.output,
                    "generated_files": execution_result.generated_files
                },
                file_path=execution_result.generated_files[0],
                content_type="image/png",
                generation_time_ms=generation_time,
                cache_hit=False,
                retry_count=0,
                accuracy_score=0.75,  # Basic accuracy
                visual_quality_score=0.70,  # Basic quality
                generated_at=datetime.now(),
                model_used="simple_matplotlib",
                tokens_used=0
            )
        else:
            return GenerationResult(
                success=False,
                visual_spec=visual_spec,
                rendering_path=RenderingPath.CODE_EXECUTION,
                output_data={
                    "execution_method": "simple_fallback",
                    "execution_error": execution_result.error,
                    "execution_status": execution_result.status.value
                },
                file_path=None,
                content_type="text/plain",
                generation_time_ms=generation_time,
                cache_hit=False,
                retry_count=0,
                accuracy_score=0.0,
                visual_quality_score=0.0,
                generated_at=datetime.now(),
                model_used="simple_matplotlib",
                tokens_used=0
            )
    
    def execute_custom_code(self, 
                           python_code: str,
                           context: Optional[Dict[str, Any]] = None) -> ExecutionResult:
        """
        Execute custom Python code in the sandbox
        
        Args:
            python_code: Python code to execute
            context: Optional context variables
            
        Returns:
            ExecutionResult with execution status
        """
        self.execution_stats["total_executions"] += 1
        start_time = time.time()
        
        result = self.sandbox.execute_code(python_code, context)
        
        execution_time = time.time() - start_time
        
        if result.success:
            self._update_stats(success=True, execution_time=execution_time)
        else:
            self._update_stats(success=False, execution_time=execution_time)
            
            if result.status == ExecutionStatus.SECURITY_VIOLATION:
                self.execution_stats["security_violations"] += 1
        
        return result
    
    def copy_generated_file(self, temp_file_path: str, destination: str) -> bool:
        """
        Copy generated file from sandbox to permanent location
        
        Args:
            temp_file_path: Path to file in temp directory
            destination: Destination path
            
        Returns:
            Success status
        """
        try:
            if os.path.exists(temp_file_path):
                # Ensure destination directory exists
                os.makedirs(os.path.dirname(destination), exist_ok=True)
                shutil.copy2(temp_file_path, destination)
                return True
            return False
        except Exception as e:
            logger.error(f"File copy failed: {e}")
            return False
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Get performance statistics for the code execution pipeline"""
        total = self.execution_stats["total_executions"]
        success_rate = (self.execution_stats["successful_executions"] / total) if total > 0 else 0.0
        
        return {
            "total_executions": total,
            "success_rate": success_rate,
            "avg_execution_time_ms": self.execution_stats["avg_execution_time"] * 1000,
            "security_violations": self.execution_stats["security_violations"],
            "security_level": self.security_level.value
        }
    
    def _update_stats(self, success: bool, execution_time: float):
        """Update internal performance statistics"""
        if success:
            self.execution_stats["successful_executions"] += 1
        else:
            self.execution_stats["failed_executions"] += 1
        
        # Update running average
        total = self.execution_stats["total_executions"]
        current_avg = self.execution_stats["avg_execution_time"]
        self.execution_stats["avg_execution_time"] = (current_avg * (total - 1) + execution_time) / total


# Convenience function for pipeline usage
def generate_code_execution_visual(visual_spec: VisualSpec,
                                 security_level: SecurityLevel = SecurityLevel.STRICT,
                                 use_ai: bool = True) -> GenerationResult:
    """
    Generate visualization using code execution pipeline
    
    Args:
        visual_spec: Visual specification
        security_level: Security level for code execution
        use_ai: Whether to use AI-generated code
        
    Returns:
        GenerationResult with execution status and output
    """
    pipeline = CodeExecutionPipeline(security_level=security_level)
    return pipeline.generate_visualization(
        visual_spec=visual_spec,
        use_dynamic_generation=use_ai,
        fallback_to_templates=True
    )


if __name__ == "__main__":
    # Test the code execution pipeline
    def test_code_execution_pipeline():
        print("⚡ Testing Code Execution Pipeline")
        print("=" * 60)
        
        from validators.schema import DataPoint, DataSpec, Constraints
        
        # Test scenarios
        test_scenarios = [
            {
                "name": "Educational Bar Chart",
                "data": [
                    DataPoint(label="Traditional Lecture", value=20),
                    DataPoint(label="Interactive Discussion", value=65),
                    DataPoint(label="Hands-on Practice", value=85),
                    DataPoint(label="Peer Teaching", value=90)
                ],
                "intent": VisualIntent.BAR_CHART,
                "theme": Theme.EDUCATIONAL,
                "title": "Learning Method Retention Rates"
            },
            {
                "name": "Business Line Chart", 
                "data": [
                    DataPoint(label="Q1", value=100),
                    DataPoint(label="Q2", value=125),
                    DataPoint(label="Q3", value=140),
                    DataPoint(label="Q4", value=160)
                ],
                "intent": VisualIntent.LINE_CHART,
                "theme": Theme.PROFESSIONAL,
                "title": "Revenue Growth Trend"
            }
        ]
        
        pipeline = CodeExecutionPipeline(security_level=SecurityLevel.STRICT)
        
        print(f"🧪 Testing {len(test_scenarios)} scenarios...")
        print()
        
        for i, scenario in enumerate(test_scenarios, 1):
            print(f"📊 Scenario {i}: {scenario['name']}")
            
            visual_spec = VisualSpec(
                scene_id=f"code_test_{i}",
                intent=scenario["intent"],
                dataspec=DataSpec(
                    data_type=DataType.NUMERICAL,
                    data_points=scenario["data"]
                ),
                title=scenario["title"],
                theme=scenario["theme"],
                constraints=Constraints()
            )
            
            # Test with AI generation
            print("  🔮 Testing with AI generation...")
            result = pipeline.generate_visualization(
                visual_spec=visual_spec,
                use_dynamic_generation=True,
                fallback_to_templates=True
            )
            
            print(f"    Status: {result.success}")
            print(f"    Generation time: {result.generation_time_ms}ms")
            print(f"    Rendering path: {result.rendering_path}")
            print(f"    File generated: {result.file_path is not None}")
            
            if result.success and result.output_data:
                method = result.output_data.get("execution_method", "unknown")
                print(f"    Execution method: {method}")
            
            if not result.success and result.output_data:
                error = result.output_data.get("execution_error", "unknown")
                print(f"    Error: {error}")
            
            print()
        
        # Performance summary
        stats = pipeline.get_performance_stats()
        print("📊 Pipeline Performance Summary:")
        print(f"  Total executions: {stats['total_executions']}")
        print(f"  Success rate: {stats['success_rate']:.1%}")
        print(f"  Average execution time: {stats['avg_execution_time_ms']:.1f}ms")
        print(f"  Security violations: {stats['security_violations']}")
        print()
        
        print("⚡ Code Execution Pipeline Test Complete")
        
        return stats["success_rate"] > 0.5  # Return success if >50% success rate
    
    success = test_code_execution_pipeline()
    exit(0 if success else 1)