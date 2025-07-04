# Video Pipeline Database Schema Documentation

## Overview
This document provides a comprehensive overview of the database operations and Supabase integration for the video pipeline in the LXERA Vision Platform. The system uses a PostgreSQL database hosted on Supabase with two main table prefixes:
- `cm_` (Content Management) - For course content storage and management
- `mm_` (Multimedia) - For multimedia asset storage and tracking

## Database Architecture

### Table Prefixes
- **cm_** : Content Management tables (course plans, module content, assessments)
- **mm_** : Multimedia tables (sessions, assets, audio, slides)

### Supabase Configuration
- **Project ID**: xwfweumeryrgbguwrocr
- **Region**: eu-central-1
- **Database Host**: db.xwfweumeryrgbguwrocr.supabase.co
- **PostgreSQL Version**: 15.8.1.100

## Content Management Tables (cm_*)

### 1. cm_module_content
Primary table for storing course module content with full text sections.

**Columns:**
- `content_id` (uuid, PK) - Unique identifier for content
- `company_id` (uuid, FK) - References companies table
- `module_name` (text) - Name of the module
- `employee_name` (text) - Learner's name for personalization
- `session_id` (text) - Session identifier
- `introduction` (text) - Introduction section content
- `core_content` (text) - Main content section
- `practical_applications` (text) - Practical examples section
- `case_studies` (text) - Case study content
- `assessments` (text) - Assessment questions/exercises
- `module_spec` (jsonb) - Module specifications
- `research_context` (jsonb) - Research findings
- `total_word_count` (integer) - Total word count across sections
- `section_word_counts` (jsonb) - Word counts per section
- `status` (text) - Content status (draft, quality_check, approved, etc.)
- `priority_level` (text) - Priority (critical, high, medium, low)
- `revision_count` (integer) - Number of revisions
- `created_at` (timestamp) - Creation timestamp
- `updated_at` (timestamp) - Last update timestamp

**Key Operations:**
- Content creation with unique ID generation
- Section-wise content updates
- Batch updates for all sections
- Status tracking and revision management

### 2. cm_course_plans
Stores course structure and planning information.

**Columns:**
- `plan_id` (uuid, PK) - Unique plan identifier
- `employee_id` (uuid, FK) - References employees table
- `employee_name` (text) - Employee name
- `session_id` (text) - Session identifier
- `course_structure` (jsonb) - Complete course structure with modules
- `prioritized_gaps` (jsonb) - Skills gap analysis
- `research_strategy` (jsonb) - Research approach
- `learning_path` (jsonb) - Personalized learning path
- `employee_profile` (jsonb) - Employee context information
- `total_modules` (integer) - Number of modules in course
- `course_duration_weeks` (integer) - Estimated duration
- `course_title` (text) - Course title
- `status` (text) - Plan status
- `created_at` (timestamp) - Creation timestamp

### 3. cm_research_results
Stores research findings from the Research Agent.

**Columns:**
- `research_id` (uuid, PK) - Unique research identifier
- `plan_id` (uuid, FK) - References course plan
- `session_id` (text) - Session identifier
- `research_findings` (jsonb) - Detailed research results
- `content_library` (jsonb) - Curated content resources
- `module_mappings` (jsonb) - Module-specific research
- `total_topics` (integer) - Number of topics researched
- `total_sources` (integer) - Number of sources analyzed
- `search_queries` (array) - Queries used
- `sources_analyzed` (array) - URLs/sources analyzed
- `status` (text) - Research status
- `created_at` (timestamp) - Creation timestamp

### 4. cm_quality_assessments
Tracks quality assessment results for content.

**Columns:**
- `assessment_id` (uuid, PK) - Unique assessment identifier
- `content_id` (uuid, FK) - References module content
- `overall_score` (float) - Overall quality score (0-10)
- `section_scores` (jsonb) - Individual section scores
- `accuracy_score` (float) - Content accuracy score
- `clarity_score` (float) - Clarity score
- `completeness_score` (float) - Completeness score
- `engagement_score` (float) - Engagement score
- `personalization_score` (float) - Personalization score
- `quality_feedback` (text) - Detailed feedback
- `passed` (boolean) - Whether content passed assessment
- `requires_revision` (boolean) - Revision needed flag
- `sections_needing_work` (array) - Sections requiring improvement
- `critical_issues` (array) - Critical issues found
- `assessed_at` (timestamp) - Assessment timestamp

### 5. cm_enhancement_sessions
Tracks content enhancement workflows.

