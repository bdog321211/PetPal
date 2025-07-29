import React from 'react';
import { useComments } from '../helpers/useQueryHooks';
import { AddCommentForm } from './AddCommentForm';
import { Avatar, AvatarFallback, AvatarImage } from './Avatar';
import { Skeleton } from './Skeleton';
import { Separator } from './Separator';
import { Link } from 'react-router-dom';
import styles from './CommentSection.module.css';

interface CommentSectionProps {
  postId: number;
  className?: string;
}

export const CommentSection = ({ postId, className }: CommentSectionProps) => {
  const { data: comments, isFetching, error } = useComments({ postId });

  const renderComments = () => {
    if (isFetching) {
      return (
        <>
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className={styles.commentSkeleton}>
              <Skeleton style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-full)' }} />
              <div className={styles.commentContentSkeleton}>
                <Skeleton style={{ width: '100px', height: '1rem' }} />
                <Skeleton style={{ width: '150px', height: '1rem' }} />
              </div>
            </div>
          ))}
        </>
      );
    }

    if (error) {
      return <p className={styles.error}>Could not load comments.</p>;
    }

    if (!comments || comments.length === 0) {
      return <p className={styles.noComments}>No comments yet. Be the first to comment!</p>;
    }

    return comments.map((comment) => {
      const CommentAuthorLink = ({ children }: { children: React.ReactNode }) => 
        comment.authorId ? <Link to={`/users/${comment.authorId}`} className={styles.commentAuthorLink}>{children}</Link> : <>{children}</>;

      return (
        <div key={comment.id} className={styles.comment}>
          <CommentAuthorLink>
            <Avatar className={styles.commentAvatar}>
              <AvatarImage src={comment.authorAvatar || undefined} alt={comment.authorName} />
              <AvatarFallback>{comment.authorName.substring(0, 2)}</AvatarFallback>
            </Avatar>
          </CommentAuthorLink>
          <div className={styles.commentBody}>
            <CommentAuthorLink>
              <span className={styles.commentAuthor}>{comment.authorName}</span>
            </CommentAuthorLink>
            <p className={styles.commentContent}>{comment.content}</p>
          </div>
        </div>
      );
    });
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.commentsList}>{renderComments()}</div>
      <Separator className={styles.separator} />
      <AddCommentForm postId={postId} />
    </div>
  );
};