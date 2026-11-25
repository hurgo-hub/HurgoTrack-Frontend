import Image from 'next/image';

const RATIO = 641 / 286;

/** Logo oficial de Hurgo Track (public/brand). `onDark` para fondos azul oscuro. */
export function BrandLogo({ height = 48, onDark = false, className }: { height?: number; onDark?: boolean; className?: string }) {
  return (
    <Image
      src={onDark ? '/brand/hurgo-track-logo-sobre-oscuro.svg' : '/brand/hurgo-track-logo.svg'}
      alt="Hurgo Track"
      width={Math.round(height * RATIO)}
      height={height}
      priority
      className={className}
    />
  );
}
