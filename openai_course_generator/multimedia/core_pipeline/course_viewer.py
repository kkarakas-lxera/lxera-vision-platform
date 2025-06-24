#!/usr/bin/env python3
"""
Enhanced Course Viewer Generator
Creates professional HTML course viewers with interactive features
"""

import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class CourseViewerGenerator:
    """Generates professional interactive course viewers"""
    
    def __init__(self):
        self.template_dir = Path(__file__).parent.parent / "templates"
        
    def generate_interactive_viewer(self,
                                   course_content: Dict[str, Any],
                                   audio_files: List[Path],
                                   video_files: List[Path],
                                   output_path: Path) -> Path:
        """Generate interactive course viewer HTML"""
        
        logger.info("Creating interactive course viewer...")
        
        viewer_path = output_path / "course_viewer.html"
        
        # Extract course data
        course_data = course_content.get("course_content", {})
        metadata = course_content.get("metadata", {})
        employee_context = course_content.get("employee_context", {})
        
        # Generate HTML content
        html_content = self._generate_html_template(
            course_data, metadata, employee_context,
            audio_files, video_files, output_path
        )
        
        # Save HTML file
        with open(viewer_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        logger.info(f"✅ Interactive course viewer created: {viewer_path}")
        return viewer_path
    
    def _generate_html_template(self,
                               course_data: Dict[str, Any],
                               metadata: Dict[str, Any],
                               employee_context: Dict[str, Any],
                               audio_files: List[Path],
                               video_files: List[Path],
                               output_path: Path) -> str:
        """Generate complete HTML template"""
        
        course_name = course_data.get("courseName", "Course")
        course_description = course_data.get("courseDescription", "")
        modules = course_data.get("modules", [])
        
        # Calculate course statistics
        total_words = metadata.get("total_word_count", 0)
        estimated_reading_time = max(1, total_words // 250)  # 250 WPM
        
        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{course_name} - Interactive Course Viewer</title>
    {self._get_css_styles()}
</head>
<body>
    <div class="container">
        <!-- Header Section -->
        <header class="course-header">
            <div class="header-content">
                <h1 class="course-title">{course_name}</h1>
                <p class="course-description">{course_description}</p>
                
                <div class="course-stats">
                    <div class="stat">
                        <span class="stat-value">{len(modules)}</span>
                        <span class="stat-label">Modules</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">{total_words:,}</span>
                        <span class="stat-label">Words</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">{estimated_reading_time}</span>
                        <span class="stat-label">Minutes</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">{len(audio_files)}</span>
                        <span class="stat-label">Audio</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">{len(video_files)}</span>
                        <span class="stat-label">Video</span>
                    </div>
                </div>
                
                <div class="personalization-info">
                    <p><strong>Personalized for:</strong> {employee_context.get('name', 'Professional Learner')}</p>
                    <p><strong>Generated:</strong> {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</p>
                </div>
            </div>
        </header>
        
        <!-- Navigation Tabs -->
        <nav class="tab-navigation">
            <button class="tab-button active" onclick="showTab('overview')">📖 Overview</button>
            <button class="tab-button" onclick="showTab('modules')">📚 Modules</button>
            <button class="tab-button" onclick="showTab('media')">🎵 Media</button>
            <button class="tab-button" onclick="showTab('progress')">📊 Progress</button>
        </nav>
        
        <!-- Content Sections -->
        <main class="content-area">
            
            <!-- Overview Tab -->
            <section id="overview-tab" class="tab-content active">
                <h2>Course Overview</h2>
                <div class="overview-grid">
                    <div class="overview-card">
                        <h3>🎯 Learning Objectives</h3>
                        <p>This course is designed to enhance your skills in {metadata.get('job_title', 'your professional role')}.</p>
                        <ul>
"""
        
        # Add learning objectives from first few modules
        for module in modules[:3]:
            concepts = module.get("keyConceptsToCover", [])
            for concept in concepts[:2]:
                html_content += f"                            <li>{concept}</li>\n"
        
        html_content += f"""                        </ul>
                    </div>
                    
                    <div class="overview-card">
                        <h3>👤 Personalization</h3>
                        <p><strong>Background:</strong> {employee_context.get('background', 'Professional development')}</p>
                        <p><strong>Learning Style:</strong> {employee_context.get('learning_style', 'Practical application')}</p>
                        <p><strong>Career Goals:</strong> {employee_context.get('career_goals', 'Professional advancement')}</p>
                    </div>
                    
                    <div class="overview-card">
                        <h3>📈 Course Structure</h3>
                        <p>This course consists of <strong>{len(modules)} modules</strong> covering key concepts and practical applications.</p>
                        <p><strong>Estimated Time:</strong> {estimated_reading_time} minutes reading + media content</p>
                        <p><strong>Quality Level:</strong> {metadata.get('quality_level', 'High').title()}</p>
                    </div>
                </div>
            </section>
            
            <!-- Modules Tab -->
            <section id="modules-tab" class="tab-content">
                <h2>Course Modules</h2>
                <div class="modules-container">
"""
        
        # Add modules
        for i, module in enumerate(modules, 1):
            module_name = module.get("moduleName", f"Module {i}")
            key_concepts = module.get("keyConceptsToCover", [])
            content = module.get("content", "")
            word_count = len(content.split()) if content else 0
            
            html_content += f"""
                    <div class="module-card" id="module-{i}">
                        <div class="module-header" onclick="toggleModule({i})">
                            <h3>📝 Module {i}: {module_name}</h3>
                            <span class="module-stats">{word_count:,} words</span>
                            <span class="toggle-icon">▼</span>
                        </div>
                        <div class="module-content" id="module-content-{i}">
                            <div class="concepts-section">
                                <h4>🎯 Key Concepts</h4>
                                <ul class="concepts-list">
"""
            
            for concept in key_concepts:
                html_content += f"                                    <li>{concept}</li>\n"
            
            # Add content preview
            content_preview = content[:500] + "..." if len(content) > 500 else content
            
            html_content += f"""                                </ul>
                            </div>
                            
                            <div class="content-preview">
                                <h4>📄 Content Preview</h4>
                                <div class="preview-text">{content_preview}</div>
                                <button class="read-full-btn" onclick="showFullContent({i})">Read Full Module</button>
                            </div>
                        </div>
                    </div>
"""
        
        html_content += """                </div>
            </section>
            
            <!-- Media Tab -->
            <section id="media-tab" class="tab-content">
                <h2>Course Media</h2>
                
                <div class="media-section">
                    <h3>🎵 Audio Content</h3>
                    <div class="media-grid">
"""
        
        # Add audio files
        for audio_file in audio_files:
            rel_path = audio_file.relative_to(output_path)
            file_size = audio_file.stat().st_size / (1024*1024) if audio_file.exists() else 0
            
            html_content += f"""
                        <div class="media-card">
                            <div class="media-icon">🎵</div>
                            <div class="media-info">
                                <h4>{audio_file.stem.replace('_', ' ').title()}</h4>
                                <p>Size: {file_size:.1f} MB</p>
                                <audio controls>
                                    <source src="{rel_path}" type="audio/mpeg">
                                    Your browser does not support audio playback.
                                </audio>
                                <br>
                                <a href="{rel_path}" download class="download-btn">Download</a>
                            </div>
                        </div>
"""
        
        html_content += """                    </div>
                </div>
                
                <div class="media-section">
                    <h3>🎬 Video Content</h3>
                    <div class="media-grid">
"""
        
        # Add video files
        for video_file in video_files:
            rel_path = video_file.relative_to(output_path)
            file_size = video_file.stat().st_size / (1024*1024) if video_file.exists() else 0
            
            html_content += f"""
                        <div class="media-card">
                            <div class="media-icon">🎬</div>
                            <div class="media-info">
                                <h4>{video_file.stem.replace('_', ' ').title()}</h4>
                                <p>Size: {file_size:.1f} MB</p>
                                <video controls width="100%">
                                    <source src="{rel_path}" type="video/mp4">
                                    Your browser does not support video playback.
                                </video>
                                <br>
                                <a href="{rel_path}" download class="download-btn">Download</a>
                            </div>
                        </div>
"""
        
        if not video_files:
            html_content += """
                        <div class="media-card">
                            <div class="media-info">
                                <p>No video files available for this course.</p>
                            </div>
                        </div>
"""
        
        html_content += """                    </div>
                </div>
            </section>
            
            <!-- Progress Tab -->
            <section id="progress-tab" class="tab-content">
                <h2>Learning Progress</h2>
                <div class="progress-container">
                    <div class="progress-overview">
                        <h3>📊 Course Progress</h3>
                        <div class="progress-bar">
                            <div class="progress-fill" id="course-progress" style="width: 0%"></div>
                        </div>
                        <p id="progress-text">0% Complete (0 of """ + str(len(modules)) + """ modules)</p>
                    </div>
                    
                    <div class="module-checklist">
                        <h3>✅ Module Checklist</h3>
"""
        
        # Add module checklist
        for i, module in enumerate(modules, 1):
            module_name = module.get("moduleName", f"Module {i}")
            html_content += f"""
                        <div class="checklist-item">
                            <input type="checkbox" id="module-check-{i}" onchange="updateProgress()">
                            <label for="module-check-{i}">Module {i}: {module_name}</label>
                        </div>
"""
        
        html_content += """                    </div>
                </div>
            </section>
            
        </main>
    </div>
    
    <!-- Full Content Modal -->
    <div id="content-modal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal()">&times;</span>
            <div id="modal-body"></div>
        </div>
    </div>
    
    """ + self._get_javascript() + """
    
</body>
</html>"""
        
        return html_content
    
    def _get_css_styles(self) -> str:
        """Get CSS styles for the course viewer"""
        
        return """
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            min-height: 100vh;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .course-header {
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .course-title {
            font-size: 2.5em;
            margin-bottom: 15px;
            font-weight: 300;
        }
        
        .course-description {
            font-size: 1.2em;
            margin-bottom: 30px;
            opacity: 0.9;
        }
        
        .course-stats {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin-bottom: 25px;
            flex-wrap: wrap;
        }
        
        .stat {
            text-align: center;
        }
        
        .stat-value {
            display: block;
            font-size: 2em;
            font-weight: bold;
            color: #ecf0f1;
        }
        
        .stat-label {
            font-size: 0.9em;
            opacity: 0.8;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .personalization-info {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
            text-align: left;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .tab-navigation {
            display: flex;
            background: #f8f9fa;
            border-bottom: 2px solid #dee2e6;
        }
        
        .tab-button {
            flex: 1;
            padding: 15px 20px;
            border: none;
            background: transparent;
            cursor: pointer;
            font-size: 1em;
            font-weight: 500;
            transition: all 0.3s ease;
            border-bottom: 3px solid transparent;
        }
        
        .tab-button:hover {
            background: #e9ecef;
        }
        
        .tab-button.active {
            background: white;
            border-bottom-color: #3498db;
            color: #3498db;
        }
        
        .content-area {
            padding: 30px;
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
        }
        
        .overview-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            margin-top: 20px;
        }
        
        .overview-card {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 12px;
            border-left: 4px solid #3498db;
        }
        
        .overview-card h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 1.3em;
        }
        
        .overview-card ul {
            margin-left: 20px;
            margin-top: 10px;
        }
        
        .overview-card li {
            margin-bottom: 8px;
        }
        
        .modules-container {
            margin-top: 20px;
        }
        
        .module-card {
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 12px;
            margin-bottom: 20px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        
        .module-card:hover {
            box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }
        
        .module-header {
            background: #f8f9fa;
            padding: 20px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #dee2e6;
        }
        
        .module-header:hover {
            background: #e9ecef;
        }
        
        .module-header h3 {
            color: #2c3e50;
            font-size: 1.3em;
        }
        
        .module-stats {
            color: #6c757d;
            font-size: 0.9em;
        }
        
        .toggle-icon {
            font-size: 1.2em;
            transition: transform 0.3s ease;
        }
        
        .module-content {
            padding: 25px;
            display: none;
        }
        
        .module-content.show {
            display: block;
        }
        
        .concepts-section h4 {
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .concepts-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .concepts-list li {
            background: #e3f2fd;
            padding: 8px 12px;
            border-radius: 6px;
            list-style: none;
        }
        
        .content-preview {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }
        
        .content-preview h4 {
            color: #2c3e50;
            margin-bottom: 15px;
        }
        
        .preview-text {
            margin-bottom: 15px;
            line-height: 1.7;
        }
        
        .read-full-btn {
            background: #3498db;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9em;
            transition: background 0.3s ease;
        }
        
        .read-full-btn:hover {
            background: #2980b9;
        }
        
        .media-section {
            margin-bottom: 40px;
        }
        
        .media-section h3 {
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 1.5em;
        }
        
        .media-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 25px;
        }
        
        .media-card {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            border: 1px solid #dee2e6;
        }
        
        .media-icon {
            font-size: 3em;
            margin-bottom: 15px;
        }
        
        .media-info h4 {
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .media-info p {
            color: #6c757d;
            margin-bottom: 15px;
        }
        
        .download-btn {
            display: inline-block;
            background: #28a745;
            color: white;
            text-decoration: none;
            padding: 8px 16px;
            border-radius: 6px;
            margin-top: 10px;
            transition: background 0.3s ease;
        }
        
        .download-btn:hover {
            background: #218838;
        }
        
        .progress-container {
            max-width: 600px;
            margin: 0 auto;
        }
        
        .progress-overview {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 30px;
        }
        
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #dee2e6;
            border-radius: 10px;
            overflow: hidden;
            margin: 20px 0;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #28a745, #20c997);
            transition: width 0.5s ease;
        }
        
        .module-checklist {
            background: white;
            padding: 25px;
            border-radius: 12px;
            border: 1px solid #dee2e6;
        }
        
        .checklist-item {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            padding: 10px;
            border-radius: 6px;
            transition: background 0.3s ease;
        }
        
        .checklist-item:hover {
            background: #f8f9fa;
        }
        
        .checklist-item input[type="checkbox"] {
            margin-right: 15px;
            width: 18px;
            height: 18px;
        }
        
        .checklist-item label {
            font-size: 1.1em;
            cursor: pointer;
        }
        
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.4);
        }
        
        .modal-content {
            background-color: white;
            margin: 5% auto;
            padding: 30px;
            border-radius: 12px;
            width: 90%;
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        }
        
        .close {
            position: absolute;
            right: 20px;
            top: 15px;
            color: #aaa;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
        }
        
        .close:hover {
            color: #000;
        }
        
        @media (max-width: 768px) {
            .course-stats {
                gap: 20px;
            }
            
            .stat-value {
                font-size: 1.5em;
            }
            
            .content-area {
                padding: 20px;
            }
            
            .tab-button {
                padding: 12px 10px;
                font-size: 0.9em;
            }
            
            .media-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
        """
    
    def _get_javascript(self) -> str:
        """Get JavaScript for interactive features"""
        
        return """
    <script>
        // Tab switching functionality
        function showTab(tabName) {
            // Hide all tab contents
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Remove active class from all tab buttons
            const tabButtons = document.querySelectorAll('.tab-button');
            tabButtons.forEach(button => {
                button.classList.remove('active');
            });
            
            // Show selected tab content
            document.getElementById(tabName + '-tab').classList.add('active');
            
            // Add active class to clicked button
            event.target.classList.add('active');
        }
        
        // Module toggle functionality
        function toggleModule(moduleIndex) {
            const content = document.getElementById('module-content-' + moduleIndex);
            const icon = content.parentElement.querySelector('.toggle-icon');
            
            if (content.classList.contains('show')) {
                content.classList.remove('show');
                icon.style.transform = 'rotate(0deg)';
            } else {
                content.classList.add('show');
                icon.style.transform = 'rotate(180deg)';
            }
        }
        
        // Show full content modal
        function showFullContent(moduleIndex) {
            const modal = document.getElementById('content-modal');
            const modalBody = document.getElementById('modal-body');
            
            // Get module content (this would be populated with actual content)
            modalBody.innerHTML = '<h2>Module ' + moduleIndex + ' - Full Content</h2><p>Full module content would be displayed here...</p>';
            
            modal.style.display = 'block';
        }
        
        // Close modal
        function closeModal() {
            document.getElementById('content-modal').style.display = 'none';
        }
        
        // Progress tracking
        function updateProgress() {
            const checkboxes = document.querySelectorAll('#progress-tab input[type="checkbox"]');
            const checked = document.querySelectorAll('#progress-tab input[type="checkbox"]:checked');
            
            const progress = (checked.length / checkboxes.length) * 100;
            
            document.getElementById('course-progress').style.width = progress + '%';
            document.getElementById('progress-text').textContent = 
                Math.round(progress) + '% Complete (' + checked.length + ' of ' + checkboxes.length + ' modules)';
        }
        
        // Load progress from localStorage
        function loadProgress() {
            const savedProgress = localStorage.getItem('courseProgress');
            if (savedProgress) {
                const progressData = JSON.parse(savedProgress);
                progressData.forEach(moduleIndex => {
                    const checkbox = document.getElementById('module-check-' + moduleIndex);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
                updateProgress();
            }
        }
        
        // Save progress to localStorage
        function saveProgress() {
            const checked = document.querySelectorAll('#progress-tab input[type="checkbox"]:checked');
            const progressData = Array.from(checked).map(cb => cb.id.split('-')[2]);
            localStorage.setItem('courseProgress', JSON.stringify(progressData));
        }
        
        // Initialize progress tracking
        document.addEventListener('DOMContentLoaded', function() {
            loadProgress();
            
            // Add event listeners to checkboxes
            const checkboxes = document.querySelectorAll('#progress-tab input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    updateProgress();
                    saveProgress();
                });
            });
        });
        
        // Close modal when clicking outside
        window.onclick = function(event) {
            const modal = document.getElementById('content-modal');
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        }
    </script>
        """