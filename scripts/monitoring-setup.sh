#!/bin/bash
# =====================================================
# MONITORING SETUP - BURNBACK PRODUCTION
# Comprehensive monitoring and logging setup
# =====================================================

set -e

echo "📊 Starting monitoring setup for BurnBlack..."

# =====================================================
# LOGGING CONFIGURATION
# =====================================================
echo "📝 Setting up logging configuration..."

# Create log directories
sudo mkdir -p /var/log/burnblack
sudo mkdir -p /var/log/nginx
sudo mkdir -p /var/log/pm2

# Set permissions
sudo chown -R ubuntu:ubuntu /var/log/burnblack
sudo chown -R www-data:www-data /var/log/nginx
sudo chown -R ubuntu:ubuntu /var/log/pm2

# =====================================================
# SYSTEM MONITORING
# =====================================================
echo "📈 Setting up system monitoring..."

# Install monitoring tools
sudo apt-get update
sudo apt-get install -y htop iotop nethogs sysstat

# Enable sysstat
sudo systemctl enable sysstat
sudo systemctl start sysstat

# =====================================================
# APPLICATION MONITORING
# =====================================================
echo "🔍 Setting up application monitoring..."

# Create application monitoring script
sudo tee /usr/local/bin/burnblack-app-monitor.sh > /dev/null <<'EOF'
#!/bin/bash
# BurnBlack Application Monitoring Script

LOG_FILE="/var/log/burnblack/app-monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# PM2 Status
PM2_STATUS=$(pm2 jlist | jq -r '.[0].pm2_env.status' 2>/dev/null || echo "unknown")
PM2_RESTART_COUNT=$(pm2 jlist | jq -r '.[0].pm2_env.restart_time' 2>/dev/null || echo "0")

# Nginx Status
NGINX_STATUS=$(systemctl is-active nginx)
NGINX_ERRORS=$(sudo tail -n 100 /var/log/nginx/error.log | grep -c "$(date '+%Y/%m/%d')" 2>/dev/null || echo "0")

# Database Status (if applicable)
DB_STATUS="unknown"
if command -v psql &> /dev/null; then
    DB_STATUS=$(psql -h localhost -U burnblack_user -d burnblack_prod -t -c "SELECT 1;" 2>/dev/null && echo "connected" || echo "disconnected")
fi

# Application Health Check
APP_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health 2>/dev/null || echo "000")

# Disk Usage
DISK_USAGE=$(df -h / | awk 'NR==2{printf "%s", $5}' | sed 's/%//')

# Memory Usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')

# Log monitoring data
echo "[$DATE] PM2: $PM2_STATUS (restarts: $PM2_RESTART_COUNT), Nginx: $NGINX_STATUS (errors: $NGINX_ERRORS), DB: $DB_STATUS, App: $APP_HEALTH, Disk: ${DISK_USAGE}%, Memory: ${MEMORY_USAGE}%" >> $LOG_FILE

# Alert conditions
ALERT=false
ALERT_MESSAGE=""

if [[ "$PM2_STATUS" != "online" ]]; then
    ALERT=true
    ALERT_MESSAGE="$ALERT_MESSAGE PM2 not online;"
fi

if [[ "$NGINX_STATUS" != "active" ]]; then
    ALERT=true
    ALERT_MESSAGE="$ALERT_MESSAGE Nginx not active;"
fi

if [[ "$APP_HEALTH" != "200" ]]; then
    ALERT=true
    ALERT_MESSAGE="$ALERT_MESSAGE App health check failed;"
fi

if [[ "$DISK_USAGE" -gt 80 ]]; then
    ALERT=true
    ALERT_MESSAGE="$ALERT_MESSAGE High disk usage;"
fi

if (( $(echo "$MEMORY_USAGE > 80" | bc -l) )); then
    ALERT=true
    ALERT_MESSAGE="$ALERT_MESSAGE High memory usage;"
fi

if [[ "$PM2_RESTART_COUNT" -gt 10 ]]; then
    ALERT=true
    ALERT_MESSAGE="$ALERT_MESSAGE High PM2 restart count;"
fi

if [[ "$NGINX_ERRORS" -gt 50 ]]; then
    ALERT=true
    ALERT_MESSAGE="$ALERT_MESSAGE High Nginx error count;"
fi

