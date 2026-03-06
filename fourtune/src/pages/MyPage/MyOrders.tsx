import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import type { OrderResponse } from '../../services/api.interface';
import styles from './MyOrders.module.css';
import { LoadingIndicator } from '../../components/common/LoadingIndicator/LoadingIndicator';
import { useLoadingDelay } from '../../hooks/useLoadingDelay';
import { useToast } from '../../contexts/ToastContext';

const MyOrders: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();

    // Flicker prevention
    const shouldShowLoading = useLoadingDelay(loading, 300);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await api.getMyOrders();
                setOrders(data);
            } catch (err) {
                console.error('Failed to fetch orders:', err);
                setError('주문 내역을 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleOrderClick = (orderId: string, status: string) => {
        // If pending, go to payment/order sheet
        if (status === 'PENDING') {
            navigate(`/order/${orderId}`);
        } else {
            // For completed orders, we could show a detail modal or just stay here for now
            // Future: navigate(`/my/orders/${orderId}`)
            showToast(`상세 보기 기능은 준비 중입니다. (${orderId})`, 'info');
        }
    };

    if (shouldShowLoading) return <LoadingIndicator message="주문 내역을 불러오는 중..." fullPage />;
    if (loading) return null;
    if (error) return <div className={styles.container}>{error}</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>내 주문 내역</h1>

            {orders.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>주문 내역이 없습니다.</p>
                    <button className={styles.shopButton} onClick={() => navigate('/auctions')}>
                        경매 둘러보기
                    </button>
                </div>
            ) : (
                <div className={styles.orderList}>
                    {orders.map((order) => (
                        <div key={order.orderId} className={styles.orderCard}>
                            <div className={styles.cardHeader}>
                                <span className={styles.date}>{new Date(order.createdAt).toLocaleDateString()}</span>
                                <span className={styles.orderId}>주문번호: {order.orderId}</span>
                            </div>
                            <div className={styles.cardBody}>
                                <div className={styles.info}>
                                    <h3 className={styles.productName}>{order.auctionTitle}</h3>
                                    <p className={styles.price}>{order.finalPrice.toLocaleString()}원</p>
                                    <div className={styles.badges}>
                                        <span className={`${styles.badge} ${styles[order.orderType]}`}>
                                            {order.orderType === 'AUCTION_WIN' ? '낙찰' : '즉시구매'}
                                        </span>
                                        <span className={`${styles.badge} ${styles[order.status]}`}>
                                            {order.status === 'PENDING' ? '결제대기' :
                                                order.status === 'COMPLETED' ? '결제완료' : '취소됨'}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.actions}>
                                    <button
                                        className={styles.actionButton}
                                        onClick={() => handleOrderClick(order.orderId, order.status)}
                                    >
                                        {order.status === 'PENDING' ? '결제하기' : '상세보기'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders;
