import { api } from "./api";
import { apiEndpoints } from "../config/apiEndpoints";
let accessToken: string = '';

let isRefreshing = false;
let failedQueue: any[] = [];
let onTokenRefreshed: ((token: string | null) => void) | null = null;

export function setOnTokenRefreshed(cb: (token: string | null) => void) {
    onTokenRefreshed = cb;
}


const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    })
}
export const setAccessToken = (token: string) => {
    accessToken = token;
};

export const setupInterceptors = () => {
    // Request interceptors
    // api.interceptors.request.use(
    //     (config) => {
    //         if (accessToken) {
    //             config.headers.Authorization = `Bearer ${accessToken}`;
    //         }
    //         return config;
    //     },
    //     (error) => Promise.reject(error)
    // );
    //Response Interceptor
    api.interceptors.response.use(
        (response) => response, // Everything went well
        async (error) => { // if unauthorized error object will have details of what went wrong 
            const originalRequest = error.config; // get the original request
            if (error.response?.status === 401 && !originalRequest.retry) { // checking if the status is unauthorized and original request is not retried again since we need to stop it from retrying again and again
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject })
                    }).then((token) => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        return api(originalRequest);
                    })
                }
                originalRequest._retry = true;
                isRefreshing = true;
                try {
                    const { data } = await api.post(apiEndpoints.auth.refresh);
                    const newAccessToken = data.accessToken;
                    api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
                    if (onTokenRefreshed) onTokenRefreshed(newAccessToken);
                    processQueue(null, newAccessToken);
                    return api(originalRequest);
                }
                catch (error: any) {
                    processQueue(error, null);
                    if (onTokenRefreshed) onTokenRefreshed(null);
                    return Promise.reject(error);
                }
                finally {
                    isRefreshing = false;
                }

            }
            return Promise.reject(error);
        }
    )
}