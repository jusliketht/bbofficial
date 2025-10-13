// =====================================================
// BROKER ROUTES
// Routes for broker file processing and API integration
// =====================================================

const express = require('express');
const BrokerController = require('../controllers/BrokerController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// =====================================================
// BROKER FILE PROCESSING ROUTES
// =====================================================

// Process broker file upload
router.post('/process-file', authenticateToken, BrokerController.upload.single('file'), async (req, res) => {
  await BrokerController.processBrokerFile(req, res);
});

// Get supported brokers
router.get('/supported', authenticateToken, async (req, res) => {
  await BrokerController.getSupportedBrokers(req, res);
});

// =====================================================
// BROKER API ROUTES (Future)
// =====================================================

// Authenticate with broker API
router.post('/:broker/auth', authenticateToken, async (req, res) => {
  await BrokerController.authenticateBrokerAPI(req, res);
});

// Fetch capital gains from broker API
router.get('/:broker/capital-gains', authenticateToken, async (req, res) => {
  await BrokerController.fetchCapitalGainsFromAPI(req, res);
});

// Get broker API status
router.get('/:broker/status', authenticateToken, async (req, res) => {
  await BrokerController.getBrokerAPIStatus(req, res);
});

module.exports = router;
