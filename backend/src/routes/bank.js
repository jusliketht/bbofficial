// =====================================================
// BANK ROUTES
// Routes for bank API integration and transaction fetching
// =====================================================

const express = require('express');
const BankController = require('../controllers/BankController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// =====================================================
// BANK API ROUTES
// =====================================================

// Get supported banks
router.get('/supported', authenticateToken, async (req, res) => {
  await BankController.getSupportedBanks(req, res);
});

// Authenticate with bank API
router.post('/:bank/auth', authenticateToken, async (req, res) => {
  await BankController.authenticateBankAPI(req, res);
});

// Fetch bank transactions
router.get('/:bank/transactions', authenticateToken, async (req, res) => {
  await BankController.fetchTransactions(req, res);
});

// Detect deductions from transactions
router.post('/detect-deductions', authenticateToken, async (req, res) => {
  await BankController.detectDeductions(req, res);
});

// Get account summary
router.get('/:bank/summary', authenticateToken, async (req, res) => {
  await BankController.getAccountSummary(req, res);
});

// =====================================================
// ACCOUNT AGGREGATOR ROUTES (Future)
// =====================================================

// Connect Account Aggregator
router.post('/account-aggregator/connect', authenticateToken, async (req, res) => {
  await BankController.connectAccountAggregator(req, res);
});

module.exports = router;
