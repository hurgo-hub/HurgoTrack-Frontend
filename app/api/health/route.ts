import { NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';
import { BACKEND_URL } from '@/utils/constants';

export const dynamic = 'force-dynamic';

async function check(fn: () => Promise<unknown>) {
  const started = Date.now();
  try {
    await fn();
    return { ok: true, ms: Date.now() - started };
  } catch (error) {
    return { ok: false, ms: Date.now() - started, error: (error as Error).message };
  }
}

/** Estado del frontend, de Redis y del backend */
export async function GET() {
  const [redis, backend] = await Promise.all([
    check(async () => {
      const redis = getRedis();
      if (redis.status === 'wait') await redis.connect();
      await redis.ping();
    }),
    check(async () => {
      const res = await fetch(`${BACKEND_URL}/auth/session/status/`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
      // 401 = el backend responde (solo falta sesión)
      if (res.status >= 500) throw new Error(`HTTP ${res.status}`);
    }),
  ]);
  const ok = redis.ok && backend.ok;
  return NextResponse.json({ ok, redis, backend }, { status: ok ? 200 : 503 });
}
