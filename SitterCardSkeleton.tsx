import React from 'react';
import { Skeleton } from './Skeleton';
import styles from './SitterCardSkeleton.module.css';

export const SitterCardSkeleton = () => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Skeleton className={styles.avatar} />
        <div className={styles.headerInfo}>
          <Skeleton style={{ width: '120px', height: '1.25rem' }} />
          <Skeleton style={{ width: '80px', height: '1rem' }} />
        </div>
        <Skeleton style={{ width: '60px', height: '1.25rem' }} />
      </div>
      <div className={styles.content}>
        <Skeleton style={{ width: '100%', height: '1rem' }} />
        <Skeleton style={{ width: '90%', height: '1rem' }} />
        <Skeleton style={{ width: '70%', height: '1rem' }} />
      </div>
      <div className={styles.footer}>
        <Skeleton style={{ width: '50px', height: '1rem' }} />
        <Skeleton style={{ width: '50px', height: '1rem' }} />
      </div>
    </div>
  );
};