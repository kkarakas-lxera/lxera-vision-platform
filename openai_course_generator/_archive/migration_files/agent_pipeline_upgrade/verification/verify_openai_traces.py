#!/usr/bin/env python3
"""
Verify OpenAI SDK tracing is working properly
Ensures all agent tool calls appear in OpenAI dashboard
"""

import os
import sys
import logging
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

try:
    from lxera_agents import trace, OFFICIAL_SDK, Trace, Span
    HAS_TRACE = True
except ImportError:
    HAS_TRACE = False
    OFFICIAL_SDK = False
    trace = None

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def verify_sdk_configuration():
    """Verify OpenAI SDK is properly configured."""
    logger.info("🔍 VERIFYING OPENAI SDK CONFIGURATION")
    logger.info("=" * 60)
    
    verification_results = {
        "timestamp": datetime.now().isoformat(),
        "checks": {},
        "recommendations": []
    }
    
    # Check 1: Official SDK loaded
    if OFFICIAL_SDK:
        logger.info("✅ Official OpenAI Agents SDK loaded")
        verification_results["checks"]["sdk_loaded"] = True
    else:
        logger.error("❌ Official SDK not loaded - using fallback")
        verification_results["checks"]["sdk_loaded"] = False
        verification_results["recommendations"].append(
            "Ensure 'agents' package is installed: pip install openai-agents"
        )
    
    # Check 2: Trace imports available
    if HAS_TRACE:
        logger.info("✅ Trace imports successful")
        verification_results["checks"]["trace_imports"] = True
    else:
        logger.error("❌ Could not import trace components")
        verification_results["checks"]["trace_imports"] = False
    
    # Check 3: Environment variables
    if 'OPENAI_AGENTS_DISABLE_TRACING' in os.environ:
        logger.error("❌ Tracing is disabled via OPENAI_AGENTS_DISABLE_TRACING")
        verification_results["checks"]["tracing_enabled"] = False
        verification_results["recommendations"].append(
            "Remove OPENAI_AGENTS_DISABLE_TRACING from environment"
        )
    else:
        logger.info("✅ Tracing not disabled by environment")
        verification_results["checks"]["tracing_enabled"] = True
    
    # Check 4: OpenAI API Key
    if os.getenv('OPENAI_API_KEY'):
        logger.info("✅ OpenAI API key is set")
        verification_results["checks"]["api_key"] = True
    else:
        logger.error("❌ OPENAI_API_KEY not set")
        verification_results["checks"]["api_key"] = False
        verification_results["recommendations"].append(
            "Set OPENAI_API_KEY environment variable"
        )
    
    # Check 5: Test trace context
    if trace and OFFICIAL_SDK:
        try:
            with trace("test_trace"):
                logger.info("✅ Trace context manager working")
            verification_results["checks"]["trace_context"] = True
        except Exception as e:
            logger.error(f"❌ Trace context failed: {e}")
            verification_results["checks"]["trace_context"] = False
            verification_results["recommendations"].append(
                f"Check trace implementation: {str(e)}"
            )
    else:
        logger.warning("⚠️ Cannot test trace context - SDK not loaded")
        verification_results["checks"]["trace_context"] = False
    
    # Check 6: Agent module shadowing
    try:
        import agents
        logger.info("✅ Official 'agents' module can be imported")
        verification_results["checks"]["agents_module"] = True
        
        # Verify it's the official SDK
        if hasattr(agents, 'Agent') and hasattr(agents, 'Runner'):
            logger.info("✅ Official SDK components verified")
        else:
            logger.error("❌ 'agents' module exists but missing SDK components")
            verification_results["checks"]["agents_module"] = False
            verification_results["recommendations"].append(
                "Local 'agents.py' may be shadowing official SDK"
            )
    except ImportError:
        logger.error("❌ Cannot import 'agents' module")
        verification_results["checks"]["agents_module"] = False
        verification_results["recommendations"].append(
            "Install official SDK: pip install openai-agents"
        )
    
    # Check 7: Logging configuration
    if os.getenv('OPENAI_LOG') == 'debug':
        logger.info("✅ OpenAI debug logging enabled")
        verification_results["checks"]["debug_logging"] = True
    else:
        logger.info("ℹ️ OpenAI debug logging not enabled (optional)")
        verification_results["checks"]["debug_logging"] = False
        verification_results["recommendations"].append(
            "Set OPENAI_LOG=debug for detailed trace logs (optional)"
        )
    
    # Summary
    logger.info("\n📊 VERIFICATION SUMMARY")
    logger.info("=" * 60)
    
    passed_checks = sum(1 for v in verification_results["checks"].values() if v)
    total_checks = len(verification_results["checks"])
    
    logger.info(f"Passed: {passed_checks}/{total_checks} checks")
    
    if verification_results["recommendations"]:
        logger.info("\n💡 RECOMMENDATIONS:")
        for rec in verification_results["recommendations"]:
            logger.info(f"  - {rec}")
    
    # Overall status
    all_critical_passed = all([
        verification_results["checks"].get("sdk_loaded", False),
        verification_results["checks"].get("api_key", False),
        verification_results["checks"].get("tracing_enabled", False)
    ])
    
    if all_critical_passed:
        logger.info("\n✅ OpenAI SDK properly configured for tracing")
        logger.info("📍 Check https://platform.openai.com/traces to see agent executions")
        return True
    else:
        logger.error("\n❌ OpenAI SDK configuration issues detected")
        logger.error("🔧 Fix the issues above to enable proper tracing")
        return False

def test_trace_functionality():
    """Test actual trace functionality if available."""
    if not (trace and OFFICIAL_SDK):
        logger.warning("⚠️ Cannot test trace functionality - SDK not available")
        return False
    
    logger.info("\n🧪 TESTING TRACE FUNCTIONALITY")
    logger.info("=" * 60)
    
    try:
        # Test basic trace
        with trace("test_basic_trace") as t:
            logger.info("✅ Basic trace created")
            
            # Test nested trace
            with trace("test_nested_trace") as nested:
                logger.info("✅ Nested trace created")
        
        # Test trace with metadata
        with trace("test_metadata_trace") as t:
            if hasattr(t, 'set_tag'):
                t.set_tag("test_key", "test_value")
                logger.info("✅ Trace metadata set")
            else:
                logger.warning("⚠️ set_tag not available on trace")
        
        logger.info("\n✅ All trace functionality tests passed")
        return True
        
    except Exception as e:
        logger.error(f"\n❌ Trace functionality test failed: {e}")
        return False

if __name__ == "__main__":
    logger.info("🚀 OpenAI SDK Tracing Verification Tool")
    logger.info(f"Timestamp: {datetime.now().isoformat()}")
    logger.info(f"Python Path: {sys.path[0]}")
    
    # Run configuration check
    config_ok = verify_sdk_configuration()
    
    # Run functionality test if config is OK
    if config_ok:
        test_ok = test_trace_functionality()
    else:
        test_ok = False
    
    # Final status
    if config_ok and test_ok:
        logger.info("\n🎉 ALL CHECKS PASSED - Tracing is fully operational")
        exit(0)
    else:
        logger.error("\n⚠️ Some checks failed - see above for details")
        exit(1)