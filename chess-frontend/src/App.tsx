// src/App.tsx
import './App.css';
import { Route, Routes } from 'react-router-dom';
import SignIn from './features/authentication/Signin';
import Signup from './features/authentication/Signup';
// import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './features/authentication/routes/ProtectedRoute';
import Dashboard from './features/dashboard/Dashboard';
import AppLayout from './layout/dashboard/AppLayout';

function App() {
  return (
    <>
      {/* For toast notifications */}
      {/* <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      /> */}

      <Routes>
        {/* Public Routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Route>

      </Routes>
    </>
  );
}

export default App;
