import 'server-only';
import { STEPS_TTL_SECONDS } from '@/utils/constants';
import type { StepperState } from '@/types';
import { getRedis, redisKey } from './redis';

const key = (id: string) => redisKey('steps', id);

/** Persistencia del estado de un flujo de steps (para retomarlo tras recargar o cambiar de equipo) */
export async function loadSteps(id: string): Promise<StepperState | null> {
  const raw = await getRedis().get(key(id));
  return raw ? (JSON.parse(raw) as StepperState) : null;
}

export async function saveSteps(id: string, state: StepperState): Promise<StepperState> {
  const value = { ...state, updatedAt: new Date().toISOString() };
  await getRedis().set(key(id), JSON.stringify(value), 'EX', STEPS_TTL_SECONDS);
  return value;
}

export async function clearSteps(id: string): Promise<void> {
  await getRedis().del(key(id));
}
