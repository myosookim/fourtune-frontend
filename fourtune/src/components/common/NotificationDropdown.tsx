import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { type NotificationResponseDto } from '../../services/api.interface';
import classes from './NotificationDropdown.module.css';

interface Props {
    onClose: () => void;
}

const NotificationDropdown: React.FC<Props> = ({ onClose }) => {
    const [notifications, setNotifications] = useState<NotificationResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await api.getMyNotifications();
                setNotifications(data);
            } catch (err) {
                console.error("Failed to fetch notifications", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();

        // Handle clicks outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleRead = async (id: number) => {
        try {
            await api.readNotification(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            window.dispatchEvent(new CustomEvent('notificationsUpdated'));
        } catch (err) {
            console.error("Failed to mark notification as read", err);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            window.dispatchEvent(new CustomEvent('notificationsUpdated'));
        } catch (err) {
            console.error("Failed to delete notification", err);
        }
    };

    return (
        <div className={classes.dropdown} ref={dropdownRef}>
            <div className={classes.header}>
                <h3 className={classes.title}>알림</h3>
                <button className={classes.closeBtn} onClick={onClose}>&times;</button>
            </div>

            <div className={classes.list}>
                {loading ? (
                    <div className={classes.status}>로딩 중...</div>
                ) : notifications.length === 0 ? (
                    <div className={classes.status}>알림이 없습니다.</div>
                ) : (
                    notifications.map(n => (
                        <div
                            key={n.id}
                            className={`${classes.item} ${n.isRead ? classes.read : ''}`}
                            onClick={() => !n.isRead && handleRead(n.id)}
                        >
                            <div className={classes.itemHeader}>
                                <span className={classes.typeBadge} data-type={n.type}>
                                    {n.type === 'BID' ? '입찰' : n.type === 'PAYMENT' ? '결제' : '시스템'}
                                </span>
                                <span className={classes.date}>{new Date(n.sendAt).toLocaleDateString()}</span>
                            </div>
                            <div className={classes.itemBody}>
                                <div className={classes.itemTitle}>{n.title}</div>
                                <div className={classes.itemContent}>{n.content}</div>
                            </div>
                            <div className={classes.itemActions}>
                                <button
                                    className={classes.deleteBtn}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(n.id);
                                    }}
                                >
                                    삭제
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className={classes.footer}>
                <Link to="/mypage?tab=notifications" className={classes.settingsLink} onClick={onClose}>
                    알림 설정으로 이동
                </Link>
            </div>
        </div>
    );
};

export default NotificationDropdown;
