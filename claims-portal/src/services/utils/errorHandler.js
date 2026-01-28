/**
 * Centralized Error Handler
 * Provides consistent error handling and logging across the application
 */

import eventBus, { EventTypes } from '../sync/eventBus';

/**
 * Error Severity Levels
 */
export const ErrorSeverity = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

/**
 * Error Categories
 */
export const ErrorCategory = {
  NETWORK: 'network',
  AUTH: 'auth',
  VALIDATION: 'validation',
  BUSINESS: 'business',
  SYSTEM: 'system',
  EXTERNAL_API: 'external_api'
};

/**
 * Handle API Error
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 * @param {string} severity - Error severity
 * @returns {Object} Formatted error object
 */
export const handleAPIError = (error, context, severity = ErrorSeverity.ERROR) => {
  const errorInfo = {
    message: error.message || 'An unknown error occurred',
    context,
    severity,
    timestamp: new Date().toISOString(),
    category: ErrorCategory.EXTERNAL_API
  };

  // Extract additional info from API error
  if (error.status) {
    errorInfo.status = error.status;
  }
  if (error.data) {
    errorInfo.data = error.data;
  }

  // Categorize by status code
  if (error.status) {
    if (error.status === 401 || error.status === 403) {
      errorInfo.category = ErrorCategory.AUTH;
    } else if (error.status >= 400 && error.status < 500) {
      errorInfo.category = ErrorCategory.VALIDATION;
    } else if (error.status >= 500) {
      errorInfo.category = ErrorCategory.SYSTEM;
    }
  }

  logError(errorInfo);
  return errorInfo;
};

/**
 * Handle Validation Error
 * @param {string} message - Error message
 * @param {Object} details - Validation details
 * @param {string} context - Context where error occurred
 * @returns {Object} Formatted error object
 */
export const handleValidationError = (message, details, context) => {
  const errorInfo = {
    message,
    details,
    context,
    severity: ErrorSeverity.WARNING,
    category: ErrorCategory.VALIDATION,
    timestamp: new Date().toISOString()
  };

  logError(errorInfo);
  return errorInfo;
};

/**
 * Handle Business Logic Error
 * @param {string} message - Error message
 * @param {Object} details - Additional details
 * @param {string} context - Context where error occurred
 * @returns {Object} Formatted error object
 */
export const handleBusinessError = (message, details, context) => {
  const errorInfo = {
    message,
    details,
    context,
    severity: ErrorSeverity.ERROR,
    category: ErrorCategory.BUSINESS,
    timestamp: new Date().toISOString()
  };

  logError(errorInfo);
  return errorInfo;
};

/**
 * Handle System Error
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 * @returns {Object} Formatted error object
 */
export const handleSystemError = (error, context) => {
  const errorInfo = {
    message: error.message || 'System error occurred',
    stack: error.stack,
    context,
    severity: ErrorSeverity.CRITICAL,
    category: ErrorCategory.SYSTEM,
    timestamp: new Date().toISOString()
  };

  logError(errorInfo);
  return errorInfo;
};

/**
 * Log Error
 * Logs to console and optionally sends to logging service
 * @param {Object} errorInfo - Error information object
 */
const logError = (errorInfo) => {
  const logLevel = errorInfo.severity === ErrorSeverity.CRITICAL ? 'error' : 'warn';

  console[logLevel](`[Error] ${errorInfo.context}:`, errorInfo);

  // Publish error event for global error handling
  eventBus.publish('error.occurred', errorInfo);

  // TODO: Send to external logging service (e.g., Sentry, Datadog)
  // sendToLoggingService(errorInfo);
};

/**
 * Get user-friendly error message
 * @param {Object} errorInfo - Error information object
 * @returns {string} User-friendly message
 */
export const getUserMessage = (errorInfo) => {
  // Map common error scenarios to user-friendly messages
  const messageMap = {
    [ErrorCategory.NETWORK]: 'Unable to connect to the server. Please check your internet connection.',
    [ErrorCategory.AUTH]: 'You do not have permission to perform this action. Please contact your administrator.',
    [ErrorCategory.VALIDATION]: errorInfo.message || 'Please check your input and try again.',
    [ErrorCategory.BUSINESS]: errorInfo.message || 'Unable to complete this operation.',
    [ErrorCategory.SYSTEM]: 'A system error occurred. Please try again later.',
    [ErrorCategory.EXTERNAL_API]: 'Unable to communicate with external system. Please try again later.'
  };

  return messageMap[errorInfo.category] || 'An unexpected error occurred. Please contact support.';
};

/**
 * Retry failed operation with exponential backoff
 * @param {Function} operation - Async operation to retry
 * @param {number} maxAttempts - Maximum retry attempts
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise<*>}
 */
export const retryOperation = async (operation, maxAttempts = 3, baseDelay = 1000) => {
  let lastError;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt < maxAttempts - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`[Retry] Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

/**
 * Error boundary helper for React components
 * @param {Error} error - Error object
 * @param {Object} errorInfo - Error boundary info
 */
export const handleReactError = (error, errorInfo) => {
  const errorObject = {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    severity: ErrorSeverity.ERROR,
    category: ErrorCategory.SYSTEM,
    timestamp: new Date().toISOString()
  };

  logError(errorObject);
};

export default {
  handleAPIError,
  handleValidationError,
  handleBusinessError,
  handleSystemError,
  getUserMessage,
  retryOperation,
  handleReactError,
  ErrorSeverity,
  ErrorCategory
};
