#!/bin/bash

# Burnblack ITR Platform - Automated Backup Cron Job
# This script runs daily backups and can be scheduled via cron

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/.."
LOG_FILE="$BACKEND_DIR/logs/backup.log"
BACKUP_SCRIPT="$SCRIPT_DIR/backup.js"

# Create logs directory if it doesn't exist
mkdir -p "$BACKEND_DIR/logs"

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Function to check if backup script exists
check_backup_script() {
    if [ ! -f "$BACKUP_SCRIPT" ]; then
        log_message "ERROR: Backup script not found at $BACKUP_SCRIPT"
        exit 1
    fi
}

# Function to run backup
run_backup() {
    log_message "Starting automated backup process"
    
    # Change to backend directory
    cd "$BACKEND_DIR"
    
    # Run backup script
    if node "$BACKUP_SCRIPT" backup; then
        log_message "Backup completed successfully"
        return 0
    else
        log_message "Backup failed with exit code $?"
        return 1
    fi
}

# Function to send notification (if configured)
send_notification() {
    local status=$1
    local message=$2
    
    # Email notification (if configured)
    if [ ! -z "$BACKUP_NOTIFICATION_EMAIL" ]; then
        echo "$message" | mail -s "Burnblack Backup $status" "$BACKUP_NOTIFICATION_EMAIL"
    fi
    
    # Slack notification (if configured)
    if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"Burnblack Backup $status: $message\"}" \
            "$SLACK_WEBHOOK_URL"
    fi
}

# Main execution
main() {
    log_message "=== Starting Burnblack Backup Job ==="
    
    # Check prerequisites
    check_backup_script
    
    # Run backup
    if run_backup; then
        log_message "Backup job completed successfully"
        send_notification "SUCCESS" "Daily backup completed successfully"
    else
        log_message "Backup job failed"
        send_notification "FAILED" "Daily backup failed - check logs"
        exit 1
    fi
    
    log_message "=== Backup Job Completed ==="
}

# Handle command line arguments
case "${1:-}" in
    "backup")
        main
        ;;
    "test")
        log_message "Testing backup script..."
        check_backup_script
        log_message "Backup script found and ready"
        ;;
    "status")
        if [ -f "$LOG_FILE" ]; then
            echo "Last backup log entries:"
            tail -20 "$LOG_FILE"
        else
            echo "No backup logs found"
        fi
        ;;
    *)
        echo "Usage: $0 [backup|test|status]"
        echo ""
        echo "Commands:"
        echo "  backup  - Run the backup process"
        echo "  test    - Test if backup script is ready"
        echo "  status  - Show recent backup logs"
        echo ""
        echo "To schedule daily backups, add to crontab:"
        echo "  0 2 * * * $0 backup"
        echo ""
        echo "Environment variables:"
        echo "  BACKUP_NOTIFICATION_EMAIL - Email for notifications"
        echo "  SLACK_WEBHOOK_URL - Slack webhook for notifications"
        exit 1
        ;;
esac