**Columns:**
- `session_id` (uuid, PK) - Enhancement session ID
- `content_id` (uuid, FK) - References module content
- `quality_assessment_id` (uuid, FK) - References quality assessment
- `enhancement_type` (text) - Type of enhancement
- `sections_to_enhance` (array) - Target sections
- `sections_preserved` (array) - Sections kept as-is
- `research_conducted` (boolean) - Research completed flag
- `content_regenerated` (boolean) - Content regenerated flag
- `status` (text) - Session status
- `created_at` (timestamp) - Creation timestamp
- `completed_at` (timestamp) - Completion timestamp

## Multimedia Tables (mm_*)

### 1. mm_multimedia_sessions
Tracks multimedia generation sessions for videos.

**Columns:**
- `session_id` (uuid, PK) - Unique session identifier
- `content_id` (uuid, FK) - References module content
- `company_id` (uuid, FK) - References companies table
- `session_type` (text) - Type of session (full_generation, section_video, etc.)
- `module_name` (text) - Module name
- `employee_name` (text) - Employee name for personalization
- `generation_config` (jsonb) - Generation settings
- `content_sections` (array) - Sections to generate
- `status` (text) - Session status (started, completed, failed)
- `current_stage` (text) - Current processing stage
- `progress_percentage` (numeric) - Progress (0-100)
- `total_assets_generated` (integer) - Total assets created
- `slides_generated` (integer) - Number of slides created
- `audio_files_generated` (integer) - Audio files created
- `video_files_generated` (integer) - Videos created
- `processing_duration_seconds` (integer) - Total processing time
- `started_at` (timestamp) - Start timestamp
- `completed_at` (timestamp) - Completion timestamp

### 2. mm_multimedia_assets
Central table for all multimedia assets (videos, audio, slides, etc.).

**Columns:**
- `asset_id` (uuid, PK) - Unique asset identifier
- `session_id` (uuid, FK) - References multimedia session
- `content_id` (uuid, FK) - References module content
- `company_id` (uuid, FK) - References companies table
- `asset_type` (text) - Type (video, audio, slide, script, thumbnail)
- `asset_name` (text) - Asset filename
- `file_path` (text) - Local file path
- `file_size_bytes` (integer) - File size
- `mime_type` (text) - MIME type
- `section_name` (text) - Content section name
- `duration_seconds` (numeric) - Duration for audio/video
- `generation_config` (jsonb) - Generation settings used
- `status` (text) - Asset status (generated, processed, failed)
- `storage_bucket` (text) - Supabase storage bucket name
- `storage_path` (text) - Path in storage bucket
- `public_url` (text) - Public URL for asset
- `created_at` (timestamp) - Creation timestamp

**Key Features:**
- Supports Supabase Storage integration
- Tracks both local and cloud storage paths
- Maintains generation configuration for reproducibility

### 3. mm_audio_narrations
Specialized table for audio narration tracking.

**Columns:**
- `narration_id` (uuid, PK) - Unique narration identifier
- `session_id` (uuid, FK) - References multimedia session
- `content_id` (uuid, FK) - References module content
- `narration_name` (text) - Narration name
- `narration_type` (text) - Type (full_module, section)
- `section_name` (text) - Section if applicable
- `total_duration_seconds` (numeric) - Total duration
- `audio_segments` (jsonb) - Individual segments data
- `voice_config` (jsonb) - Voice settings (voice, speed, etc.)
- `script_content` (text) - Full narration script
- `master_audio_id` (uuid, FK) - References master audio asset
- `segments_audio_ids` (array) - Array of segment asset IDs
- `synthesis_completed` (boolean) - TTS completion flag
- `status` (text) - Narration status

### 4. mm_slide_presentations
Tracks slide presentations and deck information.

**Columns:**
- `presentation_id` (uuid, PK) - Unique presentation identifier
- `session_id` (uuid, FK) - References multimedia session
- `content_id` (uuid, FK) - References module content
- `presentation_name` (text) - Presentation name
- `presentation_type` (text) - Type of presentation
- `total_slides` (integer) - Number of slides
- `slide_order` (jsonb) - Ordered list of slides
- `template_used` (text) - Template name
- `theme_config` (jsonb) - Theme configuration
- `pdf_generated` (boolean) - PDF export flag
- `pptx_generated` (boolean) - PowerPoint export flag
- `html_generated` (boolean) - HTML export flag
- `pdf_asset_id` (uuid, FK) - References PDF asset
- `pptx_asset_id` (uuid, FK) - References PPTX asset
- `html_asset_id` (uuid, FK) - References HTML asset
- `status` (text) - Presentation status

