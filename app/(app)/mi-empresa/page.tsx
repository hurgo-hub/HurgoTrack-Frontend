'use client';

import { useState } from 'react';
import { Badge, Button, Card, Field, Input, Message, PageTitle, Select, Table, Td } from '@/components/ui';
import { useAction, useWorkflowData } from '@/hooks/useWorkflowData';
import { runWorkflow } from '@/services/workflow.service';

type Mine = {
  companies: { id: number; name: string }[];
  type_items: { id: number; name: string; uses_stock: boolean }[];
  roles: { value: string; label: string }[];
};
type CompanyUser = { id: number; username: string; first_name: string; last_name: string; email: string; is_active: boolean; role: string | null; role_label: string | null };
type Address = { id: number; name: string; address: string; location: string; is_active: boolean };
type Tag = { id: number; name: string };
type Item = {
  id: number; name: string; type_item_id: number; type_item: string; unit_id: number | null; unit: string; unit_name: string | null;
  brand_id: number | null; brand: string | null; weight_kg: string | null; sku: string; odoo_ref: string; is_active: boolean; loading_tags: Tag[];
};
type CatalogRow = { id: number; name: string; symbol?: string; is_active: boolean };

export default function MyCompanyPage() {
  const mine = useWorkflowData<Mine>('companies.mine');
  const [picked, setPicked] = useState('');
  const companyId = Number(picked || mine.data?.companies[0]?.id || 0);

  return (
    <>
      <PageTitle title="Mi empresa" description="Usuarios, direcciones y productos de tu empresa." />
      <Message error={mine.error} />
      {mine.data && mine.data.companies.length > 1 && (
        <div className="mb-4 max-w-xs">
          <Select value={String(companyId)} onChange={(e) => setPicked(e.target.value)} placeholder="Empresa"
            options={mine.data.companies.map((c) => ({ value: c.id, label: c.name }))} />
        </div>
      )}
      {mine.data && !companyId && <p className="text-sm text-brand-700">Tu usuario no está vinculado a ninguna empresa.</p>}
      {mine.data && companyId > 0 && (
        <div className="space-y-4">
          <Users key={`u${companyId}`} companyId={companyId} roles={mine.data.roles} />
          <Addresses key={`a${companyId}`} companyId={companyId} />
          <Products key={`p${companyId}`} companyId={companyId} types={mine.data.type_items} />
        </div>
      )}
    </>
  );
}

function Users({ companyId, roles }: { companyId: number; roles: Mine['roles'] }) {
  const users = useWorkflowData<CompanyUser[]>('companies.users', { company_id: companyId });
  const empty = { username: '', first_name: '', last_name: '', email: '', password: '', role: 'comercial' };
  const [form, setForm] = useState(empty);
  const action = useAction();

  const create = async () => {
    if (await action.run(() => runWorkflow('companies.user.save', { company_id: companyId, ...form }), 'Usuario creado')) {
      setForm(empty);
      users.reload();
    }
  };
  const update = async (u: CompanyUser, patch: Partial<CompanyUser>) => {
    const data = { company_id: companyId, user_id: u.id, role: patch.role ?? u.role, is_active: patch.is_active ?? u.is_active };
    if (await action.run(() => runWorkflow('companies.user.save', data))) users.reload();
  };

  return (
    <Card title="Usuarios">
      <Table head={['Usuario', 'Nombre', 'Rol', 'Estado', '']}>
        {users.data?.map((u) => (
          <tr key={u.id} className={u.is_active ? '' : 'opacity-50'}>
            <Td><b>{u.username}</b><br /><span className="text-brand-700">{u.email}</span></Td>
            <Td>{`${u.first_name} ${u.last_name}`.trim() || '—'}</Td>
            <Td>
              <Select value={u.role ?? ''} onChange={(e) => update(u, { role: e.target.value })} disabled={action.busy}
                options={roles.map((r) => ({ value: r.value, label: r.label }))} />
            </Td>
            <Td><Badge>{u.is_active ? 'Activo' : 'Inactivo'}</Badge></Td>
            <Td>
              <Button variant="outline" onClick={() => update(u, { is_active: !u.is_active })} disabled={action.busy}>
                {u.is_active ? 'Desactivar' : 'Activar'}
              </Button>
            </Td>
          </tr>
        ))}
      </Table>
      <div className="mt-4 grid gap-2 border-t border-brand-200 pt-4 sm:grid-cols-3 lg:grid-cols-6">
        <Field label="Usuario"><Input autoComplete="off" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></Field>
        <Field label="Nombre"><Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></Field>
        <Field label="Apellido"><Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></Field>
        <Field label="Correo"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Contraseña"><Input type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
        <Field label="Rol">
          <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} options={roles.map((r) => ({ value: r.value, label: r.label }))} />
        </Field>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button onClick={create} disabled={!form.username || !form.password || !form.role || action.busy}>Crear usuario</Button>
        <Message error={action.error || users.error} success={action.success} />
      </div>
    </Card>
  );
}

