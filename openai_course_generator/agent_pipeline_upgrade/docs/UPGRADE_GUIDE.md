# 📚 Agent Pipeline Upgrade Guide

## Overview
This guide walks through upgrading the LXERA Vision Platform agent pipeline to enable proper agent handoffs, database storage, and OpenAI SDK tracing.

## Prerequisites

- Python 3.8+
- OpenAI API key
- Supabase project access
- Render deployment access

## Step 1: Database Migration

### 1.1 Run Migration Script
```bash
cd agent_pipeline_upgrade/migrations
supabase migration new add_agent_pipeline_tables
```

### 1.2 Apply Migration
Copy the contents of `add_missing_tables.sql` to the new migration file, then:
```bash
supabase db push
```

### 1.3 Verify Tables
```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('cm_course_plans', 'cm_agent_handoffs', 'course_generation_jobs');
```

## Step 2: Update Agent Code

### 2.1 Planning Agent Updates

**File**: `course_agents/planning_agent.py`

Add storage tools:
```python
from tools.planning_storage_tools import store_course_plan, store_planning_metadata

# In create_planning_agent():
tools = [
    analyze_employee_profile,
    prioritize_skill_gaps,
    generate_course_structure_plan,
    generate_research_queries,
    create_personalized_learning_path,
    store_course_plan,  # NEW
    store_planning_metadata  # NEW
]
```

Add handoff:
```python
handoffs = [create_research_agent()]  # Add this line
```

### 2.2 Research Agent Updates

**File**: `course_agents/research_agent.py`

Add storage tools:
```python
from tools.research_storage_tools import store_research_results, store_research_session

# In create_research_agent():
tools = [
    tavily_search,
    firecrawl_extract,
    research_synthesizer,
    store_research_results,  # NEW
    store_research_session  # NEW
]
```

Add handoff:
```python
handoffs = [create_database_content_agent()]  # Add this line
```

### 2.3 Create Storage Tools

Create new files:

**File**: `tools/planning_storage_tools.py`
```python
import uuid
from datetime import datetime
from supabase import create_client
from agents import function_tool

@function_tool
def store_course_plan(
    employee_id: str,
    employee_name: str,
    session_id: str,
    course_structure: dict,
    prioritized_gaps: dict,
    research_strategy: dict = None,
    learning_path: dict = None
) -> str:
    """Store course plan in database."""
    supabase = create_client(
        'https://xwfweumeryrgbguwrocr.supabase.co',
        os.environ['SUPABASE_SERVICE_ROLE_KEY']
    )
    
    plan_data = {
        'employee_id': employee_id,
        'employee_name': employee_name,
        'session_id': session_id,
        'course_structure': course_structure,
        'prioritized_gaps': prioritized_gaps,
        'research_strategy': research_strategy,
        'learning_path': learning_path,
        'course_title': course_structure.get('title', 'Personalized Course'),
        'total_modules': len(course_structure.get('modules', [])),
        'course_duration_weeks': course_structure.get('duration_weeks', 8)
    }
    
    result = supabase.table('cm_course_plans').insert(plan_data).execute()
    return result.data[0]['plan_id']
```

**File**: `tools/research_storage_tools.py`
```python
# Similar structure for research storage
```

## Step 3: Create Coordinator

**File**: `course_agents/coordinator.py`
```python
from agents import Agent
from .planning_agent import create_planning_agent

def create_course_generation_coordinator():
    """Create coordinator that starts with planning agent."""
    return Agent(
        name="Course Generation Coordinator",
        model="gpt-4o",
        instructions="""
        You coordinate the entire course generation pipeline.
        Start with the planning agent and let agents hand off naturally.
        Monitor progress and ensure smooth execution.
        """,
        tools=[],
        handoffs=[create_planning_agent()]
    )
```

## Step 4: Update Pipeline

**File**: `lxera_pipeline.py`

Replace orchestrator usage:
```python
# Old:
# from agent_orchestrator import AgenticPipelineOrchestrator

# New:
from course_agents.coordinator import create_course_generation_coordinator
from lxera_agents import Runner

# In run_pipeline():
coordinator = create_course_generation_coordinator()
result = await Runner.run(
    coordinator,
    f"Generate course for employee {employee_name} (ID: {employee_id})",
    max_turns=100
)
```

## Step 5: Testing

### 5.1 Verify SDK Configuration
```bash
cd agent_pipeline_upgrade/verification
python verify_openai_traces.py
```

Expected output:
```
✅ Official OpenAI SDK loaded
✅ Trace imports successful
✅ OpenAI API key is set
```

### 5.2 Test Agent Tools
```bash
python verify_agent_tools.py
```

### 5.3 Test Handoffs
```bash
cd ../testing
python test_agent_handoffs.py
```

### 5.4 Run Full Pipeline Test
```bash
python test_full_pipeline.py
```

## Step 6: Deployment

### 6.1 Test Locally
```bash
cd ../..
python app.py
```

Test the `/health` endpoint:
```bash
curl http://localhost:10000/health
```

### 6.2 Deploy to Render
```bash
git add .
git commit -m "feat: unified agent pipeline with SDK handoffs"
git push origin main
```

### 6.3 Monitor Deployment
- Check Render dashboard for deployment status
- Monitor logs for errors
- Test production endpoint

## Step 7: Verification

### 7.1 Check OpenAI Traces
1. Go to https://platform.openai.com/traces
2. Look for your agent executions
3. Verify all tool calls appear

### 7.2 Check Database
```sql
-- Check course plans
SELECT * FROM cm_course_plans ORDER BY created_at DESC LIMIT 5;

-- Check agent handoffs
SELECT * FROM cm_agent_handoffs ORDER BY handoff_timestamp DESC LIMIT 10;

-- Check research sessions
SELECT * FROM cm_research_sessions ORDER BY created_at DESC LIMIT 5;
```

### 7.3 Test Frontend
1. Open the application
2. Navigate to an employee
3. Click "Generate Course"
4. Monitor progress
5. Verify course displays correctly

## Troubleshooting

### Issue: "agents" module not found
**Solution**: Install official SDK
```bash
pip install openai-agents
```

### Issue: No traces in OpenAI dashboard
**Solution**: Check SDK configuration
```bash
export OPENAI_LOG=debug
python verify_openai_traces.py
```

### Issue: Handoffs not working
**Solution**: Verify agent definitions include handoffs array
```python
# Check each agent has:
handoffs = [next_agent()]
```

### Issue: Database errors
**Solution**: Verify migration was applied
```bash
supabase db reset
supabase db push
```

## Best Practices

1. **Always test locally first** before deploying
2. **Monitor token usage** in OpenAI dashboard
3. **Check Sentry** for production errors
4. **Use content_id** for token efficiency
5. **Implement timeouts** for long-running operations

## Support

For issues:
1. Check logs in `agent_pipeline_upgrade/logs/`
2. Review Sentry error tracking
3. Check Render deployment logs
4. Contact the development team

## Next Steps

After successful upgrade:
1. Monitor production performance
2. Gather user feedback
3. Plan additional enhancements
4. Consider adding more sophisticated handoff logic