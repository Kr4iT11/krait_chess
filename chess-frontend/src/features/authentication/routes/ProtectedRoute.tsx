import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../hooks/useAuth"



const ProtectedRoute: React.FC = () => {
    const { data: user, isLoading, isError } = useUser();
    if (isLoading) {
        return <div>Authenticating...</div>; // Or a full-page loader
    }
    // If there's an error fetching the user, it means they are not authenticated
    if (isError || !user) {
        return <Navigate to="/signin" />;
    }
    return <Outlet />; // Render the child route (e.g., Dashboard)
}

export default ProtectedRoute;