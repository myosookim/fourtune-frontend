import { axiosClient } from './axiosClient';

export const searchService = {
    getRecentSearches: async (): Promise<string[]> => {
        const response = await axiosClient.get('/api/v1/search/recent');
        return response.data.data;
    },

    deleteRecentSearch: async (keyword: string): Promise<void> => {
        await axiosClient.delete('/api/v1/search/recent', { params: { keyword } });
    },

    deleteAllRecentSearches: async (): Promise<void> => {
        await axiosClient.delete('/api/v1/search/recent/all');
    }
};
