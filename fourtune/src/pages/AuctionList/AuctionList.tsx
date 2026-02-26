import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { type AuctionItem, AuctionCategory, AuctionStatus } from '../../types';
import { AuctionCard } from '../../components/features/AuctionCard';
import { SearchBar } from '../../components/features/SearchBar/SearchBar';
import { AUCTION_STATUS_KO, AUCTION_CATEGORY_KO } from '../../constants/translations';
import classes from './AuctionList.module.css';

const AuctionList: React.FC = () => {
    const [items, setItems] = useState<AuctionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [searchParams] = useSearchParams();

    // Filters
    const [keyword, setKeyword] = useState('');
    const [category, setCategory] = useState<AuctionCategory | ''>('');
    const [status, setStatus] = useState<AuctionStatus | ''>('');
    const [sort, setSort] = useState('LATEST');

    // Debounce search
    const [debouncedKeyword, setDebouncedKeyword] = useState(keyword);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedKeyword(keyword);
            setPage(0); // Reset to page 0 on new search
        }, 500);
        return () => clearTimeout(timer);
    }, [keyword]);

    const handleSearch = (val: string) => {
        setKeyword(val);
    };

    // Sync category from URL
    useEffect(() => {
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
            // Validate if it is a valid category
            if (Object.values(AuctionCategory).includes(categoryParam as AuctionCategory)) {
                setCategory(categoryParam as AuctionCategory);
            }
        } else {
            setCategory('');
        }
        setPage(0);
    }, [searchParams]);

    useEffect(() => {
        fetchData();
    }, [debouncedKeyword, category, status, sort, page]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.searchAuctions({
                page,
                size: 12,
                keyword: debouncedKeyword,
                category: category as AuctionCategory,
                status: status as AuctionStatus,
                sort
            });
            setItems(response.content);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCategory(e.target.value as AuctionCategory);
        setPage(0);
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatus(e.target.value as AuctionStatus);
        setPage(0);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSort(e.target.value);
        setPage(0);
    };

    return (
        <div className={classes.pageContainer}>
            <div className={classes.headerSection}>
                <h1>경매 상품</h1>
                <div className={classes.controls}>
                    <div className={classes.searchContainer}>
                        <SearchBar
                            onSearch={handleSearch}
                            onChange={setKeyword}
                            initialValue={keyword}
                            size="small"
                        />
                    </div>
                    <div className={classes.filters}>

                        <select className={classes.select} value={category} onChange={handleCategoryChange}>
                            <option value="">모든 카테고리</option>
                            {Object.values(AuctionCategory).map(c => (
                                <option key={c} value={c}>{AUCTION_CATEGORY_KO[c]}</option>
                            ))}
                        </select>

                        <select className={classes.select} value={status} onChange={handleStatusChange}>
                            <option value="">모든 상태</option>
                            {[AuctionStatus.SCHEDULED, AuctionStatus.ACTIVE, AuctionStatus.ENDED].map(s => (
                                <option key={s} value={s}>{AUCTION_STATUS_KO[s]}</option>
                            ))}
                        </select>

                        <select className={classes.select} value={sort} onChange={handleSortChange}>
                            <option value="LATEST">최신순</option>
                            <option value="POPULAR">인기순</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className={classes.loader}>상품을 불러오는 중...</div>
            ) : (
                <>
                    {items.length === 0 ? (
                        <div className={classes.loader}>검색 결과가 없습니다.</div>
                    ) : (
                        <div className={classes.grid}>
                            {items.map(item => (
                                <AuctionCard key={item.auctionItemId} item={item} />
                            ))}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className={classes.pagination}>
                            <button
                                className={classes.pageBtn}
                                disabled={page === 0}
                                onClick={() => setPage(p => p - 1)}
                            >
                                &lt;
                            </button>
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    className={`${classes.pageBtn} ${i === page ? classes.active : ''}`}
                                    onClick={() => setPage(i)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                className={classes.pageBtn}
                                disabled={page === totalPages - 1}
                                onClick={() => setPage(p => p + 1)}
                            >
                                &gt;
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AuctionList;
