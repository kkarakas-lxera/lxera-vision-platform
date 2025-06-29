#!/usr/bin/env python3
"""
Test agent handoffs are working properly with OpenAI SDK
Verifies agents can communicate through the SDK
"""

import os
import sys
import asyncio
import logging
from datetime import datetime
import json

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from lxera_agents import Runner, OFFICIAL_SDK
from course_agents.planning_agent import create_planning_agent
from course_agents.research_agent import create_research_agent
from course_agents.database_agents import create_database_content_agent

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AgentHandoffTester:
    """Test agent handoff functionality."""
    
    def __init__(self):
        self.test_results = {
            "timestamp": datetime.now().isoformat(),
            "sdk_enabled": OFFICIAL_SDK,
            "handoff_tests": [],
            "failures": []
        }
    
    async def test_planning_to_research_handoff(self):
        """Test Planning Agent -> Research Agent handoff."""
        logger.info("\n🔄 TESTING PLANNING -> RESEARCH HANDOFF")
        
        try:
            # Create planning agent with handoff
            planning_agent = create_planning_agent()
            
            # Check current handoffs
            logger.info(f"Planning agent handoffs: {planning_agent.handoffs}")
            
            if not planning_agent.handoffs:
                logger.warning("⚠️ Planning agent has no handoffs defined")
                self.test_results["handoff_tests"].append({
                    "test": "planning_to_research",
                    "status": "failed",
                    "reason": "No handoffs defined"
                })
                return False
            
            # Test input that should trigger handoff
            test_input = """
            Analyze this employee and create a course plan:
            
            Employee: Test Developer
            Skills Gap: Python Advanced Features (Critical)
            
            After creating the plan, hand off to the research agent to gather learning materials.
            """
            
            # Run with SDK
            result = await Runner.run(
                planning_agent,
                test_input,
                max_turns=10
            )
            
            # Check if handoff occurred
            handoff_detected = False
            if hasattr(result, 'messages'):
                for message in result.messages:
                    if hasattr(message, 'content') and 'research' in str(message.content).lower():
                        handoff_detected = True
                        break
            
            if handoff_detected:
                logger.info("✅ Planning -> Research handoff detected")
                self.test_results["handoff_tests"].append({
                    "test": "planning_to_research",
                    "status": "success",
                    "handoff_detected": True
                })
                return True
            else:
                logger.warning("❌ No handoff detected")
                self.test_results["handoff_tests"].append({
                    "test": "planning_to_research",
                    "status": "failed",
                    "reason": "Handoff not triggered"
                })
                return False
                
        except Exception as e:
            logger.error(f"❌ Test failed: {e}")
            self.test_results["failures"].append(f"Planning->Research: {str(e)}")
            return False
    
    async def test_research_to_content_handoff(self):
        """Test Research Agent -> Content Agent handoff."""
        logger.info("\n🔄 TESTING RESEARCH -> CONTENT HANDOFF")
        
        try:
            # Create research agent with handoff
            research_agent = create_research_agent()
            
            # Check current handoffs
            logger.info(f"Research agent handoffs: {research_agent.handoffs}")
            
            if not research_agent.handoffs:
                logger.warning("⚠️ Research agent has no handoffs defined")
                self.test_results["handoff_tests"].append({
                    "test": "research_to_content",
                    "status": "failed",
                    "reason": "No handoffs defined"
                })
                return False
            
            # Test input that should trigger handoff
            test_input = """
            Research materials for "Python Decorators" module.
            Find 2 sources and then hand off to content creation.
            
            Context:
            - Employee: Test Developer
            - Session ID: test-handoff-session
            - Module Priority: High
            """
            
            # Run with SDK
            result = await Runner.run(
                research_agent,
                test_input,
                max_turns=8
            )
            
            # Check if handoff occurred
            handoff_detected = False
            if hasattr(result, 'messages'):
                for message in result.messages:
                    if hasattr(message, 'content') and 'content' in str(message.content).lower():
                        handoff_detected = True
                        break
            
            if handoff_detected:
                logger.info("✅ Research -> Content handoff detected")
                self.test_results["handoff_tests"].append({
                    "test": "research_to_content",
                    "status": "success",
                    "handoff_detected": True
                })
                return True
            else:
                logger.warning("❌ No handoff detected")
                self.test_results["handoff_tests"].append({
                    "test": "research_to_content",
                    "status": "failed",
                    "reason": "Handoff not triggered"
                })
                return False
                
        except Exception as e:
            logger.error(f"❌ Test failed: {e}")
            self.test_results["failures"].append(f"Research->Content: {str(e)}")
            return False
    
    async def test_coordinator_flow(self):
        """Test full coordinator flow with handoffs."""
        logger.info("\n🔄 TESTING COORDINATOR FLOW")
        
        try:
            # Check if coordinator exists
            try:
                from course_agents.coordinator import create_course_generation_coordinator
                coordinator_exists = True
            except ImportError:
                coordinator_exists = False
                logger.warning("⚠️ Coordinator not yet implemented")
            
            if not coordinator_exists:
                self.test_results["handoff_tests"].append({
                    "test": "coordinator_flow",
                    "status": "skipped",
                    "reason": "Coordinator not implemented yet"
                })
                return None
            
            # Create coordinator
            coordinator = create_course_generation_coordinator()
            
            # Test input
            test_input = """
            Generate a complete course for:
            
            Employee: Test Developer
            Role: Senior Python Developer
            Skills Gap: Advanced Python Patterns
            Session ID: test-coordinator-flow
            
            Use all agents in sequence.
            """
            
            # Run coordinator
            result = await Runner.run(
                coordinator,
                test_input,
                max_turns=50  # Allow many turns for full flow
            )
            
            # Analyze execution flow
            agents_executed = set()
            if hasattr(result, 'messages'):
                for message in result.messages:
                    content = str(message.content).lower()
                    if 'planning' in content:
                        agents_executed.add('planning')
                    if 'research' in content:
                        agents_executed.add('research')
                    if 'content' in content:
                        agents_executed.add('content')
                    if 'quality' in content:
                        agents_executed.add('quality')
            
            logger.info(f"Agents executed: {agents_executed}")
            
            if len(agents_executed) >= 3:
                logger.info("✅ Coordinator flow successful")
                self.test_results["handoff_tests"].append({
                    "test": "coordinator_flow",
                    "status": "success",
                    "agents_executed": list(agents_executed)
                })
                return True
            else:
                logger.warning("❌ Incomplete coordinator flow")
                self.test_results["handoff_tests"].append({
                    "test": "coordinator_flow",
                    "status": "partial",
                    "agents_executed": list(agents_executed)
                })
                return False
                
        except Exception as e:
            logger.error(f"❌ Coordinator test failed: {e}")
            self.test_results["failures"].append(f"Coordinator: {str(e)}")
            return False
    
    def generate_report(self):
        """Generate test report."""
        logger.info("\n📊 HANDOFF TEST REPORT")
        logger.info("=" * 60)
        
        # Summary
        total_tests = len(self.test_results["handoff_tests"])
        successful = sum(1 for t in self.test_results["handoff_tests"] if t["status"] == "success")
        failed = sum(1 for t in self.test_results["handoff_tests"] if t["status"] == "failed")
        skipped = sum(1 for t in self.test_results["handoff_tests"] if t["status"] == "skipped")
        
        logger.info(f"Total Tests: {total_tests}")
        logger.info(f"✅ Successful: {successful}")
        logger.info(f"❌ Failed: {failed}")
        logger.info(f"⏭️ Skipped: {skipped}")
        
        # Details
        logger.info("\n📋 Test Details:")
        for test in self.test_results["handoff_tests"]:
            status_emoji = "✅" if test["status"] == "success" else "❌" if test["status"] == "failed" else "⏭️"
            logger.info(f"{status_emoji} {test['test']}: {test['status']}")
            if test.get("reason"):
                logger.info(f"   Reason: {test['reason']}")
            if test.get("agents_executed"):
                logger.info(f"   Agents: {', '.join(test['agents_executed'])}")
        
        # Save report
        os.makedirs('../logs', exist_ok=True)
        report_file = f"../logs/handoff_test_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(self.test_results, f, indent=2)
        
        logger.info(f"\n📄 Report saved to: {report_file}")
        
        # Overall status
        if failed == 0 and successful > 0:
            logger.info("\n✅ ALL HANDOFF TESTS PASSED")
            return True
        elif successful > 0:
            logger.info("\n⚠️ SOME HANDOFF TESTS FAILED")
            return False
        else:
            logger.info("\n❌ NO SUCCESSFUL HANDOFF TESTS")
            return False

async def main():
    """Run all handoff tests."""
    logger.info("🔗 TESTING AGENT HANDOFFS")
    logger.info(f"SDK Status: {'Enabled' if OFFICIAL_SDK else 'Disabled'}")
    
    if not OFFICIAL_SDK:
        logger.error("❌ Official SDK not enabled - handoffs won't work")
        logger.info("Please ensure agents.py is not shadowing the official SDK")
        return False
    
    tester = AgentHandoffTester()
    
    # Run tests
    await tester.test_planning_to_research_handoff()
    await tester.test_research_to_content_handoff()
    await tester.test_coordinator_flow()
    
    # Generate report
    success = tester.generate_report()
    
    return success

if __name__ == "__main__":
    # Check environment
    if not os.getenv('OPENAI_API_KEY'):
        logger.error("❌ OPENAI_API_KEY not set")
        exit(1)
    
    # Run tests
    success = asyncio.run(main())
    exit(0 if success else 1)