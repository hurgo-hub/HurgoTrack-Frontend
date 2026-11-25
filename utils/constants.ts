/**
 * Base de las peticiones del navegador. Por defecto `/backend`, que Next reenvía al backend
 * (ver `rewrites` en next.config.ts y BACKEND_URL): mismo origen, sin CORS y cookies propias.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/backend';

/** URL real del backend, para llamadas desde el servidor de Next (route handlers) */
export const BACKEND_URL = process.env.BACKEND_URL || 'https://hurgotrackback.devloop.com.co/api';

/** Auth del motor (cookies JWT httpOnly: access_token / refresh_token) */
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/token/',
  LOGOUT: '/auth/logout/',
  REFRESH: '/auth/token/refresh/',
  SESSION_STATUS: '/auth/session/status/',
  SUPERUSER_STATUS: '/auth/session/superUser/',
  USER_DETAIL: '/auth/user/',
  REGISTER: '/auth/register/',
  GENERATE_CODE: '/auth/generateCode/',
  VALIDATE_OTP: '/auth/validateOtp/',
  RESET_PASSWORD: '/auth/restPassword/',
} as const;

/**
 * Workflows del motor. Cada acción de negocio es un workflow compuesto por steps:
 *   POST /workflows/sync/<name>/                          ejecuta y responde
 *   POST /workflows/async/<name>/                         encola (Celery)
 *   POST /workflows/RunStepSync/<execution_id>/<state>/   avanza una ejecución al siguiente step
 */
export const WORKFLOW_ENDPOINTS = {
  SYNC: '/workflows/sync/',
  ASYNC: '/workflows/async/',
  RUN_STEP: '/workflows/RunStepSync/',
  CREATE: '/workflows/create/',
  EXCEL_DOWNLOAD: '/workflows/excel/download/',
} as const;

/** Rutas internas de Next (server) que usan Redis */
export const INTERNAL_API = {
  HEALTH: '/api/health',
  STEPS: '/api/steps',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  ORDERS: '/pedidos',
  PURCHASES: '/compras',
  STOCK: '/stock',
  LOADING_POINTS: '/lugares-cargue',
  TRIPS: '/viajes',
} as const;

export const PAGINATION = { DEFAULT_PAGE_SIZE: 20 } as const;

export const VALIDATION = { MIN_PASSWORD_LENGTH: 6 } as const;

/** TTL (segundos) del estado de un flujo de steps guardado en Redis */
export const STEPS_TTL_SECONDS = 60 * 60 * 24;
