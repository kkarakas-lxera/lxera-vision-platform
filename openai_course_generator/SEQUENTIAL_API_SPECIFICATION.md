# SIMPLIFIED SEQUENTIAL API SPECIFICATION

**Target API:** https://lxera-agent-pipeline.onrender.com/

This specification provides a simplified sequential approach for integrating the standalone tested agents, eliminating complex handoff mechanisms in favor of client-driven sequential execution.

## SEQUENTIAL WORKFLOW DESIGN

### Core Principle: Client Orchestrates, Agents Execute
```
Client Request 1: Employee Data → Planning Agent → plan_id
         ↓
Client Request 2: plan_id → Research Agent → research_id  
         ↓
Client Request 3: plan_id + research_id → Content Agent → content_id
```

### Benefits Over Handoff Approach
- ✅ **Simpler**: No complex handoff logic needed
- ✅ **Observable**: OpenAI traces work perfectly (as confirmed by user)
- ✅ **Reliable**: Each agent tested and working independently
- ✅ **Flexible**: Client controls timing and error handling
- ✅ **Maintainable**: Minimal changes to existing working code

---

## API ENDPOINT STRUCTURE

### Base Configuration
```
Base URL: https://lxera-agent-pipeline.onrender.com/api/v1
Authentication: Bearer JWT tokens
Content-Type: application/json
```

### 1. Planning Execution Endpoint

#### POST /api/v1/planning/execute
```http
POST /api/v1/planning/execute
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "employee_data": {
    "full_name": "Kubilay Cenk Karakas",
    "job_title_specific": "Senior Software Engineer - AI/ML Systems",
    "career_aspirations_next_role": "Staff Software Engineer / Technical Lead",
    "learning_style": "Hands-on practical application with real-world projects",
    "tools_software_used_regularly": ["LangChain", "OpenAI/Anthropic SDKs", "Supabase"],
    "skills": ["RAG (Expert)", "RLHF (Expert)", "LangChain (Expert)"]
  },
  "skills_gaps": {
    "Critical Skill Gaps": {
      "gaps": [
        {
          "skill": "Python",
          "importance": "Critical",
          "current_level": 0,
          "required_level": 4,
          "gap_size": 4
        }
      ]
    },
    "High Priority Gaps": {
      "gaps": []
    }
  },
  "session_metadata": {
    "session_id": "uuid",
    "company_id": "uuid"
  }
}
```

#### Response
```json
{
  "success": true,
  "plan_id": "9ef315d4-df40-4caa-bff0-99833ccef993",
  "execution_summary": {
    "course_title": "Python for AI/ML Professionals",
    "total_modules": 12,
    "duration_weeks": 4,
    "execution_time_seconds": 45,
    "agent_turns": 6
  },
  "traces": {
    "openai_trace_url": "https://platform.openai.com/traces/...",
    "visible_in_traces": true
  },
  "next_step": {
    "endpoint": "/api/v1/research/execute",
    "required_params": ["plan_id"]
  }
}
```

### 2. Research Execution Endpoint

#### POST /api/v1/research/execute
```http
POST /api/v1/research/execute
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "plan_id": "9ef315d4-df40-4caa-bff0-99833ccef993",
  "research_parameters": {
    "max_topics": 3,
    "max_sources_per_topic": 4,
    "focus_areas": ["Python fundamentals", "AI/ML integration"],
    "source_preferences": ["official_docs", "industry_guides", "practical_tutorials"]
  },
  "session_metadata": {
    "session_id": "uuid",
    "company_id": "uuid"
  }
}
```

#### Response
```json
{
  "success": true,
  "research_id": "bd87f0db-bbb0-41ca-bd11-c06b33e61e43",
  "plan_id": "9ef315d4-df40-4caa-bff0-99833ccef993",
  "execution_summary": {
    "total_topics": 3,
    "total_sources": 12,
    "synthesis_quality": 8.5,
    "execution_time_seconds": 120,
    "agent_turns": 8
  },
  "research_preview": {
    "topics_covered": [
      "Python Programming Fundamentals",
      "Python for Machine Learning",
      "LangChain Integration with Python"
    ],
    "key_insights": [
      "Python foundations critical for AI/ML professionals",
      "Modern Python patterns for ML workflows"
    ]
  },
  "traces": {
    "openai_trace_url": "https://platform.openai.com/traces/...",
    "tool_calls_visible": true
  },
  "next_step": {
    "endpoint": "/api/v1/content/execute",
    "required_params": ["plan_id", "research_id"]
  }
}
```

### 3. Content Generation Endpoint

#### POST /api/v1/content/execute
```http
POST /api/v1/content/execute
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "plan_id": "9ef315d4-df40-4caa-bff0-99833ccef993",
  "research_id": "bd87f0db-bbb0-41ca-bd11-c06b33e61e43",
  "content_parameters": {
    "target_module": "Introduction to Python Programming",
    "word_count_target": "4000-5000",
    "quality_threshold": 7.5,
    "enhancement_enabled": true,
    "max_enhancement_attempts": 2
  },
  "session_metadata": {
    "session_id": "uuid",
    "company_id": "uuid"
  }
}
```

