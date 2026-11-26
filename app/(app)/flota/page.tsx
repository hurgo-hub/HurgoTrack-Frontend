'use client';

import { useState } from 'react';
import { PageTitle } from '@/components/ui';
import { DriversPanel } from '@/components/fleet/DriversPanel';
import { VehiclesPanel } from '@/components/fleet/VehiclesPanel';
import { useAuth } from '@/hooks/auth/useAuth';
import { hasPermission } from '@/hooks/auth/usePermissions';
import { cn } from '@/utils/helpers';

const TABS = [
  { key: 'vehicles', label: 'Vehículos' },
  { key: 'drivers', label: 'Conductores' },
] as const;

/** Flota de Hurgo: la registra administración; despacho la consulta. Sin SOAT, tecnomecánica, licencia y
 * documentos obligatorios vigentes no se asigna el viaje. */
export default function FleetPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('vehicles');

  return (
    <>
      <PageTitle title="Flota" description="Vehículos (con SOAT y revisión técnico-mecánica) y conductores de Hurgo. Sin los documentos vigentes no se les asignan viajes." />
      <div className="mb-4 flex gap-2 border-b border-brand-200">
        {TABS.map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            className={cn('-mb-px border-b-2 px-3 py-2 text-sm font-medium',
              tab === t.key ? 'border-brand-900 text-brand-900' : 'border-transparent text-brand-700 hover:text-brand-900')}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'vehicles' && <VehiclesPanel canManage={hasPermission(user, 'fleet.add_m_vehicle')} />}
      {tab === 'drivers' && <DriversPanel canManage={hasPermission(user, 'drivers.add_m_driver')} />}
    </>
  );
}
