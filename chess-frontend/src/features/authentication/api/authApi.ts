import { apiEndpoints } from "../../../config/apiEndpoints";
import { apiService } from "../../../service/apiService";
import type { User } from "../../../types/User";

export interface AuthResponse {
    accessToken: string;
    user: User;
}

export const loginWithCredentials = (
    credentials: { username?: string; email?: string; password: string }
): Promise<AuthResponse> => { console.log('Attempting login with credentials:', credentials); return apiService.post<AuthResponse>(apiEndpoints.auth.login, credentials); }



export const registerUser = (
    payload: { username: string; email?: string; password: string }
): Promise<AuthResponse> =>
    apiService.post<AuthResponse>(apiEndpoints.auth.register, payload);

export const fetchUserProfile = (): Promise<User> =>
    apiService.get<User>(apiEndpoints.auth.getProfile);

export const refreshToken = (): Promise<{ accessToken: string }> =>
    apiService.post(apiEndpoints.auth.refresh);

export const logoutUser = (): Promise<{ ok: boolean }> =>
    apiService.post(apiEndpoints.auth.logout);
