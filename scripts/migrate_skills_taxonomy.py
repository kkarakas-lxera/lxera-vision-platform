#!/usr/bin/env python3
"""
Script to migrate NESTA skills taxonomy to Supabase database
"""

import json
import uuid
from typing import Dict, List, Any
import os
from supabase import create_client, Client
from datetime import datetime

# Supabase connection
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY')

def load_taxonomy(file_path: str) -> Dict[str, Any]:
    """Load the NESTA taxonomy JSON file"""
    with open(file_path, 'r') as f:
        return json.load(f)

def flatten_taxonomy(taxonomy: Dict[str, Any], parent_id: str = None, level: int = 0) -> List[Dict[str, Any]]:
    """
    Flatten the hierarchical taxonomy into a list of skills with parent references
    
    The NESTA taxonomy has this structure:
    {
        "Level A Category": {
            "level-b-skill-group": {
                "level-c-skill": {
                    "skill_id": "skill_name"
                }
            }
        }
    }
    """
    skills = []
    
    for key, value in taxonomy.items():
        if isinstance(value, dict):
            # This is a category or skill group
            skill_id = str(uuid.uuid4())
            
            # Determine skill type based on level
            if level == 0:
                skill_type = 'category'
                skill_name = key  # Level A categories have readable names
            elif level == 1:
                skill_type = 'skill_group'
                skill_name = key.replace('-', ' ').title()  # Convert hyphenated to readable
            elif level == 2:
                skill_type = 'skill_cluster'
                skill_name = key.replace('-', ' ').title()
            else:
                skill_type = 'skill'
                skill_name = value if isinstance(value, str) else key
            
            skill_entry = {
                'skill_id': skill_id,
                'skill_name': skill_name,
                'skill_type': skill_type,
                'parent_skill_id': parent_id,
                'hierarchy_level': level,
                'esco_uri': None,  # NESTA doesn't have ESCO URIs
                'description': None,
                'metadata': {
                    'source': 'nesta_uk_2022',
                    'original_key': key
                }
            }
            
            skills.append(skill_entry)
            
            # Recursively process children
            if isinstance(value, dict):
                child_skills = flatten_taxonomy(value, skill_id, level + 1)
                skills.extend(child_skills)
        else:
            # This is a leaf node (actual skill)
            skill_id = str(uuid.uuid4())
            skill_entry = {
                'skill_id': skill_id,
                'skill_name': value,
                'skill_type': 'skill',
                'parent_skill_id': parent_id,
                'hierarchy_level': level,
                'esco_uri': None,
                'description': None,
                'metadata': {
                    'source': 'nesta_uk_2022',
                    'original_id': key,
                    'original_key': value
                }
            }
            skills.append(skill_entry)
    
    return skills

def create_tables(supabase: Client):
    """Create the skills taxonomy tables if they don't exist"""
    
    # Note: In a production environment, you would use proper migrations
    # This is a simplified version for demonstration
    
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS st_skills_taxonomy (
        skill_id UUID PRIMARY KEY,
        skill_name TEXT NOT NULL,
        skill_type TEXT,
        parent_skill_id UUID REFERENCES st_skills_taxonomy(skill_id),
        hierarchy_level INTEGER,
        esco_uri TEXT,
        description TEXT,
        aliases TEXT[],
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_st_skills_taxonomy_parent ON st_skills_taxonomy(parent_skill_id);
    CREATE INDEX IF NOT EXISTS idx_st_skills_taxonomy_type ON st_skills_taxonomy(skill_type);
    CREATE INDEX IF NOT EXISTS idx_st_skills_taxonomy_name ON st_skills_taxonomy(skill_name);
    """
    
    # Execute via Supabase SQL editor or migrations
    print("Please run the following SQL in your Supabase SQL editor:")
    print(create_table_sql)

def insert_skills_batch(supabase: Client, skills: List[Dict[str, Any]], batch_size: int = 100):
    """Insert skills in batches to Supabase"""
    
    total_skills = len(skills)
    inserted = 0
    
    # Sort skills by hierarchy level to ensure parents are inserted before children
    skills_sorted = sorted(skills, key=lambda x: x['hierarchy_level'])
    
    for i in range(0, total_skills, batch_size):
        batch = skills_sorted[i:i + batch_size]
        
        try:
            result = supabase.table('st_skills_taxonomy').insert(batch).execute()
            inserted += len(batch)
            print(f"Inserted {inserted}/{total_skills} skills...")
        except Exception as e:
            print(f"Error inserting batch: {e}")
            # Try inserting one by one for this batch
            for skill in batch:
                try:
                    supabase.table('st_skills_taxonomy').insert(skill).execute()
                    inserted += 1
                except Exception as individual_error:
                    print(f"Failed to insert skill: {skill['skill_name']} - {individual_error}")
    
    return inserted

def generate_stats(skills: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate statistics about the taxonomy"""
    
    stats = {
        'total_skills': len(skills),
        'by_type': {},
        'by_level': {},
        'max_depth': max(s['hierarchy_level'] for s in skills) + 1
    }
    
    for skill in skills:
        # Count by type
        skill_type = skill['skill_type']
        stats['by_type'][skill_type] = stats['by_type'].get(skill_type, 0) + 1
        
        # Count by level
        level = skill['hierarchy_level']
        stats['by_level'][f'level_{level}'] = stats['by_level'].get(f'level_{level}', 0) + 1
    
    return stats

def main():
    """Main migration function"""
    
    # Check environment variables
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Error: SUPABASE_URL and SUPABASE_KEY environment variables must be set")
        return
    
    # Initialize Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Load taxonomy
    taxonomy_path = 'data/skills-taxonomy/skills-taxonomy-v2/outputs/taxonomy_data/2022.01.21_hierarchy_structure_named.json'
    print(f"Loading taxonomy from {taxonomy_path}...")
    taxonomy = load_taxonomy(taxonomy_path)
    
    # Flatten the taxonomy
    print("Flattening taxonomy hierarchy...")
    skills = flatten_taxonomy(taxonomy)
    
    # Generate statistics
    stats = generate_stats(skills)
    print("\nTaxonomy Statistics:")
    print(f"Total skills: {stats['total_skills']}")
    print(f"Maximum depth: {stats['max_depth']}")
    print("\nSkills by type:")
    for skill_type, count in stats['by_type'].items():
        print(f"  {skill_type}: {count}")
    print("\nSkills by level:")
    for level, count in stats['by_level'].items():
        print(f"  {level}: {count}")
    
    # Show table creation SQL
    print("\n" + "="*50)
    create_tables(supabase)
    print("="*50 + "\n")
    
    # Since tables are already created, proceed with insertion
    print("Proceeding with data insertion...")
    
    # Insert skills
    print(f"\nInserting {len(skills)} skills into Supabase...")
    inserted_count = insert_skills_batch(supabase, skills)
    
    print(f"\nMigration complete! Inserted {inserted_count} skills.")
    
    # Save a local backup
    backup_path = f"data/skills_taxonomy_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(backup_path, 'w') as f:
        json.dump(skills, f, indent=2)
    print(f"Backup saved to {backup_path}")

if __name__ == "__main__":
    main()