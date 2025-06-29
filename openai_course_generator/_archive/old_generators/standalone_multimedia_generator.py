#!/usr/bin/env python3
"""
Standalone Multimedia Generator for Learnfinity
Complete pipeline: Content → Script → Audio → Slides → Video → Database
All steps integrated in one file for reliability
"""

import os
import sys
import json
import logging
import tempfile
import shutil
import time
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
import uuid
import re

# External imports
import requests
from PIL import Image, ImageDraw, ImageFont
from openai import OpenAI
from supabase import create_client, Client
from enhanced_slide_generator import EnhancedSlideGenerator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
SUPABASE_URL = 'https://ujlqzkkkfatehxeqtbdl.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqbHF6a2trZmF0ZWh4ZXF0YmRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2ODA4MzIsImV4cCI6MjA1NjI1NjgzMn0.ed-wciIqkubS4f2T3UNnkgqwzLEdpC-SVZoVsP7-W1E'
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')

class StandaloneMultimediaGenerator:
    """All-in-one multimedia generation pipeline"""
    
    def __init__(self):
        """Initialize all components"""
        logger.info("🚀 Initializing Standalone Multimedia Generator...")
        
        # Initialize Supabase
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("✅ Supabase connected")
        
        # Initialize storage bucket name
        self.storage_bucket = "mm-multimedia-assets"
        self._ensure_storage_bucket()
        
        # Initialize OpenAI
        self.openai = OpenAI(api_key=OPENAI_API_KEY)
        logger.info("✅ OpenAI initialized")
        
        # Initialize enhanced slide generator
        self.slide_generator = EnhancedSlideGenerator()
        logger.info("✅ Enhanced slide generator initialized")
        
        # Keep legacy slide configuration for backward compatibility
        self.slide_width = 1920
        self.slide_height = 1080
        self.slide_bg_color = "#1a1a2e"
        self.slide_text_color = "#ffffff"
        self.slide_accent_color = "#4FFFB0"
        
        logger.info("✅ All components initialized successfully")
    
    def _ensure_storage_bucket(self):
        """Ensure storage bucket exists"""
        try:
            # Check if bucket exists
            buckets = self.supabase.storage.list_buckets()
            bucket_names = [b.name for b in buckets]
            
            if self.storage_bucket not in bucket_names:
                # Create bucket with public access for multimedia content
                self.supabase.storage.create_bucket(
                    self.storage_bucket,
                    options={
                        "public": "true",
                        "allowed_mime_types": ["audio/*", "image/*", "video/*", "application/json", "text/*"],
                        "file_size_limit": "524288000"  # 500MB limit as string
                    }
                )
                logger.info(f"✅ Created storage bucket: {self.storage_bucket}")
            else:
                logger.info(f"✅ Storage bucket exists: {self.storage_bucket}")
        except Exception as e:
            logger.warning(f"Storage bucket check/creation failed: {e}")
            logger.error(f"Bucket error details: {str(e)}")
            # Don't fail initialization, storage upload will be skipped
    
    def upload_to_storage(self, local_path: str, storage_path: str, content_type: str = None) -> Optional[str]:
        """Upload file to Supabase storage and return public URL"""
        try:
            # Read file
            with open(local_path, 'rb') as f:
                file_content = f.read()
            
            # Determine content type if not provided
            if not content_type:
                ext = Path(local_path).suffix.lower()
                content_types = {
                    '.mp3': 'audio/mpeg',
                    '.mp4': 'video/mp4',
                    '.png': 'image/png',
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.txt': 'text/plain',
                    '.json': 'application/json'
                }
                content_type = content_types.get(ext, 'application/octet-stream')
            
            # Upload to storage
            response = self.supabase.storage.from_(self.storage_bucket).upload(
                path=storage_path,
                file=file_content,
                file_options={"content-type": content_type, "upsert": "true"}
            )
            
            # Get public URL
            public_url = self.supabase.storage.from_(self.storage_bucket).get_public_url(storage_path)
            
            self.log_progress("STORAGE UPLOAD", "Success", f"{Path(local_path).name} -> {storage_path}")
            return public_url
            
        except Exception as e:
            error_msg = str(e)
            self.log_progress("STORAGE UPLOAD", "Failed", f"{Path(local_path).name}: {error_msg}")
            logger.error(f"Storage upload error details: {error_msg}")
            logger.error(f"Storage path: {storage_path}")
            logger.error(f"Content type: {content_type}")
            return None
    
    def log_progress(self, step: str, status: str, details: str = ""):
        """Real-time progress logging"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        logger.info(f"[{timestamp}] {step}: {status} {details}")
    
    def get_content_from_supabase(self, content_id: str) -> Dict[str, Any]:
        """Step 1: Retrieve content from Supabase"""
        self.log_progress("CONTENT RETRIEVAL", "Starting", f"ID: {content_id[:8]}...")
        
        try:
            response = self.supabase.table('cm_module_content').select('*').eq('content_id', content_id).execute()
            
            if not response.data:
                raise ValueError(f"No content found for ID: {content_id}")
            
            content = response.data[0]
            self.log_progress("CONTENT RETRIEVAL", "Success", f"Module: {content['module_name']}")
            return content
            
        except Exception as e:
            self.log_progress("CONTENT RETRIEVAL", "Failed", str(e))
            raise
    
    def create_multimedia_session(self, employee_context: Dict[str, Any], course_id: str, output_dir: str) -> str:
        """Step 2: Create multimedia session in database"""
        self.log_progress("SESSION CREATION", "Starting")
        
        try:
            session_data = {
                'session_id': str(uuid.uuid4()),
                'execution_id': str(uuid.uuid4()),
                'course_id': course_id,
                'employee_name': employee_context['name'],
                'employee_id': employee_context.get('id', 'emp_001'),
                'course_title': f"Personalized Course for {employee_context['name']}",
                'total_modules': 1,
                'personalization_level': 'standard',
                'status': 'processing',
                'assets_generated': 0,
                'package_ready': False,
                'output_directory': output_dir,
                'started_at': datetime.now().isoformat()
            }
            
            response = self.supabase.table('mm_multimedia_sessions').insert(session_data).execute()
            session_id = response.data[0]['session_id']
            
            self.log_progress("SESSION CREATION", "Success", f"Session: {session_id[:8]}...")
            return session_id
            
        except Exception as e:
            self.log_progress("SESSION CREATION", "Failed", str(e))
            raise
    
    def generate_personalized_script(self, content: Dict[str, Any], employee_context: Dict[str, Any]) -> str:
        """Step 3: Generate personalized script"""
        self.log_progress("SCRIPT GENERATION", "Starting")
        
        try:
            # Combine content sections
            full_content = ""
            sections = ['introduction', 'core_content', 'practical_applications', 'case_studies', 'assessments']
            
            for section in sections:
                section_content = content.get(section, '')
                if section_content:
                    full_content += f"\n\n{section.replace('_', ' ').title()}:\n{section_content}"
            
            # Create personalized script
            script = f"""
Welcome {employee_context['name']}, to your personalized training module on {content['module_name']}.

As a {employee_context.get('role', 'Professional')}, this content has been specifically tailored for your learning journey.

{full_content}

