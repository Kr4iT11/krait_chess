import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/auth/AuthContext.tsx';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/layout/ThemeContext.tsx';
import { ScrollToTop } from './components/common/ScrollToTop.tsx';
import { NotificationProvider } from './notifications/NotificationContext.ts';
const queryClient = new QueryClient();
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <NotificationProvider>
            <ThemeProvider>
              <App />
            </ThemeProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
