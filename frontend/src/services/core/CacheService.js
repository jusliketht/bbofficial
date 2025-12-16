// =====================================================
// CACHE SERVICE
// Response caching with proper cache invalidation
// =====================================================

class CacheService {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
    this.maxSize = 500; // Increased from 100 to 500 for better caching
    this.accessOrder = []; // Track access order for LRU eviction
  }

  set(key, data, ttl = this.defaultTTL) {
    // Remove oldest item (LRU) if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      // Remove least recently used item
      const lruKey = this.accessOrder.shift();
      if (lruKey) {
        this.cache.delete(lruKey);
      } else {
        // Fallback: remove first item
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
    }

    // Remove key from access order if it exists
    const keyIndex = this.accessOrder.indexOf(key);
    if (keyIndex > -1) {
      this.accessOrder.splice(keyIndex, 1);
    }

    // Add to end of access order (most recently used)
    this.accessOrder.push(key);

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      expires: Date.now() + ttl,
    });
  }

  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      // Remove from access order
      const keyIndex = this.accessOrder.indexOf(key);
      if (keyIndex > -1) {
        this.accessOrder.splice(keyIndex, 1);
      }
      return null;
    }

    // Update access order (move to end - most recently used)
    const keyIndex = this.accessOrder.indexOf(key);
    if (keyIndex > -1) {
      this.accessOrder.splice(keyIndex, 1);
    }
    this.accessOrder.push(key);

    return item.data;
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    const deleted = this.cache.delete(key);
    // Remove from access order
    const keyIndex = this.accessOrder.indexOf(key);
    if (keyIndex > -1) {
      this.accessOrder.splice(keyIndex, 1);
    }
    return deleted;
  }

  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * Clear cache for a specific user (for user-specific cache keys)
   */
  clearUserCache(userId) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.includes(`user:${userId}:`) || key.includes(`:user:${userId}`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.delete(key));
    return keysToDelete.length;
  }

  // Clear expired items
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }

  // Clear items matching a pattern
  clearPattern(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let expired = 0;

    for (const item of this.cache.values()) {
      if (now > item.expires) {
        expired++;
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      expired,
      valid: this.cache.size - expired,
    };
  }

  // Start automatic cleanup
  startAutoCleanup(intervalMs = 60000) { // 1 minute
    setInterval(() => this.cleanup(), intervalMs);
  }
}

// Create singleton instance
const cacheService = new CacheService();

// Start auto cleanup
cacheService.startAutoCleanup();

export default cacheService;
