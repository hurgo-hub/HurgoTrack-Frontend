'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Badge, Button, Card, Field, Message, PageTitle, Select, Table, Td } from '@/components/ui';
import { useAuth } from '@/hooks/auth/useAuth';
import { hasPermission } from '@/hooks/auth/usePermissions';
import { useAction, useWorkflowData } from '@/hooks/useWorkflowData';
import { DocumentList, type DocRow } from '@/components/shared/DocumentList';
import { runWorkflow, runWorkflowForm } from '@/services/workflow.service';
import { ROUTES } from '@/utils/constants';

type Stop = {
  id: number; sequence: number; state: string; state_display: string; qty: string;
  address: { name: string; address: string; location: string };
  items: { order_line_trip_id: number; order_code: string; item: string; qty: string }[];
};
type Trip = {
  id: number; code: string; state: string; state_display: string; company: { name: string }; origin_address: string | null;
  vehicle: string | null; driver: { name: string } | null; lines: Stop[];
  events: { id: number; name: string; description: string; event_date: string }[];
};
type Resources = { vehicles: { id: number; name: string }[]; drivers: { id: number; name: string }[] };

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const trip = useWorkflowData<Trip>('trips.retrieve', { trip_id: Number(id) });
  const t = trip.data;
  const isDispatch = hasPermission(user, 'trips.assign_trip');
  const isDriver = hasPermission(user, 'trips.drive_trip');

  return (
    <>
      <Link href={ROUTES.TRIPS} className="text-sm text-brand-700 hover:underline">← Viajes</Link>
      <Message error={trip.error} />
      {t && (
        <>
          <PageTitle title={`Viaje ${t.code}`} description={`${t.company.name} · carga en ${t.origin_address ?? 'sin definir'}`} />
          <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              <Card title="Paradas" actions={<Badge>{t.state_display}</Badge>}>
                <p className="mb-3 text-sm">
                  <b>Vehículo:</b> {t.vehicle ?? 'sin asignar'} · <b>Conductor:</b> {t.driver?.name ?? 'sin asignar'}
                </p>
                <Table head={['#', 'Destino', 'Carga', 'Estado', '']}>
                  {t.lines.map((s) => (
                    <tr key={s.id}>
                      <Td>{s.sequence}</Td>
                      <Td>{s.address.name}<br /><span className="text-brand-700">{s.address.address} · {s.address.location}</span></Td>
                      <Td>{s.items.map((i) => <div key={i.order_line_trip_id}>{i.item} × {i.qty} <span className="text-brand-700">({i.order_code})</span></div>)}</Td>
                      <Td><Badge>{s.state_display}</Badge></Td>
                      <Td>{isDriver && ['in_route', 'delivering'].includes(s.state) && <Deliver tripId={t.id} stop={s} onDone={trip.reload} />}</Td>
                    </tr>
                  ))}
                </Table>
              </Card>
              <TripDocuments trip={t} canUpload={(isDispatch || isDriver) && !['closed', 'cancelled'].includes(t.state)} />
              <Card title="Historial">
                <ul className="space-y-1 text-sm">
                  {t.events.map((e) => (
                    <li key={e.id}>
                      <span className="text-brand-700">{new Date(e.event_date).toLocaleString('es-CO')}</span> · <b>{e.name}</b>
                      {e.description && ` · ${e.description}`}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
            <div className="space-y-4">
              {isDispatch && ['draft', 'assigned'].includes(t.state) && <Assign trip={t} onDone={trip.reload} />}
              {isDriver && t.state === 'assigned' && <Depart trip={t} onDone={trip.reload} />}
            </div>
          </div>
        </>
      )}
    </>
  );
}

function Assign({ trip, onDone }: { trip: Trip; onDone: () => void }) {
  const res = useWorkflowData<Resources>('trips.resources');
  const [vehicle, setVehicle] = useState('');
  const [driver, setDriver] = useState('');
  const action = useAction();

  const assign = async () => {
    if (await action.run(() => runWorkflow('trips.assign', { trip_id: trip.id, vehicle_id: Number(vehicle), driver_id: Number(driver) }), 'Asignado')) onDone();
  };
  const cancel = async () => {
    const reason = window.prompt('Motivo de la cancelación (el stock vuelve)');
    if (reason && (await action.run(() => runWorkflow('trips.cancel', { trip_id: trip.id, reason }), 'Viaje cancelado'))) onDone();
  };

  return (
    <Card title="Vehículo y conductor">
      <div className="space-y-3">
        <Field label="Vehículo">
          <Select value={vehicle} onChange={(e) => setVehicle(e.target.value)} options={(res.data?.vehicles ?? []).map((v) => ({ value: v.id, label: v.name }))} />
        </Field>
        <Field label="Conductor">
          <Select value={driver} onChange={(e) => setDriver(e.target.value)} options={(res.data?.drivers ?? []).map((d) => ({ value: d.id, label: d.name }))} />
        </Field>
        <Message error={action.error || res.error} success={action.success} />
        <div className="flex gap-2">
          <Button className="flex-1" onClick={assign} disabled={!vehicle || !driver || action.busy}>Asignar</Button>
          <Button variant="danger" onClick={cancel} disabled={action.busy}>Cancelar viaje</Button>
        </div>
      </div>
    </Card>
  );
}

function Depart({ trip, onDone }: { trip: Trip; onDone: () => void }) {
  const action = useAction();
  const depart = async () => {
    if (await action.run(() => runWorkflow('trips.depart', { trip_id: trip.id }))) onDone();
  };
  return (
    <Card title="Conductor">
      <Message error={action.error} />
      <Button className="w-full" onClick={depart} disabled={action.busy}>Salir a ruta</Button>
    </Card>
  );
}

/** Entrega con foto de la remisión firmada */
function Deliver({ tripId, stop, onDone }: { tripId: number; stop: Stop; onDone: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const action = useAction();
  const deliver = async () => {
    if (!file) return;
    const form = new FormData();
    form.append('trip_id', String(tripId));
    form.append('trip_line_id', String(stop.id));
    form.append('files', file);
    if (await action.run(() => runWorkflowForm('trips.deliver', form))) onDone();
  };
  return (
    <div className="space-y-1">
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="max-w-48 text-xs" />
      <Button onClick={deliver} disabled={!file || action.busy}>Entregar</Button>
      <Message error={action.error} />
    </div>
  );
}

type TripDocs = { loading: DocRow[]; delivery: { trip_line_id: number; sequence: number; documents: DocRow[] }[] };

/** Documentos de cargue (antes de salir) y de entrega por parada (antes de entregar) */
function TripDocuments({ trip, canUpload }: { trip: Trip; canUpload: boolean }) {
  const docs = useWorkflowData<TripDocs>('trips.documents', { trip_id: trip.id });

  const upload = (stopId?: number) => async (doc: DocRow, file: File) => {
    const form = new FormData();
    form.append('trip_id', String(trip.id));
    form.append('document_key', doc.key ?? '');
    if (stopId) form.append('trip_line_id', String(stopId));
    form.append('files', file);
    await runWorkflowForm('trips.attach', form);
    docs.reload();
  };

  const d = docs.data;
  const hasDelivery = d?.delivery.some((s) => s.documents.length);
  if (!docs.loading && !docs.error && !d?.loading.length && !hasDelivery) return null;
  return (
    <Card title="Documentos del viaje">
      <Message error={docs.error} />
      {d && (
        <div className="space-y-4">
          <div>
            <p className="mb-1 text-sm font-semibold">Cargue (antes de salir)</p>
            <DocumentList docs={d.loading} canUpload={canUpload} onUpload={upload()} />
          </div>
          {hasDelivery && d.delivery.map((s) => (
            <div key={s.trip_line_id}>
              <p className="mb-1 text-sm font-semibold">Entrega · parada {s.sequence}</p>
              <DocumentList docs={s.documents} canUpload={canUpload} onUpload={upload(s.trip_line_id)} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
