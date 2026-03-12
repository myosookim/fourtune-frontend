import { axiosClient } from './axiosClient';
import {
    type AuctionItem,
    type SearchResponse,
    type BidDetailResponse,
    type BidResponse,
    type BidHistoryResponse,
    AuctionCategory,
    AuctionStatus
} from '../types';

export const auctionService = {
    searchAuctions: async (params: {
        page?: number;
        size?: number;
        keyword?: string;
        category?: AuctionCategory;
        status?: AuctionStatus;
        sort?: string;
        sellerName?: string;
    }): Promise<SearchResponse> => {
        const queryParams: any = {
            keyword: params.keyword || undefined,
            sort: params.sort || 'LATEST',
            page: (params.page || 0) + 1,
            size: params.size || 12,
        };

        if (params.category && (params.category as string) !== '') queryParams.categories = params.category;
        if (params.status && (params.status as string) !== '') queryParams.statuses = params.status;
        if (params.sellerName) queryParams.sellerName = params.sellerName;

        const response = await axiosClient.get('/api/v1/search/auction-items', { params: queryParams });
        const data = response.data;

        const content = (data.items || []).map((item: any) => ({
            auctionItemId: item.auctionItemId,
            title: item.title,
            description: item.description,
            category: item.category,
            status: item.status,
            startPrice: item.startPrice,
            currentPrice: item.currentPrice,
            startAt: item.startAt || '',
            endAt: item.endAt || '',
            imageUrls: item.thumbnailUrl ? [item.thumbnailUrl] : [],
            createdAt: item.createdAt || '',
            updatedAt: item.updatedAt || '',
            sellerName: item.sellerName,
            sellerId: item.sellerId,
            buyNowPrice: item.buyNowPrice,
            viewCount: item.viewCount,
            bidCount: item.bidCount,
            watchlistCount: item.wishlistCount,
        }));

        return {
            content,
            page: data.page - 1,
            size: data.size,
            totalElements: data.totalElements,
            totalPages: Math.ceil(data.totalElements / data.size)
        };
    },

    getMyAuctions: async (params: any = {}): Promise<SearchResponse> => {
        const queryParams: any = {
            page: params.page || 0,
            size: params.size || 20,
        };
        if (params.status) queryParams.status = params.status;

        const response = await axiosClient.get('/api/v1/auctions/me', { params: queryParams });
        const data = response.data;

        const content = (data.content || []).map((item: any) => ({
            auctionItemId: item.id ?? item.auctionItemId,
            title: item.title,
            description: item.description,
            category: item.category,
            status: item.status,
            startPrice: item.startPrice,
            currentPrice: item.currentPrice,
            startAt: item.auctionStartTime || item.startAt || '',
            endAt: item.auctionEndTime || item.endAt || '',
            imageUrls: item.thumbnailUrl ? [item.thumbnailUrl] : (item.imageUrls || []),
            createdAt: item.createdAt || '',
            updatedAt: item.updatedAt || '',
            sellerName: item.sellerNickname || item.sellerName,
            sellerId: item.sellerId,
            buyNowPrice: item.buyNowPrice,
            viewCount: item.viewCount,
            bidCount: item.bidCount,
            watchlistCount: item.watchlistCount,
        }));

        return {
            content,
            page: data.pageable?.pageNumber ?? 0,
            size: data.size ?? queryParams.size,
            totalElements: data.totalElements ?? content.length,
            totalPages: data.totalPages ?? 1,
        };
    },

    getAuctionById: async (id: number): Promise<AuctionItem> => {
        const response = await axiosClient.get(`/api/v1/auctions/${id}`);
        const data = response.data;

        return {
            auctionItemId: data.id,
            title: data.title,
            description: data.description,
            category: data.category,
            status: data.status,
            startPrice: data.startPrice,
            currentPrice: data.currentPrice,
            startAt: data.auctionStartTime,
            endAt: data.auctionEndTime,
            imageUrls: data.imageUrls || [],
            createdAt: '',
            updatedAt: '',
            buyNowPrice: data.buyNowPrice,
            sellerName: data.sellerNickname,
            sellerId: data.sellerId,
            bidUnit: data.bidUnit,
            viewCount: data.viewCount,
            bidCount: data.bidCount,
            watchlistCount: data.watchlistCount,
        };
    },

    createAuction: async (data: any, images?: File[]): Promise<AuctionItem> => {
        const formData = new FormData();
        const payload = {
            title: data.title,
            description: data.description,
            category: data.category,
            startPrice: data.startPrice,
            bidUnit: data.bidUnit,
            buyNowPrice: data.buyNowPrice || undefined,
            auctionStartTime: `${data.startAt}:00`,
            auctionEndTime: `${data.endAt}:00`,
        };

        const requestBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        formData.append('request', requestBlob, 'request.json');

        if (images && images.length > 0) {
            images.forEach((image) => formData.append('images', image));
        }

        const response = await axiosClient.post('/api/v1/auctions', formData);
        const resData = response.data;

        return {
            auctionItemId: resData.id,
            title: resData.title,
            description: resData.description,
            category: resData.category,
            status: resData.status,
            startPrice: resData.startPrice,
            currentPrice: resData.currentPrice,
            startAt: resData.auctionStartTime,
            endAt: resData.auctionEndTime,
            imageUrls: resData.imageUrls || [],
            createdAt: '',
            updatedAt: '',
            buyNowPrice: resData.buyNowPrice,
            sellerName: resData.sellerNickname,
            sellerId: resData.sellerId,
            bidUnit: resData.bidUnit,
            viewCount: resData.viewCount,
            bidCount: resData.bidCount,
            watchlistCount: resData.watchlistCount,
        };
    },

    updateAuction: async (id: number, data: any, images?: File[]): Promise<AuctionItem> => {
        const formData = new FormData();
        const payload: any = { ...data };
        if (data.startAt) payload.auctionStartTime = `${data.startAt}:00`;
        if (data.endAt) payload.auctionEndTime = `${data.endAt}:00`;

        const requestBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        formData.append('request', requestBlob, 'request.json');

        if (images && images.length > 0) {
            images.forEach((image) => formData.append('images', image));
        }

        const response = await axiosClient.put(`/api/v1/auctions/${id}`, formData);
        const resData = response.data;

        return {
            auctionItemId: resData.id,
            title: resData.title,
            description: resData.description,
            category: resData.category,
            status: resData.status,
            startPrice: resData.startPrice,
            currentPrice: resData.currentPrice,
            startAt: resData.auctionStartTime,
            endAt: resData.auctionEndTime,
            imageUrls: resData.imageUrls || [],
            createdAt: '',
            updatedAt: '',
            buyNowPrice: resData.buyNowPrice,
            sellerName: resData.sellerNickname,
            sellerId: resData.sellerId,
            bidUnit: resData.bidUnit,
            viewCount: resData.viewCount,
            bidCount: resData.bidCount,
            watchlistCount: resData.watchlistCount,
        };
    },

    deleteAuction: async (id: number): Promise<void> => {
        await axiosClient.delete(`/api/v1/auctions/${id}`);
    },

    increaseViewCount: async (id: number): Promise<void> => {
        await axiosClient.patch(`/api/v1/auctions/${id}/view`);
    },

    placeBid: async (auctionId: number, bidAmount: number): Promise<BidDetailResponse> => {
        const response = await axiosClient.post('/api/v1/bids', { auctionId, bidAmount });
        return response.data.data;
    },

    getAuctionBids: async (auctionId: number): Promise<BidHistoryResponse> => {
        const response = await axiosClient.get(`/api/v1/bids/auction/${auctionId}`);
        return response.data.data;
    },

    getHighestBid: async (auctionId: number): Promise<BidResponse> => {
        const response = await axiosClient.get(`/api/v1/bids/auction/${auctionId}/highest`);
        return response.data.data;
    },

    getBidById: async (bidId: number): Promise<BidResponse> => {
        const response = await axiosClient.get(`/api/v1/bids/${bidId}`);
        return response.data.data;
    },

    cancelBid: async (bidId: number): Promise<void> => {
        await axiosClient.delete(`/api/v1/bids/${bidId}`);
    },

    toggleWatchlist: async (auctionId: number): Promise<boolean> => {
        const response = await axiosClient.post('/api/v1/watch-lists/toggle', { auctionItemId: auctionId });
        return response.data;
    },

    getMyWatchlist: async (): Promise<number[]> => {
        const response = await axiosClient.get('/api/v1/watch-lists');
        return (response.data || []).map((item: any) => item.itemId);
    },

    getRecommendations: async (size = 10): Promise<AuctionItem[]> => {
        const response = await axiosClient.get('/api/v1/recommendations', { params: { size } });
        return mapRecommendationItems(response.data);
    },

    getPopularRecommendations: async (size = 10): Promise<AuctionItem[]> => {
        const response = await axiosClient.get('/api/v1/recommendations/popular', { params: { size } });
        return mapRecommendationItems(response.data);
    }
};

const mapRecommendationItems = (items: any[]): AuctionItem[] => {
    return items.map((item: any) => ({
        auctionItemId: item.auctionItemId,
        title: item.title,
        description: '',
        category: item.category,
        status: item.status,
        startPrice: 0,
        currentPrice: item.currentPrice,
        buyNowPrice: item.buyNowPrice,
        startAt: item.startAt || '',
        endAt: item.endAt || '',
        imageUrls: item.thumbnailUrl ? [item.thumbnailUrl] : [],
        createdAt: '',
        updatedAt: '',
        sellerName: '',
        sellerId: 0,
        viewCount: item.viewCount,
        bidCount: item.bidCount,
        watchlistCount: item.watchlistCount,
    }));
};
