import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classes from './Header.module.css';
import { api } from '../../services/api';
import { LOGO_IMAGE } from '../../constants/images';
import NotificationDropdown from './NotificationDropdown';

export const Header: React.FC = () => {
    const navigate = useNavigate();
    const isAuthenticated = api.isAuthenticated();
    const [unreadCount, setUnreadCount] = useState(0);

    const [showNotifications, setShowNotifications] = useState(false);

    const fetchUnreadCount = async () => {
        if (!isAuthenticated) return;
        try {
            const notifications = await api.getMyNotifications();
            const unread = notifications.filter(n => !n.isRead).length;
            setUnreadCount(unread);
        } catch (err) {
            console.error("Failed to fetch notification count", err);
        }
    };

    useEffect(() => {
        fetchUnreadCount();

        // Listen for internal notification updates
        window.addEventListener('notificationsUpdated', fetchUnreadCount);

        // Polling for updates (every 30 seconds)
        const interval = setInterval(fetchUnreadCount, 30000);

        return () => {
            window.removeEventListener('notificationsUpdated', fetchUnreadCount);
            clearInterval(interval);
        };
    }, [isAuthenticated]);

    const handleLogout = () => {
        api.logout();
        navigate('/login');
    };

    return (
        <header className={classes.header}>
            <div className={`container ${classes.container}`}>
                <Link to="/" className={classes.logo}>
                    {LOGO_IMAGE ? (
                        <img src={LOGO_IMAGE} alt="CLOV4R" className={classes.logoImage} />
                    ) : (
                        "CLOV4R"
                    )}
                </Link>
                <nav className={classes.nav}>
                    <Link to="/auctions" className={classes.navSearch}>둘러보기</Link>
                    <Link to="/cart">장바구니</Link>
                    <Link to="/settlement">정산</Link>
                    <Link to="/mypage">마이페이지</Link>
                    {isAuthenticated ? (
                        <div className={classes.authButtons}>
                            <div className={classes.notificationContainer}>
                                <button
                                    className={classes.notificationWrapper}
                                    title="알림"
                                    onClick={() => setShowNotifications(!showNotifications)}
                                >
                                    <span className={classes.bellIcon}>🔔</span>
                                    {unreadCount > 0 && (
                                        <span className={classes.badge}>
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </button>
                                {showNotifications && (
                                    <NotificationDropdown onClose={() => setShowNotifications(false)} />
                                )}
                            </div>
                            <Link to="/auctions/create" className="btn btn-primary btn-sm">
                                상품 등록
                            </Link>
                            <button onClick={handleLogout} className="btn btn-outline btn-sm">로그아웃</button>
                        </div>
                    ) : (
                        <div className={classes.authButtons}>
                            <Link to="/login" className="btn btn-outline">로그인</Link>
                            <Link to="/signup" className="btn btn-primary">회원가입</Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

