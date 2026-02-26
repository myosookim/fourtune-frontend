import React from 'react';
import { Link } from 'react-router-dom';
import { type AuctionItem, AuctionStatus } from '../../types';
import { AUCTION_STATUS_KO, AUCTION_CATEGORY_KO } from '../../constants/translations';
import classes from './AuctionCard.module.css';

interface AuctionCardProps {
    item: AuctionItem;
    actions?: React.ReactNode;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({ item, actions }) => {
    const getStatusBadge = (status: AuctionStatus) => {
        switch (status) {
            case AuctionStatus.ACTIVE: return classes.badgeRunning;
            case AuctionStatus.ENDED:
            case AuctionStatus.SOLD:
            case AuctionStatus.SOLD_BY_BUY_NOW:
            case AuctionStatus.CANCELLED:
                return classes.badgeClosed;
            case AuctionStatus.SCHEDULED: return classes.badgeReady;
            default: return classes.badgeClosed;
        }
    };

    return (
        <div className={classes.card}>
            <Link to={`/auctions/${item.auctionItemId}`} className={classes.mainLink}>
                <div className={classes.imageContainer}>
                    <img src={item.imageUrls[0]} alt={item.title} className={classes.image} loading="lazy" />
                    <span className={`${classes.badge} ${getStatusBadge(item.status)}`}>
                        {AUCTION_STATUS_KO[item.status]}
                    </span>
                </div>
                <div className={classes.content}>
                    <div className={classes.category}>{AUCTION_CATEGORY_KO[item.category]}</div>
                    <h3 className={classes.title}>{item.title}</h3>
                    <div className={classes.priceSection}>
                        <div className={classes.currentPriceLabel}>현재 입찰가</div>
                        <div className={classes.price}>{item.currentPrice.toLocaleString()}원</div>
                    </div>
                </div>
            </Link>
            <div className={classes.footer}>
                <div className={classes.statsRow}>
                    <div className={classes.statItem} title="조회수">
                        <span>👁️</span> {item.viewCount || 0}
                    </div>
                    <div className={classes.statItem} title="관심">
                        <span>❤️</span> {item.watchlistCount || 0}
                    </div>
                    <div className={classes.statItem} title="입찰">
                        <span>🔨</span> {item.bidCount || 0}
                    </div>
                </div>
                {actions && (
                    <div
                        className={classes.actions}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};
