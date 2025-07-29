import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { postImagesUpload } from '../endpoints/images/upload_POST.schema';
import { postPostsCreate, InputType as CreatePostInput } from '../endpoints/posts/create_POST.schema';
import { postPostsDelete, InputType as DeletePostInput } from '../endpoints/posts/delete_POST.schema';

export const useUploadImage = () => {
  return useMutation({
    mutationFn: (formData: FormData) => postImagesUpload(formData),
    onError: (error) => {
      toast.error(`Image upload failed: ${error.message}`);
    },
  });
};

export const useCreatePost = () => {
  return useMutation({
    mutationFn: (newPost: CreatePostInput) => postPostsCreate(newPost),
    onError: (error) => {
      toast.error(`Failed to create post: ${error.message}`);
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (deleteData: DeletePostInput) => postPostsDelete(deleteData),
    onSuccess: () => {
      toast.success('Post deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['pet-posts'] });
    },
    onError: (error) => {
      toast.error(`Failed to delete post: ${error.message}`);
    },
  });
};