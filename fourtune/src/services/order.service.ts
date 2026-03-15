import { axiosClient } from './axiosClient';
import { type OrderDetailResponse, type OrderResponse } from './api.interface';
import { type BidResponse } from '../types';

export const orderService = {
    buyNow: async (auctionId: number): Promise<string> => {
        const response = await axiosClient.post(`/api/v1/auctions/${auctionId}/buy-now`);
        return response.data;
    },

    getOrderById: async (orderId: string): Promise<OrderDetailResponse> => {
        const response = await axiosClient.get(`/api/v1/orders/${orderId}`);
        return response.data.data;
    },

    getPublicOrder: async (orderId: string): Promise<OrderDetailResponse> => {
        const response = await axiosClient.get(`/api/v1/orders/public/${orderId}`);
        return response.data.data;
    },

    getOrderByAuctionId: async (auctionId: number): Promise<OrderDetailResponse> => {
        const response = await axiosClient.get(`/api/v1/orders/auction/${auctionId}`);
        return response.data.data;
    },

    cancelOrder: async (orderId: string): Promise<void> => {
        await axiosClient.post(`/api/v1/orders/${orderId}/cancel`);
    },

    getMyOrders: async (): Promise<OrderResponse[]> => {
        const response = await axiosClient.get('/api/v1/orders/my');
        return response.data.data;
    },

    getMyBids: async (): Promise<BidResponse[]> => {
        const response = await axiosClient.get('/api/v1/bids/my');
        return response.data.data;
    },
};

