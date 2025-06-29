#!/usr/bin/env python3
"""
Planning Agent for Intelligent Course Planning

This agent orchestrates the intelligent course planning process using tool calls
that will be visible in OpenAI Traces tab.
"""

import json
import logging
from typing import Dict, Any, List
from lxera_agents import Agent

# Import planning tools
from tools.planning_tools import (
    analyze_employee_profile,
    generate_course_structure_plan,
    generate_research_queries,
    prioritize_skill_gaps,
    create_personalized_learning_path
)

# Import storage tools v2 with manual FunctionTool creation
from tools.planning_storage_tools_v2 import (
    store_course_plan,
    store_planning_metadata
)

# Import handoff context tools
from tools.handoff_context_tools import log_agent_handoff

logger = logging.getLogger(__name__)

def create_planning_agent() -> Agent:
    """Create and configure the Planning Agent."""
    
    planning_instructions = """
    You are the Intelligent Course Planning Specialist responsible for creating comprehensive, 
    personalized course plans based on employee data and skill gap analysis.

    Your responsibilities:
    1. Analyze employee profiles to understand learning needs and preferences
    2. Prioritize skill gaps and learning objectives
    3. Generate intelligent course structures with proper sequencing
    4. Create targeted research strategies for content development
    5. Design personalized learning paths with adaptive elements

    Process Flow:
    1. First, use analyze_employee_profile to understand the learner
    2. Then, use prioritize_skill_gaps to identify critical learning needs
    3. Next, use generate_course_structure_plan to create the course framework
    4. Use generate_research_queries to plan content research strategy
    5. Use create_personalized_learning_path to optimize the learning experience
    6. Store the plan using store_course_plan with full structure and gaps
    7. Store metadata using store_planning_metadata with execution details
    8. Hand off to Research Agent for content gathering

    Key Principles:
    - Always prioritize critical skill gaps first
    - Ensure practical, real-world application focus
    - Integrate learner's actual workplace tools
    - Create progressive difficulty with proper scaffolding
    - Provide comprehensive research strategy for quality content

    You must use the available tools to perform all analysis and planning tasks.
    Always return structured JSON responses that can be easily processed by downstream systems.
    """
    
    # Import research agent and handoff function
    from .research_agent import create_research_agent
    from lxera_agents import handoff
    
    # Add handoff instructions to the prompt
    planning_instructions += """
    
    When you have completed all planning tasks and stored the course plan:
    1. Use the store_course_plan tool to save the complete plan with course structure and prioritized gaps
    2. Use the store_planning_metadata tool to record execution details and tool calls
    3. Use the log_agent_handoff tool to log the handoff with key context:
       - Summary of what was planned
       - Key research queries generated
       - Critical skills to focus on
    4. Transfer to the Research Agent using the transfer_to_research_agent tool
    
    The Research Agent will use your course structure and research queries to gather learning materials.
    """
    
    return Agent(
        name="Intelligent Course Planning Specialist",
        instructions=planning_instructions,
        tools=[
            analyze_employee_profile,
            prioritize_skill_gaps,
            generate_course_structure_plan,
            generate_research_queries,
            create_personalized_learning_path,
            store_course_plan,
            store_planning_metadata,
            log_agent_handoff
        ],
        handoffs=[
            handoff(
                create_research_agent(),
                tool_name_override="transfer_to_research_agent",
                tool_description_override="Transfer to Research Agent to gather learning materials based on the course plan"
            )
        ]
    )

