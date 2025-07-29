import React from 'react';
import * as z from 'zod';
import { useForm, Form, FormItem, FormControl } from './Form';
import { useAddComment } from '../helpers/useMutationHooks';
import { Textarea } from './Textarea';
import { Button } from './Button';
import { Send } from 'lucide-react';
import styles from './AddCommentForm.module.css';

interface AddCommentFormProps {
  postId: number;
  className?: string;
}

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty.').max(500, 'Comment is too long.'),
});

// Mock current user for demonstration purposes
const MOCK_CURRENT_USER = { id: 'user-123', name: 'Demo User', avatar: 'https://github.com/shadcn.png' };

export const AddCommentForm = ({ postId, className }: AddCommentFormProps) => {
  const addCommentMutation = useAddComment();
  const form = useForm({
    schema: commentSchema,
    defaultValues: {
      content: '',
    },
  });

  const onSubmit = (values: z.infer<typeof commentSchema>) => {
    addCommentMutation.mutate(
      {
        postId,
        content: values.content,
        authorId: MOCK_CURRENT_USER.id,
        authorName: MOCK_CURRENT_USER.name,
        authorAvatar: MOCK_CURRENT_USER.avatar,
      },
      {
        onSuccess: () => {
          form.setValues({ content: '' });
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`${styles.form} ${className || ''}`}
      >
        <FormItem name="content" className={styles.formItem}>
          <FormControl>
            <div className={styles.inputContainer}>
              <Textarea
                placeholder="Add a comment..."
                value={form.values.content}
                onChange={(e) => form.setValues({ content: e.target.value })}
                className={styles.textarea}
                rows={1}
                disableResize
              />
              <Button
                type="submit"
                size="icon-md"
                className={styles.submitButton}
                disabled={addCommentMutation.isPending || !form.values.content}
              >
                <Send size={16} />
              </Button>
            </div>
          </FormControl>
          {/* FormMessage could be added here if needed */}
        </FormItem>
      </form>
    </Form>
  );
};