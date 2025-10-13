#!/bin/bash
# =====================================================
# LAUNCH VERIFICATION SCRIPT - BURNBACK PRODUCTION
# Comprehensive verification script for production launch
# =====================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MAIN_DOMAIN="burnblack.com"
ADMIN_DOMAIN="admin.burnblack.com"
API_BASE="https://burnblack.com/api"
ADMIN_API_BASE="https://admin.burnblack.com/api"

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Logging functions
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED++))
}

error() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED++))
}

warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    ((WARNINGS++))
}

# =====================================================
# DNS VERIFICATION
# =====================================================
verify_dns() {
    log "Verifying DNS configuration..."
    
    # Check main domain
    if nslookup $MAIN_DOMAIN | grep -q "$(curl -s ifconfig.me)"; then
        success "Main domain DNS is correctly configured"
    else
        error "Main domain DNS is not pointing to this server"
    fi
    
    # Check admin domain
    if nslookup $ADMIN_DOMAIN | grep -q "$(curl -s ifconfig.me)"; then
        success "Admin domain DNS is correctly configured"
    else
        error "Admin domain DNS is not pointing to this server"
    fi
}

# =====================================================
# SSL VERIFICATION
# =====================================================
verify_ssl() {
    log "Verifying SSL certificates..."
    
    # Check main domain SSL
    if curl -s -I https://$MAIN_DOMAIN | grep -q "200 OK"; then
        success "Main domain SSL is working"
    else
        error "Main domain SSL is not working"
    fi
    
    # Check admin domain SSL
    if curl -s -I https://$ADMIN_DOMAIN | grep -q "200 OK"; then
        success "Admin domain SSL is working"
    else
        error "Admin domain SSL is not working"
    fi
    
    # Check certificate expiration
    MAIN_CERT_EXPIRY=$(echo | openssl s_client -servername $MAIN_DOMAIN -connect $MAIN_DOMAIN:443 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
    ADMIN_CERT_EXPIRY=$(echo | openssl s_client -servername $ADMIN_DOMAIN -connect $ADMIN_DOMAIN:443 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
    
    if [[ -n "$MAIN_CERT_EXPIRY" ]]; then
        success "Main domain certificate expires: $MAIN_CERT_EXPIRY"
    else
        error "Could not retrieve main domain certificate expiry"
    fi
    
    if [[ -n "$ADMIN_CERT_EXPIRY" ]]; then
        success "Admin domain certificate expires: $ADMIN_CERT_EXPIRY"
    else
        error "Could not retrieve admin domain certificate expiry"
    fi
}

# =====================================================
# SECURITY HEADERS VERIFICATION
# =====================================================
verify_security_headers() {
    log "Verifying security headers..."
    
    # Check HSTS header
    if curl -s -I https://$MAIN_DOMAIN | grep -q "Strict-Transport-Security"; then
        success "HSTS header is present"
    else
        warning "HSTS header is missing"
    fi
    
    # Check X-Frame-Options header
    if curl -s -I https://$MAIN_DOMAIN | grep -q "X-Frame-Options"; then
        success "X-Frame-Options header is present"
    else
        warning "X-Frame-Options header is missing"
    fi
    
    # Check X-Content-Type-Options header
    if curl -s -I https://$MAIN_DOMAIN | grep -q "X-Content-Type-Options"; then
        success "X-Content-Type-Options header is present"
    else
        warning "X-Content-Type-Options header is missing"
    fi
    
    # Check Content-Security-Policy header
    if curl -s -I https://$MAIN_DOMAIN | grep -q "Content-Security-Policy"; then
        success "Content-Security-Policy header is present"
    else
        warning "Content-Security-Policy header is missing"
    fi
}

# =====================================================
# SERVICE VERIFICATION
# =====================================================
verify_services() {
    log "Verifying system services..."
    
    # Check Nginx status
    if systemctl is-active nginx > /dev/null 2>&1; then
        success "Nginx is running"
    else
        error "Nginx is not running"
    fi
    
    # Check PM2 status
    if pm2 jlist | jq -r '.[0].pm2_env.status' 2>/dev/null | grep -q "online"; then
        success "PM2 application is running"
    else
        error "PM2 application is not running"
    fi
    
    # Check database connection
    if psql -h localhost -U burnblack_user -d burnblack_prod -t -c "SELECT 1;" > /dev/null 2>&1; then
        success "Database connection is working"
    else
        error "Database connection is not working"
    fi
}

# =====================================================
# API VERIFICATION
# =====================================================
verify_api() {
    log "Verifying API endpoints..."
    
    # Check health endpoint
    if curl -s -f $API_BASE/health | grep -q "healthy"; then
        success "Main API health check is working"
    else
        error "Main API health check is not working"
    fi
    
    # Check admin API health
    if curl -s -f $ADMIN_API_BASE/health | grep -q "healthy"; then
        success "Admin API health check is working"
    else
        error "Admin API health check is not working"
    fi
    
    # Check authentication endpoint
    if curl -s -f $API_BASE/auth/status | grep -q "unauthorized\|authenticated"; then
        success "Authentication endpoint is working"
    else
        error "Authentication endpoint is not working"
    fi
}

# =====================================================
# FRONTEND VERIFICATION
# =====================================================
verify_frontend() {
    log "Verifying frontend applications..."
    
    # Check main site
    if curl -s -f https://$MAIN_DOMAIN | grep -q "BurnBlack\|React"; then
        success "Main frontend is loading"
    else
        error "Main frontend is not loading"
    fi
    
    # Check admin panel
    if curl -s -f https://$ADMIN_DOMAIN | grep -q "BurnBlack\|React"; then
        success "Admin frontend is loading"
    else
        error "Admin frontend is not loading"
    fi
    
    # Check static assets
    if curl -s -f https://$MAIN_DOMAIN/static/js/main.js > /dev/null 2>&1; then
        success "Static assets are accessible"
    else
        warning "Static assets may not be accessible"
    fi
}

# =====================================================
# PERFORMANCE VERIFICATION
# =====================================================
verify_performance() {
    log "Verifying performance metrics..."
    
    # Check response time
    RESPONSE_TIME=$(curl -s -w "%{time_total}" -o /dev/null https://$MAIN_DOMAIN)
    if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l) )); then
        success "Response time is good: ${RESPONSE_TIME}s"
    else
        warning "Response time is slow: ${RESPONSE_TIME}s"
    fi
    
    # Check API response time
    API_RESPONSE_TIME=$(curl -s -w "%{time_total}" -o /dev/null $API_BASE/health)
    if (( $(echo "$API_RESPONSE_TIME < 1.0" | bc -l) )); then
        success "API response time is good: ${API_RESPONSE_TIME}s"
    else
        warning "API response time is slow: ${API_RESPONSE_TIME}s"
    fi
    
    # Check system resources
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
    if (( $(echo "$CPU_USAGE < 80" | bc -l) )); then
        success "CPU usage is acceptable: ${CPU_USAGE}%"
    else
        warning "CPU usage is high: ${CPU_USAGE}%"
    fi
    
    MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    if (( $(echo "$MEMORY_USAGE < 80" | bc -l) )); then
        success "Memory usage is acceptable: ${MEMORY_USAGE}%"
    else
        warning "Memory usage is high: ${MEMORY_USAGE}%"
    fi
}

