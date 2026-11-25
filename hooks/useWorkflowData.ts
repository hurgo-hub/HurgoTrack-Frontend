'use client';

import { useCallback, useEffect, useState } from 'react';
import { runWorkflow } from '@/services/workflow.service';
import type { WorkflowPayload } from '@/types';

/**
 * Carga datos de un workflow al montar y cuando cambia `payload`.
 * `enabled = false` no consulta (p. ej. el usuario no tiene permiso).
 */
export function useWorkflowData<T>(name: string, payload: WorkflowPayload = {}, enabled = true) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [tick, setTick] = useState(0);
  const key = JSON.stringify(payload);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    runWorkflow<T>(name, JSON.parse(key))
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setError(null);
      })
      .catch((err: Error) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [name, key, enabled, tick]);

  const reload = useCallback(() => {
    setLoading(true);
    setTick((t) => t + 1);
  }, []);

  return { data, error, loading, reload };
}

/** Ejecuta una acción (workflow) y deja el mensaje de éxito o error para mostrar */
export function useAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const run = useCallback(async <T,>(fn: () => Promise<T>, okMessage?: string): Promise<T | undefined> => {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await fn();
      if (okMessage) setSuccess(okMessage);
      return result;
    } catch (err) {
      setError((err as Error).message);
      return undefined;
    } finally {
      setBusy(false);
    }
  }, []);

  return { run, busy, error, success };
}