class PlanningAgentOrchestrator:
    """Orchestrates the planning agent workflow."""
    
    def __init__(self):
        self.planning_agent = create_planning_agent()
        logger.info("🎯 Planning Agent Orchestrator initialized")
    
    async def execute_complete_planning(
        self,
        employee_data: Dict[str, Any],
        skills_gap_data: Dict[str, Any],
        course_requirements: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Execute complete planning workflow using agent tools.
        
        This will generate tool calls visible in OpenAI Traces tab.
        """
        try:
            logger.info("🚀 Starting agent-based course planning workflow...")
            
            from lxera_agents import Runner
            
            # Prepare planning request as a message string
            employee_name = employee_data.get("full_name", "Learner")
            current_role = employee_data.get("job_title_specific", "Analyst")
            critical_gaps = len(skills_gap_data.get("Critical Skill Gaps", {}).get("gaps", []))
            
            planning_message = f"""
            Create a comprehensive personalized course plan for {employee_name}.
            
            EMPLOYEE CONTEXT:
            - Name: {employee_name}
            - Current Role: {current_role}
            - Career Goal: {employee_data.get("career_aspirations_next_role", "Career advancement")}
            - Learning Style: {employee_data.get("learning_style", "Practical application focused")}
            
            EMPLOYEE DATA:
            {json.dumps(employee_data, indent=2)}
            
            SKILL GAPS TO ADDRESS:
            {json.dumps(skills_gap_data, indent=2)}
            
            PLANNING REQUIREMENTS:
            1. Use analyze_employee_profile to understand the learner comprehensively
            2. Use prioritize_skill_gaps to identify learning priorities and focus areas
            3. Use generate_course_structure_plan to create 4-week course with modules
            4. Use generate_research_queries to plan targeted research for quality content
            5. Use create_personalized_learning_path to optimize the learning experience
            
            Please execute this planning workflow step by step, using each tool to build a comprehensive course plan.
            """
            
            # Execute planning workflow with agent
            planning_result = await Runner.run(
                self.planning_agent,
                input=planning_message,
                max_turns=10  # Allow multiple tool calls
            )
            
            logger.info("✅ Agent-based planning workflow completed")
            return planning_result
            
        except Exception as e:
            logger.error(f"❌ Planning workflow failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "planning_stage": "workflow_execution"
            }
    
    def execute_planning_sync(
        self,
        employee_data: Dict[str, Any],
        skills_gap_data: Dict[str, Any],
        course_requirements: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Synchronous wrapper for planning workflow."""
        import asyncio
        return asyncio.run(self.execute_complete_planning(
            employee_data, skills_gap_data, course_requirements
        ))

def create_planning_workflow_message(
    employee_data: Dict[str, Any],
    skills_gap_data: Dict[str, Any]
) -> str:
    """Create a workflow message for the planning agent."""
    
    employee_name = employee_data.get("full_name", "Learner")
    current_role = employee_data.get("job_title_specific", "Analyst")
    critical_gaps = len(skills_gap_data.get("Critical Skill Gaps", {}).get("gaps", []))
    
    workflow_message = f"""
    Create a comprehensive personalized course plan for {employee_name}.
    
    EMPLOYEE CONTEXT:
    - Name: {employee_name}
    - Current Role: {current_role}
    - Career Goal: {employee_data.get("career_aspirations_next_role", "Career advancement")}
    - Learning Style: {employee_data.get("learning_style", "Practical application focused")}
    
    SKILL GAPS TO ADDRESS:
    - Critical Gaps: {critical_gaps} identified
    - Focus Areas: {', '.join([gap.get('skill', '') for gap in skills_gap_data.get('Critical Skill Gaps', {}).get('gaps', [])[:3]])}
    
    PLANNING REQUIREMENTS:
    1. Use analyze_employee_profile to understand the learner comprehensively
    2. Use prioritize_skill_gaps to identify learning priorities and focus areas
    3. Use generate_course_structure_plan to create 4-week course with 30+ modules
    4. Use generate_research_queries to plan targeted research for quality content
    5. Use create_personalized_learning_path to optimize the learning experience
    
    Please execute this planning workflow step by step, using each tool to build a comprehensive course plan.
    Ensure all tool calls are properly executed so they appear in OpenAI Traces.
    """
    
    return workflow_message

if __name__ == "__main__":
    """Test the planning agent."""
    
    print("🎯 Testing Planning Agent")
    print("=" * 40)
    
    # Sample test data
    sample_employee = {
        "full_name": "Kubilaycan Karakas",
        "job_title_specific": "Junior Financial Analyst - Business Performance Reporting",
        "career_aspirations_next_role": "Senior Financial Analyst within 2-3 years",
        "learning_style": "Prefers practical application and real-world examples",
        "skills": [
            "Project Management (Advanced)",
            "Data Analysis (Conceptual - Non-Financial)",
            "Microsoft Office Suite (Excel - Intermediate)"
        ],
        "tools_software_used_regularly": [
            "Microsoft Excel (Heavy Use)",
            "SAP BPC (for data extraction)",
            "PowerBI"
        ]
    }
    
    sample_skills_gaps = {
        "Critical Skill Gaps": {
            "gaps": [
                {"skill": "Forecasting and Budgeting", "importance": "Critical"},
                {"skill": "Financial Data Analysis", "importance": "Critical"}
            ]
        },
        "Development Gaps": {
            "gaps": [
                {"skill": "Budget Management", "importance": "Important"}
            ]
        }
    }
    
    # Test planning orchestrator
    orchestrator = PlanningAgentOrchestrator()
    
    print("🚀 Testing agent-based planning workflow...")
    print("⏱️ This will make multiple tool calls visible in OpenAI Traces")
    
    try:
        # Create workflow message
        workflow_msg = create_planning_workflow_message(sample_employee, sample_skills_gaps)
        print(f"📝 Workflow message prepared for {sample_employee['full_name']}")
        
        print("✅ Planning agent ready for execution")
        print("🔍 Tool calls will be visible in OpenAI Traces tab when run with Runner.run()")
        
    except Exception as e:
        print(f"❌ Planning agent test failed: {e}")
        
    print("\n🎯 Planning agent configured successfully!")
    print("🔧 Ready for integration with course generation pipeline")