"""Main course generation workflow runner."""

import os
import json
import asyncio
import logging
from typing import Dict, Any, Optional
from datetime import datetime
from pathlib import Path

from agents import Runner

from ..config.settings import get_settings
from ..course_agents.coordinator_agent import create_coordinator_agent
from ..models.employee_models import EmployeeProfile
from ..models.course_models import CourseStructure

logger = logging.getLogger(__name__)


class CourseRunner:
    """
    Main course generation runner using OpenAI Agents.
    
    Replaces the complex LangGraph execution with simple agent conversations.
    """
    
    def __init__(self, output_dir: Optional[str] = None):
        self.settings = get_settings()
        self.output_dir = Path(output_dir) if output_dir else Path(self.settings.output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Create coordinator agent
        self.coordinator_agent = create_coordinator_agent()
        
        logger.info("CourseRunner initialized with OpenAI Agents")
    
    async def generate_course(
        self,
        employee_data: Dict[str, Any],
        course_requirements: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate a complete course using OpenAI Agents workflow.
        
        This replaces the entire LangGraph graph.invoke() call with a single
        agent conversation that handles all orchestration automatically.
        """
        try:
            start_time = datetime.now()
            
            # Prepare course requirements
            if course_requirements is None:
                course_requirements = self._get_default_course_requirements()
            
            # Combine employee data and requirements
            generation_request = self._build_generation_request(employee_data, course_requirements)
            
            logger.info(f"Starting course generation for {employee_data.get('full_name', 'Employee')}")
            
            # Execute the agent workflow
            # This single call replaces the entire complex LangGraph orchestration
            result = await Runner.run(
                self.coordinator_agent,
                input=generation_request,
                max_turns=self.settings.max_agent_turns
            )
            
            # Process and save results
            generation_result = await self._process_generation_result(
                result, employee_data, start_time
            )
            
            logger.info(f"Course generation completed in {generation_result['duration_minutes']:.1f} minutes")
            
            return generation_result
            
        except Exception as e:
            logger.error(f"Course generation failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "employee_name": employee_data.get('full_name', 'Unknown'),
                "generation_timestamp": datetime.now().isoformat()
            }
    
    def generate_course_sync(
        self,
        employee_data: Dict[str, Any],
        course_requirements: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Synchronous wrapper for course generation."""
        return asyncio.run(self.generate_course(employee_data, course_requirements))
    
    def _get_default_course_requirements(self) -> Dict[str, Any]:
        """Get default course requirements."""
        return {
            "course_title": "Financial Analysis Mastery",
            "total_modules": 16,
            "target_weeks": 4,
            "modules_per_week": 4,
            "learning_time_target_hours": 16,
            "course_objectives": [
                "Master fundamental financial analysis concepts",
                "Develop practical analytical skills",
                "Apply financial tools and techniques",
                "Build confidence in financial decision-making"
            ],
            "complexity_level": "intermediate",
            "focus_areas": [
                "Financial statement analysis",
                "Ratio analysis and interpretation",
                "Cash flow analysis",
                "Investment evaluation"
            ]
        }
    
    def _build_generation_request(
        self,
        employee_data: Dict[str, Any],
        course_requirements: Dict[str, Any]
    ) -> str:
        """Build the generation request for the coordinator agent."""
        employee_name = employee_data.get("full_name", "Employee")
        current_role = employee_data.get("job_title_specific", employee_data.get("job_title_current", "Professional"))
        career_goal = employee_data.get("career_aspirations_next_role", "Advanced Professional")
        
        request = f"""
        Generate a comprehensive personalized course with the following specifications:

        EMPLOYEE PROFILE:
        - Name: {employee_name}
        - Current Role: {current_role}
        - Career Goal: {career_goal}
        - Skills: {', '.join(employee_data.get('skills', [])[:5])}
        - Tools Used: {', '.join(employee_data.get('tools_software_used_regularly', [])[:3])}

        COURSE REQUIREMENTS:
        - Title: {course_requirements.get('course_title', 'Financial Analysis Course')}
        - Total Modules: {course_requirements.get('total_modules', 16)}
        - Target Duration: {course_requirements.get('learning_time_target_hours', 16)} hours
        - Complexity: {course_requirements.get('complexity_level', 'intermediate')}

        CONTENT SPECIFICATIONS:
        - 6750-8250 words per module (strict requirement)
        - 65% reading content, 35% activities and assessments
        - Comprehensive web research for each module using Tavily, EXA, and Firecrawl
        - High-quality content with minimum 7.5/10 quality score
        - Professional multimedia with video animations and audio narration
        - Complete personalization for {employee_name}'s context

        WORKFLOW REQUIREMENTS:
        1. Start with comprehensive employee analysis and personalization planning
        2. For each module: conduct thorough research → generate content → quality validation → multimedia creation
        3. Ensure all modules meet word count and quality requirements
        4. Create complete course package with all assets

        Please coordinate the complete course generation workflow, ensuring all quality standards are met.
        """
        
        return request
    
    async def _process_generation_result(
        self,
        agent_result: Any,
        employee_data: Dict[str, Any],
        start_time: datetime
    ) -> Dict[str, Any]:
        """Process the agent generation result and save outputs."""
        end_time = datetime.now()
        duration = end_time - start_time
        
        # Extract the final output from agent conversation
        final_output = agent_result.final_output if hasattr(agent_result, 'final_output') else str(agent_result)
        
        # Build result structure
        generation_result = {
            "success": True,
            "employee_name": employee_data.get('full_name', 'Employee'),
            "employee_role": employee_data.get('job_title_specific', 'Professional'),
            "generation_id": f"course_{int(start_time.timestamp())}",
            "generation_timestamp": start_time.isoformat(),
            "completion_timestamp": end_time.isoformat(),
            "duration_minutes": duration.total_seconds() / 60,
            "agent_workflow_result": final_output,
            "conversation_history": getattr(agent_result, 'conversation_history', []) if hasattr(agent_result, 'conversation_history') else [],
            "output_files": []
        }
        
        # Save generation result
        await self._save_generation_result(generation_result)
        
        return generation_result
    
    async def _save_generation_result(self, result: Dict[str, Any]) -> None:
        """Save generation result to files."""
        try:
            # Create output directory for this generation
            generation_dir = self.output_dir / f"generation_{result['generation_id']}"
            generation_dir.mkdir(exist_ok=True)
            
            # Save main result
            result_file = generation_dir / "generation_result.json"
            with open(result_file, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2, default=str)
            
            result["output_files"].append(str(result_file))
            
            # Save conversation history if available
            if result.get("conversation_history"):
                conversation_file = generation_dir / "conversation_history.json"
                with open(conversation_file, 'w', encoding='utf-8') as f:
                    json.dump(result["conversation_history"], f, indent=2, default=str)
                
                result["output_files"].append(str(conversation_file))
            
            logger.info(f"Generation result saved to {generation_dir}")
            
        except Exception as e:
            logger.error(f"Failed to save generation result: {e}")


def create_course_runner(output_dir: Optional[str] = None) -> CourseRunner:
    """Factory function to create course runner."""
    return CourseRunner(output_dir)


# Convenience function for direct usage
async def generate_course(
    employee_data: Dict[str, Any],
    course_requirements: Optional[Dict[str, Any]] = None,
    output_dir: Optional[str] = None
) -> Dict[str, Any]:
    """
    Direct course generation function.
    
    Simplified interface for generating courses with OpenAI Agents.
    """
    runner = create_course_runner(output_dir)
    return await runner.generate_course(employee_data, course_requirements)


def generate_course_sync(
    employee_data: Dict[str, Any],
    course_requirements: Optional[Dict[str, Any]] = None,
    output_dir: Optional[str] = None
) -> Dict[str, Any]:
    """Synchronous version of course generation."""
    return asyncio.run(generate_course(employee_data, course_requirements, output_dir))