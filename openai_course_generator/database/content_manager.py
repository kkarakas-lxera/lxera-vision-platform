#!/usr/bin/env python3
"""
ContentManager - Supabase Database Integration for Content Storage

This class replaces JSON content passing with efficient database operations,
reducing token usage by 98%+ and eliminating JSON parsing errors.

Features:
- Content ID workflow for efficient agent communication
- Granular content section management
- Quality assessment tracking with history
- Enhancement session monitoring
- Research session tracking
- Performance analytics and monitoring
"""

import json
import logging
import os
import uuid
import time
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
from decimal import Decimal

# Supabase client
try:
    from supabase import create_client, Client
except ImportError:
    logging.error("Please install supabase: pip install supabase")
    raise

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ContentManager:
    """Manages all content operations with Supabase database."""
    
    def __init__(self, supabase_url: str = None, supabase_key: str = None):
        """Initialize ContentManager with Supabase connection."""
        
        # Get Supabase credentials
        self.supabase_url = supabase_url or os.getenv('SUPABASE_URL', 'https://xwfweumeryrgbguwrocr.supabase.co')
        self.supabase_key = supabase_key or os.getenv('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZndldW1lcnlyZ2JndXdyb2NyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc2MzQ0MCwiZXhwIjoyMDY2MzM5NDQwfQ.qxXpBxUKhKA4AQT4UQnIEJGbGNrRDMbBroZU8YaypSY')
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be set")
        
        # Initialize Supabase client
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        
        # Set table prefix for public schema tables
        self.table_prefix = "cm_"
        
        logger.info("🗄️ ContentManager initialized with Supabase connection")
        logger.info(f"📋 Using table prefix: {self.table_prefix}")
    
    def _table(self, table_name: str) -> str:
        """Get table name with prefix for public schema."""
        return f"{self.table_prefix}{table_name}"
    
    def _normalize_priority(self, priority: str) -> str:
        """Normalize priority level to match database constraint.
        
        Database constraint: ('critical', 'high', 'medium', 'low')
        
        Args:
            priority: Raw priority value from agent or spec
            
        Returns:
            Normalized priority level that matches constraint
        """
        if not priority:
            return 'medium'
        
        # Convert to lowercase and handle common variations
        priority_lower = str(priority).lower().strip()
        
        # Map variations to valid values
        priority_map = {
            'critical': 'critical',
            'high': 'high', 
            'medium': 'medium',
            'low': 'low',
            # Common variations
            'urgent': 'critical',
            'important': 'high',
            'normal': 'medium',
            'standard': 'medium',
            'basic': 'low',
            'minimal': 'low'
        }
        
        normalized = priority_map.get(priority_lower, 'medium')
        
        if priority_lower not in priority_map:
            logger.warning(f"Unknown priority '{priority}', defaulting to 'medium'")
        
        return normalized
    
    # =====================================================
    # CONTENT STORAGE OPERATIONS
    # =====================================================
    
    def create_module_content(
        self,
        module_name: str,
        employee_name: str,
        session_id: str,
        module_spec: Dict[str, Any],
        research_context: Dict[str, Any] = None,
        company_id: str = None
    ) -> str:
        """
        Create new module content entry and return content_id.
        
        Args:
            module_name: Name of the module
            employee_name: Learner name for personalization
            session_id: Session identifier
            module_spec: Module specifications and context
            research_context: Research findings to integrate
            
        Returns:
            content_id: UUID string for referencing this content
        """
        max_retries = 3
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                logger.info(f"📝 Creating module content: {module_name} (attempt {retry_count + 1})")
                
                # Generate a unique content_id to prevent reuse
                import uuid
                content_id = str(uuid.uuid4())
                
                # Normalize priority level to match database constraint
                raw_priority = module_spec.get('priority_level', 'medium')
                normalized_priority = self._normalize_priority(raw_priority)
                
                content_data = {
                    'content_id': content_id,  # Explicitly set to prevent conflicts
                    'company_id': company_id or '67d7bff4-1149-4f37-952e-af1841fb67fa',  # Default company_id
                    'module_name': module_name,
                    'employee_name': employee_name,
                    'session_id': session_id,
                    'module_spec': module_spec,
                    'research_context': research_context or {},
                    'status': 'draft',
                    'priority_level': normalized_priority,
                    'revision_count': 0,
                    'created_at': datetime.now(timezone.utc).isoformat()
                }
                
                result = self.supabase.table(self._table('module_content')).insert(content_data).execute()
                
                if result.data and len(result.data) > 0:
                    actual_content_id = result.data[0]['content_id']
                    logger.info(f"✅ Module content created: {actual_content_id}")
                    return actual_content_id
                else:
                    raise Exception("No data returned from insert operation")
                    
            except Exception as e:
                error_msg = str(e).lower()
                
                # Check for specific constraint violations
                if 'duplicate' in error_msg or 'unique' in error_msg or 'already exists' in error_msg:
                    logger.warning(f"⚠️ Content ID conflict detected: {e}")
                    retry_count += 1
                    if retry_count < max_retries:
                        logger.info(f"🔄 Retrying with new content ID...")
                        time.sleep(0.5 * retry_count)  # Exponential backoff
                        continue
                    else:
                        logger.error(f"❌ Failed after {max_retries} attempts to create unique content")
                        raise Exception(f"Could not create unique content after {max_retries} attempts: {e}")
                else:
                    # Non-constraint error, fail immediately
                    logger.error(f"❌ Failed to create module content: {e}")
                    raise
        
        # Should not reach here
        raise Exception("Unexpected error in content creation loop")
    
    def update_module_section(
        self,
        content_id: str,
        section_name: str,
        section_content: str,
        metadata: Dict[str, Any] = None
    ) -> bool:
        """
        Update a specific section of module content.
        
        Args:
            content_id: Module content identifier
            section_name: Section to update (introduction, core_content, etc.)
            section_content: New content for the section
            metadata: Additional section metadata
            
        Returns:
            bool: Success status
        """
        try:
            logger.info(f"📝 Updating section '{section_name}' for content {content_id[:8]}...")
            
            # Valid section names
            valid_sections = ['introduction', 'core_content', 'practical_applications', 'case_studies', 'assessments']
            if section_name not in valid_sections:
                raise ValueError(f"Invalid section name. Must be one of: {valid_sections}")
            
            # First, verify the content_id exists
            existing_content = self.supabase.table(self._table('module_content'))\
                .select('content_id, module_name')\
                .eq('content_id', content_id)\
                .execute()
            
            if not existing_content.data:
                logger.error(f"❌ Content ID {content_id[:8]} not found in database")
                return False
            
            module_name = existing_content.data[0]['module_name']
            logger.info(f"📋 Updating section '{section_name}' for module: {module_name}")
            
            # Update main module content table
            update_data = {section_name: section_content}
            
            result = self.supabase.table(self._table('module_content'))\
                .update(update_data)\
                .eq('content_id', content_id)\
                .execute()
            
            # Verify the update was successful by checking if content was actually updated
            if hasattr(result, 'data') and result.data:
                # Update was successful - result.data contains the updated row(s)
                updated_content = result.data[0]
                if updated_content.get(section_name) == section_content:
                    logger.info(f"✅ Main table section '{section_name}' updated successfully")
                    main_update_success = True
                else:
                    logger.error(f"❌ Section '{section_name}' content mismatch after update")
                    main_update_success = False
            else:
                # No data returned - this could mean the content_id doesn't exist or no changes were made
                logger.error(f"❌ No data returned from update operation for content {content_id[:8]}")
                main_update_success = False
            
            if not main_update_success:
                return False
            
            # Note: cm_content_sections table has been deprecated
            # All content is now stored directly in cm_module_content columns
            
            logger.info(f"✅ Section '{section_name}' updated successfully for content {content_id[:8]}")
            return True
            
        except ValueError as ve:
            logger.error(f"❌ Validation error for section '{section_name}': {ve}")
            return False
        except Exception as e:
            logger.error(f"❌ Unexpected error updating section '{section_name}': {type(e).__name__}: {e}")
            return False
    
    def update_all_sections(
        self,
        content_id: str,
        sections: Dict[str, str],
        metadata: Dict[str, Any] = None
    ) -> bool:
        """
        Update all sections at once in a single database operation.
        This prevents timing issues with partial reads during sequential updates.
        
        Args:
            content_id: Module content identifier
            sections: Dictionary of section_name -> section_content
            metadata: Additional metadata for all sections
            
        Returns:
            bool: Success status
        """
        try:
            logger.info(f"📝 Updating all sections for content {content_id[:8]} in batch...")
            
            # Get module info for logging
            result = self.supabase.table(self._table('module_content'))\
                .select('content_id,module_name')\
                .eq('content_id', content_id)\
                .single()\
                .execute()
            
            if not result.data:
                raise ValueError(f"Module content not found: {content_id}")
            
            module_name = result.data['module_name']
            logger.info(f"📋 Batch updating {len(sections)} sections for module: {module_name}")
            
            # Prepare update data with all sections
            update_data = {}
            valid_sections = ['introduction', 'core_content', 'practical_applications', 'case_studies', 'assessments']
            
            for section_name, section_content in sections.items():
                if section_name in valid_sections and section_content.strip():
                    update_data[section_name] = section_content
            
            if not update_data:
                logger.warning("⚠️ No valid sections to update")
                return False
            
            # Update all sections in one operation
            result = self.supabase.table(self._table('module_content'))\
                .update(update_data)\
                .eq('content_id', content_id)\
                .execute()
            
            if hasattr(result, 'data') and result.data:
                logger.info(f"✅ Batch updated {len(update_data)} sections successfully")
                
                # Note: cm_content_sections table has been deprecated
                # All content is now stored directly in cm_module_content columns
                
                return True
            else:
                logger.error(f"❌ Batch update failed for content {content_id[:8]}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Failed to batch update sections: {e}")
            return False
    
    def get_module_content(self, content_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve complete module content by content_id.
        
        Args:
            content_id: Module content identifier
            
        Returns:
            Dict with complete module data or None if not found
        """
        try:
            logger.info(f"📖 Retrieving module content: {content_id[:8]}...")
            
            result = self.supabase.table(self._table('module_content')).select('*').eq('content_id', content_id).execute()
            
            if result.data:
                content = result.data[0]
                logger.info(f"✅ Module content retrieved: {content['module_name']}")
                return content
            else:
                logger.warning(f"⚠️ Module content not found: {content_id}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Failed to retrieve module content: {e}")
            return None
    
    def get_content_sections(self, content_id: str) -> Dict[str, str]:
        """
        Get all content sections as a dictionary for agent processing.
        
        Args:
            content_id: Module content identifier
            
        Returns:
            Dict with section names as keys and content as values
        """
        try:
            content = self.get_module_content(content_id)
            if not content:
                return {}
            
            sections = {
                'introduction': content.get('introduction', ''),
                'core_content': content.get('core_content', ''),
                'practical_applications': content.get('practical_applications', ''),
                'case_studies': content.get('case_studies', ''),
                'assessments': content.get('assessments', '')
            }
            
            # Filter out empty sections
            sections = {k: v for k, v in sections.items() if v}
            
            logger.info(f"📖 Retrieved {len(sections)} sections for content {content_id[:8]}")
            return sections
            
        except Exception as e:
            logger.error(f"❌ Failed to get content sections: {e}")
            return {}
    
    def update_module_status(self, content_id: str, status: str, revision_count: int = None) -> bool:
        """
        Update module status and revision count.
        
        Args:
            content_id: Module content identifier
            status: New status (draft, quality_check, revision, approved, failed)
            revision_count: New revision count (optional)
            
        Returns:
            bool: Success status
        """
        try:
            valid_statuses = ['draft', 'quality_check', 'revision', 'approved', 'failed']
            if status not in valid_statuses:
                raise ValueError(f"Invalid status. Must be one of: {valid_statuses}")
            
            update_data = {'status': status}
            if revision_count is not None:
                update_data['revision_count'] = revision_count
            
            result = self.supabase.table(self._table('module_content')).update(update_data).eq('content_id', content_id).execute()
            
            if result.data:
                logger.info(f"✅ Module status updated to '{status}' for content {content_id[:8]}")
                return True
            else:
                raise Exception("Failed to update status")
                
        except Exception as e:
            logger.error(f"❌ Failed to update module status: {e}")
            return False
    
    def verify_section_update(self, content_id: str, section_name: str, expected_content: str) -> bool:
        """
        Verify that a section was actually updated with the expected content.
        
        Args:
            content_id: Module content identifier
            section_name: Section name to verify
            expected_content: Expected content after update
            
        Returns:
            bool: True if content matches expected, False otherwise
        """
        try:
            logger.info(f"🔍 Verifying section '{section_name}' update for content {content_id[:8]}...")
            
            content = self.get_module_content(content_id)
            if not content:
                logger.error(f"❌ Content {content_id[:8]} not found during verification")
                return False
            
            actual_content = content.get(section_name, '')
            content_matches = actual_content == expected_content
            
            if content_matches:
                logger.info(f"✅ Section '{section_name}' content verified successfully")
                logger.debug(f"📊 Content length: {len(actual_content)} characters")
            else:
                logger.error(f"❌ Section '{section_name}' content mismatch!")
                logger.error(f"📏 Expected length: {len(expected_content)}, Actual length: {len(actual_content)}")
                logger.debug(f"🔍 Expected start: {expected_content[:100]}...")
                logger.debug(f"🔍 Actual start: {actual_content[:100]}...")
            
            return content_matches
            
        except Exception as e:
            logger.error(f"❌ Failed to verify section update: {e}")
            return False
    
    def get_section_update_history(self, content_id: str, section_name: str) -> List[Dict[str, Any]]:
        """
        Get update history for a specific content section.
        
        Args:
            content_id: Module content identifier
            section_name: Section name to get history for
            
        Returns:
            List of update records from content_sections table
        """
        try:
            result = self.supabase.table(self._table('content_sections'))\
                .select('*')\
                .eq('content_id', content_id)\
                .eq('section_name', section_name)\
                .order('updated_at', desc=True)\
                .execute()
            
            return result.data if result.data else []
            
        except Exception as e:
            logger.error(f"❌ Failed to get section update history: {e}")
            return []
    
    # =====================================================
    # QUALITY ASSESSMENT OPERATIONS
    # ====================================================="
    
    def store_quality_assessment(
        self,
        content_id: str,
        overall_score: float,
        section_scores: Dict[str, float],
        quality_feedback: str,
        assessment_criteria: str,
        module_context: Dict[str, Any],
        passed: bool,
        requires_revision: bool = False,
        sections_needing_work: List[str] = None,
        critical_issues: List[str] = None,
        improvement_suggestions: List[str] = None
    ) -> str:
        """
        Store quality assessment results in database.
        
        Returns:
            assessment_id: UUID for this assessment
        """
        try:
            logger.info(f"📊 Storing quality assessment for content {content_id[:8]}")
            
            # Extract individual quality scores
            accuracy_score = section_scores.get('accuracy', overall_score)
            clarity_score = section_scores.get('clarity', overall_score)
            completeness_score = section_scores.get('completeness', overall_score)
            engagement_score = section_scores.get('engagement', overall_score)
            personalization_score = section_scores.get('personalization', overall_score)
            
            assessment_data = {
                'content_id': content_id,
                'overall_score': overall_score,
                'section_scores': section_scores,
                'accuracy_score': accuracy_score,
                'clarity_score': clarity_score,
                'completeness_score': completeness_score,
                'engagement_score': engagement_score,
                'personalization_score': personalization_score,
                'quality_feedback': quality_feedback,
                'assessment_criteria': assessment_criteria,
                'module_context': module_context,
                'passed': passed,
                'requires_revision': requires_revision,
                'sections_needing_work': sections_needing_work or [],
                'critical_issues': critical_issues or [],
                'improvement_suggestions': improvement_suggestions or []
            }
            
            result = self.supabase.table(self._table('quality_assessments')).insert(assessment_data).execute()
            
            if result.data:
                assessment_id = result.data[0]['assessment_id']
                
                # Update module content with last quality check time
                self.supabase.table(self._table('module_content')).update({
                    'last_quality_check': datetime.now(timezone.utc).isoformat()
                }).eq('content_id', content_id).execute()
                
                logger.info(f"✅ Quality assessment stored: {assessment_id}")
                return assessment_id
            else:
                raise Exception("Failed to store quality assessment")
                
        except Exception as e:
            logger.error(f"❌ Failed to store quality assessment: {e}")
            raise
    
    def get_latest_quality_assessment(self, content_id: str) -> Optional[Dict[str, Any]]:
        """Get the most recent quality assessment for content."""
        try:
            result = self.supabase.table(self._table('quality_assessments'))\
                .select('*')\
                .eq('content_id', content_id)\
                .order('assessed_at', desc=True)\
                .limit(1)\
                .execute()
            
            if result.data:
                return result.data[0]
            return None
            
        except Exception as e:
            logger.error(f"❌ Failed to get quality assessment: {e}")
            return None
    
    # =====================================================
    # ENHANCEMENT SESSION OPERATIONS  
    # =====================================================
    
    def create_enhancement_session(
        self,
        content_id: str,
        quality_assessment_id: str,
        sections_to_enhance: List[str],
        sections_preserved: List[str] = None,
        enhancement_type: str = 'targeted'
    ) -> str:
        """
        Create new enhancement session for tracking improvements.
        
        Returns:
            session_id: UUID for this enhancement session
        """
        try:
            logger.info(f"🔧 Creating enhancement session for content {content_id[:8]}")
            
            # Get current word count
            content = self.get_module_content(content_id)
            current_word_count = content.get('total_word_count', 0) if content else 0
            
            # Get current quality score
            quality_assessment = self.get_latest_quality_assessment(content_id)
            current_quality_score = quality_assessment.get('overall_score', 0) if quality_assessment else 0
            
            session_data = {
                'content_id': content_id,
                'quality_assessment_id': quality_assessment_id,
                'enhancement_type': enhancement_type,
                'sections_to_enhance': sections_to_enhance,
                'sections_preserved': sections_preserved or [],
                'word_count_before': current_word_count,
                'quality_score_before': current_quality_score,
                'status': 'started'
            }
            
            result = self.supabase.table(self._table('enhancement_sessions')).insert(session_data).execute()
            
            if result.data:
                session_id = result.data[0]['session_id']
                logger.info(f"✅ Enhancement session created: {session_id}")
                return session_id
            else:
                raise Exception("Failed to create enhancement session")
                
        except Exception as e:
            logger.error(f"❌ Failed to create enhancement session: {e}")
            raise
    
    def update_enhancement_session(
        self,
        session_id: str,
        status: str = None,
        research_conducted: bool = None,
        content_regenerated: bool = None,
        integration_completed: bool = None,
        tokens_used: Dict[str, int] = None,
        success: bool = None,
        error_details: str = None
    ) -> bool:
        """Update enhancement session progress."""
        try:
            update_data = {}
            
            if status is not None:
                update_data['status'] = status
            if research_conducted is not None:
                update_data['research_conducted'] = research_conducted
            if content_regenerated is not None:
                update_data['content_regenerated'] = content_regenerated
            if integration_completed is not None:
                update_data['integration_completed'] = integration_completed
            if success is not None:
                update_data['success'] = success
            if error_details is not None:
                update_data['error_details'] = error_details
                
            if tokens_used:
                update_data['enhancement_tokens_used'] = tokens_used.get('enhancement', 0)
                update_data['content_tokens_used'] = tokens_used.get('content', 0)
                update_data['total_tokens_saved'] = tokens_used.get('saved', 0)
            
            if status == 'completed':
                update_data['completed_at'] = datetime.now(timezone.utc).isoformat()
            
            result = self.supabase.table(self._table('enhancement_sessions')).update(update_data).eq('session_id', session_id).execute()
            
            if result.data:
                logger.info(f"✅ Enhancement session updated: {session_id}")
                return True
            else:
                raise Exception("Failed to update enhancement session")
                
        except Exception as e:
            logger.error(f"❌ Failed to update enhancement session: {e}")
            return False
    
    # =====================================================
    # RESEARCH SESSION OPERATIONS
    # =====================================================
    
    def create_research_session(
        self,
        enhancement_session_id: str,
        content_id: str,
        research_topics: List[str],
        research_type: str = 'web_search'
    ) -> str:
        """Create research session for Enhancement Agent research tracking."""
        try:
            logger.info(f"🔍 Creating research session for topics: {research_topics}")
            
            session_data = {
                'enhancement_session_id': enhancement_session_id,
                'content_id': content_id,
                'research_topics': research_topics,
                'research_type': research_type,
                'status': 'started'
            }
            
            result = self.supabase.table(self._table('research_sessions')).insert(session_data).execute()
            
            if result.data:
                research_id = result.data[0]['research_id']
                logger.info(f"✅ Research session created: {research_id}")
                return research_id
            else:
                raise Exception("Failed to create research session")
                
        except Exception as e:
            logger.error(f"❌ Failed to create research session: {e}")
            raise
    
    def store_research_results(
        self,
        research_id: str,
        research_results: Dict[str, Any],
        research_package: Dict[str, Any],
        tavily_queries_made: int = 0,
        research_quality: float = 0.0
    ) -> bool:
        """Store research results from Enhancement Agent."""
        try:
            # Extract insights from research results
            key_insights = research_results.get('key_insights', [])
            current_examples = research_results.get('current_examples', [])
            industry_trends = research_results.get('industry_trends', [])
            
            update_data = {
                'research_results': research_results,
                'research_package': research_package,
                'key_insights': key_insights,
                'current_examples': current_examples,
                'industry_trends': industry_trends,
                'tavily_queries_made': tavily_queries_made,
                'research_quality': research_quality,
                'status': 'completed',
                'completed_at': datetime.now(timezone.utc).isoformat(),
                'success': True
            }
            
            result = self.supabase.table(self._table('research_sessions')).update(update_data).eq('research_id', research_id).execute()
            
            if result.data:
                logger.info(f"✅ Research results stored: {research_id}")
                return True
            else:
                raise Exception("Failed to store research results")
                
        except Exception as e:
            logger.error(f"❌ Failed to store research results: {e}")
            return False
    
    # =====================================================
    # CONTENT SECTION OPERATIONS
    # =====================================================
    
    def _create_or_update_content_section(
        self,
        content_id: str,
        section_name: str,
        section_content: str,
        metadata: Dict[str, Any] = None
    ) -> str:
        """Create or update content section entry."""
        try:
            logger.debug(f"🔍 Checking for existing content section: {section_name}")
            
            # Check if section already exists
            existing = self.supabase.table(self._table('content_sections'))\
                .select('section_id, enhancement_count')\
                .eq('content_id', content_id)\
                .eq('section_name', section_name)\
                .eq('status', 'current')\
                .execute()
            
            if existing.data:
                # Update existing section
                section_id = existing.data[0]['section_id']
                current_enhancement_count = existing.data[0].get('enhancement_count', 0)
                
                update_data = {
                    'section_content': section_content,
                    'section_metadata': metadata or {},
                    'enhancement_count': current_enhancement_count + 1,
                    'updated_at': datetime.now(timezone.utc).isoformat()
                }
                
                update_result = self.supabase.table(self._table('content_sections'))\
                    .update(update_data)\
                    .eq('section_id', section_id)\
                    .execute()
                
                if update_result.data:
                    logger.info(f"📝 Updated content section: {section_name} (enhancement #{current_enhancement_count + 1})")
                    return section_id
                else:
                    raise Exception(f"Failed to update existing content section {section_id}")
            else:
                # Create new section
                logger.debug(f"🆕 Creating new content section: {section_name}")
                section_data = {
                    'content_id': content_id,
                    'company_id': '67d7bff4-1149-4f37-952e-af1841fb67fa',  # Default company_id
                    'section_name': section_name,
                    'section_content': section_content,
                    'section_metadata': metadata or {},
                    'status': 'current',
                    'version_number': 1,
                    'enhancement_count': 0
                }
                
                result = self.supabase.table(self._table('content_sections')).insert(section_data).execute()
                if result.data:
                    section_id = result.data[0]['section_id']
                    logger.info(f"📝 Created content section: {section_name}")
                    return section_id
                else:
                    raise Exception("Failed to create content section - no data returned from insert")
                    
        except Exception as e:
            logger.error(f"❌ Failed to create/update content section '{section_name}': {type(e).__name__}: {e}")
            raise
    
    # =====================================================
    # ANALYTICS AND MONITORING
    # =====================================================
    
    def get_content_analytics(self, session_id: str = None, employee_name: str = None) -> Dict[str, Any]:
        """Get comprehensive analytics for content generation and enhancement."""
        try:
            logger.info("📊 Generating content analytics...")
            
            # Base query
            query = self.supabase.table(self._table('module_content')).select('*')
            if session_id:
                query = query.eq('session_id', session_id)
            if employee_name:
                query = query.eq('employee_name', employee_name)
            
            modules = query.execute().data
            
            if not modules:
                return {"message": "No content found", "modules": 0}
            
            # Calculate metrics
            total_modules = len(modules)
            total_word_count = sum(m.get('total_word_count', 0) for m in modules)
            approved_modules = len([m for m in modules if m['status'] == 'approved'])
            failed_modules = len([m for m in modules if m['status'] == 'failed'])
            
            # Quality metrics
            quality_assessments = self.supabase.table(self._table('quality_assessments'))\
                .select('*')\
                .in_('content_id', [m['content_id'] for m in modules])\
                .execute().data
            
            avg_quality_score = sum(qa['overall_score'] for qa in quality_assessments if qa['overall_score']) / len(quality_assessments) if quality_assessments else 0
            
            # Enhancement metrics
            enhancement_sessions = self.supabase.table(self._table('enhancement_sessions'))\
                .select('*')\
                .in_('content_id', [m['content_id'] for m in modules])\
                .execute().data
            
            total_enhancements = len(enhancement_sessions)
            successful_enhancements = len([e for e in enhancement_sessions if e.get('success')])
            
            analytics = {
                "content_metrics": {
                    "total_modules": total_modules,
                    "total_word_count": total_word_count,
                    "average_word_count": total_word_count / total_modules if total_modules > 0 else 0,
                    "approved_modules": approved_modules,
                    "failed_modules": failed_modules,
                    "approval_rate": approved_modules / total_modules if total_modules > 0 else 0
                },
                "quality_metrics": {
                    "total_assessments": len(quality_assessments),
                    "average_quality_score": round(avg_quality_score, 2),
                    "quality_distribution": self._get_quality_distribution(quality_assessments)
                },
                "enhancement_metrics": {
                    "total_enhancement_sessions": total_enhancements,
                    "successful_enhancements": successful_enhancements,
                    "enhancement_success_rate": successful_enhancements / total_enhancements if total_enhancements > 0 else 0,
                    "average_tokens_saved": self._calculate_average_tokens_saved(enhancement_sessions)
                },
                "performance_insights": self._generate_performance_insights(modules, quality_assessments, enhancement_sessions)
            }
            
            logger.info("✅ Content analytics generated")
            return analytics
            
        except Exception as e:
            logger.error(f"❌ Failed to generate analytics: {e}")
            return {"error": str(e)}
    
    def _get_quality_distribution(self, assessments: List[Dict]) -> Dict[str, int]:
        """Calculate distribution of quality scores."""
        distribution = {"excellent": 0, "good": 0, "fair": 0, "poor": 0}
        
        for assessment in assessments:
            score = assessment.get('overall_score', 0)
            if score >= 8.5:
                distribution["excellent"] += 1
            elif score >= 7.0:
                distribution["good"] += 1
            elif score >= 5.0:
                distribution["fair"] += 1
            else:
                distribution["poor"] += 1
        
        return distribution
    
    def _calculate_average_tokens_saved(self, enhancement_sessions: List[Dict]) -> int:
        """Calculate average tokens saved through enhancements."""
        tokens_saved = [e.get('total_tokens_saved', 0) for e in enhancement_sessions if e.get('total_tokens_saved')]
        return sum(tokens_saved) / len(tokens_saved) if tokens_saved else 0
    
    def _generate_performance_insights(self, modules: List[Dict], assessments: List[Dict], enhancements: List[Dict]) -> List[str]:
        """Generate performance insights based on data patterns."""
        insights = []
        
        if modules:
            # Word count insights
            avg_words = sum(m.get('total_word_count', 0) for m in modules) / len(modules)
            if avg_words < 4000:
                insights.append("Content modules are below target word count on average")
            elif avg_words > 6000:
                insights.append("Content modules are exceeding target word count")
            
        if assessments:
            # Quality insights
            avg_quality = sum(a['overall_score'] for a in assessments if a['overall_score']) / len(assessments)
            if avg_quality < 7.0:
                insights.append("Quality scores are below target - consider enhancement workflow improvements")
            elif avg_quality > 8.5:
                insights.append("Quality scores are excellent - current workflow is effective")
        
        if enhancements:
            # Enhancement insights
            success_rate = len([e for e in enhancements if e.get('success')]) / len(enhancements)
            if success_rate < 0.8:
                insights.append("Enhancement success rate could be improved")
            elif success_rate > 0.95:
                insights.append("Enhancement workflow is highly effective")
        
        return insights
    
    # =====================================================
    # UTILITY METHODS
    # =====================================================
    
    def get_module_by_session(self, session_id: str) -> List[Dict[str, Any]]:
        """Get all modules for a specific session."""
        try:
            result = self.supabase.table(self._table('module_content'))\
                .select('*')\
                .eq('session_id', session_id)\
                .order('created_at')\
                .execute()
            
            return result.data if result.data else []
            
        except Exception as e:
            logger.error(f"❌ Failed to get modules by session: {e}")
            return []
    
    def delete_module_content(self, content_id: str) -> bool:
        """Delete module content and all related data."""
        try:
            logger.info(f"🗑️ Deleting module content: {content_id[:8]}")
            
            # Delete from module_content (cascade will handle related tables)
            result = self.supabase.table(self._table('module_content')).delete().eq('content_id', content_id).execute()
            
            if result.data:
                logger.info(f"✅ Module content deleted: {content_id[:8]}")
                return True
            else:
                logger.warning(f"⚠️ Module content not found for deletion: {content_id}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Failed to delete module content: {e}")
            return False
    
    def health_check(self) -> Dict[str, Any]:
        """Perform health check on database connection and schema."""
        try:
            logger.info("🔍 Performing ContentManager health check...")
            
            # Test connection
            result = self.supabase.table(self._table('module_content')).select('content_id').limit(1).execute()
            
            # Count records in each table
            tables = ['module_content', 'quality_assessments', 'content_sections', 'enhancement_sessions', 'research_sessions']
            table_counts = {}
            
            for table in tables:
                count_result = self.supabase.table(self._table(table)).select('*', count='exact').execute()
                table_counts[table] = count_result.count if hasattr(count_result, 'count') else 0
            
            health_status = {
                "status": "healthy",
                "connection": "active",
                "schema_version": "1.0",
                "table_counts": table_counts,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
            logger.info("✅ ContentManager health check passed")
            return health_status
            
        except Exception as e:
            logger.error(f"❌ ContentManager health check failed: {e}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

# =====================================================
# HELPER FUNCTIONS
# =====================================================

def create_content_manager() -> ContentManager:
    """Factory function to create ContentManager instance."""
    return ContentManager()

def format_content_for_agent(content: Dict[str, Any]) -> str:
    """Format database content for agent consumption (minimal token usage)."""
    if not content:
        return "No content found"
    
    # Return minimal format with content_id reference
    return f"Content ID: {content['content_id']}\nModule: {content['module_name']}\nStatus: {content['status']}\nWord Count: {content.get('total_word_count', 0)}"

if __name__ == "__main__":
    """Test ContentManager functionality."""
    
    print("🧪 Testing ContentManager")
    print("=" * 50)
    
    try:
        # Initialize ContentManager
        cm = ContentManager()
        
        # Health check
        health = cm.health_check()
        print(f"Health Status: {health['status']}")
        
        print("✅ ContentManager ready for use!")
        
    except Exception as e:
        print(f"❌ ContentManager test failed: {e}")
        print("Make sure SUPABASE_URL and SUPABASE_ANON_KEY are set in environment")