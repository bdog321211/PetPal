import React, { useRef, useEffect } from 'react';
import { useConversationMessages, useSendMessage } from '../helpers/useMessageHooks';
import { useAuth } from '../helpers/useAuth';
import { z } from 'zod';
import { useForm, Form, FormControl } from './Form';
import { Textarea } from './Textarea';
import { Button } from './Button';
import { Send } from 'lucide-react';
import { Skeleton } from './Skeleton';
import { Avatar, AvatarImage, AvatarFallback } from './Avatar';
import styles from './ConversationView.module.css';

interface ConversationViewProps {
  conversationId: number;
}

const messageSchema = z.object({
  content: z.string().min(1).max(2000),
});

export const ConversationView = ({ conversationId }: ConversationViewProps) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = useConversationMessages(conversationId);
  const { authState } = useAuth();
  const sendMessageMutation = useSendMessage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const form = useForm({
    schema: messageSchema,
    defaultValues: { content: '' },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data]);

  const onSubmit = (values: z.infer<typeof messageSchema>) => {
    if (authState.type !== 'authenticated') return;
    
    // Find a message where we are either sender or recipient to determine the other participant
    const someMessage = data?.pages[0]?.messages[0];
    if (!someMessage) return;
    
    const recipientId = someMessage.senderId === authState.user.id 
      ? someMessage.recipientId 
      : someMessage.senderId;

    if (!recipientId) return;

    sendMessageMutation.mutate(
      { recipientId, content: values.content },
      {
        onSuccess: () => {
          form.setValues({ content: '' });
        },
      }
    );
  };

  if (isLoading || authState.type !== 'authenticated') {
    return <div className={styles.loading}>Loading messages...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error.message}</div>;
  }

  const allMessages = data?.pages.flatMap(page => page.messages) ?? [];

  return (
    <div className={styles.container}>
      <div ref={messagesContainerRef} className={styles.messagesList}>
        {isFetchingNextPage && <div className={styles.loadingMore}>Loading more...</div>}
        {hasNextPage && (
          <Button variant="link" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            Load older messages
          </Button>
        )}
        {allMessages.map((msg) => {
          const isSender = msg.senderId === authState.user.id;
          return (
            <div key={msg.id} className={`${styles.messageRow} ${isSender ? styles.sent : styles.received}`}>
              <div className={styles.messageBubble}>
                <p className={styles.messageContent}>{msg.content}</p>
                <span className={styles.messageTimestamp}>
                  {msg.createdAt 
                    ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'No timestamp'
                  }
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className={styles.inputArea}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
            <FormControl>
              <Textarea
                placeholder="Type a message..."
                value={form.values.content}
                onChange={(e) => form.setValues({ content: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    form.handleSubmit(onSubmit)(e);
                  }
                }}
                rows={1}
                className={styles.textarea}
              />
            </FormControl>
            <Button type="submit" size="icon-md" disabled={sendMessageMutation.isPending}>
              <Send size={18} />
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};