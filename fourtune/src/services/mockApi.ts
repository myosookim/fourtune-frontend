import { MOCK_AUCTIONS } from './mockData';
import { type ApiService } from './api.interface';
import { AuctionStatus, CartItemStatus, type CartItemResponse } from '../types';


// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_CART_KEY = 'mock_cart_v1';

interface MockCartItem {
    id: number; // cartItemId
    auctionId: number;
    buyNowPrice: number;
    addedAt: string;
}

const getMockCartItems = (): MockCartItem[] => {
    try {
        const saved = localStorage.getItem(MOCK_CART_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
};

const saveMockCartItems = (items: MockCartItem[]) => {
    localStorage.setItem(MOCK_CART_KEY, JSON.stringify(items));
};

export const mockApi: ApiService = {
    searchAuctions: async (params) => {
        await delay(500);
        let filtered = [...MOCK_AUCTIONS];

        // Filter by Keyword
        if (params.keyword) {
            const lower = params.keyword.toLowerCase();
            filtered = filtered.filter(a =>
                a.title.toLowerCase().includes(lower) ||
                a.description.toLowerCase().includes(lower)
            );
        }

        // Filter by Category
        if (params.category) filtered = filtered.filter(a => a.category === params.category);

        // Filter by Status
        if (params.status) filtered = filtered.filter(a => a.status === params.status);

        // Filter by Seller Name
        if (params.sellerName) filtered = filtered.filter(a => a.sellerName === params.sellerName);

        // Sort
        if (params.sort === 'POPULAR') {
            filtered.sort((a, b) => b.currentPrice - a.currentPrice); // Mock popular by price
        } else {
            // Default LATEST (Sort by createdAt desc)
            filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        // Pagination
        const page = params.page || 0;
        const size = params.size || 10;
        const start = page * size;
        const end = start + size;
        const content = filtered.slice(start, end);
        const totalElements = filtered.length;
        const totalPages = Math.ceil(filtered.length / size);

        return {
            content,
            totalElements,
            totalPages,
            size,
            page
        };
    },

    getAuctionById: async (id: number) => {
        await delay(500);
        const item = MOCK_AUCTIONS.find(a => a.auctionItemId === id);
        if (!item) throw new Error('Auction not found');
        return item;
    },

    createAuction: async (data, images) => {
        await delay(800);

        // Check authentication
        if (!mockApi.isAuthenticated()) {
            throw new Error('로그인이 필요합니다.');
        }

        // Create mock auction item
        const newAuction = {
            auctionItemId: Date.now(),
            title: data.title,
            description: data.description,
            category: data.category,
            status: 'SCHEDULED' as const,
            startPrice: data.startPrice,
            currentPrice: data.startPrice,
            startAt: data.startAt,
            endAt: data.endAt,
            imageUrls: images ? images.map((_, i) => `https://picsum.photos/800/600?random=${Date.now() + i}`) : [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sellerName: mockApi.getCurrentUser()?.name || 'Me',
            bidUnit: data.bidUnit || 1000,
            viewCount: 0,
            watchlistCount: 0,
            bidCount: 0,
        };

        // In a real scenario, this would be added to the backend
        // For mock, we'll just return it
        return newAuction;
    },

    updateAuction: async (id, data, images) => {
        await delay(800);
        const auction = MOCK_AUCTIONS.find(a => a.auctionItemId === id);
        if (!auction) throw new Error('Auction not found');

        if (data.title) auction.title = data.title;
        if (data.description) auction.description = data.description;
        if (images) auction.imageUrls = images.map((_, i) => `https://picsum.photos/800/600?random=${Date.now() + i}`);

        return auction;
    },

    deleteAuction: async (id: number) => {
        await delay(500);
        console.log(`Mock: Auction ${id} deleted`);
    },

    increaseViewCount: async (auctionId: number) => {
        await delay(300);
        const auction = MOCK_AUCTIONS.find(a => a.auctionItemId === auctionId);
        if (auction) {
            auction.viewCount = (auction.viewCount || 0) + 1;
        }
    },

    toggleWatchlist: async (auctionId: number) => {
        await delay(300);
        const auction = MOCK_AUCTIONS.find(a => a.auctionItemId === auctionId);
        if (auction) {
            const count = (auction.watchlistCount || 0);

            // Check localStorage for mock consistency
            const saved = localStorage.getItem('watchlist');
            let watchlist: number[] = saved ? JSON.parse(saved) : [];

            if (watchlist.includes(auctionId)) {
                // It's liked, so unlike
                auction.watchlistCount = Math.max(0, count - 1);
                // Sync LS
                watchlist = watchlist.filter(id => id !== auctionId);
                localStorage.setItem('watchlist', JSON.stringify(watchlist));
                return "관심상품이 해제되었습니다.";
            } else {
                // Like
                auction.watchlistCount = count + 1;
                // Sync LS
                if (!watchlist.includes(auctionId)) watchlist.push(auctionId);
                localStorage.setItem('watchlist', JSON.stringify(watchlist));
                return "관심상품에 등록되었습니다.";
            }
        }
        return "";
    },

    getMyWatchlist: async () => {
        await delay(300);
        const saved = localStorage.getItem('watchlist');
        return saved ? JSON.parse(saved) : [];
    },

    // Mock Auth
    login: async (email: string) => {
        await delay(800);
        const user = { email, name: 'Test User' };
        localStorage.setItem('token', 'mock-jwt-token');
        localStorage.setItem('user', JSON.stringify(user));
        return { user };
    },

    signup: async (nickname: string, email: string) => {
        await delay(800);
        const user = { email, name: nickname };
        localStorage.setItem('token', 'mock-jwt-token');
        localStorage.setItem('user', JSON.stringify(user));
        return { user };
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    isAuthenticated: () => !!localStorage.getItem('token'),

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    getUser: async (id: number) => {
        await delay(500);
        return {
            id,
            email: 'mock@example.com',
            nickname: 'Mock User',
            phoneNumber: '010-1234-5678',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'ACTIVE'
        };
    },

    updateProfile: async (nickname: string, _phoneNumber: string) => {
        await delay(500);
        const user = mockApi.getCurrentUser();
        if (user) {
            user.name = nickname;
            localStorage.setItem('user', JSON.stringify(user));
        }
    },

    changePassword: async (_currentPassword: string, _newPassword: string) => {
        await delay(500);
    },

    withdraw: async (_password: string, _reason?: string) => {
        await delay(500);
        mockApi.logout();
    },

    // Bidding Mock
    placeBid: async (auctionId: number, bidAmount: number) => {
        await delay(500);
        // Find auction and update price
        const auction = MOCK_AUCTIONS.find(a => a.auctionItemId === auctionId);
        if (!auction) throw new Error("Auction not found");

        if (bidAmount <= auction.currentPrice) {
            throw new Error("입찰가는 현재가보다 높아야 합니다.");
        }

        const unit = auction.bidUnit || 1000;
        if ((bidAmount - auction.currentPrice) % unit !== 0) {
            throw new Error(`입찰가는 현재가에서 ${unit.toLocaleString()}원 단위로 증가해야 합니다.`);
        }

        auction.currentPrice = bidAmount; // Hacky update for mock

        // Mock Response
        return {
            id: Date.now(),
            auctionId: auctionId,
            auctionTitle: auction.title,
            bidderId: 1,
            bidderNickname: "MockUser",
            bidAmount: bidAmount,
            status: "ACTIVE" as const,
            isWinning: true,
            createdAt: new Date().toISOString(),
            message: "현재 최고 입찰자입니다."
        };
    },

    getMyBids: async () => {
        await delay(500);

        // Generate dummy bids based on mock auctions
        const dummyBids = MOCK_AUCTIONS.slice(0, 5).map((auction, index) => {
            const isWinning = index % 2 === 0; // Alternate winning status
            return {
                id: 1000 + index,
                auctionId: auction.auctionItemId,
                auctionTitle: auction.title,
                bidderId: 1,
                bidderNickname: "Me",
                bidAmount: auction.currentPrice - (isWinning ? 0 : 5000), // Winning matches current, losing is lower
                status: "ACTIVE" as const,
                isWinning: isWinning,
                createdAt: new Date(Date.now() - 86400000 * (index + 1)).toISOString()
            };
        });

        return dummyBids;
    },

    getAuctionBids: async (auctionId: number) => {
        await delay(500);
        return {
            auctionId,
            bids: []
        };
    },

    getHighestBid: async (auctionId: number) => {
        await delay(500);
        const auction = MOCK_AUCTIONS.find(a => a.auctionItemId === auctionId);
        return {
            id: 999,
            auctionId,
            auctionTitle: auction?.title || 'Unknown',
            bidderId: 1,
            bidderNickname: 'HighBidder',
            bidAmount: (auction?.currentPrice || 0) + 1000,
            status: 'ACTIVE',
            isWinning: true,
            createdAt: new Date().toISOString()
        };
    },

    getBidById: async (bidId: number) => {
        await delay(500);
        return {
            id: bidId,
            auctionId: 1,
            bidderId: 1,
            bidderNickname: 'Bidder',
            bidAmount: 10000,
            status: 'ACTIVE',
            isWinning: false,
            createdAt: new Date().toISOString()
        };
    },

    cancelBid: async (bidId: number) => {
        await delay(500);
        console.log(`Mock: Bid ${bidId} cancelled`);
    },

    // Mock Payment & Order
    buyNow: async () => {
        await delay(500);
        return `MOCK_ORDER_${Date.now()}`;
    },

    getPublicOrder: async (orderId: string) => {
        await delay(500);
        return {
            id: 12345,
            orderId: orderId,
            auctionId: 1,
            auctionTitle: 'Mock Auction Item',
            thumbnailUrl: 'https://picsum.photos/200/300',
            winnerId: 100,
            winnerNickname: 'MockWinner',
            sellerId: 200,
            sellerNickname: 'MockSeller',
            finalPrice: 10000,
            orderType: 'BUY_NOW',
            status: 'PENDING',
            createdAt: new Date().toISOString()
        };
    },

    getOrderByAuctionId: async (auctionId: number) => {
        await delay(500);
        return {
            id: 12345,
            orderId: `ORDER_${auctionId}`,
            auctionId: auctionId,
            auctionTitle: 'Mock Auction Item',
            thumbnailUrl: 'https://picsum.photos/200/300',
            winnerId: 100,
            winnerNickname: 'MockWinner',
            sellerId: 200,
            sellerNickname: 'MockSeller',
            finalPrice: 10000,
            orderType: 'AUCTION_WIN',
            status: 'PENDING',
            createdAt: new Date().toISOString()
        };
    },

    getOrderById: async (orderId: string) => {
        await delay(500);
        return {
            id: 12345,
            orderId: orderId,
            auctionId: 1,
            auctionTitle: 'Mock Auction Item',
            thumbnailUrl: 'https://picsum.photos/200/300',
            winnerId: 100,
            winnerNickname: 'MockWinner',
            sellerId: 200,
            sellerNickname: 'MockSeller',
            finalPrice: 10000,
            orderType: 'BUY_NOW',
            status: 'PENDING',
            createdAt: new Date().toISOString()
        };
    },

    confirmPayment: async (paymentKey: string, orderId: string, amount: number) => {
        await delay(1000);
        console.log(`[Mock] Payment Confirmed: ${paymentKey}, ${orderId}, ${amount}`);
    },

    cancelOrder: async (orderId: string) => {
        await delay(500);
        console.log(`Mock: Order ${orderId} cancelled`);
    },

    getMyOrders: async () => {
        await delay(500);
        return [
            {
                id: 1,
                orderId: 'ORDER_MOCK_001',
                auctionId: 1,
                auctionTitle: 'Vintage Camera',
                winnerId: 100,
                winnerNickname: 'Me',
                finalPrice: 150000,
                orderType: 'AUCTION_WIN',
                status: 'PENDING', // Payment pending
                createdAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: 2,
                orderId: 'ORDER_MOCK_002',
                auctionId: 2,
                auctionTitle: 'Gaming Laptop',
                winnerId: 100,
                winnerNickname: 'Me',
                finalPrice: 1200000,
                orderType: 'BUY_NOW',
                status: 'COMPLETED', // Paid
                createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
            }
        ];
    },

    // Mock Cart Implementation
    getCart: async () => {
        await delay(500);
        const cartItems = getMockCartItems();
        const responseItems: CartItemResponse[] = [];
        let totalPrice = 0;

        for (const item of cartItems) {
            const auction = MOCK_AUCTIONS.find(a => a.auctionItemId === item.auctionId);
            if (auction) {
                // Determine status based on auction status
                let status: CartItemStatus = CartItemStatus.ACTIVE;
                if (auction.status === AuctionStatus.ENDED || auction.status === AuctionStatus.SOLD || auction.status === AuctionStatus.SOLD_BY_BUY_NOW) {
                    status = CartItemStatus.AUCTION_ENDED;
                }

                responseItems.push({
                    id: item.id,
                    auctionId: auction.auctionItemId,
                    auctionTitle: auction.title,
                    thumbnailUrl: auction.imageUrls[0] || '',
                    buyNowPriceWhenAdded: item.buyNowPrice,
                    currentBuyNowPrice: auction.currentPrice, // Simplified
                    auctionStatus: auction.status,
                    status: status,
                    addedAt: item.addedAt,
                    isPriceChanged: false
                });

                if (status === 'ACTIVE') {
                    totalPrice += item.buyNowPrice;
                }
            }
        }

        return {
            id: 1,
            userId: 1,
            totalItemCount: responseItems.length,
            activeItemCount: responseItems.filter(i => i.status === 'ACTIVE').length,
            totalPrice: totalPrice,
            items: responseItems
        };
    },

    getCartItemCount: async () => {
        await delay(300);
        const cartItems = getMockCartItems();
        return cartItems.length;
    },

    addItemToCart: async (auctionId: number) => {
        await delay(500);
        const auction = MOCK_AUCTIONS.find(a => a.auctionItemId === auctionId);
        if (!auction) throw new Error('Auction not found');

        const items = getMockCartItems();
        // Check duplicate
        if (items.some(i => i.auctionId === auctionId)) {
            throw new Error('이미 장바구니에 담긴 상품입니다.');
        }

        items.push({
            id: Date.now(),
            auctionId,
            buyNowPrice: auction.currentPrice, // Using current price as buyNowPrice for mock
            addedAt: new Date().toISOString()
        });
        saveMockCartItems(items);
        console.log('Mock: Added to cart persited', auctionId);
    },

    removeItemFromCart: async (cartItemId: number) => {
        await delay(500);
        const items = getMockCartItems();
        const filtered = items.filter(i => i.id !== cartItemId);
        saveMockCartItems(filtered);
        console.log('Mock: Removed from cart persisted', cartItemId);
    },

    buyNowFromCart: async (cartItemIds: number[]) => {
        await delay(1000);
        console.log('Mock: Bought from cart', cartItemIds);
        // Remove bought items
        const items = getMockCartItems();
        const filtered = items.filter(i => !cartItemIds.includes(i.id));
        saveMockCartItems(filtered);

        return cartItemIds.map(id => `MOCK_ORDER_CART_${id}_${Date.now()}`);
    },

    buyNowAllCart: async () => {
        await delay(1000);
        // Assume empty cart after buy all
        saveMockCartItems([]);
        console.log('Mock: Bought all from cart');
        return [`MOCK_ORDER_CART_ALL_${Date.now()}`];
    },

    clearExpiredItems: async () => {
        await delay(500);
        console.log('Mock: Cleared expired items (No-op for simplicity)');
    },

    // Mock Settlement
    getSettlementHistory: async () => {
        await delay(500);
        return {
            id: 101,
            payeeId: 1,
            payeeEmail: "user@example.com",
            totalAmount: 150000,
            settledAt: null, // Pending settlement
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            items: [
                {
                    itemId: 1001,
                    eventType: "SALE",
                    relTypeCode: "ORDER",
                    relId: 55,
                    amount: 150000,
                    payerName: "BuyerUser",
                    paymentDate: new Date().toISOString()
                }
            ]
        };
    },

    getAllSettlements: async () => {
        await delay(500);
        return [
            {
                id: 100,
                payeeId: 1,
                payeeEmail: "user@example.com",
                totalAmount: 50000,
                settledAt: new Date(Date.now() - 86400000 * 7).toISOString(), // Settled 7 days ago
                createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
                updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
                items: [
                    {
                        itemId: 900,
                        eventType: "SALE",
                        relTypeCode: "ORDER",
                        relId: 40,
                        amount: 50000,
                        payerName: "OldBuyer",
                        paymentDate: new Date(Date.now() - 86400000 * 8).toISOString()
                    }
                ]
            }
        ];
    },

    getSettlementPendings: async () => {
        await delay(500);
        return [
            {
                id: 201,
                settlementEventType: "SALE",
                relTypeCode: "ORDER",
                relId: 60,
                paymentDate: new Date().toISOString(),
                amount: 30000,
                payerId: 2,
                payerName: "CurrentBuyer",
                payeeId: 1,
                payeeName: "Test User"
            }
        ];
    },

    // Wallet & Payments
    getWalletBalance: async () => {
        await delay(500);
        return { balance: 50000 };
    },

    getWalletHistory: async () => {
        await delay(500);
        return {
            history: [
                { id: 1, amount: 10000, balance: 50000, relTypeCode: 'CHARGE', relId: 1, eventType: '충전', createdAt: new Date().toISOString() },
                { id: 2, amount: -5000, balance: 40000, relTypeCode: 'PAYMENT', relId: 101, eventType: '결제', createdAt: new Date().toISOString() }
            ]
        };
    },

    getWalletSummary: async () => {
        await delay(500);
        return {
            balance: 50000,
            history: [
                { id: 1, amount: 10000, balance: 50000, relTypeCode: 'CHARGE', relId: 1, eventType: '충전', createdAt: new Date().toISOString() }
            ]
        };
    },

    getPayments: async () => {
        await delay(500);
        return [
            { id: 1, paymentKey: 'pay_1234', orderId: 'ord_123', amount: 5000, method: 'TOSS', status: 'DONE', paidAt: new Date().toISOString() }
        ];
    },

    getRefunds: async () => {
        await delay(500);
        return [];
    },

    // 알림 (Notifications)
    getMyNotifications: async () => {
        await delay(500);
        return [
            {
                id: 1,
                type: 'BID',
                title: '입찰 성공',
                content: '"Vintage Camera"에 최고 입찰자로 등극했습니다.',
                relatedUrl: '/auctions/1',
                isRead: false,
                sendAt: new Date(Date.now() - 3600000).toISOString()
            },
            {
                id: 2,
                type: 'SYSTEM',
                title: '환영합니다',
                content: '포춘 경매에 가입하신 것을 환영합니다!',
                relatedUrl: '/',
                isRead: true,
                sendAt: new Date(Date.now() - 86400000).toISOString()
            }
        ];
    },

    readNotification: async (notificationId: number) => {
        await delay(300);
        console.log(`Mock: Notification ${notificationId} marked as read`);
    },

    deleteNotification: async (notificationId: number) => {
        await delay(300);
        console.log(`Mock: Notification ${notificationId} deleted`);
    },

    getNotificationSettings: async () => {
        await delay(500);
        return {
            isBidPushEnabled: true,
            isPaymentPushEnabled: true,
            isWatchListPushEnabled: false
        };
    },

    updateNotificationSettings: async (settings) => {
        await delay(500);
        console.log(`Mock: Notification settings updated`, settings);
    },

    registerFcmToken: async (token: string) => {
        await delay(500);
        console.log(`Mock: FCM Token registered: ${token}`);
    },

    // Recent Search Mock
    getRecentSearches: async () => {
        await delay(300);
        const saved = localStorage.getItem('recent_searches');
        return saved ? JSON.parse(saved) : ['LG TV', 'iPhone 15', 'Macbook Pro'];
    },

    deleteRecentSearch: async (keyword: string) => {
        await delay(300);
        const saved = localStorage.getItem('recent_searches');
        let searches: string[] = saved ? JSON.parse(saved) : ['LG TV', 'iPhone 15', 'Macbook Pro'];
        searches = searches.filter(k => k !== keyword);
        localStorage.setItem('recent_searches', JSON.stringify(searches));
    },

    deleteAllRecentSearches: async () => {
        await delay(300);
        localStorage.setItem('recent_searches', JSON.stringify([]));
    },

    getRecommendations: async (size = 10) => {
        await delay(500);
        console.log('Mock: Getting personal recommendations');
        return MOCK_AUCTIONS.slice(0, size);
    },

    getPopularRecommendations: async (size = 10) => {
        await delay(500);
        console.log('Mock: Getting popular recommendations');
        return MOCK_AUCTIONS.slice(0, size);
    }
};
