import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { type OrderDetailResponse } from '../../services/api.interface';
import { type AuctionItem, AuctionStatus } from '../../types';
import { AUCTION_STATUS_KO, AUCTION_CATEGORY_KO } from '../../constants/translations';
import classes from './AuctionDetail.module.css';

const AuctionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [item, setItem] = useState<AuctionItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [error, setError] = useState('');
    const [isWishlisted, setIsWishlisted] = useState(false);
    // Order status check for Buy Now
    const [myOrder, setMyOrder] = useState<OrderDetailResponse | null>(null);
    const [bidAmount, setBidAmount] = useState<number>(0);
    const [showBidModal, setShowBidModal] = useState(false);
    const viewCountIncremented = React.useRef(false);

    useEffect(() => {
        if (id) {
            setLoading(true);
            api.getAuctionById(Number(id))
                .then(data => {
                    setItem(data);

                    // Increment view count (run only once per mount)
                    if (!viewCountIncremented.current) {
                        viewCountIncremented.current = true;
                        api.increaseViewCount(Number(id)).catch(e => console.error('Failed to increase view count', e));
                    }

                    // 1. Initial Image Setup
                    if (data.imageUrls && data.imageUrls.length > 0) {
                        setSelectedImage(data.imageUrls[0]);
                    }

                    // 2. Wishlist Check
                    try {
                        const saved = localStorage.getItem('wishlist');
                        const wishlist = saved ? JSON.parse(saved) : [];
                        setIsWishlisted(wishlist.includes(data.auctionItemId));
                    } catch (e) {
                        console.error('Failed to parse wishlist', e);
                        setIsWishlisted(false);
                    }

                    // 3. Order Status Check (if SOLD_BY_BUY_NOW)
                    if (data.status === AuctionStatus.SOLD_BY_BUY_NOW && api.isAuthenticated()) {
                        api.getOrderByAuctionId(data.auctionItemId)
                            .then((order: OrderDetailResponse) => {
                                if (order && order.status === 'PENDING') {
                                    setMyOrder(order);
                                }
                            })
                            .catch(() => {
                                setMyOrder(null);
                            });
                    }
                })
                .catch(err => {
                    console.error('Error loading auction:', err);
                    setError('Failed to load auction details.');
                })
                .finally(() => setLoading(false));
        }
    }, [id]);

    // Initialize bid amount when item is loaded
    useEffect(() => {
        if (item) {
            setBidAmount(item.currentPrice + (item.bidUnit || 1000));
        }
    }, [item]);

    const checkAuth = () => {
        if (!api.isAuthenticated()) {
            alert('로그인이 필요한 서비스입니다.');
            return false;
        }
        return true;
    };

    const handleBidClick = () => {
        if (!item) return;
        if (!checkAuth()) return;

        const unit = item.bidUnit || 1000;
        const minBid = item.currentPrice + unit;

        // 1. Validation: Verify minimum bid amount
        if (bidAmount < minBid) {
            alert(`최소 입찰 금액은 ${minBid.toLocaleString()}원부터 가능합니다.`);
            setBidAmount(minBid); // Auto-correct layout for convenience after alert
            return;
        }

        setShowBidModal(true);
    };

    const confirmBid = async () => {
        if (!item) return;
        setShowBidModal(false);

        try {
            const response = await api.placeBid(item.auctionItemId, bidAmount);
            alert(response.message || '입찰에 성공했습니다!');
            // Refresh item data
            const updatedItem = await api.getAuctionById(item.auctionItemId);
            setItem(updatedItem);
            setBidAmount(updatedItem.currentPrice + (updatedItem.bidUnit || 1000)); // Reset bid amount to new min
        } catch (error: any) {
            console.error('Bidding failed', error);
            const errorMessage = error.response?.data?.message || '입찰에 실패했습니다.';
            alert(errorMessage);
        }
    };

    const handleBuyNow = async () => {
        if (!item) return;
        if (!checkAuth()) return;

        try {
            const orderId = await api.buyNow(item.auctionItemId);
            navigate(`/payment?orderId=${orderId}`);
        } catch (error: any) {
            console.error('Buy now failed', error);

            // Backend error code handling
            // Assuming the backend returns standard error response: { code: 'AUCTION_006', message: '...' }
            // Adjust property access based on actual error structure (e.g., error.response?.data?.code)
            const errorCode = error.response?.data?.code;
            const errorMessage = error.response?.data?.message;

            if (errorCode === 'BN001') { // BUY_NOW_NOT_ENABLED
                alert('즉시 구매가 불가능한 경매입니다.');
            } else if (errorCode === 'BN002') { // BUY_NOW_PRICE_NOT_SET
                alert('즉시 구매 가격이 설정되지 않았습니다.');
            } else if (errorCode === 'BN003') { // AUCTION_NOT_ACTIVE
                alert('진행 중인 경매가 아닙니다.');
            } else if (errorCode === 'BN005') { // CANNOT_BUY_OWN_ITEM
                alert('본인의 상품은 구매할 수 없습니다.');
            } else {
                // Should show backend message if available, or default
                alert(errorMessage || '즉시 구매 요청에 실패했습니다. (알 수 없는 오류)');
            }
        }
    };

    const handleAddToCart = async () => {
        if (!item) return;
        if (!checkAuth()) return;

        try {
            await api.addItemToCart(item.auctionItemId);
            if (confirm('장바구니에 담겼습니다. 장바구니로 이동하시겠습니까?')) {
                navigate('/cart');
            }
        } catch (error: any) {
            console.error('Failed to add to cart', error);
            const errorMessage = error.response?.data?.message || '장바구니 담기에 실패했습니다.';
            alert(errorMessage);
        }
    };

    const toggleWishlist = async () => {
        if (!item) return;
        if (!checkAuth()) return;

        try {
            // Optimistic Update
            if (isWishlisted) {
                // Currently wishlisted -> remove it
                setIsWishlisted(false);
                setItem(prev => prev ? { ...prev, wishlistCount: Math.max(0, (prev.wishlistCount || 0) - 1) } : null);

                await api.toggleWishlist(item.auctionItemId);

                // Update Local Storage Sync
                const saved = localStorage.getItem('wishlist');
                let wishlist: number[] = saved ? JSON.parse(saved) : [];
                wishlist = wishlist.filter(id => id !== item.auctionItemId);
                localStorage.setItem('wishlist', JSON.stringify(wishlist));

                alert('관심상품이 해제되었습니다.');
            } else {
                // Not wishlisted -> add it
                setIsWishlisted(true);
                setItem(prev => prev ? { ...prev, wishlistCount: (prev.wishlistCount || 0) + 1 } : null);

                await api.toggleWishlist(item.auctionItemId);

                // Update Local Storage Sync
                const saved = localStorage.getItem('wishlist');
                let wishlist: number[] = saved ? JSON.parse(saved) : [];
                if (!wishlist.includes(item.auctionItemId)) {
                    wishlist.push(item.auctionItemId);
                }
                localStorage.setItem('wishlist', JSON.stringify(wishlist));

                alert('관심상품으로 등록되었습니다.');
            }
        } catch (e) {
            console.error('Failed to update wishlist', e);
            // Revert on failure
            setIsWishlisted(!isWishlisted);
            setItem(prev => prev ? { ...prev, wishlistCount: (prev.wishlistCount || 0) + (isWishlisted ? 1 : -1) } : null);
            alert('관심상품 업데이트 중 오류가 발생했습니다.');
        }
    };

    const getStatusBadge = (status: AuctionStatus) => {
        if (status === AuctionStatus.SOLD_BY_BUY_NOW && myOrder && myOrder.status === 'PENDING') {
            return classes.badgeRunning; // Use green/active color for pending payment
        }

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

    const getStatusText = (status: AuctionStatus) => {
        if (status === AuctionStatus.SOLD_BY_BUY_NOW && myOrder && myOrder.status === 'PENDING') {
            return "결제 대기 (내 주문)";
        }
        return AUCTION_STATUS_KO[status];
    };

    if (loading) return <div className={classes.container} style={{ padding: '4rem 0', textAlign: 'center' }}>Loading...</div>;
    if (error || !item) return <div className={classes.container} style={{ padding: '4rem 0', textAlign: 'center' }}>{error || 'Item not found'}</div>;

    return (
        <div className={classes.container}>
            <Link to="/" className={classes.backLink}>&larr; 목록으로 돌아가기</Link>

            <div className={classes.contentWrapper}>
                {/* Left: Images */}
                <div className={classes.imageSection}>
                    <div className={classes.mainImageContainer}>
                        {selectedImage && <img src={selectedImage} alt={item.title} className={classes.mainImage} />}
                    </div>
                    <div className={classes.thumbnailGrid}>
                        {item.imageUrls.map((url, idx) => (
                            <div
                                key={idx}
                                className={`${classes.thumbnail} ${selectedImage === url ? classes.active : ''}`}
                                onClick={() => setSelectedImage(url)}
                            >
                                <img src={url} alt={`Thumbnail ${idx + 1}`} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Info */}
                <div className={classes.infoSection}>
                    <span className={`${classes.badge} ${getStatusBadge(item.status)}`}>{getStatusText(item.status)}</span>
                    <h1 className={classes.title}>{item.title}</h1>
                    <div className={classes.category}>{AUCTION_CATEGORY_KO[item.category]}</div>

                    <div className={classes.statsContainer}>
                        <div className={classes.statItem} title="조회수">
                            <span className={classes.statIcon}>👁️</span> {item.viewCount ? item.viewCount.toLocaleString() : 0}
                        </div>
                        <div className={classes.statItem} title="관심 등록 수">
                            <span className={classes.statIcon}>❤️</span> {item.wishlistCount ? item.wishlistCount.toLocaleString() : 0}
                        </div>
                        <div className={classes.statItem} title="입찰 수">
                            <span className={classes.statIcon}>🔨</span> {item.bidCount ? item.bidCount.toLocaleString() : 0}
                        </div>
                    </div>

                    <div className={classes.priceBox}>
                        <div className={classes.priceRow}>
                            <div>
                                <div className={classes.currentPriceLabel}>현재 입찰가</div>
                                <div className={classes.price}>{item.currentPrice.toLocaleString()}원</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div className={classes.currentPriceLabel}>시작가</div>
                                <div style={{ fontWeight: 500 }}>{item.startPrice.toLocaleString()}원</div>
                                <div style={{ marginTop: '8px' }}>
                                    <div className={classes.currentPriceLabel}>즉시구매가</div>
                                    <div style={{ fontWeight: 500, color: (item.buyNowPrice && item.buyNowPrice > 0) ? undefined : '#999' }}>
                                        {(item.buyNowPrice && item.buyNowPrice > 0)
                                            ? `${item.buyNowPrice.toLocaleString()}원`
                                            : '즉시구매 불가'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={classes.actionButtons}>
                            {item.status === AuctionStatus.ACTIVE && new Date() <= new Date(item.endAt) && (
                                <>
                                    <div className={classes.bidControl}>
                                        <div className={classes.bidInfo}>
                                            <small style={{ display: 'block', marginBottom: '8px', color: '#666' }}>
                                                입찰 단위: {(item.bidUnit || 1000).toLocaleString()}원
                                            </small>
                                        </div>
                                        <div className={classes.bidStepper}>
                                            <button
                                                onClick={() => {
                                                    const unit = item.bidUnit || 1000;
                                                    setBidAmount(prev => Math.max((item.currentPrice || 0) + unit, prev - unit));
                                                }}
                                                className={classes.stepperBtn}
                                                disabled={bidAmount <= (item.currentPrice || 0) + (item.bidUnit || 1000)}
                                            >
                                                -
                                            </button>
                                            <input
                                                type="text"
                                                className={classes.bidInput}
                                                value={bidAmount ? bidAmount.toLocaleString() : ''}
                                                onChange={(e) => {
                                                    // Allow numeric input
                                                    const val = Number(e.target.value.replace(/,/g, ''));
                                                    if (!isNaN(val)) setBidAmount(val);
                                                }}
                                                onBlur={() => {
                                                    // Auto-correct to nearest valid unit increment
                                                    const unit = item.bidUnit || 1000;
                                                    const current = item.currentPrice || 0;
                                                    const minBid = current + unit;

                                                    if (bidAmount < minBid) {
                                                        setBidAmount(minBid);
                                                    } else {
                                                        // Calculate steps from current price
                                                        const diff = bidAmount - current;
                                                        const steps = Math.round(diff / unit);
                                                        const corrected = current + (steps * unit);
                                                        setBidAmount(corrected);
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        // Trigger blur logic first manually or trust the submit handler to validate
                                                        // Ideally, handleBidSubmit has validation, but let's auto-correct on Enter too
                                                        const unit = item.bidUnit || 1000;
                                                        const current = item.currentPrice || 0;
                                                        const minBid = current + unit;

                                                        let finalAmount = bidAmount;
                                                        if (bidAmount < minBid) {
                                                            finalAmount = minBid;
                                                        } else {
                                                            const diff = bidAmount - current;
                                                            const steps = Math.round(diff / unit);
                                                            finalAmount = current + (steps * unit);
                                                        }
                                                        setBidAmount(finalAmount);

                                                        // We might want to submit immediately, but since value changed,
                                                        // maybe just let user see corrected value first.
                                                        // Or submit with corrected value.
                                                        // Let's just correct it on Enter for now, user can hit button.
                                                        e.currentTarget.blur();
                                                        // Trigger modal after small delay to let blur finish update if needed,
                                                        // but since we updated state above, calling handleBidClick directly is fine
                                                        // IF handleBidClick uses current state.
                                                        // Note: state update is async, so handleBidClick might see old value if called immediately
                                                        // BUT we set finalAmount above so we can pass it or just rely on next render.
                                                        // Actually, handleBidClick reads 'bidAmount' state.
                                                        // To be safe, let's just blur here and let user click button, OR
                                                        // call handleBidClick but we need to wait for state update.
                                                        // Simpler: Just blur. The user naturally will click button or hit enter again.
                                                        // If we want "Enter to submit":
                                                        setTimeout(() => document.getElementById('bidSubmitBtn')?.click(), 0);
                                                    }
                                                }}
                                            />
                                            <button
                                                onClick={() => {
                                                    const unit = item.bidUnit || 1000;
                                                    setBidAmount(prev => prev + unit);
                                                }}
                                                className={classes.stepperBtn}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            id="bidSubmitBtn"
                                            onClick={handleBidClick}
                                            className={`btn btn-primary ${classes.bidSubmitButton}`}
                                        >
                                            {bidAmount.toLocaleString()}원 입찰하기
                                        </button>
                                    </div>
                                    {/* Show Buy Now and Cart only if buyNowPrice is set (optional feature) */}
                                    {/* Backend might send 0 or undefined if not set. Check strict positive constraint if needed */}
                                    {(item.buyNowPrice && item.buyNowPrice > 0) && (
                                        <>
                                            <button onClick={handleBuyNow} className={`btn ${classes.buyNowButton}`}>
                                                즉시 구매 ({item.buyNowPrice.toLocaleString()}원)
                                            </button>
                                            <button onClick={handleAddToCart} className={`btn btn-outline`} style={{ minWidth: '100px' }}>
                                                장바구니
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                            {(item.status === AuctionStatus.ACTIVE && new Date() > new Date(item.endAt)) && (
                                <button disabled className={`btn btn-outline`} style={{ width: '100%', cursor: 'not-allowed' }}>
                                    경매 시간 종료 (마감됨)
                                </button>
                            )}
                            {item.status === AuctionStatus.SOLD_BY_BUY_NOW && myOrder && myOrder.status === 'PENDING' && (
                                <button
                                    onClick={() => navigate(`/payment?orderId=${myOrder.orderId}`)}
                                    className={`btn btn-primary`}
                                    style={{ width: '100%' }}
                                >
                                    결제하기 (주문 대기중)
                                </button>
                            )}
                            <button
                                onClick={toggleWishlist}
                                className={`btn ${isWishlisted ? 'btn-primary' : 'btn-outline'}`}
                                style={{ width: '100%' }}
                            >
                                {/* Heart Icon SVG */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                {isWishlisted ? '관심상품 해제' : '관심상품 추가'}
                            </button>
                        </div>
                    </div>

                    <div>
                        <h3 className={classes.descriptionTitle}>상품 설명</h3>
                        <p className={classes.description}>{item.description}</p>
                    </div>

                    <div className={classes.meta}>
                        <div className={classes.metaRow}>
                            <span>상품 ID:</span>
                            <span>#{item.auctionItemId}</span>
                        </div>
                        <div className={classes.metaRow}>
                            <span>판매자:</span>
                            <span>{item.sellerName || '알 수 없음'}</span>
                        </div>
                        <div className={classes.metaRow}>
                            <span>시작 일시:</span>
                            <span>{new Date(item.startAt).toLocaleString()}</span>
                        </div>
                        <div className={classes.metaRow}>
                            <span>종료 일시:</span>
                            <span>{new Date(item.endAt).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bid Confirmation Modal */}
            {showBidModal && (
                <div className={classes.modalOverlay} onClick={() => setShowBidModal(false)}>
                    <div className={classes.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={classes.modalHeader}>입찰 확인</div>
                        <div className={classes.modalBody}>
                            <p>현재 입찰가: <span className={classes.modalHighlight}>{(item.currentPrice || 0).toLocaleString()}원</span></p>
                            <p style={{ marginTop: '0.5rem' }}>
                                내 입찰가: <span className={classes.modalHighlight} style={{ color: 'var(--color-primary)', fontSize: '1.4rem' }}>{bidAmount.toLocaleString()}원</span>
                            </p>
                            <p style={{ marginTop: '1.5rem', fontSize: '0.95rem' }}>
                                입찰하시겠습니까? <br />
                                낙찰 시 구매 의무가 발생합니다.
                            </p>
                        </div>
                        <div className={classes.modalFooter}>
                            <button className={`${classes.modalBtn} ${classes.modalBtnCancel}`} onClick={() => setShowBidModal(false)}>
                                취소
                            </button>
                            <button className={`${classes.modalBtn} ${classes.modalBtnConfirm}`} onClick={confirmBid}>
                                입찰하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuctionDetail;
