'use client';

import { useWorkflowData } from '@/hooks/useWorkflowData';

export type OdooMode = { enabled: boolean; simulated: boolean };

/** Odoo real, apagado o simulado (con el simulador aparece "Simular compra en Odoo") */
export function useOdooMode(enabled = true) {
  return useWorkflowData<OdooMode>('apiOdoo.mode', {}, enabled).data;
}
