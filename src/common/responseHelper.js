/**
 * Standardized API Response Helper
 */

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {Object|Array} [data={}] - Response data payload
 * @param {Object} [meta={}] - Additional metadata (e.g., pagination)
 */
export const sendSuccess = (res, statusCode, message, data = {}, meta = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta: Object.keys(meta).length ? meta : undefined,
  });
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Array} [errors=[]] - Array of specific error details
 */
export const sendError = (res, statusCode, message, errors = []) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    statusCode,
  });
};
