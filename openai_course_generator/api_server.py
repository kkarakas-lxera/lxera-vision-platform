#!/usr/bin/env python3
"""
API Server for Agent Pipeline
This server exposes the agent pipeline as an HTTP endpoint for the edge function
"""

from flask import Flask, request, jsonify
import asyncio
import logging
import os
from lxera_database_pipeline import generate_course_with_agents, resume_course_generation

app = Flask(__name__)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.route('/generate-course', methods=['POST'])
def generate_course():
    """Generate a course using the agent pipeline."""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['employee_id', 'company_id', 'assigned_by_id']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Run the async pipeline
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        result = loop.run_until_complete(
            generate_course_with_agents(
                employee_id=data['employee_id'],
                company_id=data['company_id'],
                assigned_by_id=data['assigned_by_id'],
                job_id=data.get('job_id'),
                generation_mode=data.get('generation_mode', 'full')
            )
        )
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"API error: {e}")
        return jsonify({
            'pipeline_success': False,
            'error': str(e)
        }), 500

@app.route('/resume-course', methods=['POST'])
def resume_course():
    """Resume course generation from partial to full."""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['plan_id', 'employee_id', 'company_id', 'assigned_by_id']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Run the async resume pipeline
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        result = loop.run_until_complete(
            resume_course_generation(
                plan_id=data['plan_id'],
                employee_id=data['employee_id'],
                company_id=data['company_id'],
                assigned_by_id=data['assigned_by_id'],
                job_id=data.get('job_id')
            )
        )
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Resume API error: {e}")
        return jsonify({
            'pipeline_success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy', 'service': 'agent-pipeline'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)