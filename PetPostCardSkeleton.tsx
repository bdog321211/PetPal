import { Skeleton } from './Skeleton';
import styles from './PetPostCardSkeleton.module.css';

export const PetPostCardSkeleton = () => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Skeleton style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)' }} />
        <div className={styles.headerInfo}>
          <Skeleton style={{ width: '120px', height: '1rem' }} />
          <Skeleton style={{ width: '80px', height: '0.8rem' }} />
        </div>
      </div>
      <Skeleton className={styles.imageSkeleton} />
      <div className={styles.content}>
        <div className={styles.actions}>
          <Skeleton style={{ width: '80px', height: '1.5rem' }} />
          <Skeleton style={{ width: '80px', height: '1.5rem' }} />
        </div>
        <Skeleton style={{ width: '90%', height: '1rem' }} />
        <Skeleton style={{ width: '70%', height: '1rem' }} />
      </div>
    </div>
  );
};