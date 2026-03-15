import dotenv from 'dotenv';

dotenv.config();

// In-memory cache fallback when Redis is not available
const memoryCache = new Map<string, { value: string; expiry: number }>();

interface RedisLike {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode?: string, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  ttl(key: string): Promise<number>;
}

function createMemoryRedis(): RedisLike {
  console.log('[Cache] Using in-memory cache (Redis not available)');

  return {
    async get(key: string): Promise<string | null> {
      const entry = memoryCache.get(key);
      if (!entry) return null;
      if (entry.expiry && Date.now() > entry.expiry) {
        memoryCache.delete(key);
        return null;
      }
      return entry.value;
    },

    async set(key: string, value: string, mode?: string, ttl?: number): Promise<void> {
      const expiry = mode === 'EX' && ttl ? Date.now() + ttl * 1000 : 0;
      memoryCache.set(key, { value, expiry });
    },

    async del(key: string): Promise<void> {
      memoryCache.delete(key);
    },

    async incr(key: string): Promise<number> {
      const entry = memoryCache.get(key);
      const current = entry ? parseInt(entry.value, 10) || 0 : 0;
      const next = current + 1;
      const expiry = entry?.expiry || 0;
      memoryCache.set(key, { value: String(next), expiry });
      return next;
    },

    async expire(key: string, seconds: number): Promise<void> {
      const entry = memoryCache.get(key);
      if (entry) {
        entry.expiry = Date.now() + seconds * 1000;
      }
    },

    async ttl(key: string): Promise<number> {
      const entry = memoryCache.get(key);
      if (!entry || !entry.expiry) return -1;
      const remaining = Math.ceil((entry.expiry - Date.now()) / 1000);
      return remaining > 0 ? remaining : -2;
    },
  };
}

let redis: RedisLike;

try {
  if (process.env.REDIS_HOST && process.env.NODE_ENV === 'production') {
    const Redis = require('ioredis');
    redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: 3,
    });
    console.log('[Redis] Connecting to Redis...');
  } else {
    redis = createMemoryRedis();
  }
} catch {
  redis = createMemoryRedis();
}

export default redis;
