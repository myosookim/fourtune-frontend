import React, { useEffect, useState, useRef } from 'react';
import { api } from '../../../services/api';
import classes from './SearchBar.module.css';

interface SearchBarProps {
    onSearch: (keyword: string) => void;
    onChange?: (keyword: string) => void;
    initialValue?: string;
    placeholder?: string;
    size?: 'default' | 'small';
}

export const SearchBar: React.FC<SearchBarProps> = ({
    onSearch,
    onChange,
    initialValue = '',
    placeholder = '시작할 검색어를 입력하세요...',
    size = 'default'
}) => {
    const [keyword, setKeyword] = useState(initialValue);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [showRecent, setShowRecent] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setKeyword(initialValue);
    }, [initialValue]);

    const fetchRecentSearches = async () => {
        if (!api.isAuthenticated()) return;
        try {
            const data = await api.getRecentSearches();
            setRecentSearches(data || []);
        } catch (err) {
            console.error("Failed to fetch recent searches", err);
        }
    };

    useEffect(() => {
        if (showRecent) {
            fetchRecentSearches();
        }
    }, [showRecent]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowRecent(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (term: string) => {
        const trimmedTerm = term.trim();
        if (trimmedTerm) {
            onSearch(trimmedTerm);
            setShowRecent(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch(keyword);
        }
    };

    const handleDeleteRecent = async (e: React.MouseEvent, term: string) => {
        e.stopPropagation();
        try {
            await api.deleteRecentSearch(term);
            setRecentSearches(prev => prev.filter(t => t !== term));
        } catch (err) { }
    };

    const handleClearAll = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await api.deleteAllRecentSearches();
            setRecentSearches([]);
        } catch (err) { }
    };

    return (
        <div className={`${classes.searchWrapper} ${size === 'small' ? classes.small : ''}`} ref={wrapperRef}>
            <div className={classes.searchBar}>
                <input
                    type="text"
                    className={classes.searchInput}
                    placeholder={placeholder}
                    value={keyword}
                    onChange={(e) => {
                        const val = e.target.value;
                        setKeyword(val);
                        if (onChange) onChange(val);
                    }}
                    onFocus={() => setShowRecent(true)}
                    onKeyDown={handleKeyDown}
                />

                {size === 'small' ? (
                    <button
                        className={classes.searchIconBtnSmall}
                        onClick={() => handleSearch(keyword)}
                        aria-label="검색"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>
                ) : (
                    <button
                        className={classes.searchButton}
                        onClick={() => handleSearch(keyword)}
                        aria-label="검색"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>
                )}
            </div>

            {showRecent && (
                <div className={classes.dropdown}>
                    <div className={classes.dropdownHeader}>
                        <span className={classes.dropdownTitle}>최근 검색어</span>
                        {recentSearches.length > 0 && (
                            <button className={classes.clearAllBtn} onClick={handleClearAll}>
                                전체 삭제
                            </button>
                        )}
                    </div>
                    <div className={classes.recentList}>
                        {recentSearches.length > 0 ? (
                            recentSearches.map((term) => (
                                <div
                                    key={term}
                                    className={classes.recentItem}
                                    onClick={() => {
                                        setKeyword(term);
                                        handleSearch(term);
                                    }}
                                >
                                    <span className={classes.recentLabel}>{term}</span>
                                    <button
                                        className={classes.deleteBtn}
                                        onClick={(e) => handleDeleteRecent(e, term)}
                                    >
                                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className={classes.emptyState}>최근 검색어가 없습니다.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
