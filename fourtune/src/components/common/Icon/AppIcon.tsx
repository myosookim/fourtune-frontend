import React from 'react';
import classes from './AppIcon.module.css';

/**
 * 아이콘 카테고리 정의
 */
export type IconCategory = 'action' | 'status' | 'ui';

/**
 * 아이콘 이름 정의 (향후 추가될 아이콘 명칭들)
 */
export type IconName =
    | 'heart' | 'heart-filled'  // 찜하기
    | 'eye'                   // 조회수
    | 'bell' | 'bell-active'    // 알림
    | 'hammer'                 // 입찰
    | 'search'                 // 검색
    | 'user'                   // 프로필
    | 'clock';                 // 시간

interface AppIconProps {
    name: IconName;
    category?: IconCategory;
    size?: number | string;
    className?: string;
    onClick?: (e: React.MouseEvent) => void;
    color?: string;
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
    color
}) => {
    // 1. 추후 PNG 파일로 교체 시 사용할 매핑 로직 (예시)
    // const iconPath = `/src/assets/icons/${category}/${name}.png`;

    // 2. 현재는 과도기 단계로, 이모티콘이나 폰트 아이콘 기반으로 동작하도록 구성
    const getPlaceholderEmoji = (iconName: IconName): string => {
        switch (iconName) {
            case 'heart': return '🤍';
            case 'heart-filled': return '❤️';
            case 'eye': return '👁️';
            case 'bell': return '🔔';
            case 'bell-active': return '🔕';
            case 'hammer': return '🔨';
            case 'search': return '🔍';
            case 'user': return '👤';
            case 'clock': return '⏰';
            default: return '❓';
        }
    };

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
        >
            {/* 
                추후 PNG 적용 시 아래 주석 해제:
                <img src={iconPath} alt={name} style={{ width: '100%', height: '100%' }} />
            */}
            {getPlaceholderEmoji(name)}
        </span>
    );
};
