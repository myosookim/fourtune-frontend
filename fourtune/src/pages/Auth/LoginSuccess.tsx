import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginSuccess: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { checkAuth } = useAuth();

    useEffect(() => {
        const accessToken = searchParams.get('accessToken');

        if (accessToken) {
            // 토큰을 저장한 뒤 AuthContext 상태를 동기화
            localStorage.setItem('token', accessToken);
            checkAuth(); // user state 갱신 → isAuthenticated 반응
            navigate('/');
        } else {
            // 로그인 실패
            navigate('/login');
        }
    }, [searchParams, navigate, checkAuth]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontSize: '1.2rem'
        }}>
            로그인 처리 중...
        </div>
    );
};

export default LoginSuccess;