#### Response
```json
{
  "success": true,
  "content_id": "eafa1937-1353-4f6d-b08c-c42a420b9d75",
  "plan_id": "9ef315d4-df40-4caa-bff0-99833ccef993",
  "research_id": "bd87f0db-bbb0-41ca-bd11-c06b33e61e43",
  "execution_summary": {
    "total_word_count": 3357,
    "sections_generated": 5,
    "quality_assessments": [
      {
        "section": "introduction",
        "score": 8.6,
        "passed": true,
        "enhancement_attempts": 0
      },
      {
        "section": "core_content", 
        "score": 7.8,
        "passed": true,
        "enhancement_attempts": 1
      }
    ],
    "execution_time_seconds": 180,
    "agent_turns": 13
  },
  "content_preview": {
    "module_name": "Introduction to Python Programming",
    "sections": ["introduction", "core_content", "practical_applications", "case_studies", "assessments"],
    "status": "ready_for_multimedia"
  },
  "traces": {
    "openai_trace_url": "https://platform.openai.com/traces/...",
    "quality_assessment_visible": true,
    "enhancement_loops_visible": true
  },
  "next_steps": [
    "multimedia_generation",
    "final_review",
    "deployment"
  ]
}
```

---

## FASTAPI IMPLEMENTATION STRUCTURE

### Application Structure
```
/api
├── main.py                 # FastAPI app with CORS, auth
├── routers/
│   ├── planning.py         # Planning endpoint wrapper
│   ├── research.py         # Research endpoint wrapper
│   └── content.py          # Content endpoint wrapper
├── models/
│   ├── requests.py         # Pydantic request models
│   └── responses.py        # Pydantic response models
├── services/
│   ├── planning_service.py # Wrapper around standalone planning
│   ├── research_service.py # Wrapper around standalone research
│   └── content_service.py  # Wrapper around standalone content
└── utils/
    ├── auth.py             # JWT authentication
    ├── tracing.py          # OpenAI trace integration
    └── errors.py           # Error handling
```

### Core Service Pattern
```python
# services/planning_service.py
class PlanningService:
    def __init__(self):
        self.planning_agent = create_planning_agent()
    
    async def execute_planning(self, request: PlanningRequest) -> PlanningResponse:
        """Execute standalone planning logic, return structured response."""
        
        # Use exact logic from test_planning_agent_standalone.py
        with trace(f"planning_{request.session_metadata.session_id}"):
            result = await Runner.run(
                self.planning_agent,
                self._create_planning_message(request),
                max_turns=15
            )
        
        # Extract plan_id using existing logic
        plan_id = self._extract_plan_id(result)
        
        return PlanningResponse(
            success=True,
            plan_id=plan_id,
            execution_summary=self._create_summary(result),
            traces=self._extract_trace_info(result)
        )
```

### Request/Response Models
```python
# models/requests.py
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class EmployeeData(BaseModel):
    full_name: str
    job_title_specific: str
    career_aspirations_next_role: str
    learning_style: str
    tools_software_used_regularly: List[str]
    skills: List[str]

class SkillGap(BaseModel):
    skill: str
    importance: str
    current_level: int
    required_level: int
    gap_size: int

class SkillsGaps(BaseModel):
    Critical_Skill_Gaps: Dict[str, List[SkillGap]]
    High_Priority_Gaps: Dict[str, List[SkillGap]]

class SessionMetadata(BaseModel):
    session_id: str
    company_id: str

class PlanningRequest(BaseModel):
    employee_data: EmployeeData
    skills_gaps: SkillsGaps
    session_metadata: SessionMetadata

class ResearchRequest(BaseModel):
    plan_id: str
    research_parameters: Optional[Dict[str, Any]] = {}
    session_metadata: SessionMetadata

class ContentRequest(BaseModel):
    plan_id: str
    research_id: str
    content_parameters: Optional[Dict[str, Any]] = {}
    session_metadata: SessionMetadata
```

### Error Handling
```python
# utils/errors.py
from fastapi import HTTPException
from enum import Enum

class ErrorCode(Enum):
    PLANNING_FAILED = "PLANNING_FAILED"
    RESEARCH_FAILED = "RESEARCH_FAILED" 
    CONTENT_FAILED = "CONTENT_FAILED"
    INVALID_PLAN_ID = "INVALID_PLAN_ID"
    INVALID_RESEARCH_ID = "INVALID_RESEARCH_ID"

class AgentExecutionError(HTTPException):
    def __init__(self, error_code: ErrorCode, details: str):
        super().__init__(
            status_code=422,
            detail={
                "error_code": error_code.value,
                "message": self._get_message(error_code),
                "details": details
            }
        )
```

---

## CLIENT INTEGRATION EXAMPLES

