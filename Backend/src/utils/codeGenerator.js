/**
 * Code Generator Utility
 * Generates secure random codes for password reset
 */

const crypto = require('crypto');

/**
 * Generate a random 6-digit verification code
 * @returns {string} 6-digit code
 */
const generateResetCode = () => {
  // Generate a random number between 100000 and 999999
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString();
};

/**
 * Generate a cryptographically secure 6-digit code
 * More secure alternative using crypto module
 * @returns {string} 6-digit code
 */
const generateSecureResetCode = () => {
  // Generate 3 random bytes and convert to number
  const randomBytes = crypto.randomBytes(3);
  const randomNumber = parseInt(randomBytes.toString('hex'), 16);
  
  // Ensure it's a 6-digit number
  const code = (randomNumber % 900000) + 100000;
  return code.toString();
};

/**
 * Calculate expiry time for reset code
 * @param {number} minutes - Minutes until expiry (default: 10)
 * @returns {Date} Expiry date
 */
const getResetCodeExpiry = (minutes = 10) => {
  // Use UTC time to avoid timezone issues
  const now = new Date();
  const expiry = new Date(now.getTime() + (minutes * 60 * 1000));
  return expiry;
};

/**
 * Check if reset code has expired
 * @param {Date} expiryDate - Expiry date to check
 * @returns {boolean} True if expired
 */
const isResetCodeExpired = (expiryDate) => {
  if (!expiryDate) return true;
  return new Date() > new Date(expiryDate);
};

/**
 * Format time remaining until expiry
 * @param {Date} expiryDate - Expiry date
 * @returns {string} Formatted time remaining (e.g., "5 minutes")
 */
const getTimeRemaining = (expiryDate) => {
  if (!expiryDate) return '0 minutes';
  
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffMs = expiry - now;
  
  if (diffMs <= 0) return '0 minutes';
  
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffSeconds = Math.floor((diffMs % 60000) / 1000);
  
  if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  }
  return `${diffSeconds} second${diffSeconds > 1 ? 's' : ''}`;
};

module.exports = {
  generateResetCode,
  generateSecureResetCode,
  getResetCodeExpiry,
  isResetCodeExpired,
  getTimeRemaining
};
