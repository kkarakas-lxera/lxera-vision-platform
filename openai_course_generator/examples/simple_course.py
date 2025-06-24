"""Simple course generation example using OpenAI Agents."""

import os
import sys
import asyncio
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from workflow.course_runner import generate_course_sync
from config.settings import get_settings


def main():
    """Generate a simple course using OpenAI Agents workflow."""
    
    print("🚀 OpenAI Agents Course Generator - Simple Example")
    print("=" * 60)
    
    # Sample employee data (using your existing format)
    employee_data = {
        "employee_id": "KK001",
        "full_name": "Kubilaycan Karakas",
        "job_title_current": "Junior Financial Analyst",
        "job_title_specific": "Junior Financial Analyst - Business Performance Reporting",
        "career_aspirations_next_role": "Senior Financial Analyst",
        "skills": [
            "Financial Modeling",
            "Excel Analysis", 
            "Data Analysis",
            "Business Intelligence",
            "Report Generation"
        ],
        "skill_gaps": [
            "Advanced Financial Analysis",
            "Investment Evaluation",
            "Risk Assessment",
            "Strategic Planning"
        ],
        "tools_software_used_regularly": [
            "Microsoft Excel",
            "Power BI",
            "SQL",
            "Python"
        ],
        "key_responsibilities_tasks": [
            "Create monthly financial reports",
            "Analyze business performance metrics",
            "Support budget planning process",
            "Prepare variance analysis reports"
        ],
        "company_strategic_priorities": [
            "Digital transformation",
            "Cost optimization",
            "Data-driven decision making"
        ]
    }
    
    # Course requirements 
    course_requirements = {
        "course_title": "Financial Analysis Mastery for Business Performance",
        "total_modules": 4,  # Simplified for demo
        "target_weeks": 1,
        "modules_per_week": 4,
        "learning_time_target_hours": 4,
        "course_objectives": [
            "Master financial statement analysis techniques",
            "Develop ratio analysis and interpretation skills", 
            "Apply cash flow analysis methods",
            "Build confidence in financial decision-making"
        ],
        "complexity_level": "intermediate"
    }
    
    print(f"👤 Employee: {employee_data['full_name']}")
    print(f"🎯 Current Role: {employee_data['job_title_specific']}")
    print(f"📈 Career Goal: {employee_data['career_aspirations_next_role']}")
    print(f"📚 Course: {course_requirements['course_title']}")
    print(f"📖 Modules: {course_requirements['total_modules']}")
    print()
    
    # Check environment
    settings = get_settings()
    if not settings.openai_api_key:
        print("❌ Error: OPENAI_API_KEY not found in environment")
        print("Please set your OpenAI API key in .env file")
        return
    
    print("✅ Environment configured")
    print("🤖 Starting OpenAI Agents course generation...")
    print()
    
    try:
        # Generate course using OpenAI Agents
        # This single call replaces the entire LangGraph complexity!
        result = generate_course_sync(
            employee_data=employee_data,
            course_requirements=course_requirements,
            output_dir="./examples/output"
        )
        
        if result["success"]:
            print("🎉 Course Generation Successful!")
            print(f"⏱️  Duration: {result['duration_minutes']:.1f} minutes")
            print(f"📁 Output: {len(result['output_files'])} files generated")
            print()
            
            # Show agent workflow result
            print("📋 Agent Workflow Result:")
            print("-" * 40)
            agent_output = result.get("agent_workflow_result", "No output available")
            if len(agent_output) > 500:
                print(f"{agent_output[:500]}...")
                print(f"[Truncated - full output in {result['output_files'][0]}]")
            else:
                print(agent_output)
            print()
            
            # Show comparison with LangGraph
            print("🔄 Migration Benefits Achieved:")
            print("✅ Orchestration: 15 nodes → Single agent conversation")
            print("✅ Routing Logic: Complex conditionals → Agent decisions") 
            print("✅ State Management: 400+ lines → Automatic handling")
            print("✅ Error Handling: Custom recovery → Built-in retries")
            print("✅ Debugging: Graph traces → Clear conversation logs")
            print()
            
            if result.get("output_files"):
                print(f"📁 Generated Files:")
                for file_path in result["output_files"]:
                    print(f"   {file_path}")
            
        else:
            print("❌ Course Generation Failed!")
            print(f"Error: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"💥 Unexpected error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()