"""
Database utilities for the Lxera Agent Pipeline API.

Provides Supabase client initialization and database utilities.
"""

import os
import logging
from typing import Optional
from supabase import create_client, Client

logger = logging.getLogger(__name__)

# Global Supabase client instance
_supabase_client: Optional[Client] = None


def get_supabase_client() -> Client:
    """
    Get or create Supabase client instance.
    
    Returns:
        Supabase client instance
        
    Raises:
        RuntimeError: If Supabase credentials are not configured
    """
    global _supabase_client
    
    if _supabase_client is None:
        _supabase_client = _create_supabase_client()
    
    return _supabase_client


def _create_supabase_client() -> Client:
    """Create a new Supabase client instance."""
    
    # Get credentials from environment
    supabase_url = os.getenv('SUPABASE_URL', 'https://xwfweumeryrgbguwrocr.supabase.co')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be set"
        )
    
    try:
        client = create_client(supabase_url, supabase_key)
        logger.info("✅ Supabase client initialized")
        return client
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize Supabase client: {e}")
        raise RuntimeError(f"Failed to initialize Supabase client: {e}")


def test_database_connection() -> bool:
    """
    Test database connection.
    
    Returns:
        True if connection is successful, False otherwise
    """
    try:
        client = get_supabase_client()
        
        # Simple query to test connection
        result = client.table('cm_course_plans').select('count(*)').limit(1).execute()
        
        logger.info("✅ Database connection test successful")
        return True
        
    except Exception as e:
        logger.error(f"❌ Database connection test failed: {e}")
        return False


def initialize_database():
    """Initialize database connection and verify tables exist."""
    try:
        client = get_supabase_client()
        
        # Verify required tables exist
        required_tables = [
            'cm_course_plans',
            'cm_research_results', 
            'cm_module_content',
            'cm_quality_assessments',
            'cm_content_sections'
        ]
        
        for table in required_tables:
            try:
                # Test each table with a simple query
                client.table(table).select('count(*)').limit(1).execute()
                logger.debug(f"✅ Table {table} accessible")
            except Exception as e:
                logger.error(f"❌ Table {table} not accessible: {e}")
                raise RuntimeError(f"Required table {table} not accessible")
        
        logger.info("✅ All required database tables verified")
        
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise


def close_database_connection():
    """Close database connection (cleanup function)."""
    global _supabase_client
    
    if _supabase_client is not None:
        # Supabase client doesn't have explicit close method
        # Just reset the global reference
        _supabase_client = None
        logger.info("🔄 Database connection closed")


# Database health check
async def health_check() -> dict:
    """
    Perform database health check.
    
    Returns:
        Health check results
    """
    try:
        client = get_supabase_client()
        
        # Test basic connectivity
        start_time = time.time()
        result = client.table('cm_course_plans').select('count(*)').limit(1).execute()
        response_time = time.time() - start_time
        
        return {
            "status": "healthy",
            "response_time_ms": round(response_time * 1000, 2),
            "database": "supabase",
            "tables_accessible": True
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "database": "supabase",
            "tables_accessible": False
        }


if __name__ == "__main__":
    import time
    
    # Test database utilities
    print("Testing database utilities...")
    
    try:
        # Test connection
        print("Testing connection...")
        if test_database_connection():
            print("✅ Connection test passed")
        else:
            print("❌ Connection test failed")
        
        # Test initialization
        print("Testing initialization...")
        initialize_database()
        print("✅ Initialization test passed")
        
        # Test health check
        print("Testing health check...")
        import asyncio
        health = asyncio.run(health_check())
        print(f"Health check result: {health}")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
    
    print("Database utilities test completed")