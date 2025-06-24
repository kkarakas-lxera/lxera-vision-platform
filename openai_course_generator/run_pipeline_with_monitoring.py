#!/usr/bin/env python3
"""
Run Production Pipeline with Real-time Monitoring
Reports status every 30 seconds with detailed critical phase observation
"""

import asyncio
import subprocess
import time
import sys
import os
import signal
import json
from datetime import datetime
from pathlib import Path

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

class PipelineMonitor:
    def __init__(self):
        self.start_time = time.time()
        self.process = None
        self.log_file = f"production_pipeline_monitored_{int(time.time())}.log"
        self.status_updates = []
        self.critical_phases = {
            "content_generation": False,
            "quality_assessment": False,
            "enhancement_research": False,
            "content_integration": False,
            "database_storage": False
        }
        
    async def run_pipeline(self):
        """Run the pipeline process in background."""
        try:
            # Create log file
            log_path = Path(self.log_file)
            
            # Run the pipeline script
            cmd = [
                sys.executable,
                "test_production_with_timeouts.py"
            ]
            
            print(f"🚀 Starting pipeline process...")
            print(f"📝 Logging to: {self.log_file}")
            print(f"⏱️ Monitoring interval: 30 seconds")
            print("=" * 80)
            
            # Start process with output redirection
            with open(log_path, 'w') as log:
                self.process = subprocess.Popen(
                    cmd,
                    stdout=log,
                    stderr=subprocess.STDOUT,
                    bufsize=1,
                    universal_newlines=True
                )
            
            # Start monitoring task
            monitor_task = asyncio.create_task(self.monitor_pipeline())
            
            # Wait for process to complete
            return_code = await asyncio.get_event_loop().run_in_executor(
                None, self.process.wait
            )
            
            # Stop monitoring
            monitor_task.cancel()
            
            # Final status
            duration = time.time() - self.start_time
            print("\n" + "=" * 80)
            print(f"🏁 Pipeline completed with return code: {return_code}")
            print(f"⏱️ Total duration: {duration:.1f} seconds")
            
            # Show final critical phase status
            print("\n📊 CRITICAL PHASE SUMMARY:")
            for phase, completed in self.critical_phases.items():
                status = "✅ SUCCESS" if completed else "⏳ PENDING"
                print(f"   {phase.replace('_', ' ').title():.<30} {status}")
            
            return return_code
            
        except Exception as e:
            print(f"❌ Pipeline error: {e}")
            return 1
    
    async def monitor_pipeline(self):
        """Monitor pipeline progress every 30 seconds."""
        report_interval = 30  # seconds
        last_report_time = time.time()
        
        try:
            while True:
                await asyncio.sleep(1)  # Check every second
                
                current_time = time.time()
                if current_time - last_report_time >= report_interval:
                    self.report_status()
                    last_report_time = current_time
                    
        except asyncio.CancelledError:
            print("\n✅ Monitoring stopped - pipeline complete")
    
    def report_status(self):
        """Report current pipeline status."""
        elapsed = time.time() - self.start_time
        
        print(f"\n{'='*80}")
        print(f"📊 PIPELINE STATUS REPORT - {datetime.now().strftime('%H:%M:%S')}")
        print(f"⏱️ Elapsed time: {elapsed:.1f} seconds")
        print(f"{'='*80}")
        
        # Read log file to analyze current state
        if Path(self.log_file).exists():
            with open(self.log_file, 'r') as f:
                log_content = f.read()
            
            # Analyze log for critical phases
            self.analyze_critical_phases(log_content)
            
            # Extract current phase
            current_phase = self.get_current_phase(log_content)
            print(f"📍 Current Phase: {current_phase}")
            
            # Extract module progress
            module_progress = self.get_module_progress(log_content)
            if module_progress:
                print(f"\n📝 MODULE PROGRESS:")
                for module, status in module_progress.items():
                    print(f"   {module}: {status}")
            
            # Extract quality metrics
            quality_metrics = self.get_quality_metrics(log_content)
            if quality_metrics:
                print(f"\n🎯 QUALITY METRICS:")
                for metric, value in quality_metrics.items():
                    print(f"   {metric}: {value}")
            
            # Extract enhancement status
            enhancement_status = self.get_enhancement_status(log_content)
            if enhancement_status:
                print(f"\n🔧 ENHANCEMENT STATUS:")
                for key, value in enhancement_status.items():
                    print(f"   {key}: {value}")
            
            # Extract database operations
            db_operations = self.get_database_operations(log_content)
            if db_operations:
                print(f"\n🗄️ DATABASE OPERATIONS:")
                for op, count in db_operations.items():
                    print(f"   {op}: {count}")
        
        print(f"{'='*80}\n")
    
    def analyze_critical_phases(self, log_content):
        """Analyze log for critical phase completion."""
        # Check for successful content generation
        if "✅ MODULE GENERATION COMPLETE:" in log_content:
            self.critical_phases["content_generation"] = True
        
        # Check for quality assessment
        if "✅ QUALITY ASSESSMENT SUCCESS:" in log_content:
            self.critical_phases["quality_assessment"] = True
        
        # Check for enhancement research
        if "✅ ENHANCEMENT RESEARCH SUCCESS:" in log_content:
            self.critical_phases["enhancement_research"] = True
        
        # Check for content integration
        if "✅ ENHANCEMENT CONTENT REGENERATION SUCCESS:" in log_content:
            self.critical_phases["content_integration"] = True
        
        # Check for database storage
        if "✅ DATABASE STORAGE SUCCESS:" in log_content:
            self.critical_phases["database_storage"] = True
    
    def get_current_phase(self, log_content):
        """Extract current phase from log."""
        phases = [
            ("Phase 1: Loading Real Employee Data", "Data Loading"),
            ("Phase 2: Intelligent Course Planning", "Planning"),
            ("Phase 3: Research & Content Strategy", "Research"),
            ("Phase 4: Content Generation", "Content Generation"),
            ("Phase 5: Overall Quality Summary", "Quality Summary")
        ]
        
        current_phase = "Initializing"
        for marker, phase_name in phases:
            if marker in log_content:
                current_phase = phase_name
        
        # Check for specific sub-phases
        if "Quality checking module" in log_content:
            current_phase = "Quality Assessment"
        elif "Enhancement Agent for research" in log_content:
            current_phase = "Enhancement Research"
        elif "Content Agent (Regeneration)" in log_content:
            current_phase = "Content Regeneration"
        
        return current_phase
    
    def get_module_progress(self, log_content):
        """Extract module generation progress."""
        progress = {}
        
        # Find module generation lines
        lines = log_content.split('\n')
        for line in lines:
            if "📝 Generating Module" in line:
                # Extract module number and name
                import re
                match = re.search(r'Module (\d+): (.+)', line)
                if match:
                    module_num = match.group(1)
                    module_name = match.group(2)
                    
                    # Check status
                    status = "In Progress"
                    module_section = log_content.split(line)[1] if line in log_content else ""
                    
                    if f"Module: {module_name}" in module_section and "Status: APPROVED ✅" in module_section:
                        status = "✅ Approved"
                    elif "Module failed quality approval" in module_section:
                        status = "❌ Failed"
                    elif "Quality checking module" in module_section:
                        status = "🔍 Quality Check"
                    elif "Enhancement Agent for research" in module_section:
                        status = "🔧 Enhancement"
                    
                    progress[f"Module {module_num}"] = status
        
        return progress
    
    def get_quality_metrics(self, log_content):
        """Extract quality assessment metrics."""
        metrics = {}
        
        # Extract quality scores
        import re
        quality_scores = re.findall(r'Quality Score: ([\d.]+)/10', log_content)
        if quality_scores:
            metrics["Latest Quality Score"] = f"{quality_scores[-1]}/10"
        
        # Extract word counts
        word_counts = re.findall(r'Word Count: (\d+)', log_content)
        if word_counts:
            metrics["Latest Word Count"] = word_counts[-1]
        
        # Extract enhancement decisions
        enhancement_matches = re.findall(r'Enhancement Required: (YES|NO)', log_content)
        if enhancement_matches:
            metrics["Enhancement Required"] = enhancement_matches[-1]
        
        return metrics
    
    def get_enhancement_status(self, log_content):
        """Extract enhancement process status."""
        status = {}
        
        # Check for research package
        if "Research Package Created: YES" in log_content:
            status["Research Package"] = "✅ Created"
        
        # Extract sections to regenerate
        import re
        sections_match = re.search(r'Sections to Regenerate: \[(.*?)\]', log_content)
        if sections_match:
            sections = sections_match.group(1)
            status["Sections to Regenerate"] = sections if sections else "None"
        
        # Check for content regeneration
        word_added_matches = re.findall(r'Words Added: (\d+)', log_content)
        if word_added_matches:
            status["Words Added"] = word_added_matches[-1]
        
        return status
    
    def get_database_operations(self, log_content):
        """Extract database operation counts."""
        operations = {
            "Content Created": log_content.count("Created database content:"),
            "Sections Stored": log_content.count("DATABASE STORAGE SUCCESS:"),
            "Quality Assessments": log_content.count("Quality assessment stored:"),
            "Enhancement Sessions": log_content.count("Enhancement session created:"),
            "Content Updates": log_content.count("DATABASE UPDATE SUCCESS:")
        }
        
        return {k: v for k, v in operations.items() if v > 0}
    
    def stop_pipeline(self):
        """Stop the pipeline process."""
        if self.process and self.process.poll() is None:
            print("\n⚠️ Stopping pipeline...")
            self.process.terminate()
            time.sleep(2)
            if self.process.poll() is None:
                self.process.kill()

async def main():
    """Main monitoring function."""
    monitor = PipelineMonitor()
    
    # Handle Ctrl+C
    def signal_handler(sig, frame):
        print("\n\n🛑 Interrupted by user")
        monitor.stop_pipeline()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    
    try:
        return_code = await monitor.run_pipeline()
        
        # Show log file location
        print(f"\n📝 Full logs available at: {monitor.log_file}")
        
        return return_code
        
    except Exception as e:
        print(f"\n❌ Monitor error: {e}")
        monitor.stop_pipeline()
        return 1

if __name__ == "__main__":
    print("🔍 PRODUCTION PIPELINE MONITOR")
    print("=" * 80)
    print("This monitor will:")
    print("• Run the pipeline in the background")
    print("• Report status every 30 seconds")
    print("• Track critical phases in detail")
    print("• Show real-time progress metrics")
    print("=" * 80)
    print()
    
    exit_code = asyncio.run(main())
    sys.exit(exit_code)