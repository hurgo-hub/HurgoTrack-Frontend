'use client';

import { useState } from 'react';
import { Badge, Button, Input, Message } from '@/components/ui';
import { useAction } from '@/hooks/useWorkflowData';

export type DocFile = { id: number; name: string; date_expire?: string | null; valid?: boolean };
/** ``key`` identifica el documento del pedido o viaje ("hurgo:<id>" o "company:<id>"); la flota usa ``id``. */
export type DocRow = { id: number; key?: string; name: string; is_required: boolean; has_expiration?: boolean; ok?: boolean; files: DocFile[] };

/** Lista de documentos requeridos con lo subido y un control para subir cada uno */
export function DocumentList({ docs, canUpload, onUpload }: {
  docs: DocRow[];
  canUpload: boolean;
  onUpload: (doc: DocRow, file: File, dateExpire?: string) => Promise<unknown>;
}) {
  if (!docs.length) return <p className="text-sm text-brand-700">No se piden documentos en esta etapa.</p>;
  return (
    <ul className="divide-y divide-brand-200/60">
      {docs.map((d) => <DocumentItem key={d.key ?? d.id} doc={d} canUpload={canUpload} onUpload={onUpload} />)}
    </ul>
  );
}

function DocumentItem({ doc, canUpload, onUpload }: {
  doc: DocRow; canUpload: boolean; onUpload: (doc: DocRow, file: File, dateExpire?: string) => Promise<unknown>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [expire, setExpire] = useState('');
  const action = useAction();
  const done = doc.ok ?? doc.files.length > 0;

  const upload = async () => {
    if (!file) return;
    if (await action.run(() => onUpload(doc, file, expire || undefined), 'Subido')) {
      setFile(null);
      setExpire('');
    }
  };

  return (
    <li className="py-2 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <b>{doc.name}</b>
        {doc.is_required && <Badge>obligatorio</Badge>}
        <span className={done ? 'text-green-700' : doc.is_required ? 'text-red-700' : 'text-brand-700'}>
          {done ? '✓ al día' : doc.is_required ? 'falta' : 'opcional'}
        </span>
      </div>
      {doc.files.length > 0 && (
        <p className="mt-0.5 text-xs text-brand-700">
          {doc.files.map((f) => `${f.name}${f.date_expire ? ` (vence ${f.date_expire}${f.valid === false ? ', vencido' : ''})` : ''}`).join(' · ')}
        </p>
      )}
      {canUpload && (
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="max-w-56 text-xs" />
          {doc.has_expiration && <Input type="date" className="max-w-40" value={expire} onChange={(e) => setExpire(e.target.value)} />}
          <Button variant="outline" onClick={upload} disabled={!file || (!!doc.has_expiration && !expire) || action.busy}>Subir</Button>
          <Message error={action.error} />
        </div>
      )}
    </li>
  );
}