if [[ "$ALERT" == true ]]; then
    echo "[$DATE] ALERT: $ALERT_MESSAGE" >> $LOG_FILE
    
    # Send alert (you can customize this)
    # Example: Send email, Slack notification, etc.
    echo "ALERT: $ALERT_MESSAGE" | logger -t burnblack-monitor
fi
EOF

# Make monitoring script executable
sudo chmod +x /usr/local/bin/burnblack-app-monitor.sh

# Set up cron job for application monitoring (every 2 minutes)
(crontab -l 2>/dev/null; echo "*/2 * * * * /usr/local/bin/burnblack-app-monitor.sh") | crontab -

# =====================================================
# LOG ROTATION
# =====================================================
echo "🔄 Setting up log rotation..."

# Create logrotate configuration
sudo tee /etc/logrotate.d/burnblack > /dev/null <<EOF
/var/log/burnblack/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 ubuntu ubuntu
    postrotate
        pm2 reloadLogs
    endscript
}

/var/log/nginx/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}

/var/log/pm2/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 ubuntu ubuntu
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# =====================================================
# UPTIME MONITORING
# =====================================================
echo "⏱️ Setting up uptime monitoring..."

# Create uptime monitoring script
sudo tee /usr/local/bin/burnblack-uptime.sh > /dev/null <<'EOF'
#!/bin/bash
# BurnBlack Uptime Monitoring Script

LOG_FILE="/var/log/burnblack/uptime.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# System uptime
UPTIME=$(uptime -p)

# Service uptimes
PM2_UPTIME=$(pm2 jlist | jq -r '.[0].pm2_env.pm_uptime' 2>/dev/null || echo "0")
NGINX_UPTIME=$(systemctl show nginx --property=ActiveEnterTimestamp --value 2>/dev/null || echo "unknown")

# Log uptime data
echo "[$DATE] System: $UPTIME, PM2: $PM2_UPTIME, Nginx: $NGINX_UPTIME" >> $LOG_FILE
EOF

# Make uptime script executable
sudo chmod +x /usr/local/bin/burnblack-uptime.sh

# Set up cron job for uptime monitoring (every hour)
(crontab -l 2>/dev/null; echo "0 * * * * /usr/local/bin/burnblack-uptime.sh") | crontab -

# =====================================================
# PERFORMANCE MONITORING
# =====================================================
echo "⚡ Setting up performance monitoring..."

# Create performance monitoring script
sudo tee /usr/local/bin/burnblack-performance.sh > /dev/null <<'EOF'
#!/bin/bash
# BurnBlack Performance Monitoring Script

LOG_FILE="/var/log/burnblack/performance.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# CPU Usage
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')

# Memory Usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')

# Disk I/O
DISK_IO=$(iostat -d 1 1 | tail -n +4 | awk '{sum+=$3} END {print sum}')

# Network I/O
NETWORK_IO=$(cat /proc/net/dev | grep eth0 | awk '{print $2+$10}')

# Load Average
LOAD_AVERAGE=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')

# Log performance data
echo "[$DATE] CPU: ${CPU_USAGE}%, Memory: ${MEMORY_USAGE}%, Disk IO: ${DISK_IO}, Network IO: ${NETWORK_IO}, Load: ${LOAD_AVERAGE}" >> $LOG_FILE
EOF

# Make performance script executable
sudo chmod +x /usr/local/bin/burnblack-performance.sh

# Set up cron job for performance monitoring (every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/burnblack-performance.sh") | crontab -

# =====================================================
# ALERTING CONFIGURATION
# =====================================================
echo "🚨 Setting up alerting configuration..."

# Create alerting script
sudo tee /usr/local/bin/burnblack-alert.sh > /dev/null <<'EOF'
#!/bin/bash
# BurnBlack Alerting Script

ALERT_LOG="/var/log/burnblack/alerts.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Function to send alert
send_alert() {
    local message="$1"
    local severity="$2"
    
    echo "[$DATE] [$severity] $message" >> $ALERT_LOG
    
    # Log to system log
    logger -t burnblack-alert "[$severity] $message"
    
    # You can add more alerting methods here:
    # - Email notification
    # - Slack webhook
    # - SMS notification
    # - PagerDuty integration
}

# Check for critical alerts
if [[ -f "/var/log/burnblack/app-monitor.log" ]]; then
    # Check for recent alerts
    RECENT_ALERTS=$(tail -n 100 /var/log/burnblack/app-monitor.log | grep "ALERT:" | tail -n 1)
    
    if [[ -n "$RECENT_ALERTS" ]]; then
        send_alert "$RECENT_ALERTS" "CRITICAL"
    fi
