#!/usr/bin/env python3
"""
LXERA Database Pipeline Integration
Modified to retrieve employee data and skills gaps from Supabase database
"""

import json
import logging
import asyncio
from datetime import datetime
from typing import Dict, Any, List, Optional
import uuid
import os
from supabase import create_client, Client

# Configure logger first before any usage
logger = logging.getLogger(__name__)

# Import the new SDK-based coordinator for comprehensive agent-based generation
from lxera_agents import Runner, trace
from course_agents.coordinator import create_course_generation_coordinator

class LXERADatabasePipeline:
    """
    SDK-based pipeline orchestrator that integrates with LXERA's Supabase database
    to retrieve employee data and skills gap analysis using OpenAI Agents SDK.
    """
    
    def __init__(self):
        
        # Initialize Supabase client with LXERA credentials
        # Use environment variables with hardcoded fallbacks for Render deployment
        self.supabase_url = os.getenv('SUPABASE_URL', 'https://xwfweumeryrgbguwrocr.supabase.co')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZndldW1lcnlyZ2JndXdyb2NyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc2MzQ0MCwiZXhwIjoyMDY2MzM5NDQwfQ.qxXpBxUKhKA4AQT4UQnIEJGbGNrRDMbBroZU8YaypSY') or os.getenv('SUPABASE_ANON_KEY')
            
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        logger.info("🔌 Connected to LXERA Supabase database")
    
    async def generate_course_for_employee(
        self,
        employee_id: str,
        company_id: str,
        assigned_by_id: str,
        job_id: Optional[str] = None,
        generation_mode: str = 'full',
        plan_id: Optional[str] = None,
        enable_multimedia: bool = False,
        feedback_context: Optional[str] = None,
        previous_course_content: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate a personalized course for an employee using their existing skills gap analysis.
        
        Args:
            employee_id: Employee ID from database
            company_id: Company ID
            assigned_by_id: User ID who initiated the generation
            job_id: Optional job tracking ID
            generation_mode: 'full', 'first_module', 'remaining_modules', 'outline_only', or 'regenerate_with_feedback'
            plan_id: Optional existing plan ID to use
            enable_multimedia: Whether to enable multimedia generation
            feedback_context: Admin feedback for regeneration improvements
            previous_course_content: Previous course content for reference during regeneration
            
        Returns:
            Dict containing content_id and pipeline results (or plan_id for outline_only)
        """
        try:
            # Update job progress if tracking
            if job_id:
                await self._update_job_progress(job_id, {
                    'current_phase': 'Retrieving employee data',
                    'progress_percentage': 10
                })
            
            # Phase 1: Retrieve employee data from database
            employee_data = await self._retrieve_employee_data(employee_id)
            
            if job_id:
                await self._update_job_progress(job_id, {
                    'current_phase': 'Retrieving skills gap analysis',
                    'progress_percentage': 20,
                    'current_employee_name': employee_data.get('full_name', 'Unknown')
                })
            
            # Phase 2: Retrieve skills gap analysis
            skills_gaps = await self._retrieve_skills_gaps(employee_id, employee_data['position'])
            
            # Update job progress
            if job_id:
                await self._update_job_progress(job_id, {
                    'current_phase': 'Initializing AI agents',
                    'progress_percentage': 30
                })
            
            # Check if this is outline_only mode - just run planning agent
            if generation_mode == 'outline_only':
                logger.info("📝 Outline-only mode: Running Planning Agent only")
                pipeline_result = await self._run_planning_only_pipeline(
                    employee_data,
                    skills_gaps,
                    job_id
                )
            else:
                # Run the complete agentic pipeline with skills gaps using new SDK
                pipeline_result = await self._run_sdk_pipeline(
                    employee_data,
                    skills_gaps,
                    job_id,
                    generation_mode,
                    existing_plan_id=plan_id,  # Pass the plan_id if available
                    feedback_context=feedback_context,
                    previous_course_content=previous_course_content
                )
            
            # If successful, create or update course assignment (not for outline_only)
            if generation_mode != 'outline_only' and pipeline_result.get('pipeline_success') and pipeline_result.get('content_id'):
                if generation_mode == 'regenerate_with_feedback':
                    # For regeneration, update the existing assignment
                    assignment_id = await self._update_course_assignment_for_regeneration(
                        employee_id,
                        pipeline_result['content_id'],
                        company_id,
                        assigned_by_id,
                        pipeline_result.get('plan_id')
                    )
                else:
                    # For new courses, create new assignment
                    assignment_id = await self._create_course_assignment(
                        employee_id,
                        pipeline_result['content_id'],
                        company_id,
                        assigned_by_id,
                        pipeline_result.get('plan_id'),
                        generation_mode
                    )
                pipeline_result['assignment_id'] = assignment_id
            
            # Final job update
            if job_id:
                if generation_mode == 'outline_only':
                    completion_message = 'Course outline generated successfully'
                elif generation_mode == 'first_module':
                    completion_message = 'First module generated - course preview ready'
                else:
                    completion_message = 'Course generation complete'
                await self._update_job_progress(job_id, {
                    'current_phase': completion_message,
                    'progress_percentage': 100,
                    'successful_courses': 1,
                    'generation_mode': generation_mode,
                    'can_resume': generation_mode == 'first_module'
                })
            
            return pipeline_result
            
        except Exception as e:
            logger.error(f"❌ Course generation failed: {e}")
            if job_id:
                await self._update_job_progress(job_id, {
                    'status': 'failed',
                    'error_message': str(e)
                })
            raise
    
    async def _run_sdk_pipeline(
        self,
        employee_data: Dict[str, Any],
        skills_gaps: List[Dict[str, Any]],
        job_id: Optional[str] = None,
        generation_mode: str = 'full',
        existing_plan_id: Optional[str] = None,
        feedback_context: Optional[str] = None,
        previous_course_content: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Run the course generation pipeline using OpenAI SDK with automated agent handoffs.
        """
        try:
            logger.info("🚀 Starting SDK-based course generation pipeline")
            
            # Check if we should skip planning phase (for first_module with existing plan)
            plan_id = existing_plan_id
            
            if not plan_id:
                # No existing plan, run Planning Agent
                # Update job progress
                if job_id:
                    await self._update_job_progress(job_id, {
                        'current_phase': 'Running Planning Agent',
                        'progress_percentage': 40
                    })
                
                # Phase 1: Planning Agent
                from course_agents.planning_agent import create_planning_agent
                planning_agent = create_planning_agent()
                
                # Build planning message with feedback context if regenerating
                planning_message = f"""
                Create a comprehensive personalized course plan for {employee_data['full_name']}.
                
                EMPLOYEE PROFILE:
                {json.dumps(employee_data, indent=2)}
                
                SKILLS GAP ANALYSIS:
                {json.dumps(skills_gaps, indent=2)}
                """
                
                # Add feedback context for regeneration
                if generation_mode == 'regenerate_with_feedback' and feedback_context:
                    planning_message += f"""
                
                REGENERATION WITH FEEDBACK:
                This is a course regeneration based on admin feedback. Please incorporate the following improvements:
                
                ADMIN FEEDBACK: {feedback_context}
                
                PREVIOUS COURSE CONTENT (for reference):
                {json.dumps(previous_course_content, indent=2) if previous_course_content else 'No previous content provided'}
                
                Focus on addressing the specific feedback provided. Ensure the new course plan directly addresses the concerns and improvement suggestions mentioned in the feedback.
                """
                
                planning_message += """
                
                Execute the 6-step planning workflow:
                1. analyze_employee_profile
                2. prioritize_skill_gaps  
                3. generate_course_structure_plan
                4. generate_research_queries
                5. create_personalized_learning_path
                6. store_course_plan
                
                Complete these steps and store the final course plan.
                """
                
                # Update job progress for planning phase (adjust for generation mode)
                if job_id:
                    planning_progress = 30 if generation_mode == 'full' else 15  # Planning takes less % in partial mode
                    await self._update_job_progress(job_id, {
                        'current_phase': 'Planning Phase: Creating personalized course structure',
                        'progress_percentage': planning_progress,
                        'generation_mode': generation_mode
                    })
                
                with trace("planning_phase"):
                    planning_result = await Runner.run(
                        planning_agent,
                        planning_message,
                        max_turns=8  # Reduced limit - 6 steps + 2 for final response
                    )
                
                # Extract plan_id from planning result
                plan_id = self._extract_plan_id(planning_result)
                
                if not plan_id:
                    logger.error("❌ Planning phase failed - no plan_id found")
                    return {
                        'pipeline_success': False,
                        'error': 'Planning phase failed to produce a course plan',
                        'content_id': None
                    }
                
                logger.info(f"✅ Planning phase completed with plan_id: {plan_id}")
            else:
                logger.info(f"✅ Using existing plan_id: {plan_id} (skipping Planning Agent)")
                if job_id:
                    await self._update_job_progress(job_id, {
                        'current_phase': 'Using existing course plan',
                        'progress_percentage': 30,
                        'generation_mode': generation_mode
                    })
            
            # Phase 2: Enhanced Research Agent
            if job_id:
                research_progress = 60 if generation_mode == 'full' else 30  # Research takes less % in partial mode
                await self._update_job_progress(job_id, {
                    'current_phase': 'Research Phase: Enhanced comprehensive research with advanced Tavily/Firecrawl',
                    'progress_percentage': research_progress,
                    'generation_mode': generation_mode
                })
            
            # Check feature flag for enhanced research
            enhanced_research_enabled = os.getenv('ENHANCED_RESEARCH_ENABLED', 'true').lower() == 'true'
            
            if enhanced_research_enabled:
                logger.info("🔬 Using Enhanced Research v2 with significantly improved Tavily/Firecrawl usage")
                from course_agents.research_agent import create_enhanced_research_agent
                research_agent = create_enhanced_research_agent()
                
                research_message = f"""
                Execute enhanced comprehensive research for course plan_id: {plan_id}
                
                ENHANCED WORKFLOW (Significantly Improved Tavily/Firecrawl Usage):
                1. fetch_course_plan - Load the course plan details using plan_id: {plan_id}
                2. enhanced_comprehensive_research - Execute advanced multi-domain research with:
                   - Academic sources: .edu, research institutions, peer-reviewed content
                   - Industry sources: McKinsey, Deloitte, HBR, Bloomberg, industry leaders  
                   - Technical sources: GitHub, Stack Overflow, official documentation
                   - Advanced Firecrawl extraction with content quality validation
                3. validate_research_comprehensively - 9-dimensional quality assessment:
                   - Source credibility, content accuracy, comprehensiveness
                   - Currency/timeliness, source diversity, evidence quality
                   - Practical relevance, theoretical grounding, synthesis quality
                4. store_enhanced_research_v2 - Save comprehensive results with detailed metadata
                
                ENHANCED QUALITY REQUIREMENTS:
                - Minimum 0.75 overall quality score (significantly improved validation)
                - Multi-domain source coverage with credibility scoring
                - Advanced content extraction using Firecrawl's full parameter set
                - Systematic quality gates with comprehensive source breakdown
                - Evidence-based synthesis with proper citations
                
                Focus on research-grade content quality for professional learning.
                """
            else:
                logger.info("📚 Using Standard Research workflow")
                from course_agents.research_agent import create_research_agent
                research_agent = create_research_agent()
                
                research_message = f"""
                Execute comprehensive research for course plan_id: {plan_id}
                
                Follow this exact workflow:
                1. fetch_course_plan - Load the course plan details using plan_id: {plan_id}
                2. firecrawl_search - Search for relevant URLs for each module topic
                3. scrape_do_extract - Extract detailed content from authoritative sources
                4. research_synthesizer - Synthesize findings into structured insights
                5. store_research_results - Save your research findings
                
                Focus on finding practical, industry-relevant content for the learner.
                """
            
            with trace("enhanced_research_phase" if enhanced_research_enabled else "research_phase"):
                research_result = await Runner.run(
                    research_agent,
                    research_message,
                    max_turns=20 if enhanced_research_enabled else 15  # More turns for enhanced research
                )
            
            # Extract research_id from research result
            research_id = self._extract_research_id(research_result)
            
            if not research_id:
                logger.warning("⚠️ Research phase completed but no research_id found")
                # Continue anyway as research might have been stored
            else:
                if enhanced_research_enabled:
                    logger.info(f"✅ Enhanced research phase completed with research_id: {research_id}")
                    # Log enhanced research metrics
                    await self._log_enhanced_research_metrics(research_id, plan_id)
                else:
                    logger.info(f"✅ Standard research phase completed with research_id: {research_id}")
            
            # Phase 3: Content Generation Agent - Generate modules based on mode
            if job_id:
                content_start_progress = 70 if generation_mode == 'full' else 60  # Content starts later in partial mode
                await self._update_job_progress(job_id, {
                    'current_phase': 'Content Generation Phase: Creating course materials',
                    'progress_percentage': content_start_progress,
                    'generation_mode': generation_mode
                })
            
            # Fetch course plan to get all modules
            course_plan = await self._fetch_course_plan(plan_id)
            if not course_plan:
                logger.error(f"❌ Failed to fetch course plan {plan_id}")
                return {
                    'pipeline_success': False,
                    'error': 'Course plan not found',
                    'content_id': None
                }
            
            modules = course_plan.get('course_structure', {}).get('modules', [])
            total_modules = len(modules)
            
            # Determine how many modules to generate based on mode  
            logger.info(f"🎯 Generation mode: '{generation_mode}' - Total modules planned: {total_modules}")
            logger.info("🤖 LLM Model: llama-3.3-70b-versatile (Groq)")
            logger.info("📊 Model Provider: Groq API")
            
            if generation_mode == 'first_module':
                modules_to_generate = modules[:1]  # Only first module
                logger.info(f"📚 FIRST MODULE mode: generating module 1 only (1/{total_modules})")
            elif generation_mode == 'resume_from_module_2':
                modules_to_generate = modules[1:]  # Skip first module, generate rest
                logger.info(f"📚 RESUME mode: generating modules 2-{total_modules}")
            elif generation_mode == 'outline_only':
                # This should not happen here since outline_only is handled earlier
                logger.error(f"❌ OUTLINE_ONLY mode should not reach content generation!")
                return {
                    'pipeline_success': False,
                    'error': 'outline_only mode should not generate content',
                    'generation_mode': generation_mode
                }
            elif generation_mode in ['full', 'regenerate_with_feedback']:
                modules_to_generate = modules  # All modules
                logger.info(f"📚 FULL mode: generating all {total_modules} modules")
            else:
                # Unknown generation mode - log warning and default to full
                logger.warning(f"⚠️ Unknown generation_mode '{generation_mode}' - defaulting to full generation")
                modules_to_generate = modules  # All modules
                logger.info(f"📚 DEFAULT (full) mode: generating all {total_modules} modules")
            
            from course_agents.content_agent import create_content_agent
            content_agent = create_content_agent()
            
            # Generate content for selected modules
            content_ids = []
            for idx, module in enumerate(modules_to_generate):
                module_number = idx + 1
                module_title = module.get('title', f'Module {module_number}')
                logger.info(f"📖 Generating content for Module {module_number}/{len(modules)}: {module_title}")
                
                if job_id:
                    # Update progress for each module (adjust for partial vs full generation)
                    if generation_mode == 'first_module':
                        # For partial generation: 60-100% for the single module
                        module_progress = 60 + (40 * (idx + 1 / len(modules_to_generate)))
                    else:
                        # For full generation: 70-90% for all modules
                        module_progress = 70 + (20 * (idx / len(modules_to_generate)))
                    
                    await self._update_job_progress(job_id, {
                        'current_phase': f'Generating Module {module_number}/{total_modules}: {module_title}',
                        'progress_percentage': int(module_progress)
                    })
                
                # Build content message with feedback context if regenerating
                content_message = f"""
                Generate comprehensive course content for Module {module_number}: {module_title}
                
                DATABASE CONTEXT:
                - plan_id: {plan_id}
                {'- research_id: ' + research_id if research_id else ''}
                
                MODULE DETAILS:
                - Module Number: {module_number}
                - Module Title: {module_title}
                - Topics: {', '.join(module.get('topics', []))}
                - Duration: {module.get('duration', '1 week')}
                - Priority: {module.get('priority', 'high')}
                """
                
                # Add feedback context for regeneration
                if generation_mode == 'regenerate_with_feedback' and feedback_context:
                    content_message += f"""
                
                REGENERATION WITH FEEDBACK:
                This is content regeneration based on admin feedback. Please incorporate these specific improvements:
                
                ADMIN FEEDBACK: {feedback_context}
                
                PREVIOUS COURSE CONTENT (for reference):
                {json.dumps(previous_course_content, indent=2) if previous_course_content else 'No previous content provided'}
                
                Focus on addressing the specific feedback. If feedback mentions "too basic", increase complexity and depth.
                If feedback mentions "more practical", emphasize hands-on exercises and real-world applications.
                If feedback mentions missing topics, ensure those topics are thoroughly covered.
                """
                
                content_message += """
                
                Follow the content generation workflow:
                1. fetch_course_plan - Get complete course structure using plan_id: {plan_id}
                2. create_new_module_content - Create a new module and get content_id
                3. generate_module_introduction - Create personalized introduction
                4. quality_assessor_with_storage - Assess introduction quality
                5. store_content_section - Save introduction if approved
                6. generate_core_content - Develop comprehensive content
                7. quality_assessor_with_storage - Assess core content quality
                8. store_content_section - Save core content if approved
                9. generate_practical_applications - Create hands-on examples
                10. quality_assessor_with_storage - Assess practical applications quality
                11. store_content_section - Save practical applications if approved
                12. generate_case_studies - Create relevant scenarios
                13. quality_assessor_with_storage - Assess case studies quality
                14. store_content_section - Save case studies if approved
                15. generate_assessment_materials - Create quizzes/exercises
                16. quality_assessor_with_storage - Assess assessment materials quality
                17. store_content_section - Save assessments if approved
                18. compile_complete_module - Compile all sections
                19. update_module_status - Set status to "approved"
                
                IMPORTANT: Store each section IMMEDIATELY after quality approval (score ≥ 7.5).
                """
                
                with trace(f"content_generation_module_{module_number}"):
                    content_result = await Runner.run(
                        content_agent,
                        content_message,
                        max_turns=25  # Increased for quality checks
                    )
                
                # Extract content_id from content result
                content_id = self._extract_content_id(content_result)
                
                if not content_id:
                    logger.error(f"❌ Module {module_number} generation failed - no content_id found")
                    # Continue with other modules even if one fails
                else:
                    logger.info(f"✅ Module {module_number} completed with content_id: {content_id}")
                    content_ids.append({
                        'module_number': module_number,
                        'module_title': module_title,
                        'content_id': content_id
                    })
            
            if not content_ids:
                logger.error("❌ No modules were successfully generated")
                return {
                    'pipeline_success': False,
                    'error': 'Failed to generate any module content',
                    'content_id': None
                }
            
            logger.info(f"✅ Content generation completed: {len(content_ids)}/{total_modules} modules (mode: {generation_mode})")
            
            # Phase 4: Quality Assessment (simplified for now)
            if job_id:
                await self._update_job_progress(job_id, {
                    'current_phase': 'Finalizing course content',
                    'progress_percentage': 90
                })
            
            logger.info(f"✅ SDK Pipeline completed with {len(content_ids)} modules")
            
            # Phase 5: Multimedia Generation (if enabled and full course completed)
            multimedia_generation_enabled = enable_multimedia  # Use the parameter passed from frontend
            if multimedia_generation_enabled and generation_mode == 'full' and len(content_ids) == total_modules:
                logger.info("🎬 Starting multimedia generation for completed course")
                multimedia_result = await self._generate_course_multimedia(
                    content_ids=content_ids,
                    plan_id=plan_id,
                    employee_data=employee_data,
                    job_id=job_id
                )
                
                return {
                    'pipeline_success': True,
                    'generation_mode': generation_mode,
                    'content_ids': content_ids,  # List of all module content IDs
                    'content_id': content_ids[0]['content_id'] if content_ids else None,  # First module for compatibility
                    'plan_id': plan_id,
                    'research_id': research_id,
                    'multimedia_session_id': multimedia_result.get('session_id'),
                    'multimedia_status': multimedia_result.get('status', 'not_started'),
                    'agent_result': f"Course generated successfully: {len(content_ids)} modules created with multimedia ({generation_mode} mode)",
                    'agent_name': 'full_pipeline',
                    'sdk_handoffs': True,
                    'modules_generated': len(content_ids),
                    'total_modules_planned': total_modules,
                    'can_resume': generation_mode == 'first_module',
                    'partial_generation': generation_mode == 'first_module'
                }
            
            return {
                'pipeline_success': True,
                'generation_mode': generation_mode,
                'content_ids': content_ids,  # List of all module content IDs
                'content_id': content_ids[0]['content_id'] if content_ids else None,  # First module for compatibility
                'plan_id': plan_id,
                'research_id': research_id,
                'agent_result': f"Course generated successfully: {len(content_ids)} modules created ({generation_mode} mode)",
                'agent_name': 'full_pipeline',
                'sdk_handoffs': True,
                'modules_generated': len(content_ids),
                'total_modules_planned': total_modules,
                'can_resume': generation_mode == 'first_module',
                'partial_generation': generation_mode == 'first_module'
            }
            
        except Exception as e:
            logger.error(f"❌ SDK Pipeline failed: {e}")
            return {
                'pipeline_success': False,
                'error': str(e),
                'content_id': None
            }
    
    async def _run_planning_only_pipeline(
        self,
        employee_data: Dict[str, Any],
        skills_gaps: List[Dict[str, Any]],
        job_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Run only the Planning Agent to generate a course outline.
        This is used for the outline_only generation mode.
        
        Args:
            employee_data: Employee profile data
            skills_gaps: List of skills gaps
            job_id: Optional job tracking ID
            
        Returns:
            Dict containing plan_id and pipeline results
        """
        try:
            logger.info("🎯 Starting Planning-Only Pipeline (Outline Generation)")
            logger.info("🤖 LLM Model: llama-3.3-70b-versatile (Groq)")
            logger.info("📊 Model Provider: Groq API")
            logger.info("🔧 Model Type: Planning & Content Generation")
            
            # Update job progress
            if job_id:
                await self._update_job_progress(job_id, {
                    'current_phase': 'Planning Phase: Creating personalized course outline',
                    'progress_percentage': 40,
                    'generation_mode': 'outline_only'
                })
            
            # Phase 1: Planning Agent Only
            from course_agents.planning_agent import create_planning_agent
            planning_agent = create_planning_agent()
            
            planning_message = f"""
            Create a comprehensive personalized course plan for {employee_data['full_name']}.
            
            EMPLOYEE PROFILE:
            {json.dumps(employee_data, indent=2)}
            
            SKILLS GAP ANALYSIS:
            {json.dumps(skills_gaps, indent=2)}
            
            Execute the 6-step planning workflow:
            1. analyze_employee_profile
            2. prioritize_skill_gaps  
            3. generate_course_structure_plan
            4. generate_research_queries
            5. create_personalized_learning_path
            6. store_course_plan
            
            Complete these steps and store the final course plan.
            """
            
            # Run planning agent
            with trace("planning_phase_outline_only"):
                planning_result = await Runner.run(
                    planning_agent,
                    planning_message,
                    max_turns=8  # 6 steps + 2 for final response
                )
            
            # Extract plan_id from planning result
            plan_id = self._extract_plan_id(planning_result)
            
            if not plan_id:
                logger.error("❌ Planning phase failed - no plan_id found")
                return {
                    'pipeline_success': False,
                    'error': 'Planning phase failed to produce a course plan',
                    'content_id': None
                }
            
            logger.info(f"✅ Planning phase completed with plan_id: {plan_id}")
            
            # Update job progress to complete
            if job_id:
                await self._update_job_progress(job_id, {
                    'current_phase': 'Course outline generated successfully',
                    'progress_percentage': 100,
                    'generation_mode': 'outline_only'
                })
            
            # Return success with plan_id (no content_id for outline_only)
            return {
                'pipeline_success': True,
                'generation_mode': 'outline_only',
                'plan_id': plan_id,
                'content_id': None,  # No content generated yet
                'agent_result': f"Course outline generated successfully with plan_id: {plan_id}",
                'agent_name': 'planning_agent',
                'sdk_handoffs': False,  # Only one agent ran
                'modules_generated': 0,  # No modules generated yet
                'is_outline_only': True
            }
            
        except Exception as e:
            logger.error(f"❌ Planning-Only Pipeline failed: {e}")
            return {
                'pipeline_success': False,
                'error': str(e),
                'content_id': None,
                'plan_id': None
            }
    
    def _extract_content_id(self, result) -> str:
        """Extract content_id from agent result."""
        try:
            output_text = ""
            
            if hasattr(result, 'final_output') and result.final_output:
                output_text = str(result.final_output)
            
            if hasattr(result, 'raw_responses'):
                for response in result.raw_responses:
                    if hasattr(response, 'content'):
                        for content_block in response.content:
                            if hasattr(content_block, 'type') and content_block.type == 'tool_result':
                                tool_result = str(content_block.content)
                                output_text += tool_result + " "
            
            if not output_text and isinstance(result, dict):
                output_text = str(result.get('content', ''))
            
            # Look for content_id pattern
            import re
            patterns = [
                r'Module content created successfully with content_id:\s*([a-f0-9\-]{36})',
                r'content[_-]id[:\s]*([a-f0-9\-]{36})',
                r'created.*content.*id[:\s]*([a-f0-9\-]{36})',
                r'Module content created:\s*([a-f0-9\-]{36})',
                r'content_id":\s*"([a-f0-9\-]{36})"',
                r'([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})'  # Generic UUID pattern
            ]
            
            for pattern in patterns:
                match = re.search(pattern, output_text, re.IGNORECASE)
                if match:
                    content_id = match.group(1)
                    logger.info(f"✅ Found content_id: {content_id}")
                    return content_id
            
            logger.warning(f"❌ No content_id found in output")
            return None
            
        except Exception as e:
            logger.error(f"Error extracting content_id: {e}")
            return None
    
    def _extract_research_id(self, result) -> str:
        """Extract research_id from agent result."""
        try:
            # Similar to plan_id extraction
            output_text = ""
            
            if hasattr(result, 'final_output') and result.final_output:
                output_text = str(result.final_output)
            
            if hasattr(result, 'raw_responses'):
                for response in result.raw_responses:
                    if hasattr(response, 'content'):
                        for content_block in response.content:
                            if hasattr(content_block, 'type') and content_block.type == 'tool_result':
                                tool_result = str(content_block.content)
                                output_text += tool_result + " "
            
            if not output_text and isinstance(result, dict):
                output_text = str(result.get('content', ''))
            
            # Look for research_id pattern
            import re
            patterns = [
                r'Research results stored successfully with ID:\s*([a-f0-9\-]{36})',
                r'research[_-]id[:\s]*([a-f0-9\-]{36})',
                r'stored.*research.*id[:\s]*([a-f0-9\-]{36})'
            ]
            
            for pattern in patterns:
                match = re.search(pattern, output_text, re.IGNORECASE)
                if match:
                    research_id = match.group(1)
                    logger.info(f"✅ Found research_id: {research_id}")
                    return research_id
            
            logger.warning(f"❌ No research_id found in output")
            return None
            
        except Exception as e:
            logger.error(f"Error extracting research_id: {e}")
            return None
    
    def _extract_plan_id(self, result) -> str:
        """Extract plan_id from agent result."""
        try:
            # Log the result type for debugging
            logger.info(f"Extracting plan_id from result type: {type(result)}")
            
            # Get the output text
            output_text = ""
            
            # First check final_output
            if hasattr(result, 'final_output') and result.final_output:
                output_text = str(result.final_output)
                logger.info(f"Using final_output: {output_text[:200]}...")
            
            # Also check raw_responses for tool results
            if hasattr(result, 'raw_responses'):
                logger.info(f"Checking {len(result.raw_responses)} raw responses")
                for response in result.raw_responses:
                    if hasattr(response, 'content'):
                        for content_block in response.content:
                            if hasattr(content_block, 'type') and content_block.type == 'tool_result':
                                tool_result = str(content_block.content)
                                output_text += tool_result + " "
                                # Log if we find a plan_id in tool results
                                if "Course plan stored successfully with ID:" in tool_result:
                                    logger.info(f"Found plan_id in tool result: {tool_result[:100]}...")
            
            # If still no output_text, try dict format
            if not output_text and isinstance(result, dict):
                output_text = str(result.get('content', ''))
            
            # Look for plan_id pattern
            import re
            # More comprehensive pattern that matches the tool output format
            patterns = [
                r'Course plan stored successfully with ID:\s*([a-f0-9\-]{36})',
                r'(?:plan[_-]id|ID)[:\s]*([a-f0-9\-]{36})',
                r'([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})'  # Match any UUID
            ]
            
            for pattern in patterns:
                plan_id_match = re.search(pattern, output_text, re.IGNORECASE)
                if plan_id_match:
                    plan_id = plan_id_match.group(1)
                    logger.info(f"✅ Found plan_id using pattern '{pattern}': {plan_id}")
                    return plan_id
            
            # Log the full output for debugging if no plan_id found
            logger.warning(f"❌ No plan_id found in output. Full text: {output_text[:500]}...")
                
            return None
            
        except Exception as e:
            logger.error(f"Error extracting plan_id: {e}")
            return None
    
    def _check_planning_completion(self, planning_result) -> bool:
        """Check if Planning Agent completed successfully by looking for completion indicators."""
        try:
            # Handle dict format from lxera_agents.Runner.run()
            if isinstance(planning_result, dict):
                # Check success flag
                if planning_result.get('success'):
                    logger.info("✅ Planning completion detected: success flag is True")
                    
                    # Check content for completion indicators
                    content = planning_result.get('content', '')
                    completion_indicators = [
                        'planning is complete',
                        'course plan has been successfully',
                        'planning complete',
                        'stored with the identifier',
                        'you can proceed with the next phase'
                    ]
                    
                    for indicator in completion_indicators:
                        if indicator in content.lower():
                            logger.info(f"✅ Planning completion confirmed: '{indicator}' found in content")
                            return True
                    
                    # Even if no specific indicators, success=True is a good sign
                    return True
                else:
                    logger.warning("⚠️ Planning result indicates failure")
                    return False
            
            # Handle RunResult object format (fallback)
            if hasattr(planning_result, 'raw_responses'):
                store_course_plan_called = False
                completion_message_found = False
                
                for response in planning_result.raw_responses:
                    # Check for store_course_plan tool call
                    if hasattr(response, 'content') and response.content:
                        for content_block in response.content:
                            if hasattr(content_block, 'type') and content_block.type == 'tool_use':
                                if hasattr(content_block, 'name') and content_block.name == 'store_course_plan':
                                    store_course_plan_called = True
                                    logger.info("✅ Planning completion detected: store_course_plan tool called")
                    
                    # Check for completion message in tool results
                    if hasattr(response, 'content') and response.content:
                        for content_block in response.content:
                            if hasattr(content_block, 'type') and content_block.type == 'tool_result':
                                if hasattr(content_block, 'content'):
                                    result_text = str(content_block.content).lower()
                                    if 'planning_complete_trigger_handoff' in result_text or 'course plan stored successfully' in result_text:
                                        completion_message_found = True
                                        logger.info("✅ Planning completion detected: completion message found in tool results")
                
                if store_course_plan_called:
                    logger.info("✅ Planning completion detected: store_course_plan tool called")
                    return True
            
            # Fallback: Check final output for completion indicators
            if hasattr(planning_result, 'final_output') and planning_result.final_output:
                output_text = str(planning_result.final_output).lower()
                
                completion_indicators = [
                    'planning_complete_trigger_handoff',
                    'course plan stored successfully',
                    'planning workflow completed',
                    'all 6 steps completed'
                ]
                
                for indicator in completion_indicators:
                    if indicator in output_text:
                        logger.info(f"✅ Planning completion detected: '{indicator}' found in final output")
                        return True
            
            logger.warning("⚠️ No clear planning completion indicators found")
            return False
            
        except Exception as e:
            logger.error(f"Error checking planning completion: {e}")
            return False
    
    async def _retrieve_employee_data(self, employee_id: str) -> Dict[str, Any]:
        """Retrieve employee data from Supabase database including CV analysis data."""
        try:
            # Get employee with user data and CV analysis data
            response = self.supabase.table('employees').select(
                """
                id,
                position,
                department,
                career_goal,
                key_tools,
                company_id,
                cv_extracted_data,
                cv_analysis_data,
                users!inner (
                    full_name,
                    email
                )
                """
            ).eq('id', employee_id).single().execute()
            
            if not response.data:
                raise Exception(f"Employee {employee_id} not found")
            
            employee = response.data
            
            # Extract CV analysis data
            cv_extracted_data = employee.get('cv_extracted_data') or {}
            cv_analysis_data = employee.get('cv_analysis_data') or {}
            
            # Get detailed skills with context from CV analysis
            detailed_skills = cv_analysis_data.get('skills', [])
            
            # Create skills context mapping for easy access
            skills_context = {}
            for skill in detailed_skills:
                skill_name = skill.get('skill_name', '')
                skills_context[skill_name] = {
                    'proficiency_level': skill.get('proficiency_level', 0),
                    'years_experience': skill.get('years_experience', 0),
                    'context': skill.get('context', ''),
                    'usage_examples': skill.get('usage_examples', [])
                }
            
            # Build enhanced tools list combining key_tools with CV-extracted tools
            cv_tools = []
            for exp in cv_extracted_data.get('work_experience', []):
                # Extract tools/technologies mentioned in job descriptions
                description = exp.get('description', '').lower()
                tools_mentioned = []
                common_tools = ['excel', 'powerpoint', 'word', 'sap', 'salesforce', 'powerbi', 'tableau', 'python', 'sql', 'r', 'java', 'javascript']
                for tool in common_tools:
                    if tool in description:
                        tools_mentioned.append(tool.title())
                cv_tools.extend(tools_mentioned)
            
            # Combine and deduplicate tools
            all_tools = list(set((employee['key_tools'] or []) + cv_tools))
            
            # Infer learning style from CV data
            learning_style = self._infer_learning_style(cv_extracted_data, detailed_skills)
            
            # Calculate experience level from work history
            experience_level = self._calculate_experience_level(cv_extracted_data.get('work_experience', []))
            
            # Transform to expected format with enhanced CV data
            return {
                'id': employee['id'],
                'full_name': employee['users']['full_name'],
                'email': employee['users']['email'],
                'job_title_current': employee['position'],
                'department': employee['department'],
                'career_aspirations_next_role': employee['career_goal'] or f"Senior {employee['position']}",
                'tools_software_used_regularly': all_tools,
                'company_id': employee['company_id'],
                'position': employee['position'],
                # Enhanced CV analysis data
                'work_experience': cv_extracted_data.get('work_experience', []),
                'education': cv_extracted_data.get('education', []),
                'professional_summary': cv_extracted_data.get('professional_summary', ''),
                'certifications': cv_extracted_data.get('certifications', []),
                'languages': cv_extracted_data.get('languages', []),
                'key_achievements': cv_extracted_data.get('key_achievements', []),
                'detailed_skills': detailed_skills,
                'skills_context': skills_context,
                'learning_style': learning_style,
                'experience_level': experience_level,
                'years_total_experience': self._calculate_total_years_experience(cv_extracted_data.get('work_experience', []))
            }
            
        except Exception as e:
            logger.error(f"Failed to retrieve employee data: {e}")
            raise
    
    def _infer_learning_style(self, cv_extracted_data: Dict, detailed_skills: List) -> str:
        """Infer learning style preferences from CV data."""
        try:
            # Analyze work experience patterns
            work_experience = cv_extracted_data.get('work_experience', [])
            
            # Look for patterns that suggest learning preferences
            practical_indicators = 0
            analytical_indicators = 0
            collaborative_indicators = 0
            
            for exp in work_experience:
                description = exp.get('description', '').lower()
                
                # Practical/hands-on indicators
                if any(term in description for term in ['hands-on', 'implementation', 'execution', 'operational', 'project management', 'troubleshooting']):
                    practical_indicators += 1
                
                # Analytical indicators
                if any(term in description for term in ['analysis', 'research', 'data', 'metrics', 'reporting', 'modeling', 'strategy']):
                    analytical_indicators += 1
                
                # Collaborative indicators
                if any(term in description for term in ['team', 'collaboration', 'leadership', 'mentoring', 'training', 'communication']):
                    collaborative_indicators += 1
            
            # Determine dominant learning style
            if practical_indicators >= max(analytical_indicators, collaborative_indicators):
                return "Prefers practical, hands-on learning with real-world applications and workplace examples"
            elif analytical_indicators >= collaborative_indicators:
                return "Prefers analytical learning with data-driven insights, case studies, and structured frameworks"
            else:
                return "Prefers collaborative learning with team-based exercises, discussions, and peer interactions"
                
        except Exception as e:
            logger.warning(f"Error inferring learning style: {e}")
            return "Prefers practical application and real-world examples"
    
    def _calculate_experience_level(self, work_experience: List) -> str:
        """Calculate experience level from work history."""
        try:
            if not work_experience:
                return "entry"
            
            # Count total positions and look for progression
            total_positions = len(work_experience)
            
            # Look for leadership/senior keywords in titles
            senior_positions = 0
            leadership_positions = 0
            
            for exp in work_experience:
                title = exp.get('title', '').lower()
                
                if any(term in title for term in ['senior', 'lead', 'principal', 'architect', 'specialist']):
                    senior_positions += 1
                
                if any(term in title for term in ['manager', 'director', 'head', 'chief', 'supervisor', 'team lead']):
                    leadership_positions += 1
            
            # Determine experience level
            if leadership_positions >= 2 or any(term in exp.get('title', '').lower() for exp in work_experience for term in ['director', 'chief', 'head']):
                return "executive"
            elif senior_positions >= 2 or leadership_positions >= 1:
                return "senior"
            elif total_positions >= 3 or senior_positions >= 1:
                return "mid-level"
            elif total_positions >= 2:
                return "junior"
            else:
                return "entry"
                
        except Exception as e:
            logger.warning(f"Error calculating experience level: {e}")
            return "mid-level"
    
    def _calculate_total_years_experience(self, work_experience: List) -> int:
        """Calculate total years of work experience."""
        try:
            total_years = 0
            
            for exp in work_experience:
                duration = exp.get('duration', '')
                
                # Parse duration strings like "2020-2023", "3-5 years", "Current"
                if '-' in duration and 'years' not in duration.lower():
                    # Format: "2020-2023" or "2020-Current"
                    parts = duration.split('-')
                    if len(parts) == 2:
                        try:
                            start_year = int(parts[0].strip())
                            end_part = parts[1].strip()
                            
                            if end_part.lower() == 'current':
                                end_year = datetime.now().year
                            else:
                                end_year = int(end_part)
                            
                            years = max(0, end_year - start_year)
                            total_years += years
                        except ValueError:
                            pass
                elif 'years' in duration.lower():
                    # Format: "3-5 years", "2 years"
                    import re
                    numbers = re.findall(r'\d+', duration)
                    if numbers:
                        # Take the first number or average if range
                        if len(numbers) == 1:
                            total_years += int(numbers[0])
                        elif len(numbers) == 2:
                            # Take average of range
                            total_years += (int(numbers[0]) + int(numbers[1])) / 2
            
            return max(0, int(total_years))
            
        except Exception as e:
            logger.warning(f"Error calculating total years experience: {e}")
            return 3  # Default fallback
    
    async def _fetch_course_plan(self, plan_id: str) -> Dict[str, Any]:
        """Fetch course plan details from database."""
        try:
            response = self.supabase.table('cm_course_plans').select('*').eq('plan_id', plan_id).single().execute()
            if response.data:
                return response.data
            return None
        except Exception as e:
            logger.error(f"Error fetching course plan: {e}")
            return None
    
    async def _generate_course_multimedia(
        self,
        content_ids: List[Dict[str, Any]],
        plan_id: str,
        employee_data: Dict[str, Any],
        job_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate multimedia content for all course modules sequentially.
        This runs AFTER content generation is complete.
        
        Args:
            content_ids: List of module content IDs
            plan_id: Course plan ID
            employee_data: Employee information
            job_id: Optional job tracking ID
            
        Returns:
            Dict with multimedia generation results
        """
        try:
            logger.info(f"🎬 Initiating multimedia generation for {len(content_ids)} modules")
            
            # Import multimedia tools
            from tools.multimedia_tools import get_multimedia_manager
            multimedia_manager = get_multimedia_manager()
            
            # Create multimedia session
            session_id = multimedia_manager.create_multimedia_session(
                execution_id=str(uuid.uuid4()),
                course_id=plan_id,  # Use plan_id as course identifier
                employee_name=employee_data.get('full_name', 'Employee'),
                employee_id=employee_data.get('id', ''),
                course_title=f"Course for {employee_data.get('full_name', 'Employee')}",
                total_modules=len(content_ids),
                company_id=employee_data.get('company_id')
            )
            
            logger.info(f"Created multimedia session: {session_id}")
            
            # Update job progress
            if job_id:
                await self._update_job_progress(job_id, {
                    'current_phase': 'Generating multimedia content',
                    'multimedia_status': 'in_progress',
                    'multimedia_session_id': session_id,
                    'progress_percentage': 91
                })
            
            generated_videos = []
            
            # Process each module sequentially
            for idx, content_info in enumerate(content_ids):
                module_number = idx + 1
                content_id = content_info['content_id']
                module_title = content_info.get('module_title', f'Module {module_number}')
                
                logger.info(f"📹 Generating video for Module {module_number}: {module_title}")
                
                try:
                    # Update progress
                    if job_id:
                        multimedia_progress = 91 + (8 * (idx / len(content_ids)))  # 91-99% range
                        await self._update_job_progress(job_id, {
                            'current_phase': f'Generating video for Module {module_number}/{len(content_ids)}',
                            'multimedia_progress': multimedia_progress
                        })
                    
                    # Import educational video service
                    from multimedia.educational_video_service import EducationalVideoService
                    video_service = EducationalVideoService()
                    
                    # Generate educational video
                    video_result = await video_service.generate_educational_video(
                        content_id=content_id,
                        employee_context={
                            'name': employee_data.get('full_name', 'Employee'),
                            'role': employee_data.get('job_title_current', 'Professional'),
                            'id': employee_data.get('id', '')
                        },
                        options={
                            'voice': 'nova',  # Professional voice
                            'speed': 1.0,
                            'design_theme': 'professional',
                            'target_duration': 10,  # 10 minutes per module
                            'include_animations': True
                        }
                    )
                    
                    # Register video asset
                    asset_id = multimedia_manager.register_multimedia_asset(
                        session_id=session_id,
                        content_id=content_id,
                        course_id=plan_id,
                        module_name=module_title,
                        asset_type='video',
                        asset_category='educational',
                        file_path=video_result.get('video_path'),
                        file_name=f"module_{module_number}_video.mp4",
                        section_name=f"module_{module_number}",
                        duration_seconds=video_result.get('duration', 0),
                        mime_type='video/mp4'
                    )
                    
                    generated_videos.append({
                        'module_number': module_number,
                        'content_id': content_id,
                        'asset_id': asset_id,
                        'video_url': video_result.get('video_url'),
                        'duration': video_result.get('duration')
                    })
                    
                    logger.info(f"✅ Video generated for Module {module_number}")
                    
                except Exception as e:
                    logger.error(f"Failed to generate video for Module {module_number}: {e}")
                    # Continue with next module even if one fails
                    continue
            
            # Finalize multimedia package
            multimedia_manager.finalize_multimedia_package(
                session_id=session_id,
                course_id=plan_id,
                employee_name=employee_data.get('full_name', 'Employee')
            )
            
            # Update course plan with multimedia info
            self.supabase.table('cm_course_plans').update({
                'multimedia_generated': True,
                'multimedia_session_id': session_id,
                'multimedia_generated_at': datetime.now().isoformat(),
                'metadata': {
                    'multimedia_videos': generated_videos
                }
            }).eq('plan_id', plan_id).execute()
            
            logger.info(f"✅ Multimedia generation completed: {len(generated_videos)}/{len(content_ids)} videos")
            
            return {
                'status': 'completed',
                'session_id': session_id,
                'videos_generated': len(generated_videos),
                'total_modules': len(content_ids),
                'generated_videos': generated_videos
            }
            
        except Exception as e:
            logger.error(f"Multimedia generation failed: {e}")
            return {
                'status': 'failed',
                'error': str(e)
            }
    
    async def _retrieve_skills_gaps(self, employee_id: str, position: str) -> List[Dict[str, Any]]:
        """Retrieve skills gap analysis from database by comparing position requirements with employee skills."""
        try:
            # Get employee data and skills from actual database structure
            employee_response = self.supabase.table('employees').select(
                'current_position_id, cv_analysis_data'
            ).eq('id', employee_id).single().execute()
            
            if not employee_response.data:
                raise Exception("Employee not found")
            
            employee_data = employee_response.data
            
            # Get employee skills from employee_skills table
            skills_response = self.supabase.table('employee_skills').select(
                'skill_name, proficiency, source'
            ).eq('employee_id', employee_id).execute()
            
            # Combine skills from both sources into the expected format
            profile = {
                'current_position_id': employee_data.get('current_position_id'),
                'extracted_skills': [],
                'technical_skills': [],
                'soft_skills': []
            }
            
            # Add skills from CV analysis if available
            if employee_data.get('cv_analysis_data') and employee_data['cv_analysis_data'].get('skills'):
                profile['extracted_skills'] = employee_data['cv_analysis_data']['skills']
            
            # Add skills from employee_skills table
            if skills_response.data:
                for skill in skills_response.data:
                    skill_data = {
                        'skill_name': skill['skill_name'],
                        'proficiency_level': skill['proficiency'],
                        'source': skill['source']
                    }
                    # Add to extracted_skills if not already there
                    existing_skill_names = [s.get('skill_name', '') for s in profile['extracted_skills']]
                    if skill['skill_name'] not in existing_skill_names:
                        profile['extracted_skills'].append(skill_data)
            
            # Get position requirements
            position_response = self.supabase.table('st_company_positions').select(
                'required_skills, nice_to_have_skills'
            ).eq('id', profile['current_position_id']).single().execute()
            
            if not position_response.data:
                raise Exception("Position requirements not found")
            
            position_data = position_response.data
            required_skills = position_data.get('required_skills', [])
            
            # Create a lookup of employee's current skills
            employee_skills = {}
            
            # Process extracted_skills (this contains all skills from CV analysis)
            if profile.get('extracted_skills') and isinstance(profile['extracted_skills'], list):
                for skill in profile['extracted_skills']:
                    skill_name = skill.get('skill_name', '').lower()
                    employee_skills[skill_name] = skill.get('proficiency_level', 3)
            
            # Process technical_skills
            if profile.get('technical_skills') and isinstance(profile['technical_skills'], list):
                for skill in profile['technical_skills']:
                    skill_name = skill.get('skill_name', '').lower()
                    employee_skills[skill_name] = skill.get('proficiency_level', 3)
            
            # Process soft_skills
            if profile.get('soft_skills') and isinstance(profile['soft_skills'], list):
                for skill in profile['soft_skills']:
                    skill_name = skill.get('skill_name', '').lower()
                    employee_skills[skill_name] = skill.get('proficiency_level', 3)
            
            skills_gaps = []
            
            # Analyze each required skill
            for required_skill in required_skills:
                skill_name = required_skill.get('skill_name', '')
                required_level = required_skill.get('proficiency_level', 3)
                is_mandatory = required_skill.get('is_mandatory', False)
                skill_type = required_skill.get('skill_type', 'technical')
                
                # Check if employee has this skill
                employee_skill_key = skill_name.lower()
                current_level = employee_skills.get(employee_skill_key, 0)  # 0 if skill not found
                
                # Calculate gap
                if current_level < required_level:
                    gap_severity = self._calculate_gap_severity(current_level, required_level, is_mandatory)
                    
                    skills_gaps.append({
                        'skill_name': skill_name,
                        'gap_severity': gap_severity,
                        'current_level': current_level,
                        'required_level': required_level,
                        'skill_type': skill_type,
                        'is_mandatory': is_mandatory,
                        'gap_points': required_level - current_level,
                        'learning_priority': 'high' if is_mandatory else 'medium'
                    })
            
            # Sort by priority: mandatory gaps first, then by gap size
            skills_gaps.sort(key=lambda x: (
                0 if x['is_mandatory'] else 1,  # Mandatory first
                -x['gap_points']  # Larger gaps first
            ))
            
            logger.info(f"📊 Found {len(skills_gaps)} skills gaps for employee")
            for gap in skills_gaps[:3]:  # Log top 3 gaps
                logger.info(f"   - {gap['skill_name']}: {gap['current_level']}/{gap['required_level']} ({gap['gap_severity']})")
            
            return skills_gaps
            
        except Exception as e:
            logger.error(f"Failed to retrieve skills gaps: {e}")
            raise
    
    def _calculate_gap_severity(self, current_level: int, required_level: int, is_mandatory: bool) -> str:
        """Calculate gap severity based on skill levels and importance."""
        gap_size = required_level - current_level
        
        if current_level == 0:  # Skill completely missing
            return 'critical' if is_mandatory else 'high'
        elif gap_size >= 3:
            return 'high'
        elif gap_size >= 2:
            return 'moderate'
        else:
            return 'minor'
    
    
    async def _create_course_assignment(
        self,
        employee_id: str,
        content_id: str,
        company_id: str,
        assigned_by_id: str,
        plan_id: Optional[str] = None,
        generation_mode: str = 'full'
    ) -> str:
        """Create course assignment in database."""
        try:
            from datetime import timedelta
            due_date = datetime.now() + timedelta(days=30)
            
            # Create assignment metadata for partial generation
            assignment_metadata = {
                'generation_mode': generation_mode,
                'can_resume': generation_mode == 'first_module',
                'partial_generation': generation_mode == 'first_module'
            }
            if plan_id:
                assignment_metadata['plan_id'] = plan_id
            
            response = self.supabase.table('course_assignments').insert({
                'employee_id': employee_id,
                'course_id': content_id,
                'company_id': company_id,
                'assigned_by': assigned_by_id,
                'assigned_at': datetime.now().isoformat(),
                'due_date': due_date.isoformat(),
                'priority': 'high',
                'status': 'assigned' if generation_mode == 'full' else 'partial',
                'progress_percentage': 0,
                'metadata': assignment_metadata,
                'plan_id': plan_id,  # Store plan_id in dedicated column
                'is_preview': generation_mode == 'first_module',  # Mark as preview if partial
                'approval_status': 'pending' if generation_mode == 'first_module' else None
            }).execute()
            
            assignment_id = response.data[0]['id'] if response.data else str(uuid.uuid4())
            logger.info(f"✅ Created course assignment: {assignment_id}")
            return assignment_id
            
        except Exception as e:
            logger.error(f"Failed to create course assignment: {e}")
            raise
    
    async def _update_course_assignment_for_regeneration(
        self,
        employee_id: str,
        new_content_id: str,
        company_id: str,
        assigned_by_id: str,
        plan_id: Optional[str] = None
    ) -> str:
        """Update existing course assignment for regeneration."""
        try:
            # Find the existing assignment that was in revision_requested state
            existing_assignment = self.supabase.table('course_assignments').select('id').eq(
                'employee_id', employee_id
            ).eq('company_id', company_id).eq(
                'approval_status', 'revision_requested'
            ).order('assigned_at', {'ascending': False}).limit(1).execute()
            
            if existing_assignment.data and len(existing_assignment.data) > 0:
                assignment_id = existing_assignment.data[0]['id']
                
                # Update the assignment with new content and reset approval status
                self.supabase.table('course_assignments').update({
                    'course_id': new_content_id,  # Update to new regenerated content
                    'approval_status': 'pending',  # Reset to pending for new review
                    'approval_feedback': None,  # Clear previous feedback
                    'updated_at': datetime.now().isoformat(),
                    'metadata': {
                        'generation_mode': 'regenerate_with_feedback',
                        'regenerated': True,
                        'regenerated_at': datetime.now().isoformat(),
                        'regenerated_by': assigned_by_id
                    }
                }).eq('id', assignment_id).execute()
                
                logger.info(f"✅ Updated course assignment for regeneration: {assignment_id}")
                return assignment_id
            else:
                # No existing assignment found, create new one
                logger.warning("No existing assignment found for regeneration, creating new one")
                return await self._create_course_assignment(
                    employee_id,
                    new_content_id,
                    company_id,
                    assigned_by_id,
                    plan_id,
                    'regenerate_with_feedback'
                )
                
        except Exception as e:
            logger.error(f"Failed to update course assignment for regeneration: {e}")
            raise
    
    async def _update_job_progress(self, job_id: str, updates: Dict[str, Any]):
        """Update course generation job progress."""
        try:
            self.supabase.table('course_generation_jobs').update({
                **updates,
                'updated_at': datetime.now().isoformat()
            }).eq('id', job_id).execute()
        except Exception as e:
            logger.error(f"Failed to update job progress: {e}")
    
    async def _log_enhanced_research_metrics(self, research_id: str, plan_id: str):
        """Log enhanced research metrics for performance tracking."""
        try:
            # Query enhanced research results
            research_result = self.supabase.table('cm_research_results')\
                .select('research_findings, execution_metrics, total_sources')\
                .eq('research_id', research_id)\
                .single().execute()
            
            if research_result.data:
                metrics = research_result.data.get('execution_metrics', {})
                quality_assessment = metrics.get('quality_assessment', {})
                
                # Log key metrics
                logger.info(f"📊 Enhanced Research Metrics for {research_id}:")
                logger.info(f"   - Sources: {research_result.data.get('total_sources', 0)}")
                logger.info(f"   - Quality Score: {quality_assessment.get('overall_score', 0):.2f}")
                logger.info(f"   - Multi-Agent: {metrics.get('multi_agent_coordination', False)}")
                logger.info(f"   - Enhanced Features: {metrics.get('enhanced_features', False)}")
                
                # Update research session with enhanced flag
                self.supabase.table('cm_research_sessions').update({
                    'enhanced_research_enabled': True,
                    'multi_agent_coordination': metrics.get('multi_agent_coordination', False),
                    'research_methodology': 'enhanced_multi_agent'
                }).eq('research_id', research_id).execute()
                
        except Exception as e:
            logger.error(f"Failed to log enhanced research metrics: {e}")
    
    async def resume_course_generation(
        self,
        plan_id: str,
        employee_id: str,
        company_id: str,
        assigned_by_id: str,
        job_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Resume course generation from partial to full by generating remaining modules.
        
        Args:
            plan_id: Existing course plan ID
            employee_id: Employee ID
            company_id: Company ID
            assigned_by_id: User ID who initiated the resume
            job_id: Optional job tracking ID
        
        Returns:
            Dict containing updated content_ids and pipeline results
        """
        try:
            logger.info(f"🔄 Resuming course generation for plan_id: {plan_id}")
            
            # Fetch the existing course plan
            course_plan = await self._fetch_course_plan(plan_id)
            if not course_plan:
                raise Exception(f"Course plan {plan_id} not found")
            
            modules = course_plan.get('course_structure', {}).get('modules', [])
            total_modules = len(modules)
            
            # Skip the first module (already generated) and generate the rest
            remaining_modules = modules[1:]  # Skip module 0
            logger.info(f"📚 Resuming generation: {len(remaining_modules)} remaining modules (skipping first module)")
            
            if not remaining_modules:
                logger.info("✅ No remaining modules to generate - course already complete")
                return {
                    'pipeline_success': True,
                    'generation_mode': 'resume_complete',
                    'message': 'Course was already complete',
                    'modules_generated': 0,
                    'total_modules_planned': total_modules
                }
            
            # Get employee data for context
            employee_data = await self._retrieve_employee_data(employee_id)
            
            from course_agents.content_agent import create_content_agent
            from lxera_agents import Runner, trace
            content_agent = create_content_agent()
            
            # Generate remaining modules
            new_content_ids = []
            for idx, module in enumerate(remaining_modules):
                module_number = idx + 2  # Start from module 2 (since module 1 is already done)
                module_title = module.get('title', f'Module {module_number}')
                logger.info(f"📖 Generating remaining Module {module_number}/{total_modules}: {module_title}")
                
                if job_id:
                    # Update progress for remaining modules
                    module_progress = 20 + (70 * (idx / len(remaining_modules)))
                    await self._update_job_progress(job_id, {
                        'current_phase': f'Resuming - Module {module_number}/{total_modules}: {module_title}',
                        'progress_percentage': int(module_progress)
                    })
                
                content_message = f"""
                Generate comprehensive course content for Module {module_number}: {module_title}
                
                DATABASE CONTEXT:
                - plan_id: {plan_id}
                
                MODULE DETAILS:
                - Module Number: {module_number}
                - Module Title: {module_title}
                - Topics: {', '.join(module.get('topics', []))}
                - Duration: {module.get('duration', '1 week')}
                - Priority: {module.get('priority', 'high')}
                
                [Same content generation workflow as in full generation...]
                """
                
                with trace(f"resume_content_generation_module_{module_number}"):
                    content_result = await Runner.run(
                        content_agent,
                        content_message,
                        max_turns=25
                    )
                
                # Extract content_id from content result
                content_id = self._extract_content_id(content_result)
                
                if content_id:
                    logger.info(f"✅ Module {module_number} completed with content_id: {content_id}")
                    new_content_ids.append({
                        'module_number': module_number,
                        'module_title': module_title,
                        'content_id': content_id
                    })
                else:
                    logger.error(f"❌ Module {module_number} generation failed")
            
            if job_id:
                await self._update_job_progress(job_id, {
                    'current_phase': 'Resume complete - full course now available',
                    'progress_percentage': 100,
                    'generation_mode': 'resume_complete'
                })
            
            logger.info(f"✅ Course resume completed: {len(new_content_ids)} additional modules generated")
            
            return {
                'pipeline_success': True,
                'generation_mode': 'resume_complete',
                'new_content_ids': new_content_ids,
                'plan_id': plan_id,
                'modules_generated': len(new_content_ids),
                'total_modules_planned': total_modules,
                'agent_result': f"Course resume completed: {len(new_content_ids)} additional modules generated",
                'partial_generation': False  # Now complete
            }
            
        except Exception as e:
            logger.error(f"❌ Course resume failed: {e}")
            if job_id:
                await self._update_job_progress(job_id, {
                    'status': 'failed',
                    'error_message': str(e)
                })
            raise


# Convenience functions for edge function integration
async def generate_course_with_agents(
    employee_id: str,
    company_id: str,
    assigned_by_id: str,
    job_id: Optional[str] = None,
    generation_mode: str = 'full',
    plan_id: Optional[str] = None,
    enable_multimedia: bool = False,
    feedback_context: Optional[str] = None,
    previous_course_content: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Generate a course using the full agent pipeline with database integration.
    
    Args:
        employee_id: Employee ID from database
        company_id: Company ID
        assigned_by_id: User ID who initiated the generation
        job_id: Optional job tracking ID
        generation_mode: 'full' for complete course, 'first_module' for partial, 'remaining_modules' for completion
        plan_id: Required for 'remaining_modules' mode to identify which course to complete
    
    This is the main entry point for the edge function to call.
    """
    pipeline = LXERADatabasePipeline()
    
    # Handle remaining_modules mode by calling resume function
    if generation_mode == 'remaining_modules':
        if not plan_id:
            # Try to find the most recent plan for this employee
            from supabase import create_client
            import os
            
            supabase = create_client(
                os.getenv('SUPABASE_URL'),
                os.getenv('SUPABASE_SERVICE_ROLE_KEY')
            )
            result = supabase.table('cm_course_plans').select('plan_id').eq(
                'employee_id', employee_id
            ).eq('status', 'completed').is_(
                'full_course_generated_at', 'null'
            ).order('created_at', {'ascending': False}).limit(1).execute()
            
            if result.data and len(result.data) > 0:
                plan_id = result.data[0]['plan_id']
                logger.info(f"Found plan_id {plan_id} for employee {employee_id}")
            else:
                raise Exception(f"No partial course plan found for employee {employee_id}")
        
        logger.info(f"Resuming course generation for plan {plan_id} with remaining modules")
        return await pipeline.resume_course_generation(
            plan_id,
            employee_id,
            company_id,
            assigned_by_id,
            job_id
        )
    
    # For first_module mode with existing plan_id, or any mode that passes plan_id
    if plan_id:
        logger.info(f"Generation with existing plan_id: {plan_id} (mode: {generation_mode})")
    
    # Call the main pipeline with plan_id (if available)
    return await pipeline.generate_course_for_employee(
        employee_id,
        company_id,
        assigned_by_id,
        job_id,
        generation_mode,
        plan_id,  # Pass the plan_id if available
        enable_multimedia,  # Pass the multimedia flag
        feedback_context,  # Pass feedback context for regeneration
        previous_course_content  # Pass previous content for reference
    )

async def resume_course_generation(
    plan_id: str,
    employee_id: str,
    company_id: str,
    assigned_by_id: str,
    job_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Resume course generation from partial to full.
    
    Args:
        plan_id: Existing course plan ID from partial generation
        employee_id: Employee ID from database
        company_id: Company ID
        assigned_by_id: User ID who initiated the resume
        job_id: Optional job tracking ID
    
    Returns:
        Dict containing results of remaining module generation
    """
    pipeline = LXERADatabasePipeline()
    return await pipeline.resume_course_generation(
        plan_id,
        employee_id,
        company_id,
        assigned_by_id,
        job_id
    )


if __name__ == "__main__":
    """Test the LXERA database pipeline."""
    
    async def test_pipeline():
        # Test with sample employee ID
        result = await generate_course_with_agents(
            employee_id="test-employee-id",
            company_id="test-company-id",
            assigned_by_id="test-user-id"
        )
        print(json.dumps(result, indent=2))
    
    asyncio.run(test_pipeline())