import React from 'react';
import { Skeleton } from './Skeleton';
import styles from './StoreCardSkeleton.module.css';

export const StoreCardSkeleton = () => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Skeleton className={styles.avatar} />
        <div className={styles.headerText}>
          <Skeleton className={styles.name} />
          <Skeleton className={styles.rating} />
        </div>
      </div>
      <div className={styles.badges}>
        <Skeleton className={styles.badge} />
        <Skeleton className={styles.badge} />
      </div>
      <Skeleton className={styles.descriptionLine1} />
      <Skeleton className={styles.descriptionLine2} />
      <div className={styles.details}>
        <Skeleton className={styles.detailItem} />
        <Skeleton className={styles.detailItem} />
      </div>
      <Skeleton className={styles.button} />
    </div>
  );
};