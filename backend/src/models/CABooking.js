// =====================================================
// CA BOOKING MODEL
// Manages consultation bookings with CA firms
// =====================================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const enterpriseLogger = require('../utils/logger');

const CABooking = sequelize.define('CABooking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  firmId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'firm_id',
    references: {
      model: 'ca_firms',
      key: 'id',
    },
    comment: 'CA firm for the booking',
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'User who made the booking (nullable for guest bookings)',
  },
  clientName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'client_name',
    comment: 'Name of the client',
  },
  clientEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'client_email',
    validate: {
      isEmail: true,
    },
    comment: 'Email of the client',
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'date',
    comment: 'Booking date',
  },
  timeSlot: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'time_slot',
    comment: 'Time slot (e.g., "10:00 AM", "02:00 PM")',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'notes',
    comment: 'Additional notes from client',
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show'),
    defaultValue: 'pending',
    allowNull: false,
    field: 'status',
    comment: 'Booking status',
  },
  confirmedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'confirmed_at',
    comment: 'Timestamp when booking was confirmed',
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'cancelled_at',
    comment: 'Timestamp when booking was cancelled',
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'cancellation_reason',
    comment: 'Reason for cancellation',
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    field: 'metadata',
    comment: 'Additional booking data',
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'created_at',
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'updated_at',
  },
}, {
  tableName: 'ca_bookings',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['firm_id'],
    },
    {
      fields: ['user_id'],
    },
    {
      fields: ['date'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['firm_id', 'date'],
      name: 'idx_bookings_firm_date',
    },
    {
      fields: ['firm_id', 'date', 'time_slot'],
      unique: true,
      name: 'unique_booking_slot',
      comment: 'Ensure no double booking for same firm, date, and time slot',
    },
  ],
});

// Instance methods
CABooking.prototype.confirm = async function() {
  try {
    await this.update({
      status: 'confirmed',
      confirmedAt: new Date(),
    });

    enterpriseLogger.info('Booking confirmed', {
      bookingId: this.id,
      firmId: this.firmId,
    });

    return this;
  } catch (error) {
    enterpriseLogger.error('Confirm booking error', {
      bookingId: this.id,
      error: error.message,
    });
    throw error;
  }
};

CABooking.prototype.cancel = async function(reason) {
  try {
    await this.update({
      status: 'cancelled',
      cancelledAt: new Date(),
      cancellationReason: reason,
    });

    enterpriseLogger.info('Booking cancelled', {
      bookingId: this.id,
      firmId: this.firmId,
      reason,
    });

    return this;
  } catch (error) {
    enterpriseLogger.error('Cancel booking error', {
      bookingId: this.id,
      error: error.message,
    });
    throw error;
  }
};

// Class methods
CABooking.findByFirm = async function(firmId, options = {}) {
  try {
    const { date, status, limit = 50, offset = 0 } = options;
    const whereClause = { firmId };

    if (date) {
      whereClause.date = date;
    }

    if (status) {
      whereClause.status = status;
    }

    return await CABooking.findAndCountAll({
      where: whereClause,
      order: [['date', 'ASC'], ['timeSlot', 'ASC']],
      limit,
      offset,
    });
  } catch (error) {
    enterpriseLogger.error('Find bookings by firm error', {
      firmId,
      error: error.message,
    });
    throw error;
  }
};

CABooking.findByUser = async function(userId, options = {}) {
  try {
    const { limit = 50, offset = 0 } = options;

    return await CABooking.findAndCountAll({
      where: { userId },
      order: [['date', 'DESC']],
      limit,
      offset,
    });
  } catch (error) {
    enterpriseLogger.error('Find bookings by user error', {
      userId,
      error: error.message,
    });
    throw error;
  }
};

CABooking.getAvailableSlots = async function(firmId, date) {
  try {
    // Get all bookings for the firm on the given date
    const bookings = await CABooking.findAll({
      where: {
        firmId,
        date,
        status: ['pending', 'confirmed'],
      },
      attributes: ['timeSlot'],
    });

    const bookedSlots = bookings.map(b => b.timeSlot);

    // Default available slots (can be customized per firm)
    const allSlots = [
      '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
      '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
      '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
      '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
      '05:00 PM', '05:30 PM',
    ];

    // Return available slots (not booked)
    return allSlots.filter(slot => !bookedSlots.includes(slot));
  } catch (error) {
    enterpriseLogger.error('Get available slots error', {
      firmId,
      date,
      error: error.message,
    });
    throw error;
  }
};

module.exports = CABooking;

