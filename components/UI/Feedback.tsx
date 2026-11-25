import type { ReactNode } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, Loader2, X } from 'lucide-react';
import { cn } from '@/utils/helpers';
import type { ToastType } from '@/types';

const alertStyles: Record<ToastType, { box: string; Icon: typeof Info }> = {
  success: { box: 'bg-success-soft text-success', Icon: CheckCircle2 },
  error: { box: 'bg-danger-soft text-danger', Icon: AlertCircle },
  warning: { box: 'bg-warning-soft text-warning', Icon: AlertTriangle },
  info: { box: 'bg-info-soft text-info', Icon: Info },
};

/** Mensaje en línea, cerca del contenido al que se refiere */
export function Alert({ type, message, title, onClose, className }: { type: ToastType; message: ReactNode; title?: string; onClose?: () => void; className?: string }) {
  const { box, Icon } = alertStyles[type];
  return (
    <div role={type === 'error' ? 'alert' : 'status'} className={cn('enter-fade flex items-start gap-3 rounded-xl px-4 py-3 text-sm', box, className)}>
      <Icon className="mt-0.5 size-[1.125rem] shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        <div className={cn(title && 'mt-0.5 opacity-90')}>{message}</div>
      </div>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Descartar mensaje" className="press -m-1 rounded-lg p-1 opacity-70 hover:opacity-100">
          <X className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}

export function Spinner({ className, label = 'Cargando' }: { className?: string; label?: string }) {
  return (
    <span role="status" className="inline-flex">
      <Loader2 className={cn('size-6 animate-spin text-brand-ink', className)} aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function Loading({ fullScreen = false, message }: { fullScreen?: boolean; message?: string }) {
  if (fullScreen) {
    return (
      <div className="enter-fade fixed inset-0 z-50 flex items-center justify-center bg-canvas/90 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3 text-center">
          <Spinner className="size-8" label={message} />
          {message && <p className="text-sm text-ink-2">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
      <Spinner label={message} />
      {message && <p className="text-sm text-ink-2">{message}</p>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('skeleton h-4', className)} />;
}

/** Pantalla vacía que invita a la siguiente acción */
export function EmptyState({ icon, title, description, action, className }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-14 text-center', className)}>
      {icon && <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-surface-2 text-ink-3 [&>svg]:size-7">{icon}</div>}
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-2">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-[1.75rem]">{title}</h1>
        {description && <p className="mt-1 text-[0.9375rem] text-ink-2">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
