#!/usr/bin/env python3
"""
Enhanced Multimedia Pipeline Test Runner

This script runs comprehensive tests of the multimedia pipeline with real employee data.
It monitors:
- Database connectivity and queries
- GPT-4 script generation and optimization
- Audio narrative generation
- Slide creation and visual output
- Video assembly and performance
- Complete pipeline integration

Usage:
    python run_enhanced_test.py

Requirements:
- OPENAI_API_KEY environment variable
- VITE_SUPABASE_URL environment variable  
- SUPABASE_SERVICE_ROLE_KEY environment variable
- Database with real employee and module data
"""

import os
import sys
import asyncio
import logging
from pathlib import Path

# Setup enhanced logging
def setup_logging():
    """Setup comprehensive logging for the test"""
    
    # Create logs directory
    log_dir = Path("test_logs")
    log_dir.mkdir(exist_ok=True)
    
    # Setup logger
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    # Console handler with colors
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_format = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    console_handler.setFormatter(console_format)
    
    # File handler for detailed logs
    file_handler = logging.FileHandler(
        log_dir / f"pipeline_test_{asyncio.get_event_loop().time():.0f}.log"
    )
    file_handler.setLevel(logging.DEBUG)
    file_format = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
    )
    file_handler.setFormatter(file_format)
    
    # Add handlers
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)
    
    return logger

def check_environment():
    """Check required environment variables and dependencies"""
    
    logger = logging.getLogger(__name__)
    
    logger.info("🔍 Checking environment setup...")
    
    # Check environment variables
    required_vars = [
        'OPENAI_API_KEY',
        'VITE_SUPABASE_URL', 
        'SUPABASE_SERVICE_ROLE_KEY'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
        else:
            # Show partial key for verification (mask most of it)
            value = os.getenv(var)
            masked_value = value[:8] + "*" * (len(value) - 12) + value[-4:] if len(value) > 12 else "*" * len(value)
            logger.info(f"✅ {var}: {masked_value}")
    
    if missing_vars:
        logger.error(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        logger.error("Please set these environment variables before running the test:")
        for var in missing_vars:
            logger.error(f"   export {var}=your_value_here")
        return False
    
    # Check Python packages
    logger.info("📦 Checking Python dependencies...")
    try:
        import openai
        import supabase
        logger.info(f"✅ OpenAI SDK: {openai.__version__}")
        logger.info(f"✅ Supabase: {supabase.__version__}")
    except ImportError as e:
        logger.error(f"❌ Missing Python package: {e}")
        logger.error("Please install required packages:")
        logger.error("   pip install openai supabase")
        return False
    
    logger.info("✅ Environment setup complete")
    return True

async def main():
    """Main test runner"""
    
    # Setup logging
    logger = setup_logging()
    
    logger.info("🚀 Starting Enhanced Multimedia Pipeline Test")
    logger.info("=" * 80)
    
    # Check environment
    if not check_environment():
        logger.error("❌ Environment check failed. Exiting.")
        sys.exit(1)
    
    # Import and run the enhanced test
    try:
        logger.info("📥 Importing multimedia pipeline components...")
        
        # Add current directory to path for imports
        sys.path.insert(0, str(Path(__file__).parent))
        
        from generate_course_video import main as pipeline_test
        
        logger.info("🎬 Starting pipeline test...")
        await pipeline_test()
        
    except KeyboardInterrupt:
        logger.info("⏹️  Test interrupted by user")
    except Exception as e:
        logger.error(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    logger.info("🏁 Test runner complete")

if __name__ == "__main__":
    asyncio.run(main())