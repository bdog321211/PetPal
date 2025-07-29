import React, { useState } from 'react';
import { z } from 'zod';
import { useForm, Form, FormItem, FormLabel, FormControl, FormMessage } from './Form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './Dialog';
import { Textarea } from './Textarea';
import { Button } from './Button';
import { useSendMessage } from '../helpers/useMessageHooks';
import { toast } from 'sonner';
import styles from './MessageDialog.module.css';

interface MessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientId: number;
  recipientName: string;
}

const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty.').max(2000, 'Message is too long.'),
});

export const MessageDialog = ({ open, onOpenChange, recipientId, recipientName }: MessageDialogProps) => {
  const form = useForm({
    schema: messageSchema,
    defaultValues: {
      content: '',
    },
  });

  const sendMessageMutation = useSendMessage();

  const onSubmit = (values: z.infer<typeof messageSchema>) => {
    sendMessageMutation.mutate(
      {
        recipientId,
        content: values.content,
      },
      {
        onSuccess: () => {
          toast.success(`Message sent to ${recipientName}!`);
          onOpenChange(false);
          form.setValues({ content: '' });
        },
        onError: (error) => {
          toast.error(`Failed to send message: ${error.message}`);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle>Message {recipientName}</DialogTitle>
          <DialogDescription>
            Your message will start a new conversation if one doesn't already exist.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
            <FormItem name="content">
              <FormLabel className={styles.srOnly}>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={`Write your message to ${recipientName}...`}
                  value={form.values.content}
                  onChange={(e) => form.setValues({ content: e.target.value })}
                  rows={6}
                  className={styles.textarea}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
            <DialogFooter className={styles.footer}>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={sendMessageMutation.isPending}>
                {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};