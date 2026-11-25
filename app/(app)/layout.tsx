'use client';

import { RequireAuth } from '@/components/auth/Guards';
import { AppShell } from '@/components/layout/AppShell';

/** Rutas privadas: todo lo que esté dentro de (app)/ exige sesión */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}
