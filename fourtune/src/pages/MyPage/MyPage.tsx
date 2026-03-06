import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { type AuctionItem, AuctionStatus } from '../../types';
import { type UserDetail } from '../../services/api.interface';
import { AuctionCard } from '../../components/features/AuctionCard';
import classes from './MyPage.module.css';
import { LoginRequired } from '../../components/common/LoginRequired';
import ProfileSettings from './ProfileSettings';
import WalletHistory from './WalletHistory';
import NotificationSettings from './NotificationSettings';
import { LoadingIndicator } from '../../components/common/LoadingIndicator/LoadingIndicator';
import { useLoadingDelay } from '../../hooks/useLoadingDelay';
import { useToast } from '../../contexts/ToastContext';

type Tab = 'watchlist' | 'orders' | 'bids' | 'auctions' | 'history' | 'profile' | 'wallet' | 'notifications';

const MyPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab') as Tab;

    // Initialize activeTab from URL or default to 'wishlist'
    const [activeTab, setActiveTabInternal] = useState<Tab>(
        (tabParam && ['watchlist', 'orders', 'bids', 'auctions', 'history', 'profile', 'wallet', 'notifications'].includes(tabParam))
            ? tabParam
            : 'watchlist'
    );

    const setActiveTab = (tab: Tab) => {
        setActiveTabInternal(tab);
        setSearchParams({ tab });
    };

    // Sync tab with URL parameter if it changes externally
    useEffect(() => {
        if (tabParam && tabParam !== activeTab && ['watchlist', 'orders', 'bids', 'auctions', 'history', 'profile', 'wallet', 'notifications'].includes(tabParam)) {
            setActiveTabInternal(tabParam);
        }
    }, [tabParam]);

    const [userInfo, setUserInfo] = useState<UserDetail | null>(null);
    const [watchlistItems, setWatchlistItems] = useState<AuctionItem[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [bids, setBids] = useState<any[]>([]);
    const [myAuctions, setMyAuctions] = useState<AuctionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    // Flicker prevention
    const shouldShowLoading = useLoadingDelay(loading, 300);

    const user = api.getCurrentUser() || { name: '비회원', email: '' };
    const isAuthenticated = api.isAuthenticated();

    if (!isAuthenticated) {
        return <LoginRequired message="로그인이 필요한 서비스입니다." />;
    }

    const fetchUserInfo = async () => {
        const currentUser = api.getCurrentUser();
        if (currentUser?.id) {
            try {
                const data = await api.getUser(currentUser.id);
                setUserInfo(data);
            } catch (err) {
                console.error("Failed to fetch user info", err);
            }
        }
    };

    useEffect(() => {
        fetchUserInfo();
    }, []);

    useEffect(() => {
        if (activeTab === 'watchlist') fetchWatchlist();
        else if (activeTab === 'orders') fetchOrders();
        else if (activeTab === 'bids') fetchBids();
        else if (activeTab === 'auctions') fetchMyAuctions();
        else setLoading(false);
    }, [activeTab]);

    const fetchWatchlist = async () => {
        setLoading(true);
        try {
            // Fetch real watchlist IDs from backend instead of stale localStorage
            const ids = await api.getMyWatchlist();
            if (ids && ids.length > 0) {
                const promises = ids.map(id => api.getAuctionById(id).catch(() => null));
                const results = await Promise.all(promises);
                // Filter out nulls (deleted auctions that returned 404)
                setWatchlistItems(results.filter((item): item is AuctionItem => item !== null));

                // Keep localStorage in sync for other components that might rely on it
                localStorage.setItem('watchlist', JSON.stringify(ids));
            } else {
                setWatchlistItems([]);
                localStorage.setItem('watchlist', JSON.stringify([]));
            }
        } catch (e) {
            console.error('Failed to fetch watchlist', e);
            setWatchlistItems([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await api.getMyOrders();
            setOrders(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchBids = async () => {
        setLoading(true);
        try {
            const data = await api.getMyBids();
            setBids(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchMyAuctions = async () => {
        setLoading(true);
        try {
            const data = await api.getMyAuctions({ size: 100 });
            setMyAuctions(data.content);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleCancelBid = async (bidId: number) => {
        if (!confirm('입찰을 취소하시겠습니까?')) return;
        try {
            await api.cancelBid(bidId);
            showToast('입찰이 취소되었습니다.');
            fetchBids();
        } catch (e: any) {
            showToast(e.response?.data?.message || '입찰 취소에 실패했습니다.', 'error');
        }
    };

    const handleCancelOrder = async (orderId: string) => {
        if (!confirm('주문을 취소하시겠습니까?')) return;
        try {
            await api.cancelOrder(orderId);
            showToast('주문이 취소되었습니다.');
            fetchOrders();
        } catch (e: any) {
            showToast(e.response?.data?.message || '주문 취소에 실패했습니다.', 'error');
        }
    };

    const handleDeleteAuction = async (id: number) => {
        if (!confirm('경매를 삭제하시겠습니까?')) return;
        try {
            await api.deleteAuction(id);
            showToast('경매가 삭제되었습니다.');
            fetchMyAuctions();
        } catch (e: any) {
            showToast(e.response?.data?.message || '경매 삭제에 실패했습니다.', 'error');
        }
    };

    const renderContent = () => {
        if (shouldShowLoading && activeTab !== 'profile' && activeTab !== 'wallet' && activeTab !== 'notifications') return <LoadingIndicator message="활동 정보를 불러오는 중..." />;
        if (loading && activeTab !== 'profile' && activeTab !== 'wallet' && activeTab !== 'notifications') return null;

        if (activeTab === 'profile') {
            return <ProfileSettings userInfo={userInfo} onUpdate={fetchUserInfo} />;
        }

        if (activeTab === 'wallet') {
            return <WalletHistory />;
        }

        if (activeTab === 'notifications') {
            return <NotificationSettings />;
        }

        if (activeTab === 'watchlist') {
            if (watchlistItems.length === 0) return <EmptyState icon="❤️" message="관심 상품이 없습니다." />;
            return (
                <div className={classes.grid}>
                    {watchlistItems.map(item => <AuctionCard key={item.auctionItemId} item={item} />)}
                </div>
            );
        }

        if (activeTab === 'orders') {
            if (orders.length === 0) return <EmptyState icon="📦" message="구매 내역이 없습니다." />;
            return (
                <div className={classes.cardList}>
                    {orders.map(order => (
                        <div key={order.orderId} className={classes.card}>
                            <div className={classes.cardHeader}>
                                <div className={classes.dateId}>
                                    {new Date(order.createdAt).toLocaleDateString()} · {order.orderId}
                                </div>
                                <span className={`${classes.badge} ${classes.badgeType}`}>
                                    {order.orderType === 'BUY_NOW' ? '즉시구매' : '낙찰성공'}
                                </span>
                            </div>
                            <h3 className={classes.cardTitle}>{order.auctionTitle}</h3>
                            <div className={classes.cardBody}>
                                <div className={classes.priceInfo}>
                                    <span className={classes.priceLabel}>결제 금액</span>
                                    <span className={classes.priceValue}>{order.finalPrice.toLocaleString()}원</span>
                                </div>
                                <div className={classes.statusContainer}>
                                    {order.status === 'COMPLETED' ? (
                                        <span className={`${classes.badge} ${classes.badgeSuccess}`}>결제완료</span>
                                    ) : order.status === 'PENDING' ? (
                                        <div className={classes.actionGroup}>
                                            <span className={`${classes.badge} ${classes.badgeWarning}`}>결제대기</span>
                                            <Link to={`/payment?orderId=${order.orderId}`} className={classes.actionBtn}>
                                                결제하기
                                            </Link>
                                            <button onClick={() => handleCancelOrder(order.orderId)} className={classes.dangerBtn}>
                                                주문취소
                                            </button>
                                        </div>
                                    ) : (
                                        <span className={`${classes.badge} ${classes.badgeDanger}`}>취소됨</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (activeTab === 'bids') {
            if (bids.length === 0) return <EmptyState icon="🔨" message="입찰 내역이 없습니다." />;
            return (
                <div className={classes.cardList}>
                    {bids.map(bid => (
                        <div key={bid.id} className={classes.card}>
                            <div className={classes.cardHeader}>
                                <div className={classes.dateId}>
                                    {new Date(bid.createdAt).toLocaleDateString()} · ID:{bid.id}
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    {bid.status === 'CANCELLED' ? (
                                        <span className={`${classes.badge} ${classes.badgeDanger}`}>취소됨</span>
                                    ) : (
                                        <>
                                            {bid.isWinning ? (
                                                <span className={`${classes.badge} ${classes.badgeSuccess}`}>최고입찰자</span>
                                            ) : (
                                                <span className={`${classes.badge} ${classes.badgeType}`}>상위입찰 존재</span>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                            <h3 className={classes.cardTitle}>{bid.auctionTitle || '상품 정보 없음'}</h3>
                            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Link to={`/auctions/${bid.auctionId}`} className={classes.textBtn}>
                                    경매 상품 상세보기 &rarr;
                                </Link>
                                {bid.status !== 'CANCELLED' && !bid.isWinning && (
                                    <button onClick={() => handleCancelBid(bid.id)} className={classes.dangerBtnSmall}>
                                        입찰 취소
                                    </button>
                                )}
                            </div>
                            <div className={classes.cardBody}>
                                <div className={classes.priceInfo}>
                                    <span className={classes.priceLabel}>나의 입찰가</span>
                                    <span className={classes.priceValue}>{bid.bidAmount.toLocaleString()}원</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (activeTab === 'auctions') {
            if (myAuctions.length === 0) return <EmptyState icon="📢" message="등록한 경매가 없습니다." />;
            return (
                <div className={classes.grid}>
                    {myAuctions.map(item => (
                        <AuctionCard
                            key={item.auctionItemId}
                            item={item}
                            actions={
                                <>
                                    {![AuctionStatus.ENDED, AuctionStatus.SOLD, AuctionStatus.SOLD_BY_BUY_NOW, AuctionStatus.CANCELLED].includes(item.status as any) && (
                                        <button onClick={() => navigate(`/auctions/edit/${item.auctionItemId}`)} className={classes.actionBtnSmall}>
                                            수정
                                        </button>
                                    )}
                                    <button onClick={() => handleDeleteAuction(item.auctionItemId)} className={classes.dangerBtnSmall}>
                                        삭제
                                    </button>
                                </>
                            }
                        />
                    ))}
                </div>
            );
        }

        return <EmptyState icon="📋" message="활동 기록이 없습니다." />;
    };

    return (
        <div className={classes.container}>
            <aside className={classes.sidebar}>
                <div className={classes.profileCard}>
                    <div className={classes.avatar}>{(userInfo?.nickname || user.name).charAt(0)}</div>
                    <div className={classes.username}>{userInfo?.nickname || user.name}</div>
                    <div className={classes.email}>{userInfo?.email || user.email}</div>
                    {userInfo && (
                        <div className={classes.userDetails}>
                            {userInfo.createdAt && (
                                <div className={classes.detailItem}>
                                    가입일: {new Date(userInfo.createdAt).toLocaleDateString()}
                                </div>
                            )}
                            {userInfo.updatedAt && (
                                <div className={classes.detailItem}>
                                    최근 수정: {new Date(userInfo.updatedAt).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    )}
                    <button
                        className={classes.editProfileBtn}
                        onClick={() => setActiveTab('profile')}
                    >
                        ⚙️ 프로필 수정
                    </button>
                    <button
                        className={classes.walletActionBtn}
                        onClick={() => setActiveTab('wallet')}
                    >
                        💰 지갑 / 결제 내역
                    </button>
                    <button
                        className={classes.walletActionBtn}
                        onClick={() => setActiveTab('notifications')}
                        style={{ marginTop: '8px' }}
                    >
                        🔔 알림 설정
                    </button>
                </div>
                <nav className={classes.menu}>
                    <button onClick={() => setActiveTab('watchlist')} className={`${classes.menuItem} ${activeTab === 'watchlist' ? classes.activeMenu : ''}`}>
                        ❤️ 관심상품
                    </button>
                    <button onClick={() => setActiveTab('auctions')} className={`${classes.menuItem} ${activeTab === 'auctions' ? classes.activeMenu : ''}`}>
                        📢 내 경매 관리
                    </button>
                    <button onClick={() => setActiveTab('orders')} className={`${classes.menuItem} ${activeTab === 'orders' ? classes.activeMenu : ''}`}>
                        📦 구매 내역
                    </button>
                    <button onClick={() => setActiveTab('bids')} className={`${classes.menuItem} ${activeTab === 'bids' ? classes.activeMenu : ''}`}>
                        🔨 입찰 내역
                    </button>
                    <button onClick={() => setActiveTab('history')} className={`${classes.menuItem} ${activeTab === 'history' ? classes.activeMenu : ''}`}>
                        📋 활동 기록
                    </button>
                </nav>
            </aside>
            <main className={classes.content}>
                <div className={classes.sectionHeader}>
                    <h2 className={classes.sectionTitle}>
                        {activeTab === 'profile' && '프로필 설정'}
                        {activeTab === 'wallet' && '지갑 / 결제 내역'}
                        {activeTab === 'notifications' && '알림 설정'}
                        {activeTab === 'watchlist' && '관심상품'}
                        {activeTab === 'auctions' && '내 경매 관리'}
                        {activeTab === 'orders' && '구매 내역'}
                        {activeTab === 'bids' && '입찰 내역'}
                        {activeTab === 'history' && '활동 기록'}
                    </h2>
                </div>
                {renderContent()}
            </main>
        </div>
    );
};

const EmptyState = ({ icon, message }: { icon: string, message: string }) => (
    <div className={classes.emptyState}>
        <div className={classes.emptyIcon}>{icon}</div>
        <p>{message}</p>
    </div>
);

export default MyPage;
