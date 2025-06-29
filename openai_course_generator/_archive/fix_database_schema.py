#!/usr/bin/env python3
"""
Fix the mm_script_generations table by adding metadata column
"""

import os
from supabase import create_client, Client

# Supabase credentials
SUPABASE_URL = 'https://ujlqzkkkfatehxeqtbdl.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqbHF6a2trZmF0ZWh4ZXF0YmRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2ODA4MzIsImV4cCI6MjA1NjI1NjgzMn0.ed-wciIqkubS4f2T3UNnkgqwzLEdpC-SVZoVsP7-W1E'

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

print("Checking mm_script_generations table...")

# Try to query the table to see current structure
try:
    result = supabase.table('mm_script_generations').select('*').limit(1).execute()
    print("Table exists, checking columns...")
    
    # If we get here, the table exists but might be missing metadata column
    # Since we can't alter tables directly through Supabase client, we'll note this
    print("\n⚠️  The 'metadata' column needs to be added to mm_script_generations table")
    print("\nPlease run this SQL in the Supabase SQL editor:")
    print("ALTER TABLE mm_script_generations ADD COLUMN IF NOT EXISTS metadata JSONB;")
    
except Exception as e:
    print(f"Error accessing table: {e}")
    print("\nThe table might not exist or there's a connection issue")

print("\nChecking all mm_ tables...")
tables_to_check = [
    'mm_multimedia_sessions',
    'mm_script_generations',
    'mm_multimedia_assets',
    'mm_audio_generations',
    'mm_slide_generations',
    'mm_video_compositions',
    'mm_delivery_packages'
]

for table in tables_to_check:
    try:
        result = supabase.table(table).select('*').limit(1).execute()
        print(f"✅ {table} - exists")
    except Exception as e:
        print(f"❌ {table} - {str(e)[:50]}...")