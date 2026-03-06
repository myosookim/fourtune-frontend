import { axiosClient } from './axiosClient';
import { type NotificationResponseDto, type NotificationSettingsResponse } from './api.interface';

export const notificationService = {
    getMyNotifications: async (): Promise<NotificationResponseDto[]> => {
        const response = await axiosClient.get('/api/v1/notifications');
        return response.data;
    },

    readNotification: async (notificationId: number): Promise<void> => {
        await axiosClient.patch(`/api/v1/notifications/${notificationId}/read`);
    },

    deleteNotification: async (notificationId: number): Promise<void> => {
        await axiosClient.delete(`/api/v1/notifications/${notificationId}`);
    },

    getNotificationSettings: async (): Promise<NotificationSettingsResponse> => {
        const response = await axiosClient.get('/api/v1/notifications/settings');
        return response.data;
    },

    updateNotificationSettings: async (settings: NotificationSettingsResponse): Promise<void> => {
        await axiosClient.patch('/api/v1/notifications/settings', settings);
    },

    registerFcmToken: async (token: string): Promise<void> => {
        await axiosClient.post('/api/v1/notifications/token', { token });
    }
};
