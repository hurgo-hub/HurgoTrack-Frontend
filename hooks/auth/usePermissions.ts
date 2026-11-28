import { useAuth } from './useAuth';
import type { User } from '@/types';

export const isAdmin = (user: User | null | undefined) => !!(user?.is_staff || user?.is_superuser);

/** Administradores ven todo; el resto según los permisos del motor (p. ej. "trips.view_m_trip") */
export const hasPermission = (user: User | null | undefined, permission: string | null) => {
  if (!user) return false;
  if (!permission) return true;
  if (isAdmin(user)) return true;
  return !!user.permissions?.includes(permission);
};

/** Solo conductor (sin permisos de despacho): trabaja en la app del celular, no en la web */
export const isDriverOnly = (user: User | null | undefined) =>
  !!user && !isAdmin(user) && !!user.permissions?.includes('trips.drive_trip')
  && !user.permissions?.includes('trips.view_all_trip');

export function usePermissions() {
  const { user } = useAuth();
  return {
    isAdmin: isAdmin(user),
    can: (permission: string | null) => hasPermission(user, permission),
  };
}
