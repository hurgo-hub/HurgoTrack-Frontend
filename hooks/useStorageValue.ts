import { useSyncExternalStore } from 'react';

const subscribe = (callback: () => void) => {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
};

/**
 * Lee un valor de localStorage/sessionStorage sin romper la hidratación:
 * en el servidor y durante la hidratación devuelve `undefined`; luego, el valor real (o null).
 */
export function useStorageValue(key: string, area: 'local' | 'session' = 'local'): string | null | undefined {
  return useSyncExternalStore(
    subscribe,
    () => {
      try {
        return (area === 'local' ? window.localStorage : window.sessionStorage).getItem(key);
      } catch {
        return null;
      }
    },
    () => undefined,
  );
}
