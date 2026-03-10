import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import App from './App.tsx';
import './index.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Serve cached data for 60s before marking stale
            staleTime: 60 * 1000,
            // Keep unused cache for 5 minutes
            gcTime: 5 * 60 * 1000,
            retry: 2,
            refetchOnWindowFocus: false,
        },
    },
});

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <ToastProvider>
                <AuthProvider>
                    <BrowserRouter>
                        <ErrorBoundary>
                            <App />
                        </ErrorBoundary>
                    </BrowserRouter>
                </AuthProvider>
            </ToastProvider>
        </QueryClientProvider>
    </StrictMode>
);
