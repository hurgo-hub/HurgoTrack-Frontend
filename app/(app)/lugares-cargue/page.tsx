'use client';

import { useState } from 'react';
import { Badge, Button, Card, Field, Input, Message, PageTitle, Select, Table, Td } from '@/components/ui';
import { useAction, useWorkflowData } from '@/hooks/useWorkflowData';
import { runWorkflow } from '@/services/workflow.service';

type Point = { id: number; name: string; address: string; location: string; company: { name: string }; tags: { id: number; name: string }[] };
type Lookups = { companies: { id: number; name: string }[]; municipalities: { id: number; name: string }[] };
type Tag = { id: number; name: string };

const empty = { company_id: '', location_id: '', name: '', address: '', tag_ids: [] as number[] };

export default function LoadingPointsPage() {
  const points = useWorkflowData<Point[]>('locations.loading_points');
  const lookups = useWorkflowData<Lookups>('locations.lookups');
  const tags = useWorkflowData<Tag[]>('locations.loading_tags');
  const [form, setForm] = useState(empty);
  const [newTag, setNewTag] = useState('');
  const action = useAction();

  const toggleTag = (id: number) =>
    setForm((f) => ({ ...f, tag_ids: f.tag_ids.includes(id) ? f.tag_ids.filter((t) => t !== id) : [...f.tag_ids, id] }));

  const save = async () => {
    const done = await action.run(
      () => runWorkflow('locations.loading_point.save', { ...form, company_id: Number(form.company_id), location_id: Number(form.location_id) }),
      'Lugar de cargue guardado',
    );
    if (done) { setForm(empty); points.reload(); }
  };

  const createTag = async () => {
    const done = await action.run(() => runWorkflow('locations.loading_tag.create', { name: newTag }), 'Etiqueta creada');
    if (done) { setNewTag(''); tags.reload(); }
  };

  return (
    <>
      <PageTitle title="Lugares de cargue" description="Plantas, bodegas o proveedores donde Hurgo carga. Las etiquetas dicen qué se carga en cada uno." />
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <Card title="Registrados">
          <Message error={points.error} />
          <Table head={['Nombre', 'Empresa', 'Dirección', 'Etiquetas']}>
            {points.data?.map((p) => (
              <tr key={p.id}>
                <Td><b>{p.name}</b></Td>
                <Td>{p.company.name}</Td>
                <Td>{p.address} · {p.location}</Td>
                <Td><div className="flex flex-wrap gap-1">{p.tags.map((t) => <Badge key={t.id}>{t.name}</Badge>)}</div></Td>
              </tr>
            ))}
          </Table>
        </Card>
        <Card title="Nuevo lugar de cargue">
          <div className="space-y-3">
            <Field label="Empresa dueña del sitio">
              <Select value={form.company_id} onChange={(e) => setForm({ ...form, company_id: e.target.value })}
                options={(lookups.data?.companies ?? []).map((c) => ({ value: c.id, label: c.name }))} />
            </Field>
            <Field label="Municipio">
              <Select value={form.location_id} onChange={(e) => setForm({ ...form, location_id: e.target.value })}
                options={(lookups.data?.municipalities ?? []).map((m) => ({ value: m.id, label: m.name }))} />
            </Field>
            <Field label="Nombre">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Planta Argos" />
            </Field>
            <Field label="Dirección">
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </Field>
            <div className="text-sm">
              <span className="mb-1 block font-medium">Qué se carga</span>
              <div className="flex flex-wrap gap-2">
                {tags.data?.map((t) => (
                  <label key={t.id} className="flex items-center gap-1">
                    <input type="checkbox" checked={form.tag_ids.includes(t.id)} onChange={() => toggleTag(t.id)} />
                    {t.name}
                  </label>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <Input placeholder="Nueva etiqueta" value={newTag} onChange={(e) => setNewTag(e.target.value)} />
                <Button variant="outline" onClick={createTag} disabled={!newTag.trim() || action.busy}>Crear</Button>
              </div>
            </div>
            <Message error={action.error || lookups.error} success={action.success} />
            <Button className="w-full" onClick={save}
              disabled={!form.company_id || !form.location_id || !form.name || !form.address || action.busy}>
              Guardar
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
