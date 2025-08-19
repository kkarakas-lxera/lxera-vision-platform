#!/usr/bin/env python3
"""
Test Research Agent Phase

This script simulates what happens when a course plan is approved 
and moves to the research phase of the pipeline.
"""

import asyncio
import json
import logging
from lxera_database_pipeline import LXERADatabasePipeline

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def test_research_phase():
    """Test the research phase with an existing approved plan"""
    
    print("🧪 Testing Research Agent Phase")
    print("=" * 50)
    
    # Initialize pipeline
    pipeline = LXERADatabasePipeline()
    
    # Use the existing plan that was just created
    plan_id = "6d9473db-de3a-4322-b1ec-5a989830ce15"
    employee_id = "96bb800c-a543-452b-b5f6-16460be0b64a"
    company_id = "5757fe2b-f421-4b70-98dd-8ff63c27981a"
    
    print(f"📋 Plan ID: {plan_id}")
    print(f"👤 Employee: Ali Yıldırım ({employee_id})")
    print(f"🏢 Company: {company_id}")
    print()
    
    try:
        # First, let's simulate approving the plan
        print("✅ Simulating plan approval...")
        await pipeline.supabase.table('cm_course_plans').update({
            'approval_status': 'approved',
            'approved_at': 'now()',
            'approved_by': employee_id
        }).eq('plan_id', plan_id).execute()
        
        print("✅ Plan approved! Now testing research phase...")
        print()
        
        # Load the approved plan
        plan_response = await pipeline.supabase.table('cm_course_plans').select('*').eq('plan_id', plan_id).execute()
        if not plan_response.data:
            print("❌ Plan not found!")
            return
            
        course_plan = plan_response.data[0]
        
        print(f"📚 Course: {course_plan['course_title']}")
        print(f"📊 Modules: {course_plan['total_modules']}")
        print(f"⏱️ Duration: {course_plan['course_duration_weeks']} weeks")
        print()
        
        # Test the research phase
        print("🔬 Starting Research Phase...")
        print("🤖 Model: llama-3.3-70b-versatile (Groq)")
        print("🔧 Research Type: Enhanced Multi-Source Research")
        print()
        
        # Create employee data for research
        employee_data = {
            'employee_id': employee_id,
            'employee_name': 'Ali Yıldırım',
            'current_role': 'Financial Consultant',
            'department': 'product'
        }
        
        # Mock skills gaps (not needed for research but required for pipeline)
        skills_gaps = [
            {'skill': 'Data Analysis', 'current_level': 0, 'required_level': 4},
            {'skill': 'Excel Proficiency', 'current_level': 0, 'required_level': 4}
        ]
        
        # Call the research phase of the pipeline
        # Note: We'll use generation_mode='first_module' to test research + first module generation
        print("🚀 Calling pipeline with research + content generation...")
        
        result = await pipeline.generate_course_for_employee(
            employee_id=employee_id,
            company_id=company_id,
            generation_mode='first_module',  # This will trigger research + first module
            enable_multimedia=False,
            plan_id=plan_id  # Use existing plan
        )
        
        print("📊 Pipeline Results:")
        print(f"   Success: {result.get('pipeline_success', False)}")
        print(f"   Plan ID: {result.get('plan_id', 'N/A')}")
        print(f"   Agent: {result.get('agent_name', 'N/A')}")
        
        if result.get('pipeline_success'):
            print("✅ Research phase completed successfully!")
            
            # Check what research data was created
            research_tables = ['cm_research_sessions', 'cm_research_results', 'cm_research_validation']
            for table in research_tables:
                try:
                    query_result = await pipeline.supabase.table(table).select('*').eq('plan_id', plan_id).execute()
                    if query_result.data:
                        print(f"📊 {table}: {len(query_result.data)} records created")
                    else:
                        print(f"📊 {table}: No records found")
                except Exception as e:
                    print(f"📊 {table}: Table not found or error ({e})")
                    
        else:
            print("❌ Research phase failed!")
            if 'error' in result:
                print(f"   Error: {result['error']}")
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n🏁 Research phase test completed!")

if __name__ == "__main__":
    asyncio.run(test_research_phase())