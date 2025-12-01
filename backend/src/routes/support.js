// =====================================================
// SUPPORT ROUTES
// Support tickets and contact
// Mounted at: /api/support
// =====================================================

const express = require('express');
const multer = require('multer');
const enterpriseLogger = require('../utils/logger');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/support/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed types: PDF, JPG, PNG, DOC, DOCX'), false);
    }
  },
});

/**
 * Create support ticket
 * POST /api/support/tickets
 */
router.post('/tickets', authenticateToken, upload.array('attachments', 5), async (req, res) => {
  try {
    const userId = req.user.userId;
    const { subject, message, category, priority } = req.body;
    const files = req.files || [];

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Subject and message are required',
      });
    }

    // Generate ticket ID
    const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // In production, save ticket to database
    enterpriseLogger.info('Support ticket created', {
      ticketId,
      userId,
      subject,
      category,
      priority,
      attachmentsCount: files.length,
    });

    res.json({
      success: true,
      ticketId,
      message: 'Support ticket created successfully',
      data: {
        ticket: {
          id: ticketId,
          subject,
          message,
          category: category || 'general',
          priority: priority || 'medium',
          status: 'open',
          createdAt: new Date().toISOString(),
          attachments: files.map((file) => ({
            filename: file.originalname,
            size: file.size,
            path: file.path,
          })),
        },
      },
    });
  } catch (error) {
    enterpriseLogger.error('Create support ticket failed', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.userId,
    });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create support ticket',
    });
  }
});

/**
 * Get user tickets
 * GET /api/support/tickets?status=status&category=category&page=page&limit=limit
 */
router.get('/tickets', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, category, page = 1, limit = 20 } = req.query;

    // Mock tickets (in production, fetch from database)
    const mockTickets = [
      {
        id: 'TKT-1234567890-ABC123',
        subject: 'Need help with ITR filing',
        category: 'filing',
        priority: 'medium',
        status: 'open',
        createdAt: new Date().toISOString(),
      },
    ];

    let tickets = mockTickets.filter((ticket) => ticket.userId === userId);

    if (status) {
      tickets = tickets.filter((ticket) => ticket.status === status);
    }

    if (category) {
      tickets = tickets.filter((ticket) => ticket.category === category);
    }

    const startIndex = (page - 1) * limit;
    const paginatedTickets = tickets.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      data: {
        tickets: paginatedTickets,
        total: tickets.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(tickets.length / limit),
      },
    });
  } catch (error) {
    enterpriseLogger.error('Get tickets failed', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.userId,
    });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * Get ticket details
 * GET /api/support/tickets/:ticketId
 */
router.get('/tickets/:ticketId', authenticateToken, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.userId;

    // Mock ticket (in production, fetch from database)
    const ticket = {
      id: ticketId,
      subject: 'Need help with ITR filing',
      message: 'I need assistance with filing my ITR',
      category: 'filing',
      priority: 'medium',
      status: 'open',
      createdAt: new Date().toISOString(),
      userId,
    };

    if (ticket.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: { ticket },
    });
  } catch (error) {
    enterpriseLogger.error('Get ticket details failed', {
      error: error.message,
      stack: error.stack,
      ticketId: req.params.ticketId,
      userId: req.user?.userId,
    });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * Add attachment to ticket
 * POST /api/support/tickets/:ticketId/attachments
 */
router.post('/tickets/:ticketId/attachments', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.userId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    // In production, save attachment to database and link to ticket
    enterpriseLogger.info('Attachment added to ticket', {
      ticketId,
      userId,
      filename: file.originalname,
      size: file.size,
    });

    res.json({
      success: true,
      message: 'Attachment added successfully',
      data: {
        attachment: {
          filename: file.originalname,
          size: file.size,
          path: file.path,
        },
      },
    });
  } catch (error) {
    enterpriseLogger.error('Add attachment failed', {
      error: error.message,
      stack: error.stack,
      ticketId: req.params.ticketId,
      userId: req.user?.userId,
    });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add attachment',
    });
  }
});

module.exports = router;

