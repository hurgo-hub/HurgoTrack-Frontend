'use client';

import { useState } from 'react';
import { Badge, Button, Card, Field, Input, Message, Select, Table, Td } from '@/components/ui';
import { useAction, useWorkflowData } from '@/hooks/useWorkflowData';
import { runWorkflow, runWorkflowForm } from '@/services/workflow.service';
import { FleetDocuments } from './FleetDocuments';
import { DOCUMENT_TYPES, FUEL_TYPES, LICENSE_CATEGORIES, TRANSMISSIONS, expiry } from './options';

type Expiring = { id: number; date_expire: string; valid: boolean; file_name: string | null };
type Soat = Expiring & { insurer_name: string; policy_number: string; date_start: string | null };
type Rtm = Expiring & { certificate_number: string; cda_name: string; date_expedition: string };
type Vehicle = {
  id: number; plate: string; type_vehicle_id: number; type_vehicle: string; brand_vehicle_id: number; brand_vehicle: string;
  owner_id: number; owner: string; bodywork_id: number | null; transit_id: number | null; model_year: number | null;
  color: string; load_capacity_kg: string | null; empty_weight_kg: string | null; motorcycle_capacity: number | null;
  vin: string; fuel_type: string; license_category: string; transmission: string; is_available: boolean; is_active: boolean;
  soat: Soat | null; rtm: Rtm | null; rtm_required: boolean;
};
type Option = { id: number; name: string };
type Lookups = { type_vehicles: Option[]; brand_vehicles: Option[]; bodyworks: Option[]; transits: Option[]; partners: (Option & { document_number: string })[] };

const toOptions = (rows?: Option[]) => (rows ?? []).map((r) => ({ value: r.id, label: r.name }));

function Status({ ok, text }: { ok: boolean; text: string }) {
  return <span className={ok ? 'text-green-700' : 'text-red-700'}>{text}</span>;
}

