#!/bin/bash
# =====================================================
# SECURITY HARDENING SCRIPT - BURNBACK PRODUCTION
# Comprehensive security hardening for production environment
# =====================================================

set -e

echo "🔒 Starting security hardening for BurnBlack production environment..."

# =====================================================
# SYSTEM UPDATE
# =====================================================
echo "📦 Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# =====================================================
# FAIL2BAN INSTALLATION AND CONFIGURATION
# =====================================================
echo "🛡️ Installing and configuring Fail2ban..."
sudo apt-get install -y fail2ban

# Create Fail2ban configuration
sudo tee /etc/fail2ban/jail.local > /dev/null <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
backend = systemd

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
EOF

# Start and enable Fail2ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# =====================================================
# SSH HARDENING
# =====================================================
echo "🔐 Hardening SSH configuration..."
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# SSH security settings
sudo tee -a /etc/ssh/sshd_config > /dev/null <<EOF

# BurnBlack SSH Security Settings
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
X11Forwarding no
AllowTcpForwarding no
AllowAgentForwarding no
PermitEmptyPasswords no
Protocol 2
EOF

# Restart SSH service
sudo systemctl restart ssh

# =====================================================
# FIREWALL CONFIGURATION
# =====================================================
echo "🔥 Configuring UFW firewall..."
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# =====================================================
# AUTOMATIC SECURITY UPDATES
# =====================================================
echo "🔄 Configuring automatic security updates..."
sudo apt-get install -y unattended-upgrades

# Configure unattended upgrades
sudo tee /etc/apt/apt.conf.d/50unattended-upgrades > /dev/null <<EOF
Unattended-Upgrade::Allowed-Origins {
    "\${distro_id}:\${distro_codename}";
    "\${distro_id}:\${distro_codename}-security";
    "\${distro_id}ESMApps:\${distro_codename}-apps-security";
    "\${distro_id}ESM:\${distro_codename}-infra-security";
};

Unattended-Upgrade::Package-Blacklist {
};

Unattended-Upgrade::DevRelease "false";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-New-Unused-Dependencies "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Automatic-Reboot-WithUsers "false";
Unattended-Upgrade::Automatic-Reboot-Time "02:00";
EOF

# Enable automatic updates
sudo dpkg-reconfigure -plow unattended-upgrades

# =====================================================
# LOG ROTATION CONFIGURATION
# =====================================================
echo "📝 Configuring log rotation..."
sudo tee /etc/logrotate.d/burnblack > /dev/null <<EOF
/var/log/burnblack/*.log {
    daily
    missingok
    rotate 52
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
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}
EOF

# =====================================================
# MONITORING TOOLS
# =====================================================
echo "📊 Installing monitoring tools..."
sudo apt-get install -y htop iotop nethogs

# =====================================================
# SYSTEM MONITORING SCRIPT
# =====================================================
echo "📈 Setting up system monitoring..."
sudo tee /usr/local/bin/burnblack-monitor.sh > /dev/null <<'EOF'
#!/bin/bash
# BurnBlack System Monitoring Script

LOG_FILE="/var/log/burnblack/system-monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# CPU Usage
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')

# Memory Usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.2f", $3/$2 * 100.0)}')

# Disk Usage
DISK_USAGE=$(df -h / | awk 'NR==2{printf "%s", $5}')

# PM2 Status
PM2_STATUS=$(pm2 jlist | jq -r '.[0].pm2_env.status' 2>/dev/null || echo "unknown")

# Nginx Status
NGINX_STATUS=$(systemctl is-active nginx)

# Database Connections (if applicable)
DB_CONNECTIONS=$(psql -h localhost -U burnblack_user -d burnblack_prod -t -c "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null || echo "0")

# Log monitoring data
echo "[$DATE] CPU: ${CPU_USAGE}%, Memory: ${MEMORY_USAGE}%, Disk: ${DISK_USAGE}, PM2: ${PM2_STATUS}, Nginx: ${NGINX_STATUS}, DB: ${DB_CONNECTIONS}" >> $LOG_FILE

# Alert if thresholds exceeded
if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
    echo "[$DATE] ALERT: High CPU usage: ${CPU_USAGE}%" >> $LOG_FILE
fi

if (( $(echo "$MEMORY_USAGE > 80" | bc -l) )); then
    echo "[$DATE] ALERT: High memory usage: ${MEMORY_USAGE}%" >> $LOG_FILE
fi

if [[ "$DISK_USAGE" > "80%" ]]; then
    echo "[$DATE] ALERT: High disk usage: ${DISK_USAGE}" >> $LOG_FILE
fi

if [[ "$PM2_STATUS" != "online" ]]; then
    echo "[$DATE] ALERT: PM2 process not online: ${PM2_STATUS}" >> $LOG_FILE
fi

if [[ "$NGINX_STATUS" != "active" ]]; then
    echo "[$DATE] ALERT: Nginx not active: ${NGINX_STATUS}" >> $LOG_FILE
fi
EOF

# Make monitoring script executable
sudo chmod +x /usr/local/bin/burnblack-monitor.sh

# Set up cron job for monitoring (every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/burnblack-monitor.sh") | crontab -

# =====================================================
# SECURITY SCAN
# =====================================================
echo "🔍 Running security scan..."
sudo apt-get install -y rkhunter chkrootkit

# Update rkhunter database
sudo rkhunter --update

# Run security scan
sudo rkhunter --check --skip-keypress --report-warnings-only

# =====================================================
# FINAL SECURITY CHECKS
# =====================================================
echo "✅ Security hardening completed!"
echo ""
echo "🔒 Security Summary:"
echo "  - Fail2ban: Installed and configured"
echo "  - SSH: Hardened (root login disabled, key-only auth)"
echo "  - Firewall: UFW configured (SSH, HTTP, HTTPS only)"
echo "  - Automatic updates: Enabled"
echo "  - Log rotation: Configured"
echo "  - Monitoring: Installed and configured"
echo "  - Security scan: Completed"
echo ""
echo "📋 Next steps:"
echo "1. Test SSH access with your key"
echo "2. Verify firewall rules"
echo "3. Check Fail2ban status"
echo "4. Monitor system logs"
echo ""
echo "🔧 Useful commands:"
echo "- Check Fail2ban status: sudo fail2ban-client status"
echo "- Check firewall status: sudo ufw status"
echo "- View system logs: sudo journalctl -f"
echo "- Check monitoring: tail -f /var/log/burnblack/system-monitor.log"
echo ""
echo "🛡️ Your server is now security hardened!"
