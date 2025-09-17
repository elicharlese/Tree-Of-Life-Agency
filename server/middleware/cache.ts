import { Request, Response, NextFunction } from 'express';

// In-memory cache (for development - use Redis in production)
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry> = new Map();

  set(key: string, data: any, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

const memoryCache = new MemoryCache();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  memoryCache.cleanup();
}, 5 * 60 * 1000);

// Generate cache key from request
const generateCacheKey = (req: Request): string => {
  const userId = (req as any).user?.id || 'anonymous';
  const userRole = (req as any).user?.role || 'none';
  
  return `${req.method}:${req.originalUrl}:${userId}:${userRole}`;
};

// Cache middleware factory
export const cache = (ttlSeconds: number = 300) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = generateCacheKey(req);
    const cachedData = memoryCache.get(cacheKey);

    if (cachedData) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Cache-Key', cacheKey);
      return res.json(cachedData);
    }

    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data: any) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        memoryCache.set(cacheKey, data, ttlSeconds);
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('X-Cache-Key', cacheKey);
      }
      
      return originalJson.call(this, data);
    };

    next();
  };
};

// Cache invalidation middleware
export const invalidateCache = (patterns: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Clear cache on successful mutations
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        if (patterns.length === 0) {
          // Clear all cache if no patterns specified
          memoryCache.clear();
        } else {
          // Clear cache entries matching patterns
          patterns.forEach(pattern => {
            // Simple pattern matching - can be enhanced with regex
            for (const key of Array.from(memoryCache['cache'].keys())) {
              if (key.includes(pattern)) {
                memoryCache.delete(key);
              }
            }
          });
        }
      }
    });

    next();
  };
};

// User-specific cache invalidation
export const invalidateUserCache = (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  
  if (userId) {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Clear all cache entries for this user
        for (const key of Array.from(memoryCache['cache'].keys())) {
          if (key.includes(userId)) {
            memoryCache.delete(key);
          }
        }
      }
    });
  }

  next();
};

// Cache statistics
export const getCacheStats = () => {
  const cacheMap = memoryCache['cache'];
  const now = Date.now();
  let expired = 0;
  let active = 0;

  const values = Array.from(cacheMap.values());
  for (const entry of values) {
    if (now - entry.timestamp > entry.ttl) {
      expired++;
    } else {
      active++;
    }
  }

  return {
    total: cacheMap.size,
    active,
    expired,
    hitRate: 0 // Would need to track hits/misses for accurate rate
  };
};

export { memoryCache };
