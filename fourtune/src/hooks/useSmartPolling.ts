import { useEffect, useRef } from 'react';

/**
 * 콜백을 주어진 간격(ms)으로 실행
 * 브라우저 탭이 숨겨지면 자동으로 일시 중지되고, 다시 보이면 재개됨
 * 폴링을 비활성화하려면 interval을 null로 전달
 */
export function useSmartPolling(callback: () => void, intervalMs: number | null) {
    const savedCallback = useRef(callback);

    // 항상 최신 버전의 콜백을 유지
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (intervalMs === null) return;

        const tick = () => {
            // 탭이 백그라운드일 때 폴링을 건너뜀
            if (document.visibilityState === 'visible') {
                savedCallback.current();
            }
        };

        const id = setInterval(tick, intervalMs);
        return () => clearInterval(id);
    }, [intervalMs]);
}
