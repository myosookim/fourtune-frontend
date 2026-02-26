import {
    type AuctionItem,
    type SearchResponse,
    AuctionCategory,
    AuctionStatus,
    type CartResponse,
    type BidDetailResponse,
    type BidResponse,
    type BidHistoryResponse,
    type SettlementResponse,
    type SettlementCandidatedItemDto
} from '../types';

export interface CashLogResponse {
    id: number;
    amount: number;
    balance: number;
    relTypeCode: string;
    relId: number;
    eventType: string;
    createdAt: string;
}

export interface WalletResponse {
    balance?: number;
    history?: CashLogResponse[];
}

export interface PaymentDto {
    id: number;
    paymentKey: string;
    orderId: string;
    amount: number;
    method: string;
    status: string;
    paidAt: string;
}

export interface RefundDto {
    id: number;
    paymentKey: string;
    amount: number;
    reason: string;
    refundedAt: string;
    status: string;
}

export interface NotificationResponseDto {
    id: number;
    type: string;
    title: string;
    content: string;
    relatedUrl: string;
    isRead: boolean;
    sendAt: string;
}

export interface NotificationSettingsResponse {
    isBidPushEnabled: boolean;
    isPaymentPushEnabled: boolean;
    isWatchListPushEnabled: boolean;
}

export interface UserDetail {
    id: number;
    email: string;
    nickname: string;
    phoneNumber?: string;
    createdAt?: string;
    updatedAt?: string;
    status?: string;
}

export interface CreateAuctionRequest {
    title: string;
    description: string;
    category: AuctionCategory;
    startPrice: number;
    bidUnit?: number;
    buyNowPrice?: number;
    startAt: string; // ISO 8601 format
    endAt: string;   // ISO 8601 format
}

// Interface for API Service
export interface ApiService {
    searchAuctions(params: {
        page?: number;
        size?: number;
        keyword?: string;
        category?: AuctionCategory;
        status?: AuctionStatus;
        sort?: string;
        sellerName?: string;
    }): Promise<SearchResponse>;

    getAuctionById(id: number): Promise<AuctionItem>;

    createAuction(data: CreateAuctionRequest, images?: File[]): Promise<AuctionItem>;
    updateAuction(id: number, data: Partial<CreateAuctionRequest>, images?: File[]): Promise<AuctionItem>;
    deleteAuction(id: number): Promise<void>;
    increaseViewCount(auctionId: number): Promise<void>;
    toggleWatchlist(auctionId: number): Promise<string>;
    getMyWatchlist(): Promise<number[]>;

    login(email: string, password?: string): Promise<{ user: { email: string; name: string } }>;
    signup(nickname: string, email: string, password?: string, phoneNumber?: string): Promise<{ user: { email: string; name: string } }>;
    logout(): void;
    isAuthenticated(): boolean;
    getCurrentUser(): { id?: number; email: string; name: string } | null;
    getUser(id: number): Promise<UserDetail>;
    updateProfile(nickname: string, phoneNumber: string): Promise<void>;
    changePassword(currentPassword: string, newPassword: string): Promise<void>;
    withdraw(password: string, reason?: string): Promise<void>;

    // Bidding
    placeBid(auctionId: number, bidAmount: number): Promise<BidDetailResponse>;
    getMyBids(): Promise<BidResponse[]>;
    getAuctionBids(auctionId: number): Promise<BidHistoryResponse>;
    getHighestBid(auctionId: number): Promise<BidResponse>;
    getBidById(bidId: number): Promise<BidResponse>;
    cancelBid(bidId: number): Promise<void>;

    // Payment & Order
    buyNow(auctionId: number): Promise<string>; // Returns orderId
    getPublicOrder(orderId: string): Promise<OrderDetailResponse>;
    getOrderById(orderId: string): Promise<OrderDetailResponse>;
    getOrderByAuctionId(auctionId: number): Promise<OrderDetailResponse>;
    confirmPayment(paymentKey: string, orderId: string, amount: number): Promise<void>;
    cancelOrder(orderId: string): Promise<void>;
    getMyOrders(): Promise<OrderResponse[]>;

    // Cart
    getCart(): Promise<CartResponse>;
    getCartItemCount(): Promise<number>;
    addItemToCart(auctionId: number): Promise<void>;
    removeItemFromCart(cartItemId: number): Promise<void>;
    buyNowFromCart(cartItemIds: number[]): Promise<string[]>; // Returns orderIds
    buyNowAllCart(): Promise<string[]>; // Returns orderIds
    clearExpiredItems(): Promise<void>;

    // Settlement
    getSettlementHistory(): Promise<SettlementResponse>;
    getAllSettlements(): Promise<SettlementResponse[]>;
    getSettlementPendings(): Promise<SettlementCandidatedItemDto[]>;

    // Wallet & Payments History
    getWalletBalance(): Promise<WalletResponse>;
    getWalletHistory(): Promise<WalletResponse>;
    getWalletSummary(): Promise<WalletResponse>;
    getPayments(): Promise<PaymentDto[]>;
    getRefunds(): Promise<RefundDto[]>;

    // Notifications
    getMyNotifications(): Promise<NotificationResponseDto[]>;
    readNotification(notificationId: number): Promise<void>;
    deleteNotification(notificationId: number): Promise<void>;
    getNotificationSettings(): Promise<NotificationSettingsResponse>;
    updateNotificationSettings(settings: NotificationSettingsResponse): Promise<void>;
    registerFcmToken(token: string): Promise<void>;

    // Recent Search
    getRecentSearches(): Promise<string[]>;
    deleteRecentSearch(keyword: string): Promise<void>;
    deleteAllRecentSearches(): Promise<void>;

    // Recommendations
    getRecommendations(size?: number): Promise<AuctionItem[]>;
    getPopularRecommendations(size?: number): Promise<AuctionItem[]>;
}

export interface OrderDetailResponse {
    id: number;
    orderId: string;
    auctionId: number;
    auctionTitle: string;
    thumbnailUrl: string;
    winnerId: number;
    winnerNickname?: string;
    sellerId: number;
    sellerNickname?: string;
    finalPrice: number;
    orderType: string;
    status: string;
    paymentKey?: string;
    paidAt?: string;
    createdAt: string;
}

export interface OrderResponse {
    id: number;
    orderId: string;
    auctionId: number;
    auctionTitle: string;
    winnerId: number;
    winnerNickname?: string;
    finalPrice: number;
    orderType: 'AUCTION_WIN' | 'BUY_NOW';
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    createdAt: string;
}
