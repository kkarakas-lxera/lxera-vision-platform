#!/bin/bash

# Security Cleanup Script for Lxera Vision Platform
# This script helps remove sensitive files and secure the repository

set -e

echo "🔒 Starting Security Cleanup for Lxera Vision Platform"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    print_error "This script must be run from within a git repository"
    exit 1
fi

# Backup current .gitignore
if [ -f .gitignore ]; then
    print_status "Backing up current .gitignore to .gitignore.backup"
    cp .gitignore .gitignore.backup
fi

# Step 1: Remove sensitive files from git tracking
print_status "Removing sensitive files from git tracking..."

# Remove env files
if git ls-files | grep -q "enhanced_research_config.env"; then
    print_status "Removing enhanced_research_config.env from git"
    git rm --cached enhanced_research_config.env 2>/dev/null || true
fi

# Remove backup files
if git ls-files | grep -q "\.backup$"; then
    print_status "Removing backup files from git"
    git rm --cached openai_course_generator/_archive/lxera_database_pipeline.py.backup 2>/dev/null || true
fi

# Remove log files
print_status "Removing log files from git tracking..."
find . -name "*.log" -type f | while read -r logfile; do
    if git ls-files | grep -q "$(basename "$logfile")"; then
        print_status "Removing $logfile from git"
        git rm --cached "$logfile" 2>/dev/null || true
    fi
done

# Remove .DS_Store files
print_status "Removing .DS_Store files from git tracking..."
find . -name ".DS_Store" -type f | while read -r dsfile; do
    if git ls-files | grep -q "$(basename "$dsfile")"; then
        print_status "Removing $dsfile from git"
        git rm --cached "$dsfile" 2>/dev/null || true
    fi
done

# Step 2: Update .gitignore with enhanced security rules
print_status "Updating .gitignore with enhanced security rules..."

if [ -f .gitignore.enhanced ]; then
    cp .gitignore.enhanced .gitignore
    print_status "Enhanced .gitignore applied"
else
    print_warning ".gitignore.enhanced not found, creating basic security rules"
    cat >> .gitignore << 'EOF'

# Security additions
*.env
*.env.*
!.env.example
enhanced_research_config.env
**/*secret*
**/*key*
!**/node_modules/**/*key*
!**/node_modules/**/*secret*
*.backup
*.bak
*.log
**/test_logs/
**/*_test_*.log
**/*_output.log
.DS_Store
*.pem
*.key
*.crt
*.p12
*.pfx
*.p8
EOF
fi

# Step 3: Create .env.example
print_status "Creating .env.example template..."
cat > .env.example << 'EOF'
# LXERA Enhanced Research Configuration
# Copy to .env and configure for your environment

# Enhanced Research Feature Flag
ENHANCED_RESEARCH_ENABLED=true

# API Keys (replace with your actual keys)
OPENAI_API_KEY=your_openai_key_here
TAVILY_API_KEY=your_tavily_key_here
FIRECRAWL_API_KEY=your_firecrawl_key_here

# Supabase Configuration  
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here

# Enhanced Research Settings
ENHANCED_RESEARCH_QUALITY_THRESHOLD=7.5
ENHANCED_RESEARCH_MAX_SOURCES=15
ENHANCED_RESEARCH_PARALLEL_AGENTS=3

# Monitoring and Analytics
ENHANCED_RESEARCH_ANALYTICS_ENABLED=true
ENHANCED_RESEARCH_PERFORMANCE_LOGGING=true
EOF

# Step 4: Stage security changes
print_status "Staging security changes..."
git add .gitignore
git add .env.example 2>/dev/null || true

# Step 5: Show status
print_status "Current git status:"
git status

# Step 6: Provide next steps
echo ""
echo "🔐 CRITICAL SECURITY ACTIONS REQUIRED:"
echo "======================================"
print_error "1. REVOKE ALL EXPOSED API KEYS IMMEDIATELY:"
print_error "   - Tavily API Key: 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"
print_error "   - Firecrawl API Key: fc-9ce3cda3229f471496f946856c2dfd48"
print_error "   - All Supabase JWT tokens found in code"
echo ""
print_warning "2. REFACTOR CODE to remove hardcoded credentials in:"
print_warning "   - openai_course_generator/multimedia/database_integration.py"
print_warning "   - openai_course_generator/tools/planning_storage_tools_v2.py"
print_warning "   - openai_course_generator/tools/research_storage_tools_v2.py"
print_warning "   - openai_course_generator/multimedia/direct_multimedia_processor.py"
print_warning "   - openai_course_generator/lxera_database_pipeline.py"
print_warning "   - And 3 more files (see SECURITY_ANALYSIS_REPORT.md)"
echo ""
print_status "3. COMMIT these security changes:"
echo "   git commit -m 'Security: Remove sensitive files and enhance gitignore'"
echo ""
print_status "4. CLEAN GIT HISTORY (if needed):"
echo "   # Only if repository hasn't been shared publicly"
echo "   # brew install bfg"
echo "   # bfg --delete-files 'enhanced_research_config.env' ."
echo "   # bfg --delete-files '*.log' ."
echo "   # git reflog expire --expire=now --all && git gc --prune=now --aggressive"
echo ""
print_status "5. SET UP ENVIRONMENT VARIABLES:"
echo "   cp .env.example .env"
echo "   # Edit .env with your actual credentials"
echo ""
print_error "⚠️  DO NOT DEPLOY OR SHARE until all credentials are rotated!"
echo ""
print_status "Security cleanup preparation complete."
print_status "Review SECURITY_ANALYSIS_REPORT.md for detailed next steps."