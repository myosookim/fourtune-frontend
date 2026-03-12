import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { type UserDetail } from '../../services/api.interface';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import classes from './ProfileSettings.module.css';

interface Props {
    userInfo: UserDetail | null;
    onUpdate: () => void;
}

const ProfileSettings: React.FC<Props> = ({ userInfo, onUpdate }) => {
    const { updateUserProfile } = useAuth();
    const { showToast } = useToast();
    const [nickname, setNickname] = useState('');
    const [phone, setPhone] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [withdrawPassword, setWithdrawPassword] = useState('');
    const [withdrawReason, setWithdrawReason] = useState('');

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    useEffect(() => {
        if (userInfo) {
            setNickname(userInfo.nickname);
            setPhone(userInfo.phoneNumber || '');
        }
    }, [userInfo]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.updateProfile(nickname, phone);
            updateUserProfile(nickname);
            showToast('프로필이 수정되었습니다.');
            setIsEditingProfile(false);
            onUpdate();
        } catch (e: any) {
            showToast(e.response?.data?.message || '프로필 수정 실패', 'error');
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.changePassword(currentPassword, newPassword);
            showToast('비밀번호가 변경되었습니다.');
            setIsChangingPassword(false);
            setCurrentPassword('');
            setNewPassword('');
        } catch (e: any) {
            showToast(e.response?.data?.message || '비밀번호 변경에 실패했습니다.', 'error');
        }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        if (window.confirm('정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 데이터가 삭제됩니다.')) {
            try {
                await api.withdraw(withdrawPassword, withdrawReason);
                showToast('회원 탈퇴가 완료되었습니다.');
                window.location.href = '/';
            } catch (e: any) {
                showToast(e.response?.data?.message || '탈퇴 실패', 'error');
            }
        }
    };

    return (
        <div className={classes.settingsContainer}>
            {/* 1. 프로필 수정 섹션 */}
            <div className={classes.section}>
                <div className={classes.sectionHeader}>
                    <h3 className={classes.sectionTitle}>프로필 정보</h3>
                    {!isEditingProfile && (
                        <button type="button" className={classes.btnOutline} onClick={() => setIsEditingProfile(true)}>
                            수정하기
                        </button>
                    )}
                </div>

                <form onSubmit={handleProfileUpdate}>
                    <div className={classes.formGroup}>
                        <label className={classes.label}>이메일</label>
                        <input type="email" className={classes.input} value={userInfo?.email || ''} disabled />
                    </div>
                    <div className={classes.formGroup}>
                        <label className={classes.label}>닉네임</label>
                        <input
                            type="text"
                            className={classes.input}
                            value={nickname}
                            onChange={e => setNickname(e.target.value)}
                            disabled={!isEditingProfile}
                            required
                        />
                    </div>
                    <div className={classes.formGroup}>
                        <label className={classes.label}>전화번호</label>
                        <input
                            type="tel"
                            className={classes.input}
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            disabled={!isEditingProfile}
                            pattern="^01(?:0|1|[6-9])-(?:\d{3}|\d{4})-\d{4}$"
                            title="010-1234-5678 형식으로 입력해주세요."
                            required={isEditingProfile}
                        />
                    </div>

                    {isEditingProfile && (
                        <div className={classes.buttonGroup}>
                            <button type="button" className={classes.btnOutline} onClick={() => setIsEditingProfile(false)}>취소</button>
                            <button type="submit" className={classes.btnPrimary}>저장</button>
                        </div>
                    )}
                </form>
            </div>

            {/* 2. 비밀번호 변경 섹션 */}
            <div className={classes.section}>
                <div className={classes.sectionHeader}>
                    <h3 className={classes.sectionTitle}>비밀번호 변경</h3>
                    {!isChangingPassword && (
                        <button type="button" className={classes.btnOutline} onClick={() => setIsChangingPassword(true)}>
                            변경하기
                        </button>
                    )}
                </div>

                {isChangingPassword && (
                    <form onSubmit={handlePasswordChange}>
                        <div className={classes.formGroup}>
                            <label className={classes.label}>현재 비밀번호</label>
                            <input
                                type="password"
                                className={classes.input}
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                placeholder="현재 비밀번호를 입력해주세요"
                                required
                            />
                        </div>
                        <div className={classes.formGroup}>
                            <label className={classes.label}>새 비밀번호</label>
                            <input
                                type="password"
                                className={classes.input}
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                placeholder="새로운 비밀번호를 입력해주세요"
                                pattern="^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$"
                                title="비밀번호는 8~20자, 영문, 숫자, 특수문자를 포함해야 합니다."
                                required
                            />
                        </div>
                        <div className={classes.buttonGroup}>
                            <button type="button" className={classes.btnOutline} onClick={() => setIsChangingPassword(false)}>취소</button>
                            <button type="submit" className={classes.btnPrimary}>변경</button>
                        </div>
                    </form>
                )}
            </div>

            {/* 3. 회원 탈퇴 섹션 */}
            <div className={`${classes.section} ${classes.dangerZone}`}>
                <div className={classes.sectionHeader}>
                    <h3 className={classes.sectionTitle}>회원 탈퇴</h3>
                </div>

                {!isWithdrawing ? (
                    <div>
                        <p style={{ color: '#555', fontSize: '14px', marginBottom: '16px' }}>
                            탈퇴 시 모든 정보가 삭제되며, 복구할 수 없습니다. 신중하게 결정해 주세요.
                        </p>
                        <button type="button" className={classes.btnDanger} onClick={() => setIsWithdrawing(true)}>
                            회원 탈퇴 진행
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleWithdraw}>
                        <div className={classes.formGroup}>
                            <label className={classes.label}>현재 비밀번호</label>
                            <input
                                type="password"
                                className={classes.input}
                                value={withdrawPassword}
                                onChange={e => setWithdrawPassword(e.target.value)}
                                placeholder="본인 확인을 위해 비밀번호를 입력해주세요"
                                required
                            />
                        </div>
                        <div className={classes.formGroup}>
                            <label className={classes.label}>탈퇴 사유 (선택)</label>
                            <input
                                type="text"
                                className={classes.input}
                                value={withdrawReason}
                                onChange={e => setWithdrawReason(e.target.value)}
                                placeholder="탈퇴 사유를 입력해주세요"
                            />
                        </div>
                        <div className={classes.buttonGroup}>
                            <button type="button" className={classes.btnOutline} onClick={() => setIsWithdrawing(false)}>취소</button>
                            <button type="submit" className={classes.btnDanger}>탈퇴 확인</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ProfileSettings;
