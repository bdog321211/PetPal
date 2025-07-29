import React, { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Image as ImageIcon, Loader2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './Dialog';
import { Button } from './Button';
import { Textarea } from './Textarea';
import { FileDropzone } from './FileDropzone';
import { useCreatePost, useUploadImage } from '../helpers/usePostMutations';
import styles from './CreatePostDialog.module.css';

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePostDialog: React.FC<CreatePostDialogProps> = ({ open, onOpenChange }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const queryClient = useQueryClient();

  const uploadImageMutation = useUploadImage();
  const createPostMutation = useCreatePost();

  const isSubmitting = uploadImageMutation.isPending || createPostMutation.isPending;

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const resetForm = useCallback(() => {
    setImageFile(null);
    setPreviewUrl(null);
    setCaption('');
    uploadImageMutation.reset();
    createPostMutation.reset();
  }, [uploadImageMutation, createPostMutation]);

  const handleClose = (isOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(isOpen);
      if (!isOpen) {
        resetForm();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error('Please select an image to upload.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      const { imageUrl } = await uploadImageMutation.mutateAsync(formData);

      await createPostMutation.mutateAsync(
        { imageUrl, caption },
        {
          onSuccess: () => {
            toast.success('Post created successfully!');
            queryClient.invalidateQueries({ queryKey: ['pet-posts'] });
            handleClose(false);
          },
        },
      );
    } catch (error) {
      // Error toasts are handled by the mutation hooks
      console.error('Failed to create post:', error);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle>Create a new post</DialogTitle>
          <DialogDescription>Share a photo of your pet with the community.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.uploadArea}>
            {!previewUrl ? (
              <FileDropzone
                onFilesSelected={handleFilesSelected}
                accept="image/jpeg,image/png,image/webp"
                maxSize={5 * 1024 * 1024} // 5MB
                title="Drag & drop a photo here, or click to select"
                subtitle="PNG, JPG, WEBP up to 5MB"
                icon={<ImageIcon size={48} />}
              />
            ) : (
              <div className={styles.previewContainer}>
                <img src={previewUrl} alt="Preview" className={styles.previewImage} />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={clearImage}
                  className={styles.clearButton}
                  aria-label="Remove image"
                >
                  <X size={16} />
                </Button>
              </div>
            )}
          </div>

          <div className={styles.captionArea}>
            <Textarea
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              maxLength={2200}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={!imageFile || isSubmitting}>
              {isSubmitting && <Loader2 className={styles.spinner} size={16} />}
              {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};