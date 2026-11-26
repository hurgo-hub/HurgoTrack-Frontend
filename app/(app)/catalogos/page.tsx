'use client';

import { useState } from 'react';
import { Badge, Button, Card, Field, Input, Message, PageTitle, Select, Table, Td } from '@/components/ui';
import { useAction, useWorkflowData } from '@/hooks/useWorkflowData';
import { runWorkflow } from '@/services/workflow.service';
import { cn } from '@/utils/helpers';

type FieldInfo = { name: string; kind: 'text' | 'bool' | 'choice'; options?: { value: string; label: string }[] };
type CatalogInfo = { key: string; label: string; scope: 'company' | 'hurgo'; fields: FieldInfo[] };
type Row = { id: number; name: string; is_active: boolean; read_only?: boolean; [field: string]: unknown };

const FIELD_LABELS: Record<string, string> = {
  symbol: 'Abreviatura',
  official_code: 'Código oficial',
  uses_stock: 'Se maneja con stock (compras en Odoo)',
  is_serialized: 'Se registra por número de serie (VIN)',
  stage: 'Etapa en que se pide',
  is_required: 'Obligatorio',
  applies_to: 'Aplica a',
  has_expiration: 'Tiene vencimiento',
};

const cell = (f: FieldInfo, value: unknown) => {
  if (f.kind === 'bool') return value ? 'Sí' : 'No';
  if (f.kind === 'choice') return f.options?.find((o) => o.value === value)?.label ?? String(value ?? '');
  return String(value ?? '');
};

export default function CatalogsPage() {
  const available = useWorkflowData<CatalogInfo[]>('catalogs.available');
  const [picked, setPicked] = useState<string | null>(null);
  const current = available.data?.find((c) => c.key === picked) ?? available.data?.[0];

  return (
    <>
      <PageTitle title="Catálogos" description="Cada empresa crea sus tipos, unidades, marcas y documentos. Hurgo mantiene los de logística y flota." />
      <Message error={available.error} />
      <div className="mb-4 flex flex-wrap gap-1">
        {available.data?.map((c) => (
          <button key={c.key} type="button" onClick={() => setPicked(c.key)}
            className={cn('rounded-lg px-3 py-1.5 text-sm font-medium',
              current?.key === c.key ? 'bg-brand-900 text-white' : 'bg-white text-brand-900 ring-1 ring-brand-200 hover:bg-brand-200/40')}>
            {c.label}
          </button>
        ))}
      </div>
      {current && <CatalogEditor key={current.key} catalog={current} />}
    </>
  );
}

function CatalogEditor({ catalog }: { catalog: CatalogInfo }) {
  const rows = useWorkflowData<Row[]>('catalogs.list', { catalog: catalog.key });
  const empty = (): Record<string, string | boolean> => Object.fromEntries([
    ['name', ''],
    ...catalog.fields.map((f) => [f.name, f.kind === 'bool' ? false : f.kind === 'choice' ? (f.options?.[0]?.value ?? '') : '']),
  ]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<number | null>(null);
  const action = useAction();
  const fieldNames = catalog.fields.map((f) => f.name);

  const save = async () => {
    const done = await action.run(
      () => runWorkflow('catalogs.save', { catalog: catalog.key, id: editing, ...form }),
      editing ? 'Guardado' : 'Creado',
    );
    if (done) {
      setForm(empty());
      setEditing(null);
      rows.reload();
    }
  };
  const edit = (row: Row) => {
    setEditing(row.id);
    setForm(Object.fromEntries([['name', row.name], ...fieldNames.map((f) => [f, row[f] as string | boolean])]));
  };
  const toggle = async (row: Row) => {
    if (await action.run(() => runWorkflow('catalogs.save', { catalog: catalog.key, id: row.id, name: row.name, is_active: !row.is_active }))) rows.reload();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <Card title={catalog.label}>
        <Message error={rows.error} />
        <Table head={['Nombre', ...fieldNames.map((f) => FIELD_LABELS[f] ?? f), '']}>
          {rows.data?.map((r) => (
            <tr key={r.id} className={r.is_active ? '' : 'opacity-50'}>
              <Td><b>{r.name}</b>{r.read_only && <> <Badge>de Hurgo</Badge></>}</Td>
              {catalog.fields.map((f) => <Td key={f.name}>{cell(f, r[f.name])}</Td>)}
              <Td>
                {!r.read_only ? (
                  <div className="flex gap-1">
                    <Button variant="outline" onClick={() => edit(r)}>Editar</Button>
                    <Button variant="outline" onClick={() => toggle(r)} disabled={action.busy}>{r.is_active ? 'Desactivar' : 'Activar'}</Button>
                  </div>
                ) : <span className="text-xs text-brand-700">lo define Hurgo</span>}
              </Td>
            </tr>
          ))}
        </Table>
      </Card>
      <Card title={editing ? 'Editar' : 'Nuevo'}>
        <div className="space-y-3">
          <Field label="Nombre">
            <Input value={String(form.name)} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          {catalog.fields.map((f) => f.kind === 'bool' ? (
            <label key={f.name} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={Boolean(form[f.name])} onChange={(e) => setForm({ ...form, [f.name]: e.target.checked })} />
              {FIELD_LABELS[f.name] ?? f.name}
            </label>
          ) : f.kind === 'choice' ? (
            <Field key={f.name} label={FIELD_LABELS[f.name] ?? f.name}>
              <Select value={String(form[f.name] ?? '')} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                options={f.options ?? []} placeholder="Selecciona…" />
            </Field>
          ) : (
            <Field key={f.name} label={FIELD_LABELS[f.name] ?? f.name}>
              <Input value={String(form[f.name] ?? '')} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
            </Field>
          ))}
          <Message error={action.error} success={action.success} />
          <div className="flex gap-2">
            <Button className="flex-1" onClick={save} disabled={!String(form.name).trim() || action.busy}>Guardar</Button>
            {editing && <Button variant="outline" onClick={() => { setEditing(null); setForm(empty()); }}>Cancelar</Button>}
          </div>
        </div>
      </Card>
    </div>
  );
}
