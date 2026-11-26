'use client';

import { Message } from '@/components/ui';
import { DocumentList, type DocRow } from '@/components/shared/DocumentList';
import { useWorkflowData } from '@/hooks/useWorkflowData';
import { runWorkflowForm } from '@/services/workflow.service';

/** Documentos que Hurgo exige a un vehículo o conductor (se configuran en Catálogos) */
export function FleetDocuments({ owner, canUpload }: { owner: { vehicle_id?: number; driver_id?: number }; canUpload: boolean }) {
  const docs = useWorkflowData<DocRow[]>('fleet.documents', owner);

  const upload = async (doc: DocRow, file: File, dateExpire?: string) => {
    const form = new FormData();
    Object.entries(owner).forEach(([k, v]) => form.append(k, String(v)));
    form.append('type_id', String(doc.id));
    if (dateExpire) form.append('date_expire', dateExpire);
    form.append('files', file);
    await runWorkflowForm('fleet.document.upload', form);
    docs.reload();
  };

  return (
    <>
      <Message error={docs.error} />
      {docs.data && <DocumentList docs={docs.data} canUpload={canUpload} onUpload={upload} />}
    </>
  );
}
