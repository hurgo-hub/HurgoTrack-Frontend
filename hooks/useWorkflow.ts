'use client';

import { useCallback, useState } from 'react';
import { runWorkflow } from '@/services/workflow.service';
import { extractErrorMessage } from '@/utils/helpers';
import type { StepStatus, WorkflowPayload } from '@/types';

/** Ejecuta un workflow y expone su estado (idle / running / done / error) */
export function useWorkflow<T = unknown>(name: string) {
  const [status, setStatus] = useState<StepStatus>('idle');
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (payload: WorkflowPayload = {}) => {
      setStatus('running');
      setError(null);
      try {
        const data = await runWorkflow<T>(name, payload);
        setResult(data);
        setStatus('done');
        return data;
      } catch (err) {
        setError(extractErrorMessage(err));
        setStatus('error');
        throw err;
      }
    },
    [name],
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  return { run, reset, status, result, error, isRunning: status === 'running' };
}
