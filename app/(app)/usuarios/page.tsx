'use client';

import { useState } from 'react';
import { Badge, Button, Card, Field, Input, Message, PageTitle, Table, Td } from '@/components/ui';
import { useAction, useWorkflowData } from '@/hooks/useWorkflowData';
import { runWorkflow } from '@/services/workflow.service';

type AppUser = {
  id: number; username: string; first_name: string; last_name: string; email: string; is_active: boolean;
  is_superuser: boolean; roles: string[];
};
type Role = { name: string; label: string; scope: string; is_active: boolean };

const empty = { user_id: null as number | null, username: '', first_name: '', last_name: '', email: '', password: '', roles: [] as string[] };

export default function UsersPage() {
  const users = useWorkflowData<AppUser[]>('users.list');
  const roles = useWorkflowData<Role[]>('roles.list');
  const [form, setForm] = useState(empty);
  const action = useAction();
  const labels = Object.fromEntries((roles.data ?? []).map((r) => [r.name, r.label]));

  const edit = (u: AppUser) => setForm({ user_id: u.id, username: u.username, first_name: u.first_name, last_name: u.last_name, email: u.email, password: '', roles: u.roles });
  const toggleRole = (name: string) => setForm((f) => ({ ...f, roles: f.roles.includes(name) ? f.roles.filter((r) => r !== name) : [...f.roles, name] }));
  const save = async () => {
    const { password, ...rest } = form;
    if (await action.run(() => runWorkflow('users.save', password ? form : rest), 'Usuario guardado')) { setForm(empty); users.reload(); }
  };
  const toggleActive = async (u: AppUser) => {
    if (await action.run(() => runWorkflow('users.save', { user_id: u.id, is_active: !u.is_active }))) users.reload();
  };

  return (
    <>
      <PageTitle title="Usuarios de Hurgo" description="Despacho, conductores y administración. Los usuarios de cada empresa los gestiona su administrador." />
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card title="Usuarios">
          <Message error={users.error} />
          <Table head={['Usuario', 'Roles', '']}>
            {users.data?.map((u) => (
              <tr key={u.id} className={u.is_active ? '' : 'opacity-50'}>
                <Td><b>{u.username}</b><br /><span className="text-xs text-brand-700">{`${u.first_name} ${u.last_name}`.trim()}</span></Td>
                <Td><div className="flex flex-wrap gap-1">{u.is_superuser && <Badge>superusuario</Badge>}{u.roles.map((r) => <Badge key={r}>{labels[r] ?? r}</Badge>)}</div></Td>
                <Td>
                  <div className="flex gap-1">
                    <Button variant="outline" onClick={() => edit(u)}>Editar</Button>
                    <Button variant="outline" onClick={() => toggleActive(u)} disabled={action.busy}>{u.is_active ? 'Desactivar' : 'Activar'}</Button>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
        </Card>
        <Card title={form.user_id ? `Editar ${form.username}` : 'Nuevo usuario'}>
          <div className="space-y-3">
            <Field label="Usuario"><Input disabled={!!form.user_id} autoComplete="off" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Nombre"><Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></Field>
              <Field label="Apellido"><Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></Field>
            </div>
            <Field label="Correo"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label={form.user_id ? 'Nueva contraseña (opcional)' : 'Contraseña'}>
              <Input type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </Field>
            <div className="text-sm">
              <span className="mb-1 block font-medium">Roles</span>
              <div className="grid gap-1 sm:grid-cols-2">
                {roles.data?.filter((r) => r.is_active && r.scope === 'hurgo').map((r) => (
                  <label key={r.name} className="flex items-center gap-1.5">
                    <input type="checkbox" checked={form.roles.includes(r.name)} onChange={() => toggleRole(r.name)} />
                    {r.label}
                  </label>
                ))}
              </div>
            </div>
            <Message error={action.error || roles.error} success={action.success} />
            <div className="flex gap-2">
              <Button className="flex-1" onClick={save} disabled={!form.username || (!form.user_id && !form.password) || action.busy}>Guardar</Button>
              {form.user_id && <Button variant="outline" onClick={() => setForm(empty)}>Cancelar</Button>}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
