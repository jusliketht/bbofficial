// =====================================================
// COOKIE AUTHENTICATION MIDDLEWARE
// =====================================================

const jwt = require('jsonwebtoken');
const { User, UserSession } = require('../models');
const enterpriseLogger = require('../utils/logger');

/**
 * Middleware to authenticate using HttpOnly cookies
 */
const authenticateWithCookies = async (req, res, next) => {
  try {
    // Get refresh token from HttpOnly cookie
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        error: 'No refresh token provided'
      });
    }

    // Find session by refresh token
    const sessions = await UserSession.findAll({
      where: {
        revoked: false,
        expiresAt: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });

    let validSession = null;
    for (const session of sessions) {
      const bcrypt = require('bcryptjs');
      const isValid = await bcrypt.compare(refreshToken, session.refreshTokenHash);
      if (isValid) {
        validSession = session;
        break;
      }
    }

    if (!validSession) {
      return res.status(401).json({
        error: 'Invalid refresh token'
      });
    }

    // Get user
    const user = await User.findByPk(validSession.userId);
    if (!user || user.status !== 'active') {
      return res.status(401).json({
        error: 'User not found or inactive'
      });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        tokenVersion: user.tokenVersion
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '15m' }
    );

    // Update session last active
    await validSession.update({ lastActive: new Date() });

    // Attach user info to request
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion
    };

    // Set new access token in response header
    res.setHeader('X-Access-Token', accessToken);

    next();
  } catch (error) {
    enterpriseLogger.error('Cookie authentication failed', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Authentication failed'
    });
  }
};

/**
 * Middleware to set HttpOnly cookies for refresh tokens
 */
const setRefreshTokenCookie = (res, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  });
};

/**
 * Middleware to clear refresh token cookie
 */
const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
};

module.exports = {
  authenticateWithCookies,
  setRefreshTokenCookie,
  clearRefreshTokenCookie
};
