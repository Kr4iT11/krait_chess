// src/lib/interceptors.ts
import { api } from './api';
import { apiEndpoints } from '../config/apiEndpoints';

/**
 * Single-flight refresh + request queue
 * - accessToken is kept in-memory
 * - refresh requests hit POST /auth/refresh (cookies sent automatically)
 * - when refresh succeeds we set new access token and retry pending requests
 * - when refresh fails we notify subscribers with null (force logout)
 */

let accessToken: string | null = null;

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
const requestQueue: Array<(token: string | null) => void> = [];

// External callback to notify auth context about token changes or logout
let onTokenRefreshedCb: ((token: string | null) => void) | null = null;
export function setOnTokenRefreshed(cb: (token: string | null) => void) {
  onTokenRefreshedCb = cb;
}

// for debug/testing
export function getAccessToken() {
  return accessToken;
}
export function setAccessToken(token: string | null) {
  accessToken = token;
}

// internal: call queued request callbacks
function processQueue(token: string | null) {
  requestQueue.forEach(cb => cb(token));
  requestQueue.length = 0;
}

// Request interceptor - attach Authorization header if we have an in-memory token
api.interceptors.request.use((config) => {
  if (!config.headers) config.headers = {} as import('axios').AxiosRequestHeaders;
  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor - handle 401/403 and refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error?.config;

    // If no response or request already retried, just reject
    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    // Don't try to refresh when the refresh endpoint itself failed
    if (originalRequest.url && originalRequest.url.includes(apiEndpoints.auth.refresh)) {
      return Promise.reject(error);
    }

    const status = error.response.status;

    // We'll treat 401 & 403 as auth errors to attempt refresh (server might return 403 on reuse detection)
    if ((status === 401 || status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;

      // If refresh already in progress, wait for it
      if (isRefreshing && refreshPromise) {
        return new Promise((resolve, reject) => {
          requestQueue.push((token: string | null) => {
            if (token) {
              if (!originalRequest.headers) originalRequest.headers = {};
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              resolve(api(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      // Start refresh
      isRefreshing = true;
      refreshPromise = (async () => {
        try {
          const resp = await api.post(apiEndpoints.auth.refresh);
          const newAccess: string | undefined = resp?.data?.accessToken;
          if (!newAccess) {
            // No token returned -> treat as failure
            return null;
          }
          setAccessToken(newAccess);
          // notify external subscriber (AuthContext) that token changed
          if (onTokenRefreshedCb) onTokenRefreshedCb(newAccess);
          return newAccess;
        } catch (e) {
          // refresh failed (expired, reuse detection, etc.)
          setAccessToken(null);
          if (onTokenRefreshedCb) onTokenRefreshedCb(null);
          return null;
        } finally {
          isRefreshing = false;
          refreshPromise = null;
        }
      })();

      try {
        const newToken = await refreshPromise;
        if (!newToken) {
          // refresh failed; reject original request and bubble up
          processQueue(null);
          return Promise.reject(error);
        }
        // retry original request with new token
        if (!originalRequest.headers) originalRequest.headers = {};
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        processQueue(newToken);
        return api(originalRequest);
      } catch (e) {
        processQueue(null);
        return Promise.reject(e);
      }
    }

    // Other errors - just reject
    return Promise.reject(error);
  }
);

// export default api;
