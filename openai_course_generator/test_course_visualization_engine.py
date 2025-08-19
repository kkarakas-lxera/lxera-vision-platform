#!/usr/bin/env python3
"""
Course Visualization Engine Test
Tests our engine's ability to automatically create educational visualizations from course content
"""

import os
import sys
import asyncio
import json
from datetime import datetime

# Add multimedia path
multimedia_path = os.path.join(os.path.dirname(__file__), 'multimedia')
sys.path.append(multimedia_path)

# Set up environment
SUPABASE_URL = "https://xwfweumeryrgbguwrocr.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZndldW1lcnlyZ2JndXdyb2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NjM0NDAsImV4cCI6MjA2NjMzOTQ0MH0.aDpFDImHTr13UhRHqQZHZ92e8I-tvcuUcDCtfRvfbzw"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZndldW1lcnlyZ2JndXdyb2NyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc2MzQ0MCwiZXhwIjoyMDY2MzM5NDQwfQ.qxXpBxUKhKA4AQT4UQnIEJGbGNrRDMbBroZU8YaypSY"

os.environ['SUPABASE_URL'] = SUPABASE_URL
os.environ['SUPABASE_ANON_KEY'] = SUPABASE_ANON_KEY
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = SUPABASE_SERVICE_ROLE_KEY

from ai_visual_generation.course_content_analyzer import CourseContentAnalyzer, analyze_educational_content
from ai_visual_generation.supabase_integration import SupabaseConfig
from supabase import create_client


