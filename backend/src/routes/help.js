// =====================================================
// HELP ROUTES
// Help content, search, articles, and feedback
// Mounted at: /api/help
// =====================================================

const express = require('express');
const enterpriseLogger = require('../utils/logger');
const router = express.Router();

// Mock help content data (in production, this would come from a database)
const mockArticles = [
  {
    id: '1',
    title: 'How to file ITR-1 for salaried employees',
    snippet: 'Step-by-step guide to filing ITR-1 for salaried individuals',
    content: '<p>Complete guide to filing ITR-1...</p>',
    category: 'filing',
    readTime: 5,
    views: 1250,
    helpfulCount: 980,
    publishedDate: '2024-01-15',
  },
  {
    id: '2',
    title: 'Understanding HRA exemption calculation',
    snippet: 'Learn how to calculate and claim HRA exemption',
    content: '<p>HRA exemption guide...</p>',
    category: 'tax-deductions',
    readTime: 7,
    views: 980,
    helpfulCount: 750,
    publishedDate: '2024-01-20',
  },
];

/**
 * Search help content
 * GET /api/help/search?q=query&category=category&type=type
 */
router.get('/search', async (req, res) => {
  try {
    const { q, category, type, limit = 20, page = 1 } = req.query;

    // Mock search implementation
    let results = [...mockArticles];

    if (q) {
      const query = q.toLowerCase();
      results = results.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.snippet.toLowerCase().includes(query) ||
          article.content.toLowerCase().includes(query)
      );
    }

    if (category) {
      results = results.filter((article) => article.category === category);
    }

    const startIndex = (page - 1) * limit;
    const paginatedResults = results.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      data: {
        results: paginatedResults.map((article) => ({
          id: article.id,
          title: article.title,
          snippet: article.snippet,
          category: article.category,
          url: `/help/articles/${article.id}`,
        })),
        total: results.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(results.length / limit),
        query: q,
      },
    });
  } catch (error) {
    enterpriseLogger.error('Help search failed', {
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
 * Get articles by category
 * GET /api/help/articles?category=category&page=page&limit=limit
 */
router.get('/articles', async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;

    let articles = [...mockArticles];

    if (category) {
      articles = articles.filter((article) => article.category === category);
    }

    const startIndex = (page - 1) * limit;
    const paginatedArticles = articles.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      data: {
        articles: paginatedArticles,
        total: articles.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(articles.length / limit),
      },
    });
  } catch (error) {
    enterpriseLogger.error('Get articles failed', {
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
 * Get article details
 * GET /api/help/articles/:id
 */
router.get('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const article = mockArticles.find((a) => a.id === id);

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found',
      });
    }

    // Get related articles
    const relatedArticles = mockArticles
      .filter((a) => a.id !== id && a.category === article.category)
      .slice(0, 4);

    res.json({
      success: true,
      data: {
        article,
        relatedArticles,
      },
    });
  } catch (error) {
    enterpriseLogger.error('Get article details failed', {
      error: error.message,
      stack: error.stack,
      articleId: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * Submit article feedback
 * POST /api/help/articles/:id/feedback
 */
router.post('/articles/:id/feedback', async (req, res) => {
  try {
    const { id } = req.params;
    const { helpful, comment } = req.body;

    // In production, save feedback to database
    enterpriseLogger.info('Article feedback received', {
      articleId: id,
      helpful,
      comment,
    });

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
    });
  } catch (error) {
    enterpriseLogger.error('Submit feedback failed', {
      error: error.message,
      stack: error.stack,
      articleId: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

module.exports = router;

