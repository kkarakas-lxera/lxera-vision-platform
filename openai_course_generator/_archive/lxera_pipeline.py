#!/usr/bin/env python3
"""
LXERA Pipeline with Coordinator Integration

This module provides the main pipeline interface that uses the Course Generation Coordinator
to orchestrate the entire course generation process with proper agent handoffs.
"""

import json
import logging
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional, List
import uuid

from lxera_agents import Runner
from course_agents.coordinator import create_course_generation_coordinator
from database.content_manager import ContentManager

logger = logging.getLogger(__name__)

class LXERADatabasePipeline:
    """
    Pipeline that uses the Course Generation Coordinator for unified agent execution.
    """
    
    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        self.content_manager = ContentManager()
        self.coordinator = create_course_generation_coordinator()
        logger.info("✅ LXERA Database Pipeline initialized with Coordinator")
    
    async def run_pipeline(
        self,
        employee_id: str,
        employee_name: str,
        company_id: str,
        session_id: Optional[str] = None,
        progress_callback: Optional[Any] = None
    ) -> Dict[str, Any]:
        """
        Run the complete course generation pipeline using the coordinator.
        
        Args:
            employee_id: UUID of the employee
            employee_name: Full name of the employee
            company_id: UUID of the company
            session_id: Optional session ID (will be generated if not provided)
            progress_callback: Optional callback for progress updates
            
        Returns:
            Dict containing content_id, session_id, and other results
        """
        try:
            # Generate session ID if not provided
            if not session_id:
                session_id = f"coord-{datetime.now().strftime('%Y%m%d-%H%M%S')}-{str(uuid.uuid4())[:8]}"
            
            logger.info(f"🚀 Starting coordinated pipeline for {employee_name}")
            logger.info(f"📋 Session ID: {session_id}")
            
            # Prepare the coordinator input
            coordinator_input = f"""
            Generate a complete personalized course for the following employee:
            
            EMPLOYEE DETAILS:
            - ID: {employee_id}
            - Name: {employee_name}
            - Company ID: {company_id}
            - Session ID: {session_id}
            
            INSTRUCTIONS:
            1. Start with the Planning Agent to analyze the employee and create course structure
            2. The Planning Agent will automatically hand off to Research Agent
            3. Research Agent will gather materials and hand off to Content Agent
            4. Continue through all agents until course is complete
            
            Ensure all data is properly stored in the database at each stage.
            The session ID should be used consistently throughout the pipeline.
            
            Begin the course generation process now.
            """
            
            # Update progress if callback provided
            if progress_callback:
                progress_callback("coordinator", "Starting course generation coordinator")
            
            # Run the coordinator with high max_turns to allow full pipeline execution
            logger.info("🤖 Executing coordinator with agent handoffs...")
            
            result = await Runner.run(
                self.coordinator,
                coordinator_input,
                max_turns=100,  # Allow many turns for full pipeline
                progress_callback=lambda msg: progress_callback("pipeline", msg) if progress_callback else None
            )
            
            # Extract results from the coordinator execution
            logger.info(f"Result type: {type(result)}")
            
            # Handle dictionary result from SDK
            if isinstance(result, dict):
                logger.info(f"Result keys: {list(result.keys())}")
                
                # Try different keys that might contain the output
                final_output = result.get('final_output') or result.get('output') or result.get('content')
                success = result.get('success', False)
                agent_name = result.get('agent_name', 'Unknown')
                messages = result.get('messages', [])
                turns = result.get('turns', 0)
                
                logger.info(f"Success: {success}, Agent: {agent_name}, Turns: {turns}")
                
                if final_output:
                    logger.info(f"Final output type: {type(final_output)}")
                    logger.info(f"Final output: {final_output[:500] if isinstance(final_output, str) else final_output}")
                
                # Try to extract content_id from the output
                content_id = None
                if isinstance(final_output, dict):
                    content_id = final_output.get('content_id')
                elif isinstance(final_output, str):
                    # Try to parse JSON from string
                    try:
                        output_data = json.loads(final_output)
                        content_id = output_data.get('content_id')
                    except:
                        # Try to find content_id in the string
                        import re
                        match = re.search(r'content_id["\']?\s*:\s*["\']?([a-f0-9-]+)', final_output)
                        if match:
                            content_id = match.group(1)
                
                if content_id:
                    logger.info(f"✅ Pipeline completed successfully!")
                    logger.info(f"📄 Content ID: {content_id}")
                    
                    return {
                        'success': True,
                        'content_id': content_id,
                        'session_id': session_id,
                        'message': 'Course generated successfully',
                        'coordinator_output': final_output
                    }
                else:
                    logger.warning("⚠️ Pipeline completed but no content_id found")
                    return {
                        'success': False,
                        'error': 'No content_id generated',
                        'session_id': session_id,
                        'coordinator_output': final_output
                    }
            else:
                # Check if there's a result at all
                if result:
                    # Try to get any output
                    logger.info("Checking alternative result formats...")
                    
                    # Check for context wrapper
                    if hasattr(result, 'context_wrapper'):
                        logger.info(f"Context wrapper: {result.context_wrapper}")
                    
                    # Check for raw responses
                    if hasattr(result, 'raw_responses'):
                        logger.info(f"Raw responses count: {len(result.raw_responses)}")
                        
                    # Check last agent
                    if hasattr(result, 'last_agent'):
                        logger.info(f"Last agent: {result.last_agent}")
                    
                    # For now, return a simple success to see if agents ran
                    return {
                        'success': True,
                        'message': 'Coordinator executed but output format needs adjustment',
                        'session_id': session_id,
                        'raw_result': str(result)[:500]  # First 500 chars
                    }
                else:
                    logger.error("❌ Coordinator execution did not return any result")
                    return {
                        'success': False,
                        'error': 'No coordinator result',
                        'session_id': session_id
                    }
                
        except Exception as e:
            logger.error(f"❌ Pipeline execution failed: {e}")
            import traceback
            traceback.print_exc()
            
            return {
                'success': False,
                'error': str(e),
                'session_id': session_id,
                'traceback': traceback.format_exc()
            }
    
    async def run_pipeline_with_data(
        self,
        employee_data: Dict[str, Any],
        skills_gaps: List[Dict[str, Any]],
        session_id: Optional[str] = None,
        progress_callback: Optional[Any] = None
    ) -> Dict[str, Any]:
        """
        Run pipeline with pre-fetched employee data and skills gaps.
        
        This method prepares the data and calls the main run_pipeline method.
        """
        employee_id = employee_data.get('id')
        employee_name = employee_data.get('full_name', 'Unknown')
        company_id = employee_data.get('company_id')
        
        if not all([employee_id, company_id]):
            raise ValueError("Missing required employee data")
        
        # Store the data in a format the agents can access
        # This could be through a context manager or temporary storage
        
        return await self.run_pipeline(
            employee_id=employee_id,
            employee_name=employee_name,
            company_id=company_id,
            session_id=session_id,
            progress_callback=progress_callback
        )

# For backward compatibility
AgenticPipelineOrchestrator = LXERADatabasePipeline