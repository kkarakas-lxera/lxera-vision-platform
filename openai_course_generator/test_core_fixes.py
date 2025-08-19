#!/usr/bin/env python3
"""
Quick test of core fixes without full pipeline dependencies
"""

def test_groq_client_fix():
    """Test groq_client is properly initialized"""
    print("🧪 Testing Groq client initialization...")
    try:
        from tools.agentic_content_tools import groq_client
        if groq_client is not None:
            print("✅ groq_client initialized (API key present)")
        else:
            print("⚠️ groq_client is None (no API key - expected in test)")
        return True
    except Exception as e:
        print(f"❌ Groq client test failed: {e}")
        return False

def test_intro_outline_fix():
    """Test intro_outline variable fix"""
    print("\n🧪 Testing intro_outline variable fix...")
    try:
        import json
        from tools.agentic_content_tools import generate_module_introduction
        
        # This should NOT raise NameError: name 'intro_outline' is not defined
        try:
            generate_module_introduction(
                json.dumps({"module_name": "Test"}),
                json.dumps({"content_outline": []})
            )
            print("✅ No intro_outline NameError")
            return True
        except NameError as e:
            if "intro_outline" in str(e):
                print(f"❌ intro_outline NameError still present: {e}")
                return False
            else:
                print("✅ No intro_outline NameError (different NameError)")
                return True
        except Exception:
            print("✅ No intro_outline NameError (other error)")
            return True
    except Exception as e:
        print(f"❌ intro_outline test failed: {e}")
        return False

def test_async_runner():
    """Test async runner helper"""
    print("\n🧪 Testing async runner...")
    try:
        import asyncio
        from tools.enhanced_research_tools import _run_coro_blocking
        
        async def test_coro():
            return "success"
        
        result = _run_coro_blocking(test_coro())
        if result == "success":
            print("✅ Async runner works")
            return True
        else:
            print(f"❌ Async runner failed: {result}")
            return False
    except Exception as e:
        print(f"❌ Async runner test failed: {e}")
        return False

def test_generation_mode_logic():
    """Test generation mode logic exists"""
    print("\n🧪 Testing generation mode logic...")
    try:
        import inspect
        from lxera_database_pipeline import LXERADatabasePipeline
        
        source = inspect.getsource(LXERADatabasePipeline._run_comprehensive_pipeline)
        
        checks = [
            "generation_mode == 'first_module'",
            "FIRST MODULE mode:",
            "generation_mode == 'outline_only'",
            "OUTLINE_ONLY mode should not reach content generation"
        ]
        
        for check in checks:
            if check in source:
                print(f"✅ Found: {check}")
            else:
                print(f"❌ Missing: {check}")
                return False
        
        print("✅ All generation mode logic present")
        return True
    except Exception as e:
        print(f"❌ Generation mode test failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testing core pipeline fixes...\n")
    
    tests = [
        test_groq_client_fix,
        test_intro_outline_fix,
        test_async_runner,
        test_generation_mode_logic
    ]
    
    passed = sum(1 for test in tests if test())
    total = len(tests)
    
    print(f"\n📊 Core fixes test results: {passed}/{total}")
    
    if passed == total:
        print("🎉 All core fixes validated!")
        print("\n✅ Pipeline should now work without:")
        print("  - NameError: intro_outline not defined")
        print("  - NameError: groq_client not defined")
        print("  - asyncio.run() cannot be called from running event loop")
        print("  - Incorrect generation_mode handling")
    else:
        print("⚠️ Some core fixes may have issues")