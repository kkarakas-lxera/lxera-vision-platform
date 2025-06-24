#!/usr/bin/env python3
"""
Start Monitoring Demo - Launches dashboard and runs test
"""

import subprocess
import time
import threading
import webbrowser
from pathlib import Path

def start_dashboard():
    """Start the monitoring dashboard in background."""
    print("🌐 Starting monitoring dashboard...")
    subprocess.run(["python", "web_monitoring_dashboard.py"], cwd=Path(__file__).parent)

def run_test_after_delay():
    """Run test after dashboard has time to start."""
    print("⏳ Waiting for dashboard to start...")
    time.sleep(3)
    
    print("🌐 Opening dashboard in browser...")
    webbrowser.open("http://localhost:5000")
    
    time.sleep(2)
    print("🚀 Starting monitored content generation test...")
    subprocess.run(["python", "monitored_content_system.py"], cwd=Path(__file__).parent)

def main():
    """Main demo launcher."""
    print("🔬 Agent Monitoring Demo")
    print("=" * 50)
    print("This demo will:")
    print("1. Start the real-time monitoring dashboard")
    print("2. Open it in your browser")
    print("3. Run a test content generation with monitoring")
    print("=" * 50)
    
    # Start dashboard in background thread
    dashboard_thread = threading.Thread(target=start_dashboard, daemon=True)
    dashboard_thread.start()
    
    # Run test after delay
    run_test_after_delay()

if __name__ == "__main__":
    main()