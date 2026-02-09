// Using const objects instead of enums to satisfy erasableSyntaxOnly and match backend
export const AuctionStatus = {
    SCHEDULED: 'SCHEDULED',
    ACTIVE: 'ACTIVE',
    ENDED: 'ENDED',
    SOLD: 'SOLD',
    SOLD_BY_BUY_NOW: 'SOLD_BY_BUY_NOW',
    CANCELLED: 'CANCELLED'
} as const;
export type AuctionStatus = typeof AuctionStatus[keyof typeof AuctionStatus];

export const AuctionCategory = {
    ELECTRONICS: 'ELECTRONICS',
    CLOTHING: 'CLOTHING',
    POTTERY: 'POTTERY',
    APPLIANCES: 'APPLIANCES',
    BEDDING: 'BEDDING',
    BOOKS: 'BOOKS',
    COLLECTIBLES: 'COLLECTIBLES',
    ETC: 'ETC'
} as const;
export type AuctionCategory = typeof AuctionCategory[keyof typeof AuctionCategory];

export interface User {
    id: number;
    username: string;
    email: string;
}

export interface AuctionItem {
    auctionItemId: number;
    title: string;
    description: string;
    category: AuctionCategory;
    status: AuctionStatus;
    startPrice: number;
    currentPrice: number;
    startAt: string; // ISO date string
    endAt: string; // ISO date string
    imageUrls: string[];
    createdAt: string;
    updatedAt: string;
    sellerName?: string;
    sellerId?: number;
    buyNowPrice?: number;
    bidUnit?: number;
    viewCount?: number;
    bidCount?: number;
    wishlistCount?: number;
}

export interface SearchResponse {
    items: AuctionItem[];
    page: number;
    size: number;
    totalPages: number;
}

// Cart Types
export const CartItemStatus = {
    ACTIVE: 'ACTIVE',
    SOLD: 'SOLD',
    EXPIRED: 'EXPIRED',
    AUCTION_ENDED: 'AUCTION_ENDED'
} as const;
export type CartItemStatus = typeof CartItemStatus[keyof typeof CartItemStatus];

export interface CartItemResponse {
    id: number; // cartItemId
    auctionId: number;
    auctionTitle: string | null;
    thumbnailUrl: string | null;
    buyNowPriceWhenAdded: number;
    currentBuyNowPrice: number | null;
    auctionStatus: AuctionStatus | null;
    status: CartItemStatus;
    addedAt: string;
    isPriceChanged: boolean;
}

export interface CartResponse {
    id: number;
    userId: number;
    totalItemCount: number;
    activeItemCount: number;
    totalPrice: number;
    items: CartItemResponse[];
}

// Bid Types
export const BidStatus = {
    ACTIVE: 'ACTIVE',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
    CANCELLED: 'CANCELLED'
} as const;
export type BidStatus = typeof BidStatus[keyof typeof BidStatus];

export interface BidPlaceRequest {
    auctionId: number;
    bidAmount: number;
}

export interface BidResponse {
    id: number;
    auctionId: number;
    bidderId: number;
    bidderNickname?: string;
    bidAmount: number;
    status: BidStatus;
    isWinning: boolean;
    createdAt: string;
    auctionTitle?: string;
}

export interface BidDetailResponse extends BidResponse {
    auctionTitle: string;
    message?: string;
}

export interface BidHistoryResponse {
    auctionId: number;
    bids: BidResponse[];
}

export interface SettlementItem {
    itemId: number;
    eventType: string; // 'SALE', 'COMMISSION'
    relTypeCode: string; // 'ORDER'
    relId: number;
    amount: number;
    payerName?: string;
    paymentDate: string;
    items?: SettlementItem[];
}

export interface SettlementResponse {
    id: number;
    payeeId: number;
    payeeEmail: string;
    totalAmount: number;
    settledAt: string | null;
    createdAt: string;
    updatedAt: string;
    items: SettlementItem[];
}

export interface SettlementCandidatedItemDto {
    id: number;
    settlementEventType: string;
    relTypeCode: string;
    relId: number;
    paymentDate: string;
    amount: number;
    payerId?: number;
    payerName?: string;
    payeeId?: number;
    payeeName?: string;
}
