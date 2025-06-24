#!/usr/bin/env python3
"""
Database connection management for Supabase.
Provides centralized database access with connection pooling.
"""

import os
from typing import Optional
from supabase import create_client, Client
from functools import lru_cache
import logging

logger = logging.getLogger(__name__)


@lru_cache()
def get_supabase_client() -> Client:
    """
    Get Supabase client with connection caching.
    
    Returns:
        Client: Authenticated Supabase client
        
    Raises:
        ValueError: If required environment variables are missing
        ConnectionError: If unable to connect to Supabase
    """
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')
    
    if not supabase_url or not supabase_key:
        raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY environment variables must be set")
    
    try:
        client = create_client(supabase_url, supabase_key)
        logger.info("✅ Supabase client initialized successfully")
        return client
    except Exception as e:
        logger.error(f"❌ Failed to initialize Supabase client: {e}")
        raise ConnectionError(f"Unable to connect to Supabase: {e}")


def get_service_role_client() -> Client:
    """
    Get Supabase client with service role key for admin operations.
    
    Returns:
        Client: Service role Supabase client
    """
    supabase_url = os.getenv('SUPABASE_URL')
    service_role_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not service_role_key:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be set")
    
    try:
        client = create_client(supabase_url, service_role_key)
        logger.info("✅ Supabase service role client initialized")
        return client
    except Exception as e:
        logger.error(f"❌ Failed to initialize service role client: {e}")
        raise ConnectionError(f"Unable to connect to Supabase with service role: {e}")


class DatabaseManager:
    """Database operations manager with connection handling."""
    
    def __init__(self, use_service_role: bool = False):
        """
        Initialize database manager.
        
        Args:
            use_service_role: Whether to use service role for admin operations
        """
        self.client = get_service_role_client() if use_service_role else get_supabase_client()
        self.use_service_role = use_service_role
    
    async def test_connection(self) -> bool:
        """
        Test database connection.
        
        Returns:
            bool: True if connection is successful
        """
        try:
            result = self.client.table('companies').select('id').limit(1).execute()
            logger.info("✅ Database connection test successful")
            return True
        except Exception as e:
            logger.error(f"❌ Database connection test failed: {e}")
            return False
    
    def get_client(self) -> Client:
        """Get the database client."""
        return self.client