/** Vehículos de la flota de Hurgo: datos, SOAT, revisión técnico-mecánica y documentos */
export function VehiclesPanel({ canManage }: { canManage: boolean }) {
  const vehicles = useWorkflowData<Vehicle[]>('fleet.vehicles');
  const lookups = useWorkflowData<Lookups>('fleet.lookups');
  const [selected, setSelected] = useState<number | 'new' | null>(null);
  const current = typeof selected === 'number' ? vehicles.data?.find((v) => v.id === selected) : undefined;

  const saved = (v: Vehicle) => {
    vehicles.reload();
    setSelected(v.id);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
      <Card title="Vehículos" actions={canManage && <Button onClick={() => setSelected('new')}>Nuevo vehículo</Button>}>
        <Message error={vehicles.error || lookups.error} />
        <Table head={['Placa', 'Tipo', 'Propietario', 'Capacidad', 'SOAT', 'Tecnomecánica', 'Estado', '']} empty="Aún no hay vehículos">
          {vehicles.data?.map((v) => {
            const soat = expiry(v.soat);
            const rtm = expiry(v.rtm, v.rtm_required);
            return (
              <tr key={v.id} className={v.is_active ? '' : 'opacity-50'}>
                <Td><b>{v.plate}</b><br /><span className="text-brand-700">{v.brand_vehicle} {v.model_year ?? ''}</span></Td>
                <Td>{v.type_vehicle}</Td>
                <Td>{v.owner}</Td>
                <Td>{v.load_capacity_kg ? `${v.load_capacity_kg} kg` : '—'}{v.motorcycle_capacity ? ` · ${v.motorcycle_capacity} motos` : ''}</Td>
                <Td><Status {...soat} /></Td>
                <Td><Status {...rtm} /></Td>
                <Td><Badge>{!v.is_active ? 'Inactivo' : v.is_available ? 'Disponible' : 'No disponible'}</Badge></Td>
                <Td><Button variant="outline" onClick={() => setSelected(v.id)}>Abrir</Button></Td>
              </tr>
            );
          })}
        </Table>
      </Card>
      <div className="space-y-4">
        {selected === 'new' && lookups.data && (
          <VehicleForm key="new" lookups={lookups.data} reloadLookups={lookups.reload} canManage={canManage} onSaved={saved} />
        )}
        {current && lookups.data && (
          <>
            <VehicleForm key={current.id} vehicle={current} lookups={lookups.data} reloadLookups={lookups.reload}
              canManage={canManage} onSaved={saved} />
            <SoatCard key={`s${current.id}`} vehicle={current} canManage={canManage} onDone={vehicles.reload} />
            <RtmCard key={`r${current.id}`} vehicle={current} canManage={canManage} onDone={vehicles.reload} />
            <Card title="Otros documentos">
              <FleetDocuments owner={{ vehicle_id: current.id }} canUpload={canManage} />
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function VehicleForm({ vehicle, lookups, reloadLookups, canManage, onSaved }: {
  vehicle?: Vehicle; lookups: Lookups; reloadLookups: () => void; canManage: boolean; onSaved: (v: Vehicle) => void;
}) {
  const s = (v: string | number | null | undefined) => (v === null || v === undefined ? '' : String(v));
  const [form, setForm] = useState({
    plate: s(vehicle?.plate), type_vehicle_id: s(vehicle?.type_vehicle_id), brand_vehicle_id: s(vehicle?.brand_vehicle_id),
    owner_id: s(vehicle?.owner_id), bodywork_id: s(vehicle?.bodywork_id), transit_id: s(vehicle?.transit_id),
    model_year: s(vehicle?.model_year), color: s(vehicle?.color), load_capacity_kg: s(vehicle?.load_capacity_kg),
    empty_weight_kg: s(vehicle?.empty_weight_kg), motorcycle_capacity: s(vehicle?.motorcycle_capacity), vin: s(vehicle?.vin),
    fuel_type: s(vehicle?.fuel_type), license_category: s(vehicle?.license_category), transmission: s(vehicle?.transmission),
    is_available: vehicle?.is_available ?? true, is_active: vehicle?.is_active ?? true,
  });
  const [newOwner, setNewOwner] = useState(false);
  const action = useAction();
  const set = (field: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [field]: e.target.value });

  const save = async () => {
    const data = {
      ...form, vehicle_id: vehicle?.id ?? null, type_vehicle_id: Number(form.type_vehicle_id),
      brand_vehicle_id: Number(form.brand_vehicle_id), owner_id: Number(form.owner_id),
    };
    const result = await action.run(() => runWorkflow<Vehicle>('fleet.vehicle.save', data), 'Vehículo guardado');
    if (result) onSaved(result);
  };

  return (
    <Card title={vehicle ? `Vehículo ${vehicle.plate}` : 'Nuevo vehículo'}>
      <fieldset disabled={!canManage} className="grid gap-2 sm:grid-cols-2">
        <Field label="Placa"><Input value={form.plate} onChange={set('plate')} placeholder="ABC123" /></Field>
        <Field label="Tipo"><Select value={form.type_vehicle_id} onChange={set('type_vehicle_id')} options={toOptions(lookups.type_vehicles)} /></Field>
        <Field label="Marca"><Select value={form.brand_vehicle_id} onChange={set('brand_vehicle_id')} options={toOptions(lookups.brand_vehicles)} /></Field>
        <Field label="Modelo (año)"><Input type="number" value={form.model_year} onChange={set('model_year')} /></Field>
        <Field label="Propietario" className="sm:col-span-2">
          <div className="flex gap-2">
            <Select value={form.owner_id} onChange={set('owner_id')}
              options={lookups.partners.map((p) => ({ value: p.id, label: `${p.name} · ${p.document_number}` }))} />
            {canManage && <Button variant="outline" onClick={() => setNewOwner(!newOwner)}>Nuevo</Button>}
          </div>
        </Field>
        {newOwner && (
          <div className="sm:col-span-2">
            <PartnerForm onCreated={(id) => { reloadLookups(); setForm((f) => ({ ...f, owner_id: String(id) })); setNewOwner(false); }} />
          </div>
        )}
        <Field label="Licencia que exige"><Select value={form.license_category} onChange={set('license_category')} options={LICENSE_CATEGORIES} placeholder="Sin definir" /></Field>
        <Field label="Capacidad de carga (kg)"><Input type="number" min="0" step="any" value={form.load_capacity_kg} onChange={set('load_capacity_kg')} /></Field>
        <Field label="Cuántas motos carga"><Input type="number" min="0" value={form.motorcycle_capacity} onChange={set('motorcycle_capacity')} /></Field>
        <Field label="Peso vacío (kg)"><Input type="number" min="0" step="any" value={form.empty_weight_kg} onChange={set('empty_weight_kg')} /></Field>
        <Field label="Carrocería"><Select value={form.bodywork_id} onChange={set('bodywork_id')} options={toOptions(lookups.bodyworks)} placeholder="Sin definir" /></Field>
        <Field label="Organismo de tránsito"><Select value={form.transit_id} onChange={set('transit_id')} options={toOptions(lookups.transits)} placeholder="Sin definir" /></Field>
        <Field label="Combustible"><Select value={form.fuel_type} onChange={set('fuel_type')} options={FUEL_TYPES} placeholder="Sin definir" /></Field>
        <Field label="Transmisión"><Select value={form.transmission} onChange={set('transmission')} options={TRANSMISSIONS} placeholder="Sin definir" /></Field>
        <Field label="Color"><Input value={form.color} onChange={set('color')} /></Field>
        <Field label="VIN / chasis"><Input value={form.vin} onChange={set('vin')} /></Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} />
          Disponible para viajes
        </label>
        {vehicle && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Activo
          </label>
        )}
      </fieldset>
      {canManage && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button onClick={save} disabled={!form.plate || !form.type_vehicle_id || !form.brand_vehicle_id || !form.owner_id || action.busy}>
            {vehicle ? 'Guardar cambios' : 'Registrar vehículo'}
          </Button>
          <Message error={action.error} success={action.success} />
        </div>
      )}
    </Card>
  );
}