function Addresses({ companyId }: { companyId: number }) {
  const addresses = useWorkflowData<Address[]>('locations.addresses', { company_id: companyId });
  const lookups = useWorkflowData<{ municipalities: { id: number; name: string }[] }>('locations.lookups');
  const empty = { location_id: '', name: '', address: '', contact_name: '', contact_phone: '' };
  const [form, setForm] = useState(empty);
  const action = useAction();

  const create = async () => {
    const data = { company_id: companyId, ...form, location_id: Number(form.location_id) };
    if (await action.run(() => runWorkflow('locations.address.save', data), 'Dirección guardada')) {
      setForm(empty);
      addresses.reload();
    }
  };

  return (
    <Card title="Direcciones (entrega y bodegas)">
      <Table head={['Nombre', 'Dirección', 'Municipio']}>
        {addresses.data?.map((a) => (
          <tr key={a.id} className={a.is_active ? '' : 'opacity-50'}>
            <Td><b>{a.name}</b></Td><Td>{a.address}</Td><Td>{a.location}</Td>
          </tr>
        ))}
      </Table>
      <div className="mt-4 grid gap-2 border-t border-brand-200 pt-4 sm:grid-cols-3 lg:grid-cols-5">
        <Field label="Nombre"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Bodega principal" /></Field>
        <Field label="Dirección"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
        <Field label="Municipio">
          <Select value={form.location_id} onChange={(e) => setForm({ ...form, location_id: e.target.value })}
            options={(lookups.data?.municipalities ?? []).map((m) => ({ value: m.id, label: m.name }))} />
        </Field>
        <Field label="Contacto"><Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} /></Field>
        <Field label="Teléfono"><Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} /></Field>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button onClick={create} disabled={!form.name || !form.address || !form.location_id || action.busy}>Agregar dirección</Button>
        <Message error={action.error || addresses.error || lookups.error} success={action.success} />
      </div>
    </Card>
  );
}

