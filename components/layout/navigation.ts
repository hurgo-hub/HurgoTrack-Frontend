import { LayoutDashboard, MapPin, Package, Route, Truck, Users, type LucideIcon } from 'lucide-react';
import { ROUTES } from '@/utils/constants';

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  /** Permiso del motor requerido; null: visible para todo usuario autenticado */
  permission: string | null;
}

/** Un módulo por app del backend (trips, orders, fleet, drivers, locations) */
export const NAVIGATION: NavItem[] = [
  { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard, permission: null },
  { name: 'Viajes', href: ROUTES.TRIPS, icon: Route, permission: 'trips.view_m_trip' },
  { name: 'Pedidos', href: ROUTES.ORDERS, icon: Package, permission: null },
  { name: 'Flota', href: ROUTES.FLEET, icon: Truck, permission: null },
  { name: 'Conductores', href: ROUTES.DRIVERS, icon: Users, permission: null },
  { name: 'Ubicaciones', href: ROUTES.LOCATIONS, icon: MapPin, permission: null },
];

export const ADMIN_NAVIGATION: Omit<NavItem, 'permission'>[] = [];
