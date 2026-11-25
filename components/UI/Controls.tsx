'use client';

import { useId, useState, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn, copyToClipboard } from '@/utils/helpers';

/** Interruptor accesible (role="switch") */
export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-sm text-ink-2">{description}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 disabled:opacity-50',
          checked ? 'bg-brand' : 'bg-line-strong',
        )}
      >
        <span
          aria-hidden
          className={cn(
            'inline-block size-6 rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.25)] transition-transform duration-200 ease-[var(--ease-out-strong)]',
            checked ? 'translate-x-[1.375rem]' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  );
}

export function Checkbox({ checked, onChange, label, description }: { checked: boolean; onChange: (value: boolean) => void; label: ReactNode; description?: ReactNode }) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-[1.125rem] shrink-0 cursor-pointer rounded accent-[var(--brand)]"
      />
      <label htmlFor={id} className="cursor-pointer text-sm">
        <span className="font-medium text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-ink-2">{description}</span>}
      </label>
    </div>
  );
}

/**
 * Código con copia: MessageID, TransactionID… El ícono confirma la copia
 * en el mismo lugar donde se hizo clic.
 */
export function CopyValue({ value, label, onCopied, className }: { value: string; label: string; onCopied?: () => void; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (await copyToClipboard(value)) {
      setCopied(true);
      onCopied?.();
      setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <div className={cn('flex min-w-0 items-center gap-1 rounded-lg bg-surface-2 py-1 pr-1 pl-3', className)}>
      <code className="num min-w-0 flex-1 truncate font-mono text-[0.8125rem] text-ink">{value}</code>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? `${label} copiado` : `Copiar ${label}`}
        title={`Copiar ${label}`}
        className="press inline-flex size-8 shrink-0 items-center justify-center rounded-md text-ink-2 hover:bg-line hover:text-ink"
      >
        {copied ? <Check className="size-4 text-success" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      </button>
    </div>
  );
}

/** Par etiqueta / valor para fichas de detalle */
export function DataField({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="text-xs font-medium text-ink-3">{label}</dt>
      <dd className="mt-1 truncate text-sm text-ink">{children}</dd>
    </div>
  );
}
