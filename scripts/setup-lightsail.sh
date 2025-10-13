#!/bin/bash
# =====================================================
# LIGHTSAIL SETUP SCRIPT - PRODUCTION INFRASTRUCTURE
# Automated setup of AWS Lightsail instance for BurnBlack
# =====================================================

set -e

echo "🚀 Starting BurnBlack Lightsail setup..."

# =====================================================
# SYSTEM UPDATE AND BASIC PACKAGES
# =====================================================
echo "📦 Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

echo "📦 Installing basic packages..."
sudo apt-get install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# =====================================================
# NODE.JS INSTALLATION
# =====================================================
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version

# =====================================================
# PM2 INSTALLATION
# =====================================================
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Setup PM2 startup
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# =====================================================
# NGINX INSTALLATION
# =====================================================
echo "📦 Installing Nginx..."
sudo apt-get install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# =====================================================
# SSL CERTIFICATES (CERTBOT)
# =====================================================
echo "📦 Installing Certbot..."
sudo apt-get install -y certbot python3-certbot-nginx

# =====================================================
# POSTGRESQL CLIENT
# =====================================================
echo "📦 Installing PostgreSQL client..."
sudo apt-get install -y postgresql-client

# =====================================================
# AWS CLI
# =====================================================
echo "📦 Installing AWS CLI..."
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
rm -rf aws awscliv2.zip

# =====================================================
# APPLICATION DIRECTORY SETUP
# =====================================================
echo "📁 Setting up application directories..."
sudo mkdir -p /var/www/burnblack
sudo mkdir -p /var/www/html
sudo mkdir -p /var/www/admin
sudo mkdir -p /var/log/burnblack
sudo mkdir -p /var/log/nginx

# Set permissions
sudo chown -R ubuntu:ubuntu /var/www/burnblack
sudo chown -R www-data:www-data /var/www/html
sudo chown -R www-data:www-data /var/www/admin
sudo chown -R ubuntu:ubuntu /var/log/burnblack

# =====================================================
# FIREWALL CONFIGURATION
# =====================================================
echo "🔥 Configuring firewall..."
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# =====================================================
# LOG ROTATION SETUP
# =====================================================
echo "📝 Setting up log rotation..."
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
EOF

# =====================================================
# SYSTEM MONITORING
# =====================================================
echo "📊 Installing monitoring tools..."
sudo apt-get install -y htop iotop nethogs

# =====================================================
# SECURITY HARDENING
# =====================================================
echo "🔒 Applying security hardening..."

# Disable root login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/#MaxAuthTries 6/MaxAuthTries 3/' /etc/ssh/sshd_config

# Restart SSH
sudo systemctl restart ssh

# =====================================================
# AUTOMATIC SECURITY UPDATES
# =====================================================
echo "🔄 Setting up automatic security updates..."
sudo apt-get install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# =====================================================
# FINAL SETUP
# =====================================================
echo "✅ Lightsail setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Configure DNS records in GoDaddy"
echo "2. Set up SSL certificates with certbot"
echo "3. Deploy application code"
echo "4. Configure environment variables"
echo "5. Run database migrations"
echo ""
echo "🔧 Useful commands:"
echo "- Check system status: sudo systemctl status nginx"
echo "- Check PM2 status: pm2 status"
echo "- View logs: pm2 logs"
echo "- Restart services: sudo systemctl restart nginx"
echo ""
echo "🌐 Your server is ready for BurnBlack deployment!"
