import axios, { type AxiosError } from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

export const axiosClient = axios.create({
    baseURL: backendUrl,
});

// Request interceptor: attach JWT token
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response 인터셉터 : 전역 error 처리
axiosClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const status = error.response?.status;

        if (status === 401) {
            // 로그인/회원가입 요청 자체의 401은 제외 (잘못된 비밀번호 등)
            const url = error.config?.url || '';
            const isAuthEndpoint = url.includes('/api/auth/') || url.includes('/api/users/signup');

            if (!isAuthEndpoint) {
                // Token expired or invalid — clear session and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }

        // Propagate error so individual components/queries can still handle it
        return Promise.reject(error);
    }
);
