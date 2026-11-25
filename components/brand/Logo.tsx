import { Truck } from 'lucide-react';
import { cn } from '@/utils/helpers';

/** Marca HurgoTrack (provisional: ícono + nombre; reemplazar por el logo oficial en /public) */
export function Logo({ height = 32, showName = true, className, nameClassName }: { height?: number; showName?: boolean; className?: string; nameClassName?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        className="flex items-center justify-center rounded-xl bg-brand text-white"
        style={{ width: height, height }}
        role={showName ? undefined : 'img'}
        aria-label={showName ? undefined : 'HurgoTrack'}
      >
        <Truck style={{ width: height * 0.55, height: height * 0.55 }} aria-hidden />
      </span>
      {showName && <BrandName className={nameClassName} />}
    </span>
  );
}

export function BrandName({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'bg-gradient-to-r from-[#5A13F2] to-[#973DF2] bg-clip-text font-[family-name:var(--font-display)] text-2xl leading-none font-bold tracking-[-0.02em] text-transparent dark:from-[#C9A6F7] dark:to-[#E9D5FF]',
        className,
      )}
    >
      HurgoTrack
    </span>
  );
}

/** Firma visual: los dos tonos de la marca como una línea partida */
export function SplitRule({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn('flex h-1 w-full overflow-hidden rounded-full', className)}>
      <span className="h-full flex-1 bg-logo-dark" />
      <span className="h-full flex-1 bg-logo-light" />
    </span>
  );
}
