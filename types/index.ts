// Usuario (GET /auth/user/)
export interface User {
  id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_active?: boolean;
  /** Permisos del motor, p. ej. "trips.view_m_trip" */
  permissions?: string[];
  groups?: string[];
}

export interface LoginFormData {
  username: string;
  password: string;
}

// Respuestas de la API
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ListParams {
  query?: string;
  page?: number;
  page_size?: number;
}

/** Contrato de los workflows: `{ success, details: { context: { results } } }` */
export interface WorkflowResponse<T = unknown> {
  success: boolean;
  details: {
    reason?: string;
    execution_id?: number;
    state?: string;
    context?: { results?: T; [key: string]: unknown };
  };
}

export interface WorkflowPayload {
  app_name?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

// Steps (flujos por pasos en el frontend)
export interface StepDefinition {
  key: string;
  label: string;
  description?: string;
}

export type StepStatus = 'idle' | 'running' | 'done' | 'error';

/** Estado serializable de un flujo; se persiste en Redis vía /api/steps/<key> */
export interface StepperState<TData = Record<string, unknown>> {
  current: number;
  completed: number[];
  data: TData;
  executionId?: number | null;
  updatedAt?: string;
}

// UI
export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand';
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';
