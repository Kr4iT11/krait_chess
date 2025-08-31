export interface User {
    id: number;
    username: string;
    eloRating: number;
    email: string;
    googleId: string | null;
    authProvider: 'local' | 'google';
    isVerified: boolean;
    createdAt: string; // Dates are typically strings in JSON
    updatedAt: string;

}