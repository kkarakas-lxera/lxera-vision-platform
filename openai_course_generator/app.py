"""
Render Web Service Entry Point for LXERA Agent Pipeline
This is the main application that Render will run to host our agent pipeline.
"""
import os
import asyncio
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import our pipeline with detailed error reporting
generate_course_with_agents = None
pipeline_import_error = None

try:
    from lxera_database_pipeline import generate_course_with_agents
    logger.info("Successfully imported LXERA agent pipeline")
except ImportError as e:
    pipeline_import_error = f"Import error: {str(e)}"
    logger.error(f"Failed to import pipeline: {e}")
except Exception as e:
    pipeline_import_error = f"Pipeline initialization error: {str(e)}"
    logger.error(f"Pipeline initialization failed: {e}")

# Create Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

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
        
        # Run the async pipeline in a new event loop
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(
                generate_course_with_agents(
                    employee_id=data['employee_id'],
                    company_id=data['company_id'],
                    assigned_by_id=data['assigned_by_id'],
                    job_id=data.get('job_id')
                )
            )
            
            logger.info(f"Pipeline completed successfully for employee: {data['employee_id']}")
            return jsonify(result)
            
        finally:
            loop.close()
        
    except Exception as e:
        logger.error(f"Error in course generation: {e}")
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
            'health': '/health',
            'generate_course': '/api/generate-course'
        }
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