"""
Render Web Service Entry Point for LXERA Agent Pipeline
This is the main application that Render will run to host our agent pipeline.
"""
import os
import asyncio
import logging
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration
from sentry_sdk.integrations.openai import OpenAIIntegration
from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import openai

# Configure logging first
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Sentry directly to avoid circular imports
sentry_sdk.init(
    dsn="https://72603497d4cd6aa808c39674bfd414cf@o4509570042822656.ingest.de.sentry.io/4509570148991056",
    traces_sample_rate=1.0,
    # Enable profiling - profiles 100% of sampled transactions
    profiles_sample_rate=1.0,
    integrations=[
        FlaskIntegration(
            transaction_style='endpoint',
        ),
        OpenAIIntegration(
            include_prompts=True,
        ),
    ],
    environment=os.getenv('RENDER_ENV', 'production'),
    send_default_pii=True,
    attach_stacktrace=True,
)
logger.info("✅ Sentry initialized with profiling enabled")

# Import our pipeline with detailed error reporting
generate_course_with_agents = None
resume_course_generation = None
pipeline_import_error = None

try:
    from lxera_database_pipeline import generate_course_with_agents, resume_course_generation
    logger.info("Successfully imported LXERA agent pipeline")
except ImportError as e:
    pipeline_import_error = f"Import error: {str(e)}"
    logger.error(f"Failed to import pipeline: {e}")
    # Set to None if import fails
    generate_course_with_agents = None
    resume_course_generation = None
except Exception as e:
    pipeline_import_error = f"Pipeline initialization error: {str(e)}"
    logger.error(f"Pipeline initialization failed: {e}")
    generate_course_with_agents = None
    resume_course_generation = None

# Create Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/ping', methods=['GET'])
def ping():
    """Lightweight ping endpoint for quick health checks"""
    return jsonify({'status': 'ok'}), 200

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for Render"""
    health_data = {
        'status': 'healthy',
        'service': 'lxera-agent-pipeline',
        'pipeline_available': generate_course_with_agents is not None,
        'environment_check': {
            'openai_key_set': bool(os.environ.get('OPENAI_API_KEY')),
            'supabase_url_set': bool(os.environ.get('SUPABASE_URL')),
            'supabase_key_set': bool(os.environ.get('SUPABASE_SERVICE_ROLE_KEY'))
        }
    }
    
    if pipeline_import_error:
        health_data['pipeline_error'] = pipeline_import_error
    
    return jsonify(health_data)

@app.route('/api/generate-course', methods=['POST', 'OPTIONS'])
def generate_course():
    """Main endpoint for course generation using agent pipeline"""
    
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return jsonify({'message': 'OK'}), 200
    
    try:
        # Get request data
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['employee_id', 'company_id', 'assigned_by_id']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'pipeline_success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Check if pipeline is available
        if not generate_course_with_agents:
            return jsonify({
                'pipeline_success': False,
                'error': 'Agent pipeline not properly initialized'
            }), 500
        
        logger.info(f"Starting course generation for employee: {data['employee_id']}")
        
        # Run the async pipeline using asyncio.run() - safer for threaded environments
        result = asyncio.run(
            generate_course_with_agents(
                employee_id=data['employee_id'],
                company_id=data['company_id'],
                assigned_by_id=data['assigned_by_id'],
                job_id=data.get('job_id'),
                generation_mode=data.get('generation_mode', 'full'),
                plan_id=data.get('plan_id'),  # Pass plan_id for remaining_modules mode
                enable_multimedia=data.get('enable_multimedia', False)  # Pass multimedia flag
            )
        )
        
        logger.info(f"Pipeline completed successfully for employee: {data['employee_id']}")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in course generation: {e}")
        return jsonify({
            'pipeline_success': False,
            'error': str(e)
        }), 500

@app.route('/api/resume-course', methods=['POST', 'OPTIONS'])
def resume_course():
    """Resume course generation from partial to full"""
    
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return jsonify({'message': 'OK'}), 200
    
    try:
        # Get request data
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['plan_id', 'employee_id', 'company_id', 'assigned_by_id']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'pipeline_success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Check if pipeline is available
        if not resume_course_generation:
            return jsonify({
                'pipeline_success': False,
                'error': 'Resume pipeline not properly initialized'
            }), 500
        
        logger.info(f"Starting course resume for plan: {data['plan_id']}")
        
        # Run the async resume pipeline
        result = asyncio.run(
            resume_course_generation(
                plan_id=data['plan_id'],
                employee_id=data['employee_id'],
                company_id=data['company_id'],
                assigned_by_id=data['assigned_by_id'],
                job_id=data.get('job_id')
            )
        )
        
        logger.info(f"Resume pipeline completed for plan: {data['plan_id']}")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in course resume: {e}")
        return jsonify({
            'pipeline_success': False,
            'error': str(e)
        }), 500

@app.route('/', methods=['GET'])
def root():
    """Root endpoint"""
    return jsonify({
        'service': 'LXERA Agent Pipeline',
        'status': 'running',
        'endpoints': {
            'ping': '/ping',
            'health': '/health',
            'generate_course': '/api/generate-course',
            'resume_course': '/api/resume-course',
            'sentry_test': '/sentry-test',
            'sentry_performance_test': '/sentry-performance-test'
        }
    })

@app.route('/sentry-test', methods=['GET'])
def trigger_error():
    """Test endpoint to verify Sentry integration"""
    # This will be captured by Sentry
    division_by_zero = 1 / 0
    return jsonify({'message': 'This should not be reached'})

@app.route('/sentry-performance-test', methods=['GET'])
def test_performance():
    """Test endpoint to verify Sentry performance monitoring"""
    with sentry_sdk.start_transaction(op="test", name="Performance Test"):
        # Simulate some work
        with sentry_sdk.start_span(op="process", description="Processing data"):
            time.sleep(0.1)  # Simulate processing
        
        # Make a simple OpenAI call to test LLM monitoring
        with sentry_sdk.start_span(op="openai", description="Test OpenAI call"):
            try:
                client = openai.OpenAI()
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant."},
                        {"role": "user", "content": "Say 'Sentry monitoring is working!' in 5 words or less."}
                    ],
                    max_tokens=20
                )
                ai_response = response.choices[0].message.content
            except Exception as e:
                ai_response = f"OpenAI error: {str(e)}"
        
        return jsonify({
            'message': 'Performance test completed',
            'ai_response': ai_response,
            'traces': 'Check Sentry Performance tab'
        })

# Production WSGI setup - Gunicorn will import this app object
if __name__ == '__main__':
    # This is only for local development - Gunicorn will handle production
    port = int(os.environ.get('PORT', 10000))
    logger.info(f"Starting LXERA Agent Pipeline in development mode on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
else:
    # Production logging setup
    logger.info("LXERA Agent Pipeline starting in production mode with Gunicorn")