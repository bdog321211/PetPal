import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Plus } from 'lucide-react';
import { usePetPosts } from '../helpers/useQueryHooks';
import { PetPostCard } from '../components/PetPostCard';
import { PetPostCardSkeleton } from '../components/PetPostCardSkeleton';
import { CreatePostDialog } from '../components/CreatePostDialog';
import { Button } from '../components/Button';
import styles from './social.module.css';

const SocialPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { data: posts, isFetching, error } = usePetPosts({ limit: 10, offset: 0 });

  const renderContent = () => {
    if (isFetching) {
      return (
        <div className={styles.feed}>
          {Array.from({ length: 3 }).map((_, index) => (
            <PetPostCardSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.errorState}>
          <h2>Oops! Something went wrong.</h2>
          <p>We couldn't load the pet posts. Please try again later.</p>
          <pre>{error instanceof Error ? error.message : 'An unknown error occurred'}</pre>
        </div>
      );
    }

    if (!posts || posts.length === 0) {
      return (
        <div className={styles.emptyState}>
          <h2>No posts yet!</h2>
          <p>It's a bit quiet here. Be the first to share a pet picture!</p>
        </div>
      );
    }

    return (
      <div className={styles.feed}>
        {posts.map((post) => (
          <PetPostCard key={post.id} post={post} />
        ))}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Social Feed | PetPal</title>
        <meta name="description" content="See what the pets of PetPal are up to! Like and comment on cute pet pictures." />
      </Helmet>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerText}>
              <h1>Social Feed</h1>
              <p>Discover the cutest pets in our community.</p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} className={styles.createButton}>
              <Plus size={20} />
              Create Post
            </Button>
          </div>
        </header>
        {renderContent()}
        <CreatePostDialog 
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      </div>
    </>
  );
};

export default SocialPage;