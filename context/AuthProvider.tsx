'use client';

import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { extractErrorMessage } from '@/utils/helpers';
import { ROUTES } from '@/utils/constants';
import type { LoginFormData, User } from '@/types';

export const AUTH_FLASH_KEY = 'hurgotrack.auth.flash';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginFormData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Mensaje de una sola lectura para la siguiente pantalla (p. ej. "Registro exitoso") */
export function setAuthFlash(message: string) {
  try {
    sessionStorage.setItem(AUTH_FLASH_KEY, message);
  } catch {}
}

export function clearAuthFlash() {
  try {
    sessionStorage.removeItem(AUTH_FLASH_KEY);
  } catch {}
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  // En las pantallas de acceso (/auth/*) no se consulta la sesión: solo en las privadas
  const isAuthPage = pathname.startsWith('/auth');
  const sessionChecked = useRef(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(!isAuthPage);
  const [error, setError] = useState<string | null>(null);

  // No autenticado: no se muestra error
  const loadSession = useCallback(
    () =>
      authService
        .checkSession()
        .then(() => authService.getCurrentUser())
        .then(setUser)
        .catch(() => setUser(null))
        .finally(() => setIsLoading(false)),
    [],
  );

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await loadSession();
  }, [loadSession]);

  // Verificación de sesión al entrar a una pantalla privada (una sola vez)
  useEffect(() => {
    if (isAuthPage || sessionChecked.current) return;
    sessionChecked.current = true;
    loadSession();
  }, [isAuthPage, loadSession]);

  const login = useCallback(async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.login(data);
      setUser(await authService.getCurrentUser());
      setIsLoading(false);
      router.push(ROUTES.HOME);
    } catch (err) {
      setError(extractErrorMessage(err));
      setIsLoading(false);
      throw err;
    }
  }, [router]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.logout();
    } catch {
      // Aunque falle, se limpia el estado local
    } finally {
      setUser(null);
      setIsLoading(false);
      router.push(ROUTES.LOGIN);
    }
  }, [router]);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    checkAuth,
    clearError,
  }), [user, isLoading, error, login, logout, checkAuth, clearError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
