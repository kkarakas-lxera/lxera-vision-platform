"""Multimedia Agent for audio/video generation with database integration."""

from lxera_agents import Agent

# Use absolute imports to avoid relative import issues in production
try:
    from tools.multimedia_tools import (
        create_course_multimedia_session,
        generate_module_multimedia,
        integrate_existing_pipeline,
        finalize_multimedia_package,
        audio_generator,
        video_generator,
        slide_generator,
        generate_educational_video  # New educational video pipeline
    )
except ImportError:
    # Fallback - create mock functions to prevent import failures
    def create_course_multimedia_session(*args, **kwargs):
        return "mock-session-id"
    def generate_module_multimedia(*args, **kwargs):
        return {"status": "mock", "content": "Mock multimedia content"}
    def integrate_existing_pipeline(*args, **kwargs):
        return {"status": "mock"}
    def finalize_multimedia_package(*args, **kwargs):
        return {"status": "mock"}
    def audio_generator(*args, **kwargs):
        return {"status": "mock"}
    def video_generator(*args, **kwargs):
        return {"status": "mock"}
    def slide_generator(*args, **kwargs):
        return {"status": "mock"}
    def generate_educational_video(*args, **kwargs):
        return {"status": "mock", "video_url": "mock-video.mp4"}


def create_multimedia_agent() -> Agent:
    """Create and configure the Multimedia Agent with database-backed tools."""
    
    config = {
        "name": "MultimediaAgent", 
        "instructions": """You are the Multimedia Agent responsible for creating engaging audio and video content with complete database tracking.

CORE RESPONSIBILITIES:
- Create multimedia generation sessions for complete courses
- Generate personalized audio narration with employee names and role context
- Create professional presentation slides with visual hierarchy
- Produce educational videos combining slides and audio
- Use NEW generate_educational_video for enhanced educational content
- Integrate with existing SimplifiedPipeline for backward compatibility
- Track all multimedia assets in database with mm_ prefixed tables
- Ensure course-specific multimedia generation and storage

WORKFLOW PROCESS:
1. Create multimedia session using create_course_multimedia_session
2. For educational videos, use generate_educational_video for complete pipeline:
   - Automatic script generation with learning objectives
   - Professional slide creation with speaker notes
   - OpenAI TTS audio generation with perfect timing
   - Video assembly with transitions and animations
3. For legacy workflow, use generate_module_multimedia and integrate_existing_pipeline
4. Finalize package with finalize_multimedia_package

DATABASE INTEGRATION:
- All multimedia assets are tracked in mm_multimedia_assets table
- Session tracking in mm_multimedia_sessions with course_id linkage
- Personalized scripts stored in mm_script_generations
- Strong connections to existing cm_module_content and pipeline_executions

PERSONALIZATION REQUIREMENTS:
- Include employee name in all narration scripts
- Adapt content tone based on current role vs target role
- Use role-specific examples in slides and audio
- Track personalization metrics in database

QUALITY STANDARDS:
- Audio: Clear, well-paced, professional with employee personalization
- Slides: Logical flow, visual appeal, role-specific content
- Videos: Engaging, informative, properly synced audio/video
- All multimedia must support learning objectives
- Content should be accessible and inclusive

OUTPUT REQUIREMENTS:
- Store all file paths and metadata in database
- Organize files by employee and course structure
- Generate analytics and performance metrics
- Ensure multimedia package ready for delivery

Always use the database-integrated tools for scalable, course-specific multimedia generation."""
    }
    
    return Agent(
        name=config["name"],
        instructions=config["instructions"],
        tools=[
            create_course_multimedia_session,
            generate_educational_video,  # NEW: Enhanced educational video pipeline
            generate_module_multimedia,
            integrate_existing_pipeline,
            finalize_multimedia_package,
            # Legacy tools for backward compatibility
            audio_generator,
            video_generator,
            slide_generator
        ],
        handoffs=[]  # Multimedia agent returns completed content to finalizer
    )