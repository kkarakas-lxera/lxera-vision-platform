#!/usr/bin/env python3
"""
File management API endpoints.
Handles file upload, download, and storage operations.
"""

from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
import os
import mimetypes
from datetime import datetime, timezone
import hashlib
import aiofiles

from database.connection import get_supabase_client
from auth.auth_handler import UserRoles, has_permission
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


# Configuration
MAX_FILE_SIZE_MB = int(os.getenv('MAX_FILE_SIZE_MB', 100))
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
ALLOWED_EXTENSIONS = {
    'documents': ['.pdf', '.doc', '.docx', '.txt', '.md'],
    'images': ['.jpg', '.jpeg', '.png', '.gif', '.svg'],
    'audio': ['.mp3', '.wav', '.m4a', '.aac'],
    'video': ['.mp4', '.avi', '.mov', '.wmv'],
    'archives': ['.zip', '.rar', '.7z', '.tar', '.gz'],
    'spreadsheets': ['.xls', '.xlsx', '.csv']
}


# Pydantic models
class FileInfo(BaseModel):
    file_id: str
    filename: str
    file_size: int
    mime_type: str
    upload_date: datetime
    download_url: Optional[str] = None


class FileListResponse(BaseModel):
    files: List[FileInfo]
    total: int
    skip: int
    limit: int


# Dependency placeholder
async def get_current_user():
    return {
        "id": "test-user-id",
        "role": UserRoles.COMPANY_ADMIN,
        "company_id": "test-company-id"
    }


def get_file_type_category(filename: str) -> str:
    """Determine file type category from filename."""
    ext = os.path.splitext(filename)[1].lower()
    
    for category, extensions in ALLOWED_EXTENSIONS.items():
        if ext in extensions:
            return category
    
    return 'other'


def validate_file(file: UploadFile) -> None:
    """Validate uploaded file."""
    # Check file size (this is checked during upload, but double-check)
    if hasattr(file, 'size') and file.size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds {MAX_FILE_SIZE_MB}MB limit"
        )
    
    # Check file extension
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required"
        )
    
    ext = os.path.splitext(file.filename)[1].lower()
    all_allowed = sum(ALLOWED_EXTENSIONS.values(), [])
    
    if ext not in all_allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {ext} not allowed. Allowed types: {', '.join(all_allowed)}"
        )


async def calculate_file_hash(file_content: bytes) -> str:
    """Calculate SHA256 hash of file content."""
    return hashlib.sha256(file_content).hexdigest()


async def store_file_supabase(file_content: bytes, filename: str, company_id: str) -> Dict[str, str]:
    """Store file in Supabase Storage."""
    try:
        supabase = get_supabase_client()
        
        # Create unique filename
        file_id = str(uuid.uuid4())
        ext = os.path.splitext(filename)[1]
        storage_path = f"{company_id}/{file_id}{ext}"
        
        # Upload to Supabase Storage
        result = supabase.storage.from_("files").upload(storage_path, file_content)
        
        if result.error:
            raise Exception(f"Supabase storage error: {result.error}")
        
        # Get public URL
        public_url = supabase.storage.from_("files").get_public_url(storage_path)
        
        return {
            'storage_path': storage_path,
            'public_url': public_url,
            'storage_provider': 'supabase'
        }
        
    except Exception as e:
        logger.error(f"File storage error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to store file"
        )


