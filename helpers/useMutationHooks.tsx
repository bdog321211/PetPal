import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postComment, InputType as CommentInput } from '../endpoints/comments_POST.schema';
import { postLikesToggle, InputType as LikeToggleInput } from '../endpoints/likes/toggle_POST.schema';
import { toast } from 'sonner';

export const useAddComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newComment: CommentInput) => postComment(newComment),
    onSuccess: (data) => {
      toast.success('Comment added!');
      // Invalidate comments for the specific post to refetch
      queryClient.invalidateQueries({ queryKey: ['comments', { postId: data.postId }] });
      // Optionally, update the post data in cache if you have a query for single posts
      queryClient.invalidateQueries({ queryKey: ['pet-posts'] });
    },
    onError: (error) => {
      toast.error(`Failed to add comment: ${error.message}`);
    },
  });
};

export const useToggleLike = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (likeData: LikeToggleInput) => postLikesToggle(likeData),
    onSuccess: (data, variables) => {
      toast.success(data.liked ? 'Post liked!' : 'Post unliked!');
      // Invalidate likes and pet posts to reflect the change
      queryClient.invalidateQueries({ queryKey: ['likes', { postId: variables.postId }] });
      queryClient.invalidateQueries({ queryKey: ['pet-posts'] });
    },
    onError: (error) => {
      toast.error(`Failed to update like: ${error.message}`);
    },
  });
};