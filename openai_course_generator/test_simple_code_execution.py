#!/usr/bin/env python3
"""
Quick demonstration of the working code execution pipeline
"""

import os
import sys

# Add multimedia path
multimedia_path = os.path.join(os.path.dirname(__file__), 'multimedia')
sys.path.append(multimedia_path)

from ai_visual_generation.code_execution_pipeline import CodeExecutionPipeline
from validators.schema import VisualIntent, DataSpec, DataPoint, DataType, Theme, VisualSpec, Constraints

def demo_code_execution():
    print("🔮 Code Execution Pipeline Demo")
    print("=" * 50)
    
    # Create test data
    data_points = [
        DataPoint(label="Traditional Learning", value=45),
        DataPoint(label="Interactive Learning", value=78),
        DataPoint(label="Gamified Learning", value=92)
    ]
    
    visual_spec = VisualSpec(
        scene_id="demo_code_execution",
        intent=VisualIntent.BAR_CHART,
        dataspec=DataSpec(data_type=DataType.NUMERICAL, data_points=data_points),
        title="Learning Engagement Comparison",
        subtitle="Student engagement levels by method",
        theme=Theme.EDUCATIONAL
    )
    
    print("📊 Generating educational visualization...")
    
    pipeline = CodeExecutionPipeline()
    result = pipeline.generate_visualization(visual_spec)
    
    if result.success:
        print(f"✅ Success! Generated in {result.generation_time_ms}ms")
        print(f"📄 Content type: {result.content_type}")
        print(f"⭐ Quality score: {result.visual_quality_score}")
        
        if result.output_data:
            method = result.output_data.get("execution_method", "unknown")
            print(f"🔧 Execution method: {method}")
        
        # Performance stats
        stats = pipeline.get_performance_stats()
        print(f"📈 Pipeline success rate: {stats['success_rate']:.1%}")
        print(f"⚡ Average execution time: {stats['avg_execution_time_ms']:.1f}ms")
        
        return True
    else:
        print(f"❌ Failed: {result.output_data}")
        return False

if __name__ == "__main__":
    success = demo_code_execution()
    print(f"\n🎯 Demo {'completed successfully' if success else 'failed'}!")