/** Propietario (tercero) nuevo, desde el formulario del vehículo */
function PartnerForm({ onCreated }: { onCreated: (id: number) => void }) {
  const [form, setForm] = useState({ name: '', document_type: 'CC', document_number: '', phone: '', is_company: false });
  const action = useAction();

  const create = async () => {
    const result = await action.run(() => runWorkflow<{ id: number }>('fleet.partner.save', form), 'Propietario creado');
    if (result) onCreated(result.id);
  };

  return (
    <div className="grid gap-2 rounded-lg border border-brand-200 p-3 sm:grid-cols-2">
      <Field label="Nombre o razón social"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <Field label="Tipo de documento">
        <Select value={form.document_type} onChange={(e) => setForm({ ...form, document_type: e.target.value, is_company: e.target.value === 'NIT' })} options={DOCUMENT_TYPES} />
      </Field>
      <Field label="Número de documento"><Input value={form.document_number} onChange={(e) => setForm({ ...form, document_number: e.target.value })} /></Field>
      <Field label="Teléfono"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
      <div className="flex items-center gap-3 sm:col-span-2">
        <Button onClick={create} disabled={!form.name || !form.document_number || action.busy}>Crear propietario</Button>
        <Message error={action.error} />
      </div>
    </div>
  );
}

/** SOAT vigente y registro de la renovación (con la póliza opcional) */
function SoatCard({ vehicle, canManage, onDone }: { vehicle: Vehicle; canManage: boolean; onDone: () => void }) {
  const [form, setForm] = useState({ insurer_name: '', policy_number: '', date_start: '', date_expire: '' });
  const [file, setFile] = useState<File | null>(null);
  const action = useAction();
  const soat = vehicle.soat;

  const save = async () => {
    const data = new FormData();
    data.append('vehicle_id', String(vehicle.id));
    Object.entries(form).forEach(([k, v]) => v && data.append(k, v));
    if (file) data.append('files', file);
    if (await action.run(() => runWorkflowForm('fleet.soat.save', data), 'SOAT registrado')) {
      setForm({ insurer_name: '', policy_number: '', date_start: '', date_expire: '' });
      setFile(null);
      onDone();
    }
  };

  return (
    <Card title="SOAT">
      <p className="mb-2 text-sm">
        {soat ? <>{soat.insurer_name} · póliza {soat.policy_number} · <Status {...expiry(soat)} />{soat.file_name && ` · ${soat.file_name}`}</>
          : <span className="text-red-700">Sin SOAT: no se le pueden asignar viajes.</span>}
      </p>
      {canManage && (
        <div className="grid gap-2 sm:grid-cols-2">
          <Field label="Aseguradora"><Input value={form.insurer_name} onChange={(e) => setForm({ ...form, insurer_name: e.target.value })} /></Field>
          <Field label="Número de póliza"><Input value={form.policy_number} onChange={(e) => setForm({ ...form, policy_number: e.target.value })} /></Field>
          <Field label="Desde"><Input type="date" value={form.date_start} onChange={(e) => setForm({ ...form, date_start: e.target.value })} /></Field>
          <Field label="Vence"><Input type="date" value={form.date_expire} onChange={(e) => setForm({ ...form, date_expire: e.target.value })} /></Field>
          <input type="file" accept="image/*,application/pdf" className="text-xs sm:col-span-2" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <div className="flex items-center gap-3 sm:col-span-2">
            <Button onClick={save} disabled={!form.insurer_name || !form.policy_number || !form.date_expire || action.busy}>
              {soat ? 'Registrar renovación' : 'Registrar SOAT'}
            </Button>
            <Message error={action.error} success={action.success} />
          </div>
        </div>
      )}
    </Card>
  );
}

