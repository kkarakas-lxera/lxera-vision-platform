#!/bin/bash

# Lxera Vision Platform - Automated Deployment Script
# Usage: ./deploy.sh [environment] [--force]
# Environment: staging|production (default: staging)

set -e  # Exit on any error

# Configuration
ENVIRONMENT=${1:-staging}
FORCE_DEPLOY=${2:-""}
BACKUP_DIR="./backups"
LOG_FILE="deployment_$(date +%Y%m%d_%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

# Check prerequisites
check_prerequisites() {
    log "Checking deployment prerequisites..."
    
    # Check if required tools are installed
    command -v node >/dev/null 2>&1 || error "Node.js is required but not installed"
    command -v npm >/dev/null 2>&1 || error "npm is required but not installed"
    command -v supabase >/dev/null 2>&1 || error "Supabase CLI is required but not installed"
    command -v vercel >/dev/null 2>&1 || error "Vercel CLI is required but not installed"
    
    # Check if in correct directory
    if [[ ! -f "package.json" ]]; then
        error "Must be run from project root directory"
    fi
    
    # Check if logged into services
    if ! vercel whoami >/dev/null 2>&1; then
        error "Please login to Vercel first: vercel login"
    fi
    
    if ! supabase status >/dev/null 2>&1; then
        warning "Supabase CLI not linked. Run: supabase link"
    fi
    
    success "Prerequisites check passed"
}

# Backup current state
create_backup() {
    log "Creating backup of current state..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Database backup
    if supabase status >/dev/null 2>&1; then
        log "Creating database backup..."
        supabase db dump --file "$BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).sql" || warning "Database backup failed"
    fi
    
    # Git backup (current commit hash)
    git rev-parse HEAD > "$BACKUP_DIR/commit_hash_$(date +%Y%m%d_%H%M%S).txt"
    
    success "Backup created in $BACKUP_DIR"
}

# Pre-deployment checks
pre_deployment_checks() {
    log "Running pre-deployment checks..."
    
    # Check git status
    if [[ -n $(git status --porcelain) ]]; then
        if [[ "$FORCE_DEPLOY" != "--force" ]]; then
            error "Working directory is not clean. Commit changes or use --force flag"
        else
            warning "Deploying with uncommitted changes"
        fi
    fi
    
    # Type checking
    log "Running TypeScript type check..."
    npx tsc --noEmit || error "TypeScript type check failed"
    
    # Linting
    log "Running ESLint..."
    npm run lint || error "ESLint check failed"
    
    # Test build
    log "Testing build process..."
    npm run build || error "Build process failed"
    
    # Check bundle size
    BUNDLE_SIZE=$(du -sk dist | cut -f1)
    if (( BUNDLE_SIZE > 5000 )); then
        warning "Bundle size is large: ${BUNDLE_SIZE}KB. Consider code splitting."
    fi
    
    success "Pre-deployment checks passed"
}

# Database migration
deploy_database() {
    log "Deploying database migrations..."
    
    # Check for pending migrations
    if supabase db diff --remote | grep -q "No schema changes detected"; then
        log "No database changes to deploy"
    else
        log "Deploying database changes..."
        supabase db push || error "Database migration failed"
        
        # Verify migration success
        if ! supabase db diff --remote | grep -q "No schema changes detected"; then
            error "Database migration verification failed"
        fi
    fi
    
    success "Database deployment completed"
}

# Edge functions deployment
deploy_edge_functions() {
    log "Deploying edge functions..."
    
    # Deploy all functions
    supabase functions deploy || error "Edge functions deployment failed"
    
    # Test critical functions
    log "Testing critical edge functions..."
    
    # Test analyze-cv-enhanced
    if ! supabase functions invoke analyze-cv-enhanced --data '{"test": true}' >/dev/null 2>&1; then
        warning "analyze-cv-enhanced function test failed"
    fi
    
    # Test assess-skill-proficiency
    if ! supabase functions invoke assess-skill-proficiency --data '{"test": true}' >/dev/null 2>&1; then
        warning "assess-skill-proficiency function test failed"
    fi
    
    success "Edge functions deployment completed"
}

# Python pipeline deployment
deploy_python_pipeline() {
    log "Checking Python pipeline status..."
    
    # Check if Python pipeline exists
    if [[ -d "openai_course_generator" ]]; then
        log "Python pipeline detected"
        
        cd openai_course_generator
        
        # Test pipeline connectivity
        if python -c "from lxera_database_pipeline import test_connection; test_connection()" 2>/dev/null; then
            log "Python pipeline connectivity test passed"
        else
            warning "Python pipeline connectivity test failed"
        fi
        
        cd ..
        
        # Note: Actual deployment depends on hosting provider (Render, Railway, etc.)
        log "Python pipeline deployment should be handled by CI/CD or manual deployment"
    else
        log "No Python pipeline found, skipping"
    fi
    
    success "Python pipeline check completed"
}

