// =====================================================
// ANALYTICS ROUTES
// Routes for analytics and performance tracking
// =====================================================

const express = require('express');
const router = express.Router();
const enterpriseLogger = require('../utils/logger');
const { sendSuccess, sendError } = require('../utils/responseFormatter');
const { optionalAuth } = require('../middleware/auth');

// =====================================================
// WEB VITALS ANALYTICS ENDPOINT
// =====================================================

/**
 * @route   POST /api/analytics/web-vitals
 * @desc    Receive and store Web Vitals performance metrics
 * @access  Public (no auth required for performance tracking)
 */
router.post('/web-vitals', async (req, res) => {
  try {
    const {
      name,
      value,
      id,
      delta,
      rating,
      navigationType,
      url,
      timestamp,
    } = req.body;

    // Validate required fields
    if (!name || value === undefined) {
      return sendError(
        res,
        'Missing required fields: name and value',
        400,
      );
    }

    // Log the web vital metric
    enterpriseLogger.info('Web Vital metric received', {
      name,
      value,
      id,
      delta,
      rating,
      navigationType,
      url,
      timestamp,
      userAgent: req.get('user-agent'),
      ip: req.ip,
    });

    // TODO: Store in database for analytics dashboard
    // For now, just log and return success
    // Future: Create WebVital model and store metrics

    return sendSuccess(res, 'Web Vital metric recorded', {
      name,
      value,
      rating,
      timestamp: timestamp || Date.now(),
    });
  } catch (error) {
    enterpriseLogger.error('Error processing web vital metric', {
      error: error.message,
      stack: error.stack,
      body: req.body,
    });

    return sendError(
      res,
      'Failed to process web vital metric',
      500,
      error.message,
    );
  }
});

// =====================================================
// GENERIC EVENT CAPTURE ENDPOINT (Funnel + UX analytics)
// =====================================================

/**
 * @route   POST /api/analytics/events
 * @desc    Receive UX/funnel events (optionally associated with user if token present)
 * @access  Public (optional auth)
 */
router.post('/events', optionalAuth, async (req, res) => {
  try {
    const { name, timestamp, sessionId, journeyId, properties } = req.body || {};

    if (!name) {
      return sendError(res, 'Missing required field: name', 400);
    }

    enterpriseLogger.info('Analytics event received', {
      name,
      timestamp: timestamp || new Date().toISOString(),
      sessionId: sessionId || null,
      journeyId: journeyId || null,
      userId: req.user?.userId || req.user?.id || null,
      role: req.user?.role || null,
      properties: properties || {},
      userAgent: req.get('user-agent'),
      ip: req.ip,
    });

    // TODO: Persist to DB/warehouse (model: AnalyticsEvent)
    return sendSuccess(res, 'Event recorded', {
      name,
      receivedAt: new Date().toISOString(),
    });
  } catch (error) {
    enterpriseLogger.error('Error processing analytics event', {
      error: error.message,
      stack: error.stack,
      body: req.body,
    });

    return sendError(res, 'Failed to process analytics event', 500, error.message);
  }
});

// =====================================================
// EXPORTS
// =====================================================

module.exports = router;