# =====================================================
# MONITORING VERIFICATION
# =====================================================
verify_monitoring() {
    log "Verifying monitoring systems..."
    
    # Check log files
    if [[ -f "/var/log/burnblack/app-monitor.log" ]]; then
        success "Application monitoring logs are being created"
    else
        warning "Application monitoring logs are not being created"
    fi
    
    # Check PM2 monitoring
    if pm2 jlist | jq -r '.[0].pm2_env.status' 2>/dev/null | grep -q "online"; then
        success "PM2 monitoring is active"
    else
        error "PM2 monitoring is not active"
    fi
    
    # Check cron jobs
    if crontab -l | grep -q "burnblack"; then
        success "Monitoring cron jobs are configured"
    else
        warning "Monitoring cron jobs may not be configured"
    fi
}

# =====================================================
# SECURITY VERIFICATION
# =====================================================
verify_security() {
    log "Verifying security configuration..."
    
    # Check firewall
    if ufw status | grep -q "Status: active"; then
        success "Firewall is active"
    else
        error "Firewall is not active"
    fi
    
    # Check Fail2ban
    if systemctl is-active fail2ban > /dev/null 2>&1; then
        success "Fail2ban is running"
    else
        warning "Fail2ban is not running"
    fi
    
    # Check SSH configuration
    if grep -q "PermitRootLogin no" /etc/ssh/sshd_config; then
        success "SSH root login is disabled"
    else
        warning "SSH root login may be enabled"
    fi
    
    # Check automatic updates
    if systemctl is-enabled unattended-upgrades > /dev/null 2>&1; then
        success "Automatic updates are enabled"
    else
        warning "Automatic updates are not enabled"
    fi
}

# =====================================================
# MAIN VERIFICATION FUNCTION
# =====================================================
main() {
    echo "=================================================="
    echo "           BURNBACK LAUNCH VERIFICATION"
    echo "=================================================="
    echo ""
    
    # Run all verification checks
    verify_dns
    echo ""
    
    verify_ssl
    echo ""
    
    verify_security_headers
    echo ""
    
    verify_services
    echo ""
    
    verify_api
    echo ""
    
    verify_frontend
    echo ""
    
    verify_performance
    echo ""
    
    verify_monitoring
    echo ""
    
    verify_security
    echo ""
    
    # Summary
    echo "=================================================="
    echo "                 VERIFICATION SUMMARY"
    echo "=================================================="
    echo -e "${GREEN}Passed: $PASSED${NC}"
    echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
    echo -e "${RED}Failed: $FAILED${NC}"
    echo ""
    
    if [[ $FAILED -eq 0 ]]; then
        if [[ $WARNINGS -eq 0 ]]; then
            echo -e "${GREEN}🎉 ALL CHECKS PASSED! Your BurnBlack platform is ready for launch!${NC}"
        else
            echo -e "${YELLOW}⚠️  LAUNCH READY WITH WARNINGS. Please review and address warnings.${NC}"
        fi
    else
        echo -e "${RED}❌ LAUNCH NOT READY. Please fix the failed checks before proceeding.${NC}"
        exit 1
    fi
    
    echo ""
    echo "=================================================="
    echo "Next steps:"
    echo "1. Address any warnings or failures"
    echo "2. Run this script again to verify fixes"
    echo "3. Proceed with launch once all checks pass"
    echo "=================================================="
}

# Run main function
main "$@"
