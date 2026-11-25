import type { AxiosError } from 'axios';
import { apiClient } from '@/lib/api.client';
import type { ListParams, PaginatedResponse } from '@/types';

const EMPTY_PAGE = { results: [], count: 0, next: null, previous: null };

/**
 * Lista paginada de DRF (`ViewList`). Normaliza respuestas paginadas, arreglos
 * simples y el `{"message": "No results found."}` que devuelve el backend sin datos.
 */
export async function genericPaginatedList<T>(endpoint: string, params?: ListParams): Promise<PaginatedResponse<T>> {
  try {
    const response = await apiClient.get(endpoint, { params });
    if (response.data?.results) return response.data;
    if (Array.isArray(response.data)) {
      return { results: response.data, count: response.data.length, next: null, previous: null };
    }
    return EMPTY_PAGE;
  } catch (error) {
    const status = (error as AxiosError).response?.status;
    // Si el endpoint no existe se devuelve vacío en silencio
    if (status === 404 || status === 405) return EMPTY_PAGE;
    throw error;
  }
}

/** Detalle por id con mensajes claros cuando no existe */
export async function genericRetrieve<T>(endpoint: string, id: number, notFoundMessage: string): Promise<T> {
  try {
    const response = await apiClient.get(`${endpoint}${id}/`);
    return response.data;
  } catch (error) {
    const response = (error as AxiosError).response;
    if (response?.status === 404) {
      const body = response.data;
      if (typeof body === 'string' && body.includes('<!DOCTYPE html>')) {
        throw new Error('El endpoint para obtener detalles no está disponible');
      }
      throw new Error(notFoundMessage);
    }
    throw error;
  }
}
