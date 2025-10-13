// Authentication Cleanup Utilities
// Handles stale tokens and localStorage cleanup

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = () => {
  try {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('stayLoggedIn');
    localStorage.removeItem('userId');
    
    console.log('Auth data cleared from localStorage');
  } catch (error) {
    console.error('Failed to clear auth data:', error);
  }
};

/**
 * Check if a JWT token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} - True if token is expired
 */
export const isTokenExpired = (token) => {
  try {
    if (!token) return true;
    
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const tokenExpiry = tokenPayload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    
    return currentTime >= tokenExpiry;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true; // Assume expired if we can't parse
  }
};

/**
 * Get token expiry time in milliseconds
 * @param {string} token - JWT token
 * @returns {number} - Expiry time in milliseconds, or 0 if invalid
 */
export const getTokenExpiry = (token) => {
  try {
    if (!token) return 0;
    
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    return tokenPayload.exp * 1000;
  } catch (error) {
    console.error('Error getting token expiry:', error);
    return 0;
  }
};

/**
 * Get time until token expires in milliseconds
 * @param {string} token - JWT token
 * @returns {number} - Time until expiry in milliseconds, or 0 if expired/invalid
 */
export const getTimeUntilExpiry = (token) => {
  const expiry = getTokenExpiry(token);
  if (expiry === 0) return 0;
  
  const currentTime = Date.now();
  return Math.max(0, expiry - currentTime);
};

/**
 * Check if token needs refresh (expires within 5 minutes)
 * @param {string} token - JWT token
 * @returns {boolean} - True if token needs refresh
 */
export const needsTokenRefresh = (token) => {
  const timeUntilExpiry = getTimeUntilExpiry(token);
  const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  return timeUntilExpiry > 0 && timeUntilExpiry < fiveMinutes;
};

/**
 * Validate and clean up authentication state
 * @returns {Object} - { isValid: boolean, token: string|null, user: Object|null }
 */
export const validateAuthState = () => {
  try {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    const stayLoggedIn = localStorage.getItem('stayLoggedIn') === 'true';
    
    // If no stayLoggedIn flag, clear everything
    if (!stayLoggedIn) {
      clearAuthData();
      return { isValid: false, token: null, user: null };
    }
    
    // If no token, clear everything
    if (!token) {
      clearAuthData();
      return { isValid: false, token: null, user: null };
    }
    
    // Check if token is expired
    if (isTokenExpired(token)) {
      console.log('Token expired, clearing auth data');
      clearAuthData();
      return { isValid: false, token: null, user: null };
    }
    
    // Parse user data
    let userData = null;
    try {
      userData = user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      clearAuthData();
      return { isValid: false, token: null, user: null };
    }
    
    return { isValid: true, token, user: userData };
  } catch (error) {
    console.error('Error validating auth state:', error);
    clearAuthData();
    return { isValid: false, token: null, user: null };
  }
};

/**
 * Initialize authentication state on app startup
 * @returns {Object} - { isValid: boolean, token: string|null, user: Object|null }
 */
export const initializeAuthState = () => {
  console.log('Initializing auth state...');
  
  const authState = validateAuthState();
  
  if (authState.isValid) {
    console.log('Valid auth state found:', {
      hasToken: !!authState.token,
      hasUser: !!authState.user,
      userEmail: authState.user?.email,
      timeUntilExpiry: getTimeUntilExpiry(authState.token)
    });
  } else {
    console.log('No valid auth state found, user needs to login');
  }
  
  return authState;
};

const authCleanupUtils = {
  clearAuthData,
  isTokenExpired,
  getTokenExpiry,
  getTimeUntilExpiry,
  needsTokenRefresh,
  validateAuthState,
  initializeAuthState
};

export default authCleanupUtils;
