// =====================================================
// CA MARKETPLACE ROUTES - PUBLIC ENDPOINTS
// Public endpoints for browsing CA firms
// =====================================================

const express = require('express');
const { CAFirm, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const enterpriseLogger = require('../utils/logger');
const { Op } = require('sequelize');

const router = express.Router();

// =====================================================
// PUBLIC MARKETPLACE ENDPOINTS
// =====================================================

/**
 * Get all CA firms for marketplace (public)
 * GET /api/ca-marketplace/firms
 */
router.get('/firms', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      location,
      specialization,
      minRating,
      minPrice,
      maxPrice,
      search,
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {
      status: 'active', // Only show active firms
    };

    // Search filter
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Location filter (from address)
    if (location) {
      whereClause.address = { [Op.iLike]: `%${location}%` };
    }

    // Get firms with pagination
    const { count, rows: firms } = await CAFirm.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    // Get stats and metadata for each firm
    const firmsWithMetadata = await Promise.all(
      firms.map(async (firm) => {
        const stats = await CAFirm.getFirmStats(firm.id);
        const metadata = firm.metadata || {};

        // Apply filters that require metadata
        let includeFirm = true;

        if (specialization && metadata.specialization !== specialization) {
          includeFirm = false;
        }

        if (minRating && (metadata.rating || 0) < parseFloat(minRating)) {
          includeFirm = false;
        }

        if (minPrice && (metadata.startingPrice || 0) < parseFloat(minPrice)) {
          includeFirm = false;
        }

        if (maxPrice && (metadata.startingPrice || 0) > parseFloat(maxPrice)) {
          includeFirm = false;
        }

        if (!includeFirm) {
          return null;
        }

        return {
          id: firm.id,
          name: firm.name,
          address: firm.address,
          phone: firm.phone,
          email: firm.email,
          metadata: {
            rating: metadata.rating || 0,
            reviewCount: metadata.reviewCount || 0,
            startingPrice: metadata.startingPrice || null,
            specialization: metadata.specialization || 'General Tax',
            description: metadata.description || '',
            services: metadata.services || [],
            experience: metadata.experience || '',
          },
          stats: stats.stats,
        };
      }),
    );

    // Filter out nulls (firms that didn't match metadata filters)
    const filteredFirms = firmsWithMetadata.filter(Boolean);

    res.json({
      success: true,
      data: {
        firms: filteredFirms,
        pagination: {
          total: filteredFirms.length, // Note: This is approximate after metadata filtering
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    enterpriseLogger.error('Get CA firms for marketplace failed', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * Get CA firm details by ID (public)
 * GET /api/ca-marketplace/firms/:firmId
 */
router.get('/firms/:firmId', async (req, res) => {
  try {
    const { firmId } = req.params;

    const firm = await CAFirm.findByPk(firmId, {
      where: {
        status: 'active',
      },
    });

    if (!firm) {
      return res.status(404).json({
        success: false,
        error: 'CA firm not found',
      });
    }

    const stats = await CAFirm.getFirmStats(firmId);

    res.json({
      success: true,
      data: {
        firm: {
          ...firm.toJSON(),
          stats: stats.stats,
        },
      },
    });
  } catch (error) {
    enterpriseLogger.error('Get CA firm details failed', {
      error: error.message,
      stack: error.stack,
      firmId: req.params.firmId,
    });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * Get CA firm reviews (public)
 * GET /api/ca-marketplace/firms/:firmId/reviews
 */
router.get('/firms/:firmId/reviews', async (req, res) => {
  try {
    const { firmId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // TODO: Implement reviews model and fetch reviews
    // For now, return empty reviews
    res.json({
      success: true,
      data: {
        reviews: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: 0,
        },
      },
    });
  } catch (error) {
    enterpriseLogger.error('Get CA firm reviews failed', {
      error: error.message,
      stack: error.stack,
      firmId: req.params.firmId,
    });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * Get available time slots for CA firm (public)
 * GET /api/ca-marketplace/firms/:firmId/slots
 */
router.get('/firms/:firmId/slots', async (req, res) => {
  try {
    const { firmId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'Date parameter is required',
      });
    }

    // TODO: Implement availability system
    // For now, return mock time slots
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 17) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }

    res.json({
      success: true,
      data: {
        slots,
        date,
      },
    });
  } catch (error) {
    enterpriseLogger.error('Get available slots failed', {
      error: error.message,
      stack: error.stack,
      firmId: req.params.firmId,
    });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// =====================================================
// AUTHENTICATED ENDPOINTS
// =====================================================

/**
 * Send inquiry to CA firm (requires authentication)
 * POST /api/ca-marketplace/firms/:firmId/inquiry
 */
router.post('/firms/:firmId/inquiry', authenticateToken, async (req, res) => {
  try {
    const { firmId } = req.params;
    const userId = req.user.userId;
    const { message, type, filingId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    const firm = await CAFirm.findByPk(firmId);
    if (!firm || firm.status !== 'active') {
      return res.status(404).json({
        success: false,
        error: 'CA firm not found',
      });
    }

    // TODO: Implement inquiry model and save inquiry
    // TODO: Send email notification to CA firm

    enterpriseLogger.info('CA inquiry sent', {
      firmId,
      userId,
      type,
      filingId,
    });

    res.json({
      success: true,
      message: 'Inquiry sent successfully',
      data: {
        inquiryId: 'temp-id', // TODO: Return actual inquiry ID
      },
    });
  } catch (error) {
    enterpriseLogger.error('Send inquiry failed', {
      error: error.message,
      stack: error.stack,
      firmId: req.params.firmId,
      userId: req.user?.userId,
    });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * Book consultation with CA firm (requires authentication)
 * POST /api/ca-marketplace/firms/:firmId/book
 */
router.post('/firms/:firmId/book', authenticateToken, async (req, res) => {
  try {
    const { firmId } = req.params;
    const userId = req.user.userId;
    const { date, time, type, notes } = req.body;

    if (!date || !time) {
      return res.status(400).json({
        success: false,
        error: 'Date and time are required',
      });
    }

    const firm = await CAFirm.findByPk(firmId);
    if (!firm || firm.status !== 'active') {
      return res.status(404).json({
        success: false,
        error: 'CA firm not found',
      });
    }

    // TODO: Implement booking model and save booking
    // TODO: Check availability
    // TODO: Send email notifications

    enterpriseLogger.info('CA consultation booked', {
      firmId,
      userId,
      date,
      time,
      type,
    });

    res.json({
      success: true,
      message: 'Consultation booked successfully',
      data: {
        bookingId: 'temp-id', // TODO: Return actual booking ID
        date,
        time,
        type,
      },
    });
  } catch (error) {
    enterpriseLogger.error('Book consultation failed', {
      error: error.message,
      stack: error.stack,
      firmId: req.params.firmId,
      userId: req.user?.userId,
    });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

module.exports = router;

