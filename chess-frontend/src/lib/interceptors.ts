import { api } from "./api";
import { apiEndpoints } from "../config/apiEndpoints";
let accessToken: string = '';

export const setAccessToken = (token: string) => {
    accessToken = token;
};

export const setupInterceptors = () => {
    // Request interceptors
    api.interceptors.request.use(
        (config) => {
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );
    //Response Interceptor
    api.interceptors.response.use(
        (response) => response, // Everything went well
        async (error) => { // if unauthorized error object will have details of what went wrong 
            const originalRequest = error.config; // get the original request
            if (error.response?.status === 401 && !originalRequest.retry) { // checking if the status is unauthorized and original request is not retried again since we need to stop it from retrying again and again
                originalRequest.retry = true; // marking this to retry since we dont want it to keep retrying
                try {
                    const { data } = await api.post(apiEndpoints.auth.refresh); // since we need new access token 
                    setAccessToken(data.accessToken);
                    originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                    return api(originalRequest);
                } catch (error) {
                    console.error("Session expired. Please log in again.");
                    return Promise.reject(error);
                }
            }
            return Promise.reject(error);
        }
    )
}