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
            // TODO: 트래픽/상품 수가 증가하면 staleTime 도입 검토 (예: staleTime: 60 * 1000)
            // 현재는 항상 최신 데이터를 보장하기 위해 기본값(0) 사용
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
