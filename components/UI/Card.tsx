import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/helpers';

interface SectionProps {
  children: ReactNode;
  className?: string;
}

function CardHeader({ children, className }: SectionProps) {
  return <div className={cn('flex items-center justify-between gap-4 border-b border-line bg-gradient-to-r from-brand-soft/70 to-surface px-5 py-4 sm:px-6', className)}>{children}</div>;
}

function CardBody({ children, className }: SectionProps) {
  return <div className={cn('p-5 sm:p-6', className)}>{children}</div>;
}

function CardFooter({ children, className }: SectionProps) {
  return <div className={cn('border-t border-line bg-surface-2/60 px-5 py-3.5 sm:px-6', className)}>{children}</div>;
}

export function Card({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)]', className)} {...props}>
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
