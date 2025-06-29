#!/usr/bin/env python3
"""
Test the handoff logic between Planning Agent and Research Agent
Tests the orchestrator's ability to detect planning completion and trigger handoff.
"""

import json
import logging
import asyncio
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_planning_agent_completion():
    """Test that Planning Agent completes its 6 steps without handoff attempts."""
    
    try:
        logger.info("🎯 Testing Planning Agent completion...")
        
        # Import the planning agent
        from course_agents.planning_agent import create_planning_agent
        from lxera_agents import Runner
        
        # Create planning agent
        planning_agent = create_planning_agent()
        
        # Sample employee data for testing (with proper UUID)
        sample_employee_data = {
            "id": "bbe12b3c-b305-4fdf-8c17-de7296cce3a9",  # Valid UUID
            "full_name": "Test Employee",
            "job_title_current": "Data Analyst",
            "department": "Analytics",
            "career_aspirations_next_role": "Senior Data Analyst",
            "tools_software_used_regularly": ["Excel", "Python", "SQL"],
            "position": "Data Analyst"
        }
        
        sample_skills_gaps = [
            {
                "skill_name": "Advanced Python",
                "gap_severity": "critical",
                "current_level": 2,
                "required_level": 5,
                "skill_type": "technical"
            },
            {
                "skill_name": "Machine Learning",
                "gap_severity": "moderate", 
                "current_level": 1,
                "required_level": 4,
                "skill_type": "technical"
            }
        ]
        
        # Create planning message
        planning_message = f"""
        Create a comprehensive personalized course plan for {sample_employee_data['full_name']}.
        
        EMPLOYEE PROFILE:
        {json.dumps(sample_employee_data, indent=2)}
        
        SKILLS GAP ANALYSIS:
        {json.dumps(sample_skills_gaps, indent=2)}
        
        Execute the 6-step planning workflow:
        1. analyze_employee_profile
        2. prioritize_skill_gaps  
        3. generate_course_structure_plan
        4. generate_research_queries
        5. create_personalized_learning_path
        6. store_course_plan
        
        Complete these steps and then stop.
        """
        
        logger.info("🚀 Running Planning Agent...")
        
        # Run planning agent
        planning_result = await Runner.run(
            planning_agent,
            planning_message,
            max_turns=15
        )
        
        logger.info("✅ Planning Agent execution completed")
        
        # Test the completion detection logic
        logger.info("🔍 Testing completion detection...")
        
        # Import the orchestrator method to test completion detection
        from lxera_database_pipeline import LXERADatabasePipeline
        pipeline = LXERADatabasePipeline()
        
        completion_detected = pipeline._check_planning_completion(planning_result)
        
        logger.info(f"📊 Planning completion detected: {completion_detected}")
        
        # Show some details about the result
        if hasattr(planning_result, 'final_output'):
            output_preview = str(planning_result.final_output)[:300] + "..." if len(str(planning_result.final_output)) > 300 else str(planning_result.final_output)
            logger.info(f"📄 Final output preview: {output_preview}")
        
        if hasattr(planning_result, 'raw_responses'):
            logger.info(f"🔄 Number of turns: {len(planning_result.raw_responses)}")
            
            # Check for tool calls
            tool_calls_made = []
            for response in planning_result.raw_responses:
                if hasattr(response, 'tool_calls') and response.tool_calls:
                    for tool_call in response.tool_calls:
                        tool_calls_made.append(tool_call.function.name)
            
            logger.info(f"🛠️ Tool calls made: {tool_calls_made}")
        
        return {
            'planning_completed': True,
            'completion_detected': completion_detected,
            'planning_result': planning_result,
            'tool_calls': tool_calls_made if 'tool_calls_made' in locals() else []
        }
        
    except Exception as e:
        logger.error(f"❌ Planning Agent test failed: {e}")
        return {
            'planning_completed': False,
            'error': str(e)
        }

async def test_orchestrator_handoff_logic():
    """Test the orchestrator's handoff logic with sample data."""
    
    try:
        logger.info("🎮 Testing Orchestrator handoff logic...")
        
        # Import orchestrator
        from lxera_database_pipeline import LXERADatabasePipeline
        pipeline = LXERADatabasePipeline()
        
        # Sample data
        sample_employee_data = {
            "full_name": "Test Employee",
            "job_title_current": "Data Analyst", 
            "department": "Analytics",
            "career_aspirations_next_role": "Senior Data Analyst",
            "tools_software_used_regularly": ["Excel", "Python", "SQL"],
            "position": "Data Analyst"
        }
        
        sample_skills_gaps = [
            {
                "skill_name": "Advanced Python",
                "gap_severity": "critical",
                "current_level": 2,
                "required_level": 5,
                "skill_type": "technical"
            }
        ]
        
        logger.info("🚀 Running orchestrator pipeline...")
        
        # Run the pipeline (this should test the handoff)
        result = await pipeline._run_sdk_pipeline(
            sample_employee_data,
            sample_skills_gaps,
            job_id=None
        )
        
        logger.info("✅ Orchestrator pipeline completed")
        logger.info(f"📊 Pipeline success: {result.get('pipeline_success', 'Unknown')}")
        logger.info(f"🆔 Content ID: {result.get('content_id', 'None')}")
        
        if 'planning_turns' in result:
            logger.info(f"📋 Planning turns: {result['planning_turns']}")
        
        if 'turns' in result:
            logger.info(f"🔄 Total turns: {result['turns']}")
        
        return result
        
    except Exception as e:
        logger.error(f"❌ Orchestrator test failed: {e}")
        return {
            'pipeline_success': False,
            'error': str(e)
        }

async def main():
    """Run all handoff tests."""
    
    print("🧪 Testing Agent Handoff Logic")
    print("=" * 50)
    
    # Test 1: Planning Agent completion
    print("\n1. Testing Planning Agent Completion")
    print("-" * 40)
    
    planning_test = await test_planning_agent_completion()
    
    if planning_test['planning_completed']:
        print("✅ Planning Agent completed successfully")
        print(f"📊 Completion detection: {planning_test['completion_detected']}")
        
        if planning_test['completion_detected']:
            print("✅ Orchestrator can detect planning completion")
            
            # Test 2: Full orchestrator handoff
            print("\n2. Testing Orchestrator Handoff Logic")
            print("-" * 40)
            
            orchestrator_test = await test_orchestrator_handoff_logic()
            
            if orchestrator_test.get('pipeline_success'):
                print("✅ Orchestrator handoff working correctly")
                print(f"🎯 Final result: {json.dumps(orchestrator_test, indent=2)}")
            else:
                print("❌ Orchestrator handoff failed")
                print(f"🔍 Error: {orchestrator_test.get('error', 'Unknown error')}")
        else:
            print("❌ Orchestrator cannot detect planning completion")
            print("🔧 Need to fix completion detection logic")
    else:
        print("❌ Planning Agent failed to complete")
        print(f"🔍 Error: {planning_test.get('error', 'Unknown error')}")
    
    print("\n🏁 Handoff test completed")

if __name__ == "__main__":
    asyncio.run(main())