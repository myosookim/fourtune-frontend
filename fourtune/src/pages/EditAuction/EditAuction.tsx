import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import classes from './EditAuction.module.css';
import { api } from '../../services/api';
import { AuctionCategory } from '../../types';
import type { CreateAuctionRequest } from '../../services/api.interface';
import { AUCTION_CATEGORY_KO } from '../../constants/translations';
import { LoadingIndicator } from '../../components/common/LoadingIndicator/LoadingIndicator';
import { useLoadingDelay } from '../../hooks/useLoadingDelay';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

const EditAuction: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, user: currentUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [images, setImages] = useState<File[]>([]);
    const [isBuyNowEnabled, setIsBuyNowEnabled] = useState(false);
    const [auctionStatus, setAuctionStatus] = useState<string>('');
    const { showToast } = useToast();

    const [formData, setFormData] = useState<CreateAuctionRequest>({
        title: '',
        description: '',
        category: AuctionCategory.ETC,
        startPrice: 0,
        bidUnit: 1000,
        buyNowPrice: undefined,
        startAt: '',
        endAt: '',
    });

    // Flicker prevention
    const shouldShowLoading = useLoadingDelay(isLoading && !formData.title, 300);

    useEffect(() => {
        if (!isAuthenticated) {
            showToast('로그인이 필요합니다.', 'info');
            navigate('/login');
            return;
        }

        if (id) {
            setIsLoading(true);
            api.getAuctionById(Number(id))
                .then(data => {
                    // Check if current user is seller
                    if (data.sellerId !== currentUser?.id) {
                        showToast('본인의 경매만 수정할 수 있습니다.', 'error');
                        navigate(`/auctions/${id}`);
                        return;
                    }

                    // Check if auction is finished
                    const finishedStatuses = ['ENDED', 'SOLD', 'SOLD_BY_BUY_NOW', 'CANCELLED'];
                    if (finishedStatuses.includes(data.status)) {
                        showToast('종료된 경매는 수정할 수 없습니다.', 'info');
                        navigate(-1);
                        return;
                    }

                    setFormData({
                        title: data.title,
                        description: data.description,
                        category: data.category,
                        startPrice: data.startPrice,
                        bidUnit: data.bidUnit || 1000,
                        buyNowPrice: data.buyNowPrice || undefined,
                        startAt: data.startAt.slice(0, 16),
                        endAt: data.endAt.slice(0, 16),
                    });
                    setAuctionStatus(data.status);
                    setIsBuyNowEnabled(!!data.buyNowPrice && data.buyNowPrice > 0);
                })
                .catch(err => {
                    console.error('Failed to load auction for editing', err);
                    showToast('경매 정보를 불러오는 데 실패했습니다.', 'error');
                    navigate(-1);
                })
                .finally(() => setIsLoading(false));
        }
    }, [id, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: ['startPrice', 'buyNowPrice', 'bidUnit'].includes(name) ? Number(value) : value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const fileList = Array.from(e.target.files);
            setImages(fileList);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        setIsLoading(true);
        try {
            const payload = {
                ...formData,
                buyNowPrice: isBuyNowEnabled ? formData.buyNowPrice : undefined
            };

            await api.updateAuction(Number(id), payload, images.length > 0 ? images : undefined);
            showToast('경매 상품이 수정되었습니다!');
            navigate(`/auctions/${id}`);
        } catch (e) {
            const error = e as AxiosError<any>;
            console.error('Auction update error:', error);
            showToast(error.response?.data?.message || '경매 상품 수정에 실패했습니다.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (shouldShowLoading) return <LoadingIndicator message="상품 정보를 불러오는 중..." fullPage />;
    if (isLoading && !formData.title) return null;

    return (
        <div className={classes.container}>
            <div className={classes.formCard}>
                <div className={classes.header}>
                    <button onClick={() => navigate(-1)} className={`btn btn-outline btn-sm ${classes.backButton}`}>
                        ← 뒤로가기
                    </button>
                    <h1 className={classes.title}>경매 상품 수정</h1>
                </div>

                <form onSubmit={handleSubmit} className={classes.form}>
                    <div className={classes.formGroup}>
                        <label htmlFor="title" className={classes.label}>제목 *</label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            className={classes.input}
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className={classes.formGroup}>
                        <label htmlFor="description" className={classes.label}>설명 *</label>
                        <textarea
                            id="description"
                            name="description"
                            className={classes.textarea}
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={5}
                            required
                        />
                    </div>

                    <div className={classes.formGroup}>
                        <label htmlFor="category" className={classes.label}>카테고리 *</label>
                        <select
                            id="category"
                            name="category"
                            className={classes.select}
                            value={formData.category}
                            onChange={handleInputChange}
                            required
                            disabled={auctionStatus === 'ACTIVE'}
                        >
                            {Object.values(AuctionCategory).map(c => (
                                <option key={c} value={c}>{AUCTION_CATEGORY_KO[c]}</option>
                            ))}
                        </select>
                        {auctionStatus === 'ACTIVE' && (
                            <p className={classes.hint}>진행 중인 경매의 카테고리는 변경할 수 없습니다.</p>
                        )}
                    </div>

                    <div className={classes.formRow}>
                        <div className={classes.formGroup}>
                            <label htmlFor="startPrice" className={classes.label}>시작가 (원) *</label>
                            <input
                                id="startPrice"
                                name="startPrice"
                                type="number"
                                className={classes.input}
                                value={formData.startPrice || ''}
                                onChange={handleInputChange}
                                min="1"
                                required
                                disabled={auctionStatus === 'ACTIVE'}
                            />
                            {auctionStatus === 'ACTIVE' && (
                                <p className={classes.hint}>진행 중인 경매의 시작가는 변경할 수 없습니다.</p>
                            )}
                        </div>

                        <div className={classes.formGroup}>
                            <label htmlFor="bidUnit" className={classes.label}>입찰 단위 (원)</label>
                            <input
                                id="bidUnit"
                                name="bidUnit"
                                type="number"
                                className={classes.input}
                                value={formData.bidUnit || ''}
                                onChange={handleInputChange}
                                min="1"
                                disabled={auctionStatus === 'ACTIVE'}
                            />
                            {auctionStatus === 'ACTIVE' && (
                                <p className={classes.hint}>진행 중인 경매의 입찰 단위는 변경할 수 없습니다.</p>
                            )}
                        </div>
                    </div>

                    <div className={classes.formRow}>
                        <div className={classes.formGroup} style={{ flex: 1 }}>
                            <div className={classes.labelHeader}>
                                <label className={classes.label}>즉시구매가 (원)</label>
                                <div className={classes.toggleWrapper}>
                                    <span className={classes.toggleStateLabel}>{isBuyNowEnabled ? 'ON' : 'OFF'}</span>
                                    <label className={classes.toggleSwitch}>
                                        <input
                                            type="checkbox"
                                            checked={isBuyNowEnabled}
                                            onChange={(e) => setIsBuyNowEnabled(e.target.checked)}
                                        />
                                        <span className={classes.slider}></span>
                                    </label>
                                </div>
                            </div>

                            <input
                                id="buyNowPrice"
                                name="buyNowPrice"
                                type="number"
                                className={classes.input}
                                placeholder={isBuyNowEnabled ? "50000" : "사용 안 함"}
                                value={formData.buyNowPrice || ''}
                                onChange={handleInputChange}
                                min="1"
                                disabled={!isBuyNowEnabled}
                            />
                        </div>
                    </div>

                    <div className={classes.formRow}>
                        <div className={classes.formGroup}>
                            <label htmlFor="startAt" className={classes.label}>경매 시작 시간 *</label>
                            <input
                                id="startAt"
                                name="startAt"
                                type="datetime-local"
                                className={classes.input}
                                value={formData.startAt}
                                onChange={handleInputChange}
                                disabled={auctionStatus !== 'SCHEDULED'}
                                required
                            />
                            {auctionStatus && auctionStatus !== 'SCHEDULED' && (
                                <p className={classes.hint}>
                                    {auctionStatus === 'ACTIVE'
                                        ? '진행 중인 경매의 시작 시간은 변경할 수 없습니다.'
                                        : '종료된 경매의 시작 시간은 변경할 수 없습니다.'}
                                </p>
                            )}
                        </div>

                        <div className={classes.formGroup}>
                            <label htmlFor="endAt" className={classes.label}>경매 종료 시간 *</label>
                            <input
                                id="endAt"
                                name="endAt"
                                type="datetime-local"
                                className={classes.input}
                                value={formData.endAt}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className={classes.formGroup}>
                        <label htmlFor="images" className={classes.label}>상품 이미지 (새로 업로드할 경우만 선택)</label>
                        <input
                            id="images"
                            name="images"
                            type="file"
                            className={classes.fileInput}
                            onChange={handleImageChange}
                            accept="image/*"
                            multiple
                        />
                        <p className={classes.hint}>이미지를 선택하면 기존 이미지가 대체됩니다.</p>
                    </div>

                    <button type="submit" className={`btn btn-primary ${classes.submitBtn}`} disabled={isLoading}>
                        {isLoading ? '수정 중...' : '경매 상품 수정하기'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditAuction;
