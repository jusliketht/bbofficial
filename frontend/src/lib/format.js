// =====================================================
// FORMATTING UTILITIES
// Number, currency, and date formatting functions
// =====================================================

/**
 * Format a number as Indian currency (₹ prefix, Indian locale)
 * @param {number} amount - Amount to format
 * @param {object} options - Formatting options
 * @param {boolean} options.showDecimals - Whether to show decimal places (default: false)
 * @returns {string} Formatted currency string
 */
export function formatIndianCurrency(amount, options = {}) {
  const { showDecimals = false } = options;

  if (typeof amount !== 'number' || isNaN(amount)) {
    return '₹0';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
}

/**
 * Format a number with Indian locale (comma separators)
 * @param {number} num - Number to format
 * @param {object} options - Formatting options
 * @param {number} options.decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted number string
 */
export function formatIndianNumber(num, options = {}) {
  const { decimals = 0 } = options;

  if (typeof num !== 'number' || isNaN(num)) {
    return '0';
  }

  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Parse a formatted Indian number string to number
 * @param {string} str - Formatted number string (may include ₹, commas)
 * @returns {number} Parsed number
 */
export function parseIndianNumber(str) {
  if (!str || typeof str !== 'string') {
    return 0;
  }
  // Remove currency symbol, commas, and whitespace
  const cleaned = str.replace(/[₹,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format percentage with Indian locale
 * @param {number} value - Percentage value (0-100)
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value, decimals = 1) {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0%';
  }
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format date in Indian format (DD/MM/YYYY)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatIndianDate(date) {
  if (!date) {
    return '';
  }

  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) {
    return '';
  }

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Format date and time in Indian format
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date-time string
 */
export function formatIndianDateTime(date) {
  if (!date) {
    return '';
  }

  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) {
    return '';
  }

  const dateStr = formatIndianDate(d);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${dateStr} ${hours}:${minutes}`;
}

/**
 * Format large numbers with abbreviations (Lakh, Crore)
 * @param {number} num - Number to format
 * @returns {string} Formatted string (e.g., "₹10.5L", "₹2.3Cr")
 */
export function formatCompactCurrency(num) {
  if (typeof num !== 'number' || isNaN(num)) {
    return '₹0';
  }

  if (num >= 10000000) {
    const crores = num / 10000000;
    return `₹${crores.toFixed(1)}Cr`;
  }

  if (num >= 100000) {
    const lakhs = num / 100000;
    return `₹${lakhs.toFixed(1)}L`;
  }

  if (num >= 1000) {
    const thousands = num / 1000;
    return `₹${thousands.toFixed(1)}K`;
  }

  return formatIndianCurrency(num);
}

