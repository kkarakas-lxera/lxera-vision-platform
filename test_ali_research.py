#!/usr/bin/env python3
"""
Quick test to trigger Ali Yıldırım research pipeline with proper environment setup
"""

import os
import sys
import asyncio
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up the necessary environment variables
os.environ['SUPABASE_URL'] = 'https://xwfweumeryrgbguwrocr.supabase.co'
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZndldW1lcnlyZ2JndXdyb2NyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc2MzQ0MCwiZXhwIjoyMDY2MzM5NDQwfQ.qxXpBxUKhKA4AQT4UQnIEJGbGNrRDMbBroZU8YaypSY'

# Add the course generator directory to path
sys.path.append('openai_course_generator')

# Setup logging to see everything
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def test_ali_research():
    """Test research phase for Ali Yıldırım"""
    
    try:
        from lxera_database_pipeline import LXERADatabasePipeline
        
        print("🧪 Testing Ali Yıldırım Research Phase")
        print("=" * 50)
        
        # Initialize pipeline
        pipeline = LXERADatabasePipeline()
        
        # Ali's data
        plan_id = "6d9473db-de3a-4322-b1ec-5a989830ce15"
        employee_id = "96bb800c-a543-452b-b5f6-16460be0b64a"
        company_id = "5757fe2b-f421-4b70-98dd-8ff63c27981a"
        
        print(f"📋 Plan ID: {plan_id}")
        print(f"👤 Employee: Ali Yıldırım ({employee_id})")
        print(f"🏢 Company: {company_id}")
        print()
        
        # Ensure plan is approved
        print("✅ Ensuring plan is approved...")
        await pipeline.supabase.table('cm_course_plans').update({
            'approval_status': 'approved',
            'approved_at': 'now()',
            'approved_by': employee_id
        }).eq('plan_id', plan_id).execute()
        
        print("🚀 Starting research pipeline...")
        print("📝 This will show all the new debugging logs we added")
        print()
        
        # Trigger the research + content generation
        result = await pipeline.generate_course_for_employee(
            employee_id=employee_id,
            company_id=company_id,
            generation_mode='first_module',
            enable_multimedia=False,
            plan_id=plan_id
        )
        
        print("\n📊 Pipeline Results:")
        print(f"   Success: {result.get('pipeline_success', False)}")
        print(f"   Agent: {result.get('agent_name', 'N/A')}")
        
        if result.get('pipeline_success'):
            print("✅ Research completed!")
        else:
            print("❌ Research failed!")
            if 'error' in result:
                print(f"   Error: {result['error']}")
                
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_ali_research())