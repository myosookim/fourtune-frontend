import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { type WalletResponse } from '../../services/api.interface';
import classes from './WalletHistory.module.css';
import { LoadingIndicator } from '../../components/common/LoadingIndicator/LoadingIndicator';
import { useLoadingDelay } from '../../hooks/useLoadingDelay';

const WalletHistory: React.FC = () => {
    const [walletData, setWalletData] = useState<WalletResponse | null>(null);
    const [loading, setLoading] = useState(true);

    // Flicker prevention
    const shouldShowLoading = useLoadingDelay(loading, 300);

    useEffect(() => {
        const fetchWallet = async () => {
            try {
                const data = await api.getWalletSummary();
                setWalletData(data);
            } catch (err) {
                console.error("Failed to load wallet data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchWallet();
    }, []);

    if (shouldShowLoading) return <LoadingIndicator message="지갑 정보를 불러오는 중..." />;
    if (loading) return null;

    if (!walletData) {
        return <div className={classes.errorState}>지갑 정보를 불러올 수 없습니다.</div>;
    }

    return (
        <div className={classes.walletContainer}>
            <div className={classes.balanceCard}>
                <h3 className={classes.balanceTitle}>포춘 페이 잔액</h3>
                <div className={classes.balanceAmount}>
                    {(walletData.balance || 0).toLocaleString()} <span>원</span>
                </div>
                <div className={classes.balanceActions}>
                    <button className={classes.chargeBtn}>충전하기</button>
                    <button className={classes.withdrawBtn}>출금하기</button>
                </div>
            </div>

            <div className={classes.historySection}>
                <h4 className={classes.historyTitle}>최근 이용 내역</h4>
                {(!walletData.history || walletData.history.length === 0) ? (
                    <div className={classes.emptyHistory}>이용 내역이 없습니다.</div>
                ) : (
                    <ul className={classes.historyList}>
                        {walletData.history.map((log) => (
                            <li key={log.id} className={classes.historyItem}>
                                <div className={classes.historyInfo}>
                                    <span className={`${classes.eventType} ${log.eventType === '충전' ? classes.typeCharge : classes.typeUse}`}>
                                        {log.eventType}
                                    </span>
                                    <div className={classes.historyDetails}>
                                        <span className={classes.relType}>{log.relTypeCode}</span>
                                        <span className={classes.date}>{new Date(log.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className={classes.amountInfo}>
                                    <span className={`${classes.amount} ${log.amount > 0 ? classes.amountPlus : classes.amountMinus}`}>
                                        {log.amount > 0 ? '+' : ''}{log.amount.toLocaleString()}원
                                    </span>
                                    <span className={classes.currentBalance}>잔액 {log.balance.toLocaleString()}원</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default WalletHistory;
