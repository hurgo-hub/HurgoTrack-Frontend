'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge, Button, Card, Input, Message, PageTitle, Table, Td } from '@/components/ui';
import { useAuth } from '@/hooks/auth/useAuth';
import { hasPermission } from '@/hooks/auth/usePermissions';
import { useAction, useWorkflowData } from '@/hooks/useWorkflowData';
import { runWorkflow } from '@/services/workflow.service';
import { ROUTES } from '@/utils/constants';

/** Las líneas vienen de varias empresas y sus ids se repiten: se identifican con empresa + id. */
type Pending = {
  id: number; order_code: string; company_id: number; company: string; item: string; address: string;
  qty_pending: string; loading_address: string | null; uses_stock: boolean; stock_available: string | null;
};
type TripRow = { id: number; code: string; state: string; create_date: string; driver_response: string; driver_response_note: string };

const STATES: Record<string, string> = {
  draft: 'Armando', assigned: 'Asignado', in_route: 'En camino', delivering: 'En reparto', closed: 'Cerrado', cancelled: 'Cancelado',
};

export default function TripsPage() {
  const { user } = useAuth();
  const trips = useWorkflowData<TripRow[]>('trips.list', {
    data: { fields: ['id', 'code', 'state', 'create_date', 'driver_response', 'driver_response_note'], order_by: ['-id'], limit: 100 },
  });

  return (
    <>
      <PageTitle title="Viajes" description="Arma un viaje con lo pendiente de los pedidos confirmados (un lugar de cargue por viaje)." />
      <div className="space-y-4">
        {hasPermission(user, 'trips.build_trip') && <BuildTrip />}
        <Card title="Viajes">
          <Message error={trips.error} />
          <Table head={['Código', 'Creado', 'Estado', 'Conductor']}>
            {trips.data?.map((t) => (
              <tr key={t.id}>
                <Td><Link href={`${ROUTES.TRIPS}/${t.id}`} className="font-semibold hover:underline">{t.code}</Link></Td>
                <Td>{new Date(t.create_date).toLocaleString('es-CO')}</Td>
                <Td><Badge>{STATES[t.state] ?? t.state}</Badge></Td>
                <Td>
                  {t.state === 'draft' && t.driver_response === 'rejected' && <span className="text-red-700">Rechazado por {t.driver_response_note}</span>}
                  {t.state === 'assigned' && (t.driver_response === 'accepted'
                    ? <span className="text-green-700">Aceptado</span>
                    : <span className="text-amber-700">Esperando que acepte</span>)}
                </Td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </>
  );
}

function BuildTrip() {
  const router = useRouter();
  const pending = useWorkflowData<Pending[]>('orders.pending_lines');
  const [qty, setQty] = useState<Record<string, string>>({});
  const action = useAction();
  const rowKey = (p: Pending) => `${p.company_id}-${p.id}`;
  const selected = (pending.data ?? []).filter((p) => Number(qty[rowKey(p)]) > 0);
  const companies = new Set(selected.map((p) => p.company_id));

  const build = async () => {
    const trip = await action.run(() => runWorkflow<{ id: number }>('trips.build', {
      company_id: selected[0].company_id,
      allocations: selected.map((p) => ({ order_line_id: p.id, qty: qty[rowKey(p)] })),
    }));
    if (trip) router.push(`${ROUTES.TRIPS}/${trip.id}`);
  };

  return (
    <Card title="Armar viaje" actions={<span className="text-sm text-brand-700">Escribe cuánto cargar de cada línea</span>}>
      <Message error={pending.error} />
      <Table head={['Empresa', 'Pedido', 'Producto', 'Destino', 'Cargue', 'Pendiente', 'Stock disponible', 'Cargar']} empty="No hay pedidos confirmados con pendientes">
        {pending.data?.map((p) => (
          <tr key={rowKey(p)}>
            <Td>{p.company}</Td>
            <Td>{p.order_code}</Td>
            <Td>{p.item}{p.uses_stock && <> <Badge>stock</Badge></>}</Td>
            <Td>{p.address}</Td>
            <Td>{p.loading_address ?? '—'}</Td>
            <Td>{p.qty_pending}</Td>
            <Td>{p.uses_stock ? <b>{p.stock_available}</b> : '—'}</Td>
            <Td>
              <Input type="number" min="0" step="any" className="w-24" value={qty[rowKey(p)] ?? ''}
                onChange={(e) => setQty({ ...qty, [rowKey(p)]: e.target.value })} />
            </Td>
          </tr>
        ))}
      </Table>
      <div className="mt-3 flex items-center gap-3">
        <Button onClick={build} disabled={!selected.length || companies.size > 1 || action.busy}>Armar viaje</Button>
        <Message error={action.error || (companies.size > 1 ? 'Un viaje lleva pedidos de una sola empresa.' : '')} />
      </div>
    </Card>
  );
}
