# 🚀 BurnBlack Platform - Master Launch Checklist

## Overview
This is the comprehensive launch checklist for the BurnBlack tax filing platform. Follow this checklist step-by-step to ensure a successful production deployment.

---

## 📋 Phase 1: Infrastructure & DNS Setup

### AWS Lightsail Configuration
- [ ] **Provision Lightsail Instance**
  - [ ] Create Ubuntu 22.04 LTS instance (2GB RAM minimum)
  - [ ] Attach static IP address
  - [ ] Configure instance name: `burnblack-production`
  - [ ] Enable automatic snapshots

- [ ] **Provision Lightsail Database**
  - [ ] Create PostgreSQL 14 database
  - [ ] Configure database name: `burnblack_prod`
  - [ ] Set master username: `burnblack_user`
  - [ ] Generate secure master password
  - [ ] Configure firewall to allow connections from Lightsail instance only

### DNS Configuration (GoDaddy)
- [ ] **Main Domain Setup**
  - [ ] Point `@` (root) A record to Lightsail static IP
  - [ ] Point `www` CNAME record to `burnblack.com`
  - [ ] Verify DNS propagation (use `nslookup burnblack.com`)

- [ ] **Admin Subdomain Setup**
  - [ ] Create `admin` A record pointing to same static IP
  - [ ] Verify DNS propagation (use `nslookup admin.burnblack.com`)

---

## 🔒 Phase 2: Security Hardening

### Server Security
- [ ] **SSH Access Setup**
  - [ ] Generate SSH key pair on local machine
  - [ ] Add public key to Lightsail instance
  - [ ] Test SSH access: `ssh -i ~/.ssh/burnblack-key ubuntu@your-static-ip`

- [ ] **Run Security Hardening Script**
  ```bash
  chmod +x scripts/security-hardening.sh
  ./scripts/security-hardening.sh
  ```

- [ ] **Firewall Configuration**
  - [ ] Verify UFW is enabled: `sudo ufw status`
  - [ ] Confirm only ports 22, 80, 443 are open
  - [ ] Test SSH access still works

### SSL Certificates
- [ ] **Run SSL Setup Script**
  ```bash
  chmod +x scripts/ssl-setup.sh
  ./scripts/ssl-setup.sh
  ```

- [ ] **Verify SSL Certificates**
  - [ ] Test main site: `curl -I https://burnblack.com`
  - [ ] Test admin site: `curl -I https://admin.burnblack.com`
  - [ ] Check certificate expiration: `openssl s_client -connect burnblack.com:443`

---

## 🚀 Phase 3: Application Deployment

### Initial Server Setup
- [ ] **Run Lightsail Setup Script**
  ```bash
  chmod +x scripts/setup-lightsail.sh
  ./scripts/setup-lightsail.sh
  ```

- [ ] **Clone Repository**
  ```bash
  cd /var/www
  sudo git clone https://github.com/your-username/burnblack.git
  sudo chown -R ubuntu:ubuntu burnblack
  cd burnblack
  ```

