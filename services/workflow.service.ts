import { apiClient } from '@/lib/api.client';
import { WORKFLOW_ENDPOINTS } from '@/utils/constants';
import type { WorkflowPayload, WorkflowResponse } from '@/types';

function unwrap<T>(name: string, body: WorkflowResponse<T>): T {
  if (!body.success) {
    throw new Error(body.details?.reason || `El workflow ${name} no se pudo ejecutar`);
  }
  return body.details.context?.results as T;
}

/** `POST /workflows/sync/<name>/`: ejecuta el workflow y devuelve `context.results` */
export async function runWorkflow<T = unknown>(name: string, payload: WorkflowPayload = {}): Promise<T> {
  const { data } = await apiClient.post<WorkflowResponse<T>>(`${WORKFLOW_ENDPOINTS.SYNC}${name}/`, payload);
  return unwrap(name, data);
}

/** `POST /workflows/async/<name>/`: encola el workflow (Celery) y devuelve la respuesta cruda */
export async function runWorkflowAsync<T = unknown>(name: string, payload: WorkflowPayload = {}) {
  const { data } = await apiClient.post<WorkflowResponse<T>>(`${WORKFLOW_ENDPOINTS.ASYNC}${name}/`, payload);
  return data;
}

/** `POST /workflows/RunStepSync/<execution_id>/<next_state>/`: avanza una ejecución al siguiente step */
export async function runStep<T = unknown>(executionId: number, nextState: string, payload: WorkflowPayload = {}) {
  const { data } = await apiClient.post<WorkflowResponse<T>>(
    `${WORKFLOW_ENDPOINTS.RUN_STEP}${executionId}/${nextState}/`,
    payload,
  );
  return data;
}

export interface GenericListData {
  fields?: string[];
  relations?: Record<string, unknown>;
  filters?: Record<string, unknown>;
  order_by?: string[];
  limit?: number;
  offset?: number;
}

/** Listado genérico de un modelo registrado en el backend (`list.base.relations`) */
export function workflowList<T = unknown>(appName: string, data: GenericListData = {}) {
  return runWorkflow<T[]>('list.base.relations', {
    app_name: appName,
    data: { fields: [], relations: {}, filters: {}, order_by: ['-id'], limit: 50, offset: 0, ...data },
  });
}
