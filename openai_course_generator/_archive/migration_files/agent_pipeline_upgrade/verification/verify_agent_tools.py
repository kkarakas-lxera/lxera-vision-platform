#!/usr/bin/env python3
"""
Verify all agent tools are properly connected and functioning
Tests actual tool calls with OpenAI SDK integration
"""

import asyncio
import logging
import os
import sys
import json
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from lxera_agents import Runner, OFFICIAL_SDK
from course_agents.planning_agent import create_planning_agent
from course_agents.research_agent import create_research_agent
from course_agents.database_agents import create_database_content_agent

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AgentToolVerifier:
    """Verify agent tools are working properly."""
    
    def __init__(self):
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "sdk_status": OFFICIAL_SDK,
            "agents_tested": {},
            "tool_calls": [],
            "failures": []
        }
    
    async def verify_planning_tools(self):
        """Verify planning agent tools execute properly."""
        logger.info("\n🔧 VERIFYING PLANNING AGENT TOOLS")
        
        try:
            planning_agent = create_planning_agent()
            logger.info(f"✅ Planning agent created: {planning_agent.name}")
            logger.info(f"   Tools available: {[tool.__name__ for tool in planning_agent.tools]}")
            
            test_input = """
            Test the planning tools with this sample data:
            
            Employee: Test User
            Role: Software Developer
            Skills Gap: Python (Critical), Docker (High)
            
            Please use your tools to:
            1. Analyze the employee profile using analyze_employee_profile
            2. Prioritize skill gaps using prioritize_skill_gaps
            3. Generate a mini course structure using generate_course_structure_plan
            
            Return the results of each tool call.
            """
            
            result = await Runner.run(
                planning_agent,
                test_input,
                max_turns=10
            )
            
            # Log result structure
            logger.info(f"Result type: {type(result)}")
            logger.info(f"Result attributes: {dir(result)}")
            
            # Check for tool execution
            if hasattr(result, 'messages'):
                tool_count = 0
                for message in result.messages:
                    if hasattr(message, 'tool_calls') and message.tool_calls:
                        tool_count += len(message.tool_calls)
                        for tool_call in message.tool_calls:
                            logger.info(f"  ✅ Tool called: {tool_call.function.name}")
                            self.results["tool_calls"].append({
                                "agent": "planning",
                                "tool": tool_call.function.name,
                                "timestamp": datetime.now().isoformat()
                            })
                
                logger.info(f"✅ Planning agent made {tool_count} tool calls")
                self.results["agents_tested"]["planning"] = {
                    "success": True,
                    "tool_calls": tool_count
                }
            else:
                logger.warning("⚠️ Could not verify tool calls - result structure unclear")
                self.results["agents_tested"]["planning"] = {
                    "success": False,
                    "error": "No tool calls detected"
                }
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Planning agent verification failed: {e}")
            self.results["failures"].append(f"Planning agent: {str(e)}")
            return None
    
    async def verify_research_tools(self):
        """Verify research agent tools execute properly."""
        logger.info("\n🔧 VERIFYING RESEARCH AGENT TOOLS")
        
        try:
            research_agent = create_research_agent()
            logger.info(f"✅ Research agent created: {research_agent.name}")
            logger.info(f"   Tools available: {[tool.__name__ for tool in research_agent.tools]}")
            
            test_input = """
            Conduct minimal research on "Python best practices" using your tools.
            Use tavily_search to find one source about Python best practices.
            Keep the search brief to avoid timeouts.
            """
            
            result = await Runner.run(
                research_agent,
                test_input,
                max_turns=5
            )
            
            # Check for tool execution
            if hasattr(result, 'messages'):
                tool_count = 0
                for message in result.messages:
                    if hasattr(message, 'tool_calls') and message.tool_calls:
                        tool_count += len(message.tool_calls)
                        for tool_call in message.tool_calls:
                            logger.info(f"  ✅ Tool called: {tool_call.function.name}")
                            self.results["tool_calls"].append({
                                "agent": "research",
                                "tool": tool_call.function.name,
                                "timestamp": datetime.now().isoformat()
                            })
                
                logger.info(f"✅ Research agent made {tool_count} tool calls")
                self.results["agents_tested"]["research"] = {
                    "success": True,
                    "tool_calls": tool_count
                }
            else:
                logger.warning("⚠️ Could not verify tool calls")
                self.results["agents_tested"]["research"] = {
                    "success": False,
                    "error": "No tool calls detected"
                }
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Research agent verification failed: {e}")
            self.results["failures"].append(f"Research agent: {str(e)}")
            return None
    
    async def verify_content_database_tools(self):
        """Verify content agent database tools."""
        logger.info("\n🔧 VERIFYING CONTENT DATABASE TOOLS")
        
        try:
            content_agent = create_database_content_agent()
            logger.info(f"✅ Content agent created: {content_agent.name}")
            logger.info(f"   Tools available: {[tool.__name__ for tool in content_agent.tools]}")
            
            test_input = """
            Create a test module content entry using your database tools:
            
            Module: Python Best Practices Test Module
            Employee: Test User
            Session: test-verification-session-123
            
            Use create_new_module_content tool with these parameters:
            - module_name: "Python Best Practices Test"
            - employee_name: "Test User"
            - session_id: "test-verification-123"
            - module_spec: {"priority": "test", "duration": "1 hour"}
            - research_context: {"source": "verification test"}
            
            Return the content_id if successful.
            """
            
            result = await Runner.run(
                content_agent,
                test_input,
                max_turns=3
            )
            
            # Check for tool execution
            if hasattr(result, 'messages'):
                tool_count = 0
                for message in result.messages:
                    if hasattr(message, 'tool_calls') and message.tool_calls:
                        tool_count += len(message.tool_calls)
                        for tool_call in message.tool_calls:
                            logger.info(f"  ✅ Tool called: {tool_call.function.name}")
                            self.results["tool_calls"].append({
                                "agent": "content",
                                "tool": tool_call.function.name,
                                "timestamp": datetime.now().isoformat()
                            })
                
                logger.info(f"✅ Content agent made {tool_count} tool calls")
                self.results["agents_tested"]["content"] = {
                    "success": True,
                    "tool_calls": tool_count
                }
            else:
                logger.warning("⚠️ Could not verify tool calls")
                self.results["agents_tested"]["content"] = {
                    "success": False,
                    "error": "No tool calls detected"
                }
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Content agent verification failed: {e}")
            self.results["failures"].append(f"Content agent: {str(e)}")
            return None
    
    def generate_report(self):
        """Generate verification report."""
        logger.info("\n📊 TOOL VERIFICATION SUMMARY")
        logger.info("=" * 60)
        
        # SDK Status
        if self.results["sdk_status"]:
            logger.info("✅ Official OpenAI SDK is active")
        else:
            logger.error("❌ Official SDK not loaded - tracing will not work")
        
        # Agent results
        for agent_name, result in self.results["agents_tested"].items():
            if result["success"]:
                logger.info(f"✅ {agent_name} agent: {result['tool_calls']} tool calls")
            else:
                logger.error(f"❌ {agent_name} agent: {result.get('error', 'Failed')}")
        
        # Total tool calls
        logger.info(f"\n📊 Total tool calls: {len(self.results['tool_calls'])}")
        
        # Tool usage breakdown
        tool_usage = {}
        for call in self.results["tool_calls"]:
            tool_name = call["tool"]
            tool_usage[tool_name] = tool_usage.get(tool_name, 0) + 1
        
        logger.info("\n🔧 Tool Usage Breakdown:")
        for tool, count in tool_usage.items():
            logger.info(f"  - {tool}: {count} calls")
        
        # Save report
        os.makedirs('../logs', exist_ok=True)
        report_file = f"../logs/tool_verification_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(self.results, f, indent=2)
        
        logger.info(f"\n📄 Detailed report saved to: {report_file}")
        
        # Overall status
        total_agents = len(self.results["agents_tested"])
        successful_agents = sum(1 for r in self.results["agents_tested"].values() if r["success"])
        
        if successful_agents == total_agents and self.results["sdk_status"]:
            logger.info("\n✅ ALL AGENT TOOLS VERIFIED SUCCESSFULLY")
            return True
        else:
            logger.error(f"\n❌ VERIFICATION INCOMPLETE: {successful_agents}/{total_agents} agents passed")
            return False

async def main():
    """Run all tool verifications."""
    logger.info("🔍 VERIFYING AGENT TOOL INTEGRATIONS")
    logger.info(f"Current directory: {os.getcwd()}")
    logger.info(f"OpenAI SDK status: {'Active' if OFFICIAL_SDK else 'Not loaded'}")
    
    verifier = AgentToolVerifier()
    
    # Verify each agent's tools
    await verifier.verify_planning_tools()
    await verifier.verify_research_tools()
    await verifier.verify_content_database_tools()
    
    # Generate report
    success = verifier.generate_report()
    
    return success

if __name__ == "__main__":
    # Check environment
    if not os.getenv('OPENAI_API_KEY'):
        logger.error("❌ OPENAI_API_KEY not set")
        logger.info("Please set: export OPENAI_API_KEY=your_key_here")
        exit(1)
    
    # Run verification
    success = asyncio.run(main())
    exit(0 if success else 1)