#!/bin/bash
# =====================================================
# DEPLOYMENT SCRIPT - BURNBACK PRODUCTION DEPLOYMENT
# Automated deployment script for Lightsail production environment
# =====================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# =====================================================
# CONFIGURATION
# =====================================================
APP_DIR="/var/www/burnblack"
BACKUP_DIR="/var/www/backups"
LOG_FILE="/var/log/burnblack/deployment.log"
PM2_APP_NAME="burnblack-backend"

# Create log file if it doesn't exist
sudo mkdir -p /var/log/burnblack
sudo touch $LOG_FILE
sudo chown ubuntu:ubuntu $LOG_FILE

# =====================================================
# BACKUP FUNCTION
# =====================================================
create_backup() {
    log "Creating backup of current version..."
    
    if [ -d "$APP_DIR" ]; then
        BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
        sudo mkdir -p $BACKUP_DIR
        sudo cp -r $APP_DIR $BACKUP_DIR/$BACKUP_NAME
        success "Backup created: $BACKUP_DIR/$BACKUP_NAME"
    else
        warning "No existing application directory found, skipping backup"
    fi
}

# =====================================================
# ROLLBACK FUNCTION
# =====================================================
rollback() {
    error "Deployment failed, initiating rollback..."
    
    # Stop current processes
    pm2 stop $PM2_APP_NAME || true
    
    # Find latest backup
    LATEST_BACKUP=$(ls -t $BACKUP_DIR | head -n1)
    
    if [ -n "$LATEST_BACKUP" ]; then
        log "Rolling back to: $LATEST_BACKUP"
        sudo rm -rf $APP_DIR
        sudo cp -r $BACKUP_DIR/$LATEST_BACKUP $APP_DIR
        sudo chown -R ubuntu:ubuntu $APP_DIR
        
        # Restart services
        cd $APP_DIR
        pm2 start ecosystem.config.js
        pm2 save
        
        success "Rollback completed successfully"
    else
        error "No backup found for rollback"
    fi
    
    exit 1
}

# =====================================================
# HEALTH CHECK FUNCTION
# =====================================================
health_check() {
    log "Performing health checks..."
    
    # Check backend health
    if ! curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        error "Backend health check failed"
        return 1
    fi
    
    # Check main site
    if ! curl -f https://burnblack.com/api/health > /dev/null 2>&1; then
        error "Main site health check failed"
        return 1
    fi
    
    # Check admin panel
    if ! curl -f https://admin.burnblack.com/api/health > /dev/null 2>&1; then
        error "Admin panel health check failed"
        return 1
    fi
    
    success "All health checks passed"
    return 0
}

# =====================================================
# MAIN DEPLOYMENT FUNCTION
# =====================================================
deploy() {
    log "Starting BurnBlack deployment..."
    
    # Create backup
    create_backup
    
    # Navigate to application directory
    cd $APP_DIR
    
    # Stop PM2 processes
    log "Stopping PM2 processes..."
    pm2 stop $PM2_APP_NAME || true
    
    # Pull latest code
    log "Pulling latest code from repository..."
    git fetch origin
    git reset --hard origin/main
    git pull origin main
    
    # Install backend dependencies
    log "Installing backend dependencies..."
    cd backend
    npm ci --production
    
    # Run database migrations
    log "Running database migrations..."
    npx sequelize-cli db:migrate --env production
    
    # Seed database if needed
    if [ "$1" == "--seed" ]; then
        log "Running database seeds..."
        npx sequelize-cli db:seed:all --env production
    fi
    
    # Build frontend (if build directory doesn't exist)
    if [ ! -d "../frontend/build" ]; then
        log "Building frontend..."
        cd ../frontend
        npm ci
        npm run build
        cd ../backend
    fi
    
    # Copy frontend build to web root
    log "Deploying frontend build..."
    sudo cp -r ../frontend/build/* /var/www/html/
    sudo chown -R www-data:www-data /var/www/html
    
    # Copy admin build
    log "Deploying admin panel..."
    sudo cp -r ../frontend/build/* /var/www/admin/
    sudo chown -R www-data:www-data /var/www/admin
    
    # Restart PM2 processes
    log "Restarting PM2 processes..."
    pm2 start ecosystem.config.js
    pm2 save
    
    # Reload Nginx
    log "Reloading Nginx..."
    sudo nginx -t
    sudo systemctl reload nginx
    
    # Wait for services to start
    log "Waiting for services to start..."
    sleep 10
    
    # Perform health checks
    if ! health_check; then
        rollback
    fi
    
    # Clean up old backups (keep last 5)
    log "Cleaning up old backups..."
    cd $BACKUP_DIR
    ls -t | tail -n +6 | xargs -r sudo rm -rf
    
    success "Deployment completed successfully!"
    
    # Show deployment summary
    log "Deployment Summary:"
    echo "  - Application: BurnBlack Platform"
    echo "  - Version: $(git rev-parse --short HEAD)"
    echo "  - Deployed at: $(date)"
    echo "  - Backend: http://localhost:3001"
    echo "  - Frontend: https://burnblack.com"
    echo "  - Admin: https://admin.burnblack.com"
    echo "  - PM2 Status: $(pm2 jlist | jq -r '.[0].pm2_env.status')"
}

# =====================================================
# SCRIPT EXECUTION
# =====================================================
main() {
    # Check if running as root
    if [ "$EUID" -eq 0 ]; then
        error "Please do not run this script as root"
        exit 1
    fi
    
    # Check if git repository exists
    if [ ! -d "$APP_DIR/.git" ]; then
        error "Git repository not found in $APP_DIR"
        exit 1
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
        exit 1
    fi
    
    # Check if PM2 is installed
    if ! command -v pm2 &> /dev/null; then
        error "PM2 is not installed"
        exit 1
    fi
    
    # Run deployment
    deploy "$@"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "BurnBlack Deployment Script"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --seed    Run database seeds after migration"
        echo "  --help    Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0                # Standard deployment"
        echo "  $0 --seed        # Deployment with database seeding"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
