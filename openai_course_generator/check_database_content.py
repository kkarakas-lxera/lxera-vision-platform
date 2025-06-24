#!/usr/bin/env python3
"""Check database content patterns to identify content ID mismatches."""

import os
import sys

# Set environment variables
os.environ['SUPABASE_URL'] = 'https://ujlqzkkkfatehxeqtbdl.supabase.co'
os.environ['SUPABASE_ANON_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqbHF6a2trZmF0ZWh4ZXF0YmRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2ODA4MzIsImV4cCI6MjA1NjI1NjgzMn0.ed-wciIqkubS4f2T3UNnkgqwzLEdpC-SVZoVsP7-W1E'

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from database.content_manager import ContentManager

# Initialize content manager
cm = ContentManager()

print('🔍 Analyzing Content ID Patterns in Database')
print('=' * 60)

# Get recent modules
recent_modules = cm.supabase.table('cm_module_content').select('*').order('created_at', desc=True).limit(20).execute()

print(f'\n📊 Found {len(recent_modules.data)} recent modules:\n')

empty_modules = []
populated_modules = []
mismatch_patterns = []

for module in recent_modules.data:
    content_id = module['content_id']
    module_name = module['module_name']
    session_id = module.get('session_id', 'N/A')
    
    # Get sections using ContentManager
    sections = cm.get_content_sections(content_id)
    
    if sections:
        total_words = sum(len(content.split()) for content in sections.values())
        populated_modules.append({
            'content_id': content_id,
            'module_name': module_name,
            'sections': len(sections),
            'words': total_words,
            'session_id': session_id
        })
    else:
        empty_modules.append({
            'content_id': content_id,
            'module_name': module_name,
            'session_id': session_id,
            'created_at': module['created_at']
        })
        
        # Check if there's another module with same name but different ID (potential mismatch)
        for pm in populated_modules:
            if pm['module_name'] == module_name:
                mismatch_patterns.append({
                    'module_name': module_name,
                    'empty_id': content_id,
                    'populated_id': pm['content_id'],
                    'session': session_id
                })

print('❌ EMPTY MODULES (Potential Issues):')
print('-' * 60)
for i, module in enumerate(empty_modules[:10], 1):
    print(f'{i}. {module["module_name"][:50]}')
    print(f'   Content ID: {module["content_id"][:20]}...')
    print(f'   Session: {module["session_id"][:30] if module["session_id"] != "N/A" else "N/A"}')

print(f'\n✅ POPULATED MODULES:')
print('-' * 60)
for i, module in enumerate(populated_modules[:10], 1):
    print(f'{i}. {module["module_name"][:50]}')
    print(f'   Sections: {module["sections"]} | Words: {module["words"]:,}')
    print(f'   Session: {module["session_id"][:30] if module["session_id"] != "N/A" else "N/A"}')

if mismatch_patterns:
    print(f'\n🚨 DETECTED CONTENT ID MISMATCHES:')
    print('-' * 60)
    for pattern in mismatch_patterns:
        print(f'Module: {pattern["module_name"]}')
        print(f'  Empty ID: {pattern["empty_id"][:20]}...')
        print(f'  Populated ID: {pattern["populated_id"][:20]}...')
        print(f'  Session: {pattern["session"][:30]}')
        print()

print(f'\n📈 STATISTICS:')
print(f'  Total modules: {len(recent_modules.data)}')
print(f'  Empty modules: {len(empty_modules)} ({len(empty_modules)/len(recent_modules.data)*100:.1f}%)')
print(f'  Populated modules: {len(populated_modules)} ({len(populated_modules)/len(recent_modules.data)*100:.1f}%)')
print(f'  Detected mismatches: {len(mismatch_patterns)}')