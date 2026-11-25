import type { ReactNode } from 'react';
import { BrandName, Logo } from '@/components/brand/Logo';

function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#430F8C] to-[#5A13F2] text-white lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:px-16 xl:px-20">
      <span aria-hidden className="absolute top-1/2 left-1/2 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/20" />
      <span aria-hidden className="absolute top-1/2 left-1/2 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/10" />
      <div className="relative max-w-lg">
        <h1 className="text-5xl leading-[1.08] font-bold">Controla tus viajes y tu flota en tiempo real</h1>
        <p className="mt-6 text-xl text-white/90">Pedidos, viajes, conductores y ubicaciones en una sola plataforma.</p>
      </div>
    </aside>
  );
}

export function AuthLayout({ title, description, children, footer }: { title: string; description?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <BrandPanel />
      <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <div className="enter-pop w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <Logo height={64} showName={false} />
            <BrandName className="mt-3 text-3xl" />
            <p className="mt-1 text-sm text-ink-2">Hurgo Transporte</p>
          </div>
          <h2 className="text-2xl font-semibold text-ink">{title}</h2>
          {description && <p className="mt-1 mb-6 text-ink-2">{description}</p>}
          {children}
          {footer && <div className="mt-6 text-center text-sm text-ink-2">{footer}</div>}
          <p className="mt-8 text-center text-xs text-ink-3">© {new Date().getFullYear()} Hurgo Transporte · Devloop</p>
        </div>
      </main>
    </div>
  );
}