### JavaScript/TypeScript Client
```typescript
// Sequential execution client
class LxeraAgentClient {
  constructor(private baseUrl: string, private authToken: string) {}

  async executeFullPipeline(employeeData: EmployeeData, skillsGaps: SkillsGaps) {
    const sessionId = generateUUID();
    
    // Step 1: Planning
    const planningResult = await this.executePlanning({
      employee_data: employeeData,
      skills_gaps: skillsGaps,
      session_metadata: { session_id: sessionId, company_id: this.companyId }
    });
    
    console.log('Planning traces:', planningResult.traces.openai_trace_url);
    
    // Step 2: Research
    const researchResult = await this.executeResearch({
      plan_id: planningResult.plan_id,
      session_metadata: { session_id: sessionId, company_id: this.companyId }
    });
    
    console.log('Research traces:', researchResult.traces.openai_trace_url);
    
    // Step 3: Content Generation
    const contentResult = await this.executeContent({
      plan_id: planningResult.plan_id,
      research_id: researchResult.research_id,
      session_metadata: { session_id: sessionId, company_id: this.companyId }
    });
    
    console.log('Content traces:', contentResult.traces.openai_trace_url);
    
    return {
      plan_id: planningResult.plan_id,
      research_id: researchResult.research_id,
      content_id: contentResult.content_id,
      session_id: sessionId
    };
  }
  
  private async executePlanning(request: PlanningRequest): Promise<PlanningResponse> {
    return this.post('/api/v1/planning/execute', request);
  }
  
  private async executeResearch(request: ResearchRequest): Promise<ResearchResponse> {
    return this.post('/api/v1/research/execute', request);
  }
  
  private async executeContent(request: ContentRequest): Promise<ContentResponse> {
    return this.post('/api/v1/content/execute', request);
  }
}
```

### Python Client
```python
import httpx
import asyncio

class LxeraAgentClient:
    def __init__(self, base_url: str, auth_token: str):
        self.base_url = base_url
        self.headers = {"Authorization": f"Bearer {auth_token}"}
    
    async def execute_full_pipeline(self, employee_data: dict, skills_gaps: dict):
        session_id = str(uuid.uuid4())
        
        async with httpx.AsyncClient() as client:
            # Sequential execution
            planning_result = await self._execute_planning(
                client, employee_data, skills_gaps, session_id
            )
            print(f"Planning traces: {planning_result['traces']['openai_trace_url']}")
            
            research_result = await self._execute_research(
                client, planning_result['plan_id'], session_id
            )
            print(f"Research traces: {research_result['traces']['openai_trace_url']}")
            
            content_result = await self._execute_content(
                client, planning_result['plan_id'], research_result['research_id'], session_id
            )
            print(f"Content traces: {content_result['traces']['openai_trace_url']}")
            
            return {
                'plan_id': planning_result['plan_id'],
                'research_id': research_result['research_id'], 
                'content_id': content_result['content_id'],
                'session_id': session_id
            }
```

---

## MONITORING & OBSERVABILITY

### OpenAI Traces Integration
```python
# utils/tracing.py
from lxera_agents import trace
import os

def create_trace_context(agent_type: str, session_id: str):
    """Create trace context for agent execution."""
    return trace(f"{agent_type}_{session_id}")

def extract_trace_url(result) -> Optional[str]:
    """Extract OpenAI trace URL from agent result."""
    # Logic to extract trace URL from runner result
    # Return URL that client can use to view traces
    pass
```

### Execution Metrics
```python
# Track execution metrics for each agent
class ExecutionMetrics:
    def __init__(self):
        self.start_time = time.time()
    
    def complete(self, agent_turns: int) -> Dict[str, Any]:
        return {
            "execution_time_seconds": time.time() - self.start_time,
            "agent_turns": agent_turns,
            "timestamp": datetime.utcnow().isoformat()
        }
```

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

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
JWT_SECRET_KEY=your-secret-key
CORS_ORIGINS=["https://yourdomain.com"]
```

### Render Deployment
```yaml
# render.yaml
services:
  - type: web
    name: lxera-agent-pipeline
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn api.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: OPENAI_API_KEY
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY  
        sync: false
      - key: TAVILY_API_KEY
        sync: false
      - key: FIRECRAWL_API_KEY
        sync: false
```

---

## ADVANTAGES OF SEQUENTIAL APPROACH

### 1. **Simplicity**
- No complex handoff state management
- Each endpoint is independent and testable
- Clear separation of concerns

### 2. **Observability** 
- OpenAI traces work perfectly (confirmed by user)
- Each agent execution fully visible
- Easy debugging and monitoring

### 3. **Reliability**
- Each agent tested and working standalone
- Minimal changes to proven working code
- Client can handle errors at each step

### 4. **Flexibility**
- Client controls execution timing
- Can add custom logic between steps
- Easy to add parallel execution later if needed

### 5. **Maintainability**
- Changes to one agent don't affect others
- Easy to version and deploy independently
- Simple rollback strategies

This sequential approach provides a clean, reliable API that preserves all the working functionality while offering maximum flexibility and observability for https://lxera-agent-pipeline.onrender.com/