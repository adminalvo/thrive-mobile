import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheManager {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  async get<T>(key: string): Promise<T | null> {
    // 1. Check memory cache first (instant 0ms)
    const mem = this.memoryCache.get(key);
    if (mem) {
      return mem.data as T;
    }

    // 2. Check AsyncStorage
    try {
      const stored = await AsyncStorage.getItem(`@thrive_cache_${key}`);
      if (stored) {
        const parsed: CacheEntry<T> = JSON.parse(stored);
        this.memoryCache.set(key, parsed);
        return parsed.data;
      }
    } catch (e) {
      console.warn(`[CacheManager] Failed to read cache for key "${key}":`, e);
    }

    return null;
  }

  async set<T>(key: string, data: T, ttlMs?: number): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs || this.defaultTTL,
    };

    // Store in memory
    this.memoryCache.set(key, entry);

    // Persist in AsyncStorage asynchronously
    try {
      await AsyncStorage.setItem(`@thrive_cache_${key}`, JSON.stringify(entry));
    } catch (e) {
      console.warn(`[CacheManager] Failed to persist cache for key "${key}":`, e);
    }
  }

  async fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs?: number,
    forceRefresh = false
  ): Promise<{ data: T; fromCache: boolean }> {
    if (!forceRefresh) {
      const cached = await this.get<T>(key);
      if (cached !== null) {
        // Fire background revalidation without blocking UI
        this.revalidateInBackground(key, fetcher, ttlMs);
        return { data: cached, fromCache: true };
      }
    }

    // No cache or forceRefresh, fetch fresh data
    const freshData = await fetcher();
    await this.set(key, freshData, ttlMs);
    return { data: freshData, fromCache: false };
  }

  private async revalidateInBackground<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs?: number
  ): Promise<void> {
    try {
      const freshData = await fetcher();
      if (freshData !== null && freshData !== undefined) {
        await this.set(key, freshData, ttlMs);
      }
    } catch (e) {
      console.log(`[CacheManager] Background revalidation skipped for "${key}"`);
    }
  }

  async invalidate(keyPrefix: string): Promise<void> {
    // Invalidate memory
    for (const k of this.memoryCache.keys()) {
      if (k.startsWith(keyPrefix)) {
        this.memoryCache.delete(k);
      }
    }

    // Invalidate AsyncStorage keys
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const targetKeys = allKeys.filter((k) => k.startsWith(`@thrive_cache_${keyPrefix}`));
      for (const k of targetKeys) {
        await AsyncStorage.removeItem(k);
      }
    } catch (e) {
      console.warn('[CacheManager] Failed to invalidate storage keys:', e);
    }
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const thriveKeys = allKeys.filter((k) => k.startsWith('@thrive_cache_'));
      for (const k of thriveKeys) {
        await AsyncStorage.removeItem(k);
      }
    } catch (e) {}
  }
}

export const cacheManager = new CacheManager();
