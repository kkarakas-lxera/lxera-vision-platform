#!/bin/bash
# Vast.ai Deployment Script for Lxera Content Pipeline
# Ready-to-run with your actual API keys

set -e

echo "🚀 DEPLOYING LXERA CONTENT PIPELINE ON VAST.AI"
echo "================================================"

# 1. Update system and install dependencies
echo "📦 Installing system dependencies..."
apt-get update && apt-get install -y \
    curl \
    git \
    python3-pip \
    python3-venv \
    systemd

# 2. Create application directory
echo "📁 Setting up application directory..."
mkdir -p /opt/lxera-pipeline
cd /opt/lxera-pipeline

# 3. Copy application files (assumes you've uploaded them)
echo "📋 Setting up application files..."
if [ -d "/workspace/lxera-vision-platform" ]; then
    cp -r /workspace/lxera-vision-platform/* .
else
    echo "❌ Application files not found in /workspace/lxera-vision-platform"
    echo "Please upload your application files first"
    exit 1
fi

# 4. Install Python dependencies
echo "🐍 Installing Python dependencies..."
pip3 install -r requirements.txt

# 5. Set up environment variables with your actual keys
echo "🔐 Configuring environment variables..."
cat > .env << 'EOF'
# Ollama Configuration
OLLAMA_TOKEN=a74aa3368d646eb26a2a8470cd8c831774052110f3f8246cc6b208ab9262aaf3
OLLAMA_BASE_URL=http://109.198.107.223:50435
OLLAMA_MODEL=qwen3:14b

# Supabase Database  
SUPABASE_URL=https://xwfweumeryrgbguwrocr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZndldW1lcnlyZ2JndXdyb2NyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc2MzQ0MCwiZXhwIjoyMDY2MzM5NDQwfQ.qxXpBxUKhKA4AQT4UQnIEJGbGNrRDMbBroZU8YaypSY

# Research APIs
FIRECRAWL_API_KEY=fc-7262516226444c878aa16b03d570f3c7
SCRAPE_DO_API_KEY=30fcc17f6d1c47dda273387d46ac9ef9eaef9276b48

# LangSmith Monitoring
LANGSMITH_API_KEY=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
LANGSMITH_TRACING=true
LANGSMITH_PROJECT=Lxera-Content-Pipeline

# Application Settings
LOG_LEVEL=INFO
DEBUG_MODE=false
ENABLE_TRACING=true
EOF

# 6. Create systemd service for automatic startup
echo "🔄 Creating systemd service..."
cat > /etc/systemd/system/lxera-pipeline.service << 'EOF'
[Unit]
Description=Lxera Content Pipeline with Ollama
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/lxera-pipeline
EnvironmentFile=/opt/lxera-pipeline/.env
ExecStart=/usr/bin/python3 -m agent_graph.runner
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

# Resource limits
MemoryMax=8G
CPUQuota=400%

[Install]
WantedBy=multi-user.target
EOF

# 7. Create health check script
echo "🏥 Creating health check..."
cat > health_check.py << 'EOF'
#!/usr/bin/env python3
import requests
import sys
import os

def check_health():
    try:
        # Test Ollama connection
        ollama_url = os.getenv('OLLAMA_BASE_URL', 'http://109.198.107.223:50435')
        ollama_token = os.getenv('OLLAMA_TOKEN')
        
        cookies = {f"C.25124719_auth_token": ollama_token}
        response = requests.get(f"{ollama_url}/api/tags", cookies=cookies, timeout=10)
        
        if response.status_code == 200:
            print("✅ Ollama connection healthy")
            return True
        else:
            print(f"❌ Ollama connection failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

if __name__ == "__main__":
    if check_health():
        sys.exit(0)
    else:
        sys.exit(1)
EOF

# 8. Set permissions
chmod +x health_check.py
chmod +x deployment/vast_ai_deploy.sh

# 9. Enable and start the service
echo "🚀 Starting Lxera Pipeline service..."
systemctl daemon-reload
systemctl enable lxera-pipeline
systemctl start lxera-pipeline

# 10. Show status
echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "================================================"
echo "📊 Service Status:"
systemctl status lxera-pipeline --no-pager

echo ""
echo "📋 Useful Commands:"
echo "   Check status: systemctl status lxera-pipeline"
echo "   View logs: journalctl -u lxera-pipeline -f"
echo "   Restart: systemctl restart lxera-pipeline"
echo "   Stop: systemctl stop lxera-pipeline"

echo ""
echo "🔍 Health Check:"
python3 health_check.py

echo ""
echo "🎯 Your pipeline is now running on Vast.ai!"
echo "📡 Ollama endpoint: http://109.198.107.223:50435"
echo "🗄️  Supabase: https://xwfweumeryrgbguwrocr.supabase.co"
