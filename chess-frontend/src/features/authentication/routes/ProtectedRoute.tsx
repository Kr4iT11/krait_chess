import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
    const { user } = useAuth();

    // If no user is loaded, redirect to signin
    if (!user) {
        return <Navigate to="/signin" replace />;
    }

    // Otherwise, render children (protected pages)
    return <Outlet />;
}