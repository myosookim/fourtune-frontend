import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { type NotificationSettingsResponse } from '../../services/api.interface';
import classes from './NotificationSettings.module.css';

const NotificationSettings: React.FC = () => {
    const [settings, setSettings] = useState<NotificationSettingsResponse>({
        isBidPushEnabled: true,
        isPaymentPushEnabled: true,
        isWatchListPushEnabled: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await api.getNotificationSettings();
                setSettings(data);
            } catch (err) {
                console.error("Failed to load notification settings", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleToggle = (key: keyof NotificationSettingsResponse) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.updateNotificationSettings(settings);
            alert('알림 설정이 저장되었습니다.');
        } catch (err) {
            console.error("Failed to update notification settings", err);
            alert('설정 저장 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>로딩 중...</div>;
    }

    return (
        <div className={classes.settingsContainer}>
            <div className={classes.section}>
                <div className={classes.sectionHeader}>
                    <div>
                        <h3 className={classes.sectionTitle}>푸시 알림 설정</h3>
                        <p className={classes.sectionDescription}>수신하고 싶은 알림의 종류를 설정할 수 있습니다.</p>
                    </div>
                </div>

                <div className={classes.settingItem}>
                    <div className={classes.settingInfo}>
                        <span className={classes.settingLabel}>입찰 및 낙찰 알림</span>
                        <span className={classes.settingDesc}>참여 중인 경매의 상위 입찰 발생 및 낙찰 여부 알림</span>
                    </div>
                    <label className={classes.switch}>
                        <input
                            type="checkbox"
                            checked={settings.isBidPushEnabled}
                            onChange={() => handleToggle('isBidPushEnabled')}
                        />
                        <span className={classes.slider}></span>
                    </label>
                </div>

                <div className={classes.settingItem}>
                    <div className={classes.settingInfo}>
                        <span className={classes.settingLabel}>결제 및 환불 알림</span>
                        <span className={classes.settingDesc}>포춘 페이 충전/출금 및 주문 결제 관련 알림</span>
                    </div>
                    <label className={classes.switch}>
                        <input
                            type="checkbox"
                            checked={settings.isPaymentPushEnabled}
                            onChange={() => handleToggle('isPaymentPushEnabled')}
                        />
                        <span className={classes.slider}></span>
                    </label>
                </div>

                <div className={classes.settingItem}>
                    <div className={classes.settingInfo}>
                        <span className={classes.settingLabel}>관심 상품 알림</span>
                        <span className={classes.settingDesc}>관심 상품으로 등록한 경매의 마감 임박 알림</span>
                    </div>
                    <label className={classes.switch}>
                        <input
                            type="checkbox"
                            checked={settings.isWatchListPushEnabled}
                            onChange={() => handleToggle('isWatchListPushEnabled')}
                        />
                        <span className={classes.slider}></span>
                    </label>
                </div>

                <button
                    className={classes.btnPrimary}
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? '저장 중...' : '설정 저장'}
                </button>
            </div>
        </div>
    );
};

export default NotificationSettings;
