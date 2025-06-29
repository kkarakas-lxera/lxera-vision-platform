#!/usr/bin/env python3
"""
Full pipeline end-to-end test with real data
Tests the complete flow from employee data to course generation
"""

import os
import sys
import asyncio
import logging
import json
from datetime import datetime
import time
from typing import Dict, Any, Optional

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from supabase import create_client
from lxera_pipeline import LXERADatabasePipeline
from lxera_agents import OFFICIAL_SDK

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FullPipelineTest:
    """Test complete pipeline execution with real data."""
    
    def __init__(self):
        # Test with Kubilay's data
        self.test_employee_id = "bbe12b3c-b305-4fdf-8c17-de7296cce3a9"
        self.test_employee_name = "Kubilay Cenk Karakas"
        
        # Initialize Supabase
        self.supabase_url = 'https://xwfweumeryrgbguwrocr.supabase.co'
        self.supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZndldW1lcnlyZ2JndXdyb2NyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc2MzQ0MCwiZXhwIjoyMDY2MzM5NDQwfQ.qxXpBxUKhKA4AQT4UQnIEJGbGNrRDMbBroZU8YaypSY')
        self.supabase = create_client(self.supabase_url, self.supabase_key)
        
        # Test results
        self.test_results = {
            "timestamp": datetime.now().isoformat(),
            "sdk_enabled": OFFICIAL_SDK,
            "pipeline_stages": {},
            "database_records": {},
            "execution_time": 0,
            "errors": []
        }
    
    async def verify_prerequisites(self) -> bool:
        """Verify all prerequisites are met."""
        logger.info("\n📋 VERIFYING PREREQUISITES")
        
        try:
            # 1. Check employee exists
            employee = self.supabase.table('employees').select(
                'id, position, department, company_id, skill_level'
            ).eq('id', self.test_employee_id).single().execute()
            
            if not employee.data:
                raise Exception("Employee not found")
            
            logger.info(f"✅ Employee found: {self.test_employee_name}")
            logger.info(f"   Position: {employee.data['position']}")
            self.company_id = employee.data['company_id']
            
            # 2. Check skills gap analysis
            skills = self.supabase.table('st_employee_skills_profile').select(
                'gap_analysis_completed_at, skills_match_score'
            ).eq('employee_id', self.test_employee_id).single().execute()
            
            if not skills.data or not skills.data['gap_analysis_completed_at']:
                raise Exception("Skills gap analysis not completed")
            
            logger.info(f"✅ Skills gap analysis completed")
            logger.info(f"   Match score: {skills.data['skills_match_score']}")
            
            # 3. Check OpenAI key
            if not os.getenv('OPENAI_API_KEY'):
                raise Exception("OPENAI_API_KEY not set")
            
            logger.info("✅ OpenAI API key configured")
            
            # 4. Check SDK status
            if OFFICIAL_SDK:
                logger.info("✅ Official OpenAI SDK enabled")
            else:
                logger.warning("⚠️ Official SDK not enabled - tracing won't work")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Prerequisites check failed: {e}")
            self.test_results["errors"].append(f"Prerequisites: {str(e)}")
            return False
    
    async def run_pipeline(self) -> Optional[str]:
        """Run the full pipeline."""
        logger.info("\n🚀 RUNNING FULL PIPELINE")
        
        try:
            # Initialize pipeline
            pipeline = LXERADatabasePipeline(verbose=True)
            
            # Create session ID
            session_id = f"test-pipeline-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
            logger.info(f"Session ID: {session_id}")
            
            # Progress callback
            def progress_callback(stage: str, message: str):
                logger.info(f"[{stage}] {message}")
                self.test_results["pipeline_stages"][stage] = {
                    "timestamp": datetime.now().isoformat(),
                    "message": message
                }
            
            # Start timer
            start_time = time.time()
            
            # Run pipeline
            logger.info("\n📊 Starting pipeline execution...")
            result = await pipeline.run_pipeline(
                employee_id=self.test_employee_id,
                employee_name=self.test_employee_name,
                company_id=self.company_id,
                session_id=session_id,
                progress_callback=progress_callback
            )
            
            # Calculate execution time
            self.test_results["execution_time"] = time.time() - start_time
            
            if result and result.get('content_id'):
                logger.info(f"\n✅ Pipeline completed successfully!")
                logger.info(f"Content ID: {result['content_id']}")
                logger.info(f"Total time: {self.test_results['execution_time']:.2f} seconds")
                
                # Store result
                self.test_results["pipeline_result"] = result
                return result['content_id']
            else:
                error_msg = result.get('error', 'Unknown error') if result else 'No result returned'
                logger.error(f"\n❌ Pipeline failed: {error_msg}")
                self.test_results["errors"].append(f"Pipeline execution: {error_msg}")
                return None
                
        except Exception as e:
            logger.error(f"\n❌ Pipeline error: {e}")
            self.test_results["errors"].append(f"Pipeline exception: {str(e)}")
            return None
    
    async def verify_database_records(self, content_id: str):
        """Verify all expected database records were created."""
        logger.info("\n🔍 VERIFYING DATABASE RECORDS")
        
        verifications = {
            'cm_module_content': False,
            'cm_quality_assessments': False,
            'cm_enhancement_sessions': False,
            'cm_research_sessions': False,
            'cm_content_sections': False,
            'course_assignments': False,
            'cm_course_plans': False  # May not exist yet
        }
        
        # 1. Verify module content
        try:
            content = self.supabase.table('cm_module_content').select('*').eq(
                'content_id', content_id
            ).single().execute()
            
            if content.data:
                verifications['cm_module_content'] = True
                logger.info(f"✅ Module content found: {content.data['module_name']}")
                logger.info(f"   Status: {content.data['status']}")
                logger.info(f"   Word count: {content.data.get('total_word_count', 0)}")
                
                # Check sections
                sections_with_content = 0
                for section in ['introduction', 'core_content', 'practical_applications', 'case_studies', 'assessments']:
                    if content.data.get(section):
                        sections_with_content += 1
                logger.info(f"   Sections with content: {sections_with_content}/5")
        except Exception as e:
            logger.error(f"❌ Module content error: {e}")
        
        # 2. Verify quality assessments
        try:
            quality = self.supabase.table('cm_quality_assessments').select('*').eq(
                'content_id', content_id
            ).execute()
            
            if quality.data:
                verifications['cm_quality_assessments'] = True
                logger.info(f"✅ Quality assessments: {len(quality.data)} found")
                for qa in quality.data:
                    logger.info(f"   - Score: {qa['overall_score']}, Passed: {qa['passed']}")
        except Exception as e:
            logger.error(f"❌ Quality assessment error: {e}")
        
        # 3. Verify enhancement sessions
        try:
            enhancements = self.supabase.table('cm_enhancement_sessions').select('*').eq(
                'content_id', content_id
            ).execute()
            
            if enhancements.data:
                verifications['cm_enhancement_sessions'] = True
                logger.info(f"✅ Enhancement sessions: {len(enhancements.data)} found")
        except Exception as e:
            logger.error(f"❌ Enhancement session error: {e}")
        
        # 4. Verify research sessions
        try:
            research = self.supabase.table('cm_research_sessions').select('*').eq(
                'content_id', content_id
            ).execute()
            
            if research.data:
                verifications['cm_research_sessions'] = True
                logger.info(f"✅ Research sessions: {len(research.data)} found")
            else:
                logger.warning("⚠️ No research sessions found (Research agent may not be storing)")
        except Exception as e:
            logger.error(f"❌ Research session error: {e}")
        
        # 5. Verify content sections
        try:
            sections = self.supabase.table('cm_content_sections').select('*').eq(
                'content_id', content_id
            ).execute()
            
            if sections.data:
                verifications['cm_content_sections'] = True
                logger.info(f"✅ Content sections: {len(sections.data)} found")
        except Exception as e:
            logger.error(f"❌ Content section error: {e}")
        
        # 6. Verify course assignment
        try:
            assignments = self.supabase.table('course_assignments').select('*').eq(
                'module_id', content_id
            ).execute()
            
            if assignments.data:
                verifications['course_assignments'] = True
                logger.info(f"✅ Course assignments: {len(assignments.data)} found")
        except Exception as e:
            logger.error(f"❌ Course assignment error: {e}")
        
        # 7. Check for course plans (may not exist)
        try:
            plans = self.supabase.table('cm_course_plans').select('*').eq(
                'employee_id', self.test_employee_id
            ).order('created_at', desc=True).limit(1).execute()
            
            if plans.data:
                verifications['cm_course_plans'] = True
                logger.info(f"✅ Course plan found")
            else:
                logger.warning("⚠️ No course plan found (table may not exist)")
        except:
            logger.warning("❌ cm_course_plans table does not exist")
        
        # Store results
        self.test_results["database_records"] = verifications
        
        # Summary
        verified_count = sum(1 for v in verifications.values() if v)
        total_count = len(verifications)
        logger.info(f"\n📊 Database verification: {verified_count}/{total_count} tables have data")
    
    def generate_report(self):
        """Generate comprehensive test report."""
        logger.info("\n📄 FULL PIPELINE TEST REPORT")
        logger.info("=" * 80)
        
        # Execution summary
        logger.info(f"Timestamp: {self.test_results['timestamp']}")
        logger.info(f"SDK Enabled: {self.test_results['sdk_enabled']}")
        logger.info(f"Execution Time: {self.test_results['execution_time']:.2f} seconds")
        
        # Pipeline stages
        logger.info("\n📊 Pipeline Stages:")
        for stage, info in self.test_results["pipeline_stages"].items():
            logger.info(f"  {stage}: {info['message']}")
        
        # Database records
        logger.info("\n💾 Database Records:")
        for table, verified in self.test_results["database_records"].items():
            status = "✅" if verified else "❌"
            logger.info(f"  {status} {table}")
        
        # Errors
        if self.test_results["errors"]:
            logger.info("\n❌ Errors:")
            for error in self.test_results["errors"]:
                logger.error(f"  - {error}")
        
        # Save report
        os.makedirs('../logs', exist_ok=True)
        report_file = f"../logs/full_pipeline_test_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(self.test_results, f, indent=2)
        
        logger.info(f"\n📄 Detailed report saved to: {report_file}")
        
        # Overall status
        if not self.test_results["errors"] and self.test_results.get("pipeline_result"):
            logger.info("\n✅ FULL PIPELINE TEST PASSED")
            return True
        else:
            logger.error("\n❌ FULL PIPELINE TEST FAILED")
            return False
    
    async def cleanup_test_data(self):
        """Optional: Clean up test data."""
        logger.info("\n🧹 CLEANUP")
        logger.info("Test data preserved for analysis")
        # Optionally delete test records here

async def main():
    """Run full pipeline test."""
    logger.info("🧪 FULL PIPELINE END-TO-END TEST")
    logger.info("Using real employee data: Kubilay Cenk Karakas")
    
    tester = FullPipelineTest()
    
    # 1. Verify prerequisites
    if not await tester.verify_prerequisites():
        logger.error("Prerequisites not met, cannot continue")
        return False
    
    # 2. Run pipeline
    content_id = await tester.run_pipeline()
    
    # 3. Verify database records if successful
    if content_id:
        await tester.verify_database_records(content_id)
    
    # 4. Generate report
    success = tester.generate_report()
    
    # 5. Optional cleanup
    await tester.cleanup_test_data()
    
    return success

if __name__ == "__main__":
    # Run test
    success = asyncio.run(main())
    exit(0 if success else 1)