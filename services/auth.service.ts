import { apiClient } from '@/lib/api.client';
import { AUTH_ENDPOINTS } from '@/utils/constants';
import type { LoginFormData, User } from '@/types';

export const authService = {
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
