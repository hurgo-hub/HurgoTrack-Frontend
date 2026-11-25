import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import { cn } from '@/utils/helpers';

/** Componentes mínimos de la interfaz, con los colores de la marca */

export function Button({ variant = 'primary', className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'danger' }) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        'inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-brand-900 text-white hover:bg-brand-700',
        variant === 'outline' && 'border border-brand-200 bg-white text-brand-900 hover:bg-brand-200/40',
        variant === 'danger' && 'border border-red-200 bg-white text-red-700 hover:bg-red-50',
        className,
      )}
    />
  );
}

const fieldClass = 'h-9 w-full rounded-lg border border-brand-200 bg-white px-2.5 text-sm outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-200';

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn('block text-sm', className)}>
      <span className="mb-1 block font-medium">{label}</span>
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(fieldClass, props.className)} />;
}

export function Select({ options, placeholder = 'Selecciona…', ...props }: SelectHTMLAttributes<HTMLSelectElement> & {
  options: { value: string | number; label: string }[];
  placeholder?: string;
}) {
  return (
    <select {...props} className={cn(fieldClass, props.className)}>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Card({ title, actions, children, className }: { title?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-xl border border-brand-200 bg-white p-4', className)}>
      {(title || actions) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {title && <h2 className="font-semibold">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Table({ head, children, empty = 'Sin registros' }: { head: string[]; children: ReactNode; empty?: string }) {
  const rows = Array.isArray(children) ? children.flat().filter(Boolean) : children ? [children] : [];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-brand-200 text-brand-700">
            {head.map((h) => (
              <th key={h} className="px-2 py-2 font-medium whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-200/60">
          {rows.length ? children : (
            <tr>
              <td colSpan={head.length} className="px-2 py-4 text-center text-brand-700">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn('px-2 py-2 align-top', className)}>{children}</td>;
}

export function Badge({ children }: { children: ReactNode }) {
  return <span className="inline-block rounded-md bg-brand-200/50 px-2 py-0.5 text-xs font-medium whitespace-nowrap">{children}</span>;
}

export function Message({ error, success }: { error?: string | null; success?: string | null }) {
  if (error) return <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>;
  if (success) return <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{success}</p>;
  return null;
}

export function PageTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <h1 className="text-xl font-semibold">{title}</h1>
      {description && <p className="text-sm text-brand-700">{description}</p>}
    </div>
  );
}