@router.post("/upload", response_model=FileInfo)
async def upload_file(
    file: UploadFile = File(...),
    description: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Upload a file to the platform.
    
    Args:
        file: The file to upload
        description: Optional file description
        current_user: Current authenticated user
        
    Returns:
        FileInfo: Information about the uploaded file
    """
    try:
        # Check permissions
        if not has_permission(current_user, 'upload_files'):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to upload files"
            )
        
        # Validate file
        validate_file(file)
        
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)
        
        # Additional size check
        if file_size > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size {file_size} bytes exceeds {MAX_FILE_SIZE_MB}MB limit"
            )
        
        # Calculate file hash
        file_hash = await calculate_file_hash(file_content)
        
        supabase = get_supabase_client()
        
        # Check for duplicate files
        existing_file = supabase.table('mm_file_storage').select('*').eq('file_hash', file_hash).eq('company_id', current_user['company_id']).execute()
        
        if existing_file.data:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="File with identical content already exists"
            )
        
        # Determine MIME type
        mime_type = mimetypes.guess_type(file.filename)[0] or 'application/octet-stream'
        
        # Store file
        storage_info = await store_file_supabase(file_content, file.filename, current_user['company_id'])
        
        # Create asset record
        asset_id = str(uuid.uuid4())
        asset_data = {
            'asset_id': asset_id,
            'company_id': current_user['company_id'],
            'asset_type': get_file_type_category(file.filename),
            'original_filename': file.filename,
            'file_extension': os.path.splitext(file.filename)[1],
            'file_size_bytes': file_size,
            'mime_type': mime_type,
            'processing_status': 'completed',
            'access_level': 'company'
        }
        
        # Note: session_id is required but we don't have one for direct uploads
        # For now, create a dummy session or make it optional in schema
        dummy_session_id = str(uuid.uuid4())
        dummy_session = {
            'session_id': dummy_session_id,
            'company_id': current_user['company_id'],
            'course_id': 'direct_upload',
            'employee_name': 'Direct Upload',
            'employee_id': 'system',
            'course_title': 'File Upload',
            'total_modules': 0,
            'status': 'completed'
        }
        
        session_result = supabase.table('mm_multimedia_sessions').insert(dummy_session).execute()
        asset_data['session_id'] = dummy_session_id
        
        asset_result = supabase.table('mm_multimedia_assets').insert(asset_data).execute()
        
        if not asset_result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create asset record"
            )
        
        # Create storage record
        storage_id = str(uuid.uuid4())
        storage_data = {
            'storage_id': storage_id,
            'asset_id': asset_id,
            'company_id': current_user['company_id'],
            'storage_provider': storage_info['storage_provider'],
            'storage_path': storage_info['storage_path'],
            'public_url': storage_info['public_url'],
            'file_hash': file_hash,
            'is_public': False,
            'file_verified': True
        }
        
        storage_result = supabase.table('mm_file_storage').insert(storage_data).execute()
        
        if not storage_result.data:
            # Cleanup asset record
            supabase.table('mm_multimedia_assets').delete().eq('asset_id', asset_id).execute()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create storage record"
            )
        
        logger.info(f"File uploaded successfully: {file.filename} ({file_size} bytes)")
        
        return FileInfo(
            file_id=asset_id,
            filename=file.filename,
            file_size=file_size,
            mime_type=mime_type,
            upload_date=datetime.now(timezone.utc),
            download_url=storage_info['public_url']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"File upload error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="File upload failed"
        )


@router.get("/", response_model=FileListResponse)
async def list_files(
    skip: int = 0,
    limit: int = 50,
    file_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    List files accessible to the current user.
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        file_type: Optional file type filter
        current_user: Current authenticated user
        
    Returns:
        FileListResponse: List of files
    """
    try:
        supabase = get_supabase_client()
        
        # Build query
        query = supabase.table('mm_multimedia_assets').select('''
            asset_id,
            original_filename,
            file_size_bytes,
            mime_type,
            created_at,
            asset_type,
            mm_file_storage!inner (
                public_url,
                is_public
            )
        ''')
        
        # Apply company filter for non-super admins
        if current_user['role'] != UserRoles.SUPER_ADMIN:
            query = query.eq('company_id', current_user['company_id'])
        
        # Apply file type filter
        if file_type:
            query = query.eq('asset_type', file_type)
        
        # Apply pagination
        query = query.range(skip, skip + limit - 1).order('created_at', desc=True)
        
        result = query.execute()
        
        # Convert to FileInfo objects
        files = []
        for item in result.data:
            files.append(FileInfo(
                file_id=item['asset_id'],
                filename=item['original_filename'],
                file_size=item['file_size_bytes'],
                mime_type=item['mime_type'],
                upload_date=datetime.fromisoformat(item['created_at']),
                download_url=item['mm_file_storage'][0]['public_url'] if item['mm_file_storage'] else None
            ))
        
        return FileListResponse(
            files=files,
            total=len(files),
            skip=skip,
            limit=limit
        )
        
    except Exception as e:
        logger.error(f"List files error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve files"
        )


@router.get("/{file_id}")
async def get_file_info(
    file_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get detailed information about a specific file.
    
    Args:
        file_id: File ID (asset_id)
        current_user: Current authenticated user
        
    Returns:
        dict: Detailed file information
    """
    try:
        supabase = get_supabase_client()
        
        # Get file with storage information
        query = supabase.table('mm_multimedia_assets').select('''
            *,
            mm_file_storage (
                storage_provider,
                public_url,
                file_hash,
                download_count,
                last_accessed
            )
        ''').eq('asset_id', file_id)
        
        # Apply company filter for non-super admins
        if current_user['role'] != UserRoles.SUPER_ADMIN:
            query = query.eq('company_id', current_user['company_id'])
        
        result = query.execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get file info error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve file information"
        )


@router.get("/{file_id}/download")
async def download_file(
    file_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Download a file.
    
    Args:
        file_id: File ID (asset_id)
        current_user: Current authenticated user
        
    Returns:
        StreamingResponse: File download response
    """
    try:
        supabase = get_supabase_client()
        
        # Get file information
        query = supabase.table('mm_multimedia_assets').select('''
            *,
            mm_file_storage (
                storage_provider,
                storage_path,
                public_url
            )
        ''').eq('asset_id', file_id)
        
        # Apply company filter for non-super admins
        if current_user['role'] != UserRoles.SUPER_ADMIN:
            query = query.eq('company_id', current_user['company_id'])
        
        result = query.execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        
        file_info = result.data[0]
        storage_info = file_info['mm_file_storage'][0]
        
        # Update download count
        supabase.table('mm_file_storage').update({
            'download_count': supabase.rpc('increment_download_count', {'asset_id': file_id}),
            'last_accessed': datetime.now(timezone.utc).isoformat()
        }).eq('asset_id', file_id).execute()
        
        # For Supabase storage, redirect to public URL
        if storage_info['storage_provider'] == 'supabase':
            # Get file content from Supabase
            try:
                file_content = supabase.storage.from_("files").download(storage_info['storage_path'])
                
                if file_content:
                    return StreamingResponse(
                        io.BytesIO(file_content),
                        media_type=file_info['mime_type'],
                        headers={"Content-Disposition": f"attachment; filename={file_info['original_filename']}"}
                    )
                else:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="File content not found in storage"
                    )
            except Exception as e:
                logger.error(f"File download error: {e}")
                # Fallback to public URL redirect
                return Response(
                    status_code=status.HTTP_302_FOUND,
                    headers={"Location": storage_info['public_url']}
                )
        
        # For other storage providers, implement accordingly
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Storage provider not implemented"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Download file error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="File download failed"
        )


