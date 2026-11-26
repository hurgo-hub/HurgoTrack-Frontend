'use client';

import { useState } from 'react';
import { Badge, Button, Card, Input, Message, PageTitle, Table, Td } from '@/components/ui';
import { useAuth } from '@/hooks/auth/useAuth';
import { hasPermission } from '@/hooks/auth/usePermissions';
import { useAction, useWorkflowData } from '@/hooks/useWorkflowData';
import { runWorkflow } from '@/services/workflow.service';
import { useOdooMode } from '@/hooks/useOdooMode';

type Request = {
  id: number; code: string; state: string; state_display: string; company: { id: number; name: string }; create_date: string;
  lines: { id: number; item: string; qty: string; order_code: string | null }[];
  odoo_purchases: { id: number; name: string }[];
};
type Summary = { stocked: { item: string; qty: string }[]; unmatched: { product: string; qty: string }[] };

export default function PurchasesPage() {
  const requests = useWorkflowData<Request[]>('stock.purchase_request.list');
  return (
    <>
      <PageTitle title="Solicitudes de compra"
        description="Hurgo pide la compra; el facturador compra en Odoo y registra la referencia: lo comprado entra al stock." />
      <Message error={requests.error} />
      <div className="space-y-3">
        {requests.data?.length === 0 && <Card><p className="text-sm text-brand-700">No hay solicitudes.</p></Card>}
        {requests.data?.map((r) => <RequestCard key={`${r.company.id}-${r.id}`} request={r} onDone={requests.reload} />)}
      </div>
    </>
  );
}

function RequestCard({ request: r, onDone }: { request: Request; onDone: () => void }) {
  const { user } = useAuth();
  const canLink = hasPermission(user, 'stock.link_purchase_request');
  const canManage = hasPermission(user, 'stock.manage_purchase_request');
  const [odoo, setOdoo] = useState('');
  const [summary, setSummary] = useState<Summary | null>(null);
  const action = useAction();
  const mode = useOdooMode(canLink);

  /** Odoo simulado: hace la compra en "Odoo" con lo de la solicitud y deja su referencia lista para registrar */
  const simulate = async () => {
    const sim = await action.run(
      () => runWorkflow<{ name: string }>('apiOdoo.simulate_purchase', { company_id: r.company.id, purchase_request_id: r.id }),
      'Compra creada en el Odoo simulado: regístrala',
    );
    if (sim) setOdoo(sim.name);
  };

  const link = async () => {
    const res = await action.run(
      () => runWorkflow<{ stock_summary: Summary }>('stock.purchase_request.link_purchase', { purchase_request_id: r.id, company_id: r.company.id, odoo_purchase: odoo }),
      'Compra registrada',
    );
    if (res) {
      setSummary(res.stock_summary);
      setOdoo('');
      onDone();
    }
  };

  const cancel = async () => {
    const reason = window.prompt('Motivo de la cancelación');
    if (!reason) return;
    if (await action.run(() => runWorkflow('stock.purchase_request.cancel', { purchase_request_id: r.id, company_id: r.company.id, reason }))) onDone();
  };

  return (
    <Card title={`${r.code} · ${r.company.name}`} actions={<Badge>{r.state_display}</Badge>}>
      <Table head={['Producto', 'Cantidad', 'Pedido']}>
        {r.lines.map((l) => (
          <tr key={l.id}><Td>{l.item}</Td><Td>{l.qty}</Td><Td>{l.order_code ?? '—'}</Td></tr>
        ))}
      </Table>
      {r.odoo_purchases.length > 0 && (
        <p className="mt-2 text-sm"><b>Compras Odoo:</b> {r.odoo_purchases.map((p) => p.name).join(', ')}</p>
      )}
      {summary && (
        <p className="mt-2 text-sm">
          Entró al stock: {summary.stocked.map((s) => `${s.item} +${s.qty}`).join(', ') || 'nada nuevo'}
          {summary.unmatched.length > 0 && ` · Sin producto en Hurgo: ${summary.unmatched.map((u) => u.product).join(', ')}`}
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {canLink && ['sent', 'purchased'].includes(r.state) && (
          <>
            {mode?.simulated && <Button variant="outline" onClick={simulate} disabled={action.busy}>Simular compra en Odoo</Button>}
            <Input className="max-w-48" placeholder="P00012" value={odoo} onChange={(e) => setOdoo(e.target.value)} />
            <Button onClick={link} disabled={!odoo.trim() || action.busy}>Registrar compra de Odoo</Button>
          </>
        )}
        {canManage && ['draft', 'sent'].includes(r.state) && (
          <Button variant="danger" onClick={cancel} disabled={action.busy}>Cancelar</Button>
        )}
      </div>
      <div className="mt-2"><Message error={action.error} success={action.success} /></div>
    </Card>
  );
}
