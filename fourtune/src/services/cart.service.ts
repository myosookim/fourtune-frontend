import { axiosClient } from './axiosClient';
import { type CartResponse } from '../types';

export const cartService = {
    getCart: async (): Promise<CartResponse> => {
        const response = await axiosClient.get('/api/v1/cart');
        return response.data.data;
    },

    getCartItemCount: async (): Promise<number> => {
        const response = await axiosClient.get('/api/v1/cart/count');
        return response.data.data;
    },

    addItemToCart: async (auctionId: number): Promise<void> => {
        await axiosClient.post('/api/v1/cart/items', { auctionId });
    },

    removeItemFromCart: async (cartItemId: number): Promise<void> => {
        await axiosClient.delete(`/api/v1/cart/items/${cartItemId}`);
    },

    buyNowFromCart: async (cartItemIds: number[]): Promise<string[]> => {
        const response = await axiosClient.post('/api/v1/cart/buy-now', { cartItemIds });
        return response.data.data;
    },

    buyNowAllCart: async (): Promise<string[]> => {
        const response = await axiosClient.post('/api/v1/cart/buy-now/all');
        return response.data.data;
    },

    clearExpiredItems: async (): Promise<void> => {
        await axiosClient.delete('/api/v1/cart/expired');
    }
};
