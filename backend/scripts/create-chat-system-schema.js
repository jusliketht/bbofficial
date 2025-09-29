const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function createChatSystemSchema() {
  const client = await pool.connect();
  
  try {
    console.log('💬 Creating Chat System Schema...');
    
    // Chat Rooms Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_rooms (
        room_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_name VARCHAR(255),
        room_type VARCHAR(50) NOT NULL, -- 'ticket_chat', 'general_support', 'ca_consultation', 'admin_chat'
        description TEXT,
        
        -- Relationships
        ticket_id UUID REFERENCES service_tickets(ticket_id) ON DELETE CASCADE,
        filing_id UUID REFERENCES filings(filing_id) ON DELETE CASCADE,
        
        -- Room Settings
        is_active BOOLEAN DEFAULT TRUE,
        is_private BOOLEAN DEFAULT FALSE,
        max_participants INTEGER DEFAULT 10,
        
        -- Audit
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        
        CONSTRAINT valid_room_type CHECK (room_type IN ('ticket_chat', 'general_support', 'ca_consultation', 'admin_chat', 'group_chat'))
      )
    `);
    console.log('✅ Chat rooms table created');
    
    // Chat Room Participants Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_room_participants (
        participant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_id UUID NOT NULL REFERENCES chat_rooms(room_id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        
        -- Participant Details
        role VARCHAR(50) NOT NULL, -- 'user', 'ca', 'admin', 'moderator'
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_active BOOLEAN DEFAULT TRUE,
        
        -- Permissions
        can_send_messages BOOLEAN DEFAULT TRUE,
        can_send_files BOOLEAN DEFAULT TRUE,
        can_add_participants BOOLEAN DEFAULT FALSE,
        
        -- Audit
        added_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
        
        CONSTRAINT unique_room_participant UNIQUE (room_id, user_id),
        CONSTRAINT valid_participant_role CHECK (role IN ('user', 'ca', 'admin', 'moderator'))
      )
    `);
    console.log('✅ Chat room participants table created');
    
    // Chat Messages Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_id UUID NOT NULL REFERENCES chat_rooms(room_id) ON DELETE CASCADE,
        
        -- Message Content
        message_text TEXT NOT NULL,
        message_type VARCHAR(30) NOT NULL DEFAULT 'text', -- 'text', 'file', 'image', 'system', 'notification'
        
        -- Sender
        sender_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        sender_role VARCHAR(50) NOT NULL,
        
        -- Message Metadata
        reply_to_message_id UUID REFERENCES chat_messages(message_id) ON DELETE SET NULL,
        is_edited BOOLEAN DEFAULT FALSE,
        edited_at TIMESTAMP WITH TIME ZONE,
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_at TIMESTAMP WITH TIME ZONE,
        deleted_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
        
        -- Attachments
        attachments JSONB DEFAULT '[]',
        
        -- Message Status
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP WITH TIME ZONE,
        read_by JSONB DEFAULT '[]', -- Array of user IDs who read the message
        
        -- Audit
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        CONSTRAINT valid_message_type CHECK (message_type IN ('text', 'file', 'image', 'system', 'notification', 'emoji'))
      )
    `);
    console.log('✅ Chat messages table created');
    
    // Chat Message Reactions Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_message_reactions (
        reaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        message_id UUID NOT NULL REFERENCES chat_messages(message_id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        
        -- Reaction Details
        reaction_type VARCHAR(20) NOT NULL, -- 'like', 'love', 'laugh', 'angry', 'sad', 'wow'
        emoji VARCHAR(10),
        
        -- Audit
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        CONSTRAINT unique_user_message_reaction UNIQUE (message_id, user_id),
        CONSTRAINT valid_reaction_type CHECK (reaction_type IN ('like', 'love', 'laugh', 'angry', 'sad', 'wow', 'custom'))
      )
    `);
    console.log('✅ Chat message reactions table created');
    
    // Chat Typing Indicators Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_typing_indicators (
        indicator_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_id UUID NOT NULL REFERENCES chat_rooms(room_id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        
        -- Typing Status
        is_typing BOOLEAN DEFAULT TRUE,
        started_typing_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        CONSTRAINT unique_room_user_typing UNIQUE (room_id, user_id)
      )
    `);
    console.log('✅ Chat typing indicators table created');
    
    // Chat Notifications Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_notifications (
        notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        room_id UUID NOT NULL REFERENCES chat_rooms(room_id) ON DELETE CASCADE,
        message_id UUID REFERENCES chat_messages(message_id) ON DELETE CASCADE,
        
        -- Notification Details
        notification_type VARCHAR(50) NOT NULL, -- 'new_message', 'mention', 'room_invite', 'message_reaction'
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        
        -- Status
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP WITH TIME ZONE,
        
        -- Delivery
        sent_via_email BOOLEAN DEFAULT FALSE,
        sent_via_push BOOLEAN DEFAULT FALSE,
        sent_via_sms BOOLEAN DEFAULT FALSE,
        
        -- Audit
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        CONSTRAINT valid_notification_type CHECK (notification_type IN ('new_message', 'mention', 'room_invite', 'message_reaction', 'system'))
      )
    `);
    console.log('✅ Chat notifications table created');
    
    // Chat Room Settings Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_room_settings (
        setting_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_id UUID NOT NULL REFERENCES chat_rooms(room_id) ON DELETE CASCADE,
        
        -- Room Settings
        allow_file_sharing BOOLEAN DEFAULT TRUE,
        allow_emoji_reactions BOOLEAN DEFAULT TRUE,
        allow_message_editing BOOLEAN DEFAULT TRUE,
        allow_message_deletion BOOLEAN DEFAULT TRUE,
        message_retention_days INTEGER DEFAULT 365,
        max_file_size_mb INTEGER DEFAULT 10,
        allowed_file_types TEXT[] DEFAULT ARRAY['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
        
        -- Moderation
        require_approval_for_new_members BOOLEAN DEFAULT FALSE,
        auto_delete_inactive_after_days INTEGER DEFAULT 30,
        
        -- Audit
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        CONSTRAINT unique_room_settings UNIQUE (room_id)
      )
    `);
    console.log('✅ Chat room settings table created');
    
    // Create Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_rooms_type ON chat_rooms(room_type);
      CREATE INDEX IF NOT EXISTS idx_chat_rooms_ticket_id ON chat_rooms(ticket_id);
      CREATE INDEX IF NOT EXISTS idx_chat_rooms_created_at ON chat_rooms(created_at);
      CREATE INDEX IF NOT EXISTS idx_chat_room_participants_room_id ON chat_room_participants(room_id);
      CREATE INDEX IF NOT EXISTS idx_chat_room_participants_user_id ON chat_room_participants(user_id);
      CREATE INDEX IF NOT EXISTS idx_chat_room_participants_active ON chat_room_participants(is_active);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_type ON chat_messages(message_type);
      CREATE INDEX IF NOT EXISTS idx_chat_message_reactions_message_id ON chat_message_reactions(message_id);
      CREATE INDEX IF NOT EXISTS idx_chat_typing_indicators_room_id ON chat_typing_indicators(room_id);
      CREATE INDEX IF NOT EXISTS idx_chat_notifications_user_id ON chat_notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_chat_notifications_unread ON chat_notifications(is_read);
    `);
    console.log('✅ Indexes created');
    
    // Insert default chat room settings
    await client.query(`
      INSERT INTO chat_room_settings (
        room_id, allow_file_sharing, allow_emoji_reactions, 
        allow_message_editing, allow_message_deletion, 
        message_retention_days, max_file_size_mb
      ) 
      SELECT room_id, TRUE, TRUE, TRUE, TRUE, 365, 10
      FROM chat_rooms
      WHERE room_id NOT IN (SELECT room_id FROM chat_room_settings)
    `);
    console.log('✅ Default chat room settings applied');
    
    console.log('\n🎉 Chat System Schema created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating chat system schema:', error.message);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

// Run the schema creation
createChatSystemSchema()
  .then(() => {
    console.log('✅ Chat system schema implementation completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Chat system schema implementation failed:', error);
    process.exit(1);
  });

