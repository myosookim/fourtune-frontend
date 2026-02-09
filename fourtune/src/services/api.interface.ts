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

export interface UserDetail {
    id: number;
    email: string;
    nickname: string;
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
    }): Promise<SearchResponse>;

    getAuctionById(id: number): Promise<AuctionItem>;

    createAuction(data: CreateAuctionRequest, images?: File[]): Promise<AuctionItem>;
    increaseViewCount(auctionId: number): Promise<void>;
    toggleWishlist(auctionId: number): Promise<string>;

    login(email: string, password?: string): Promise<{ user: { email: string; name: string } }>;
    signup(nickname: string, email: string, password?: string, phoneNumber?: string): Promise<{ user: { email: string; name: string } }>;
    logout(): void;
    isAuthenticated(): boolean;
    getCurrentUser(): { id?: number; email: string; name: string } | null;
    getUser(id: number): Promise<UserDetail>;

    // Bidding
    placeBid(auctionId: number, bidAmount: number): Promise<BidDetailResponse>;
    getMyBids(): Promise<BidResponse[]>;
    getAuctionBids(auctionId: number): Promise<BidHistoryResponse>;

    // Payment & Order
    buyNow(auctionId: number): Promise<string>; // Returns orderId
    getPublicOrder(orderId: string): Promise<OrderDetailResponse>;
    getOrderById(orderId: string): Promise<OrderDetailResponse>;
    getOrderByAuctionId(auctionId: number): Promise<OrderDetailResponse>;
    confirmPayment(paymentKey: string, orderId: string, amount: number): Promise<void>;
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
