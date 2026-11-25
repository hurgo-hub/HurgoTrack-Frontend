'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, LogOut, Menu, ShieldCheck, X } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { IconButton } from '@/components/UI';
import { useAuth } from '@/hooks/auth/useAuth';
import { hasPermission, isAdmin } from '@/hooks/auth/usePermissions';
import { getInitials } from '@/utils/format.utils';
import { cn } from '@/utils/helpers';
import { ROUTES } from '@/utils/constants';
import { ADMIN_NAVIGATION, NAVIGATION } from './navigation';

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const items = NAVIGATION.filter((item) => hasPermission(user, item.permission));

  const linkClass = (href: string) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return {
      active,
      className: cn(
        'group relative flex h-10 items-center gap-3 rounded-xl px-3 text-[0.9375rem] font-medium transition-colors duration-150',
        active ? 'bg-brand text-white shadow-[0_4px_12px_-2px_rgb(90_19_242/0.35)]' : 'text-ink-2 hover:bg-brand-soft hover:text-brand-ink',
      ),
    };
  };

  return (
    <nav aria-label="Principal" className="flex flex-1 flex-col gap-1 px-3 py-4">
      {items.map((item) => {
        const { active, className } = linkClass(item.href);
        return (
          <Link key={item.href} href={item.href} onClick={onNavigate} aria-current={active ? 'page' : undefined} className={className}>
            <item.icon className="size-[1.125rem] shrink-0" aria-hidden />
            {item.name}
          </Link>
        );
      })}

      {isAdmin(user) && ADMIN_NAVIGATION.length > 0 && (
        <>
          <div className="mx-3 mt-5 mb-2 flex items-center gap-2 text-xs font-medium text-ink-3">
            <ShieldCheck className="size-3.5" aria-hidden />
            Administración
          </div>
          {ADMIN_NAVIGATION.map((item) => {
            const { active, className } = linkClass(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={onNavigate} aria-current={active ? 'page' : undefined} className={className}>
                <item.icon className="size-[1.125rem] shrink-0" aria-hidden />
                {item.name}
              </Link>
            );
          })}
        </>
      )}
    </nav>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    try {
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="press flex items-center gap-3 rounded-xl py-1.5 pr-2 pl-1.5 text-left hover:bg-surface-2"
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
          {user ? getInitials(user.username) : 'U'}
        </span>
        <span className="hidden sm:block">
          <span className="block text-sm font-medium text-ink">{user?.username}</span>
          {isAdmin(user) && (
            <span className="flex items-center gap-1 text-xs font-semibold text-brand-ink">
              <ShieldCheck className="size-3" aria-hidden />
              Administrador
            </span>
          )}
        </span>
        <ChevronDown className={cn('size-4 text-ink-3 transition-transform duration-200', open && 'rotate-180')} aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          className="enter-pop absolute right-0 z-30 mt-2 w-52 origin-top-right overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-[var(--shadow-raised)]"
        >
          <button role="menuitem" type="button" onClick={handleLogout} className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-danger hover:bg-danger-soft">
            <LogOut className="size-4" aria-hidden />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!drawerOpen) return;
    const handleKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false);
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-dvh bg-canvas">
      <a href="#contenido" className="sr-only z-50 rounded-lg bg-surface px-4 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Saltar al contenido
      </a>

      {/* Barra lateral (escritorio) */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-line bg-surface shadow-sm md:flex">
        <div className="flex h-[4.5rem] items-center border-b border-line bg-gradient-to-r from-surface to-surface-2 px-6">
          <Link href={ROUTES.DASHBOARD} aria-label="HurgoTrack, ir al inicio">
            <Logo height={36} />
          </Link>
        </div>
        <NavLinks />
        <p className="px-6 pb-5 text-xs text-ink-3">Hurgo Transporte · Devloop</p>
      </aside>

      {/* Cajón (móvil) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Menú de navegación">
          <div className="enter-fade absolute inset-0 bg-overlay" onClick={() => setDrawerOpen(false)} aria-hidden />
          <aside className="enter-drawer relative flex h-full w-72 max-w-[85vw] flex-col bg-surface shadow-[var(--shadow-overlay)]">
            <div className="flex h-[4.5rem] items-center justify-between border-b border-line bg-gradient-to-r from-surface to-surface-2 px-5">
              <Logo height={32} nameClassName="text-xl" />
              <IconButton label="Cerrar menú" onClick={() => setDrawerOpen(false)} autoFocus>
                <X className="size-5" aria-hidden />
              </IconButton>
            </div>
            <NavLinks onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-h-dvh flex-col md:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-line bg-surface/85 px-4 backdrop-blur-md sm:px-6">
          <IconButton label="Abrir menú" onClick={() => setDrawerOpen(true)} className="md:hidden">
            <Menu className="size-5" aria-hidden />
          </IconButton>
          <Link href={ROUTES.DASHBOARD} className="md:hidden" aria-label="HurgoTrack, ir al inicio">
            <Logo height={26} nameClassName="text-lg" />
          </Link>
          <div className="flex-1" />
          <UserMenu />
        </header>

        <main id="contenido" key={pathname} className="enter-fade mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
