# LXERA AGENT PIPELINE API INTEGRATION SPECIFICATION

**Target API:** https://lxera-agent-pipeline.onrender.com/

This document provides complete technical specifications for integrating the standalone tested Planning, Research, and Content agents into the Render API service.

## TABLE OF CONTENTS

1. [Architecture Overview](#architecture-overview)
2. [Planning Agent Specification](#planning-agent-specification)
3. [Research Agent Specification](#research-agent-specification)
4. [Content Agent Specification](#content-agent-specification)
5. [Database Schema](#database-schema)
6. [API Endpoint Specifications](#api-endpoint-specifications)
7. [Agent Handoff Workflows](#agent-handoff-workflows)
8. [JSON Request/Response Formats](#json-requestresponse-formats)
9. [Error Handling & Validation](#error-handling--validation)
10. [Authentication & Session Management](#authentication--session-management)

---

## ARCHITECTURE OVERVIEW

### Agent Pipeline Flow
```
Employee Data + Skills Gap Analysis
         ↓
    Planning Agent (creates course plan)
         ↓ (plan_id)
    Research Agent (gathers content sources)
         ↓ (research_id)
    Content Agent (generates full course content)
         ↓ (content_id)
    Quality Assessment + Enhancement
         ↓
    Final Course Output
```

### Key Design Principles
- **Content ID Workflow**: Agents pass lightweight IDs instead of full JSON (98% token reduction)
- **Database-Driven Communication**: All agent outputs stored in Supabase for persistence and handoffs
- **Quality-First Generation**: Content is assessed and enhanced during generation, not after
- **Section-by-Section Processing**: Content generated incrementally with quality gates
- **OpenAI Agents SDK Integration**: All tool calls visible in OpenAI Traces for monitoring

---

## PLANNING AGENT SPECIFICATION

### Purpose
Creates comprehensive, personalized course plans based on employee profiles and skill gap analysis.

### Architecture
- **File**: `course_agents/planning_agent.py`
- **Orchestrator**: `PlanningAgentOrchestrator`
- **SDK**: OpenAI Agents SDK with `Runner.run()`

### Tool Functions
1. **analyze_employee_profile** - Comprehensive learner analysis
2. **prioritize_skill_gaps** - Critical skills identification
3. **generate_course_structure_plan** - 4-week course framework
4. **generate_research_queries** - Research strategy planning
5. **create_personalized_learning_path** - Adaptive learning design
6. **store_course_plan** - Database storage with plan_id generation

### Input Requirements
```json
{
  "employee_data": {
    "full_name": "Kubilaycan Karakas",
    "job_title_specific": "Junior Financial Analyst - Business Performance Reporting",
    "career_aspirations_next_role": "Senior Financial Analyst within 2-3 years",
    "learning_style": "Prefers practical application and real-world examples",
    "skills": ["Project Management (Advanced)", "Data Analysis (Conceptual)"],
    "tools_software_used_regularly": ["Microsoft Excel", "SAP BPC", "PowerBI"]
  },
  "skills_gap_data": {
    "Critical Skill Gaps": {
      "gaps": [
        {
          "skill": "Forecasting and Budgeting",
          "importance": "Critical",
          "current_level": 2,
          "required_level": 8
        }
      ]
    },
    "Development Gaps": {
      "gaps": [
        {
          "skill": "Budget Management",
          "importance": "Important",
          "current_level": 3,
          "required_level": 7
        }
      ]
    }
  }
}
```

### Output Format
```json
{
  "plan_id": "9ef315d4-df40-4caa-bff0-99833ccef993",
  "course_structure": {
    "title": "Advanced Financial Forecasting for Business Performance",
    "duration_weeks": 4,
    "modules": [
      {
        "title": "Introduction to Financial Forecasting",
        "duration": "Week 1",
        "topics": ["Forecasting fundamentals", "Excel modeling basics"],
        "priority": "Critical",
        "week": 1
      }
    ],
    "learning_objectives": ["Master forecasting methodologies", "Apply Excel functions"]
  },
  "prioritized_gaps": {
    "critical_gaps": [],
    "high_priority_gaps": [],
    "development_gaps": []
  },
  "research_strategy": {
    "primary_topics": ["financial forecasting", "business performance analysis"],
    "search_queries": ["advanced excel forecasting techniques", "financial modeling best practices"],
    "source_types": ["academic", "industry", "practical"]
  }
}
```

### Database Operations
- **Table**: `cm_course_plans`
- **Primary Key**: `plan_id` (UUID)
- **Status**: 'completed' after successful planning
- **Foreign Keys**: Links to research and content phases

---

## RESEARCH AGENT SPECIFICATION

### Purpose
Conducts comprehensive web research to gather authoritative sources and current information for course content development.

### Architecture
- **File**: `course_agents/research_agent.py`
- **Orchestrator**: `ResearchAgentOrchestrator`
- **Input**: `plan_id` from Planning Agent

### Tool Functions
1. **fetch_course_plan** - Loads course plan using plan_id
2. **tavily_search** - AI-powered web search for authoritative sources
3. **firecrawl_extract** - Content extraction from websites
4. **research_synthesizer** - Consolidates findings into structured insights
5. **store_research_results** - Database storage with research_id generation

### Research Workflow
```
1. fetch_course_plan(plan_id) → Get course structure and research queries
2. tavily_search(query) → Find 3-5 authoritative sources per topic
3. firecrawl_extract(urls) → Extract content from top sources (max 3-4)
4. research_synthesizer(content) → Consolidate into structured insights
5. store_research_results() → Save with research_id for Content Agent
```

### Context Management
- **Topic Limit**: 2-3 modules at a time to prevent context overflow
- **Source Limit**: Maximum 3-4 extractions per research session
- **Synthesis**: Immediate consolidation after each set of searches
- **Quality Focus**: Prefer .edu, .gov, established industry sources

### Output Format
```json
{
  "research_id": "bd87f0db-bbb0-41ca-bd11-c06b33e61e43",
  "research_findings": {
    "topics": [
      {
        "topic": "Advanced Excel Forecasting Techniques",
        "key_findings": [
          "FORECAST.ETS function provides exponential smoothing",
          "Monte Carlo simulation improves accuracy for complex models"
        ],
        "sources": [
          {
            "title": "Excel Forecasting Functions Guide",
            "url": "https://support.microsoft.com/excel-forecasting",
            "type": "official_documentation",
            "credibility": "high",
            "relevance_score": 9.2
          }
        ],
        "synthesis": "Comprehensive overview of modern Excel forecasting capabilities..."
      }
    ],
    "overall_synthesis": "Research reveals three critical areas for financial forecasting mastery...",
    "key_insights": ["Current trend toward AI-enhanced forecasting", "Integration with Power BI increasing"],
    "recommended_resources": []
  },
  "content_library": {
    "primary_sources": [],
    "supplementary_materials": [],
    "practice_resources": []
  },
  "module_mappings": {
    "mappings": []
  }
}
```

### Database Operations
- **Table**: `cm_research_results`
- **Primary Key**: `research_id` (UUID)
- **Foreign Key**: `plan_id` (links to course plan)
- **Status**: 'completed' after successful research

---

## CONTENT AGENT SPECIFICATION

### Purpose
Generates high-quality, personalized course content with integrated quality assessment and enhancement loops.

### Architecture
- **File**: `course_agents/content_agent.py`
- **Orchestrator**: `ContentAgentOrchestrator`
- **Input**: Module specifications + research context
- **Output**: `content_id` with complete course content

### Enhanced Quality Workflow
```
For each section (introduction → core_content → practical_applications → case_studies → assessments):

1. Generate Section Content
   ↓
2. Quality Assessment (quality_assessor_with_storage)
   ↓
3. Decision Gate (score ≥ 7.5?)
   ├─ YES: Store section and proceed to next
   └─ NO: Enhancement Loop (max 2 attempts)
       ↓
4. Enhancement Loop:
   - Attempt 1: enhancement_suggester → enhance_with_current_data → re-assess
   - Attempt 2: Different enhancement type → enhance_with_current_data → re-assess
   - Store best version (regardless of final score)
   ↓
5. Next Section (repeat process)
```

### Content Generation Tools
1. **create_new_module_content** - Initialize content_id in database
2. **generate_module_introduction** - 800-1000 words
3. **generate_core_content** - 1800-2200 words  
4. **generate_practical_applications** - 1200-1500 words
5. **generate_case_studies** - 800-1000 words
6. **generate_assessment_materials** - 600-800 words
7. **store_content_section** - Database storage per section
8. **quality_assessor_with_storage** - Section-specific quality validation
9. **enhance_with_current_data** - Targeted content improvement
10. **compile_complete_module** - Final module compilation

### Quality Assessment Integration
- **Section-Specific Scoring**: Each section assessed with appropriate word count targets
- **Database Storage**: All assessments stored in `cm_quality_assessments` table
- **Enhancement Triggers**: Automatic enhancement when quality score < 7.5
- **Blocking Workflow**: No section stored without quality validation

### Output Format
```json
{
  "content_id": "eafa1937-1353-4f6d-b08c-c42a420b9d75",
  "module_content": {
    "introduction": "Course introduction content (546 words)",
    "core_content": "Main instructional content (883 words)",
    "practical_applications": "Real-world applications (647 words)",
    "case_studies": "Business scenarios (744 words)",
    "assessments": "Quizzes and exercises (537 words)"
  },
  "total_word_count": 3357,
  "quality_assessments": [
    {
      "section": "introduction",
      "score": 8.6,
      "passed": true,
      "stored_in_database": true
    }
  ],
  "status": "ready_for_multimedia"
}
```

### Database Operations
- **Primary Table**: `cm_module_content`
- **Quality Tracking**: `cm_quality_assessments`
- **Section Versioning**: `cm_content_sections`
- **Enhancement History**: `cm_enhancement_sessions`

---

## DATABASE SCHEMA

### Core Tables Overview

#### 1. Course Planning Tables
```sql
-- Planning Agent outputs
cm_course_plans (
    plan_id UUID PRIMARY KEY,
    employee_id TEXT,
    employee_name TEXT,
    session_id TEXT,
    course_structure JSONB,
    prioritized_gaps JSONB,
    research_strategy JSONB,
    status TEXT DEFAULT 'completed'
)

-- Research Agent outputs  
cm_research_results (
    research_id UUID PRIMARY KEY,
    plan_id UUID REFERENCES cm_course_plans(plan_id),
    research_findings JSONB,
    content_library JSONB,
    module_mappings JSONB,
    total_topics INTEGER,
    total_sources INTEGER
)
```

#### 2. Content Generation Tables
```sql
-- Content Agent primary storage
cm_module_content (
    content_id UUID PRIMARY KEY,
    module_name TEXT,
    employee_name TEXT,
    session_id TEXT,
    introduction TEXT,
    core_content TEXT,
    practical_applications TEXT,
    case_studies TEXT,
    assessments TEXT,
    module_spec JSONB,
    research_context JSONB,
    total_word_count INTEGER,
    status TEXT DEFAULT 'draft',
    company_id UUID -- Required for quality assessments
)

-- Quality assessment tracking
cm_quality_assessments (
    assessment_id UUID PRIMARY KEY,
    content_id UUID REFERENCES cm_module_content(content_id),
    company_id UUID NOT NULL, -- Links to employee's company
    overall_score DECIMAL(3,1),
    section_scores JSONB,
    quality_feedback TEXT,
    passed BOOLEAN,
    assessed_at TIMESTAMP
)

-- Section-level content management
cm_content_sections (
    section_id UUID PRIMARY KEY,
    content_id UUID REFERENCES cm_module_content(content_id),
    section_name TEXT,
    section_content TEXT,
    word_count INTEGER,
    status TEXT DEFAULT 'current',
    enhancement_count INTEGER DEFAULT 0
)
```

#### 3. Enhancement & Quality Tables
```sql
-- Enhancement session tracking
cm_enhancement_sessions (
    session_id UUID PRIMARY KEY,
    content_id UUID REFERENCES cm_module_content(content_id),
    enhancement_type TEXT,
    sections_to_enhance TEXT[],
    quality_score_before DECIMAL(3,1),
    quality_score_after DECIMAL(3,1),
    status TEXT
)

-- Research sessions for enhancement
cm_research_sessions (
    research_id UUID PRIMARY KEY,
    content_id UUID REFERENCES cm_module_content(content_id),
    research_topics TEXT[],
    research_results JSONB,
    research_package JSONB
)
```

### Database Relationships
```
cm_course_plans (plan_id)
    ↓
cm_research_results (research_id, plan_id)
    ↓
cm_module_content (content_id)
    ├─ cm_quality_assessments (assessment_id, content_id)
    ├─ cm_content_sections (section_id, content_id)
    └─ cm_enhancement_sessions (session_id, content_id)
```

---

## API ENDPOINT SPECIFICATIONS

### Base URL
```
https://lxera-agent-pipeline.onrender.com/api/v1
```

### Authentication
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### 1. Planning Agent Endpoints

#### POST /planning/create-course-plan
```http
POST /api/v1/planning/create-course-plan
Content-Type: application/json

{
  "employee_data": {
    "full_name": "string",
    "job_title_specific": "string", 
    "career_aspirations_next_role": "string",
    "learning_style": "string",
    "skills": ["string"],
    "tools_software_used_regularly": ["string"]
  },
  "skills_gap_data": {
    "Critical Skill Gaps": {"gaps": []},
    "Development Gaps": {"gaps": []}
  },
  "session_id": "string"
}
```

**Response:**
```json
{
  "success": true,
  "plan_id": "uuid",
  "course_title": "string",
  "total_modules": 12,
  "duration_weeks": 4,
  "next_phase": "research",
  "handoff_data": {
    "plan_id": "uuid",
    "research_queries": ["string"]
  }
}
```

#### GET /planning/status/{plan_id}
```http
GET /api/v1/planning/status/{plan_id}
```

**Response:**
```json
{
  "plan_id": "uuid",
  "status": "completed",
  "course_structure": {},
  "created_at": "timestamp",
  "ready_for_research": true
}
```

### 2. Research Agent Endpoints

#### POST /research/execute-research
```http
POST /api/v1/research/execute-research
Content-Type: application/json

{
  "plan_id": "uuid",
  "session_id": "string",
  "research_focus": "financial",
  "max_topics": 3,
  "max_sources_per_topic": 4
}
```

**Response:**
```json
{
  "success": true,
  "research_id": "uuid",
  "total_topics": 3,
  "total_sources": 12,
  "synthesis_quality": 8.5,
  "next_phase": "content_generation",
  "handoff_data": {
    "plan_id": "uuid",
    "research_id": "uuid"
  }
}
```

#### GET /research/status/{research_id}
```http
GET /api/v1/research/status/{research_id}
```

### 3. Content Agent Endpoints

#### POST /content/generate-module
```http
POST /api/v1/content/generate-module
Content-Type: application/json

{
  "plan_id": "uuid",
  "research_id": "uuid", 
  "module_specifications": {
    "module_name": "string",
    "word_count_target": "4000-6000",
    "personalization_context": {}
  },
  "session_id": "string"
}
```

**Response:**
```json
{
  "success": true,
  "content_id": "uuid",
  "total_word_count": 3357,
  "sections_generated": 5,
  "quality_assessments": [
    {
      "section": "introduction",
      "score": 8.6,
      "passed": true
    }
  ],
  "status": "ready_for_multimedia",
  "next_phase": "multimedia_generation"
}
```

#### GET /content/status/{content_id}
```http
GET /api/v1/content/status/{content_id}
```

### 4. Pipeline Management Endpoints

#### POST /pipeline/execute-full-pipeline
```http
POST /api/v1/pipeline/execute-full-pipeline
Content-Type: application/json

{
  "employee_data": {},
  "skills_gap_data": {},
  "course_requirements": {},
  "session_id": "string"
}
```

**Response:**
```json
{
  "success": true,
  "session_id": "string",
  "plan_id": "uuid",
  "research_id": "uuid", 
  "content_id": "uuid",
  "pipeline_status": "content_completed",
  "total_execution_time": 180,
  "next_steps": ["multimedia_generation", "final_review"]
}
```

#### GET /pipeline/status/{session_id}
```http
GET /api/v1/pipeline/status/{session_id}
```

**Response:**
```json
{
  "session_id": "string",
  "current_phase": "content_generation",
  "phases_completed": ["planning", "research"],
  "plan_id": "uuid",
  "research_id": "uuid",
  "content_id": "uuid",
  "estimated_completion": "2024-12-30T15:30:00Z"
}
```

---

## AGENT HANDOFF WORKFLOWS

### 1. Planning → Research Handoff
```python
# Planning Agent completes
planning_output = {
    "plan_id": "uuid",
    "research_queries": ["query1", "query2"],
    "research_strategy": {}
}

# API calls Research Agent
research_input = {
    "plan_id": planning_output["plan_id"],
    "session_id": session_id
}
```

### 2. Research → Content Handoff  
```python
# Research Agent completes
research_output = {
    "research_id": "uuid", 
    "plan_id": "uuid",
    "research_findings": {}
}

# API calls Content Agent
content_input = {
    "plan_id": research_output["plan_id"],
    "research_id": research_output["research_id"],
    "module_specifications": {}
}
```

### 3. Content → Quality/Enhancement Handoff
```python
# Content Agent with quality integration
content_output = {
    "content_id": "uuid",
    "quality_assessments": [],
    "enhancement_sessions": [],
    "status": "ready_for_multimedia"
}
```

---

## JSON REQUEST/RESPONSE FORMATS

### Standard Response Format
```json
{
  "success": boolean,
  "data": {},
  "metadata": {
    "execution_time": number,
    "tokens_used": number,
    "agent_version": "string",
    "timestamp": "ISO8601"
  },
  "errors": [],
  "warnings": []
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "PLANNING_FAILED",
    "message": "Failed to generate course structure",
    "details": {
      "stage": "generate_course_structure_plan",
      "tool_error": "OpenAI API timeout"
    }
  },
  "request_id": "uuid",
  "timestamp": "ISO8601"
}
```

### Session Tracking Format
```json
{
  "session_id": "string",
  "employee_id": "string",
  "pipeline_progress": {
    "planning": {
      "status": "completed",
      "plan_id": "uuid",
      "completed_at": "timestamp"
    },
    "research": {
      "status": "in_progress", 
      "research_id": "uuid",
      "started_at": "timestamp"
    },
    "content": {
      "status": "pending"
    }
  }
}
```

---

## ERROR HANDLING & VALIDATION

### Input Validation
```python
# Employee data validation
required_fields = [
    "full_name", 
    "job_title_specific",
    "career_aspirations_next_role"
]

# Skills gap validation
def validate_skill_gap(gap):
    required = ["skill", "importance", "current_level", "required_level"]
    return all(field in gap for field in required)
```

### Error Categories
1. **Validation Errors** (400)
   - Missing required fields
   - Invalid data formats
   - Constraint violations

2. **Agent Execution Errors** (500)
   - Tool function failures
   - OpenAI API errors
   - Database connection issues

3. **Business Logic Errors** (422)
   - Quality assessment failures
   - Content generation issues
   - Enhancement loop failures

### Retry Logic
```python
# Agent tool call retry
max_retries = 3
retry_delay = [1, 2, 4]  # exponential backoff

# Quality assessment retry
max_quality_attempts = 2  # per section
enhancement_timeout = 300  # seconds
```

---

## AUTHENTICATION & SESSION MANAGEMENT

### JWT Token Structure
```json
{
  "user_id": "uuid",
  "company_id": "uuid",
  "permissions": ["course_generation", "quality_assessment"],
  "session_id": "uuid",
  "exp": 1672531200
}
```

### Session Management
- **Session Duration**: 4 hours (full pipeline completion time)
- **Session Storage**: Redis cache for active sessions
- **Session Cleanup**: Automatic cleanup after 24 hours
- **Concurrent Sessions**: Max 3 per user

### Database Security
- **Row Level Security (RLS)**: Enabled on all tables
- **Company Isolation**: All data filtered by company_id
- **Service Role Key**: Used for agent database operations
- **API Key Rotation**: Monthly rotation schedule

---

## DEPLOYMENT CONFIGURATION

### Environment Variables
```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...

# Supabase Configuration  
SUPABASE_URL=https://xwfweumeryrgbguwrocr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Research Tools
TAVILY_API_KEY=tvly-...
FIRECRAWL_API_KEY=fc-...

# Application Configuration
APP_ENV=production
LOG_LEVEL=INFO
MAX_CONCURRENT_AGENTS=10
QUALITY_SCORE_THRESHOLD=7.5
```

### Performance Optimization
- **Connection Pooling**: Supabase connection pool (max 20)
- **Caching**: Redis for frequent database queries
- **Rate Limiting**: 100 requests/minute per user
- **Queue Management**: Background job processing for long-running tasks

### Monitoring & Observability
- **OpenAI Traces**: All agent tool calls visible
- **Database Metrics**: Query performance and usage
- **API Metrics**: Response times and error rates
- **Quality Metrics**: Assessment scores and enhancement success rates

---

## CONCLUSION

This specification provides a complete technical foundation for integrating the tested Planning, Research, and Content agents into the Render API service. The design emphasizes:

1. **Database-Driven Architecture**: Efficient agent communication via content IDs
2. **Quality-First Generation**: Integrated assessment and enhancement workflows  
3. **Scalable API Design**: RESTful endpoints with proper error handling
4. **OpenAI SDK Integration**: Full traceability and monitoring capabilities
5. **Production-Ready Security**: Authentication, validation, and data isolation

The implementation can proceed incrementally:
1. Set up database schema and core API endpoints
2. Integrate Planning Agent with API wrapper
3. Add Research Agent with handoff logic
4. Implement Content Agent with quality workflows
5. Add monitoring, caching, and performance optimization

Total estimated implementation time: 2-3 weeks for full pipeline integration.