#!/bin/bash
# Monitoring Toggle Script
# Easily enable/disable monitoring without affecting the main application

set -e

MONITORING_ENV_FILE=".env"
MONITORING_SERVICE_FILE="src/services/monitoringConfigService.js"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[MONITORING]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if monitoring is enabled
is_monitoring_enabled() {
    if grep -q "MONITORING_ENABLED=true" "$MONITORING_ENV_FILE"; then
        return 0
    else
        return 1
    fi
}

# Function to enable monitoring
enable_monitoring() {
    print_status "Enabling monitoring..."
    
    # Update .env file
    if is_monitoring_enabled; then
        print_warning "Monitoring is already enabled"
        return 0
    fi
    
    # Backup current .env
    cp "$MONITORING_ENV_FILE" "${MONITORING_ENV_FILE}.backup"
    
    # Enable monitoring in .env
    sed -i 's/MONITORING_ENABLED=false/MONITORING_ENABLED=true/' "$MONITORING_ENV_FILE"
    
    print_success "Monitoring enabled in configuration"
    print_warning "Restart the application to apply changes"
    
    # Check if monitoring stack is running
    if command -v docker-compose > /dev/null 2>&1; then
        if [ -f "monitoring/docker-compose.yml" ]; then
            print_status "Checking monitoring stack..."
            cd monitoring
            if docker-compose ps | grep -q "Up"; then
                print_success "Monitoring stack is already running"
            else
                print_status "Starting monitoring stack..."
                docker-compose up -d
                print_success "Monitoring stack started"
            fi
            cd ..
        else
            print_warning "Monitoring stack configuration not found"
            print_status "Run 'npm run monitoring:setup' to set up monitoring stack"
        fi
    else
        print_warning "Docker Compose not found - monitoring stack cannot be started"
    fi
}

# Function to disable monitoring
disable_monitoring() {
    print_status "Disabling monitoring..."
    
    # Update .env file
    if ! is_monitoring_enabled; then
        print_warning "Monitoring is already disabled"
        return 0
    fi
    
    # Backup current .env
    cp "$MONITORING_ENV_FILE" "${MONITORING_ENV_FILE}.backup"
    
    # Disable monitoring in .env
    sed -i 's/MONITORING_ENABLED=true/MONITORING_ENABLED=false/' "$MONITORING_ENV_FILE"
    
    print_success "Monitoring disabled in configuration"
    print_warning "Restart the application to apply changes"
    
    # Optionally stop monitoring stack
    if command -v docker-compose > /dev/null 2>&1; then
        if [ -f "monitoring/docker-compose.yml" ]; then
            read -p "Do you want to stop the monitoring stack? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                print_status "Stopping monitoring stack..."
                cd monitoring
                docker-compose down
                print_success "Monitoring stack stopped"
                cd ..
            else
                print_status "Monitoring stack left running"
            fi
        fi
    fi
}

# Function to show monitoring status
show_status() {
    print_status "Monitoring Status:"
    echo
    
    # Check configuration
    if is_monitoring_enabled; then
        print_success "Configuration: ENABLED"
    else
        print_warning "Configuration: DISABLED"
    fi
    
    # Check if monitoring stack is running
    if command -v docker-compose > /dev/null 2>&1; then
        if [ -f "monitoring/docker-compose.yml" ]; then
            cd monitoring
            if docker-compose ps | grep -q "Up"; then
                print_success "Monitoring Stack: RUNNING"
                echo
                print_status "Services:"
                docker-compose ps
            else
                print_warning "Monitoring Stack: STOPPED"
            fi
            cd ..
        else
            print_warning "Monitoring Stack: NOT CONFIGURED"
        fi
    else
        print_warning "Docker Compose: NOT INSTALLED"
    fi
    
    # Check if application is running
    if curl -s http://localhost:3002/health > /dev/null 2>&1; then
        print_success "Application: RUNNING"
        
        # Check metrics endpoint
        if curl -s http://localhost:3002/metrics > /dev/null 2>&1; then
            if is_monitoring_enabled; then
                print_success "Metrics Endpoint: ACTIVE"
            else
                print_warning "Metrics Endpoint: DISABLED"
            fi
        else
            print_error "Metrics Endpoint: NOT ACCESSIBLE"
        fi
    else
        print_warning "Application: NOT RUNNING"
    fi
}

# Function to show help
show_help() {
    echo "Burnblack Monitoring Toggle Script"
    echo
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  enable    Enable monitoring (requires restart)"
    echo "  disable   Disable monitoring (requires restart)"
    echo "  status    Show monitoring status"
    echo "  help      Show this help message"
    echo
    echo "Examples:"
    echo "  $0 enable     # Enable monitoring"
    echo "  $0 disable    # Disable monitoring"
    echo "  $0 status     # Check status"
    echo
    echo "Note: Configuration changes require application restart"
}

# Main script logic
case "${1:-help}" in
    "enable")
        enable_monitoring
        ;;
    "disable")
        disable_monitoring
        ;;
    "status")
        show_status
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo
        show_help
        exit 1
        ;;
esac
