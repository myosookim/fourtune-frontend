import React, { useEffect, useRef } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingIndicator } from './LoadingIndicator/LoadingIndicator';
import { useToast } from '../../contexts/ToastContext';

export const PrivateRoute: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const { showToast } = useToast();
    const hasShownToast = useRef(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated && !hasShownToast.current) {
            hasShownToast.current = true;
            showToast('로그인이 필요한 서비스입니다.', 'info');
        }
    }, [isLoading, isAuthenticated, showToast]);

    if (isLoading) {
        return <LoadingIndicator />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
