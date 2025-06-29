# LXERA AGENT PIPELINE API DEPLOYMENT GUIDE

This guide covers deploying the simplified sequential API to Render at https://lxera-agent-pipeline.onrender.com/

## QUICK START

### 1. Environment Setup
```bash
# Required environment variables for Render deployment
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://xwfweumeryrgbguwrocr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
TAVILY_API_KEY=tvly-...
FIRECRAWL_API_KEY=fc-...
JWT_SECRET_KEY=your-production-secret-key
CORS_ORIGINS=https://yourdomain.com,https://app.lxera.com
```

### 2. Render Configuration
```yaml
# render.yaml
services:
  - type: web
    name: lxera-agent-pipeline
    env: python
    buildCommand: |
      pip install -r requirements_api.txt &&
      pip install -r requirements.txt
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
      - key: JWT_SECRET_KEY
        sync: false
```

### 3. Local Development
```bash
# Install dependencies
pip install -r requirements_api.txt
pip install -r requirements.txt

# Set environment variables
export OPENAI_API_KEY="your-key"
export SUPABASE_SERVICE_ROLE_KEY="your-key"
# ... other env vars

# Run development server
uvicorn api.main:app --reload --port 8000

# API will be available at http://localhost:8000
# API docs at http://localhost:8000/docs
```

## API STRUCTURE

### Endpoints
```
GET  /                           # API information
GET  /health                     # Health check
GET  /api/v1/info               # API details

POST /api/v1/planning/execute    # Execute planning agent
GET  /api/v1/planning/status/{id} # Get planning status
GET  /api/v1/planning/plans      # List user plans

POST /api/v1/research/execute    # Execute research agent  
GET  /api/v1/research/status/{id} # Get research status

POST /api/v1/content/execute     # Execute content agent
GET  /api/v1/content/status/{id} # Get content status
```

### Sequential Workflow
```javascript
// Client-driven sequential execution
const client = new LxeraAgentClient(baseUrl, authToken);

// Step 1: Planning
const planResult = await client.post('/api/v1/planning/execute', {
  employee_data: employeeData,
  skills_gaps: skillsGaps,
  session_metadata: { session_id: sessionId, company_id: companyId }
});

console.log(`Planning traces: ${planResult.traces.openai_trace_url}`);

// Step 2: Research
const researchResult = await client.post('/api/v1/research/execute', {
  plan_id: planResult.plan_id,
  session_metadata: { session_id: sessionId, company_id: companyId }
});

console.log(`Research traces: ${researchResult.traces.openai_trace_url}`);

// Step 3: Content Generation
const contentResult = await client.post('/api/v1/content/execute', {
  plan_id: planResult.plan_id,
  research_id: researchResult.research_id,
  session_metadata: { session_id: sessionId, company_id: companyId }
});

console.log(`Content traces: ${contentResult.traces.openai_trace_url}`);
```

## TESTING

### Generate Test JWT Token
```python
from api.utils.auth import create_test_token

# Create test token for development
test_token = create_test_token()
print(f"Test Bearer token: {test_token}")
```

### Test Endpoints
```bash
# Health check
curl http://localhost:8000/health

# Planning execution (with auth)
curl -X POST http://localhost:8000/api/v1/planning/execute \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_data": {
      "full_name": "Test User",
      "job_title_specific": "Software Engineer",
      "career_aspirations_next_role": "Senior Engineer",
      "learning_style": "Hands-on practical",
      "tools_software_used_regularly": ["Python", "React"],
      "skills": ["Programming", "Problem Solving"]
    },
    "skills_gaps": {
      "Critical_Skill_Gaps": {"gaps": []},
      "High_Priority_Gaps": {"gaps": []},
      "Development_Gaps": {"gaps": []}
    },
    "session_metadata": {
      "session_id": "123e4567-e89b-12d3-a456-426614174000",
      "company_id": "67d7bff4-1149-4f37-952e-af1841fb67fa"
    }
  }'
```

## DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All environment variables configured in Render
- [ ] Database schema deployed to Supabase
- [ ] API keys tested and validated
- [ ] CORS origins configured for production domains

### Post-Deployment
- [ ] Health check endpoint responding: `https://lxera-agent-pipeline.onrender.com/health`
- [ ] API docs accessible: `https://lxera-agent-pipeline.onrender.com/docs`
- [ ] Planning endpoint test successful
- [ ] OpenAI traces visible and working
- [ ] Database operations functioning
- [ ] Authentication working

### Monitoring
- [ ] Set up monitoring for endpoint response times
- [ ] Monitor OpenAI API usage and costs
- [ ] Track database performance
- [ ] Set up error alerting

## BENEFITS OF THIS APPROACH

### ✅ **Simplicity**
- No complex handoff state management
- Each endpoint independent and testable
- Clear separation of concerns

### ✅ **Observability**
- OpenAI traces work perfectly (confirmed)
- Each agent execution fully visible
- Easy debugging and monitoring

### ✅ **Reliability**  
- Each agent tested standalone
- Minimal changes to proven code
- Client handles errors at each step

### ✅ **Flexibility**
- Client controls execution timing
- Can add custom logic between steps
- Easy to add features later

### ✅ **Maintainability**
- Changes to one agent don't affect others
- Easy to version and deploy
- Simple rollback strategies

## NEXT STEPS

1. **Deploy Planning Endpoint**: Start with just planning agent wrapper
2. **Test End-to-End**: Verify traces and database operations
3. **Add Research & Content**: Complete remaining endpoints
4. **Production Hardening**: Add rate limiting, monitoring, caching
5. **Client Integration**: Update frontend to use sequential API

This approach preserves all working functionality while providing a clean, observable API for https://lxera-agent-pipeline.onrender.com/