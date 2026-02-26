import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AuctionCategory } from '../../types';
import { AUCTION_CATEGORY_KO } from '../../constants/translations';
import classes from './CategoryNav.module.css';
import { AppIcon } from './Icon/AppIcon';

export const CategoryNav: React.FC = () => {
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    // 'all' 또는 특정 카테고리를 추적하기 위해 string 타입 사용
    const [hoveredItem, setHoveredItem] = useState<string>('all');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isAllActive = location.pathname === '/auctions' && !location.search.includes('category=');

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 드롭다운이 열릴 때 현재 위치에 맞는 아이템을 기본 호버 상태로 설정
    useEffect(() => {
        if (isDropdownOpen) {
            const params = new URLSearchParams(location.search);
            const category = params.get('category');
            if (category) {
                setHoveredItem(category);
            } else if (isAllActive) {
                setHoveredItem('all');
            }
        }
    }, [isDropdownOpen, location.search, isAllActive]);

    useEffect(() => {
        setIsDropdownOpen(false);
    }, [location]);

    return (
        <div className={classes.navContainer}>
            <div className={`container ${classes.navContent}`}>
                <div
                    className={classes.dropdownContainer}
                    ref={dropdownRef}
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                >
                    <button
                        className={`${classes.categoryButton} ${isDropdownOpen ? classes.btnActive : ''}`}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        title="메뉴"
                    >
                        <AppIcon name="menu" size={24} />
                    </button>

                    {isDropdownOpen && (
                        <div className={classes.megaMenuWrapper}>
                            <div className={`container ${classes.megaMenuContent}`}>
                                {/* Sidebar */}
                                <div className={classes.sidebar}>
                                    <NavLink
                                        to="/auctions"
                                        className={() =>
                                            `${classes.sidebarItem} ${hoveredItem === 'all' ? classes.sidebarItemActive : ''}`
                                        }
                                        onMouseEnter={() => setHoveredItem('all')}
                                    >
                                        전체 상품
                                        {isAllActive && <span className={classes.currentIndicator}>•</span>}
                                    </NavLink>
                                    <div className={classes.divider} />
                                    {Object.values(AuctionCategory).map((category) => {
                                        const params = new URLSearchParams(location.search);
                                        const isActive = location.pathname === '/auctions' && params.get('category') === category;

                                        return (
                                            <NavLink
                                                key={category}
                                                to={`/auctions?category=${category}`}
                                                className={() =>
                                                    `${classes.sidebarItem} ${hoveredItem === category ? classes.sidebarItemActive : ''}`
                                                }
                                                onMouseEnter={() => setHoveredItem(category)}
                                            >
                                                <div className={classes.sidebarItemContent}>
                                                    {AUCTION_CATEGORY_KO[category]}
                                                    {isActive && <span className={classes.currentIndicator}>•</span>}
                                                </div>
                                                <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>›</span>
                                            </NavLink>
                                        );
                                    })}
                                </div>

                                {/* Sub Menu Area */}
                                <div className={classes.subMenuArea}>
                                    {hoveredItem === 'all' ? (
                                        <div className={classes.subMenuColumn}>
                                            <div className={classes.groupTitle}>전체 상품</div>
                                            <NavLink to="/auctions" className={classes.dropdownItem}>전체보기</NavLink>
                                            <NavLink to="/auctions" className={classes.dropdownItem}>오늘 마감 임박</NavLink>
                                            <NavLink to="/auctions" className={classes.dropdownItem}>실시간 인기 상품</NavLink>
                                        </div>
                                    ) : (
                                        <>
                                            <div className={classes.subMenuColumn}>
                                                <div className={classes.groupTitle}>{AUCTION_CATEGORY_KO[hoveredItem as AuctionCategory]} 추천</div>
                                                <NavLink
                                                    to={`/auctions?category=${hoveredItem}`}
                                                    className={classes.dropdownItem}
                                                >
                                                    {AUCTION_CATEGORY_KO[hoveredItem as AuctionCategory]} 전체보기
                                                </NavLink>
                                                <NavLink to={`/auctions?category=${hoveredItem}`} className={classes.dropdownItem}>신규 상품</NavLink>
                                                <NavLink to={`/auctions?category=${hoveredItem}`} className={classes.dropdownItem}>인기 경매</NavLink>
                                            </div>

                                            <div className={classes.subMenuColumn}>
                                                <div className={classes.groupTitle}>인기 테마</div>
                                                <NavLink to={`/auctions?category=${hoveredItem}`} className={classes.dropdownItem}>한정판 콜렉션</NavLink>
                                                <NavLink to={`/auctions?category=${hoveredItem}`} className={classes.dropdownItem}>오늘의 특가</NavLink>
                                            </div>

                                            <div className={classes.subMenuColumn}>
                                                <div className={classes.groupTitle}>이벤트</div>
                                                <NavLink to={`/auctions?category=${hoveredItem}`} className={classes.dropdownItem}>첫 입찰 할인</NavLink>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
