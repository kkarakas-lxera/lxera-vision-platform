"""
Planning service that wraps the standalone planning agent functionality.

This service provides a clean interface between the FastAPI router
and the existing standalone planning agent logic.
"""

import asyncio
import json
import logging
import re
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional

from lxera_agents import Runner, trace
from course_agents.planning_agent import create_planning_agent
from api.models.requests import PlanningRequest
from api.utils.database import get_supabase_client

logger = logging.getLogger(__name__)


class PlanningExecutionResult:
    """Result of planning agent execution."""
    
    def __init__(self, plan_id: str, agent_turns: int = 0, raw_result: Any = None):
        self.plan_id = plan_id
        self.agent_turns = agent_turns
        self.raw_result = raw_result


class PlanningService:
    """Service for executing planning agent and managing course plans."""
    
    def __init__(self):
        self.planning_agent = create_planning_agent()
        self.supabase = get_supabase_client()
        logger.info("🎯 Planning service initialized")
    
    async def execute_planning(self, request: PlanningRequest) -> PlanningExecutionResult:
        """
        Execute the planning agent with the given request.
        
        This method uses the exact same logic as the standalone test
        but wraps it in a service interface.
        """
        try:
            logger.info(f"🚀 Starting planning execution for {request.employee_data.full_name}")
            
            # Create planning message using the same format as standalone test
            planning_message = self._create_planning_message(request)
            
            # Execute planning agent with tracing
            with trace(f"planning_{request.session_metadata.session_id}"):
                result = await Runner.run(
                    self.planning_agent,
                    planning_message,
                    max_turns=15  # Same as standalone test
                )
            
            # Extract plan_id using the same logic as standalone test
            plan_id = self._extract_plan_id(result)
            
            if not plan_id:
                # Try to find from database as fallback
                plan_id = await self._find_latest_plan_for_session(
                    request.session_metadata.session_id
                )
            
            if not plan_id:
                raise Exception("No plan_id generated by planning agent")
            
            # Verify plan exists in database
            await self._verify_plan_exists(plan_id)
            
            # Count agent turns for metrics
            agent_turns = self._count_agent_turns(result)
            
            logger.info(f"✅ Planning execution completed: plan_id={plan_id}")
            
            return PlanningExecutionResult(
                plan_id=plan_id,
                agent_turns=agent_turns,
                raw_result=result
            )
            
        except Exception as e:
            logger.error(f"❌ Planning execution failed: {e}")
            raise
    
    def _create_planning_message(self, request: PlanningRequest) -> str:
        """Create planning message using the same format as standalone test."""
        
        employee_data = request.employee_data
        skills_gaps = request.skills_gaps
        session_id = request.session_metadata.session_id
        
        # Convert skills gaps to the format expected by the agent
        skills_gaps_dict = {
            "Critical Skill Gaps": {
                "gaps": [gap.dict() for gap in skills_gaps.Critical_Skill_Gaps.gaps]
            },
            "High Priority Gaps": {
                "gaps": [gap.dict() for gap in skills_gaps.High_Priority_Gaps.gaps]
            },
            "Development Gaps": {
                "gaps": [gap.dict() for gap in skills_gaps.Development_Gaps.gaps]
            }
        }
        
        # Use the exact same message format as standalone test
        planning_message = f"""
        Create a comprehensive personalized course plan for {employee_data.full_name}.
        
        EMPLOYEE PROFILE:
        - Name: {employee_data.full_name}
        - Current Role: {employee_data.job_title_specific}
        - Career Goal: {employee_data.career_aspirations_next_role}
        - Learning Style: {employee_data.learning_style}
        - Current Tools: {', '.join(employee_data.tools_software_used_regularly)}
        - Skills: {', '.join(employee_data.skills[:10])}  # Limit to prevent context overflow
        
        EMPLOYEE DATA:
        {json.dumps(employee_data.dict(), indent=2)}
        
        SKILLS GAP ANALYSIS:
        {json.dumps(skills_gaps_dict, indent=2)}
        
        SESSION ID: {session_id}
        
        Execute your complete planning workflow:
        1. Analyze employee profile
        2. Prioritize the critical gaps and development needs
        3. Generate course structure focusing on addressing skill gaps
        4. Create research queries for comprehensive content development
        5. Design personalized learning path
        6. Store the course plan and get plan_id
        
        Focus on creating a practical, targeted course that addresses the specific skill gaps
        while leveraging the employee's existing expertise and preferred learning style.
        """
        
        return planning_message
    
    def _extract_plan_id(self, result) -> Optional[str]:
        """Extract plan_id from agent result using same logic as standalone test."""
        try:
            output_text = ""
            
            # Handle different result types
            if isinstance(result, dict):
                if 'raw_responses' in result:
                    responses = result['raw_responses']
                    if isinstance(responses, list):
                        for resp in responses:
                            if isinstance(resp, dict) and 'content' in resp:
                                for content in resp['content']:
                                    if isinstance(content, dict):
                                        if content.get('type') == 'tool_result':
                                            output_text += str(content.get('content', '')) + " "
            else:
                # Check final_output
                if hasattr(result, 'final_output') and result.final_output:
                    output_text = str(result.final_output)
                
                # Check raw_responses for tool results
                if hasattr(result, 'raw_responses'):
                    for response in result.raw_responses:
                        if hasattr(response, 'content'):
                            for content_block in response.content:
                                if hasattr(content_block, 'type'):
                                    if content_block.type == 'tool_result':
                                        tool_result = str(content_block.content)
                                        output_text += tool_result + " "
                                        if "Course plan stored successfully" in tool_result:
                                            logger.info(f"Found store_course_plan result: {tool_result}")
            
            # Look for plan_id patterns (same as standalone test)
            patterns = [
                r'Course plan stored successfully with ID:\s*([a-f0-9\-]{36})',
                r'(?:plan[_-]id|ID)[:\s]*([a-f0-9\-]{36})',
                r'([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})'
            ]
            
            for pattern in patterns:
                match = re.search(pattern, output_text, re.IGNORECASE)
                if match:
                    plan_id = match.group(1)
                    logger.info(f"✅ Found plan_id: {plan_id}")
                    return plan_id
            
            logger.warning("❌ No plan_id found in agent output")
            return None
            
        except Exception as e:
            logger.error(f"Error extracting plan_id: {e}")
            return None
    
    async def _find_latest_plan_for_session(self, session_id: str) -> Optional[str]:
        """Find the latest plan for a session from database."""
        try:
            result = self.supabase.table('cm_course_plans')\
                .select('plan_id')\
                .eq('session_id', session_id)\
                .order('created_at', desc=True)\
                .limit(1)\
                .execute()
            
            if result.data and len(result.data) > 0:
                plan_id = result.data[0]['plan_id']
                logger.info(f"✅ Found plan_id from database: {plan_id}")
                return plan_id
            
            return None
            
        except Exception as e:
            logger.error(f"Error finding latest plan: {e}")
            return None
    
    async def _verify_plan_exists(self, plan_id: str):
        """Verify the plan exists in database."""
        try:
            result = self.supabase.table('cm_course_plans')\
                .select('plan_id, course_title, employee_name')\
                .eq('plan_id', plan_id)\
                .single()\
                .execute()
            
            if result.data:
                plan = result.data
                logger.info(f"✅ Plan verified: {plan.get('course_title')} for {plan.get('employee_name')}")
            else:
                raise Exception(f"Plan {plan_id} not found in database")
                
        except Exception as e:
            logger.error(f"Failed to verify plan: {e}")
            raise
    
    def _count_agent_turns(self, result) -> int:
        """Count the number of agent turns from result."""
        try:
            if isinstance(result, dict):
                return result.get('agent_turns', 0)
            elif hasattr(result, 'raw_responses'):
                return len(result.raw_responses)
            else:
                return 0
        except:
            return 0
    
    async def get_plan_details(self, plan_id: str) -> Dict[str, Any]:
        """Get detailed information about a course plan."""
        try:
            result = self.supabase.table('cm_course_plans')\
                .select('*')\
                .eq('plan_id', plan_id)\
                .single()\
                .execute()
            
            if result.data:
                return result.data
            else:
                raise Exception(f"Plan {plan_id} not found")
                
        except Exception as e:
            logger.error(f"Failed to get plan details: {e}")
            raise
    
    async def list_plans(
        self, 
        company_id: str, 
        limit: int = 10, 
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """List course plans for a company."""
        try:
            result = self.supabase.table('cm_course_plans')\
                .select('plan_id, course_title, employee_name, status, created_at, total_modules')\
                .eq('company_id', company_id)\
                .order('created_at', desc=True)\
                .limit(limit)\
                .offset(offset)\
                .execute()
            
            return result.data or []
            
        except Exception as e:
            logger.error(f"Failed to list plans: {e}")
            raise