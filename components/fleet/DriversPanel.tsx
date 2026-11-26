'use client';

import { useState } from 'react';
import { Badge, Button, Card, Field, Input, Message, Select, Table, Td } from '@/components/ui';
import { useAction, useWorkflowData } from '@/hooks/useWorkflowData';
import { runWorkflow } from '@/services/workflow.service';
import { FleetDocuments } from './FleetDocuments';
import { DOCUMENT_TYPES, LICENSE_CATEGORIES } from './options';

type Driver = {
  id: number; user_id: number; username: string; first_name: string; last_name: string; name: string; email: string;
  document_type: string; document_number: string; phone: string; license_number: string; license_category: string;
  license_expedition: string | null; license_expire: string | null; license_valid: boolean; average_rating: string;
  is_available: boolean; is_active: boolean;
};

/** Conductores de Hurgo: cada uno es un usuario (entra a la app con el rol conductor) con su licencia */
export function DriversPanel({ canManage }: { canManage: boolean }) {
  const drivers = useWorkflowData<Driver[]>('drivers.list');
  const [selected, setSelected] = useState<number | 'new' | null>(null);
  const current = typeof selected === 'number' ? drivers.data?.find((d) => d.id === selected) : undefined;

  const saved = (d: Driver) => {
    drivers.reload();
    setSelected(d.id);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
      <Card title="Conductores" actions={canManage && <Button onClick={() => setSelected('new')}>Nuevo conductor</Button>}>
        <Message error={drivers.error} />
        <Table head={['Conductor', 'Documento', 'Licencia', 'Vence', 'Estado', '']} empty="Aún no hay conductores">
          {drivers.data?.map((d) => (
            <tr key={d.id} className={d.is_active ? '' : 'opacity-50'}>
              <Td><b>{d.name}</b><br /><span className="text-brand-700">{d.username}{d.phone && ` · ${d.phone}`}</span></Td>
              <Td>{d.document_number ? `${d.document_type} ${d.document_number}` : '—'}</Td>
              <Td>{d.license_category} · {d.license_number}</Td>
              <Td><span className={d.license_valid ? '' : 'text-red-700'}>{d.license_expire ?? '—'}{!d.license_valid && ' (vencida)'}</span></Td>
              <Td><Badge>{!d.is_active ? 'Inactivo' : d.is_available ? 'Disponible' : 'No disponible'}</Badge></Td>
              <Td><Button variant="outline" onClick={() => setSelected(d.id)}>Abrir</Button></Td>
            </tr>
          ))}
        </Table>
      </Card>
      <div className="space-y-4">
        {selected === 'new' && <DriverForm key="new" canManage={canManage} onSaved={saved} />}
        {current && (
          <>
            <DriverForm key={current.id} driver={current} canManage={canManage} onSaved={saved} />
            <Card title="Otros documentos">
              <FleetDocuments owner={{ driver_id: current.id }} canUpload={canManage} />
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function DriverForm({ driver, canManage, onSaved }: { driver?: Driver; canManage: boolean; onSaved: (d: Driver) => void }) {
  const [form, setForm] = useState({
    username: driver?.username ?? '', password: '', first_name: driver?.first_name ?? '', last_name: driver?.last_name ?? '',
    email: driver?.email ?? '', document_type: driver?.document_type ?? 'CC', document_number: driver?.document_number ?? '',
    phone: driver?.phone ?? '', license_number: driver?.license_number ?? '', license_category: driver?.license_category ?? '',
    license_expedition: driver?.license_expedition ?? '', license_expire: driver?.license_expire ?? '',
    is_available: driver?.is_available ?? true, is_active: driver?.is_active ?? true,
  });
  const action = useAction();
  const set = (field: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [field]: e.target.value });

  const save = async () => {
    const { username, password, ...rest } = form;
    const data = {
      ...rest, driver_id: driver?.id ?? null,
      license_expedition: form.license_expedition || null, license_expire: form.license_expire || null,
      ...(driver ? {} : { username }), ...(password ? { password } : {}),
    };
    const result = await action.run(() => runWorkflow<Driver>('drivers.save', data), 'Conductor guardado');
    if (result) onSaved(result);
  };

  return (
    <Card title={driver ? driver.name : 'Nuevo conductor'}>
      <fieldset disabled={!canManage} className="grid gap-2 sm:grid-cols-2">
        <Field label="Nombres"><Input value={form.first_name} onChange={set('first_name')} /></Field>
        <Field label="Apellidos"><Input value={form.last_name} onChange={set('last_name')} /></Field>
        <Field label="Tipo de documento"><Select value={form.document_type} onChange={set('document_type')} options={DOCUMENT_TYPES} /></Field>
        <Field label="Número de documento"><Input value={form.document_number} onChange={set('document_number')} /></Field>
        <Field label="Teléfono"><Input value={form.phone} onChange={set('phone')} /></Field>
        <Field label="Correo"><Input type="email" value={form.email} onChange={set('email')} /></Field>
        <Field label="Usuario para entrar a la app">
          <Input value={form.username} onChange={set('username')} disabled={!!driver} />
        </Field>
        <Field label={driver ? 'Nueva contraseña (opcional)' : 'Contraseña'}>
          <Input type="password" autoComplete="new-password" value={form.password} onChange={set('password')} />
        </Field>
        <Field label="Número de licencia"><Input value={form.license_number} onChange={set('license_number')} /></Field>
        <Field label="Categoría"><Select value={form.license_category} onChange={set('license_category')} options={LICENSE_CATEGORIES} /></Field>
        <Field label="Expedición de la licencia"><Input type="date" value={form.license_expedition} onChange={set('license_expedition')} /></Field>
        <Field label="Vencimiento de la licencia"><Input type="date" value={form.license_expire} onChange={set('license_expire')} /></Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} />
          Disponible para viajes
        </label>
        {driver && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Activo
          </label>
        )}
      </fieldset>
      {canManage && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button onClick={save} disabled={!form.license_number || !form.license_category || (!driver && (!form.username || !form.password)) || action.busy}>
            {driver ? 'Guardar cambios' : 'Registrar conductor'}
          </Button>
          <Message error={action.error} success={action.success} />
        </div>
      )}
    </Card>
  );
}
