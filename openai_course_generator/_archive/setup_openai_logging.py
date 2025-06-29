#!/usr/bin/env python3
"""
OpenAI Setup and Logging Configuration
"""

import os
import logging
from openai import OpenAI

def check_openai_setup():
    """Check and configure OpenAI setup."""
    
    print("🤖 OpenAI Setup Check")
    print("=" * 50)
    
    # Check for API key
    api_key = os.getenv('OPENAI_API_KEY')
    
    if not api_key:
        print("❌ OPENAI_API_KEY not found in environment")
        print("\n💡 To set up OpenAI API logging:")
        print("1. Get your API key from: https://platform.openai.com/api-keys")
        print("2. Set it in your environment:")
        print("   export OPENAI_API_KEY='your-api-key-here'")
        print("3. Or create a .env file with:")
        print("   OPENAI_API_KEY=your-api-key-here")
        print("\n⚠️  Without API key, content generation will be limited")
        return False
    
    # Test API connection
    try:
        print(f"✅ OPENAI_API_KEY found")
        client = OpenAI(api_key=api_key)
        
        # Test with a simple call
        models = client.models.list()
        print(f"✅ OpenAI API connected successfully")
        print(f"📊 Available models: {len(models.data)}")
        
        # Show some model info
        gpt_models = [m for m in models.data if 'gpt' in m.id.lower()][:3]
        if gpt_models:
            print(f"🧠 GPT Models available:")
            for model in gpt_models:
                print(f"   • {model.id}")
        
        return True
        
    except Exception as e:
        print(f"❌ OpenAI API connection failed: {e}")
        print("\n💡 Possible issues:")
        print("• Invalid API key")
        print("• Network connectivity problems") 
        print("• API quota exceeded")
        print("• API service down")
        return False

def enable_detailed_logging():
    """Enable detailed logging for OpenAI calls."""
    
    print("\n📝 Enabling detailed OpenAI logging...")
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler('openai_calls.log')
        ]
    )
    
    # Set OpenAI logger to DEBUG level
    openai_logger = logging.getLogger("openai")
    openai_logger.setLevel(logging.DEBUG)
    
    print("✅ OpenAI logging enabled")
    print("📄 Logs will be saved to: openai_calls.log")
    print("🔍 You can monitor API calls in real-time")

if __name__ == "__main__":
    success = check_openai_setup()
    
    if success:
        enable_detailed_logging()
        print(f"\n🎉 OpenAI setup complete!")
        print(f"✅ Ready to run monitored content generation")
    else:
        print(f"\n⚠️  OpenAI setup incomplete")
        print(f"🔧 Follow the instructions above to enable full functionality")
    
    print(f"\nNext step: Run the integrated test:")
    print(f"python integrated_dashboard_test.py")