This completes your personalized training on {content['module_name']}. 
Thank you for your attention, {employee_context['name']}.
"""
            
            self.log_progress("SCRIPT GENERATION", "Success", f"{len(script)} characters")
            return script
            
        except Exception as e:
            self.log_progress("SCRIPT GENERATION", "Failed", str(e))
            raise
    
    def generate_educational_podcast_script(self, content: Dict[str, Any], employee_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate an educational 6-7 minute podcast script with proper content summarization"""
        self.log_progress("EDUCATIONAL PODCAST", "Starting")
        
        try:
            module_name = content['module_name']
            employee_name = employee_context['name']
            employee_role = employee_context.get('role', 'Professional')
            career_goal = employee_context.get('goals', 'advance your career')
            
            # Use AI to summarize content into educational segments
            self.log_progress("EDUCATIONAL PODCAST", "Summarizing content with AI")
            
            # Prepare content for AI summarization
            full_content = ""
            if content.get('introduction'):
                full_content += f"Introduction:\n{content['introduction']}\n\n"
            if content.get('core_content'):
                full_content += f"Core Content:\n{content['core_content']}\n\n"
            if content.get('practical_applications'):
                full_content += f"Practical Applications:\n{content['practical_applications']}\n\n"
            if content.get('case_studies'):
                full_content += f"Case Studies:\n{content['case_studies']}\n\n"
            
            # Create educational summary prompt
            summary_prompt = f"""
You are an expert online course instructor creating professional educational content. Create a focused 6-7 minute learning module script (EXACTLY 900-1000 words) for {employee_name}, a {employee_role} working toward becoming a {career_goal}.

Module Topic: {module_name}

Content to summarize:
{full_content[:4000]}

Create a PROFESSIONAL educational narrative with:
1. Clear learning objectives
2. Core concepts with key takeaways and data points
3. 2-3 real-world applications with specific examples
4. Key insights and best practices

CRITICAL REQUIREMENTS:
- EXACTLY 900-1000 words total (6-7 minutes at 150 words/minute)
- Professional, educational tone (like Coursera/Udemy)
- Include specific data, statistics, or metrics where relevant
- Focus on practical knowledge transfer
- No practice exercises or homework

Format your response as:
LEARNING_OBJECTIVES:
- Objective 1: [Clear, measurable learning goal]
- Objective 2: [Clear, measurable learning goal]
- Objective 3: [Clear, measurable learning goal]

CORE_CONCEPTS:
[Detailed explanation with key points, data, and examples - 400-450 words]

KEY_TAKEAWAYS:
- Takeaway 1: [Specific insight with supporting data]
- Takeaway 2: [Specific insight with supporting data]
- Takeaway 3: [Specific insight with supporting data]

REAL_WORLD_APPLICATIONS:
- Application 1: [Detailed scenario with outcomes - 100-120 words]
- Application 2: [Detailed scenario with outcomes - 100-120 words]

SUMMARY:
[Brief recap of main points - 80-100 words]

WORD_COUNT: [Total word count]
"""
            
            # Get AI summary
            response = self.openai.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "You are an expert educational content designer who creates engaging, detailed educational podcasts."},
                    {"role": "user", "content": summary_prompt}
                ],
                temperature=0.7,
                max_tokens=2500
            )
            
            ai_summary = response.choices[0].message.content
            self.log_progress("EDUCATIONAL PODCAST", "AI summary generated")
            
            # Parse AI summary
            learning_objectives = []
            core_concepts = ""
            key_takeaways = []
            real_applications = []
            summary_text = ""
            
            lines = ai_summary.split('\n')
            current_section = None
            
            for line in lines:
                line = line.strip()
                if 'LEARNING_OBJECTIVES:' in line:
                    current_section = 'objectives'
                elif 'CORE_CONCEPTS:' in line:
                    current_section = 'concepts'
                elif 'KEY_TAKEAWAYS:' in line:
                    current_section = 'takeaways'
                elif 'REAL_WORLD_APPLICATIONS:' in line:
                    current_section = 'applications'
                elif 'SUMMARY:' in line:
                    current_section = 'summary'
                elif 'WORD_COUNT:' in line:
                    current_section = None
                elif current_section == 'objectives' and line.startswith('- '):
                    learning_objectives.append(line[2:])
                elif current_section == 'concepts' and line:
                    core_concepts += line + " "
                elif current_section == 'takeaways' and line.startswith('- '):
                    key_takeaways.append(line[2:])
                elif current_section == 'applications' and line.startswith('- '):
                    real_applications.append(line[2:])
                elif current_section == 'summary' and line:
                    summary_text += line + " "
            
            # Ensure we have content
            if not core_concepts:
                core_concepts = f"Understanding and mastering {module_name} to excel in your role."
            if not learning_objectives:
                learning_objectives = [
                    f"Understand the fundamentals of {module_name}",
                    f"Apply {module_name} concepts in real-world scenarios",
                    f"Analyze and evaluate {module_name} strategies"
                ]
            if not key_takeaways:
                key_takeaways = ["Key insight about efficiency", "Important consideration for implementation", "Critical success factor"]
            if not real_applications:
                real_applications = ["Applying this in quarterly reviews", "Using this for strategic planning"]
            if not summary_text:
                summary_text = f"In this module, we've covered the essential aspects of {module_name} and how to apply them effectively."
            
            # Build educational learning module script
            podcast_script = {
                "title": f"{module_name}",
                "duration": "6-7 minutes",
                "educational_content": {
                    "learning_objectives": learning_objectives,
                    "core_concepts": core_concepts,
                    "key_takeaways": key_takeaways,
                    "applications": real_applications,
                    "summary": summary_text
                },
                "scenes": []
            }
            
            # Scene 1: Introduction & Learning Goals (0:00-0:30)
            scene1 = {
                "scene_id": 1,
                "title": "Welcome & Learning Goals",
                "timestamp": "0:00-0:30",
                "slide_content": [
                    f"Welcome, {employee_name}!",
                    f"Module: {module_name}",
                    "Learning Objectives:"
                ] + [f"• {obj}" for obj in learning_objectives[:3]],
                "narration": f"""
Welcome to your personalized learning journey, {employee_name}. In this module, we'll explore {module_name}.

As a {employee_role} working toward becoming a {career_goal}, this knowledge will be essential for your professional development.

By the end of this module, you will be able to:
{chr(10).join([f'• {obj}' for obj in learning_objectives[:3]])}

Let's begin.
"""
            }
            podcast_script["scenes"].append(scene1)
            
            # Scene 2: Why This Matters (0:30-1:00)
            scene2 = {
                "scene_id": 2,
                "title": "Why This Matters To You",
                "timestamp": "0:30-1:00",
                "slide_content": [
                    "The Impact on Your Role:",
                    f"• As a {employee_role}",
                    "• Daily applications",
                    "• Career advancement",
                    f"• Path to {career_goal}"
                ],
                "narration": f"""
Before we explore the core concepts, let's understand why {module_name.lower()} is important for your professional development.

In your role as a {employee_role}, you'll encounter situations where these skills are essential. {real_applications[0] if real_applications else 'These concepts apply directly to your daily responsibilities'}.

Understanding these concepts thoroughly will enhance your analytical capabilities and prepare you for advancement to {career_goal}.
"""
            }
            podcast_script["scenes"].append(scene2)
            
            # Scene 3: Core Concepts (1:00-3:00)
            scene3 = {
                "scene_id": 3,
                "title": "Core Concepts & Key Insights",
                "timestamp": "1:00-3:00",
                "slide_content": [
                    f"{module_name} - Key Concepts",
                    "",
                    "Essential Knowledge:"
                ] + [f"• {takeaway}" for takeaway in key_takeaways[:3]] + [
                    "",
                    "Remember: These concepts form the foundation of your expertise"
                ],
                "narration": f"""
Now let's explore the core concepts of {module_name}.

{core_concepts}

These fundamental principles are essential for your role as a {employee_role} and will serve as the foundation for more advanced concepts as you progress in your career.
"""
            }
            podcast_script["scenes"].append(scene3)
            
            # Scene 4: Real-World Applications (3:00-5:00)
            scene4 = {
                "scene_id": 4,
                "title": "Real-World Applications",
                "timestamp": "3:00-5:00",
                "slide_content": [
                    "Practical Applications in Your Role:",
                    ""
                ] + [f"• {app[:100]}..." if len(app) > 100 else f"• {app}" for app in real_applications[:3]] + [
                    "",
                    "These applications demonstrate the practical value of these concepts"
                ],
                "narration": f"""
Let's examine how these concepts apply in real-world scenarios relevant to your role as a {employee_role}.

{' '.join(real_applications[:2])}

Understanding these applications will help you immediately implement what you've learned in your current projects and responsibilities.
"""
            }
            podcast_script["scenes"].append(scene4)
            
            # Scene 5: Module Summary (5:00-6:30)
            scene5 = {
                "scene_id": 5,
                "title": "Module Summary", 
                "timestamp": "5:00-6:30",
                "slide_content": [
                    "Key Takeaways from This Module:",
                    f"✓ {learning_objectives[0] if learning_objectives else f'Mastered {module_name} fundamentals'}",
                    f"✓ {learning_objectives[1] if len(learning_objectives) > 1 else 'Understood practical applications'}",
                    f"✓ {learning_objectives[2] if len(learning_objectives) > 2 else 'Prepared for advanced concepts'}",
                    "",
                    "Continue your learning journey with the next module"
                ],
                "narration": f"""
Let's summarize what we've covered in this module.

{summary_text}

You've now gained essential knowledge in {module_name} that will serve as a foundation for your continued professional development as you work toward becoming a {career_goal}.

Remember to apply these concepts in your daily work as a {employee_role}. Practical application is key to mastering these skills.

Thank you for completing this module. Continue to the next module when you're ready to expand your knowledge further.
"""
            }
            podcast_script["scenes"].append(scene5)
            
            # Combine all narrations
            full_narration = "\n".join([scene['narration'] for scene in podcast_script['scenes']])
            podcast_script['full_script'] = full_narration
            podcast_script['word_count'] = len(full_narration.split())
            # More accurate duration calculation
            duration_minutes = podcast_script['word_count'] / 150
            podcast_script['estimated_duration'] = f"{duration_minutes:.1f} minutes"
            podcast_script['duration'] = f"{int(duration_minutes)}-{int(duration_minutes)+1} minutes"
            
            self.log_progress("EDUCATIONAL PODCAST", "Success", f"{podcast_script['word_count']} words, ~{podcast_script['estimated_duration']}")
            return podcast_script
            
        except Exception as e:
            self.log_progress("EDUCATIONAL PODCAST", "Failed", str(e))
            # Fallback to original method
            return self.generate_podcast_script(content, employee_context)
    
    def generate_podcast_script(self, content: Dict[str, Any], employee_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a 6-7 minute podcast-style script with scene navigation"""
        self.log_progress("PODCAST SCRIPT", "Starting")
        
        try:
            module_name = content['module_name']
            employee_name = employee_context['name']
            employee_role = employee_context.get('role', 'Professional')
            career_goal = employee_context.get('goals', 'advance your career')
            
            # Extract key concepts from content
            intro_text = content.get('introduction', '')[:500]
            core_content = content.get('core_content', '')
            practical_apps = content.get('practical_applications', '')
            
            # Extract 3-4 key concepts
            key_concepts = []
            if core_content:
                sentences = re.split(r'[.!?]\s+', core_content)
                # Find sentences with key indicators
                for sent in sentences:
                    if any(indicator in sent.lower() for indicator in ['important', 'key', 'essential', 'fundamental', 'critical', 'must']):
                        key_concepts.append(sent.strip())
                        if len(key_concepts) >= 3:
                            break
            
            # Extract practical examples
            practical_examples = []
            if practical_apps:
                examples = re.split(r'[.!?]\s+', practical_apps)
                practical_examples = [ex.strip() for ex in examples[:2] if len(ex.strip()) > 20]
            
            # Build podcast script with scenes
            podcast_script = {
                "title": f"Personalized Learning Podcast: {module_name}",
                "duration": "6-7 minutes",
                "scenes": []
            }
            
            # Scene 1: Introduction (0:00-0:45)
            scene1 = {
                "scene_id": 1,
                "title": "Introduction",
                "timestamp": "0:00-0:45",
                "narration": f"""
[Upbeat intro music fades in and out]

Welcome to your personalized learning podcast! I'm your AI learning companion, and today we have something special just for you, {employee_name}.

As a {employee_role}, you're on an exciting journey to {career_goal}, and this episode is tailored specifically to help you get there.

In the next 6 minutes, we're diving into {module_name} - a topic that's absolutely crucial for your professional development.

Here's what makes this episode special: Every concept, every example, has been carefully selected based on your current role and where you want to be. So grab your favorite beverage, find a comfortable spot, and let's transform your expertise together!
"""
            }
            podcast_script["scenes"].append(scene1)
            
            # Scene 2: Learning Objectives (0:45-1:30)
            scene2 = {
                "scene_id": 2,
                "title": "Today's Learning Journey",
                "timestamp": "0:45-1:30",
                "narration": f"""
[Transition sound]

So {employee_name}, here's what we're going to discover today:

First, we'll unpack the fundamental concepts of {module_name.lower()} that every {employee_role} needs to master.

Then, I'll share some real-world scenarios that you'll likely encounter in your day-to-day work.

And finally, we'll explore practical strategies you can implement immediately - I'm talking about actionable insights you can use in your next meeting or project.

The best part? Everything we discuss today directly supports your goal to {career_goal}. Ready? Let's dive in!
"""
            }
            podcast_script["scenes"].append(scene2)
            
            # Scene 3: Core Concept Exploration (1:30-3:30)
            concept_narration = f"""
[Soft background music begins]

Let's start with the foundation. {module_name} isn't just another business concept - it's a game-changer for professionals like you.

"""
            
            if key_concepts:
                concept_narration += f"""
Here's the first key insight: {key_concepts[0] if key_concepts else 'Understanding the fundamentals is crucial.'}

Think about that for a moment. In your role as {employee_role}, this means you'll be able to make more informed decisions and contribute at a higher level.

"""
                if len(key_concepts) > 1:
                    concept_narration += f"""
But here's where it gets really interesting: {key_concepts[1]}

This is particularly relevant for you because as you progress toward {career_goal}, mastering this concept will set you apart from your peers.
"""
            
            scene3 = {
                "scene_id": 3,
                "title": "Core Concepts Deep Dive",
                "timestamp": "1:30-3:30",
                "narration": concept_narration
            }
            podcast_script["scenes"].append(scene3)
            
            # Scene 4: Practical Application (3:30-5:00)
            practical_narration = f"""
[Transition to energetic tone]

Now, let's talk about how this applies to YOUR work, {employee_name}. Theory is great, but implementation is where the magic happens.

"""
            
            if practical_examples:
                practical_narration += f"""
Picture this scenario: {practical_examples[0]}

As a {employee_role}, you might face this situation regularly. By applying what we've discussed, you can approach it with confidence and expertise.

"""
                if len(practical_examples) > 1:
                    practical_narration += f"""
Here's another real-world example: {practical_examples[1]}

This is exactly the kind of challenge that separates good {employee_role}s from great ones. And you're on your way to being one of the great ones!
"""
            
            scene4 = {
                "scene_id": 4,
                "title": "Real-World Applications",
                "timestamp": "3:30-5:00",
                "narration": practical_narration
            }
            podcast_script["scenes"].append(scene4)
            
            # Scene 5: Key Takeaways (5:00-6:00)
            scene5 = {
                "scene_id": 5,
                "title": "Your Action Plan",
                "timestamp": "5:00-6:00",
                "narration": f"""
[Music builds slightly]

Alright {employee_name}, let's wrap this up with your personalized action plan.

First, remember that mastering {module_name.lower()} is a journey, not a destination. Every day you apply these concepts, you're moving closer to {career_goal}.

Here are three things you can do right now:

One: Take a moment after this podcast to identify one area in your current projects where you can apply these concepts.

Two: Share one insight from today with a colleague - teaching others reinforces your own learning.

Three: Set a reminder to revisit these concepts in a week and reflect on how you've used them.

Remember, you're not just learning - you're transforming your professional capabilities. As a {employee_role} with big ambitions, you're exactly where you need to be.
"""
            }
            podcast_script["scenes"].append(scene5)
            
            # Scene 6: Closing (6:00-6:30)
            scene6 = {
                "scene_id": 6,
                "title": "Closing & Next Steps",
                "timestamp": "6:00-6:30",
                "narration": f"""
[Closing music begins]

And that's a wrap on today's personalized learning podcast, {employee_name}!

You've just invested 6 minutes in your professional development, and that investment will pay dividends as you continue your journey to {career_goal}.

This podcast was created specifically for you by Learnfinity's AI learning system. Until next time, keep learning, keep growing, and keep pushing toward your goals.

This is your AI learning companion, signing off. Remember - your potential is limitless!

[Music fades out]
"""
            }
            podcast_script["scenes"].append(scene6)
            
            # Combine all narrations into single script
            full_narration = "\n".join([scene['narration'] for scene in podcast_script['scenes']])
            podcast_script['full_script'] = full_narration
            podcast_script['word_count'] = len(full_narration.split())
            podcast_script['estimated_duration'] = f"{podcast_script['word_count'] / 150:.1f} minutes"  # 150 words per minute average
            
            self.log_progress("PODCAST SCRIPT", "Success", f"{podcast_script['word_count']} words, ~{podcast_script['estimated_duration']}")
            return podcast_script
            
        except Exception as e:
            self.log_progress("PODCAST SCRIPT", "Failed", str(e))
            raise
    
    def generate_audio_direct(self, script: str, output_path: str) -> bool:
        """Step 4: Generate audio using direct OpenAI TTS"""
        self.log_progress("AUDIO GENERATION", "Starting", f"{len(script)} characters")
        
        try:
            # Split script into chunks if needed (OpenAI limit: 4096 chars)
            max_chars = 4000
            chunks = []
            
            if len(script) <= max_chars:
                chunks = [script]
            else:
                # Smart splitting by sentences
                sentences = re.split(r'(?<=[.!?])\s+', script)
                current_chunk = ""
                
                for sentence in sentences:
                    if len(current_chunk + sentence) <= max_chars:
                        current_chunk += sentence + " "
                    else:
                        if current_chunk:
                            chunks.append(current_chunk.strip())
                        current_chunk = sentence + " "
                
                if current_chunk:
                    chunks.append(current_chunk.strip())
            
            self.log_progress("AUDIO GENERATION", "Progress", f"Split into {len(chunks)} chunks")
            
            # Generate audio for each chunk
            temp_files = []
            for i, chunk in enumerate(chunks, 1):
                self.log_progress("AUDIO GENERATION", f"Chunk {i}/{len(chunks)}", f"{len(chunk)} chars")
                
                response = self.openai.audio.speech.create(
                    model="tts-1-hd",
                    voice="alloy",
                    input=chunk,
                    speed=1.0
                )
                
                temp_file = f"{output_path}.part{i}.mp3"
                
                # Write audio content immediately using read()
                start_write = time.time()
                with open(temp_file, 'wb') as f:
                    f.write(response.read())
                write_time = time.time() - start_write
                self.log_progress("AUDIO GENERATION", f"Chunk {i}/{len(chunks)} written", f"{write_time:.1f}s")
                
                temp_files.append(temp_file)
                
                self.log_progress("AUDIO GENERATION", f"Chunk {i}/{len(chunks)}", "Complete")
            
            # Combine audio files
            if len(temp_files) == 1:
                shutil.move(temp_files[0], output_path)
            else:
                self.log_progress("AUDIO GENERATION", "Combining", f"{len(temp_files)} files")
                
                with open(output_path, 'wb') as outfile:
                    for temp_file in temp_files:
                        with open(temp_file, 'rb') as infile:
                            outfile.write(infile.read())
                        os.remove(temp_file)
            
            file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
            self.log_progress("AUDIO GENERATION", "Success", f"{file_size_mb:.1f} MB")
            return True
            
        except Exception as e:
            self.log_progress("AUDIO GENERATION", "Failed", str(e))
            return False
    
    def generate_educational_slide(self, title: str, content: list, slide_type: str, output_path: str) -> bool:
        """Generate an educational slide with proper content layout"""
        self.log_progress("EDU SLIDE", f"Creating {slide_type}", title[:30])
        
        try:
            # Create base image with gradient background
            img = Image.new('RGB', (self.slide_width, self.slide_height), self.slide_bg_color)
            
            # Create gradient background
            for y in range(self.slide_height):
                # Gradient from dark to slightly lighter
                gradient_value = int(26 + (y / self.slide_height) * 20)
                for x in range(self.slide_width):
                    img.putpixel((x, y), (gradient_value, gradient_value, gradient_value + 20))
            
            draw = ImageDraw.Draw(img)
            
            # Load fonts with different sizes
            try:
                title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 56)
                content_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 32)
                small_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
            except:
                # Create better default fonts
                from PIL import ImageFont
                title_font = ImageFont.load_default()
                content_font = ImageFont.load_default()
                small_font = ImageFont.load_default()
            
            # Add header bar
            draw.rectangle([(0, 0), (self.slide_width, 120)], fill="#2C3E50")
            
            # Draw title
            draw.text((60, 35), title, font=title_font, fill="#FFFFFF")
            
            # Add accent line
            draw.rectangle([(60, 110), (self.slide_width - 60, 114)], fill=self.slide_accent_color)
            
            # Draw content with proper spacing
            y_pos = 180
            
            if isinstance(content, list):
                for i, item in enumerate(content):
                    if item == "":  # Empty line for spacing
                        y_pos += 40
                    elif item.startswith("•"):  # Bullet point
                        # Draw bullet
                        draw.ellipse([(80, y_pos + 10), (90, y_pos + 20)], fill=self.slide_accent_color)
                        # Draw text
                        draw.text((110, y_pos), item[1:].strip(), font=content_font, fill="#FFFFFF")
                        y_pos += 50
                    elif item.startswith("✓"):  # Checkmark item
                        # Draw checkmark in accent color
                        draw.text((80, y_pos), "✓", font=content_font, fill=self.slide_accent_color)
                        # Draw text
                        draw.text((110, y_pos), item[1:].strip(), font=content_font, fill="#FFFFFF")
                        y_pos += 50
                    elif ":" in item and i == 0:  # Section header
                        draw.text((60, y_pos), item, font=content_font, fill=self.slide_accent_color)
                        y_pos += 60
                    else:  # Regular text
                        # Word wrap for long text
                        words = item.split()
                        line = ""
                        line_width = 0
                        max_width = self.slide_width - 120
                        
                        for word in words:
                            test_line = line + word + " "
                            # Approximate width calculation
                            test_width = len(test_line) * 20
                            
                            if test_width > max_width and line:
                                draw.text((60, y_pos), line.strip(), font=content_font, fill="#FFFFFF")
                                y_pos += 45
                                line = word + " "
                            else:
                                line = test_line
                        
                        if line:
                            draw.text((60, y_pos), line.strip(), font=content_font, fill="#FFFFFF")
                            y_pos += 50
            
            # Add footer with page indicator
            if slide_type == "content":
                draw.rectangle([(0, self.slide_height - 80), (self.slide_width, self.slide_height)], fill="#2C3E50")
                draw.text((60, self.slide_height - 55), "Learnfinity Educational Podcast", font=small_font, fill="#FFFFFF")
            
            # Save slide
            img.save(output_path, "PNG", quality=95)
            
            file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
            self.log_progress("EDU SLIDE", "Success", f"{file_size_mb:.1f} MB")
            return True
            
        except Exception as e:
            self.log_progress("EDU SLIDE", "Failed", str(e))
            return False
    
    def generate_slide(self, title: str, content: str, slide_type: str, output_path: str) -> bool:
        """Generate a single slide using enhanced slide generator"""
        self.log_progress("SLIDE GENERATION", f"Creating {slide_type}", title[:30])
        
        try:
            # Use the enhanced slide generator for professional templates
            if hasattr(self, 'slide_generator') and self.slide_generator:
                # Prepare content for enhanced generator
                if isinstance(content, str):
                    # Convert string content to list for bullet points
                    if '\n' in content:
                        content_list = [line.strip() for line in content.split('\n') if line.strip()]
                    else:
                        content_list = [content]
                else:
                    content_list = content if isinstance(content, list) else [str(content)]
                
                # Create slide using enhanced generator with specific templates
                if slide_type == "title":
                    slide_img = self.slide_generator.create_title_slide(
                        title=title,
                        subtitle=content_list[0] if content_list else "",
                        slide_number=1
                    )
                elif slide_type == "objectives":
                    slide_img = self.slide_generator.create_learning_objectives_slide(
                        objectives=content_list,
                        slide_number=2,
                        total_slides=9
                    )
                elif slide_type == "case_study":
                    slide_img = self.slide_generator.create_case_study_slide(
                        case_content=content_list,
                        slide_number=7,
                        total_slides=9
                    )
                elif slide_type == "summary":
                    slide_img = self.slide_generator.create_summary_slide(
                        takeaways=content_list,
                        slide_number=8,
                        total_slides=9
                    )
                else:
                    # Default content slide for other types
                    slide_img = self.slide_generator.create_content_slide(
                        title=title,
                        content=content_list,
                        slide_number=1,
                        total_slides=9
                    )
                
                # Save the slide
                slide_img.save(output_path, "PNG", quality=95)
                
                file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
                self.log_progress("SLIDE GENERATION", "Success", f"{file_size_mb:.1f} MB")
                return True
                
            else:
                # Fallback to simple slide generation if enhanced generator not available
                self.log_progress("SLIDE GENERATION", "Fallback", "Using simple generator")
                
                # Create base image with gradient background
                img = Image.new('RGB', (self.slide_width, self.slide_height), self.slide_bg_color)
                
                # Create simple gradient background
                for y in range(self.slide_height):
                    gradient_value = int(26 + (y / self.slide_height) * 20)
                    for x in range(self.slide_width):
                        img.putpixel((x, y), (gradient_value, gradient_value, gradient_value + 20))
                
                draw = ImageDraw.Draw(img)
            
            # Add text content for fallback
            try:
                # Try to load system fonts
                if slide_type == "title":
                    title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 72)
                    subtitle_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 48)
                else:
                    title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 64)
                    subtitle_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 36)
            except:
                # Fallback to default font
                title_font = ImageFont.load_default()
                subtitle_font = ImageFont.load_default()
            
            # Draw content based on slide type
            if slide_type == "title":
                # Title slide layout
                draw.text((60, 300), title, font=title_font, fill=self.slide_text_color)
                if content:
                    draw.text((60, 450), content, font=subtitle_font, fill=self.slide_accent_color)
                
                # Add decorative elements
                draw.rectangle([(60, 600), (800, 615)], fill=self.slide_accent_color)
                
            else:
                # Content slide layout
                draw.text((60, 100), title, font=title_font, fill=self.slide_text_color)
                
                # Add content as bullet points
                y_pos = 250
                if isinstance(content, list):
                    for point in content[:5]:  # Max 5 points
                        draw.text((100, y_pos), f"• {point}", font=subtitle_font, fill=self.slide_text_color)
                        y_pos += 80
                else:
                    # Single text block
                    draw.text((100, y_pos), content[:300], font=subtitle_font, fill=self.slide_text_color)
            
            # Save slide
            img.save(output_path, "PNG", quality=95)
            
            file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
            self.log_progress("SLIDE GENERATION", "Success", f"{file_size_mb:.1f} MB")
            return True
            
        except Exception as e:
            self.log_progress("SLIDE GENERATION", "Failed", str(e))
            return False
    
    def generate_educational_podcast_slides(self, podcast_data: Dict[str, Any], employee_context: Dict[str, Any], output_dir: Path) -> List[Path]:
        """Generate educational slides synchronized with podcast scenes"""
        self.log_progress("EDU PODCAST SLIDES", "Starting")
        
        slides_dir = output_dir / "slides"
        slides_dir.mkdir(exist_ok=True)
        
        slide_files = []
        
        # Generate slide for each scene
        for i, scene in enumerate(podcast_data['scenes']):
            slide_num = i + 1
            slide_path = slides_dir / f"slide_{slide_num:02d}_{scene['title'].lower().replace(' ', '_').replace('&', 'and')}.png"
            
            # Use slide_content if available (from educational script)
            if 'slide_content' in scene:
                content = scene['slide_content']
            else:
                # Fallback to extracting from narration
                content = [scene['title']]
                narration_lines = scene['narration'].split('\n')
                for line in narration_lines[:5]:
                    line = line.strip()
                    if line and not line.startswith('[') and len(line) > 20:
                        content.append(f"• {line[:80]}...")
            
            # Determine slide type
            slide_type = "title" if scene['scene_id'] in [1, 7] else "content"
            
            if self.generate_educational_slide(
                title=scene['title'],
                content=content,
                slide_type=slide_type,
                output_path=str(slide_path)
            ):
                slide_files.append(slide_path)
                self.log_progress("EDU PODCAST SLIDES", f"Scene {scene['scene_id']}", f"Slide created for {scene['timestamp']}")
        
        self.log_progress("EDU PODCAST SLIDES", "Complete", f"{len(slide_files)} educational slides created")
        return slide_files
    
    def generate_podcast_slides(self, podcast_data: Dict[str, Any], employee_context: Dict[str, Any], output_dir: Path) -> List[Path]:
        """Generate slides for podcast scenes"""
        # Use educational slides if available
        if 'educational_content' in podcast_data:
            return self.generate_educational_podcast_slides(podcast_data, employee_context, output_dir)
        
        self.log_progress("PODCAST SLIDES", "Starting")
        
        slides_dir = output_dir / "slides"
        slides_dir.mkdir(exist_ok=True)
        
        slide_files = []
        
        # Title slide
        title_path = slides_dir / "slide_01_title.png"
        if self.generate_slide(
            title=podcast_data['title'].replace("Personalized Learning Podcast: ", ""),
            content=f"A Personalized Podcast for {employee_context['name']}",
            slide_type="title",
            output_path=str(title_path)
        ):
            slide_files.append(title_path)
        
        # Scene slides
        for i, scene in enumerate(podcast_data['scenes'], 1):
            if scene['scene_id'] in [1, 6]:  # Skip intro and outro scenes
                continue
                
            # Extract key points from narration
            narration_lines = scene['narration'].split('\n')
            key_points = []
            
            for line in narration_lines:
                line = line.strip()
                if line and not line.startswith('[') and len(line) > 20:
                    # Extract sentences that look like key points
                    if any(marker in line for marker in ['First,', 'One:', 'Two:', 'Three:', 'Here\'s', 'Picture this']):
                        key_points.append(line[:100] + "..." if len(line) > 100 else line)
                        if len(key_points) >= 3:
                            break
            
            slide_path = slides_dir / f"slide_{i+1:02d}_{scene['title'].lower().replace(' ', '_')}.png"
            if self.generate_slide(
                title=scene['title'],
                content=key_points if key_points else scene['narration'][:200],
                slide_type="content",
                output_path=str(slide_path)
            ):
                slide_files.append(slide_path)
        
        # Summary slide
        summary_path = slides_dir / f"slide_{len(slide_files)+1:02d}_summary.png"
        if self.generate_slide(
            title="Your Learning Journey Continues",
            content=f"Keep growing, {employee_context['name']}!",
            slide_type="title",
            output_path=str(summary_path)
        ):
            slide_files.append(summary_path)
        
        self.log_progress("PODCAST SLIDES", "Complete", f"{len(slide_files)} slides created")
        return slide_files
    
    def generate_all_slides(self, content: Dict[str, Any], employee_context: Dict[str, Any], output_dir: Path) -> List[Path]:
        """Step 5: Generate all slides for the module"""
        self.log_progress("SLIDES GENERATION", "Starting")
        
        slides_dir = output_dir / "slides"
        slides_dir.mkdir(exist_ok=True)
        
        slide_files = []
        
        # Title slide
        title_path = slides_dir / "slide_01_title.png"
        if self.generate_slide(
            title=content['module_name'],
            content=f"Personalized Training for {employee_context['name']}",
            slide_type="title",
            output_path=str(title_path)
        ):
            slide_files.append(title_path)
        
        # Content slides for each section
        sections = ['introduction', 'core_content', 'practical_applications', 'case_studies']
        
        for i, section in enumerate(sections, 2):
            if section in content and content[section]:
                section_title = section.replace('_', ' ').title()
                
                # Extract key points
                section_text = content[section]
                sentences = re.split(r'[.!?]\s+', section_text)
                points = [s.strip() for s in sentences[:4] if s.strip()]
                
                slide_path = slides_dir / f"slide_{i:02d}_{section}.png"
                if self.generate_slide(
                    title=section_title,
                    content=points,
                    slide_type="content",
                    output_path=str(slide_path)
                ):
                    slide_files.append(slide_path)
        
        # Summary slide
        summary_path = slides_dir / f"slide_{len(sections)+2:02d}_summary.png"
        if self.generate_slide(
            title="Module Complete",
            content=f"Thank you, {employee_context['name']}!",
            slide_type="title",
            output_path=str(summary_path)
        ):
            slide_files.append(summary_path)
        
        self.log_progress("SLIDES GENERATION", "Complete", f"{len(slide_files)} slides created")
        return slide_files
    
    def calculate_scene_timings(self, podcast_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Calculate exact timings for each scene based on timestamps"""
        timings = []
        
        for scene in podcast_data['scenes']:
            # Parse timestamp like "0:00-0:45"
            timestamp = scene['timestamp']
            if '-' in timestamp:
                start_str, end_str = timestamp.split('-')
                
                # Convert to seconds
                start_parts = start_str.strip().split(':')
                start_seconds = int(start_parts[0]) * 60 + int(start_parts[1])
                
                end_parts = end_str.strip().split(':')
                end_seconds = int(end_parts[0]) * 60 + int(end_parts[1])
                
                duration = end_seconds - start_seconds
                
                timings.append({
                    'scene_id': scene['scene_id'],
                    'title': scene['title'],
                    'start': start_seconds,
                    'end': end_seconds,
                    'duration': duration
                })
        
        return timings
    
    def get_audio_duration(self, audio_file: Path) -> float:
        """Get actual audio duration using ffprobe"""
        try:
            cmd = [
                'ffprobe', '-v', 'error', '-show_entries', 
                'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1',
                str(audio_file)
            ]
            result = subprocess.run(cmd, capture_output=True, text=True)
            return float(result.stdout.strip())
        except:
            # Fallback to estimation
            audio_size_mb = audio_file.stat().st_size / (1024 * 1024)
            return audio_size_mb * 60  # ~1 minute per MB
    
    def generate_video_from_assets(self, audio_file: Path, slide_files: List[Path], 
                                   scene_timings: List[Dict[str, Any]], output_path: Path) -> bool:
        """Generate video by combining audio and slides with proper timing"""
        self.log_progress("VIDEO GENERATION", "Starting")
        
        try:
            # Create a temporary directory for video segments
            temp_dir = Path(tempfile.mkdtemp())
            
            # Get audio duration
            audio_duration = self.get_audio_duration(audio_file)
            self.log_progress("VIDEO GENERATION", "Audio duration", f"{audio_duration:.1f}s")
            
            # Create video segments for each slide with proper duration
            video_segments = []
            
            # Map slides to scenes (skip intro/outro slides)
            slide_index = 0
            for i, timing in enumerate(scene_timings):
                if slide_index < len(slide_files):
                    slide_file = slide_files[slide_index]
                    duration = timing['duration']
                    
                    # Create video segment from slide
                    segment_path = temp_dir / f"segment_{i:02d}.mp4"
                    
                    # FFmpeg command to create video from image with duration
                    cmd = [
                        'ffmpeg', '-y', '-loop', '1', '-i', str(slide_file),
                        '-c:v', 'libx264', '-t', str(duration), '-pix_fmt', 'yuv420p',
                        '-vf', 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2',
                        str(segment_path)
                    ]
                    
                    subprocess.run(cmd, capture_output=True, check=True)
                    video_segments.append(str(segment_path))
                    self.log_progress("VIDEO GENERATION", f"Segment {i+1}", f"{duration}s")
                    
                    # Move to next slide for non-intro/outro scenes
                    if timing['scene_id'] not in [1, 6]:
                        slide_index += 1
            
            # Create concat file for FFmpeg
            concat_file = temp_dir / "concat.txt"
            with open(concat_file, 'w') as f:
                for segment in video_segments:
                    f.write(f"file '{segment}'\n")
            
            # Concatenate all video segments
            concatenated_video = temp_dir / "concatenated.mp4"
            cmd = [
                'ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', str(concat_file),
                '-c', 'copy', str(concatenated_video)
            ]
            subprocess.run(cmd, capture_output=True, check=True)
            
            # Add audio to the video
            self.log_progress("VIDEO GENERATION", "Adding audio")
            cmd = [
                'ffmpeg', '-y', '-i', str(concatenated_video), '-i', str(audio_file),
                '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
                '-map', '0:v:0', '-map', '1:a:0',  # Explicitly map video and audio streams
                '-shortest', str(output_path)
            ]
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode != 0:
                self.log_progress("VIDEO GENERATION", "FFmpeg error", result.stderr[:200])
                raise subprocess.CalledProcessError(result.returncode, cmd)
            
            # Clean up temp directory
            shutil.rmtree(temp_dir)
            
            # Verify output
            if output_path.exists():
                file_size_mb = output_path.stat().st_size / (1024 * 1024)
                self.log_progress("VIDEO GENERATION", "Success", f"{file_size_mb:.1f} MB")
                return True
            else:
                self.log_progress("VIDEO GENERATION", "Failed", "Output file not created")
                return False
                
        except subprocess.CalledProcessError as e:
            self.log_progress("VIDEO GENERATION", "FFmpeg error", str(e))
            return False
        except Exception as e:
            self.log_progress("VIDEO GENERATION", "Failed", str(e))
            return False
    
    def create_video_package(self, audio_file: Path, slide_files: List[Path], output_dir: Path) -> Dict[str, Any]:
        """Step 6: Create video package information"""
        self.log_progress("VIDEO PACKAGE", "Creating")
        
        video_dir = output_dir / "video"
        video_dir.mkdir(exist_ok=True)
        
        # Calculate audio duration (approximate based on file size)
        audio_size_mb = audio_file.stat().st_size / (1024 * 1024)
        estimated_duration_seconds = int(audio_size_mb * 60)  # ~1 minute per MB for speech
        
        video_info = {
            "status": "ready_for_video_generation",
            "audio_file": str(audio_file),
            "audio_duration_seconds": estimated_duration_seconds,
            "slide_files": [str(f) for f in slide_files],
            "slide_count": len(slide_files),
            "output_format": "mp4",
            "resolution": "1920x1080",
            "fps": 30,
            "created_at": datetime.now().isoformat()
        }
        
        # Save video info
        video_info_path = video_dir / "video_info.json"
        with open(video_info_path, 'w') as f:
            json.dump(video_info, f, indent=2)
        
        self.log_progress("VIDEO PACKAGE", "Success", f"Info saved to {video_info_path.name}")
        return video_info
    
    def upload_multimedia_to_storage(self, session_id: str, content_id: str, 
                                    employee_name: str, module_name: str, 
                                    results: Dict[str, Any]) -> Dict[str, Any]:
        """Upload all generated files to Supabase storage"""
        self.log_progress("STORAGE UPLOAD", "Starting", "Uploading multimedia files")
        
        storage_urls = {
            'script': None,
            'scenes': None,
            'audio': None,
            'slides': [],
            'video': None
        }
        
        # Create storage path structure
        base_path = f"mm_{content_id[:8]}/{employee_name}/{module_name}"
        
        try:
            # Upload script file
            if results.get('script_file'):
                script_storage_path = f"{base_path}/script/podcast_script.txt"
                script_url = self.upload_to_storage(results['script_file'], script_storage_path)
                if script_url:
                    storage_urls['script'] = script_url
            
            # Upload scenes JSON
            scenes_file = Path(results.get('output_directory', '')) / "podcast_scenes.json"
            if scenes_file.exists():
                scenes_storage_path = f"{base_path}/script/podcast_scenes.json"
                scenes_url = self.upload_to_storage(str(scenes_file), scenes_storage_path)
                if scenes_url:
                    storage_urls['scenes'] = scenes_url
            
            # Upload audio file
            if results.get('audio_file'):
                audio_storage_path = f"{base_path}/audio/narration.mp3"
                audio_url = self.upload_to_storage(results['audio_file'], audio_storage_path)
                if audio_url:
                    storage_urls['audio'] = audio_url
            
            # Upload slide files
            for i, slide_file in enumerate(results.get('slide_files', [])):
                slide_name = Path(slide_file).name
                slide_storage_path = f"{base_path}/slides/{slide_name}"
                slide_url = self.upload_to_storage(slide_file, slide_storage_path)
                if slide_url:
                    storage_urls['slides'].append({
                        'file_name': slide_name,
                        'url': slide_url,
                        'order': i + 1
                    })
            
            # Upload video file
            if results.get('video_file'):
                video_name = Path(results['video_file']).name
                video_storage_path = f"{base_path}/video/{video_name}"
                video_url = self.upload_to_storage(results['video_file'], video_storage_path)
                if video_url:
                    storage_urls['video'] = video_url
            
            self.log_progress("STORAGE UPLOAD", "Complete", 
                            f"Uploaded: Script={bool(storage_urls['script'])}, "
                            f"Audio={bool(storage_urls['audio'])}, "
                            f"Slides={len(storage_urls['slides'])}, "
                            f"Video={bool(storage_urls['video'])}")
            
        except Exception as e:
            self.log_progress("STORAGE UPLOAD", "Failed", str(e))
            
        return storage_urls
    
    def update_database_records(self, session_id: str, content_id: str, results: Dict[str, Any]) -> None:
        """Step 7: Update all database records"""
        self.log_progress("DATABASE UPDATE", "Starting")
        
        try:
            # Register script generation
            if results.get('script_saved'):
                script_data = {
                    'script_id': str(uuid.uuid4()),
                    'session_id': session_id,
                    'content_id': content_id,
                    'course_id': results['course_id'],
                    'module_name': results['module_name'],
                    'script_type': 'full_module',  # Changed from 'podcast' to match enum
                    'script_purpose': 'narration',
                    'source_content': results.get('original_content', 'Content from Supabase module'),  # Add required field
                    'generated_script': results.get('script_content', ''),
                    'employee_context': results.get('employee_context', {}),
                    'personalization_level': 'standard',
                    'script_word_count': results.get('podcast_data', {}).get('word_count', 0),
                    'estimated_duration_minutes': 6.5,  # Fixed duration for 6-7 minute module
                    'script_storage_url': results.get('storage_urls', {}).get('script'),
                    'scenes_storage_url': results.get('storage_urls', {}).get('scenes'),
                    'status': 'completed',
                    'approved_for_audio': True
                }
                
                self.supabase.table('mm_script_generations').insert(script_data).execute()
                self.log_progress("DATABASE UPDATE", "Script", "Registered")
            
            # Register audio asset
            if results.get('audio_created'):
                audio_data = {
                    'asset_id': str(uuid.uuid4()),
                    'session_id': session_id,
                    'content_id': content_id,
                    'course_id': results['course_id'],
                    'module_name': results['module_name'],
                    'asset_type': 'audio',
                    'asset_category': 'module_complete',
                    'file_path': results['audio_file'],
                    'file_name': Path(results['audio_file']).name,
                    'file_format': 'mp3',
                    'storage_url': results.get('storage_urls', {}).get('audio'),
                    'storage_path': f"mm_{content_id[:8]}/{results.get('employee_context', {}).get('name', 'unknown')}/{results['module_name']}/audio/narration.mp3" if results.get('storage_urls', {}).get('audio') else None,
                    'status': 'completed',
                    'ready_for_delivery': True
                }
                self.supabase.table('mm_multimedia_assets').insert(audio_data).execute()
                self.log_progress("DATABASE UPDATE", "Audio", "Registered")
            
            # Register slide assets
            slide_urls = results.get('storage_urls', {}).get('slides', [])
            for i, slide_file in enumerate(results.get('slide_files', [])):
                # Find matching storage URL
                slide_name = Path(slide_file).name
                slide_url = None
                for slide_info in slide_urls:
                    if slide_info['file_name'] == slide_name:
                        slide_url = slide_info['url']
                        break
                
                slide_data = {
                    'asset_id': str(uuid.uuid4()),
                    'session_id': session_id,
                    'content_id': content_id,
                    'course_id': results['course_id'],
                    'module_name': results['module_name'],
                    'asset_type': 'image',
                    'asset_category': 'module_complete',
                    'file_path': slide_file,
                    'file_name': slide_name,
                    'file_format': 'png',
                    'storage_url': slide_url,
                    'storage_path': f"mm_{content_id[:8]}/{results.get('employee_context', {}).get('name', 'unknown')}/{results['module_name']}/slides/{slide_name}" if slide_url else None,
                    'status': 'completed',
                    'ready_for_delivery': True
                }
                self.supabase.table('mm_multimedia_assets').insert(slide_data).execute()
            
            self.log_progress("DATABASE UPDATE", "Slides", f"{len(results.get('slide_files', []))} registered")
            
            # Register video asset
            if results.get('video_created') and results.get('video_file'):
                video_data = {
                    'asset_id': str(uuid.uuid4()),
                    'session_id': session_id,
                    'content_id': content_id,
                    'course_id': results['course_id'],
                    'module_name': results['module_name'],
                    'asset_type': 'video',
                    'asset_category': 'module_complete',
                    'file_path': results['video_file'],
                    'file_name': Path(results['video_file']).name,
                    'file_format': 'mp4',
                    'storage_url': results.get('storage_urls', {}).get('video'),
                    'storage_path': f"mm_{content_id[:8]}/{results.get('employee_context', {}).get('name', 'unknown')}/{results['module_name']}/video/{Path(results['video_file']).name}" if results.get('storage_urls', {}).get('video') else None,
                    'status': 'completed',
                    'ready_for_delivery': True
                }
                
                # Add video metadata (commented out until column is added)
                # TODO: Uncomment when metadata column is added to database
                # if results.get('video_info'):
                #     video_data['metadata'] = {
                #         'duration_seconds': results['video_info'].get('audio_duration_seconds'),
                #         'resolution': results['video_info'].get('resolution'),
                #         'fps': results['video_info'].get('fps')
                #     }
                
                self.supabase.table('mm_multimedia_assets').insert(video_data).execute()
                self.log_progress("DATABASE UPDATE", "Video", "Registered")
            
            # Update session status
            assets_count = 1  # script
            if results.get('audio_created'):
                assets_count += 1
            assets_count += len(results.get('slide_files', []))
            if results.get('video_created'):
                assets_count += 1
            
            session_update = {
                'status': 'completed',
                'assets_generated': assets_count,
                'package_ready': True,
                'completed_at': datetime.now().isoformat(),
                'success_rate': 100,
                'output_directory': results['output_directory'],
                'storage_upload_completed': bool(results.get('storage_urls')),
                'storage_upload_completed_at': datetime.now().isoformat() if results.get('storage_urls') else None
            }
            
            self.supabase.table('mm_multimedia_sessions').update(session_update).eq('session_id', session_id).execute()
            self.log_progress("DATABASE UPDATE", "Session", "Completed")
            
        except Exception as e:
            self.log_progress("DATABASE UPDATE", "Failed", str(e))
    
    def generate_multimedia_package(self, content_id: str, employee_context: Dict[str, Any], output_base_dir: str = "./multimedia_output") -> Dict[str, Any]:
        """Main method: Generate complete multimedia package"""
        start_time = time.time()
        
        self.log_progress("PIPELINE", "Starting", f"Content: {content_id[:8]}...")
        
        results = {
            'success': False,
            'content_id': content_id,
            'errors': []
        }
        
        try:
            # Step 1: Get content
            content = self.get_content_from_supabase(content_id)
            results['module_name'] = content['module_name']
            
            # Prepare output directory
            employee_safe_name = employee_context['name'].lower().replace(' ', '_')
            module_safe_name = content['module_name'].lower().replace(' ', '_').replace('&', 'and')
            output_dir = Path(output_base_dir) / employee_safe_name / module_safe_name
            output_dir.mkdir(parents=True, exist_ok=True)
            results['output_directory'] = str(output_dir)
            
            # Course ID
            course_id = f"{employee_safe_name}_course"
            results['course_id'] = course_id
            
            # Step 2: Create session
            session_id = self.create_multimedia_session(employee_context, course_id, str(output_dir))
            results['session_id'] = session_id
            
            # Step 3: Generate educational podcast script
            podcast_data = self.generate_educational_podcast_script(content, employee_context)
            
            # Save podcast script
            script_file = output_dir / "podcast_script.txt"
            script_file.write_text(podcast_data['full_script'])
            results['script_file'] = str(script_file)
            results['script_saved'] = True
            results['script_content'] = podcast_data['full_script']
            results['original_content'] = json.dumps(content)  # Store original content
            results['employee_context'] = employee_context
            
            # Save scene navigation
            scenes_file = output_dir / "podcast_scenes.json"
            with open(scenes_file, 'w') as f:
                json.dump({
                    'title': podcast_data['title'],
                    'duration': podcast_data['duration'],
                    'word_count': podcast_data['word_count'],
                    'scenes': podcast_data['scenes']
                }, f, indent=2)
            
            self.log_progress("PODCAST SCRIPT", "Saved", f"{podcast_data['word_count']} words, {podcast_data['estimated_duration']}")
            
            # Use the podcast script for audio generation
            script = podcast_data['full_script']
            
            # Step 4: Generate audio
            audio_dir = output_dir / "audio"
            audio_dir.mkdir(exist_ok=True)
            audio_file = audio_dir / "narration.mp3"
            
            if self.generate_audio_direct(script, str(audio_file)):
                results['audio_file'] = str(audio_file)
                results['audio_created'] = True
            else:
                results['errors'].append("Audio generation failed")
            
            # Step 5: Generate professional slides with enhanced generator
            # Add employee name to podcast data for personalization
            for scene in podcast_data.get('scenes', []):
                scene['employee_name'] = employee_context.get('name', '')
            
            slide_files = self.slide_generator.generate_slides(podcast_data, output_dir)
            results['slide_files'] = [str(f) for f in slide_files]
            results['slides_created'] = len(slide_files)
            results['podcast_data'] = {
                'title': podcast_data['title'],
                'duration': podcast_data['duration'],
                'word_count': podcast_data['word_count'],
                'scenes_count': len(podcast_data['scenes'])
            }
            
            # Step 6: Generate actual video file
            if results.get('audio_created') and slide_files:
                # Calculate scene timings
                scene_timings = self.calculate_scene_timings(podcast_data)
                
                # Generate video
                video_dir = output_dir / "video"
                video_dir.mkdir(exist_ok=True)
                video_file = video_dir / f"{module_safe_name}_podcast.mp4"
                
                if self.generate_video_from_assets(audio_file, slide_files, scene_timings, video_file):
                    results['video_file'] = str(video_file)
                    results['video_created'] = True
                    
                    # Create video package info
                    video_info = self.create_video_package(audio_file, slide_files, output_dir)
                    video_info['video_file'] = str(video_file)
                    video_info['scene_timings'] = scene_timings
                    results['video_info'] = video_info
                else:
                    results['errors'].append("Video generation failed")
                    results['video_created'] = False
            
            # Step 7: Upload all files to Supabase storage
            storage_urls = self.upload_multimedia_to_storage(
                session_id, 
                content_id, 
                employee_safe_name,
                module_safe_name,
                results
            )
            results['storage_urls'] = storage_urls
            
            # Step 8: Update database with storage URLs
            self.update_database_records(session_id, content_id, results)
            
            # Calculate statistics
            elapsed_time = time.time() - start_time
            results['processing_time_seconds'] = round(elapsed_time, 2)
            results['success'] = True
            
            self.log_progress("PIPELINE", "Complete", f"Total time: {elapsed_time:.1f}s")
            
        except Exception as e:
            results['errors'].append(str(e))
            self.log_progress("PIPELINE", "Failed", str(e))
        
        return results
    
    def sanitize_filename(self, filename: str) -> str:
        """Sanitize filename for safe file system usage"""
        # Replace spaces with underscores
        safe_name = filename.lower().replace(' ', '_')
        # Replace special characters
        safe_name = safe_name.replace('&', 'and')
        safe_name = safe_name.replace('/', '_')
        safe_name = safe_name.replace('\\', '_')
        safe_name = safe_name.replace(':', '_')
        safe_name = safe_name.replace('*', '_')
        safe_name = safe_name.replace('?', '_')
        safe_name = safe_name.replace('"', '_')
        safe_name = safe_name.replace('<', '_')
        safe_name = safe_name.replace('>', '_')
        safe_name = safe_name.replace('|', '_')
        # Remove any remaining non-alphanumeric characters except underscores and hyphens
        safe_name = ''.join(c for c in safe_name if c.isalnum() or c in ('_', '-'))
        # Limit length
        return safe_name[:100]

    def generate_educational_presentation(self, content_id: str, employee_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate 6-7 minute educational video with 8-10 slides"""
        
        self.log_progress("EDUCATIONAL VIDEO", "Starting", "Target duration: 6-7 minutes")
        start_time = time.time()
        
        results = {
            'success': False,
            'content_id': content_id,
            'employee_context': employee_context,
            'errors': [],
            'slide_files': [],
            'audio_file': None,
            'video_file': None,
            'duration': 0,
            'output_directory': None
        }
        
        # Create session ID for tracking
        session_id = str(uuid.uuid4())
        results['session_id'] = session_id
        
        try:
            # Step 1: Retrieve module content
            self.log_progress("CONTENT RETRIEVAL", "Starting")
            response = self.supabase.table("cm_module_content").select("*").eq("content_id", content_id).execute()
            
            if not response.data:
                raise ValueError(f"No content found for ID: {content_id}")
            
            content_data = response.data[0]
            module_name = content_data.get('module_name', 'Unknown Module')
            course_id = content_data.get('course_id', '')
            
            # Add to results for database updates
            results['module_name'] = module_name
            results['course_id'] = course_id
            
            # Create session in database
            session_data = {
                'session_id': session_id,
                'employee_id': employee_context.get('id', 'unknown'),
                'content_id': content_id,
                'course_id': course_id,
                'module_name': module_name,
                'generation_mode': 'educational',  # New mode for educational presentations
                'generation_type': 'educational_presentation',
                'status': 'processing',
                'started_at': datetime.now().isoformat()
            }
            
            try:
                self.supabase.table('mm_multimedia_sessions').insert(session_data).execute()
                self.log_progress("DATABASE", "Session", "Created")
            except Exception as e:
                self.log_progress("DATABASE", "Session", f"Creation failed: {str(e)}")
            
            # Create output directory
            module_safe_name = self.sanitize_filename(module_name)
            employee_safe_name = self.sanitize_filename(employee_context.get('name', 'unknown'))
            output_dir = Path(f"educational_output/{employee_safe_name}/{module_safe_name}")
            output_dir.mkdir(parents=True, exist_ok=True)
            results['output_directory'] = str(output_dir)
            
            # Step 2: Extract educational content for 9 slides
            self.log_progress("CONTENT EXTRACTION", "Starting", "Extracting content for 9 slides")
            
            slide_structure = [
                {"num": 1, "type": "title", "duration": 20, "title": "Title Slide"},
                {"num": 2, "type": "objectives", "duration": 50, "title": "Learning Objectives"},
                {"num": 3, "type": "introduction", "duration": 45, "title": "Introduction"},
                {"num": 4, "type": "concept1", "duration": 55, "title": "Core Concept 1"},
                {"num": 5, "type": "concept2", "duration": 55, "title": "Core Concept 2"},
                {"num": 6, "type": "practical", "duration": 50, "title": "Practical Applications"},
                {"num": 7, "type": "case_study", "duration": 50, "title": "Case Study"},
                {"num": 8, "type": "summary", "duration": 45, "title": "Key Takeaways"},
                {"num": 9, "type": "thank_you", "duration": 20, "title": "Thank You"}
            ]
            
            # Combine all content sections
            full_content = []
            for section in ['introduction', 'core_content', 'practical_applications', 'case_studies']:
                section_content = content_data.get(section, '')
                if section_content:
                    full_content.append(f"## {section.replace('_', ' ').title()}\n{section_content}")
            
            combined_content = '\n\n'.join(full_content)
            
            # Step 3: Generate educational script (6.5 minutes = 390 seconds)
            self.log_progress("SCRIPT GENERATION", "Starting", "Target: 390 seconds")
            
            script_sections = []
            total_duration = sum(slide['duration'] for slide in slide_structure)
            
            for slide in slide_structure:
                # Calculate target words (150 words per minute)
                target_words = int((slide['duration'] / 60) * 150)
                
                prompt = f"""Create a {slide['duration']}-second narration script ({target_words} words) for a {slide['type']} slide.
Module: {module_name}
Employee: {employee_context.get('name', 'Learner')}
Role: {employee_context.get('role', 'Professional')}

Content context:
{combined_content[:1000]}...

Requirements:
- Exactly {target_words} words (±10%)
- Natural, conversational tone
- Educational and engaging
- Personalized for the employee
- Focus on {slide['title']}

For {slide['type']} slide, create appropriate content."""

                response = self.openai.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": "You are an educational content creator specializing in corporate training."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7
                )
                
                slide_script = response.choices[0].message.content.strip()
                script_sections.append(slide_script)
                
                self.log_progress("SCRIPT GENERATION", f"Slide {slide['num']}", f"{slide['duration']}s script ready")
            
            # Combine all scripts
            full_script = "\n\n".join(script_sections)
            
            # Save script
            script_file = output_dir / "educational_script.txt"
            script_file.write_text(full_script)
            
            # Step 4: Generate audio narration
            self.log_progress("AUDIO GENERATION", "Starting", "Generating 6-7 minute narration")
            
            audio_dir = output_dir / "audio"
            audio_dir.mkdir(exist_ok=True)
            
            # Generate audio for each slide separately to avoid API limits
            temp_audio_files = []
            for i, (slide, script) in enumerate(zip(slide_structure, script_sections)):
                self.log_progress("AUDIO GENERATION", f"Slide {slide['num']}", "Generating audio")
                
                temp_audio_file = audio_dir / f"temp_audio_{i:02d}.mp3"
                
                # Generate audio for this slide's script
                audio_response = self.openai.audio.speech.create(
                    model="tts-1-hd",
                    voice="alloy",
                    input=script,
                    speed=0.9  # Slightly slower for educational clarity
                )
                
                with open(temp_audio_file, 'wb') as f:
                    f.write(audio_response.content)
                
                temp_audio_files.append(temp_audio_file)
            
            # Concatenate all audio files
            self.log_progress("AUDIO GENERATION", "Concatenating", "Combining audio segments")
            
            audio_file = audio_dir / "narration.mp3"
            
            # Use ffmpeg to concatenate audio files
            concat_list_file = audio_dir / "concat_list.txt"
            with open(concat_list_file, 'w') as f:
                for temp_file in temp_audio_files:
                    # Use absolute path for ffmpeg concat
                    f.write(f"file '{str(temp_file.absolute())}'\n")
            
            concat_cmd = [
                'ffmpeg', '-y',
                '-f', 'concat',
                '-safe', '0',
                '-i', str(concat_list_file),
                '-c', 'copy',
                str(audio_file)
            ]
            
            result = subprocess.run(concat_cmd, capture_output=True, text=True)
            if result.returncode != 0:
                logger.error(f"Audio concatenation failed: {result.stderr}")
                raise Exception(f"Audio concatenation failed: {result.stderr}")
            
            # Clean up temporary files
            for temp_file in temp_audio_files:
                temp_file.unlink()
            concat_list_file.unlink()
            
            results['audio_file'] = str(audio_file)
            
            # Get actual audio duration
            audio_duration = self.get_audio_duration(audio_file)
            results['duration'] = audio_duration
            self.log_progress("AUDIO GENERATION", "Complete", f"Duration: {audio_duration:.1f}s")
            
            # Step 5: Generate 9 educational slides
            self.log_progress("SLIDE GENERATION", "Starting", "Creating 9 educational slides")
            
            slides_dir = output_dir / "slides"
            slides_dir.mkdir(exist_ok=True)
            
            slide_files = []
            for i, slide in enumerate(slide_structure):
                slide_path = slides_dir / f"slide_{slide['num']:02d}_{slide['type']}.png"
                
                # For title and thank you slides, use simple extraction
                if slide['type'] in ['title', 'thank_you']:
                    slide_content = self._extract_slide_content(
                        script_sections[i], 
                        slide['type'], 
                        slide['title'],
                        module_name,
                        employee_context
                    )
                else:
                    # For content slides, extract from module content directly
                    slide_content = self.extract_module_content_for_slides(
                        content_data,
                        slide['type'],
                        employee_context
                    )
                
                # Generate slide using enhanced generator
                if self.generate_slide(
                    title=slide_content['title'],
                    content=slide_content['content'],
                    slide_type=slide_content['type'],
                    output_path=str(slide_path)
                ):
                    slide_files.append(slide_path)
                    
            results['slide_files'] = [str(f) for f in slide_files]
            self.log_progress("SLIDE GENERATION", "Complete", f"{len(slide_files)} slides created")
            
            # Step 6: Generate synchronized video
            if audio_file.exists() and slide_files:
                self.log_progress("VIDEO GENERATION", "Starting", "Creating synchronized video")
                
                video_dir = output_dir / "video"
                video_dir.mkdir(exist_ok=True)
                video_file = video_dir / f"{module_safe_name}_educational.mp4"
                
                # Calculate precise timings based on actual audio duration
                slide_timings = []
                time_factor = audio_duration / total_duration  # Scale factor
                
                current_time = 0
                for slide in slide_structure:
                    adjusted_duration = slide['duration'] * time_factor
                    slide_timings.append({
                        'scene_id': slide['num'],
                        'title': slide['title'],
                        'start': current_time,
                        'end': current_time + adjusted_duration,
                        'duration': adjusted_duration
                    })
                    current_time += adjusted_duration
                
                # Generate video with synchronized timings
                if self.generate_video_from_assets(audio_file, slide_files, slide_timings, video_file):
                    results['video_file'] = str(video_file)
                    results['success'] = True
                    self.log_progress("VIDEO GENERATION", "Complete", f"Duration: {audio_duration:.1f}s")
                else:
                    results['errors'].append("Video generation failed")
            
            # Step 7: Upload to storage and update database
            if results['success']:
                # Prepare results for storage upload
                results['script_saved'] = True
                results['script_content'] = '\n\n'.join(script_sections)
                results['audio_created'] = bool(results.get('audio_file'))
                results['slides_created'] = len(results.get('slide_files', []))
                results['video_created'] = bool(results.get('video_file'))
                results['podcast_data'] = {
                    'word_count': sum(len(s.split()) for s in script_sections),
                    'scenes': []
                }
                
                # Upload all files to Supabase storage
                self.log_progress("STORAGE UPLOAD", "Starting", "Uploading to Supabase")
                storage_urls = self.upload_multimedia_to_storage(
                    session_id, 
                    content_id, 
                    employee_safe_name,
                    module_safe_name,
                    results
                )
                results['storage_urls'] = storage_urls
                
                # Update database with all records
                self.log_progress("DATABASE UPDATE", "Starting", "Updating records")
                self.update_database_records(session_id, content_id, results)
            
            elapsed_time = time.time() - start_time
            results['processing_time_seconds'] = round(elapsed_time, 2)
            self.log_progress("EDUCATIONAL VIDEO", "Complete", f"Total time: {elapsed_time:.1f}s")
            
        except Exception as e:
            results['errors'].append(str(e))
            self.log_progress("EDUCATIONAL VIDEO", "Failed", str(e))
            
            # Update session status to failed
            try:
                self.supabase.table('mm_multimedia_sessions').update({
                    'status': 'failed',
                    'error_message': str(e),
                    'completed_at': datetime.now().isoformat()
                }).eq('session_id', session_id).execute()
            except:
                pass
        
        return results
    
    def extract_module_content_for_slides(self, content_data: Dict[str, Any], slide_type: str, 
                                         employee_context: Dict[str, Any]) -> Dict[str, Any]:
        """Extract structured content from module data for specific slide types"""
        
        # Combine all content sections
        full_content = []
        for section in ['introduction', 'core_content', 'practical_applications', 'case_studies']:
            section_content = content_data.get(section, '')
            if section_content:
                full_content.append(f"{section}: {section_content}")
        
        combined_content = '\n\n'.join(full_content)
        
        # Use GPT-4 to extract appropriate content for each slide type
        try:
            if slide_type == 'objectives':
                prompt = f"""Extract 7-8 detailed learning objectives from this module content.
Format as main bullet points with sub-bullets where appropriate.
Each main objective should start with an action verb (Master, Understand, Apply, Develop, etc.)
Include specific skills, tools, or outcomes as sub-points.

Content:
{combined_content[:2500]}

Format:
• [Main objective - 10-15 words]
  - [Specific detail or skill - 8-12 words]
  - [Tool or application - 8-12 words]
• [Next main objective]
  - [Sub-point]

Return 7-8 main objectives with relevant sub-points."""
                
            elif slide_type == 'introduction':
                prompt = f"""Extract 6-7 comprehensive introductory points that set context for this module.
Include why this topic matters, what problems it solves, and key benefits.
Mix high-level context with specific details.

Content:
{combined_content[:2500]}

Format:
• [Why this matters - 12-18 words]
• [Problem it solves - 12-18 words]
• [Key benefit or outcome - 12-18 words]
• [Industry relevance - 12-18 words]
• [Prerequisites or foundation - 12-18 words]
• [What you'll achieve - 12-18 words]

Return 6-7 contextual points, one per line, starting with •"""
                
            elif slide_type in ['concept1', 'concept2']:
                concept_num = 1 if slide_type == 'concept1' else 2
                prompt = f"""Extract the #{concept_num} most important concept from this module.
Provide comprehensive coverage with main points and sub-details.

Content:
{combined_content[:2500]}

Format:
CONCEPT: [Concept name - 5-10 words]
• [Key principle or definition - 15-20 words]
  - [Supporting detail - 10-15 words]
  - [Example or application - 10-15 words]
• [Important characteristic - 15-20 words]
  - [Specific feature - 10-15 words]
• [How it works - 15-20 words]
  - [Step or process - 10-15 words]
• [Common usage - 15-20 words]
• [Benefits or advantages - 15-20 words]
• [Things to remember - 15-20 words]

Return the concept with 6-7 main points, including sub-bullets where relevant."""
                
            elif slide_type == 'practical':
                prompt = f"""Extract 7-8 detailed practical applications or use cases from this module.
Include real-world scenarios, tools used, and expected outcomes.
Mix immediate applications with long-term benefits.

Content:
{combined_content[:2500]}

Format:
• [Practical scenario - 15-20 words]
  - [Specific tool or method used - 10-15 words]
  - [Expected outcome - 10-15 words]
• [Business application - 15-20 words]
  - [Implementation detail - 10-15 words]
• [Common use case - 15-20 words]
• [Industry example - 15-20 words]
• [Day-to-day application - 15-20 words]
• [Advanced usage - 15-20 words]

Return 7-8 practical applications with sub-details where relevant."""
                
            elif slide_type == 'case_study':
                prompt = f"""Extract or create a comprehensive case study example from this module.
Provide detailed sections with multiple points for each.

Content:
{combined_content[:2500]}

Format:
Background: [Company/situation context - 20-30 words]
• [Additional context point - 15-20 words]

Challenge:
• [Primary challenge - 15-20 words]
• [Secondary challenge - 15-20 words]
• [Complicating factor - 15-20 words]

Approach:
• [Step 1 taken - 15-20 words]
• [Step 2 taken - 15-20 words]
• [Step 3 taken - 15-20 words]
• [Key decision made - 15-20 words]

Results:
• [Quantitative outcome - 15-20 words]
• [Qualitative improvement - 15-20 words]
• [Long-term benefit - 15-20 words]

Lessons Learned:
• [Key takeaway 1 - 15-20 words]
• [Key takeaway 2 - 15-20 words]"""
                
            elif slide_type == 'summary':
                prompt = f"""Extract 7-8 comprehensive key takeaways from this module.
Include main concepts, skills developed, tools mastered, and next steps.
Mix strategic insights with practical applications.

Content:
{combined_content[:2500]}

Format:
• [Core concept mastered - 15-20 words]
  - [How to apply it - 10-15 words]
• [Key skill developed - 15-20 words]
  - [Where to use it - 10-15 words]
• [Tool or technique learned - 15-20 words]
• [Strategic insight - 15-20 words]
• [Best practice to remember - 15-20 words]
• [Common pitfall to avoid - 15-20 words]
• [Next step to take - 15-20 words]

Return 7-8 key takeaways with sub-points where relevant."""
            
            else:
                # Default extraction
                prompt = f"""Extract 3-4 key points about '{slide_type}' from this content.
Keep each point under 15 words.

Content:
{combined_content[:1000]}

Return only the bullet points, one per line, starting with •"""
            
            # Call GPT-4 for extraction
            response = self.openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert at extracting key educational content for presentation slides. Focus on clarity and actionable insights."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,  # Lower temperature for more consistent extraction
                max_tokens=300
            )
            
            extracted_content = response.choices[0].message.content.strip()
            
            # Process the extracted content based on slide type
            if slide_type in ['concept1', 'concept2'] and 'CONCEPT:' in extracted_content:
                lines = extracted_content.split('\n')
                concept_title = lines[0].replace('CONCEPT:', '').strip()
                
                # Process all lines including sub-bullets
                content_lines = []
                for line in lines[1:]:
                    line = line.strip()
                    if line:
                        content_lines.append(line)
                
                return {
                    'title': concept_title,
                    'content': content_lines,
                    'type': 'content'
                }
            
            elif slide_type == 'case_study':
                # Parse case study format - keep all lines including labels
                content_lines = [line.strip() for line in extracted_content.split('\n') if line.strip()]
                return {
                    'title': "Case Study",
                    'content': content_lines,
                    'type': 'case_study'
                }
            
            else:
                # Process content with main bullets and sub-bullets
                content_lines = []
                for line in extracted_content.split('\n'):
                    line = line.strip()
                    if line:
                        content_lines.append(line)
                
                slide_titles = {
                    'objectives': "Learning Objectives",
                    'introduction': "Introduction", 
                    'practical': "Practical Applications",
                    'summary': "Key Takeaways"
                }
                
                return {
                    'title': slide_titles.get(slide_type, slide_type.replace('_', ' ').title()),
                    'content': content_lines,
                    'type': 'content'
                }
                
        except Exception as e:
            logger.warning(f"Failed to extract content for {slide_type}: {e}")
            # Fallback to simple extraction
            sentences = [s.strip() for s in combined_content.split('.') if s.strip()][:3]
            return {
                'title': slide_type.replace('_', ' ').title(),
                'content': sentences,
                'type': 'content'
            }
    
    def _extract_slide_content(self, script: str, slide_type: str, title: str, 
                              module_name: str, employee_context: Dict[str, Any]) -> Dict[str, Any]:
        """Extract appropriate content for each slide type"""
        
        # Extract key points from script
        sentences = [s.strip() for s in script.split('.') if s.strip()]
        
        if slide_type == 'title':
            return {
                'title': module_name,
                'content': f"Personalized Training for {employee_context.get('name', 'You')}",
                'type': 'title'
            }
        elif slide_type == 'thank_you':
            return {
                'title': "Thank You!",
                'content': f"Great job, {employee_context.get('name', 'Learner')}!\nReady to apply your new skills?",
                'type': 'title'
            }
        else:
            # Extract 3-4 key points from the script
            key_points = []
            if len(sentences) >= 4:
                # Take first sentence as intro, then key points
                key_points = sentences[1:4]
            else:
                key_points = sentences[:3]
            
            return {
                'title': title,
                'content': key_points,
                'type': 'content'
            }


def main():
    """Test the standalone multimedia generator"""
    generator = StandaloneMultimediaGenerator()
    
    # Test configuration
    content_id = "c3225098-53f4-4b01-b162-d9ff9c795629"
    employee_context = {
        "name": "Kubilaycan Karakas",
        "role": "Junior Financial Analyst",
        "level": "intermediate",
        "goals": "Senior Financial Analyst",
        "id": "kubilaycan_001"
    }
    
    logger.info("="*60)
    logger.info("🎬 STANDALONE MULTIMEDIA GENERATION TEST")
    logger.info("="*60)
    
    # Run generation
    results = generator.generate_multimedia_package(content_id, employee_context)
    
    # Display results
    logger.info("="*60)
    logger.info("📊 GENERATION RESULTS")
    logger.info("="*60)
    
    if results['success']:
        logger.info(f"✅ SUCCESS!")
        logger.info(f"📁 Output: {results['output_directory']}")
        logger.info(f"⏱️  Time: {results['processing_time_seconds']}s")
        logger.info(f"🎵 Audio: {results.get('audio_created', False)}")
        logger.info(f"🖼️  Slides: {results.get('slides_created', 0)}")
        logger.info(f"🎬 Video Ready: {results.get('video_ready', False)}")
        logger.info(f"💾 Session: {results.get('session_id', 'N/A')[:8]}...")
    else:
        logger.error(f"❌ FAILED!")
        for error in results.get('errors', []):
            logger.error(f"   • {error}")
    
    return results


if __name__ == "__main__":
    main()