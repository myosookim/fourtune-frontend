import React from 'react';
import classes from './AuctionCard.module.css';
import skeletonClasses from './Skeleton.module.css';

export const AuctionCardSkeleton: React.FC = () => {
    return (
        <div className={`${classes.card} ${skeletonClasses.skeleton}`}>
            <div className={classes.imageContainer}>
                <div className={skeletonClasses.skeletonImage} />
            </div>
            <div className={classes.content}>
                <div className={`${skeletonClasses.skeletonLine} ${skeletonClasses.skeletonCategory}`} />
                <div className={`${skeletonClasses.skeletonLine} ${skeletonClasses.skeletonTitle}`} />
                <div className={`${skeletonClasses.skeletonLine} ${skeletonClasses.skeletonTitleShort}`} />
                <div className={classes.priceSection}>
                    <div className={`${skeletonClasses.skeletonLine} ${skeletonClasses.skeletonLabel}`} />
                    <div className={`${skeletonClasses.skeletonLine} ${skeletonClasses.skeletonPrice}`} />
                </div>
            </div>
            <div className={classes.footer}>
                <div className={skeletonClasses.skeletonStats} />
            </div>
        </div>
    );
};