function Products({ companyId, types }: { companyId: number; types: Mine['type_items'] }) {
  const items = useWorkflowData<Item[]>('orders.company_items', { company_id: companyId });
  // Unidades y marcas: las de la empresa y las comunes (se crean en "Tipos, unidades y marcas")
  const units = useWorkflowData<CatalogRow[]>('catalogs.list', { catalog: 'unit', company_id: companyId });
  const brands = useWorkflowData<CatalogRow[]>('catalogs.list', { catalog: 'brand', company_id: companyId });
  // Etiquetas de cargue de Hurgo (solo el nombre): con ellas Hurgo sugiere dónde cargar el producto
  const tags = useWorkflowData<Tag[]>('locations.loading_tags');
  const empty = {
    item_id: null as number | null, type_item_id: '', name: '', unit_id: '', brand_id: '', weight_kg: '', sku: '',
    odoo_ref: '', loading_tag_ids: [] as number[],
  };
  const [form, setForm] = useState(empty);
  const action = useAction();

  const toggleTag = (id: number) => setForm((f) => ({
    ...f, loading_tag_ids: f.loading_tag_ids.includes(id) ? f.loading_tag_ids.filter((t) => t !== id) : [...f.loading_tag_ids, id],
  }));

  const edit = (i: Item) => setForm({
    item_id: i.id, type_item_id: String(i.type_item_id), name: i.name, unit_id: i.unit_id ? String(i.unit_id) : '',
    brand_id: i.brand_id ? String(i.brand_id) : '', weight_kg: i.weight_kg ?? '', sku: i.sku, odoo_ref: i.odoo_ref,
    loading_tag_ids: i.loading_tags.map((t) => t.id),
  });

  const save = async () => {
    const data = {
      company_id: companyId, ...form, type_item_id: Number(form.type_item_id), weight_kg: form.weight_kg || null,
      unit_id: form.unit_id ? Number(form.unit_id) : null, brand_id: form.brand_id ? Number(form.brand_id) : null,
    };
    if (await action.run(() => runWorkflow('orders.item.save', data), 'Producto guardado')) {
      setForm(empty);
      items.reload();
    }
  };

  return (
    <Card title="Productos">
      <Table head={['Producto', 'Tipo', 'Marca', 'Unidad', 'Peso (kg)', 'Ref.', 'Ref. Odoo', 'Etiquetas de cargue', '']}>
        {items.data?.map((i) => (
          <tr key={i.id} className={i.is_active ? '' : 'opacity-50'}>
            <Td><b>{i.name}</b></Td><Td>{i.type_item}</Td><Td>{i.brand ?? '—'}</Td><Td>{i.unit_name ?? i.unit}</Td><Td>{i.weight_kg ?? '—'}</Td>
            <Td>{i.sku || '—'}</Td><Td>{i.odoo_ref || '—'}</Td>
            <Td>{i.loading_tags.map((t) => t.name).join(', ') || '—'}</Td>
            <Td><Button variant="outline" onClick={() => edit(i)}>Editar</Button></Td>
          </tr>
        ))}
      </Table>
      <div className="mt-4 grid gap-2 border-t border-brand-200 pt-4 sm:grid-cols-3 lg:grid-cols-4">
        <Field label="Nombre"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Tipo">
          <Select value={form.type_item_id} onChange={(e) => setForm({ ...form, type_item_id: e.target.value })}
            options={types.map((t) => ({ value: t.id, label: t.uses_stock ? `${t.name} (con stock)` : t.name }))} />
        </Field>
        <Field label="Unidad">
          <Select value={form.unit_id} onChange={(e) => setForm({ ...form, unit_id: e.target.value })} placeholder="Unidad (und)"
            options={(units.data ?? []).filter((u) => u.is_active).map((u) => ({ value: u.id, label: `${u.name} (${u.symbol})` }))} />
        </Field>
        <Field label="Marca">
          <Select value={form.brand_id} onChange={(e) => setForm({ ...form, brand_id: e.target.value })} placeholder="Sin marca"
            options={(brands.data ?? []).filter((b) => b.is_active).map((b) => ({ value: b.id, label: b.name }))} />
        </Field>
        <Field label="Peso por unidad (kg)"><Input type="number" min="0" step="any" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} /></Field>
        <Field label="Referencia"><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></Field>
        <Field label="Ref. Odoo"><Input value={form.odoo_ref} onChange={(e) => setForm({ ...form, odoo_ref: e.target.value })} /></Field>
      </div>
      {!!tags.data?.length && (
        <div className="mt-3 text-sm">
          <span className="mb-1 block font-medium">Etiquetas de cargue <span className="font-normal text-brand-700">(Hurgo las usa para sugerir dónde cargar)</span></span>
          <div className="flex flex-wrap gap-3">
            {tags.data.map((t) => (
              <label key={t.id} className="flex items-center gap-1">
                <input type="checkbox" checked={form.loading_tag_ids.includes(t.id)} onChange={() => toggleTag(t.id)} />
                {t.name}
              </label>
            ))}
          </div>
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button onClick={save} disabled={!form.name || !form.type_item_id || action.busy}>
          {form.item_id ? 'Guardar cambios' : 'Agregar producto'}
        </Button>
        {form.item_id && <Button variant="outline" onClick={() => setForm(empty)}>Cancelar</Button>}
        <Message error={action.error || items.error || tags.error} success={action.success} />
      </div>
    </Card>
  );
}
