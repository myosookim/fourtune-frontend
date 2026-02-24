import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { type AuctionItem } from '../../types';
import { type UserDetail } from '../../services/api.interface';
import { AuctionCard } from '../../components/features/AuctionCard';
import classes from './MyPage.module.css';
import { LoginRequired } from '../../components/common/LoginRequired';
import ProfileSettings from './ProfileSettings';
import WalletHistory from './WalletHistory';
import NotificationSettings from './NotificationSettings';

type Tab = 'wishlist' | 'orders' | 'bids' | 'history' | 'profile' | 'wallet' | 'notifications';

const MyPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('wishlist');
    const [userInfo, setUserInfo] = useState<UserDetail | null>(null);
    const [wishlistItems, setWishlistItems] = useState<AuctionItem[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [bids, setBids] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
        if (activeTab === 'wishlist') fetchWishlist();
        else if (activeTab === 'orders') fetchOrders();
        else if (activeTab === 'bids') fetchBids();
        else setLoading(false);
    }, [activeTab]);

    const fetchWishlist = async () => {
        setLoading(true);
        try {
            // Fetch real wishlist IDs from backend instead of stale localStorage
            const ids = await api.getMyWishlist();
            if (ids && ids.length > 0) {
                const promises = ids.map(id => api.getAuctionById(id).catch(() => null));
                const results = await Promise.all(promises);
                // Filter out nulls (deleted auctions that returned 404)
                setWishlistItems(results.filter((item): item is AuctionItem => item !== null));

                // Keep localStorage in sync for other components that might rely on it
                localStorage.setItem('wishlist', JSON.stringify(ids));
            } else {
                setWishlistItems([]);
                localStorage.setItem('wishlist', JSON.stringify([]));
            }
        } catch (e) {
            console.error('Failed to fetch wishlist', e);
            setWishlistItems([]);
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

    const renderContent = () => {
        if (loading && activeTab !== 'profile' && activeTab !== 'wallet') return <div className={classes.emptyState}>로딩 중...</div>;

        if (activeTab === 'profile') {
            return <ProfileSettings userInfo={userInfo} onUpdate={fetchUserInfo} />;
        }

        if (activeTab === 'wallet') {
            return <WalletHistory />;
        }

        if (activeTab === 'notifications') {
            return <NotificationSettings />;
        }

        if (activeTab === 'wishlist') {
            if (wishlistItems.length === 0) return <EmptyState icon="❤️" message="관심 상품이 없습니다." />;
            return (
                <div className={classes.grid}>
                    {wishlistItems.map(item => <AuctionCard key={item.auctionItemId} item={item} />)}
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
                                        <>
                                            <span className={`${classes.badge} ${classes.badgeWarning}`}>결제대기</span>
                                            <Link to={`/payment?orderId=${order.orderId}`} className={classes.actionBtn}>
                                                결제하기
                                            </Link>
                                        </>
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
                                {bid.isWinning ? (
                                    <span className={`${classes.badge} ${classes.badgeSuccess}`}>최고입찰자</span>
                                ) : (
                                    <span className={`${classes.badge} ${classes.badgeType}`}>상위입찰 존재</span>
                                )}
                            </div>
                            <h3 className={classes.cardTitle}>{bid.auctionTitle || '상품 정보 없음'}</h3>
                            <div style={{ marginBottom: '12px' }}>
                                <Link to={`/auctions/${bid.auctionId}`} className={classes.textBtn}>
                                    경매 상품 상세보기 &rarr;
                                </Link>
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
                    <button onClick={() => setActiveTab('wishlist')} className={`${classes.menuItem} ${activeTab === 'wishlist' ? classes.activeMenu : ''}`}>
                        ❤️ 관심상품
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
                        {activeTab === 'wishlist' && '관심상품'}
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
