'use client';

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/helpers';

interface FieldShellProps {
  id: string;
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

function FieldShell({ id, label, hint, error, children, className }: FieldShellProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={id} className="field-label">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-sm text-ink-3">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, icon, rightIcon, className, wrapperClassName, id, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;
    const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;

    return (
      <FieldShell id={fieldId} label={label} hint={hint} error={error} className={wrapperClassName}>
        <div className="relative">
          {icon && (
            <span aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-3 [&>svg]:size-[1.125rem]">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={fieldId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn('field', icon && 'pl-10', rightIcon && 'pr-11', className)}
            {...props}
          />
          {rightIcon && <span className="absolute top-1/2 right-1.5 -translate-y-1/2 text-ink-3">{rightIcon}</span>}
        </div>
      </FieldShell>
    );
  },
);

Input.displayName = 'Input';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, className, wrapperClassName, id, children, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <FieldShell id={fieldId} label={label} hint={hint} error={error} className={wrapperClassName}>
        <select ref={ref} id={fieldId} aria-invalid={error ? true : undefined} className={cn('field cursor-pointer', className)} {...props}>
          {children}
        </select>
      </FieldShell>
    );
  },
);

Select.displayName = 'Select';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, hint, error, className, id, ...props }, ref) => {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error}>
      <textarea ref={ref} id={fieldId} aria-invalid={error ? true : undefined} className={cn('field min-h-24 resize-y', className)} {...props} />
    </FieldShell>
  );
});

Textarea.displayName = 'Textarea';