fi
EOF

# Make alerting script executable
sudo chmod +x /usr/local/bin/burnblack-alert.sh

# Set up cron job for alerting (every 10 minutes)
(crontab -l 2>/dev/null; echo "*/10 * * * * /usr/local/bin/burnblack-alert.sh") | crontab -

# =====================================================
# MONITORING DASHBOARD
# =====================================================
echo "📊 Setting up monitoring dashboard..."

# Create simple monitoring dashboard script
sudo tee /usr/local/bin/burnblack-dashboard.sh > /dev/null <<'EOF'
#!/bin/bash
# BurnBlack Monitoring Dashboard

clear
echo "=================================================="
echo "           BURNBACK MONITORING DASHBOARD"
echo "=================================================="
echo ""

# System Information
echo "🖥️  SYSTEM INFORMATION"
echo "----------------------"
echo "Hostname: $(hostname)"
echo "Uptime: $(uptime -p)"
echo "Load Average: $(uptime | awk -F'load average:' '{print $2}')"
echo ""

# CPU and Memory
echo "💻 RESOURCE USAGE"
echo "-----------------"
echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')"
echo "Memory Usage: $(free -h | grep Mem | awk '{printf "%.1f%% (%s/%s)", $3/$2*100, $3, $2}')"
echo "Disk Usage: $(df -h / | awk 'NR==2{printf "%s (%s/%s)", $5, $3, $2}')"
echo ""

# Service Status
echo "🔧 SERVICE STATUS"
echo "-----------------"
echo "PM2 Status: $(pm2 jlist | jq -r '.[0].pm2_env.status' 2>/dev/null || echo "unknown")"
echo "Nginx Status: $(systemctl is-active nginx)"
echo "Database Status: $(psql -h localhost -U burnblack_user -d burnblack_prod -t -c "SELECT 1;" 2>/dev/null && echo "connected" || echo "disconnected")"
echo ""

# Application Health
echo "🏥 APPLICATION HEALTH"
echo "---------------------"
echo "Backend Health: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health 2>/dev/null || echo "000")"
echo "Frontend Health: $(curl -s -o /dev/null -w "%{http_code}" https://burnblack.com 2>/dev/null || echo "000")"
echo "Admin Health: $(curl -s -o /dev/null -w "%{http_code}" https://admin.burnblack.com 2>/dev/null || echo "000")"
echo ""

# Recent Logs
echo "📝 RECENT ALERTS"
echo "----------------"
if [[ -f "/var/log/burnblack/app-monitor.log" ]]; then
    tail -n 5 /var/log/burnblack/app-monitor.log | grep "ALERT:" || echo "No recent alerts"
else
    echo "No alert log found"
fi
echo ""

echo "=================================================="
echo "Last updated: $(date)"
echo "=================================================="
EOF

# Make dashboard script executable
sudo chmod +x /usr/local/bin/burnblack-dashboard.sh

# =====================================================
# FINAL SETUP
# =====================================================
echo "✅ Monitoring setup completed successfully!"
echo ""
echo "📊 Monitoring Summary:"
echo "  - System monitoring: Enabled"
echo "  - Application monitoring: Enabled"
echo "  - Performance monitoring: Enabled"
echo "  - Uptime monitoring: Enabled"
echo "  - Alerting: Configured"
echo "  - Log rotation: Configured"
echo "  - Monitoring dashboard: Available"
echo ""
echo "📋 Monitoring Features:"
echo "  - Real-time system metrics"
echo "  - Application health checks"
echo "  - Service status monitoring"
echo "  - Performance tracking"
echo "  - Automated alerting"
echo "  - Log management"
echo ""
echo "🔧 Useful commands:"
echo "- View monitoring dashboard: /usr/local/bin/burnblack-dashboard.sh"
echo "- Check application logs: tail -f /var/log/burnblack/app-monitor.log"
echo "- Check system logs: tail -f /var/log/burnblack/performance.log"
echo "- Check alerts: tail -f /var/log/burnblack/alerts.log"
echo "- View PM2 logs: pm2 logs"
echo "- View Nginx logs: sudo tail -f /var/log/nginx/error.log"
echo ""
echo "📈 Your monitoring system is now active!"
