'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Badge, Button, Card, Field, Input, Message, PageTitle, Select, Table, Td } from '@/components/ui';
import { useAuth } from '@/hooks/auth/useAuth';
import { hasPermission } from '@/hooks/auth/usePermissions';
import { useAction, useWorkflowData } from '@/hooks/useWorkflowData';
import { runWorkflow } from '@/services/workflow.service';
import { ROUTES } from '@/utils/constants';

/** Hurgo recibe los pedidos de todas las empresas con ``company_id`` y ``company`` en cada fila. */
type OrderRow = { id: number; code: string; state: string; order_date: string; company_id?: number; company?: string };
type Item = { id: number; name: string; unit: string; company_id: number };
type Company = { id: number; name: string; is_client: boolean };
type Address = { id: number; name: string; address: string; location: string; is_active: boolean };
type Line = { item_id: string; qty: string; address_id: string };

const STATES: Record<string, string> = {
  draft: 'Borrador', requested: 'Pedido', confirmed: 'Confirmado', in_progress: 'En despacho',
  delivered: 'Entregado', cancelled: 'Cancelado',
};
const emptyLine: Line = { item_id: '', qty: '', address_id: '' };

export default function OrdersPage() {
  const { user } = useAuth();
  const canCreate = hasPermission(user, 'orders.add_m_order');
  // Hurgo ve los pedidos de todas las empresas y puede filtrar por una; la empresa solo ve los suyos
  const seesAll = hasPermission(user, 'orders.view_all_order');
  const lookups = useWorkflowData<{ companies: Company[] }>('locations.lookups', {}, seesAll);
  const companies = (lookups.data?.companies ?? []).filter((c) => c.is_client);
  const [companyId, setCompanyId] = useState('');
  const orders = useWorkflowData<OrderRow[]>('orders.list', {
    ...(companyId ? { company_id: Number(companyId) } : {}),
    data: { fields: ['id', 'code', 'state', 'order_date'], order_by: ['-id'], limit: 100 },
  });
  const companyName = (id?: number) => companies.find((c) => c.id === id)?.name ?? '';

  return (
    <>
      <PageTitle title="Pedidos" description="Pedidos de las empresas cliente. Abre uno para gestionarlo." />
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <Card title="Listado" actions={seesAll && (
          <Select value={companyId} onChange={(e) => setCompanyId(e.target.value)} placeholder="Todas las empresas"
            className="w-56" options={companies.map((c) => ({ value: c.id, label: c.name }))} />
        )}>
          <Message error={orders.error || lookups.error} />
          <Table head={seesAll ? ['Código', 'Empresa', 'Fecha', 'Estado'] : ['Código', 'Fecha', 'Estado']}
            empty={companyId ? 'Esta empresa no tiene pedidos' : 'Sin pedidos'}>
            {orders.data?.map((o) => {
              // Los ids de pedido se repiten entre empresas: Hurgo abre el pedido con su empresa
              const company = o.company_id ?? (companyId ? Number(companyId) : undefined);
              return (
                <tr key={`${company ?? ''}-${o.id}`}>
                  <Td>
                    <Link href={`${ROUTES.ORDERS}/${o.id}${company ? `?empresa=${company}` : ''}`}
                      className="font-semibold underline-offset-2 hover:underline">
                      {o.code}
                    </Link>
                  </Td>
                  {seesAll && <Td>{o.company || companyName(company)}</Td>}
                  <Td>{o.order_date}</Td>
                  <Td><Badge>{STATES[o.state] ?? o.state}</Badge></Td>
                </tr>
              );
            })}
          </Table>
        </Card>
        {canCreate && (seesAll && !companyId ? (
          <Card title="Nuevo pedido">
            <p className="text-sm text-brand-700">Elige la empresa en el listado para crear un pedido a su nombre.</p>
          </Card>
        ) : (
          <NewOrder key={companyId} companyId={companyId ? Number(companyId) : undefined} onCreated={orders.reload} />
        ))}
      </div>
    </>
  );
}

/** ``forCompany``: la empresa elegida por Hurgo; un usuario de empresa pide para la suya */
function NewOrder({ companyId: forCompany, onCreated }: { companyId?: number; onCreated: () => void }) {
  const items = useWorkflowData<Item[]>('orders.items', forCompany ? { company_id: forCompany } : {});
  const [lines, setLines] = useState<Line[]>([emptyLine]);
  // La empresa del pedido es la de los productos; las direcciones de entrega son las que ella guarda
  const companyId = forCompany
    ?? items.data?.find((it) => String(it.id) === lines[0]?.item_id)?.company_id ?? items.data?.[0]?.company_id;
  const addresses = useWorkflowData<Address[]>('locations.addresses', { company_id: companyId }, !!companyId);
  const [notes, setNotes] = useState('');
  const action = useAction();

  const update = (i: number, patch: Partial<Line>) =>
    setLines((ls) => ls.map((l, n) => (n === i ? { ...l, ...patch } : l)));

  const submit = async () => {
    const order = await action.run(
      () => runWorkflow<{ code: string }>('orders.create', {
        company_id: companyId,
        notes,
        lines: lines.map((l) => ({ item_id: Number(l.item_id), qty: l.qty, address_id: Number(l.address_id) })),
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
          const companyItems = (items.data ?? []).filter((it) => i === 0 || it.company_id === companyId);
          return (
            <div key={i} className="space-y-2 rounded-lg border border-brand-200 p-3">
              <Field label="Producto">
                <Select value={line.item_id} onChange={(e) => update(i, { item_id: e.target.value })}
                  options={companyItems.map((it) => ({ value: it.id, label: `${it.name} (${it.unit})` }))} />
              </Field>
              <Field label="Cantidad">
                <Input type="number" min="0" step="any" value={line.qty} onChange={(e) => update(i, { qty: e.target.value })} />
              </Field>
              <Field label="Dirección de entrega">
                <Select value={line.address_id} onChange={(e) => update(i, { address_id: e.target.value })}
                  options={(addresses.data ?? []).filter((a) => a.is_active)
                    .map((a) => ({ value: a.id, label: `${a.name} · ${a.address} · ${a.location}` }))} />
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
        {addresses.data?.length === 0 && (
          <p className="text-sm text-brand-700">La empresa no tiene direcciones de entrega: agrégalas en “Mi empresa”.</p>
        )}
        <Message error={action.error || items.error || addresses.error} success={action.success} />
        <Button className="w-full" onClick={submit} disabled={!ready || action.busy}>
          {action.busy ? 'Enviando…' : 'Crear pedido'}
        </Button>
      </div>
    </Card>
  );
}
