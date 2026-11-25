'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { Card, EmptyState, Loading } from '@/components/UI';
import { useAuth } from '@/hooks/auth/useAuth';
import { hasPermission, isAdmin } from '@/hooks/auth/usePermissions';
import { ROUTES } from '@/utils/constants';

/** Rutas privadas: sin sesión se redirige al login */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace(ROUTES.LOGIN);
  }, [isLoading, isAuthenticated, router]);

  if (isLoading && !isAuthenticated) return <Loading fullScreen message="Verificando sesión…" />;
  if (!isAuthenticated) return null;
  return <>{children}</>;
}

/** Sin el permiso de navegación requerido se envía al dashboard */
export function RequirePermission({ permission, children }: { permission: string | null; children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const allowed = hasPermission(user, permission);

  useEffect(() => {
    if (user && !allowed) router.replace(ROUTES.DASHBOARD);
  }, [user, allowed, router]);

  if (!allowed) return null;
  return <>{children}</>;
}

/** Solo administradores (staff o superusuario) */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (!isAdmin(user)) {
    return (
      <div className="flex justify-center py-10">
        <Card className="w-full max-w-md">
          <EmptyState
            icon={<ShieldAlert />}
            title="Acceso denegado"
            description="No tienes permisos para acceder a esta página. Pide acceso a un administrador."
          />
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
