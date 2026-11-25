'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { useAuth } from '@/hooks/auth/useAuth';
import { hasPermission } from '@/hooks/auth/usePermissions';
import { ROUTES } from '@/utils/constants';
import { cn } from '@/utils/helpers';

const NAV = [
  { href: ROUTES.ORDERS, label: 'Pedidos', perm: 'orders.view_m_order' },
  { href: ROUTES.PURCHASES, label: 'Compras', perm: 'stock.view_m_purchase_request' },
  { href: ROUTES.STOCK, label: 'Stock', perm: 'stock.view_m_stock' },
  { href: ROUTES.LOADING_POINTS, label: 'Lugares de cargue', perm: 'locations.manage_loading_point' },
  { href: ROUTES.TRIPS, label: 'Viajes', perm: 'trips.view_m_trip' },
];

/** Encabezado con la marca, el menú según los permisos del usuario y la salida */
export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const items = NAV.filter((item) => hasPermission(user, item.perm));

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="border-b border-brand-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link href={ROUTES.HOME} aria-label="Hurgo Track, inicio">
            <BrandLogo height={32} />
          </Link>
          <nav className="flex flex-1 flex-wrap gap-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium',
                  pathname.startsWith(item.href) ? 'bg-brand-900 text-white' : 'text-brand-900 hover:bg-brand-200/50',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-brand-700">
              {user?.first_name || user?.username}
              {user?.groups?.length ? ` · ${user.groups.join(', ')}` : ''}
            </span>
            <button type="button" onClick={logout} className="font-semibold text-brand-900 hover:underline">
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
