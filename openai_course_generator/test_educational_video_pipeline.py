#!/usr/bin/env python3
"""
Test Educational Video Pipeline
Simulates the multimedia agent taking over after content generation
"""

import os
import sys
import json
import logging
import asyncio
import threading
import time
from datetime import datetime

# Setup logging
log_file = f"educational_video_test_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def simulate_multimedia_agent():
    """Simulate the multimedia agent workflow"""
    logger.info("=" * 80)
    logger.info("MULTIMEDIA AGENT SIMULATION STARTED")
    logger.info("=" * 80)
    
    # Simulate content generation completion
    content_id = "c3225098-53f4-4b01-b162-d9ff9c795629"  # Business Performance Reporting
    employee_name = "Kubilay Cenk Karakas"
    employee_role = "Junior Financial Analyst"
    
    logger.info(f"Content Generation Complete for: {content_id}")
    logger.info(f"Employee: {employee_name}")
    logger.info(f"Role: {employee_role}")
    logger.info("Multimedia Agent taking over...")
    
    try:
        # Import multimedia tools
        from tools.multimedia_tools import (
            create_course_multimedia_session,
            generate_educational_video,
            finalize_multimedia_package
        )
        
        # Step 1: Create multimedia session
        logger.info("\n[STEP 1] Creating multimedia session...")
        session_data = create_course_multimedia_session(
            execution_id="exec_" + datetime.now().strftime('%Y%m%d_%H%M%S'),
            course_id=content_id,
            employee_name=employee_name,
            employee_id="kubilaycan_001",
            course_title="Business Performance Reporting",
            total_modules=1,
            personalization_level="advanced"
        )
        
        session_result = json.loads(session_data)
        session_id = session_result.get('session_id', 'unknown')
        logger.info(f"Session created: {session_id}")
        
        # Step 2: Generate educational video
        logger.info("\n[STEP 2] Generating educational video...")
        logger.info("This will:")
        logger.info("  - Generate educational script with learning objectives")
        logger.info("  - Extract slide content with speaker notes")
        logger.info("  - Create professional slides")
        logger.info("  - Generate OpenAI TTS narration")
        logger.info("  - Assemble video with transitions")
        
        video_result = generate_educational_video(
            content_id=content_id,
            session_id=session_id,
            employee_name=employee_name,
            employee_role=employee_role,
            voice="nova",  # Warm and friendly for education
            speed=1.0,
            design_theme="professional",
            target_duration=10  # 10 minute target
        )
        
        video_data = json.loads(video_result)
        
        if video_data.get('success'):
            logger.info("\n✅ VIDEO GENERATION SUCCESSFUL!")
            logger.info(f"Module: {video_data.get('module_name')}")
            logger.info(f"Duration: {video_data.get('duration_formatted')}")
            logger.info(f"Slides: {video_data.get('slide_count')}")
            logger.info(f"Video Path: {video_data.get('video_path')}")
            logger.info(f"Video URL: {video_data.get('video_url')}")
            
            # Log assets
            assets = video_data.get('assets', {})
            logger.info("\nGenerated Assets:")
            for asset_type, asset_url in assets.items():
                logger.info(f"  - {asset_type}: {asset_url}")
        else:
            logger.error(f"\n❌ VIDEO GENERATION FAILED: {video_data.get('error')}")
            return
        
        # Step 3: Finalize multimedia package
        logger.info("\n[STEP 3] Finalizing multimedia package...")
        finalize_result = finalize_multimedia_package(
            session_id=session_id,
            delivery_format="integrated",
            include_analytics=True
        )
        
        final_data = json.loads(finalize_result)
        
        if final_data.get('success'):
            logger.info("✅ Multimedia package finalized!")
            logger.info(f"Total assets: {final_data.get('total_assets', 0)}")
            logger.info(f"Package ready: {final_data.get('package_ready', False)}")
        
        logger.info("\n" + "=" * 80)
        logger.info("MULTIMEDIA AGENT SIMULATION COMPLETE")
        logger.info(f"Log file: {log_file}")
        logger.info("=" * 80)
        
    except Exception as e:
        logger.error(f"CRITICAL ERROR: {str(e)}", exc_info=True)
        logger.error("Pipeline failed!")

def run_async_test():
    """Run the test in a separate thread"""
    thread = threading.Thread(target=simulate_multimedia_agent, daemon=True)
    thread.start()
    
    # Report progress every 5 seconds
    for i in range(3):  # 15 seconds total
        time.sleep(5)
        logger.info(f"\n[PROGRESS REPORT {i+1}/3] Pipeline running... Check log file: {log_file}")
    
    logger.info("\n[FINAL REPORT] Check the complete log file for full details:")
    logger.info(f"Log location: {os.path.abspath(log_file)}")
    
    # Keep thread alive a bit longer to complete
    time.sleep(5)

if __name__ == "__main__":
    logger.info("Starting Educational Video Pipeline Test")
    logger.info(f"Timestamp: {datetime.now().isoformat()}")
    logger.info(f"Log file: {os.path.abspath(log_file)}")
    
    run_async_test()