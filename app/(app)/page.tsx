'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { hasPermission } from '@/hooks/auth/usePermissions';
import { ROUTES } from '@/utils/constants';

/** Inicio: lleva a la primera pantalla que el usuario puede ver */
export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    const first = [
      [ROUTES.ORDERS, 'orders.view_m_order'],
      [ROUTES.PURCHASES, 'stock.view_m_purchase_request'],
      [ROUTES.TRIPS, 'trips.view_m_trip'],
    ].find(([, perm]) => hasPermission(user, perm));
    if (first) router.replace(first[0]);
  }, [user, router]);

  return <p className="text-sm text-brand-700">Cargando…</p>;
}
