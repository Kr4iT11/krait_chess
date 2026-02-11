import { api } from '../lib/api';
import type { ApiResponse } from '../types/ApiResponseType';

/**
 * A centralized API service that provides clean methods for all HTTP requests.
 * It wraps the configured axios instance and consistently returns the `data` property
 * from the response, simplifying the code in your hooks and components.
 */

export const apiService = {
    /**
   * Sends a GET request to the specified endpoint.
   * @param endpoint The API endpoint path (e.g., '/users/me').
   * @param params An optional object of URL query parameters.
   * @returns The `data` property of the API response.
   */
    get: async <T>(url: string, params?: object): Promise<T> => {
        const res = await api.get<T>(url, { params });
        return res as unknown as T;
    },

    /**
     * Sends a POST request to the specified endpoint.
     * @param endpoint The API endpoint path.
     * @param body The request body.
     * @returns The `data` property of the API response.
    */
    post: async <T>(url: string, body?: object): Promise<T> => {
        const res = await api.post<T>(url, body);
        return res as unknown as T;
    },

    /**
    * Sends a PUT request to the specified endpoint.
    * @param endpoint The API endpoint path.
    * @param body The request body.
    * @returns The `data` property of the API response.
    */
    put: async <T>(url: string, body?: object): Promise<T> => {
        const res = await api.put<T>(url, body);
        return res as unknown as T;
    },
    /**
  * Sends a PATCH request to the specified endpoint.
  * @param endpoint The API endpoint path.
  * @param body The request body.
  * @returns The `data` property of the API response.
  */
    patch: async <T>(url: string, body?: object): Promise<T> => {
        const res = await api.patch<T>(url, body);
        return res as unknown as T;
    },

    /**
     * Sends a DELETE request to the specified endpoint.
     * @param endpoint The API endpoint path.
     * @returns The `data` property of the API response.
     */
    delete: async <T>(url: string): Promise<T> => {
        const res = await api.delete<T>(url);
        return res as unknown as T;
    },

}