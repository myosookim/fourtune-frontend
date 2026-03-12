import { axiosClient } from './axiosClient';
import { parseJwt } from './auth.utils';
import { type UserDetail } from './api.interface';

export const userService = {
    login: async (email: string, password?: string) => {
        const response = await axiosClient.post('/api/auth/login', { email, password });
        const accessToken = response.data.accessToken;

        if (!accessToken) {
            throw new Error('로그인 응답에 토큰이 없습니다.');
        }

        localStorage.setItem('token', accessToken);
        localStorage.removeItem('user');

        let user = { email, name: 'User', id: 0 };

        try {
            const payload = parseJwt(accessToken);
            const userId = payload.sub ? Number(payload.sub) : 0;

            if (userId && !isNaN(userId)) {
                try {
                    const userDetail = await userService.getUser(userId);
                    user = {
                        email: userDetail.email,
                        name: userDetail.nickname,
                        id: userDetail.id
                    };
                    localStorage.setItem('user', JSON.stringify(user));
                } catch (fetchErr) {
                    user.id = userId;
                    if (payload.email) user.email = payload.email;
                    if (payload.name) user.name = payload.name;
                    localStorage.setItem('user', JSON.stringify(user));
                }
            }
        } catch (e) {
            console.error('Error processing login user data', e);
        }

        return { user };
    },

    signup: async (nickname: string, email: string, password?: string, phoneNumber?: string) => {
        await axiosClient.post('/api/users/signup', { nickname, email, password, phoneNumber });
        return { user: { email, name: nickname } };
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getUser: async (id: number): Promise<UserDetail> => {
        const response = await axiosClient.get(`/api/users/${id}`);
        return response.data;
    },

    updateProfile: async (nickname: string, phoneNumber: string) => {
        await axiosClient.patch('/api/users/profile', { nickname, phoneNumber });
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                user.name = nickname;
                localStorage.setItem('user', JSON.stringify(user));
            } catch (e) { }
        }
    },

    changePassword: async (currentPassword: string, newPassword: string) => {
        await axiosClient.patch('/api/users/password', { currentPassword, newPassword });
    },

    withdraw: async (password: string, reason?: string) => {
        await axiosClient.delete('/api/users/withdraw', { data: { password, reason } });
        userService.logout();
    },

    getWalletBalance: async () => {
        const response = await axiosClient.get('/api/payments/wallets/balance');
        return response.data.data;
    },

    getWalletHistory: async () => {
        const response = await axiosClient.get('/api/payments/wallets/history');
        return response.data.data;
    },

    getWalletSummary: async () => {
        const response = await axiosClient.get('/api/payments/wallets/summary');
        return response.data.data;
    }
};
