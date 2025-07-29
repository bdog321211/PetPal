import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useUserProfile } from '../helpers/useUserProfileQuery';
import { ProfileHeader, ProfileHeaderSkeleton } from '../components/ProfileHeader';
import { PetCard } from '../components/PetCard';
import { PetPostCard } from '../components/PetPostCard';
import { Button } from '../components/Button';
import { Skeleton } from '../components/Skeleton';
import { Separator } from '../components/Separator';
import { AlertTriangle, Home } from 'lucide-react';
import styles from './users.$userId.module.css';

const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();

  if (!userId) {
    return (
      <div className={styles.errorContainer}>
        <AlertTriangle size={48} className={styles.errorIcon} />
        <h1 className={styles.errorTitle}>User Not Found</h1>
        <p className={styles.errorMessage}>
          No user ID was provided. Please check the URL and try again.
        </p>
        <Button asChild>
          <Link to="/">
            <Home size={16} /> Go to Homepage
          </Link>
        </Button>
      </div>
    );
  }

  const { data, isFetching, error } = useUserProfile(userId);

  const renderContent = () => {
    if (isFetching) {
      return (
        <>
          <ProfileHeaderSkeleton />
          <Separator className={styles.separator} />
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Pets</h2>
            <div className={styles.grid}>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className={styles.cardSkeleton} />
              ))}
            </div>
          </div>
          <Separator className={styles.separator} />
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Posts</h2>
            <div className={styles.postsGrid}>
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className={styles.postSkeleton} />
              ))}
            </div>
          </div>
        </>
      );
    }

    if (error) {
      return (
        <div className={styles.errorContainer}>
          <AlertTriangle size={48} className={styles.errorIcon} />
          <h1 className={styles.errorTitle}>Could not load profile</h1>
          <p className={styles.errorMessage}>
            {error instanceof Error ? error.message : 'An unknown error occurred.'}
          </p>
          <Button asChild>
            <Link to="/">
              <Home size={16} /> Go to Homepage
            </Link>
          </Button>
        </div>
      );
    }

    if (!data) {
      return null;
    }

    return (
      <>
        <Helmet>
          <title>{`${data.user.displayName}'s Profile | PetPal`}</title>
          <meta name="description" content={`View the profile of ${data.user.displayName}, their pets, and their posts on PetPal.`} />
        </Helmet>
        <ProfileHeader user={data.user} postCount={data.posts.length} />
        <Separator className={styles.separator} />
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Pets ({data.pets.length})</h2>
          {data.pets.length > 0 ? (
            <div className={styles.grid}>
              {data.pets.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </div>
          ) : (
            <p className={styles.emptyMessage}>{data.user.displayName} hasn't added any pets yet.</p>
          )}
        </div>
        <Separator className={styles.separator} />
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Posts ({data.posts.length})</h2>
          {data.posts.length > 0 ? (
            <div className={styles.postsGrid}>
              {data.posts.map((post) => (
                <PetPostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className={styles.emptyMessage}>{data.user.displayName} hasn't made any posts yet.</p>
          )}
        </div>
      </>
    );
  };

  return <div className={styles.container}>{renderContent()}</div>;
};

export default UserProfilePage;