#!/usr/bin/env python3
"""
Standalone Content Database Tools - No lxera-agents dependency
Direct Supabase integration for content storage and management.
"""

import json
import logging
import os
import uuid
import re
from datetime import datetime
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

def get_supabase_client():
    """Get Supabase client for database operations."""
    from supabase import create_client
    
    supabase_url = os.getenv('SUPABASE_URL', 'https://xwfweumeryrgbguwrocr.supabase.co')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_key:
        raise Exception("SUPABASE_SERVICE_ROLE_KEY not found in environment")
    
    return create_client(supabase_url, supabase_key)


def create_new_module_content(
    module_name: str,
    employee_name: str,
    session_id: str,
    module_spec: str,
    research_context: str = "{}",
    plan_id: Optional[str] = None
) -> str:
    """
    Create new module content in DB; returns JSON with content_id.
    
    Args:
        module_name: Name of the module
        employee_name: Name of the employee
        session_id: Session identifier
        module_spec: Module specification as JSON string
        research_context: Research context as JSON string
        plan_id: Optional plan ID to link to
        
    Returns:
        JSON string with content_id and success status
    """
    try:
        logger.info(f"🆕 Creating new module content: {module_name} for {employee_name}")
        
        supabase = get_supabase_client()
        content_id = str(uuid.uuid4())
        
        # Parse JSON inputs
        try:
            spec_data = json.loads(module_spec) if isinstance(module_spec, str) else module_spec
        except json.JSONDecodeError:
            spec_data = {"module_name": module_name}
            
        try:
            research_data = json.loads(research_context) if isinstance(research_context, str) else research_context
        except json.JSONDecodeError:
            research_data = {}
        
        # Prepare module content record
        module_record = {
            "content_id": content_id,
            "module_name": module_name,
            "employee_name": employee_name,
            "session_id": session_id,
            "plan_id": plan_id,
            "module_spec": spec_data,
            "research_context": research_data,
            "introduction": "",
            "core_content": "",
            "practical_applications": "",
            "case_studies": "",
            "assessments": "",
            "total_word_count": 0,
            "status": "draft",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        # Insert into database
        result = supabase.table('cm_module_content').insert(module_record).execute()
        
        if result.data:
            logger.info(f"✅ Module content created with ID: {content_id}")
            return json.dumps({
                "content_id": content_id,
                "module_name": module_name,
                "employee_name": employee_name,
                "session_id": session_id,
                "status": "created",
                "success": True
            })
        else:
            logger.error(f"❌ Failed to create module content: {result}")
            return json.dumps({"error": "Failed to create module content in database", "success": False})
            
    except Exception as e:
        logger.error(f"❌ Module content creation failed: {e}")
        return json.dumps({"error": str(e), "success": False})


def store_content_section(
    content_id: str,
    section_name: str,
    section_content: str,
    section_metadata: str = "{}"
) -> str:
    """
    Store a content section in DB; returns JSON status.
    
    Args:
        content_id: UUID of the module content
        section_name: Name of the section (introduction, core_content, practical_applications, case_studies, assessments)
        section_content: The actual content text
        section_metadata: Additional metadata as JSON string
        
    Returns:
        JSON string with success status
    """
    try:
        logger.info(f"💾 Storing content section: {section_name} for content_id: {content_id}")
        
        # Validate content_id format (must be UUID)
        uuid_pattern = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.IGNORECASE)
        if not uuid_pattern.match(content_id):
            logger.error(f"❌ Invalid content_id format: {content_id}")
            return json.dumps({
                "success": False,
                "error": "Invalid content_id format. Must be a valid UUID.",
                "content_id": content_id
            })
        
        # Validate section_name
        valid_sections = ["introduction", "core_content", "practical_applications", "case_studies", "assessments"]
        if section_name not in valid_sections:
            logger.error(f"❌ Invalid section_name: {section_name}")
            return json.dumps({
                "success": False,
                "error": f"Invalid section_name. Must be one of: {valid_sections}",
                "section_name": section_name
            })
        
        supabase = get_supabase_client()
        
        # Parse metadata
        try:
            metadata = json.loads(section_metadata) if isinstance(section_metadata, str) else section_metadata
        except json.JSONDecodeError:
            metadata = {}
        
        # Calculate word count
        word_count = len(section_content.split()) if section_content else 0
        
        # Prepare update data
        update_data = {
            section_name: section_content,
            "updated_at": datetime.now().isoformat()
        }
        
        # Also update total word count by fetching current content and recalculating
        try:
            current_record = supabase.table('cm_module_content').select('*').eq('content_id', content_id).single().execute()
            if current_record.data:
                current_data = current_record.data
                total_words = 0
                
                # Calculate total from all sections
                for section in valid_sections:
                    if section == section_name:
                        # Use new content for this section
                        total_words += word_count
                    else:
                        # Use existing content for other sections
                        existing_content = current_data.get(section, "")
                        total_words += len(existing_content.split()) if existing_content else 0
                
                update_data["total_word_count"] = total_words
        except Exception as e:
            logger.warning(f"Could not calculate total word count: {e}")
        
        # Update the record
        result = supabase.table('cm_module_content').update(update_data).eq('content_id', content_id).execute()
        
        if result.data:
            logger.info(f"✅ Content section stored: {section_name} ({word_count} words)")
            return json.dumps({
                "success": True,
                "content_id": content_id,
                "section_name": section_name,
                "word_count": word_count,
                "total_word_count": update_data.get("total_word_count"),
                "updated_at": update_data["updated_at"]
            })
        else:
            logger.error(f"❌ Failed to store content section: {result}")
            return json.dumps({
                "success": False,
                "error": "Failed to update content section in database",
                "content_id": content_id,
                "section_name": section_name
            })
            
    except Exception as e:
        logger.error(f"❌ Content section storage failed: {e}")
        return json.dumps({
            "success": False,
            "error": str(e),
            "content_id": content_id,
            "section_name": section_name
        })
