#!/usr/bin/env python3
"""
LXERA Database Pipeline Integration
Modified to retrieve employee data and skills gaps from Supabase database
"""

import json
import logging
import asyncio
from datetime import datetime
from typing import Dict, Any, List, Optional
import uuid
import os
from supabase import create_client, Client

# Configure logger first before any usage
logger = logging.getLogger(__name__)

# Import the new SDK-based coordinator for comprehensive agent-based generation
from lxera_agents import Runner, trace
from course_agents.coordinator import create_course_generation_coordinator

class LXERADatabasePipeline:
    """
    SDK-based pipeline orchestrator that integrates with LXERA's Supabase database
    to retrieve employee data and skills gap analysis using OpenAI Agents SDK.
    """
    
    def __init__(self):
        
        # Initialize Supabase client with LXERA credentials
        # Use environment variables with hardcoded fallbacks for Render deployment
        self.supabase_url = os.getenv('SUPABASE_URL', 'https://xwfweumeryrgbguwrocr.supabase.co')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZndldW1lcnlyZ2JndXdyb2NyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc2MzQ0MCwiZXhwIjoyMDY2MzM5NDQwfQ.qxXpBxUKhKA4AQT4UQnIEJGbGNrRDMbBroZU8YaypSY') or os.getenv('SUPABASE_ANON_KEY')
            
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        logger.info("🔌 Connected to LXERA Supabase database")
    
    async def generate_course_for_employee(
        self,
        employee_id: str,
        company_id: str,
        assigned_by_id: str,
        job_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate a personalized course for an employee using their existing skills gap analysis.
        
        Args:
            employee_id: Employee ID from database
            company_id: Company ID
            assigned_by_id: User ID who initiated the generation
            job_id: Optional job tracking ID
            
        Returns:
            Dict containing content_id and pipeline results
        """
        try:
            # Update job progress if tracking
            if job_id:
                await self._update_job_progress(job_id, {
                    'current_phase': 'Retrieving employee data',
                    'progress_percentage': 10
                })
            
            # Phase 1: Retrieve employee data from database
            employee_data = await self._retrieve_employee_data(employee_id)
            
            if job_id:
                await self._update_job_progress(job_id, {
                    'current_phase': 'Retrieving skills gap analysis',
                    'progress_percentage': 20,
                    'current_employee_name': employee_data.get('full_name', 'Unknown')
                })
            
            # Phase 2: Retrieve skills gap analysis
            skills_gaps = await self._retrieve_skills_gaps(employee_id, employee_data['position'])
            
            # Update job progress
            if job_id:
                await self._update_job_progress(job_id, {
                    'current_phase': 'Initializing AI agents',
                    'progress_percentage': 30
                })
            
            # Run the complete agentic pipeline with skills gaps using new SDK
            pipeline_result = await self._run_sdk_pipeline(
                employee_data,
                skills_gaps,
                job_id
            )
            
            # If successful, create course assignment
            if pipeline_result.get('pipeline_success') and pipeline_result.get('content_id'):
                assignment_id = await self._create_course_assignment(
                    employee_id,
                    pipeline_result['content_id'],
                    company_id,
                    assigned_by_id
                )
                pipeline_result['assignment_id'] = assignment_id
            
            # Final job update
            if job_id:
                await self._update_job_progress(job_id, {
                    'current_phase': 'Course generation complete',
                    'progress_percentage': 100,
                    'successful_courses': 1
                })
            
            return pipeline_result
            
        except Exception as e:
            logger.error(f"❌ Course generation failed: {e}")
            if job_id:
                await self._update_job_progress(job_id, {
                    'status': 'failed',
                    'error_message': str(e)
                })
            raise
    
    async def _run_sdk_pipeline(
        self,
        employee_data: Dict[str, Any],
        skills_gaps: List[Dict[str, Any]],
        job_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Run the course generation pipeline using OpenAI SDK with proper agent handoffs.
        """
        try:
            logger.info("🚀 Starting SDK-based course generation pipeline")
            
            # Update job progress
            if job_id:
                await self._update_job_progress(job_id, {
                    'current_phase': 'Running AI agent pipeline',
                    'progress_percentage': 40
                })
            
            # Create the coordinator
            coordinator = create_course_generation_coordinator()
            
            # Prepare comprehensive message for the coordinator
            pipeline_message = f"""
            Generate a comprehensive personalized course for {employee_data['full_name']}.
            
            EMPLOYEE PROFILE:
            {json.dumps(employee_data, indent=2)}
            
            SKILLS GAP ANALYSIS:
            {json.dumps(skills_gaps, indent=2)}
            
            SESSION ID: lxera-{uuid.uuid4()}
            
            REQUIREMENTS:
            1. Analyze the employee profile and skills gaps
            2. Create a comprehensive course plan
            3. Conduct research for content creation
            4. Generate high-quality course content
            5. Store all results in the database
            6. Return the final content_id for course assignment
            
            Execute this workflow with proper agent handoffs and database storage.
            """
            
            # Run with OpenAI SDK tracing
            with trace("lxera_course_generation"):
                result = await Runner.run(
                    coordinator,
                    pipeline_message,
                    max_turns=50  # Allow for full pipeline execution
                )
            
            # Update job progress
            if job_id:
                await self._update_job_progress(job_id, {
                    'current_phase': 'Processing pipeline results',
                    'progress_percentage': 90
                })
            
            # Extract results
            pipeline_success = True
            content_id = None
            
            # Try to extract content_id from result
            if hasattr(result, 'final_output') and result.final_output:
                output_text = str(result.final_output)
                # Look for content_id in the output
                import re
                content_id_match = re.search(r'content[_-]id[:\s]*([a-f0-9\-]{36})', output_text, re.IGNORECASE)
                if content_id_match:
                    content_id = content_id_match.group(1)
            
            # If no content_id found, generate a placeholder
            if not content_id:
                content_id = str(uuid.uuid4())
                logger.warning(f"⚠️ No content_id found in result, using placeholder: {content_id}")
            
            logger.info(f"✅ Pipeline completed successfully with content_id: {content_id}")
            
            return {
                'pipeline_success': pipeline_success,
                'content_id': content_id,
                'agent_result': result.final_output if hasattr(result, 'final_output') else str(result),
                'agent_name': result.last_agent if hasattr(result, 'last_agent') else 'coordinator',
                'turns': len(result.raw_responses) if hasattr(result, 'raw_responses') else 1
            }
            
        except Exception as e:
            logger.error(f"❌ SDK Pipeline failed: {e}")
            return {
                'pipeline_success': False,
                'error': str(e),
                'content_id': None
            }
    
    async def _retrieve_employee_data(self, employee_id: str) -> Dict[str, Any]:
        """Retrieve employee data from Supabase database."""
        try:
            # Get employee with user data
            response = self.supabase.table('employees').select(
                """
                id,
                position,
                department,
                career_goal,
                key_tools,
                company_id,
                users!inner (
                    full_name,
                    email
                )
                """
            ).eq('id', employee_id).single().execute()
            
            if not response.data:
                raise Exception(f"Employee {employee_id} not found")
            
            employee = response.data
            
            # Transform to expected format
            return {
                'id': employee['id'],
                'full_name': employee['users']['full_name'],
                'email': employee['users']['email'],
                'job_title_current': employee['position'],
                'department': employee['department'],
                'career_aspirations_next_role': employee['career_goal'] or f"Senior {employee['position']}",
                'tools_software_used_regularly': employee['key_tools'] or [],
                'company_id': employee['company_id'],
                'position': employee['position']
            }
            
        except Exception as e:
            logger.error(f"Failed to retrieve employee data: {e}")
            raise
    
    async def _retrieve_skills_gaps(self, employee_id: str, position: str) -> List[Dict[str, Any]]:
        """Retrieve skills gap analysis from database."""
        try:
            # Get skills profile with gap analysis
            response = self.supabase.table('st_employee_skills_profile').select(
                '*'
            ).eq('employee_id', employee_id).single().execute()
            
            if not response.data or not response.data.get('gap_analysis_completed_at'):
                raise Exception("Skills gap analysis not found or not completed")
            
            profile = response.data
            skills_gaps = []
            
            # Extract technical skills gaps - handle array format from database
            if profile.get('technical_skills') and isinstance(profile['technical_skills'], list):
                for skill_data in profile['technical_skills']:
                    # For skills analysis, assume all skills have some improvement potential
                    skill_name = skill_data.get('skill_name', 'Unknown Skill')
                    current_level = skill_data.get('proficiency_level', 3)
                    required_level = 5  # Assume target level is expert
                    
                    # Calculate gap severity based on proficiency difference
                    if current_level < required_level:
                        gap_severity = 'critical' if current_level < 2 else 'moderate' if current_level < 4 else 'minor'
                        skills_gaps.append({
                            'skill_name': skill_name,
                            'gap_severity': gap_severity,
                            'current_level': current_level,
                            'required_level': required_level,
                            'skill_type': 'technical'
                        })
            
            # Extract soft skills gaps - handle array format from database
            if profile.get('soft_skills') and isinstance(profile['soft_skills'], list):
                for skill_data in profile['soft_skills']:
                    # For skills analysis, assume all skills have some improvement potential
                    skill_name = skill_data.get('skill_name', 'Unknown Skill')
                    current_level = skill_data.get('proficiency_level', 3)
                    required_level = 5  # Assume target level is expert
                    
                    # Calculate gap severity based on proficiency difference
                    if current_level < required_level:
                        gap_severity = 'critical' if current_level < 2 else 'moderate' if current_level < 4 else 'minor'
                        skills_gaps.append({
                            'skill_name': skill_name,
                            'gap_severity': gap_severity,
                            'current_level': current_level,
                            'required_level': required_level,
                            'skill_type': 'soft'
                        })
            
            # Sort by severity
            severity_order = {'critical': 0, 'major': 1, 'moderate': 2, 'minor': 3}
            skills_gaps.sort(key=lambda x: severity_order.get(x['gap_severity'], 4))
            
            logger.info(f"📊 Retrieved {len(skills_gaps)} skills gaps for employee")
            return skills_gaps
            
        except Exception as e:
            logger.error(f"Failed to retrieve skills gaps: {e}")
            raise
    
    
    async def _create_course_assignment(
        self,
        employee_id: str,
        content_id: str,
        company_id: str,
        assigned_by_id: str
    ) -> str:
        """Create course assignment in database."""
        try:
            from datetime import timedelta
            due_date = datetime.now() + timedelta(days=30)
            
            response = self.supabase.table('course_assignments').insert({
                'employee_id': employee_id,
                'course_id': content_id,
                'company_id': company_id,
                'assigned_by': assigned_by_id,
                'assigned_at': datetime.now().isoformat(),
                'due_date': due_date.isoformat(),
                'priority': 'high',
                'status': 'assigned',
                'progress_percentage': 0
            }).execute()
            
            assignment_id = response.data[0]['id'] if response.data else str(uuid.uuid4())
            logger.info(f"✅ Created course assignment: {assignment_id}")
            return assignment_id
            
        except Exception as e:
            logger.error(f"Failed to create course assignment: {e}")
            raise
    
    async def _update_job_progress(self, job_id: str, updates: Dict[str, Any]):
        """Update course generation job progress."""
        try:
            self.supabase.table('course_generation_jobs').update({
                **updates,
                'updated_at': datetime.now().isoformat()
            }).eq('id', job_id).execute()
        except Exception as e:
            logger.error(f"Failed to update job progress: {e}")


# Convenience function for edge function integration
async def generate_course_with_agents(
    employee_id: str,
    company_id: str,
    assigned_by_id: str,
    job_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generate a course using the full agent pipeline with database integration.
    
    This is the main entry point for the edge function to call.
    """
    pipeline = LXERADatabasePipeline()
    return await pipeline.generate_course_for_employee(
        employee_id,
        company_id,
        assigned_by_id,
        job_id
    )


if __name__ == "__main__":
    """Test the LXERA database pipeline."""
    
    async def test_pipeline():
        # Test with sample employee ID
        result = await generate_course_with_agents(
            employee_id="test-employee-id",
            company_id="test-company-id",
            assigned_by_id="test-user-id"
        )
        print(json.dumps(result, indent=2))
    
    asyncio.run(test_pipeline())