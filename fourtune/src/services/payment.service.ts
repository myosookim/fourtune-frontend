import { axiosClient } from './axiosClient';
import { type PaymentDto, type RefundDto, type WalletResponse } from './api.interface';

export const paymentService = {
    confirmPayment: async (paymentKey: string, orderId: string, amount: number): Promise<void> => {
        await axiosClient.post('/api/payments/toss/confirm', { paymentKey, orderId, amount });
    },

    getPayments: async (): Promise<PaymentDto[]> => {
        const response = await axiosClient.get('/api/payments');
        return response.data.data;
    },

    getRefunds: async (): Promise<RefundDto[]> => {
        const response = await axiosClient.get('/api/payments/refunds');
        return response.data.data;
    },

    // Wallet
    getWalletBalance: async (): Promise<WalletResponse> => {
        const response = await axiosClient.get('/api/payments/wallets/balance');
        return response.data.data;
    },

    getWalletHistory: async (): Promise<WalletResponse> => {
        const response = await axiosClient.get('/api/payments/wallets/history');
        return response.data.data;
    },

    getWalletSummary: async (): Promise<WalletResponse> => {
        const response = await axiosClient.get('/api/payments/wallets/summary');
        return response.data.data;
    },
};
