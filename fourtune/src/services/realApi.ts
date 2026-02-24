import axios from 'axios';
import { type ApiService } from './api.interface';

// Use VITE_BACKEND_URL environment variable for backend server address
// This keeps the backend URL secure and not exposed in the codebase
const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
const client = axios.create({
    baseURL: backendUrl,
});

// Request interceptor to add token
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const realApi: ApiService = {
    searchAuctions: async (params) => {
        const queryParams: any = {
            keyword: params.keyword || undefined,
            searchPriceRange: undefined, // Add if needed
            sort: params.sort || 'LATEST',
            page: (params.page || 0) + 1,
            size: params.size || 12,
        };

        if (params.category && (params.category as string) !== '') queryParams.categories = params.category;
        if (params.status && (params.status as string) !== '') queryParams.statuses = params.status;

        const response = await client.get('/api/v1/search/auction-items', { params: queryParams });
        const data = response.data; // SearchResultPage

        // Map backend SearchAuctionItemView to frontend AuctionItem interface
        const items = data.items.map((item: any) => ({
            auctionItemId: item.auctionItemId,
            title: item.title,
            description: item.description,
            category: item.category,
            status: item.status,
            startPrice: item.startPrice,
            currentPrice: item.currentPrice,
            startAt: item.startAt || '',
            endAt: item.endAt || '',
            imageUrls: item.thumbnailUrl ? [item.thumbnailUrl] : [], // Map thumbnail to array
            createdAt: item.createdAt || '',
            updatedAt: item.updatedAt || '',
            sellerName: item.sellerName,
            sellerId: item.sellerId,
            buyNowPrice: item.buyNowPrice,
            viewCount: item.viewCount,
            bidCount: item.bidCount,
            wishlistCount: item.wishlistCount,
            // Additional fields from ES view if needed in UI: viewCount, etc.
        }));

        return {
            items,
            page: data.page - 1,   // Convert back to 0-based
            size: data.size,
            totalPages: Math.ceil(data.totalElements / data.size) // Calculate totalPages from totalElements
        };
    },

    getAuctionById: async (id: number) => {
        const response = await client.get(`/api/v1/auctions/${id}`);
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
            // These fields are not in the detail response but required by interface
            createdAt: '',
            updatedAt: '',
            buyNowPrice: data.buyNowPrice,
            sellerName: data.sellerNickname,
            sellerId: data.sellerId,
            bidUnit: data.bidUnit,
            viewCount: data.viewCount,
            bidCount: data.bidCount,
            wishlistCount: data.watchlistCount, // Backend field name is watchlistCount
        };
    },

    createAuction: async (data, images) => {
        const formData = new FormData();

        // Clean up data and map fields to backend DTO

        const payload = {
            title: data.title,
            description: data.description,
            category: data.category,
            start_price: data.startPrice,
            bid_unit: data.bidUnit,
            buy_now_price: data.buyNowPrice || undefined,
            auction_start_time: `${data.startAt}:00`,
            auction_end_time: `${data.endAt}:00`,
        };

        console.log('Sending createAuction payload:', payload);

        // Add JSON data as a blob with proper content type
        const requestBlob = new Blob([JSON.stringify(payload)], {
            type: 'application/json'
        });
        formData.append('request', requestBlob, 'request.json');

        // Add image files if provided
        if (images && images.length > 0) {
            images.forEach((image) => {
                formData.append('images', image);
            });
        }

        const response = await client.post('/api/v1/auctions', formData);
        const responseData = response.data;

        // Map backend response to AuctionItem interface
        return {
            auctionItemId: responseData.id || responseData.auctionItemId,
            title: responseData.title,
            description: responseData.description,
            category: responseData.category,
            status: responseData.status || 'SCHEDULED',
            startPrice: responseData.startPrice,
            currentPrice: responseData.currentPrice || responseData.startPrice,
            startAt: responseData.auctionStartTime || data.startAt,
            endAt: responseData.auctionEndTime || data.endAt,
            imageUrls: responseData.imageUrls || [],
            createdAt: responseData.createdAt || new Date().toISOString(),
            updatedAt: responseData.updatedAt || new Date().toISOString()
        } as any;
    },

    increaseViewCount: async (auctionId: number) => {
        // Backend uses PATCH /api/v1/auctions/{id}/view
        await client.patch(`/api/v1/auctions/${auctionId}/view`);
    },

    toggleWishlist: async (auctionId: number) => {
        const response = await client.post('/api/v1/watch-lists/toggle', { auction_item_id: auctionId });
        return response.data; // Returns message string
    },

    getMyWishlist: async () => {
        const response = await client.get('/api/v1/watch-lists');
        // response.data is List<WatchListResponseDto>
        // assume WatchListResponseDto has auctionItemId or id
        // Let's verify DTO. But usually it's list of objects.
        // Assuming user wants IDs to check inclusion.
        return response.data.map((item: any) => item.auctionItemId);
    },

    login: async (email, password) => {
        const response = await client.post('/api/auth/login', { email, password });
        // The backend uses SNAKE_CASE, so the token is in access_token
        const accessToken = response.data.access_token || response.data.accessToken;

        if (!accessToken) {
            console.error('Login response missing token:', response.data);
            throw new Error('로그인 응답에 토큰이 없습니다.');
        }

        localStorage.setItem('token', accessToken);

        // Clear potential stale user data
        localStorage.removeItem('user');

        let user = { email, name: 'User', id: 0 };

        try {
            // Try to extract ID from token
            const payload = parseJwt(accessToken);
            const userId = payload.sub ? Number(payload.sub) : 0;

            if (userId && !isNaN(userId)) {
                // Fetch full user details
                try {
                    const userDetail = await realApi.getUser(userId);
                    user = {
                        email: userDetail.email,
                        name: userDetail.nickname,
                        id: userDetail.id
                    };
                    // Store user info for persistence
                    localStorage.setItem('user', JSON.stringify(user));
                } catch (fetchErr) {
                    console.error('Failed to fetch user details after login', fetchErr);
                    // Fallback to basic info from token if available
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

    signup: async (nickname, email, password, phoneNumber) => {
        // Backend returns Void (201 Created)
        await client.post('/api/users/signup', { nickname, email, password, phone_number: phoneNumber });
        return { user: { email, name: nickname } };
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Optional: Call network logout if needed
        // client.post('/api/auth/logout').catch(() => {});
    },

    isAuthenticated: () => {
        const token = localStorage.getItem('token');
        return !!token && token !== 'undefined';
    },

    getCurrentUser: () => {
        // 1. Try to get from localStorage (set during login)
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                console.error('Failed to parse user from storage');
            }
        }

        // 2. Fallback: Parse token
        const token = localStorage.getItem('token');
        if (token && token !== 'undefined') {
            try {
                const payload = parseJwt(token);
                // backend: subject is userId (string)
                console.log('realApi: Token payload', payload);
                const userId = payload.sub ? Number(payload.sub) : undefined;

                const user = {
                    id: userId,
                    email: payload.email || '',
                    name: payload.name || 'User'
                };

                // If we parsed successfully, might as well save it to avoid re-parsing
                if (userId && !isNaN(userId)) {
                    // Check if we need to fetch name? 
                    // users might not have name in token. 
                    // We let the UI handle the fetch if needed.
                }

                if (payload && (userId || payload.email)) {
                    return user;
                }
            } catch (e) {
                console.error('Failed to parse token', e);
            }
        }
        return null;
    },

    getUser: async (id: number) => {
        const response = await client.get(`/api/users/${id}`);
        const data = response.data;
        return {
            id: data.id,
            email: data.email,
            nickname: data.nickname,
            phoneNumber: data.phoneNumber || '',
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            status: data.status,
        };
    },

    updateProfile: async (nickname: string, phoneNumber: string) => {
        await client.patch('/api/users/profile', { nickname, phone_number: phoneNumber });
        // Update local storage user name
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
        await client.patch('/api/users/password', { current_password: currentPassword, new_password: newPassword });
    },

    withdraw: async (password: string, reason?: string) => {
        await client.delete('/api/users/withdraw', { data: { password, reason } });
        realApi.logout();
    },

    // Bidding Implementation
    placeBid: async (auctionId: number, bidAmount: number) => {
        const response = await client.post('/api/v1/bids', { auction_id: auctionId, bid_amount: bidAmount });
        return response.data.data; // ApiResponse<BidDetailResponse>
    },

    getMyBids: async () => {
        const response = await client.get('/api/v1/bids/my');
        return response.data.data; // ApiResponse<List<BidResponse>>
    },

    getAuctionBids: async (auctionId: number) => {
        const response = await client.get(`/api/v1/bids/auction/${auctionId}`);
        return response.data.data; // ApiResponse<BidHistoryResponse>
    },

    buyNow: async (auctionId: number) => {
        const response = await client.post(`/api/v1/auctions/${auctionId}/buy-now`);
        return response.data; // orderId string
    },

    getPublicOrder: async (orderId: string) => {
        const response = await client.get(`/api/v1/orders/public/${orderId}`);
        return response.data.data; // ApiResponse.success(data) -> data
    },

    getOrderByAuctionId: async (auctionId: number) => {
        const response = await client.get(`/api/v1/orders/auction/${auctionId}`);
        return response.data.data;
    },

    getOrderById: async (orderId: string) => {
        const response = await client.get(`/api/v1/orders/${orderId}`);
        return response.data.data;
    },

    confirmPayment: async (paymentKey: string, orderId: string, amount: number) => {
        await client.post('/api/payments/toss/confirm', {
            paymentKey,
            orderId,
            amount
        });
    },

    getMyOrders: async () => {
        const response = await client.get('/api/v1/orders/my');
        return response.data.data; // ApiResponse<List<OrderResponse>>
    },

    // Cart Implementation
    getCart: async () => {
        const response = await client.get('/api/v1/cart');
        return response.data.data; // ApiResponse<CartResponse>
    },

    getCartItemCount: async () => {
        const response = await client.get('/api/v1/cart/count');
        return response.data.data; // ApiResponse<Integer>
    },

    addItemToCart: async (auctionId: number) => {
        await client.post('/api/v1/cart/items', { auctionId });
    },

    removeItemFromCart: async (cartItemId: number) => {
        await client.delete(`/api/v1/cart/items/${cartItemId}`);
    },

    buyNowFromCart: async (cartItemIds: number[]) => {
        const response = await client.post('/api/v1/cart/buy-now', { cart_item_ids: cartItemIds });
        return response.data.data; // ApiResponse<List<String>> (orderIds)
    },

    buyNowAllCart: async () => {
        const response = await client.post('/api/v1/cart/buy-now/all');
        return response.data.data; // ApiResponse<List<String>> (orderIds)
    },

    clearExpiredItems: async () => {
        await client.delete('/api/v1/cart/expired');
    },

    // Settlement Implementation
    getSettlementHistory: async () => {
        const response = await client.get('/api/settlements/latest');
        return response.data.data; // ApiResponse<SettlementResponse>
    },

    getAllSettlements: async () => {
        const response = await client.get('/api/settlements/history');
        return response.data.data; // ApiResponse<List<SettlementResponse>>
    },

    getSettlementPendings: async () => {
        const response = await client.get('/api/settlements/pendings');
        return response.data.data; // ApiResponse<List<SettlementCandidatedItemDto>>
    },

    // Wallet & Payments
    getWalletBalance: async () => {
        const response = await client.get('/api/payments/wallets/balance');
        return response.data.data;
    },

    getWalletHistory: async () => {
        const response = await client.get('/api/payments/wallets/history');
        return response.data.data;
    },

    getWalletSummary: async () => {
        const response = await client.get('/api/payments/wallets/summary');
        return response.data.data;
    },

    getPayments: async () => {
        const response = await client.get('/api/payments');
        return response.data.data;
    },

    getRefunds: async () => {
        const response = await client.get('/api/payments/refunds');
        return response.data.data;
    },

    // Notifications
    getMyNotifications: async () => {
        const response = await client.get('/api/v1/notifications');
        return response.data; // Backend returns List<NotificationResponseDto> directly (not wrapped in data)
    },

    readNotification: async (notificationId: number) => {
        await client.patch(`/api/v1/notifications/${notificationId}/read`);
    },

    deleteNotification: async (notificationId: number) => {
        await client.delete(`/api/v1/notifications/${notificationId}`);
    },

    getNotificationSettings: async () => {
        const response = await client.get('/api/v1/notifications/settings');
        return response.data; // NotificationSettingsResponse
    },

    updateNotificationSettings: async (settings) => {
        await client.patch('/api/v1/notifications/settings', settings);
    },

    registerFcmToken: async (token: string) => {
        await client.post('/api/v1/notifications/token', { token });
    }
};

function parseJwt(token: string) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}
