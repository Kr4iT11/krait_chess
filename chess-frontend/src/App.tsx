// src/App.tsx
import './App.css';
import { Route, Routes } from 'react-router-dom';
// import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './features/authentication/routes/ProtectedRoute';
import AppLayout from './layout/dashboard/AppLayout';
import SignIn from './features/authentication/pages/SigninPage';
import Signup from './features/authentication/pages/SignupPage';
import DashboardPage from './features/dashboard/DashboardPage';
import LiveGamePage from './features/game/pages/LiveGamePage';

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
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/game" element={<LiveGamePage />} />
          </Route>
        </Route>

      </Routes>
    </>
  );
}

export default App;
