import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { auctionService } from '../../services/auction.service';
import { type AuctionItem } from '../../types';
import { AuctionCard } from '../../components/features/AuctionCard';
import { AuctionCardSkeleton } from '../../components/features/AuctionCardSkeleton';
import { SearchBar } from '../../components/features/SearchBar/SearchBar';
import classes from './Home.module.css';

const Home: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleSearch = (keyword: string) => {
        navigate(`/auctions?keyword=${encodeURIComponent(keyword)}`);
    };

    const { data: recommendedItems = [], isLoading } = useQuery({
        queryKey: ['recommendations', isAuthenticated],
        queryFn: async () => {
            try {
                if (isAuthenticated) {
                    return await auctionService.getRecommendations(8);
                } else {
                    return await auctionService.getPopularRecommendations(8);
                }
            } catch (error) {
                console.error('Failed to fetch recommended items', error);
                // Fallback to search API
                const fallback = await auctionService.searchAuctions({
                    page: 0,
                    size: 8,
                    sort: 'POPULAR'
                });
                return fallback.content;
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

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

                <div className={classes.grid}>
                    {isLoading ? (
                        Array.from({ length: 8 }).map((_, idx) => (
                            <AuctionCardSkeleton key={idx} />
                        ))
                    ) : (
                        recommendedItems.map((item: AuctionItem) => (
                            <AuctionCard key={item.auctionItemId} item={item} />
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;
