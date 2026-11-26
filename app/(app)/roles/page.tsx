'use client';

import { useState } from 'react';
import { Badge, Button, Card, Field, Input, Message, PageTitle, Select, Table, Td } from '@/components/ui';
import { useAction, useWorkflowData } from '@/hooks/useWorkflowData';
import { runWorkflow } from '@/services/workflow.service';

type Role = {
  id: number; name: string; label: string; scope: 'hurgo' | 'company'; description: string;
  is_system: boolean; is_active: boolean; permissions: string[]; users: number;
};
type PermGroup = { app: string; permissions: { code: string; name: string; company_allowed: boolean }[] };

const APP_LABELS: Record<string, string> = {
  orders: 'Pedidos y productos', trips: 'Viajes', stock: 'Stock y compras', locations: 'Direcciones',
  fleet: 'Flota', drivers: 'Conductores', companies: 'Empresas y roles', catalogs: 'Catálogos',
  apiOdoo: 'Odoo', apiSatrack: 'Satrack', base: 'Base',
};
const SCOPES = [{ value: 'company', label: 'Empresa (lo asigna el admin de empresa)' }, { value: 'hurgo', label: 'Hurgo' }];
const empty = { id: null as number | null, name: '', label: '', description: '', scope: 'company', permissions: [] as string[] };

export default function RolesPage() {
  const roles = useWorkflowData<Role[]>('roles.list');
  const perms = useWorkflowData<PermGroup[]>('roles.permissions');
  const [form, setForm] = useState(empty);
  const [viewing, setViewing] = useState<Role | null>(null);
  const action = useAction();
  const readOnly = !!viewing?.is_system;

  const open = (r: Role) => {
    setViewing(r);
    setForm({ id: r.id, name: r.name, label: r.label, description: r.description, scope: r.scope, permissions: r.permissions });
  };
  const reset = () => { setViewing(null); setForm(empty); };
  const toggle = (code: string) => setForm((f) => ({
    ...f, permissions: f.permissions.includes(code) ? f.permissions.filter((p) => p !== code) : [...f.permissions, code],
  }));
  const save = async () => {
    if (await action.run(() => runWorkflow('roles.save', form), 'Rol guardado')) { reset(); roles.reload(); }
  };

  return (
    <>
      <PageTitle title="Roles y permisos" description="Los roles de sistema se ven pero no se editan. Un rol de empresa solo lleva permisos de empresa." />
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Card title="Roles" actions={<Button variant="outline" onClick={reset}>Nuevo rol</Button>}>
          <Message error={roles.error} />
          <Table head={['Rol', 'Alcance', 'Usuarios', '']}>
            {roles.data?.map((r) => (
              <tr key={r.id} className={r.is_active ? '' : 'opacity-50'}>
                <Td><b>{r.label}</b><br /><span className="text-xs text-brand-700">{r.name}</span></Td>
                <Td><Badge>{r.scope === 'company' ? 'Empresa' : 'Hurgo'}</Badge>{r.is_system && <> <Badge>sistema</Badge></>}</Td>
                <Td>{r.users}</Td>
                <Td><Button variant="outline" onClick={() => open(r)}>{r.is_system ? 'Ver' : 'Editar'}</Button></Td>
              </tr>
            ))}
          </Table>
        </Card>
        <Card title={viewing ? `${readOnly ? 'Rol' : 'Editar'}: ${viewing.label}` : 'Nuevo rol'}>
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="Nombre interno"><Input disabled={readOnly} value={form.name} placeholder="bodeguero" onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Nombre visible"><Input disabled={readOnly} value={form.label} placeholder="Bodeguero" onChange={(e) => setForm({ ...form, label: e.target.value })} /></Field>
            </div>
            <Field label="Alcance">
              <Select disabled={readOnly} value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} options={SCOPES} placeholder="Alcance" />
            </Field>
            <Field label="Descripción"><Input disabled={readOnly} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <div className="max-h-[28rem] space-y-3 overflow-y-auto rounded-lg border border-brand-200 p-3">
              <Message error={perms.error} />
              {perms.data?.map((g) => {
                const visible = g.permissions.filter((p) => form.scope === 'hurgo' || p.company_allowed || form.permissions.includes(p.code));
                if (!visible.length) return null;
                return (
                  <div key={g.app}>
                    <p className="mb-1 text-sm font-semibold">{APP_LABELS[g.app] ?? g.app}</p>
                    <div className="grid gap-x-3 gap-y-1 sm:grid-cols-2">
                      {visible.map((p) => (
                        <label key={p.code} className="flex items-start gap-1.5 text-xs">
                          <input type="checkbox" className="mt-0.5" disabled={readOnly} checked={form.permissions.includes(p.code)} onChange={() => toggle(p.code)} />
                          <span>{p.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            {form.scope === 'company' && !readOnly && (
              <p className="text-xs text-brand-700">Solo se muestran los permisos válidos para usuarios de una empresa.</p>
            )}
            <Message error={action.error} success={action.success} />
            {!readOnly && <Button className="w-full" onClick={save} disabled={!form.name.trim() || action.busy}>Guardar rol</Button>}
          </div>
        </Card>
      </div>
    </>
  );
}
