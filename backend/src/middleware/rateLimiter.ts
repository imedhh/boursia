import { Request, Response, NextFunction } from 'express';
import redis from '../config/redis';
import { RATE_LIMIT } from '../config/constants';

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

// In-memory fallback if Redis is unavailable
const memoryStore: RateLimitStore = {};

export async function rateLimiter(req: Request, res: Response, next: NextFunction): Promise<void> {
  const key = `ratelimit:${req.ip}`;
  const { windowMs, maxRequests } = RATE_LIMIT;

  try {
    const current = await redis.get(key);

    if (!current) {
      await redis.set(key, '1', 'EX', Math.ceil(windowMs / 1000));
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
      next();
      return;
    }

    const count = parseInt(current, 10);

    if (count >= maxRequests) {
      const ttlSec = await redis.ttl(key);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('Retry-After', Math.max(ttlSec, 1));
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
    }

    await redis.incr(key);
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - count - 1);
    next();
  } catch {
    // Fallback to in-memory rate limiting
    const now = Date.now();
    const entry = memoryStore[key];

    if (!entry || now > entry.resetTime) {
      memoryStore[key] = { count: 1, resetTime: now + windowMs };
      next();
      return;
    }

    if (entry.count >= maxRequests) {
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
    }

    entry.count++;
    next();
  }
}
