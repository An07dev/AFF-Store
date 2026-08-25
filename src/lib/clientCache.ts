/**
 * Simple in-memory client-side cache with TTL (Time-To-Live)
 * Helps eliminate redundant API fetches when navigating between tabs or filters.
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();

export const clientCache = {
  get<T>(key: string): T | null {
    const entry = memoryCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      memoryCache.delete(key);
      return null;
    }
    return entry.data as T;
  },

  set<T>(key: string, data: T, ttlMs = 60000): void {
    memoryCache.set(key, {
      data,
      expiry: Date.now() + ttlMs,
    });
  },

  delete(key: string): void {
    memoryCache.delete(key);
  },

  clear(): void {
    memoryCache.clear();
  },

  /**
   * Fetches data with caching wrapper.
   */
  async fetchWithCache<T>(key: string, fetcher: () => Promise<T>, ttlMs = 60000): Promise<T> {
    const cached = clientCache.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    const fresh = await fetcher();
    if (fresh !== undefined && fresh !== null) {
      clientCache.set(key, fresh, ttlMs);
    }
    return fresh;
  },
};
