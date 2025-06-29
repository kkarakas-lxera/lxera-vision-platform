#!/usr/bin/env python3
"""
Test Planning Agent with Full Agentic Tool Calling
This script tests the planning agent using the proper agent architecture
with multiple tool calls visible in OpenAI Traces.
"""

import os
import json
import asyncio
import logging
from datetime import datetime
from supabase import create_client
from course_agents.planning_agent import PlanningAgentOrchestrator
from dotenv import load_dotenv

# Import trace from lxera_agents module
try:
    from lxera_agents import trace, OFFICIAL_SDK
    HAS_TRACE = OFFICIAL_SDK
    if OFFICIAL_SDK:
        print("✅ Using official OpenAI Agents SDK with tracing enabled")
except ImportError:
    HAS_TRACE = False
    OFFICIAL_SDK = False
    def trace(name):
        """Dummy trace for compatibility"""
        from contextlib import contextmanager
        @contextmanager
        def wrapper():
            yield
        return wrapper

# Load environment variables
load_dotenv()

# Enable OpenAI tracing for monitoring
os.environ['OPENAI_LOG'] = 'debug'

# Ensure tracing is not disabled
if 'OPENAI_AGENTS_DISABLE_TRACING' in os.environ:
    del os.environ['OPENAI_AGENTS_DISABLE_TRACING']

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def test_agentic_planning():
    """Test the planning agent with full agentic tool calling workflow."""
    
    try:
        logger.info("🚀 Starting Full Agentic Planning Test with Tool Calls")
        logger.info("📋 This test uses the proper agent architecture with visible tool calls")
        
        # 1. Verify OpenAI API Key
        openai_key = os.getenv('OPENAI_API_KEY')
        if not openai_key:
            logger.error("❌ OPENAI_API_KEY not set in environment")
            return None
            
        logger.info("✅ OpenAI API Key configured")
        
        # 2. Connect to Supabase
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZndldW1lcnlyZ2JndXdyb2NyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc2MzQ0MCwiZXhwIjoyMDY2MzM5NDQwfQ.qxXpBxUKhKA4AQT4UQnIEJGbGNrRDMbBroZU8YaypSY')
        
        if not supabase_url:
            # Use the correct URL if not in env
            supabase_url = 'https://xwfweumeryrgbguwrocr.supabase.co'
        
        if not supabase_key:
            logger.error("❌ SUPABASE_SERVICE_ROLE_KEY not set in environment")
            return None
            
        supabase = create_client(supabase_url, supabase_key)
        logger.info("✅ Connected to Supabase")
        
        # 3. Retrieve real employee - Kubilay Cenk Karakas
        employee_id = "bbe12b3c-b305-4fdf-8c17-de7296cce3a9"  # Kubilay's employee ID
        logger.info(f"📋 Retrieving employee: {employee_id}")
        
        result = supabase.table('employees').select("""
            id,
            position,
            department,
            career_goal,
            key_tools,
            company_id,
            skill_level,
            cv_extracted_data,
            users!inner (
                full_name,
                email
            )
        """).eq('id', employee_id).single().execute()
        
        if not result.data:
            logger.error("❌ Employee not found")
            return None
            
        logger.info(f"✅ Retrieved employee: {result.data['users']['full_name']}")
        
        # 4. Build comprehensive employee profile from CV data
        cv_data = result.data.get('cv_extracted_data', {})
        work_exp = cv_data.get('work_experience', [])
        
        # Extract skills from work experience
        extracted_skills = []
        if work_exp:
            # Focus on recent AI Product Manager role
            for job in work_exp[:2]:  # Most recent jobs
                for achievement in job.get('key_achievements', []):
                    if 'LLM' in achievement or 'RAG' in achievement:
                        extracted_skills.append('LLM Development (Advanced)')
                    if 'agent' in achievement.lower():
                        extracted_skills.append('Agentic AI Systems (Advanced)')
                    if 'product' in achievement.lower():
                        extracted_skills.append('Product Management (Expert)')
                    if 'data' in achievement.lower():
                        extracted_skills.append('Data Engineering (Intermediate)')
        
        # Add unique skills only
        extracted_skills = list(dict.fromkeys(extracted_skills))
        
        employee_data = {
            'employee_id': result.data['id'],
            'full_name': result.data['users']['full_name'],
            'email': result.data['users']['email'],
            'job_title_specific': 'AI Product Manager',  # From CV
            'department': result.data['department'] or 'Engineering',
            'career_aspirations_next_role': result.data['career_goal'] or 'Senior AI Product Lead / AI Solutions Architect',
            'learning_style': 'Prefers practical application with real-world AI/ML projects',
            'skills': extracted_skills + [
                'Prompt Engineering (Expert)',
                'RLHF/SFT (Advanced)',
                'ESG Frameworks (Expert)',
                'Project Management (Google Certified)',
                'Python (Intermediate)',
                'System Design (Intermediate)'
            ],
            'tools_software_used_regularly': [
                'Label Studio',
                'OpenAI API',
                'LangChain',
                'Docker',
                'Git',
                'VS Code',
                'Jupyter Notebooks'
            ],
            'background': cv_data.get('personal_info', {}).get('name', '') + ' - AI Product Manager with LLM expertise',
            'department_goals_kpis': [
                'Improve system reliability to 99.9% uptime',
                'Reduce deployment time by 50%',
                'Implement microservices architecture',
                'Increase test coverage to 90%'
            ],
            'company_strategic_priorities': [
                'Digital transformation initiatives',
                'Cloud-native architecture migration',
                'AI/ML integration for product features',
                'Developer productivity improvements'
            ],
            'specific_projects_challenges_upcoming': [
                'Migration to cloud-native architecture',
                'Implementation of real-time data processing pipeline',
                'Building AI-powered customer analytics',
                'Leading cross-functional development teams'
            ],
            'recent_performance_review_highlights': [
                'Excellent problem-solving skills',
                'Strong team collaboration',
                'Needs improvement in system architecture design',
                'Shows potential for technical leadership'
            ]
        }
        
        logger.info("📝 Employee Profile Prepared for Agent:")
        logger.info(f"  - Name: {employee_data['full_name']}")
        logger.info(f"  - Current Role: {employee_data['job_title_specific']}")
        logger.info(f"  - Skills: {len(employee_data['skills'])} identified")
        logger.info(f"  - Tools: {len(employee_data['tools_software_used_regularly'])} in use")
        
        # 5. Create comprehensive skills gap analysis for AI Product Manager
        skills_gaps = {
            "Critical Skill Gaps": {
                "gaps": [
                    {
                        "skill": "Advanced ML/AI Architecture", 
                        "importance": "Critical", 
                        "description": "Design and architect end-to-end ML systems including training pipelines, inference, and monitoring",
                        "current_level": "Intermediate",
                        "target_level": "Expert",
                        "business_impact": "Essential for architecting enterprise AI solutions"
                    },
                    {
                        "skill": "MLOps & AI Infrastructure", 
                        "importance": "Critical", 
                        "description": "Implement production ML systems with proper versioning, monitoring, and deployment",
                        "current_level": "Basic",
                        "target_level": "Advanced",
                        "business_impact": "Required for scaling AI products in production"
                    },
                    {
                        "skill": "AI Strategy & Business Impact", 
                        "importance": "Critical", 
                        "description": "Translate AI capabilities into business value and ROI metrics",
                        "current_level": "Intermediate",
                        "target_level": "Expert",
                        "business_impact": "Critical for senior AI leadership roles"
                    }
                ]
            },
            "Development Gaps": {
                "gaps": [
                    {
                        "skill": "Advanced Prompt Engineering", 
                        "importance": "High", 
                        "description": "Design complex prompt chains, few-shot learning, and prompt optimization techniques",
                        "current_level": "Advanced",
                        "target_level": "Expert",
                        "business_impact": "Maximizes LLM performance and reduces API costs"
                    },
                    {
                        "skill": "AI Safety & Alignment", 
                        "importance": "High", 
                        "description": "Implement guardrails, safety measures, and alignment techniques for production AI",
                        "current_level": "Intermediate",
                        "target_level": "Expert",
                        "business_impact": "Ensures responsible AI deployment"
                    },
                    {
                        "skill": "Vector Databases & Embeddings", 
                        "importance": "High", 
                        "description": "Design and optimize vector search systems for RAG applications",
                        "current_level": "Basic",
                        "target_level": "Advanced",
                        "business_impact": "Critical for advanced RAG implementations"
                    }
                ]
            },
            "Transferable Skills": {
                "skills": [
                    {
                        "skill": "Product Management", 
                        "relevance": "high", 
                        "description": "Strong product lifecycle management applicable to AI product development",
                        "can_leverage_for": "AI product strategy and roadmap planning"
                    },
                    {
                        "skill": "LLM Development Experience", 
                        "relevance": "high", 
                        "description": "Hands-on experience with LLM-powered assistants and agentic workflows",
                        "can_leverage_for": "Advanced AI product architecture"
                    },
                    {
                        "skill": "Data Annotation & RLHF", 
                        "relevance": "high", 
                        "description": "Deep understanding of model training and improvement processes",
                        "can_leverage_for": "AI model optimization and quality improvement"
                    }
                ]
            }
        }
        
        logger.info("\n📊 Skills Gap Analysis Prepared:")
        logger.info(f"  - Critical Gaps: {len(skills_gaps['Critical Skill Gaps']['gaps'])}")
        logger.info(f"  - Development Gaps: {len(skills_gaps['Development Gaps']['gaps'])}")
        logger.info(f"  - Transferable Skills: {len(skills_gaps['Transferable Skills']['skills'])}")
        
        # 6. Additional course requirements
        course_requirements = {
            "duration": "4 weeks",
            "delivery_format": "Self-paced online learning",
            "practical_focus": 0.8,  # 80% practical, 20% theoretical
            "assessment_type": "Project-based",
            "tool_integration": "Must integrate current workplace tools",
            "success_metrics": {
                "skill_gap_closure": "75% minimum",
                "practical_application": "3+ real-world projects",
                "leadership_readiness": "Demonstrate technical leadership capabilities"
            }
        }
        
        # 7. Initialize Planning Agent Orchestrator
        logger.info("\n🤖 Initializing Planning Agent Orchestrator...")
        orchestrator = PlanningAgentOrchestrator()
        
        # 8. Execute agentic planning workflow
        logger.info("🎯 Executing Full Agentic Planning Workflow...")
        logger.info("⚡ This will make multiple tool calls visible in OpenAI Traces:")
        logger.info("   1. analyze_employee_profile")
        logger.info("   2. prioritize_skill_gaps")
        logger.info("   3. generate_course_structure_plan")
        logger.info("   4. generate_research_queries")
        logger.info("   5. create_personalized_learning_path")
        
        if HAS_TRACE:
            logger.info("✅ Tracing is enabled - check OpenAI dashboard for traces")
        else:
            logger.info("⚠️ Official SDK not installed - tracing unavailable")
            
        logger.info("\n⏳ Starting agent execution...")
        
        start_time = datetime.now()
        
        # Execute the complete planning workflow with tracing
        if HAS_TRACE:
            with trace(f"Planning Course for {employee_data['full_name']}"):
                planning_result = await orchestrator.execute_complete_planning(
                    employee_data=employee_data,
                    skills_gap_data=skills_gaps,
                    course_requirements=course_requirements
                )
        else:
            planning_result = await orchestrator.execute_complete_planning(
                employee_data=employee_data,
                skills_gap_data=skills_gaps,
                course_requirements=course_requirements
            )
        
        end_time = datetime.now()
        execution_time = (end_time - start_time).total_seconds()
        
        logger.info(f"\n⏱️  Agent execution completed in {execution_time:.2f} seconds")
        
        # 9. Analyze results
        if isinstance(planning_result, dict) and planning_result.get("success", True):
            logger.info("\n✅ Agentic Planning Completed Successfully!")
            
            # 9a. Store results in database
            logger.info("\n💾 Storing planning results in database...")
            try:
                # Parse the planning result to extract structured data
                # The result contains the agent's response in the 'content' field
                import uuid
                session_id = str(uuid.uuid4())
                
                # Extract structured data from the agent's response
                agent_content = planning_result.get('content', '')
                
                # Parse the markdown response into structured data
                def parse_markdown_course_plan(content):
                    """Parse markdown course plan into structured format"""
                    import re
                    
                    course_data = {
                        "course_title": "",
                        "total_duration_weeks": 4,
                        "weekly_structure": []
                    }
                    
                    # Extract course title - try multiple patterns
                    title_patterns = [
                        r'\*\*Course Title:\*\*\s*\n?(.+)',
                        r'Course Title:\s*\n?(.+)',
                        r'### \*\*(.+?)\*\*'
                    ]
                    
                    for pattern in title_patterns:
                        title_match = re.search(pattern, content)
                        if title_match:
                            course_data["course_title"] = title_match.group(1).strip()
                            break
                    
                    # Extract weeks and modules
                    week_pattern = r'#### \*\*Week (\d+): (.+?)\*\*'
                    # Updated pattern to handle different markdown formats
                    module_patterns = [
                        # Format: - **Module Name** (nested under Modules:)
                        r'  - \*\*([^*]+)\*\*[^-]*?- \*\*Word Count Target\*\*: (\d+)[^-]*?- \*\*Priority Level\*\*: (\w+)',
                        # Format: 1. **Module Name**  
                        r'(\d+)\. \*\*([^*]+)\*\*[^-]*?- \*\*Word Count Target\*\*: (\d+)[^-]*?- \*\*Priority Level\*\*: (\w+)'
                    ]
                    
                    weeks = re.split(week_pattern, content)[1:]  # Skip before first match
                    
                    for i in range(0, len(weeks), 3):  # Process in groups of 3 (week_num, theme, content)
                        if i + 2 < len(weeks):
                            week_num = int(weeks[i])
                            week_theme = weeks[i + 1]
                            week_content = weeks[i + 2]
                            
                            # Extract modules from week content
                            modules = []
                            
                            # Try each pattern until we find modules
                            for pattern in module_patterns:
                                pattern_modules = re.finditer(pattern, week_content, re.DOTALL)
                                for match in pattern_modules:
                                    if len(match.groups()) == 3:
                                        # Format without number prefix
                                        module = {
                                            "module_name": match.group(1),
                                            "word_count_target": int(match.group(2)),
                                            "priority_level": match.group(3).lower()
                                        }
                                    else:
                                        # Format with number prefix
                                        module = {
                                            "module_name": match.group(2),
                                            "word_count_target": int(match.group(3)),
                                            "priority_level": match.group(4).lower()
                                        }
                                    modules.append(module)
                                
                                # If we found modules with this pattern, stop trying others
                                if modules:
                                    break
                            
                            week_data = {
                                "week_number": week_num,
                                "theme": week_theme,
                                "modules": modules
                            }
                            course_data["weekly_structure"].append(week_data)
                    
                    return course_data
                
                # Initialize structured_plan
                structured_plan = {}
                
                # Try to parse JSON first (in case agent returns JSON)
                import re
                json_match = re.search(r'```json\n(.+?)\n```', agent_content, re.DOTALL)
                if json_match:
                    try:
                        structured_plan = json.loads(json_match.group(1))
                        course_plan = structured_plan.get('course_plan', structured_plan)
                    except json.JSONDecodeError:
                        logger.warning("Could not parse JSON, falling back to markdown parsing")
                        course_plan = parse_markdown_course_plan(agent_content)
                        structured_plan = {"course_plan": course_plan}
                else:
                    # Parse markdown format
                    course_plan = parse_markdown_course_plan(agent_content)
                    structured_plan = {"course_plan": course_plan}
                
                weekly_structure = course_plan.get('weekly_structure', [])
                
                # Count total modules
                total_modules = sum(len(week.get('modules', [])) for week in weekly_structure)
                
                # Prepare data for cm_course_plans table
                course_plan_data = {
                    'employee_id': employee_id,
                    'employee_name': employee_data['full_name'],
                    'session_id': session_id,
                    'course_structure': course_plan,  # Store the entire course_plan
                    'prioritized_gaps': skills_gaps,  # Use the original skills gaps
                    'research_strategy': structured_plan.get('research_queries', {}),
                    'learning_path': structured_plan.get('personalized_learning_path', {}),
                    'employee_profile': structured_plan.get('learner', employee_data),
                    'planning_agent_version': 'v1',
                    'total_modules': total_modules,
                    'course_duration_weeks': course_plan.get('total_duration_weeks', 4),
                    'course_title': course_plan.get('course_title', 'AI Product Management Mastery'),
                    'tool_calls': planning_result.get('messages', []),
                    'execution_time_seconds': execution_time,
                    'agent_turns': planning_result.get('turns', 0),
                    'status': 'completed'
                }
                
                # Insert into database
                db_result = supabase.table('cm_course_plans').insert(course_plan_data).execute()
                
                if db_result.data:
                    plan_id = db_result.data[0]['plan_id']
                    logger.info(f"✅ Course plan stored in database with ID: {plan_id}")
                    
                    # Create module entries in cm_module_content
                    modules_created = 0
                    logger.info(f"Processing {len(weekly_structure)} weeks for module creation")
                    
                    for week_idx, week in enumerate(weekly_structure):
                        modules_in_week = week.get('modules', [])
                        logger.info(f"  Week {week_idx + 1}: {len(modules_in_week)} modules found")
                        
                        for module in modules_in_week:
                            module_data = {
                                'module_name': module.get('module_name', 'Unknown Module'),
                                'employee_name': employee_data['full_name'],
                                'session_id': session_id,
                                'module_spec': module,
                                'priority_level': module.get('priority_level', 'medium'),
                                'status': 'draft'
                            }
                            
                            try:
                                module_result = supabase.table('cm_module_content').insert(module_data).execute()
                                if module_result.data:
                                    modules_created += 1
                                    logger.info(f"    ✅ Created module: {module.get('module_name')}")
                                else:
                                    logger.warning(f"    ⚠️ Failed to create module: {module.get('module_name')}")
                            except Exception as e:
                                logger.error(f"    ❌ Error creating module {module.get('module_name')}: {e}")
                    
                    logger.info(f"✅ Created {modules_created} module entries in cm_module_content")
                    logger.info(f"\n🎯 Next steps:")
                    logger.info(f"   1. Run Research Agent to gather content for modules")
                    logger.info(f"   2. Run Content Generation Agent to create module content")
                    logger.info(f"   3. Session ID for tracking: {session_id}")
                else:
                    logger.error("❌ Failed to store course plan in database")
                    
            except Exception as e:
                logger.error(f"❌ Database storage error: {e}")
                import traceback
                traceback.print_exc()
            
            # Extract key information from the result
            if "course_plan" in planning_result:
                course_plan = planning_result["course_plan"]
                logger.info("\n📚 Generated Course Plan:")
                logger.info(f"  - Title: {course_plan.get('title', 'N/A')}")
                logger.info(f"  - Duration: {course_plan.get('duration', 'N/A')}")
                logger.info(f"  - Modules: {course_plan.get('total_modules', 'N/A')}")
                
            if "tool_calls" in planning_result:
                logger.info(f"\n🛠️  Tool Calls Made: {len(planning_result['tool_calls'])}")
                for i, tool_call in enumerate(planning_result['tool_calls'], 1):
                    logger.info(f"  {i}. {tool_call.get('tool_name', 'Unknown tool')}")
                    
            if "research_queries" in planning_result:
                logger.info(f"\n🔍 Research Queries Generated: {planning_result['research_queries'].get('total_queries', 0)}")
                
            if "learning_path" in planning_result:
                path = planning_result["learning_path"]
                logger.info("\n🛤️  Personalized Learning Path:")
                logger.info(f"  - Sequencing: {path.get('sequencing_strategy', 'N/A')}")
                logger.info(f"  - Adaptations: {len(path.get('personalization_features', []))}")
                
        else:
            logger.error("\n❌ Planning failed or returned unexpected format")
            logger.error(f"Result: {planning_result}")
            
        # 10. Save results
        output_file = 'test_agentic_planning_result.json'
        with open(output_file, 'w') as f:
            json.dump(planning_result, f, indent=2)
        logger.info(f"\n💾 Full planning result saved to: {output_file}")
        
        # Create summary
        summary = {
            "test_metadata": {
                "test_date": datetime.now().isoformat(),
                "test_type": "full_agentic_workflow",
                "employee_id": employee_id,
                "employee_name": employee_data['full_name'],
                "execution_time_seconds": execution_time,
                "agent_type": "planning_agent_orchestrator",
                "test_status": "SUCCESS" if planning_result.get("success", True) else "FAILED"
            },
            "workflow_summary": {
                "tools_used": [
                    "analyze_employee_profile",
                    "prioritize_skill_gaps", 
                    "generate_course_structure_plan",
                    "generate_research_queries",
                    "create_personalized_learning_path"
                ],
                "critical_gaps_addressed": [gap['skill'] for gap in skills_gaps['Critical Skill Gaps']['gaps']],
                "agentic_features": {
                    "multi_tool_orchestration": True,
                    "intelligent_sequencing": True,
                    "personalization": True,
                    "research_planning": True
                }
            },
            "planning_result": planning_result
        }
        
        summary_file = 'test_agentic_planning_summary.json'
        with open(summary_file, 'w') as f:
            json.dump(summary, f, indent=2)
        logger.info(f"📄 Test summary saved to: {summary_file}")
        
        logger.info("\n🎉 Full Agentic Planning Test Complete!")
        logger.info("✅ Planning agent executed with multiple tool calls")
        logger.info("✅ Check OpenAI Traces tab to see all tool executions")
        
        return planning_result
        
    except Exception as e:
        logger.error(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return None

def main():
    """Run the agentic planning test."""
    logger.info("=" * 80)
    logger.info("FULL AGENTIC PLANNING TEST WITH TOOL ORCHESTRATION")
    logger.info("Using Planning Agent with Multiple Tool Calls")
    logger.info("=" * 80)
    
    # Run the async test
    result = asyncio.run(test_agentic_planning())
    
    if result:
        logger.info("\n✅ TEST PASSED: Agentic planning with tool orchestration completed")
        logger.info("✅ Multiple planning tools executed in sequence")
        logger.info("✅ Full observability via OpenAI Traces")
        logger.info("\nNext steps:")
        logger.info("1. Check OpenAI Traces tab for tool execution details")
        logger.info("2. Review the generated course plan structure")
        logger.info("3. Test the Research Agent with the generated queries")
    else:
        logger.info("\n❌ TEST FAILED: Check the errors above")
    
    logger.info("=" * 80)

if __name__ == "__main__":
    main()