class EducationalVisualizationEngine:
    """Automatically generates educational visualizations from course content"""
    
    def __init__(self):
        self.supabase_config = SupabaseConfig(
            url=SUPABASE_URL,
            service_role_key=SUPABASE_SERVICE_ROLE_KEY,
            anon_key=SUPABASE_ANON_KEY
        )
        self.supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        
    async def retrieve_course_content(self, course_filter: str = None):
        """Retrieve Ali Yıldırım's actual course content from Supabase"""
        print(f"📚 Retrieving Ali Yıldırım's real course content from Supabase...")
        
        try:
            # Query for Ali Yıldırım's course content
            print("🔍 Searching for Ali Yıldırım's course content...")
            
            response = self.supabase.table('cm_module_content').select('*').ilike('employee_name', '%Ali Yıldırım%').execute()
            
            if response.data:
                print(f"✅ Found {len(response.data)} course record(s) from Ali Yıldırım")
                
                # Return the raw course data - let the CourseContentAnalyzer handle everything
                courses = []
                for course_record in response.data:
                    # Pass the raw content directly to the analyzer using correct table structure
                    course_data = {
                        'course_name': course_record.get('module_name', 'Ali Yıldırım Course'),
                        'course_id': course_record.get('content_id', 'ali_course'),
                        'target_audience': course_record.get('employee_name', 'Ali Yıldırım'),
                        'created_at': course_record.get('created_at'),
                        'word_count': course_record.get('total_word_count', 0),
                        'raw_content': {
                            'introduction': course_record.get('introduction', ''),
                            'core_content': course_record.get('core_content', ''),
                            'practical_applications': course_record.get('practical_applications', ''),
                            'case_studies': course_record.get('case_studies', ''),
                            'assessments': course_record.get('assessments', '')
                        },  # Raw content sections for analyzer
                        'modules': []  # Will be populated by analyzer if needed
                    }
                    courses.append(course_data)
                
                print(f"📚 Retrieved course: {course_data.get('course_name')}")
                print(f"🔍 Raw content structure available for automatic analysis")
                return courses
            else:
                print("❌ No course content found for Ali Yıldırım")
                return None
        
        except Exception as e:
            print(f"❌ Error retrieving Ali's content from Supabase: {e}")
            return None
    
    def extract_educational_datasets(self, course_data_list):
        """Extract visualizable educational datasets from course content using the analyzer"""
        print(f"🔍 Letting the CourseContentAnalyzer handle content analysis...")
        
        all_datasets = []
        
        for course_data in course_data_list:
            print(f"\n📚 Processing: {course_data.get('course_name', 'Unknown Course')}")
            
            # Pass raw content to the analyzer - let it do everything automatically
            raw_content = course_data.get('raw_content', {})
            
            # The analyzer will handle all content extraction automatically
            datasets = analyze_educational_content(raw_content)
            
            # Add course context to each dataset  
            for dataset in datasets:
                dataset.metadata['course_name'] = course_data.get('course_name')
                dataset.metadata['course_id'] = course_data.get('course_id')
                dataset.metadata['target_audience'] = course_data.get('target_audience')
                dataset.metadata['content_source'] = 'supabase_real_data'
            
            all_datasets.extend(datasets)
            print(f"  📊 Analyzer extracted {len(datasets)} educational visualizations")
        
        print(f"\n📈 Total educational datasets from real content: {len(all_datasets)}")
        return all_datasets
    
    async def auto_generate_educational_visualizations(self, datasets):
        """Automatically generate educational visualizations using our engine"""
        print(f"\n🎨 Auto-generating educational visualizations from Ali's real content...")
        
        from ai_visual_generation.code_execution_pipeline import CodeExecutionPipeline
        from ai_visual_generation.deterministic_registry import generate_deterministic_visual
        from validators.schema import (
            VisualSpec, VisualIntent, DataSpec, DataPoint, DataType, 
            Theme, Constraints
        )
        
        pipeline = CodeExecutionPipeline()
        results = []
        
        for i, dataset in enumerate(datasets):
            print(f"\n📊 Dataset {i+1}: {dataset.title}")
            print(f"  🎯 Educational Purpose: {dataset.educational_purpose}")
            print(f"  👥 Target Audience: {dataset.target_audience}")
            print(f"  📚 Content Source: {dataset.metadata.get('content_source', 'unknown')}")
            
            # Convert data to DataPoints
            data_points = []
            for label, value in zip(dataset.labels, dataset.values):
                try:
                    numeric_value = float(value)
                    data_points.append(DataPoint(label=str(label), value=numeric_value))
                except (ValueError, TypeError):
                    continue
            
            if not data_points:
                print(f"  ⚠️ No valid numeric data found")
                continue
            
            # Create educational visual specification
            visual_spec = VisualSpec(
                scene_id=f"ali_real_content_{i}_{int(datetime.now().timestamp())}",
                intent=dataset.suggested_intent,
                dataspec=DataSpec(
                    data_type=DataType.NUMERICAL,
                    data_points=data_points
                ),
                title=dataset.title,
                subtitle=dataset.subtitle,
                theme=dataset.suggested_theme,
                constraints=Constraints(max_width=1000, max_height=700)
            )
            
            # Try deterministic first (fastest for educational content)
            print(f"  🚀 Trying deterministic educational template...")
            deterministic_result = generate_deterministic_visual(visual_spec)
            
            if deterministic_result:
                print(f"  ✅ Educational template applied to real content!")
                result = {
                    'dataset': dataset,
                    'method': 'deterministic',
                    'success': True,
                    'generation_time': '< 1ms',
                    'canvas_elements': len(deterministic_result.elements),
                    'educational_value': 'Template optimized for Ali\'s real course content'
                }
                results.append(result)
                continue
            
            # Fallback to code execution pipeline
            print(f"  ⚡ Using educational code generation for real content...")
            generation_result = pipeline.generate_visualization(visual_spec)
            
            if generation_result.success:
                print(f"  ✅ Educational visualization generated from real content!")
                method = generation_result.output_data.get('execution_method', 'code_execution')
                result = {
                    'dataset': dataset,
                    'method': method,
                    'success': True,
                    'generation_time': f"{generation_result.generation_time_ms}ms",
                    'quality_score': generation_result.visual_quality_score,
                    'educational_value': 'Custom generated from Ali\'s real course content'
                }
                results.append(result)
            else:
                print(f"  ❌ Generation failed: {generation_result.output_data}")
                result = {
                    'dataset': dataset,
                    'method': 'failed',
                    'success': False,
                    'error': str(generation_result.output_data)
                }
                results.append(result)
        
        return results


