# LXERA AI Course Generation Pipeline - Clean Structure

## Overview
This is the cleaned and organized structure of the LXERA AI course generation pipeline after archiving old and deprecated files.

## Core Components

### 1. Main Pipeline Files
- `lxera_agents.py` - Core agent framework with OpenAI SDK support
- `lxera_database_pipeline.py` - Main database integration pipeline
- `app.py` - Flask web service for Render deployment
- `api_server.py` - FastAPI server for agent endpoints

### 2. Agent Modules (`course_agents/`)
- `planning_agent.py` - Course planning with skills gap analysis
- `research_agent.py` - Industry research and content gathering
- `content_agent.py` - Content generation with quality validation
- `multimedia_agent.py` - Multimedia content generation
- `coordinator.py` - Agent coordination and handoffs
- `handoff_models.py` - Data models for agent communication

### 3. Tool Modules (`tools/`)
Active tools being used:
- `planning_tools.py` & `planning_storage_tools_v2.py` - Planning operations
- `research_tools.py` & `research_storage_tools_v2.py` - Research operations
- `agentic_content_tools.py` - Content generation tools
- `database_content_tools.py` - Content database operations
- `quality_tools.py` & `database_quality_tools.py` - Quality assessment
- `multimedia_tools.py` - Multimedia generation
- `handoff_context_tools.py` - Agent handoff utilities
- `json_utils.py` - JSON parsing utilities

### 4. API Structure (`api/`)
- `main.py` - FastAPI application
- `models/` - Request/response models
- `routers/` - API endpoints
- `services/` - Business logic
- `utils/` - Utilities for auth, DB, errors, tracing

### 5. Database (`database/`)
- `content_manager.py` - Content management operations
- `*.sql` - Schema definitions

### 6. Models (`models/`)
- `course_models.py` - Course data models
- `employee_models.py` - Employee data models
- `workflow_models.py` - Workflow models

### 7. Configuration (`config/`)
- `settings.py` - Application settings
- `agent_configs.py` - Agent configurations
- `sentry_config.py` - Monitoring setup

### 8. Test Files (Standalone)
- `test_planning_agent_standalone.py` - Test planning agent
- `test_research_agent_standalone.py` - Test research agent
- `test_content_agent_standalone.py` - Test content agent

### 9. Documentation
- `README.md` - Main documentation
- `AGENT_PIPELINE_API_SPECIFICATION.md` - API specs
- `API_DEPLOYMENT_GUIDE.md` - Deployment guide
- `RENDER_DEPLOYMENT.md` - Render-specific deployment
- `SEQUENTIAL_API_SPECIFICATION.md` - Sequential API design
- `QUALITY_LOOP_IMPLEMENTATION.md` - Quality validation workflow
- `MIGRATION_SUMMARY.md` - Migration notes

### 10. Deployment
- `render.yaml` - Render deployment configuration
- `requirements.txt` - Main dependencies
- `requirements_api.txt` - API dependencies
- `setup.py` - Package setup

## Archived Content
All deprecated, old, and unused files have been moved to the `_archive/` directory:
- Old generators and orchestrators
- Deprecated tools and agents
- Test logs and outputs
- Migration files
- Old documentation

## Key Features
1. **Agent-Based Architecture**: Four specialized agents working together
2. **Database Integration**: Efficient content_id workflow (98% token reduction)
3. **Quality Validation**: Inline quality checks with enhancement loops
4. **API Endpoints**: REST API for integration
5. **Monitoring**: Sentry integration for production monitoring

## Usage
- Deploy on Render: https://lxera-agent-pipeline.onrender.com/
- Run locally: `python app.py`
- Test agents: Use standalone test scripts