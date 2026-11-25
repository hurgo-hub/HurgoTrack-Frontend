import type { ReactNode } from 'react';
import { CheckCircle2, Clock3, XCircle, CircleDashed } from 'lucide-react';
import { cn } from '@/utils/helpers';
import type { Tone } from '@/types';

const toneClasses: Record<Tone, string> = {
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
  neutral: 'bg-surface-2 text-ink-2',
  brand: 'bg-brand-soft text-brand-ink',
};

export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap', toneClasses[tone], className)}>
      {children}
    </span>
  );
}

const statusIcon = {
  success: CheckCircle2,
  warning: Clock3,
  danger: XCircle,
} as const;

/** Estado con ícono + texto, nunca solo color. `tone` define el aspecto. */
export function StatusBadge({
  label,
  tone = 'neutral',
  className,
}: {
  label?: string | null;
  tone?: Tone;
  className?: string;
}) {
  const Icon = tone in statusIcon ? statusIcon[tone as keyof typeof statusIcon] : CircleDashed;
  return (
    <Badge tone={tone} className={className}>
      <Icon className="size-3.5" aria-hidden />
      {label || 'Sin estado'}
    </Badge>
  );
}