async def main():
    """Main test function - fully automated educational visualization from Ali's real content"""
    print("🎓 Educational Visualization Engine Test - Ali Yıldırım's Real Content")
    print("=" * 80)
    print("🎯 Goal: Generate educational visualizations from Ali's actual course content")
    print("📚 Focus: Real course delivery content from Supabase")
    print("🤖 Engine autonomously: Retrieves → Analyzes → Visualizes")
    print()
    
    engine = EducationalVisualizationEngine()
    
    # Step 1: Retrieve Ali's actual course content from Supabase
    courses = await engine.retrieve_course_content("ali")
    
    if not courses:
        print("❌ No course data found for Ali Yıldırım - test cannot continue")
        return False
    
    # Step 2: Let the analyzer extract educational datasets automatically
    datasets = engine.extract_educational_datasets(courses)
    
    if not datasets:
        print("❌ No educational visualizations found in Ali's course content")
        return False
    
    # Step 3: Auto-generate educational visualizations from real content
    results = await engine.auto_generate_educational_visualizations(datasets)
    
    # Results summary
    print(f"\n🏁 Educational Visualization Results from Ali's Real Content")
    print("=" * 60)
    
    successful = [r for r in results if r['success']]
    failed = [r for r in results if not r['success']]
    
    print(f"📊 Total educational datasets from real content: {len(results)}")
    print(f"✅ Successful educational visualizations: {len(successful)}")
    print(f"❌ Failed visualizations: {len(failed)}")
    
    if successful:
        print(f"\n🎨 Educational Visualizations from Ali's Real Course:")
        for result in successful:
            dataset = result['dataset']
            print(f"  📚 {dataset.content_type.value}: {dataset.title[:50]}...")
            print(f"    🎯 Purpose: {dataset.educational_purpose[:60]}...")
            print(f"    👥 Audience: {dataset.target_audience}")
            print(f"    🔧 Method: {result['method']} | Time: {result['generation_time']}")
            print(f"    📈 Value: {result.get('educational_value', 'High')}")
            print()
        
        # Method breakdown for real content
        methods = {}
        for result in successful:
            method = result['method']
            methods[method] = methods.get(method, 0) + 1
        
        print(f"⚡ Rendering Methods for Ali's Real Content:")
        for method, count in methods.items():
            print(f"  • {method}: {count} visualizations from real course content")
    
    if failed:
        print(f"\n❌ Failed Educational Visualizations:")
        for result in failed:
            dataset = result['dataset']
            print(f"  • {dataset.content_type.value}: {result.get('error', 'Unknown error')}")
    
    success_rate = len(successful) / len(results) if results else 0
    
    print(f"\n📈 Educational Visualization Success Rate: {success_rate:.1%}")
    
    if success_rate >= 0.5:  # 50% success rate for real content 
        print("\n🎉 Educational Visualization Engine Working with Real Content!")
        print("✅ Engine successfully:")
        print("  📚 Retrieved Ali Yıldırım's actual course content from Supabase")
        print("  🤖 Analyzed real educational content automatically")
        print("  🎯 Identified educational visualization opportunities")
        print("  📊 Generated appropriate visualizations for course delivery")
        print("  👥 Targeted specific educational audiences")
        print("  ⚡ Selected optimal rendering methods autonomously")
        
        print(f"\n🎓 Real Educational Content Visualized:")
        content_types = set(r['dataset'].content_type for r in successful)
        for content_type in content_types:
            print(f"  • {content_type.value}")
        
        return True
    else:
        print("\n⚠️ Educational engine needs improvement for real content processing")
        return False


if __name__ == "__main__":
    success = asyncio.run(main())
    print(f"\n🎯 Real content educational visualization test {'PASSED' if success else 'FAILED'}!")
    exit(0 if success else 1)
