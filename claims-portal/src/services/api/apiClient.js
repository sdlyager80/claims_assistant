/**
 * Base API Client with Retry Logic, Timeout, and Error Handling
 * Provides a centralized HTTP client for all service integrations
 */

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_RETRY_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 second

/**
 * API Client Configuration
 */
const config = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: DEFAULT_TIMEOUT,
  retryAttempts: DEFAULT_RETRY_ATTEMPTS,
  retryDelay: DEFAULT_RETRY_DELAY,
  headers: {
    'Content-Type': 'application/json'
  }
};

/**
 * Sleep utility for retry delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay
 */
const getRetryDelay = (attempt, baseDelay) => {
  return baseDelay * Math.pow(2, attempt);
};

/**
 * Determine if error is retryable
 */
const isRetryableError = (error) => {
  // Retry on network errors or 5xx server errors
  if (!error.response) return true;
  const status = error.response.status;
  return status >= 500 && status < 600;
};

/**
 * Error Response Handler
 */
class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Request wrapper with timeout
 */
const requestWithTimeout = async (url, options, timeout) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new APIError('Request timeout', 408, null);
    }
    throw error;
  }
};

/**
 * Make HTTP Request with Retry Logic
 */
const makeRequest = async (endpoint, options = {}, retryCount = 0) => {
  const url = `${config.baseURL}${endpoint}`;

  const requestOptions = {
    method: options.method || 'GET',
    headers: {
      ...config.headers,
      ...(options.headers || {})
    },
    ...(options.body && { body: JSON.stringify(options.body) })
  };

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    requestOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    console.log(`[API] ${requestOptions.method} ${url}`, { attempt: retryCount + 1 });

    const response = await requestWithTimeout(
      url,
      requestOptions,
      options.timeout || config.timeout
    );

    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new APIError(
        errorData?.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    // Parse response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return await response.text();

  } catch (error) {
    console.error(`[API] Error on ${requestOptions.method} ${url}:`, error);

    // Retry logic
    if (
      isRetryableError(error) &&
      retryCount < (options.retryAttempts || config.retryAttempts)
    ) {
      const delay = getRetryDelay(retryCount, options.retryDelay || config.retryDelay);
      console.log(`[API] Retrying in ${delay}ms... (attempt ${retryCount + 2}/${config.retryAttempts + 1})`);
      await sleep(delay);
      return makeRequest(endpoint, options, retryCount + 1);
    }

    // Throw error if retries exhausted
    throw error;
  }
};

/**
 * API Client Methods
 */
const apiClient = {
  /**
   * GET request
   */
  get: (endpoint, options = {}) => {
    return makeRequest(endpoint, { ...options, method: 'GET' });
  },

  /**
   * POST request
   */
  post: (endpoint, body, options = {}) => {
    return makeRequest(endpoint, { ...options, method: 'POST', body });
  },

  /**
   * PUT request
   */
  put: (endpoint, body, options = {}) => {
    return makeRequest(endpoint, { ...options, method: 'PUT', body });
  },

  /**
   * PATCH request
   */
  patch: (endpoint, body, options = {}) => {
    return makeRequest(endpoint, { ...options, method: 'PATCH', body });
  },

  /**
   * DELETE request
   */
  delete: (endpoint, options = {}) => {
    return makeRequest(endpoint, { ...options, method: 'DELETE' });
  },

  /**
   * Update configuration
   */
  configure: (newConfig) => {
    Object.assign(config, newConfig);
  },

  /**
   * Get current configuration
   */
  getConfig: () => ({ ...config })
};

export default apiClient;
export { APIError };
