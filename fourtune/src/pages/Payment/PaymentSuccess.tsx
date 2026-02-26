import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

import classes from './PaymentResult.module.css';

const PaymentSuccess: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'fail'>('loading');

    const isProcessing = React.useRef(false);

    useEffect(() => {
        const paymentKey = searchParams.get('paymentKey');
        const orderId = searchParams.get('orderId');
        const amount = searchParams.get('amount');

        if (!paymentKey || !orderId || !amount) {
            alert('결제 정보가 부족합니다.');
            navigate('/');
            return;
        }

        if (isProcessing.current) return;
        isProcessing.current = true;

        api.confirmPayment(paymentKey, orderId, Number(amount))
            .then(() => {
                setStatus('success');
            })
            .catch((err) => {
                console.error('Payment confirmation failed:', err);
                setStatus('fail');
            });
    }, [searchParams, navigate]);

    if (status === 'loading') {
        return (
            <div className={classes.container}>
                <div className={classes.card} style={{ maxWidth: '300px', padding: '2rem' }}>
                    <div className="spinner-border text-primary" role="status" style={{ marginBottom: '1rem' }}></div>
                    <p style={{ color: '#6b7280' }}>결제 승인 처리 중...</p>
                </div>
            </div>
        );
    }

    if (status === 'fail') {
        return (
            <div className={classes.container}>
                <div className={classes.card}>
                    <div className={`${classes.iconWrapper} ${classes.iconFail}`}>
                        ✕
                    </div>
                    <h2 className={classes.title}>결제 승인 실패</h2>
                    <p className={classes.message}>결제는 완료되었으나 승인 과정에서 문제가 발생했습니다.</p>
                    <button className={classes.primaryButton} onClick={() => navigate('/')}>
                        홈으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={classes.container}>
            <div className={classes.card}>
                <div className={`${classes.iconWrapper} ${classes.iconSuccess}`}>
                    ✓
                </div>
                <h1 className={classes.title}>결제 완료!</h1>
                <p className={classes.message}>주문이 성공적으로 처리되었습니다.</p>

                <div className={classes.detailsBox}>
                    <div className={classes.detailRow}>
                        <span className={classes.detailLabel}>주문번호</span>
                        <span className={classes.detailValue}>{searchParams.get('orderId')}</span>
                    </div>
                    <div className={classes.detailRow}>
                        <span className={`${classes.detailLabel} ${classes.totalLabel}`}>결제금액</span>
                        <span className={`${classes.detailValue} ${classes.totalValue}`}>
                            {Number(searchParams.get('amount')).toLocaleString()}원
                        </span>
                    </div>
                </div>

                <div className={classes.buttonGroup}>
                    <button
                        className={classes.secondaryButton}
                        onClick={() => navigate('/settlement')}
                    >
                        내역 보기
                    </button>
                    <button
                        className={classes.primaryButton}
                        onClick={() => navigate('/')}
                    >
                        홈으로
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
