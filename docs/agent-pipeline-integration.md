# Agent Pipeline Integration

## Overview

The course generation system now uses a sophisticated agent pipeline that leverages specialized AI agents for different phases of content creation. This ensures high-quality, personalized course content based on existing skills gap analysis.

## Architecture

### 1. Edge Function (`generate-course`)
- Receives course generation request
- Retrieves employee data and skills gaps from database
- Calls the Python agent pipeline API
- Tracks progress through all phases
- Returns generated content ID

### 2. Python Agent Pipeline (`lxera_database_pipeline.py`)
- Connects to LXERA Supabase database
- Retrieves employee data and completed skills gap analysis
- Orchestrates specialized agents:
  - **Coordinator Agent**: Overall pipeline management
  - **Research Agent**: Gathers relevant resources using Tavily and Firecrawl
  - **Content Agent**: Generates personalized course content
  - **Quality Agent**: Assesses content quality
  - **Enhancement Agent**: Improves content based on quality feedback
  - **Multimedia Agent**: Creates visual and interactive elements
  - **Finalizer Agent**: Packages final course content

### 3. Database Integration
- Uses content ID workflow (98% token reduction)
- Stores all content in `cm_module_content` table
- Creates course assignments automatically
- Tracks progress in `course_generation_jobs` table

## Agent Pipeline Phases

1. **Employee Data Retrieval**
   - Fetches employee profile from database
   - No re-analysis needed - uses existing data

2. **Skills Gap Retrieval**
   - Gets completed skills gap analysis
   - Extracts technical and soft skill gaps
   - Prioritizes by severity (critical > major > moderate > minor)

3. **Course Planning**
   - Creates personalized course plan
   - Sets learning objectives based on gaps
   - Determines course priority level

4. **Research Phase**
   - Research Agent gathers industry best practices
   - Finds relevant learning resources
   - Identifies real-world applications

5. **Content Generation**
   - Content Agent creates comprehensive modules
   - Includes theory, practice, and assessments
   - Personalized to employee's role and goals

6. **Quality Enhancement Loop**
   - Quality Agent assesses content
   - Enhancement Agent improves based on feedback
   - Iterates until quality threshold met

7. **Multimedia Generation**
   - Creates visual aids and diagrams
   - Generates interactive exercises
   - Adds video placeholders

8. **Finalization**
   - Packages all content
   - Stores in database with content ID
   - Creates course assignment

## Progress Tracking

The minimizable progress tracker shows real-time updates:
- Current phase being executed
- Employee being processed
- Percentage completion
- Phase completion indicators

## Deployment

### Option 1: Python API Server
Deploy `api_server.py` as a separate service:
```bash
cd openai_course_generator
pip install -r requirements.txt
python api_server.py
```

### Option 2: Direct Integration
For production, the edge function can be modified to run Python directly or use a serverless Python runtime.

## Environment Variables

Required in edge function:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AGENT_PIPELINE_URL` (if using API server)

Required in Python pipeline:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- `TAVILY_API_KEY` (for research)
- `FIRECRAWL_API_KEY` (for web scraping)

## Benefits

1. **Specialized Expertise**: Each agent focuses on specific aspects
2. **Quality Assurance**: Built-in quality loops ensure high standards
3. **Token Efficiency**: Content ID workflow reduces costs by 98%
4. **Personalization**: Leverages existing skills gap analysis
5. **Scalability**: Can process multiple employees concurrently
6. **Transparency**: All agent actions visible in OpenAI traces