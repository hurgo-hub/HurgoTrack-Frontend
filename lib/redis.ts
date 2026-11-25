import 'server-only';
import Redis from 'ioredis';

/**
 * Cliente Redis (solo servidor: route handlers / server actions).
 * Conexión perezosa y única por proceso; no se abre hasta el primer uso.
 */
const globalForRedis = globalThis as unknown as { __redis?: Redis };

export const REDIS_PREFIX = process.env.REDIS_KEY_PREFIX ?? 'hurgotrack:';

export function getRedis(): Redis {
  if (!globalForRedis.__redis) {
    const client = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379/0', {
      lazyConnect: true,
      maxRetriesPerRequest: 2,
      enableOfflineQueue: false,
    });
    client.on('error', (err) => {
      if (process.env.NODE_ENV === 'development') console.error('[Redis]', err.message);
    });
    globalForRedis.__redis = client;
  }
  return globalForRedis.__redis;
}

export const redisKey = (...parts: string[]) => `${REDIS_PREFIX}${parts.join(':')}`;
