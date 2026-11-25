'use client';

import { useState } from 'react';
import { Button, Card, Field, Input, Message, PageTitle, Select, Table, Td } from '@/components/ui';
import { useAuth } from '@/hooks/auth/useAuth';
import { hasPermission } from '@/hooks/auth/usePermissions';
import { useAction, useWorkflowData } from '@/hooks/useWorkflowData';
import { runWorkflow } from '@/services/workflow.service';

type Stock = { id: number; company: string; item: string; unit: string; qty_available: string };
type Move = {
  id: number; move_date: string; item: string; move_type_display: string; qty: string; balance: string;
  odoo_purchase: string | null; purchase_request: string | null; trip_code: string | null; order_code: string | null; description: string;
};

export default function StockPage() {
  const { user } = useAuth();
  const stock = useWorkflowData<Stock[]>('stock.list');
  const moves = useWorkflowData<Move[]>('stock.moves');
  const reload = () => { stock.reload(); moves.reload(); };

  return (
    <>
      <PageTitle title="Stock" description="Lo comprado en Odoo que aún no se ha cargado, por empresa y producto." />
      <div className="space-y-4">
        <Card title="Disponible">
          <Message error={stock.error} />
          <Table head={['Empresa', 'Producto', 'Disponible']}>
            {stock.data?.map((s) => (
              <tr key={s.id}><Td>{s.company}</Td><Td>{s.item}</Td><Td><b>{s.qty_available}</b> {s.unit}</Td></tr>
            ))}
          </Table>
        </Card>
        {hasPermission(user, 'stock.adjust_stock') && <Adjust onDone={reload} />}
        <Card title="Movimientos (kardex)">
          <Message error={moves.error} />
          <Table head={['Fecha', 'Producto', 'Movimiento', 'Cantidad', 'Saldo', 'Origen']}>
            {moves.data?.map((m) => (
              <tr key={m.id}>
                <Td>{new Date(m.move_date).toLocaleString('es-CO')}</Td>
                <Td>{m.item}</Td>
                <Td>{m.move_type_display}</Td>
                <Td>{m.qty}</Td>
                <Td>{m.balance}</Td>
                <Td>{[m.odoo_purchase, m.purchase_request, m.trip_code, m.order_code, m.description].filter(Boolean).join(' · ')}</Td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </>
  );
}

/** Ajuste manual (administración): sirve también para probar sin Odoo */
function Adjust({ onDone }: { onDone: () => void }) {
  const lookups = useWorkflowData<{ companies: { id: number; name: string; is_client: boolean }[] }>('locations.lookups');
  const [companyId, setCompanyId] = useState('');
  const items = useWorkflowData<{ id: number; name: string }[]>('orders.items', { company_id: Number(companyId) }, !!companyId);
  const [form, setForm] = useState({ item_id: '', qty: '', reason: '' });
  const action = useAction();

  const save = async () => {
    const done = await action.run(
      () => runWorkflow('stock.adjust', { company_id: Number(companyId), item_id: Number(form.item_id), qty: form.qty, reason: form.reason }),
      'Stock ajustado',
    );
    if (done) { setForm({ item_id: '', qty: '', reason: '' }); onDone(); }
  };

  return (
    <Card title="Ajuste manual">
      <div className="grid gap-3 sm:grid-cols-4">
        <Field label="Empresa">
          <Select value={companyId} onChange={(e) => setCompanyId(e.target.value)}
            options={(lookups.data?.companies ?? []).filter((c) => c.is_client).map((c) => ({ value: c.id, label: c.name }))} />
        </Field>
        <Field label="Producto">
          <Select value={form.item_id} onChange={(e) => setForm({ ...form, item_id: e.target.value })}
            options={(companyId ? items.data ?? [] : []).map((i) => ({ value: i.id, label: i.name }))} />
        </Field>
        <Field label="Cantidad (+ entra / − sale)">
          <Input type="number" step="any" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
        </Field>
        <Field label="Motivo">
          <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        </Field>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Button onClick={save} disabled={!form.item_id || !form.qty || !form.reason || action.busy}>Ajustar</Button>
        <Message error={action.error || lookups.error} success={action.success} />
      </div>
    </Card>
  );
}
