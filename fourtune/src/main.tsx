import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ConfirmProvider } from './contexts/ConfirmContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import App from './App.tsx';
import './index.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            refetchOnWindowFocus: false,
        },
    },
});

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <ConfirmProvider>
                <ToastProvider>
                    <AuthProvider>
                        <BrowserRouter>
                            <ErrorBoundary>
                                <App />
                            </ErrorBoundary>
                        </BrowserRouter>
                    </AuthProvider>
                </ToastProvider>
            </ConfirmProvider>
        </QueryClientProvider>
    </StrictMode>
);
