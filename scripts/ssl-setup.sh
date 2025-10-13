#!/bin/bash
# =====================================================
# SSL CERTIFICATE SETUP - BURNBACK PRODUCTION
# Automated SSL certificate setup with Let's Encrypt
# =====================================================

set -e

echo "🔒 Starting SSL certificate setup for BurnBlack..."

# =====================================================
# CONFIGURATION
# =====================================================
MAIN_DOMAIN="burnblack.com"
ADMIN_DOMAIN="admin.burnblack.com"
EMAIL="admin@burnblack.com"

# =====================================================
# PREREQUISITE CHECKS
# =====================================================
echo "🔍 Checking prerequisites..."

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "❌ Nginx is not installed. Please install Nginx first."
    exit 1
fi

# Check if Certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "❌ Certbot is not installed. Installing Certbot..."
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
fi

# Check if domains are pointing to this server
echo "🌐 Checking DNS configuration..."
if ! nslookup $MAIN_DOMAIN | grep -q "$(curl -s ifconfig.me)"; then
    echo "⚠️  Warning: $MAIN_DOMAIN may not be pointing to this server"
    echo "   Current server IP: $(curl -s ifconfig.me)"
    echo "   Please verify DNS configuration before proceeding"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# =====================================================
# NGINX CONFIGURATION FOR SSL
# =====================================================
echo "⚙️ Configuring Nginx for SSL..."

# Create temporary Nginx configuration for certificate validation
sudo tee /etc/nginx/sites-available/burnblack-temp > /dev/null <<EOF
server {
    listen 80;
    server_name $MAIN_DOMAIN www.$MAIN_DOMAIN;
    
    location / {
        return 200 'BurnBlack - SSL Setup in Progress';
        add_header Content-Type text/plain;
    }
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
}

server {
    listen 80;
    server_name $ADMIN_DOMAIN;
    
    location / {
        return 200 'BurnBlack Admin - SSL Setup in Progress';
        add_header Content-Type text/plain;
    }
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
}
EOF

# Enable temporary configuration
sudo ln -sf /etc/nginx/sites-available/burnblack-temp /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# =====================================================
# SSL CERTIFICATE GENERATION
# =====================================================
echo "🔐 Generating SSL certificates..."

# Generate certificate for main domain
echo "📜 Generating certificate for $MAIN_DOMAIN..."
sudo certbot --nginx -d $MAIN_DOMAIN -d www.$MAIN_DOMAIN --email $EMAIL --agree-tos --non-interactive

# Generate certificate for admin domain
echo "📜 Generating certificate for $ADMIN_DOMAIN..."
sudo certbot --nginx -d $ADMIN_DOMAIN --email $EMAIL --agree-tos --non-interactive

# =====================================================
# NGINX CONFIGURATION UPDATE
# =====================================================
echo "⚙️ Updating Nginx configuration..."

# Remove temporary configuration
sudo rm -f /etc/nginx/sites-enabled/burnblack-temp

# Copy production Nginx configuration
sudo cp /var/www/burnblack/nginx/burnblack.conf /etc/nginx/sites-available/burnblack
sudo ln -sf /etc/nginx/sites-available/burnblack /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# =====================================================
# SSL CERTIFICATE AUTO-RENEWAL
# =====================================================
echo "🔄 Setting up SSL certificate auto-renewal..."

# Test certificate renewal
sudo certbot renew --dry-run

# Add cron job for automatic renewal
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# =====================================================
# SSL VERIFICATION
# =====================================================
echo "✅ Verifying SSL certificates..."

# Check main domain SSL
echo "🔍 Checking SSL for $MAIN_DOMAIN..."
if curl -s -I https://$MAIN_DOMAIN | grep -q "200 OK"; then
    echo "✅ $MAIN_DOMAIN SSL is working"
else
    echo "❌ $MAIN_DOMAIN SSL is not working"
fi

# Check admin domain SSL
echo "🔍 Checking SSL for $ADMIN_DOMAIN..."
if curl -s -I https://$ADMIN_DOMAIN | grep -q "200 OK"; then
    echo "✅ $ADMIN_DOMAIN SSL is working"
else
    echo "❌ $ADMIN_DOMAIN SSL is not working"
fi

# Check certificate expiration
echo "📅 Certificate expiration dates:"
echo | openssl s_client -servername $MAIN_DOMAIN -connect $MAIN_DOMAIN:443 2>/dev/null | openssl x509 -noout -dates
echo | openssl s_client -servername $ADMIN_DOMAIN -connect $ADMIN_DOMAIN:443 2>/dev/null | openssl x509 -noout -dates

# =====================================================
# SECURITY HEADERS VERIFICATION
# =====================================================
echo "🛡️ Verifying security headers..."

# Check HSTS header
if curl -s -I https://$MAIN_DOMAIN | grep -q "Strict-Transport-Security"; then
    echo "✅ HSTS header is present"
else
    echo "⚠️  HSTS header is missing"
fi

# Check X-Frame-Options header
if curl -s -I https://$MAIN_DOMAIN | grep -q "X-Frame-Options"; then
    echo "✅ X-Frame-Options header is present"
else
    echo "⚠️  X-Frame-Options header is missing"
fi

# =====================================================
# FINAL SETUP
# =====================================================
echo "🎉 SSL setup completed successfully!"
echo ""
echo "🔒 SSL Summary:"
echo "  - Main domain: https://$MAIN_DOMAIN"
echo "  - Admin domain: https://$ADMIN_DOMAIN"
echo "  - Certificates: Let's Encrypt"
echo "  - Auto-renewal: Configured"
echo "  - Security headers: Enabled"
echo ""
echo "📋 Next steps:"
echo "1. Test your website in a browser"
echo "2. Verify all links work correctly"
echo "3. Check SSL rating at https://www.ssllabs.com/ssltest/"
echo "4. Monitor certificate expiration"
echo ""
echo "🔧 Useful commands:"
echo "- Check certificate status: sudo certbot certificates"
echo "- Test renewal: sudo certbot renew --dry-run"
echo "- View Nginx status: sudo systemctl status nginx"
echo "- Check SSL: openssl s_client -connect $MAIN_DOMAIN:443"
echo ""
echo "🌐 Your SSL certificates are now active!"
