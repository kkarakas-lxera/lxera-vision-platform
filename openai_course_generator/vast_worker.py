#!/usr/bin/env python3
"""
Vast.ai Course Generation Worker
Continuously polls Supabase for new course generation jobs and processes them
using the existing LangGraph pipeline.
"""

import asyncio
import logging
import time
import os
import socket
import uuid
import json
from datetime import datetime
from typing import Dict, Any, Optional, List
import sentry_sdk
from sentry_sdk import capture_exception, capture_message

# Import existing pipeline components
from lxera_database_pipeline import generate_course_with_agents, resume_course_generation
from agent_graph.config.settings import settings
from supabase import create_client, Client

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('/var/log/course_worker.log', mode='a')
    ]
)
logger = logging.getLogger(__name__)

# Initialize Sentry for error tracking
if settings.sentry_dsn:
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        traces_sample_rate=0.1,
        environment="vast-worker"
    )
    logger.info("🔍 Sentry monitoring initialized")

class VastCourseWorker:
    """Bounded concurrency worker for course generation on Vast.ai"""
    
    def __init__(self, max_concurrent_jobs: int = 2, poll_interval: int = 5):
        self.max_concurrent_jobs = max_concurrent_jobs
        self.poll_interval = poll_interval
        self.worker_id = f"vast-{socket.gethostname()}-{uuid.uuid4().hex[:8]}"
        self.running = False
        self.current_jobs: Dict[str, asyncio.Task] = {}
        
        # Initialize Supabase client
        self.supabase: Client = create_client(
            settings.supabase_url,
            settings.supabase_service_key
        )
        
        logger.info(f"🚀 Worker initialized: {self.worker_id}")
        logger.info(f"📊 Max concurrent jobs: {max_concurrent_jobs}")
        logger.info(f"⏱️  Poll interval: {poll_interval}s")
    
    async def start(self):
        """Start the worker daemon"""
        self.running = True
        logger.info("🎯 Worker daemon starting...")
        
        # Log worker startup
        capture_message(f"Course worker started: {self.worker_id}", level="info")
        
        while self.running:
            try:
                # Clean up completed jobs
                await self._cleanup_completed_jobs()
                
                # Check if we can accept more work
                if len(self.current_jobs) < self.max_concurrent_jobs:
                    job = await self._claim_next_job()
                    if job:
                        # Start processing job asynchronously
                        task = asyncio.create_task(self._process_job(job))
                        self.current_jobs[job['job_id']] = task
                        logger.info(f"📝 Started job {job['job_id']} ({len(self.current_jobs)}/{self.max_concurrent_jobs})")
                
                # Wait before next poll
                await asyncio.sleep(self.poll_interval)
                
            except Exception as e:
                logger.error(f"❌ Worker loop error: {e}")
                capture_exception(e)
                await asyncio.sleep(self.poll_interval * 2)  # Longer wait on error
    
    async def stop(self):
        """Gracefully stop the worker"""
        logger.info("🛑 Stopping worker...")
        self.running = False
        
        # Wait for current jobs to complete (max 5 minutes)
        if self.current_jobs:
            logger.info(f"⏳ Waiting for {len(self.current_jobs)} jobs to complete...")
            try:
                await asyncio.wait_for(
                    asyncio.gather(*self.current_jobs.values(), return_exceptions=True),
                    timeout=300
                )
            except asyncio.TimeoutError:
                logger.warning("⚠️  Jobs didn't complete in time, cancelling...")
                for job_id, task in self.current_jobs.items():
                    task.cancel()
                    # Release the job for retry
                    await self._release_job(job_id, "Worker shutdown timeout")
        
        logger.info("✅ Worker stopped")
    
    async def _cleanup_completed_jobs(self):
        """Remove completed job tasks from tracking"""
        completed = [job_id for job_id, task in self.current_jobs.items() if task.done()]
        for job_id in completed:
            task = self.current_jobs.pop(job_id)
            try:
                await task  # Get any exceptions
            except Exception as e:
                logger.error(f"❌ Job {job_id} completed with error: {e}")
    
    async def _claim_next_job(self) -> Optional[Dict[str, Any]]:
        """Claim the next available job from the queue"""
        try:
            response = self.supabase.rpc(
                'claim_next_course_job',
                {
                    'worker_id': self.worker_id,
                    'worker_timeout_minutes': 30
                }
            ).execute()
            
            if response.data and len(response.data) > 0:
                job_data = response.data[0]
                if job_data['claimed_successfully']:
                    logger.info(f"✅ Claimed job {job_data['job_id']} for company {job_data['company_id']}")
                    return job_data
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Failed to claim job: {e}")
            capture_exception(e)
            return None
    
    async def _process_job(self, job: Dict[str, Any]):
        """Process a single course generation job"""
        job_id = job['job_id']
        
        try:
            logger.info(f"🔄 Processing job {job_id}: {job['total_employees']} employees")
            
            # Update job status to processing
            await self._update_job_progress(job_id, {
                'current_phase': 'Initializing pipeline',
                'progress_percentage': 5
            })
            
            # Process each employee
            employee_ids = job['employee_ids'] or []
            results = []
            
            for i, employee_id in enumerate(employee_ids):
                try:
                    logger.info(f"👤 Processing employee {i+1}/{len(employee_ids)}: {employee_id}")
                    
                    # Update progress
                    progress = 10 + (i * 80 / len(employee_ids))
                    await self._update_job_progress(job_id, {
                        'current_phase': f'Processing employee {i+1}/{len(employee_ids)}',
                        'progress_percentage': progress,
                        'processed_employees': i
                    })
                    
                    # Use existing pipeline logic
                    result = await generate_course_with_agents(
                        employee_id=employee_id,
                        company_id=job['company_id'],
                        assigned_by_id=job['initiated_by'],
                        job_id=job_id,
                        generation_mode=job.get('generation_mode', 'full'),
                        plan_id=job.get('metadata', {}).get('employee_plan_id_map', {}).get(employee_id),
                        enable_multimedia=job.get('metadata', {}).get('enable_multimedia', False)
                    )
                    
                    if result.get('pipeline_success'):
                        results.append({
                            'employee_id': employee_id,
                            'status': 'success',
                            'course_id': result.get('content_id'),
                            'plan_id': result.get('plan_id')
                        })
                        logger.info(f"✅ Employee {employee_id} completed successfully")
                    else:
                        results.append({
                            'employee_id': employee_id,
                            'status': 'failed',
                            'error': result.get('error', 'Unknown error')
                        })
                        logger.error(f"❌ Employee {employee_id} failed: {result.get('error')}")
                
                except Exception as e:
                    logger.error(f"❌ Error processing employee {employee_id}: {e}")
                    capture_exception(e)
                    results.append({
                        'employee_id': employee_id,
                        'status': 'failed',
                        'error': str(e)
                    })
            
            # Complete the job
            successful_count = sum(1 for r in results if r['status'] == 'success')
            failed_count = len(results) - successful_count
            
            success = await self._complete_job(job_id, {
                'successful_courses': successful_count,
                'failed_courses': failed_count,
                'processed_employees': len(employee_ids),
                'results': results
            })
            
            if success:
                logger.info(f"🎉 Job {job_id} completed: {successful_count} success, {failed_count} failed")
            else:
                logger.error(f"❌ Failed to mark job {job_id} as completed")
        
        except Exception as e:
            logger.error(f"❌ Critical error processing job {job_id}: {e}")
            capture_exception(e)
            await self._release_job(job_id, f"Critical processing error: {str(e)}")
    
    async def _update_job_progress(self, job_id: str, updates: Dict[str, Any]):
        """Update job progress in database"""
        try:
            self.supabase.table('course_generation_jobs').update(updates).eq('id', job_id).execute()
            
            # Log progress event
            self.supabase.table('course_generation_job_events').insert({
                'job_id': job_id,
                'company_id': updates.get('company_id'),  # Will be null, but that's ok
                'event_type': 'progress',
                'event_data': updates,
                'worker_id': self.worker_id
            }).execute()
            
        except Exception as e:
            logger.error(f"❌ Failed to update job progress: {e}")
    
    async def _complete_job(self, job_id: str, results: Dict[str, Any]) -> bool:
        """Mark job as completed"""
        try:
            response = self.supabase.rpc(
                'complete_course_job',
                {
                    'job_id_param': job_id,
                    'worker_id_param': self.worker_id,
                    'results_data': json.dumps(results.get('results', []))
                }
            ).execute()
            
            # Update other fields
            self.supabase.table('course_generation_jobs').update({
                'successful_courses': results.get('successful_courses', 0),
                'failed_courses': results.get('failed_courses', 0),
                'processed_employees': results.get('processed_employees', 0),
                'progress_percentage': 100,
                'current_phase': 'Completed'
            }).eq('id', job_id).execute()
            
            return response.data[0] if response.data else False
            
        except Exception as e:
            logger.error(f"❌ Failed to complete job: {e}")
            capture_exception(e)
            return False
    
    async def _release_job(self, job_id: str, error_message: str = None):
        """Release job for retry"""
        try:
            self.supabase.rpc(
                'release_course_job',
                {
                    'job_id_param': job_id,
                    'worker_id_param': self.worker_id,
                    'retry_delay_minutes': 5,
                    'error_message': error_message
                }
            ).execute()
            
            logger.info(f"🔄 Released job {job_id} for retry")
            
        except Exception as e:
            logger.error(f"❌ Failed to release job: {e}")
            capture_exception(e)

async def main():
    """Main worker entry point"""
    worker = VastCourseWorker(
        max_concurrent_jobs=int(os.getenv('MAX_CONCURRENT_JOBS', '2')),
        poll_interval=int(os.getenv('POLL_INTERVAL_SECONDS', '5'))
    )
    
    try:
        await worker.start()
    except KeyboardInterrupt:
        logger.info("🛑 Received shutdown signal")
        await worker.stop()
    except Exception as e:
        logger.error(f"💥 Worker crashed: {e}")
        capture_exception(e)
        await worker.stop()
        raise

if __name__ == '__main__':
    asyncio.run(main())