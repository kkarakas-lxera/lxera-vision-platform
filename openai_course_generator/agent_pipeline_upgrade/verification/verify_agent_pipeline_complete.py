#!/usr/bin/env python3
"""
Complete Verification System for Agent Pipeline
Tests ALL components with real data, real API calls, real database operations
NO MOCKS, NO SIMPLIFICATIONS - 100% PRODUCTION VERIFICATION
"""

import os
import json
import asyncio
import logging
from datetime import datetime
import requests
from typing import Dict, Any, List
from supabase import create_client
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AgentPipelineVerificationSystem:
    """Complete verification of the existing agent pipeline structure."""
    
    def __init__(self):
        # Use EXACT production configuration
        self.render_api_url = os.getenv('RENDER_API_URL', 'https://lxera-agent-pipeline.onrender.com')
        self.supabase_url = 'https://xwfweumeryrgbguwrocr.supabase.co'
        self.supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZndldW1lcnlyZ2JndXdyb2NyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc2MzQ0MCwiZXhwIjoyMDY2MzM5NDQwfQ.qxXpBxUKhKA4AQT4UQnIEJGbGNrRDMbBroZU8YaypSY')
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        
        # Initialize Supabase client
        self.supabase = create_client(self.supabase_url, self.supabase_key)
        
        # Test data - Kubilay's real employee ID
        self.test_employee_id = "bbe12b3c-b305-4fdf-8c17-de7296cce3a9"
        self.test_company_id = None  # Will fetch from employee
        self.test_user_id = None  # Will use first admin user
        
        # Verification results
        self.verification_results = {
            "timestamp": datetime.now().isoformat(),
            "components_tested": [],
            "failures": [],
            "successes": [],
            "database_operations": [],
            "api_calls": [],
            "agent_tool_calls": []
        }
    
    async def run_complete_verification(self):
        """Run complete verification of all pipeline components."""
        logger.info("🔍 STARTING COMPLETE PIPELINE VERIFICATION")
        logger.info("=" * 80)
        
        # 1. Verify Database Connectivity
        await self.verify_database_connectivity()
        
        # 2. Verify Employee Data Exists
        await self.verify_employee_data()
        
        # 3. Verify Skills Gap Analysis
        await self.verify_skills_gap_analysis()
        
        # 4. Verify Render API Health
        await self.verify_render_api()
        
        # 5. Verify Agent Pipeline Components
        await self.verify_agent_components()
        
        # 6. Run Full Pipeline Test
        await self.verify_full_pipeline_execution()
        
        # 7. Verify Database Storage
        await self.verify_database_storage()
        
        # 8. Generate Verification Report
        self.generate_verification_report()
    
    async def verify_database_connectivity(self):
        """Verify all database tables are accessible."""
        logger.info("\n📊 VERIFYING DATABASE CONNECTIVITY")
        
        tables_to_verify = [
            'employees',
            'st_employee_skills_profile',
            'cm_module_content',
            'cm_quality_assessments',
            'cm_enhancement_sessions',
            'cm_research_sessions',
            'cm_content_sections',
            'course_assignments',
            'course_section_progress',
            'mm_multimedia_sessions',
            # Check for missing tables too
            'cm_course_plans',  # Expected to fail
            'cm_agent_handoffs',  # Expected to fail
            'course_generation_jobs'  # Expected to fail
        ]
        
        for table in tables_to_verify:
            try:
                result = self.supabase.table(table).select('*').limit(1).execute()
                self.verification_results["successes"].append(f"✅ Table {table} accessible")
                self.verification_results["database_operations"].append({
                    "operation": "verify_table",
                    "table": table,
                    "success": True
                })
                logger.info(f"✅ Table {table} exists and is accessible")
            except Exception as e:
                self.verification_results["failures"].append(f"❌ Table {table}: {str(e)}")
                logger.error(f"❌ Table {table} not found or inaccessible: {e}")
    
    async def verify_employee_data(self):
        """Verify employee data exists and is complete."""
        logger.info("\n👤 VERIFYING EMPLOYEE DATA")
        
        try:
            # Fetch employee with all related data
            result = self.supabase.table('employees').select("""
                id,
                position,
                department,
                career_goal,
                key_tools,
                company_id,
                skill_level,
                cv_extracted_data,
                users!inner (
                    full_name,
                    email
                )
            """).eq('id', self.test_employee_id).single().execute()
            
            if result.data:
                self.test_company_id = result.data['company_id']
                logger.info(f"✅ Employee found: {result.data['users']['full_name']}")
                logger.info(f"✅ Position: {result.data['position']}")
                logger.info(f"✅ Company ID: {self.test_company_id}")
                logger.info(f"✅ CV Data: {'Available' if result.data.get('cv_extracted_data') else 'Not available'}")
                self.verification_results["successes"].append("Employee data verified")
                self.verification_results["database_operations"].append({
                    "operation": "fetch_employee",
                    "employee_id": self.test_employee_id,
                    "success": True
                })
            else:
                raise Exception("Employee not found")
                
        except Exception as e:
            self.verification_results["failures"].append(f"Employee data error: {str(e)}")
            logger.error(f"❌ Failed to verify employee: {e}")
    
    async def verify_skills_gap_analysis(self):
        """Verify skills gap analysis exists."""
        logger.info("\n📈 VERIFYING SKILLS GAP ANALYSIS")
        
        try:
            result = self.supabase.table('st_employee_skills_profile').select(
                'employee_id, gap_analysis_completed_at, skills_match_score, technical_skills, soft_skills'
            ).eq('employee_id', self.test_employee_id).single().execute()
            
            if result.data and result.data['gap_analysis_completed_at']:
                logger.info(f"✅ Skills gap analysis completed at: {result.data['gap_analysis_completed_at']}")
                logger.info(f"✅ Skills match score: {result.data['skills_match_score']}")
                logger.info(f"✅ Technical skills: {len(result.data.get('technical_skills', []))} found")
                logger.info(f"✅ Soft skills: {len(result.data.get('soft_skills', []))} found")
                self.verification_results["successes"].append("Skills gap analysis verified")
            else:
                logger.warning("⚠️ Skills gap analysis not completed")
                self.verification_results["failures"].append("No completed skills gap analysis")
                
        except Exception as e:
            self.verification_results["failures"].append(f"Skills gap error: {str(e)}")
            logger.error(f"❌ Failed to verify skills gap: {e}")
    
    async def verify_render_api(self):
        """Verify Render API is accessible and healthy."""
        logger.info("\n🌐 VERIFYING RENDER API")
        
        try:
            # Test health endpoint
            health_url = f"{self.render_api_url}/health"
            logger.info(f"Testing: {health_url}")
            
            response = requests.get(health_url, timeout=10)
            
            if response.status_code == 200:
                health_data = response.json()
                logger.info(f"✅ Render API healthy: {health_data['status']}")
                logger.info(f"✅ Pipeline available: {health_data['pipeline_available']}")
                logger.info(f"✅ Environment checks: {health_data.get('environment_check', {})}")
                
                self.verification_results["successes"].append("Render API verified")
                self.verification_results["api_calls"].append({
                    "endpoint": "/health",
                    "status": 200,
                    "response": health_data
                })
            else:
                raise Exception(f"API returned status {response.status_code}")
                
        except Exception as e:
            self.verification_results["failures"].append(f"Render API error: {str(e)}")
            logger.error(f"❌ Failed to verify Render API: {e}")
    
    async def verify_agent_components(self):
        """Verify individual agent components are loaded."""
        logger.info("\n🤖 VERIFYING AGENT COMPONENTS")
        
        # Import and verify each agent
        agents_to_verify = [
            ('planning_agent', 'from course_agents.planning_agent import create_planning_agent'),
            ('research_agent', 'from course_agents.research_agent import create_research_agent'),
            ('content_agent', 'from course_agents.database_agents import create_database_content_agent'),
            ('quality_agent', 'from course_agents.database_agents import create_database_quality_agent'),
            ('enhancement_agent', 'from course_agents.database_agents import create_database_enhancement_agent'),
            ('multimedia_agent', 'from course_agents.multimedia_agent import create_multimedia_agent'),
            ('finalizer_agent', 'from course_agents.finalizer_agent import create_finalizer_agent')
        ]
        
        for agent_name, import_statement in agents_to_verify:
            try:
                # Import the agent
                exec(import_statement, globals())
                
                # Try to create the agent
                if agent_name == 'planning_agent':
                    agent = create_planning_agent()
                elif agent_name == 'research_agent':
                    agent = create_research_agent()
                elif agent_name == 'content_agent':
                    agent = create_database_content_agent()
                elif agent_name == 'quality_agent':
                    agent = create_database_quality_agent()
                elif agent_name == 'enhancement_agent':
                    agent = create_database_enhancement_agent()
                elif agent_name == 'multimedia_agent':
                    agent = create_multimedia_agent()
                elif agent_name == 'finalizer_agent':
                    agent = create_finalizer_agent()
                
                # Check agent properties
                logger.info(f"✅ {agent_name} created successfully")
                logger.info(f"   - Name: {agent.name}")
                logger.info(f"   - Tools: {len(agent.tools)} tools")
                logger.info(f"   - Handoffs: {len(agent.handoffs)} handoffs")
                
                self.verification_results["successes"].append(f"{agent_name} verified")
                self.verification_results["components_tested"].append({
                    "agent": agent_name,
                    "tools_count": len(agent.tools),
                    "handoffs_count": len(agent.handoffs)
                })
                
            except Exception as e:
                self.verification_results["failures"].append(f"{agent_name} import failed: {str(e)}")
                logger.error(f"❌ Failed to import {agent_name}: {e}")
    
    async def verify_full_pipeline_execution(self):
        """Execute full pipeline through Render API."""
        logger.info("\n🚀 VERIFYING FULL PIPELINE EXECUTION")
        
        try:
            # Get a user to act as assigned_by
            admin_result = self.supabase.table('users').select('id').limit(1).execute()
            if not admin_result.data:
                raise Exception("No users found")
            
            assigned_by_id = admin_result.data[0]['id']
            
            # Prepare request data
            request_data = {
                "employee_id": self.test_employee_id,
                "company_id": self.test_company_id,
                "assigned_by_id": assigned_by_id
            }
            
            logger.info(f"📤 Sending request to {self.render_api_url}/api/generate-course")
            logger.info(f"Request data: {json.dumps(request_data, indent=2)}")
            
            # Call Render API
            response = requests.post(
                f"{self.render_api_url}/api/generate-course",
                json=request_data,
                headers={"Content-Type": "application/json"},
                timeout=300  # 5 minute timeout
            )
            
            logger.info(f"Response status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                logger.info(f"✅ Pipeline execution successful")
                logger.info(f"✅ Content ID: {result.get('content_id')}")
                logger.info(f"✅ Session ID: {result.get('session_id')}")
                logger.info(f"✅ Assignment ID: {result.get('assignment_id')}")
                
                self.verification_results["successes"].append("Full pipeline executed")
                self.verification_results["api_calls"].append({
                    "endpoint": "/api/generate-course",
                    "status": 200,
                    "content_id": result.get('content_id'),
                    "session_id": result.get('session_id'),
                    "assignment_id": result.get('assignment_id')
                })
                
                # Store for later verification
                self.last_content_id = result.get('content_id')
                self.last_session_id = result.get('session_id')
                self.last_assignment_id = result.get('assignment_id')
                
            else:
                error_msg = f"Pipeline returned status {response.status_code}: {response.text}"
                self.verification_results["failures"].append(error_msg)
                logger.error(f"❌ {error_msg}")
                
        except Exception as e:
            self.verification_results["failures"].append(f"Pipeline execution error: {str(e)}")
            logger.error(f"❌ Failed to execute pipeline: {e}")
    
    async def verify_database_storage(self):
        """Verify all expected data was stored."""
        logger.info("\n💾 VERIFYING DATABASE STORAGE")
        
        if not hasattr(self, 'last_content_id'):
            logger.warning("⚠️ No content_id to verify - pipeline may not have executed")
            return
        
        # Verify content storage
        try:
            content = self.supabase.table('cm_module_content').select('*').eq(
                'content_id', self.last_content_id
            ).single().execute()
            
            if content.data:
                logger.info(f"✅ Content stored with ID: {self.last_content_id}")
                logger.info(f"✅ Module name: {content.data['module_name']}")
                logger.info(f"✅ Status: {content.data['status']}")
                logger.info(f"✅ Word count: {content.data.get('total_word_count', 0)}")
                
                # Check sections
                sections = ['introduction', 'core_content', 'practical_applications', 'case_studies', 'assessments']
                sections_with_content = 0
                for section in sections:
                    if content.data.get(section):
                        logger.info(f"✅ Section '{section}' has content ({len(content.data[section])} chars)")
                        sections_with_content += 1
                
                logger.info(f"✅ Total sections with content: {sections_with_content}/{len(sections)}")
                self.verification_results["successes"].append("Content storage verified")
                
        except Exception as e:
            self.verification_results["failures"].append(f"Content verification error: {str(e)}")
            logger.error(f"❌ Failed to verify content: {e}")
        
        # Verify quality assessments
        try:
            quality = self.supabase.table('cm_quality_assessments').select('*').eq(
                'content_id', self.last_content_id
            ).execute()
            
            if quality.data:
                logger.info(f"✅ Quality assessments: {len(quality.data)} found")
                for assessment in quality.data:
                    logger.info(f"  - Score: {assessment['overall_score']}, Passed: {assessment['passed']}")
                self.verification_results["successes"].append("Quality assessments verified")
            else:
                logger.warning("⚠️ No quality assessments found")
                    
        except Exception as e:
            logger.warning(f"⚠️ Quality assessment check failed: {e}")
        
        # Verify course assignment
        try:
            if hasattr(self, 'last_assignment_id'):
                assignment = self.supabase.table('course_assignments').select('*').eq(
                    'id', self.last_assignment_id
                ).single().execute()
                
                if assignment.data:
                    logger.info(f"✅ Course assignment created with ID: {self.last_assignment_id}")
                    logger.info(f"✅ Status: {assignment.data['status']}")
                    logger.info(f"✅ Due date: {assignment.data.get('due_date')}")
                    self.verification_results["successes"].append("Course assignment verified")
                
        except Exception as e:
            logger.warning(f"⚠️ Assignment check failed: {e}")
        
        # Check for missing tables
        logger.info("\n🔍 CHECKING FOR MISSING TABLES")
        
        # Check cm_course_plans (expected to be missing)
        try:
            plans = self.supabase.table('cm_course_plans').select('*').limit(1).execute()
            logger.info("✅ cm_course_plans table exists")
        except:
            logger.warning("❌ cm_course_plans table is missing (Planning agent results not stored)")
        
        # Check if research was stored
        try:
            research = self.supabase.table('cm_research_sessions').select('*').eq(
                'session_id', self.last_session_id
            ).execute()
            if research.data:
                logger.info(f"✅ Research sessions: {len(research.data)} found")
            else:
                logger.warning("❌ No research sessions found (Research agent not storing results)")
        except Exception as e:
            logger.error(f"❌ Research check failed: {e}")
    
    def generate_verification_report(self):
        """Generate comprehensive verification report."""
        logger.info("\n📄 VERIFICATION REPORT")
        logger.info("=" * 80)
        
        # Save detailed report
        os.makedirs('../logs', exist_ok=True)
        report_file = f"../logs/verification_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(self.verification_results, f, indent=2)
        
        # Print summary
        logger.info(f"✅ Successes: {len(self.verification_results['successes'])}")
        logger.info(f"❌ Failures: {len(self.verification_results['failures'])}")
        logger.info(f"📊 Database operations: {len(self.verification_results['database_operations'])}")
        logger.info(f"🌐 API calls: {len(self.verification_results['api_calls'])}")
        logger.info(f"🤖 Components tested: {len(self.verification_results['components_tested'])}")
        
        if self.verification_results['failures']:
            logger.info("\n⚠️ FAILURES DETECTED:")
            for failure in self.verification_results['failures']:
                logger.error(f"  - {failure}")
        else:
            logger.info("\n🎉 ALL VERIFICATIONS PASSED!")
        
        logger.info(f"\n📄 Detailed report saved to: {report_file}")
        
        # System readiness assessment
        total_checks = len(self.verification_results['successes']) + len(self.verification_results['failures'])
        success_rate = (len(self.verification_results['successes']) / total_checks * 100) if total_checks > 0 else 0
        
        logger.info(f"\n📊 SYSTEM READINESS: {success_rate:.1f}%")
        
        return len(self.verification_results['failures']) == 0

async def main():
    """Run the complete verification system."""
    verifier = AgentPipelineVerificationSystem()
    success = await verifier.run_complete_verification()
    
    if success:
        logger.info("\n✅ PIPELINE VERIFICATION COMPLETE - ALL SYSTEMS OPERATIONAL")
    else:
        logger.error("\n❌ PIPELINE VERIFICATION FAILED - SEE REPORT FOR DETAILS")
    
    return success

if __name__ == "__main__":
    # Ensure all required environment variables are set
    required_env = ['OPENAI_API_KEY']
    missing_env = [var for var in required_env if not os.getenv(var)]
    
    if missing_env:
        logger.error(f"Missing required environment variables: {missing_env}")
        logger.info("Please set: export OPENAI_API_KEY=your_key_here")
        exit(1)
    
    # Run verification
    success = asyncio.run(main())
    exit(0 if success else 1)