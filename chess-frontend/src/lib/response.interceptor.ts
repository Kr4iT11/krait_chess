import { api } from './api';

api.interceptors.response.use(
    (res) => {
        const apiResponse = res.data;
        if (apiResponse?.meta?.status === 'success') {
            return apiResponse;
        }
        return Promise.reject({
            message: apiResponse?.meta?.message || 'Unknown API error',
            status: apiResponse?.meta?.status || 'error',
            meta: apiResponse?.meta,
            error: apiResponse?.error,
        });
    },
    (error) => {
        // Network / timeout / server crash
        return Promise.reject({
            message: error.message || "Network error",
            status: error.response?.status,
            raw: error
        });
    }
);