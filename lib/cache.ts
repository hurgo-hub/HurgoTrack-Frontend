import 'server-only';
import { getRedis, redisKey } from './redis';

/** JSON con TTL sobre Redis. Si Redis no responde, falla en silencio (caché = best effort). */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await getRedis().get(redisKey('cache', key));
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
  try {
    await getRedis().set(redisKey('cache', key), JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    // sin caché
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    await getRedis().del(redisKey('cache', key));
  } catch {
    // sin caché
  }
}

/** Devuelve el valor cacheado o lo calcula y lo guarda */
export async function remember<T>(key: string, ttlSeconds: number, loader: () => Promise<T>): Promise<T> {
  const hit = await cacheGet<T>(key);
  if (hit !== null) return hit;
  const value = await loader();
  await cacheSet(key, value, ttlSeconds);
  return value;
}
