'use client';

import { ArrowLeft, Home } from 'lucide-react';
import { Logo, SplitRule } from '@/components/brand/Logo';
import { Button, ButtonLink } from '@/components/UI';
import { ROUTES } from '@/utils/constants';

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-6 text-center">
      <Logo showName={false} height={40} />
      <p className="num mt-8 font-mono text-sm text-ink-3">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-ink">Esta página no existe</h1>
      <p className="mt-2 max-w-sm text-ink-2">Puede que el enlace esté incompleto o que la página se haya movido.</p>
      <SplitRule className="mt-8 w-24" />
      <div className="mt-8 flex flex-col gap-2 sm:flex-row">
        <ButtonLink href={ROUTES.DASHBOARD} icon={<Home className="size-4" />}>
          Ir al dashboard
        </ButtonLink>
        <Button variant="outline" icon={<ArrowLeft className="size-4" />} onClick={() => window.history.back()}>
          Volver
        </Button>
      </div>
    </main>
  );
}
