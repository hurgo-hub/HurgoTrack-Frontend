import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/helpers';
import type { ButtonSize, ButtonVariant } from '@/types';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white shadow-[0_1px_0_rgb(255_255_255/0.18)_inset,var(--shadow-card)] hover:bg-brand-hover',
  secondary: 'bg-surface-2 text-ink hover:bg-line',
  outline: 'border border-line-strong bg-surface text-ink hover:border-ink-3 hover:bg-surface-2',
  ghost: 'text-ink-2 hover:bg-surface-2 hover:text-ink',
  danger: 'bg-danger-soft text-danger hover:bg-danger hover:text-white',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 gap-1.5 rounded-lg px-3 text-sm',
  md: 'h-11 gap-2 rounded-xl px-4 text-[0.9375rem]',
  lg: 'h-12 gap-2 rounded-xl px-6 text-base',
};

export const buttonClasses = (variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) =>
  cn(
    'press inline-flex shrink-0 select-none items-center justify-center font-medium whitespace-nowrap',
    'disabled:cursor-not-allowed disabled:opacity-50',
    variantClasses[variant],
    sizeClasses[size],
    className,
  );

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, icon, iconRight, children, disabled, className, type = 'button', ...props }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={buttonClasses(variant, size, className)}
        {...props}
      >
        {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon && <span aria-hidden className="inline-flex">{icon}</span>}
        {children}
        {iconRight && !loading && <span aria-hidden className="inline-flex">{iconRight}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';

/** Botón de solo ícono: siempre con nombre accesible y área táctil de 40px */
export const IconButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { label: string; tone?: 'neutral' | 'danger' | 'brand' }>(
  ({ label, tone = 'neutral', className, children, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'press relative inline-flex size-10 items-center justify-center rounded-xl disabled:cursor-not-allowed disabled:opacity-40',
        tone === 'neutral' && 'text-ink-2 hover:bg-surface-2 hover:text-ink',
        tone === 'danger' && 'text-danger hover:bg-danger-soft',
        tone === 'brand' && 'text-brand-ink hover:bg-brand-soft',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);

IconButton.displayName = 'IconButton';
