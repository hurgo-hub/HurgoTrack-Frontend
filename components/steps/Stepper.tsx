'use client';

import type { ReactNode } from 'react';
import { Button, Card } from '@/components/UI';
import type { StepDefinition } from '@/types';
import { StepIndicator } from './StepIndicator';

interface StepperProps {
  steps: readonly StepDefinition[];
  current: number;
  completed?: number[];
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
  children: ReactNode;
}

/** Contenedor de un flujo por pasos: indicador + contenido del step + navegación */
export function Stepper({ steps, current, completed, onBack, onNext, nextLabel, nextDisabled, loading, children }: StepperProps) {
  const isLast = current === steps.length - 1;
  return (
    <div className="space-y-4">
      <StepIndicator steps={steps} current={current} completed={completed} />
      <Card className="p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-ink">{steps[current]?.label}</h2>
        {steps[current]?.description && <p className="mt-1 text-sm text-ink-2">{steps[current].description}</p>}
        <div className="mt-5">{children}</div>
        <div className="mt-6 flex justify-between gap-3">
          <Button variant="outline" onClick={onBack} disabled={current === 0 || loading}>
            Atrás
          </Button>
          <Button onClick={onNext} loading={loading} disabled={nextDisabled}>
            {nextLabel ?? (isLast ? 'Finalizar' : 'Continuar')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
