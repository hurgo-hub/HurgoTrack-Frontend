'use client';

import { useState } from 'react';
import { Badge, Button, Card, Field, Input, Message, PageTitle, Table, Td } from '@/components/ui';
import { useAction, useWorkflowData } from '@/hooks/useWorkflowData';
import { runWorkflow } from '@/services/workflow.service';

type Company = {
  id: number; name: string; document_number: string; verification_digit: string; email: string;
  is_client: boolean; is_freelance: boolean; is_active: boolean; admins: string[];
};

const emptyCompany = { name: '', document_number: '', verification_digit: '', email: '', phone: '' };
const emptyAdmin = { username: '', first_name: '', last_name: '', email: '', password: '' };

const roles = (c: Company) => [c.is_client && 'Cliente', c.is_freelance && 'Freelance'].filter(Boolean).join(' · ');

export default function CompaniesPage() {
  const companies = useWorkflowData<Company[]>('companies.list');
  const [company, setCompany] = useState(emptyCompany);
  const [withAdmin, setWithAdmin] = useState(true);
  const [admin, setAdmin] = useState(emptyAdmin);
  const action = useAction();

  const create = async () => {
    const done = await action.run(
      () => runWorkflow('companies.create', { company, admin: withAdmin ? admin : null }),
      withAdmin ? `Empresa creada. Entrega al administrador su usuario "${admin.username}" y la contraseña.` : 'Empresa creada',
    );
    if (done) {
      setCompany(emptyCompany);
      setAdmin(emptyAdmin);
      companies.reload();
    }
  };

  const toggle = async (c: Company) => {
    if (await action.run(() => runWorkflow('companies.update', { company_id: c.id, is_active: !c.is_active }))) companies.reload();
  };

  const ready = company.name && company.document_number && (!withAdmin || (admin.username && admin.password));

  return (
    <>
      <PageTitle title="Empresas" description="Alta de empresas cliente (piden y guardan sus direcciones de entrega), con su usuario administrador." />
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <Card title="Registradas">
          <Message error={companies.error} />
          <Table head={['Empresa', 'NIT', 'Tipo', 'Administradores', '']}>
            {companies.data?.map((c) => (
              <tr key={c.id} className={c.is_active ? '' : 'opacity-50'}>
                <Td><b>{c.name}</b></Td>
                <Td>{c.document_number}{c.verification_digit && `-${c.verification_digit}`}</Td>
                <Td>{roles(c) || '—'}</Td>
                <Td>{c.admins.map((a) => <Badge key={a}>{a}</Badge>)}</Td>
                <Td>
                  <Button variant="outline" onClick={() => toggle(c)} disabled={action.busy}>
                    {c.is_active ? 'Desactivar' : 'Activar'}
                  </Button>
                </Td>
              </tr>
            ))}
          </Table>
        </Card>
        <Card title="Nueva empresa">
          <div className="space-y-3">
            <Field label="Nombre"><Input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} /></Field>
            <div className="grid grid-cols-[1fr_70px] gap-2">
              <Field label="NIT (sin dígito)"><Input inputMode="numeric" value={company.document_number} onChange={(e) => setCompany({ ...company, document_number: e.target.value })} /></Field>
              <Field label="DV"><Input maxLength={1} value={company.verification_digit} onChange={(e) => setCompany({ ...company, verification_digit: e.target.value })} /></Field>
            </div>
            <Field label="Correo"><Input type="email" value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} /></Field>
            <Field label="Teléfono"><Input value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} /></Field>

            <label className="flex items-center gap-2 border-t border-brand-200 pt-3 text-sm font-medium">
              <input type="checkbox" checked={withAdmin} onChange={(e) => setWithAdmin(e.target.checked)} />
              Crear usuario administrador de la empresa
            </label>
            {withAdmin && (
              <div className="space-y-3">
                <Field label="Usuario"><Input autoComplete="off" value={admin.username} onChange={(e) => setAdmin({ ...admin, username: e.target.value })} /></Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Nombre"><Input value={admin.first_name} onChange={(e) => setAdmin({ ...admin, first_name: e.target.value })} /></Field>
                  <Field label="Apellido"><Input value={admin.last_name} onChange={(e) => setAdmin({ ...admin, last_name: e.target.value })} /></Field>
                </div>
                <Field label="Correo"><Input type="email" value={admin.email} onChange={(e) => setAdmin({ ...admin, email: e.target.value })} /></Field>
                <Field label="Contraseña inicial"><Input type="password" autoComplete="new-password" value={admin.password} onChange={(e) => setAdmin({ ...admin, password: e.target.value })} /></Field>
                <p className="text-xs text-brand-700">Gestiona solo su empresa: usuarios, direcciones, productos, pedidos, compras y stock.</p>
              </div>
            )}
            <Message error={action.error} success={action.success} />
            <Button className="w-full" onClick={create} disabled={!ready || action.busy}>Crear empresa</Button>
          </div>
        </Card>
      </div>
    </>
  );
}
