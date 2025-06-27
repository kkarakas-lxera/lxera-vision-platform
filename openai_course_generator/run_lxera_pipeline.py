#!/usr/bin/env python3
"""
LXERA Pipeline Runner
This script is called by the Supabase edge function to execute the agent pipeline
"""

import asyncio
import json
import sys
import os
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Ensure all required packages are available
try:
    from lxera_database_pipeline import generate_course_with_agents
except ImportError as e:
    logging.error(f"Import error: {e}")
    print(json.dumps({
        'pipeline_success': False,
        'error': f'Import error: {str(e)}'
    }))
    sys.exit(1)

async def main():
    """Main function to run the pipeline."""
    try:
        # Get parameters from command line arguments
        if len(sys.argv) < 5:
            raise ValueError("Missing required arguments: employee_id, company_id, assigned_by_id, job_id")
        
        employee_id = sys.argv[1]
        company_id = sys.argv[2]
        assigned_by_id = sys.argv[3]
        job_id = sys.argv[4] if sys.argv[4] != 'None' else None
        
        logging.info(f"Starting pipeline for employee: {employee_id}")
        
        # Run the agent pipeline
        result = await generate_course_with_agents(
            employee_id=employee_id,
            company_id=company_id,
            assigned_by_id=assigned_by_id,
            job_id=job_id
        )
        
        # Return the result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        logging.error(f"Pipeline execution failed: {e}")
        print(json.dumps({
            'pipeline_success': False,
            'error': str(e)
        }))
        sys.exit(1)

if __name__ == '__main__':
    asyncio.run(main())