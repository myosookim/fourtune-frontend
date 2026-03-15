import { axiosClient } from './axiosClient';
import { type SettlementResponse, type SettlementCandidatedItemDto } from '../types';

export const settlementService = {
    getSettlementHistory: async (): Promise<SettlementResponse> => {
        const response = await axiosClient.get('/api/settlements/latest');
        return response.data.data;
    },

    getAllSettlements: async (): Promise<SettlementResponse[]> => {
        const response = await axiosClient.get('/api/settlements/history');
        return response.data.data;
    },

    getSettlementPendings: async (): Promise<SettlementCandidatedItemDto[]> => {
        const response = await axiosClient.get('/api/settlements/pendings');
        return response.data.data;
    },
};
