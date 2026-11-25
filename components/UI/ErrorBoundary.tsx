'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { ROUTES } from '@/utils/constants';

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas p-6">
        <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 text-center shadow-[var(--shadow-raised)]">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-danger-soft text-danger">
            <AlertTriangle className="size-7" aria-hidden />
          </div>
          <h1 className="text-xl font-semibold text-ink">La página dejó de responder</h1>
          <p className="mt-2 text-sm text-ink-2">Recarga la página para continuar. Tus datos guardados no se perdieron.</p>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre className="mt-5 overflow-auto rounded-xl bg-danger-soft p-3 text-left font-mono text-xs break-all text-danger">{this.state.error.message}</pre>
          )}

          <div className="mt-6 flex flex-col gap-2">
            <button type="button" onClick={() => window.location.reload()} className="press h-11 rounded-xl bg-brand font-medium text-white hover:bg-brand-hover">
              Recargar página
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = ROUTES.DASHBOARD;
              }}
              className="press h-11 rounded-xl border border-line-strong font-medium text-ink hover:bg-surface-2"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }
}
