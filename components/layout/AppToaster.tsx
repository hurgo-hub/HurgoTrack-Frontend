'use client';

import { Toaster } from 'sonner';

/** Toasts arriba a la derecha (donde estaban), con los tokens de la app y tema del sistema */
export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      theme="system"
      closeButton
      richColors={false}
      toastOptions={{
        classNames: {
          toast: '!rounded-xl !border !border-line !bg-surface !text-ink !shadow-[var(--shadow-raised)] !font-sans',
          description: '!text-ink-2',
          success: '[&_[data-icon]]:!text-success',
          error: '[&_[data-icon]]:!text-danger',
          warning: '[&_[data-icon]]:!text-warning',
          info: '[&_[data-icon]]:!text-info',
          closeButton: '!bg-surface !border-line !text-ink-2',
        },
      }}
    />
  );
}
