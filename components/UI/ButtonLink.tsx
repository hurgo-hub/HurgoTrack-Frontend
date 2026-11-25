import Link, { type LinkProps } from 'next/link';
import type { ReactNode } from 'react';
import { buttonClasses } from './Button';
import type { ButtonSize, ButtonVariant } from '@/types';

/** Enlace con apariencia de botón (navegación, no acción) */
export function ButtonLink({
  variant = 'primary',
  size = 'md',
  icon,
  className,
  children,
  ...props
}: LinkProps & { variant?: ButtonVariant; size?: ButtonSize; icon?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...props}>
      {icon && <span aria-hidden className="inline-flex">{icon}</span>}
      {children}
    </Link>
  );
}
