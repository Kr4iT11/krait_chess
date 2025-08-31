import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile, loginWithCredentials, logoutUser, registerUser, type AuthResponse } from "../api/authApi";
import { setAccessToken } from "../../../lib/interceptors";
import toast from "react-hot-toast";
// import type { User } from "../../../types/User";
import type { TSignInSchema, TSignUpSchema } from "../../../lib/validators/authvalidations";


/**
 * Hook to get the current authenticated user's data.
 * This is the application's single source of truth for the user's session state.
 */
export const useUser = () => {
    return useQuery({
        queryKey: ['user'],
        queryFn: () => fetchUserProfile,
        retry: false, // Don't retry on auth errors (401)
        refetchOnWindowFocus: false, // Optional: prevents refetching just because user clicks away and back
    });
};
/**
 * Hook to handle new user registration. Returns a mutation function.
 */
export const useSignup = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation<AuthResponse, Error, TSignUpSchema>({
        mutationFn: (data) => registerUser(data),
        onSuccess: (data) => {
            // we get data with access token
            setAccessToken(data.accessToken),
                // Update the user data in cache to log the new user in 
                queryClient.setQueryData(['user'], data.user),
                toast.success('Account created successfully'),
                navigate('/dashboard')  // will navigate to the dashboard
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Registration failed');
        }
    });
};

/**
 * Hook to handle user login. Returns a mutation function.
 */
export const useLogin = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation<AuthResponse, Error, TSignInSchema>({
        mutationFn: (credentials) => loginWithCredentials(credentials),
        onSuccess: (data) => {
            setAccessToken(data.accessToken);
            queryClient.invalidateQueries({ queryKey: ['user'] });
            toast.success('Welcome back!');
            navigate('/dashboard');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Login failed.');
        }
    });
};

/**
 * Hook to handle user logout. Returns a mutation function.
 */

export const useLogout = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: logoutUser,
        onSuccess: () => {
            setAccessToken('');
            queryClient.setQueryData(['user'], null);
            navigate('/signin')
        }
    })
}