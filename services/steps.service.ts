import axios from 'axios';
import { INTERNAL_API } from '@/utils/constants';
import type { StepperState } from '@/types';

/** Cliente de las rutas internas de Next que guardan el estado de los steps en Redis (no pasa por el backend) */
const internal = axios.create({ baseURL: INTERNAL_API.STEPS, timeout: 8000 });

export const stepsService = {
  /** Estado guardado o `null` si no existe / Redis no responde */
  load: async (key: string): Promise<StepperState | null> => {
    try {
      const { data } = await internal.get<StepperState>(`/${encodeURIComponent(key)}`);
      return data;
    } catch {
      return null;
    }
  },
  save: async (key: string, state: StepperState) => {
    const { data } = await internal.put<StepperState>(`/${encodeURIComponent(key)}`, state);
    return data;
  },
  clear: async (key: string) => {
    await internal.delete(`/${encodeURIComponent(key)}`);
  },
};
