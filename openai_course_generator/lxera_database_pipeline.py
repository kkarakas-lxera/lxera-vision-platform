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

# Import the existing pipeline orchestrator with error handling
try:
    from database_pipeline_orchestrator import DatabasePipelineOrchestrator
except ImportError as e:
    logger.error(f"Could not import DatabasePipelineOrchestrator: {e}")
    # Create a minimal functional orchestrator that can be extended
    class DatabasePipelineOrchestrator:
        def __init__(self):
            self.agents = {}
            logger.warning("Using minimal DatabasePipelineOrchestrator - some features may be limited")

class LXERADatabasePipeline(DatabasePipelineOrchestrator):
    """
    Extended pipeline orchestrator that integrates with LXERA's Supabase database
    to retrieve employee data and skills gap analysis.
    """
    
    def __init__(self):
        super().__init__()
        
        # Initialize Supabase client with LXERA credentials
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_ANON_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) must be set")
            
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
            
            # Phase 3: Prepare module specifications
            module_spec = self._prepare_module_spec(employee_data, skills_gaps)
            
            # Phase 4: Prepare research context from skills gaps
            research_context = self._prepare_research_context(skills_gaps, employee_data)
            
            # Run the complete pipeline with prepared data
            pipeline_result = await self.run_complete_pipeline(
                employee_data,
                module_spec,
                research_context
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
    
    def _prepare_module_spec(self, employee_data: Dict[str, Any], skills_gaps: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Prepare module specifications based on employee data and skills gaps."""
        
        # Prioritize critical and major gaps
        priority_gaps = [g for g in skills_gaps if g['gap_severity'] in ['critical', 'major']][:7]
        
        # Determine priority level
        has_critical = any(g['gap_severity'] == 'critical' for g in skills_gaps)
        priority_level = 'high' if has_critical else 'medium'
        
        return {
            'module_name': f"{employee_data['job_title_current']} Skills Development Program",
            'employee_name': employee_data['full_name'],
            'target_word_count': 7500,
            'priority_level': priority_level,
            'difficulty_level': 'intermediate',
            'personalization_level': 'advanced',
            'learning_objectives': [
                {
                    'skill': gap['skill_name'],
                    'from_level': gap['current_level'],
                    'to_level': gap['required_level'],
                    'skill_type': gap['skill_type']
                }
                for gap in priority_gaps
            ],
            'key_tools': list(set([g['skill_name'] for g in priority_gaps[:5]])),
            'career_context': {
                'current_role': employee_data['job_title_current'],
                'target_role': employee_data['career_aspirations_next_role'],
                'department': employee_data.get('department', 'General')
            }
        }
    
    def _prepare_research_context(self, skills_gaps: List[Dict[str, Any]], employee_data: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare research context from skills gaps for the research agent."""
        return {
            'skills_to_research': [
                {
                    'skill_name': gap['skill_name'],
                    'skill_type': gap['skill_type'],
                    'gap_severity': gap['gap_severity'],
                    'context': f"For {employee_data['job_title_current']} in {employee_data.get('department', 'the organization')}"
                }
                for gap in skills_gaps[:5]  # Top 5 gaps for research
            ],
            'industry_context': employee_data.get('department', 'General Business'),
            'role_context': employee_data['job_title_current'],
            'existing_tools': employee_data.get('tools_software_used_regularly', [])
        }
    
    async def _create_course_assignment(
        self,
        employee_id: str,
        content_id: str,
        company_id: str,
        assigned_by_id: str
    ) -> str:
        """Create course assignment in database."""
        try:
            due_date = datetime.now()
            due_date = due_date.replace(day=due_date.day + 30)
            
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
            }).select('id').single().execute()
            
            logger.info(f"✅ Created course assignment: {response.data['id']}")
            return response.data['id']
            
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