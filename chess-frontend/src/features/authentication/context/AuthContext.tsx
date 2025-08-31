import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";
import { setOnTokenRefreshed } from "../../../lib/interceptors";
import { fetchUserProfile, loginWithCredentials, logoutUser, registerUser, type AuthResponse } from "../api/authApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
    user: any;
    accessToken: string | null;
    signin: (credentials: any) => Promise<AuthResponse>;
    signup: (data: any) => Promise<AuthResponse>;
    signout: () => Promise<void>;
    isInitializing: boolean;
    signinPending?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        setOnTokenRefreshed((token) => {
            setAccessToken(token);
            if (!token) queryClient.removeQueries({ queryKey: ["user"] });
        });
    }, [queryClient]);

    //query for current user
    const { data: user } = useQuery({
        queryKey: ["user"],
        queryFn: fetchUserProfile,
        enabled: !!accessToken,
    });
    // Mutations
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

    const logoutMutation = useMutation<void, Error>({
        mutationFn: async () => {
            await logoutUser();
        },  // ensure this returns Promise<void>
        onSuccess: () => {
            setAccessToken(null);
            queryClient.removeQueries({ queryKey: ["user"] });
            toast.success("Logged out successfully.");
            navigate("/signin");
        },
    });
    // exposed methods
    const signin = async (credentials: any) => signinMutation.mutateAsync(credentials);
    const signup = async (data: any) => signupMutation.mutateAsync(data);
    const signout = async () => logoutMutation.mutateAsync();


    return (
        <AuthContext.Provider value={{ user, accessToken, signin, signup, signout, isInitializing, signinPending: signinMutation.isPending, }}>
            {children}
        </AuthContext.Provider>
    );
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
