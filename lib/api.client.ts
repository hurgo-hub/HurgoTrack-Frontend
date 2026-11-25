import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, AUTH_ENDPOINTS, ROUTES } from '@/utils/constants';
import { getCookie } from '@/utils/helpers';

export interface ApiRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  skipAuthRefresh?: boolean;
  _might404?: boolean;
}

/**
 * Cliente HTTP único. Las cookies JWT (httpOnly) viajan con `withCredentials`;
 * ante un 401 se intenta refrescar el token una sola vez y se reintenta la
 * petición original.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

const isDev = process.env.NODE_ENV === 'development';

apiClient.interceptors.request.use((config: ApiRequestConfig) => {
  const csrfToken = getCookie('csrftoken');
  if (csrfToken && config.headers) {
    config.headers['X-CSRFToken'] = csrfToken;
  }

  // Peticiones que pueden responder 404 sin que sea un error del sistema
  const might404 = config.url?.includes('/linkPayment/') || config.url?.includes('/notificationPush/');
  if (might404) config._might404 = true;

  if (isDev && !might404) {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  }

  return config;
});

let refreshPromise: Promise<unknown> | null = null;

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as ApiRequestConfig | undefined;

    if (
      originalRequest &&
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.skipAuthRefresh &&
      originalRequest.url !== AUTH_ENDPOINTS.REFRESH &&
      originalRequest.url !== AUTH_ENDPOINTS.SESSION_STATUS
    ) {
      originalRequest._retry = true;

      try {
        // Un solo refresh compartido por las peticiones que fallen a la vez
        refreshPromise ??= apiClient.post(AUTH_ENDPOINTS.REFRESH).finally(() => {
          refreshPromise = null;
        });
        await refreshPromise;
        return apiClient(originalRequest);
      } catch (refreshError) {
        if (typeof window !== 'undefined' && window.location.pathname !== ROUTES.LOGIN) {
          window.location.href = ROUTES.LOGIN;
        }
        return Promise.reject(refreshError);
      }
    }

    const isExpected404 = originalRequest?._might404 && error.response?.status === 404;
    if (isDev && !isExpected404) {
      console.error('[API Error]', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }

    return Promise.reject(error);
  },
);

export default apiClient;
