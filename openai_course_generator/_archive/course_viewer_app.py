#!/usr/bin/env python3
"""
Standalone Course Viewer Application

A separate Flask application for displaying generated course content.
Runs independently from the monitoring dashboard on a different port.
"""

import json
import os
from datetime import datetime
from pathlib import Path
from flask import Flask, render_template, jsonify, request, send_file
from flask_cors import CORS
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__, template_folder='templates/course_viewer')
CORS(app)

# Configuration
COURSE_OUTPUT_DIR = Path("output/course_content")
INTEGRATED_OUTPUT_DIR = Path("output/integrated_planning")

class CourseViewerAPI:
    """API endpoints for course viewer functionality."""
    
    def __init__(self):
        # Ensure output directories exist
        COURSE_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        INTEGRATED_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        logger.info("📚 Course Viewer API initialized")
    
    def get_available_courses(self):
        """Get list of all available generated courses."""
        courses = []
        
        # Check integrated planning output
        for file_path in INTEGRATED_OUTPUT_DIR.glob("complete_course_plan_*.json"):
            try:
                with open(file_path, 'r') as f:
                    course_data = json.load(f)
                
                overview = course_data.get("course_overview", {})
                metadata = course_data.get("generation_metadata", {})
                
                course_info = {
                    "id": file_path.stem,
                    "title": f"Personalized Course for {overview.get('learner_name', 'Unknown')}",
                    "learner_name": overview.get('learner_name', 'Unknown'),
                    "total_weeks": overview.get('total_weeks', 0),
                    "total_modules": overview.get('total_modules', 0),
                    "research_sources": overview.get('research_sources', 0),
                    "generation_date": metadata.get('generation_timestamp', ''),
                    "file_path": str(file_path),
                    "type": "integrated_planning"
                }
                courses.append(course_info)
                
            except Exception as e:
                logger.warning(f"Failed to parse course file {file_path}: {e}")
        
        # Check regular course output
        for file_path in COURSE_OUTPUT_DIR.glob("*.json"):
            try:
                with open(file_path, 'r') as f:
                    course_data = json.load(f)
                
                # Handle different course formats
                if "module_name" in course_data:
                    # Single module format
                    course_info = {
                        "id": file_path.stem,
                        "title": course_data.get("module_name", "Course Module"),
                        "learner_name": "Module Content",
                        "total_weeks": 1,
                        "total_modules": 1,
                        "generation_date": course_data.get("generation_timestamp", ""),
                        "file_path": str(file_path),
                        "type": "single_module"
                    }
                    courses.append(course_info)
                    
            except Exception as e:
                logger.warning(f"Failed to parse course file {file_path}: {e}")
        
        # Sort by generation date (newest first)
        courses.sort(key=lambda x: x.get('generation_date', ''), reverse=True)
        return courses
    
    def get_course_details(self, course_id):
        """Get detailed information for a specific course."""
        # Find course file
        course_file_path = None
        
        # Check integrated planning
        integrated_path = INTEGRATED_OUTPUT_DIR / f"{course_id}.json"
        if integrated_path.exists():
            course_file_path = integrated_path
        
        # Check regular course output
        regular_path = COURSE_OUTPUT_DIR / f"{course_id}.json"
        if regular_path.exists():
            course_file_path = regular_path
        
        if not course_file_path:
            return None
        
        try:
            with open(course_file_path, 'r') as f:
                course_data = json.load(f)
            return course_data
        except Exception as e:
            logger.error(f"Failed to load course {course_id}: {e}")
            return None
    
    def export_course_to_html(self, course_id):
        """Export course content to HTML format."""
        course_data = self.get_course_details(course_id)
        if not course_data:
            return None
        
        # Generate HTML content
        html_content = self._generate_html_export(course_data)
        
        # Save to file
        export_dir = Path("output/exports")
        export_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        html_filename = f"course_export_{course_id}_{timestamp}.html"
        html_filepath = export_dir / html_filename
        
        with open(html_filepath, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        return str(html_filepath)
    
    def _generate_html_export(self, course_data):
        """Generate HTML export of course content."""
        html_template = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }}
        .course-info {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }}
        .info-card {{ background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; }}
        .module {{ background: white; margin-bottom: 30px; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .module-header {{ background: #667eea; color: white; padding: 15px; margin: -25px -25px 20px -25px; border-radius: 10px 10px 0 0; }}
        .content-section {{ margin-bottom: 25px; }}
        .content-section h3 {{ color: #667eea; border-bottom: 2px solid #eee; padding-bottom: 5px; }}
        .research-sources {{ background: #f1f3f4; padding: 15px; border-radius: 5px; margin-top: 20px; }}
        .metadata {{ font-size: 0.9em; color: #666; background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px; }}
    </style>
</head>
<body>
    {content}
</body>
</html>
        """
        
        # Extract course information
        if "course_overview" in course_data:
            # Integrated planning format
            overview = course_data["course_overview"]
            title = f"Personalized Course for {overview.get('learner_name', 'Learner')}"
            content = self._format_integrated_course_content(course_data)
        else:
            # Single module format
            title = course_data.get("module_name", "Course Content")
            content = self._format_single_module_content(course_data)
        
        return html_template.format(title=title, content=content)
    
    def _format_integrated_course_content(self, course_data):
        """Format integrated course content for HTML export."""
        overview = course_data["course_overview"]
        planning = course_data.get("planning_components", {})
        execution = course_data.get("execution_results", {})
        
        content = f"""
        <div class="header">
            <h1>Personalized Learning Course</h1>
            <h2>{overview.get('learner_name', 'Learner')}</h2>
            <p>Generated on: {course_data.get('generation_metadata', {}).get('generation_timestamp', '')}</p>
        </div>
        
        <div class="course-info">
            <div class="info-card">
                <h3>Course Overview</h3>
                <p><strong>Duration:</strong> {overview.get('total_weeks', 0)} weeks</p>
                <p><strong>Total Modules:</strong> {overview.get('total_modules', 0)}</p>
                <p><strong>Research Sources:</strong> {overview.get('research_sources', 0)}</p>
            </div>
            <div class="info-card">
                <h3>Content Generated</h3>
                <p><strong>Sample Modules:</strong> {execution.get('content_generation', {}).get('sample_modules_generated', 0)}</p>
                <p><strong>Research Coverage:</strong> {execution.get('research_execution', {}).get('research_coverage_analysis', {}).get('coverage_percentage', 0)}%</p>
            </div>
        </div>
        """
        
        # Add generated content modules
        content_results = execution.get("content_generation", {}).get("content_results", [])
        for result in content_results:
            module_info = result.get("module_info", {})
            content_result = result.get("content_result", {})
            
            content += f"""
            <div class="module">
                <div class="module-header">
                    <h2>{module_info.get('module_name', 'Module')}</h2>
                </div>
                <div class="content-section">
                    <h3>Module Content</h3>
                    <div>{content_result.get('content', '').replace(chr(10), '<br>')}</div>
                </div>
                <div class="metadata">
                    <p><strong>Word Count:</strong> {content_result.get('word_count', 0)}</p>
                    <p><strong>Generation Time:</strong> {content_result.get('generation_time', 0)} seconds</p>
                </div>
            </div>
            """
        
        return content
    
    def _format_single_module_content(self, course_data):
        """Format single module content for HTML export."""
        content = f"""
        <div class="header">
            <h1>{course_data.get('module_name', 'Course Module')}</h1>
            <p>Generated on: {course_data.get('generation_timestamp', '')}</p>
        </div>
        
        <div class="module">
            <div class="content-section">
                <h3>Module Content</h3>
                <div>{course_data.get('content', '').replace(chr(10), '<br>')}</div>
            </div>
            <div class="metadata">
                <p><strong>Word Count:</strong> {course_data.get('word_count', 0)}</p>
            </div>
        </div>
        """
        
        return content

# Initialize API
course_viewer_api = CourseViewerAPI()

# Routes
@app.route('/')
def index():
    """Main course viewer page."""
    return render_template('course_viewer.html')

@app.route('/api/courses')
def get_courses():
    """API endpoint to get list of available courses."""
    try:
        courses = course_viewer_api.get_available_courses()
        return jsonify({
            "success": True,
            "courses": courses,
            "total_courses": len(courses)
        })
    except Exception as e:
        logger.error(f"Failed to get courses: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/course/<course_id>')
def get_course_details(course_id):
    """API endpoint to get detailed course information."""
    try:
        course_data = course_viewer_api.get_course_details(course_id)
        if course_data:
            return jsonify({
                "success": True,
                "course_data": course_data
            })
        else:
            return jsonify({
                "success": False,
                "error": "Course not found"
            }), 404
    except Exception as e:
        logger.error(f"Failed to get course details: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/export/<course_id>')
def export_course(course_id):
    """API endpoint to export course to HTML."""
    try:
        html_filepath = course_viewer_api.export_course_to_html(course_id)
        if html_filepath:
            return send_file(html_filepath, as_attachment=True)
        else:
            return jsonify({
                "success": False,
                "error": "Course not found or export failed"
            }), 404
    except Exception as e:
        logger.error(f"Failed to export course: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/stats')
def get_stats():
    """API endpoint to get course viewer statistics."""
    try:
        courses = course_viewer_api.get_available_courses()
        
        stats = {
            "total_courses": len(courses),
            "integrated_courses": len([c for c in courses if c["type"] == "integrated_planning"]),
            "single_modules": len([c for c in courses if c["type"] == "single_module"]),
            "total_modules": sum(c.get("total_modules", 0) for c in courses),
            "total_research_sources": sum(c.get("research_sources", 0) for c in courses)
        }
        
        return jsonify({
            "success": True,
            "stats": stats
        })
    except Exception as e:
        logger.error(f"Failed to get stats: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    print("🎓 Starting Course Viewer Application")
    print("=" * 50)
    print("📚 Course Viewer running at: http://localhost:5002")
    print("🔍 API endpoints available:")
    print("   - GET /api/courses - List all courses")
    print("   - GET /api/course/<id> - Get course details")
    print("   - GET /api/export/<id> - Export course to HTML")
    print("   - GET /api/stats - Get statistics")
    print("📂 Looking for courses in:")
    print(f"   - {INTEGRATED_OUTPUT_DIR}")
    print(f"   - {COURSE_OUTPUT_DIR}")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5002, debug=True)