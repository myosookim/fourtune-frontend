import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { type AuctionItem } from '../../types';
import { AuctionCard } from '../../components/features/AuctionCard';
import { SearchBar } from '../../components/features/SearchBar/SearchBar';
import classes from './Home.module.css';

const Home: React.FC = () => {
    const [recommendedItems, setRecommendedItems] = useState<AuctionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const handleSearch = (keyword: string) => {
        navigate(`/auctions?keyword=${encodeURIComponent(keyword)}`);
    };

    useEffect(() => {
        const fetchRecommended = async () => {
            try {
                let items;
                if (api.isAuthenticated()) {
                    items = await api.getRecommendations(8);
                } else {
                    items = await api.getPopularRecommendations(8);
                }
                setRecommendedItems(items);
            } catch (error) {
                console.error('Failed to fetch recommended items', error);

                // Final fallback to search API if recommendation service is down
                try {
                    const fallback = await api.searchAuctions({
                        page: 0,
                        size: 8,
                        sort: 'POPULAR'
                    });
                    setRecommendedItems(fallback.content);
                } catch (e) {
                    console.error('All recommendation options failed', e);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchRecommended();
    }, []);

    return (
        <div>
            {/* Hero Section */}
            <section className={classes.hero}>
                <h1 className={classes.heroTitle}>
                    당신의 행운을<br />경매하세요
                </h1>
                <p className={classes.heroSubtitle}>
                    희귀한 수집품부터 일상 용품까지, <br />
                    CLOV4R에서 특별한 가격으로 만나보세요.
                </p>
                <div className={classes.searchWrapper}>
                    <SearchBar onSearch={handleSearch} />
                </div>
                <Link to="/auctions" className="btn btn-primary btn-lg">
                    경매 둘러보기
                </Link>
            </section>

            {/* Recommended Products Section */}
            <section className={classes.section}>
                <div className={classes.sectionHeader}>
                    <h2 className={classes.sectionTitle}>추천 상품</h2>
                    <Link to="/auctions" className={classes.viewAllLink}>
                        전체 보기 →
                    </Link>
                </div>

                {loading ? (
                    <div className={classes.loader}>상품을 불러오는 중...</div>
                ) : (
                    <div className={classes.grid}>
                        {recommendedItems.map(item => (
                            <AuctionCard key={item.auctionItemId} item={item} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;
