'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { hasPermission } from '@/hooks/auth/usePermissions';
import { ROUTES } from '@/utils/constants';

/** Sin sesión se redirige al login */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace(ROUTES.LOGIN);
  }, [isLoading, isAuthenticated, router]);

  if (!isAuthenticated) return null;
  return <>{children}</>;
}

/** Sin el permiso del motor requerido no se muestra el contenido */
export function RequirePermission({ permission, children }: { permission: string | null; children: ReactNode }) {
  const { user } = useAuth();
  if (!hasPermission(user, permission)) return null;
  return <>{children}</>;
}
