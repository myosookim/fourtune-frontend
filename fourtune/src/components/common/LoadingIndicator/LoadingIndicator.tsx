import React from 'react';
import classes from './LoadingIndicator.module.css';

interface LoadingIndicatorProps {
    message?: string;
    fullPage?: boolean;
    inline?: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
    message = '불러오는 중...',
    fullPage = false,
    inline = false
}) => {
    let containerClass = classes.container;
    if (fullPage) containerClass = classes.fullPage;
    if (inline) containerClass = classes.inline;

    return (
        <div className={containerClass}>
            <div className={classes.spinner} />
            {message && <p className={classes.message}>{message}</p>}
        </div>
    );
};
