import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/auth/AuthContext';

export default function ProtectedRoute() {
    const { isAuthenticated, initializing } = useAuth();

    if (initializing) return <div>Loading...</div>;

    return isAuthenticated ? <Outlet /> : <Navigate to="/signin" replace />;
}

