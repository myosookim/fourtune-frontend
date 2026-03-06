import { useState, useEffect } from 'react';

/**
 * 로딩 상태가 너무 짧을 때 화면이 깜빡이는 것을 방지하기 위해 
 * 일정 시간(delay) 이후에만 로딩 상태를 true로 반환하는 훅입니다.
 */
export const useLoadingDelay = (isLoading: boolean, delay: number = 300) => {
    const [shouldShow, setShouldShow] = useState(false);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;

        if (isLoading) {
            timer = setTimeout(() => {
                setShouldShow(true);
            }, delay);
        } else {
            setShouldShow(false);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isLoading, delay]);

    return shouldShow;
};
