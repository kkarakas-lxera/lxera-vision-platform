#!/usr/bin/env python3
"""
Comprehensive Agentic Pipeline Orchestrator
This orchestrator implements a full agentic workflow with real tool calling,
database operations, and progress tracking through OpenAI SDK.
"""

import json
import logging
import asyncio
from datetime import datetime
from typing import Dict, Any, List, Optional
import uuid
import os

# Import Sentry for LLM monitoring
import sentry_sdk
from config.sentry_config import initialize_sentry, capture_agent_performance

# Initialize Sentry
initialize_sentry()

# Import the Runner for agent execution
from agents import Runner

# Import all agents
from course_agents.planning_agent import create_planning_agent
from course_agents.research_agent import create_research_agent
from course_agents.database_agents import (
    create_database_content_agent,
    create_database_quality_agent,
    create_database_enhancement_agent
)
from course_agents.multimedia_agent import create_multimedia_agent
from course_agents.finalizer_agent import create_finalizer_agent

logger = logging.getLogger(__name__)


class AgenticPipelineOrchestrator:
    """
    Full agentic pipeline orchestrator that uses OpenAI agents with tool calling
    for comprehensive course generation.
    """
    
    def __init__(self):
        self.session_id = str(uuid.uuid4())
        
        # Initialize all agents
        self.planning_agent = create_planning_agent()
        self.research_agent = create_research_agent()
        self.content_agent = create_database_content_agent()
        self.quality_agent = create_database_quality_agent()
        self.enhancement_agent = create_database_enhancement_agent()
        self.multimedia_agent = create_multimedia_agent()
        self.finalizer_agent = create_finalizer_agent()
        
        # Pipeline state tracking
        self.pipeline_state = {
            "session_id": self.session_id,
            "start_time": datetime.now(),
            "current_stage": "initialization",
            "content_id": None,
            "agents_progress": {},
            "errors": [],
            "performance_metrics": {}
        }
        
        logger.info(f"🚀 Agentic Pipeline Orchestrator initialized - Session: {self.session_id[:8]}")
    
    async def run_complete_pipeline(
        self,
        employee_data: Dict[str, Any],
        skills_gaps: List[Dict[str, Any]],
        job_id: Optional[str] = None,
        progress_callback: Optional[Any] = None
    ) -> Dict[str, Any]:
        """
        Execute complete course generation pipeline using agents.
        
        Args:
            employee_data: Employee profile data
            skills_gaps: List of skill gaps to address
            job_id: Optional job ID for progress tracking
            progress_callback: Optional callback for progress updates
            
        Returns:
            Dict containing content_id and pipeline results
        """
        try:
            logger.info("🎯 Starting Comprehensive Agentic Pipeline")
            logger.info(f"👤 Employee: {employee_data.get('full_name', 'Unknown')}")
            logger.info(f"📊 Skills Gaps: {len(skills_gaps)} identified")
            
            # Stage 1: Planning Agent (10-20%)
            await self._update_progress(job_id, "Running Planning Agent", 10)
            planning_result = await self._run_planning_agent(employee_data, skills_gaps)
            if not planning_result.get("success"):
                return self._handle_pipeline_failure("planning", planning_result.get("error"))
            
            # Stage 2: Research Agent (20-40%)
            await self._update_progress(job_id, "Running Research Agent", 20)
            research_result = await self._run_research_agent(
                planning_result.get("course_structure", {}),
                skills_gaps
            )
            
            # Stage 3: Content Generation Agent (40-70%)
            await self._update_progress(job_id, "Running Content Generation Agent", 40)
            content_result = await self._run_content_agent(
                planning_result,
                research_result,
                employee_data
            )
            
            if not content_result.get("content_id"):
                return self._handle_pipeline_failure("content_generation", "No content_id returned")
            
            self.pipeline_state["content_id"] = content_result["content_id"]
            
            # Stage 4: Quality Assessment Agent (70-80%)
            await self._update_progress(job_id, "Running Quality Assessment Agent", 70)
            quality_result = await self._run_quality_agent(content_result["content_id"])
            
            # Stage 5: Enhancement Agent (80-90%)
            if quality_result.get("needs_enhancement", False):
                await self._update_progress(job_id, "Running Enhancement Agent", 80)
                enhancement_result = await self._run_enhancement_agent(
                    content_result["content_id"],
                    quality_result.get("enhancement_suggestions", [])
                )
            
            # Stage 6: Multimedia Agent (90-95%)
            await self._update_progress(job_id, "Running Multimedia Agent", 90)
            multimedia_result = await self._run_multimedia_agent(
                content_result["content_id"],
                employee_data
            )
            
            # Stage 7: Finalizer Agent (95-100%)
            await self._update_progress(job_id, "Running Finalizer Agent", 95)
            final_result = await self._run_finalizer_agent(
                content_result["content_id"],
                multimedia_result
            )
            
            # Complete!
            await self._update_progress(job_id, "Course generation complete", 100)
            
            return self._finalize_pipeline_results()
            
        except Exception as e:
            logger.error(f"❌ Agentic Pipeline failed: {e}")
            return self._handle_pipeline_failure("pipeline_execution", str(e))
    
    async def _run_planning_agent(self, employee_data: Dict[str, Any], skills_gaps: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Run the planning agent to create course structure."""
        with sentry_sdk.start_transaction(op="agent.planning", name="Planning Agent Execution") as transaction:
            try:
                logger.info("📋 Starting Planning Agent")
                
                # Capture agent metadata
                transaction.set_tag("agent_type", "planning")
                transaction.set_tag("employee_id", employee_data.get("id", "unknown"))
                transaction.set_data("skills_gap_count", len(skills_gaps))
                
                planning_input = f"""
                Create a comprehensive course plan for the following employee:
                
                EMPLOYEE PROFILE:
                {json.dumps(employee_data, indent=2)}
                
                SKILLS GAPS TO ADDRESS:
                {json.dumps(skills_gaps, indent=2)}
                
                Use the available planning tools to:
                1. Analyze the employee profile
                2. Prioritize skill gaps
                3. Generate course structure
                4. Create personalized learning path
                5. Generate research queries for content development
                """
                
                # Track agent execution
                with capture_agent_performance("planning", "execution"):
                    result = await Runner.run(
                        self.planning_agent,
                        planning_input,
                        max_turns=15,
                        progress_callback=self._agent_progress_callback
                    )
                
                self.pipeline_state["agents_progress"]["planning"] = {
                    "status": "completed" if result.get("success") else "failed",
                    "turns": result.get("turns", 0),
                    "timestamp": datetime.now().isoformat()
                }
                
                transaction.set_status("ok" if result.get("success") else "internal_error")
                return result
            
            except Exception as e:
                logger.error(f"Planning agent failed: {e}")
                sentry_sdk.capture_exception(e)
                transaction.set_status("internal_error")
                return {"success": False, "error": str(e)}
    
    async def _run_research_agent(self, course_structure: Dict[str, Any], skills_gaps: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Run the research agent to gather knowledge."""
        try:
            logger.info("🔍 Starting Research Agent")
            
            research_input = f"""
            Conduct comprehensive research for course content development:
            
            COURSE STRUCTURE:
            {json.dumps(course_structure, indent=2)}
            
            SKILLS TO RESEARCH:
            {json.dumps([gap['skill_name'] for gap in skills_gaps[:5]], indent=2)}
            
            Use the research tools to:
            1. Search for authoritative sources on each skill
            2. Extract detailed content from top sources
            3. Synthesize findings into structured insights
            4. Ensure mix of academic and practical sources
            """
            
            result = await Runner.run(
                self.research_agent,
                research_input,
                max_turns=20,
                progress_callback=self._agent_progress_callback
            )
            
            self.pipeline_state["agents_progress"]["research"] = {
                "status": "completed" if result.get("success") else "failed",
                "turns": result.get("turns", 0),
                "timestamp": datetime.now().isoformat()
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Research agent failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def _run_content_agent(self, planning_result: Dict[str, Any], research_result: Dict[str, Any], employee_data: Dict[str, Any]) -> Dict[str, Any]:
        """Run the content generation agent."""
        try:
            logger.info("📝 Starting Content Generation Agent")
            
            content_input = f"""
            Generate comprehensive course content using database workflow:
            
            COURSE PLAN:
            {json.dumps(planning_result.get("content", ""), indent=2)}
            
            RESEARCH FINDINGS:
            {json.dumps(research_result.get("content", ""), indent=2)}
            
            EMPLOYEE CONTEXT:
            - Name: {employee_data.get('full_name')}
            - Role: {employee_data.get('job_title_current')}
            - Career Goal: {employee_data.get('career_aspirations_next_role')}
            
            SESSION ID: {self.session_id}
            
            Use the database content tools to:
            1. Create new module content in database
            2. Generate and store each section (introduction, core content, applications, etc.)
            3. Ensure personalization throughout
            4. Return the content_id for tracking
            """
            
            result = await Runner.run(
                self.content_agent,
                content_input,
                max_turns=25,
                progress_callback=self._agent_progress_callback
            )
            
            self.pipeline_state["agents_progress"]["content"] = {
                "status": "completed" if result.get("success") else "failed",
                "turns": result.get("turns", 0),
                "timestamp": datetime.now().isoformat()
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Content agent failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def _run_quality_agent(self, content_id: str) -> Dict[str, Any]:
        """Run the quality assessment agent."""
        try:
            logger.info("📊 Starting Quality Assessment Agent")
            
            quality_input = f"""
            Perform comprehensive quality assessment for content_id: {content_id}
            
            Use the quality assessment tools to:
            1. Check content completeness and accuracy
            2. Verify personalization alignment
            3. Assess learning objective coverage
            4. Identify areas needing enhancement
            5. Generate quality score and recommendations
            """
            
            result = await Runner.run(
                self.quality_agent,
                quality_input,
                max_turns=10,
                progress_callback=self._agent_progress_callback
            )
            
            self.pipeline_state["agents_progress"]["quality"] = {
                "status": "completed" if result.get("success") else "failed",
                "turns": result.get("turns", 0),
                "timestamp": datetime.now().isoformat()
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Quality agent failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def _run_enhancement_agent(self, content_id: str, suggestions: List[str]) -> Dict[str, Any]:
        """Run the enhancement agent if needed."""
        try:
            logger.info("✨ Starting Enhancement Agent")
            
            enhancement_input = f"""
            Enhance content based on quality assessment feedback:
            
            CONTENT ID: {content_id}
            
            ENHANCEMENT SUGGESTIONS:
            {json.dumps(suggestions, indent=2)}
            
            Use enhancement tools to:
            1. Add missing content sections
            2. Improve clarity and depth
            3. Add industry-specific examples
            4. Integrate latest research findings
            """
            
            result = await Runner.run(
                self.enhancement_agent,
                enhancement_input,
                max_turns=15,
                progress_callback=self._agent_progress_callback
            )
            
            self.pipeline_state["agents_progress"]["enhancement"] = {
                "status": "completed" if result.get("success") else "failed",
                "turns": result.get("turns", 0),
                "timestamp": datetime.now().isoformat()
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Enhancement agent failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def _run_multimedia_agent(self, content_id: str, employee_data: Dict[str, Any]) -> Dict[str, Any]:
        """Run the multimedia generation agent."""
        try:
            logger.info("🎬 Starting Multimedia Agent")
            
            multimedia_input = f"""
            Generate multimedia content for course:
            
            CONTENT ID: {content_id}
            
            PERSONALIZATION:
            - Employee Name: {employee_data.get('full_name')}
            - Current Role: {employee_data.get('job_title_current')}
            - Learning Style: Visual and Interactive
            
            Use multimedia tools to:
            1. Create personalized audio narration
            2. Generate presentation slides
            3. Produce educational videos
            4. Ensure employee name is used in narration
            """
            
            result = await Runner.run(
                self.multimedia_agent,
                multimedia_input,
                max_turns=15,
                progress_callback=self._agent_progress_callback
            )
            
            self.pipeline_state["agents_progress"]["multimedia"] = {
                "status": "completed" if result.get("success") else "failed",
                "turns": result.get("turns", 0),
                "timestamp": datetime.now().isoformat()
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Multimedia agent failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def _run_finalizer_agent(self, content_id: str, multimedia_result: Dict[str, Any]) -> Dict[str, Any]:
        """Run the finalizer agent to package everything."""
        try:
            logger.info("📦 Starting Finalizer Agent")
            
            finalizer_input = f"""
            Finalize and package the complete course:
            
            CONTENT ID: {content_id}
            MULTIMEDIA ASSETS: {json.dumps(multimedia_result.get("content", ""), indent=2)}
            
            Use finalizer tools to:
            1. Package all content and multimedia
            2. Generate completion certificate template
            3. Create progress tracking structure
            4. Prepare final deliverable
            """
            
            result = await Runner.run(
                self.finalizer_agent,
                finalizer_input,
                max_turns=10,
                progress_callback=self._agent_progress_callback
            )
            
            self.pipeline_state["agents_progress"]["finalizer"] = {
                "status": "completed" if result.get("success") else "failed",
                "turns": result.get("turns", 0),
                "timestamp": datetime.now().isoformat()
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Finalizer agent failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def _agent_progress_callback(self, agent_name: str, tool_name: str, turn: int):
        """Callback for agent progress updates."""
        logger.info(f"📍 {agent_name} - Tool: {tool_name} - Turn: {turn}")
    
    async def _update_progress(self, job_id: Optional[str], phase: str, percentage: int):
        """Update job progress in database."""
        if job_id:
            try:
                from supabase import create_client
                supabase_url = os.getenv('SUPABASE_URL')
                supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
                
                if supabase_url and supabase_key:
                    supabase = create_client(supabase_url, supabase_key)
                    supabase.table('course_generation_jobs').update({
                        'current_phase': phase,
                        'progress_percentage': percentage,
                        'updated_at': datetime.now().isoformat()
                    }).eq('id', job_id).execute()
            except Exception as e:
                logger.warning(f"Could not update job progress: {e}")
    
    def _finalize_pipeline_results(self) -> Dict[str, Any]:
        """Finalize pipeline results."""
        total_time = (datetime.now() - self.pipeline_state["start_time"]).total_seconds()
        
        return {
            "pipeline_success": True,
            "session_id": self.session_id,
            "content_id": self.pipeline_state.get("content_id"),
            "total_processing_time": total_time,
            "agents_progress": self.pipeline_state["agents_progress"],
            "pipeline_state": self.pipeline_state,
            "completion_timestamp": datetime.now().isoformat()
        }
    
    def _handle_pipeline_failure(self, stage: str, error: str) -> Dict[str, Any]:
        """Handle pipeline failure."""
        failure_time = datetime.now()
        total_time = (failure_time - self.pipeline_state["start_time"]).total_seconds()
        
        return {
            "pipeline_success": False,
            "session_id": self.session_id,
            "failed_stage": stage,
            "error_message": error,
            "failure_time": failure_time.isoformat(),
            "total_time_before_failure": total_time,
            "pipeline_state": self.pipeline_state
        }


# Convenience function for integration
async def run_agentic_pipeline(
    employee_data: Dict[str, Any],
    skills_gaps: List[Dict[str, Any]],
    job_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Run the complete agentic pipeline.
    """
    orchestrator = AgenticPipelineOrchestrator()
    return await orchestrator.run_complete_pipeline(
        employee_data,
        skills_gaps,
        job_id
    )