@router.delete("/{file_id}")
async def delete_file(
    file_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a file (soft delete - mark as archived).
    
    Args:
        file_id: File ID (asset_id)
        current_user: Current authenticated user
        
    Returns:
        dict: Success message
    """
    try:
        # Check permissions
        if not has_permission(current_user, 'upload_files'):  # Same permission for delete
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to delete files"
            )
        
        supabase = get_supabase_client()
        
        # Verify file exists and belongs to company
        query = supabase.table('mm_multimedia_assets').select('*').eq('asset_id', file_id)
        
        if current_user['role'] != UserRoles.SUPER_ADMIN:
            query = query.eq('company_id', current_user['company_id'])
        
        result = query.execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        
        # Soft delete - mark as archived
        supabase.table('mm_multimedia_assets').update({
            'processing_status': 'archived',
            'updated_at': datetime.now(timezone.utc).isoformat()
        }).eq('asset_id', file_id).execute()
        
        supabase.table('mm_file_storage').update({
            'archived': True,
            'archived_at': datetime.now(timezone.utc).isoformat()
        }).eq('asset_id', file_id).execute()
        
        logger.info(f"File archived: {file_id}")
        
        return {"message": "File deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete file error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="File deletion failed"
        )


# Additional endpoint for file types
@router.get("/types/allowed")
async def get_allowed_file_types():
    """Get list of allowed file types and extensions."""
    return {
        "max_file_size_mb": MAX_FILE_SIZE_MB,
        "allowed_extensions": ALLOWED_EXTENSIONS,
        "categories": list(ALLOWED_EXTENSIONS.keys())
    }