/** Revisión técnico-mecánica vigente y registro de la nueva (los vehículos nuevos no la necesitan) */
function RtmCard({ vehicle, canManage, onDone }: { vehicle: Vehicle; canManage: boolean; onDone: () => void }) {
  const [form, setForm] = useState({ certificate_number: '', cda_name: '', date_expedition: '', date_expire: '' });
  const [file, setFile] = useState<File | null>(null);
  const action = useAction();
  const rtm = vehicle.rtm;

  const save = async () => {
    const data = new FormData();
    data.append('vehicle_id', String(vehicle.id));
    Object.entries(form).forEach(([k, v]) => v && data.append(k, v));
    if (file) data.append('files', file);
    if (await action.run(() => runWorkflowForm('fleet.rtm.save', data), 'Revisión registrada')) {
      setForm({ certificate_number: '', cda_name: '', date_expedition: '', date_expire: '' });
      setFile(null);
      onDone();
    }
  };

  return (
    <Card title="Revisión técnico-mecánica">
      <p className="mb-2 text-sm">
        {rtm ? <>{rtm.cda_name} · certificado {rtm.certificate_number} · <Status {...expiry(rtm)} />{rtm.file_name && ` · ${rtm.file_name}`}</>
          : <Status {...expiry(null, vehicle.rtm_required)} />}
      </p>
      {canManage && (
        <div className="grid gap-2 sm:grid-cols-2">
          <Field label="Centro de diagnóstico (CDA)"><Input value={form.cda_name} onChange={(e) => setForm({ ...form, cda_name: e.target.value })} /></Field>
          <Field label="Número de certificado"><Input value={form.certificate_number} onChange={(e) => setForm({ ...form, certificate_number: e.target.value })} /></Field>
          <Field label="Expedición"><Input type="date" value={form.date_expedition} onChange={(e) => setForm({ ...form, date_expedition: e.target.value })} /></Field>
          <Field label="Vence"><Input type="date" value={form.date_expire} onChange={(e) => setForm({ ...form, date_expire: e.target.value })} /></Field>
          <input type="file" accept="image/*,application/pdf" className="text-xs sm:col-span-2" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <div className="flex items-center gap-3 sm:col-span-2">
            <Button onClick={save} disabled={!form.cda_name || !form.certificate_number || !form.date_expedition || !form.date_expire || action.busy}>
              {rtm ? 'Registrar renovación' : 'Registrar revisión'}
            </Button>
            <Message error={action.error} success={action.success} />
          </div>
        </div>
      )}
    </Card>
  );
}
