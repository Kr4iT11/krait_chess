import { apiEndpoints } from "../../../config/apiEndpoints";
import type { TSignInSchema, TSignUpSchema } from "../../../lib/validators/authvalidations";
import { apiService } from "../../../service/apiService";
import type { User } from "../../../types/User";

//Define Response type
export interface AuthResponse {
    accessToken: string;
    user: User
}

export const loginWithCredentials = async (credentials: TSignInSchema): Promise<AuthResponse> =>
    await apiService.post(apiEndpoints.auth.login, credentials);

// export const fetchUserProfile = async (credentials: TSignInSchema): Promise<User> =>
//     await apiService.post(apiEndpoints.auth.getProfile, credentials);

// export const fetchUserProfile = async (credentials: TSignInSchema): Promise<User> =>
//     await apiService.post(apiEndpoints.auth.getProfile, credentials);

export const fetchUserProfile = async (): Promise<User> =>
    apiService.get(apiEndpoints.auth.getProfile);

export const logoutUser = async (): Promise<void> => {
    await apiService.post(apiEndpoints.auth.logout, {});
};

export const registerUser = (data: TSignUpSchema): Promise<AuthResponse> =>
    apiService.post(apiEndpoints.auth.register, data);