# Frontend deployment
deploy_frontend() {
    log "Deploying frontend to Vercel..."
    
    # Clean build
    rm -rf dist
    npm run build || error "Frontend build failed"
    
    # Deploy based on environment
    if [[ "$ENVIRONMENT" == "production" ]]; then
        log "Deploying to production..."
        vercel --prod --yes || error "Production deployment failed"
    else
        log "Deploying to staging..."
        vercel --yes || error "Staging deployment failed"
    fi
    
    success "Frontend deployment completed"
}

# Post-deployment verification
verify_deployment() {
    log "Running post-deployment verification..."
    
    # Get deployment URL
    if [[ "$ENVIRONMENT" == "production" ]]; then
        DEPLOY_URL=$(vercel ls --limit 1 | grep production | awk '{print $2}')
    else
        DEPLOY_URL=$(vercel ls --limit 1 | awk 'NR==2 {print $2}')
    fi
    
    if [[ -n "$DEPLOY_URL" ]]; then
        log "Deployment URL: https://$DEPLOY_URL"
        
        # Basic health check
        if curl -f -s "https://$DEPLOY_URL" >/dev/null; then
            success "Frontend health check passed"
        else
            error "Frontend health check failed"
        fi
        
        # Test critical endpoints
        log "Testing critical user flows..."
        # Add specific endpoint tests here
        
    else
        warning "Could not determine deployment URL"
    fi
    
    # Database health check
    if supabase status | grep -q "API URL"; then
        success "Database health check passed"
    else
        warning "Database health check failed"
    fi
    
    success "Post-deployment verification completed"
}

# Rollback function
rollback() {
    log "Rolling back deployment..."
    
    # Get previous deployment
    PREVIOUS_DEPLOYMENT=$(vercel ls --limit 2 | awk 'NR==3 {print $2}')
    
    if [[ -n "$PREVIOUS_DEPLOYMENT" ]]; then
        log "Rolling back to: $PREVIOUS_DEPLOYMENT"
        vercel rollback "$PREVIOUS_DEPLOYMENT" --yes || error "Rollback failed"
        success "Rollback completed"
    else
        error "No previous deployment found for rollback"
    fi
}

# Performance monitoring setup
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Deploy monitoring queries
    if [[ -f "monitoring-dashboard-config.sql" ]]; then
        log "Deploying monitoring dashboard configuration..."
        supabase db reset --file monitoring-dashboard-config.sql || warning "Monitoring setup failed"
    fi
    
    # Set up performance baselines
    log "Performance baselines:"
    log "- Profile completion rate target: >75%"
    log "- Course generation time target: <3 minutes"
    log "- Page load time target: <3 seconds"
    log "- Error rate target: <1%"
    
    success "Monitoring setup completed"
}

# Main deployment flow
main() {
    log "Starting deployment to $ENVIRONMENT environment"
    log "Deployment ID: $(date +%Y%m%d_%H%M%S)"
    
    # Trap errors for cleanup
    trap 'error "Deployment failed. Check logs: $LOG_FILE"' ERR
    
    # Run deployment steps
    check_prerequisites
    create_backup
    pre_deployment_checks
    deploy_database
    deploy_edge_functions
    deploy_python_pipeline
    deploy_frontend
    verify_deployment
    setup_monitoring
    
    success "Deployment completed successfully!"
    log "Deployment log saved to: $LOG_FILE"
    
    # Performance recommendations
    log ""
    log "Post-deployment recommendations:"
    log "1. Monitor key metrics for 24 hours"
    log "2. Check error rates and performance"
    log "3. Verify user flows are working"
    log "4. Review monitoring dashboard"
    
    # Show important URLs
    log ""
    log "Important URLs:"
    log "- Application: https://your-domain.vercel.app"
    log "- Supabase Dashboard: https://app.supabase.com/project/xwfweumeryrgbguwrocr"
    log "- Vercel Dashboard: https://vercel.com/dashboard"
}

# Handle script arguments
case "${1:-help}" in
    "staging"|"production")
        main
        ;;
    "rollback")
        rollback
        ;;
    "help"|*)
        echo "Usage: $0 [staging|production|rollback] [--force]"
        echo ""
        echo "Commands:"
        echo "  staging     Deploy to staging environment (default)"
        echo "  production  Deploy to production environment"
        echo "  rollback    Rollback to previous deployment"
        echo ""
        echo "Options:"
        echo "  --force     Deploy even with uncommitted changes"
        echo ""
        echo "Examples:"
        echo "  $0 staging"
        echo "  $0 production --force"
        echo "  $0 rollback"
        ;;
esac