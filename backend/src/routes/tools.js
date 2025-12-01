// =====================================================
// TOOLS ROUTES
// Investment planning, deadlines, and knowledge base
// Mounted at: /api/tools
// =====================================================

const express = require('express');
const ToolsController = require('../controllers/ToolsController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const toolsController = new ToolsController();

// =====================================================
// INVESTMENT PLANNING ROUTES
// =====================================================

// Get investment recommendations
router.get('/investment-planning/recommendations', authenticateToken, async (req, res) => {
  await toolsController.getInvestmentRecommendations(req, res);
});

// Calculate NPS benefits
router.post('/investment-planning/nps-calculator', authenticateToken, async (req, res) => {
  await toolsController.calculateNPSBenefits(req, res);
});

// =====================================================
// DEADLINES & REMINDERS ROUTES
// =====================================================

// Get deadlines
router.get('/deadlines', authenticateToken, async (req, res) => {
  await toolsController.getDeadlines(req, res);
});

// Create reminder
router.post('/deadlines/reminders', authenticateToken, async (req, res) => {
  await toolsController.createReminder(req, res);
});

// Update reminder
router.put('/deadlines/reminders/:reminderId', authenticateToken, async (req, res) => {
  await toolsController.updateReminder(req, res);
});

// Delete reminder
router.delete('/deadlines/reminders/:reminderId', authenticateToken, async (req, res) => {
  await toolsController.deleteReminder(req, res);
});

// =====================================================
// KNOWLEDGE BASE ROUTES
// =====================================================

// Search knowledge base
router.get('/knowledge-base/search', authenticateToken, async (req, res) => {
  await toolsController.searchKnowledgeBase(req, res);
});

// Get topic
router.get('/knowledge-base/topics/:topicId', authenticateToken, async (req, res) => {
  await toolsController.getTopic(req, res);
});

// Get section explanation
router.get('/knowledge-base/sections/:sectionId', authenticateToken, async (req, res) => {
  await toolsController.getSectionExplanation(req, res);
});

module.exports = router;

