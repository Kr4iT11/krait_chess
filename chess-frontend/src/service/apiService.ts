import { api } from '../lib/api';

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
    get: async<T>(endpoint: string, params?: object): Promise<T> => {
        const response = await api.get<T>(endpoint, { params });
        return response.data;
    },

    /**
     * Sends a POST request to the specified endpoint.
     * @param endpoint The API endpoint path.
     * @param data The request body.
     * @returns The `data` property of the API response.
    */
    post: async<T>(endpoint: string, data: object): Promise<T> => {
        const response = await api.post<T>(endpoint, data);
        return response.data;
    },

    /**
    * Sends a PUT request to the specified endpoint.
    * @param endpoint The API endpoint path.
    * @param data The request body.
    * @returns The `data` property of the API response.
    */
    put: async<T>(endpoint: string, data?: object): Promise<T> => {
        const response = await api.put<T>(endpoint, data);
        return response.data
    },

    /**
  * Sends a PATCH request to the specified endpoint.
  * @param endpoint The API endpoint path.
  * @param data The request body.
  * @returns The `data` property of the API response.
  */
    patch: async <T>(endpoint: string, data: object): Promise<T> => {
        const response = await api.patch<T>(endpoint, data);
        return response.data;
    },

    /**
     * Sends a DELETE request to the specified endpoint.
     * @param endpoint The API endpoint path.
     * @returns The `data` property of the API response.
     */
    delete: async <T>(endpoint: string): Promise<T> => {
        const response = await api.delete<T>(endpoint);
        return response.data;
    },

}