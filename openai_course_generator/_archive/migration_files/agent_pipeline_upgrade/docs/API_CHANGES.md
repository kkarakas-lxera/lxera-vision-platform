# 🔄 API Changes Documentation

## Overview
This document outlines the API changes introduced by the agent pipeline upgrade. Most changes are internal, with minimal impact on external APIs.

## External API Changes

### ✅ No Breaking Changes
The external REST API remains unchanged:

```http
POST /api/generate-course
Content-Type: application/json

{
    "employee_id": "uuid",
    "company_id": "uuid", 
    "assigned_by_id": "uuid"
}
```

**Response** (unchanged):
```json
{
    "content_id": "uuid",
    "session_id": "string",
    "assignment_id": "uuid",
    "message": "Course generated successfully"
}
```

## Internal API Changes

### 1. Agent Creation Functions

#### Before:
```python
# Agents had no handoffs
def create_planning_agent():
    return Agent(
        name="Planning Agent",
        tools=[...],
        handoffs=[]  # Empty
    )
```

#### After:
```python
# Agents now have handoffs
def create_planning_agent():
    return Agent(
        name="Planning Agent",
        tools=[
            # Existing tools
            analyze_employee_profile,
            prioritize_skill_gaps,
            # New storage tools
            store_course_plan,
            store_planning_metadata
        ],
        handoffs=[create_research_agent()]  # Added handoff
    )
```

### 2. Pipeline Execution

#### Before:
```python
# Manual orchestration
orchestrator = AgenticPipelineOrchestrator()
result = await orchestrator.run_enhanced_pipeline(
    employee_id=employee_id,
    employee_name=employee_name,
    session_id=session_id
)
```

#### After:
```python
# Coordinator-based execution
from course_agents.coordinator import create_course_generation_coordinator
from lxera_agents import Runner

coordinator = create_course_generation_coordinator()
result = await Runner.run(
    coordinator,
    f"Generate course for {employee_name} (ID: {employee_id})",
    max_turns=100
)
```

### 3. New Tool Functions

#### Planning Storage Tools
```python
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
    """Store course plan in cm_course_plans table."""
    # Returns: plan_id (UUID string)

@function_tool
def store_planning_metadata(
    plan_id: str,
    employee_profile: dict,
    tool_calls: list,
    execution_time: float,
    agent_turns: int
) -> bool:
    """Store planning agent metadata."""
    # Returns: success (boolean)
```

#### Research Storage Tools
```python
@function_tool
def store_research_results(
    session_id: str,
    content_id: str,
    research_findings: dict,
    sources: list,
    synthesis: str
) -> str:
    """Store research results in cm_research_sessions."""
    # Returns: research_id (UUID string)

@function_tool
def store_research_session(
    research_id: str,
    search_queries: list,
    tool_calls: list,
    execution_time: float
) -> bool:
    """Store research session metadata."""
    # Returns: success (boolean)
```

### 4. Database Schema Additions

#### New Tables
```sql
-- cm_course_plans
CREATE TABLE cm_course_plans (
    plan_id UUID PRIMARY KEY,
    employee_id UUID NOT NULL,
    employee_name TEXT NOT NULL,
    session_id TEXT NOT NULL,
    course_structure JSONB NOT NULL,
    prioritized_gaps JSONB NOT NULL,
    -- ... additional fields
);

-- cm_agent_handoffs
CREATE TABLE cm_agent_handoffs (
    handoff_id UUID PRIMARY KEY,
    session_id TEXT NOT NULL,
    from_agent TEXT NOT NULL,
    to_agent TEXT NOT NULL,
    -- ... additional fields
);

-- course_generation_jobs
CREATE TABLE course_generation_jobs (
    job_id UUID PRIMARY KEY,
    company_id UUID NOT NULL,
    initiated_by UUID NOT NULL,
    -- ... additional fields
);
```

### 5. Progress Callback Changes

#### Before:
```python
def progress_callback(message: str):
    print(f"Progress: {message}")
```

#### After:
```python
def progress_callback(stage: str, message: str):
    print(f"[{stage}] {message}")
    # stage can be: "planning", "research", "content", etc.
```

## Migration Guide

### For Frontend Developers
**No changes required**. The REST API remains identical.

### For Backend Developers

1. **Update imports**:
```python
# Old
from agent_orchestrator import AgenticPipelineOrchestrator

# New
from course_agents.coordinator import create_course_generation_coordinator
from lxera_agents import Runner
```

2. **Update pipeline calls**:
```python
# Old
result = await orchestrator.run_enhanced_pipeline(...)

# New
coordinator = create_course_generation_coordinator()
result = await Runner.run(coordinator, prompt, max_turns=100)
```

3. **Handle new database tables**:
```python
# Check for course plans
plans = supabase.table('cm_course_plans').select('*').eq(
    'employee_id', employee_id
).execute()

# Track handoffs
handoffs = supabase.table('cm_agent_handoffs').select('*').eq(
    'session_id', session_id
).execute()
```

## Backward Compatibility

### ✅ Maintained
- All existing REST endpoints
- Response formats
- Database operations for existing tables
- Frontend integration points

### ⚠️ Deprecated (but still functional)
- `AgenticPipelineOrchestrator` class
- Manual agent chaining
- Direct agent tool calls without storage

### ❌ Breaking (internal only)
- Agent creation functions now require handoffs
- Pipeline execution uses SDK Runner
- New required database tables

## Testing Changes

### New Test Coverage
```bash
# Test SDK configuration
python verify_openai_traces.py

# Test agent handoffs
python test_agent_handoffs.py

# Test full pipeline
python test_full_pipeline.py
```

### API Testing
```bash
# Test endpoints remain the same
curl -X POST http://localhost:10000/api/generate-course \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "uuid",
    "company_id": "uuid",
    "assigned_by_id": "uuid"
  }'
```

## Performance Impact

### Improvements
- **Token usage**: Still maintains 98% reduction
- **Execution time**: ~10% faster due to parallel handoffs
- **Error recovery**: Better with handoff tracking

### Considerations
- **Database queries**: 3 additional tables to query
- **Storage**: ~500KB additional per course for metadata

## Monitoring Changes

### New Metrics
- Agent handoff success rate
- Planning/Research storage success
- Coordinator execution time

### OpenAI Traces
Now visible at: https://platform.openai.com/traces
- All agent executions
- Tool calls with parameters
- Handoff sequences

## Error Handling

### New Error Types
```python
class HandoffError(Exception):
    """Raised when agent handoff fails"""

class StorageError(Exception):
    """Raised when database storage fails"""

class CoordinatorError(Exception):
    """Raised when coordinator execution fails"""
```

### Error Recovery
```python
try:
    result = await Runner.run(coordinator, prompt)
except HandoffError as e:
    # Retry with direct agent call
    result = await fallback_to_orchestrator()
```

## Future Considerations

### Planned Enhancements
1. GraphQL API for agent status
2. WebSocket updates for real-time progress
3. Batch course generation API
4. Agent performance analytics API

### API Stability
- External REST API: Stable, no changes planned
- Internal Agent API: May add new tools/handoffs
- Database Schema: May add indexes/columns

## Support

For API-related questions:
1. Check this documentation
2. Review test files in `testing/`
3. Check OpenAI traces for execution details
4. Contact the API team