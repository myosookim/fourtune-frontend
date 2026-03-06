import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

export const axiosClient = axios.create({
    baseURL: backendUrl,
});

// Request interceptor to add token
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
