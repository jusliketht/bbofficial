// =====================================================
// NOTIFICATION SYSTEM DATABASE MIGRATION
// Complete migration script for notification system
// =====================================================

const { Pool } = require('pg');
const { logger } = require('../utils/logger');

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'burnblack_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'burnblack',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function runNotificationSystemMigration() {
  const client = await pool.connect();
  
  try {
    logger.info('🚀 Starting notification system migration...');
    
    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    logger.info('✅ UUID extension enabled');

    // Create notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
          notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
          
          -- Notification Content
          type VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          priority VARCHAR(20) DEFAULT 'normal',
          category VARCHAR(50) DEFAULT 'general',
          
          -- Metadata and Context
          metadata JSONB DEFAULT '{}',
          channels JSONB DEFAULT '["in_app"]',
          expires_at TIMESTAMP WITH TIME ZONE,
          
          -- Related Entity (for context)
          related_entity_type VARCHAR(50),
          related_entity_id UUID,
          
          -- Status and Delivery
          is_read BOOLEAN DEFAULT FALSE,
          read_at TIMESTAMP WITH TIME ZONE,
          
          -- Delivery Status (for multi-channel)
          delivered_in_app BOOLEAN DEFAULT FALSE,
          delivered_email BOOLEAN DEFAULT FALSE,
          delivered_sms BOOLEAN DEFAULT FALSE,
          delivered_push BOOLEAN DEFAULT FALSE,
          
          -- Audit
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    logger.info('✅ Notifications table created');

    // Create notification preferences table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
          preference_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
          
          -- Channel Preferences
          enable_in_app BOOLEAN DEFAULT TRUE,
          enable_email BOOLEAN DEFAULT FALSE,
          enable_sms BOOLEAN DEFAULT FALSE,
          enable_push BOOLEAN DEFAULT FALSE,
          
          -- Category Preferences
          filing_notifications BOOLEAN DEFAULT TRUE,
          deadline_notifications BOOLEAN DEFAULT TRUE,
          system_notifications BOOLEAN DEFAULT TRUE,
          ca_notifications BOOLEAN DEFAULT TRUE,
          payment_notifications BOOLEAN DEFAULT TRUE,
          document_notifications BOOLEAN DEFAULT TRUE,
          compliance_notifications BOOLEAN DEFAULT TRUE,
          
          -- Priority Preferences
          high_priority_only BOOLEAN DEFAULT FALSE,
          urgent_notifications BOOLEAN DEFAULT TRUE,
          
          -- Timing Preferences
          quiet_hours_start TIME DEFAULT '22:00',
          quiet_hours_end TIME DEFAULT '08:00',
          timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
          
          -- Audit
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          
          UNIQUE(user_id)
      )
    `);
    logger.info('✅ Notification preferences table created');

    // Create notification templates table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notification_templates (
          template_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          template_name VARCHAR(100) NOT NULL UNIQUE,
          template_type VARCHAR(50) NOT NULL,
          category VARCHAR(50) NOT NULL,
          priority VARCHAR(20) DEFAULT 'normal',
          
          -- Template Content
          title_template TEXT NOT NULL,
          message_template TEXT NOT NULL,
          metadata_template JSONB DEFAULT '{}',
          
          -- Delivery Settings
          default_channels JSONB DEFAULT '["in_app"]',
          expires_hours INTEGER DEFAULT 168,
          
          -- Status
          is_active BOOLEAN DEFAULT TRUE,
          
          -- Audit
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    logger.info('✅ Notification templates table created');

    // Create notification delivery logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notification_delivery_logs (
          log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          notification_id UUID NOT NULL REFERENCES notifications(notification_id) ON DELETE CASCADE,
          channel VARCHAR(20) NOT NULL,
          
          -- Delivery Details
          delivery_status VARCHAR(20) NOT NULL,
          delivery_attempt INTEGER DEFAULT 1,
          delivery_timestamp TIMESTAMP WITH TIME ZONE,
          error_message TEXT,
          
          -- External Service Details
          external_id VARCHAR(255),
          external_status VARCHAR(50),
          
          -- Audit
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    logger.info('✅ Notification delivery logs table created');

    // Create real-time events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS realtime_events (
          event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          event_type VARCHAR(50) NOT NULL,
          event_data JSONB NOT NULL,
          
          -- Target Information
          target_user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
          target_role VARCHAR(50),
          target_room VARCHAR(100),
          
          -- Event Context
          source_user_id UUID REFERENCES users(user_id),
          source_system VARCHAR(50) DEFAULT 'burnblack',
          related_entity_type VARCHAR(50),
          related_entity_id UUID,
          
          -- Delivery Status
          is_broadcasted BOOLEAN DEFAULT FALSE,
          broadcasted_at TIMESTAMP WITH TIME ZONE,
          
          -- Audit
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    logger.info('✅ Real-time events table created');

    // Create indexes for performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_related_entity ON notifications(related_entity_type, related_entity_id)',
      
      'CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id)',
      
      'CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON notification_templates(template_type)',
      'CREATE INDEX IF NOT EXISTS idx_notification_templates_category ON notification_templates(category)',
      'CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON notification_templates(is_active)',
      
      'CREATE INDEX IF NOT EXISTS idx_delivery_logs_notification_id ON notification_delivery_logs(notification_id)',
      'CREATE INDEX IF NOT EXISTS idx_delivery_logs_channel ON notification_delivery_logs(channel)',
      'CREATE INDEX IF NOT EXISTS idx_delivery_logs_status ON notification_delivery_logs(delivery_status)',
      
      'CREATE INDEX IF NOT EXISTS idx_realtime_events_type ON realtime_events(event_type)',
      'CREATE INDEX IF NOT EXISTS idx_realtime_events_target_user ON realtime_events(target_user_id)',
      'CREATE INDEX IF NOT EXISTS idx_realtime_events_target_role ON realtime_events(target_role)',
      'CREATE INDEX IF NOT EXISTS idx_realtime_events_broadcasted ON realtime_events(is_broadcasted)',
      'CREATE INDEX IF NOT EXISTS idx_realtime_events_created_at ON realtime_events(created_at)'
    ];

    for (const indexQuery of indexes) {
      await client.query(indexQuery);
    }
    logger.info('✅ Performance indexes created');

    // Add constraints
    const constraints = [
      `ALTER TABLE notifications ADD CONSTRAINT valid_notification_type 
       CHECK (type IN ('filing_update', 'deadline_reminder', 'system_alert', 'ca_assignment', 'payment_status', 'document_upload', 'compliance_alert', 'user_action', 'bulk_operation'))`,
      
      `ALTER TABLE notifications ADD CONSTRAINT valid_notification_priority 
       CHECK (priority IN ('low', 'normal', 'high', 'urgent'))`,
      
      `ALTER TABLE notifications ADD CONSTRAINT valid_notification_category 
       CHECK (category IN ('filing', 'deadline', 'system', 'ca', 'payment', 'document', 'compliance', 'general'))`,
      
      `ALTER TABLE notification_delivery_logs ADD CONSTRAINT valid_delivery_channel 
       CHECK (channel IN ('in_app', 'email', 'sms', 'push'))`,
      
      `ALTER TABLE notification_delivery_logs ADD CONSTRAINT valid_delivery_status 
       CHECK (delivery_status IN ('pending', 'delivered', 'failed', 'bounced'))`
    ];

    for (const constraintQuery of constraints) {
      try {
        await client.query(constraintQuery);
      } catch (error) {
        // Constraint might already exist, continue
        logger.warn(`Constraint might already exist: ${error.message}`);
      }
    }
    logger.info('✅ Constraints added');

    // Insert default notification templates
    const templates = [
      {
        name: 'filing_started',
        type: 'filing_update',
        category: 'filing',
        priority: 'normal',
        title: 'Filing Started',
        message: 'Your ITR filing has been initiated. You can track progress in your dashboard.',
        metadata: '{"action": "view_filing", "icon": "file-text"}',
        channels: '["in_app"]'
      },
      {
        name: 'filing_completed',
        type: 'filing_update',
        category: 'filing',
        priority: 'high',
        title: 'Filing Completed',
        message: 'Your ITR filing has been completed successfully. Acknowledgement number: {{acknowledgement_number}}',
        metadata: '{"action": "download_ack", "icon": "check-circle"}',
        channels: '["in_app"]'
      },
      {
        name: 'filing_rejected',
        type: 'filing_update',
        category: 'filing',
        priority: 'urgent',
        title: 'Filing Rejected',
        message: 'Your ITR filing has been rejected. Please review and resubmit. Reason: {{rejection_reason}}',
        metadata: '{"action": "review_filing", "icon": "alert-circle"}',
        channels: '["in_app"]'
      },
      {
        name: 'deadline_approaching',
        type: 'deadline_reminder',
        category: 'deadline',
        priority: 'high',
        title: 'Deadline Approaching',
        message: 'Your ITR filing deadline is approaching. {{days_remaining}} days remaining.',
        metadata: '{"action": "start_filing", "icon": "clock"}',
        channels: '["in_app"]'
      },
      {
        name: 'ca_assigned',
        type: 'ca_assignment',
        category: 'ca',
        priority: 'normal',
        title: 'CA Assigned',
        message: 'CA {{ca_name}} has been assigned to your filing. You can communicate directly through the chat.',
        metadata: '{"action": "open_chat", "icon": "user"}',
        channels: '["in_app"]'
      },
      {
        name: 'document_uploaded',
        type: 'document_upload',
        category: 'document',
        priority: 'normal',
        title: 'Document Uploaded',
        message: 'Your document has been uploaded successfully and is under review.',
        metadata: '{"action": "view_documents", "icon": "upload"}',
        channels: '["in_app"]'
      },
      {
        name: 'system_maintenance',
        type: 'system_alert',
        category: 'system',
        priority: 'normal',
        title: 'System Maintenance',
        message: 'Scheduled maintenance will occur on {{maintenance_date}}. Service may be temporarily unavailable.',
        metadata: '{"action": "view_details", "icon": "settings"}',
        channels: '["in_app"]'
      },
      {
        name: 'payment_success',
        type: 'payment_status',
        category: 'payment',
        priority: 'normal',
        title: 'Payment Successful',
        message: 'Your payment of ₹{{amount}} has been processed successfully.',
        metadata: '{"action": "view_invoice", "icon": "credit-card"}',
        channels: '["in_app"]'
      },
      {
        name: 'compliance_alert',
        type: 'compliance_alert',
        category: 'compliance',
        priority: 'high',
        title: 'Compliance Alert',
        message: '{{alert_message}} Please take immediate action.',
        metadata: '{"action": "view_alert", "icon": "shield"}',
        channels: '["in_app"]'
      }
    ];

    for (const template of templates) {
      await client.query(`
        INSERT INTO notification_templates (
          template_name, template_type, category, priority, title_template, 
          message_template, metadata_template, default_channels
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (template_name) DO NOTHING
      `, [
        template.name, template.type, template.category, template.priority,
        template.title, template.message, template.metadata, template.channels
      ]);
    }
    logger.info('✅ Default notification templates inserted');

    // Insert default notification preferences for existing users
    await client.query(`
      INSERT INTO notification_preferences (
        user_id, enable_in_app, filing_notifications, deadline_notifications, 
        system_notifications, ca_notifications, payment_notifications, 
        document_notifications, compliance_notifications
      )
      SELECT user_id, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE
      FROM users
      WHERE user_id NOT IN (SELECT user_id FROM notification_preferences)
      ON CONFLICT (user_id) DO NOTHING
    `);
    logger.info('✅ Default notification preferences created for existing users');

    // Create triggers for updated_at timestamps
    await client.query(`
      CREATE OR REPLACE FUNCTION update_notification_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await client.query(`
      CREATE TRIGGER trigger_update_notification_updated_at
          BEFORE UPDATE ON notifications
          FOR EACH ROW
          EXECUTE FUNCTION update_notification_updated_at()
    `);

    await client.query(`
      CREATE TRIGGER trigger_update_notification_preferences_updated_at
          BEFORE UPDATE ON notification_preferences
          FOR EACH ROW
          EXECUTE FUNCTION update_notification_updated_at()
    `);

    await client.query(`
      CREATE TRIGGER trigger_update_notification_templates_updated_at
          BEFORE UPDATE ON notification_templates
          FOR EACH ROW
          EXECUTE FUNCTION update_notification_updated_at()
    `);
    logger.info('✅ Update triggers created');

    // Create utility functions
    await client.query(`
      CREATE OR REPLACE FUNCTION cleanup_old_notifications()
      RETURNS INTEGER AS $$
      DECLARE
          deleted_count INTEGER;
      BEGIN
          -- Delete notifications older than 90 days that are read
          DELETE FROM notifications 
          WHERE is_read = TRUE 
          AND created_at < NOW() - INTERVAL '90 days';
          
          GET DIAGNOSTICS deleted_count = ROW_COUNT;
          
          -- Delete expired notifications
          DELETE FROM notifications 
          WHERE expires_at IS NOT NULL 
          AND expires_at < NOW();
          
          GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
          
          RETURN deleted_count;
      END;
      $$ LANGUAGE plpgsql
    `);

    await client.query(`
      CREATE OR REPLACE FUNCTION get_notification_stats(p_user_id UUID)
      RETURNS JSON AS $$
      DECLARE
          stats JSON;
      BEGIN
          SELECT json_build_object(
              'total', COUNT(*),
              'unread', COUNT(CASE WHEN is_read = FALSE THEN 1 END),
              'high_priority_unread', COUNT(CASE WHEN priority = 'high' AND is_read = FALSE THEN 1 END),
              'urgent_unread', COUNT(CASE WHEN priority = 'urgent' AND is_read = FALSE THEN 1 END),
              'filing_unread', COUNT(CASE WHEN category = 'filing' AND is_read = FALSE THEN 1 END),
              'deadline_unread', COUNT(CASE WHEN category = 'deadline' AND is_read = FALSE THEN 1 END),
              'system_unread', COUNT(CASE WHEN category = 'system' AND is_read = FALSE THEN 1 END),
              'ca_unread', COUNT(CASE WHEN category = 'ca' AND is_read = FALSE THEN 1 END),
              'payment_unread', COUNT(CASE WHEN category = 'payment' AND is_read = FALSE THEN 1 END),
              'document_unread', COUNT(CASE WHEN category = 'document' AND is_read = FALSE THEN 1 END),
              'compliance_unread', COUNT(CASE WHEN category = 'compliance' AND is_read = FALSE THEN 1 END)
          ) INTO stats
          FROM notifications 
          WHERE user_id = p_user_id 
          AND (expires_at IS NULL OR expires_at > NOW());
          
          RETURN stats;
      END;
      $$ LANGUAGE plpgsql
    `);
    logger.info('✅ Utility functions created');

    logger.info('🎉 Notification system migration completed successfully!');
    
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if called directly
if (require.main === module) {
  runNotificationSystemMigration()
    .then(() => {
      logger.info('✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { runNotificationSystemMigration };