### Environment Configuration
- [ ] **Create Production Environment File**
  ```bash
  cp backend/.env.production backend/.env
  nano backend/.env
  ```
  
  **Required Environment Variables:**
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3001`
  - [ ] `DATABASE_URL` (Lightsail database connection string)
  - [ ] `JWT_SECRET` (generate secure random string)
  - [ ] `JWT_REFRESH_SECRET` (generate secure random string)
  - [ ] `GOOGLE_CLIENT_ID` (production OAuth credentials)
  - [ ] `GOOGLE_CLIENT_SECRET` (production OAuth credentials)
  - [ ] `RAZORPAY_KEY_ID` (production payment gateway)
  - [ ] `RAZORPAY_KEY_SECRET` (production payment gateway)
  - [ ] `AWS_ACCESS_KEY_ID` (S3 storage)
  - [ ] `AWS_SECRET_ACCESS_KEY` (S3 storage)
  - [ ] `SENDGRID_API_KEY` (email service)
  - [ ] `TWILIO_ACCOUNT_SID` (SMS service)
  - [ ] `TWILIO_AUTH_TOKEN` (SMS service)
  - [ ] `SUREPASS_API_KEY` (PAN verification)
  - [ ] `ERI_API_KEY` (ITR submission)
  - [ ] `OPENAI_API_KEY` (CA Bot)

### Database Setup
- [ ] **Run Database Migrations**
  ```bash
  cd backend
  npm install --production
  npx sequelize-cli db:migrate --env production
  ```

- [ ] **Seed Initial Data**
  ```bash
  npx sequelize-cli db:seed:all --env production
  ```

### Application Deployment
- [ ] **Build Frontend**
  ```bash
  cd ../frontend
  npm install
  npm run build
  ```

- [ ] **Deploy Frontend**
  ```bash
  sudo cp -r build/* /var/www/html/
  sudo chown -R www-data:www-data /var/www/html
  ```

- [ ] **Configure Nginx**
  ```bash
  sudo cp nginx/burnblack.conf /etc/nginx/sites-available/
  sudo ln -s /etc/nginx/sites-available/burnblack.conf /etc/nginx/sites-enabled/
  sudo nginx -t
  sudo systemctl reload nginx
  ```

- [ ] **Start Application**
  ```bash
  cd /var/www/burnblack
  pm2 start ecosystem.config.js
  pm2 save
  ```

---

## 🔧 Phase 4: CI/CD Pipeline Setup

### GitHub Actions Configuration
- [ ] **Add Repository Secrets**
  - [ ] `LIGHTSAIL_HOST` (static IP address)
  - [ ] `LIGHTSAIL_USER` (ubuntu)
  - [ ] `LIGHTSAIL_SSH_KEY` (private SSH key)

- [ ] **Test CI/CD Pipeline**
  - [ ] Make a small change to code
  - [ ] Push to main branch
  - [ ] Verify GitHub Actions runs successfully
  - [ ] Confirm deployment completes

### Deployment Scripts
- [ ] **Make Scripts Executable**
  ```bash
  chmod +x scripts/deploy.sh
  chmod +x scripts/monitoring-setup.sh
  ```

- [ ] **Run Monitoring Setup**
  ```bash
  ./scripts/monitoring-setup.sh
  ```

---

## ✅ Phase 5: Pre-Launch Verification

### Functional Testing
- [ ] **Main Site Testing**
  - [ ] Homepage loads: `https://burnblack.com`
  - [ ] Login page works: `https://burnblack.com/login`
  - [ ] Google OAuth redirects properly
  - [ ] Registration flow works
  - [ ] Dashboard loads after login

- [ ] **Admin Panel Testing**
  - [ ] Admin login: `https://admin.burnblack.com`
  - [ ] User management works
  - [ ] Pricing control functions
  - [ ] Service ticket management works

- [ ] **API Testing**
  - [ ] Health check: `curl https://burnblack.com/api/health`
  - [ ] Authentication endpoints work
  - [ ] ITR filing endpoints work
  - [ ] Payment endpoints work

### Performance Testing
- [ ] **Load Testing**
  - [ ] Test with 10 concurrent users
  - [ ] Verify response times < 2 seconds
  - [ ] Check database connection pooling
  - [ ] Monitor memory usage

- [ ] **SSL Testing**
  - [ ] Test SSL Labs rating: https://www.ssllabs.com/ssltest/
  - [ ] Verify A+ rating
  - [ ] Check certificate chain
  - [ ] Test HSTS headers

### Security Testing
- [ ] **Security Headers**
  - [ ] Verify CSP headers
  - [ ] Check X-Frame-Options
  - [ ] Confirm X-XSS-Protection
  - [ ] Validate HSTS headers

- [ ] **Penetration Testing**
  - [ ] Test SQL injection protection
  - [ ] Verify XSS protection
  - [ ] Check CSRF protection
  - [ ] Test rate limiting

---

## 🎯 Phase 6: Go Live & Monitoring

### Launch Day
- [ ] **Final Pre-Launch Checks**
  - [ ] All tests passing
  - [ ] Monitoring systems active
  - [ ] Backup systems working
  - [ ] Support team ready

- [ ] **Switch to Production Mode**
  - [ ] Update payment gateway to live mode
  - [ ] Enable production logging
  - [ ] Activate monitoring alerts
  - [ ] Update DNS if needed

### Post-Launch Monitoring
- [ ] **System Monitoring**
  - [ ] Check CPU usage: `htop`
  - [ ] Monitor memory usage: `free -h`
  - [ ] Check disk space: `df -h`
  - [ ] Review application logs: `pm2 logs`

- [ ] **Application Monitoring**
  - [ ] Monitor error rates
  - [ ] Check response times
  - [ ] Verify user registrations
  - [ ] Monitor payment processing

- [ ] **Business Metrics**
  - [ ] Track user signups
  - [ ] Monitor ITR filings
  - [ ] Check payment success rates
  - [ ] Review support tickets

---

## 🆘 Emergency Procedures

### Rollback Plan
- [ ] **Database Rollback**
  ```bash
  # Restore from backup
  pg_restore -h localhost -U burnblack_user -d burnblack_prod backup.sql
  ```

- [ ] **Application Rollback**
  ```bash
  # Use PM2 to rollback
  pm2 rollback burnblack-backend
  ```

- [ ] **Frontend Rollback**
  ```bash
  # Restore previous build
  sudo cp -r /var/www/backups/frontend-build-* /var/www/html/
  ```

### Incident Response
- [ ] **Contact Information**
  - [ ] DevOps team: [phone/email]
  - [ ] Database admin: [phone/email]
  - [ ] Business owner: [phone/email]

- [ ] **Escalation Procedures**
  - [ ] Level 1: Application errors
  - [ ] Level 2: System failures
  - [ ] Level 3: Security incidents

---

## 📞 Support & Maintenance

### Regular Maintenance
- [ ] **Daily Tasks**
  - [ ] Check system health
  - [ ] Review error logs
  - [ ] Monitor performance metrics
  - [ ] Verify backups

- [ ] **Weekly Tasks**
  - [ ] Update system packages
  - [ ] Review security logs
  - [ ] Check SSL certificate status
  - [ ] Analyze user metrics

- [ ] **Monthly Tasks**
  - [ ] Security audit
  - [ ] Performance optimization
  - [ ] Database maintenance
  - [ ] Backup verification

### Documentation
- [ ] **Keep Updated**
  - [ ] System architecture diagrams
  - [ ] API documentation
  - [ ] User guides
  - [ ] Troubleshooting guides

---

## 🎉 Launch Complete!

Once all items in this checklist are completed, your BurnBlack platform is ready for production use. Remember to:

1. **Monitor closely** for the first 48 hours
2. **Have support team ready** to handle user inquiries
3. **Keep backups current** and test restore procedures
4. **Document any issues** and solutions for future reference

**Congratulations on launching BurnBlack! 🚀**

---

*Last updated: $(date)*
*Version: 1.0*
*Prepared by: BurnBlack Development Team*
