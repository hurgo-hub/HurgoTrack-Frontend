'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { stepsService } from '@/services/steps.service';
import type { StepDefinition, StepperState } from '@/types';

interface Options<TData> {
  steps: readonly StepDefinition[];
  initialData: TData;
  /** Clave en Redis; sin ella el flujo vive solo en memoria */
  persistKey?: string;
}

/**
 * Estado de un flujo por pasos. Solo navegación y datos: la lógica de cada step
 * (llamar workflows, validar) la pone la pantalla que lo use.
 */
export function useStepper<TData extends Record<string, unknown>>({ steps, initialData, persistKey }: Options<TData>) {
  const [state, setState] = useState<StepperState<TData>>({ current: 0, completed: [], data: initialData });
  const [hydrated, setHydrated] = useState(!persistKey);
  const initialRef = useRef(initialData);

  // Retoma el flujo guardado en Redis
  useEffect(() => {
    if (!persistKey) return;
    let cancelled = false;
    stepsService.load(persistKey).then((saved) => {
      if (!cancelled && saved) setState(saved as StepperState<TData>);
      if (!cancelled) setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [persistKey]);

  // Guarda cada cambio (best effort)
  useEffect(() => {
    if (!persistKey || !hydrated) return;
    stepsService.save(persistKey, state).catch(() => {});
  }, [persistKey, hydrated, state]);

  const goTo = useCallback(
    (index: number) => setState((s) => ({ ...s, current: Math.max(0, Math.min(index, steps.length - 1)) })),
    [steps.length],
  );

  const next = useCallback(
    () =>
      setState((s) => ({
        ...s,
        completed: s.completed.includes(s.current) ? s.completed : [...s.completed, s.current],
        current: Math.min(s.current + 1, steps.length - 1),
      })),
    [steps.length],
  );

  const back = useCallback(() => setState((s) => ({ ...s, current: Math.max(s.current - 1, 0) })), []);

  const setData = useCallback((patch: Partial<TData>) => setState((s) => ({ ...s, data: { ...s.data, ...patch } })), []);

  const setExecutionId = useCallback((executionId: number | null) => setState((s) => ({ ...s, executionId })), []);

  const reset = useCallback(() => {
    setState({ current: 0, completed: [], data: initialRef.current });
    if (persistKey) stepsService.clear(persistKey).catch(() => {});
  }, [persistKey]);

  return {
    steps,
    current: state.current,
    step: steps[state.current],
    completed: state.completed,
    data: state.data,
    executionId: state.executionId ?? null,
    isFirst: state.current === 0,
    isLast: state.current === steps.length - 1,
    hydrated,
    goTo,
    next,
    back,
    setData,
    setExecutionId,
    reset,
  };
}
