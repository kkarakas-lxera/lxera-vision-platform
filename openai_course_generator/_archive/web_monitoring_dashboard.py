#!/usr/bin/env python3
"""
Real-time Web Monitoring Dashboard for Agent Functions
Phase 2 of Research Integration Enhancement Plan

This dashboard provides real-time visibility into:
- Research API calls (Tavily + Firecrawl)
- Content generation progress
- Quality validation metrics
- Agent decision making process
"""

import asyncio
import json
import time
import logging
from datetime import datetime
from typing import Dict, Any, List
from pathlib import Path
import threading
import queue
from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AgentMonitor:
    """Real-time agent monitoring and logging system."""
    
    def __init__(self):
        self.events = queue.Queue()
        self.sessions = {}
        self.current_session = None
        self.socketio_instance = None  # Will be set when server starts
        
    def start_session(self, session_id: str, module_spec: Dict[str, Any], personalization: Dict[str, Any]):
        """Start a new monitoring session."""
        self.current_session = {
            "session_id": session_id,
            "start_time": time.time(),
            "module_spec": module_spec,
            "personalization": personalization,
            "events": [],
            "status": "active",
            "progress": 0,
            "current_phase": "initialization"
        }
        self.sessions[session_id] = self.current_session
        
        self.log_event("session_start", {
            "message": f"Started monitoring session for {personalization.get('employee_name', 'Unknown')}",
            "module": module_spec.get('module_name', 'Unknown Module')
        })
        
    def log_event(self, event_type: str, data: Dict[str, Any]):
        """Log an agent event with timestamp."""
        event = {
            "timestamp": datetime.now().isoformat(),
            "event_type": event_type,
            "data": data,
            "session_id": self.current_session["session_id"] if self.current_session else None
        }
        
        if self.current_session:
            self.current_session["events"].append(event)
            
        self.events.put(event)
        logger.info(f"[{event_type}] {data.get('message', 'No message')}")
        
        # Directly emit to WebSocket if available
        if self.socketio_instance:
            try:
                self.socketio_instance.emit('event_update', event)
                logger.debug(f"Emitted event: {event_type}")
            except Exception as e:
                logger.error(f"Failed to emit event: {e}")
        
    def update_progress(self, phase: str, progress: int, message: str = ""):
        """Update current progress and phase."""
        if self.current_session:
            self.current_session["current_phase"] = phase
            self.current_session["progress"] = progress
            
        self.log_event("progress_update", {
            "phase": phase,
            "progress": progress,
            "message": message
        })
        
    def log_research_activity(self, activity_type: str, query: str = "", url: str = "", result: Dict = None):
        """Log research-related activities."""
        self.log_event("research_activity", {
            "activity_type": activity_type,  # "search_start", "search_complete", "extraction_start", etc.
            "query": query,
            "url": url,
            "result_preview": str(result)[:200] if result else "",
            "message": f"Research: {activity_type} - {query or url}"
        })
        
    def log_content_generation(self, section: str, word_count: int, status: str):
        """Log content generation progress."""
        self.log_event("content_generation", {
            "section": section,
            "word_count": word_count,
            "status": status,
            "message": f"Generated {section}: {word_count} words ({status})"
        })
        
    def log_quality_check(self, check_type: str, score: float, criteria: str):
        """Log quality validation activities."""
        self.log_event("quality_check", {
            "check_type": check_type,
            "score": score,
            "criteria": criteria,
            "message": f"Quality check {check_type}: {score:.1f}/10 for {criteria}"
        })
        
    def finish_session(self, success: bool, final_metrics: Dict[str, Any]):
        """Complete the monitoring session."""
        if self.current_session:
            self.current_session["status"] = "completed" if success else "failed"
            self.current_session["end_time"] = time.time()
            self.current_session["duration"] = self.current_session["end_time"] - self.current_session["start_time"]
            self.current_session["final_metrics"] = final_metrics
            
        self.log_event("session_complete", {
            "success": success,
            "final_metrics": final_metrics,
            "message": f"Session completed: {'✅ Success' if success else '❌ Failed'}"
        })

# Global monitor instance
monitor = AgentMonitor()

# Flask app for web dashboard
app = Flask(__name__)
app.config['SECRET_KEY'] = 'agent_monitor_secret_key'
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def dashboard():
    """Serve the main monitoring dashboard."""
    return render_template('agent_monitor.html')

@app.route('/api/sessions')
def get_sessions():
    """Get all monitoring sessions."""
    return jsonify(list(monitor.sessions.values()))

@app.route('/api/session/<session_id>')
def get_session(session_id):
    """Get specific session details."""
    session = monitor.sessions.get(session_id, {})
    return jsonify(session)

@app.route('/api/events')
def get_events():
    """Get recent events."""
    events = []
    while not monitor.events.empty():
        try:
            events.append(monitor.events.get_nowait())
        except queue.Empty:
            break
    return jsonify(events)

@socketio.on('connect')
def handle_connect():
    """Handle new WebSocket connection."""
    emit('connected', {'message': 'Connected to Agent Monitor'})

@socketio.on('start_monitoring')
def handle_start_monitoring(data):
    """Start monitoring a new session."""
    session_id = f"session_{int(time.time())}"
    
    module_spec = data.get('module_spec', {})
    personalization = data.get('personalization', {})
    
    monitor.start_session(session_id, module_spec, personalization)
    
    emit('session_started', {
        'session_id': session_id,
        'message': 'Monitoring session started'
    })

# Direct emission - no need for background thread anymore
# Events are emitted immediately when logged

