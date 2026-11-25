import { Fragment } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/utils/helpers';
import type { StepDefinition } from '@/types';

/** Indicador de progreso de un flujo por pasos (índice base 0) */
export function StepIndicator({ steps, current, completed = [] }: { steps: readonly StepDefinition[]; current: number; completed?: number[] }) {
  return (
    <nav aria-label="Progreso" className="rounded-2xl border border-line bg-surface px-5 py-5 sm:px-6">
      <div className="mb-4 flex items-center justify-between text-xs font-semibold">
        <span className="text-ink-3">Progreso</span>
        <span className="num text-brand-ink">
          Paso {current + 1} de {steps.length}
        </span>
      </div>
      <ol className="flex items-start">
        {steps.map((step, index) => {
          const done = completed.includes(index) || current > index;
          const active = current === index;
          return (
            <Fragment key={step.key}>
              <li aria-current={active ? 'step' : undefined} className="flex shrink-0 flex-col items-center gap-1.5">
                <span
                  className={cn(
                    'num flex size-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors duration-300',
                    active && 'border-brand bg-brand text-white shadow-[0_2px_12px_rgb(90_19_242/0.3)]',
                    done && !active && 'border-brand bg-brand-soft text-brand-ink',
                    !active && !done && 'border-line bg-surface-2 text-ink-3',
                  )}
                >
                  {done && !active ? <Check className="size-4" aria-hidden /> : index + 1}
                </span>
                <span className={cn('text-[0.6875rem] font-medium', active ? 'font-semibold text-ink' : done ? 'text-brand-ink' : 'text-ink-3')}>
                  {step.label}
                  <span className="sr-only">{done && !active ? ' (completado)' : active ? ' (paso actual)' : ''}</span>
                </span>
              </li>
              {index < steps.length - 1 && (
                <li aria-hidden className={cn('mx-1 mt-[1.0625rem] h-0.5 min-w-3 flex-1 transition-colors duration-300', done ? 'bg-brand' : 'bg-line')} />
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
