'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Badge, Button, Card, Field, Input, Message, PageTitle, Select, Table, Td } from '@/components/ui';
import { useAuth } from '@/hooks/auth/useAuth';
import { hasPermission } from '@/hooks/auth/usePermissions';
import { useAction, useWorkflowData } from '@/hooks/useWorkflowData';
import { runWorkflow } from '@/services/workflow.service';
import { ROUTES } from '@/utils/constants';

type OrderRow = { id: number; code: string; state: string; order_date: string };
type Item = { id: number; name: string; unit: string; company_id: number };
type Recipient = { id: number; name: string; addresses: { id: number; name: string; location: string }[] };
type Line = { item_id: string; qty: string; recipient_id: string; address_id: string };

const STATES: Record<string, string> = {
  draft: 'Borrador', requested: 'Pedido', confirmed: 'Confirmado', in_progress: 'En despacho',
  delivered: 'Entregado', cancelled: 'Cancelado',
};
const emptyLine: Line = { item_id: '', qty: '', recipient_id: '', address_id: '' };

export default function OrdersPage() {
  const { user } = useAuth();
  const canCreate = hasPermission(user, 'orders.add_m_order');
  const orders = useWorkflowData<OrderRow[]>('orders.list', {
    data: { fields: ['id', 'code', 'state', 'order_date'], order_by: ['-id'], limit: 100 },
  });

  return (
    <>
      <PageTitle title="Pedidos" description="Pedidos de las empresas cliente. Abre uno para gestionarlo." />
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <Card title="Listado">
          <Message error={orders.error} />
          <Table head={['Código', 'Fecha', 'Estado']}>
            {orders.data?.map((o) => (
              <tr key={o.id}>
                <Td>
                  <Link href={`${ROUTES.ORDERS}/${o.id}`} className="font-semibold underline-offset-2 hover:underline">
                    {o.code}
                  </Link>
                </Td>
                <Td>{o.order_date}</Td>
                <Td><Badge>{STATES[o.state] ?? o.state}</Badge></Td>
              </tr>
            ))}
          </Table>
        </Card>
        {canCreate && <NewOrder onCreated={orders.reload} />}
      </div>
    </>
  );
}

function NewOrder({ onCreated }: { onCreated: () => void }) {
  const items = useWorkflowData<Item[]>('orders.items');
  const recipients = useWorkflowData<Recipient[]>('locations.recipients');
  const [lines, setLines] = useState<Line[]>([emptyLine]);
  const [notes, setNotes] = useState('');
  const action = useAction();

  const update = (i: number, patch: Partial<Line>) =>
    setLines((ls) => ls.map((l, n) => (n === i ? { ...l, ...patch } : l)));

  const submit = async () => {
    const order = await action.run(
      () => runWorkflow<{ code: string }>('orders.create', {
        notes,
        lines: lines.map((l) => ({ item_id: Number(l.item_id), qty: l.qty, recipient_id: Number(l.recipient_id), address_id: Number(l.address_id) })),
      }),
      'Pedido creado',
    );
    if (order) {
      setLines([emptyLine]);
      setNotes('');
      onCreated();
    }
  };

  const ready = lines.every((l) => l.item_id && Number(l.qty) > 0 && l.address_id);

  return (
    <Card title="Nuevo pedido">
      <div className="space-y-4">
        {lines.map((line, i) => {
          const recipient = recipients.data?.find((r) => String(r.id) === line.recipient_id);
          return (
            <div key={i} className="space-y-2 rounded-lg border border-brand-200 p-3">
              <Field label="Producto">
                <Select value={line.item_id} onChange={(e) => update(i, { item_id: e.target.value })}
                  options={(items.data ?? []).map((it) => ({ value: it.id, label: `${it.name} (${it.unit})` }))} />
              </Field>
              <Field label="Cantidad">
                <Input type="number" min="0" step="any" value={line.qty} onChange={(e) => update(i, { qty: e.target.value })} />
              </Field>
              <Field label="Destinatario">
                <Select value={line.recipient_id} onChange={(e) => update(i, { recipient_id: e.target.value, address_id: '' })}
                  options={(recipients.data ?? []).map((r) => ({ value: r.id, label: r.name }))} />
              </Field>
              <Field label="Dirección de entrega">
                <Select value={line.address_id} onChange={(e) => update(i, { address_id: e.target.value })}
                  options={(recipient?.addresses ?? []).map((a) => ({ value: a.id, label: `${a.name} · ${a.location}` }))} />
              </Field>
              {lines.length > 1 && (
                <Button variant="danger" onClick={() => setLines((ls) => ls.filter((_, n) => n !== i))}>Quitar</Button>
              )}
            </div>
          );
        })}
        <Button variant="outline" onClick={() => setLines((ls) => [...ls, emptyLine])}>Agregar producto</Button>
        <Field label="Notas">
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <Message error={action.error || items.error || recipients.error} success={action.success} />
        <Button className="w-full" onClick={submit} disabled={!ready || action.busy}>
          {action.busy ? 'Enviando…' : 'Crear pedido'}
        </Button>
      </div>
    </Card>
  );
}
