#!/usr/bin/env python3
"""
Test the improved SDK handoffs between Planning and Research agents.
"""

import asyncio
import logging
import json

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_sdk_handoffs():
    """Test the improved SDK handoffs."""
    
    logger.info("🧪 Testing improved SDK handoffs...")
    
    # Test data with proper structure
    test_employee_data = {
        "id": "bbe12b3c-b305-4fdf-8c17-de7296cce3a9",
        "full_name": "Kubilay Cenk Karakas",
        "job_title_current": "Junior Financial Analyst", 
        "department": "Finance",
        "career_aspirations_next_role": "Senior Financial Analyst",
        "tools_software_used_regularly": ["Excel", "SAP BPC", "PowerBI"],
        "position": "Junior Financial Analyst"
    }
    
    test_skills_gaps = [
        {
            "skill_name": "Forecasting and Budgeting",
            "gap_severity": "critical",
            "current_level": 2,
            "required_level": 4,
            "skill_type": "technical"
        },
        {
            "skill_name": "Financial Data Analysis", 
            "gap_severity": "critical",
            "current_level": 2,
            "required_level": 5,
            "skill_type": "technical"
        }
    ]
    
    try:
        # Import the updated planning agent
        from course_agents.planning_agent import create_planning_agent
        from lxera_agents import Runner
        
        # Create planning agent with SDK handoffs
        planning_agent = create_planning_agent()
        
        # Create planning message
        planning_message = f"""
        Create a comprehensive personalized course plan for {test_employee_data['full_name']}.
        
        EMPLOYEE PROFILE:
        {json.dumps(test_employee_data, indent=2)}
        
        SKILLS GAP ANALYSIS:
        {json.dumps(test_skills_gaps, indent=2)}
        
        Execute the 7-step planning workflow:
        1. analyze_employee_profile
        2. prioritize_skill_gaps  
        3. generate_course_structure_plan
        4. generate_research_queries
        5. create_personalized_learning_path
        6. store_course_plan
        7. transfer_to_research_agent
        
        Complete these steps in order, including the handoff to Research Agent.
        """
        
        logger.info("🚀 Starting Planning Agent with SDK handoffs...")
        
        # Run planning agent with SDK handoffs
        result = await Runner.run(
            planning_agent,
            planning_message,
            max_turns=25  # Allow for full workflow including handoffs
        )
        
        logger.info("✅ Planning Agent with handoffs completed")
        
        # Analyze the result
        if isinstance(result, dict):
            logger.info(f"📊 Result type: dict")
            logger.info(f"🎯 Success: {result.get('success', 'Unknown')}")
            logger.info(f"🎭 Final Agent: {result.get('agent_name', 'Unknown')}")
            logger.info(f"🔄 Turns: {result.get('turns', 'Unknown')}")
            
            # Check content for handoff indicators
            content = result.get('content', '')
            if 'research' in content.lower():
                logger.info("✅ HANDOFF SUCCESS: Research-related content found in result")
            else:
                logger.warning("❌ HANDOFF MISSING: No research content found")
                
        else:
            logger.info(f"📊 Result type: {type(result)}")
            if hasattr(result, 'last_agent'):
                logger.info(f"🎭 Final Agent: {result.last_agent}")
            
            # Check for handoff success
            if hasattr(result, 'raw_responses') and result.raw_responses:
                handoff_found = False
                research_agent_active = False
                
                for response in result.raw_responses:
                    if hasattr(response, 'content') and response.content:
                        for content_block in response.content:
                            if hasattr(content_block, 'type') and content_block.type == 'tool_use':
                                tool_name = getattr(content_block, 'name', 'unknown')
                                if 'transfer_to_research_agent' in tool_name:
                                    handoff_found = True
                                    logger.info("✅ HANDOFF FOUND: transfer_to_research_agent called")
                                
                                # Check for research agent tools
                                if tool_name in ['tavily_search', 'firecrawl_extract', 'research_synthesizer']:
                                    research_agent_active = True
                                    logger.info(f"✅ RESEARCH AGENT ACTIVE: {tool_name} called")
                
                if handoff_found and research_agent_active:
                    logger.info("🎉 SDK HANDOFF SUCCESS: Planning → Research handoff working!")
                elif handoff_found:
                    logger.info("⚠️ PARTIAL SUCCESS: Handoff called but Research Agent not fully active")
                else:
                    logger.warning("❌ SDK HANDOFF FAILED: No handoff detected")
        
        return result
        
    except Exception as e:
        logger.error(f"❌ SDK handoff test failed: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(test_sdk_handoffs())