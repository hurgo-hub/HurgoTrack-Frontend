'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Badge, Button, Card, Field, Input, Message, PageTitle, Select, Table, Td } from '@/components/ui';
import { useAuth } from '@/hooks/auth/useAuth';
import { hasPermission } from '@/hooks/auth/usePermissions';
import { useAction, useWorkflowData } from '@/hooks/useWorkflowData';
import { DocumentList, type DocRow } from '@/components/shared/DocumentList';
import { runWorkflow, runWorkflowForm } from '@/services/workflow.service';
import { ROUTES } from '@/utils/constants';

type OrderLine = {
  id: number; qty: string; qty_assigned: string; qty_delivered: string; qty_pending: string; state_display: string;
  item: { id: number; name: string; unit: string };
  address: { name: string; address: string; location: string };
};
type Order = {
  id: number; code: string; state: string; state_display: string; order_date: string; odoo_purchase: string;
  notes: string; company: { id: number; name: string }; address: { id: number; name: string; location: string } | null;
  lines: OrderLine[]; events: { id: number; name: string; description: string; event_date: string; user: { name: string } | null }[];
};
type LoadingPoint = { id: number; name: string; company: { name: string }; location: string; suggested: boolean; matching_tags: string[] };
type Requirement = { item_id: number; item: string; unit: string; pending: string; available: string; in_requests: string; to_buy: string };

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  // Los ids de pedido se repiten entre empresas (cada una tiene su esquema): Hurgo abre el pedido con ?empresa=<id>
  const empresa = useSearchParams().get('empresa');
  const { user } = useAuth();
  const isDispatch = hasPermission(user, 'orders.confirm_order');
  const order = useWorkflowData<Order>('orders.retrieve', { order_id: Number(id), company_id: empresa ? Number(empresa) : undefined });
  const o = order.data;

  return (
    <>
      <Link href={ROUTES.ORDERS} className="text-sm text-brand-700 hover:underline">← Pedidos</Link>
      <Message error={order.error} />
      {o && (
        <>
          <PageTitle title={`Pedido ${o.code}`} description={`${o.company.name} · ${o.order_date}`} />
          <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              <Card title="Productos" actions={<Badge>{o.state_display}</Badge>}>
                <p className="mb-3 text-sm">
                  <b>Lugar de cargue:</b> {o.address ? `${o.address.name} · ${o.address.location}` : 'sin definir'}
                  {o.odoo_purchase && <> · <b>Compra Odoo:</b> {o.odoo_purchase}</>}
                </p>
                <Table head={['Producto', 'Destino', 'Cantidad', 'En viajes', 'Entregado', 'Pendiente', 'Estado']}>
                  {o.lines.map((l) => (
                    <tr key={l.id}>
                      <Td>{l.item.name}</Td>
                      <Td>{l.address.name}<br /><span className="text-brand-700">{l.address.address} · {l.address.location}</span></Td>
                      <Td>{l.qty}</Td>
                      <Td>{l.qty_assigned}</Td>
                      <Td>{l.qty_delivered}</Td>
                      <Td>{l.qty_pending}</Td>
                      <Td><Badge>{l.state_display}</Badge></Td>
                    </tr>
                  ))}
                </Table>
              </Card>
              <OrderDocuments order={o} />
              <Card title="Historial">
                <ul className="space-y-1 text-sm">
                  {o.events.map((e) => (
                    <li key={e.id}>
                      <span className="text-brand-700">{new Date(e.event_date).toLocaleString('es-CO')}</span> · <b>{e.name}</b>
                      {e.description && ` · ${e.description}`}{e.user && ` · ${e.user.name}`}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
            {isDispatch && ['draft', 'requested', 'confirmed'].includes(o.state) && (
              <div className="space-y-4">
                {o.state !== 'draft' && <Purchase order={o} onDone={order.reload} />}
                <LoadingPointPicker order={o} onDone={order.reload} />
                {o.state === 'requested' && <Confirm order={o} onDone={order.reload} />}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

/** 2-3. Cuánto comprar (pendiente − stock − ya solicitado) y solicitud al facturador */
function Purchase({ order, onDone }: { order: Order; onDone: () => void }) {
  const req = useWorkflowData<Requirement[]>('stock.requirements', { company_id: order.company.id });
  const action = useAction();
  const itemIds = new Set(order.lines.map((l) => l.item.id));
  const rows = (req.data ?? []).filter((r) => itemIds.has(r.item_id));
  const toBuy = rows.filter((r) => Number(r.to_buy) > 0);

  const request = async () => {
    const done = await action.run(
      () => runWorkflow<{ code: string }>('stock.purchase_request.create', {
        company_id: order.company.id,
        lines: toBuy.map((r) => ({
          item_id: r.item_id, qty: r.to_buy, order_line_id: order.lines.find((l) => l.item.id === r.item_id)?.id,
        })),
      }),
      'Solicitud enviada al facturador',
    );
    if (done) {
      req.reload();
      onDone();
    }
  };

  if (!req.loading && !rows.length && !req.error) return null; // productos sin stock (ej. motos)
  return (
    <Card title="Compra (stock)">
      <Table head={['Producto', 'Pendiente', 'Stock', 'Solicitado', 'Comprar']}>
        {rows.map((r) => (
          <tr key={r.item_id}>
            <Td>{r.item}</Td><Td>{r.pending}</Td><Td>{r.available}</Td><Td>{r.in_requests}</Td>
            <Td><b>{r.to_buy}</b></Td>
          </tr>
        ))}
      </Table>
      <div className="mt-3 space-y-2">
        <Message error={action.error || req.error} success={action.success} />
        {toBuy.length > 0 ? (
          <Button className="w-full" onClick={request} disabled={action.busy}>Pedir compra al facturador</Button>
        ) : (
          <p className="text-sm text-brand-700">El stock y lo ya solicitado alcanzan: no hay que comprar.</p>
        )}
      </div>
    </Card>
  );
}

/** Lugar de cargue (sugeridos primero por etiqueta) */
function LoadingPointPicker({ order, onDone }: { order: Order; onDone: () => void }) {
  const points = useWorkflowData<LoadingPoint[]>('locations.loading_points', { order_id: order.id, order_company_id: order.company.id });
  const [selected, setSelected] = useState(order.address ? String(order.address.id) : '');
  const action = useAction();

  const save = async () => {
    const done = await action.run(
      () => runWorkflow('orders.set_loading_point', { order_id: order.id, company_id: order.company.id, address_id: Number(selected) }),
      'Lugar de cargue asignado',
    );
    if (done) onDone();
  };

  return (
    <Card title="Lugar de cargue">
      <div className="space-y-2">
        <Select value={selected} onChange={(e) => setSelected(e.target.value)}
          options={(points.data ?? []).map((p) => ({
            value: p.id,
            label: `${p.suggested ? '★ ' : ''}${p.name} · ${p.company.name} · ${p.location}`,
          }))} />
        <p className="text-xs text-brand-700">★ = tiene la etiqueta del producto. Regístralos en “Lugares de cargue”.</p>
        <Message error={action.error || points.error} success={action.success} />
        <Button className="w-full" onClick={save} disabled={!selected || action.busy}>Asignar lugar de cargue</Button>
      </div>
    </Card>
  );
}

/** Confirmar: la compra de Odoo solo es obligatoria si el pedido no es de productos con stock */
function Confirm({ order, onDone }: { order: Order; onDone: () => void }) {
  const [odoo, setOdoo] = useState('');
  const action = useAction();

  const confirm = async () => {
    const done = await action.run(() => runWorkflow('orders.confirm', { order_id: order.id, company_id: order.company.id, odoo_purchase: odoo }), 'Pedido confirmado');
    if (done) onDone();
  };

  return (
    <Card title="Confirmar pedido">
      <div className="space-y-2">
        <Field label="Compra en Odoo (vacío si es de materiales con stock)">
          <Input value={odoo} onChange={(e) => setOdoo(e.target.value)} placeholder="P00012" />
        </Field>
        <Message error={action.error} success={action.success} />
        <Button className="w-full" onClick={confirm} disabled={action.busy}>Confirmar</Button>
      </div>
    </Card>
  );
}

/** Documentos que pide la empresa para el pedido; se exigen al confirmar */
function OrderDocuments({ order }: { order: Order }) {
  const { user } = useAuth();
  const docs = useWorkflowData<DocRow[]>('orders.documents', { order_id: order.id, company_id: order.company.id });
  const canUpload = !['delivered', 'cancelled'].includes(order.state)
    && (hasPermission(user, 'orders.add_m_order') || hasPermission(user, 'orders.confirm_order'));

  const upload = async (doc: DocRow, file: File) => {
    const form = new FormData();
    form.append('order_id', String(order.id));
    form.append('company_id', String(order.company.id));
    form.append('document_key', doc.key ?? '');
    form.append('files', file);
    await runWorkflowForm('orders.attach', form);
    docs.reload();
  };

  if (!docs.loading && !docs.error && !docs.data?.length) return null;
  return (
    <Card title="Documentos del pedido">
      <Message error={docs.error} />
      {docs.data && <DocumentList docs={docs.data} canUpload={canUpload} onUpload={upload} />}
    </Card>
  );
}
