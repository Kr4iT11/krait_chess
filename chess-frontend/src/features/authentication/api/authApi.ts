import { apiEndpoints } from "../../../config/apiEndpoints";
// import type { TSignInSchema, TSignUpSchema } from "../../../lib/validators/authvalidations";
import { apiService } from "../../../service/apiService";
import type { User } from "../../../types/User";

//Define Response type
export interface AuthResponse {
    accessToken: string;
    user: User
}

export const loginWithCredentials = async (credentials: { username?: string; email?: string; password: string; }): Promise<AuthResponse> =>
    await apiService.post<AuthResponse>(apiEndpoints.auth.login, credentials);


export const registerUser = async (payload: { username: string; email?: string; password: string; }) =>
    await apiService.post<AuthResponse>(apiEndpoints.auth.register, payload);

export const fetchUserProfile = async (): Promise<User> =>
    await apiService.get<User>(apiEndpoints.auth.getProfile);

export const refreshToken = async (): Promise<{ accessToken: string }> =>
    await apiService.post(apiEndpoints.auth.refresh);

export const logoutUser = async (): Promise<{ ok: boolean }> =>
    await apiService.post(apiEndpoints.auth.logout);
