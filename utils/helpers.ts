import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Combina clases de Tailwind resolviendo conflictos */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/** Obtiene una cookie por nombre */
export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

/** Copia texto al portapapeles */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

export const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/** Teléfono colombiano de 10 dígitos */
export const validatePhone = (phone: string): boolean => /^\d{10}$/.test(phone);

export const generateId = (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

export type PasswordStrength = { score: number; label: string; tone: 'danger' | 'warning' | 'success' };

/** Calcula la fuerza de una contraseña (0-5) */
export const getPasswordStrength = (password: string): PasswordStrength => {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Débil', tone: 'danger' };
  if (score <= 3) return { score, label: 'Media', tone: 'warning' };
  return { score, label: 'Fuerte', tone: 'success' };
};

/** Extrae el mensaje de error de una respuesta y lo traduce a un texto amable */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const extractErrorMessage = (error: any): string => {
  let msg = '';

  if (error?.response?.data?.detail) {
    msg = error.response.data.detail;
  } else if (error?.response?.data?.message) {
    msg = error.response.data.message;
  } else if (error?.response?.data?.error) {
    msg = typeof error.response.data.error === 'string'
      ? error.response.data.error
      : 'No pudimos procesar tu solicitud. Por favor, intenta de nuevo.';
  } else if (error?.message) {
    msg = error.message;
  } else {
    msg = 'Ocurrió un error inesperado al conectar con el servidor. Por favor, intenta más tarde.';
  }

  // Mensajes técnicos o en inglés del backend → texto para el usuario
  const msgLower = msg.toLowerCase();
  if (msgLower.includes('no active account found') || msgLower.includes('invalid credentials')) {
    return 'Usuario o contraseña incorrectos. Por favor, verifica tus datos e intenta de nuevo.';
  }
  if (msgLower.includes('network error') || msgLower.includes('timeout')) {
    return 'Problemas de conexión. Por favor, verifica tu internet o intenta de nuevo más tarde.';
  }
  if (msgLower.includes('unauthorized') || msgLower.includes('no autorizado')) {
    return 'Tu sesión ha expirado o no tienes permisos. Por favor, inicia sesión nuevamente.';
  }
  if (msg === 'Error en la solicitud' || msg === 'Ha ocurrido un error inesperado' || msg === 'Network Error') {
    return 'No pudimos procesar eso ahora mismo. Verifica tu conexión o intenta más tarde.';
  }

  return msg;
};