## Database Operations Patterns

### 1. Content Creation Workflow
```python
# 1. Create module content entry
content_id = content_manager.create_module_content(
    module_name="Financial Analysis Fundamentals",
    employee_name="John Doe",
    session_id="session_123",
    module_spec={...},
    company_id="67d7bff4-1149-4f37-952e-af1841fb67fa"
)

# 2. Update content sections
content_manager.update_module_section(
    content_id=content_id,
    section_name="introduction",
    section_content="Welcome to Financial Analysis..."
)

# 3. Store quality assessment
assessment_id = content_manager.store_quality_assessment(
    content_id=content_id,
    overall_score=8.5,
    section_scores={...},
    passed=True
)
```

### 2. Multimedia Generation Workflow
```python
# 1. Create multimedia session
session_id = multimedia_manager.create_multimedia_session(
    content_id=content_id,
    module_name="Financial Analysis",
    employee_name="John Doe",
    session_type="full_generation"
)

# 2. Generate and register assets
video_asset_id = multimedia_manager.register_multimedia_asset(
    session_id=session_id,
    content_id=content_id,
    asset_type="video",
    file_path="/path/to/video.mp4",
    duration_seconds=600,
    storage_bucket="multimedia-assets"
)

# 3. Update session progress
multimedia_manager.update_session_status(
    session_id=session_id,
    status="completed",
    progress_percentage=100
)
```

### 3. Supabase Storage Integration
The system integrates with Supabase Storage for multimedia assets:

1. **Upload Process:**
   - Files are uploaded to the `multimedia-assets` bucket
   - Storage path follows pattern: `{asset_type}/{section_name}/{timestamp}_{filename}`
   - Public URLs are generated for direct access

2. **Storage Structure:**
   ```
   multimedia-assets/
   ├── video/
   │   ├── introduction/
   │   ├── core_content/
   │   └── complete_module/
   ├── audio/
   │   └── narrations/
   ├── slides/
   │   └── presentations/
   └── thumbnails/
   ```

### 4. Data Retrieval Patterns
```python
# Get module content with sections
content = content_manager.get_module_content(content_id)
sections = content_manager.get_content_sections(content_id)

# Get multimedia assets for a session
assets = supabase.table('mm_multimedia_assets')\
    .select('*')\
    .eq('session_id', session_id)\
    .execute()

# Get latest quality assessment
assessment = content_manager.get_latest_quality_assessment(content_id)
```

## Key Features

### 1. Atomic Operations
- All database operations use transactions where appropriate
- Section updates can be done individually or in batch
- Foreign key constraints ensure data integrity

### 2. UUID-Based Identification
- All primary keys use UUIDs for global uniqueness
- Prevents ID conflicts in distributed systems
- Enables safe cross-table references

### 3. JSONB Storage
- Complex data structures stored as JSONB
- Enables flexible schema evolution
- Supports efficient querying of nested data

### 4. Status Tracking
- All major entities have status fields
- Enables workflow state management
- Supports retry and recovery mechanisms

### 5. Audit Trail
- Timestamps on all records (created_at, updated_at)
- Revision tracking for content
- Session history for debugging

## Performance Optimizations

### 1. Indexes
The database uses indexes on:
- Primary keys (automatic)
- Foreign keys (automatic)
- Frequently queried fields (status, session_id)

### 2. Content Storage
- Large text content stored directly in columns
- Avoids JSON parsing overhead for content access
- Enables full-text search capabilities

### 3. Batch Operations
- Batch updates for multiple sections
- Bulk asset registration
- Reduces round-trip overhead

## Security Considerations

### 1. Row Level Security (RLS)
- Company-based isolation via company_id
- User-based access control
- Service role key for backend operations

### 2. Storage Security
- Authenticated uploads only
- Public URLs for read access
- Bucket-level permissions

### 3. Data Validation
- Database constraints for data integrity
- Enum checks for status fields
- Required fields enforcement

## Future Enhancements

### 1. Planned Tables
- `mm_script_generations` - For tracking script generation
- `mm_video_analytics` - For video performance metrics
- `mm_rendering_queue` - For async video processing

### 2. Optimization Opportunities
- Materialized views for analytics
- Partitioning for large tables
- Archive strategy for old content

### 3. Additional Features
- Version control for multimedia assets
- Collaborative editing support
- Real-time progress tracking via subscriptions