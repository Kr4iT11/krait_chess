// src/lib/interceptors/responseInterceptor.ts

import type { ApiError, ApiResponse } from "../types/ApiResponseType";
import api from "./api";


api.interceptors.response.use(
    (res) => {
        const apiResponse = res.data as ApiResponse<any>;

        // ✅ success path
        if (apiResponse?.meta?.status === 'success') {
            return apiResponse.data;
        }

        // ❌ API-level failure
        throw {
            message: apiResponse?.meta?.message || 'API Error',
            status: apiResponse?.meta?.httpStatus,
            meta: apiResponse?.meta,
            error: apiResponse?.error,
        } as ApiError;
    },
    (error) => {
        // ❌ network / timeout / 5xx
        throw {
            message:
                error.response?.data?.meta?.message ||
                error.message ||
                'Network error',
            status: error.response?.status,
            error,
        } as ApiError;
    }
);
