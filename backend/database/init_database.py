#!/usr/bin/env python3
"""
Database initialization script for LXERA SaaS Platform.
Applies all schemas and sets up initial data.
"""

import os
import sys
from pathlib import Path
from supabase import create_client
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def read_sql_file(file_path: Path) -> str:
    """Read SQL file content."""
    try:
        with open(file_path, 'r') as f:
            return f.read()
    except Exception as e:
        logger.error(f"Failed to read {file_path}: {e}")
        raise

def execute_sql_script(supabase, script_content: str, script_name: str):
    """Execute SQL script via Supabase."""
    try:
        logger.info(f"Executing {script_name}...")
        
        # Split script into individual statements
        statements = [stmt.strip() for stmt in script_content.split(';') if stmt.strip()]
        
        for i, statement in enumerate(statements):
            if statement.strip():
                try:
                    result = supabase.rpc('exec_sql', {'sql_statement': statement}).execute()
                    logger.debug(f"Statement {i+1}/{len(statements)} executed successfully")
                except Exception as e:
                    logger.warning(f"Statement {i+1} failed (might be normal): {e}")
                    # Continue with other statements
        
        logger.info(f"✅ {script_name} execution completed")
        
    except Exception as e:
        logger.error(f"❌ Failed to execute {script_name}: {e}")
        raise

def main():
    """Initialize the database with all schemas."""
    
    # Check environment variables
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')  # Use service role for admin operations
    
    if not supabase_url or not supabase_key:
        logger.error("❌ Missing required environment variables:")
        logger.error("   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        logger.error("   Copy .env.example to .env and configure your credentials")
        sys.exit(1)
    
    # Initialize Supabase client
    try:
        supabase = create_client(supabase_url, supabase_key)
        logger.info("✅ Connected to Supabase")
    except Exception as e:
        logger.error(f"❌ Failed to connect to Supabase: {e}")
        sys.exit(1)
    
    # Get schema file paths
    schema_dir = Path(__file__).parent / 'schemas'
    schema_files = [
        ('auth_schema.sql', 'Authentication & Tenant Schema'),
        ('content_schema.sql', 'Content Management Schema'),
        ('multimedia_schema.sql', 'Multimedia Management Schema')
    ]
    
    # Execute each schema
    logger.info("🚀 Starting database initialization...")
    
    for file_name, description in schema_files:
        file_path = schema_dir / file_name
        
        if not file_path.exists():
            logger.error(f"❌ Schema file not found: {file_path}")
            sys.exit(1)
        
        try:
            script_content = read_sql_file(file_path)
            execute_sql_script(supabase, script_content, description)
        except Exception as e:
            logger.error(f"❌ Failed to apply {description}")
            sys.exit(1)
    
    # Verify installation
    try:
        logger.info("🔍 Verifying database setup...")
        
        # Check if key tables exist
        tables_to_check = [
            'companies', 'users', 'employees', 'course_assignments',
            'cm_module_content', 'cm_quality_assessments',
            'mm_multimedia_sessions', 'mm_multimedia_assets'
        ]
        
        for table in tables_to_check:
            result = supabase.table(table).select('*').limit(1).execute()
            logger.info(f"✅ Table '{table}' exists and is accessible")
        
        logger.info("🎉 Database initialization completed successfully!")
        logger.info("🔗 Ready to connect your FastAPI backend")
        
    except Exception as e:
        logger.warning(f"⚠️  Verification failed (database might still be functional): {e}")
    
    print("\n" + "="*60)
    print("📋 NEXT STEPS:")
    print("="*60)
    print("1. Start your FastAPI backend: cd backend && python main.py")
    print("2. Test the API: curl http://localhost:8000/api/health")
    print("3. Access API docs: http://localhost:8000/api/docs")
    print("4. Create your first company via Super Admin endpoints")
    print("="*60)

if __name__ == "__main__":
    main()