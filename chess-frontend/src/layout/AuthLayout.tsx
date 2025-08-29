import React from "react";


const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="fixed inset-0 min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
            {/* App Title */}
            <div className="text-center mb-8">
                <h1 className="text-5xl font-bold mb-2">ChessApp</h1>
                <p className="text-gray-400">Your move.</p>
            </div>
            {children}
        </div>
    );
}

export default AuthLayout;