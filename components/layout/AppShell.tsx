'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { useAuth } from '@/hooks/auth/useAuth';
import { hasPermission, isAdmin, isDriverOnly } from '@/hooks/auth/usePermissions';
import { ROUTES } from '@/utils/constants';
import { cn } from '@/utils/helpers';

/** companyOnly: solo usuarios de una empresa (Hurgo no gestiona lo de la empresa, aunque sea superusuario) */
type NavItem = { href: string; label: string; perm: string; companyOnly?: boolean };

/** Menú por secciones; cada entrada se muestra solo con su permiso */
const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Operación',
    items: [
      { href: ROUTES.ORDERS, label: 'Pedidos', perm: 'orders.view_m_order' },
      { href: ROUTES.TRIPS, label: 'Viajes', perm: 'trips.view_m_trip' },
      { href: ROUTES.PURCHASES, label: 'Compras', perm: 'stock.view_m_purchase_request' },
    ],
  },
  {
    title: 'Hurgo',
    items: [
      { href: ROUTES.STOCK, label: 'Stock', perm: 'stock.view_m_stock' },
      { href: ROUTES.LOADING_POINTS, label: 'Lugares de cargue', perm: 'locations.manage_loading_point' },
      { href: ROUTES.FLEET, label: 'Flota', perm: 'fleet.view_m_vehicle' },
      { href: ROUTES.COMPANIES, label: 'Empresas', perm: 'companies.create_company' },
    ],
  },
  {
    title: 'Mi empresa',
    items: [
      { href: ROUTES.MY_COMPANY, label: 'Usuarios, direcciones y productos', perm: 'companies.manage_company', companyOnly: true },
      { href: ROUTES.CATALOGS, label: 'Tipos, unidades, marcas y documentos', perm: 'catalogs.manage_company_catalogs', companyOnly: true },
    ],
  },
  {
    title: 'Configuración',
    items: [
      { href: ROUTES.CATALOGS, label: 'Catálogos de logística y flota', perm: 'catalogs.manage_hurgo_catalogs' },
      { href: ROUTES.ROLES, label: 'Roles y permisos', perm: 'companies.manage_roles' },
      { href: ROUTES.USERS, label: 'Usuarios de Hurgo', perm: 'companies.manage_roles' },
    ],
  },
];

/** Barra lateral con la marca y el menú; arriba el usuario y la salida */
export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const visible = (i: NavItem) => hasPermission(user, i.perm) && !(i.companyOnly && isAdmin(user));
  const sections = SECTIONS.map((s) => ({ ...s, items: s.items.filter(visible) }))
    .filter((s) => s.items.length);

  const nav = (
    <nav className="space-y-5">
      {sections.map((section) => (
        <div key={section.title}>
          <p className="mb-1 px-3 text-xs font-semibold tracking-wide text-brand-700 uppercase">{section.title}</p>
          <ul className="space-y-0.5">
            {section.items.map((item) => (
              <li key={`${section.title}${item.href}`}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'block rounded-lg px-3 py-1.5 text-sm font-medium',
                    pathname.startsWith(item.href) ? 'bg-brand-900 text-white' : 'text-brand-900 hover:bg-brand-200/50',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-dvh bg-slate-50 md:flex">
      <aside className="hidden w-60 shrink-0 border-r border-brand-200 bg-white px-3 py-5 md:block">
        <Link href={ROUTES.HOME} aria-label="Hurgo Track, inicio" className="mb-6 block px-3">
          <BrandLogo height={32} />
        </Link>
        {nav}
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex items-center gap-3 border-b border-brand-200 bg-white px-4 py-3">
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}
            className="rounded-lg border border-brand-200 px-2.5 py-1 text-sm font-medium md:hidden">
            Menú
          </button>
          <div className="md:hidden"><BrandLogo height={26} /></div>
          <div className="flex-1" />
          <span className="text-sm text-brand-700">
            {user?.first_name || user?.username}
            {user?.groups?.length ? ` · ${user.groups.join(', ')}` : ''}
          </span>
          <button type="button" onClick={logout} className="text-sm font-semibold text-brand-900 hover:underline">
            Salir
          </button>
        </header>
        {open && <div className="border-b border-brand-200 bg-white px-3 py-4 md:hidden">{nav}</div>}
        <main className="mx-auto max-w-6xl px-4 py-6">
          {isDriverOnly(user) ? (
            <div className="mx-auto max-w-md rounded-xl border border-brand-200 bg-white p-6 text-center">
              <p className="font-semibold">Los conductores trabajan desde la app Hurgo Conductor</p>
              <p className="mt-1 text-sm text-brand-700">Ahí te llegan los viajes para aceptarlos, salir a ruta y entregar.</p>
              <button type="button" onClick={logout} className="mt-4 text-sm font-semibold text-brand-900 hover:underline">Salir</button>
            </div>
          ) : children}
        </main>
      </div>
    </div>
  );
}
