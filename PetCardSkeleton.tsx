import React from 'react';
import { Skeleton } from './Skeleton';
import styles from './PetCard.module.css';

export const PetCardSkeleton = () => {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <Skeleton style={{ width: '100%', height: '100%' }} />
      </div>
      
      <div className={styles.content}>
        <div className={styles.header}>
          <Skeleton style={{ width: '120px', height: '1.5rem' }} />
          <Skeleton style={{ width: '60px', height: '1.25rem' }} />
        </div>
        
        <Skeleton style={{ width: '100px', height: '1rem', marginBottom: 'var(--spacing-3)' }} />
        
        <div className={styles.details}>
          <div className={styles.detail}>
            <Skeleton style={{ width: '14px', height: '14px' }} />
            <Skeleton style={{ width: '80px', height: '1rem' }} />
          </div>
          <div className={styles.detail}>
            <Skeleton style={{ width: '14px', height: '14px' }} />
            <Skeleton style={{ width: '60px', height: '1rem' }} />
          </div>
        </div>
        
        <div style={{ paddingTop: 'var(--spacing-2)', borderTop: '1px solid var(--border)' }}>
          <Skeleton style={{ width: '100%', height: '3rem' }} />
        </div>
      </div>
    </div>
  );
};