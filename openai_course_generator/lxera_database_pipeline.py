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
        job_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate a personalized course for an employee using their existing skills gap analysis.
        
        Args:
            employee_id: Employee ID from database
            company_id: Company ID
            assigned_by_id: User ID who initiated the generation
            job_id: Optional job tracking ID
            
        Returns:
            Dict containing content_id and pipeline results
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
            
            # Run the complete agentic pipeline with skills gaps using new SDK
            pipeline_result = await self._run_sdk_pipeline(
                employee_data,
                skills_gaps,
                job_id
            )
            
            # If successful, create course assignment
            if pipeline_result.get('pipeline_success') and pipeline_result.get('content_id'):
                assignment_id = await self._create_course_assignment(
                    employee_id,
                    pipeline_result['content_id'],
                    company_id,
                    assigned_by_id
                )
                pipeline_result['assignment_id'] = assignment_id
            
            # Final job update
            if job_id:
                await self._update_job_progress(job_id, {
                    'current_phase': 'Course generation complete',
                    'progress_percentage': 100,
                    'successful_courses': 1
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
        job_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Run the course generation pipeline using OpenAI SDK with automated agent handoffs.
        """
        try:
            logger.info("🚀 Starting SDK-based course generation pipeline")
            
            # Update job progress
            if job_id:
                await self._update_job_progress(job_id, {
                    'current_phase': 'Running Planning Agent',
                    'progress_percentage': 40
                })
            
            # Phase 1: Planning Agent
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
            
            # Update job progress for planning phase
            if job_id:
                await self._update_job_progress(job_id, {
                    'current_phase': 'Planning Phase: Creating personalized course structure',
                    'progress_percentage': 30
                })
            
            plan_id = None
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
            
            # Phase 2: Research Agent
            if job_id:
                await self._update_job_progress(job_id, {
                    'current_phase': 'Research Phase: Gathering course content',
                    'progress_percentage': 60
                })
            
            from course_agents.research_agent import create_research_agent
            research_agent = create_research_agent()
            
            research_message = f"""
            Execute comprehensive research for course plan_id: {plan_id}
            
            Follow this exact workflow:
            1. fetch_course_plan - Load the course plan details using plan_id: {plan_id}
            2. tavily_search - Search for relevant content for each module topic
            3. firecrawl_extract - Extract detailed content from authoritative sources
            4. research_synthesizer - Synthesize findings into structured insights
            5. store_research_results - Save your research findings
            
            Focus on finding practical, industry-relevant content for the learner.
            """
            
            with trace("research_phase"):
                research_result = await Runner.run(
                    research_agent,
                    research_message,
                    max_turns=15  # Research doesn't need as many turns
                )
            
            # Extract research_id from research result
            research_id = self._extract_research_id(research_result)
            
            if not research_id:
                logger.warning("⚠️ Research phase completed but no research_id found")
                # Continue anyway as research might have been stored
            else:
                logger.info(f"✅ Research phase completed with research_id: {research_id}")
            
            # Phase 3: Content Generation Agent - Generate ALL modules
            if job_id:
                await self._update_job_progress(job_id, {
                    'current_phase': 'Content Generation Phase: Creating course materials',
                    'progress_percentage': 70
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
            logger.info(f"📚 Found {len(modules)} modules to generate")
            
            from course_agents.content_agent import create_content_agent
            content_agent = create_content_agent()
            
            # Generate content for each module
            content_ids = []
            for idx, module in enumerate(modules):
                module_number = idx + 1
                module_title = module.get('title', f'Module {module_number}')
                logger.info(f"📖 Generating content for Module {module_number}/{len(modules)}: {module_title}")
                
                if job_id:
                    # Update progress for each module
                    module_progress = 70 + (20 * (idx / len(modules)))
                    await self._update_job_progress(job_id, {
                        'current_phase': f'Generating Module {module_number}/{len(modules)}: {module_title}',
                        'progress_percentage': int(module_progress)
                    })
                
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
            
            logger.info(f"✅ Content generation completed: {len(content_ids)}/{len(modules)} modules")
            
            # Phase 4: Quality Assessment (simplified for now)
            if job_id:
                await self._update_job_progress(job_id, {
                    'current_phase': 'Finalizing course content',
                    'progress_percentage': 90
                })
            
            logger.info(f"✅ SDK Pipeline completed with {len(content_ids)} modules")
            
            return {
                'pipeline_success': True,
                'content_ids': content_ids,  # List of all module content IDs
                'content_id': content_ids[0]['content_id'] if content_ids else None,  # First module for compatibility
                'plan_id': plan_id,
                'research_id': research_id,
                'agent_result': f"Course generated successfully: {len(content_ids)} modules created",
                'agent_name': 'full_pipeline',
                'sdk_handoffs': True,
                'modules_generated': len(content_ids),
                'total_modules': len(modules)
            }
            
        except Exception as e:
            logger.error(f"❌ SDK Pipeline failed: {e}")
            return {
                'pipeline_success': False,
                'error': str(e),
                'content_id': None
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
        """Retrieve employee data from Supabase database."""
        try:
            # Get employee with user data
            response = self.supabase.table('employees').select(
                """
                id,
                position,
                department,
                career_goal,
                key_tools,
                company_id,
                users!inner (
                    full_name,
                    email
                )
                """
            ).eq('id', employee_id).single().execute()
            
            if not response.data:
                raise Exception(f"Employee {employee_id} not found")
            
            employee = response.data
            
            # Transform to expected format
            return {
                'id': employee['id'],
                'full_name': employee['users']['full_name'],
                'email': employee['users']['email'],
                'job_title_current': employee['position'],
                'department': employee['department'],
                'career_aspirations_next_role': employee['career_goal'] or f"Senior {employee['position']}",
                'tools_software_used_regularly': employee['key_tools'] or [],
                'company_id': employee['company_id'],
                'position': employee['position']
            }
            
        except Exception as e:
            logger.error(f"Failed to retrieve employee data: {e}")
            raise
    
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
    
    async def _retrieve_skills_gaps(self, employee_id: str, position: str) -> List[Dict[str, Any]]:
        """Retrieve skills gap analysis from database by comparing position requirements with employee skills."""
        try:
            # Get employee skills profile
            profile_response = self.supabase.table('st_employee_skills_profile').select(
                'extracted_skills, technical_skills, soft_skills, current_position_id'
            ).eq('employee_id', employee_id).single().execute()
            
            if not profile_response.data:
                raise Exception("Employee skills profile not found")
            
            profile = profile_response.data
            
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
        assigned_by_id: str
    ) -> str:
        """Create course assignment in database."""
        try:
            from datetime import timedelta
            due_date = datetime.now() + timedelta(days=30)
            
            response = self.supabase.table('course_assignments').insert({
                'employee_id': employee_id,
                'course_id': content_id,
                'company_id': company_id,
                'assigned_by': assigned_by_id,
                'assigned_at': datetime.now().isoformat(),
                'due_date': due_date.isoformat(),
                'priority': 'high',
                'status': 'assigned',
                'progress_percentage': 0
            }).execute()
            
            assignment_id = response.data[0]['id'] if response.data else str(uuid.uuid4())
            logger.info(f"✅ Created course assignment: {assignment_id}")
            return assignment_id
            
        except Exception as e:
            logger.error(f"Failed to create course assignment: {e}")
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


# Convenience function for edge function integration
async def generate_course_with_agents(
    employee_id: str,
    company_id: str,
    assigned_by_id: str,
    job_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generate a course using the full agent pipeline with database integration.
    
    This is the main entry point for the edge function to call.
    """
    pipeline = LXERADatabasePipeline()
    return await pipeline.generate_course_for_employee(
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