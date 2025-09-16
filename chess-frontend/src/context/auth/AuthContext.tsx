// src/features/authentication/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';


import { useQueryClient } from '@tanstack/react-query';
import { loginWithCredentials, fetchUserProfile, registerUser, logoutUser } from '../../features/authentication/api/authApi';
import { setOnTokenRefreshed, setAccessToken as setTokenInInterceptor } from '../../lib/interceptors';
import { apiService } from '../../service/apiService';
import { apiEndpoints } from '../../config/apiEndpoints';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

// import { set } from 'zod';

type User = any;

interface AuthContextType {
    user: User | null;
    initializing: boolean;
    login: (payload: { username?: string; email?: string; password: string }) => Promise<void>;
    registerLocal: (payload: { username: string; email?: string; password: string }) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    signInPending?: boolean;
    signUpPending?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [initializing, setInitializing] = useState(true);
    const qc = useQueryClient();
    const navigate = useNavigate();
    const [signInPending, setSignInPending] = useState(false);
    const [signUpPending, setSignUpPending] = useState(false);

    // subscribe to interceptor token events
    useEffect(() => {

        setOnTokenRefreshed((token) => {
            // if token === null => logout forced (refresh failed or reuse detected)
            if (!token) {
                setUser(null);
                qc.clear(); // optionally clear cached queries
                navigate('/signin');
            }
        });
    }, [navigate, qc]);


    // Try restore session on mount:
    useEffect(() => {
        let mounted = true;
        // if (["/signin", "/signup"].includes(location.pathname)) {
        //     setInitializing(false);
        //     return;
        // }
        const restore = async () => {
            try {
                const location = useLocation();
                if (['/signin', '/signup'].includes(location.pathname)) {
                    setInitializing(false);
                    return;
                }
                // Try fetch current user - server may accept access cookie or require refresh
                const profile = await fetchUserProfile();
                if (!mounted) return;
                setUser(profile);
            } catch (err: any) {
                // If 401, try to refresh (backend will rotate token and set cookies)
                try {
                    const resp = await apiService.post<{ accessToken: string }>(apiEndpoints.auth.refresh);
                    const newAccess = resp?.accessToken;
                    if (newAccess) {
                        setTokenInInterceptor(newAccess);
                        // refetch profile
                        const profile = await fetchUserProfile();
                        if (!mounted) return;
                        setUser(profile);
                    } else {
                        // no token -> not logged in
                        setUser(null);
                    }
                } catch {
                    setUser(null);
                }
            } finally {
                if (mounted) setInitializing(false);
            }
        };

        restore();

        return () => { mounted = false; };
    }, [qc]);

    // login
    const login = async (payload: { username?: string; email?: string; password: string }) => {
        setSignInPending(true);
        try {
            console.log('login payload', payload);
            const res = await loginWithCredentials(payload);
            // server returns accessToken in body and sets refresh cookie
            if (res?.accessToken) {
                setTokenInInterceptor(res.accessToken);
            }
            setUser(res.user);
            // Optional: prime react-query user cache
            qc.setQueryData(['user'], res.user);
            navigate("/dashboard");
        } catch (error) {
            // on error, ensure no stale data
            console.log('login error', error);
            setSignInPending(false);
            setUser(null);
            qc.clear();
            throw error;
        }
        finally {
            setSignInPending(false);
        }

    };

    const registerLocal = async (payload: { username: string; email?: string; password: string }) => {
        try {
            setSignUpPending(true);
            const res = await registerUser(payload);
            if (res?.accessToken) setTokenInInterceptor(res.accessToken);
            setUser(res.user);
            qc.setQueryData(['user'], res.user);
            navigate('/signin');
        } catch (error) {
            console.log('registration error', error);
            setSignInPending(false);
            setUser(null);
            qc.clear();
            throw error;
        }
        finally {
            setSignUpPending(false);
        }
    };

    const logout = async () => {
        try {
            await logoutUser();
            navigate('/signin');
        } catch {
            // ignore network errors, still clear client-side state
        } finally {
            setTokenInInterceptor(null);
            setUser(null);
            qc.clear();
            navigate('/signin');
        }
    };

    const value: AuthContextType = {
        user,
        initializing,
        login,
        registerLocal,
        logout,
        isAuthenticated: !!user,
        signInPending,
        signUpPending,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
