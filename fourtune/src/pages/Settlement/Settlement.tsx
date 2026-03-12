import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { type SettlementResponse, type SettlementCandidatedItemDto } from '../../types';
import classes from './Settlement.module.css';
import { LoginRequired } from '../../components/common/LoginRequired';
import { LoadingIndicator } from '../../components/common/LoadingIndicator/LoadingIndicator';
import { useLoadingDelay } from '../../hooks/useLoadingDelay';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const SettlementPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<SettlementResponse[]>([]);
    const [pendings, setPendings] = useState<SettlementCandidatedItemDto[]>([]);

    // Flicker prevention
    const shouldShowLoading = useLoadingDelay(loading, 300);
    const { isAuthenticated } = useAuth();
    const { showToast } = useToast();

    useEffect(() => {
        if (isAuthenticated) {
            loadData();
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <LoginRequired
                message="정산 내역을 확인하시려면 로그인이 필요합니다."
            />
        );
    }

    const loadData = async () => {
        setLoading(true);
        try {
            const [pendingData, historyData] = await Promise.all([
                api.getSettlementPendings().catch(() => []),
                api.getAllSettlements().catch(() => [])
            ]);

            setPendings(pendingData || []);
            setHistory(historyData || []);

        } catch (error) {
            console.error("Failed to load settlement data", error);
        } finally {
            setLoading(false);
        }
    };

    if (shouldShowLoading) return <LoadingIndicator message="정산 데이터를 불러오는 중..." fullPage />;
    if (loading) return null;

    const totalSettledAmount = history.reduce((sum, item) => sum + item.totalAmount, 0);

    return (
        <div className={classes.container}>
            <h1 className={classes.title}>정산 내역</h1>

            {/* Summary Card */}
            <div className={classes.summaryCard}>
                <div className={classes.summaryLabel}>총 정산 완료 금액</div>
                <div className={classes.summaryValue}>{totalSettledAmount.toLocaleString()}원</div>
                <div className={classes.summaryPending}>
                    <span>대기 중인 정산금:</span>
                    <strong>{pendings.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}원</strong>
                </div>
            </div>

            {/* Pending Settlements */}
            <div className={classes.section}>
                <div className={classes.sectionTitle}>
                    <span>정산 대기 목록</span>
                    <span className={classes.badge + ' ' + classes.badgePending}>{pendings.length}건</span>
                </div>

                {pendings.length === 0 ? (
                    <div className={classes.emptyState}>정산 대기 중인 내역이 없습니다.</div>
                ) : (
                    <div className={classes.tableContainer}>
                        <table className={classes.table}>
                            <thead>
                                <tr>
                                    <th>날짜</th>
                                    <th>유형</th>
                                    <th>항목</th>
                                    <th>구매자</th>
                                    <th>금액</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendings.map((item) => (
                                    <tr key={item.id}>
                                        <td className={classes.date}>{new Date(item.paymentDate).toLocaleDateString()}</td>
                                        <td>{item.settlementEventType}</td>
                                        <td>{item.relTypeCode} #{item.relId}</td>
                                        <td>{item.payerName || '-'}</td>
                                        <td className={classes.amount}>{item.amount.toLocaleString()}원</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Settlement History */}
            <div className={classes.section}>
                <div className={classes.sectionTitle}>
                    <span>정산 완료 내역</span>
                    <span className={classes.badge + ' ' + classes.badgeSuccess}>{history.length}건</span>
                </div>

                {history.length === 0 ? (
                    <div className={classes.emptyState}>정산 완료 내역이 없습니다.</div>
                ) : (
                    <div className={classes.tableContainer}>
                        <table className={classes.table}>
                            <thead>
                                <tr>
                                    <th>정산일</th>
                                    <th>정산서 ID</th>
                                    <th>항목 수</th>
                                    <th>총액</th>
                                    <th>상세</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((settlement) => (
                                    <tr key={settlement.id}>
                                        <td className={classes.date}>
                                            {settlement.settledAt ? new Date(settlement.settledAt).toLocaleDateString() : '처리 중'}
                                        </td>
                                        <td>#{settlement.id}</td>
                                        <td>{settlement.items?.length || 0}건</td>
                                        <td className={classes.amount}>{settlement.totalAmount.toLocaleString()}원</td>
                                        <td>
                                            <button
                                                onClick={() => showToast(`포함 항목: ${settlement.items.map(i => `${i.relTypeCode} #${i.relId} (${i.amount.toLocaleString()}원)`).join(', ')}`, 'info')}
                                            >
                                                상세보기
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettlementPage;
