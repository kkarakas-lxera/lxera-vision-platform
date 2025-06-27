# Render Deployment Guide for LXERA Agent Pipeline

## Overview
This guide walks you through deploying the LXERA agent pipeline to Render, replacing the previous Vercel deployment.

## Prerequisites
- GitHub repository with the agent pipeline code (already committed)
- Render account (free tier available)
- Required API keys (OpenAI, Supabase, Tavily, Firecrawl)

## Deployment Steps

### 1. Create Render Account
1. Go to https://render.com
2. Sign up with GitHub account for easy repository access
3. Verify your account

### 2. Create Web Service
1. From Render dashboard, click "New +" → "Web Service"
2. Connect your GitHub repository: `lxera-vision-platform`
3. Configure the service:
   - **Name**: `lxera-agent-pipeline`
   - **Environment**: `Python 3`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `openai_course_generator`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --workers 2 --bind 0.0.0.0:$PORT --timeout 600 --worker-class gevent app:app`

### 3. Set Environment Variables
In the Render dashboard, add these environment variables:

**Required:**
- `OPENAI_API_KEY`: Your OpenAI API key
- `SUPABASE_URL`: https://xwfweumeryrgbguwrocr.supabase.co
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

**Optional (for enhanced research):**
- `TAVILY_API_KEY`: Your Tavily API key
- `FIRECRAWL_API_KEY`: Your Firecrawl API key

**System (auto-set by Render):**
- `PORT`: 10000 (set automatically)
- `PYTHON_VERSION`: 3.11.0

### 4. Deploy
1. Click "Create Web Service"
2. Render will automatically:
   - Clone your repository
   - Install dependencies from requirements.txt
   - Start the Flask application
   - Provide a public HTTPS URL

### 5. Verify Deployment
Once deployed, test these endpoints:
- Health check: `https://your-app.onrender.com/health`
- API root: `https://your-app.onrender.com/`

Expected response from health check:
```json
{
  "status": "healthy",
  "service": "lxera-agent-pipeline", 
  "pipeline_available": true
}
```

### 6. Update Supabase Configuration
Update the `AGENT_PIPELINE_URL` in your Supabase project:
```bash
npx supabase secrets set AGENT_PIPELINE_URL=https://your-app.onrender.com/api/generate-course
```

### 7. Test Complete Pipeline
Use the Supabase edge function to test:
```bash
curl -X POST "https://xwfweumeryrgbguwrocr.supabase.co/functions/v1/generate-course" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "test-employee-id",
    "company_id": "test-company-id", 
    "assigned_by_id": "test-user-id"
  }'
```

## Benefits of Render over Vercel

1. **No Authentication Barriers**: Public API endpoints by default
2. **Better Python Support**: Native Python runtime environment with Gunicorn WSGI server
3. **Long-Running Processes**: 600-second timeout for AI agent processing
4. **Free Tier**: Apps sleep when idle but don't shut down completely
5. **Production Ready**: Gunicorn with gevent workers for concurrent request handling
6. **Easier Debugging**: Better logging and monitoring tools

## Troubleshooting

### Build Failures
- Check that all dependencies are in requirements.txt
- Verify Python version compatibility
- Check build logs in Render dashboard

### Runtime Errors
- Check application logs in Render dashboard
- Verify all environment variables are set
- Test individual agent imports

### Agent Pipeline Issues
- Verify OpenAI API key is valid
- Check Supabase connection
- Test with minimal employee data first

## Production Configuration Details

### Gunicorn Settings Explained:
- **`--workers 2`**: Optimal for free tier memory limits while handling concurrent requests
- **`--timeout 600`**: 10-minute timeout for AI agent processing (research, content generation)
- **`--worker-class gevent`**: Async-friendly workers for better handling of I/O operations
- **`--bind 0.0.0.0:$PORT`**: Binds to all interfaces on Render's assigned port

### Production vs Development:
- **Production**: Uses Gunicorn WSGI server for stability and performance
- **Development**: Falls back to Flask dev server when running locally with `python app.py`

## Files Created for Render Deployment

- `render.yaml`: Service configuration with Gunicorn start command
- `app.py`: Production-ready Flask web service entry point  
- `requirements.txt`: Updated with Flask, Gunicorn, and gevent dependencies
- `.gitignore`: Updated to remove Vercel references

## Next Steps After Deployment

1. Update Supabase AGENT_PIPELINE_URL
2. Test course generation from frontend
3. Monitor logs for any issues
4. Consider upgrading to paid plan for production use