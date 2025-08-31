import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";
import { setOnTokenRefreshed } from "../../../lib/interceptors";
import {
    fetchUserProfile,
    loginWithCredentials,
    logoutUser,
    registerUser,
    type AuthResponse,
} from "../api/authApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../../service/apiService";
import { apiEndpoints } from "../../../config/apiEndpoints";

interface AuthContextType {
    user: any;
    accessToken: string | null;
    signin: (credentials: any) => Promise<AuthResponse>;
    signup: (data: any) => Promise<AuthResponse>;
    signout: () => Promise<void>;
    isInitializing: boolean;
    signinPending: boolean;
    signupPending: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const navigate = useNavigate();

    // 🔄 Restore session on app load
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const { accessToken }: any = await apiService.post(apiEndpoints.auth.refresh, {});
                if (accessToken) {
                    setAccessToken(accessToken);
                    await queryClient.prefetchQuery({
                        queryKey: ["user"],
                        queryFn: fetchUserProfile,
                    });
                }
            } catch {
                console.log("No active session found");
            } finally {
                setIsInitializing(false);
            }
        };
        restoreSession();
    }, [queryClient]);

    // 🔄 Sync context with interceptor refresh
    useEffect(() => {
        setOnTokenRefreshed((token) => {
            setAccessToken(token);
            if (!token) queryClient.removeQueries({ queryKey: ["user"] });
        });
    }, [queryClient]);

    // Query for current user (enabled only if token exists)
    const { data: user } = useQuery({
        queryKey: ["user"],
        queryFn: fetchUserProfile,
        enabled: !!accessToken,
    });

    // 🔑 Mutations
    const signinMutation = useMutation<AuthResponse, any, any>({
        mutationFn: loginWithCredentials,
        onSuccess: (data) => {
            setAccessToken(data.accessToken);
            queryClient.setQueryData(["user"], data.user);
            toast.success("Welcome back!");
            navigate("/dashboard");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Login failed.");
        },
    });

    const signupMutation = useMutation<AuthResponse, any, any>({
        mutationFn: registerUser,
        onSuccess: (data) => {
            setAccessToken(data.accessToken);
            queryClient.setQueryData(["user"], data.user);
            toast.success("Account created successfully!");
            navigate("/dashboard");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Registration failed.");
        },
    });

    const logoutMutation = useMutation<void, any, void>({
        mutationFn: async () => {
            await logoutUser();
        },
        onSuccess: () => {
            setAccessToken(null); // This is wrong we need to reimplement this and figure it out 
            queryClient.removeQueries({ queryKey: ["user"] });
            toast.success("Logged out successfully.");
            navigate("/signin");
        },
        onError: () => {
            // Even if backend 401s, clear client state
            setAccessToken(null);
            queryClient.removeQueries({ queryKey: ["user"] });
            navigate("/signin");
        },
    });

    // Exposed methods
    const signin = (credentials: any) => signinMutation.mutateAsync(credentials);
    const signup = (data: any) => signupMutation.mutateAsync(data);
    const signout = () => logoutMutation.mutateAsync();

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                signin,
                signup,
                signout,
                isInitializing,
                signinPending: signinMutation.isPending,
                signupPending: signupMutation.isPending,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
