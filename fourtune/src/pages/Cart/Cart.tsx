import React, { useEffect, useState } from 'react';
// Force TS Recheck
import { Link, useNavigate } from 'react-router-dom';
import { LoginRequired } from '../../components/common/LoginRequired';
import { api } from '../../services/api';
import { type CartResponse, type CartItemResponse, CartItemStatus } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import classes from './Cart.module.css';

const Cart: React.FC = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState<CartResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [processing, setProcessing] = useState(false);

    const isAuthenticated = api.isAuthenticated();

    if (!isAuthenticated) {
        return (
            <LoginRequired
                message="장바구니를 이용하시려면 로그인이 필요합니다."
            />
        );
    }

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            setLoading(true);
            const data = await api.getCart();
            setCart(data);

            // Default select all active items
            const activeIds = data.items
                .filter((item: CartItemResponse) => item.status === CartItemStatus.ACTIVE)
                .map((item: CartItemResponse) => item.id);
            setSelectedIds(new Set(activeIds));
        } catch (error) {
            console.error('Failed to load cart', error);
            showToast('장바구니를 불러오는데 실패했습니다.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (id: number) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleSelectAll = () => {
        if (!cart) return;
        const activeItems = cart.items.filter(item => item.status === CartItemStatus.ACTIVE);

        if (selectedIds.size === activeItems.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(activeItems.map((item: CartItemResponse) => item.id)));
        }
    };

    const handleRemove = async (cartItemId: number) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            await api.removeItemFromCart(cartItemId);
            // Reload cart
            const data = await api.getCart();
            setCart(data);

            // Adjust selection
            if (selectedIds.has(cartItemId)) {
                const newSelected = new Set(selectedIds);
                newSelected.delete(cartItemId);
                setSelectedIds(newSelected);
            }
        } catch (error) {
            console.error('Failed to remove item', error);
            showToast('삭제에 실패했습니다.', 'error');
        }
    };

    const handleCheckout = async () => {
        if (selectedIds.size === 0) return;

        try {
            setProcessing(true);
            const orderIds = await api.buyNowFromCart(Array.from(selectedIds));
            // Navigate to payment page with the first orderId (assuming bulk payment page uses same logic or we loop? 
            // Wait, standard Payment page takes a single orderId usually.
            // If backend returns multiple orderIds, we might need a bulk payment page or handle them sequentially.
            // The requirement didn't specify bulk payment UI, but standard flows usually bundle them.
            // However, toss payments usually works on one orderId (one `amount`).
            // Backend probably aggregates them into one "Payment Group"? 
            // Or maybe returns individual orders.

            // Reviewing typical backend logic: `buyNowFromCart` returns list of orderIds.
            // If length > 1, frontend needs to handle it.
            // For MVP, let's assume we redirect to payment for the first one, or if backend supports list.

            // Actually, `Payment.tsx` (which we haven't seen fully code of) usually verifies `orderId`.
            // Let's assume for now we just take the first one if multiple, OR we alert user.
            // Wait, if it returns a list, it means separate orders were created.
            // Paying for them individually is bad UX.
            // Ideally backend returns a single "Group Order" ID or we pass multiple IDs to payment page.
            // Let's check `buyNowFromCart` backend logic (reading controller earlier):
            // It calls `cartFacade.buyNowFromCart` which returns `List<String> orderIds`.

            // If I have multiple orders, I probably need to pay for them one by one unless there is a global payment.
            // Re-checking `getPurchaseHistory` implementation plan... we added "Pay" button for pending orders.
            // So if `buyNow` creates PENDING orders, we can redirect user to "Purchase History" or "Success" page saying "Orders Created, Please Pay".

            // Strategy: Redirect to Purchase History if multiple, or Payment if single.
            if (orderIds.length === 1) {
                navigate(`/payment?orderId=${orderIds[0]}`);
            } else if (orderIds.length > 1) {
                showToast(`${orderIds.length}개의 주문이 생성되었습니다.`);
                navigate('/my/orders');
            } else {
                showToast('주문 생성에 실패했습니다.', 'error');
            }

        } catch (error: any) {
            console.error('Checkout failed', error);
            showToast(error.response?.data?.message || '주문 생성에 실패했습니다.', 'error');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className={classes.container}>Loading...</div>;
    if (!cart) return <div className={classes.container}>Error loading cart</div>;

    const activeItems = cart.items.filter((item: CartItemResponse) => item.status === CartItemStatus.ACTIVE);
    const selectedItems = activeItems.filter((item: CartItemResponse) => selectedIds.has(item.id));
    const totalPrice = selectedItems.reduce((sum: number, item: CartItemResponse) => sum + (item.currentBuyNowPrice || item.buyNowPriceWhenAdded), 0);

    return (
        <div className={classes.container}>
            <div className={classes.header}>
                <h1 className={classes.title}>장바구니 ({cart.activeItemCount})</h1>
            </div>

            {cart.items.length === 0 ? (
                <div className={classes.emptyCart}>
                    <p>장바구니가 비어있습니다.</p>
                    <Link to="/" className={classes.emptyLink}>경매 구경하러 가기</Link>
                </div>
            ) : (
                <div className={classes.contentWrapper}>
                    {/* List */}
                    <div className={classes.cartList}>
                        <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                                type="checkbox"
                                checked={activeItems.length > 0 && selectedIds.size === activeItems.length}
                                onChange={handleSelectAll}
                                disabled={activeItems.length === 0}
                                className={classes.checkbox}
                            />
                            <span>전체 선택 ({selectedIds.size}/{activeItems.length})</span>
                        </div>

                        {cart.items.map((item: CartItemResponse) => (
                            <div key={item.id} className={classes.cartItem} style={{ opacity: item.status !== CartItemStatus.ACTIVE ? 0.5 : 1 }}>
                                <input
                                    type="checkbox"
                                    checked={selectedIds.has(item.id)}
                                    onChange={() => handleSelect(item.id)}
                                    disabled={item.status !== CartItemStatus.ACTIVE}
                                    className={classes.checkbox}
                                />
                                <img
                                    src={item.thumbnailUrl || 'https://via.placeholder.com/100'}
                                    alt={item.auctionTitle || 'Item'}
                                    className={classes.itemImage}
                                />
                                <div className={classes.itemInfo}>
                                    <Link to={`/auctions/${item.auctionId}`} className={classes.itemTitle}>
                                        {item.auctionTitle || 'Unknown Item'}
                                    </Link>
                                    <div className={classes.itemMeta}>
                                        {item.status !== CartItemStatus.ACTIVE ? (
                                            <span style={{ color: 'red', fontWeight: 'bold' }}>
                                                {item.status === CartItemStatus.SOLD ? '판매완료' : '종료됨'}
                                            </span>
                                        ) : (
                                            <span>즉시구매 가능</span>
                                        )}
                                    </div>
                                    <div className={classes.itemPrice}>
                                        {(item.currentBuyNowPrice || item.buyNowPriceWhenAdded).toLocaleString()}원
                                    </div>
                                </div>
                                <button onClick={() => handleRemove(item.id)} className={classes.removeButton}>
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className={classes.summaryBox}>
                        <div className={classes.summaryTitle}>주문 예상 금액</div>
                        <div className={classes.summaryRow}>
                            <span>총 상품금액</span>
                            <span>{totalPrice.toLocaleString()}원</span>
                        </div>
                        <div className={classes.summaryRow}>
                            <span>배송비</span>
                            <span>0원</span>
                        </div>
                        <div className={classes.totalRow}>
                            <span>총 결제금액</span>
                            <span>{totalPrice.toLocaleString()}원</span>
                        </div>
                        <button
                            className={classes.checkoutButton}
                            onClick={handleCheckout}
                            disabled={selectedIds.size === 0 || processing}
                        >
                            {processing ? '처리 중...' : `${selectedIds.size}개 상품 구매하기`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
