#!/usr/bin/env python3
"""
Test the fixed prioritize_skill_gaps function.
"""

import json
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_prioritize_skill_gaps():
    """Test the fixed prioritize_skill_gaps function."""
    
    # Import the function
    from tools.planning_tools import prioritize_skill_gaps
    
    # Test data in list format (what our test is using)
    test_skills_gaps = [
        {
            "skill_name": "Forecasting and Budgeting",
            "gap_severity": "critical",
            "current_level": 2,
            "required_level": 4,
            "skill_type": "technical"
        },
        {
            "skill_name": "Financial Data Analysis", 
            "gap_severity": "critical",
            "current_level": 2,
            "required_level": 5,
            "skill_type": "technical"
        },
        {
            "skill_name": "Financial Modeling",
            "gap_severity": "moderate",
            "current_level": 1,
            "required_level": 4,
            "skill_type": "technical"
        }
    ]
    
    print("🧪 Testing prioritize_skill_gaps with list format...")
    
    try:
        # Convert to JSON string (as the function expects)
        skills_json = json.dumps(test_skills_gaps)
        
        # Call the function
        result = prioritize_skill_gaps(skills_json)
        
        # Parse the result
        prioritized = json.loads(result)
        
        print("✅ Function succeeded!")
        print(f"Raw result: {result[:200]}...")
        
        if 'error' in prioritized:
            print(f"❌ Error in result: {prioritized['error']}")
            return False
            
        gaps_data = prioritized.get('prioritized_gaps', {})
        print(f"Critical priority gaps: {len(gaps_data.get('critical_priority', []))}")
        print(f"High priority gaps: {len(gaps_data.get('high_priority', []))}")
        print(f"Medium priority gaps: {len(gaps_data.get('medium_priority', []))}")
        
        # Show details
        for gap in prioritized.get('critical_priority', []):
            print(f"  Critical: {gap.get('skill_name')} (score: {gap.get('priority_score')})")
        
        for gap in prioritized.get('high_priority', []):
            print(f"  High: {gap.get('skill_name')} (score: {gap.get('priority_score')})")
            
        return True
        
    except Exception as e:
        print(f"❌ Function failed: {e}")
        return False

if __name__ == "__main__":
    success = test_prioritize_skill_gaps()
    if success:
        print("\n🎉 prioritize_skill_gaps fix successful!")
    else:
        print("\n💥 prioritize_skill_gaps still has issues")