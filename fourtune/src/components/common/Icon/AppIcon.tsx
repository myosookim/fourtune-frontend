import React from 'react';
import classes from './AppIcon.module.css';
import heartIcon from '../../../assets/icons/heart.png';
import bellIcon from '../../../assets/icons/bell.png';
import eyeIcon from '../../../assets/icons/eye.png';
import cartIcon from '../../../assets/icons/cart.png';
import bidIcon from '../../../assets/icons/bid-cursor.png';
import menuIcon from '../../../assets/icons/menu.png';

/**
 * 아이콘 카테고리 정의
 */
export type IconCategory = 'action' | 'status' | 'ui';

/**
 * 아이콘 이름 정의
 */
export type IconName =
    | 'heart' | 'heart-filled'  // 찜하기
    | 'eye'                   // 조회수
    | 'bell' | 'bell-active'    // 알림
    | 'cart'                  // 장바구니
    | 'bid-cursor'            // 입찰 커서
    | 'hammer'                 // 입찰(망치)
    | 'search'                 // 검색
    | 'user'                   // 프로필
    | 'clock'                  // 시간
    | 'menu';                  // 메뉴

interface AppIconProps {
    name: IconName;
    category?: IconCategory;
    size?: number | string;
    className?: string;
    onClick?: (e: React.MouseEvent) => void;
    color?: string;
    title?: string;
}

/**
 * 앱 전역 아이콘 컴포넌트
 * 이모티콘 기반 UI를 추후 PNG/SVG 자산으로 손쉽게 교체하기 위한 래퍼입니다.
 */
export const AppIcon: React.FC<AppIconProps> = ({
    name,
    // category = 'ui',
    size = 20,
    className = '',
    onClick,
    color,
    title
}) => {
    /**
     * 이미지 기반 아이콘 소스 매핑
     */
    const getIconSource = (iconName: IconName): string | null => {
        switch (iconName) {
            case 'heart':
            case 'heart-filled': return heartIcon;
            case 'eye': return eyeIcon;
            case 'bell':
            case 'bell-active': return bellIcon;
            case 'cart': return cartIcon;
            case 'bid-cursor': return bidIcon;
            case 'menu': return menuIcon;
            default: return null;
        }
    };

    const getPlaceholderEmoji = (iconName: IconName): string => {
        switch (iconName) {
            case 'heart': return '🤍';
            case 'heart-filled': return '❤️';
            case 'eye': return '👁️';
            case 'bell': return '🔔';
            case 'bell-active': return '🔕';
            case 'cart': return '🛒';
            case 'bid-cursor': return '🖱️';
            case 'hammer': return '🔨';
            case 'search': return '🔍';
            case 'user': return '👤';
            case 'clock': return '⏰';
            default: return '❓';
        }
    };

    const iconSrc = getIconSource(name);

    const style: React.CSSProperties = {
        fontSize: size,
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none'
    };

    return (
        <span
            className={`${classes.iconWrapper} ${className}`}
            style={style}
            onClick={onClick}
            role="img"
            aria-label={name}
            data-tooltip={title}
        >
            {iconSrc ? (
                <img
                    src={iconSrc}
                    alt={name}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        filter: color ? `drop-shadow(0 0 0 ${color})` : undefined // 단순 색상 적용은 이미지에선 제한적임
                    }}
                />
            ) : (
                getPlaceholderEmoji(name)
            )}
        </span>
    );
};
