/**
 * Cache Manager
 * Client-side caching with TTL (Time To Live) support
 */

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  }

  /**
   * Generate cache key
   * @param {string} prefix - Key prefix
   * @param {Object} params - Parameters to include in key
   * @returns {string}
   */
  generateKey(prefix, params = {}) {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');

    return paramString ? `${prefix}:${paramString}` : prefix;
  }

  /**
   * Set cache entry
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds (optional)
   */
  set(key, value, ttl = this.defaultTTL) {
    const expiresAt = ttl ? Date.now() + ttl : null;

    this.cache.set(key, {
      value,
      expiresAt,
      createdAt: Date.now()
    });

    console.log(`[Cache] Set: ${key} (TTL: ${ttl}ms)`);
  }

  /**
   * Get cache entry
   * @param {string} key - Cache key
   * @returns {*} Cached value or null if not found/expired
   */
  get(key) {
    const entry = this.cache.get(key);

    if (!entry) {
      console.log(`[Cache] Miss: ${key}`);
      return null;
    }

    // Check if expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      console.log(`[Cache] Expired: ${key}`);
      this.cache.delete(key);
      return null;
    }

    console.log(`[Cache] Hit: ${key}`);
    return entry.value;
  }

  /**
   * Check if key exists and is not expired
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    const entry = this.cache.get(key);

    if (!entry) return false;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete cache entry
   * @param {string} key - Cache key
   */
  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log(`[Cache] Deleted: ${key}`);
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
    console.log('[Cache] All entries cleared');
  }

  /**
   * Clear cache entries by prefix
   * @param {string} prefix - Key prefix to match
   */
  clearByPrefix(prefix) {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        count++;
      }
    }
    console.log(`[Cache] Cleared ${count} entries with prefix: ${prefix}`);
  }

  /**
   * Remove expired entries
   */
  cleanup() {
    let count = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.cache.delete(key);
        count++;
      }
    }

    if (count > 0) {
      console.log(`[Cache] Cleaned up ${count} expired entries`);
    }
  }

  /**
   * Get cache statistics
   * @returns {Object}
   */
  getStats() {
    let expired = 0;
    const now = Date.now();

    for (const entry of this.cache.values()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        expired++;
      }
    }

    return {
      total: this.cache.size,
      valid: this.cache.size - expired,
      expired
    };
  }

  /**
   * Get or set pattern
   * Checks cache first, if miss, executes fetcher and caches result
   * @param {string} key - Cache key
   * @param {Function} fetcher - Async function to fetch data
   * @param {number} ttl - Time to live in milliseconds (optional)
   * @returns {Promise<*>}
   */
  async getOrFetch(key, fetcher, ttl = this.defaultTTL) {
    const cached = this.get(key);

    if (cached !== null) {
      return cached;
    }

    console.log(`[Cache] Fetching: ${key}`);
    const value = await fetcher();
    this.set(key, value, ttl);

    return value;
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  cacheManager.cleanup();
}, 5 * 60 * 1000);

export default cacheManager;
export { CacheManager };
