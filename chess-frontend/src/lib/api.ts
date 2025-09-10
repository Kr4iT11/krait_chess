import axios from 'axios';
import { apiEndpoints } from '../config/apiEndpoints';

export const api = axios.create({
    baseURL: apiEndpoints.baseURL,
    withCredentials: true, // send cookies (session_id + refresh_token)
    timeout: 15000,
});

// Export for convenience
export default api;
