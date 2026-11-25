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

type Pending = {
  id: number; order_code: string; company_id: number; item: string; recipient: string; address: string;
  qty_pending: string; loading_address: string | null; uses_stock: boolean;
};
type TripRow = { id: number; code: string; state: string; create_date: string };

const STATES: Record<string, string> = {
  draft: 'Armando', assigned: 'Asignado', in_route: 'En camino', delivering: 'En reparto', closed: 'Cerrado', cancelled: 'Cancelado',
};

export default function TripsPage() {
  const { user } = useAuth();
  const trips = useWorkflowData<TripRow[]>('trips.list', {
    data: { fields: ['id', 'code', 'state', 'create_date'], order_by: ['-id'], limit: 100 },
  });

  return (
    <>
      <PageTitle title="Viajes" description="Arma un viaje con lo pendiente de los pedidos confirmados (un lugar de cargue por viaje)." />
      <div className="space-y-4">
        {hasPermission(user, 'trips.build_trip') && <BuildTrip />}
        <Card title="Viajes">
          <Message error={trips.error} />
          <Table head={['Código', 'Creado', 'Estado']}>
            {trips.data?.map((t) => (
              <tr key={t.id}>
                <Td><Link href={`${ROUTES.TRIPS}/${t.id}`} className="font-semibold hover:underline">{t.code}</Link></Td>
                <Td>{new Date(t.create_date).toLocaleString('es-CO')}</Td>
                <Td><Badge>{STATES[t.state] ?? t.state}</Badge></Td>
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
  const [qty, setQty] = useState<Record<number, string>>({});
  const action = useAction();
  const selected = Object.entries(qty).filter(([, q]) => Number(q) > 0);

  const build = async () => {
    const first = pending.data?.find((p) => String(p.id) === selected[0][0]);
    const trip = await action.run(() => runWorkflow<{ id: number }>('trips.build', {
      company_id: first?.company_id,
      allocations: selected.map(([id, q]) => ({ order_line_id: Number(id), qty: q })),
    }));
    if (trip) router.push(`${ROUTES.TRIPS}/${trip.id}`);
  };

  return (
    <Card title="Armar viaje" actions={<span className="text-sm text-brand-700">Escribe cuánto cargar de cada línea</span>}>
      <Message error={pending.error} />
      <Table head={['Pedido', 'Producto', 'Destino', 'Cargue', 'Pendiente', 'Cargar']} empty="No hay pedidos confirmados con pendientes">
        {pending.data?.map((p) => (
          <tr key={p.id}>
            <Td>{p.order_code}</Td>
            <Td>{p.item}{p.uses_stock && <> <Badge>stock</Badge></>}</Td>
            <Td>{p.recipient} · {p.address}</Td>
            <Td>{p.loading_address ?? '—'}</Td>
            <Td>{p.qty_pending}</Td>
            <Td>
              <Input type="number" min="0" step="any" className="w-24" value={qty[p.id] ?? ''}
                onChange={(e) => setQty({ ...qty, [p.id]: e.target.value })} />
            </Td>
          </tr>
        ))}
      </Table>
      <div className="mt-3 flex items-center gap-3">
        <Button onClick={build} disabled={!selected.length || action.busy}>Armar viaje</Button>
        <Message error={action.error} />
      </div>
    </Card>
  );
}
