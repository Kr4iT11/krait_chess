import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import SignIn from './features/authentication/Signin'
import Signup from './features/authentication/Signup'
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
// import { apiService } from './service/apiService';
// import { apiEndpoints } from './config/apiEndpoints';
// import { setAccessToken } from './lib/interceptors';
// import { fetchUserProfile } from './features/authentication/api/authApi';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './features/authentication/routes/ProtectedRoute';
import Dashboard from './features/dashboard/Dashboard';


function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const queryClient = useQueryClient();
  // useEffect(() => {
  //   const restoreSession = async () => {
  //     // Try to get new access token on app load
  //     try {
  //       const { accessToken }: any = await apiService.post(apiEndpoints.auth.refresh, {});
  //       if (accessToken) {
  //         setAccessToken(accessToken);
  //         // Pre-fetch the user's data so it's available immediately
  //         await queryClient.prefetchQuery({
  //           queryKey: ['user'],
  //           queryFn: () => fetchUserProfile
  //         })

  //       }
  //     } catch (error) {
  //       console.log('No Active users found');
  //     }
  //     finally {
  //       setIsInitializing(false)
  //     }
  //   };
  //   restoreSession();
  // }, [queryClient]);

  // if (isInitializing) {
  //   return <div>Loading Application ...</div>
  // }
  return (
    <>
      {/* For toast notifications */}
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#333',
          color: '#fff',
        }
      }} />

      <Routes>
        {/* Public Routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </>
  )
}

export default App


