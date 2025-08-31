export const apiEndpoints = {
    baseURL: `http://localhost:3000`,
    auth: {
        login: '/auth/login',
        register: '/auth/register',
        refresh: '/auth/refresh',
        getProfile: '/users/me',
        logout: '/auth/logout'
    }
}