def create_dashboard_template():
    """Create the HTML template for the monitoring dashboard."""
    
    template_dir = Path("templates")
    template_dir.mkdir(exist_ok=True)
    
    template_content = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agent Monitoring Dashboard</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.0.4/socket.io.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            background: #f5f5f5;
            color: #333;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .dashboard-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 20px;
        }
        .card {
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.1);
            border-left: 4px solid #667eea;
        }
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }
        .status-active { background: #4CAF50; }
        .status-pending { background: #FF9800; }
        .status-error { background: #F44336; }
        .event-log {
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 10px;
            background: #fafafa;
        }
        .event-item {
            margin-bottom: 10px;
            padding: 8px;
            border-radius: 5px;
            border-left: 3px solid #667eea;
            background: white;
        }
        .event-timestamp {
            font-size: 0.8em;
            color: #666;
        }
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #e0e0e0;
            border-radius: 10px;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #45a049);
            transition: width 0.3s ease;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .metric-card {
            text-align: center;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }
        .metric-label {
            font-size: 0.9em;
            color: #666;
            margin-top: 5px;
        }
        .start-session {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
        }
        .start-session:hover {
            background: #5a6fd8;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <h1>🔬 Agent Monitoring Dashboard</h1>
            <p>Real-time monitoring of content generation and research activities</p>
        </div>
    </div>
    
    <div class="container">
        <div class="card">
            <h2>Current Session</h2>
            <div id="session-status">
                <span class="status-indicator status-pending"></span>
                <span>No active session</span>
            </div>
            <br><br>
            <button class="start-session" onclick="startTestSession()">Start Test Session</button>
        </div>
        
        <div class="dashboard-grid">
            <div class="card">
                <h3>Progress</h3>
                <div id="current-phase">Phase: Initialization</div>
                <br>
                <div class="progress-bar">
                    <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
                </div>
                <div id="progress-text">0% Complete</div>
            </div>
            
            <div class="card">
                <h3>Live Metrics</h3>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value" id="events-count">0</div>
                        <div class="metric-label">Events</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value" id="research-calls">0</div>
                        <div class="metric-label">Research Calls</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value" id="content-sections">0</div>
                        <div class="metric-label">Content Sections</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value" id="quality-checks">0</div>
                        <div class="metric-label">Quality Checks</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h3>Live Event Log</h3>
            <div class="event-log" id="event-log">
                <div class="event-item">
                    <div class="event-timestamp">Waiting for events...</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const socket = io();
        let eventCount = 0;
        let researchCount = 0;
        let contentCount = 0;
        let qualityCount = 0;
        
        socket.on('connected', (data) => {
            console.log('Connected to monitor:', data.message);
        });
        
        socket.on('session_started', (data) => {
            document.getElementById('session-status').innerHTML = 
                '<span class="status-indicator status-active"></span>Session Active: ' + data.session_id;
        });
        
        socket.on('event_update', (event) => {
            addEventToLog(event);
            updateMetrics(event);
            updateProgress(event);
        });
        
        function addEventToLog(event) {
            const log = document.getElementById('event-log');
            const eventDiv = document.createElement('div');
            eventDiv.className = 'event-item';
            
            const timestamp = new Date(event.timestamp).toLocaleTimeString();
            eventDiv.innerHTML = `
                <div class="event-timestamp">${timestamp} - ${event.event_type}</div>
                <div>${event.data.message || 'No message'}</div>
            `;
            
            log.insertBefore(eventDiv, log.firstChild);
            
            // Keep only last 20 events
            while (log.children.length > 20) {
                log.removeChild(log.lastChild);
            }
        }
        
        function updateMetrics(event) {
            eventCount++;
            document.getElementById('events-count').textContent = eventCount;
            
            if (event.event_type === 'research_activity') {
                researchCount++;
                document.getElementById('research-calls').textContent = researchCount;
            }
            
            if (event.event_type === 'content_generation') {
                contentCount++;
                document.getElementById('content-sections').textContent = contentCount;
            }
            
            if (event.event_type === 'quality_check') {
                qualityCount++;
                document.getElementById('quality-checks').textContent = qualityCount;
            }
        }
        
        function updateProgress(event) {
            if (event.event_type === 'progress_update') {
                const progress = event.data.progress || 0;
                const phase = event.data.phase || 'Unknown';
                
                document.getElementById('progress-fill').style.width = progress + '%';
                document.getElementById('progress-text').textContent = progress + '% Complete';
                document.getElementById('current-phase').textContent = 'Phase: ' + phase;
            }
        }
        
        function startTestSession() {
            socket.emit('start_monitoring', {
                module_spec: {
                    module_name: "Test Financial Analysis Module",
                    key_concepts: ["Analysis", "Ratios", "Statements"]
                },
                personalization: {
                    employee_name: "Test User",
                    current_role: "Analyst",
                    career_goal: "Senior Analyst"
                }
            });
        }
    </script>
</body>
</html>'''
    
    with open(template_dir / "agent_monitor.html", "w") as f:
        f.write(template_content)

if __name__ == "__main__":
    """Run the monitoring dashboard server."""
    
    print("🔬 Starting Agent Monitoring Dashboard")
    print("=" * 50)
    
    # Create template
    create_dashboard_template()
    
    print("✅ Dashboard template created")
    
    # Set socketio instance for direct emission
    monitor.socketio_instance = socketio
    print("✅ Monitor connected to SocketIO")
    
    print("🌐 Starting web server...")
    print("📊 Dashboard will be available at: http://localhost:5001")
    print("🔴 Press Ctrl+C to stop")
    
    # Start the Flask-SocketIO server on alternative port
    port = 5001  # Use alternative port to avoid conflicts
    print(f"🌐 Starting server on port {port}...")
    socketio.run(app, host='0.0.0.0', port=port, debug=False)