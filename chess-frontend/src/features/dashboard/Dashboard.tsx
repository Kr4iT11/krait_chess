import { useAuth } from '../authentication/context/AuthContext';

const Dashboard = () => {
    // Get the current user's data from the cache
    const { user, signout } = useAuth();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="p-8 bg-gray-800 rounded-lg shadow-xl text-center">
                <h1 className="text-3xl font-bold mb-4">
                    {/* Welcome, <span className="text-yellow-400">{user?.username || 'Player'}</span>! */}
                </h1>
                <p className="text-gray-400 mb-6">You are now logged in.Welcome {user?.username}</p>
                <button
                    onClick={signout}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Dashboard;