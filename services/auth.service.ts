import { apiClient } from '@/lib/api.client';
import { AUTH_ENDPOINTS } from '@/utils/constants';
import type { LoginFormData, User } from '@/types';

export interface IdentifyResult {
  /** El usuario tal como está en la base */
  username?: string;
  /** Marca de su empresa; null para Hurgo o si tiene varias empresas */
  company: { name: string; color: string | null; slogan: string | null } | null;
}

export const authService = {
  /** Paso 1 del login: valida el usuario en la base (404 no existe, 403 desactivado) y trae su marca */
  identify: async (username: string): Promise<IdentifyResult> => {
    const response = await apiClient.post(AUTH_ENDPOINTS.IDENTIFY, { username }, { skipAuthRefresh: true } as object);
    return response.data;
  },

  /** Inicia sesión; el backend deja las cookies JWT */
  login: async (data: LoginFormData) => {
    const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, data);
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
    return response.data;
  },

  refreshToken: async () => {
    const response = await apiClient.post(AUTH_ENDPOINTS.REFRESH);
    return response.data;
  },

  checkSession: async () => {
    const response = await apiClient.get(AUTH_ENDPOINTS.SESSION_STATUS, { skipAuthRefresh: true } as object);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get(AUTH_ENDPOINTS.USER_DETAIL);
    return response.data;
  },

  /** Genera y envía por correo el código OTP */
  requestPasswordReset: async (email: string) => {
    const response = await apiClient.post(AUTH_ENDPOINTS.GENERATE_CODE, { email });
    return response.data;
  },

  validateOTP: async (email: string, code: string): Promise<{ valid: boolean; error?: string }> => {
    const response = await apiClient.post(AUTH_ENDPOINTS.VALIDATE_OTP, { email, code });
    return response.data;
  },

  resetPassword: async (email: string, code: string, new_password: string) => {
    const response = await apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, { email, code, new_password });
    return response.data;
  },
};
