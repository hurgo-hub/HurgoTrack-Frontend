'use client';

import { RequireAuth } from '@/components/auth/Guards';

/** Rutas privadas: todo lo que esté dentro de (app)/ exige sesión */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
