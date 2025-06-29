#!/usr/bin/env python3
"""
Debug script to examine Planning Agent result structure
"""

import asyncio
import logging
import json

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def debug_planning_result():
    """Debug the Planning Agent result structure."""
    
    from course_agents.planning_agent import create_planning_agent
    from lxera_agents import Runner
    
    # Simple test data
    test_employee_data = {
        "id": "bbe12b3c-b305-4fdf-8c17-de7296cce3a9",
        "full_name": "Test Employee",
        "job_title_current": "Data Analyst",
        "position": "Data Analyst"
    }
    
    test_skills_gaps = [
        {
            "skill_name": "Python",
            "gap_severity": "critical",
            "current_level": 2,
            "required_level": 5,
            "skill_type": "technical"
        }
    ]
    
    planning_agent = create_planning_agent()
    
    planning_message = f"""
    Create a comprehensive personalized course plan for {test_employee_data['full_name']}.
    
    EMPLOYEE PROFILE:
    {json.dumps(test_employee_data, indent=2)}
    
    SKILLS GAP ANALYSIS:
    {json.dumps(test_skills_gaps, indent=2)}
    
    Execute the 6-step planning workflow:
    1. analyze_employee_profile
    2. prioritize_skill_gaps  
    3. generate_course_structure_plan
    4. generate_research_queries
    5. create_personalized_learning_path
    6. store_course_plan
    
    Complete these steps and then stop.
    """
    
    result = await Runner.run(
        planning_agent,
        planning_message,
        max_turns=10
    )
    
    print("\n" + "="*50)
    print("DEBUGGING PLANNING AGENT RESULT")
    print("="*50)
    
    print(f"\nResult type: {type(result)}")
    
    if isinstance(result, dict):
        print(f"Result keys: {list(result.keys())}")
        print(f"Result content: {json.dumps(result, indent=2, default=str)}")
        return
    
    print(f"Result attributes: {[attr for attr in dir(result) if not attr.startswith('_')]}")
    
    if hasattr(result, 'raw_responses'):
        print(f"\nRaw responses count: {len(result.raw_responses)}")
        
        for i, response in enumerate(result.raw_responses):
            print(f"\n--- Response {i} ---")
            print(f"Response type: {type(response)}")
            print(f"Response attributes: {[attr for attr in dir(response) if not attr.startswith('_')]}")
            
            if hasattr(response, 'content') and response.content:
                print(f"Content blocks: {len(response.content)}")
                
                for j, content_block in enumerate(response.content):
                    print(f"  Block {j} type: {getattr(content_block, 'type', 'unknown')}")
                    
                    if hasattr(content_block, 'type'):
                        if content_block.type == 'tool_use':
                            print(f"    Tool name: {getattr(content_block, 'name', 'unknown')}")
                        elif content_block.type == 'tool_result':
                            content = getattr(content_block, 'content', '')
                            print(f"    Tool result: {str(content)[:100]}...")
                            
                            # Check for completion indicators
                            if 'planning_complete' in str(content).lower() or 'course plan stored' in str(content).lower():
                                print(f"    ✅ COMPLETION INDICATOR FOUND!")
    
    if hasattr(result, 'final_output'):
        print(f"\nFinal output: {str(result.final_output)[:200]}...")

if __name__ == "__main__":
    asyncio.run(debug_planning_result())