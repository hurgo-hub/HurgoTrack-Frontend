import { describe, expect, it } from 'vitest';
import { cn } from '@/utils/helpers';
import { formatCurrency } from '@/utils/format.utils';
import { hasPermission } from '@/hooks/auth/usePermissions';

describe('utils', () => {
  it('cn resuelve conflictos de Tailwind', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('formatCurrency usa pesos colombianos', () => {
    expect(formatCurrency(1500)).toContain('1.500');
  });

  it('hasPermission: admin ve todo, el resto según permisos', () => {
    const admin = { id: 1, username: 'a', is_staff: true, is_superuser: false };
    const driver = { id: 2, username: 'd', is_staff: false, is_superuser: false, permissions: ['trips.drive_trip'] };
    expect(hasPermission(admin, 'trips.cancel_trip')).toBe(true);
    expect(hasPermission(driver, 'trips.drive_trip')).toBe(true);
    expect(hasPermission(driver, 'trips.cancel_trip')).toBe(false);
  });
});
