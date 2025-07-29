import React from 'react';
import { Skeleton } from './Skeleton';
import styles from './TrainerCardSkeleton.module.css';

export const TrainerCardSkeleton = () => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Skeleton className={styles.avatar} />
        <div className={styles.headerText}>
          <Skeleton className={styles.name} />
          <Skeleton className={styles.rating} />
        </div>
        <div className={styles.priceContainer}>
          <Skeleton className={styles.price} />
        </div>
      </div>
      <div className={styles.badges}>
        <Skeleton className={styles.badge} />
        <Skeleton className={styles.badge} />
      </div>
      <Skeleton className={styles.bioLine1} />
      <Skeleton className={styles.bioLine2} />
      <div className={styles.details}>
        <Skeleton className={styles.detailItem} />
      </div>
    </div>
  );
};