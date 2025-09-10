// import { Navigate, Outlet } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// export default function ProtectedRoute() {
//     const { user } = useAuth();

//     // If no user is loaded, redirect to signin
//     if (!user) {
//         return <Navigate to="/signin" replace />;
//     }

//     // Otherwise, render children (protected pages)
//     return <Outlet />;
// }


// src/features/authentication/routes/ProtectedRoute.tsx
// src/features/authentication/routes/ProtectedRoute.tsx
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
    const { isAuthenticated, initializing } = useAuth();

    if (initializing) return <div>Loading...</div>;

    return isAuthenticated ? <Outlet /> : <Navigate to="/signin" replace />;
}

