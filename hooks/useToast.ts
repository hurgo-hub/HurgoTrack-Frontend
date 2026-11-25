import { useMemo } from 'react';
import { toast } from 'sonner';
import type { ToastType } from '@/types';

/**
 * Notificaciones efímeras (Sonner). Conserva la firma original
 * `showToast(tipo, mensaje, duración)` usada en todas las pantallas.
 */
export function showToast(type: ToastType, message: string, duration: number = 4000) {
  const options = { duration };
  switch (type) {
    case 'success':
      return toast.success(message, options);
    case 'error':
      return toast.error(message, options);
    case 'warning':
      return toast.warning(message, options);
    default:
      return toast.info(message, options);
  }
}

export function useToast() {
  return useMemo(() => ({ showToast, dismiss: toast.dismiss }), []);
}
