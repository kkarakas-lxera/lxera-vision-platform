#!/bin/bash
# Vast.ai RTX 4090 Setup Script for Course Generation Worker
# Run this after git pull on Vast.ai instance

set -e  # Exit on any error

echo "🚀 Setting up LXERA Course Generation Worker on Vast.ai..."

# Update system packages
echo "📦 Updating system packages..."
apt-get update && apt-get install -y supervisor curl git python3-pip

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
cd /workspace/lxera-vision-platform/openai_course_generator
pip3 install --upgrade pip
pip3 install -r requirements.txt

# Create necessary directories and logs
echo "📁 Creating log directories..."
mkdir -p /var/log
touch /var/log/course_worker.log
touch /var/log/course_worker_error.log
touch /var/log/api_server.log
touch /var/log/api_server_error.log
touch /var/log/ollama.log
touch /var/log/ollama_error.log
touch /var/log/supervisord.log

# Set up environment variables (you'll need to set these manually)
echo "⚙️  Setting up environment variables..."
cat > /workspace/.env << EOF
# LXERA Worker Environment Variables
# !! IMPORTANT: Set these values manually with your actual credentials !!

# Supabase Configuration (REQUIRED - Get from Supabase dashboard)
SUPABASE_URL=https://xwfweumeryrgbguwrocr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Ollama Configuration (Default values - should work as-is)
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen3:14b
OLLAMA_PLANNING_MODEL=deepseek-r1:8b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# Worker Configuration
MAX_CONCURRENT_JOBS=2
POLL_INTERVAL_SECONDS=5
LOG_LEVEL=INFO

# Optional: Monitoring (Recommended for production)
SENTRY_DSN=your_sentry_dsn_here

# Optional: API Keys for research tools
FIRECRAWL_API_KEY=your_firecrawl_key_here
TAVILY_API_KEY=your_tavily_key_here
BRIGHTDATA_API_KEY=your_brightdata_key_here
EOF

echo "📝 Environment file created at /workspace/.env"
echo "⚠️  CRITICAL: Edit /workspace/.env and set your actual API keys!"

# Install and configure Ollama if not present
if ! command -v ollama &> /dev/null; then
    echo "🦙 Installing Ollama..."
    curl -fsSL https://ollama.ai/install.sh | sh
fi

# Download required models
echo "📥 Downloading Ollama models (this may take a while)..."
export OLLAMA_HOST=127.0.0.1:11434
ollama serve &
OLLAMA_PID=$!
sleep 10  # Wait for Ollama to start

echo "📥 Pulling qwen3:14b model..."
ollama pull qwen3:14b

echo "📥 Pulling deepseek-r1:8b model..."
ollama pull deepseek-r1:8b

echo "📥 Pulling nomic-embed-text model..."
ollama pull nomic-embed-text

# Stop the temporary Ollama instance
kill $OLLAMA_PID 2>/dev/null || true
sleep 5

# Copy supervisor configuration
echo "⚙️  Configuring Supervisor..."
cp supervisord.conf /etc/supervisor/conf.d/lxera_worker.conf

# Start services
echo "🎯 Starting services..."
systemctl enable supervisor
systemctl restart supervisor

# Wait a moment for services to start
sleep 5

# Check service status
echo "📊 Service Status:"
supervisorctl status

echo ""
echo "✅ Setup complete!"
echo ""
echo "🔧 NEXT STEPS:"
echo "1. Edit /workspace/.env with your actual API keys"
echo "2. Restart services: supervisorctl restart all"
echo "3. Monitor logs: tail -f /var/log/course_worker.log"
echo ""
echo "📋 USEFUL COMMANDS:"
echo "  supervisorctl status          # Check service status"
echo "  supervisorctl restart all     # Restart all services"  
echo "  supervisorctl tail -f course_worker  # Follow worker logs"
echo "  tail -f /var/log/course_worker.log   # Raw log file"
echo ""
echo "🎉 Worker is ready to process course generation jobs!"