import { useAuth } from '../authentication/context/AuthContext';

const Dashboard = () => {
    // Get the current user's data from the cache
    const { user, logout } = useAuth();

    return (
        <>
            <div className="grid grid-cols-12 gap-4 md:gap-6">
                <div>
                    <div>
                        <h1 className="text-3xl font-bold mb-4">
                            {/* Welcome, <span className="text-yellow-400">{user?.username || 'Player'}</span>! */}
                        </h1>
                        <p className="text-gray-400 mb-6">You are now logged in.Welcome {user?.username}</p>
                        <button
                            onClick={logout}
                            className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </>

    );
};

export default Dashboard;