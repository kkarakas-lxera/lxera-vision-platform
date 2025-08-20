#!/bin/bash
# Vast.ai Deployment Setup Script for Lxera Content Pipeline

set -e

echo "🚀 Setting up Lxera Content Pipeline on Vast.ai"
echo "=" * 50

# 1. Update system
echo "📦 Updating system packages..."
apt-get update && apt-get install -y curl git python3-pip

# 2. Clone repository (if not already present)
if [ ! -d "/workspace/lxera-vision-platform" ]; then
    echo "📥 Cloning repository..."
    cd /workspace
    git clone https://github.com/your-username/lxera-vision-platform.git
    cd lxera-vision-platform
else
    echo "📁 Repository already exists, updating..."
    cd /workspace/lxera-vision-platform
    git pull
fi

# 3. Install Python dependencies
echo "🐍 Installing Python dependencies..."
pip3 install -r requirements.txt

# 4. Set up environment variables
echo "🔐 Setting up environment variables..."

# Create environment file from template
cp deployment/.env.production .env

echo "⚠️  IMPORTANT: Edit .env file with your actual API keys:"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "   - FIRECRAWL_API_KEY"
echo "   - LANGSMITH_API_KEY (optional)"
echo "   - SENTRY_DSN (optional)"

# 5. Create systemd service for auto-restart
echo "🔄 Creating systemd service..."
cat > /etc/systemd/system/lxera-pipeline.service << EOF
[Unit]
Description=Lxera Content Pipeline
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/workspace/lxera-vision-platform
Environment=PATH=/usr/local/bin:/usr/bin:/bin
EnvironmentFile=/workspace/lxera-vision-platform/.env
ExecStart=/usr/bin/python3 -m agent_graph.api.main
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 6. Enable and start service
systemctl daemon-reload
systemctl enable lxera-pipeline

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your API keys"
echo "2. Start service: systemctl start lxera-pipeline"
echo "3. Check status: systemctl status lxera-pipeline"
echo "4. View logs: journalctl -u lxera-pipeline -f"
echo ""
echo "🌐 Your pipeline will be available at: http://localhost:8000"
